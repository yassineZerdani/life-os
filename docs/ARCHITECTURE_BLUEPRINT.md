# Life OS — Ultimate System Architecture Blueprint

A modular personal life intelligence system combining life tracking, psychology frameworks, health systems, financial systems, behavior analysis, strategic recommendations, simulations, gamification, and graph-based life mapping.

---

## 1. System Overview

### Vision

Life OS is a **personal operating system for life** — not a productivity app. It unifies:

| Layer | Purpose |
|-------|---------|
| **Core Life Tracking** | Domains, scores, goals, notes, timeline |
| **Advanced Methods** | Pluggable frameworks (Big Five, CBT, DBT, Shadow, etc.) |
| **Analytics & Patterns** | Metrics, trends, correlations, anomaly detection |
| **Strategy & Intervention** | Evidence-based strategies, recommendations |
| **Prediction & Simulation** | Future projections, scenario modeling |
| **Knowledge Graph** | Connected life entities (people, skills, experiences, patterns) |
| **Gamification** | XP, levels, quests, achievements |

### Architectural Principles

1. **Modular over monolithic** — Each domain/method is a module with clear boundaries
2. **Event-centric** — Almost everything is representable as an event
3. **Shared engines** — Events, metrics, assessments, strategies, insights are generic
4. **Extension over modification** — New modules extend, don't replace
5. **Single user** — No multi-tenancy; simpler auth and data model
6. **Incremental build** — MVP first, advanced modules later

---

## 2. Architectural Pillars

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        INTELLIGENCE ENGINE                               │
│  Insights │ Recommendations │ Simulation │ Pattern Detection            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼───────────────────────────────────────┐
│         EVENT ENGINE               │           METRICS ENGINE             │
│  LifeEvent │ Unified Timeline      │  MetricDefinition │ MetricEntry       │
└───────────────────────────────────┼───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┼───────────────────────────────────────┐
│         LIFE CORE                  │         METHOD MODULES                 │
│  Domains │ Goals │ Notes           │  CBT │ DBT │ Big Five │ Shadow │ ... │
└───────────────────────────────────┼───────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴───────────────────────────────────────┐
│         KNOWLEDGE GRAPH                                                    │
│  GraphNode │ GraphEdge │ Relationships between entities                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Module Breakdown

### `/app/core` — Life Core

**Purpose:** Foundational entities for the entire system.

**Responsibilities:**
- Domain definitions and lifecycle
- Domain scoring (aggregate from metrics, XP)
- Goal management
- Notes (domain-scoped or global)

**Key Models:**
- `Domain`, `DomainScore`, `Goal`, `Note`

**Services:** `domain_service`, `scoring_service`, `goal_service`

**API:** `/api/domains`, `/api/goals`, `/api/notes`, `/api/life-score`

**Dependencies:** None (foundation)

---

### `/app/domains` — Domain Pages

**Purpose:** Domain-specific views and aggregations.

**Responsibilities:**
- Domain page data (metrics, goals, events, strategies)
- Domain-specific routing

**Key Models:** None (uses core + other modules)

**Services:** `domain_page_service` (aggregates)

**API:** `/api/domains/{slug}/summary`

**Dependencies:** core, metrics, events, goals, strategies

---

### `/app/metrics` — Metrics Engine

**Purpose:** Reusable, generic metrics system.

**Responsibilities:**
- Metric definitions (numeric, text, JSON, scales)
- Metric entries (values over time)
- Normalization and scoring
- Aggregation for analytics

**Key Models:**
- `MetricDefinition`, `MetricEntry`

**Services:** `metric_service`, `metric_aggregation_service`

**API:** `/api/metrics`, `/api/metrics/{id}/entries` (POST, GET)

**Dependencies:** core (domain_id)

---

### `/app/events` — Event Engine

**Purpose:** Central event system for all life occurrences.

