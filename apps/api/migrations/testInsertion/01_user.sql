
-- Fake regular user
-- Plaintext password for tests: Test1234!
-- Generate hash via: node -e "require('bcrypt').hash('Test1234!+ process.env.PEPPER', 12).then(console.log)"
INSERT INTO users (user_id,first_name, last_name, email, password, address, role)
VALUES (
  '00000000-0000-0000-0000-000000001001',
  'Test',
  'User',
  'testuser@example.com',
  '$2b$12$MVTB8P5wolly/0O0pi2I2uWakujIswbiF8dGz1wc4CHOayI.TjF/m',
  '123 Test Street, Test City',
  'customer'
)
ON CONFLICT (email) DO NOTHING;

-- Fake admin user
-- Plaintext password for tests: Admin1234!
-- Generate hash via: node -e "require('bcrypt').hash('Admin1234!+ process.env.PEPPER', 12).then(console.log)"
INSERT INTO users (user_id,first_name, last_name, email, password, address, role)
VALUES (
  '00000000-0000-0000-0000-000000001002',
  'Test',
  'Admin',
  'testadmin@example.com',
  '$2b$12$PMAKfGbyFp3ZqfldVP9.UOQUxu.0jlbBSfY.Lv6McjplOM2BYnRSm',
  '456 Admin Avenue, Test City',
  'admin'
)
ON CONFLICT (email) DO NOTHING;