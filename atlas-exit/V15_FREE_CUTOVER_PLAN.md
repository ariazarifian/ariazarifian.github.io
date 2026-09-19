# ATLAS EXIT — V15 FREE CUTOVER PLAN

Status: internal draft / non-production  
Branch: `ops/atlas-executor-funnel-20260919`  
Date: 2026-09-19

## Objective

Prepare a production-safe migration from the old paid Edition 2.0 acquisition flow to the free V15 funnel without publishing, deploying, changing Render/Revolut, or exposing the V15 PDF now.

## Verified current paid dependencies

- `atlas-exit/offres.html` on `ops/atlas-exit-20260914` still represents the historical paid USA guide acquisition flow.
- `atlas-exit/offres.js` on `ops/atlas-exit-20260914` posts the buyer email to `https://atlas-exit-delivery.onrender.com/checkout` and redirects to the returned checkout URL.
- The historical production delivery rail is coupled to the Atlas delivery backend and Revolut Merchant checkout.
- Those production/payment dependencies are explicitly out of scope for this package.

## Target non-production state already prepared

- P0: one canonical France → USA personalized route + roadmap with local progress persistence.
- P1: free V15-style USA acquisition page on the canonical draft branch, with no price or checkout form.
- P2: draft activation/retention analytics hooks designed without PII and without an external collector enabled by default.
- V15 PDF remains private and unlinked; no public download URL is invented.

## Files / surfaces expected in a future cutover

- `atlas-exit/offres.html` — free acquisition surface.
- `atlas-exit/offres.js` — retire paid checkout behavior from the public acquisition path when an approved production cutover occurs.
- `atlas-exit/analytics.js` — use free-funnel activation events instead of paid-checkout events where relevant.
- `atlas-exit/index.html` — verify CTA/path/copy points into the free USA journey.
- V15 free delivery artifact/mechanism — still to be prepared and verified before any public switch.
- Render/Revolut backend — leave unchanged until a separate explicit decision is made to decommission or repurpose it.

## Hard no-go boundaries for this package

- No production merge or deployment.
- No Render service or environment-variable changes.
- No Revolut or payment-setting changes.
- No DNS changes.
- No secret exposure.
- No public V15 PDF upload or download link.
- No deletion or decommissioning of the existing paid rail.
- No external messages or partner outreach.

## Proposed rollout sequence after approval

1. Verify the exact V15 binary intended for free distribution and record its hash.
2. Prepare the simplest safe free-delivery mechanism in non-production.
3. Connect the V15 artifact only in the non-production flow.
4. Verify free acquisition page → route → roadmap/local persistence → analytics behavior.
5. Confirm that the free flow makes no checkout API request.
6. Prepare the exact production diff and rollback point.
7. Obtain Aria approval for the production switch.
8. Deploy the approved change.
9. Run production smoke tests.
10. Only later evaluate whether the old paid backend should be retained, repurposed, or retired.

## Verification matrix

- Free acquisition page contains no price, checkout form, or paid-guide promise.
- Primary CTA opens the personalized France → USA route.
- Route produces an immediate first-order plan.
- Roadmap progress is saved locally and a return can be detected.
- Draft analytics do not emit PII.
- Free flow does not call `atlas-exit-delivery.onrender.com/checkout`.
- V15 download remains unavailable until a real artifact connection is deliberately prepared and tested.
- Existing paid backend remains untouched before the approved cutover.

## Rollback principle

Keep the existing paid rail intact until the free rail has been verified. A future production rollback should be a code/deploy revert to the previous known-good state, not deletion of infrastructure, payment settings, or secrets.

## Open dependency

The V15 filename/state is known in Drive, but a safe public/free delivery route has not yet been explicitly connected. Do not invent a download URL or claim the PDF is publicly available.

## Approval gate

Preparing and testing this package is reversible internal work. Any actual production switch, public publication of the free V15 guide, Render/Revolut change, or retirement of the paid rail requires Aria.
