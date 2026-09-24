const { chromium } = require('playwright');
const fs = require('fs');
const GRAY='rgb(33, 48, 52)';
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
async function run(viewport,name){
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport});
  await page.goto('http://127.0.0.1:8000/atlas-exit/index.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.AtlasExplorer?.ready?.()===true);
  await page.waitForTimeout(250);
  const tax={};
  for(const id of ['CAN','CHE','PRT','GBR','ITA']){
    tax[id]=await page.$eval('#countries [data-id="'+id+'"]',e=>getComputedStyle(e).fill);
    assert(tax[id]!==GRAY,id+' grey in fiscal view');
  }
  let tooltip=null;
  if(name==='desktop'){
    await page.locator('#countries [data-id="CAN"]').hover();
    await page.waitForFunction(()=>!document.querySelector('#tooltip')?.hidden);
    tooltip=await page.evaluate(()=>{const t=document.querySelector('#tooltip'),r=t.getBoundingClientRect();return{clientWidth:t.clientWidth,scrollWidth:t.scrollWidth,right:r.right,metrics:[...t.querySelectorAll('.tip-metrics b')].map(e=>{const x=e.getBoundingClientRect();return{text:e.textContent,right:x.right}})}}); 
    assert(tooltip.scrollWidth<=tooltip.clientWidth+1,'tooltip overflow');
    assert(!tooltip.metrics.some(x=>x.right>tooltip.right+1),'tooltip metric outside card');
  }
  await page.click('[data-layer="conflict"]');
  await page.waitForFunction(()=>document.body.classList.contains('conflict-layer'));
  const before=await page.$eval('#countries [data-id="CAN"]',e=>getComputedStyle(e).fill);
  assert(before!==GRAY,'conflict missing before pointer move');
  await page.locator('#countries [data-id="CAN"]').hover();
  await page.mouse.move(viewport.width-5,viewport.height-5);
  await page.waitForTimeout(100);
  const after=await page.$eval('#countries [data-id="CAN"]',e=>getComputedStyle(e).fill);
  assert(after!==GRAY,'conflict reset after pointer move');
  await browser.close();
  return{name,viewport,tax,tooltip,conflict:{before,after}};
}
(async()=>{const results=[await run({width:1440,height:1000},'desktop'),await run({width:390,height:844},'mobile')];fs.mkdirSync('qa-artifacts',{recursive:true});fs.writeFileSync('qa-artifacts/explorer-hotfix.json',JSON.stringify({results,errors:[]},null,2));console.log(JSON.stringify({results,errors:[]},null,2))})().catch(e=>{console.error(e);process.exit(1)});