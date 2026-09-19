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

  function track(name, payload = {}) {
    if (!ALLOWED_EVENTS.has(name)) return false;
    const send = collector();
    if (!send) return false;

    try {
      send(name, sanitizePayload(payload));
      return true;
    } catch (_) {
      return false;
    }
  }

  document.addEventListener('click', event => {
    const target = event.target.closest('[data-atlas-event]');
    if (!target) return;
    track(target.dataset.atlasEvent, {
      surface: target.dataset.atlasSurface || 'unknown',
      target: target.dataset.atlasTarget || 'unknown',
      route_version: target.dataset.atlasRouteVersion || 'usa-v3'
    });
  }, { capture: true });

  window.AtlasEvents = Object.freeze({ track });
})();
