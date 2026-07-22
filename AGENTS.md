# Medicines Manager — Agent Guide

## ⚠️ Permission required
Before making any code change, adding a file, or running any command, **ask for explicit permission first** and show a `git diff`-style preview of what you intend to add/remove. Do not act without approval. This project is in a cautious phase — prefer showing over doing.

## Project structure
```
backend/          FastAPI + SQLModel + Alembic (entry: app.main:app)
frontend/         React + Vite + Tailwind (entry: src/main.jsx)
docker-compose.yml     Production: db, redis, backend, worker, scheduler, frontend
docker-compose.dev.yml Dev override: hot-reload frontend, exposes :8000
```

## Key commands
| Action | Directory | Command |
|---|---|---|
| Backend tests (no DB needed) | `backend/` | `pytest` |
| Single test file | `backend/` | `pytest tests/test_medicines.py -v` |
| Run backend dev | `backend/` | `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` |
| Run migrations | `backend/` | `alembic upgrade head` |
| New migration | `backend/` | `alembic revision --autogenerate -m "description"` |
| Frontend dev | `frontend/` | `npm run dev` |
| Frontend build | `frontend/` | `npm run build` |
| Frontend lint | `frontend/` | `npm run lint` |
| Full stack dev | root | `docker compose up` (COMPOSE_FILE env auto-merges dev compose) |
| Deploy | root | `./deploy.sh` (requires `deploy.conf`) |

## Backend details
- Tests use **in-memory SQLite** via `TestClient` + dependency override (no PostgreSQL needed).
- `DATABASE_URL` must use `postgresql+psycopg2://` scheme — `database.py` and `alembic/env.py` rewrite it automatically.
- Background tasks use **taskiq** (pinned `taskiq==0.12.4`, `taskiq-redis==1.2.2` — blocked on Redis 7).
- Worker entry: `taskiq worker app.core.tkq:broker`. Scheduler entry: `taskiq scheduler app.core.tkq:scheduler`.
- No formatter or type checker config in repo (no ruff/black/mypy config found).

## Frontend details
- Dev proxy rewrites `/api/v1/*` → `http://backend:8000/` (strips the prefix).
- Production nginx (multi-stage Docker build) does the same proxy pass.
- React Router SPA — nginx fallback to `/index.html`.

## API routes
- `/medicines/` (CRUD + `/medicines/active`)
- `/medication-schedules/`
- `/medication-logs/` (dashboard + intake logging)

## Architecture notes
- All models have automatic `created_at` / `updated_at` (server-side `func.now()`, timezone-aware).
- Schedule frequencies: DAILY, WEEKLY, MONTHLY with configurable intervals.
- Passed-schedule detection uses a **3-hour lookback window** from current time.
- Telegram notifications are planned but partially implemented via `TelegramService`.
- Notification model has a `UniqueConstraint` on `(scheduled_id, reference_date, type)`.

## Gotchas
- `.env` files contain real Telegram tokens — never commit them (already in `.gitignore`).
- `backend/test` is an empty file (placeholder, not a test directory).
- No pre-commit hooks or CI workflows configured.
- `deploy.sh` runs `docker compose build --no-cache` — slow, intentional for production.
