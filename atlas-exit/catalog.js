/* Atlas Exit · Editorial snapshot, 14 September 2026. Null means not documented, never zero. */
window.ATLAS_SOURCES={
 tax:'https://taxsummaries.pwc.com/quick-charts/personal-income-tax-pit-rates',
 peace:'https://www.visionofhumanity.org/wp-content/uploads/2025/06/Global-Peace-Index-2025-web.pdf',
 geometry:'https://www.naturalearthdata.com/about/terms-of-use/',
 france:'https://www.service-public.gouv.fr/particuliers/vosdroits/F1419',
 singapore:'https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates',
 uk:'https://www.gov.uk/income-tax-rates',
 usa:'https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill',
 andorra:'https://www.e-tramits.ad/tramits/impostos/irpf',
 monaco:'https://bofip.impots.gouv.fr/bofip/12995-PGP.html/identifiant%3DBOI-INT-CVB-MCO-10-20210602',
 swiss:'https://www.ch.ch/en/taxes-and-finances/paying-taxes/',
 uae:'https://taxsummaries.pwc.com/united-arab-emirates/individual/taxes-on-personal-income'
};
window.ATLAS_CATALOG={
 CHE:{city:'Zurich',zone:'Europe/Zurich',tax:null,taxLabel:'Variable',note:'Impôts fédéral, cantonal et communal : pas de taux national unique. Le canton et la commune changent le calcul.',src:'swiss',tag:'Un choix de canton, pas seulement de pays.',angle:'Comparez d’abord la ville, le logement et le droit de séjour. L’impôt ne se résume pas au taux fédéral.',pin:[8.23,46.82]},
 SGP:{city:'Singapour',zone:'Asia/Singapore',tax:24,scope:'Barème résident',note:'Taux marginal supérieur du barème résident, à partir de l’année d’imposition 2024. Ce n’est pas un taux moyen.',src:'singapore',tag:'Un point d’ancrage en Asie.',angle:'Le statut de résidence, le logement et l’activité envisagée sont les premiers points à instruire.',pin:[103.82,1.35]},
 ARE:{city:'Dubaï',zone:'Asia/Dubai',tax:0,scope:'Revenu personnel',note:'Pas d’impôt personnel sur le revenu. Une activité d’entreprise exercée par une personne physique peut relever de l’impôt sur les sociétés. D’autres taxes existent.',src:'uae',tag:'Distinguer personne, société et résidence.',angle:'Comparez les autorisations d’activité et de séjour avant d’interpréter le chiffre de fiscalité.',pin:[54.5,24]},
 USA:{city:'New York',zone:'America/New_York',tax:37,scope:'Fédéral uniquement',note:'Taux fédéral supérieur pour 2026. Impôts des États et locaux non inclus ; règles particulières pour les citoyens et résidents américains.',src:'usa',tag:'Le choix se joue aussi à l’échelle de l’État.',angle:'Ville, visa, couverture santé et fiscalité locale se préparent ensemble.',pin:[-99,39]},
 FRA:{city:'Paris',zone:'Europe/Paris',tax:45,scope:'Barème IR 2026',note:'Barème 2026 sur les revenus 2025. Hors contributions supplémentaires et cotisations. La situation familiale modifie le calcul.',src:'france',tag:'Le point de départ compte autant que l’arrivée.',angle:'Quitter un pays ne suffit pas à changer de résidence fiscale. Votre situation effective et les conventions restent déterminantes.',pin:[2.35,46.6]},
 GBR:{city:'Londres',zone:'Europe/London',tax:45,scope:'Hors Écosse',note:'Barème 2026–2027 pour l’Angleterre, le pays de Galles et l’Irlande du Nord. L’Écosse a un barème distinct. Cotisations et cas particuliers non inclus.',src:'uk',tag:'Une juridiction, plusieurs réalités.',angle:'Regardez la ville et le statut de séjour avant de comparer les chiffres du barème.',pin:[-2.5,54]},
 AND:{city:'Andorre-la-Vieille',zone:'Europe/Andorra',tax:10,scope:'IRPF',note:'Taux de l’IRPF de 10 %, avec abattements et bonifications. L’accès à la résidence et les cotisations sont des sujets séparés.',src:'andorra',tag:'La résidence est une démarche à part entière.',angle:'Éligibilité, logement et activité doivent être examinés avant tout engagement.',pin:[1.52,42.5]},
 MCO:{city:'Monaco',zone:'Europe/Monaco',tax:null,taxLabel:'Selon nationalité',note:'Pas d’impôt monégasque sur le revenu des personnes physiques, mais la convention franco-monégasque maintient en principe l’imposition française des Français concernés. Ne pas lire « 0 % pour tous ».',src:'monaco',tag:'Une exception française essentielle.',angle:'Nationalité, résidence réelle et logement priment sur les raccourcis « zéro impôt ».',pin:[7.42,43.73]},
 PRT:{city:'Lisbonne',zone:'Europe/Lisbon',tax:48,scope:'Barème résident',note:'Taux supérieur hors surtaxe de solidarité. Les régimes particuliers ne sont pas inclus.',tag:'Séparer cadre de vie et régime fiscal.',pin:[-8,39.5]},
 DEU:{city:'Berlin',zone:'Europe/Berlin',tax:45,scope:'Hors majorations',note:'Taux supérieur hors majorations et cotisations. Ce n’est pas le prélèvement total.',tag:'Le quotidien se décide aussi localement.',pin:[10,51]},
 THA:{city:'Bangkok',zone:'Asia/Bangkok',tax:35,scope:'Barème résident',note:'Barème supérieur ; le traitement des revenus étrangers et de leur transfert doit être étudié séparément.',tag:'Résidence et source des revenus à distinguer.',pin:[101,15]},
 CAN:{city:'Toronto',zone:'America/Toronto',tax:33,scope:'Fédéral uniquement',note:'Taux fédéral supérieur. Les impôts provinciaux et territoriaux s’y ajoutent.',tag:'La province change le projet.',pin:[-106,56]},
 AUS:{city:'Sydney',zone:'Australia/Sydney',tax:45,scope:'Barème national',note:'Taux supérieur hors prélèvements additionnels. Résidence et couverture santé sont à étudier séparément.',pin:[134,-25]},
 NZL:{city:'Auckland',zone:'Pacific/Auckland',tax:39,scope:'Barème national',pin:[173,-41]},
 AUT:{city:'Vienne',zone:'Europe/Vienna',tax:55,scope:'Tranche supérieure',note:'Taux supérieur temporaire indiqué jusqu’en 2029 dans la source ; hors cotisations.'},
 BEL:{city:'Bruxelles',zone:'Europe/Brussels',tax:50,scope:'Fédéral uniquement',note:'Les additionnels communaux s’ajoutent au taux fédéral.'},
 BGR:{city:'Sofia',zone:'Europe/Sofia',tax:10,scope:'Taux général',pin:[25,42.7]},
 CHN:{city:'Shanghai',zone:'Asia/Shanghai',tax:45,scope:'Barème national'},
 CYP:{city:'Nicosie',zone:'Asia/Nicosia',tax:35,scope:'Barème général'},
 CZE:{city:'Prague',zone:'Europe/Prague',tax:23,scope:'Tranche supérieure'},
 EST:{city:'Tallinn',zone:'Europe/Tallinn',tax:22,scope:'Taux général'},
 GEO:{city:'Tbilissi',zone:'Asia/Tbilisi',tax:20,scope:'Taux général',note:'Le régime général n’est pas le régime spécial de certaines petites entreprises.'},
 HUN:{city:'Budapest',zone:'Europe/Budapest',tax:15,scope:'Taux général'},
 IRL:{city:'Dublin',zone:'Europe/Dublin',tax:40,scope:'Hors prélèvements',note:'L’USC et les cotisations ne sont pas incluses.'},
 ITA:{city:'Rome',zone:'Europe/Rome',tax:43,scope:'Hors taxes locales'},
 MYS:{city:'Kuala Lumpur',zone:'Asia/Kuala_Lumpur',tax:30,scope:'Barème résident'},
 MEX:{city:'Mexico',zone:'America/Mexico_City',tax:35,scope:'Barème résident'},
 NLD:{city:'Amsterdam',zone:'Europe/Amsterdam',tax:49.5,scope:'Taux supérieur'},
 JPN:{city:'Tokyo',zone:'Asia/Tokyo',tax:null,taxLabel:'À documenter'},
 ISL:{city:'Reykjavik',zone:'Atlantic/Reykjavik',tax:null,taxLabel:'À documenter'},
 ESP:{city:'Madrid',zone:'Europe/Madrid',tax:null,taxLabel:'Selon région',note:'La région autonome modifie la taxation finale. Pas de comparaison chiffrée homogène dans cette version.'}
};
// Selected facts, not a reproduction of the whole index. Historical 2025 edition, not a live risk assessment.
window.ATLAS_PEACE={ISL:1,IRL:2,NZL:3,AUT:4,CHE:5,SGP:6,PRT:7,DNK:8,SVN:9,FIN:10,CZE:11,JPN:12,MYS:13,NLD:14,CAN:14,BEL:16,HUN:17,AUS:18,HRV:19,DEU:20,BTN:21,LVA:22,LTU:22,EST:24,ESP:25,MUS:26,QAT:27,SVK:28,BGR:29,GBR:30,KWT:31,NOR:32,ITA:33,MNE:34,SWE:35,POL:36,MNG:37,ROU:38,VNM:38,TWN:40,KOR:41,OMN:42,BWA:43,GRC:45,ARG:46,URY:48,IDN:49,ARE:52,FRA:74,THA:86,USA:128};
window.ATLAS_FEATURED=['CHE','SGP','ARE','PRT','THA','USA','AND','CAN'];
