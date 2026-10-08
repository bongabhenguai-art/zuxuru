# Bonga Bhengu on Cloudflare

Preserves the existing application modules and Sites deployment. The Cloudflare build bundles the same Worker modules while keeping public assets separate, rather than embedding media in the Worker.

Git repository: bongabhenguai-art/zuxuru. Root directory: bonga-platform. Deploy command: npx wrangler deploy. Wrangler runs scripts/build-cloudflare.mjs before deployment.

Prerequisites: activate R2 and create private bucket bonga-bhengu-media; configure Cloudflare Access for dashboard routes with verified email identities; set CF_ACCESS_ISSUER and CF_ACCESS_AUD from the selected Access application. The adapter validates RS256 signature, issuer, audience, expiry, subject and email, and discards client-supplied oai-authenticated headers.

Set JARVIS_VAULT_KEY securely at runtime before connecting an AI key. Never commit private keys. No AI key, media, or existing business records are transferred by this deployment. Cloudflare identities have a separate namespace; existing records require an explicit migration rather than assuming the accounts match.

The storefront is public; dashboard pages reject access until authentication is configured. Backend API modules preserve their existing identity and origin checks. Verify the actual deployed login and permission boundaries before switching the public domain.
