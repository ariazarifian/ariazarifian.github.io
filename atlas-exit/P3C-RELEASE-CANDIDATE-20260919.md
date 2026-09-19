# ATLAS EXIT — P3C RELEASE CANDIDATE — 2026-09-19

Status: EXECUTOR FINAL PRODUCT-TRUTH BLOCKER FIXED — RESUBMIT TO CHIEF / NO GREEN LIGHT CLAIMED
Branch: `ops/atlas-executor-funnel-20260919`
Production baseline / rollback commit: `c4421bf67cbcf8bb4f022c7ad35205706a85e22e` on `ops/atlas-exit-20260914`.

## Purpose
One bounded France→USA release candidate: free V15 acquisition → real free download rail → production-safe roadmap → local progress + truthful activation events. Historical paid delivery remains isolated.

## Chief release-gate defects addressed

### 1. Roadmap scroll/rendering
`atlas-exit/parcours-usa.html`
- defect: shared `style.css` applies `body{overflow:hidden}` for the map application shell;
- fix: page-local override now sets `html,body{height:auto;min-height:100%}` and `body{overflow-y:auto;overflow-x:hidden}`;
- commit: `5879e286d60c4d9c9c5aa148961f920071ee065b`;
- current blob: `864062296c01843041ea426772833005bb28ccc2`.

Visual QA was run against the roadmap markup/inline styles with the shared critical base rule `body{overflow:hidden}` present before the page override:
- desktop viewport 1440×1000: computed `overflow-y:auto`, document height 2,048 px, 8 roadmap steps rendered, last step bottom ≈1,625 px, guide bridge bottom ≈1,844 px, no horizontal overflow (`bodyWidth=innerWidth=1440`);
- mobile viewport 390×844: computed `overflow-y:auto`, document height 3,467 px, 8 roadmap steps rendered, last step bottom ≈2,808 px, guide bridge bottom ≈3,169 px, no horizontal overflow (`bodyWidth=innerWidth=390`);
- full-page screenshots were visually inspected: all eight cards, guide bridge, footnote and footer are reachable and readable; mobile cards stack correctly with tags below content.

### 2. Truthful analytics semantics
The old `guide_download` name fired on link click and therefore overstated a confirmed download.

Changed to `guide_download_click` everywhere in the release candidate:
- `atlas-exit/atlas-events.js` commit `21d8c509b8eb52a006f6318ea1cb3881047963d7`, blob `6e0c520c330faa278bcc76828b2918ec02f6fbcf`;
- `atlas-exit/offres.html` commit `0cc95d2fad7cd0211a2d79337f4a35e0210d79b7`, blob `da209bc39deef16227b0e981ea5ca6109e6f7f7a`;
- `atlas-exit/parcours-usa.html` commit `5879e286d60c4d9c9c5aa148961f920071ee065b`.

Verification:
- `node --check` PASS for the current event helper;
- stub collector: `guide_download_click` accepted;
- obsolete `guide_download` rejected;
- injected `city` and `email` fields stripped before delivery;
- allowed payload remains limited to `surface`, `target`, `route_version`, `completed_steps`, `total_steps`, `has_answers`.

### 3. Distribution D0 handoff + indexable USA inventory
Accepted Distribution handoff from commit `9b97e6c70a95057cb04ef1d5c315a4db7c9ae617` was incorporated on the canonical review branch:
- `atlas-exit/s-expatrier-etats-unis.html` commit `1c464913b5517789a5e5d303ee65696d9f22aab9`, blob `0a746572e01078aa74b11ad41d83b9e18a7aa0ab`;
- page now presents V15 edition 15.0 / 25 pages as free and routes to the free guide acquisition page.

The sitemap was used as the bounded inventory of indexable USA acquisition surfaces. Two additional stale paid contradictions were corrected:
- `visa-e2-etats-unis-francais.html`: `Guide États-Unis · 29 €` → `Guide États-Unis gratuit`; commit `37b8ce84779cf8f31350ddcdb4adcdae7205242a`, blob `ffa9e7c7d0cecb4d2d03ad6428e4891dc09d1d1c`;
- `immigration-usa.html`: paid guide CTA replaced by `Guide États-Unis gratuit`; stale `start.html?countries=USA` handoff replaced by `parcours-usa.html` / `Créer ma roadmap gratuite`; commit `df444e5679ef1b1fc7e8b84045558065c75f6b39`, blob `c424cfaaa3ba8a71d05b80eb089b2329fa1d52fd`.

The root explorer uses neutral `Guides & parcours` / `offres.html` wording and does not advertise a paid USA guide, so no root change was required.

### 4. Final product-truth blocker — accompaniment page
The 20:02 Chief re-review identified one remaining contradiction in sitemap-listed `atlas-exit/accompagnement.html`: it still linked to a 29 € guide and presented `Cap USA` as a paid autonomous 290 € path.

Bounded correction on the same review branch:
- first truthfulness commit: `d5ac6a14457d6d65a12ae3a50fe658bb14a3ec16`;
- layout-polish commit: `df8e902ae61c5a19af5f034bdddd3f251beb32cd`;
- final `accompagnement.html` blob: `7eb7fc66d753219d9cf0235dda77039bb21bec3e`.

