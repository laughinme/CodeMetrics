from fastapi import Depends

from database.relational_db import (
    AggregateMetricsInterface,
    CommitInterface,
    UoW,
    get_uow,
)

from .service import AggregatedMetricsService


async def get_aggregated_metrics_service(
    uow: UoW = Depends(get_uow),
) -> AggregatedMetricsService:
    session = uow.session
    aggregates = AggregateMetricsInterface(session)
    commits = CommitInterface(session)
    return AggregatedMetricsService(uow, aggregates, commits)


__all__ = ["AggregatedMetricsService", "get_aggregated_metrics_service"]
