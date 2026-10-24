# Student Monorepo

A full-stack student management and payments application built as a Bun workspace monorepo, containing a React (Vite) frontend and an Express + MySQL API.

## Project Structure

```
.
├── apps/
│   ├── web/          # Frontend — React 19 + Vite + TypeScript
│   └── api/          # Backend  — Express 5 + Drizzle ORM + MySQL
├── docker-compose.yml
├── package.json      # Workspaces config + dev scripts
└── tsconfig.json
```

## Apps

### `apps/web` — Frontend (`@student/web`)

React 19 SPA built with Vite and TypeScript.

- Student registration and payment UI (`src/component/`)
- API client (`src/lib/api.ts`) pointing at the backend
- Handles PayU payment results (`PaymentResult.tsx`)

```bash
bun run dev:web        # starts Vite dev server at http://localhost:5173
```

### `apps/api` — Backend (`@student/api`)

Express 5 REST API with Drizzle ORM on MySQL 8.

- **Modules** (`src/modules/`):
  - `students` — student CRUD (routes, controller, service, validation schemas)
  - `payments` — PayU payment integration (initiation + callback handling)
- **Database** (`src/db/`): Drizzle schema with `students` and `payments` tables
- **Health checks**: `/api/health` and `/api/health/db`
- CORS is configured for `http://localhost:5173` (the Vite dev server)

```bash
bun run dev:api        # starts API with tsx watch at http://localhost:4000
```

Database scripts (run inside `apps/api`):

```bash
bun run db:generate    # generate Drizzle migrations
bun run db:migrate     # apply migrations
bun run db:studio      # Drizzle Studio (DB browser)
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- Docker (for MySQL)

### Setup

1. **Install dependencies** (from repo root):

   ```bash
   bun install
   ```

2. **Start MySQL via Docker:**

   ```bash
   docker compose up -d
   ```

   Creates a `student_db` database with user `student_app` (dev credentials are in `docker-compose.yml`).

3. **Configure environment:** create `apps/api/.env` with:

   ```env
   PORT=4000
   # MySQL connection
   ...
   ```

4. **Run migrations:**

   ```bash
   cd apps/api
   bun run db:generate
   bun run db:migrate
   ```

5. **Start dev servers:**

   ```bash
   bun run dev:api     # terminal 1 — API on :4000
   bun run dev:web     # terminal 2 — web on :5173
   ```

## API Endpoints

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/api/health`         | API status                   |
| GET    | `/api/health/db`      | Database connectivity check  |
| *      | `/api/students/*`     | Student CRUD endpoints       |
| *      | `/api/payments/*`     | Payment endpoints (PayU)     |

## Tech Stack

- **Tooling:** Bun workspaces, TypeScript
- **Frontend:** React 19, Vite, ESLint
- **Backend:** Express 5, Zod (validation), tsx (dev runner)
- **Database:** MySQL 8.4 (Docker), Drizzle ORM + drizzle-kit
- **Payments:** PayU integration
