from pathlib import Path
p=Path('atlas-exit/fiscal-finalize.js');s=p.read_text()
def once(old,new,label):
 global s
 n=s.count(old)
 if n!=1: raise SystemExit(f'{label}: expected one match, got {n}')
 s=s.replace(old,new,1)
once("    switzerlandCorpFTA:{name:'AFC Suisse · système fiscal · sociétés',url:'https://www.estv.admin.ch/dam/en/sd-web/i8eiHb5Gk0xl/ch-steuersystem.pdf'},\n    switzerlandVatFTA:{name:'AFC Suisse · taux de TVA',url:'https://www.estv.admin.ch/en/vat-rates-switzerland'}","    switzerlandCorpFTA:{name:'AFC Suisse · système fiscal · sociétés',url:'https://www.estv.admin.ch/dam/en/sd-web/i8eiHb5Gk0xl/ch-steuersystem.pdf'},\n    switzerlandVatFTA:{name:'AFC Suisse · taux de TVA',url:'https://www.estv.admin.ch/en/vat-rates-switzerland'},\n    singaporeCorpIRAS:{name:'IRAS Singapour · impôt sur les sociétés',url:'https://www.iras.gov.sg/quick-links/tax-rates/corporate-income-tax-rates'},\n    singaporeGstIRAS:{name:'IRAS Singapour · GST',url:'https://www.iras.gov.sg/quick-links/tax-rates/goods-and-services-tax-%28gst%29-rates'}",'sources')
once("  merge('CHE',{\n    cit:'8,5 % fédéral',\n    citScope:'Bénéfice net · impôts cantonaux/communaux en plus · aucun taux tout compris',\n    vat:'8,1 % standard',\n    vatScope:'TVA · 2,6 % réduit · 3,8 % hébergement',\n    sources:['switzerlandCorpFTA','switzerlandVatFTA'],\n    checked:'AFC · vérifié 21.09.2026'\n  });","  merge('CHE',{\n    cit:'8,5 % fédéral',\n    citScope:'Bénéfice net · impôts cantonaux/communaux en plus · aucun taux tout compris',\n    vat:'8,1 % standard',\n    vatScope:'TVA · 2,6 % réduit · 3,8 % hébergement',\n    sources:['switzerlandCorpFTA','switzerlandVatFTA'],\n    checked:'AFC · vérifié 21.09.2026'\n  });\n\n  // PEX-D1F legacy reconciliation for Singapore's company/GST cards.\n  merge('SGP',{\n    cit:'17 % statutaire',\n    citScope:'Revenu imposable · exemptions/rebates distincts · YA2026 rebate non permanent',\n    vat:'9 % standard',\n    vatScope:'GST standard · traitement par catégorie distinct',\n    sources:['singaporeCorpIRAS','singaporeGstIRAS'],\n    checked:'IRAS · vérifié 21.09.2026'\n  });",'SGP commerce')
once("  if(window.ATLAS_TAX?.CHE) Object.assign(window.ATLAS_TAX.CHE,switzerlandLayeredPit);\n  if(window.ATLAS_CATALOG?.CHE) Object.assign(window.ATLAS_CATALOG.CHE,switzerlandLayeredPit);","  if(window.ATLAS_TAX?.CHE) Object.assign(window.ATLAS_TAX.CHE,switzerlandLayeredPit);\n  if(window.ATLAS_CATALOG?.CHE) Object.assign(window.ATLAS_CATALOG.CHE,switzerlandLayeredPit);\n\n  // PEX-D1F Singapore: 24% remains only the resident top marginal PIT reference.\n  const singaporeResidentPit={tax:24,taxLabel:'Jusqu’à 24 % résident',taxYear:'YA2024+ · IRAS vérifié 21.09.2026',scope:'PIT résident progressif · non-résident distinct',note:'24 % est le taux marginal supérieur résident, pas un taux moyen ni le régime d’un non-résident. Résidence fiscale et traitement non-résident restent distincts.',src:null,taxKind:'current-reference'};\n  if(window.ATLAS_TAX?.SGP) Object.assign(window.ATLAS_TAX.SGP,singaporeResidentPit);\n  if(window.ATLAS_CATALOG?.SGP) Object.assign(window.ATLAS_CATALOG.SGP,singaporeResidentPit);",'SGP PIT bridge')
marker="  function bindAustraliaComparator(){"
block='''  function reconcileSingaporeComparator(){
    const core=window.ATLAS_COUNTRY_EVIDENCE;
    const sgp=window.ATLAS_COUNTRY_EVIDENCE_SINGAPORE?.country;
    const table=document.querySelector('#compareTable table');
    if(!core||!sgp||!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const idx=headers.findIndex(th=>/Singapour/i.test(th.textContent||''));
    if(idx<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[idx]||null;
    const set=(label,html)=>{const target=cell(label);if(target&&!(target.dataset.atlasNormalized==='SGP'&&target.innerHTML===html)){target.innerHTML=html;target.dataset.atlasNormalized='SGP';}};
    const sourceHtml=['tax_residency','pit','cit_business','consumption_tax'].map(k=>core.renderSources(sgp.fields[k])).join('');
    set('Revenu','<span class="val">Progressif · jusqu’à 24 % résident</span><small>YA2024+ · non-résident et résidence fiscale traités séparément</small>');
    set('Sociétés','<span class="val">17 % statutaire</span><small>Exemptions/rebates distincts · rebate YA2026 non permanent</small>');
    set('TVA / consommation','<span class="val">GST 9 % standard</span><small>Traitement par catégorie distinct</small>');
    set('Taxes particulières','<small>Résidence fiscale, visitor status, work pass, COMPASS et couverture santé restent des objets distincts ; aucune équivalence automatique.</small>');
    set('Sources',sourceHtml);
  }

'''
once(marker,block+marker,'SGP comparator')
marker="  function loadSwitzerlandEvidence(){"
block='''  function bindSingaporeComparator(){
    const host=document.querySelector('#compareTable');
    if(!host||host.dataset.atlasSgpComparatorBound==='true')return;
    host.dataset.atlasSgpComparatorBound='true';
    reconcileSingaporeComparator();
    new MutationObserver(()=>queueMicrotask(reconcileSingaporeComparator)).observe(host,{childList:true,subtree:true});
  }

  function loadSingaporeEvidence(){
    if(window.ATLAS_COUNTRY_EVIDENCE_SINGAPORE){bindSingaporeComparator();reconcileSingaporeComparator();return;}
    const existing=document.querySelector('[data-atlas-country-evidence-singapore]');
    if(existing){existing.addEventListener('load',()=>{bindSingaporeComparator();reconcileSingaporeComparator();},{once:true});return;}
    const singapore=document.createElement('script');
    singapore.src='country-evidence-singapore.js?v=pex-d1f-1';
    singapore.async=false;
    singapore.dataset.atlasCountryEvidenceSingapore='runtime';
    singapore.addEventListener('load',()=>{bindSingaporeComparator();reconcileSingaporeComparator();},{once:true});
    document.head.append(singapore);
  }

'''
once(marker,block+marker,'SGP binder/loader')
once("  function loadSwitzerlandEvidence(){\n    if(window.ATLAS_COUNTRY_EVIDENCE_SWITZERLAND){bindSwitzerlandComparator();reconcileSwitzerlandComparator();return;}\n    const existing=document.querySelector('[data-atlas-country-evidence-switzerland]');\n    if(existing){existing.addEventListener('load',()=>{bindSwitzerlandComparator();reconcileSwitzerlandComparator();},{once:true});return;}\n    const switzerland=document.createElement('script');\n    switzerland.src='country-evidence-switzerland.js?v=pex-d1e-1';\n    switzerland.async=false;\n    switzerland.dataset.atlasCountryEvidenceSwitzerland='runtime';\n    switzerland.addEventListener('load',()=>{bindSwitzerlandComparator();reconcileSwitzerlandComparator();},{once:true});\n    document.head.append(switzerland);\n  }","  function loadSwitzerlandEvidence(){\n    if(window.ATLAS_COUNTRY_EVIDENCE_SWITZERLAND){bindSwitzerlandComparator();reconcileSwitzerlandComparator();loadSingaporeEvidence();return;}\n    const existing=document.querySelector('[data-atlas-country-evidence-switzerland]');\n    if(existing){existing.addEventListener('load',()=>{bindSwitzerlandComparator();reconcileSwitzerlandComparator();loadSingaporeEvidence();},{once:true});return;}\n    const switzerland=document.createElement('script');\n    switzerland.src='country-evidence-switzerland.js?v=pex-d1e-1';\n    switzerland.async=false;\n    switzerland.dataset.atlasCountryEvidenceSwitzerland='runtime';\n    switzerland.addEventListener('load',()=>{bindSwitzerlandComparator();reconcileSwitzerlandComparator();loadSingaporeEvidence();},{once:true});\n    document.head.append(switzerland);\n  }",'CHE-to-SGP chain')
once("  // PEX-D1B/D1C/D1D/D1E: keep the D1A evidence contract isolated, then load visible","  // PEX-D1B/D1C/D1D/D1E/D1F: keep the D1A evidence contract isolated, then load visible",'chain comment')
once("countryEvidenceBootstrap:'pex-d1e-1'","countryEvidenceBootstrap:'pex-d1f-1'",'metadata bootstrap')
once("switzerlandLegacyTaxReconciled:true,switzerlandComparatorReconciled:true};","switzerlandLegacyTaxReconciled:true,switzerlandComparatorReconciled:true,singaporeLegacyTaxReconciled:true,singaporeComparatorReconciled:true};",'metadata flags')
p.write_text(s)
