from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from domain.parsing import BranchModel
from .branches_table import Branch
from ..repositories import Repository


class BranchInterface:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def sync_from_models(
        self,
        repository: Repository,
        branches: list[BranchModel],
    ) -> list[Branch]:
        existing = await self.session.execute(
            select(Branch).where(Branch.repo_id == repository.id)
        )
        existing_map = {branch.name: branch for branch in existing.scalars().all()}

        seen_names: set[str] = set()
        synced: list[Branch] = []
        for model in branches:
            seen_names.add(model.name)
            branch = existing_map.get(model.name)
            if branch is None:
                branch = Branch(repo_id=repository.id, name=model.name)
                self.session.add(branch)

            branch.is_protected = model.is_protected
            branch.is_default = model.is_default
            synced.append(branch)

        # Remove branches that disappeared from upstream payload
        for branch_name, branch in existing_map.items():
            if branch_name not in seen_names:
                await self.session.delete(branch)

        return synced

    async def list_for_repository(self, repository_id: UUID) -> list[Branch]:
        rows = await self.session.scalars(
            select(Branch)
            .where(Branch.repo_id == repository_id)
            .order_by(Branch.name)
        )
        return list(rows.all())
