// Victorian London about 1870 — the moving life (docs/settlements/london.md §7): Londoners of every class walking the streets
// and the embankments, and the Thames's dumb lighters drifting and sweeping up and down the river's two lanes. Data for the
// engine's movers (src/engine/movers.js), in the format of Suzhou's; the ways come from layout.js.

import { RADIUS, RIVER, BRIDGE, lots, bank, walkRects } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../styles/victorian/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 8, rain: 0.6, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 5, reach: 280, spawnMin: 70, far: 110, speed: [0.7, 1.1], bridgeSpeed: 0.7 },
  water: RIVER.level,
};

// ── the ways ─────────────────────────────────────────────────────────────────
const shopShare = (() => {
  const L = lots();
  return (r) => {
    let n = 0, s = 0;
    for (const l of L) { const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2; if (cx < r[0] - 2 || cx > r[2] + 2 || cz < r[1] - 14 || cz > r[3] + 14) continue; n++; if (l.shop || l.pub) s++; }
    return n ? s / n : 0;
  };
})();
/** The streets, Bridge Street, the squares and the embankments (layout.js walkRects) with the crowd by the shops along them. */
export function walkways() {
  const rects = walkRects().map((w) => { const m = shopShare(w.r); return { r: w.r, weight: w.weight * (0.5 + 3 * m), market: w.kind === 'main' ? 1 : m, kind: w.kind === 'main' ? 'street' : 'lane' }; });
  return { rects, links: [], clip: RADIUS - 14 };
}
/** The Thames: two lanes (downstream on the east side of the channel, upstream on the west), broken at the bridge and short of the banks. */
export function waterways() {
  const rects = [];
  for (let z = -RADIUS + 70; z < RADIUS - 100; z += 40) {
    if (Math.abs(z + 20 - BRIDGE.z) < 22 || Math.abs(z - BRIDGE.z) < 22) continue;
    const [a, b] = bank(z + 20), w = b - a;
    for (const t of [0.33, 0.68]) rects.push({ r: [a + w * t - 11, z, a + w * t + 11, z + 40], weight: 1 });
  }
  return { rects, bridges: [], clip: RADIUS - 70 };
}
/** The craft standing in the river (the plan's steamers and lighters), which the moving boats keep clear of. */
export async function staticBoats() {
  const { houses } = await import('./town.js');
  const out = [];
  for (const p of await houses()) for (const e of p.elements) {
    if (e.t !== 'paddle_steamer' && e.t !== 'lighter') continue;
    const r = e.rot ?? 0, L = e.t === 'lighter' ? e.len ?? 13 : 30;
    out.push({ c: e.at, u: [Math.sin(r), Math.cos(r)], hl: L / 2 + (e.t === 'lighter' ? 2.5 : 3), hw: e.t === 'lighter' ? 2.4 : 4.5 });
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// After the dress of the 1870s (dossier §7): gentlemen in black frock coats and top hats, clerks in dark suits and bowlers (the
// brimmed hat stands for both), ladies in long dresses with capes and bonnets, working men in caps, jackets and corduroys, coster
// women in shawls, newsboys, policemen in blue, porters with sacks. In the rain
// they put on a cloak or cape (umbrellas are not drawn).
const CL = { grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', red: 'cloth_red', green: 'cloth_green', blue: 'cloth_blue', indigo: 'cloth_indigo', maroon: 'cloth_maroon', ochre: 'cloth_ochre' };
export const WALKERS = [
  { id: 'gentleman', weight: 1.1, market: 1.2, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'cloak', arms: 'hang', beard: 0.5 }, wet: 'cloak',
    c1: [CL.black, CL.black, CL.grey, CL.brown], c2: [CL.black, CL.grey], c3: [CL.black, CL.black, CL.grey], speed: [1.0, 1.3], stride: 1.5 },
  { id: 'clerk', weight: 1.4, market: 0.9, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'collar', arms: 'hang' }, wet: 'cloak',
    c1: [CL.grey, CL.brown, CL.black, CL.indigo], c2: [CL.black, CL.grey], c3: [CL.black, CL.brown], speed: [1.2, 1.5], stride: 1.5 },
  { id: 'lady', weight: 1.1, market: 1.5, el: { dress: 'robe', hair: 'bun', hat: 'brim', over: 'cape', arms: 'hang' }, wet: 'cloak', swing: 0.6,
    c1: [CL.maroon, CL.green, CL.indigo, CL.grey, CL.black, CL.blue], c2: [CL.black, CL.grey], c3: [CL.black, CL.maroon, CL.white], speed: [0.9, 1.15], stride: 1.2, h: [0.9, 0.96] },
  { id: 'workman', weight: 1.5, market: 0.8, el: { dress: 'trousers', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang', beard: 0.4 }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.ochre, CL.indigo], c2: [CL.brown, CL.grey, CL.black], c3: [CL.brown, CL.grey, CL.black], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'coster', weight: 0.8, market: 1.6, el: { dress: 'robe', hair: 'bun', hat: 'none', over: 'shawl', carry: 'basket', arms: 'hang' }, wet: 'cloak', swing: 0.5,
    c1: [CL.indigo, CL.red, CL.brown, CL.grey], c2: [CL.red, CL.green, CL.black], c3: [CL.black], speed: [0.95, 1.2], stride: 1.25, h: [0.9, 0.96] },
  { id: 'newsboy', weight: 0.5, market: 1.0, el: { dress: 'trousers', hair: 'short', hat: 'cap', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.grey, CL.brown, CL.red], speed: [1.3, 1.8], stride: 1.0, h: [0.62, 0.72], swing: 1.1 },
  { id: 'policeman', weight: 0.4, market: 0.8, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'belt', arms: 'hang', beard: 0.5 }, wet: 'cloak',
    c1: ['prussian_blue'], c2: ['prussian_blue'], c3: ['prussian_blue'], speed: [0.95, 1.15], stride: 1.55 },
  { id: 'porter', weight: 0.8, market: 1.1, el: { dress: 'trousers', hair: 'short', hat: 'cap', carry: 'sack', arms: 'sack', beard: 0.3 },
    c1: [CL.brown, CL.grey, CL.ochre, CL.white], c2: [CL.brown, CL.black], c3: [CL.brown, CL.grey], speed: [1.0, 1.25], stride: 1.15 },
];
/** The lighterman at the sweep, and his mate sitting on the cargo. */
export const CREW = {
  boatman: { el: { dress: 'trousers', hair: 'short', hat: 'cap', over: 'belt', arms: 'pull', beard: 0.5 }, wet: 'cloak', c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.brown, CL.black], c3: [CL.brown, CL.black] },
  passenger: { el: { dress: 'trousers', hair: 'short', hat: 'cap', pose: 'sit' }, c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.black], c3: [CL.brown, CL.grey] },
};
export function walkerShapes(sb) {
  const kinds = [...WALKERS.map((k) => [k.id, k]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]];
  for (const [id, k] of kinds) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    if (wet) el.over = 'cloak';
    addFigure(sb, v, figure, el, { far });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
// The dumb lighter (the victorian style's `lighter`, 13 m, bow toward −z), `covered` loaded with a heap of coal, `cargo` with sacks; its
// sweep (the long steering oar) is the movers' own.
const LEN = 13;
export const BOAT = { L: LEN, pin: [0.0, 1.25, LEN / 2 - 0.5], deck: 0.55, stern: LEN / 2 - 0.5, passenger: [0, 0.75, -1.5], hull: [2.1, LEN / 2 + 0.6] };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
function beam(out, p, q, r, n = 4) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * r, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * r, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * r]; });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  for (let k = 1; k + 1 < n; k++) { out.push(...A[0], ...A[k + 1], ...A[k], ...B[0], ...B[k], ...B[k + 1]); }
}
export function boatShapes(sb) {
  const GROUP = { wicker: 'fibre' };
  for (const [kind, load] of [['covered', 'coal'], ['cargo', 'sacks']]) {
    const got = [];
    STYLES.victorian.elements.lighter({ at: [0, 0], y: 0, rot: 0, len: LEN, load, riders: false, seed: 3 }, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {}, rect() {} } });
    for (const far of [false, true]) {
      const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
      for (const [m, g] of got) {
        if (far && m === 'timber') continue;
        const group = GROUP[m] ?? 'wood';
        sb.addPiece(v, group, g, { slot: m === 'tar_wood' ? SLOT.c1 : m === 'wicker' ? SLOT.c3 : SLOT.none, col: factor(group, m === 'tar_wood' ? 'timber' : m === 'iron' || m === 'slate' ? 'timber' : m) });
      }
    }
  }
  // the sweep: a long oar pivoting at the pin on the stern, handle forward, the loom running aft down into the water to a broad blade
  {
    const v = sb.variant('oar'), w = [];
    const H = [-0.2, 0.86 - 0.2, -1.2], K = [0, 0.02, 0.4], B0 = [0.0, -0.7, 3.2], B1 = [0.0, -1.1, 4.6];
    beam(w, H, [0, 0.07, -0.02], 0.03, 6); beam(w, [0, 0.07, -0.02], K, 0.036, 6); beam(w, K, B0, 0.034, 6);
    const bl = [], hw = 0.12, th = 0.02, d = norm([B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]]), side = [1, 0, 0], up = cross(d, side);
    const C = (p, s, t) => [p[0] + side[0] * s + up[0] * t, p[1] + side[1] * s + up[1] * t, p[2] + side[2] * s + up[2] * t];
    const q = [[C(B0, -th, -hw * 0.5), C(B0, th, -hw * 0.5), C(B0, th, hw * 0.5), C(B0, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
    for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
    bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
    sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
  }
}
