/** Coordinate the saffron opening chapter and green closing chapter. */
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
  let tone: 'light' | 'saffron' | 'evening' | undefined;

  function update() {
    frame = 0;
    // The saffron chapter spans videos and story. Using the same
    // viewport line at both ends makes the transition reversible on scroll-up.
    const chapterLine = window.innerHeight * 0.35;
    const openingActive = !!opening && !!practice
      && opening.getBoundingClientRect().top <= chapterLine
      && practice.getBoundingClientRect().top > chapterLine;
    // Preserve the journal's existing trigger and green tone through the footer.
    const closingActive = closing!.getBoundingClientRect().top <= window.innerHeight * 0.75;
    const next = closingActive ? 'evening' : openingActive ? 'saffron' : 'light';
    if (next === tone) return;
    tone = next;
    root.classList.toggle('home-saffron', next === 'saffron');
    root.classList.toggle('home-evening', next === 'evening');
    if (theme) theme.content = next === 'evening' ? '#203e35'
      : next === 'saffron' ? '#f4cd72' : (originalTheme ?? '#faf9f5');
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  update();
  root.classList.add('home-tone-enabled');
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { passive: true, signal });
  window.addEventListener('pageshow', schedule, { signal });
  // Font and image layout changes can move the trigger without a scroll event.
  const resize = new ResizeObserver(schedule);
  resize.observe(document.querySelector('main')!);

  function dispose() {
    controller.abort();
    resize.disconnect();
    cancelAnimationFrame(frame);
    root.classList.remove('home-tone-enabled', 'home-saffron', 'home-evening');
    if (theme && originalTheme !== undefined) theme.content = originalTheme;
  }
  document.addEventListener('astro:before-swap', dispose, { once: true, signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
