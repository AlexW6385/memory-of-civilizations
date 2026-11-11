// The furnished rooms of the East Wing (docs/settlements/knossos.md §4d): the residential hall with its pier-and-door
// partition onto a light well, the shield frieze, the chair, the loom, the double axe on its stand; the lapidary's
// workshop with its benches, the stone vases half cut, the bow drill, the raw blocks and the finished vases on the shelf.

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { ell, poly, prism, toPlane } from '../greek/sculpture.js';
import { merge } from '../greek/columns.js';
import { FRESCO, minoanFresco as fresco, minoanPithos as pithos } from './index.js';

const G = 'gypsum_minoan', RED = 'paint_minoan_red', BLK = 'paint_minoan_black';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const F0 = 0.03;                                                       // the floor's thickness over the ground
const lamp = ({ lights }, at, k = 1) => lights.push({ at, color: '#ffb46b', intensity: 3.2 * k, distance: 9 });

// ── the frescoes ─────────────────────────────────────────────────────────────────────────────
/** shields: the figure-of-eight shields of ox-hide in a row over a white ground, red and black stripes framing them (the Hall of the Double Axes). */
FRESCO.shields = (w, h) => {
  const out = { [RED]: [], [BLK]: [], paint_ochre: [], hide_tan: [] }, b = 0.06;
  for (const [v0, v1, m] of [[0, b, RED], [b, b + 0.03, BLK], [h - b - 0.03, h - b, BLK], [h - b, h, RED]]) out[m].push([poly([-w / 2, v0], [w / 2, v0], [w / 2, v1], [-w / 2, v1]), 0.4]);
  const sh = h - 2 * b - 0.2, n = Math.max(1, Math.floor(w / 1.1));
  for (let i = 0; i < n; i++) {
    const u = -w / 2 + (i + 0.5) * w / n, y0 = b + 0.12, lobe = sh * 0.27;
    // two lobes joined at a waist, the hide dappled
    out.paint_ochre.push([ell(u, y0 + lobe, lobe * 0.95, lobe, 12), 1], [ell(u, y0 + sh - lobe, lobe * 0.95, lobe, 12), 1], [poly([u - lobe * 0.62, y0 + lobe], [u + lobe * 0.62, y0 + lobe], [u + lobe * 0.5, y0 + sh - lobe], [u - lobe * 0.5, y0 + sh - lobe]), 1.05]);
    out.hide_tan.push([ell(u - 0.07, y0 + lobe + 0.05, 0.09, 0.07, 7), 1.3], [ell(u + 0.08, y0 + sh - lobe - 0.02, 0.08, 0.06, 7), 1.3], [ell(u, y0 + sh * 0.5, 0.06, 0.05, 6), 1.3]);
    out[BLK].push([poly([u - 0.035, y0 + sh * 0.2], [u + 0.035, y0 + sh * 0.2], [u + 0.035, y0 + sh * 0.8], [u - 0.035, y0 + sh * 0.8]), 1.2]);
  }
  return Object.entries(out).map(([mat, parts]) => ({ mat, parts }));
};
/** axes: double axes, blade over blade on a shaft, in blue and red alternately on a pale ground, a band of black and white below. */
FRESCO.axes = (w, h) => {
  const out = { 'egyptian_blue': [], [RED]: [], [BLK]: [], paint_white: [] }, b = 0.12;
  for (let i = 0; i < 12; i++) { const u0 = -w / 2 + i * w / 12; out[i % 2 ? BLK : 'paint_white'].push([poly([u0, 0], [u0 + w / 12, 0], [u0 + w / 12, b], [u0, b]), 0.5]); }
  const n = Math.max(1, Math.floor(w / 0.9)), cy = b + (h - b) / 2, s = Math.min(0.5, (h - b) / 1.3);
  for (let i = 0; i < n; i++) {
    const u = -w / 2 + (i + 0.5) * w / n, m = i % 2 ? RED : 'egyptian_blue';
    out[m].push([poly([u - 0.03 * s, cy + 0.04 * s], [u - 0.44 * s, cy + 0.3 * s], [u - 0.4 * s, cy - 0.3 * s], [u - 0.03 * s, cy - 0.04 * s]), 1], [poly([u + 0.03 * s, cy - 0.04 * s], [u + 0.4 * s, cy - 0.3 * s], [u + 0.44 * s, cy + 0.3 * s], [u + 0.03 * s, cy + 0.04 * s]), 1],
      [poly([u - 0.03 * s, cy - 0.7 * s], [u + 0.03 * s, cy - 0.7 * s], [u + 0.03 * s, cy + 0.7 * s], [u - 0.03 * s, cy + 0.7 * s]), 1.1]);
  }
  return Object.entries(out).map(([mat, parts]) => ({ mat, parts }));
};

