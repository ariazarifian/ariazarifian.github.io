/* PEX-D1H — United Kingdom normalized country evidence. DEX-20 accepted 2026-09-22. */
(function bootUnitedKingdom(root){
'use strict';
if(!root||!root.document)return;
let attempts=0;
function boot(){
  const core=root.ATLAS_COUNTRY_EVIDENCE;
  if(!core){if(attempts++<200)root.setTimeout(boot,40);return;}
  if(root.ATLAS_COUNTRY_EVIDENCE_UNITED_KINGDOM)return;

  const freeze=o=>Object.freeze(o);
  const src=(owner,locator,sourceClass,meta={})=>freeze({owner,locator,sourceClass,...meta});
  const fresh=(state,cadence,trigger)=>freeze({state,cadence,trigger});
  const record=o=>freeze(o);
  const GBR=freeze({
    country:'Royaume-Uni',iso3:'GBR',integrationState:'published',schemaVersion:'country-evidence-v1',evidenceBatch:'DEX-20',acceptedOn:'2026-09-22',
    existingContext:freeze({
      mode:'passthrough-with-reconciliation',
      keys:['population','gdpPerCapita','stability','tax','corporateTax','consumptionTax','residence'],
      legacyTaxContext:freeze({
        partial:['pit','cit_business','consumption_tax','residence_visa'],
        missing:['tax_residency','cost_context','healthcare','safety_context'],
        use:'carte et filtres contextuels uniquement après réconciliation',
        excludedFrom:['inspector','comparator'],
        reason:'Le module normalisé DEX-20 devient la seule vérité utilisateur pour les huit champs.'
      })
    }),
    fields:freeze({
      tax_residency:record({
        state:'READY_FOR_PRODUCT',
        headline:'SRT multi-tests · 183 jours = un test, pas la règle unique',
        claim:'The UK Statutory Residence Test combines automatic overseas tests, automatic UK tests and sufficient-ties rules. 183 days is one automatic UK test, not the only route to UK tax residence.',
        summary:'Le Statutory Residence Test combine tests automatiques hors Royaume-Uni, tests automatiques au Royaume-Uni et sufficient ties. Le seuil de 183 jours n’est qu’un des tests possibles.',
        jurisdiction:'Royaume-Uni · personne physique',scope:'UK individual tax residence',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('HM Revenue & Customs / GOV.UK','https://www.gov.uk/tax-foreign-income/residence','PRIMARY_TAX_AUTHORITY',{label:'HMRC · résidence fiscale / Statutory Residence Test'}),
        freshness:fresh('CURRENT','ANNUAL+EVENT','SRT rule/guidance change'),
        caveat:'183 days is one automatic UK test, not the only test.',
        structure:freeze({statutoryResidenceTest:true,automaticOverseasTests:true,automaticUkTests:true,sufficientTies:true,day183OnlyOneRoute:true,universal183DayRule:false})
      }),
      pit:record({
        state:'READY_FOR_PRODUCT',
        headline:'20–45 % E/W/NI · Écosse séparée',
        claim:'For the 6 April 2026–5 April 2027 tax year, the standard Personal Allowance is £12,570 and the main England/Wales/Northern Ireland Income Tax bands remain 20%, 40% and 45% under the current GOV.UK schedule. Scotland has a separate Scottish Income Tax schedule and must not inherit the England/Wales/Northern Ireland scalar.',
        summary:'Pour 2026–27, l’allocation personnelle standard est de 12 570 £ et les principaux taux Angleterre/Pays de Galles/Irlande du Nord sont 20 %, 40 % et 45 %. L’Écosse suit un barème distinct.',
        jurisdiction:'Royaume-Uni · PIT ; Écosse distincte',scope:'England/Wales/Northern Ireland PIT; Scotland separate',verifiedOn:'2026-09-21',sourceVintage:'2026-27 tax year',
        source:src('HM Revenue & Customs / GOV.UK','https://www.gov.uk/income-tax-rates','PRIMARY_TAX_AUTHORITY',{label:'HMRC · Income Tax rates and allowances'}),
        freshness:fresh('CURRENT','ANNUAL+TAX_YEAR','new tax-year bands or Scottish rates'),
        caveat:'Do not apply England/Wales/Northern Ireland bands to Scotland; Personal Allowance tapers at high income and some income categories differ.',
        structure:freeze({taxYear:'2026-27',standardPersonalAllowanceGBP:12570,englandWalesNorthernIrelandMainRates:freeze([20,40,45]),scotlandSeparateSchedule:true,ukWideScalarForbidden:true})
      }),
      cit_business:record({
        state:'READY_FOR_PRODUCT',
        headline:'19 % ≤ £50k · 25 % > £250k · relief entre les deux',
        claim:'UK Corporation Tax uses a 19% small-profits rate at £50,000 or less and a 25% main rate above £250,000, with marginal relief between those thresholds; thresholds can be adjusted for associated companies and short accounting periods.',
        summary:'Le taux small profits est de 19 % à 50 000 £ ou moins, le taux principal de 25 % au-dessus de 250 000 £, avec marginal relief entre les deux. Les seuils peuvent être ajustés.',
        jurisdiction:'Royaume-Uni · sociétés',scope:'UK corporation tax',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('HM Revenue & Customs / GOV.UK','https://www.gov.uk/corporation-tax-rates','PRIMARY_TAX_AUTHORITY',{label:'HMRC · Corporation Tax rates'}),
        freshness:fresh('CURRENT','ANNUAL+EVENT','corporation-tax threshold/rate change'),
        caveat:'19% small profits, 25% main rate, with marginal relief and associated-company adjustments.',
        structure:freeze({smallProfitsRate:19,smallProfitsUpperGBP:50000,mainRate:25,mainRateAboveGBP:250000,marginalReliefBetween:true,associatedCompanyAdjustments:true,shortAccountingPeriodAdjustments:true,singleScalarForbidden:true})
      }),
      consumption_tax:record({
        state:'READY_FOR_PRODUCT',
        headline:'TVA 20 % standard · réduits / 0 % / exonérés distincts',
        claim:'The UK standard VAT rate is 20%, with reduced-rate, zero-rated and exempt categories that must remain distinct from the standard rate.',
        summary:'Le taux standard de TVA est de 20 %. Les opérations à taux réduit, taux zéro ou exonérées restent des catégories distinctes et ne doivent pas être assimilées au taux standard.',
        jurisdiction:'Royaume-Uni · VAT',scope:'UK VAT',verifiedOn:'2026-09-21',sourceVintage:'current',
        source:src('HM Revenue & Customs / GOV.UK','https://www.gov.uk/charge-reclaim-record-vat/charging-vat','PRIMARY_TAX_AUTHORITY',{label:'HMRC · Charging VAT'}),
        freshness:fresh('CURRENT','ANNUAL+EVENT','VAT rate/rule change'),
        caveat:'20% is the standard rate; reduced, zero-rated and exempt categories exist.',
        structure:freeze({standardRate:20,reducedRateCategories:true,zeroRatedCategories:true,exemptCategories:true,categorySensitive:true})
      }),
      cost_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'676,60 £ / semaine · ménage moyen (FYE 2025)',
        claim:'ONS Family Spending for financial year ending 2025 reports average UK household expenditure of about £676.60 per week.',
        summary:'L’ONS rapporte environ 676,60 £ de dépenses hebdomadaires moyennes par ménage pour l’exercice se terminant en 2025.',
        jurisdiction:'Royaume-Uni · ménages',scope:'UK households',verifiedOn:'2026-09-21',sourceVintage:'FYE 2025',
        source:src('Office for National Statistics','https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure/bulletins/familyspendingintheuk/latest','PRIMARY_OFFICIAL_STATISTICS',{label:'ONS · Family Spending in the UK'}),
        freshness:fresh('CURRENT','ON_NEW_SURVEY','new Family Spending release'),
        caveat:'This is a UK household average, not an expatriate or single-person budget; London and regional dispersion are large.',
        structure:freeze({population:'households',measure:'average_weekly_household_expenditure',averageWeeklyHouseholdExpenditureGBP:676.60,period:'FYE 2025',expatBudget:false,singlePersonBudget:false,regionalDispersionMaterial:true})
      }),
      residence_visa:record({
        state:'READY_FOR_PRODUCT',
        headline:'ETA visite ≠ travail · Skilled Worker = route séparée',
        claim:'French citizens may require an ETA for qualifying visits, but an ETA is not permission for ordinary UK work or residence. Skilled Worker is a separate route requiring route-specific eligibility including an approved sponsor, eligible role, Certificate of Sponsorship and applicable salary/going-rate rules.',
        summary:'Une ETA peut être requise pour certaines visites de ressortissants français, mais elle n’autorise pas le travail ordinaire ni la résidence. Skilled Worker est une voie séparée avec sponsor, emploi éligible, CoS et règles salariales propres.',
        jurisdiction:'France → Royaume-Uni',scope:'French citizen visit/work/residence orientation',verifiedOn:'2026-09-21',sourceVintage:'current',
        sources:freeze([
          src('UK Home Office / GOV.UK','https://www.gov.uk/guidance/check-when-you-can-get-an-electronic-travel-authorisation-eta','PRIMARY_IMMIGRATION',{label:'GOV.UK · quand obtenir une ETA'}),
          src('UK Home Office / GOV.UK','https://www.gov.uk/eta/what-you-can-cannot-do','PRIMARY_IMMIGRATION',{label:'GOV.UK · ce que l’ETA permet / ne permet pas'}),
          src('UK Home Office / GOV.UK','https://www.gov.uk/skilled-worker-visa','PRIMARY_IMMIGRATION',{label:'GOV.UK · Skilled Worker visa'})
        ]),
        freshness:fresh('CURRENT','60D+EVENT','ETA/work-route rule or salary threshold change'),
        caveat:'ETA is not work/residence permission; work routes require route-specific eligibility.',
        structure:freeze({origin:'France',etaVisitOnly:true,etaWorkPermission:false,etaResidencePermission:false,skilledWorkerSeparateRoute:true,approvedSponsorRequired:true,eligibleRoleRequired:true,certificateOfSponsorshipRequired:true,salaryRulesApply:true,eligibilityDetermination:false})
      }),
      healthcare:record({
        state:'READY_FOR_PRODUCT',
        headline:'NHS / IHS selon statut · pas de droit automatique post-Brexit',
        claim:'Long-term UK immigration routes often involve the Immigration Health Surcharge, while NHS access depends on immigration and ordinary-residence rules. Moving from the EU after Brexit does not recreate EU free-movement healthcare rights.',
        summary:'Les voies d’immigration de long terme impliquent souvent l’Immigration Health Surcharge. L’accès au NHS dépend du statut et des règles d’ordinary residence ; le post-Brexit ne recrée pas la libre circulation sanitaire de l’UE.',
        jurisdiction:'Royaume-Uni · immigration / NHS',scope:'Long-term visa/NHS access',verifiedOn:'2026-09-21',sourceVintage:'current',
        sources:freeze([
          src('GOV.UK / NHS','https://www.gov.uk/guidance/healthcare-for-eu-and-efta-nationals-living-in-the-uk','PRIMARY_GOV/HEALTH',{label:'GOV.UK · santé des ressortissants UE/AELE au Royaume-Uni'}),
          src('GOV.UK','https://www.gov.uk/healthcare-immigration-application','PRIMARY_GOV/HEALTH',{label:'GOV.UK · Immigration Health Surcharge'})
        ]),
        freshness:fresh('CURRENT','ANNUAL+REFORM','IHS/NHS eligibility change'),
        caveat:'Immigration/ordinary-residence status matters; post-Brexit rules differ from EU free movement.',
        structure:freeze({immigrationStatusMatters:true,ordinaryResidenceMatters:true,immigrationHealthSurchargeMayApply:true,automaticNhsFromFrenchNationality:false,euFreeMovementHealthcareRestored:false})
      }),
      safety_context:record({
        state:'READY_FOR_PRODUCT',
        headline:'Vigilance normale · contexte, pas score',
        claim:'France Diplomatie United Kingdom guidance verified for 15 September 2026 indicates normal vigilance; safety remains contextual and should not be converted into a country safety scalar.',
        summary:'France Diplomatie indique une vigilance normale. Le repère reste contextuel et daté : il ne devient ni une note de sécurité générale ni une probabilité individuelle de risque.',
        jurisdiction:'Royaume-Uni · voyageurs français',scope:'UK safety context for French users',verifiedOn:'2026-09-21',sourceVintage:'2026-09-15',
        source:src('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/royaume-uni/conseils-aux-voyageurs-securite','PRIMARY_CONSULAR',{label:'France Diplomatie · Royaume-Uni · sécurité'}),
        freshness:fresh('CURRENT','90D+EVENT','travel-advice update'),
        caveat:'Normal vigilance; no scalar.',
        structure:freeze({vigilance:'normal',timeSensitive:true,contextual:true,scalarScoreForbidden:true})
      })
    })
  });

  const validation=core.validateCountry(GBR);
  if(!validation.ok){console.error('ATLAS PEX-D1H United Kingdom contract invalid',validation);return;}
  const mergedCountries=freeze({...core.countries,GBR});
  root.ATLAS_COUNTRY_EVIDENCE=freeze({...core,countries:mergedCountries});
  root.ATLAS_COUNTRY_EVIDENCE_UNITED_KINGDOM=freeze({country:GBR,validation,legacyPolicy:GBR.existingContext.legacyTaxContext});

  function reconcileLegacyData(){
    const d=root.ATLAS_COMMERCE;
    if(d){
      d.sources=d.sources||{};
      Object.assign(d.sources,{
        ukCorpHMRC:{name:'HMRC · Corporation Tax rates',url:'https://www.gov.uk/corporation-tax-rates'},
        ukVatHMRC:{name:'HMRC · VAT rates',url:'https://www.gov.uk/charge-reclaim-record-vat/charging-vat'}
      });
      const old=d.countries?.GBR||{};
      if(d.countries)d.countries.GBR={...old,cit:'19–25 % selon bénéfice',citScope:'19 % small profits ≤ 50 000 £ · 25 % main rate > 250 000 £ · marginal relief entre les deux · seuils ajustables',vat:'20 % standard',vatScope:'TVA standard · taux réduit, zéro et exonérations distincts',sources:[...new Set([...(old.sources||[]),'ukCorpHMRC','ukVatHMRC'])],checked:'HMRC · vérifié 21.09.2026'};
    }
    const pit={tax:null,taxLabel:'E/W/NI 20–45 % · Écosse distincte',taxYear:'2026–27 · HMRC vérifié 21.09.2026',scope:'PIT Angleterre/Pays de Galles/Irlande du Nord · Écosse séparée',note:'Les principaux taux E/W/NI sont 20 %, 40 % et 45 %, avec Personal Allowance standard de 12 570 £. L’Écosse a son propre barème ; aucun taux UK tout compris n’est affiché.',src:null,taxKind:'current-reference'};
    if(root.ATLAS_TAX?.GBR)Object.assign(root.ATLAS_TAX.GBR,pit);
    if(root.ATLAS_CATALOG?.GBR)Object.assign(root.ATLAS_CATALOG.GBR,pit);
  }
  reconcileLegacyData();

  function reconcileExplorerRuntime(){
    const explorer=root.AtlasExplorer;
    const country=explorer?.getCountries?.().find(c=>c.id==='GBR');
    if(!country)return false;
    Object.assign(country,{tax:null,taxLabel:'E/W/NI 20–45 % · Écosse distincte',taxYear:'2026–27 · HMRC vérifié 21.09.2026',scope:'PIT Angleterre/Pays de Galles/Irlande du Nord · Écosse séparée',note:'Les principaux taux E/W/NI sont 20 %, 40 % et 45 %, avec Personal Allowance standard de 12 570 £. L’Écosse a son propre barème ; aucun taux UK tout compris n’est affiché.',src:null,taxKind:'current-reference'});
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
  function panelMarkup(){const fiscal=['tax_residency','pit','cit_business','consumption_tax'],practical=['cost_context','residence_visa','healthcare','safety_context'];return `<details class="context-disclosure atlas-evidence" data-atlas-united-kingdom-evidence data-country="GBR"><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">EVIDENCE LAYER · ${esc(GBR.schemaVersion)}</span><p>8 repères officiels DEX-20, 11 sources directes et 2 ensembles multi-sources. Résidence fiscale, PIT écossais, immigration et santé restent conditionnels ; aucun score ou taux total synthétique.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${fiscal.map(k=>rowMarkup(k,GBR.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${practical.map(k=>rowMarkup(k,GBR.fields[k])).join('')}</div></section></details>`;}
  function reconcileInspector(container){const legacyTax=container.querySelector('.tax-stack');if(legacyTax){legacyTax.hidden=true;legacyTax.dataset.atlasLegacyReconciled='GBR';}const legacyDisclosure=container.querySelector('.source-disclosure');if(legacyDisclosure){legacyDisclosure.hidden=true;legacyDisclosure.dataset.atlasLegacyReconciled='GBR';}for(const section of container.querySelectorAll('.detail-section')){const heading=section.querySelector('h3')?.textContent?.trim();if(heading==='INSTALLATION · PREMIER REPÈRE'){section.hidden=true;section.dataset.atlasLegacyReconciled='GBR';}}}
  function enhanceInspector(){const container=document.querySelector('#inspectorContent');if(!container)return;const id=activeCountryId(container),existing=container.querySelector('[data-atlas-united-kingdom-evidence]');if(id!=='GBR'){if(existing)existing.remove();return;}reconcileInspector(container);if(existing)return;const anchor=container.querySelector('.capital-card')||container.querySelector('.tax-stack')||container.querySelector('.detail-section');if(!anchor)return;const wrapper=document.createElement('div');wrapper.innerHTML=panelMarkup();anchor.insertAdjacentElement('afterend',wrapper.firstElementChild);}
  function mountInspector(){const container=document.querySelector('#inspectorContent');if(!container)return;enhanceInspector();new MutationObserver(()=>queueMicrotask(enhanceInspector)).observe(container,{childList:true,subtree:true});}

  function reconcileComparator(){
    const table=document.querySelector('#compareTable table');
    if(!table)return;
    const headers=[...table.querySelectorAll('thead th')];
    const idx=headers.findIndex(th=>/Royaume-Uni|United Kingdom/i.test(th.textContent||''));
    if(idx<1)return;
    const rowByLabel=label=>[...table.querySelectorAll('tbody tr')].find(tr=>tr.querySelector('td')?.textContent.trim()===label);
    const cell=label=>rowByLabel(label)?.querySelectorAll('td')?.[idx]||null;
    const set=(label,html)=>{const target=cell(label);if(!target||target.dataset.atlasNormalized==='GBR')return;target.innerHTML=html;target.dataset.atlasNormalized='GBR';};
    const sourceHtml=['tax_residency','pit','cit_business','consumption_tax'].map(k=>core.renderSources(GBR.fields[k])).join('');
    set('Revenu','<span class="val">E/W/NI 20–45 % · Écosse distincte</span><small>2026–27 · Personal Allowance standard 12 570 £ · le barème écossais reste séparé</small>');
    set('Sociétés','<span class="val">19 % petites bénéfices · 25 % principal</span><small>≤ 50 000 £ / > 250 000 £ · marginal relief entre les seuils · ajustements possibles</small>');
    set('TVA / consommation','<span class="val">20 % standard</span><small>Taux réduit, taux zéro et exonérations restent des catégories distinctes</small>');
    set('Taxes particulières','<small>SRT, PIT écossais, ETA, Skilled Worker et accès NHS/IHS restent des objets distincts ; aucune équivalence ou addition automatique.</small>');
    set('Sources',sourceHtml);
  }
  function bindComparator(){const host=document.querySelector('#compareTable');if(!host||host.dataset.atlasGbrComparatorBound==='true')return;host.dataset.atlasGbrComparatorBound='true';reconcileComparator();new MutationObserver(()=>queueMicrotask(reconcileComparator)).observe(host,{childList:true,subtree:true});}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{mountInspector();bindComparator();},{once:true});else{mountInspector();bindComparator();}
}
boot();
})(typeof window!=='undefined'?window:null);