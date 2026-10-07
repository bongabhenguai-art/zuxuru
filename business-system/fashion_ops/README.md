# Bonga Bhengu fashion operations

Working standard-library customer evidence processor and offer preparer. Additive to the existing FBI → CIA → DVD/BSDA → Studio → BRE flow. No public storefront changes.

Run from repository root:

`python3 business-system/fashion_ops/closer.py --input /private/request-input.json --out /private/bonga-results`

Input shape: `{"leads":[{"name":"Public requester or business","source_url":"https://public-request-page","quote":"Exact short fashion buying request from that page","need":"The requested garment or project","requester_verified":false}]}`

The processor retrieves up to ten public HTML pages using existing visibility-kit network checks, verifies quotes, preserves source URLs, distinguishes blocked/unavailable sources, checks published dates and prepares personalised offers. The Skyscraper score is transparent review priority, not buying probability. Owner identity review is required. Unknown dates and directory listings cannot become ready buyers. Price, timing and availability remain unconfirmed until Bonga agrees them.

Outputs: customer-offers.json, private osint-dashboard.html, Jarvis-compatible tasks and a MiroFish scenario seed. No email, social post, message, payment or completed sale is performed. Source dates are page metadata and still require review against the specific request. Browser-only/social-login pages can remain blocked.

## Video and AI adapters

`ltx_render.py` prepares a verified LTX-Video CLI command. Execution needs a separately configured GPU runtime, model weights and reviewed weight terms. Source Apache license does not determine every model's license. LTX-2 is the upstream's newer primary project; this adapter targets the reviewed LTX-Video 0.9.8 CLI and is not an LTX-2 adapter.

`graph_research.py` uses FastGraphRAG's published GraphRAG API after model credentials and dependencies exist. It is not executed by default and AI answers cannot change buyer qualification. Optional install target is recorded in upstreams.json; do not assume a free API from a free source license.

MiroFish receives prepared scenario materials only. No simulation has run. Hypothetical personas and predictions are not real leads. Its AGPL source and model/Zep dependencies need a separately configured runtime.

Business OSINT uses the existing Scrapy/Maps evidence alignment and this original private report. No ambiguous Kali hacking toolkit is installed. RichinStanly/OSINT-DASHBOARD had no detected license and was not copied or integrated.

## Polsia

POLSiA-IMPORT.md and polsia-import.json are an import brief, not a documented Polsia API schema. User selected preparation for manual import. No Polsia delivery has occurred. Keep private customer records, credentials and generated reports out of this public repository.
