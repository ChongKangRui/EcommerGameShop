CREATE TABLE cart (
    cart_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    variation_id    UUID        REFERENCES product_variations(variation_id) ON DELETE SET NULL,
    quantity        INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, variation_id)
);

CREATE INDEX idx_cart_user_id    ON cart(user_id);
CREATE INDEX idx_cart_variation_id ON cart(variation_id);
