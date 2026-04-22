"""RexCode Scout — Real observability system.

SQLite-backed event store with:
- Structured events (timestamp, source, level, event_type, message, payload, run_id, session_id)
- Event bus pattern: components emit, Scout collects and persists
- WebSocket endpoint for live event streaming
- Query API with filters (level, source, run_id, session_id, time range)
- Performance metrics collection (request latency, agent execution time, error rates)
- Auto-pruning of old events to keep the DB bounded
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sqlite3
import time
import uuid
from collections import defaultdict
from datetime import datetime, UTC, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

logger = logging.getLogger("rexcode.scout")

# ── Database ─────────────────────────────────────────────────────────────

DATA_DIR = Path(os.environ.get("REXCODE_DATA_DIR", str(Path.home() / ".rexcode" / "data")))
SCOUT_DB_PATH = DATA_DIR / "scout.db"
