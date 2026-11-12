// Çatalhöyük — the working ground between and round the houses (docs/settlements/catalhoyuk.md §5, §7, §11): the courts (a trade each:
// baking, potting, knapping obsidian, working hides, matting reeds), the yards of the town's edge, the scatter of work on the trodden
// ring round it, and the reed landings of the marsh. Everything here is low and instanced-by-merge; the small things are fine detail.
import { box, lathe, rod } from '../../core/geom.js';
import { MUD, LOG, REED, BONE, ASH, rng, dome, basket, jar, onFace } from './kit.js';

/** A drying rack: two posts and a rail 1.5 m up, along x (or z), with strings of what dries on it. */
export function rack(bag, col, x, z, len, alongZ, goods, rand) {
  const ax = alongZ ? 0 : 1, az = alongZ ? 1 : 0;
  for (const s of [0, len]) bag.add(LOG, rod([x + ax * s, 0, z + az * s], [x + ax * s, 1.7, z + az * s], 0.045, 5));
  bag.add(LOG, rod([x, 1.55, z], [x + ax * len, 1.55, z + az * len], 0.03, 5));
  bag.add(LOG, rod([x, 0.9, z], [x + ax * len, 0.9, z + az * len], 0.025, 4));
  const n = Math.floor(len / 0.3);
  for (let q = 1; q < n; q++) {
    const px = x + ax * q * 0.3 + (rand() - 0.5) * 0.05, pz = z + az * q * 0.3 + (rand() - 0.5) * 0.05;
    if (goods === 'hide') bag.add(['hide_tan', 'hide_brown', 'hide_white'][q % 3], box(px - 0.02 * az - 0.12 * ax, 0.7, pz - 0.02 * ax - 0.12 * az, px + 0.02 * az + 0.12 * ax, 1.52, pz + 0.02 * ax + 0.12 * az));
    else if (goods === 'fish') { bag.add('rope_fibre', rod([px, 1.55, pz], [px, 1.2, pz], 0.008, 3)); bag.add('chalk', rod([px, 1.2, pz], [px, 0.95, pz], 0.025, 4)); }
    else bag.add('thatch', rod([px, 1.52, pz], [px + 0.04, 0.8 + rand() * 0.2, pz], 0.03, 4));
  }
  col.segment([x, z], [x + ax * len, z + az * len], 0.12, 0, 1.7);
}
/** A stack of mud bricks (45 × 20 × 10 cm) in rows, some in the lime of fresh mortar. */
export function bricks(bag, col, x, z, nx, ny, yaw0) {
  const c = Math.cos(yaw0), s = Math.sin(yaw0);
  for (let k = 0; k < ny; k++) for (let i = 0; i < nx - (k >> 1); i++) {
    const lx = i * 0.46 + (k & 1) * 0.23, lz = (k % 2) * 0.01, px = x + lx * c, pz = z + lx * s + lz;
    bag.add('mudbrick', rod([px, 0.05 + k * 0.1, pz], [px + 0.42 * c, 0.05 + k * 0.1, pz + 0.42 * s], 0.09, 4));
  }
  col.circle(x + 0.23 * nx * c, z + 0.23 * nx * s, 0.3 * nx, 0, 0.1 * ny);
}
/** A ring of stones with a fire laid in it. */
export function firepit(bag, x, z, r = 0.34) {
  for (let q = 0; q < 8; q++) { const a = q * 0.785; bag.add('granite_rough', lathe([[0.001, 0], [0.09, 0.01], [0.07, 0.1], [0.001, 0.12]], 5, null, x + Math.cos(a) * r, 0, z + Math.sin(a) * r)); }
  bag.add(ASH, lathe([[r, 0.01], [0.001, 0.03]], 10, null, x, 0, z));
  for (let q = 0; q < 3; q++) { const a = q * 2.1; bag.add('bark_dark', rod([x + Math.cos(a) * 0.25, 0.06, z + Math.sin(a) * 0.25], [x + Math.cos(a + 0.4) * 0.03, 0.1, z + Math.sin(a + 0.4) * 0.03], 0.022, 4)); }
}
/** A lean-to shade of poles and a reed mat roof, 2.4 × 1.8 m, along x or z, open on the south. */
export function shade(bag, col, x, z, w, d, rand) {
  for (const [a, b, h] of [[0, 0, 2.2], [w, 0, 2.2], [0, d, 1.5], [w, d, 1.5]]) bag.add(LOG, rod([x + a, 0, z + b], [x + a, h, z + b], 0.05, 5));
  bag.add(REED, rod([x - 0.1, 2.2, z], [x + w + 0.1, 2.2, z], 0.03, 4)); bag.add(REED, rod([x - 0.1, 1.5, z + d], [x + w + 0.1, 1.5, z + d], 0.03, 4));
  for (let q = 0; q <= 8; q++) { const u = q / 8; bag.add(q % 2 ? REED : 'thatch', rod([x - 0.1 + u * (w + 0.2), 2.2, z - 0.05], [x - 0.1 + u * (w + 0.2) + (rand() - 0.5) * 0.05, 1.5, z + d + 0.15], 0.07, 5)); }
  for (const a of [0, w]) col.circle(x + a, z, 0.12, 0, 2.2);
}
/** Wattle screen: posts and woven withies, 1.1 m high. */
export function screen(bag, col, a, b, rand) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.ceil(L / 1.2), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let i = 0; i <= n; i++) { const u = i / n * L; bag.add(LOG, rod([a[0] + ux * u, -0.1, a[1] + uz * u], [a[0] + ux * u, 1.15 + rand() * 0.1, a[1] + uz * u], 0.04, 5)); }
  for (const [y0, y1] of [[0.25, 0.37], [0.5, 0.62], [0.75, 0.87]]) onFace(bag, 'wicker', a, b, 0, 0, 0, L, y0, y1, 0.06);
  col.segment(a, b, 0.15, 0, 1.1);
}
/** A heap of reed bundles standing against a post, or lying cut in a stack. */
export function reedStack(bag, x, z, rand, lying) {
  if (lying) { for (let r = 0; r < 3; r++) for (let q = 0; q < 4 - r; q++) bag.add('thatch', rod([x + q * 0.1 + r * 0.05, 0.05 + r * 0.09, z], [x + q * 0.1 + r * 0.05 + (rand() - 0.5) * 0.1, 0.05 + r * 0.09, z + 1.6], 0.045, 5)); return; }
  for (let q = 0; q < 9; q++) { const a = q * 0.7; bag.add('thatch', rod([x + Math.cos(a) * 0.2, 0, z + Math.sin(a) * 0.2], [x + Math.cos(a) * 0.04, 1.8 + rand() * 0.4, z + Math.sin(a) * 0.04], 0.035, 4)); }
  bag.add('rope_fibre', lathe([[0.2, 0.9], [0.14, 0.92], [0.2, 0.94]], 8, null, x, 0, z));
}
/** A cow's horn cores and long bones heaped, a pile of sherds. */
export function boneHeap(bag, x, z, rand) {
  dome(bag, ASH, x, 0, z, 0.55, 0.22, 1.2, 1, rand() * 3, 0.1);
  for (let q = 0; q < 10; q++) { const a = rand() * 6.28, r = rand() * 0.45, y = 0.12 + rand() * 0.1; bag.add(BONE, rod([x + Math.cos(a) * r, y, z + Math.sin(a) * r], [x + Math.cos(a) * r + Math.cos(a * 2) * 0.3, y + 0.05, z + Math.sin(a) * r + Math.sin(a * 2) * 0.3], 0.025, 4)); }
  for (let q = 0; q < 5; q++) { const a = rand() * 6.28, r = 0.3 + rand() * 0.4; bag.add('terracotta', box(x + Math.cos(a) * r, 0.02, z + Math.sin(a) * r, x + Math.cos(a) * r + 0.12, 0.05, z + Math.sin(a) * r + 0.09)); }
}
/** Potter's place: a heap of clay, a low bench with pots drying in rows, one fired (dark) on its side, a kiln-dome. */
function potter(bag, col, x0, z0, x1, z1, rand) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  dome(bag, 'earth_wall', x0 + 1.0, 0.02, z0 + 1.2, 0.7, 0.4, 1.3, 1, 0.5, 0.1);
  bag.add(MUD, box(cx - 1.4, 0, cz - 0.5, cx + 1.6, 0.35, cz + 0.05)); col.rect([cx - 1.4, cz - 0.5, cx + 1.6, cz + 0.05], 0, 0.35);
  for (let q = 0; q < 7; q++) jar(bag, cx - 1.2 + q * 0.42, 0.35, cz - 0.25, 0.6 + (q % 3) * 0.1, q % 4 === 3 ? 'pottery_dark' : 'terracotta');
  dome(bag, MUD, x1 - 1.2, 0.02, z1 - 1.2, 0.7, 0.8, 1, 1, 0, 0.04); bag.add('opening', box(x1 - 1.9, 0.12, z1 - 1.35, x1 - 1.55, 0.4, z1 - 1.05)); col.circle(x1 - 1.2, z1 - 1.2, 0.75, 0, 0.8);
  for (let q = 0; q < 4; q++) jar(bag, cx - 0.5 + q * 0.4, 0.03, cz + 1.4 + (q % 2) * 0.25, 0.8 + rand() * 0.3, q % 2 ? 'terracotta' : 'pottery_dark');
  basket(bag, x0 + 0.8, 0.03, z1 - 0.9, 0.25, 'cloth_ochre');
}
/** Knapper's court: obsidian cores in a basket, flakes in drifts, anvil stones, a heap of nodules, a bench. */
function knapperCourt(bag, col, x0, z0, x1, z1, rand) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (const [dx, dz] of [[-0.9, 0.2], [0.5, -0.6], [1.2, 0.9]]) {
    bag.add('granite_rough', lathe([[0.001, 0], [0.2, 0.01], [0.16, 0.12], [0.001, 0.14]], 8, null, cx + dx, 0.03, cz + dz));
    for (let q = 0; q < 16; q++) { const a = rand() * 6.28, r = 0.15 + rand() * 0.7, c = rand() < 0.25 ? 'chalk' : 'obsidian'; bag.add(c, rod([cx + dx + Math.cos(a) * r, 0.035, cz + dz + Math.sin(a) * r], [cx + dx + Math.cos(a) * r + Math.cos(a * 3) * 0.1, 0.04, cz + dz + Math.sin(a) * r + Math.sin(a * 3) * 0.1], 0.011, 4)); }
  }
  for (let q = 0; q < 7; q++) bag.add('obsidian', lathe([[0.001, 0], [0.1, 0.01], [0.08, 0.12], [0.001, 0.15]], 5, null, x0 + 0.7 + (q % 3) * 0.24, 0.03, z0 + 0.7 + (q >> 1) * 0.18));
  basket(bag, x1 - 0.9, 0.03, z0 + 0.9, 0.26, 'obsidian'); basket(bag, x1 - 1.4, 0.03, z0 + 0.7, 0.2);
  bag.add(MUD, box(x1 - 1.4, 0, cz, x1 - 0.6, 0.4, cz + 2.2)); col.rect([x1 - 1.4, cz, x1 - 0.6, cz + 2.2], 0, 0.4);
}
/** Hide-working: a frame with a hide stretched on it, a trough, scraping stones, a pile of fleeces, a pegged hide. */
function hideCourt(bag, col, x0, z0, x1, z1, rand) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  for (const [a, b] of [[cx - 1.2, cz - 1.0], [cx + 1.2, cz - 1.0], [cx - 1.2, cz + 1.0], [cx + 1.2, cz + 1.0]]) bag.add(LOG, rod([a, 0, b], [a, 1.4, b], 0.04, 5));
  bag.add(LOG, rod([cx - 1.2, 1.4, cz - 1.0], [cx + 1.2, 1.4, cz - 1.0], 0.03, 5)); bag.add(LOG, rod([cx - 1.2, 0.2, cz - 1.0], [cx + 1.2, 0.2, cz - 1.0], 0.03, 5));
  bag.add('hide_tan', box(cx - 1.15, 0.25, cz - 1.03, cx + 1.15, 1.35, cz - 1.0));
  bag.add('hide_brown', box(x0 + 0.5, 0.02, z0 + 0.6, x0 + 1.9, 0.045, z0 + 1.6));
  for (const [dx, dz] of [[0, 0], [1.4, 0], [0, 1.0], [1.4, 1.0]]) bag.add(LOG, rod([x0 + 0.5 + dx, 0.02, z0 + 0.6 + dz], [x0 + 0.5 + dx, 0.09, z0 + 0.6 + dz], 0.02, 4));
  bag.add(MUD, box(x1 - 1.9, 0, cz + 0.3, x1 - 0.6, 0.3, cz + 0.8)); col.rect([x1 - 1.9, cz + 0.3, x1 - 0.6, cz + 0.8], 0, 0.3);
  bag.add('hide_white', box(x1 - 1.8, 0.3, cz + 0.35, x1 - 0.8, 0.38, cz + 0.75)); bag.add('hide_grey', box(cx - 0.6, 0.03, cz + 1.4, cx + 0.2, 0.12, cz + 1.9));
  for (let q = 0; q < 3; q++) bag.add('obsidian', box(x0 + 1.0 + q * 0.2, 0.03, z1 - 0.8, x0 + 1.12 + q * 0.2, 0.05, z1 - 0.7));
}
/** Matting and basketry: a loom frame of reed on the ground, stacks of reed, half-woven mats, baskets in a heap. */
function reedCourt(bag, col, x0, z0, x1, z1, rand) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  reedStack(bag, x0 + 0.9, z0 + 0.9, rand, true); reedStack(bag, x1 - 1.0, z0 + 1.0, rand, false);
  bag.add(REED, box(cx - 1.0, 0.03, cz - 0.4, cx + 0.6, 0.045, cz + 0.6)); bag.add('thatch', box(cx + 0.6, 0.03, cz - 0.4, cx + 1.0, 0.04, cz + 0.6));
  for (const s of [-0.5, 0.7]) bag.add(LOG, rod([cx - 1.1, 0.02, cz + s], [cx + 1.1, 0.02, cz + s], 0.025, 4));
  for (let q = 0; q < 5; q++) basket(bag, cx - 0.9 + (q % 3) * 0.5, 0.03 + (q > 2 ? 0.2 : 0), cz + 1.5 + (q > 2 ? 0.2 : 0), 0.22 + (q % 2) * 0.05, q % 2 ? 'cloth_ochre' : null);
}
/**
 * A court: open ground in the town, plastered earth with an oven and a bench and baskets (the baker's), or by its `trade` a potter's, a
 * knapper's, a hide-worker's, a mat-maker's; always the grinding stone, a jar or two, a rack at the edge, and washing-up of the work.
 */
