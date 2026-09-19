import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

// Run against `pnpm preview` to exercise the production router and script bundles.
const base = process.argv[2] || 'http://localhost:4321';
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});

async function fixture({ fallback = false, reduced = false, blockedStorage = false } = {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 1280, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);
  await page.evaluateOnNewDocument((fallback, blockedStorage) => {
    window.navigationChecks = { loads: 0, welcomes: 0, animations: [], token: Math.random() };
    const checks = window.navigationChecks;
    document.addEventListener('astro:page-load', () => { checks.loads++; });
    document.addEventListener('intro:complete', () => { checks.welcomes++; });
    document.addEventListener('animationstart', event => {
      if (event.animationName.startsWith('route-')) checks.animations.push(event.animationName);
    });
    if (fallback) document.startViewTransition = undefined;
    else {
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (...args) => {
        const transition = start(...args);
        transition.ready.then(() => {
          checks.animations.push(...document.getAnimations().map(animation => animation.animationName).filter(Boolean));
        }).catch(() => {});
        return transition;
      };
    }
    if (blockedStorage) Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage unavailable'); } });
  }, fallback, blockedStorage);
  return { page, errors };
}
async function move(page, selector, path) {
  const before = await page.evaluate(() => ({ ...window.navigationChecks }));
  await page.click(selector);
  await page.waitForFunction((count, path) => window.navigationChecks.loads > count && location.pathname === path, {}, before.loads, path);
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-astro-transition'));
  assert.equal(await page.evaluate(() => window.navigationChecks.token), before.token, 'navigation should keep the same document');
}
async function homeReady(page) {
  await page.waitForFunction(() => !document.documentElement.classList.contains('intro-active') && document.querySelector('.hero')?.dataset.cycleReady === 'true');
  assert.equal(await page.$('.welcome-screen'), null);
  assert.equal(await page.$eval('[data-practice-ritual]', el => el.hasAttribute('data-enhanced')), true);
  assert.equal(await page.$eval('[data-video-stories]', el => el.hasAttribute('data-stories-ready')), true);
}

try {
  const { page, errors } = await fixture();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.documentElement.classList.contains('intro-active'));
  await page.waitForFunction(() => document.querySelector('[data-scene-panel="arveen"] img')?.naturalWidth > 0);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('intro-active')), true, 'portrait loads behind the welcome');
  await homeReady(page);
  assert.equal(await page.evaluate(() => window.navigationChecks.welcomes), 1);
  await move(page, '.header-nav a[href="/about/"]', '/about/');
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('home-tone-enabled')), false);
  assert.equal(await page.$eval('.header-crumb', el => el.textContent), 'My Journey');
  await page.click('.journey-index a[href="#practice"]');
  await page.waitForFunction(() => location.hash === '#practice');
  await move(page, '#practice', '/yoga/');
  await move(page, '.header-nav a[href="/explore/"]', '/explore/');
  await page.click('[data-filter="Bhakti"]');
  assert.match(await page.$eval('[data-result-count]', el => el.textContent), /Bhakti/);
  await move(page, '.header-identity .brand', '/');
  await homeReady(page);
  assert.equal(await page.evaluate(() => window.navigationChecks.welcomes), 1, 'returning home must not replay the welcome');
  await move(page, '.header-nav a[href="/explore/"]', '/explore/');
  await page.type('#video-search', 'no-such-video');
  assert.equal(await page.$eval('[data-empty]', el => el.hidden), false, 'search reinitializes on repeat visits');
  await page.click('[data-reset]');
  assert.equal(await page.$eval('[data-empty]', el => el.hidden), true);
  const loads = await page.evaluate(() => window.navigationChecks.loads);
  await page.goBack();
  await page.waitForFunction(count => window.navigationChecks.loads > count && location.pathname === '/', {}, loads);
  await homeReady(page);
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-astro-transition'));
  const animations = await page.evaluate(() => window.navigationChecks.animations);
  for (const name of ['route-exit', 'route-enter', 'route-exit-back', 'route-enter-back']) assert.ok(animations.includes(name), `${name} should run`);
  await page.reload({ waitUntil: 'networkidle0' });
  await homeReady(page);
  assert.equal(await page.evaluate(() => window.navigationChecks.welcomes), 0, 'reload must preserve the session flag');
  assert.deepEqual(errors, []);
  console.log('PASS: first welcome, background portrait loading, all four route animations, history, repeated page controls, reload.');
  await page.close();

  for (const options of [{ fallback: true }, { reduced: true }, { blockedStorage: true }]) {
    const { page, errors } = await fixture(options);
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${base}/about/`, { waitUntil: 'networkidle0' });
    await move(page, '.header-identity .brand', '/');
    if (!options.reduced) {
      await page.waitForFunction(() => document.documentElement.classList.contains('intro-active'));
      await page.keyboard.press('Escape');
    }
    await homeReady(page);
    await move(page, '.hero-actions a[href="/about/"]', '/about/');
    await move(page, '.header-identity .brand', '/');
    await homeReady(page);
    assert.equal(await page.evaluate(() => window.navigationChecks.welcomes), options.reduced ? 0 : 1);
    if (options.fallback) {
      const animations = await page.evaluate(() => window.navigationChecks.animations);
      assert.ok(animations.includes('route-exit') && animations.includes('route-enter'));
    }
    if (options.reduced) assert.deepEqual(await page.evaluate(() => window.navigationChecks.animations.filter(name => name.startsWith('route-'))), []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log(`PASS: mobile ${Object.keys(options)[0]}, direct inner-page entry, first home visit, return home.`);
    await page.close();
  }

  // A stalled image must not turn the welcome into an indefinite loading screen.
  const stalled = await fixture();
  const requests = [];
  await stalled.page.setRequestInterception(true);
  stalled.page.on('request', request => {
    if (request.url().includes('/images/hero-arveen-portrait-')) requests.push(request);
    else void request.continue();
  });
  await stalled.page.goto(base, { waitUntil: 'domcontentloaded' });
  await stalled.page.waitForFunction(() => document.documentElement.classList.contains('intro-active'));
  await stalled.page.waitForFunction(() => !document.documentElement.classList.contains('intro-active'), { timeout: 9000 });
  assert.ok(requests.length, 'the portrait request is actually stalled');
  assert.equal(await stalled.page.$eval('#main-content', el => el.inert), false);
  assert.equal(await stalled.page.$('.welcome-screen'), null);
  await Promise.all(requests.map(request => request.abort()));
  assert.deepEqual(stalled.errors, []);
  await stalled.page.close();
  console.log('PASS: stalled portrait has a bounded wait; content and navigation are unlocked.');
} finally {
  await browser.close();
}
