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

Creative daily tasks now open their exact saved Studio job from the dashboard. Open marketing/branding tasks can be routed on demand after cloud save; existing jobs and Studio result follow-up tasks retain their original job IDs. Opening a job does not start a camera or recording. `/digital-studio.html?job=<id>` is a signed-in deep link, also returned by the remote Studio queue tool. Missing or inaccessible job IDs clear the selected project instead of falling back to another job.

Studio branding now supports a private-library image overlay on the Programme canvas. Logo selection and removal are manual. Its owned media ID is saved with production settings, and project ZIP packages include that image separately from final creative deliverables. Server validation rejects foreign-user files and videos as logos. Recording captures the composited Programme canvas; physical camera/recording browser testing is still required.

Programme still-image capture exports the current composited canvas as a private JPEG, including branding overlays. It requires a ready camera or collection scene. Owners may download it or save it to the private media library and original creative job. A failed job attachment retries against the same uploaded file. Capture does not publish; physical browser camera capture remains unverified by automated tests.

Attaching genuinely new media to an approved Studio job returns it to Review. Selecting final campaign media also revokes the linked campaign's approval; both records change in one guarded D1 batch. Retrying an existing attachment does not reset approval. Campaign saves retain their source Studio job even when an editor omits that field. Approval of a linked campaign requires the current source job to be approved; the database write checks its revision and stage to reject concurrent changes. These are review controls, not automatic publication.
