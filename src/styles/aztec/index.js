// Mexica architecture of Tenochtitlan (1487–1519; docs/settlements/tenochtitlan.md §4): the Templo
// Mayor — four sloping terraces stuccoed white, two stairways side by side on the west between
// balustrades that steepen near the top and end in serpent heads, the twin shrines (Tlaloc's
// painted blue and white, Huitzilopochtli's red and white) with their tall roofs; the round
// temple of Ehecatl; the ballcourt; the serpent wall; palaces and houses of plastered adobe round
// patios; the canals, their walls and canoes (from the ming style).

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../maya/index.js';

const W = 'plaster_white', R = 'stucco_red', B = 'maya_blue';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const stairs = (el, ctx) => STYLES.qing.elements.stairs(el, ctx);
function serpentHead(bag, x, y, z, dx, dz, s = 1) {
  bag.add(W, box(x - 0.7 * s, y, z - 0.7 * s, x + 0.7 * s, y + 1.2 * s, z + 0.7 * s));
  bag.add(R, box(x + dx * 0.7 * s - 0.4 * s, y + 0.2 * s, z + dz * 0.7 * s - 0.4 * s, x + dx * 0.7 * s + 0.4 * s, y + 0.8 * s, z + dz * 0.7 * s + 0.4 * s));
}
/** A shrine { rect, y, h, roofH, mat } with a door on the west and a tall roof crowned with merlons. */
function shrine(bag, col, [x0, z0, x1, z1], y, h, roofH, band) {
  bag.add(W, box(x0, y, z0, x1, y + h, z1)); col.rect([x0, z0, x1, z1], y, y + h);
  for (let k = 0; k < 4; k++) { const yy = y + h * 0.15 + k * h * 0.22; bag.add(band, box(x0 - 0.05, yy, z0 - 0.05, x1 + 0.05, yy + h * 0.1, z1 + 0.05)); }
  const t = []; beamTris(t, [x0 - 0.06, y, (z0 + z1) / 2 - 1.2], [x0 - 0.06, y, (z0 + z1) / 2 + 1.2], 0.04, h * 0.7); bag.add('lacquer_black', fromTriangles(t));
  bag.add(band, frustum([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], y + h, y + h + roofH, 0.8, 0.8, 0.8, 0.8));
  const n = Math.max(3, Math.round((z1 - z0) / 1.6));
  for (let i = 0; i < n; i++) for (const xx of [x0 + 0.6, x1 - 0.6]) { const z = z0 + 0.5 + (z1 - z0 - 1) * (i + 0.5) / n; bag.add(W, box(xx - 0.25, y + h + roofH, z - 0.3, xx + 0.25, y + h + roofH + 1.1, z + 0.3)); }
  col.floor([x0, z0, x1, z1], y + h + roofH);
}

/**
 * templo_mayor: { c, w (east–west), d (north–south), h, terraces, top: { w, d } }: the terraces, the
 * two stairways on the west, the balustrades and serpent heads, the two shrines and their braziers.
 */
