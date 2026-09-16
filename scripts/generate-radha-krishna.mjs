import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Convert the paired Radha–Krishna artwork into responsive colored ASCII.
const directory = new URL('../public/images/', import.meta.url);
await mkdir(directory, { recursive: true });
const columns = 240, rows = 200, size = 1920;
const cellWidth = size / columns, cellHeight = size / rows;
const source = new URL('../assets/radha-krishna-source.png', import.meta.url).pathname;
const { data } = await sharp(source)
  .resize(columns, rows, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
// Remove only light background connected to an edge, preserving white flowers.
const background = new Uint8Array(columns * rows);
const queue = [];
function visit(x, y) {
  if (x < 0 || y < 0 || x >= columns || y >= rows) return;
  const i = y * columns + x;
  if (background[i]) return;
  const [r, g, b] = data.subarray(i * 3, i * 3 + 3);
  if (Math.min(r, g, b) < 218 || Math.max(r, g, b) - Math.min(r, g, b) > 25) return;
  background[i] = 1;
  queue.push([x, y]);
}
for (let x = 0; x < columns; x++) { visit(x, 0); visit(x, rows - 1); }
for (let y = 0; y < rows; y++) { visit(0, y); visit(columns - 1, y); }
for (let i = 0; i < queue.length; i++) {
  const [x, y] = queue[i];
  visit(x - 1, y); visit(x + 1, y); visit(x, y - 1); visit(x, y + 1);
}
const cells = [];
const glyphs = '@WM%O*+=:.';
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < columns; x++) {
    const i = y * columns + x;
    if (background[i]) continue;
    const [r, g, b] = data.subarray(i * 3, i * 3 + 3);
    const light = (.2126 * r + .7152 * g + .0722 * b) / 255;
    const glyphIndex = Math.min(9, Math.floor(light * 8));
    const color = `rgb(${r},${g},${b})`;
    const px = x * cellWidth, py = (y + .82) * cellHeight;
    // Smaller, denser glyphs preserve facial landmarks and skin-tone continuity.
    const fontSize = light < .3 ? 14.5 : 13.2;
    const stroke = light < .3 ? .32 : .2;
    const text = (glyph) => `<text x="${px}" y="${py.toFixed(2)}" fill="${color}" stroke="${color}" stroke-width="${stroke}" font-size="${fontSize}">${glyph}</text>`;
    // A faint sampled color bed closes ivory gaps without hiding the characters.
    cells.push(`<rect x="${px}" y="${y * cellHeight}" width="${cellWidth}" height="${cellHeight}" fill="${color}" opacity=".18"/>`);
    cells.push(text(glyphs[glyphIndex]));

  }
}
function svg(content) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><g font-family="monospace" font-weight="bold" font-size="12.8">${content.join('')}</g></svg>`);
}
const portrait = svg(cells);
await sharp(portrait).webp({ quality: 90, alphaQuality: 95 }).toFile(new URL('radha-krishna-ascii.webp', directory).pathname);
await sharp(portrait).resize(1200).webp({ quality: 90, alphaQuality: 95 }).toFile(new URL('radha-krishna-ascii-mobile.webp', directory).pathname);
console.log(`Radha–Krishna portrait: ${cells.length / 2} colored ASCII glyphs.`);
