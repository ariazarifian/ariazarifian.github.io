# ATLAS EXIT — V15 FREE-DISTRIBUTION CUTOVER SPEC — 2026-09-19

Status: INTERNAL / NON-PRODUCTION
Owner: ATLAS EXECUTOR
Scope: France → USA only
Target branch: `ops/atlas-executor-funnel-20260919`
Production baseline: `ops/atlas-exit-20260914` @ `c4421bf67cbcf8bb4f022c7ad35205706a85e22e`

## Objective

Make the existing V15 USA guide genuinely obtainable for free while preserving the current paid delivery rail for rollback and historical paid-order links. This package does not deploy, publish V15, change Revolut settings, touch DNS, or alter production.

## Verified current state

### Guide asset
- Drive artifact: `Atlas Exit — Guide États-Unis — Édition 15.0 BEST OF V13 + FICHES PRATIQUES.pdf`
- Drive file ID: `1XPqrpVMOwSw0tuM_hlaTqrELes8GwhHV`
- Current V15 state: 25 A4 pages; preferred direction after V14.
- V15 is not currently wired to the public delivery rail.

### Public acquisition page — production baseline
File: `atlas-exit/offres.html`
Verified blob: `f5d1c73f6d8a36781e18d6d8b97fcf118e64e40d`

The production page still exposes:
- 29 € price;
- email capture;
- `#guideCheckoutForm`;
- Revolut purchase language;
- Edition 2.0 / 53-page copy;
- scripts including `offres.js`.

### Checkout frontend — production baseline
File: `atlas-exit/offres.js`
Verified blob: `a201b4a415cd8da4aec2451f90a94d6c38009e50`

The production JS posts the user's email to:
`POST https://atlas-exit-delivery.onrender.com/checkout`
then redirects to the returned Revolut `checkout_url`.

### Delivery backend — production baseline
File: `atlas-delivery/server.js`
Verified blob: `435b5ffc91d79bf5ddfb5e1920b30acd7e4b3c58`

Current commerce constants / behavior:
- stable product ID: `atlas-guide-usa-v1.2`;
- current visible edition: `2.0`;
- price check: 2900 EUR cents;
- guide stored as encrypted payload chunks and decrypted server-side with AES-256-GCM;
- plaintext PDF integrity checked against `GUIDE_SHA256`;
- routes:
  - `POST /checkout` — create Revolut order;
  - `GET /complete` — signed post-payment landing page;
  - `GET /status` — signed payment verification;
  - `GET /download` — signed, paid-only PDF response;
  - `GET /health` — service/config metadata.

The free-funnel branch is 11 commits ahead of the production baseline and currently changes only draft frontend / analytics files. It does not modify `atlas-delivery/server.js`.

## Cutover architecture

### Principle
Keep V15 out of the public repository in plaintext. Reuse the existing encrypted-at-rest delivery pattern, but add a separate free download route that does not call Revolut, require email, or accept user-supplied identity data.

### Proposed backend change
Modify `atlas-delivery/server.js` on the production-review change set, not on live production directly.

1. Replace the encrypted guide payload with an encrypted V15 payload generated from the exact Drive artifact.
2. Update:
   - `GUIDE_EDITION` → `15.0`;
   - `GUIDE_SHA256` → SHA-256 of the exact V15 PDF;
   - `GUIDE_NONCE_B64`;
   - `GUIDE_TAG_B64`;
   - `atlas-delivery/payload/chunk1.txt`;
   - `atlas-delivery/payload/chunk2.txt`.
3. Preserve:
   - `PRODUCT_ID = atlas-guide-usa-v1.2`;
   - existing Revolut constants;
   - `/checkout`, `/complete`, `/status`, and paid `/download` behavior.
4. Add one new route:
   - `GET /free-guide/usa`
   - no email;
   - no payment lookup;
   - no query token required;
   - decrypts the same verified V15 payload through `decryptGuide()`;
   - responds `Content-Type: application/pdf`;
   - responds `Content-Disposition: attachment; filename="Atlas-Exit-Guide-Etats-Unis-Edition-15.0.pdf"`;
   - responds `Cache-Control: private, no-store, max-age=0`;
   - responds `X-Content-Type-Options: nosniff`;
   - responds `X-Robots-Tag: noindex, noarchive`.

Reason: the guide is intentionally free, so access control is not a product requirement after cutover. Keeping the encrypted payload server-side prevents accidental plaintext publication in source control, but it does not and cannot prevent a recipient from redistributing a legitimately downloaded free PDF.

### Proposed frontend change
Replace the production `atlas-exit/offres.html` paid acquisition block with the already-prepared free V15 positioning from the canonical draft, then wire a real download CTA to:
`https://atlas-exit-delivery.onrender.com/free-guide/usa`

Required production copy changes:
- remove 29 €;
- remove checkout form / email field;
- remove paid-delivery wording;
- remove Edition 2.0 / 53-page claims;
- present V15 / 25-page free guide truthfully;
- preserve general-information / no-guarantee scope language;
- keep a second CTA into `parcours-usa-prototype.html?source=free_funnel` only if/when that route is part of the approved production set.

### Frontend JS handling
`atlas-exit/offres.js` should not be required for the USA free-guide path.

