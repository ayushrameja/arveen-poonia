/** Start on parsed HTML, without waiting for images; restart once per route body. */
export function onPageReady(initialize: () => void) {
  let initializedBody: HTMLElement | undefined;
  const run = () => {
    if (!document.body || initializedBody === document.body) return;
    initializedBody = document.body;
    initialize();
  };
  document.addEventListener('astro:page-load', run);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  return () => {
    document.removeEventListener('DOMContentLoaded', run);
    document.removeEventListener('astro:page-load', run);
  };
}
