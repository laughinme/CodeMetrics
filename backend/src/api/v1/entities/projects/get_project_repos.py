from fastapi import APIRouter

router = APIRouter()

@router.get(
    path="/{project_key}/repos",
    response_model=None,
)
async def get_project_repos(project_key: str): 
    ...