import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] || 'http://localhost:4321/';
const directory = new URL('../reports/performance/', import.meta.url);
await mkdir(directory, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const [width, height] of [[1440, 1000], [1984, 1248], [390, 844], [320, 740]]) {
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => document.querySelector('.hero')?.dataset.running === 'true');
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('.liquid-drift')].every(el => el.getAnimations().some(a => a.playState === 'running'))), true, 'Both colour textures must drift while playing');
    await page.locator('[data-pause]').click();
    await page.waitForFunction(() => document.querySelector('.hero')?.dataset.running === 'false');
    // Freeze a representative ripple, including visible lettering, for repeatable QA.
    await page.evaluate(() => {
      document.querySelectorAll('.mantra-ring').forEach(element => element.getAnimations().forEach(animation => {
        animation.currentTime = 3000;
      }));
    });
    const geometry = await page.evaluate(() => {
      const center = element => {
        const r = element.getBoundingClientRect();
        return [r.x + r.width / 2, r.y + r.height / 2];
      };
      const portrait = center(document.querySelector('.portrait-position'));
      const rings = [...document.querySelectorAll('.mantra-ring-art')].filter(element => element.checkVisibility());
      const centers = [center(document.querySelector('.devotion-orbit')), ...rings.map(center)];
      return {
        maxCenterError: Math.max(...centers.flatMap(point => point.map((value, i) => Math.abs(value - portrait[i])))),
        overflow: document.documentElement.scrollWidth > innerWidth,
        border: getComputedStyle(document.querySelector('.site-header')).borderBottomWidth,
        visibleRings: rings.length,
        paused: [...document.querySelectorAll('.mantra-ring, .liquid-drift')].every(el => getComputedStyle(el).animationPlayState === 'paused'),
      };
    });
    assert.ok(geometry.maxCenterError < .6, JSON.stringify({ width, ...geometry }));
    assert.equal(geometry.overflow, false);
    assert.equal(geometry.border, '0px');
    assert.equal(await page.$eval('.site-header', el => el.dataset.atTop), 'true');
    assert.equal(await page.$eval('.site-header', el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
    assert.notEqual(await page.$eval('.site-header', el => getComputedStyle(el, '::before').backdropFilter), 'none');
    assert.ok(await page.$eval('.mantra-field', el => el.getBoundingClientRect().top) < 2, 'Rings extend behind the navbar');
    assert.equal(geometry.visibleRings, width <= 700 ? 3 : 6);
    assert.equal(geometry.paused, true);
    await page.screenshot({ path: new URL(`hero-aligned-${width}.png`, directory).pathname });
    console.log(JSON.stringify({ width, ...geometry }));
  }
  // A paused scene must remain still, including texture drift and ripple opacity.
  const times = () => page.evaluate(() => [...document.querySelectorAll('.mantra-ring, .liquid-drift')]
    .flatMap(el => el.getAnimations().map(a => a.currentTime)));
  const before = await times();
  await pause(250);
  assert.deepEqual(await times(), before);
  await page.locator('[data-pause]').click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForFunction(() => document.querySelector('.hero').dataset.running === 'false');
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('.mantra-ring, .liquid-drift')]
    .every(el => getComputedStyle(el).animationPlayState === 'paused')), true);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url, { waitUntil: 'networkidle0' });
  assert.equal(await page.evaluate(() => [...document.querySelectorAll('.mantra-ring, .liquid-drift')]
    .every(el => el.getAnimations().length === 0)), true);
  assert.equal(await page.$eval('.art-controls', el => el.hidden), true);
  await page.screenshot({ path: new URL('hero-aligned-reduced.png', directory).pathname });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.querySelector('.hero')?.dataset.running === 'true');
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('lenis')), false);
  const jump = async (selector, expectedTone) => {
    await page.evaluate(selector => {
      const top = document.querySelector(selector).getBoundingClientRect().top + scrollY;
      window.scrollTo({ top, behavior: 'instant' });
    }, selector);
    await page.waitForFunction(tone => {
      const root = document.documentElement;
      return (root.classList.contains('home-evening') ? 'evening'
        : root.classList.contains('home-saffron') ? 'saffron' : 'light') === tone;
    }, {}, expectedTone);
  };
  // Instant jumps deliberately skip whole sections to exercise observer boundaries.
  await jump('.home-story', 'saffron');
  await jump('.home-practice', 'light');
  await jump('[data-closing-tone]', 'evening');
  await jump('.hero', 'light');
  await jump('.watch-section', 'saffron');
  await page.waitForFunction(() => document.querySelector('.site-header')?.dataset.atTop === 'false');
  assert.equal(await page.$eval('.site-header', el => getComputedStyle(el, '::before').content), 'none');
  assert.equal(await page.$eval('.site-header', el => getComputedStyle(el, '::before').backdropFilter), 'none');
  assert.notEqual(await page.$eval('.site-header', el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
  await page.waitForFunction(() => [...document.querySelectorAll('.watch-grid [data-reveal]')]
    .filter(el => { const rect = el.getBoundingClientRect(); return rect.top < innerHeight - 24 && rect.bottom > 0; })
    .every(el => el.classList.contains('is-inview')));
  await page.screenshot({ path: new URL('native-scroll-second-section.png', directory).pathname });
  await page.goto(new URL('#explore', url).href, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => document.documentElement.classList.contains('home-saffron'));
  assert.equal(await page.$('.welcome-screen'), null);
  console.log('Native scrolling, one-time reveals, chapter jumps and anchor navigation passed.');
  await jump('.hero', 'light');
  await page.waitForFunction(() => document.querySelector('.site-header')?.dataset.atTop === 'true');
  assert.deepEqual(errors, []);
  console.log('Pause, offscreen, reduced motion and runtime error checks passed.');
} finally {
  await browser.close();
}
