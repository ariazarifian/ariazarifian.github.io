'use strict';

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = Number(process.env.PORT || 10000);
const REVOLUT_SECRET_KEY = process.env.REVOLUT_SECRET_KEY || '';
const REVOLUT_BASE_URL = (process.env.REVOLUT_BASE_URL || 'https://sandbox-merchant.revolut.com').replace(/\/+$/, '');
const REVOLUT_API_VERSION = process.env.REVOLUT_API_VERSION || '2026-04-20';
const GUIDE_KEY_HEX = process.env.GUIDE_KEY_HEX || '';
const DELIVERY_SIGNING_SECRET = process.env.DELIVERY_SIGNING_SECRET || '';
const PUBLIC_API_URL = (process.env.PUBLIC_API_URL || 'https://atlas-exit-delivery-sandbox.onrender.com').replace(/\/+$/, '');
const PRODUCT_ID = 'atlas-guide-usa-v1.2-sandbox';
const PRODUCT_PRICE = 2900;
const PRODUCT_CURRENCY = 'EUR';

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function sendHtml(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"
  });
  res.end(body);
}

function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeEqualHex(a, b) {
  if (!/^[0-9a-f]{64}$/i.test(a || '') || !/^[0-9a-f]{64}$/i.test(b || '')) return false;
  return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}

function signOrder(orderId) {
  if (!DELIVERY_SIGNING_SECRET) throw new Error('delivery secret missing');
  return crypto.createHmac('sha256', DELIVERY_SIGNING_SECRET).update(orderId).digest('hex');
}

async function parseJsonBody(req, maxBytes = 20000) {
  return await new Promise((resolve, reject) => {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
      if (Buffer.byteLength(data) > maxBytes) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}

function headers(withJson = false) {
  const h = {
    'Authorization': `Bearer ${REVOLUT_SECRET_KEY}`,
    'Revolut-Api-Version': REVOLUT_API_VERSION
  };
  if (withJson) h['Content-Type'] = 'application/json';
  return h;
}

async function revolutFetch(pathname, options = {}) {
  if (!REVOLUT_SECRET_KEY || REVOLUT_SECRET_KEY === 'NEEDS_SANDBOX_KEY') throw new Error('REVOLUT_NOT_CONFIGURED');
  const r = await fetch(REVOLUT_BASE_URL + pathname, options);
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
  if (!r.ok) {
    const e = new Error(`Revolut ${r.status}`);
    e.status = r.status;
    e.data = data;
    throw e;
  }
  return data;
}

async function createCheckout(email) {
  const order = await revolutFetch('/api/orders', {
    method: 'POST',
    headers: headers(true),
    body: JSON.stringify({
      amount: PRODUCT_PRICE,
      currency: PRODUCT_CURRENCY,
      description: 'SANDBOX — Atlas Exit — Guide États-Unis — Édition 1.2',
      customer: { email },
      capture_mode: 'automatic',
      metadata: { product: PRODUCT_ID },
      redirect_url: `${PUBLIC_API_URL}/waiting`
    })
  });

  const sig = signOrder(order.id);
  const deliveryUrl = `${PUBLIC_API_URL}/complete?order=${encodeURIComponent(order.id)}&sig=${sig}`;

  const updated = await revolutFetch(`/api/orders/${encodeURIComponent(order.id)}`, {
    method: 'PATCH',
    headers: headers(true),
    body: JSON.stringify({
      redirect_url: deliveryUrl,
      metadata: { product: PRODUCT_ID }
    })
  });

  return {
    orderId: updated.id || order.id,
    checkoutUrl: updated.checkout_url || order.checkout_url
  };
}

async function retrieveOrder(orderId) {
  return await revolutFetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: headers(false)
  });
}

function paidAndCorrect(order) {
  const state = String(order && order.state || '').toLowerCase();
  return state === 'completed'
    && Number(order && order.amount) === PRODUCT_PRICE
    && String(order && order.currency || '').toUpperCase() === PRODUCT_CURRENCY
    && order && order.metadata && order.metadata.product === PRODUCT_ID;
}

