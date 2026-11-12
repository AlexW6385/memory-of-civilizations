// The Citadel and the public buildings (docs/settlements/mohenjo-daro.md §2, §4): the mound with its baked-brick facing, buttresses, towers and
// parapet; the Great Bath with its court, pool, stairs, gallery of stepped piers, doors and the row of cells with the well; the granary on its
// 27 brick blocks; the Pillared Hall; the College of Priests; the town wall and its gate tower. Coordinates are the settlement's (absolute).
import { box, lathe, frustum } from '../../core/geom.js';
import { Fr, rng, wellAt } from './kit.js';
import { dressWall, furnishRoom } from './dress.js';

const jar = (bag, mat, x, y, z, s = 1) => bag.add(mat, lathe([[0.07 * s, 0], [0.2 * s, 0.12 * s], [0.24 * s, 0.3 * s], [0.19 * s, 0.5 * s], [0.1 * s, 0.6 * s], [0.12 * s, 0.66 * s], [0.001, 0.66 * s]], 8, null, x, y, z));
/** The weathering of the four outer faces of a rectangle of walls from y: `gaps` are the doors' spans per side ('n' | 's' | 'w' | 'e') along each face. */
function outer(ctx, rect, y, H, lowH, seed, gaps = {}, sides = 'nswe', plain = false) {
  const [x0, z0, x1, z1] = rect, rand = rng(seed), L = [
    ['n', [x0, z0], [1, 0], [0, 1], x1 - x0, x0], ['s', [x1, z1], [-1, 0], [0, -1], x1 - x0, x1],
    ['w', [x0, z1], [0, -1], [1, 0], z1 - z0, z1], ['e', [x1, z0], [0, 1], [-1, 0], z1 - z0, z0],
  ];
  for (const [k, o, U, V, len, org] of L) {
    if (!sides.includes(k)) continue;
    const F = new Fr(ctx, o, U, V, y), gs = (gaps[k] ?? []).map(([a, b]) => { const s0 = Math.abs(a - org), s1 = Math.abs(b - org); return [Math.min(s0, s1) - 0.3, Math.max(s0, s1) + 0.3]; });
    dressWall(F, rand, 'front', len, H, lowH, { gaps: gs, life: true, plain });
  }
}
/** A low heap of fallen brick at the foot of a wall: a short wedge (the mound's foot, the platforms). */
function heap(bag, x, z, along, outx, outz, len) {
  const w = 1.5 + Math.abs((x * 7 + z * 3) % 1.2), h = 0.55 + Math.abs((x + z) % 0.5), hx = along ? len / 2 : w / 2, hz = along ? w / 2 : len / 2;
  bag.add('mudbrick', frustum([x - hx + outx * w / 2, z - hz + outz * w / 2, x + hx + outx * w / 2, z + hz + outz * w / 2], -0.3, h, along ? len * 0.2 : w * 0.4, along ? len * 0.2 : w * 0.4, along ? w * 0.4 : len * 0.2, along ? w * 0.4 : len * 0.2, { noBottom: true }));
}
/** A wall along x or z (rect), openings: [{ at (centre along), w, h }]; full height y0..y1, `mat` below `split` and `mat2` above. */
function wallRect(ctx, rect, y0, y1, openings = [], mat = 'brick', lintel = true) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = rect, alongX = x1 - x0 >= z1 - z0, a = alongX ? x0 : z0, b = alongX ? x1 : z1;
  const piece = (s0, s1, ya, yb, m = mat) => {
    if (s1 - s0 < 0.02 || yb - ya < 0.02) return;
    const r = alongX ? [s0, z0, s1, z1] : [x0, s0, x1, s1];
    bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); col.rect(r, ya, yb);
  };
  let s = a;
  for (const o of [...openings].sort((p, q) => p.at - q.at)) {
    const lo = o.at - o.w / 2, hi = o.at + o.w / 2;
    piece(s, lo, y0, y1); piece(lo, hi, y0 + o.h, y1);
    if (lintel) { const r = alongX ? [lo - 0.08, z0 - 0.04, hi + 0.08, z1 + 0.04] : [x0 - 0.04, lo - 0.08, x1 + 0.04, hi + 0.08]; bag.add('timber', box(r[0], y0 + o.h - 0.14, r[1], r[2], y0 + o.h, r[3])); }
    s = hi;
  }
  piece(s, b, y0, y1);
}

