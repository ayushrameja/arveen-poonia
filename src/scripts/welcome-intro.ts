/** A single name travels from the introduction into the real, measured hero. */
export function initWelcomeIntro(onComplete: () => void, onHandoff: () => void) {
  const root = document.documentElement;
  const screen = document.querySelector<HTMLElement>('.welcome-screen');
  const target = document.querySelector<HTMLElement>('[data-hero-name]');
  if (!screen || !target || !root.classList.contains('intro-active')) {
    screen?.remove();
    onComplete();
    return () => {};
  }
  const canvas = screen.querySelector<HTMLElement>('.intro-canvas')!;
  const devotion = screen.querySelector<HTMLElement>('.intro-devotion')!;
  const hello = screen.querySelector<HTMLElement>('.intro-hello')!;
  const name = screen.querySelector<HTMLElement>('.intro-name')!;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const animations = new Set<Animation>();
  const siblings = Array.from(document.body.children).filter((element): element is HTMLElement =>
    element instanceof HTMLElement && element !== screen && !['SCRIPT', 'STYLE'].includes(element.tagName),
  );
  const inertBefore = siblings.map(element => element.inert);
  siblings.forEach(element => { element.inert = true; });
  let done = false;
  let inFlight = false;
  const ease = 'cubic-bezier(.76,0,.24,1)';
  // Decode the first visible scene while the greeting plays. Below-the-fold
  // media keeps its existing lazy-loading policy; no video download blocks entry.
  const heroReady = Promise.allSettled([
    document.fonts.ready,
    ...Array.from(document.querySelectorAll<HTMLImageElement>(
      '[data-scene-panel="arveen"] img, img.atmosphere-personal',
    ), image => image.decode()),
  ]);
  function finish() {
    if (done) return;
    done = true;
    const focused = screen!.contains(document.activeElement);
    animations.forEach(animation => animation.cancel());
    siblings.forEach((element, index) => { element.inert = inertBefore[index]; });
    root.classList.remove('intro-active');
    screen!.remove();
    controller.abort();
    document.dispatchEvent(new Event('intro:complete'));
    onComplete();
    if (focused) document.querySelector<HTMLElement>('#main-content')?.focus({ preventScroll: true });
  }
  async function animate(element: HTMLElement, frames: Keyframe[], duration: number, delay = 0, easing = ease) {
    if (done) return;
    const animation = element.animate(frames, { duration: duration * 0.5, delay: delay * 0.5, easing, fill: 'both' });
    animations.add(animation);
    await animation.finished;
  }
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finish(); }, { signal: controller.signal });
  document.addEventListener('intro:timeout', finish, { signal: controller.signal });
  media.addEventListener('change', finish, { signal: controller.signal });
  // If geometry changes during the flight, reveal the correctly reflowed real heading.
  window.addEventListener('resize', () => { if (inFlight) finish(); }, { signal: controller.signal });
  async function run() {
    await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 1000))]);
    if (done) return;
    await animate(devotion, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], 600);
    // Keep the complete blessing readable before a gentle, deliberate dissolve.
    await animate(devotion, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-12px)' }], 550, 1600, 'ease-in-out');
    if (done) return;
    screen!.classList.add('intro-blue');
    await Promise.all([
      animate(canvas, [{ backgroundColor: '#ffffff' }, { backgroundColor: '#dceaf3' }], 800, 0, 'ease-in-out'),
      animate(hello, [{ opacity: 0, transform: 'translateY(25px)' }, { opacity: 1, transform: 'translateY(0)' }], 550, 300),
      animate(name, [{ opacity: 0, transform: 'translateY(100%)' }, { opacity: 1, transform: 'translateY(0)' }], 750, 450),
    ]);
    await animate(hello, [{ opacity: 1 }, { opacity: 0, transform: 'translateY(-20px)' }], 350, 600);
    // A slow or failed asset must never hold the visitor behind the welcome.
    await Promise.race([heroReady, new Promise(resolve => setTimeout(resolve, 1800))]);
    if (done) return;
    inFlight = true;
    onHandoff();
    const from = name.getBoundingClientRect();
    const to = target!.getBoundingClientRect();
    const targetStyle = getComputedStyle(target!);
    // Both endpoints use the hero's font/weight/tracking. Transform-only flight avoids layout work.
    name.style.position = 'fixed';
    name.style.translate = 'none';
    name.style.left = `${from.left}px`;
    name.style.top = `${from.top}px`;
    name.style.bottom = 'auto';
    await Promise.all([
      animate(name, [
        { opacity: 1, transform: 'translate(0, 0) scale(1)', color: '#203c36' },
        { opacity: 1, transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`, color: targetStyle.color },
      ], 950),
      animate(canvas, [{ opacity: 1 }, { opacity: 0 }], 800, 75),
    ]);
    finish();
  }
  void run().catch(finish);
  return finish;
}
