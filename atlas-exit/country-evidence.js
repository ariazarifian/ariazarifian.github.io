/* PEX-D0 — normalized country evidence layer.
   Evidence is descriptive, source-backed orientation only; it does not calculate
   personalized legal, tax, immigration, healthcare or safety outcomes. */
(()=>{'use strict';
const REQUIRED_FIELDS=['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'];
const EVIDENCE={
  schemaVersion:'pex-d0-1',
  verifiedOn:'2026-09-21',
  requiredFields:REQUIRED_FIELDS,
  countries:{
    THA:{
      country:'Thaïlande',iso3:'THA',waveComplete:true,missingFields:[],
      evidencePackage:'DEX-0 / 1QwcldcwgHr4kBeoUk0H-tO5Zej83YFZBLg1EUXWaUOI',
      fields:{
        tax_residency:{
          state:'READY',productHandoff:'READY_FOR_PRODUCT',
          label:'Résidence fiscale',headline:'180 jours ou plus sur l’année',
          claim:'La section 41 du Revenue Code considère comme résident fiscal une personne présente en Thaïlande au moins 180 jours cumulés sur l’année fiscale. Les revenus de source étrangère peuvent entrer dans l’assiette lorsqu’ils sont gagnés pendant une année de résidence puis transférés en Thaïlande.',
          sourceOwner:'Thailand Revenue Department',sourceUrl:'https://www.rd.go.th/english/37749.html',sourceClass:'PRIMARY_STATUTE/TAX_AUTHORITY',jurisdiction:'Thaïlande · résidence fiscale individuelle',verifiedOn:'2026-09-21',sourceVintage:'loi en vigueur + guidance 2026',freshnessCadence:'ANNUAL+EVENT',nextReviewTrigger:'nouvelle guidance d’année fiscale ou changement de règle sur les revenus étrangers',
          caveat:'Conventions, crédits d’impôt, exemptions et nature du revenu peuvent modifier le résultat. Ce repère ne détermine pas votre résidence fiscale personnelle.'
        },
        pit:{
          state:'READY',productHandoff:'READY_WITH_CAVEAT',
          label:'Impôt sur le revenu',headline:'Barème progressif · 5–35 %',
          claim:'Le barème personnel de référence est progressif, de 5 % à 35 %, avec un taux supérieur de 35 %.',
          sourceOwner:'Thailand Revenue Department',sourceUrl:'https://www.rd.go.th/english/52471.html',sourceClass:'PRIMARY_TAX_AUTHORITY',jurisdiction:'Thaïlande · PIT',verifiedOn:'2026-09-21',sourceVintage:'page de taux courante + matériaux 2026 sur les revenus étrangers',freshnessCadence:'ANNUAL+TAX_YEAR',nextReviewTrigger:'publication d’un nouveau barème ou d’une nouvelle guidance annuelle',
          caveat:'Ne pas déduire un taux effectif personnel de ce maximum. Les tranches détaillées doivent être revalidées pour l’année concernée avant usage.'
        },
        cit_business:{
          state:'READY',productHandoff:'READY_FOR_PRODUCT',
          label:'Sociétés / activité',headline:'20 % · référence générale',
          claim:'Le taux général de référence de l’impôt thaïlandais sur les bénéfices des sociétés est de 20 % du bénéfice net.',
          sourceOwner:'Thailand Revenue Department',sourceUrl:'https://www.rd.go.th/english/52471.html',sourceClass:'PRIMARY_TAX_AUTHORITY',jurisdiction:'Thaïlande · corporate income tax',verifiedOn:'2026-09-21',sourceVintage:'page de taux courante',freshnessCadence:'ANNUAL+EVENT',nextReviewTrigger:'changement de taux ou de régime des sociétés',
          caveat:'Des variations existent selon le contribuable, la taille, l’activité et le régime applicable.'
        },
        consumption_tax:{
          state:'READY',productHandoff:'READY_FOR_PRODUCT',
          label:'TVA / consommation',headline:'7 % · référence standard',
          claim:'La TVA de référence utilisée pour l’Explorer est de 7 %.',
          sourceOwner:'Thailand Revenue Department',sourceUrl:'https://www.rd.go.th/english/52471.html',sourceClass:'PRIMARY_TAX_AUTHORITY',jurisdiction:'Thaïlande · VAT',verifiedOn:'2026-09-21',sourceVintage:'page de taux courante',freshnessCadence:'ANNUAL+EVENT',nextReviewTrigger:'changement du taux ou du régime TVA',
          caveat:'Certaines catégories de biens, services ou opérations peuvent relever d’un traitement différent.'
        },
        cost_context:{
          state:'READY',productHandoff:'READY_FOR_PRODUCT',
          label:'Contexte de coût',headline:'30 464 THB / mois · Grand Bangkok',
          claim:'En 2024, la dépense mensuelle moyenne par ménage était de 30 464 THB dans le Grand Bangkok et de 22 282 THB au niveau national.',
          sourceOwner:'Thailand National Statistical Office',sourceUrl:'https://www.nso.go.th/public/e-book/Statistical-Yearbook/SYB-2025/295/',sourceClass:'PRIMARY_OFFICIAL_STATISTICS',jurisdiction:'Ménages thaïlandais · national + Grand Bangkok',verifiedOn:'2026-09-21',sourceVintage:'dépenses ménages 2024 / Statistical Yearbook 2025',freshnessCadence:'ON_NEW_SURVEY',nextReviewTrigger:'nouvelle enquête SES / dépenses des ménages',
          caveat:'C’est un repère statistique par ménage, pas un budget d’expatrié ni le coût attendu pour une personne seule.'
        },
        residence_visa:{
          state:'READY',productHandoff:'READY_FOR_PRODUCT',
          label:'Entrée / résidence',headline:'30 jours sans visa · tourisme',
          claim:'Depuis le 15 septembre 2026, un passeport français ordinaire peut bénéficier d’une exemption jusqu’à 30 jours pour un séjour touristique.',
          sourceOwner:'Thailand MFA + France Diplomatie',sourceUrl:'https://www.mfa.go.th/en/content/pb-summary-03092026-en',secondarySourceUrl:'https://www.diplomatie.gouv.fr/fr/information-par-pays/thailande/conseils-aux-voyageurs-entree-sejour',sourceClass:'PRIMARY_IMMIGRATION/CONSULAR',jurisdiction:'Passeport français ordinaire · court séjour en Thaïlande',verifiedOn:'2026-09-21',sourceVintage:'politique effective 2026-09-15',freshnessCadence:'30D+EVENT',nextReviewTrigger:'changement d’exemption, d’entrée, de visa ou de droit au travail',
          caveat:'L’exemption touristique n’autorise ni le travail ni une installation durable. Les séjours plus longs et le travail relèvent de voies distinctes et conditionnelles.'
        },
        healthcare:{
          state:'READY',productHandoff:'READY_WITH_CAVEAT',
          label:'Santé / couverture',headline:'Couverture selon le statut',
          claim:'Les salariés étrangers qui entrent dans le régime thaïlandais de sécurité sociale peuvent bénéficier de droits médicaux au titre de ce régime.',
          sourceOwner:'Thailand Ministry of Labour',sourceUrl:'https://www.mol.go.th/en/news/labour-minister-visits-trang-to-follow-up-and-drive-legal-employment-of-foreign-workers-100-percent-covered-under-social-security',sourceClass:'PRIMARY_MINISTRY/SOCIAL_SECURITY',jurisdiction:'Travailleurs étrangers / salariés assurés',verifiedOn:'2026-09-21',sourceVintage:'matériel ministériel courant',freshnessCadence:'ANNUAL+REFORM',nextReviewTrigger:'réforme de la sécurité sociale ou de la couverture des travailleurs étrangers',
          caveat:'Ne pas en déduire une couverture universelle de tous les résidents étrangers. L’éligibilité dépend notamment du statut et de l’emploi.'
        },
        safety_context:{
          state:'READY',productHandoff:'READY_FOR_PRODUCT',
          label:'Sécurité / contexte',headline:'Lecture géographique · pas de score unique',
          claim:'Les recommandations françaises sont géographiques et évolutives ; certaines zones frontalières et de l’extrême-sud font l’objet de niveaux de vigilance ou de restrictions spécifiques.',
          sourceOwner:'France Diplomatie',sourceUrl:'https://www.diplomatie.gouv.fr/fr/information-par-pays/thailande/conseils-aux-voyageurs-securite',sourceClass:'PRIMARY_CONSULAR',jurisdiction:'Thaïlande · contexte de voyage pour ressortissants français',verifiedOn:'2026-09-21',sourceVintage:'mise à jour 2026-09-15',freshnessCadence:'30D+EVENT',nextReviewTrigger:'mise à jour de la carte de conseils ou évolution sécuritaire régionale',
          caveat:'Le contexte varie selon la zone et la période. Aucun score national Atlas de sécurité n’est déduit de cette source.'
        }
      }
    }
  }
};
window.ATLAS_COUNTRY_EVIDENCE=EVIDENCE;

/* Upgrade Thailand tax provenance before Explorer script.js snapshots the data. */
const tha=EVIDENCE.countries.THA;
const catalog=window.ATLAS_CATALOG?.THA;
if(catalog){Object.assign(catalog,{tax:35,taxYear:'Vérifié le 21.09.2026',scope:'Barème progressif · 5–35 %',src:'thailandTax',taxKind:'current-reference',note:'Taux supérieur de 35 % confirmé par le Revenue Department. La résidence fiscale et les revenus étrangers ont leur propre repère sourcé ; ne pas utiliser ce maximum comme taux effectif personnel.'});}
const commerce=window.ATLAS_COMMERCE;
if(commerce){
  commerce.sources=commerce.sources||{};
  Object.assign(commerce.sources,{
    thaPit:{name:'Thailand Revenue Department · PIT',url:tha.fields.pit.sourceUrl},
    thaCit:{name:'Thailand Revenue Department · impôt sociétés',url:tha.fields.cit_business.sourceUrl},
    thaVat:{name:'Thailand Revenue Department · TVA',url:tha.fields.consumption_tax.sourceUrl}
  });
  commerce.countries=commerce.countries||{};
  commerce.countries.THA={...(commerce.countries.THA||{}),pit:'5–35 %',pitScope:'Barème progressif · taux supérieur 35 % · vérifié 21.09.2026',cit:'20 %',citScope:'Taux général de référence · variations de régime possibles',vat:'7 %',vatScope:'TVA · référence standard · catégories particulières possibles',special:'Résidence fiscale, revenus étrangers, droit au séjour et couverture santé dépendent chacun de critères distincts. Les huit repères pays ci-dessous séparent ces sujets au lieu de les agréger.',sources:['thaPit','thaCit','thaVat']};
}

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={tax_residency:'RÉSIDENCE FISCALE',pit:'IMPÔT PERSONNEL',cit_business:'SOCIÉTÉS / ACTIVITÉ',consumption_tax:'TVA / CONSOMMATION',cost_context:'COÛT · REPÈRE STATISTIQUE',residence_visa:'ENTRÉE / RÉSIDENCE',healthcare:'SANTÉ / COUVERTURE',safety_context:'SÉCURITÉ / CONTEXTE'};
function sourceLink(field){return /^https:\/\//.test(field.sourceUrl||'')?`<a class="detail-source" href="${esc(field.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(field.sourceOwner)} ↗</a>`:'';}
function safeClaim(field){if(!field)return 'Repère non disponible.';if(field.state==='HOLD'||field.state==='MISSING')return field.caveat||'Preuve insuffisante : aucune valeur n’est extrapolée.';return field.claim;}
function fieldSection(key,field){const freshness=field.state==='READY'?'Vérifié':field.state==='WATCH'?'À revalider':'En attente';return `<section class="detail-section" data-evidence-field="${esc(key)}"><h3>${esc(labels[key]||key)} · ${esc(freshness.toUpperCase())}</h3><p><strong>${esc(field.headline||'Repère conditionnel')}</strong><br>${esc(safeClaim(field))}</p><details class="source-disclosure"><summary>Preuve, fraîcheur et limites</summary><p class="micro">${esc(field.sourceClass)} · ${esc(field.jurisdiction)} · vérifié le ${esc(field.verifiedOn)} · ${esc(field.sourceVintage)}.</p><p class="micro">Limite : ${esc(field.caveat)}</p><p class="micro">Révision : ${esc(field.freshnessCadence)} · déclencheur : ${esc(field.nextReviewTrigger)}.</p>${sourceLink(field)}${field.secondarySourceUrl?` <a class="detail-source" href="${esc(field.secondarySourceUrl)}" target="_blank" rel="noopener noreferrer">Source consulaire complémentaire ↗</a>`:''}</details></section>`;}
function renderEvidence(pack){return `<div data-country-evidence="${esc(pack.iso3)}"><section class="detail-section"><h3>REPÈRES PAYS · SOURCÉS</h3><p>Huit dimensions séparées, sans score composite. Les chiffres décrivent leur périmètre ; ils ne calculent pas votre situation personnelle.</p></section>${REQUIRED_FIELDS.map(k=>fieldSection(k,pack.fields[k])).join('')}</div>`;}
function injectEvidence(){const host=document.querySelector('#inspectorContent');if(!host)return;const code=host.querySelector('.inspector-title .country-code')?.textContent?.trim();const pack=EVIDENCE.countries[code];if(!pack||host.querySelector(`[data-country-evidence="${CSS.escape(code)}"]`))return;const marker=[...host.querySelectorAll('.detail-section')].find(el=>el.querySelector('h3')?.textContent?.trim()==='À RETENIR');if(!marker)return;marker.insertAdjacentHTML('beforebegin',renderEvidence(pack));}
function observeInspector(){const host=document.querySelector('#inspectorContent');if(!host)return;new MutationObserver(()=>queueMicrotask(injectEvidence)).observe(host,{childList:true,subtree:true});injectEvidence();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observeInspector,{once:true});else observeInspector();
})();
