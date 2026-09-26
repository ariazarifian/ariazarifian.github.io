#!/usr/bin/env node
'use strict';

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const [,, manifestPath] = process.argv;
if (!manifestPath) {
  console.error('Usage: node scripts/atlas_country_factory_cf6_release_preflight.cjs <cf6-manifest.json>');
  process.exit(2);
}

const EXPECTED = Object.freeze({
  rawBytes: 97214,
  rawSha256: '7afb597aca31e3dda02d08bcccdc6be0c3ca4afe5cfc528aa459b5a87bd7ebb5',
  schema: 'atlas.country_factory.manifest.v1',
  manifestId: 'DEX-CF6-B6',
  manifestVersion: '2026-09-24.1',
  checksum: '6ce3ffdceedb9e9d1e830cad12d7b78b2f4bd91ea919b553e96031343ebc75b0',
  createdOn: '2026-09-24',
  clean: ['MYS','MUS','CHL','MEX','KOR'],
  held: ['LTU','ARE'],
  core8: ['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'],
  freshnessCounts: {
    CURRENT: 27,
    CURRENT_WITH_ANNUAL_WATCH: 1,
    RELEASE_TIME: 5,
    CURRENT_WITH_WATCH: 2,
    CURRENT_FINAL_RECONCILED: 1,
    CURRENT_2026_REFORM: 1,
    CURRENT_STATS_BASELINE: 1,
    HISTORICAL_BASELINE_WITH_WATCH: 1,
    CURRENT_ANNUAL_WITH_QUARTERLY_WATCH: 1
  },
  evidenceUnique: 55,
  evidenceUses: 56,
  preparedBlobs: {
    'atlas-exit/country-factory-dex-cf6-b6-meta.js': 'a9246661e600c5493546bcb9adbe532f5f1e8ae1',
    'atlas-exit/country-factory-dex-cf6-b6-mys.js': 'd94cbdd1d83099bc7ccea861ffcda298440e72d2',
    'atlas-exit/country-factory-dex-cf6-b6-mus.js': 'a71b908ce48524d31cbc07fecb75c7027eb8b755',
    'atlas-exit/country-factory-dex-cf6-b6-chl.js': '45e62fa32df50405d05983a96a04df931b7be440',
    'atlas-exit/country-factory-dex-cf6-b6-mex.js': '4604e2cde780dc6bb7f7744fbfe564757019ee8f',
    'atlas-exit/country-factory-dex-cf6-b6-kor.js': 'cceb3862a9ca72b15b9a86351184b11d5fcf59ec'
  }
});

const fail = (message, context) => {
  console.error('CF6_PREFLIGHT_FAIL', message, context === undefined ? '' : context);
  process.exit(1);
};
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

function normalizeNfc(value) {
  if (typeof value === 'string') return value.normalize('NFC');
  if (Array.isArray(value)) return value.map(normalizeNfc);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key.normalize('NFC')] = normalizeNfc(value[key]);
    return out;
  }
  return value;
}
function canonicalChecksum(manifest) {
  const clone = JSON.parse(JSON.stringify(manifest));
  delete clone.checksum;
  return sha256(Buffer.from(JSON.stringify(normalizeNfc(clone)), 'utf8'));
}

const raw = fs.readFileSync(manifestPath);
if (raw.length !== EXPECTED.rawBytes) fail('raw byte size mismatch', {expected:EXPECTED.rawBytes, actual:raw.length});
const rawDigest = sha256(raw);
if (rawDigest !== EXPECTED.rawSha256) fail('raw SHA-256 mismatch', {expected:EXPECTED.rawSha256, actual:rawDigest});

let manifest;
try { manifest = JSON.parse(raw.toString('utf8')); }
catch (error) { fail('strict JSON parse failed', error.message); }

if (manifest.schema !== EXPECTED.schema) fail('schema mismatch', manifest.schema);
if (manifest.manifest_id !== EXPECTED.manifestId) fail('manifest id mismatch', manifest.manifest_id);
if (manifest.manifest_version !== EXPECTED.manifestVersion) fail('manifest version mismatch', manifest.manifest_version);
if (manifest.createdOn !== EXPECTED.createdOn) fail('createdOn mismatch', manifest.createdOn);
if (manifest.checksum !== EXPECTED.checksum) fail('manifest checksum field mismatch', manifest.checksum);
const recomputed = canonicalChecksum(manifest);
if (recomputed !== EXPECTED.checksum) fail('canonical checksum recompute mismatch', {expected:EXPECTED.checksum, actual:recomputed});

const clean = (manifest.batch?.clean || []).map(String);
const held = (manifest.batch?.held || []).map(String);
if (!same(clean, EXPECTED.clean)) fail('CLEAN ordering mismatch', clean);
if (!same(held, EXPECTED.held)) fail('HELD ordering mismatch', held);
if (manifest.batch?.clean_country_count !== 5 || manifest.batch?.clean_field_count !== 40) fail('declared CLEAN counts mismatch', manifest.batch);
if (!same(manifest.governance?.core8_field_order, EXPECTED.core8)) fail('CORE8 governance order mismatch', manifest.governance?.core8_field_order);

const countries = manifest.countries || [];
if (!same(countries.map(c=>c.iso3), EXPECTED.clean)) fail('country ordering does not match CLEAN ordering', countries.map(c=>c.iso3));
if (countries.some(c=>c.batch_status !== 'CLEAN')) fail('non-CLEAN country present');
if (countries.some(c=>EXPECTED.held.includes(c.iso3))) fail('HELD leakage into country records');