**Responsibilities:**
- LifeEvent CRUD
- Timeline generation
- Event → XP, Event → Graph edge
- Event → Insight trigger

**Key Models:**
- `LifeEvent`

**Services:** `event_service`, `timeline_service`, `xp_service`

**API:** `/api/events`, `/api/timeline`

**Dependencies:** core, metrics, gamification, graph

---

### `/app/goals` — Goal Management

**Purpose:** Goal tracking and progress.

**Responsibilities:**
- Goal CRUD
- Progress updates
- Goal completion detection
- Goal → Recommendation

**Key Models:**
- `Goal` (in core)

**Services:** `goal_service`, `goal_progress_service`

**API:** `/api/goals`

**Dependencies:** core, metrics, events

---

### `/app/timeline` — Unified Timeline

**Purpose:** Chronological view of all events.

**Responsibilities:**
- Aggregate events from LifeEvent, XPEvent, Achievement, Experience
- Filter by type, domain, date range

**Key Models:** None (uses events)

**Services:** `timeline_service`

**API:** `/api/timeline`

**Dependencies:** events, gamification

---

### `/app/strategies` — Strategy Engine

**Purpose:** Evidence-based strategies.

**Responsibilities:**
- Strategy CRUD
- Strategy steps
- User strategy activation
- Adherence tracking
- Effectiveness scoring

**Key Models:**
- `Strategy`, `StrategyStep`, `UserStrategy`

**Services:** `strategy_engine`, `adherence_service`

**API:** `/api/strategies`, `/api/strategies/recommended`, `/api/strategies/activate`

**Dependencies:** core, metrics, events

---

### `/app/methods` — Method Module Framework

**Purpose:** Pluggable framework for advanced modules.

**Responsibilities:**
- MethodModule registry
- Module activation
- Module-specific schemas

**Key Models:**
- `MethodModule`

**Services:** `method_registry_service`

**API:** `/api/methods`

**Dependencies:** core

---

### `/app/analytics` — Analytics & Analytics

**Purpose:** Time distribution, trends, heatmaps.

**Responsibilities:**
- Time block aggregation
- Balance scores
- Weekly/monthly distribution

**Key Models:** None (uses TimeBlock, MetricEntry)

**Services:** `analytics_service`

**API:** `/api/analytics/time-distribution`, `/api/analytics/weekly-balance`, `/api/analytics/heatmap`

**Dependencies:** events, metrics

---

### `/app/insights` — Insight Engine

**Purpose:** Pattern detection and insight generation.

**Responsibilities:**
- Generate insights
- Trend, warning, imbalance, prediction
- Resolve insights

**Key Models:**
- `Insight`

**Services:** `insight_engine`, `insight_service`

**API:** `/api/insights`

**Dependencies:** metrics, events, analytics

---

### `/app/simulation` — Future Simulation

**Purpose:** Project future outcomes.

**Responsibilities:**
- Run simulations
- Scenario parameters
- Result storage

**Key Models:**
- `SimulationRun`

**Services:** `simulation_engine`

**API:** `/api/simulation`

**Dependencies:** metrics, events, strategies

---

### `/app/recommendations` — Decision Engine

**Purpose:** Recommend highest-impact next actions.

**Responsibilities:**
- Generate recommendations
- Rank by impact, effort, urgency
- Mark completed

**Key Models:**
- `Recommendation`, `ActionTemplate`

**Services:** `decision_engine`, `recommendation_service`

**API:** `/api/recommendations`

**Dependencies:** core, metrics, strategies, insights

---

### `/app/gamification` — Gamification

**Purpose:** XP, levels, quests, achievements.

**Responsibilities:**
- XP events
- Level-up logic
- Quest progress
- Achievement unlocking

**Key Models:**
- `XPEvent`, `AchievementDefinition`, `AchievementUnlock`, `Quest`

**Services:** `xp_service`, `achievement_engine`, `quest_service`

