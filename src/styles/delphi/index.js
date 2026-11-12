// The architecture of Delphi about 400 BC (docs/settlements/delphi.md §4–§5): the Greek vocabulary (the `greek` style, read only)
// with the sanctuary's own pieces: the graded paving of the Sacred Way, the polygonal wall, the adyton with the omphalos and the
// Pythia's tripod, the Serpent Column, the Naxian sphinx on its Ionic column, bronze offerings on their bases, a maiden (kore),
// the stalls of the votive sellers. Style `delphi`: its elements fall back to the greek ones.
import { registerStyle, orientedBox } from '../../core/build.js';
import { box, lathe, rod, fromTriangles, quad, place } from '../../core/geom.js';
import { greek } from '../greek/index.js';
import '../greek/town.js';
import '../greek/quarter.js';
import '../greek/gymnasium.js';
import '../greek/house-interior.js';
import '../greek/ward.js';
import './house.js';
import { DRESS } from './dress.js';
import { human, placed, blob, limb } from '../greek/sculpture.js';
import { merge } from '../greek/columns.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** ribbon: { pts: [[x, z], …], ys: [y, …], w, mat, lift } — paving laid along a graded way, each point at its true height. */
function ribbon(el, { bag }) {
  const P = el.pts.map(([x, z], i) => [x, el.ys[i], z]), h = el.w / 2, lift = el.lift ?? 0.04, out = [];
  const lat = (i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1; return [dz / L, -dx / L]; };
  for (let i = 0; i + 1 < P.length; i++) {
    const l0 = lat(i), l1 = lat(i + 1), a = P[i], b = P[i + 1];
    quad(out, [a[0] - l0[0] * h, a[1] + lift, a[2] - l0[1] * h], [b[0] - l1[0] * h, b[1] + lift, b[2] - l1[1] * h], [b[0] + l1[0] * h, b[1] + lift, b[2] + l1[1] * h], [a[0] + l0[0] * h, a[1] + lift, a[2] + l0[1] * h]);
  }
  bag.add(el.mat ?? 'flagstone', fromTriangles(out));
  if (el.kerb) {
    const k = [];
    for (const s of [-1, 1]) for (let i = 0; i + 1 < P.length; i++) {
      const l0 = lat(i), l1 = lat(i + 1), a = P[i], b = P[i + 1], o = h + 0.06;
      const p = (q, l, e) => [q[0] + s * l[0] * e, q[2] + s * l[1] * e];
      const a0 = p(a, l0, o - 0.12), a1 = p(a, l0, o + 0.12), b0 = p(b, l1, o - 0.12), b1 = p(b, l1, o + 0.12);
      quad(k, [a0[0], a[1] + lift + 0.12, a0[1]], [b0[0], b[1] + lift + 0.12, b0[1]], [b1[0], b[1] + lift + 0.12, b1[1]], [a1[0], a[1] + lift + 0.12, a1[1]]);
    }
    bag.add('limestone', fromTriangles(k));
  }
}

/**
 * polygonal_wall: { a, b, y0, y1 (a run of heights: the ground may fall), th, seed } — the retaining wall of the temple's terrace
 * in polygonal masonry: a core of rubble and, on its face (toward `face`: +1 left of a→b, −1 right), courses of limestone blocks
 * each its own size, joints open between, the face a little swelled.
 */
function polygonalWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = uz * (el.face ?? 1), nz = -ux * (el.face ?? 1);
  const th = el.th ?? 1.6, y0 = el.y0, y1 = el.y1, rand = rng(el.seed ?? 5);
  bag.add('rubble', orientedBox([ax, az], [bx, bz], th, y0, y1));
  col.segment([ax, az], [bx, bz], th, y0, y1);
  const stones = [];
  let y = y0;
  while (y < y1 - 0.05) {
    const hgt = Math.min(y1 - y, 0.55 + rand() * 0.6);
    let s = -rand() * 0.8;
    while (s < L) {
      const w = 0.6 + rand() * 1.4, s0 = Math.max(0, s + 0.03), s1 = Math.min(L, s + w - 0.03);
      if (s1 - s0 > 0.1) {
        const o = th / 2 + 0.02 + rand() * 0.07, tilt = (rand() - 0.5) * 0.3;
        const p0 = [ax + ux * s0 + nx * (o - 0.1), az + uz * s0 + nz * (o - 0.1)], p1 = [ax + ux * s1 + nx * (o - 0.1), az + uz * s1 + nz * (o - 0.1)];
        // each stone fitted to its neighbours: its own height, its top and bottom edges slipped a little (the polygonal joints are not courses)
        const yb = Math.max(y0, y + (rand() - 0.5) * 0.28), yt = Math.min(y1, y + hgt * (0.8 + rand() * 0.45));
        if (yt - yb < 0.12) { s += w; continue; }
        const st = orientedBox(p0, p1, 0.2, yb + 0.02, yt - 0.02);
        stones.push(st); void tilt;
      }
      s += w;
    }
    y += hgt;
  }
  if (stones.length) bag.add(el.mat ?? 'limestone', merge(stones));
}

/** adyton: { c: [x, z] (the tripod; the room runs from c.x − 4 west to c.x + 3.6 east and ±4.9 across), y } — the sunken room's furnishings: the omphalos in its net of wool on its base, the Pythia's tripod over the stone-lined cleft under a grating, the gilded Apollo on his base against the west wall, the laurel, the altar of the fire. */
function adyton(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, R = (g, m) => bag.add(m, g);
  // the omphalos: a stone egg on its round base, a net of fillets carved on it
  const ox = cx + 0.4, oz = cz - 3.0;
  R(lathe([[0.62, 0], [0.62, 0.22], [0.5, 0.28], [0.001, 0.28]], 16, null, ox, y, oz), 'marble');
  R(lathe([[0.001, 0.25], [0.3, 0.3], [0.44, 0.6], [0.46, 0.95], [0.36, 1.3], [0.16, 1.48], [0.001, 1.52]], 18, null, ox, y, oz), 'marble_smooth');
  const net = [];
  for (const [r, yy] of [[0.305, 0.34], [0.45, 0.62], [0.47, 0.95], [0.38, 1.25]]) net.push(lathe([[r, yy], [r + 0.02, yy + 0.01], [r + 0.02, yy + 0.05], [r, yy + 0.06]], 18, null, ox, y, oz));
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; net.push(rod([ox + Math.cos(a) * 0.32, y + 0.36, oz + Math.sin(a) * 0.32], [ox + Math.cos(a + 0.7) * 0.4, y + 1.3, oz + Math.sin(a + 0.7) * 0.4], 0.016, 4)); }
  R(merge(net), 'marble_dark');
  col.circle(ox, oz, 0.65, y, y + 1.5);
  // the cleft under the tripod: a stone-lined well covered by a bronze grating
  R(box(cx - 0.9, y - 0.02, cz - 0.9, cx + 0.9, y + 0.06, cz + 0.9), 'rubble');
  R(box(cx - 0.6, y + 0.06, cz - 0.6, cx + 0.6, y + 0.07, cz + 0.6), 'granite_black');
  const bars = []; for (let i = -2; i <= 2; i++) bars.push(box(cx - 0.62, y + 0.07, cz + i * 0.25 - 0.015, cx + 0.62, y + 0.1, cz + i * 0.25 + 0.015), box(cx + i * 0.25 - 0.015, y + 0.07, cz - 0.62, cx + i * 0.25 + 0.015, y + 0.1, cz + 0.62));
  R(merge(bars), 'bronze');
  // the tripod: three legs with hoof feet, the cauldron, the dish of Kassotis water on it
  const tp = [];
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.5, ca = Math.cos(a), sa = Math.sin(a); tp.push(rod([cx + ca * 0.55, y + 0.1, cz + sa * 0.55], [cx + ca * 0.36, y + 1.05, cz + sa * 0.36], 0.028, 5)); tp.push(lathe([[0.001, 0], [0.05, 0.02], [0.045, 0.1], [0.001, 0.11]], 6, null, cx + ca * 0.55, y + 0.1, cz + sa * 0.55)); }
  tp.push(lathe([[0.001, 0], [0.3, 0.04], [0.45, 0.2], [0.47, 0.4], [0.4, 0.5], [0.001, 0.5]], 16, null, cx, y + 1.02, cz));
  tp.push(lathe([[0.3, 0], [0.4, 0.02], [0.42, 0.06], [0.001, 0.05]], 14, null, cx, y + 1.5, cz));
  R(merge(tp), 'bronze');
  R(lathe([[0.001, 0], [0.26, 0.012], [0.26, 0.016], [0.001, 0.016]], 14, null, cx, y + 1.54, cz), 'water');
  col.circle(cx, cz, 0.62, y, y + 1.6);
  // the gilded statue of Apollo on its base against the west wall, facing east
  const sx = cx - 3.0;
  R(box(sx - 0.7, y, cz - 0.8, sx + 0.7, y + 0.5, cz + 0.8), 'marble');
  const f = human({ pose: 'stand', drape: 'peplos', h: 2.2, n: 8, arms: { l: [[-0.15, 0.64, 0.05], [-0.17, 0.62, 0.2]], r: [[0.16, 0.64, 0.05], [0.18, 0.64, 0.2]] } });
  const g = placed(f, sx, y + 0.5, cz, Math.PI / 2);
  bag.add('gilt_bronze', g.stone); if (g.metal) bag.add('gilt_bronze', g.metal);
  col.rect([sx - 0.7, cz - 0.8, sx + 0.7, cz + 0.8], y, y + 2.8);
  // the laurel: boughs in a bronze vase, in the north-west corner
  const lx = cx - 2.9, lz = cz - 3.9, lv = [];
  for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28; lv.push(limb([lx, y + 0.5, lz], [lx + Math.cos(a) * 0.45, y + 1.5 + (k % 3) * 0.2, lz + Math.sin(a) * 0.45], 0.014, 0.008, 4), blob([lx + Math.cos(a) * 0.5, y + 1.55 + (k % 3) * 0.2, lz + Math.sin(a) * 0.5], 0.12, [1, 0.7, 1], 5)); }
  R(merge(lv), 'fresco_green');
  R(lathe([[0.18, 0], [0.22, 0.2], [0.14, 0.5], [0.001, 0.5]], 10, null, lx, y, lz), 'bronze');
  col.circle(lx, lz, 0.3, y, y + 0.5);
  // the altar of the fire (pine, bay leaves, barley meal): a stone block with an iron grate and the flame
  const ax = cx + 2.0, az = cz + 3.4;
  R(box(ax - 0.55, y, az - 0.45, ax + 0.55, y + 0.8, az + 0.45), 'limestone');
  R(box(ax - 0.45, y + 0.8, az - 0.35, ax + 0.45, y + 0.86, az + 0.35), 'iron');
  R(lathe([[0.001, 0.0], [0.3, 0.1], [0.36, 0.22], [0.001, 0.24]], 8, null, ax, y + 0.86, az), 'flame');
  col.rect([ax - 0.55, az - 0.45, ax + 0.55, az + 0.45], y, y + 0.9);
}

