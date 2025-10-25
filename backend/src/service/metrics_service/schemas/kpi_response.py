from pydantic import BaseModel

class CommitSizeStats(BaseModel):
    mean: float
    median: float

class MessageQualityStats(BaseModel):
    avg_length: float
    short_percentage: float 

class KPIResponse(BaseModel):
    commits_count: int
    active_developers: int
    active_repositories: int
    avg_commit_size: CommitSizeStats
    message_quality: MessageQualityStats
