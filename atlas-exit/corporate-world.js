/* Atlas Expat — worldwide corporate-income-tax coverage.
   Priority: existing official/national Atlas sources. Current PwC WWTS fills broad gaps.
   Tax Foundation 2025 is used only where PwC WWTS has no current territory table.
   Values are statutory headline references, not effective company-tax estimates. */
(()=>{
  'use strict';
  const d=window.ATLAS_COMMERCE;
  if(!d) return;

  d.sources.pwcCIT={name:'PwC Worldwide Tax Summaries · Corporate income tax rates',url:'https://taxsummaries.pwc.com/quick-charts/corporate-income-tax-cit-rates'};
  d.sources.taxFoundationCIT2025={name:'Tax Foundation · Corporate Tax Rates Around the World 2025',url:'https://taxfoundation.org/data/all/global/corporate-tax-rates-by-country-2025/'};
  d.sources.andorraCorp={name:'Govern d’Andorra · Impost sobre Societats',url:'https://www.e-tramits.ad/tramits/impostos/is'};

  const current={
    ALB:'15 %',AGO:'25 %',ARG:'35 %',ARM:'18 %',AUS:'30 %',AUT:'23 %',AZE:'20 %',
    BRB:'9 %',BEL:'25 %',BOL:'25 %',BIH:'10 %',BWA:'22 %',BRA:'34 %',BRN:'18,5 %',BGR:'10 %',
    CPV:'20,4 %',KHM:'20 %',CMR:'33 %',TCD:'35 %',CHN:'25 %',COL:'35 %',COD:'30 %',COG:'28 %',CRI:'30 %',CZE:'21 %',DNK:'22 %',
    EGY:'22,5 %',SLV:'30 %',GNQ:'25 %',ETH:'30 %',FIN:'20 %',GHA:'25 %',GRC:'22 %',GRL:'25 %',GUY:'25 %',HUN:'9 %',ISL:'20 %',IDN:'22 %',
    IRQ:'15 %',ISR:'23 %',JPN:'23,2 %',KAZ:'20 %',KEN:'30 %',KOR:'25 %',XKX:'10 %',KWT:'15 %',LAO:'20 %',LBN:'17 %',LBR:'25 %',LBY:'20 %',
    LIE:'12,5 %',LTU:'17 %',MAC:'12 %',MDG:'20 %',MYS:'24 %',MLT:'35 %',MRT:'25 %',MUS:'15 %',MEX:'30 %',MDA:'12 %',MNG:'25 %',MNE:'15 %',
    MAR:'35 %',MOZ:'32 %',MMR:'22 %',NLD:'25,8 %',NCL:'30 %',NZL:'28 %',NIC:'30 %',MKD:'10 %',NOR:'22 %',OMN:'15 %',PAK:'29 %',PAN:'25 %',
    PNG:'30 %',PRY:'10 %',PER:'29,5 %',PHL:'25 %',POL:'19 %',PRT:'19 %',PRI:'37,5 %',QAT:'10 %',ROU:'16 %',RWA:'28 %',LCA:'30 %',SAU:'20 %',
    SEN:'30 %',SRB:'15 %',SVK:'24 %',SVN:'22 %',ZAF:'27 %',SWE:'20,6 %',TWN:'20 %',TZA:'30 %',THA:'20 %',TUN:'20 %',UGA:'30 %',URY:'25 %',
    UZB:'15 %',VEN:'34 %',VNM:'20 %',ZMB:'30 %'
  };

  const special={
    BHS:{cit:'Pas de CIT général',citScope:'PwC : CIT non applicable dans le tableau général',special:'Le tableau PwC n’indique pas de CIT général. Les règles de minimum fiscal mondial peuvent toutefois viser certains grands groupes : ne pas lire cette mention comme « aucune fiscalité société dans tous les cas ».',sources:['pwcCIT']},
    BHR:{cit:'0 % / 46 % pétrole',citScope:'0 % pour la plupart des sociétés ; 46 % pétrole',special:'PwC indique 46 % pour les sociétés pétrolières et 0 % pour les autres sociétés ; un DMTT de 15 % peut s’appliquer à certains grands groupes.',sources:['pwcCIT']},
    BGD:{cit:'20–27,5 % selon société',citScope:'AY 2026/27–2030/31 · statut de cotation et conditions',special:'PwC publie plusieurs taux selon la cotation et la part de capital flottant ; Atlas n’en déduit pas un taux unique.',sources:['pwcCIT']},
    BMU:{cit:'0 / 15 %',citScope:'15 % si la société entre dans le champ du CIT des grands groupes ; sinon 0 %',special:'Bermudes : le taux dépend notamment de l’entrée dans le champ du nouveau CIT applicable aux grands groupes. Un simple « 0 % » serait trompeur.',sources:['pwcCIT']},
    CAN:{cit:'15 % fédéral + 8–15 % province',citScope:'Fédéral + provincial/territorial',special:'PwC indique 15 % au fédéral ; les taux provinciaux et territoriaux vont de 8 à 15 % et s’ajoutent.',sources:['pwcCIT']},
    CYM:{cit:'Pas de CIT général',citScope:'PwC : CIT non applicable',special:'L’absence de CIT général ne signifie pas absence de frais, droits, licences, obligations de substance ou règles de minimum fiscal mondial.',sources:['pwcCIT']},
    CHL:{cit:'25 / 27 %',citScope:'Selon régime',special:'PwC indique 25 % ou 27 % selon le régime applicable.',sources:['pwcCIT']},
    HRV:{cit:'10 / 18 %',citScope:'10 % si CA ≤ 1 M€ ; sinon 18 %',special:'Le seuil de chiffre d’affaires et les règles d’assiette doivent être vérifiés avant application.',sources:['pwcCIT']},
    CYP:{cit:'15 %',citScope:'Taux général depuis le 1er janvier 2026',special:'PwC indique 15 % depuis le 1er janvier 2026, contre 12,5 % auparavant.',sources:['pwcCIT']},
    DOM:{cit:'27 / 30 %',citScope:'27 % général ; 30 % transitoire 2026–2028 pour certains grands contribuables',special:'Le 30 % vise temporairement certains contribuables dépassant le seuil de revenus indiqué par PwC.',sources:['pwcCIT']},
    ECU:{cit:'22–28 %',citScope:'Selon structure actionnariale et conformité',special:'PwC indique 22 %, 25 % ou 28 % selon la structure de l’actionnariat et les obligations de transparence.',sources:['pwcCIT']},
    EST:{cit:'22 % à la distribution',citScope:'Bénéfices non distribués exonérés dans le système estonien',special:'Le taux headline ne fonctionne pas comme un impôt annuel classique sur tout bénéfice comptable : la distribution est centrale.',sources:['pwcCIT']},
    SWZ:{cit:'25–27,5 % selon exercice',citScope:'Transition de taux',special:'La page PwC mentionne 27,5 % et un taux de 25 % pour les exercices concernés après la réforme ; vérifier l’exercice exact.',sources:['pwcCIT']},
    GAB:{cit:'30 %',citScope:'Général ; 35 % pétrole/gaz et mines',special:'Les secteurs pétrole, gaz et mines peuvent relever de 35 %.',sources:['pwcCIT']},
    GEO:{cit:'15 %',citScope:'Général ; 20 % pour certaines institutions financières',special:'Banques, credit unions, microfinance et certains prêteurs peuvent relever de 20 %.',sources:['pwcCIT']},
    GIB:{cit:'15 %',citScope:'Général ; 20 % pour certains secteurs/positions dominantes',special:'PwC indique 15 % depuis juillet 2024, avec 20 % pour certains opérateurs d’énergie/utilities et cas particuliers.',sources:['pwcCIT']},
    GTM:{cit:'25 % bénéfice / 7 % brut',citScope:'Deux systèmes',special:'Le système sur bénéfice net et le régime simplifié sur revenu brut ne sont pas directement comparables.',sources:['pwcCIT']},
    GGY:{cit:'0 / 10 / 20 %',citScope:'Selon activité',special:'Guernesey applique 0 % dans le régime général, 10 % à plusieurs activités financières et 20 % à certains revenus/secteurs. Le taux de minimum fiscal mondial peut être pertinent pour certains groupes.',sources:['pwcCIT']},
    HND:{cit:'25 % + surtaxe possible',citScope:'25 % + 5 % au-delà d’un seuil de bénéfice',special:'La surtaxe de 5 % peut s’ajouter au-delà du seuil indiqué par le droit local.',sources:['pwcCIT']},
    HKG:{cit:'16,5 % sociétés',citScope:'Profits tax · sociétés ; 15 % non-incorporé',special:'Hong Kong applique une logique territoriale et distingue notamment sociétés et activités non incorporées.',sources:['pwcCIT']},
    IND:{cit:'15–30 % domestique',citScope:'Selon régime/CA ; PE étranger 35 % avant surtaxes/cess',special:'Plusieurs régimes coexistent. PwC indique notamment 25/30 % selon le chiffre d’affaires et 15/22 % sous certaines conditions.',sources:['pwcCIT']},
    IRL:{cit:'12,5 % / 25 %',citScope:'Trading / non-trading',special:'Les revenus commerciaux et non commerciaux ne relèvent pas du même taux.',sources:['pwcCIT']},
    IMN:{cit:'0 / 10 / 15 / 20 %',citScope:'Selon secteur',special:'Le régime général est à 0 %, avec taux spécifiques pour banques, grandes enseignes, immobilier et pétrole. Pillar Two peut modifier la charge des grands groupes.',sources:['pwcCIT']},
    JAM:{cit:'25–33⅓ %',citScope:'Selon type de société',special:'PwC distingue sociétés non régulées, régulées, building societies et assurance-vie.',sources:['pwcCIT']},
    JEY:{cit:'0 / 10 / 20 %',citScope:'Selon secteur',special:'Régime général à 0 %, services financiers à 10 %, certaines activités/immobilier à 20 %. Pillar Two peut viser les grands groupes.',sources:['pwcCIT']},
    JOR:{cit:'20 / 24 / 35 %',citScope:'Selon secteur + contribution nationale',special:'Banques, télécoms, assurances, mines, énergie et autres activités n’ont pas le même taux ; une contribution nationale peut s’ajouter.',sources:['pwcCIT']},
    LVA:{cit:'20 % à la distribution',citScope:'Payable lors de la distribution',special:'Comme en Estonie, la mécanique de taxation à la distribution diffère d’un CIT annuel classique.',sources:['pwcCIT']},
    LUX:{cit:'23,87 % combiné',citScope:'CIT + surtaxe solidarité + taxe communale · Luxembourg-ville',special:'Le taux combiné dépend notamment de la commune ; PwC donne 23,87 % pour Luxembourg-ville.',sources:['pwcCIT']},
    MUS:{cit:'15 %',citScope:'Général ; 3 % pour certaines exportations de biens',special:'Des contributions et levies additionnels peuvent s’appliquer selon le profil.',sources:['pwcCIT']},
    NAM:{cit:'30 %',citScope:'Taux effectif pour exercices commençant à partir de 2025',special:'La page PwC affiche encore un headline historique de 31 % tout en précisant 30 % pour les exercices commençant à partir du 1er janvier 2025 ; Atlas retient 30 % pour 2026.',sources:['pwcCIT']},
    NGA:{cit:'0 / 30 %',citScope:'Petites / grandes entreprises',special:'PwC indique 0 % pour les petites entreprises et 30 % pour les grandes ; les seuils doivent être vérifiés.',sources:['pwcCIT']},
    PSE:{cit:'15 / 20 %',citScope:'20 % pour certaines télécoms/franchises/monopoles',special:'Le taux général ne décrit pas les secteurs soumis à 20 %.',sources:['pwcCIT']},
    QAT:{cit:'10 %',citScope:'Général ; minimum 35 % pétrole/pétrochimie',special:'Le traitement de l’énergie diffère fortement du taux général.',sources:['pwcCIT']},
    CHE:{cit:'8,5 % fédéral + cantons',citScope:'11,66–20,54 % effectif total selon lieu',special:'PwC indique un taux fédéral de 8,5 % sur bénéfice après impôt et un taux effectif total variable selon canton/commune.',sources:['pwcCIT']},
    TTO:{cit:'30 %',citScope:'35 % banques commerciales et pétrochimie',special:'Les secteurs visés peuvent relever de 35 %.',sources:['pwcCIT']},
    TUR:{cit:'25 %',citScope:'30 % pour le secteur financier',special:'Le taux général ne couvre pas certaines institutions financières.',sources:['pwcCIT']},
    UKR:{cit:'18 % général',citScope:'25 % certaines institutions financières ; banques 50 % en 2026',special:'Le secteur financier connaît des taux spécifiques nettement supérieurs.',sources:['pwcCIT']}
  };

  const fallback2025={
    AFG:'20 %',AND:'10 %',BDI:'30 %',BEN:'30 %',BFA:'27,5 %',BLR:'25 %',BLZ:'0 %',BTN:'25 %',CAF:'30 %',CUB:'35 %',DJI:'25 %',DZA:'26 %',ERI:'30 %',FJI:'25 %',FLK:'26 %',
    GIN:'25 %',GMB:'27 %',GNB:'25 %',GRD:'28 %',HTI:'30 %',IRN:'25 %',KGZ:'10 %',LKA:'30 %',LSO:'25 %',MDV:'15 %',MLI:'30 %',MWI:'30 %',NER:'30 %',NPL:'25 %',
    RUS:'25 %',SDN:'35 %',SLB:'30 %',SLE:'25 %',SMR:'17 %',SOM:'15 %',SSD:'30 %',SUR:'36 %',SYC:'25 %',SYR:'25 %',TGO:'27 %',TJK:'18 %',TKM:'8 %',TLS:'10 %',
    VUT:'0 %',YEM:'20 %',ZWE:'25,75 %'
  };

  // Official Andorran source is current and therefore overrides the 2025 fallback.
  special.AND={cit:'10 %',citScope:'IS · taux général',special:'Le Govern d’Andorra indique un taux général de 10 % ; certains organismes de placement collectif relèvent de 0 %.',sources:['andorraCorp']};

  const apply=(id,row,checked)=>{
    const existing=d.countries[id]||{};
    if(existing.cit) return; // official/national Atlas entry wins
    d.countries[id]={
      ...existing,
      ...row,
      sources:[...new Set([...(existing.sources||[]),...(row.sources||[])])],
      checked
    };
  };

  for(const [id,cit] of Object.entries(current)){
    apply(id,{cit,citScope:'CIT statutaire headline · repère PwC',special:'Repère mondial de largeur : taux statutaire headline. Il ne constitue pas une simulation de charge effective et peut exclure taxes locales, minimum tax, surtaxes, crédits ou régimes sectoriels.',sources:['pwcCIT']},'16.09.2026 · PwC WWTS');
  }
  for(const [id,row] of Object.entries(special)) apply(id,row,'16.09.2026 · PwC/official');
  for(const [id,cit] of Object.entries(fallback2025)){
    apply(id,{cit,citScope:'Taux statutaire 2025 · secours historique',special:'PwC WWTS ne couvre pas cette juridiction dans son tableau courant utilisé ici. Atlas affiche donc le taux statutaire 2025 de Tax Foundation, explicitement daté : à revalider avant toute décision 2026.',sources:['taxFoundationCIT2025']},'Tax Foundation · 2025');
  }

  window.ATLAS_CORPORATE_WORLD={
    currentSource:'PwC Worldwide Tax Summaries',
    fallbackSource:'Tax Foundation 2025',
    currentIds:[...new Set([...Object.keys(current),...Object.keys(special)])],
    fallbackIds:Object.keys(fallback2025),
    loadedAt:'2026-09-16'
  };
})();
