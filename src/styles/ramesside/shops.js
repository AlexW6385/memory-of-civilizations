// The houses and shops of Abu Simbel's camp and priests' lanes (docs/settlements/abu-simbel.md §5, §13): the Old Kingdom's mudbrick house
// (courtyard, oven, granary, bench) turned to face either lane (ram_house), painted at the door and banked with the desert's sand; and the shops
// of the market street (ram_shop) — potter, weaver, scribe, sandal-maker, jeweller, carpenter, butcher, brewer — each a room you can walk into,
// its goods on the counter at the lane, on the shelves and the floor inside, under a roof of palm logs.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { beamTris } from '../ming/index.js';
import { houseRoof } from '../oldkingdom/dress.js';
import { mirrored } from './mirror.js';
import { rng } from './util.js';

const JAR = [[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]];
const BEER = [[0.04, 0], [0.12, 0.08], [0.17, 0.35], [0.14, 0.62], [0.07, 0.72], [0.08, 0.76], [0.001, 0.76]];
const BOWL = [[0.001, 0], [0.08, 0.005], [0.17, 0.09], [0.16, 0.095], [0.07, 0.03], [0.001, 0.025]];
const BELL = [[0.001, 0], [0.1, 0.02], [0.2, 0.18], [0.14, 0.32], [0.09, 0.4], [0.1, 0.43], [0.001, 0.43]];
const jar = (bag, x, y, z, s = 1, mat = 'terracotta', prof = JAR) => bag.add(mat, lathe(prof.map(([r, h]) => [r * s, h * s]), 9, null, x, y, z));
/** A cylinder lying along x (a roll of linen, a log). */
function roll(bag, mat, x0, x1, y, z, r) { const g = lathe([[r, 0], [r, x1 - x0], [0.001, x1 - x0]], 8); g.rotateZ(-Math.PI / 2); g.translate(x0, y, z); bag.add(mat, g); }
const post = (bag, x, y0, y1, z, r = 0.05) => bag.add('palm_trunk', lathe([[r, y0], [r * 0.9, y1], [0.001, y1]], 6, null, x, 0, z));
/** A clay oil lamp (a bowl with a pinched lip) at (x, y, z) and the light of its flame; zm mirrors z for the lanes' north-facing rows. */
function oilLamp(bag, lights, x, y, z, zm = null, intensity = 3) {
  bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.012], [0.085, 0.045], [0.08, 0.06], [0.05, 0.05], [0.001, 0.045]], 8, null, x, y, z));
  lights.push({ at: [x, y + 0.12, zm === null ? z : zm - z], color: '#ffb46b', intensity, distance: 7 });
}
const ACCENT = ['paint_ochre', 'egyptian_blue', 'limewash_red', 'plaster_white', 'paint_ochre'];

/** The courtyard house of the lanes: { rect, seed, furnish, front ('s' | 'n'), wash: whitewashed front (the priests') }. */
export function ramHouse(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, c = el.front === 'n' ? mirrored(ctx, (z0 + z1) / 2) : ctx, { bag } = c;
  STYLES.oldkingdom.elements.mud_house(el, c);
  // (the Old Kingdom house's own dice: the court, the split, so where the door is)
  const r0 = rng(el.seed || 1), W = x1 - x0;
  r0(); const court = r0() < 0.7, split = court ? x0 + W * (0.45 + r0() * 0.2) : x1, xd = court ? (split + x1) / 2 : (x0 + split) / 2, dw = 0.9, th = 0.45, zf = z1 + th / 2;
  void split;
  const rand = rng((el.seed || 1) * 3 + 7), ac = ACCENT[Math.floor(rand() * ACCENT.length)];
  // the door painted: a coloured lintel board and two painted jambs on the wall, the house's colour
  bag.add(ac, box(xd - dw / 2 - 0.3, 2.12, zf + 0.004, xd + dw / 2 + 0.3, 2.44, zf + 0.016));
  for (const s of [-1, 1]) bag.add(ac, box(xd + s * (dw / 2 + 0.07) - 0.07, 0, zf + 0.004, xd + s * (dw / 2 + 0.07) + 0.07, 2.12, zf + 0.014));
  if (el.wash) {
    // the priests' fronts whitewashed to the eaves, a dado of red-ochre at the foot
    for (const [a, b] of [[x0 - th / 2, xd - dw / 2 - 0.37], [xd + dw / 2 + 0.37, x1 + th / 2]]) if (b - a > 0.2) {
      bag.add('plaster_white', box(a, 0.4, zf + 0.002, b, 2.5, zf + 0.012));
      bag.add('limewash_red', box(a, 0.0, zf + 0.002, b, 0.4, zf + 0.012));
    }
  }
  // the lit room: an oil lamp on the sitting bench (the bench's dice are mud_house's: it runs along the north wall at the room's east end)
  if (el.furnish) { const ix1 = (court ? split : x1) - 0.225; oilLamp(bag, c.lights, ix1 - 0.55, 0.38, z0 + 0.45 + 0.1, el.front === 'n' ? z0 + z1 : null, 3); }
  // a stack of bricks drying on edge against the wall; sand banked on the walls the wind blows to
  if (rand() < 0.6) {
    const bx = rand() < 0.5 ? x0 + 0.3 : x1 - 1.3, by = zf + 0.05;
    for (let k = 0; k < 3; k++) for (let i = 0; i < 4 - k; i++) bag.add('mudbrick', box(bx + k * 0.12 + i * 0.26, k * 0.12, by, bx + k * 0.12 + i * 0.26 + 0.24, k * 0.12 + 0.11, by + 0.12));
  }
  if (rand() < 0.5) bag.add('sandstone_yellow', lathe([[1, 0], [0.7, 0.14], [0.001, 0.3]], 8).scale(1.4, 1, 0.8).translate(x0 - th / 2 - 0.3, -0.02, z0 + (z1 - z0) * (0.2 + rand() * 0.6)));
  if (rand() < 0.4) bag.add('sandstone_yellow', lathe([[1, 0], [0.7, 0.12], [0.001, 0.26]], 8).scale(1.1, 1, 1.0).translate(x1 + th / 2 + 0.25, -0.02, z0 + (z1 - z0) * (0.3 + rand() * 0.4)));
}