**API:** `/api/xp-events`, `/api/achievements`, `/api/quests`

**Dependencies:** core, events

---

### `/app/graph` — Knowledge Graph

**Purpose:** Life entity graph.

**Responsibilities:**
- Node/edge CRUD
- Graph queries
- Sync from events

**Key Models:**
- `GraphNode`, `GraphEdge`

**Services:** `graph_service`

**API:** `/api/graph`, `/api/graph/node/{id}`, `/api/graph/path`

**Dependencies:** events, core

---

### `/app/health` — Health & Illness

**Purpose:** Health tracking, symptoms, conditions, medications.

**Responsibilities:**
- Conditions, symptoms, medications
- Health protocols
- Symptom event generation

**Key Models:**
- `Condition`, `SymptomLog`, `Medication`, `MedicationLog`, `HealthProtocol`

**Services:** `health_service`, `symptom_service`

**API:** `/api/health/conditions`, `/api/health/symptoms`, `/api/health/medications`

**Dependencies:** core, events, metrics

---

### `/app/finance` — Finance System

**Purpose:** Income, expenses, accounts, budgets.

**Responsibilities:**
- Accounts, transactions
- Budget rules
- Investment positions
- Finance strategies

**Key Models:**
- `Account`, `Transaction`, `BudgetRule`, `InvestmentPosition`, `FinanceStrategy`

**Services:** `finance_service`, `transaction_service`

**API:** `/api/finance/accounts`, `/api/finance/transactions`, `/api/finance/budgets`

**Dependencies:** core, events

---

### `/app/relationships` — Relationships

**Purpose:** People and connection tracking.

**Responsibilities:**
- Relationship CRUD
- Last contact
- Contact events

**Key Models:**
- `Relationship`

**Services:** `relationship_service`

**API:** `/api/relationships`

**Dependencies:** core, events

---

### `/app/identity` — Identity

**Purpose:** Values, identity notes, self-concept.

**Responsibilities:**
- Identity notes
- Value inventories

**Key Models:** Uses `Note` (domain_id = identity)

**Services:** `identity_service`

**API:** `/api/identity` (or via notes)

**Dependencies:** core, assessments

---

### `/app/assessments` — Assessment Engine

**Purpose:** Generic assessments (questionnaires, scales).

**Responsibilities:**
- Assessment definitions
- Questions
- Responses
- Scoring

**Key Models:**
- `AssessmentDefinition`, `AssessmentQuestion`, `AssessmentResponse`

**Services:** `assessment_service`, `scoring_service`

**API:** `/api/assessments`, `/api/assessments/{id}/submit`

**Dependencies:** methods

---

### `/app/psychology` — Psychology Modules

**Submodules:** `big_five`, `cbt`, `dbt`, `shadow`

**Purpose:** Psychology-specific frameworks.

**Key Models:** `PersonalityProfile`, `ThoughtRecord`, `DBTDiaryEntry`, `ShadowWorkEntry`

**Services:** Per-module services

**API:** `/api/psychology/big-five`, `/api/psychology/cbt`, `/api/psychology/dbt`, `/api/psychology/shadow`

**Dependencies:** assessments, events, methods

---

### `/app/behaviors` — Self-Destructive / Maladaptive Behavior

**Purpose:** Track maladaptive patterns without judgment.

**Key Models:**
- `BehaviorPattern`, `BehaviorIncident`, `BehaviorLoopAnalysis`

**Services:** `behavior_service`, `loop_analysis_service`

**API:** `/api/behaviors/patterns`, `/api/behaviors/incidents`

**Dependencies:** events, insights

---

### `/app/shared` — Shared Utilities

**Purpose:** Shared schemas, utils, constants.

**Contents:** `schemas/`, `utils/`, `constants`

---

## 4. Core Database Schema

### Domain

