# Human Body Intelligence System

Health domain feature: track health at body system and organ level.

## Database schema

- **body_systems** — id (UUID), slug, name, description, display_order
- **organs** — id (UUID), system_id (FK), slug, name, description, functions (JSONB), nutrition_requirements (JSONB), movement_requirements (JSONB), sleep_requirements (JSONB), signals (JSONB), symptoms (JSONB), metric_keys (JSONB), display_order, map_region_id
- **organ_health_scores** — id (UUID), user_id (FK), organ_id (FK), score (0–100), factors (JSONB), computed_at
- **nutrients** — id (UUID), slug, name, category (vitamin|mineral|macronutrient|fatty_acid), unit, description
- **movement_types** — id (UUID), slug, name, description
- **symptoms** — id (UUID), slug, name, description, stage (early_warning|moderate|severe)
- **organ_nutrients** — organ_id (FK), nutrient_id (FK), importance (critical|important|supportive), notes
- **organ_movements** — organ_id (FK), movement_type_id (FK), importance
- **organ_symptoms** — organ_id (FK), symptom_id (FK), stage

## Organ taxonomy

- **Body systems**: Cardiovascular, Nervous, Digestive, Endocrine, Musculoskeletal, Respiratory, Immune, Lymphatic, Integumentary, Reproductive.
- **Organs** per system (see `backend/seed_body_intelligence.py`): heart, blood_vessels; brain, spinal_cord; stomach, liver, pancreas, intestines; thyroid, adrenals; muscles, joints, bones; lungs; immune_system; lymph_nodes; skin; reproductive_organs.

## Nutrition / movement mapping

- Stored on each organ as `nutrition_requirements` and `movement_requirements` (e.g. omega3, magnesium, cardio, walking).
- Health score engine compares user profile (supplements, exercise_habits) to these lists.

## Health score algorithm

Weighted composite (0–100):

- **Nutrition** (25%): overlap of user supplements vs organ nutrition_requirements.
- **Sleep** (20%): penalty if user has sleep_issues and organ has sleep_requirements.
- **Movement** (20%): overlap of user exercise_habits / movement_habits vs organ movement_requirements.
- **Symptoms** (25%): penalty when user profile symptoms match organ signals/symptoms; digestive/energy issues map to relevant systems.
- **Metrics** (10%): health-domain metric_definitions matching organ metric_keys; latest entry value (0–100 scale).

## Body map UI

- **Route**: `/app/health/body-map`.
- Stylized body silhouette with clickable organ regions (map_region_id); list of all organs below.
- Glow color by score: green ≥75, yellow ≥50, red <50.

## Organ dashboard

- **Route**: `/app/health/organ/:slug`.
- Shows: organ health score, nutrition needs, movement needs, sleep support, risk signals/symptoms, functions, tracked metrics.

## API

- `GET /api/body-intelligence/body-systems` — list systems
- `GET /api/body-intelligence/body-systems/{id}/organs` — organs by system
- `GET /api/body-intelligence/organs` — all organs for map
- `GET /api/body-intelligence/organs/by-slug/{slug}` — one organ
- `GET /api/body-intelligence/organs/by-slug/{slug}/dashboard` — dashboard (personalized score when authenticated)

## AI integration (placeholder)

- `OrganDashboardResponse.ai_insights` is reserved for future AI-generated insights (organ stress, nutritional gaps, movement deficiencies, risk patterns) using diet, exercise, sleep, symptoms, supplements, medications.
