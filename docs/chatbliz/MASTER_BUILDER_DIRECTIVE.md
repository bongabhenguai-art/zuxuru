# CHATBLIZ OS — MASTER BUILDER DIRECTIVE
Status: Product-owner-approved master instruction, 12 October 2026.
Priority: This directive supersedes older Chatbliz draft specs where they conflict. It does not override security, privacy, legal requirements, or explicit later owner decisions.

## Product identity
Chatbliz OS = "Your Business Partner in Your Hands." Evolve the existing Zuxuru app project into a unified, voice-first, tenant-aware Chatbliz Business Partner product. Keep Chatbliz independent from Bonga Bhengu OS. Do not create a parallel dashboard, duplicate backend or detached Studio.

## The experience
After signup, greet the owner by their account-approved display name through voice where supported, with an accessible text equivalent. Example: "Hello Mr Bhengu, how can I help your business today?" Never assume every user is Mr Bhengu. Voice, dictated text and voice notes are first-class, with microphone consent, transcription review, multilingual design and keyboard fallback.
The customer describes their business conversationally. The Business Partner asks useful questions, discovers permitted public digital footprint signals, identifies SEO and visibility gaps, and confirms ownership before account connections or changes.

## One continuous operational pipeline
1. My Brand — profile, identity, audience, founder story, approved assets.
2. My Website / App / Store Builder — build and manage real customer-facing properties and commerce workflows.
3. My Content / Studio — approved images, videos, AI influencer interviews, podcasts, livestreams, recording and brand storytelling. Disclose AI hosts; obtain recording consent and publication approval.
4. My Business Partner — the single tenant dashboard with all assets, website, app, store, customers, tasks, operations, analytics, scheduling, reminders, team and business progress.
5. AI employees — mentor, coach, adviser, legal-information assistant, sales, closer, negotiator, executive assistant, marketing, Studio and builder. Assigned by subscription entitlements. Legal assistant provides general information, not regulated legal representation.
All modules share an authenticated owner-scoped asset graph, task engine, event/job queue, authorization wizard, audit trail and approved integration registry. No simulated execution or fake success.

## Business partner behavior
The partner schedules optional recurring 10-minute check-ins at owner-selected times; reviews business priorities, yesterday's outcomes, leads, quotations and follow-ups. The same assigned team helps prepare for customer meetings, suggests offers and negotiation responses discreetly, and records meeting notes only with consent. Meetings and reminders require actual calendar/notification integration before being described as active. Outbound actions, account changes, spending and publishing require owner approval and authorization.

## Packages (ZAR per month after trial)
- Adviser — R299: 1 business profile; Business Partner dashboard; one Sales Assistant, legal-information assistant, mentor and adviser team.
- Coach & Executive — R499: 2 business profiles; double assistant capacity; all Adviser benefits plus coach and executive team.
- Studio Partner — R899: 8 business profiles; expanded/doubled Growth team capacity; limited Studio access and metered media usage.
- Enterprise — request a quote: indicative R2,000 to R1,000,000 monthly; customizable profiles, assistant roles, integrations and usage subject to agreed contractual quotas and service levels. No promise of unlimited compute or cost.
A 30-day trial is offered once per customer across plans; no repeated trials from plan switching; Enterprise trial by approval with bounded usage. No automatic payment or paid conversion without explicit authorization. Display clear trial expiry and upgrade path. Drive value-based Enterprise upgrades without dark patterns.

## Builder implementation rules
- Reuse existing Zuxuru code, components, database, Studio and authorized AI gateway where appropriate; refactor incrementally. Do not rebuild or replace working features.
- One coherent Chatbliz UI and navigation, one tenant-safe backend and shared library, one task/automation pipeline.
- Build real API-backed workflows; validate all writes, enforce tenancy, plan quotas and trial expiry server-side; use durable jobs with retries, idempotency and audit events.
- Treat proposed asset generation and agent automation as NOT operational until provider integrations and tests confirm they work.
- Keep keys server-side; obtain consent for recording and external actions; protect customer data and accessibility.
- Coding team roles: architect, backend, frontend/voice, AI/Studio, security/QA, release. Prefer vetted open-source components (e.g., OpenHands, Cline) as development tools; review licenses and compute costs. Codex and GitHub remain the primary implementation flow.
- Make small commits and PRs with tests; typecheck, lint, build, tenant-isolation tests, browser smoke tests and staged deploy. Do not claim deployment until verified.

## Immediate implementation sequence
1. Audit existing Zuxuru/Chatbliz routes and consolidate navigation and data ownership.
2. Wire signup -> personalized voice-first Business Partner onboarding.
3. Implement trial enrollment, package entitlements, profile limits and Studio credits with backend enforcement.
4. Implement durable unified asset graph and brand -> website/app/store -> Studio -> dashboard workflows.
5. Implement AI task orchestration and scheduled check-ins with real calendar/reminder delivery.
6. Implement consent-based meeting copilot, sales follow-ups, Studio recording and publishing.
7. QA, secure, measure and deploy incrementally.

## Source of truth
Use this directive as the master builder brief for future Chatbliz OS coding work. The user's subsequent explicit requirements override conflicting sections. The current repository branch is a development branch; merge/deploy only after verification.
