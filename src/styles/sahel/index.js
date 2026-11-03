// Sudano-Sahelian architecture of Djenné (docs/settlements/djenne.md §4–§5): walls of sun-dried
// mudbrick under banco plaster, thick and battered, ribbed with pilasters that rise above the roof
// as conical pinnacles; bundles of palm-wood sticks (toron) standing out of the walls as scaffolding
// for the yearly replastering; flat roofs on palm beams, drained by clay spouts; the Great Mosque on
// its high platform with three towers on its qibla wall; town houses of two storeys with a
// buttressed facade round the door (the "Tukulor" front), roof terraces behind parapets.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const B = 'banco';
/** A square, tapering mass (flat faces): half-width r0 at y0 to r1 at y1, a cone of height cap on top. */
function taper(bag, x, z, y0, y1, r0, r1, cap = 0) {
  bag.add(B, frustum([x - r0, z - r0, x + r0, z + r0], y0, y1, r0 - r1, r0 - r1, r0 - r1, r0 - r1));
  if (cap > 0) bag.add(B, lathe([[r1 * 1.05, 0], [r1 * 0.6, cap * 0.6], [0.05, cap]], 8, null, x, y1, z));
}

/** A wall of banco from a to b { h, th, batter }: a slab leaning in a little, pilasters every `step` m rising above it as pinnacles, rows of toron. */
function bancoWall(bag, col, a, b, y, h, th, opts = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.2) return;
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, out = opts.out ?? 1;
  const t = [];
  beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h);
  bag.add(B, fromTriangles(t));
  col.segment(a, b, th, y, y + h);
  const step = opts.step ?? 3.2, n = Math.max(1, Math.round(L / step)), pw = opts.pw ?? 0.7, pd = opts.pd ?? 0.55, ph = opts.ph ?? 1.4;
  const rand = rng(opts.seed || 3);
  for (let k = 0; k <= n; k++) {
    const s = k * L / n, x = a[0] + ux * s + nx * (th / 2 + pd / 2) * out, z = a[1] + uz * s + nz * (th / 2 + pd / 2) * out;
    // the pilaster, battered: wider at its foot
    taper(bag, x, z, y, y + h, pw * 0.8, pw * 0.6, ph);
    // toron: palm sticks standing out in rows
    if (opts.toron !== false) for (let r = 1; r <= Math.floor(h / 1.8); r++) if (rand() < 0.8) {
      const ty = y + r * 1.8 - 0.4, tx = a[0] + ux * (s + step * 0.5) + nx * (th / 2) * out, tz = a[1] + uz * (s + step * 0.5) + nz * (th / 2) * out;
      if (s + step * 0.5 > L) continue;
      const tt = [];
      beamTris(tt, [tx, ty, tz], [tx + nx * 0.7 * out, ty, tz + nz * 0.7 * out], 0.05, 0.08);
      bag.add('timber', fromTriangles(tt));
    }
  }
}

/**
 * great_mosque: the Great Mosque { c, a (half the platform), py (platform height) }: the platform
 * with its stairs; the prayer hall on the east half (its roof on rows of thick pillars, vents), the
 * court on the west half within high walls; the qibla wall with three square towers crowned with
 * pinnacles and ostrich eggs; entrance towers on the north wall.
 */
