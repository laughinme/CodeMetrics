from pydantic import BaseModel

class HourlyCommitPoint(BaseModel):
    hour: int   
    count: int