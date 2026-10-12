# Chatbliz OS — Consolidated Product and Builder Specification
Updated: 2026-10-12
Status: owner requirements consolidated from Chatbliz planning conversations; implementation must be verified against source code.

## Identity and boundaries
Chatbliz OS is an independent, all-industry, chat-first AI business-building platform, evolving from Zuxuru capabilities. Its product identity, customer data, interface, permissions, deployment, and business logic must not be merged with Bonga Bhengu OS, which remains a separate fashion-focused personal platform. Existing repository technology may be reused only after identifying dependencies and separating data and branding. Do not delete or overwrite legacy components without audit and approval.

## Customer promise
"A business partner in your hands": the user describes their business naturally, Chatbliz understands its current stage, discovers evidence of its digital presence, advises on opportunities, creates an approved execution plan, and performs authorized work. Chat is the primary control surface, not a superficial overlay that opens unrelated pages. Every actionable button must invoke a real task or explain why authorization/configuration is required.

## Four customer-facing products
1. **My Brand**: identity, positioning, naming, logos, brand guides, customer segmentation, competitive analysis, reputation.
2. **My Website**: business website/app builder, templates, domains, SEO, pages, storefront, forms, maintenance, publishing.
3. **My Content**: creative studio, image/video/audio, podcasts, livestreaming, campaigns, scheduling, social distribution, analytics.
4. **My Business**: business plan, operations, CRM, lead generation, sales, negotiation, customer service, finance intelligence, workflows and reporting.

All four products share the same Chatbliz customer business profile, permissions, task engine, memory, tool registry and authorized integrations, while remaining clearly distinguishable as products. All four offer direct WhatsApp Business integration where authorized, for inbound leads, consent-based conversations, campaign attribution, CRM and support.

## Chat-first experience
Business onboarding asks the owner to describe what the business does, who it serves, location/service area, challenges, objectives and optionally business name, phone, website or social profile. Do not require a formal business plan. The chat identifies intent, retrieves business context, selects employees/tools, previews a plan, asks for approval when actions change external systems, executes, and reports task status and outcomes in the same workspace. Maintain task IDs, timestamps, execution status, errors, audit log, approval records and retry behavior. Support voice and accessibility progressively, with clear fallback.

## Digital Footprint Discovery and Visibility Intelligence
Inputs: natural-language business description plus optional business name, phone number, domain, address, public social link and category. Resolve likely identity carefully, show candidate matches and ask owner to confirm before associating profiles. Search public, permitted sources such as search results, websites, directories, map/business listings and publicly accessible social profiles; respect robots rules, terms, privacy, rate limits and data minimization. No private-account scraping or unauthorized login.

Outputs: confirmed public identity signals, indexed pages, consistency of business name/address/phone, local SEO, website crawlability, titles/meta, structured data, mobile performance where measured, social discoverability, reviews, relevant search terms, competitors and gaps. Explain **how search engines may interpret the available public signals**; do not claim to know proprietary ranking algorithms or guarantee rankings. Each finding must include source, observation time, confidence and classification (verified / estimated / unknown). Give an understandable visibility score with transparent criteria, not a fabricated Google score. Show strengths, missing signals, probable customer impact, quick wins and prioritized tasks. Ask owner confirmation before connecting accounts; use official OAuth/API authorization for any owned-platform action.

## AI employees and responsibilities
- **Mentor**: long-term business direction and learning.
- **Coach**: daily execution, accountability and milestones.
- **Adviser**: options, risks and recommendations grounded in evidence.
- **Assistant**: scheduling, communications and coordination.
- **Research / Spy / Discovery**: market, competitors, public business footprint and customer needs.
- **Hunting**: identifies qualified opportunities, relevant products and target audiences.
- **Fishing**: nurtures demand, content hooks, campaigns and return customers.
- **Closer**: proposals, follow-ups and conversion workflows.
- **Negotiator**: live or asynchronous deal preparation, suggested responses, budget/terms guidance; human approves binding commitments.
- **Fixer / Problem Solver**: diagnostics and repair task plans.
- **Branding / DesignForge**: brand identity and creative assets.
- **Web Builder**: sites, apps, templates, testing and publishing.
- **Amplifier / Marketing**: content distribution, consent-based campaigns and channel analytics.
- **Sales / CRM**: leads, qualification, pipeline, quotes, follow-up and customer history.
- **Money / Operations**: cash-flow visibility, invoices, operational metrics and risk flags, not unapproved financial transactions.
- **Studio / Media**: recording, podcast, livestream, editing, exports and approved social publishing.
- **Workflow / Integration / Storage**: orchestrates connectors, jobs and business files.

