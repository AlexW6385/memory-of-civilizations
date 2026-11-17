// The household yard of a Teotihuacan apartment compound (docs/settlements/teotihuacan.md §16): the second patio of the
// compounds that were neither potters', weavers' nor obsidian workers' — the household's own working court. In it, by the
// compound's seed: the storage bin of clay under its thatched cap, the turkeys' pen of stakes, maize drying on trays, a mat of squash and
// beans being sorted, a stack of firewood, a stone drain slab let into the floor, and the people at it. The yard is laid out
// in one of eight ways (the quadrants turned and mirrored) and each piece present or absent by chance, so no two are alike.
import { STYLES } from '../../core/build.js';
import { lathe } from '../../core/geom.js';
import { carved } from '../maya/meso.js';
import { inst, fig, rng } from './street.js';
import { drainKit } from './avenue.js';

/** The clay storage bin: a stone footing, the bulging bin of plastered clay with a stopped mouth, the thatched cap over it; 1.1 m across, 2 m high. */
const binKit = () => carved('tt-bin', (k) => {
  k.geo('andesite', lathe([[0.001, 0], [0.62, 0], [0.58, 0.16], [0.001, 0.16]], 12));
  k.geo('terracotta', lathe([[0.001, 0.16], [0.5, 0.16], [0.7, 0.5], [0.76, 0.85], [0.62, 1.18], [0.42, 1.34], [0.001, 1.34]], 14, (th) => 1 + 0.025 * Math.sin(th * 3)));
  k.geo('stucco_red', lathe([[0.55, 0.64], [0.74, 0.64], [0.745, 0.7], [0.56, 0.7]], 14));                     // a painted band round the belly
  k.geo('thatch', lathe([[0.001, 1.98], [0.55, 1.5], [0.82, 1.3], [0.78, 1.26], [0.5, 1.38], [0.001, 1.38]], 14));
  k.bx('timber', -0.03, 0.03, 1.9, 2.08, -0.03, 0.03);                                                           // the knot of the thatch
});
/** The pen: fourteen stakes in a ring of radius 1.45 with two rails, a gap toward +z; 1 m high. */
const penKit = () => carved('tt-pen', (k) => {
  const R = 1.45, N = 14, P = (i, y) => [Math.sin((i / N) * 6.2832) * R, y, Math.cos((i / N) * 6.2832) * R];
  for (let i = 0; i < N; i++) {
    if (Math.cos((i / N) * 6.2832) > 0.9) continue;                                                               // the opening
    k.seg('timber', P(i, 0), P(i, 1.0), 0.04, 0.04, 0.035, 0.035);
    if (i + 1 < N && Math.cos(((i + 1) / N) * 6.2832) <= 0.9) for (const y of [0.35, 0.78]) k.seg('timber', P(i, y), P(i + 1, y), 0.022, 0.022);
  }
  k.geo('wicker', lathe([[0.001, 0], [0.18, 0], [0.22, 0.07], [0.001, 0.07]], 8).translate(0.2, 0, -0.5));     // the trough
  k.geo('plaster_damp', lathe([[0.001, 0.06], [0.15, 0.06], [0.001, 0.075]], 8).translate(0.2, 0, -0.5));
});
/** A pile of husked cobs in a heap on the floor. */
const cobsHeap = () => carved('tt-cobheap', (k) => {
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4, r = 0.05 + (i % 4) * 0.07, x = Math.cos(a) * r, z = Math.sin(a) * r, y = 0.03 + (i % 3) * 0.035;
    k.seg(i % 3 ? 'paint_cab_yellow' : 'cloth_ochre', [x - 0.1, y, z - 0.03], [x + 0.1, y + 0.015, z + 0.03], 0.03, 0.03, 0.03, 0.03);
  }
});

