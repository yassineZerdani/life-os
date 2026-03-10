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

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(profile_router, prefix="/profile", tags=["profile"])
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
