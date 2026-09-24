'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const CORE8=['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'];
const CLEAN=['CYP','MLT','GEO','ISL','HUN'];
const HELD=['LTU','ARE'];
const CHECKSUM='dc379438eeaf8d2a9a79639e3e5172ffeedc8e3bf3923216f1a2232de725d31a';
const RECORDSET='6d865d8bafe70f52c64e39df5a022ecf28271ab476e6555cbe248c5ea5423ece';
require(path.join(ROOT,'atlas-exit/country-factory-dex-cf5-b5-meta.js'));
for(const id of ['cyp','mlt','geo','isl','hun'])require(path.join(ROOT,`atlas-exit/country-factory-dex-cf5-b5-${id}.js`));
const meta=globalThis.ATLAS_COUNTRY_FACTORY_B5_META,records=globalThis.ATLAS_COUNTRY_FACTORY_B5_RECORDS;
assert.ok(meta&&Array.isArray(records),'B5 globals missing');
assert.equal(meta.manifestId,'DEX-CF5-B5');assert.equal(meta.manifestVersion,'2026-09-24.1');assert.equal(meta.manifestChecksum,CHECKSUM);assert.equal(meta.checkedOn,'2026-09-24');
assert.deepEqual(meta.clean,CLEAN);assert.deepEqual(meta.held,HELD);assert.equal(records.length,5);assert.deepEqual(records.map(r=>r.iso3),CLEAN);assert.ok(!records.some(r=>HELD.includes(r.iso3)));
assert.equal(crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex'),RECORDSET,'manifest-derived recordset fingerprint');
const evidence=new Set(),uses=[];
for(const rec of records){
  assert.equal(rec.evidenceBatch,'DEX-CF5-B5',`${rec.iso3} batch`);assert.equal(rec.factoryManifestVersion,'2026-09-24.1',`${rec.iso3} version`);assert.deepEqual(Object.keys(rec.fields),CORE8,`${rec.iso3} CORE8 order`);
  for(const key of CORE8){const f=rec.fields[key];
    assert.equal(f.state,'READY_FOR_PRODUCT',`${rec.iso3}/${key} state`);assert.equal(f.structure?.evidenceState,'READY',`${rec.iso3}/${key} evidence state`);assert.equal(f.checkedOn,'2026-09-24',`${rec.iso3}/${key} checkedOn`);assert.ok(f.scope&&f.sourceVintage&&f.caveat,`${rec.iso3}/${key} semantics`);assert.ok(Array.isArray(f.conditions)&&f.conditions.length===1&&f.conditions[0],`${rec.iso3}/${key} conditions`);assert.ok([...f.headline].length<=110,`${rec.iso3}/${key} headline length`);assert.ok([...f.summary].length<=340,`${rec.iso3}/${key} summary length`);
    assert.ok(Array.isArray(f.sources)&&f.sources.length>=1,`${rec.iso3}/${key} source`);assert.deepEqual(f.evidenceIds,f.sources.map(s=>s.evidenceId),`${rec.iso3}/${key} source order`);assert.deepEqual(f.structure?.sourceIds,f.evidenceIds,`${rec.iso3}/${key} structural source order`);if(f.multi_source_required)assert.ok(f.sources.length>=2,`${rec.iso3}/${key} multi-source`);
    for(const s of f.sources){assert.ok(/^https:\/\//.test(s.locator),`${rec.iso3}/${key} direct locator`);assert.equal(s.checkedOn,'2026-09-24',`${rec.iso3}/${key} source checkedOn`);assert.ok(s.owner&&s.sourceClass,`${rec.iso3}/${key} source metadata`);evidence.add(s.evidenceId);uses.push(s.evidenceId);}
    assert.equal(typeof f.flags?.no_scalar_simplification,'boolean',`${rec.iso3}/${key} scalar guard`);assert.ok(['CURRENT','WATCH'].includes(f.freshness?.state),`${rec.iso3}/${key} freshness`);if(f.freshness.state==='WATCH'){assert.ok(f.freshness.watch?.reason&&f.freshness.watch?.checkedOn);assert.equal(f.freshness.watch.checkedOn,'2026-09-24');}
  }
  assert.equal(rec.fields.safety_context.flags.release_refresh_required,true,`${rec.iso3} safety refresh`);assert.equal(rec.fields.safety_context.freshness.state,'CURRENT',`${rec.iso3} safety current`);assert.equal(rec.fields.cost_context.flags.no_scalar_simplification,true,`${rec.iso3} cost scalar guard`);
}
assert.equal(evidence.size,47,'unique evidence id count');
const by=Object.fromEntries(records.map(r=>[r.iso3,r]));
assert.equal(by.MLT.fields.cost_context.freshness.state,'WATCH');
assert.match(by.CYP.fields.consumption_tax.headline,/19\s*%/);assert.match(by.HUN.fields.pit.headline,/15\s*%/);assert.match(by.ISL.fields.consumption_tax.headline,/24\s*%/);assert.match(by.GEO.fields.pit.headline,/20\s*%/);
console.log(JSON.stringify({status:'PASS',manifest:'DEX-CF5-B5',checksum:CHECKSUM,recordset:RECORDSET,countries:CLEAN,core8Fields:40,evidenceIds:evidence.size,evidenceUses:uses.length,held:HELD,safetyRefresh:5,watch:{MLT:['cost_context']}},null,2));
// PEX-CF5 exact-byte gate trigger after self-wiring.
