# Arveen Poonia

Static Astro website with TypeScript and Tailwind CSS. The homepage features
a centered colorful Krishna ASCII portrait, a light theme, and a compact dock.

## Local development

```sh
pnpm install
pnpm dev
```

Open http://localhost:4321. pnpm uses the pinned Node.js 24.21.0 LTS runtime.

```sh
pnpm check    # Astro and TypeScript diagnostics
pnpm test     # Animation accessibility and lifecycle checks
pnpm build    # Check and generate static HTML in dist/
pnpm preview  # Preview the production build
```

## SEO and deployment

Copy `.env.example` to `.env` and set `SITE_URL` to the confirmed production
origin, including `https://`. Alternatively, set it in your build environment.
Rebuild after changing it. No production domain is assumed.

The shared layout supports page titles, descriptions, canonical URLs,
Open Graph and Twitter metadata, optional social images and alt text, and a
`noindex` prop. Astro renders the content directly into HTML.

With `SITE_URL` configured, builds generate a sitemap and robots.txt pointing
to it. Without it, the starter emits noindex metadata and disallows crawling.
Leave it unset for preview deployments.

## Structure

- `src/pages/index.astro`: devotional homepage and navigation.
- `src/layouts/BaseLayout.astro`: shared document and SEO metadata.
- `src/styles/global.css`: typography, responsive layout and motion.
- `scripts/generate-ascii.mjs`: offline color ASCII conversion.
- `docs/hero-artwork.md`: design decisions, artwork prompt and performance notes.
- `src/pages/robots.txt.ts`: generated crawler instructions.
- `astro.config.mjs`: static output, Tailwind, and sitemap configuration.

Use the shared layout for future pages and supply a unique title and description.
Add actual social images when the design is ready. Markdown articles can be
added later; no example content or application state libraries are included.