/** indus_mound: { rect, y, batter: [−x, +x, −z, +z], gaps: [rect] (the stairs' and the ramp's feet, kept free of the buttresses), hole: [rect] (open in the top: the Great Bath's pool), seed } */
export function mound(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, b = el.batter ?? [0, 0, 0, 0], gaps = el.gaps ?? [];
  bag.add('mudbrick', frustum(el.rect, -0.3, y, b[0], b[1], b[2], b[3], { noBottom: true, noTop: true }));
  col.rect(el.rect, -0.3, y);
  const top = [x0 + b[0], z0 + b[2], x1 - b[1], z1 - b[3]];
  // the top's skin, open over the pool (a whole slab hid the water under a floor of brick)
  const h = el.hole;
  const skin = h ? [[top[0], top[1], top[2], h[1]], [top[0], h[3], top[2], top[3]], [top[0], h[1], h[0], h[3]], [h[2], h[1], top[2], h[3]]] : [top];
  for (const r of skin) if (r[2] - r[0] > 0.01 && r[3] - r[1] > 0.01) bag.add('brick_buff', box(r[0], y - 0.06, r[1], r[2], y, r[3]));
  col.floor(top, y);
  const inGap = (px, pz, m) => gaps.some((g) => px > g[0] - m && px < g[2] + m && pz > g[1] - m && pz < g[3] + m);
  // the baked-brick facing of the foot, in courses, and the buttresses along each face
  const faces = [['n', z0, x0, x1], ['s', z1, x0, x1], ['w', x0, z0, z1], ['e', x1, z0, z1]];
  for (const [f, fixed, a0, a1] of faces) {
    const alongX = f === 'n' || f === 's', sg = f === 'n' || f === 'w' ? -1 : 1;
    for (let s = a0; s < a1; s += 12) {
      const e = Math.min(a1, s + 12), mid = (s + e) / 2;
      const px = alongX ? mid : fixed, pz = alongX ? fixed : mid;
      if (inGap(px, pz, 3)) continue;
      const r = alongX ? [s, sg < 0 ? fixed - 0.35 : fixed, e, sg < 0 ? fixed : fixed + 0.35] : [sg < 0 ? fixed - 0.35 : fixed, s, sg < 0 ? fixed : fixed + 0.35, e];
      bag.add('brick', box(r[0], -0.3, r[1], r[2], y * 0.5, r[3]));
      col.rect(r, -0.3, y * 0.5);
      // the buttress at the middle of each bay
      const bw = 1.3, q = alongX ? [mid - bw, sg < 0 ? fixed - 1.1 : fixed, mid + bw, sg < 0 ? fixed : fixed + 1.1] : [sg < 0 ? fixed - 1.1 : fixed, mid - bw, sg < 0 ? fixed : fixed + 1.1, mid + bw];
      bag.add('brick', box(q[0], -0.3, q[1], q[2], y - 0.5, q[3])); col.rect(q, -0.3, y - 0.5);
      bag.add('mudbrick', box(q[0] - 0.05, y - 0.5, q[1] - 0.05, q[2] + 0.05, y - 0.3, q[3] + 0.05), false);
      // the brick that has fallen from the platform lies in heaps between the buttresses
      for (const off of [3.4, 8.8]) {
        const sm = s + off, hx = alongX ? sm : fixed + sg * 0.35, hz = alongX ? fixed + sg * 0.35 : sm;
        if (((Math.floor(s / 12) + (off > 5 ? 1 : 0)) % 3) !== 0 && !inGap(hx, hz, 3)) heap(bag, hx, hz, alongX, alongX ? 0 : sg, alongX ? sg : 0, 4 + (Math.floor(s + off) % 3));
      }
    }
  }
  // the parapet along the edge of the top, gaps at the stair and the ramp, the corner towers
  const m = 0.5, th = 0.7, ph = 1.1;
  const par = (r) => { bag.add('mudbrick', box(r[0], y, r[1], r[2], y + ph, r[3])); col.rect(r, y, y + ph); bag.add('mud_plaster', box(r[0] - 0.05, y + ph, r[1] - 0.05, r[2] + 0.05, y + ph + 0.08, r[3] + 0.05), false); };
  const along = (alongX, fixed, a, b2, side) => {
    let s = a;
    const cuts = gaps.filter((g) => (alongX ? Math.abs(g[side] - fixed) < 4 || Math.abs(g[side + 2] - fixed) < 4 : Math.abs(g[side] - fixed) < 4 || Math.abs(g[side + 2] - fixed) < 4)).map((g) => (alongX ? [g[0], g[2]] : [g[1], g[3]])).sort((p, q) => p[0] - q[0]);
    for (const [c0, c1] of [...cuts, [b2, b2]]) { if (c0 - s > 0.3) par(alongX ? [s, fixed, c0, fixed + th] : [fixed, s, fixed + th, c0]); s = Math.max(s, c1); }
  };
  along(true, top[1] + m, top[0] + 4, top[2] - 4, 1); along(true, top[3] - m - th, top[0] + 4, top[2] - 4, 1);
  along(false, top[0] + m, top[1] + 4, top[3] - 4, 0); along(false, top[2] - m - th, top[1] + 4, top[3] - 4, 0);
  for (const [cx, cz] of [[top[0] + 3, top[1] + 3], [top[2] - 3, top[1] + 3], [top[0] + 3, top[3] - 3], [top[2] - 3, top[3] - 3]]) tower({ c: [cx, cz], a: 2.6, y, h: 4.6 }, ctx);
}

/** indus_tower: { c, a, y, h } — a square tower of baked brick under mud brick with a crenellated flat top. */
export function tower(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.c, a = el.a, y = el.y ?? 0, h = el.h;
  bag.add('brick', box(x - a, y, z - a, x + a, y + h * 0.6, z + a)); bag.add('mudbrick', box(x - a + 0.1, y + h * 0.6, z - a + 0.1, x + a - 0.1, y + h, z + a - 0.1));
  col.rect([x - a, z - a, x + a, z + a], y, y + h);
  bag.add('brick', box(x - a - 0.15, y + h, z - a - 0.15, x + a + 0.15, y + h + 0.25, z + a + 0.15));
  for (const s of [-1, 1]) for (let k = -1; k <= 1; k += 2) { bag.add('mudbrick', box(x + k * a * 0.55 - 0.3, y + h + 0.25, z + s * a - 0.3, x + k * a * 0.55 + 0.3, y + h + 0.95, z + s * a + 0.3)); bag.add('mudbrick', box(x + s * a - 0.3, y + h + 0.25, z + k * a * 0.55 - 0.3, x + s * a + 0.3, y + h + 0.95, z + k * a * 0.55 + 0.3)); }
}

/** indus_wall: { a, b, th, h, y, gaps: [{ at, w }] } — the town wall: baked brick under mud brick. */
export function wall(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, alongX = Math.abs(bx - ax) >= Math.abs(bz - az), th = el.th, h = el.h, y = el.y ?? 0;
  const L = alongX ? bx - ax : bz - az, gaps = (el.gaps ?? []).map((g) => [g.at - g.w / 2, g.at + g.w / 2]).sort((p, q) => p[0] - q[0]);
  const piece = (s0, s1) => {
    if (s1 - s0 < 0.05) return;
    const r = alongX ? [ax + s0, az - th / 2, ax + s1, az + th / 2] : [ax - th / 2, az + s0, ax + th / 2, az + s1];
    bag.add('brick', box(r[0], y - 0.3, r[1], r[2], y + h * 0.55, r[3])); bag.add('mudbrick', box(r[0] + 0.12, y + h * 0.55, r[1] + 0.12, r[2] - 0.12, y + h, r[3] - 0.12));
    bag.add('brick', box(r[0] - 0.06, y + h, r[1] - 0.06, r[2] + 0.06, y + h + 0.22, r[3] + 0.06)); col.rect(r, y - 0.3, y + h + 0.22);
  };
  let s = 0; for (const [g0, g1] of gaps) { piece(s, g0); s = g1; } piece(s, L);
  if (alongX) outer(ctx, [ax, az - th / 2, bx, az + th / 2], y, h, h * 0.55, 51, { n: gaps.map(([g0, g1]) => [ax + g0, ax + g1]), s: gaps.map(([g0, g1]) => [ax + g0, ax + g1]) }, 'ns', true);
}

