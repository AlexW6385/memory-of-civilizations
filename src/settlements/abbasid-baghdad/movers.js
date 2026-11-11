// Abbasid Baghdad c. 800 — the moving life (docs/settlements/abbasid-baghdad.md §11): people on the avenues, the esplanade, the suqs of
// Karkh, the quays of the canal and the bridges of boats, in the dress of the age: men in the long robe (qaba, jubba) with the sash and the
// wound turban or the tall qalansuwa, the black of the caliph's household and guard (the Abbasid colour), scholars in the wide
// sleeves and the white turban, merchants, women in the long dark wrap with the veil, porters with baskets, water carriers with the
// skin or the pot, boys. On the Tigris and the canal the boats are sculled: 'covered' the ferry with its reed awning, 'cargo' the
// open barge with jars and sacks. Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js.

import { RADIUS, RIVER, CANAL, CANAL_BRIDGES, BRIDGES, C, riverX, moored, MOORED_HULL, streets } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';
import { box, beam, lathe, quad, tri, norm, cross, smoothstep } from './bits.js';

export const PARAMS = {
  walkers: { day: 44, night: 6, rain: 0.5, reach: 170, spawnMin: 26, far: 46 },
  boats: { count: 9, reach: 280, spawnMin: 60, far: 100, speed: [0.8, 1.3], bridgeSpeed: 0.7 },
  water: RIVER.water,
};

// ── the ways ─────────────────────────────────────────────────────────────────
export function walkways() {
  const rects = streets();
  // the bridges of boats: the road runs across the planks
  for (const b of BRIDGES) {
    const x1 = riverX(b.z) + RIVER.w / 2 + 6, x0 = b.z === C[1] ? 266 : 52;
    rects.push({ r: [x0, b.z - 2.2, x1, b.z + 2.2], weight: 1.6, market: 0.6, kind: 'street' });
  }
  const links = [];
  for (const x of CANAL_BRIDGES) links.push({ a: [x, CANAL.z - 11], b: [x, CANAL.z + 11], w: 2.5, kind: 'bridge', weight: 1.0 });
  return { rects, links, clip: RADIUS - 14 };
}

/** The Tigris (a lane down its middle, in three runs between the bridges of boats) and the Isa canal; the canal's bridges. */
export function waterways() {
  const lane = (z0, z1) => ({ r: [317, z0, 333, z1], weight: 1.5, kind: 'river' });
  const zb = BRIDGES.map((b) => b.z).sort((a, b) => a - b);
  const rects = [lane(-470, zb[0] - 16), lane(zb[0] + 16, zb[1] - 16), lane(zb[1] + 16, 470), { r: [CANAL.x0 + 30, CANAL.z - 4, 330, CANAL.z + 4], weight: 1.0, kind: 'canal' }];
  return { rects, bridges: CANAL_BRIDGES.map((x) => ({ at: [x, CANAL.z], half: 4.5 })), clip: RADIUS - 18 };
}
/** The boats lying at the jetties and the canal quay (the town's moored boats), kept clear by the moving ones. */
export async function staticBoats() {
  return moored().map((b) => {
    const h = MOORED_HULL(b), u = [Math.sin(b.rot ?? 0), Math.cos(b.rot ?? 0)];
    return { c: b.at, u, hl: h.hl, hw: h.hw };
  });
}

