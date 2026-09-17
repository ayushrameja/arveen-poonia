import { test } from 'node:test';
import assert from 'node:assert/strict';
import { storyFrame, storyParallax } from '../src/scripts/video-story-timeline.ts';

test('all three chapter destinations show their corresponding film without a transition', () => {
  for (const [progress, chapter] of [[0, 0], [.5, 1], [1, 2]]) {
    const frame = storyFrame(progress, 3);
    assert.equal(frame.active, chapter);
    assert.equal(frame.from, chapter);
    assert.equal(frame.reveal, 0);
  }
});

test('each chapter has a reading interval with no moving mask', () => {
  for (const progress of [0, .1, .4, .5, .6, .9, 1]) {
    assert.ok([0, 1].includes(storyFrame(progress, 3).reveal));
  }
});

test('both transitions reveal only adjacent films, and reverse with scrolling', () => {
  for (const [progress, from, to] of [[.22, 0, 1], [.27, 0, 1], [.72, 1, 2], [.77, 1, 2]]) {
    const frame = storyFrame(progress, 3);
    assert.equal(frame.from, from);
    assert.equal(frame.to, to);
    assert.ok(frame.reveal > 0 && frame.reveal < 1);
    assert.equal(frame.active, frame.reveal >= .5 ? to : from);
  }
  assert.ok(storyFrame(.27, 3).reveal > storyFrame(.22, 3).reveal);
  assert.ok(storyFrame(.77, 3).reveal > storyFrame(.72, 3).reveal);
});

test('overscroll and invalid measurements never select a missing film', () => {
  assert.deepEqual(storyFrame(-1, 3), storyFrame(0, 3));
  assert.deepEqual(storyFrame(2, 3), storyFrame(1, 3));
  assert.deepEqual(storyFrame(NaN, 3), storyFrame(0, 3));
  assert.equal(storyFrame(.7, 1).active, 0);
});

test('parallax follows scroll direction and stays inside the image overscan', () => {
  assert.equal(storyParallax(0), 0);
  assert.ok(storyParallax(-.5) < 0);
  assert.ok(storyParallax(.5) > 0);
  assert.equal(storyParallax(NaN), 0);
  for (const offset of [-100, -1, -.5, 0, .5, 1, 100]) {
    // A 14% scale leaves 7% on each side; drift must remain within it.
    assert.ok(Math.abs(storyParallax(offset)) < 7);
  }
});