function temploMayor(el, { bag, col }) {
  const [cx, cz] = el.c, n = el.terraces ?? 4, H = el.h, [w0, d0] = [el.w / 2, el.d / 2], [w1, d1] = [el.top.w / 2, el.top.d / 2];
  for (let k = 0; k < n; k++) {
    const t0 = k / n, t1 = (k + 1) / n, y0 = H * t0, y1 = H * t1;
    const a = [w0 - (w0 - w1) * t0, d0 - (d0 - d1) * t0], b = [w0 - (w0 - w1) * t1, d0 - (d0 - d1) * t1];
    const ledge = 1.6, ix = a[0] - b[0] - ledge, iz = a[1] - b[1] - ledge;
    bag.add(W, frustum([cx - a[0], cz - a[1], cx + a[0], cz + a[1]], y0, y1, ix, ix, iz, iz));
    col.rect([cx - a[0] + ix * 0.5, cz - a[1] + iz * 0.5, cx + a[0] - ix * 0.5, cz + a[1] - iz * 0.5], y0, y1);
    col.floor([cx - a[0] + ix, cz - a[1] + iz, cx + a[0] - ix, cz + a[1] - iz], y1);
    bag.add(R, box(cx - a[0] + ix - 0.05, y1 - 0.6, cz - a[1] + iz - 0.05, cx + a[0] - ix + 0.05, y1 - 0.2, cz + a[1] - iz + 0.05));
  }
  // the stairways on the west face: from the plaza up the slope to the summit, side by side
  const run = H * 0.9, sx1 = cx - w1, sx0 = sx1 - run;
  for (const s of [-1, 1]) {
    const zc = cz + s * d1 * 0.45, sw = d1 * 0.32;
    stairs({ rect: [sx0, zc - sw, sx1 + 0.5, zc + sw], y0: 0, y1: H, dir: 'e', mat: W }, { bag, col });
    // the balustrades either side, steepening near the top; serpent heads at their feet
    for (const e of [-1, 1]) {
      const z = zc + e * (sw + 0.9), t = [];
      t.push(sx0, 0, z - 0.9, sx0, 0, z + 0.9, sx1, H + 1, z + 0.9, sx0, 0, z - 0.9, sx1, H + 1, z + 0.9, sx1, H + 1, z - 0.9);
      t.push(sx0, 0, z - 0.9, sx1, H + 1, z - 0.9, sx1, 0, z - 0.9, sx0, 0, z + 0.9, sx1, 0, z + 0.9, sx1, H + 1, z + 0.9);
      bag.add(W, fromTriangles(t.concat(t.slice().reverse())));
      bag.add(R, box(sx1 - 3, H - 2, z - 1, sx1, H + 1.6, z + 1));
      serpentHead(bag, sx0 - 0.7, 0, z, -1, 0, 1.1);
      col.segment([sx0, z], [sx1, z], 1.8, 0, H + 1);
    }
  }
  // the shrines: Tlaloc to the north (left, facing the temple), Huitzilopochtli to the south
  const sy = H, sd = d1 * 0.38;
  shrine(bag, col, [cx - w1 * 0.55, cz - d1 * 0.85, cx + w1 * 0.55, cz - d1 * 0.85 + 2 * sd], sy, 6, 3.5, B);
  shrine(bag, col, [cx - w1 * 0.55, cz + d1 * 0.85 - 2 * sd, cx + w1 * 0.55, cz + d1 * 0.85], sy, 6, 3.5, R);
  for (const s of [-1, 1]) bag.add('basalt', lathe([[0.9, 0], [1.2, 0.9], [0.8, 1.1], [0.001, 1.1]], 12, null, cx - w1 + 2, sy, cz + s * d1 * 0.45));
}

/** round_temple: Ehecatl's temple { c, r, h, front ('w') }: a round platform with a stair, the round shrine with a conical thatched roof. */
function roundTemple(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, h = el.h;
  bag.add(W, lathe([[r + 2, 0], [r, h], [0.001, h]], 32, null, cx, 0, cz)); col.circle(cx, cz, r + 1, 0, h); col.floor([cx - r * 0.7, cz - r * 0.7, cx + r * 0.7, cz + r * 0.7], h);
  stairs({ rect: [cx - r - 2 - h * 1.2, cz - 2.5, cx - r + 0.6, cz + 2.5], y0: 0, y1: h, dir: 'e', mat: W }, { bag, col });
  bag.add(R, lathe([[r * 0.55, 0], [r * 0.55, 4], [0.001, 4]], 24, null, cx, h, cz)); col.circle(cx, cz, r * 0.55, h, h + 4);
  bag.add('thatch', lathe([[r * 0.7, 0], [0.001, r * 1.2]], 24, null, cx, h + 4, cz));
}

