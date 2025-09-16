-- Rationale: We use raw SQL for full control over the schema. TIMESTAMPTZ is
-- crucial for handling time zones correctly. Indexes on foreign keys and unique
-- fields (like username) are vital for query performance. ON DELETE CASCADE
-- maintains data integrity by cleaning up related tokens when a user is deleted.
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);

CREATE TABLE refresh_tokens (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Partial index for performance: only index tokens that are not yet revoked.
-- This makes lookups for active tokens much faster.
CREATE INDEX idx_active_refresh_tokens ON refresh_tokens(token_hash) WHERE is_revoked = FALSE;

-- Seeding a test user for development.
-- The password is 'strongPassword123'
INSERT INTO users (id, username, password_hash)
VALUES
('20250915093000001234', 'johndoe', '$2a$10$AbI.jott.p2y1iK5lBGA7u/GvV.L03PlzV5isg5vYL.g09S9Zg9eS');
