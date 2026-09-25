const { chromium } = require('playwright');
const fs = require('fs');

const BASE=process.env.ATLAS_BASE||'http://127.0.0.1:8000/atlas-exit/index.html';
const GRAY='rgb(33, 48, 52)';
const NONSCALAR='rgb(111, 147, 140)';
const CF_IDS=['AUT','DNK','FIN','IRL','NOR','BEL','CZE','GRC','LUX','POL','NLD','SWE','NZL','ITA','HRV','EST','LVA','SVK','SVN','BGR','CYP','MLT','GEO','ISL','HUN'];
const LEGACY_FISCAL=['CAN','CHE','PRT','GBR','DEU','ITA'];
const CONFLICT_IDS=['CAN','JPN','THA'];
const FUTURE_FISCAL=['OMN'];
const CURRENT_NONSCALE_KINDS=new Set(['country-factory','current-reference','secondary-current-reference']);
const NONCURRENT_KINDS=new Set(['future','context','historical']);
const CONFLICT_RGB={
  'Faible':'rgb(95, 141, 118)',
  'Modéré':'rgb(168, 132, 85)',
  'Élevé':'rgb(154, 96, 74)',
  'Critique':'rgb(129, 67, 84)',
  'undocumented':GRAY
};

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function forceExplore(page){
  await page.evaluate(()=>{
    if(document.body.classList.contains('conflict-layer'))document.querySelector('[data-layer="tax"]')?.click();
  });
  await page.waitForFunction(()=>!document.body.classList.contains('conflict-layer'));
  await page.evaluate(()=>{
    const x=window.AtlasExplorer;
    if(!x)throw new Error('AtlasExplorer unavailable');
    x.state.layer='explore';
    x.resetFilters();
  });
  await page.waitForFunction(()=>window.AtlasExplorer?.state?.layer==='explore'&&!document.body.classList.contains('atlas-tax-layer')&&!document.body.classList.contains('conflict-layer'));
  await page.waitForTimeout(100);
}

