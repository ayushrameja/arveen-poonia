import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initClosingTone } from '../src/scripts/closing-tone.ts';

function fixture(t, initialOpening = 1200) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const positions = { opening: initialOpening, story: 4000, closing: 7000 };
  const makeElement = name => ({
    attributes: new Set(),
    getBoundingClientRect: () => ({ top: positions[name] }),
    setAttribute(key) { this.attributes.add(key); },
    removeAttribute(key) { this.attributes.delete(key); },
    toggleAttribute(key, on) { if (on) this.attributes.add(key); else this.attributes.delete(key); },
  });
  const opening = makeElement('opening');
  const story = makeElement('story');
  const closing = makeElement('closing');
  const classes = new Set();
  const root = {
    dataset: {}, scrollHeight: 9000,
    classList: {
      add: name => classes.add(name),
      contains: name => classes.has(name),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      toggle: (name, on) => on ? classes.add(name) : classes.delete(name),
    },
  };
  const document = new EventTarget();
  document.documentElement = root;
  const theme = { content: '#faf9f5' };
  document.querySelector = selector => ({
    '[data-closing-tone]': closing, '[data-video-stories]': opening,
    '.home-story': story, 'meta[name="theme-color"]': theme,
    '.tone-backdrop--page': {}, main: {},
  })[selector];
  const window = new EventTarget();
  window.innerHeight = 1000;
  const preference = new EventTarget();
  preference.matches = false;
  let queued;
  const observers = [];
  Object.assign(globalThis, {
    document, window,
    getComputedStyle: () => ({ opacity: '0' }),
    matchMedia: () => preference,
    requestAnimationFrame: callback => { queued = callback; return 1; },
    cancelAnimationFrame: () => { queued = undefined; },
    IntersectionObserver: class {
      constructor(callback) { observers.push(callback); }
      observe() {} disconnect() {}
    },
    ResizeObserver: class { observe() {} disconnect() {} },
  });
  initClosingTone();
  const flush = () => { const callback = queued; queued = undefined; callback?.(); };
  flush();
  const dispose = () => document.dispatchEvent(new Event('astro:before-swap'));
  t.after(dispose);
  return {
    opening, root, theme, dispose,
    move(next) { Object.assign(positions, next); observers.forEach(callback => callback()); flush(); },
  };
}

test('yellow enters with the video section and ends at the following story, in both directions', t => {
  const f = fixture(t);
  assert.equal(f.root.dataset.paperTone, 'light');
  assert.ok(!f.opening.attributes.has('data-tone-active'));
  f.move({ opening: 300 });
  assert.equal(f.root.dataset.paperTone, 'saffron');
  assert.ok(f.opening.attributes.has('data-tone-active'));
  assert.equal(f.theme.content, '#f4cd72');
  f.move({ opening: -2500, story: 300 });
  assert.equal(f.root.dataset.paperTone, 'light');
  assert.ok(!f.opening.attributes.has('data-tone-active'));
  f.move({ story: 500 });
  assert.equal(f.root.dataset.paperTone, 'saffron');
  f.move({ opening: 500, story: 4000 });
  assert.equal(f.root.dataset.paperTone, 'light');
});

test('a direct chapter entry starts yellow and disposing clears its local state', t => {
  const f = fixture(t, -100);
  assert.equal(f.root.dataset.paperTone, 'saffron');
  assert.ok(f.opening.attributes.has('data-tone-ready'));
  f.dispose();
  assert.ok(!f.opening.attributes.has('data-tone-ready'));
  assert.ok(!f.opening.attributes.has('data-tone-active'));
  f.move({ opening: 0 });
  assert.equal(f.root.dataset.paperTone, undefined);
});
