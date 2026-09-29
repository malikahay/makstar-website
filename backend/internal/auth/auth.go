// Package auth handles password hashing, JWT session cookies and request authentication.
package auth

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/malikahay/makstar/backend/internal/store"
)

const (
	CookieName = "mk_session"
	sessionTTL = 7 * 24 * time.Hour
)

type Auth struct {
	secret       []byte
	secureCookie bool
	store        *store.Store
}

func New(secret string, secureCookie bool, s *store.Store) *Auth {
	return &Auth{secret: []byte(secret), secureCookie: secureCookie, store: s}
}

func HashPassword(pw string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(b), err
}

func CheckPassword(hash, pw string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw)) == nil
}

// SetSession issues a signed JWT for the user in an httpOnly cookie.
func (a *Auth) SetSession(w http.ResponseWriter, u *store.User) error {
	now := time.Now()
	tok, err := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Subject:   strconv.FormatInt(u.ID, 10),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(sessionTTL)),
	}).SignedString(a.secret)
	if err != nil {
		return err
	}
	http.SetCookie(w, &http.Cookie{
		Name: CookieName, Value: tok, Path: "/", MaxAge: int(sessionTTL.Seconds()),
		HttpOnly: true, Secure: a.secureCookie, SameSite: http.SameSiteLaxMode,
	})
	return nil
}

func (a *Auth) ClearSession(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name: CookieName, Value: "", Path: "/", MaxAge: -1,
		HttpOnly: true, Secure: a.secureCookie, SameSite: http.SameSiteLaxMode,
	})
}

func (a *Auth) userFromRequest(r *http.Request) (*store.User, error) {
	c, err := r.Cookie(CookieName)
	if err != nil {
		return nil, err
	}
	var claims jwt.RegisteredClaims
	_, err = jwt.ParseWithClaims(c.Value, &claims, func(*jwt.Token) (any, error) { return a.secret, nil },
		jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}), jwt.WithExpirationRequired())
	if err != nil {
		return nil, err
	}
	id, err := strconv.ParseInt(claims.Subject, 10, 64)
	if err != nil {
		return nil, err
	}
	// The role is read from the DB on every request so demotions take effect immediately.
	return a.store.UserByID(r.Context(), id)
}

type ctxKey struct{}

// Middleware attaches the logged-in user (if any) to the request context.
func (a *Auth) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if u, err := a.userFromRequest(r); err == nil {
			r = r.WithContext(context.WithValue(r.Context(), ctxKey{}, u))
		} else if !errors.Is(err, http.ErrNoCookie) {
			a.ClearSession(w)
		}
		next.ServeHTTP(w, r)
	})
}

func UserFrom(ctx context.Context) *store.User {
	u, _ := ctx.Value(ctxKey{}).(*store.User)
	return u
}
