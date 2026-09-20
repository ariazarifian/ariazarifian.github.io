(() => {
  'use strict';

  const STORAGE_KEY = 'atlas_usa_route_v3';
  const QEP_DEDUPE_KEY = 'atlas_usa_qep_v1';
  const ROUTE_VERSION = 'usa-v3';
  const form = document.getElementById('routeForm');
  const profile = document.getElementById('profile');
  const horizon = document.getElementById('horizon');
  const city = document.getElementById('city');
  const priority = document.getElementById('priority');
  const resetButton = document.getElementById('resetRoute');
  const routeSummary = document.getElementById('routeSummary');
  const routeHeadline = document.getElementById('routeHeadline');
  const routeMeta = document.getElementById('routeMeta');
  const routeFirstAction = document.getElementById('routeFirstAction');
  const routeContext = document.getElementById('routeContext');
  const boxes = Array.from(document.querySelectorAll('[data-step]'));
  const cards = Array.from(document.querySelectorAll('[data-card-step]'));
  const doneCount = document.getElementById('doneCount');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const progressCard = document.querySelector('.progress-card');
  const resumeRow = progressCard ? document.createElement('div') : null;
  const resumeButton = progressCard ? document.createElement('button') : null;

  if (resumeRow && resumeButton) {
    resumeRow.className = 'action-row';
    resumeRow.hidden = true;
    resumeButton.type = 'button';
    resumeButton.className = 'secondary-action';
    resumeButton.id = 'resumeRoute';
    resumeRow.appendChild(resumeButton);
    progressCard.appendChild(resumeRow);
  }

  const profileCopy = {
    job: {
      label: 'emploi',
      first: 'Vérifier en premier la base d’immigration et le droit au travail liés au poste visé ; l’offre d’emploi et le statut doivent être compatibles avant d’organiser le reste.',
      focus: ['immigration', 'documents', 'entry', 'identity']
    },
    business: {
      label: 'activité / entreprise',
      first: 'Séparer immédiatement deux sujets : créer ou exploiter une société et avoir le droit personnel de travailler aux États-Unis. L’un ne crée pas automatiquement l’autre.',
      focus: ['immigration', 'documents', 'identity', 'compliance']
    },
    study: {
      label: 'études / échange',
      first: 'Partir du programme et du statut d’études admissible, puis construire le calendrier documentaire et financier autour de cette contrainte.',
      focus: ['immigration', 'documents', 'landing', 'entry']
    },
    family: {
      label: 'famille / installation durable',
      first: 'Identifier la base familiale exacte et les preuves associées avant de bâtir le calendrier de départ et les engagements irréversibles.',
      focus: ['immigration', 'documents', 'france', 'entry']
    }
  };

  const horizonCopy = {
    '0-3': 'Horizon court : les dépendances bloquantes et le logement temporaire passent avant les optimisations secondaires.',
    '3-6': 'Horizon intermédiaire : le dossier, le budget d’arrivée et les décisions France→USA peuvent être séquencés proprement.',
    '6-12': 'Horizon confortable : privilégiez les preuves, le calendrier et les décisions réversibles avant les engagements coûteux.',
    '12+': 'Horizon long : utilisez le temps pour renforcer l’éligibilité, les preuves et le budget plutôt que pour figer trop tôt les choix locaux.'
  };

  const priorityFocus = {
    immigration: ['immigration', 'documents', 'entry'],
    housing: ['landing', 'settle'],
    budget: ['france', 'landing'],
    tax: ['france', 'compliance'],
    business: ['immigration', 'identity', 'compliance']
  };

  function blankState() {
    return { answers: null, steps: {}, events: {} };
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return blankState();
      const parsed = JSON.parse(raw);
      return {
        answers: parsed && parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : null,
        steps: parsed && parsed.steps && typeof parsed.steps === 'object' ? parsed.steps : {},
        events: parsed && parsed.events && typeof parsed.events === 'object' ? parsed.events : {}
      };
    } catch (_) {
      return blankState();
    }
  }

  function writeState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (_) {
      return false;
    }
  }

  function track(name, payload = {}) {
    const tracker = window.AtlasEvents && window.AtlasEvents.track;
    return typeof tracker === 'function' ? tracker(name, payload) : false;
  }

  function emitOnce(state, flag, name, payload) {
    if (state.events[flag]) return false;
    const emitted = track(name, payload);
    if (!emitted) return false;
    state.events[flag] = true;
    writeState(state);
    return true;
  }

  function countCompleted(state) {
    return boxes.reduce((count, box) => count + (state.steps[box.dataset.step] ? 1 : 0), 0);
  }

  function nextIncompleteCard(state) {
    const nextBox = boxes.find(box => !state.steps[box.dataset.step]);
    const stepName = nextBox ? nextBox.dataset.step : boxes[0]?.dataset.step;
    return cards.find(card => card.dataset.cardStep === stepName) || cards[0] || null;
  }

  function updateResumeAction(state) {
    if (!resumeRow || !resumeButton || !state.answers) {
      if (resumeRow) resumeRow.hidden = true;
      return;
    }

    const completed = countCompleted(state);
    const nextIndex = boxes.findIndex(box => !state.steps[box.dataset.step]);
    resumeButton.textContent = completed === boxes.length
      ? 'Revoir ma roadmap →'
      : `Reprendre à l’étape ${Math.max(nextIndex, 0) + 1} →`;
    resumeRow.hidden = false;
  }

  function eventProgressPayload(state) {
    return {
      route_version: ROUTE_VERSION,
      completed_steps: countCompleted(state),
      total_steps: boxes.length,
      has_answers: Boolean(state.answers)
    };
  }

  function escapeLabel(value) {
    return String(value || '').trim().slice(0, 80);
  }

  function getAnswers() {
    return {
      profile: profile.value,
      horizon: horizon.value,
      city: escapeLabel(city.value),
      priority: priority.value
    };
  }

  function restoreAnswers(answers) {
    if (!answers) return;
    if (profileCopy[answers.profile]) profile.value = answers.profile;
    if (horizonCopy[answers.horizon]) horizon.value = answers.horizon;
    if (answers.priority && priorityFocus[answers.priority]) priority.value = answers.priority;
    city.value = escapeLabel(answers.city);
  }

  function renderProgress(state) {
    let completed = 0;
    boxes.forEach(box => {
      box.checked = Boolean(state.steps[box.dataset.step]);
      if (box.checked) completed += 1;
    });
    const pct = boxes.length ? Math.round((completed / boxes.length) * 100) : 0;
    doneCount.textContent = String(completed);
    progressBar.style.width = `${pct}%`;
    progressText.textContent = !state.answers
      ? 'Définissez d’abord votre projet.'
      : completed === boxes.length
        ? 'Roadmap de base terminée. Les obligations récurrentes restent à suivre.'
        : completed === 0
          ? 'Votre route est prête. Commencez par les étapes mises en avant.'
          : `${pct} % de la roadmap de base est marquée comme terminée.`;
    updateResumeAction(state);
  }

  function renderFocus(answers) {
    cards.forEach(card => card.classList.remove('is-focus'));
    if (!answers || !profileCopy[answers.profile]) return;

    const focused = new Set([
      ...profileCopy[answers.profile].focus,
      ...(priorityFocus[answers.priority] || [])
    ]);

    cards.forEach(card => {
      if (focused.has(card.dataset.cardStep)) card.classList.add('is-focus');
    });
  }

  function renderSummary(answers) {
    if (!answers || !profileCopy[answers.profile]) {
      routeSummary.hidden = true;
      renderFocus(null);
      return;
    }

    const profileInfo = profileCopy[answers.profile];
    const destination = answers.city || 'destination à préciser';
    const horizonLabel = horizon.options[horizon.selectedIndex]?.textContent || answers.horizon;
    const priorityLabel = priority.options[priority.selectedIndex]?.textContent || answers.priority;

    routeHeadline.textContent = `Route ${profileInfo.label} → ${destination}`;
    routeMeta.textContent = `${horizonLabel} · priorité : ${priorityLabel}`;
    routeFirstAction.textContent = profileInfo.first;
    routeContext.textContent = horizonCopy[answers.horizon] || '';
    routeSummary.hidden = false;
    renderFocus(answers);
  }

  function renderAll() {
    const state = readState();
    restoreAnswers(state.answers);
    renderSummary(state.answers);
    renderProgress(state);
    return state;
  }

  function handleActivationOnLoad(state) {
    const completed = countCompleted(state);
    if (state.answers || completed > 0) {
      track('roadmap_returned', eventProgressPayload(state));
    }
    if (state.answers && completed === boxes.length && boxes.length > 0) {
      emitOnce(state, 'routeCompleted', 'route_completed', eventProgressPayload(state));
    }
  }

  if (resumeButton) {
    resumeButton.addEventListener('click', () => {
      const target = nextIncompleteCard(readState());
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const checkbox = target.querySelector('[data-step]');
      if (checkbox) checkbox.focus({ preventScroll: true });
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const state = readState();
    const hadAnswers = Boolean(state.answers);
    state.answers = getAnswers();
    const saved = writeState(state);

    if (saved) {
      if (!hadAnswers) {
        emitOnce(state, 'routeStarted', 'route_started', {
          route_version: ROUTE_VERSION,
          total_steps: boxes.length
        });
      }
      emitOnce(state, 'roadmapSaved', 'roadmap_saved', eventProgressPayload(state));
    }

    renderSummary(state.answers);
    renderProgress(state);
    routeSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  boxes.forEach(box => {
    box.addEventListener('change', () => {
      const state = readState();
      state.steps[box.dataset.step] = box.checked;
      const saved = writeState(state);
      renderProgress(state);

      if (saved) {
        emitOnce(state, 'roadmapSaved', 'roadmap_saved', eventProgressPayload(state));
        if (state.answers && countCompleted(state) === boxes.length && boxes.length > 0) {
          emitOnce(state, 'routeCompleted', 'route_completed', eventProgressPayload(state));
        }
      }
    });
  });

  resetButton.addEventListener('click', () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(QEP_DEDUPE_KEY);
    } catch (_) {}
    form.reset();
    routeSummary.hidden = true;
    cards.forEach(card => card.classList.remove('is-focus'));
    boxes.forEach(box => { box.checked = false; });
    renderProgress(blankState());
  });

  document.addEventListener('DOMContentLoaded', () => {
    const state = renderAll();
    handleActivationOnLoad(state);
  });
})();
