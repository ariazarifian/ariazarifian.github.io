/* PEX-D1I — Germany normalized country evidence. DEX-21 accepted 2026-09-22; DEU-05 locator correction Chief-approved 2026-09-23. */
(function bootGermany(root){
'use strict';
if(!root||!root.document)return;
let attempts=0;
function boot(){
  const core=root.ATLAS_COUNTRY_EVIDENCE;
  if(!core){if(attempts++<200)root.setTimeout(boot,40);return;}
  if(root.ATLAS_COUNTRY_EVIDENCE_GERMANY)return;

  const freeze=o=>Object.freeze(o);
  const src=(owner,locator,sourceClass,meta={})=>freeze({owner,locator,sourceClass,...meta});
  const fresh=(state,cadence,trigger)=>freeze({state,cadence,trigger});
  const record=o=>freeze(o);
  const DEU=freeze({
    country:'Allemagne',iso3:'DEU',integrationState:'published',schemaVersion:'country-evidence-v1',evidenceBatch:'DEX-21',acceptedOn:'2026-09-22',
    existingContext:freeze({
      mode:'passthrough-with-reconciliation',
      keys:['population','gdpPerCapita','stability','tax','corporateTax','consumptionTax','residence'],
      legacyTaxContext:freeze({
        partial:['pit','cit_business','consumption_tax','residence_visa'],
        missing:['tax_residency','cost_context','healthcare','safety_context'],
        use:'carte et filtres contextuels uniquement après réconciliation',
        excludedFrom:['inspector','comparator'],
        reason:'Le module normalisé DEX-21 devient la seule vérité utilisateur pour les huit champs.'
      })
    }),
    fields:freeze({
      tax_residency:record({
        state:'READY_FOR_PRODUCT',
        headline:'Domicile / séjour habituel · > 6 mois ≠ règle 183 jours',
        claim:'German tax residence is not a simple 183-day rule. AO sections 8 and 9 use domicile and habitual-abode concepts; a continuous stay of more than six months is generally treated as habitual abode from the beginning, subject to statutory exceptions for certain temporary-purpose stays.',
        summary:'La résidence repose sur le domicile ou le séjour habituel ; un séjour continu de plus de six mois peut créer ce dernier, sous exceptions légales.',
        jurisdiction:'Allemagne · personne physique',scope:'German individual tax residence',verifiedOn:'2026-09-21',sourceVintage:'current statute',
        sources:freeze([
          src('Bundesministerium der Justiz / Gesetze im Internet','https://www.gesetze-im-internet.de/ao_1977/__8.html','PRIMARY_STATUTE',{label:'AO § 8 · Wohnsitz'}),
          src('Bundesministerium der Justiz / Gesetze im Internet','https://www.gesetze-im-internet.de/ao_1977/__9.html','PRIMARY_STATUTE',{label:'AO § 9 · Gewöhnlicher Aufenthalt'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+EVENT','AO §§8–9 amendment or treaty change'),
        caveat:'Domicile and habitual abode are distinct tests; more than six months is not a universal 183-day shorthand and statutory exceptions apply.',
        structure:freeze({domicileTest:true,habitualAbodeTest:true,continuousStayMoreThanSixMonths:true,statutoryTemporaryPurposeExceptions:true,universal183DayRule:false})
      }),
      pit:record({
        state:'READY_FOR_PRODUCT',
        headline:'Barème 2026 progressif · 42 % puis 45 %',
        claim:'For 2026, the official section 32a tariff has a EUR 12,348 basic allowance, progressive zones, a 42% formula from EUR 69,879 through EUR 277,825, and a 45% formula from EUR 277,826; the statutory formula and personal circumstances matter.',
        summary:'Abattement de base 12 348 € ; 42 % de 69 879 à 277 825 €, puis 45 % dès 277 826 €, selon formule et situation.',
        jurisdiction:'Allemagne · PIT',scope:'German federal individual income-tax tariff',verifiedOn:'2026-09-21',sourceVintage:'2026 tariff',
        source:src('Bundesministerium der Finanzen','https://esth.bundesfinanzministerium.de/lsth/2026/A-Einkommensteuergesetz/IV-Tarif-31-34b/Paragraf-32a/inhalt.html','PRIMARY_FINANCE/TAX_AUTHORITY',{label:'BMF · EStG § 32a · tarif 2026'}),
        freshness:fresh('CURRENT','ANNUAL+TAX_YEAR','new tax-year tariff or section 32a amendment'),
        caveat:'Do not expose only the 45% top rate as a universal burden; the statutory formula and personal circumstances matter, and solidarity surcharge/church tax are separate.',
        structure:freeze({taxYear:2026,basicAllowanceEUR:12348,rate42FromEUR:69879,rate42ThroughEUR:277825,rate45FromEUR:277826,progressiveFormula:true,solidaritySurchargeSeparate:true,churchTaxSeparate:true,singleScalarForbidden:true})
      }),
      cit_business:record({
        state:'READY_FOR_PRODUCT',
        headline:'IS 15 % + solidarité · Gewerbesteuer municipale variable',
        claim:'German corporate income tax is 15% plus the solidarity surcharge at the federal layer, while municipal trade tax also applies and varies by municipality; there is no single all-in Germany company-tax rate.',
        summary:'L’IS fédéral est de 15 % plus la solidarité ; la Gewerbesteuer s’ajoute avec un taux fixé localement, donc pas de taux national tout compris.',
        jurisdiction:'Allemagne · sociétés',scope:'Federal corporation tax plus municipal trade tax',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('Germany Trade & Invest','https://www.gtai.de/en/invest/investment-guide/corporate-taxation-in-germany','PRIMARY_GOV/INVESTMENT',{label:'GTAI · Corporate Taxation in Germany'}),
        freshness:fresh('CURRENT','ANNUAL+EVENT','corporate-income-tax, solidarity-surcharge or trade-tax rule change'),
        caveat:'15% is only the federal corporate-income-tax rate; solidarity surcharge and municipality-dependent trade tax remain separate.',
        structure:freeze({corporateIncomeTaxRate:15,solidaritySurchargeOnCorporateTax:true,municipalTradeTaxApplies:true,municipalTradeTaxVaries:true,allInScalarForbidden:true})
      }),
      consumption_tax:record({
        state:'READY_FOR_PRODUCT',
        headline:'TVA 19 % standard · 7 % seulement pour catégories qualifiantes',
        claim:'Germany applies a 19% standard VAT rate and a 7% reduced rate to qualifying supplies; reduced-rate eligibility is category-specific and remains distinct from the standard rate.',
        summary:'Le taux standard est de 19 % ; le 7 % réduit ne concerne que des fournitures qualifiantes et ne remplace pas le taux standard.',
        jurisdiction:'Allemagne · TVA',scope:'German VAT',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('Germany Trade & Invest','https://www.gtai.de/en/invest/investment-guide/value-added-tax-561538','PRIMARY_GOV/INVESTMENT',{label:'GTAI · Value-added Tax'}),
        freshness:fresh('CURRENT','ANNUAL+EVENT','VAT rate or category-rule change'),
        caveat:'19% is the standard rate; 7% depends on qualifying categories and exemptions/other treatments remain distinct.',
        structure:freeze({standardRate:19,reducedRate:7,reducedRateCategoryDependent:true,categorySensitive:true})
      }),
      cost_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'3 032 € / mois · ménage moyen EVS 2023',
        claim:'Destatis EVS 2023 reports average private-consumption expenditure of EUR 3,032 per household and month, including EUR 1,137 for housing, energy and dwelling maintenance, EUR 436 for food/beverages/tobacco and EUR 361 for transport.',
        summary:'EVS 2023 : 3 032 € par ménage/mois, dont 1 137 € logement-énergie-entretien, 436 € alimentation/boissons/tabac et 361 € transport.',
        jurisdiction:'Allemagne · ménages privés',scope:'German private households',verifiedOn:'2026-09-21',sourceVintage:'EVS 2023',
        source:src('Statistisches Bundesamt (Destatis)','https://www.destatis.de/EN/Themes/Society-Environment/Income-Consumption-Living-Conditions/Consumption-Expenditure/Tables/liste-germany.html','PRIMARY_OFFICIAL_STATISTICS',{label:'Destatis · consommation des ménages · Allemagne'}),
        freshness:fresh('CURRENT','ON_NEW_SURVEY','next EVS or household-consumption release'),
        caveat:'This is a household average, not an expatriate or single-person budget; household size and geography materially change spending.',
        structure:freeze({survey:'EVS',year:2023,population:'private_households',averageMonthlyHouseholdConsumptionEUR:3032,housingEnergyMaintenanceEUR:1137,foodBeveragesTobaccoEUR:436,transportEUR:361,expatBudget:false,singlePersonBudget:false,geographyAndHouseholdSizeMatter:true})
      }),
      residence_visa:record({
        state:'READY_FOR_PRODUCT',
        headline:'Citoyen UE : vivre / travailler sans visa · Anmeldung distincte',
        claim:'French and other EU citizens can live and work in Germany under EU free movement without a work visa or residence permit for employment, while ordinary residence-registration obligations remain separate.',
        summary:'Un Français peut vivre et travailler en Allemagne au titre de la libre circulation UE sans visa de travail ; l’enregistrement de résidence reste une obligation distincte.',
        jurisdiction:'France / UE → Allemagne',scope:'EU citizen residence and work orientation',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('Federal Government / Make it in Germany','https://www.make-it-in-germany.com/en/working-in-germany/information-eu-citizens','PRIMARY_GOV/IMMIGRATION',{label:'Make it in Germany · EU citizens'}),
        freshness:fresh('CURRENT','90D+EVENT','EU free-movement or German registration-rule change'),
        caveat:'Free movement removes the work-visa/residence-permit requirement for EU employment; ordinary registration and status-specific obligations remain separate.',
        structure:freeze({origin:'France/EU',euFreeMovement:true,workVisaRequiredForEuEmployment:false,residencePermitRequiredForEuEmployment:false,residenceRegistrationSeparate:true,eligibilityDetermination:false})
      }),
      healthcare:record({
        state:'READY_FOR_PRODUCT',
        headline:'Assurance obligatoire · GKV / PKV selon emploi, revenu, statut',
        claim:'Health insurance coverage is compulsory in Germany, while access to statutory GKV versus private PKV depends on employment, income and legal/status conditions; Germany must not be represented as everyone automatically being in GKV.',
        summary:'L’assurance santé est obligatoire ; le régime GKV ou PKV dépend notamment de l’emploi, du revenu et du statut, sans GKV automatique pour tous.',
        jurisdiction:'Allemagne · assurance maladie',scope:'German statutory/private health-insurance status',verifiedOn:'2026-09-21',sourceVintage:'current',
        sources:freeze([
          src('Bundesministerium für Gesundheit','https://www.bundesgesundheitsministerium.de/gesetzlich-versicherte','PRIMARY_HEALTH_AUTHORITY',{label:'BMG · assurés de la GKV'}),
          src('Bundesministerium für Gesundheit','https://www.bundesgesundheitsministerium.de/private-krankenversicherung','PRIMARY_HEALTH_AUTHORITY',{label:'BMG · assurance maladie privée'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+REFORM','GKV/PKV eligibility or health-insurance reform'),
        caveat:'Coverage is compulsory, but GKV/PKV eligibility and obligations are status-dependent; do not assume automatic GKV membership for everyone.',
        structure:freeze({healthInsuranceCompulsory:true,statutoryGkvExists:true,privatePkvExists:true,employmentIncomeStatusMatter:true,automaticGkvForEveryone:false})
      }),
      safety_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'Vigilance normale · contexte, pas score',
        claim:'France Diplomatie Germany guidance verified against the 15 September 2026 advice state indicates normal vigilance overall; safety remains contextual and should not be converted into a country safety scalar.',
        summary:'France Diplomatie indique une vigilance normale dans l’ensemble ; ce repère daté reste contextuel et ne devient pas une note de sécurité unique.',
        jurisdiction:'Allemagne · voyageurs français',scope:'Germany safety/travel context for French users',verifiedOn:'2026-09-21',sourceVintage:'2026-09-15',
        source:src('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/allemagne/conseils-aux-voyageurs-securite','PRIMARY_CONSULAR',{label:'France Diplomatie · Allemagne · sécurité'}),
        freshness:fresh('CURRENT','90D+EVENT','travel-advice or material security-context update'),
        caveat:'Normal vigilance overall; this dated travel context is not a general safety score or an individual risk probability.',
        structure:freeze({vigilance:'normal',timeSensitive:true,contextual:true,scalarScoreForbidden:true})
      })
    })
  });

  const validation=core.validateCountry(DEU);
  if(!validation.ok){console.error('ATLAS PEX-D1I Germany contract invalid',validation);return;}
  const mergedCountries=freeze({...core.countries,DEU});
  root.ATLAS_COUNTRY_EVIDENCE=freeze({...core,countries:mergedCountries});
  root.ATLAS_COUNTRY_EVIDENCE_GERMANY=freeze({country:DEU,validation,legacyPolicy:DEU.existingContext.legacyTaxContext});

  function reconcileLegacyData(){
    const pit={tax:null,taxLabel:'Progressif · 42 % / 45 %',taxYear:'2026 · BMF vérifié 21.09.2026',scope:'Barème fédéral · formule progressive · suppléments distincts',note:'Abattement de base 12 348 € ; 42 % de 69 879 € à 277 825 €, puis 45 % dès 277 826 €. Solidarité et impôt cultuel restent distincts selon le cas.',src:null,taxKind:'current-reference'};
    if(root.ATLAS_TAX?.DEU)Object.assign(root.ATLAS_TAX.DEU,pit);
    if(root.ATLAS_CATALOG?.DEU)Object.assign(root.ATLAS_CATALOG.DEU,pit);
  }
  reconcileLegacyData();

  function reconcileExplorerRuntime(){
    const explorer=root.AtlasExplorer;
    const country=explorer?.getCountries?.().find(c=>c.id==='DEU');
    if(!country)return false;
    Object.assign(country,{tax:null,taxLabel:'Progressif · 42 % / 45 %',taxYear:'2026 · BMF vérifié 21.09.2026',scope:'Barème fédéral · formule progressive · suppléments distincts',note:'Abattement de base 12 348 € ; 42 % de 69 879 € à 277 825 €, puis 45 % dès 277 826 €. Solidarité et impôt cultuel restent distincts selon le cas.',src:null,taxKind:'current-reference'});
    const search=root.document.querySelector('#countrySearch');
    if(search)search.dispatchEvent(new Event('input',{bubbles:true}));
    return true;
  }
  (function scheduleExplorerReconcile(tries=0){if(reconcileExplorerRuntime())return;if(tries<200)root.setTimeout(()=>scheduleExplorerReconcile(tries+1),40);})();

  const document=root.document;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateLabel=value=>{const [y,m,d]=String(value).split('-');return y&&m&&d?`${d}.${m}.${y}`:value;};
  const stateLabel=state=>state==='READY_WITH_CAVEAT'?'Vérifié · limites':state==='READY_FOR_PRODUCT'?'Vérifié':'À revalider';
  const activeCountryId=container=>container?.querySelector('[data-save]')?.getAttribute('data-save')||null;
  function rowMarkup(key,r){const display=core.safeDisplay(r);return `<article class="atlas-evidence__row" data-evidence-field="${esc(key)}" data-evidence-state="${esc(r.state)}"><div class="atlas-evidence__row-head"><span>${esc(core.fieldLabels[key]||key)}</span><small>${esc(stateLabel(r.state))}</small></div><strong>${esc(display.headline)}</strong><p>${esc(display.summary)}</p><details class="atlas-evidence__source"><summary>Source & limites</summary><p class="micro">${esc(r.jurisdiction)} · vérifié ${esc(dateLabel(r.verifiedOn))} · ${esc(r.freshness.cadence)}</p><p class="micro">${esc(r.caveat)}</p>${core.renderSources(r)}</details></article>`;}
  function panelMarkup(){const fiscal=['tax_residency','pit','cit_business','consumption_tax'],practical=['cost_context','residence_visa','healthcare','safety_context'];return `<details class="context-disclosure atlas-evidence" data-atlas-germany-evidence data-country="DEU"><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">EVIDENCE LAYER · ${esc(DEU.schemaVersion)}</span><p>8 repères officiels DEX-21, 10 sources directes et 2 ensembles multi-sources. Résidence fiscale, fiscalité, assurance santé et libre circulation restent conditionnelles ; aucun score ou taux total synthétique.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${fiscal.map(k=>rowMarkup(k,DEU.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${practical.map(k=>rowMarkup(k,DEU.fields[k])).join('')}</div></section></details>`;}
  function reconcileInspector(container){const legacyTax=container.querySelector('.tax-stack');if(legacyTax){legacyTax.hidden=true;legacyTax.dataset.atlasLegacyReconciled='DEU';}const legacyDisclosure=container.querySelector('.source-disclosure');if(legacyDisclosure){legacyDisclosure.hidden=true;legacyDisclosure.dataset.atlasLegacyReconciled='DEU';}for(const section of container.querySelectorAll('.detail-section')){const heading=section.querySelector('h3')?.textContent?.trim();if(heading==='INSTALLATION · PREMIER REPÈRE'){section.hidden=true;section.dataset.atlasLegacyReconciled='DEU';}}}
  function enhanceInspector(){const container=document.querySelector('#inspectorContent');if(!container)return;const id=activeCountryId(container),existing=container.querySelector('[data-atlas-germany-evidence]');if(id!=='DEU'){if(existing)existing.remove();return;}reconcileInspector(container);if(existing)return;const anchor=container.querySelector('.capital-card')||container.querySelector('.tax-stack')||container.querySelector('.detail-section');if(!anchor)return;const wrapper=document.createElement('div');wrapper.innerHTML=panelMarkup();anchor.insertAdjacentElement('afterend',wrapper.firstElementChild);}
  function mountInspector(){const container=document.querySelector('#inspectorContent');if(!container)return;enhanceInspector();new MutationObserver(()=>queueMicrotask(enhanceInspector)).observe(container,{childList:true,subtree:true});}

  function reconcileComparator(){
    const table=document.querySelector('#compareTable table');
    if(!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const idx=headers.findIndex(th=>/Allemagne|Germany/i.test(th.textContent||''));
    if(idx<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[idx]||null;
    const set=(label,html)=>{const target=cell(label);if(!target||target.dataset.atlasNormalized==='DEU')return;target.innerHTML=html;target.dataset.atlasNormalized='DEU';};
    const sourceHtml=['tax_residency','pit','cit_business','consumption_tax'].map(k=>core.renderSources(DEU.fields[k])).join('');
    set('Revenu','<span class="val">Progressif · 42 % / 45 %</span><small>2026 · abattement 12 348 € · 42 % de 69 879 à 277 825 € · 45 % dès 277 826 €</small>');
    set('Sociétés','<span class="val">15 % fédéral + solidarité</span><small>Gewerbesteuer municipale en plus et variable · aucun taux national tout compris</small>');
    set('TVA / consommation','<span class="val">19 % standard</span><small>7 % seulement pour les fournitures qualifiantes · autres traitements distincts</small>');
    set('Taxes particulières','<small>AO §§8–9, libre circulation UE, GKV/PKV et fiscalité municipale restent des objets conditionnels distincts ; aucune addition automatique.</small>');
    set('Sources',sourceHtml);
  }
  function bindComparator(){const host=document.querySelector('#compareTable');if(!host||host.dataset.atlasDeuComparatorBound==='true')return;host.dataset.atlasDeuComparatorBound='true';reconcileComparator();new MutationObserver(()=>queueMicrotask(reconcileComparator)).observe(host,{childList:true,subtree:true});}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mountInspector();bindComparator();},{once:true});else{mountInspector();bindComparator();}
}
boot();
})(typeof window!=='undefined'?window:null);