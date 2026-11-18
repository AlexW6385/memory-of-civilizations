// The Parthenon's sculpture, rebuilt from two metres (docs/settlements/athens.md §4h): the pediment groups in the round,
// the metopes nearest the east front in high relief, the east frieze in low relief. All of it is made with the figure kit
// (bodies.js: men and women from a skeleton; horses.js: horses, centaurs, the chariot) and registered as the greek style's
// elements `parthenon_pediment`, `parthenon_metopes` and `parthenon_east_frieze` (the style itself is untouched).
//
// Relief is the same figure squeezed: a metope's figure is built whole, its back half cut away and its depth stretched to
// a hand's breadth (high relief, limbs standing clear of the ground, undercut where an arm lifts); a frieze figure, turned
// three-quarters, squeezed to 2–5 cm. Detail by distance (lod): the east pediment and the east metopes and frieze, which
// the arrival and the stair look at, in full (0); the west pediment, seen from the walk round the pteron, reduced (1).
// Everything is deterministic: the small differences that keep pieces from being instanced come from the position.

import { Matrix4 } from '../../core/three.js';
import { STYLES, orientedBox } from '../../core/build.js';
import { box, fromTriangles, quad } from '../../core/geom.js';
import '../../styles/greek/index.js';
import { merge } from '../../styles/greek/columns.js';
import { bodyOf, clipBelow, reliefSqueeze } from './bodies.js';
import { horseOf, chariotOf, centaurOf, mirrorFig } from './horses.js';
import { tube, blob, limb } from './figures.js';

/** A deterministic number in [0, 1) from three coordinates. */
const hash = (x, y, z) => { const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return h - Math.floor(h); };

/** The olive Athena gave: a gnarled trunk forking low, boughs, clumps of foliage (the leaf list, painted green). Height 1. */
function oliveOf(lod) {
  const stone = [], leaf = [];
  stone.push(tube([[0, 0, 0], [0.025, 0.14, 0.01], [-0.01, 0.3, 0.0], [0.03, 0.44, 0]], [[0.075, 0.07], [0.06, 0.055], [0.052, 0.05], [0.04, 0.04]], { seg: 8, sub: 1, mod: (th, t) => 1 + 0.18 * Math.cos(3 * th + 5 * t) }));
  const boughs = [[-0.2, 0.7], [0.2, 0.68], [0.02, 0.88], [-0.1, 0.55], [0.17, 0.52]];
  boughs.forEach(([x, y], i) => {
    const from = y < 0.6 ? [0.03, 0.34, 0] : [0.03, 0.44, 0];
    stone.push(tube([from, [from[0] + (x - from[0]) * 0.5, from[1] + (y - from[1]) * 0.45 - 0.02, 0.02 * (i % 2 ? 1 : -1)], [x * 0.9, y * 0.96, 0.02]], [[0.026, 0.026], [0.019, 0.019], [0.012, 0.012]], { seg: 6, sub: 0 }));
    const n = lod === 0 ? 3 : 2;
    for (let k = 0; k < n; k++) leaf.push(blob([x + (k - 1) * 0.07, y + 0.03 * (k % 2), (k - 1) * 0.03], 0.1 - 0.015 * k, [1.4, 0.6, 0.9], 6));
  });
  return { stone, metal: [], leaf };
}

/** One figure of a composition, as lists of geometries { stone, metal, leaf } at its own height-1 scale. */
function build(s, lod) {
  if (s.kind === 'horse') return horseOf({ ...s, lod });
  if (s.kind === 'centaur') return centaurOf({ ...s, lod });
  if (s.kind === 'chariot') { const c = chariotOf({ ...s, lod }); return s.mirror ? mirrorFig(c) : c; }
  if (s.kind === 'olive') return oliveOf(lod);
  const f = bodyOf({ ...s, lod });
  if (s.upper) for (const g of f.stone) clipBelow(g, 0.5);
  return f;
}
const TOP = { stand: 1.0, ease: 1.0, stride: 1.04, seat: 0.72, recline: 0.5, fallen: 0.45 };
const HALF = { stand: 0.17, ease: 0.18, stride: 0.34, seat: 0.22, recline: 0.5, fallen: 0.5 };
const topOf = (e) => (e.kind === 'horse' ? (e.pose === 'head' ? 0.72 : e.pose === 'rear' ? 1.8 : 1.45) : e.kind === 'centaur' ? 1.9 : e.kind === 'chariot' ? 0.9 : e.kind === 'olive' ? 1 : e.upper ? 0.52 : TOP[e.pose ?? 'stand']);
const halfOf = (e) => (e.kind === 'horse' ? (e.pose === 'head' ? 0.35 : 0.78) : e.kind === 'centaur' ? 0.8 : e.kind === 'chariot' ? 1.0 : e.kind === 'olive' ? 0.35 : HALF[e.pose ?? 'stand']);

