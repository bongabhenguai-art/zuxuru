"""Repository-local Bonga Bhengu MCP service; no public HTTP listener."""
import asyncio
import json
import os
import importlib.util
import sqlite3
from datetime import datetime, date
from zoneinfo import ZoneInfo
from contextlib import contextmanager
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from typing import Any

from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from mcp.types import ToolAnnotations

ROOT = Path(os.environ.get("BONGA_REPO_ROOT", Path(__file__).resolve().parents[2])).resolve()
mcp = MCPServer("Bonga Bhengu repository engine")
READ_ONLY = ToolAnnotations(read_only_hint=True, open_world_hint=False)
LOCAL_WRITE = ToolAnnotations(read_only_hint=False, destructive_hint=False, idempotent_hint=True, open_world_hint=False)
DATA = Path(os.environ.get("BONGA_DATA_DIR", Path.home() / ".local/share/bonga-engine")).resolve()


@contextmanager
def task_database():
    DATA.mkdir(parents=True, exist_ok=True, mode=0o700)
    connection = sqlite3.connect(DATA / "tasks.sqlite3", timeout=10)
    connection.row_factory = sqlite3.Row
    try:
        connection.execute("CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, day TEXT NOT NULL, payload TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'planned', revision INTEGER NOT NULL DEFAULT 1, note TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL)")
        with connection:
            yield connection
    finally:
        connection.close()


def task_row(row):
    return {**json.loads(row["payload"]), "state": row["state"], "revision": row["revision"],
            "note": row["note"], "updated_at": row["updated_at"], "done": row["state"] == "done"}


def checked_day(value):
    value = value or datetime.now(ZoneInfo("Africa/Johannesburg")).date().isoformat()
    try:
        if date.fromisoformat(value).isoformat() != value:
            raise ValueError()
    except ValueError:
        raise ToolError("Use a calendar date in YYYY-MM-DD format.")
    return value


@mcp.tool(annotations=LOCAL_WRITE, structured_output=True)
def prepare_daily_tasks(day: str = "") -> dict[str, Any]:
    """Save the existing Jarvis daily rotation locally, without replacing progress on repeated runs."""
    day = checked_day(day)
    path = ROOT / "jarvis/omni_router.py"
    if not path.is_file():
        raise ToolError("The existing Jarvis module is missing from this checkout.")
    spec = importlib.util.spec_from_file_location("bonga_existing_router", path)
    router = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(router)
    assignments = router.daily_tasks(day, {"modules": modules()})
    timestamp = datetime.now(ZoneInfo("Africa/Johannesburg")).isoformat()
    with task_database() as db:
        for task in assignments:
            db.execute("INSERT OR IGNORE INTO tasks (id, day, payload, updated_at) VALUES (?, ?, ?, ?)",
                       (task["id"], day, json.dumps(task), timestamp))
        rows = db.execute("SELECT * FROM tasks WHERE day=? ORDER BY id", (day,)).fetchall()
    return {"day": day, "tasks": [task_row(row) for row in rows], "storage": "local MCP task store, separate from hosted dashboard", "automatic_execution": False}


@mcp.tool(annotations=READ_ONLY, structured_output=True)
def list_daily_tasks(day: str = "") -> dict[str, Any]:
    """Read saved daily assignments and progress from the local MCP task store."""
    day = checked_day(day)
    if not (DATA / "tasks.sqlite3").is_file():
        return {"day": day, "tasks": []}
    with task_database() as db:
        rows = db.execute("SELECT * FROM tasks WHERE day=? ORDER BY id", (day,)).fetchall()
    return {"day": day, "tasks": [task_row(row) for row in rows]}


@mcp.tool(annotations=LOCAL_WRITE, structured_output=True)
def update_task_progress(task_id: str, expected_revision: int, state: str, note: str) -> dict[str, Any]:
    """Save manual task progress with revision protection; completion requires a review note."""
    transitions = {"planned": {"in_progress"}, "in_progress": {"planned", "review"},
                   "review": {"in_progress", "done"}, "done": {"in_progress"}}
    if state not in transitions or not task_id or len(task_id) > 200 or len(note) > 3000:
        raise ToolError("Use a valid task ID, state and note of at most 3000 characters.")
    if state in {"review", "done"} and not note.strip():
        raise ToolError("Add a deliverable or review note before review or completion.")
    with task_database() as db:
        row = db.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
        if not row:
            raise ToolError("Task not found. Prepare daily tasks first.")
        if row["revision"] != expected_revision:
            # Safe retry of an already-applied exact change.
            if row["revision"] == expected_revision + 1 and row["state"] == state and row["note"] == note:
                return {"task": task_row(row), "already_applied": True}
            raise ToolError("Task changed. Read the latest revision before updating.")
        if state not in transitions[row["state"]]:
            raise ToolError("Follow planned → in_progress → review → done; reopen a completed task into in_progress.")
        changed = db.execute("UPDATE tasks SET state=?, note=?, revision=revision+1, updated_at=? WHERE id=? AND revision=?",
                             (state, note, datetime.now(ZoneInfo("Africa/Johannesburg")).isoformat(), task_id, expected_revision))
        if changed.rowcount != 1:
            raise ToolError("Task changed. Read the latest revision before updating.")
        updated = db.execute("SELECT * FROM tasks WHERE id=?", (task_id,)).fetchone()
    return {"task": task_row(updated), "already_applied": False}


