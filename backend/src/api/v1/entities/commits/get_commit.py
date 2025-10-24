from fastapi import APIRouter

from domain.entities.commits_models import CommitOut

router = APIRouter()

@router.get(
    path="/{project_key}/{repo}/{sha}",
    response_model=CommitOut,
)
async def get_commit(project_key: str, repo: str, sha: str):
    ...