```sql
domains
  id          UUID PK
  key         VARCHAR(50) UNIQUE  -- slug: health, wealth, skills, ...
  name        VARCHAR(100)
  description TEXT
  color       VARCHAR(7)
  icon        VARCHAR(50)
  layer       VARCHAR(50)   -- resource, activity, identity
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ
```

### DomainScore

```sql
domain_scores
  id          UUID PK
  domain_id   UUID FK domains  -- or domain_key VARCHAR for simplicity
  score       FLOAT
  level       INT
  xp          INT
  updated_at  TIMESTAMPTZ
```

### Goal

```sql
goals
  id            UUID PK
  domain_id     UUID FK domains
  title         VARCHAR(200)
  description   TEXT
  target_type   VARCHAR(50)   -- numeric, percentage, boolean
  target_value  FLOAT
  current_value FLOAT
  progress      FLOAT        -- computed or manual
  deadline      TIMESTAMPTZ
  status        VARCHAR(20)   -- active, completed, paused
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ
```

### Note

```sql
notes
  id          UUID PK
  domain_id   UUID FK domains NULLABLE  -- null = global
  title       VARCHAR(200)
  content     TEXT
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ
```

---

## 5. Event Engine Schema

### LifeEvent

```sql
life_events
  id          UUID PK
  event_type  VARCHAR(100)   -- workout_completed, migraine_episode, ...
  domain_id   UUID FK domains NULLABLE
  module_id   UUID FK method_modules NULLABLE
  title       VARCHAR(200)
  description TEXT
  occurred_at TIMESTAMPTZ
  source_type VARCHAR(50)    -- manual, time_block, symptom, ...
  source_id   VARCHAR(100)   -- polymorphic ID
  metadata    JSONB
  xp_awarded  FLOAT DEFAULT 0
  created_at  TIMESTAMPTZ
```

**Event types (examples):**
- `workout_completed`, `sleep_logged`, `meal_logged`
- `argument`, `conflict`, `reconciliation`
- `migraine_episode`, `panic_attack`, `symptom_flare`
- `income_recorded`, `overspending`, `savings`
- `study_session`, `networking_event`
- `relapse_event`, `urge_resisted`
- `achievement_unlocked`

---

## 6. Metrics Engine Schema

### MetricDefinition

```sql
metric_definitions
  id                      UUID PK
  domain_id               UUID FK domains NULLABLE
  module_id               UUID FK method_modules NULLABLE
  name                    VARCHAR(100)
  key                     VARCHAR(100) UNIQUE
  value_type              VARCHAR(20)   -- numeric, text, json, scale
  unit                    VARCHAR(50)
  direction_of_improvement VARCHAR(10)  -- up, down
  normalization_config    JSONB
  weight                  FLOAT
  created_at              TIMESTAMPTZ
```

### MetricEntry

```sql
metric_entries
  id          UUID PK
  metric_id   UUID FK metric_definitions
  value_numeric FLOAT NULLABLE
  value_text  TEXT NULLABLE
  value_json  JSONB NULLABLE
  recorded_at TIMESTAMPTZ
  source_type VARCHAR(50)
  source_id   VARCHAR(100)
  metadata    JSONB
  created_at  TIMESTAMPTZ
```

---

## 7. Method Module Framework

### MethodModule

```sql
method_modules
  id          UUID PK
  key         VARCHAR(50) UNIQUE  -- big_five, cbt, dbt, jung_shadow, ...
  name        VARCHAR(100)
  description TEXT
  category    VARCHAR(50)   -- psychology, health, finance, ...
  active      BOOLEAN
  config      JSONB
  created_at  TIMESTAMPTZ
```

**Module registry:**
- `big_five` — Personality assessment
- `cbt` — Cognitive behavioral therapy
- `dbt` — Dialectical behavior therapy
- `jung_shadow` — Shadow work
- `illness_tracking` — Health conditions
- `self_destructive_behavior` — Maladaptive patterns
- `nutrition_protocols` — Nutrition strategies
- `finance_strategies` — Financial frameworks

