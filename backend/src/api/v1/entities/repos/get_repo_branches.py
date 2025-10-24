from fastapi import APIRouter

from domain.entities.branch_model import BranchDTO

router = APIRouter()

@router.get(
    path="/{project_key}/{repo}/branches",
    response_model=BranchDTO,
)
async def get_repo_branches(project_key: str, repo: str): 
    ...