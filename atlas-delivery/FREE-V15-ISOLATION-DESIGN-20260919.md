# ATLAS DELIVERY — FREE V15 ISOLATION DESIGN — 2026-09-19

Status: NON-PRODUCTION DESIGN
Branch: ops/atlas-executor-funnel-20260919
Task: P3A

## Invariant

Historical paid delivery must remain unchanged while the free V15 path is added.

Paid namespace remains untouched:
- GUIDE_KEY_HEX
- GUIDE_EDITION = 2.0
- GUIDE_SHA256 = e36e055c9b8aae04c4f08f8bc2f1b5eb030b732c3ed0200bb68599c8f54c32f7
- GUIDE_NONCE_B64 / GUIDE_TAG_B64
- atlas-delivery/payload/chunk1.txt
- atlas-delivery/payload/chunk2.txt
- decryptGuide()
- orderPaidAndCorrect()
- POST /checkout
- GET /complete
- GET /status
- signed GET /download

## Free V15 namespace

Exact source artifact:
- Drive ID: 1XPqrpVMOwSw0tuM_hlaTqrELes8GwhHV
- size: 8,011,150 bytes
- pages: 25 A4
- SHA-256: 825bd8b24eb22f9ff03f67016bc414f054334b243a02d98a071c25b392c3543f

New isolated runtime names:
- FREE_GUIDE_KEY_HEX
- FREE_GUIDE_EDITION = 15.0
- FREE_GUIDE_SHA256 = 825bd8b24eb22f9ff03f67016bc414f054334b243a02d98a071c25b392c3543f
- FREE_GUIDE_NONCE_B64
- FREE_GUIDE_TAG_B64
- FREE_GUIDE_AAD = atlas-guide-usa-free-v15:gzip
- decryptFreeGuide()

New isolated encrypted files:
- atlas-delivery/payload-free-v15/chunk1.txt
- atlas-delivery/payload-free-v15/chunk2.txt

New route:
- GET /free-guide/usa

The free route:
1. never reads order, email, payment state, PRODUCT_ID, or paid payload files;
2. never calls retrieveOrder(), revolutFetch(), or orderPaidAndCorrect();
3. decrypts only payload-free-v15 through decryptFreeGuide();
4. validates only FREE_GUIDE_SHA256;
5. returns attachment PDF headers plus no-store, nosniff, noindex/noarchive.

## P3B test contract

P3B must prove:
- node syntax check passes;
- exact V15 decrypted bytes hash to 825bd8b24eb22f9ff03f67016bc414f054334b243a02d98a071c25b392c3543f;
- free route returns the expected PDF/security headers;
- a stubbed free-route request records zero Revolut calls;
- paid payload chunk blob SHAs remain unchanged from baseline;
- paid /download still rejects missing/invalid signature and still performs paid-order verification before decryptGuide();
- no plaintext V15 PDF exists in the repository.

## Rollback

Free-path rollback deletes/reverts only:
- free constants/decrypt function/route additions;
- payload-free-v15 files;
- free frontend wiring.

It does not require replacing historical paid payload files or changing Revolut/DNS configuration.
