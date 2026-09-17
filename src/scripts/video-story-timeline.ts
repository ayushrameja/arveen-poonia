/** Hold each story long enough to read; use the middle of each interval for the reveal. */
export function storyFrame(progress: number, count: number) {
  const last = Math.max(0, count - 1);
  const position = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0)) * last;
  const from = Math.min(last, Math.floor(position));
  const to = Math.min(last, from + 1);
  const linear = Math.min(1, Math.max(0, (position - from - .28) / .44));
  const reveal = linear * linear * (3 - 2 * linear);
  return { from, to, reveal, active: reveal >= .5 ? to : from };
}

/** A small, bounded drift within the enlarged image; never expose its edges. */
export function storyParallax(offset: number) {
  return Math.max(-1, Math.min(1, Number.isFinite(offset) ? offset : 0)) * 6;
}
