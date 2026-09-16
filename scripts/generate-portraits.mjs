import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Responsive encodings of the existing source artwork; no generated likeness changes.
const directory = new URL('../public/images/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const [name, source] of [
  ['arveen-portrait', 'arveen-profile-enhanced.png'],
  ['radha-krishna-portrait', 'radha-krishna-source.png'],
]) {
  for (const width of [640, 1280]) {
    await sharp(new URL(`../assets/${source}`, import.meta.url).pathname)
      .resize(width, width, { fit: 'contain', background: '#faf9f5' })
      .webp({ quality: 90 })
      .toFile(new URL(`${name}-${width}.webp`, directory).pathname);
  }
}
console.log('Generated responsive clear portraits.');
