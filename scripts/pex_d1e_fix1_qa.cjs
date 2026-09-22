const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const cwd=process.cwd();
const req=p=>require(path.join(cwd,p));

// Contract fidelity against the exact Product bytes.
const core=req('atlas-exit/country-evidence.js');
req('atlas-exit/country-evidence-switzerland.js');
const e=globalThis.ATLAS_COUNTRY_EVIDENCE;
const che=e.countries.CHE;
assert.ok(che);
assert.equal(che.integrationState,'published');
assert.equal(e.validateCountry(che).ok,true);
assert.deepEqual(Object.keys(che.fields),e.requiredFields);
const states=Object.values(che.fields).map(x=>x.state);
assert.equal(states.filter(x=>x==='READY_WITH_CAVEAT').length,0);
assert.equal(states.filter(x=>x==='READY_FOR_PRODUCT').length,8);
const counts={tax_residency:1,pit:3,cit_business:1,consumption_tax:1,cost_context:1,residence_visa:2,healthcare:2,safety_context:1};
for(const [k,n] of Object.entries(counts))assert.equal(e.sourcesFor(che.fields[k]).length,n,k);
assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),12);
assert.deepEqual(e.sourcesFor(che.fields.pit).map(s=>s.locator),[
  'https://www.estv.admin.ch/en/individual-taxation',
  'https://www.estv.admin.ch/de/newnsb/khPH1Sn08Zr6iGZYe4tsB',
  'https://www.estv.admin.ch/de/newnsb/VzaAUrhkPx2EPde4a6e3O'
]);
assert.deepEqual(e.sourcesFor(che.fields.residence_visa).map(s=>s.locator),[
  'https://www.sem.admin.ch/sem/en/home/overview-arbeit.html',
  'https://www.sem.admin.ch/sem/en/home/themen/fza_schweiz-eu-efta/eu-efta_buerger_schweiz/faq.html'
]);
assert.deepEqual(e.sourcesFor(che.fields.healthcare).map(s=>s.locator),[
  'https://www.bag.admin.ch/en/health-insurance-requirement-to-obtain-insurance-for-persons-resident-in-switzerland',
  'https://www.bag.admin.ch/en/health-insurance-cross-border-commuters-working-in-switzerland'
]);
assert.equal(che.fields.tax_residency.structure.stayThresholdDaysGainfullyEmployed,30);
assert.equal(che.fields.tax_residency.structure.stayThresholdDaysNotGainfullyEmployed,90);
assert.equal(che.fields.tax_residency.structure.day183ShortcutForbidden,true);
assert.equal(che.fields.tax_residency.structure.treatyCanAlterOutcome,true);
assert.deepEqual(che.fields.pit.structure.layers,['federal','cantonal','communal']);
assert.equal(che.fields.pit.structure.allInScalarForbidden,true);
assert.equal(che.fields.pit.structure.knownFutureReform.implementationYear,2032);
assert.equal(che.fields.pit.structure.knownFutureReform.effectiveIn2026,false);
assert.equal(che.fields.cit_business.structure.federalNetProfitRate,8.5);
assert.equal(che.fields.cit_business.structure.cantonalCommunalTaxesAdditional,true);
assert.equal(che.fields.cit_business.structure.allInScalarForbidden,true);
assert.equal(che.fields.consumption_tax.structure.standardRate,8.1);
assert.equal(che.fields.consumption_tax.structure.reducedRate,2.6);
assert.equal(che.fields.consumption_tax.structure.accommodationRate,3.8);
assert.equal(che.fields.cost_context.structure.monthlyConsumptionExpenditureCHF,5049);
assert.equal(che.fields.cost_context.structure.monthlyDisposableIncomeCHF,7186);
assert.equal(che.fields.cost_context.structure.averageHouseholdSize,2.07);
assert.equal(che.fields.cost_context.structure.singlePersonBudget,false);
assert.equal(che.fields.cost_context.structure.expatBudget,false);
assert.equal(che.fields.residence_visa.structure.employmentOverMonths,3);
assert.equal(che.fields.residence_visa.structure.communeRegistrationWithinDays,14);
assert.equal(che.fields.residence_visa.structure.registrationBeforeStartingWork,true);
assert.equal(che.fields.healthcare.structure.generalEnrollmentDeadlineMonths,3);
assert.equal(che.fields.healthcare.structure.crossBorderExceptions,true);
assert.equal(che.fields.safety_context.structure.scalarScoreForbidden,true);
console.log('PEX-D1E-FIX1 contract PASS');