/** indus_bath: { c? } — the Great Bath: at the layout's BATH (passed in): { court, pool, depth, outer, gal, wall, h }, y = the platform. */
export function bath(el, ctx) {
  const { bag, col, lights } = ctx, B = el.B, y = el.y, [cx0, cz0, cx1, cz1] = B.court, [px0, pz0, px1, pz1] = B.pool, h = B.h, W = new Fr(ctx, [0, 0], [1, 0], [0, 1], 0);
  const yb = y - B.depth, [ox0, oz0, ox1, oz1] = B.outer, wt = B.wall;
  // the paving of the court round the pool, and of the gallery
  for (const r of [[cx0, cz0, cx1, pz0], [cx0, pz1, cx1, cz1], [cx0, pz0, px0, pz1], [px1, pz0, cx1, pz1]]) { bag.add('brick_buff', box(r[0], y - 0.4, r[1], r[2], y, r[3])); col.floor(r, y); }
  for (const r of [[ox0 + wt, oz0 + wt, ox1 - 7.2 - 0.45, cz0], [ox0 + wt, cz1, ox1 - 7.2 - 0.45, oz1 - wt], [cx1, cz0, ox1 - 7.2 - 0.45, cz1]]) { bag.add('brick_buff', box(r[0], y - 0.4, r[1], r[2], y, r[3])); col.floor(r, y); }
  bag.add('brick_buff', box(ox0 + wt, y - 0.4, cz0, cx0, y, cz1)); col.floor([ox0 + wt, cz0, cx0, cz1], y);
  // the pool: the brick bed, the bitumen skin, the lining of the long sides, the coping, the water
  bag.add('brick', box(px0, yb - 0.4, pz0, px1, yb, pz1)); bag.add('bitumen', box(px0, yb, pz0, px1, yb + 0.05, pz1)); col.floor(B.pool, yb);
  bag.add('bitumen', box(px0, yb, pz0, px0 + 0.06, y - 0.05, pz1)); bag.add('bitumen', box(px1 - 0.06, yb, pz0, px1, y - 0.05, pz1));
  bag.add('brick', box(px0 - 0.35, y, pz0 - 0.35, px1 + 0.35, y + 0.14, pz0), false); bag.add('brick', box(px0 - 0.35, y, pz1, px1 + 0.35, y + 0.14, pz1 + 0.35), false);
  bag.add('brick', box(px0 - 0.35, y, pz0, px0, y + 0.14, pz1), false); bag.add('brick', box(px1, y, pz0, px1 + 0.35, y + 0.14, pz1), false);
  // the water stands a metre below the coping (at a grazing look it only mirrors the haze, so the dark bitumen lining must stand above it): a slab, as the Roman baths' pools
  const WL = y - 1.05;
  bag.add('water', box(px0 + 0.06, WL - 0.2, pz0, px1 - 0.06, WL, pz1), false);
  // the stairs at both short ends, 3.4 m long, down to the bed
  // (the steps wet from the water up 0.5 m are dark, the dried ones above are brick)
  const bstairs = (z0, z1, dv) => {
    const n = Math.round(B.depth / 0.2), vs = z1 - z0;
    for (let i = 0; i < n; i++) {
      const top = yb + (B.depth * (i + 1)) / n, a = dv > 0 ? z0 + (vs * i) / n : z0, b = dv > 0 ? z1 : z1 - (vs * i) / n;
      bag.add(top < WL + 0.02 ? 'bitumen' : top < WL + 0.55 ? 'pottery_dark' : 'brick', box(px0 + 0.06, yb + (B.depth * i) / n - 0.05 * (i === 0), a, px1 - 0.06, top, b));
    }
    col.ramp([px0 + 0.06, z0, px1 - 0.06, z1], yb, y, dv > 0 ? 's' : 'n');
  };
  bstairs(pz0, pz0 + 3.4, -1);
  bstairs(pz1 - 3.4, pz1, 1);
  // the lining's wet band above the water (darker, black-green) and the ledge's dark lip
  bag.add('pottery_dark', box(px0 + 0.04, WL, pz0 + 3.4, px0 + 0.1, WL + 0.45, pz1 - 3.4), false); bag.add('pottery_dark', box(px1 - 0.1, WL, pz0 + 3.4, px1 - 0.04, WL + 0.45, pz1 - 3.4), false);
  // the outlet at the south-west corner, the drain across the court under its cover to the west wall and the corbelled mouth outside
  bag.add('bitumen', box(ox0 + wt, y + 0.004, pz1 - 0.55, px0, y + 0.02, pz1 - 0.15), false);
  for (let k = 0; k < 3; k++) { const w = 0.9 - k * 0.25; bag.add('brick', box(ox0 - 0.5 - 0.0, y + 0.2 + k * 0.28, pz1 - 0.35 - w / 2 - 0.1, ox0 + wt * 0.5, y + 0.48 + k * 0.28, pz1 - 0.35 + w / 2 + 0.1), false); }
  bag.add('bitumen', box(ox0 - 0.45, y + 0.2, pz1 - 0.6, ox0, y + 0.75, pz1 - 0.1), false);
  // the gallery: stepped piers (a cross in plan) round the court on the north, east and south; beams and the flat roof
  const GH = 3.3, pier = (x, z) => { bag.add('brick', box(x - 0.5, y, z - 0.3, x + 0.5, y + GH, z + 0.3)); bag.add('brick', box(x - 0.3, y, z - 0.5, x + 0.3, y + GH, z + 0.5)); bag.add('brick', box(x - 0.55, y, z - 0.55, x + 0.55, y + 0.3, z + 0.55)); col.rect([x - 0.55, z - 0.55, x + 0.55, z + 0.55], y, y + GH); };
  const xs = Array.from({ length: 9 }, (_, i) => cx0 + 0.55 + (cx1 - cx0 - 1.1) * i / 8), zs = Array.from({ length: 10 }, (_, i) => cz0 - 0.55 + (cz1 - cz0 + 1.1) * i / 9);
  for (const x of xs) { pier(x, cz0 - 0.55); pier(x, cz1 + 0.55); }
  for (const z of zs.slice(1, -1)) pier(cx1 + 0.55, z);
  const ex = ox1 - 7.2 - 0.45;                                     // the gallery's east wall (the cells' west wall)
  const roof = (r, yy) => { bag.add('mud_plaster', box(r[0], yy, r[1], r[2], yy + 0.4, r[3])); };
  roof([cx0 - 0.5, oz0 + wt, ex, cz0 + 0.05], y + GH); roof([cx0 - 0.5, cz1 - 0.05, ex, oz1 - wt], y + GH); roof([cx1 - 0.05, cz0, ex, cz1], y + GH);
  for (const x of xs) { bag.add('timber', box(x - 0.15, y + GH - 0.3, oz0 + wt, x + 0.15, y + GH - 0.03, cz0 + 0.1), false); bag.add('timber', box(x - 0.15, y + GH - 0.3, cz1 - 0.1, x + 0.15, y + GH - 0.03, oz1 - wt), false); }
  // the walls: north (a door), south (two great doors), west (a door), east (the cells' doorways); the cells and the well
  wallRect(ctx, [ox0, oz0, ox1, oz0 + wt], y, y + h, [{ at: (xs[3] + xs[4]) / 2, w: 2.4, h: 2.7 }]);
  wallRect(ctx, [ox0, oz1 - wt, ox1, oz1], y, y + h, [{ at: (xs[1] + xs[2]) / 2, w: 2.4, h: 2.9 }, { at: (xs[6] + xs[7]) / 2, w: 2.4, h: 2.9 }]);
  wallRect(ctx, [ox0, oz0 + wt, ox0 + wt, oz1 - wt], y, y + h, [{ at: (cz0 + cz1) / 2, w: 2.0, h: 2.6 }]);
  wallRect(ctx, [ox1 - wt * 0.4, oz0 + wt, ox1, oz1 - wt], y, y + h);
  const cl = oz0 + wt, ch = oz1 - wt, n = 8, cw = (ch - cl) / n, doors = Array.from({ length: n }, (_, i) => ({ at: cl + cw * (i + 0.5), w: 1.0, h: 2.0 }));
  wallRect(ctx, [ex, oz0 + wt, ex + wt * 0.5, oz1 - wt], y, y + h, doors);
  for (let i = 1; i < n; i++) { const z = cl + cw * i; bag.add('brick', box(ex + 0.6, y, z - 0.2, ox1 - 0.5, y + h, z + 0.2)); col.rect([ex + 0.6, z - 0.2, ox1 - 0.5, z + 0.2], y, y + h); }
  bag.add('brick_buff', box(ex + 0.6, y - 0.4, cl, ox1, y, ch)); col.floor([ex + 0.6, cl, ox1, ch], y);
  roof([ex, oz0 + wt, ox1, oz1 - wt], y + h - 0.4); col.floor([ex, oz0 + wt, ox1, oz1 - wt], y + h);
  wellAt(bag, col, (ex + ox1) / 2 + 0.3, y, cl + cw * 2.5, 0.55);
  { const FY = new Fr(ctx, [0, 0], [1, 0], [0, 1], y), rr = rng(5), use = ['cell', 'bath', 'store', 'cell', 'bath', 'cell', 'store', 'bath'];
    for (let i = 0; i < n; i++) if (i !== 2) furnishRoom(FY, [ex + 0.6 + 0.25, cl + cw * i + 0.25, ox1 - 0.5 - 0.1, cl + cw * (i + 1) - 0.25], 'u0', use[i], rr, lights, false); }
  outer(ctx, B.outer, y, h, h * 0.45, 41, { s: [[xs[1] - 1.5, xs[2] + 0.9], [xs[6] - 1.5, xs[7] + 0.9]], n: [[xs[3] - 1.0, xs[4] + 0.7]], w: [[(cz0 + cz1) / 2 - 1, (cz0 + cz1) / 2 + 1]] });
  lights.push({ at: [ex + 3.2, y + 2.2, cl + cw * 2.5], color: '#ffc98a', intensity: 3, distance: 8 }, { at: [(cx0 + cx1) / 2, y + 2.6, cz0 - 1.5], color: '#ffd9a0', intensity: 2.5, distance: 10 }, { at: [(cx0 + cx1) / 2, y + 2.6, cz1 + 1.5], color: '#ffd9a0', intensity: 2.5, distance: 10 });
  // wet brick round the pool's coping; wooden screens in alternate bays of the gallery (the stepped piers held them), the open bays at the doors; benches and jars along the gallery's back
  for (const r of [[px0 - 0.9, pz0 - 0.9, px1 + 0.9, pz0 - 0.35], [px0 - 0.9, pz1 + 0.35, px1 + 0.9, pz1 + 0.9], [px0 - 0.9, pz0 - 0.35, px0 - 0.35, pz1 + 0.35], [px1 + 0.35, pz0 - 0.35, px1 + 0.9, pz1 + 0.35]]) bag.add('brick', box(r[0], y + 0.002, r[1], r[2], y + 0.016, r[3]), false);
  const screen = (a0, a1, f0, f1, alongX) => {
    const R = (p0, q0, p1, q1) => (alongX ? [p0, q0, p1, q1] : [q0, p0, q1, p1]);
    for (const [lo, hi, m] of [[0.2, 0.34, 'timber'], [1.12, 1.26, 'timber']]) bag.add(m, box(...[R(a0, f0, a1, f1)[0], y + lo, R(a0, f0, a1, f1)[1], R(a0, f0, a1, f1)[2], y + hi, R(a0, f0, a1, f1)[3]]));
    for (let a = a0 + 0.12; a < a1 - 0.05; a += 0.23) { const r = R(a, f0 + 0.03, a + 0.06, f1 - 0.03); bag.add('timber', box(r[0], y + 0.34, r[1], r[2], y + 1.12, r[3]), false); }
    col.rect(R(a0, f0, a1, f1), y, y + 1.26);
  };
  for (let i = 0; i < 8; i++) {
    if (i !== 1 && i !== 6) screen(xs[i] + 0.7, xs[i + 1] - 0.7, cz1 + 0.5, cz1 + 0.6, true);
    if (i !== 3) screen(xs[i] + 0.7, xs[i + 1] - 0.7, cz0 - 0.6, cz0 - 0.5, true);
  }
  for (let k = 1; k < 8; k += 2) screen(zs[k] + 0.7, zs[k + 1] - 0.7, cx1 + 0.5, cx1 + 0.6, false);
  for (const [zA, zB, dzs] of [[oz1 - wt - 0.6, oz1 - wt, [(xs[1] + xs[2]) / 2, (xs[6] + xs[7]) / 2]], [oz0 + wt, oz0 + wt + 0.6, [(xs[3] + xs[4]) / 2]]]) {
    let x = ox0 + wt + 0.5;
    while (x < ex - 3) { const e = x + 2.6; if (!dzs.some((d) => d > x - 1.7 && d < e + 1.7)) { bag.add('mudbrick', box(x, y, zA, e, y + 0.44, zB)); col.rect([x, zA, e, zB], y, y + 0.44); bag.add('reed_mat', box(x + 0.15, y + 0.44, zA + 0.05, e - 0.15, y + 0.47, zB - 0.05), false); jar(bag, 'terracotta', x + 1.3, y, zA > oz0 + wt + 1 ? zA - 0.5 : zB + 0.5, 1.3); } x = e + 1.2; }
  }
  // the dressing-room benches and jars along the court's west wall
  for (let z = cz0 + 3; z < cz1 - 2; z += 4.5) { bag.add('mudbrick', box(ox0 + wt, y, z - 0.5, ox0 + wt + 0.6, y + 0.45, z + 0.5)); col.rect([ox0 + wt, z - 0.5, ox0 + wt + 0.6, z + 0.5], y, y + 0.45); }
}

