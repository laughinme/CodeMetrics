from fastapi import APIRouter

router = APIRouter()

@router.get(
    path="/{project_key}",
    response_model=None,
)
async def get_project_by_key(project_key: str): 
    ...