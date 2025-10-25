from fastapi import Depends

from database.relational_db import (
    BranchInterface,
    CommitInterface,
    ProjectInterface,
    RepositoryInterface,
    UoW,
    get_uow,
)
from core.config import config
from .service import MetricsService
from ..api_service.external_api import ExternalAPIClient


async def get_metrics_service(
    uow: UoW = Depends(get_uow),
    # redis = Depends(get_redis),
) -> MetricsService:
    session = uow.session
    api_client=ExternalAPIClient(config.API_URL)
    
    return MetricsService(api_client=api_client)
