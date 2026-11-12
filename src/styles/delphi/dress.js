// The dressing of the sanctuary at eye level (docs/settlements/delphi.md §4.6): planting at true height (cypress, bay, olive, plane,
// holm oak), stone benches, the lustral basins at the temple's door, trophies of armour, tables of offerings, braziers, the paving
// laid in slabs of different stone, the ash and stains about the altar, and the furnishing of the treasuries' rooms.
// Elements of the style `delphi`; every one a few merged parts.
import { box, lathe, rod, place } from '../../core/geom.js';
import { merge } from '../greek/columns.js';
import { blob, limb } from '../greek/sculpture.js';
import { vase } from '../greek/vessels.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const aabb = (x, z, hw, hd, yaw) => { const c = Math.abs(Math.cos(yaw)), s = Math.abs(Math.sin(yaw)); return [x - hw * c - hd * s, z - hw * s - hd * c, x + hw * c + hd * s, z + hw * s + hd * c]; };

/** tree: { at, y, kind ('cypress' | 'bay' | 'olive' | 'plane' | 'holm'), h, seed } — a tree of the true height of its kind. */
function tree(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, kind = el.kind ?? 'olive', rand = rng(el.seed ?? Math.round(x * 13 + z * 7)), h = el.h ?? { cypress: 11, bay: 5, olive: 5.5, plane: 15, holm: 8 }[kind];
  const T = [], Lf = [];
  if (kind === 'cypress') {
    const r = h * 0.075;
    bag.add('bark_dark', lathe([[0.1, 0], [0.12, 1.2], [0.001, 1.6]], 6, null, x, y, z));
    bag.add('fresco_green', lathe([[0.001, 0.4], [r * 0.9, h * 0.12], [r * 1.25, h * 0.35], [r * 1.2, h * 0.6], [r * 0.8, h * 0.85], [r * 0.3, h * 0.97], [0.001, h]], 9, (t) => 1 + 0.09 * Math.sin(t * 5 + x), x, y, z));
    col.circle(x, z, 0.2, y, y + 2);
    return;
  }
  const tr = { bay: 0.09, olive: 0.2, plane: 0.5, holm: 0.3 }[kind], lean = (rand() - 0.5) * 0.7;
  const top = [x + lean, y + h * 0.5, z + (rand() - 0.5) * 0.7];
  T.push(limb([x, y, z], top, tr, tr * 0.75, 7));
  const nb = kind === 'bay' ? 4 : 3;
  for (let i = 0; i < nb; i++) { const a = rand() * 6.28 + i * 2; const e = [top[0] + Math.cos(a) * h * 0.22, y + h * (0.68 + rand() * 0.15), top[2] + Math.sin(a) * h * 0.22]; T.push(limb(top, e, tr * 0.5, tr * 0.25, 5)); Lf.push([e, h * (kind === 'plane' ? 0.26 : kind === 'olive' ? 0.2 : 0.22)]); }
  Lf.push([[top[0], y + h * 0.82, top[2]], h * (kind === 'plane' ? 0.3 : 0.25)]);
  bag.add(kind === 'plane' ? 'bark_plane' : kind === 'olive' ? 'bark_olive' : 'bark_dark', merge(T));
  bag.add('fresco_green', merge(Lf.map(([c, r]) => blob(c, r, kind === 'olive' ? [1.3, 0.7, 1.3] : [1.15, 0.8, 1.15], 8))));
  col.circle(x, z, tr + 0.1, y, y + 3);
}

/** stone_bench: { at, y, yaw, len } — a slab on two stone cheeks. */
function stoneBench(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, L = el.len ?? 2.2;
  bag.add(el.mat ?? 'limestone', place(merge([box(-L / 2, 0.38, -0.25, L / 2, 0.47, 0.25), box(-L / 2 + 0.18, 0, -0.22, -L / 2 + 0.42, 0.38, 0.22), box(L / 2 - 0.42, 0, -0.22, L / 2 - 0.18, 0.38, 0.22)]), x, y, z, yaw));
  col.rect(aabb(x, z, L / 2, 0.25, yaw), y, y + 0.47);
}

/** basin: { at, y } — a perirrhanterion: the lustral basin of marble on its stem, the water in it. */
function basin(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('marble', lathe([[0.32, 0], [0.3, 0.12], [0.14, 0.22], [0.13, 0.85], [0.26, 0.98], [0.5, 1.05], [0.54, 1.14], [0.48, 1.14], [0.44, 1.08], [0.001, 1.08]], 16, null, x, y, z));
  bag.add('water', lathe([[0.001, 1.1], [0.45, 1.1]], 14, null, x, y, z));
  col.circle(x, z, 0.5, y, y + 1.15);
}