**Extension pattern:**
- Shared base: `LifeEvent`, `MetricDefinition`, `AssessmentDefinition`, `Strategy`
- Module-specific: `ThoughtRecord`, `DBTDiaryEntry`, `ShadowWorkEntry`
- `module_id` FK links to `method_modules`

---

## 8. Assessment System Schema

### AssessmentDefinition

```sql
assessment_definitions
  id            UUID PK
  module_id     UUID FK method_modules NULLABLE
  name          VARCHAR(200)
  key           VARCHAR(100)
  description   TEXT
  scoring_type  VARCHAR(50)   -- sum, average, factor_analysis, custom
  result_schema JSONB
  created_at    TIMESTAMPTZ
```

### AssessmentQuestion

```sql
assessment_questions
  id          UUID PK
  assessment_id UUID FK assessment_definitions
  prompt      TEXT
  input_type  VARCHAR(50)   -- likert, scale, text, choice
  order_index INT
  options_json JSONB
  scale_min   INT
  scale_max   INT
  created_at  TIMESTAMPTZ
```

### AssessmentResponse

```sql
assessment_responses
  id              UUID PK
  assessment_id   UUID FK assessment_definitions
  submitted_at    TIMESTAMPTZ
  raw_answers     JSONB
  computed_result JSONB
  score_summary   JSONB
  created_at      TIMESTAMPTZ
```

---

## 9. Psychology Module Design

### A. Big Five

```sql
personality_profiles
  id              UUID PK
  assessment_response_id UUID FK assessment_responses
  openness        FLOAT
  conscientiousness FLOAT
  extraversion    FLOAT
  agreeableness   FLOAT
  neuroticism     FLOAT
  interpretation  JSONB
  created_at      TIMESTAMPTZ
```

**Strategy adaptation:** Low conscientiousness → more structure; high neuroticism → more emotional regulation.

### B. CBT

```sql
thought_records
  id                UUID PK
  created_at        TIMESTAMPTZ
  situation         TEXT
  automatic_thought  TEXT
  emotion           VARCHAR(100)
  intensity         INT
  distortion_tags   JSONB
  alternative_thought TEXT
  outcome           TEXT
  linked_event_id   UUID NULLABLE
```

### C. DBT

```sql
dbt_diary_entries
  id          UUID PK
  created_at  TIMESTAMPTZ
  emotions    JSONB
  urges       JSONB
  behaviors   JSONB
  skills_used JSONB
  notes       TEXT
```

### D. Jung / Shadow

```sql
shadow_work_entries
  id                  UUID PK
  created_at          TIMESTAMPTZ
  trigger_description TEXT
  emotional_reaction  TEXT
  projected_trait     VARCHAR(100)
  rejected_trait     VARCHAR(100)
  integration_reflection TEXT
  linked_person_id    UUID NULLABLE
  linked_event_id     UUID NULLABLE
```

---

## 10. Health & Illness Schema

```sql
conditions
  id          UUID PK
  name        VARCHAR(200)
  category    VARCHAR(50)
  diagnosed_at TIMESTAMPTZ NULLABLE
  status      VARCHAR(50)
  notes       TEXT
  created_at  TIMESTAMPTZ

symptom_logs
  id          UUID PK
  condition_id UUID FK conditions NULLABLE
  symptom_name VARCHAR(100)
  severity    INT
  started_at  TIMESTAMPTZ
  ended_at    TIMESTAMPTZ NULLABLE
  triggers    JSONB
  notes       TEXT
  created_at  TIMESTAMPTZ

medications
  id          UUID PK
  name        VARCHAR(200)
  dosage      VARCHAR(100)
  schedule    VARCHAR(200)
  start_date  DATE
  end_date    DATE NULLABLE
  notes       TEXT
  created_at  TIMESTAMPTZ

medication_logs
  id          UUID PK
  medication_id UUID FK medications
  taken_at    TIMESTAMPTZ
  dosage_taken VARCHAR(100)
  notes       TEXT
  created_at  TIMESTAMPTZ

health_protocols
  id          UUID PK
  name        VARCHAR(200)
  description TEXT
  category    VARCHAR(50)
  rules_json  JSONB
  active      BOOLEAN
  created_at  TIMESTAMPTZ
```

