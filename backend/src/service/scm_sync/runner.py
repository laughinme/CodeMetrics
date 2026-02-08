from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
from uuid import UUID

from core.secrets import SecretEncryptionError, decrypt_str
from database.relational_db import UoW
from database.relational_db.session import async_session
from database.relational_db.tables.scm_integrations import ScmIntegrationInterface
from service.scm_providers.github_client import GitHubClient
from service.scm_sync.github_sync import GitHubSyncService

logger = logging.getLogger(__name__)

_locks: dict[UUID, asyncio.Lock] = {}
_locks_guard = asyncio.Lock()


async def _get_lock(integration_id: UUID) -> asyncio.Lock:
    async with _locks_guard:
        lock = _locks.get(integration_id)
        if lock is None:
            lock = asyncio.Lock()
            _locks[integration_id] = lock
        return lock


async def sync_integration_background(integration_id: UUID) -> None:
    """
    Runs a sync for an integration in a separate DB session.

    Safe to call from:
    - API endpoints (fire-and-forget)
    - scheduler jobs
    """
    lock = await _get_lock(integration_id)
    if lock.locked():
        return

    async with lock:
        async with async_session() as session:
            async with UoW(session) as uow:
                repo = ScmIntegrationInterface(uow.session)
                integration = await repo.get_by_id(integration_id)
                if integration is None:
                    return

                integration.last_sync_status = "running"
                integration.last_sync_error = None
                integration.last_sync_at = datetime.now(UTC)
                await uow.commit()

            async with UoW(session) as uow2:
                repo2 = ScmIntegrationInterface(uow2.session)
                integration2 = await repo2.get_by_id(integration_id)
                if integration2 is None:
                    return

                try:
                    if integration2.provider != "github":
                        integration2.last_sync_status = "skipped"
                        integration2.last_sync_error = "Unsupported provider"
                        integration2.last_sync_at = datetime.now(UTC)
                        await uow2.commit()
                        return

                    access_token = decrypt_str(integration2.access_token_enc)
                    client = GitHubClient(access_token)
                    sync = GitHubSyncService(client=client, uow=uow2)
                    await sync.sync_user_and_orgs(integration_id=integration2.id)

                    integration2.last_sync_status = "ok"
                    integration2.last_sync_error = None
                    integration2.last_sync_at = datetime.now(UTC)
                except SecretEncryptionError as exc:
                    integration2.last_sync_status = "error"
                    integration2.last_sync_error = str(exc)[:2000]
                    integration2.last_sync_at = datetime.now(UTC)
                    logger.exception("Failed to decrypt token for integration %s", integration_id)
                except Exception as exc:
                    integration2.last_sync_status = "error"
                    integration2.last_sync_error = str(exc)[:2000]
                    integration2.last_sync_at = datetime.now(UTC)
                    logger.exception("Integration sync failed for %s", integration_id)
                finally:
                    await uow2.commit()