async function run(viewport,name){
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport});
  const errors=[];
  const consoleErrors=[];
  const sameOriginNetworkErrors=[];
  const checks=[];
  const check=(ok,msg,detail)=>{checks.push({ok:!!ok,msg,detail:detail??null});if(!ok)errors.push(msg+(detail?': '+JSON.stringify(detail):''));};

  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
  page.on('requestfailed',r=>{
    try{if(new URL(r.url()).origin===new URL(BASE).origin)sameOriginNetworkErrors.push({url:r.url(),failure:r.failure()?.errorText||'failed'})}catch{}
  });
  page.on('response',r=>{
    try{if(new URL(r.url()).origin===new URL(BASE).origin&&r.status()>=400)sameOriginNetworkErrors.push({url:r.url(),status:r.status()})}catch{}
  });

  try{
    await page.goto(BASE,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.AtlasExplorer?.ready?.()===true);
    await page.waitForFunction(()=>window.ATLAS_COUNTRY_FACTORY?.recordCount>=25);
    await page.waitForTimeout(250);

    await forceExplore(page);
    await page.waitForTimeout(700);
    const k0=await page.evaluate(()=>window.AtlasExplorer.state.k);
    await page.click('#zoomIn');
    await page.waitForTimeout(320);
    const k1=await page.evaluate(()=>window.AtlasExplorer.state.k);
    check(k1>k0,'zoom control increases map scale',{k0,k1});
    await page.click('#homeMap');
    await page.waitForTimeout(700);
    const baselineExplore=await page.evaluate(ids=>Object.fromEntries(ids.map(id=>[id,getComputedStyle(document.querySelector('#countries [data-id="'+id+'"]')).fill])),['CAN','CHE','AUT']);

    await page.click('[data-layer="tax"]');
    await page.waitForFunction(()=>window.AtlasExplorer?.state?.layer==='tax');
    await page.waitForTimeout(100);
    check(await page.evaluate(()=>document.body.classList.contains('atlas-tax-layer')),'tax visual scope is on in Fiscality');

    const tax=await page.evaluate(ids=>{
      const countries=new Map(window.AtlasExplorer.getCountries().map(c=>[c.id,c]));
      return Object.fromEntries(ids.map(id=>{
        const c=countries.get(id),el=document.querySelector('#countries [data-id="'+id+'"]');
        return [id,{fill:el?getComputedStyle(el).fill:null,tax:c?.tax??null,taxKind:c?.taxKind??null,taxVisual:el?.dataset.taxVisual??null}];
      }));
    },[...new Set([...LEGACY_FISCAL,...CF_IDS,...FUTURE_FISCAL])]);

    for(const id of LEGACY_FISCAL){
      check(!!tax[id]?.fill,id+' fiscal path exists',tax[id]);
      check(tax[id]?.fill!==GRAY,id+' documented fiscal state is not missing-grey',tax[id]);
      if(tax[id]?.tax==null)check(tax[id]?.taxVisual==='documented-nonscalar',id+' null-tax is semantically documented-nonscalar',tax[id]);
    }
    for(const id of CF_IDS){
      check(tax[id]?.fill===NONSCALAR,id+' Country Factory null-tax uses semantic non-scalar colour',tax[id]);
      check(tax[id]?.taxVisual==='documented-nonscalar',id+' Country Factory path exposes documented-nonscalar state',tax[id]);
    }
    for(const id of FUTURE_FISCAL){
      check(tax[id]?.fill===GRAY,id+' future-only fiscal record remains missing-grey',tax[id]);
      check(!tax[id]?.taxVisual||tax[id]?.taxVisual==='missing',id+' future-only fiscal record is not mislabeled documented',tax[id]);
    }

    const dynamicDocumented=await page.evaluate(({acceptedKinds,noncurrentKinds})=>{
      const accepted=new Set(acceptedKinds),noncurrent=new Set(noncurrentKinds);
      const evidence=window.ATLAS_COUNTRY_EVIDENCE?.countries||{};
      return window.AtlasExplorer.getCountries().filter(c=>{
        if(c.parent||!document.querySelector('#countries [data-id="'+c.id+'"]')||Number.isFinite(c.tax))return false;
        const kind=String(c.taxKind||'').toLowerCase();
        if(noncurrent.has(kind))return false;
        if(accepted.has(kind))return true;
        const pit=evidence[c.id]?.fields?.pit;
        return /^(?:READY|WATCH)(?:_|$)/.test(String(pit?.state||''));
      }).map(c=>c.id).sort();
    },{acceptedKinds:[...CURRENT_NONSCALE_KINDS],noncurrentKinds:[...NONCURRENT_KINDS]});
    check(dynamicDocumented.length>=CF_IDS.length,'dynamic documented non-scalar fiscal set is populated',dynamicDocumented);
    for(const id of dynamicDocumented){
      const v=await page.$eval('#countries [data-id="'+id+'"]',e=>({fill:getComputedStyle(e).fill,taxVisual:e.dataset.taxVisual||null}));
      check(v.fill===NONSCALAR,id+' dynamic documented non-scalar uses semantic colour',v);
      check(v.taxVisual==='documented-nonscalar',id+' dynamic documented non-scalar exposes semantic state',v);
    }

    await page.waitForFunction(()=>Array.isArray(window.ATLAS_FISCAL_AUDIT?.missingPit));
    const missing=await page.evaluate(()=>(
      (window.ATLAS_FISCAL_AUDIT?.missingPit||[])
        .filter(id=>document.querySelector('#countries [data-id="'+id+'"]'))
        .slice(0,4)
    ));
    check(missing.length>=1,'dynamic genuinely-undocumented fiscal controls found',missing);
    for(const id of missing){
      const v=await page.$eval('#countries [data-id="'+id+'"]',e=>({fill:getComputedStyle(e).fill,taxVisual:e.dataset.taxVisual||null}));
      check(v.fill===GRAY,id+' genuinely-undocumented remains grey',v);
      check(!v.taxVisual||v.taxVisual==='missing',id+' genuinely-undocumented is not mislabeled documented',v);
    }

    await page.click('[data-layer="stability"]');
    await page.waitForFunction(()=>window.AtlasExplorer?.state?.layer==='stability');
    const stability=await page.evaluate(ids=>({
      taxClass:document.body.classList.contains('atlas-tax-layer'),
      fills:Object.fromEntries(ids.map(id=>[id,getComputedStyle(document.querySelector('#countries [data-id="'+id+'"]')).fill]))
    }),['CAN','CHE','AUT']);
    check(!stability.taxClass,'tax visual scope is off in Stability',stability);
    check(!Object.values(stability.fills).includes(NONSCALAR),'non-scalar fiscal fill does not contaminate Stability',stability);

    await forceExplore(page);
    const exploreAfter=await page.evaluate(ids=>({
      taxClass:document.body.classList.contains('atlas-tax-layer'),
      fills:Object.fromEntries(ids.map(id=>[id,getComputedStyle(document.querySelector('#countries [data-id="'+id+'"]')).fill]))
    }),['CAN','CHE','AUT']);
    check(!exploreAfter.taxClass,'tax visual scope is off in Explore',exploreAfter);
    check(JSON.stringify(exploreAfter.fills)===JSON.stringify(baselineExplore),'Explore colours restore exactly after tax/stability switches',{before:baselineExplore,after:exploreAfter.fills});

    let tooltip=null;
    if(name==='desktop'){
      await page.locator('#countries [data-id="CAN"]').hover();
      await page.waitForFunction(()=>!document.querySelector('#tooltip')?.hidden);
      tooltip=await page.evaluate(()=>{
        const t=document.querySelector('#tooltip'),r=t.getBoundingClientRect();
        const nodes=[...t.querySelectorAll('.tip-metrics b')].map(e=>{const x=e.getBoundingClientRect();return{text:e.textContent,left:x.left,right:x.right,width:x.width}});
        return{clientWidth:t.clientWidth,scrollWidth:t.scrollWidth,left:r.left,right:r.right,width:r.width,metrics:nodes};
      });
      check(tooltip.scrollWidth<=tooltip.clientWidth+1,'Canada tooltip has no horizontal overflow',tooltip);
      check(!tooltip.metrics.some(x=>x.left<tooltip.left-1||x.right>tooltip.right+1),'Canada tooltip metric values stay inside card',tooltip);
    }

    await page.click('[data-layer="conflict"]');
    await page.waitForFunction(()=>document.body.classList.contains('conflict-layer'));
    const conflict={};
    for(const id of CONFLICT_IDS){
      const loc=page.locator('#countries [data-id="'+id+'"]');
      const before=await loc.evaluate(e=>({category:e.dataset.conflict,fill:getComputedStyle(e).fill}));
      const expected=CONFLICT_RGB[before.category];
      check(!!expected,id+' Conflict category is recognized',before);
      check(before.fill===expected,id+' Conflict categorical fill is exact before pointer activity',{...before,expected});

      await loc.hover({force:true});
      const hover=await loc.evaluate(e=>getComputedStyle(e).fill);
      check(hover===expected,id+' Conflict fill survives hover',{hover,expected});

      const box=await loc.boundingBox();
      if(box){
        const x=Math.max(2,Math.min(viewport.width-2,box.x+box.width/2));
        const y=Math.max(2,Math.min(viewport.height-2,box.y+box.height/2));
        await page.mouse.move(x,y);
        await page.mouse.down();
        await page.mouse.move(Math.max(2,Math.min(viewport.width-2,x+24)),Math.max(2,Math.min(viewport.height-2,y+16)),{steps:4});
        await page.mouse.up();
      }
      const drag=await loc.evaluate(e=>getComputedStyle(e).fill);
      check(drag===expected,id+' Conflict fill survives pointerdown/drag',{drag,expected});

      await page.mouse.move(viewport.width-3,viewport.height-3);
      await page.waitForTimeout(60);
      const leave=await loc.evaluate(e=>getComputedStyle(e).fill);
      check(leave===expected,id+' Conflict fill survives pointermove/pointerleave',{leave,expected});
      conflict[id]={category:before.category,expected,before:before.fill,hover,drag,leave};
    }

    await forceExplore(page);
    if(name==='mobile'&&!await page.locator('#countrySearch').isVisible()){
      await page.click('#mobileFilters');
      await page.waitForTimeout(80);
    }

    await page.fill('#countrySearch','Canada');
    await page.waitForTimeout(80);
    check(await page.locator('[data-country="CAN"]').count()===1,'search finds Canada');
    await page.click('[data-country="CAN"]');
    await page.waitForFunction(()=>window.AtlasExplorer?.state?.selected==='CAN');
    check(await page.locator('#inspector').isVisible(),'selection opens visible inspector');

    await page.click('[data-save="CAN"]');
    check((await page.evaluate(()=>window.AtlasExplorer.state.saved.includes('CAN')))===true,'save adds Canada');

    if(name==='mobile'&&!await page.locator('#countrySearch').isVisible()){
      await page.click('#mobileFilters');
      await page.waitForTimeout(80);
    }
    await page.fill('#countrySearch','Suisse');
    await page.waitForTimeout(80);
    await page.click('[data-country="CHE"]');
    await page.waitForFunction(()=>window.AtlasExplorer?.state?.selected==='CHE');
    await page.click('[data-save="CHE"]');
    check((await page.evaluate(()=>window.AtlasExplorer.state.saved.includes('CHE')))===true,'save adds Switzerland');
    check(!(await page.locator('#openCompare').isDisabled()),'comparator becomes available');
    await page.click('#openCompare');
    check(await page.locator('#compareDialog').evaluate(e=>e.open),'comparator dialog opens');
    check((await page.locator('#compareTable table').count())===1,'comparator table renders');
    await page.locator('#compareDialog [data-close],#compareDialog button[aria-label*="Fermer"]').first().click().catch(()=>page.evaluate(()=>document.querySelector('#compareDialog')?.close()));

    await page.evaluate(()=>window.AtlasExplorer.resetFilters());
    await page.waitForTimeout(100);
    await page.evaluate(()=>window.AtlasExplorer.selectCountry('AUT'));
    await page.waitForTimeout(150);
    const disclosure=page.locator('[data-atlas-country-factory-evidence][data-country="AUT"]');
    check(await disclosure.count()===1,'Country Factory progressive disclosure is present');
    if(await disclosure.count()){
      await disclosure.evaluate(e=>e.open=true);
      const sourceDetail=disclosure.locator('.atlas-evidence__source').first();
      if(await sourceDetail.count())await sourceDetail.evaluate(e=>e.open=true);
      check((await disclosure.locator('a[href^="https://"]').count())>=1,'Country Factory source link is accessible');
    }

    const layout=await page.evaluate(()=>{
      const root=document.documentElement,inspector=document.querySelector('#inspector');
      return{
        page:{clientWidth:root.clientWidth,scrollWidth:root.scrollWidth},
        inspector:inspector&&!inspector.hidden?{clientWidth:inspector.clientWidth,scrollWidth:inspector.scrollWidth}:null
      };
    });
    check(layout.page.scrollWidth<=layout.page.clientWidth+1,'page has no horizontal overflow',layout.page);
    if(layout.inspector)check(layout.inspector.scrollWidth<=layout.inspector.clientWidth+1,'inspector has no horizontal overflow',layout.inspector);

    check(consoleErrors.length===0,'zero Product console errors',consoleErrors);
    check(sameOriginNetworkErrors.length===0,'zero same-origin network errors',sameOriginNetworkErrors);

    fs.mkdirSync('qa-artifacts',{recursive:true});
    await page.screenshot({path:'qa-artifacts/explorer-hotfix-'+name+'.png',fullPage:true});
    await browser.close();
    return{name,viewport,tax,missing,stability,exploreAfter,tooltip,conflict,layout,consoleErrors,sameOriginNetworkErrors,checks,errors};
  }catch(e){
    errors.push('HARNESS_EXCEPTION: '+(e?.stack||String(e)));
    fs.mkdirSync('qa-artifacts',{recursive:true});
    try{await page.screenshot({path:'qa-artifacts/explorer-hotfix-'+name+'-exception.png',fullPage:true})}catch{}
    await browser.close().catch(()=>{});
    return{name,viewport,checks,consoleErrors,sameOriginNetworkErrors,errors};
  }
}

(async()=>{
  fs.mkdirSync('qa-artifacts',{recursive:true});
  const results=[
    await run({width:1440,height:1000},'desktop'),
    await run({width:390,height:844},'mobile')
  ];
  const errors=results.flatMap(r=>r.errors.map(e=>r.name+': '+e));
  const report={base:BASE,results,errors};
  fs.writeFileSync('qa-artifacts/explorer-hotfix.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
