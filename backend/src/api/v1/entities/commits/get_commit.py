from fastapi import APIRouter

from domain.entities.commits_models import CommitDTO

router = APIRouter()

@router.get(
    path="/{project_key}/{repo}/{sha}",
    response_model=CommitDTO,
)
async def get_commit(project_key: str, repo: str, sha: str):
    ...