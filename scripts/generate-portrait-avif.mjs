import sharp from 'sharp';
// Extra responsive sizes avoid downloading a 1280px portrait for a ~660px mobile raster.
for (const [name, source] of [
  ['arveen-portrait', 'arveen-profile-enhanced.png'],
  ['radha-krishna-portrait', 'radha-krishna-source.png'],
]) {
  for (const width of [640, 768, 960, 1280]) {
    await sharp(new URL(`../assets/${source}`, import.meta.url).pathname)
      .resize(width, width, { fit: 'contain', background: '#faf9f5' })
      .avif({ quality: 55, effort: 6 })
      .toFile(new URL(`../public/images/${name}-${width}.avif`, import.meta.url).pathname);
  }
}
console.log('Generated responsive AVIF portraits; WebP fallbacks preserved.');
