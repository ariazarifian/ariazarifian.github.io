#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const out = { root: '.', profile: 'current-production', contract: 'atlas-ops/qa/d1r9-crawl-index-contract.json', report: '' };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--root') out.root = value, i += 1;
    else if (key === '--profile') out.profile = value, i += 1;
    else if (key === '--contract') out.contract = value, i += 1;
    else if (key === '--report') out.report = value, i += 1;
    else if (key === '--help') {
      console.log('Usage: node atlas-ops/qa/d1r9-crawl-index-qa.mjs [--root .] [--profile current-production|accepted-static-train] [--contract path] [--report path]');
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
const profile = contract.profiles[args.profile];
if (!profile) throw new Error(`Unknown profile: ${args.profile}`);

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
function hrefs(html) {
  return [...html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
}
function localPathFromHref(href) {
  try {
    const u = new URL(href, `${contract.origin}/`);
    if (u.origin !== contract.origin) return null;
    return u.pathname.replace(/^\//, '');
  } catch {
    return null;
  }
}
function linksTo(html, targetPath) {
  return hrefs(html).some(href => localPathFromHref(href) === targetPath);
}
function canonicals(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(m => m[0])
    .filter(tag => /\brel\s*=\s*["']canonical["']/i.test(tag))
    .map(tag => (tag.match(/\bhref\s*=\s*["']([^"']+)["']/i) || [])[1])
    .filter(Boolean);
}
function hasAtlasEvents(html) {
  return /\bsrc\s*=\s*["'][^"']*atlas-events\.js(?:\?[^"']*)?["']/i.test(html);
}
function hasGatewayCsp(html) {
  return /https:\/\/gateway\.umami\.is/i.test(html);
}
function hasFreeFunnelEvent(html) {
  return /data-atlas-event\s*=\s*["']free_funnel_cta["']/i.test(html);
}

// Canonical truth.
for (const key of ['hub', 'immigration', 'e2', 'guide', 'accompagnement']) {
  const got = canonicals(docs[key]);
  const expected = contract.canonical[key];
  check(`canonical:${key}`, got.length === 1 && got[0] === expected, `expected exactly ${expected}; got ${JSON.stringify(got)}`);
}
if (profile.roadmap_in_sitemap) {
  const got = canonicals(docs.roadmap);
  check('canonical:roadmap', got.length === 1 && got[0] === contract.canonical.roadmap, `expected exactly ${contract.canonical.roadmap}; got ${JSON.stringify(got)}`);
}

// Robots + sitemap.
check('robots:allow-root', /(^|\n)Allow:\s*\/\s*(\n|$)/i.test(docs.robots), 'robots.txt must allow /');
check('robots:sitemap', docs.robots.includes(`Sitemap: ${contract.origin}/sitemap.xml`), `robots.txt must expose ${contract.origin}/sitemap.xml`);
const locs = [...docs.sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map(m => m[1]);
check('sitemap:unique', new Set(locs).size === locs.length, `found ${locs.length - new Set(locs).size} duplicate URL(s)`);
check('sitemap:queryless', locs.every(u => !u.includes('?')), 'sitemap URLs must not contain query strings');
for (const url of contract.always_in_sitemap) check(`sitemap:required:${url}`, locs.includes(url), `${url} must be present`);
const roadmapUrl = contract.canonical.roadmap;
check('sitemap:roadmap-conditional', profile.roadmap_in_sitemap ? locs.includes(roadmapUrl) : !locs.includes(roadmapUrl), profile.roadmap_in_sitemap ? 'Roadmap must be present after accepted Roadmap release' : 'Roadmap must remain absent before accepted Roadmap release');

// Critical crawl edges.
check('edge:hub->immigration', linksTo(docs.hub, 'immigration-usa.html'), 'USA hub must link to immigration comparator');
check('edge:hub->guide', linksTo(docs.hub, 'offres.html'), 'USA hub must link to free Guide surface');
check('edge:guide->roadmap', linksTo(docs.guide, 'parcours-usa.html'), 'Guide must link to Roadmap');
check('edge:accompagnement->guide', linksTo(docs.accompagnement, 'offres.html'), 'Accompagnement must link to Guide');
check('edge:accompagnement->roadmap', linksTo(docs.accompagnement, 'parcours-usa.html'), 'Accompagnement must link to Roadmap');
if (profile.require_immigration_to_e2_edge) check('edge:immigration->e2', linksTo(docs.immigration, 'visa-e2-etats-unis-francais.html'), 'Immigration E-2 section must link to dedicated E-2 page after D1R-7 release');

// Measurement continuity. Hub/Guide/Accompagnement are always expected to use the canonical free-funnel collector.
const tracked = ['hub', 'guide', 'accompagnement'];
if (profile.require_secondary_collector_parity || profile.require_secondary_free_funnel_events) tracked.push('immigration', 'e2');
for (const key of [...new Set(tracked)]) {
  check(`collector:${key}:atlas-events`, hasAtlasEvents(docs[key]), `${key} must load atlas-events.js`);
  check(`collector:${key}:gateway-csp`, hasGatewayCsp(docs[key]), `${key} CSP must allow https://gateway.umami.is`);
  check(`collector:${key}:free-funnel`, hasFreeFunnelEvent(docs[key]), `${key} must tag an existing free-product handoff with free_funnel_cta`);
}

// Free-first truth blockers.
const acquisitionPages = ['hub', 'immigration', 'e2', 'guide', 'accompagnement'];
for (const key of acquisitionPages) {
  check(`free-first:${key}:no-29-euro-guide`, !/guide[^\n<]{0,120}29\s*€/i.test(docs[key]), `${key} must not route primarily to a 29 € guide`);
}
if (profile.human_formats_closed) {
  check('free-first:accompagnement:no-active-start-intake', !linksTo(docs.accompagnement, 'start.html'), 'active start.html intake is forbidden while the page states human formats are closed');
}

const failures = checks.filter(c => !c.ok);
const report = {
  contract_version: contract.version,
  profile: args.profile,
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
