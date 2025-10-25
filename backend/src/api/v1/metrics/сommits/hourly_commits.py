from uuid import UUID
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Query, Depends

from service.metrics_service import MetricsService
from service.metrics_service.schemas import HourlyCommitPoint

router = APIRouter()

@router.get(
    "/by-hour",
    response_model=List[HourlyCommitPoint],
    summary="Get commits by hour of day",
    description="Returns commits aggregated by hour (0-23) for heatmap"
)
async def get_commits_by_hour(
    since: datetime = Query(..., description="Start date in UTC"),
    until: datetime = Query(..., description="End date in UTC"),
    project_key: Optional[str] = Query(None, description="Filter by project key"),
    repo: Optional[UUID] = Query(None, description="Filter by repository UUID"),
    author: Optional[UUID] = Query(None, description="Filter by author UUID"),
    # metrics_service: MetricsService = ...,
) -> List[HourlyCommitPoint]:
    # return await metrics_service.get_commits_by_hour(
    #     since=since,
    #     until=until,
    #     project_key=project_key,
    #     repo=repo,
    #     author=author
    # )
    ...
