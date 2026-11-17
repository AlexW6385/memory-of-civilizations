// The inside of the Pharos' first stage (docs/settlements/alexandria.md §14): what stood in the ground hall and on the landings of the
// horsemen's ramp that pharos.js winds round its core — the keepers' end of the building. The fuel for the fire came by sea and went up the
// ramp on the backs of mules (Balawi: the ramp was wide enough for two riders [stated]); the rest is [inferred] from the work: a store of
// split wood and faggots, jars of oil and pitch, a stable and trough for the mules that hauled it, the keepers' bench, table and lamp, a small
// shrine of Isis Pharia (patron of the sea-farers [stated: Wikipedia "Isis"]) before the core, the dedication board, lamps in brackets along
// the walls, and on every landing a stone bench and a water jar. Built round the same measures as pharos.js (IN 11.6, CORE 8.4, ramp 8.5–11.5,
// the rise 3.5 m a leg). Registered into the `ptolemaic` style (index.js).

import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { amphora, pithos, basket, sack, bench, firewood, reedBundle, lampBracket, ropeCoil, crate, rng } from './dress.js';
import { figureAt } from './house.js';

const IN = 11.6, CORE = 8.4, A0 = 8.5, A1 = 11.5, RISE = 3.5;

function pharosFit(el, ctx) {
  const { bag, col, lights } = ctx, [cx, cz] = el.c, y0 = (el.y ?? 1.2) + 0.66, rand = rng(el.seed ?? 9);
  const P = (u, v) => [cx + u, cz + v];
  const lamp = (u, v, yy, nu, nv, light = true) => { const [x, z] = P(u, v); lampBracket(bag, x, yy, z, nu, nv); if (light) lights.push({ at: [x + nu * 0.4, yy + 0.1, z + nv * 0.4], color: '#ffb260', intensity: 2.4, distance: 9 }); };
  // ── the ground hall: the corridor round the core, 3.2 m wide, the door in the south ──
  // the store of fuel on the south side west of the door: split wood in rows against the wall, faggots, a heap of pitch-pine knots
  for (let k = 0; k < 4; k++) { const [x, z] = P(-10.2 + k * 1.7, 10.55); firewood(bag, col, x, y0, z, 1.5, 0, 3 + (k % 2)); }
  for (let k = 0; k < 3; k++) { const [x, z] = P(-10.9 + k * 0.5, 9.6); reedBundle(bag, x, y0, z, 1.7, 0.08); col.circle(x, z, 0.14, y0, y0 + 1.6); }
  { const [x, z] = P(-4.3, 10.6); crate(bag, col, x, y0, z, 1.0, 0.6, 0.7); crate(bag, col, x + 0.1, y0 + 0.6, z, 0.9, 0.5, 0.6); }
  // jars of lamp oil and of pitch along the south wall east of the door (pithoi, and the tall trading amphorae of Rhodes)
  for (let k = 0; k < 3; k++) { const [x, z] = P(4.4 + k * 1.1, 10.9); pithos(bag, col, x, y0, z, 0.78); }
  for (let k = 0; k < 4; k++) { const [x, z] = P(4.5 + k * 0.62, 9.85); amphora(bag, x, y0, z, { s: 1.0 }); col.circle(x, z, 0.2, y0, y0 + 1.1); }
  // the shrine of Isis Pharia before the core's south face: a stepped altar with its bowl and flame, offerings, two lamp-stands, the board above
  { const [x, z] = P(0, 9.35);
    bag.add('limestone', box(x - 0.55, y0, z - 0.45, x + 0.55, y0 + 0.28, z + 0.45)); bag.add('marble', box(x - 0.42, y0 + 0.28, z - 0.34, x + 0.42, y0 + 1.0, z + 0.34));
    bag.add('limestone', box(x - 0.5, y0 + 1.0, z - 0.4, x + 0.5, y0 + 1.08, z + 0.4)); col.rect([x - 0.55, z - 0.45, x + 0.55, z + 0.45], y0, y0 + 1.1);
    bag.add('bronze', lathe([[0.001, 0], [0.2, 0.02], [0.26, 0.12], [0.2, 0.15], [0.001, 0.13]], 8, null, x, y0 + 1.08, z)); bag.add('flame', lathe([[0.001, 0], [0.1, 0.01], [0.001, 0.4]], 6, null, x, y0 + 1.2, z));
    lights.push({ at: [x, y0 + 1.7, z], color: '#ffb260', intensity: 3.2, distance: 12 });
    for (const dx of [-1.15, 1.15]) { const [lx, lz] = P(dx, 9.1); bag.add('bronze', lathe([[0.001, 0], [0.2, 0], [0.12, 0.08], [0.03, 0.12], [0.025, 1.5], [0.1, 1.55], [0.001, 1.55]], 8, null, lx, y0, lz)); bag.add('flame', lathe([[0.001, 0], [0.05, 0.01], [0.001, 0.2]], 5, null, lx, y0 + 1.55, lz)); col.circle(lx, lz, 0.2, y0, y0 + 1.6); }
    const [fx, fz] = P(0.5, 9.1); basket(bag, fx, y0 + 1.08, fz, 0.12, 0.1, 'cloth_ochre');
    // the dedication: a long board of polished marble with the letters cut and painted blue, on the core's face, over the altar
    bag.add('marble_smooth', box(cx - 3.0, y0 + 2.4, cz + CORE + 0.0, cx + 3.0, y0 + 3.5, cz + CORE + 0.12));
    bag.add('egyptian_blue', box(cx - 2.8, y0 + 3.3, cz + CORE + 0.12, cx + 2.8, y0 + 3.4, cz + CORE + 0.15)); bag.add('egyptian_blue', box(cx - 2.8, y0 + 2.5, cz + CORE + 0.12, cx + 2.8, y0 + 2.6, cz + CORE + 0.15));
    for (let k = 0; k < 24; k++) bag.add('egyptian_blue', box(cx - 2.6 + k * 0.22, y0 + 2.8, cz + CORE + 0.12, cx - 2.6 + k * 0.22 + 0.1 + (k % 3) * 0.03, y0 + 3.1 - (k % 4) * 0.04, cz + CORE + 0.14));
  }
  // the keepers' corner on the west side: a bench along the wall, a table with a lamp, a stool, their cloaks and a water jar
  { const [bx0, bz0] = P(-11.4, -5.0), [bx1, bz1] = P(-10.7, 0.4); bench(bag, col, [bx0, bz0, bx1, bz1], y0, 'timber');
    const [tx, tz] = P(-9.45, -2.2); bag.add('wood_dark', box(tx - 0.4, y0 + 0.72, tz - 0.8, tx + 0.4, y0 + 0.78, tz + 0.8)); for (const [a, b] of [[-0.32, -0.7], [0.32, -0.7], [-0.32, 0.7], [0.32, 0.7]]) bag.add('wood_dark', box(tx + a - 0.04, y0, tz + b - 0.04, tx + a + 0.04, y0 + 0.72, tz + b + 0.04));
    col.rect([tx - 0.4, tz - 0.8, tx + 0.4, tz + 0.8], y0, y0 + 0.78);
    bag.add('terracotta', lathe([[0.001, 0], [0.04, 0.005], [0.05, 0.03], [0.001, 0.04]], 8, null, tx, y0 + 0.78, tz - 0.3)); bag.add('flame', lathe([[0.001, 0], [0.01, 0.01], [0.001, 0.05]], 5, null, tx, y0 + 0.82, tz - 0.3));
    lights.push({ at: [tx, y0 + 1.1, tz - 0.3], color: '#ffb46b', intensity: 2.2, distance: 8 });
    bag.add('ivory', box(tx - 0.12, y0 + 0.78, tz + 0.2, tx + 0.12, y0 + 0.8, tz + 0.6)); bag.add('linen', box(tx - 0.1, y0 + 0.8, tz + 0.22, tx + 0.1, y0 + 0.84, tz + 0.58));      // the log-book: a scroll
    const [jx, jz] = P(-11.0, 3.4); pithos(bag, col, jx, y0, jz, 0.6); const [sx, sz] = P(-11.0, 5.0); sack(bag, sx, y0, sz, 0.4); sack(bag, sx + 0.1, y0, sz + 0.4, 1.2);
    figureAt(ctx, ...P(-10.35, -1.0), y0 + 0.0, 1, 0, { seed: el.seed + 3, dress: 'tunic', over: 'cape', cloth: 'cloth_brown', hat: 'cap', skin: 'skin_medium', hair: 'short', beard: true, pose: 'sit' });
    figureAt(ctx, ...P(-9.3, 0.9), y0, 1, 0, { seed: el.seed + 4, dress: 'tunic', cloth: 'linen', skin: 'skin_dark', hair: 'shaven', pose: 'talk' }); }
  // the stable on the north side: the trough along the wall, hay in a heap, two mules (donkeys under their pack-saddles) with the baskets of fuel they carry up
  { const [tx0, tz0] = P(-7.4, -11.3), [tx1, tz1] = P(-1.6, -10.4);
    bag.add('limestone', box(tx0, y0, tz0, tx1, y0 + 0.62, tz1)); bag.add('water', box(tx0 + 0.12, y0 + 0.5, tz0 + 0.1, tx1 - 0.12, y0 + 0.52, tz1 - 0.1)); col.rect([tx0, tz0, tx1, tz1], y0, y0 + 0.62);
    const [hx, hz] = P(1.4, -10.7); bag.add('reed_mat', lathe([[0.001, 0], [0.8, 0.02], [0.7, 0.35], [0.3, 0.6], [0.001, 0.7]], 8, null, hx, y0, hz)); col.circle(hx, hz, 0.7, y0, y0 + 0.5);
    const A = STYLES.life?.elements?.animal;
    if (A) for (const [u, v, r, s] of [[-5.9, -9.4, Math.PI, 21], [-3.0, -9.4, Math.PI + 0.25, 22]]) { const [x, z] = P(u, v); A({ t: 'animal', kind: 'donkey', at: [x, z], y: y0, rot: r, seed: el.seed + s, gear: true }, ctx); col.circle(x, z, 0.55, y0, y0 + 1.4); }
    for (const [u, v] of [[-4.45, -8.7], [-4.2, -9.9]]) { const [x, z] = P(u, v); basket(bag, x, y0, z, 0.3, 0.4, 'wood_dark'); col.circle(x, z, 0.3, y0, y0 + 0.5); }
    const [rx, rz] = P(-1.0, -9.3); ropeCoil(bag, rx, y0, rz, 0.34);
    figureAt(ctx, ...P(-1.2, -8.9), y0, 0, 1, { seed: el.seed + 5, dress: 'loincloth', cloth: 'linen', skin: 'skin_dark', hair: 'shaven', carry: 'sack', pose: 'stand' }); }
  // the east side before the foot of the ramp: a heap of faggots and the oars of the lighter that brought them, a dog asleep
  { const [x, z] = P(9.7, 6.3); const A = STYLES.life?.elements?.animal; if (A) { A({ t: 'animal', kind: 'dog', at: [x, z], y: y0 + 0.02, rot: 2.0, seed: el.seed + 7 }, ctx); } }
  // lamps in their brackets along the four walls, a light at every second (the wall's inner face is at ±11.6)
  for (let k = 0; k < 4; k++) { const u = -8 + k * 5.3; lamp(u, IN - 0.05, y0 + 2.4, 0, -1, k % 2 === 0); lamp(-IN + 0.05, u * 0.9, y0 + 2.4, 1, 0, k % 2 === 1); lamp(u, -IN + 0.05, y0 + 2.4, 0, 1, k % 2 === 1); }
  // ── the landings: a stone bench along one outer wall and a water jar in the outer corner of each; a lamp over the bench at every second ──
  // landing k of turn t lies at the corner (NE, NW, SW, SE) with its top at y0 + (4t + k + 1) · RISE
  const CORNERS = [[1, -1], [-1, -1], [-1, 1], [1, 1]];
  for (let t = 0; t < 4; t++) for (let k = 0; k < 4; k++) {
    if (t === 3 && k === 3) continue;                          // the last landing is the way out onto the platform
    const [sx, sz] = CORNERS[k], yy = y0 + (4 * t + k + 1) * RISE;
    const [a, b] = P(sx * 8.7, sz * 10.8), [c, d] = P(sx * 10.2, sz * 11.4);
    bench(bag, col, [Math.min(a, c), Math.min(b, d), Math.max(a, c), Math.max(b, d)], yy, 'limestone');
    const [jx, jz] = P(sx * 10.95, sz * 10.1); pithos(bag, col, jx, yy, jz, 0.5);
    const [ox, oz] = P(sx * 10.9, sz * 11.0); void ox; void oz;
    if ((t + k) % 2 === 1) lamp(sx * 9.4, sz * (IN - 0.05), yy + 2.2, 0, -sz, true);
    if ((4 * t + k) % 3 === 0) { const [bx, bz] = P(sx * 9.4, sz * 9.6); basket(bag, bx, yy, bz, 0.22, 0.26, 'cloth_ochre'); }
    void rand;
  }
}
export const PHAROS_INTERIOR = { pharos_fit: pharosFit };
