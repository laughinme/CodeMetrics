from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from domain.parsing.schemas.repos import RepositoryModel

from ..projects.projects_table import Project
from .repositories_table import Repository


class RepositoryInterface:
    """
    Persistence helper for repository entities.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def upsert_from_model(
        self,
        project: Project,
        model: RepositoryModel,
    ) -> Repository:
        stmt = select(Repository).where(
            Repository.project_id == project.id,
            Repository.name == model.key,
        )
        repository = await self.session.scalar(stmt)

        if repository is None:
            repository = Repository(project_id=project.id, name=model.key)
            self.session.add(repository)

        repository.description = model.description
        repository.default_branch = model.default_branch
        # repository.is_fork = model.is_fork
        # repository.fork_slug = (
        #     f"{model.fork_slug.owner}/{model.fork_slug.name}"
        #     if model.fork_slug
        #     else None
        # )
        # repository.enable_paths_restrictions = model.enable_paths_restrictions
        # repository.clone_links = (
        #     model.clone_links.model_dump(exclude_none=True)
        #     if model.clone_links
        #     else {}
        # )
        repository.permissions = model.permissions or {}
        repository.topics = model.topics or []
        # repository.structure_path_include = [
        #     rule.model_dump(exclude_none=True) for rule in model.repo_structure_paths_include
        # ]
        # repository.structure_path_exclude = [
        #     rule.model_dump(exclude_none=True) for rule in model.repo_structure_paths_exclude
        # ]
        repository.created_at = model.created_at
        repository.updated_at = model.updated_at

        return repository
