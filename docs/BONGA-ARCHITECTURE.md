# Bonga Bhengu repository architecture map

Reverse-engineered from main on 8 October 2026. This is a maintainer map, not storefront copy.

## Production boundary

Production: https://zuxuru.bongabhenguai.workers.dev

Cloudflare builds from `bonga-platform/` using `npm ci --include=dev` and `npx wrangler deploy`. The default `wrangler.jsonc` points to the bundled Cloudflare entry. The root `app/` and `lib/` contain a separate React/vinext implementation; changing them alone does not change this production application. Preserve the deployed platform and shared records rather than creating another dashboard.

## Request and identity path

`cloudflare/entry.mjs` verifies Cloudflare Access identity through `identity.mjs`, removes untrusted identity headers, supplies storage adapters and routes to `worker/index.mjs`. Private APIs use the verified owner identity. Cloud reports are intercepted by `cloud-reports.mjs`. Public approved storefront media has its own application route; the R2 bucket stays private.

## Module ownership

| Capability | Source | Actual behavior |
| --- | --- | --- |
| Shared business run | worker/system-engine.mjs | Health check, storefront/enquiry reads, enquiry import, evidence investigation, task proposals, Studio handoff and saved run history |
| Eight work areas | worker/designer-engine.mjs | Rules over saved records for sales, marketing, branding, visibility, products, opportunities, skills and career; this planner does not itself perform AI inference |
| Workspace | worker/designer-data.mjs; dist/designer-cloud.js | Owner records and revision-based cloud synchronization |
| Tasks | worker/designer-tasks.mjs; dist/designer-work.js | Saved task progress and selected-task Studio handoff |
| Storefront | worker/designer-store.mjs; worker/storefront-design.mjs | Designer storefront, product presentation, enquiries and approved media routes |
| Media | worker/designer-media.mjs | Private upload/read/delete with signature, ownership and quota checks |
| Studio | worker/digital-studio.mjs; worker/studio-jobs.mjs; dist/digital-studio.js | Camera-room signaling, creative jobs and workflow records inside the OS |
| Campaigns | worker/studio-campaigns.mjs | Editable platform captions, shared-time campaign drafts and review; automatic publishing is blocked |
| Multistream | worker/studio-multistream.mjs | Adapter for a separately running Muxshed service; requires its configured URL and credentials |
| Remote MCP | worker/business-mcp.mjs | Authenticated HTTP tools to read work/jobs, update task progress and assign proposed work through existing handlers |
| GitHub MCP checks | .github/workflows/bonga-mcp.yml; mcp/bonga-engine/ | Verification of the repository MCP implementation, not an always-running GitHub server |
| Cloud Jarvis | .github/workflows/jarvis-open-source.yml; bonga-platform/jarvis/ | Temporary GitHub runner with Ollama/Qwen3:1.7b; scheduled evidence report and task drafts |
| Report delivery | jarvis/send_cloud_report.py; cloudflare/cloud-reports.mjs | GitHub OIDC-authenticated delivery to private D1 reports and dashboard reader |

## Shared engine limits

The system runner executes existing handlers and records individual failures. It imports actual enquiries and proposes work. It does not charge payments, purchase fabric, place production orders, book couriers or autonomously contact customers. Studio handoff uses the same task records; creative approval remains under human control.

Campaign and system handlers explicitly report Polsia disconnected and social publishing authorization required. Their saved drafts must not be represented as published posts. Installing an MCP adapter does not connect every platform.

## Jarvis execution

The cloud workflow schedules at 05:00 UTC (approximately 07:00 South Africa). GitHub may delay scheduled jobs. It collects public fashion/news evidence, records source failures, prepares a bounded draft and delivers the report to the dashboard using GitHub OIDC. It is a job-based service, not a continuously running chat server. The optional local path requires a configured self-hosted Windows runner with the Jarvis label and Ollama installed.

Public mentions are evidence of mentions, not verified sales, product rankings or qualified customer intent. Owner review is required before turning recommendations into action.

## Storage and deployment

The default production configuration now binds `MEDIA` to private R2 bucket `bonga-bhengu-media`, and `DB` to the existing D1 database. R2 activation and production deployment were confirmed on 8 October 2026. Application media limits remain 50 MB per file, 100 files and 1 GB per owner; cloud account allowances are separate.

Code-level upload, private retrieval, ownership and deletion checks passed. An authenticated browser upload, edited-copy save, Studio attachment and published storefront playback remain end-to-end checks. Do not mark these checked solely because a binding exists.

## Verification paths

`.github/workflows/bonga-unified-engine.yml` installs platform dependencies, runs system, Studio, planner, closer, task, multistream and MCP checks, then builds the hosted application. A workflow definition is not proof its latest run passed: inspect the run before release claims.

For upgrades: identify the owning handler, preserve owner boundaries and revision checks, update its client, verify the relevant behavior, then check the Cloudflare deployment. Keep technical connection instructions in private settings or repository documentation.

## Useful owner links

- [Fashion workspace](https://zuxuru.bongabhenguai.workers.dev/fashion-service.html)
- [Morning briefing](https://zuxuru.bongabhenguai.workers.dev/fashion-service.html#jarvis-morning-report)
- [Images, videos and files](https://zuxuru.bongabhenguai.workers.dev/fashion-service.html#media-library)
- [Creative Studio](https://zuxuru.bongabhenguai.workers.dev/digital-studio.html)

Private links require the authorized owner sign-in.
