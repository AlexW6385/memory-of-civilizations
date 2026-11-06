// The sculptural and painted programme of the Classical Athenian temples (docs/settlements/athens.md
// §4a): the pediment groups, the metopes, the Ionic frieze in low relief on its blue ground, the
// Ionic entablature (three fasciae, a continuous frieze, dentils), the porch of the maidens, the
// bronze Athena Promachos, the floral acroteria.

import { Matrix4 } from '../../core/three.js';
import { box, lathe, fromTriangles, quad } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { human, horse, centaur, limb, blob, placed, relief } from './sculpture.js';
import { merge } from './columns.js';

const add = (bag, mats, g) => { if (g.stone) bag.add(mats.stone, g.stone); if (g.metal) bag.add(mats.metal, g.metal); };

// ── figures by kind, with their height in units of H and their half-width ──────────────────────
const TOP = { stand: 1.0, ease: 1.0, stride: 1.04, seat: 0.71, recline: 0.47, fallen: 0.52 };
const HALF = { stand: 0.17, ease: 0.18, stride: 0.33, seat: 0.22, recline: 0.5, fallen: 0.5 };
/** Build one programme entry at full size H (humans) or k (horses): returns the figure (pieces at the origin). */
function figureOf(e, H, n) {
  if (e.kind === 'horse') return horse({ pose: e.pose, h: H, mirror: e.mirror, n });
  if (e.kind === 'centaur') return centaur({ pose: e.pose, h: H, mirror: e.mirror, n });
  if (e.kind === 'tree') {
    // the olive, Athena's gift, between the two gods
    const g = [limb([0, 0, 0], [0.05 * H, 0.45 * H, 0], 0.05 * H, 0.035 * H, 6)];
    for (const [x, y] of [[-0.2, 0.7], [0.22, 0.68], [0.02, 0.8]]) { g.push(limb([0.05 * H, 0.45 * H, 0], [x * H, y * H, 0], 0.025 * H, 0.015 * H, 5)); g.push(blob([x * H, y * H, 0], 0.13 * H, [1.4, 0.7, 0.8], 7)); }
    return { stone: g, metal: [] };
  }
  const f = human({ ...e, h: H, n });
  if (e.upper) {
    // rising from (or sinking into) the sea of the pediment floor: only the body above the waist shows
    const m = new Matrix4().makeTranslation(0, -0.48 * H, 0);
    for (const g of f.stone) g.applyMatrix4(m); for (const g of f.metal) g.applyMatrix4(m);
  }
  if (e.axe) { const ha = e.mirror ? [-1, 1, 1] : [1, 1, 1]; f.metal.push(limb([0, 1.03 * H, 0].map((v, i) => v * ha[i]), [0.06 * H * ha[0], 1.2 * H, 0], 0.012 * H, 0.012 * H, 4), box(-0.05 * H, 1.17 * H, -0.01 * H, 0.08 * H, 1.24 * H, 0.01 * H)); }
  if (e.trident) { const sx = e.mirror ? -1 : 1, hx = 0.33 * sx * H; f.metal.push(limb([hx - 0.1 * sx * H, 0.4 * H, 0.09 * H], [hx + 0.12 * sx * H, 1.15 * H, 0.09 * H], 0.01 * H, 0.008 * H, 4)); for (const d of [-0.04, 0, 0.04]) f.metal.push(limb([hx + 0.12 * sx * H + d * H, 1.13 * H, 0.09 * H], [hx + 0.13 * sx * H + d * H * 1.4, 1.24 * H, 0.09 * H], 0.008 * H, 0.004 * H, 4)); }
  return f;
}
const topOf = (e) => (e.kind === 'horse' ? (e.pose === 'head' ? 0.55 : e.pose === 'rear' ? 1.45 : 1.2) : e.kind === 'centaur' ? 1.7 : e.kind === 'tree' ? 0.95 : e.upper ? 0.52 : TOP[e.pose ?? 'stand']);
const halfOf = (e) => (e.kind === 'horse' ? (e.pose === 'head' ? 0.3 : 0.6) : e.kind === 'centaur' ? 0.65 : e.kind === 'tree' ? 0.35 : HALF[e.pose ?? 'stand']);

