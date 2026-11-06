// Mississippian (11th–12th c.; docs/settlements/cahokia.md §4): earthen platform mounds (built in the
// ground itself) carrying buildings of poles set in wall trenches, plastered with clay and thatched
// with grass; the chief's great house on Monks Mound; the palisade of logs with its bastions; the
// woodhenge of red cedar posts; the houses of the town round their courtyards.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, rod } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { Matrix4 } from '../../core/three.js';
import '../qing/index.js';

const WALL = 'mud_plaster', TH = 'thatch';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A steep hipped thatch roof over rect from y, rising rise. */
function hip(bag, [x0, z0, x1, z1], y, rise, o = 0.5) {
  const w = x1 - x0 + 2 * o, d = z1 - z0 + 2 * o, m = Math.min(w, d) / 2 - 0.05;
  bag.add(TH, frustum([x0 - o, z0 - o, x1 + o, z1 + o], y, y + rise, m, m, m, m));          // closed below: the eaves' underside
}
/** Push triangle a b c turned to face `want`. */
function tri(out, a, b, c, want) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  if (nx * want[0] + ny * want[1] + nz * want[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
/**
 * A hipped roof of grass thatch laid in courses: each course's butt ends stand a little proud of the
 * course below, so the roof reads in tiers, thick at the eaves; a ridge roll on top. rect, eave y,
 * rise, overhang o, courses n.
 */
function thatchHip(bag, [x0, z0, x1, z1], y, rise, o = 0.8, n = 5) {
  const X0 = x0 - o, Z0 = z0 - o, X1 = x1 + o, Z1 = z1 + o, m = Math.min(X1 - X0, Z1 - Z0) / 2 - 0.02, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
  // the loop at slope parameter t (0 eave … 1 ridge), pushed out by p metres
  const loop = (t, p) => {
    const ix = m * t, yy = y + rise * t - p * 0.5;
    return [[X0 + ix - p, yy, Z0 + ix - p], [X1 - ix + p, yy, Z0 + ix - p], [X1 - ix + p, yy, Z1 - ix + p], [X0 + ix - p, yy, Z1 - ix + p]];
  };
  const T = [];
  for (let k = 0; k < n; k++) {
    const t0 = k / n * 0.92, t1 = k === n - 1 ? 1 : (k + 1) / n * 0.92 + 0.06, butt = (k ? 0.3 : 0.4) * (1 - 0.5 * k / n);
    const lo = loop(t0, butt), hi = loop(t1, 0), inner = loop(t0, 0);
    for (let e = 0; e < 4; e++) {
      const f = (e + 1) % 4, mid = [(lo[e][0] + lo[f][0]) / 2 - cx, 0, (lo[e][2] + lo[f][2]) / 2 - cz];
      const want = [mid[0], Math.hypot(mid[0], mid[2]) * 0.8, mid[2]];
      tri(T, lo[e], lo[f], hi[f], want); tri(T, lo[e], hi[f], hi[e], want);
      // the butt ends, facing down and out
      const dn = [mid[0], -Math.hypot(mid[0], mid[2]) * 2, mid[2]];
      tri(T, lo[e], lo[f], inner[f], dn); tri(T, lo[e], inner[f], inner[e], dn);
    }
  }
  bag.add(TH, fromTriangles(T));
  // the ridge roll
  const long = X1 - X0 >= Z1 - Z0, half = Math.abs((X1 - X0) - (Z1 - Z0)) / 2;
  const a = long ? [cx - half - 0.3, y + rise + 0.05, cz] : [cx, y + rise + 0.05, cz - half - 0.3], b = long ? [cx + half + 0.3, y + rise + 0.05, cz] : [cx, y + rise + 0.05, cz + half + 0.3];
  bag.add(TH, rod(a, b, 0.32, 8));
  return { a, b };
}
/** A doorway in a daubed wall: the dark opening, its two door posts and the lintel pole, a worn sill of clay. side: 'n'|'s'; at: x. */
function doorway(bag, x, zf, y, sg, w = 0.8, h = 1.9) {
  bag.add('opening', box(x - w / 2, y, Math.min(zf, zf + sg * 0.03), x + w / 2, y + h, Math.max(zf, zf + sg * 0.03)));
  for (const s of [-1, 1]) bag.add('timber', rod([x + s * (w / 2 + 0.1), y - 0.3, zf + sg * 0.1], [x + s * (w / 2 + 0.1), y + h + 0.3, zf + sg * 0.1], 0.11, 7));
  bag.add('timber', rod([x - w / 2 - 0.35, y + h + 0.12, zf + sg * 0.12], [x + w / 2 + 0.35, y + h + 0.12, zf + sg * 0.12], 0.09, 7));
  bag.add(WALL, box(x - w / 2 - 0.25, y - 0.2, Math.min(zf, zf + sg * 0.5), x + w / 2 + 0.25, y + 0.08, Math.max(zf, zf + sg * 0.5)));
}
/**
 * great_house: { rect, y, h, rise, post (a great post before the door: [x, z]) } — a large
 * building of posts set in wall trenches, daubed with clay: the walls, a tall hipped roof of thatch
 * in courses with its ridge roll and carved posts at the ridge's ends, the door on the south.
 */
function greatHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 4, rise = el.rise ?? 10;
  bag.add(WALL, box(x0, y - 0.6, z0, x1, y + h, z1)); col.rect(el.rect, y - 0.6, y + h);
  // the wall plate under the eaves
  bag.add('timber', box(x0 - 0.12, y + h - 0.34, z0 - 0.12, x1 + 0.12, y + h - 0.05, z1 + 0.12));
  const { a, b } = thatchHip(bag, el.rect, y + h - 0.1, rise, Math.min(1.1, 0.06 * (x1 - x0 + z1 - z0)), Math.max(4, Math.round(rise / 1.6)));
  // the carved posts standing at the ridge's ends
  for (const p of [a, b]) {
    bag.add('timber_red', rod([p[0], p[1] - 1.2, p[2]], [p[0], p[1] + 2.0, p[2]], 0.16, 8));
    bag.add('timber_red', lathe([[0.001, 0], [0.26, 0.08], [0.3, 0.3], [0.2, 0.5], [0.001, 0.62]], 8, null, p[0], p[1] + 2.0, p[2]));
  }
  doorway(bag, (x0 + x1) / 2, z1, y, 1, 1.0, 2.2);
  if (el.post) { const [px, pz] = el.post; bag.add('timber_red', lathe([[0.5, 0], [0.46, 9], [0.36, 9.6], [0.001, 9.8]], 12, null, px, y - 0.8, pz)); col.circle(px, pz, 0.5, y, y + 9); }
}
/** house: { rect, y, foot, seed } — a wall-trench house: low clay walls, a steep thatched hip or gable, a doorway. */
function house(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, rand = rng(el.seed || 1);
  bag.add(WALL, box(x0, foot, z0, x1, y + 2, z1)); col.rect(el.rect, foot, y + 2);
  const along = (x1 - x0) >= (z1 - z0), rise = 2.6 + rand() * 1.2, o = 0.4;
  if (rand() < 0.5) hip(bag, el.rect, y + 2, rise, o);
  else { const r = [x0 - o, z0 - o, x1 + o, z1 + o]; if (along) { const hz = (z1 - z0) / 2 + o; bag.add(TH, frustum(r, y + 2, y + 2 + rise, 0, 0, hz, hz, { noTop: true })); } else { const hx = (x1 - x0) / 2 + o; bag.add(TH, frustum(r, y + 2, y + 2 + rise, hx, hx, 0, 0, { noTop: true })); } }
  const f = rand() < 0.5 ? z0 : z1, sg = f === z0 ? -1 : 1, mx = (x0 + x1) / 2;
  bag.add('opening', box(mx - 0.4, y, f + sg * 0.01, mx + 0.4, y + 1.5, f + sg * 0.05));
  // the door posts and the lintel pole across them
  const z0d = Math.min(f, f + sg * 0.16), z1d = Math.max(f, f + sg * 0.16);
  for (const sd of [-1, 1]) bag.add('timber', box(mx + sd * 0.48 - 0.07, foot, z0d, mx + sd * 0.48 + 0.07, y + 1.72, z1d));
  bag.add('timber', box(mx - 0.68, y + 1.58, z0d - 0.005, mx + 0.68, y + 1.74, z1d + 0.005));
}
/**
 * palisade: { rect, y (fn), every (bastion spacing), gates: [[side, t]] } — a wall of logs set in a
 * trench and daubed with clay, the logs' rounded tops standing above the daub; round bastions
 * standing out of the wall at intervals; at the gates the wall overlaps itself, the gap screened.
 */
function palisade(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, yf = typeof el.y === 'function' ? el.y : () => el.y ?? 0, every = el.every ?? 25, h = el.h ?? 4.5, gates = el.gates ?? [], half = 0.3;
  // a stretch of wall a→b: the daubed body, the post tops above it
  const tops = [], daub = [];
  const stretch = (pa, pb) => {
    const L = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]), ux = (pb[0] - pa[0]) / L, uz = (pb[1] - pa[1]) / L, yy = Math.min(yf(...pa), yf(...pb));
    beamTris(daub, [pa[0], yy - 1, pa[1]], [pb[0], yy - 1, pb[1]], half, h + 1);
    col.segment(pa, pb, 2 * half, yy - 1, yy + h);
    for (let q = 0; q < Math.floor(L / 0.36); q++) {
      const t = (q + 0.5) * L / Math.floor(L / 0.36), x = pa[0] + ux * t, z = pa[1] + uz * t, r = 0.17 + ((q * 7919) % 5) * 0.012, hh = 0.55 + ((q * 104729) % 7) * 0.06;
      tops.push([x, yy + h - 0.25, z, r, hh]);
    }
  };
  const sides = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
  sides.forEach(([a, b], si) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, ox = uz, oz = -ux, n = Math.round(L / every);
    const gaps = gates.filter(([s]) => s === si).map(([, t]) => t * L);
    for (let k = 0; k < n; k++) {
      const s0 = k * L / n, s1 = (k + 1) * L / n, mid = (s0 + s1) / 2, P = (s) => [a[0] + ux * s, a[1] + uz * s];
      if (gaps.some((g) => Math.abs(g - mid) < L / n / 2)) {
        // the gate: the wall stops either side of a 3 m gap; a screen of wall outside overlaps it
        stretch(P(s0), P(mid - 1.5)); stretch(P(mid + 1.5), P(s1));
        const sa = P(mid - 7), sb = P(mid + 7);
        stretch([sa[0] + ox * 4, sa[1] + oz * 4], [sb[0] + ox * 4, sb[1] + oz * 4]);
      } else stretch(P(s0), P(s1));
      // the round bastion at the end of the stretch, standing out of the wall
      const pb = P(s1), bx = pb[0] + ox * 1.8, bz = pb[1] + oz * 1.8, yb = Math.min(yf(bx, bz), yf(...pb)), R = 2.6;
      bag.add(WALL, lathe([[R + 0.1, -1], [R, h + 1.0], [R - 0.5, h + 1.0], [R - 0.5, h + 0.2], [0.001, h + 0.2]], 20, null, bx, yb, bz));
      col.circle(bx, bz, R, yb - 1, yb + h + 1.0);
      for (let q = 0; q < 40; q++) { const ang = q / 40 * Math.PI * 2; tops.push([bx + Math.cos(ang) * (R - 0.22), yb + h + 0.8, bz + Math.sin(ang) * (R - 0.22), 0.18, 0.5 + (q % 3) * 0.08]); }
    }
  });
  bag.add(WALL, fromTriangles(daub));
  // the post tops: rounded log ends, a little uneven in height and girth — a few shapes, placed as instances
  const shapes = [0, 1, 2, 3].map((k) => { const r = 0.19, hh = 0.55 + 0.11 * k; return lathe([[r, 0], [r * 0.97, hh * 0.7], [r * 0.6, hh * 0.92], [0.001, hh]], 6); });
  const M = new Matrix4(), S = new Matrix4();
  tops.forEach(([x, yy, z, r, hh], i) => {
    M.makeRotationY((i * 2.399) % 6.283).premultiply(S.makeScale(r / 0.19, r / 0.19, r / 0.19)).setPosition(x, yy, z);
    const g = shapes[Math.min(3, Math.max(0, Math.round((hh - 0.55) / 0.11)))];
    if (bag.addInstance) bag.addInstance('palisade', g.clone(), M.clone(), { reach: 400 });
    else bag.add('palisade', g.clone().applyMatrix4(M));
  });
}
/** woodhenge: { c, r, n, y, h } — a circle of red cedar posts, a central observing post. */
function woodhenge(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r ?? 45, n = el.n ?? 48, y = el.y ?? 0, h = el.h ?? 6;
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; bag.add('timber_red', lathe([[0.4, 0], [0.38, h], [0.001, h + 0.3]], 8, null, x, y - 0.6, z)); col.circle(x, z, 0.4, y, y + h); }
  bag.add('timber_red', lathe([[0.5, 0], [0.45, h + 1.5], [0.001, h + 1.8]], 8, null, cx, y - 0.6, cz)); col.circle(cx, cz, 0.5, y, y + h + 1.5);
}
/** chunkey_post: { c, y, h } — the tall pole at the plaza's centre. */
function pole(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 12;
  bag.add('timber_red', lathe([[0.45, 0], [0.3, h], [0.001, h + 0.2]], 8, null, x, y - 0.6, z)); col.circle(x, z, 0.45, y, y + h);
}
/**
 * chunkey_yard: { rect (long along x or z), y } — a chunkey yard on the plaza: a long strip of clay
 * beaten smooth and hard, low banks of earth down its long sides; a few discoidal stones and the
 * players' poles laid by.
 */