// the pediments, from the viewer's left corner to the right (f: −1 … 1 along the floor); `H` the height (a horse: at the withers)
const W = { R: [-0.04, 1.0, 0.0], L: [0.2, 0.82, 0.1] };
const PED = {
  // east: the birth of Athena. Helios' horses rising in the south corner, Dionysos, Demeter and Kore, Artemis; the centre (lost): Zeus
  // enthroned, Athena armed, Hephaistos with the axe, Hera; Hestia, Dione with Aphrodite; Selene's horse sinking in the north corner
  east: [
    { f: -0.93, upper: true, pose: 'stand', arms: { R: [-0.2, 0.98, 0.1], L: [0.2, 0.9, 0.12] }, H: 2.5 },
    { f: -0.855, kind: 'horse', pose: 'head', H: 1.9, bridle: true, headTilt: 0.25, lift: -0.1 }, { f: -0.79, kind: 'horse', pose: 'head', H: 1.8, d: -0.2, headTilt: 0.1, lift: 0.1 },
    { f: -0.64, pose: 'recline', drape: 'nude', mirror: true, beard: false, seat: 'rock', H: 3.0 },
    { f: -0.5, pose: 'seat', drape: 'peplos', female: true, seat: true, H: 2.8 }, { f: -0.4, pose: 'seat', drape: 'peplos', female: true, seat: true, look: 18, H: 2.9, d: -0.05 },
    { f: -0.29, pose: 'stride', drape: 'peplos', female: true, mirror: true, cloak: { dir: [1, -0.1, -0.3], len: 0.5, w: 0.2 }, H: 2.7 },
    { f: -0.17, pose: 'ease', drape: 'peplos', female: true, H: 2.9 },
    { f: -0.07, pose: 'seat', drape: 'mantle', beard: true, seat: { backrest: true }, spear: 'R', spearDir: [0.03, 1, 0], arms: { R: [0.16, 0.62, 0.1], L: [-0.15, 0.4, 0.15] }, H: 3.8 },
    { f: 0.04, pose: 'stand', drape: 'peplos', female: true, helmet: true, shield: 'L', spear: 'R', arms: { R: [0.17, 0.7, 0.06], L: [-0.18, 0.55, 0.14] }, H: 2.9 },
    { f: 0.15, pose: 'stride', drape: 'chiton', beard: true, axe: 'R', arms: { R: [0.1, 0.95, 0.0], L: [0.3, 0.7, 0.1] }, axeDir: [0.1, 1, 0], H: 2.6 },
    { f: 0.27, pose: 'ease', drape: 'mantle', bareLegs: true, beard: true, mirror: true, H: 2.8 },
    { f: 0.4, pose: 'seat', drape: 'peplos', female: true, seat: true, H: 2.9 }, { f: 0.51, pose: 'seat', drape: 'peplos', female: true, seat: true, look: -15, H: 2.6, d: -0.05 },
    { f: 0.66, pose: 'recline', drape: 'mantle', female: true, H: 3.0 },
    { f: 0.86, upper: true, pose: 'stand', drape: 'peplos', female: true, arms: { R: [-0.15, 0.7, 0.12], L: [0.15, 0.68, 0.14] }, H: 2.4 },
    { f: 0.935, kind: 'horse', pose: 'head', H: 1.9, mouth: true, bridle: true, mirror: true, headTilt: 0.35, lift: 0.05 },
  ],
  // west: Athena and Poseidon for Attica, springing apart round the olive, their chariots behind them, Hermes and Iris, the Attic
  // heroes and their families seated, the river gods reclining in the corners
  west: [
    { f: -0.9, pose: 'recline', drape: 'nude', mirror: true, beard: true, seat: 'rock', H: 3.0 },
    { f: -0.74, pose: 'seat', drape: 'mantle', beard: true, seat: true, H: 2.7 }, { f: -0.63, pose: 'ease', drape: 'peplos', female: true, mirror: true, H: 2.5, d: -0.05 },
    { f: -0.52, pose: 'seat', drape: 'peplos', female: true, seat: true, H: 2.8 }, { f: -0.42, pose: 'ease', drape: 'mantle', bareLegs: true, beard: true, H: 2.6 },
    { f: -0.33, pose: 'stride', drape: 'chiton', beard: false, mirror: true, cloak: { dir: [1, -0.2, -0.2], len: 0.45 }, H: 2.5 },
    { f: -0.255, kind: 'chariot', mirror: true, H: 1.5, d: -0.25 },
    { f: -0.215, kind: 'horse', pose: 'rear', mirror: true, H: 1.45, d: 0.1, bridle: true }, { f: -0.165, kind: 'horse', pose: 'rear', mirror: true, H: 1.4, d: -0.15, bridle: true },
    { f: -0.11, pose: 'stand', drape: 'peplos', female: true, mirror: true, H: 2.7 },
    { f: -0.045, pose: 'stride', drape: 'peplos', female: true, mirror: true, helmet: true, shield: 'L', spear: 'R', arms: { R: [0.12, 1.0, 0.0], L: [0.2, 0.6, 0.12] }, H: 2.95 },
    { f: 0.0, kind: 'olive', H: 2.8, d: -0.2 },
    { f: 0.055, pose: 'stride', drape: 'nude', beard: true, trident: 'R', tridentDir: [0.18, 1, 0], cloak: { dir: [-1, 0, -0.3], len: 0.55, w: 0.22 }, arms: { R: [0.12, 0.95, 0.0], L: [0.3, 0.7, 0.1] }, H: 3.0 },
    { f: 0.125, pose: 'stand', drape: 'peplos', female: true, H: 2.7 },
    { f: 0.185, kind: 'horse', pose: 'rear', H: 1.45, d: 0.1, bridle: true }, { f: 0.235, kind: 'horse', pose: 'rear', H: 1.4, d: -0.15, bridle: true },
    { f: 0.27, kind: 'chariot', H: 1.5, d: -0.25 },
    { f: 0.34, pose: 'stride', drape: 'peplos', female: true, cloak: { dir: [-1, -0.2, -0.2], len: 0.45 }, H: 2.5 },
    { f: 0.43, pose: 'seat', drape: 'peplos', female: true, seat: true, H: 2.8 }, { f: 0.53, pose: 'seat', drape: 'mantle', beard: true, seat: true, H: 2.6, d: -0.05 },
    { f: 0.63, pose: 'ease', drape: 'peplos', female: true, mirror: true, H: 2.4 },
    { f: 0.77, pose: 'recline', drape: 'mantle', female: true, H: 2.8 },
    { f: 0.91, pose: 'recline', drape: 'nude', beard: true, seat: 'rock', H: 2.6 },
  ],
};

