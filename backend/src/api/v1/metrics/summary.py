from __future__ import annotations

from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from domain.metrics import DashboardSummary
from service.aggregated_metrics import AggregatedMetricsService, get_aggregated_metrics_service

router = APIRouter()


@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Dashboard metrics summary",
)
async def get_metrics_summary(
    svc: Annotated[AggregatedMetricsService, Depends(get_aggregated_metrics_service)],
    since: date = Query(..., description="Start date (UTC day)"),
    until: date = Query(..., description="End date (UTC day)"),
    project_id: int | None = Query(None),
    repo_ids: list[UUID] | None = Query(None),
    author_ids: list[UUID] | None = Query(None),
    latest_limit: int = Query(10, ge=0, le=100, description="Number of recent commits to return"),
) -> DashboardSummary:
    params = svc.create_params(
        since=since,
        until=until,
        project_id=project_id,
        repo_ids=repo_ids,
        author_ids=author_ids,
    )
    return await svc.get_dashboard_summary(params=params, latest_limit=latest_limit)
