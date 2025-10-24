from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from domain.parsing.schemas.commits import CommitModel

from .commits_table import Commit
from ..authors import Author
from ..repositories import Repository


class CommitInterface:
    """Helpers for persisting commits."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert_from_model(
        self,
        repository: Repository,
        model: CommitModel,
        author: Author | None,
        committer: Author | None,
    ) -> Commit:
        commit = await self.session.get(Commit, model.sha)
        if commit is None:
            commit = Commit(sha=model.sha, repo_id=repository.id)
            self.session.add(commit)
        else:
            commit.repo_id = repository.id

        commit.author = author
        commit.committer = committer
        commit.author_name = model.author.name if model.author else author.git_name if author else "Unknown"
        commit.author_email = model.author.email if model.author else author.git_email if author else "unknown@example.com"
        commit.committer_name = (
            model.committer.name if model.committer else committer.git_name if committer else None
        )
        commit.committer_email = (
            model.committer.email if model.committer else committer.git_email if committer else None
        )
        commit.created_at = model.created_at
        commit.committed_at = model.created_at
        commit.message = (model.message or "").strip()
        commit.issues = model.issues or {}
        commit.parents = model.parents or []
        commit.branch_names = model.branch_names or []
        commit.tag_names = model.tag_names or []
        commit.old_tag_names = model.old_tags or []
        commit.is_merge_commit = len(commit.parents) > 1 or commit.is_merge_commit

        return commit

    async def apply_diff_stats(
        self,
        commit: Commit,
        *,
        diff_content: str,
        added_lines: int,
        deleted_lines: int,
        files_changed: int,
    ) -> Commit:
        commit.diff_content = diff_content
        commit.added_lines = added_lines
        commit.deleted_lines = deleted_lines
        commit.is_merge_commit = commit.is_merge_commit or files_changed > 0 and len(commit.parents) > 1
        return commit

    async def get_latest_created_at(self, repository_id: uuid.UUID) -> datetime | None:
        stmt = (
            select(Commit.created_at)
            .where(Commit.repo_id == repository_id)
            .order_by(Commit.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
