import { initWelcomeIntro } from './welcome-intro';

// Animate independent content blocks, not entire sections containing other reveals.
const revealSelectors = [
  '.page-intro > *', '.watch-heading', '.video-card', '.product-card',
  '.story-portrait', '.story-copy > *', '.practice-split > *', '.section-heading',
  '.journal-meta', '.journal-copy > *', '.values-grid > *', '.sage-section .content-wrap > .eyebrow',
  '.sage-section .content-wrap > h2', '.yoga-overview > *', '.batch-card', '.plan-grid > *',
  '.faq-layout > div:first-child', '.faq-list > details', '.shop-note', '.store-story > *',
  '.library-controls', '.channel-invite', '.journal-row', '.journal-closing > *',
  '.article-header > *', '.prose > *', '.article-end', '.footer-top > *', '.footer-bottom',
];

export function initPageMotion() {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const controller = new AbortController();
  const { signal } = controller;
  const hero = document.querySelector<HTMLElement>('.hero');
  const entrances = Array.from(document.querySelectorAll<HTMLElement>(
    '.hero .divine-art, .hero .hero-note, .hero .scene-copy > *, .hero .hero-actions, .hero .hero-footer',
  ));
  const reveals = Array.from(document.querySelectorAll<HTMLElement>(revealSelectors.join(',')))
    .filter(element => !element.parentElement?.closest(revealSelectors.join(',')));
  let revealObserver: IntersectionObserver | undefined;
  let disposed = false;
  const animations = new Set<Animation>();
  let heroRevealed = false;

  function startReveals() {
    if (disposed || media.matches || revealObserver) return;
    const siblingIndexes = new Map<Element, number>();
    reveals.forEach(element => {
      element.dataset.reveal = '';
      const parent = element.parentElement!;
      const index = siblingIndexes.get(parent) ?? 0;
      siblingIndexes.set(parent, index + 1);
      element.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 75}ms`);
    });
    try {
      // Native scrolling stays on the browser's compositor. Each content block
      // is observed only until its first entrance; there is no continuous JS loop.
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-inview');
          revealObserver?.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      reveals.filter(element => !element.classList.contains('is-inview'))
        .forEach(element => revealObserver!.observe(element));
      root.classList.add('motion-enabled');
    } catch (error) {
      // Content remains visible and native scrolling works if initialization fails.
      root.classList.remove('motion-enabled');
      console.warn('Section entrance effects could not start.', error);
    }
  }

  function revealHero() {
    if (disposed || heroRevealed) return;
    heroRevealed = true;
    // Read geometry once, before DOM writes. Skip the inactive scene and mobile-only hidden notes.
    const heroVisible = hero && hero.getBoundingClientRect().bottom > 0;
    const visible = media.matches || !heroVisible ? [] : entrances.filter(element =>
      !element.matches('#hero-heading') && !element.closest('[data-copy-scene][aria-hidden="true"]') && element.checkVisibility(),
    );
    entrances.forEach(element => element.classList.remove('hero-enter-pending'));
    visible.forEach((element, index) => {
      const delay = element.matches('.divine-art') ? 0 : Math.min(index, 5) * 65;
      const animation = element.animate([
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 750, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
    });
  }

  if (root.classList.contains('intro-active')) entrances.forEach(element => element.classList.add('hero-enter-pending'));
  const finishIntro = initWelcomeIntro(() => { revealHero(); startReveals(); }, revealHero);

  media.addEventListener('change', () => {
    if (media.matches) {
      root.classList.remove('motion-enabled');
      revealObserver?.disconnect();
      revealObserver = undefined;
      reveals.forEach(element => element.classList.add('is-inview'));
      animations.forEach(animation => animation.cancel());
      entrances.forEach(element => element.classList.remove('hero-enter-pending'));
    } else startReveals();
  }, { signal });

  // Keyboard navigation should never land on an invisible content block.
  document.addEventListener('focusin', event => {
    if (event.target instanceof Element) event.target.closest('[data-reveal]')?.classList.add('is-inview');
  }, { signal });

  function dispose() {
    disposed = true;
    finishIntro();
    root.classList.remove('motion-enabled');
    revealObserver?.disconnect();
    animations.forEach(animation => animation.cancel());
    entrances.forEach(element => element.classList.remove('hero-enter-pending'));
    controller.abort();
  }
  document.addEventListener('astro:before-swap', dispose, { once: true, signal });
  if (import.meta.hot) import.meta.hot.dispose(dispose);
}
