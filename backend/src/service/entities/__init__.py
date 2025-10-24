from fastapi import Depends

from database.relational_db import (
    BranchInterface,
    CommitInterface,
    ProjectInterface,
    RepositoryInterface,
    UoW,
    get_uow,
)
from .entity_service import EntityService


async def get_entity_service(
    uow: UoW = Depends(get_uow),
    # redis = Depends(get_redis),
) -> EntityService:
    session = uow.session
    project_repo = ProjectInterface(session)
    repository_repo = RepositoryInterface(session)
    branch_repo = BranchInterface(session)
    commit_repo = CommitInterface(session)
    return EntityService(uow, project_repo, repository_repo, branch_repo, commit_repo)