export function court2(bag, col, x0, z0, x1, z1, rand, trade) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  bag.add('banco_smooth', box(x0 + 0.2, -0.3, z0 + 0.2, x1 - 0.2, 0.03, z1 - 0.2));
  if (trade === 0) {
    dome(bag, MUD, cx - 1.1, 0.02, cz - 0.6, 0.8, 0.85, 1.25, 1, 0.4); bag.add('opening', box(cx - 1.3, 0.14, cz - 0.05, cx - 0.9, 0.45, cz + 0.08)); col.circle(cx - 1.1, cz - 0.6, 0.85, 0, 0.8);
    bag.add(MUD, box(x1 - 1.6, 0, cz - 1.5, x1 - 0.9, 0.42, cz + 0.6)); col.rect([x1 - 1.6, cz - 1.5, x1 - 0.9, cz + 0.6], 0, 0.42);
    basket(bag, cx + 0.8, 0.03, cz + 1.0, 0.25, 'cloth_ochre'); basket(bag, cx + 1.3, 0.03, cz + 0.6, 0.2);
    for (let q = 0; q < 4; q++) bag.add('hide_tan', lathe([[0.13, 0], [0.12, 0.03], [0.001, 0.04]], 8, null, cx - 0.6 + q * 0.04, 0.03 + q * 0.04, cz + 0.2));
    bag.add('granite_rough', box(cx - 0.4, 0.03, cz + 1.2, cx + 0.3, 0.12, cz + 1.7)); bag.add('granite_rough', lathe([[0.001, 0], [0.12, 0.01], [0.1, 0.07], [0.001, 0.08]], 8, null, cx - 0.1, 0.12, cz + 1.45));
    for (let q = 0; q < 3; q++) jar(bag, x0 + 0.7 + q * 0.5, 0.03, z0 + 0.7 + rand() * 0.2, 1 - q * 0.1, q ? 'pottery_dark' : 'terracotta');
  } else if (trade === 1) potter(bag, col, x0, z0, x1, z1, rand);
  else if (trade === 2) knapperCourt(bag, col, x0, z0, x1, z1, rand);
  else if (trade === 3) hideCourt(bag, col, x0, z0, x1, z1, rand);
  else reedCourt(bag, col, x0, z0, x1, z1, rand);
  firepit(bag, x0 + 1.0, z1 - 1.0, 0.3);
  if (z1 - z0 > 4.4) rack(bag, col, x0 + 0.5, z0 + 0.35, Math.min(x1 - x0 - 1, 3.0), false, trade === 3 ? 'hide' : rand() < 0.5 ? 'fish' : 'reed', rand);
}
/** A yard of the town's edge, where no house stands: a lean-to, a rack, bricks, a screen of wattle, whatever the household keeps. */
export function yard(bag, col, x0, z0, x1, z1, rand) {
  bag.add('banco_smooth', box(x0 + 0.1, -0.3, z0 + 0.1, x1 - 0.1, 0.02, z1 - 0.1));
  const w = x1 - x0, d = z1 - z0, r = rand();
  if (r < 0.34) { shade(bag, col, x0 + 0.8, z0 + 0.8, Math.min(2.6, w - 1.6), 1.7, rand); basket(bag, x0 + 1.4, 0.03, z0 + 2.9, 0.24, 'cloth_ochre'); jar(bag, x0 + 2.2, 0.03, z0 + 2.9, 1.2); }
  else if (r < 0.67) { rack(bag, col, x0 + 0.7, z0 + 1.0, Math.min(w - 1.4, 3.6), false, rand() < 0.5 ? 'hide' : 'fish', rand); bricks(bag, col, x0 + 0.8, z1 - 1.2, 4, 4, 0); }
  else { screen(bag, col, [x0 + 0.5, z0 + 0.5], [x1 - 0.5, z0 + 0.5], rand); reedStack(bag, x0 + 1.0, z0 + 1.6, rand, false); reedStack(bag, x0 + 2.4, z0 + 1.8, rand, true); firepit(bag, x1 - 1.4, z1 - 1.2); }
  void d;
}
/**
 * catal_edge: the trodden ring round the town { rect (the cluster), seed, gates: [[x, z, r]] to keep clear }: along every side, 4.5–9 m out,
 * the town's outwork (racks, shades, brick stacks, screens, reed stacks, bone heaps, fire pits, baskets), and within 1.8–4.5 m only flat
 * litter of work (sherds, flakes, bones, ash).
 */
