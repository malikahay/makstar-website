package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/malikahay/makstar/backend/internal/admin"
	"github.com/malikahay/makstar/backend/internal/api"
	"github.com/malikahay/makstar/backend/internal/auth"
	"github.com/malikahay/makstar/backend/internal/store"
)

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func main() {
	if err := run(); err != nil {
		slog.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run() error {
	secret := os.Getenv("JWT_SECRET")
	if len(secret) < 32 {
		return errors.New("JWT_SECRET must be set and at least 32 characters long")
	}

	s, err := store.Open(env("DATABASE_URL", "postgres://makstar:makstar@localhost:5433/makstar?sslmode=disable"))
	if err != nil {
		return err
	}
	if err := s.Migrate(); err != nil {
		return err
	}
	if err := bootstrapAdmin(s); err != nil {
		return err
	}

	a := auth.New(secret, env("COOKIE_SECURE", "false") == "true", s)
	adm, err := admin.New(s)
	if err != nil {
		return err
	}

	r := chi.NewRouter()
	r.Use(middleware.RealIP, middleware.Logger, middleware.Recoverer, a.Middleware)
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte("ok")) })
	r.Mount("/api", api.Routes(s, a))
	r.Mount("/admin", adm.Routes())

	srv := &http.Server{
		Addr:              ":" + env("PORT", "8080"),
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	go func() {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_ = srv.Shutdown(shutdown)
	}()
	slog.Info("listening", "addr", srv.Addr)
	if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

// bootstrapAdmin makes sure the account from ADMIN_EMAIL exists and has the admin role,
// so there is always a way into a fresh installation.
func bootstrapAdmin(s *store.Store) error {
	email, pw := os.Getenv("ADMIN_EMAIL"), os.Getenv("ADMIN_PASSWORD")
	if email == "" {
		return nil
	}
	ctx := context.Background()
	u, err := s.UserByEmail(ctx, email)
	switch {
	case err == nil:
		if !u.IsAdmin() {
			return s.SetUserRole(ctx, u.ID, store.RoleAdmin)
		}
		return nil
	case !errors.Is(err, store.ErrNotFound):
		return err
	case len(pw) < 8:
		return errors.New("ADMIN_PASSWORD (8+ characters) is required to create the admin account")
	}
	hash, err := auth.HashPassword(pw)
	if err != nil {
		return err
	}
	slog.Info("creating admin account", "email", email)
	return s.CreateUser(ctx, &store.User{Email: email, Name: "Администратор", PasswordHash: hash, Role: store.RoleAdmin})
}
