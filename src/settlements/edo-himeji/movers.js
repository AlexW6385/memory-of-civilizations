// Edo Himeji — the moving life of the avenue, the lanes of the samurai quarter and the merchants' street
// (docs/settlements/edo-himeji.md §5.4): townsmen in kimono and obi, women with the hair in a bun, samurai with the two
// swords and the shaven crown, porters and pedlars with straw hats (kasa), labourers; in the rain the rush-straw raincape
// (mino) over the straw hat. No boats on the moats. Data for the engine's movers (src/engine/movers.js).
import { RADIUS, streets, lots, furniture, OUTER, INNER, MIDDLE, OTEMON } from './layout.js';
import { LEVEL } from './layout.js';
import '../../styles/edo/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';
import { STYLES } from '../../core/build.js';

export const PARAMS = {
  walkers: { day: 46, night: 6, rain: 0.7, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 6, reach: 250, spawnMin: 60, far: 95, speed: [0.8, 1.2], bridgeSpeed: 0.7 },
  water: LEVEL.water,
};

/** The share of shop fronts on the merchants' street's stretch (the crowd goes there by day). */
const shopShare = (r) => (r[1] > 325 ? 1 : 0);
/** The ways: the avenue from the main gate, the lanes between the samurai blocks, the merchants' street (the busiest). */
export function walkways() {
  const rects = streets().map((r) => {
    const w = Math.min(r[2] - r[0], r[3] - r[1]), shops = shopShare(r);
    return { r, weight: (w > 7 ? 1.3 : 0.7) * (1 + 3 * shops), market: shops, kind: w > 7 ? 'street' : 'lane' };
  });
  void lots;
  return { rects, links: [], clip: RADIUS - 14 };
}
/** The moats' reaches the boats pole along: the inner moat's four sides, the middle moat either side of its causeway. */
export function waterways() {
  const [ox0, oz0, ox1, oz1] = OUTER, [ix0, iz0, ix1, iz1] = INNER, gx = OTEMON.w / 2, rects = [
    { r: [ox0 + 3, oz0 + 3, ox1 - 3, iz0 - 3], weight: 1 }, { r: [ox0 + 3, oz0 + 3, ix0 - 3, oz1 - 3], weight: 1 }, { r: [ix1 + 3, oz0 + 3, ox1 - 3, oz1 - 3], weight: 1 },
    { r: [ox0 + 3, iz1 + 3, -gx - 3, oz1 - 3], weight: 0.6 }, { r: [gx + 3, iz1 + 3, ox1 - 3, oz1 - 3], weight: 0.6 }];
  for (const sx of [-1, 1]) { const xm = Math.sqrt(RADIUS ** 2 - MIDDLE.z1 ** 2) - 30, a = MIDDLE.gap / 2 + 14; rects.push({ r: sx > 0 ? [a, MIDDLE.z0 + 3, xm, MIDDLE.z1 - 3] : [-xm, MIDDLE.z0 + 3, -a, MIDDLE.z1 - 3], weight: 1 }); }
  return { rects, bridges: [], clip: RADIUS - 18 };
}
export async function staticBoats() {
  return furniture().filter((f) => f.t === 'moat_boat').map((f) => ({ c: f.at, u: f.dir ?? [1, 0], hl: (f.len ?? 7.5) / 2 + 0.3, hw: 1.0 }));
}

