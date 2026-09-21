'use strict';

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = Number(process.env.PORT || 10000);
const REVOLUT_SECRET_KEY = process.env.REVOLUT_SECRET_KEY || '';
const REVOLUT_API_VERSION = process.env.REVOLUT_API_VERSION || '2026-03-12';
const GUIDE_KEY_HEX = process.env.GUIDE_KEY_HEX || '';
const FREE_GUIDE_KEY_HEX = process.env.FREE_GUIDE_KEY_HEX || '';
const DELIVERY_SIGNING_SECRET = process.env.DELIVERY_SIGNING_SECRET || '';
const PUBLIC_SITE_URL = (process.env.PUBLIC_SITE_URL || 'https://atlas-exit-premium.onrender.com').replace(/\/+$/, '');
const PUBLIC_API_URL = (process.env.PUBLIC_API_URL || 'https://atlas-exit-delivery.onrender.com').replace(/\/+$/, '');

// Keep this stable so existing paid order links continue to unlock the latest edition of the same product.
const PRODUCT_ID = 'atlas-guide-usa-v1.2';
const GUIDE_EDITION = '2.0';
const PRODUCT_PRICE = 2900;
const PRODUCT_CURRENCY = 'EUR';
const GUIDE_SHA256 = 'e36e055c9b8aae04c4f08f8bc2f1b5eb030b732c3ed0200bb68599c8f54c32f7';
const GUIDE_NONCE_B64 = 'imeFcFExmNbScgfw';
const GUIDE_TAG_B64 = 'r7bYk8kJsHdI7biKrX4gYg==';

// Isolated free V15 asset. Paid constants/payload above must remain unchanged.
const FREE_GUIDE_EDITION = '15.0';
const FREE_GUIDE_SHA256 = 'a91df6b806c65cba8a2c868b996155e29429b7494815368c768aa676b21781dc';
const FREE_GUIDE_NONCE_B64 = '96vaWZt4l7nv1+S6';
const FREE_GUIDE_TAG_B64 = 'w68hkWunIo7S8wwJO45eVA==';
const FREE_GUIDE_AAD = 'atlas-guide-usa-free-v15:gzip';

const ALLOWED_ORIGINS = new Set([
  'https://atlas-exit-premium.onrender.com',
  'https://atlas-expat.fr',
  'https://www.atlas-expat.fr'
]);

function json(res, status, obj, origin = '') {
  const body = JSON.stringify(obj);
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function html(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'"
  });
  res.end(body);
}

function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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

function revolutHeaders(withJson = false) {
  const h = {
    'Authorization': `Bearer ${REVOLUT_SECRET_KEY}`,
    'Revolut-Api-Version': REVOLUT_API_VERSION
  };
  if (withJson) h['Content-Type'] = 'application/json';
  return h;
}

async function revolutFetch(url, opts = {}) {
  if (!REVOLUT_SECRET_KEY || REVOLUT_SECRET_KEY === 'NEEDS_CONFIGURATION') {
    throw new Error('REVOLUT_NOT_CONFIGURED');
  }
  const r = await fetch(url, opts);
  const text = await r.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; }
  catch { data = { raw: text }; }
  if (!r.ok) {
    const e = new Error(`Revolut ${r.status}`);
    e.status = r.status;
    e.data = data;
    throw e;
  }
  return data;
}

async function createCheckout(email) {
  const order = await revolutFetch('https://merchant.revolut.com/api/orders', {
    method: 'POST',
    headers: revolutHeaders(true),
    body: JSON.stringify({
      amount: PRODUCT_PRICE,
      currency: PRODUCT_CURRENCY,
      description: 'Atlas Exit - Guide Etats-Unis - Edition 2.0',
      customer: { email },
      capture_mode: 'automatic',
      metadata: { product: PRODUCT_ID, edition: GUIDE_EDITION },
      redirect_url: `${PUBLIC_SITE_URL}/offres.html?countries=USA`
    })
  });

  const sig = signOrder(order.id);
  const deliveryUrl = `${PUBLIC_API_URL}/complete?order=${encodeURIComponent(order.id)}&sig=${sig}`;

  const updated = await revolutFetch(`https://merchant.revolut.com/api/orders/${encodeURIComponent(order.id)}`, {
    method: 'PATCH',
    headers: revolutHeaders(true),
    body: JSON.stringify({
      redirect_url: deliveryUrl,
      merchant_order_data: {
        reference: `ATLAS-USA-${order.id.slice(0, 8)}`,
        url: deliveryUrl
      },
      metadata: { product: PRODUCT_ID, edition: GUIDE_EDITION }
    })
  });

  return {
    orderId: updated.id || order.id,
    checkoutUrl: updated.checkout_url || order.checkout_url
  };
}

