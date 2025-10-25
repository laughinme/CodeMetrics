from __future__ import annotations

from fastapi import APIRouter

from scheduler.state import sync_state


router = APIRouter(prefix="/status", tags=["Status"])


@router.get("/sync", summary="Get current background sync status")
async def get_sync_status() -> dict[str, object]:
    return sync_state.snapshot()