---

## 11. Self-Destructive Behavior Schema

```sql
behavior_patterns
  id            UUID PK
  name          VARCHAR(200)
  category      VARCHAR(50)
  description   TEXT
  severity_model VARCHAR(50)
  active        BOOLEAN
  created_at    TIMESTAMPTZ

behavior_incidents
  id              UUID PK
  pattern_id      UUID FK behavior_patterns
  occurred_at     TIMESTAMPTZ
  trigger_context TEXT
  urge_intensity  INT
  action_taken    TEXT
  duration_minutes INT NULLABLE
  aftermath       TEXT
  notes           TEXT
  created_at      TIMESTAMPTZ

behavior_loop_analyses
  id                      UUID PK
  pattern_id              UUID FK behavior_patterns
  trigger_summary         TEXT
  common_contexts         JSONB
  common_emotions         JSONB
  common_outcomes         JSONB
  recommended_interventions JSONB
  updated_at              TIMESTAMPTZ
```

---

## 12. Finance Schema

```sql
accounts
  id          UUID PK
  name        VARCHAR(200)
  type        VARCHAR(50)
  currency    VARCHAR(3)
  balance     FLOAT
  institution VARCHAR(200) NULLABLE
  created_at  TIMESTAMPTZ

transactions
  id          UUID PK
  account_id  UUID FK accounts
  type        VARCHAR(50)
  category    VARCHAR(100)
  amount      FLOAT
  occurred_at TIMESTAMPTZ
  description TEXT
  metadata    JSONB
  created_at  TIMESTAMPTZ

budget_rules
  id          UUID PK
  name        VARCHAR(200)
  strategy_type VARCHAR(50)
  config      JSONB
  active      BOOLEAN
  created_at  TIMESTAMPTZ

investment_positions
  id            UUID PK
  asset_name    VARCHAR(200)
  asset_type    VARCHAR(50)
  units         FLOAT
  average_cost  FLOAT
  current_value FLOAT NULLABLE
  created_at    TIMESTAMPTZ

finance_strategies
  id          UUID PK
  name        VARCHAR(200)
  category    VARCHAR(50)
  description TEXT
  config      JSONB
  active      BOOLEAN
  created_at  TIMESTAMPTZ
```

---

## 13. Strategy Engine Schema

```sql
strategies
  id                UUID PK
  module_id         UUID FK method_modules NULLABLE
  domain_id         UUID FK domains NULLABLE
  name              VARCHAR(200)
  description       TEXT
  category          VARCHAR(50)
  difficulty        VARCHAR(20)
  estimated_impact  FLOAT
  active            BOOLEAN
  created_at        TIMESTAMPTZ

strategy_steps
  id                UUID PK
  strategy_id       UUID FK strategies
  title             VARCHAR(200)
  description       TEXT
  frequency         VARCHAR(100)
  target_metric_key VARCHAR(100) NULLABLE
  xp_reward         FLOAT
  order_index       INT
  created_at        TIMESTAMPTZ

user_strategies
  id                UUID PK
  strategy_id       UUID FK strategies
  started_at        TIMESTAMPTZ
  active            BOOLEAN
  adherence_score   FLOAT
  effectiveness_score FLOAT NULLABLE
  created_at        TIMESTAMPTZ
```

---

## 14. Insight Engine Schema

