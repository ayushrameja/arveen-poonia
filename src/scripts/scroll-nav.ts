/** The navigation becomes available after scrolling one fifth of the viewport. */
export function initScrollNav(nav: HTMLElement) {
  const controller = new AbortController();
  const { signal } = controller;
  const sync = () => {
    const visible = window.scrollY >= window.innerHeight * .2;
    nav.dataset.visible = String(visible);
    nav.inert = !visible;
    nav.setAttribute('aria-hidden', String(!visible));
  };
  nav.dataset.scrollNav = 'true';
  sync();
  window.addEventListener('scroll', sync, { passive: true, signal });
  window.addEventListener('resize', sync, { signal });
  window.addEventListener('pageshow', sync, { signal });
  const dispose = () => controller.abort();
  document.addEventListener('astro:before-swap', dispose, { once: true, signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
