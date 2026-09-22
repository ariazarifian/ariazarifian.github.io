/* PEX-D1C — Spain visible normalized country module.
   Evidence inputs are the Chief-accepted DEX-12 handoff, fidelity-preflighted by DEX-15 on 2026-09-21.
   Reuses the PEX-D1A one-or-many source contract and canonical evidence UI.
   Spain's conditional tax/residence systems stay layered; no synthetic all-in scalar is created. */
(function(root){
  'use strict';
  const core=root?.ATLAS_COUNTRY_EVIDENCE;
  if(!core)return;

  const freeze=o=>Object.freeze(o);
  const src=(owner,locator,sourceClass,meta={})=>freeze({owner,locator,sourceClass,...meta});
  const fresh=(state,cadence,trigger)=>freeze({state,cadence,trigger});
  const record=o=>freeze(o);

  const ESP=freeze({
    country:'Espagne',
    iso3:'ESP',
    integrationState:'published',
    schemaVersion:'country-evidence-v1',
    evidenceBatch:'DEX-12 / DEX-15',
    acceptedOn:'2026-09-21',
    existingContext:freeze({
      mode:'passthrough-with-reconciliation',
      keys:['population','gdpPerCapita','stability','tax','corporateTax','consumptionTax','residence'],
      legacyTaxContext:freeze({
        pit:'Selon région · ancien contexte OCDE 2025',
        cit:'25 % · ancien repère général',
        consumption:'21 % · IVA',
        residence:'Repère UE générique',
        use:'carte et filtres contextuels uniquement',
        excludedFrom:['inspector','comparator'],
        reason:'Le module normalisé conserve les couches État/communauté autonome et les conditions de résidence UE sans les réduire à un taux ou à « pas de visa = aucune formalité ».'
      })
    }),
    fields:freeze({
      tax_residency:record({
        state:'READY_WITH_CAVEAT',
        headline:'Plus de 183 jours ou centre des intérêts',
        claim:'Spanish tax residence can arise from more than 183 days in the calendar year or when Spain is the main nucleus/base of activities or economic interests; a family presumption can also apply.',
        summary:'La résidence fiscale peut notamment résulter de plus de 183 jours sur l’année civile ou du centre principal des activités ou intérêts économiques en Espagne ; une présomption familiale peut aussi intervenir.',
        jurisdiction:'Espagne · personne physique',
        scope:'Résidence fiscale espagnole des personnes physiques',
        verifiedOn:'2026-09-21',
        sourceVintage:'current statutory guidance',
        source:src('Agencia Tributaria','https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2023/c02-irpf-cuestiones-generales/sujecion-irpf-aspectos-personales/residencia-habitual-territorio-espanol.html','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+EVENT','IRPF residence-rule, treaty or residence-guidance change.'),
        caveat:'Ne pas déduire la résidence fiscale du seul enregistrement de séjour UE. Les tests fiscaux, conventions et faits personnels restent distincts.',
        structure:freeze({tests:['days_over_183','main_nucleus_activities_or_economic_interests','family_presumption'],calendarYear:true,immigrationStatusIsNotTaxResidence:true,dayTestIsNotOnlyTest:true})
      }),
      pit:record({
        state:'READY_WITH_CAVEAT',
        headline:'État + communauté autonome',
        claim:'IRPF combines a progressive state scale with an autonomous-community scale. The state general component spans 9.5% to 24.5%; autonomous scales are separate and vary.',
        summary:'L’IRPF combine un barème progressif étatique et un barème propre à la communauté autonome. La composante générale de l’État va de 9,5 % à 24,5 % ; la composante autonome s’ajoute et varie.',
        jurisdiction:'Espagne · IRPF · État + communauté autonome',
        scope:'IRPF general income scale; autonomous-community component separate',
        verifiedOn:'2026-09-21',
        sourceVintage:'2025 income-year manual · published 2026-03-27',
        source:src('Agencia Tributaria','https://sede.agenciatributaria.gob.es/static_files/Sede/Biblioteca/Manual/Practicos/IRPF/IRPF-2025/ManualRenta2025Parte1_es_es.pdf','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+TAX_YEAR','New IRPF manual, state-scale amendment or autonomous-community scale update.'),
        caveat:'24,5 % est la tranche supérieure de la composante étatique générale, pas un taux supérieur Espagne tout compris. La communauté autonome et la catégorie de revenu modifient le calcul.',
        structure:freeze({rateType:'progressive_layered',layers:['state','autonomous_community'],stateGeneralRates:[9.5,12,15,18.5,22.5,24.5],autonomousRatesVary:true,allInScalarForbidden:true})
      }),
      cit_business:record({
        state:'READY_WITH_CAVEAT',
        headline:'25 % général · régimes 2026 distincts',
        claim:'The general corporate rate is 25%. In 2026 qualifying micro-enterprises below EUR 1m turnover can use 19% on the first EUR 50,000 taxable base and 21% on the remainder; qualifying reduced-dimension entities can use 23%.',
        summary:'Le taux général est de 25 %. En 2026, certaines micro-entreprises sous 1 M€ de chiffre d’affaires peuvent relever de 19 % sur les premiers 50 000 € de base imposable puis 21 % au-delà ; certaines petites entités éligibles relèvent de 23 %.',
        jurisdiction:'Espagne · Impuesto sobre Sociedades',
        scope:'Corporate income tax · general and qualifying reduced regimes',
        verifiedOn:'2026-09-21',
        sourceVintage:'2026 rates',
        source:src('Agencia Tributaria','https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades/que-base-imponible-se-determina-sociedades/tipo-impositivo.html','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+TAX_YEAR','Corporate-tax rate, turnover threshold or qualifying-regime change.'),
        caveat:'25 % est le taux général, pas un taux universel. Le chiffre d’affaires, l’éligibilité et certains régimes ou nouvelles entités peuvent modifier le taux.',
        structure:freeze({generalRate:25,unit:'percent',year:2026,microEnterprise:freeze({turnoverBelowEUR:1000000,firstTaxableBaseEUR:50000,firstRate:19,remainderRate:21}),qualifyingReducedDimensionRate:23,regimeSensitive:true})
      }),
      consumption_tax:record({
        state:'READY_FOR_PRODUCT',
        headline:'21 % standard · taux réduits distincts',
        claim:'The standard IVA rate is 21%; reduced rates of 10% and 4% and qualifying zero-rated categories exist.',
        summary:'Le taux standard de l’IVA est de 21 %. Des taux réduits de 10 % et 4 %, ainsi que certaines catégories à 0 %, existent selon l’opération.',
        jurisdiction:'Espagne · IVA',
        scope:'Spanish value-added tax',
        verifiedOn:'2026-09-21',
        sourceVintage:'current official schedule',
        source:src('Agencia Tributaria','https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2025/capitulo-04-sujetos-pasivos-repercusion-impositivo/tipo-impositivo.html','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+EVENT','IVA rate, category or temporary-measure reform.'),
        caveat:'Le taux standard de 21 % ne signifie pas que chaque opération supporte 21 %. La nature du bien ou service et les règles d’exonération/réduction restent déterminantes.',
        structure:freeze({standardRate:21,reducedRates:[10,4],zeroRatedCategoriesPossible:true,unit:'percent',categorySensitive:true})
      }),
      cost_context:record({
        state:'READY_WITH_CAVEAT',
        headline:'35 101 € / ménage · 14 066 € / personne',
        claim:'INE EPF 2025 reports EUR 35,101 average annual household expenditure and EUR 14,066 average annual expenditure per person, with material regional dispersion.',
        summary:'L’EPF 2025 de l’INE publie une dépense annuelle moyenne de 35 101 € par ménage et 14 066 € par personne, avec des écarts régionaux significatifs.',
        jurisdiction:'Espagne · ménages · statistique nationale',
        scope:'Household Budget Survey 2025',
        verifiedOn:'2026-09-21',
        sourceVintage:'EPF 2025 · released 2026-06-25',
        source:src('Instituto Nacional de Estadística','https://www.ine.es/dyngs/Prensa/EPF2025.htm','PRIMARY_OFFICIAL_STATISTICS'),
        freshness:fresh('CURRENT','ANNUAL','Next INE Encuesta de Presupuestos Familiares release.'),
        caveat:'Ce sont des moyennes statistiques de dépense, pas un budget d’expatrié, un loyer, un coût mensuel garanti ni un budget de ville. Les écarts régionaux restent matériels.',
        structure:freeze({survey:'EPF',year:2025,annualHouseholdExpenditureEUR:35101,annualPerPersonExpenditureEUR:14066,regionalDispersion:true,expatBudget:false,cityBudget:false,scalarScoreForbidden:true})
      }),
      residence_visa:record({
        state:'READY_WITH_CAVEAT',
        headline:'Libre circulation UE · formalités au-delà de 3 mois',
        claim:'French/EU citizens do not need a work visa under free movement. For residence beyond three months, qualifying grounds include work/self-employment or sufficient resources plus comprehensive health coverage, and registration in the Central Register of Foreign Nationals is required within three months after entry.',
        summary:'Un citoyen français ou UE n’a pas besoin de visa de travail au titre de la libre circulation. Pour résider plus de trois mois, il faut relever d’un fondement admis et s’inscrire au registre central des étrangers dans les trois mois suivant l’entrée.',
        jurisdiction:'France / UE → Espagne',
        scope:'French/EU citizen residence in Spain',
        verifiedOn:'2026-09-21',
        sourceVintage:'updated 2026-07-01',
        sources:freeze([
          src('Administración General del Estado','https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-residencia/info-general','PRIMARY_GOV/IMMIGRATION',{label:'Conditions générales de résidence'}),
          src('Administración General del Estado','https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-residencia/inscribirte-residente','PRIMARY_GOV/IMMIGRATION',{label:'Inscription comme résident'})
        ]),
        freshness:fresh('CURRENT','90D+EVENT','EU free-movement, Spanish residence-ground or registration reform.'),
        caveat:'« Pas de visa de travail » ne signifie pas « aucune formalité ». Les fondements de séjour, l’enregistrement, la couverture santé et la résidence fiscale sont des objets distincts.',
        structure:freeze({originBloc:'EU',origin:'France',workVisaRequired:false,overThreeMonthsConditions:['worker_or_self_employed','sufficient_resources_plus_comprehensive_health_coverage','other_EU_law_ground'],centralRegisterRegistrationRequired:true,registrationDeadlineMonthsAfterEntry:3,immigrationResidenceIsNotTaxResidence:true})
      }),
      healthcare:record({
        state:'READY_WITH_CAVEAT',
        headline:'Droit selon résidence, affiliation et coordination UE',
        claim:'Spanish health-care entitlement depends on legal title and status, including worker/pensioner/legal-resident and EU social-security coordination paths; EHIC, resident entitlement and worker affiliation are not interchangeable.',
        summary:'L’accès au système public dépend du titre et de la situation : affiliation comme travailleur, résidence ou pension selon le cas, et coordination européenne. CEAM, droit du résident et affiliation professionnelle ne sont pas interchangeables.',
        jurisdiction:'Espagne · système public de santé / sécurité sociale',
        scope:'Health-care entitlement and EU coordination',
        verifiedOn:'2026-09-21',
        sourceVintage:'current Social Security guidance',
        source:src('Seguridad Social','https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/PrestacionesPensionesTrabajadores/10938/30476/177505','PRIMARY_SOCIAL_SECURITY/HEALTH'),
        freshness:fresh('CURRENT','ANNUAL+REFORM','Health-care entitlement, affiliation or EU social-security coordination reform.'),
        caveat:'Ne pas transformer la CEAM en couverture permanente de résident, ni supposer qu’un enregistrement de résidence crée automatiquement la même couverture qu’une affiliation de travailleur.',
        structure:freeze({eligibilityBy:['worker_affiliation','pensioner_status','legal_residence','EU_coordination'],ehicIsNotResidentEntitlement:true,workerAffiliationDistinct:true,statusDependent:true})
      }),
      safety_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'Vigilance normale · contexte évolutif',
        claim:'France Diplomatie describes normal vigilance overall while terrorism-alert, severe-weather and wildfire contexts can remain material depending on place and season.',
        summary:'La vigilance est normale dans l’ensemble, mais l’alerte terroriste ainsi que les épisodes météo et feux de forêt peuvent devenir matériels selon la zone et la saison.',
        jurisdiction:'Espagne · voyageurs français',
        scope:'Spain safety/travel context for French users',
        verifiedOn:'2026-09-21',
        sourceVintage:'France Diplomatie · updated 2026-09-15',
        source:src('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/espagne/conseils-aux-voyageurs-securite','PRIMARY_CONSULAR'),
        freshness:fresh('CURRENT','60D+EVENT','Travel-advice, terrorism-alert, severe-weather or wildfire-context update.'),
        caveat:'Une recommandation de voyage n’est ni une note de qualité de vie ni une probabilité individuelle de risque. Le contexte peut varier par région et saison.',
        structure:freeze({overall:'normal_vigilance',hazards:['terrorism_alert','severe_weather','wildfires'],regionSensitive:true,seasonSensitive:true,scalarScoreForbidden:true})
      })
    })
  });

  const validation=core.validateCountry(ESP);
  if(!validation.ok){
    console.error('ATLAS PEX-D1C Spain contract invalid',validation);
    return;
  }

  const mergedCountries=freeze({...core.countries,ESP});
  root.ATLAS_COUNTRY_EVIDENCE=freeze({...core,countries:mergedCountries});
  root.ATLAS_COUNTRY_EVIDENCE_SPAIN=freeze({country:ESP,validation,legacyPolicy:ESP.existingContext.legacyTaxContext});

  if(!root.document)return;
  const document=root.document;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateLabel=value=>{const [y,m,d]=String(value).split('-');return y&&m&&d?`${d}.${m}.${y}`:value;};
  const stateLabel=state=>state==='READY_WITH_CAVEAT'?'Vérifié · limites':state==='READY_FOR_PRODUCT'?'Vérifié':'À revalider';
  const activeCountryId=container=>container?.querySelector('[data-save]')?.getAttribute('data-save')||null;

  function rowMarkup(key,r){
    const display=core.safeDisplay(r);
    return `<article class="atlas-evidence__row" data-evidence-field="${esc(key)}" data-evidence-state="${esc(r.state)}"><div class="atlas-evidence__row-head"><span>${esc(core.fieldLabels[key]||key)}</span><small>${esc(stateLabel(r.state))}</small></div><strong>${esc(display.headline)}</strong><p>${esc(display.summary)}</p><details class="atlas-evidence__source"><summary>Source & limites</summary><p class="micro">${esc(r.jurisdiction)} · vérifié ${esc(dateLabel(r.verifiedOn))} · ${esc(r.freshness.cadence)}</p><p class="micro">${esc(r.caveat)}</p>${core.renderSources(r)}</details></article>`;
  }

  function panelMarkup(){
    const fiscal=['tax_residency','pit','cit_business','consumption_tax'];
    const practical=['cost_context','residence_visa','healthcare','safety_context'];
    return `<details class="context-disclosure atlas-evidence" data-atlas-spain-evidence data-country="ESP" open><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">EVIDENCE LAYER · ${esc(ESP.schemaVersion)}</span><p>8 repères officiels vérifiés, avec périmètre, fraîcheur et limites. Les couches fiscales et administratives restent distinctes ; aucun taux total synthétique.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${fiscal.map(k=>rowMarkup(k,ESP.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${practical.map(k=>rowMarkup(k,ESP.fields[k])).join('')}</div></section></details>`;
  }

  function reconcileInspector(container){
    const legacyTax=container.querySelector('.tax-stack');
    if(legacyTax){legacyTax.hidden=true;legacyTax.dataset.atlasLegacyReconciled='ESP';}
    const legacyDisclosure=container.querySelector('.source-disclosure');
    if(legacyDisclosure){legacyDisclosure.hidden=true;legacyDisclosure.dataset.atlasLegacyReconciled='ESP';}
    for(const section of container.querySelectorAll('.detail-section')){
      const heading=section.querySelector('h3')?.textContent?.trim();
      if(heading==='INSTALLATION · PREMIER REPÈRE'){
        section.hidden=true;
        section.dataset.atlasLegacyReconciled='ESP';
      }
    }
  }

  function enhanceInspector(){
    const container=document.querySelector('#inspectorContent');
    if(!container)return;
    const id=activeCountryId(container);
    const existing=container.querySelector('[data-atlas-spain-evidence]');
    if(id!=='ESP'){
      if(existing)existing.remove();
      return;
    }
    reconcileInspector(container);
    if(existing)return;
    const anchor=container.querySelector('.capital-card')||container.querySelector('.tax-stack');
    if(!anchor)return;
    const holder=document.createElement('div');
    holder.innerHTML=panelMarkup();
    anchor.insertAdjacentElement('afterend',holder.firstElementChild);
  }

  function mount(){
    const inspector=document.querySelector('#inspectorContent');
    if(inspector){
      enhanceInspector();
      new MutationObserver(()=>queueMicrotask(enhanceInspector)).observe(inspector,{childList:true,subtree:true});
    }
    document.addEventListener('click',()=>setTimeout(enhanceInspector,0));
    window.addEventListener('hashchange',()=>setTimeout(enhanceInspector,0));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null));