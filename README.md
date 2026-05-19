# AIHero / StudySidekickAI

StudySidekickAI is evolving from a one-page responsible prompt builder into an interactive, teacher-visible AI study platform. This repository now includes the V1 API contract, database migration drafts, policy-engine design notes, and a dependency-free Node.js backend scaffold for the first implementation step.

## Backend scaffold

The initial backend exposes:

- `GET /health` and `GET /api/v1/health` for service readiness checks.
- `POST /api/v1/auth/signup` for student/teacher account creation.
- `POST /api/v1/auth/login` for password login.
- `POST /api/v1/auth/refresh` for refresh-token rotation.

The auth implementation currently uses an in-memory repository so the API can be developed and tested without a database service. The service boundary is intentionally isolated so a PostgreSQL repository can replace the in-memory store after migrations are wired into the runtime API.

## Requirements

- Node.js 20+
- PostgreSQL client tools (`psql`) only when running migrations
- A PostgreSQL database URL when applying migrations

## Local development

```bash
cp .env.example .env
npm test
npm run dev
```

The API listens on `PORT` from the environment, defaulting to `3000`.

## Database migrations

The first/core migration creates schools, users, classes, class memberships, and rule sets. To apply only that first migration:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/studysidekickai npm run db:migrate:core
```

To apply all current migration drafts:

```bash
DATABASE_URL=postgres://user:password@localhost:5432/studysidekickai npm run db:migrate
```

The migration runner uses `psql`, wraps each migration in a transaction, and records applied files in `schema_migrations`.
