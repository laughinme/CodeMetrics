from pydantic import BaseModel


class BranchOut(BaseModel):
    id: str
    name: str
    is_default: bool
