from __future__ import annotations

import logging
import secrets

from database.relational_db.session import async_session
from database.relational_db import UoW
from database.relational_db.tables.scm_integrations import ScmIntegrationInterface
from database.redis import get_redis
from service.scm_sync.runner import sync_integration_background


logger = logging.getLogger(__name__)


async def run_scm_integrations_sync() -> None:
    """
    Periodic sync for all configured SCM integrations.

    Runs inside the API process scheduler; the actual work is delegated to a background runner
    with per-integration locking to avoid overlapping syncs.
    """
    # Distributed lock (multiple Fly machines run the same code).
    redis = get_redis()
    lock_key = "locks:scm_integrations_auto_sync"
    lock_token = secrets.token_urlsafe(16)
    acquired = await redis.set(lock_key, lock_token, nx=True, ex=10 * 60)
    if not acquired:
        return

    try:
        async with async_session() as session:
            async with UoW(session) as uow:
                repo = ScmIntegrationInterface(uow.session)
                integrations = await repo.list_all()

        # Run sequentially to avoid bursting provider rate-limits.
        for integration in integrations:
            try:
                await sync_integration_background(integration.id)
            except Exception:
                logger.exception("Auto-sync failed for integration %s", integration.id)
    finally:
        # Best-effort unlock if still ours.
        try:
            current = await redis.get(lock_key)
            if current == lock_token:
                await redis.delete(lock_key)
        except Exception:
            logger.exception("Failed to release auto-sync lock")
