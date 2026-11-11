// Amsterdam about 1670 — the moving life (docs/settlements/amsterdam.md §11): burghers, their wives, servants, porters and sailors
// walking the Dam, the quays of the four canals and the streets that cross them over the bridges; lighters (praams) poled
// and sculled on the IJ and the Damrak. Data for the engine's movers (src/engine/movers.js), read in its worker; the format
// is Suzhou's (src/settlements/ming-suzhou/movers.js). The ways are derived from layout.js (the quay streets are chains of
// short straight links along the rings' arcs, the streets over the bridges radial links between them).

import { C, RINGS, CANAL_W, QUAY, IJ_Z, WATER, RADIUS, DAM, DAMRAK, BRIDGE_ANGLES } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../styles/dutch/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 6, rain: 0.7, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 6, reach: 250, spawnMin: 60, far: 95, speed: [0.8, 1.3], bridgeSpeed: 0.7 },
  water: WATER,
};

// ── the ways ─────────────────────────────────────────────────────────────────
/** The quay street's distance from the ring's middle line, on both banks (the houses' fronts stand 5 m from the quay's edge: layout.js). */
export const STREET_OFF = CANAL_W / 2 + QUAY + 2.6;
const inside = (x, z) => Math.hypot(x, z) < RADIUS - 76 && z > C[1] + 27;

/** The angles at which a ring's street has a vertex: a point about every 11 m, and exactly the bridges' angles (where the radial streets join). */
function angles(R) {
  const out = new Set(BRIDGE_ANGLES.map((a) => +a.toFixed(6)));
  const n = Math.ceil(Math.PI * R / 11);
  for (let i = 0; i <= n; i++) out.add(+(0.04 + (Math.PI - 0.08) * i / n).toFixed(6));
  return [...out].sort((a, b) => a - b);
}
const at = (R, a) => [C[0] + Math.cos(a) * R, C[1] + Math.sin(a) * R];

/** The Dam's open ground (between the Weigh House, the stalls and the fish market) and the streets, the bridges as links over the canals: { rects, links, clip }. */
export function walkways() {
  const rects = [
    { r: [DAM[0] + 2, -231, DAM[2] - 2, -226], weight: 3, market: 1.6, kind: 'street' },
    { r: [DAM[0] + 2, -211.5, DAM[2] - 2, -207], weight: 2.2, market: 1.2, kind: 'street' },
    { r: [9.5, DAM[1] + 3, 13.5, -206], weight: 2.4, market: 2.0, kind: 'street' },
  ];
  const links = [];
  for (const R of RINGS) for (const s of [-1, 1]) {
    const A = angles(R), r = R + s * STREET_OFF;
    for (let i = 0; i + 1 < A.length; i++) {
      const p = at(r, A[i]), q = at(r, A[i + 1]);
      if (inside(...p) && inside(...q)) links.push({ a: p, b: q, w: 2.2, kind: 'street', weight: 1.2 + (s > 0 ? 0.3 : 0) });
    }
  }
  // the streets over the bridges and through the blocks between the rings (the houses leave a gap at every bridge)
  for (const a of BRIDGE_ANGLES) {
    for (let i = 0; i < RINGS.length; i++) {
      const R = RINGS[i], p = at(R - STREET_OFF, a), q = at(R + STREET_OFF, a);
      if (inside(...p) && inside(...q)) links.push({ a: p, b: q, w: 3.2, kind: 'bridge', weight: 1.4 });
      if (i + 1 < RINGS.length) { const n = at(RINGS[i + 1] - STREET_OFF, a); if (inside(...q) && inside(...n)) links.push({ a: q, b: n, w: 2.6, kind: 'street', weight: 1.4, market: 0.4 }); }
    }
  }
  // from the Dam's south side (the gap between its houses at x about −15, the bridge's angle on the first ring) to the first ring's inner quay street
  { const p = at(RINGS[0] - STREET_OFF, BRIDGE_ANGLES[3]); links.push({ a: [p[0], -209.25], b: p, w: 2.2, kind: 'street', weight: 1.6, market: 0.5 }); }
  return { rects, links, clip: RADIUS - 12 };
}

/** The IJ's harbour water (a lane of the open water, shipping at anchor beyond it) and the Damrak up to the Dam: { rects, bridges, clip }. */
export function waterways() {
  const rects = [
    { r: [-RADIUS + 60, IJ_Z - 60, RADIUS - 60, IJ_Z - 53], weight: 2, kind: 'canal' },          // the IJ, a lane before the anchorage
    { r: [(DAMRAK[0] + DAMRAK[2]) / 2 - 3, IJ_Z - 60, (DAMRAK[0] + DAMRAK[2]) / 2 + 3, DAMRAK[3] + 6], weight: 2.5, kind: 'canal' },  // the Damrak
  ];
  return { rects: rects.map((q) => ({ ...q, horiz: q.r[2] - q.r[0] > q.r[3] - q.r[1] })), bridges: [], clip: RADIUS - 30 };
}

