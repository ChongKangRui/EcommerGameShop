

CREATE TYPE order_status AS ENUM (
    'pending',
    'paid',
    'delivered',
    'shipped',
    'cancelled',
    'refunded',
    'expired'
);

CREATE TYPE refund_status AS ENUM ('pending', 'approved', 'rejected', 'processed', 'failed');