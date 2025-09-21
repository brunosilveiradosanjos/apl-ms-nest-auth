# Auth Microservice

A production-ready authentication microservice built with NestJS, PostgreSQL, and following Clean Architecture principles.

## Features ✨

- **Clean Architecture**: A highly maintainable and scalable codebase with a clear separation between the `auth` and `user` modules.
- **JWT Authentication**: Secure token-based authentication and refresh token rotation.
- **User Management**: Full administrative CRUD (Create, Read, Update, Delete) operations for user profiles.
- **Flexible Login**: Users can authenticate using either their username or email address.
- **Health Check Endpoint**: A dedicated `/health` endpoint to monitor service and database status.
- **Database**: PostgreSQL managed via Docker for consistent development environments.
- **Validation**: Robust request validation using Zod for type safety.
- **API Documentation**: Automatic and interactive Swagger (OpenAPI) documentation.
- **Isolated E2E Testing**: A professional end-to-end testing setup that uses per-test PostgreSQL schemas for perfect test isolation.

## Prerequisites 🛠️

- [Node.js](https://nodejs.org/) (v20.x or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- **(Optional)** A local `psql` client for running the `db:init` script.

## Getting Started (Local Development) 🚀

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/brunosilveiradosanjos/apl-ms-nest-auth.git](https://github.com/brunosilveiradosanjos/apl-ms-nest-auth.git)
    cd apl-ms-nest-auth
    ```

2.  **Create Environment File:**
    Copy the example environment file.

    ```bash
    cp .env.example .env
    ```

    _Update `.env` with your desired `DB_PASSWORD` and `JWT_SECRET`._

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Start the PostgreSQL database:**
    This command starts a PostgreSQL container in the background.

    ```bash
    npm run db:start
    ```

5.  **Initialize the Database Schema:**
    Wait for the database to be ready, then run the initialization script.

    ```bash
    npm run db:init
    ```

6.  **Run the application in development mode:**
    The server will start and watch for file changes.
    ```bash
    npm run dev
    ```

The application will be running at `http://localhost:3000`.

## API Endpoints & Documentation 📖

Once running, access the interactive Swagger UI at:

**[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)**

### Endpoints Summary

| Method   | Endpoint               | Description                                                                           | Authentication             |
| :------- | :--------------------- | :------------------------------------------------------------------------------------ | :------------------------- |
| `GET`    | `/health`              | Checks the service's operational status and its dependencies.                         | **Public**                 |
| `POST`   | `/api/v1/auth/signup`  | **Sign Up**: Creates a new user. Returns authentication tokens.                       | **Public**                 |
| `POST`   | `/api/v1/auth/token`   | **Login**: Authenticates a user with `identifier` (username or email) and `password`. | **Public**                 |
| `POST`   | `/api/v1/auth/refresh` | Issues a new `access_token` using a valid `refresh_token`.                            | **Refresh Token Required** |
| `GET`    | `/api/v1/users/me`     | Retrieves the profile information for the currently authenticated user.               | **JWT Required**           |
| `GET`    | `/api/v1/users`        | **(Admin)** Retrieves a list of all user profiles.                                    | **JWT Required**           |
| `GET`    | `/api/v1/users/:id`    | **(Admin)** Retrieves a specific user's profile by their ID.                          | **JWT Required**           |
| `PATCH`  | `/api/v1/users/:id`    | **(Admin)** Updates a specific user's profile.                                        | **JWT Required**           |
| `DELETE` | `/api/v1/users/:id`    | **(Admin)** Deactivates a specific user's account (soft delete).                      | **JWT Required**           |

### Test User Credentials

The test user created by the `init.sql` script has the following credentials:

- **username**: `johndoe`
- **email**: `john.doe@example.com`
- **password**: `strongPassword123`

## Running Tests 🧪

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
