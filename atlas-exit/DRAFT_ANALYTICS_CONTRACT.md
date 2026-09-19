# Atlas USA draft analytics contract — P2

Scope: canonical non-production France→USA funnel only. No external collector is enabled by this draft. `connect-src 'none'` remains in the roadmap page CSP.

## Event transport

`draft-events.js` exposes `window.AtlasDraftEvents.track(name, payload)`.

- If `window.ATLAS_EVENT_COLLECTOR` is absent, every call safely returns `false` and sends nothing.
- If a stub/collector exists, only the event names and fields below are forwarded.
- Unknown fields are discarded before the collector sees the payload.
- The event layer never reads or forwards email, destination city, free text, document contents, localStorage answers, or other user-entered text.

## Allowed events

### `free_funnel_cta`
Real action represented: successful handoff from the free V15 acquisition page into the roadmap via `?source=free_funnel`.
Allowed payload: `surface`, `target`, `route_version`.

### `route_started`
Real action represented: first successful save of roadmap orientation answers in the current localStorage lifecycle.
Allowed payload: `route_version`, `total_steps`.

### `roadmap_saved`
Real action represented: first successful local persistence of the roadmap while a collector is present.
Allowed payload: `route_version`, `completed_steps`, `total_steps`, `has_answers`.

### `roadmap_returned`
Real action represented: opening the roadmap when prior local state already exists.
Allowed payload: `route_version`, `completed_steps`, `total_steps`, `has_answers`.

### `route_completed`
Real action represented: all eight roadmap steps marked complete while orientation answers exist.
Allowed payload: `route_version`, `completed_steps`, `total_steps`, `has_answers`.

## Explicitly excluded in P2

- `guide_download`: no V15 public download exists yet.
- `partner_intent`: partner-intent UI is intentionally absent from the canonical draft.
- Any user-entered city, email, name, free-text field, visa narrative, tax data, or document metadata.

## Test expectations

1. `node --check` passes for `draft-events.js` and `parcours-usa-prototype.js`.
2. With no collector, `track()` returns `false` and no exception is thrown.
3. With a stub collector, an allowed event is received with only allowlisted fields.
4. Disallowed event names are rejected.
5. Disallowed payload fields such as `city`, `email`, and `free_text` are removed.
