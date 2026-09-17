/** Coordinate chapter colours at viewport boundaries, not on every scroll frame. */
export function initClosingTone() {
  const closing = document.querySelector<HTMLElement>('[data-closing-tone]');
  if (!closing) return;
  const opening = document.querySelector<HTMLElement>('.watch-section');
  const practice = document.querySelector<HTMLElement>('.home-practice');
  const root = document.documentElement;
  const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const originalTheme = theme?.content;
  const controller = new AbortController();
  const { signal } = controller;
  let frame = 0;
  let disposed = false;
  let tone: 'light' | 'saffron' | 'evening' | undefined;
  let chapterObserver: IntersectionObserver | undefined;
  let closingObserver: IntersectionObserver | undefined;
  let observerSize = '';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const backdrop = document.querySelector<HTMLElement>('.tone-backdrop--page');
  let inkTimer: ReturnType<typeof setTimeout> | undefined;

  function applyInk(next: 'light' | 'saffron' | 'evening') {
    if (disposed) return;
    root.classList.toggle('home-saffron', next === 'saffron');
    root.classList.toggle('home-evening', next === 'evening');
  }

  function update() {
    frame = 0;
    if (disposed) return;
    const chapterLine = window.innerHeight * .35;
    // Read all geometry together, then apply the new palette only if it changed.
    const openingTop = opening?.getBoundingClientRect().top;
    const practiceTop = practice?.getBoundingClientRect().top;
    const closingTop = closing!.getBoundingClientRect().top;
    const openingActive = openingTop !== undefined && practiceTop !== undefined
      && openingTop <= chapterLine && practiceTop > chapterLine;
    const next = closingTop <= window.innerHeight * .75 ? 'evening'
      : openingActive ? 'saffron' : 'light';
    if (next === tone) return;
    const initial = tone === undefined;
    // Read the current fade once so fast direction reversals remain continuous.
    const greenOpacity = backdrop ? Number(getComputedStyle(backdrop, '::after').opacity) : 0;
    tone = next;
    root.dataset.paperTone = next;
    clearTimeout(inkTimer);
    const needsInkSwitch = root.classList.contains('home-evening') !== (next === 'evening');
    // Switch light/dark ink around the middle of the background fade rather
    // than briefly displaying pale text on the still-pale outgoing background.
    const crossesMidpoint = next === 'evening' ? greenOpacity < .5 : greenOpacity > .5;
    const delay = initial || reducedMotion.matches || !needsInkSwitch || !crossesMidpoint
      ? 0 : Math.abs(greenOpacity - .5) * 700;
    if (delay) inkTimer = setTimeout(() => applyInk(next), delay);
    else applyInk(next);
    if (theme) theme.content = next === 'evening' ? '#203e35'
      : next === 'saffron' ? '#f4cd72' : (originalTheme ?? '#faf9f5');
  }
  function schedule() {
    if (!disposed && !frame) frame = requestAnimationFrame(update);
  }
  function observeBoundaries() {
    const pageHeight = document.documentElement.scrollHeight;
    const nextSize = `${window.innerHeight}:${pageHeight}`;
    if (nextSize === observerSize) { schedule(); return; }
    observerSize = nextSize;
    chapterObserver?.disconnect();
    closingObserver?.disconnect();
    // Extend above the entire page: a chapter stays intersecting after its top
    // crosses the line, including instant anchor/history jumps past a section.
    // Pixel margins use viewport height; percentage root margins use width.
    chapterObserver = new IntersectionObserver(schedule, {
      rootMargin: `${pageHeight}px 0px -${window.innerHeight * .65}px 0px`,
    });
    if (opening) chapterObserver.observe(opening);
    if (practice) chapterObserver.observe(practice);
    closingObserver = new IntersectionObserver(schedule, {
      rootMargin: `${pageHeight}px 0px -${window.innerHeight * .25}px 0px`,
    });
    closingObserver.observe(closing!);
    schedule();
  }

  update();
  root.classList.add('home-tone-enabled');
  observeBoundaries();
  window.addEventListener('resize', observeBoundaries, { signal });
  window.addEventListener('pageshow', schedule, { signal });
  reducedMotion.addEventListener('change', () => {
    clearTimeout(inkTimer);
    if (tone) applyInk(tone);
  }, { signal });
  const resize = new ResizeObserver(observeBoundaries);
  resize.observe(document.querySelector('main')!);

  function dispose() {
    disposed = true;
    controller.abort();
    chapterObserver?.disconnect();
    closingObserver?.disconnect();
    resize.disconnect();
    cancelAnimationFrame(frame);
    clearTimeout(inkTimer);
    root.classList.remove('home-tone-enabled', 'home-saffron', 'home-evening');
    delete root.dataset.paperTone;
    if (theme && originalTheme !== undefined) theme.content = originalTheme;
  }
  document.addEventListener('astro:before-swap', dispose, { once: true, signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
