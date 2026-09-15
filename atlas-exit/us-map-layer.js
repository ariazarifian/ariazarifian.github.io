(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';

  function waitForAtlas(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const started = performance.now();
      const tick = () => {
        if (window.AtlasExplorer?.ready?.() && document.querySelector('#countries path[data-id="USA"]')) {
          resolve();
          return;
        }
        if (performance.now() - started > timeoutMs) {
          reject(new Error('Atlas map did not become ready'));
          return;
        }
        setTimeout(tick, 40);
      };
      tick();
    });
  }

  async function install() {
    try {
      await waitForAtlas();

      const svg = document.querySelector('#worldMap');
      const countriesLayer = document.querySelector('#countries');
      const outline = document.querySelector('#usOutline');
      const atlasCountries = window.AtlasExplorer?.getCountries?.() || [];
      const usa = atlasCountries.find(country => country.id === 'USA');

      if (!svg || !countriesLayer || !outline || !usa?.path) {
        throw new Error('Original Atlas USA geometry unavailable');
      }

      // The world map already has the visual silhouette Aria wants. Keep that
      // exact geometry as the federal outline and only reveal state divisions
      // inside it. This avoids introducing a second, more detailed coastline.
      outline.setAttribute('d', usa.path);
      outline.setAttribute('fill-rule', 'evenodd');
      outline.setAttribute('data-geometry', 'atlas-world-outline');

      let defs = svg.querySelector('defs');
      if (!defs) {
        defs = document.createElementNS(NS, 'defs');
        svg.prepend(defs);
      }

      document.querySelector('#usAtlasClip')?.remove();
      const clip = document.createElementNS(NS, 'clipPath');
      clip.setAttribute('id', 'usAtlasClip');
      clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
      const clipShape = document.createElementNS(NS, 'path');
      clipShape.setAttribute('d', usa.path);
      clipShape.setAttribute('fill-rule', 'evenodd');
      clip.append(clipShape);
      defs.append(clip);

      const statePaths = [...countriesLayer.querySelectorAll('path.us-state')];
      for (const statePath of statePaths) {
        // Keep Atlas' existing state geometry/data/interaction, but prevent any
        // state coastline from drawing outside the original USA silhouette.
        statePath.setAttribute('clip-path', 'url(#usAtlasClip)');
        statePath.setAttribute('data-geometry', 'atlas-state-clipped');
      }

      document.documentElement.dataset.usGeometry = 'atlas-original-outline';
      window.dispatchEvent(new CustomEvent('atlas:us-geometry-ready', {
        detail: {
          states: statePaths.length,
          source: 'existing Atlas state layer',
          outline: 'existing Atlas world USA geometry'
        }
      }));
    } catch (error) {
      console.warn('Atlas US geometry:', error);
      document.documentElement.dataset.usGeometry = 'fallback';
    }
  }

  install();
})();
