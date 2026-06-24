CREATE TABLE product_variations (
    variation_id    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      INTEGER         NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    label           VARCHAR(100)    NOT NULL,
    image_url       TEXT,
    stock           INTEGER         NOT NULL DEFAULT 0 CHECK (stock >= 0),
    price_offset    NUMERIC(10, 2)  NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, label)
);

CREATE INDEX idx_variations_product_id ON product_variations(product_id);
