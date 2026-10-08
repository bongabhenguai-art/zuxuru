# Cloudflare media activation

Prepared deployment profile: wrangler.r2.jsonc.

Use only after the account owner enables R2 and the private bonga-bhengu-media bucket exists. The default deployment intentionally has no R2 binding so disabled storage cannot break the website build.

Maintainer completion: create bonga-bhengu-media with Standard storage, deploy the prepared profile with wrangler deploy --config wrangler.r2.jsonc, and update the Cloudflare build trigger to use that profile after the first successful deployment. Confirm authenticated upload, owner-only retrieval, range playback, edited-copy save, Studio attachment and published storefront asset behavior. Do not enable public bucket access: serve approved public assets through the existing application routes.

R2 activation includes an account checkout and billing agreement. Confirm the owner has completed that step before creating resources. The included allowance is not unlimited storage. Application upload limits remain enforced independently.
