from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from database.relational_db import (
    BranchInterface,
    CommitInterface,
    ProjectInterface,
    RepositoryInterface,
    Project,
    Repository,
    UoW,
    Author,
    Branch,
    Commit
)
from domain.entities import CommitOut
from domain.entities.commons import AuthorRef, Page, RepoRef

class EntityService:
    def __init__(
        self,
        uow: UoW,
        project_repo: ProjectInterface,
        repository_repo: RepositoryInterface,
        branch_repo: BranchInterface,
        commit_repo: CommitInterface,
    ) -> None:
        self.uow = uow
        self.project_repo = project_repo
        self.repository_repo = repository_repo
        self.branch_repo = branch_repo
        self.commit_repo = commit_repo

    async def get_project(self, project_id: int) -> Optional[Project]:
        return await self.project_repo.get_by_id(project_id)

    async def list_projects(self) -> list[Project]:
        return await self.project_repo.list_all()

    async def get_project_repos(self, project_id: int) -> list[Repository]:
        return await self.project_repo.get_repos(project_id)

    async def list_repo_branches(self, repo_id: UUID) -> list[Branch] | None:
        repository = await self.repository_repo.get_by_id(repo_id)
        if repository is None:
            return None
        return await self.branch_repo.list_for_repository(repository.id)

    async def list_repo_commits(
        self,
        repo_id: UUID,
        *,
        limit: int,
        cursor: str | None = None,
        after: datetime | None = None,
    ) -> Page[CommitOut] | None:
        repository = await self.repository_repo.get_by_id(repo_id)
        if repository is None:
            return None

        after_dt = self._normalize_datetime(after)
        cursor_tuple = self._decode_cursor(cursor) if cursor else None

        commits, next_cursor_tuple = await self.commit_repo.list_recent(
            repository.id,
            limit=limit,
            after=after_dt,
            cursor=cursor_tuple,
        )

        items = [self._map_commit(commit) for commit in commits]
        next_cursor = self._encode_cursor(next_cursor_tuple) if next_cursor_tuple else None
        return Page[CommitOut](items=items, next_cursor=next_cursor)

    @staticmethod
    def _normalize_datetime(value: datetime | None) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value

    @staticmethod
    def _decode_cursor(cursor: str) -> tuple[datetime, str]:
        created_str, sha = cursor.split("|", 1)
        created_at = datetime.fromisoformat(created_str)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        return created_at, sha

    @staticmethod
    def _encode_cursor(cursor: tuple[datetime, str]) -> str:
        created_at, sha = cursor
        return f"{created_at.isoformat()}|{sha}"

    def _map_commit(self, commit: Commit) -> CommitOut:
        repository = commit.repository
        project = repository.project if repository else None
        repo_ref = RepoRef(
            project_key=project.name if project else "",
            name=repository.name if repository else "",
        )

        author_ref = self._build_author_ref(
            commit.author,
            commit.author_name,
            commit.author_email,
        )
        committer_ref = self._build_author_ref(
            commit.committer,
            commit.committer_name,
            commit.committer_email,
        )

        files_changed = len(commit.files)

        return CommitOut(
            sha=commit.sha,
            repo=repo_ref,
            author=author_ref,
            committer=committer_ref,
            committed_at=commit.created_at,
            message=commit.message,
            is_merge=commit.is_merge_commit,
            added_lines=commit.added_lines,
            deleted_lines=commit.deleted_lines,
            files_changed=files_changed,
        )

    @staticmethod
    def _build_author_ref(
        author: Author | None,
        name: str | None,
        email: str | None,
    ) -> AuthorRef:
        def _safe_email(value: str | None) -> str | None:
            if value and "@" in value:
                return value
            return None

        if author is not None:
            return AuthorRef(
                id=str(author.id),
                name=author.git_name,
                email=_safe_email(author.git_email),
            )

        if not name and not email:
            return AuthorRef(id="unknown", name="Unknown", email=None)

        fallback_email = _safe_email(email)
        return AuthorRef(id=name or (fallback_email or "unknown"), name=name or "Unknown", email=fallback_email)
