from fastapi import APIRouter

def get_project_id_routes() -> APIRouter:
    from .get_project import router as get_project_router
    from .project_repos import router as project_repos_router

    router = APIRouter(prefix="/{project_id}")

    router.include_router(get_project_router)
    router.include_router(project_repos_router)
    
    return router
