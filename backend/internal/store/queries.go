package store

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"slices"
	"strings"
	"time"

	"gorm.io/gorm"
)

var (
	ErrNotFound   = errors.New("not found")
	ErrEmailTaken = errors.New("email already registered")
)

func notFound(err error) error {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrNotFound
	}
	return err
}

/* ───────── users ───────── */

func (s *Store) CreateUser(ctx context.Context, u *User) error {
	var n int64
	if err := s.DB.WithContext(ctx).Model(&User{}).Where("lower(email) = lower(?)", u.Email).Count(&n).Error; err != nil {
		return err
	}
	if n > 0 {
		return ErrEmailTaken
	}
	err := s.DB.WithContext(ctx).Create(u).Error
	if err != nil && strings.Contains(err.Error(), "users_email_key") {
		return ErrEmailTaken
	}
	return err
}

func (s *Store) UserByID(ctx context.Context, id int64) (*User, error) {
	var u User
	if err := s.DB.WithContext(ctx).First(&u, id).Error; err != nil {
		return nil, notFound(err)
	}
	return &u, nil
}

func (s *Store) UserByEmail(ctx context.Context, email string) (*User, error) {
	var u User
	if err := s.DB.WithContext(ctx).Where("lower(email) = lower(?)", email).First(&u).Error; err != nil {
		return nil, notFound(err)
	}
	return &u, nil
}

type UserRow struct {
	User
	Orders int64
	Spent  int64
}

func (s *Store) userRows(ctx context.Context) *gorm.DB {
	return s.DB.WithContext(ctx).Table("users u").
		Select("u.*, count(o.id) AS orders, coalesce(sum(o.total) FILTER (WHERE o.status <> 'cancelled'), 0) AS spent").
		Joins("LEFT JOIN orders o ON o.user_id = u.id").
		Group("u.id")
}

func (s *Store) UserRowByID(ctx context.Context, id int64) (*UserRow, error) {
	var rows []UserRow
	if err := s.userRows(ctx).Where("u.id = ?", id).Scan(&rows).Error; err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, ErrNotFound
	}
	return &rows[0], nil
}

func (s *Store) ListUsers(ctx context.Context, q string) ([]UserRow, error) {
	var rows []UserRow
	tx := s.userRows(ctx).Order("u.created_at DESC")
	if q != "" {
		like := "%" + q + "%"
		tx = tx.Where("u.email ILIKE ? OR u.name ILIKE ? OR u.phone ILIKE ?", like, like, like)
	}
	return rows, tx.Scan(&rows).Error
}

func (s *Store) SetUserRole(ctx context.Context, id int64, role string) error {
	if role != RoleUser && role != RoleAdmin {
		return fmt.Errorf("bad role %q", role)
	}
	return s.DB.WithContext(ctx).Model(&User{}).Where("id = ?", id).Update("role", role).Error
}

/* ───────── products ───────── */

func (s *Store) ActiveProducts(ctx context.Context) ([]Product, error) {
	var ps []Product
	return ps, s.DB.WithContext(ctx).Where("active").Order("sort, id").Find(&ps).Error
}

func (s *Store) AllProducts(ctx context.Context) ([]Product, error) {
	var ps []Product
	return ps, s.DB.WithContext(ctx).Order("sort, id").Find(&ps).Error
}

func (s *Store) ProductByID(ctx context.Context, id int64) (*Product, error) {
	var p Product
	if err := s.DB.WithContext(ctx).First(&p, id).Error; err != nil {
		return nil, notFound(err)
	}
	return &p, nil
}

func (s *Store) ActiveProductBySlug(ctx context.Context, slug string) (*Product, error) {
	var p Product
	if err := s.DB.WithContext(ctx).Where("slug = ? AND active", slug).First(&p).Error; err != nil {
		return nil, notFound(err)
	}
	return &p, nil
}

func (s *Store) SaveProduct(ctx context.Context, p *Product) error {
	p.UpdatedAt = time.Now()
	if p.ID == 0 {
		return s.DB.WithContext(ctx).Create(p).Error
	}
	return s.DB.WithContext(ctx).Model(p).Select("*").Omit("id", "created_at").Updates(p).Error
}

