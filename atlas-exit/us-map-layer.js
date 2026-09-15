(() => {
  'use strict';

  const TOPOLOGY_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/states-10m.json';
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

    return function readArc(index) {
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
    if (geometry.type === 'GeometryCollection') {
      return (geometry.geometries || []).flatMap(polygonArcGroups);
    }
    return [];
  }

  function hasDatelineJump(ring) {
    for (let i = 1; i < ring.length; i++) {
      if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return true;
    }
    return false;
  }

  function projectPolygonGroups(groups, readArc) {
    const projected = [];
    for (const polygon of groups) {
      for (const ringArcs of polygon) {
        const geographic = stitchRing(ringArcs, readArc);
        if (geographic.length < 3 || hasDatelineJump(geographic)) continue;
        projected.push(geographic.map(([lon, lat]) => project(lon, lat)));
      }
    }
    return projected;
  }

  function svgPath(rings) {
    return rings.map(ring => ring.map((point, i) =>
      `${i ? 'L' : 'M'}${point[0].toFixed(2)},${point[1].toFixed(2)}`
    ).join('') + 'Z').join('');
  }

  function getBounds(rings) {
    const points = rings.flat();
    if (!points.length) return null;
    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }

  function keepNationPolygon(polygon, readArc) {
    if (!polygon || !polygon.length) return false;
    const outer = stitchRing(polygon[0], readArc);
    if (!outer.length || hasDatelineJump(outer)) return false;
    let lon = 0;
    let lat = 0;
    for (const point of outer) {
      lon += point[0];
      lat += point[1];
    }
    lon /= outer.length;
    lat /= outer.length;

    const mainland = lat >= 24 && lat <= 50 && lon >= -130 && lon <= -60;
    const alaska = lat >= 50 && (lon <= -130 || lon >= 160);
    const hawaii = lat >= 18 && lat <= 23 && lon >= -162 && lon <= -154;
    return mainland || alaska || hawaii;
  }

  function patchMap(topology) {
    if (!topology?.objects?.states || !topology?.objects?.nation) {
      throw new Error('US topology objects missing');
    }

    const readArc = createArcReader(topology);
    const atlasCountries = window.AtlasExplorer?.getCountries?.() || [];
    const countryById = Object.fromEntries(atlasCountries.map(country => [country.id, country]));
    const candidates = [];

    for (const geometry of topology.objects.states.geometries || []) {
      const stateCode = FIPS_TO_CODE[String(geometry.id).padStart(2, '0')];
      if (!stateCode) continue;
      const atlasId = `US-${stateCode}`;
      const rings = projectPolygonGroups(polygonArcGroups(geometry), readArc);
      const path = svgPath(rings);
      const bounds = getBounds(rings);
      const element = document.querySelector(`#countries path[data-id="${atlasId}"]`);
      if (!path || !bounds || !element || !countryById[atlasId]) continue;
      candidates.push({ atlasId, path, bounds, element, country: countryById[atlasId] });
    }

    // Do not partially replace the map. If the coherent layer is incomplete,
    // Atlas keeps the existing built-in state geometry instead.
    if (candidates.length < 50) {
      throw new Error(`US detailed layer incomplete (${candidates.length}/51)`);
    }

    const nationGroups = polygonArcGroups(topology.objects.nation)
      .filter(polygon => keepNationPolygon(polygon, readArc));
    const nationRings = projectPolygonGroups(nationGroups, readArc);
    const nationPath = svgPath(nationRings);
    const outline = document.querySelector('#usOutline');
    if (!nationPath || !outline) throw new Error('US detailed nation outline unavailable');

    for (const candidate of candidates) {
      candidate.country.path = candidate.path;
      candidate.country.bounds = candidate.bounds;
      candidate.element.setAttribute('d', candidate.path);
      candidate.element.setAttribute('fill-rule', 'evenodd');
      candidate.element.setAttribute('data-geometry', 'us-atlas-10m');
    }

    outline.setAttribute('d', nationPath);
    outline.setAttribute('fill-rule', 'evenodd');
    outline.setAttribute('data-geometry', 'us-atlas-10m');

    if (window.ATLAS_COMMERCE?.sources?.geometryUS) {
      window.ATLAS_COMMERCE.sources.geometryUS = {
        name: 'U.S. Census Bureau · cartographic state boundaries via us-atlas',
        url: 'https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html'
      };
    }

    document.documentElement.dataset.usGeometry = 'us-atlas-10m';
    window.dispatchEvent(new CustomEvent('atlas:us-geometry-ready', {
      detail: { states: candidates.length, source: 'us-atlas@3.0.1' }
    }));
  }

  function waitForAtlas(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const started = performance.now();
      const tick = () => {
        if (window.AtlasExplorer?.ready?.() && document.querySelector('#countries path[data-id="US-CA"]')) {
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
      // Fail closed to the existing geometry: the world explorer remains usable.
      console.warn('Atlas US detailed geometry:', error);
      document.documentElement.dataset.usGeometry = 'fallback';
    }
  }

  install();
})();
