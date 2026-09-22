const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const cwd=process.cwd();
const req=p=>require(path.join(cwd,p));

const core=req('atlas-exit/country-evidence.js');
req('atlas-exit/country-evidence-singapore.js');
const e=globalThis.ATLAS_COUNTRY_EVIDENCE;
const sgp=e.countries.SGP;
assert.ok(sgp);
assert.equal(sgp.integrationState,'published');
assert.equal(e.validateCountry(sgp).ok,true);
assert.deepEqual(Object.keys(sgp.fields),e.requiredFields);
const states=Object.values(sgp.fields).map(x=>x.state);
assert.equal(states.filter(x=>x==='READY_WITH_CAVEAT').length,0);
assert.equal(states.filter(x=>x==='READY_FOR_PRODUCT').length,8);
const counts={tax_residency:1,pit:1,cit_business:1,consumption_tax:1,cost_context:1,residence_visa:2,healthcare:2,safety_context:1};
for(const [k,n] of Object.entries(counts))assert.equal(e.sourcesFor(sgp.fields[k]).length,n,k);
assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),10);
assert.deepEqual(e.sourcesFor(sgp.fields.residence_visa).map(s=>s.locator),[
  'https://www.mom.gov.sg/passes-and-permits/employment-pass/eligibility',
  'https://www.ica.gov.sg/enter-depart/extend_short_stay'
]);
assert.deepEqual(e.sourcesFor(sgp.fields.healthcare).map(s=>s.locator),[
  'https://medishieldlife.moh.gov.sg/',
  'https://www.cpf.gov.sg/service/article/what-happens-to-my-medishield-life-careshield-life-or-eldershield-or-integrated-shield-plan-coverage-if-i-renounce-my-singapore-citizenship-or-permanent-residency'
]);
assert.equal(sgp.fields.tax_residency.structure.generalDayTest,183);
assert.equal(sgp.fields.tax_residency.structure.multiYearConcessions,true);
assert.equal(sgp.fields.tax_residency.structure.universal183DayOnlyRule,false);
assert.equal(sgp.fields.pit.structure.topResidentMarginalRate,24);
assert.equal(sgp.fields.pit.structure.residentNonresidentDifferent,true);
assert.equal(sgp.fields.cit_business.structure.statutoryRate,17);
assert.equal(sgp.fields.cit_business.structure.ya2026RebateNotPermanentRateCut,true);
assert.equal(sgp.fields.consumption_tax.structure.standardRate,9);
assert.equal(sgp.fields.cost_context.structure.averageMonthlyHouseholdExpenditureSGD,5931);
assert.equal(sgp.fields.cost_context.structure.expatBudget,false);
assert.equal(sgp.fields.cost_context.structure.singlePersonBudget,false);
assert.equal(sgp.fields.residence_visa.structure.headlineMinimumSalarySGD,5600);
assert.equal(sgp.fields.residence_visa.structure.employmentPassTwoStage,true);
assert.equal(sgp.fields.residence_visa.structure.compassUnlessExempt,true);
assert.equal(sgp.fields.residence_visa.structure.visitorIsNotWorker,true);
assert.deepEqual(sgp.fields.healthcare.structure.medishieldUniversalFor,['citizens','permanent_residents']);
assert.equal(sgp.fields.healthcare.structure.ordinaryForeignPassAutomaticallyCovered,false);
assert.equal(sgp.fields.safety_context.structure.scalarScoreForbidden,true);
console.log('PEX-D1F contract PASS');

const {chromium}=require('playwright');
const url='http://127.0.0.1:8000/atlas-exit/index.html';
const report={productHead:'dee08b010d9a5f25cb6d64e1d8c7dd89ae53eee4',baseHead:'a9ff48e53dff3bba3eb4d1311396c483fd87fd70',viewports:[],errors:[]};

async function openCountry(page,name,id,panelSelector){
  const dismiss=page.locator('[data-dismiss]');
  if(await dismiss.count())await dismiss.click().catch(()=>{});
  await page.locator('#countrySearch').fill(name);
  await page.waitForTimeout(160);
  const row=page.locator(`[data-country="${id}"]`).first();
  await row.waitFor({state:'attached'});
  await row.evaluate(el=>el.click());
  await page.waitForSelector(panelSelector);
  return page.locator(panelSelector);
}

