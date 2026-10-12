# Chatbliz OS — FAST MVP BUILD (Codex start here)
Date: 2026-10-12
Priority: ship one real end-to-end customer workflow before adding features.
Full requirements: ./CHATBLIZ_OS_MASTER_SPEC.md

## Hard boundaries
Chatbliz is an independent all-business product. Do not mix Bonga Bhengu branding, tenants, credentials or customer data. Reuse existing code only after checking dependencies. Do not rebuild the entire repository, delete working code, or deploy without verification.

## Single-page MVP
One responsive chat-first workspace with four visible product tabs/cards:
- My Brand — generate editable brand brief.
- My Website — generate editable website brief and initial page copy.
- My Content — generate editable marketing content plan and posts.
- My Business — generate editable business action plan.
All outputs saved to the customer's business workspace. No fake publish button.

## First-run flow
1. Ask in chat: "Describe your business, customers, location and biggest challenge." Accept short free-form input.
2. Save business profile; optional name, phone, website or social URL.
3. User taps "Find my business online". Discover public sources through a permitted search integration. Display candidate matches and require identity confirmation.
4. Report observed digital footprint: found links, missing website/listings, discoverability and basic SEO signals, with source URLs and confidence. Never invent search results, rankings or proprietary algorithm scores. If search isn't configured, show an explicit setup state.
5. AI responds as mentor, coach, adviser, marketer, sales assistant or negotiator within the SAME chat. One model/router with role prompts; no separate agent infrastructure.
6. User chooses one of four products; AI creates a saved, editable deliverable.
7. A simple task list shows requested, running, completed, failed and approval-required states.
8. WhatsApp: start with a real click-to-chat/share link based on validated number and prefilled text; label this as link-based sharing, not WhatsApp Business API integration. Add official API OAuth/connectors later.

## Minimal architecture
Reuse the repo's existing framework, auth and database where safe. One business profile, one task table, one generated artifact table, one discovery report table. One AI service adapter, one discovery adapter, one task runner, one integration gateway. Use server-side secrets and tenant-scoped access. Do not introduce new microservices or agent frameworks for MVP.

## Build order / small PRs
PR1: inspect active app, routes, auth, DB, build scripts and deployments; write exact reuse/migration map.
PR2: chat-first responsive screen, business profile and four product cards.
PR3: AI role router, four saved editable outputs and task statuses.
PR4: permitted public search discovery, source-backed visibility report and identity confirmation.
PR5: WhatsApp click-to-chat/share, error states, permissions, tests and production-ready deployment review.

## Acceptance test
A new user can describe a business, save it, optionally discover and confirm public identity, receive a sourced visibility assessment, ask for mentor advice, generate a brand brief, switch to website/content/business deliverables, edit and save outputs, see real task statuses, and open a working WhatsApp share link. No other application or disconnected screen opens. Buttons work. Data remains tenant-isolated. Tests/build pass and deploy is verified.

## Explicitly deferred
Live multi-camera studio, podcasts, livestreaming, AI avatars/influencers, autopilot campaigns, advanced CRM, automatic payments/payouts, autonomous negotiation, 1000-agent architecture, full website deployment, broad social publishing and advanced connector integrations. Keep their requirements in the master spec; do not implement in MVP.

## Codex rule
Build the smallest complete vertical slice first. Never claim working features, deployed URLs, connected APIs or successful tests without verification. Preserve existing code and create reviewable changes.
