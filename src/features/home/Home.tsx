import { useEffect, useState } from 'react';

const IST_TIMEZONE = 'Asia/Kolkata';
const TIME_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: IST_TIMEZONE,
});

type LinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

type MenuSection = LinkItem & {
  children?: LinkItem[];
};

const socialLinks: LinkItem[] = [
  { label: 'YouTube', href: 'https://www.youtube.com/', external: true },
  { label: 'Resume', href: '/resume' },
];

const siteLinks: LinkItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Yoga', href: '#yoga' },
  { label: 'Store', href: '#store' },
  { label: 'Contact', href: '#contact' },
];

const mobileMenu: MenuSection[] = [
  { label: 'HOME', href: '#home' },
  {
    label: 'YOGA',
    href: '#yoga',
    children: [
      { label: 'Features', href: '#yoga-features' },
      { label: 'Enroll', href: '#yoga-enroll' },
    ],
  },
  {
    label: 'STORE',
    href: '#store',
    children: [
      { label: 'All Products', href: '#store' },
      { label: 'Attar', href: '#store' },
      { label: 'Bhagwat Gita', href: '#store' },
      { label: 'Sound Box', href: '#store' },
    ],
  },
  { label: 'CONTACT', href: '#contact' },
];

function getIstTime() {
  const now = new Date();
  return {
    label: TIME_FORMATTER.format(now).toUpperCase(),
    dateTime: now.toISOString(),
  };
}

function FlowerLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 45 45" aria-hidden="true" className={className} fill="currentColor">
      <path d="M22.5 2.10938C21.4629 2.10938 20.3467 3.00146 19.459 4.77422C18.835 6.03721 18.3516 7.69131 18.1318 9.5625C18.5361 9.91406 18.9404 10.2832 19.3359 10.6787C20.3379 11.6719 21.1992 12.7266 21.9111 13.7813C22.1045 13.7725 22.3066 13.7637 22.5 13.7637C22.7109 13.7637 22.9219 13.7725 23.1328 13.79C23.8447 12.7266 24.7061 11.6807 25.708 10.6787C26.0859 10.3008 26.4814 9.93164 26.877 9.59766C26.6484 7.71328 26.1738 6.04512 25.541 4.77422C24.6533 3.00146 23.5371 2.10938 22.5 2.10938ZM9.94922 7.39336C9.14062 7.40479 8.51396 7.63594 8.10439 8.04727C7.37314 8.77852 7.21143 10.1953 7.84072 12.0762C8.46914 13.957 9.85254 16.1631 11.8477 18.1582C12.5771 18.8877 13.3418 19.5381 14.0977 20.1006C14.9326 17.1826 17.2529 14.8887 20.1797 14.0801C19.6172 13.3066 18.958 12.5332 18.2197 11.7949C16.2246 9.7998 14.0186 8.41289 12.1377 7.78359C11.3115 7.5085 10.5732 7.38457 9.94922 7.39336ZM35.0947 7.39336C34.4707 7.38457 33.7324 7.51025 32.915 7.78711C31.0342 8.41465 28.8281 9.7998 26.833 11.7949C26.0859 12.542 25.4268 13.3154 24.8643 14.0889C27.7822 14.9063 30.085 17.209 30.9111 20.127C31.6846 19.5557 32.458 18.8965 33.1963 18.1582C35.1914 16.1631 36.5713 13.957 37.2041 12.0762C37.8369 10.1953 37.6699 8.78115 36.9404 8.04814C36.5273 7.63594 35.9033 7.40391 35.0947 7.39336ZM22.5 15.3457C18.5361 15.3457 15.3457 18.5361 15.3457 22.5C15.3457 26.4639 18.5361 29.6543 22.5 29.6543C26.4639 29.6543 29.6543 26.4639 29.6543 22.5C29.6543 18.5361 26.4639 15.3457 22.5 15.3457ZM9.65039 18.123C7.7458 18.3428 6.0583 18.8262 4.77422 19.459C3.00146 20.3467 2.10938 21.4629 2.10938 22.5C2.10938 23.5371 3.00146 24.6533 4.77422 25.541C6.04687 26.1738 7.7168 26.6484 9.59766 26.877C9.95801 26.4639 10.3359 26.0508 10.7314 25.6553C11.7158 24.6709 12.7441 23.8184 13.7813 23.1152C13.7725 22.9131 13.7637 22.7109 13.7637 22.5C13.7637 22.2715 13.7725 22.043 13.79 21.8232C12.7441 21.1201 11.7158 20.2676 10.7314 19.2832C10.3535 18.9053 9.99316 18.5098 9.65039 18.123ZM35.3848 18.123C35.042 18.5098 34.6904 18.8965 34.3125 19.2744C33.3105 20.2764 32.2646 21.1377 31.21 21.8496C31.2275 22.0605 31.2363 22.2803 31.2363 22.5C31.2363 22.6934 31.2275 22.8955 31.2188 23.0889C32.2646 23.792 33.3105 24.6533 34.3037 25.6465C34.708 26.0508 35.0859 26.4551 35.4375 26.8682C37.3096 26.6484 38.9619 26.165 40.2275 25.541C42.0029 24.6533 42.8906 23.5371 42.8906 22.5C42.8906 21.4629 42.0029 20.3467 40.2275 19.459C38.9531 18.8262 37.2744 18.3428 35.3848 18.123ZM30.9199 24.8115C30.1201 27.7471 27.8174 30.0674 24.8994 30.9023C25.4531 31.6582 26.0947 32.4141 26.8242 33.1348C28.8193 35.1299 31.0254 36.5098 32.9062 37.1426C34.7871 37.7666 36.2021 37.6084 36.9316 36.8789C37.6699 36.1494 37.8281 34.7256 37.1953 32.8447C36.5713 30.9639 35.1826 28.7578 33.1875 26.7627C32.4492 26.0244 31.6934 25.374 30.9199 24.8115ZM14.0801 24.8467C13.3242 25.4092 12.5771 26.0508 11.8477 26.7715C9.85254 28.7666 8.47002 30.9727 7.84248 32.8535C7.20879 34.7344 7.37051 36.1494 8.10352 36.8877C8.83301 37.6172 10.2568 37.7842 12.1289 37.1426C14.0098 36.5186 16.2158 35.1299 18.2109 33.1348C18.9316 32.4141 19.5732 31.667 20.1357 30.9111C17.209 30.085 14.9062 27.7734 14.0801 24.8467ZM21.8672 31.21C21.1641 32.2471 20.3203 33.2754 19.3359 34.2598C18.9404 34.6553 18.5361 35.0332 18.123 35.3848C18.3428 37.2744 18.8262 38.9531 19.459 40.2275C20.3467 42.0029 21.4629 42.8906 22.5 42.8906C23.5371 42.8906 24.6533 42.0029 25.541 40.2275C26.1738 38.9443 26.6572 37.2568 26.877 35.3496C26.4814 35.0068 26.0859 34.6377 25.6992 34.251C24.7148 33.2666 23.8711 32.2471 23.1768 31.21C22.9482 31.2275 22.7285 31.2363 22.5 31.2363C22.2891 31.2363 22.0781 31.2275 21.8672 31.21Z" />
    </svg>
  );
}

