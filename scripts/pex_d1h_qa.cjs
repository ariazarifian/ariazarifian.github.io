const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('playwright');
const url='http://127.0.0.1:8000/atlas-exit/index.html';
const PRODUCT='e44ae188cbe142a4a6a3aced37704eda9e59569e';
const BASE='93c6cc1b1f54262ad23120d6067765dbaca3bbd8';
const report={productHead:PRODUCT,baseHead:BASE,viewports:[],errors:[]};
async function openCountry(page,name,id,panelSelector){
  await page.locator('#countrySearch').fill(name);
  await page.waitForTimeout(180);
  const row=page.locator(`[data-country="${id}"]`).first();
  await row.waitFor({state:'attached',timeout:10000});
  await row.evaluate(el=>el.click());
  await page.waitForSelector(panelSelector,{timeout:10000});
  return page.locator(panelSelector);
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  for(const cfg of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
    const context=await browser.newContext({viewport:{width:cfg.width,height:cfg.height}}),page=await context.newPage(),errors=[];
    page.on('pageerror',x=>errors.push(String(x)));
    page.on('console',m=>{if(m.type()==='error'&&!/umami|ERR_FAILED|Failed to load resource/i.test(m.text()))errors.push('console: '+m.text())});
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('#resultCount')?.textContent&&!/Chargement/.test(document.querySelector('#resultCount').textContent),null,{timeout:15000});
    await page.waitForFunction(()=>window.ATLAS_COUNTRY_EVIDENCE_UNITED_KINGDOM?.validation?.ok===true,null,{timeout:12000});
    assert.equal(await page.evaluate(()=>document.fonts.check('12px Manrope')),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    if(cfg.name==='mobile'){await page.locator('#mobileFilters').click();assert.equal(await page.locator('#mobileFilters').getAttribute('aria-expanded'),'true');}
    const z0=await page.locator('#zoomValue').textContent();await page.locator('#zoomIn').click();await page.waitForTimeout(100);const z1=await page.locator('#zoomValue').textContent();assert.notEqual(z0,z1);

    const contract=await page.evaluate(()=>{
      const e=window.ATLAS_COUNTRY_EVIDENCE,g=e.countries.GBR,c=window.AtlasExplorer.getCountries().find(x=>x.id==='GBR'),commerce=window.ATLAS_COMMERCE?.countries?.GBR||{};
      const counts=Object.fromEntries(Object.entries(g.fields).map(([k,v])=>[k,e.sourcesFor(v).length]));
      return {keys:Object.keys(g.fields),required:e.requiredFields,states:Object.values(g.fields).map(x=>x.state),counts,total:Object.values(counts).reduce((a,b)=>a+b,0),residence:e.sourcesFor(g.fields.residence_visa).map(s=>s.locator),health:e.sourcesFor(g.fields.healthcare).map(s=>s.locator),tax:c?.tax,taxLabel:c?.taxLabel,scope:c?.scope,cit:commerce.cit,vat:commerce.vat,srt:g.fields.tax_residency.structure,pa:g.fields.pit.structure.standardPersonalAllowanceGBP,scotland:g.fields.pit.structure.scotlandSeparateSchedule,corp:g.fields.cit_business.structure,vatStruct:g.fields.consumption_tax.structure,cost:g.fields.cost_context.structure,visa:g.fields.residence_visa.structure,healthStruct:g.fields.healthcare.structure,safety:g.fields.safety_context.structure};
    });
    assert.deepEqual(contract.keys,contract.required);assert.equal(contract.states.filter(x=>x==='READY_FOR_PRODUCT').length,8);assert.equal(contract.total,11);assert.deepEqual(contract.counts,{tax_residency:1,pit:1,cit_business:1,consumption_tax:1,cost_context:1,residence_visa:3,healthcare:2,safety_context:1});
    assert.deepEqual(contract.residence,['https://www.gov.uk/guidance/check-when-you-can-get-an-electronic-travel-authorisation-eta','https://www.gov.uk/eta/what-you-can-cannot-do','https://www.gov.uk/skilled-worker-visa']);
    assert.deepEqual(contract.health,['https://www.gov.uk/guidance/healthcare-for-eu-and-efta-nationals-living-in-the-uk','https://www.gov.uk/healthcare-immigration-application']);
    assert.equal(contract.tax,null);assert.match(contract.taxLabel,/Écosse distincte/i);assert.match(contract.scope,/Écosse séparée/i);assert.equal(contract.cit,'19–25 % selon bénéfice');assert.equal(contract.vat,'20 % standard');assert.equal(contract.srt.day183OnlyOneRoute,true);assert.equal(contract.srt.universal183DayRule,false);assert.equal(contract.pa,12570);assert.equal(contract.scotland,true);assert.equal(contract.corp.smallProfitsRate,19);assert.equal(contract.corp.mainRate,25);assert.equal(contract.corp.marginalReliefBetween,true);assert.equal(contract.vatStruct.standardRate,20);assert.equal(contract.cost.averageWeeklyHouseholdExpenditureGBP,676.6);assert.equal(contract.cost.expatBudget,false);assert.equal(contract.visa.etaWorkPermission,false);assert.equal(contract.visa.skilledWorkerSeparateRoute,true);assert.equal(contract.healthStruct.automaticNhsFromFrenchNationality,false);assert.equal(contract.safety.scalarScoreForbidden,true);

    let panel=await openCountry(page,'Royaume-Uni','GBR','[data-atlas-united-kingdom-evidence][data-country="GBR"]');
    assert.equal(await panel.locator('[data-evidence-field]').count(),8);assert.equal(await panel.locator('a.detail-source').count(),11);assert.equal(await panel.locator('[data-source-count]').count(),2);assert.deepEqual(await panel.locator('[data-source-count]').evaluateAll(r=>r.map(x=>Number(x.getAttribute('data-source-count')))),[3,2]);
    const states=await panel.locator('[data-evidence-state]').evaluateAll(r=>r.map(x=>x.getAttribute('data-evidence-state')));assert.equal(states.filter(x=>x==='READY_FOR_PRODUCT').length,8);
    const defaultSummaryDisplays=await panel.locator('.atlas-evidence__row > p').evaluateAll(es=>es.map(e=>getComputedStyle(e).display));assert.ok(defaultSummaryDisplays.every(x=>x==='none'));
    const defaultText=await panel.innerText();for(const re of [/183 jours/,/20–45 % E\/W\/NI/,/19 %/,/20 % standard/,/676,60 £/,/ETA visite/,/NHS \/ IHS/,/Vigilance normale/])assert.match(defaultText,re);
    assert.doesNotMatch(defaultText,/This is a UK household average|work routes require route-specific eligibility/i);
    const firstDisclosure=panel.locator('.atlas-evidence__source').first();await firstDisclosure.locator('summary').click();assert.equal(await firstDisclosure.getAttribute('open'),'');assert.equal(await firstDisclosure.locator('a.detail-source').isVisible(),true);
    assert.equal(await page.locator('.tax-stack').evaluate(el=>el.hidden),true);assert.equal(await page.locator('.source-disclosure').evaluate(el=>el.hidden),true);
    const box=await page.locator('#inspector').boundingBox();assert.ok(box&&box.x>=-1&&box.x+box.width<=cfg.width+1);assert.equal(await page.locator('#inspector').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.locator('[data-save="GBR"]').click();assert.equal(await page.locator('#savedCount').textContent(),'1');

    panel=await openCountry(page,'Canada','CAN','[data-atlas-canada-evidence][data-country="CAN"]');assert.equal(await panel.locator('[data-evidence-field]').count(),8);assert.equal(await panel.locator('a.detail-source').count(),12);assert.equal(await page.locator('#inspector').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);await page.locator('[data-save="CAN"]').click();assert.equal(await page.locator('#savedCount').textContent(),'2');
    panel=await openCountry(page,'Singapour','SGP','[data-atlas-singapore-evidence][data-country="SGP"]');assert.equal(await panel.locator('[data-evidence-field]').count(),8);assert.equal(await panel.locator('a.detail-source').count(),10);

    await page.locator('#countrySearch').fill('Royaume-Uni');await page.waitForTimeout(150);assert.equal(await page.locator('[data-country="GBR"]').count(),1);await page.locator('#countrySearch').fill('');
    await page.locator('[data-region="Europe"]').click();await page.waitForTimeout(120);assert.ok(Number((await page.locator('#resultCount').textContent()).match(/\d+/)?.[0]||0)>0);await page.locator('#resetFilters').click();
    await page.locator('[data-layer="conflict"]').click();await page.waitForTimeout(120);assert.equal(await page.locator('[data-layer="conflict"]').getAttribute('aria-pressed'),'true');

    await page.locator('#openCompare').click();await page.locator('#compareDialog').waitFor({state:'visible'});await page.waitForTimeout(180);const compare=await page.locator('#compareTable').innerText();assert.match(compare,/Royaume-Uni/);assert.match(compare,/Canada/);assert.match(compare,/E\/W\/NI 20–45 %/);assert.match(compare,/19 % petites bénéfices/);assert.match(compare,/20 % standard/);assert.ok(await page.locator('#compareTable [data-atlas-normalized="GBR"]').count()>=5);await page.locator('#compareDialog [data-close]').click();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    fs.mkdirSync('qa-artifacts',{recursive:true});await page.screenshot({path:`qa-artifacts/pex-d1h-${cfg.name}.png`,fullPage:false});await page.screenshot({path:`qa-artifacts/pex-d1h-${cfg.name}-full.png`,fullPage:true});
    report.viewports.push({name:cfg.name,width:cfg.width,height:cfg.height,zoom:[z0,z1],fields:8,sourceLinks:11,multiSourceGroups:[3,2],inspector:box,contract});report.errors.push(...errors.map(x=>`${cfg.name}: ${x}`));assert.deepEqual(errors,[]);await context.close();
  }
  await browser.close();fs.writeFileSync('qa-artifacts/pex-d1h-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(err=>{console.error(err);process.exit(1)});
