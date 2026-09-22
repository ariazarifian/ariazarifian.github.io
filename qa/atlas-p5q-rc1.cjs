const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

const BASE='http://127.0.0.1:8000/atlas-exit/';
const PRODUCT_HEAD='f7be94781368b898e598d5363fd16986230fd9bd';
const report={productHead:PRODUCT_HEAD,viewports:[],errors:[]};
const ignored=/umami|ERR_FAILED|Failed to load resource|net::ERR_/i;

function watch(page,name,width){
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'&&!ignored.test(m.text()))errors.push('console: '+m.text())});
  return ()=>{
    report.errors.push(...errors.map(x=>`${name}-${width}: ${x}`));
    assert.deepEqual(errors,[],`${name}: browser errors`);
  };
}

async function common(page,name,width,height,assertNoErrors){
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>document.fonts.check('12px Manrope')),true,`${name}: Manrope`);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${name}: horizontal overflow`);
  assert.ok((await page.locator('h1').first().innerText()).trim().length>3,`${name}: h1`);
  const viewportPath=`qa-artifacts/${name}-${width}x${height}.png`;
  await page.screenshot({path:viewportPath,fullPage:false});
  assertNoErrors();
  return viewportPath;
}

async function explorer(context,cfg){
  const page=await context.newPage();
  const assertNoErrors=watch(page,'explorer',cfg.width);
  await page.goto(BASE+'index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.ATLAS_COUNTRY_EVIDENCE?.countries?.CHE?.integrationState==='published',{},{timeout:15000});
  const evidence=await page.evaluate(()=>{
    const e=window.ATLAS_COUNTRY_EVIDENCE;
    const ids=['THA','AUS','ESP','JPN','CHE'];
    return Object.fromEntries(ids.map(id=>[id,{ok:e.validateCountry(e.countries[id]).ok,fields:Object.keys(e.countries[id].fields).length,state:e.countries[id].integrationState}]));
  });
  for(const [id,x] of Object.entries(evidence)){assert.equal(x.ok,true,id);assert.equal(x.fields,8,id);assert.equal(x.state,'published',id);}
  await page.locator('#countrySearch').fill('Suisse');
  await page.waitForTimeout(120);
  assert.equal(await page.locator('[data-country="CHE"]').count(),1,'Switzerland visible');
  await page.locator('[data-country="CHE"]').click({force:true});
  await page.waitForSelector('[data-atlas-switzerland-evidence][data-country="CHE"]');
  const panel=page.locator('[data-atlas-switzerland-evidence][data-country="CHE"]');
  assert.equal(await panel.locator('[data-evidence-field]').count(),8,'CHE 8 normalized fields');
  assert.equal(await panel.locator('a.detail-source').count(),12,'CHE 12 normalized source links');
  const text=await panel.innerText();
  assert.match(text,/Fédéral \+ canton \+ commune/);
  assert.match(text,/8,1 % standard/);
  assert.doesNotMatch(text,/Non documenté|À documenter/i);
  const shot=await common(page,'explorer',cfg.width,cfg.height,assertNoErrors);
  report.viewports.push({surface:'Explorer',...cfg,evidence,normalizedFields:8,normalizedSourceLinks:12,shot});
  await page.close();
}

async function guide(context,cfg){
  const page=await context.newPage();
  const assertNoErrors=watch(page,'guide',cfg.width);
  await page.goto(BASE+'offres.html?countries=USA',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://atlas-expat.fr/offres.html');
  assert.equal(await page.locator('[data-atlas-event="guide_download_click"]').count(),2);
  assert.ok(await page.locator('[data-atlas-event="free_funnel_cta"][data-atlas-target="roadmap"]').count()>=2);
  assert.equal(await page.locator('.gq-cover').evaluate(img=>img.complete&&img.naturalWidth>0),true,'V15 cover loads');
  assert.match(await page.locator('body').innerText(),/25 pages/);
  const shot=await common(page,'guide',cfg.width,cfg.height,assertNoErrors);
  report.viewports.push({surface:'Guide',...cfg,shot});
  await page.close();
}

async function roadmap(context,cfg){
  const page=await context.newPage();
  const assertNoErrors=watch(page,'roadmap',cfg.width);
  await page.goto(BASE+'parcours-usa.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{localStorage.removeItem('atlas_usa_route_v3');localStorage.removeItem('atlas_usa_qep_v1');});
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://atlas-expat.fr/parcours-usa.html');
  assert.equal(await page.locator('[data-step]').count(),8);
  assert.equal((await page.locator('#doneCount').innerText()).trim(),'0');
  await page.locator('#profile').selectOption('business');
  await page.locator('#horizon').selectOption('6-12');
  await page.locator('#city').fill('New York');
  await page.locator('#priority').selectOption('business');
  await page.locator('#routeForm button[type="submit"]').click();
  await page.waitForTimeout(120);
  assert.equal(await page.locator('#routeSummary').evaluate(el=>el.hidden),false);
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('atlas_usa_route_v3')).answers.city),'New York');
  for(let i=0;i<3;i++)await page.locator('[data-step]').nth(i).check();
  assert.equal((await page.locator('#doneCount').innerText()).trim(),'3');
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal((await page.locator('#doneCount').innerText()).trim(),'3');
  assert.match(await page.locator('#resumeRoute').innerText(),/étape 4/);
  for(let i=3;i<8;i++)await page.locator('[data-step]').nth(i).check();
  assert.equal((await page.locator('#doneCount').innerText()).trim(),'8');
  assert.match(await page.locator('[data-card-step="identity"]').innerText(),/10 jours/);
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal((await page.locator('#doneCount').innerText()).trim(),'8');
  const shot=await common(page,'roadmap',cfg.width,cfg.height,assertNoErrors);
  report.viewports.push({surface:'Roadmap',...cfg,progress:'8/8',shot});
  await page.locator('#resetRoute').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('atlas_usa_route_v3')),null);
  assert.equal(await page.evaluate(()=>localStorage.getItem('atlas_usa_qep_v1')),null);
  await page.close();
}

async function accompagnement(context,cfg){
  const page=await context.newPage();
  const assertNoErrors=watch(page,'accompagnement',cfg.width);
  await page.goto(BASE+'accompagnement.html',{waitUntil:'domcontentloaded'});
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://atlas-expat.fr/accompagnement.html');
  assert.equal(await page.locator('script[src^="atlas-events.js"]').count(),1);
  assert.equal(await page.locator('[data-atlas-event="free_funnel_cta"][data-atlas-surface="accompagnement"]').count(),4);
  assert.equal(await page.locator('a[href="start.html"]').count(),0,'no active start handoff');
  assert.equal(await page.locator('#programmeContact').isDisabled(),true);
  assert.match(await page.locator('#programmeContact').innerText(),/Ouverture à venir/);
  assert.equal(await page.locator('.aq-program-button').count(),3);
  await page.locator('.aq-program-button').first().click();
  await page.waitForSelector('#programmeDialog[open]');
  assert.ok((await page.locator('#programmeTitle').innerText()).trim().length>0);
  await page.locator('#closeProgramme').click();
  await page.waitForTimeout(80);
  const shot=await common(page,'accompagnement',cfg.width,cfg.height,assertNoErrors);
  report.viewports.push({surface:'Accompagnement',...cfg,freeFunnelCtas:4,shot});
  await page.close();
}

(async()=>{
  const browser=await chromium.launch({headless:true});
  for(const cfg of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
    const context=await browser.newContext({viewport:{width:cfg.width,height:cfg.height}});
    await context.route(/cloud\.umami\.is|gateway\.umami\.is/,route=>route.abort());
    await explorer(context,cfg);
    await guide(context,cfg);
    await roadmap(context,cfg);
    await accompagnement(context,cfg);
    await context.close();
  }
  await browser.close();
  fs.writeFileSync('qa-artifacts/p5q-rc1-report.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
