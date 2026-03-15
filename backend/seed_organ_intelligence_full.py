"""
Comprehensive organ intelligence seed:
- Body systems (10)
- ~80 organs
- Nutrient DB (vitamins, minerals, macronutrients, fatty acids)
- Movement types DB
- Symptom DB (early warning signals)
- Organ–nutrient, organ–movement, organ–symptom mappings
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.body_intelligence import (
    BodySystem,
    Organ,
    Nutrient,
    MovementType,
    Symptom,
    OrganNutrient,
    OrganMovement,
    OrganSymptom,
)

BODY_SYSTEMS = [
    {"slug": "cardiovascular", "name": "Cardiovascular", "description": "Heart and blood vessels", "display_order": 1},
    {"slug": "digestive", "name": "Digestive", "description": "Digestion and nutrient absorption", "display_order": 2},
    {"slug": "nervous", "name": "Nervous", "description": "Brain, spinal cord, nerves", "display_order": 3},
    {"slug": "respiratory", "name": "Respiratory", "description": "Lungs and airways", "display_order": 4},
    {"slug": "endocrine", "name": "Endocrine", "description": "Hormones and metabolism", "display_order": 5},
    {"slug": "musculoskeletal", "name": "Musculoskeletal", "description": "Muscles, bones, joints", "display_order": 6},
    {"slug": "immune", "name": "Immune", "description": "Immune defense", "display_order": 7},
    {"slug": "integumentary", "name": "Integumentary", "description": "Skin, hair, nails", "display_order": 8},
    {"slug": "lymphatic", "name": "Lymphatic", "description": "Lymph and immune support", "display_order": 9},
    {"slug": "reproductive", "name": "Reproductive", "description": "Reproductive organs", "display_order": 10},
]

# slug, name, description, map_region_id
ORGANS_FLAT = [
    ("cardiovascular", "heart", "Heart", "Pumps blood through the body", "heart"),
    ("cardiovascular", "blood_vessels", "Blood Vessels", "Arteries and veins", "vessels"),
    ("cardiovascular", "capillaries", "Capillaries", "Microcirculation and exchange", "vessels"),
    ("digestive", "stomach", "Stomach", "Digests food, acid secretion", "stomach"),
    ("digestive", "liver", "Liver", "Detoxification and metabolism", "liver"),
    ("digestive", "pancreas", "Pancreas", "Insulin and digestive enzymes", "pancreas"),
    ("digestive", "small_intestine", "Small Intestine", "Nutrient absorption", "intestines"),
    ("digestive", "large_intestine", "Large Intestine", "Water absorption, waste", "intestines"),
    ("digestive", "gallbladder", "Gallbladder", "Bile storage and release", "liver"),
    ("digestive", "esophagus", "Esophagus", "Moves food to stomach", "stomach"),
    ("digestive", "salivary_glands", "Salivary Glands", "Digestive enzymes in mouth", None),
    ("digestive", "appendix", "Appendix", "Lymphoid tissue", "intestines"),
    ("nervous", "brain", "Brain", "Cognition, memory, coordination", "brain"),
    ("nervous", "spinal_cord", "Spinal Cord", "Signal relay, reflexes", "spine"),
    ("nervous", "nerves", "Nerves", "Peripheral nerve network", "spine"),
    ("nervous", "eyes", "Eyes", "Vision and light processing", "eyes"),
    ("nervous", "ears", "Ears", "Hearing and balance", "ears"),
    ("nervous", "pituitary", "Pituitary Gland", "Master hormone gland", "brain"),
    ("nervous", "pineal", "Pineal Gland", "Melatonin, sleep-wake", "brain"),
    ("respiratory", "lungs", "Lungs", "Gas exchange", "lungs"),
    ("respiratory", "trachea", "Trachea", "Airway to lungs", "lungs"),
    ("respiratory", "bronchi", "Bronchi", "Airway branches", "lungs"),
    ("respiratory", "diaphragm", "Diaphragm", "Main breathing muscle", "lungs"),
    ("respiratory", "sinuses", "Sinuses", "Air-filled cavities", "lungs"),
    ("endocrine", "thyroid", "Thyroid", "Metabolism and energy", "thyroid"),
    ("endocrine", "adrenals", "Adrenal Glands", "Stress and cortisol", "adrenals"),
    ("endocrine", "ovaries", "Ovaries", "Female hormones and eggs", "reproductive"),
    ("endocrine", "testes", "Testes", "Male hormones and sperm", "reproductive"),
    ("endocrine", "thymus", "Thymus", "T-cell maturation", "immune"),
    ("musculoskeletal", "muscles", "Muscles", "Movement and strength", "muscles"),
    ("musculoskeletal", "bones", "Bones", "Structure and mineral storage", "bones"),
    ("musculoskeletal", "joints", "Joints", "Mobility and cushioning", "joints"),
    ("musculoskeletal", "tendons", "Tendons", "Connect muscle to bone", "joints"),
    ("musculoskeletal", "ligaments", "Ligaments", "Connect bone to bone", "joints"),
    ("musculoskeletal", "cartilage", "Cartilage", "Joint cushioning", "joints"),
    ("immune", "bone_marrow", "Bone Marrow", "Blood cell production", "bones"),
    ("immune", "spleen", "Spleen", "Blood filter, immune reserve", "immune"),
    ("immune", "tonsils", "Tonsils", "Lymphoid defense", "immune"),
    ("immune", "mucosa", "Mucosal Immunity", "Barrier immunity", "immune"),
    ("integumentary", "skin", "Skin", "Barrier and thermoregulation", "skin"),
    ("integumentary", "hair_follicles", "Hair Follicles", "Hair growth", "skin"),
    ("integumentary", "nails", "Nails", "Protection", "skin"),
    ("integumentary", "sweat_glands", "Sweat Glands", "Thermoregulation", "skin"),
    ("integumentary", "sebaceous_glands", "Sebaceous Glands", "Skin oil", "skin"),
    ("lymphatic", "lymph_nodes", "Lymph Nodes", "Filter lymph", "lymph"),
    ("lymphatic", "lymphatic_vessels", "Lymphatic Vessels", "Lymph transport", "lymph"),
    ("reproductive", "uterus", "Uterus", "Pregnancy and menstruation", "reproductive"),
    ("reproductive", "prostate", "Prostate", "Male reproductive fluid", "reproductive"),
    ("reproductive", "fallopian_tubes", "Fallopian Tubes", "Egg transport", "reproductive"),
    ("reproductive", "vagina", "Vagina", "Birth canal", "reproductive"),
    ("reproductive", "penis", "Penis", "Male external organ", "reproductive"),
    ("reproductive", "epididymis", "Epididymis", "Sperm maturation", "reproductive"),
    ("cardiovascular", "spleen_cv", "Spleen (blood)", "Blood reservoir", "vessels"),
    ("endocrine", "kidneys", "Kidneys", "Filter blood, fluid balance", None),
    ("endocrine", "bladder", "Bladder", "Urine storage", None),
    ("nervous", "hypothalamus", "Hypothalamus", "Homeostasis, hormones", "brain"),
    ("nervous", "cerebellum", "Cerebellum", "Balance and coordination", "brain"),
    ("respiratory", "larynx", "Larynx", "Voice and airway", "lungs"),
    ("respiratory", "pharynx", "Pharynx", "Throat passage", "lungs"),
    ("digestive", "tongue", "Tongue", "Taste and swallowing", None),
    ("cardiovascular", "arteries", "Arteries", "Oxygenated blood transport", "vessels"),
    ("cardiovascular", "veins", "Veins", "Deoxygenated blood return", "vessels"),
    ("nervous", "retina", "Retina", "Light sensing in eye", "eyes"),
    ("nervous", "cochlea", "Cochlea", "Hearing in inner ear", "ears"),
    ("digestive", "duodenum", "Duodenum", "First part of small intestine", "intestines"),
    ("digestive", "colon", "Colon", "Large intestine main", "intestines"),
    ("digestive", "rectum", "Rectum", "Final part of large intestine", "intestines"),
]

# Nutrients: slug, name, category, unit
NUTRIENTS = [
    ("vitamin_a", "Vitamin A", "vitamin", "mcg"),
    ("vitamin_b1", "Vitamin B1 (Thiamine)", "vitamin", "mg"),
    ("vitamin_b2", "Vitamin B2 (Riboflavin)", "vitamin", "mg"),
    ("vitamin_b3", "Vitamin B3 (Niacin)", "vitamin", "mg"),
    ("vitamin_b5", "Vitamin B5 (Pantothenic acid)", "vitamin", "mg"),
    ("vitamin_b6", "Vitamin B6", "vitamin", "mg"),
    ("vitamin_b7", "Vitamin B7 (Biotin)", "vitamin", "mcg"),
    ("vitamin_b9", "Vitamin B9 (Folate)", "vitamin", "mcg"),
    ("vitamin_b12", "Vitamin B12", "vitamin", "mcg"),
    ("vitamin_c", "Vitamin C", "vitamin", "mg"),
    ("vitamin_d", "Vitamin D", "vitamin", "IU"),
    ("vitamin_e", "Vitamin E", "vitamin", "mg"),
    ("vitamin_k", "Vitamin K", "vitamin", "mcg"),
    ("calcium", "Calcium", "mineral", "mg"),
    ("iron", "Iron", "mineral", "mg"),
    ("magnesium", "Magnesium", "mineral", "mg"),
    ("zinc", "Zinc", "mineral", "mg"),
    ("selenium", "Selenium", "mineral", "mcg"),
    ("potassium", "Potassium", "mineral", "mg"),
    ("sodium", "Sodium", "mineral", "mg"),
    ("phosphorus", "Phosphorus", "mineral", "mg"),
    ("iodine", "Iodine", "mineral", "mcg"),
    ("chromium", "Chromium", "mineral", "mcg"),
    ("manganese", "Manganese", "mineral", "mg"),
    ("copper", "Copper", "mineral", "mg"),
    ("protein", "Protein", "macronutrient", "g"),
    ("carbohydrates", "Carbohydrates", "macronutrient", "g"),
    ("fiber", "Fiber", "macronutrient", "g"),
    ("omega3", "Omega-3 fatty acids", "fatty_acid", "g"),
    ("omega6", "Omega-6 fatty acids", "fatty_acid", "g"),
    ("coq10", "CoQ10", "vitamin", "mg"),
    ("choline", "Choline", "vitamin", "mg"),
    ("glutamine", "Glutamine", "macronutrient", "g"),
    ("probiotics", "Probiotics", "macronutrient", "CFU"),
    ("antioxidants", "Antioxidants", "vitamin", None),
    ("water", "Water", "macronutrient", "L"),
]

MOVEMENT_TYPES = [
    ("cardio", "Cardio", "Aerobic exercise"),
    ("strength_training", "Strength Training", "Resistance training"),
    ("walking", "Walking", "Low-impact movement"),
    ("mobility", "Mobility", "Range of motion, stretching"),
    ("breathing", "Breathing Exercises", "Diaphragmatic, breathwork"),
    ("posture", "Posture", "Alignment and support"),
    ("balance", "Balance", "Stability work"),
    ("hiit", "HIIT", "High-intensity intervals"),
    ("yoga", "Yoga", "Mind-body movement"),
    ("swimming", "Swimming", "Full-body cardio"),
]

SYMPTOMS = [
    ("fatigue", "Fatigue", "early_warning"),
    ("brain_fog", "Brain fog", "early_warning"),
    ("headaches", "Headaches", "early_warning"),
    ("bloating", "Bloating", "early_warning"),
    ("pain", "Pain", "moderate"),
    ("shortness_of_breath", "Shortness of breath", "early_warning"),
    ("numbness", "Numbness", "early_warning"),
    ("swelling", "Swelling", "early_warning"),
    ("dizziness", "Dizziness", "early_warning"),
    ("indigestion", "Indigestion", "early_warning"),
    ("constipation", "Constipation", "early_warning"),
    ("diarrhea", "Diarrhea", "early_warning"),
    ("nausea", "Nausea", "early_warning"),
    ("low_energy", "Low energy", "early_warning"),
    ("stiffness", "Stiffness", "early_warning"),
    ("weakness", "Weakness", "moderate"),
    ("palpitations", "Palpitations", "early_warning"),
    ("cold_extremities", "Cold extremities", "early_warning"),
    ("slow_healing", "Slow healing", "early_warning"),
    ("frequent_illness", "Frequent illness", "early_warning"),
    ("mood_changes", "Mood changes", "early_warning"),
    ("weight_changes", "Weight changes", "early_warning"),
    ("dryness", "Dryness", "early_warning"),
    ("tingling", "Tingling", "early_warning"),
    ("acid_reflux", "Acid reflux", "early_warning"),
    ("cough", "Cough", "early_warning"),
    ("jaundice", "Jaundice", "severe"),
    ("chest_pain", "Chest pain", "severe"),
]

def _get_or_create_system(db, slug):
    s = db.query(BodySystem).filter(BodySystem.slug == slug).first()
    if s:
        return s.id
    d = next(x for x in BODY_SYSTEMS if x["slug"] == slug)
    obj = BodySystem(**d)
    db.add(obj)
    db.flush()
    return obj.id

def _get_or_create_organ(db, system_id, slug, name, description, map_region_id):
    o = db.query(Organ).filter(Organ.slug == slug).first()
    if o:
        return o.id
    o = Organ(
        system_id=system_id,
        slug=slug,
        name=name,
        description=description,
        map_region_id=map_region_id,
        functions=[], nutrition_requirements=[], movement_requirements=[],
        sleep_requirements=["7-8 hours"], signals=[], symptoms=[], metric_keys=[],
        display_order=0,
    )
    db.add(o)
    db.flush()
    return o.id

def _get_or_create_nutrient(db, slug, name, category, unit):
    n = db.query(Nutrient).filter(Nutrient.slug == slug).first()
    if n:
        return n.id
    n = Nutrient(slug=slug, name=name, category=category, unit=unit, display_order=0)
    db.add(n)
    db.flush()
    return n.id

def _get_or_create_movement(db, slug, name, description):
    m = db.query(MovementType).filter(MovementType.slug == slug).first()
    if m:
        return m.id
    m = MovementType(slug=slug, name=name, description=description, display_order=0)
    db.add(m)
    db.flush()
    return m.id

def _get_or_create_symptom(db, slug, name, stage):
    s = db.query(Symptom).filter(Symptom.slug == slug).first()
    if s:
        return s.id
    s = Symptom(slug=slug, name=name, stage=stage, display_order=0)
    db.add(s)
    db.flush()
    return s.id

def seed_full():
    db = SessionLocal()
    try:
        # 1. Body systems
        for d in BODY_SYSTEMS:
            _get_or_create_system(db, d["slug"])

        # 2. Organs (~80)
        organ_slugs = set()
        for sys_slug, org_slug, name, desc, map_id in ORGANS_FLAT:
            if org_slug in organ_slugs:
                continue
            organ_slugs.add(org_slug)
            sid = _get_or_create_system(db, sys_slug)
            _get_or_create_organ(db, sid, org_slug, name, desc, map_id)

        # 3. Nutrients
        nutrient_ids = {}
        for slug, name, category, unit in NUTRIENTS:
            nutrient_ids[slug] = _get_or_create_nutrient(db, slug, name, category, unit)

        # 4. Movement types
        movement_ids = {}
        for slug, name, desc in MOVEMENT_TYPES:
            movement_ids[slug] = _get_or_create_movement(db, slug, name, desc)

        # 5. Symptoms
        symptom_ids = {}
        for slug, name, stage in SYMPTOMS:
            symptom_ids[slug] = _get_or_create_symptom(db, slug, name, stage)

        # 6. Organ–nutrient mapping (critical nutrients per organ, by slug)
        ORGAN_NUTRIENTS = {
            "heart": ["omega3", "magnesium", "potassium", "coq10", "vitamin_b12", "antioxidants"],
            "brain": ["omega3", "vitamin_b12", "vitamin_b6", "choline", "magnesium", "antioxidants"],
            "liver": ["antioxidants", "choline", "vitamin_b12", "protein", "vitamin_e"],
            "kidneys": ["potassium", "magnesium", "vitamin_d", "water", "sodium"],
            "bones": ["calcium", "vitamin_d", "vitamin_k", "magnesium", "phosphorus"],
            "muscles": ["protein", "magnesium", "potassium", "vitamin_d"],
            "thyroid": ["iodine", "selenium", "zinc", "vitamin_b12"],
            "lungs": ["antioxidants", "vitamin_c", "vitamin_d", "magnesium"],
            "stomach": ["fiber", "probiotics", "vitamin_b12", "zinc"],
            "pancreas": ["chromium", "magnesium", "antioxidants", "fiber", "vitamin_d"],
            "small_intestine": ["fiber", "probiotics", "glutamine", "zinc"],
            "large_intestine": ["fiber", "probiotics", "magnesium", "water"],
            "skin": ["antioxidants", "vitamin_c", "omega3", "vitamin_b7", "vitamin_e"],
            "eyes": ["vitamin_a", "omega3", "antioxidants", "zinc", "vitamin_e"],
            "immune_system": ["vitamin_d", "vitamin_c", "zinc", "probiotics", "antioxidants"],
            "adrenals": ["vitamin_c", "vitamin_b5", "magnesium", "sodium"],
        }
        for org_slug, nut_slugs in ORGAN_NUTRIENTS.items():
            organ = db.query(Organ).filter(Organ.slug == org_slug).first()
            if not organ:
                continue
            for nut_slug in nut_slugs:
                if nut_slug not in nutrient_ids:
                    continue
                exists = db.query(OrganNutrient).filter(
                    OrganNutrient.organ_id == organ.id,
                    OrganNutrient.nutrient_id == nutrient_ids[nut_slug],
                ).first()
                if not exists:
                    db.add(OrganNutrient(
                        organ_id=organ.id,
                        nutrient_id=nutrient_ids[nut_slug],
                        importance="critical",
                    ))

        # 7. Organ–movement mapping
        ORGAN_MOVEMENTS = {
            "heart": ["cardio", "walking", "breathing"],
            "lungs": ["cardio", "breathing", "walking"],
            "muscles": ["strength_training", "cardio", "mobility"],
            "bones": ["strength_training", "walking"],
            "joints": ["mobility", "walking", "strength_training"],
            "brain": ["walking", "breathing", "mobility"],
            "spinal_cord": ["mobility", "posture", "strength_training"],
            "lymph_nodes": ["walking", "mobility"],
        }
        for org_slug, mov_slugs in ORGAN_MOVEMENTS.items():
            organ = db.query(Organ).filter(Organ.slug == org_slug).first()
            if not organ:
                continue
            for mov_slug in mov_slugs:
                if mov_slug not in movement_ids:
                    continue
                exists = db.query(OrganMovement).filter(
                    OrganMovement.organ_id == organ.id,
                    OrganMovement.movement_type_id == movement_ids[mov_slug],
                ).first()
                if not exists:
                    db.add(OrganMovement(organ_id=organ.id, movement_type_id=movement_ids[mov_slug]))

        # 8. Organ–symptom mapping (early warning signals)
        ORGAN_SYMPTOMS = {
            "heart": ["fatigue", "palpitations", "shortness_of_breath", "chest_pain", "dizziness"],
            "brain": ["brain_fog", "fatigue", "headaches", "mood_changes"],
            "liver": ["fatigue", "bloating", "jaundice", "nausea"],
            "kidneys": ["swelling", "fatigue", "weight_changes"],
            "lungs": ["shortness_of_breath", "cough", "fatigue"],
            "stomach": ["bloating", "indigestion", "acid_reflux", "nausea"],
            "pancreas": ["fatigue", "weight_changes", "pain"],
            "thyroid": ["fatigue", "weight_changes", "low_energy"],
            "adrenals": ["fatigue", "low_energy", "mood_changes"],
            "muscles": ["weakness", "pain", "stiffness"],
            "joints": ["stiffness", "swelling", "pain"],
            "skin": ["dryness", "slow_healing"],
            "immune_system": ["frequent_illness", "slow_healing", "fatigue"],
            "spinal_cord": ["numbness", "tingling", "weakness", "pain"],
        }
        for org_slug, sym_slugs in ORGAN_SYMPTOMS.items():
            organ = db.query(Organ).filter(Organ.slug == org_slug).first()
            if not organ:
                continue
            for sym_slug in sym_slugs:
                if sym_slug not in symptom_ids:
                    continue
                exists = db.query(OrganSymptom).filter(
                    OrganSymptom.organ_id == organ.id,
                    OrganSymptom.symptom_id == symptom_ids[sym_slug],
                ).first()
                if not exists:
                    db.add(OrganSymptom(organ_id=organ.id, symptom_id=symptom_ids[sym_slug]))

        db.commit()
        print("Organ intelligence full seed completed: systems, organs, nutrients, movements, symptoms, mappings.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_full()
