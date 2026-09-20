import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('artifacts/p5ds3');
fs.mkdirSync(out,{recursive:true});
const base = 'http://127.0.0.1:4173/atlas-exit/index.html';
const evidence = { productCandidate:'0704223fdbd10b1a56f29accbe94b95e016d6dbc', checks:[], consoleErrors:[], pageErrors:[] };
const pass = (name, detail='') => evidence.checks.push({name,status:'PASS',detail});
const fail = (name, detail='') => { evidence.checks.push({name,status:'FAIL',detail}); throw new Error(`${name}: ${detail}`); };
const assert = (value,name,detail='') => value ? pass(name,detail) : fail(name,detail);
const waitReady = async page => {
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(() => {
    const e=document.querySelector('#resultCount');
    return e && !/Chargement/.test(e.textContent||'') && document.querySelectorAll('#results [data-country]').length>8;
  },null,{timeout:30000});
  await page.evaluate(()=>document.fonts.ready);
};
const bindDiagnostics = page => {
  page.on('pageerror',e=>evidence.pageErrors.push(String(e)));
  page.on('console',m=>{ if(m.type()==='error' && !/umami|ERR_BLOCKED_BY_CLIENT|Failed to load resource/i.test(m.text())) evidence.consoleErrors.push(m.text()); });
};
const noOverflow = async page => page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth,bw:document.body.scrollWidth}));

