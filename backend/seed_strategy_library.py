"""
Seed Strategy Library - evidence-based strategies for all life domains.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models import StrategyLibraryItem, StrategyProtocol, ProtocolStep


def seed_strategy_library():
    db = SessionLocal()

    strategies_data = [
        # === HEALTH ===
        ("health", None, "Sleep Stabilization", "foundational", "high", "high", "medium",
         "Consistent sleep schedule and sleep hygiene. Evidence-based foundation for energy and cognition.",
         "When sleep is irregular, energy is low, or cognitive performance suffers.",
         None),
        ("health", None, "Regular Exercise", "foundational", "high", "high", "medium",
         "150+ min/week moderate aerobic activity. Strong evidence for physical and mental health.",
         "When sedentary or energy/mood need improvement.",
         "Acute illness, injury, or medical contraindication."),
        ("health", None, "Strength Training", "foundational", "high", "high", "medium",
         "2-3x/week resistance training. Proven for muscle, bone, metabolism.",
         "When building strength, preventing sarcopenia, or improving body composition.",
         None),
        ("health", None, "Daily Movement", "foundational", "high", "medium", "easy",
         "Reduce sedentary time; aim for 7-10k steps. Low barrier, high cumulative benefit.",
         "When sitting most of the day or activity is low.",
         None),
        ("health", None, "Healthy Dietary Pattern", "foundational", "high", "high", "medium",
         "Whole foods, adequate protein, vegetables, minimal ultra-processed. Broad evidence base.",
         "When diet quality is poor or energy/nutrition needs improvement.",
         "Eating disorders; work with professional."),
        ("health", None, "Symptom Tracking", "foundational", "moderate", "medium", "easy",
         "Log symptoms to identify patterns and triggers.",
         "When symptoms are recurrent or unclear in cause.",
         None),
        ("health", None, "Medication Adherence Tracking", "foundational", "high", "high", "easy",
         "Track medication intake to improve adherence.",
         "When prescribed medications and adherence is a concern.",
         None),
        ("health", None, "Sleep Recovery Protocol", "targeted", "high", "high", "medium",
         "Structured protocol to restore sleep after disruption.",
         "After travel, illness, or acute sleep debt.",
         None),
        ("health", None, "Fatigue Protocol", "targeted", "moderate", "high", "medium",
         "Address fatigue through sleep, activity, and energy management.",
         "When fatigue is persistent and impacting function.",
         "Rule out medical causes first."),
        ("health", None, "Migraine Trigger Logging", "targeted", "moderate", "medium", "easy",
         "Track potential triggers to identify patterns.",
         "When migraines are recurrent.",
         None),
        ("health", None, "Mood and Energy Stabilization", "targeted", "moderate", "high", "medium",
         "Routine-based approach to stabilize mood and energy.",
         "When mood or energy fluctuate significantly.",
         "Clinical depression/anxiety—seek professional care."),
        ("health", "nutrition_protocols", "Nutrition Adherence Tracking", "targeted", "moderate", "medium", "easy",
         "Track adherence to dietary goals.",
         "When working on nutrition changes.",
         None),
        # === WEALTH ===
        ("wealth", None, "Spending Awareness", "foundational", "high", "high", "easy",
         "Track spending to build awareness. Foundation for all financial decisions.",
         "When spending is unclear or savings goals exist.",
         None),
        ("wealth", None, "Budgeting Protocol", "foundational", "high", "high", "medium",
         "Structured budget: needs, wants, savings. Evidence-based personal finance.",
         "When income/expenses need structure.",
         None),
        ("wealth", None, "Emergency Fund Building", "foundational", "high", "high", "medium",
         "Build 3-6 months expenses in liquid savings.",
         "When no emergency fund or it is inadequate.",
         None),
        ("wealth", None, "Savings Automation", "foundational", "high", "high", "easy",
         "Automate transfers to savings. Pay yourself first.",
         "When savings are inconsistent.",
         None),
        ("wealth", None, "Diversification Basics", "foundational", "high", "medium", "medium",
         "Basic asset allocation and diversification principles.",
         "When investing without a plan.",
         None),
        ("wealth", "finance_strategies", "Debt Reduction Plan", "targeted", "high", "high", "medium",
         "Structured debt payoff (avalanche or snowball).",
         "When carrying high-interest debt.",
         None),
        ("wealth", "finance_strategies", "Impulsive Spending Control", "targeted", "moderate", "high", "medium",
         "Identify triggers and implement cooling-off periods.",
         "When impulsive spending undermines goals.",
         None),
        ("wealth", "finance_strategies", "Inconsistent Income Stabilization", "targeted", "moderate", "high", "hard",
         "Buffer and smoothing for variable income.",
         "When income is irregular (freelance, commission).",
         None),
        ("wealth", "finance_strategies", "Business Cash Reserve Plan", "targeted", "moderate", "high", "medium",
         "Build and maintain business cash reserves.",
         "When running a business with variable cash flow.",
         None),
        # === SKILLS / CAREER ===
        ("skills", None, "Deep Work", "foundational", "high", "high", "hard",
         "Cal Newport's framework: uninterrupted focused blocks for high-value work.",
         "When shallow work dominates and output suffers.",
         None),
        ("skills", None, "Deliberate Practice", "foundational", "high", "high", "medium",
         "Anders Ericsson's method: targeted practice with feedback.",
         "When skill improvement has plateaued.",
         None),
        ("skills", None, "Weekly Shipping Cadence", "foundational", "moderate", "high", "medium",
         "Ship something valuable every week. Builds momentum and feedback loops.",
         "When projects stall or output is inconsistent.",
         None),
        ("skills", None, "Project-Based Learning", "foundational", "high", "high", "medium",
         "Learn by doing real projects, not just consuming.",
         "When learning feels theoretical or disconnected.",
         None),
        ("skills", None, "Feedback Loop System", "foundational", "high", "high", "medium",
         "Structured feedback collection and integration.",
         "When improvement is unclear or feedback is scarce.",
         None),
        ("career", None, "Reputation Building", "foundational", "moderate", "high", "medium",
         "Consistent delivery and visibility to build professional reputation.",
         "When career advancement or opportunities are limited.",
         None),
        ("career", None, "Leverage Building", "foundational", "moderate", "high", "hard",
         "Build systems, delegation, and leverage for impact.",
         "When capacity is maxed and impact is capped.",
         None),
        # === RELATIONSHIPS / NETWORK ===
        ("relationships", None, "Recurring Contact Rituals", "foundational", "moderate", "high", "easy",
         "Scheduled check-ins with important people.",
         "When relationships drift due to neglect.",
         None),
        ("relationships", None, "Relationship Maintenance", "foundational", "moderate", "high", "medium",
         "Intentional maintenance of key relationships.",
         "When relationships need more attention.",
         None),
        ("relationships", None, "Conflict Repair", "targeted", "moderate", "high", "hard",
         "Structured approach to repair after conflict.",
         "When conflict has damaged a relationship.",
         None),
        ("relationships", None, "Meaningful Conversation Prompts", "exploratory", "moderate", "medium", "easy",
         "Use prompts to deepen conversations.",
         "When conversations feel superficial.",
         None),
        ("network", None, "Social Expansion Protocol", "foundational", "moderate", "medium", "medium",
         "Expand network intentionally in target areas.",
         "When network is limited or homogeneous.",
         None),
        ("network", None, "Mentorship and Collaboration Strategy", "foundational", "moderate", "high", "medium",
         "Seek mentors and collaborative opportunities.",
         "When growth would benefit from guidance.",
         None),
        # === IDENTITY / PSYCHOLOGY ===
        ("identity", "big_five", "Big Five Adaptation", "foundational", "moderate", "medium", "medium",
         "Adapt strategies to personality traits (e.g., low C → more structure).",
         "When default approaches don't fit personality.",
         None),
        ("identity", "cbt", "CBT Thought Restructuring", "foundational", "high", "high", "medium",
         "Identify and restructure unhelpful thoughts. Evidence-based.",
         "When negative thoughts drive distress.",
         "Clinical disorders—use with professional."),
        ("identity", "dbt", "DBT Emotional Regulation", "foundational", "high", "high", "medium",
         "Skills for emotion regulation and distress tolerance.",
         "When emotions are overwhelming or dysregulated.",
         "Clinical—use with professional when indicated."),
        ("identity", "cbt", "Thought Record Routine", "targeted", "high", "high", "easy",
         "Regular thought records to catch cognitive distortions.",
         "When automatic thoughts are problematic.",
         None),
        ("identity", "cbt", "Cognitive Distortion Review", "targeted", "high", "medium", "easy",
         "Review common distortions and apply to own thinking.",
         "When patterns of distortion are identified.",
         None),
        ("identity", "cbt", "Behavioral Experiment", "targeted", "high", "high", "medium",
         "Test beliefs through planned experiments.",
         "When beliefs need behavioral testing.",
         None),
        ("identity", "dbt", "Distress Tolerance Plan", "targeted", "high", "high", "medium",
         "Crisis survival and distress tolerance skills.",
         "When acute distress is overwhelming.",
         None),
        ("identity", "dbt", "Emotion Regulation Routine", "targeted", "high", "high", "medium",
         "Daily practices for emotion regulation.",
         "When emotions are chronically dysregulated.",
         None),
        ("identity", "dbt", "Interpersonal Effectiveness Practice", "targeted", "high", "high", "medium",
         "DEAR MAN, GIVE, FAST skills practice.",
         "When relationships suffer from communication.",
         None),
        ("identity", "jung_shadow", "Shadow Reflection", "exploratory", "reflective", "medium", "hard",
         "Reflect on disowned parts of self. Reflective framework.",
         "When integration or self-understanding is a goal.",
         "Not first-line for acute distress."),
        ("identity", "jung_shadow", "Trigger Reflection", "exploratory", "reflective", "medium", "medium",
         "Explore what triggers strong reactions.",
         "When triggers recur and warrant understanding.",
         None),
        ("identity", "jung_shadow", "Projection Journal", "exploratory", "reflective", "low", "medium",
         "Track projections onto others.",
         "When projection patterns are of interest.",
         None),
        ("identity", "jung_shadow", "Persona/Shadow Mapping", "exploratory", "reflective", "medium", "hard",
         "Map persona and shadow elements.",
         "When doing deeper identity work.",
         None),
        ("identity", None, "Values Clarification", "foundational", "moderate", "high", "medium",
         "Clarify core values for decision alignment.",
         "When decisions feel misaligned or unclear.",
         None),
        ("identity", None, "Persona Alignment", "exploratory", "reflective", "medium", "medium",
         "Align outward presentation with inner self.",
         "When persona feels inauthentic.",
         None),
        # === EXPERIENCES ===
        ("experiences", None, "Experience Logging", "foundational", "moderate", "medium", "easy",
         "Log meaningful experiences for reflection.",
         "When life feels routine or unmemorable.",
         None),
        ("experiences", None, "Novelty Seeking Protocol", "exploratory", "moderate", "medium", "medium",
         "Intentional exposure to new experiences.",
         "When life feels stagnant.",
         None),
    ]

    try:
        for (
            domain_key, module_key, name, category, evidence_level, impact_level, difficulty_level,
            description, when_to_use, contraindications,
        ) in strategies_data:
            if db.query(StrategyLibraryItem).filter(
                StrategyLibraryItem.domain_key == domain_key,
                StrategyLibraryItem.name == name,
            ).first():
                continue

            item = StrategyLibraryItem(
                domain_key=domain_key,
                module_key=module_key,
                name=name,
                category=category,
                evidence_level=evidence_level,
                impact_level=impact_level,
                difficulty_level=difficulty_level,
                description=description,
                when_to_use=when_to_use,
                contraindications=contraindications,
                active=True,
            )
            db.add(item)
            db.flush()

            # Add default protocol with basic steps
            protocol = StrategyProtocol(
                strategy_id=item.id,
                name=f"{name} Protocol",
                cadence="daily",
                duration_days=30,
                instructions_json={"overview": description},
            )
            db.add(protocol)
            db.flush()

            # Add 2-3 default steps
            step_titles = {
                "Sleep Stabilization": [
                    ("Set consistent wake time", "Wake at same time daily", "daily", 10),
                    ("Wind-down routine", "30 min before bed, no screens", "daily", 10),
                ],
                "Regular Exercise": [
                    ("Schedule workouts", "Block 3-5 sessions per week", "weekly", 15),
                    ("Track completion", "Log each session", "per session", 5),
                ],
                "Deep Work": [
                    ("Block 4-hour focus", "No interruptions", "3-4 per week", 25),
                    ("Ritualize start", "Same routine each block", "per block", 5),
                ],
                "Spending Awareness": [
                    ("Log all spending", "Track every expense", "daily", 10),
                    ("Weekly review", "Categorize and reflect", "weekly", 15),
                ],
                "Recurring Contact Rituals": [
                    ("List key people", "Identify 5-10 to maintain", "one-time", 5),
                    ("Schedule check-ins", "Weekly or biweekly cadence", "weekly", 15),
                ],
            }

            steps_data = step_titles.get(name, [
                ("Step 1: Start", "Begin the protocol", "daily", 10),
                ("Step 2: Track", "Log progress", "daily", 5),
            ])

            for i, (title, desc, freq, xp) in enumerate(steps_data):
                db.add(ProtocolStep(
                    protocol_id=protocol.id,
                    order_index=i,
                    title=title,
                    description=desc,
                    frequency=freq,
                    xp_reward=xp,
                ))

        db.commit()
        print("Strategy library seed completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_strategy_library()
