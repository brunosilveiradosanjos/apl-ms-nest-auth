-- Rationale: We use raw SQL for full control over the schema. TIMESTAMPTZ is
-- crucial for handling time zones correctly. Indexes on foreign keys and unique
-- fields (like username) are vital for query performance. ON DELETE CASCADE
-- maintains data integrity by cleaning up related tokens when a user is deleted.-- Rationale: We add a user_role ENUM type to ensure data integrity at the
-- database level. The 'role' column is added to the users table with a default
-- value of 'user'. The test user is explicitly given the 'admin' role.

-- Create a custom type for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user');

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role NOT NULL DEFAULT 'user', -- Add the role column
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ... (rest of the script remains the same)

-- Seeding a test user for development with an admin role.
-- Seeding a test user for development.
-- The password is 'strongPassword123'
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES
('20250915093000001234', 'johndoe', 'john.doe@example.com', '$2a$10$57SFNNRJ54YlQX8wSSTKFO0W7KWITG.WxiIhstyfPClKa7dRxgi1i', 'John', 'Doe', 'admin');

-- Add indexes for fast lookups on unique, frequently queried columns
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);


-- Create the refresh_tokens table
DROP TABLE IF EXISTS refresh_tokens CASCADE;
CREATE TABLE refresh_tokens (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial index for performance: only index tokens that are not yet revoked.
-- This makes lookups for active tokens much faster.
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_active_refresh_tokens ON refresh_tokens(token_hash) WHERE is_revoked = FALSE;