// the pediments of the Parthenon, from the viewer's left corner to the right (f: −1 … 1 along the floor)
const PEDIMENTS = {
  // east: the birth of Athena — Helios and his horses rising in the south corner, Dionysos, Demeter and
  // Kore, Artemis; at the centre Zeus enthroned, Athena sprung fully armed, Hephaistos with the axe;
  // Hestia, Dione with Aphrodite in her lap; Selene and her horse sinking in the north corner
  'parthenon-east': [
    { f: -0.93, upper: true, pose: 'stand', drape: 'nude', arms: { l: [[-0.1, 0.7, 0.12], [-0.02, 0.8, 0.24]], r: [[0.12, 0.72, 0.12], [0.06, 0.82, 0.25]] }, H: 2.6 },
    { f: -0.86, kind: 'horse', pose: 'head', H: 1.7 }, { f: -0.8, kind: 'horse', pose: 'head', H: 1.7, d: -0.18 },
    { f: -0.64, pose: 'recline', drape: 'nude', mirror: true, H: 3.0 },
    { f: -0.5, pose: 'seat', drape: 'peplos', H: 2.8 }, { f: -0.4, pose: 'seat', drape: 'peplos', H: 2.9, d: -0.05 },
    { f: -0.29, pose: 'stride', drape: 'peplos', mirror: true, H: 2.6, arms: { l: [[-0.14, 0.72, 0.04], [-0.12, 0.88, 0.1]], r: [[0.12, 0.62, 0], [0.18, 0.5, 0.05]] } },
    { f: -0.17, pose: 'ease', drape: 'peplos', H: 2.9 },
    { f: -0.07, pose: 'seat', drape: 'mantle', H: 3.7, spear: 'r', spearDir: [0.04, 1, 0], arms: { r: [[0.17, 0.5, 0.05], [0.18, 0.62, 0.12]] } },
    { f: 0.04, pose: 'stand', drape: 'peplos', helmet: true, shield: 'l', spear: 'r', H: 2.85, arms: { r: [[0.16, 0.66, 0.02], [0.17, 0.78, 0.06]], l: [[-0.16, 0.64, 0.03], [-0.18, 0.55, 0.12]] } },
    { f: 0.15, pose: 'stride', drape: 'chiton', axe: true, H: 2.6 },
    { f: 0.27, pose: 'ease', drape: 'mantle', mirror: true, H: 2.8 },
    { f: 0.4, pose: 'seat', drape: 'peplos', H: 2.9 },
    { f: 0.51, pose: 'seat', drape: 'peplos', H: 2.6, d: -0.05 },
    { f: 0.66, pose: 'recline', drape: 'peplos', H: 3.0 },
    { f: 0.86, upper: true, pose: 'stand', drape: 'peplos', H: 2.4, arms: { l: [[-0.12, 0.64, 0.12], [0.0, 0.62, 0.22]], r: [[0.12, 0.64, 0.12], [0.02, 0.62, 0.23]] } },
    { f: 0.93, kind: 'horse', pose: 'head', H: 1.8 },
  ],
  // west: the contest of Athena and Poseidon for Attica — the two gods springing apart round the olive,
  // their chariots and rearing horses behind them, Hermes and Iris, the Attic heroes and their
  // families seated, the river gods reclining in the corners
  'parthenon-west': [
    { f: -0.88, pose: 'recline', drape: 'nude', mirror: true, H: 3.0 },
    { f: -0.7, pose: 'seat', drape: 'mantle', H: 2.7 }, { f: -0.61, pose: 'ease', drape: 'peplos', mirror: true, H: 2.5, d: -0.05 },
    { f: -0.5, pose: 'seat', drape: 'peplos', H: 2.8 }, { f: -0.41, pose: 'ease', drape: 'peplos', H: 2.6 },
    { f: -0.31, pose: 'stride', drape: 'chiton', mirror: true, H: 2.5 },
    { f: -0.21, kind: 'horse', pose: 'rear', mirror: true, H: 1.5, d: 0.12 }, { f: -0.17, kind: 'horse', pose: 'rear', mirror: true, H: 1.5, d: -0.15 },
    { f: -0.11, pose: 'stand', drape: 'peplos', H: 2.7 },
    { f: -0.04, pose: 'stride', drape: 'peplos', mirror: true, helmet: true, shield: 'r', H: 2.9 },
    { f: 0.0, kind: 'tree', H: 2.8, d: -0.2 },
    { f: 0.05, pose: 'stride', drape: 'nude', trident: true, H: 3.0 },
    { f: 0.12, pose: 'stand', drape: 'peplos', H: 2.7 },
    { f: 0.18, kind: 'horse', pose: 'rear', H: 1.5, d: 0.12 }, { f: 0.22, kind: 'horse', pose: 'rear', H: 1.5, d: -0.15 },
    { f: 0.32, pose: 'stride', drape: 'peplos', H: 2.5 },
    { f: 0.42, pose: 'seat', drape: 'peplos', H: 2.8 }, { f: 0.52, pose: 'seat', drape: 'mantle', H: 2.6, d: -0.05 },
    { f: 0.62, pose: 'ease', drape: 'peplos', mirror: true, H: 2.4 },
    { f: 0.76, pose: 'recline', drape: 'peplos', H: 2.8 },
    { f: 0.9, pose: 'recline', drape: 'nude', H: 2.6 },
  ],
};