/** serpent_column: { at, y } — the bronze of the Plataean dedication: three serpents intertwined in coils, their heads spread under the gilded tripod. 8 m in all. */
function serpentColumn(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y;
  bag.add('limestone', box(cx - 1.5, y - 0.4, cz - 1.5, cx + 1.5, y + 0.35, cz + 1.5));
  bag.add('marble', box(cx - 1.2, y + 0.35, cz - 1.2, cx + 1.2, y + 0.75, cz + 1.2));
  col.rect([cx - 1.5, cz - 1.5, cx + 1.5, cz + 1.5], y, y + 0.75);
  const base = y + 0.75, H = 5.6, rods = [];
  bag.add('bronze', lathe([[0.001, 0], [0.34, 0], [0.3, 0.2], [0.24, H], [0.001, H]], 12, null, cx, base, cz));
  for (let k = 0; k < 3; k++) {
    let prev = null;
    for (let i = 0; i <= 54; i++) {
      const t = i / 54, yy = base + 0.15 + t * (H - 0.4), rr = 0.28 - 0.06 * t + 0.04 * Math.sin(t * Math.PI), a = k * Math.PI * 2 / 3 + t * 9 * Math.PI * 2 / 3 * 3;
      const p = [cx + Math.cos(a) * rr, yy, cz + Math.sin(a) * rr];
      if (prev) rods.push(rod(prev, p, 0.075 - 0.02 * t, 6));
      prev = p;
    }
    // the head, raised, turned out
    const a = k * Math.PI * 2 / 3 + 0.4, hx = cx + Math.cos(a) * 0.5, hz = cz + Math.sin(a) * 0.5;
    rods.push(limb([cx + Math.cos(a) * 0.2, base + H - 0.5, cz + Math.sin(a) * 0.2], [hx, base + H + 0.1, hz], 0.07, 0.05, 6), blob([hx + Math.cos(a) * 0.08, base + H + 0.2, hz + Math.sin(a) * 0.08], 0.1, [1.3, 0.8, 1], 7));
  }
  bag.add('bronze', merge(rods));
  const g = [];
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.3; g.push(rod([cx + Math.cos(a) * 0.5, base + H + 0.1, cz + Math.sin(a) * 0.5], [cx + Math.cos(a) * 0.4, base + H + 1.7, cz + Math.sin(a) * 0.4], 0.04, 5)); }
  g.push(lathe([[0.001, 0], [0.3, 0.05], [0.5, 0.25], [0.52, 0.5], [0.44, 0.62], [0.001, 0.62]], 16, null, cx, base + H + 1.6, cz));
  g.push(lathe([[0.3, 0], [0.4, 0.04], [0.4, 0.08], [0.2, 0.1]], 12, null, cx, base + H + 2.22, cz));
  bag.add('gilt_bronze', merge(g));
}

