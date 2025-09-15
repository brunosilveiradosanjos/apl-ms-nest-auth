# Auth Microservice

A production-ready authentication microservice built with NestJS, PostgreSQL, and following Clean Architecture principles.

## Features

- **JWT Authentication**: Secure token-based authentication.
- **Token Rotation**: Enhanced security by rotating refresh tokens on use.
- **Database**: PostgreSQL managed via Docker.
- **Validation**: Request validation using Zod.
- **API Documentation**: Automatic Swagger (OpenAPI) documentation.
- **Clean Architecture**: Highly maintainable and testable codebase.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd auth-microservice
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy the example environment file and update it with your configuration, especially your database password.

    ```bash
    cp .env.example .env
    ```

4.  **Start the PostgreSQL database:**
    This command will start a PostgreSQL container in the background and execute the `init.sql` script to create the necessary tables and seed a test user.

    ```bash
    docker-compose up -d
    ```

5.  **Run the application in development mode:**
    The server will start and watch for file changes.
    ```bash
    npm run start:dev
    ```

The application will be running at `http://localhost:3000`.

## API Documentation

Once the application is running, you can access the Swagger UI for interactive API documentation at:

**[http://localhost:3000/docs](http://localhost:3000/docs)**

You can try out all the endpoints directly from this interface. The test user created by the `init.sql` script has the following credentials:

- **username**: `johndoe`
- **password**: `strongPassword123`

## Running Tests

To run the test suite (unit and end-to-end tests):

```bash
npm test
```

To generate a coverage report:

```bash
npm run test:cov
```
