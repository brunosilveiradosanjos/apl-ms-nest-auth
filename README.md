# Auth Microservice

A production-ready authentication microservice built with NestJS, PostgreSQL, and following Clean Architecture principles.

## Features ✨

- **Clean Architecture**: A highly maintainable and scalable codebase with a clear separation of concerns between domain, application, and infrastructure layers.
- **Multi-Client Support**: Register and manage multiple applications (clients) that can use this central service for authentication.
- **JWT Authentication**: Secure token-based authentication and refresh token rotation, scoped per application.
- **User Management**: Full administrative CRUD (Create, Read, Update, Delete) operations for user profiles.
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
    Wait for the database to be ready, then run the initialization script. This will create the necessary tables and seed a default client application and a test user.

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

| Method   | Endpoint               | Description                                                                     | Authentication           |
| :------- | :--------------------- | :------------------------------------------------------------------------------ | :----------------------- |
| `GET`    | `/health`              | Checks the service's operational status and its dependencies.                   | **Public**               |
| `POST`   | `/api/v1/users`        | **Sign Up**: Creates a new user for a specific client application.              | **Public**               |
| `POST`   | `/api/v1/auth/token`   | **Login**: Authenticates a user with `client_id`, `identifier`, and `password`. | **Public**               |
| `POST`   | `/api/v1/auth/refresh` | Issues a new `access_token` using a valid `refresh_token`.                      | **Public**               |
| `GET`    | `/api/v1/users/me`     | Retrieves the profile information for the currently authenticated user.         | **JWT Required**         |
| `GET`    | `/api/v1/users`        | **(Admin)** Retrieves a list of all user profiles.                              | **JWT Required & Admin** |
| `GET`    | `/api/v1/users/:id`    | **(Admin)** Retrieves a specific user's profile by their ID.                    | **JWT Required & Admin** |
| `PATCH`  | `/api/v1/users/:id`    | **(Admin)** Updates a specific user's profile.                                  | **JWT Required & Admin** |
| `DELETE` | `/api/v1/users/:id`    | **(Admin)** Deactivates a user's account (soft delete).                         | **JWT Required & Admin** |

### Test Credentials & Client ID

The `init.sql` script creates a default client and a test user associated with it.

- **Client ID**: `202509221000000000` (for the "main_app")
- **Username**: `johndoe`
- **Email**: `john.doe@example.com`
- **Password**: `strongPassword123`

---

## Architecture Tutorial: SOLID and Clean Architecture in Practice

This project strictly follows Clean Architecture and the SOLID principles. Here’s how these concepts are applied in the codebase.

### Clean Architecture

The core idea is the **Dependency Rule**: source code dependencies can only point inwards. The circles represent different layers of software; the further in, the higher the level.

1.  **Domain (Entities)**: The innermost circle. These are the core business objects. They know nothing about any other layer.
    - **Example**: `src/modules/user/domain/entities/user.entity.ts` defines the `User` object with its properties. It's a plain class with no external dependencies.

2.  **Application (Use Cases)**: This layer contains the application-specific business rules. It orchestrates the flow of data to and from the entities. It depends on the Domain layer but not on the outer layers.
    - **Example**: `src/modules/auth/application/services/auth.service.ts` contains the logic for logging in a user. It uses repository interfaces (`IUsersRepository`) to fetch a `User` entity and then performs logic on it. It does not know _how_ the user is stored (e.g., in PostgreSQL or MongoDB).

3.  **Infrastructure**: The outermost layer. This is where frameworks, databases, and other external tools live. This layer depends on the Application layer by implementing its interfaces.
    - **Example**: `src/modules/user/infrastructure/persistence/sequelize/repositories/sequelize-users.repository.ts` is the implementation of the `IUsersRepository` interface. It contains the actual Sequelize (PostgreSQL) code to fetch data from the `users` table. This is where the "details" live.

### SOLID Principles

These principles guide us in creating maintainable and scalable software.

#### 1. (S) Single Responsibility Principle

_A class should have only one reason to change._

- **Example**: We created `src/modules/auth/hash.module.ts` with a single responsibility: providing and exporting the `IHashProvider`. The `AuthService` doesn't know _how_ passwords are hashed; it just uses the provider. If we wanted to switch from `bcryptjs` to `argon2`, we would only need to change the `HashModule`—no other part of the application would be affected.

#### 2. (O) Open/Closed Principle

_Software entities should be open for extension but closed for modification._

- **Example**: The `HealthCheckUseCase` in `src/modules/health/application/health.check.use-case.ts` is a perfect illustration. It takes an array of `HealthIndicator`s. To add a new health check (e.g., for Redis), we simply create a new `RedisHealthIndicator` class that implements the `HealthIndicator` interface and inject it. We **extend** the system's functionality without **modifying** the `HealthCheckUseCase` itself.

#### 3. (L) Liskov Substitution Principle

_Subtypes must be substitutable for their base types._

- **Example**: The `IUsersRepository` interface (`src/modules/user/domain/repositories/i-users.repository.ts`) defines a contract for what a user repository must do. Our `SequelizeUsersRepository` (`src/modules/user/infrastructure/persistence/sequelize/repositories/sequelize-users.repository.ts`) is a subtype that fulfills this contract. We could create another implementation, say `MongoUsersRepository`, and the `AuthService` could use it without any changes, because both implementations are substitutable for the `IUsersRepository` interface.

#### 4. (I) Interface Segregation Principle

_Clients should not be forced to depend on interfaces they do not use._

- **Example**: We have separate repository interfaces like `IUsersRepository` and `IRefreshTokensRepository`. The `AuthService` needs both, but the `UserService` only needs `IUsersRepository`. We don't combine them into a single, large `IDatabaseRepository`. This prevents the `UserService` from having to depend on methods it doesn't need (like `findRefreshTokenByHash`).

#### 5. (D) Dependency Inversion Principle

_High-level modules should not depend on low-level modules. Both should depend on abstractions._

- **This is the core of Clean Architecture.** The `AuthService` (high-level module) does not depend on `SequelizeUsersRepository` (low-level module). Instead, it depends on the `IUsersRepository` interface (abstraction). The NestJS dependency injection system then provides the concrete `SequelizeUsersRepository` at runtime. This inversion of control makes the system decoupled and highly testable. We can easily mock the repository in our unit tests, as seen in `src/modules/auth/application/services/auth.service.spec.ts`.

---

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
