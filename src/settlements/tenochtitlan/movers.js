// Mexica Tenochtitlan, 1519 — the moving life (docs/settlements/tenochtitlan.md §14): people on the avenues, the lanes
// between the compounds, the market's aisles and the precinct's plaza, canoes poled and paddled along the canals.
// Data for the engine's movers (src/engine/movers.js, worker src/engine/movers-worker.js), in the format of Suzhou's:
// the ways (from layout.js and market.js), who walks and what floats, the canoes already standing in the canals
// (plan.js), which the moving ones keep clear of.

import { RADIUS, ISLAND, LEVEL, CANALS, CAUSEWAY, GAP, PRECINCT, lanes } from './layout.js';
import { aisles } from './market.js';
import { STYLES } from '../../core/build.js';
import '../../styles/aztec/index.js';
import '../../objects/index.js';
import precinct from './plan.js';
import { figure } from '../../objects/figures.js';
import { Kit } from '../../styles/maya/meso.js';
import { lathe } from '../../core/geom.js';
import { addFigure, factor, flat, bounds, SLOT, LIMB } from '../../engine/movers-kit.js';

// ── how many, how fast ───────────────────────────────────────────────────────
export const PARAMS = {
  walkers: { day: 64, night: 6, rain: 0.7, reach: 140, spawnMin: 22, far: 42 },
  boats: { count: 11, reach: 240, spawnMin: 55, far: 95, speed: [0.7, 1.1], bridgeSpeed: 0.6 },
  water: LEVEL.water,
};

// ── the ways on foot ─────────────────────────────────────────────────────────
const [PX0, PZ0, PX1, PZ1] = PRECINCT;
const rect = (x0, z0, x1, z1, o = {}) => ({ r: [x0, z0, x1, z1], weight: 1, market: 0, kind: 'street', ...o });
/**
 * The avenues (x = 0 and z = 0, 10 m of the 16 kept free of houses) cut at the canals, whose bridges are links; the lanes
 * between the compounds; the precinct's plaza (round the temple of Ehecatl on the axis); the market's aisles; the causeway
 * with the bridge over its opening.
 */
export function walkways() {
  const rects = [], links = [];
  const AV = 9;                                                                // the avenues' width
  // the avenue east–west (z = 0): from the causeway's far side to the precinct's west gate and across the plaza; east of the precinct to the lake road
  rects.push(rect(-ISLAND + 2, -AV / 2, GAP[0] - 3, AV / 2, { weight: 1.3 }), rect(GAP[1] + 3, -AV / 2, -226, AV / 2, { weight: 2 }), rect(-214, -AV / 2, PX0 - 3, AV / 2, { weight: 2.4 }));
  rects.push(rect(PX0 - 3, -AV / 2, -30, AV / 2, { weight: 2.4 }));
  rects.push(rect(PX1 + 3, -AV / 2, 214, AV / 2, { weight: 1.2 }), rect(226, -AV / 2, 296, AV / 2, { weight: 1.2 }));
  // the avenue north–south (x = 0)
  rects.push(rect(-AV / 2, -296, AV / 2, -206, { weight: 1.2 }), rect(-AV / 2, -194, AV / 2, PZ0 - 3, { weight: 1.8 }), rect(-AV / 2, PZ0 - 3, AV / 2, -28, { weight: 2.4 }));
  rects.push(rect(-AV / 2, 28, AV / 2, PZ1 + 3, { weight: 2.4 }), rect(-AV / 2, PZ1 + 3, AV / 2, 194, { weight: 1.8 }), rect(-AV / 2, 206, AV / 2, 296, { weight: 1.2 }));
  // the plaza of the precinct: the ring round Ehecatl's temple and the way to the foot of the Templo Mayor's stairs
  for (const z of [-28, 28]) rects.push(rect(-30, z - 4, 24, z + 4, { weight: 2.2, kind: 'street' }));
  for (const x of [-30, 24]) rects.push(rect(x - 4, -28, x + 4, 28, { weight: 2.2 }));
  // the lanes between the compounds
  for (const r of lanes()) rects.push({ r, weight: 0.8, market: 0, kind: 'lane' });
  // the market: its aisles, crowded by day
  for (const r of aisles()) rects.push({ r: r[3] - r[1] > 30 ? [r[0], r[1] - 2, r[2], r[3] + 2] : r, weight: 3.2, market: 1, kind: 'street' });
  // the bridges over the canals at the avenues (beam bridges of plan.js, 4.4 m wide) and the opening in the causeway
  const C = CANALS;
  for (const z of [(C[0][1] + C[0][3]) / 2, (C[1][1] + C[1][3]) / 2]) links.push({ a: [0, z + Math.sign(z) * -6], b: [0, z + Math.sign(z) * 6], w: 2.2, kind: 'bridge', weight: 1.6 });
  for (const x of [(C[2][0] + C[2][2]) / 2, (C[3][0] + C[3][2]) / 2]) links.push({ a: [x + Math.sign(x) * -6, 0], b: [x + Math.sign(x) * 6, 0], w: 2.2, kind: 'bridge', weight: 1.4 });
  links.push({ a: [GAP[0] - 3, 0], b: [GAP[1] + 3, 0], w: 4, kind: 'bridge', weight: 0.8 });
  rects.push(rect(-RADIUS + 20, CAUSEWAY.z0 + 3, GAP[0] - 3, CAUSEWAY.z1 - 3, { weight: 0.5 }));
  void ISLAND;
  return { rects, links, clip: RADIUS - 8 };
}

