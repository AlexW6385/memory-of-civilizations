// What stands and weathers in Shaolin's courts (docs/settlements/shaolin.md §6b): the monks' training gear (weapon racks, stone
// locks, plum-blossom piles, wooden dummies), the iron fire cisterns and stone lamps of the courts, the robes on the drying line,
// and the weather on the walls: mud splash at the foot, rain streaks under the coping, tufts of dry grass in the joints.
import { Parts, limb, ball, T } from '../qing/carving.js';
import { box, lathe } from '../../core/geom.js';
import { rng } from '../../settlements/ming-suzhou/props.js';

function rack(P) {
  // a frame of two posts and two rails, eighteen weapons (the eighteen arms): staves, spears, sabres, halberds leaning in a row
  for (const s of [-1, 1]) { P.add('lacquer_chestnut', box(s * 1.5 - 0.06, 0, -0.2, s * 1.5 + 0.06, 1.7, 0.2)); P.add('lacquer_chestnut', box(s * 1.5 - 0.06, 0, -0.3, s * 1.5 + 0.06, 0.08, 0.3)); }
  for (const y of [0.45, 1.45]) P.add('lacquer_chestnut', box(-1.5, y, -0.1, 1.5, y + 0.07, -0.02));
  for (let k = 0; k < 18; k++) {
    const x = -1.35 + k * 0.165, kind = k % 3, top = 1.95 + (k % 4) * 0.12;
    P.add('timber', limb([x, 0.06, 0.03], [x + 0.03, top, 0.05], 0.017, 0.014, 4));
    if (kind === 1) P.add('iron', limb([x + 0.03, top, 0.05], [x + 0.03, top + 0.28, 0.05], 0.014, 0.003, 4));
    else if (kind === 2) P.add('iron', box(x + 0.0, top - 0.05, 0.035, x + 0.07, top + 0.25, 0.05));
    else P.add('iron', limb([x + 0.03, top - 0.02, 0.05], [x + 0.03, top + 0.05, 0.05], 0.019, 0.019, 4));
  }
  P.add('tile_dark', box(-1.7, 2.62, -0.3, 1.7, 2.68, 0.3));
  for (const s of [-1, 1]) P.add('lacquer_chestnut', limb([s * 1.5, 1.7, 0.0], [s * 1.5, 2.62, 0.0], 0.05, 0.05, 5));
}
function locks(P, seed) {
  const r = rng(seed);
  for (let k = 0; k < 3; k++) { const x = (k - 1) * 0.62 + (r() - 0.5) * 0.1, s = 0.78 + k * 0.1; P.add('granite_grey', box(x - 0.2 * s, 0, -0.1 * s, x + 0.2 * s, 0.34 * s, 0.1 * s)); P.add('granite_grey', box(x - 0.14 * s, 0.34 * s, -0.07 * s, x - 0.07 * s, 0.5 * s, 0.07 * s)); P.add('granite_grey', box(x + 0.07 * s, 0.34 * s, -0.07 * s, x + 0.14 * s, 0.5 * s, 0.07 * s)); P.add('granite_grey', box(x - 0.14 * s, 0.5 * s, -0.07 * s, x + 0.14 * s, 0.57 * s, 0.07 * s)); }
  P.add('granite_grey', lathe([[0.001, 0], [0.3, 0], [0.3, 0.55], [0.001, 0.55]], 10, null, 1.4, 0, 0).rotateZ(0));        // a stone roller
  P.add('granite_grey', box(-1.5, 0, 0.3, -0.5, 0.18, 0.7));
}
/** The plum-blossom piles: posts of different heights on stone footings in a pattern of the five-petal flower. */
function piles(P, seed) {
  const r = rng(seed), pts = [[0, 0]];
  for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; pts.push([Math.cos(a) * 1.05, Math.sin(a) * 1.05], [Math.cos(a) * 2.0, Math.sin(a) * 2.0]); }
  for (const [x, z] of pts) { const h = 0.7 + r() * 0.75; P.add('granite_grey', lathe([[0.001, 0], [0.22, 0], [0.2, 0.1], [0.001, 0.1]], 8, null, x, 0, z)); P.add('timber', lathe([[0.001, 0.1], [0.12, 0.1], [0.115, h], [0.001, h + 0.02]], 8, null, x, 0, z)); P.add('iron', lathe([[0.12, h - 0.1], [0.13, h - 0.1], [0.13, h - 0.07], [0.12, h - 0.07]], 8, null, x, 0, z)); }
  return pts;
}
function dummy(P) {
  P.add('granite_grey', box(-0.35, 0, -0.35, 0.35, 0.12, 0.35));
  P.add('timber', lathe([[0.001, 0.12], [0.14, 0.12], [0.13, 1.9], [0.001, 1.94]], 8));
  for (const [y, s] of [[1.35, 1], [1.2, -1]]) P.add('timber', limb([0, y, 0.0], [s * 0.1, y, 0.5], 0.03, 0.03, 5));
  P.add('timber', limb([0, 0.95, 0], [0.18, 0.55, 0.28], 0.03, 0.03, 5));
  P.add('cloth_grey', lathe([[0.15, 1.1], [0.16, 1.5], [0.15, 1.5], [0.15, 1.1]], 8));
}
/** An iron fire cistern (taiping gang): a squat bowl on a stone base with a lid of boards, a ring handle each side. */
function cistern(P, s = 1) {
  P.add('granite_block', box(-0.8 * s, 0, -0.8 * s, 0.8 * s, 0.22 * s, 0.8 * s));
  P.add('iron', lathe([[0.001, 0.22 * s], [0.5 * s, 0.22 * s], [0.78 * s, 0.5 * s], [0.84 * s, 0.9 * s], [0.78 * s, 1.1 * s], [0.84 * s, 1.14 * s], [0.7 * s, 1.14 * s], [0.001, 1.08 * s]], 14));
  P.add('water', lathe([[0.001, 1.0 * s], [0.74 * s, 1.0 * s]], 14));
  for (const sx of [-1, 1]) P.add('bronze', limb([sx * 0.84 * s, 0.9 * s, 0], [sx * 0.96 * s, 0.84 * s, 0], 0.03, 0.03, 4));
}
/** A stone lamp (shi deng): a square foot, a tall shaft, a lantern box with four openings, a little roof. */
function stoneLamp(P, s = 1) {
  P.add('granite_grey', box(-0.4 * s, 0, -0.4 * s, 0.4 * s, 0.25 * s, 0.4 * s));
  P.add('granite_grey', lathe([[0.001, 0.25 * s], [0.18 * s, 0.25 * s], [0.14 * s, 0.4 * s], [0.12 * s, 1.5 * s], [0.001, 1.5 * s]], 8));
  P.add('granite_grey', box(-0.3 * s, 1.5 * s, -0.3 * s, 0.3 * s, 1.58 * s, 0.3 * s));
  for (const [x, z] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) P.add('granite_grey', box(x * 0.24 * s - 0.04 * s, 1.58 * s, z * 0.24 * s - 0.04 * s, x * 0.24 * s + 0.04 * s, 1.95 * s, z * 0.24 * s + 0.04 * s));
  P.add('flame', lathe([[0.001, 1.62 * s], [0.04, 1.7 * s], [0.001, 1.85 * s]], 5));
  P.add('granite_grey', box(-0.38 * s, 1.95 * s, -0.38 * s, 0.38 * s, 2.02 * s, 0.38 * s));
  P.add('granite_grey', lathe([[0.001, 2.02 * s], [0.34 * s, 2.02 * s], [0.12 * s, 2.22 * s], [0.001, 2.34 * s]], 4).rotateY(Math.PI / 4));
}
/** Grey robes drying on a bamboo line between two posts. */
function robes(P, n, seed) {
  const r = rng(seed), L = n * 1.0 + 0.8;
  for (const s of [-1, 1]) P.add('timber', limb([s * L / 2, 0, 0], [s * L / 2, 2.2, 0], 0.045, 0.04, 5));
  P.add('bamboo_culm', limb([-L / 2, 2.0, 0], [L / 2, 1.98, 0], 0.02, 0.02, 5));
  for (let k = 0; k < n; k++) {
    const x = -L / 2 + 0.7 + k * 1.0, c = r() < 0.7 ? 'cloth_grey' : r() < 0.5 ? 'cloth_ochre' : 'cloth_white', len = 1.1 + r() * 0.3;
    P.add(c, box(x - 0.34, 2.0 - len, -0.012, x + 0.34, 2.0, 0.012));
    P.add(c, box(x - 0.62, 1.9 - 0.0, -0.012, x - 0.34, 2.0, 0.012)); P.add(c, box(x + 0.34, 1.9, -0.012, x + 0.62, 2.0, 0.012));
  }
}
/** A bamboo broom stand with brooms and water buckets with their pole. */
function brooms(P) {
  P.add('timber', box(-0.5, 0, -0.04, 0.5, 0.06, 0.04));
  for (let k = 0; k < 4; k++) { const x = -0.36 + k * 0.24; P.add('timber', limb([x, 0.06, 0.06], [x + 0.03, 1.7, 0.1], 0.015, 0.014, 4)); P.add('thatch', lathe([[0.001, 0.0], [0.08, 0.02], [0.14, 0.6], [0.001, 0.62]], 7, null, x, 0.06, 0.06)); }
  for (const x of [0.7, 1.05]) P.add('timber', lathe([[0.001, 0], [0.2, 0], [0.24, 0.3], [0.001, 0.3]], 10, null, x, 0, 0));
}

