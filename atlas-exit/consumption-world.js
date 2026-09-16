/* Atlas Expat — worldwide consumption-tax coverage.
   Existing official/national Atlas entries win. PwC WWTS current VAT/GST quick chart
   fills broad gaps; official/current or clearly labelled secondary references close the remainder.
   Values are standard/reference indirect-tax rates, not an effective cost-of-living estimate. */
(()=>{
  'use strict';
  const d=window.ATLAS_COMMERCE;
  if(!d) return;

  Object.assign(d.sources,{
    pwcVAT:{name:'PwC Worldwide Tax Summaries · standard VAT/GST rates',url:'https://taxsummaries.pwc.com/quick-charts/value-added-tax-vat-rates'},
    tradingEconomicsVAT:{name:'Trading Economics · sales/VAT tax rates 2026',url:'https://tradingeconomics.com/country-list/sales-tax-rate'},
    bhutanGST:{name:'Bhutan DRC · GST 5% depuis le 1er janvier 2026',url:'https://www.drc.gov.bt/wp-content/uploads/2026/02/Frequently-Asked-Questions-3.pdf'},
    fijiVAT:{name:'Fiji Revenue & Customs · VAT 12,5%',url:'https://frcs.org.fj/our-services/taxation-section/non-individuals/reporting-and-paying-taxes/vat-guide/'},
    vanuatuVAT:{name:'Vanuatu Customs & Inland Revenue · VAT',url:'https://customs.vanuatu.gov.vu/taxes-and-licensing/taxes/value-added-tax-vat/introduction.html'},
    falklandIndirect:{name:'Falkland Islands Government · Individual Tax Guide 2026',url:'https://www.falklands.gov.fk/taxation/individuals-employees/general-individual-guidance/general-individual-tax-guide'},
    solomonGoodsTax:{name:'Solomon Islands IRD · Goods Tax',url:'https://www.ird.gov.sb/goods-tax/'},
    timorSales:{name:'Timor-Leste · Taxes and Duties Act · sales tax',url:'https://attl.gov.tl/wp-content/uploads/2020/01/Taxes_and_Duties_Act_2008_Eng.pdf'},
    timorBudget2026:{name:'Timor-Leste Ministry of Finance · VAT prévu à partir de 2027',url:'https://mofwebadmin.mof.gov.tl/uploads/Final_Final_Relatorio_ENG_786393448a.pdf'},
    gnbVAT:{name:'IMF · Guinea-Bissau VAT 19%',url:'https://www.elibrary.imf.org/view/journals/002/2026/140/article-A001-en.xml'},
    southSudanSales:{name:'World Bank · South Sudan sales tax 18%',url:'https://documents1.worldbank.org/curated/en/099012926150542760/pdf/P500556-5b919a16-66fd-4467-b2c6-d9702bea7f7c.pdf'}
  });

  const p=(vat,vatScope='TVA/GST · taux standard',special)=>({vat,vatScope,special,sources:['pwcVAT']});
  const current={
    ALB:p('20 %'),AGO:p('14 %'),ARG:p('21 %'),ARM:p('20 %'),AUS:p('10 %','GST · taux standard'),AUT:p('20 %'),AZE:p('18 %'),
    BHS:p('10 %'),BHR:p('10 %'),BGD:p('15 %'),BRB:p('17,5 %'),BEL:p('21 %'),BOL:p('13 %'),BIH:p('17 %'),BWA:p('14 %'),BGR:p('20 %'),
    CPV:p('15 %'),KHM:p('10 %'),CMR:p('19,25 %'),CAN:p('5–15 %','GST/HST/PST selon province/territoire','PwC indique une combinaison fédérale/provinciale de 5 à 15 % selon le lieu.'),
    TCD:p('18 %'),CHL:p('19 %'),CHN:p('6 / 9 / 13 %','TVA selon biens/services','PwC publie 13 %, 9 % ou 6 % selon la nature des biens et services.'),COL:p('19 %'),COD:p('16 %'),COG:p('18,9 %','18 % TVA + surtaxe','PwC donne 18 % de TVA plus une surtaxe de 5 % sur le montant de TVA, soit 18,9 %.'),CRI:p('13 %'),
    HRV:p('25 %'),CYP:p('19 %'),CZE:p('21 %'),DNK:p('25 %'),DOM:p('18 %'),ECU:p('15 %'),EGY:p('14 %'),SLV:p('13 %'),GNQ:p('15 %'),EST:p('24 %'),SWZ:p('15 %'),ETH:p('15 %'),FIN:p('25,5 %'),
    GAB:p('18 %'),GEO:p('18 %'),GHA:p('15 % + levies','TVA standard + prélèvements','PwC indique 15 % de TVA standard, avec notamment NHIL 2,5 % et GETFL 2,5 % sur les fournitures taxables.'),GRC:p('24 %'),GTM:p('12 %'),GUY:p('14 %'),HND:p('15 %','Sales tax · taux standard'),HUN:p('27 %'),
    ISL:p('24 %'),IND:p('18 %','GST · taux général de référence','Les taux GST vont de 5 à 28 % selon la catégorie ; PwC indique 18 % comme taux général de la majorité des biens/services.'),IDN:p('12 %'),IRQ:p('Variable','Sales tax selon bien/service','PwC n’indique pas de taux général unique : le taux varie selon le bien ou service.'),
    IRL:p('23 %'),IMN:p('20 %'),ISR:p('18 %'),ITA:p('22 %'),CIV:p('18 %'),JAM:p('15 %','General Consumption Tax'),JPN:p('10 %','Consumption tax'),JEY:p('5 %','GST'),JOR:p('16 %','Sales tax'),KAZ:p('16 %'),KEN:p('16 %'),KOR:p('10 %'),XKX:p('18 %'),
    LAO:p('10 %'),LVA:p('21 %'),LBN:p('11 %'),LBR:p('13 % / 15 %','GST / VAT selon régime','PwC indique GST 13 % et VAT 15 % selon le régime concerné.'),LIE:p('8,1 %'),LTU:p('21 %'),LUX:p('17 %'),MDG:p('20 %'),
    MYS:p('10 % ventes / 8 % services','Sales & Service Tax','La Malaisie n’utilise pas une TVA générale unique : PwC donne 10 % sales tax et 8 % service tax.'),MLT:p('18 %'),MRT:p('16 %'),MUS:p('15 %'),MEX:p('16 %'),MDA:p('20 %'),MNG:p('10 %'),MNE:p('21 %'),MAR:p('20 %'),MOZ:p('16 %'),
    MMR:p('5 %','Commercial tax · pas de TVA','PwC indique l’absence de TVA ; la taxe indirecte générale est la commercial tax à 5 %.'),NAM:p('15 %'),NLD:p('21 %'),NCL:p('11 %','TGC · taxe générale sur la consommation'),NZL:p('15 %','GST'),NIC:p('15 %'),NGA:p('7,5 %'),MKD:p('18 %'),NOR:p('25 %'),OMN:p('5 %'),
    PAK:p('18 % biens / 15–16 % services','Sales tax selon niveau','PwC indique 18 % sur les biens et 15–16 % sur les services selon la province.'),PSE:p('16 %'),PAN:p('7 %','ITBMS · biens et services'),PNG:p('10 %','GST'),PRY:p('10 %'),PER:p('18 %'),PHL:p('12 %'),POL:p('23 %'),PRT:p('23 %'),PRI:p('11,5 %','Sales & use tax'),
    ROU:p('21 %'),RWA:p('18 %'),LCA:p('12,5 %'),SAU:p('15 %'),SEN:p('18 %'),SRB:p('20 %'),SGP:p('9 %','GST'),SVK:p('23 %'),SVN:p('22 %'),ZAF:p('15 %'),ESP:p('21 %'),SWE:p('25 %'),CHE:p('8,1 %'),TWN:p('5 %'),
    TZA:p('15–18 %','TVA selon territoire/paiement','PwC : Mainland 18 % ou 16 % pour certains paiements électroniques B2C ; Zanzibar 15 % généralement et 18 % pour certains services.'),THA:p('7 %'),TTO:p('12,5 %'),TUN:p('19 %'),TUR:p('20 %'),UGA:p('18 %'),UKR:p('20 %'),ARE:p('5 %'),GBR:p('20 %'),URY:p('22 %'),UZB:p('12 %'),VEN:p('16 %'),VNM:p('10 %'),ZMB:p('16 %'),
    BRA:p('17–20 % ICMS + autres','Système multi-taxes, pas une TVA unique','PwC décrit notamment ICMS d’État généralement 17–20 %, PIS/COFINS fédéraux et ISS municipal. Atlas n’additionne pas ces taxes en un faux taux unique.')
  };

  const noGeneral={
    BMU:'Pas de TVA générale',BRN:'Pas de TVA/GST générale',CYM:'Pas de TVA générale',GIB:'Pas de TVA générale',GRL:'Pas de TVA générale',GGY:'Pas de GST actuellement',HKG:'Pas de TVA/GST générale',KWT:'Pas de TVA générale',LBY:'Pas de TVA générale',MAC:'Pas de TVA générale',QAT:'Pas de TVA générale'
  };

  const te=(vat,note)=>({vat,vatScope:'Taux indirect maximal/de référence · secondaire 2026',special:note||'Repère secondaire Trading Economics 2026 ; exemptions, taux réduits et assiette doivent être vérifiés.',sources:['tradingEconomicsVAT']});
  const fallback={
    AFG:te('10 %'),BDI:te('18 %'),BEN:te('18 %'),BFA:te('18 %'),BLR:te('20 %'),BLZ:te('12,5 %'),CAF:te('19 %'),CUB:te('10 %'),DJI:te('10 %'),DZA:te('19 %'),ERI:te('5 %'),GIN:te('18 %'),GMB:te('15 %'),HTI:te('10 %'),IRN:te('10 %'),KGZ:te('12 %'),LKA:te('18 %'),LSO:te('15 %'),MLI:te('18 %'),MWI:te('16,5 %'),NER:te('19 %'),NPL:te('13 %'),SLE:te('15 %'),SOM:te('10 %'),SDN:te('17 %'),SUR:te('10 %'),SYR:te('—','Aucun taux suffisamment robuste n’est retenu ici ; contexte fiscal à vérifier avant utilisation.'),TGO:te('18 %'),TJK:te('14 %'),TKM:te('15 %'),YEM:te('—','Taux indirect à vérifier selon territoire et type de transaction.'),ZWE:te('15,5 %')
  };

  fallback.BTN={vat:'5 %',vatScope:'GST · taux unique depuis le 1er janvier 2026',special:'Le GST 5 % a remplacé l’ancien système de Bhutan Sales Tax à taux multiples.',sources:['bhutanGST']};
  fallback.FJI={vat:'12,5 %',vatScope:'VAT · taux standard depuis le 1er août 2025',special:'FRCS confirme 12,5 % sur les fournitures taxables ordinaires depuis le 1er août 2025.',sources:['fijiVAT']};
  fallback.FLK={vat:'Pas de TVA / sales tax',vatScope:'Falkland Islands · pas de taxe générale de consommation',special:'Le guide fiscal officiel 2026 indique l’absence de sales tax et de VAT ; droits de douane et autres prélèvements restent distincts.',sources:['falklandIndirect']};
  fallback.GNB={vat:'19 %',vatScope:'VAT · taux statutaire',special:'Le FMI confirme encore en 2026 un taux statutaire de TVA de 19 %.',sources:['gnbVAT']};
  fallback.SLB={vat:'10 % local / 15 % importé',vatScope:'Goods Tax · biens, pas une TVA générale',special:'IRD : goods tax de 10 % sur les biens produits localement et 15 % sur les biens importés. Les services relèvent d’autres taxes ; une réforme VAT est en préparation.',sources:['solomonGoodsTax']};
  fallback.SSD={vat:'18 %',vatScope:'Sales tax · repère légal/opérationnel',special:'Le cadre documenté utilise un sales tax de 18 % ; la transition vers un système VAT reste à suivre.',sources:['southSudanSales']};
  fallback.TLS={vat:'2,5 % import / 0 % domestique',vatScope:'Sales tax actuel · VAT prévu à partir de 2027',special:'La loi actuelle prévoit 2,5 % sur les biens importés et 0 % sur les ventes domestiques taxables ; le budget prévoit une TVA à partir de 2027, pas en 2026.',sources:['timorSales','timorBudget2026']};
  fallback.VUT={vat:'15 %',vatScope:'VAT · taux standard',special:'L’administration de Vanuatu indique un taux standard de VAT de 15 % sur la plupart des biens et services.',sources:['vanuatuVAT']};

  const context={
    ATF:{vat:'Hors comparaison',vatScope:'Territoire non résidentiel standard'},ESH:{vat:'Statut disputé',vatScope:'Aucune fiscalité nationale attribuée automatiquement'},XNC:{vat:'Statut disputé',vatScope:'Chypre du Nord'},XSL:{vat:'Statut disputé',vatScope:'Somaliland'},PRK:{vat:'Données non comparables',vatScope:'Corée du Nord · repère non retenu'}
  };

  const apply=(id,row,checked)=>{
    const existing=d.countries[id]||{};
    if(existing.vat && !/documenter|renseigné/i.test(existing.vat)) return;
    d.countries[id]={...existing,...row,sources:[...new Set([...(existing.sources||[]),...(row.sources||[])])],checked};
  };
  for(const [id,row] of Object.entries(current)) apply(id,row,'16.09.2026 · PwC WWTS');
  for(const [id,label] of Object.entries(noGeneral)) apply(id,{vat:label,vatScope:'PwC WWTS · NA / pas de VAT standard',special:'Pas de TVA/GST générale dans le tableau PwC actuel. Cela ne signifie pas absence de droits, accises, taxes sectorielles ou frais.',sources:['pwcVAT']},'16.09.2026 · PwC WWTS');
  for(const [id,row] of Object.entries(fallback)) apply(id,row,'16.09.2026 · source indiquée');
  for(const [id,row] of Object.entries(context)) apply(id,{...row,special:'Atlas conserve une mention contextuelle plutôt que de transposer artificiellement la fiscalité d’un autre État.',sources:[]},'Contexte Atlas 2026');

  window.ATLAS_CONSUMPTION_WORLD={
    currentIds:Object.keys(current),noGeneralIds:Object.keys(noGeneral),fallbackIds:Object.keys(fallback),contextIds:Object.keys(context),loadedAt:'2026-09-16'
  };
})();
