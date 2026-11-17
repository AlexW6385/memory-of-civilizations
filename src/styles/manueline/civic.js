// The civic buildings of Lisbon about 1520: the Ribeira palace with its loggia and the Tower of the King (the Casa da Índia), the
// Sé with its two crenellated towers, São Jorge's castle, the monastery's plain ranges, the pelourinho, a fountain, and the
// Ribeira das Naus: hulls on the stocks, timber stacks, the rope-walk, a crane. docs/settlements/manueline-lisbon.md §6.
import { box, lathe, rod, frustum, fromTriangles } from '../../core/geom.js';
import { archWall } from '../gothic/nd-interior.js';
import { tube } from '../../objects/kit.js';
import { rng, gable, armillary, orderCross, ropeColumn, wallRun, addBox, pinnacle, prism } from './util.js';

const LIME = 'limestone', WALL = 'limewash_white';
/** monastery_range: { rect, y, h } a plain two-storey range with a tile roof, regular windows. */
export function range(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 11;
  bag.add(LIME, box(x0, y - 0.6, z0, x1, y + 1.0, z1)); bag.add(WALL, box(x0, y + 1.0, z0, x1, y + h, z1)); col.rect([x0, z0, x1, z1], y - 0.6, y + h + 3);
  gable(bag, 'roof_tile', el.rect, y + h, Math.min(3.6, (Math.min(x1 - x0, z1 - z0)) * 0.3), x1 - x0 > z1 - z0, 0.7);
  bag.add('limestone_carved', box(x0 - 0.1, y + h - 0.35, z0 - 0.1, x1 + 0.1, y + h + 0.1, z1 + 0.1));
  const long = x1 - x0 > z1 - z0;
  for (let u = 3; u < (long ? x1 - x0 : z1 - z0) - 2; u += 4) for (const yy of [2.2, 6.4]) for (const s of [0, 1]) {
    if (long) { const zz = s ? z1 : z0; addBox(bag, 'opening', x0 + u, y + yy, zz - (s ? 0.05 : 0.0) - 0.0, x0 + u + 1.0, y + yy + 2.0, zz + (s ? 0.05 : 0.0) + (s ? 0 : 0.05)); addBox(bag, LIME, x0 + u - 0.15, y + yy + 2.0, zz - (s ? 0.0 : 0.12), x0 + u + 1.15, y + yy + 2.25, zz + (s ? 0.12 : 0.0)); }
    else { const xx = s ? x1 : x0; addBox(bag, 'opening', xx - (s ? 0.0 : 0.05), y + yy, z0 + u, xx + (s ? 0.05 : 0.0), y + yy + 2.0, z0 + u + 1.0); addBox(bag, LIME, xx - (s ? 0.0 : 0.12), y + yy + 2.0, z0 + u - 0.15, xx + (s ? 0.12 : 0.0), y + yy + 2.25, z0 + u + 1.15); }
  }
}
export function pelourinho(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  for (let k = 0; k < 3; k++) bag.add(LIME, box(x - 1.6 + k * 0.3, y + k * 0.22, z - 1.6 + k * 0.3, x + 1.6 - k * 0.3, y + (k + 1) * 0.22, z + 1.6 - k * 0.3));
  col.rect([x - 1.6, z - 1.6, x + 1.6, z + 1.6], y, y + 0.66);
  ropeColumn({ bag, col }, x, z, y + 0.66, 6.2, 0.32, { mat: 'limestone_yellow', carved: 'limestone_carved', turns: 6, capital: true });
  bag.add('limestone_carved', lathe([[0.7, 0], [0.5, 0.5], [0.1, 1.1], [0.001, 1.3]], 8, null, x, y + 6.9, z));
  for (let k = 0; k < 4; k++) { const t = k / 4 * Math.PI * 2; bag.add('iron', rod([x + Math.cos(t) * 0.4, y + 6.7, z + Math.sin(t) * 0.4], [x + Math.cos(t) * 0.75, y + 6.5, z + Math.sin(t) * 0.75], 0.03, 4)); }
}
export function fountain(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add(LIME, lathe([[4.2, 0], [4.2, 0.9], [3.7, 0.9], [3.7, 0.4], [0.001, 0.4]], 18, null, x, y, z)); col.circle(x, z, 4.2, y, y + 0.9);
  bag.add('water', lathe([[3.65, 0.45], [0.001, 0.45]], 18, null, x, y, z));
  bag.add('limestone_carved', lathe([[0.7, 0], [0.5, 0.5], [0.3, 1.2], [0.45, 1.6], [0.2, 2.0], [0.001, 2.2]], 10, null, x, y + 0.4, z));
  armillary(bag, 'limestone_carved', x, y + 3.2, z, 0.6);
}
// ── the shipyard ──
/** hull_stocks: { rect: [x0, z0, x1, z1] (long along x), y } a hull on the stocks: keel, stem and sternpost, ribs, part planked. */
export function hullOnStocks(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, L = x1 - x0, zc = (z0 + z1) / 2, W = (z1 - z0) / 2;
  for (let k = 0; k <= 8; k++) { const x = x0 + 2 + k * (L - 4) / 8; bag.add('timber', box(x - 0.3, y, zc - W - 0.5, x + 0.3, y + 0.5, zc + W + 0.5)); }
  const ky = y + 1.1;
  bag.add('wood_dark', box(x0 + 1, y + 0.5, zc - 0.25, x1 - 1, ky + 0.35, zc + 0.25));
  bag.add('wood_dark', rod([x0 + 1, ky, zc], [x0 - 0.8, ky + 5.2, zc], 0.22, 5)); bag.add('wood_dark', rod([x1 - 1, ky, zc], [x1 + 0.2, ky + 6.2, zc], 0.22, 5));
  const nR = Math.floor(L / 1.5);
  for (let k = 1; k < nR; k++) {
    const u = k / nR, x = x0 + 1 + u * (L - 2), f = Math.sin(Math.PI * (0.06 + 0.88 * u)), w = W * (0.15 + 0.85 * f), h = 1.6 + 3.2 * f + (u > 0.8 ? 3 * (u - 0.8) / 0.2 : 0);
    for (const s of [-1, 1]) bag.add('timber', tube(Array.from({ length: 7 }, (_, j) => { const t = j / 6; return [x, ky + t * h, zc + s * w * (Math.sin(t * Math.PI / 2) * 0.95 + 0.05 * t), 0.09]; }), 4, { capA: false, capB: false }));
    if (u < 0.45) for (const s of [-1, 1]) bag.add('wood_ochre', box(x - 0.75, ky + 0.2, zc + s * w * 0.7 - (s > 0 ? 0.0 : 0.04), x + 0.75, ky + h * 0.55, zc + s * w * 0.7 + (s > 0 ? 0.04 : 0.0)));
  }
  // the hull is solid to the walker as far as its ribs reach: a slice of the plan for each rib's span, as wide as the ribs there
  for (let k = 0; k <= nR; k++) {
    const ua = Math.max(0, (k - 0.5) / nR), ub = Math.min(1, (k + 0.5) / nR), um = (ua + ub) / 2, f = Math.sin(Math.PI * (0.06 + 0.88 * um)), w = W * (0.15 + 0.85 * f) + 0.1;
    col.rect([k === 0 ? x0 + 0.7 : x0 + 1 + ua * (L - 2), zc - w, k === nR ? x1 - 0.7 : x0 + 1 + ub * (L - 2), zc + w], y, y + 3);
  }
  for (const x of [x0 + 6, x0 + L / 2, x1 - 6]) for (const s of [-1, 1]) { bag.add('timber', rod([x, y, zc + s * (W + 1.5)], [x, y + 8, zc + s * (W + 1.5)], 0.08, 4)); col.circle(x, zc + s * (W + 1.5), 0.1, y, y + 8); }
  for (const s of [-1, 1]) for (const yy of [3, 6]) bag.add('timber', rod([x0 + 6, y + yy, zc + s * (W + 1.5)], [x1 - 6, y + yy, zc + s * (W + 1.5)], 0.06, 4));
}
export function timberStack(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 1), n = 5;
  for (let k = 0; k < n; k++) bag.add('timber', box(x0, y + k * 0.34 + (k % 2) * 0, z0 + (k % 2) * 0.3, x1 - rand() * 0.8, y + k * 0.34 + 0.3, z1 - 0.3 + (k % 2) * 0.3));
  col.rect(el.rect, y, y + n * 0.34);
}
export function ropeWalk(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  for (let x = x0; x <= x1 + 0.01; x += 4) for (const z of [z0, z1]) { bag.add('timber', box(x - 0.15, y, z - 0.15, x + 0.15, y + 3.4, z + 0.15)); col.circle(x, z, 0.2, y, y + 3.4); }
  gable(bag, 'roof_tile', [x0, z0, x1, z1], y + 3.4, 1.6, true, 0.6);
  for (let x = x0 + 2; x < x1; x += 14) bag.add('rope_fibre', rod([x, y + 1.0, (z0 + z1) / 2], [x + 12, y + 1.0, (z0 + z1) / 2], 0.05, 4));
}
export function crane(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('timber', box(x - 0.35, y, z - 0.35, x + 0.35, y + 9, z + 0.35)); col.rect([x - 0.35, z - 0.35, x + 0.35, z + 0.35], y, y + 9);
  bag.add('timber', rod([x, y + 8.6, z], [x + 6.5 * (el.dir ?? 1), y + 7.0, z], 0.12, 5)); bag.add('timber', rod([x, y + 9.2, z], [x + 6.5 * (el.dir ?? 1), y + 7.0, z], 0.07, 4));
  bag.add('rope_fibre', rod([x + 6.4 * (el.dir ?? 1), y + 7.0, z], [x + 6.4 * (el.dir ?? 1), y + 2.2, z], 0.03, 4));
  bag.add('iron', box(x + 6.2 * (el.dir ?? 1), y + 1.9, z - 0.2, x + 6.6 * (el.dir ?? 1), y + 2.3, z + 0.2));
  bag.add('wood_dark', lathe([[1.3, 0], [1.3, 1.0]], 10, null, x + 2.5, y, z + 1.6));
}
/**
 * masons_yard: { rect: [x0, z0, x1, z1], y, seed } — the lodge of the masons at the church's west end, where the works of the Jerónimos
 * went on for decades (docs/settlements/manueline-lisbon.md §3): blocks of lioz in ranked stacks and single ones squared on trestles,
 * chips of stone on the ground, an open shed of posts and planks over the banker benches, a tripod hoist with a block slung under it,
 * a ladder and a heap of lime.
 */
