# Cloudflare media configuration

Updated 8 October 2026: R2 is activated, private bucket `bonga-bhengu-media` exists, and the default `wrangler.jsonc` binds it as `MEDIA`. The production deployment succeeded and its R2 binding was verified. The default deployment no longer needs a separate activation profile.

`wrangler.r2.jsonc` remains a prepared alternate configuration; use the default configuration for the current Cloudflare build trigger.

Keep the bucket private. Approved public storefront assets are served through existing application routes. The included cloud allowance is not unlimited storage. Application limits remain 50 MB per file, 100 files and 1 GB per owner.

Code-level upload, private retrieval, owner isolation and deletion checks passed. Remaining authenticated browser checks: upload, range playback, edited-copy save, Studio attachment and approved storefront asset behavior.

See [repository architecture map](../../docs/BONGA-ARCHITECTURE.md) for module ownership and execution boundaries.
