import asyncio
import os
import sys
from pathlib import Path
from mcp import Client
from mcp.client.stdio import StdioServerParameters
from server import mcp


async def main():
    async with Client(mcp, raise_exceptions=True) as client:
        tools = await client.list_tools()
        assert {t.name for t in tools.tools} == {"list_work_areas", "plan_business_task", "calculate_garment_quote", "verify_application"}
        areas = await client.call_tool("list_work_areas", {})
        assert len(areas.structured_content["areas"]) == 8
        plan = await client.call_tool("plan_business_task", {"brief": "Create a campaign and customer quote"})
        assert {h["module"] for h in plan.structured_content["handoffs"]} == {"marketing", "sales"}
        assert plan.structured_content["saved"] is False
        quote = await client.call_tool("calculate_garment_quote", dict(materials="100", labour="80", manufacturing="0", packaging="10", delivery="10", margin_percent="50", quantity=3))
        assert quote.structured_content["unit_price"] == "400.00"
        assert quote.structured_content["order_total"] == "1200.00"
        for args in [{"check": "../../secrets"}]:
            invalid = await client.call_tool("verify_application", args)
            assert invalid.is_error
        invalid = await client.call_tool("calculate_garment_quote", dict(materials="NaN", labour="0", manufacturing="0", packaging="0", delivery="0", margin_percent="50"))
        assert invalid.is_error
        check = await client.call_tool("verify_application", {"check": "designer"})
        assert check.structured_content["passed"], check
    print("MCP discovery, module routing, costing, input rejection and designer verification passed.")
    params = StdioServerParameters(command=sys.executable, args=[str(Path(__file__).with_name("server.py"))], env=dict(os.environ))
    async with Client(params) as client:
        result = await client.call_tool("plan_business_task", {"brief": "Review my portfolio"})
        assert result.structured_content["handoffs"][0]["module"] == "career"
    print("Stdio subprocess handshake and tool call passed.")


asyncio.run(main())
