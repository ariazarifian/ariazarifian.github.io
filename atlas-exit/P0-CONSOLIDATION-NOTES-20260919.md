# ATLAS P0 — Canonical USA funnel draft consolidation — 2026-09-19

Branch: `ops/atlas-executor-funnel-20260919`

## Objective
Converge the two earlier Executor experiments into one non-production France → USA journey before any production change.

## Kept
- The four-question route orientation from `draft/atlas-free-route-20260919`: project type, horizon, destination, current priority.
- The chronological 8-step France → USA roadmap from the retention prototype.
- Local-only persistence so answers and checklist progress survive reloads without an account or backend.
- V15 product separation: guide = understanding; roadmap = execution/progression.
- General-information guardrail: the prototype highlights relevant steps but does not choose a visa or calculate individualized tax/legal outcomes.

## Rejected / deferred
- Separate prototype branches as independent product directions: there is now one canonical draft branch.
- The partner-intent button grid in the user journey: strategically premature before acquisition/activation analytics are defined; the concept is deferred to P2/P3.
- Forced lead/contact flow: the canonical draft provides immediate value without requiring email or human contact.
- Analytics in P0: removed from the prototype so this unit remains local-only; P2 owns the minimum event set.
- Reordering the legal/admin chronology based on answers: personalization highlights relevant steps but preserves chronological order to avoid implying that generic profile answers override process dependencies.

## Files
- `atlas-exit/parcours-usa-prototype.html`
- `atlas-exit/parcours-usa-prototype.js`

## Verification performed before commit
- `node --check parcours-usa-prototype.js`: PASS.
- Static HTML assertions: 8 roadmap steps, all required form/summary/progress IDs present: PASS.
- CSP check: `connect-src 'none'`: PASS.
- Analytics script absent from prototype: PASS.

## Result
The canonical draft now combines free immediate orientation, a personalized first-action summary, relevance highlighting, and local save/progress in one reversible non-production journey.