// ── small things ─────────────────────────────────────────────────────────────────────────────
const cache = new Map();
const memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k).clone(); };
/** The double axe of bronze on a stand: a gypsum base, a wooden post, the shaft and the two crescent-flared blades (the cult object). */
function doubleAxe(ctx, x, z, y, rot = 0) {
  const { bag, col } = ctx;
  bag.add(G, box(x - 0.3, y, z - 0.3, x + 0.3, y + 0.35, z + 0.3)); bag.add('wood_dark', box(x - 0.08, y + 0.35, z - 0.08, x + 0.08, y + 1.3, z + 0.08));
  const blade = merge([prism([[-0.03, -0.05], [-0.34, -0.24], [-0.38, 0.0], [-0.34, 0.24], [-0.03, 0.05]], 0.02, true), prism([[0.03, -0.05], [0.34, -0.24], [0.38, 0.0], [0.34, 0.24], [0.03, 0.05]].reverse(), 0.02, true)]);
  const g = toPlane(blade, [0, 1.3, -0.01], [Math.cos(rot), 0, Math.sin(rot)], [-Math.sin(rot), 0, Math.cos(rot)]).translate(x, y, z);
  bag.add('bronze', g); bag.add('bronze', box(x - 0.025, y + 1.0, z - 0.025, x + 0.025, y + 1.62, z + 0.025));
  col.rect([x - 0.3, z - 0.3, x + 0.3, z + 0.3], y, y + 1.3);
}
function stool(ctx, x, z, y, h = 0.42, r = 0.2) {
  const { bag, col } = ctx;
  bag.add('wood_dark', box(x - r, y + h - 0.05, z - r, x + r, y + h, z + r));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('wood_dark', box(x + dx * r * 0.8 - 0.025, y, z + dz * r * 0.8 - 0.025, x + dx * r * 0.8 + 0.025, y + h - 0.05, z + dz * r * 0.8 + 0.025));
  col.rect([x - r, z - r, x + r, z + r], y, y + h);
}
function table(ctx, rect, y, h, top = 'timber') {
  const { bag, col } = ctx, [x0, z0, x1, z1] = rect;
  bag.add(top, box(x0, y + h - 0.06, z0, x1, y + h, z1));
  for (const x of [x0 + 0.08, x1 - 0.08]) for (const z of [z0 + 0.08, z1 - 0.08]) bag.add('wood_dark', box(x - 0.04, y, z - 0.04, x + 0.04, y + h - 0.06, z + 0.04));
  col.rect(rect, y + h - 0.08, y + h);
}
/** a vase turned from a profile (radius, height), scaled; stone material. */
function vase(bag, mat, prof, x, y, z, s = 1) { bag.add(mat, lathe(prof.map(([r, h]) => [r * s, h * s]), 14, null, x, y, z)); }
const EWER = [[0.001, 0], [0.06, 0], [0.1, 0.04], [0.12, 0.14], [0.09, 0.24], [0.05, 0.3], [0.07, 0.34], [0.05, 0.34], [0.04, 0.3], [0.001, 0.29]];
const RHYTON = [[0.001, 0], [0.012, 0], [0.04, 0.12], [0.075, 0.28], [0.085, 0.3], [0.07, 0.3], [0.04, 0.27], [0.001, 0.26]];
const BOWL = [[0.001, 0], [0.06, 0], [0.12, 0.05], [0.15, 0.1], [0.14, 0.1], [0.11, 0.06], [0.001, 0.02]];
const LAMP = [[0.001, 0], [0.08, 0], [0.12, 0.06], [0.14, 0.1], [0.12, 0.1], [0.07, 0.07], [0.001, 0.06]];
const ROUGH = [[0.001, 0], [0.1, 0], [0.12, 0.1], [0.13, 0.2], [0.1, 0.26], [0.001, 0.27]];            // a vase block, the outside cut, the inside not yet

