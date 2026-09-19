(() => {
  'use strict';

  const ALLOWED_EVENTS = new Set([
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

  function track(name, payload = {}) {
    if (!ALLOWED_EVENTS.has(name)) return false;
    const collector = window.ATLAS_EVENT_COLLECTOR;
    if (typeof collector !== 'function') return false;

    try {
      collector(name, sanitizePayload(payload));
      return true;
    } catch (_) {
      return false;
    }
  }

  window.AtlasDraftEvents = Object.freeze({ track });
})();