// ── the canals ───────────────────────────────────────────────────────────────
/** The canals as reaches either side of their avenue's bridge (the bridges are low: the canoes turn back or tie up short of them). */
export function waterways() {
  const lim = ISLAND - 6, h = (v) => Math.sqrt(Math.max(0, lim * lim - v * v)), out = [];
  for (const c of CANALS) {
    const horiz = c[2] - c[0] > c[3] - c[1], mid = horiz ? (c[1] + c[3]) / 2 : (c[0] + c[2]) / 2, ext = h(mid), gap = 6.5, market = !horiz && mid < 0 && mid > -230;
    for (const s of [-1, 1]) {
      const a = s < 0 ? -ext : gap, b = s < 0 ? -gap : ext, r = horiz ? [a, c[1], b, c[3]] : [c[0], a, c[2], b];
      out.push({ r, weight: 1, ...(market ? {} : { kind: 'canal' }) });
    }
  }
  return { rects: out, bridges: [], clip: ISLAND - 6 };
}
/** The canoes standing in the canals (plan.js: moored, the market's at its landings) as hulls { c, u, hl, hw } the moving ones keep clear of. */
export async function staticBoats() {
  const out = [];
  for (const e of precinct.elements) {
    if (e.t !== 'acalli') continue;
    const [dx, dz] = e.dir ?? [1, 0], d = Math.hypot(dx, dz) || 1, L = e.len ?? 6, B = Math.min(1.1, 0.55 + L * 0.06);
    out.push({ c: e.at, u: [dx / d, dz / d], hl: L / 2 + 0.8, hw: B / 2 + 0.3 });
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// After the Florentine Codex and the Codex Mendoza (dossier §14): men in the loincloth (maxtlatl) with the cloak (tilmatli)
// knotted at the shoulder, the commoners' of maguey fibre (grey, brown) or cotton (white); women in the blouse (huipilli)
// and wrapped skirt (cueitl), the hair in braids, baskets and jars on the head; porters (tlameme) under their loads on the
// tumpline; farmers of the chinampas with the digging stick; lords in cloaks to the knee and sandals; warriors in the
// quilted cotton armour (ichcahuipilli) with the feather crest, shield and macuahuitl; priests black with soot, the hair long.
const CL = { white: 'cloth_white', ochre: 'cloth_ochre', brown: 'cloth_brown', grey: 'cloth_grey', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', green: 'cloth_green', black: 'cloth_black' };
export const WALKERS = [
  { id: 'man', weight: 1.6, market: 1.3, el: { dress: 'loincloth', over: 'cape', hair: 'short', arms: 'hang', feet: 'bare' }, wet: 'cape',
    c1: [CL.white, CL.ochre, CL.white, CL.blue], c2: [CL.white, CL.grey, CL.brown, CL.white, CL.ochre], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'woman', weight: 1.3, market: 1.4, el: { dress: 'robe', over: 'none', hair: 'bun', arms: 'hang', feet: 'bare' }, wet: 'cape', swing: 0.7,
    c1: [CL.white, CL.white, CL.ochre, CL.red, CL.blue], c2: [CL.indigo, CL.white, CL.red, CL.ochre, CL.brown], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'basket', weight: 0.9, market: 1.8, el: { dress: 'robe', over: 'none', hair: 'bun', carry: 'basket', arms: 'hang', feet: 'bare' }, swing: 0.6,
    c1: [CL.white, CL.ochre, CL.white, CL.red], c2: [CL.indigo, CL.white, CL.ochre, CL.red], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.96] },
  { id: 'porter', weight: 1.0, market: 1.2, el: { dress: 'loincloth', over: 'none', hair: 'short', carry: 'bundle', arms: 'sack', feet: 'bare' }, wet: 'cape', pole: true,
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.black], speed: [0.95, 1.2], stride: 1.1 },
  { id: 'farmer', weight: 0.6, market: 0.3, el: { dress: 'loincloth', over: 'none', hair: 'short', carry: 'hoe', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'lord', weight: 0.5, market: 0.9, el: { dress: 'loincloth', over: 'cloak', hair: 'short', arms: 'hang', feet: 'shod' },
    c1: [CL.white, CL.ochre], c2: [CL.blue, CL.white, CL.red, CL.indigo, CL.green], c3: [CL.black], speed: [0.85, 1.05], stride: 1.5 },
  { id: 'warrior', weight: 0.4, market: 0.5, el: { dress: 'tunic', over: 'belt', hair: 'short', arms: 'staff', legs: 'bare', feet: 'bare' },
    c1: [CL.ochre, CL.red, CL.white, CL.blue, CL.green], c2: [CL.white, CL.red, CL.ochre], c3: [CL.black], speed: [1.05, 1.35], stride: 1.5 },
  { id: 'priest', weight: 0.4, market: 0.2, el: { dress: 'robe', over: 'none', hair: 'long', carry: 'staff', len: 1.1, staffMat: 'wood_dark', feet: 'bare' },
    c1: [CL.black, CL.black, CL.grey], c2: [CL.black], c3: [CL.black], speed: [0.85, 1.05], stride: 1.45 },
];
/** The boatman standing at the stern with the paddle, and the passenger sitting under the canopy. */
export const CREW = {
  boatman: { el: { dress: 'loincloth', over: 'cape', hair: 'short', arms: 'pull', feet: 'bare' }, wet: 'cape', c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white, CL.grey, CL.brown], c3: [CL.black] },
  passenger: { el: { dress: 'robe', over: 'none', hair: 'bun', pose: 'cross', feet: 'bare' }, c1: [CL.white, CL.ochre, CL.red], c2: [CL.indigo, CL.white, CL.red, CL.blue], c3: [CL.black] },
};

// ── small helpers: solids as triangles (double-sided: the accessories are thin) ─────────────────────────────────────
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
function beam(out, p, q, r, n = 4) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * r, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * r, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * r]; });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  for (let k = 1; k + 1 < n; k++) out.push(...A[0], ...A[k + 1], ...A[k], ...B[0], ...B[k], ...B[k + 1]);
}
/** A flat disc of radius r about the x axis (normal ±x) at c, both faces, n segments. */
function discX(out, c, r, n = 14, dx = 0) {
  for (let k = 0; k < n; k++) {
    const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2;
    const P = (a) => [c[0] + dx * Math.cos(a * 2) * 0, c[1] + Math.sin(a) * r, c[2] + Math.cos(a) * r];
    const p0 = P(a0), p1 = P(a1);
    out.push(...c, ...p0, ...p1, ...c, ...p1, ...p0);
  }
}
/** The shield (chimalli): a round shield on the left arm, red with a white boss and a fringe of green feathers, and the crest of plumes on the head; the macuahuitl in the right hand. */
function warriorGear(add) {
  const red = [], white = [], fringe = [], wood = [], black = [], crest = [], crest2 = [];
  discX(red, [-0.37, 0.98, -0.02], 0.3, 16); discX(white, [-0.375, 0.98, -0.02], 0.1, 10);
  for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; beam(fringe, [-0.38, 0.98 + Math.sin(a) * 0.29, -0.02 + Math.cos(a) * 0.29], [-0.4, 0.98 + Math.sin(a) * 0.4, -0.02 + Math.cos(a) * 0.4], 0.012, 3); }
  // the macuahuitl: a flat wooden club, obsidian blades set along both edges
  beam(wood, [0.25, 0.95, -0.25], [0.2, 1.8, -0.4], 0.03, 5);
  for (let i = 0; i < 6; i++) { const t = 0.35 + i * 0.1, y = 0.95 + 0.85 * t, z = -0.25 - 0.15 * t, x = 0.25 - 0.05 * t; beam(black, [x + 0.045, y, z], [x + 0.045, y + 0.07, z - 0.012], 0.012, 3); beam(black, [x - 0.045, y, z], [x - 0.045, y + 0.07, z - 0.012], 0.012, 3); }
  // the crest: plumes in a fan standing from the brow and back over the head, green and red
  for (let k = -5; k <= 5; k++) { const a = k * 0.19; beam(k % 2 ? crest : crest2, [Math.sin(a) * 0.08, 1.72, 0.0], [Math.sin(a) * 0.3, 2.12 - Math.abs(k) * 0.035, 0.1 + Math.cos(a) * 0.05], 0.014, 3); }
  add('cloth', flat(red), { col: factor('cloth', 'cloth_red', 1.0), limb: LIMB.armL }); add('cloth', flat(white), { col: factor('cloth', 'cloth_white'), limb: LIMB.armL });
  add('cloth', flat(fringe), { col: factor('cloth', 'clay_green', 1.0), limb: LIMB.armL });
  add('wood', flat(wood), { col: factor('wood', 'timber', 0.9) }); add('wood', flat(black), { col: factor('wood', 'obsidian', 1.0) });
  add('cloth', flat(crest), { col: factor('cloth', 'clay_green') }); add('cloth', flat(crest2), { col: factor('cloth', 'cloth_red') });
}
/** The lord's feather fan and gorget are left out; a labret of jade at the lip is too small to show. The priest's long hair is the figure's. */
const EXTRA = { warrior: warriorGear };
const SKIN = [0.82, 0.79, 0.77];                                                // the engine's skins (light, medium) darkened to the Mexica brown
/** The skin of every figure here: tinted brown; the priest's soot-black; bare legs given the stride of legs (the figure kit gives them the arms'). */
function viaSkin(sb, soot) {
  return {
    addPiece(v, group, g, o = {}) {
      if (group === 'skin' && o.slot === SLOT.skin) {
        const b = bounds(g), legs = b[4] < 1.02 && Math.max(Math.abs(b[0]), Math.abs(b[3])) < 0.2;
        o = soot ? { ...o, slot: SLOT.none, col: factor('skin', 'skin_dark', 0.55) } : { ...o, col: SKIN };
        if (legs) o = { ...o, limb: LIMB.legs };
      } else if (soot && group === 'skin') o = { ...o, col: factor('skin', 'skin_dark', 0.55) };
      return sb.addPiece(v, group, g, o);
    },
  };
}
export function walkerShapes(sb) {
  const kinds = [...WALKERS.map((k) => [k.id, k]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]];
  for (const [id, k] of kinds) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet && k.wet === 'cape') { el.over = 'cloak'; cape = 'thatch_palm'; }
    addFigure(viaSkin(sb, id === 'priest'), v, figure, el, { far, cape, extra: !far && EXTRA[id] ? EXTRA[id] : null });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/**
 * The canoes (acalli), dugouts from one trunk, flat-bottomed and square-ended, built from the aztec style's own at 7 m, widened
 * a third (the engine's 0.74–0.82 across), bow toward −z, the waterline at y 0, the bottom at −0.25: the loaded canoe (maize heaped
 * forward, sacks, jars and a bundle of reeds aft) and the covered one (a mat roof on four posts over a passenger). The boatman
 * stands in the stern and paddles; the paddle is the movers' own 'oar' piece, swaying at the pin.
 */