/** The piers of a pier-and-door partition along x = x (the room to the west), the rows of doors between, a beam over. */
function pierRow(ctx, x, z0, z1, y, h) {
  const { bag, col } = ctx, n = 5, w = 0.7;
  for (let i = 0; i < n; i++) {
    const zc = z0 + w / 2 + i * (z1 - z0 - w) / (n - 1), r = [x - 0.35, zc - w / 2, x + 0.35, zc + w / 2];
    bag.add(G, box(r[0], y, r[1], r[2], y + 0.5, r[3])); bag.add('plaster_white', box(r[0] + 0.01, y + 0.5, r[1] + 0.01, r[2] - 0.01, y + h - 0.5, r[3] - 0.01));
    bag.add('timber', box(r[0], y + h - 0.5, r[1], r[2], y + h - 0.4, r[3])); col.rect(r, y, y + h);
  }
  bag.add('timber', box(x - 0.4, y + h - 0.4, z0, x + 0.4, y + h, z1));
}

// ── the residential hall ─────────────────────────────────────────────────────────────────────
/**
 * double_axe_hall: { rect (the room), well (the light well beyond its east partition), y, seed } — the hall of the king's
 * household: gypsum slabs underfoot, a gypsum dado under the frieze of figure-of-eight shields (north wall) and of
 * double axes (south and west), the pier-and-door partition opening east onto the light well with its pots of plants,
 * a high-backed wooden chair with a footstool, the low table with a bronze bowl, woven rugs, a gypsum bench with
 * cushions, the double axe on its stand, a warp-weighted loom against the south wall with its clay weights, a chest, a pithos, lamps.
 */
