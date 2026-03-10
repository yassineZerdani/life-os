# Life OS

A personal life management and analysis web application for tracking and improving all major life domains.

## Architecture

The system organizes life into three layers:

1. **Resources** (things you have): Health, Wealth, Skills, Network
2. **Activities** (things you do): Career, Relationships, Experiences
3. **Identity** (who you're becoming): Persona, Values, Purpose

## Tech Stack

**Frontend:** React, TypeScript, Vite, Ant Design, Zustand, React Query  
**Backend:** Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic

## Quick Start

```bash
docker-compose up
```

Then open:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## Local Development (without Docker)

### 1. Create PostgreSQL role and database

The app expects a `lifeos` role. Create it with:

```bash
# Using postgres superuser (common on macOS Homebrew PostgreSQL):
psql -U postgres -f backend/scripts/setup_db.sql

# Or if your superuser is your system username:
psql -U $(whoami) -f backend/scripts/setup_db.sql
```

**Alternative:** Use your existing PostgreSQL user. Create the database manually, then set:

```bash
export DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/gemini
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
export DATABASE_URL=postgresql://lifeos:lifeos_secret@localhost:5432/gemini
alembic upgrade head
python seed_data.py
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── db/           # Database session
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── alembic/          # Migrations
│   └── seed_data.py
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       └── types/
└── docker-compose.yml
```

## Features

- **Dashboard:** Life score by domain, recent activities, metrics trends, goals progress
- **Domain Pages:** Notes, metrics, goals, timeline events per life domain
- **Metrics System:** Generic tracking (weight, sleep, net worth, etc.)
- **Goals System:** Track progress with targets and deadlines
- **Experiences:** Log life events with emotional ratings
- **Relationships:** Contact-style management
- **Achievements:** Milestone tracking
- **Identity:** Values, principles, vision notes

## Bonus Features (architecture ready)

- AI life coach
- Automatic insights
- Reminders
- Habit tracking
- Life timeline
- Yearly review