const browser = await chromium.launch({headless:true});
try {
  const desktop = await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  const requests=[];
  const page=await desktop.newPage(); bindDiagnostics(page); page.on('request',r=>requests.push(r.url()));
  await waitReady(page);

  const font = await page.evaluate(()=>({family:getComputedStyle(document.body).fontFamily,loaded:document.fonts.check('16px Manrope')}));
  assert(font.loaded && /Manrope/i.test(font.family),'Desktop self-hosted Manrope active',JSON.stringify(font));
  assert(requests.some(u=>/\/assets\/fonts\/Manrope-Variable\.ttf(?:\?|$)/.test(u) && u.startsWith('http://127.0.0.1:4173/')),'Desktop Manrope requested from same origin');
  assert(!requests.some(u=>/fonts\.(googleapis|gstatic)\.com/i.test(u)),'No Google Fonts request');

  const nav = await page.locator('.atlas-shell__nav a').allTextContents();
  assert(nav.length===4 && nav.join('|')==='Explorer|Guide USA|Roadmap|Accompagnement','Canonical four-destination shell',nav.join('|'));
  assert(await page.locator('.atlas-shell__nav a[aria-current="page"]').textContent()==='Explorer','Explorer marked current in shell');
  const hrefs = await page.locator('.atlas-shell__nav a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
  assert(JSON.stringify(hrefs)===JSON.stringify(['index.html','offres.html?countries=USA','parcours-usa.html','accompagnement.html']),'Core navigation href contract',JSON.stringify(hrefs));

  const ov=await noOverflow(page); assert(ov.sw<=ov.iw && ov.bw<=ov.iw,'Desktop no horizontal overflow',JSON.stringify(ov));
  const countryCount=await page.locator('#countries path').count(); assert(countryCount>80,'World map geometry loaded',String(countryCount));
  const bodyHeight=await page.evaluate(()=>({body:document.body.getBoundingClientRect().height,view:innerHeight,workspace:document.querySelector('.workspace').getBoundingClientRect().height,shell:document.querySelector('.atlas-shell--explorer').getBoundingClientRect().height}));
  assert(Math.abs(bodyHeight.body-bodyHeight.view)<2 && bodyHeight.workspace>800,'Explorer fills viewport below shared shell',JSON.stringify(bodyHeight));
  await page.screenshot({path:path.join(out,'desktop.png'),fullPage:true});

  const zoomBefore=await page.locator('#zoomValue').textContent();
  await page.locator('#zoomIn').click();
  await page.waitForTimeout(250);
  const zoomAfter=await page.locator('#zoomValue').textContent();
  assert(zoomAfter!==zoomBefore,'Map zoom control changes zoom state',`${zoomBefore} -> ${zoomAfter}`);
  await page.locator('#homeMap').click();

  const map=page.locator('#worldMap');
  const mb=await map.boundingBox();
  const tBefore=await page.locator('#mapTransform').getAttribute('transform');
  await page.mouse.move(mb.x+mb.width*.56,mb.y+mb.height*.55);
  await page.mouse.down();
  await page.mouse.move(mb.x+mb.width*.62,mb.y+mb.height*.60,{steps:8});
  await page.mouse.up();
  await page.waitForTimeout(220);
  const tAfter=await page.locator('#mapTransform').getAttribute('transform');
  const styleAfter=await page.locator('#mapTransform').getAttribute('style');
  assert(tAfter!==tBefore || !!styleAfter,'Map drag/pan interaction updates map transform',`${tBefore||''} -> ${tAfter||styleAfter||''}`);
  await page.locator('#homeMap').click();

  await page.locator('[data-region="Europe"]').click();
  assert(await page.locator('[data-region="Europe"]').getAttribute('aria-pressed')==='true','Region filter interaction');
  const europeCount=await page.locator('#results [data-country]').count(); assert(europeCount>3 && europeCount<80,'Region filter changes result set',String(europeCount));
  await page.locator('#resetFilters').click();

  await page.locator('#countrySearch').fill('Portugal');
  await page.waitForFunction(()=>[...document.querySelectorAll('#results [data-country]')].some(e=>/Portugal/.test(e.textContent||'')));
  const portugal=page.locator('#results [data-country="PRT"]');
  assert(await portugal.count()===1,'Search finds Portugal');
  await portugal.click();
  await page.waitForFunction(()=>{const e=document.querySelector('#inspector');return e && !e.hidden && /Portugal/.test(e.textContent||'')});
  assert(await page.locator('#inspector').isVisible(),'Country selection opens inspector');
  await page.screenshot({path:path.join(out,'desktop-portugal-inspector.png'),fullPage:true});

  await page.evaluate(()=>localStorage.setItem('atlas-exit-selection-v1',JSON.stringify(['PRT','CHE'])));
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(()=>document.querySelectorAll('#results [data-country]').length>8);
  assert(await page.locator('#savedCount').textContent()==='2','Saved selection restored into shared-shell comparator');
  assert(!(await page.locator('#openCompare').isDisabled()),'Comparator enabled for two saved destinations');
  await page.locator('#openCompare').click();
  await page.waitForFunction(()=>document.querySelector('#compareDialog')?.open===true);
  assert(await page.locator('#compareDialog').isVisible(),'Comparator dialog opens');
  await page.screenshot({path:path.join(out,'desktop-comparator.png'),fullPage:true});
  await page.locator('#compareDialog [data-close]').click();

  await page.evaluate(()=>localStorage.removeItem('atlas-exit-selection-v1'));
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForFunction(()=>document.querySelectorAll('#results [data-country]').length>8);
  await page.locator('[data-map-scope="usa"]').click();
  await page.waitForFunction(()=>{const e=document.querySelector('#federalSummary');return e && !e.hidden && /États/.test(document.querySelector('#resultCount')?.textContent||'')});
  assert(await page.locator('#federalSummary').isVisible(),'USA scope opens federal/state mode');
  const usCount=await page.locator('#results [data-country]').count(); assert(usCount>=50,'USA scope exposes state-level result set',String(usCount));
  await page.locator('[data-world-return]').click();
  await page.waitForFunction(()=>document.querySelector('#federalSummary')?.hidden===true);
  pass('USA scope returns to world mode');
  await desktop.close();

  const mobile = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
  const mp=await mobile.newPage(); bindDiagnostics(mp); await waitReady(mp);
  const mov=await noOverflow(mp); assert(mov.sw<=mov.iw && mov.bw<=mov.iw,'Mobile no horizontal overflow',JSON.stringify(mov));
  const mfont=await mp.evaluate(()=>({family:getComputedStyle(document.body).fontFamily,loaded:document.fonts.check('16px Manrope')}));
  assert(mfont.loaded && /Manrope/i.test(mfont.family),'Mobile Manrope active',JSON.stringify(mfont));
  const navBoxes=await mp.locator('.atlas-shell__nav a').evaluateAll(as=>as.map(a=>{const r=a.getBoundingClientRect();const cs=getComputedStyle(a);return {x:r.x,y:r.y,w:r.width,h:r.height,font:parseFloat(cs.fontSize)}}));
  assert(navBoxes.length===4 && navBoxes.every(b=>b.h>=41 && b.font>=13),'Mobile navigation readable and tappable',JSON.stringify(navBoxes));
  const rows=[...new Set(navBoxes.map(b=>Math.round(b.y)))]; assert(rows.length===2,'Mobile navigation uses intentional 2×2 layout',JSON.stringify(rows));
  await mp.screenshot({path:path.join(out,'mobile.png'),fullPage:true});

  const mobileFilters=mp.locator('#mobileFilters'); assert(await mobileFilters.isVisible(),'Mobile filters control visible');
  await mobileFilters.click();
  assert(await mobileFilters.getAttribute('aria-expanded')==='true','Mobile filters control expands sidebar');
  await mp.waitForTimeout(450);
  assert(await mp.locator('#sidebar').isVisible(),'Mobile filter sidebar visible after expansion');
  const sb=await mp.locator('#sidebar').boundingBox();
  assert(sb && sb.x>=-1 && sb.x+sb.width<=390.5,'Mobile filter sidebar settles fully inside viewport',JSON.stringify(sb));
  await mp.screenshot({path:path.join(out,'mobile-filters.png'),fullPage:true});
  await mp.locator('#countrySearch').fill('Portugal');
  await mp.waitForFunction(()=>!!document.querySelector('#results [data-country="PRT"]'));
  await mp.locator('#results [data-country="PRT"]').click();
  await mp.waitForFunction(()=>{const e=document.querySelector('#inspector');return e && !e.hidden && /Portugal/.test(e.textContent||'')});
  assert(await mp.locator('#inspector').isVisible(),'Mobile country inspector opens from filtered search');
  const ib=await mp.locator('#inspector').boundingBox(); assert(ib.x>=0 && ib.x+ib.width<=390.5,'Mobile inspector stays within viewport',JSON.stringify(ib));
  await mp.screenshot({path:path.join(out,'mobile-inspector.png'),fullPage:true});
  await mobile.close();

  const reduce = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const rp=await reduce.newPage(); await waitReady(rp);
  const motion=await rp.locator('.explorer-shell__compare').evaluate(el=>({td:getComputedStyle(el).transitionDuration,ad:getComputedStyle(el).animationDuration}));
  const seconds = value => value.trim().endsWith('ms') ? parseFloat(value)/1000 : parseFloat(value);
  assert(motion.td.split(',').every(v=>seconds(v)<=.001) && motion.ad.split(',').every(v=>seconds(v)<=.001),'Reduced-motion transition gate',JSON.stringify(motion));
  await reduce.close();

  assert(evidence.pageErrors.length===0,'No uncaught browser page errors',JSON.stringify(evidence.pageErrors));
  assert(evidence.consoleErrors.length===0,'No unexpected console errors',JSON.stringify(evidence.consoleErrors));
} catch (err) {
  evidence.failure=String(err?.stack||err);
  throw err;
} finally {
  fs.writeFileSync(path.join(out,'qa-evidence.json'),JSON.stringify(evidence,null,2));
  await browser.close();
}
