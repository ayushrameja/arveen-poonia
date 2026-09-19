import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Hero-only cutouts reveal the shared page canvas throughout chapter fades.
// Keep the opaque portraits used elsewhere and the original artwork intact.
const directory = new URL('../public/images/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const name of ['arveen', 'radha-krishna']) {
  const source = new URL(`../assets/${name}-hero-transparent.png`, import.meta.url).pathname;
  if (!(await sharp(source).metadata()).hasAlpha) {
    throw new Error(`Hero source must have transparency: ${source}`);
  }
  for (const width of [640, 768, 960, 1280]) {
    const portrait = sharp(source).resize(width, width, {
      fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    await portrait.clone().avif({ quality: 55, effort: 6 })
      .toFile(new URL(`hero-${name}-portrait-${width}.avif`, directory).pathname);
    if (width === 640 || width === 1280) {
      await portrait.clone().webp({ quality: 90, alphaQuality: 100 })
        .toFile(new URL(`hero-${name}-portrait-${width}.webp`, directory).pathname);
    }
  }
}
console.log('Generated transparent hero portraits in AVIF and WebP.');