// ── the shops ────────────────────────────────────────────────────────────────────────────────
function fit(el) {
  const [x0, z0, x1, z1] = el.rect, th = 0.45;
  return { x0, z0, x1, z1, th, W: x1 - x0, D: z1 - z0, ix0: x0 + th / 2, ix1: x1 - th / 2, iz0: z0 + th / 2, iz1: z1 - th / 2, zf: z1 + th / 2 };
}
const TRADES = {
  // pots on the shelves of the north wall, the potter's wheel on its stool, the kiln in the corner, a pyramid of jars at the door
  potter({ bag, col }, f, rand, o) {
    for (const y of [0.55, 1.2, 1.85]) {
      bag.add('timber', box(f.ix0 + 0.05, y - 0.04, f.iz0, f.ix1 - 0.05, y, f.iz0 + 0.42));
      for (let x = f.ix0 + 0.3; x < f.ix1 - 0.25; x += 0.34 + rand() * 0.12) jar(bag, x, y, f.iz0 + 0.22, 0.65 + rand() * 0.5, rand() < 0.7 ? 'terracotta' : 'pottery_dark', rand() < 0.4 ? BOWL : rand() < 0.5 ? BELL : JAR);
    }
    const wx = f.ix0 + 1.0, wz = (f.iz0 + f.iz1) / 2 + 0.2;
    bag.add('timber', lathe([[0.3, 0.3], [0.3, 0.34], [0.001, 0.34]], 14, null, wx, 0, wz)); bag.add('timber', lathe([[0.04, 0], [0.04, 0.3], [0.001, 0.3]], 6, null, wx, 0, wz));
    bag.add('terracotta', lathe([[0.001, 0.4], [0.14, 0.4], [0.17, 0.45], [0.001, 0.46]], 10, null, wx, 0, wz)); bag.add('limestone_core', box(wx + 0.5, 0, wz - 0.2, wx + 0.9, 0.3, wz + 0.2)); col.circle(wx, wz, 0.34, 0, 0.4);
    const kx = f.ix1 - 0.85, kz = f.iz1 - 1.0;
    bag.add('mudbrick', lathe([[0.7, 0], [0.7, 0.4], [0.55, 0.85], [0.3, 1.05], [0.001, 1.1]], 14, null, kx, 0, kz)); bag.add('pottery_dark', box(kx - 0.25, 0.04, kz - 0.74, kx + 0.25, 0.5, kz - 0.64)); col.circle(kx, kz, 0.72, 0, 1.1);
    // a pyramid of jars outside by the counter
    for (let k = 0; k < 6; k++) { const row = k < 3 ? 0 : k < 5 ? 1 : 2, i = k < 3 ? k : k < 5 ? k - 3 : 0; jar(bag, o.ox + (i - (row === 0 ? 1 : row === 1 ? 0.5 : 0)) * 0.4, row * 0.4, o.oz + 0.3, 0.95, 'terracotta'); }
  },
  // a ground loom: two beams on pegs with the warp between them, a half-woven cloth; bolts of linen on the shelves, baskets of flax
  weaver({ bag, col }, f, rand) {
    const lx0 = f.ix0 + 0.5, lx1 = Math.min(f.ix1 - 0.8, lx0 + 2.4), lz = (f.iz0 + f.iz1) / 2 + 0.3;
    for (const x of [lx0, lx1]) for (const z of [-0.5, 0.5]) bag.add('timber', box(x - 0.04, 0, lz + z - 0.04, x + 0.04, 0.22, lz + z + 0.04));
    bag.add('timber', box(lx0, 0.2, lz - 0.55, lx0 + 0.08, 0.26, lz + 0.55)); bag.add('timber', box(lx1 - 0.08, 0.2, lz - 0.55, lx1, 0.26, lz + 0.55));
    for (let z = lz - 0.46; z < lz + 0.46; z += 0.06) bag.add('linen', box(lx0 + 0.3, 0.215, z, lx1 - 0.1, 0.222, z + 0.012));
    bag.add('cloth_white', box(lx0 + 0.3, 0.22, lz - 0.46, lx0 + 0.9, 0.235, lz + 0.46)); bag.add('cloth_ochre', box(lx0 + 0.3, 0.221, lz - 0.46, lx0 + 0.38, 0.236, lz + 0.46));
    col.rect([lx0 - 0.05, lz - 0.6, lx1 + 0.05, lz + 0.6], 0, 0.3);
    for (const y of [0.5, 1.15, 1.8]) {
      bag.add('timber', box(f.ix0 + 0.05, y - 0.04, f.iz0, f.ix1 - 0.05, y, f.iz0 + 0.45));
      let x = f.ix0 + 0.15; while (x < f.ix1 - 0.5) { const w = 0.5 + rand() * 0.3; roll(bag, ['cloth_white', 'linen', 'cloth_ochre', 'cloth_white', 'cloth_indigo'][Math.floor(rand() * 5)], x, x + w, y + 0.12, f.iz0 + 0.22, 0.12); x += w + 0.1; }
    }
    for (const [dx, dz] of [[0.5, 0.5], [0.95, 0.35]]) bag.add('wicker', lathe([[0.17, 0], [0.22, 0.2], [0.2, 0.22], [0.001, 0.2]], 10, null, f.ix1 - dx, 0, f.iz1 - dz - 0.3));
    bag.add('flax_leaf', lathe([[0.18, 0.18], [0.12, 0.34], [0.001, 0.4]], 8, null, f.ix1 - 0.5, 0, f.iz1 - 0.8));
  },
  // the scribe: a low table, rolls of papyrus in jars and on the shelves, a palette, the stool; a writing board against the wall
  scribe({ bag, col }, f, rand) {
    const tx = (f.ix0 + f.ix1) / 2 - 0.3, tz = (f.iz0 + f.iz1) / 2;
    bag.add('timber', box(tx - 0.8, 0.5, tz - 0.4, tx + 0.8, 0.55, tz + 0.4)); for (const [dx, dz] of [[-0.72, -0.32], [0.72, -0.32], [-0.72, 0.32], [0.72, 0.32]]) bag.add('timber', box(tx + dx - 0.03, 0, tz + dz - 0.03, tx + dx + 0.03, 0.5, tz + dz + 0.03));
    col.rect([tx - 0.85, tz - 0.45, tx + 0.85, tz + 0.45], 0, 0.55);
    for (let k = 0; k < 4; k++) roll(bag, 'papyrus', tx - 0.6 + (k % 2) * 0.05, tx - 0.15 + (k % 2) * 0.05, 0.6 + (k > 1 ? 0.07 : 0), tz - 0.2 + (k % 2) * 0.12, 0.035);
    bag.add('wood_ochre', box(tx + 0.2, 0.55, tz - 0.15, tx + 0.6, 0.575, tz + 0.15)); bag.add('lacquer_black', lathe([[0.001, 0], [0.025, 0], [0.025, 0.02], [0.001, 0.02]], 8, null, tx + 0.3, 0.575, tz)); bag.add('lacquer_red', lathe([[0.001, 0], [0.025, 0], [0.025, 0.02], [0.001, 0.02]], 8, null, tx + 0.42, 0.575, tz));
    bag.add('papyrus', box(tx - 0.2, 0.55, tz + 0.1, tx + 0.15, 0.56, tz + 0.34));
    bag.add('timber', box(tx - 0.2, 0, tz + 0.7, tx + 0.2, 0.3, tz + 1.05));
    for (let y = 0.5; y < 2.0; y += 0.6) {
      bag.add('timber', box(f.ix0 + 0.05, y - 0.04, f.iz0, f.ix1 - 0.05, y, f.iz0 + 0.4));
      for (let x = f.ix0 + 0.3; x < f.ix1 - 0.3; x += 0.42) { jar(bag, x, y, f.iz0 + 0.2, 0.6, rand() < 0.5 ? 'terracotta' : 'pottery_dark'); for (let q = 0; q < 3; q++) bag.add('papyrus', lathe([[0.03, 0], [0.03, 0.3], [0.001, 0.3]], 5, null, x - 0.05 + q * 0.05, y + 0.28, f.iz0 + 0.2 + (q % 2) * 0.02)); }
    }
    bag.add('plaster_white', box(f.ix1 - 0.06, 0.9, f.iz0 + 0.8, f.ix1 - 0.02, 1.8, f.iz0 + 2.0)); bag.add('lacquer_black', box(f.ix1 - 0.065, 1.0, f.iz0 + 0.95, f.ix1 - 0.055, 1.7, f.iz0 + 1.85));
  },
  // the sandal-maker: soles of plaited papyrus hanging in pairs from a rail, hides on a pole, the last on the bench with the knives
  sandals({ bag, col }, f) {
    const y = 1.9;
    bag.add('timber', box(f.ix0 + 0.1, y, f.iz0 + 0.1, f.ix1 - 0.1, y + 0.06, f.iz0 + 0.16));
    for (let x = f.ix0 + 0.3; x < f.ix1 - 0.3; x += 0.28) { bag.add('rope_fibre', box(x, y - 0.5, f.iz0 + 0.12, x + 0.008, y, f.iz0 + 0.128)); bag.add('reed_mat', box(x - 0.05, y - 0.78, f.iz0 + 0.11, x + 0.07, y - 0.5, f.iz0 + 0.135)); }
    for (let k = 0; k < 3; k++) bag.add(['hide_tan', 'hide_brown', 'hide_tan'][k], box(f.ix1 - 0.2 - k * 0.12, 0.7, f.iz0 + 0.8, f.ix1 - 0.12 - k * 0.12, 1.9, f.iz0 + 1.6));
    const bx = (f.ix0 + f.ix1) / 2, bz = f.iz1 - 1.3;
    bag.add('timber', box(bx - 0.9, 0.42, bz - 0.28, bx + 0.9, 0.48, bz + 0.28)); for (const dx of [-0.8, 0.8]) for (const dz of [-0.2, 0.2]) bag.add('timber', box(bx + dx - 0.04, 0, bz + dz - 0.04, bx + dx + 0.04, 0.42, bz + dz + 0.04));
    col.rect([bx - 0.95, bz - 0.3, bx + 0.95, bz + 0.3], 0, 0.5);
    for (let k = 0; k < 3; k++) bag.add('reed_mat', box(bx - 0.6 + k * 0.3, 0.48, bz - 0.1, bx - 0.4 + k * 0.3, 0.5, bz + 0.18));
    for (const dx of [0.4, 0.55]) bag.add('bronze', box(bx + dx, 0.48, bz - 0.2, bx + dx + 0.18, 0.5, bz - 0.19));
    for (let k = 0; k < 4; k++) bag.add('hide_tan', box(f.ix0 + 0.15 + k * 0.12, 0, f.iz0 + 0.5, f.ix0 + 0.35 + k * 0.12, 0.05 + k * 0.05, f.iz0 + 0.9));
  },
  // the jeweller: a counter inside with trays of beads, a balance, collars of gold and carnelian on pegs, a chest
  jeweller({ bag, col }, f) {
    const cx = (f.ix0 + f.ix1) / 2, cz = f.iz0 + 1.3;
    bag.add('timber', box(cx - 1.3, 0, cz - 0.4, cx + 1.3, 0.95, cz + 0.4)); bag.add('timber', box(cx - 1.35, 0.95, cz - 0.45, cx + 1.35, 1.0, cz + 0.45)); col.rect([cx - 1.35, cz - 0.45, cx + 1.35, cz + 0.45], 0, 1.0);
    const M = ['inlay_lapis', 'inlay_carnelian', 'gold', 'inlay_jade', 'inlay_lapis', 'inlay_carnelian'];
    for (let k = 0; k < 6; k++) { bag.add('reed_mat', box(cx - 1.1 + k * 0.38, 1.0, cz - 0.3, cx - 0.78 + k * 0.38, 1.012, cz + 0.2)); for (let q = 0; q < 5; q++) bag.add(M[k], lathe([[0.001, 0], [0.025, 0.01], [0.001, 0.025]], 6, null, cx - 1.0 + k * 0.38 + (q % 3) * 0.07, 1.012, cz - 0.2 + Math.floor(q / 3) * 0.08)); }
    bag.add('bronze', box(cx + 0.9, 1.0, cz + 0.28, cx + 1.2, 1.02, cz + 0.32)); bag.add('bronze', lathe([[0.01, 0], [0.01, 0.3], [0.001, 0.3]], 5, null, cx + 1.05, 1.0, cz + 0.3));
    for (let k = 0; k < 5; k++) { bag.add('timber', box(f.ix0 + 0.3 + k * 0.5, 1.5, f.iz0 + 0.02, f.ix0 + 0.34 + k * 0.5, 1.58, f.iz0 + 0.12)); bag.add(M[k], lathe([[0.16, 0], [0.18, 0.05], [0.12, 0.2], [0.001, 0.22]], 10, null, f.ix0 + 0.32 + k * 0.5, 1.28, f.iz0 + 0.2).scale(1, 1, 0.4)); }
    bag.add('timber', box(f.ix1 - 0.9, 0, f.iz1 - 0.7, f.ix1 - 0.15, 0.55, f.iz1 - 0.2)); bag.add('bronze', box(f.ix1 - 0.6, 0.35, f.iz1 - 0.72, f.ix1 - 0.45, 0.45, f.iz1 - 0.7)); col.rect([f.ix1 - 0.9, f.iz1 - 0.7, f.ix1 - 0.15, f.iz1 - 0.2], 0, 0.55);
  },
  // the carpenter: the bench with a clamp, palm logs and planks stacked along the wall, the adzes on a rack, a chair half-built
  carpenter({ bag, col }, f) {
    const bx = f.ix0 + 1.5, bz = (f.iz0 + f.iz1) / 2;
    bag.add('timber', box(bx - 1.1, 0.78, bz - 0.35, bx + 1.1, 0.86, bz + 0.35)); for (const dx of [-1.0, 1.0]) for (const dz of [-0.28, 0.28]) bag.add('timber', box(bx + dx - 0.05, 0, bz + dz - 0.05, bx + dx + 0.05, 0.78, bz + dz + 0.05));
    col.rect([bx - 1.15, bz - 0.4, bx + 1.15, bz + 0.4], 0, 0.86);
    bag.add('bronze', box(bx - 0.5, 0.86, bz - 0.2, bx - 0.2, 0.88, bz - 0.1)); bag.add('wood_ochre', box(bx + 0.1, 0.86, bz - 0.1, bx + 0.7, 0.9, bz + 0.12));
    for (let k = 0; k < 4; k++) roll(bag, 'palm_trunk', f.ix1 - 2.2, f.ix1 - 0.2, 0.14 + (k > 2 ? 0.26 : 0), f.iz0 + 0.3 + (k % 3) * 0.28, 0.13);
    for (let k = 0; k < 6; k++) bag.add('timber', box(f.ix1 - 2.2, 0.56 + k * 0.04, f.iz0 + 0.1, f.ix1 - 0.3, 0.6 + k * 0.04, f.iz0 + 0.5));
    bag.add('timber', box(f.ix0 + 0.1, 1.5, f.iz0 + 0.02, f.ix0 + 1.6, 1.55, f.iz0 + 0.08));
    for (let k = 0; k < 5; k++) { bag.add('timber', box(f.ix0 + 0.2 + k * 0.28, 1.2, f.iz0 + 0.03, f.ix0 + 0.23 + k * 0.28, 1.5, f.iz0 + 0.07)); bag.add('bronze', box(f.ix0 + 0.15 + k * 0.28, 1.12, f.iz0 + 0.02, f.ix0 + 0.29 + k * 0.28, 1.22, f.iz0 + 0.04)); }
    const cx = f.ix1 - 1.2, cz = f.iz1 - 1.0;
    for (const [dx, dz] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]]) bag.add('wood_ochre', box(cx + dx - 0.03, 0, cz + dz - 0.03, cx + dx + 0.03, dz < 0 ? 0.9 : 0.42, cz + dz + 0.03));
    bag.add('wood_ochre', box(cx - 0.28, 0.42, cz - 0.28, cx + 0.28, 0.46, cz + 0.28)); col.rect([cx - 0.3, cz - 0.3, cx + 0.3, cz + 0.3], 0, 0.9);
  },
  // the butcher: a rack under the roof with joints, geese and strung fish; the block, the knives; a stone slab for the offal
  butcher({ bag, col }, f) {
    const y = 2.0, zr = f.iz0 + 0.9;
    bag.add('timber', box(f.ix0 + 0.1, y, zr - 0.04, f.ix1 - 0.1, y + 0.07, zr + 0.04)); for (const x of [f.ix0 + 0.12, f.ix1 - 0.2]) bag.add('timber', box(x, 0, zr - 0.04, x + 0.08, y + 0.07, zr + 0.04));
    col.rect([f.ix0 + 0.1, zr - 0.06, f.ix0 + 0.22, zr + 0.06], 0, y); col.rect([f.ix1 - 0.2, zr - 0.06, f.ix1 - 0.1, zr + 0.06], 0, y);
    for (let x = f.ix0 + 0.5, k = 0; x < f.ix1 - 0.4; x += 0.4, k++) {
      const kind = k % 3;
      if (kind === 0) { bag.add('rope_fibre', box(x, y - 0.2, zr - 0.01, x + 0.012, y, zr + 0.01)); bag.add('hide_brown', lathe([[0.001, 0], [0.12, 0.1], [0.13, 0.35], [0.06, 0.6], [0.001, 0.62]], 8, null, x, y - 0.8, zr)); bag.add('cloth_red', lathe([[0.001, 0.2], [0.125, 0.3], [0.001, 0.32]], 8, null, x, y - 0.8, zr)); }
      else if (kind === 1) { bag.add('rope_fibre', box(x, y - 0.35, zr - 0.01, x + 0.012, y, zr + 0.01)); bag.add('hide_white', lathe([[0.001, 0], [0.1, 0.06], [0.12, 0.2], [0.06, 0.32], [0.001, 0.34]], 8, null, x, y - 0.7, zr)); }
      else for (let q = 0; q < 3; q++) bag.add('hide_grey', box(x - 0.03 + q * 0.07, y - 0.55 - q * 0.04, zr - 0.03, x + 0.02 + q * 0.07, y - 0.06, zr + 0.03));
    }
    const bx = f.ix1 - 0.8, bz = f.iz1 - 0.9;
    bag.add('palm_trunk', lathe([[0.3, 0], [0.3, 0.8], [0.001, 0.8]], 10, null, bx, 0, bz)); col.circle(bx, bz, 0.3, 0, 0.8); bag.add('bronze', box(bx - 0.15, 0.8, bz - 0.01, bx + 0.1, 0.83, bz + 0.01));
    bag.add('limestone_core', box(f.ix0 + 0.4, 0, f.iz1 - 1.3, f.ix0 + 1.6, 0.25, f.iz1 - 0.6)); col.rect([f.ix0 + 0.4, f.iz1 - 1.3, f.ix0 + 1.6, f.iz1 - 0.6], 0, 0.25);
  },
  // the brewer: tall beer jars stoppered with mud in two ranks, the vats sunk in rings, the strainer and the dipper
  brewer({ bag, col }, f) {
    for (let r = 0; r < 2; r++) for (let x = f.ix0 + 0.35; x < f.ix1 - 0.3; x += 0.42) { jar(bag, x, 0, f.iz0 + 0.3 + r * 0.45, 1.05, 'terracotta', BEER); bag.add('mud_plaster', lathe([[0.09, 0], [0.09, 0.03], [0.001, 0.1]], 8, null, x, 0.76 * 1.05, f.iz0 + 0.3 + r * 0.45)); }
    col.rect([f.ix0 + 0.1, f.iz0, f.ix1 - 0.1, f.iz0 + 0.9], 0, 0.8);
    for (let k = 0; k < 2; k++) { const vx = f.ix0 + 1.0 + k * 1.6, vz = (f.iz0 + f.iz1) / 2 + 0.5; if (vx > f.ix1 - 0.8) break; bag.add('mudbrick', lathe([[0.62, 0], [0.62, 0.5], [0.5, 0.55], [0.001, 0.55]], 14, null, vx, 0, vz)); bag.add('terracotta', lathe([[0.5, 0.55], [0.56, 0.7], [0.52, 0.72], [0.4, 0.62], [0.001, 0.6]], 14, null, vx, 0, vz)); col.circle(vx, vz, 0.62, 0, 0.72); }
    bag.add('timber', box(f.ix1 - 0.9, 0.8, f.iz1 - 0.5, f.ix1 - 0.2, 0.85, f.iz1 - 0.2)); for (const dx of [-0.8, -0.25]) bag.add('timber', box(f.ix1 + dx - 0.03, 0, f.iz1 - 0.45, f.ix1 + dx + 0.03, 0.8, f.iz1 - 0.38));
    bag.add('wicker', lathe([[0.2, 0], [0.26, 0.2], [0.001, 0.2]], 10, null, f.ix1 - 0.55, 0.85, f.iz1 - 0.35));
    bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.01], [0.1, 0.08], [0.09, 0.09], [0.001, 0.04]], 8, null, f.ix1 - 0.4, 0.85, f.iz1 - 0.4));
  },
};
/** What lies on the counter at the lane, by trade. */
const COUNTER = {
  potter: (bag, x0, x1, y, z, r) => { for (let x = x0 + 0.2; x < x1 - 0.15; x += 0.3) jar(bag, x, y, z, 0.55 + r() * 0.3, r() < 0.7 ? 'terracotta' : 'pottery_dark', r() < 0.4 ? BOWL : JAR); },
  weaver: (bag, x0, x1, y, z, r) => { for (let x = x0 + 0.1; x < x1 - 0.3; x += 0.4) roll(bag, ['cloth_white', 'linen', 'cloth_ochre', 'cloth_white'][Math.floor(r() * 4)], x, x + 0.34, y + 0.1, z, 0.1); },
  scribe: (bag, x0, x1, y, z) => { for (let k = 0; k < 5; k++) roll(bag, 'papyrus', x0 + 0.15 + k * 0.1, x0 + 0.5 + k * 0.1, y + 0.04 + (k > 2 ? 0.07 : 0), z + (k % 2) * 0.1, 0.035); },
  sandals: (bag, x0, x1, y, z) => { for (let x = x0 + 0.2; x < x1 - 0.2; x += 0.3) bag.add('reed_mat', box(x, y, z - 0.1, x + 0.12, y + 0.015, z + 0.14)); },
  jeweller: (bag, x0, x1, y, z, r) => { bag.add('reed_mat', box(x0 + 0.1, y, z - 0.18, x1 - 0.1, y + 0.012, z + 0.2)); for (let x = x0 + 0.2; x < x1 - 0.2; x += 0.14) bag.add(['inlay_lapis', 'gold', 'inlay_carnelian'][Math.floor(r() * 3)], lathe([[0.001, 0], [0.03, 0.01], [0.001, 0.03]], 6, null, x, y + 0.012, z + (r() - 0.5) * 0.2)); },
  carpenter: (bag, x0, x1, y, z) => { for (let k = 0; k < 3; k++) bag.add('wood_ochre', box(x0 + 0.2 + k * 0.4, y, z - 0.12, x0 + 0.5 + k * 0.4, y + 0.22 - k * 0.04, z + 0.12)); },
  butcher: (bag, x0, x1, y, z, r) => { for (let x = x0 + 0.2; x < x1 - 0.3; x += 0.38) bag.add(r() < 0.5 ? 'hide_brown' : 'hide_white', lathe([[0.001, 0], [0.1, 0.03], [0.12, 0.1], [0.06, 0.16], [0.001, 0.17]], 8, null, x, y, z)); },
  brewer: (bag, x0, x1, y, z) => { for (let x = x0 + 0.25; x < x1 - 0.2; x += 0.42) jar(bag, x, y, z, 0.8, 'terracotta', BEER); },
};