/** tropaion: { at, y, yaw, h } — a trophy of armour on its post: the cuirass, helmet, shield and greaves hung on the cross-bar, on a heap of stones. */
function tropaion(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, h = el.h ?? 2.3;
  bag.add('limestone', place(merge([box(-0.7, 0, -0.5, 0.7, 0.35, 0.5)]), x, y, z, yaw));
  bag.add('wood_dark', place(merge([rod([0, 0.35, 0], [0, h, 0], 0.05, 5), rod([-0.5, h - 0.45, 0], [0.5, h - 0.45, 0], 0.035, 5)]), x, y, z, yaw));
  bag.add('bronze', place(merge([lathe([[0.2, 0], [0.24, 0.3], [0.2, 0.6], [0.15, 0.7], [0.001, 0.7]], 10, null, 0, h - 1.15, 0.0), blob([0, h + 0.05, 0.02], 0.15, [0.95, 1.1, 1.1], 8), lathe([[0.001, 0], [0.34, 0], [0.33, 0.04], [0.001, 0.12]], 14).rotateX(Math.PI / 2).translate(0.38, h - 0.65, 0.1), rod([-0.5, h - 0.45, 0.02], [-0.5, h - 1.0, 0.02], 0.04, 5)]), x, y, z, yaw));
  bag.add('cloth_red', place(box(-0.2, h - 0.5, 0.0, 0.2, h - 0.38, 0.12), x, y, z, yaw));
  col.circle(x, z, 0.65, y, y + h);
}

/** offering_table: { at, y, yaw, seed } — a table of the sellers' or the pilgrims' gifts: cakes on dishes, a wreath, flasks, a lamp. */
function offeringTable(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 3);
  bag.add('wood_dark', place(merge([box(-0.7, 0.8, -0.35, 0.7, 0.86, 0.35), ...[[-0.62, -0.28], [0.56, -0.28], [-0.62, 0.22], [0.56, 0.22]].map(([a, b]) => box(a, 0, b, a + 0.06, 0.8, b + 0.06))]), x, y, z, yaw));
  bag.add('linen', place(box(-0.72, 0.86, -0.37, 0.72, 0.875, 0.37), x, y, z, yaw));
  const K = [], W = [];
  for (let i = 0; i < 6; i++) { const u = -0.55 + i * 0.22, v = (rand() - 0.5) * 0.3; K.push(lathe([[0.001, 0], [0.1, 0.005], [0.09, 0.03], [0.001, 0.05]], 8, null, u, 0.875, v)); if (rand() < 0.6) W.push(lathe([[0.001, 0.05], [0.07, 0.05], [0.05, 0.1], [0.001, 0.11]], 8, null, u, 0.875, v)); }
  bag.add('terracotta', place(merge(K), x, y, z, yaw)); if (W.length) bag.add('cloth_ochre', place(merge(W), x, y, z, yaw));
  const R = [], Wr = []; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; Wr.push(blob([0.4 + Math.cos(a) * 0.14, 0.9, 0.0 + Math.sin(a) * 0.14], 0.05, [1, 0.6, 1], 5)); }
  bag.add('fresco_green', place(merge(Wr), x, y, z, yaw)); void R;
  const f = (n, u) => vase(bag, n, 0, 0, 0, {}); void f;
  col.rect(aabb(x, z, 0.72, 0.37, yaw), y, y + 0.9);
}

/** brazier: { at, y } — a bronze bowl on a tripod with the coals glowing. */
function brazier(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, L = [];
  for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28; L.push(rod([x + Math.cos(a) * 0.42, y, z + Math.sin(a) * 0.42], [x + Math.cos(a) * 0.2, y + 0.85, z + Math.sin(a) * 0.2], 0.025, 5)); }
  L.push(lathe([[0.001, 0], [0.22, 0.03], [0.34, 0.2], [0.36, 0.28], [0.3, 0.26], [0.001, 0.2]], 12, null, x, y + 0.82, z));
  bag.add('bronze', merge(L)); bag.add('flame', lathe([[0.001, 0.2], [0.26, 0.2], [0.1, 0.36], [0.001, 0.42]], 8, null, x, y + 0.82, z));
  col.circle(x, z, 0.4, y, y + 1.1);
}

/** flags: { rect, y, seed, skip: (x, z) → bool } — paving laid in slabs, each of its own stone and size, in rows. */
function flags(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed ?? 1), M = { limestone: [], flagstone: [], marble: [], limestone_yellow: [] };
  const names = ['limestone', 'flagstone', 'flagstone', 'marble', 'limestone_yellow', 'limestone'];
  for (let z = z0; z < z1;) {
    const d = 1.1 + rand() * 0.9; let x = x0 - rand() * 1.5;
    while (x < x1) {
      const w = 1.2 + rand() * 1.6, a = Math.max(x0, x + 0.02), b = Math.min(x1, x + w - 0.02), zz = Math.min(z1, z + d - 0.02);
      if (b - a > 0.2 && !(el.skip && el.skip((a + b) / 2, (z + zz) / 2))) M[names[Math.floor(rand() * names.length)]].push(box(a, y, z + 0.02, b, y + 0.012 + rand() * 0.012, zz));
      x += w;
    }
    z += d;
  }
  for (const k in M) if (M[k].length) bag.add(k, merge(M[k]));
}

