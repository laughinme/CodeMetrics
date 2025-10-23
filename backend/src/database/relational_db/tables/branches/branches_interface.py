from __future__ import annotations

from datetime import datetime, UTC

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from domain.parsing.schemas.branches import BranchModel

from ..commits.commits_table import Commit
from ..repositories.repositories_table import Repository
from .branches_table import Branch


class BranchInterface:
    """
    Storage helpers for repository branches.
    """

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
            branch.head_commit_sha = model.last_commit.sha if model.last_commit else None
            synced.append(branch)

            if model.last_commit:
                # Ensure commit row exists even if not yet processed through commit sync.
                await self._ensure_commit_placeholder(
                    repository=repository,
                    sha=model.last_commit.sha,
                )

        # Remove branches that disappeared from upstream payload
        for branch_name, branch in existing_map.items():
            if branch_name not in seen_names:
                await self.session.delete(branch)

        return synced

    async def _ensure_commit_placeholder(self, repository: Repository, sha: str) -> None:
        commit = await self.session.get(Commit, sha)
        if commit is None:
            placeholder = Commit(
                sha=sha,
                repo_id=repository.id,
                author_name="Unknown",
                author_email="unknown@example.com",
                created_at=datetime.now(UTC),
                message="",
            )
            self.session.add(placeholder)