/**
 * pediment_sculpture: { x (front face of the tympanum), dir (+1: the front faces +x), zc, half (half-length under the
 * raking cornice), y (floor), rise (height under the cornice at the centre), depth (floor), apex (tympanum apex height),
 * tz (half-length of the tympanum at its foot), programme, mat, metal, paint } — the figures in the round, and the
 * tympanum's blue ground behind them.
 */
function pedimentSculpture(el, { bag }) {
  const mats = { stone: el.mat || 'marble_smooth', metal: el.metal || 'bronze' }, dir = el.dir, yaw = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
  const toZ = (u) => (dir > 0 ? el.zc - u : el.zc + u);
  for (const e of PEDIMENTS[el.programme]) {
    const u = e.f * el.half, top = topOf(e), half = halfOf(e);
    let H = e.H ?? 2.6;
    // the figure as large as the raking cornice allows at its outer side (a recliner: at its middle)
    for (let k = 0; k < 3; k++) {
      const reach = Math.abs(u) + (e.pose === 'recline' ? 0 : half * H * 0.8);
      const avail = Math.max(0.2, el.rise * (1 - reach / el.half) - 0.08);
      H = Math.min(e.H ?? 2.6, avail / top);
    }
    const fig = figureOf(e, H, 8);
    add(bag, mats, placed(fig, el.x + dir * (el.depth * 0.5 + (e.d ?? 0)), el.y, toZ(u), yaw));
  }
  if (el.paint) {
    // the tympanum painted blue behind the figures (a thin skin a few millimetres before the stone)
    const x0 = el.x + dir * 0.004, x1 = el.x + dir * 0.014, t = [];
    const A = [el.zc - el.tz, el.y + 0.002], B = [el.zc + el.tz, el.y + 0.002], C = [el.zc, el.apex];
    const P = (x, [z, y]) => [x, y, z];
    const f = (a, b, c) => t.push(...a, ...b, ...c);
    const fa = [P(x1, A), P(x1, B), P(x1, C)], ba = [P(x0, A), P(x0, B), P(x0, C)];
    if (dir > 0) { f(fa[0], fa[2], fa[1]); f(ba[0], ba[1], ba[2]); } else { f(fa[0], fa[1], fa[2]); f(ba[0], ba[2], ba[1]); }
    bag.add(el.paint, prismSides(t, fa, ba, dir));
  }
}
function prismSides(t, fa, ba) {
  for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; quad(t, fa[i], ba[i], ba[j], fa[j]); }
  return fromTriangles(orient(t, fa, ba));
}
function orient(t, fa, ba) {
  const c = [0, 1, 2].map((k) => (fa[0][k] + fa[1][k] + fa[2][k] + ba[0][k] + ba[1][k] + ba[2][k]) / 6);
  for (let i = 0; i < t.length; i += 9) {
    const a = t.slice(i, i + 3), b = t.slice(i + 3, i + 6), d = t.slice(i + 6, i + 9);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    const nn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const m = [(a[0] + b[0] + d[0]) / 3 - c[0], (a[1] + b[1] + d[1]) / 3 - c[1], (a[2] + b[2] + d[2]) / 3 - c[2]];
    if (nn[0] * m[0] + nn[1] * m[1] + nn[2] * m[2] < 0) for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; }
  }
  return t;
}

