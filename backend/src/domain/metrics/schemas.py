from __future__ import annotations

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MessageQualityBlock(BaseModel):
    avg_length: float = Field(0.0, description="Average commit message length")
    short_pct: float = Field(0.0, description="Percentage of short messages")


class CommitSizeStats(BaseModel):
    mean: float | None = Field(None, description="Approximate mean churn per commit")
    median: float | None = Field(None, description="Approximate median churn per commit")


class KPIBlock(BaseModel):
    commits: int = 0
    active_devs: int = 0
    active_repos: int = 0
    avg_commit_size: CommitSizeStats = Field(default_factory=CommitSizeStats)
    msg_quality: MessageQualityBlock = Field(default_factory=MessageQualityBlock)


class CommitSeriesPoint(BaseModel):
    date: date
    count: int = Field(..., description="Commits on the day")


class HourHeatmapPointOut(BaseModel):
    hour: int
    commits: int = 0
    share_pct: float = 0.0
    lines_added: int = 0
    lines_deleted: int = 0


class WeekdayHeatmapPointOut(BaseModel):
    weekday: int = Field(..., description="0=Sunday .. 6=Saturday")
    commits: int = 0
    share_pct: float = 0.0


class SizeBucketPoint(BaseModel):
    bucket: str
    count: int


class PersonRef(BaseModel):
    id: UUID | None = None
    name: str | None = None
    email: str | None = None


class RepoRefSummary(BaseModel):
    id: UUID
    project_id: int
    name: str


class CommitSummary(BaseModel):
    sha: str
    repo: RepoRefSummary
    author: PersonRef
    committer: PersonRef | None = None
    committed_at: datetime
    message: str
    is_merge: bool = False
    added_lines: int = 0
    deleted_lines: int = 0
    files_changed: int = 0


class CommitFeed(BaseModel):
    items: list[CommitSummary]
    next_cursor: str | None = None


class TopAuthorRowOut(BaseModel):
    author_id: UUID
    commits: int
    lines: int
    share_pct: float = Field(..., description="Share of commits in percent")
    git_name: str | None = None
    git_email: str | None = None


class DashboardSeries(BaseModel):
    commits_daily: list[CommitSeriesPoint]
    by_hour: list[HourHeatmapPointOut]
    by_weekday: list[WeekdayHeatmapPointOut]
    size_hist: list[SizeBucketPoint]


class InsightRecommendation(BaseModel):
    id: str
    title: str
    description: str
    severity: str = "info"


class DashboardSummary(BaseModel):
    kpi: KPIBlock
    series: DashboardSeries
    authors_top: list[TopAuthorRowOut]
    latest_commits: list[CommitSummary]
    recommendations: list[InsightRecommendation]


class TimelineKPI(KPIBlock):
    peak_day: date | None = None
    peak_hour: int | None = None
    offhours_pct: float = 0.0


class TimelineSummary(BaseModel):
    kpi: TimelineKPI
    series: DashboardSeries


class AuthorActivityRow(BaseModel):
    author_id: UUID
    commits: int
    lines: int
    share_pct: float
    git_name: str | None = None
    git_email: str | None = None


class DevelopersSummary(BaseModel):
    kpi: KPIBlock
    authors: list[AuthorActivityRow]


class DeveloperDetailSummary(BaseModel):
    kpi: KPIBlock
    series: DashboardSeries
    size_hist: list[SizeBucketPoint]
    latest_commits: CommitFeed
    recommendations: list[InsightRecommendation]