/** A piece list { stone, metal, leaf } placed: scale h, turned yaw, at (x, y, z); the lists of every figure of an element collected in `acc`. */
function put(acc, fig, h, x, y, z, yaw = 0, pre = null) {
  const j = 1 + 0.006 * (hash(x, y, z) - 0.5), m = new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(h * j, h, h * j)).setPosition(x, y, z);
  for (const key of ['stone', 'metal', 'leaf']) {
    if (!fig[key]?.length) continue;
    const g = merge(fig[key]); if (pre) pre(g);
    g.applyMatrix4(m); (acc[key] ??= []).push(g);
  }
}
const flush = (bag, acc, mats = {}) => {
  if (acc.stone?.length) bag.add(mats.stone || 'marble_smooth', merge(acc.stone));
  if (acc.metal?.length) bag.add(mats.metal || 'bronze', merge(acc.metal));
  if (acc.leaf?.length) bag.add(mats.leaf || 'fresco_green', merge(acc.leaf));
};

/**
 * parthenon_pediment: { x (the front face of the tympanum), dir (+1: faces +x), zc, half, y (floor), rise, depth, apex, tz,
 * programme ('east' | 'west'), lod, paint (the blue of the ground) }.
 */
function pediment(el, { bag }) {
  const dir = el.dir, yaw = dir > 0 ? Math.PI / 2 : -Math.PI / 2, toZ = (u) => (dir > 0 ? el.zc - u : el.zc + u), acc = {};
  for (const e of PED[el.programme]) {
    const u = e.f * 0.9 * el.half, top = topOf(e), half = halfOf(e);
    let H = e.H ?? 2.6;
    // as large as the raking cornice allows at its outer side (a recliner: at its middle)
    for (let k = 0; k < 3; k++) {
      const reach = Math.abs(u) + (e.pose === 'recline' ? 0 : half * H * 0.8);
      H = Math.min(e.H ?? 2.6, Math.max(0.2, el.rise * (1 - reach / el.half) - 0.08) / top);
    }
    const fig = build(e, el.lod ?? 0);
    const y = el.y + (e.upper ? -0.5 * H : 0);
    put(acc, fig, H, el.x + dir * (el.depth * 0.5 + (e.d ?? 0)), y, toZ(u), yaw);
  }
  flush(bag, acc);
  if (el.paint) {
    // the tympanum painted blue behind the figures (a thin skin a few millimetres before the stone)
    const x0 = el.x + dir * 0.004, x1 = el.x + dir * 0.014, t = [];
    const A = [el.zc - el.tz, el.y + 0.002], B = [el.zc + el.tz, el.y + 0.002], C = [el.zc, el.apex];
    const P = (x, [z, y]) => [x, y, z], f = (a, b, c) => t.push(...a, ...b, ...c);
    const fa = [P(x1, A), P(x1, B), P(x1, C)], ba = [P(x0, A), P(x0, B), P(x0, C)];
    if (dir > 0) { f(fa[0], fa[2], fa[1]); f(ba[0], ba[1], ba[2]); } else { f(fa[0], fa[1], fa[2]); f(ba[0], ba[2], ba[1]); }
    for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; quad(t, fa[i], ba[i], ba[j], fa[j]); }
    const c = [0, 1, 2].map((k) => (fa[0][k] + fa[1][k] + fa[2][k] + ba[0][k] + ba[1][k] + ba[2][k]) / 6);
    for (let i = 0; i < t.length; i += 9) {
      const a = t.slice(i, i + 3), b = t.slice(i + 3, i + 6), d = t.slice(i + 6, i + 9), u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], m = [(a[0] + b[0] + d[0]) / 3 - c[0], (a[1] + b[1] + d[1]) / 3 - c[1], (a[2] + b[2] + d[2]) / 3 - c[2]];
      if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; }
    }
    bag.add(el.paint, fromTriangles(t));
  }
}

