/* Small progressive-tax explainer. Local computation only: no data collection. */
(()=>{'use strict';
const meta=window.ATLAS_FISCAL_UPDATE;if(!meta)return;
const E=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const N=(v,d=0)=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:0}).format(v);
const money=(v,c)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:c,maximumFractionDigits:2}).format(v);
function calculate(key,value){
 const s=meta.schedules[key];if(!s)throw new RangeError('Unknown tax schedule');
 const x=typeof value==='number'?value:Number(String(value).replace(',','.'));
 if(value===''||value===null||!Number.isFinite(x)||x<0||x>100000000)throw new RangeError('Income must be between 0 and 100,000,000');
 let lower=0,total=0,marginal=0;const parts=[];
 for(const[upper,rate]of s.brackets){const cap=upper===null?Infinity:upper,base=Math.max(0,Math.min(x,cap)-lower);total+=base*rate/100;parts.push({lower,upper,rate,base,tax:base*rate/100});if(x>lower)marginal=rate;lower=cap;}
 return{income:x,tax:Math.round(total*100)/100,average:x?total/x*100:0,marginal,parts};
}
function keys(c){if(c.id==='FRA')return['FRA','FRA_IS'];if(c.id==='USA'||c.parent)return['USA'];if(c.id==='SGP')return['SGP'];return[];}
function render(c){const list=keys(c);if(!list.length)return'';const s=meta.schedules[list[0]];return `<details class="tax-gauge" data-tax-gauge><summary><span>Comprendre le barème</span><span class="gauge-tag">Interactif</span></summary><div class="gauge-inner"><label class="gauge-mode-label" for="gaugeMode">Calcul expliqué</label><select id="gaugeMode" aria-label="Choisir le barème">${list.map(k=>`<option value="${k}">${E(meta.schedules[k].title)}</option>`).join('')}</select><p class="gauge-period"></p><label for="taxAmount" class="gauge-label"></label><div class="amount-field"><input id="taxAmount" inputmode="decimal" type="number" min="0" max="100000000" step="0.01" value="${s.initial}" aria-describedby="gaugeNote gaugeError"><span class="gauge-currency"></span></div><input type="range" class="range gauge-range" aria-label="Faire varier la base imposable" min="0" max="${s.sliderMax}" step="${s.step}" value="${s.initial}"><div class="range-label"><span>0</span><span class="gauge-max"></span></div><p id="gaugeError" role="alert" hidden>Entrez un montant entre 0 et 100 millions, dans la devise indiquée.</p><div class="gauge-results" aria-live="polite" aria-atomic="true"></div><div class="bracket-strip" aria-label="Tranches du barème, de gauche à droite"></div><p class="gauge-reading">Chaque taux s’applique seulement à sa tranche, pas à tout le montant.</p><details class="bracket-breakdown"><summary>Voir le calcul par tranche</summary><table><thead><tr><th>Tranche</th><th>Taux</th><th>Impôt</th></tr></thead><tbody></tbody></table></details><p id="gaugeNote" class="micro"></p><a class="detail-source gauge-source" target="_blank" rel="noopener noreferrer">Source du barème ↗</a></div></details>`;}
function bind(root){const host=root.querySelector('[data-tax-gauge]');if(!host)return;
 const select=host.querySelector('#gaugeMode'),input=host.querySelector('#taxAmount'),range=host.querySelector('.gauge-range'),out=host.querySelector('.gauge-results'),error=host.querySelector('#gaugeError');
 let current=select.value;
 function paint(){const s=meta.schedules[current];let r;try{r=calculate(current,input.value)}catch{error.hidden=false;input.setAttribute('aria-invalid','true');out.innerHTML='<p>Montant à corriger.</p>';host.querySelector('.bracket-strip').innerHTML='';host.querySelector('tbody').innerHTML='';return;}
 error.hidden=true;input.removeAttribute('aria-invalid');range.value=Math.min(r.income,s.sliderMax);range.setAttribute('aria-valuetext',money(r.income,s.currency));
 out.innerHTML=`<div class="gauge-total"><span>Impôt brut estimé</span><strong>${money(r.tax,s.currency)}</strong></div><div><span>Taux moyen</span><b>${N(r.average,2)} %</b></div><div><span>Dernière tranche atteinte</span><b>${N(r.marginal,2)} %</b></div>`;
 host.querySelector('.bracket-strip').innerHTML=r.parts.map(p=>`<span class="bracket-segment ${p.base>0?'reached':''}" title="${p.upper===null?'Au-delà de '+N(p.lower):N(p.lower)+' à '+N(p.upper)} : ${N(p.rate)} %">${N(p.rate)}<small>%</small></span>`).join('');
 host.querySelector('tbody').innerHTML=r.parts.map(p=>`<tr class="${p.base?'used':''}"><td>${p.upper===null?'&gt; '+N(p.lower):N(p.lower)+'–'+N(p.upper)}</td><td>${N(p.rate,2)} %</td><td>${money(p.tax,s.currency)}</td></tr>`).join('');
 }
 function configure(){current=select.value;const s=meta.schedules[current];input.value=s.initial;range.max=s.sliderMax;range.step=s.step;range.value=s.initial;host.querySelector('.gauge-period').textContent=s.period;host.querySelector('.gauge-label').textContent=s.input;host.querySelector('.gauge-currency').textContent=s.currency;host.querySelector('.gauge-max').textContent=N(s.sliderMax)+' '+s.currency;host.querySelector('#gaugeNote').textContent=s.note;host.querySelector('.gauge-source').href=meta.sources[s.source].url;paint();}
 range.addEventListener('input',()=>{input.value=range.value;paint()});input.addEventListener('input',paint);select.addEventListener('change',configure);configure();
}
window.AtlasTaxGauge={calculate,render,bind};
})();
/* Atlas Exit · compact summaries and US entrepreneur routes · 2026-09-14 */
(()=>{'use strict';
const ROUTES=[['E-2','Investisseur'],['O-1A','Talent / traction'],['L-1A','Transfert de société'],['EB-2 NIW','Green Card potentielle']];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function selected(){const e=window.AtlasExplorer;if(!e?.state?.selected)return null;return e.getCountries?.().find(c=>c.id===e.state.selected)||null}
function projectHref(id){return `offres.html?countries=${encodeURIComponent(id)}`}
function visaBlock(c){
  const us=c.id==='USA'||c.parent==='USA';
  if(us){return `<section class="mobility-strip"><span class="eyebrow">VISAS & DROIT DE TRAVAIL</span><strong>4 voies à regarder avant la fiscalité</strong><div class="visa-mini-grid">${ROUTES.map(([a,b])=>`<div class="visa-chip"><b>${a}</b><span>${b}</span></div>`).join('')}</div><div class="compact-actions"><a href="immigration-usa.html">Voir les voies entrepreneur ↗</a><a href="${projectHref(c.id)}">Guide PDF USA · 29 € ↗</a></div></section>`}
  const meta=window.ATLAS_CATALOG?.[c.id],src=meta?.residence?.source,href=src&&window.ATLAS_SOURCES?.[src];
  if(/^https:\/\//.test(href||''))return `<section class="mobility-strip compact"><span class="eyebrow">RÉSIDENCE & VISAS</span><div class="compact-actions"><a href="${href}" target="_blank" rel="noopener noreferrer">Portail officiel ↗</a><a href="${projectHref(c.id)}">Préparer mon projet ↗</a></div></section>`;
  return '';
}
function enhanceInspector(){
  const root=$('#inspectorContent'),c=selected();if(!root||!c||!root.children.length)return;
  const body=$('.inspector-body',root);if(!body)return;
  const remember=$$('.detail-section',body).find(s=>$('h3',s)?.textContent.trim()==='À RETENIR');
  if(remember){const critical=$('.critical-note',remember)?.cloneNode(true);remember.remove();if(critical){const tax=$('.tax-stack',body);(tax?.parentNode||body).insertBefore(critical,tax?.nextSibling||null)}}
  $$('p.micro',body).forEach(p=>{if(/^Dividendes et plus-values\s*: pas encore documentés/i.test(p.textContent.trim()))p.remove()});
  if(!$('.mobility-strip',body)){const html=visaBlock(c);if(html){const anchor=$('.source-disclosure',body)||$('.context-disclosure',body)||$('.guide-link',body);const box=document.createElement('div');box.innerHTML=html;body.insertBefore(box.firstElementChild,anchor||null)}}
  const direct=$$('.detail-section',body).filter(s=>s.parentElement===body);
  if(direct.length&&!$('.atlas-data-details',body)){const d=document.createElement('details');d.className='context-disclosure atlas-data-details';d.innerHTML='<summary>Données pays & installation</summary>';direct.forEach(s=>d.appendChild(s));const ref=$('.local-time',body)||$('.guide-link',body);body.insertBefore(d,ref||null)}
  if((c.id==='USA'||c.parent==='USA')&&!$('.summary-cta-row',body)){const row=document.createElement('div');row.className='summary-cta-row';row.innerHTML='<a href="offres.html?countries=USA">Guide PDF USA · 29 € ↗</a><a href="immigration-usa.html">Visas entrepreneur ↗</a>';body.appendChild(row)}
}
function enhanceFederal(){const f=$('.federal-summary');if(!f||$('.federal-mobility',f))return;const d=document.createElement('div');d.className='federal-mobility';d.innerHTML='<span>ENTREPRENEURS</span><b>E-2 · O-1A · L-1A · EB-2 NIW</b><a href="immigration-usa.html">Visas & droit de travail ↗</a>';f.appendChild(d)}
let busy=false;function run(){if(busy)return;busy=true;try{enhanceInspector();enhanceFederal()}finally{busy=false}}
const root=$('#inspectorContent');if(root)new MutationObserver(()=>queueMicrotask(run)).observe(root,{childList:true,subtree:true});
new MutationObserver(()=>queueMicrotask(run)).observe(document.body,{attributes:true,attributeFilter:['class'],subtree:false});
document.addEventListener('click',()=>setTimeout(run,0));window.addEventListener('hashchange',()=>setTimeout(run,0));setTimeout(run,200);
})();
