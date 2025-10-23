from fastapi import APIRouter

router = APIRouter()

@router.get(
    path="/{project_key}/{repo}/{sha}",
    response_model=None,
)
async def get_commit(project_key: str, repo: str, sha: str):
    ...