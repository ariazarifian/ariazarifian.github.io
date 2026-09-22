/* PEX-D1D — Japan visible normalized country module.
   Evidence inputs are the Chief-routed DEX-12 handoff, fidelity-preflighted by DEX-16 on 2026-09-21.
   Reuses the PEX-D1A one-or-many source contract and canonical evidence UI.
   Japan's national, reconstruction, local, immigration and insurance layers stay distinct;
   no synthetic all-in scalar is created. */
(function(root){
  'use strict';
  const core=root?.ATLAS_COUNTRY_EVIDENCE;
  if(!core)return;

  const freeze=o=>Object.freeze(o);
  const src=(owner,locator,sourceClass,meta={})=>freeze({owner,locator,sourceClass,...meta});
  const fresh=(state,cadence,trigger)=>freeze({state,cadence,trigger});
  const record=o=>freeze(o);

  const JPN=freeze({
    country:'Japon',
    iso3:'JPN',
    integrationState:'published',
    schemaVersion:'country-evidence-v1',
    evidenceBatch:'DEX-12 / DEX-16',
    acceptedOn:'2026-09-21',
    existingContext:freeze({
      mode:'passthrough-with-reconciliation',
      keys:['population','gdpPerCapita','stability','tax','corporateTax','consumptionTax','residence'],
      legacyTaxContext:freeze({
        pit:'45 % · ancien repère national NTA 2025',
        cit:'23,2 % · ancien repère national',
        consumption:'10 % · ancien repère standard',
        use:'carte et filtres contextuels uniquement',
        excludedFrom:['inspector','comparator'],
        reason:'Le module normalisé conserve séparément impôt national, surtaxe de reconstruction, impôt local des habitants, fiscalité locale des sociétés et calendrier de réforme ; aucun taux tout compris n’est reconstruit.'
      })
    }),
    fields:freeze({
      tax_residency:record({
        state:'READY_WITH_CAVEAT',
        headline:'Domicile ou résidence continue d’au moins un an',
        claim:'NTA guidance generally treats an individual as non-resident unless the person has a domicile in Japan or has had a residence in Japan continuously for one year or more; resident and non-permanent-resident classification changes the scope of taxation.',
        summary:'La qualification fiscale ne se résume pas à un seuil de 183 jours : domicile au Japon ou résidence continue d’au moins un an peuvent faire entrer dans la catégorie résident, avec un périmètre d’imposition qui dépend ensuite du statut.',
        jurisdiction:'Japon · personne physique',
        scope:'Japanese individual tax residence and resident-status classification',
        verifiedOn:'2026-09-21',
        sourceVintage:'current NTA guidance',
        source:src('Japan National Tax Agency','https://www.nta.go.jp/english/taxes/individual/12006.htm','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+EVENT','Income Tax Act, NTA residence guidance or treaty change.'),
        caveat:'Ne pas appliquer un raccourci de 183 jours. Le statut migratoire et la résidence fiscale sont distincts ; les conventions et faits personnels peuvent modifier l’analyse.',
        structure:freeze({tests:['domicile_in_japan','residence_continuously_one_year_or_more'],statusVariants:['non_resident','resident_non_permanent','resident_other'],scopeVariesByStatus:true,day183ShortcutForbidden:true,immigrationStatusIsNotTaxResidence:true})
      }),
      pit:record({
        state:'READY_WITH_CAVEAT',
        headline:'5–45 % national · couches additionnelles distinctes',
        claim:'Japanese national individual income tax is progressive from 5% to 45% across seven bands. Reconstruction special income tax currently adds 2.1% of the base income tax; NTA flags a change from 1 January 2027, while local inhabitant tax remains a separate layer.',
        summary:'L’impôt national sur le revenu suit sept tranches de 5 % à 45 %. La surtaxe spéciale de reconstruction représente actuellement 2,1 % de l’impôt national de base ; l’impôt local des habitants est distinct. La NTA signale un changement à compter du 1er janvier 2027.',
        jurisdiction:'Japon · impôt national sur le revenu + couches distinctes',
        scope:'National individual income tax; reconstruction special income tax and local inhabitant tax separate',
        verifiedOn:'2026-09-21',
        sourceVintage:'law status 2026-04-01',
        sources:freeze([
          src('Japan National Tax Agency','https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm','PRIMARY_TAX_AUTHORITY',{label:'Barème national'}),
          src('Japan National Tax Agency','https://www.nta.go.jp/taxes/shiraberu/taxanswer/osirase/9000.htm','PRIMARY_TAX_AUTHORITY',{label:'Surtaxe et changements 2027'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+TAX_YEAR','2027 special-tax change or annual national-rate revision; mandatory T-30 recheck 2026-12-02 and recheck on/after 2027-01-01.'),
        caveat:'45 % est la tranche marginale supérieure de l’impôt national, pas une charge fiscale japonaise tout compris. La surtaxe de reconstruction et l’impôt local des habitants restent des couches séparées.',
        structure:freeze({rateType:'progressive_layered',nationalRates:[5,10,20,23,33,40,45],nationalTopRate:45,reconstructionSpecialIncomeTaxCurrentRateOnBaseIncomeTax:2.1,localInhabitantTaxAdditional:true,allInScalarForbidden:true,knownEffectiveChange:freeze({date:'2027-01-01',reconstructionSpecialIncomeTaxRateOnBaseIncomeTax:1.1,defenseSpecialIncomeTaxRateOnBaseIncomeTax:1}),mandatoryRecheckDates:['2026-12-02','2027-01-01']})
      }),
      cit_business:record({
        state:'READY_WITH_CAVEAT',
        headline:'23,2 % · taux national ordinaire',
        claim:'The ordinary national corporation-tax rate is 23.2%. Qualifying smaller corporations can receive lower treatment on the first JPY 8 million of annual income subject to conditions, while local corporate taxes remain additional.',
        summary:'Le taux national ordinaire de l’impôt sur les sociétés est de 23,2 %. Certaines petites sociétés éligibles peuvent bénéficier d’un traitement réduit sur les premiers 8 millions de yens de revenu annuel ; des impôts locaux s’ajoutent.',
        jurisdiction:'Japon · impôt national sur les sociétés',
        scope:'National corporation tax; SME treatment and local corporate taxes separate',
        verifiedOn:'2026-09-21',
        sourceVintage:'current rate table from 2025-04-01',
        sources:freeze([
          src('Japan National Tax Agency','https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5759.htm','PRIMARY_TAX_AUTHORITY',{label:'Taux de l’impôt sur les sociétés'}),
          src('Japan National Tax Agency','https://www.nta.go.jp/taxes/shiraberu/taxanswer/osirase/9000.htm','PRIMARY_TAX_AUTHORITY',{label:'Avis et changements'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+TAX_YEAR','NTA corporation-rate, qualifying-SME treatment or local-corporate-tax change.'),
        caveat:'23,2 % est le taux national ordinaire, pas une charge société tout compris. L’éligibilité PME, la tranche des premiers 8 M¥ et les impôts locaux doivent rester distincts.',
        structure:freeze({ordinaryNationalRate:23.2,unit:'percent',qualifyingSmallCorporationReducedTreatment:true,qualifyingSmallCorporationFirstAnnualIncomeJPY:8000000,localCorporateTaxesAdditional:true,allInScalarForbidden:true})
      }),
      consumption_tax:record({
        state:'READY_WITH_CAVEAT',
        headline:'10 % standard · 8 % réduit',
        claim:'Japan currently applies a combined standard consumption-tax rate of 10% and a reduced 8% rate for qualifying categories. NTA flags a scheduled food-related change from 1 April 2027.',
        summary:'Le taux combiné standard de la taxe à la consommation est actuellement de 10 %, avec un taux réduit de 8 % pour certaines catégories. La NTA signale une évolution liée à l’alimentation à compter du 1er avril 2027.',
        jurisdiction:'Japon · taxe à la consommation',
        scope:'Japanese consumption tax plus local consumption-tax component',
        verifiedOn:'2026-09-21',
        sourceVintage:'law status 2026-04-01',
        source:src('Japan National Tax Agency','https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6303.htm','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','90D+EVENT','Scheduled 2027-04-01 food-rate change or earlier legislation/guidance; mandatory T-30 recheck 2027-03-02 and recheck on/after 2027-04-01.'),
        caveat:'10 % est le taux standard actuel, pas le taux de toute opération. Le taux réduit, la catégorie et la date d’application restent déterminants.',
        structure:freeze({combinedStandardRate:10,reducedRate:8,unit:'percent',categorySensitive:true,knownEffectiveChange:freeze({date:'2027-04-01',topic:'food-related rate change'}),mandatoryRecheckDates:['2027-03-02','2027-04-01']})
      }),
      cost_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'314 001 ¥ / mois · ménages de 2 personnes ou plus',
        claim:'Statistics Bureau 2025 yearly-average results report JPY 314,001 average monthly consumption expenditure for households of two or more persons and JPY 346,297 for workers’ households.',
        summary:'Les résultats annuels 2025 du Statistics Bureau publient une dépense de consommation moyenne de 314 001 ¥ par mois pour les ménages de deux personnes ou plus et de 346 297 ¥ pour les ménages de travailleurs.',
        jurisdiction:'Japon · ménages de 2 personnes ou plus',
        scope:'Family Income and Expenditure Survey · 2025 yearly average',
        verifiedOn:'2026-09-21',
        sourceVintage:'2025 yearly average · released 2026-02-06',
        source:src('Statistics Bureau of Japan','https://www.stat.go.jp/english/data/kakei/156n.htm','PRIMARY_OFFICIAL_STATISTICS'),
        freshness:fresh('CURRENT','ANNUAL','Next Family Income and Expenditure Survey yearly-average release.'),
        caveat:'Ce sont des moyennes statistiques de ménage, pas un budget pour une personne seule, Tokyo, un expatrié ou une ville donnée.',
        structure:freeze({survey:'Family Income and Expenditure Survey',year:2025,population:'households_two_or_more_persons',monthlyConsumptionExpenditureJPY:314001,workersHouseholdsMonthlyConsumptionExpenditureJPY:346297,singlePersonBudget:false,tokyoBudget:false,expatBudget:false,cityBudget:false,scalarScoreForbidden:true})
      }),
      residence_visa:record({
        state:'READY_WITH_CAVEAT',
        headline:'90 jours · court séjour sans visa · pas de travail rémunéré',
        claim:'French passport holders are visa-exempt for Japanese short-term stay, with a standard 90-day period of stay on landing. Short-term stay does not permit remunerative activity; work or long-term stay requires the appropriate status/visa route and generally route-specific documents or Certificate of Eligibility process.',
        summary:'Un titulaire d’un passeport français peut bénéficier du court séjour sans visa, avec une durée standard de 90 jours à l’entrée. Ce court séjour n’autorise pas une activité rémunérée ; travail et long séjour relèvent d’un statut et d’une procédure adaptés.',
        jurisdiction:'France → Japon · passeport français',
        scope:'Short-term visa exemption and Japanese status-of-residence framework',
        verifiedOn:'2026-09-21',
        sourceVintage:'current 2026 guidance',
        sources:freeze([
          src('Japan Ministry of Foreign Affairs','https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html','PRIMARY_FOREIGN_AFFAIRS/IMMIGRATION',{label:'Exemption de visa · court séjour'}),
          src('Japan Ministry of Foreign Affairs','https://www.mofa.go.jp/j_info/visit/visa/','PRIMARY_FOREIGN_AFFAIRS/IMMIGRATION',{label:'Cadre des visas'}),
          src('Immigration Services Agency of Japan','https://www.moj.go.jp/isa/applications/status/','PRIMARY_IMMIGRATION',{label:'Statuts de résidence'})
        ]),
        freshness:fresh('CURRENT','60D+EVENT','Visa-exemption, status-of-residence, remunerative-activity or Certificate-of-Eligibility rule change.'),
        caveat:'Exemption de visa, autorisation de travail et statut de résidence sont trois objets distincts. Un court séjour de 90 jours ne crée pas un droit au travail ou à l’installation.',
        structure:freeze({origin:'France',passport:'French',visaExemptShortStay:true,standardLandingPeriodDays:90,shortTermRemunerativeActivityPermitted:false,longStayStatusRequired:true,certificateOfEligibilityRouteSensitive:true})
      }),
      healthcare:record({
        state:'READY_WITH_CAVEAT',
        headline:'Couverture selon résidence, emploi et régime',
        claim:'Residents in Japan who are not covered by another health-insurance scheme generally fall under National Health Insurance. Short-term-stay foreigners are excluded, with specific exceptions and status rules; MHLW publishes dedicated foreign-insured-person materials.',
        summary:'Les résidents au Japon qui ne relèvent pas d’un autre régime d’assurance maladie entrent généralement dans la National Health Insurance. Les étrangers en court séjour sont exclus ; l’emploi, le statut de résidence et certaines exceptions peuvent modifier le régime applicable.',
        jurisdiction:'Japon · assurance maladie publique / résidents étrangers',
        scope:'Public health-insurance eligibility including foreign residents',
        verifiedOn:'2026-09-21',
        sourceVintage:'current MHLW guidance',
        sources:freeze([
          src('Japan Ministry of Health, Labour and Welfare','https://www.mhlw.go.jp/stf/newpage_21539.html','PRIMARY_HEALTH_AUTHORITY',{label:'Éligibilité et assurance publique'}),
          src('Japan Ministry of Health, Labour and Welfare','https://www.mhlw.go.jp/stf/newpage_21895.html','PRIMARY_HEALTH_AUTHORITY',{label:'Assurés étrangers / NHI'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+REFORM','Foreign-resident NHI, employee-insurance or eligibility reform.'),
        caveat:'Ne pas convertir « résident étranger » en « NHI automatique ». L’emploi, le régime déjà applicable, le statut de résidence et les règles municipales interagissent.',
        structure:freeze({eligibilityBy:['residence','employment','other_health_insurance_coverage','residence_status','municipality'],nationalHealthInsuranceGeneralFallback:true,shortTermStayForeignersExcluded:true,blanketForeignerEqualsNHI:false})
      }),
      safety_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'Vigilance normale · risques naturels et contexte local',
        claim:'France Diplomatie describes conventional security risk as generally limited while earthquakes, volcanic activity, severe weather and other geographic hazards remain material; scam or drugging risks can occur in some nightlife settings.',
        summary:'Le risque sécuritaire conventionnel est globalement limité, mais séismes, activité volcanique, météo sévère et autres risques naturels restent matériels. Des risques d’arnaque ou de soumission chimique existent dans certains contextes nocturnes.',
        jurisdiction:'Japon · voyageurs français',
        scope:'Japan safety/travel context for French users',
        verifiedOn:'2026-09-21',
        sourceVintage:'France Diplomatie · updated 2026-09-15',
        source:src('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/japon/conseils-aux-voyageurs-securite','PRIMARY_CONSULAR'),
        freshness:fresh('CURRENT','60D+EVENT','Travel-advice, earthquake, volcanic, severe-weather or local-safety update.'),
        caveat:'Une recommandation de voyage n’est ni une note de qualité de vie ni une probabilité individuelle de risque. Le contexte varie selon le lieu, la saison et les événements.',
        structure:freeze({conventionalSecurityRisk:'generally_limited',hazards:['earthquakes','volcanic_activity','severe_weather','geographic_hazards','nightlife_scams_or_drugging'],regionSensitive:true,timeSensitive:true,scalarScoreForbidden:true})
      })
    })
  });

  const validation=core.validateCountry(JPN);
  if(!validation.ok){
    console.error('ATLAS PEX-D1D Japan contract invalid',validation);
    return;
  }

  const mergedCountries=freeze({...core.countries,JPN});
  root.ATLAS_COUNTRY_EVIDENCE=freeze({...core,countries:mergedCountries});
  root.ATLAS_COUNTRY_EVIDENCE_JAPAN=freeze({country:JPN,validation,legacyPolicy:JPN.existingContext.legacyTaxContext});

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
    return `<details class="context-disclosure atlas-evidence" data-atlas-japan-evidence data-country="JPN" open><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">EVIDENCE LAYER · ${esc(JPN.schemaVersion)}</span><p>8 repères officiels vérifiés, avec périmètre, fraîcheur et limites. Impôts nationaux, surtaxes, couches locales, statut migratoire et assurance restent distincts ; aucun taux total synthétique.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${fiscal.map(k=>rowMarkup(k,JPN.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${practical.map(k=>rowMarkup(k,JPN.fields[k])).join('')}</div></section></details>`;
  }

  function reconcileInspector(container){
    const legacyTax=container.querySelector('.tax-stack');
    if(legacyTax){legacyTax.hidden=true;legacyTax.dataset.atlasLegacyReconciled='JPN';}
    const legacyDisclosure=container.querySelector('.source-disclosure');
    if(legacyDisclosure){legacyDisclosure.hidden=true;legacyDisclosure.dataset.atlasLegacyReconciled='JPN';}
    for(const section of container.querySelectorAll('.detail-section')){
      const heading=section.querySelector('h3')?.textContent?.trim();
      if(heading==='INSTALLATION · PREMIER REPÈRE'){
        section.hidden=true;
        section.dataset.atlasLegacyReconciled='JPN';
      }
    }
  }

  function enhanceInspector(){
    const container=document.querySelector('#inspectorContent');
    if(!container)return;
    const id=activeCountryId(container);
    const existing=container.querySelector('[data-atlas-japan-evidence]');
    if(id!=='JPN'){
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
