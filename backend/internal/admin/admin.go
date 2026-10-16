// Package admin is the server-rendered (html/template + htmx) admin panel.
package admin

import (
	"bytes"
	"embed"
	"errors"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"log/slog"
	"net/http"
	"net/url"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"
	_ "time/tzdata"

	"github.com/go-chi/chi/v5"

	"github.com/malikahay/makstar/backend/internal/auth"
	"github.com/malikahay/makstar/backend/internal/store"
)

//go:embed templates/*.html
var templatesFS embed.FS

//go:embed static
var staticFS embed.FS

var (
	kinds          = []string{"spaghetti", "penne", "fusilli", "farfalle", "conchiglie", "elbow", "rigatoni", "nest", "vermicelli", "noodles"}
	categories     = []string{"long", "short", "shaped", "soup"}
	categoryLabels = map[string]string{"long": "Длинные", "short": "Короткие", "shaped": "Фигурные", "soup": "Для супа"}
	methods        = []string{"boil", "fry", "bake"}
	methodLabels   = map[string]string{"boil": "Варить", "fry": "Жарить", "bake": "Запекать"}
	slugRe         = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)
	tashkent, _    = time.LoadLocation("Asia/Tashkent")
)

type Admin struct {
	store *store.Store
	pages map[string]*template.Template
	parts *template.Template
}

type page struct {
	Title, Nav string
	Me         *store.User
	NewOrders  int64
	OpenMsgs   int64
	Statuses   []string
	Data       any
}

func money(n int64) string {
	s := strconv.FormatInt(n, 10)
	neg := strings.HasPrefix(s, "-")
	s = strings.TrimPrefix(s, "-")
	var b strings.Builder
	for i, r := range s {
		if i > 0 && (len(s)-i)%3 == 0 {
			b.WriteRune(' ')
		}
		b.WriteRune(r)
	}
	if neg {
		return "−" + b.String() + " сум"
	}
	return b.String() + " сум"
}

var funcs = template.FuncMap{
	"money":         money,
	"date":          func(t time.Time) string { return t.In(tashkent).Format("02.01.2006") },
	"datetime":      func(t time.Time) string { return t.In(tashkent).Format("02.01 15:04") },
	"statusLabel":   func(s string) string { return store.StatusLabels[s] },
	"statuses":      func() []string { return store.OrderStatuses },
	"categoryLabel": func(s string) string { return categoryLabels[s] },
	"methodLabel":   func(s string) string { return methodLabels[s] },
	"kinds":         func() []string { return kinds },
	"categories":    func() []string { return categories },
	"methods":       func() []string { return methods },
	"hasMethod":     func(p *store.Product, m string) bool { return slices.Contains(p.Methods.V, m) },
	"lines":         func(ss []string) string { return strings.Join(ss, "\n") },
	"mul":           func(a int64, b int) int64 { return a * int64(b) },
	"weightsText": func(p *store.Product) string {
		var ls []string
		for _, w := range p.Weights.V {
			ls = append(ls, fmt.Sprintf("%d = %d", w.Grams, w.Price))
		}
		return strings.Join(ls, "\n")
	},
	"maxRevenue": func(ds []store.DayStat) int64 {
		var m int64 = 1
		for _, d := range ds {
			m = max(m, d.Revenue)
		}
		return m
	},
	"pct":     func(v, m int64) int64 { return v * 100 / m },
	"userRow": userRow,
}

func userRow(u store.UserRow, me *store.User) any {
	return struct {
		U    store.UserRow
		MeID int64
	}{u, me.ID}
}

func New(s *store.Store) (*Admin, error) {
	a := &Admin{store: s, pages: map[string]*template.Template{}}
	base, err := template.New("").Funcs(funcs).ParseFS(templatesFS, "templates/layout.html", "templates/forbidden.html", "templates/partials.html")
	if err != nil {
		return nil, err
	}
	a.parts = template.Must(base.Clone())
	for _, name := range []string{"dashboard", "orders", "order", "products", "product_form", "users", "messages"} {
		t, err := template.Must(base.Clone()).ParseFS(templatesFS, "templates/"+name+".html")
		if err != nil {
			return nil, fmt.Errorf("template %s: %w", name, err)
		}
		a.pages[name] = t
		// partials (rows, selects, forms) are defined in page files; collect them for htmx responses
		if _, err := a.parts.ParseFS(templatesFS, "templates/"+name+".html"); err != nil {
			return nil, err
		}
	}
	return a, nil
}

