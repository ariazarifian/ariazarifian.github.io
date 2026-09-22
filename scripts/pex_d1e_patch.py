from pathlib import Path

p = Path('atlas-exit/fiscal-finalize.js')
s = p.read_text()

def once(old, new, label):
    global s
    count = s.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one match, got {count}')
    s = s.replace(old, new, 1)

once(
    "    japanCorpNTA:{name:'NTA Japon · taux de l’impôt sur les sociétés',url:'https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5759.htm'},\n    japanConsumptionNTA:{name:'NTA Japon · taxe à la consommation',url:'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6303.htm'}",
    "    japanCorpNTA:{name:'NTA Japon · taux de l’impôt sur les sociétés',url:'https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5759.htm'},\n    japanConsumptionNTA:{name:'NTA Japon · taxe à la consommation',url:'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6303.htm'},\n    switzerlandCorpFTA:{name:'AFC Suisse · système fiscal · sociétés',url:'https://www.estv.admin.ch/dam/en/sd-web/i8eiHb5Gk0xl/ch-steuersystem.pdf'},\n    switzerlandVatFTA:{name:'AFC Suisse · taux de TVA',url:'https://www.estv.admin.ch/en/vat-rates-switzerland'}",
    'sources',
)

once(
    "  merge('JPN',{\n    cit:'23,2 %',\n    citScope:'Impôt national ordinaire · traitement PME et impôts locaux distincts',\n    vat:'10 % standard',\n    vatScope:'Taxe à la consommation combinée · 8 % réduit · évolution alimentaire prévue au 01.04.2027',\n    sources:['japanCorpNTA','japanConsumptionNTA'],\n    checked:'NTA · vérifié 21.09.2026'\n  });",
    "  merge('JPN',{\n    cit:'23,2 %',\n    citScope:'Impôt national ordinaire · traitement PME et impôts locaux distincts',\n    vat:'10 % standard',\n    vatScope:'Taxe à la consommation combinée · 8 % réduit · évolution alimentaire prévue au 01.04.2027',\n    sources:['japanCorpNTA','japanConsumptionNTA'],\n    checked:'NTA · vérifié 21.09.2026'\n  });\n\n  // PEX-D1E legacy reconciliation for Switzerland's company/VAT cards.\n  // 8.5% is only the federal net-profit layer; cantonal/communal taxes remain separate.\n  merge('CHE',{\n    cit:'8,5 % fédéral',\n    citScope:'Bénéfice net · impôts cantonaux/communaux en plus · aucun taux tout compris',\n    vat:'8,1 % standard',\n    vatScope:'TVA · 2,6 % réduit · 3,8 % hébergement',\n    sources:['switzerlandCorpFTA','switzerlandVatFTA'],\n    checked:'AFC · vérifié 21.09.2026'\n  });",
    'CHE commerce merge',
)

once(
    "  if(window.ATLAS_TAX?.JPN) Object.assign(window.ATLAS_TAX.JPN,japanLayeredPit);\n  if(window.ATLAS_CATALOG?.JPN) Object.assign(window.ATLAS_CATALOG.JPN,japanLayeredPit);",
    "  if(window.ATLAS_TAX?.JPN) Object.assign(window.ATLAS_TAX.JPN,japanLayeredPit);\n  if(window.ATLAS_CATALOG?.JPN) Object.assign(window.ATLAS_CATALOG.JPN,japanLayeredPit);\n\n  // PEX-D1E Switzerland reconciliation: tax remains intentionally non-scalar.\n  // Federal, cantonal and communal PIT layers must not be collapsed into one rate.\n  const switzerlandLayeredPit={\n    tax:null,\n    taxLabel:'Fédéral + canton + commune',\n    taxYear:'AFC · vérifié 21.09.2026',\n    scope:'Impôt sur le revenu · trois niveaux distincts',\n    note:'La charge dépend du canton, de la commune et de la situation personnelle. Aucun taux suisse tout compris n’est calculé ; la réforme de l’imposition individuelle prévue pour 2032 n’est pas effective en 2026.',\n    src:null,\n    taxKind:'current-reference'\n  };\n  if(window.ATLAS_TAX?.CHE) Object.assign(window.ATLAS_TAX.CHE,switzerlandLayeredPit);\n  if(window.ATLAS_CATALOG?.CHE) Object.assign(window.ATLAS_CATALOG.CHE,switzerlandLayeredPit);",
    'CHE PIT bridge',
)

marker = "  function bindAustraliaComparator(){"
block = '''  function reconcileSwitzerlandComparator(){
    const core=window.ATLAS_COUNTRY_EVIDENCE;
    const che=window.ATLAS_COUNTRY_EVIDENCE_SWITZERLAND?.country;
    const table=document.querySelector('#compareTable table');
    if(!core||!che||!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const cheIndex=headers.findIndex(th=>/Suisse/i.test(th.textContent||''));
    if(cheIndex<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[cheIndex]||null;
    const set=(label,html)=>{const target=cell(label);if(target&&!(target.dataset.atlasNormalized==='CHE'&&target.innerHTML===html)){target.innerHTML=html;target.dataset.atlasNormalized='CHE';}};
    const sourceHtml=['tax_residency','pit','cit_business','consumption_tax'].map(k=>core.renderSources(che.fields[k])).join('');
    set('Revenu','<span class="val">Fédéral + canton + commune</span><small>Aucun taux suisse tout compris · canton, commune et situation personnelle déterminants</small>');
    set('Sociétés','<span class="val">8,5 % fédéral</span><small>Impôts cantonaux/communaux en plus · localisation déterminante</small>');
    set('TVA / consommation','<span class="val">8,1 % standard</span><small>2,6 % réduit · 3,8 % hébergement</small>');
    set('Taxes particulières','<small>Résidence fiscale, libre circulation, impôts cantonaux/communaux et assurance maladie restent des objets distincts ; aucune addition automatique.</small>');
    set('Sources',sourceHtml);
  }

'''
once(marker, block + marker, 'CHE comparator')

