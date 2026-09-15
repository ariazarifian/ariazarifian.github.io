(() => {
  const MEASUREMENT_ID = 'G-32KPT7CPMZ';
  const CONSENT_KEY = 'atlas_analytics_consent';
  const GUIDE_VALUE = 29;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ window.dataLayer.push(arguments); };

  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  let loaded = false;
  function loadGoogleTag() {
    if (loaded) return;
    loaded = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function setConsent(value) {
    localStorage.setItem(CONSENT_KEY, value);
    const granted = value === 'granted';
    gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (granted) loadGoogleTag();
    const banner = document.getElementById('atlas-analytics-consent');
    if (banner) banner.remove();
  }

  function showConsent() {
    if (document.getElementById('atlas-analytics-consent')) return;
    const wrap = document.createElement('div');
    wrap.id = 'atlas-analytics-consent';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Choix de mesure d’audience');
    wrap.innerHTML = `
      <div class="atlas-consent-card">
        <p><strong>Mesure d’audience</strong><br>Atlas utilise Google Analytics pour comprendre les visites et améliorer le site. La publicité personnalisée est désactivée.</p>
        <div class="atlas-consent-actions">
          <a href="methodologie.html#confidentialite">En savoir plus</a>
          <button type="button" data-atlas-consent="denied">Refuser</button>
          <button type="button" data-atlas-consent="granted" class="primary">Accepter</button>
        </div>
      </div>`;
    const style = document.createElement('style');
    style.textContent = `
      #atlas-analytics-consent{position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;display:flex;justify-content:center;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .atlas-consent-card{max-width:760px;width:100%;background:#11181c;color:#edf1ef;border:1px solid rgba(214,193,155,.35);box-shadow:0 16px 50px rgba(0,0,0,.35);border-radius:14px;padding:16px 18px}
      .atlas-consent-card p{margin:0 0 12px;line-height:1.45;font-size:14px}.atlas-consent-card strong{font-size:15px}
      .atlas-consent-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}.atlas-consent-actions a{color:#d6c19b;margin-right:auto;font-size:13px}
      .atlas-consent-actions button{border:1px solid rgba(255,255,255,.22);background:transparent;color:#fff;border-radius:9px;padding:9px 13px;cursor:pointer}.atlas-consent-actions button.primary{background:#d6c19b;color:#101417;border-color:#d6c19b;font-weight:700}
      @media(max-width:560px){.atlas-consent-actions{justify-content:stretch}.atlas-consent-actions a{width:100%;margin-bottom:2px}.atlas-consent-actions button{flex:1}}
    `;
    document.head.appendChild(style);
    document.body.appendChild(wrap);
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-atlas-consent]');
      if (btn) setConsent(btn.dataset.atlasConsent);
    });
  }

  function track(name, params = {}) {
    if (localStorage.getItem(CONSENT_KEY) !== 'granted') return;
    gtag('event', name, params);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.href || '';
    if (href.includes('checkout.revolut.com')) {
      track('begin_checkout', {
        currency: 'EUR',
        value: GUIDE_VALUE,
        items: [{ item_id: 'guide-usa-1-2', item_name: 'Guide États-Unis', price: GUIDE_VALUE, quantity: 1 }]
      });
      track('revolut_checkout_click', { destination: 'revolut', value: GUIDE_VALUE, currency: 'EUR' });
    } else if (href.includes('extrait-guide-usa')) {
      track('sample_guide_click', { content_type: 'guide', item_id: 'guide-usa-1-2' });
    } else if (href.includes('start.html') || href.includes('accompagnement.html')) {
      track('lead_start', { link_url: href });
    }
  }, { capture: true });

  document.addEventListener('DOMContentLoaded', () => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (consent === 'granted') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadGoogleTag();
    } else if (consent === 'denied') {
      gtag('consent', 'update', { analytics_storage: 'denied' });
    } else {
      showConsent();
    }

    if (location.pathname.endsWith('/offres.html') || location.pathname.endsWith('offres.html')) {
      track('view_item', {
        currency: 'EUR',
        value: GUIDE_VALUE,
        items: [{ item_id: 'guide-usa-1-2', item_name: 'Guide États-Unis', price: GUIDE_VALUE, quantity: 1 }]
      });
    }
  });

  window.AtlasAnalytics = { setConsent, track };
})();