```sql
insights
  id          UUID PK
  type        VARCHAR(50)   -- trend, warning, imbalance, prediction, achievement, ...
  severity    VARCHAR(20)
  domain_id   UUID NULLABLE
  module_id   UUID NULLABLE
  title       VARCHAR(200)
  message     TEXT
  evidence    JSONB
  created_at  TIMESTAMPTZ
  resolved    BOOLEAN
```

---

## 15. Recommendation Schema

```sql
recommendations
  id              UUID PK
  domain_id       UUID NULLABLE
  module_id       UUID NULLABLE
  title           VARCHAR(200)
  description     TEXT
  reason          TEXT
  impact_score    FLOAT
  effort_score    FLOAT
  urgency_score   FLOAT
  confidence_score FLOAT
  created_at      TIMESTAMPTZ
  completed       BOOLEAN
```

---

## 16. Knowledge Graph Schema

```sql
graph_nodes
  id          UUID PK
  type        VARCHAR(50)   -- person, skill, experience, goal, ...
  name        VARCHAR(200)
  source_type VARCHAR(50) NULLABLE
  source_id   VARCHAR(100) NULLABLE
  metadata    JSONB
  created_at  TIMESTAMPTZ

graph_edges
  id              UUID PK
  source_node_id  UUID FK graph_nodes
  target_node_id  UUID FK graph_nodes
  relation_type   VARCHAR(100)
  metadata        JSONB
  created_at      TIMESTAMPTZ
```

---

## 17. Frontend Information Architecture

| Section | Purpose | Primary Widgets |
|---------|---------|-----------------|
| **Control Room** | Master dashboard | Life score, domain cards, alerts, recommendations, forecast, active strategies |
| **Domains** | Per-domain view | Score, metrics, goals, strategies, events |
| **Timeline** | Chronological events | Event list, filters (type, domain, date) |
| **Analytics** | Time & trends | Heatmap, distribution, balance charts |
| **Methods** | Module hub | Big Five, CBT, DBT, Shadow, Illness, Behaviors, Finance |
| **Strategies** | Strategy management | Active, recommended, available |
| **Simulation** | Future projection | Scenario controls, forecast charts |
| **Recommendations** | Next actions | Action list, complete |
| **Quests** | Active quests | Quests, progress |
| **Achievements** | Unlocked | Achievement grid |
| **Life Graph** | Entity graph | React Flow, nodes, edges |
| **Settings** | Configuration | Preferences, modules |

---

## 18. Control Room Aggregation

The Control Room aggregates:

- **Life score** — From core
- **Domain scores** — From core
- **Top risks** — From insights (severity high)
- **Top recommendations** — From decision engine
- **Symptom status** — From health (recent symptom logs)
- **Active strategies** — From strategies
- **Maladaptive loop alerts** — From behaviors
- **Finance status** — From finance (balance, budget)
- **Future forecast** — From simulation
- **Active quests** — From gamification
- **Recent achievements** — From gamification
- **Recent timeline events** — From events

---

## 19. API Route Map

| Route Group | Key Endpoints |
|-------------|---------------|
| `/api/domains` | GET, GET /{id}, GET /{slug}/summary |
| `/api/metrics` | GET, POST, GET /{id}/entries, POST entries |
| `/api/events` | GET, POST, GET /timeline |
| `/api/goals` | GET, POST, PATCH, DELETE |
| `/api/notes` | GET, POST, PATCH, DELETE |
| `/api/methods` | GET, GET /{key} |
| `/api/assessments` | GET, GET /{id}, POST /{id}/submit |
| `/api/psychology/big-five` | GET profile, POST assessment |
| `/api/psychology/cbt` | GET thought-records, POST |
| `/api/psychology/dbt` | GET diary-entries, POST |
| `/api/psychology/shadow` | GET entries, POST |
| `/api/health/conditions` | CRUD |
| `/api/health/symptoms` | CRUD, GET trends |
| `/api/health/medications` | CRUD, GET logs |
| `/api/behaviors/patterns` | CRUD |
| `/api/behaviors/incidents` | POST, GET |
| `/api/finance/accounts` | CRUD |
| `/api/finance/transactions` | CRUD, GET by date |
| `/api/finance/budgets` | CRUD |
| `/api/strategies` | GET, GET /recommended, GET /active, POST /activate |
| `/api/insights` | GET, PATCH /{id}/resolve |
| `/api/recommendations` | GET, PATCH /{id}/complete |
| `/api/simulation` | POST /run, GET /runs |
| `/api/quests` | GET, POST, PATCH /{id}/complete |
| `/api/achievements` | GET |
| `/api/graph` | GET, GET /node/{id}, POST /node, POST /edge |
| `/api/control-room` | GET /full, GET /summary |