/** ash: { c, r, y, seed } — ash and soot and the dark of the offerings spread about an altar. */
function ash(el, { bag }) {
  const [x, z] = el.c, rand = rng(el.seed ?? 5), A = [], S = [];
  for (let i = 0; i < 9; i++) { const a = rand() * 6.28, d = rand() * el.r, r = el.r * (0.18 + rand() * 0.22); (i % 3 ? A : S).push(lathe([[r, 0], [r * 0.6, 0.012], [0.001, 0.014]], 8, null, x + Math.cos(a) * d, el.y + 0.012, z + Math.sin(a) * d)); }
  bag.add('plaster_streak', merge(A)); bag.add('granite_black', merge(S));
}

/**
 * treasure_room: { rect (the room), y, seed, kind } — what a city kept in its treasury: shelves of gilded and bronze vessels along the
 * back and side walls, shields hung high, a chest or two with iron bands, a table with phialai and a tripod on a base; the door in the south wall.
 */
function treasureRoom(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed ?? 5), cx = (x0 + x1) / 2;
  const B = (a, b, c, d, e, f, m, solid = false) => { bag.add(m, box(a, y + e, b, c, y + f, d)); if (solid) col.rect([a, b, c, d], y + e, y + f); };
  for (const h of [0.55, 1.15, 1.75]) { B(x0 + 0.05, z0 + 0.04, x1 - 0.05, z0 + 0.46, h - 0.04, h, 'timber'); }
  for (const u of [x0 + 0.05, x1 - 0.17]) B(u, z0 + 0.04, u + 0.12, z0 + 0.46, 0, 1.78, 'timber', true);
  const V = { gilt_bronze: [], bronze: [], terracotta: [] };
  for (const h of [0.55, 1.15, 1.75]) for (let u = x0 + 0.4; u < x1 - 0.35; u += 0.34) {
    const r = rand(), p = [u, y + h, z0 + 0.25];
    if (r < 0.28) V.gilt_bronze.push(lathe([[0.001, 0], [0.09, 0.01], [0.15, 0.08], [0.17, 0.13], [0.12, 0.14], [0.001, 0.1]], 8, null, ...p));
    else if (r < 0.6) V.bronze.push(lathe([[0.001, 0], [0.07, 0.01], [0.12, 0.1], [0.1, 0.22], [0.06, 0.28], [0.08, 0.3], [0.001, 0.3]], 8, null, ...p));
    else if (r < 0.85) V.terracotta.push(lathe([[0.001, 0], [0.06, 0], [0.1, 0.1], [0.07, 0.2], [0.001, 0.2]], 8, null, ...p));
  }
  for (const k in V) if (V[k].length) bag.add(k, merge(V[k]));
  // the side walls: a row of shields hung high, a spear-rack, and a chest below
  const sh = [];
  for (const sd of [-1, 1]) for (let z = z0 + 0.9; z < z1 - 1.0; z += 0.9) { const xw = sd < 0 ? x0 + 0.04 : x1 - 0.04; sh.push(lathe([[0.001, 0], [0.36, 0], [0.35, 0.03], [0.1, 0.06], [0.001, 0.06]], 14).rotateZ(sd > 0 ? Math.PI / 2 : -Math.PI / 2).translate(xw, y + 2.4, z)); }
  bag.add('bronze', merge(sh));
  for (const [sd, z] of [[-1, z1 - 1.0], [1, z0 + 1.4]]) { const a = sd < 0 ? x0 + 0.1 : x1 - 0.65; B(a, z, a + 0.55, z + 0.4, 0, 0.55, 'wood_dark', true); B(a - 0.01, z, a + 0.56, z + 0.04, 0.2, 0.26, 'iron'); B(a - 0.01, z + 0.36, a + 0.56, z + 0.4, 0.2, 0.26, 'iron'); B(a + 0.02, z + 0.02, a + 0.53, z + 0.38, 0.55, 0.6, 'wood_dark'); }
  // the table and the tripod
  B(cx - 0.55, z0 + 1.5, cx + 0.55, z0 + 2.1, 0.74, 0.8, 'wood_dark'); for (const [a, b] of [[-0.5, 1.55], [0.42, 1.55], [-0.5, 2.0], [0.42, 2.0]]) B(cx + a, z0 + b, cx + a + 0.08, z0 + b + 0.08, 0, 0.74, 'wood_dark');
  col.rect([cx - 0.55, z0 + 1.5, cx + 0.55, z0 + 2.1], y, y + 0.8);
  const ph = []; for (let i = 0; i < 4; i++) ph.push(lathe([[0.001, 0], [0.09, 0.005], [0.08, 0.02], [0.001, 0.02]], 8, null, cx - 0.4 + i * 0.27, y + 0.8, z0 + 1.8));
  bag.add('gilt_bronze', merge(ph));
}

export const DRESS = { tree, stone_bench: stoneBench, basin, tropaion, offering_table: offeringTable, brazier, flags, ash, treasure_room: treasureRoom };
