import { storyFrame, storyParallax } from './video-story-timeline';

export function initVideoStories(section: HTMLElement) {
  const scrollArea = section.querySelector<HTMLElement>('[data-story-scroll]')!;
  const stage = section.querySelector<HTMLElement>('.story-stage')!;
  const track = section.querySelector<HTMLElement>('[data-story-track]')!;
  const nav = section.querySelector<HTMLElement>('.story-chapters')!;
  const progressRail = section.querySelector<HTMLElement>('[data-story-progress]')!;
  const progressSegments = Array.from(section.querySelectorAll<HTMLElement>('[data-story-progress-segment]'));
  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>('[data-story-chapter]'));
  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-story-card]'));
  const films = Array.from(section.querySelectorAll<HTMLElement>('[data-story-film]'));
  const captions = Array.from(section.querySelectorAll<HTMLElement>('[data-story-caption]'));
  const videos = Array.from(section.querySelectorAll<HTMLVideoElement>('video'));
  const toggle = section.querySelector<HTMLButtonElement>('[data-story-playback]')!;
  const toggleLabel = section.querySelector<HTMLElement>('[data-playback-label]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1000px) and (min-height: 680px)');
  const controller = new AbortController();
  const { signal } = controller;
  const visibleFilms = new Set<number>();
  const pending = new Set<HTMLVideoElement>();
  const blocked = new Set<HTMLVideoElement>();
  let pinned = false;
  let near = false;
  let inPreloadRange = false;
  let active = -1;
  let paused = reduced.matches;
  let start = 0;
  let distance = 1;
  let frame = 0;
  let disposed = false;
  let desired: number[] = [0];

  function loadPreview(index: number) {
    const video = videos[index];
    if (!video || video.getAttribute('src')) return;
    video.preload = 'auto';
    video.src = video.canPlayType('video/webm; codecs="vp9"') && video.dataset.previewWebmSrc
      ? video.dataset.previewWebmSrc : video.dataset.previewSrc!;
    video.load();
  }

  function warmPreviews() {
    if (!inPreloadRange || paused || document.hidden || disposed) return;
    const index = Math.max(0, active);
    loadPreview(index);
    loadPreview(index + 1);
  }

  function canPlay(index: number) {
    return !disposed && !paused && !document.hidden && near && desired.includes(index)
      && (pinned || visibleFilms.has(index));
  }

  function syncPlayback() {
    warmPreviews();
    videos.forEach((video, index) => {
      if (!canPlay(index)) { video.pause(); return; }
      loadPreview(index);
      if (!video.paused || pending.has(video) || blocked.has(video)) return;
      pending.add(video);
      const requestedSource = video.src;
      void video.play().then(() => {
        // A play promise may resolve after the user scrolls away or presses pause.
        if (!canPlay(index)) video.pause();
      }).catch((error: unknown) => {
        if (video.src !== requestedSource || !canPlay(index) || (error instanceof DOMException && error.name === 'AbortError')) return;
        blocked.add(video); // Keep the poster visible if autoplay is unavailable.
        toggleLabel.textContent = 'Play previews';
      }).finally(() => {
        pending.delete(video);
        if (video.src !== requestedSource) schedule();
      });
    });
  }

  function select(index: number) {
    if (active === index) return;
    const previous = active;
    active = index;
    section.dataset.storyActive = String(index);
    buttons.forEach((button, i) => {
      button.toggleAttribute('data-complete', i < active);
      if (i === active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    // Move keyboard focus before making the outgoing caption inert.
    if (pinned && previous >= 0 && captions[previous].contains(document.activeElement)) {
      buttons[active].focus({ preventScroll: true });
    }
    captions.forEach((caption, i) => {
      caption.toggleAttribute('data-active', i === active);
      caption.inert = pinned && i !== active;
      if (pinned && i !== active) caption.setAttribute('aria-hidden', 'true');
      else caption.removeAttribute('aria-hidden');
    });
  }

  function render() {
    frame = 0;
    if (disposed) return;
    let progress = 0;
    if (pinned) {
      progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      const state = storyFrame(progress, cards.length);
      // The window and its image move separately, like a photo-memory story.
      const gap = Math.sin(state.reveal * Math.PI) * 8;
      films.forEach((film, index) => {
        let clip = 'inset(100% 0 0 round 24px)';
        if (index === state.from) clip = `inset(0 0 calc(${state.reveal * 100}% + ${gap}px) round 24px)`;
        if (index === state.to && state.to !== state.from) clip = `inset(calc(${(1 - state.reveal) * 100}% + ${gap}px) 0 0 round 24px)`;
        if (state.from === state.to && index === state.from) clip = 'inset(0 round 24px)';
        film.style.clipPath = clip;
        const offset = index === state.from ? -state.reveal
          : index === state.to ? 1 - state.reveal : 0;
        film.style.setProperty('--film-x', '0%');
        film.style.setProperty('--film-y', `${storyParallax(state.from === state.to ? 0 : offset)}%`);
      });
      select(state.active);
      desired = state.reveal === 0 ? [state.from] : state.reveal === 1 ? [state.to] : [state.from, state.to];
    } else {
      const left = track.getBoundingClientRect().left;
      const bounds = cards.map(card => card.getBoundingClientRect());
      const distances = bounds.map(rect => Math.abs(rect.left - left));
      progress = Math.min(1, Math.max(0, (left - bounds[0].left) / Math.max(1, bounds.at(-1)!.left - bounds[0].left)));
      films.forEach((film, index) => {
        const offset = (bounds[index].left - left) / Math.max(1, bounds[index].width);
        film.style.setProperty('--film-x', `${reduced.matches ? 0 : storyParallax(offset)}%`);
        film.style.setProperty('--film-y', '0%');
      });
      select(distances.indexOf(Math.min(...distances)));
      desired = [active];
    }
    // Chapter changes occur halfway between destinations (.25 and .75).
    // Fill each segment across the interval where its chapter is current.
    progressSegments.forEach((segment, index) => {
      const last = Math.max(1, cards.length - 1);
      const from = index === 0 ? 0 : (index - .5) / last;
      const to = index === cards.length - 1 ? 1 : (index + .5) / last;
      segment.style.setProperty('--chapter-progress', String(Math.min(1, Math.max(0, (progress - from) / (to - from)))));
    });
    progressRail.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
    progressRail.setAttribute('aria-valuetext', `Chapter ${active + 1} of ${cards.length}, ${Math.round(progress * 100)}% scrolled`);
    syncPlayback();
  }

  function schedule() {
    if (!frame && !disposed) frame = requestAnimationFrame(render);
  }

  function measure() {
    if (disposed) return;
    const nextPinned = desktop.matches && !reduced.matches;
    if (nextPinned !== pinned) {
      pinned = nextPinned;
      section.toggleAttribute('data-stories-pinned', pinned);
      films.forEach(film => film.style.removeProperty('clip-path'));
      captions.forEach(caption => { caption.inert = false; caption.removeAttribute('aria-hidden'); });
      active = -1;
      if (pinned) track.scrollLeft = 0;
    }
    if (pinned) {
      // CSS uses 16px section padding and leaves room for the existing fixed header.
      start = scrollArea.getBoundingClientRect().top + window.scrollY + 16 - 96;
      distance = Math.max(1, scrollArea.offsetHeight - 32 - stage.offsetHeight);
    }
    schedule();
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => {
    if (pinned) {
      measure();
      window.scrollTo({ top: Math.max(0, start + distance * index / (cards.length - 1)), behavior: 'smooth' });
    } else {
      const left = track.scrollLeft + cards[index].getBoundingClientRect().left - track.getBoundingClientRect().left;
      track.scrollTo({ left, behavior: reduced.matches ? 'instant' : 'smooth' });
    }
  }, { signal }));

  toggle.addEventListener('click', () => {
    paused = blocked.size ? false : !paused;
    blocked.clear();
    toggle.setAttribute('aria-pressed', String(paused));
    toggleLabel.textContent = paused ? 'Play previews' : 'Pause previews';
    syncPlayback();
  }, { signal });

  videos.forEach(video => video.addEventListener('error', () => {
    // Some devices advertise VP9 but cannot decode a particular stream.
    // Retry the broadly supported MP4 once, then leave the poster in place.
    if (video.getAttribute('src') !== video.dataset.previewWebmSrc) return;
    blocked.delete(video);
    video.src = video.dataset.previewSrc!;
    video.load();
    schedule();
  }, { signal }));

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === scrollArea) near = entry.isIntersecting;
      else {
        const index = films.indexOf(entry.target as HTMLElement);
        if (entry.isIntersecting) visibleFilms.add(index);
        else visibleFilms.delete(index);
      }
    }
    schedule();
  }, { threshold: 0.05 });
  observer.observe(scrollArea);
  films.forEach(film => observer.observe(film));
  // Start the caption stagger when its text enters view, including on first arrival.
  const captionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.toggleAttribute('data-inview', entry.isIntersecting));
  }, { threshold: .15 });
  captions.forEach(caption => captionObserver.observe(caption));
  // Start fetching before the section enters view, without autoplaying offscreen.
  const preloadObserver = new IntersectionObserver(entries => {
    inPreloadRange = entries[0].isIntersecting;
    warmPreviews();
  }, { rootMargin: '100% 0px' });
  preloadObserver.observe(scrollArea);
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(scrollArea);
  resizeObserver.observe(stage);
  const header = document.querySelector('.site-header');
  if (header) resizeObserver.observe(header);

  window.addEventListener('scroll', () => { if (pinned && near) schedule(); }, { passive: true, signal });
  window.addEventListener('resize', measure, { passive: true, signal });
  window.addEventListener('pageshow', measure, { signal });
  track.addEventListener('scroll', schedule, { passive: true, signal });
  document.addEventListener('visibilitychange', syncPlayback, { signal });
  desktop.addEventListener('change', measure, { signal });
  reduced.addEventListener('change', () => {
    paused = reduced.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggleLabel.textContent = paused ? 'Play previews' : 'Pause previews';
    measure();
    syncPlayback();
  }, { signal });

  section.setAttribute('data-stories-ready', '');
  nav.hidden = false;
  progressRail.hidden = false;
  toggle.hidden = false;
  toggle.setAttribute('aria-pressed', String(paused));
  toggleLabel.textContent = paused ? 'Play previews' : 'Pause previews';
  measure();
  void document.fonts.ready.then(measure);

  function dispose() {
    disposed = true;
    controller.abort();
    observer.disconnect();
    captionObserver.disconnect();
    preloadObserver.disconnect();
    resizeObserver.disconnect();
    cancelAnimationFrame(frame);
    videos.forEach(video => video.pause());
    films.forEach(film => {
      film.style.removeProperty('clip-path');
      film.style.removeProperty('--film-x');
      film.style.removeProperty('--film-y');
    });
    captions.forEach(caption => { caption.inert = false; caption.removeAttribute('aria-hidden'); caption.removeAttribute('data-inview'); });
    section.removeAttribute('data-stories-ready');
    section.removeAttribute('data-stories-pinned');
    nav.hidden = true;
    progressRail.hidden = true;
    delete section.dataset.storyActive;
    toggle.hidden = true;
  }
  document.addEventListener('astro:before-swap', dispose, { once: true, signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
