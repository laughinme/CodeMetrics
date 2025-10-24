from fastapi import APIRouter


def get_commits_router() -> APIRouter:
    from .daily_commits import router as daily_commits_router
    from .hourly_commits import router as hourly_commits_router

    router = APIRouter(prefix="/commits")

    router.include_router(daily_commits_router)
    router.include_router(hourly_commits_router)
    
    return router