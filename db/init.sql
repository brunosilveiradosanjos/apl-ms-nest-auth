-- db/init.sql

-- Create a custom type for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Create the clients table to store application information
DROP TABLE IF EXISTS clients CASCADE;
CREATE TABLE clients (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert a default client
INSERT INTO clients (id, name, description)
VALUES ('202509221000000000', 'main_app', 'The primary application.');


-- The users table remains unchanged from its original structure
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role user_role NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed a test user
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role)
VALUES ('20250915093000001234', 'johndoe', 'john.doe@example.com', '$2a$10$2e9JWKDs67ww1YmRL8JBX.HAInChQXxXo5/UziscQfp.sRWAZIS.q', 'John', 'Doe', 'admin');


-- NEW: Create the user_clients junction table for the many-to-many relationship
DROP TABLE IF EXISTS user_clients CASCADE;
CREATE TABLE user_clients (
    user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(20) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, client_id)
);

-- Associate the test user with the default client
INSERT INTO user_clients (user_id, client_id) VALUES ('20250915093000001234', '202509221000000000');


-- Update the refresh_tokens table to include a client_id for security scoping
DROP TABLE IF EXISTS refresh_tokens CASCADE;
CREATE TABLE refresh_tokens (
    id VARCHAR(20) PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(20) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);