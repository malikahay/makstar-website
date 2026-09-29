CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         TEXT NOT NULL,
    name          TEXT NOT NULL DEFAULT '',
    phone         TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_key ON users (lower(email));

CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    kind        TEXT NOT NULL,
    name        TEXT NOT NULL,
    latin       TEXT NOT NULL DEFAULT '',
    number      TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL CHECK (category IN ('long', 'short', 'shaped', 'soup')),
    methods     JSONB NOT NULL DEFAULT '[]',
    tagline     TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    cook_time   INT NOT NULL DEFAULT 0,
    weights     JSONB NOT NULL DEFAULT '[]',
    nutrition   JSONB NOT NULL DEFAULT '{}',
    best_with   JSONB NOT NULL DEFAULT '[]',
    badge       TEXT NOT NULL DEFAULT '',
    sort        INT NOT NULL DEFAULT 0,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
    id         BIGSERIAL PRIMARY KEY,
    number     TEXT NOT NULL UNIQUE,
    user_id    BIGINT REFERENCES users (id) ON DELETE SET NULL,
    name       TEXT NOT NULL,
    phone      TEXT NOT NULL,
    email      TEXT NOT NULL DEFAULT '',
    delivery   TEXT NOT NULL CHECK (delivery IN ('courier', 'pickup')),
    address    TEXT NOT NULL DEFAULT '',
    slot       TEXT NOT NULL DEFAULT '',
    comment    TEXT NOT NULL DEFAULT '',
    payment    TEXT NOT NULL DEFAULT '',
    promo      TEXT NOT NULL DEFAULT '',
    subtotal   BIGINT NOT NULL,
    discount   BIGINT NOT NULL DEFAULT 0,
    shipping   BIGINT NOT NULL DEFAULT 0,
    total      BIGINT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'new'
               CHECK (status IN ('new', 'confirmed', 'delivering', 'done', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_id_idx ON orders (user_id);
CREATE INDEX orders_created_at_idx ON orders (created_at DESC);

CREATE TABLE order_items (
    id           BIGSERIAL PRIMARY KEY,
    order_id     BIGINT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_slug TEXT NOT NULL,
    product_name TEXT NOT NULL,
    grams        INT NOT NULL,
    qty          INT NOT NULL CHECK (qty > 0),
    price        BIGINT NOT NULL
);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);