(async()=>{
 const browser=await chromium.launch({headless:true});
 for(const cfg of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
  const context=await browser.newContext({viewport:{width:cfg.width,height:cfg.height}});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(String(err)));
  page.on('console',m=>{if(m.type()==='error'&&!/umami|ERR_FAILED|Failed to load resource/i.test(m.text()))errors.push('console: '+m.text())});
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#resultCount')?.textContent&&!/Chargement/.test(document.querySelector('#resultCount').textContent),null,{timeout:15000});
  await page.waitForFunction(()=>window.ATLAS_COUNTRY_EVIDENCE?.countries?.SGP?.integrationState==='published',null,{timeout:10000});
  assert.equal(await page.evaluate(()=>document.fonts.check('12px Manrope')),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  const z0=await page.locator('#zoomValue').textContent();
  await page.locator('#zoomIn').click(); await page.waitForTimeout(100);
  const z1=await page.locator('#zoomValue').textContent(); assert.notEqual(z0,z1);
  if(cfg.name==='mobile'){await page.locator('#mobileFilters').click();assert.equal(await page.locator('#mobileFilters').getAttribute('aria-expanded'),'true');}
  const runtime=await page.evaluate(()=>{
    const c=window.AtlasExplorer.getCountries().find(x=>x.id==='SGP');
    const s=window.ATLAS_COUNTRY_EVIDENCE.countries.SGP;
    const commerce=window.ATLAS_COMMERCE?.countries?.SGP||{};
    return {tax:c.tax,taxLabel:c.taxLabel,scope:c.scope,year:c.taxYear,taxStore:window.ATLAS_TAX?.SGP?.tax,bootstrap:window.ATLAS_FISCAL_FINALIZE.countryEvidenceBootstrap,cit:commerce.cit,vat:commerce.vat,dayTest:s.fields.tax_residency.structure.generalDayTest,pitTop:s.fields.pit.structure.topResidentMarginalRate,citRate:s.fields.cit_business.structure.statutoryRate,gst:s.fields.consumption_tax.structure.standardRate};
  });
  assert.equal(runtime.tax,24); assert.equal(runtime.taxStore,24);
  assert.equal(runtime.taxLabel,'Jusqu’à 24 % résident');
  assert.match(runtime.scope,/PIT résident progressif/i); assert.equal(runtime.bootstrap,'pex-d1f-1');
  assert.equal(runtime.cit,'17 % statutaire'); assert.equal(runtime.vat,'9 % standard');
  assert.equal(runtime.dayTest,183); assert.equal(runtime.pitTop,24); assert.equal(runtime.citRate,17); assert.equal(runtime.gst,9);

  const panel=await openCountry(page,'Singapour','SGP','[data-atlas-singapore-evidence][data-country="SGP"]');
  assert.equal(await panel.locator('[data-evidence-field]').count(),8);
  assert.equal(await panel.locator('a.detail-source').count(),10);
  assert.equal(await panel.locator('[data-source-count]').count(),2);
  const multiCounts=await panel.locator('[data-source-count]').evaluateAll(rows=>rows.map(x=>Number(x.getAttribute('data-source-count'))));
  assert.deepEqual(multiCounts,[2,2]);
  const panelStates=await panel.locator('[data-evidence-state]').evaluateAll(rows=>rows.map(x=>x.getAttribute('data-evidence-state')));
  assert.equal(panelStates.filter(x=>x==='READY_FOR_PRODUCT').length,8); assert.equal(panelStates.filter(x=>x==='READY_WITH_CAVEAT').length,0);
  const text=await panel.innerText();
  for(const re of [/183 jours/i,/24 %/,/17 %/,/GST 9 %/,/5 931 SGD/,/5 600 SGD/,/COMPASS/,/MediShield Life/])assert.match(text,re);
  assert.doesNotMatch(text,/Non documenté|À documenter/i);
  assert.equal(await page.locator('.tax-stack').evaluate(el=>el.hidden),true);
  assert.equal(await page.locator('.source-disclosure').evaluate(el=>el.hidden),true);
  const box=await page.locator('#inspector').boundingBox();
  assert.ok(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=cfg.width+1&&box.y+box.height<=cfg.height+1);
  await page.locator('[data-save="SGP"]').click(); assert.equal(await page.locator('#savedCount').textContent(),'1');

  let p=await openCountry(page,'Suisse','CHE','[data-atlas-switzerland-evidence][data-country="CHE"]'); assert.equal(await p.locator('[data-evidence-field]').count(),8); assert.equal(await p.locator('a.detail-source').count(),12); await page.locator('[data-save="CHE"]').click(); assert.equal(await page.locator('#savedCount').textContent(),'2');
  p=await openCountry(page,'Japon','JPN','[data-atlas-japan-evidence][data-country="JPN"]'); assert.equal(await p.locator('[data-evidence-field]').count(),8); assert.equal(await p.locator('a.detail-source').count(),13);
  p=await openCountry(page,'Espagne','ESP','[data-atlas-spain-evidence][data-country="ESP"]'); assert.equal(await p.locator('[data-evidence-field]').count(),8); assert.equal(await p.locator('a.detail-source').count(),9);
  p=await openCountry(page,'Australie','AUS','[data-atlas-australia-evidence][data-country="AUS"]'); assert.equal(await p.locator('[data-evidence-field]').count(),8); assert.equal(await p.locator('a.detail-source').count(),11);
  p=await openCountry(page,'Thaïlande','THA','[data-atlas-evidence-panel][data-country="THA"]'); assert.equal(await p.locator('[data-evidence-field]').count(),8); assert.equal(await p.locator('a.detail-source').count(),8);

  await page.locator('#openCompare').click(); await page.locator('#compareDialog').waitFor({state:'visible'}); await page.waitForTimeout(150);
  const compare=await page.locator('#compareTable').innerText();
  assert.match(compare,/Singapour/); assert.match(compare,/24 % résident/); assert.match(compare,/17 % statutaire/); assert.match(compare,/GST 9 % standard/);
  assert.ok(await page.locator('#compareTable [data-atlas-normalized="SGP"]').count()>=5);
  await page.locator('#compareDialog [data-close]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.screenshot({path:`qa-artifacts/pex-d1f-${cfg.name}.png`,fullPage:false});
  const full=await page.screenshot({path:`qa-artifacts/pex-d1f-${cfg.name}-full.png`,fullPage:true});
  report.viewports.push({name:cfg.name,width:cfg.width,height:cfg.height,zoom:[z0,z1],runtime,fields:8,sourceLinks:10,multiSourceGroups:multiCounts,inspector:box,fullScreenshotBytes:full.length});
  report.errors.push(...errors.map(x=>`${cfg.name}: ${x}`)); assert.deepEqual(errors,[]);
  await context.close();
 }
 await browser.close(); fs.mkdirSync('qa-artifacts',{recursive:true}); fs.writeFileSync('qa-artifacts/pex-d1f-report.json',JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2));
})().catch(err=>{console.error(err);process.exit(1)});