const evidenceMap = manifest.supporting_evidence_map || {};
const evidenceSet = new Set();
const evidenceUses = [];
const freshnessCounts = {};
const safetyRefresh = [];
let core8Count = 0;

for (const country of countries) {
  if (!Array.isArray(country.core8) || country.core8.length !== 8) fail('country CORE8 length mismatch', country.iso3);
  const fields = country.core8.map(f=>f.field_id);
  if (!same(fields, EXPECTED.core8)) fail('country CORE8 field ordering mismatch', {iso3:country.iso3, fields});
  core8Count += country.core8.length;
  for (const field of country.core8) {
    if (field.state !== 'READY' || !/^READY/.test(String(field.product_handoff || ''))) fail('field is not Product-ready', {iso3:country.iso3, field:field.field_id, state:field.state, product_handoff:field.product_handoff});
    if ([...String(field.headline || '')].length > 110) fail('headline too long', {iso3:country.iso3, field:field.field_id});
    if ([...String(field.summary || '')].length > 340) fail('summary too long', {iso3:country.iso3, field:field.field_id});
    const ids = Array.isArray(field.evidence_ids) ? field.evidence_ids : [];
    if (!ids.length) fail('field has no evidence ids', {iso3:country.iso3, field:field.field_id});
    for (const id of ids) {
      if (!evidenceMap[id]) fail('evidence id missing from supporting_evidence_map', {iso3:country.iso3, field:field.field_id, id});
      evidenceSet.add(id); evidenceUses.push(id);
    }
    const freshness = field.freshness?.state;
    if (!freshness) fail('freshness state missing', {iso3:country.iso3, field:field.field_id});
    freshnessCounts[freshness] = (freshnessCounts[freshness] || 0) + 1;
    if (field.field_id === 'safety_context') {
      safetyRefresh.push({iso3:country.iso3, state:freshness, required:Boolean(field.flags?.release_refresh_required), checkedOn:field.checkedOn});
      if (freshness !== 'RELEASE_TIME' || field.flags?.release_refresh_required !== true) fail('safety_context must remain RELEASE_TIME + refresh-required', {iso3:country.iso3, freshness, flags:field.flags});
    }
  }
}
if (core8Count !== 40) fail('CORE8 total mismatch', core8Count);
if (!same(freshnessCounts, EXPECTED.freshnessCounts)) fail('heterogeneous freshness fingerprint mismatch', {expected:EXPECTED.freshnessCounts, actual:freshnessCounts});
if (evidenceSet.size !== EXPECTED.evidenceUnique || evidenceUses.length !== EXPECTED.evidenceUses) fail('evidence cardinality mismatch', {unique:evidenceSet.size, uses:evidenceUses.length});

const integrationPlan = {
  branchBaseline: 'THEN_CURRENT_SERVED_PRODUCTION',
  productWriteGate: 'CHIEF_EXPLORER_CLOSED_LIVE_VERIFIED_AND_CF6_OPEN',
  generatedPaths: Object.keys(EXPECTED.preparedBlobs),
  mutableIntegrationPaths: ['atlas-exit/country-factory-runtime.js','atlas-exit/index.html'],
  heldMustRemainUnwired: EXPECTED.held,
  runtimeTarget: 'atlas-country-factory-runtime-v6',
  scriptOrder: 'B6 meta + five CLEAN records before country-factory-runtime.js',
  protectedSurfaces: [
    'atlas-exit/sitemap.xml',
    'atlas-exit/atlas-ui-explorer.css',
    'atlas-exit/conflict-tensions.css',
    'atlas-exit/script.js',
    'atlas-exit/world-expansion.js',
    'atlas-exit/country-evidence-united-kingdom.js',
    'atlas-exit/country-evidence-germany.js',
    'atlas-exit/country-evidence-portugal.js',
    'atlas-exit/offres.html',
    'atlas-exit/parcours-usa.html',
    'atlas-exit/accompagnement.html',
    'atlas-exit/atlas-events.js',
    'atlas-exit/parcours-usa.js'
  ],
  browserMatrix: {
    viewports:[{width:1440,height:1000},{width:390,height:844}],
    cf6:[...EXPECTED.clean],
    priorFactory:['AUT','BEL','HRV','EST','CYP'],
    evidenceRegressions:['CAN','PRT','DEU','GBR'],
    conflictRegressions:['JPN','THA'],
    interactions:['search','region-filter','reset','tax-layer','stability-layer','conflict-layer','save','compare','zoom-in','zoom-out','home-map','mobile-filters'],
    invariants:['no-horizontal-overflow','no-same-origin-errors','no-console-product-errors','HELD-unwired','all-CORE8-direct-sources','Country-Factory-tax-precedence']
  }
};

console.log(JSON.stringify({
  status:'PASS',
  manifest:{id:EXPECTED.manifestId,version:EXPECTED.manifestVersion,rawBytes:raw.length,rawSha256:rawDigest,checksum:recomputed,clean,held,core8Fields:core8Count,evidenceIds:evidenceSet.size,evidenceUses:evidenceUses.length,freshnessCounts,safetyRefresh},
  preparedBlobs:EXPECTED.preparedBlobs,
  integrationPlan
},null,2));
