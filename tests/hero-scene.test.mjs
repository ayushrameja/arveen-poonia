import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initHeroScene } from '../src/scripts/hero-scene.ts';

function fixture(t, { reduced = false, intro = false, frameDecodes = [Promise.resolve(), Promise.resolve()] } = {}) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const document = new EventTarget();
  document.hidden = false;
  document.documentElement = { classList: { contains: name => name === 'intro-active' && intro } };
  const media = new EventTarget();
  media.matches = reduced;
  let observation;
  let disconnected = false;
  function element(dataset = {}) {
    const el = new EventTarget();
    el.dataset = dataset;
    el.attributes = new Map();
    el.setAttribute = (key, value) => el.attributes.set(key, value);
    return el;
  }
  const button = element();
  const controls = { hidden: true };
  const names = ['arveen', 'radha-krishna'];
  const panels = names.map(scenePanel => element({ scenePanel }));
  const frames = frameDecodes.map((promise, index) => ({ decode: () => promise, closest: () => panels[index] }));
  const copies = names.map(copyScene => element({ copyScene }));
  const hero = {
    setAttribute: (key, value) => { hero[key] = value; },
    dataset: { scene: 'arveen' },
    querySelector: selector => ({ '[data-pause]': button, '.art-controls': controls })[selector],
    querySelectorAll: selector => ({ '[data-scene-panel]': panels, '[data-portrait-frame]': frames, '[data-copy-scene]': copies })[selector],
  };
  globalThis.document = document;
  globalThis.matchMedia = () => media;
  globalThis.IntersectionObserver = class {
    constructor(callback) { observation = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  };
  initHeroScene(hero);
  const dispose = () => document.dispatchEvent(new Event('astro:before-swap'));
  t.after(dispose);
  return {
    hero, controls, button, panels, copies, dispose,
    finishIntro() { intro = false; document.dispatchEvent(new Event('intro:complete')); },
    visible(value, ratio = value ? 1 : 0) { observation([{ isIntersecting: value, intersectionRatio: ratio }]); },
    scroll() { document.dispatchEvent(new Event('scroll')); },
    hidden(value) { document.hidden = value; document.dispatchEvent(new Event('visibilitychange')); },
    reduced(value) { media.matches = value; media.dispatchEvent(new Event('change')); },
    get disconnected() { return disconnected; },
  };
}
const decoded = () => new Promise(setImmediate);
const click = element => element.dispatchEvent(new Event('click'));

test('automatic switching synchronizes the hero, portrait and accessible selection', async t => {
  const f = fixture(t);
  await decoded(); f.visible(true);
  t.mock.timers.tick(9999);
  assert.equal(f.hero.dataset.scene, 'arveen');
  t.mock.timers.tick(1);
  assert.equal(f.hero.dataset.scene, 'radha-krishna');
  assert.equal(f.copies[1].attributes.get('aria-hidden'), 'false');
  assert.equal(f.copies[0].attributes.get('aria-hidden'), 'true');
  assert.equal(f.hero['aria-labelledby'], 'inspiration-heading');
  assert.equal(f.panels[0].attributes.get('aria-hidden'), 'true');
  t.mock.timers.tick(10000);
  assert.equal(f.hero.dataset.scene, 'arveen');
});

test('pause holds the current scene until playback resumes', async t => {
  const f = fixture(t);
  await decoded(); f.visible(true);
  t.mock.timers.tick(10000);
  click(f.button);
  assert.equal(f.hero.dataset.scene, 'radha-krishna');
  assert.equal(f.button.attributes.get('aria-label'), 'Resume artwork animation');
  t.mock.timers.tick(30000);
  assert.equal(f.hero.dataset.scene, 'radha-krishna');
  click(f.button); t.mock.timers.tick(10000);
  assert.equal(f.hero.dataset.scene, 'arveen');
});