function hall(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, [wx0, wz0, wx1, wz1] = el.well, y = el.y ?? 0, f = y + F0, rand = rng(el.seed || 5), door = el.door ?? [18.5, 21];
  bag.add('flagstone', box(x0, y, z0, x1, f, z1)); col.floor(el.rect, f);
  bag.add('flagstone', box(wx0, y, wz0, wx1, f, wz1)); col.floor(el.well, f);
  // the dado of gypsum, the frieze above it
  const dado = (r) => bag.add(G, box(r[0], f, r[1], r[2], f + 0.9, r[3]));
  dado([x0, z0, x1 - 0.4, z0 + 0.05]); dado([x0, z1 - 0.05, x1 - 0.4, z1]); dado([x0, z0, x0 + 0.05, door[0]]); dado([x0, door[1], x0 + 0.05, z1]);
  fresco({ kind: 'shields', at: [(x0 + x1) / 2 - 0.2, z0], face: 's', y0: f + 1.05, w: x1 - x0 - 1.2, h: 1.5, bg: 'plaster_white' }, ctx);
  fresco({ kind: 'axes', at: [(x0 + x1) / 2 - 0.2, z1], face: 'n', y0: f + 1.05, w: x1 - x0 - 1.2, h: 1.2, bg: 'plaster_white' }, ctx);
  pierRow(ctx, x1 - 0.5, z0, z1, f, 3.4);
  // the light well: pots of plants at its foot, a bench under the east wall
  for (const [px, pz, k] of [[wx1 - 0.6, wz0 + 0.7, 0], [wx1 - 0.6, wz1 - 0.7, 1], [wx0 + 1.2, (wz0 + wz1) / 2, 2]]) {
    bag.add('terracotta', lathe([[0.18, 0], [0.3, 0.2], [0.34, 0.44], [0.3, 0.46], [0.001, 0.4]], 12, null, px, f, pz));
    bag.add('fresco_green', lathe([[0.001, 0], [0.34, 0.1], [0.4, 0.34 + k * 0.05], [0.28, 0.62], [0.001, 0.78]], 8, null, px, f + 0.44, pz)); col.circle(px, pz, 0.32, f, f + 0.9);
  }
  // the chair against the north wall, a footstool before it
  const cx = x1 - 4.4, cz = z0 + 0.4;
  bag.add('wood_dark', box(cx - 0.3, f + 0.4, cz - 0.28, cx + 0.3, f + 0.46, cz + 0.28)); bag.add('wood_dark', box(cx - 0.3, f + 0.46, cz - 0.3, cx + 0.3, f + 1.3, cz - 0.24));
  bag.add('wood_painted', box(cx - 0.34, f + 1.3, cz - 0.31, cx + 0.34, f + 1.38, cz - 0.23)); bag.add(RED, box(cx - 0.29, f + 0.7, cz - 0.236, cx + 0.29, f + 0.78, cz - 0.23));
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) bag.add('wood_dark', box(cx + dx * 0.27 - 0.03, f, cz + dz * 0.25 - 0.03, cx + dx * 0.27 + 0.03, f + 0.4, cz + dz * 0.25 + 0.03));
  bag.add('cloth_red', box(cx - 0.27, f + 0.46, cz - 0.24, cx + 0.27, f + 0.52, cz + 0.26)); col.rect([cx - 0.34, cz - 0.31, cx + 0.34, cz + 0.3], f, f + 1.38);
  stool(ctx, cx, cz + 1.0, f, 0.18, 0.2);
  // the low table of offerings with a bronze bowl and a rhyton
  table(ctx, [cx + 1.5, z0 + 0.5, cx + 2.3, z0 + 1.1], f, 0.5, 'wood_painted');
  vase(bag, 'bronze', BOWL, cx + 1.75, f + 0.5, z0 + 0.8, 1.2); vase(bag, 'serpentine', RHYTON, cx + 2.1, f + 0.5, z0 + 0.8, 1);
  // two rugs: a large one before the chair, a small one at the partition
  for (const [rx, rz, w, d, c1, c2] of [[cx - 4.2, z0 + 4.2, 3.4, 2.4, 'cloth_red', 'cloth_indigo'], [x0 + 3.2, z1 - 3.2, 2.0, 1.4, 'cloth_indigo', 'cloth_ochre']]) {
    bag.add(c2, box(rx - w / 2, f, rz - d / 2, rx + w / 2, f + 0.012, rz + d / 2)); bag.add(c1, box(rx - w / 2 + 0.14, f + 0.012, rz - d / 2 + 0.14, rx + w / 2 - 0.14, f + 0.02, rz + d / 2 - 0.14));
    bag.add('cloth_white', box(rx - w / 2 + 0.3, f + 0.02, rz - 0.04, rx + w / 2 - 0.3, f + 0.024, rz + 0.04));
  }
  // the gypsum bench along the south wall with cushions
  const bz = z1 - 0.55;
  bag.add(G, box(x0 + 1.6, f, bz, x0 + 9.4, f + 0.4, z1 - 0.06)); bag.add(G, box(x0 + 1.58, f + 0.4, bz - 0.02, x0 + 9.42, f + 0.46, z1 - 0.06)); col.rect([x0 + 1.6, bz, x0 + 9.4, z1 - 0.06], f, f + 0.46);
  for (let i = 0; i < 4; i++) bag.add(['cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white'][i], box(x0 + 1.9 + i * 1.9, f + 0.46, bz + 0.05, x0 + 3.2 + i * 1.9, f + 0.56, z1 - 0.12));
  // the double axe on its stand by the door
  doubleAxe(ctx, x0 + 1.3, z0 + 1.6, f, 0.4);
  // the loom against the south wall: two uprights leaning, a cross-beam, the warp hanging, the clay weights in a row
  const lx = x1 - 4.2, lz = z1 - 0.7;
  for (const dx of [-0.9, 0.9]) bag.add('wood_dark', rod([lx + dx, f, lz + 0.2], [lx + dx, f + 1.95, lz - 0.1], 0.04, 6));
  bag.add('wood_dark', rod([lx - 0.95, f + 1.9, lz - 0.09], [lx + 0.95, f + 1.9, lz - 0.09], 0.035, 6));
  for (let i = 0; i < 28; i++) bag.add('linen', box(lx - 0.8 + i * 0.0575, f + 0.3, lz + 0.02 - 0.0, lx - 0.8 + i * 0.0575 + 0.008, f + 1.88, lz + 0.03));
  bag.add('cloth_indigo', box(lx - 0.8, f + 1.05, lz + 0.015, lx + 0.8, f + 1.52, lz + 0.032)); bag.add('cloth_ochre', box(lx - 0.8, f + 1.38, lz + 0.015, lx + 0.8, f + 1.44, lz + 0.034));
  const weight = lathe([[0.001, 0], [0.04, 0], [0.05, 0.05], [0.04, 0.1], [0.001, 0.1]], 8);
  for (let i = 0; i < 9; i++) bag.add('terracotta', weight.clone().translate(lx - 0.8 + i * 0.2, f + 0.2, lz + 0.05));
  col.rect([lx - 1.0, lz - 0.15, lx + 1.0, lz + 0.35], f, f + 1.95);
  stool(ctx, lx, lz - 0.8, f, 0.32, 0.18);
  // the chest of painted wood on the north wall, a pithos and amphorae in the south-west corner
  const kx = x0 + 3.3;
  bag.add('wood_painted', box(kx, f, z0 + 0.1, kx + 1.3, f + 0.55, z0 + 0.65)); bag.add(RED, box(kx - 0.01, f + 0.4, z0 + 0.1, kx + 1.31, f + 0.46, z0 + 0.66)); bag.add('wood_dark', box(kx - 0.02, f + 0.55, z0 + 0.08, kx + 1.32, f + 0.6, z0 + 0.67)); col.rect([kx, z0 + 0.1, kx + 1.3, z0 + 0.65], f, f + 0.6);
  pithos({ at: [x0 + 0.75, z1 - 0.8], y: f, s: 0.7, rot: 1 }, ctx);
  for (const [ax, az] of [[x0 + 1.7, z1 - 0.4], [x0 + 1.5, z1 - 1.5]]) { bag.add('terracotta', lathe([[0.001, 0], [0.07, 0], [0.17, 0.2], [0.18, 0.4], [0.1, 0.58], [0.06, 0.66], [0.1, 0.7], [0.001, 0.7]], 12, null, ax, f, az)); col.circle(ax, az, 0.18, f, f + 0.7); }
  // lamps: a stand by the chair and one at the partition
  for (const [lx2, lz2] of [[cx - 1.5, z0 + 0.45], [x1 - 1.3, z1 - 0.45]]) {
    bag.add('serpentine', lathe([[0.001, 0], [0.13, 0], [0.13, 0.04], [0.05, 0.1], [0.04, 1.05], [0.12, 1.15], [0.13, 1.22], [0.11, 1.23], [0.06, 1.18], [0.001, 1.18]], 14, null, lx2, f, lz2));
    bag.add('flame', lathe([[0.001, 0], [0.012, 0.01], [0.001, 0.05]], 6, null, lx2 + 0.07, f + 1.22, lz2)); col.circle(lx2, lz2, 0.14, f, f + 1.25); lamp(ctx, [lx2, f + 1.4, lz2]);
  }
  void rand;
}

