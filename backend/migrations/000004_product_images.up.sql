CREATE TABLE images (
    id           BIGSERIAL PRIMARY KEY,
    content_type TEXT NOT NULL,
    data         BYTEA NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ADD COLUMN image_id BIGINT REFERENCES images (id) ON DELETE SET NULL;
