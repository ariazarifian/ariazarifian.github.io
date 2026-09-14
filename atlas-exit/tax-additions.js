/* Corporate and consumption reference rates. Primary sources consulted 2026-09-14.
   These are not effective personal/company tax estimates. Existing income data is preserved. */
(()=>{'use strict';const d=window.ATLAS_COMMERCE;if(!d)return;
Object.assign(d.sources,{
 frBusiness:{name:'DGFiP · fiscalité des entreprises, IS et TVA',url:'https://www.impots.gouv.fr/international-professionnel/fiscalite-des-entreprises'},
 frCorp:{name:'DGFiP · IS normal et taux réduit',url:'https://www.impots.gouv.fr/international-professionnel/impot-sur-les-societes'},
 deCorp:{name:'Germany Trade & Invest · impôts des sociétés',url:'https://www.gtai.de/en/invest/investment-guide/corporate-taxation-in-germany'},
 deVat:{name:'Germany Trade & Invest · TVA',url:'https://www.gtai.de/en/invest/investment-guide/value-added-tax-561538'},
 itBusiness:{name:'Invest in Italy · IRES, IRAP et TVA',url:'https://www.investinitaly.gov.it/en/doing-business/taxation'},
 esCorp:{name:'AEAT · taux des sociétés 2026',url:'https://sede.agenciatributaria.gob.es/Sede/impuesto-sobre-sociedades/que-base-imponible-se-determina-sociedades/tipo-impositivo.html'},
 esVat:{name:'AEAT · taux de TVA',url:'https://sede.agenciatributaria.gob.es/Sede/iva/calculo-iva-repercutido-clientes/tipos-impositivos-iva.html'},
 ukCorp:{name:'HMRC · Corporation Tax',url:'https://www.gov.uk/corporation-tax-rates'},
 ukVat:{name:'HMRC · VAT rates',url:'https://www.gov.uk/vat-rates'},
 sgCorp:{name:'IRAS · Corporate Income Tax',url:'https://www.iras.gov.sg/quick-links/tax-rates/corporate-income-tax-rates'},
 sgVat:{name:'IRAS · GST rates',url:'https://www.iras.gov.sg/quick-links/tax-rates/goods-and-services-tax-(gst)-rates'},
 chCorp:{name:'État de Vaud · niveaux fédéral, cantonal et communal',url:'https://www.vd.ch/etat-droit-finances/impots/impots-pour-les-societes/les-impots/impot-sur-le-benefice'},
 chVat:{name:'AFC · taux de TVA suisses',url:'https://www.estv.admin.ch/fr/taux-de-la-tva-suisse'},
 ieCorp:{name:'Irish Revenue · taux des sociétés par revenu',url:'https://www.revenue.ie/en/companies-and-charities/corporation-tax-for-companies/corporation-tax/basis-of-charge.aspx'},
 ieVat:{name:'Irish Revenue · TVA 2026',url:'https://www.revenue.ie/en/vat/vat-rates/search-vat-rates/current-vat-rates.aspx'}
});
const rows={
 FRA:{cit:'25 %',citScope:'IS · taux normal, hors contributions particulières',vat:'20 %',vatScope:'TVA normale · taux réduits et territoires particuliers à distinguer',special:'IS réduit à 15 % sur les premiers 42 500 € de bénéfice sous conditions, notamment de chiffre d’affaires et de détention du capital. Contributions supplémentaires possibles selon la taille ; cotisations et autres taxes ne sont pas incluses.',sources:['frCorp','frBusiness']},
 DEU:{cit:'15 % + suppléments',citScope:'Körperschaftsteuer · pas le prélèvement total',vat:'19 %',vatScope:'TVA normale · taux réduit de 7 % et exonérations selon opération',special:'S’ajoutent le Solidaritätszuschlag, à 5,5 % de l’IS, et la Gewerbesteuer communale variable. Le couple IS + solidarité représente 15,825 % avant la taxe communale. Ne pas lire 15 % comme un total national.',sources:['deCorp','deVat']},
 ITA:{cit:'24 %',citScope:'IRES · hors IRAP et dispositions particulières',vat:'22 %',vatScope:'TVA normale · taux réduits selon les biens et services',special:'L’IRAP régionale utilise une assiette distincte ; son taux général de référence est 3,9 %, avec variations régionales et sectorielles. Ne pas additionner IRES et IRAP comme si leurs bases étaient identiques.',sources:['itBusiness']},
 ESP:{cit:'25 %',citScope:'IS général · périodes ouvertes en 2026',vat:'21 %',vatScope:'IVA normale · régimes territoriaux et taux réduits à vérifier',special:'En 2026, les microentreprises éligibles (CA inférieur à 1 M€) peuvent relever de 19 % sur les premiers 50 000 € de base puis 21 %. Un taux de 23 % existe pour certaines entreprises de dimension réduite, et 15 % pour certaines créations. Conditions et exclusions à vérifier.',sources:['esCorp','esVat']},
 GBR:{cit:'19–25 %',citScope:'Corporation Tax · taux selon le bénéfice et les conditions',vat:'20 %',vatScope:'VAT normale · taux de 5 %, taux zéro ou exonération selon opération',special:'Taux normal 25 % au-delà de 250 000 £ de bénéfice ; small profits rate de 19 % jusqu’à 50 000 £, avec marginal relief possible entre les deux. Seuils réduits notamment en présence de sociétés associées ou de périodes courtes.',sources:['ukCorp','ukVat']},
 SGP:{cit:'17 %',citScope:'Taux nominal sur le bénéfice imposable, avant allégements',vat:'9 %',vatScope:'GST normale · exportations et exonérations selon conditions',special:'Des exemptions partielles, dispositifs pour certaines nouvelles entreprises et remises annuelles peuvent réduire la charge. Le taux nominal de 17 % n’est donc pas une estimation de l’impôt réellement payé.',sources:['sgCorp','sgVat']},
 CHE:{cit:'8,5 % + cantons',citScope:'Impôt fédéral sur le bénéfice net · cantonal et communal en plus',vat:'8,1 %',vatScope:'TVA normale · 2,6 % réduit ; 3,8 % hébergement',special:'Le taux fédéral de 8,5 % porte sur le bénéfice net ; les impôts cantonaux et communaux s’ajoutent et les impôts déductibles modifient la base. Le taux effectif total dépend du lieu. La source vaudoise explique ces niveaux, pas un taux identique pour toute la Suisse.',sources:['chCorp','chVat']},
 IRL:{cit:'12,5 % / 25 %',citScope:'12,5 % trading ; 25 % non-trading et activités exceptées',vat:'23 %',vatScope:'TVA normale 2026 · taux réduits distincts selon opération',special:'Les revenus commerciaux et les revenus non commerciaux, par exemple certains loyers ou placements, ne relèvent pas du même taux. La référence de 12,5 % ne couvre pas toutes les activités ni tous les régimes de groupes.',sources:['ieCorp','ieVat']}
};for(const [id,v] of Object.entries(rows))d.countries[id]={...(d.countries[id]||{}),...v,checked:'14.09.2026'};
})();
