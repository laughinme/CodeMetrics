from uuid import UUID
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Query, Depends

from service.metrics_service import MetricsService
from service.metrics_service.schemas import DailyCommitPoint

router = APIRouter()

@router.get(
    "/daily",
    response_model=List[DailyCommitPoint],
    summary="Get daily commits count",
    description="Returns commits aggregated by day for the specified period"
)
async def get_daily_commits(
    since: datetime = Query(..., description="Start date in UTC"),
    until: datetime = Query(..., description="End date in UTC"),
    project_key: Optional[str] = Query(None, description="Filter by project key"),
    repo: Optional[UUID] = Query(None, description="Filter by repository UUID"),
    author: Optional[UUID] = Query(None, description="Filter by author UUID"),
    metrics_service: MetricsService = ...,
) -> List[DailyCommitPoint]:
    #return await metrics_service.get_daily_commits(
    #    since=since,
    #    until=until,
    #    project_key=project_key,
    #    repo=repo,
    #    author=author
    #)
    ...