from fastapi import APIRouter

router = APIRouter()

@router.get(
    path="/{project_key}/{repo}/branches",
    response_model=None,
)
async def get_repo_branches(project_key: str, repo: str): 
    ...