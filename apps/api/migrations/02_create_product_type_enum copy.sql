CREATE TYPE product_type AS ENUM (
    'switch',
    'switch_2',
    'xbox',
    'ps4',
    'ps5'
);

CREATE TYPE order_status AS ENUM (
    'pending',
    'paid',
    'preparing',
    'shipped',
    'cancelled',
    'refunded'
);