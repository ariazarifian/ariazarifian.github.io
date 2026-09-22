/* PEX-D1A — normalized country-evidence contract + source renderer.
   Product-owned runtime contract; evidence inputs are Chief-accepted DEX handoffs.
   Supports one or many direct sources without flattening qualifiers or fabricating scalars.
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

  const source=(owner,locator,sourceClass,meta={})=>Object.freeze({owner,locator,sourceClass,...meta});
  const sourceSet=(owner,locators,sourceClass,labels=[])=>Object.freeze(locators.map((locator,index)=>source(owner,locator,sourceClass,labels[index]?{label:labels[index]}:{})));
  const freshness=(state,cadence,trigger)=>Object.freeze({state,cadence,trigger});
  const field=(config)=>Object.freeze(config);
  const sourcesFor=(record)=>{
    if(Array.isArray(record?.sources))return record.sources.filter(Boolean);
    return record?.source?[record.source]:[];
  };

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

  /* Contract fixtures remain non-user-facing. PEX-D1A expands them only with already
     accepted DEX-3B evidence so the one-or-many source contract can be exercised
     before any Australia/Spain/Japan country module is published. */
  const fixtures=Object.freeze({
    AUS:Object.freeze({
      pit:field({
        state:'READY',headline:'15–45 % · barème résident 2026–27',summary:'Barème fédéral résident ; la Medicare levy et les offsets sont distincts.',jurisdiction:'Australie · résident fiscal',verifiedOn:'2026-09-21',sourceVintage:'2026–27',
        sources:sourceSet('Australian Treasury / ATO',['https://budget.gov.au/content/02-cost-of-living.htm','https://www.ato.gov.au/law/view/document?DocNum=0000081364&FullDocument=true'],'PRIMARY_GOV/FINANCE',['Budget 2026–27','ATO · rate schedule']),
        freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','Federal budget/rate amendment or new income year'),caveat:'AUD 18,200 tax-free threshold then marginal bands; Medicare levy and offsets are additional.',structure:{rateType:'progressive',topRate:45,legacyComparable:{kind:'pit',topRate:45}}
      }),
      cit_business:field({
        state:'READY',headline:'30 % général · 25 % base-rate entities',summary:'Le taux général est 30 % ; les base-rate entities éligibles peuvent relever de 25 %.',jurisdiction:'Australie · sociétés',verifiedOn:'2026-09-21',sourceVintage:'current rate structure',
        source:source('Australian Taxation Office','https://www.ato.gov.au/tax-rates-and-codes/company-tax-rates','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','Company-rate/base-rate-entity rule change'),caveat:'L’éligibilité et les règles d’entités spéciales doivent être vérifiées.',structure:{generalRate:30,unit:'percent',legacyComparable:{kind:'cit',headline:'30 %'}}
      }),
      consumption_tax:field({
        state:'READY',headline:'10 % · GST',summary:'GST de 10 % sur la plupart des biens et services ; exemptions et règles d’inscription existent.',jurisdiction:'Australie · GST',verifiedOn:'2026-09-21',sourceVintage:'current 10% rate',
        source:source('Australian Taxation Office','https://www.ato.gov.au/about-ato/research-and-statistics/in-detail/tax-gap/a-h-tax-gaps/goods-and-services-tax-gap/overview','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+EVENT','GST rate/base reform'),caveat:'Certaines fournitures sont GST-free ou input-taxed.',structure:{standardRate:10,unit:'percent',legacyComparable:{kind:'vat',headline:'10 %'}}
      }),
      residence_visa:field({
        state:'READY',headline:'Routes distinctes visite / WHM',summary:'Les routes eVisitor et Work and Holiday 417 ne donnent pas les mêmes droits ; le WHM 417 couvre les Français éligibles jusqu’à 35 ans.',jurisdiction:'France → Australie',verifiedOn:'2026-09-21',sourceVintage:'current 2026 route rules',
        sources:sourceSet('Australian Department of Home Affairs',['https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417','https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/evisitor-651'],'PRIMARY_IMMIGRATION',['Work and Holiday 417','eVisitor 651']),
        freshness:freshness('CURRENT','60D+EVENT','France eligibility/age/visa-condition or eVisitor/work-route change'),caveat:'Visiteur, WHM, skilled et permanent sont des routes distinctes.',structure:{origin:'France',routeSensitive:true}
      }),
      healthcare:field({
        state:'READY',headline:'Selon statut / éligibilité',summary:'La France n’est pas dans la liste RHCA ; Medicare peut néanmoins découler de certains statuts ou critères de résidence.',jurisdiction:'Australie · Medicare',verifiedOn:'2026-09-21',sourceVintage:'current RHCA/Medicare guidance',
        sources:sourceSet('Services Australia',['https://www.servicesaustralia.gov.au/reciprocal-health-care-agreements','https://www.servicesaustralia.gov.au/enrolling-medicare'],'PRIMARY_GOV/HEALTH',['Reciprocal Health Care Agreements','Enrolling in Medicare']),
        freshness:freshness('CURRENT','ANNUAL+REFORM','RHCA list or Medicare eligibility reform'),caveat:'Ne pas déduire « aucun Medicare » du seul fait que la France n’est pas dans la RHCA.',structure:{federalSystem:true,statusDependent:true,rhcaCountry:false,eligibilityRoutes:['qualifying_status','residency']}
      })
    }),
    ESP:Object.freeze({
      pit:field({
        state:'READY',headline:'État + communauté autonome',summary:'Le barème combine une composante étatique et une composante autonome ; 24,5 % n’est pas un taux supérieur Espagne tout compris.',jurisdiction:'Espagne · IRPF',verifiedOn:'2026-09-21',sourceVintage:'2025 income-year manual · 2026-03-27',
        source:source('Agencia Tributaria','https://sede.agenciatributaria.gob.es/static_files/Sede/Biblioteca/Manual/Practicos/IRPF/IRPF-2025/ManualRenta2025Parte1_es_es.pdf','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','Nouveau manuel IRPF / barèmes autonomes'),caveat:'La communauté autonome modifie la composante régionale.',structure:{layers:['state','autonomous_community'],allInScalarForbidden:true,legacyComparable:{kind:'pit',nonScalar:true}}
      }),
      cit_business:field({
        state:'READY',headline:'25 % · taux général',summary:'25 % est le taux général ; micro-entreprises, petites entités, créations et régimes spéciaux peuvent différer.',jurisdiction:'Espagne · sociétés',verifiedOn:'2026-09-21',sourceVintage:'2026 rates',
        source:source('Agencia Tributaria','https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades/que-base-imponible-se-determina-sociedades/tipo-impositivo.html','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','Corporate-tax rate/regime change'),caveat:'Le taux général ne résume pas tous les régimes.',structure:{generalRate:25,unit:'percent',legacyComparable:{kind:'cit',headline:'25 %'}}
      }),
      consumption_tax:field({
        state:'READY',headline:'21 % · IVA standard',summary:'IVA standard de 21 % ; 10 %, 4 % et certaines catégories à 0 % existent.',jurisdiction:'Espagne · IVA',verifiedOn:'2026-09-21',sourceVintage:'current official schedule',
        source:source('Agencia Tributaria','https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/manual-iva-2025/capitulo-04-sujetos-pasivos-repercusion-impositivo/tipo-impositivo.html','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+EVENT','IVA rate/category reform'),caveat:'Le taux standard ne décrit pas toutes les fournitures.',structure:{standardRate:21,unit:'percent',legacyComparable:{kind:'vat',headline:'21 %'}}
      }),
      residence_visa:field({
        state:'READY',headline:'Libre circulation UE + enregistrement',summary:'Un citoyen français n’a pas besoin de visa de travail ; au-delà de trois mois, la base de séjour et l’enregistrement deviennent pertinents.',jurisdiction:'France / UE → Espagne',verifiedOn:'2026-09-21',sourceVintage:'updated 2026-07-01',
        sources:sourceSet('Administración General del Estado',['https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-residencia/info-general','https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-residencia/inscribirte-residente'],'PRIMARY_GOV/IMMIGRATION',['Conditions générales de résidence','Inscription comme résident']),
        freshness:freshness('CURRENT','90D+EVENT','Réforme libre circulation / enregistrement'),caveat:'Libre circulation ne supprime pas toutes les obligations d’enregistrement.',structure:{originBloc:'EU',workVisaRequired:false,registrationAfterMonths:3}
      })
    }),
    JPN:Object.freeze({
      tax_residency:field({
        state:'READY',headline:'Domicile / résidence continue',summary:'Le statut fiscal distingue notamment non-résident, résident et résident non permanent, avec des périmètres d’imposition différents.',jurisdiction:'Japon · personne physique',verifiedOn:'2026-09-21',sourceVintage:'current NTA guidance',
        source:source('Japan National Tax Agency','https://www.nta.go.jp/english/taxes/individual/12006.htm','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','ANNUAL+EVENT','Réforme Income Tax Act / guidance NTA'),caveat:'Un seuil de jours unique ne résume pas le système.',structure:{statusVariants:['non_resident','resident_non_permanent','resident_other'],scopeVariesByStatus:true}
      }),
      pit:field({
        state:'READY',headline:'5–45 % national + impôt local',summary:'Le barème national atteint 45 % ; l’impôt local des habitants et la surtaxe de reconstruction sont distincts.',jurisdiction:'Japon · national + local',verifiedOn:'2026-09-21',sourceVintage:'law status 2026-04-01',
        sources:sourceSet('Japan National Tax Agency',['https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm','https://www.nta.go.jp/taxes/shiraberu/taxanswer/osirase/9000.htm'],'PRIMARY_TAX_AUTHORITY',['Barème national','Avis / surtaxe et changements']),
        freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','2027 special-tax change or annual rate revision'),caveat:'Ne pas afficher 45 % comme charge fiscale japonaise tout compris.',structure:{layers:['national_income_tax','reconstruction_special_income_tax','local_inhabitant_tax'],allInScalarForbidden:true,legacyComparable:{kind:'pit',topRate:45,requiresLocalCaveat:true}}
      }),
      cit_business:field({
        state:'READY',headline:'23,2 % · taux national ordinaire',summary:'Le taux national ordinaire est 23,2 % ; des traitements réduits peuvent viser certaines petites sociétés et des taxes locales s’ajoutent.',jurisdiction:'Japon · sociétés',verifiedOn:'2026-09-21',sourceVintage:'current rate table from 2025-04-01',
        sources:sourceSet('Japan National Tax Agency',['https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5759.htm','https://www.nta.go.jp/taxes/shiraberu/taxanswer/osirase/9000.htm'],'PRIMARY_TAX_AUTHORITY',['Corporation tax rates','Avis / changements']),
        freshness:freshness('CURRENT','ANNUAL+TAX_YEAR','NTA corporation-rate/SME-relief change'),caveat:'Les taxes locales et régimes PME ne sont pas inclus dans ce taux national ordinaire.',structure:{generalRate:23.2,unit:'percent',localTaxesAdditional:true,legacyComparable:{kind:'cit',headline:'23,2 %'}}
      }),
      consumption_tax:field({
        state:'READY',headline:'10 % standard · 8 % réduit',summary:'Le taux combiné standard est 10 % et le réduit 8 % ; une évolution alimentaire est signalée pour 2027.',jurisdiction:'Japon · consumption tax',verifiedOn:'2026-09-21',sourceVintage:'law status 2026-04-01',
        source:source('Japan National Tax Agency','https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6303.htm','PRIMARY_TAX_AUTHORITY'),freshness:freshness('CURRENT','90D+EVENT','Scheduled 2027-04-01 food-rate change or earlier legislation/guidance'),caveat:'La catégorie et la date déterminent le taux applicable.',structure:{standardRate:10,reducedRate:8,unit:'percent',legacyComparable:{kind:'vat',headline:'10 %'}}
      }),
      residence_visa:field({
        state:'READY',headline:'90 jours · court séjour sans visa',summary:'Le passeport français est dispensé de visa pour le court séjour standard ; aucune activité rémunérée n’est permise et le long séjour exige un statut adapté.',jurisdiction:'France → Japon',verifiedOn:'2026-09-21',sourceVintage:'current 2026 guidance',
        sources:sourceSet('Japan MOFA + Immigration Services Agency',['https://www.mofa.go.jp/j_info/visit/visa/short/novisa.html','https://www.mofa.go.jp/j_info/visit/visa/','https://www.moj.go.jp/isa/applications/status/'],'PRIMARY_FOREIGN_AFFAIRS/IMMIGRATION',['Visa exemption list','Visa framework','Status of residence']),
        freshness:freshness('CURRENT','60D+EVENT','Visa-exemption/status/COE rule change'),caveat:'Court séjour, visa et statut de résidence sont des objets distincts.',structure:{origin:'France',shortStayDays:90,remunerativeActivity:false,longStayStatusRequired:true}
      }),
      healthcare:field({
        state:'READY',headline:'Assurance selon résidence / emploi',summary:'Les résidents non couverts par un autre régime relèvent généralement de la NHI ; les séjours courts sont exclus.',jurisdiction:'Japon · assurance santé publique',verifiedOn:'2026-09-21',sourceVintage:'current',
        sources:sourceSet('Japan Ministry of Health, Labour and Welfare',['https://www.mhlw.go.jp/stf/newpage_21539.html','https://www.mhlw.go.jp/stf/newpage_21895.html'],'PRIMARY_HEALTH_AUTHORITY',['Eligibility context','Foreign-resident / NHI context']),
        freshness:freshness('CURRENT','ANNUAL+REFORM','Réforme éligibilité / assurance'),caveat:'Emploi, statut de résidence et règles municipales interagissent.',structure:{eligibilityBy:['residence_status','employment','municipality'],shortStayExcluded:true}
      })
    }),
    HOLD_SAFE:Object.freeze({
      cost_context:field({state:'HOLD',headline:'999 999 / mois',summary:'Valeur volontairement non publiable pour tester le chemin HOLD.',jurisdiction:'Fixture',verifiedOn:'2026-09-21',source:source('Fixture','internal://hold','INTERNAL_TEST'),freshness:freshness('HOLD','30D','Source nationale attendue'),caveat:'Aucune valeur nationale comparable ne doit être affichée.',structure:{scalarForbidden:true}})
    })
  });

  function validateSource(record){
    const missing=[];
    for(const key of ['owner','locator','sourceClass'])if(!record?.[key])missing.push(key);
    return {ok:missing.length===0,missing};
  }
  function validateField(record){
    const required=['state','headline','summary','jurisdiction','verifiedOn','freshness','caveat','structure'];
    const missing=required.filter(k=>record?.[k]==null);
    const directSources=sourcesFor(record);
    if(directSources.length===0)missing.push('source|sources');
    directSources.forEach((item,index)=>validateSource(item).missing.forEach(key=>missing.push(`sources[${index}].${key}`)));
    if(record?.freshness){for(const k of ['state','cadence','trigger'])if(!record.freshness[k])missing.push('freshness.'+k);}
    return {ok:missing.length===0,missing,sourceCount:directSources.length,sourceMode:Array.isArray(record?.sources)?'many':'one'};
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

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sourceLink=(s,index,total)=>{
    const label=s.label||s.owner;
    const suffix=total>1&&!s.label?` · ${index+1}/${total}`:'';
    if(/^https:\/\//.test(s.locator))return `<a class="detail-source" href="${esc(s.locator)}" target="_blank" rel="noopener noreferrer" data-source-index="${index}">${esc(label+suffix)} ↗</a>`;
    return `<span class="atlas-evidence__source-name" data-source-index="${index}">${esc(label+suffix)}</span>`;
  };
  const renderSources=(record)=>{
    const directSources=sourcesFor(record);
    if(directSources.length===0)return '';
    if(directSources.length===1)return sourceLink(directSources[0],0,1);
    return `<div class="atlas-evidence__sources" data-source-count="${directSources.length}"><span class="atlas-evidence__sources-label">${directSources.length} sources directes</span><div class="atlas-evidence__sources-links">${directSources.map((s,index)=>sourceLink(s,index,directSources.length)).join('')}</div></div>`;
  };

  const api=Object.freeze({schemaVersion:'country-evidence-v1',sourceContract:'one-or-many-v1',requiredFields:REQUIRED_FIELDS,fieldLabels:FIELD_LABELS,countries,fixtures,validateSource,validateField,validateCountry,safeDisplay,sourcesFor,renderSources});
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ATLAS_COUNTRY_EVIDENCE=api;

  if(!root||!root.document)return;
  const document=root.document;
  const dateLabel=value=>{const [y,m,d]=String(value).split('-');return y&&m&&d?`${d}.${m}.${y}`:value;};

  function rowMarkup(key,record){
    const display=safeDisplay(record),state=record.state==='READY'?'Vérifié':record.state==='WATCH'?'À revalider':'Non retenu';
    return `<article class="atlas-evidence__row" data-evidence-field="${esc(key)}" data-evidence-state="${esc(record.state)}"><div class="atlas-evidence__row-head"><span>${esc(FIELD_LABELS[key]||key)}</span><small>${esc(state)}</small></div><strong>${esc(display.headline)}</strong><p>${esc(display.summary)}</p><details class="atlas-evidence__source"><summary>Source & limites</summary><p class="micro">${esc(record.jurisdiction)} · vérifié ${esc(dateLabel(record.verifiedOn))} · ${esc(record.freshness.cadence)}</p><p class="micro">${esc(record.caveat)}</p>${renderSources(record)}</details></article>`;
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
