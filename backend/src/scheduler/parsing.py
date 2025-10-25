import logging

from database.relational_db.session import async_session
from database.relational_db import UoW
from scheduler.state import sync_state
from service.api_service import (
    ExternalAPIClient,
    ExternalAPIError,
    SourceCodeSyncService,
)


logger = logging.getLogger(__name__)


async def run_initial_projects_sync(
    base_url: str,
) -> None:
    if not base_url:
        logger.warning("External API base URL is empty; skipping projects sync")
        return

    client = ExternalAPIClient(
        base_url=base_url,
    )

    sync_state.start(phase="initial-sync")
    try:
        async with async_session() as session:
            async with UoW(session) as uow:
                sync_service = SourceCodeSyncService(client=client, uow=uow)

                try:
                    await sync_service.sync_all()
                except ExternalAPIError as exc:
                    logger.error("External API returned invalid response: %s", exc)
                    raise
    except Exception as exc:  # noqa: BLE001
        sync_state.complete(error=str(exc))
        logger.exception("Unexpected error while syncing external data")
        raise
    else:
        sync_state.complete()