async function retrieveOrder(orderId) {
  return await revolutFetch(`https://merchant.revolut.com/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: revolutHeaders(false)
  });
}

function orderPaidAndCorrect(order) {
  const state = String(order && order.state || '').toLowerCase();
  const amountOk = Number(order && order.amount) === PRODUCT_PRICE;
  const currencyOk = String(order && order.currency || '').toUpperCase() === PRODUCT_CURRENCY;
  const metadataOk = order && order.metadata && order.metadata.product === PRODUCT_ID;
  return state === 'completed' && amountOk && currencyOk && metadataOk;
}

function decryptGuide() {
  const key = Buffer.from(GUIDE_KEY_HEX, 'hex');
  if (key.length !== 32) throw new Error('guide key invalid');

  const nonce = Buffer.from(GUIDE_NONCE_B64, 'base64');
  const tag = Buffer.from(GUIDE_TAG_B64, 'base64');
  const b64 = [1, 2].map(n => fs.readFileSync(path.join(__dirname, 'payload', `chunk${n}.txt`), 'utf8').trim()).join('');
  const ciphertext = Buffer.from(b64, 'base64');
  if (nonce.length !== 12 || tag.length !== 16 || !ciphertext.length) throw new Error('guide payload invalid');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  // Product ID deliberately stays stable across guide editions so historical paid orders remain valid.
  decipher.setAAD(Buffer.from(PRODUCT_ID + ':gzip', 'utf8'));
  decipher.setAuthTag(tag);
  const compressed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const pdf = zlib.gunzipSync(compressed);
  const actual = crypto.createHash('sha256').update(pdf).digest('hex');
  if (actual !== GUIDE_SHA256) throw new Error('guide integrity mismatch');
  return pdf;
}

function decryptFreeGuide() {
  const key = Buffer.from(FREE_GUIDE_KEY_HEX, 'hex');
  if (key.length !== 32) throw new Error('free guide key invalid');

  const nonce = Buffer.from(FREE_GUIDE_NONCE_B64, 'base64');
  const tag = Buffer.from(FREE_GUIDE_TAG_B64, 'base64');
  const payloadDir = path.join(__dirname, 'payload-free-v15');
  const files = fs.readdirSync(payloadDir)
    .filter(name => /^chunk\d+\.txt$/.test(name))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  if (!files.length) throw new Error('free guide payload missing');
  const b64 = files.map(name => fs.readFileSync(path.join(payloadDir, name), 'utf8').trim()).join('');
  const ciphertext = Buffer.from(b64, 'base64');
  if (nonce.length !== 12 || tag.length !== 16 || !ciphertext.length) throw new Error('free guide payload invalid');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAAD(Buffer.from(FREE_GUIDE_AAD, 'utf8'));
  decipher.setAuthTag(tag);
  const compressed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  const pdf = zlib.gunzipSync(compressed);
  const actual = crypto.createHash('sha256').update(pdf).digest('hex');
  if (actual !== FREE_GUIDE_SHA256) throw new Error('free guide integrity mismatch');
  return pdf;
}

function completePage(orderId, sig) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Votre guide est prêt - Atlas Exit</title><style>
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f6f6f3;color:#171717}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px}.card{width:min(650px,100%);background:#fff;border:1px solid #dddcd6;border-radius:22px;padding:36px;box-shadow:0 20px 70px rgba(0,0,0,.06)}
.brand{font-weight:850;letter-spacing:-.04em}.brand span{font-weight:400}.badge{display:inline-block;margin-top:24px;background:#edf4ef;color:#234238;border-radius:999px;padding:7px 10px;font-weight:750;font-size:12px}
h1{font-size:clamp(34px,6vw,56px);line-height:1;letter-spacing:-.05em;margin:18px 0}p{line-height:1.55;color:#555}a{display:inline-block;margin-top:12px;background:#172e30;color:#fff;text-decoration:none;padding:14px 17px;border-radius:11px;font-weight:800}.small{font-size:13px;color:#777}
</style></head><body><main class="card"><div class="brand">ATLAS<span>EXIT</span></div><div class="badge">PAIEMENT REÇU</div><h1>Votre guide est prêt.</h1><p id="s">Vérification du paiement auprès de Revolut...</p><div id="a"></div><p class="small">Édition 2.0 - 53 pages. Le téléchargement est débloqué uniquement après confirmation serveur du paiement.</p></main><script>
const order=${JSON.stringify(orderId)}, sig=${JSON.stringify(sig)}, s=document.getElementById('s'), a=document.getElementById('a');
async function go(){try{const r=await fetch('/status?order='+encodeURIComponent(order)+'&sig='+encodeURIComponent(sig),{cache:'no-store'});const d=await r.json();if(d.paid){s.textContent='Paiement confirmé. Votre guide complet est disponible immédiatement.';a.innerHTML='<a href="/download?order='+encodeURIComponent(order)+'&sig='+encodeURIComponent(sig)+'">Télécharger le guide PDF ↓</a>';return true;}s.textContent='Paiement en cours de finalisation...';}catch{ s.textContent='Vérification momentanément indisponible. Nouvelle tentative...'; }return false;}
(async()=>{for(let i=0;i<15;i++){if(await go())return;await new Promise(r=>setTimeout(r,2000));}s.textContent='La confirmation prend plus de temps que prévu. Rechargez cette page dans quelques instants.';})();
</script></body></html>`;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || '';
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'OPTIONS') {
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Vary', 'Origin');
    }
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, {
      ok: true,
      revolutConfigured: !!REVOLUT_SECRET_KEY && REVOLUT_SECRET_KEY !== 'NEEDS_CONFIGURATION',
      guideConfigured: /^[0-9a-f]{64}$/i.test(GUIDE_KEY_HEX),
      product: PRODUCT_ID,
      edition: GUIDE_EDITION,
      guideSha256: GUIDE_SHA256,
      freeGuideConfigured: /^[0-9a-f]{64}$/i.test(FREE_GUIDE_KEY_HEX),
      freeGuideEdition: FREE_GUIDE_EDITION,
      freeGuideSha256: FREE_GUIDE_SHA256
    }, origin);
  }

  if (req.method === 'POST' && url.pathname === '/checkout') {
    if (!ALLOWED_ORIGINS.has(origin)) return json(res, 403, { error: 'origin_not_allowed' }, origin);
    try {
      const body = await parseJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      if (!validEmail(email)) return json(res, 400, { error: 'invalid_email' }, origin);
      const created = await createCheckout(email);
      return json(res, 200, { checkout_url: created.checkoutUrl }, origin);
    } catch (e) {
      console.error('checkout_error', e.message, e.status || '', e.data || '');
      return json(res, e.message === 'REVOLUT_NOT_CONFIGURED' ? 503 : 502, {
        error: e.message === 'REVOLUT_NOT_CONFIGURED' ? 'payment_temporarily_unavailable' : 'checkout_failed'
      }, origin);
    }
  }

  if (req.method === 'GET' && url.pathname === '/complete') {
    const orderId = url.searchParams.get('order') || '';
    const sig = url.searchParams.get('sig') || '';
    let expected = '';
    try { expected = signOrder(orderId); } catch {}
    if (!safeEqualHex(sig, expected)) return html(res, 403, '<h1>Lien de livraison invalide.</h1>');
    return html(res, 200, completePage(orderId, sig));
  }

  if (req.method === 'GET' && url.pathname === '/status') {
    const orderId = url.searchParams.get('order') || '';
    const sig = url.searchParams.get('sig') || '';
    let expected = '';
    try { expected = signOrder(orderId); } catch {}
    if (!safeEqualHex(sig, expected)) return json(res, 403, { paid: false });
    try {
      const order = await retrieveOrder(orderId);
      return json(res, 200, { paid: orderPaidAndCorrect(order), state: String(order.state || '') });
    } catch (e) {
      console.error('status_error', e.message);
      return json(res, 502, { paid: false, error: 'verification_failed' });
    }
  }

  if (req.method === 'GET' && url.pathname === '/free-guide/usa') {
    try {
      const pdf = decryptFreeGuide();
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Atlas-Exit-Guide-Etats-Unis-Edition-15.0.pdf"',
        'Content-Length': pdf.length,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, noarchive'
      });
      return res.end(pdf);
    } catch (e) {
      console.error('free_download_error', e.message);
      return html(res, 503, '<h1>Guide momentanément indisponible.</h1><p>Réessayez dans quelques instants.</p>');
    }
  }

  if (req.method === 'GET' && url.pathname === '/download') {
    const orderId = url.searchParams.get('order') || '';
    const sig = url.searchParams.get('sig') || '';
    let expected = '';
    try { expected = signOrder(orderId); } catch {}
    if (!safeEqualHex(sig, expected)) return html(res, 403, '<h1>Lien de téléchargement invalide.</h1>');
    try {
      const order = await retrieveOrder(orderId);
      if (!orderPaidAndCorrect(order)) return html(res, 402, '<h1>Paiement non confirmé.</h1><p>Le guide ne peut pas encore être téléchargé.</p>');
      const pdf = decryptGuide();
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Atlas-Exit-Guide-Etats-Unis-Edition-2.0.pdf"',
        'Content-Length': pdf.length,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff'
      });
      return res.end(pdf);
    } catch (e) {
      console.error('download_error', e.message);
      return html(res, 502, '<h1>Livraison momentanément indisponible.</h1><p>Le paiement n est pas perdu. Réessayez dans quelques instants.</p>');
    }
  }

  return json(res, 404, { error: 'not_found' }, origin);
});

async function probeRevolutAuth() {
  try {
    await revolutFetch('https://merchant.revolut.com/api/orders?limit=1', {
      method: 'GET', headers: revolutHeaders(false)
    });
    console.log('Revolut Merchant API auth probe: OK');
  } catch (e) {
    const status = e && e.status ? ` HTTP ${e.status}` : '';
    console.error(`Revolut Merchant API auth probe: FAILED${status}`);
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Atlas delivery listening on ${PORT} - guide edition ${GUIDE_EDITION}`);
  probeRevolutAuth();
});