// ── metopes ─────────────────────────────────────────────────────────────────────────────────
// the figures of the metopes, by subject: those that stand on the left of a metope and those on the right (local x
// across its width, facing the viewer). Every metope pairs one of each, so that the same carved figure recurs along a
// side and is drawn once (instanced) — the long sides hold 32 metopes each.
const METOPES = {
  centauromachy: {
    l: [{ kind: 'centaur', pose: 'rear', x: -0.14, H: 0.6 }, { pose: 'stride', drape: 'nude', x: -0.3, H: 1.05 }, { pose: 'fallen', drape: 'nude', x: -0.18, H: 1.1, d: 0.04 }],
    r: [{ pose: 'stride', drape: 'chiton', mirror: true, x: 0.32, H: 1.05, shield: 'r' }, { kind: 'centaur', pose: 'rear', mirror: true, x: 0.15, H: 0.6 }, { pose: 'ease', drape: 'peplos', mirror: true, x: 0.38, H: 1.0 }],
  },
  gigantomachy: {
    l: [{ pose: 'stride', drape: 'chiton', x: -0.27, H: 1.08, shield: 'r', helmet: true }, { kind: 'horse', pose: 'rear', x: -0.1, H: 0.6 }, { pose: 'stride', drape: 'peplos', x: -0.28, H: 1.04 }],
    r: [{ pose: 'fallen', drape: 'nude', mirror: true, x: 0.25, H: 1.1, d: 0.04 }, { pose: 'stride', drape: 'nude', mirror: true, x: 0.3, H: 1.08 }, { pose: 'stride', drape: 'chiton', mirror: true, x: 0.33, H: 1.0, shield: 'r' }],
  },
  amazonomachy: {
    l: [{ kind: 'horse', pose: 'rear', x: -0.1, H: 0.6, rider: true }, { pose: 'stride', drape: 'chiton', x: -0.27, H: 1.06, shield: 'r', helmet: true }, { pose: 'stride', drape: 'nude', x: -0.28, H: 1.06, shield: 'r' }],
    r: [{ pose: 'stride', drape: 'nude', mirror: true, x: 0.36, H: 1.0, shield: 'r' }, { pose: 'fallen', drape: 'chiton', mirror: true, x: 0.24, H: 1.08, d: 0.04 }, { pose: 'stride', drape: 'chiton', mirror: true, x: 0.3, H: 1.06 }],
  },
  troy: {
    l: [{ pose: 'stride', drape: 'chiton', x: -0.27, H: 1.06, shield: 'r', helmet: true }, { pose: 'ease', drape: 'peplos', x: -0.3, H: 1.04 }, { pose: 'seat', drape: 'peplos', x: -0.25, H: 1.1 }],
    r: [{ pose: 'stride', drape: 'chiton', mirror: true, x: 0.27, H: 1.06, shield: 'r', helmet: true }, { pose: 'stand', drape: 'chiton', mirror: true, x: 0.28, H: 1.08, helmet: true, spear: 'r' }, { pose: 'ease', drape: 'peplos', mirror: true, x: 0.3, H: 1.04 }],
  },
};
const FIG_CACHE = new Map();
/** A metope figure built once (at the origin, local) and cloned. */
function metopeFigure(e, s) {
  const key = JSON.stringify(e) + s;
  if (!FIG_CACHE.has(key)) {
    const f = figureOf(e, e.H * s, 6);
    if (e.rider) {
      // an Amazon astride the rearing horse
      const r = human({ pose: 'seat', noSeat: true, drape: 'chiton', h: 0.95 * s, n: 6, arms: { r: [[0.18, 0.62, 0.05], [0.26, 0.78, 0.08]] } });
      const m = new Matrix4().makeTranslation(-0.02 * s, 0.82 * s, 0);
      for (const g of r.stone) { g.applyMatrix4(m); f.stone.push(g); }
    }
    FIG_CACHE.set(key, placed(f, e.x * s, 0, e.d ?? 0, 0));
    if (FIG_CACHE.size > 64) FIG_CACHE.delete(FIG_CACHE.keys().next().value);
  }
  const g = FIG_CACHE.get(key);
  return { stone: g.stone?.clone(), metal: g.metal?.clone() };
}
const sideTriglyphs = (axes, lo, hi, tw) => {
  const out = [];
  for (let i = 0; i < axes.length; i++) {
    out.push(i === 0 ? lo + tw / 2 : i === axes.length - 1 ? hi - tw / 2 : axes[i]);
    if (i < axes.length - 1) out.push((axes[i] + axes[i + 1]) / 2);
  }
  return out;
};
/**
 * metopes: the doric_entablature's own parameters ({ axes, y, face, arch, frieze, tw }) and the subjects of the four
 * sides { programme: { n, s, e, w } }, the ground colour (bg) and the band over the metopes (band) — the figures in high
 * relief on each metope, its painted ground, the painted band at its head.
 */
