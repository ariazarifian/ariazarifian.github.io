#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const out = {
    root: '.',
    contract: 'atlas-ops/qa/d1r15-guide-distribution-contract.json',
    report: ''
  };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--root') out.root = value, i += 1;
    else if (key === '--contract') out.contract = value, i += 1;
    else if (key === '--report') out.report = value, i += 1;
    else if (key === '--help') {
      console.log('Usage: node atlas-ops/qa/d1r15-guide-distribution-qa.mjs [--root .] [--contract path] [--report path]');
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${key}`);
    }
  }
  return out;
}

const args = parseArgs(process.argv);
const root = path.resolve(args.root);
const contractPath = path.resolve(root, args.contract);
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

const docs = {};
for (const [key, rel] of Object.entries(contract.files)) {
  const full = path.resolve(root, rel);
  if (!fs.existsSync(full)) throw new Error(`Missing required file: ${rel}`);
  docs[key] = fs.readFileSync(full, 'utf8');
}

const checks = [];
function check(id, ok, detail) {
  checks.push({ id, ok: Boolean(ok), detail });
}
function tags(html, name) {
  const re = new RegExp(`<${name}\\b[^>]*>`, 'gi');
  return [...html.matchAll(re)].map(m => m[0]);
}
function attr(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i');
  return (tag.match(re) || [])[1] ?? null;
}
function anchors(html) {
  return tags(html, 'a').map(tag => ({
    tag,
    href: attr(tag, 'href'),
    event: attr(tag, 'data-atlas-event'),
    target: attr(tag, 'data-atlas-target')
  }));
}
function canonicals(html) {
  return tags(html, 'link')
    .filter(tag => /\\brel\\s*=\\s*["']canonical["']/i.test(tag))
    .map(tag => attr(tag, 'href'))
    .filter(Boolean);
}
function scriptTags(html) {
  return tags(html, 'script').map(tag => ({
    tag,
    src: attr(tag, 'src'),
    websiteId: attr(tag, 'data-website-id'),
    domains: attr(tag, 'data-domains')
  }));
}
function normalizeLocalPath(href) {
  if (!href) return null;
  try {
    const u = new URL(href, `${contract.origin}/`);
    if (u.origin !== contract.origin) return null;
    return u.pathname.replace(/^\\//, '');
  } catch {
    return null;
  }
}
function lower(s) {
  return String(s ?? '').toLocaleLowerCase('fr-FR');
}

const guide = docs.guide;
const guideLower = lower(guide);
const guideAnchors = anchors(guide);
const scripts = scriptTags(guide);

// 1) Canonical / indexability continuity.
const canonical = canonicals(guide);
check('canonical:exactly-one-self', canonical.length === 1 && canonical[0] === contract.guide.canonical,
  `expected exactly ${contract.guide.canonical}; got ${JSON.stringify(canonical)}`);
check('indexability:no-noindex', !/\\bnoindex\\b/i.test(guide), 'Guide must not introduce a noindex directive');

// 2) Robots + sitemap continuity.
check('robots:allow-root', /(^|\\n)Allow:\\s*\\/\\s*(\\n|$)/i.test(docs.robots), 'robots.txt must allow /');
check('robots:sitemap', docs.robots.includes(`Sitemap: ${contract.robots.sitemap}`), `robots.txt must expose ${contract.robots.sitemap}`);
const locs = [...docs.sitemap.matchAll(/<loc>\\s*([^<]+?)\\s*<\\/loc>/gi)].map(m => m[1]);
check('sitemap:guide-present-once', locs.filter(u => u === contract.guide.canonical).length === 1, 'Guide canonical URL must occur exactly once in sitemap');
check('sitemap:guide-queryless', locs.filter(u => u.startsWith(contract.guide.canonical)).every(u => !u.includes('?')), 'Guide sitemap URL must be queryless');

// 3) Free France→USA acquisition promise + tracked handoffs.
const guideDownloadAnchors = guideAnchors.filter(a => a.href === contract.guide.download_endpoint);
check('guide-download:surface-count', guideDownloadAnchors.length >= 2, `expected >=2 direct free-guide anchors; got ${guideDownloadAnchors.length}`);
check('guide-download:tracking', guideDownloadAnchors.length >= 2 && guideDownloadAnchors.every(a => a.event === contract.guide.guide_event && a.target === contract.guide.guide_target),
  `all direct Guide anchors must retain ${contract.guide.guide_event}/${contract.guide.guide_target}`);
const roadmapTracked = guideAnchors.filter(a => normalizeLocalPath(a.href) === contract.guide.roadmap_path && a.event === contract.guide.roadmap_event && a.target === contract.guide.roadmap_target);
check('roadmap:direct-tracked-handoff', roadmapTracked.length >= 1, `expected tracked Roadmap handoff ${contract.guide.roadmap_event}/${contract.guide.roadmap_target}`);
check('free-promise:no-account', /sans compte/i.test(guide), 'Guide must preserve a truthful no-account free-use promise');
check('free-promise:no-payment', /sans paiement/i.test(guide), 'Guide must preserve a truthful no-payment free-use promise');

// 4) Measurement continuity.
const umami = scripts.filter(s => s.src === contract.guide.umami_script);
check('measurement:umami-script-once', umami.length === 1, `expected exactly one ${contract.guide.umami_script} script; got ${umami.length}`);
check('measurement:website-id', umami.length === 1 && umami[0].websiteId === contract.guide.umami_website_id, `expected Umami website id ${contract.guide.umami_website_id}`);
const expectedDomains = new Set(contract.guide.umami_domains);
const gotDomains = new Set((umami[0]?.domains ?? '').split(',').map(s => s.trim()).filter(Boolean));
check('measurement:data-domains', expectedDomains.size === gotDomains.size && [...expectedDomains].every(v => gotDomains.has(v)), `expected domains ${JSON.stringify([...expectedDomains])}; got ${JSON.stringify([...gotDomains])}`);
check('measurement:atlas-events-v1', scripts.some(s => s.src === contract.guide.events_script), `Guide must load ${contract.guide.events_script}`);
const cspTag = tags(guide, 'meta').find(tag => lower(attr(tag, 'http-equiv')) === 'content-security-policy');
const csp = attr(cspTag ?? '', 'content') ?? '';
check('measurement:csp-cloud', csp.includes('https://cloud.umami.is'), 'CSP must allow cloud.umami.is');
check('measurement:csp-gateway', csp.includes('https://gateway.umami.is'), 'CSP must allow gateway.umami.is');

// 5) Funnel/navigation continuity.
for (const required of contract.guide.required_nav_paths) {
  const ok = guideAnchors.some(a => normalizeLocalPath(a.href) === required);
  check(`navigation:${required}`, ok, `Guide must expose navigation to ${required}`);
}
for (const term of contract.guide.required_disclosure_terms) {
  check(`disclosure:${term}`, guideLower.includes(lower(term)), `Guide must retain disclosure concept: ${term}`);
}

// 6) Legacy checkout resurrection guard.
for (const scriptName of contract.forbidden_loaded_scripts) {
  const loaded = scripts.some(s => s.src && normalizeLocalPath(s.src)?.endsWith(scriptName));
  check(`legacy-script:not-loaded:${scriptName}`, !loaded, `${scriptName} must remain unreferenced by offres.html`);
}
for (const marker of contract.forbidden_guide_markers) {
  check(`legacy-marker:absent:${marker}`, !guideLower.includes(lower(marker)), `Guide HTML must not contain legacy paid-flow marker ${marker}`);
}

const failures = checks.filter(c => !c.ok);
const report = {
  contract_version: contract.version,
  baseline_sha: contract.baseline_sha,
  generated_at: new Date().toISOString(),
  root,
  status: failures.length ? 'FAIL' : 'PASS',
  totals: { checks: checks.length, pass: checks.length - failures.length, fail: failures.length },
  failures,
  checks
};
const reportText = JSON.stringify(report, null, 2) + '\n';
if (args.report) fs.writeFileSync(path.resolve(root, args.report), reportText, 'utf8');
console.log(`${report.status} ${report.totals.pass}/${report.totals.checks} checks passed; ${report.totals.fail} failed`);
for (const f of failures) console.error(`FAIL ${f.id}: ${f.detail}`);
process.exit(failures.length ? 1 : 0);