---

## 20. Implementation Phases

### Phase 1 — MVP (Foundation)

| Order | Component | Effort |
|-------|-----------|--------|
| 1 | Core (Domain, DomainScore, Goal, Note) | 1 |
| 2 | Event Engine (LifeEvent) | 1 |
| 3 | Metrics Engine | 1 |
| 4 | Timeline (aggregate events) | 0.5 |
| 5 | XP & Scoring | 0.5 |
| 6 | Time Block | 0.5 |
| 7 | Control Room (basic) | 1 |
| 8 | Domain pages | 0.5 |
| 9 | Analytics (time distribution) | 0.5 |
| 10 | Strategy Engine (basic) | 1 |
| 11 | Recommendations (basic) | 0.5 |
| 12 | Quests & Achievements | 1 |
| 13 | Life Graph (basic) | 1 |
| 14 | Simulation (basic) | 0.5 |
| 15 | Insights (basic) | 0.5 |

**MVP delivers:** Life tracking, domains, timeline, strategies, recommendations, gamification, control room, graph, simulation.

### Phase 2 — Advanced Methods

| Order | Component | Effort |
|-------|-----------|--------|
| 1 | Method Module framework | 1 |
| 2 | Assessment Engine | 1 |
| 3 | Big Five module | 1 |
| 4 | CBT module | 1 |
| 5 | DBT module | 1 |
| 6 | Shadow Work module | 1 |
| 7 | Health module (conditions, symptoms) | 1 |
| 8 | Behavior module | 1 |
| 9 | Finance module (basic) | 1 |

### Phase 3 — Intelligence & Polish

| Order | Component | Effort |
|-------|-----------|--------|
| 1 | Insight engine (advanced) | 1 |
| 2 | Recommendation engine (advanced) | 1 |
| 3 | Simulation (advanced) | 1 |
| 4 | Loop analysis | 1 |
| 5 | Finance (advanced) | 1 |
| 6 | Medication tracking | 0.5 |
| 7 | Control Room (full aggregation) | 1 |
| 8 | Frontend polish | 1 |

---

## JSONB vs Strict Tables

| Use Case | JSONB | Strict Table |
|----------|-------|--------------|
| Event metadata | ✓ | |
| Metric normalization config | ✓ | |
| Assessment options | ✓ | |
| Module config | ✓ | |
| Evidence in insights | ✓ | |
| Simulation results | ✓ | |
| DBT emotions/urges | ✓ | |
| Thought record distortion tags | ✓ | |
| Core entities (Domain, Goal) | | ✓ |
| Metric values | | ✓ (value_numeric, text, json) |
| Assessment responses | | ✓ (raw_answers JSONB, computed separate) |
| Graph node metadata | ✓ | |

---

## Summary

- **Life Core** — Domain, DomainScore, Goal, Note
- **Event Engine** — LifeEvent as central hub
- **Metrics Engine** — Generic, extensible
- **Method Modules** — Pluggable (Big Five, CBT, DBT, Shadow, etc.)
- **Strategy Engine** — Universal, module-aware
- **Insight / Recommendation / Simulation** — Intelligence layer
- **Knowledge Graph** — Connects entities
- **Incremental build** — MVP → Methods → Intelligence
