# 📚 BookBridge (EduShare)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)

BookBridge is a full-stack campus resource-sharing app for lending and donating educational books. It includes a React frontend, a FastAPI backend, ISBN metadata lookup, and exchange workflows for requests, schedules, and lending history.

## At a Glance

- **Frontend:** React + Vite (`/frontend`)
- **Backend:** FastAPI (`/backend`)
- **Primary API base path:** `/api`
- **Interactive API docs:** `/docs`, `/redoc`, `/openapi.json`
- **Data backends (runtime fallback order):** Supabase → MongoDB → in-memory fallback

## Project Status

> [!WARNING]
> This repository is currently configured for **development/demo use**.  
> Do not use it for production or real user data until security configuration is completed (see [Security Notes](#security-notes)).

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Security Notes](#security-notes)
- [Quality Checks](#quality-checks)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Extended Documentation](#extended-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration/login with JWT-based backend auth.
- ISBN lookup endpoint to prefill book metadata.
- Resource catalog with filtering and request lifecycle endpoints.
- Meetup scheduling and lending-history review endpoints.
- Seed/demo users for local exploration.

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### 1) Clone

```bash
git clone https://github.com/chandru07072007/Book.git
cd Book
```

### 2) Backend setup

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r backend/requirements.txt
```

Create your backend environment file from the example:

```bash
# Windows
copy backend\.env.example backend\.env

# macOS/Linux
cp backend/.env.example backend/.env
```

Set at least these values in `backend/.env`:

```env
SECRET_KEY=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173
```

Optional data-source settings:

```env
# Supabase (preferred if available)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-publishable-key

# MongoDB fallback
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=bookbridge_db
```

> [!IMPORTANT]
> Never commit `.env` files or real secrets. `backend/.env` is already ignored by `.gitignore`.

Start backend:

```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3) Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and proxies `/api` to `http://localhost:8000`.

### Local development data backend behavior

The backend attempts connections in this order:
1. Supabase (`SUPABASE_URL` + `SUPABASE_KEY`)
2. MongoDB (`MONGODB_URL`)
3. In-memory fallback

So **local development can run without Supabase** by using MongoDB or the built-in in-memory fallback.

## Security Notes

> [!CAUTION]
> This repository includes development/demo configuration. Review and harden before production.

- Demo credentials (for example `alice@campus.edu` / `password123`) are for local/demo use only.
- `supabase_schema.sql` currently enables broad development RLS policies (`USING (true)` / `WITH CHECK (true)`).
- Never expose a Supabase **`service_role`** key in frontend code or client-side environment variables.
- Set a unique high-entropy production `SECRET_KEY`; do not keep development defaults.
- Replace permissive development RLS policies with strict, authenticated, table-specific policies before storing real user data.

## Quality Checks

Run only commands that already exist in this repository:

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

```bash
python -m compileall backend
```

## API Documentation

When the backend is running locally:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- OpenAPI JSON: `http://127.0.0.1:8000/openapi.json`

The generated OpenAPI docs are the source of truth for request/response schemas.

### Endpoint overview

| Area | Prefix | Key endpoints |
| :--- | :--- | :--- |
| Auth | `/api/auth` | `POST /register`, `POST /login`, `GET /me`, `PUT /me` |
| Resources | `/api/resources` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`, `GET /isbn-lookup/{isbn}` |
| Requests | `/api/requests` | `POST /`, `GET /incoming`, `GET /outgoing`, `PUT /{id}/approve`, `PUT /{id}/reject`, `PUT /{id}/complete-return` |
| Schedules | `/api/schedules` | `POST /`, `GET /`, `PUT /{id}/confirm` |
| History | `/api/history` | `GET /`, `POST /review`, `GET /metrics/overview` |

## Project Structure

```text
Book/
├── backend/             # FastAPI service
├── frontend/            # React + Vite client
├── supabase_schema.sql  # Database schema, policies, and seed data
├── run_backend.bat      # Windows backend launcher
├── run_frontend.bat     # Windows frontend launcher
└── README.md
```

## Extended Documentation

- [Architecture](docs/architecture.md)
- [Database Notes](docs/database.md)
- [API Details](docs/api.md)
- [Deployment Notes](docs/deployment.md)
- [Demo Accounts](docs/demo.md)

## Contributing

1. Fork the repository and create a branch.
2. Make focused changes and keep commits clear.
3. Run the documented quality checks.
4. Open a pull request against `main` with a concise summary.

For major design changes, open an issue first.

## License

This project is licensed under the **MIT License**. See [`LICENSE`](LICENSE).
