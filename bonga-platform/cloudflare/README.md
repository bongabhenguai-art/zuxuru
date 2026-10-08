# Bonga Bhengu on Cloudflare

Preserves the existing application modules and Sites deployment. The Cloudflare build bundles the same Worker modules while keeping public assets separate, rather than embedding media in the Worker.

Git repository: bongabhenguai-art/zuxuru. Root directory: bonga-platform. Deploy command: npx wrangler deploy. Wrangler runs scripts/build-cloudflare.mjs before deployment.

Cloudflare Access organization, email-code provider and private dashboard policy are created. The issuer and audience are configured in wrangler.jsonc. Owner login uses donlegendwear@gmail.com, matching the existing owner gate. Same-origin backend calls can present a signed CF_Authorization session cookie. The adapter validates RS256 signature, issuer, audience, expiry, subject and email, and discards client-supplied oai-authenticated headers.

Set JARVIS_VAULT_KEY securely at runtime before connecting an AI key. Never commit private keys. No AI key, media, or existing business records are transferred by this deployment. Cloudflare identities have a separate namespace; existing records require an explicit migration rather than assuming the accounts match.

The storefront is public; dashboard pages reject access until authentication is configured. Backend API modules preserve their existing identity and origin checks. Verify the actual deployed login and permission boundaries before switching the public domain.

Media storage is optional at deployment: no R2 activation or billing enrollment is required by this config. Without an authorized provider, uploads return unavailable rather than pretending files were saved. The Dropbox adapter activates when DROPBOX_ACCESS_TOKEN or offline OAuth secrets DROPBOX_APP_KEY, DROPBOX_APP_SECRET and DROPBOX_REFRESH_TOKEN are set securely in Worker settings. Dropbox connection in ChatGPT does not supply these website credentials. No existing files are moved. TeraBox remains a candidate archive provider, not a connected service.
