CREATE TABLE products (
    product_id          SERIAL          PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
   	cover_image_url		TEXT			NOT NULL,
    price               NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    type                product_type    NOT NULL,
    is_sold_out         BOOLEAN         NOT NULL DEFAULT FALSE,
    release_date        DATE            NOT NULL,
    discount_percentage NUMERIC(5, 2)   NOT NULL DEFAULT 0
                            CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    push_home_page   BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_type         ON products(type);
CREATE INDEX idx_products_release_date ON products(release_date);
CREATE INDEX idx_products_is_sold_out ON products(is_sold_out);
