/** Filter the static library; preserve the current selection across route visits. */
export function initVideoLibrary() {
  const controls = document.querySelector<HTMLElement>('[data-library-controls]');
  if (!controls) return;
  const search = controls.querySelector<HTMLInputElement>('#video-search')!;
  const cards = Array.from(document.querySelectorAll<HTMLElement>('#video-results [data-video-card]'));
  const buttons = Array.from(controls.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const status = document.querySelector<HTMLElement>('[data-result-count]')!;
  const empty = document.querySelector<HTMLElement>('[data-empty]')!;
  const reset = empty.querySelector<HTMLButtonElement>('[data-reset]')!;
  const controller = new AbortController();
  const { signal } = controller;
  const params = new URLSearchParams(location.search);
  let topic = params.get('topic') || 'All';
  if (!buttons.some(button => button.dataset.filter === topic)) topic = 'All';
  search.value = params.get('q') || '';

  function update(persist = false) {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    cards.forEach(card => {
      card.hidden = !((topic === 'All' || card.dataset.category === topic)
        && (card.dataset.title || '').includes(query));
      if (!card.hidden) count++;
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === topic)));
    status.textContent = `${count} ${count === 1 ? 'video' : 'videos'} · ${topic === 'All' ? 'All stories' : topic}${query ? ` · “${search.value.trim()}”` : ''}`;
    empty.hidden = count > 0;
    if (persist) {
      const url = new URL(location.href);
      if (topic === 'All') url.searchParams.delete('topic');
      else url.searchParams.set('topic', topic);
      if (query) url.searchParams.set('q', search.value.trim());
      else url.searchParams.delete('q');
      // Retain Astro's history/scroll bookkeeping, without adding a history entry per keystroke.
      history.replaceState(history.state, '', url);
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    topic = button.dataset.filter || 'All';
    update(true);
  }, { signal }));
  search.addEventListener('input', () => update(true), { signal });
  reset.addEventListener('click', () => {
    topic = 'All';
    search.value = '';
    update(true);
    search.focus({ preventScroll: true });
  }, { signal });
  controls.hidden = false;
  update();
  const dispose = () => controller.abort();
  document.addEventListener('astro:before-swap', dispose, { once: true, signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
