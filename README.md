# Auth Microservice

A production-ready authentication microservice built with NestJS, PostgreSQL, and following Clean Architecture principles.

## Features

- **JWT Authentication**: Secure token-based authentication with auto-login on signup.
- **Flexible Login**: Users can authenticate using either their username or their email address.
- **Rich User Profiles**: User model includes email, first/last name, and status fields (`is_active`, `is_verified`).
- **Secure GitOps Configuration**: All secrets and configurations are managed in a separate, private, and encrypted repository.
- **Automated CI/CD**: A GitHub Actions pipeline automatically lints, tests, and validates all changes on pull requests.
- **Token Rotation**: Enhanced security by rotating refresh tokens on use.
- **Database**: PostgreSQL managed via Docker for consistent development environments.
- **Validation**: Robust request validation using Zod.
- **API Documentation**: Automatic and interactive Swagger (OpenAPI) documentation.
- **Isolated E2E Testing**: A professional end-to-end testing setup that uses per-test PostgreSQL schemas for perfect test isolation without data loss.
- **Clean Architecture**: Highly maintainable, testable, and scalable codebase.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [SOPS](https://github.com/getsops/sops/releases) and [age](https://github.com/FiloSottile/age/releases) installed on your local machine for secrets management.

## Getting Started (Local Development)

This project uses a secure GitOps approach for configuration. All secrets are stored in a separate private repository and must be decrypted to run the application locally.

1.  **Clone both repositories:**
    You need both the application and the configuration repository.

    ```bash
    # Clone the main application
    git clone [https://github.com/brunosilveiradosanjos/apl-ms-nest-auth.git](https://github.com/brunosilveiradosanjos/apl-ms-nest-auth.git)
    cd apl-ms-nest-auth

    # Clone the config repo in a sibling directory
    git clone [https://github.com/brunosilveiradosanjos/apl-ms-auth-config.git](https://github.com/brunosilveiradosanjos/apl-ms-auth-config.git) ../apl-ms-auth-config
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Local Environment Secrets:**
    Use SOPS to decrypt the development configuration from the config repo into a local `.env` file. This file is git-ignored and will not be committed. **You will need the `age` private key to perform this step.**

    ```bash
    sops --decrypt ../apl-ms-auth-config/development/config.yml > .env
    ```

4.  **Start the PostgreSQL database:**
    This command will start a PostgreSQL container in the background.

    ```bash
    npm run db:start
    ```

5.  **Run the application in development mode:**
    The server will start and watch for file changes.
    ```bash
    npm run dev
    ```

The application will be running at `http://localhost:3000`.

## API Endpoints & Documentation

Once the application is running, you can access the interactive Swagger UI at:

**[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

### Key Endpoints

- **`POST /api/v1/users`**
  - Creates a new user.
  - **Body**: Requires `username`, `email`, `password`. Optional: `firstName`, `lastName`.
  - **Response**: Returns JWT `access_token` and `refresh_token` for the new user.

- **`POST /api/v1/auth/token`**
  - Authenticates an existing user.
  - **Body**: Requires `identifier` (which can be the user's `username` or `email`) and `password`.
  - **Response**: Returns new JWT `access_token` and `refresh_token`.

### Test User Credentials

The test user created by the `init.sql` script has the following credentials:

- **username**: `johndoe`
- **email**: `john.doe@example.com`
- **password**: `strongPassword123`

## Running Tests

The project includes a comprehensive suite of unit and end-to-end tests.

### Unit Tests

To run the unit tests (files ending in `.spec.ts`):

```bash
npm test
```

To generate a coverage report:

```bash
npm run test:cov
```

### End-to-End (E2E) Tests

To run the E2E tests against a live, isolated database schema:

```bash
npm run test:e2e
```

This command automates the entire testing lifecycle:

1.  Starts the PostgreSQL Docker container if it's not running.
2.  Waits for the database to be ready to accept connections.
3.  Runs the Jest test suite, where **each test gets its own isolated, temporary database schema** that is created and destroyed automatically.
