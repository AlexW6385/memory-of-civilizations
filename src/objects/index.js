// The shared library of objects of use and of life (DESIGN §5, §9): pots, baskets, sacks, barrels,
// crates, firewood, benches, market stalls, carts and barrows, ladders, laundry, troughs, wells;
// animals and still figures; boats; for the modern settlements cars, lamps and benches. Generated
// geometry, parameterised by kind and material, registered as the style `life`. Every builder
// takes { at: [x, z], y, rot (radians about +y), s (scale), seed, … } in its plan's coordinates.

import { registerStyle } from '../core/build.js';
import { box, lathe, fromTriangles } from '../core/geom.js';

import { rng, placer, assembly, tube, slathe, folded } from './kit.js';
import { Matrix4 } from '../core/three.js';
import { figure } from './figures.js';
import { animal, BEASTS } from './animals.js';
const at = (g, x, y, z) => { g.translate(x, y, z); return g; };
const lz = (profile, seg = 12) => lathe(profile, seg);
/** A cylinder lying along x (wheels, logs, rolls). */
function lying(r, len, seg = 12) { const g = lathe([[r, 0], [r, len], [0.001, len]], seg); g.translate(0, -len / 2, 0); g.rotateZ(Math.PI / 2); return g; }
/** An ellipsoid-ish body along z, half-length a, radius b, raised to y. */
function body(a, b, seg = 10) { const g = lathe([[0.001, -a], [b * 0.6, -a * 0.85], [b, -a * 0.3], [b, a * 0.3], [b * 0.65, a * 0.85], [0.001, a]], seg); g.rotateX(Math.PI / 2); return g; }
const turn = (g, ang) => { g.rotateY(ang); return g; };

// ---- pots, baskets, stores --------------------------------------------------------------------
const POTS = {
  amphora: { m: 'terracotta', p: [[0.04, 0], [0.09, 0.08], [0.2, 0.3], [0.21, 0.42], [0.12, 0.6], [0.06, 0.68], [0.07, 0.75], [0.001, 0.75]] },
  pithos: { m: 'terracotta', p: [[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]] },
  water_pot: { m: 'terracotta', p: [[0.08, 0], [0.2, 0.08], [0.24, 0.22], [0.18, 0.36], [0.08, 0.42], [0.1, 0.46], [0.001, 0.46]] },
  dark_pot: { m: 'pottery_dark', p: [[0.1, 0], [0.22, 0.1], [0.25, 0.25], [0.16, 0.38], [0.14, 0.44], [0.001, 0.44]] },
  glazed_jar: { m: 'glaze_green', p: [[0.16, 0], [0.3, 0.2], [0.34, 0.45], [0.26, 0.7], [0.16, 0.78], [0.17, 0.84], [0.001, 0.84]] },
  blue_jar: { m: 'glaze_blue', p: [[0.12, 0], [0.24, 0.15], [0.27, 0.38], [0.18, 0.58], [0.1, 0.62], [0.11, 0.68], [0.001, 0.68]] },
  // the water stores by the doors: the Chinese and Korean water vat (水缸), wide-mouthed, glazed brown, a lid of
  // boards and a gourd dipper on it; the Near Eastern zir, a tall porous jar with a pointed foot that cools the
  // water by seeping, on a wooden stand, a board and a cup over its mouth; the Indian matka with a clay lid and a lota
  vat: { m: 'pottery_dark', p: [[0.2, 0], [0.3, 0.12], [0.36, 0.34], [0.37, 0.5], [0.34, 0.62], [0.355, 0.64], [0.355, 0.67], [0.001, 0.67]], lid: 'boards', top: 0.67, r: 0.355 },
  zir: { m: 'terracotta', p: [[0.001, 0], [0.07, 0.05], [0.19, 0.28], [0.24, 0.52], [0.22, 0.76], [0.12, 0.9], [0.135, 0.95], [0.135, 0.98], [0.001, 0.98]], lid: 'board', top: 0.98, r: 0.135, stand: 0.26 },
  matka: { m: 'terracotta', p: [[0.08, 0], [0.2, 0.08], [0.24, 0.22], [0.18, 0.36], [0.08, 0.42], [0.1, 0.46], [0.001, 0.46]], lid: 'plate', top: 0.46, r: 0.1 },
};
/** The lid and the dipper of a water store (POTS[kind].lid), its mouth at height `top`, radius `r`: roles by material. */
function potLid(a, P) {
  const { top, r } = P;
  if (P.lid === 'boards') {
    // three boards side by side, a batten across them, the gourd dipper laid over
    for (let k = 0; k < 3; k++) { const w = (2 * r + 0.04) / 3, x0 = -r - 0.02 + k * w; a('timber', box(x0 + 0.004, top, -Math.sqrt(Math.max(0.01, r * r - (x0 + w / 2) ** 2)) - 0.02, x0 + w - 0.004, top + 0.025, Math.sqrt(Math.max(0.01, r * r - (x0 + w / 2) ** 2)) + 0.02)); }
    a('timber', box(-r * 0.8, top + 0.025, -0.03, r * 0.8, top + 0.05, 0.03));
    a('wicker', at(slathe([[0.001, 0], [0.05, 0.005], [0.075, 0.035], [0.07, 0.04], [0.045, 0.012], [0.001, 0.01]], 10), 0.1, top + 0.05, 0.14));
    a('wicker', tube([[0.1, top + 0.08, 0.08, 0.013], [0.06, top + 0.06, -0.2, 0.011]], 5));
  } else if (P.lid === 'board') {
    a('timber', box(-0.17, top, -0.17, 0.17, top + 0.025, 0.17));
    a('bronze', at(slathe([[0.001, 0], [0.03, 0], [0.04, 0.06], [0.036, 0.062], [0.026, 0.008], [0.001, 0.008]], 10), 0.06, top + 0.025, 0.04));
  } else if (P.lid === 'plate') {
    a('terracotta', at(slathe([[0.001, 0.035], [0.08, 0.03], [0.14, 0.0], [0.13, 0.008], [0.075, 0.04], [0.001, 0.045]], 12), 0, top, 0));
    a('bronze', at(slathe([[0.001, 0], [0.035, 0.0], [0.06, 0.05], [0.04, 0.1], [0.03, 0.11], [0.035, 0.125], [0.03, 0.125], [0.001, 0.11]], 10), 0, top + 0.04, 0));
  }
  if (P.stand) {
    // the zir's stand: a ring on three splayed legs, the jar's foot through the ring
    const h = P.stand;
    a('timber', tube(Array.from({ length: 17 }, (_, k) => { const t = k / 16 * Math.PI * 2; return [Math.cos(t) * 0.19, h + 0.24, Math.sin(t) * 0.19, 0.022]; }), 4, { capA: false, capB: false }));
    for (let k = 0; k < 3; k++) { const t = k / 3 * Math.PI * 2 + 0.3; a('timber', tube([[Math.cos(t) * 0.32, 0, Math.sin(t) * 0.32, 0.025], [Math.cos(t) * 0.19, h + 0.25, Math.sin(t) * 0.19, 0.022]], 5)); }
  }
}
/** pot: { kind, n (a cluster of n) } — a water store (vat, zir, matka) stands alone with its lid. */
function pot(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), P = POTS[el.kind] ?? POTS.water_pot, n = el.n ?? 1;
  if (P.lid) {
    const A = assembly(`pot-store|${el.kind}`, (a) => { a('jar', at(lz(P.p, 16), 0, P.stand ?? 0, 0)); potLid(a, { ...P, top: P.top + (P.stand ?? 0) }); });
    for (const [role, g] of Object.entries(A)) put(role === 'jar' ? P.m : role, g.clone());
    return;
  }
  for (let i = 0; i < n; i++) { const a = rand() * 6.28, r = i ? 0.35 + rand() * 0.35 : 0, k = 0.75 + Math.floor(rand() * 4) * 0.115; const g = lz(P.p.map(([pr, py]) => [pr * k, py * k])); put(P.m, at(g, Math.cos(a) * r, 0, Math.sin(a) * r)); }
}
function basket(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 1;
  for (let i = 0; i < n; i++) {
    const q = Math.floor(rand() * 4), r = 0.22 + q * 0.06, h = 0.2 + ((q * 3 + 1) % 4) * 0.083, a = rand() * 6.28, d = i ? 0.45 + rand() * 0.2 : 0, x = Math.cos(a) * d, z = Math.sin(a) * d;
    put('wicker', at(lz([[r * 0.75, 0], [r, h], [r * 0.92, h], [r * 0.7, 0.03], [0.001, 0.03]], 12), x, 0, z));
    if (rand() < 0.6) put(el.goods ?? ['cloth_ochre', 'cloth_red', 'cloth_green', 'hide_tan'][Math.floor(rand() * 4)], at(lz([[r * 0.9, 0], [r * 0.5, 0.1], [0.001, 0.13]], 10), x, h - 0.06, z));
  }
}
function sacks(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 3;
  for (let i = 0; i < n; i++) { const x = (i % 3 - 1) * 0.55 + (rand() - 0.5) * 0.1, z = Math.floor(i / 3) * 0.5, top = i >= 3 ? 0.55 : 0; const g = lz([[0.25, 0], [0.3, 0.15], [0.27, 0.45], [0.12, 0.6], [0.001, 0.62]], 9); g.scale(1, 1, 0.8); put(el.mat ?? 'sacking', at(g, x, top, z)); }
}
function barrel(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 1;
  for (let i = 0; i < n; i++) {
    const x = i * 0.7 - (n - 1) * 0.35, z = (rand() - 0.5) * 0.2;
    put('timber', at(lz([[0.27, 0], [0.32, 0.25], [0.33, 0.45], [0.32, 0.65], [0.27, 0.9], [0.001, 0.9]], 14), x, 0, z));
    for (const yy of [0.12, 0.78]) put('iron', at(lz([[0.315, 0], [0.315, 0.05], [0.001, 0.05]], 14), x, yy, z));
  }
}
function crates(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), n = el.n ?? 2;
  for (let i = 0; i < n; i++) { const w = 0.5 + rand() * 0.3, x = (i % 2) * 0.75, y = i >= 2 ? 0.6 : 0; put('timber', turn(at(box(-w / 2, 0, -w / 2, w / 2, 0.55, w / 2), 0, 0, 0), (rand() - 0.5) * 0.3).translate(x, y, 0)); }
}
function firewood(el, { bag }) {
  // the stack is one of two of each length (its logs uneven within it), so that stacks share their shape
  const put = placer(el, bag), L = Math.round((el.len ?? 1.6) * 4) / 4, v = (el.seed ?? 1) % 2;
  const A = assembly(`firewood|${L}|${v}`, (a) => { const rand = rng(17 + v * 31); for (let row = 0; row < 4; row++) for (let k = 0; k < 6 - row; k++) { const g = lying(0.07 + rand() * 0.03, L * (0.85 + rand() * 0.2), 6); g.rotateY(Math.PI / 2); a('w', at(g, (rand() - 0.5) * 0.08, 0.07 + row * 0.13, (k - (5 - row) / 2) * 0.15 + (rand() - 0.5) * 0.03)); } });
  put('bark_pine', A.w.clone());
}
function bench(el, { bag, col }) {
  const put = placer(el, bag), L = el.len ?? 1.8, m = el.mat ?? 'timber';
  put(m, box(-L / 2, 0.42, -0.18, L / 2, 0.47, 0.18));
  for (const x of [-L / 2 + 0.15, L / 2 - 0.15]) put(m, box(x - 0.05, 0, -0.15, x + 0.05, 0.42, 0.15));
  if (el.back) put(m, box(-L / 2, 0.47, 0.14, L / 2, 0.85, 0.18));
}
function trough(el, { bag, col }) {
  const put = placer(el, bag), m = el.mat ?? 'limestone';
  put(m, box(-0.9, 0, -0.3, 0.9, 0.55, -0.24)); put(m, box(-0.9, 0, 0.24, 0.9, 0.55, 0.3)); put(m, box(-0.9, 0, -0.3, -0.84, 0.55, 0.3)); put(m, box(0.84, 0, -0.3, 0.9, 0.55, 0.3)); put(m, box(-0.9, 0, -0.3, 0.9, 0.1, 0.3));
  put('water', box(-0.84, 0.4, -0.24, 0.84, 0.42, 0.24));
}
/** A wooden bucket of staves, two iron hoops and an iron bail, standing at (x, y, z): roles 'timber', 'iron' (or `mat` for a leather or clay one). */
function bucket(a, x, y, z, { r = 0.14, h = 0.26, mat = 'timber', bail = true } = {}) {
  if (mat === 'timber') {
    a('timber', at(slathe([[0.001, 0], [r * 0.82, 0], [r * 0.86, 0.02], [r, h], [r * 0.93, h], [r * 0.8, 0.04], [0.001, 0.04]], 12), x, y, z));
    for (const t of [0.22, 0.8]) { const rr = r * (0.84 + 0.16 * t) + 0.006; a('iron', at(slathe([[rr, 0], [rr, 0.025], [rr - 0.012, 0.025], [rr - 0.012, 0]], 12), x, y + h * t - 0.012, z)); }
  } else a(mat, at(slathe([[0.001, 0], [r * 0.6, 0], [r, h * 0.45], [r * 0.85, h], [r * 0.78, h], [r * 0.9, h * 0.45], [r * 0.5, 0.03], [0.001, 0.03]], 10), x, y, z));
  if (bail) a(mat === 'timber' ? 'iron' : 'rope', tube(Array.from({ length: 9 }, (_, k) => { const t = Math.PI * k / 8; return [x + Math.cos(t) * r * 0.97, y + h + Math.sin(t) * r * 0.9, z, 0.007]; }), 4));
}
/** A rope through points [x, y, z] (role 'rope'). */
const rope = (a, pts, w = 0.012) => a('rope', tube(pts.map((p) => [...p, w]), 4));
/** A rope hanging between two points with a sag (a catenary's look): n points. */
function sagged(p, q, sag, n = 9) { return Array.from({ length: n }, (_, k) => { const t = k / (n - 1); return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t - sag * 4 * t * (1 - t), p[2] + (q[2] - p[2]) * t]; }); }
/** The rim of a well, its mouth at r0, its outside at r1, h high; `square`: a curb of four stones (or logs) set square. */
function curb(a, m, r0, r1, h, { square = false, mould = false } = {}) {
  if (square) {
    // the curb as a square of beams (or slabs) in courses, the pairs crossing at the corners and running
    // past them in turn, as a log crib or the Japanese igeta is laid
    const t = r1 - r0, n = Math.max(1, Math.round(h / 0.2)), hh = h / n, ext = 0.05 + t * 0.35;
    for (let k = 0; k < n; k++) {
      const y0 = k * hh, ex = k % 2 ? ext : 0, ez = k % 2 ? 0 : ext;
      for (const s of [-1, 1]) {
        a(m, box(-r1 - ex, y0, s > 0 ? r0 : -r1, r1 + ex, y0 + hh, s > 0 ? r1 : -r0));
        a(m, box(s > 0 ? r0 : -r1, y0, -r1 - ez, s > 0 ? r1 : -r0, y0 + hh, r1 + ez));
      }
    }
    a(m, box(-r0, 0, -r0, r0, h * 0.45, r0));
    a('water', box(-r0 + 0.002, h * 0.45, -r0 + 0.002, r0 - 0.002, h * 0.45 + 0.03, r0 - 0.002));
    return;
  }
  const P = mould
    ? [[r1 + 0.08, 0], [r1 + 0.08, 0.12], [r1, 0.16], [r1, h - 0.14], [r1 + 0.05, h - 0.1], [r1 + 0.06, h], [r0 - 0.02, h], [r0 - 0.02, h - 0.06], [r0, h - 0.08], [r0, h * 0.45], [0.001, h * 0.45]]
    : [[r1 + 0.02, 0], [r1, 0.08], [r1, h - 0.06], [r1 - 0.02, h], [r0 + 0.02, h], [r0, h - 0.04], [r0, h * 0.45], [0.001, h * 0.45]];
  a(m, slathe(P, 20));
  a('water', at(lz([[r0 - 0.005, 0], [0.001, 0]], 16), 0, h * 0.45 + 0.03, 0));
}
/**
 * well: { kind, mat (the curb's stone), roof } — a draw-well of the region (WELL in src/objects/life.js):
 * 'windlass' — a round stone curb, two posts carrying a drum with an iron crank, its rope wound on the
 *   drum and down to the bucket stood on the curb; `roof`: a little gabled roof of boards over it
 *   (the European draw-well; without the roof, the Chinese lulu);
 * 'pulley' — a gallows of two posts and a beam, a pulley block under the beam, the rope over it to a
 *   bucket in the mouth and one on the curb; `roof` (the Japanese tsurube, the curb square: `square`);
 * 'shaduf' — a low curb under the sweep: a pole pivoted on a crossbar between two posts a fifth of its
 *   length from its butt, a lump of clay or stone weighting the butt, the rope from the tip to a bucket
 *   (Egypt, India's dhenkli, China's jiegao, the Russian zhuravl);
 * 'open' — a curb (a Venetian vera da pozzo: tall and moulded, `mould`) with a bucket and a coil of rope on it.
 */
