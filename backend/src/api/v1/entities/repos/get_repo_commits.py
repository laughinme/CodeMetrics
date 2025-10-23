from fastapi import APIRouter

router = APIRouter()

@router.get(
    path="/{project_key}/{repo}/commits",
    response_model=None,
)
async def get_repo_commits(project_key: str, repo: str): # +параметры cursor, limit, before, after, author
    ...