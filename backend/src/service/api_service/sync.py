from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta

from database.relational_db import (
    UoW,
    AuthorInterface, 
    BranchInterface, 
    CommitFileInterface, 
    CommitInterface, 
    ProjectInterface, 
    Repository,
    RepositoryInterface,
    Project,
)
from domain.parsing.schemas import (
    BranchModel,
    CommitModel,
    DiffModel,
    ProjectModel,
    RepositoryModel,
    APIListResponse,
    APIResponse
)

from .diff_parser import decode_diff_content, parse_diff
from .external_api import ExternalAPIClient
from .exceptions import ExternalAPIError


logger = logging.getLogger(__name__)


class SourceCodeSyncService:
    def __init__(
        self,
        client: ExternalAPIClient,
        uow: UoW,
        *,
        page_size: int = 500,
        commit_window_days: int = 90,
        max_commit_pages: int = 20,
        resync_overlap_seconds: int = 60,
    ) -> None:
        self._client = client
        self._uow = uow
        self._page_size = min(page_size, 500)
        self._commit_window = (
            timedelta(days=commit_window_days) if commit_window_days > 0 else None
        )
        self._max_commit_pages = max_commit_pages
        self._resync_overlap = timedelta(seconds=resync_overlap_seconds)

        session = uow.session
        self._projects = ProjectInterface(session)
        self._repositories = RepositoryInterface(session)
        self._branches = BranchInterface(session)
        self._authors = AuthorInterface(session)
        self._commits = CommitInterface(session)
        self._commit_files = CommitFileInterface(session)

    async def sync_all(self) -> None:
        projects = await self._fetch_projects()
        for project_model in projects:
            try:
                project = await self._projects.upsert_from_model(project_model)
                await self._sync_project(project, project_model)
                await self._uow.commit()
            except ExternalAPIError as exc:
                logger.error("Failed to sync project %s: %s", project_model.name, exc)
            except Exception:
                logger.exception("Unexpected error while syncing project %s", project_model.name)

    async def _sync_project(self, project: Project, model: ProjectModel) -> None:
        logger.info("Syncing project %s (%s)", model.name, project.id)
        repositories = await self._fetch_repositories(model.name)
        for repo_model in repositories:
            repository = await self._repositories.upsert_from_model(project, repo_model)
            await self._sync_repository(model.name, repository, repo_model)

    async def _sync_repository(
        self,
        project_key: str,
        repository: Repository,
        model: RepositoryModel,
    ) -> None:
        logger.info("Syncing repository %s/%s", project_key, model.key)
        branches = await self._fetch_branches(project_key, model.key)
        for branch in branches:
            branch.is_default = branch.name == (model.default_branch or "")
        await self._branches.sync_from_models(repository, branches)

        await self._sync_commits(project_key, model.key, repository)

    async def _sync_commits(
        self,
        project_key: str,
        repository_name: str,
        repository: Repository,
    ) -> None:
        after_iso: str | None = None
        
        latest_created = await self._commits.get_latest_created_at(repository.id)
        if latest_created is not None:
            anchor = latest_created - self._resync_overlap
            after_iso = anchor.isoformat()
        elif self._commit_window is not None:
            anchor = datetime.now(UTC) - self._commit_window
            after_iso = anchor.isoformat()

        cursor: str | None = None
        page = 0
        while True:
            logger.debug(
                "Fetching commits for %s/%s page=%d cursor=%s after=%s",
                project_key, repository_name, page, cursor, after_iso,
            )
            commits, cursor = await self._fetch_commits(
                project_key, repository_name, cursor=cursor, after=after_iso,
            )
            logger.debug(
                "Fetched %d commits for %s/%s page=%d next_cursor=%s",
                len(commits), project_key, repository_name, page, cursor,
            )

            if not commits:
                break

            for commit_model in commits:
                await self._store_commit(project_key, repository_name, repository, commit_model)

            page += 1
            if not cursor:
                break
            if self._max_commit_pages and page >= self._max_commit_pages:
                logger.info(
                    "Stopping commit fetch for %s/%s after %d pages (cap reached)",
                    project_key, repository_name, self._max_commit_pages,
                )
                break

    async def _store_commit(
        self,
        project_key: str,
        repository_name: str,
        repository: Repository,
        commit_model: CommitModel,
    ) -> None:
        author = await self._authors.get_or_create(commit_model.author)
        await self._authors.touch_commit_window(author, commit_model.created_at)

        committer = await self._authors.get_or_create(commit_model.committer)
        await self._authors.touch_commit_window(committer, commit_model.created_at)

        commit = await self._commits.upsert_from_model(
            repository, commit_model, author, committer,
        )

        try:
            diff = await self._fetch_diff(project_key, repository_name, commit_model.sha)
        except ExternalAPIError as exc:
            logger.warning(
                "Failed to fetch diff for %s/%s@%s: %s",
                project_key, repository_name, commit_model.sha, exc,
            )
            diff = None

        diff_text = decode_diff_content(diff.content if diff else None)
        files, added, deleted = parse_diff(diff_text)
        await self._commit_files.replace_for_commit(commit_model.sha, files)
        await self._commits.apply_diff_stats(
            commit,
            diff_content=diff_text,
            added_lines=added,
            deleted_lines=deleted,
            files_changed=len(files),
        )

    async def _fetch_projects(self) -> list[ProjectModel]:
        payload = await self._client.get_json("/projects")
        response = APIListResponse[ProjectModel].model_validate(payload)
        return response.data

    async def _fetch_repositories(self, project_key: str) -> list[RepositoryModel]:
        payload = await self._client.get_json(f"/projects/{project_key}/repos")
        response = APIListResponse[RepositoryModel].model_validate(payload)
        return response.data

    async def _fetch_branches(
        self,
        project_key: str,
        repo_name: str,
    ) -> list[BranchModel]:
        payload = await self._client.get_json(
            f"/projects/{project_key}/repos/{repo_name}/branches"
        )
        response = APIListResponse[BranchModel].model_validate(payload)
        return response.data

    async def _fetch_commits(
        self,
        project_key: str,
        repo_name: str,
        *,
        cursor: str | None = None,
        after: str | None = None,
    ) -> tuple[list[CommitModel], str | None]:
        params: dict[str, str | int | bool] = {"limit": self._page_size, "fullHistory": False}
        if cursor:
            params["cursor"] = cursor
        if after:
            params["after"] = after

        payload = await self._client.get_json(
            f"/projects/{project_key}/repos/{repo_name}/commits",
            params=params,
        )
        response = APIListResponse[CommitModel].model_validate(payload)
        next_cursor = response.page.next_cursor if response.page else None
        return response.data, next_cursor

    async def _fetch_diff(
        self,
        project_key: str,
        repo_name: str,
        sha: str,
    ) -> DiffModel | None:
        payload = await self._client.get_json(
            f"/projects/{project_key}/repos/{repo_name}/commits/{sha}/diff",
            params={"binary": False},
        )
        if not payload.get("data"):
            return None
        response = APIResponse[DiffModel].model_validate(payload)
        return response.data
