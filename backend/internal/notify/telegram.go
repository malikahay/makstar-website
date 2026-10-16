// Package notify sends staff notifications (new orders, contact form messages) to Telegram.
package notify

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"time"
)

// Telegram posts messages to one chat (a group or a person) through a bot.
// The zero value and nil are valid and send nothing, so notifications are optional in development.
type Telegram struct {
	token, chatID string
	client        *http.Client
}

func NewTelegram(token, chatID string) *Telegram {
	if token == "" || chatID == "" {
		slog.Warn("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set: staff notifications are off")
		return nil
	}
	return &Telegram{token: token, chatID: chatID, client: &http.Client{Timeout: 10 * time.Second}}
}

// Send delivers an HTML-formatted message in the background, so a slow or unreachable
// Telegram never delays the customer. Failures are logged; the data is already in the database.
func (t *Telegram) Send(html string) {
	if t == nil {
		return
	}
	go func() {
		if err := t.send(html); err != nil {
			slog.Error("telegram", "err", err)
		}
	}()
}

func (t *Telegram) send(html string) error {
	body, _ := json.Marshal(map[string]any{
		"chat_id": t.chatID, "text": html, "parse_mode": "HTML", "disable_web_page_preview": true,
	})
	res, err := t.client.Post("https://api.telegram.org/bot"+t.token+"/sendMessage", "application/json", bytes.NewReader(body))
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		var out struct {
			Description string `json:"description"`
		}
		_ = json.NewDecoder(res.Body).Decode(&out)
		return fmt.Errorf("sendMessage: %s: %s", res.Status, out.Description)
	}
	return nil
}
