from fastapi import APIRouter

def get_projects_routes() -> APIRouter:
    from .get_projects import router as get_projects_router
    from .get_project_by_key import router as get_project_by_key_router
    from .get_project_repos import router as get_project_repos_router

    router = APIRouter(prefix="/projects")

    router.include_router(get_projects_router)
    router.include_router(get_project_by_key_router)
    router.include_router(get_project_repos_router)

    return router