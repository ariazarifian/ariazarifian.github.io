from pathlib import Path
p=Path('atlas-exit/fiscal-finalize.js')
s=p.read_text()
def rep(old,new):
    global s
    if old not in s:
        raise SystemExit('missing patch anchor: '+old[:100])
    s=s.replace(old,new,1)
rep("    singaporeCorpIRAS:{name:'IRAS Singapour · impôt sur les sociétés',url:'https://www.iras.gov.sg/quick-links/tax-rates/corporate-income-tax-rates'},\n    singaporeGstIRAS:{name:'IRAS Singapour · GST',url:'https://www.iras.gov.sg/quick-links/tax-rates/goods-and-services-tax-%28gst%29-rates'}",
    "    singaporeCorpIRAS:{name:'IRAS Singapour · impôt sur les sociétés',url:'https://www.iras.gov.sg/quick-links/tax-rates/corporate-income-tax-rates'},\n    singaporeGstIRAS:{name:'IRAS Singapour · GST',url:'https://www.iras.gov.sg/quick-links/tax-rates/goods-and-services-tax-%28gst%29-rates'},\n    canadaCorpCRA:{name:'CRA Canada · impôt fédéral sur les sociétés',url:'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/corporation-tax-rates.html'},\n    canadaSalesTaxCRA:{name:'CRA Canada · GST/HST et taxes provinciales',url:'https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/3-3-2/place-supply-province-overview.html'}")
rep("  // Territories where a national company-tax number would be misleading.",
    "  // PEX-D1G legacy reconciliation for Canada's federal corporate/sales-tax cards.\n  // Provincial/territorial layers remain separate; these strings are not all-in rates.\n  merge('CAN',{\n    cit:'15 % fédéral général',\n    citScope:'Taux fédéral général net · 9 % fédéral possible pour CCPC éligible à la déduction PME · taux provinciaux/territoriaux en plus',\n    vat:'GST 5 % + HST/PST variables',\n    vatScope:'GST/HST/PST selon province/territoire · aucun taux Canada tout compris',\n    sources:['canadaCorpCRA','canadaSalesTaxCRA'],\n    checked:'CRA · vérifié 21.09.2026'\n  });\n\n  // Territories where a national company-tax number would be misleading.")
rep("  if(window.ATLAS_TAX?.SGP) Object.assign(window.ATLAS_TAX.SGP,singaporeResidentPit);\n  if(window.ATLAS_CATALOG?.SGP) Object.assign(window.ATLAS_CATALOG.SGP,singaporeResidentPit);",
    "  if(window.ATLAS_TAX?.SGP) Object.assign(window.ATLAS_TAX.SGP,singaporeResidentPit);\n  if(window.ATLAS_CATALOG?.SGP) Object.assign(window.ATLAS_CATALOG.SGP,singaporeResidentPit);\n\n  // PEX-D1G Canada: federal and provincial/territorial PIT must remain layered.\n  const canadaLayeredPit={tax:null,taxLabel:'Fédéral + province/territoire',taxYear:'2026 · CRA vérifié 21.09.2026',scope:'PIT fédéral + impôt provincial/territorial séparé',note:'Le barème fédéral 2026 est 14 %, 20,5 %, 26 %, 29 % et 33 %. L’impôt provincial/territorial s’ajoute ; 33 % n’est pas un taux canadien tout compris.',src:null,taxKind:'current-reference'};\n  if(window.ATLAS_TAX?.CAN) Object.assign(window.ATLAS_TAX.CAN,canadaLayeredPit);\n  if(window.ATLAS_CATALOG?.CAN) Object.assign(window.ATLAS_CATALOG.CAN,canadaLayeredPit);")
