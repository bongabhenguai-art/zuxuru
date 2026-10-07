# Bonga Bhengu Jarvis — Omni Route

Installed as an additive module layer in `bongabhenguai-art/zuxuru`.

Eight modules assign daily work for sales, marketing, branding, visibility/SEO, products, opportunities, AI skills and career rebuilding. The rules runner assigns three tasks per day, covering every module across a week; it does not claim completed sales or visibility results. Existing Zuxuru application files are preserved.

## Run and collect outputs

Open Actions → Jarvis Omni Route. The workflow runs when these module files change on main, daily around 08:00 Johannesburg time, and through Run workflow. GitHub schedules can be delayed. Download the jarvis-creative-plan artifact: tasks.json, plan.md and ai-prompt.txt. Import tasks.json into https://bonga-bhengu.donlegendwear.chatgpt.site/omni-route.html. The website stores tasks locally; no live artifact synchronization is implemented.

Local execution:

```sh
python3 -m unittest discover -s jarvis -p 'test_*.py'
python3 jarvis/omni_router.py --out output/jarvis
python3 jarvis/omni_router.py --task 'Improve my branding and logo'
```

## Optional AI drafting

Store a suitable Copilot-enabled token as the repository Actions secret COPILOT_PAT. Select use_ai for manual runs; set repository variable JARVIS_ENABLE_AI=true for scheduled runs. This step produces owner-review text drafts through the official Copilot CLI. Account authentication and AI inference require that setup and were not tested locally. Rules and routing pass six tests. No credential is committed.

Module instructions live in jarvis/modules; their paths accompany assigned tasks into the optional AI prompt. These project instructions do not install external MCP servers, models or third-party repositories. Public evidence is a dated snapshot, not live analytics. No component sends outreach, publishes social posts, spends money or changes accounts. Unknown data remains unknown.

The separate ChatGPT Jarvis Daily Route brief is scheduled for mornings around 08:00 Johannesburg and provides current public research, draft content and task JSON. It is separate from the GitHub runner.
