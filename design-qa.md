# Zuxuru appfront design QA

Source visual truth: public/zuxuru-reference.png (user-supplied 1536 × 1024 reference).
Implementation screenshot: docs/zuxuru-appfront-desktop.jpg.
Reference rendered screenshot: docs/zuxuru-reference-desktop.jpg.
Viewport: 1363 × 936 CSS px, desktop, default browser density. Full-page capture includes each document's natural height (implementation 979 px). Source raster rendered proportionally at browser width; comparisons assessed the shared content regions rather than extra footer or browser chrome.
State: signed-out appfront, empty business-name input.

## Comparison evidence
Both screenshots were opened together in the same comparison input. Full-view comparison covered banner, navigation, hero split, city panel, search, metrics and six operating-flow buttons. Focused hero/nav comparison checked heading wraps, button shape and input spacing. Feature-row comparison checked equal top alignment, icon sizes and two-line descriptions.

## Iterations
1. Earlier P2: navigation and search vertically too tall; features below the reference baseline. Fixed responsive header/banner heights, search height, caption spacing and metrics padding.
2. Earlier P2: feature descriptions created unequal icon alignment. Shortened descriptions, aligned feature buttons at their start and scaled icon containers at the reviewed viewport.
3. Earlier P2 interaction: dialog's close autofocus prevented returning to business input. Explicit onCloseAutoFocus now directs focus to the search input.
4. Revised desktop screenshot opened beside reference; no remaining actionable layout overflow or major-region mismatch in the reviewed desktop state.

## Required fidelity surfaces
- Typography: Arial/system sans, bold three-line headline, gradient Alive, compact navigation. Reference's original font file not provided; small glyph differences remain P3.
- Spacing: split hero, matching width rhythm, refined top offset, search and caption alignment; no horizontal overflow (documentWidth equals innerWidth).
- Colors: navy appfront, purple/pink gradients, purple line icons and subtle border tones.
- Imagery: reference brand mark retained; city photograph recreated from supplied reference; small skyline differences remain P3. Decorative watermark uses the supplied brand asset.
- Copy: core headline and controls retained. Unsupported market-leadership, partner affiliation, 1000-source and growth claims replaced with bounded wording and saved-record counts. These are intentional truthfulness constraints rather than visual defects.

## Interactions checked in browser
- Start Free focuses business-name input.
- Business-name field accepts and clears input.
- How it works opens the actual guided introduction dialog, whose CTA closes it.
- Pricing opens the existing Packages module with R299/R499/R699/R999.
- Module access displays sign-in requirement in the signed-out local environment.
- Browser console checked: no app-origin errors observed; unrelated browser-extension metadata errors present.

## Limitations and intentional changes
The supplied image is a still reference. The media panel now plays an authored 90-second introduction with native playback controls and captions; browser playback and duration were verified. Claimed 10K+, 45+, 95% and 3× values and partner badges are not verified and are not copied as factual claims. Actual source counts appear after sign-in. Authenticated production search has not been browser-tested in this local session. Existing deeper integration limitations remain; this visual QA does not certify a complete operating system. Mobile styles implemented but not browser-verified.

final result: passed


## October 7 functional build
Screenshot: docs/zuxuru-engines-oct7.jpg. Existing architecture and locked R299/R499/R699/R999 packages preserved. Authoritative business-station specification and all 18 Markdown files in the supplied build-spec ZIP were read.

- DeepSearch: public rate-limited investigation, identity candidate evidence, configurable verified SearXNG server. Missing source responses stay unavailable, not fabricated profiles. Local Bonga Bhengu request produced unavailable-source notices; live deep-search coverage is not verified.
- Visibility: deterministic four-check website rubric, explicitly provisional and website-only. Full business rubric remains incomplete.
- Business Graph: owner-provided canonical details, confirmed identities, explicit branch/mall/brand relationships with proof and history.
- CIA: existing GitHub adapter retained; encrypted Postiz credentials, real verification requests, live channels and provider authorization links added. No Postiz server/accounts connected in this session.
- Autopilot: persisted manually triggered rescore/proposal workflow, owner approval before task creation. Continuous Jarvis agent runtime is not deployed.
- Rescore: comparable identity/source/rubric checks and evidence snapshots; failed source reads preserve prior scores.
- Studio: device capture component, private saved assets, approved text/image delivery or scheduling through Postiz, receipts, duplicate prevention. Device permissions and external delivery have not been tested on a user's account.

Validation: TypeScript, mocked owner-isolation/evidence/growth/approval/rescore tests and mocked Postiz encryption/OAuth/publishing/receipt/failure tests passed. SQLite rate-limit SQL checked. These checks do not certify authenticated production social publishing or 24/7 automation.
