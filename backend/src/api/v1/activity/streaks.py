from uuid import UUID
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Query, Depends

from service.metrics_service import MetricsService

router = APIRouter()


@router.get(
    "/activity/streaks",
    response_model=Dict[str, Any],
    summary="Get activity streak analysis",
    description="Returns longest streaks of consecutive days with commits and current streak"
)
async def get_activity_streaks(
    since: datetime = Query(..., description="Start date in UTC"),
    until: datetime = Query(..., description="End date in UTC"),
    project_id: Optional[str] = Query(None, description="Filter by project key"),
    metrics_service: MetricsService = Depends(),
) -> Dict[str, Any]:
    ...