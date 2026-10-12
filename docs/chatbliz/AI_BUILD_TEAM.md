# Chatbliz OS — Coding Team Execution Brief
## Objective
Rebrand and evolve the existing Zuxuru application into the standalone Chatbliz Business Partner. Do not create a competing app, duplicate dashboard, or connect it to Bonga Bhengu OS. Preserve existing authenticated services and working modules; incrementally migrate them under a coherent Chatbliz interface.

## Primary workflow
Customer describes business by voice/text → My Brand → Website and App/Store Builder → Studio assets and brand interview → My Business Partner dashboard → assigned AI employees → approved task execution → monitoring, scheduled 10-minute check-ins, reminders and meeting copilot.

## Subscription products
Adviser R299/month: 1 profile, sales assistant, legal-information assistant, mentor and adviser.
Coach & Executive R499/month: 2 profiles, doubled assistant capacity, coach and executive team.
Studio Partner R899/month: 8 profiles, expanded team and limited Studio usage.
Enterprise: request quote; indicative R2,000–R1,000,000/month, custom profiles and assistant roles with contracted usage caps.
**Trial:** one 30-day trial per customer across all packages, with explicit selection and clear expiration; no credit card required by default, no automatic charge. Enterprise trial requires approval and scoped usage. No repeated trial by switching packages.

## Required backend implementation order
1. Authentication, tenant boundaries, consent and profile identity; never use user-entered tenant IDs as authority.
2. Trial enrollment with transactional uniqueness per owner, authoritative server timestamps, eligibility and expiry; enforce access on every API operation; display remaining days.
3. Package subscription/entitlement ledger: profile limits 1/2/8/custom, assistant capacity, Studio metering, storage and compute quotas, enterprise negotiated limits.
4. Unified asset graph with typed ownership and relationships across brand, website, app, store, Studio and business dashboard. Do not pass sensitive descriptions in URLs.
5. Persistent job queue, idempotency, retries, task audit trail and approvals before publication, sending messages, spending money or modifying external accounts.
6. AI partner orchestration: mentor, coach, sales, negotiator, executive, legal-information (not legal advice), meeting copilot, scheduling and reminders.
7. Studio recording with explicit consent, transcription, human-reviewed brand stories, publishing permissions and channel authorization.
8. Payments only after verified consent and provider integration; no invented transactions or fake deployment.

## Coding agent assignments
- Architect: map current Zuxuru components and propose incremental migration.
- Backend: tenancy, trial, entitlements, jobs, integrations.
- Frontend: single voice-first Chatbliz Business Partner UI and accessibility.
- AI/Studio: authorized agents, interviews, voice, media and usage metering.
- QA/Security: tests, tenant isolation, rate limits, consent, secrets, billing edge cases, accessibility.
- Release: CI checks, staging deploy, smoke tests, rollback plan.

## Recommended open-source agent repositories (external references, not vendored)
- OpenHands: https://github.com/OpenHands/OpenHands — multi-step engineering tasks.
- Cline: https://github.com/cline/cline — IDE/CLI agent and MCP tool integration.
Use existing GitHub/Codex workflows first. Review licensing, resource requirements and model/API costs before installation; no unreviewed external code in production.

## Delivery contract
Small PRs with tests and screenshots where relevant. Run typecheck, lint, build and tenant security tests. Do not merge or deploy without passing checks. Report what is actually operational versus planned. Avoid placeholder buttons and fake AI outputs.
