from __future__ import annotations

import logging

from database.relational_db import UoW
from database.relational_db.tables.authors import AuthorInterface
from database.relational_db.tables.branches import BranchInterface
from database.relational_db.tables.commitfiles import CommitFileInterface
from database.relational_db.tables.commits import CommitInterface
from database.relational_db.tables.projects import Project, ProjectInterface
from database.relational_db.tables.repositories import Repository, RepositoryInterface
from domain.parsing.schemas import (
    BranchModel,
    CommitModel,
    DiffModel,
    ProjectModel,
    RepositoryModel,
)
from domain.parsing.schemas.common import APIListResponse, APIResponse

from .diff_parser import decode_diff_content, parse_diff
from .external_api import ExternalAPIClient
from .exceptions import ExternalAPIError


logger = logging.getLogger(__name__)


class SyncService:
    def __init__(
        self,
        client: ExternalAPIClient,
        uow: UoW,
        *,
        page_size: int = 50,
    ) -> None:
        self._client = client
        self._uow = uow
        self._page_size = page_size

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
        enriched_branches = []
        for branch in branches:
            branch.is_default = branch.name == (model.default_branch or "")
            enriched_branches.append(branch)
        await self._branches.sync_from_models(repository, enriched_branches)

        await self._sync_commits(project_key, model.key, repository)

    async def _sync_commits(
        self,
        project_key: str,
        repository_name: str,
        repository: Repository,
    ) -> None:
        cursor: str | None = None
        while True:
            logger.debug(
                "Fetching commits for %s/%s (cursor=%s)",
                project_key,
                repository_name,
                cursor,
            )
            commits, cursor = await self._fetch_commits(
                project_key,
                repository_name,
                cursor=cursor,
            )
            if not commits:
                break

            for commit_model in commits:
                await self._store_commit(project_key, repository_name, repository, commit_model)

            if not cursor:
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
            repository,
            commit_model,
            author,
            committer,
        )

        try:
            diff = await self._fetch_diff(project_key, repository_name, commit_model.sha)
        except ExternalAPIError as exc:
            logger.warning(
                "Failed to fetch diff for %s/%s@%s: %s",
                project_key,
                repository_name,
                commit_model.sha,
                exc,
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
    ) -> tuple[list[CommitModel], str | None]:
        params: dict[str, str | int | bool] = {"limit": self._page_size, "fullHistory": False}
        if cursor:
            params["cursor"] = cursor

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
