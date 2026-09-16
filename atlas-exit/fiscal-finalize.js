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
    russiaVAT2026:{name:'FNS Russie · TVA 22 % à compter de 2026',url:'https://www.nalog.gov.ru/new2026/'}
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

  // Territories where a national company-tax number would be misleading.
  const contextual={
    ATF:{cit:'Hors comparaison',citScope:'Territoire non résidentiel standard'},
    ESH:{cit:'Statut disputé',citScope:'Sahara occidental · aucune fiscalité nationale attribuée automatiquement'},
    PRK:{cit:'Données non comparables',citScope:'Corée du Nord · taux société non retenu faute de source suffisamment comparable'},
    XNC:{cit:'Statut disputé',citScope:'Chypre du Nord · aucune donnée de la République de Chypre transposée'},
    XSL:{cit:'Statut disputé',citScope:'Somaliland · aucune donnée somalienne transposée automatiquement'}
  };
  for(const [id,row] of Object.entries(contextual)) merge(id,{...row,checked:'Contexte Atlas · 2026'});

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

  window.ATLAS_FISCAL_FINALIZE={loadedAt:'2026-09-16',corporateFixes:['CIV','COG','NAM'],consumptionFixes:['AND','RUS'],contextualCorporate:Object.keys(contextual)};
})();
