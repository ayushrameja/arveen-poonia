import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// Convert the two generated chanting poses into aligned colored ASCII frames.
const directory = new URL('../public/images/', import.meta.url);
await mkdir(directory, { recursive: true });
const columns = 150, rows = 125, size = 1440;
const cellWidth = size / columns, cellHeight = size / rows;
const source = new URL('../assets/arveen-chanting-source.png', import.meta.url).pathname;
const metadata = await sharp(source).metadata();
const frameWidth = Math.floor(metadata.width / 2);
for (let frame = 0; frame < 2; frame++) {
const { data } = await sharp(source)
  .extract({ left: frame * frameWidth, top: 0, width: frameWidth, height: metadata.height })
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
const cells = [], changes = [];
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
    // Dense, slightly overlapping dark glyphs retain Krishna's black complexion
    // on ivory; sparse light glyphs would otherwise wash the whole face gray.
    const fontSize = light < .3 ? 18.8 : 15;
    const stroke = light < .3 ? .45 : .2;
    const text = (glyph) => `<text x="${px}" y="${py.toFixed(2)}" fill="${color}" stroke="${color}" stroke-width="${stroke}" font-size="${fontSize}">${glyph}</text>`;
    cells.push(text(glyphs[glyphIndex]));
    // Sparse colored cloth below the arms only. Never face, hands or silhouette.
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    const interior = x > 8 && x < columns - 9 && !background[i - 2] && !background[i + 2];
    if (y > rows * .73 && y < rows * .91 && interior && saturation > 65 && (x * 17 + y * 31) % 11 === 0) {
      changes.push(`<rect x="${px}" y="${y * cellHeight}" width="${cellWidth}" height="${cellHeight}" fill="#faf9f5"/>${text(glyphs[(glyphIndex + 1) % 7])}`);
    }
  }
}
function svg(content) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><g font-family="monospace" font-weight="bold" font-size="12.8">${content.join('')}</g></svg>`);
}
const portrait = svg(cells);
await sharp(portrait).webp({ quality: 88, alphaQuality: 95 }).toFile(new URL(`arveen-chanting-${frame + 1}.webp`, directory).pathname);
await sharp(portrait).resize(800).webp({ quality: 88, alphaQuality: 95 }).toFile(new URL(`arveen-chanting-${frame + 1}-mobile.webp`, directory).pathname);
console.log(`Chanting frame ${frame + 1}: ${cells.length} colored ASCII glyphs.`);
}
