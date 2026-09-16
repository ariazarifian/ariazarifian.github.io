(() => {
  const GUIDE_VALUE = 29;

  /*
   * Tiny jurisdictions are often absent from Natural Earth's 110m country
   * polygons. Seed them before catalog.js/script.js run, then append pin-only
   * geography rows only when the base map genuinely lacks the territory.
   */
  const micro = {
    BHR:{code:'BH',name:'Bahreïn',region:'Asia',lon:50.55,lat:26.07,tax:0,scope:'Pas de PIT',src:'pwcBahrain',taxYear:'PwC · revue 26 juillet 2026',note:'Bahreïn n’a pas de régime d’impôt sur le revenu des personnes physiques. Les cotisations sociales, le statut de séjour, l’activité professionnelle et les autres taxes restent distincts.'},
    BMU:{code:'BM',name:'Bermudes',region:'North America',lon:-64.75,lat:32.30,tax:0,scope:'Pas d’impôt sur le revenu individuel',src:'pwcBermuda',taxYear:'PwC · revue 19 février 2026',note:'Les Bermudes n’imposent pas d’impôt sur le revenu aux personnes physiques. Des payroll taxes, cotisations et autres prélèvements existent : zéro PIT ne signifie pas zéro fiscalité.'},
    CYM:{code:'KY',name:'Îles Caïmans',region:'North America',lon:-81.25,lat:19.31,tax:0,scope:'Pas d’impôt sur le revenu individuel',src:'pwcCayman',taxYear:'PwC · revue 29 mai 2026',note:'Les Îles Caïmans n’imposent ni income tax ni withholding tax aux individus. Immigration, permis de travail, coût de vie, droits et autres prélèvements doivent être examinés séparément.'},
    JEY:{code:'JE',name:'Jersey',region:'Europe',lon:-2.13,lat:49.21,tax:20,scope:'Taux sur revenu net après abattements',src:'pwcJersey',taxYear:'PwC · revue 22 juillet 2026',note:'Jersey applique un impôt sur le revenu de 20 % sur le revenu net après abattements, avec un calcul marginal alternatif automatique. Cotisations sociales et contribution dépendance s’ajoutent selon le profil.'},
    GGY:{code:'GG',name:'Guernesey',region:'Europe',lon:-2.58,lat:49.46,tax:20,scope:'Taux sur revenu net après abattements',src:'pwcGuernsey',taxYear:'PwC · revue 17 décembre 2025',note:'Guernesey applique généralement 20 % sur le revenu net après abattements, avec des mécanismes de plafonnement possibles pour certains résidents.'},
    IMN:{code:'IM',name:'Île de Man',region:'Europe',lon:-4.55,lat:54.24,tax:21,scope:'Tranche supérieure résident',src:'pwcIsleMan',taxYear:'2026/27 · PwC',note:'L’Île de Man applique 10 % puis 21 % pour les résidents, avec abattement personnel et mécanisme de plafonnement sous conditions. Il n’y a pas d’impôt local additionnel sur le revenu.'},
    GIB:{code:'GI',name:'Gibraltar',region:'Europe',lon:-5.35,lat:36.14,tax:null,taxLabel:'6–39 % selon système',scope:'Deux systèmes de calcul',src:'pwcGibraltar',taxYear:'PwC · revue 22 août 2026',note:'Gibraltar compare automatiquement deux systèmes. Le système fondé sur abattements monte jusqu’à 39 %, tandis que le Gross Income Based System utilise d’autres tranches : un taux unique serait trompeur.'},
    LIE:{code:'LI',name:'Liechtenstein',region:'Europe',lon:9.55,lat:47.16,tax:null,taxLabel:'National + communal',scope:'Impôt national + multiplicateur communal',src:'pwcLiechtenstein',taxYear:'PwC · revue 9 juin 2026',note:'Le Liechtenstein combine un barème national progressif et une composante communale. Atlas n’affiche pas un taux total unique sans commune et profil.'},
    MLT:{code:'MT',name:'Malte',region:'Europe',lon:14.38,lat:35.94,tax:35,scope:'Barème résident · tranche supérieure',src:'pwcMalta',taxYear:'2026 · PwC',note:'Le barème maltais 2026 va de 0 à 35 %. Domicile, résidence ordinaire et remittance basis peuvent modifier profondément le traitement des revenus étrangers.'},
    HKG:{code:'HK',name:'Hong Kong',region:'Asia',lon:114.17,lat:22.32,tax:null,taxLabel:'Salaires · barème territorial',scope:'Salaries / profits / property séparés',src:'pwcHongKong',taxYear:'PwC · revue 22 juillet 2026',note:'Hong Kong ne taxe pas le revenu total sous un impôt personnel unique : salaires, profits et revenus immobiliers relèvent de régimes distincts et la source territoriale est centrale.'},
    MAC:{code:'MO',name:'Macao',region:'Asia',lon:113.55,lat:22.20,tax:12,scope:'Professional tax · taux maximum',src:'pwcMacau',taxYear:'2026 · PwC',note:'Le professional tax de Macao est progressif jusqu’à 12 % en 2026, avec abattement personnel et déduction standard. Les activités commerciales suivent un autre impôt.'},
    LCA:{code:'LC',name:'Sainte-Lucie',region:'North America',lon:-60.98,lat:13.91,tax:30,scope:'Barème personnel · tranche supérieure',src:'pwcSaintLucia',taxYear:'PwC · revue 13 janvier 2026',note:'Sainte-Lucie applique un barème de 15, 20 et 30 % sur le revenu imposable. Résidence, remittance des revenus étrangers et cotisations National Insurance modifient le résultat réel.'}
  };

  const sourceSeed={
    pwcBahrain:'https://taxsummaries.pwc.com/bahrain/individual/taxes-on-personal-income',
    pwcBermuda:'https://taxsummaries.pwc.com/bermuda/individual/taxes-on-personal-income',
    pwcCayman:'https://taxsummaries.pwc.com/cayman-islands/individual/taxes-on-personal-income',
    pwcJersey:'https://taxsummaries.pwc.com/jersey/individual/taxes-on-personal-income',
    pwcGuernsey:'https://taxsummaries.pwc.com/guernsey/individual/taxes-on-personal-income',
    pwcIsleMan:'https://taxsummaries.pwc.com/isle-of-man/individual/taxes-on-personal-income',
    pwcGibraltar:'https://taxsummaries.pwc.com/gibraltar/individual/taxes-on-personal-income',
    pwcLiechtenstein:'https://taxsummaries.pwc.com/liechtenstein/individual/taxes-on-personal-income',
    pwcMalta:'https://taxsummaries.pwc.com/malta/individual/taxes-on-personal-income',
    pwcHongKong:'https://taxsummaries.pwc.com/hong-kong-sar/individual/taxes-on-personal-income',
    pwcMacau:'https://taxsummaries.pwc.com/macau-sar/individual/taxes-on-personal-income',
    pwcSaintLucia:'https://taxsummaries.pwc.com/saint-lucia/individual/taxes-on-personal-income'
  };

  const focusSeed={
    BHR:'Golfe, zéro PIT : le permis, les cotisations et le coût de vie font la différence.',
    BMU:'Une juridiction sans impôt sur le revenu individuel, mais avec une structure de prélèvements très différente.',
    CYM:'Zéro income tax individuel : intéressant à découvrir, sans confondre fiscalité et droit de résidence.',
    JEY:'Une île européenne à fiscalité propre qui ne se lit pas comme le Royaume-Uni.',
    GGY:'Une petite juridiction avec taux simple et mécanismes de plafonnement.',
    IMN:'Une île avec son propre barème, rarement mise dans les comparateurs classiques.',
    GIB:'Deux systèmes d’impôt personnels : le chiffre dépend du mode de calcul retenu.',
    LIE:'Micro-État, fiscalité nationale et communale : la commune compte.',
    MLT:'Île UE : domicile et remittance basis comptent autant que le taux marginal.',
    HKG:'Territorialité et catégories de revenus : la logique est très différente d’un IR européen.',
    MAC:'Professional tax jusqu’à 12 % : petit territoire, système très distinct.',
    LCA:'Caraïbes : un exemple de destination qu’on ne pense pas spontanément à comparer.'
  };

  function mergeAssignedProperty(name, merge){
    let stored=window[name];
    Object.defineProperty(window,name,{
      configurable:true,
      enumerable:true,
      get(){return stored;},
      set(value){stored=merge(value);}
    });
    if(stored!==undefined) stored=merge(stored);
  }

  mergeAssignedProperty('ATLAS_SOURCES',value=>Object.assign(value||{},sourceSeed));
  mergeAssignedProperty('ATLAS_META',value=>{
    const target=value||{};
    for(const [id,x] of Object.entries(micro)) if(!target[id]) target[id]={city:x.name,pin:[x.lon,x.lat],micro:true};
    return target;
  });
  mergeAssignedProperty('ATLAS_TAX',value=>{
    const target=value||{};
    for(const [id,x] of Object.entries(micro)) if(!target[id]) target[id]={tax:x.tax,taxLabel:x.taxLabel,scope:x.scope,src:x.src,taxYear:x.taxYear,note:x.note,taxKind:'secondary-current-reference'};
    return target;
  });
  mergeAssignedProperty('ATLAS_FOCUS',value=>Object.assign(value||{},focusSeed));
  mergeAssignedProperty('ATLAS_FEATURED',value=>Array.isArray(value)?value:[]);

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
      for(const [id,x] of Object.entries(micro)){
        if(present.has(id)) continue;
        data.push([id,x.code,x.name,x.region,x.lon,x.lat,[]]);
        missing.push(id);
      }
      window.ATLAS_MICRO_MISSING=missing;
      const featured=window.ATLAS_FEATURED;
      if(Array.isArray(featured)) for(const id of missing) if(!featured.includes(id)) featured.push(id);
      return new Response(JSON.stringify(data),{
        status:response.status,
        statusText:response.statusText,
        headers:{'Content-Type':'application/json; charset=utf-8'}
      });
    }catch(error){
      console.warn('Atlas micro destinations:',error);
      return response;
    }
  };

  function track(name, data = {}) {
    if (window.umami && typeof window.umami.track === 'function') {
      window.umami.track(name, data);
    }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.href || '';

    if (href.includes('checkout.revolut.com')) {
      track('begin_checkout', {
        product: 'guide-usa-1-2',
        value: GUIDE_VALUE,
        currency: 'EUR'
      });
      track('revolut_checkout_click', {
        product: 'guide-usa-1-2',
        value: GUIDE_VALUE,
        currency: 'EUR'
      });
    } else if (href.includes('extrait-guide-usa')) {
      track('sample_guide_click', { product: 'guide-usa-1-2' });
    } else if (href.includes('start.html') || href.includes('accompagnement.html')) {
      track('lead_start', { link_url: href });
    } else if (href.startsWith('mailto:') || href.includes('mail.google.com')) {
      track('contact_channel_open', {
        channel: href.startsWith('mailto:') ? 'mailto' : 'gmail'
      });
    }
  }, { capture: true });

  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'intakeForm') {
      track('generate_lead', { source: 'atlas_intake_form' });
      track('lead_message_prepared', { form: 'intakeForm' });
    }
  }, { capture: true });

  document.addEventListener('DOMContentLoaded', () => {
    if (location.pathname.endsWith('/offres.html') || location.pathname.endsWith('offres.html')) {
      track('guide_view', {
        product: 'guide-usa-1-2',
        value: GUIDE_VALUE,
        currency: 'EUR'
      });
    }

    if (document.querySelector('#worldMap') && !window.ATLAS_WORLD_EXPANSION) {
      const script = document.createElement('script');
      script.src = 'world-expansion.js?v=1';
      script.async = true;
      script.dataset.atlasWorldExpansion = '1';
      document.head.append(script);
    }

    if(document.querySelector('#worldMap')){
      let tries=0;
      const timer=setInterval(()=>{
        tries++;
        let seen=0;
        for(const id of window.ATLAS_MICRO_MISSING||[]){
          const pin=document.querySelector(`#pins .country-pin[data-id="${id}"]`);
          if(!pin) continue;
          seen++;
          pin.classList.add('micro-jurisdiction-pin');
          const label=pin.querySelector('.pin-label');
          if(label) label.style.display='none';
        }
        if((window.ATLAS_MICRO_MISSING?.length&&seen===window.ATLAS_MICRO_MISSING.length)||tries>120) clearInterval(timer);
      },50);
    }
  });

  window.AtlasAnalytics = { track };
})();
