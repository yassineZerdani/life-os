from fastapi import APIRouter
from .domains import router as domains_router
from .metrics import router as metrics_router
from .goals import router as goals_router
from .experiences import router as experiences_router
from .relationships import router as relationships_router
from .achievements import router as achievements_router
from .notes import router as notes_router
from .dashboard import router as dashboard_router
from .timeline import router as timeline_router
from .xp_events import router as xp_events_router
from .life_events import router as life_events_router
from .life_score import router as life_score_router
from .time_blocks import router as time_blocks_router
from .analytics import router as analytics_router
from .insights import router as insights_router
from .simulation import router as simulation_router
from .recommendations import router as recommendations_router
from .graph import router as graph_router
from .life_achievements import router as life_achievements_router
from .quests import router as quests_router
from .control_room import router as control_room_router
from .strategies import router as strategies_router
from .strategy_library import router as strategy_library_router
from .learn import router as learn_router
from .auth import router as auth_router
from .profile import router as profile_router
from .body_intelligence import router as body_intelligence_router
from .wealth import router as wealth_router
from .journal import router as journal_router
from .skills import router as skills_router
from .career import router as career_router
from .family import router as family_router
from .love import router as love_router
from .network import router as network_router
from .life_memory import router as life_memory_router
from .persona_lab import router as persona_lab_router
from .mind_engine import router as mind_engine_router
from .stripe_routes import router as stripe_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(profile_router, prefix="/profile", tags=["profile"])
api_router.include_router(body_intelligence_router, prefix="/body-intelligence", tags=["body-intelligence"])
api_router.include_router(wealth_router, prefix="/wealth", tags=["wealth"])
api_router.include_router(stripe_router, prefix="/stripe", tags=["stripe"])
api_router.include_router(journal_router, prefix="/journal", tags=["journal"])
api_router.include_router(skills_router, prefix="/skills", tags=["skills"])
api_router.include_router(career_router, prefix="/career", tags=["career"])
api_router.include_router(family_router, prefix="/family", tags=["family"])
api_router.include_router(love_router, prefix="/love", tags=["love"])
api_router.include_router(network_router, prefix="/network", tags=["network"])
api_router.include_router(life_memory_router, prefix="/life-memory", tags=["life-memory"])
api_router.include_router(persona_lab_router, prefix="/persona-lab", tags=["persona-lab"])
api_router.include_router(mind_engine_router, prefix="/mind-engine", tags=["mind-engine"])
api_router.include_router(control_room_router, prefix="/control-room", tags=["control-room"])
api_router.include_router(strategies_router, prefix="/strategies", tags=["strategies"])
api_router.include_router(strategy_library_router, prefix="/strategy-library", tags=["strategy-library"])
api_router.include_router(learn_router, prefix="/learn", tags=["learn"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(insights_router, prefix="/insights", tags=["insights"])
api_router.include_router(simulation_router, prefix="/simulation", tags=["simulation"])
api_router.include_router(recommendations_router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(graph_router, prefix="/graph", tags=["graph"])
api_router.include_router(life_achievements_router, prefix="/life-achievements", tags=["life-achievements"])
api_router.include_router(quests_router, prefix="/quests", tags=["quests"])
api_router.include_router(time_blocks_router, prefix="/time-blocks", tags=["time-blocks"])
api_router.include_router(life_score_router, prefix="/life-score", tags=["life-score"])
api_router.include_router(timeline_router, prefix="/timeline", tags=["timeline"])
api_router.include_router(xp_events_router, prefix="/xp-events", tags=["xp-events"])
api_router.include_router(life_events_router, prefix="/life-events", tags=["life-events"])
api_router.include_router(domains_router, prefix="/domains", tags=["domains"])
api_router.include_router(metrics_router, prefix="/metrics", tags=["metrics"])
api_router.include_router(goals_router, prefix="/goals", tags=["goals"])
api_router.include_router(experiences_router, prefix="/experiences", tags=["experiences"])
api_router.include_router(relationships_router, prefix="/relationships", tags=["relationships"])
api_router.include_router(achievements_router, prefix="/achievements", tags=["achievements"])
api_router.include_router(notes_router, prefix="/notes", tags=["notes"])
