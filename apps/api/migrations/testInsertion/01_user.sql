-- migrations/testInsertion/01_users.sql
--
-- Fake regular user
-- Plaintext password for tests: Test1234!
-- Generate hash via: node -e "require('bcrypt').hash('Test1234!', 10).then(console.log)"
INSERT INTO users (first_name, last_name, email, password, address, role)
VALUES (
  'Test',
  'User',
  'testuser@example.com',
  '$2b$10$YvnfYtK/Z6QjVsY4v3RhvusY2Z.qZw0n8KsXvS6acJRPqUFGx8KqW',
  '123 Test Street, Test City',
  'customer'
)
ON CONFLICT (email) DO NOTHING;

-- Fake admin user
-- Plaintext password for tests: Admin1234!
-- Generate hash via: node -e "require('bcrypt').hash('Admin1234!', 10).then(console.log)"
INSERT INTO users (first_name, last_name, email, password, address, role)
VALUES (
  'Test',
  'Admin',
  'testadmin@example.com',
  '$2b$10$jq772coyZgNQkBetc8ZfTu3qH/84fLLE0cLMjMjB5VMkomIx41j0.',
  '456 Admin Avenue, Test City',
  'admin'
)
ON CONFLICT (email) DO NOTHING;