/** indus_granary: { rect, y } — the 27 blocks (3 rows × 9) of baked brick with air channels, the timber deck, the hall above, the loading verandah on the south with its ramp. */
export function granary(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, F = new Fr(ctx, [0, 0], [1, 0], [0, 1], 0), rand = rng(7);
  const m = 1.0, ch = 1.0, nx = 9, nz = 3, bw = (x1 - x0 - 2 * m - (nx - 1) * ch) / nx, bd = (z1 - z0 - 2 * m - (nz - 1) * ch) / nz, PH = 1.6;
  bag.add('mudbrick', box(x0, y - 0.3, z0, x1, y + 0.05, z1));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const r = [x0 + m + i * (bw + ch), z0 + m + j * (bd + ch), x0 + m + i * (bw + ch) + bw, z0 + m + j * (bd + ch) + bd];
    bag.add('brick', box(r[0], y, r[1], r[2], y + PH, r[3])); col.rect(r, y, y + PH);
  }
  for (const r of [[x0, z0, x1, z0 + m], [x0, z1 - m, x1, z1], [x0, z0, x0 + m, z1], [x1 - m, z0, x1, z1]]) { bag.add('brick', box(r[0], y, r[1], r[2], y + PH, r[3])); col.rect(r, y, y + PH); }
  const dy = y + PH;
  bag.add('timber', box(x0, dy, z0, x1, dy + 0.18, z1)); col.floor([x0, z0, x1, z1], dy + 0.18); const fy = dy + 0.18;
  // the hall on the deck: walls on three sides, the south open on a verandah of posts, the flat roof
  const HH = 3.6, t = 0.8;
  wallRect(ctx, [x0, z0, x1, z0 + t], fy, fy + HH, [], 'mudbrick', false); wallRect(ctx, [x0, z0 + t, x0 + t, z1], fy, fy + HH, [{ at: (z0 + z1) / 2, w: 1.2, h: 2.1 }], 'mudbrick'); wallRect(ctx, [x1 - t, z0 + t, x1, z1], fy, fy + HH, [], 'mudbrick', false);
  for (let x = x0 + 3; x < x1 - 2; x += 5) { bag.add('timber', box(x - 0.2, fy, z1 - 0.7, x + 0.2, fy + HH, z1 - 0.3)); col.rect([x - 0.2, z1 - 0.7, x + 0.2, z1 - 0.3], fy, fy + HH); }
  bag.add('timber', box(x0, fy + HH - 0.3, z1 - 0.8, x1, fy + HH, z1 - 0.2), false);
  bag.add('mud_plaster', box(x0 - 0.2, fy + HH, z0 - 0.2, x1 + 0.2, fy + HH + 0.4, z1 + 0.2)); col.floor([x0, z0, x1, z1], fy + HH + 0.4);
  bag.add('mudbrick', box(x0 - 0.2, fy + HH + 0.4, z0 - 0.2, x1 + 0.2, fy + HH + 1.0, z0 + 0.1), false); bag.add('mudbrick', box(x0 - 0.2, fy + HH + 0.4, z1 + 0.1, x1 + 0.2, fy + HH + 1.0, z1 + 0.2), false);
  // inside: bays of sacks and big jars along the back, a tally post, lamps
  for (let i = 0; i < 9; i++) { const x = x0 + t + 2 + i * 4.6; for (let k = 0; k < 3; k++) bag.add('sacking', box(x - 1 + (k % 2) * 0.3, fy, z0 + t + 0.2 + k * 0.6, x + 0.5 + (k % 2) * 0.3, fy + 0.5 + (i % 3) * 0.25, z0 + t + 0.75 + k * 0.6)); for (let k = 0; k < 3; k++) jar(bag, i % 2 ? 'terracotta' : 'pottery_dark', x + 1.2 + k * 0.7, fy, z0 + t + 1.2 + rand() * 0.6, 2); }
  lights.push({ at: [x0 + 12, fy + 2.8, z0 + 6], color: '#ffc98a', intensity: 3, distance: 11 }, { at: [x0 + 36, fy + 2.8, z0 + 6], color: '#ffc98a', intensity: 3, distance: 11 });
  // the roof beams seen from inside, a tally board and a ladder to the deck's loft, a balance with its stone weights, rows of sacks down the middle
  for (let z = z0 + t + 1; z < z1 - 1.2; z += 2.4) bag.add('timber', box(x0 + t, fy + HH - 0.34, z - 0.14, x1 - t, fy + HH - 0.04, z + 0.14), false);
  for (let x = x0 + t + 3; x < x1 - t - 1; x += 4.6) { bag.add('timber', box(x - 0.16, fy + HH - 0.7, z0 + t, x + 0.16, fy + HH - 0.34, z1 - 0.9), false); }
  bag.add('timber', box(x0 + 30, fy, z0 + t + 0.06, x0 + 33.4, fy + 1.5, z0 + t + 0.16), false);
  for (let k = 0; k < 8; k++) bag.add('chalk', box(x0 + 30.2 + (k % 4) * 0.8, fy + 0.4 + Math.floor(k / 4) * 0.6, z0 + t + 0.16, x0 + 30.5 + (k % 4) * 0.8, fy + 0.46 + Math.floor(k / 4) * 0.6, z0 + t + 0.19), false);
  for (const xx of [x0 + 7, x0 + 7.9]) bag.add('timber', box(xx - 0.05, fy, z0 + t + 0.4, xx + 0.05, fy + 3.0, z0 + t + 0.5), false);
  for (let k = 0; k < 9; k++) bag.add('timber', box(x0 + 7, fy + 0.3 + k * 0.3, z0 + t + 0.4, x0 + 7.9, fy + 0.35 + k * 0.3, z0 + t + 0.5), false);
  bag.add('timber', box(x0 + 14, fy + 0.01, z0 + 11.4, x0 + 15.6, fy + 0.7, z0 + 12.4), false); bag.add('bronze', box(x0 + 14.2, fy + 0.7, z0 + 11.8, x0 + 15.4, fy + 0.74, z0 + 12.0), false);
  for (let k = 0; k < 5; k++) bag.add('granite_grey', box(x0 + 14.2 + k * 0.25, fy + 0.7, z0 + 12.1, x0 + 14.38 + k * 0.25, fy + 0.7 + 0.08 + 0.02 * k, z0 + 12.3), false);
  for (let i = 0; i < 6; i++) for (let k = 0; k < 4; k++) bag.add(k % 2 ? 'sacking' : 'wicker', box(x0 + 5 + i * 6.4, fy + k * 0.32, z0 + 7.6, x0 + 8.4 + i * 6.4, fy + 0.3 + k * 0.32, z0 + 8.6), false);
  for (let i = 0; i < 7; i++) jar(bag, i % 2 ? 'terracotta' : 'pottery_dark', x0 + 4 + i * 6.3, fy, z0 + 10.6, 2.0);
  // the weathering of the podium's faces and the hall's walls
  outer(ctx, el.rect, y, PH, PH * 0.6, 21, { s: [[x0 + 23.6, x0 + 27.4]] }, 'nswe', true);
  outer(ctx, [x0, z0, x1, z1], fy, HH, HH * 0.4, 22, { w: [[(z0 + z1) / 2 - 0.6, (z0 + z1) / 2 + 0.6]] }, 'nwe');
  // the cart ramp from the platform up to the deck on the south, and the loading platform in front
  F.stairs(x0 + 23.6, z1, x0 + 27.4, z1 + 9, y, fy, -1, 'brick', 0.12);
}