function chunkeyYard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, along = x1 - x0 >= z1 - z0, rand = rng(el.seed || 3);
  bag.add(WALL, frustum([x0, z0, x1, z1], y - 0.3, y + 0.05, 0.25, 0.25, 0.25, 0.25));
  col.floor([x0, z0, x1, z1], y + 0.05);
  for (const s of [-1, 1]) {
    const r = along ? [x0, s < 0 ? z0 - 1.6 : z1 + 0.1, x1, s < 0 ? z0 - 0.1 : z1 + 1.6] : [s < 0 ? x0 - 1.6 : x1 + 0.1, z0, s < 0 ? x0 - 0.1 : x1 + 1.6, z1];
    bag.add('earth_wall', frustum(r, y - 0.4, y + 0.35, 0.6, 0.6, 0.6, 0.6));
  }
  // the stones: discs of polished stone, their faces dished; the poles, about six feet long, at the yard's end
  const end = along ? [x1 - 1.5, (z0 + z1) / 2] : [(x0 + x1) / 2, z1 - 1.5];
  for (let k = 0; k < 3; k++) {
    const sx = end[0] + (rand() - 0.5) * 1.5, sz = end[1] + (rand() - 0.5) * 1.5, r = 0.055 + rand() * 0.02;
    const g = lathe([[0.001, 0], [r * 0.6, 0.004], [r, 0.012], [r, 0.04], [r * 0.6, 0.048], [0.001, 0.052]], 12, null, 0, 0, 0);
    g.rotateZ(Math.PI / 2); g.translate(sx, y + 0.05 + r, sz);
    bag.add(k ? 'granite_red' : 'granite_grey', g);
  }
  for (let k = 0; k < 2; k++) {
    const a = rand() * Math.PI, cx = end[0] + (rand() - 0.5), cz = end[1] + (rand() - 0.5);
    bag.add('timber', rod([cx - Math.cos(a) * 0.9, y + 0.074, cz - Math.sin(a) * 0.9], [cx + Math.cos(a) * 0.9, y + 0.074, cz + Math.sin(a) * 0.9], 0.025, 6));
  }
}
registerStyle('mississippian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, great_house: greatHouse, miss_house: house, palisade, woodhenge, plaza_pole: pole, chunkey_yard: chunkeyYard },
  objects: {},
});