function well(el, { bag, col }) {
  const put = placer(el, bag), kind = el.kind ?? 'windlass', m = el.mat ?? 'limestone', sq = !!el.square, roof = !!el.roof, [x, z] = el.at, y = el.y ?? 0;
  const bm = el.bucket ?? (kind === 'shaduf' ? 'hide_brown' : 'timber');
  const A = assembly(`well|${kind}|${m}|${sq ? 's' : ''}|${roof ? 'r' : ''}|${el.mould ? 'm' : ''}|${bm}`, (a) => {
    const r0 = kind === 'shaduf' ? 0.6 : 0.52, r1 = r0 + (sq ? 0.14 : 0.2), h = kind === 'shaduf' ? 0.55 : el.mould ? 0.95 : 0.78;
    curb(a, m, r0, r1, h, { square: sq, mould: !!el.mould });
    const top = h + (el.mould ? 0 : 0);
    if (kind === 'windlass') {
      const px = r1 + 0.12, ya = 1.25;
      for (const s of [-1, 1]) {
        a('timber', box(s * px - 0.06, 0, -0.07, s * px + 0.06, roof ? 2.05 : 1.45, 0.07));
        a('timber', tube([[s * px, 0.55, -0.07, 0.035], [s * px, 0.02, -0.55, 0.04]], 5));           // a brace
        a('timber', tube([[s * px, 0.55, 0.07, 0.035], [s * px, 0.02, 0.55, 0.04]], 5));
      }
      // the drum between the posts, its axle through them, the crank on the +x side
      a('timber', at(lying(0.11, 2 * px - 0.14, 10), 0, ya, 0));
      a('iron', at(lying(0.025, 2 * px + 0.3, 6), 0.03, ya, 0));
      a('iron', tube([[px + 0.15, ya, 0, 0.022], [px + 0.15, ya - 0.34, 0, 0.022]], 4));
      a('iron', tube([[px + 0.15, ya - 0.34, 0, 0.02], [px + 0.4, ya - 0.34, 0, 0.02]], 4));
      a('timber', at(lying(0.03, 0.18, 6), px + 0.3, ya - 0.34, 0));
      // the rope wound on the drum, and down to the bucket's bail on the curb
      for (let k = 0; k < 6; k++) a('rope', at(slathe([[0.001, 0], [0.122, 0], [0.122, 0.03], [0.001, 0.03]], 10).rotateZ(Math.PI / 2), -0.12 + k * 0.035, ya, 0));
      const bz = r0 + (r1 - r0) / 2;
      bucket(a, 0, top, bz, { mat: bm });
      rope(a, [[0, ya - 0.1, 0.06], [0, top + 0.5, bz - 0.02], [0, top + 0.26 + 0.13, bz]]);
      if (roof) {
        // the gabled roof: boards on a ridge pole over the posts' heads, open at the gables
        const ry = 2.42, ey = 1.98, ez = 0.85, len = 2 * px + 0.5, sl = Math.hypot(ez, ry - ey), ang = Math.atan2(ry - ey, ez);
        a('timber', box(-len / 2, 1.97, -0.06, len / 2, 2.07, 0.06));
        a('timber', at(lying(0.05, len + 0.1, 6), 0, ry - 0.02, 0));
        for (const xx of [-px, px]) a('timber', tube([[xx, 2.05, 0, 0.04], [xx, ry - 0.06, 0, 0.04]], 4));
        for (const s of [-1, 1]) { const g = s > 0 ? box(-len / 2, 0, 0, len / 2, 0.035, sl) : box(-len / 2, 0, -sl, len / 2, 0.035, 0); g.rotateX(s * ang); g.translate(0, ry, 0); a('roof', g); }
      }
    } else if (kind === 'pulley') {
      const px = r1 + 0.1, yb = roof ? 2.15 : 2.25;
      for (const s of [-1, 1]) a('timber', box(s * px - 0.07, 0, -0.07, s * px + 0.07, yb + 0.12, 0.07));
      a('timber', box(-px - 0.22, yb, -0.08, px + 0.22, yb + 0.16, 0.08));
      // the block hung from the beam, the sheave in it (turning about x)
      a('iron', tube([[0, yb, 0, 0.012], [0, yb - 0.12, 0, 0.012]], 4));
      for (const s of [-1, 1]) a('timber', box(s * 0.04 - 0.012, yb - 0.38, -0.12, s * 0.04 + 0.012, yb - 0.1, 0.12));
      a('timber', at(lying(0.1, 0.05, 12), 0, yb - 0.24, 0));
      // the rope over the sheave: one end down to the bucket hanging in the mouth, the other to the bucket on the curb
      const bz = -(r0 + (r1 - r0) / 2);
      rope(a, [[0, yb - 0.24, 0.1], [0, top + 0.55, 0.1]]);
      bucket(a, 0, top + 0.18, 0.1, { mat: bm });
      rope(a, [[0, yb - 0.24, -0.1], [0, top + 0.6, bz + 0.03], [0, top + 0.26 + 0.13, bz]]);
      bucket(a, 0, top, bz, { mat: bm });
      if (roof) {
        const ry = yb + 0.62, len = 2 * px + 0.7, ez = 0.62, sl = Math.hypot(ez, 0.34), ang = Math.atan2(0.34, ez);
        a('timber', tube([[0, yb + 0.16, 0, 0.045], [0, ry - 0.05, 0, 0.045]], 4));
        a('timber', at(lying(0.05, len, 6), 0, ry - 0.03, 0));
        for (const s of [-1, 1]) { const g = s > 0 ? box(-len / 2, 0, 0, len / 2, 0.03, sl) : box(-len / 2, 0, -sl, len / 2, 0.03, 0); g.rotateX(s * ang); g.translate(0, ry, 0); a('roof', g); }
      }
    } else if (kind === 'shaduf') {
      // the upright: two posts and the pivot bar a fifth of the pole from its butt; the pole at rest, its weighted butt down, its tip over the mouth
      const pz = -2.2, py = 2.0, T = [0, 4.2, 0], len = Math.hypot(T[1] - py, T[2] - pz), C = [0, py - (T[1] - py) / 4, pz - (T[2] - pz) / 4];
      for (const s of [-1, 1]) a('timber', tube([[s * 0.16, 0, pz, 0.075], [s * 0.15, py + 0.18, pz, 0.065]], 6));
      a('timber', at(lying(0.035, 0.46, 6), 0, py, pz));
      a('timber', tube([[0, C[1], C[2], 0.085], [0, py, pz, 0.075], [0, T[1], T[2], 0.04]], 6));
      a('mud', at(ball(0.3, 9).scale(1, 0.85, 1.15), 0, C[1] - 0.5, C[2] - 0.05));
      rope(a, [[0, C[1] - 0.24, C[2]], [0, C[1] + 0.02, C[2]]], 0.02);
      // the rope (or a thin pole) from the tip down to the bucket hanging over the mouth
      rope(a, [[0, T[1], T[2]], [0, top + 0.74, 0]], 0.014);
      bucket(a, 0, top + 0.33, 0, { mat: bm, r: 0.15, h: 0.28 });
      void len;
    } else {
      // open: the bucket on the rim, its rope coiled beside it
      const rr = r0 + (r1 - r0) / 2;
      bucket(a, 0, top, rr, { mat: bm });
      for (let k = 0; k < 3; k++) a('rope', tube(Array.from({ length: 13 }, (_, q) => { const t = q / 12 * Math.PI * 2; return [rr * Math.cos(-0.6) + Math.cos(t) * (0.12 - k * 0.012), top + 0.015 + k * 0.022, rr * Math.sin(-0.6) + Math.sin(t) * (0.12 - k * 0.012), 0.011]; }), 4, { capA: false, capB: false }));
      rope(a, [[0, top + 0.26 + 0.12, rr], [rr * Math.cos(-0.6) + 0.12, top + 0.06, rr * Math.sin(-0.6)]]);
    }
  });
  const mats = { mud: el.weight ?? 'mud_plaster', rope: 'sacking', roof: el.roofMat ?? 'timber' };
  for (const [role, g] of Object.entries(A)) put(mats[role] ?? role, g.clone());
  const r1 = (kind === 'shaduf' ? 0.6 : 0.52) + (sq ? 0.14 : 0.2);
  col.circle(x, z, r1 + 0.05, y, y + (kind === 'shaduf' ? 0.55 : el.mould ? 0.95 : 0.78));
  if (kind === 'shaduf') { const c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0); col.circle(x - 2.2 * s, z - 2.2 * c, 0.3, y, y + 2.2); }
}

// ---- stalls, carts, tools ---------------------------------------------------------------------
/** stall: { awning (cloth material), goods: [pot kinds or 'basket' | 'cloth' | 'produce'] } — a table on posts under a cloth awning, goods laid out. */
/** A thin cloth sheet over a grid (both faces): f(u, v) → [x, y, z], u, v in 0..1; `keep(i, j)` picks the cells (stripes). */
function sheet(f, nu, nv, keep = null, th = 0.008) {
  const T = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    if (keep && !keep(i, j)) continue;
    const a = f(i / nu, j / nv), b = f((i + 1) / nu, j / nv), c = f((i + 1) / nu, (j + 1) / nv), d = f(i / nu, (j + 1) / nv);
    const up = (p) => [p[0], p[1] + th, p[2]];
    T.push(...up(a), ...up(c), ...up(b), ...up(a), ...up(d), ...up(c));      // the upper face
    T.push(...a, ...b, ...c, ...a, ...c, ...d);                               // the lower face
  }
  return T.length ? fromTriangles(T) : null;
}
/**
 * stall: { awning (cloth material), stripe (a second cloth, or none), goods: [pot kinds or 'basket' | 'cloth' |
 * 'produce'], w, d } — a trestle table under a cloth awning on four poles, the awning sloping down
 * toward the buyers in front (+z) and ending in a scalloped valance, the seller's side behind (−z).
 */
