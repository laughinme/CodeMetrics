from datetime import datetime

from pydantic import BaseModel, Field

from .commit_stats import CommitStats
from .hot_file import HotFile
from .off_hours_stats import OffHoursStats
from .peak_day import PeakDay
from .author_concentration import AuthorConcentration
from .activity_streak import ActivityStreak
from .insights_summary import InsightsSummary

class InsightsResponse(BaseModel):
    commits_last_7d: CommitStats
    pace_comparison: str = Field(..., description="Темп текущей недели vs предыдущей")
    hot_file: HotFile
    off_hours: OffHoursStats
    peak_day: PeakDay
    author_concentration: AuthorConcentration
    activity_streak: ActivityStreak
    summary: InsightsSummary
    period: dict[str, datetime] = Field(..., description="Период анализа")