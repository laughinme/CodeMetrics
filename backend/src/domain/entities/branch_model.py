from uuid import UUID
from pydantic import BaseModel

class BranchOut(BaseModel):
    id: UUID
    name: str
    is_default: bool
    is_protected: bool
