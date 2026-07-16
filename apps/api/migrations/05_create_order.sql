-- Source of truth
CREATE TABLE orders (
    order_id        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID            REFERENCES users(user_id) ON DELETE SET NULL,
    status          order_status    NOT NULL DEFAULT 'pending',  -- ENUM: pending, paid, shipped, cancelled
    total_amount    NUMERIC(10, 2)  NOT NULL CHECK (total_amount >= 0),
    expires_at      TIMESTAMPTZ,
    payment_ref     TEXT            UNIQUE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    order_item_id   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID            NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id      INTEGER         NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    variation_id    UUID            REFERENCES product_variations(variation_id) ON DELETE RESTRICT,
    quantity        INTEGER         NOT NULL CHECK (quantity > 0),
    price      NUMERIC(10, 2)       NOT NULL,  -- snapshot of price at time of purchase
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Summary table for fast admin reads
CREATE TABLE monthly_product_sales (
    id              SERIAL          PRIMARY KEY,
    product_id      INTEGER         NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    year            SMALLINT        NOT NULL,
    month           SMALLINT        NOT NULL CHECK (month BETWEEN 1 AND 12),
    units_sold      INTEGER         NOT NULL DEFAULT 0,
    revenue         NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, year, month)
);

CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created_at  ON orders(created_at);
CREATE INDEX idx_orders_pending_expiry ON orders(expires_at) WHERE status = 'pending';
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_monthly_sales_ym   ON monthly_product_sales(year, month);
CREATE INDEX idx_order_items_variation ON order_items(variation_id);