(() => {
  // Google Analytics 4 is intentionally on standby.
  // Keep this local stub so existing page references remain harmless until a future reactivation.
  try { localStorage.removeItem('atlas_analytics_consent'); } catch (_) {}
  window.AtlasAnalytics = {
    track() {},
    setConsent() {}
  };
})();