/** A shop of the market street { rect, seed, front, trade }: a room open to the lane by its door and its counter window. */
export function ramShop(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, c = el.front === 'n' ? mirrored(ctx, (z0 + z1) / 2) : ctx, { bag, col } = c;
  const f = fit(el), rand = rng(el.seed || 5), th = f.th, h = 3.15, left = rand() < 0.5, W = f.W;
  const seg = (p, q, mat = 'mud_plaster', y0 = 0, y1 = h) => { const t = []; beamTris(t, [p[0], y0, p[1]], [q[0], y0, q[1]], th / 2, y1 - y0); bag.add(mat, fromTriangles(t)); col.segment(p, q, th, y0, y1); };
  // the three blind walls (the long ones past the corners)
  seg([x0 - th / 2, z0], [x1 + th / 2, z0]); seg([x0, z0 + th / 2], [x0, z1 - th / 2]); seg([x1, z0 + th / 2], [x1, z1 - th / 2]);
  // the front: the door beside the counter's window; u runs from the door's side
  const U = (u) => (left ? x0 + u : x1 - u), dw = 1.15, d0 = 0.5, d1 = d0 + dw, cw0 = d1 + 0.55, cw1 = Math.min(W - 0.4, cw0 + 2.3);
  const run = (ua, ub, y0, y1) => { const a = U(ua), b = U(ub); seg([Math.min(a, b), z1], [Math.max(a, b), z1], 'mud_plaster', y0, y1); };
  run(-th / 2, d0, 0, h); run(d1, cw0, 0, h); run(cw1, W + th / 2, 0, h);
  run(cw0, cw1, 0, 0.95); run(cw0, cw1, 2.15, h);                                                    // the counter's window: the wall below and above
  { const a = U(d0 - 0.25), b = U(d1 + 0.25), p = U(d0), q = U(d1);
    bag.add('timber', box(Math.min(a, b), 2.0, z1 - th / 2 - 0.02, Math.max(a, b), 2.18, z1 + th / 2 + 0.02));
    bag.add('mud_plaster', box(Math.min(p, q), 2.17, z1 - th / 2 + 0.01, Math.max(p, q), h - 0.01, z1 + th / 2 - 0.01));
    bag.add('limestone_core', box(Math.min(p, q) + 0.01, -0.05, z1 - th / 2 - 0.05, Math.max(p, q) - 0.01, 0.08, z1 + th / 2 + 0.05)); }
  { const a = U(cw0 - 0.1), b = U(cw1 + 0.1); bag.add('timber', box(Math.min(a, b), 2.05, z1 - th / 2 - 0.02, Math.max(a, b), 2.17, z1 + th / 2 + 0.02)); }
  // the counter outside: a plank on two posts of mud, the goods of the trade on it
  const cxa = Math.min(U(cw0), U(cw1)), cxb = Math.max(U(cw0), U(cw1)), cz = f.zf + 0.22;
  bag.add('timber', box(cxa - 0.1, 0.9, f.zf, cxb + 0.1, 0.95, f.zf + 0.5)); bag.add('mud_plaster', box(cxa, 0, f.zf + 0.04, cxa + 0.14, 0.9, f.zf + 0.46)); bag.add('mud_plaster', box(cxb - 0.14, 0, f.zf + 0.04, cxb, 0.9, f.zf + 0.46));
  col.rect([cxa - 0.1, f.zf, cxb + 0.1, f.zf + 0.5], 0, 0.95);
  COUNTER[el.trade]?.(bag, cxa, cxb, 0.95, cz, rand);
  // the reed shade over the counter and the door on poles, the mat sloping out
  { const a = Math.min(U(d0 - 0.2), U(cw1 + 0.2)), b = Math.max(U(d0 - 0.2), U(cw1 + 0.2)), d = f.zf + 1.05;
    post(bag, a, 0, 2.5, d); post(bag, b, 0, 2.5, d);
    const t = []; beamTris(t, [a - 0.1, 2.62, f.zf], [a - 0.1, 2.5, d + 0.2], 0.06, 0.06); beamTris(t, [b + 0.1, 2.62, f.zf], [b + 0.1, 2.5, d + 0.2], 0.06, 0.06); bag.add('timber', fromTriangles(t));
    bag.add('reed_mat', box(a - 0.2, 2.64, f.zf, b + 0.2, 2.7, d + 0.2)); col.rect([a - 0.06, d - 0.06, a + 0.06, d + 0.06], 0, 2.5); col.rect([b - 0.06, d - 0.06, b + 0.06, d + 0.06], 0, 2.5); }
  // the roof of logs under mud, its parapet, the logs seen from beneath
  bag.add('timber', box(x0 - 0.25, h, z0 - 0.25, x1 + 0.25, h + 0.12, z1 + 0.25)); bag.add('mud_plaster', box(x0 - 0.25, h + 0.12, z0 - 0.25, x1 + 0.25, h + 0.3, z1 + 0.25));
  col.floor([x0, z0, x1, z1], h + 0.3);
  houseRoof(bag, { x0, z0, rx1: x1, z1, h, seed: el.seed });
  const logs = []; for (let x = f.ix0 + 0.12; x < f.ix1 - 0.05; x += 0.26) beamTris(logs, [x, h - 0.12, f.iz0], [x, h - 0.12, f.iz1], 0.1, 0.12);
  bag.add('palm_trunk', fromTriangles(logs));
  // the foot of the walls dirtied by the lane, a mat on the floor inside by the door
  bag.add('banco_rough', box(x0 - th / 2 - 0.012, -0.05, z0 - th / 2 - 0.012, x1 + th / 2 + 0.012, 0.45, z0 - th / 2 + 0.003));
  bag.add('banco_rough', box(x0 - th / 2 - 0.012, -0.05, z0 - th / 2, x0 - th / 2 + 0.003, 0.5, z1 + th / 2)); bag.add('banco_rough', box(x1 + th / 2 - 0.003, -0.05, z0 - th / 2, x1 + th / 2 + 0.012, 0.5, z1 + th / 2));
  { const a = U(d0 - 0.1), b = U(d1 + 0.1); bag.add('reed_mat', box(Math.min(a, b), 0.004, z1 - 1.5, Math.max(a, b), 0.014, z1 - 0.3)); }
  // the lit room: a hanging oil lamp from a log of the roof, a light of its flame
  { const lx = (f.ix0 + f.ix1) / 2, lz = (f.iz0 + f.iz1) / 2 - 0.4; bag.add('timber', box(lx - 0.01, 2.55, lz - 0.01, lx + 0.01, h - 0.12, lz + 0.01)); oilLamp(bag, c.lights, lx, 2.45, lz, el.front === 'n' ? z0 + z1 : null, 3); }
  // the trade's room, and a painted board of the guild's colour over the door
  TRADES[el.trade]?.(c, f, rand, { ox: (cxa + cxb) / 2, oz: f.zf + 0.9 });
  { const a = U(d0 + dw / 2); bag.add(ACCENT[Math.floor(rand() * 4)], box(a - 0.3, 2.35, f.zf + 0.005, a + 0.3, 2.7, f.zf + 0.02)); }
}