Employees are capabilities invoked by one central task orchestration system, not disconnected apps. Define each with inputs, outputs, required permissions, errors, observability and tests.

## Shared technical architecture (Chatbliz only)
One customer-facing chat workspace; one authenticated business profile and authorization wizard; one task queue/orchestrator; one tool/MCP registry; one skill/library catalog; one audit trail; one data access policy; one storage routing strategy; one integration interface; one consistent frontend design system. Modular services can remain separate internally if coordinated by these shared contracts. Reuse existing repository components rather than rebuilding blindly. Avoid placeholder-only buttons, fake metrics, pretend integrations or claims of successful execution without provider confirmation.

Suggested domain models: Business, User, Membership, ProductEntitlement, Agent, Skill, Tool, IntegrationConnection, AuthorizationGrant, DiscoverySource, IdentityMatch, VisibilityFinding, VisibilityReport, Task, TaskStep, Approval, Campaign, Lead, Opportunity, Asset, Publication, AuditEvent.

## Studio and media
Digital Studio should remain within the same workspace, with real camera/microphone permission flow, device selection, program/preview, scenes, audio controls, record/export and podcast/livestream workflows. External publishing/streaming requires real connected providers and user authorization. Do not claim camera or platform integration works until tested on target devices.

## Sales and marketing pipeline
Describe business → identify customer problem → discover public footprint → segment customers → define brand/value proposition → generate offer/content → owner approves → launch authorized campaign → capture and qualify leads → nurture → negotiate/propose → close → measure revenue and conversion → optimize. Track leads, qualified leads, quotes, customers, conversion rate, CPL, CAC, visitors, visibility, reviews, engagement, WhatsApp conversations and revenue; distinguish actual measurements from estimates.

## Packages and commercial rules
Four primary products are My Brand, My Website, My Content and My Business. Package pricing, billing intervals, trials, limits and entitlements must come from a confirmed Chatbliz-specific price catalog, not be copied from Bonga Bhengu subscriptions. Product is paid, with clearly described evaluation/demo access where offered. Never advertise a free tier or charge without owner-approved terms.

## Integration and security requirements
Use explicit consent and official connectors for WhatsApp Business, websites, social media, email, calendar, payments and hosting. Scope tokens to tenant, encrypt secrets, avoid logging credentials, support revocation and role-based access, isolate tenants, record external mutations and approvals. No spam, impersonation, hidden scraping or autonomous financial commitments.

## Builder execution instructions for Codex
1. Inspect repository layout, active app entry points, deploy targets, tests and existing Chatbliz/Zuxuru modules.
2. Produce a migration map: retain, adapt, isolate, retire (only with approval); identify Bonga-only dependencies.
3. Implement a Chatbliz namespace and distinct config/branding/data boundary; preserve unrelated code.
4. Build or connect the unified chat task flow and four product workspaces incrementally.
5. Add business-description onboarding and evidence-backed public digital-footprint discovery.
6. Wire AI employees via a single orchestrator and permissioned MCP/tool registry.
7. Wire WhatsApp Business and other integrations only through official authorization and verified API behavior.
8. Replace inert controls with real handlers; add automated tests for task flow, authorization, tenant isolation and failures.
9. Run lint, build, tests, accessibility and security checks; verify live behavior before reporting deployed.
10. Submit reviewable PRs with changed-file list, risks, test results and deployment evidence. Never overwrite main or force-push.

## Definition of done
Chatbliz branded independently; user can describe business, confirm discovered identity, see cited visibility findings, select one of four products, request employee help, approve a task, follow real execution status and view result in one interface. Every external action is authorized and audited. No cross-platform Bonga data or branding leakage. Verified tests and deployment links required before claiming production readiness.