func (a *Admin) Routes() http.Handler {
	r := chi.NewRouter()
	static, _ := fs.Sub(staticFS, "static")
	r.Handle("/static/*", http.StripPrefix("/admin/static/", http.FileServerFS(static)))
	r.Group(func(r chi.Router) {
		r.Use(a.requireAdmin)
		r.Get("/", a.dashboard)
		r.Get("/orders", a.orders)
		r.Get("/orders/{id}", a.order)
		r.Post("/orders/{id}/status", a.orderStatus)
		r.Get("/products", a.products)
		r.Get("/products/new", a.productForm)
		r.Post("/products/new", a.productSave)
		r.Get("/products/{id}", a.productForm)
		r.Post("/products/{id}", a.productSave)
		r.Post("/products/{id}/active", a.productActive)
		r.Get("/messages", a.messages)
		r.Post("/messages/{id}/done", a.messageDone)
		r.Get("/users", a.users)
		r.Post("/users/{id}/role", a.userRole)
	})
	return r
}

// requireAdmin sends guests to the storefront login and blocks non-admins. State-changing
// requests must come from htmx (HX-Request header): a cross-site form can't set custom
// headers, which together with the SameSite=Lax session cookie guards against CSRF.
func (a *Admin) requireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		u := auth.UserFrom(r.Context())
		if u == nil {
			http.Redirect(w, r, "/login?next="+url.QueryEscape(r.URL.RequestURI()), http.StatusSeeOther)
			return
		}
		if !u.IsAdmin() {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.WriteHeader(http.StatusForbidden)
			_ = a.parts.ExecuteTemplate(w, "forbidden", u)
			return
		}
		if r.Method != http.MethodGet && r.Header.Get("HX-Request") != "true" {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *Admin) render(w http.ResponseWriter, r *http.Request, name, title, nav string, data any) {
	p := page{Title: title, Nav: nav, Me: auth.UserFrom(r.Context()), Statuses: store.OrderStatuses, Data: data}
	p.NewOrders, _ = a.store.CountOrders(r.Context(), store.StatusNew)
	p.OpenMsgs, _ = a.store.CountOpenMessages(r.Context())
	var buf bytes.Buffer
	if err := a.pages[name].ExecuteTemplate(&buf, "layout", p); err != nil {
		fail(w, fmt.Errorf("render %s: %w", name, err))
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = buf.WriteTo(w)
}

func (a *Admin) partial(w http.ResponseWriter, name string, data any) {
	var buf bytes.Buffer
	if err := a.parts.ExecuteTemplate(&buf, name, data); err != nil {
		fail(w, fmt.Errorf("partial %s: %w", name, err))
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = buf.WriteTo(w)
}

func fail(w http.ResponseWriter, err error) {
	if errors.Is(err, store.ErrNotFound) {
		http.Error(w, "Не найдено", http.StatusNotFound)
		return
	}
	slog.Error("admin", "err", err)
	http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
}

func idParam(r *http.Request) int64 {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	return id
}

func (a *Admin) dashboard(w http.ResponseWriter, r *http.Request) {
	st, err := a.store.Stats(r.Context())
	if err != nil {
		fail(w, err)
		return
	}
	a.render(w, r, "dashboard", "Статистика", "dash", st)
}

func (a *Admin) orders(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	if _, ok := store.StatusLabels[status]; !ok {
		status = ""
	}
	os, err := a.store.ListOrders(r.Context(), status, 200)
	if err != nil {
		fail(w, err)
		return
	}
	a.render(w, r, "orders", "Заказы", "orders", map[string]any{"Orders": os, "Status": status})
}

func (a *Admin) order(w http.ResponseWriter, r *http.Request) {
	o, err := a.store.OrderByID(r.Context(), idParam(r))
	if err != nil {
		fail(w, err)
		return
	}
	a.render(w, r, "order", "Заказ "+o.Number, "orders", o)
}

func (a *Admin) orderStatus(w http.ResponseWriter, r *http.Request) {
	id := idParam(r)
	if err := a.store.SetOrderStatus(r.Context(), id, r.FormValue("status")); err != nil {
		http.Error(w, "Неверный статус", http.StatusBadRequest)
		return
	}
	o, err := a.store.OrderByID(r.Context(), id)
	if err != nil {
		fail(w, err)
		return
	}
	a.partial(w, "status_select", o)
}

func (a *Admin) products(w http.ResponseWriter, r *http.Request) {
	ps, err := a.store.AllProducts(r.Context())
	if err != nil {
		fail(w, err)
		return
	}
	a.render(w, r, "products", "Товары", "products", ps)
}

type formData struct {
	P   *store.Product
	Err string
}

func (a *Admin) productForm(w http.ResponseWriter, r *http.Request) {
	p := &store.Product{Kind: kinds[0], Category: categories[0], Active: true,
		Methods: store.JSONB[[]string]{V: []string{"boil"}}}
	title := "Новый товар"
	if chi.URLParam(r, "id") != "" {
		var err error
		if p, err = a.store.ProductByID(r.Context(), idParam(r)); err != nil {
			fail(w, err)
			return
		}
		title = p.Name
	}
	a.render(w, r, "product_form", title, "products", formData{P: p})
}

func (a *Admin) productSave(w http.ResponseWriter, r *http.Request) {
	p := &store.Product{}
	if chi.URLParam(r, "id") != "" {
		var err error
		if p, err = a.store.ProductByID(r.Context(), idParam(r)); err != nil {
			fail(w, err)
			return
		}
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxImageSize+1<<20)
	if err := r.ParseMultipartForm(maxImageSize); err != nil {
		if _, tooBig := errors.AsType[*http.MaxBytesError](err); tooBig {
			a.partial(w, "product_form", formData{P: p, Err: "Фото слишком большое — максимум 5 МБ"})
			return
		}
		http.Error(w, "bad form", http.StatusBadRequest)
		return
	}
	oldImage := p.ImageID
	msg := fillProduct(p, r.PostForm)
	if msg == "" {
		data, contentType, m, err := readImage(r)
		if err != nil {
			fail(w, err)
			return
		}
		msg = m
		switch {
		case msg != "":
		case data != nil:
			id, err := a.store.CreateImage(r.Context(), contentType, data)
			if err != nil {
				fail(w, err)
				return
			}
			p.ImageID = &id
		case r.PostForm.Get("remove_image") == "1":
			p.ImageID = nil
		}
	}
	if msg == "" {
		if err := a.store.SaveProduct(r.Context(), p); err != nil {
			if strings.Contains(err.Error(), "products_slug_key") {
				msg = "Товар с таким адресом (slug) уже есть"
			} else {
				a.dropImage(r, p.ImageID, oldImage)
				fail(w, err)
				return
			}
		}
	}
	if msg != "" {
		a.dropImage(r, p.ImageID, oldImage)
		p.ImageID = oldImage
		a.partial(w, "product_form", formData{P: p, Err: msg})
		return
	}
	a.dropImage(r, oldImage, p.ImageID)
	w.Header().Set("HX-Redirect", "/admin/products")
	w.WriteHeader(http.StatusNoContent)
}

const maxImageSize = 5 << 20

var imageTypes = []string{"image/jpeg", "image/png", "image/webp", "image/gif"}

// readImage returns the uploaded photo, or nil data if none was chosen. A non-empty msg
// means the file was rejected.
func readImage(r *http.Request) (data []byte, contentType, msg string, err error) {
	f, _, err := r.FormFile("image")
	if errors.Is(err, http.ErrMissingFile) {
		return nil, "", "", nil
	} else if err != nil {
		return nil, "", "", err
	}
	defer f.Close()
	if data, err = io.ReadAll(f); err != nil || len(data) == 0 {
		return nil, "", "", err
	}
	contentType = http.DetectContentType(data)
	if !slices.Contains(imageTypes, contentType) {
		return nil, "", "Фото должно быть в формате JPG, PNG, WebP или GIF", nil
	}
	return data, contentType, "", nil
}

// dropImage deletes image id unless it is still in use as keep. Failures only leave an
// orphaned row behind, so they are logged rather than shown.
func (a *Admin) dropImage(r *http.Request, id, keep *int64) {
	if id == nil || (keep != nil && *keep == *id) {
		return
	}
	if err := a.store.DeleteImage(r.Context(), *id); err != nil {
		slog.Error("admin: delete image", "id", *id, "err", err)
	}
}

func splitLines(s string) []string {
	out := []string{}
	for _, l := range strings.Split(s, "\n") {
		if l = strings.TrimSpace(l); l != "" {
			out = append(out, l)
		}
	}
	return out
}

// fillProduct copies form values into p and returns a user-facing error message, if any.
func fillProduct(p *store.Product, f url.Values) string {
	get := func(k string) string { return strings.TrimSpace(f.Get(k)) }
	num := func(k string) float64 { v, _ := strconv.ParseFloat(get(k), 64); return v }

	p.Name, p.Latin, p.Slug, p.Number = get("name"), get("latin"), strings.ToLower(get("slug")), get("number")
	p.Kind, p.Category, p.Tagline, p.Description, p.Badge = get("kind"), get("category"), get("tagline"), get("description"), get("badge")
	p.CookTime, p.Sort = int(num("cook_time")), int(num("sort"))
	p.Active = f.Get("active") == "1"
	p.Nutrition.V = store.Nutrition{Kcal: num("kcal"), Protein: num("protein"), Fat: num("fat"), Carbs: num("carbs")}
	p.Methods.V = nil
	for _, m := range f["methods"] {
		if slices.Contains(methods, m) {
			p.Methods.V = append(p.Methods.V, m)
		}
	}
	p.BestWith.V = splitLines(f.Get("best_with"))
	if p.I18n.V == nil {
		p.I18n.V = map[string]store.ProductText{}
	}
	p.I18n.V["uz"] = store.ProductText{
		Name: get("uz_name"), Tagline: get("uz_tagline"), Description: get("uz_description"),
		Badge: get("uz_badge"), BestWith: splitLines(f.Get("uz_best_with")),
	}
	p.Weights.V = []store.Weight{}
	for _, l := range strings.Split(f.Get("weights"), "\n") {
		if l = strings.TrimSpace(l); l == "" {
			continue
		}
		g, pr, ok := strings.Cut(l, "=")
		grams, err1 := strconv.Atoi(strings.TrimSpace(strings.TrimSuffix(strings.TrimSpace(g), "г")))
		price, err2 := strconv.ParseInt(strings.ReplaceAll(strings.TrimSpace(pr), " ", ""), 10, 64)
		if !ok || err1 != nil || err2 != nil || grams <= 0 || price <= 0 {
			return fmt.Sprintf("Не понял строку фасовки «%s». Формат: 400 = 12900", l)
		}
		p.Weights.V = append(p.Weights.V, store.Weight{Grams: grams, Price: price})
	}

	switch {
	case p.Name == "":
		return "Укажите название"
	case !slugRe.MatchString(p.Slug):
		return "Адрес (slug): только латинские буквы, цифры и дефис"
	case !slices.Contains(kinds, p.Kind):
		return "Выберите форму"
	case !slices.Contains(categories, p.Category):
		return "Выберите категорию"
	case len(p.Methods.V) == 0:
		return "Отметьте хотя бы один способ приготовления"
	case len(p.Weights.V) == 0:
		return "Добавьте хотя бы одну фасовку с ценой"
	}
	return ""
}

func (a *Admin) productActive(w http.ResponseWriter, r *http.Request) {
	id := idParam(r)
	if err := a.store.SetProductActive(r.Context(), id, r.FormValue("active") == "1"); err != nil {
		fail(w, err)
		return
	}
	p, err := a.store.ProductByID(r.Context(), id)
	if err != nil {
		fail(w, err)
		return
	}
	a.partial(w, "product_row", p)
}

func (a *Admin) messages(w http.ResponseWriter, r *http.Request) {
	ms, err := a.store.Messages(r.Context())
	if err != nil {
		fail(w, err)
		return
	}
	a.render(w, r, "messages", "Сообщения", "messages", ms)
}

func (a *Admin) messageDone(w http.ResponseWriter, r *http.Request) {
	m, err := a.store.SetMessageDone(r.Context(), idParam(r), r.FormValue("done") == "1")
	if err != nil {
		fail(w, err)
		return
	}
	a.partial(w, "message_row", m)
}

func (a *Admin) users(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	us, err := a.store.ListUsers(r.Context(), q)
	if err != nil {
		fail(w, err)
		return
	}
	a.render(w, r, "users", "Пользователи", "users", map[string]any{"Users": us, "Q": q})
}

func (a *Admin) userRole(w http.ResponseWriter, r *http.Request) {
	id := idParam(r)
	me := auth.UserFrom(r.Context())
	if id == me.ID {
		http.Error(w, "Нельзя менять свою роль", http.StatusBadRequest)
		return
	}
	if err := a.store.SetUserRole(r.Context(), id, r.FormValue("role")); err != nil {
		http.Error(w, "Неверная роль", http.StatusBadRequest)
		return
	}
	u, err := a.store.UserRowByID(r.Context(), id)
	if err != nil {
		fail(w, err)
		return
	}
	a.partial(w, "user_row", userRow(*u, me))
}
