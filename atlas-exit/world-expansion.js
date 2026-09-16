/* Atlas Expat — worldwide discovery coverage.
   Breadth layer: current headline PIT references from PwC Worldwide Tax Summaries.
   Existing official/national Atlas sources always win; this file fills gaps only,
   except explicitly flagged secondary upgrades. Headline PIT is not an effective tax rate. */
(()=>{
  'use strict';

  const S=window.ATLAS_SOURCES||(window.ATLAS_SOURCES={});
  const TAX=window.ATLAS_TAX||(window.ATLAS_TAX={});
  const META=window.ATLAS_META||(window.ATLAS_META={});
  const CAT=window.ATLAS_CATALOG||(window.ATLAS_CATALOG={});
  const FOCUS=window.ATLAS_FOCUS||(window.ATLAS_FOCUS={});
  const WB=window.ATLAS_WB||{};

  S.pwcPIT='https://taxsummaries.pwc.com/quick-charts/personal-income-tax-pit-rates';

  const standardNote='Repère de couverture mondiale PwC Worldwide Tax Summaries, revu en 2026 sauf mention contraire. Le chiffre est le taux personnel statutaire « headline » indiqué par PwC : il ne représente ni un taux moyen, ni une simulation d’expatriation, et peut exclure impôts locaux, cotisations ou régimes particuliers.';
  const standardScope='PIT headline · repère PwC';

  const rates={
    ALB:23,AGO:25,ARG:35,ARM:20,AZE:25,BGD:30,BRB:28.5,BOL:13,BWA:25,
    CPV:27.5,KHM:20,CMR:38.5,TCD:30,COD:40,COG:40,DOM:25,ECU:37,EGY:27.5,
    SLV:30,GNQ:25,SWZ:33,ETH:35,GAB:35,GHA:35,GTM:7,GUY:35,HND:25,IRQ:15,
    CIV:32,JAM:30,JOR:30,KAZ:15,LAO:25,LBN:25,LBR:25,LBY:10,MDG:20,MRT:40,
    MUS:20,MDA:12,MNG:20,MNE:15,MAR:37,MOZ:32,MMR:25,NAM:37,NCL:40,NIC:30,
    NGA:25,MKD:10,PSE:15,PNG:42,PER:30,PHL:35,PRI:33,RWA:30,SEN:43,TWN:40,
    TZA:30,TTO:30,TUN:40,UGA:40,UKR:18,URY:36,UZB:12,VEN:34,VNM:35,ZMB:37
  };

  const special={
    BHS:{tax:0,scope:'Pas de PIT',note:'Les Bahamas n’imposent actuellement pas d’impôt sur le revenu des personnes physiques. Cela ne signifie pas absence de fiscalité : TVA, droits, immobilier, licences et contributions restent à examiner.',taxYear:'PwC · revue 21 juillet 2026'},
    BRN:{tax:0,scope:'Pas de PIT',note:'Brunei n’impose pas d’impôt sur le revenu des personnes physiques. Les obligations de séjour, d’activité, de société et les autres prélèvements restent des sujets distincts.',taxYear:'PwC · revue 3 août 2026'},
    KWT:{tax:0,scope:'Pas de PIT',note:'Le Koweït n’impose pas de PIT aux individus. Un zéro d’impôt personnel ne vaut pas exonération de toutes les obligations économiques, sociales ou de résidence.',taxYear:'PwC · revue 22 juillet 2026'},
    SAU:{tax:0,scope:'Emploi · pas d’IR individuel',note:'L’Arabie saoudite n’a pas de régime général d’impôt sur le revenu individuel et les revenus tirés uniquement d’un emploi n’y sont pas soumis à l’IR. Les revenus hors emploi et retenues à la source suivent d’autres règles.',taxYear:'PwC · revue 29 juillet 2026'},
    BIH:{tax:null,taxLabel:'8–10 % selon entité',scope:'Bosnie-Herzégovine · selon entité',note:'PwC indique 10 % en Fédération de Bosnie-Herzégovine, 8 % en Republika Srpska et 10 % dans le district de Brčko. Atlas n’en déduit pas un taux national unique.',taxYear:'PwC · revue 19 février 2026'},
    HRV:{tax:null,taxLabel:'10–36 % selon lieu/revenu',scope:'Croatie · lieu et type de revenu',note:'PwC indique une plage de 10 à 36 % selon le type de revenu et le lieu de résidence ou de séjour habituel. Un taux national unique serait trompeur.',taxYear:'PwC · revue 27 août 2026'},
    GRL:{tax:null,taxLabel:'10 % + municipal',scope:'Groenland · national + municipal',note:'PwC indique un impôt de 10 % auquel s’ajoute l’impôt municipal. Atlas n’affiche pas 10 % comme charge totale.',taxYear:'PwC · revue 10 août 2026'},
    PAK:{tax:null,taxLabel:'35–45 % selon profil',scope:'Pakistan · salarié / non-salarié',note:'PwC indique jusqu’à 35 % pour les salariés et 45 % pour les non-salariés, avec surtaxe potentielle. Un chiffre unique ne décrit pas correctement les deux profils.',taxYear:'PwC · revue 24 août 2026'},
    SRB:{tax:null,taxLabel:'10–20 % selon revenu',scope:'Serbie · selon catégorie',note:'PwC indique des taux de 10 à 20 % selon la nature du revenu. Atlas conserve cette plage plutôt que de fabriquer un taux personnel unique.',taxYear:'PwC · revue 7 août 2026'}
  };

  const make=(id,extra)=>({
    taxYear:'PwC · revue 2026',
    scope:standardScope,
    src:'pwcPIT',
    note:standardNote,
    taxKind:'secondary-current-reference',
    ...extra
  });

  for(const [id,tax] of Object.entries(rates)){
    if(!TAX[id]) TAX[id]=make(id,{tax});
  }
  for(const [id,entry] of Object.entries(special)){
    if(!TAX[id]) TAX[id]=make(id,entry);
  }

  // Secondary upgrade where the previous Atlas entry intentionally had no usable rate.
  TAX.ROU=make('ROU',{
    tax:10,
    scope:'PIT headline · Roumanie',
    note:'PwC indique un taux headline de 10 % pour la Roumanie (revue du 30 mars 2026). Ce repère complète la précédente fiche Atlas qui distinguait les cotisations sans établir de taux d’impôt personnel utilisable.',
    taxYear:'PwC · revue 30 mars 2026'
  });

  const focus={
    BHS:'Pas d’impôt sur le revenu personnel : la surprise fiscale ne résume pourtant pas le coût réel d’une installation.',
    BRN:'Un pays sans PIT individuel, rarement envisagé dans les comparaisons d’expatriation.',
    KWT:'Le zéro d’impôt personnel ne répond ni au droit de séjour ni aux règles d’activité.',
    SAU:'L’emploi peut être sans IR individuel, tandis que l’activité hors emploi suit une autre logique.',
    GRL:'Le chiffre national ne suffit pas : la fiscalité municipale compte aussi.',
    MUS:'Île internationale et centre financier : le taux headline n’est qu’un premier filtre.',
    RWA:'Petit marché, trajectoire institutionnelle particulière : à regarder au-delà des destinations habituelles.',
    BWA:'Une destination africaine rarement comparée, avec un repère fiscal désormais visible.',
    NAM:'Fiscalité, taille du marché et mode de vie donnent un profil très différent des hubs habituels.',
    URY:'L’Uruguay mérite une comparaison propre plutôt que d’être noyé dans une moyenne sud-américaine.'
  };
  for(const [id,text] of Object.entries(focus)) if(!FOCUS[id]) FOCUS[id]=text;

  function rebuild(id){
    if(!META[id]) return;
    const previous=CAT[id]||{};
    CAT[id]={
      tax:null,
      taxLabel:'Non documenté',
      scope:'Donnée absente',
      taxYear:null,
      src:null,
      note:'Aucun barème suffisamment vérifié n’est intégré pour cette destination.',
      tag:FOCUS[id]||previous.tag||'Institutions, fiscalité et contexte : plusieurs angles pour comparer.',
      ...META[id],
      ...TAX[id],
      governance:WB[id]||previous.governance||{},
      stability:WB[id]?.stability??previous.stability??null
    };
  }

  const coverageIds=[...new Set([...Object.keys(rates),...Object.keys(special),'ROU'])];
  for(const id of coverageIds) rebuild(id);

  // script.js keeps a reference to ATLAS_CATALOG, but its country objects may
  // already have been materialised if geography loaded before this file.
  // Patch those same objects in place so byId/list/tooltip all see the new data.
  function patchExplorer(){
    const explorer=window.AtlasExplorer;
    const countries=explorer?.getCountries?.();
    if(!countries?.length) return false;
    for(const country of countries){
      const next=CAT[country.id];
      if(!next) continue;
      const path=country.path,bounds=country.bounds,parent=country.parent,code=country.code,name=country.name,region=country.region,lon=country.lon,lat=country.lat;
      Object.assign(country,next,{path,bounds,parent,code,name,region,lon,lat,documented:!!next.src||next.stability!=null});
    }
    return true;
  }
  if(!patchExplorer()){
    let attempts=0;
    const timer=setInterval(()=>{
      attempts++;
      if(patchExplorer()||attempts>100) clearInterval(timer);
    },50);
  }

  window.ATLAS_WORLD_EXPANSION={
    source:'PwC Worldwide Tax Summaries',
    sourceUrl:S.pwcPIT,
    coverageIds,
    loadedAt:'2026-09-16'
  };
})();
