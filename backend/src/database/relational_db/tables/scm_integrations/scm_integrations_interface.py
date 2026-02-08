from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .scm_integrations_table import ScmIntegration


class ScmIntegrationInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_for_user(self, user_id: UUID) -> list[ScmIntegration]:
        rows = await self.session.scalars(
            select(ScmIntegration).where(ScmIntegration.user_id == user_id)
        )
        return list(rows.all())

    async def get_for_user(self, user_id: UUID, integration_id: UUID) -> ScmIntegration | None:
        return await self.session.scalar(
            select(ScmIntegration).where(
                ScmIntegration.user_id == user_id,
                ScmIntegration.id == integration_id,
            )
        )

    async def get_by_provider_external_id(
        self,
        *,
        user_id: UUID,
        provider: str,
        external_id: str | None,
    ) -> ScmIntegration | None:
        stmt = select(ScmIntegration).where(
            ScmIntegration.user_id == user_id,
            ScmIntegration.provider == provider,
        )
        if external_id is None:
            stmt = stmt.where(ScmIntegration.external_id.is_(None))
        else:
            stmt = stmt.where(ScmIntegration.external_id == external_id)
        return await self.session.scalar(stmt)

    async def upsert(
        self,
        *,
        user_id: UUID,
        provider: str,
        external_id: str | None,
        external_login: str | None,
        access_token_enc: str,
        refresh_token_enc: str | None,
        token_expires_at,
        scopes: list[str],
    ) -> ScmIntegration:
        existing = await self.get_by_provider_external_id(
            user_id=user_id, provider=provider, external_id=external_id
        )
        if existing is None:
            existing = ScmIntegration(
                user_id=user_id,
                provider=provider,
                external_id=external_id,
            )
            self.session.add(existing)

        existing.external_login = external_login
        existing.access_token_enc = access_token_enc
        existing.refresh_token_enc = refresh_token_enc
        existing.token_expires_at = token_expires_at
        existing.scopes = scopes
        return existing

