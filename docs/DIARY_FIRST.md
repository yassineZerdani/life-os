# Diary-First Life OS

## Overview

Life OS is now **diary-first**. After login, users land on **Today** (`/app/today`), a daily journal that acts as the main input surface. The Control Room (dashboard) remains available via sidebar or the "Control Room" button.

## User flow

1. **Login** → redirect to `/app/today`
2. **Today page** → user sees greeting, date, streak, and a large diary editor
3. **User writes** about their day in natural language
4. **Optional:** mood, energy quick inputs; then **"Extract from entry"**
5. **AI extraction** runs (rule-based for now); suggestions appear in the side panel
6. **User reviews** each suggestion: Confirm / Reject (and optionally Edit)
7. Confirmed updates can later be applied to domains (metrics, events, etc.)
8. **Control Room** is one click away for full dashboard view

## Data model

| Model | Purpose |
|-------|--------|
| **JournalEntry** | One per user per day: `date`, `title`, `raw_text`, `mood`, `energy` |
| **JournalPromptResponse** | Optional structured answers to prompts (e.g. sleep, exercise) |
| **ExtractedSignal** | Parsed signal from text: `domain`, `signal_type`, `value_json`, `confidence`, `source_text` |
| **SuggestedDomainUpdate** | Candidate update for user review: `domain`, `update_type`, `payload_json`, `status` (pending / confirmed / rejected / edited) |

## AI extraction (JournalIntelligenceService)

- **Current:** Rule-based keyword/regex extraction (no external AI).
- **Future:** Replace with LLM or NLU to extract richer structure.
- Example: *"I slept badly, had two coffees, worked a lot, studied Spanish for 45 minutes, argued with my brother, spent money on delivery."*
  - Health: poor sleep, caffeine
  - Career: high work effort
  - Skills: learning (Spanish, 45 min)
  - Relationships: conflict (brother)
  - Wealth: spending (food)

## Confirmation flow

- Nothing is applied to life domains without user action.
- **"What I understood"** panel lists suggested updates with domain tag and confidence.
- User can **Confirm** (accept), **Reject** (discard), or **Edit** (change payload then mark edited).
- Confirmed/edited records are stored with `status`; `apply_confirmed_updates()` is a placeholder to create metric entries, experiences, etc. from payloads.

## Diary → domain mapping

| Diary content | Domain | Example update type |
|---------------|--------|---------------------|
| Sleep, tired, caffeine, exercise | Health | sleep_quality, caffeine, exercise |
| Spent, bought, delivery, food | Wealth | spending |
| Studied, learned, practiced X for N min | Skills | learning |
| Argued with X, conflict | Relationships | conflict |
| Worked a lot, deadline, busy at work | Career | work_effort |
| Events, places, activities | Experiences | experience |
| Mood, identity, values | Identity / Psychology | insight |

## Navigation

Sidebar order:

1. **Today**
2. Control Room
3. Timeline
4. Analytics
5. Life Domains (Health, Wealth, …)
6. Strategy
7. Gamification
8. Knowledge
9. Tools
10. Settings

Default app index and post-login redirect: **/app/today**.

## API

- `GET /api/journal/today` — Today summary (entry, streak, suggested_updates, extracted_signals)
- `PATCH /api/journal/today` — Update today’s entry (raw_text, mood, energy)
- `POST /api/journal/today/analyze` — Run extraction on today’s entry
- `PATCH /api/journal/suggestions/{id}` — Set status: confirmed | rejected | edited
- `PATCH /api/journal/suggestions/{id}/edit` — Edit payload and set status to edited
- `GET /api/journal/streak` — Current streak days
