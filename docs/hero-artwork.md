# Krishna hero artwork

## Design direction

A centered, ivory homepage built with the Designly director, composition, typography, prompt compiler and visual QA guidance. Krishna is the single primary focal point. The greeting and two separate actions sit below the face and flute. The peacock mark lives in the compact bottom dock; there is no top navigation or competing brand text.

Exact copy: “Hare Krishna.” / “A little devotion, every day.” / “Explore” / “My Journey”.

The original generated portrait is an artistic interpretation inspired by the black complexion, painted eyes, golden flute, jewels and flower garlands seen in [Mayapur’s Janmastami imagery](https://www.mayapur.com/festivals/Sri-Krishna-Janmastami). It is not an official temple photograph.

## Assets and generation

Tool mode: built-in image generation, generate (not CLI).
Source: `assets/krishna-color-source.png` (kept outside public so it is not deployed).
Final prompt:

> Use case: stylized-concept. Asset type: source portrait for conversion into colorful ASCII on an ivory devotional website. Generate a single reverent temple-deity portrait of Lord Krishna, inspired by the Sri Madhava deity at ISKCON Mayapur. Krishna has a DEEP JET BLACK polished stone complexion, large expressive almond-shaped painted eyes outlined in ivory and gold, a fine vertical Vaishnava tilak, small warm red lips with a gentle smile, long black hair. Two natural graceful hands hold one slender golden flute horizontally near his lips, flute fully visible. Ornate tall golden crown with emerald and ruby jewels, one prominent green-blue peacock feather; richly saturated teal and saffron silk garments, pearl necklaces and gold jewelry, cascading garlands of white jasmine, pink-red roses and small yellow flowers. Make the face large and readable, dark luminous sculpted facial planes rather than blue skin. Composition: square canvas, single centered head-to-waist portrait, feather and crown completely inside top boundary with 6 percent clearance; both arms and entire flute inside side boundaries, lower garment at bottom. No other figures, altar, scenery, lettering or watermark. Plain uniform warm ivory background #faf9f5, no cast shadow, no halo. Soft frontal light revealing black sculptural form and colorful garment textures. This is a temple deity with delicate lifelike craftsmanship, not a cartoon or human actor. Output detailed full-color source image; do not add ASCII lettering because deterministic conversion is done afterward.

Run `pnpm assets:ascii` after changing the source. `scripts/generate-ascii.mjs` samples 150 × 125 cells, removes background connected to image edges, and rasterizes colored ASCII into responsive WebP assets:

- `public/images/krishna-color-ascii.webp`: desktop portrait.
- `public/images/krishna-color-ascii-mobile.webp`: 800px variant.
- `public/images/krishna-texture.webp`: small 1440 × 300 garment strip.

11,182 glyphs form the portrait. Dark glyphs are denser to retain the black complexion on ivory; lighter ornament glyphs have more space. A deterministic selection of 140 colored interior garment cells changes. The source and final assets remain editable/reproducible.

## Motion and performance

The browser renders one portrait image plus one small texture strip. Only the strip changes opacity using a CSS step animation every four seconds. There is no canvas, requestAnimationFrame loop, timer, per-character DOM, rotating full-size halo or backdrop blur. The face, hands, crown, flute and silhouette remain still. Static HTML works without JavaScript.

Event-driven controls pause the animation when hidden, offscreen, manually paused, or reduced motion is enabled. Reduced-motion CSS independently hides the changing strip and control, even without JavaScript. No device-temperature or power measurement is claimed.

## Typography and interface

Self-hosted Google Sans variable Latin font, weights 400–700, fetched from the Google Fonts stylesheet. Google’s [upstream repository](https://github.com/googlefonts/googlesans) confirms SIL OFL distribution. License saved in `public/fonts/OFL-GoogleSans.txt`. No external font requests at runtime.

The two CTA anchors have independent hover states, bold text, no icons, and visible keyboard focus. Explore links to channel videos; My Journey links to the channel About page until an on-site journey page exists. The bottom dock preserves Home, Yoga and Divine Store destinations.

## Validation

- `pnpm test`: background visibility, manual pause, reduced-motion changes, offscreen behavior and cleanup after late image decoding.
- `pnpm build`: Astro/TypeScript checks and static production build.
- Browser review at desktop and phone sizes, including actual 320px width, with no horizontal overflow or CTA/dock overlap.

