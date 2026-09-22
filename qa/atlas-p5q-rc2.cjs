const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

const BASE='http://127.0.0.1:8000/atlas-exit/';
const PRODUCT_HEAD='a749226db7eba39c2711ec34bec07624d8a8acc9';
const report={productHead:PRODUCT_HEAD,viewports:[],errors:[]};
const ignored=/umami|ERR_FAILED|Failed to load resource|net::ERR_/i;

function watch(page,name,width){
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'&&!ignored.test(m.text()))errors.push('console: '+m.text())});
  return ()=>{report.errors.push(...errors.map(x=>`${name}-${width}: ${x}`));assert.deepEqual(errors,[],`${name}: browser errors`);};
}
async function common(page,name,width,height,assertNoErrors){
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>document.fonts.check('12px Manrope')),true,`${name}: Manrope`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${name}: horizontal overflow`);
  assert.ok((await page.locator('h1').first().innerText()).trim().length>3,`${name}: h1`);
  const shot=`qa-artifacts/${name}-${width}x${height}.png`;
  await page.screenshot({path:shot,fullPage:false});
  assertNoErrors();
  return shot;
}
async function openCountry(page,name,id,panelSelector){
  const dismiss=page.locator('[data-dismiss]');if(await dismiss.count())await dismiss.click().catch(()=>{});
  await page.locator('#countrySearch').fill(name);await page.waitForTimeout(160);
  const row=page.locator(`[data-country="${id}"]`).first();await row.waitFor({state:'attached'});await row.evaluate(el=>el.click());
  await page.waitForSelector(panelSelector);return page.locator(panelSelector);
}
async function explorer(context,cfg){
  const page=await context.newPage(),assertNoErrors=watch(page,'explorer',cfg.width);
  await page.goto(BASE+'index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ATLAS_COUNTRY_EVIDENCE?.countries?.SGP?.integrationState==='published',{},{timeout:15000});
  const evidence=await page.evaluate(()=>{const e=window.ATLAS_COUNTRY_EVIDENCE;const ids=['THA','AUS','ESP','JPN','CHE','SGP'];return Object.fromEntries(ids.map(id=>[id,{ok:e.validateCountry(e.countries[id]).ok,fields:Object.keys(e.countries[id].fields).length,state:e.countries[id].integrationState,states:Object.values(e.countries[id].fields).map(x=>x.state)}]));});
  for(const [id,x] of Object.entries(evidence)){assert.equal(x.ok,true,id);assert.equal(x.fields,8,id);assert.equal(x.state,'published',id);}
  assert.equal(evidence.SGP.states.filter(x=>x==='READY_FOR_PRODUCT').length,8,'SGP 8 READY_FOR_PRODUCT');
  let panel=await openCountry(page,'Singapour','SGP','[data-atlas-singapore-evidence][data-country="SGP"]');
  assert.equal(await panel.locator('[data-evidence-field]').count(),8,'SGP 8 normalized fields');
  assert.equal(await panel.locator('a.detail-source').count(),10,'SGP 10 normalized source links');
  const multi=await panel.locator('[data-source-count]').evaluateAll(rows=>rows.map(x=>Number(x.getAttribute('data-source-count'))));
  assert.deepEqual(multi,[2,2],'SGP ordered multi-source groups');
  const sgStates=await panel.locator('[data-evidence-state]').evaluateAll(rows=>rows.map(x=>x.getAttribute('data-evidence-state')));
  assert.equal(sgStates.filter(x=>x==='READY_FOR_PRODUCT').length,8,'SGP panel states');
  const sgText=await panel.innerText();
  for(const re of [/183 jours/i,/24 %/,/17 %/,/GST 9 %/,/5 931 SGD/,/5 600 SGD/,/COMPASS/,/MediShield Life/])assert.match(sgText,re);
  assert.doesNotMatch(sgText,/Non documenté|À documenter/i);
  const runtime=await page.evaluate(()=>{const c=window.AtlasExplorer.getCountries().find(x=>x.id==='SGP'),commerce=window.ATLAS_COMMERCE?.countries?.SGP||{},s=window.ATLAS_COUNTRY_EVIDENCE.countries.SGP;return{tax:c.tax,taxLabel:c.taxLabel,cit:commerce.cit,vat:commerce.vat,bootstrap:window.ATLAS_FISCAL_FINALIZE?.countryEvidenceBootstrap,dayTest:s.fields.tax_residency.structure.generalDayTest};});
  assert.equal(runtime.tax,24);assert.equal(runtime.taxLabel,'Jusqu’à 24 % résident');assert.equal(runtime.cit,'17 % statutaire');assert.equal(runtime.vat,'9 % standard');assert.equal(runtime.bootstrap,'pex-d1f-1');assert.equal(runtime.dayTest,183);
  panel=await openCountry(page,'Suisse','CHE','[data-atlas-switzerland-evidence][data-country="CHE"]');assert.equal(await panel.locator('[data-evidence-field]').count(),8);assert.equal(await panel.locator('a.detail-source').count(),12);
  panel=await openCountry(page,'Japon','JPN','[data-atlas-japan-evidence][data-country="JPN"]');assert.equal(await panel.locator('[data-evidence-field]').count(),8);assert.equal(await panel.locator('a.detail-source').count(),13);
  panel=await openCountry(page,'Espagne','ESP','[data-atlas-spain-evidence][data-country="ESP"]');assert.equal(await panel.locator('[data-evidence-field]').count(),8);assert.equal(await panel.locator('a.detail-source').count(),9);
  panel=await openCountry(page,'Australie','AUS','[data-atlas-australia-evidence][data-country="AUS"]');assert.equal(await panel.locator('[data-evidence-field]').count(),8);assert.equal(await panel.locator('a.detail-source').count(),11);
  panel=await openCountry(page,'Thaïlande','THA','[data-atlas-evidence-panel][data-country="THA"]');assert.equal(await panel.locator('[data-evidence-field]').count(),8);assert.equal(await panel.locator('a.detail-source').count(),8);
  await page.locator('#countrySearch').fill('Singapour');await page.waitForTimeout(120);await page.locator('[data-country="SGP"]').first().evaluate(el=>el.click());await page.waitForSelector('[data-save="SGP"]');await page.locator('[data-save="SGP"]').click();
  await page.locator('#openCompare').click();await page.locator('#compareDialog').waitFor({state:'visible'});await page.waitForTimeout(120);const compare=await page.locator('#compareTable').innerText();assert.match(compare,/Singapour/);assert.match(compare,/24 % résident/);assert.match(compare,/17 % statutaire/);assert.match(compare,/GST 9 % standard/);assert.ok(await page.locator('#compareTable [data-atlas-normalized="SGP"]').count()>=5);await page.locator('#compareDialog [data-close]').click();
  const shot=await common(page,'explorer',cfg.width,cfg.height,assertNoErrors);report.viewports.push({surface:'Explorer',...cfg,evidence,sgp:{fields:8,sourceLinks:10,multiSourceGroups:multi,states:'8 READY_FOR_PRODUCT',runtime},shot});await page.close();
}
async function guide(context,cfg){
  const page=await context.newPage(),assertNoErrors=watch(page,'guide',cfg.width);await page.goto(BASE+'offres.html?countries=USA',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://atlas-expat.fr/offres.html');assert.equal(await page.locator('[data-atlas-event="guide_download_click"]').count(),2);assert.ok(await page.locator('[data-atlas-event="free_funnel_cta"][data-atlas-target="roadmap"]').count()>=2);assert.equal(await page.locator('.gq-cover').evaluate(img=>img.complete&&img.naturalWidth>0),true);assert.match(await page.locator('body').innerText(),/25 pages/);
  const shot=await common(page,'guide',cfg.width,cfg.height,assertNoErrors);report.viewports.push({surface:'Guide',...cfg,shot});await page.close();
}
async function roadmap(context,cfg){
  const page=await context.newPage(),assertNoErrors=watch(page,'roadmap',cfg.width);await page.goto(BASE+'parcours-usa.html',{waitUntil:'domcontentloaded'});await page.evaluate(()=>{localStorage.removeItem('atlas_usa_route_v3');localStorage.removeItem('atlas_usa_qep_v1');});await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://atlas-expat.fr/parcours-usa.html');assert.equal(await page.locator('[data-step]').count(),8);assert.equal((await page.locator('#doneCount').innerText()).trim(),'0');await page.locator('#profile').selectOption('business');await page.locator('#horizon').selectOption('6-12');await page.locator('#city').fill('New York');await page.locator('#priority').selectOption('business');await page.locator('#routeForm button[type="submit"]').click();await page.waitForTimeout(100);for(let i=0;i<3;i++)await page.locator('[data-step]').nth(i).check();await page.reload({waitUntil:'domcontentloaded'});assert.equal((await page.locator('#doneCount').innerText()).trim(),'3');assert.match(await page.locator('#resumeRoute').innerText(),/étape 4/);for(let i=3;i<8;i++)await page.locator('[data-step]').nth(i).check();assert.equal((await page.locator('#doneCount').innerText()).trim(),'8');assert.match(await page.locator('[data-card-step="identity"]').innerText(),/10 jours/);await page.reload({waitUntil:'domcontentloaded'});assert.equal((await page.locator('#doneCount').innerText()).trim(),'8');const shot=await common(page,'roadmap',cfg.width,cfg.height,assertNoErrors);report.viewports.push({surface:'Roadmap',...cfg,progress:'8/8',shot});await page.locator('#resetRoute').click();assert.equal(await page.evaluate(()=>localStorage.getItem('atlas_usa_route_v3')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('atlas_usa_qep_v1')),null);await page.close();
}
async function accompagnement(context,cfg){
  const page=await context.newPage(),assertNoErrors=watch(page,'accompagnement',cfg.width);await page.goto(BASE+'accompagnement.html',{waitUntil:'domcontentloaded'});assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://atlas-expat.fr/accompagnement.html');assert.equal(await page.locator('script[src^="atlas-events.js"]').count(),1);assert.equal(await page.locator('[data-atlas-event="free_funnel_cta"][data-atlas-surface="accompagnement"]').count(),4);assert.equal(await page.locator('a[href="start.html"]').count(),0);assert.equal(await page.locator('#programmeContact').isDisabled(),true);assert.match(await page.locator('#programmeContact').innerText(),/Ouverture à venir/);assert.equal(await page.locator('.aq-program-button').count(),3);await page.locator('.aq-program-button').first().click();await page.waitForSelector('#programmeDialog[open]');await page.locator('#closeProgramme').click();await page.waitForTimeout(80);const shot=await common(page,'accompagnement',cfg.width,cfg.height,assertNoErrors);report.viewports.push({surface:'Accompagnement',...cfg,freeFunnelCtas:4,shot});await page.close();
}
(async()=>{const browser=await chromium.launch({headless:true});for(const cfg of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){const context=await browser.newContext({viewport:{width:cfg.width,height:cfg.height}});await context.route(/cloud\.umami\.is|gateway\.umami\.is/,route=>route.abort());await explorer(context,cfg);await guide(context,cfg);await roadmap(context,cfg);await accompagnement(context,cfg);await context.close();}await browser.close();fs.writeFileSync('qa-artifacts/p5q-rc2-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));})().catch(e=>{console.error(e);process.exit(1)});
