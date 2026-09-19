# ATLAS DELIVERY — P3B TEST EVIDENCE — 2026-09-19

Status: PASS — NON-PRODUCTION ONLY
Branch: `ops/atlas-executor-funnel-20260919`
Task: P3B

## Exact V15 source
- Drive source ID: `1XPqrpVMOwSw0tuM_hlaTqrELes8GwhHV`
- bytes: `8,011,150`
- SHA-256: `825bd8b24eb22f9ff03f67016bc414f054334b243a02d98a071c25b392c3543f`

## Isolated encrypted test payload
- AES-256-GCM, gzip before encryption.
- AAD: `atlas-guide-usa-free-v15:gzip`
- ciphertext bytes: `7,470,736`
- ciphertext SHA-256: `9cc55beeeab848030fda753d4015fadceb746cfdba5b979860e9a7b034804f7b`
- base64 chars: `9,960,984`, split into two equal encrypted chunks.
- nonce: `pp4LL4UGUMwxXPCb`
- tag: `J4NXW8qKddFdWbCTN1nMKw==`
- encryption key: supplied only through `FREE_GUIDE_KEY_HEX` in the Executor test runtime; not committed to GitHub or Drive.
- private encrypted archive in Atlas Drive: `ATLAS — V15 FREE PAYLOAD — ENCRYPTED — P3B.zip`, file ID `1Q8gUJ56SFpBf32u0-6pcrgKPy2YGKNvE`.
- encrypted archive SHA-256: `9a897f243b3b367c3fa520fa68fc378db1dd7ca93ecd2e4bae2bb0e6b445e8e3`.
- archive contents reverified from Drive: `chunk1.txt` 4,980,492 bytes SHA-256 `fad097e9079b610e0c0af072ef84af64a61624e702fe61f0e9cc156aafdaf974`; `chunk2.txt` 4,980,492 bytes SHA-256 `cd4edaa601c39a399dee21b35e621b41c6f291726e76a755f64fdd5ab9103c3a`.

## Backend review implementation
- `atlas-delivery/server.js` commit `4238bd3b30c4513d21781ccd9589d60b74262a89` added the isolated route.
- follow-up commit `4d4709b525a3b8f612546f1cda8e3ab97ef2d0eb` attempted the first chunk-matching correction.
- revalidation caught a remaining escaped-regex defect in the second side of the numeric chunk sorter; commit `fb95288dbe0bf9ce56f5d64b69689d48f2ba904f` fixes exactly that one line.
- current verified server blob: `ebc72a07d8165a346fe3fdd264b6d6b3de49263b`.
- payload manifest commit: `0c57387c0470e564e99e76476ced564ed3086f81`.

Isolated runtime namespace:
- `FREE_GUIDE_KEY_HEX`
- `FREE_GUIDE_EDITION = 15.0`
- `FREE_GUIDE_SHA256 = 825bd8...`
- `FREE_GUIDE_NONCE_B64`
- `FREE_GUIDE_TAG_B64`
- `FREE_GUIDE_AAD`
- `decryptFreeGuide()`
- `GET /free-guide/usa`

## Runtime tests

### Syntax
`node --check server.js` → PASS on the exact current server blob `ebc72a07d8165a346fe3fdd264b6d6b3de49263b`.

### Health
With the matching test-only `FREE_GUIDE_KEY_HEX`:
- `freeGuideConfigured = true`
- `freeGuideEdition = 15.0`
- `freeGuideSha256 = 825bd8b24eb22f9ff03f67016bc414f054334b243a02d98a071c25b392c3543f`
- `revolutConfigured = false` during the free-route test.

### Free route
Local request to `GET /free-guide/usa` against the exact current committed server blob plus the encrypted Drive payload:
- HTTP `200`
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="Atlas-Exit-Guide-Etats-Unis-Edition-15.0.pdf"`
- `Cache-Control: private, no-store, max-age=0`
- `X-Content-Type-Options: nosniff`
- `X-Robots-Tag: noindex, noarchive`
- `Content-Length: 8011150`
- returned SHA-256: `825bd8b24eb22f9ff03f67016bc414f054334b243a02d98a071c25b392c3543f` → exact V15 byte match.

### No Revolut dependency on free route
Test server ran with `REVOLUT_SECRET_KEY=NEEDS_CONFIGURATION`, which makes `revolutFetch()` fail before any network request. The free route still returned HTTP 200 and the exact V15 bytes. Therefore the free path does not depend on or invoke the Revolut order flow.

### Paid route regression
Review branch vs `ops/atlas-exit-20260914`:
- `createCheckout()`: exact match
- `retrieveOrder()`: exact match
- `orderPaidAndCorrect()`: exact match
- `decryptGuide()`: exact match
- paid constants `PRODUCT_ID`, `GUIDE_EDITION`, `PRODUCT_PRICE`, `PRODUCT_CURRENCY`, `GUIDE_SHA256`, `GUIDE_NONCE_B64`, `GUIDE_TAG_B64`: exact match
- paid payload chunk 1 blob remains `596c064575639ee85a821b6a3094560f86c2fcbc`
- paid payload chunk 2 blob remains `63b69696ce3654ada6ccf65d12c09374bd0db155`
- signed paid `/download` block: exact match
- runtime invalid-signature request to paid `/download`: HTTP `403`.
- the final P3B corrective commit touches only the free chunk-sort regex, so it does not alter any paid code path.

## Boundary
No Render deploy, production publication, DNS/payment change, external message, spending, or plaintext V15 publication occurred.

The encrypted ciphertext is persisted privately in Drive for review continuity; the free encryption key remains intentionally uncommitted. A production cutover must create/inject a production `FREE_GUIDE_KEY_HEX` together with a matching encrypted payload as one bounded release step, after the Chief release gate.