function stall(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), W = el.w ?? 2.6, D = el.d ?? 1.4, aw = el.awning ?? 'cloth_white';
  const zb = -D / 2 - 0.25, zf = D / 2 + 0.75, yb = 2.45, yf = 2.08, ov = 0.18;
  const frame = assembly(`stall-frame|${W}|${D}`, (a) => {
    // the poles, with the cross bars that carry the awning, and the table on its trestles
    for (const [px, pz, h] of [[-W / 2, zb, yb], [W / 2, zb, yb], [-W / 2, zf, yf], [W / 2, zf, yf]]) a('timber', box(px - 0.045, 0, pz - 0.045, px + 0.045, h + 0.06, pz + 0.045));
    a('timber', box(-W / 2 - 0.1, yb - 0.06, zb - 0.03, W / 2 + 0.1, yb, zb + 0.03));
    a('timber', box(-W / 2 - 0.1, yf - 0.06, zf - 0.03, W / 2 + 0.1, yf, zf + 0.03));
    for (const sx of [-1, 1]) { const g = box(-0.025, -0.025, 0, 0.025, 0.025, Math.hypot(zf - zb, yb - yf)); g.rotateX(Math.atan2(yb - yf, zf - zb)); g.translate(sx * W / 2, yb - 0.03, zb); a('timber', g); }
    a('timber', box(-W / 2 + 0.05, 0.74, -D / 2 + 0.02, W / 2 - 0.05, 0.79, D / 2 - 0.02));
    for (const xx of [-W / 2 + 0.25, W / 2 - 0.25]) for (const s of [-1, 1]) { const g = box(-0.03, 0, -0.03, 0.03, 0.78, 0.03); g.rotateX(s * 0.32); g.translate(xx, 0, s * D * 0.32); a('timber', g); }
    for (const xx of [-W / 2 + 0.25, W / 2 - 0.25]) a('timber', box(xx - 0.035, 0.68, -D / 2 + 0.06, xx + 0.035, 0.74, D / 2 - 0.06));
  });
  put('timber', frame.timber.clone());
  // the awning: sagging between the bars, a scalloped valance along the front; plain or striped
  const stripe = el.stripe ?? (rand() < 0.4 ? ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo'].find((c) => c !== aw) : null);
  const f = (u, v) => { const x = -W / 2 - ov + (W + 2 * ov) * u, z = zb - 0.06 + (zf - zb + 0.12) * v; return [x, yb + 0.005 + (yf - yb) * v - 0.1 * Math.sin(Math.PI * v) * (0.4 + 0.6 * Math.sin(Math.PI * u)), z]; };
  const val = (u, v) => { const x = -W / 2 - ov + (W + 2 * ov) * u, sc = Math.abs(Math.sin(u * Math.PI * 7)); return [x, yf + 0.005 - v * (0.2 + 0.08 * sc), zf + 0.065]; };
  const A = assembly(`stall-awning|${W}|${D}|${stripe ? 's' : ''}`, (a) => {
    const keepA = stripe ? (i) => i % 2 === 0 : null, keepB = (i) => i % 2 === 1;
    a('a', sheet(f, 14, 6, keepA)); a('a', sheet((u, v) => { const p = val(u, v); return [p[0], p[1], p[2]]; }, 14, 1, keepA, 0));
    if (stripe) { a('b', sheet(f, 14, 6, keepB)); a('b', sheet(val, 14, 1, keepB, 0)); }
  });
  put(aw, A.a.clone());
  if (A.b) put(stripe, A.b.clone());
  // the cloth on the table, hanging down in front
  const tc = ['cloth_white', 'cloth_indigo', 'cloth_red', 'sacking', 'cloth_green'][Math.floor(rand() * 5)];
  const C = assembly(`stall-cloth|${W}|${D}`, (a) => { a('c', box(-W / 2, 0.79, -D / 2, W / 2, 0.805, D / 2 + 0.02)); a('c', box(-W / 2, 0.52, D / 2 + 0.02, W / 2, 0.805, D / 2 + 0.035)); });
  put(tc, C.c.clone());
  const goods = el.goods ?? ['basket', 'produce', 'cloth'];
  // stores behind the table, on the seller's side, and a basket or two beside it
  for (let i = 0; i < 3; i++) { const x = -W / 2 + 0.35 + rand() * (W - 0.7); put(rand() < 0.5 ? 'wicker' : 'sacking', at(lz([[0.2, 0], [0.24, 0.25], [0.18, 0.4], [0.001, 0.42]], 8), x, 0, -D / 2 - 0.25 - rand() * 0.25)); }
  // the wares of a culture (WARES): laid out in two rows of slots 0.6 m apart, the plain goods drawn small among them
  const wares = goods.filter((k) => WARES.has(k));
  if (wares.length) {
    const n = Math.max(1, Math.floor((W - 0.1) / 0.6));
    for (let row = 0; row < 2; row++) for (let i = 0; i < n - row; i++) ware(put, wares[Math.floor(rand() * wares.length)], -W / 2 + 0.05 + (i + 0.5 + row * 0.5) * (W - 0.1) / n, 0.805, row ? -0.27 : 0.25, rand, el);
  }
  for (let i = 0; i < (wares.length ? 0 : 7); i++) {
    const kind = goods[Math.floor(rand() * goods.length)], x = -W / 2 + 0.3 + (i % 4) * (W - 0.6) / 3 + (i >= 4 ? (W - 0.6) / 6 : 0), z = (i >= 4 ? -0.25 : 0.3) + (rand() - 0.5) * 0.1;
    if (x > W / 2 - 0.2) continue;
    if (kind === 'cloth') for (let k = 0; k < 3; k++) put(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green'][Math.floor(rand() * 5)], at(lying(0.08, 0.6, 8), x, 0.885 + k * 0.155, z));
    else if (kind === 'produce') { put('wicker', at(lz([[0.22, 0], [0.26, 0.12], [0.001, 0.12]], 10), x, 0.805, z)); const pm = ['cloth_green', 'cloth_red', 'cloth_ochre', 'glaze_yellow'][Math.floor(rand() * 4)]; for (let q = 0; q < 5; q++) { const a = q * 1.26, r2 = q ? 0.11 : 0; put(pm, at(ball(0.06, 6), x + Math.cos(a) * r2, 0.87 + (q ? 0 : 0.07), z + Math.sin(a) * r2)); } }
    else if (kind === 'basket') { put('wicker', at(lz([[0.16, 0], [0.22, 0.2], [0.2, 0.2], [0.14, 0.03], [0.001, 0.03]], 10), x, 0.805, z)); put(['cloth_ochre', 'hide_tan', 'cloth_brown', 'cloth_white'][Math.floor(rand() * 4)], at(lz([[0.2, 0], [0.13, 0.07], [0.001, 0.1]], 8), x, 0.985, z)); }
    else { const P = POTS[kind] ?? POTS.water_pot; put(P.m, at(lz(P.p.map(([r, h]) => [r * 0.6, h * 0.6])), x, 0.805, z)); }
  }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, Math.min(W, D) / 2 + 0.2, y, y + 0.8);
}
// ---- the wares of the stalls and the ground sellers ------------------------------------------------
// What was sold, by culture (the kits in src/objects/life.js): heaps of fruit on flat trays, bundles of greens,
// fish laid out on a tray, open sacks of spices with their heaps standing above the rolled rims (the souks of
// Cairo, Isfahan and Istanbul), folded bolts of cloth, stacks of bowls and jugs, round loaves, nested baskets for
// sale (the Qingming scroll's and the Edo botefuri's baskets and dishes: https://nippon.com/en/japan-topics/g01009).
// Each ware stands in about 0.5 × 0.45 m at (x, y, z) of its object; its shapes are shared, its colours tinted.
export const WARES = new Set(['heap', 'melons', 'greens', 'fish', 'spice', 'bolts', 'pottery', 'bread', 'baskets']);
const tray = (r = 0.25) => lz([[r, 0], [r + 0.02, 0.05], [r, 0.05], [r - 0.02, 0.015], [0.001, 0.015]], 12);
function ware(put, kind, x, y, z, rand, el) {
  const pr = el.produce ?? ['cloth_red', 'cloth_ochre', 'cloth_green'], c = (l) => l[Math.floor(rand() * l.length)], sh = () => 0.85 + rand() * 0.3;
  const P = (g) => at(g, x, y, z);
  if (kind === 'heap' || kind === 'melons') {
    // a pyramid of fruit on a flat basket: seven, three, one (or three melons and one on them)
    put('wicker', P(tray()));
    const big = kind === 'melons', A = assembly(`ware-${kind}`, (a) => {
      if (big) { for (let k = 0; k < 3; k++) { const t = k / 3 * Math.PI * 2; a('f', at(ball(0.1, 10).scale(1, 0.9, 1), Math.cos(t) * 0.12, 0.015, Math.sin(t) * 0.12)); } a('f', at(ball(0.1, 10).scale(1, 0.9, 1), 0, 0.15, 0)); return; }
      const r = 0.05;
      a('f', at(ball(r, 8), 0, 0.015, 0));
      for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2; a('f', at(ball(r, 8), Math.cos(t) * 0.102, 0.015, Math.sin(t) * 0.102)); }
      for (let k = 0; k < 3; k++) { const t = k / 3 * Math.PI * 2 + 0.5; a('f', at(ball(r, 8), Math.cos(t) * 0.06, 0.015 + 0.078, Math.sin(t) * 0.06)); }
      a('f', at(ball(r, 8), 0, 0.015 + 0.15, 0));
    });
    put(big ? c(['cloth_green', 'glaze_yellow', 'cloth_green']) : c(pr), P(A.f.clone()), sh());
  } else if (kind === 'greens') {
    // bundles of greens on a board, tied, their pale stalk ends together
    put('timber', P(box(-0.27, 0, -0.2, 0.27, 0.02, 0.2)));
    const A = assembly('ware-greens', (a) => {
      for (let k = 0; k < 5; k++) {
        const zz = -0.15 + (k % 4) * 0.1, yy = k < 4 ? 0.02 : 0.085, x0 = k < 4 ? 0 : 0.03;
        a('g', tube([[x0 + 0.24, yy + 0.03, zz + (k < 4 ? 0 : 0.05), 0.035, 0.03], [x0 + 0.05, yy + 0.04, zz, 0.05, 0.04], [x0 - 0.12, yy + 0.03, zz, 0.035, 0.028], [x0 - 0.17, yy + 0.025, zz, 0.025, 0.022]], 7));
        a('s', tube([[x0 - 0.16, yy + 0.025, zz, 0.024, 0.021], [x0 - 0.25, yy + 0.022, zz, 0.018, 0.016]], 6));
        a('t', tube(Array.from({ length: 9 }, (_, q) => { const th = q / 8 * Math.PI * 2; return [x0 - 0.13, yy + 0.03 + Math.sin(th) * 0.032, zz + Math.cos(th) * 0.036, 0.006]; }), 4, { capA: false, capB: false }));
      }
    });
    put('cloth_green', P(A.g.clone()), [sh(), sh() * 1.15, sh()]); put('cloth_white', P(A.s.clone()), 0.85); put('rope_fibre', P(A.t.clone()));
  } else if (kind === 'fish') {
    // fish laid side by side on a flat basket, heads out, one across them
    put('wicker', P(tray(0.26)));
    const A = assembly('ware-fish', (a) => {
      const fish = (cx, cy, cz, ang, L = 0.26) => { const d = [Math.cos(ang), Math.sin(ang)], p = (u, rw, rh) => [cx + d[0] * u * L, cy, cz + d[1] * u * L, rw, rh];
        a('f', tube([p(-0.5, 0.004, 0.003), p(-0.38, 0.026, 0.004), p(-0.3, 0.012, 0.006), p(-0.15, 0.03, 0.014), p(0.1, 0.042, 0.02), p(0.35, 0.03, 0.016), p(0.5, 0.004, 0.006)], 6)); };
      for (let k = 0; k < 5; k++) fish(-0.12 + k * 0.06, 0.035, 0.0, Math.PI / 2 + (k % 2 ? 0.08 : -0.06));
      fish(0, 0.07, 0.02, 0.15, 0.3);
    });
    put('lead', P(A.f.clone()), 1);
  } else if (kind === 'spice') {
    // three open sacks, their mouths rolled down, the spice standing in a cone above each
    const A = assembly('ware-spice', (a) => {
      [[-0.12, -0.08], [0.12, -0.08], [0, 0.12]].forEach(([sx, sz], k) => {
        a('s', at(lz([[0.085, 0], [0.105, 0.07], [0.11, 0.15], [0.125, 0.17], [0.125, 0.19], [0.105, 0.195], [0.1, 0.18], [0.001, 0.18]], 10), sx, 0, sz));
        a(`h${k}`, at(lz([[0.104, 0], [0.07, 0.045], [0.03, 0.075], [0.001, 0.085]], 10), sx, 0.178, sz));
      });
    });
    put('sacking', P(A.s.clone()));
    const sp = el.spices ?? ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_maroon', 'cloth_ochre', 'cloth_green'];
    for (let k = 0; k < 3; k++) put(c(sp), P(A[`h${k}`].clone()), sh());
  } else if (kind === 'bolts') {
    // folded bolts of cloth stacked, each of its colour, a little off one another
    const n = 3 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) put(c(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_maroon', 'cloth_black']), P(at(box(-0.2, 0, -0.12, 0.2, 0.058, 0.12), (k % 2 ? 0.02 : -0.015), k * 0.06, (k % 3 - 1) * 0.015)), sh());
  } else if (kind === 'pottery') {
    // a stack of nested bowls, and two jugs beside
    const pm = el.pottery ?? 'terracotta';
    const A = assembly('ware-pottery', (a) => {
      for (let k = 0; k < 4; k++) a('b', at(lz([[0.001, 0], [0.055, 0], [0.12, 0.055], [0.125, 0.065], [0.115, 0.066], [0.05, 0.01], [0.001, 0.01]], 12), -0.1, k * 0.028, 0.02));
      for (const [jx, jz] of [[0.14, -0.1], [0.15, 0.12]]) a('b', at(lz([[0.04, 0], [0.075, 0.06], [0.08, 0.12], [0.05, 0.19], [0.035, 0.22], [0.042, 0.24], [0.001, 0.24]], 10), jx, 0, jz));
    });
    put(pm, P(A.b.clone()));
  } else if (kind === 'bread') {
    put('wicker', P(tray(0.24)));
    const A = assembly('ware-bread', (a) => {
      a('l', at(ball(0.075, 10).scale(1, 0.5, 1), 0, 0.015, 0));
      for (let k = 0; k < 5; k++) { const t = k / 5 * Math.PI * 2; a('l', at(ball(0.07, 10).scale(1, 0.5, 1), Math.cos(t) * 0.14, 0.015, Math.sin(t) * 0.14)); }
      a('l', at(ball(0.07, 10).scale(1, 0.5, 1), 0.06, 0.085, 0.03));
    });
    put('hide_tan', P(A.l.clone()), 0.8 + rand() * 0.25);
  } else if (kind === 'baskets') {
    // baskets for sale, nested in a stack, one more on its side
    const A = assembly('ware-baskets', (a) => {
      for (let k = 0; k < 4; k++) a('w', at(lz([[0.13, 0], [0.18, 0.15], [0.17, 0.15], [0.12, 0.012], [0.001, 0.012]], 12), -0.06, k * 0.045, 0));
      a('w', at(lz([[0.08, 0], [0.12, 0.13], [0.11, 0.13], [0.075, 0.01], [0.001, 0.01]], 10).rotateZ(Math.PI / 2), 0.25, 0.12, 0.05));
    });
    put('wicker', P(A.w.clone()));
  }
}
/**
 * goods_mat: { goods, produce, pottery, spices } — goods set out on a mat on the ground, the seller sitting
 * behind it (−z): the way most of the markets of India, Africa, the Andes and Mesoamerica sold (the tianguis
 * of the Aztec accounts; Djenne's Monday market).
 */
function goodsMat(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), goods = el.goods ?? ['heap', 'baskets'];
  put(el.mat ?? 'reed_mat', box(-0.8, 0, -0.55, 0.8, 0.015, 0.55));
  for (const [x, z] of [[-0.42, 0.22], [0.42, 0.22], [-0.42, -0.25], [0.42, -0.25]]) {
    const k = goods[Math.floor(rand() * goods.length)];
    if (WARES.has(k)) ware(put, k, x, 0.015, z, rand, el);
    else if (k === 'basket') put('wicker', at(lz([[0.16, 0], [0.22, 0.2], [0.2, 0.2], [0.14, 0.03], [0.001, 0.03]], 10), x, 0.015, z));
    else if (POTS[k] && !POTS[k].lid) put(POTS[k].m, at(lz(POTS[k].p.map(([r, h]) => [r * 0.6, h * 0.6])), x, 0.015, z));
  }
}
/** stool: a low stool (its seat 0.21 m up) of a board on four legs, for a figure 'sit_low' at the same place. */
function stool(el, { bag }) {
  const put = placer(el, bag), A = assembly('stool', (a) => {
    a('t', box(-0.17, 0.18, -0.08, 0.17, 0.21, 0.2));
    for (const sx of [-0.13, 0.13]) for (const sz of [-0.04, 0.16]) a('t', box(sx - 0.02, 0, sz - 0.02, sx + 0.02, 0.18, sz + 0.02));
    for (const sz of [-0.04, 0.16]) a('t', box(-0.13, 0.06, sz - 0.012, 0.13, 0.085, sz + 0.012));
  });
  put(el.mat ?? 'timber', A.t.clone());
}
/**
 * rain_tub: the Edo town's tensui-oke (天水桶) — a big tub of staves on a low stand at the corner of a house,
 * kept full of rain against fire, a pyramid of fire buckets stacked on its lid.
 */
function rainTub(el, { bag, col }) {
  const put = placer(el, bag), A = assembly('rain-tub', (a) => {
    a('timber', box(-0.5, 0, -0.5, 0.5, 0.12, 0.5));
    a('timber', at(slathe([[0.001, 0], [0.4, 0], [0.43, 0.8], [0.4, 0.8], [0.4, 0.74], [0.001, 0.74]], 18), 0, 0.12, 0));
    for (const t of [0.15, 0.5, 0.82]) { const rr = 0.4 + 0.03 * t + 0.008; a('bamboo_culm', at(slathe([[rr, 0], [rr, 0.04], [rr - 0.012, 0.04], [rr - 0.012, 0]], 18), 0, 0.12 + 0.8 * t - 0.02, 0)); }
    a('timber', at(lz([[0.43, 0], [0.43, 0.03], [0.001, 0.03]], 18), 0, 0.92, 0));
    const B = { r: 0.12, h: 0.2 }, y0 = 0.95;
    for (const [bx, bz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) bucket(a, bx, y0, bz, { ...B, bail: false });
    bucket(a, 0, y0 + 0.2, 0, { ...B, bail: false });
  });
  for (const [role, g] of Object.entries(A)) put(role, g.clone());
  col.circle(el.at[0], el.at[1], 0.5, el.y ?? 0, (el.y ?? 0) + 1.3);
}
/**
 * handcart: { load ('sacks' | 'baskets' | 'crates' | 'empty') } — a two-wheeled handcart: a plank bed with low
 * sides on its axle, two handles running forward (−z) joined by a bar, resting level on two props at the front
 * (the medieval handcart; Edo's daihachi-guruma; London's costermonger's barrow).
 */
function handcart(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), r = 0.42, yb = r + 0.1, W = 0.95, L = 1.5, load = el.load ?? ['sacks', 'baskets', 'crates', 'empty', 'baskets'][Math.floor(rand() * 5)];
  const F = assembly('handcart', (a) => {
    for (const s of [-1, 1]) {
      a('timber', box(s * W / 2 - 0.05, yb - 0.08, -L / 2 - 1.0, s * W / 2 + 0.0 * s, yb, L / 2).translate(s > 0 ? 0 : 0.05, 0, 0));
      a('timber', box(s * W / 2 - 0.025, yb, -L / 2, s * W / 2 + 0.025, yb + 0.26, L / 2));                 // the side board
      a('timber', box(s * W / 2 - 0.03, 0, -L / 2 + 0.05, s * W / 2 + 0.01, yb - 0.08, -L / 2 + 0.11));      // a prop
    }
    for (let k = 0; k < 5; k++) { const x0 = -W / 2 + 0.03 + k * (W - 0.06) / 5; a('timber', box(x0 + 0.006, yb, -L / 2, x0 + (W - 0.06) / 5 - 0.006, yb + 0.03, L / 2)); }
    for (const zz of [-L / 2, L / 2 - 0.025]) a('timber', box(-W / 2 + 0.025, yb, zz, W / 2 - 0.025, yb + 0.2, zz + 0.025));
    a('timber', at(lying(0.025, W - 0.15, 8), 0, yb - 0.04, -L / 2 - 0.95));                                      // the handle bar
    a('timber', box(-W / 2 - 0.14, r - 0.04, 0.06, W / 2 + 0.14, r + 0.04, 0.14));                                  // the axle-tree
    a('timber', box(-W / 2 + 0.05, r + 0.04, 0.06, W / 2 - 0.05, yb - 0.08, 0.14));
  });
  put('timber', F.timber.clone());
  const Wh = assembly(`cart-wheel|${r}|10`, (a) => cartWheel(a, r, 10));
  for (const s of [-1, 1]) { const M = new Matrix4().makeTranslation(s * (W / 2 + 0.11), r, 0.1); put('timber', Wh.timber.clone().applyMatrix4(M)); put('iron', Wh.iron.clone().applyMatrix4(M)); }
  const y = yb + 0.03;
  if (load === 'sacks') for (let i = 0; i < 3; i++) { const g = lz([[0.2, 0], [0.24, 0.12], [0.22, 0.32], [0.1, 0.44], [0.001, 0.45]], 9); g.scale(1, 0.6, 0.8); g.rotateZ(Math.PI / 2); put('sacking', at(g, 0.15 + (i === 2 ? -0.05 : 0), y + 0.17 + (i === 2 ? 0.27 : 0), i === 2 ? 0 : (i - 0.5) * 0.5)); }
  else if (load === 'baskets') for (let i = 0; i < 4; i++) { const x = (i % 2 - 0.5) * 0.44, z = (Math.floor(i / 2) - 0.5) * 0.6; put('wicker', at(lz([[0.15, 0], [0.2, 0.22], [0.18, 0.22], [0.13, 0.02], [0.001, 0.02]], 10), x, y, z)); const A = assembly('cart-basket-fill', (a) => { a('f', lz([[0.18, 0], [0.12, 0.06], [0.001, 0.08]], 10)); }); put((el.produce ?? ['cloth_red', 'cloth_green', 'cloth_ochre'])[Math.floor(rand() * 3)], at(A.f.clone(), x, y + 0.19, z), 0.85 + rand() * 0.3); }
  else if (load === 'crates') for (let i = 0; i < 2; i++) put('timber', box(-0.3, 0, -0.27, 0.3, 0.45, 0.27).translate(0, y, (i - 0.5) * 0.62));
  const [x, z] = el.at, yy = el.y ?? 0;
  col.circle(x, z, 0.8, yy, yy + 0.9);
}
/**
 * The European wheelbarrow (from the early 13th century: https://medievaljames.blogspot.com/2011/06/medieval-wheelbarrows-and-handcarts.html):
 * the wheel at the very front between the ends of the two rails, a tray of boards on the rails, the rails running
 * back into the handles, two legs under the tray it rests on.
 */
