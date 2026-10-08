# Bonga Bhengu Jarvis AI

Jarvis is part of the existing Bonga Bhengu operating system. This folder provides a single entry point; implementation stays in the shared Worker modules.

## Entry point

`index.mjs` exports the same Jarvis connection, response test and specialist routing used by the Cloudflare app. It does not start a second service or duplicate business records.

## Runtime

Source repository: bongabhenguai-art/zuxuru. Cloudflare build root: bonga-platform. Build: npm ci --include=dev, then npx wrangler deploy. GitHub stores source and can run scheduled report jobs; Cloudflare serves the live dashboard and backend.

## Existing routes

- /api/jarvis/connection: owner-only encrypted key save, status and disconnect.
- /api/jarvis/test: owner-only real model response test.
- /api/jarvis/chat: research, planning and specialist draft generation.
- /api/jarvis/status: configured-key status, not proof of a successful model response.

## Security and setup

Cloudflare Access verifies dashboard identity. Private keys are encrypted with AES-GCM using a runtime secret and stored separately from media in D1. Never put an API key in GitHub. Open the dashboard's Jarvis connection window, save the full API key, then run Test AI response. Provider permissions and usage allowance still apply.

## Business workflow

Jarvis drafts proposals for sales, marketing, branding, visibility and SEO, products, opportunities, AI skills and career rebuilding. Human review remains required. Existing workspace task and Studio modules execute their supported actions; external publishing and storage require their own authorized connections.

This is Bonga Bhengu's existing Jarvis implementation, not an installed third-party repository. No automatic customer outreach, unlimited AI access or connected social accounts are implied.
