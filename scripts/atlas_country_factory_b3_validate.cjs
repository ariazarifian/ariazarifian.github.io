'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const CORE8=['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'];
const CLEAN=['NLD','SWE','NZL','ITA','HRV'];
const CHECKSUM='a8c84bbabb33e1e2c7c3da78b54843d3e551f9b65ec7ba81d13b0db0af9117b5';
require(path.join(ROOT,'atlas-exit/country-factory-dex-cf3-b3-meta.js'));
for(const id of ['nld','swe','nzl','ita','hrv'])require(path.join(ROOT,`atlas-exit/country-factory-dex-cf3-b3-${id}.js`));
const meta=globalThis.ATLAS_COUNTRY_FACTORY_B3_META,records=globalThis.ATLAS_COUNTRY_FACTORY_B3_RECORDS;
assert.ok(meta&&Array.isArray(records),'B3 globals missing');
assert.equal(meta.manifestId,'DEX-CF3-B3');assert.equal(meta.manifestVersion,'2026-09-24.3');assert.equal(meta.manifestChecksum,CHECKSUM);assert.equal(meta.checkedOn,'2026-09-24');
assert.deepEqual(meta.clean,CLEAN);assert.deepEqual(meta.held,['ARE']);assert.equal(records.length,5);assert.deepEqual(records.map(r=>r.iso3),CLEAN);assert.ok(!records.some(r=>r.iso3==='ARE'));
const evidence=new Set(),uses=[];
for(const rec of records){
  assert.equal(rec.evidenceBatch,'DEX-CF3-B3',`${rec.iso3} batch`);assert.equal(rec.factoryManifestVersion,'2026-09-24.3',`${rec.iso3} version`);assert.deepEqual(Object.keys(rec.fields),CORE8,`${rec.iso3} CORE8 order`);
  for(const key of CORE8){const f=rec.fields[key];
    assert.equal(f.state,'READY_FOR_PRODUCT',`${rec.iso3}/${key} state`);assert.equal(f.checkedOn,'2026-09-24',`${rec.iso3}/${key} checkedOn`);assert.ok(f.scope&&f.sourceVintage&&f.caveat,`${rec.iso3}/${key} semantics`);assert.ok(Array.isArray(f.conditions)&&f.conditions.length,`${rec.iso3}/${key} conditions`);assert.ok([...f.headline].length<=110,`${rec.iso3}/${key} headline length`);assert.ok([...f.summary].length<=340,`${rec.iso3}/${key} summary length`);
    assert.ok(Array.isArray(f.sources)&&f.sources.length>=1,`${rec.iso3}/${key} source`);assert.deepEqual(f.evidenceIds,f.sources.map(s=>s.evidenceId),`${rec.iso3}/${key} source order`);assert.deepEqual(f.structure?.sourceIds,f.evidenceIds,`${rec.iso3}/${key} structural source order`);
    if(f.multi_source_required)assert.ok(f.sources.length>=2,`${rec.iso3}/${key} multi-source`);
    for(const s of f.sources){assert.ok(/^https:\/\/.+/.test(s.locator),`${rec.iso3}/${key} direct locator`);assert.equal(s.checkedOn,'2026-09-24',`${rec.iso3}/${key} source checkedOn`);evidence.add(s.evidenceId);uses.push(s.evidenceId);}
    assert.equal(typeof f.flags?.no_scalar_simplification,'boolean',`${rec.iso3}/${key} scalar guard`);assert.ok(['CURRENT','WATCH'].includes(f.freshness?.state),`${rec.iso3}/${key} freshness state`);
    if(f.freshness.state==='WATCH'){assert.ok(f.freshness.watch?.reason&&f.freshness.watch?.checkedOn,`${rec.iso3}/${key} WATCH metadata`);assert.equal(f.freshness.watch.checkedOn,'2026-09-24',`${rec.iso3}/${key} WATCH checkedOn`);}
  }
  const safety=rec.fields.safety_context;assert.equal(safety.flags.release_refresh_required,true,`${rec.iso3} safety refresh`);assert.equal(safety.freshness.state,'CURRENT',`${rec.iso3} safety freshness`);
}
assert.equal(evidence.size,51,'unique evidence id count');
const by=Object.fromEntries(records.map(r=>[r.iso3,r]));
assert.match(by.ITA.fields.pit.headline,/33\s*%/,'Italy 2026 middle PIT band');assert.doesNotMatch(by.ITA.fields.pit.headline,/35\s*%/,'Italy stale PIT leaked');assert.match(by.ITA.fields.cit_business.headline,/3[,.]50\s*%/,'Italy IRAP base');assert.match(by.ITA.fields.cit_business.summary,/24\s*%/,'Italy IRES baseline');
assert.ok(by.HRV.fields.pit.freshness.state==='WATCH'&&by.HRV.fields.cit_business.freshness.state==='WATCH'&&by.HRV.fields.consumption_tax.freshness.state==='WATCH','Croatia WATCH semantics');assert.equal(by.NLD.fields.cost_context.freshness.state,'WATCH');assert.ok(by.SWE.fields.pit.freshness.state==='WATCH'&&by.SWE.fields.cost_context.freshness.state==='WATCH');assert.equal(by.NZL.fields.cost_context.freshness.state,'WATCH');
assert.ok(records.every(r=>r.fields.cost_context.caveat.match(/ménage|household|personne|budget|moyenne/i)),'cost scope caveat');
console.log(JSON.stringify({status:'PASS',manifest:'DEX-CF3-B3',checksum:CHECKSUM,countries:CLEAN,core8Fields:40,evidenceIds:evidence.size,evidenceUses:uses.length,held:['ARE'],safetyRefresh:5},null,2));