function frontBarrow(el, put, rand) {
  const r = 0.26, A = assembly('barrow-front', (a) => {
    for (const s of [-1, 1]) {
      a('timber', tube([[s * 0.16, r, -0.78, 0.028], [s * 0.21, 0.4, -0.2, 0.032], [s * 0.25, 0.47, 0.35, 0.032], [s * 0.28, 0.56, 0.95, 0.026]], 6));
      a('timber', box(s * 0.22 - 0.025, 0, 0.27, s * 0.22 + 0.025, 0.45, 0.32));                                // a leg
      a('timber', box(s * 0.3 - 0.015, 0.44, -0.42, s * 0.3 + 0.015, 0.7, 0.33));                               // the side board
    }
    a('timber', box(-0.3, 0.42, -0.42, 0.3, 0.45, 0.33));                                                        // the bottom
    a('timber', box(-0.3, 0.45, 0.3, 0.3, 0.7, 0.33));                                                           // the back board
    const g = box(-0.3, 0, -0.015, 0.3, 0.32, 0.015); g.rotateX(0.5); g.translate(0, 0.43, -0.44); a('timber', g);   // the front board, raked
    for (const p of wheel(r, 0.05, 8)) a('timber', at(p, 0, r, -0.78));
    a('iron', at(lying(0.012, 0.36, 6), 0, r, -0.78));
  });
  put('timber', A.timber.clone()); put('iron', A.iron.clone());
  if (rand() < 0.5) put('sacking', at(lz([[0.17, 0], [0.2, 0.15], [0.16, 0.28], [0.001, 0.3]], 8).scale(1, 0.8, 1.2), 0, 0.45, -0.05));
  else if (rand() < 0.5) put('bark_pine', at(lying(0.05, 0.55, 6), 0, 0.5, -0.1));
}
/** A spoked wheel in the x = 0 plane, radius r: felloes, a turned nave, round spokes (the old flat one for the barrow). */
function wheel(r, w = 0.08, spokes = 8) {
  const parts = [];
  const rim = lathe([[r, 0], [r, w], [r - 0.06, w], [r - 0.06, 0], [r, 0]], 20); rim.translate(0, -w / 2, 0); rim.rotateZ(Math.PI / 2); parts.push(rim);
  const hub = lying(0.08, w + 0.12, 8); parts.push(hub);
  for (let k = 0; k < spokes; k++) { const g = box(-0.02, 0, -0.025, 0.02, r - 0.05, 0.025); g.rotateX(k / spokes * Math.PI * 2); parts.push(g); }
  return parts;
}
function cartWheel(a, r, spokes) {
  const w = 0.075, fr = r - 0.075, n = 24;
  // the rim of felloes: a ring of square section, slightly faceted where the felloes meet
  a('timber', tube(Array.from({ length: n + 1 }, (_, k) => { const t = k / n * Math.PI * 2, rr = r - 0.035 - (k % (n / spokes * 2) === 0 ? 0.004 : 0); return [0, Math.cos(t) * rr, Math.sin(t) * rr, w / 2, 0.038]; }), 4, { capA: false, capB: false }));
  // the nave, turned and bulging, through which the axle runs
  a('timber', slathe([[0.001, -0.17], [0.06, -0.17], [0.085, -0.12], [0.11, -0.04], [0.11, 0.04], [0.085, 0.12], [0.06, 0.17], [0.001, 0.17]], 12).rotateZ(Math.PI / 2));
  for (let k = 0; k < spokes; k++) { const t = (k + 0.5) / spokes * Math.PI * 2; a('timber', tube([[k % 2 ? 0.02 : -0.02, Math.cos(t) * 0.09, Math.sin(t) * 0.09, 0.024, 0.02], [0, Math.cos(t) * fr * 0.55, Math.sin(t) * fr * 0.55, 0.021, 0.018], [0, Math.cos(t) * (fr + 0.01), Math.sin(t) * (fr + 0.01), 0.018, 0.016]], 5, { capA: false })); }
  a('iron', tube(Array.from({ length: n + 1 }, (_, k) => { const t = k / n * Math.PI * 2; return [0, Math.cos(t) * (r + 0.004), Math.sin(t) * (r + 0.004), w / 2 + 0.004, 0.008]; }), 4, { capA: false, capB: false }));
}
/**
 * cart: { kind ('two' | 'four'), load ('sacks' | 'barrels' | 'hay' | 'empty'), beast (a kind of animal for a
 * two-wheeled cart: harnessed in its shafts) } — a cart of plank floor and staked sides on its frame,
 * the shafts running on from the frame to the front (−z). Unharnessed, a two-wheeled cart tips forward
 * on its shaft ends; a four-wheeled wagon rests level, its pole on the ground.
 */
function cart(el, { bag, col }) {
  const rand = rng(el.seed), four = el.kind === 'four', L = four ? 3 : 2.2, W = 1.25, r = four ? 0.5 : 0.65, yb = r + 0.12, beast = !four ? el.beast : null;
  const load = el.load ?? ['sacks', 'barrels', 'hay', 'empty'][Math.floor(rand() * 4)];
  const axles = four ? [-L / 2 + 0.55, L / 2 - 0.55] : [0.1];
  // the tilt: a two-wheeled cart unharnessed rests on its shaft ends (turned about its axle); harnessed, its shafts rise to the beast's sides
  const tipZ = -L / 2 - 1.75, Bk = beast ? BEASTS[beast] : null, sideY = Bk ? Bk.H * 0.6 : 0.06;
  const tiltM = new Matrix4().makeTranslation(0, r, axles[0]).multiply(new Matrix4().makeRotationX(Bk ? Math.atan2(sideY - yb, axles[0] - tipZ) : -Math.atan2(yb - sideY, axles[0] - tipZ))).multiply(new Matrix4().makeTranslation(0, -r, -axles[0]));
  const put = placer(el, bag);
  const tf = (a) => (four ? (role, g) => a(role, g) : (role, g) => a(role, g.applyMatrix4(tiltM)));
  const frame = assembly(`cart|${four ? 4 : 2}|${Bk ? beast : ''}`, (a) => {
    const t = tf(a);
    // the frame's two side beams, running on as the shafts (or a pole for the wagon)
    for (const s of [-1, 1]) {
      t('timber', box(s * (W / 2 - 0.06) - 0.05, yb - 0.1, -L / 2, s * (W / 2 - 0.06) + 0.05, yb, L / 2 + 0.1));
      if (!four) t('timber', tube([[s * (W / 2 - 0.06), yb - 0.05, -L / 2 + 0.05, 0.045, 0.05], [s * 0.42, yb - 0.05, -L / 2 - 0.9, 0.04, 0.045], [s * 0.36, yb - 0.04, tipZ, 0.03, 0.035]], 6));
    }
    if (four) { t('timber', tube([[0, r * 0.9, -L / 2 + 0.55, 0.05], [0, 0.28, -L / 2 - 0.9, 0.045], [0, 0.06, -L / 2 - 2.2, 0.035]], 6)); t('timber', box(-0.35, r - 0.04, -L / 2 + 0.5, 0.35, r + 0.04, -L / 2 + 0.6)); }
    // the floor of planks with gaps, the cross bearers under it
    for (let k = 0; k < 6; k++) { const x0 = -W / 2 + k * W / 6; t('timber', box(x0 + 0.008, yb, -L / 2, x0 + W / 6 - 0.008, yb + 0.035, L / 2)); }
    for (let k = 0; k < 3; k++) t('timber', box(-W / 2, yb - 0.17, -L / 2 + 0.2 + k * (L - 0.4) / 2 - 0.04, W / 2, yb - 0.1, -L / 2 + 0.2 + k * (L - 0.4) / 2 + 0.04));
    // the staked sides: stakes in the side beams, a rail along their tops, a lower board; a board across the back
    const n = four ? 6 : 5;
    for (const s of [-1, 1]) {
      for (let k = 0; k < n; k++) { const z = -L / 2 + 0.06 + k * (L - 0.12) / (n - 1); t('timber', box(s * W / 2 - 0.035, yb, z - 0.03, s * W / 2 + 0.035, yb + 0.52, z + 0.03)); }
      t('timber', box(s * W / 2 - 0.04, yb + 0.47, -L / 2 - 0.02, s * W / 2 + 0.04, yb + 0.54, L / 2 + 0.02));
      t('timber', box(s * W / 2 - 0.025, yb + 0.035, -L / 2, s * W / 2 + 0.025, yb + 0.22, L / 2));
    }
    t('timber', box(-W / 2, yb + 0.035, L / 2 - 0.03, W / 2, yb + 0.4, L / 2 + 0.01));
    // the axles under the frame
    for (const az of axles) t('timber', box(-W / 2 - 0.2, r - 0.05, az - 0.05, W / 2 + 0.2, r + 0.05, az + 0.05));
  });
  const cargo = assembly(`cart-load|${four ? 4 : 2}|${Bk ? beast : ''}|${load}`, (a) => {
    const t = tf(a);
    if (load === 'sacks') for (let i = 0; i < (four ? 6 : 4); i++) { const x = (i % 2 - 0.5) * 0.52, z = (Math.floor(i / 2) - (four ? 1 : 0.5)) * 0.62, rr = 0.2; t('sacking', tube([[x, yb + 0.035 + rr * 0.8, z - 0.3, 0.06, 0.05], [x, yb + 0.035 + rr * 0.85, z - 0.24, rr, rr * 0.8], [x, yb + 0.035 + rr * 0.85, z + 0.1, rr * 1.05, rr * 0.85], [x, yb + 0.035 + rr * 0.8, z + 0.24, rr * 0.8, rr * 0.7], [x, yb + 0.035 + rr * 0.8, z + 0.3, 0.05, 0.05]], 8)); }
    else if (load === 'barrels') for (let i = 0; i < (four ? 4 : 2); i++) { const z = (i - ((four ? 4 : 2) - 1) / 2) * 0.68; t('timber', slathe([[0.001, 0], [0.24, 0], [0.28, 0.16], [0.29, 0.31], [0.28, 0.46], [0.24, 0.62], [0.001, 0.62]], 12).translate(0, yb + 0.035, z)); for (const yy of [0.08, 0.54]) t('iron', slathe([[0.272, 0], [0.272, 0.04], [0.001, 0.04]], 12).translate(0, yb + 0.035 + yy, z)); }
    else if (load === 'hay') t('thatch', folded([[W / 2 + 0.05, 0], [W / 2 + 0.1, 0.25], [W / 2, 0.55], [0.35, 0.85], [0.001, 0.92]], 12, 5, 0.06, 3).scale(1, 1, (L + 0.1) / (W + 0.2)).translate(0, yb + 0.035, 0));
  });
  put('timber', frame.timber.clone());
  for (const [role, g] of Object.entries(cargo)) put(role, g.clone());
  const Wh = assembly(`cart-wheel|${r}|${four ? 10 : 12}`, (a) => cartWheel(a, r, four ? 10 : 12));
  for (const az of axles) for (const s of [-1, 1]) {
    const M = new Matrix4().makeTranslation(s * (W / 2 + 0.16), r, az);
    put('timber', Wh.timber.clone().applyMatrix4(M)); put('iron', Wh.iron.clone().applyMatrix4(M));
  }
  // the beast in the shafts, its head forward
  if (Bk) { const oz = -L / 2 - 0.35 - Bk.L / 2, ro = el.rot ?? 0; animal({ t: 'animal', kind: beast, gear: false, graze: false, seed: el.seed + 1, y: el.y, rot: ro, at: [el.at[0] + oz * Math.sin(ro), el.at[1] + oz * Math.cos(ro)] }, { bag, col }); }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, 1.1, y, y + yb + 0.5);
}
/**
 * barrow: the Chinese wheelbarrow — one large wheel in the middle under a slatted arch, a platform on
 * either side of it for the load, two long rails running back into the handles, two legs it rests on.
 */
function barrow(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), r = 0.42;
  if (el.kind === 'front') return frontBarrow(el, put, rand);
  const A = assembly('barrow', (a) => {
    const y = r + 0.08;
    for (const s of [-1, 1]) {
      // the rails, from the front over the wheel back to the handles, which the barrowman lifts
      a('timber', tube([[s * 0.27, y + 0.02, -0.62, 0.03], [s * 0.3, y, 0.3, 0.032], [s * 0.3, y + 0.03, 0.75, 0.03], [s * 0.27, y + 0.08, 1.25, 0.022]], 6));
      a('timber', tube([[s * 0.3, y, 0.48, 0.028], [s * 0.3, 0.02, 0.56, 0.026]], 5));                        // a leg
      a('timber', box(s * 0.62 - 0.03, y - 0.02, -0.45, s * 0.62 + 0.03, y + 0.02, 0.45));                       // the platform's outer rail
      for (const z of [-0.4, -0.13, 0.13, 0.4]) a('timber', box(Math.min(s * 0.3, s * 0.62) - 0.01, y + 0.02, z - 0.06, Math.max(s * 0.3, s * 0.62) + 0.01, y + 0.045, z + 0.06));
    }
    for (const z of [-0.6, 0.62]) a('timber', box(-0.3, y - 0.02, z - 0.025, 0.3, y + 0.03, z + 0.025));
    // the arch over the wheel: slats bent over it
    for (let k = 0; k < 6; k++) { const t = Math.PI * (k + 0.5) / 6, g = box(-0.11, -0.012, -0.14, 0.11, 0.012, 0.14); g.rotateX(t - Math.PI / 2); g.translate(0, r + Math.sin(t) * (r + 0.07), -Math.cos(t) * (r + 0.07)); a('timber', g); }
    for (const g of wheel(r, 0.06, 10)) a("timber", at(g, 0, r, 0));
  });
  put('timber', A.timber.clone());
  // the load: a sack or a basket on each platform
  for (const s of [-1, 1]) if (rand() < 0.75) put(rand() < 0.6 ? 'sacking' : 'wicker', at(lz([[0.17, 0], [0.2, 0.18], [0.16, 0.34], [0.001, 0.36]], 8), s * 0.46, r + 0.125, (rand() - 0.5) * 0.3));
}
function ladder(el, { bag }) {
  const put = placer(el, bag), L = el.len ?? 3, lean = 0.28, parts = [];
  for (const s of [-1, 1]) parts.push(box(s * 0.22 - 0.03, 0, -0.03, s * 0.22 + 0.03, L, 0.03));
  for (let k = 1; k < L / 0.32; k++) parts.push(box(-0.22, k * 0.32 - 0.02, -0.02, 0.22, k * 0.32 + 0.02, 0.02));
  for (const g of parts) { g.rotateX(-lean); put('timber', g); }
}
/** A hanging cloth, both faces: f(u, v) → [x, y, z] (u across, v down), nu × nv cells; the back face th behind (−z). */
function hanging(f, nu, nv, th = 0.006) {
  const T = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = f(i / nu, j / nv), b = f((i + 1) / nu, j / nv), c = f((i + 1) / nu, (j + 1) / nv), d = f(i / nu, (j + 1) / nv), k = (p) => [p[0], p[1], p[2] - th];
    T.push(...a, ...c, ...b, ...a, ...d, ...c);                     // the face toward +z
    T.push(...k(a), ...k(b), ...k(c), ...k(a), ...k(c), ...k(d));   // the face toward −z
  }
  return fromTriangles(T);
}
/**
 * The wash hung over a line or a pole from x = xa to xb (the line's height lineY(x), the cloths' roles c0, c1 …):
 * sheets and cloths folded over it (their backs a little shorter), shirts with their sleeves out, each rippled
 * and swelling a little in the air, with gaps; `drop` the longest a cloth may hang, `th` the line's half-thickness.
 */
