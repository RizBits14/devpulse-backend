# DevPulse Backend API

DevPulse is a backend API for an internal issue and feature tracking system. It allows users to report bugs, suggest feature requests, and manage issue workflow with role-based permissions.

## Live URL

```txt
https://devpulse-backend-ts.vercel.app
```

## Features

- User signup and login
- Password hashing with bcrypt
- JWT authentication
- Role-based access control
- Contributor and maintainer roles
- Create, view, update, and delete issues
- Filter and sort issues
- Maintainer-only issue metrics
- PostgreSQL database with raw SQL queries

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Native `pg` driver
- bcrypt
- jsonwebtoken
- dotenv
- cors
- NeonDB
- Vercel

## Setup Steps

Clone the repository:

```bash
git clone https://github.com/RizBits14/devpulse-backend.git
cd devpulse-backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=your_postgresql_database_url
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

Run the project locally:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Start production build:

```bash
npm start
```

## API Endpoints

### Root

| Method | Endpoint | Access | Description      |
| ------ | -------- | ------ | ---------------- |
| GET    | `/`      | Public | API health check |

### Authentication

| Method | Endpoint           | Access | Description                 |
| ------ | ------------------ | ------ | --------------------------- |
| POST   | `/api/auth/signup` | Public | Register a new user         |
| POST   | `/api/auth/login`  | Public | Login and receive JWT token |

### Issues

| Method | Endpoint              | Access                  | Description       |
| ------ | --------------------- | ----------------------- | ----------------- |
| POST   | `/api/issues`         | Contributor, Maintainer | Create an issue   |
| GET    | `/api/issues`         | Public                  | Get all issues    |
| GET    | `/api/issues/:id`     | Public                  | Get single issue  |
| PATCH  | `/api/issues/:id`     | Contributor, Maintainer | Update an issue   |
| DELETE | `/api/issues/:id`     | Maintainer only         | Delete an issue   |
| GET    | `/api/issues/metrics` | Maintainer only         | Get issue metrics |

## Query Parameters

`GET /api/issues` supports:

| Query    | Values                            |
| -------- | --------------------------------- |
| `sort`   | `newest`, `oldest`                |
| `type`   | `bug`, `feature_request`          |
| `status` | `open`, `in_progress`, `resolved` |

Example:

```txt
/api/issues?sort=newest&type=bug&status=open
```

## Authentication Header

Protected routes require a JWT token:

```txt
Authorization: <JWT_TOKEN>
```

## Database Schema Summary

### users

| Field        | Description                   |
| ------------ | ----------------------------- |
| `id`         | Auto-incrementing user ID     |
| `name`       | User full name                |
| `email`      | Unique user email             |
| `password`   | Hashed password               |
| `role`       | `contributor` or `maintainer` |
| `created_at` | Account creation timestamp    |
| `updated_at` | Account update timestamp      |

### issues

| Field         | Description                          |
| ------------- | ------------------------------------ |
| `id`          | Auto-incrementing issue ID           |
| `title`       | Issue title                          |
| `description` | Issue details                        |
| `type`        | `bug` or `feature_request`           |
| `status`      | `open`, `in_progress`, or `resolved` |
| `reporter_id` | ID of the user who created the issue |
| `created_at`  | Issue creation timestamp             |
| `updated_at`  | Issue update timestamp               |

## Role Permissions

### Contributor

- Create issues
- View all issues
- View single issue
- Update own issue only when status is `open`

### Maintainer

- All contributor permissions
- Update any issue
- Change issue status
- Delete any issue
- Access issue metrics
