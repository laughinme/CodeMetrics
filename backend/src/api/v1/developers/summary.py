from __future__ import annotations

from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query

from domain.metrics import DevelopersSummary
from service.aggregated_metrics import AggregatedMetricsService, get_aggregated_metrics_service

router = APIRouter()


@router.get(
    "/summary",
    response_model=DevelopersSummary,
    summary="Developers overview",
)
async def get_developers_summary(
    svc: Annotated[AggregatedMetricsService, Depends(get_aggregated_metrics_service)],
    since: date = Query(...),
    until: date = Query(...),
    project_id: int | None = Query(None),
    repo_ids: list[UUID] | None = Query(None),
) -> DevelopersSummary:
    params = svc.create_params(
        since=since,
        until=until,
        project_id=project_id,
        repo_ids=repo_ids,
    )
    return await svc.get_developers_summary(params=params)
