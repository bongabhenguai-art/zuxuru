"""Repository-local Bonga Bhengu MCP service; no public HTTP listener."""
import asyncio
import json
import os
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path
from typing import Any

from mcp.server import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from mcp.types import ToolAnnotations

ROOT = Path(os.environ.get("BONGA_REPO_ROOT", Path(__file__).resolve().parents[2])).resolve()
mcp = MCPServer("Bonga Bhengu repository engine")
READ_ONLY = ToolAnnotations(read_only_hint=True, open_world_hint=False)


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
