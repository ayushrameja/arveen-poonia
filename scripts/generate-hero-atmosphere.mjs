import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Bake the soft colour pools and fine grain once, instead of filtering and
// blending several full-screen layers on every animation frame.
const width = 480;
const height = 640;
const directory = new URL('../public/images/', import.meta.url);
await mkdir(directory, { recursive: true });
const palettes = {
  'personal-left': [[.3, .34, .46, .3, [226, 179, 92], .33], [.2, .72, .4, .24, [107, 167, 150], .22]],
  'personal-right': [[.68, .35, .44, .29, [206, 144, 158], .29], [.8, .68, .4, .28, [115, 170, 159], .23]],
  'divine-left': [[.28, .36, .48, .31, [225, 176, 77], .37], [.23, .7, .45, .25, [205, 177, 97], .24]],
  'divine-right': [[.72, .38, .46, .32, [105, 161, 155], .31], [.78, .7, .42, .24, [216, 186, 111], .21]],
};
for (const [name, pools] of Object.entries(palettes)) {
  const pixels = Buffer.alloc(width * height * 4);
  let seed = 29;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const u = x / (width - 1);
    const v = y / (height - 1);
    let alpha = 0;
    const rgb = [0, 0, 0];
    for (const [cx, cy, rx, ry, color, strength] of pools) {
      const weight = Math.exp(-2 * (((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2)) * strength;
      alpha += weight;
      color.forEach((channel, i) => { rgb[i] += channel * weight; });
    }
    // Transparent perimeter keeps both drifting textures seamless on any paper tone.
    const fade = Math.min(1, u * 12, (1 - u) * 12) * Math.sin(Math.PI * v) ** 2;
    seed = (1664525 * seed + 1013904223) >>> 0;
    const grain = ((seed / 4294967296) - .5) * 12;
    const offset = (y * width + x) * 4;
    rgb.forEach((channel, i) => { pixels[offset + i] = Math.max(0, Math.min(255, channel / alpha + grain)); });
    pixels[offset + 3] = Math.round(Math.min(.6, alpha) * fade * 255);
  }
  await sharp(pixels, { raw: { width, height, channels: 4 } })
    .webp({ quality: 88, alphaQuality: 95 }).toFile(new URL(`hero-${name}.webp`, directory).pathname);
}
console.log('Generated four small, transparent hero atmosphere textures.');
