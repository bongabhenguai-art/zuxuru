# Bonga Bhengu AI — Visibility Kit

Additive tools for the existing Jarvis business workspace. Public business records and known backlink pages carry source URLs and check dates. Maps prospects remain unreviewed until the owner chooses a next step; they are not confirmed customers or evidence of buying intent.

## Google Maps

Use GitHub Actions → Bonga Visibility Kit → Run workflow → maps. Set a focused business search such as fashion boutiques Durban South Africa. The runner builds the pinned MIT-licensed gosom/google-maps-scraper revision, uses one browser process and depth one, and has a three-minute inactivity timeout within a five-minute process cap. No email extraction, extra reviews, proxies or paid provider are configured. Google can block or change results; a failed or empty scrape is reported as unavailable, not zero businesses.

Download raw results.csv and normalized prospects.json from the bonga-visibility-kit artifact. Import prospects.json in the website's Visibility Kit. Up to 25 source-backed records enter review. This is manual collection, not a recurring scrape or live website API.

## Backlinks

Choose backlinks, set the target URL and enter known source page URLs, one per line (up to ten). The adapter checks real HTML anchors, their rel attributes and HTTP status. Blocked or failed pages remain unknown. This validates supplied pages; it cannot discover every internet backlink or guarantee ranking improvements. The reviewed rvalitov/backlink-checker repository is recorded as an upstream reference; the evidence adapter here is original Python code and does not copy its GPL script.

## Tests

python3 -m unittest discover -s visibility -p 'test_*.py'

Tests run on kit changes. Live scraping runs only when you choose Run workflow. Import/export and local review work without a model key. No outreach, social publishing or purchase is performed.