/** The boats and ships standing in the water (town.js, plan.js), as rectangles the moving boats keep clear of. */
export async function staticBoats() {
  const { town } = await import('./index.js'), { dam } = await import('./plan.js');
  const out = [];
  for (const p of [...(await town()), dam]) for (const e of p.elements) {
    if (e.t === 'ship') { const [dx, dz] = e.dir ?? [1, 0], n = Math.hypot(dx, dz); out.push({ c: e.at, u: [dx / n, dz / n], hl: (e.len ?? 30) / 2 + 3, hw: 6 }); }
    else if (e.t === 'boat' || e.t === 'praam') {
      const L = e.len ?? (e.t === 'praam' ? 11 : 5.2), r = e.rot ?? 0;
      out.push({ c: e.at, u: [Math.sin(r), Math.cos(r)], hl: L / 2 + 0.5, hw: e.t === 'praam' ? L * 0.14 + 0.2 : 0.9 });
    }
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// After the street scenes of the 1660s–70s (Ruisdael's Dam, Berckheyde's Dam and Herengracht, de Hooch's courtyards, van der
// Heyden): burghers in black with the white collar and the broad hat, merchants in dark brown and grey with a short cloak, women in
// dark gowns with white collars and caps, maids and housewives in brown and red with white caps and aprons, porters (the
// Weigh House's) with sacks, milk-women with a yoke of pails, sailors and dockers in wide breeches and caps.
const CL = { black: 'cloth_black', brown: 'cloth_brown', red: 'cloth_red', indigo: 'cloth_indigo', white: 'cloth_white', ochre: 'cloth_ochre', green: 'cloth_green', grey: 'cloth_grey', maroon: 'cloth_maroon', blue: 'cloth_blue' };
export const WALKERS = [
  { id: 'burgher', weight: 1.4, market: 1.2, el: { dress: 'robe', hair: 'long', hat: 'brim', over: 'collar', arms: 'hang', legs: 'hose', beard: true },
    c1: [CL.black, CL.black, CL.black, CL.brown, CL.grey], c2: [CL.white, CL.white, CL.black], c3: [CL.black, CL.black, CL.brown], speed: [1.0, 1.25], stride: 1.45 },
  { id: 'merchant', weight: 1.0, market: 1.5, el: { dress: 'robe', hair: 'long', hat: 'brim', over: 'cape', arms: 'hang', legs: 'hose' },
    c1: [CL.brown, CL.grey, CL.indigo, CL.black, CL.maroon], c2: [CL.black, CL.brown, CL.grey], c3: [CL.black, CL.brown], speed: [1.05, 1.3], stride: 1.45 },
  { id: 'lady', weight: 1.0, market: 1.0, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'collar', arms: 'hang' }, swing: 0.7,
    c1: [CL.black, CL.black, CL.grey, CL.indigo, CL.maroon], c2: [CL.white, CL.white, CL.black], c3: [CL.white, CL.black], speed: [0.95, 1.2], stride: 1.25, h: [0.9, 0.97] },
  { id: 'housewife', weight: 1.2, market: 1.6, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'sash', arms: 'hang' }, swing: 0.7,
    c1: [CL.brown, CL.red, CL.grey, CL.indigo, CL.ochre, CL.green], c2: [CL.white, CL.white, CL.black], c3: [CL.white], speed: [0.95, 1.2], stride: 1.25, h: [0.88, 0.96] },
  { id: 'porter', weight: 0.9, market: 1.8, el: { dress: 'tunic', hair: 'short', hat: 'cap', carry: 'sack', legs: 'hose' },
    c1: [CL.brown, CL.grey, CL.white, CL.ochre], c2: [CL.brown, CL.black], c3: [CL.red, CL.black, CL.brown, CL.grey], speed: [0.95, 1.2], stride: 1.15 },
  { id: 'milkmaid', weight: 0.5, market: 0.9, el: { dress: 'robe', hair: 'bun', hat: 'veil', carry: 'pails', over: 'sash' }, swing: 0.75,
    c1: [CL.brown, CL.indigo, CL.red], c2: [CL.white], c3: [CL.white], speed: [0.9, 1.1], stride: 1.1, h: [0.88, 0.95] },
  { id: 'sailor', weight: 1.0, market: 1.0, el: { dress: 'tunic', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang', legs: 'hose' },
    c1: [CL.white, CL.blue, CL.red, CL.grey, CL.brown], c2: [CL.blue, CL.red, CL.brown, CL.black], c3: [CL.red, CL.black, CL.blue, CL.brown], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'servant', weight: 0.8, market: 1.0, el: { dress: 'tunic', hair: 'short', hat: 'none', arms: 'hang', legs: 'hose' },
    c1: [CL.grey, CL.brown, CL.indigo, CL.white], c2: [CL.black, CL.brown, CL.grey], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
];
/** The boatman at his pole or oar, and the passenger sitting under the tilt. */
export const CREW = {
  boatman: { el: { dress: 'tunic', hair: 'short', hat: 'cap', legs: 'hose', over: 'belt', arms: 'pull' }, c1: [CL.white, CL.grey, CL.brown, CL.blue], c2: [CL.brown, CL.black, CL.blue], c3: [CL.red, CL.black, CL.brown] },
  passenger: { el: { dress: 'robe', hair: 'long', hat: 'brim', over: 'cape', pose: 'sit_ground', legs: 'hose' }, c1: [CL.black, CL.brown, CL.grey], c2: [CL.black, CL.white], c3: [CL.black] },
};

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/**
 * The praam (the lighter of the canals and the harbour: styles/dutch/boats.js), laden with casks (`cargo`) or empty with a canvas tilt over
 * its middle (`covered`, the boatman's cabin and a passenger's seat), near and far, and the oar. Built at 9.5 m, the bow toward −z, the
 * waterline at y 0; the boatman stands on the after deck (z +3.5) with the oar on the pin at the gunwale.
 */
export const BOAT = { L: 9.5, pin: [0.9, 0.8, 3.6], deck: 0.42, stern: 3.5, passenger: [0, -0.3, -0.2], hull: [1.42, 4.9] };
const beam = (out, p, q, r, n = 6) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((v) => v / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (v) => { const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
  const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
};
export function boatShapes(sb) {
  const grab = (el) => { const got = []; STYLES.dutch.elements.praam(el, { bag: { add: (m, g) => got.push([m, g]) } }); return got; };
  const group = (m) => (/cloth|wicker|sacking/.test(m) ? 'fibre' : 'wood');
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    const hull = grab({ t: 'praam', at: [0, 0], rot: 0, y: 0, len: BOAT.L, load: kind === 'cargo' ? 'casks' : 'empty', seed: kind === 'cargo' ? 5 : 9 });
    for (const [m, g] of hull) { if (far && (m === 'iron' || m === 'shutter_green')) continue; sb.addPiece(v, group(m), g, { slot: SLOT.none, col: factor(group(m), m === 'tar_wood' ? 'tar_wood' : m) }); }
    if (kind === 'covered') {
      // the tilt: a canvas tent over the boat's middle on its hoops (z −1.9 … 1.2), 1.45 m at the ridge
      const T = [], z0 = -1.9, z1 = 1.2, hw = 1.05, e = 0.55, ridge = 1.45;
      const quad = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
      quad([-hw, e, z0], [-hw, e, z1], [0, ridge, z1], [0, ridge, z0]); quad([hw, e, z1], [hw, e, z0], [0, ridge, z0], [0, ridge, z1]);
      const tri = (a, b, c) => T.push(...a, ...b, ...c, ...a, ...c, ...b);
      tri([-hw, e, z0], [0, ridge, z0], [hw, e, z0]); tri([hw, e, z1], [0, ridge, z1], [-hw, e, z1]);
      sb.addPiece(v, 'fibre', flat(T), { slot: SLOT.c2, col: factor('fibre', 'cloth_white', 0.9) });
      if (!far) { const w = []; for (const z of [z0, (z0 + z1) / 2, z1]) { beam(w, [-hw, e - 0.1, z], [0, ridge, z], 0.03, 4); beam(w, [hw, e - 0.1, z], [0, ridge, z], 0.03, 4); } beam(w, [0, ridge, z0], [0, ridge, z1], 0.03, 4); sb.addPiece(v, 'wood', flat(w), { slot: SLOT.none, col: factor('wood', 'timber', 0.8) }); }
    }
  }
  // the oar: a sweep on the pin at the gunwale, the loom forward to the boatman's hands, the broad blade running aft and down into the water
  const v = sb.variant('oar'), w = [], bl = [];
  const H = [-0.3, 1.1, -1.0], K = [0, 0.05, 0.1], B0 = [0.1, -0.5, 2.6], B1 = [0.2, -0.9, 3.7];
  beam(w, H, [0, 0.12, -0.05], 0.03, 6); beam(w, [0, 0.12, -0.05], K, 0.035, 6); beam(w, K, B0, 0.03, 6);
  const hw = 0.1, th = 0.016, d = [B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]], dl = Math.hypot(...d), du = d.map((x) => x / dl), side = [1, 0, 0], upv = [du[1] * side[2] - du[2] * side[1], du[2] * side[0] - du[0] * side[2], du[0] * side[1] - du[1] * side[0]];
  const Cc = (p, s, t) => [0, 1, 2].map((i) => p[i] + side[i] * s + upv[i] * t);
  const q = [[Cc(B0, -th, -hw * 0.5), Cc(B0, th, -hw * 0.5), Cc(B0, th, hw * 0.5), Cc(B0, -th, hw * 0.5)], [Cc(B1, -th * 0.6, -hw), Cc(B1, th * 0.6, -hw), Cc(B1, th * 0.6, hw), Cc(B1, -th * 0.6, hw)]];
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
  bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'wood_dark', 1.2) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'wood_dark', 1.0) });
}
