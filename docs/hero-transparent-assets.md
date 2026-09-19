# Transparent hero portraits

Created using the built-in imagegen tool, with the existing portraits as edit targets.
The original artwork and opaque portraits used outside the hero are preserved.

Sources:
- `assets/arveen-hero-transparent.png`
- `assets/radha-krishna-hero-transparent.png`

Responsive outputs: `public/images/hero-{arveen,radha-krishna}-portrait-{width}.{avif,webp}`.
Regenerate with `node scripts/generate-hero-portraits.mjs` (also included in `pnpm assets:portraits`).
AVIF sizes: 640, 768, 960, 1280. WebP sizes: 640, 1280. All encodings preserve alpha.

## Shared edit prompt

Use case: background-extraction. Edit target: the attached existing website hero portrait. Remove only the off-white/cream background and return a genuinely transparent RGBA PNG cutout, not a checkerboard painted into the image. Keep the exact same square canvas, subject position, scale, cropping, identity, facial features, expression, colors, lighting, clothing, jewelry and all foreground details unchanged. Preserve fine hair and ornament edges with clean natural alpha, no white halo. Do not redraw, beautify, restyle or add anything. Replace pale background and any bottom white background fade with transparency, preserving actual white foreground details.

## Arveen-specific instructions

Subject: Arveen wearing a lilac kurta. Preserve all of the lilac fabric, face, teeth and forehead marking.

## Radha–Krishna-specific instructions

Subject: the existing Radha–Krishna devotional artwork. Preserve the faces, crowns, fine peacock feather, flute, dangling ornaments, white flowers and pearls, and all garment details exactly. Remove the background in the small gaps around the flute, hands and crowns as well. Make the existing white haze at the bottom a transparent fade rather than an opaque white glow.
