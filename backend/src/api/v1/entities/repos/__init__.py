from fastapi import APIRouter


def get_repo_routes() -> APIRouter:
    from .get_repo_branches import router as get_repo_branches_router
    from .get_repo_commits import router as get_repo_commits_router

    router = APIRouter(prefix="/repos")

    router.include_router(get_repo_commits_router)
    router.include_router(get_repo_branches_router)

    return router