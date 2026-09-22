/* PEX-D1E — Switzerland visible normalized country module.
   Evidence inputs are the hardened DEX-1 / DEX-8 Wave-1 handoff accepted on 2026-09-21.
   Reuses the PEX-D1A one-or-many source contract and canonical evidence UI.
   Federal, cantonal, communal, migration and insurance layers stay distinct;
   no synthetic Swiss all-in tax, cost or safety scalar is created. */
(function(root){
  'use strict';
  const core=root?.ATLAS_COUNTRY_EVIDENCE;
  if(!core)return;

  const freeze=o=>Object.freeze(o);
  const src=(owner,locator,sourceClass,meta={})=>freeze({owner,locator,sourceClass,...meta});
  const fresh=(state,cadence,trigger)=>freeze({state,cadence,trigger});
  const record=o=>freeze(o);

  const CHE=freeze({
    country:'Suisse',
    iso3:'CHE',
    integrationState:'published',
    schemaVersion:'country-evidence-v1',
    evidenceBatch:'DEX-1 / DEX-8',
    acceptedOn:'2026-09-21',
    existingContext:freeze({
      mode:'passthrough-with-reconciliation',
      keys:['population','gdpPerCapita','stability','tax','corporateTax','consumptionTax','residence'],
      legacyTaxContext:freeze({
        pit:'Selon canton · ancien libellé non scalaire',
        cit:'Ancien repère commerce à réconcilier',
        consumption:'Ancien repère commerce à réconcilier',
        use:'carte et filtres contextuels uniquement',
        excludedFrom:['inspector','comparator'],
        reason:'Le module normalisé conserve séparément impôt fédéral, cantonal et communal, ainsi que les couches de séjour, assurance et coût ; aucun taux suisse tout compris n’est reconstruit.'
      })
    }),
    fields:freeze({
      tax_residency:record({
        state:'READY_FOR_PRODUCT',
        headline:'Domicile ou séjour qualifiant · 30 j. avec activité / 90 j. sans',
        claim:'Current Swiss Federal Tax Administration material grounds Swiss individual tax liability in domicile or qualifying stay. The official system material identifies a 30-day stay threshold when gainfully employed and a 90-day threshold when not gainfully employed; treaty rules can still affect the final outcome.',
        summary:'La logique fiscale suisse repose sur le domicile ou un séjour qualifiant. Le matériel actuel de l’AFC distingue notamment un seuil de 30 jours avec activité lucrative et de 90 jours sans activité lucrative ; une convention fiscale peut encore modifier l’issue.',
        jurisdiction:'Suisse · personne physique',
        scope:'Swiss federal tax residence / unlimited tax-liability orientation',
        verifiedOn:'2026-09-21',
        sourceVintage:'current 2026 FTA material',
        source:src('Swiss Federal Tax Administration','https://www.estv.admin.ch/dam/estv/en/dokumente/estv/steuersystem/schweizer-steuersystem/ch-steuersystem.pdf.download.pdf/ch-steuersystem.pdf','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+EVENT','Tax-residence guidance, statute or treaty change.'),
        caveat:'Ne pas remplacer ce système par un raccourci « 183 jours ». Domicile, durée/nature du séjour et convention fiscale doivent rester distincts du statut migratoire.',
        structure:freeze({tests:['domicile','qualifying_stay'],stayThresholdDaysGainfullyEmployed:30,stayThresholdDaysNotGainfullyEmployed:90,day183ShortcutForbidden:true,treatyCanAlterOutcome:true,immigrationStatusIsNotTaxResidence:true})
      }),
      pit:record({
        state:'READY_FOR_PRODUCT',
        headline:'Fédéral + canton + commune · aucun taux suisse unique',
        claim:'Swiss personal income taxation is layered across federal, cantonal and communal levels, so effective burden varies materially by canton, commune and personal circumstances. The 2026 individual-taxation reform is not in force in 2026; the Federal Council set implementation for 2032.',
        summary:'L’impôt sur le revenu se compose de couches fédérale, cantonale et communale. Le canton, la commune et la situation personnelle changent matériellement le résultat ; la réforme de l’imposition individuelle approuvée en 2026 n’entre en vigueur qu’en 2032.',
        jurisdiction:'Suisse · impôt des personnes physiques',
        scope:'Federal + cantonal + communal PIT context',
        verifiedOn:'2026-09-21',
        sourceVintage:'2026 tariff/reform notices',
        sources:freeze([
          src('Swiss Federal Tax Administration','https://www.estv.admin.ch/en/individual-taxation','PRIMARY_TAX_AUTHORITY',{label:'Imposition individuelle · cadre'}),
          src('Swiss Federal Tax Administration','https://www.estv.admin.ch/de/newnsb/khPH1Sn08Zr6iGZYe4tsB','PRIMARY_TAX_AUTHORITY',{label:'Mise en œuvre de la réforme'}),
          src('Swiss Federal Tax Administration','https://www.estv.admin.ch/de/newnsb/VzaAUrhkPx2EPde4a6e3O','PRIMARY_TAX_AUTHORITY',{label:'Tarifs / déductions 2026'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+EVENT','Annual tariffs or implementation-date changes.'),
        caveat:'Aucun taux national supérieur ne représente la charge personnelle suisse tout compris. La réforme d’imposition individuelle prévue pour 2032 ne doit pas être appliquée à un utilisateur en 2026.',
        structure:freeze({layers:['federal','cantonal','communal'],allInScalarForbidden:true,cantonSensitive:true,communeSensitive:true,personalSituationSensitive:true,knownFutureReform:freeze({topic:'individual_taxation',implementationYear:2032,effectiveIn2026:false})})
      }),
      cit_business:record({
        state:'READY_FOR_PRODUCT',
        headline:'8,5 % fédéral · cantonal/communal en plus',
        claim:'Swiss federal direct tax on corporate net profit is 8.5% at the federal layer. Cantonal and communal profit/capital taxes add and vary by location, so 8.5% is not an all-in Swiss company-tax rate.',
        summary:'L’impôt fédéral direct sur le bénéfice net des sociétés est de 8,5 %. Des impôts cantonaux et communaux sur le bénéfice et/ou le capital s’ajoutent selon la localisation ; 8,5 % n’est donc pas un taux société suisse tout compris.',
        jurisdiction:'Suisse · sociétés',
        scope:'Federal + cantonal/communal corporate taxation',
        verifiedOn:'2026-09-21',
        sourceVintage:'current tax-system reference',
        source:src('Swiss Federal Tax Administration','https://www.estv.admin.ch/dam/en/sd-web/i8eiHb5Gk0xl/ch-steuersystem.pdf','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+EVENT','Federal or cantonal corporate-tax regime change.'),
        caveat:'8,5 % est uniquement la couche fédérale sur le bénéfice net. La localisation et les règles cantonales/communales empêchent tout taux suisse tout compris unique.',
        structure:freeze({federalNetProfitRate:8.5,unit:'percent',cantonalCommunalTaxesAdditional:true,locationSensitive:true,allInScalarForbidden:true})
      }),
      consumption_tax:record({
        state:'READY_FOR_PRODUCT',
        headline:'8,1 % standard · 2,6 % réduit · 3,8 % hébergement',
        claim:'Current Swiss VAT rates are 8.1% standard, 2.6% reduced and 3.8% for accommodation services, with the applicable rate depending on the supply.',
        summary:'La TVA suisse applique actuellement 8,1 % au taux standard, 2,6 % au taux réduit et 3,8 % aux prestations d’hébergement. Le taux applicable dépend de l’opération.',
        jurisdiction:'Suisse · TVA',
        scope:'Swiss VAT rate schedule',
        verifiedOn:'2026-09-21',
        sourceVintage:'current rates',
        source:src('Swiss Federal Tax Administration','https://www.estv.admin.ch/en/vat-rates-switzerland','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+EVENT','VAT rate or category change.'),
        caveat:'8,1 % est le taux standard, pas le taux de chaque opération. Les taux réduit et hébergement restent des catégories distinctes.',
        structure:freeze({standardRate:8.1,reducedRate:2.6,accommodationRate:3.8,unit:'percent',categorySensitive:true})
      }),
      cost_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'5 049 CHF / mois · consommation moyenne par ménage',
        claim:'The Swiss Federal Statistical Office Household Budget Survey 2023 reports average monthly consumption expenditure on goods and services of CHF 5,049, average disposable household income of CHF 7,186, and an average household size of 2.07 persons.',
        summary:'L’enquête Budget des ménages 2023 de l’OFS publie 5 049 CHF de dépenses mensuelles moyennes de consommation par ménage, 7 186 CHF de revenu disponible moyen et une taille moyenne de ménage de 2,07 personnes.',
        jurisdiction:'Suisse · ménages privés',
        scope:'Household Budget Survey 2023',
        verifiedOn:'2026-09-21',
        sourceVintage:'2023 survey',
        source:src('Swiss Federal Statistical Office','https://dam-api.bfs.admin.ch/hub/api/dam/assets/36192814/master','PRIMARY_OFFICIAL_STATISTICS'),
        freshness:fresh('CURRENT','ON_NEW_SURVEY','New household-budget survey release.'),
        caveat:'Moyenne de ménage, pas budget d’une personne seule, d’un expatrié, d’une ville ou d’un canton. La dispersion géographique et la composition du ménage restent matérielles.',
        structure:freeze({survey:'Household Budget Survey',year:2023,population:'private_households',monthlyConsumptionExpenditureCHF:5049,monthlyDisposableIncomeCHF:7186,averageHouseholdSize:2.07,singlePersonBudget:false,expatBudget:false,cityBudget:false,cantonBudget:false,scalarScoreForbidden:true})
      }),
      residence_visa:record({
        state:'READY_FOR_PRODUCT',
        headline:'Emploi > 3 mois · inscription sous 14 jours et avant travail',
        claim:'For a French/EU citizen taking employment in Switzerland for more than three months, SEM guidance requires registration with the commune within 14 days of arrival and before starting work; employment up to three months generally follows notification rather than a residence permit. Self-employment, non-working residence and family cases differ.',
        summary:'Pour un Français/citoyen UE employé plus de trois mois en Suisse, le SEM prévoit une inscription auprès de la commune dans les 14 jours suivant l’arrivée et avant de commencer le travail. Jusqu’à trois mois, l’emploi relève généralement d’une notification plutôt que d’un permis de séjour.',
        jurisdiction:'France / UE → Suisse · libre circulation UE/AELE',
        scope:'EU/EFTA free movement; French citizen employment orientation',
        verifiedOn:'2026-09-21',
        sourceVintage:'current guidance',
        sources:freeze([
          src('State Secretariat for Migration','https://www.sem.admin.ch/sem/en/home/overview-arbeit.html','PRIMARY_IMMIGRATION',{label:'Travailler en Suisse'}),
          src('State Secretariat for Migration','https://www.sem.admin.ch/sem/en/home/themen/fza_schweiz-eu-efta/eu-efta_buerger_schweiz/faq.html','PRIMARY_IMMIGRATION',{label:'FAQ UE/AELE'})
        ]),
        freshness:fresh('CURRENT','90D+EVENT','EU/EFTA free-movement or work-registration rule change.'),
        caveat:'Ce repère vise la libre circulation UE/AELE et l’emploi. Travail indépendant, personne sans activité, famille et autres statuts suivent des conditions propres.',
        structure:freeze({origin:'France/EU',framework:'EU_EFTA_free_movement',employmentOverMonths:3,communeRegistrationWithinDays:14,registrationBeforeStartingWork:true,employmentUpToMonthsGenerallyNotification:3,permitDependsOnEmploymentDuration:true,selfEmploymentDifferent:true,nonWorkingDifferent:true,familyCasesDifferent:true})
      }),
      healthcare:record({
        state:'READY_FOR_PRODUCT',
        headline:'Assurance obligatoire généralement sous 3 mois · exceptions',
        claim:'People settling in Switzerland generally need to arrange compulsory Swiss health insurance within three months, subject to statutory exemptions and cross-border-worker rules. The applicable arrangement is not identical for every foreign resident or commuter.',
        summary:'Les personnes qui s’installent en Suisse doivent généralement organiser l’assurance maladie obligatoire dans les trois mois. Des exemptions et règles spécifiques existent, notamment pour les travailleurs frontaliers.',
        jurisdiction:'Suisse · résidents / situations transfrontalières',
        scope:'Compulsory health insurance with resident and cross-border exceptions',
        verifiedOn:'2026-09-21',
        sourceVintage:'current guidance',
        sources:freeze([
          src('Swiss Federal Office of Public Health','https://www.bag.admin.ch/en/health-insurance-requirement-to-obtain-insurance-for-persons-resident-in-switzerland','PRIMARY_HEALTH_AUTHORITY',{label:'Obligation des résidents'}),
          src('Swiss Federal Office of Public Health','https://www.bag.admin.ch/en/health-insurance-cross-border-commuters-working-in-switzerland','PRIMARY_HEALTH_AUTHORITY',{label:'Travailleurs frontaliers'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+REFORM','Insurance mandate or exemption-rule change.'),
        caveat:'Ne pas transformer la règle générale des trois mois en régime identique pour tous. Exemptions, frontalier, emploi et coordination internationale peuvent modifier l’affiliation applicable.',
        structure:freeze({generalEnrollmentDeadlineMonths:3,compulsoryInsuranceGeneralRule:true,statutoryExceptions:true,crossBorderExceptions:true,blanketSameArrangementForAllForeigners:false})
      }),
      safety_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'Vigilance normale · contexte local, pas de score',
        claim:'France Diplomatie currently classifies Switzerland under normal vigilance while ordinary theft and transit precautions remain relevant; travel-advice context is not a quality-of-life or personal-risk score.',
        summary:'France Diplomatie classe actuellement la Suisse en vigilance normale. Les précautions ordinaires contre les vols et dans les transports restent pertinentes ; ce contexte de voyage ne constitue pas une note de qualité de vie.',
        jurisdiction:'Suisse · voyageurs français',
        scope:'Switzerland safety/travel context for French users',
        verifiedOn:'2026-09-21',
        sourceVintage:'France Diplomatie · updated 2026-09-15',
        source:src('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/suisse/conseils-aux-voyageurs-securite','PRIMARY_CONSULAR'),
        freshness:fresh('CURRENT','90D+EVENT','Travel-advice update.'),
        caveat:'Une recommandation de voyage est contextuelle et évolutive. Elle ne mesure ni la qualité de vie globale ni une probabilité individuelle de risque.',
        structure:freeze({vigilance:'normal',ordinaryTheftTransitPrecautions:true,regionSensitive:true,timeSensitive:true,scalarScoreForbidden:true})
      })
    })
  });

  const validation=core.validateCountry(CHE);
  if(!validation.ok){
    console.error('ATLAS PEX-D1E Switzerland contract invalid',validation);
    return;
  }

  const mergedCountries=freeze({...core.countries,CHE});
  root.ATLAS_COUNTRY_EVIDENCE=freeze({...core,countries:mergedCountries});
  root.ATLAS_COUNTRY_EVIDENCE_SWITZERLAND=freeze({country:CHE,validation,legacyPolicy:CHE.existingContext.legacyTaxContext});

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
    return `<details class="context-disclosure atlas-evidence" data-atlas-switzerland-evidence data-country="CHE" open><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">EVIDENCE LAYER · ${esc(CHE.schemaVersion)}</span><p>8 repères officiels vérifiés, avec périmètre, fraîcheur et limites. Fédéral, canton, commune, libre circulation, assurance et coût restent des couches distinctes ; aucun score ou taux total synthétique.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${fiscal.map(k=>rowMarkup(k,CHE.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${practical.map(k=>rowMarkup(k,CHE.fields[k])).join('')}</div></section></details>`;
  }

  function reconcileInspector(container){
    const legacyTax=container.querySelector('.tax-stack');
    if(legacyTax){legacyTax.hidden=true;legacyTax.dataset.atlasLegacyReconciled='CHE';}
    const legacyDisclosure=container.querySelector('.source-disclosure');
    if(legacyDisclosure){legacyDisclosure.hidden=true;legacyDisclosure.dataset.atlasLegacyReconciled='CHE';}
    for(const section of container.querySelectorAll('.detail-section')){
      const heading=section.querySelector('h3')?.textContent?.trim();
      if(heading==='INSTALLATION · PREMIER REPÈRE'){
        section.hidden=true;
        section.dataset.atlasLegacyReconciled='CHE';
      }
    }
  }

  function enhanceInspector(){
    const container=document.querySelector('#inspectorContent');
    if(!container)return;
    const id=activeCountryId(container);
    const existing=container.querySelector('[data-atlas-switzerland-evidence]');
    if(id!=='CHE'){
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
