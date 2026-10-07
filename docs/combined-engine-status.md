# Combined Zuxuru frontend and intelligence engines

Collected 63 native Zuxuru source/spec/design files; the Site remains the existing application. Inventory hashes and archive audit are recorded alongside this document. Legacy generated identity names and demo IDs are not used as live results.

Implemented: visibility station dashboard using real saved records; deterministic evidence findings and ranked opportunities; durable owner-provided business memory; owner-isolated encrypted OmniRoute-compatible AI connection, verified model catalog, explicit per-run disclosure consent, citation validation and durable agent-run history. AI cannot change scores, execute tasks or publish. Reviewed creative drafts can enter the existing Studio approval workflow.

Verification: TypeScript and mocked owner-isolation, provenance, consent, encryption, failure-history, rate-limit and growth-workflow checks pass. Run `node tests/verify-growth.cjs` and `node tests/verify-ai-intelligence.cjs` after dependency installation. Providers are mocked in these tests.

Not verified: live AI completion, authenticated production business workflow or authorized search/social/publishing credentials. A user-owned public HTTPS gateway and model key must be connected in CIA. ChatGPT connector sessions are not automatically available to the deployed app. Continuous Jarvis agent orchestration and all legacy archive capabilities are not deployed.
