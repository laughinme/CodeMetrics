from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import UTC, datetime
from threading import Lock
from typing import Any


@dataclass
class _SyncStateSnapshot:
    in_progress: bool
    phase: str | None
    started_at: datetime | None
    finished_at: datetime | None
    last_error: str | None
    progress: float | None


class SyncStateTracker:
    """Thread-safe tracker exposing current sync status for the UI."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._state = _SyncStateSnapshot(
            in_progress=False,
            phase=None,
            started_at=None,
            finished_at=None,
            last_error=None,
            progress=None,
        )

    def start(self, *, phase: str) -> None:
        now = datetime.now(UTC)
        with self._lock:
            self._state = _SyncStateSnapshot(
                in_progress=True,
                phase=phase,
                started_at=now,
                finished_at=None,
                last_error=None,
                progress=0.0,
            )

    def complete(self, *, error: str | None = None) -> None:
        now = datetime.now(UTC)
        with self._lock:
            self._state = _SyncStateSnapshot(
                in_progress=False,
                phase="error" if error else "idle",
                started_at=self._state.started_at,
                finished_at=now,
                last_error=error,
                progress=None if error else 100.0,
            )

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            return asdict(self._state)


sync_state = SyncStateTracker()