func (s *Store) CreateImage(ctx context.Context, contentType string, data []byte) (int64, error) {
	img := Image{ContentType: contentType, Data: data}
	err := s.DB.WithContext(ctx).Create(&img).Error
	return img.ID, err
}

func (s *Store) ImageByID(ctx context.Context, id int64) (*Image, error) {
	var img Image
	if err := s.DB.WithContext(ctx).First(&img, id).Error; err != nil {
		return nil, notFound(err)
	}
	return &img, nil
}

func (s *Store) DeleteImage(ctx context.Context, id int64) error {
	return s.DB.WithContext(ctx).Delete(&Image{}, id).Error
}

func (s *Store) SetProductActive(ctx context.Context, id int64, active bool) error {
	return s.DB.WithContext(ctx).Model(&Product{}).Where("id = ?", id).
		Updates(map[string]any{"active": active, "updated_at": time.Now()}).Error
}

/* ───────── messages ───────── */

type MessageInput struct {
	Topic string `json:"topic"`
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
	Text  string `json:"text"`
}

func (s *Store) CreateMessage(ctx context.Context, in MessageInput) (*Message, error) {
	m := &Message{
		Topic: strings.TrimSpace(in.Topic), Name: strings.TrimSpace(in.Name), Phone: strings.TrimSpace(in.Phone),
		Email: strings.TrimSpace(in.Email), Text: strings.TrimSpace(in.Text),
	}
	switch {
	case len([]rune(m.Name)) < 2:
		return nil, ValidationError{Msg: "Укажите имя"}
	case countDigits(m.Phone) < 9:
		return nil, ValidationError{Msg: "Укажите телефон"}
	case m.Text == "":
		return nil, ValidationError{Msg: "Напишите сообщение"}
	case len([]rune(m.Text)) > 5000 || len([]rune(m.Name)) > 200 || len(m.Phone) > 50 || len(m.Email) > 200 || len([]rune(m.Topic)) > 100:
		return nil, ValidationError{Msg: "Сообщение слишком длинное"}
	}
	return m, s.DB.WithContext(ctx).Create(m).Error
}

func (s *Store) Messages(ctx context.Context) ([]Message, error) {
	var ms []Message
	return ms, s.DB.WithContext(ctx).Order("done, id DESC").Limit(300).Find(&ms).Error
}

func (s *Store) SetMessageDone(ctx context.Context, id int64, done bool) (*Message, error) {
	var m Message
	if err := s.DB.WithContext(ctx).Model(&m).Where("id = ?", id).Update("done", done).Error; err != nil {
		return nil, err
	}
	if err := s.DB.WithContext(ctx).First(&m, id).Error; err != nil {
		return nil, notFound(err)
	}
	return &m, nil
}

func (s *Store) CountOpenMessages(ctx context.Context) (int64, error) {
	var n int64
	return n, s.DB.WithContext(ctx).Model(&Message{}).Where("NOT done").Count(&n).Error
}

/* ───────── orders ───────── */

const (
	FreeShippingFrom = 150000
	ShippingPrice    = 15000
	PromoCode        = "MAKSTAR10"
	PromoPercent     = 10
)

// PaymentMethods are the accepted payment labels. Orders store the Russian label (the storefront
// sends dictionaries.ru.checkout.payments) so the admin panel reads the same in any site language.
var PaymentMethods = []string{"Картой при получении", "Наличными при получении"}

