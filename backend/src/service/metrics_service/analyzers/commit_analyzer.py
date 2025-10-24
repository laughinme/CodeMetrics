from collections import defaultdict, Counter
from datetime import datetime
from typing import Any, Dict, List

from .base import BaseAnalyzer

class CommitAnalyzer(BaseAnalyzer):
    async def analyze(self, data: Any, **kwargs) -> Dict[str, Any]:
        days_back = kwargs.get('days_back', 30)
        
        if not self._validate_data(data):
            return {
                "total_commits": 0,
                "period_days": days_back,
                "activity_metrics": {}
            }

        commits: List[Dict[str, Any]] = data
        authors = [c.get("author", {}).get("displayName", "Unknown") for c in commits]
        author_stats = Counter(authors)
        commit_dates = [
            datetime.fromtimestamp(c["authorTimestamp"] / 1000) 
            for c in commits if c.get("authorTimestamp")
        ]

        return {
            "total_commits": len(commits),
            "period_days": days_back,
            "activity_metrics": {
                "commits_per_day": len(commits) / days_back,
                "most_active_authors": author_stats.most_common(5),
                "unique_authors": len(author_stats),
                "commit_frequency": self._calculate_frequency(commit_dates),
            },
            "author_breakdown": dict(author_stats)
        }

    def _calculate_frequency(self, commit_dates: List[datetime]) -> Dict[str, float]:
        if not commit_dates:
            return {"daily": 0.0, "weekly": 0.0}

        date_counts = defaultdict(int)
        for commit_date in commit_dates:
            date_key = commit_date.date()
            date_counts[date_key] += 1
            
        days_with_commits = len(date_counts)
        total_days = max((max(commit_dates).date() - min(commit_dates).date()).days + 1, 1)

        return {
            "daily": days_with_commits / total_days,
            "weekly": len(commit_dates) / (total_days / 7)
        }
