"""Seed Human Body Intelligence: body systems and organs with taxonomy."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.body_intelligence import BodySystem, Organ

# Body systems in display order
BODY_SYSTEMS = [
    {"slug": "cardiovascular", "name": "Cardiovascular", "description": "Heart and blood vessels", "display_order": 1},
    {"slug": "nervous", "name": "Nervous", "description": "Brain, spinal cord, nerves", "display_order": 2},
    {"slug": "digestive", "name": "Digestive", "description": "Digestion and nutrient absorption", "display_order": 3},
    {"slug": "endocrine", "name": "Endocrine", "description": "Hormones and metabolism", "display_order": 4},
    {"slug": "musculoskeletal", "name": "Musculoskeletal", "description": "Muscles, bones, joints", "display_order": 5},
    {"slug": "respiratory", "name": "Respiratory", "description": "Lungs and airways", "display_order": 6},
    {"slug": "immune", "name": "Immune", "description": "Immune defense", "display_order": 7},
    {"slug": "lymphatic", "name": "Lymphatic", "description": "Lymph and immune support", "display_order": 8},
    {"slug": "integumentary", "name": "Integumentary", "description": "Skin, hair, nails", "display_order": 9},
    {"slug": "reproductive", "name": "Reproductive", "description": "Reproductive organs", "display_order": 10},
]

# Organs per system: slug, name, description, functions, nutrition_requirements, movement_requirements,
# sleep_requirements, signals, symptoms, metric_keys, map_region_id
ORGANS_TAXONOMY = {
    "cardiovascular": [
        ("heart", "Heart", "Pumps blood through the body", ["pump blood", "regulate circulation"],
         ["omega3", "magnesium", "potassium", "coq10", "b_vitamins", "antioxidants"],
         ["cardio", "walking", "breathing_exercises"], ["7-9 hours", "consistent schedule"],
         ["chest_pain", "palpitations", "shortness_of_breath"], ["fatigue", "swelling", "dizziness"],
         ["heart_rate", "blood_pressure"], "heart"),
        ("blood_vessels", "Blood Vessels", "Arteries and veins transport blood", ["transport blood", "regulate pressure"],
         ["omega3", "vitamin_c", "antioxidants", "fiber"], ["cardio", "walking"],
         ["7-8 hours"], ["numbness", "cold_extremities"], ["pain", "fatigue"], ["blood_pressure"], "vessels"),
    ],
    "nervous": [
        ("brain", "Brain", "Central control for thought, memory, and coordination", ["cognition", "memory", "coordination"],
         ["omega3", "b_vitamins", "choline", "magnesium", "antioxidants"],
         ["walking", "breathing_exercises", "mobility"], ["7-9 hours", "deep sleep"],
         ["brain_fog", "memory_issues", "headaches"], ["fatigue", "low_energy", "anxiety"],
         ["sleep_hours", "stress_level"], "brain"),
        ("spinal_cord", "Spinal Cord", "Connects brain to body", ["signal relay", "reflexes"],
         ["b_vitamins", "magnesium", "omega3"], ["mobility", "strength_training", "posture"],
         ["7-8 hours"], ["numbness", "tingling", "weakness"], ["pain", "stiffness"], [], "spine"),
    ],
    "digestive": [
        ("stomach", "Stomach", "Digests food and passes to intestines", ["digest food", "acid secretion"],
         ["fiber", "probiotics", "b_vitamins", "zinc"], ["walking"], ["7-8 hours"],
         ["bloating", "acid_reflux", "nausea"], ["pain", "indigestion"], ["digestive_comfort"], "stomach"),
        ("liver", "Liver", "Detoxification and metabolism", ["detox", "metabolism", "bile production"],
         ["antioxidants", "b_vitamins", "choline", "protein"], ["cardio", "walking"],
         ["7-8 hours"], ["jaundice", "fatigue", "bloating"], ["low_energy", "digestive_problems"],
         ["liver_enzymes"], "liver"),
        ("pancreas", "Pancreas", "Insulin and digestive enzymes", ["blood_sugar", "digestive_enzymes"],
         ["chromium", "magnesium", "antioxidants", "fiber"], ["cardio", "strength_training"],
         ["7-8 hours"], ["blood_sugar_swings", "fatigue"], ["digestive_problems"], ["blood_glucose"], "pancreas"),
        ("intestines", "Intestines", "Absorption and gut health", ["absorb nutrients", "gut barrier"],
         ["fiber", "probiotics", "omega3", "glutamine"], ["walking"], ["7-8 hours"],
         ["bloating", "constipation", "diarrhea"], ["digestive_problems", "pain"], ["gut_health"], "intestines"),
    ],
    "endocrine": [
        ("thyroid", "Thyroid", "Metabolism and energy", ["metabolism", "hormone regulation"],
         ["iodine", "selenium", "zinc", "b_vitamins"], ["cardio", "strength_training"],
         ["7-9 hours"], ["fatigue", "weight_changes", "cold_intolerance"], ["low_energy", "brain_fog"],
         ["tsh", "energy_level"], "thyroid"),
        ("adrenals", "Adrenals", "Stress and cortisol", ["stress_response", "cortisol"],
         ["b_vitamins", "vitamin_c", "magnesium", "adaptogens"], ["walking", "breathing_exercises"],
         ["8-9 hours", "recovery_sleep"], ["fatigue", "burnout", "cravings"], ["low_energy", "anxiety"],
         ["stress_level", "sleep_quality"], "adrenals"),
    ],
    "musculoskeletal": [
        ("muscles", "Muscles", "Movement and strength", ["movement", "strength", "metabolism"],
         ["protein", "magnesium", "potassium", "creatine"], ["strength_training", "cardio", "mobility"],
         ["7-8 hours", "recovery"], ["weakness", "cramps"], ["pain", "fatigue"], ["muscle_mass", "strength"], "muscles"),
        ("joints", "Joints", "Mobility and support", ["mobility", "support", "cushioning"],
         ["omega3", "glucosamine", "vitamin_d", "antioxidants"], ["mobility", "walking", "strength_training"],
         ["7-8 hours"], ["stiffness", "swelling"], ["pain", "limited_motion"], ["joint_pain"], "joints"),
        ("bones", "Bones", "Structure and mineral storage", ["support", "mineral_storage"],
         ["vitamin_d", "calcium", "magnesium", "vitamin_k"], ["strength_training", "walking"],
         ["7-8 hours"], ["bone_pain", "fracture_risk"], ["pain"], ["bone_density"], "bones"),
    ],
    "respiratory": [
        ("lungs", "Lungs", "Gas exchange and breathing", ["oxygenate blood", "remove CO2"],
         ["antioxidants", "vitamin_c", "magnesium"], ["cardio", "breathing_exercises", "walking"],
         ["7-8 hours"], ["shortness_of_breath", "cough"], ["fatigue", "low_energy"], ["lung_capacity"], "lungs"),
    ],
    "immune": [
        ("immune_system", "Immune System", "Defense against pathogens", ["defense", "healing"],
         ["vitamin_d", "vitamin_c", "zinc", "probiotics", "antioxidants"],
         ["moderate_cardio", "walking"], ["7-9 hours", "quality_sleep"],
         ["frequent_illness", "slow_healing"], ["fatigue", "low_energy"], ["immune_markers"], "immune"),
    ],
    "lymphatic": [
        ("lymph_nodes", "Lymph Nodes", "Filter lymph and immune support", ["filter lymph", "immune support"],
         ["water", "antioxidants", "vitamin_c"], ["walking", "mobility"], ["7-8 hours"],
         ["swelling", "tenderness"], ["fatigue"], [], "lymph"),
    ],
    "integumentary": [
        ("skin", "Skin", "Barrier and protection", ["barrier", "thermoregulation", "vitamin D"],
         ["antioxidants", "vitamin_c", "omega3", "biotin"], ["cardio", "sweat"],
         ["7-8 hours"], ["dryness", "breakouts", "slow_healing"], ["irritation"], ["skin_health"], "skin"),
    ],
    "reproductive": [
        ("reproductive_organs", "Reproductive Organs", "Hormonal and reproductive health", ["hormones", "reproduction"],
         ["omega3", "zinc", "b_vitamins", "antioxidants"], ["cardio", "walking"],
         ["7-8 hours"], ["hormonal_imbalance"], ["fatigue", "mood_changes"], ["hormone_levels"], "reproductive"),
    ],
}


def seed_body_intelligence():
    db = SessionLocal()
    try:
        for sys_data in BODY_SYSTEMS:
            existing = db.query(BodySystem).filter(BodySystem.slug == sys_data["slug"]).first()
            if not existing:
                sys_obj = BodySystem(**sys_data)
                db.add(sys_obj)
                db.flush()
                system_id = sys_obj.id
            else:
                system_id = existing.id

            organs_data = ORGANS_TAXONOMY.get(sys_data["slug"], [])
            for j, row in enumerate(organs_data):
                slug, name, desc, functions, nutrition, movement, sleep, signals, symptoms, metric_keys, map_region = row
                if db.query(Organ).filter(Organ.slug == slug).first():
                    continue
                db.add(Organ(
                    system_id=system_id,
                    slug=slug,
                    name=name,
                    description=desc,
                    functions=functions,
                    nutrition_requirements=nutrition,
                    movement_requirements=movement,
                    sleep_requirements=sleep,
                    signals=signals,
                    symptoms=symptoms,
                    metric_keys=metric_keys,
                    display_order=j,
                    map_region_id=map_region,
                ))
        db.commit()
        print("Body intelligence seed completed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_body_intelligence()
