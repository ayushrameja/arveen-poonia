# Website expansion — 16 September 2026

## Design direction

Applied Designly's composition-director skill. Preserve the existing hero,
Google Sans, peacock mark, ivory (#faf9f5), forest green (#234e43), sage surfaces,
pill actions, desktop header, and mobile dock. Use a 1120px content grid with
48px desktop / 20px mobile margins, one dominant heading per section, generous
spacing and alternating quiet surfaces. New sections have no continuous motion.
The practice graphic is CSS geometry, not new illustrative imagery.

## Delivered

Expanded homepage; My Journey; searchable, filterable Explore library; Yoga
with batches, plans and native accessible FAQ disclosures; four-product store
showcase; Markdown journal and article template; custom 404; shared header/footer.
Navigation works without JavaScript. Video search and topic filtering progressively
enhance the complete static list; URL `?topic=Bhakti` (or `Journeys`) selects a topic.
Third-party players are not loaded: videos open directly on YouTube.

## Content sources

Retrieved public source HTML on 16 September 2026:

- https://www.youtube.com/@arveenpoonia31/videos — real video IDs and exact titles.
  Nine editorial selections; categories are website curation, not official channel
  categories. Thumbnails from i.ytimg.com, cropped only to remove 4:3 letterboxing
  and converted to WebP. No subscriber counts or invented durations.
- https://arveendivine.com — four exact product links and existing product photos;
  source image URLs retained in src/data/products.json. Converted to WebP without
  altering product details. No invented prices, stock, reviews or packaging.
- https://arveendivine.com/about-us/ — founder and devotional-products context.
- https://forms.gle/6dmPZJowfUUC3jiZ7 — online format, Monday–Friday, 6 AM / 7 PM IST,
  50–60 minutes; INR 1500 / 4000 / 7000 for 1 / 3 / 6 months; contact email.
  Payment details are not duplicated. Visitors use the existing form and its terms.

The existing enhanced Arveen portrait is reused; no new personal likeness created.
The two public journal articles are original website guides, not statements or
spiritual teachings attributed to Arveen. The personal-reflection template is draft.

## Before public launch

Review the editorial video selection, biography summary, guide copy and product
selection with Arveen. Confirm yoga availability, fees, and the intended general
contact email (currently the public yoga contact). Add authentic personal history
when provided. Set SITE_URL to the confirmed domain; previews remain noindex.
Nothing has been deployed or submitted to an external service.

## Verification

Astro/TypeScript checks and production build passed. Six existing hero lifecycle
and accessibility tests passed. Browser checks cover video filtering/search,
empty-state reset, FAQ expansion, and responsive layouts. Built-output audit checks
internal routes/assets, fragment IDs, metadata, and draft exclusion.