/** sphinx_column: { at, y } — the Naxians' dedication: a fluted Ionic column of 10 m of Naxian marble and on it the sphinx, 2.2 m high. */
function sphinxColumn(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y;
  bag.add('marble', box(cx - 1.3, y - 0.4, cz - 1.3, cx + 1.3, y + 0.3, cz + 1.3));
  bag.add('marble', box(cx - 1.0, y + 0.3, cz - 1.0, cx + 1.0, y + 0.55, cz + 1.0));
  col.rect([cx - 1.3, cz - 1.3, cx + 1.3, cz + 1.3], y, y + 0.55);
  const y0 = y + 0.55, H = 9.0, flute = (th) => 1 + 0.035 * Math.cos(th * 24);
  bag.add('marble_column', lathe([[0.62, 0], [0.62, 0.3], [0.58, 0.6], [0.52, H * 0.55], [0.44, H]], 36, flute, cx, y0, cz));
  const top = y0 + H;
  bag.add('marble', merge([lathe([[0.5, 0], [0.5, 0.18], [0.001, 0.18]], 20, null, cx, top, cz), box(cx - 0.95, top + 0.18, cz - 0.34, cx + 0.95, top + 0.5, cz + 0.34), blob([cx - 0.95, top + 0.34, cz], 0.3, [1, 1, 0.5], 9), blob([cx + 0.95, top + 0.34, cz], 0.3, [1, 1, 0.5], 9), box(cx - 1.1, top + 0.5, cz - 0.42, cx + 1.1, top + 0.62, cz + 0.42)]));
  // the sphinx lying on it, facing east (+x): the lion's body, the raised breast, the woman's head under the polos, the curled wing
  const s = [], t = top + 0.62;
  s.push(blob([cx - 0.1, t + 0.45, cz], 0.5, [1.55, 0.9, 0.85], 10), blob([cx + 0.6, t + 0.85, cz], 0.38, [0.9, 1.3, 0.8], 9), blob([cx + 0.78, t + 1.55, cz], 0.2, [1, 1.2, 0.95], 8), blob([cx + 0.78, t + 1.8, cz], 0.17, [1, 0.8, 1], 7), blob([cx - 0.55, t + 0.4, cz - 0.3], 0.28, [1.4, 0.8, 0.5], 7), blob([cx - 0.55, t + 0.4, cz + 0.3], 0.28, [1.4, 0.8, 0.5], 7));
  for (const sd of [-1, 1]) s.push(limb([cx - 0.2, t + 0.75, cz + sd * 0.32], [cx - 1.0, t + 1.65, cz + sd * 0.34], 0.12, 0.03, 6), limb([cx + 0.55, t + 0.35, cz + sd * 0.2], [cx + 1.05, t + 0.2, cz + sd * 0.22], 0.08, 0.07, 6));
  s.push(limb([cx - 0.75, t + 0.4, cz], [cx - 1.25, t + 0.55, cz], 0.07, 0.04, 5));
  bag.add('marble_smooth', merge(s));
  col.circle(cx, cz, 0.7, y0, top + 0.6);
}

