from fastapi import APIRouter

router = APIRouter()

@router.get(
    path="/",
    response_model=None,
)
async def get_projects(): # параметры since и until нужны (UTC? datetime.datetime?)
    ...