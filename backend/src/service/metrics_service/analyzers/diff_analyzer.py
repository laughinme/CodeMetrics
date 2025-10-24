from collections import Counter
from typing import Any, Dict

from .base import BaseAnalyzer

class DiffAnalyzer(BaseAnalyzer): 
    async def analyze(self, data: Any, **kwargs) -> Dict[str, Any]:
        diff_data: Dict[str, Any] = data
        diffs = diff_data.get("diffs", [])
        total_additions = sum(d.get("linesAdded", 0) for d in diffs)
        total_deletions = sum(d.get("linesRemoved", 0) for d in diffs)
        
        file_types = Counter()
        for diff in diffs:
            if destination := diff.get("destination", {}).get("toString", ""):
                if "." in destination:
                    file_types[destination.split(".")[-1].lower()] += 1

        return {
            "files_changed": len(diffs),
            "lines_added": total_additions,
            "lines_removed": total_deletions,
            "net_changes": total_additions - total_deletions,
            "file_types_breakdown": dict(file_types),
            "change_magnitude": self._classify_change_magnitude(total_additions, total_deletions, len(diffs))
        }

    def _classify_change_magnitude(self, additions: int, deletions: int, files_changed: int) -> str:
        total_changes = additions + deletions
        
        match total_changes:
            case 0:
                return "none"
            case n if n < 10:
                return "tiny"
            case n if n < 50:
                return "small" 
            case n if n < 200:
                return "medium"
            case n if n < 1000:
                return "large"
            case _:
                return "massive"
