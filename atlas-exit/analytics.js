(() => {
  const GUIDE_VALUE = 29;

  // The world map is intentionally lightweight, but the USA state layer is zoomed
  // much further than country polygons. Load a denser same-origin state outline
  // before commerce-data.js is evaluated so the existing map engine can keep its
  // interactions while drawing cleaner state/coast boundaries.
  function installDetailedUSGeometry() {
    if (!document.getElementById('worldMap')) return;

    let stateRings;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'us-geometry-hires.json?v=1', false);
      xhr.send(null);
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
        stateRings = JSON.parse(xhr.responseText);
      }
    } catch (_) {
      return;
    }
    if (!stateRings || typeof stateRings !== 'object') return;

    const apply = (commerce) => {
      if (!commerce || !Array.isArray(commerce.states)) return commerce;
      for (const state of commerce.states) {
        const detailed = stateRings[state.code];
        if (Array.isArray(detailed) && detailed.length) state.rings = detailed;
      }
      return commerce;
    };

    if (window.ATLAS_COMMERCE) {
      apply(window.ATLAS_COMMERCE);
      return;
    }

    let commerceValue;
    Object.defineProperty(window, 'ATLAS_COMMERCE', {
      configurable: true,
      enumerable: true,
      get() { return commerceValue; },
      set(value) { commerceValue = apply(value); }
    });
  }

  installDetailedUSGeometry();

  function track(name, data = {}) {
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(name, data);
    }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.href || '';

    if (href.includes('checkout.revolut.com')) {
      track('begin_checkout', {
        product: 'guide-usa-1-2',
        value: GUIDE_VALUE,
        currency: 'EUR'
      });
      track('revolut_checkout_click', {
        product: 'guide-usa-1-2',
        value: GUIDE_VALUE,
        currency: 'EUR'
      });
    } else if (href.includes('extrait-guide-usa')) {
      track('sample_guide_click', { product: 'guide-usa-1-2' });
    } else if (href.includes('start.html') || href.includes('accompagnement.html')) {
      track('lead_start', { link_url: href });
    } else if (href.startsWith('mailto:') || href.includes('mail.google.com')) {
      track('contact_channel_open', {
        channel: href.startsWith('mailto:') ? 'mailto' : 'gmail'
      });
    }
  }, { capture: true });

  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'intakeForm') {
      track('generate_lead', { source: 'atlas_intake_form' });
      track('lead_message_prepared', { form: 'intakeForm' });
    }
  }, { capture: true });

  document.addEventListener('DOMContentLoaded', () => {
    if (location.pathname.endsWith('/offres.html') || location.pathname.endsWith('offres.html')) {
      track('guide_view', {
        product: 'guide-usa-1-2',
        value: GUIDE_VALUE,
        currency: 'EUR'
      });
    }
  });

  window.AtlasAnalytics = { track };
})();
