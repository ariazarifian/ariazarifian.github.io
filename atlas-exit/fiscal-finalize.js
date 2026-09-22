/* Atlas Expat — final fiscal normalization pass.
   Only closes verified edge cases after the broad PIT/CIT/VAT layers load.
   It never invents a rate for disputed/non-residential territories. */
(()=>{
  'use strict';
  const d=window.ATLAS_COMMERCE;
  if(!d) return;

  Object.assign(d.sources,{
    pwcIvoryCIT:{name:'PwC Côte d’Ivoire · impôt sur les sociétés',url:'https://taxsummaries.pwc.com/ivory-coast/corporate/taxes-on-corporate-income'},
    pwcCongoCIT:{name:'PwC République du Congo · impôt sur les sociétés',url:'https://taxsummaries.pwc.com/republic-of-congo/corporate/taxes-on-corporate-income'},
    namibiaCIT2026:{name:'Namibie · Fiscal Strategy 2025 · réforme IS 2026',url:'https://mof.gov.na/documents/76368/5919961/Fiscal%2BStrategy%2B2025%2Bfinal.pdf/3ff138c2-5c84-1a84-5812-144e2cfe98c3?download=true&t=1743406071481'},
    andorraIGI:{name:'Govern d’Andorra · IGI, taux général 4,5 %',url:'https://www.govern.ad/ca/l/4191561'},
    russiaVAT2026:{name:'FNS Russie · TVA 22 % à compter de 2026',url:'https://www.nalog.gov.ru/new2026/'},
    japanCorpNTA:{name:'NTA Japon · taux de l’impôt sur les sociétés',url:'https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5759.htm'},
    japanConsumptionNTA:{name:'NTA Japon · taxe à la consommation',url:'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6303.htm'}
  });

  function merge(id,row){
    const old=d.countries[id]||{};
    d.countries[id]={
      ...old,
      ...row,
      sources:[...new Set([...(old.sources||[]),...(row.sources||[])])],
      checked:row.checked||old.checked||'16.09.2026'
    };
  }

  // Current corporate-tax corrections / final large-country gaps.
  merge('CIV',{
    cit:'25 %',
    citScope:'Impôt BIC · taux général ; 30 % télécoms/IT/communication',
    sources:['pwcIvoryCIT'],
    checked:'PwC · revue 09.09.2026'
  });
  merge('COG',{
    cit:'30 %',
    citScope:'CIT général · 25 % microfinance/écoles privées · 28 % mines/immobilier',
    sources:['pwcCongoCIT'],
    checked:'PwC · revue 07.08.2026'
  });
  merge('NAM',{
    cit:'28 %',
    citScope:'Sociétés non minières · réforme annoncée effective au 1er avril 2026',
    sources:['namibiaCIT2026'],
    checked:'Stratégie budgétaire officielle · 2026'
  });

  // Final standard consumption-tax gaps.
  merge('AND',{
    vat:'4,5 %',
    vatScope:'IGI · taux général ; 0 / 1 / 2,5 / 9,5 % selon opération',
    sources:['andorraIGI'],
    checked:'Govern d’Andorra · consulté 16.09.2026'
  });
  merge('RUS',{
    vat:'22 %',
    vatScope:'TVA · taux standard depuis le 1er janvier 2026 ; taux réduits distincts',
    sources:['russiaVAT2026'],
    checked:'FNS Russie · 2026'
  });

  // PEX-D1D legacy reconciliation for Japan's corporate/consumption cards.
  // Keep the visible legacy layer current but scoped: these are national/current
  // reference rates, never an all-in effective company or transaction burden.
  merge('JPN',{
    cit:'23,2 %',
    citScope:'Impôt national ordinaire · traitement PME et impôts locaux distincts',
    vat:'10 % standard',
    vatScope:'Taxe à la consommation combinée · 8 % réduit · évolution alimentaire prévue au 01.04.2027',
    sources:['japanCorpNTA','japanConsumptionNTA'],
    checked:'NTA · vérifié 21.09.2026'
  });

  // Territories where a national company-tax number would be misleading.
  const contextual={
    ATF:{cit:'Hors comparaison',citScope:'Territoire non résidentiel standard'},
    ESH:{cit:'Statut disputé',citScope:'Sahara occidental · aucune fiscalité nationale attribuée automatiquement'},
    PRK:{cit:'Données non comparables',citScope:'Corée du Nord · taux société non retenu faute de source suffisamment comparable'},
    XNC:{cit:'Statut disputé',citScope:'Chypre du Nord · aucune donnée de la République de Chypre transposée'},
    XSL:{cit:'Statut disputé',citScope:'Somaliland · aucune donnée somalienne transposée automatiquement'}
  };
  for(const [id,row] of Object.entries(contextual)) merge(id,{...row,checked:'Contexte Atlas · 2026'});

  // PEX-D1B legacy reconciliation: the old Australia scalar was an OECD 2025
  // combined top-rate context (47%). DEX-12 accepted the 2026–27 resident federal
  // schedule with a 45% top marginal band. Explorer's tax layer is explicitly a
  // barème repère, not a full-liability calculator, so the visible scalar now uses
  // the current resident schedule while Medicare levy/offsets stay explicit caveats.
  const australiaResidentPit={
    tax:45,
    taxYear:'2026–27',
    scope:'Barème résident fédéral · Medicare levy distincte',
    note:'Barème résident effectif depuis le 1er juillet 2026 : seuil 18 200 AUD, puis 15 %, 30 %, 37 % et 45 %. Medicare levy et offsets sont distincts ; ce repère n’est pas une charge fiscale totale.',
    src:null,
    taxKind:'current-reference'
  };
  if(window.ATLAS_TAX?.AUS) Object.assign(window.ATLAS_TAX.AUS,australiaResidentPit);
  if(window.ATLAS_CATALOG?.AUS) Object.assign(window.ATLAS_CATALOG.AUS,australiaResidentPit);

  // PEX-D1C Spain reconciliation: keep the map/filter explicitly non-scalar while
  // replacing the stale OECD 48.58% context with the accepted layered IRPF truth.
  // 24.5% is only the top state component and must never become an all-in Spain rate.
  const spainLayeredPit={
    tax:null,
    taxLabel:'État + communauté',
    taxYear:'IRPF 2025 · manuel publié 27.03.2026',
    scope:'IRPF · barème étatique + barème autonome',
    note:'La composante générale de l’État va de 9,5 % à 24,5 % et un barème propre à la communauté autonome s’ajoute. 24,5 % n’est pas un taux supérieur Espagne tout compris.',
    src:null,
    taxKind:'current-reference'
  };
  if(window.ATLAS_TAX?.ESP) Object.assign(window.ATLAS_TAX.ESP,spainLayeredPit);
  if(window.ATLAS_CATALOG?.ESP) Object.assign(window.ATLAS_CATALOG.ESP,spainLayeredPit);

  // PEX-D1D Japan reconciliation: retain 45% only as the national top marginal
  // map/filter reference. Reconstruction special income tax and local inhabitant
  // tax remain distinct and the 2027 change is explicit.
  const japanLayeredPit={
    tax:45,
    taxLabel:'5–45 % national',
    taxYear:'NTA · état du droit 01.04.2026',
    scope:'Impôt national · surtaxe de reconstruction et impôt local distincts',
    note:'Le barème national va de 5 % à 45 %. La surtaxe spéciale de reconstruction est actuellement de 2,1 % de l’impôt national de base et l’impôt local des habitants est distinct ; 45 % n’est pas une charge tout compris. Revalidation obligatoire avant le changement NTA signalé au 01.01.2027.',
    src:null,
    taxKind:'current-reference'
  };
  if(window.ATLAS_TAX?.JPN) Object.assign(window.ATLAS_TAX.JPN,japanLayeredPit);
  if(window.ATLAS_CATALOG?.JPN) Object.assign(window.ATLAS_CATALOG.JPN,japanLayeredPit);

  // Lightweight runtime audit. It runs after script.js exposes AtlasExplorer and
  // records actual visible gaps; it does not alter any fiscal data.
  function audit(){
    const rows=window.AtlasExplorer?.getCountries?.()?.filter(c=>!c.parent)||[];
    if(!rows.length) return false;
    const missingPit=rows.filter(c=>c.tax==null && /non documenté|donnée absente/i.test(`${c.taxLabel||''} ${c.scope||''}`)).map(c=>c.id);
    const missingCit=rows.filter(c=>{const x=d.countries[c.id];return !x?.cit || /à documenter|non renseigné/i.test(x.cit)}).map(c=>c.id);
    const missingVat=rows.filter(c=>{const x=d.countries[c.id];return !x?.vat || /à documenter|non renseigné/i.test(x.vat)}).map(c=>c.id);
    window.ATLAS_FISCAL_AUDIT={destinations:rows.length,missingPit,missingCit,missingVat,checkedAt:new Date().toISOString()};
    return true;
  }
  if(!audit()){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(audit()||tries>160)clearInterval(timer);},50);
  }

  // D1B reconciliation for the legacy comparator is kept in this bridge because
  // comparator rows are owned by the existing Explorer runtime. We identify the
  // Australia column by country name (the UI displays ISO-2 "AU", not internal
  // id "AUS") and replace only the overlapping normalized fiscal cells.
  function reconcileAustraliaComparator(){
    const core=window.ATLAS_COUNTRY_EVIDENCE;
    const aus=window.ATLAS_COUNTRY_EVIDENCE_AUSTRALIA?.country;
    const table=document.querySelector('#compareTable table');
    if(!core||!aus||!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const ausIndex=headers.findIndex(th=>/Australie/i.test(th.textContent||''));
    if(ausIndex<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[ausIndex]||null;
    const set=(label,html)=>{const target=cell(label);if(target&&!(target.dataset.atlasNormalized==='AUS'&&target.innerHTML===html)){target.innerHTML=html;target.dataset.atlasNormalized='AUS';}};
    const sourceHtml=['pit','cit_business','consumption_tax'].map(k=>core.renderSources(aus.fields[k])).join('');
    set('Revenu','<span class="val">15–45 %</span><small>Résident 2026–27 · seuil 18 200 AUD · Medicare levy et offsets distincts</small>');
    set('Sociétés','<span class="val">30 % général · 25 % si éligible</span><small>Base-rate entities sous conditions</small>');
    set('TVA / consommation','<span class="val">10 %</span><small>GST standard · exemptions et règles d’inscription distinctes</small>');
    set('Taxes particulières','<small>Les périmètres fiscal, Medicare, statut migratoire et GST restent distincts ; aucune addition automatique.</small>');
    set('Sources',sourceHtml);
  }

  function reconcileSpainComparator(){
    const core=window.ATLAS_COUNTRY_EVIDENCE;
    const esp=window.ATLAS_COUNTRY_EVIDENCE_SPAIN?.country;
    const table=document.querySelector('#compareTable table');
    if(!core||!esp||!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const espIndex=headers.findIndex(th=>/Espagne/i.test(th.textContent||''));
    if(espIndex<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[espIndex]||null;
    const set=(label,html)=>{const target=cell(label);if(target&&!(target.dataset.atlasNormalized==='ESP'&&target.innerHTML===html)){target.innerHTML=html;target.dataset.atlasNormalized='ESP';}};
    const sourceHtml=['tax_residency','pit','cit_business','consumption_tax'].map(k=>core.renderSources(esp.fields[k])).join('');
    set('Revenu','<span class="val">État + communauté autonome</span><small>Composante étatique 9,5–24,5 % · barème autonome additionnel variable · aucun taux national tout compris</small>');
    set('Sociétés','<span class="val">25 % général</span><small>2026 : micro &lt; 1 M€ — 19 % sur les premiers 50 000 € puis 21 % ; certaines petites entités éligibles 23 %</small>');
    set('TVA / consommation','<span class="val">21 % standard</span><small>10 % / 4 % et certaines catégories à 0 % selon l’opération</small>');
    set('Taxes particulières','<small>Résidence fiscale, séjour UE, couverture santé et assiette d’impôt restent des objets distincts ; aucune addition ou équivalence automatique.</small>');
    set('Sources',sourceHtml);
  }

  function reconcileJapanComparator(){
    const core=window.ATLAS_COUNTRY_EVIDENCE;
    const jpn=window.ATLAS_COUNTRY_EVIDENCE_JAPAN?.country;
    const table=document.querySelector('#compareTable table');
    if(!core||!jpn||!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const jpnIndex=headers.findIndex(th=>/Japon/i.test(th.textContent||''));
    if(jpnIndex<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[jpnIndex]||null;
    const set=(label,html)=>{const target=cell(label);if(target&&!(target.dataset.atlasNormalized==='JPN'&&target.innerHTML===html)){target.innerHTML=html;target.dataset.atlasNormalized='JPN';}};
    const sourceHtml=['tax_residency','pit','cit_business','consumption_tax'].map(k=>core.renderSources(jpn.fields[k])).join('');
    set('Revenu','<span class="val">5–45 % national</span><small>Surtaxe de reconstruction 2,1 % de l’impôt de base + impôt local des habitants distincts · changement signalé au 01.01.2027</small>');
    set('Sociétés','<span class="val">23,2 % national ordinaire</span><small>Traitement réduit possible pour certaines petites sociétés sur les premiers 8 M¥ · impôts locaux distincts</small>');
    set('TVA / consommation','<span class="val">10 % standard · 8 % réduit</span><small>Catégorie sensible · évolution alimentaire signalée au 01.04.2027</small>');
    set('Taxes particulières','<small>Résidence fiscale, statut migratoire, surtaxe nationale, impôt local et assurance santé restent des objets distincts ; aucune addition ou équivalence automatique.</small>');
    set('Sources',sourceHtml);
  }

  function bindAustraliaComparator(){
    const host=document.querySelector('#compareTable');
    if(!host||host.dataset.atlasAusComparatorBound==='true')return;
    host.dataset.atlasAusComparatorBound='true';
    reconcileAustraliaComparator();
    new MutationObserver(()=>queueMicrotask(reconcileAustraliaComparator)).observe(host,{childList:true,subtree:true});
  }

  function bindSpainComparator(){
    const host=document.querySelector('#compareTable');
    if(!host||host.dataset.atlasEspComparatorBound==='true')return;
    host.dataset.atlasEspComparatorBound='true';
    reconcileSpainComparator();
    new MutationObserver(()=>queueMicrotask(reconcileSpainComparator)).observe(host,{childList:true,subtree:true});
  }

  function bindJapanComparator(){
    const host=document.querySelector('#compareTable');
    if(!host||host.dataset.atlasJpnComparatorBound==='true')return;
    host.dataset.atlasJpnComparatorBound='true';
    reconcileJapanComparator();
    new MutationObserver(()=>queueMicrotask(reconcileJapanComparator)).observe(host,{childList:true,subtree:true});
  }

  function loadJapanEvidence(){
    if(window.ATLAS_COUNTRY_EVIDENCE_JAPAN){bindJapanComparator();reconcileJapanComparator();return;}
    const existing=document.querySelector('[data-atlas-country-evidence-japan]');
    if(existing){existing.addEventListener('load',()=>{bindJapanComparator();reconcileJapanComparator();},{once:true});return;}
    const japan=document.createElement('script');
    japan.src='country-evidence-japan.js?v=pex-d1d-1';
    japan.async=false;
    japan.dataset.atlasCountryEvidenceJapan='runtime';
    japan.addEventListener('load',()=>{bindJapanComparator();reconcileJapanComparator();},{once:true});
    document.head.append(japan);
  }

  function loadSpainEvidence(){
    if(window.ATLAS_COUNTRY_EVIDENCE_SPAIN){bindSpainComparator();reconcileSpainComparator();loadJapanEvidence();return;}
    const existing=document.querySelector('[data-atlas-country-evidence-spain]');
    if(existing){existing.addEventListener('load',()=>{bindSpainComparator();reconcileSpainComparator();loadJapanEvidence();},{once:true});return;}
    const spain=document.createElement('script');
    spain.src='country-evidence-spain.js?v=pex-d1c-1';
    spain.async=false;
    spain.dataset.atlasCountryEvidenceSpain='runtime';
    spain.addEventListener('load',()=>{bindSpainComparator();reconcileSpainComparator();loadJapanEvidence();},{once:true});
    document.head.append(spain);
  }

  // PEX-D1B/D1C/D1D: keep the D1A evidence contract isolated, then load visible
  // country modules sequentially so each immutable merge sees the prior registry.
  function loadAustraliaEvidence(){
    if(window.ATLAS_COUNTRY_EVIDENCE_AUSTRALIA){bindAustraliaComparator();reconcileAustraliaComparator();loadSpainEvidence();return;}
    const existing=document.querySelector('[data-atlas-country-evidence-australia]');
    if(existing){existing.addEventListener('load',()=>{bindAustraliaComparator();reconcileAustraliaComparator();loadSpainEvidence();},{once:true});return;}
    const australia=document.createElement('script');
    australia.src='country-evidence-australia.js?v=pex-d1b-1';
    australia.async=false;
    australia.dataset.atlasCountryEvidenceAustralia='runtime';
    australia.addEventListener('load',()=>{bindAustraliaComparator();reconcileAustraliaComparator();loadSpainEvidence();},{once:true});
    document.head.append(australia);
  }

  function loadCountryEvidence(){
    if(window.ATLAS_COUNTRY_EVIDENCE){loadAustraliaEvidence();return;}
    const existing=document.querySelector('[data-atlas-country-evidence="runtime"]');
    if(existing){existing.addEventListener('load',loadAustraliaEvidence,{once:true});return;}
    if(!document.querySelector('[data-atlas-country-evidence="style"]')){
      const css=document.createElement('link');
      css.rel='stylesheet';css.href='atlas-country-evidence.css?v=pex-d0-1';css.dataset.atlasCountryEvidence='style';
      document.head.append(css);
    }
    const script=document.createElement('script');
    script.src='country-evidence.js?v=pex-d1a-1';script.async=false;script.dataset.atlasCountryEvidence='runtime';
    script.addEventListener('load',loadAustraliaEvidence,{once:true});
    document.head.append(script);
  }
  loadCountryEvidence();

  window.ATLAS_FISCAL_FINALIZE={loadedAt:'2026-09-16',corporateFixes:['CIV','COG','NAM'],consumptionFixes:['AND','RUS'],contextualCorporate:Object.keys(contextual),countryEvidenceBootstrap:'pex-d1d-1',australiaLegacyPitReconciled:true,australiaComparatorReconciled:true,spainLegacyPitReconciled:true,spainComparatorReconciled:true,japanLegacyTaxReconciled:true,japanComparatorReconciled:true};
})();