function hangWash(a, r, xa, xb, lineY, { drop = 1.05, th = 0.012, max = 6 } = {}) {
  let x = xa, k = 0;
  while (x < xb - 0.25 && k < max) {
    const room = xb - x;
    let type = r() < 0.3 ? 'shirt' : r() < 0.5 ? 'sheet' : 'cloth', w = type === 'sheet' ? 0.9 + r() * 0.4 : type === 'shirt' ? 0.42 : 0.35 + r() * 0.3;
    if (type === 'shirt' && (x - 0.2 < xa - 0.05 || x + w + 0.2 > xb + 0.05)) type = 'cloth';                  // a shirt's sleeves within the line
    if (w > room) { if (room < 0.3) break; type = 'cloth'; w = room; }       // the last a cloth that fits
    const h = Math.min(drop, type === 'sheet' ? 0.75 + r() * 0.3 : type === 'shirt' ? 0.62 : 0.4 + r() * 0.35), ph = r() * 6.28, x0 = x;
    const f = (side) => (u, vv) => {
      const xx = x0 + w * u, y = lineY(xx), d = vv * (side ? h * 0.35 : h);
      return [xx, y - th - d + Math.sin(u * Math.PI) * 0.015 * vv, (side ? -th - 0.004 : th) + (side ? -1 : 1) * (0.025 * Math.sin(u * Math.PI * 3 + ph) * vv + 0.05 * vv * Math.sin(u * Math.PI))];
    };
    a(`c${k}`, hanging(f(false), 6, 3)); a(`c${k}`, hanging(f(true), 6, 1));
    if (type === 'shirt') for (const s of [0, 1]) { const sx = s ? x0 + w : x0, sw = 0.2; a(`c${k}`, hanging((u, vv) => { const xx = s ? sx + sw * u : sx - sw * (1 - u), y = lineY(sx) - 0.06 - vv * 0.16 - (s ? u : 1 - u) * 0.12; return [xx, y, th + 0.02 * vv]; }, 2, 1)); }
    x += w + 0.08 + r() * 0.15; k++;
  }
}
/**
 * wash_line: { len, pole, emb, clear, drop } — washing hung across a lane between the upper storeys of two houses, along x from
 * −len/2 to +len/2 at y (the ends `emb` [a, b] metres inside the two walls, out of sight): a rope sagging between
 * iron hooks in the walls, strung from window to window (Venice, Naples, Rome's Trastevere, Cairo), or, `pole`, a
 * bamboo pole laid across from wall to wall on iron brackets, the wash hung over it and the shirts threaded on it
 * (the lanes of Jiangnan and of Edo). `clear` [a, b]: the wash kept that far from each wall (clear of jetties, bays,
 * eaves); `drop` the longest a cloth hangs. Nothing under it but the lane.
 */
function washLine(el, { bag }) {
  const put = placer(el, bag), L = Math.round((el.len ?? 4) * 4) / 4, [ea, eb] = el.emb ?? [0.15, 0.15], pole = !!el.pole, v = (el.seed ?? 1) % 4;
  const [ca, cb] = el.clear ?? [0.3, 0.3], xa = -L / 2 + ea, xb = L / 2 - eb, sag = pole ? 0 : 0.06 + (xb - xa) * 0.025;
  const lineY = (x) => -sag * (1 - (2 * (x - (xa + xb) / 2) / (xb - xa)) ** 2);
  const A = assembly(`wash-line|${L}|${ea}|${eb}|${ca}|${cb}|${pole ? 1 : 0}|${el.drop ?? 0.95}|${v}`, (a) => {
    const r = rng(29 + v * 17);
    if (pole) {
      a('bamboo_culm', tube([[-L / 2, 0, 0, 0.022], [L / 2, 0, 0, 0.02]], 6));
      // the brackets: an iron hook out of each wall under the pole
      for (const [x, s] of [[xa, 1], [xb, -1]]) a('iron', tube([[x - s * 0.12, -0.08, 0, 0.008], [x + s * 0.05, -0.04, 0, 0.007], [x + s * 0.06, 0.02, 0, 0.006]], 4));
    } else {
      a('rope', tube([[-L / 2, 0, 0, 0.006], ...sagged([xa, 0, 0], [xb, 0, 0], sag, 13).map((p) => [...p, 0.006]), [L / 2, 0, 0, 0.006]], 4));
      for (const x of [xa, xb]) a('iron', tube(Array.from({ length: 7 }, (_, k) => { const t = k / 6 * Math.PI * 2; return [x + Math.sin(t) * 0.022, Math.cos(t) * 0.022, 0, 0.005]; }), 4, { capA: false, capB: false }));
    }
    hangWash(a, r, xa + ca, xb - cb, lineY, { drop: el.drop ?? 0.95, th: pole ? 0.026 : 0.01, max: 8 });
  });
  const rand = rng(el.seed), cl = ['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_grey', 'linen', 'cloth_white', 'cloth_brown'];
  for (const [role, g] of Object.entries(A)) put(role === 'rope' ? 'sacking' : role[0] === 'c' ? cl[Math.floor(rand() * cl.length)] : role, g.clone(), role[0] === 'c' ? 0.9 + rand() * 0.2 : 1);
}
/**
 * laundry: { len } — a washing line between two forked props driven into the ground, the line sagging
 * between them, the wash hung over it: sheets and cloths folded over the line (their backs a little
 * shorter), shirts with their sleeves out, each rippled and swelling a little in the air. Four
 * layouts, the cloths' colours from the seed.
 */
function laundry(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), L = Math.round((el.len ?? 3.2) * 2) / 2, v = (el.seed ?? 1) % 4, H = 1.95, sag = 0.13 + L * 0.02;
  const lineY = (x) => H - sag * (1 - (2 * x / L) ** 2);
  const A = assembly(`laundry|${L}|${v}`, (a) => {
    const r = rng(41 + v * 13);
    // the props: a pole, a little leaning out against the line's pull, forked at its head
    for (const s of [-1, 1]) {
      const top = [s * L / 2, H - 0.02, 0];
      a('timber', tube([[s * (L / 2 + 0.12), 0, 0, 0.045], [s * (L / 2 + 0.04), H * 0.6, 0, 0.04], [...top, 0.035]], 6));
      for (const q of [-1, 1]) a('timber', tube([[top[0], top[1] - 0.02, 0, 0.03], [top[0] + s * 0.03, top[1] + 0.16, q * 0.07, 0.022]], 5));
    }
    a('rope', tube(sagged([-L / 2, H, 0], [L / 2, H, 0], sag, 13).map((p) => [...p, 0.007]), 4));
    hangWash(a, r, -L / 2 + 0.25, L / 2 - 0.2, lineY);
  });
  const cl = ['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_grey', 'linen', 'cloth_white', 'cloth_brown'];
  for (const [role, g] of Object.entries(A)) put(role === 'rope' ? 'sacking' : role === 'timber' ? 'timber' : cl[Math.floor(rand() * cl.length)], g.clone(), role[0] === 'c' ? 0.9 + rand() * 0.2 : 1);
}
/**
 * haystack: { kind ('rick' | 'pole') } — a stack of hay round a pole whose head shows at the top
 * (the stozhar of a Russian stog, the pole of a Dutch or English rick), its sides bellied and ragged,
 * drawn in at the foot where it has been pulled at, hay pulled loose round the foot; a weighted rope
 * or two over the top against the wind. Two sizes, from the seed.
 */
function haystack(el, { bag, col }) {
  const put = placer(el, bag), v = (el.seed ?? 1) % 2, k = v ? 1.15 : 0.9, [x, z] = el.at, y = el.y ?? 0;
  const A = assembly(`haystack|${v}`, (a) => {
    const P = [[1.2, 0], [1.38, 0.35], [1.48, 0.95], [1.4, 1.6], [1.1, 2.25], [0.66, 2.8], [0.25, 3.12], [0.001, 3.2]].map(([r, yy]) => [r * k, yy * k]);
    a('thatch', folded(P, 18, 7, -0.05, 5 + v));
    // hay pulled loose round the foot
    a('thatch', slathe([[1.22 * k, 0.02], [1.5 * k, 0.04], [1.72 * k, 0.015], [1.22 * k, 0.11]], 16, (th) => 1 + 0.06 * Math.sin(th * 5 + v)));
    a('timber', tube([[0, 2.6 * k, 0, 0.06], [0.03, 3.9 * k, 0.02, 0.045]], 6));
    // ropes over the top, weighted with stones at their ends
    const top = P[P.length - 1][1], R = (yy) => { const i = Math.max(1, P.findIndex(([, py]) => py >= yy)), [r0, y0] = P[i - 1], [r1, y1] = P[i]; return r0 + (r1 - r0) * (yy - y0) / ((y1 - y0) || 1); };
    const off = (yy) => 0.03 + 0.09 * (1 - yy / top) ** 2, ye = 0.95 * k;
    for (const t of [0.4, 0.4 + Math.PI / 2]) {
      const pts = [];
      for (let q = -8; q <= 8; q++) { const s = q < 0 ? -1 : 1, yy = ye + (top - ye) * (1 - (Math.abs(q) / 8) ** 1.6), rr = q === 0 ? 0 : R(yy) + off(yy); pts.push([Math.cos(t) * rr * s, yy + (q === 0 ? 0.03 : 0.01), Math.sin(t) * rr * s, 0.016]); }
      a('rope', tube(pts, 4));
      for (const s of [-1, 1]) { const rr = R(ye) + off(ye) + 0.06; a('rope', tube([[Math.cos(t) * (rr - 0.06) * s, ye + 0.01, Math.sin(t) * (rr - 0.06) * s, 0.016], [Math.cos(t) * rr * s, ye - 0.2, Math.sin(t) * rr * s, 0.014]], 4)); a('stone', at(ball(0.11, 7).scale(1.2, 0.85, 1), Math.cos(t) * rr * s, ye - 0.38, Math.sin(t) * rr * s)); }
    }
  });
  for (const [role, g] of Object.entries(A)) put({ rope: 'sacking', stone: 'rock_boulder' }[role] ?? role, g.clone());
  col.circle(x, z, 1.45 * k, y, y + 3.2 * k);
}
/**
 * A hen or a cock (front along −z) as an assembly: 'p' its plumage, 't' its tail (a darker or a glossy
 * feather), 'r' its comb and wattles, 'y' its beak, legs and toes. pose: 'up' (standing, looking about)
 * or 'peck' (its head down at the ground); cock: taller, a big comb, the sickle feathers of its tail.
 */
function fowl(pose, cock) {
  return assembly(`fowl|${pose}|${cock ? 1 : 0}`, (a) => {
    const k = cock ? 1.12 : 1, peck = pose === 'peck', by = (cock ? 0.21 : 0.17);
    // the body: a loft from the breast to the saddle, the wings folded on its sides
    a('p', tube([[0, by + 0.03, 0.15 * k, 0.03, 0.04], [0, by + 0.02, 0.09 * k, 0.085, 0.09], [0, by, 0.0, 0.1, 0.1], [0, by + 0.01, -0.07 * k, 0.085, 0.09], [0, by + 0.05, -0.11 * k, 0.05, 0.055]], 9));
    for (const s of [-1, 1]) a('t', tube([[s * 0.085, by + 0.03, -0.05, 0.012, 0.045], [s * 0.095, by + 0.03, 0.04, 0.014, 0.055], [s * 0.07, by + 0.05, 0.12, 0.01, 0.03]], 6));
    // the neck and the head: up, or down at the ground
    const head = peck ? [0, 0.07, -0.21 * k] : [0, by + 0.17 * k, -0.15 * k];
    a('p', tube([[0, by + 0.05, -0.1 * k, 0.05], [0, (by + 0.05 + head[1]) / 2 + (peck ? 0.03 : 0), (head[2] - 0.1 * k) / 2 - (peck ? 0.02 : 0.015), 0.035], [...head, 0.033]], 7));
    a('p', at(ball(0.036, 8).scale(0.9, 1, 1.15), head[0], head[1] - 0.034, head[2]));
    const fwd = peck ? [0, -0.6, -0.8] : [0, -0.1, -1], tip = (d) => [head[0], head[1] + fwd[1] * d, head[2] + fwd[2] * d];
    a('y', tube([[...tip(0.025), 0.013, 0.01], [...tip(0.052), 0.004, 0.003]], 4));
    // the comb along the crown, the wattles under the beak
    const up = peck ? [0, 0.8, -0.6] : [0, 1, -0.1], cw = cock ? 0.035 : 0.018;
    a('r', tube([[head[0], head[1] + up[1] * 0.025 + fwd[1] * 0.012, head[2] + up[2] * 0.025 + fwd[2] * 0.012, 0.006, cw * 0.6], [head[0], head[1] + up[1] * (0.03 + cw * 0.5), head[2] + up[2] * 0.03 - fwd[2] * 0.012, 0.006, cw], [head[0], head[1] + up[1] * 0.03 - fwd[1] * 0.02, head[2] + up[2] * 0.03 - fwd[2] * 0.03, 0.005, cw * 0.4]], 4));
    a('r', at(ball(cock ? 0.018 : 0.011, 6).scale(0.6, 1.3, 1), ...tip(0.02).map((v, i) => v - [0, 0.04, -0.005][i])));
    // the tail: raised feathers, the cock's long sickles arching over and down
    if (cock) for (const [s, q] of [[-1, 0.9], [0, 1.1], [1, 0.8], [-0.5, 0.65], [0.5, 0.7]]) a('t', tube(Array.from({ length: 7 }, (_, i) => { const t = i / 6, th = Math.PI * (0.1 + 0.85 * t); return [s * (0.015 + 0.03 * t), by + 0.05 + Math.sin(th) * 0.2 * q, 0.12 + (1 - Math.cos(th)) * 0.13 * q, 0.006 * (1 - t * 0.5), 0.028 * (1 - t * 0.6)]; }), 5));
    else a('t', tube([[0, by + 0.04, 0.12, 0.025, 0.04], [0, by + 0.12, 0.17, 0.02, 0.05], [0, by + 0.17, 0.19, 0.006, 0.02]], 6));
    // the legs, the three toes forward and one back
    for (const s of [-1, 1]) {
      const hx = s * 0.035, hz = 0.01, ly = by - 0.07;
      a('y', tube([[hx, ly + 0.02, hz, 0.012], [hx, 0.012, hz - 0.005, 0.008]], 5));
      for (const t of [-0.5, 0, 0.5]) a('y', tube([[hx, 0.008, hz - 0.005, 0.006], [hx + Math.sin(t) * 0.055, 0.006, hz - 0.005 - Math.cos(t) * 0.055, 0.004]], 3));
      a('y', tube([[hx, 0.008, hz, 0.005], [hx, 0.006, hz + 0.035, 0.004]], 3));
    }
  });
}
/**
 * A duck or a goose (front along −z) as an assembly: 'p' its plumage, 'h' its head and neck (a drake's darker), 'y'
 * its bill, legs and webbed feet. The duck low and boat-shaped, its tail turned up, the flat bill; the goose larger
 * and upright, the long neck raised or stretched down to graze, the bill with its knob (the Chinese goose) or plain.
 */
function waterfowl(kind, pose) {
  return assembly(`waterfowl|${kind}|${pose}`, (a) => {
    const goose = kind === 'goose', k = goose ? 1.55 : 1, by = 0.12 * k, graze = pose === 'peck' && goose;
    a('p', tube([[0, by + 0.035 * k, 0.15 * k, 0.012 * k, 0.02 * k], [0, by + 0.01 * k, 0.11 * k, 0.06 * k, 0.05 * k], [0, by, 0.02 * k, 0.075 * k, 0.068 * k], [0, by + 0.005 * k, -0.06 * k, 0.07 * k, 0.065 * k], [0, by + 0.02 * k, -0.11 * k, 0.045 * k, 0.05 * k]], 10));
    for (const s of [-1, 1]) a('p', tube([[s * 0.065 * k, by + 0.025 * k, -0.06 * k, 0.012 * k, 0.04 * k], [s * 0.07 * k, by + 0.03 * k, 0.03 * k, 0.014 * k, 0.045 * k], [s * 0.035 * k, by + 0.045 * k, 0.13 * k, 0.008 * k, 0.02 * k]], 6));   // the folded wings
    const nb = [0, by + 0.04 * k, -0.1 * k];
    const head = graze ? [0, 0.04 * k, -0.23 * k] : goose ? [0, by + 0.27 * k, -0.16 * k] : [0, by + 0.12 * k, -0.13 * k];
    const mid = graze ? [0, by - 0.01 * k, -0.19 * k] : [0, (nb[1] + head[1]) / 2, (nb[2] + head[2]) / 2 - 0.01 * k];
    a('h', tube([[...nb, 0.04 * k], [...mid, goose ? 0.022 * k : 0.03 * k], [...head, goose ? 0.02 * k : 0.026 * k]], 7));
    const hr = goose ? 0.028 * k : 0.032;
    a('h', tube([[head[0], head[1], head[2] + hr * 0.6, hr * 0.8], [head[0], head[1] + hr * 0.2, head[2] - hr * 0.2, hr], [head[0], head[1], head[2] - hr * 0.9, hr * 0.7]], 8));
    const fw = graze ? [0, -0.8, -0.6] : [0, -0.15, -1], P = (d) => [head[0], head[1] + fw[1] * d, head[2] + fw[2] * d];
    a('y', tube([[...P(hr * 0.9), goose ? 0.011 * k : 0.017, goose ? 0.011 * k : 0.008], [...P(hr * 0.9 + (goose ? 0.035 : 0.045) * k), goose ? 0.008 * k : 0.019, goose ? 0.006 * k : 0.005], [...P(hr * 0.9 + (goose ? 0.05 : 0.055) * k), goose ? 0.002 : 0.012, 0.003]], 6));
    if (goose && kind === 'goose') a('y', at(ball(0.012 * k, 6).scale(1, 0.8, 1.2), ...P(hr * 0.75).map((v, i) => v + [0, 0.004 * k, 0][i])));                  // the knob
    for (const s of [-1, 1]) {
      const hx = s * 0.03 * k, hz = 0.01 * k;
      a('y', tube([[hx, by - 0.04 * k, hz, 0.011 * k], [hx, 0.012, hz - 0.005, 0.008 * k]], 5));
      a('y', slathe([[0.001, 0], [0.03 * k, 0.002], [0.001, 0.006]], 6, (th) => (Math.sin(th) < 0 ? 1.2 : 0.35)).translate(hx, 0.003, hz - 0.012 * k));       // the webbed foot
    }
  });
}
/**
 * A pigeon, the rock dove of the squares (front along −z) as an assembly: 'p' its grey plumage (the folded wings with
 * their two dark bars), 'n' the neck's green and purple sheen, 't' the tail with its dark end band, 'y' the beak, the
 * cere and the short red legs. pose 'up' or 'peck'.
 */
