(()=>{'use strict';
const q=new URLSearchParams(location.search);
const ids=(q.get('countries')||'USA').split(',').filter(id=>/^(?:[A-Z]{3}|US-[A-Z]{2})$/.test(id)).slice(0,4);
const states=window.ATLAS_COMMERCE?.states||[];
const names={ITA:'Italie',FRA:'France',MCO:'Monaco',ARE:'Émirats arabes unis',CHE:'Suisse',DEU:'Allemagne',SGP:'Singapour',ESP:'Espagne',PRT:'Portugal',THA:'Thaïlande',GBR:'Royaume-Uni',CAN:'Canada',IRL:'Irlande',JPN:'Japon'};
let reg;try{reg=new Intl.DisplayNames(['fr'],{type:'region'})}catch{}
const iso2={AUS:'AU',NZL:'NZ',NLD:'NL',AUT:'AT',BEL:'BE',GRC:'GR',BGR:'BG',MEX:'MX',BRA:'BR',AND:'AD'};
const label=id=>states.find(s=>s.id===id)?.name||names[id]||(iso2[id]&&reg?reg.of(iso2[id]):id);
const foreign=ids.filter(id=>id!=='USA'&&!id.startsWith('US-'));
if(foreign.length){
  document.querySelector('#usaProduct').hidden=true;
  document.querySelector('#included').hidden=true;
  document.querySelector('#details').hidden=true;
  document.querySelector('.next-step').hidden=true;
  document.querySelector('#unavailable').hidden=false;
  document.querySelector('#destinationTitle').textContent=foreign.map(label).join(' · ');
  document.querySelector('#destinationContact').href='start.html?countries='+encodeURIComponent(ids.join(','));
  document.title=foreign.map(label).join(' · ')+' — Votre projet Atlas Exit';
}else{
  const chosen=ids.filter(id=>id.startsWith('US-')).map(label);
  if(chosen.length){const el=document.querySelector('#chosenState');el.hidden=false;el.textContent='Votre sélection : '+chosen.join(', ')+'. Ces États sont inclus dans le guide.'}

  const form=document.querySelector('#guideCheckoutForm');
  const email=document.querySelector('#purchaseEmail');
  const button=document.querySelector('#buyGuide');
  const status=document.querySelector('#checkoutStatus');
  const API='https://atlas-exit-delivery.onrender.com';

  if(form&&email&&button&&status){
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!email.checkValidity()){email.reportValidity();return;}
      button.disabled=true;
      button.textContent='Préparation du paiement…';
      status.textContent='Création de votre commande sécurisée…';
      status.dataset.state='loading';
      try{
        const r=await fetch(API+'/checkout',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({email:email.value.trim()})
        });
        const d=await r.json().catch(()=>({}));
        if(!r.ok||!d.checkout_url) throw new Error('checkout_unavailable');
        status.textContent='Redirection vers Revolut…';
        location.href=d.checkout_url;
      }catch(err){
        button.disabled=false;
        button.textContent='Acheter le guide · 29 € ↗';
        status.textContent='Le paiement est momentanément indisponible. Aucun débit n’a été effectué. Réessayez dans quelques instants.';
        status.dataset.state='error';
      }
    });
  }
}
})();