// ── the metopes in high relief ──────────────────────────────────────────────────────────────
// the figures of a metope, in its own frame (u across, from −0.64 to 0.64; the figure's height H in metres; stone only):
// each composition is a pair or a trio, the centaur always the taller mass
const FIGHT = { R: [-0.05, 0.98, 0.0], L: [0.24, 0.78, 0.12] };
const COMP = {
  centauromachy: [
    // a Lapith striking, a centaur rearing against him
    () => [{ s: { pose: 'stride', drape: 'nude', arms: FIGHT, pitch: 8 }, u: -0.3, H: 1.05 }, { s: { kind: 'centaur', pose: 'rear', mirror: true }, u: 0.28, H: 0.6 }],
    // a centaur rearing over a fallen Lapith, a second Lapith's shield behind
    () => [{ s: { pose: 'fallen', drape: 'nude', mirror: true }, u: -0.12, H: 1.0 }, { s: { kind: 'centaur', pose: 'rear', mirror: false, centaur: { beard: true } }, u: -0.18, H: 0.58, d: 0.04 }, { s: { pose: 'stand', drape: 'mantle', mirror: true, arms: { R: [-0.1, 0.8, 0.1], L: [0.2, 0.9, 0.12] } }, u: 0.42, H: 1.05 }],
    // a Lapith seizing a centaur by the hair; the centaur galloping, his rock raised
    () => [{ s: { kind: 'centaur', pose: 'gallop' }, u: -0.12, H: 0.52 }, { s: { pose: 'stride', drape: 'nude', mirror: true, arms: { R: [0.04, 0.95, 0.0], L: [-0.25, 0.8, 0.1] }, shield: 'L', shieldMetal: false }, u: 0.36, H: 1.05 }],
    // a centaur carrying off a woman: the woman's mantle across his arm
    () => [{ s: { kind: 'centaur', pose: 'rear', mirror: true }, u: 0.2, H: 0.6 }, { s: { pose: 'ease', drape: 'peplos', female: true, arms: { R: [-0.12, 0.95, 0.1], L: [0.18, 0.8, 0.14] } }, u: -0.33, H: 1.02 }],
  ],
  gigantomachy: [
    // a god striking a giant who falls
    () => [{ s: { pose: 'stride', drape: 'chiton', arms: FIGHT, helmet: true, shield: 'L' }, u: -0.28, H: 1.06 }, { s: { pose: 'fallen', drape: 'nude', mirror: true }, u: 0.26, H: 1.05 }],
    // Athena with spear and shield against a giant
    () => [{ s: { pose: 'stride', drape: 'peplos', female: true, helmet: true, arms: { R: [-0.05, 0.96, 0.0], L: [0.24, 0.7, 0.14] }, spear: 'R', spearDir: [0.5, 0.6, 0] }, u: -0.28, H: 1.06 }, { s: { pose: 'stride', drape: 'nude', mirror: true, beard: true, arms: { R: [0.08, 0.95, 0.0], L: [-0.2, 0.75, 0.12] } }, u: 0.3, H: 1.05 }],
    // a team: a rearing horse of the god's chariot, the god behind
    () => [{ s: { kind: 'horse', pose: 'rear' }, u: -0.1, H: 0.5 }, { s: { pose: 'stand', drape: 'mantle', mirror: true, beard: true, arms: { R: [-0.1, 0.9, 0.12], L: [0.2, 0.85, 0.12] } }, u: 0.36, H: 1.06 }],
    // two nude fighters
    () => [{ s: { pose: 'stride', drape: 'nude', arms: FIGHT, beard: true }, u: -0.3, H: 1.06 }, { s: { pose: 'stride', drape: 'nude', mirror: true, arms: { R: [0.06, 0.92, 0.0], L: [-0.22, 0.78, 0.1] } }, u: 0.31, H: 1.05 }],
  ],
};
/**
 * parthenon_metopes: { axes, y, face, arch, frieze, tw, bg, band, east: true (all fourteen of the east front), south: [indices] }
 * — the grounds, the bands at the heads, and the figures in high relief (their back halves cut off, their depth stretched
 * to about 0.12 m, so that limbs stand clear of the ground).
 */
