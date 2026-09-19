# Arveen Poonia

Static Astro website with TypeScript and Tailwind CSS. The homepage features
clear portraits of Arveen and Radha–Krishna, coordinated scene copy and backgrounds,
a desktop header navigation, and a persistent mobile dock.

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
pnpm test:navigation http://localhost:4321  # Browser checks against the running preview
pnpm assets:portraits  # Encode the clear source portraits as responsive WebP + AVIF files
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
- `src/components/HeroPortrait.astro`: responsive clear portrait images.
- `src/scripts/hero-scene.ts`: synchronized scene switching and playback controls.
- `scripts/generate-portraits.mjs`: responsive WebP encoding of existing source artwork.
- `docs/hero-artwork.md`: design decisions, artwork prompt and performance notes.
- `src/pages/robots.txt.ts`: generated crawler instructions.
- `astro.config.mjs`: static output, Tailwind, and sitemap configuration.

Use the shared layout for future pages and supply a unique title and description.
Add actual social images when the design is ready. Journal articles use Markdown;
no application state library or CMS is required.

Internal navigation uses Astro's client router with short exit/entry transitions.
Initialize page behavior with `onPageReady` and dispose observers/listeners on
`astro:before-swap`. This starts the first page before images finish loading and
avoids duplicate initialization when Astro announces it again. The homepage
welcome runs once per tab session (including reloads); its first-scene images
decode behind the greeting, with a bounded wait for slow connections.

## Pages and content editing

The homepage leads to `/about/`, `/explore/`, `/yoga/`, `/shop/`, and `/journal/`.
All pages share the existing ivory/sage design, desktop header, mobile dock and
footer. Internal calls to action stay in the same tab; external destinations
open in a new tab. The custom 404 page is always marked noindex.

- **Videos:** edit `src/data/videos.json`. Store the matching optimized 480×270
  thumbnail at `public/images/videos/<id>.webp`. Topic filters and search enhance
  a static, fully readable list; watching opens the original YouTube video.
- **Products:** edit `src/data/products.json`. Use actual product photos and exact
  store URLs. `sourceImage` records provenance; the site serves local WebP assets.
  Prices and checkout remain on the external store.
- **Yoga:** update the details in `src/pages/yoga.astro` from the registration
  form and change its checked date. Keep the current registration flow external.
- **Journal:** add Markdown in `src/content/journal/` with `title`, `description`,
  `category`, and `readTime` frontmatter. The filename becomes the URL slug.
  `draft: true` excludes an article from both the listing and generated routes.
  Two neutral website guides are included; personal reflections should be
  provided or reviewed by Arveen before publication.

Content provenance, launch review items, and design decisions are recorded in
`docs/website-expansion.md`.

## Performance

See [the performance review](docs/performance.md) for measured before/after results,
resource usage, targets, and limitations. To profile a running production preview:

```sh
pnpm perf:audit http://127.0.0.1:4323/ current
pnpm perf:motion http://127.0.0.1:4323/ current 3
```

HTML reports, JSON measurements, screenshots, and Chrome traces are written to
`reports/performance/`. Run audits sequentially for comparable results.
