package api

import (
	"fmt"
	"net/http"
)

// langOf picks the storefront language: ?lang= first (server-side fetches from Next),
// then the "lang" cookie set by the site's RU/UZ switcher. Russian is the default.
func langOf(r *http.Request) string {
	if l := r.URL.Query().Get("lang"); l == "uz" || l == "ru" {
		return l
	}
	if c, err := r.Cookie("lang"); err == nil && c.Value == "uz" {
		return "uz"
	}
	return "ru"
}

// uzMessages maps every customer-facing Russian message (or fmt format) to Uzbek.
var uzMessages = map[string]string{
	"Не найдено":     "Topilmadi",
	"Ожидается JSON": "JSON kutilmoqda",
	"Что-то пошло не так, попробуйте ещё раз":         "Nimadir xato ketdi, qaytadan urinib ko‘ring",
	"Неверный формат запроса":                         "So‘rov formati noto‘g‘ri",
	"Товар не найден":                                 "Mahsulot topilmadi",
	"Неверный email":                                  "Email noto‘g‘ri",
	"Укажите имя":                                     "Ismingizni kiriting",
	"Пароль должен быть от 8 до 72 символов":          "Parol 8 dan 72 tagacha belgidan iborat bo‘lishi kerak",
	"Этот email уже зарегистрирован":                  "Bu email allaqachon ro‘yxatdan o‘tgan",
	"Неверный email или пароль":                       "Email yoki parol noto‘g‘ri",
	"Не авторизован":                                  "Avtorizatsiyadan o‘tilmagan",
	"Укажите телефон":                                 "Telefon raqamini kiriting",
	"Выберите способ доставки":                        "Yetkazib berish usulini tanlang",
	"Укажите адрес доставки":                          "Yetkazib berish manzilini kiriting",
	"Корзина пуста":                                   "Savat bo‘sh",
	"Неверное количество товара":                      "Mahsulot miqdori noto‘g‘ri",
	"Товар «%s» больше не продаётся":                  "«%s» mahsuloti endi sotilmaydi",
	"Фасовки %d г для «%s» больше нет":                "«%[2]s» uchun %[1]d g qadoq endi yo‘q",
	"Выберите способ оплаты":                          "To‘lov usulini tanlang",
	"Напишите сообщение":                              "Xabar yozing",
	"Сообщение слишком длинное":                       "Xabar juda uzun",
	"Слишком много попыток. Попробуйте через %d мин.": "Urinishlar juda ko‘p. %d daqiqadan so‘ng qayta urinib ko‘ring.",
}

// tr translates a Russian message (optionally a fmt format with args) into the request's language.
func tr(r *http.Request, msg string, args ...any) string {
	if langOf(r) == "uz" {
		if uz, ok := uzMessages[msg]; ok {
			msg = uz
		}
	}
	if len(args) == 0 {
		return msg
	}
	return fmt.Sprintf(msg, args...)
}
