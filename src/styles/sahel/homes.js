// The enterable town houses of Djenné (docs/settlements/djenne.md §16): the ordinary Sudanese courtyard house with the
// skifa (vestibule) behind its door, a room either side of it, the court with its hearth, granary, jars and the stair,
// the back block, and — in a two-storey house — the upper room reached from the court. Built in a local frame of the
// house: u across the front (0 … W), v inward from the street (0 … D); `front` 's' or 'n' as in sahel_house.
// The facade is drawn by sahel_house (hollow); this draws the shell, the roofs and the furniture.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { T, UPPER, upperPlan } from './homeplan.js';

const B = 'banco_rough', BS = 'banco_smooth';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const L = (prof, n, x, y, z) => lathe(prof, n, null, x, y, z);
/** A hash of a position (and a salt) in [0, 1): the same house always gets the same hand-made variations, and no two houses the same. */
function hash(a, b, c = 0) {
  let h = (Math.imul(Math.floor(a * 1000) | 0, 73856093) ^ Math.imul(Math.floor(b * 1000) | 0, 19349663) ^ Math.imul(c | 0, 83492791)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The local frame of a house and the builders in it. */
function frame(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, south = (el.front || 's') === 's';
  const W = x1 - x0, D = z1 - z0;
  const pt = (u, v) => (south ? [x0 + u, z1 - v] : [x1 - u, z0 + v]);
  const R = (u0, v0, u1, v1) => { const a = pt(u0, v0), b = pt(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const bx = (m, u0, y0, v0, u1, y1, v1, solid = false) => { if (u1 - u0 < 0.005 || v1 - v0 < 0.005 || y1 - y0 < 0.005) return; const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); };
  /** A wall r = [u0, v0, u1, v1] from y0 to y1; gaps [{ a, b, top, bottom }] along its long side, a timber lintel over each. */
  const wall = (m, r, y0, y1, gaps = []) => {
    const au = r[2] - r[0] >= r[3] - r[1], A0 = au ? r[0] : r[1], A1 = au ? r[2] : r[3];
    const seg = (a, b, ya, yb) => { if (b - a < 0.01 || yb - ya < 0.01) return; if (au) bx(m, a, ya, r[1], b, yb, r[3], true); else bx(m, r[0], ya, a, r[2], yb, b, true); };
    let u = A0;
    for (const g of gaps.slice().sort((p, q) => p.a - q.a)) {
      seg(u, g.a, y0, y1); seg(g.a, g.b, g.top, y1); if (g.bottom) seg(g.a, g.b, y0, g.bottom);
      if (au) bx('timber', g.a - 0.15, g.top - 0.14, r[1] - 0.02, g.b + 0.15, g.top, r[3] + 0.02); else bx('timber', r[0] - 0.02, g.top - 0.14, g.a - 0.15, r[2] + 0.02, g.top, g.b + 0.15);
      u = g.b;
    }
    seg(u, A1, y0, y1);
  };
  /** A wall r = [u0, v0, u1, v1] along u from y0 to y1 with holes [{ a, b, ya, yb }] (they may stand over one another), a timber lintel over each. */
  const holed = (m, r, y0, y1, holes) => {
    const cuts = [...new Set([r[0], r[2], ...holes.flatMap((h) => [h.a, h.b])])].filter((q) => q >= r[0] && q <= r[2]).sort((p, q) => p - q);
    for (let i = 0; i + 1 < cuts.length; i++) {
      const a = cuts[i], b = cuts[i + 1];
      if (b - a < 0.01) continue;
      const hs = holes.filter((h) => h.a <= (a + b) / 2 && h.b >= (a + b) / 2).sort((p, q) => p.ya - q.ya);
      let y = y0;
      for (const h of hs) { if (h.ya > y) bx(m, a, y, r[1], b, h.ya, r[3], true); y = Math.max(y, h.yb); }
      if (y < y1) bx(m, a, y, r[1], b, y1, r[3], true);
    }
    for (const h of holes) bx('timber', h.a - 0.1 - 0.05 * hash(h.a, h.ya, 3), h.yb - 0.14, r[1] - 0.02, h.b + 0.1 + 0.05 * hash(h.b, h.yb, 4), h.yb, r[3] + 0.02);
  };
  /** A flat roof / floor slab over r: palm beams below, banco over, walkable on top. */
  const roof = (r, yTop) => {
    const y0 = yTop - 0.32;
    bx('timber', r[0], y0, r[1], r[2], y0 + 0.08, r[3]);
    bx(BS, r[0], y0 + 0.08, r[1], r[2], yTop, r[3]);
    const cr = R(...r); col.floor(cr, yTop);
    const alongU = r[2] - r[0] < r[3] - r[1], span = alongU ? r[2] - r[0] : r[3] - r[1], len = alongU ? r[3] - r[1] : r[2] - r[0], n = Math.max(2, Math.floor(len / 0.8));
    for (let k = 0; k < n; k++) { const q = (k + 0.5) * len / n; if (alongU) bx('timber', r[0], y0 - 0.1, r[1] + q - 0.06, r[2], y0, r[1] + q + 0.06); else bx('timber', r[0] + q - 0.06, y0 - 0.1, r[1], r[0] + q + 0.06, y0, r[3]); }
    void span;
  };
  const parapet = (a, b, y, h = 0.7) => { const t = []; const p = pt(...a), q = pt(...b); beamTris(t, [p[0], y, p[1]], [q[0], y, q[1]], 0.16, h); bag.add(B, fromTriangles(t)); };
  const lathe_ = (m, prof, n, u, y, v) => { const p = pt(u, v); bag.add(m, L(prof, n, p[0], y, p[1])); };
  const jar = (m, u, y, v, s = 1) => lathe_(m, [[0.001, 0], [0.14 * s, 0.03 * s], [0.24 * s, 0.22 * s], [0.2 * s, 0.4 * s], [0.12 * s, 0.5 * s], [0.14 * s, 0.56 * s], [0.001, 0.54 * s]], 9, u, y, v);
  const bowl = (m, u, y, v, r = 0.22) => lathe_(m, [[0.001, 0], [r * 0.7, 0.03], [r, 0.12], [r * 0.92, 0.13], [0.001, 0.05]], 9, u, y, v);
  const heap = (m, u, y, v, r = 0.2, h = 0.14) => lathe_(m, [[r, 0], [r * 0.6, h * 0.6], [0.001, h]], 8, u, y, v);
  const mat = (u0, v0, u1, v1, y = 0, m = 'reed_mat') => bx(m, u0, y, v0, u1, y + 0.02, v1);
  const stool = (u, v, y = 0, s = 1) => lathe_('timber', [[0.15 * s, 0], [0.1 * s, 0.12 * s], [0.08 * s, 0.26 * s], [0.15 * s, 0.36 * s], [0.16 * s, 0.39 * s], [0.001, 0.38 * s]], 8, u, y, v);
  const sack = (u, v, y = 0, m = 'sacking', s = 1) => lathe_(m, [[0.2 * s, 0], [0.26 * s, 0.25 * s], [0.21 * s, 0.5 * s], [0.06 * s, 0.58 * s], [0.001, 0.58 * s]], 8, u, y, v);
  const bigjar = (u, v, y = 0) => { lathe_(BS, [[0.001, 0], [0.3, 0.04], [0.5, 0.35], [0.5, 0.65], [0.34, 0.95], [0.32, 1.05], [0.38, 1.1], [0.001, 1.08]], 11, u, y, v); const p = pt(u, v); col.circle(p[0], p[1], 0.5, y, y + 1.1); lathe_('terracotta', [[0.001, 0], [0.36, 0], [0.34, 0.06], [0.001, 0.1]], 9, u, y + 1.08, v); };
  return { W, D, pt, R, bx, wall, holed, roof, parapet, lathe_, jar, bowl, heap, mat, stool, sack, bigjar, bag, col, south };
}

// ── the rooms' furniture, in the room's own frame: far = the u of the wall the room's goods stand against, s = the sign
// toward the doorway (a room west of the vestibule: far < near, s = +1) ─────────────────────────────────────────────
function roomContents(k, kind, far, s, v0, v1, rand) {
  const U = (d) => far + s * d, vm = (v0 + v1) / 2, span = v1 - v0;
  const slab = (a, b, ...r) => k.bx(...[r[0], Math.min(U(a), U(b)), r[1], r[2], Math.max(U(a), U(b)), r[3], r[4]]);
  if (kind === 'loom') {
    // the narrow-strip loom (cotton strips of indigo and white), its heddle frame, the weaver's stool and mat
    for (const dv of [-0.8, 0.8]) k.bx('timber', Math.min(U(0.9), U(1.02)), 0, vm + dv - 0.05, Math.max(U(0.9), U(1.02)), 1.8, vm + dv + 0.05, true);
    k.bx('timber', Math.min(U(0.9), U(1.02)), 1.8, vm - 0.85, Math.max(U(0.9), U(1.02)), 1.88, vm + 0.85);
    for (let i = 0; i < 9; i++) k.bx(i % 3 ? 'cloth_indigo' : 'cloth_white', Math.min(U(0.94), U(0.99)), 0.5, vm - 0.75 + i * 0.18, Math.max(U(0.94), U(0.99)), 1.75, vm - 0.75 + i * 0.18 + 0.1);
    k.stool(U(1.6), vm); k.mat(Math.min(U(1.2), U(2.0)), vm - 0.5, Math.max(U(1.2), U(2.0)), vm + 0.5);
    for (let i = 0; i < 3; i++) k.heap(['cloth_white', 'cloth_ochre', 'cloth_indigo'][i], U(0.35), 0, v0 + 0.4 + i * 0.35, 0.17, 0.3);
  } else if (kind === 'store') {
    for (let i = 0; i < Math.min(3, Math.floor(span / 1.1)); i++) k.bigjar(U(0.6), v0 + 0.6 + i * 1.05);
    for (let i = 0; i < 4; i++) k.sack(U(1.5 + (i % 2) * 0.45), vm - 0.5 + Math.floor(i / 2) * 0.5);
    for (let i = 0; i < 2; i++) k.lathe_('wicker', [[0.001, 0], [0.22, 0.02], [0.27, 0.2], [0.25, 0.21], [0.001, 0.05]], 9, U(1.6), 0, v1 - 0.5 - i * 0.55);
  } else if (kind === 'school') {
    // boards of the Qur'anic school leaning on the wall, low stools and a reading mat
    for (let i = 0; i < 3; i++) { const v = v0 + 0.5 + i * Math.min(0.9, (span - 0.8) / 3); slab(0.05, 0.1, 'wood_dark', 0.5, v, 1.15, v + 0.4); }
    k.mat(Math.min(U(0.5), U(2.2)), v0 + 0.3, Math.max(U(0.5), U(2.2)), v1 - 0.3);
    for (let i = 0; i < 2; i++) k.stool(U(1.4), v0 + 0.6 + i * 0.8);
    k.bx('timber', Math.min(U(1.9), U(2.1)), 0.2, vm - 0.3, Math.max(U(1.9), U(2.1)), 0.25, vm + 0.3);
  } else if (kind === 'sleep') {
    k.bx(BS, Math.min(U(0.05), U(1.1)), 0, vm - 1.0, Math.max(U(0.05), U(1.1)), 0.5, vm + 1.0, true);
    k.mat(Math.min(U(0.05), U(1.1)), vm - 1.0, Math.max(U(0.05), U(1.1)), vm + 1.0, 0.5);
    k.bx(rand() < 0.5 ? 'cloth_indigo' : 'cloth_ochre', Math.min(U(0.15), U(1.0)), 0.52, vm - 0.5, Math.max(U(0.15), U(1.0)), 0.57, vm + 0.9);
    k.bx('timber', Math.min(U(0.1), U(0.7)), 0, v1 - 0.65, Math.max(U(0.1), U(0.7)), 0.55, v1 - 0.1, true);
    k.jar('pottery_dark', U(1.5), 0, v0 + 0.35, 1.1);
  } else if (kind === 'potter') {
    // clay heaped by the wall, the shelf of fired pots, a turntable
    for (let i = 0; i < 2; i++) k.heap('mud_plaster', U(0.5), 0, v0 + 0.5 + i * 0.7, 0.32, 0.35);
    for (let r = 0; r < 2; r++) for (let i = 0; i < Math.min(5, Math.floor(span / 0.5)); i++) k.jar(i % 2 ? 'terracotta' : 'pottery_dark', U(0.3), 0.5 + r * 0.55, v0 + 0.3 + i * 0.5, 0.55);
    slab(0.05, 0.5, 'timber', 0.45, v0 + 0.1, 0.5, v1 - 0.1);
    k.bx('timber', Math.min(U(1.5), U(1.9)), 0.28, vm - 0.2, Math.max(U(1.5), U(1.9)), 0.32, vm + 0.2);
    k.mat(Math.min(U(1.1), U(2.2)), vm - 0.6, Math.max(U(1.1), U(2.2)), vm + 0.6);
  } else if (kind === 'smith') {
    // the smith's forge (the Mande smiths' trade): a clay hearth block against the wall with its charcoal bed, the bellows (two skin bags on a
    // timber stand) blowing through an iron tuyere, an anvil stone on a log, hoes and knives hung on the wall, a heap of charcoal
    const m = (a, b) => [Math.min(U(a), U(b)), Math.max(U(a), U(b))];
    { const [a, b] = m(0.05, 1.0); k.bx(BS, a, 0, vm - 0.5, b, 0.7, vm + 0.5, true); }
    { const [a, b] = m(0.15, 0.9); k.bx('wood_dark', a, 0.7, vm - 0.3, b, 0.74, vm + 0.3); }
    { const [a, b] = m(1.0, 1.15); k.bx('iron', a, 0.62, vm - 0.04, b, 0.67, vm + 0.04); }
    { const [a, b] = m(1.15, 1.6); k.bx('timber', a, 0, vm - 0.45, b, 0.42, vm + 0.45, true); }
    for (const dz of [-0.2, 0.2]) k.lathe_('hide_brown', [[0.001, 0.42], [0.15, 0.46], [0.16, 0.7], [0.07, 0.86], [0.001, 0.86]], 8, U(1.38), 0, vm + dz);
    k.lathe_('timber', [[0.2, 0], [0.18, 0.3], [0.001, 0.3]], 8, U(2.0), 0, vm + 0.7); k.lathe_('granite_grey', [[0.001, 0.3], [0.16, 0.3], [0.12, 0.46], [0.001, 0.46]], 8, U(2.0), 0, vm + 0.7);
    for (let i = 0; i < 4; i++) slab(0.05, 0.1, 'iron', 1.0 + (i % 2) * 0.2, v0 + 0.3 + i * Math.min(0.5, (span - 0.6) / 4), 1.5, v0 + 0.35 + i * Math.min(0.5, (span - 0.6) / 4));
    k.heap('wood_dark', U(1.2), 0, v1 - 0.4, 0.3, 0.3);
  } else if (kind === 'dyer') {
    // the dyer's indigo: two vats (clay rims sunk in the floor, the dye dark on top), a pole across the room with strips of cloth hung to dry,
    // balls of indigo paste on a mat
    for (let i = 0; i < 2; i++) { k.lathe_(BS, [[0.001, 0], [0.5, 0], [0.55, 0.15], [0.5, 0.3], [0.001, 0.3]], 10, U(0.8), 0, vm - 0.7 + i * 1.4); k.lathe_('cloth_indigo', [[0.001, 0.28], [0.4, 0.28], [0.4, 0.31], [0.001, 0.31]], 10, U(0.8), 0, vm - 0.7 + i * 1.4); }
    k.bx('timber', Math.min(U(1.9), U(1.96)), 1.9, v0 + 0.15, Math.max(U(1.9), U(1.96)), 1.96, v1 - 0.15);
    for (let i = 0; i < Math.floor((span - 0.5) / 0.35); i++) k.bx(i % 2 ? 'cloth_indigo' : 'cloth_blue', Math.min(U(1.9), U(1.96)), 1.0, v0 + 0.3 + i * 0.35, Math.max(U(1.9), U(1.96)), 1.9, v0 + 0.3 + i * 0.35 + 0.22);
    for (let i = 0; i < 4; i++) k.heap('cloth_indigo', U(1.2 + (i % 2) * 0.3), 0, vm - 0.3 + Math.floor(i / 2) * 0.4, 0.12, 0.14);
  } else {      // grain: a heap of sacks and the measuring bowls
    for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) k.sack(U(0.4 + r * 0.05), vm - 0.5 + i * 0.5 + r * 0.25, r * 0.5);
    for (let i = 0; i < 2; i++) k.bowl('hide_tan', U(1.6), 0, vm - 0.3 + i * 0.6, 0.26);
    k.mat(Math.min(U(1.2), U(2.0)), vm - 0.9, Math.max(U(1.2), U(2.0)), vm + 0.9);
  }
}

/** The court's furniture on its east strip, in slots from the front to the back; the west strip holds the stair. */
function courtContents(k, u0, u1, v0, v1, rand) {
  const items = ['granary', 'hearth', 'mortar', 'jars', 'wood', rand() < 0.35 ? 'vats' : 'hearth', rand() < 0.4 ? 'pens' : 'jars'].sort(() => rand() - 0.5);
  let v = v0 + 0.55;
  const ue = u1 - 0.75;
  for (const it of items) {
    if (v > v1 - 0.45) break;
    if (it === 'granary') {
      if (u1 - u0 < 6.5 || v + 1.0 > v1 - 0.3) continue;
      k.lathe_(BS, [[0.7, 0], [0.9, 0.45], [0.95, 1.0], [0.72, 1.55], [0.45, 1.8], [0.001, 1.8]], 12, ue - 0.2, 0, v + 0.5);
      k.lathe_('thatch', [[0.82, 0], [0.55, 0.28], [0.001, 0.7]], 10, ue - 0.2, 1.75, v + 0.5);
      const p = k.pt(ue - 0.2, v + 0.5); k.col.circle(p[0], p[1], 0.95, 0, 1.9);
      v += 1.5;
    } else if (it === 'hearth') {
      for (let i = 0; i < 3; i++) { const a = i * 2.09; k.lathe_('mud_plaster', [[0.14, 0], [0.1, 0.18], [0.001, 0.2]], 7, ue + Math.cos(a) * 0.2, 0, v + Math.sin(a) * 0.2); }
      k.lathe_('pottery_dark', [[0.001, 0], [0.12, 0.02], [0.21, 0.14], [0.2, 0.3], [0.14, 0.38], [0.16, 0.42], [0.001, 0.4]], 10, ue, 0.2, v);
      k.bx('bark_pine', ue - 0.6, 0, v + 0.3, ue - 0.2, 0.09, v + 0.34);
      v += 0.9;
    } else if (it === 'mortar') {
      k.lathe_('timber', [[0.22, 0], [0.28, 0.4], [0.3, 0.7], [0.001, 0.7]], 9, ue, 0, v + 0.1); k.lathe_('wood_dark', [[0.17, 0.68], [0.001, 0.66]], 9, ue, 0, v + 0.1);
      const p = k.pt(ue, v + 0.1); k.col.circle(p[0], p[1], 0.3, 0, 0.7);
      v += 0.9;
    } else if (it === 'vats') {
      // a dyer's yard: indigo vats sunk in a low banco bench, cloth hanging on a pole above (the vats are set at the wall)
      for (let i = 0; i < 2; i++) { k.lathe_(BS, [[0.001, 0], [0.5, 0], [0.55, 0.15], [0.5, 0.3], [0.001, 0.3]], 10, ue - 0.15, 0, v + 0.45 + i * 1.0); k.lathe_('cloth_indigo', [[0.001, 0.28], [0.4, 0.28], [0.4, 0.31], [0.001, 0.31]], 10, ue - 0.15, 0, v + 0.45 + i * 1.0); const p = k.pt(ue - 0.15, v + 0.45 + i * 1.0); k.col.circle(p[0], p[1], 0.55, 0, 0.3); }
      v += 2.0;
    } else if (it === 'pens') {
      // a goat's tether post with a trough and a few hens' roosting basket
      k.lathe_('timber', [[0.07, 0], [0.06, 1.0], [0.001, 1.0]], 6, ue - 0.2, 0, v + 0.2);
      k.bx('timber', ue - 0.6, 0, v + 0.45, ue + 0.1, 0.2, v + 0.7);
      k.lathe_('wicker', [[0.001, 0], [0.28, 0.02], [0.3, 0.3], [0.001, 0.32]], 9, ue - 0.1, 0, v + 1.0);
      v += 1.3;
    } else if (it === 'jars') {
      for (let i = 0; i < 3; i++) k.jar('terracotta', ue - 0.5 + i * 0.5, 0.35, v + 0.2, 1.5);
      k.bx(BS, ue - 0.8, 0, v - 0.1, ue + 0.7, 0.35, v + 0.5, true);
      v += 1.0;
    } else {
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4 - j; i++) k.bx('bark_pine', ue - 0.7 + i * 0.3 + j * 0.15, 0.1 + j * 0.14, v, ue - 0.7 + i * 0.3 + 0.12 + j * 0.15, 0.22 + j * 0.14, v + 0.9);
      v += 1.1;
    }
  }
}

/** The same builders with every height raised by Y (a floor above the ground one): roomContents and the rest are written from y = 0. */
function lift(k, Y) {
  return {
    ...k,
    bx: (m, u0, y0, v0, u1, y1, v1, s) => k.bx(m, u0, y0 + Y, v0, u1, y1 + Y, v1, s),
    jar: (m, u, y, v, s) => k.jar(m, u, y + Y, v, s), bowl: (m, u, y, v, r) => k.bowl(m, u, y + Y, v, r), heap: (m, u, y, v, r, h) => k.heap(m, u, y + Y, v, r, h),
    mat: (u0, v0, u1, v1, y = 0, m) => k.mat(u0, v0, u1, v1, y + Y, m), stool: (u, v, y = 0, s) => k.stool(u, v, y + Y, s), sack: (u, v, y = 0, m, s) => k.sack(u, v, y + Y, m, s),
    bigjar: (u, v, y = 0) => k.bigjar(u, v, y + Y), lathe_: (m, prof, n, u, y, v) => k.lathe_(m, prof, n, u, y + Y, v),
  };
}

/**
 * The structure of an opened upper floor: the roof stair (steep banco steps along the court wall, rising east in u from the
 * floor to the roof, its opening in the roof 0.3 m clear of the ramp and edged by low rails), the parapets of the roof
 * terrace made solid, the loggia's posts and balustrade over the court, and the terrace's goods.
 */
function richStructure(k, U, el) {
  const { tw, fv, vc0, H1, Hf } = T, { W, uA, uB, hole, loggia: lg } = U, seed = el.seed || 1, hh = (a, b, c = 0) => hash(a + seed * 0.013, b, c);
  // the steps: sixteen, each a little uneven (hand-built), under the roof's opening; the ramp for the walker is 0.9 m wide, the steps' mass fills to the wall
  if (U.rs) { const n = 16, t = (uB - uA) / n, h = (Hf - H1) / n, ju = (i) => (i === 0 || i === n ? 0 : (hh(uA + i * t, 2.4, 7) - 0.5) * 0.04);
    for (let i = 0; i < n; i++) k.bx(BS, uA + i * t + ju(i), H1, 2.4 + hh(uA, i, 8) * 0.03, uA + (i + 1) * t + ju(i + 1), H1 + (i + 1) * h + (hh(uA, i, 9) - 0.5) * 0.02, fv);
    k.col.ramp(k.R(uA, 2.4, uB, 3.3), H1, Hf, U.dir); }
  // low rails round the opening's open sides (west end and the room side), 0.8 m, of banco, on the slab; solid for the walker on the roof
  if (hole) { const rt = 0.07, e = 0.14, y = Hf, rh = 0.8 + hh(hole[0], hole[1], 2) * 0.06;
    k.bx(BS, hole[0] - e - rt, y, hole[1] - e, hole[0] - e + rt, y + rh, hole[3], true);
    k.bx(BS, hole[0] - e - rt, y, hole[1] - e - rt, hole[2] - 0.7, y + rh - 0.08, hole[1] - e + rt, true); }
  // the parapets of the front block's roof are solid (the terrace is walked)
  for (const r of [[0.04, 0.04, W - 0.04, 0.36], [0.04, 0.04, 0.36, vc0 - 0.04], [W - 0.36, 0.04, W - 0.04, vc0 - 0.04]]) k.col.rect(k.R(...r), Hf, Hf + 0.7);
  k.col.rect(k.R(0.04, vc0 - 0.36, W - 0.04, vc0 - 0.04), Hf, Hf + 0.55);
  // the loggia over the court: square banco posts from the ground to the roof, a timber head on each, a balustrade round the three open sides with the doorway left from the room
  if (lg) {
    const np = lg.u1 - lg.u0 > 3.6 ? 3 : 2, pv = lg.v1 - 0.2;
    for (let i = 0; i < np; i++) {
      const pu = lg.u0 + 0.25 + (lg.u1 - lg.u0 - 0.5) * i / (np - 1), w = 0.19 + hh(pu, pv, 11) * 0.03;
      k.bx(B, pu - w, 0, pv - w, pu + w, Hf - 0.32, pv + w); k.col.circle(...k.pt(pu, pv), w * 1.2, 0, Hf);
      k.bx('timber', pu - w - 0.06, Hf - 0.55, pv - w - 0.06, pu + w + 0.06, Hf - 0.32, pv + w + 0.06);
    }
    const y = H1, rh = 0.85 + hh(lg.u0, lg.u1, 12) * 0.08, rt = 0.07 + hh(lg.u0, lg.u1, 13) * 0.01;
    k.bx(BS, lg.u0, y, pv - rt, lg.u1, y + rh, pv + rt, true);
    k.bx(BS, lg.u0, y, vc0, lg.u0 + 2 * rt, y + rh, pv, true); k.bx(BS, lg.u1 - 2 * rt, y, vc0, lg.u1, y + rh, pv, true);
  }
  // the roof terrace: a mat spread to dry with cloths on it, water jars along the parapet, a bundle of palm sticks (the next replastering's toron)
  { const r3 = (a, b, c) => hh(a, b, c), um = 0.7 + r3(1, 1, 1) * Math.max(0.1, (hole ? hole[0] : W) - 3.2);
    k.mat(um, 0.7, um + 1.5 + r3(2, 2, 2) * 0.4, 1.5 + r3(3, 3, 3) * 0.3, Hf, 'reed_mat');
    k.bx(r3(4, 4, 4) < 0.5 ? 'cloth_indigo' : 'cloth_ochre', um + 0.15, Hf + 0.02, 0.8, um + 0.95 + r3(5, 5, 5) * 0.3, Hf + 0.05, 1.3);
    for (let i = 0; i < 2; i++) k.jar(i ? "pottery_dark" : "terracotta", 0.9 + i * 0.6 + r3(6, i, 6) * 0.2, Hf, 0.42 + r3(7, i, 7) * 0.06, 1.2 + r3(8, i, 8) * 0.4);
    for (let i = 0; i < 5; i++) { const u0 = W - 2.3 + i * 0.09 + r3(9, i, 9) * 0.04; k.bx('bark_pine', u0, Hf, 0.5 + i * 0.03, u0 + 0.07, Hf + 0.07, 1.45 + r3(10, i, 10) * 0.4); } }
  void tw;
}

/** A bed of banco under a mat and a blanket, the head on a timber log, along the street wall from u. */
function bedAt(k, u, v, len, seed) {
  const a = u + 0, h = hash(u, v, seed);
  k.bx(BS, a, 0, v, a + len, 0.48 + h * 0.04, v + 0.9 + h * 0.06, true);
  k.mat(a, v, a + len, v + 0.9 + h * 0.06, 0.52 + h * 0.04);
  k.bx(h < 0.5 ? 'cloth_indigo' : 'cloth_ochre', a + 0.15 + h * 0.1, 0.54 + h * 0.04, v + 0.08, a + len - 0.3 + h * 0.15, 0.59 + h * 0.04, v + 0.8);
  k.bx('timber', a + len - 0.3, 0.52 + h * 0.04, v + 0.1, a + len - 0.05, 0.64 + h * 0.04, v + 0.75);
}

/**
 * The rooms of an opened upper floor, by the household's use (dossier §19): the front block's room over the vestibule, one
 * zone west of the roof stair and one east of it (a wall with a doorway between them in a wide house). Beds, chests and stores
 * stand along the street wall (0.9 m deep) and in a strip against the court wall, leaving the walk between free; every piece
 * is varied by a hash of its own position.
 */
function upperRooms(k, U, el) {
  const { tw, fv, vc0, H1 } = T, { W, uA, uB, pu, kind } = U, uR = W - tw, seed = el.seed || 1, ky = lift(k, H1);
  const hh = (a, b, c = 0) => hash(a + seed * 0.011, b, c), rand = rng(seed * 17 + 3);
  // the partition (a wall of banco from the floor to the roof, a doorway on the walk)
  if (pu) k.wall(B, [pu, tw, pu + 0.3, fv], H1, T.Hf - 0.3, [{ a: 1.3 + hh(pu, 1) * 0.1, b: 2.4, top: 2.05 + H1 }]);
  const west = pu ? [tw, pu] : [tw, W / 2], east = pu ? [pu + 0.3, uR] : [W / 2, uR];
  const bs = (z) => { const a = Math.max(z[0] + 0.15, U.loggia ? 3.15 : 1.75), b = Math.min(z[1] - 0.1, uA - 0.15); return b - a > 0.8 ? [a, b] : null; };     // the back strip against the court wall
  const roles = UPPER[kind] || UPPER.family;
  const fill = {
    sleep(z, e) {
      const len = 1.9 + hh(z[0], 1) * 0.15;
      const at = e ? [z[1] - len - 0.1, z[0] + 0.1] : [z[0] + 0.1, z[1] - len - 0.1];
      bedAt(ky, at[0], 0.55, len, 1);
      if (z[1] - z[0] > 4.4) bedAt(ky, at[1], 0.55, len - 0.2, 2);
      const s = bs(z);
      if (s) { ky.bx('timber', s[0] + 0.05, 0, 2.85, s[0] + 0.95 + hh(s[0], 3) * 0.1, 0.5, 3.45, true); ky.jar('pottery_dark', s[0] + 1.35, 0, 3.15, 1.1 + hh(s[0], 4) * 0.2); }
      else ky.bx('timber', z[0] + 0.1 + len + 0.15, 0, 0.6, z[0] + len + 1.1 + hh(z[0], 5) * 0.1, 0.5, 1.15, true);
    },
    store(z, e) {
      const s = bs(z);
      if (s) for (let i = 0; i < Math.min(3, Math.floor((s[1] - s[0]) / 1.1)); i++) ky.bigjar(s[0] + 0.6 + i * (1.05 + hh(s[0], i, 6) * 0.08), 2.95 + hh(s[0], i, 7) * 0.1);
      const n = Math.min(5, Math.floor((z[1] - z[0]) / 0.55));
      for (let i = 0; i < n; i++) ky.sack(z[0] + 0.35 + i * 0.5, 0.75 + (i % 2) * 0.1 + hh(z[0], i, 8) * 0.08, 0, i % 3 ? 'sacking' : 'hide_tan', 0.85 + hh(z[0], i, 9) * 0.3);
      for (let i = 0; i < 3; i++) ky.bx(['cloth_white', 'cloth_indigo', 'cloth_ochre'][(i + Math.floor(hh(z[0], 10) * 3)) % 3], z[1] - 1.1 + hh(z[0], i, 11) * 0.1, 0.42 * i, 0.55, z[1] - 0.1 - hh(z[0], i, 12) * 0.12, 0.42 * (i + 1), 1.3 + hh(z[0], i, 13) * 0.1);
      void e;
    },
    work(z) { roomContents(ky, 'loom', uR, -1, 0.55 + hh(uR, 1) * 0.05, 2.35, rand); },
    study(z) { roomContents(ky, 'school', uR, -1, 0.55, 2.4, rand); },
    guest(z, e) {
      const a = z[0] + 0.15 + hh(z[0], 20) * 0.1;
      for (let i = 0; i < 2 && a + 2.3 * (i + 1) < z[1]; i++) { const u = a + i * 2.1; ky.mat(u, 0.6, u + 1.9 + hh(u, 21) * 0.1, 1.5, 0, 'reed_mat'); ky.bx(i ? 'cloth_ochre' : 'cloth_indigo', u + 0.1, 0.02, 0.7, u + 1.4 + hh(u, 22) * 0.2, 0.08, 1.3); ky.sack(u + 1.7, 1.55 + hh(u, 23) * 0.1, 0, 'hide_tan', 0.7); }
      const s = bs(z); if (s) { ky.bx(BS, s[0] + 0.1, 0, 2.95, s[1] - 0.1, 0.42, 3.45 + hh(s[0], 24) * 0.05, true); ky.jar('terracotta', s[0] + 0.4, 0.42, 3.2, 1.0 + hh(s[0], 25) * 0.2); }
      void e;
    },
    cell(z, e) {
      bedAt(ky, e ? z[1] - 2.0 : z[0] + 0.1, 0.55, 1.8 + hh(z[0], 30) * 0.12, 3);
      const u = e ? z[0] + 0.5 : z[1] - 0.6;
      ky.bx(BS, u, 0, 0.6, u + 0.55 + hh(u, 31) * 0.05, 0.3, 1.1, true); ky.bowl('pottery_dark', u + 0.28, 0.3, 0.85, 0.2 + hh(u, 32) * 0.04);
      const s = bs(z); if (s) ky.bx('timber', s[0] + 0.05, 0, 2.9, s[0] + 0.85 + hh(s[0], 33) * 0.1, 0.5, 3.45, true);
    },
  };
  roles.forEach((role, i) => fill[role](i ? east : west, i));
  // a calabash shelf on the street wall's inner face between the windows, as in the single room
  { const um = (west[0] + east[1]) / 2; k.bx('timber', um - 1.0, H1 + 1.7, 0.45, um + 1.0, H1 + 1.76, 0.75);
    for (let i = 0; i < 4; i++) k.bowl('hide_tan', um - 0.8 + i * 0.5 + hh(um, i, 40) * 0.1, H1 + 1.76, 0.6, 0.17 + hh(um, i, 41) * 0.05); }
  void vc0; void uB;
}

/**
 * The shell and furniture of an enterable town house { rect, front, storeys, seed } (called after sahel_house has drawn
 * its facade, hollow).
 */
export function home(el, ctx) {
  const k = frame(el, ctx), rand = rng((el.seed || 1) * 31 + 7), { W, D } = k, tw = 0.45, mid = W / 2, dw = el.dw ?? 0.62;
  const two = (el.storeys ?? 2) > 1, H1 = 3.1, Hf = two ? 6.2 : 3.1;
  const fv = 3.6, vc0 = fv + tw, bv = D - 3.4;                           // the vestibule's depth, the court's start, the back block's start
  const sideW = mid - 1.8 - tw, partition = sideW >= 1.65;
  const stairU = [tw, tw + 1.0];
  const rich = two && !!el.up, U = rich ? upperPlan({ rect: el.rect, front: el.front, kind: el.up }) : null;     // an opened upper floor (dossier §19)
  // the front wall (the door), the sides and the back, the wall between front block and court, the back block's wall on the court
  if (rich && el.wins?.length) k.holed(B, [0, 0, W, tw], 0, Hf, [{ a: mid - dw, b: mid + dw, ya: 0, yb: 2.05 }, ...el.wins]);       // (the upper windows are open reveals)
  else k.wall(B, [0, 0, W, tw], 0, Hf, [{ a: mid - dw, b: mid + dw, top: 2.05 }]);
  k.wall(B, [0, tw, tw, vc0], 0, Hf); k.wall(B, [W - tw, tw, W, vc0], 0, Hf);
  k.wall(B, [0, vc0, tw, D], 0, H1 + 0.7); k.wall(B, [W - tw, vc0, W, D], 0, H1 + 0.7);
  k.wall(B, [tw, D - tw, W - tw, D], 0, H1 + 0.7);
    if (rich) {
    // the court wall of the front block: the door to the vestibule, the stair's way up, the door and window onto the loggia (or a window on the court)
    const lg = U.loggia, hs = [{ a: mid - 0.7, b: mid + 0.7, ya: 0, yb: 2.3 }, { a: stairU[0] + 0.05, b: stairU[1] - 0.05, ya: H1, yb: 5.3 }];
    if (lg) { hs.push({ a: 1.9, b: 2.9, ya: H1, yb: H1 + 2.05 }); const wu = U.pu ? U.pu + 1.5 : (lg.u0 + lg.u1) / 2 + 0.7; if (wu + 0.35 < lg.u1) hs.push({ a: wu - 0.35, b: wu + 0.35, ya: H1 + 0.9, yb: H1 + 1.75 }); }
    else { const wu = Math.min(mid + 1.6, U.uA - 0.7); if (wu > 2.4) hs.push({ a: wu - 0.35, b: wu + 0.35, ya: H1 + 0.9, yb: H1 + 1.75 }); }
    k.holed(B, [tw, fv, W - tw, vc0], 0, Hf, hs);
  } else k.wall(B, [tw, fv, W - tw, vc0], 0, Hf, [{ a: mid - 0.7, b: mid + 0.7, top: 2.3 }, ...(two ? [{ a: stairU[0] + 0.05, b: stairU[1] - 0.05, top: 5.3, bottom: H1 }] : [])]);
  k.wall(B, [tw, bv, W - tw, bv + tw], 0, H1, [{ a: mid - 0.55, b: mid + 0.55, top: 2.1 }]);
  // the partitions of the vestibule, each with a door to its side room
  if (partition) for (const [a, b] of [[mid - 1.8, mid - 1.4], [mid + 1.4, mid + 1.8]]) k.wall(B, [a, tw, b, fv], 0, H1 + 0.0, [{ a: 1.4, b: 2.4, top: 2.05 }]);
  // floors and roofs: the upper floor and roof over the front block, the back block's roof; parapets
  if (two) k.roof([0, 0, W, vc0], H1);
  if (rich) {
    // the roof over the front block with the opening of the roof stair (a hole 0.3 m clear of the ramp on its open side), and over the loggia
    const h = U.hole;
    if (h) for (const r of [[0, 0, W, h[1]], [0, h[1], h[0], vc0], [h[2], h[1], W, vc0], [h[0], h[3], h[2], vc0]]) k.roof(r, Hf);
    else k.roof([0, 0, W, vc0], Hf);
    if (U.loggia) { const lg = U.loggia; k.roof([lg.u0, vc0, lg.u1, lg.v1], H1); k.roof([lg.u0, vc0, lg.u1, lg.v1], Hf); }
  } else k.roof([0, 0, W, vc0], Hf + 0.0 > H1 ? Hf : H1);
  k.roof([0, bv, W, D], H1);
  for (const [a, b, y, h] of [[[0.2, 0.2], [W - 0.2, 0.2], Hf, 0.7], [[0.2, 0.2], [0.2, vc0], Hf, 0.7], [[W - 0.2, 0.2], [W - 0.2, vc0], Hf, 0.7], [[0.2, vc0 - 0.2], [W - 0.2, vc0 - 0.2], Hf, 0.55],
    [[0.2, bv], [W - 0.2, bv], H1, 0.5], [[0.2, D - 0.2], [W - 0.2, D - 0.2], H1, 0.7], [[0.2, bv], [0.2, D], H1, 0.7], [[W - 0.2, bv], [W - 0.2, D], H1, 0.7]]) k.parapet(a, b, y, h);
  // the roof's kitchen vent under its inverted bowl, and a few jars (as on the mosque's roof)
  { const vu = W * (0.55 + rand() * 0.25), vv = bv + 1.4;
    k.lathe_(BS, [[0.3, -0.05], [0.3, 0.16], [0.25, 0.2], [0.001, 0.2]], 8, vu, H1, vv);
    k.lathe_('terracotta', [[0.001, 0.19], [0.33, 0.19], [0.33, 0.24], [0.28, 0.33], [0.18, 0.4], [0.001, 0.42]], 9, vu, H1, vv);
    k.jar('terracotta', vu - 1.2, H1, vv + 0.4); k.jar('pottery_dark', vu - 1.6, H1, vv - 0.3, 0.9); }
  // the stair along the west side of the court rising toward the front block: to the upper room's door, or on the one-storey house's roof
  { const len = Math.max(2.4, vc0 + 3.55 > bv ? bv - vc0 - 0.1 : 3.55), n = 15, tread = len / n, h = H1 / n;
    for (let i = 0; i < n; i++) k.bx(BS, stairU[0], 0, vc0 + len - (i + 1) * tread, stairU[1], (i + 1) * h, vc0 + len - i * tread);
    const r = k.R(stairU[0], vc0, stairU[1], vc0 + len); k.col.ramp(r, 0, H1, k.south ? 's' : 'n'); }
  if (rich) richStructure(k, U, el);
  // ── the vestibule (skifa): benches, mats, the school's boards or a craftsman's goods ──
  const trade = ['loom', 'store', 'school', 'potter', 'grain', 'sleep', 'smith', 'dyer'], pick = () => trade[Math.floor(rand() * trade.length)];
  if (partition) {
    for (const s of [-1, 1]) {
      const a = s < 0 ? mid - 1.4 : mid + 1.0, b = s < 0 ? mid - 1.0 : mid + 1.4;
      k.bx(BS, a, 0, 0.8, b, 0.45, 3.4, true); k.mat(a, 0.9, b, 3.3, 0.45);
    }
    k.jar('terracotta', mid + 0.5, 0, 3.2, 1.4);
    for (let i = 0; i < 3; i++) k.bx('wood_dark', mid - 1.0 - 0.05, 0.5, 0.95 + i * 0.85, mid - 0.95, 1.0, 1.3 + i * 0.85);
    const kl = pick(); let kr = pick(); if (kr === kl) kr = trade[(trade.indexOf(kr) + 1) % trade.length];
    roomContents(k, kl, tw, 1, tw + 0.1, fv - 0.1, rand);
    roomContents(k, kr, W - tw, -1, tw + 0.1, fv - 0.1, rand);
  } else {
    // a narrow front: one room across, benches under both side walls, the boards, a jar by the door, the craftsman's mat
    for (const s of [-1, 1]) { const a = s < 0 ? tw : W - tw - 0.5, b = s < 0 ? tw + 0.5 : W - tw; k.bx(BS, a, 0, 0.9, b, 0.45, fv - 0.15, true); k.mat(a, 1.0, b, fv - 0.25, 0.45); }
    k.jar('terracotta', mid + 0.9, 0, 0.8, 1.4); k.jar('pottery_dark', mid - 0.9, 0, 0.8, 1.2);
    if (rand() < 0.5) for (let i = 0; i < 3; i++) k.bx('wood_dark', tw + 0.55, 0.5, 1.2 + i * 0.7, tw + 0.6, 1.0, 1.55 + i * 0.7);
    else for (let i = 0; i < 3; i++) k.sack(W - tw - 1.1, 1.3 + i * 0.6);
  }
  // ── the rooms are lit at any hour: a clay lamp in a niche of the vestibule and the fire of the back room ──
  { const a = k.pt(mid, 1.6), b = k.pt(mid, bv + tw + 1.4);
    ctx.lights?.push({ at: [a[0], 2.1, a[1]], color: '#ffb46b', intensity: 2.6, distance: 6 }, { at: [b[0], 1.7, b[1]], color: '#ff9a4a', intensity: 2.4, distance: 6 }); }
  // ── the court ──
  courtContents(k, tw + 1.1, W - tw, vc0, bv, rand);
  // ── the back block: the sleeping room, or the store ──
  roomContents(k, rand() < 0.65 ? 'sleep' : 'store', tw, 1, bv + tw + 0.1, D - tw - 0.1, rand);
  if (rand() < 0.6) roomContents(k, 'store', W - tw, -1, bv + tw + 0.1, D - tw - 0.1, rand);
  // ── the upper floor: laid out by the household's use (dossier §19) in an opened house, else the one room: mats for beds, a chest, a shelf of calabashes ──
  if (rich) upperRooms(k, U, el);
  else if (two) {
    const uv = (tw + fv) / 2;
    for (const du of [1.4, W - 2.8]) { k.mat(du, uv - 1.3, du + 1.3, uv + 1.1, H1, 'reed_mat'); k.bx(rand() < 0.5 ? 'cloth_ochre' : 'cloth_indigo', du + 0.1, H1 + 0.02, uv - 1.0, du + 1.2, H1 + 0.07, uv + 0.6); }
    k.bx('timber', mid - 0.5, H1, fv - 0.9, mid + 0.5, H1 + 0.55, fv - 0.3, true);
    k.bx('timber', mid - 1.6, H1 + 1.3, fv - 0.3, mid + 1.6, H1 + 1.36, fv - 0.05);
    for (let i = 0; i < 4; i++) k.bowl('hide_tan', mid - 1.2 + i * 0.8, H1 + 1.36, fv - 0.17, 0.2);
  }
}

/**
 * Fittings of the Great Mosque (docs §16) { c, a, py }: the sandals left in rows at the north door, the water jars for the
 * ablutions on banco stands beside it, Qur'an stands (rehal, an X of two boards with the book open on it) in the aisles of
 * the hall with rolled prayer mats leaning on the piers.
 */
export function mosqueFittings(el, { bag, col }) {
  const [cx, cz] = el.c, A = el.a, py = el.py ?? 3, rand = rng(55);
  const x0 = cx - A + 4, x1 = cx + A - 4, z0 = cz - A + 8, z1 = cz + A - 8, xm = cx + 2;
  const rowX = (i) => xm + 0.45 + (x1 - xm - 0.9) * (i + 0.5) / 9, aisle = (i) => (rowX(i) + rowX(i + 1)) / 2, mainX = (rowX(2) + rowX(3)) / 2;
  void x0; void z1;
  // sandals, in pairs, on the platform before the door and inside it
  for (const [zr, n] of [[z0 - 1.6, 10], [z0 - 2.1, 8], [z0 + 1.6, 6]]) for (let k = 0; k < n; k++) {
    const x = mainX - 2.6 + k * 0.52 + (rand() - 0.5) * 0.12, a = (rand() - 0.5) * 0.5;
    for (const dx of [-0.08, 0.08]) { const t = []; beamTris(t, [x + dx - Math.sin(a) * 0.12, py + 0.01, zr - Math.cos(a) * 0.12], [x + dx + Math.sin(a) * 0.12, py + 0.01, zr + Math.cos(a) * 0.12], 0.045, 0.02); bag.add(rand() < 0.5 ? 'hide_tan' : 'hide_brown', fromTriangles(t)); }
  }
  // the ablution jars on their stand, east of the door under the north wall, a basin before them
  for (const sx of [1, -1]) {
    const bx0 = mainX + sx * 6.4;
    bag.add('banco_smooth', box(bx0 - 0.9, py, z0 - 1.5, bx0 + 0.9, py + 0.4, z0 - 0.7)); col.rect([bx0 - 0.9, z0 - 1.5, bx0 + 0.9, z0 - 0.7], py, py + 0.4);
    for (let i = 0; i < 3; i++) bag.add('terracotta', lathe([[0.001, 0], [0.14 * 1.5, 0.045], [0.24 * 1.5, 0.33], [0.2 * 1.5, 0.6], [0.12 * 1.5, 0.75], [0.14 * 1.5, 0.84], [0.001, 0.81]], 10, null, bx0 - 0.5 + i * 0.5, py + 0.4, z0 - 1.1));
  }
  // Qur'an stands and rolled mats in the aisles
  for (const i of [3, 5, 6]) for (const z of [-17, -6, 8, 19]) {
    if (rand() < 0.3) continue;
    const x = aisle(i) + (rand() - 0.5) * 0.3, t = [];
    beamTris(t, [x - 0.22, py, z - 0.2], [x + 0.22, py + 0.55, z + 0.2], 0.018, 0.04); beamTris(t, [x + 0.22, py, z - 0.2], [x - 0.22, py + 0.55, z + 0.2], 0.018, 0.04);
    bag.add('wood_dark', fromTriangles(t)); bag.add('timber', box(x - 0.24, py + 0.53, z - 0.22, x + 0.24, py + 0.56, z + 0.22)); bag.add('paint_white', box(x - 0.2, py + 0.56, z - 0.17, x + 0.2, py + 0.585, z + 0.17));
  }
  for (const i of [0, 1, 2]) for (let k = 0; k < 4; k++) { const x = rowX(i) + 0.6 + k * 0.17; bag.add(k % 2 ? 'cloth_green' : 'reed_mat', lathe([[0.001, 0], [0.07, 0], [0.07, 0.9], [0.001, 0.9]], 7, null, x, py, cz - 11.5 + i * 6.5)); }
}
