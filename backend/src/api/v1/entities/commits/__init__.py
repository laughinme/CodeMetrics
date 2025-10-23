from fastapi import APIRouter

def get_commits_routes() -> APIRouter:
    from .get_commit import router as get_commit_router

    router = APIRouter(prefix="/commits")

    router.include_router(get_commit_router)
    
    return router