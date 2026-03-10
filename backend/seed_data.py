"""Seed script for Life OS database.
   Only essential bootstrap data - no mock/demo data for new users.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import (
    Domain, DomainScore, ActionTemplate, AchievementDefinition,
)


DOMAIN_SLUGS = [
    "health", "wealth", "skills", "network",
    "career", "relationships", "experiences", "identity",
]

DOMAINS = [
    {"slug": "health", "name": "Health", "layer": "resource", "icon": "HeartOutlined"},
    {"slug": "wealth", "name": "Wealth", "layer": "resource", "icon": "DollarOutlined"},
    {"slug": "skills", "name": "Skills", "layer": "resource", "icon": "BookOutlined"},
    {"slug": "network", "name": "Network", "layer": "resource", "icon": "TeamOutlined"},
    {"slug": "career", "name": "Career", "layer": "activity", "icon": "TrophyOutlined"},
    {"slug": "relationships", "name": "Relationships", "layer": "activity", "icon": "UserOutlined"},
    {"slug": "experiences", "name": "Experiences", "layer": "activity", "icon": "CompassOutlined"},
    {"slug": "identity", "name": "Identity", "layer": "identity", "icon": "SmileOutlined"},
]


def seed():
    db = SessionLocal()

    try:
        # Domains (required for app structure)
        for d in DOMAINS:
            if not db.query(Domain).filter(Domain.slug == d["slug"]).first():
                db.add(Domain(**d))
        db.commit()

        # DomainScore (one per domain, start empty)
        for slug in DOMAIN_SLUGS:
            if not db.query(DomainScore).filter(DomainScore.domain == slug).first():
                db.add(DomainScore(domain=slug, score=0, level=1, xp=0))
        db.commit()

        # Achievement definitions (templates for gamification - not user data)
        achievement_defs = [
            ("First Workout", "Complete your first workout", "health", 100, "workout_count >= 1"),
            ("50 Workouts Completed", "Reach 50 total workouts", "health", 200, "workout_count >= 50"),
            ("100 Hours Learning", "Log 100 hours of learning", "skills", 250, "learning_hours >= 100"),
            ("First $10k Saved", "Reach $10k in savings", "wealth", 150, "saving_amount >= 10000"),
            ("Reach Level 5 Skills", "Level up skills domain to 5", "skills", 300, "domain_level.skills >= 5"),
            ("Reach Level 5 Health", "Level up health domain to 5", "health", 300, "domain_level.health >= 5"),
        ]
        for title, desc, domain, xp, cond in achievement_defs:
            if not db.query(AchievementDefinition).filter(AchievementDefinition.title == title).first():
                db.add(AchievementDefinition(
                    title=title,
                    description=desc,
                    domain=domain,
                    xp_reward=xp,
                    condition_expression=cond,
                ))
        db.commit()

        # Action templates (for recommendations engine - not user data)
        action_templates_data = [
            ("Workout", "health", "Gym session or exercise", 40, 2, 60),
            ("Study 1 hour", "skills", "Focused learning session", 25, 1, 60),
            ("Call a friend", "relationships", "Meaningful conversation", 30, 2, 30),
            ("Morning run", "health", "30 min cardio", 40, 2, 30),
            ("Save money", "wealth", "Transfer to savings", 20, 1, 15),
            ("Networking event", "network", "Professional meetup", 30, 2, 90),
            ("Read 30 min", "skills", "Book or article", 15, 1, 30),
            ("Family dinner", "relationships", "Quality time with family", 30, 2, 60),
            ("Meditation", "identity", "Mindfulness practice", 15, 1, 20),
            ("Travel experience", "experiences", "New place or activity", 40, 3, 120),
        ]
        for title, domain, desc, xp, impact, mins in action_templates_data:
            if not db.query(ActionTemplate).filter(
                ActionTemplate.title == title, ActionTemplate.domain == domain
            ).first():
                db.add(ActionTemplate(
                    title=title,
                    domain=domain,
                    description=desc,
                    xp_reward=xp,
                    estimated_score_impact=impact,
                    time_cost_minutes=mins,
                ))
        db.commit()

        # Strategy library (evidence-based strategies and protocols)
        from seed_strategy_library import seed_strategy_library as seed_strategies
        seed_strategies()

        # Knowledge / Learn categories and sample article
        from seed_knowledge import seed_knowledge as seed_learn
        seed_learn()

        print("Seed completed successfully! (Essential data only - no mock data)")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
