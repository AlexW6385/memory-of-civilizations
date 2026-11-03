// Inca architecture at Machu Picchu (15th c.; docs/settlements/machu-picchu.md §4–§5): walls of
// white granite — finely fitted ashlar in the temples, rougher stones set in clay in the houses —
// leaning slightly inward, with trapezoidal doorways, niches and windows; steep gabled roofs of
// ichu grass on the houses, their gables of stone with roof pegs; the curved wall of the Temple
// of the Sun on its rock; the three-walled temples of the Sacred Plaza; the Intihuatana; terraces
// held by stone walls, stairs cut into the rock.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import '../qing/index.js';
import { rectRoof, beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A wall from a to b { y, h, th, mat } leaning in (the top narrower), with trapezoidal openings { at, w, h, sill, kind: 'door'|'niche'|'window' }. */
function incaWall(bag, col, a, b, y, h, th, mat, openings = []) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.1) return;
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const doors = openings.filter((o) => o.kind === 'door').sort((p, q) => p.at - q.at);
  let s = 0;
  const seg = (s0, s1) => {
    if (s1 - s0 < 0.05) return;
    const p = [a[0] + ux * s0, a[1] + uz * s0], q = [a[0] + ux * s1, a[1] + uz * s1], t = [];
    beamTris(t, [p[0], y, p[1]], [q[0], y, q[1]], th / 2, h);
    bag.add(mat, fromTriangles(t));
    col.segment(p, q, th, y, y + h);
  };
  for (const d of doors) {
    seg(s, d.at - d.w / 2);
    // the lintel over the door (the trapezoid: narrower at the top)
    const c = [a[0] + ux * d.at, a[1] + uz * d.at], t = [];
    beamTris(t, [c[0] - ux * (d.w / 2 + 0.2), y + d.h, c[1] - uz * (d.w / 2 + 0.2)], [c[0] + ux * (d.w / 2 + 0.2), y + d.h, c[1] + uz * (d.w / 2 + 0.2)], th / 2, h - d.h);
    bag.add(mat, fromTriangles(t));
    // the jambs leaning in
    for (const sg of [-1, 1]) {
      const j = [];
      beamTris(j, [c[0] + ux * sg * d.w / 2, y, c[1] + uz * sg * d.w / 2], [c[0] + ux * sg * d.w * 0.38, y + d.h, c[1] + uz * sg * d.w * 0.38], th / 2 + 0.01, 0.01);
      void j;
    }
    s = d.at + d.w / 2;
  }
  seg(s, L);
  // niches and windows: dark trapezoids set into the wall's face
  for (const o of openings.filter((q) => q.kind !== 'door')) {
    const c = [a[0] + ux * o.at, a[1] + uz * o.at], nx = -uz, nz = ux, sill = o.sill ?? 1.0, w = o.w ?? 0.6, hh = o.h ?? 0.8;
    for (const sg of o.kind === 'window' ? [-1, 1] : [1]) {
      const t = [];
      const P = (u, v) => [c[0] + ux * u + nx * (th / 2 + 0.01) * sg, y + v, c[1] + uz * u + nz * (th / 2 + 0.01) * sg];
      const q = [P(-w / 2, sill), P(w / 2, sill), P(w * 0.38, sill + hh), P(-w * 0.38, sill + hh)];
      t.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]);
      if (sg < 0) for (let i = 0; i < t.length; i += 9) { for (let k = 0; k < 3; k++) { const v = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = v; } }
      bag.add('lacquer_black', fromTriangles(t));
    }
  }
}

/**
 * inca_house: a house { rect, y, h, front, roof ('thatch' | 'none'), seed }: four walls of rough
 * granite, a door in the front, niches inside, stone gables carrying a steep thatched roof.
 */
function incaHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 2.6, th = 0.7, mat = el.mat || 'granite_rough';
  const along = x1 - x0 >= z1 - z0, f = el.front || 's';
  const sides = { n: [[x0, z0], [x1, z0]], s: [[x1, z1], [x0, z1]], w: [[x0, z1], [x0, z0]], e: [[x1, z0], [x1, z1]] };
  for (const [k, [a, b]] of Object.entries(sides)) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), op = [];
    if (k === f) op.push({ kind: 'door', at: L / 2, w: 1.1, h: 2.0 });
    else if (L > 3) for (let i = 1; i <= Math.floor(L / 2.2); i++) if (rand() < 0.4) op.push({ kind: rand() < 0.3 ? 'window' : 'niche', at: i * L / (Math.floor(L / 2.2) + 1), w: 0.5, h: 0.7, sill: 1.1 });
    incaWall(bag, col, a, b, y, h, th, mat, op);
  }
  bag.add('granite_inca', box(x0 - 0.1, y - 0.3, z0 - 0.1, x1 + 0.1, y + 0.05, z1 + 0.1));
  col.floor([x0, z0, x1, z1], y + 0.05);
  if (el.roof === 'none') return;
  // the stone gables at the short ends, the thatch between them
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, A = (along ? x1 - x0 : z1 - z0) / 2, B = (along ? z1 - z0 : x1 - x0) / 2, rise = B * 1.5;
  for (const s of [-1, 1]) {
    const g = [], P = (u, v, w) => (along ? [cx + s * (A - th / 2), y + h + v, cz + u] : [cx + u, y + h + v, cz + s * (A - th / 2)]);
    const q0 = P(-B, 0), q1 = P(B, 0), q2 = P(0, rise);
    g.push(...q0, ...q1, ...q2, ...q0, ...q2, ...q1);
    bag.add(mat, fromTriangles(g));
  }
  rectRoof({ c: [cx, cz], A: A + 0.4, B: B + 0.7, y: y + h - 0.1, rise: rise + 0.2, kind: 'gable', sweep: 0, p: 1, curl: false, alongZ: !along, mat: 'ichu', soffit: 'ichu' }, bag);
}

