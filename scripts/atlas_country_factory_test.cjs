'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const cp=require('node:child_process');
const {CORE8,digest,checksumPayload,validateManifest}=require('./atlas_country_factory_lib.cjs');

function source(id){return {owner:'Official Authority',locator:`https://official.example/${id}`,sourceClass:'PRIMARY_GOV',evidenceId:`EV-${id}`};}
function field(key,opts={}){
  const conditional=['tax_residency','cit_business','residence_visa','healthcare'].includes(key);
  return {
    state:'READY_FOR_PRODUCT',headline:`${key} · repère officiel`,summary:`Résumé concis et conditionnel pour ${key}.`,scope:`Scope ${key}`,sourceVintage:'2026',checkedOn:'2026-09-23',verifiedOn:'2026-09-23',
    source:source(key),evidenceId:`EV-${key}`,freshness:{state:'CURRENT',cadence:'ANNUAL+EVENT',trigger:`official ${key} change`},caveat:`Limites explicites pour ${key}.`,structure:{conditional},...(conditional?{conditions:['status/rule dependent']}:{ }),...opts
  };
}
function record(iso,country,overrides={}){
  const fields=Object.fromEntries(CORE8.map(k=>[k,field(k)]));
  return {key:iso,iso3:iso,country,schemaVersion:'country-evidence-v1',evidenceBatch:'DEX-CF1-TEST',volatility:{conflictTensions:'NORMAL',releaseTimeRefreshRequired:false,checkedOn:'2026-09-23'},fields,...overrides};
}
function signed(manifest){const x=structuredClone(manifest);x.checksum=`sha256:${digest(checksumPayload(x))}`;return x;}

const base=signed({schemaVersion:'atlas-country-factory-manifest-v1',manifestVersion:'DEX-CF1-TEST-01',checkedOn:'2026-09-23',clean:['NLD','BEL','AUT','DNK','NOR'],held:['ARE'],records:[record('NLD','Pays-Bas'),record('BEL','Belgique'),record('AUT','Autriche'),record('DNK','Danemark'),record('NOR','Norvège'),record('ARE','Émirats arabes unis',{fields:{...record('ARE','x').fields,cost_context:field('cost_context',{state:'HOLD_NO_NATIONAL_SCALAR'})}})]});
let out=validateManifest(base);
assert.equal(out.ok,true,JSON.stringify(out,null,2));
assert.deepEqual(out.clean,['NLD','BEL','AUT','DNK','NOR']);
assert.ok(out.held.includes('ARE'));
assert.equal(out.failed.length,0);

const watch=structuredClone(base);watch.records[0].fields.pit.freshness={state:'WATCH',cadence:'IMMEDIATE+EVENT',trigger:'enactment/rejection/material amendment',checkedOn:'2026-09-23'};watch.checksum=`sha256:${digest(checksumPayload(watch))}`;out=validateManifest(watch);assert.equal(out.ok,true,'READY field + separate WATCH freshness must stay CLEAN');

const noConditions=structuredClone(base);delete noConditions.records[0].fields.healthcare.conditions;noConditions.checksum=`sha256:${digest(checksumPayload(noConditions))}`;out=validateManifest(noConditions);assert.equal(out.ok,false);assert.ok(out.failed.includes('NLD'));

const longCopy=structuredClone(base);longCopy.records[1].fields.pit.headline='X'.repeat(97);longCopy.checksum=`sha256:${digest(checksumPayload(longCopy))}`;out=validateManifest(longCopy);assert.equal(out.ok,false);assert.ok(out.results.find(r=>r.iso3==='BEL').errors.some(e=>/headline length/.test(e)));

const volatile=structuredClone(base);volatile.records[2].volatility={conflictTensions:'HIGH',releaseTimeRefreshRequired:false,checkedOn:'2026-09-23'};volatile.checksum=`sha256:${digest(checksumPayload(volatile))}`;out=validateManifest(volatile);assert.equal(out.ok,false);assert.ok(out.results.find(r=>r.iso3==='AUT').errors.some(e=>/releaseTimeRefreshRequired/.test(e)));

const tampered=structuredClone(base);tampered.records[0].country='Tampered';out=validateManifest(tampered);assert.equal(out.ok,false);assert.ok(out.manifestErrors.some(e=>/checksum mismatch/.test(e)));

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-cf1-'));const manifestPath=path.join(tmp,'manifest.json'),generated=path.join(tmp,'batch.js');fs.writeFileSync(manifestPath,JSON.stringify(base,null,2));cp.execFileSync(process.execPath,['scripts/atlas_country_factory_generate.cjs',manifestPath,generated],{cwd:path.resolve(__dirname,'..'),stdio:'pipe'});const js=fs.readFileSync(generated,'utf8');assert.match(js,/ATLAS_COUNTRY_FACTORY_BATCH/);assert.match(js,/"NLD"/);assert.doesNotMatch(js,/"country":"Émirats arabes unis"/);
console.log(JSON.stringify({status:'PASS',cleanBatch:5,heldIsolation:true,watchSeparation:true,conditionalSemantics:true,textLimits:true,volatilityGate:true,checksumTamperDetection:true,generatorPrunesHeld:true},null,2));
