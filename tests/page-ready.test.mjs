import { test } from 'node:test';
import assert from 'node:assert/strict';
import { onPageReady } from '../src/scripts/page-ready.ts';

test('initialization starts before image load and runs once for each new route body', t => {
  const document = new EventTarget();
  document.body = {};
  document.readyState = 'interactive';
  globalThis.document = document;
  t.after(() => { delete globalThis.document; });
  let starts = 0;
  const stop = onPageReady(() => starts++);
  assert.equal(starts, 1);
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(starts, 1, 'the delayed window load must not restart the page');
  document.body = {};
  document.dispatchEvent(new Event('astro:page-load'));
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(starts, 2);
  stop();
  document.body = {};
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(starts, 2);
});

test('early modules wait for parsed HTML, but do not wait for media', t => {
  const document = new EventTarget();
  document.readyState = 'loading';
  globalThis.document = document;
  t.after(() => { delete globalThis.document; });
  let starts = 0;
  const stop = onPageReady(() => starts++);
  assert.equal(starts, 0);
  document.body = {};
  document.readyState = 'interactive';
  document.dispatchEvent(new Event('DOMContentLoaded'));
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(starts, 1);
  stop();
});
