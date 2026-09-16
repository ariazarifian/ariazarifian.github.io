/* Atlas Expat — PIT gap closer and current-rate refresh.
   Hierarchy: official/current Atlas > current PwC > current official/IMF/OECD country sources
   > clearly labelled 2026 secondary fallback. Disputed/non-residential territories stay contextual. */
(()=>{
  'use strict';
  const S=window.ATLAS_SOURCES||(window.ATLAS_SOURCES={});
  const TAX=window.ATLAS_TAX||(window.ATLAS_TAX={});
  const META=window.ATLAS_META||(window.ATLAS_META={});
  const CAT=window.ATLAS_CATALOG||(window.ATLAS_CATALOG={});
  const FOCUS=window.ATLAS_FOCUS||(window.ATLAS_FOCUS={});
  const WB=window.ATLAS_WB||{};

  Object.assign(S,{
    tradingEconomicsPIT:'https://tradingeconomics.com/country-list/personal-income-tax-rate',
    beninCGI2026:'https://api.impots.bj/media/6984ebbbb7bc0_B%C3%A9nin-Code%20G%C3%A9n%C3%A9ral%20des%20Imp%C3%B4ts%202026.pdf',
    burkinaCGI:'https://dgi.bf/verification/CGI',
    bhutanPIT:'https://www.drc.gov.bt/personal-income-tax-pit/',
    maliPIT:'https://www.dgi.gouv.ml/wp-content/uploads/2020/06/Imp%C3%B4ts-sur-les-traitements-N%C2%B02.pdf',
    nigerCGI2025:'https://impots.gouv.ne/media/telech/LIVRE%201%20ET%202%20ENTIER%20CGI%202025.pdf',
    djiboutiIMF:'https://www.elibrary.imf.org/abstract/journals/002/2024/149/article-A002-en.xml',
    gnbIMF:'https://www.imf.org/-/media/files/publications/cr/2025/english/1gnbea2025002-print-pdf.pdf',
    falklandPIT:'https://www.falklands.gov.fk/taxation/individuals-employees',
    haitiMEF:'https://mef.gouv.ht/documentation/finance',
    kyrgyzIMF:'https://www.elibrary.imf.org/view/journals/002/2026/164/article-A002-en.xml',
    nepalIRD:'https://ird.gov.np/category/taxrateincentives/',
    fijiFRCS:'https://frcs.org.fj/public-notice/customer-service-new-pay-as-you-earn-paye-structure/',
    solomonIRD:'https://www.ird.gov.sb/income-tax/',
    somaliaRevenue:'https://revenuedirectorate.gov.so/direct-tax',
    timorTax:'https://attl.gov.tl/wage-income-tax/',
    iranPayroll1405:'https://wiraf.ir/blog/salary-tax-1405',
    taxAtlasBurundi:'https://taxatlas.io/country/burundi/income-tax',
    taxAtlasCAR:'https://taxatlas.io/country/central-african-republic/income-tax',
    taxAtlasEritrea:'https://taxatlas.io/country/eritrea/income-tax',
    taxAtlasTogo:'https://taxatlas.io/country/togo/income-tax',
    taxAtlasYemen:'https://taxatlas.io/country/yemen/income-tax',
    taxAtlasVanuatu:'https://taxatlas.io/country/vanuatu/income-tax',
    southSudanDeloitte:'https://www2.deloitte.com/content/dam/Deloitte/global/Documents/Tax/dttl-tax-southsudanhighlights-2024.pdf',
    oecdAsiaPIT:'https://www.oecd.org/en/publications/revenue-statistics-in-asia-and-the-pacific-2025_6c04402f-en/full-report/personal-income-taxation-in-asia-and-the-pacific_75becef5.html',
    belizeRef:'https://latamref.dev/bz/income-tax',
    cubaBudget2026:'https://www.cibercuba.com/s/gacetaoficial/ley-181-de-2025-de-asamblea-nacional-del-poder-popular'
  });

  const mk=(tax,src,scope,note,taxYear='Référence vérifiée 2026',taxKind='secondary-current-reference')=>({tax,src,scope,note,taxYear,taxKind});
  const teNote='Taux personnel maximal publié par Trading Economics pour 2026. Repère secondaire de couverture mondiale : vérifier le barème national, les surtaxes, cotisations et règles de résidence avant toute décision.';

  const refresh={
    AUS:mk(45,'pwcPIT','PIT headline · résident','PwC 2026 : taux statutaire supérieur, hors impôts locaux éventuels.','PwC · revue 30 juin 2026'),
    AUT:mk(55,'pwcPIT','PIT headline · résident','PwC 2026 : taux supérieur de 55 % jusqu’en 2029 selon la règle publiée.','PwC · revue 23 juillet 2026'),
    BEL:mk(50,'pwcPIT','Fédéral · communal en plus','PwC 2026 : 50 % au fédéral, auquel peut s’ajouter une taxe communale de 0 à 9 % du montant fédéral.','PwC · revue 10 septembre 2026'),
    CZE:mk(23,'tradingEconomicsPIT','Taux personnel maximal','Repère secondaire 2026 ; le calcul dépend des seuils et de la nature du revenu.','Trading Economics · Dec/26'),
    DEU:mk(45,'pwcPIT','PIT headline · surtaxes possibles','PwC 2026 : 45 % au taux supérieur, surtaxes en plus selon le cas.','PwC · revue 30 juin 2026'),
    EST:mk(22,'pwcPIT','PIT headline','PwC 2026 : taux headline de 22 %. Les catégories de revenu et retenues restent à distinguer.','PwC · revue 29 mai 2026'),
    FIN:mk(52,'pwcPIT','Taux supérieur approximatif','PwC 2026 indique environ 52 % pour les résidents ; composantes nationales et municipales doivent être distinguées.','PwC · revue 9 septembre 2026'),
    GRC:mk(44,'pwcPIT','Taux marginal supérieur','PwC 2026 : taux marginal supérieur de 44 %.','PwC · revue 8 septembre 2026'),
    HUN:mk(15,'pwcPIT','PIT headline','PwC 2026 : taux headline de 15 %.','PwC · revue 1 juillet 2026'),
    IRL:mk(40,'pwcPIT','PIT headline · autres prélèvements distincts','PwC 2026 : taux headline de 40 % ; USC et PRSI sont à traiter séparément.','PwC · revue 11 août 2026'),
    ISR:mk(50,'pwcPIT','PIT headline','PwC 2026 : taux headline de 50 %.','PwC · revue 29 juin 2026'),
    ITA:mk(43,'pwcPIT','IRPEF · taux supérieur','PwC 2026 : taux supérieur de 43 %, hors composantes locales.','PwC · revue 13 juillet 2026'),
    KOR:mk(45,'pwcPIT','PIT headline','PwC 2026 : taux headline de 45 %, fiscalité locale à vérifier séparément.','PwC · revue 4 juin 2026'),
    LTU:mk(32,'pwcPIT','PIT headline','PwC 2026 : 32 % pour le taux headline ; certains revenus non salariaux suivent d’autres règles.','PwC · revue 10 mars 2026'),
    LUX:mk(42,'pwcPIT','Barème national · solidarité en plus','PwC 2026 : 42 % plus taxe de solidarité pouvant atteindre 9 % de l’impôt.','PwC · revue 31 juillet 2026'),
    MEX:mk(35,'pwcPIT','Résident · taux supérieur','PwC 2026 : résidents imposés jusqu’à 35 %.','PwC · revue 6 août 2026'),
    NLD:mk(49.5,'pwcPIT','PIT headline','PwC 2026 : taux headline de 49,5 %.','PwC · revue 29 mai 2026'),
    NOR:mk(39.8,'pwcPIT','Revenu général + tranche supérieure','PwC 2026 : 22 % de revenu général + 17,8 % de tranche supérieure, soit 39,8 % de repère headline.','PwC · revue 25 juin 2026'),
    POL:mk(32,'pwcPIT','PIT headline · solidarité possible','PwC 2026 : 32 %, avec contribution de solidarité de 4 % au-delà du seuil concerné.','PwC · revue 11 août 2026'),
    PRT:mk(48,'pwcPIT','Résident · surtaxe solidarité en plus','PwC 2026 : 48 % plus surtaxe de solidarité de 2,5 % ou 5 % au-delà des seuils.','PwC · revue 24 juillet 2026'),
    SVN:mk(50,'pwcPIT','PIT headline','PwC 2026 : taux headline de 50 %.','PwC · revue 15 juillet 2026'),
    SWE:mk(52,'tradingEconomicsPIT','Repère supérieur combiné','Trading Economics 2026 : repère supérieur de 52 %. La fiscalité municipale est une composante importante.','Trading Economics · Dec/26'),
    TUR:mk(40,'tradingEconomicsPIT','Taux personnel maximal','Trading Economics 2026 : taux supérieur de 40 %.','Trading Economics · Dec/26'),
    CHL:mk(40,'tradingEconomicsPIT','Taux personnel maximal','Trading Economics 2026 : taux supérieur de 40 %.','Trading Economics · Dec/26'),
    COL:mk(39,'tradingEconomicsPIT','Taux personnel maximal','Trading Economics 2026 : taux supérieur de 39 %.','Trading Economics · Dec/26'),
    CRI:mk(25,'tradingEconomicsPIT','Taux personnel maximal','Trading Economics 2026 : taux supérieur de 25 %.','Trading Economics · Dec/26')
  };

  const fill={
    AFG:mk(20,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    SDN:mk(15,'tradingEconomicsPIT','Taux personnel maximal','Trading Economics 2026, sourcé auprès de la Sudan Chamber of Taxation : taux marginal supérieur de 15 %.','Trading Economics · Dec/26'),
    XKX:mk(10,'pwcPIT','PIT · tranche supérieure','PwC Kosovo 2026 : barème progressif de 0 à 10 %.','PwC · revue 7 août 2026'),
    BDI:mk(30,'taxAtlasBurundi','Barème progressif · taux supérieur','Source secondaire 2026 : barème progressif jusqu’à 30 %. À revalider auprès de l’administration avant décision.','TaxAtlas · 2026'),
    BEN:mk(30,'beninCGI2026','ITS · tranche supérieure','Code général des impôts du Bénin 2026, art. 125 : barème progressif jusqu’à 30 %.','CGI Bénin · 2026','current-reference'),
    BFA:mk(25,'burkinaCGI','ITS · salaire · tranche supérieure','Code fiscal burkinabè : impôt sur traitements et salaires jusqu’à 25 %. Les bénéfices d’activité indépendante suivent un autre barème.','DGI Burkina Faso · CGI consulté 2026','current-reference'),
    BLR:mk(13,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    BLZ:mk(25,'belizeRef','Emploi · taux au-dessus du seuil','Repère 2026 vérifié contre l’Income and Business Tax Act : 25 % sur l’emploi au-dessus du seuil légal ; territorialité et business tax sont distinctes.','Loi en vigueur depuis 2025 · vérifiée juillet 2026'),
    BTN:mk(30,'bhutanPIT','PIT · tranche supérieure','Department of Revenue and Customs du Bhoutan : barème PIT jusqu’à 30 %, surtaxe possible lorsque l’impôt annuel dépasse le seuil prévu.','DRC Bhutan · consulté 2026','current-reference'),
    CAF:mk(50,'taxAtlasCAR','PIT · tranche supérieure','Source secondaire 2026 : barème progressif jusqu’à 50 %. À revalider auprès d’une source nationale avant décision.','TaxAtlas · 2026'),
    CUB:mk(50,'cubaBudget2026','IRPP · barème annuel catégories concernées','La loi budgétaire 2026 maintient un barème progressif pouvant atteindre 50 % pour plusieurs catégories de personnes physiques ; d’autres revenus ont des règles distinctes.','Budget Cuba · 2026'),
    DJI:mk(40,'djiboutiIMF','Salaires · tranche supérieure','Le FMI, citant l’art. 15 du code fiscal, documente un barème salarial progressif jusqu’à 40 %.','FMI · code fiscal cité · 2024'),
    DZA:mk(35,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    ERI:mk(30,'taxAtlasEritrea','PIT · taux supérieur','Source secondaire 2026 : barème progressif jusqu’à 30 %. La taxe diaspora de 2 % est un sujet distinct.','TaxAtlas · 2026'),
    FJI:mk(39,'fijiFRCS','PAYE · tranche supérieure intégrant la réforme SRT','FRCS : barème PAYE résident allant jusqu’à 39 % au-delà de FJD 1 million.','FRCS · page actualisée février 2026','current-reference'),
    FLK:mk(26,'falklandPIT','Résident · tranche supérieure','Falkland Islands Government : en 2026, 21 % sur la première tranche imposable puis 26 % au-delà.','Falkland Islands Government · 2026','current-reference'),
    GIN:mk(20,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    GMB:mk(35,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    GNB:mk(20,'gnbIMF','PIT statutaire · repère FMI','Rapport FMI 2025 : PIT statutaire de 20 %, hors cotisations sociales obligatoires.','FMI · 2025'),
    HTI:mk(30,'haitiMEF','IRPP · tranche supérieure','Le barème en vigueur avant la réforme du 1er octobre 2026 culmine à 30 % ; la réforme annoncée conserve 30 % comme tranche supérieure avec de nouveaux seuils.','MEF Haïti · 2026','current-reference'),
    IRN:mk(30,'iranPayroll1405','Salaire · année iranienne 1405','Barème salarial 1405 : exonération de base puis tranches de 10 à 30 %. Ce repère concerne le salaire, pas toutes les catégories de revenus.','Iran 1405 · 2026'),
    KGZ:mk(10,'kyrgyzIMF','PIT · taux plat','Rapport FMI 2026 : taux personnel de 10 % dans le régime général.','FMI · 2026'),
    LKA:mk(18,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    LSO:mk(30,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    MLI:mk(37,'maliPIT','ITS · tranche supérieure','Direction générale des impôts du Mali : barème ITS jusqu’à 37 % au-delà du seuil supérieur.','DGI Mali · barème officiel consulté 2026','current-reference'),
    MWI:mk(40,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    NER:mk(35,'nigerCGI2025','ITS · tranche supérieure','Code général des impôts du Niger 2025 : barème mensuel progressif jusqu’à 35 %. À recontrôler si le CGI 2026 modifie l’article 66.','CGI Niger · 2025'),
    NPL:mk(29,'nepalIRD','Résident naturel · tranche supérieure 2083/84','IRD Nepal publie les taux 2083/84 ; le nouveau barème culmine à 29 % (27 % + 2 points au-dessus du seuil).','IRD Nepal · FY 2083/84','current-reference'),
    SLB:mk(40,'solomonIRD','Individu résident · tranche supérieure','Inland Revenue Division : exonération initiale puis barème progressif jusqu’à 40 %.','Solomon Islands IRD · consulté 2026','current-reference'),
    SLE:mk(30,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    SOM:mk(18,'somaliaRevenue','Payroll tax · tranche supérieure','Somalia Revenue Directorate : payroll tax 2025 progressif de 0 à 18 % ; activité indépendante et CIT suivent d’autres règles.','Somalia Revenue Directorate · loi 2025','current-reference'),
    SSD:mk(20,'southSudanDeloitte','PIT · tranche supérieure','Barème documenté jusqu’à 20 %. Le cadre fiscal reste évolutif et doit être revalidé avant une décision opérationnelle.','Deloitte / cadre South Sudan'),
    SUR:mk(38,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    SYR:mk(22,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    TGO:mk(35,'taxAtlasTogo','PIT · tranche supérieure','Source secondaire 2026 : barème progressif jusqu’à 35 %. À revalider auprès de l’administration avant décision.','TaxAtlas · 2026'),
    TJK:mk(12,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26'),
    TKM:mk(10,'oecdAsiaPIT','PIT · taux supérieur','OCDE Asie-Pacifique 2025 : taux marginal supérieur de 10 %.','OCDE · 2025'),
    TLS:mk(10,'timorTax','Résident · salaire / revenu au-dessus du seuil','Autoridade Tributária Timor-Leste : 0 % jusqu’au seuil puis 10 % pour un résident ; non-résident 10 %.','Autoridade Tributária Timor-Leste · consulté 2026','current-reference'),
    VUT:mk(0,'taxAtlasVanuatu','Pas de PIT','Source secondaire 2026 : Vanuatu ne prélève pas d’impôt personnel général sur le revenu. Les taxes indirectes, droits et règles de résidence restent distincts.','TaxAtlas · 2026'),
    YEM:mk(20,'taxAtlasYemen','PIT · tranche supérieure','Source secondaire 2026 : barème progressif jusqu’à 20 %. L’application pratique varie dans un contexte institutionnel fragmenté.','TaxAtlas · 2026'),
    ZWE:mk(41.2,'tradingEconomicsPIT','Taux personnel maximal',teNote,'Trading Economics · Dec/26')
  };

  const contextual={
    ATF:{tax:null,taxLabel:'Hors comparaison',scope:'Territoire non résidentiel standard',src:'geometry',taxYear:'Contexte Atlas 2026',taxKind:'context',note:'Terres australes françaises : représentation géographique, pas une destination résidentielle standard. Aucun taux métropolitain n’est transposé automatiquement.'},
    ESH:{tax:null,taxLabel:'Statut disputé',scope:'Sahara occidental',src:'geometry',taxYear:'Contexte Atlas 2026',taxKind:'context',note:'Territoire au statut disputé : Atlas n’attribue pas automatiquement la fiscalité marocaine ou d’un autre État.'},
    PRK:{tax:null,taxLabel:'Données non comparables',scope:'Corée du Nord',src:null,taxYear:'Contexte Atlas 2026',taxKind:'context',note:'Aucun barème personnel suffisamment fiable et comparable n’est retenu pour cette édition. Atlas préfère signaler la limite plutôt qu’inventer un taux.'},
    XNC:{tax:null,taxLabel:'Statut disputé',scope:'Chypre du Nord',src:'geometry',taxYear:'Contexte Atlas 2026',taxKind:'context',note:'Zone au statut disputé : les données de la République de Chypre ne sont pas transposées automatiquement.'},
    XSL:{tax:null,taxLabel:'Statut disputé',scope:'Somaliland',src:'geometry',taxYear:'Contexte Atlas 2026',taxKind:'context',note:'Représentation distincte du fond cartographique : les données fiscales de la Somalie ne sont pas attribuées automatiquement.'}
  };

  const canRefresh=x=>!x || x.taxKind==='historical' || (x.tax==null && /Non documenté/i.test(x.taxLabel||''));
  const affected=new Set();
  for(const [id,row] of Object.entries(refresh)){
    if(canRefresh(TAX[id])){TAX[id]=row;affected.add(id);}
  }
  for(const [id,row] of Object.entries(fill)){
    if(!TAX[id] || (TAX[id].tax==null && /Non documenté/i.test(TAX[id].taxLabel||''))){TAX[id]=row;affected.add(id);}
  }
  for(const [id,row] of Object.entries(contextual)){
    if(!TAX[id] || TAX[id].tax==null){TAX[id]={...(TAX[id]||{}),...row};affected.add(id);}
  }

  const focus={
    BTN:'Petit royaume himalayen : le barème fiscal est désormais visible sans masquer les contraintes d’installation.',
    FJI:'Le Pacifique n’est pas un angle mort : le PAYE monte fortement sur les très hauts revenus.',
    FLK:'Territoire isolé avec son propre barème fiscal, distinct du Royaume-Uni.',
    GNB:'PIT faible en apparence, mais cotisations obligatoires importantes : bon exemple de pourquoi un seul taux ne suffit pas.',
    NPL:'Le Népal a refondu son barème 2026/27 : utile pour découvrir une destination rarement comparée.',
    SLB:'Les Îles Salomon ont un vrai barème progressif : Atlas ne les laisse plus comme une silhouette vide.',
    TLS:'Timor-Leste : barème simple à 10 % au-dessus du seuil, système très différent des grands pays voisins.',
    VUT:'Vanuatu : zéro PIT personnel, mais cela ne résume ni la fiscalité indirecte ni l’accès à la résidence.'
  };
  Object.assign(FOCUS,focus);

  function rebuild(id){
    if(!META[id]) return;
    const previous=CAT[id]||{};
    const next={
      tax:null,taxLabel:'Non documenté',scope:'Donnée absente',taxYear:null,src:null,
      note:'Aucun barème suffisamment vérifié n’est intégré pour cette destination.',
      tag:FOCUS[id]||previous.tag||'Institutions, fiscalité et contexte : plusieurs angles pour comparer.',
      ...META[id],...TAX[id],governance:WB[id]||previous.governance||{},stability:WB[id]?.stability??previous.stability??null
    };
    CAT[id]=next;
  }
  for(const id of affected) rebuild(id);

  window.ATLAS_PIT_GAP_FILL={
    updated:[...affected],
    numericFilled:Object.keys(fill),
    contextual:Object.keys(contextual),
    loadedAt:'2026-09-16'
  };
})();