// ── the lapidary's workshop ──────────────────────────────────────────────────────────────────
/**
 * lapidary_workshop: { rect, well, y, door: [z0, z1] on its west... } — Evans's workshop of the stone-vase makers: the benches under the north wall with
 * vases at every stage (the rough block, the outside turned, the inside drilled), the stool and the vessel held for
 * the bow drill, the raw blocks of serpentine, limestone and porphyry stacked by the west wall, the water trough with sand
 * and emery, the grindstone, the shelf of finished vases on the east partition's wall, baskets and sacks, lamps.
 */
function workshop(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, [wx0, wz0, wx1, wz1] = el.well, y = el.y ?? 0, f = y + F0, rand = rng(el.seed || 9), door = el.door ?? [30.5, 32.5];
  bag.add('flagstone', box(x0, y, z0, x1, f, z1)); col.floor(el.rect, f);
  bag.add('flagstone', box(wx0, y, wz0, wx1, f, wz1)); col.floor(el.well, f);
  const dado = (r) => bag.add(G, box(r[0], f, r[1], r[2], f + 0.8, r[3]));
  dado([x0, z0, door[0], z0 + 0.05]); dado([door[1], z0, x1 - 0.4, z0 + 0.05]); dado([x0, z1 - 0.05, x1 - 0.4, z1]); dado([x0, z0, x0 + 0.05, z1]);
  pierRow(ctx, x1 - 0.5, z0, z1, f, 3.4);
  // the benches under the north wall, either side of the doorway
  const dx0 = x0;
  const benches = [[x0 + 0.3, z0 + 0.1, door[0] - 0.4, z0 + 0.95], [door[1] + 0.4, z0 + 0.1, x1 - 1.4, z0 + 0.95]];
  for (const b of benches) table(ctx, b, f, 0.9, 'timber');
  // on the benches: vases at every stage, small tools
  const stages = [ROUGH, [[0.001, 0], [0.1, 0], [0.12, 0.1], [0.13, 0.2], [0.1, 0.26], [0.08, 0.26], [0.08, 0.2], [0.001, 0.2]], EWER, BOWL, LAMP, RHYTON];
  const mats = ['serpentine', 'limestone', 'porphyry', 'serpentine', 'limestone', 'obsidian'];
  benches.forEach((b, bi) => { for (let x = b[0] + 0.4, i = 0; x < b[2] - 0.3; x += 0.55, i++) { const k = (i + bi * 3) % stages.length; vase(bag, mats[k], stages[k], x, f + 0.9, b[1] + 0.3 + rand() * 0.3, 1.0 + rand() * 0.3); } });
  for (const [tx, tz] of [[x0 + 1.2, z0 + 0.7], [door[1] + 1.4, z0 + 0.7]]) { bag.add('bronze', box(tx, f + 0.9, tz, tx + 0.22, f + 0.915, tz + 0.025)); bag.add('bronze', box(tx + 0.1, f + 0.9, tz + 0.1, tx + 0.18, f + 0.92, tz + 0.12)); bag.add('wood_dark', box(tx + 0.3, f + 0.9, tz, tx + 0.34, f + 0.93, tz + 0.2)); }
  // the shelf on the west wall above the raw blocks: finished vases
  for (const sy of [1.25, 1.85]) {
    bag.add('timber', box(x0 + 0.05, f + sy, z0 + 2.2, x0 + 0.5, f + sy + 0.05, z1 - 2.2)); for (let z = z0 + 2.4; z < z1 - 2.3; z += 1.6) bag.add('wood_dark', box(x0 + 0.05, f + sy - 0.3, z, x0 + 0.1, f + sy, z + 0.06));
    for (let z = z0 + 2.5, i = 0; z < z1 - 2.4; z += 0.5, i++) { const k = (i + (sy > 1.5 ? 2 : 0)) % 5 + 1; vase(bag, mats[k], stages[k], x0 + 0.28, f + sy + 0.05, z, 1.1); }
  }
  // the raw blocks stacked along the west wall below the shelf
  for (const [bz, kind, m] of [[z0 + 2.4, 0, 'serpentine'], [z0 + 3.6, 1, 'limestone'], [z0 + 4.8, 2, 'porphyry'], [z0 + 6.0, 0, 'limestone']]) {
    const w = 0.7 + rand() * 0.3, d = 0.7 + rand() * 0.2, h = 0.5 + rand() * 0.2;
    bag.add(m, box(x0 + 0.1, f, bz, x0 + 0.1 + w, f + h, bz + d)); col.rect([x0 + 0.1, bz, x0 + 0.1 + w, bz + d], f, f + h);
    if (kind === 1) { bag.add(m, box(x0 + 0.2, f + h, bz + 0.1, x0 + 0.2 + w * 0.6, f + h + 0.35, bz + 0.1 + d * 0.6)); }
  }
  // the middle table: a long bench with a block half cut, vases beside it, a bowl of sand; a second bench under the south wall
  table(ctx, [dx0 + 6.0, z0 + 6.2, dx0 + 10.2, z0 + 7.2], f, 0.85, 'timber');
  bag.add('porphyry', box(dx0 + 6.3, f + 0.85, z0 + 6.35, dx0 + 7.0, f + 1.15, z0 + 7.05)); vase(bag, 'serpentine', RHYTON, dx0 + 7.6, f + 0.85, z0 + 6.7, 1.4); vase(bag, 'limestone', EWER, dx0 + 8.3, f + 0.85, z0 + 6.7, 1.3); vase(bag, 'obsidian', BOWL, dx0 + 9.1, f + 0.85, z0 + 6.7, 1.3); vase(bag, 'serpentine', ROUGH, dx0 + 9.7, f + 0.85, z0 + 6.7, 1.3);
  table(ctx, [x0 + 6.5, z1 - 0.95, x0 + 12.5, z1 - 0.1], f, 0.85, 'timber');
  for (let i = 0; i < 6; i++) vase(bag, mats[(i + 2) % 6], stages[i % 6], x0 + 6.9 + i * 0.95, f + 0.85, z1 - 0.55, 1.2);
  stool(ctx, x0 + 8.0, z1 - 1.5, f, 0.4, 0.2); stool(ctx, dx0 + 8.0, z0 + 8.1, f, 0.4, 0.2);
  // the bow drill: a block with a vase half hollowed held on a low stool, the drill upright in it, the bow lying by
  const dx = x0 + 6.2, dz = z0 + 4.0;
  stool(ctx, dx, dz, f, 0.38, 0.28);
  bag.add('serpentine', lathe([[0.001, 0], [0.16, 0], [0.2, 0.15], [0.2, 0.3], [0.14, 0.36], [0.001, 0.36]], 12, null, dx, f + 0.38, dz));
  bag.add('wood_dark', rod([dx, f + 0.6, dz], [dx, f + 1.35, dz], 0.012, 6)); bag.add('bronze', box(dx - 0.012, f + 0.56, dz - 0.012, dx + 0.012, f + 0.66, dz + 0.012));
  bag.add('wood_dark', rod([dx - 0.42, f + 0.98, dz + 0.05], [dx + 0.42, f + 0.98, dz + 0.05], 0.012, 6)); bag.add('rope_fibre', box(dx - 0.42, f + 0.97, dz + 0.04, dx + 0.42, f + 0.975, dz + 0.06));
  bag.add('wood_dark', rod([dx - 0.35, f + 1.0, dz + 0.1], [dx + 0.35, f + 1.0, dz + 0.1], 0.012, 6));
  bag.add('wood_dark', box(dx - 0.1, f + 1.35, dz - 0.04, dx + 0.1, f + 1.42, dz + 0.04));
  // the trough of water with sand and emery, a stone dish on a low block beside it
  const tx = x0 + 3.0, tz = z1 - 2.4;
  bag.add('limestone', lathe([[0.001, 0], [0.5, 0], [0.62, 0.36], [0.62, 0.4], [0.5, 0.4], [0.46, 0.32], [0.001, 0.3]], 16, null, tx, f, tz)); bag.add('water', lathe([[0.001, 0], [0.46, 0], [0.001, 0.001]], 16, null, tx, f + 0.3, tz)); col.circle(tx, tz, 0.62, f, f + 0.4);
  bag.add('sacking', lathe([[0.001, 0], [0.22, 0], [0.28, 0.2], [0.2, 0.4], [0.001, 0.44]], 8, null, tx + 1.2, f, tz + 0.2)); col.circle(tx + 1.2, tz + 0.2, 0.26, f, f + 0.44);
  bag.add('wicker', lathe([[0.2, 0], [0.34, 0.3], [0.001, 0.3]], 10, null, tx + 1.9, f, tz - 0.1)); bag.add('chalk', lathe([[0.001, 0], [0.3, 0.001], [0.001, 0.12]], 8, null, tx + 1.9, f + 0.28, tz - 0.1)); col.circle(tx + 1.9, tz - 0.1, 0.32, f, f + 0.3);
  // the grindstone: a stone wheel on a trestle with its crank
  const gx = x1 - 3.4, gz = z1 - 1.5;
  for (const dz of [-0.35, 0.35]) bag.add('wood_dark', box(gx - 0.4, f, gz + dz - 0.04, gx + 0.4, f + 0.55, gz + dz + 0.04));
  bag.add('sandstone', lathe([[0.001, -0.18], [0.36, -0.18], [0.36, 0.18], [0.001, 0.18]], 20).rotateX(Math.PI / 2).translate(gx, f + 0.55, gz)); bag.add('wood_dark', rod([gx - 0.55, f + 0.55, gz], [gx + 0.55, f + 0.55, gz], 0.025, 6).rotateY(Math.PI / 2).translate(gx, 0, gz).translate(-gx, 0, -gz));
  col.rect([gx - 0.4, gz - 0.4, gx + 0.4, gz + 0.4], f, f + 0.92);
  // in the light well: a long table with a block half carved, a stool, a water jar
  table(ctx, [wx0 + 1.2, wz0 + 3.0, wx0 + 3.2, wz0 + 7.0], f, 0.8, 'timber');
  bag.add('serpentine', box(wx0 + 1.6, f + 0.8, wz0 + 3.6, wx0 + 2.4, f + 1.12, wz0 + 4.3)); vase(bag, 'porphyry', EWER, wx0 + 2.5, f + 0.8, wz0 + 5.6, 1.3); vase(bag, 'limestone', BOWL, wx0 + 2.0, f + 0.8, wz0 + 6.3, 1.2);
  stool(ctx, wx0 + 3.9, wz0 + 5.0, f, 0.4, 0.2);
  bag.add('terracotta', lathe([[0.12, 0], [0.2, 0.15], [0.19, 0.3], [0.17, 0.31], [0.001, 0.31]], 12, null, wx1 - 0.6, f, wz1 - 0.6)); col.circle(wx1 - 0.6, wz1 - 0.6, 0.2, f, f + 0.32);
  // lamps
  for (const [lx, lz] of [[x0 + 3.0, z0 + 0.5], [x1 - 2.2, z0 + 0.5], [x1 - 2.2, z1 - 0.4]]) {
    bag.add('serpentine', lathe([[0.001, 0], [0.13, 0], [0.13, 0.04], [0.05, 0.1], [0.04, 0.95], [0.12, 1.05], [0.13, 1.12], [0.11, 1.13], [0.06, 1.08], [0.001, 1.08]], 14, null, lx, f, lz));
    bag.add('flame', lathe([[0.001, 0], [0.012, 0.01], [0.001, 0.05]], 6, null, lx + 0.07, f + 1.12, lz)); col.circle(lx, lz, 0.14, f, f + 1.15); lamp(ctx, [lx, f + 1.3, lz], 0.85);
  }
}

Object.assign(STYLES.minoan.elements, { double_axe_hall: hall, lapidary_workshop: workshop });
