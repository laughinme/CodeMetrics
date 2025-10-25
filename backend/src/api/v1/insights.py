from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Query, Depends

from service.metrics_service import MetricsService
from domain.insights.schemas import InsightsResponse

router = APIRouter()


@router.get(
    "/insights",
    response_model=InsightsResponse,
    summary="Get comprehensive insights dashboard data",
    description="Returns all metrics needed for insights dashboard including commits analysis, author concentration, hot files and activity patterns"
)
async def get_insights_dashboard(
    days: int = Query(7, description="Analysis period in days", ge=1, le=30),
    project_id: Optional[str] = Query(None, description="Filter by project id"),
    metrics_service: MetricsService = Depends(),
) -> InsightsResponse:
    ...