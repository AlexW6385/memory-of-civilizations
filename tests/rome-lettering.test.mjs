// Rome's Latin capitals (src/settlements/rome/lettering.js; docs/settlements/rome.md §4.21): the alphabet is complete, every
// glyph's ink lies in its cell, the words the town writes can be written, and the raised letters face the way the reader is.
// With ROME_SHEET=/path/sheet.png the glyphs and the words are rasterised (from the ink the 3D letters are built from) so
// that each can be looked at.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { GLYPHS, canWrite, widthOf, inkOf, wallText, floorText } from '../src/settlements/rome/lettering.js';
import { WORDS } from '../src/settlements/rome/writing.js';

const ALPHABET = 'ABCDEFGHIKLMNOPQRSTVXYZ';
const area = (q) => Math.abs(q.reduce((s, p, i) => s + (p[0] * q[(i + 1) % 4][1] - q[(i + 1) % 4][0] * p[1]), 0)) / 2;

test('the alphabet: the 23 letters of the Empire, no J, U or W, and the interpunct', () => {
  for (const c of ALPHABET) assert.ok(GLYPHS[c], c);
  for (const c of 'JUW') assert.ok(!GLYPHS[c], c + ' did not exist');
  assert.ok(GLYPHS['·'] && GLYPHS[' ']);
  assert.equal(Object.keys(GLYPHS).length, ALPHABET.length + 2);
});

test('every glyph: its ink lies in its cell, has body, and is not wider than its advance', () => {
  for (const c of ALPHABET + '·') {
    const ink = inkOf(c), pts = ink.flat(), w = GLYPHS[c].w;
    const u0 = Math.min(...pts.map((p) => p[0])), u1 = Math.max(...pts.map((p) => p[0])), v0 = Math.min(...pts.map((p) => p[1])), v1 = Math.max(...pts.map((p) => p[1]));
    assert.ok(ink.length >= 1, c);
    const cell = widthOf(c) / 2;
    assert.ok(u0 >= -cell - 0.07 && u1 <= cell + 0.07, `${c} ink ${u0.toFixed(2)}…${u1.toFixed(2)} in ${w}`);
    if (c !== '·') assert.ok(v0 >= -0.13 && v0 <= 0.06 && v1 >= 0.94 && v1 <= 1.06, `${c} height ${v0.toFixed(2)}…${v1.toFixed(2)}`);
    // the ink is not a hairline: its area is a fair part of a stroke's
    assert.ok(ink.reduce((s, q) => s + area(q), 0) > (c === '·' ? 0.01 : 0.05), c);
  }
});

test('the words of the town can be written, with the letters of Latin', () => {
  for (const [k, v] of Object.entries(WORDS)) assert.ok(canWrite(v), `${k}: ${v}`);
  assert.ok(!canWrite('QVOD VIDES J'));
  assert.ok(Object.keys(WORDS).length >= 5);
});

test('raised letters face the reader: on a wall toward +z, on a floor up', () => {
  const g = wallText('SALVE', { at: [0, 0], y: 3, h: 0.5 }), p = g.attributes.position, n = g.attributes.normal;
  let front = 0, back = 0;
  for (let i = 0; i < p.count; i += 3) { if (n.getZ(i) > 0.99) front++; if (n.getZ(i) < -0.99) back++; }
  assert.ok(front > 20 && back === 0, `front ${front} back ${back}`);
  g.computeBoundingBox();
  assert.ok(g.boundingBox.min.y >= 3 - 0.07 && g.boundingBox.max.y <= 3.55 && g.boundingBox.max.z <= 0.0201 && g.boundingBox.min.z >= -1e-6);
  assert.ok(Math.abs(g.boundingBox.max.x + g.boundingBox.min.x) < 0.05, 'centred');
  // the floor: the text's top toward −z (north), its normals up
  const f = floorText('CAVE', { at: [10, -50], y: 0.01, h: 0.2 }), pf = f.attributes.position, nf = f.attributes.normal;
  let up = 0, down = 0;
  for (let i = 0; i < pf.count; i += 3) { if (nf.getY(i) > 0.99) up++; if (nf.getY(i) < -0.99) down++; }
  assert.ok(up > 10 && down === 0);
  f.computeBoundingBox();
  assert.ok(f.boundingBox.min.z > -50.0 - 0.21 && f.boundingBox.max.z < -50 + 0.03 && f.boundingBox.min.y >= 0.0099 && f.boundingBox.max.y < 0.0221);
});

// ── the sheet ────────────────────────────────────────────────────────────────────────────────────────
function crc(buf) { let c, crcv = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crcv ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcv = (crcv >>> 8) ^ c; } return (crcv ^ 0xffffffff) >>> 0; }
function png(w, h, gray) {
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w + 1)] = 0; for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = gray[y * w + x]; }
  const chunk = (type, data) => { const b = Buffer.alloc(12 + data.length); b.writeUInt32BE(data.length, 0); b.write(type, 4); data.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + data.length)), 8 + data.length); return b; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const inside = (q, x, y) => { let s = 0; for (let i = 0; i < 4; i++) { const a = q[i], b = q[(i + 1) % 4], c = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]); s += c >= 0 ? 1 : -1; } return Math.abs(s) === 4; };

test('the sheet (ROME_SHEET=path): letters and words, rasterised from the ink', { skip: !process.env.ROME_SHEET }, () => {
  const S = 90, rows = [ALPHABET.slice(0, 8), ALPHABET.slice(8, 16), ALPHABET.slice(16), ...Object.values(WORDS)];
  const W = 1500, H = rows.length * (S + 40) + 20, img = new Uint8Array(W * H).fill(235);
  rows.forEach((text, r) => {
    const gap = 0.35, wTot = widthOf(text, gap) * S, x0 = 20 + (r < 3 ? 0 : 0), y0 = 20 + r * (S + 40) + S;
    const sc = r < 3 ? S : Math.min(S, (W - 60) / widthOf(text, gap));
    const ink = inkOf(text, gap), cx = r < 3 ? 60 + wTot / 2 : W / 2;
    void x0;
    for (const q of ink) {
      const px = q.map(([u, v]) => [cx + u * sc, y0 - v * sc]);
      const xs = px.map((p) => p[0]), ys = px.map((p) => p[1]);
      for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(H - 1, Math.ceil(Math.max(...ys))); y++) for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(W - 1, Math.ceil(Math.max(...xs))); x++) if (inside(px, x + 0.5, y + 0.5)) img[y * W + x] = 20;
    }
  });
  writeFileSync(process.env.ROME_SHEET, png(W, H, img));
});
