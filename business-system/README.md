# Bonga Bhengu business system

Backend repository map for the nine requested modules. Nothing in this directory is published on the public website.

Status: selected upstreams and module contracts, not deployed services. No upstream code is copied or executed. All reviewed upstreams were non-archived on 2026-10-07; reviewed commits are snapshots, not production release recommendations. Deploy a reviewed stable release when integrating.

| Module | Upstream | Source license | Work |
|---|---|---|---|
| FBI | [scrapy/scrapy](https://github.com/scrapy/scrapy) | BSD-3-Clause | Collect public business evidence |
| CIA | [apache/nifi](https://github.com/apache/nifi) | Apache-2.0 | Normalize and connect approved data |
| DVD | [matomo-org/matomo](https://github.com/matomo-org/matomo) | GPL-3.0 | Measure discoverability and website performance |
| BSDA | [duckdb/duckdb](https://github.com/duckdb/duckdb) | MIT | Analyze offers, customer evidence and gaps |
| BDCD | [huggingface/diffusers](https://github.com/huggingface/diffusers) | Apache-2.0 | Draft fashion visuals and campaign content |
| BBMDS | [penpot/penpot](https://github.com/penpot/penpot) | MPL-2.0 | Prepare consistent brand and marketing assets |
| BRE | [frappe/crm](https://github.com/frappe/crm) | AGPL-3.0 | Track customer relationships and deals |
| BRI | [run-llama/llama_index](https://github.com/run-llama/llama_index) | MIT | Research fashion career, products and opportunities |
| AUTOPILOT | [PrefectHQ/prefect](https://github.com/PrefectHQ/prefect) | Apache-2.0 | Route work, track dependencies and failures |

## Run the included task router

`python3 business-system/autopilot.py --focus FBI --out /tmp/bonga-tasks.json`

The original standard-library router needs no paid API or upstream installation. Import its output into the private workroom using the existing Jarvis task importer. It routes contracts and produces tasks; it does not execute third-party services. Existing Jarvis scheduled workflows remain unchanged.

## Integration order

1. Reuse the installed visibility evidence adapters for FBI and DVD. Never treat an unreviewed business listing as a buyer.
2. Add DuckDB analysis over owner-approved records for BSDA; preserve source evidence for BRI.
3. Connect BRE to a separately hosted Frappe CRM instance with private storage and custom stages.
4. Add Penpot assets and optional Diffusers generation. Verify each model's commercial-use terms and required hardware first.
5. Add NiFi only when multiple data sources require durable transport. Use Prefect when actual service orchestration is available; avoid provisioning nine independent servers for the initial system.

## Contracts and cost

Each module has a repository contract under `modules/`. These are project operating instructions, not installed ChatGPT skills or automatically loaded agents. Preserve GPL/AGPL/MPL obligations when distributing or modifying the relevant upstreams; do not relicense their code. Self-hosted software can have no license fee while still requiring servers, storage, GPU resources or model/API costs. No paid accounts or subscriptions are created here.

Keep customer records, credentials and private research out of this public GitHub repository. Outputs belong in the private workroom or private storage. AUTOPILOT prepares work; sending messages, publishing, spending and binding commercial commitments require the owner's instruction.

BRE retains all requested names. Personal Profile is a review checkpoint, Closer assigns a person, Close records agreement, Sale records verified payment/order, and Customer follows an actual completed conversion. Ready-to-Buy requires customer evidence, not scraped contact details.
