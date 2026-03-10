# Docker: build and run one by one

Use these when you want to build/run each service separately (e.g. to debug or to avoid one big compose).

**Order:** Postgres → Backend → Frontend (shared network `lifeos-network`).

## 1. Postgres (from repo root)

Creates the `lifeos-network` and the database.

```bash
docker compose -f docker-compose.postgres.yml up -d
```

## 2. Backend (from repo root or from `backend/`)

Expects Postgres to be running. Build and run:

```bash
# From repo root
docker compose -f backend/docker-compose.yml up -d --build

# Or from backend/
docker compose -f docker-compose.yml up -d --build
```

Optional env (or set in `backend/.env`): `JWT_SECRET`, `ALLOWED_ORIGINS`.

## 3. Frontend (from repo root or from `frontend/`)

Expects backend to be running (container name `backend`). Serves on port 80.

```bash
# From repo root
docker compose -f frontend/docker-compose.yml up -d --build

# Or from frontend/
docker compose -f docker-compose.yml up -d --build
```

Then open **http://localhost** (or your server IP). Frontend proxies `/api` to the backend.

---

**Stop (reverse order):**

```bash
docker compose -f frontend/docker-compose.yml down
docker compose -f backend/docker-compose.yml down
docker compose -f docker-compose.postgres.yml down
```