export function edge(el, { bag, col }) {
  const [X0, Z0, X1, Z1] = el.rect, rand = rng(el.seed || 7), keep = el.keep || [];
  const clear = (x, z, m) => keep.some(([a, b, r]) => Math.hypot(x - a, z - b) < r + m);
  const sides = [[[X0, Z0], [X1, Z0], 0, -1], [[X0, Z1], [X1, Z1], 0, 1], [[X0, Z0], [X0, Z1], -1, 0], [[X1, Z0], [X1, Z1], 1, 0]];
  for (const [a, b, nx, nz] of sides) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    for (let u = 1.5; u < L - 1.0; u += 2.6 + rand() * 1.6) {
      const d = 5.0 + rand() * 3.5, x = a[0] + ux * u + nx * d, z = a[1] + uz * u + nz * d;
      if (clear(x, z, 2.5)) continue;
      const k = rand(), alongZ = nx !== 0;
      if (k < 0.16) rack(bag, col, x - (alongZ ? 0 : 1.5), z - (alongZ ? 1.5 : 0), 3, alongZ, ['hide', 'fish', 'reed'][Math.floor(rand() * 3)], rand);
      else if (k < 0.3) shade(bag, col, x - 1.2, z - (nz > 0 ? 0 : 0.9), 2.4, 1.8, rand);
      else if (k < 0.44) bricks(bag, col, x, z, 3 + Math.floor(rand() * 3), 3 + Math.floor(rand() * 3), alongZ ? 1.57 : 0);
      else if (k < 0.55) screen(bag, col, [x - (alongZ ? 0 : 1.6), z - (alongZ ? 1.6 : 0)], [x + (alongZ ? 0 : 1.6), z + (alongZ ? 1.6 : 0)], rand);
      else if (k < 0.66) { reedStack(bag, x, z, rand, rand() < 0.5); col.circle(x, z, 0.4, 0, 1.6); }
      else if (k < 0.74) { boneHeap(bag, x, z, rand); col.circle(x, z, 0.55, 0, 0.3); }
      else if (k < 0.84) { firepit(bag, x, z); jar(bag, x + 0.8, 0, z + 0.2, 1.1); basket(bag, x - 0.7, 0, z + 0.4, 0.22, 'cloth_ochre'); }
      else if (k < 0.92) { dome(bag, 'earth_wall', x, 0, z, 0.9, 0.5, 1.4, 1, rand() * 3, 0.1); bag.add('silt', box(x + 1.0, 0, z - 0.4, x + 1.9, 0.02, z + 0.4)); }   // a clay heap and the pit it came from
      else { for (let q = 0; q < 4; q++) jar(bag, x + (q % 2) * 0.5, 0, z + (q >> 1) * 0.5, 0.9 + rand() * 0.4, q % 3 ? 'terracotta' : 'pottery_dark'); col.circle(x + 0.25, z + 0.25, 0.6, 0, 0.5); }
    }
    // flat litter in the ring next to the walls
    for (let u = 0.8; u < L - 0.5; u += 0.9 + rand() * 1.0) {
      const d = 1.8 + rand() * 2.7, x = a[0] + ux * u + nx * d, z = a[1] + uz * u + nz * d;
      if (clear(x, z, 1.2)) continue;
      const q = rand();
      if (q < 0.3) bag.add(ASH, lathe([[0.3 + rand() * 0.4, 0], [0.001, 0.012]], 7, null, x, 0, z));
      else if (q < 0.55) bag.add('terracotta', box(x, 0.005, z, x + 0.1, 0.03, z + 0.08));
      else if (q < 0.75) bag.add(BONE, rod([x, 0.03, z], [x + Math.cos(u * 3) * 0.25, 0.04, z + Math.sin(u * 3) * 0.25], 0.02, 4));
      else bag.add('thatch', rod([x, 0.02, z], [x + Math.cos(u * 5) * 0.5, 0.025, z + Math.sin(u * 5) * 0.5], 0.02, 3));
    }
  }
}
/**
 * catal_landing: a landing on the marsh { at: [x, z] on the shore, y (the shore's height), toward: the angle into the water (radians, from +x toward +z),
 * water (the water's level), seed }: a mat of reeds laid out over the mud as a way, a pulled-up reed bundle raft, another moored by a stake,
 * fish traps (conical wicker) in the shallows, a net on a frame, bundles of cut reed, a stake with a bird snare.
 */
