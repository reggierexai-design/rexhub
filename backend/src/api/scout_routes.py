"""Scout API routes — REST + WebSocket for live event streaming."""

from __future__ import annotations

import asyncio
import json
from typing import Optional

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from src.runtime.scout import get_bus

router = APIRouter(prefix="/api/scout", tags=["scout"])


@router.get("/events")
async def list_events(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    level: Optional[str] = None,
    source: Optional[str] = None,
    event_type: Optional[str] = None,
    run_id: Optional[str] = None,
    session_id: Optional[str] = None,
    module: Optional[str] = None,
    since: Optional[str] = None,
    until: Optional[str] = None,
    q: Optional[str] = None,
):
    bus = get_bus()
    return {
        "events": bus.query(
            limit=limit, offset=offset, level=level, source=source,
            event_type=event_type, run_id=run_id, session_id=session_id,
            module=module, since=since, until=until, q=q,
        ),
        "total": bus.stats().get("total_events", 0),
    }


@router.get("/stats")
async def get_stats():
    return get_bus().stats()


@router.post("/prune")
async def prune_events(max_age_days: int = 30):
    deleted = get_bus().prune(max_age_days=max_age_days)
    return {"deleted": deleted}


@router.websocket("/ws")
async def scout_websocket(ws: WebSocket):
    await ws.accept()
    bus = get_bus()
    queue = bus.subscribe()
    try:
        while True:
            try:
                event = await asyncio.wait_for(queue.get(), timeout=30)
                await ws.send_json(event)
            except asyncio.TimeoutError:
                await ws.send_json({"type": "ping"})
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        bus.unsubscribe(queue)