function metopes(el, { bag }) {
  const X = el.axes.x, Z = el.axes.z, f = el.face, tw = el.tw, O = [X[0] - f, Z[0] - f, X[X.length - 1] + f, Z[Z.length - 1] + f];
  const yA = el.y + el.arch, yF = yA + el.frieze, s = (el.frieze - 0.12) / 1.23, acc = {};
  const sides = [
    { k: 's', t: trigs(X, O[0], O[2], tw), face: O[3] - 0.05, out: 1, along: 'x', yaw: 0, sub: 'centauromachy', pick: el.south },
    { k: 'e', t: trigs(Z, O[1], O[3], tw), face: O[2] - 0.05, out: 1, along: 'z', yaw: Math.PI / 2, sub: 'gigantomachy', pick: el.east ? 'all' : null },
  ];
  for (const sd of sides) {
    if (!sd.pick) continue;
    for (let i = 0; i + 1 < sd.t.length; i++) {
      if (sd.pick !== 'all' && !sd.pick.includes(i)) continue;
      const a = sd.t[i] + tw / 2, b = sd.t[i + 1] - tw / 2, c = (a + b) / 2, y0 = yA + 0.02, y1 = yF - 0.12;
      const fp = sd.face + sd.out * 0.004, fq = sd.face + sd.out * 0.016;
      const r = (u0, u1, v0, v1) => (sd.along === 'x' ? box(u0, v0, Math.min(fp, fq), u1, v1, Math.max(fp, fq)) : box(Math.min(fp, fq), v0, u0, Math.max(fp, fq), v1, u1));
      if (el.bg) bag.add(el.bg, r(a, b, y0, y1));
      if (el.band) bag.add(el.band, sd.along === 'x' ? box(a, yF - 0.12, Math.min(sd.face, sd.face + sd.out * 0.12), b, yF, Math.max(sd.face, sd.face + sd.out * 0.12)) : box(Math.min(sd.face, sd.face + sd.out * 0.12), yF - 0.12, a, Math.max(sd.face, sd.face + sd.out * 0.12), yF, b));
      const comp = COMP[sd.sub][(i + (sd.along === 'x' ? 0 : 1)) % 4]();
      const sq = reliefSqueeze(1.5, -0.025), out = 0.014 + 0.001 * Math.floor(hash(c, i, 3) * 3);
      for (const it of comp) {
        const fig = build(it.s, 1), H = it.H * s;
        // the figure at (c + u, y0, the ground + its depth): the turn that sets the wall's outward onto the figure's +z
        const um = it.u * s, pos = sd.along === 'x' ? [c + um, y0 + 0.01, sd.face + sd.out * (out + (it.d ?? 0))] : [sd.face + sd.out * (out + (it.d ?? 0)), y0 + 0.01, c + um];
        // (an east metope's u runs along −z: the figure's right is the viewer's right)
        if (sd.along === 'z') pos[2] = c - um;
        put(acc, fig, H, pos[0], pos[1], pos[2], sd.yaw, sq);
      }
    }
  }
  flush(bag, acc);
}
function trigs(axes, lo, hi, tw) {
  const out = [];
  for (let i = 0; i < axes.length; i++) { out.push(i === 0 ? lo + tw / 2 : i === axes.length - 1 ? hi - tw / 2 : axes[i]); if (i < axes.length - 1) out.push((axes[i] + axes[i + 1]) / 2); }
  return out;
}