function metopes(el, { bag }) {
  const X = el.axes.x, Z = el.axes.z, f = el.face, tw = el.tw;
  const O = [X[0] - f, Z[0] - f, X[X.length - 1] + f, Z[Z.length - 1] + f];
  const yA = el.y + el.arch, yF = yA + el.frieze, mats = { stone: el.figMat || 'marble_smooth', metal: el.metal || 'bronze' };
  const tx = sideTriglyphs(X, O[0], O[2], tw), tz = sideTriglyphs(Z, O[1], O[3], tw);
  const s = (el.frieze - 0.12) / 1.23;                                   // the figures scale with the metope
  const sides = [
    { k: 'n', t: tx, face: O[1] + 0.05, out: -1, along: 'x', yaw: Math.PI }, { k: 's', t: tx, face: O[3] - 0.05, out: 1, along: 'x', yaw: 0 },
    { k: 'e', t: tz, face: O[2] - 0.05, out: 1, along: 'z', yaw: Math.PI / 2 }, { k: 'w', t: tz, face: O[0] + 0.05, out: -1, along: 'z', yaw: -Math.PI / 2 },
  ];
  for (const sd of sides) {
    const subject = el.programme?.[sd.k];
    for (let i = 0; i + 1 < sd.t.length; i++) {
      const a = sd.t[i] + tw / 2, b = sd.t[i + 1] - tw / 2, c = (a + b) / 2;
      if (el.only?.[sd.k] && !el.only[sd.k].includes(i)) continue;
      // the ground of the metope (painted) and the band at its head
      const y0 = yA + 0.02, y1 = yF - 0.12;
      const fp = sd.face + sd.out * 0.004, fq = sd.face + sd.out * 0.016;
      const r = (u0, u1, v0, v1) => (sd.along === 'x' ? box(u0, v0, Math.min(v0 * 0 + fp, fq), u1, v1, Math.max(fp, fq)) : box(Math.min(fp, fq), v0, u0, Math.max(fp, fq), v1, u1));
      if (subject && el.bg) bag.add(el.bg, r(a, b, y0, y1));
      if (el.band) bag.add(el.band, sd.along === 'x' ? box(a, yF - 0.12, Math.min(sd.face, sd.face + sd.out * 0.12), b, yF, Math.max(sd.face, sd.face + sd.out * 0.12)) : box(Math.min(sd.face, sd.face + sd.out * 0.12), yF - 0.12, a, Math.max(sd.face, sd.face + sd.out * 0.12), yF, b));
      if (!subject) continue;
      // a left figure and a right one: on the long sides each of four pairings in turn, on the ends all nine
      const set = METOPES[subject], long = sd.t.length > 20;
      const li = long ? (i >> 1) % 2 : i % 3, ri = long ? i % 2 : Math.floor(i / 3) % 3;
      const m = new Matrix4().makeRotationY(sd.yaw);
      const out = 0.016 + 0.1 * s;
      m.setPosition(sd.along === 'x' ? c : sd.face + sd.out * out, y0 + 0.01, sd.along === 'x' ? sd.face + sd.out * out : c);
      for (const e of [set.l[li], set.r[ri]]) {
        const g = metopeFigure(e, s);
        if (g.stone) { g.stone.applyMatrix4(m); bag.add(mats.stone, g.stone); }
        if (g.metal) { g.metal.applyMatrix4(m); bag.add(mats.metal, g.metal); }
      }
    }
  }
}

// ── the Ionic frieze in low relief ──────────────────────────────────────────────────────────
// the Panathenaic procession: what comes along each run, from its start (the horsemen first)
const SEQ = {
  // the west: the horsemen making ready and setting out, a marshal here and there
  cavalcade: (n) => Array.from({ length: n }, (_, i) => (i % 5 === 4 ? 'walker' : 'horseman')),
  // the long sides: the cavalcade, the chariots, the elders, musicians and bearers, the victims
  procession: (n) => Array.from({ length: n }, (_, i) => { const t = i / n; return t < 0.42 ? 'horseman' : t < 0.62 ? 'chariot' : t < 0.82 ? 'walker' : 'heifer'; }),
  // the east, from a corner to the centre: the maidens, the marshals, the seated gods
  east: (n) => Array.from({ length: n }, (_, i) => { const t = i / n; return t < 0.45 ? 'maiden' : t < 0.6 ? 'walker' : 'god'; }),
  // the Erechtheion's frieze: figures standing and seated, without a procession
  gathering: (n) => Array.from({ length: n }, (_, i) => ['walker', 'maiden', 'god', 'maiden', 'walker'][i % 5]),
  // the parapet of Athena Nike: Victories leading cattle, setting up trophies — here Victories in a row
  nikai: (n) => Array.from({ length: n }, (_, i) => (i % 4 === 3 ? 'heifer' : 'nike')),
};
const WIDTH = { horseman: 0.62, chariot: 1.25, walker: 0.4, maiden: 0.36, heifer: 1.0, god: 0.62, nike: 0.5 };
/**
 * frieze_relief: { runs: [{ a, b, o (outward unit, plan), seq ('procession' …), toward ('a' | 'b' | 'mid') }], y0, h, d
 * (relief depth), mat, bg (the painted ground, or none), off (the stand-off of the ground from the wall) }.
 */
