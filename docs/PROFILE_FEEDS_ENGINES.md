# How Profile Data Feeds Other Engines

The Personal Profile and Life Configuration data is designed to influence the rest of Life OS. This document describes how each engine should consume profile data.

## 1. Strategy recommendations

- **Strategy selection engine** (`strategy_selection_engine`, `strategy_library_service`): Use `StrategyPreferenceProfile` (strict vs flexible, science_backed, exploratory_reflective, recommendation_style, domain_priorities) to rank and filter strategies. Use `PsychologyProfile.big_five` (e.g. high neuroticism → prioritize emotional regulation, lower-friction systems). Use `HealthProfile` (sleep_issues, energy_issues) to prefer sleep/stabilization protocols when relevant.
- **Control room / recommendations**: When suggesting protocols, filter or rank by `domain_priorities` and `recommendation_style` (challenging vs gentle).

## 2. Simulations

- **Life simulation engine** (`life_simulation_engine`, `life_state_builder`): Use `PersonProfile.timezone`, `LifestyleProfile.usual_sleep_schedule`, `CareerProfile.work_style` and `schedule_constraints` to refine time allocation and baseline rates. Use `HealthProfile` and `FinanceProfile` to set initial metric trends or constraints (e.g. debt payoff vs savings) when projecting.

## 3. Insight engine

- **Insight engine** (`insight_engine`): Use `PsychologyProfile` (stress_patterns, mood_patterns, emotional_triggers) and `HealthProfile` (conditions, sleep_issues) to generate contextual insights (e.g. “When stress is high, consider…”). Use `IdentityProfile.values` and `purpose` to surface value-aligned insights.

## 4. Decision / recommendations engine

- **Recommendations service**: Use `FinanceProfile` (debts, emergency_fund_target, risk_tolerance) to prioritize “emergency fund” or “budgeting” recommendations when debt is present or income is variable. Use `RelationshipProfile.relationship_goals` and `relationship_stressors` for relationship-domain suggestions.

## 5. Dashboard priorities

- **Dashboard / control room**: Use `StrategyPreferenceProfile.domain_priorities` to order or weight domain cards and widgets. Use `PersonProfile.preferred_name` in greetings.

## 6. Quests and gamification

- **Quests / achievements**: Use `StrategyPreferenceProfile.wants_gamification` and `wants_reminders` to turn on or soften gamification and reminders. Use `domain_priorities` to suggest quests in preferred domains first.

## 7. Risk alerts

- **Alerts / control room**: Use `HealthProfile` (allergies, medications, conditions) and `FinanceProfile` (debts, emergency fund) to trigger or prioritize risk-related alerts (e.g. “Low emergency fund” when profile indicates debt or unstable income).

## 8. Protocol suggestions

- **Strategy library / protocol suggestions**: Use `PsychologyProfile.therapy_methods_interest`, `cbt_preferences`, `dbt_preferences` to recommend CBT/DBT or reflective protocols. Use `HealthProfile.sleep_issues` and `energy_issues` to prioritize sleep and energy protocols in health domain.

## Implementation notes

- Profile APIs are under `/api/profile/*` (GET/PATCH per section). All profile reads should go through these endpoints or a shared **profile context** that caches hub and section data.
- New engines should accept an optional **profile context** (or user_id and fetch profile) and use it for personalization rather than hard-coding assumptions.
- Onboarding (future) should collect: basic identity → domain priorities → health basics → finance basics → psychology basics → strategy preferences, and then allow progressive setup of deeper fields later.
