
-- One cart entry per fixture user, both referencing the same
-- low-stock (stock: 1) test variation — set up specifically to test
-- the checkout race condition: two users attempting to check out
-- simultaneously against a variation with only 1 unit in stock should
-- result in exactly one success and one clean 409, never both
-- succeeding (oversell) and never both failing.

INSERT INTO cart (cart_id, user_id, variation_id, quantity)
VALUES (
  '00000000-0000-0000-0000-000000004001',
  '00000000-0000-0000-0000-000000001001',
  '00000000-0000-0000-0000-000000000001',
  1
)
ON CONFLICT (user_id, variation_id) DO NOTHING;

INSERT INTO cart (cart_id, user_id, variation_id, quantity)
VALUES (
  '00000000-0000-0000-0000-000000004002',
  '00000000-0000-0000-0000-000000001002',
  '00000000-0000-0000-0000-000000000001',
  1
)
ON CONFLICT (user_id, variation_id) DO NOTHING;