Two safe options for the production change set:
- preferred: remove the `offres.js` script from the free USA page if no remaining functionality needs it;
- rollback-compatible alternative: leave the file in the repository unchanged but do not load or invoke its checkout handler from the free page.

Do not delete `offres.js` in the cutover. Retaining it makes rollback trivial.

## Paid checkout rollback strategy

The free cutover does not delete or reconfigure Revolut.

During free mode:
- public frontend exposes no paid CTA and does not call `POST /checkout`;
- backend paid endpoints remain available for historical signed order links and rollback;
- Revolut Merchant API settings remain untouched.

Rollback to paid mode:
1. restore `atlas-exit/offres.html` from production baseline commit `c4421bf67cbcf8bb4f022c7ad35205706a85e22e`;
2. restore/reload `offres.js` checkout wiring if it was removed from page markup;
3. if V15 should remain the delivered paid asset, keep the V15 encrypted payload and edition metadata; otherwise restore the prior backend/payload commit set;
4. redeploy the frontend/backend only after QA;
5. verify `POST /checkout` is reachable only from an allowed origin and a test checkout can be created without completing a real paid transaction unless explicitly approved.

No DNS or Revolut account-setting rollback is needed because neither is changed by this plan.

## Asset handling / security implications

- Never commit the V15 plaintext PDF to the public GitHub repository.
- Generate encrypted chunks from the exact Drive V15 artifact in a trusted local/runtime context.
- Never write `GUIDE_KEY_HEX` or `DELIVERY_SIGNING_SECRET` into GitHub or Drive documentation.
- Keep the existing environment secret model on Render.
- Record the plaintext V15 SHA-256 in code/spec for integrity verification; a SHA-256 hash is not a secret.
- Validate the encrypted payload by decrypting it in a non-production test context and comparing the resulting SHA-256 to the recorded V15 hash.
- Because V15 will be free, downstream redistribution is an accepted consequence of free distribution. Encryption is for source/deployment hygiene, not DRM.
- The free route should collect no email, name, city, free-text answers, or legal/tax facts.
- Do not log signed paid-order URLs or secrets as part of free-download instrumentation.

## Preflight checklist

### Asset
- [ ] Fetch the exact Drive V15 artifact by file ID `1XPqrpVMOwSw0tuM_hlaTqrELes8GwhHV`.
- [ ] Confirm it opens as PDF and is the 25-page V15 candidate.
- [ ] Compute and record its SHA-256.
- [ ] Encrypt/compress into backend payload chunks without exposing plaintext in GitHub.
- [ ] Test decryption and exact SHA-256 equality.

### Backend
- [ ] Add `GET /free-guide/usa` only in the review branch.
- [ ] Keep existing paid routes intact.
- [ ] Run syntax test on `server.js`.
- [ ] Test `/health` in local/stub mode.
- [ ] Test free route returns PDF headers and exact bytes from decrypted payload.
- [ ] Test invalid/missing guide key fails closed.
- [ ] Confirm no request to Revolut is made by the free route.
- [ ] Confirm existing paid `/download` still requires a valid signed order and completed 29 EUR payment.

### Frontend
- [ ] Production-review page contains no 29 € or checkout language.
- [ ] No USA email field or purchase form remains.
- [ ] Free CTA targets the real backend free route.
- [ ] Roadmap CTA targets an approved production route, not a draft-only path.
- [ ] Scope/trust copy remains.
- [ ] No fake download or fake analytics event exists.

### Integration / production approval gate
- [ ] Review branch diff contains only intended frontend/backend/payload changes.
- [ ] Aria approves publishing/deployment.
- [ ] No DNS/payment settings are changed.
- [ ] Deploy backend first, verify health/free route, then deploy frontend.
- [ ] Verify the free CTA from the public page downloads the exact V15 PDF.
- [ ] Verify paid historical signed links still behave correctly.
- [ ] Only after the real free action exists, add/enable `guide_download` measurement with no PII.

## Rollback checklist

If the free cutover misbehaves:
1. revert the public frontend to baseline `c4421bf67cbcf8bb4f022c7ad35205706a85e22e`;
2. redeploy frontend;
3. if backend V15/free-route changes are implicated, redeploy the previous backend commit/payload set;
4. verify `/health`, `/checkout`, signed `/status`, and signed paid `/download`;
5. do not change Revolut or DNS settings as part of rollback unless an independent fault specifically requires it and Aria separately approves that action.

## Exact production-review file list

Must change:
- `atlas-exit/offres.html`
- `atlas-delivery/server.js`
- `atlas-delivery/payload/chunk1.txt`
- `atlas-delivery/payload/chunk2.txt`

May remain unchanged but retained for rollback:
- `atlas-exit/offres.js`

Already-prepared non-production inputs:
- `atlas-exit/parcours-usa-prototype.html`
- `atlas-exit/parcours-usa-prototype.js`
- `atlas-exit/draft-events.js`
- `atlas-exit/DRAFT_ANALYTICS_CONTRACT.md`

## Approval boundary

This spec is complete enough to prepare a production-review change set, but actual publication/deployment is an Aria action boundary. Do not deploy, expose V15 publicly, alter payment settings, or publish the new free URL until Aria approves the cutover.