def modules():
    path = ROOT / "bonga-platform/dist/assets/omni-modules.json"
    return json.loads(path.read_text())["modules"]


@mcp.tool(annotations=READ_ONLY, structured_output=True)
def list_work_areas() -> dict[str, Any]:
    """Read the eight business work areas from the existing repository manifest."""
    return {"areas": modules(), "source": "bonga-platform/dist/assets/omni-modules.json"}


@mcp.tool(annotations=READ_ONLY, structured_output=True)
def plan_business_task(brief: str) -> dict[str, Any]:
    """Prepare a rule-based module handoff; does not save tasks or contact customers."""
    if not brief.strip() or len(brief) > 3000:
        raise ToolError("Enter a task brief between 1 and 3000 characters.")
    import re
    words = brief.casefold()
    matches = []
    for area in modules():
        hits = [signal for signal in area["signals"] if re.search(r"(?<!\w)" + re.escape(signal) + r"(?!\w)", words)]
        if hits:
            matches.append({"module": area["id"], "matched_signals": hits,
                            "deliverable": area["deliverable"], "instruction_path": area["instruction_path"]})
    return {"brief": brief, "routing": "keyword rules, not AI inference", "handoffs": matches,
            "needs_manual_assignment": not bool(matches), "saved": False}


@mcp.tool(annotations=READ_ONLY, structured_output=True)
def calculate_garment_quote(materials: str, labour: str, manufacturing: str,
                            packaging: str, delivery: str, margin_percent: str,
                            quantity: int = 1) -> dict[str, Any]:
    """Calculate a per-garment quote from supplied costs; margin is gross margin, not markup."""
    if isinstance(quantity, bool) or quantity < 1 or quantity > 100000:
        raise ToolError("Quantity must be between 1 and 100000.")
    raw = (materials, labour, manufacturing, packaging, delivery, margin_percent)
    if any(len(v) > 40 for v in raw):
        raise ToolError("Each number must fit within 40 characters.")
    try:
        values = [Decimal(v) for v in raw[:-1]]
        margin = Decimal(margin_percent)
    except InvalidOperation:
        raise ToolError("Enter valid numeric costs and margin.")
    if any(not v.is_finite() or v < 0 or v > 1000000000 for v in values):
        raise ToolError("Costs must be finite nonnegative numbers, at most 1000000000.")
    if not margin.is_finite() or not 0 <= margin < Decimal("99.99"):
        raise ToolError("Gross margin must be at least 0 and below 99.99 percent.")
    cost = sum(values)
    price = (cost / (1 - margin / 100)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    money = lambda v: str(v.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
    return {"unit_cost": money(cost), "unit_price": money(price), "unit_profit": money(price-cost),
            "quantity": quantity, "order_total": money(price*quantity),
            "assumptions": "All inputs are per garment in one currency. Taxes and payment fees are excluded. Draft only."}


CHECKS = {"system": "tests/system-engine.mjs", "cameras": "tests/digital-studio.mjs",
          "designer": "tests/designer-engine.mjs"}


@mcp.tool(annotations=READ_ONLY, structured_output=True)
async def verify_application(check: str = "system") -> dict[str, Any]:
    """Run one fixed repository test suite. No arbitrary commands or live-platform actions."""
    if check not in CHECKS:
        raise ToolError("Choose system, cameras or designer.")
    app = ROOT / "bonga-platform"
    if not (app / CHECKS[check]).is_file():
        raise ToolError("The application checkout is missing the selected test suite.")
    process = await asyncio.create_subprocess_exec("node", CHECKS[check], cwd=app,
                                                 stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)
    try:
        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=180)
    except (asyncio.TimeoutError, asyncio.CancelledError):
        process.kill()
        await process.communicate()
        raise
    return {"check": check, "passed": process.returncode == 0, "exit_code": process.returncode,
            "output": (stdout + stderr).decode(errors="replace")[-12000:],
            "scope": "Repository tests only; no hardware or live provider verification."}


if __name__ == "__main__":
    mcp.run(transport="stdio")
