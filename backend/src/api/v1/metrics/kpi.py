from typing import Optional
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Query, Depends

from service.metrics_service import MetricsService
from service.metrics_service.schemas import KPIResponse

router = APIRouter()

@router.get(
    "/kpi",
    response_model=KPIResponse,
    summary="Get key performance indicators",
    description="Returns commits count, active developers, repositories and quality metrics"
)
async def get_kpi_metrics(
    since: datetime = Query(..., description="Start date in UTC"),
    until: datetime = Query(..., description="End date in UTC"),
    project_key: Optional[str] = Query(None, description="Filter by project key"),
    repo: Optional[UUID] = Query(None, description="Filter by repository UUID"),
    author: Optional[UUID] = Query(None, description="Filter by author UUID"),
    metrics_service: MetricsService = ...,
) -> KPIResponse:
    #return await metrics_service.get_kpi_metrics(
    #    since=since,
    #    until=until,
    #    project_key=project_key,
    #    repo=repo, 
    #    author=author
    #)
    ...