/** inca_temple: a temple of fine ashlar { rect, y, h, open ('n'|…: a side left open — the three-walled temples), windows: n } on a platform of large blocks. */
function incaTemple(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3.4, th = 1.0;
  bag.add('granite_inca', box(x0 - 0.6, y - 1.2, z0 - 0.6, x1 + 0.6, y, z1 + 0.6));
  col.floor([x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], y);
  col.rect([x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], y - 1.2, y - 0.31);
  const sides = { n: [[x0, z0], [x1, z0]], s: [[x1, z1], [x0, z1]], w: [[x0, z1], [x0, z0]], e: [[x1, z0], [x1, z1]] };
  for (const [k, [a, b]] of Object.entries(sides)) {
    if (k === el.open) continue;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), op = [];
    const nw = k === el.windowSide ? (el.windows ?? 3) : 0;
    for (let i = 0; i < nw; i++) op.push({ kind: 'window', at: (i + 1) * L / (nw + 1), w: 1.3, h: 1.5, sill: 1.0 });
    if (!nw) for (let i = 1; i < Math.floor(L / 1.8); i++) op.push({ kind: 'niche', at: i * L / Math.floor(L / 1.8), w: 0.7, h: 1.1, sill: 1.0 });
    incaWall(bag, col, a, b, y, h, th, 'granite_inca', op);
  }
}

/** torreon: the Temple of the Sun — a curved wall of fine ashlar round a rock { c, r, y, h, arc } with two trapezoid windows. */
function torreon(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r, y = el.y ?? 0, h = el.h ?? 4.5, a0 = el.from ?? -Math.PI * 0.9, a1 = el.to ?? Math.PI * 0.4, n = 24;
  for (let k = 0; k < n; k++) {
    const t0 = a0 + (a1 - a0) * k / n, t1 = a0 + (a1 - a0) * (k + 1) / n;
    const p = [cx + Math.cos(t0) * r, cz + Math.sin(t0) * r], q = [cx + Math.cos(t1) * r, cz + Math.sin(t1) * r], t = [];
    beamTris(t, [p[0], y, p[1]], [q[0], y, q[1]], 0.5, h);
    bag.add('granite_inca', fromTriangles(t));
    col.segment(p, q, 1.0, y, y + h);
  }
  // the sacred rock inside, the platform below it
  bag.add('granite_rough', lathe([[r * 0.7, 0], [r * 0.6, 1.4], [r * 0.3, 2.2], [0.001, 2.4]], 10, (t, i) => 1 + 0.15 * Math.sin(t * 3 + i), cx, y, cz));
  bag.add('granite_inca', box(cx - r - 3, y - 3, cz - r - 3, cx + r + 3, y, cz + r + 3));
  col.floor([cx - r - 3, cz - r - 3, cx + r + 3, cz + r + 3], y);
}

/** intihuatana: the carved stone post on its terraced hill { c, y } (the hill's terraces are built separately). */
function intihuatana(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y;
  bag.add('granite_rough', frustum([cx - 1.6, cz - 1.0, cx + 1.6, cz + 1.0], y, y + 0.9, 0.2, 0.2, 0.2, 0.2));
  bag.add('granite_inca', frustum([cx - 0.45, cz - 0.35, cx + 0.45, cz + 0.35], y + 0.9, y + 2.7, 0.08, 0.08, 0.08, 0.08));
  col.rect([cx - 1.6, cz - 1, cx + 1.6, cz + 1], y, y + 2.7);
}

/** ring_wall: a terrace's retaining wall along a polyline { pts, y0, y1 } (the uphill side filled to y1). */
function ringWall(el, { bag, col }) {
  const t = [];
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const a = el.pts[i], b = el.pts[i + 1];
    beamTris(t, [a[0], el.y0 - 0.6, a[1]], [b[0], el.y0 - 0.6, b[1]], 0.45, el.y1 - el.y0 + 0.65);
    col.segment(a, b, 0.9, el.y0 - 0.6, el.y1 + 0.05 - 0.3);
  }
  bag.add(el.mat || 'granite_rough', fromTriangles(t));
}

registerStyle('inca', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, inca_house: incaHouse, inca_temple: incaTemple, torreon, intihuatana, ring_wall: ringWall },
  objects: {},
});