test('pause persists across viewport, tab visibility and motion preference changes', async t => {
  const f = fixture(t);
  await decoded(); f.visible(true);
  assert.equal(f.hero.dataset.running, 'true');
  f.hidden(true); t.mock.timers.tick(10000);
  assert.equal(f.hero.dataset.scene, 'arveen');
  f.hidden(false); click(f.button);
  f.visible(false); f.visible(true); f.hidden(true); f.hidden(false);
  assert.equal(f.hero.dataset.running, 'false');
  click(f.button);
  f.reduced(true);
  assert.equal(f.hero.dataset.running, 'false');
  assert.equal(f.controls.hidden, true);
  assert.equal(f.button.hidden, true);
  f.reduced(false);
  assert.equal(f.hero.dataset.running, 'true');
  f.visible(false); t.mock.timers.tick(10000);
  assert.equal(f.hero.dataset.scene, 'arveen');
});

test('reduced motion keeps the first portrait still and hides animation controls', async t => {
  const f = fixture(t, { reduced: true });
  await decoded(); f.visible(true);
  assert.equal(f.controls.hidden, true);
  t.mock.timers.tick(20000);
  assert.equal(f.hero.dataset.scene, 'arveen');
  assert.equal(f.hero.dataset.running, 'false');
});

test('a failed first image waits for a slow healthy fallback and never cycles', async t => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const f = fixture(t, { frameDecodes: [Promise.reject(new Error('image unavailable')), pending] });
  f.visible(true); await decoded();
  assert.equal(f.controls.hidden, true);
  finish(); await decoded();
  assert.equal(f.hero.dataset.scene, 'radha-krishna');
  assert.equal(f.hero.dataset.running, 'false');
  assert.equal(f.controls.hidden, true);
});

test('late decoding and events cannot restart a disposed page', async t => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const f = fixture(t, { frameDecodes: [pending, pending] });
  f.visible(true); f.dispose(); finish(); await decoded();
  f.hidden(false); f.reduced(false); t.mock.timers.tick(20000);
  assert.equal(f.hero.dataset.cycleReady, undefined);
  assert.equal(f.hero.dataset.running, 'false');
  assert.equal(f.controls.hidden, true);
  assert.equal(f.disconnected, true);
});

test('the introduction holds Arveen until the full hero entrance has finished', async t => {
  const f = fixture(t, { intro: true });
  await decoded(); f.visible(true);
  t.mock.timers.tick(20000);
  assert.equal(f.hero.dataset.scene, 'arveen');
  assert.equal(f.hero.dataset.running, 'false');
  f.finishIntro();
  assert.equal(f.hero.dataset.running, 'true');
  t.mock.timers.tick(9999);
  assert.equal(f.hero.dataset.scene, 'arveen');
  t.mock.timers.tick(1);
  assert.equal(f.hero.dataset.scene, 'radha-krishna');
});

test('a partially visible hero stays quiet and resumes when mostly visible', async t => {
  const f = fixture(t);
  await decoded(); f.visible(true, .69);
  assert.equal(f.hero.dataset.running, 'false');
  t.mock.timers.tick(20000);
  assert.equal(f.hero.dataset.scene, 'arveen');
  f.visible(true, .8);
  assert.equal(f.hero.dataset.running, 'true');
});

test('scrolling suspends effects until settling and never overrides manual pause', async t => {
  const f = fixture(t);
  await decoded(); f.visible(true);
  f.scroll();
  assert.equal(f.hero.dataset.running, 'false');
  t.mock.timers.tick(120); f.scroll(); t.mock.timers.tick(120);
  assert.equal(f.hero.dataset.running, 'false');
  t.mock.timers.tick(60);
  assert.equal(f.hero.dataset.running, 'true');
  f.scroll(); click(f.button); t.mock.timers.tick(180);
  assert.equal(f.hero.dataset.running, 'false');
  assert.equal(f.button.attributes.get('aria-pressed'), 'true');
});

test('a pending scroll resume cannot restart a disposed hero', async t => {
  const f = fixture(t);
  await decoded(); f.visible(true); f.scroll(); f.dispose();
  t.mock.timers.tick(30000);
  assert.equal(f.hero.dataset.running, 'false');
  assert.equal(f.hero.dataset.scene, 'arveen');
});
