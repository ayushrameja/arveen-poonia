/** One shared scene state keeps portraits, rings and atmosphere in sync. */
export function initHeroScene(hero: HTMLElement) {
  const pauseButton = hero.querySelector<HTMLButtonElement>('[data-pause]');
  const controls = hero.querySelector<HTMLElement>('.art-controls');
  if (!pauseButton || !controls) return;
  const panels = hero.querySelectorAll<HTMLElement>('[data-scene-panel]');
  const copyPanels = hero.querySelectorAll<HTMLElement>('[data-copy-scene]');
  const frames = hero.querySelectorAll<HTMLImageElement>('[data-portrait-frame]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const { signal } = controller;
  let scene = 'arveen';
  let paused = false;
  let inView = false;
  let disposed = false;
  let ready = false;
  let scrolling = false;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function setScene(next: string) {
    scene = next;
    hero.dataset.scene = scene;
    hero.setAttribute('aria-labelledby', scene === 'arveen' ? 'hero-heading' : 'inspiration-heading');
    copyPanels.forEach(panel => panel.setAttribute('aria-hidden', String(panel.dataset.copyScene !== scene)));
    panels.forEach(panel => panel.setAttribute('aria-hidden', String(panel.dataset.scenePanel !== scene)));
  }
  function sync() {
    clearTimeout(timer);
    if (disposed) return;
    const running = !document.documentElement.classList.contains('intro-active') && ready && !paused && !scrolling && !motion.matches && inView && !document.hidden;
    hero.dataset.running = String(running);
    pauseButton!.setAttribute('aria-pressed', String(paused));
    const label = paused ? 'Resume artwork animation' : 'Pause artwork animation';
    pauseButton!.setAttribute('aria-label', label);
    pauseButton!.title = label;
    controls!.hidden = !ready || motion.matches;
    pauseButton!.hidden = motion.matches;
    if (running) timer = setTimeout(() => {
      setScene(scene === 'radha-krishna' ? 'arveen' : 'radha-krishna');
      sync();
    }, 10000);
  }
  pauseButton.addEventListener('click', () => { paused = !paused; sync(); }, { signal });
  document.addEventListener('visibilitychange', sync, { signal });
  document.addEventListener('intro:complete', sync, { signal });
  motion.addEventListener('change', sync, { signal });
  // Prioritize interaction over ambient effects. Resume only after scrolling
  // settles, and only when most of the hero is visible again.
  document.addEventListener('scroll', () => {
    if (!inView) return;
    if (!scrolling) { scrolling = true; sync(); }
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { scrolling = false; sync(); }, 180);
  }, { passive: true, signal });
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio >= .7;
    sync();
  }, { threshold: [0, .7] });
  observer.observe(hero);
  setScene(scene);
  sync();
  if (frames.length >= 2) Promise.allSettled(Array.from(frames, frame => frame.decode())).then(results => {
    if (disposed) return;
    if (results.some(result => result.status === 'rejected')) {
      // Wait for both results so a slow healthy image still becomes the fallback.
      const available = Array.from(frames).find((_, index) => results[index].status === 'fulfilled');
      const fallback = available?.closest<HTMLElement>('[data-scene-panel]')?.dataset.scenePanel;
      if (fallback) setScene(fallback);
      return;
    }
    ready = true;
    hero.dataset.cycleReady = 'true';
    sync();
  });
  function dispose() {
    disposed = true;
    clearTimeout(timer);
    clearTimeout(scrollTimer);
    hero.dataset.running = 'false';
    observer.disconnect();
    controller.abort();
  }
  document.addEventListener('astro:before-swap', dispose, { once: true, signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
