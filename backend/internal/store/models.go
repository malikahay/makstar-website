package store

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// JSONB maps a Postgres jsonb column onto any Go value.
type JSONB[T any] struct{ V T }

func (j JSONB[T]) Value() (driver.Value, error) {
	b, err := json.Marshal(j.V)
	return string(b), err
}

func (j *JSONB[T]) Scan(src any) error {
	switch s := src.(type) {
	case []byte:
		return json.Unmarshal(s, &j.V)
	case string:
		return json.Unmarshal([]byte(s), &j.V)
	case nil:
		var zero T
		j.V = zero
		return nil
	}
	return fmt.Errorf("jsonb: unsupported type %T", src)
}

func (j JSONB[T]) MarshalJSON() ([]byte, error)  { return json.Marshal(j.V) }
func (j *JSONB[T]) UnmarshalJSON(b []byte) error { return json.Unmarshal(b, &j.V) }
func (JSONB[T]) GormDataType() string            { return "jsonb" }

const (
	RoleUser  = "user"
	RoleAdmin = "admin"
)

type User struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email"`
	Name         string    `json:"name"`
	Phone        string    `json:"phone"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	CreatedAt    time.Time `json:"createdAt"`
}

func (u *User) IsAdmin() bool { return u.Role == RoleAdmin }

type Weight struct {
	Grams int   `json:"grams"`
	Price int64 `json:"price"`
}

type Nutrition struct {
	Kcal    float64 `json:"kcal"`
	Protein float64 `json:"protein"`
	Fat     float64 `json:"fat"`
	Carbs   float64 `json:"carbs"`
}

type Product struct {
	ID          int64                         `json:"id"`
	Slug        string                        `json:"slug"`
	Kind        string                        `json:"kind"`
	Name        string                        `json:"name"`
	Latin       string                        `json:"latin"`
	Number      string                        `json:"number"`
	Category    string                        `json:"category"`
	Methods     JSONB[[]string]               `json:"methods"`
	Tagline     string                        `json:"tagline"`
	Description string                        `json:"description"`
	CookTime    int                           `json:"cookTime"`
	Weights     JSONB[[]Weight]               `json:"weights"`
	Nutrition   JSONB[Nutrition]              `json:"nutrition"`
	BestWith    JSONB[[]string]               `json:"bestWith"`
	Badge       string                        `json:"badge,omitempty"`
	ImageID     *int64                        `json:"-"`
	Image       string                        `json:"image,omitempty" gorm:"-"` // photo URL, derived from ImageID
	I18n        JSONB[map[string]ProductText] `json:"-" gorm:"column:i18n"`
	Sort        int                           `json:"-"`
	Active      bool                          `json:"-"`
	CreatedAt   time.Time                     `json:"-"`
	UpdatedAt   time.Time                     `json:"-"`
}

// AfterFind fills Image so every loaded product carries its photo URL. The URL changes
// with each upload (a new image row), so it can be cached forever.
func (p *Product) AfterFind(*gorm.DB) error {
	p.Image = ""
	if p.ImageID != nil {
		p.Image = fmt.Sprintf("/api/images/%d", *p.ImageID)
	}
	return nil
}

// Image is an uploaded product photo.
type Image struct {
	ID          int64
	ContentType string
	Data        []byte
	CreatedAt   time.Time
}

// ProductText holds a product's customer-facing copy in one additional language.
// Empty fields fall back to the base (Russian) text.
type ProductText struct {
	Name        string   `json:"name"`
	Tagline     string   `json:"tagline"`
	Description string   `json:"description"`
	BestWith    []string `json:"bestWith"`
	Badge       string   `json:"badge"`
}

// Localized returns a copy of p with texts in lang where a translation exists.
func (p Product) Localized(lang string) Product {
	tr, ok := p.I18n.V[lang]
	if !ok {
		return p
	}
	if tr.Name != "" {
		p.Name = tr.Name
	}
	if tr.Tagline != "" {
		p.Tagline = tr.Tagline
	}
	if tr.Description != "" {
		p.Description = tr.Description
	}
	if len(tr.BestWith) > 0 {
		p.BestWith.V = tr.BestWith
	}
	if tr.Badge != "" {
		p.Badge = tr.Badge
	}
	return p
}

// PriceFor returns the price of the given pack size, or false if the product has no such pack.
func (p *Product) PriceFor(grams int) (int64, bool) {
	for _, w := range p.Weights.V {
		if w.Grams == grams {
			return w.Price, true
		}
	}
	return 0, false
}

const (
	StatusNew        = "new"
	StatusConfirmed  = "confirmed"
	StatusDelivering = "delivering"
	StatusDone       = "done"
	StatusCancelled  = "cancelled"
)

var OrderStatuses = []string{StatusNew, StatusConfirmed, StatusDelivering, StatusDone, StatusCancelled}

var StatusLabels = map[string]string{
	StatusNew:        "Новый",
	StatusConfirmed:  "Подтверждён",
	StatusDelivering: "В пути",
	StatusDone:       "Доставлен",
	StatusCancelled:  "Отменён",
}

type Order struct {
	ID        int64       `json:"id"`
	Number    string      `json:"number"`
	UserID    *int64      `json:"-"`
	User      *User       `json:"-"`
	Name      string      `json:"name"`
	Phone     string      `json:"phone"`
	Email     string      `json:"email"`
	Delivery  string      `json:"delivery"`
	Address   string      `json:"address"`
	Slot      string      `json:"slot"`
	Comment   string      `json:"comment"`
	Payment   string      `json:"payment"`
	Promo     string      `json:"promo"`
	Subtotal  int64       `json:"subtotal"`
	Discount  int64       `json:"discount"`
	Shipping  int64       `json:"shipping"`
	Total     int64       `json:"total"`
	Status    string      `json:"status"`
	CreatedAt time.Time   `json:"createdAt"`
	Items     []OrderItem `json:"items"`
}

// Message is a contact form submission.
type Message struct {
	ID        int64     `json:"id"`
	Topic     string    `json:"topic"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	Text      string    `json:"text"`
	Done      bool      `json:"-"`
	CreatedAt time.Time `json:"-"`
}

type OrderItem struct {
	ID          int64  `json:"-"`
	OrderID     int64  `json:"-"`
	ProductSlug string `json:"slug"`
	ProductName string `json:"name"`
	Grams       int    `json:"grams"`
	Qty         int    `json:"qty"`
	Price       int64  `json:"price"`
}
