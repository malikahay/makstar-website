package api

import (
	"fmt"
	"html"
	"strconv"
	"strings"

	"github.com/malikahay/makstar/backend/internal/store"
)

// sum formats an amount the way the site does: "23 900 сум".
func sum(n int64) string {
	s := strconv.FormatInt(n, 10)
	for i := len(s) - 3; i > 0; i -= 3 {
		s = s[:i] + " " + s[i:]
	}
	return s + " сум"
}

func (h *API) adminLink(path string) string {
	if h.siteURL == "" {
		return ""
	}
	return fmt.Sprintf("\n\n<a href=\"%s\">Открыть в админке</a>", html.EscapeString(h.siteURL+path))
}

func (h *API) notifyOrder(o *store.Order) {
	e := html.EscapeString
	var b strings.Builder
	fmt.Fprintf(&b, "🛒 <b>Новый заказ %s</b>\n\n", e(o.Number))
	fmt.Fprintf(&b, "👤 %s\n📞 %s\n", e(o.Name), e(o.Phone))
	if o.Delivery == "courier" {
		fmt.Fprintf(&b, "🚚 Курьер: %s", e(o.Address))
		if o.Slot != "" {
			fmt.Fprintf(&b, " (%s)", e(o.Slot))
		}
		b.WriteString("\n")
	} else {
		b.WriteString("🏬 Самовывоз\n")
	}
	fmt.Fprintf(&b, "💳 %s\n\n", e(o.Payment))
	for _, it := range o.Items {
		fmt.Fprintf(&b, "• %s %d г × %d — %s\n", e(it.ProductName), it.Grams, it.Qty, sum(it.Price*int64(it.Qty)))
	}
	if o.Discount > 0 {
		fmt.Fprintf(&b, "Скидка %s: −%s\n", e(o.Promo), sum(o.Discount))
	}
	if o.Shipping > 0 {
		fmt.Fprintf(&b, "Доставка: %s\n", sum(o.Shipping))
	}
	fmt.Fprintf(&b, "<b>Итого: %s</b>", sum(o.Total))
	if o.Comment != "" {
		fmt.Fprintf(&b, "\n\n💬 %s", e(o.Comment))
	}
	b.WriteString(h.adminLink(fmt.Sprintf("/admin/orders/%d", o.ID)))
	h.tg.Send(b.String())
}

func (h *API) notifyMessage(m *store.Message) {
	e := html.EscapeString
	var b strings.Builder
	b.WriteString("✉️ <b>Сообщение с сайта</b>")
	if m.Topic != "" {
		fmt.Fprintf(&b, " · %s", e(m.Topic))
	}
	fmt.Fprintf(&b, "\n\n👤 %s\n📞 %s\n", e(m.Name), e(m.Phone))
	if m.Email != "" {
		fmt.Fprintf(&b, "📧 %s\n", e(m.Email))
	}
	fmt.Fprintf(&b, "\n%s", e(m.Text))
	b.WriteString(h.adminLink("/admin/messages"))
	h.tg.Send(b.String())
}
