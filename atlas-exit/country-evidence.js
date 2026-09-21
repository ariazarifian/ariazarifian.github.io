/* PEX-D0 — normalized country-evidence layer.
   Product-owned runtime contract; evidence inputs are Chief-accepted DEX handoffs.
   No synthetic country score. HOLD/MISSING values never become fabricated scalars. */
(function(root){
  'use strict';

  const REQUIRED_FIELDS=['tax_residency','pit','cit_business','consumption_tax','cost_context','residence_visa','healthcare','safety_context'];
  const FIELD_LABELS={
    tax_residency:'Résidence fiscale',
    pit:'Impôt personnel',
    cit_business:'Sociétés / activité',
    consumption_tax:'TVA / consommation',
    cost_context:'Coût de vie · repère officiel',
    residence_visa:'Séjour / résidence',
    healthcare:'Santé / couverture',
    safety_context:'Sécurité · contexte officiel'
  };

  const source=(owner,locator,sourceClass)=>({owner,locator,sourceClass});
  const freshness=(state,cadence,trigger)=>({state,cadence,trigger});
  const field=(config)=>Object.freeze(config);

  const countries=Object.freeze({
    THA:Object.freeze({
      country:'Thaïlande',iso3:'THA',integrationState:'published',schemaVersion:'country-evidence-v1',
      existingContext:{mode:'passthrough',keys:['population','gdpPerCapita','stability','tax','corporateTax','consumptionTax']},
      fields:Object.freeze({
        tax_residency:field({
          state:'READY',headline:'180 jours ou plus',
          summary:'La section 41 retient un séjour cumulé d’au moins 180 jours sur l’année comme seuil de résidence fiscale.',
          jurisdiction:'Thaïlande · personne physique',verifiedOn:'2026-09-21',sourceVintage:'Loi en vigueur + guidance 2026',
          source:source('Thailand Revenue Department','https://www.rd.go.th/english/37749.html','PRIMARY_STATUTE/TAX_AUTHORITY'),
          freshness:freshness('CURRENT','ANNUAL+EVENT','Nouvelle guidance fiscale ou modification du traitement des revenus étrangers'),
          caveat:'Les revenus de source étrangère, les remises en Thaïlande, les conventions et crédits d’impôt demandent une lecture selon la nature du revenu ; ce repère n’est pas un calcul fiscal personnalisé.',
          structure:{tests:['aggregate_days'],incomeScope:['thai_source','foreign_source_remittance'],treatySensitive:true}
        }),
        pit:field({
          state:'READY',headline:'5–35 %',
          summary:'Barème progressif ; 35 % est le taux marginal supérieur retenu comme repère, pas un taux moyen.',
          jurisdiction:'Thaïlande · PIT',verifiedOn:'2026-09-21',sourceVintage:'Référence officielle courante',
          source:source('Thailand Revenue Department','https://www.rd.go.th/english/52471.html','PRIMARY_TAX_AUTHORITY'),
          freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','Nouvelle publication de taux ou de barème'),
          caveat:'Ne pas reconstruire un barème détaillé 2026 à partir d’anciennes tables sans revalidation du millésime.',
          structure:{rateType:'progressive',headlineOnly:true}
        }),
        cit_business:field({
          state:'READY',headline:'20 % · référence générale',
          summary:'Référence générale d’impôt sur les sociétés sur le bénéfice net ; des régimes et contribuables particuliers peuvent différer.',
          jurisdiction:'Thaïlande · impôt sur les sociétés',verifiedOn:'2026-09-21',sourceVintage:'Référence officielle courante',
          source:source('Thailand Revenue Department','https://www.rd.go.th/english/52471.html','PRIMARY_TAX_AUTHORITY'),
          freshness:freshness('CURRENT','ANNUAL+EVENT','Modification de taux ou de régime'),
          caveat:'Ce taux général ne remplace pas l’analyse du véhicule, de l’activité, des incitations ou d’un régime particulier.',
          structure:{generalRate:20,unit:'percent',regimeSensitive:true}
        }),
        consumption_tax:field({
          state:'READY',headline:'7 % · référence',
          summary:'TVA au taux de référence de 7 % ; certaines opérations et catégories suivent un traitement différent.',
          jurisdiction:'Thaïlande · VAT',verifiedOn:'2026-09-21',sourceVintage:'Référence officielle courante',
          source:source('Thailand Revenue Department','https://www.rd.go.th/english/52471.html','PRIMARY_TAX_AUTHORITY'),
          freshness:freshness('CURRENT','ANNUAL+EVENT','Modification du taux ou du régime de TVA'),
          caveat:'Le taux de référence ne signifie pas que chaque opération est taxable à 7 %.',
          structure:{standardRate:7,unit:'percent',categorySensitive:true}
        }),
        cost_context:field({
          state:'READY',headline:'30 464 THB / mois · Grand Bangkok',
          summary:'Dépense mensuelle moyenne par ménage en 2024 dans le Grand Bangkok ; moyenne nationale : 22 282 THB.',
          jurisdiction:'Thaïlande · ménages ; national + Grand Bangkok',verifiedOn:'2026-09-21',sourceVintage:'Household expenditure 2024 · Yearbook 2025',
          source:source('Thailand National Statistical Office','https://www.nso.go.th/public/e-book/Statistical-Yearbook/SYB-2025/295/','PRIMARY_OFFICIAL_STATISTICS'),
          freshness:freshness('CURRENT-BUT-ANNUAL','ON_NEW_SURVEY','Nouvelle Household Socio-Economic Survey / statistique de dépense'),
          caveat:'Statistique de ménage, pas budget d’un expatrié, d’une personne seule ni promesse de coût pour Bangkok.',
          structure:{population:'households',geographies:['Thailand','Greater Bangkok'],measure:'monthly_household_expenditure',year:2024}
        }),
        residence_visa:field({
          state:'READY',headline:'30 jours · tourisme sans visa',
          summary:'Depuis le 15 septembre 2026, un passeport français ordinaire peut bénéficier de l’exemption jusqu’à 30 jours pour un séjour touristique.',
          jurisdiction:'France → Thaïlande · passeport ordinaire',verifiedOn:'2026-09-21',sourceVintage:'Régime effectif 2026-09-15',
          source:source('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/thailande/conseils-aux-voyageurs-entree-sejour','PRIMARY_IMMIGRATION/CONSULAR'),
          freshness:freshness('CURRENT','30D+EVENT','Modification entrée, exemption, travail ou résidence'),
          caveat:'Tourisme ne signifie ni droit de travailler ni droit de s’installer. Travail, long séjour et résidence relèvent de catégories distinctes et de conditions propres.',
          structure:{origin:'France',passport:'ordinary',shortStayPurpose:'tourism',workPermission:false,longStaySeparate:true}
        }),
        healthcare:field({
          state:'READY',headline:'Couverture selon le statut',
          summary:'Les salariés étrangers affiliés au régime de sécurité sociale peuvent bénéficier de prestations médicales ; la couverture n’est pas automatique pour tout résident étranger.',
          jurisdiction:'Thaïlande · travailleurs étrangers / assurés',verifiedOn:'2026-09-21',sourceVintage:'Ministry of Labour · 2025-03-12 · Section 33',
          source:source('Thailand Ministry of Labour','https://www.mol.go.th/en/news/labour-minister-explains-issues-progresses-with-adjusting-social-security-rights-and-setting-up-a-war-room-to-support-the-prime-minister-in-the-parliamentary-debate','PRIMARY_MINISTRY/SOCIAL_SECURITY'),
          freshness:freshness('CURRENT','ANNUAL+REFORM','Réforme sécurité sociale ou couverture des travailleurs étrangers'),
          caveat:'L’éligibilité dépend notamment de l’emploi et du statut. Ne pas supposer une couverture universelle pour un expatrié hors du régime assuré.',
          structure:{eligibilityBy:['employment','insured_status'],universalForForeignResidents:false}
        }),
        safety_context:field({
          state:'READY',headline:'Contexte géographique · pas de score unique',
          summary:'Les recommandations françaises sont localisées et évolutives ; certaines zones frontalières et de l’extrême-sud font l’objet de restrictions ou déconseils.',
          jurisdiction:'Thaïlande · voyageurs français',verifiedOn:'2026-09-21',sourceVintage:'Conseils mis à jour 2026-09-15',
          source:source('France Diplomatie','https://www.diplomatie.gouv.fr/fr/information-par-pays/thailande/conseils-aux-voyageurs-securite','PRIMARY_CONSULAR'),
          freshness:freshness('CURRENT','30D+EVENT','Mise à jour carte ou contexte sécuritaire régional'),
          caveat:'Ce repère décrit un contexte officiel de voyage, pas une note de qualité de vie ni une probabilité individuelle de risque.',
          structure:{geographic:true,timeSensitive:true,scalarForbidden:true}
        })
      })
    })
  });

  /* Contract fixtures: not user-facing in PEX-D0. They prove that the v1 shape can
     preserve layered/conditional systems instead of flattening them into a country scalar. */
  const fixtures=Object.freeze({
    AUS:Object.freeze({
      healthcare:field({state:'READY',headline:'Selon statut / éligibilité',summary:'La France n’est pas dans la liste RHCA ; Medicare peut néanmoins découler de certains statuts ou critères de résidence.',jurisdiction:'Australie · Medicare',verifiedOn:'2026-09-21',source:source('Services Australia','https://www.servicesaustralia.gov.au/reciprocal-health-care-agreements','PRIMARY_GOV/HEALTH'),freshness:freshness('CURRENT','ANNUAL+REFORM','RHCA ou réforme Medicare'),caveat:'Ne pas déduire « aucun Medicare » du seul fait que la France n’est pas dans la RHCA.',structure:{federalSystem:true,statusDependent:true,rhcaCountry:false,eligibilityRoutes:['qualifying_status','residency']}})
    }),
    ESP:Object.freeze({
      pit:field({state:'READY',headline:'État + communauté autonome',summary:'Le barème combine une composante étatique et une composante autonome ; 24,5 % n’est pas un taux supérieur Espagne tout compris.',jurisdiction:'Espagne · IRPF',verifiedOn:'2026-09-21',source:source('Agencia Tributaria','https://sede.agenciatributaria.gob.es/static_files/Sede/Biblioteca/Manual/Practicos/IRPF/IRPF-2025/ManualRenta2025Parte1_es_es.pdf','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','Nouveau manuel IRPF / barèmes autonomes'),caveat:'La communauté autonome modifie la composante régionale.',structure:{layers:['state','autonomous_community'],allInScalarForbidden:true}}),
      residence_visa:field({state:'READY',headline:'Libre circulation UE + enregistrement',summary:'Un citoyen français n’a pas besoin de visa de travail ; au-delà de trois mois, la base de séjour et l’enregistrement deviennent pertinents.',jurisdiction:'France / UE → Espagne',verifiedOn:'2026-09-21',source:source('Administración General del Estado','https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-residencia/info-general','PRIMARY_GOV/IMMIGRATION'),freshness:freshness('CURRENT','90D+EVENT','Réforme libre circulation / enregistrement'),caveat:'Libre circulation ne supprime pas toutes les obligations d’enregistrement.',structure:{originBloc:'EU',workVisaRequired:false,registrationAfterMonths:3}})
    }),
    JPN:Object.freeze({
      tax_residency:field({state:'READY',headline:'Domicile / résidence continue',summary:'Le statut fiscal distingue notamment non-résident, résident et résident non permanent, avec des périmètres d’imposition différents.',jurisdiction:'Japon · personne physique',verifiedOn:'2026-09-21',source:source('Japan National Tax Agency','https://www.nta.go.jp/english/taxes/individual/12006.htm','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+EVENT','Réforme Income Tax Act / guidance NTA'),caveat:'Un seuil de jours unique ne résume pas le système.',structure:{statusVariants:['non_resident','resident_non_permanent','resident_other'],scopeVariesByStatus:true}}),
      pit:field({state:'READY',headline:'5–45 % national + impôt local',summary:'Le barème national atteint 45 % ; l’impôt local des habitants et la surtaxe de reconstruction sont distincts.',jurisdiction:'Japon · national + local',verifiedOn:'2026-09-21',source:source('Japan National Tax Agency','https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','Révision annuelle / réforme 2027'),caveat:'Ne pas afficher 45 % comme charge fiscale japonaise tout compris.',structure:{layers:['national_income_tax','reconstruction_special_income_tax','local_inhabitant_tax'],allInScalarForbidden:true}}),
      healthcare:field({state:'READY',headline:'Assurance selon résidence / emploi',summary:'Les résidents non couverts par un autre régime relèvent généralement de la NHI ; les séjours courts sont exclus.',jurisdiction:'Japon · assurance santé publique',verifiedOn:'2026-09-21',source:source('Japan Ministry of Health, Labour and Welfare','https://www.mhlw.go.jp/stf/newpage_21895.html','PRIMARY_HEALTH_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+REFORM','Réforme éligibilité / assurance'),caveat:'Emploi, statut de résidence et règles municipales interagissent.',structure:{eligibilityBy:['residence_status','employment','municipality'],shortStayExcluded:true}})
    }),
    HOLD_SAFE:Object.freeze({
      cost_context:field({state:'HOLD',headline:'999 999 / mois',summary:'Valeur volontairement non publiable pour tester le chemin HOLD.',jurisdiction:'Fixture',verifiedOn:'2026-09-21',source:source('Fixture','internal://hold','INTERNAL_TEST'),freshness:freshness('HOLD','30D','Source nationale attendue'),caveat:'Aucune valeur nationale comparable ne doit être affichée.',structure:{scalarForbidden:true}})
    })
  });

  function validateField(record){
    const required=['state','headline','summary','jurisdiction','verifiedOn','source','freshness','caveat','structure'];
    const missing=required.filter(k=>record?.[k]==null);
    if(record?.source){for(const k of ['owner','locator','sourceClass'])if(!record.source[k])missing.push('source.'+k);}
    if(record?.freshness){for(const k of ['state','cadence','trigger'])if(!record.freshness[k])missing.push('freshness.'+k);}
    return {ok:missing.length===0,missing};
  }
  function validateCountry(record){
    const missingFields=REQUIRED_FIELDS.filter(k=>!record?.fields?.[k]);
    const invalidFields=REQUIRED_FIELDS.filter(k=>record?.fields?.[k]&&!validateField(record.fields[k]).ok);
    return {ok:missingFields.length===0&&invalidFields.length===0,missingFields,invalidFields};
  }
  function safeDisplay(record){
    if(!record||record.state==='HOLD'||record.state==='MISSING')return {available:false,headline:'Donnée non retenue',summary:record?.caveat||'Source suffisamment comparable non établie.'};
    return {available:true,headline:record.headline,summary:record.summary};
  }

  const api=Object.freeze({schemaVersion:'country-evidence-v1',requiredFields:REQUIRED_FIELDS,fieldLabels:FIELD_LABELS,countries,fixtures,validateField,validateCountry,safeDisplay});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ATLAS_COUNTRY_EVIDENCE=api;

  if(!root||!root.document)return;
  const document=root.document;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateLabel=value=>{const [y,m,d]=String(value).split('-');return y&&m&&d?`${d}.${m}.${y}`:value;};
  const sourceLink=s=>/^https:\/\//.test(s.locator)?`<a class="detail-source" href="${esc(s.locator)}" target="_blank" rel="noopener noreferrer">${esc(s.owner)} ↗</a>`:`<span class="atlas-evidence__source-name">${esc(s.owner)}</span>`;

  function rowMarkup(key,record){
    const display=safeDisplay(record),state=record.state==='READY'?'Vérifié':record.state==='WATCH'?'À revalider':'Non retenu';
    return `<article class="atlas-evidence__row" data-evidence-field="${esc(key)}" data-evidence-state="${esc(record.state)}"><div class="atlas-evidence__row-head"><span>${esc(FIELD_LABELS[key]||key)}</span><small>${esc(state)}</small></div><strong>${esc(display.headline)}</strong><p>${esc(display.summary)}</p><details class="atlas-evidence__source"><summary>Source & limites</summary><p class="micro">${esc(record.jurisdiction)} · vérifié ${esc(dateLabel(record.verifiedOn))} · ${esc(record.freshness.cadence)}</p><p class="micro">${esc(record.caveat)}</p>${sourceLink(record.source)}</details></article>`;
  }

  function panelMarkup(country){
    const fiscal=['tax_residency','pit','cit_business','consumption_tax'];
    const practical=['cost_context','residence_visa','healthcare','safety_context'];
    return `<details class="context-disclosure atlas-evidence" data-atlas-evidence-panel data-country="${esc(country.iso3)}" open><summary>Repères sourcés · vie, statut & fiscalité</summary><section class="detail-section atlas-evidence__section"><div class="atlas-evidence__intro"><span class="eyebrow">EVIDENCE LAYER · ${esc(country.schemaVersion)}</span><p>Des repères officiels vérifiés, avec leur périmètre et leurs limites. Aucun score de « complétude » ni conseil personnalisé.</p></div><div class="atlas-evidence__group"><h3>Fiscalité</h3>${fiscal.map(k=>rowMarkup(k,country.fields[k])).join('')}</div><div class="atlas-evidence__group"><h3>Vie & statut</h3>${practical.map(k=>rowMarkup(k,country.fields[k])).join('')}</div></section></details>`;
  }

  function activeCountryId(container){return container?.querySelector('[data-save]')?.getAttribute('data-save')||null;}
  function enhance(){
    const container=document.querySelector('#inspectorContent');
    if(!container)return;
    const id=activeCountryId(container),country=countries[id];
    const current=container.querySelector('[data-atlas-evidence-panel]');
    if(current&&current.dataset.country===id)return;
    if(current)current.remove();
    if(!country||country.integrationState!=='published')return;
    const anchor=container.querySelector('.capital-card')||container.querySelector('.tax-stack');
    if(!anchor)return;
    const wrapper=document.createElement('div');wrapper.innerHTML=panelMarkup(country);const panel=wrapper.firstElementChild;
    anchor.insertAdjacentElement('afterend',panel);
  }

  function mount(){
    const container=document.querySelector('#inspectorContent');
    if(!container)return;
    enhance();
    new MutationObserver(enhance).observe(container,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})(typeof window!=='undefined'?window:(typeof globalThis!=='undefined'?globalThis:null));