function pigeon(pose) {
  return assembly(`pigeon|${pose}`, (a) => {
    const peck = pose === 'peck';
    a('p', tube([[0, 0.088, 0.085, 0.022, 0.018], [0, 0.09, 0.04, 0.045, 0.042], [0, 0.088, -0.015, 0.052, 0.05], [0, 0.1, -0.055, 0.045, 0.045], [0, 0.115, -0.075, 0.03, 0.03]], 9));
    for (const s of [-1, 1]) a('p', tube([[s * 0.046, 0.1, -0.04, 0.008, 0.028], [s * 0.05, 0.1, 0.02, 0.009, 0.032], [s * 0.03, 0.095, 0.1, 0.006, 0.016]], 5));
    for (const s of [-1, 1]) for (const z of [0.0, 0.035]) a('t', tube([[s * 0.0545, 0.098, z - 0.008, 0.003, 0.016], [s * 0.0545, 0.098, z + 0.008, 0.003, 0.016]], 4));
    a('t', tube([[0, 0.092, 0.085, 0.024, 0.007], [0, 0.085, 0.13, 0.034, 0.005], [0, 0.081, 0.16, 0.036, 0.004]], 6));
    const head = peck ? [0, 0.035, -0.12] : [0, 0.165, -0.085];
    a('n', tube([[0, 0.11, -0.06, 0.034], [(0 + head[0]) / 2, (0.11 + head[1]) / 2 + (peck ? 0.02 : 0), (head[2] - 0.06) / 2, 0.026], [...head, 0.02]], 7));
    a('p', at(ball(0.021, 8).scale(0.9, 0.95, 1.15), head[0], head[1] - 0.019, head[2]));
    const fw = peck ? [0, -0.7, -0.7] : [0, -0.05, -1], P = (d) => [head[0], head[1] + fw[1] * d, head[2] + fw[2] * d];
    a('y', tube([[...P(0.017), 0.006, 0.005], [...P(0.034), 0.002]], 4));
    for (const sx of [-1, 1]) { const hx = sx * 0.022; a('r', tube([[hx, 0.06, 0.0, 0.007], [hx, 0.006, -0.004, 0.005]], 4)); for (const t of [-0.45, 0, 0.45]) a('r', tube([[hx, 0.005, -0.004, 0.004], [hx + Math.sin(t) * 0.03, 0.004, -0.004 - Math.cos(t) * 0.03, 0.003]], 3)); }
  });
}
/**
 * A turkey (Meleagris gallopavo, the huexolotl of Mesoamerica and the Pueblos' bird; front along −z) as an assembly: 'p'
 * the bronze-black plumage, 'w' the barred wing feathers, 'h' the bare bluish head and neck, 'r' the red wattle and
 * the snood over the beak, 'y' the beak and the long legs. The tom larger, its tail spread in a fan and its beard on
 * the breast; the hen smaller, her tail down. pose 'up' or 'peck'.
 */
function turkey(pose, tom) {
  return assembly(`turkey|${pose}|${tom ? 1 : 0}`, (a) => {
    const k = tom ? 1.15 : 0.85, peck = pose === 'peck' && !tom, by = 0.4 * k;
    a('p', tube([[0, by - 0.01 * k, 0.24 * k, 0.06 * k, 0.07 * k], [0, by, 0.15 * k, 0.15 * k, 0.15 * k], [0, by - 0.01 * k, 0.0, 0.17 * k, 0.17 * k], [0, by + 0.02 * k, -0.12 * k, 0.14 * k, 0.15 * k], [0, by + 0.06 * k, -0.19 * k, 0.07 * k, 0.08 * k]], 10));
    for (const s of [-1, 1]) a('w', tube([[s * 0.15 * k, by + 0.03 * k, -0.08 * k, 0.02 * k, 0.08 * k], [s * 0.165 * k, by + 0.0, 0.07 * k, 0.025 * k, 0.1 * k], [s * 0.1 * k, by - 0.04 * k, 0.22 * k, 0.015 * k, 0.05 * k]], 6));
    if (tom) {
      // the fan: a half disc of tail feathers raised behind, both faces, its rim of paler tips
      const R0 = 0.06, R1 = 0.5 * k, Rb = R1 * 0.86, c = [0, by + 0.05 * k, 0.24 * k], n = 12;
      const p = (r, t, dz) => [c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * r, c[2] + dz + r * 0.12];
      for (const [role, ra, rb] of [['p', R0, Rb], ['w', Rb, R1]]) {
        const T = [];
        for (let i = 0; i < n; i++) { const t0 = Math.PI * (0.02 + 0.96 * i / n), t1 = Math.PI * (0.02 + 0.96 * (i + 1) / n); for (const [dz, f] of [[0.006, 0], [-0.006, 1]]) { const q = [p(ra, t0, dz), p(rb, t0, dz), p(rb, t1, dz), p(ra, t1, dz)]; for (const v of f ? [q[0], q[1], q[2], q[0], q[2], q[3]] : [q[0], q[2], q[1], q[0], q[3], q[2]]) T.push(...v); } }
        a(role, fromTriangles(T));
      }
      a('p', tube([[0, by - 0.02 * k, -0.17 * k, 0.012], [0, by - 0.12 * k, -0.2 * k, 0.018, 0.008]], 4));   // the beard
    } else a('p', tube([[0, by, 0.22 * k, 0.07 * k, 0.03 * k], [0, by - 0.06 * k, 0.4 * k, 0.12 * k, 0.015 * k], [0, by - 0.1 * k, 0.48 * k, 0.12 * k, 0.01 * k]], 6));
    const nb = [0, by + 0.08 * k, -0.18 * k], head = peck ? [0, 0.09, -0.42 * k] : [0, by + 0.32 * k, -0.27 * k];
    a('h', tube([[...nb, 0.05 * k], [(nb[0] + head[0]) / 2, (nb[1] + head[1]) / 2 + (peck ? 0.04 : 0), (nb[2] + head[2]) / 2 - 0.02, 0.03 * k], [...head, 0.024 * k]], 7));
    a('h', at(ball(0.033 * k, 8).scale(0.85, 0.95, 1.2), head[0], head[1] - 0.031 * k, head[2]));
    const fw = peck ? [0, -0.7, -0.7] : [0, -0.15, -1], P = (d) => [head[0], head[1] + fw[1] * d * k, head[2] + fw[2] * d * k];
    a('y', tube([[...P(0.03), 0.011 * k, 0.009 * k], [...P(0.058), 0.003]], 4));
    a('r', tube([[...P(0.022).map((v, i) => v + [0, 0.012, 0][i]), 0.006], [...P(0.05).map((v, i) => v + [0, -0.01 * (tom ? 3 : 1), 0][i]), 0.005]], 4));   // the snood
    a('r', at(ball(0.018 * k, 6).scale(0.6, 1.4, 1), ...P(0.0).map((v, i) => v + [0, -0.05 * k, 0.01][i])));               // the wattle
    for (const s of [-1, 1]) {
      const hx = s * 0.06 * k, ly = by - 0.12 * k;
      a('y', tube([[hx, ly, 0.02, 0.022 * k], [hx, ly - 0.08 * k, 0.03, 0.015 * k], [hx, 0.015, 0.01, 0.011 * k]], 5));
      for (const t of [-0.5, 0, 0.5]) a('y', tube([[hx, 0.01, 0.01, 0.008], [hx + Math.sin(t) * 0.09 * k, 0.007, 0.01 - Math.cos(t) * 0.09 * k, 0.005]], 3));
      a('y', tube([[hx, 0.01, 0.01, 0.007], [hx, 0.007, 0.06 * k, 0.005]], 3));
    }
  });
}
/** chickens: { n, kind ('hen' | 'duck' | 'goose' | 'pigeon' | 'turkey') } — a few fowls about a yard: hens pecking or looking up, now and then a cock among them; or ducks, or geese; pigeons on a square; turkeys. */
function chickens(el, { bag }) {
  if (el.kind === 'duck' || el.kind === 'goose') return flock(el, bag);
  if (el.kind === 'pigeon') return pigeons(el, bag);
  if (el.kind === 'turkey') return turkeys(el, bag);
  const rand = rng(el.seed), n = el.n ?? 4, [x, z] = el.at, rot = el.rot ?? 0, c = Math.cos(rot), sn = Math.sin(rot);
  const PL = [['hide_white', 'hide_white'], ['hide_brown', 'hide_black'], ['hide_tan', 'hide_brown'], ['hide_black', 'hide_black'], ['hide_brown', 'hide_brown']];
  let cock = rand() < 0.4;
  for (let i = 0; i < n; i++) {
    const dx = (rand() - 0.5) * 1.7, dz = (rand() - 0.5) * 1.7, isCock = cock && i === 0, A = fowl(isCock || rand() < 0.4 ? 'up' : 'peck', isCock), [pm, tm] = isCock ? ['hide_brown', 'hide_black'] : PL[Math.floor(rand() * PL.length)];
    const put = placer({ ...el, at: [x + dx * c + dz * sn, z - dx * sn + dz * c], rot: rot + Math.floor(rand() * 12) * Math.PI / 6, s: (el.s ?? 1) * (isCock ? 1 : 0.92 + Math.floor(rand() * 3) * 0.05) }, bag);
    const sh = 0.85 + rand() * 0.3;
    put(pm, A.p.clone(), sh); put(tm, A.t.clone(), tm === pm ? sh * 0.85 : 1); put('cloth_red', A.r.clone()); put('hide_tan', A.y.clone(), [1.15, 1.0, 0.55]);
  }
}
/** A flock of pigeons on a square or a lane, most pecking, spread over a few metres, a few of them darker or paler (the rock dove's colours). */
function pigeons(el, bag) {
  const rand = rng(el.seed), n = el.n ?? 6 + Math.floor(rand() * 6), [x, z] = el.at, sp = el.spread ?? 2.6;
  for (let i = 0; i < n; i++) {
    const dx = (rand() - 0.5) * sp, dz = (rand() - 0.5) * sp, A = pigeon(rand() < 0.6 ? 'peck' : 'up'), v = rand(), pm = v < 0.12 ? 'hide_black' : v < 0.2 ? 'hide_white' : 'hide_grey';
    const put = placer({ ...el, at: [x + dx, z + dz], rot: rand() * 6.28, s: (el.s ?? 1) * (0.92 + rand() * 0.14) }, bag), sh = 0.9 + rand() * 0.2;
    put(pm, A.p.clone(), pm === 'hide_grey' ? [sh * 0.92, sh * 0.95, sh * 1.05] : sh); put(pm === 'hide_white' ? 'hide_white' : 'hide_grey', A.n.clone(), pm === 'hide_white' ? 1 : [0.62, 0.8, 0.7]); put('hide_black', A.t.clone(), 0.9);
    put('hide_black', A.y.clone(), 1); put('cloth_red', A.r.clone(), [1.0, 0.75, 0.8]);
  }
}
/** A few turkeys about a yard: hens pecking, a tom with his tail spread among them now and then. */
function turkeys(el, bag) {
  const rand = rng(el.seed), n = el.n ?? 2 + Math.floor(rand() * 3), [x, z] = el.at, rot = el.rot ?? 0;
  let tom = rand() < 0.5;
  for (let i = 0; i < n; i++) {
    const isTom = tom && i === 0, A = turkey(rand() < 0.5 ? 'peck' : 'up', isTom), dx = (rand() - 0.5) * 2.2, dz = (rand() - 0.5) * 2.2;
    const put = placer({ ...el, at: [x + dx, z + dz], rot: rot + rand() * 6.28, s: (el.s ?? 1) * (0.92 + rand() * 0.12) }, bag), sh = 0.85 + rand() * 0.25;
    put('hide_black', A.p.clone(), [sh * 1.25, sh * 1.05, sh * 0.85]); put('hide_brown', A.w.clone(), [sh * 0.8, sh * 0.75, sh * 0.7]); put('hide_grey', A.h.clone(), [0.75, 0.9, 1.25]);
    put('cloth_red', A.r.clone()); put('hide_tan', A.y.clone(), [1.1, 0.8, 0.75]);
  }
}
/** A few ducks or geese about a yard or at the water's edge: the ducks white or brown with the drake's dark head, the geese white or grey. */
function flock(el, bag) {
  const rand = rng(el.seed), goose = el.kind === 'goose', n = el.n ?? (goose ? 3 : 4), [x, z] = el.at, rot = el.rot ?? 0, c = Math.cos(rot), sn = Math.sin(rot);
  const PL = goose ? [['hide_white', 'hide_white'], ['hide_grey', 'hide_grey'], ['hide_white', 'hide_white']] : [['hide_white', 'hide_white'], ['hide_brown', 'hide_brown'], ['hide_brown', 'hide_black'], ['hide_white', 'hide_white']];
  const sp = goose ? 2.4 : 1.6;
  for (let i = 0; i < n; i++) {
    const dx = (rand() - 0.5) * sp, dz = (rand() - 0.5) * sp, A = waterfowl(el.kind, rand() < 0.35 ? 'peck' : 'up'), [pm, hm] = PL[Math.floor(rand() * PL.length)];
    const put = placer({ ...el, at: [x + dx * c + dz * sn, z - dx * sn + dz * c], rot: rot + (rand() - 0.5) * 1.6, s: (el.s ?? 1) * (0.92 + rand() * 0.14) }, bag);
    const sh = 0.88 + rand() * 0.2;
    put(pm, A.p.clone(), sh); put(hm, A.h.clone(), hm === 'hide_black' ? [0.55, 0.8, 0.6] : sh); put('hide_tan', A.y.clone(), [1.35, 0.85, 0.35]);
  }
}
/**
 * sledge: { load ('casks' | 'bales' | 'empty'), beast ('horse' | none) } — the goods sledge (slede) of
 * the Amsterdam carters, on which the city drew its goods instead of carts (no wheels on the piled
 * streets): two runners turned up at the front and shod with iron, a bed of planks on cross-bars,
 * stakes at the corners joined by rails, the water keg at the front that wet the runners; the shafts
 * forward (−z), to the horse's shoulders when it is in them, else resting on the ground. As
 * src/styles/dutch/dam.js's, but placed as instances.
 */