/** indus_pillared: { rect, y } — twenty piers in four rows of five on a low platform under a flat roof. */
export function pillared(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, F = new Fr(ctx, [0, 0], [1, 0], [0, 1], 0), PH = 0.45, GH = 3.8;
  bag.add('brick', box(x0, y - 0.3, z0, x1, y + PH, z1)); col.floor(el.rect, y + PH);
  F.stairs(x0 + 11, z1, x0 + 19, z1 + 2.4, y, y + PH, -1, 'brick', 0.15); F.stairs(x0 + 11, z0 - 2.4, x0 + 19, z0, y, y + PH, 1, 'brick', 0.15);
  const gx = (x1 - x0 - 6) / 4, gz = (z1 - z0 - 6) / 3;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) {
    const x = x0 + 3 + gx * i, z = z0 + 3 + gz * j;
    bag.add('brick', box(x - 0.6, y + PH, z - 0.6, x + 0.6, y + PH + GH, z + 0.6)); bag.add('brick', box(x - 0.75, y + PH, z - 0.75, x + 0.75, y + PH + 0.35, z + 0.75)); col.rect([x - 0.75, z - 0.75, x + 0.75, z + 0.75], y + PH, y + PH + GH);
  }
  const ry = y + PH + GH;
  for (let j = 0; j < 4; j++) bag.add('timber', box(x0 - 0.8, ry, z0 + 3 + gz * j - 0.3, x1 + 0.8, ry + 0.4, z0 + 3 + gz * j + 0.3), false);
  bag.add('mud_plaster', box(x0 - 0.8, ry + 0.4, z0 - 0.8, x1 + 0.8, ry + 0.85, z1 + 0.8)); bag.add('mudbrick', box(x0 - 0.8, ry + 0.85, z0 - 0.8, x1 + 0.8, ry + 1.3, z0 - 0.5), false);
  // the benches between the rows, a dais with its seat, braziers on tripods, water jars, an offering table
  const py = y + PH;
  for (let i = 0; i < 4; i++) for (const j of [0, 2]) { const bx = x0 + 3 + gx * i + gx * 0.15, bz = z0 + 3 + gz * j + gz * 0.5; bag.add('mudbrick', box(bx, py, bz - 0.3, bx + gx * 0.7, py + 0.44, bz + 0.3)); col.rect([bx, bz - 0.3, bx + gx * 0.7, bz + 0.3], py, py + 0.44); bag.add('reed_mat', box(bx + 0.1, py + 0.44, bz - 0.25, bx + gx * 0.7 - 0.1, py + 0.47, bz + 0.25), false); }
  { const dx = (x0 + x1) / 2, dz = (z0 + z1) / 2; bag.add('brick_buff', box(dx - 4, py, dz - 2.2, dx + 4, py + 0.28, dz + 2.2)); col.rect([dx - 4, dz - 2.2, dx + 4, dz + 2.2], py, py + 0.28); bag.add('timber', box(dx - 0.6, py + 0.28, dz - 0.5, dx + 0.6, py + 0.7, dz + 0.5), false); bag.add('cloth_red', box(dx - 0.55, py + 0.7, dz - 0.45, dx + 0.55, py + 0.74, dz + 0.45), false); }
  for (const [bx, bz] of [[x0 + 8, z0 + 9], [x1 - 8, z0 + 9], [x0 + 8, z1 - 9], [x1 - 8, z1 - 9]]) { for (let a = 0; a < 3; a++) bag.add('timber', box(bx + Math.cos(a * 2.09) * 0.3 - 0.03, py, bz + Math.sin(a * 2.09) * 0.3 - 0.03, bx + Math.cos(a * 2.09) * 0.3 + 0.03, py + 0.8, bz + Math.sin(a * 2.09) * 0.3 + 0.03), false); bag.add('terracotta', lathe([[0.001, 0], [0.34, 0.12], [0.4, 0.25], [0.001, 0.25]], 10, null, bx, py + 0.8, bz), false); bag.add('bitumen', box(bx - 0.25, py + 1.02, bz - 0.25, bx + 0.25, py + 1.05, bz + 0.25), false); }
  for (let i = 0; i < 5; i++) jar(bag, i % 2 ? 'terracotta' : 'pottery_dark', x0 + 2 + i * 6.8, py, z1 - 1.3, 1.9);
  outer(ctx, [x0, z0, x1, z1], y, PH, PH * 0.6, 31, { s: [[x0 + 11, x0 + 19]], n: [[x0 + 11, x0 + 19]] }, 'nswe', true);
  for (let k = 0; k < 6; k++) bag.add('reed_mat', box(x0 + 3 + (k % 3) * 8, y + PH, z0 + 4 + Math.floor(k / 3) * 12, x0 + 7.5 + (k % 3) * 8, y + PH + 0.04, z0 + 7 + Math.floor(k / 3) * 12));
}

