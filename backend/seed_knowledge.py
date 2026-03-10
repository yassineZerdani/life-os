"""Seed Knowledge / Learn categories and sample content."""
import sys
sys.path.insert(0, sys.path[0] if __name__ == "__main__" else "")

from app.db.session import SessionLocal
from app.models import KnowledgeCategory, KnowledgeArticle

CATEGORIES = [
    ("health", "Health", "Evidence-based health protocols, sleep, exercise, and nutrition.", "HeartOutlined"),
    ("psychology", "Psychology", "Psychology frameworks: CBT, DBT, Big Five, and more.", "BulbOutlined"),
    ("finance", "Finance", "Personal finance methods, budgeting, and wealth building.", "DollarOutlined"),
    ("skills-productivity", "Skills & Productivity", "Deep work, systems, and productivity.", "RocketOutlined"),
    ("relationships", "Relationships", "Relationship science and communication.", "TeamOutlined"),
    ("identity-philosophy", "Identity & Philosophy", "Values, identity, and meaning.", "SmileOutlined"),
    ("behavior-habits", "Behavior & Habits", "Behavioral science and habit formation.", "ExperimentOutlined"),
]


def seed_knowledge():
    db = SessionLocal()
    try:
        for key, name, desc, icon in CATEGORIES:
            if not db.query(KnowledgeCategory).filter(KnowledgeCategory.key == key).first():
                db.add(KnowledgeCategory(key=key, name=name, description=desc, icon=icon))
        db.commit()

        cat = db.query(KnowledgeCategory).filter(KnowledgeCategory.key == "psychology").first()
        if cat and not db.query(KnowledgeArticle).filter(KnowledgeArticle.slug == "cognitive-distortions").first():
            db.add(KnowledgeArticle(
                category_id=cat.id,
                slug="cognitive-distortions",
                title="Cognitive Distortions",
                subtitle="How unhelpful thinking patterns affect mood and behavior.",
                summary="Learn to recognize common cognitive distortions from CBT and how to challenge them with evidence and balanced thinking.",
                content_markdown="""## What are cognitive distortions?

Cognitive distortions are biased or irrational ways of thinking that can worsen mood and behavior. In **cognitive behavioral therapy (CBT)**, identifying and challenging these patterns is a core skill.

## Common distortions

- **All-or-nothing thinking** — Seeing things in black and white.
- **Overgeneralization** — Taking one event and applying it broadly.
- **Mental filter** — Focusing only on negative details.
- **Jumping to conclusions** — Mind-reading or fortune-telling.
- **Emotional reasoning** — "I feel it, so it must be true."
- **Should statements** — Rigid rules about how you or others "should" be.

## What you can do

1. **Notice** when your mood drops and ask: "What thought just went through my mind?"
2. **Name** the distortion.
3. **Challenge** with evidence and reframe into a more balanced thought.

## Related strategy

Try the **CBT Thought Record** in the Strategy Library to practice.
""",
                difficulty_level="beginner",
                evidence_level="high",
                reading_time_minutes=5,
            ))
            db.commit()
        print("Knowledge / Learn seed completed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_knowledge()