function sledge(el, { bag, col }) {
  const rand = rng(el.seed), Bk = el.beast ? BEASTS[el.beast] : null, load = el.load ?? ['casks', 'bales', 'casks', 'empty'][Math.floor(rand() * 4)];
  const A = assembly(`sledge|${Bk ? el.beast : ''}|${load}`, (a) => {
    for (const x of [-0.48, 0.48]) {
      a('timber', box(x - 0.06, 0.02, -0.95, x + 0.06, 0.16, 1.4));
      a('iron', box(x - 0.05, 0, -0.95, x + 0.05, 0.02, 1.4));
      a('timber', tube([[x, 0.09, -0.9, 0.06, 0.07], [x, 0.16, -1.15, 0.06, 0.065], [x, 0.4, -1.32, 0.055, 0.055]], 6));
      a('iron', tube([[x, 0.012, -0.94, 0.05, 0.012], [x, 0.06, -1.13, 0.05, 0.012], [x, 0.3, -1.33, 0.045, 0.012]], 4, { capA: false }));
      const end = Bk ? [x * 0.85, Bk.H * 0.6, -3.05] : [x * 0.85, 0.05, -2.85];
      a('timber', tube([[x, 0.2, -0.7, 0.045], [x * 0.92, (0.2 + end[1]) / 2 + 0.05, (-0.7 + end[2]) / 2, 0.042], [...end, 0.035]], 6));
    }
    for (const z of [-0.8, 0.2, 1.2]) a('timber', box(-0.6, 0.16, z - 0.06, 0.6, 0.27, z + 0.06));
    for (let i = 0; i < 6; i++) { const x0 = -0.62 + i * 1.24 / 6; a('planks', box(x0 + 0.005, 0.27, -0.95, x0 + 1.24 / 6 - 0.005, 0.31, 1.38)); }
    for (const x of [-0.56, 0.56]) { for (const z of [-0.88, 1.31]) a('timber', box(x - 0.04, 0.31, z - 0.04, x + 0.04, 0.85, z + 0.04)); a('timber', box(x - 0.03, 0.62, -0.92, x + 0.03, 0.68, 1.35)); }
    // the keg at the front, lying across, its tap toward the runners
    a('timber', slathe([[0.001, -0.17], [0.1, -0.17], [0.13, -0.08], [0.135, 0], [0.13, 0.08], [0.1, 0.17], [0.001, 0.17]], 10).rotateZ(Math.PI / 2).translate(0, 0.31 + 0.135, -0.7));
    for (const xx of [-0.11, 0.11]) a('iron', slathe([[0.121, -0.015], [0.121, 0.015], [0.001, 0.015], [0.001, -0.015]], 10).rotateZ(Math.PI / 2).translate(xx, 0.445, -0.7));
    if (load === 'casks') for (const x of [-0.27, 0.27]) {
      a('timber', slathe([[0.001, -0.55], [0.25, -0.55], [0.3, -0.3], [0.31, 0], [0.3, 0.3], [0.25, 0.55], [0.001, 0.55]], 12).rotateX(Math.PI / 2).translate(x, 0.31 + 0.31, 0.25));
      for (const zz of [-0.42, 0.42]) a('iron', slathe([[0.283, -0.03], [0.283, 0.03], [0.001, 0.03], [0.001, -0.03]], 12).rotateX(Math.PI / 2).translate(x, 0.62, 0.25 + zz));
    } else if (load === 'bales') {
      a('sacking', box(-0.5, 0.31, -0.55, 0.5, 0.86, 0.45)); a('sacking', box(-0.45, 0.31, 0.5, 0.45, 0.8, 1.25)); a('sacking', box(-0.4, 0.86, -0.4, 0.42, 1.25, 0.3));
      for (const z of [-0.2, 0.9]) a('rope', box(-0.515, 0.312, z - 0.03, 0.515, z < 0 ? 0.875 : 0.815, z + 0.03));
    }
  });
  const put = placer(el, bag);
  for (const [role, g] of Object.entries(A)) put({ planks: 'planks_grey', rope: 'cloth_brown' }[role] ?? role, g.clone());
  if (Bk) { const oz = -1.35 - 0.3 - Bk.L / 2, ro = el.rot ?? 0; animal({ t: 'animal', kind: el.beast, gear: false, graze: false, seed: el.seed + 1, y: el.y, rot: ro, at: [el.at[0] + oz * Math.sin(ro), el.at[1] + oz * Math.cos(ro)] }, { bag, col }); }
  const [x, z] = el.at, y = el.y ?? 0, c = Math.sin(el.rot ?? 0), d = Math.cos(el.rot ?? 0);
  col.circle(x + 0.2 * c, z + 0.2 * d, 0.85, y, y + 1.1);
}

// ---- figures -----------------------------------------------------------------------------------
/** A limb from a to b (3-D), radius r0 at a, r1 at b. */
function seg(a, b, r0, r1, n = 6) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-6;
  const g = lathe([[r0, 0], [r1, L], [0.001, L]], n);
  // turn +y onto the direction a→b
  const ax = Math.atan2(Math.hypot(dx, dz), dy), ay = Math.atan2(dx, dz);
  g.rotateX(ax); g.rotateY(ay); g.translate(a[0], a[1], a[2]);
  return g;
}
const ball = (r, n = 10) => lathe(Array.from({ length: 7 }, (_, i) => { const t = i / 6 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);
// ---- boats -----------------------------------------------------------------------------------
/** boat: { kind ('rowboat' | 'canoe' | 'sampan' | 'gondola' | 'dhow' | 'barge' | 'reed' | 'ferry'), len } — a hull (both
 * faces) with its gunwales, wale, stem and stern posts, thwarts and floor; by kind an awning, oars or paddles,
 * the gondola's ferro and forcola, the dhow's raked mast, yard and lateen sail. Sits with its sheer 0.3 above y. */
const BOATS = {
  rowboat: { L: 4.5, B: 1.5, D: 0.6, m: 'timber', sheer: 0.25, flat: 0.3, thwarts: 3 }, canoe: { L: 6, B: 0.8, D: 0.45, m: 'wood_dark', sheer: 0.35, flat: 0, thwarts: 0 },
  sampan: { L: 7, B: 1.8, D: 0.6, m: 'timber', sheer: 0.4, flat: 0.5, awning: 'reed_mat', thwarts: 2 }, gondola: { L: 10.8, B: 1.4, D: 0.55, m: 'lacquer_black', sheer: 0.9, flat: 0.3, thwarts: 2 },
  dhow: { L: 13, B: 3.6, D: 1.6, m: 'timber', sheer: 0.8, flat: 0.2, mast: 9, sail: 'cloth_white', thwarts: 4 }, barge: { L: 12, B: 3, D: 1, m: 'timber', sheer: 0.2, flat: 0.8, awning: 'thatch', thwarts: 3 },
  reed: { L: 4, B: 0.9, D: 0.4, m: 'reed_mat', sheer: 0.6, flat: 0, thwarts: 0 }, ferry: { L: 22, B: 6, D: 1.6, m: 'plaster_white', sheer: 0.4, flat: 0.8, cabin: 'cloth_ochre', thwarts: 0 },
};
function boatParts(kind, L, a) {
  const K = BOATS[kind], B = K.B * L / K.L, D = K.D, n = 16, m = 6, T = [];
  const P = (i, j) => { const t = i / n, u = j / m, half = Math.pow(Math.sin(Math.PI * t), 0.6) * B / 2, sh = K.sheer * (2 * t - 1) ** 4, s = u * 2 - 1; return [half * s, sh + 0.3 - D * (1 - Math.abs(s) ** (1 + K.flat * 3)) * Math.pow(Math.sin(Math.PI * t), 0.3), -L / 2 + L * t]; };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const p = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); T.push(...p, ...b, ...c, ...p, ...c, ...b, ...p, ...c, ...d, ...p, ...d, ...c); }
  a('hull', fromTriangles(T));
  const wood = kind === 'gondola' ? 'trim' : 'timber', big = L > 9 ? 1.6 : 1;
  // the gunwales along the sheer, a wale below them; the stem and stern posts
  if (kind !== 'reed') for (const j of [0, m]) {
    a(wood, tube(Array.from({ length: n - 1 }, (_, i) => [...P(i + 1, j), 0.03 * big, 0.028 * big]), 5));
    a(wood, tube(Array.from({ length: n - 3 }, (_, i) => { const p = P(i + 2, j), q = P(i + 2, j === 0 ? 1 : m - 1); return [p[0] * 0.75 + q[0] * 0.25 + (j ? 0.012 : -0.012), p[1] * 0.75 + q[1] * 0.25, p[2], 0.022 * big, 0.02 * big]; }), 4));
  }
  for (const [e, f] of [[0, 1], [n, n - 1]]) { const top = P(e, m / 2), k = P(f, m / 2); a(wood, tube([[k[0], k[1] + 0.02, k[2], 0.03 * big], [0, top[1], top[2], 0.035 * big], [0, top[1] + 0.07, top[2] * 1.004, 0.03 * big]], 5)); }
  // a reed boat: its bundles bound round at intervals
  if (kind === 'reed') for (let i = 2; i < n - 1; i += 2) a('cloth', tube(Array.from({ length: m + 1 }, (_, j) => { const p = P(i, j); return [p[0] * 1.02, p[1] - 0.01, p[2], 0.012, 0.025]; }), 4, { capA: false, capB: false }));
  // the thwarts, the floor boards
  for (let k = 1; k <= K.thwarts; k++) { const t = k / (K.thwarts + 1), half = Math.pow(Math.sin(Math.PI * t), 0.6) * B / 2 * 0.94; a('timber', box(-half, 0.2, -L / 2 + L * t - 0.11, half, 0.25, -L / 2 + L * t + 0.11)); }
  if (K.flat > 0.25 && kind !== 'ferry') { const fy = 0.3 - D + D * 0.18, fw = B * 0.3; a('timber', box(-fw, fy, -L * 0.33, fw, fy + 0.03, L * 0.33)); }
  if (K.awning) { const g = slathe([[0.001, 0], [B * 0.42, 0], [B * 0.42, L * 0.3], [0.001, L * 0.3]], 12, (th) => (Math.sin(th) > 0.05 ? 0.001 : 1)); g.rotateX(Math.PI / 2); g.translate(0, 0.3, -L * 0.1); a('awning', g);
    for (const z of [-L * 0.1, L * 0.05, L * 0.2]) a('timber', tube(Array.from({ length: 9 }, (_, k) => { const th = Math.PI * k / 8; return [Math.cos(th) * B * 0.43, 0.3 + Math.sin(th) * B * 0.43, z, 0.025]; }), 4)); }
  // oars, paddles
  if (kind === 'rowboat') for (const s of [-1, 1]) { a('timber', tube([[s * 0.32, 0.29, -L * 0.36, 0.022], [s * 0.3, 0.3, L * 0.18, 0.026]], 5)); a('timber', box(s * 0.3 - 0.07, 0.28, L * 0.18, s * 0.3 + 0.07, 0.3, L * 0.32)); for (const z of [-0.05, 0.08]) a('timber', box(s * B * 0.47 - 0.015, 0.3, z - 0.015, s * B * 0.47 + 0.015, 0.42, z + 0.015)); }
  if (kind === 'canoe') { a('timber', tube([[0.12, 0.05, -1.2, 0.02], [0.08, 0.06, 0.2, 0.02]], 5)); a('timber', slathe([[0.001, 0], [0.08, 0.06], [0.08, 0.35], [0.001, 0.45]], 6).scale(1, 1, 0.2).rotateX(Math.PI / 2).translate(0.08, 0.06, 0.2)); }
  // the gondola: the ferro at the bow (its six teeth forward, the comb above), the forcola and the oar at the stern
  if (kind === 'gondola') {
    const bow = P(0, m / 2), zb = bow[2], yb = bow[1];
    a('ferro', box(-0.015, yb - 0.25, zb - 0.12, 0.015, yb + 0.55, zb + 0.08));
    a('ferro', box(-0.015, yb + 0.45, zb - 0.32, 0.015, yb + 0.62, zb + 0.08));
    for (let k = 0; k < 6; k++) a('ferro', box(-0.015, yb - 0.15 + k * 0.1, zb - 0.32, 0.015, yb - 0.1 + k * 0.1, zb - 0.1));
    a('ferro', box(-0.015, yb - 0.32, zb - 0.22, 0.015, yb - 0.22, zb + 0.02));
    a('timber', tube([[B * 0.32, 0.3, L * 0.3, 0.05], [B * 0.34, 0.65, L * 0.3, 0.045], [B * 0.36, 0.72, L * 0.3 - 0.08, 0.04]], 5));
    a('timber', tube([[B * 0.2, 1.0, L * 0.3 + 1.1, 0.03], [B * 0.36, 0.73, L * 0.3, 0.035], [B * 0.5 + 1.5, -0.2, L * 0.3 - 1.2, 0.03]], 5));
    a('timber', slathe([[0.001, 0], [0.08, 0.05], [0.08, 0.5], [0.001, 0.55]], 6).scale(1, 1, 0.25).rotateX(Math.PI / 2).rotateY(Math.atan2(1.5 + B * 0.14, -1.2)).translate(B * 0.5 + 1.5, -0.2, L * 0.3 - 1.2));
    a('trim', box(-B * 0.3, 0.28, -L * 0.06, B * 0.3, 0.42, L * 0.06)); a('trim', box(-B * 0.3, 0.42, L * 0.05, B * 0.3, 0.75, L * 0.065));
  }
  // the dhow: the mast raked forward, the long yard slung from its head, the lateen sail between the yard and the bow
  if (K.mast) {
    const mz = -L * 0.12, top = [0, 0.2 + K.mast, mz - K.mast * 0.12];
    a('timber', tube([[0, 0.2 - D * 0.6, mz, 0.14], [0, 0.6, mz - 0.05, 0.13], [...top, 0.08]], 6));
    // the yard crosses the masthead: its fore end down near the stem, its after end high over the stern
    const y0 = [0, 1.5, -L * 0.46], y1 = top.map((v, i) => v + (v - y0[i]) * 0.6), cl = [0, 1.7, L * 0.33], sx = 0.25;
    a('timber', tube([[...y0, 0.05], [...top.map((v, i) => (i === 1 ? v + 0.12 : i === 0 ? sx * 0.4 : v)), 0.09], [...y1, 0.04]], 5));
    // the sail hangs from the yard to the clew, bellied out a little to one side
    const S = [], N = 6, Q = (u, v) => { const p = y0.map((c, i) => c + (y1[i] - c) * u), q = y0.map((c, i) => c + (cl[i] - c) * u); return [sx * 0.5 + Math.sin(Math.PI * u) * Math.sin(Math.PI * v) * 0.6, p[1] + (q[1] - p[1]) * v, p[2] + (q[2] - p[2]) * v]; };
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const p = Q(i / N, j / N), b = Q((i + 1) / N, j / N), c = Q((i + 1) / N, (j + 1) / N), d = Q(i / N, (j + 1) / N); S.push(...p, ...b, ...c, ...p, ...c, ...d, ...p, ...c, ...b, ...p, ...d, ...c); }
    a('sail', fromTriangles(S));
    a('rope', tube([[sx * 0.5, cl[1], cl[2], 0.012], [0, 0.4, L * 0.42, 0.012]], 3)); a('rope', tube([[...y0, 0.014], [0, 0.45, -L * 0.47, 0.014]], 3));
    a('rope', tube([[0, top[1] - 0.2, top[2], 0.015], [0, 0.4, L * 0.1, 0.015]], 3));
  }
  if (K.cabin) a('cabin', box(-B * 0.35, 0.3, -L * 0.3, B * 0.35, 2.6, L * 0.3));
}
/**
 * Where a boat's y goes above the water for it to float right (m): its sheer stands 0.3 above y
 * amidships, its keel D below that; afloat, a laden small boat shows some 0.2–0.3 m of side above the
 * water, a dhow or a ferry 0.7 — about 45 % of its depth, drawing the rest.
 */
export function boatFloat(kind) { const K = BOATS[kind] ?? BOATS.rowboat; return Math.min(0.75, Math.max(0.18, K.D * 0.45)) - 0.3; }
function boat(el, { bag }) {
  const put = placer(el, bag), kind = BOATS[el.kind] ? el.kind : 'rowboat', K = BOATS[kind], L = el.len ?? K.L;
  const A = assembly(`boat|${kind}|${L}`, (a) => boatParts(kind, L, a));
  const mats = { hull: K.m, timber: 'timber', trim: 'wood_dark', awning: K.awning, sail: K.sail, cabin: K.cabin, ferro: 'steel_chrome', rope: 'sacking', cloth: 'thatch' };
  for (const [role, g] of Object.entries(A)) put(mats[role] ?? 'timber', g.clone());
}

