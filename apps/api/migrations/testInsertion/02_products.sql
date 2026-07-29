-- migrations/testInsertion/02_products.sql
--
-- Fake product. product_id is fixed to a high, obviously-fake number
-- (99999) so it's easy to recognize in test output/logs and won't
-- collide with real dev data's auto-incrementing sequence.
INSERT INTO products (
  product_id, name, cover_image_url, price, type,
  release_date, discount_percentage, description, push_home_page, is_active
)
OVERRIDING SYSTEM VALUE
VALUES (
  99999,
  'Test Product',
  'https://example.com/test-placeholder-cover.jpg',
  100.00,
  'switch',
  '2025-01-01',
  0,
  'Fixture product for automated tests',
  false,
  true
)
ON CONFLICT (product_id) DO NOTHING;

-- Fake product variation, label 'test', with a fixed deterministic
-- UUID so tests can reference it directly without querying for it
-- first. stock: 50 gives comfortable headroom for most tests; write
-- a separate low-stock fixture in an individual test if you need to
-- exercise stock-exhaustion/oversell behavior specifically.
INSERT INTO product_variations (
  variation_id, product_id, label, image_url, image_public_id, stock, price_offset
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  99999,
  'test',
  'https://example.com/test-placeholder-variation.jpg',
  'test-placeholder-public-id',
  50,
  0
)
ON CONFLICT (variation_id) DO NOTHING;