/** indus_college: { rect, y } — the College of Priests: a court ringed by rooms, verandas on three sides, a gate on the north, two stairs to the roof. */
export function college(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, F = new Fr(ctx, [0, 0], [1, 0], [0, 1], 0), RD = 6.4, RH = 4.2, t = 0.5, VW = 2.6;
  const court = [x0 + RD, z0 + RD, x1 - RD, z1 - RD], mx = (x0 + x1) / 2;
  bag.add('brick_buff', box(x0, y - 0.4, z0, x1, y, z1)); col.floor(el.rect, y);
  // the outer walls: north with the gate, the rest plain with two high windows
  wallRect(ctx, [x0, z0, x1, z0 + 0.9], y, y + RH, [{ at: mx, w: 3.0, h: 3.0 }]); wallRect(ctx, [x0, z1 - 0.9, x1, z1], y, y + RH); wallRect(ctx, [x0, z0 + 0.9, x0 + 0.9, z1 - 0.9], y, y + RH); wallRect(ctx, [x1 - 0.9, z0 + 0.9, x1, z1 - 0.9], y, y + RH);
  // the rooms: the inner wall of each range with a doorway per room, partitions every 7 m
  const nW = Math.max(2, Math.round((x1 - x0 - 2 * RD) / 7)), nS = Math.max(2, Math.round((z1 - z0 - 2 * RD) / 7));
  const inner = (rect, n, alongX, skip = -1) => {
    const a = alongX ? rect[0] : rect[1], b = alongX ? rect[2] : rect[3], w = (b - a) / n, ops = Array.from({ length: n }, (_, i) => ({ at: a + w * (i + 0.5), w: 1.2, h: 2.3 })).filter((_, i) => i !== skip);
    wallRect(ctx, rect, y, y + RH, ops);
  };
  inner([court[0] - t, z0 + RD - t, court[2] + t, z0 + RD], nW + 0, true, Math.floor(nW / 2));   // north range (the middle room is the passage from the gate)
  inner([court[0] - t, z1 - RD, court[2] + t, z1 - RD + t], nW, true);
  inner([x0 + RD - t, court[1], x0 + RD, court[3]], nS, false); inner([x1 - RD, court[1], x1 - RD + t, court[3]], nS, false);
  const part = (x, zA, zB) => { bag.add('mudbrick', box(x - 0.2, y, zA, x + 0.2, y + RH, zB)); col.rect([x - 0.2, zA, x + 0.2, zB], y, y + RH); };
  const partZ = (z, xA, xB) => { bag.add('mudbrick', box(xA, y, z - 0.2, xB, y + RH, z + 0.2)); col.rect([xA, z - 0.2, xB, z + 0.2], y, y + RH); };
  for (let i = 1; i < nW; i++) { if (i !== Math.floor(nW / 2) && i !== Math.floor(nW / 2) + 1) part(court[0] + (court[2] - court[0]) * i / nW, z0 + 0.9, z0 + RD - t); part(court[0] + (court[2] - court[0]) * i / nW, z1 - RD + t, z1 - 0.9); }
  for (let j = 1; j < nS; j++) { partZ(court[1] + (court[3] - court[1]) * j / nS, x0 + 0.9, x0 + RD - t); partZ(court[1] + (court[3] - court[1]) * j / nS, x1 - RD + t, x1 - 0.9); }
  partZ(court[1], x0 + 0.9, x0 + RD - t); partZ(court[3], x0 + 0.9, x0 + RD - t); partZ(court[1], x1 - RD + t, x1 - 0.9); partZ(court[3], x1 - RD + t, x1 - 0.9);
  // the roofs over the ranges (walkable), the corner rooms closed
  for (const r of [[x0, z0, x1, z0 + RD], [x0, z1 - RD, x1, z1], [x0, z0 + RD, x0 + RD, z1 - RD], [x1 - RD, z0 + RD, x1, z1 - RD]]) { bag.add('mud_plaster', box(r[0], y + RH - 0.35, r[1], r[2], y + RH, r[3])); col.floor(r, y + RH); }
  for (const r of [[x0, z0, x1, z0 + 0.3], [x0, z1 - 0.3, x1, z1], [x0, z0, x0 + 0.3, z1], [x1 - 0.3, z0, x1, z1]]) { bag.add('mudbrick', box(r[0], y + RH, r[1], r[2], y + RH + 0.9, r[3])); col.rect(r, y + RH, y + RH + 0.9); }
  // the verandas on the north, east and west sides of the court: piers and a flat roof
  const VH = 3.2;
  const veranda = (r) => { bag.add('mud_plaster', box(r[0], y + VH, r[1], r[2], y + VH + 0.35, r[3])); };
  veranda([court[0], court[1], court[2], court[1] + VW]); veranda([court[0], court[1] + VW, court[0] + VW, court[3] - 7]); veranda([court[2] - VW, court[1] + VW, court[2], court[3] - 7]);
  for (let x = court[0] + 1; x < court[2]; x += 4.4) { bag.add('brick', box(x - 0.4, y, court[1] + VW - 0.4, x + 0.4, y + VH, court[1] + VW + 0.4)); col.rect([x - 0.4, court[1] + VW - 0.4, x + 0.4, court[1] + VW + 0.4], y, y + VH); }
  for (let z = court[1] + VW + 4; z < court[3] - 7; z += 4.4) for (const x of [court[0] + VW, court[2] - VW]) { bag.add('brick', box(x - 0.4, y, z - 0.4, x + 0.4, y + VH, z + 0.4)); col.rect([x - 0.4, z - 0.4, x + 0.4, z + 0.4], y, y + VH); }
  // the two stairs to the roof, at the south corners of the court
  F.stairs(court[0] + 0.3, court[3] - 6.5, court[0] + 1.5, court[3], y, y + RH, 1, 'brick', 0.2);
  F.stairs(court[2] - 1.5, court[3] - 6.5, court[2] - 0.3, court[3], y, y + RH, 1, 'brick', 0.2);
  // the court: a well, a platform, jars, the rooms' mats
  wellAt(bag, col, mx, y, (court[1] + court[3]) / 2 + 2, 0.62);
  for (let i = 0; i < 6; i++) bag.add('reed_mat', box(court[0] + 6 + i * 8, y, court[1] + 4.5, court[0] + 8.4 + i * 8, y + 0.04, court[1] + 6.3));
  for (let i = 0; i < 5; i++) jar(bag, i % 2 ? 'terracotta' : 'pottery_dark', court[0] + 5 + i * 10, y, court[3] - 1.0, 1.7);
  lights.push({ at: [mx - 12, y + 2.8, court[1] + 3], color: '#ffd9a0', intensity: 2.5, distance: 11 }, { at: [mx + 12, y + 2.8, court[1] + 3], color: '#ffd9a0', intensity: 2.5, distance: 11 });
  // the rooms of the four ranges, each furnished: cells of the priests, stores, a work room, a shrine; the passage from the gate left bare
  {
    const FY = new Fr(ctx, [0, 0], [1, 0], [0, 1], y), rr = rng(11), uses = ['shrine', 'cell', 'cell', 'store', 'cell', 'work', 'cell', 'cell', 'store'];
    let n = 0;
    const put = (r, door) => { const k = uses[n % uses.length]; furnishRoom(FY, r, door, n === 0 ? 'shrine' : k === 'shrine' ? 'cell' : k, rr, lights, n % 5 === 2); n++; };
    const cx = (i, c) => court[0] + (court[2] - court[0]) * i / c;
    for (let i = 0; i < nW; i++) {
      if (i === Math.floor(nW / 2)) continue;
      put([cx(i, nW) + 0.3, z0 + 0.9 + 0.3, cx(i + 1, nW) - 0.3, z0 + RD - t - 0.3], 'v1');
      put([cx(i, nW) + 0.3, z1 - RD + t + 0.3, cx(i + 1, nW) - 0.3, z1 - 0.9 - 0.3], 'v0');
    }
    const cz = (j, c) => court[1] + (court[3] - court[1]) * j / c;
    for (let j = 0; j < nS; j++) {
      put([x0 + 0.9 + 0.3, cz(j, nS) + 0.3, x0 + RD - t - 0.3, cz(j + 1, nS) - 0.3], 'u1');
      put([x1 - RD + t + 0.3, cz(j, nS) + 0.3, x1 - 0.9 - 0.3, cz(j + 1, nS) - 0.3], 'u0');
    }
    // the benches of mud brick along the verandas' back, a water channel across the court
    for (let x = court[0] + 3; x < court[2] - 3; x += 9) if (Math.abs(x - mx) > 4) { bag.add('mudbrick', box(x, y, court[1] + 0.2, x + 4.2, y + 0.42, court[1] + 0.8)); col.rect([x, court[1] + 0.2, x + 4.2, court[1] + 0.8], y, y + 0.42); }
    bag.add('brick', box(court[0] + 6, y, (court[1] + court[3]) / 2 + 6.2, court[2] - 6, y + 0.04, (court[1] + court[3]) / 2 + 6.5), false);
    outer(ctx, el.rect, y, RH, RH * 0.55, 13, { n: [[mx - 1.5, mx + 1.5]] });
  }
}