/** The yard at (x, z) on floor y, its cell 13 m across (the court's floor is 14 m); seed sets the layout. */
export function householdYard(ctx, x, y, z, seed) {
  const { bag, col } = ctx, L = STYLES.life.elements, r = rng(seed * 7 + 5);
  const flipU = r() < 0.5 ? -1 : 1, flipV = r() < 0.5 ? -1 : 1, swap = r() < 0.5;
  const Q = (u, v) => { const a = u * flipU, b = v * flipV; return swap ? [x + b, z + a] : [x + a, z + b]; };         // the quadrants turned and mirrored
  const circ = (px, pz, rad, hh) => col.circle(px, pz, rad, y, y + hh);
  // the bin (three in four), under its cap
  if (r() < 0.75) { const [px, pz] = Q(-4.4, -4.2); inst(bag, binKit(), px, y, pz, r() * 6, 1, 110); circ(px, pz, 0.8, 2); if (r() < 0.5) { const [qx, qz] = Q(-2.9, -4.7); inst(bag, binKit(), qx, y, qz, r() * 6, 0.8, 110); circ(qx, qz, 0.65, 1.7); } }
  // the pen with its turkeys and a child feeding them
  if (r() < 0.8) {
    const [px, pz] = Q(4.2, -4.0);
    inst(bag, penKit(), px, y, pz, swap ? (flipU > 0 ? Math.PI / 2 : -Math.PI / 2) : (flipV > 0 ? 0 : Math.PI), 1, 100);
    L.chickens({ t: 'chickens', kind: 'turkey', n: 3, at: [px, pz], y, rot: r() * 6, seed: seed + 11 }, ctx);
    const [cx, cz] = Q(4.2, -1.9); if (r() < 0.6) fig(ctx, { who: 'child', at: [cx, cz], y, rot: swap ? (flipV > 0 ? 0 : Math.PI) : (flipU > 0 ? Math.PI : 0), seed: seed + 12, pose: 'squat' });
  }
  // maize drying on trays, a heap of cobs, and a woman husking beside them
  { const n = 2 + (r() < 0.5 ? 1 : 0); for (let i = 0; i < n; i++) { const [px, pz] = Q(-4.2 + i * 1.3, 3.2); L.drying_tray({ t: 'drying_tray', at: [px, pz], y, rot: r() * 6, seed: seed + 20 + i }, ctx); circ(px, pz, 0.45, 0.5); }
    const [hx, hz] = Q(-2.2, 4.6); inst(bag, cobsHeap(), hx, y, hz, r() * 6, 1, 60);
    if (r() < 0.7) { const [wx, wz] = Q(-3.3, 4.7); fig(ctx, { who: r() < 0.7 ? 'woman' : 'elder', at: [wx, wz], y, rot: swap ? (flipV > 0 ? 0 : Math.PI) + Math.PI / 2 * flipU : (flipU > 0 ? Math.PI / 2 : -Math.PI / 2), seed: seed + 30, pose: 'sit_ground' }); } }
  // a mat of squash and beans, a basket, a woman sorting them
  if (r() < 0.7) { const [mx, mz] = Q(2.2, 3.6); L.goods_mat({ t: 'goods_mat', at: [mx, mz], y, rot: swap ? Math.PI / 2 : 0, goods: ['heap', 'basket', 'dark_pot'], seed: seed + 40 }, ctx); }
  // firewood under the back wall of the rooms
  { const [fx2, fz2] = Q(5.0, 4.0); L.firewood({ t: 'firewood', at: [fx2, fz2], y, rot: swap ? 0 : Math.PI / 2, len: 1.2, seed: seed + 50 }, ctx); col.circle(fx2, fz2, 0.5, y, y + 0.6); }
  // a drain slab let into the floor with a dark mouth, as the city's courts had
  { const [dx, dz] = Q(0.6, 0.2); inst(bag, drainKit(), dx, y, dz, swap ? Math.PI / 2 : 0, 1, 60); }
  // the dog asleep in the sun, now and then
  if (r() < 0.45) { const [ax, az] = Q(1.0, -1.0); L.animal({ t: 'animal', kind: 'dog', at: [ax, az], y, rot: r() * 6.28, seed: seed + 60, mat: 'hide_tan' }, ctx); }
}