const LEN = 7, WID = 1.3, DECK = -0.25;
export const BOAT = { L: LEN, pin: [0.25, -0.02, 3.1], deck: DECK, stern: 2.45, passenger: [0, DECK, -0.1], hull: [0.72, 3.62] };
const woodMat = /^(timber|wood_dark)$/;
function widen(g) { const P = g.attributes.position.array; for (let i = 0; i < P.length; i += 3) P[i] *= WID; return g; }
export function boatShapes(sb) {
  const got = [], put = (into) => ({ bag: { add: (m, g) => into.push([m, g]) }, col: { circle() {}, box() {}, rect() {}, floor() {}, segment() {} } });
  STYLES.aztec.elements.acalli({ at: [0, 0], dir: [0, 1], len: LEN, y: 0, cargo: 'none', seed: 5 }, put(got));
  // the loaded canoe's cargo and the covered one's roof, built in the canoe's frame
  const cargo = new Kit();
  const heap = (m, x, z, R, h) => cargo.geo(m, lathe([[R, 0], [R * 0.6, h * 0.6], [0.001, h]], 10).translate(x, DECK + 0.07, z));
  heap('paint_ochre', -0.05, -2.3, 0.5, 0.4); heap('paint_ochre', 0.05, -1.5, 0.48, 0.36); heap('stucco_red', 0.0, -0.7, 0.4, 0.3);
  for (const [x, z] of [[-0.25, 0.3], [0.25, 0.55], [-0.15, 1.0]]) cargo.geo('terracotta', lathe([[0.1, 0], [0.24, 0.12], [0.26, 0.3], [0.14, 0.44], [0.16, 0.5], [0.001, 0.5]], 10).translate(x, DECK + 0.07, z));
  for (let i = 0; i < 3; i++) cargo.geo('reed_mat', lathe([[0.15, 0], [0.15, 1.5], [0.001, 1.5]], 8).rotateX(Math.PI / 2).translate(-0.25 + i * 0.25, DECK + 0.25 + (i === 1 ? 0.2 : 0), 1.65));
  const cargoBits = []; cargo.emit({ add: (m, g) => cargoBits.push([m, g]) }, 0, 0, 0, 0, 1);
  const life = STYLES.life.elements, sacks = [];
  life.sacks({ at: [0.05, -2.9], y: DECK + 0.07, rot: 0.3, n: 3, seed: 4 }, put(sacks));
  const roof = new Kit();
  for (const [x, z] of [[-0.62, -1.4], [0.62, -1.4], [-0.62, 0.9], [0.62, 0.9]]) roof.bx('timber', x - 0.03, x + 0.03, DECK, 1.05, z - 0.03, z + 0.03);
  roof.hex('reed_mat', [[-0.85, 1.05, -1.6], [0.85, 1.05, -1.6], [0.85, 0.95, 1.1], [-0.85, 0.95, 1.1], [-0.85, 1.1, -1.6], [0.85, 1.1, -1.6], [0.85, 1.0, 1.1], [-0.85, 1.0, 1.1]]);
  const roofBits = []; roof.emit({ add: (m, g) => roofBits.push([m, g]) }, 0, 0, 0, 0, 1);
  const add = (v, m, g, far) => {
    if (woodMat.test(m)) sb.addPiece(v, 'wood', g, { slot: m === 'timber' ? SLOT.c1 : SLOT.none, col: factor('wood', m === 'timber' ? 'timber' : m, m === 'timber' ? 1 : 1) });
    else sb.addPiece(v, 'fibre', g, { slot: SLOT.none, col: factor('fibre', m) });
    void far;
  };
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of got) add(v, m, widen(g.clone()), far);
    for (const [m, g] of kind === 'cargo' ? [...cargoBits, ...sacks] : roofBits) add(v, m, g, far);
  }
  // the paddle: held at the stern, shaft down and aft to a leaf-shaped blade in the water
  {
    const v = sb.variant('oar'), w = [], bl = [];
    const H = [-0.2, 0.95, -0.7], B0 = [0.1, -0.4, 1.7], B1 = [0.14, -0.95, 2.45];
    beam(w, H, [0, 0.0, 0.0], 0.026, 6); beam(w, [0, 0.0, 0.0], B0, 0.026, 6);
    const d = norm([B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]]), side = [1, 0, 0], up = cross(d, side);
    for (let k = 0; k < 6; k++) {
      const t0 = k / 6, t1 = (k + 1) / 6, wd = (t) => 0.02 + 0.09 * Math.sin(Math.PI * Math.min(1, t * 1.25 + 0.1));
      const P = (t, s) => [B0[0] + (B1[0] - B0[0]) * t + side[0] * s, B0[1] + (B1[1] - B0[1]) * t + side[1] * s, B0[2] + (B1[2] - B0[2]) * t + side[2] * s];
      const a = P(t0, -wd(t0)), b = P(t0, wd(t0)), c = P(t1, wd(t1)), e = P(t1, -wd(t1));
      bl.push(...a, ...b, ...c, ...a, ...c, ...e, ...a, ...c, ...b, ...a, ...e, ...c);
    }
    void up;
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
    sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.8) });
  }
}