/** ex_voto: { at, y, yaw, kind ('man' | 'bull' | 'group'), h } — a bronze offering on its inscribed base: a man, the bull of Corcyra, a row of heroes. */
function exVoto(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, yaw = el.yaw ?? 0, h = el.h ?? 1.9, rand = rng(Math.round(x * 7 + z * 13));
  const n = el.kind === 'group' ? 3 : 1, W = el.kind === 'bull' ? 3.2 : 0.9 + (n - 1) * 1.3, Dd = el.kind === 'bull' ? 1.5 : 1.1, bh = el.kind === 'bull' ? 0.9 : 1.1 + rand() * 0.5;
  const m = (g) => place(g, x, y, z, yaw);
  bag.add('limestone', m(merge([box(-W / 2 - 0.15, 0, -Dd / 2 - 0.15, W / 2 + 0.15, 0.25, Dd / 2 + 0.15), box(-W / 2, 0.25, -Dd / 2, W / 2, bh, Dd / 2), box(-W / 2 - 0.08, bh, -Dd / 2 - 0.08, W / 2 + 0.08, bh + 0.12, Dd / 2 + 0.08)])));
  const cut = []; for (let i = 0; i < 8; i++) cut.push(box(-W / 2 + 0.12 + i * (W - 0.3) / 8, bh * 0.55, Dd / 2 - 0.004, -W / 2 + 0.12 + i * (W - 0.3) / 8 + (W - 0.3) / 11, bh * 0.55 + 0.07, Dd / 2 + 0.003));
  bag.add('marble_dark', m(merge(cut)));
  const B = [];
  if (el.kind === 'bull') {
    B.push(blob([0, bh + 0.12 + 0.95, 0], 0.62, [1.9, 0.9, 0.78], 10), blob([1.1, bh + 0.12 + 1.15, 0], 0.4, [1, 0.9, 0.85], 9), blob([1.5, bh + 0.12 + 1.1, 0], 0.26, [1.2, 0.8, 0.8], 8));
    for (const [px, pz] of [[0.8, 0.28], [0.8, -0.28], [-0.8, 0.28], [-0.8, -0.28]]) B.push(limb([px, bh + 0.12 + 0.75, pz], [px, bh + 0.12, pz], 0.1, 0.06, 6));
    B.push(limb([1.55, bh + 0.12 + 1.3, 0.18], [1.5, bh + 0.12 + 1.6, 0.34], 0.04, 0.02, 4), limb([1.55, bh + 0.12 + 1.3, -0.18], [1.5, bh + 0.12 + 1.6, -0.34], 0.04, 0.02, 4));
  } else for (let i = 0; i < n; i++) {
    const f = human({ pose: i % 2 ? 'ease' : 'stand', drape: 'nude', h: h * (0.9 + rand() * 0.2), n: 7 }), g = placed(f, -W / 2 + 0.45 + i * 1.3, bh + 0.12, 0, 0);
    B.push(...[g.stone, g.metal].filter(Boolean));
  }
  bag.add('bronze', m(merge(B)));
  col.rect([x - W / 2 - 0.2, z - Dd / 2 - 0.2, x + W / 2 + 0.2, z + Dd / 2 + 0.2], y, y + bh + 0.1);
}

