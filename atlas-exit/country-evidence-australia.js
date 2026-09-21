/* PEX-D1B — Australia first visible normalized country module.
   Evidence inputs are the Chief-accepted DEX-12 handoff dated 2026-09-21.
   Reuses the PEX-D1A one-or-many source contract and canonical evidence UI.
   Legacy OECD tax context remains available to the map/filter only; the inspector
   and comparator use this normalized module so historical and current scopes are
   never presented as duplicate truths. No synthetic score. */
(function(root){
  'use strict';
  const core=root?.ATLAS_COUNTRY_EVIDENCE;
  if(!core)return;

  const freeze=o=>Object.freeze(o);
  const src=(owner,locator,sourceClass,meta={})=>freeze({owner,locator,sourceClass,...meta});
  const fresh=(state,cadence,trigger)=>freeze({state,cadence,trigger});
  const record=o=>freeze(o);

  const AUS=freeze({
    country:'Australie',
    iso3:'AUS',
    integrationState:'published',
    schemaVersion:'country-evidence-v1',
    evidenceBatch:'DEX-12',
    acceptedOn:'2026-09-21',
    existingContext:freeze({
      mode:'passthrough-with-reconciliation',
      keys:['population','gdpPerCapita','stability','tax','corporateTax','consumptionTax'],
      legacyTaxContext:freeze({
        pit:'47 % · OCDE 2025 · taux supérieur légal combiné',
        cit:'30 % · ancien repère général',
        consumption:'10 % · GST',
        use:'carte et filtre historiques uniquement',
        excludedFrom:['inspector','comparator'],
        reason:'Le PIT normalisé 2026–27 décrit le barème fédéral résident ; le 47 % OCDE 2025 décrit un autre périmètre et ne doit pas être présenté comme la même vérité.'
      })
    }),
    fields:freeze({
      tax_residency:record({
        state:'READY_WITH_CAVEAT',
        headline:'Plusieurs tests · pas de raccourci 183 jours',
        claim:'Australian tax residence is determined through multiple statutory/common-law tests; the ATO describes four tests. The 183-day test is not a universal shortcut.',
        summary:'La résidence fiscale australienne repose sur plusieurs tests légaux et de common law ; l’ATO en décrit quatre. Le test des 183 jours n’est pas un raccourci universel.',
        jurisdiction:'Australie · personne physique',
        scope:'Australian individual tax residence',
        verifiedOn:'2026-09-21',
        sourceVintage:'current ATO residency guidance',
        source:src('Australian Taxation Office','https://www.ato.gov.au/individuals-and-families/coming-to-australia-or-going-overseas/your-tax-residency','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+EVENT','ATO residency-test/statute/treaty change.'),
        caveat:'Multiple tests apply; the 183-day test is not universal. Do not derive tax residence from PIT rates or immigration status.',
        structure:freeze({tests:'multiple',atoTests:4,dayTestShortcutForbidden:true,immigrationStatusIsNotTaxResidence:true})
      }),
      pit:record({
        state:'READY_WITH_CAVEAT',
        headline:'15–45 % · résident 2026–27',
        claim:'from 1 July 2026 the resident schedule retains the AUD 18,200 tax-free threshold, then 15%, 30%, 37% and 45% marginal bands.',
        summary:'Depuis le 1er juillet 2026, le barème résident conserve un seuil non imposable de 18 200 AUD, puis des tranches marginales à 15 %, 30 %, 37 % et 45 %.',
        jurisdiction:'Australie · résident fiscal',
        scope:'Australian resident individual income tax',
        verifiedOn:'2026-09-21',
        sourceVintage:'2026–27 resident rates; effective 2026-07-01',
        sources:freeze([
          src('Australian Treasury','https://budget.gov.au/content/02-cost-of-living.htm','PRIMARY_GOV/FINANCE',{label:'Australian Treasury · Budget 2026–27'}),
          src('Australian Taxation Office','https://www.ato.gov.au/law/view/document?DocNum=0000081364&FullDocument=true','PRIMARY_GOV/FINANCE',{label:'ATO · resident rate schedule'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+TAX_YEAR','Federal budget/rate amendment or new income year.'),
        caveat:'AUD 18,200 tax-free threshold then 15/30/37/45 marginal bands; Medicare levy and offsets are additional. Do not present one scalar as the full liability.',
        structure:freeze({rateType:'progressive',taxFreeThresholdAUD:18200,marginalRates:[15,30,37,45],effectiveFrom:'2026-07-01',medicareLevySeparate:true,offsetsSeparate:true,allInScalarForbidden:true})
      }),
      cit_business:record({
        state:'READY_WITH_CAVEAT',
        headline:'30 % général · 25 % si éligible',
        claim:'ordinary company rate is 30%; qualifying base-rate entities use 25% from 2021–22 onward.',
        summary:'Le taux ordinaire des sociétés est de 30 % ; les base-rate entities éligibles utilisent 25 % depuis 2021–22.',
        jurisdiction:'Australie · sociétés',
        scope:'Australian company income tax',
        verifiedOn:'2026-09-21',
        sourceVintage:'current rate structure',
        source:src('Australian Taxation Office','https://www.ato.gov.au/tax-rates-and-codes/company-tax-rates','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+TAX_YEAR','Company-rate/base-rate-entity rule change.'),
        caveat:'30% general; qualifying base-rate entities 25%; eligibility and special-entity rules must be checked. Do not overwrite this boundary with a universal 25% or 30% scalar.',
        structure:freeze({generalRate:30,baseRateEntityRate:25,unit:'percent',eligibilitySensitive:true,specialRulesPossible:true})
      }),
      consumption_tax:record({
        state:'READY_FOR_PRODUCT',
        headline:'10 % · GST',
        claim:'GST is 10% on most goods and services.',
        summary:'La GST est de 10 % sur la plupart des biens et services.',
        jurisdiction:'Australie · GST',
        scope:'Australian GST',
        verifiedOn:'2026-09-21',
        sourceVintage:'current 10% rate',
        source:src('Australian Taxation Office','https://www.ato.gov.au/about-ato/research-and-statistics/in-detail/tax-gap/a-h-tax-gaps/goods-and-services-tax-gap/overview','PRIMARY_TAX_AUTHORITY'),
        freshness:fresh('CURRENT','ANNUAL+EVENT','GST rate/base reform.'),
        caveat:'Exemptions, GST-free/input-taxed supplies and registration rules differ. A 10% standard rate does not mean every transaction bears 10%.',
        structure:freeze({standardRate:10,unit:'percent',categorySensitive:true,registrationSensitive:true})
      }),
      cost_context:record({
        state:'READY_WITH_CAVEAT',
        headline:'Pression de coût · indicateur officiel trimestriel',
        claim:'Selected Living Cost Indexes provide current household-type cost-pressure movement; June 2026 quarter showed materially different movements by household type.',
        summary:'Les Selected Living Cost Indexes mesurent la variation récente des coûts selon le type de ménage ; au trimestre de juin 2026, les mouvements différaient sensiblement entre ménages.',
        jurisdiction:'Australie · ménages',
        scope:'Australian household living-cost pressure',
        verifiedOn:'2026-09-21',
        sourceVintage:'June quarter 2026, released 2026-08-05',
        source:src('Australian Bureau of Statistics','https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/selected-living-cost-indexes-australia/latest-release','PRIMARY_OFFICIAL_STATISTICS'),
        freshness:fresh('CURRENT','QUARTERLY','Next ABS Selected Living Cost Indexes release.'),
        caveat:'This is household-type cost movement, not a monthly expat budget or a city budget. Do not convert it into a synthetic cost-of-living score.',
        structure:freeze({measure:'Selected Living Cost Indexes',period:'June quarter 2026',releasedOn:'2026-08-05',householdTypeSensitive:true,monthlyBudget:false,cityBudget:false,scalarScoreForbidden:true})
      }),
      residence_visa:record({
        state:'READY_WITH_CAVEAT',
        headline:'Visite et Working Holiday · routes distinctes',
        claim:'French passport holders are eligible for the Working Holiday subclass 417 through age 35; short-visit/eVisitor status is a different route and is not settlement/work permission.',
        summary:'Les titulaires d’un passeport français peuvent être éligibles au Working Holiday subclass 417 jusqu’à 35 ans ; eVisitor est une route distincte et ne constitue pas un droit général de travail ou d’installation.',
        jurisdiction:'France → Australie · passeport français',
        scope:'French passport-holder route orientation',
        verifiedOn:'2026-09-21',
        sourceVintage:'current 2026 route rules',
        sources:freeze([
          src('Australian Department of Home Affairs','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417','PRIMARY_IMMIGRATION',{label:'Home Affairs · Working Holiday 417'}),
          src('Australian Department of Home Affairs','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651','PRIMARY_IMMIGRATION',{label:'Home Affairs · eVisitor 651'})
        ]),
        freshness:fresh('CURRENT','60D+EVENT','France eligibility/age/visa-condition or eVisitor/work-route change.'),
        caveat:'Visitor, Working Holiday, skilled and permanent routes are distinct. Do not infer settlement or work permission from visitor status.',
        structure:freeze({origin:'France',passport:'French',workingHolidaySubclass:417,workingHolidayMaxAge:35,eVisitorSubclass:651,routeSensitive:true,visitorIsNotSettlement:true,visitorIsNotGeneralWorkPermission:true})
      }),
      healthcare:record({
        state:'READY_WITH_CAVEAT',
        headline:'Medicare · selon statut et éligibilité',
        claim:'France is not one of the countries listed under Australia’s reciprocal health-care agreements. Medicare eligibility can arise through other qualifying status/residency routes.',
        summary:'La France ne figure pas parmi les pays couverts par les accords réciproques de santé australiens. Une éligibilité Medicare peut néanmoins découler d’autres statuts ou critères de résidence.',
        jurisdiction:'Australie · Medicare',
        scope:'Medicare eligibility / French visitor-resident orientation',
        verifiedOn:'2026-09-21',
        sourceVintage:'current RHCA/Medicare guidance',
        sources:freeze([
          src('Services Australia','https://www.servicesaustralia.gov.au/reciprocal-health-care-agreements','PRIMARY_GOV/HEALTH',{label:'Services Australia · reciprocal health-care agreements'}),
          src('Services Australia','https://www.servicesaustralia.gov.au/enrolling-medicare','PRIMARY_GOV/HEALTH',{label:'Services Australia · enrolling in Medicare'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+REFORM','RHCA list or Medicare eligibility reform.'),
        caveat:'Do not infer “no Medicare” solely because France is not on the RHCA list. Eligibility depends on qualifying status/residency routes.',
        structure:freeze({rhcaCountry:false,statusDependent:true,residencyDependent:true,blanketCoveredForbidden:true,blanketExcludedForbidden:true})
      }),
      safety_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'Vigilance normale · aléas régionaux et saisonniers',
        claim:'overall normal vigilance, with material natural-hazard variation including bushfires, floods and tropical cyclones depending on region/season.',
        summary:'Vigilance normale dans l’ensemble, avec des aléas naturels importants — feux de brousse, inondations et cyclones tropicaux — qui varient selon la région et la saison.',
        jurisdiction:'Australie · voyageurs français',
        scope:'Australia safety/travel context for French users',
        verifiedOn:'2026-09-21',
        sourceVintage:'reviewed 2026-09-15',
        source:src('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/australie/conseils-aux-voyageurs-securite','PRIMARY_CONSULAR'),
        freshness:fresh('CURRENT','60D+EVENT','Travel-advice or natural-hazard update.'),
        caveat:'Normal vigilance overall; bushfires, floods and cyclones vary by region and season. Do not convert travel advice or governance indicators into a universal safety score.',
        structure:freeze({overall:'normal_vigilance',hazards:['bushfires','floods','tropical_cyclones'],regionSensitive:true,seasonSensitive:true,scalarScoreForbidden:true})
      })
    })
  });

  const validation=core.validateCountry(AUS);
  if(!validation.ok){
    console.error('ATLAS PEX-D1B Australia contract invalid',validation);
    return;
  }

  /* Expose Australia through the same public evidence API without mutating the
     frozen PEX-D1A registry. The original THA object remains byte/identity-stable. */
  const mergedCountries=freeze({...core.countries,AUS});
  root.ATLAS_COUNTRY_EVIDENCE=freeze({...core,countries:mergedCountries});
  root.ATLAS_COUNTRY_EVIDENCE_AUSTRALIA=freeze({country:AUS,validation,legacyPolicy:AUS.existingContext.legacyTaxContext});

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
    return `<details class="context-disclosure atlas-evidence" data-atlas-australia-evidence data-country="AUS" open><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">EVIDENCE LAYER · ${esc(AUS.schemaVersion)}</span><p>8 repères officiels vérifiés, avec périmètre, fraîcheur et limites. Aucun score de « complétude » ni conseil personnalisé.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${fiscal.map(k=>rowMarkup(k,AUS.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${practical.map(k=>rowMarkup(k,AUS.fields[k])).join('')}</div></section></details>`;
  }

  function reconcileInspector(container){
    const legacyTax=container.querySelector('.tax-stack');
    if(legacyTax){legacyTax.hidden=true;legacyTax.dataset.atlasLegacyReconciled='AUS';}
    const legacyDisclosure=container.querySelector('.source-disclosure');
    if(legacyDisclosure){legacyDisclosure.hidden=true;legacyDisclosure.dataset.atlasLegacyReconciled='AUS';}
  }

  function enhanceInspector(){
    const container=document.querySelector('#inspectorContent');
    if(!container)return;
    const id=activeCountryId(container);
    const existing=container.querySelector('[data-atlas-australia-evidence]');
    if(id!=='AUS'){
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

  function fiscalSourceMarkup(){
    const keys=['pit','cit_business','consumption_tax'];
    return keys.map(k=>core.renderSources(AUS.fields[k])).join('');
  }

  function reconcileComparator(){
    const table=document.querySelector('#compareTable table');
    if(!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const ausIndex=headers.findIndex(th=>th.querySelector('.eyebrow')?.textContent.trim()==='AUS');
    if(ausIndex<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=(label)=>rowByLabel(label)?.querySelectorAll('td')?.[ausIndex]||null;
    const set=(label,html)=>{const target=cell(label);if(target){target.innerHTML=html;target.dataset.atlasNormalized='AUS';}};
    set('Revenu','<span class="val">15–45 %</span><small>Résident 2026–27 · seuil 18 200 AUD · Medicare levy et offsets distincts</small>');
    set('Sociétés','<span class="val">30 % général · 25 % si éligible</span><small>Base-rate entities sous conditions</small>');
    set('TVA / consommation','<span class="val">10 %</span><small>GST standard · exemptions et règles d’inscription distinctes</small>');
    set('Taxes particulières','<small>Les périmètres fiscal, Medicare, statut migratoire et GST restent distincts ; aucune addition automatique.</small>');
    set('Sources',fiscalSourceMarkup());
  }

  function mount(){
    const inspector=document.querySelector('#inspectorContent');
    if(inspector){
      enhanceInspector();
      new MutationObserver(()=>queueMicrotask(enhanceInspector)).observe(inspector,{childList:true,subtree:true});
    }
    const compare=document.querySelector('#compareTable');
    if(compare){
      reconcileComparator();
      new MutationObserver(()=>queueMicrotask(reconcileComparator)).observe(compare,{childList:true,subtree:true});
    }
    document.addEventListener('click',()=>setTimeout(()=>{enhanceInspector();reconcileComparator();},0));
    window.addEventListener('hashchange',()=>setTimeout(enhanceInspector,0));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null));
