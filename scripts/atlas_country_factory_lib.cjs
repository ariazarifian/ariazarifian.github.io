const crypto=require('node:crypto');

const CORE8=Object.freeze(['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context']);
const CONDITIONAL_FIELDS=new Set(['tax_residency','cit_business','residence_visa','healthcare']);
const HEADLINE_MAX=96;
const SUMMARY_MAX=320;
const COUNTRY_NAME_MAX=64;
const READY_RE=/^READY(?:_|$)/;
const HOLD_RE=/^(?:HOLD|MISSING|BLOCKED)(?:_|$)/;
const AUTHORITY_RE=/(?:^|[_/])(PRIMARY|OFFICIAL|STATUTE|LEGISLATURE|GOV|GOVERNMENT|MINISTRY|TAX_AUTHORITY|CONSULAR|STATISTICS|IMMIGRATION|HEALTH)(?:$|[_/])/i;
const ISO3_RE=/^[A-Z]{3}$/;
const DATE_RE=/^\d{4}-\d{2}-\d{2}$/;

function stable(value){
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));
  return value;
}
function stableStringify(value){return JSON.stringify(stable(value));}
function digest(value){return crypto.createHash('sha256').update(stableStringify(value)).digest('hex');}
function array(v){return Array.isArray(v)?v:[];}
function sourcesFor(field){return Array.isArray(field?.sources)?field.sources.filter(Boolean):(field?.source?[field.source]:[]);}
function nonEmpty(v){return typeof v==='string'&&v.trim().length>0;}
function validUrl(v){try{const u=new URL(v);return u.protocol==='https:'||u.protocol==='http:';}catch{return false;}}
function dateOf(field){return field?.checkedOn||field?.freshness?.checkedOn||null;}
function readiness(field){return String(field?.state||'').trim();}
function sourceEvidenceIds(field){
  const direct=[];
  if(nonEmpty(field?.evidenceId))direct.push(field.evidenceId.trim());
  for(const id of array(field?.evidenceIds))if(nonEmpty(id))direct.push(id.trim());
  for(const s of sourcesFor(field))if(nonEmpty(s?.evidenceId))direct.push(s.evidenceId.trim());
  return [...new Set(direct)];
}
function minimumSources(field){
  if(Number.isInteger(field?.multi_source_required)&&field.multi_source_required>0)return field.multi_source_required;
  if(field?.multi_source_required===true)return 2;
  if(Number.isInteger(field?.minSourceCount)&&field.minSourceCount>0)return field.minSourceCount;
  return 1;
}
function hasConditions(field){
  if(nonEmpty(field?.conditions))return true;
  if(Array.isArray(field?.conditions)&&field.conditions.some(nonEmpty))return true;
  return false;
}
function validateSource(source,path){
  const errors=[];
  if(!nonEmpty(source?.owner))errors.push(`${path}.owner missing`);
  if(!nonEmpty(source?.locator)||!validUrl(source?.locator))errors.push(`${path}.locator invalid`);
  if(!nonEmpty(source?.sourceClass))errors.push(`${path}.sourceClass missing`);
  else if(!AUTHORITY_RE.test(source.sourceClass))errors.push(`${path}.sourceClass not authoritative: ${source.sourceClass}`);
  if(!nonEmpty(source?.evidenceId))errors.push(`${path}.evidenceId missing`);
  return errors;
}
function validateField(key,field){
  const errors=[],holds=[],warnings=[];
  if(!field||typeof field!=='object')return {errors:[`${key} missing`],holds,warnings,text:{headline:0,summary:0},sources:0};
  const state=readiness(field);
  if(!state)errors.push(`${key}.state missing`);
  else if(HOLD_RE.test(state))holds.push(`${key}.state=${state}`);
  else if(!READY_RE.test(state))errors.push(`${key}.state must be READY* for CLEAN; WATCH belongs in freshness metadata, got ${state}`);
  if(!nonEmpty(field.headline))errors.push(`${key}.headline missing`);
  else if([...field.headline].length>HEADLINE_MAX)errors.push(`${key}.headline length ${[...field.headline].length}>${HEADLINE_MAX}`);
  if(!nonEmpty(field.summary))errors.push(`${key}.summary missing`);
  else if([...field.summary].length>SUMMARY_MAX)errors.push(`${key}.summary length ${[...field.summary].length}>${SUMMARY_MAX}`);
  for(const prop of ['scope','sourceVintage','caveat'])if(!nonEmpty(field[prop]))errors.push(`${key}.${prop} missing`);
  if(!field.structure||typeof field.structure!=='object'||Array.isArray(field.structure)||Object.keys(field.structure).length===0)errors.push(`${key}.structure missing/empty`);
  if(CONDITIONAL_FIELDS.has(key)&&!hasConditions(field))errors.push(`${key}.conditions required for conditional semantics`);
  const checkedOn=dateOf(field);
  if(!nonEmpty(checkedOn)||!DATE_RE.test(checkedOn))errors.push(`${key}.checkedOn missing/invalid`);
  const fresh=field.freshness;
  if(!fresh||typeof fresh!=='object')errors.push(`${key}.freshness missing`);
  else {
    for(const prop of ['state','cadence','trigger'])if(!nonEmpty(fresh[prop]))errors.push(`${key}.freshness.${prop} missing`);
    if(String(fresh.state).toUpperCase()==='WATCH'){
      if(!DATE_RE.test(String(fresh.checkedOn||checkedOn||'')))errors.push(`${key}.freshness WATCH requires checkedOn`);
      if(!nonEmpty(fresh.trigger))errors.push(`${key}.freshness WATCH requires event trigger`);
    }
  }
  const sources=sourcesFor(field),min=minimumSources(field);
  if(sources.length<min)errors.push(`${key}.sources ${sources.length}<required ${min}`);
  sources.forEach((s,i)=>errors.push(...validateSource(s,`${key}.sources[${i}]`)));
  if(sourceEvidenceIds(field).length===0)errors.push(`${key}.evidenceId(s) missing`);
  return {errors,holds,warnings,text:{headline:[...(field.headline||'')].length,summary:[...(field.summary||'')].length},sources:sources.length};
}
function validateRecord(record,{cleanList=[]}={}){
  const errors=[],holds=[],warnings=[],fields={};
  const iso3=String(record?.iso3||record?.key||'').toUpperCase();
  if(!ISO3_RE.test(iso3))errors.push('country iso3/key invalid');
  if(!nonEmpty(record?.country))errors.push('country name missing');
  else if([...record.country].length>COUNTRY_NAME_MAX)errors.push(`country name length>${COUNTRY_NAME_MAX}`);
  if(record?.key&&String(record.key).toUpperCase()!==iso3)errors.push('country key must equal iso3');
  if(record?.schemaVersion!=='country-evidence-v1')errors.push('schemaVersion must be country-evidence-v1');
  if(!nonEmpty(record?.evidenceBatch))errors.push('evidenceBatch missing');
  if(!record?.fields||typeof record.fields!=='object')errors.push('fields missing');
  const missing=CORE8.filter(k=>!record?.fields?.[k]);
  const extra=Object.keys(record?.fields||{}).filter(k=>!CORE8.includes(k));
  if(missing.length)errors.push(`CORE8 missing: ${missing.join(',')}`);
  if(extra.length)errors.push(`unexpected fields: ${extra.join(',')}`);
  for(const key of CORE8){const out=validateField(key,record?.fields?.[key]);fields[key]=out;errors.push(...out.errors);holds.push(...out.holds);warnings.push(...out.warnings);}
  const volatility=record?.volatility;
  if(!volatility||typeof volatility!=='object')errors.push('volatility metadata missing');
  else {
    const level=String(volatility.conflictTensions||'').toUpperCase();
    if(!['NORMAL','HIGH'].includes(level))errors.push('volatility.conflictTensions must be NORMAL|HIGH');
    if(level==='HIGH'&&volatility.releaseTimeRefreshRequired!==true)errors.push('HIGH conflict volatility requires releaseTimeRefreshRequired=true');
    if(level==='HIGH'&&!DATE_RE.test(String(volatility.checkedOn||'')))errors.push('HIGH conflict volatility requires checkedOn');
  }
  if(cleanList.length&&iso3&&!cleanList.includes(iso3))warnings.push('record not listed CLEAN by manifest');
  const disposition=holds.length?'HELD':errors.length?'FAILED':'CLEAN';
  return {iso3,country:record?.country||'',disposition,errors,holds,warnings,fields};
}
function normalizeRecords(manifest){
  if(Array.isArray(manifest?.records))return manifest.records;
  if(manifest?.records&&typeof manifest.records==='object')return Object.entries(manifest.records).map(([key,r])=>({key,...r}));
  return [];
}
function checksumPayload(manifest){return {schemaVersion:manifest.schemaVersion,manifestVersion:manifest.manifestVersion,checkedOn:manifest.checkedOn,clean:array(manifest.clean),held:array(manifest.held),records:normalizeRecords(manifest)};}
function validateManifest(manifest,{requireChecksum=true}={}){
  const manifestErrors=[];
  if(manifest?.schemaVersion!=='atlas-country-factory-manifest-v1')manifestErrors.push('manifest schemaVersion must be atlas-country-factory-manifest-v1');
  if(!nonEmpty(manifest?.manifestVersion))manifestErrors.push('manifestVersion missing');
  if(!DATE_RE.test(String(manifest?.checkedOn||'')))manifestErrors.push('manifest checkedOn missing/invalid');
  const clean=array(manifest?.clean).map(v=>String(v).toUpperCase()),held=array(manifest?.held).map(v=>String(v).toUpperCase());
  const dup=[...clean,...held].filter((v,i,a)=>a.indexOf(v)!==i);
  if(dup.length)manifestErrors.push(`duplicate CLEAN/HELD keys: ${[...new Set(dup)].join(',')}`);
  const records=normalizeRecords(manifest),seen=new Set(),results=[];
  for(const record of records){const out=validateRecord(record,{cleanList:clean});if(out.iso3){if(seen.has(out.iso3))out.errors.push('duplicate country key');seen.add(out.iso3);}out.disposition=out.holds.length?'HELD':out.errors.length?'FAILED':'CLEAN';results.push(out);}
  for(const iso of clean)if(!seen.has(iso))manifestErrors.push(`CLEAN country ${iso} has no record`);
  const cleanValidated=results.filter(r=>r.disposition==='CLEAN'&&clean.includes(r.iso3)).map(r=>r.iso3);
  const heldValidated=[...new Set([...held,...results.filter(r=>r.disposition==='HELD').map(r=>r.iso3)])].filter(Boolean);
  const failed=results.filter(r=>r.disposition==='FAILED').map(r=>r.iso3||'(unknown)');
  const computed=`sha256:${digest(checksumPayload(manifest))}`;
  if(requireChecksum){if(!nonEmpty(manifest?.checksum))manifestErrors.push('manifest checksum missing');else if(manifest.checksum!==computed)manifestErrors.push(`manifest checksum mismatch expected ${computed}`);}
  return {ok:manifestErrors.length===0&&failed.length===0&&cleanValidated.length>=1,manifestErrors,manifestVersion:manifest?.manifestVersion||'',computedChecksum:computed,declaredChecksum:manifest?.checksum||'',clean:cleanValidated,held:heldValidated,failed,results,limits:{headline:HEADLINE_MAX,summary:SUMMARY_MAX},recordCount:records.length};
}

module.exports={CORE8,HEADLINE_MAX,SUMMARY_MAX,COUNTRY_NAME_MAX,stableStringify,digest,checksumPayload,validateField,validateRecord,validateManifest,normalizeRecords,sourcesFor};