const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red' };
export const WALKERS = [
  // the townsman: kimono with the obi, the topknot
  { id: 'townsman', weight: 1.6, market: 1.6, el: { dress: 'robe', hair: 'topknot', hairMat: 'hair_dark', over: 'sash', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.indigo, CL.indigo, CL.grey, CL.brown, CL.green], c2: [CL.grey, CL.black, CL.brown], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  // the samurai: dark kimono with the hakama, shaven crown and topknot, the two swords at the left hip
  { id: 'samurai', weight: 0.9, market: 0.7, el: { dress: 'robe', hair: 'topknot', hairMat: 'hair_dark', over: 'collar', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.black, CL.indigo, CL.grey, CL.brown], c2: [CL.grey, CL.black], c3: [CL.black], speed: [1.0, 1.25], stride: 1.5 },
  // the woman: kimono with a wide obi, the hair up
  { id: 'woman', weight: 1.1, market: 1.3, el: { dress: 'robe', hair: 'bun', hairMat: 'hair_dark', over: 'sash', arms: 'hang', feet: 'shod' }, wet: 'cape', swing: 0.6,
    c1: [CL.indigo, CL.maroon, CL.ochre, CL.green, CL.grey], c2: [CL.red, CL.ochre, CL.indigo, CL.white], c3: [CL.black], speed: [0.9, 1.15], stride: 1.1, h: [0.9, 0.96] },
  // the pedlar and the porter: the carrying pole with its two loads, the straw hat
  { id: 'pedlar', weight: 0.9, market: 1.3, el: { dress: 'wrap', hair: 'topknot', hat: 'straw', carry: 'pole', arms: 'pole', feet: 'bare' }, wet: 'cape', swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.white, CL.indigo], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1, pole: true },
  { id: 'labourer', weight: 0.8, market: 0.6, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'hang', feet: 'bare' }, wet: 'cape',
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.indigo, CL.grey], c3: [CL.black], speed: [1.15, 1.45], stride: 1.4 },
  { id: 'ashigaru', weight: 0.5, market: 0.3, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'hang', feet: 'bare', over: 'collar' }, wet: 'cape',
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.grey, CL.brown], c3: [CL.black], speed: [1.1, 1.35], stride: 1.4 },
  { id: 'apprentice', weight: 0.6, market: 1.2, el: { dress: 'robe', hair: 'topknot', over: 'apron', arms: 'hang', feet: 'bare' }, wet: 'cape',
    c1: [CL.indigo, CL.brown, CL.grey], c2: [CL.white, CL.indigo], c3: [CL.black], speed: [1.2, 1.6], stride: 1.4, h: [0.8, 0.9] },
  { id: 'child', weight: 0.35, market: 0.3, el: { dress: 'robe', hair: 'topknot', arms: 'hang' }, c1: [CL.ochre, CL.indigo, CL.red], c2: [CL.white], c3: [CL.black], speed: [1.2, 1.7], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
];
export const CREW = {
  boatman: { el: { dress: 'wrap', hair: 'topknot', hat: 'straw', arms: 'pull', feet: 'bare' }, wet: 'cape', c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.indigo, CL.grey], c3: [CL.black] },
  passenger: { el: { dress: 'robe', hair: 'topknot', over: 'collar', pose: 'cross' }, c1: [CL.indigo, CL.grey, CL.brown, CL.black], c2: [CL.grey, CL.black], c3: [CL.black] },
};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet) { el.over = 'cloak'; cape = 'thatch_palm'; if (!el.hat || el.hat === 'none') { el.hat = 'straw'; el.hatMat = 'thatch'; } }
    addFigure(sb, v, figure, el, { far, cape });
  }
}
export const BOAT = { L: 7, pin: [0.1, 0.6, 3.0], deck: 0.06, stern: 2.5, passenger: [-0.05, 0.06, -0.5], hull: [1.05, 3.6] };
/** The flat-bottomed river boat (takase-bune): bow and stern raised, planks inside, a thwart or two; keel along z, bow toward -z, waterline at y 0. */
function hullTris(L, hw = 0.8) {
  const t = [], n = 8, prof = (k) => { const u = -L / 2 + L * k / n, e = Math.abs(u) / (L / 2); return [u, hw * (1 - 0.65 * e ** 3), 0.06 + 0.32 * e ** 4]; };
  const P = (u, w, v) => [w, v, u];
  for (let k = 0; k < n; k++) {
    const [u0, w0, r0] = prof(k), [u1, w1, r1] = prof(k + 1);
    for (const sd of [-1, 1]) {
      const a = P(u0, sd * w0, -0.18), b = P(u1, sd * w1, -0.18), c = P(u1, sd * w1, 0.34 + r1), d = P(u0, sd * w0, 0.34 + r0);
      if (sd > 0) t.push(...a, ...c, ...b, ...a, ...d, ...c); else t.push(...a, ...b, ...c, ...a, ...c, ...d);
      const ia = P(u0, sd * (w0 - 0.04), 0.34 + r0), ib = P(u1, sd * (w1 - 0.04), 0.34 + r1), ic = P(u1, sd * (w1 - 0.04), 0.04), id = P(u0, sd * (w0 - 0.04), 0.04);
      if (sd > 0) t.push(...ia, ...ib, ...ic, ...ia, ...ic, ...id); else t.push(...ia, ...ic, ...ib, ...ia, ...id, ...ic);
    }
    const a = P(u0, -w0 * 0.7, -0.18), b = P(u1, -w1 * 0.7, -0.18), c = P(u1, w1 * 0.7, -0.18), d = P(u0, w0 * 0.7, -0.18);
    t.push(...a, ...b, ...c, ...a, ...c, ...d);
    const fa = P(u0, -w0 * 0.96, 0.04), fb = P(u1, -w1 * 0.96, 0.04), fc = P(u1, w1 * 0.96, 0.04), fd = P(u0, w0 * 0.96, 0.04);
    t.push(...fa, ...fc, ...fb, ...fa, ...fd, ...fc);
  }
  return t;
}
const stick = (out, p, q, r) => { const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, a = Math.abs(d[1]) / l < 0.9 ? [0, 1, 0] : [1, 0, 0]; let t1 = [d[1] * a[2] - d[2] * a[1], d[2] * a[0] - d[0] * a[2], d[0] * a[1] - d[1] * a[0]]; const m = Math.hypot(...t1) || 1; t1 = t1.map((x) => x / m * r); const t2 = [(d[1] * t1[2] - d[2] * t1[1]) / l, (d[2] * t1[0] - d[0] * t1[2]) / l, (d[0] * t1[1] - d[1] * t1[0]) / l];
  const ring = (c) => [0, 1, 2, 3].map((k) => { const an = k * Math.PI / 2; return [c[0] + t1[0] * Math.cos(an) + t2[0] * Math.sin(an), c[1] + t1[1] * Math.cos(an) + t2[1] * Math.sin(an), c[2] + t1[2] * Math.cos(an) + t2[2] * Math.sin(an)]; });
  const A = ring(p), B = ring(q); for (let k = 0; k < 4; k++) { const j = (k + 1) % 4; out.push(...A[k], ...A[j], ...B[j], ...A[k], ...B[j], ...B[k]); } };
