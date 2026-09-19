# ATLAS EXIT — P3C RELEASE CANDIDATE — 2026-09-19

Status: EXECUTOR FRONTEND UNIT COMPLETE — CHIEF RELEASE GATE STILL REQUIRED
Branch: `ops/atlas-executor-funnel-20260919`
Production baseline / rollback commit: `c4421bf67cbcf8bb4f022c7ad35205706a85e22e` on `ops/atlas-exit-20260914`.

## This P3C unit
Converted the previously internal/noindex France→USA funnel into production-facing candidate surfaces without deploying them.

### Public acquisition candidate
`atlas-exit/offres.html`
- current blob: `14b5cd4fdef25537cc43873bd59162f916819126`
- commit: `93283aaa15dbf4034942f040cfb30272b5225cbc`
- removed internal draft banner, `noindex`, prototype copy, and the statement that V15 is unavailable;
- truthful V15 positioning: 25 pages, free, no account/payment;
- real guide CTA points to `https://atlas-exit-delivery.onrender.com/free-guide/usa`;
- roadmap CTAs point to `parcours-usa.html`;
- no checkout form, price, Revolut purchase flow, or payment-setting change.

### Production-safe roadmap candidate
`atlas-exit/parcours-usa.html`
- blob: `8a6b5a6a8003e0e9195c9d634e1b77e1790c6bec`
- commit: `f4421dd417b7d3a8bc67b028688e5f3f85e012c3`
- production title/description; no `prototype`/`draft`/`noindex` wording;
- eight-step roadmap retained;
- four-question orientation retained;
- local-only progression disclosure retained;
- guide CTA uses the real isolated free route.

`atlas-exit/parcours-usa.js`
- blob: `ab2b2957ead438ec44141fab2e721adc16f08878`
- commit: `ddef20043e9d2fbe7d5e51731d227f48e9f61e6d`
- storage key/version moved to `atlas_usa_route_v3` / `usa-v3`;
- no city/email/free-text values are emitted to analytics;
- route_started, roadmap_saved, roadmap_returned, route_completed retained.

### Production-safe activation events
`atlas-exit/atlas-events.js`
- blob: `721cc59775943059e531d0679bf634c51ce31f31`
- commit: `c17dfcc2fade3942107e5c36a401fb8adf674e56`
- allowlist now includes the real `guide_download` action plus existing activation events;
- payload allowlist remains `surface`, `target`, `route_version`, `completed_steps`, `total_steps`, `has_answers`;
- uses an injected collector when present, otherwise Umami if available, otherwise no-op;
- click instrumentation is data-attribute based and sends no email/city/free text.

## Verification performed
- fetched all four committed production-candidate files back from GitHub after writes;
- `node --check` PASS for the exact `atlas-events.js` and `parcours-usa.js` source committed in this unit;
- local stub event test: `guide_download` accepted; disallowed `partner_intent` rejected; test `city` and `email` fields stripped before collector delivery;
- static fetch-back inspection confirms `offres.html` and `parcours-usa.html` contain no draft/noindex/prototype wording and both reference the real `/free-guide/usa` endpoint and production roadmap path;
- current review branch compare to production baseline still preserves the isolated P3B backend implementation and leaves historical paid constants/routes untouched per prior P3B evidence.

## Remaining release-gate work
P3C is NOT done and no production green light is claimed.

Before deployment, CHIEF must independently inspect this candidate and complete the release gate, including desktop/mobile visual QA, bounded production diff review, backend/free-route evidence review, and rollback confirmation.

The current P3B ciphertext archive was deliberately tested with a non-persisted test-only free-guide key. Therefore a production deployment must prepare a matching production `FREE_GUIDE_KEY_HEX` + encrypted V15 payload as one controlled release step after Chief green light; do not deploy the current backend code without a matching production payload/key.

No Render deployment, DNS/payment-account change, spend, external message, contract, or real-world administrative/legal/tax/immigration/banking automation occurred in this unit.
