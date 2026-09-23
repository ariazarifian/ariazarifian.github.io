const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

const PRODUCT_SHA = process.env.ATLAS_PRODUCT_SHA || 'abafbe9ec7777b65f68c39ae6fab024be25abaae';
const BASE_URL = process.env.ATLAS_BASE_URL || 'http://127.0.0.1:8000/atlas-exit/index.html';
const report = { productSha: PRODUCT_SHA, viewports: [], errors: [] };

function sameOrigin(url) {
  return new globalThis.URL(url).origin === new globalThis.URL(BASE_URL).origin;
}

async function selectCountry(page, searchText, id, panelSelector) {
  await page.locator('#countrySearch').fill(searchText);
  await page.waitForTimeout(170);
  const row = page.locator(`[data-country="${id}"]`).first();
  await row.waitFor({ state: 'attached', timeout: 10000 });
  await row.evaluate((el) => el.click());
  await page.waitForSelector(panelSelector, { timeout: 10000 });
  return page.locator(panelSelector);
}

async function assertNoOverflow(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'page horizontal overflow');
  assert.equal(await page.locator('#inspector').evaluate((el) => el.scrollWidth <= el.clientWidth + 1), true, 'Inspector horizontal overflow');
}

async function assertProgressiveDisclosure(panel) {
  assert.equal(await panel.locator('[data-evidence-field]').count(), 8, 'normalized country must expose 8 evidence fields');
  assert.equal(await panel.getAttribute('open'), null, 'normalized evidence details must be closed by default');
  const summary = panel.locator(':scope > summary');
  assert.equal(await summary.count(), 1, 'normalized evidence details needs an explicit disclosure summary');
  await summary.click();
  assert.notEqual(await panel.getAttribute('open'), null, 'normalized evidence details must open on explicit disclosure');
  const bodyDisplays = await panel.locator('.atlas-evidence__row > p').evaluateAll((els) => els.map((el) => getComputedStyle(el).display));
  assert.ok(bodyDisplays.every((v) => v === 'none'), 'full evidence summaries must remain progressively disclosed');
  const sourceGroups = panel.locator('.atlas-evidence__source');
  if (await sourceGroups.count()) {
    assert.ok((await sourceGroups.evaluateAll((els) => els.map((el) => el.hasAttribute('open')))).every((v) => v === false), 'source groups must be closed by default');
    const first = sourceGroups.first();
    await first.locator('summary').click();
    assert.ok(await first.locator('a.detail-source').count() >= 1, 'source disclosure must expose at least one locator');
    assert.equal(await first.locator('a.detail-source').first().isVisible(), true, 'source locator must be visible after disclosure');
  }
}

async function assertShellSemantics(page) {
  assert.equal(await page.locator('#countrySearch').count(), 1, 'search control missing');
  assert.equal(await page.locator('#inspector').count(), 1, 'Inspector missing');
  assert.equal(await page.locator('[data-layer="tax"]').count(), 1, 'tax layer missing');
  assert.equal(await page.locator('[data-layer="stability"]').count(), 1, 'stability layer missing');
  assert.equal(await page.locator('[data-layer="conflict"]').count(), 1, 'conflict layer missing');
  assert.notEqual(await page.locator('[data-layer="stability"]').getAttribute('data-layer'), await page.locator('[data-layer="conflict"]').getAttribute('data-layer'), 'stability and conflict layers must remain distinct');
  assert.equal(await page.locator('#openCompare').count(), 1, 'compare control missing');
  assert.equal(await page.locator('#resetFilters').count(), 1, 'reset filters control missing');
  assert.equal(await page.locator('#zoomIn').count(), 1, 'zoom-in control missing');
  assert.equal(await page.locator('#zoomOut').count(), 1, 'zoom-out control missing');
}