/** The stone offering table before a memorial pagoda: a slab on two stone slabs, a small bronze censer with three burning incense sticks, a cup of offerings. */
function offering(P, s = 1) {
  P.add('granite_grey', box(-0.62 * s, 0, -0.26 * s, 0.62 * s, 0.1 * s, 0.26 * s));                    // the footing
  for (const sx of [-1, 1]) P.add('granite_grey', box(sx * 0.42 * s - 0.1 * s, 0.1 * s, -0.22 * s, sx * 0.42 * s + 0.1 * s, 0.5 * s, 0.22 * s));
  P.add('limestone', box(-0.62 * s, 0.5 * s, -0.28 * s, 0.62 * s, 0.62 * s, 0.28 * s));                // the top slab
  P.add('bronze', lathe([[0.001, 0.62 * s], [0.12 * s, 0.62 * s], [0.17 * s, 0.7 * s], [0.18 * s, 0.82 * s], [0.14 * s, 0.84 * s], [0.001, 0.84 * s]], 10, null, 0, 0, 0));
  for (const dx of [-0.05, 0, 0.05]) { P.add('lacquer_red', limb([dx * s, 0.84 * s, 0.0], [dx * s * 1.4, 1.15 * s, 0.0], 0.004 * s, 0.004 * s, 3)); P.add('flame', lathe([[0.001, 1.15 * s], [0.008 * s, 1.16 * s], [0.001, 1.18 * s]], 4, null, dx * s * 1.4, 0, 0)); }
  P.add('glaze_white', lathe([[0.001, 0.62 * s], [0.05 * s, 0.62 * s], [0.06 * s, 0.7 * s], [0.001, 0.7 * s]], 8, null, 0.34 * s, 0, 0.0));
}
/** A wayside shrine of stone on a mountain path: a small stone hall on a footing sunk into the slope, a niche with a seated figure, a gabled tile roof. Faces +z. */
function wayshrine(P, s = 1) {
  P.add('granite_grey', box(-0.75 * s, -0.9, -0.6 * s, 0.75 * s, 0.2 * s, 0.6 * s));
  P.add('limestone', box(-0.62 * s, 0.2 * s, -0.48 * s, 0.62 * s, 1.25 * s, 0.48 * s));
  P.add('opening', box(-0.3 * s, 0.34 * s, 0.47 * s, 0.3 * s, 1.0 * s, 0.5 * s));
  P.add('granite_grey', box(-0.34 * s, 0.3 * s, 0.46 * s, 0.34 * s, 0.36 * s, 0.56 * s));                      // the sill, where the offerings stand
  P.add('clay_gilt', lathe([[0.001, 0.36 * s], [0.14 * s, 0.36 * s], [0.11 * s, 0.6 * s], [0.08 * s, 0.74 * s], [0.001, 0.78 * s]], 8, null, 0, 0, 0.3 * s));
  P.add('granite_grey', box(-0.7 * s, 1.25 * s, -0.56 * s, 0.7 * s, 1.31 * s, 0.56 * s));
  // the gabled roof: two sloping tile slabs and the ridge (a stone block roof stepped in three courses)
  for (const [k, w, y] of [[0, 0.78, 1.31], [1, 0.56, 1.43], [2, 0.32, 1.55]]) P.add('tile_grey', box(-w * s, y * s, -0.62 * s, w * s, (y + 0.12) * s, 0.62 * s));
  P.add('granite_grey', box(-0.12 * s, 1.67 * s, -0.62 * s, 0.12 * s, 1.75 * s, 0.62 * s));
}
/** A stone mill (shi mo) of the village: a round bed, the runner stone with its feed hole, the wooden sweep to harness a donkey to, and a heap of husks. */
function millstone(P, s = 1) {
  P.add('granite_grey', lathe([[0.001, 0], [0.82 * s, 0], [0.82 * s, 0.42 * s], [0.001, 0.42 * s]], 14, null, 0, 0, 0));
  P.add('limestone', lathe([[0.001, 0.42 * s], [0.7 * s, 0.42 * s], [0.7 * s, 0.62 * s], [0.12 * s, 0.62 * s], [0.12 * s, 0.6 * s], [0.001, 0.6 * s]], 14, null, 0, 0, 0));
  P.add('granite_grey', lathe([[0.001, 0.62 * s], [0.12 * s, 0.62 * s], [0.12 * s, 0.7 * s], [0.001, 0.7 * s]], 8, null, 0, 0, 0));
  P.add('timber', box(-0.06 * s, 0.7 * s, -0.06 * s, 0.06 * s, 1.35 * s, 0.06 * s));
  P.add('timber', box(0.06 * s, 1.0 * s, -0.05 * s, 1.9 * s, 1.1 * s, 0.05 * s));
  P.add('timber', box(-0.9 * s, 1.0 * s, -0.04 * s, -0.06 * s, 1.07 * s, 0.04 * s));
  P.add('hide_tan', box(0.78 * s, 0.1 * s, 0.9 * s, 1.15 * s, 0.2 * s, 1.2 * s));                        // a sack of grain on the ground beside it
}
/**
 * The worn doorstep of a village house, local +z out from the platform's edge: one granite step from the street to the platform, its middle dished
 * (a darker, polished patch where every foot lands) and a pale polished patch on the platform's lip over the threshold. The step's top is 0.13 over the
 * ground, the platform's 0.23 (town.js FRONT_Y 0.25 over a ground at 0.02).
 */
