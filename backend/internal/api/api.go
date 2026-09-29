// Package api is the public JSON API used by the Next.js storefront.
package api

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/mail"
	"strings"

	"github.com/go-chi/chi/v5"

	"github.com/malikahay/makstar/backend/internal/auth"
	"github.com/malikahay/makstar/backend/internal/store"
)

type API struct {
	store *store.Store
	auth  *auth.Auth
}

func Routes(s *store.Store, a *auth.Auth) http.Handler {
	h := &API{store: s, auth: a}
	r := chi.NewRouter()
	r.Use(requireJSON)
	r.Get("/products", h.products)
	r.Get("/products/{slug}", h.product)
	r.Post("/auth/register", h.register)
	r.Post("/auth/login", h.login)
	r.Post("/auth/logout", h.logout)
	r.Get("/auth/me", h.me)
	r.Post("/orders", h.createOrder)
	r.Get("/orders/my", h.myOrders)
	r.NotFound(func(w http.ResponseWriter, _ *http.Request) { writeErr(w, http.StatusNotFound, "Не найдено") })
	return r
}

// requireJSON rejects state-changing requests that aren't JSON. Browsers can't send a
// cross-site JSON POST without a CORS preflight (which we never allow), so this doubles as CSRF protection.
func requireJSON(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead &&
			!strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
			writeErr(w, http.StatusUnsupportedMediaType, "Ожидается JSON")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func internal(w http.ResponseWriter, r *http.Request, err error) {
	slog.Error("api", "path", r.URL.Path, "err", err)
	writeErr(w, http.StatusInternalServerError, "Что-то пошло не так, попробуйте ещё раз")
}

func decode(w http.ResponseWriter, r *http.Request, v any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	if err := json.NewDecoder(r.Body).Decode(v); err != nil {
		writeErr(w, http.StatusBadRequest, "Неверный формат запроса")
		return false
	}
	return true
}

func (h *API) products(w http.ResponseWriter, r *http.Request) {
	ps, err := h.store.ActiveProducts(r.Context())
	if err != nil {
		internal(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, ps)
}

func (h *API) product(w http.ResponseWriter, r *http.Request) {
	p, err := h.store.ActiveProductBySlug(r.Context(), chi.URLParam(r, "slug"))
	if errors.Is(err, store.ErrNotFound) {
		writeErr(w, http.StatusNotFound, "Товар не найден")
		return
	} else if err != nil {
		internal(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, p)
}

var dummyHash, _ = auth.HashPassword("makstar-timing-dummy")

type credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Phone    string `json:"phone"`
}

func (h *API) register(w http.ResponseWriter, r *http.Request) {
	var in credentials
	if !decode(w, r, &in) {
		return
	}
	in.Email, in.Name, in.Phone = strings.TrimSpace(in.Email), strings.TrimSpace(in.Name), strings.TrimSpace(in.Phone)
	if _, err := mail.ParseAddress(in.Email); err != nil || strings.ContainsAny(in.Email, " <>") {
		writeErr(w, http.StatusBadRequest, "Неверный email")
		return
	}
	if len([]rune(in.Name)) < 2 {
		writeErr(w, http.StatusBadRequest, "Укажите имя")
		return
	}
	// bcrypt only uses the first 72 bytes
	if len(in.Password) < 8 || len(in.Password) > 72 {
		writeErr(w, http.StatusBadRequest, "Пароль должен быть от 8 до 72 символов")
		return
	}
	hash, err := auth.HashPassword(in.Password)
	if err != nil {
		internal(w, r, err)
		return
	}
	u := &store.User{Email: in.Email, Name: in.Name, Phone: in.Phone, PasswordHash: hash, Role: store.RoleUser}
	if err := h.store.CreateUser(r.Context(), u); errors.Is(err, store.ErrEmailTaken) {
		writeErr(w, http.StatusConflict, "Этот email уже зарегистрирован")
		return
	} else if err != nil {
		internal(w, r, err)
		return
	}
	if err := h.auth.SetSession(w, u); err != nil {
		internal(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, u)
}

func (h *API) login(w http.ResponseWriter, r *http.Request) {
	var in credentials
	if !decode(w, r, &in) {
		return
	}
	u, err := h.store.UserByEmail(r.Context(), strings.TrimSpace(in.Email))
	if err != nil && !errors.Is(err, store.ErrNotFound) {
		internal(w, r, err)
		return
	}
	if u == nil {
		auth.CheckPassword(dummyHash, in.Password) // equalize timing so emails can't be probed
		writeErr(w, http.StatusUnauthorized, "Неверный email или пароль")
		return
	}
	if !auth.CheckPassword(u.PasswordHash, in.Password) {
		writeErr(w, http.StatusUnauthorized, "Неверный email или пароль")
		return
	}
	if err := h.auth.SetSession(w, u); err != nil {
		internal(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, u)
}

func (h *API) logout(w http.ResponseWriter, _ *http.Request) {
	h.auth.ClearSession(w)
	w.WriteHeader(http.StatusNoContent)
}

func (h *API) me(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "Не авторизован")
		return
	}
	writeJSON(w, http.StatusOK, u)
}

func (h *API) createOrder(w http.ResponseWriter, r *http.Request) {
	var in store.OrderInput
	if !decode(w, r, &in) {
		return
	}
	var uid *int64
	if u := auth.UserFrom(r.Context()); u != nil {
		uid = &u.ID
	}
	o, err := h.store.CreateOrder(r.Context(), in, uid)
	var ve store.ValidationError
	if errors.As(err, &ve) {
		writeErr(w, http.StatusBadRequest, ve.Msg)
		return
	} else if err != nil {
		internal(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, o)
}

func (h *API) myOrders(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "Не авторизован")
		return
	}
	os, err := h.store.OrdersByUser(r.Context(), u.ID)
	if err != nil {
		internal(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, os)
}
