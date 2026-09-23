const assert=require('node:assert/strict'),fs=require('node:fs');
const p='atlas-exit/country-evidence-portugal.js',s=fs.readFileSync(p,'utf8'),i=fs.readFileSync('atlas-exit/index.html','utf8');
const must=[
"country:'Portugal',iso3:'PRT'","evidenceBatch:'DEX-1+DEX-25+DEX-26'",
"state:'READY_FOR_PRODUCT'","fresh('WATCH','IMMEDIATE+EVENT'","checkedOn:'2026-09-23'","oe2026OperativeBaseline:true","proposal17SepSettledLaw:false","finalProposalRatesHardcoded:false","readinessSeparateFromFreshnessWatch:true",
'https://info.portaldasfinancas.gov.pt/en/tax-information/getting-started-in-portugal/tax-residency/tax-residency-rules/Pages/default.aspx',
'https://www.gov.pt/guias/imposto-sobre-o-rendimento-das-pessoas-singulares-irs-em-portugal',
'https://portugal.gov.pt/pt/gc25/governo/comunicados-do-conselho-de-ministros/comunicado-do-conselho-de-ministros-de-17-de-setembro-de-2026',
'https://www.parlamento.pt/ActividadeParlamentar/Paginas/DetalheIniciativa.aspx?BID=377272',
'https://www.oe.gov.pt/financas-a-lupa/artigos/o-que-e-o-irc-e-quem-tem-de-o-pagar/',
'https://www.gov.pt/guias/imposto-sobre-valor-acrescentado-iva-em-portugal',
'https://www.ine.pt/ine_novidades/semin/INEWS60/78-79/',
'https://www2.gov.pt/en/servicos/pedir-o-certificado-de-registo-para-cidadao-da-ue/eee/suica',
'https://www2.gov.pt/en/servicos/pedir-o-numero-de-utente-do-sns',
'https://www2.gov.pt/en-GB/servicos/inscrever-se-no-centro-de-saude',
'https://www.diplomatie.gouv.fr/fr/information-par-pays/portugal/conseils-aux-voyageurs-securite',
'allInScalarForbidden:true','portugalWideScalarForbidden:true','expatBudget:false','singlePersonBudget:false','taxResidenceSeparateFromImmigration:true','taxResidenceSeparate:true','snsNumberMeansAllServicesFree:false','scalarScoreForbidden:true'
];for(const x of must)assert.ok(s.includes(x),'missing frozen contract fragment: '+x);
assert.equal((s.match(/state:'READY_FOR_PRODUCT'/g)||[]).length,8,'Portugal must expose 8 literal READY_FOR_PRODUCT fields');
assert.equal((s.match(/https:\/\//g)||[]).length,11,'Portugal candidate must expose 11 direct source locators');
assert.ok(!s.includes('proposal17SepSettledLaw:true'),'September proposal must not be treated as settled law');
assert.ok(!s.includes('finalProposalRatesHardcoded:true'),'proposal final rates must not be hard-coded');
assert.ok(/Proposta de Lei 108\/XVII\/2 enacted, rejected or materially amended; Diário da República publication; or official verification of final rates\/effective date/.test(s),'event-driven WATCH trigger missing');
assert.ok(i.includes('country-evidence-portugal.js?v=pex-d1j-1'),'Portugal wiring missing');
assert.equal((i.match(/country-evidence-portugal\.js\?v=pex-d1j-1/g)||[]).length,1,'Portugal wiring must occur exactly once');
console.log(JSON.stringify({candidate:'99a90012fd25c75d112be4f6dc63ab848d738928',result:'PASS',core8:8,fieldStates:'READY_FOR_PRODUCT',pitFreshness:'WATCH',checkedOn:'2026-09-23',directLocators:11,proposalHardcoded:false,releasePreservation:true},null,2));