The page now:
- links back to `Guide États-Unis gratuit` instead of a 29 € guide;
- states explicitly that the V15 guide, roadmap and Atlas self-service tools remain free;
- removes the autonomous `Cap USA` / 290 € card completely;
- retains only clearly human/high-friction lanes: `Projet USA`, `Coordination`, `Signature`, all marked in preparation / not open and described as human accompaniment or coordination;
- keeps `start.html` only as the human-contact modal intake (`Parler de mon projet ↗`), not as the default France→USA self-service path;
- uses an accompaniment-page-local responsive grid override so three remaining human cards render as 3 columns desktop, 2 tablet, 1 mobile without changing shared commerce CSS.

Static QA on the exact fetched-back blob:
- exactly 3 programme cards: `guided`, `coordination`, `signature`;
- no `29 €`, no `Cap USA`, no `autonome` wording;
- free guide link resolves to `offres.html?countries=USA`;
- exactly one `start.html` link remains and it is the human-contact modal CTA;
- responsive 3/2/1 grid breakpoints are present.

Bounded-diff proof: GitHub compare from prior P3C evidence commit `10dea5c4568407116d730e24a1e5787608b8bed1` to the post-fix review branch before this evidence refresh showed exactly two commits and only `atlas-exit/accompagnement.html` changed. A headless Chromium screenshot attempt in the Executor runtime hung in the container/DBus environment, so no new screenshot PASS is claimed for this page; the structural responsive checks above are the verified Executor evidence and Chief should visually re-open the actual artifact during the independent gate.

### 5. Exact production free-payload procedure
Current review branch fact: `atlas-delivery/payload-free-v15/` contains only `manifest.json`; the tested P3B encrypted archive is private in Atlas Drive and was created with a deliberately non-persisted test key. Therefore the current branch must NOT be deployed as-is.

Controlled production procedure after Chief green light:
1. Fetch the exact canonical V15 PDF and verify **8,011,150 bytes** and SHA-256 `825bd8b24eb22f9ff03f67016bc414f054334b243a02d98a071c25b392c3543f` before encryption.
2. Generate a fresh random 32-byte production key in the controlled release runtime. Never write the key to Git, Drive, logs, documentation or frontend code.
3. Gzip the exact V15 bytes, encrypt with AES-256-GCM using the isolated free-guide AAD `atlas-guide-usa-free-v15:gzip`, record the production nonce/tag, and split only the base64 ciphertext into `atlas-delivery/payload-free-v15/chunk1.txt`, `chunk2.txt`, etc. Keep paid `atlas-delivery/payload/chunk*.txt` untouched.
4. Update only the matching free nonce/tag constants + encrypted free chunks/manifest in the bounded backend release artifact. Persist ciphertext with the service artifact; plaintext V15 remains out of the public repository.
5. Set `FREE_GUIDE_KEY_HEX` only in the backend service environment as part of the approved release. No Revolut, DNS or payment-account setting changes are required.
6. Deploy only the bounded backend/free-payload files and bounded frontend/SEO candidate files listed here; do not merge/promote prototype or internal evidence files wholesale.
7. Live verification immediately after backend release: `/health` reports `freeGuideConfigured=true`, edition `15.0`, exact V15 SHA; `GET /free-guide/usa` returns HTTP 200, `application/pdf`, attachment filename for edition 15.0, `Cache-Control: private, no-store, max-age=0`, `X-Content-Type-Options: nosniff`, `X-Robots-Tag: noindex, noarchive`, exactly 8,011,150 bytes and exact SHA-256 above.
8. Paid regression immediately after release: historical paid constants/payload remain unchanged; invalid paid `/download` signature remains HTTP 403; no free request requires a Revolut call.
9. Only after backend smoke passes, release the bounded public frontend/SEO surfaces, then smoke `offres.html`, `parcours-usa.html`, the indexable USA entry pages, and `accompagnement.html`.

## Bounded frontend release set
- `atlas-exit/offres.html`
- `atlas-exit/atlas-events.js`
- `atlas-exit/parcours-usa.html`
- `atlas-exit/parcours-usa.js` (existing RC blob `ab2b2957ead438ec44141fab2e721adc16f08878`)
- `atlas-exit/s-expatrier-etats-unis.html`
- `atlas-exit/visa-e2-etats-unis-francais.html`
- `atlas-exit/immigration-usa.html`
- `atlas-exit/accompagnement.html`

Backend release set remains isolated to `atlas-delivery/server.js` + production-generated `atlas-delivery/payload-free-v15/chunk*.txt` + matching free payload manifest/constants. Historical paid payload files are not part of the change.

## Rollback
- Git/content baseline: `c4421bf67cbcf8bb4f022c7ad35205706a85e22e` for the existing production frontend; historical paid backend rail remains the unchanged baseline established in P3B evidence.
- If backend free smoke fails: redeploy the prior paid-only backend artifact before publishing frontend CTAs; the old paid rail remains available.
- If frontend smoke fails after a healthy backend: redeploy the prior production frontend baseline; the isolated free backend route can remain unreachable until the frontend is retried.
- `FREE_GUIDE_KEY_HEX` is isolated and unused by the paid path; removing it is not required to restore historical paid delivery.

## Gate status
The final product-truth blocker returned by the 20:02 Chief gate is corrected and documented. **No production green light is claimed here.** P3C is resubmitted for independent Chief re-review. No production deploy, Render change, DNS/payment-account change, spend, external message/contact, contract, destructive action, or real-world administrative/legal/tax/immigration/banking automation occurred in this unit.