// ---- the modern street -----------------------------------------------------------------------
/** car: { era (1930 | 1970), mat } */
function car(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed), old = (el.era ?? 1930) < 1950, m = el.mat ?? (old ? ['car_black', 'car_black', 'car_cream', 'car_blue'] : ['car_red', 'car_blue', 'car_cream', 'car_black', 'hide_tan'])[Math.floor(rand() * 5) % (old ? 4 : 5)];
  const L = old ? 4.4 : 4.6, W = old ? 1.7 : 1.75, r = old ? 0.36 : 0.32;
  if (old) {
    put(m, box(-W / 2 + 0.25, 0.42, -L / 2 + 0.15, W / 2 - 0.25, 1.05, -0.55));                    // the hood
    put('steel_chrome', box(-W / 2 + 0.3, 0.45, -L / 2 + 0.08, W / 2 - 0.3, 1.0, -L / 2 + 0.16));     // the radiator
    put(m, box(-W / 2 + 0.12, 0.42, -0.6, W / 2 - 0.12, 1.15, L / 2 - 0.2));                        // the body
    put(m, box(-W / 2 + 0.16, 1.15, -0.5, W / 2 - 0.16, 1.72, 1.35));                               // the cabin
    put('glass_outer', box(-W / 2 + 0.14, 1.22, -0.45, W / 2 - 0.14, 1.6, 1.25));
    put(m, box(-W / 2 + 0.2, 0.55, 1.35, W / 2 - 0.2, 1.25, L / 2 - 0.05));                          // the boot
    for (const sx of [-1, 1]) {
      put('rubber', box(sx * (W / 2 + 0.02) - 0.08, 0.38, -0.5, sx * (W / 2 + 0.02) + 0.08, 0.42, 1.05));   // the running boards
      for (const zz of [-L / 2 + 0.75, L / 2 - 0.8]) { const g = lathe([[r + 0.12, 0], [r + 0.12, 0.26], [0.001, 0.26]], 12, (th) => (Math.sin(th) < -0.1 ? 0.001 : 1)); g.translate(0, -0.13, 0); g.rotateZ(Math.PI / 2); put(m, at(g, sx * (W / 2 - 0.06), r, zz)); }
      for (const zz of [-L / 2 + 0.75, L / 2 - 0.8]) put('steel_chrome', at(lying(0.12, 0.24, 8), sx * (W / 2 - 0.06), r, zz));
    }
    for (const sx of [-0.55, 0.55]) put('lamp_glass', at(lz([[0.1, 0], [0.12, 0.08], [0.001, 0.16]], 8).rotateX(-Math.PI / 2), sx, 1.0, -L / 2 + 0.2));
  }
  else { put(m, box(-W / 2, 0.35, -L / 2, W / 2, 0.95, L / 2)); put(m, box(-W / 2 + 0.1, 0.95, -0.6, W / 2 - 0.1, 1.35, 1.2)); put('glass_outer', box(-W / 2 + 0.08, 1.0, -0.55, W / 2 - 0.08, 1.3, 1.15)); }
  for (const s of [-1, 1]) for (const zz of [-L / 2 + 0.75, L / 2 - 0.8]) put('rubber', at(lying(r, 0.22, 12), s * (W / 2 - 0.08), r, zz));
  put('steel_chrome', box(-W / 2 + 0.1, 0.3, -L / 2 - 0.05, W / 2 - 0.1, 0.42, -L / 2 + 0.02));
  const [x, z] = el.at, y = el.y ?? 0; col.circle(x, z, 1.2, y, y + 1.5);
}
function streetLamp(el, { bag }) {
  const put = placer(el, bag), h = el.h ?? 4.5;
  put('iron', lz([[0.12, 0], [0.1, 0.4], [0.06, 0.5], [0.05, h], [0.001, h]], 8));
  put('lamp_glass', at(lz([[0.12, 0], [0.2, 0.35], [0.18, 0.5], [0.001, 0.55]], 8), 0, h, 0));
  put('iron', at(lz([[0.2, 0], [0.001, 0.15]], 8), 0, h + 0.55, 0));
}

/** lantern: { kind ('paper' | 'white' | 'iron' | 'oil'), h } — a lantern on its post or bracket, lit at night. */
function lantern(el, { bag }) {
  const put = placer(el, bag), kind = el.kind ?? 'iron', h = el.h ?? 2.2;
  put('timber', box(-0.05, 0, -0.05, 0.05, h + 0.3, 0.05));
  put('timber', box(-0.03, h + 0.25, -0.03, 0.03, h + 0.31, 0.45));
  if (kind === 'paper' || kind === 'white') { put(kind === 'paper' ? 'lamp_paper' : 'lamp_white', at(lz([[0.08, 0], [0.17, 0.08], [0.18, 0.25], [0.16, 0.38], [0.08, 0.45], [0.001, 0.45]], 12), 0, h - 0.25, 0.42)); put('lacquer_black', at(lz([[0.09, 0], [0.09, 0.04], [0.001, 0.04]], 10), 0, h + 0.2, 0.42)); }
  else if (kind === 'oil') { put('terracotta', at(lz([[0.05, 0], [0.09, 0.04], [0.07, 0.07], [0.001, 0.07]], 10), 0, h - 0.05, 0.42)); put('lamp_white', at(lz([[0.02, 0], [0.001, 0.07]], 6), 0.06, h + 0.02, 0.42)); }
  else { put('iron', box(-0.13, h - 0.25, 0.29, 0.13, h - 0.22, 0.55)); put('lamp_glass', box(-0.1, h - 0.22, 0.32, 0.1, h + 0.08, 0.52)); put('iron', at(lz([[0.17, 0], [0.001, 0.15]], 4), 0, h + 0.08, 0.42)); }
}
// ---- the life of a street front and a canal ----------------------------------------------------
/** shop_sign: a shop's cloth banner hanging from a bracket out of the wall (the bracket along +z), turned edge-on to the wall so it reads along the street; h the bracket's height; cloth, letters. */
function shopSign(el, { bag }) {
  if (el.board) return boardSign(el, bag);
  const put = placer(el, bag), h = el.h ?? 2.9, c = el.cloth ?? 'cloth_indigo', len = el.len ?? 1.5, out = el.out ?? 0.95, z0 = 0.3, z1 = out - 0.05, zm = (z0 + z1) / 2;
  put('timber', box(-0.04, h - 0.05, 0, 0.04, h + 0.04, out));
  put('timber', seg([0, h - 0.6, 0.02], [0, h, out * 0.6], 0.025, 0.025, 4));
  put('timber', box(-0.035, h - 0.13, z0 - 0.04, 0.035, h - 0.07, z1 + 0.04));
  put(c, box(-0.012, h - 0.13 - len, z0, 0.012, h - 0.13, z1));
  put(el.trim ?? 'cloth_white', box(-0.014, h - 0.13 - len - 0.1, z0, 0.014, h - 0.13 - len, z1));
  const letters = el.letters ?? 3;
  for (let k = 0; k < letters; k++) { const yy = h - 0.32 - k * (len - 0.25) / letters, hh = Math.min(0.28, (len - 0.3) / letters - 0.08); put(el.ink ?? 'cloth_white', box(-0.016, yy - hh, zm - 0.13, 0.016, yy, zm + 0.13)); put(c, box(-0.019, yy - hh + 0.04, zm - 0.025, 0.019, yy - 0.04, zm + 0.025)); put(c, box(-0.019, yy - hh / 2 - 0.02, zm - 0.09, 0.019, yy - hh / 2 + 0.02, zm + 0.09)); }
  for (const zz of [z0 + 0.05, z1 - 0.05]) put('cloth_red', seg([0, h - 0.13 - len - 0.1, zz], [0, h - 0.13 - len - 0.4, zz], 0.02, 0.012, 4));
}
/** The European shop sign: an iron bracket with a scroll out of the wall (along +z), a painted board hanging edge-on to the wall, a device on it. */
function boardSign(el, bag) {
  const put = placer(el, bag), rand = rng(el.seed), h = el.h ?? 3.2, out = 1.1, c = el.cloth ?? ['wood_painted', 'stucco_red', 'stucco_leaf', 'stucco_sky', 'stucco_saffron'][Math.floor(rand() * 5)];
  put('iron', box(-0.02, h - 0.02, 0, 0.02, h + 0.02, out));
  put('iron', seg([0, h - 0.5, 0.02], [0, h, out * 0.55], 0.015, 0.015, 4));
  for (let k = 0; k < 6; k++) { const a0 = k / 6 * Math.PI * 1.6, a1 = (k + 1) / 6 * Math.PI * 1.6, r = 0.12; put('iron', seg([0, h + 0.14 + Math.sin(a0) * r, out * 0.35 + Math.cos(a0) * r], [0, h + 0.14 + Math.sin(a1) * r, out * 0.35 + Math.cos(a1) * r], 0.01, 0.01, 3)); }
  for (const zz of [0.42, 0.98]) put('iron', box(-0.006, h - 0.25, zz - 0.006, 0.006, h, zz + 0.006));
  put(c, box(-0.025, h - 0.85, 0.36, 0.025, h - 0.25, 1.04));
  put('gilt_bronze', box(-0.045, h - 0.81, 0.4, 0.045, h - 0.78, 1.0)); put('gilt_bronze', box(-0.045, h - 0.32, 0.4, 0.045, h - 0.29, 1.0));
  const dev = Math.floor(rand() * 3);
  if (dev === 0) put('gilt_bronze', at(lz([[0.001, 0], [0.12, 0.05], [0.13, 0.15], [0.06, 0.3], [0.001, 0.32]], 8).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), 0, h - 0.55, 0.7));
  else if (dev === 1) put('cloth_white', box(-0.06, h - 0.7, 0.55, 0.06, h - 0.4, 0.85));
  else put('pottery_dark', at(lz([[0.07, 0], [0.12, 0.08], [0.12, 0.2], [0.05, 0.26], [0.001, 0.26]], 8), 0.04, h - 0.7, 0.7));
}
/** hang_lantern: a lantern on a cord from an eave { kind ('paper' | 'white'), drop }; y is the hook. */
function hangLantern(el, { bag }) {
  const put = placer(el, bag), d = el.drop ?? 0.35, m = el.kind === 'white' ? 'lamp_white' : 'lamp_paper';
  put('timber', box(-0.006, -d, -0.006, 0.006, 0, 0.006));
  put('lacquer_black', at(lz([[0.08, 0], [0.08, 0.05], [0.001, 0.05]], 10), 0, -d - 0.05, 0));
  put(m, at(lz([[0.07, 0], [0.18, 0.07], [0.21, 0.22], [0.18, 0.37], [0.07, 0.44], [0.001, 0.44]], 12), 0, -d - 0.5, 0));
  put('lacquer_black', at(lz([[0.07, 0], [0.07, 0.05], [0.001, 0.05]], 10), 0, -d - 0.55, 0));
  put('cloth_red', seg([0, -d - 0.55, 0], [0, -d - 0.85, 0], 0.025, 0.01, 4));
}
/** laundry_pole: a bamboo pole pushed out of a window over the street or the water (along +z), clothes hanging from it; y is the window sill. */
function laundryPole(el, { bag }) {
  // (lengths and the cloths' sizes in steps, so that poles and cloths share their shapes)
  const put = placer(el, bag), rand = rng(el.seed), L = Math.max(1, Math.round((el.len ?? 2.4) * 4) / 4), CL = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_green'];
  const yb = 0.1, ye = 0.45;
  put('bamboo_culm', seg([0, yb, -0.3], [0, ye, L], 0.025, 0.02, 6));
  const n = 2 + Math.floor(rand() * 3);
  for (let k = 0; k < n; k++) {
    const t = 0.25 + k * 0.7 / n + rand() * 0.05, zz = -0.3 + (L + 0.3) * t, yy = yb + (ye - yb) * t, w = 0.25 + Math.floor(rand() * 4) * 0.11, h = 0.4 + Math.floor(rand() * 4) * 0.19, c = CL[Math.floor(rand() * CL.length)];
    const xo = (k % 2 ? 1 : -1) * 0.045;                                      // alternate sides of the pole, so neighbours never share a plane
    put(c, box(xo - 0.015, yy - h, zz - w / 2, xo + 0.015, yy, zz + w / 2));
    if (rand() < 0.4) for (const s of [-1, 1]) put(c, box(xo - 0.014, yy - h * 0.55, zz + s * (w / 2 + 0.1) - 0.08, xo + 0.014, yy - 0.05, zz + s * (w / 2 + 0.1) + 0.08));   // a jacket's sleeves
  }
  if (el.prop !== false) put('bamboo_culm', seg([0, -1.6, L * 0.8], [0, ye - 0.02, L * 0.8], 0.018, 0.018, 5));
}
/** tea_table: a square table with stools (or benches) round it, a teapot and cups. */
function teaTable(el, { bag, col }) {
  const put = placer(el, bag), rand = rng(el.seed);
  put('wood_dark', box(-0.45, 0.74, -0.45, 0.45, 0.8, 0.45));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('wood_dark', box(sx * 0.4 - 0.03, 0, sz * 0.4 - 0.03, sx * 0.4 + 0.03, 0.74, sz * 0.4 + 0.03));
  put('wood_dark', box(-0.42, 0.62, -0.42, 0.42, 0.66, 0.42));
  for (const [dx, dz] of [[0, -0.85], [0, 0.85], [-0.85, 0], [0.85, 0]]) {
    if (rand() < 0.2) continue;
    const b = dx === 0 ? box(-0.5, 0.42, dz - 0.13, 0.5, 0.46, dz + 0.13) : box(dx - 0.13, 0.42, -0.5, dx + 0.13, 0.46, 0.5);
    put('timber', b);
    for (const s of [-1, 1]) put('timber', dx === 0 ? box(s * 0.42 - 0.025, 0, dz - 0.1, s * 0.42 + 0.025, 0.42, dz + 0.1) : box(dx - 0.1, 0, s * 0.42 - 0.025, dx + 0.1, 0.42, s * 0.42 + 0.025));
  }
  put('pottery_dark', at(lz([[0.06, 0], [0.09, 0.04], [0.09, 0.09], [0.04, 0.13], [0.05, 0.15], [0.001, 0.15]], 10), 0.05, 0.8, 0.05));
  put('pottery_dark', seg([0.14, 0.86, 0.05], [0.21, 0.92, 0.05], 0.012, 0.008, 4));
  for (const [cx2, cz2] of [[-0.25, -0.2], [0.25, -0.22], [-0.22, 0.25], [0.2, 0.26]]) if (rand() < 0.8) put('glaze_white', at(lz([[0.025, 0], [0.04, 0.05], [0.001, 0.05]], 8), cx2, 0.8, cz2));
  if (rand() < 0.5) put('wicker', at(lz([[0.1, 0], [0.13, 0.08], [0.001, 0.08]], 8), -0.2, 0.8, 0.12));
  const [x, z] = el.at, y = el.y ?? 0; col.circle(x, z, 0.55, y, y + 0.8);
}
/** drying_tray: a round flat bamboo tray on a trestle, things laid out to dry (greens, red peppers, beans). */
function dryingTray(el, { bag }) {
  const put = placer(el, bag), rand = rng(el.seed), r = 0.45 + rand() * 0.15, h = el.h ?? 0.55;
  for (const s of [-1, 1]) { put('bamboo_culm', seg([s * 0.35, 0, -0.3], [s * 0.25, h, 0.3], 0.02, 0.02, 4)); put('bamboo_culm', seg([s * 0.35, 0, 0.3], [s * 0.25, h, -0.3], 0.02, 0.02, 4)); }
  put('wicker', lz([[0.001, h], [r, h], [r, h + 0.06], [r - 0.03, h + 0.06], [r - 0.03, h + 0.025], [0.001, h + 0.025]], 14));
  const goods = ['cloth_green', 'cloth_red', 'cloth_ochre', 'cloth_brown'][Math.floor(rand() * 4)];
  for (let k = 0; k < 14; k++) { const a = rand() * 6.28, d = Math.sqrt(rand()) * (r - 0.08); put(goods, box(Math.cos(a) * d - 0.05, h + 0.025, Math.sin(a) * d - 0.03, Math.cos(a) * d + 0.05, h + 0.045, Math.sin(a) * d + 0.03)); }
}
/** oar: the long sculling oar (yuloh) over a boat's stern, its blade in the water, along −z from the pin. */
function oar(el, { bag }) {
  const put = placer(el, bag);
  put('timber', seg([0, 0.95, 0.9], [0, 0.05, -0.9], 0.035, 0.03, 5));
  put('timber', seg([0, 0.05, -0.9], [0, -0.4, -2.2], 0.03, 0.03, 5));
  put('timber', box(-0.09, -0.6, -2.6, 0.09, -0.3, -1.9));
  put('cloth_brown', seg([0, 0.95, 0.9], [0, 0.1, 0.4], 0.006, 0.006, 3));
}

registerStyle('life', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { pot, basket, sacks, barrel, crates, firewood, bench, trough, well, stall, cart, sledge, barrow, ladder, laundry, haystack, animal, chickens, figure, boat, car, street_lamp: streetLamp, lantern, shop_sign: shopSign, hang_lantern: hangLantern, laundry_pole: laundryPole, tea_table: teaTable, drying_tray: dryingTray, oar, goods_mat: goodsMat, stool, rain_tub: rainTub, handcart, wash_line: washLine },
  objects: {},
});
export const LIFE_KINDS = ['pot', 'basket', 'sacks', 'barrel', 'crates', 'firewood', 'bench', 'trough', 'well', 'stall', 'cart', 'sledge', 'barrow', 'ladder', 'laundry', 'haystack', 'animal', 'chickens', 'figure', 'boat', 'car', 'street_lamp', 'lantern', 'shop_sign', 'hang_lantern', 'laundry_pole', 'tea_table', 'drying_tray', 'oar', 'goods_mat', 'stool', 'rain_tub', 'handcart', 'wash_line'];
