from __future__ import annotations

import uuid
from datetime import datetime
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
    ) -> tuple[Commit, bool]:
        commit = await self.session.get(Commit, model.sha)
        created = False
        if commit is None:
            commit = Commit(sha=model.sha, repo_id=repository.id)
            self.session.add(commit)
            created = True
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

        return commit, created

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

    async def list_recent(
        self,
        repository_id: uuid.UUID,
        *,
        limit: int,
        after: datetime | None = None,
        cursor: tuple[datetime, str] | None = None,
    ) -> tuple[list[Commit], tuple[datetime, str] | None]:
        stmt = select(Commit).where(Commit.repo_id == repository_id)
        if after is not None:
            stmt = stmt.where(Commit.created_at >= after)
        if cursor is not None:
            cursor_dt, cursor_sha = cursor
            stmt = stmt.where(
                (Commit.created_at < cursor_dt)
                | ((Commit.created_at == cursor_dt) & (Commit.sha < cursor_sha))
            )

        stmt = (
            stmt.order_by(Commit.created_at.desc(), Commit.sha.desc())
            .limit(limit + 1)
            .options(
                selectinload(Commit.author),
                selectinload(Commit.committer),
                selectinload(Commit.files),
                selectinload(Commit.repository).selectinload(Repository.project),
            )
        )

        result = await self.session.execute(stmt)
        commits = list(result.scalars().all())

        next_cursor = None
        if len(commits) > limit:
            overflow = commits.pop(limit)
            next_cursor = (overflow.created_at, overflow.sha)

        return commits, next_cursor

    async def list_recent_filtered(
        self,
        *,
        limit: int,
        since: datetime | None = None,
        until: datetime | None = None,
        project_id: int | None = None,
        repo_ids: Sequence[uuid.UUID] | None = None,
        author_ids: Sequence[uuid.UUID] | None = None,
        cursor: tuple[datetime, str] | None = None,
    ) -> tuple[list[Commit], tuple[datetime, str] | None]:
        if limit <= 0:
            return [], None

        stmt = select(Commit).join(Repository)
        if project_id is not None:
            stmt = stmt.where(Repository.project_id == project_id)
        if repo_ids:
            stmt = stmt.where(Commit.repo_id.in_(tuple(repo_ids)))
        if author_ids:
            stmt = stmt.where(Commit.author_id.in_(tuple(author_ids)))
        if since is not None:
            stmt = stmt.where(Commit.created_at >= since)
        if until is not None:
            stmt = stmt.where(Commit.created_at <= until)
        if cursor is not None:
            cursor_dt, cursor_sha = cursor
            stmt = stmt.where(
                (Commit.created_at < cursor_dt)
                | ((Commit.created_at == cursor_dt) & (Commit.sha < cursor_sha))
            )

        stmt = (
            stmt.order_by(Commit.created_at.desc(), Commit.sha.desc())
            .limit(limit + 1)
            .options(
                selectinload(Commit.author),
                selectinload(Commit.committer),
                selectinload(Commit.files),
                selectinload(Commit.repository).selectinload(Repository.project),
            )
        )

        result = await self.session.execute(stmt)
        commits = list(result.scalars().all())

        next_cursor = None
        if len(commits) > limit:
            overflow = commits.pop(limit)
            next_cursor = (overflow.created_at, overflow.sha)

        return commits, next_cursor
