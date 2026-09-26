#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const [,, manifestPath, outDirArg] = process.argv;
if (!manifestPath) {
  console.error('Usage: node scripts/atlas_country_factory_manifest_splitter.cjs <manifest.json> [out-dir]');
  process.exit(2);
}

const CORE8_DEFAULT = ['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'];
const raw = fs.readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(raw);
const fail = (msg, ctx) => { console.error('CF_SPLITTER_FAIL', msg, ctx || ''); process.exit(1); };

function normalizeNfc(value) {
  if (typeof value === 'string') return value.normalize('NFC');
  if (Array.isArray(value)) return value.map(normalizeNfc);
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k.normalize('NFC')] = normalizeNfc(value[k]);
    return out;
  }
  return value;
}
function canonicalChecksum(m) {
  const clone = JSON.parse(JSON.stringify(m));
  delete clone.checksum;
  const canonical = JSON.stringify(normalizeNfc(clone));
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}
function compact(v) { return JSON.stringify(v); }
function gitBlobSha(text) {
  const body = Buffer.from(text, 'utf8');
  const header = Buffer.from(`blob ${body.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(Buffer.concat([header, body])).digest('hex');
}

if (manifest.schema !== 'atlas.country_factory.manifest.v1') fail('unexpected manifest schema', manifest.schema);
const mm = /^DEX-CF(\d+)-B(\d+)$/.exec(String(manifest.manifest_id || ''));
if (!mm || mm[1] !== mm[2]) fail('manifest_id must be DEX-CF<n>-B<n>', manifest.manifest_id);
const batchNo = Number(mm[2]);
const expectedChecksum = canonicalChecksum(manifest);
if (expectedChecksum !== manifest.checksum) fail('canonical checksum mismatch', {expected: expectedChecksum, manifest: manifest.checksum});

const core8Order = manifest.governance?.core8_field_order || CORE8_DEFAULT;
if (JSON.stringify(core8Order) !== JSON.stringify(CORE8_DEFAULT)) fail('unsupported CORE8 field order', core8Order);
const clean = (manifest.batch?.clean || []).map(String);
const held = (manifest.batch?.held || []).map(String);
if (!Array.isArray(manifest.countries)) fail('countries must be an array');
const countries = manifest.countries;
const loaded = countries.map(c => String(c.iso3 || c.country_key || '')).sort();
const expected = [...clean].sort();
if (JSON.stringify(loaded) !== JSON.stringify(expected)) fail('CLEAN/countries mismatch', {expected, loaded});
if (loaded.some(id => held.includes(id))) fail('HELD leakage into countries', {held, loaded});
if (countries.some(c => c.batch_status !== 'CLEAN')) fail('non-CLEAN country present');

const evidenceMap = manifest.supporting_evidence_map || {};
const prefix = `country-factory-dex-cf${batchNo}-b${batchNo}`;
const recordsVar = `ATLAS_COUNTRY_FACTORY_B${batchNo}_RECORDS`;
const metaVar = `ATLAS_COUNTRY_FACTORY_B${batchNo}_META`;
const outDir = outDirArg || path.dirname(manifestPath);
fs.mkdirSync(outDir, {recursive: true});

const meta = {
  schemaVersion: 'atlas-country-factory-runtime-v1',
  manifestId: manifest.manifest_id,
  manifestVersion: manifest.manifest_version,
  manifestChecksum: manifest.checksum,
  checkedOn: manifest.createdOn,
  clean,
  held
};
const outputs = new Map();
outputs.set(`${prefix}-meta.js`, `(function(r){'use strict';r.${metaVar}=Object.freeze(${compact(meta)});r.${recordsVar}=[];})(typeof window!=='undefined'?window:globalThis);\n`);

for (const country of countries) {
  const iso3 = String(country.iso3 || country.country_key || '').toUpperCase();
  if (!iso3) fail('missing iso3', country.country_name);
  if (!Array.isArray(country.core8) || country.core8.length !== CORE8_DEFAULT.length) fail('country does not contain exactly CORE8 fields', iso3);
  const byField = new Map(country.core8.map(f => [f.field_id, f]));
  if (CORE8_DEFAULT.some(k => !byField.has(k))) fail('missing CORE8 field', iso3);
  const fields = {};
  for (const key of CORE8_DEFAULT) {
    const f = byField.get(key);
    if (f.state !== 'READY' || !/^READY/.test(String(f.product_handoff || ''))) fail('field not Product-ready', {iso3, key, state:f.state, handoff:f.product_handoff});
    const ids = Array.isArray(f.evidence_ids) ? f.evidence_ids : [];
    if (!ids.length) fail('field has no evidence ids', {iso3, key});
    for (const id of ids) if (!evidenceMap[id]) fail('evidence id missing from supporting_evidence_map', {iso3, key, id});
    const freshness = {
      state: f.freshness?.state,
      cadence: f.freshness?.cadence,
      trigger: f.freshness?.next_review_trigger
    };
    for (const [extraKey, extraValue] of Object.entries(f.freshness || {})) {
      if (extraKey === 'state' || extraKey === 'cadence' || extraKey === 'next_review_trigger') continue;
      freshness[extraKey] = extraValue;
    }
    const sources = ids.map(id => {
      const e = evidenceMap[id];
      return {
        owner: e.authority,
        locator: e.locator,
        sourceClass: e.type,
        evidenceId: id,
        scope: f.scope,
        vintage: f.vintage,
        checkedOn: e.checkedOn || f.checkedOn
      };
    });
    fields[key] = {
      state: f.product_handoff,
      headline: f.headline,
      summary: f.summary,
      jurisdiction: f.scope,
      scope: f.scope,
      sourceVintage: f.vintage,
      verifiedOn: f.checkedOn,
      checkedOn: f.checkedOn,
      freshness,
      caveat: (f.caveats || []).join(' '),
      conditions: f.conditional_semantics ? [f.conditional_semantics] : [],
      structure: {
        evidenceState: f.state,
        sourceIds: ids,
        noScalarSimplification: Boolean(f.flags?.no_scalar_simplification),
        conditionalSemantics: f.conditional_semantics || ''
      },
      sources,
      evidenceIds: ids,
      multi_source_required: Boolean(f.multi_source_required),
      flags: f.flags
    };
  }
  const safety = byField.get('safety_context');
  const record = {
    key: country.country_key,
    iso3,
    iso2: country.iso2,
    country: country.country_name,
    countryNameEn: country.country_name_en,
    schemaVersion: 'country-evidence-v1',
    evidenceBatch: manifest.manifest_id,
    factoryManifestVersion: manifest.manifest_version,
    fields,
    volatility: {
      conflictTensions: safety.flags?.conflict_volatility,
      releaseTimeRefreshRequired: Boolean(safety.flags?.release_refresh_required),
      checkedOn: safety.checkedOn
    }
  };
  outputs.set(`${prefix}-${iso3.toLowerCase()}.js`, `(function(r){'use strict';(r.${recordsVar}||(r.${recordsVar}=[])).push(Object.freeze(${compact(record)}));})(typeof window!=='undefined'?window:globalThis);\n`);
}

const summary = [];
for (const [fileName, content] of outputs) {
  const target = path.join(outDir, fileName);
  fs.writeFileSync(target, content, 'utf8');
  summary.push({file: fileName, bytes: Buffer.byteLength(content, 'utf8'), gitBlob: gitBlobSha(content)});
}
console.log(JSON.stringify({manifestId:manifest.manifest_id, manifestChecksum:manifest.checksum, outputs:summary}, null, 2));