marker = "  function loadJapanEvidence(){"
block = '''  function bindSwitzerlandComparator(){
    const host=document.querySelector('#compareTable');
    if(!host||host.dataset.atlasCheComparatorBound==='true')return;
    host.dataset.atlasCheComparatorBound='true';
    reconcileSwitzerlandComparator();
    new MutationObserver(()=>queueMicrotask(reconcileSwitzerlandComparator)).observe(host,{childList:true,subtree:true});
  }

  function loadSwitzerlandEvidence(){
    if(window.ATLAS_COUNTRY_EVIDENCE_SWITZERLAND){bindSwitzerlandComparator();reconcileSwitzerlandComparator();return;}
    const existing=document.querySelector('[data-atlas-country-evidence-switzerland]');
    if(existing){existing.addEventListener('load',()=>{bindSwitzerlandComparator();reconcileSwitzerlandComparator();},{once:true});return;}
    const switzerland=document.createElement('script');
    switzerland.src='country-evidence-switzerland.js?v=pex-d1e-1';
    switzerland.async=false;
    switzerland.dataset.atlasCountryEvidenceSwitzerland='runtime';
    switzerland.addEventListener('load',()=>{bindSwitzerlandComparator();reconcileSwitzerlandComparator();},{once:true});
    document.head.append(switzerland);
  }

'''
once(marker, block + marker, 'CHE loader')

once(
    "  function loadJapanEvidence(){\n    if(window.ATLAS_COUNTRY_EVIDENCE_JAPAN){bindJapanComparator();reconcileJapanComparator();return;}\n    const existing=document.querySelector('[data-atlas-country-evidence-japan]');\n    if(existing){existing.addEventListener('load',()=>{bindJapanComparator();reconcileJapanComparator();},{once:true});return;}\n    const japan=document.createElement('script');\n    japan.src='country-evidence-japan.js?v=pex-d1d-1';\n    japan.async=false;\n    japan.dataset.atlasCountryEvidenceJapan='runtime';\n    japan.addEventListener('load',()=>{bindJapanComparator();reconcileJapanComparator();},{once:true});\n    document.head.append(japan);\n  }",
    "  function loadJapanEvidence(){\n    if(window.ATLAS_COUNTRY_EVIDENCE_JAPAN){bindJapanComparator();reconcileJapanComparator();loadSwitzerlandEvidence();return;}\n    const existing=document.querySelector('[data-atlas-country-evidence-japan]');\n    if(existing){existing.addEventListener('load',()=>{bindJapanComparator();reconcileJapanComparator();loadSwitzerlandEvidence();},{once:true});return;}\n    const japan=document.createElement('script');\n    japan.src='country-evidence-japan.js?v=pex-d1d-1';\n    japan.async=false;\n    japan.dataset.atlasCountryEvidenceJapan='runtime';\n    japan.addEventListener('load',()=>{bindJapanComparator();reconcileJapanComparator();loadSwitzerlandEvidence();},{once:true});\n    document.head.append(japan);\n  }",
    'Japan-to-CHE chain',
)

once(
    "  // PEX-D1B/D1C/D1D: keep the D1A evidence contract isolated, then load visible\n  // country modules sequentially so each immutable merge sees the prior registry.",
    "  // PEX-D1B/D1C/D1D/D1E: keep the D1A evidence contract isolated, then load visible\n  // country modules sequentially so each immutable merge sees the prior registry.",
    'chain comment',
)

once(
    "  window.ATLAS_FISCAL_FINALIZE={loadedAt:'2026-09-16',corporateFixes:['CIV','COG','NAM'],consumptionFixes:['AND','RUS'],contextualCorporate:Object.keys(contextual),countryEvidenceBootstrap:'pex-d1d-1',australiaLegacyPitReconciled:true,australiaComparatorReconciled:true,spainLegacyPitReconciled:true,spainComparatorReconciled:true,japanLegacyTaxReconciled:true,japanComparatorReconciled:true};",
    "  window.ATLAS_FISCAL_FINALIZE={loadedAt:'2026-09-16',corporateFixes:['CIV','COG','NAM'],consumptionFixes:['AND','RUS'],contextualCorporate:Object.keys(contextual),countryEvidenceBootstrap:'pex-d1e-1',australiaLegacyPitReconciled:true,australiaComparatorReconciled:true,spainLegacyPitReconciled:true,spainComparatorReconciled:true,japanLegacyTaxReconciled:true,japanComparatorReconciled:true,switzerlandLegacyTaxReconciled:true,switzerlandComparatorReconciled:true};",
    'finalize metadata',
)

p.write_text(s)
