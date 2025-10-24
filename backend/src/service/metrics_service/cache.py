import logging
from typing import Any, Dict, Optional

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self, cleanup_interval: int = 60) -> None:
        self._storage: Dict[str, Any] = {}
        self._hits = 0
        self._misses = 0
        self._scheduler = AsyncIOScheduler()
        self._setup_cleanup_schedule(cleanup_interval)

    def _setup_cleanup_schedule(self, interval: int) -> None:
        trigger = IntervalTrigger(seconds=interval)
        self._scheduler.add_job(self.clear, trigger)
        self._scheduler.start()

    def get(self, key: str) -> Optional[Any]:
        result = self._storage.get(key)
        if result:
            self._hits += 1
        else:
            self._misses += 1
        return result

    def set(self, key: str, value: Any) -> None:
        self._storage[key] = value

    def clear(self) -> None:
        count = len(self._storage)
        self._storage.clear()
        logger.info(f"Cache cleared, removed {count} items")

    @property
    def stats(self) -> Dict[str, Any]:
        total_requests = self._hits + self._misses
        hit_rate = self._hits / total_requests if total_requests > 0 else 0
        return {
            "total_items": len(self._storage),
            "hit_rate": f"{hit_rate:.1%}",
            "hits": self._hits,
            "misses": self._misses,
            "size_estimate": sum(len(str(v)) for v in self._storage.values())
        }

    def shutdown(self) -> None:
        self._scheduler.shutdown()
        self.clear()