export function boatShapes(sb) {
  const wood = factor('wood', 'timber'), tim = [];
  for (const z of [-1.5, 0, 1.4]) stick(tim, [-0.78, 0.3, z], [0.78, 0.3, z], 0.04);
  stick(tim, [0.35, 0.05, -2.6], [0.35, 0.28, 2.6], 0.025);
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    sb.addPiece(v, 'wood', flat(hullTris(BOAT.L)), { slot: SLOT.c1, col: wood });
    if (!far) sb.addPiece(v, 'wood', flat(tim), { slot: SLOT.c1, col: [0.8, 0.8, 0.8] });
    if (kind === 'covered') {
      // a low awning of straw mats over the middle on bent hoops
      const aw = [], N = 8, R = 0.78, y0 = 0.36, z0 = -1.5, z1 = 1.0, hoops = [];
      const A = (t, z) => [Math.cos(Math.PI * t) * R, y0 + Math.sin(Math.PI * t) * 0.72, z];
      for (let k = 0; k < N; k++) { const a = A(k / N, z0), b = A((k + 1) / N, z0), c = A((k + 1) / N, z1), d = A(k / N, z1); aw.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); if (!far && k % 1 === 0) for (const z of [z0, (z0 + z1) / 2, z1]) stick(hoops, A(k / N, z), A((k + 1) / N, z), 0.02); }
      sb.addPiece(v, 'fibre', flat(aw), { slot: SLOT.c2, col: factor('fibre', 'reed_mat') });
      if (!far) sb.addPiece(v, 'wood', flat(hoops), { slot: SLOT.c1, col: wood });
    } else {
      const life = STYLES.life.elements;
      const put = (fn, el) => { const g2 = []; fn({ ...el }, { bag: { add: (m, g) => g2.push([m, g]) }, col: { circle() {}, box() {}, rect() {} } }); for (const [m, g] of g2) sb.addPiece(v, /wicker|sacking/.test(m) ? 'fibre' : 'wood', g, { slot: SLOT.none, col: factor(/wicker|sacking/.test(m) ? 'fibre' : 'wood', m) }); };
      put(life.sacks, { t: 'sacks', at: [0, -0.8], y: 0.05, rot: 0, n: 5, seed: 11 });
      put(life.sacks, { t: 'sacks', at: [0, 0.5], y: 0.05, rot: Math.PI, n: 3, seed: 12 });
      put(life.basket, { t: 'basket', at: [0.25, -2.2], y: 0.2, rot: 0, n: 2, seed: 7 });
    }
  }
  // the punting pole: held by the boatman at the stern, slanting aft down into the moat's bed
  { const v = sb.variant('oar'), w = []; stick(w, [-0.25, 1.9, 2.3], [0.1, -2.2, 3.4], 0.028); sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'bamboo_culm') }); }
}
