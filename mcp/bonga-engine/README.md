# Bonga Bhengu repository MCP

This behind-the-scenes service uses the official MIT-licensed [Model Context Protocol Python SDK](https://github.com/modelcontextprotocol/python-sdk), pinned to version 2.3.0. It runs over stdio in a trusted local GitHub checkout or CI job. It is not a public website API or an always-on agent.

Tools read the existing eight work areas, prepare module handoffs, calculate garment quotes and run fixed application checks. Routing is deterministic keyword matching. Plans and quotes are drafts, not saved customer records. It does not post, message, deploy, order stock, process payment, read production databases, or accept invented authentication headers.

From the repository root, with Python 3.10+ and Node 24:

```sh
python -m venv .venv-bonga-mcp
.venv-bonga-mcp/bin/python -m pip install -r mcp/bonga-engine/requirements.txt
.venv-bonga-mcp/bin/python mcp/bonga-engine/server.py
```

Configure an MCP host to launch the absolute virtual-environment Python path with the absolute server.py path as its argument. No token is needed for these checkout-only tools. Never attach this service to an untrusted checkout: verification executes the repository's test code.

`BONGA_REPO_ROOT` is an optional operator-configured checkout directory, not a tool argument. By default the server finds the root from its installed `mcp/bonga-engine/server.py` location. Studio and production identity remain within the existing hosted application. External MCP access to private production data needs a separate authenticated connector; this service does not claim that connection exists.

Run `python mcp/bonga-engine/test_server.py` after installing dependencies. The test uses the SDK client to discover and call the real tools.
