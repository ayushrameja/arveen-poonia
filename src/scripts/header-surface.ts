/** The frosted header exists only at the very top of the homepage. */
export function initHeaderSurface() {
  const header = document.querySelector<HTMLElement>('.site-header--home');
  const sentinel = document.querySelector<HTMLElement>('[data-header-top]');
  if (!header || !sentinel) return;
  const controller = new AbortController();
  const sync = () => { header.dataset.atTop = String(window.scrollY < 4); };
  // A tiny marker switches surfaces once at the boundary, with no scroll loop.
  const observer = new IntersectionObserver(sync, { threshold: [0, 1] });
  observer.observe(sentinel);
  sync();
  window.addEventListener('pageshow', sync, { signal: controller.signal });
  function dispose() {
    observer.disconnect();
    controller.abort();
    delete header!.dataset.atTop;
  }
  document.addEventListener('astro:before-swap', dispose, { once: true, signal: controller.signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