export function landing(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, a = el.toward, W = el.water, rand = rng(el.seed || 3);
  const dx = Math.cos(a), dz = Math.sin(a), px = -dz, pz = dx;
  const P = (s, t) => [x + dx * s + px * t, z + dz * s + pz * t];     // s into the water, t across
  // the way: reed mats laid end to end from the shore into the shallows
  for (let s = -3; s < 4; s += 1.0) { const [mx, mz] = P(s, 0); bag.add(REED, box(mx - 0.6, Math.max(y, W) + 0.02 - (s > 0 ? 0.05 : 0), mz - 0.6, mx + 0.6, Math.max(y, W) + 0.045 - (s > 0 ? 0.05 : 0), mz + 0.6)); }
  // rafts of reed bundles, pointed at the bow
  const raft = (s, t, len, floating) => {
    const base = floating ? W - 0.05 : y + 0.04;
    for (let q = -2; q <= 2; q++) {
      const lat = q * 0.2, l = len * (1 - Math.abs(q) * 0.12), [ax0, az0] = P(s - l / 2, t + lat), [ax1, az1] = P(s + l / 2, t + lat);
      bag.add(q % 2 ? 'thatch' : REED, rod([ax0, base + 0.12 + 0.03 * (2 - Math.abs(q)), az0], [ax1, base + 0.18 + 0.05 * (2 - Math.abs(q)), az1], 0.1, 6));
    }
    for (const f of [-0.3, 0, 0.3]) { const [ra, rb] = P(s + f * len, t - 0.55), [rc, rd] = P(s + f * len, t + 0.55); bag.add('rope_fibre', rod([ra, base + 0.2, rb], [rc, base + 0.2, rd], 0.02, 4)); }
    const [bx, bz] = P(s + len * 0.55, t); bag.add('thatch', rod([bx, base + 0.15, bz], [bx + dx * 0.4, base + 0.45, bz + dz * 0.4], 0.06, 5));
  };
  raft(-0.3, -1.6, 3.4, false); raft(4.5, 1.8, 3.6, true);
  const [sx, sz] = P(4.5, 0.6); bag.add(LOG, rod([sx, W - 0.5, sz], [sx, W + 1.2, sz], 0.035, 5));
  const [pa, pb] = P(3.2, 2.9); bag.add(LOG, rod([pa, W - 0.5, pb], [pa + 1.0, W + 2.2, pb + 0.2], 0.025, 4));      // a punting pole stood in the mud
  // fish traps standing in the shallows, a net drying on a frame ashore
  for (let q = 0; q < 4; q++) { const [tx, tz] = P(1.5 + q * 0.7, -2.4 + (q % 2) * 0.5); bag.add('wicker', lathe([[0.2, 0], [0.16, 0.25], [0.08, 0.55], [0.001, 0.7]], 7, null, tx, W - 0.15, tz)); }
  const [n0x, n0z] = P(-3.2, -1.0), [n1x, n1z] = P(-3.2, 2.4);
  for (const [qx, qz] of [[n0x, n0z], [n1x, n1z]]) bag.add(LOG, rod([qx, y, qz], [qx, y + 1.6, qz], 0.04, 5));
  bag.add(LOG, rod([n0x, y + 1.5, n0z], [n1x, y + 1.5, n1z], 0.03, 5));
  for (let q = 0; q <= 8; q++) { const u = q / 8, qx = n0x + (n1x - n0x) * u, qz = n0z + (n1z - n0z) * u; bag.add('rope_fibre', rod([qx, y + 1.5, qz], [qx + 0.02, y + 0.5 + (q % 3) * 0.08, qz], 0.008, 3)); }
  const [r0, r1] = P(-2.0, 3.0); reedStack(bag, r0, r1, rand, false);
  { const [bx0, bz0] = P(-1.0, 1.2); basket(bag, bx0, y + 0.02, bz0, 0.24, 'chalk'); }
  col.circle(n0x, n0z, 0.1, y, y + 1.6); col.circle(n1x, n1z, 0.1, y, y + 1.6);
}