function MenuToggle({ open, accent = false }: { open: boolean; accent?: boolean }) {
  const barColor = accent ? 'bg-[var(--color-accent)]' : 'bg-black';

  return (
    <span className="relative block h-9 w-9" aria-hidden="true">
      <span
        className={`absolute left-0 top-1/2 h-1 w-9 -translate-y-3 rounded-full transition-transform duration-300 ${barColor} ${
          open ? 'translate-y-0 rotate-45' : ''
        }`}
      />
      <span
        className={`absolute left-0 top-1/2 h-1 w-9 rounded-full transition-opacity duration-300 ${barColor} ${
          open ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`absolute left-0 top-1/2 h-1 w-9 translate-y-3 rounded-full transition-transform duration-300 ${barColor} ${
          open ? 'translate-y-0 -rotate-45' : ''
        }`}
      />
    </span>
  );
}

export function Home() {
  const [istTime, setIstTime] = useState(getIstTime);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIstTime(getIstTime());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const onLargerScreens = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    mediaQuery.addEventListener('change', onLargerScreens);
    return () => mediaQuery.removeEventListener('change', onLargerScreens);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      const pastHero = currentScrollY > 100;

      setIsScrolled(scrollingUp && pastHero);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const linkBaseClasses =
    'transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)]';

  return (
    <main className="bg-[var(--color-panel)] text-[var(--color-white)]">
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-40 hidden transition-all duration-500 md:block ${
          isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="pointer-events-auto border-b border-white/10 bg-[var(--color-panel)]/96 px-6 py-3 backdrop-blur-md lg:px-9">
          <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-8">
            <a href="#home" className="inline-flex items-center gap-2 text-[var(--color-accent)]">
              <FlowerLogo className="h-6 w-6" />
              <span className="font-display text-[clamp(1.25rem,1.2vw,1.625rem)] leading-none">Arveen Poonia</span>
            </a>

            <nav aria-label="Top navigation">
              <ul className="flex list-none items-center gap-4 p-0 text-[clamp(0.875rem,0.5rem+0.35vw,1.0625rem)] text-[var(--color-white)]">
                {siteLinks.map((link, index) => (
                  <li key={`sticky-${link.label}`} className="inline-flex items-center gap-4">
                    <a href={link.href} className={linkBaseClasses}>
                      {link.label}
                    </a>
                    {index < siteLinks.length - 1 && <span className="text-[var(--color-accent)]">/</span>}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <section id="home" className="relative isolate min-h-screen overflow-hidden" aria-label="Landing page">
        <img
          src="/images/light-01.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-30 h-full w-full select-none object-cover object-[46%_34%] md:object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.14)_0%,rgba(0,0,0,0.18)_45%,rgba(0,0,0,0.62)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(0deg,rgba(255,255,0,0.2)_0%,rgba(255,255,0,0.12)_52%,rgba(255,255,0,0.28)_100%)] mix-blend-multiply"
        />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1920px] flex-col px-6 pb-8 pt-8 sm:px-10 md:px-12 md:pb-10 md:pt-10 lg:px-16 xl:px-20">
          <div className="z-20 flex items-start justify-between md:hidden">
            <FlowerLogo className="h-11 w-11 text-black" />
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center border-0 bg-transparent"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              <MenuToggle open={isMobileMenuOpen} />
            </button>
          </div>

          <header className="relative z-10 mx-auto hidden w-full max-w-[52rem] text-center md:block">
            <p className="text-[clamp(1.125rem,1vw+0.5rem,1.5rem)] leading-[1.3] text-[var(--color-white)] [text-shadow:0_10px_30px_rgba(0,0,0,0.44)]">
              A <span className="font-cursive text-[1.18em] text-[var(--color-accent)]">Discipline Mentor</span> for people and routines
              <span className="block">that move forward with clarity and consistency.</span>
            </p>
          </header>

          <div className="mt-auto flex flex-col md:hidden">
            <h1 className="font-display text-[clamp(3rem,14vw,5rem)] leading-[0.86] text-[var(--color-white)] [text-shadow:0_8px_24px_rgba(0,0,0,0.45)]">
              Arveen <span className="text-[var(--color-accent)]">Poonia</span>
            </h1>
            <p className="mt-3 max-w-[28rem] text-[clamp(1rem,3.8vw,1.375rem)] leading-[1.3] text-[var(--color-white)] [text-shadow:0_8px_26px_rgba(0,0,0,0.55)]">
              A <span className="font-cursive text-[1.18em]">Discipline Mentor</span> for people and routines that move forward with
              <span className="text-[var(--color-accent)]"> clarity and consistency.</span>
            </p>
            <nav aria-label="Social links" className="mt-5 text-center text-[clamp(0.9375rem,3vw,1.125rem)]">
              <ul className="flex list-none items-center justify-center gap-4 p-0">
                {socialLinks.map((link, index) => (
                  <li key={`mobile-social-${link.label}`} className="inline-flex items-center gap-4">
                    {index > 0 && <span className="text-[var(--color-white)]">/</span>}
                    <a href={link.href} className={linkBaseClasses} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer noopener' : undefined}>
                      <span className={index === 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-white)]'}>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-auto hidden md:block">
            <h1 className="text-left font-display text-[clamp(5.5rem,11.5vw,15rem)] leading-[0.83] tracking-[-0.015em] text-[var(--color-accent)] [text-shadow:0_18px_38px_rgba(0,0,0,0.46)]">
              Arveen Poonia
            </h1>

            <footer className="mt-6 grid items-end gap-y-4 text-[clamp(0.8125rem,0.4vw+0.55rem,1rem)] [text-shadow:0_6px_16px_rgba(0,0,0,0.5)] lg:grid-cols-[1fr_auto_1fr] lg:gap-x-5">
              <p className="justify-self-start whitespace-nowrap text-[var(--color-white)]">
                <time dateTime={istTime.dateTime} aria-label={`Current India time is ${istTime.label}`}>
                  INDIA {istTime.label}
                </time>
              </p>

              <nav className="justify-self-center text-[var(--color-white)]" aria-label="Social links">
                <ul className="flex list-none items-center gap-3 p-0">
                  {socialLinks.map((link, index) => (
                    <li key={`desktop-social-${link.label}`} className="inline-flex items-center gap-3">
                      {index > 0 && <span>/</span>}
                      <a href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer noopener' : undefined} className={linkBaseClasses}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav className="justify-self-end text-[var(--color-white)]" aria-label="Primary">
                <ul className="flex list-none items-center gap-3 p-0 uppercase">
                  {siteLinks.map((link) => (
                    <li key={`desktop-${link.label}`}>
                      <a href={link.href} className={linkBaseClasses}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </footer>
          </div>
        </div>
      </section>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-50 bg-[var(--color-panel)] px-8 pb-10 pt-8 text-[var(--color-white)] transition-all duration-500 md:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex items-start justify-between">
          <FlowerLogo className="h-11 w-11 text-[var(--color-accent)]" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border-0 bg-transparent"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <MenuToggle open={true} accent />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="mt-14">
          <ul className="m-0 flex list-none flex-col gap-5 p-0">
            {mobileMenu.map((section, sectionIndex) => (
              <li key={section.label} className="overflow-hidden">
                <a
                  href={section.href}
                  className={`inline-block text-[clamp(2rem,6vw,2.75rem)] font-semibold leading-none tracking-[-0.02em] text-[var(--color-white)] transition-[transform,opacity] duration-500 ${
                    isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: isMobileMenuOpen ? `${70 + sectionIndex * 65}ms` : '0ms' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {section.label}
                </a>

                {section.children && (
                  <ul className="mt-3 list-none border-l-4 border-[var(--color-accent)] pl-4">
                    {section.children.map((child, childIndex) => (
                      <li key={`${section.label}-${child.label}`}>
                        <a
                          href={child.href}
                          className={`inline-block text-[clamp(1.125rem,4vw,1.5rem)] font-semibold text-[var(--color-accent)] transition-[transform,opacity] duration-500 ${
                            isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                          }`}
                          style={{ transitionDelay: isMobileMenuOpen ? `${130 + sectionIndex * 60 + childIndex * 55}ms` : '0ms' }}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Mobile social links" className="mt-14 text-center text-[clamp(0.9375rem,3vw,1.125rem)]">
          <ul className="flex list-none items-center justify-center gap-4 p-0">
            {socialLinks.map((link, index) => (
              <li key={`drawer-${link.label}`} className="inline-flex items-center gap-4">
                {index > 0 && <span className="text-[var(--color-white)]">/</span>}
                <a
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noreferrer noopener' : undefined}
                  className={linkBaseClasses}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <section id="yoga" className="min-h-screen bg-[var(--color-panel)] px-6 pb-24 pt-28 sm:px-10 md:px-12 md:pt-36 lg:px-16 xl:px-20">
        <p className="hidden items-center gap-2 text-[var(--color-accent)] md:flex">
          <FlowerLogo className="h-6 w-6" />
          <span className="font-display text-[clamp(1.125rem,1.1vw,1.5rem)] leading-none">Arveen Poonia</span>
        </p>
        <h2 className="mt-3 text-[clamp(3rem,7vw,6rem)] font-black uppercase leading-[0.9] tracking-[-0.03em] text-[var(--color-text)]">YOGA</h2>
        <p id="yoga-features" className="mt-10 max-w-3xl text-[clamp(1rem,0.3vw+0.875rem,1.25rem)] text-[var(--color-muted)]">
          Structured practice, less noise, and zero spiritual buzzword inflation.
        </p>
        <p id="yoga-enroll" className="mt-4 max-w-3xl text-[clamp(1rem,0.3vw+0.875rem,1.25rem)] text-[var(--color-muted)]">
          Enroll if you want discipline; scroll away if you want motivational posters.
        </p>
      </section>

      <section id="store" className="min-h-[60vh] bg-[var(--color-panel)] px-6 py-24 sm:px-10 md:px-12 lg:px-16 xl:px-20">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] text-[var(--color-text)]">Store</h2>
      </section>

      <section id="contact" className="min-h-[50vh] bg-[var(--color-panel)] px-6 pb-28 pt-16 sm:px-10 md:px-12 lg:px-16 xl:px-20">
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.95] tracking-[-0.02em] text-[var(--color-text)]">Contact</h2>
      </section>
    </main>
  );
}
