# Bonga Bhengu shared application engine
The GitHub copy under `bonga-platform/` contains the hosted application source, public assets, database migrations, camera signaling, private media, storefront publishing, platform campaign drafts and the shared `/api/system/run` coordinator. Existing Zuxuru code and business modules are preserved.

Run `node scripts/build-ai.mjs`, `node tests/system-engine.mjs` and `node tests/digital-studio.mjs` inside this directory. The Worker build exports `fetch(request, env)` and requires platform-provided identity, D1 (`DB`) and R2 (`MEDIA`). Do not expose the Worker directly without a trusted identity gateway: the hosting gateway supplies authenticated user headers. Do not accept those headers from arbitrary clients.

GitHub Actions verifies the application; it is not an always-on hosting service. Production currently remains on the existing Bonga Bhengu Sites deployment. The `.openai/hosting.json` declaration identifies that existing site; publication uses the authorized Sites workflow. No production credentials, database records or customer files are copied into this repository.

One run imports real storefront enquiries, checks saved public evidence, saves evidence results, assigns deduplicated tasks and records a common history. It does not perform AI inference, social publishing, payments, production ordering or courier booking.

Polsia has no configured website connector. Social accounts have not been authorized for website posting. Campaigns retain individual platform captions and one planned timestamp, but blocked campaigns are neither scheduled nor posted. ChatGPT connector authorization cannot be copied into this runtime.

Upstream candidates for future tools: https://github.com/IBM/mcp-context-forge (gateway), https://github.com/PrefectHQ/fastmcp (MCP tools), https://github.com/github/github-mcp-server (GitHub operations). These are references, not installed dependencies.

Creative Studio is an embedded OS execution environment. Studio jobs originate from marketing/branding tasks, with deduplicated source IDs, private media ownership checks, revision-checked review/approval transitions and owner-entered measurement sources. Camera recording and publication are separate; no platform connection or AI director is implied. Five physical phones still require hardware testing on shared Wi-Fi.

Camera invitations use locally bundled QRCode.js (MIT), pinned to davidshimjs/qrcodejs commit 04f46c6a0708418cb7b96fc563eacae0fbf77674. License: dist/STUDIO-QR-LICENSE.txt. QR generation makes no remote image request; invitation tokens remain in the URL fragment.

The hosted application now exposes `/mcp` using the official MIT-licensed `@modelcontextprotocol/sdk` 1.32.1, pinned in package-lock.json. It uses the Web Standard HTTP transport and a Worker-compatible schema validator, with Zod runtime code generation disabled before protocol initialization. Build-generated third-party notices are included with the Worker artifact.

The remote tools read the signed-in user's existing work queue and Studio jobs, or assign the existing eight-area work and route creative jobs into Studio. They share D1 records with the dashboard and preserve its revision checks and media ownership. Tool discovery contains no private records. Data-bearing requests require Sites-provided authenticated identity; a tool argument cannot select another user. OAuth and installation are managed by the same Site. This connection does not enable AI inference, camera activation, recording, social posting, payments or sourcing purchases.

The repository-local Python MCP task store remains separate and does not automatically upload its task records to production. Use the hosted tools for the dashboard's authoritative records. Generated Worker output is produced by `npm ci` and `node scripts/build-ai.mjs`; the GitHub application source does not carry a stale prebuilt Worker.

Dashboard tasks support Proposed, In progress, Review and Completed states with owner-entered result notes. The `bonga_update_task` remote tool uses the workspace revision returned by `bonga_list_work`; it updates only the signed-in user's selected task and rejects stale workspace writes. Review and completion require a note. Results remain owner-entered, not independently verified. The dashboard's progress controls save the same task fields through its existing cloud autosave and conflict protection.
