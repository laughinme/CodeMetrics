from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

from database.relational_db import (
    AggregateMetricsInterface,
    AuthorInterface,
    AuthorRepoDayDelta,
    BranchInterface,
    CommitFileInterface,
    CommitInterface,
    FileRepoDayDelta,
    HourRepoDayDelta,
    ProjectInterface,
    RepositoryInterface,
    SizeBucket,
    SizeBucketDelta,
    UoW,
)
from domain.parsing.schemas import (
    BranchModel,
    CommitModel,
    GitUser,
    ProjectModel,
    RepositoryModel,
)

from service.api_service.diff_parser import parse_diff
from service.scm_providers.github_client import GitHubClient, GitHubAPIError

logger = logging.getLogger(__name__)


class GitHubSyncService:
    SHORT_MESSAGE_THRESHOLD = 50

    def __init__(
        self,
        client: GitHubClient,
        uow: UoW,
        *,
        commit_window_days: int = 365,
        max_commit_pages: int = 50,
        resync_overlap_seconds: int = 60,
        include_forks: bool = False,
        flush_every_commits: int = 50,
        max_repos_per_owner: int = 20,
        user_repo_affiliation: str = "owner,collaborator,organization_member",
    ) -> None:
        self._client = client
        self._uow = uow
        self._commit_window = timedelta(days=commit_window_days) if commit_window_days > 0 else None
        self._max_commit_pages = max_commit_pages
        self._resync_overlap = timedelta(seconds=resync_overlap_seconds)
        self._include_forks = include_forks
        self._flush_every_commits = max(1, int(flush_every_commits))
        self._max_repos_per_owner = max(0, int(max_repos_per_owner))
        self._user_repo_affiliation = user_repo_affiliation or "owner,collaborator,organization_member"

        session = uow.session
        self._projects = ProjectInterface(session)
        self._repositories = RepositoryInterface(session)
        self._branches = BranchInterface(session)
        self._authors = AuthorInterface(session)
        self._commits = CommitInterface(session)
        self._commit_files = CommitFileInterface(session)
        self._aggregates = AggregateMetricsInterface(session)
        self._owner_projects: dict[str, Any] = {}
        self._synced_repo_full_names: set[str] = set()

    async def sync_user_and_orgs(self, *, integration_id) -> None:
        """
        Sync both:
        - personal repositories of the authenticated user
        - org repositories for orgs the user belongs to
        """
        # 1) Personal repos
        try:
            me = await self._client.get_me()
            me_project_model = ProjectModel(
                id=me.id,
                name=me.login,
                full_name=me.name or me.login,
                description=me.bio,
                is_public=False,
                lfs_allow=False,
                is_favorite=False,
                parent_id=None,
                permissions={"read": True},
                created_at=me.created_at,
                updated_at=me.updated_at,
            )
            me_project = await self._projects.upsert_from_model(
                me_project_model,
                provider="github",
                external_id=me.id,
                integration_id=integration_id,
            )
            self._owner_projects[me.login.lower()] = me_project
            await self._uow.session.flush()
            # Persist project early so dashboards can pick up partial sync progress.
            await self._uow.commit()
            await self._sync_user_repos(me_project, me.login, integration_id=integration_id)
        except GitHubAPIError as exc:
            logger.error("Failed to sync user repos: %s", exc)
        except Exception:
            logger.exception("Unexpected error while syncing user repos")

        # 2) Org repos
        orgs = await self._client.list_orgs()
        for org in orgs:
            project_model = ProjectModel(
                id=org.id,
                name=org.login,
                full_name=org.name or org.login,
                description=org.description,
                is_public=False,
                lfs_allow=False,
                is_favorite=False,
                parent_id=None,
                permissions={"read": True},
                created_at=org.created_at,
                updated_at=org.updated_at,
            )
            project = await self._projects.upsert_from_model(
                project_model,
                provider="github",
                external_id=org.id,
                integration_id=integration_id,
            )
            self._owner_projects[org.login.lower()] = project
            await self._uow.session.flush()
            # Persist project early so dashboards can pick up partial sync progress.
            await self._uow.commit()

            try:
                await self._sync_org_repos(project, org.login)
            except GitHubAPIError as exc:
                logger.error("Failed to sync org %s: %s", org.login, exc)
            except Exception:
                logger.exception("Unexpected error while syncing org %s", org.login)

    async def sync_orgs(self, *, integration_id) -> None:
        # Backward-compatible alias.
        await self.sync_user_and_orgs(integration_id=integration_id)

    async def _sync_org_repos(self, project, org_login: str) -> None:
        repos = await self._client.list_org_repos(org_login)
        if self._max_repos_per_owner:
            repos = repos[: self._max_repos_per_owner]
        for repo in repos:
            if not self._should_sync_repo(repo):
                continue

            repo_model = RepositoryModel(
                name=repo.name,
                owner_name=project.name,
                description=repo.description,
                default_branch=repo.default_branch,
                topics=repo.topics,
                permissions={"read": True},
                created_at=repo.created_at,
                updated_at=repo.updated_at,
            )
            repository = await self._repositories.upsert_from_model(project, repo_model)
            await self._sync_repo_branches(project_key=project.name, repository=repository, owner=repo.owner_login, repo=repo.name, default_branch=repo.default_branch)
            await self._sync_repo_commits(project_id=project.id, repository=repository, owner=repo.owner_login, repo=repo.name)
            await self._uow.commit()

    async def _sync_user_repos(self, project, user_login: str, *, integration_id) -> None:
        repos = await self._client.list_user_repos(affiliation=self._user_repo_affiliation)
        if self._max_repos_per_owner:
            repos = repos[: self._max_repos_per_owner]
        for repo in repos:
            if not self._should_sync_repo(repo):
                continue

            owner_login = repo.owner_login or user_login
            project_for_repo = project
            if owner_login and owner_login.lower() != user_login.lower():
                project_for_repo = await self._resolve_owner_project(owner_login, integration_id=integration_id)

            repo_model = RepositoryModel(
                name=repo.name,
                owner_name=project_for_repo.name,
                description=repo.description,
                default_branch=repo.default_branch,
                topics=repo.topics,
                permissions={"read": True},
                created_at=repo.created_at,
                updated_at=repo.updated_at,
            )
            repository = await self._repositories.upsert_from_model(project_for_repo, repo_model)
            await self._sync_repo_branches(
                project_key=project_for_repo.name,
                repository=repository,
                owner=owner_login,
                repo=repo.name,
                default_branch=repo.default_branch,
            )
            await self._sync_repo_commits(
                project_id=project_for_repo.id,
                repository=repository,
                owner=owner_login,
                repo=repo.name,
            )
            await self._uow.commit()

    async def _resolve_owner_project(self, owner_login: str, *, integration_id):
        key = owner_login.lower()
        cached = self._owner_projects.get(key)
        if cached is not None:
            return cached

        existing = await self._projects.get_by_name(owner_login, provider="github")
        if existing is not None:
            if existing.integration_id is None:
                existing.integration_id = integration_id
            self._owner_projects[key] = existing
            return existing

        now = datetime.now(UTC)
        owner_project_model = ProjectModel(
            id=0,
            name=owner_login,
            full_name=owner_login,
            description=f"GitHub owner {owner_login}",
            is_public=False,
            lfs_allow=False,
            is_favorite=False,
            parent_id=None,
            permissions={"read": True},
            created_at=now,
            updated_at=now,
        )
        project = await self._projects.upsert_from_model(
            owner_project_model,
            provider="github",
            external_id=None,
            integration_id=integration_id,
        )
        await self._uow.session.flush()
        self._owner_projects[key] = project
        return project

    def _should_sync_repo(self, repo) -> bool:
        if repo.is_fork and not self._include_forks:
            return False

        full_name = (repo.full_name or "").strip().lower()
        if not full_name:
            full_name = f"{(repo.owner_login or '').strip().lower()}/{repo.name.strip().lower()}"
        if full_name in self._synced_repo_full_names:
            return False
        self._synced_repo_full_names.add(full_name)
        return True

    async def _sync_repo_branches(self, *, project_key: str, repository, owner: str, repo: str, default_branch: str | None) -> None:
        branches = await self._client.list_branches(owner, repo)
        branch_models: list[BranchModel] = []
        for b in branches:
            branch_models.append(
                BranchModel(
                    name=b.name,
                    is_protected=b.protected,
                    is_default=(b.name == (default_branch or "")),
                )
            )
        await self._branches.sync_from_models(repository, branch_models)

    async def _sync_repo_commits(self, *, project_id: int, repository, owner: str, repo: str) -> None:
        latest_created = await self._commits.get_latest_created_at(repository.id)
        since: datetime | None = None
        if latest_created is not None:
            since = latest_created - self._resync_overlap
        elif self._commit_window is not None:
            since = datetime.now(UTC) - self._commit_window

        # GitHub pagination is via Link headers; cap by pages using max_pages.
        commits = await self._client.list_commits(
            owner,
            repo,
            since=since,
            per_page=100,
            max_pages=self._max_commit_pages,
        )

        author_deltas: list[AuthorRepoDayDelta] = []
        hour_deltas: list[HourRepoDayDelta] = []
        size_deltas: list[SizeBucketDelta] = []
        file_deltas: list[FileRepoDayDelta] = []

        processed = 0
        # API returns newest-first; store in that order.
        for commit in commits:
            await self._store_commit(
                project_id=project_id,
                repository=repository,
                owner=owner,
                repo=repo,
                commit=commit,
                author_deltas=author_deltas,
                hour_deltas=hour_deltas,
                size_deltas=size_deltas,
                file_deltas=file_deltas,
            )
            processed += 1
            if processed % self._flush_every_commits == 0:
                await self._flush_aggregate_deltas(author_deltas, hour_deltas, size_deltas, file_deltas)
                author_deltas.clear()
                hour_deltas.clear()
                size_deltas.clear()
                file_deltas.clear()
                await self._uow.commit()

        await self._flush_aggregate_deltas(author_deltas, hour_deltas, size_deltas, file_deltas)
        await self._uow.commit()

    async def _store_commit(
        self,
        *,
        project_id: int,
        repository,
        owner: str,
        repo: str,
        commit,
        author_deltas: list[AuthorRepoDayDelta],
        hour_deltas: list[HourRepoDayDelta],
        size_deltas: list[SizeBucketDelta],
        file_deltas: list[FileRepoDayDelta],
    ) -> None:
        created_at = commit.created_at or datetime.now(UTC)

        author_user = None
        if commit.author_name or commit.author_email:
            author_user = GitUser(
                name=commit.author_name or "Unknown",
                email=commit.author_email or "unknown@example.com",
            )
        committer_user = None
        if commit.committer_name or commit.committer_email:
            committer_user = GitUser(
                name=commit.committer_name or (author_user.name if author_user else "Unknown"),
                email=commit.committer_email or (author_user.email if author_user else "unknown@example.com"),
            )

        author_obj = await self._authors.get_or_create(author_user) if author_user else None
        if author_obj is not None:
            await self._authors.touch_commit_window(author_obj, created_at)
        committer_obj = await self._authors.get_or_create(committer_user) if committer_user else None
        if committer_obj is not None:
            await self._authors.touch_commit_window(committer_obj, created_at)

        commit_model = CommitModel(
            sha=commit.sha,
            author=author_user,
            committer=committer_user,
            created_at=created_at,
            message=commit.message,
            issues={},
            parents=commit.parents,
            branch_names=[],
            tag_names=[],
            old_tags=[],
        )

        db_commit, created = await self._commits.upsert_from_model(
            repository,
            commit_model,
            author_obj,
            committer_obj,
        )

        if not created and db_commit.diff_content is not None:
            return

        diff_text = ""
        try:
            diff_text = await self._client.get_commit_diff_text(owner, repo, commit.sha)
        except GitHubAPIError as exc:
            logger.warning("Failed to fetch diff for %s/%s@%s: %s", owner, repo, commit.sha, exc)

        files, added, deleted = parse_diff(diff_text or "")
        files_changed = len(files)
        await self._commit_files.replace_for_commit(commit.sha, files)
        await self._commits.apply_diff_stats(
            db_commit,
            diff_content=diff_text or "",
            added_lines=added,
            deleted_lines=deleted,
            files_changed=files_changed,
        )

        if not created:
            return

        day = created_at.astimezone(UTC).date()
        hour = created_at.astimezone(UTC).hour
        churn = added + deleted
        message = (commit.message or "").strip()
        message_length = len(message)
        short_flag = 1 if message_length < self.SHORT_MESSAGE_THRESHOLD else 0

        author_id = None
        if author_obj is not None:
            author_id = author_obj.id
        elif committer_obj is not None:
            author_id = committer_obj.id

        if author_id is not None:
            author_deltas.append(
                AuthorRepoDayDelta(
                    day=day,
                    project_id=project_id,
                    repo_id=repository.id,
                    author_id=author_id,
                    commits=1,
                    lines_added=added,
                    lines_deleted=deleted,
                    files_changed=files_changed,
                    msg_total_len=message_length,
                    msg_short_count=short_flag,
                )
            )

        hour_deltas.append(
            HourRepoDayDelta(
                day=day,
                project_id=project_id,
                repo_id=repository.id,
                hour=hour,
                commits=1,
                lines_added=added,
                lines_deleted=deleted,
            )
        )

        size_deltas.append(
            SizeBucketDelta(
                day=day,
                project_id=project_id,
                repo_id=repository.id,
                bucket=self._map_size_bucket(churn),
                cnt=1,
            )
        )

        for file_payload in files:
            file_deltas.append(
                FileRepoDayDelta(
                    day=day,
                    project_id=project_id,
                    repo_id=repository.id,
                    path=file_payload.path,
                    commits_touch=1,
                    lines_added=file_payload.added_lines,
                    lines_deleted=file_payload.deleted_lines,
                    churn=file_payload.added_lines + file_payload.deleted_lines,
                )
            )

    async def _flush_aggregate_deltas(
        self,
        author_deltas: list[AuthorRepoDayDelta],
        hour_deltas: list[HourRepoDayDelta],
        size_deltas: list[SizeBucketDelta],
        file_deltas: list[FileRepoDayDelta],
    ) -> None:
        if author_deltas:
            await self._aggregates.upsert_author_repo_day(author_deltas)
        if hour_deltas:
            await self._aggregates.upsert_hour_repo_day(hour_deltas)
        if size_deltas:
            await self._aggregates.upsert_size_buckets(size_deltas)
        if file_deltas:
            await self._aggregates.upsert_hot_files(file_deltas)

    @staticmethod
    def _map_size_bucket(churn: int) -> SizeBucket:
        if churn <= 10:
            return SizeBucket.ZERO_TEN
        if churn <= 50:
            return SizeBucket.ELEVEN_FIFTY
        if churn <= 100:
            return SizeBucket.FIFTY_ONE_HUNDRED
        return SizeBucket.HUNDRED_PLUS
