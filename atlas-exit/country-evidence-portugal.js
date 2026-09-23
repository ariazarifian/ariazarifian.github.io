/* PEX-D1J — Portugal normalized country evidence. DEX-1/25/26 accepted state-safe handoff, 2026-09-23. */
(function bootPortugal(root){
'use strict';
if(!root||!root.document)return;
let attempts=0;
function boot(){
  const core=root.ATLAS_COUNTRY_EVIDENCE;
  if(!core){if(attempts++<200)root.setTimeout(boot,40);return;}
  if(root.ATLAS_COUNTRY_EVIDENCE_PORTUGAL)return;

  const freeze=o=>Object.freeze(o);
  const src=(owner,locator,sourceClass,meta={})=>freeze({owner,locator,sourceClass,...meta});
  const fresh=(state,cadence,trigger,meta={})=>freeze({state,cadence,trigger,...meta});
  const record=o=>freeze(o);
  const PRT=freeze({
    country:'Portugal',iso3:'PRT',integrationState:'published',schemaVersion:'country-evidence-v1',evidenceBatch:'DEX-1+DEX-25+DEX-26',acceptedOn:'2026-09-23',
    existingContext:freeze({
      mode:'passthrough-with-reconciliation',
      keys:['population','gdpPerCapita','stability','tax','corporateTax','consumptionTax','residence'],
      legacyTaxContext:freeze({
        partial:['pit','cit_business','consumption_tax','residence_visa'],
        missing:['tax_residency','cost_context','healthcare','safety_context'],
        use:'carte et filtres contextuels uniquement après réconciliation',
        excludedFrom:['inspector','comparator'],
        reason:'Le module normalisé Portugal devient la seule vérité utilisateur pour les huit champs.'
      })
    }),
    fields:freeze({
      tax_residency:record({
        state:'READY_FOR_PRODUCT',
        headline:'> 183 jours / 12 mois ou logement habituel',
        claim:'Portuguese tax residence can arise from more than 183 days in a 12-month period beginning or ending in the relevant tax year, or from maintaining a home in conditions indicating an intention to keep and occupy it as habitual residence. Tax residence is distinct from immigration residence.',
        summary:'La résidence fiscale peut résulter de plus de 183 jours sur 12 mois ou d’un logement manifestement destiné à l’habitation habituelle ; elle reste distincte du droit de séjour.',
        jurisdiction:'Portugal · personne physique',scope:'Portugal individual tax residence',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('Autoridade Tributária e Aduaneira','https://info.portaldasfinancas.gov.pt/en/tax-information/getting-started-in-portugal/tax-residency/tax-residency-rules/Pages/default.aspx','PRIMARY_TAX_AUTHORITY',{label:'Autoridade Tributária · tax residency rules'}),
        freshness:fresh('CURRENT','ANNUAL+EVENT','residency-rule/treaty change'),
        caveat:'The 183-day and habitual-home tests are alternatives; residence under tax law is not the same as immigration residence, and treaty outcomes can differ.',
        structure:freeze({rollingTwelveMonthTest:true,moreThan183Days:true,habitualHomeAlternative:true,worldwideIncomeGenerallyForResidents:true,taxResidenceSeparateFromImmigration:true,universalDayCountOnlyRule:false})
      }),
      pit:record({
        state:'READY_FOR_PRODUCT',
        headline:'IRS progressif · base OE2026 en vigueur',
        claim:'The Product-ready baseline remains the enacted/operative OE2026 IRS framework: 2026 brackets were updated by 3.51% and rates for the second through fifth brackets were reduced by 0.3 percentage points. Further reductions announced on 17 September 2026 are in the legislative process and are not hard-coded as settled law.',
        summary:'La base active reste l’OE2026 : tranches 2026 revalorisées de 3,51 % et baisse de 0,3 point sur les 2e à 5e tranches. Les baisses supplémentaires annoncées en septembre ne sont pas intégrées tant que le texte final n’est pas publié.',
        jurisdiction:'Portugal · IRS 2026',scope:'Portugal individual income tax · enacted OE2026 baseline; later September proposal tracked separately',verifiedOn:'2026-09-22',sourceVintage:'OE2026 operative baseline; 17 Sep proposal / 21 Sep parliamentary entry checked 23 Sep 2026',
        sources:freeze([
          src('Government of Portugal','https://www.gov.pt/guias/imposto-sobre-o-rendimento-das-pessoas-singulares-irs-em-portugal','PRIMARY_GOV/TAX',{label:'gov.pt · IRS en Portugal'}),
          src('Government of Portugal','https://portugal.gov.pt/pt/gc25/governo/comunicados-do-conselho-de-ministros/comunicado-do-conselho-de-ministros-de-17-de-setembro-de-2026','PRIMARY_GOV',{label:'Conseil des ministres · 17 septembre 2026'}),
          src('Assembleia da República','https://www.parlamento.pt/ActividadeParlamentar/Paginas/DetalheIniciativa.aspx?BID=377272','PRIMARY_LEGISLATURE',{label:'AR · Proposta de Lei 108/XVII/2'})
        ]),
        freshness:fresh('WATCH','IMMEDIATE+EVENT','Proposta de Lei 108/XVII/2 enacted, rejected or materially amended; Diário da República publication; or official verification of final rates/effective date',{checkedOn:'2026-09-23',watchReason:'post-17-September IRS reduction remains pending legal-state verification'}),
        caveat:'Keep the enacted OE2026 baseline. Do not treat the announced 0.3–0.5 percentage-point additional reductions through the sixth bracket as final law before enactment/publication and verification of final rates and effective date.',
        structure:freeze({progressive:true,oe2026OperativeBaseline:true,bracketsUpdatedPct:3.51,oe2026RateReductionPctPoints:0.3,oe2026ReductionBrackets:'2-5',proposal17SepTrackedSeparately:true,proposal17SepSettledLaw:false,finalProposalRatesHardcoded:false,readinessSeparateFromFreshnessWatch:true})
      }),
      cit_business:record({
        state:'READY_FOR_PRODUCT',
        headline:'IRC 19 % continent/Madère · 16,8 % Açores',
        claim:'For 2026 the ordinary corporate income-tax rate is 19% in mainland Portugal and Madeira and 16.8% in the Azores. Qualifying SME/small-mid-cap treatment can apply 15% to the first EUR 50,000 of taxable income, while state and municipal surtaxes remain separate and conditional.',
        summary:'En 2026 : 19 % sur le continent et à Madère, 16,8 % aux Açores. Le régime PME éligible et les surtaxes restent des couches distinctes.',
        jurisdiction:'Portugal · sociétés',scope:'Portugal corporate tax with regional and surtax layers',verifiedOn:'2026-09-21',sourceVintage:'OE2026',
        source:src('Portuguese Ministry of Finance','https://www.oe.gov.pt/financas-a-lupa/artigos/o-que-e-o-irc-e-quem-tem-de-o-pagar/','PRIMARY_GOV/FINANCE',{label:'Ministério das Finanças · IRC'}),
        freshness:fresh('CURRENT','ANNUAL+EVENT','budget/tax-law change'),
        caveat:'There is no single all-in Portugal company-tax scalar: regional rates, qualifying SME treatment and state/municipal surtaxes are conditional.',
        structure:freeze({mainlandRate:19,madeiraRate:19,azoresRate:16.8,qualifyingSmeFirstSliceRate:15,qualifyingSmeFirstSliceEUR:50000,stateSurtaxPossible:true,municipalSurtaxPossible:true,allInScalarForbidden:true})
      }),
      consumption_tax:record({
        state:'READY_FOR_PRODUCT',
        headline:'IVA 23 % continent · régions autonomes distinctes',
        claim:'Portugal has separate VAT schedules for mainland Portugal and the autonomous regions. The mainland standard rate is 23%; reduced/intermediate categories and the Azores/Madeira schedules remain distinct and must not be flattened into one Portugal-wide scalar.',
        summary:'Le taux standard continental est de 23 %. Açores, Madère et catégories réduites/intermédiaires suivent des barèmes distincts.',
        jurisdiction:'Portugal · TVA',scope:'Mainland Portugal + autonomous regions',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('Portuguese Tax Authority / gov.pt','https://www.gov.pt/guias/imposto-sobre-valor-acrescentado-iva-em-portugal','PRIMARY_TAX_AUTHORITY',{label:'gov.pt · IVA em Portugal'}),
        freshness:fresh('CURRENT','ANNUAL+EVENT','VAT schedule/rate change'),
        caveat:'Do not expose a single Portugal-wide VAT scalar: mainland, Azores and Madeira schedules and category treatments differ.',
        structure:freeze({mainlandStandardRate:23,autonomousRegionsSeparateSchedules:true,reducedIntermediateCategories:true,portugalWideScalarForbidden:true})
      }),
      cost_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'23 900 € / an · ménage moyen 2022/23',
        claim:'INE Household Budget Survey 2022/23 reports average household expenditure of EUR 23,900 per year, with Lisbon metro at EUR 26,891 and Algarve at EUR 24,432; housing represented 39.3%, food 12.9% and transport 12.1% of average spending.',
        summary:'INE 2022/23 : 23 900 € par ménage/an en moyenne ; Lisbonne 26 891 €, Algarve 24 432 €. Ce n’est pas un budget d’expatrié.',
        jurisdiction:'Portugal · ménages',scope:'Portugal households; Lisbon/Algarve context',verifiedOn:'2026-09-21',sourceVintage:'2022/23 survey published 2025',
        source:src('INE Portugal','https://www.ine.pt/ine_novidades/semin/INEWS60/78-79/','PRIMARY_OFFICIAL_STATISTICS',{label:'INE · Household Budget Survey 2022/23'}),
        freshness:fresh('CURRENT','ON_NEW_SURVEY','new household budget survey release'),
        caveat:'Household average, not an expatriate or single-person budget; geography and household composition materially affect spending.',
        structure:freeze({survey:'Household Budget Survey',period:'2022/23',averageAnnualHouseholdExpenditureEUR:23900,lisbonMetroEUR:26891,algarveEUR:24432,housingSharePct:39.3,foodSharePct:12.9,transportSharePct:12.1,expatBudget:false,singlePersonBudget:false})
      }),
      residence_visa:record({
        state:'READY_FOR_PRODUCT',
        headline:'Citoyen UE · certificat après 3 mois',
        claim:'A French/EU citizen staying in Portugal for more than three months should request the EU/EEA/Swiss registration certificate at the municipality of residence within 30 days after the first three months. This is EU residence registration, not a visa route.',
        summary:'Au-delà de 3 mois, un citoyen français/UE demande le certificat d’enregistrement auprès de sa municipalité, dans les 30 jours suivant les trois premiers mois.',
        jurisdiction:'France / UE → Portugal',scope:'EU citizen residence registration in Portugal',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('gov.pt','https://www2.gov.pt/en/servicos/pedir-o-certificado-de-registo-para-cidadao-da-ue/eee/suica','PRIMARY_GOV/IMMIGRATION',{label:'gov.pt · certificat UE/EEE/Suisse'}),
        freshness:fresh('CURRENT','90D+EVENT','EU registration/residence rule change'),
        caveat:'This orientation is for EU citizens and describes residence registration after three months; it is not a visa route and is distinct from tax residence.',
        structure:freeze({origin:'France/EU',euCitizen:true,registrationAfterThreeMonths:true,requestWithinDaysAfterFirstThreeMonths:30,municipalityRegistration:true,visaRoute:false,taxResidenceSeparate:true})
      }),
      healthcare:record({
        state:'READY_FOR_PRODUCT',
        headline:'SNS selon statut · numéro ≠ gratuité automatique',
        claim:'Legal foreign residents can obtain an SNS user number and register with a health centre, but the SNS number by itself does not mean every health service is automatically free; residence/status and entitlement details matter.',
        summary:'Un résident étranger légal peut obtenir un numéro SNS et s’inscrire dans un centre de santé ; ce numéro ne rend pas automatiquement tous les soins gratuits.',
        jurisdiction:'Portugal · résidents étrangers légaux',scope:'SNS user number and health-centre registration',verifiedOn:'2026-09-21',sourceVintage:'current',
        sources:freeze([
          src('gov.pt / SNS','https://www2.gov.pt/en/servicos/pedir-o-numero-de-utente-do-sns','PRIMARY_GOV/HEALTH',{label:'gov.pt · numéro de utente SNS'}),
          src('gov.pt / SNS','https://www2.gov.pt/en-GB/servicos/inscrever-se-no-centro-de-saude','PRIMARY_GOV/HEALTH',{label:'gov.pt · inscription centre de santé'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+REFORM','SNS foreign-resident eligibility/process change'),
        caveat:'SNS registration and an SNS user number do not by themselves guarantee that every service is free; entitlement and charges depend on status and circumstances.',
        structure:freeze({legalResidentOrientation:true,snsUserNumberAvailable:true,healthCentreRegistration:true,snsNumberMeansAllServicesFree:false,statusDependent:true})
      }),
      safety_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'Vigilance normale · feux saisonniers à surveiller',
        claim:'France Diplomatie Portugal guidance verified against the 15 September 2026 advice state indicates normal vigilance overall, while seasonal wildfire risk can materially affect local conditions. This remains contextual rather than a country safety score.',
        summary:'Vigilance normale dans l’ensemble ; le risque saisonnier d’incendies peut modifier localement les conditions. Ce repère n’est pas une note unique de sécurité.',
        jurisdiction:'Portugal · voyageurs français',scope:'Portugal safety context for French users',verifiedOn:'2026-09-21',sourceVintage:'2026-09-15',
        source:src('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/portugal/conseils-aux-voyageurs-securite','PRIMARY_CONSULAR',{label:'France Diplomatie · Portugal · sécurité'}),
        freshness:fresh('CURRENT','60D+EVENT','wildfire/travel-advice update'),
        caveat:'Normal vigilance overall; seasonal wildfire risk is time- and location-sensitive, and this travel context is not a scalar quality-of-life or safety score.',
        structure:freeze({vigilance:'normal',seasonalWildfireRisk:true,timeSensitive:true,contextual:true,scalarScoreForbidden:true})
      })
    })
  });

  const validation=core.validateCountry(PRT);
  if(!validation.ok){console.error('ATLAS PEX-D1J Portugal contract invalid',validation);return;}
  const mergedCountries=freeze({...core.countries,PRT});
  root.ATLAS_COUNTRY_EVIDENCE=freeze({...core,countries:mergedCountries});
  root.ATLAS_COUNTRY_EVIDENCE_PORTUGAL=freeze({country:PRT,validation,legacyPolicy:PRT.existingContext.legacyTaxContext});

  function reconcileLegacyData(){
    const pit={tax:null,taxLabel:'Progressif · base OE2026',taxYear:'2026 · base en vigueur vérifiée',scope:'IRS progressif · veille législative septembre séparée',note:'La base affichée reste l’OE2026 en vigueur. Les réductions supplémentaires annoncées en septembre ne sont pas intégrées avant texte final publié et vérifié.',src:null,taxKind:'current-reference'};
    if(root.ATLAS_TAX?.PRT)Object.assign(root.ATLAS_TAX.PRT,pit);
    if(root.ATLAS_CATALOG?.PRT)Object.assign(root.ATLAS_CATALOG.PRT,pit);
  }
  reconcileLegacyData();

  function reconcileExplorerRuntime(){
    const explorer=root.AtlasExplorer;
    const country=explorer?.getCountries?.().find(c=>c.id==='PRT');
    if(!country)return false;
    Object.assign(country,{tax:null,taxLabel:'Progressif · base OE2026',taxYear:'2026 · base en vigueur vérifiée',scope:'IRS progressif · veille législative septembre séparée',note:'La base affichée reste l’OE2026 en vigueur. Les réductions supplémentaires annoncées en septembre ne sont pas intégrées avant texte final publié et vérifié.',src:null,taxKind:'current-reference'});
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
  function panelMarkup(){const fiscal=['tax_residency','pit','cit_business','consumption_tax'],practical=['cost_context','residence_visa','healthcare','safety_context'];return `<details class="context-disclosure atlas-evidence" data-atlas-portugal-evidence data-country="PRT"><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">EVIDENCE LAYER · ${esc(PRT.schemaVersion)}</span><p>8 repères officiels, 11 sources directes. Le barème OE2026 reste la base active ; les changements IRS annoncés en septembre restent suivis séparément jusqu’au texte final publié.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${fiscal.map(k=>rowMarkup(k,PRT.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${practical.map(k=>rowMarkup(k,PRT.fields[k])).join('')}</div></section></details>`;}
  function reconcileInspector(container){const legacyTax=container.querySelector('.tax-stack');if(legacyTax){legacyTax.hidden=true;legacyTax.dataset.atlasLegacyReconciled='PRT';}const legacyDisclosure=container.querySelector('.source-disclosure');if(legacyDisclosure){legacyDisclosure.hidden=true;legacyDisclosure.dataset.atlasLegacyReconciled='PRT';}for(const section of container.querySelectorAll('.detail-section')){const heading=section.querySelector('h3')?.textContent?.trim();if(heading==='INSTALLATION · PREMIER REPÈRE'){section.hidden=true;section.dataset.atlasLegacyReconciled='PRT';}}}
  function enhanceInspector(){const container=document.querySelector('#inspectorContent');if(!container)return;const id=activeCountryId(container),existing=container.querySelector('[data-atlas-portugal-evidence]');if(id!=='PRT'){if(existing)existing.remove();return;}reconcileInspector(container);if(existing)return;const anchor=container.querySelector('.capital-card')||container.querySelector('.tax-stack')||container.querySelector('.detail-section');if(!anchor)return;const wrapper=document.createElement('div');wrapper.innerHTML=panelMarkup();anchor.insertAdjacentElement('afterend',wrapper.firstElementChild);}
  function mountInspector(){const container=document.querySelector('#inspectorContent');if(!container)return;enhanceInspector();new MutationObserver(()=>queueMicrotask(enhanceInspector)).observe(container,{childList:true,subtree:true});}

  function reconcileComparator(){
    const table=document.querySelector('#compareTable table');
    if(!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const idx=headers.findIndex(th=>/Portugal/i.test(th.textContent||''));
    if(idx<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[idx]||null;
    const set=(label,html)=>{const target=cell(label);if(!target||target.dataset.atlasNormalized==='PRT')return;target.innerHTML=html;target.dataset.atlasNormalized='PRT';};
    const sourceHtml=['tax_residency','pit','cit_business','consumption_tax'].map(k=>core.renderSources(PRT.fields[k])).join('');
    set('Revenu','<span class="val">Progressif · base OE2026</span><small>Base en vigueur ; réductions annoncées en septembre suivies séparément jusqu’au texte final</small>');
    set('Sociétés','<span class="val">19 % continent/Madère · 16,8 % Açores</span><small>PME éligible : 15 % sur les premiers 50 000 € · surtaxes distinctes</small>');
    set('TVA / consommation','<span class="val">23 % standard continental</span><small>Açores, Madère et catégories réduites/intermédiaires suivent des barèmes distincts</small>');
    set('Taxes particulières','<small>Résidence fiscale, droit de séjour UE, surtaxes et barèmes régionaux restent des objets distincts ; aucun taux Portugal tout compris.</small>');
    set('Sources',sourceHtml);
  }
  function bindComparator(){const host=document.querySelector('#compareTable');if(!host||host.dataset.atlasPrtComparatorBound==='true')return;host.dataset.atlasPrtComparatorBound='true';reconcileComparator();new MutationObserver(()=>queueMicrotask(reconcileComparator)).observe(host,{childList:true,subtree:true});}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mountInspector();bindComparator();},{once:true});else{mountInspector();bindComparator();}
}
boot();
})(typeof window!=='undefined'?window:null);