export function masonsYard(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, rand = rng(el.seed ?? 1), M = 'limestone_yellow';
  // the stacks of rough blocks along the north side, in ranks of different heights
  for (let k = 0, x = x0 + 0.5; x < x1 - 3; k++) {
    const w = 1.8 + rand() * 1.4, h = 0.5 + Math.floor(rand() * 3) * 0.5, d = 1.1 + rand() * 0.4;
    for (let r = 0; r < Math.round(h / 0.5); r++) bag.add(r % 2 ? 'limestone' : M, box(x + r * 0.05, y + r * 0.5, z0 + 0.4, x + w - r * 0.05, y + r * 0.5 + 0.48, z0 + 0.4 + d));
    col.rect([x, z0 + 0.4, x + w, z0 + 0.4 + d], y, y + h);
    x += w + 0.35 + rand() * 0.5;
  }
  // the open shed: four posts, a pent roof of planks, the bankers (working benches) with a block each
  const sx0 = x0 + 1.0, sz0 = z0 + 3.6, sx1 = sx0 + 6.5, sz1 = sz0 + 4.2;
  for (const [px, pz, h] of [[sx0, sz0, 3.2], [sx1, sz0, 3.2], [sx0, sz1, 2.6], [sx1, sz1, 2.6]]) { bag.add('timber', box(px - 0.1, y, pz - 0.1, px + 0.1, y + h, pz + 0.1)); col.rect([px - 0.12, pz - 0.12, px + 0.12, pz + 0.12], y, y + h); }
  bag.add('timber', frustum([sx0 - 0.5, sz0 - 0.4, sx1 + 0.5, sz1 + 0.5], y + 2.6, y + 3.35, 0, 0, 0, 0, { noBottom: true }));
  for (const bx of [sx0 + 1.6, sx0 + 4.9]) { bag.add('timber', box(bx - 0.9, y, sz0 + 1.6, bx + 0.9, y + 0.8, sz0 + 2.4)); bag.add(M, box(bx - 0.65, y + 0.8, sz0 + 1.7, bx + 0.65, y + 1.25, sz0 + 2.3)); col.rect([bx - 0.9, sz0 + 1.6, bx + 0.9, sz0 + 2.4], y, y + 1.25); }
  // chips and dust on the ground under the shed
  for (let k = 0; k < 16; k++) { const cx = sx0 + 0.6 + rand() * 5.4, cz = sz0 + 0.8 + rand() * 3, s = 0.08 + rand() * 0.1; bag.add('limestone', box(cx, y, cz, cx + s * 1.6, y + s, cz + s)); }
  // the tripod hoist, a block slung under it by a rope, and a ladder against the stacks
  const hx = x1 - 3.0, hz = z0 + 6.8;
  for (const [dx, dz] of [[-1.5, -1.1], [1.5, -1.1], [0, 1.6]]) bag.add('timber', rod([hx + dx, y, hz + dz], [hx, y + 5.2, hz], 0.09, 5));
  bag.add('iron', box(hx - 0.2, y + 5.1, hz - 0.1, hx + 0.2, y + 5.3, hz + 0.1)); bag.add('rope_fibre', rod([hx, y + 5.1, hz], [hx, y + 1.7, hz], 0.03, 4)); bag.add(M, box(hx - 0.55, y + 1.05, hz - 0.4, hx + 0.55, y + 1.7, hz + 0.4));
  col.circle(hx, hz, 1.8, y, y + 1.2);
  bag.add('timber', rod([x0 + 4.0, y, z0 + 1.6], [x0 + 3.7, y + 2.8, z0 + 0.5], 0.04, 4)); bag.add('timber', rod([x0 + 4.3, y, z0 + 1.6], [x0 + 4.0, y + 2.8, z0 + 0.5], 0.04, 4));
  bag.add('limewash_white', lathe([[0.9, 0], [0.7, 0.3], [0.001, 0.6]], 8, null, x1 - 1.2, y, z1 - 1.2));
}
void prism;
