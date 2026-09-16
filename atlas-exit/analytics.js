(() => {
  const GUIDE_VALUE = 29;

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

    // Atlas world-map coverage is deliberately kept in a separate data layer.
    // Load it only on the explorer so content pages stay lightweight.
    if (document.querySelector('#worldMap') && !window.ATLAS_WORLD_EXPANSION) {
      const script = document.createElement('script');
      script.src = 'world-expansion.js?v=1';
      script.async = true;
      script.dataset.atlasWorldExpansion = '1';
      document.head.append(script);
    }
  });

  window.AtlasAnalytics = { track };
})();
