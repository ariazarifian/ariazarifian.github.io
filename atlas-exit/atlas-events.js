(() => {
  'use strict';

  const ALLOWED_EVENTS = new Set([
    'guide_download_click',
    'free_funnel_cta',
    'route_started',
    'roadmap_saved',
    'roadmap_returned',
    'route_completed'
  ]);

  const ALLOWED_FIELDS = new Set([
    'surface',
    'target',
    'route_version',
    'completed_steps',
    'total_steps',
    'has_answers'
  ]);

  const QUALIFIED_PROJECT_EVENT = 'qualified_project';
  const QEP_ROUTE_STORAGE_KEY = 'atlas_usa_route_v3';
  const QEP_DEDUPE_KEY = 'atlas_usa_qep_v1';
  const QEP_ROUTE_VERSION = 'usa-v3';
  const QEP_HORIZONS = new Set(['0-3', '3-6', '6-12', '12+']);
  const QEP_ACTION = 'route_saved';

  function sanitizeQualifiedProjectPayload(payload) {
    if (!payload || typeof payload !== 'object') return null;
    if (payload.origin !== 'FR') return null;
    if (payload.destination !== 'US') return null;
    if (!QEP_HORIZONS.has(payload.horizon_bucket)) return null;
    if (payload.route_version !== QEP_ROUTE_VERSION) return null;
    if (payload.meaningful_action !== QEP_ACTION) return null;

    return {
      origin: 'FR',
      destination: 'US',
      horizon_bucket: payload.horizon_bucket,
      route_version: QEP_ROUTE_VERSION,
      meaningful_action: QEP_ACTION
    };
  }

  function sanitizePayload(payload) {
    const clean = {};
    if (!payload || typeof payload !== 'object') return clean;

    for (const [key, value] of Object.entries(payload)) {
      if (!ALLOWED_FIELDS.has(key)) continue;
      if (typeof value === 'string') clean[key] = value.slice(0, 40);
      else if (typeof value === 'number' && Number.isFinite(value)) clean[key] = value;
      else if (typeof value === 'boolean') clean[key] = value;
    }
    return clean;
  }

  function collector() {
    if (typeof window.ATLAS_EVENT_COLLECTOR === 'function') return window.ATLAS_EVENT_COLLECTOR;
    if (window.umami && typeof window.umami.track === 'function') {
      return (name, payload) => window.umami.track(name, payload);
    }
    return null;
  }

  function readPersistedRoute() {
    try {
      const raw = localStorage.getItem(QEP_ROUTE_STORAGE_KEY);
      if (!raw) return null;
      const state = JSON.parse(raw);
      if (!state || !state.answers || typeof state.answers !== 'object') return null;
      return state;
    } catch (_) {
      return null;
    }
  }

  function readQepMarker() {
    try {
      const raw = localStorage.getItem(QEP_DEDUPE_KEY);
      if (!raw) return null;
      const marker = JSON.parse(raw);
      if (!marker || marker.route_version !== QEP_ROUTE_VERSION) return null;
      if (!['reserved', 'retry', 'sent'].includes(marker.status)) return null;
      return marker;
    } catch (_) {
      return null;
    }
  }

  function writeQepMarker(status) {
    try {
      localStorage.setItem(QEP_DEDUPE_KEY, JSON.stringify({
        route_version: QEP_ROUTE_VERSION,
        status
      }));
      return true;
    } catch (_) {
      return false;
    }
  }

  function emitQualifiedProjectAfterSavedRoute(send) {
    const state = readPersistedRoute();
    if (!state) return false;

    const marker = readQepMarker();
    if (marker && (marker.status === 'sent' || marker.status === 'reserved')) return false;

    const horizonBucket = state.answers.horizon;
    if (!QEP_HORIZONS.has(horizonBucket)) return false;

    const clean = sanitizeQualifiedProjectPayload({
      origin: 'FR',
      destination: 'US',
      horizon_bucket: horizonBucket,
      route_version: QEP_ROUTE_VERSION,
      meaningful_action: QEP_ACTION
    });
    if (!clean) return false;

    // Reserve before delivery so an ordinary route/progress write cannot create
    // duplicate QEP sends. If storage cannot reserve, do not send.
    if (!writeQepMarker('reserved')) return false;

    try {
      const outcome = send(QUALIFIED_PROJECT_EVENT, clean);
      if (outcome === false) {
        writeQepMarker('retry');
        return false;
      }
    } catch (_) {
      // A thrown collector leaves delivery outcome ambiguous. Keep the
      // reservation and do not auto-retry, which is safer than double-counting.
      return false;
    }

    // If this final write fails, `reserved` remains and prevents a duplicate.
    writeQepMarker('sent');
    return true;
  }

  function track(name, payload = {}) {
    if (!ALLOWED_EVENTS.has(name)) return false;
    const send = collector();
    if (!send) return false;

    try {
      const outcome = send(name, sanitizePayload(payload));
      if (outcome === false) return false;
    } catch (_) {
      return false;
    }

    // `parcours-usa.js` emits these lifecycle events only after route storage
    // succeeds. QEP therefore inherits the persistence gate while its separate
    // dedupe key cannot be overwritten by later route-state writes.
    if (name === 'route_started' || name === 'roadmap_saved') {
      emitQualifiedProjectAfterSavedRoute(send);
    }
    return true;
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-atlas-event]');
    if (!target) return;
    track(target.dataset.atlasEvent, {
      surface: target.dataset.atlasSurface || 'unknown',
      target: target.dataset.atlasTarget || 'unknown',
      route_version: target.dataset.atlasRouteVersion || QEP_ROUTE_VERSION
    });
  }, { capture: true });

  window.AtlasEvents = Object.freeze({ track });
})();