marker="  function bindAustraliaComparator(){"
canada_cmp="""  function reconcileCanadaComparator(){
    const core=window.ATLAS_COUNTRY_EVIDENCE;
    const can=window.ATLAS_COUNTRY_EVIDENCE_CANADA?.country;
    const table=document.querySelector('#compareTable table');
    if(!core||!can||!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const idx=headers.findIndex(th=>/Canada/i.test(th.textContent||''));
    if(idx<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[idx]||null;
    const set=(label,html)=>{const target=cell(label);if(target&&!(target.dataset.atlasNormalized==='CAN'&&target.innerHTML===html)){target.innerHTML=html;target.dataset.atlasNormalized='CAN';}};
    const sourceHtml=['tax_residency','pit','cit_business','consumption_tax'].map(k=>core.renderSources(can.fields[k])).join('');
    set('Revenu','<span class=\"val\">Fédéral + province/territoire</span><small>2026 fédéral 14–33 % · impôt provincial/territorial séparé · aucun taux tout compris</small>');
    set('Sociétés','<span class=\"val\">15 % fédéral général</span><small>9 % fédéral possible pour CCPC éligible SBD · provinces/territoires en plus</small>');
    set('TVA / consommation','<span class=\"val\">GST/HST/PST selon province</span><small>GST fédérale 5 % dans les juridictions non participantes · HST/PST variables</small>');
    set('Taxes particulières','<small>Résidence fiscale, EIC/autres voies d’immigration, fiscalité provinciale et éligibilité santé restent des objets distincts ; aucune équivalence automatique.</small>');
    set('Sources',sourceHtml);
  }

"""
rep(marker,canada_cmp+marker)
marker="  function loadSingaporeEvidence(){"
canada_bind_load="""  function bindCanadaComparator(){
    const host=document.querySelector('#compareTable');
    if(!host||host.dataset.atlasCanComparatorBound==='true')return;
    host.dataset.atlasCanComparatorBound='true';
    reconcileCanadaComparator();
    new MutationObserver(()=>queueMicrotask(reconcileCanadaComparator)).observe(host,{childList:true,subtree:true});
  }

  function loadCanadaEvidence(){
    if(window.ATLAS_COUNTRY_EVIDENCE_CANADA){bindCanadaComparator();reconcileCanadaComparator();return;}
    const existing=document.querySelector('[data-atlas-country-evidence-canada]');
    if(existing){existing.addEventListener('load',()=>{bindCanadaComparator();reconcileCanadaComparator();},{once:true});return;}
    const canada=document.createElement('script');
    canada.src='country-evidence-canada.js?v=pex-d1g-1';
    canada.async=false;
    canada.dataset.atlasCountryEvidenceCanada='runtime';
    canada.addEventListener('load',()=>{bindCanadaComparator();reconcileCanadaComparator();},{once:true});
    document.head.append(canada);
  }

"""
rep(marker,canada_bind_load+marker)
rep("    if(window.ATLAS_COUNTRY_EVIDENCE_SINGAPORE){bindSingaporeComparator();reconcileSingaporeComparator();return;}","    if(window.ATLAS_COUNTRY_EVIDENCE_SINGAPORE){bindSingaporeComparator();reconcileSingaporeComparator();loadCanadaEvidence();return;}")
rep("    if(existing){existing.addEventListener('load',()=>{bindSingaporeComparator();reconcileSingaporeComparator();},{once:true});return;}","    if(existing){existing.addEventListener('load',()=>{bindSingaporeComparator();reconcileSingaporeComparator();loadCanadaEvidence();},{once:true});return;}")
rep("    singapore.addEventListener('load',()=>{bindSingaporeComparator();reconcileSingaporeComparator();},{once:true});","    singapore.addEventListener('load',()=>{bindSingaporeComparator();reconcileSingaporeComparator();loadCanadaEvidence();},{once:true});")
rep("  // PEX-D1B/D1C/D1D/D1E/D1F: keep the D1A evidence contract isolated, then load visible","  // PEX-D1B/D1C/D1D/D1E/D1F/D1G: keep the D1A evidence contract isolated, then load visible")
rep("countryEvidenceBootstrap:'pex-d1f-1'","countryEvidenceBootstrap:'pex-d1g-1'")
rep("singaporeLegacyTaxReconciled:true,singaporeComparatorReconciled:true};","singaporeLegacyTaxReconciled:true,singaporeComparatorReconciled:true,canadaLegacyTaxReconciled:true,canadaComparatorReconciled:true};")
p.write_text(s)
