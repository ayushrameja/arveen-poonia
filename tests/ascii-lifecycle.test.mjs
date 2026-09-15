import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initKrishnaAscii } from '../src/scripts/krishna-ascii.ts';

// Exercise event sequences that must stop background work, including a late decode.
function fixture({ reduced = false, deferDecode = false, frameDecodes = [] } = {}) {
  const document = new EventTarget();
  document.hidden = false;
  const media = new EventTarget();
  media.matches = reduced;
  let observation;
  let disconnected = false;
  const attributes = new Map();
  const button = new EventTarget();
  button.setAttribute = (key, value) => attributes.set(key, value);
  const controls = { hidden: true };
  let finishDecode;
  const decoded = deferDecode ? new Promise(resolve => { finishDecode = resolve; }) : Promise.resolve();
  const elements = { '.ascii-texture': { decode: () => decoded }, '[data-pause]': button, '.art-controls': controls };
  const figure = { dataset: {}, querySelector: selector => elements[selector], querySelectorAll: () => frameDecodes.map(promise => ({ decode: () => promise })) };
  globalThis.document = document;
  globalThis.matchMedia = () => media;
  globalThis.IntersectionObserver = class {
    constructor(callback) { observation = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  };
  initKrishnaAscii(figure);
  return {
    figure, controls, attributes, button,
    visible(value) { observation([{ isIntersecting: value }]); },
    hidden(value) { document.hidden = value; document.dispatchEvent(new Event('visibilitychange')); },
    reduced(value) { media.matches = value; media.dispatchEvent(new Event('change')); },
    dispose() { document.dispatchEvent(new Event('astro:before-swap')); },
    get disconnected() { return disconnected; },
    finishDecode: () => finishDecode?.(),
  };
}

test('pause survives tab and viewport changes; motion preference always takes priority', async () => {
  const f = fixture();
  await Promise.resolve();
  f.visible(true);
  assert.equal(f.figure.dataset.running, 'true');
  f.hidden(true);
  assert.equal(f.figure.dataset.running, 'false');
  f.hidden(false);
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.attributes.get('aria-pressed'), 'true');
  f.visible(false); f.visible(true); f.hidden(true); f.hidden(false);
  assert.equal(f.figure.dataset.running, 'false');
  f.button.dispatchEvent(new Event('click'));
  assert.equal(f.figure.dataset.running, 'true');
  f.reduced(true);
  assert.equal(f.figure.dataset.running, 'false');
  assert.equal(f.controls.hidden, true);
  f.reduced(false);
  assert.equal(f.figure.dataset.running, 'true');
  f.visible(false);
  assert.equal(f.figure.dataset.running, 'false');
  f.dispose();
  assert.equal(f.disconnected, true);
});

test('portrait cycle waits for both images and never activates after failed decoding', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const f = fixture({ frameDecodes: [Promise.resolve(), pending] });
  await new Promise(setImmediate);
  assert.equal(f.figure.dataset.cycleReady, undefined);
  finish();
  await new Promise(setImmediate);
  assert.equal(f.figure.dataset.cycleReady, 'true');
  f.dispose();
  const failed = fixture({ frameDecodes: [Promise.resolve(), Promise.reject(new Error('image unavailable'))] });
  await new Promise(setImmediate);
  assert.equal(failed.figure.dataset.cycleReady, undefined);
  failed.dispose();
});

test('a single enhanced profile activates the cycle after decoding', async () => {
  const f = fixture({ frameDecodes: [Promise.resolve()] });
  f.visible(true);
  await new Promise(setImmediate);
  assert.equal(f.figure.dataset.cycleReady, 'true');
  assert.equal(f.figure.dataset.running, 'true');
  f.dispose();
});

test('late portrait image decoding cannot restart the cycle after disposal', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const f = fixture({ frameDecodes: [pending, pending] });
  f.dispose();
  finish();
  await new Promise(setImmediate);
  assert.equal(f.figure.dataset.cycleReady, undefined);
  assert.equal(f.figure.dataset.running, 'false');
});

test('reduced-motion first load is still, and late image decode cannot restart a disposed page', async () => {
  const f = fixture({ reduced: true, deferDecode: true });
  f.visible(true);
  assert.equal(f.figure.dataset.running, 'false');
  f.dispose();
  f.finishDecode();
  await Promise.resolve();
  assert.equal(f.figure.dataset.ready, undefined);
  assert.equal(f.controls.hidden, true);
  f.hidden(false); f.reduced(false);
  assert.equal(f.figure.dataset.running, 'false');
});
