(() => {
  const STORAGE_KEY = 'atlas_usa_roadmap_v1';
  const boxes = Array.from(document.querySelectorAll('[data-step]'));
  const doneCount = document.getElementById('doneCount');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const intentNotice = document.getElementById('intentNotice');

  function track(name, data = {}) {
    if (window.AtlasAnalytics && typeof window.AtlasAnalytics.track === 'function') {
      window.AtlasAnalytics.track(name, data);
    } else if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(name, data);
    }
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function writeState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function render() {
    const state = readState();
    let completed = 0;
    boxes.forEach(box => {
      box.checked = Boolean(state[box.dataset.step]);
      if (box.checked) completed += 1;
    });
    const pct = boxes.length ? Math.round((completed / boxes.length) * 100) : 0;
    doneCount.textContent = String(completed);
    progressBar.style.width = `${pct}%`;
    progressText.textContent = completed === boxes.length
      ? 'Roadmap de base terminée. Les obligations récurrentes restent à suivre.'
      : completed === 0
        ? 'Commencez par votre statut d’entrée.'
        : `${pct} % de la roadmap de base est marquée comme terminée.`;
  }

  boxes.forEach(box => {
    box.addEventListener('change', () => {
      const state = readState();
      state[box.dataset.step] = box.checked;
      writeState(state);
      render();
      track('roadmap_step_change', {
        step: box.dataset.step,
        completed: box.checked
      });
    });
  });

  document.querySelectorAll('[data-intent]').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.intent;
      track('partner_intent', { category, route: 'france_usa' });
      intentNotice.textContent = 'Besoin enregistré comme signal de test dans ce prototype. Aucun contact ni achat n’est déclenché.';
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    render();
    track('roadmap_view', { route: 'france_usa', prototype: true });
  });
})();
