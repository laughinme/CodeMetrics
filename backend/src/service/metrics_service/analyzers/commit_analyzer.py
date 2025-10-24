import statistics
import logging
from collections import defaultdict, Counter
from typing import Any, Dict, List

from .base import BaseAnalyzer
from domain.parsing import CommitModel


logger = logging.getLogger(__name__)


class AnalysisConfig:
    def __init__(self):
        self.days_back = 30
        self.top_n = 5
        self.night_hours = (22, 6)
        self.imbalance_threshold = 0.65
        self.night_activity_threshold = 0.15


class CommitAnalyzer(BaseAnalyzer):
    def __init__(self):
        self.config = AnalysisConfig()

    async def analyze(self, data: Any, **kwargs) -> Dict[str, Any]:
        self._update_config(kwargs)
        
        if not self._validate_data_structure(data):
            return self._build_empty_analysis()

        try:
            commits = self._preprocess_commits(data)
            if not commits:
                return self._build_empty_analysis()

            analysis = {
                "period": self._build_period_metrics(commits),
                "trends": self._build_trend_analysis(commits),
                "contributors": self._build_contributor_analysis(commits),
                "patterns": self._build_pattern_analysis(commits),
                "recent_activity": self._build_recent_activity(commits),
                "insights": self._generate_insights(commits)
            }

            return analysis

        except Exception as error:
            logger.error(f"Commit analysis failed: {error}")
            return self._build_error_analysis()

    def _update_config(self, kwargs):
        for key, value in kwargs.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)

    def _validate_data_structure(self, data: Any) -> bool:
        return isinstance(data, list) and all(
            isinstance(item, CommitModel) and item.created_at
            for item in data
        )

    def _preprocess_commits(self, raw_commits: List[CommitModel]) -> List[Dict[str, Any]]:
        processed = []
        for commit in raw_commits:
            try:
                dt = commit.created_at
                author_name = commit.author.name if commit.author else "Unknown"
                author_email = commit.author.email if commit.author else "unknown"
                
                metrics = {
                    "date": dt.date().isoformat(),
                    "author_email": author_email,
                    "author_name": author_name,
                    "timestamp": int(dt.timestamp() * 1000), 
                    "hour": dt.hour,
                    "weekday": dt.weekday(),
                    "message": commit.message or "",
                    "sha": commit.sha
                }
                processed.append(metrics)
            except (AttributeError, ValueError) as e:
                logger.warning(f"Skipping invalid commit: {e}")
                continue
        
        return processed

    def _build_period_metrics(self, commits: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {
            "total_commits": len(commits),
            "active_days": len(set(c["date"] for c in commits)),
            "average_daily_commits": len(commits) / max(1, len(set(c["date"] for c in commits)))
        }

    def _build_trend_analysis(self, commits: List[Dict[str, Any]]) -> Dict[str, Any]:
        daily_data = defaultdict(int)
        for commit in commits:
            daily_data[commit["date"]] += 1

        dates = sorted(daily_data.keys())
        values = [daily_data[date] for date in dates]
        
        return {
            "daily_commits": [{"date": k, "count": v} for k, v in sorted(daily_data.items())],
            "velocity_trend": self._calculate_velocity_trend(values),
            "consistency_score": self._calculate_consistency_score(values)
        }

    def _build_contributor_analysis(self, commits: List[Dict[str, Any]]) -> Dict[str, Any]:
        author_commits = Counter()
        
        for commit in commits:
            author_commits[commit["author_name"]] += 1

        top_by_commits = author_commits.most_common(self.config.top_n)
        
        return {
            "active_developers": len(author_commits),
            "top_contributors": top_by_commits,
            "concentration_metrics": {
                "bus_factor": self._calculate_bus_factor(author_commits),
            }
        }

    def _build_pattern_analysis(self, commits: List[Dict[str, Any]]) -> Dict[str, Any]:
        hour_activity = [0] * 24
        weekday_activity = [0] * 7
        
        for commit in commits:
            hour_activity[commit["hour"]] += 1
            weekday_activity[commit["weekday"]] += 1

        return {
            "temporal_patterns": {
                "hourly_distribution": hour_activity,
                "weekly_distribution": weekday_activity,
                "peak_hours": self._find_peak_hours(hour_activity),
                "work_hours_ratio": self._calculate_work_hours_ratio(hour_activity),
                "night_activity_ratio": self._calculate_night_activity_ratio(hour_activity)
            },
            "commit_behavior": {
                "frequency_patterns": self._analyze_frequency_patterns(commits)
            }
        }

    def _build_recent_activity(self, commits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        sorted_commits = sorted(commits, key=lambda x: x["timestamp"], reverse=True)
        
        return [
            {
                "sha": commit["sha"],
                "author": commit["author_name"],
                "message": commit["message"][:80] if commit["message"] else "",
                "timestamp": commit["timestamp"],
                "date": commit["date"]
            }
            for commit in sorted_commits[:10]
        ]

    def _calculate_velocity_trend(self, daily_counts: List[int]) -> float:
        if len(daily_counts) < 2:
            return 0.0
        
        n = len(daily_counts)
        x = list(range(n))
        y = daily_counts
        
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(xi * xi for xi in x)
        
        denominator = n * sum_x2 - sum_x * sum_x
        if denominator == 0:
            return 0.0
            
        slope = (n * sum_xy - sum_x * sum_y) / denominator
        return float(slope)

    def _calculate_consistency_score(self, daily_counts: List[int]) -> float:
        if not daily_counts:
            return 0.0
        mean = statistics.mean(daily_counts)
        if mean == 0:
            return 0.0
        std_dev = statistics.stdev(daily_counts) if len(daily_counts) > 1 else 0
        return max(0, 1 - (std_dev / mean))

    def _calculate_bus_factor(self, author_commits: Counter) -> int:
        total_commits = sum(author_commits.values())
        if total_commits == 0:
            return 0
            
        sorted_authors = sorted(author_commits.values(), reverse=True)
        cumulative = 0
        for i, count in enumerate(sorted_authors, 1):
            cumulative += count
            if cumulative >= total_commits * 0.5:
                return i
        return len(sorted_authors)

    def _find_peak_hours(self, hour_activity: List[int]) -> List[int]:
        max_activity = max(hour_activity) if hour_activity else 0
        if max_activity == 0:
            return []
        return [hour for hour, count in enumerate(hour_activity) 
                if count >= max_activity * 0.8]

    def _calculate_work_hours_ratio(self, hour_activity: List[int]) -> float:
        total = sum(hour_activity)
        if total == 0:
            return 0.0
        work_hours = sum(hour_activity[9:18])   
        return work_hours / total

    def _calculate_night_activity_ratio(self, hour_activity: List[int]) -> float:
        total = sum(hour_activity)
        if total == 0:
            return 0.0
        
        start_hour, end_hour = self.config.night_hours
        night_activity = 0
        
        if start_hour <= end_hour:
            night_activity = sum(hour_activity[start_hour:end_hour])
        else:
            night_activity = sum(hour_activity[start_hour:]) + sum(hour_activity[:end_hour])
        
        return night_activity / total

    def _analyze_frequency_patterns(self, commits: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not commits:
            return {"consistency": 0, "bursts": 0}
            
        dates = sorted(set(c["date"] for c in commits))
        daily_counts = [sum(1 for c in commits if c["date"] == date) for date in dates]
        
        return {
            "consistency": self._calculate_consistency_score(daily_counts),
            "bursts": len([count for count in daily_counts if count > statistics.mean(daily_counts) * 2])
        }

    def _generate_insights(self, commits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        insights = []
        
        if not commits:
            return insights

        contributor_analysis = self._build_contributor_analysis(commits)
        pattern_analysis = self._build_pattern_analysis(commits)

        top_contributors = contributor_analysis["top_contributors"]
        if top_contributors:
            top3_percentage = sum(count for _, count in top_contributors[:3]) / len(commits)
            if top3_percentage > self.config.imbalance_threshold:
                insights.append({
                    "type": "contributor_concentration",
                    "severity": "high",
                    "title": "High Contributor Concentration",
                    "description": f"Top 3 contributors account for {top3_percentage:.1%} of commits",
                    "suggestion": "Implement knowledge sharing and cross-training programs"
                })

        night_ratio = pattern_analysis["temporal_patterns"]["night_activity_ratio"]
        if night_ratio > self.config.night_activity_threshold:
            insights.append({
                "type": "night_activity",
                "severity": "medium",
                "title": "Significant Night Activity",
                "description": f"{night_ratio:.1%} of commits during night hours",
                "suggestion": "Review work-life balance and consider flexible scheduling"
            })

        bus_factor = contributor_analysis["concentration_metrics"]["bus_factor"]
        if bus_factor <= 2:
            insights.append({
                "type": "bus_factor_risk",
                "severity": "high",
                "title": "Bus Factor Risk",
                "description": f"Only {bus_factor} developers responsible for 50% of commits",
                "suggestion": "Increase knowledge distribution across team members"
            })

        consistency = pattern_analysis["commit_behavior"]["frequency_patterns"]["consistency"]
        if consistency < 0.3:
            insights.append({
                "type": "inconsistent_activity",
                "severity": "low",
                "title": "Inconsistent Contribution Patterns",
                "description": "Irregular commit activity detected",
                "suggestion": "Establish more consistent development rhythms"
            })

        return insights

    def _build_empty_analysis(self) -> Dict[str, Any]:
        return {
            "period": {
                "total_commits": 0,
                "active_days": 0,
                "average_daily_commits": 0
            },
            "trends": {
                "daily_commits": [],
                "velocity_trend": 0,
                "consistency_score": 0
            },
            "contributors": {
                "active_developers": 0,
                "top_contributors": [],
                "concentration_metrics": {"bus_factor": 0}
            },
            "patterns": {
                "temporal_patterns": {
                    "hourly_distribution": [0]*24,
                    "weekly_distribution": [0]*7,
                    "peak_hours": [],
                    "work_hours_ratio": 0,
                    "night_activity_ratio": 0
                },
                "commit_behavior": {
                    "frequency_patterns": {"consistency": 0, "bursts": 0}
                }
            },
            "recent_activity": [],
            "insights": []
        }

    def _build_error_analysis(self) -> Dict[str, Any]:
        analysis = self._build_empty_analysis()
        analysis["insights"].append({
            "type": "analysis_error",
            "severity": "high",
            "title": "Analysis Failed",
            "description": "Unable to process commit data",
            "suggestion": "Verify data format and try again"
        })
        return analysis