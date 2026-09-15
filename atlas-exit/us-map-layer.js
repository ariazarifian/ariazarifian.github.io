(() => {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const TOPOLOGY_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json';
  const SIMPLIFY_TOLERANCE = 1.25;
  const FIPS_TO_CODE = {
    '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC','12':'FL','13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME','24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH','34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI','45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY'
  };

  function project(lon, lat) {
    const phi = lat * Math.PI / 180;
    const lam = lon * Math.PI / 180;
    const t = Math.asin(Math.sqrt(3) / 2 * Math.sin(phi));
    const t2 = t * t;
    const t6 = t2 * t2 * t2;
    const x = 2 * Math.sqrt(3) * lam * Math.cos(t) /
      (3 * (1.340264 + 3 * (-0.081106) * t2 + t6 * (7 * 0.000893 + 9 * 0.003796 * t2)));
    const y = t * (1.340264 - 0.081106 * t2 + t6 * (0.000893 + 0.003796 * t2));
    return [800 + 268 * x, 462 - 268 * y];
  }

  function createArcReader(topology) {
    const transform = topology.transform || { scale: [1, 1], translate: [0, 0] };
    const [sx, sy] = transform.scale;
    const [tx, ty] = transform.translate;
    const cache = new Map();

    function forward(index) {
      if (cache.has(index)) return cache.get(index);
      const source = topology.arcs[index] || [];
      let x = 0;
      let y = 0;
      const points = source.map(([dx, dy]) => {
        x += dx;
        y += dy;
        return [x * sx + tx, y * sy + ty];
      });
      cache.set(index, points);
      return points;
    }

    return index => {
      const reversed = index < 0;
      const absolute = reversed ? ~index : index;
      const points = forward(absolute);
      return reversed ? [...points].reverse() : points;
    };
  }

  function stitchRing(arcIndexes, readArc) {
    const ring = [];
    for (const arcIndex of arcIndexes) {
      let points = readArc(arcIndex);
      if (ring.length && points.length) points = points.slice(1);
      ring.push(...points);
    }
    return ring;
  }

  function polygonArcGroups(geometry) {
    if (!geometry) return [];
    if (geometry.type === 'Polygon') return [geometry.arcs];
    if (geometry.type === 'MultiPolygon') return geometry.arcs;
    if (geometry.type === 'GeometryCollection') return (geometry.geometries || []).flatMap(polygonArcGroups);
    return [];
  }

  function hasDatelineJump(ring) {
    for (let i = 1; i < ring.length; i++) {
      if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return true;
    }
    return false;
  }

  function distanceSqToSegment(point, a, b) {
    let x = a[0];
    let y = a[1];
    let dx = b[0] - x;
    let dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) { x = b[0]; y = b[1]; }
      else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = point[0] - x;
    dy = point[1] - y;
    return dx * dx + dy * dy;
  }

  function simplify(points, tolerance = SIMPLIFY_TOLERANCE) {
    if (points.length <= 4) return points;
    const sqTolerance = tolerance * tolerance;
    const keep = new Uint8Array(points.length);
    keep[0] = 1;
    keep[points.length - 1] = 1;
    const stack = [[0, points.length - 1]];
    while (stack.length) {
      const [first, last] = stack.pop();
      let maxSq = sqTolerance;
      let index = -1;
      for (let i = first + 1; i < last; i++) {
        const sq = distanceSqToSegment(points[i], points[first], points[last]);
        if (sq > maxSq) { index = i; maxSq = sq; }
      }
      if (index !== -1) {
        keep[index] = 1;
        if (index - first > 1) stack.push([first, index]);
        if (last - index > 1) stack.push([index, last]);
      }
    }
    return points.filter((_, i) => keep[i]);
  }

  function projectPolygonGroups(groups, readArc) {
    const projected = [];
    for (const polygon of groups) {
      for (const ringArcs of polygon) {
        const geographic = stitchRing(ringArcs, readArc);
        if (geographic.length < 3 || hasDatelineJump(geographic)) continue;
        const ring = geographic.map(([lon, lat]) => project(lon, lat));
        const simplified = simplify(ring);
        if (simplified.length >= 3) projected.push(simplified);
      }
    }
    return projected;
  }

  function svgPath(rings) {
    return rings.map(ring => ring.map((point, i) =>
      `${i ? 'L' : 'M'}${point[0].toFixed(1)},${point[1].toFixed(1)}`
    ).join('') + 'Z').join('');
  }

  function getBounds(rings) {
    const points = rings.flat();
    if (!points.length) return null;
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }

  function ensureClip(svg, usaPath) {
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(NS, 'defs');
      svg.prepend(defs);
    }
    document.querySelector('#usAtlasClip')?.remove();
    const clip = document.createElementNS(NS, 'clipPath');
    clip.setAttribute('id', 'usAtlasClip');
    clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
    const shape = document.createElementNS(NS, 'path');
    shape.setAttribute('d', usaPath);
    shape.setAttribute('fill-rule', 'evenodd');
    clip.append(shape);
    defs.append(clip);
  }

  function ensureBase(countriesLayer, usaPath, firstState) {
    document.querySelector('#usAtlasBase')?.remove();
    const base = document.createElementNS(NS, 'path');
    base.setAttribute('id', 'usAtlasBase');
    base.setAttribute('d', usaPath);
    base.setAttribute('fill', '#7f9990');
    base.setAttribute('stroke', 'none');
    base.setAttribute('pointer-events', 'none');
    base.setAttribute('aria-hidden', 'true');
    base.style.display = document.body.classList.contains('us-mode') ? '' : 'none';
    countriesLayer.insertBefore(base, firstState || null);

    const observer = new MutationObserver(() => {
      base.style.display = document.body.classList.contains('us-mode') ? '' : 'none';
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return base;
  }

  function patchMap(topology) {
    if (!topology?.objects?.states) throw new Error('US state topology missing');

    const svg = document.querySelector('#worldMap');
    const countriesLayer = document.querySelector('#countries');
    const outline = document.querySelector('#usOutline');
    const atlasCountries = window.AtlasExplorer?.getCountries?.() || [];
    const countryById = Object.fromEntries(atlasCountries.map(country => [country.id, country]));
    const usa = countryById.USA;
    if (!svg || !countriesLayer || !outline || !usa?.path) throw new Error('Original Atlas USA geometry unavailable');

    const readArc = createArcReader(topology);
    const candidates = [];

    for (const geometry of topology.objects.states.geometries || []) {
      const stateCode = FIPS_TO_CODE[String(geometry.id).padStart(2, '0')];
      if (!stateCode) continue;
      const atlasId = `US-${stateCode}`;
      const element = countriesLayer.querySelector(`path[data-id="${atlasId}"]`);
      const country = countryById[atlasId];
      if (!element || !country) continue;
      const rings = projectPolygonGroups(polygonArcGroups(geometry), readArc);
      const path = svgPath(rings);
      const bounds = getBounds(rings);
      if (!path || !bounds) continue;
      candidates.push({ atlasId, element, country, path, bounds });
    }

    if (candidates.length < 50) throw new Error(`US state layer incomplete (${candidates.length}/51)`);

    // The silhouette is NEVER replaced. It is the same path used by Atlas on
    // the world view. Detailed state shapes only live inside that silhouette.
    outline.setAttribute('d', usa.path);
    outline.setAttribute('fill-rule', 'evenodd');
    outline.setAttribute('data-geometry', 'atlas-world-outline');
    ensureClip(svg, usa.path);

    const firstState = candidates[0]?.element || null;
    ensureBase(countriesLayer, usa.path, firstState);

    for (const candidate of candidates) {
      candidate.country.path = candidate.path;
      candidate.country.bounds = candidate.bounds;
      candidate.element.setAttribute('d', candidate.path);
      candidate.element.setAttribute('clip-path', 'url(#usAtlasClip)');
      candidate.element.setAttribute('fill-rule', 'evenodd');
      candidate.element.setAttribute('stroke-linejoin', 'round');
      candidate.element.setAttribute('stroke-linecap', 'round');
      candidate.element.setAttribute('data-geometry', 'us-atlas-interior');
    }

    document.documentElement.dataset.usGeometry = 'atlas-outline-us-atlas-interior';
    window.dispatchEvent(new CustomEvent('atlas:us-geometry-ready', {
      detail: { states: candidates.length, outline: 'Atlas world USA', interior: 'us-atlas@3.0.1 simplified' }
    }));
  }

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
      const topologyRequest = fetch(TOPOLOGY_URL, {
        credentials: 'omit',
        mode: 'cors',
        cache: 'force-cache',
        referrerPolicy: 'no-referrer'
      }).then(response => {
        if (!response.ok) throw new Error(`US topology HTTP ${response.status}`);
        return response.json();
      });
      const [topology] = await Promise.all([topologyRequest, waitForAtlas()]);
      patchMap(topology);
    } catch (error) {
      console.warn('Atlas US geometry:', error);
      document.documentElement.dataset.usGeometry = 'fallback';
    }
  }

  install();
})();