function friezeRelief(el, { bag }) {
  const mat = el.mat || 'marble_smooth', s = el.h / 1.0 * 0.95, off = el.off ?? 0.004, gth = el.bg ? 0.012 : 0;
  for (const run of el.runs) {
    const [ax, az] = run.a, [bx, bz] = run.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, [ox, oz] = run.o;
    if (el.bg) {
      const k = off + gth / 2;
      bag.add(el.bg, orientedBox([ax + ox * k, az + oz * k], [bx + ox * k, bz + oz * k], gth, el.y0, el.y0 + el.h));
    }
    const k0 = off + gth + 0.001, y = el.y0 + el.h * 0.03;
    const halves = run.toward === 'mid' ? [[0, L / 2, 'b'], [L / 2, L, 'a']] : [[0, L, run.toward]];
    for (const [s0, s1, toward] of halves) {
      const len = s1 - s0, kinds = [];
      let need = 0;
      // fill the run with the sequence, at the widths of its groups
      for (let n = 4; n < 400; n++) { const q = SEQ[run.seq](n); const w = q.reduce((a, k) => a + WIDTH[k] * s, 0); if (w > len * 0.97) break; kinds.length = 0; kinds.push(...q); need = w; }
      const gap = (len - need) / Math.max(1, kinds.length);
      // a procession toward b starts at a; toward a it starts at b
      let pos = 0;
      kinds.forEach((kind, i) => {
        const w = WIDTH[kind] * s, cen = pos + gap / 2 + w / 2;
        pos += w + gap;
        const at = toward === 'b' ? s0 + cen : s1 - cen;
        const flip = toward === 'a';
        const p = [ax + ux * at + ox * k0, y, az + uz * at + oz * k0];
        const g = relief(kind, el.same || kind === 'horseman' || kind === 'heifer' || kind === 'nike' ? 0 : i, { p, u: [ux, 0, uz], o: [ox, 0, oz], s, d: el.d ?? 0.056, flip });
        bag.add(mat, g);
      });
    }
  }
}

// ── the Ionic entablature ───────────────────────────────────────────────────────────────────
/**
 * ionic_entablature: { axes, y, face, arch, frieze, geison, overhang, mat, friezeMat, dentils } — the architrave in three
 * fasciae under a moulding, the continuous frieze (of the dark Eleusinian stone at the Erechtheion), the dentils, the
 * cornice. Same heights as the Doric one so that the pediment sits where it did.
 */
function ionicEntablature(el, { bag }) {
  const mat = el.mat || 'marble', X = el.axes.x, Z = el.axes.z, f = el.face, fi = el.inner ?? el.face;
  const y0 = el.y, yA = y0 + el.arch, yF = yA + el.frieze, yG = yF + el.geison, oh = el.overhang ?? 0.5;
  const O = [X[0] - f, Z[0] - f, X[X.length - 1] + f, Z[Z.length - 1] + f], I = [X[0] + fi, Z[0] + fi, X[X.length - 1] - fi, Z[Z.length - 1] - fi];
  const grow = (r, d) => [r[0] - d, r[1] - d, r[2] + d, r[3] + d];
  const ring = (r, ri, ya, yb, m) => {
    bag.add(m, box(r[0], ya, r[1], r[2], yb, ri[1])); bag.add(m, box(r[0], ya, ri[3], r[2], yb, r[3]));
    bag.add(m, box(r[0], ya, ri[1], ri[0], yb, ri[3])); bag.add(m, box(ri[2], ya, ri[1], r[2], yb, ri[3]));
  };
  const a = el.arch;
  // three fasciae, each standing a little forward of the one below, and the crowning moulding
  ring(grow(O, -0.04), I, y0, y0 + a * 0.26, mat);
  ring(grow(O, -0.015), I, y0 + a * 0.26, y0 + a * 0.55, mat);
  ring(grow(O, 0.01), I, y0 + a * 0.55, y0 + a * 0.86, mat);
  ring(grow(O, 0.05), I, y0 + a * 0.86, yA, mat);
  // the frieze, one band without triglyphs
  ring(O, I, yA, yF - 0.06, el.friezeMat || mat);
  ring(grow(O, 0.04), I, yF - 0.06, yF, mat);
  // dentils, then the cornice and its sima
  if (el.dentils) {
    const dw = 0.1 * (el.geison / 0.5), D = grow(O, 0.12);
    ring(grow(O, 0.02), I, yF, yF + el.geison * 0.3, mat);
    for (const [u0, u1, v, along, sgn] of [[D[0], D[2], D[1], 'x', -1], [D[0], D[2], D[3], 'x', 1], [D[1], D[3], D[0], 'z', -1], [D[1], D[3], D[2], 'z', 1]]) {
      for (let u = u0 + dw; u < u1 - dw; u += dw * 1.6) {
        const vb = v - sgn * 0.12;
        if (along === 'x') bag.add(mat, box(u, yF, Math.min(v, vb + sgn * 0.02), u + dw, yF + el.geison * 0.3, Math.max(v, vb + sgn * 0.02)));
        else bag.add(mat, box(Math.min(v, vb + sgn * 0.02), yF, u, Math.max(v, vb + sgn * 0.02), yF + el.geison * 0.3, u + dw));
      }
    }
  }
  const yc = el.dentils ? yF + el.geison * 0.3 : yF;
  ring(grow(O, oh), I, yc + (yG - yc) * 0.3, yG, mat);
  ring(grow(O, oh * 0.5), I, yc, yc + (yG - yc) * 0.3, mat);
}