type OrderInput struct {
	Name     string `json:"name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Delivery string `json:"delivery"`
	Address  string `json:"address"`
	Slot     string `json:"slot"`
	Comment  string `json:"comment"`
	Payment  string `json:"payment"`
	Promo    string `json:"promo"`
	Lang     string `json:"-"` // language for product names in error messages
	Items    []struct {
		Slug  string `json:"slug"`
		Grams int    `json:"grams"`
		Qty   int    `json:"qty"`
	} `json:"items"`
}

// ValidationError carries a message that is safe to show to the customer.
// Msg is a Russian fmt format string; the API layer translates it before formatting.
type ValidationError struct {
	Msg  string
	Args []any
}

func (e ValidationError) Error() string { return fmt.Sprintf(e.Msg, e.Args...) }

// CreateOrder prices the cart from the database (never trusting client prices) and stores the order.
func (s *Store) CreateOrder(ctx context.Context, in OrderInput, userID *int64) (*Order, error) {
	in.Name, in.Phone, in.Address = strings.TrimSpace(in.Name), strings.TrimSpace(in.Phone), strings.TrimSpace(in.Address)
	switch {
	case len([]rune(in.Name)) < 2:
		return nil, ValidationError{Msg: "Укажите имя"}
	case countDigits(in.Phone) < 9:
		return nil, ValidationError{Msg: "Укажите телефон"}
	case in.Delivery != "courier" && in.Delivery != "pickup":
		return nil, ValidationError{Msg: "Выберите способ доставки"}
	case in.Delivery == "courier" && len([]rune(in.Address)) < 5:
		return nil, ValidationError{Msg: "Укажите адрес доставки"}
	case !slices.Contains(PaymentMethods, in.Payment):
		return nil, ValidationError{Msg: "Выберите способ оплаты"}
	case len(in.Items) == 0 || len(in.Items) > 50:
		return nil, ValidationError{Msg: "Корзина пуста"}
	}

	o := &Order{
		UserID: userID, Name: in.Name, Phone: in.Phone, Email: strings.TrimSpace(in.Email),
		Delivery: in.Delivery, Comment: strings.TrimSpace(in.Comment), Payment: in.Payment, Status: StatusNew,
	}
	if in.Delivery == "courier" {
		o.Address, o.Slot = in.Address, in.Slot
	}
	for _, it := range in.Items {
		if it.Qty < 1 || it.Qty > 999 {
			return nil, ValidationError{Msg: "Неверное количество товара"}
		}
		p, err := s.ActiveProductBySlug(ctx, it.Slug)
		if errors.Is(err, ErrNotFound) {
			return nil, ValidationError{"Товар «%s» больше не продаётся", []any{it.Slug}}
		} else if err != nil {
			return nil, err
		}
		price, ok := p.PriceFor(it.Grams)
		if !ok {
			return nil, ValidationError{"Фасовки %d г для «%s» больше нет", []any{it.Grams, p.Localized(in.Lang).Name}}
		}
		o.Items = append(o.Items, OrderItem{ProductSlug: p.Slug, ProductName: p.Name, Grams: it.Grams, Qty: it.Qty, Price: price})
		o.Subtotal += price * int64(it.Qty)
	}
	if strings.EqualFold(strings.TrimSpace(in.Promo), PromoCode) {
		o.Promo = PromoCode
		o.Discount = (o.Subtotal*PromoPercent + 50) / 100
	}
	if in.Delivery == "courier" && o.Subtotal < FreeShippingFrom {
		o.Shipping = ShippingPrice
	}
	o.Total = o.Subtotal - o.Discount + o.Shipping

	err := s.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for range 5 {
			n, err := rand.Int(rand.Reader, big.NewInt(900000))
			if err != nil {
				return err
			}
			o.Number = fmt.Sprintf("MK-%d", 100000+n.Int64())
			var exists int64
			if err := tx.Model(&Order{}).Where("number = ?", o.Number).Count(&exists).Error; err != nil {
				return err
			}
			if exists == 0 {
				return tx.Create(o).Error
			}
		}
		return errors.New("could not allocate order number")
	})
	return o, err
}

func countDigits(s string) int {
	n := 0
	for _, r := range s {
		if r >= '0' && r <= '9' {
			n++
		}
	}
	return n
}

func (s *Store) OrdersByUser(ctx context.Context, userID int64) ([]Order, error) {
	var os []Order
	return os, s.DB.WithContext(ctx).Preload("Items").Where("user_id = ?", userID).Order("created_at DESC").Find(&os).Error
}

func (s *Store) ListOrders(ctx context.Context, status string, limit int) ([]Order, error) {
	var os []Order
	tx := s.DB.WithContext(ctx).Preload("Items").Preload("User").Order("created_at DESC").Limit(limit)
	if status != "" {
		tx = tx.Where("status = ?", status)
	}
	return os, tx.Find(&os).Error
}

func (s *Store) OrderByID(ctx context.Context, id int64) (*Order, error) {
	var o Order
	if err := s.DB.WithContext(ctx).Preload("Items").Preload("User").First(&o, id).Error; err != nil {
		return nil, notFound(err)
	}
	return &o, nil
}

func (s *Store) CountOrders(ctx context.Context, status string) (int64, error) {
	var n int64
	return n, s.DB.WithContext(ctx).Model(&Order{}).Where("status = ?", status).Count(&n).Error
}

func (s *Store) SetOrderStatus(ctx context.Context, id int64, status string) error {
	if _, ok := StatusLabels[status]; !ok {
		return fmt.Errorf("bad status %q", status)
	}
	return s.DB.WithContext(ctx).Model(&Order{}).Where("id = ?", id).Update("status", status).Error
}

/* ───────── stats ───────── */

type Stats struct {
	Revenue, Orders, AvgCheck int64
	RevenueToday, OrdersToday int64
	Users, UsersWeek          int64
	ByStatus                  map[string]int64
	Days                      []DayStat
	TopProducts               []TopProduct
}

type DayStat struct {
	Day     time.Time
	Revenue int64
	Orders  int64
}

type TopProduct struct {
	Name    string
	Qty     int64
	Revenue int64
}

func (s *Store) Stats(ctx context.Context) (*Stats, error) {
	db := s.DB.WithContext(ctx)
	st := &Stats{ByStatus: map[string]int64{}}
	var agg struct{ Revenue, Orders, RevenueToday, OrdersToday int64 }
	if err := db.Raw(`
		SELECT coalesce(sum(total), 0) AS revenue, count(*) AS orders,
		       coalesce(sum(total) FILTER (WHERE created_at >= date_trunc('day', now())), 0) AS revenue_today,
		       count(*) FILTER (WHERE created_at >= date_trunc('day', now())) AS orders_today
		FROM orders WHERE status <> 'cancelled'`).Scan(&agg).Error; err != nil {
		return nil, err
	}
	st.Revenue, st.Orders, st.RevenueToday, st.OrdersToday = agg.Revenue, agg.Orders, agg.RevenueToday, agg.OrdersToday
	if st.Orders > 0 {
		st.AvgCheck = st.Revenue / st.Orders
	}
	var us struct{ Users, UsersWeek int64 }
	if err := db.Raw(`SELECT count(*) AS users, count(*) FILTER (WHERE created_at >= now() - interval '7 days') AS users_week FROM users`).
		Scan(&us).Error; err != nil {
		return nil, err
	}
	st.Users, st.UsersWeek = us.Users, us.UsersWeek

	var bs []struct {
		Status string
		N      int64
	}
	if err := db.Raw(`SELECT status, count(*) AS n FROM orders GROUP BY status`).Scan(&bs).Error; err != nil {
		return nil, err
	}
	for _, b := range bs {
		st.ByStatus[b.Status] = b.N
	}

	if err := db.Raw(`
		SELECT d::date AS day, coalesce(sum(o.total), 0) AS revenue, count(o.id) AS orders
		FROM generate_series(date_trunc('day', now()) - interval '13 days', date_trunc('day', now()), interval '1 day') d
		LEFT JOIN orders o ON o.status <> 'cancelled' AND o.created_at >= d AND o.created_at < d + interval '1 day'
		GROUP BY d ORDER BY d`).Scan(&st.Days).Error; err != nil {
		return nil, err
	}

	return st, db.Raw(`
		SELECT i.product_name AS name, sum(i.qty) AS qty, sum(i.qty * i.price) AS revenue
		FROM order_items i JOIN orders o ON o.id = i.order_id AND o.status <> 'cancelled'
		GROUP BY i.product_name ORDER BY revenue DESC LIMIT 5`).Scan(&st.TopProducts).Error
}