function doorstep(P, w = 1.5, seed = 0) {
  const j = ((seed * 2654435761) >>> 0) / 4294967296;
  P.add('granite_grey', box(-w / 2, 0, 0.0, w / 2, 0.13, 0.52));
  P.add('bluestone', box(-w * 0.27, 0.13, 0.12 + j * 0.06, w * 0.27, 0.136, 0.4));
  P.add('limestone', box(-w * 0.3 + (j - 0.5) * 0.1, 0.23, -0.42, w * 0.3, 0.2362, -0.02));
}
/**
 * shaolin_steps { pts, w, from (z where the treads begin), ground }: the stone treads of a mountain path laid on a slope along a polyline running
 * mostly north–south; each tread a slab 0.55 deep, its top 0.16 above the ground at its middle, its foot sunk 0.3 below the lowest ground under it.
 */
export function shaolinSteps(el, { bag, col }) {
  const H = el.ground, w = el.w ?? 2.2, d = 0.55, pts = el.pts, from = el.from ?? -Infinity;
  const at = (z) => { for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; if ((z - a[1]) * (z - b[1]) <= 0 && a[1] !== b[1]) return a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]); } return null; };
  const z0 = Math.max(pts[0][1], pts[pts.length - 1][1]), z1 = Math.min(pts[0][1], pts[pts.length - 1][1]);
  const P = new Parts(), cols = [];
  let k = 0;
  for (let z = Math.min(z0, from) - d / 2; z > z1; z -= d, k++) {
    const x = at(z); if (x === null) continue;
    const r = [x - w / 2, z - d / 2 + 0.01, x + w / 2, z + d / 2 - 0.01];
    let lo = Infinity; for (const [px, pz] of [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [x, z]]) lo = Math.min(lo, H(px, pz));
    const top = H(x, z) + 0.16;
    P.add('granite_grey', box(r[0], lo - 0.3, r[1], r[2], top, r[3]));
    // the worn middle of every fourth tread is a darker slab: the path's pattern of long and short stones
    if (k % 4 === 1) P.add('bluestone', box(r[0] + 0.25, top, r[1] + 0.06, r[2] - 0.25, top + 0.012, r[3] - 0.06));
    cols.push([r, lo - 0.3, top]);
  }
  P.emit(bag);
  for (const [r, y0, y1] of cols) col.rect(r, y0, y1);
}
export function shaolinGear(el, { bag, col }) {
  const P = new Parts(), s = el.s ?? 1, [x, z] = el.at, y = el.y ?? 0.02, rot = el.rot ?? 0, seed = el.seed ?? 3;
  switch (el.kind) {
    case 'rack': rack(P); col.rect([x - 1.7, z - 0.4, x + 1.7, z + 0.4].map((v, i) => (rot ? v : v)), y, y + 2.7); break;
    case 'locks': locks(P, seed); col.circle(x + 1.4, z, 0.32, y, y + 0.6); break;
    case 'piles': for (const [px, pz] of piles(P, seed)) col.circle(x + px, z + pz, 0.15, y, y + 1.6); break;
    case 'dummy': dummy(P); col.circle(x, z, 0.3, y, y + 1.9); break;
    case 'cistern': cistern(P, s); col.circle(x, z, 0.85 * s, y, y + 1.2 * s); break;
    case 'lamp': stoneLamp(P, s); col.circle(x, z, 0.4 * s, y, y + 2.3 * s); break;
    case 'robes': robes(P, el.n ?? 4, seed); break;
    case 'wayshrine': wayshrine(P, s); { const c = Math.cos(rot), sn = Math.sin(rot), ex = Math.abs(0.75 * s * c) + Math.abs(0.6 * s * sn), ez = Math.abs(0.75 * s * sn) + Math.abs(0.6 * s * c); col.rect([x - ex, z - ez, x + ex, z + ez], y - 0.9, y + 1.75 * s); } break;
    case 'offering': offering(P, s); col.rect([x - 0.65 * s, z - 0.3 * s, x + 0.65 * s, z + 0.3 * s], y, y + 0.7 * s); break;
    case 'millstone': millstone(P, s); col.circle(x, z, 0.85 * s, y, y + 0.7 * s); break;
    case 'doorstep': doorstep(P, el.w ?? 1.5, seed); { const c = Math.cos(rot), sn = Math.sin(rot), hw = (el.w ?? 1.5) / 2, ex = Math.abs(hw * c) + Math.abs(0.26 * sn), ez = Math.abs(hw * sn) + Math.abs(0.26 * c); col.rect([x + sn * 0.26 - ex, z + c * 0.26 - ez, x + sn * 0.26 + ex, z + c * 0.26 + ez], y, y + 0.13); } break;
    case 'brooms': brooms(P); break;
    default: throw new Error('shaolin_gear: ' + el.kind);
  }
  P.emit(bag, x, y, z, rot, 1);
}