// ── the porch of the maidens ─────────────────────────────────────────────────────────────────
/**
 * caryatid_porch: { rect (the porch), y (its floor outside), parapet (height), h (a maiden with her capital), cols
 * ([[x, z, mirror]]), front ('s'), mat } — the parapet with its base and crown, six maidens in the peplos with their
 * basket-capitals, the architrave of three fasciae with the rosettes, the dentils, the cornice, the flat roof.
 */
function caryatidPorch(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, py = y + el.parapet, mat = el.mat || 'marble', stone = 'marble_smooth';
  bag.add(mat, box(x0, y - 0.6, z0, x1, py - 0.25, z1)); col.rect(el.rect, y - 0.6, py);
  bag.add(mat, box(x0 - 0.12, y - 0.6, z0 - 0.12, x1 + 0.12, y + 0.32, z1 + 0.12));                 // the base moulding
  bag.add(mat, box(x0 - 0.06, y + 0.32, z0 - 0.06, x1 + 0.06, y + 0.4, z1 + 0.06));
  bag.add(mat, box(x0 - 0.1, py - 0.25, z0 - 0.1, x1 + 0.1, py, z1 + 0.1));                        // the crown
  const fh = el.h * 0.86, ch = el.h - fh, top = py + el.h;
  for (const [x, z, mir] of el.cols) {
    // the maiden: her weight on the inner leg, the outer knee bent forward, the braid down her back
    const fig = human({ pose: 'ease', drape: 'peplos', hair: 'rope', mirror: mir, h: fh * 1.04, n: 7,
      arms: mir ? { l: [[-0.15, 0.63, 0.02], [-0.12, 0.55, 0.15]], r: [[0.15, 0.625, 0.0], [0.17, 0.47, 0.05]] } : { r: [[0.15, 0.63, 0.02], [0.12, 0.55, 0.15]], l: [[-0.15, 0.625, 0.0], [-0.17, 0.47, 0.05]] } });
    const g = placed(fig, x, py, z, 0);
    bag.add(stone, g.stone);
    // the capital on her head: a cushion (echinus) carved with egg-and-dart, a square abacus
    const hy = py + fh * 0.995;
    bag.add(stone, lathe([[0.15, 0], [0.2, ch * 0.18], [0.27, ch * 0.42], [0.28, ch * 0.55], [0.001, ch * 0.56]], 32, (th) => 1 + 0.05 * Math.max(0, Math.cos(th * 16)), x, hy, z));
    bag.add(stone, box(x - 0.31, hy + ch * 0.55, z - 0.31, x + 0.31, top, z + 0.31));
    col.circle(x, z, 0.28, py, top);
  }
  // the architrave in three fasciae, rosettes on the top one, dentils, the cornice; the roof slab and its coffers
  const ex = [x0 - 0.05, z0 - 0.05, x1 + 0.05, z1 + 0.05], a = 0.62;
  const ring = (r, ya, yb, inset = 0.5) => { bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[1] + inset)); bag.add(mat, box(r[0], ya, r[3] - inset, r[2], yb, r[3])); bag.add(mat, box(r[0], ya, r[1] + inset, r[0] + inset, yb, r[3] - inset)); bag.add(mat, box(r[2] - inset, ya, r[1] + inset, r[2], yb, r[3] - inset)); };
  ring([ex[0] + 0.03, ex[1] + 0.03, ex[2] - 0.03, ex[3] - 0.03], top, top + a * 0.3);
  ring([ex[0] + 0.015, ex[1] + 0.015, ex[2] - 0.015, ex[3] - 0.015], top + a * 0.3, top + a * 0.62);
  ring(ex, top + a * 0.62, top + a);
  // rosettes on the top fascia, on the three outer faces
  const ry = top + a * 0.81, rr = 0.09;
  const ros = (cx, cz, nx, nz) => { const g = lathe([[rr, 0], [rr * 0.8, 0.03], [rr * 0.35, 0.045], [0.001, 0.05]], 10, (th) => 1 + 0.18 * Math.cos(th * 8)); g.applyMatrix4(new Matrix4().makeRotationX(nz ? (nz > 0 ? Math.PI / 2 : -Math.PI / 2) : 0).premultiply(new Matrix4().makeRotationZ(nx ? (nx > 0 ? -Math.PI / 2 : Math.PI / 2) : 0)).setPosition(cx, ry, cz)); bag.add(stone, g); };
  for (let x = ex[0] + 0.45; x < ex[2] - 0.3; x += 0.62) ros(x, ex[3], 0, 1);
  for (let z = ex[1] + 0.45; z < ex[3] - 0.3; z += 0.62) { ros(ex[0], z, -1, 0); ros(ex[2], z, 1, 0); }
  const d0 = top + a;
  bag.add(mat, box(ex[0] + 0.02, d0, ex[1] + 0.02, ex[2] - 0.02, d0 + 0.18, ex[3] - 0.02));
  for (let x = ex[0] + 0.08; x < ex[2] - 0.12; x += 0.17) bag.add(mat, box(x, d0, ex[3] - 0.02, x + 0.1, d0 + 0.18, ex[3] + 0.08));
  for (let z = ex[1] + 0.08; z < ex[3] - 0.12; z += 0.17) { bag.add(mat, box(ex[0] - 0.08, d0, z, ex[0] + 0.02, d0 + 0.18, z + 0.1)); bag.add(mat, box(ex[2] - 0.02, d0, z, ex[2] + 0.08, d0 + 0.18, z + 0.1)); }
  bag.add(mat, box(ex[0] - 0.3, d0 + 0.18, ex[1] - 0.3, ex[2] + 0.3, d0 + 0.42, ex[3] + 0.3));
  bag.add(mat, box(ex[0] - 0.18, d0 + 0.42, ex[1] - 0.18, ex[2] + 0.18, d0 + 0.6, ex[3] + 0.18));
  // coffers under the roof: a grid of beams on the ceiling
  for (let x = ex[0] + 0.5; x < ex[2] - 0.4; x += 1.1) bag.add(mat, box(x, top + a - 0.22, ex[1] + 0.5, x + 0.16, top + a, ex[3] - 0.5));
}

