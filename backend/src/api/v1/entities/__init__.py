from fastapi import APIRouter


def get_entities_router() -> APIRouter:
    from .repos import get_repo_routes
    from .projects import get_projects_routes
    # from .commits import get_commits_routes

    router = APIRouter(prefix="/entities", tags=["Entities"])

    router.include_router(get_repo_routes())
    router.include_router(get_projects_routes())
    # router.include_router(get_commits_routes())

    return router
