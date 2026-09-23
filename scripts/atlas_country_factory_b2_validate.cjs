'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const CORE8=['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'];
const CLEAN=['BEL','CZE','GRC','LUX','POL'];
const CHECKSUM='df8ff5fca0d3f9bd7a89d1d155f28ebc2894609cdace864e893a2bc4143fb579';
require(path.join(ROOT,'atlas-exit/country-factory-dex-cf2-b2-meta.js'));
for(const id of ['bel','cze','grc','lux','pol'])require(path.join(ROOT,`atlas-exit/country-factory-dex-cf2-b2-${id}.js`));
const meta=globalThis.ATLAS_COUNTRY_FACTORY_B2_META,records=globalThis.ATLAS_COUNTRY_FACTORY_B2_RECORDS;
assert.ok(meta&&Array.isArray(records),'B2 globals missing');
assert.equal(meta.manifestId,'DEX-CF2-B2');assert.equal(meta.manifestVersion,'2026-09-23.1');assert.equal(meta.manifestChecksum,CHECKSUM);assert.equal(meta.checkedOn,'2026-09-23');
assert.deepEqual(meta.clean,CLEAN);assert.deepEqual(meta.held,['ARE']);assert.equal(records.length,5);assert.deepEqual(records.map(r=>r.iso3),CLEAN);assert.ok(!records.some(r=>r.iso3==='ARE'));
const evidence=new Set();
for(const rec of records){
  assert.equal(rec.evidenceBatch,'DEX-CF2-B2',`${rec.iso3} batch`);assert.equal(rec.factoryManifestVersion,'2026-09-23.1',`${rec.iso3} version`);assert.deepEqual(Object.keys(rec.fields),CORE8,`${rec.iso3} CORE8 order`);
  for(const key of CORE8){const f=rec.fields[key];
    assert.equal(f.state,'READY_FOR_PRODUCT',`${rec.iso3}/${key} state`);assert.equal(f.checkedOn,'2026-09-23',`${rec.iso3}/${key} checkedOn`);assert.ok(f.scope&&f.sourceVintage&&f.caveat,`${rec.iso3}/${key} semantics`);assert.ok(Array.isArray(f.conditions)&&f.conditions.length,`${rec.iso3}/${key} conditions`);assert.ok(f.headline.length<=110,`${rec.iso3}/${key} headline length`);assert.ok(f.summary.length<=340,`${rec.iso3}/${key} summary length`);
    assert.ok(Array.isArray(f.sources)&&f.sources.length>=1,`${rec.iso3}/${key} source`);assert.deepEqual(f.evidenceIds,f.sources.map(s=>s.evidenceId),`${rec.iso3}/${key} source order`);assert.deepEqual(f.structure?.sourceIds,f.evidenceIds,`${rec.iso3}/${key} structural source order`);
    if(f.multi_source_required)assert.ok(f.sources.length>=2,`${rec.iso3}/${key} multi-source`);
    for(const s of f.sources){assert.ok(/^https:\/\//.test(s.locator),`${rec.iso3}/${key} direct locator`);assert.equal(s.checkedOn,'2026-09-23',`${rec.iso3}/${key} source checkedOn`);assert.ok(!evidence.has(s.evidenceId),`duplicate evidence id ${s.evidenceId}`);evidence.add(s.evidenceId);}
    assert.equal(f.flags?.no_scalar_simplification,true,`${rec.iso3}/${key} scalar guard`);
  }
  const safety=rec.fields.safety_context;assert.equal(safety.flags.release_refresh_required,true,`${rec.iso3} safety refresh`);assert.equal(safety.freshness.state,'CURRENT',`${rec.iso3} safety freshness`);assert.match(safety.sources[0].owner,/France Diplomatie/,`${rec.iso3} safety authority`);
}
const by=Object.fromEntries(records.map(r=>[r.iso3,r]));
assert.equal(by.CZE.fields.tax_residency.sources[0].locator,'https://financnisprava.gov.cz/cs/dane/zivotni-situace/zacinate-podnikat');
assert.equal(by.CZE.fields.consumption_tax.sources[0].locator,'https://portal.gov.cz/en/informace/obecna-pravidla-a-sazby-dph-INF-205');
assert.equal(by.LUX.fields.cit_business.multi_source_required,true);assert.equal(by.LUX.fields.cit_business.sources.length,2);assert.ok(by.LUX.fields.cit_business.sources.some(s=>s.locator==='https://impotsdirects.public.lu/fr/az/c/charg_fisc.html'));assert.match(by.LUX.fields.cit_business.caveat,/commune/i);assert.doesNotMatch(by.LUX.fields.cit_business.headline,/23[,.]87/);
assert.equal(by.POL.fields.healthcare.multi_source_required,true);assert.equal(by.POL.fields.healthcare.sources.length,2);assert.match(by.POL.fields.tax_residency.headline,/OU/);assert.match(by.POL.fields.healthcare.summary,/EKUZ|S1/);
assert.ok(records.every(r=>r.fields.cost_context.caveat.match(/ménage|personne|budget/i)),'cost scope caveat');
console.log(JSON.stringify({status:'PASS',manifest:'DEX-CF2-B2',checksum:CHECKSUM,countries:CLEAN,core8Fields:40,evidenceIds:evidence.size,held:['ARE'],safetyRefresh:5},null,2));