/** serpent_wall: the coatepantli a→b { h }: a plastered wall with serpent heads along its outer face. */
function serpentWall(el, { bag, col }) {
  const a = el.a, b = el.b, h = el.h ?? 3, t = [];
  beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.8, h); bag.add(W, fromTriangles(t)); col.segment(a, b, 1.6, 0, h);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.floor(L / 3);
  const o = el.out ?? 1;
  for (let i = 1; i < n; i++) serpentHead(bag, a[0] + ux * i * L / n - uz * o * 1.2, 0.3, a[1] + uz * i * L / n + ux * o * 1.2, -uz * o, ux * o, 0.6);
}

/** court_house: a palace or house round a patio { rect, h, ring, seed }: plastered adobe, flat roofs, a doorway, sometimes a red band. */
function courtHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, d = el.ring ?? Math.min(3.6, Math.min(x1 - x0, z1 - z0) * 0.3), h = el.h ?? 3.2;
  for (const r of [[x0, z0, x1, z0 + d], [x0, z1 - d, x1, z1], [x0, z0 + d, x0 + d, z1 - d], [x1 - d, z0 + d, x1, z1 - d]]) { bag.add(W, box(r[0], 0, r[1], r[2], h, r[3])); col.rect(r, 0, h); col.floor(r, h); }
  if (el.band || rand() < 0.25) for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) { const t = []; beamTris(t, [a[0], h - 0.5, a[1]], [b[0], h - 0.5, b[1]], 0.06, 0.35); bag.add(R, fromTriangles(t)); }
  bag.add('stucco', box(x0 + d, 0, z0 + d, x1 - d, 0.06, z1 - d));
  const t = [], side = Math.floor(rand() * 4), xc = (x0 + x1) / 2, zc = (z0 + z1) / 2, dw = el.ring ? 2 : 0.6;
  if (side === 0) beamTris(t, [xc - dw, 0, z0 - 0.04], [xc + dw, 0, z0 - 0.04], 0.03, 2.1);
  else if (side === 1) beamTris(t, [xc - dw, 0, z1 + 0.04], [xc + dw, 0, z1 + 0.04], 0.03, 2.1);
  else if (side === 2) beamTris(t, [x0 - 0.04, 0, zc - dw], [x0 - 0.04, 0, zc + dw], 0.03, 2.1);
  else beamTris(t, [x1 + 0.04, 0, zc - dw], [x1 + 0.04, 0, zc + dw], 0.03, 2.1);
  bag.add('lacquer_black', fromTriangles(t));
}

/** ballcourt: an I-shaped court { c, len, w, h } along x: two sloping banks with vertical walls, the end zones. */
function ballcourt(el, { bag, col }) {
  const [cx, cz] = el.c, L = el.len / 2, w = el.w / 2, h = el.h ?? 4;
  for (const s of [-1, 1]) { const r = [cx - L, cz + s * w + (s > 0 ? 0 : -6), cx + L, cz + s * w + (s > 0 ? 6 : 0)]; bag.add(W, frustum(r, 0, h, 0, 0, s > 0 ? 0 : 2.5, s > 0 ? 2.5 : 0)); col.rect(r, 0, h); col.floor(r, h); }
  for (const s of [-1, 1]) { const r = [cx + s * L + (s > 0 ? 0 : -8), cz - w - 10, cx + s * L + (s > 0 ? 8 : 0), cz + w + 10]; bag.add(W, box(r[0], 0, r[1], r[2], 1.2, r[3])); col.rect(r, 0, 1.2); col.floor(r, 1.2); }
  bag.add('stucco', box(cx - L, 0, cz - w, cx + L, 0.05, cz + w));
  for (const s of [-1, 1]) bag.add('basalt', lathe([[1.1, 0], [1.1, 0.4], [0.6, 0.4], [0.6, 0], [1.1, 0]], 16, null, cx, h * 0.75, cz + s * (w + 0.2)));
}

registerStyle('aztec', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.maya.elements, templo_mayor: temploMayor, round_temple: roundTemple, serpent_wall: serpentWall, court_house: courtHouse, ballcourt },
  objects: {},
});