function greatMosque(el, { bag, col }) {
  const [cx, cz] = el.c, A = el.a, py = el.py ?? 3;
  bag.add('banco_smooth', box(cx - A, -0.4, cz - A, cx + A, py, cz + A));
  col.floor([cx - A, cz - A, cx + A, cz + A], py);
  col.rect([cx - A, cz - A, cx + A, cz + A], -0.4, py - 0.31);
  for (const [r, dir] of [[[cx - 6, cz + A, cx + 6, cz + A + 5], 'n'], [[cx - 6, cz - A - 5, cx + 6, cz - A], 's'], [[cx - A - 5, cz - 5, cx - A, cz + 5], 'e']]) STYLES.qing.elements.stairs({ rect: r, y0: 0, y1: py, dir, mat: 'banco_smooth' }, { bag, col });
  // the walls: the hall (east part) and the court (west part)
  const x0 = cx - A + 4, x1 = cx + A - 4, z0 = cz - A + 8, z1 = cz + A - 8, xm = cx + 2, H = 10;
  const w = (a, b, opts = {}) => bancoWall(bag, col, a, b, py, opts.h ?? H, 0.9, { step: 3, ph: 2.2, ...opts });
  w([x1, z0], [x1, z1], { out: -1, h: 11 });                             // the qibla wall (east), pilasters outside
  w([x0, z0], [x1, z0], { out: -1 }); w([x1, z1], [x0, z1], { out: -1 });
  w([x0, z1], [x0, (z0 + z1) / 2 + 3], { out: -1, h: 7 }); w([x0, (z0 + z1) / 2 - 3], [x0, z0], { out: -1, h: 7 });
  w([xm, z0 + 1], [xm, z1 - 1], { out: 1, h: 9, toron: false });          // the hall's west wall on the court
  // the hall's roof on its pillars: rows of thick square pillars, the flat roof with its vents
  for (let i = 0; i < 5; i++) for (let j = 0; j < 9; j++) {
    const x = xm + (x1 - xm) * (i + 0.5) / 5, z = z0 + (z1 - z0) * (j + 0.5) / 9;
    bag.add('banco_smooth', box(x - 0.9, py, z - 0.9, x + 0.9, py + 9.6, z + 0.9));
    col.rect([x - 0.9, z - 0.9, x + 0.9, z + 0.9], py, py + 9.6);
  }
  bag.add('timber', box(xm, py + 9.6, z0, x1, py + 9.9, z1));
  bag.add('banco_smooth', box(xm - 0.5, py + 9.9, z0 - 0.5, x1 + 0.5, py + 10.5, z1 + 0.5));
  col.floor([xm, z0, x1, z1], py + 10.5);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) {
    const x = xm + (x1 - xm) * (i + 1) / 5, z = z0 + (z1 - z0) * (j + 1) / 7;
    bag.add('banco_smooth', lathe([[0.5, 0], [0.45, 0.8], [0.55, 0.85], [0.001, 1.0]], 8, null, x, py + 10.5, z));
  }
  // the three towers on the qibla wall, rising 16 m above the platform with their pinnacles
  for (const [zz, s] of [[cz, 1.2], [cz - 13, 1], [cz + 13, 1]]) {
    const tw = 3.2 * s, th = 16 * s;
    taper(bag, x1 + 1.6, zz, py, py + th, tw * 1.2, tw);
    bag.add('banco_smooth', box(x1 + 1.6 - tw - 0.15, py + th - 0.4, zz - tw - 0.15, x1 + 1.6 + tw + 0.15, py + th, zz + tw + 0.15));
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
      const px = x1 + 1.6 + dx * tw * 0.75, pz = zz + dz * tw * 0.75, ph = dx || dz ? 3 : 4.5;
      bag.add(B, lathe([[0.55, 0], [0.4, ph * 0.7], [0.08, ph]], 8, null, px, py + th, pz));
      bag.add('tura_limestone', lathe([[0.001, 0], [0.18, 0.12], [0.2, 0.28], [0.001, 0.48]], 8, null, px, py + th + ph, pz));     // the ostrich egg
    }
    for (let r = 1; r < 8; r++) for (let k = -1; k <= 1; k++) {
      const tt = [];
      beamTris(tt, [x1 + 1.6 + tw * 1.15, py + r * 2, zz + k * tw * 0.5], [x1 + 1.6 + tw * 1.15 + 0.8, py + r * 2, zz + k * tw * 0.5], 0.06, 0.09);
      bag.add('timber', fromTriangles(tt));
    }
    col.rect([x1 + 1.6 - tw * 1.2, zz - tw * 1.2, x1 + 1.6 + tw * 1.2, zz + tw * 1.2], py, py + th);
  }
  // the north entrance towers
  for (const xx of [cx - 10, cx + 12]) {
    taper(bag, xx, z1 + 1, py, py + 13, 2.4, 2, 1.6);
  }
}

/**
 * sahel_house: a town house { rect, front ('n'|'s'|'e'|'w'), storeys, seed }: banco walls, a flat
 * roof with a parapet, on the street side the facade: pilasters up to pinnacles framing the door,
 * a canopy over it, a small window above; a court behind with a lower room.
 */
function sahelHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, st = el.storeys ?? (rand() < 0.65 ? 2 : 1), H = st * 3.1, th = 0.5;
  bag.add(B, box(x0, 0, z0, x1, H, z1));
  bag.add('banco_smooth', box(x0 - 0.1, H, z0 - 0.1, x1 + 0.1, H + 0.15, z1 + 0.1));
  // the parapet round the roof terrace
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) { const t = []; beamTris(t, [a[0], H, a[1]], [b[0], H, b[1]], 0.18, 0.9); bag.add(B, fromTriangles(t)); }
  col.rect([x0, z0, x1, z1], 0, H);
  col.floor([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], H + 0.15);
  // the facade
  const f = el.front || 's';
  const [a, b] = f === 's' ? [[x0, z1], [x1, z1]] : f === 'n' ? [[x1, z0], [x0, z0]] : f === 'e' ? [[x1, z1], [x1, z0]] : [[x0, z0], [x0, z1]];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = uz, nz = -ux;   // n: outward
  const mid = L / 2;
  // pilasters: two framing the door, two at the corners, rising above the parapet as pinnacles
  for (const s of [0.25, mid - 1.2, mid + 1.2, L - 0.25]) {
    const px = a[0] + ux * s + nx * 0.25, pz = a[1] + uz * s + nz * 0.25, ph = H + (s === mid - 1.2 || s === mid + 1.2 ? 2.4 : 1.4);
    taper(bag, px, pz, 0, ph * 0.85, 0.45, 0.32, ph * 0.15);
  }
  // the door, the canopy over it, the window above
  const dx = a[0] + ux * mid + nx * 0.02, dz = a[1] + uz * mid + nz * 0.02;
  bag.add('timber', box(dx - Math.abs(ux) * 0.7 - Math.abs(nx) * 0.05, 0, dz - Math.abs(uz) * 0.7 - Math.abs(nz) * 0.05, dx + Math.abs(ux) * 0.7 + Math.abs(nx) * 0.05, 2.2, dz + Math.abs(uz) * 0.7 + Math.abs(nz) * 0.05));
  bag.add('banco_smooth', box(dx - Math.abs(ux) * 1.3 + Math.min(0, nx), 2.5, dz - Math.abs(uz) * 1.3 + Math.min(0, nz), dx + Math.abs(ux) * 1.3 + Math.max(0, nx), 2.75, dz + Math.abs(uz) * 1.3 + Math.max(0, nz)));
  if (st > 1) bag.add('lacquer_black', box(dx - Math.abs(ux) * 0.4 - Math.abs(nx) * 0.04, 4.1, dz - Math.abs(uz) * 0.4 - Math.abs(nz) * 0.04, dx + Math.abs(ux) * 0.4 + Math.abs(nx) * 0.04, 4.9, dz + Math.abs(uz) * 0.4 + Math.abs(nz) * 0.04));
  // toron in a row high on the facade, clay spouts from the roof
  for (let k = 1; k < 4; k++) {
    const tx = a[0] + ux * L * k / 4, tz = a[1] + uz * L * k / 4, t = [];
    beamTris(t, [tx, H - 0.6, tz], [tx + nx * 0.6, H - 0.6, tz + nz * 0.6], 0.05, 0.08);
    bag.add('timber', fromTriangles(t));
  }
  const t2 = [], sx = a[0] + ux * L * 0.8, sz = a[1] + uz * L * 0.8;
  beamTris(t2, [sx, H + 0.1, sz], [sx + nx * 0.9, H + 0.05, sz + nz * 0.9], 0.1, 0.14);
  bag.add('banco_smooth', fromTriangles(t2));
}

/** sahel_wall: a plain banco wall (courts, the market) { a, b, h }. */
function sahelWall(el, { bag, col }) { bancoWall(bag, col, el.a, el.b, el.y ?? 0, el.h ?? 2.6, 0.45, { step: 4, ph: 0.6, toron: false, pw: 0.4, pd: 0.3 }); }

/** market_stall: a stall of the market { c, s }: four poles and a mat roof, goods on a low table. */
function marketStall(el, { bag }) {
  const [x, z] = el.c, s = el.s ?? 1.6;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('timber', box(x + dx * s - 0.05, 0, z + dz * s - 0.05, x + dx * s + 0.05, 2.2, z + dz * s + 0.05));
  bag.add('reed_mat', box(x - s - 0.3, 2.2, z - s - 0.3, x + s + 0.3, 2.28, z + s + 0.3));
  bag.add('timber', box(x - s * 0.8, 0, z - s * 0.5, x + s * 0.8, 0.6, z + s * 0.5));
}

registerStyle('sahel', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, great_mosque: greatMosque, sahel_house: sahelHouse, sahel_wall: sahelWall, market_stall: marketStall },
  objects: {},
});
