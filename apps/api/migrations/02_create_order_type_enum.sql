

CREATE TYPE order_status AS ENUM (
    'pending',
    'paid',
    'delivered',
    'shipped',
    'canceled',
    'refunded',
    'partially_refunded',
    'expired'
);

CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected');