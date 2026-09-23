/* PEX-CF1 — shared data-first runtime for ordinary normalized-country batches.
   Consumes generated metadata + generated CLEAN records only; HOLD/FAILED never enter Product. */
(function(root){
'use strict';
if(!root||!root.document)return;
let attempts=0;
const CORE8=['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'];
const FISCAL=CORE8.slice(0,4),PRACTICAL=CORE8.slice(4);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arr=v=>Array.isArray(v)?v:[];
const activeCountryId=container=>container?.querySelector('[data-save]')?.getAttribute('data-save')||null;
const dateLabel=value=>{const [y,m,d]=String(value||'').split('-');return y&&m&&d?`${d}.${m}.${y}`:value||'—';};
const report={status:'BOOTING',clean:[],held:[],failed:[],orphanRecords:[],errors:[]};
root.ATLAS_COUNTRY_FACTORY_REPORT=report;

function validateRecord(record){
  const errors=[],iso=String(record?.iso3||record?.key||'').toUpperCase();
  if(!/^[A-Z]{3}$/.test(iso))errors.push('invalid iso3');
  if(record?.key!==iso)errors.push('key/iso3 mismatch');
  if(!record?.country)errors.push('country name missing');
  const keys=Object.keys(record?.fields||{});
  if(JSON.stringify(keys)!==JSON.stringify(CORE8))errors.push('CORE8 order/content mismatch');
  for(const key of CORE8){
    const f=record?.fields?.[key];
    if(!f){errors.push(`${key}: missing`);continue;}
    if(f.state!=='READY_FOR_PRODUCT')errors.push(`${key}: state ${f.state}`);
    for(const k of ['headline','summary','scope','sourceVintage','checkedOn','caveat'])if(!String(f[k]||'').trim())errors.push(`${key}: missing ${k}`);
    if(String(f.headline||'').length>110)errors.push(`${key}: headline too long`);
    if(String(f.summary||'').length>340)errors.push(`${key}: summary too long`);
    const sources=arr(f.sources);
    if(!sources.length)errors.push(`${key}: no sources`);
    if(f.multi_source_required===true&&sources.length<2)errors.push(`${key}: multisource requirement not met`);
    for(const source of sources){
      if(!String(source?.owner||'').trim()||!/^https:\/\//.test(String(source?.locator||''))||!String(source?.sourceClass||'').startsWith('PRIMARY_'))errors.push(`${key}: invalid primary source`);
    }
    if(!f.freshness||!['CURRENT','WATCH'].includes(f.freshness.state)||!f.freshness.cadence||!f.freshness.trigger)errors.push(`${key}: freshness invalid`);
    if(f.freshness?.state==='WATCH'&&!f.freshness.watch)errors.push(`${key}: WATCH metadata missing`);
    if(!f.flags||typeof f.flags.release_refresh_required!=='boolean'||typeof f.flags.no_scalar_simplification!=='boolean')errors.push(`${key}: flags invalid`);
    if(key==='safety_context'&&f.flags.release_refresh_required!==true)errors.push(`${key}: release refresh required`);
  }
  return {iso,ok:errors.length===0,errors};
}
function sourceMarkup(field){
  const list=arr(field?.sources);
  const links=list.map((s,i)=>`<a class="detail-source" href="${esc(s.locator)}" target="_blank" rel="noopener noreferrer" data-cf-evidence="${esc(s.evidenceId||'')}">${esc(s.owner)}${list.length>1?` · ${i+1}/${list.length}`:''} ↗</a>`).join('');
  return list.length>1?`<div class="atlas-evidence__sources" data-source-count="${list.length}"><span class="atlas-evidence__sources-label">${list.length} sources directes</span><div class="atlas-evidence__sources-links">${links}</div></div>`:links;
}
function rowMarkup(key,field){
  const caveats=String(field.caveat||'').split(/\s+(?=[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ])/).filter(Boolean).slice(0,3).map(t=>`<p class="micro">${esc(t)}</p>`).join('');
  return `<article class="atlas-evidence__row" data-evidence-field="${esc(key)}" data-evidence-state="READY"><div class="atlas-evidence__row-head"><span>${esc({
    tax_residency:'Résidence fiscale',pit:'Impôt personnel',cit_business:'Sociétés / activité',consumption_tax:'TVA / consommation',
    cost_context:'Coût de vie · repère officiel',residence_visa:'Séjour / résidence',healthcare:'Santé / couverture',safety_context:'Sécurité · contexte officiel'
  }[key]||key)}</span><small>Vérifié</small></div><strong>${esc(field.headline)}</strong><p>${esc(field.summary)}</p><details class="atlas-evidence__source"><summary>Source & limites</summary><p class="micro">${esc(field.scope)} · vérifié ${esc(dateLabel(field.checkedOn))} · ${esc(field.freshness.cadence)}</p>${caveats}<p class="micro">${esc(arr(field.conditions).join(' '))}</p>${sourceMarkup(field)}</details></article>`;
}
function panelMarkup(record){
  const count=CORE8.reduce((n,k)=>n+arr(record.fields[k].sources).length,0);
  return `<details class="context-disclosure atlas-evidence atlas-country-factory" data-atlas-country-factory-evidence data-country="${esc(record.iso3)}"><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">COUNTRY FACTORY · ${esc(record.evidenceBatch||'CORE8')}</span><p>8 repères officiels vérifiés · ${count} source${count>1?'s':''} directe${count>1?'s':''}. Détails, conditions et limites à la demande.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${FISCAL.map(k=>rowMarkup(k,record.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${PRACTICAL.map(k=>rowMarkup(k,record.fields[k])).join('')}</div></section></details>`;
}
function reconcileInspector(container,iso){
  const legacyTax=container.querySelector('.tax-stack');if(legacyTax){legacyTax.hidden=true;legacyTax.dataset.atlasLegacyReconciled=iso;}
  const legacyDisclosure=container.querySelector('.source-disclosure');if(legacyDisclosure){legacyDisclosure.hidden=true;legacyDisclosure.dataset.atlasLegacyReconciled=iso;}
  for(const section of container.querySelectorAll('.detail-section')){
    if(section.querySelector('h3')?.textContent?.trim()==='INSTALLATION · PREMIER REPÈRE'){section.hidden=true;section.dataset.atlasLegacyReconciled=iso;}
  }
}
function boot(){
  const meta=root.ATLAS_COUNTRY_FACTORY_META,rawRecords=root.ATLAS_COUNTRY_FACTORY_RECORDS;
  if(!meta||!Array.isArray(rawRecords)||!root.AtlasExplorer?.ready?.()){if(attempts++<300)return root.setTimeout(boot,40);report.status='FAILED';report.errors.push('Factory dependencies unavailable');return;}
  if(meta.schemaVersion!=='atlas-country-factory-runtime-v1'||meta.manifestId!=='DEX-CF1-B1'){report.status='FAILED';report.errors.push('Factory metadata invalid');return;}
  const expected=arr(meta.clean).map(String).sort(),loaded=rawRecords.map(r=>String(r?.iso3||'')).sort(),held=arr(meta.held).map(String);
  if(expected.length<5||expected.length>10||JSON.stringify(expected)!==JSON.stringify(loaded)||loaded.some(id=>held.includes(id))){report.status='FAILED';report.errors.push('CLEAN/HELD record-set mismatch');return;}
  const records={};
  for(const raw of rawRecords){const v=validateRecord(raw);if(!v.ok){report.failed.push(v.iso);report.errors.push(...v.errors.map(e=>`${v.iso}: ${e}`));continue;}records[v.iso]=raw;}
  if(report.failed.length){report.status='FAILED';return;}
  const explorerCountries=root.AtlasExplorer.getCountries?.()||[];
  const byId=new Map(explorerCountries.map(c=>[c.id,c]));
  for(const [iso,record] of Object.entries(records)){
    const country=byId.get(iso);if(!country){report.orphanRecords.push(iso);continue;}
    Object.assign(country,{tax:null,taxLabel:'Repères sourcés',taxYear:'DEX-CF1 · 23.09.2026',scope:'Fiscalité conditionnelle · voir fiche',note:'CORE8 normalisé ; aucun taux réel synthétique.',src:null,taxKind:'country-factory'});
  }
  if(report.orphanRecords.length){report.status='FAILED';report.errors.push(`Explorer geography missing: ${report.orphanRecords.join(', ')}`);return;}
  const document=root.document;
  function enhanceInspector(){
    const container=document.querySelector('#inspectorContent');if(!container)return;
    const id=activeCountryId(container),record=records[id],existing=container.querySelector('[data-atlas-country-factory-evidence]');
    if(!record){if(existing)existing.remove();return;}
    reconcileInspector(container,id);
    if(existing&&existing.dataset.country===id)return;
    if(existing)existing.remove();
    const anchor=container.querySelector('.capital-card')||container.querySelector('.tax-stack')||container.querySelector('.detail-section');if(!anchor)return;
    const wrapper=document.createElement('div');wrapper.innerHTML=panelMarkup(record);anchor.insertAdjacentElement('afterend',wrapper.firstElementChild);
  }
  function rowByLabel(table,label){return [...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);}
  function enhanceComparator(){
    const table=document.querySelector('#compareTable table');if(!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    for(const [iso,record] of Object.entries(records)){
      const idx=headers.findIndex(th=>(th.textContent||'').trim()===record.country);if(idx<1)continue;
      const set=(label,key)=>{const cell=rowByLabel(table,label)?.querySelectorAll('td')?.[idx];if(!cell||cell.dataset.atlasNormalized===iso)return;const f=record.fields[key];cell.innerHTML=`<span class="val">${esc(f.headline)}</span><small>${esc(f.scope)}</small>`;cell.dataset.atlasNormalized=iso;};
      set('Revenu','pit');set('Sociétés','cit_business');set('TVA / consommation','consumption_tax');
      const special=rowByLabel(table,'Taxes particulières')?.querySelectorAll('td')?.[idx];if(special&&special.dataset.atlasNormalized!==iso){special.innerHTML=`<small>${esc(record.fields.tax_residency.headline)}</small>`;special.dataset.atlasNormalized=iso;}
    }
  }
  const inspector=document.querySelector('#inspectorContent');if(inspector)new MutationObserver(()=>queueMicrotask(enhanceInspector)).observe(inspector,{childList:true,subtree:true});
  const compare=document.querySelector('#compareTable');if(compare)new MutationObserver(()=>queueMicrotask(enhanceComparator)).observe(compare,{childList:true,subtree:true});
  enhanceInspector();enhanceComparator();
  const search=document.querySelector('#countrySearch');if(search)search.dispatchEvent(new Event('input',{bubbles:true}));
  report.clean=Object.keys(records);report.held=[...held];report.status='CLEAN';
  root.ATLAS_COUNTRY_FACTORY=Object.freeze({schemaVersion:meta.schemaVersion,manifestId:meta.manifestId,manifestVersion:meta.manifestVersion,manifestChecksum:meta.manifestChecksum,checkedOn:meta.checkedOn,registered:Object.freeze([...report.clean]),held:Object.freeze([...report.held]),recordCount:report.clean.length,report});
}
boot();
})(typeof window!=='undefined'?window:null);
