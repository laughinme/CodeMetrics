from __future__ import annotations

from uuid import UUID
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query

# Roman
from domain.metrics import InsightRecommendation
from service.aggregated_metrics import AggregatedMetricsService, get_aggregated_metrics_service
# Mine
from service.metrics_service import MetricsService, get_metrics_service
from domain.insights.schemas import InsightsResponse

router = APIRouter()


router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get(
    "",
    response_model=list[InsightRecommendation],
    summary="Generated insights for the current slice",
)
async def get_insights(
    svc: Annotated[AggregatedMetricsService, Depends(get_aggregated_metrics_service)],
    since: date = Query(...),
    until: date = Query(...),
    project_id: int | None = Query(None),
    repo_ids: list[UUID] | None = Query(None),
    author_ids: list[UUID] | None = Query(None),
) -> list[InsightRecommendation]:
    params = svc.create_params(
        since=since,
        until=until,
        project_id=project_id,
        repo_ids=repo_ids,
        author_ids=author_ids,
    )
    return await svc.get_insights(params=params)
