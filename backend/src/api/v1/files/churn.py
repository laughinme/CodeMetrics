from uuid import UUID
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Query, Depends

from service.metrics_service import MetricsService
from domain.insights.schemas import FileChurnResponse

router = APIRouter()


@router.get(
    "/files/churn",
    response_model=List[FileChurnResponse],
    summary="Get files with highest churn",
    description="Returns files sorted by churn (total changes) and change frequency"
)
async def get_high_churn_files(
    since: datetime = Query(..., description="Start date in UTC"),
    until: datetime = Query(..., description="End date in UTC"),
    project_id: Optional[str] = Query(None, description="Filter by project id"),
    limit: int = Query(10, description="Number of files to return", ge=1, le=50),
    metrics_service: MetricsService = Depends(),
) -> List[FileChurnResponse]:
    ...