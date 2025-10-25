from fastapi import APIRouter


def get_files_router() -> APIRouter:
    from .churn import router as churn_router
    
    router = APIRouter(prefix='/files', tags=['Files'])

    router.include_router(churn_router)
    
    return router