async function assertFunnelPreservation(ctx) {
  const pages = [
    ['offres.html', ['a[href*="free-guide/usa"]', 'script[src*="atlas-events.js"]']],
    ['parcours-usa.html', ['script[src*="atlas-events.js"]']],
    ['accompagnement.html', ['script[src*="atlas-events.js"]']]
  ];
  for (const [path, selectors] of pages) {
    const p = await ctx.newPage();
    const local = [];
    p.on('pageerror', (e) => local.push(String(e)));
    p.on('requestfailed', (r) => { if (sameOrigin(r.url())) local.push(`requestfailed:${r.url()}`); });
    await p.goto(new globalThis.URL(path, BASE_URL).href, { waitUntil: 'domcontentloaded' });
    for (const selector of selectors) assert.ok(await p.locator(selector).count() >= 1, `${path} missing semantic marker ${selector}`);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${path} horizontal overflow`);
    assert.deepEqual(local, [], `${path} same-origin/page errors`);
    await p.close();
  }
  const eventJs = await (await ctx.request.get(new globalThis.URL('atlas-events.js', BASE_URL).href)).text();
  assert.match(eventJs, /qualified_project/, 'QEP qualified_project event marker missing');
  const roadmapJs = await (await ctx.request.get(new globalThis.URL('parcours-usa.js', BASE_URL).href)).text();
  assert.match(roadmapJs, /QEP_DEDUPE_KEY/, 'Roadmap QEP dedupe marker missing');
  const sitemap = await (await ctx.request.get(new globalThis.URL('sitemap.xml', BASE_URL).href)).text();
  assert.match(sitemap, /https:\/\/atlas-expat\.fr\/parcours-usa\.html/, 'D1R-17 canonical Roadmap sitemap entry missing');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const vp of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 }
  ]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(`pageerror:${e}`));
    page.on('console', (m) => {
      if (m.type() === 'error' && !/umami|ERR_FAILED|Failed to load resource/i.test(m.text())) errs.push(`console:${m.text()}`);
    });
    page.on('requestfailed', (r) => { if (sameOrigin(r.url())) errs.push(`requestfailed:${r.url()}`); });
    page.on('response', (r) => { if (sameOrigin(r.url()) && r.status() >= 400) errs.push(`http${r.status()}:${r.url()}`); });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.AtlasExplorer?.ready?.(), null, { timeout: 15000 });
    await assertShellSemantics(page);
    await assertNoOverflow(page);

    if (vp.name === 'mobile') {
      await page.locator('#mobileFilters').click();
      assert.equal(await page.locator('#mobileFilters').getAttribute('aria-expanded'), 'true', 'mobile filters must expand');
    }

    // Germany: normalized evidence, sources, save and semantic data contract.
    let panel = await selectCountry(page, 'Allemagne', 'DEU', '[data-atlas-germany-evidence][data-country="DEU"]');
    assert.equal(await page.evaluate(() => window.ATLAS_COUNTRY_EVIDENCE_GERMANY?.validation?.ok === true), true, 'Germany evidence validation must be true');
    assert.equal(await page.evaluate(() => window.AtlasExplorer.getCountries().find((c) => c.id === 'DEU')?.tax === null), true, 'Germany must not be flattened to a scalar tax value');
    assert.ok(await panel.locator('a.detail-source').count() >= 8, 'Germany must retain source locators');
    await assertProgressiveDisclosure(panel);
    await assertNoOverflow(page);
    await page.locator('[data-save="DEU"]').click();
    assert.equal(await page.locator('#savedCount').textContent(), '1', 'Germany save regression');

    // UK regression: normalized evidence + save.
    panel = await selectCountry(page, 'Royaume-Uni', 'GBR', '[data-atlas-united-kingdom-evidence][data-country="GBR"]');
    assert.ok(await panel.locator('a.detail-source').count() >= 8, 'UK must retain source locators');
    await assertNoOverflow(page);
    await page.locator('[data-save="GBR"]').click();
    assert.equal(await page.locator('#savedCount').textContent(), '2', 'UK save regression');

    // Canada readability regression: concise default + disclosure + no overflow.
    panel = await selectCountry(page, 'Canada', 'CAN', '[data-atlas-canada-evidence][data-country="CAN"]');
    await assertProgressiveDisclosure(panel);
    await assertNoOverflow(page);

    // Conflict layer semantics and freshness regressions without depending on incidental card copy.
    await page.locator('[data-layer="conflict"]').evaluate((el) => el.click());
    await page.waitForFunction(() => document.querySelector('[data-layer="conflict"]')?.getAttribute('aria-pressed') === 'true');
    await selectCountry(page, 'Japon', 'JPN', '[data-conflict-panel]');
    await page.waitForFunction(() => /17:54/.test(document.querySelector('[data-conflict-panel]')?.textContent || ''), null, { timeout: 10000 });
    let conflict = await page.locator('[data-conflict-panel]').innerText();
    assert.match(conflict, /590\s*km/i, 'Japan later-launch distance context missing');
    assert.match(conflict, /70\s*km/i, 'Japan later-launch altitude context missing');
    await selectCountry(page, 'Thaïlande', 'THA', '[data-conflict-panel]');
    await page.waitForFunction(() => /Pattani|Cambodge/i.test(document.querySelector('[data-conflict-panel]')?.textContent || ''), null, { timeout: 10000 });
    conflict = await page.locator('[data-conflict-panel]').innerText();
    assert.match(conflict, /Cambodge|Pattani/i, 'Thailand bounded conflict geography missing');

    // Search/filter/zoom/compare interactions.
    await page.locator('[data-layer="tax"]').evaluate((el) => el.click());
    await page.locator('#countrySearch').fill('Allemagne');
    await page.waitForTimeout(150);
    assert.equal(await page.locator('[data-country="DEU"]').count(), 1, 'Germany search regression');
    await page.locator('#countrySearch').fill('');
    await page.locator('[data-region="Europe"]').evaluate((el) => el.click());
    await page.waitForTimeout(120);
    assert.ok(Number((await page.locator('#resultCount').textContent()).match(/\d+/)?.[0] || 0) > 0, 'Europe filter must retain results');
    await page.locator('#resetFilters').evaluate((el) => el.click());
    const z0 = await page.locator('#zoomValue').textContent();
    await page.locator('#zoomOut').evaluate((el) => el.click());
    await page.waitForTimeout(300);
    const z1 = await page.locator('#zoomValue').textContent();
    assert.notEqual(z1, z0, 'zoom out regression');
    await page.locator('#zoomIn').evaluate((el) => el.click());
    await page.waitForTimeout(300);
    const z2 = await page.locator('#zoomValue').textContent();
    assert.notEqual(z2, z1, 'zoom in regression');
    await page.locator('#openCompare').evaluate((el) => el.click());
    await page.locator('#compareDialog').waitFor({ state: 'visible', timeout: 10000 });
    assert.ok(await page.locator('#compareTable [data-atlas-normalized="DEU"]').count() >= 5, 'Germany normalized compare cells missing');
    assert.ok(await page.locator('#compareTable [data-atlas-normalized="GBR"]').count() >= 5, 'UK normalized compare cells missing');
    await page.locator('#compareDialog [data-close]').evaluate((el) => el.click());
    await assertNoOverflow(page);

    await assertFunnelPreservation(ctx);
    assert.deepEqual(errs, [], 'Product console/network/page errors');

    fs.mkdirSync('qa-artifacts', { recursive: true });
    await page.screenshot({ path: `qa-artifacts/pex-qa1-${vp.name}.png`, fullPage: true });
    report.viewports.push({ ...vp, germany: true, uk: true, canadaReadability: true, japanConflict: true, thailandConflict: true, interactions: true });
    report.errors.push(...errs.map((e) => `${vp.name}:${e}`));
    await ctx.close();
  }
  await browser.close();
  fs.mkdirSync('qa-artifacts', { recursive: true });
  fs.writeFileSync('qa-artifacts/report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
