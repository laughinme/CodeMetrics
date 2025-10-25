from typing import Annotated
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Query, Depends

from service.metrics_service import MetricsService, get_metrics_service
from service.metrics_service.schemas import KPIResponse

router = APIRouter()

@router.get(
    "/kpi",
    response_model=KPIResponse,
    summary="Get key performance indicators",
    description="Returns commits count, active developers, repositories and quality metrics"
)
async def get_kpi_metrics(
    metrics_service: Annotated[MetricsService, Depends(get_metrics_service)],
    since: datetime = Query(..., description="Start date in UTC"),
    until: datetime = Query(..., description="End date in UTC"),
    project_id: int | None = Query(None, description="Filter by project ID"),
    repo: UUID | None = Query(None, description="Filter by repository UUID"),
    author: UUID | None = Query(None, description="Filter by author UUID"),
) -> KPIResponse:
    return await metrics_service.get_kpi_metrics(
        since=since,
        until=until,
        project_id=project_id,
        repo_id=repo, 
        author_id=author
    )