function decryptGuide() {
  const key = Buffer.from(GUIDE_KEY_HEX, 'hex');
  if (key.length !== 32) throw new Error('guide key invalid');
  const nonce = Buffer.from('FpvjwLQPTlBVGmDK', 'base64');
  const tag = Buffer.from('9hxBylbWj1ZvS6ShB20f0Q==', 'base64');
  const b64 = [1,2].map(n => fs.readFileSync(path.join(__dirname, 'payload', `chunk${n}.txt`), 'utf8').trim()).join('');
  const ciphertext = Buffer.from(b64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAAD(Buffer.from(PRODUCT_ID + ':gzip', 'utf8'));
  decipher.setAuthTag(tag);
  const compressed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const plain = zlib.gunzipSync(compressed);
  const actual = crypto.createHash('sha256').update(plain).digest('hex');
  if (actual !== '45faec024dec31bd238eb95d502eb68b2445972f7dfc675e894a52d99d92b418') throw new Error('guide integrity mismatch');
  return plain;
}

function testPage() {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas Exit — Test Sandbox Revolut</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f6f6f3;color:#171717}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px}
.card{width:min(680px,100%);background:#fff;border:1px solid #dddcd6;border-radius:22px;padding:34px;box-shadow:0 20px 70px rgba(0,0,0,.06)}
.brand{font-weight:850;letter-spacing:-.04em}.brand span{font-weight:400}
.badge{display:inline-block;margin-top:24px;background:#eef4ff;color:#183153;border-radius:999px;padding:7px 10px;font-weight:750;font-size:12px}
h1{font-size:clamp(32px,6vw,54px);line-height:1;letter-spacing:-.05em;margin:18px 0}
p{line-height:1.55;color:#555}label{display:block;font-size:13px;font-weight:700;margin:22px 0 7px}
input{width:100%;padding:14px;border:1px solid #ccc;border-radius:11px;font:inherit}
button{margin-top:12px;border:0;border-radius:11px;background:#171717;color:#fff;padding:14px 17px;font-weight:800;cursor:pointer}
.small{font-size:13px;color:#777}
</style></head><body><main class="card">
<div class="brand">ATLAS<span>EXIT</span></div><div class="badge">SANDBOX · 0 € RÉEL</div>
<h1>Tester l'achat du guide.</h1>
<p>Cette page crée une commande dans l'environnement Sandbox de Revolut. Aucun argent réel ne peut être débité.</p>
<form id="f"><label for="email">E-mail de test</label><input id="email" type="email" required placeholder="test@example.com"><button>Créer le faux achat à 29 € →</button></form>
<p id="status" class="small"></p>
<p class="small">Après redirection vers Revolut Sandbox, utilisez une carte de test officielle. Une fois le paiement simulé accepté, Revolut vous renverra ici et Atlas devra débloquer le vrai PDF.</p>
</main><script>
document.getElementById('f').addEventListener('submit', async e => {
  e.preventDefault(); const s=document.getElementById('status'); s.textContent='Création de la commande Sandbox…';
  try {
    const r=await fetch('/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('email').value})});
    const d=await r.json(); if(!r.ok) throw new Error(d.error||'checkout_failed');
    location.href=d.checkout_url;
  } catch(err) { s.textContent='Erreur : '+err.message; }
});
</script></body></html>`;
}

function completePage(orderId, sig) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Paiement Sandbox confirmé — Atlas Exit</title><style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f6f6f3;color:#171717}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px}
.card{width:min(640px,100%);background:#fff;border:1px solid #dddcd6;border-radius:22px;padding:34px}
h1{font-size:clamp(32px,6vw,52px);letter-spacing:-.05em;line-height:1}p{color:#555;line-height:1.55}
a{display:inline-block;margin-top:12px;background:#171717;color:#fff;text-decoration:none;padding:14px 17px;border-radius:11px;font-weight:800}
</style></head><body><main class="card"><div>SANDBOX REVOLUT</div><h1>Vérification du faux paiement…</h1><p id="s">Lecture de la commande auprès de Revolut Sandbox.</p><div id="a"></div>
<script>
const order=${JSON.stringify(orderId)}, sig=${JSON.stringify(sig)}, s=document.getElementById('s'), a=document.getElementById('a');
async function go(){const r=await fetch('/status?order='+encodeURIComponent(order)+'&sig='+encodeURIComponent(sig),{cache:'no-store'});const d=await r.json();
if(d.paid){s.textContent='Paiement Sandbox confirmé. Le vrai PDF est bien débloqué par Atlas.';a.innerHTML='<a href="/download?order='+encodeURIComponent(order)+'&sig='+encodeURIComponent(sig)+'">Télécharger le guide PDF ↓</a>';return true;}
s.textContent='État Revolut : '+(d.state||'en attente')+'…';return false;}
(async()=>{for(let i=0;i<15;i++){if(await go())return;await new Promise(r=>setTimeout(r,2000));}s.textContent='La confirmation prend plus de temps. Rechargez la page.';})();
</script></main></body></html>`;
}

async function authProbe() {
  if (!REVOLUT_SECRET_KEY || REVOLUT_SECRET_KEY === 'NEEDS_SANDBOX_KEY') {
    console.log('Revolut Sandbox auth probe: NOT_CONFIGURED'); return;
  }
  try {
    await revolutFetch('/api/orders', { method:'GET', headers: headers(false) });
    console.log('Revolut Sandbox auth probe: OK');
  } catch (e) {
    console.log('Revolut Sandbox auth probe: FAILED HTTP ' + (e.status || 'ERR'));
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/') return sendHtml(res, 200, testPage());
  if (req.method === 'GET' && url.pathname === '/health') return sendJson(res, 200, {
    ok:true,
    sandbox: REVOLUT_BASE_URL.includes('sandbox-merchant.revolut.com'),
    revolutConfigured: !!REVOLUT_SECRET_KEY && REVOLUT_SECRET_KEY !== 'NEEDS_SANDBOX_KEY',
    guideConfigured: /^[0-9a-f]{64}$/i.test(GUIDE_KEY_HEX),
    product: PRODUCT_ID
  });
  if (req.method === 'GET' && url.pathname === '/waiting') return sendHtml(res, 200, '<h1>Retour Sandbox en préparation…</h1>');
  if (req.method === 'POST' && url.pathname === '/checkout') {
    try {
      const body=await parseJsonBody(req); const email=String(body.email||'').trim().toLowerCase();
      if(!validEmail(email)) return sendJson(res,400,{error:'invalid_email'});
      const created=await createCheckout(email); return sendJson(res,200,{checkout_url:created.checkoutUrl});
    } catch(e) {
      console.error('sandbox_checkout_error', e.message, e.status || '', e.data || '');
      return sendJson(res, e.message==='REVOLUT_NOT_CONFIGURED'?503:502, {error:e.message==='REVOLUT_NOT_CONFIGURED'?'sandbox_key_not_configured':'checkout_failed'});
    }
  }
  if (req.method === 'GET' && url.pathname === '/complete') {
    const order=url.searchParams.get('order')||'', sig=url.searchParams.get('sig')||''; let expected='';
    try{expected=signOrder(order)}catch{}
    if(!safeEqualHex(sig,expected)) return sendHtml(res,403,'<h1>Lien Sandbox invalide.</h1>');
    return sendHtml(res,200,completePage(order,sig));
  }
  if (req.method === 'GET' && url.pathname === '/status') {
    const orderId=url.searchParams.get('order')||'', sig=url.searchParams.get('sig')||''; let expected='';
    try{expected=signOrder(orderId)}catch{}
    if(!safeEqualHex(sig,expected)) return sendJson(res,403,{paid:false});
    try{const order=await retrieveOrder(orderId);return sendJson(res,200,{paid:paidAndCorrect(order),state:String(order.state||'')})}
    catch(e){console.error('sandbox_status_error',e.message);return sendJson(res,502,{paid:false,error:'verification_failed'})}
  }
  if (req.method === 'GET' && url.pathname === '/download') {
    const orderId=url.searchParams.get('order')||'', sig=url.searchParams.get('sig')||''; let expected='';
    try{expected=signOrder(orderId)}catch{}
    if(!safeEqualHex(sig,expected)) return sendHtml(res,403,'<h1>Lien Sandbox invalide.</h1>');
    try {
      const order=await retrieveOrder(orderId);
      if(!paidAndCorrect(order)) return sendHtml(res,402,'<h1>Faux paiement non confirmé.</h1>');
      const pdf=decryptGuide();
      res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':'attachment; filename="Atlas-Exit-Guide-Etats-Unis-2026.pdf"','Content-Length':pdf.length,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});
      return res.end(pdf);
    } catch(e) {console.error('sandbox_download_error',e.message);return sendHtml(res,502,'<h1>Livraison Sandbox indisponible.</h1>');}
  }
  return sendJson(res,404,{error:'not_found'});
});

server.listen(PORT,'0.0.0.0',()=>{console.log(`Atlas sandbox delivery listening on ${PORT}`);authProbe();});
