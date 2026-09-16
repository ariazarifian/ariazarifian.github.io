/* Additional small island jurisdictions absent from the 110m polygon layer. */
(()=>{
  'use strict';
  const extras={
    BRB:{code:'BB',name:'Barbade',region:'North America',lon:-59.54,lat:13.19,tax:28.5,note:'PwC indique un taux PIT headline de 28,5 %. Le taux marginal ne représente pas la charge effective après abattements, crédits et autres prélèvements.'},
    CPV:{code:'CV',name:'Cap-Vert',region:'Africa',lon:-23.62,lat:15.11,tax:27.5,note:'PwC indique un taux PIT headline de 27,5 %. Les règles de résidence, catégories de revenus et cotisations doivent être examinées séparément.'},
    MUS:{code:'MU',name:'Maurice',region:'Africa',lon:57.55,lat:-20.25,tax:20,note:'PwC indique un taux PIT headline de 20 % et signale des mécanismes additionnels pour certains revenus/profils. Ce repère n’est pas un taux effectif personnalisé.'}
  };
  const source='https://taxsummaries.pwc.com/quick-charts/personal-income-tax-pit-rates';
  const S=window.ATLAS_SOURCES||(window.ATLAS_SOURCES={});
  const M=window.ATLAS_META||(window.ATLAS_META={});
  const T=window.ATLAS_TAX||(window.ATLAS_TAX={});
  const C=window.ATLAS_CATALOG||(window.ATLAS_CATALOG={});
  const F=window.ATLAS_FOCUS||(window.ATLAS_FOCUS={});
  const WB=window.ATLAS_WB||{};
  S.pwcPITWorld=source;
  const focus={
    BRB:'Caraïbes : petite juridiction insulaire avec fiscalité personnelle et société désormais visibles.',
    CPV:'Archipel africain rarement comparé : utile pour sortir des seules destinations évidentes.',
    MUS:'Île, centre financier et économie de services : un profil à comparer sans le réduire à son taux fiscal.'
  };
  for(const [id,x] of Object.entries(extras)){
    if(!M[id]) M[id]={city:x.name,pin:[x.lon,x.lat],micro:true};
    if(!T[id]) T[id]={tax:x.tax,scope:'PIT headline · repère PwC',src:'pwcPITWorld',taxYear:'PwC WWTS · consulté 16.09.2026',note:x.note,taxKind:'secondary-current-reference'};
    if(!F[id]) F[id]=focus[id];
    C[id]={tax:null,taxLabel:'Non documenté',scope:'Donnée absente',taxYear:null,src:null,note:'Aucun barème suffisamment vérifié n’est intégré pour cette destination.',tag:F[id],...M[id],...T[id],governance:WB[id]||{},stability:WB[id]?.stability??null};
  }
  if(Array.isArray(window.ATLAS_FEATURED)) for(const id of Object.keys(extras)) if(!window.ATLAS_FEATURED.includes(id)) window.ATLAS_FEATURED.push(id);

  const nativeFetch=window.fetch.bind(window);
  window.fetch=async (...args)=>{
    const response=await nativeFetch(...args);
    const input=args[0];
    const url=typeof input==='string'?input:(input?.url||'');
    if(!/geography\.json(?:\?|$)/.test(url)) return response;
    try{
      const data=await response.clone().json();
      if(!Array.isArray(data)) return response;
      const present=new Set(data.map(row=>row?.[0]));
      const missing=[];
      for(const [id,x] of Object.entries(extras)){
        if(present.has(id)) continue;
        data.push([id,x.code,x.name,x.region,x.lon,x.lat,[]]);
        missing.push(id);
      }
      window.ATLAS_MICRO_EXTRA_MISSING=missing;
      return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers:{'Content-Type':'application/json; charset=utf-8'}});
    }catch(error){console.warn('Atlas micro extra:',error);return response;}
  };

  document.addEventListener('DOMContentLoaded',()=>{
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      let seen=0;
      for(const id of window.ATLAS_MICRO_EXTRA_MISSING||[]){
        const pin=document.querySelector(`#pins .country-pin[data-id="${id}"]`);
        if(!pin) continue;
        seen++;
        pin.classList.add('micro-jurisdiction-pin');
        const label=pin.querySelector('.pin-label');
        if(label) label.style.display='none';
      }
      if((window.ATLAS_MICRO_EXTRA_MISSING?.length&&seen===window.ATLAS_MICRO_EXTRA_MISSING.length)||tries>120) clearInterval(timer);
    },50);
  });
})();