// ── the bronze Athena Promachos ──────────────────────────────────────────────────────────────
/** promachos: { c, h (the figure), y, base } — Athena standing armed, the spear upright, the shield at her side, on a stepped base. */
function promachos(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, h = el.h ?? 7.4, b = el.base ?? 1.7, mat = 'marble';
  bag.add(mat, box(x - 2.4, y, z - 2.4, x + 2.4, y + 0.35, z + 2.4));
  bag.add(mat, box(x - 2.1, y + 0.35, z - 2.1, x + 2.1, y + 0.5, z + 2.1));
  bag.add(mat, box(x - 1.85, y + 0.5, z - 1.85, x + 1.85, y + b - 0.25, z + 1.85));
  bag.add(mat, box(x - 2.0, y + b - 0.25, z - 2.0, x + 2.0, y + b, z + 2.0));
  col.rect([x - 2.4, z - 2.4, x + 2.4, z + 2.4], y, y + b + h);
  const fig = human({ pose: 'ease', drape: 'peplos', helmet: true, h, n: 12, spear: 'r', spearDir: [0.02, 1, 0], arms: { r: [[0.16, 0.66, 0.03], [0.16, 0.8, 0.08]], l: [[-0.17, 0.6, 0.02], [-0.2, 0.37, 0.05]] } });
  // the shield rests on its rim at her left, upright
  const sh = lathe([[0.001, -0.06], [1.25, -0.03], [1.3, 0.02], [0.001, 0.09]], 24);
  sh.applyMatrix4(new Matrix4().makeRotationZ(Math.PI / 2).setPosition(-0.2 * h - 0.1, 1.3, 0.05 * h));
  fig.metal.push(sh);
  const g = placed({ stone: [...fig.stone, ...fig.metal] }, x, y + b, z, el.yaw ?? -Math.PI / 2);
  bag.add('bronze', g.stone);
}

// ── floral acroteria ─────────────────────────────────────────────────────────────────────────
/** acroterion: { at: [x, z], y, h, yaw } — a palmette of acanthus and spiral tendrils at the apex of a pediment. */
function acroterion(el, { bag }) {
  const [x, z] = el.at, y = el.y, h = el.h ?? 2.5, g = [];
  g.push(box(-0.35 * h * 0.4, 0, -0.08, 0.35 * h * 0.4, 0.12 * h, 0.08));
  for (let i = -4; i <= 4; i++) {
    const a = i * 0.17, L = h * (0.8 - Math.abs(i) * 0.06);
    g.push(limb([0, 0.12 * h, 0], [Math.sin(a) * L * 0.6, 0.12 * h + Math.cos(a) * L * 0.9, 0], 0.07 * h * 0.3, 0.02, 5));
  }
  for (const s of [-1, 1]) g.push(limb([0, 0.15 * h, 0], [s * 0.3 * h, 0.2 * h, 0], 0.05, 0.05, 5), blob([s * 0.33 * h, 0.27 * h, 0], 0.08 * h, [1, 1, 0.5], 6));
  const m = merge(g);
  m.applyMatrix4(new Matrix4().makeRotationY(el.yaw ?? 0).setPosition(x, y, z));
  bag.add(el.mat || 'marble_smooth', m);
}

export const PROGRAMME = { pediment_sculpture: pedimentSculpture, metopes, frieze_relief: friezeRelief, ionic_entablature: ionicEntablature, caryatid_porch: caryatidPorch, promachos, acroterion };
