/** Event-driven controls only; glyph rendering happens offline. */
export function initKrishnaAscii(figure: HTMLElement) {
  const texture = figure.querySelector<HTMLImageElement>('.ascii-texture');
  const pauseButton = figure.querySelector<HTMLButtonElement>('[data-pause]');
  const controls = figure.querySelector<HTMLElement>('.art-controls');
  if (!texture || !pauseButton || !controls) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const { signal } = controller;
  let paused = false;
  let inView = false;
  let disposed = false;
  function sync() {
    figure.dataset.running = String(!paused && !motion.matches && inView && !document.hidden);
    pauseButton!.setAttribute('aria-pressed', String(paused));
    const label = paused ? 'Resume artwork animation' : 'Pause artwork animation';
    pauseButton!.setAttribute('aria-label', label);
    pauseButton!.title = label;
    controls!.hidden = motion.matches || !(figure.dataset.ready || figure.dataset.cycleReady);
  }
  pauseButton.addEventListener('click', () => { paused = !paused; sync(); }, { signal });
  document.addEventListener('visibilitychange', sync, { signal });
  motion.addEventListener('change', sync, { signal });
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
  observer.observe(figure);
  const portraitFrames = figure.querySelectorAll<HTMLImageElement>('[data-portrait-frame]');
  if (portraitFrames.length > 0) {
    Promise.all(Array.from(portraitFrames, frame => frame.decode())).then(() => {
      if (!disposed) { figure.dataset.cycleReady = 'true'; sync(); }
    }).catch(() => { /* Keep Krishna visible if a portrait fails. */ });
  }
  texture.decode().then(() => {
    if (disposed) return;
    figure.dataset.ready = 'true';
    sync();
  }).catch(() => { /* The static portrait remains if the texture fails. */ });
  function dispose() {
    disposed = true;
    figure.dataset.running = 'false';
    observer.disconnect();
    controller.abort();
  }
  document.addEventListener('astro:before-swap', dispose, { once: true, signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
