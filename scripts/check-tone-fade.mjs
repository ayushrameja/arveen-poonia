import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const url = process.argv[2] || 'http://localhost:4321/';
const directory = new URL('../reports/performance/', import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('.hero')?.dataset.running === 'true');
  const jump = async (selector, tone) => {
    await page.evaluate(selector => window.scrollTo({ top: document.querySelector(selector).getBoundingClientRect().top + scrollY, behavior: 'instant' }), selector);
    await page.waitForFunction(tone => document.documentElement.dataset.paperTone === tone, {}, tone);
  };
  const opacity = pseudo => page.$eval('.tone-backdrop--page', (el, pseudo) => Number(getComputedStyle(el, pseudo).opacity), pseudo);
  await jump('.watch-section', 'saffron');
  assert.equal(await page.$eval('.watch-section', el => getComputedStyle(el).borderTopWidth), '0px', 'No section border may expose a seam during the background fade');
  await page.waitForFunction(() => {
    const opacity = Number(getComputedStyle(document.querySelector('.watch-section'), '::before').opacity);
    return opacity > 0 && opacity < 1;
  });
  await wait(750);
  assert.equal(await page.$eval('.watch-section', el => Number(getComputedStyle(el, '::before').opacity)), 1);
  assert.equal(await opacity('::before'), 1, 'The exposed page canvas shares the yellow fade');
  assert.equal(await page.$eval('.hero', el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'The hero tail must not cover the shared canvas');
  // Reproduce the boundary view: the next section is visible, but has not
  // crossed the 35% line that starts the shared fade back to light.
  await page.evaluate(() => window.scrollTo({ top: document.querySelector('.home-story').getBoundingClientRect().top + scrollY - innerHeight * .75, behavior: 'instant' }));
  await wait(100);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.paperTone), 'saffron');
  assert.equal(await page.$eval('.home-story', el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)', 'The entering story must reveal the shared yellow canvas');
  await page.screenshot({ path: new URL('tone-fade-story-boundary.png', directory).pathname });
  await jump('.home-story', 'light');
  assert.equal(await page.$eval('.home-story', el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
  await wait(750);
  assert.equal(await page.$eval('.watch-section', el => Number(getComputedStyle(el, '::before').opacity)), 0);
  assert.equal(await opacity('::before'), 0);
  for (const [selector, tone, pseudo, target] of [
    ['[data-closing-tone]', 'evening', '::after', 1],
    ['.hero', 'light', '::after', 0],
  ]) {
    await jump(selector, tone);
    // Wait for an actual intermediate frame, rather than assuming browser
    // scheduling starts the transition within a fixed wall-clock delay.
    const sample = await page.waitForFunction(pseudo => {
      const value = Number(getComputedStyle(document.querySelector('.tone-backdrop--page'), pseudo).opacity);
      return value > .02 && value < .98 ? value : false;
    }, { timeout: 2000 }, pseudo);
    const midway = await sample.jsonValue();
    await sample.dispose();
    assert.ok(midway > .02 && midway < .98, `Expected an in-progress ${tone} fade; got ${midway}`);
    if (tone !== 'light') {
      const headerOpacity = await page.$eval('.site-header .tone-backdrop', (el, pseudo) => Number(getComputedStyle(el, pseudo).opacity), pseudo);
      assert.ok(Math.abs(headerOpacity - midway) < .08, 'Navbar fade stays synchronized');
    }
    await wait(700);
    assert.equal(await opacity(pseudo), target);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('home-evening')), tone === 'evening');
    if (tone !== 'light') await page.screenshot({ path: new URL(`tone-fade-${tone}.png`, directory).pathname });
    console.log(`${tone}: opacity ${midway.toFixed(2)} during fade, ${target} when settled`);
  }
  await jump('[data-closing-tone]', 'evening');
  await wait(120);
  await jump('.home-practice', 'light');
  await wait(800);
  assert.equal(await opacity('::after'), 0);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('home-evening')), false);
  await jump('[data-closing-tone]', 'evening');
  await wait(500);
  await jump('.home-practice', 'light');
  await wait(800);
  assert.equal(await opacity('::after'), 0);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('home-evening')), false);
  await jump('[data-closing-tone]', 'evening');
  await wait(120);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await wait(50);
  assert.equal(await opacity('::after'), 1);
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('home-evening')), true);
  await jump('.hero', 'light');
  assert.equal(await opacity('::after'), 0);
  assert.deepEqual(errors, []);
  console.log('Shared saffron story boundary, light fade, evening reversals, navbar sync and reduced motion passed.');
} finally { await browser.close(); }