/**
 * shaolin_wear: the weather on a wall { a, b, y, h, th, seed, skip: [[s0, s1]…] (the gates), both: true }.
 * A foot of mud splash, rain streaks under the coping, a few patches where the plaster has fallen, on each face.
 */
export function shaolinWear(el, { bag }) {
  if (el.kind === 'tufts') {
    const r = rng(el.seed ?? 5), P = new Parts(), [x0, z0, x1, z1] = el.rect;
    for (let k = 0; k < (el.n ?? 40); k++) { const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0), h = 0.1 + r() * 0.16, gy = el.ground ? el.ground(x, z) - 0.02 : el.y; for (let j = 0; j < 3; j++) { const a = r() * 6.28; P.add(r() < 0.6 ? 'ichu' : 'sod', limb([x, gy, z], [x + Math.cos(a) * 0.05, gy + h, z + Math.sin(a) * 0.05], 0.012, 0.002, 3)); } }
    P.emit(bag); return;
  }
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const r = rng(el.seed ?? 9), y = el.y ?? 0, h = el.h ?? 4.6, off = el.th / 2 + 0.012, skip = el.skip ?? [];
  const P = new Parts(), M = el.mats ?? { base: 'mud_plaster', streak: 'timber_red', patch: 'brick_grey' };
  const free = (s0, s1) => !skip.some(([a, b]) => s1 > a - 0.3 && s0 < b + 0.3);
  const seg = (s0, s1, y0, y1, side, mat, d = 0) => {
    const o = off + d + (mat === M.base ? 0.035 : 0), px = ax + nx * o * side, pz = az + nz * o * side, t = 0.012;
    const qx0 = px + ux * s0, qz0 = pz + uz * s0, qx1 = px + ux * s1, qz1 = pz + uz * s1;
    P.add(mat, box(Math.min(qx0, qx1) - (uz ? t : 0), y + y0, Math.min(qz0, qz1) - (ux ? t : 0), Math.max(qx0, qx1) + (uz ? t : 0), y + y1, Math.max(qz0, qz1) + (ux ? t : 0)));
  };
  for (const side of el.both === false ? [1] : [1, -1]) {
    let s = 0;
    while (s < L) { const w = 2 + r() * 4; if (free(s, Math.min(L, s + w))) { seg(s, Math.min(L, s + w), 0.0, 0.3 + r() * 0.35, side, M.base); } s += w + (r() < 0.25 ? 1.5 : 0); }
    for (let q = 2 + r() * 2; q < L - 1; q += 2.4 + r() * 4) { if (!free(q - 0.3, q + 0.3)) continue; const w = 0.14 + r() * 0.3, len = 0.6 + r() * 1.6; seg(q, q + w, h - 0.5 - len, h - 0.45, side, M.streak, 0.003); }
    for (let q = 3 + r() * 5; q < L - 2; q += 8 + r() * 12) { if (!free(q - 1, q + 1)) continue; const w = 0.5 + r() * 0.9, hh = 0.4 + r() * 0.7, yy = 0.7 + r() * 1.6; seg(q, q + w, yy, yy + hh, side, M.patch, 0.006); }
  }
  P.emit(bag);
}
