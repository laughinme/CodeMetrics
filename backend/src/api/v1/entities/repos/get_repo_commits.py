from fastapi import APIRouter

from domain.entities.commits_models import CommitDTO

router = APIRouter()

@router.get(
    path="/{project_key}/{repo}/commits",
    response_model=list[CommitDTO],
)
async def get_repo_commits(project_key: str, repo: str): # +параметры cursor, limit, before, after, author
    ...