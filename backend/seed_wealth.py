"""Seed wealth domain: budget categories (50/30/20)."""
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import BudgetCategory

BUDGET_CATEGORIES = [
    ("needs", "Needs", 50.0, 1),
    ("wants", "Wants", 30.0, 2),
    ("savings", "Savings", 20.0, 3),
]


def seed_budget_categories(db):
    for key, label, pct, order in BUDGET_CATEGORIES:
        if db.query(BudgetCategory).filter(BudgetCategory.key == key).first():
            continue
        db.add(
            BudgetCategory(
                id=uuid.uuid4(),
                key=key,
                label=label,
                target_percentage=pct,
                display_order=order,
            )
        )
    db.commit()
    print("Budget categories seeded.")


def main():
    db = SessionLocal()
    try:
        seed_budget_categories(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
