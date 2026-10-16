-- Contact form submissions from the storefront.
CREATE TABLE messages (
    id         BIGSERIAL PRIMARY KEY,
    topic      TEXT NOT NULL DEFAULT '',
    name       TEXT NOT NULL,
    phone      TEXT NOT NULL,
    email      TEXT NOT NULL DEFAULT '',
    text       TEXT NOT NULL,
    done       BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