// ── the east frieze in low relief ───────────────────────────────────────────────────────────
// from each corner toward the door: maidens, marshals, the seated gods; at the middle the priest and the child with the folded peplos
const EAST = (half) => {
  const out = [];
  const gods = [{ pose: 'seat', drape: 'mantle', beard: true, seat: { w: 0.15 } }, { pose: 'seat', drape: 'peplos', female: true, seat: { w: 0.15 } }, { pose: 'seat', drape: 'mantle', seat: { w: 0.15 } }, { pose: 'seat', drape: 'peplos', female: true, seat: { w: 0.15 } }];
  let u = 0.55;
  for (let i = 0; i < 4; i++, u += 0.8) out.push({ s: { pose: i % 2 ? 'ease' : 'stand', drape: 'peplos', female: true, arms: i % 2 ? { R: [-0.14, 0.62, 0.12], L: [0.18, 0.6, 0.12] } : { R: [-0.1, 0.5, 0.14], L: [0.16, 0.66, 0.1] } }, u, H: 0.86 });
  for (let i = 0; i < 2; i++, u += 0.85) out.push({ s: { pose: 'ease', drape: 'mantle', bareLegs: true, beard: i === 0, arms: { R: [-0.1, 0.9, 0.1], L: [0.12, 0.5, 0.1] } }, u, H: 0.92 });
  for (let i = 0; i < 4; i++, u += 1.0) out.push({ s: gods[i], u, H: 0.9 });
  return out;
};
/** parthenon_east_frieze: { x (the plane of the east face), zc, half (the run from the middle to each corner), y0, h, bg } */
function eastFrieze(el, { bag }) {
  const acc = {}, sq = reliefSqueeze(0.55, 0), k = el.h / 1.0, gth = 0.012;
  if (el.bg) bag.add(el.bg, orientedBox([el.x + 0.004 + gth / 2, el.zc - el.half], [el.x + 0.004 + gth / 2, el.zc + el.half], gth, el.y0, el.y0 + el.h));
  const ground = el.x + 0.004 + gth, run = EAST(el.half);
  const yawOf = (toward) => toward * 1.15;                              // three-quarters toward the door
  for (const side of [1, -1]) {                                         // +1: the south half (z > zc) moving north (toward −z)
    for (const it of run) {
      const z = el.zc + side * (el.half - 0.4 - it.u * 1.08);
      const fig = build({ ...it.s, lod: 1 }, 1), yawFig = side > 0 ? 1.15 : -1.15;
      const rot = new Matrix4().makeRotationY(yawFig);
      put(acc, fig, it.H * k, ground + 0.001, el.y0 + 0.02 * k + (it.s.pose === 'seat' ? 0 : 0), z, Math.PI / 2, (g) => { g.applyMatrix4(rot); sq(g); });
    }
  }
  // the middle: a man and a child before the folded cloth
  for (const [dz, yawFig, H, s] of [[-0.55, -1.15, 0.92, { pose: 'stand', drape: 'mantle', bareLegs: true, beard: true, arms: { R: [-0.14, 0.7, 0.14], L: [0.1, 0.75, 0.16] } }], [0.55, 1.15, 0.66, { pose: 'stand', drape: 'chiton', arms: { R: [-0.16, 0.75, 0.12], L: [0.1, 0.72, 0.14] } }]]) {
    const rot = new Matrix4().makeRotationY(-yawFig);
    put(acc, build({ ...s, lod: 1 }, 1), H * k, ground + 0.001, el.y0 + 0.02 * k, el.zc + dz, Math.PI / 2, (g) => { g.applyMatrix4(rot); sq(g); });
  }
  flush(bag, acc);
}

STYLES.greek.elements.parthenon_pediment = pediment;
STYLES.greek.elements.parthenon_metopes = metopes;
STYLES.greek.elements.parthenon_east_frieze = eastFrieze;
export { pediment, metopes, eastFrieze };
