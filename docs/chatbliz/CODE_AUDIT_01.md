# Chatbliz Code Audit 01 — Verified Starting Point
Date: 2026-10-12
Branch: chatbliz-os-spec-2026-10-12

## Files inspected
- package.json: Next.js 16.3.4, React 19.2.6, TypeScript, Drizzle ORM, Vinext/Cloudflare; pnpm package manager; lint/build scripts.
- app/page.tsx: server-side authentication helper; renders Appfront from ./appfront.
- app/appfront.tsx: existing Zuxuru-branded client landing page. Signed-in users enter Workspace, imported from ./workspace. Business investigation POSTs to /api/os or /api/public/investigate. It has public evidence results, login flow, studio navigation and many other Zuxuru routes.
- README.md: repository starter/deployment guidance, Cloudflare runtime and optional D1 bindings.

## Findings
1. Existing investigation and evidence rendering may be reusable; do not replace blindly.
2. Current branding says ZUXURU and 'Zuxuru by Bysei'; this violates Chatbliz's independent branding requirement if reused unchanged.
3. Current landing page begins with a business-name search, not a conversational business description.
4. Appfront routes signed-in visitors to Workspace; inspect app/workspace and its data flows before changing navigation.
5. Existing 'Start Free' marketing language must be reviewed against Chatbliz owner-approved commercial terms.
6. No evidence yet that Chatbliz-specific four-product deliverables, unified role router or WhatsApp link are implemented.
7. README documents optional mock auth in local portable mode; production authentication and tenant isolation require explicit verification.

## Next smallest code change
After inspecting app/workspace and relevant API/database files, create a Chatbliz-specific chat-first route or isolated UI component on this branch, without altering the legacy Zuxuru root experience or mixing Bonga data. Wire one end-to-end 'describe business -> save profile -> generate editable My Business plan' flow. Then add the other three product outputs. Do not claim it works until build and runtime tests pass.

## Risk
This repository contains historical cross-product branding and functionality. Migration must isolate rather than overwrite unrelated data or routes.