const {chromium}=require('playwright');
const url='http://127.0.0.1:8000/atlas-exit/index.html';
const report={productHead:'a9ff48e53dff3bba3eb4d1311396c483fd87fd70',baseHead:'edcb964f27d7c05588fff6581684306946a25675',viewports:[],errors:[]};

async function openCountry(page,name,id,panelSelector){
  const dismiss=page.locator('[data-dismiss]');
  if(await dismiss.count())await dismiss.click().catch(()=>{});
  await page.locator('#countrySearch').fill(name);
  await page.waitForTimeout(140);
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
    await page.waitForFunction(()=>window.ATLAS_COUNTRY_EVIDENCE?.countries?.CHE?.integrationState==='published',null,{timeout:10000});
    assert.equal(await page.evaluate(()=>document.fonts.check('12px Manrope')),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    const z0=await page.locator('#zoomValue').textContent();
    await page.locator('#zoomIn').click();
    await page.waitForTimeout(100);
    const z1=await page.locator('#zoomValue').textContent();
    assert.notEqual(z0,z1);
    if(cfg.name==='mobile'){
      await page.locator('#mobileFilters').click();
      assert.equal(await page.locator('#mobileFilters').getAttribute('aria-expanded'),'true');
    }
    const runtime=await page.evaluate(()=>{
      const c=window.AtlasExplorer.getCountries().find(x=>x.id==='CHE');
      const s=window.ATLAS_COUNTRY_EVIDENCE.countries.CHE;
      return {tax:c.tax,taxLabel:c.taxLabel,scope:c.scope,year:c.taxYear,taxStore:window.ATLAS_TAX.CHE.tax,bootstrap:window.ATLAS_FISCAL_FINALIZE.countryEvidenceBootstrap,pitLayers:s.fields.pit.structure.layers,citFederal:s.fields.cit_business.structure.federalNetProfitRate,vat:[s.fields.consumption_tax.structure.standardRate,s.fields.consumption_tax.structure.reducedRate,s.fields.consumption_tax.structure.accommodationRate]};
    });
    assert.equal(runtime.tax,null);
    assert.equal(runtime.taxStore,null);
    assert.equal(runtime.taxLabel,'Fédéral + canton + commune');
    assert.equal(runtime.year,'AFC · vérifié 21.09.2026');
    assert.match(runtime.scope,/trois niveaux/i);
    assert.equal(runtime.bootstrap,'pex-d1e-1');
    assert.deepEqual(runtime.pitLayers,['federal','cantonal','communal']);
    assert.equal(runtime.citFederal,8.5);
    assert.deepEqual(runtime.vat,[8.1,2.6,3.8]);

    const panel=await openCountry(page,'Suisse','CHE','[data-atlas-switzerland-evidence][data-country="CHE"]');
    assert.equal(await panel.locator('[data-evidence-field]').count(),8);
    assert.equal(await panel.locator('a.detail-source').count(),12);
    assert.equal(await panel.locator('[data-source-count]').count(),3);
    const multiCounts=await panel.locator('[data-source-count]').evaluateAll(rows=>rows.map(x=>Number(x.getAttribute('data-source-count'))));
    assert.deepEqual(multiCounts,[3,2,2]);
    const panelStates=await panel.locator('[data-evidence-state]').evaluateAll(rows=>rows.map(x=>x.getAttribute('data-evidence-state')));
    assert.equal(panelStates.filter(x=>x==='READY_WITH_CAVEAT').length,0);
    assert.equal(panelStates.filter(x=>x==='READY_FOR_PRODUCT').length,8);
    const text=await panel.innerText();
    assert.match(text,/30 j\./);
    assert.match(text,/90 j\./);
    assert.match(text,/Fédéral \+ canton \+ commune/);
    assert.match(text,/8,5 % fédéral/);
    assert.match(text,/8,1 % standard/);
    assert.match(text,/2,6 % réduit/);
    assert.match(text,/3,8 % hébergement/);
    assert.match(text,/5 049 CHF/);
    assert.match(text,/7 186 CHF/);
    assert.match(text,/14 jours/);
    assert.match(text,/trois mois/i);
    assert.doesNotMatch(text,/Non documenté|À documenter/i);
    assert.equal(await page.locator('.tax-stack').evaluate(el=>el.hidden),true);
    assert.equal(await page.locator('.source-disclosure').evaluate(el=>el.hidden),true);
    const box=await page.locator('#inspector').boundingBox();
    assert.ok(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=cfg.width+1&&box.y+box.height<=cfg.height+1);
    await page.locator('[data-save="CHE"]').click();
    assert.equal(await page.locator('#savedCount').textContent(),'1');

    let p=await openCountry(page,'Japon','JPN','[data-atlas-japan-evidence][data-country="JPN"]');
    assert.equal(await p.locator('[data-evidence-field]').count(),8);
    assert.equal(await p.locator('a.detail-source').count(),13);
    await page.locator('[data-save="JPN"]').click();
    assert.equal(await page.locator('#savedCount').textContent(),'2');
    p=await openCountry(page,'Espagne','ESP','[data-atlas-spain-evidence][data-country="ESP"]');
    assert.equal(await p.locator('[data-evidence-field]').count(),8);
    assert.equal(await p.locator('a.detail-source').count(),9);
    p=await openCountry(page,'Australie','AUS','[data-atlas-australia-evidence][data-country="AUS"]');
    assert.equal(await p.locator('[data-evidence-field]').count(),8);
    assert.equal(await p.locator('a.detail-source').count(),11);
    p=await openCountry(page,'Thaïlande','THA','[data-atlas-evidence-panel][data-country="THA"]');
    assert.equal(await p.locator('[data-evidence-field]').count(),8);
    assert.equal(await p.locator('a.detail-source').count(),8);

    await page.locator('#openCompare').click();
    await page.locator('#compareDialog').waitFor({state:'visible'});
    await page.waitForTimeout(120);
    const compare=await page.locator('#compareTable').innerText();
    assert.match(compare,/Suisse/);
    assert.match(compare,/Fédéral \+ canton \+ commune/);
    assert.match(compare,/8,5 % fédéral/);
    assert.match(compare,/8,1 % standard/);
    assert.match(compare,/2,6 % réduit/);
    assert.match(compare,/3,8 % hébergement/);
    assert.ok(await page.locator('#compareTable [data-atlas-normalized="CHE"]').count()>=5);
    await page.locator('#compareDialog [data-close]').click();

    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
    await page.screenshot({path:`qa-artifacts/pex-d1e-fix1-${cfg.name}.png`,fullPage:false});
    const full=await page.screenshot({path:`qa-artifacts/pex-d1e-fix1-${cfg.name}-full.png`,fullPage:true});
    report.viewports.push({name:cfg.name,width:cfg.width,height:cfg.height,zoom:[z0,z1],runtime,fields:8,sourceLinks:12,multiSourceGroups:multiCounts,inspector:box,fullScreenshotBytes:full.length});
    report.errors.push(...errors.map(x=>`${cfg.name}: ${x}`));
    assert.deepEqual(errors,[]);
    await context.close();
  }
  await browser.close();
  fs.mkdirSync('qa-artifacts',{recursive:true});
  fs.writeFileSync('qa-artifacts/pex-d1e-fix1-report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
})().catch(err=>{console.error(err);process.exit(1)});
