
-- Test for cross authorization for order authority
-- Customer's fake order
INSERT INTO orders (order_id, user_id, status, total_amount, payment_ref)
VALUES (
  '00000000-0000-0000-0000-000000002001',
  '00000000-0000-0000-0000-000000001001',
  'delivered',
  100.00,
  'pi_test_customer_order'
)
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO order_items (order_item_id, order_id, product_id, variation_id, quantity, price)
VALUES (
  '00000000-0000-0000-0000-000000003001',
  '00000000-0000-0000-0000-000000002001',
  99999,
  '00000000-0000-0000-0000-000000000001',
  1,
  100.00
)
ON CONFLICT (order_item_id) DO NOTHING;

-- Admin's order
INSERT INTO orders (order_id, user_id, status, total_amount, payment_ref)
VALUES (
  '00000000-0000-0000-0000-000000002002',
  '00000000-0000-0000-0000-000000001002',
  'delivered',
  100.00,
  'pi_test_admin_order'
)
ON CONFLICT (order_id) DO NOTHING;

INSERT INTO order_items (order_item_id, order_id, product_id, variation_id, quantity, price)
VALUES (
  '00000000-0000-0000-0000-000000003002',
  '00000000-0000-0000-0000-000000002002',
  99999,
  '00000000-0000-0000-0000-000000000001',
  1,
  100.00
)
ON CONFLICT (order_item_id) DO NOTHING;