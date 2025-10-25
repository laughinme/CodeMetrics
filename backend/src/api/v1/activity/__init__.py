from fastapi import APIRouter


def get_activity_router() -> APIRouter:
    from .streaks import router as streaks_router
    
    router = APIRouter(prefix='/activity', tags=['Activity'])

    router.include_router(streaks_router)
    
    return router
