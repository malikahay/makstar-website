package store

import (
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/golang-migrate/migrate/v4"
	migratepgx "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/malikahay/makstar/backend/migrations"
)

type Store struct{ DB *gorm.DB }

func Open(dsn string) (*Store, error) {
	lg := logger.New(log.New(os.Stderr, "", log.LstdFlags), logger.Config{
		SlowThreshold: 200 * time.Millisecond, LogLevel: logger.Warn, IgnoreRecordNotFoundError: true,
	})
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{Logger: lg})
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}
	return &Store{DB: db}, nil
}

// Migrate applies all pending SQL migrations from the migrations/ directory.
func (s *Store) Migrate() error {
	sqlDB, err := s.DB.DB()
	if err != nil {
		return err
	}
	src, err := iofs.New(migrations.FS, ".")
	if err != nil {
		return err
	}
	drv, err := migratepgx.WithInstance(sqlDB, &migratepgx.Config{})
	if err != nil {
		return err
	}
	m, err := migrate.NewWithInstance("iofs", src, "pgx5", drv)
	if err != nil {
		return err
	}
	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("migrate: %w", err)
	}
	return nil
}