/** kore: { at, y, yaw, h, mat } — a maiden in the long chiton with her braids, the Siphnian treasury's porch figure, the polos on her head. */
function kore(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, h = el.h ?? 2.3;
  const f = human({ pose: 'stand', drape: 'peplos', h, n: 8, hair: 'rope', capital: true, arms: { l: [[-0.15, 0.62, 0.05], [-0.16, 0.6, 0.18]], r: [[0.16, 0.7, 0.05], [0.2, 0.74, 0.12]] } });
  const g = placed(f, x, y, z, el.yaw ?? 0);
  bag.add(el.mat ?? 'marble_smooth', g.stone);
  col.circle(x, z, 0.4, y, y + h + 0.5);
}

/** stall: { rect, y, front } — a votive seller's stall at the gate: a table under a cloth awning, tripods, vessels, wreaths and little bronzes laid out. */
function stall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(Math.round(x0 * 3 + z0)), L = x1 - x0, D = z1 - z0;
  const posts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([px, pz]) => box(px - 0.05, y, pz - 0.05, px + 0.05, y + 2.4, pz + 0.05));
  bag.add('timber', merge(posts));
  bag.add(['cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_indigo'][Math.floor(rand() * 4)] + '+wind', box(x0 - 0.2, y + 2.3, z0 - 0.2, x1 + 0.2, y + 2.38, z1 + 0.2));
  bag.add('timber', box(x0 + 0.2, y + 0.8, z0 + 0.2, x1 - 0.2, y + 0.88, z0 + 0.2 + D * 0.5));
  col.rect([x0 + 0.2, z0 + 0.2, x1 - 0.2, z0 + 0.2 + D * 0.5], y, y + 0.88);
  const ves = [], bz = [];
  for (let i = 0; i < Math.floor(L / 0.5); i++) { const px = x0 + 0.4 + i * 0.5, pz = z0 + 0.2 + D * 0.25, k = rand();
    if (k < 0.45) ves.push(lathe([[0.001, 0], [0.09, 0.02], [0.13, 0.12], [0.07, 0.22], [0.09, 0.26], [0.001, 0.25]], 8, null, px, y + 0.88, pz));
    else if (k < 0.75) bz.push(lathe([[0.001, 0], [0.12, 0.01], [0.13, 0.06], [0.001, 0.07]], 8, null, px, y + 0.88, pz), rod([px, y + 0.88, pz], [px, y + 1.15, pz], 0.012, 4));
    else ves.push(lathe([[0.15, 0], [0.17, 0.03], [0.14, 0.06], [0.001, 0.05]], 8, null, px, y + 0.88, pz)); }
  bag.add('pottery_dark', merge(ves)); if (bz.length) bag.add('bronze', merge(bz));
}

/** hearth: { c: [x, z], y, r } — the hearth of Apollo in the cella: a round kerb of stone round the bed of ash and embers, the fire of pine on it. */
function hearth(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, r = el.r ?? 1.0;
  bag.add('limestone', lathe([[r + 0.25, 0], [r + 0.25, 0.4], [r + 0.1, 0.46], [r - 0.15, 0.46], [r - 0.15, 0.34], [0.001, 0.3]], 20, null, cx, y, cz));
  bag.add('flame', lathe([[0.001, 0.46], [r * 0.5, 0.5], [r * 0.38, 0.9], [r * 0.2, 1.3], [0.001, 1.6]], 10, null, cx, y, cz));
  const logs = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; logs.push(rod([cx + Math.cos(a) * r * 0.6, y + 0.5, cz + Math.sin(a) * r * 0.6], [cx - Math.cos(a) * r * 0.1, y + 0.9, cz - Math.sin(a) * r * 0.1], 0.07, 5)); }
  bag.add('wood_dark', merge(logs));
  col.circle(cx, cz, r + 0.3, y, y + 0.5);
}

export const delphi = {
  ...greek,
  elements: Object.assign(Object.create(greek.elements), { ribbon, polygonal_wall: polygonalWall, adyton, hearth, serpent_column: serpentColumn, sphinx_column: sphinxColumn, ex_voto: exVoto, kore, stall, ...DRESS }),
  objects: greek.objects,
};
registerStyle('delphi', delphi);
