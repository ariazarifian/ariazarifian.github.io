/* Atlas Exit — normalized country evidence layer. Product-owned presentation contract; evidence comes from Chief-approved handoffs. */
(()=>{'use strict';
const CORE_FIELDS=['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'];
const EXISTING_COMPARISON_FIELDS=['governance','population','gdp_per_capita'];
const record=(claim,source)=>Object.freeze({evidenceState:'READY',...claim,source:Object.freeze(source)});
const SOURCE={
  rdCode:{owner:'Thailand Revenue Department',url:'https://www.rd.go.th/english/37749.html',sourceClass:'PRIMARY_STATUTE/TAX_AUTHORITY'},
  rdRates:{owner:'Thailand Revenue Department',url:'https://www.rd.go.th/english/52471.html',sourceClass:'PRIMARY_TAX_AUTHORITY'},
  nso:{owner:'Thailand National Statistical Office',url:'https://www.nso.go.th/public/e-book/Statistical-Yearbook/SYB-2025/295/',sourceClass:'PRIMARY_OFFICIAL_STATISTICS'},
  mfa:{owner:'Thailand MFA + France Diplomatie',url:'https://www.mfa.go.th/en/content/pb-summary-03092026-en',sourceClass:'PRIMARY_IMMIGRATION/CONSULAR'},
  mol:{owner:'Thailand Ministry of Labour',url:'https://www.mol.go.th/en/news/labour-minister-visits-trang-to-follow-up-and-drive-legal-employment-of-foreign-workers-100-percent-covered-under-social-security',sourceClass:'PRIMARY_MINISTRY/SOCIAL_SECURITY'},
  safety:{owner:'France Diplomatie',url:'https://www.diplomatie.gouv.fr/fr/information-par-pays/thailande/conseils-aux-voyageurs-securite',sourceClass:'PRIMARY_CONSULAR'}
};
const common={verifiedOn:'2026-09-21'};
const THA=Object.freeze({
  country:'Thaïlande',iso3:'THA',
  fields:Object.freeze({
    tax_residency:record({label:'Résidence fiscale',headline:'180 jours ou plus / an',summary:'La section 41 retient 180 jours ou plus de présence agrégée sur l’année. Les revenus de source étrangère peuvent entrer dans l’assiette lorsqu’ils sont gagnés pendant une année de résidence et transférés en Thaïlande ; conventions, crédits d’impôt et nature du revenu peuvent modifier le résultat.',jurisdiction:'Thailand individual tax residence',...common,sourceDate:'current law + 2026 guidance',freshnessState:'CURRENT',freshnessCadence:'ANNUAL+EVENT',nextReviewTrigger:'new tax-year guidance or foreign-income rule change',caveat:'180+ aggregate days; foreign-source/remittance outcome remains treaty/income-specific'},SOURCE.rdCode),
    pit:record({label:'Impôt sur le revenu',headline:'5–35 %',summary:'Barème progressif ; 35 % est le taux supérieur de référence. Aucun barème détaillé 2026 n’est déduit d’anciennes tables sans nouvelle validation.',jurisdiction:'Thailand PIT',...common,sourceDate:'current rate page; 2026 foreign-income materials',freshnessState:'CURRENT',freshnessCadence:'ANNUAL+TAX_YEAR',nextReviewTrigger:'new tax-year rate/bracket publication',caveat:'Use 5–35% / top 35%; do not hard-code detailed brackets from legacy pages without recheck'},SOURCE.rdRates),
    cit_business:record({label:'Impôt sur les sociétés',headline:'20 %',summary:'Référence générale de 20 % du bénéfice net ; le régime et la situation du contribuable peuvent modifier le traitement.',jurisdiction:'Thailand corporate income tax',...common,sourceDate:'current rate page',freshnessState:'CURRENT',freshnessCadence:'ANNUAL+EVENT',nextReviewTrigger:'corporate-rate/regime change',caveat:'20% general reference; taxpayer/regime variations apply'},SOURCE.rdRates),
    consumption_tax:record({label:'TVA',headline:'7 %',summary:'Taux de référence de 7 % ; certaines catégories ou situations peuvent relever d’un traitement différent.',jurisdiction:'Thailand VAT',...common,sourceDate:'current rate page',freshnessState:'CURRENT',freshnessCadence:'ANNUAL+EVENT',nextReviewTrigger:'VAT rate/regime change',caveat:'7% reference; special categories can differ'},SOURCE.rdRates),
    cost_context:record({label:'Coût · repère statistique',headline:'30 464 THB / mois · Grand Bangkok',summary:'Dépense mensuelle moyenne par ménage en 2024 : 30 464 THB dans le Grand Bangkok et 22 282 THB au niveau national. Ce sont des statistiques de ménages, pas un budget d’expatrié ni un coût individuel attendu.',jurisdiction:'Thailand households; national + Greater Bangkok',...common,sourceDate:'2024 household expenditure / 2025 yearbook',freshnessState:'CURRENT-BUT-ANNUAL',freshnessCadence:'ON_NEW_SURVEY',nextReviewTrigger:'new SES/household expenditure release',caveat:'Household statistic, not an expat or single-person budget'},SOURCE.nso),
    residence_visa:record({label:'Entrée & séjour',headline:'30 jours · tourisme',summary:'Depuis le 15 septembre 2026, un passeport français ordinaire peut relever d’une exemption jusqu’à 30 jours pour tourisme. Travailler, s’installer ou rester plus longtemps exige de vérifier la catégorie adaptée ; les voies de long séjour sont distinctes.',jurisdiction:'French ordinary-passport short stay; Thailand',...common,sourceDate:'policy effective 2026-09-15',freshnessState:'CURRENT',freshnessCadence:'30D+EVENT',nextReviewTrigger:'entry/visa-exemption/work-right rule change',caveat:'30-day tourism exemption is not work or settlement permission; long-stay routes are separate'},SOURCE.mfa),
    healthcare:record({label:'Santé & couverture',headline:'Selon le statut',summary:'Les salariés étrangers qui entrent dans le régime de sécurité sociale peuvent avoir des droits médicaux. Un résident étranger hors de ce régime ne doit pas supposer une couverture automatique : l’éligibilité dépend du statut.',jurisdiction:'Thailand foreign workers / insured employees',...common,sourceDate:'current ministry material',freshnessState:'CURRENT',freshnessCadence:'ANNUAL+REFORM',nextReviewTrigger:'social-security or foreign-worker coverage reform',caveat:'Coverage is status-dependent; do not imply universal foreign-resident entitlement'},SOURCE.mol),
    safety_context:record({label:'Sécurité',headline:'Contexte géographique',summary:'Les recommandations françaises sont géographiques et évolutives ; certaines zones frontalières et de l’extrême-sud sont actuellement déconseillées. Atlas n’en déduit aucun score national de sécurité.',jurisdiction:'Thailand geographic travel/safety context for French users',...common,sourceDate:'updated 2026-09-15',freshnessState:'CURRENT',freshnessCadence:'30D+EVENT',nextReviewTrigger:'travel-advice map or regional-security update',caveat:'Geographic/time-sensitive; no country safety scalar'},SOURCE.safety)
  })
});
const COUNTRIES=Object.freeze({THA});
const hold=(iso3,key)=>Object.freeze({evidenceState:'HOLD',iso3,field:key,claim:null,source:null,caveat:'Aucune valeur n’est déduite sans preuve pays/champ validée.'});
const api=Object.freeze({
  version:'pex-d0-20260921',coreFields:Object.freeze([...CORE_FIELDS]),existingComparisonFields:Object.freeze([...EXISTING_COMPARISON_FIELDS]),countries:COUNTRIES,
  getCountry:iso3=>COUNTRIES[iso3]||null,
  getField:(iso3,key)=>COUNTRIES[iso3]?.fields?.[key]||hold(iso3,key),
  internalCoverage:iso3=>{const f=COUNTRIES[iso3]?.fields||{};return Object.freeze({readyKeys:CORE_FIELDS.filter(k=>f[k]?.evidenceState==='READY'),holdKeys:CORE_FIELDS.filter(k=>f[k]?.evidenceState!=='READY')});}
});
window.ATLAS_COUNTRY_EVIDENCE=api;

/* Bridge the normalized layer into the legacy tax cards without changing the Explorer interaction engine. */
const com=window.ATLAS_COMMERCE;
if(com){
  Object.assign(com.sources,{
    thaRevenueCode:{name:'Thailand Revenue Department · Revenue Code, section 41',url:SOURCE.rdCode.url},
    thaRevenueRates:{name:'Thailand Revenue Department · tax rates',url:SOURCE.rdRates.url}
  });
  com.countries.THA={
    pit:'5–35 %',pitScope:'Barème progressif · taux supérieur de référence, hors calcul personnalisé',
    cit:'20 %',citScope:'Référence générale sur bénéfice net · régimes et cas particuliers distincts',
    vat:'7 %',vatScope:'TVA · taux de référence, catégories particulières possibles',
    special:'Résidence fiscale, source du revenu, remises en Thaïlande et conventions peuvent modifier le résultat. Les taux affichés ne sont pas un calcul d’impôt personnel.',
    nationality:'Nationalité / naturalisation : hors périmètre de cette première vague Explorer. Atlas n’en déduit rien sans source officielle dédiée validée.',
    treaty:'Convention France–Thaïlande : hors périmètre de cette première vague Explorer. Aucun effet conventionnel n’est déduit des seuls taux affichés.',
    capital:{headline:'Hors périmètre de cette vague',summary:'Aucun taux de dividendes ou plus-values n’est déduit sans source dédiée.',note:'Bloc conservé en HOLD jusqu’à une preuve pays/champ validée.',sources:[]},
    sources:['thaRevenueRates','thaRevenueCode']
  };
}
const catalog=window.ATLAS_CATALOG;
if(catalog?.THA){Object.assign(catalog.THA,{tax:35,taxLabel:'5–35 %',scope:'Barème progressif · repère national',taxYear:'Cadre vérifié 21.09.2026',src:'thailandTax',taxKind:'current-reference',note:'Taux supérieur 35 %. Résidence fiscale, revenus étrangers, déductions et nature du revenu se vérifient séparément.'});}

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fieldSource=f=>`<a class="detail-source" href="${esc(f.source.url)}" target="_blank" rel="noopener noreferrer">${esc(f.source.owner)} ↗</a>`;
const evidenceDetail=(key,f)=>`<div class="country-evidence__item"><p><strong>${esc(f.label)}</strong> · ${esc(f.headline)}</p><p class="micro">${esc(f.source.sourceClass)} · ${esc(f.jurisdiction)} · vérifié le ${esc(f.verifiedOn)} · ${esc(f.freshnessState)}</p><p class="micro">Limite : ${esc(f.caveat)}</p>${fieldSource(f)}</div>`;
function renderThailandEvidence(root){
  if(root.querySelector('[data-country-evidence="THA"]'))return;
  const body=root.querySelector('.inspector-body'),code=root.querySelector('.inspector-title .country-code')?.textContent?.trim();
  if(!body||code!=='THA')return;
  const f=THA.fields,anchor=body.querySelector('.detail-section');if(!anchor)return;
  const section=document.createElement('section');section.className='detail-section';section.dataset.countryEvidence='THA';
  section.innerHTML=`<h3>VIVRE & S’INSTALLER · REPÈRES SOURCÉS</h3><div class="local-time"><span>Résidence fiscale</span><time>${esc(f.tax_residency.headline)}</time></div><p>${esc(f.tax_residency.summary)}</p><div class="local-time"><span>Court séjour · passeport français</span><time>${esc(f.residence_visa.headline)}</time></div><p>${esc(f.residence_visa.summary)}</p><div class="metrics-pair"><div><small>GRAND BANGKOK · MÉNAGE 2024</small><strong>30 464 THB</strong><p class="scope">dépense moyenne / mois</p></div><div><small>THAÏLANDE · MÉNAGE 2024</small><strong>22 282 THB</strong><p class="scope">dépense moyenne / mois</p></div></div><p>${esc(f.cost_context.summary)}</p><p><strong>Santé.</strong> ${esc(f.healthcare.summary)}</p><p><strong>Sécurité.</strong> ${esc(f.safety_context.summary)}</p>`;
  const details=document.createElement('details');details.className='source-disclosure';details.dataset.countryEvidenceSources='THA';details.innerHTML=`<summary>Sources & fraîcheur · 8 repères pays</summary><p class="micro">Chaque repère garde sa juridiction, sa date de vérification, sa fraîcheur et sa limite. Les indicateurs WGI / population / PIB restent dans leurs blocs existants et ne sont pas convertis en score Atlas.</p>${CORE_FIELDS.map(k=>evidenceDetail(k,f[k])).join('')}`;
  anchor.before(section,details);
}
function apply(){const root=document.querySelector('#inspectorContent');if(root)renderThailandEvidence(root);}
function setup(){const root=document.querySelector('#inspectorContent');if(!root)return;new MutationObserver(apply).observe(root,{childList:true,subtree:true});apply();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