// ── who walks ────────────────────────────────────────────────────────────────
const CL = { white: 'cloth_white', black: 'cloth_black', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon', blue: 'cloth_blue' };
export const WALKERS = [
  { id: 'townsman', weight: 2.2, market: 1.6, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang' },
    c1: [CL.white, CL.ochre, CL.indigo, CL.green, CL.brown, CL.white], c2: [CL.white, CL.ochre, CL.red], c3: [CL.white, CL.white, CL.black, CL.indigo], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'merchant', weight: 1.2, market: 2.0, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang', beard: 0.8 },
    c1: [CL.green, CL.maroon, CL.indigo, CL.ochre, CL.blue], c2: [CL.white, CL.red], c3: [CL.white], speed: [0.8, 1.0], stride: 1.3 },
  { id: 'guard', weight: 0.8, market: 0.3, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', carry: 'staff' },
    c1: [CL.black, CL.black, CL.black], c2: [CL.grey, CL.ochre], c3: [CL.black], speed: [1.0, 1.3], stride: 1.5 },
  { id: 'scholar', weight: 0.7, market: 0.5, el: { dress: 'robe', hat: 'turban', over: 'none', arms: 'hang', beard: 0.9 },
    c1: [CL.white, CL.grey, CL.green, CL.indigo], c2: [CL.white], c3: [CL.white, CL.black], speed: [0.75, 0.95], stride: 1.2 },
  { id: 'woman', weight: 1.5, market: 1.6, el: { dress: 'robe', hat: 'veil', over: 'none', arms: 'hang' }, swing: 0.7,
    c1: [CL.black, CL.black, CL.indigo, CL.maroon, CL.brown], c2: [CL.black, CL.white], c3: [CL.black, CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.1, market: 1.8, el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', carry: 'basket', arms: 'hang', feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.white], c3: [CL.white, CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'saqqa', weight: 0.6, market: 1.2, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', carry: 'pot' },
    c1: [CL.brown, CL.ochre, CL.indigo], c2: [CL.white], c3: [CL.white, CL.red], speed: [0.85, 1.05], stride: 1.3 },
  { id: 'boy', weight: 0.5, market: 0.8, el: { dress: 'robe', legs: 'bare', hat: 'cap', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.white], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
/** The boatman at the oar, the passenger sitting under the awning. */
export const CREW = {
  boatman: { el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', arms: 'pull', feet: 'bare' }, c1: [CL.brown, CL.ochre, CL.grey, CL.white], c2: [CL.brown, CL.grey], c3: [CL.white, CL.grey] },
  passenger: { el: { dress: 'robe', hat: 'turban', over: 'sash', pose: 'cross' }, c1: [CL.white, CL.green, CL.indigo, CL.ochre], c2: [CL.white, CL.red], c3: [CL.white, CL.black] },
};

export function walkerShapes(sb) {
  const kinds = [...WALKERS.map((k) => [k.id, k]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]];
  for (const [id, k] of kinds) for (const far of [false, true]) {
    const v = sb.variant(`${id}|dry|${far ? 'far' : 'near'}`);
    addFigure(sb, v, figure, { ...k.el }, { far, cape: null });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
// The zawraq of the Tigris at 7 m (the engine scales it): a long pitched boat, high at stem and stern, bitumen-black outside. 'covered' has
// a reed-mat awning on posts amidships (the ferry, the boat of the well-to-do) and a bench; 'cargo' is open with jars and sacks of grain.
// Bow toward -z, waterline y 0; the oar of the stern as in the other towns (variant 'oar').
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.2, 3.55] };
const HL = 3.5, NS = 18;
const Bg = (u) => 1.0 - 0.62 * smoothstep(0.3, 1, Math.abs(u));
const yG = (u) => 0.46 + 0.5 * Math.abs(u) ** 3;
const yB = (u) => -0.26 + 0.34 * smoothstep(0.55, 1, Math.abs(u));
function hull() {
  const outer = [], inner = [], rim = [];
  const sec = (i, k) => { const u = -1 + 2 * i / NS, bg = Bg(u) - k; return { z: u * HL, bg, bb: bg * 0.7, yb: yB(u) + k * 1.2, yg: yG(u) }; };
  for (let i = 0; i < NS; i++) {
    const a = sec(i, 0), b = sec(i + 1, 0), mid = [0, 0.1, (a.z + b.z) / 2];
    quad(outer, [-a.bb, a.yb, a.z], [a.bb, a.yb, a.z], [b.bb, b.yb, b.z], [-b.bb, b.yb, b.z], mid);
    quad(outer, [a.bb, a.yb, a.z], [a.bg, a.yg, a.z], [b.bg, b.yg, b.z], [b.bb, b.yb, b.z], mid);
    quad(outer, [-a.bb, a.yb, a.z], [-a.bg, a.yg, a.z], [-b.bg, b.yg, b.z], [-b.bb, b.yb, b.z], mid);
    const c = sec(i, 0.06), d = sec(i + 1, 0.06);
    quad(inner, [-c.bb, c.yb, c.z], [c.bb, c.yb, c.z], [d.bb, d.yb, d.z], [-d.bb, d.yb, d.z], [0, -5, mid[2]]);
    quad(inner, [c.bb, c.yb, c.z], [c.bg, c.yg, c.z], [d.bg, d.yg, d.z], [d.bb, d.yb, d.z], [5, 0.2, mid[2]]);
    quad(inner, [-c.bb, c.yb, c.z], [-c.bg, c.yg, c.z], [-d.bg, d.yg, d.z], [-d.bb, d.yb, d.z], [-5, 0.2, mid[2]]);
    for (const s of [-1, 1]) quad(rim, [s * a.bg, a.yg, a.z], [s * c.bg, c.yg, c.z], [s * d.bg, d.yg, d.z], [s * b.bg, b.yg, b.z], [0, -5, mid[2]]);
  }
  for (const [i, sgn] of [[0, -1], [NS, 1]]) { const a = sec(i, 0); quad(outer, [-a.bb, a.yb, a.z], [a.bb, a.yb, a.z], [a.bg, a.yg, a.z], [-a.bg, a.yg, a.z], [0, 0.1, a.z - sgn * 3]); }
  return { outer, inner, rim };
}
const dbl = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 9), t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };

export function boatShapes(sb) {
  const put = (v, g, group, mat, o = {}) => g.length && sb.addPiece(v, group, flat(g), { slot: o.slot ?? SLOT.none, col: factor(group, mat, o.shade ?? 1) });
  const H = hull();
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    put(v, H.outer, 'wood', 'bitumen', { slot: SLOT.c1 });
    put(v, H.inner, 'wood', 'timber', { shade: 0.8, slot: SLOT.c1 });
    put(v, H.rim, 'wood', 'timber', { shade: 0.9 });
    const deck = [], fore = [];
    box(deck, -0.46, 0.55, 1.6, 0.46, 0.58, 3.0); box(fore, -0.4, 0.55, -3.0, 0.4, 0.58, -2.2);
    put(v, deck, 'wood', 'timber', { shade: 0.9 }); put(v, fore, 'wood', 'timber', { shade: 0.9 });
    if (kind === 'covered') {
      const post = [], roof = [], bench = [], trim = [];
      for (const s of [-1, 1]) for (const z of [-1.5, 0.2, 1.3]) beam(post, [s * 0.76, 0.5, z], [s * 0.76, 1.75, z], 0.04, 4);
      box(roof, -0.95, 1.75, -1.62, 0.95, 1.83, 1.42);
      for (const z of [-1.62, 1.42]) box(trim, -0.97, 1.7, z - 0.03, 0.97, 1.83, z + 0.03);
      box(bench, -0.6, 0.35, -0.2, 0.6, 0.45, 0.4);
      put(v, post, 'wood', 'timber', { shade: 1.1 });
      sb.addPiece(v, 'fibre', flat(dbl(roof)), { slot: SLOT.c2, col: factor('fibre', 'reed_mat') });
      put(v, trim, 'wood', 'timber', { shade: 0.8 }); put(v, bench, 'wood', 'timber', { shade: 0.9 });
    } else {
      const jars = [], mat = [], sacks = [];
      for (const [x, z] of [[-0.45, -0.9], [0.3, -1.1], [0.0, -0.3], [-0.4, 0.3], [0.45, 0.2], [0.05, 0.9]]) lathe(jars, [[0.001, -0.05], [0.14, -0.05], [0.2, 0.12], [0.22, 0.28], [0.15, 0.42], [0.1, 0.46], [0.11, 0.5], [0.001, 0.5]], far ? 6 : 9, x, 0.06, z);
      for (const [x, z] of [[-0.35, -1.9], [0.35, -1.85], [0, -2.0]]) box(sacks, x - 0.25, 0.2, z - 0.2, x + 0.25, 0.5, z + 0.2);
      box(mat, -0.7, 0.2, 1.1, 0.7, 0.28, 1.6);
      put(v, jars, 'wood', 'pottery_dark'); sb.addPiece(v, 'fibre', flat(sacks), { slot: SLOT.c3, col: factor('fibre', 'cloth_white', 0.9) });
      sb.addPiece(v, 'fibre', flat(mat), { slot: SLOT.c2, col: factor('fibre', 'reed_mat') });
    }
  }
  // the oar of the stern: handle forward to the boatman's hands, the loom running aft into the water to a long flat blade
  {
    const v = sb.variant('oar'), w = [], bl = [];
    const Hd = [-0.2, 0.86, -0.78], K = [0, 0.02, 0.18], B0 = [0, -0.62, 2.25], B1 = [0, -0.98, 3.25];
    beam(w, Hd, [0, 0.07, -0.02], 0.026, 6); beam(w, [0, 0.07, -0.02], K, 0.032, 6); beam(w, K, B0, 0.03, 6);
    const d = norm([B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]]), hw = 0.085, th = 0.018, side = [1, 0, 0], up = cross(d, side);
    const P = (p, s, t) => [p[0] + side[0] * s + up[0] * t, p[1] + side[1] * s + up[1] * t, p[2] + side[2] * s + up[2] * t];
    const B0x = [B0[0] - d[0] * 0.25, B0[1] - d[1] * 0.25, B0[2] - d[2] * 0.25];
    const q = [[P(B0x, -th, -hw * 0.5), P(B0x, th, -hw * 0.5), P(B0x, th, hw * 0.5), P(B0x, -th, hw * 0.5)], [P(B1, -th * 0.6, -hw), P(B1, th * 0.6, -hw), P(B1, th * 0.6, hw), P(B1, -th * 0.6, hw)]];
    const mid = [(B0[0] + B1[0]) / 2, (B0[1] + B1[1]) / 2, (B0[2] + B1[2]) / 2];
    for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; quad(bl, q[0][k], q[1][k], q[1][k1], q[0][k1], mid); }
    quad(bl, q[1][0], q[1][1], q[1][2], q[1][3], mid);
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
    sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
  }
}
void tri;
