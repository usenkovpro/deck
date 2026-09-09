/**
 * Generates the app icons.
 *
 * Deck has no dependencies and this script keeps it that way: Node can already
 * deflate, and a PNG is a deflated bitmap wrapped in four chunks, so the encoder
 * below is about forty lines.
 *
 * The mark is a letter D. There is no font to draw it with here, so it is built
 * from geometry instead: a straight stem, plus the right half of an elliptical ring
 * for the bowl. That also keeps it identical at every size.
 *
 *   node scripts/make-icons.mjs
 *
 * Commit the results. This only needs running when the mark changes.
 */

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const BG = [18, 21, 26];
const ACCENT = [107, 155, 255];

/**
 * `content` is the fraction of the icon the mark may occupy, measured as a radius.
 * Maskable icons get a smaller one because Android crops them to whatever shape the
 * launcher likes, and anything outside the middle 80% can be cut off.
 */
const TARGETS = [
  { file: "icon-192.png", size: 192, content: 0.45 },
  { file: "icon-512.png", size: 512, content: 0.45 },
  { file: "icon-maskable-512.png", size: 512, content: 0.36 },
  { file: "apple-touch-icon.png", size: 180, content: 0.45 },
];

/** The letter D, as numbers. All measurements derive from the content radius. */
function letterD(size, content) {
  const middle = size / 2;
  const r = size * content;

  // A D is taller than it is wide, and an app icon needs air around the mark, so
  // the bowl is deliberately narrower and shorter than the space available.
  const stroke = r * 0.26;
  const ry = r * 0.82;
  const rx = r * 0.70;

  // The letter runs from cx - stroke/2 to join + rx, so centre it on that span.
  const cx = middle - rx / 2;

  return {
    cx,
    cy: middle,
    stroke,
    rx,
    ry,
    top: middle - ry,
    bottom: middle + ry,
    // The bowl is anchored to the stem's right edge, where the ellipse is still at
    // its full height. Anchoring it to the stem's centre instead leaves a small
    // step at the top and bottom of the join, because the ellipse starts falling
    // away immediately.
    join: cx + stroke / 2,
    innerX: rx - stroke,
    innerY: ry - stroke,
  };
}

function insideD(x, y, d) {
  // The stem: a straight bar down the left.
  if (Math.abs(x - d.cx) <= d.stroke / 2 && y >= d.top && y <= d.bottom) {
    return true;
  }

  // The bowl: the right half of an elliptical ring.
  if (x < d.join) return false;
  const nx = (x - d.join) / d.rx;
  const ny = (y - d.cy) / d.ry;
  if (nx * nx + ny * ny > 1) return false;

  const ix = (x - d.join) / d.innerX;
  const iy = (y - d.cy) / d.innerY;
  return ix * ix + iy * iy > 1;
}

/** Coverage of one pixel by the mark, sampled 4x4 to get smooth edges. */
function coverage(px, py, size, content) {
  const d = letterD(size, content);

  let hits = 0;
  const STEPS = 4;
  for (let sy = 0; sy < STEPS; sy++) {
    for (let sx = 0; sx < STEPS; sx++) {
      if (
        insideD(px + (sx + 0.5) / STEPS, py + (sy + 0.5) / STEPS, d)
      ) {
        hits++;
      }
    }
  }
  return hits / (STEPS * STEPS);
}

function drawIcon(size, content) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const a = coverage(x, y, size, content);
      const i = (y * size + x) * 4;
      for (let c = 0; c < 3; c++) {
        rgba[i + c] = Math.round(BG[c] + (ACCENT[c] - BG[c]) * a);
      }
      rgba[i + 3] = 255; // Opaque: iOS puts its own rounded mask over the top.
    }
  }
  return rgba;
}

// --- Minimal PNG encoder ---------------------------------------------------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePNG(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  // 10, 11, 12 are compression, filter and interlace: all zero, the only values
  // the PNG spec defines.

  // Each scanline is prefixed with its filter type. Zero means "store as is",
  // which costs a few bytes and saves implementing the other four filters.
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Go --------------------------------------------------------------------

mkdirSync(OUT, { recursive: true });
for (const { file, size, content } of TARGETS) {
  const png = encodePNG(size, drawIcon(size, content));
  writeFileSync(join(OUT, file), png);
  console.log(`${file}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} kB`);
}
