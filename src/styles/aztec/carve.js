// Modelled sculpture of the Mexica precinct (docs/settlements/tenochtitlan.md §19): rounded volumes (tubes along a spine, ellipsoids)
// from the Petra sculptor's kit (src/styles/nabataean/sculpt.js, read-only), gathered per material into one geometry each and set in
// place by a turn and a scale. Everything is a function of its inputs and of `hash3` of a piece's own place: the same plan builds the
// same geometry every time (no counters, no shared random numbers).
//
// A carving is built in its own frame: x across (to the viewer's right), y up, z forward (out of the wall, the way the figure faces).

import { Sculpt, blob, blobDir, tube, rodT, torus, ellipsoid, hash3, norm, sub, add, mul, cross } from '../nabataean/sculpt.js';

export { Sculpt, blob, blobDir, tube, rodT, torus, ellipsoid, hash3, norm, sub, add, mul, cross };

/** A carving's pieces by material, placed at (x, y, z) turned by yaw (so that its +z faces (sin yaw, cos yaw)) and scaled by s. */
export class Carver {
  constructor({ at = [0, 0, 0], yaw = 0, s = 1 } = {}) {
    const c = Math.cos(yaw), n = Math.sin(yaw);
    this.xf = ([x, y, z]) => [at[0] + (x * c + z * n) * s, at[1] + y * s, at[2] + (-x * n + z * c) * s];
    this.by = new Map();
  }
  /** The Sculpt of a material (one geometry in the end). */
  S(mat) { let q = this.by.get(mat); if (!q) this.by.set(mat, (q = new Sculpt(this.xf))); return q; }
  get tris() { let n = 0; for (const q of this.by.values()) n += q.triangles; return n; }
  emit(bag) { for (const [mat, q] of this.by) if (q.pos.length) bag.add(mat, q.geometry()); }
}

/** A cone from a to b (radii ra → rb), the section round. */
export const cone = (S, a, b, ra, rb = 0.003, seg = 6) => tube(S, [[a[0], a[1], a[2], ra], [b[0], b[1], b[2], rb]], { seg, sub: 1, capN: 1, cap: [1, 1] });

/**
 * The serpent's head at the foot of a stair's balustrade (docs/settlements/tenochtitlan.md §19: Wikipedia, ancient-history-sites: the stairways'
 * balustrades ended in serpent heads; Tlaloc's goggled, Huitzilopochtli's feathered): the skull with its brow and the snout turned up,
 * the lower jaw lying open on the ground, the red mouth, the forked tongue over the lip, the long fangs and the rows of teeth, the eyes
 * under their brows (Tlaloc's in rings of blue), an ear spool, a row of scale-bosses along the head, the crest of feathers; the neck
 * runs back into the balustrade. Faces +z, about 2.5 m long and 1.6 m wide at s = 1; `lod` 0 full, 1 reduced.
 */
export function serpentHead(C, { tl = false, lod = 0, stone = 'plaster_white', mouth = 'stucco_red', seed = 0 } = {}) {
  const P = C.S(stone), M = C.S(mouth), T = C.S('ivory'), K = C.S('paint_minoan_black'), F = lod ? 7 : 12, sb = lod ? 1 : 2;
  const j = (a, b) => 1 + 0.04 * (hash3(seed, a, b) - 0.5);                     // the slight difference of one head from another
  // the neck, running back into the balustrade
  tube(P, [[0, 0.62, -1.5, 0.8, 0.62], [0, 0.72, -0.9, 0.82, 0.6], [0, 0.88, -0.35, 0.8, 0.5]], { seg: F, sub: sb, cap: [0, 0], ref: [1, 0, 0] });
  // the upper jaw and skull: broad at the cheeks, narrowing to the snout, which turns up at its end
  tube(P, [[0, 1.0, -0.5, 0.78, 0.44], [0, 1.0, 0.2, 0.72, 0.42], [0, 0.93, 0.9, 0.58, 0.32], [0, 0.93, 1.5, 0.44, 0.24], [0, 1.08, 1.95, 0.34, 0.22]],
    { seg: F, sub: sb, cap: [0, 1], ref: [1, 0, 0], fold: (t, th) => 1 + 0.13 * Math.exp(-(((th - 1.2) / 0.4) ** 2)) * (t > 0.1 && t < 0.6 ? 1 : 0.3) + 0.13 * Math.exp(-(((th - Math.PI + 1.2) / 0.4) ** 2)) * (t > 0.1 && t < 0.6 ? 1 : 0.3) });
  // the lower jaw, lying on the ground, open
  tube(P, [[0, 0.2, -0.3, 0.66, 0.2], [0, 0.2, 0.6, 0.56, 0.17], [0, 0.24, 1.35, 0.34, 0.13], [0, 0.33, 1.75, 0.2, 0.1]], { seg: F, sub: sb, cap: [0, 1], ref: [1, 0, 0] });
  // the red of the mouth between the jaws: the palate above, the floor, the tongue forked over the lip
  ellipsoid(M, [0, 0.62, 0.55], [0.5, 0, 0], [0, 0.1, 0], [0, 0, 0.85], 3, 8);
  ellipsoid(M, [0, 0.4, 0.6], [0.46, 0, 0], [0, 0.06, 0], [0, 0, 0.85], 3, 8);
  tube(M, [[0, 0.42, 0.3, 0.17, 0.05], [0, 0.4, 1.1, 0.15, 0.045], [0, 0.34, 1.7, 0.12, 0.04]], { seg: 6, sub: 1, cap: [0, 0], ref: [1, 0, 0] });
  for (const s of [-1, 1]) tube(M, [[s * 0.06, 0.36, 1.65, 0.07, 0.035], [s * 0.22, 0.3, 2.0, 0.06, 0.03], [s * 0.4, 0.26, 2.3, 0.05, 0.025]], { seg: 5, sub: 1, cap: [1, 1], ref: [0, 1, 0] });
  // the fangs and the rows of teeth
  for (const s of [-1, 1]) {
    cone(T, [s * 0.33, 0.78, 1.15], [s * 0.3, 0.2, 1.18], 0.085 * j(s, 1), 0.01, lod ? 5 : 7);
    cone(T, [s * 0.2, 0.34, 1.35], [s * 0.2, 0.62, 1.37], 0.045, 0.008, 5);
    if (!lod) for (let i = 0; i < 6; i++) {
      const z = 0.2 + i * 0.22, w = 0.56 - 0.03 * i;
      cone(T, [s * w, 0.74, z], [s * (w - 0.01), 0.56, z + 0.02], 0.04 * j(i, s), 0.006, 5);
      if (i > 0 && i < 5) cone(T, [s * (w - 0.04), 0.3, z + 0.1], [s * (w - 0.05), 0.46, z + 0.1], 0.03 * j(i, 2 + s), 0.006, 5);
    }
  }
  // the eyes: the ball under a heavy brow, the pupil; Tlaloc's ringed in blue (the goggles)
  for (const s of [-1, 1]) {
    const e = [s * 0.66, 1.2, 0.52];
    blob(T, e, [0.17, 0.18, 0.18], lod ? 3 : 4, lod ? 6 : 8);
    blob(K, [s * 0.81, 1.2, 0.56], [0.05, 0.09, 0.09], 3, 6);
    tube(P, [[s * 0.3, 1.3, 0.1, 0.07, 0.06], [s * 0.55, 1.38, 0.52, 0.09, 0.08], [s * 0.66, 1.28, 0.95, 0.07, 0.06]], { seg: 6, sub: 1, cap: [1, 1], ref: [0, 1, 0] });
    if (tl) torus(C.S('maya_blue'), [s * 0.7, 1.2, 0.52], [0, 0, 1], [0, 1, 0], 0.3, 0.06, { seg: lod ? 10 : 16, sec: 5 });
    blob(P, [s * 0.52, 0.8, -0.35], [0.06, 0.2, 0.2], 3, 7);                                              // the ear spool
    blob(C.S('stucco_red'), [s * 0.585, 0.8, -0.35], [0.03, 0.12, 0.12], 3, 7);
    blob(P, [s * 0.15, 1.1, 1.78], [0.09, 0.07, 0.1], 3, 6);                                                // the nostrils on the snout
    blob(K, [s * 0.15, 1.13, 1.84], [0.04, 0.03, 0.04], 2, 5);
  }
  // the bosses along the head and neck: the serpent's scales
  const nb = lod ? 4 : 7;
  for (let i = 0; i < nb; i++) { const z = -1.1 + i * (lod ? 0.65 : 0.38), y = 1.06 + 0.02 * Math.sin(i); blob(P, [0, y + (z > 0.3 ? -0.05 : 0.0), z], [0.14 * j(i, 3), 0.07, 0.15], 2, 6); }
  // the crest of feathers behind the head (the feathered serpent's)
  if (!tl) {
    const G = C.S('stucco_leaf'), Gb = C.S('maya_blue');
    for (let r = 0; r < (lod ? 5 : 9); r++) {
      const a = (r / (lod ? 4 : 8) - 0.5) * 2, x = a * 0.62, h = 0.95 + 0.25 * (1 - Math.abs(a)), up = 0.78 + 0.1 * j(r, 5);
      const root = [x, 1.28, -0.55];
      for (const [S, q, len] of [[G, 1, h], [Gb, 0.55, h * 0.62]]) {
        const d = norm([a * 0.5, up * q + 0.2, -0.75 - 0.3 * q]);
        blobDir(S, add(root, mul(d, len * 0.5)), d, len * 0.5, 0.11 * q + 0.05, 0.035, [1, 0, 0], 3, 6);
      }
    }
  } else {
    // Tlaloc's: the upper lip curled over the fangs, a moustache of scales, the plain brow band
    for (const s of [-1, 1]) tube(C.S('stucco_pale'), [[s * 0.1, 0.88, 1.5, 0.08, 0.06], [s * 0.4, 0.86, 1.2, 0.09, 0.07], [s * 0.62, 0.86, 0.7, 0.08, 0.06]], { seg: 6, sub: 1, cap: [1, 1], ref: [0, 1, 0] });
  }
}

// ---- a body from the Parthenon's skeleton kit (read-only), set into a carving's frame ---------------------------------------------------
import { bodyOf } from '../../buildings/parthenon/bodies.js';

/** Lay the geometries `list` (indexed or not) into material `mat` of C, each point first moved by pre([x, y, z]) in the carving's frame. */
export function addGeos(C, mat, list, pre = (p) => p) {
  const S = C.S(mat), V = (p) => C.xf(pre(p));
  for (const g0 of list) {
    const g = g0.index ? g0.toNonIndexed() : g0, P = g.attributes.position.array, N = g.attributes.normal.array;
    for (let i = 0; i < P.length; i += 3) {
      const p = [P[i], P[i + 1], P[i + 2]], q = V(p), n = sub(V([p[0] + N[i] * 0.01, p[1] + N[i + 1] * 0.01, p[2] + N[i + 2] * 0.01]), q), u = norm(n);
      S.pos.push(q[0], q[1], q[2]); S.nor.push(u[0], u[1], u[2]);
    }
  }
}
/** A surface of revolution (about y) from the profile [[r, y], …]: n sides. */
export function turn(S, prof, n = 10, cx = 0, cz = 0) {
  const rows = prof.map(([r, y]) => { const row = []; for (let j = 0; j < n; j++) { const a = j / n * Math.PI * 2; row.push([cx + Math.cos(a) * Math.max(r, 0.002), y, cz + Math.sin(a) * Math.max(r, 0.002)]); } return row; });
  S.grid(rows);
}

/**
 * The chacmool of Tlaloc's shrine (World History Encyclopedia: a chacmool from the shrine): the figure reclining on its back, the
 * knees drawn up and the feet on the ground, the head turned to look out, the hands holding the dish (cuauhxicalli) on the belly;
 * the loincloth, sash, headband, ear spools and collar painted. Built from the skeleton kit rotated onto its back; the head looks
 * toward +x, the feet lie toward +z; about 1.5 m long at s = 1.5 (units of a standing height of 1).
 */
export function chacmool(C, { stone = 'stucco', seed = 0 } = {}) {
  const J0 = { pose: 'seat', drape: 'nude', lod: 0, look: 90, hair: 'cap', J: { pelvis: [0, 0.3, 0], chest: [0, 0.46, 0.0], neck: [0, 0.6, 0.0], head: [0, 0.7, 0.03], shR: [-0.118, 0.575, -0.01], shL: [0.118, 0.575, -0.01], anR: [-0.09, 0.0, -0.05], anL: [0.09, 0.0, -0.05], wrR: [-0.06, 0.42, 0.115], wrL: [0.06, 0.42, 0.115] }, armBendR: [-1, -0.2, -0.3], armBendL: [1, -0.2, -0.3], legBend: [0, 0, 1] };
  const f = bodyOf(J0), rot = ([x, y, z]) => [x, z + 0.09, -(y - 0.3)];
  addGeos(C, stone, f.stone, rot);
  // the base: a low slab it lies on
  const B = C.S('stucco_pale');
  tube(B, [[0, 0.025, -0.5, 0.3, 0.025], [0, 0.025, 0.55, 0.3, 0.025]], { seg: 4, sub: 1, cap: [0, 0], ref: [1, 0, 0], fold: (t, th) => (Math.abs(Math.cos(th)) ** 6 + Math.abs(Math.sin(th)) ** 6) ** (-1 / 6) });
  // the dish held on the belly: a shallow bowl with a rim, painted blue inside
  const D = C.S('stucco_pale'), Di = C.S('maya_blue');
  turn(D, [[0.002, 0.2], [0.07, 0.205], [0.125, 0.235], [0.14, 0.27], [0.12, 0.27], [0.1, 0.235], [0.002, 0.225]], 14, 0, -0.07);
  turn(Di, [[0.002, 0.226], [0.098, 0.236], [0.112, 0.262], [0.002, 0.252]], 12, 0, -0.07);
  // the loincloth and sash in red, the headband and the ear spools in blue, the collar
  const R = C.S('stucco_red'), Bl = C.S('maya_blue');
  tube(R, [[-0.1, 0.13, 0.0, 0.03, 0.07], [0, 0.145, 0.0, 0.04, 0.075], [0.1, 0.13, 0.0, 0.03, 0.07]], { seg: 8, sub: 1, cap: [1, 1], ref: [0, 0, 1], fold: (t, th) => 1 });
  tube(R, [[-0.12, 0.17, -0.03, 0.085, 0.02], [0.0, 0.18, -0.03, 0.095, 0.02], [0.12, 0.17, -0.03, 0.085, 0.02]], { seg: 8, sub: 1, cap: [1, 1], ref: [0, 1, 0] });
  const H = rot([0, 0.7, 0.03]);
  torus(Bl, [H[0], H[1] - 0.0, H[2]], [0, 1, 0], [1, 0, 0], 0.062, 0.012, { seg: 14, sec: 5 });
  for (const s of [-1, 1]) torus(Bl, [rot([0, 0.7, 0.03])[0], H[1], H[2] + s * 0.06], [1, 0, 0], [0, 1, 0], 0.03, 0.012, { seg: 10, sec: 5 });
  torus(Bl, [0, 0.11, -0.2], [1, 0, 0], [0, 0, 1], 0.085, 0.014, { seg: 14, sec: 5 });
  C.seed = seed;
}

// ---- the Coyolxauhqui stone: a continuous relief surface --------------------------------------------------------------------------------
/**
 * The Coyolxauhqui stone (about 3.4 m across; excavated 1978) as true low relief [stated: the composition, World History Encyclopedia;
 * Wikipedia, Coyolxauhqui; inferred: the placing of each piece]: the disc of stone, on it one continuous surface rising 2–9 cm from the
 * ground, made of rounded forms (the head with its headdress of feather balls, the bell on the cheek and the ear spool; the torso with its
 * serpent belt and the skull at the waist; the limbs severed at the elbows and knees, a skull on each joint, the hands and sandalled
 * feet; the serpents that bind the pieces; the raised rim with its knots) with the details (eyes, bell, belt, skulls) standing on them or
 * cut into them. A grid of height samples, its normals from the height's own gradient; the triangles go to the paint of their top form.
 * `cell`: the grid's size (m). The disc's top is y = 0.3; the carving's frame has x east, z south as the old disc's.
 */
const FORMS = (() => {
  const P = 'stucco_pale', O = 'paint_ochre', K = 'paint_minoan_black', f = [], d = [];
  const L = (a, b, r, h, m = P) => f.push({ a, b, r, h, m }), D = (a, b, r, h, m = O) => d.push({ a, b, r, h, m });
  L([-0.12, -0.2], [0.22, 0.32], 0.3, 0.07);                                   // the torso
  L([-0.5, -0.62], [-0.5, -0.62], 0.3, 0.09);                                  // the head
  for (let i = 0; i < 7; i++) { const a = -2.9 + i * 0.32; L([-0.5 + Math.cos(a) * 0.76, -0.62 + Math.sin(a) * 0.76], [-0.5 + Math.cos(a) * 0.76, -0.62 + Math.sin(a) * 0.76], 0.085, 0.085, i % 2 ? P : O); }
  const limb = (pts, w, foot) => { for (let i = 0; i < pts.length - 1; i++) L(pts[i], pts[i + 1], w * (1 - 0.1 * i), 0.07); for (const q of [pts[1]]) { L(q, q, w * 1.2, 0.085); D(q, q, w * 0.7, 0.024, P); D([q[0] - 0.03, q[1]], [q[0] - 0.03, q[1]], 0.02, -0.012, K); D([q[0] + 0.03, q[1]], [q[0] + 0.03, q[1]], 0.02, -0.012, K); }
    const e = pts[2]; L(e, e, w * (foot ? 1.25 : 1.0), foot ? 0.06 : 0.075); if (foot) for (const k of [-1, 0, 1]) D([e[0] + k * 0.05, e[1] - 0.05], [e[0] + k * 0.05, e[1] - 0.12], 0.018, 0.02, P); else for (const k of [-1, 0, 1]) D([e[0] + 0.08, e[1] + k * 0.045], [e[0] + 0.17, e[1] + k * 0.05], 0.017, 0.02, P); };
  limb([[0.5, -0.45], [0.8, -0.28], [1.1, -0.4]], 0.12, false); limb([[-0.5, 0.05], [-0.85, 0.3], [-1.1, 0.1]], 0.12, false);
  limb([[0.4, 0.55], [0.75, 0.8], [1.15, 0.78]], 0.15, true); limb([[-0.35, 0.5], [-0.7, 0.85], [-0.95, 1.1]], 0.15, true);
  for (const [a, b] of [[[0.2, -0.85], [0.75, -0.85]], [[-0.2, 1.05], [0.3, 1.0]], [[0.9, 0.1], [1.05, 0.4]]]) for (let i = 0; i < 5; i++) { const t = i / 5, t2 = (i + 1) / 5, w = 0.04 * Math.sin(i * 1.9); L([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + w], [a[0] + (b[0] - a[0]) * t2, a[1] + (b[1] - a[1]) * t2 - w], 0.048, 0.05, i % 2 ? P : O); }
  f.push({ ring: [1.58, 1.72], h: 0.04, m: P }); f.push({ ring: [1.38, 1.46], h: 0.03, m: P });
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, q = [Math.cos(a) * 1.52, Math.sin(a) * 1.52]; L(q, q, 0.07, 0.07, O); }
  // the details
  D([-0.58, -0.64], [-0.58, -0.64], 0.04, -0.012, K); D([-0.42, -0.62], [-0.42, -0.62], 0.04, -0.012, K); D([-0.56, -0.5], [-0.44, -0.5], 0.015, -0.008, K);   // the eyes, the mouth
  D([-0.36, -0.46], [-0.36, -0.46], 0.08, 0.03); D([-0.78, -0.62], [-0.78, -0.62], 0.1, 0.035); D([-0.5, -0.88], [-0.5, -0.88], 0.05, 0.03);                // the bell, the ear spool
  D([-0.02, 0.0], [0.34, 0.1], 0.07, 0.03); D([0.22, 0.12], [0.22, 0.12], 0.17, 0.03, P); D([0.14, 0.1], [0.14, 0.1], 0.03, -0.012, K); D([0.3, 0.1], [0.3, 0.1], 0.03, -0.012, K);   // the belt, the skull buckle
  for (const s of [-1, 1]) D([0.0 + s * 0.14, -0.05], [0.0 + s * 0.14, -0.05], 0.1, 0.03, P);     // the breasts
  return { f, d };
})();
const dseg = (x, z, a, b) => { const vx = b[0] - a[0], vz = b[1] - a[1], l = vx * vx + vz * vz, t = l ? Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / l)) : 0, dx = x - a[0] - vx * t, dz = z - a[1] - vz * t; return Math.hypot(dx, dz); };
const bump = (q, x, z) => { if (q.ring) { const r = Math.hypot(x, z), [r0, r1] = q.ring; if (r <= r0 || r >= r1) return 0; const u = (r - r0) / (r1 - r0) * 2 - 1; return q.h * Math.pow(1 - u * u, 0.5); } const d = dseg(x, z, q.a, q.b) / q.r; return d >= 1 ? 0 : q.h * Math.pow(1 - d * d, 0.5) * Math.sign(q.h || 1) ; };
function field(x, z) {
  let h = 0, m = null;
  for (const q of FORMS.f) { const v = bump(q, x, z); if (v > h) { h = v; m = q.m; } }
  let dm = null, dv = 0;
  for (const q of FORMS.d) { const v = bump(q, x, z); if (v && (h > 0 || v > 0) && Math.abs(v) > Math.abs(dv)) { dv = v; dm = q.m; } }
  if (dv) { h = Math.max(0, h + dv); m = dm; if (!h) m = null; if (dv < 0 && h > 0.001) m = dm; }
  return { h, m };
}
export function coyolxauhqui(C, { cell = 0.03 } = {}) {
  turn(C.S('andesite'), [[0.002, 0], [1.72, 0], [1.72, 0.3], [0.002, 0.3]], 40);
  const R = 1.74, n = Math.round(2 * R / cell), c0 = -R, Hs = [], Ms = [];
  for (let i = 0; i <= n; i++) { Hs.push(new Float32Array(n + 1)); for (let j = 0; j <= n; j++) { const x = c0 + i * cell, z = c0 + j * cell; Hs[i][j] = Math.hypot(x, z) < 1.72 ? field(x, z).h : 0; } }
  const hv = (i, j) => Hs[Math.max(0, Math.min(n, i))][Math.max(0, Math.min(n, j))];
  const nrm = (i, j) => norm([-(hv(i + 1, j) - hv(i - 1, j)) / (2 * cell), 1, -(hv(i, j + 1) - hv(i, j - 1)) / (2 * cell)]);
  const vtx = (S, i, j) => { const p = C.xf([c0 + i * cell, 0.3 + Hs[i][j] + 0.0005, c0 + j * cell]), q = C.xf([c0 + i * cell + nrm(i, j)[0], 0.3 + Hs[i][j] + nrm(i, j)[1], c0 + j * cell + nrm(i, j)[2]]), u = norm(sub(q, p)); S.pos.push(p[0], p[1], p[2]); S.nor.push(u[0], u[1], u[2]); };
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (!(Hs[i][j] > 1e-4 || Hs[i + 1][j] > 1e-4 || Hs[i][j + 1] > 1e-4 || Hs[i + 1][j + 1] > 1e-4)) continue;
    const x = c0 + (i + 0.5) * cell, z = c0 + (j + 0.5) * cell, hm = Math.max(Hs[i][j], Hs[i + 1][j], Hs[i][j + 1], Hs[i + 1][j + 1]), m = hm < 0.006 ? 'andesite' : (field(x, z).m ?? 'stucco_pale'), S = C.S(m);
    // triangles wound to face up (+y) in the carving's frame: (i, j) → (i, j + 1) → (i + 1, j) has its normal toward +y
    for (const [a, b, c] of [[[i, j], [i, j + 1], [i + 1, j]], [[i + 1, j], [i, j + 1], [i + 1, j + 1]]]) { vtx(S, ...a); vtx(S, ...b); vtx(S, ...c); }
  }
}

// ---- the standard-bearer -----------------------------------------------------------------------------------------------------------------
/**
 * A seated standard-bearer of stone (World History Encyclopedia / ancient-history-sites: seated male figures at the stairway entrances
 * held standards and banners of bark paper), facing +z: the skeleton kit's seated man with his legs crossed, the fists closed round the
 * pole before his chest, the loincloth and its knot, the headband, ear spools and collar painted; the pole with its crossbar and the
 * banner of amate paper hanging in folds, striped in the god's paint. About 1.1 m seated at s = 1.5 (units: a standing height of 1).
 */
export function bearer(C, { paint = 'maya_blue', stone = 'stucco_pale', seed = 0 } = {}) {
  const f = bodyOf({ pose: 'seat', drape: 'nude', lod: 0, hair: 'cap', J: { anR: [0.1, 0.03, 0.17], anL: [-0.1, 0.03, 0.17], wrR: [-0.05, 0.45, 0.17], wrL: [0.05, 0.45, 0.17] }, legBendR: [-1, -0.1, 0.1], legBendL: [1, -0.1, 0.1], armBendR: [-0.3, -1, 0.1], armBendL: [0.3, -1, 0.1] });
  addGeos(C, stone, f.stone);
  const R = C.S('stucco_red'), Bl = C.S(paint), T = C.S('timber'), Pp = C.S('cloth_white'), K = C.S('paint_minoan_black');
  // the block he sits on
  tube(C.S('andesite'), [[0, 0, -0.04, 0.26, 0.2], [0, 0.26, -0.04, 0.26, 0.2]], { seg: 4, sub: 1, cap: [0, 1], ref: [1, 0, 0], fold: (t, th) => (Math.abs(Math.cos(th)) ** 5 + Math.abs(Math.sin(th)) ** 5) ** (-1 / 5) });
  // the loincloth's knot and apron, the headband, the ear spools, the collar
  blob(R, [0, 0.33, 0.11], [0.05, 0.04, 0.04], 3, 6);
  tube(R, [[0, 0.32, 0.1, 0.035, 0.012], [0, 0.2, 0.12, 0.05, 0.012], [0, 0.11, 0.13, 0.06, 0.012]], { seg: 6, sub: 1, cap: [1, 1], ref: [1, 0, 0] });
  torus(Bl, [0, 0.69, -0.02], [1, 0, 0], [0, 0, 1], 0.062, 0.011, { seg: 14, sec: 5 });
  for (const s of [-1, 1]) torus(Bl, [s * 0.055, 0.665, -0.02], [0, 1, 0], [0, 0, 1], 0.026, 0.011, { seg: 10, sec: 5 });
  torus(Bl, [0, 0.55, 0.0], [1, 0, 0], [0, 0, 1], 0.1, 0.014, { seg: 14, sec: 5 });
  // the pole in his fists, with its crossbar and the banner
  const px = 0, pz = 0.17;
  tube(T, [[px, 0.12, pz, 0.014, 0.014], [px, 1.5, pz, 0.012, 0.012]], { seg: 6, sub: 1, cap: [1, 1] });
  tube(T, [[-0.3, 1.38, pz, 0.01, 0.01], [0.3, 1.38, pz, 0.01, 0.01]], { seg: 5, sub: 1, cap: [1, 1] });
  const hw = 0.27, top = 1.36, bot = 0.82, ph = 0.4 * (hash3(seed, 1, 2) - 0.5);
  const sh = (m, u0, u1, o = 0) => { const S = C.S(m); const rows = []; for (let i = 0; i <= 6; i++) { const y = top - (top - bot) * i / 6, row = []; for (let j = 0; j <= 8; j++) { const u = u0 + (u1 - u0) * j / 8, x = -hw + 2 * hw * u; row.push([x, y, pz + 0.025 + 0.018 * Math.sin(u * 7 + i * 0.4 + ph) * (0.4 + i / 6) + 0.012 * (i / 6) + o]); } rows.push(row); } S.grid(rows, { wrap: false, face: [0, 0, 1] }); };
  sh('cloth_white', 0, 1); sh(paint, 0.05, 0.2, 0.008); sh(paint, 0.4, 0.55, 0.008); sh(paint, 0.75, 0.9, 0.008);
  const e = (m, u0, u1, y0, y1) => { const S = C.S(m), rows = []; for (let i = 0; i <= 2; i++) { const y = y0 + (y1 - y0) * i / 2, row = []; for (let j = 0; j <= 8; j++) { const u = u0 + (u1 - u0) * j / 8; row.push([-hw + 2 * hw * u, y, pz + 0.032]); } rows.push(row); } S.grid(rows, { wrap: false, face: [0, 0, 1] }); };
  void e; void K; void Pp;
}

// ---- the eagle's head at the foot of the House of the Eagles' stairs ---------------------------------------------------------------------
/**
 * An eagle's head carved in stone (mesoweb, House of Eagles; cookjmex: eagle heads flank the broad staircase): the neck rising from a
 * block, the head with its brow ridge over a round eye, the great hooked beak with its nostril and the beak's edge, the feathers in
 * overlapping rows on the neck and crown, the tuft behind. Faces +z; about 0.8 m high at s = 1; lod 1 drops the finest.
 */
export function eagleHead(C, { stone = 'plaster_white', lod = 0, seed = 0 } = {}) {
  const P = C.S(stone), Y = C.S('paint_ochre'), K = C.S('paint_minoan_black'), R = C.S('stucco_red'), F = lod ? 7 : 11, j = (a) => 1 + 0.05 * (hash3(seed, a, 4) - 0.5);
  tube(P, [[0, 0, -0.1, 0.36, 0.36], [0, 0.35, -0.1, 0.33, 0.3], [0, 0.62, 0.02, 0.27, 0.25]], { seg: F, sub: 1, cap: [0, 0], ref: [1, 0, 0], fold: (t, th) => (Math.abs(Math.cos(th)) ** 4 + Math.abs(Math.sin(th)) ** 4) ** (-1 / 4) });
  blob(P, [0, 0.8, 0.08], [0.26, 0.24, 0.3], lod ? 3 : 5, F);                                                      // the head
  tube(Y, [[0, 0.78, 0.3, 0.07, 0.1], [0, 0.74, 0.5, 0.075, 0.11], [0, 0.62, 0.66, 0.06, 0.1], [0, 0.5, 0.7, 0.03, 0.05]], { seg: 8, sub: 1, cap: [0, 1], ref: [1, 0, 0] });     // the hooked beak
  tube(Y, [[0, 0.68, 0.3, 0.07, 0.03], [0, 0.66, 0.5, 0.06, 0.03], [0, 0.6, 0.6, 0.04, 0.025]], { seg: 6, sub: 1, cap: [0, 1], ref: [1, 0, 0] });                                 // the lower beak
  blob(R, [0, 0.69, 0.5], [0.05, 0.015, 0.14], 2, 6);                                                              // the mouth
  for (const s of [-1, 1]) {
    blob(K, [s * 0.07, 0.8, 0.52], [0.012, 0.018, 0.02], 2, 5);                                                      // the nostril
    blob(Y, [s * 0.22, 0.83, 0.2], [0.05, 0.06, 0.06], 3, 6);                                                          // the eye
    blob(K, [s * 0.265, 0.83, 0.21], [0.02, 0.03, 0.03], 2, 5);
    tube(P, [[s * 0.1, 0.93, 0.34, 0.03, 0.03], [s * 0.22, 0.94, 0.22, 0.035, 0.035], [s * 0.27, 0.9, 0.04, 0.03, 0.03]], { seg: 5, sub: 1, cap: [1, 1], ref: [0, 1, 0] });   // the brow ridge
  }
  const rows = lod ? 2 : 4;
  for (let r = 0; r < rows; r++) for (let i = 0; i < (lod ? 5 : 7); i++) {                                       // the feathers, overlapping rows down the neck
    const a = (i / ((lod ? 5 : 7) - 1) - 0.5) * 2.2, y = 0.62 - r * 0.15, rad = 0.3 - r * 0.0;
    blobDir(P, [Math.sin(a) * rad, y, Math.cos(a) * rad * 0.8 - 0.1], [Math.sin(a) * 0.5, -0.9, Math.cos(a) * 0.4], 0.14 * j(r * 7 + i), 0.065, 0.03, [0, 0, 1], 3, 6);
  }
  for (let i = 0; i < 3; i++) blobDir(P, [(i - 1) * 0.1, 1.0, -0.12], [(i - 1) * 0.3, 0.6, -0.8], 0.17, 0.05, 0.025, [1, 0, 0], 3, 6);   // the tuft
}

// ---- a skull ----------------------------------------------------------------------------------------------------------------------------
/**
 * A skull as the tzompantli's (INAH: skulls bound with lime): the cranium, the brow, the cheekbones, the nasal opening, the sockets of the
 * eyes, the upper teeth and the jaw; faces +z, 0.19 m long. Each differs a hair by `seed` (a hash of its own place). `lod` 0 full (about
 * 190 triangles), 1 reduced.
 */
export function skull(C, { seed = 0, lod = 0 } = {}) {
  const I = C.S('ivory'), K = C.S('paint_minoan_black'), v = (a) => 1 + 0.07 * (hash3(seed, a, 9) - 0.5), n = lod ? 5 : 6;
  blob(I, [0, 0.02, -0.015], [0.078 * v(1), 0.085 * v(2), 0.1 * v(3)], n - 1, n + 2);                              // the cranium
  blob(I, [0, -0.04, 0.055], [0.06, 0.055, 0.05], 3, n + 1);                                                    // the face
  tube(I, [[-0.05, -0.085, 0.025, 0.012, 0.012], [0, -0.095, 0.04, 0.02, 0.012], [0.05, -0.085, 0.025, 0.012, 0.012]], { seg: 4, sub: 1, cap: [1, 1], ref: [0, 1, 0] });   // the jaw
  for (const s of [-1, 1]) {
    blob(K, [s * 0.032, -0.012, 0.09], [0.024, 0.026, 0.022], 3, 6);                                               // the sockets
    if (!lod) blob(I, [s * 0.062, -0.035, 0.06], [0.014, 0.014, 0.02], 2, 4);                                      // the cheekbones
  }
  blob(K, [0, -0.045, 0.105], [0.011, 0.02, 0.014], 2, 5);                                                         // the nasal opening
  if (!lod) tube(K, [[-0.028, -0.07, 0.085, 0.004, 0.004], [0.028, -0.07, 0.085, 0.004, 0.004]], { seg: 3, sub: 1, cap: [0, 0] });
}

// ---- the bench relief of the House of the Eagles -----------------------------------------------------------------------------------------
/**
 * A warrior in low relief (mesoweb, House of Eagles: the benches' panels show warriors processing, converging on the zacatapayolli),
 * walking toward +x, 0.4 m tall, rising 4 cm from the wall (z = 0): the legs with the knee and the sandalled foot, the loincloth with its
 * hanging end, the rounded chest and shoulder, the arm holding the staff, the head in profile with brow, nose and lips under a fan of
 * feathers; `eagle`: the helmet of an eagle's head with its beak, the feathered suit (an eagle knight); else the jaguar knight's
 * spotted suit. Heights are measured from the wall; the carving's frame: x along the procession, y up, z out.
 */
export function warriorRelief(C, { eagle = true, seed = 0, lod = 0 } = {}) {
  const Sk = C.S('stucco_ochre'), Rd = C.S('stucco_red'), Bl = C.S('maya_blue'), G = C.S('stucco_leaf'), T = C.S('timber'), W = C.S('paint_ochre'), K = C.S('paint_minoan_black'), Wh = C.S('plaster_white');
  const z0 = 0.016, sd = lod ? 5 : 6, j = (a) => 1 + 0.06 * (hash3(seed, a, 5) - 0.5), tb = (S, pts, o = {}) => tube(S, pts.map((p) => [p[0], p[1], z0 + (p[4] ?? 0), p[2], p[3]]), { seg: sd, sub: 1, cap: [1, 1], ref: [0, 0, 1], ...o });
  // the legs: the near one stepping forward, the far one behind it; the sandalled feet
  tb(Sk, [[0.045, 0.2, 0.022, 0.014, 0.012], [0.06, 0.12, 0.018, 0.012, 0.012], [0.07, 0.035, 0.013, 0.012, 0.012]]);
  tb(Sk, [[0.0, 0.2, 0.02, 0.013, 0.004], [-0.04, 0.12, 0.016, 0.012, 0.004], [-0.06, 0.035, 0.012, 0.012, 0.004]]);
  for (const x of [0.085, -0.045]) { tb(Sk, [[x - 0.02, 0.014, 0.011, 0.01], [x + 0.045, 0.014, 0.007, 0.01]].map(([a, b, c, d]) => [a, b, c, d, 0.002])); tb(W, [[x - 0.015, 0.025, 0.006, 0.006, 0.012], [x + 0.03, 0.02, 0.005, 0.005, 0.012]]); }
  // the loincloth: the belt, the apron hanging in front
  tb(Rd, [[-0.04, 0.215, 0.036, 0.012], [0.05, 0.215, 0.036, 0.012]]);
  tb(Rd, [[0.05, 0.2, 0.022, 0.006, 0.012], [0.072, 0.135, 0.026, 0.006, 0.014], [0.07, 0.08, 0.022, 0.006, 0.014]]);
  // the body: the chest and shoulder (a suit of feathers for the eagle knight, spotted for the jaguar knight), the arms
  const suit = eagle ? Bl : W;
  tb(suit, [[0.0, 0.215, 0.05, 0.02, 0.0], [0.0, 0.27, 0.052, 0.02, 0.002], [0.005, 0.315, 0.05, 0.02, 0.0]]);
  if (!lod) for (let i = 0; i < 4; i++) for (const q of (eagle ? [0] : [-0.015, 0.016])) tb(eagle ? G : K, [[q - 0.002, 0.235 + i * 0.025, 0.022, 0.006, 0.019], [q + 0.012, 0.238 + i * 0.025, 0.02, 0.006, 0.019]]);
  tb(Sk, [[0.0, 0.31, 0.017, 0.015, 0.004], [0.045, 0.27, 0.014, 0.012, 0.016], [0.085, 0.285, 0.012, 0.012, 0.018]]);                // the arm forward, holding the staff
  tb(Sk, [[-0.03, 0.31, 0.014, 0.012, 0.002], [-0.055, 0.265, 0.012, 0.01, 0.003]]);                                              // the other arm behind
  tb(T, [[0.09, 0.07, 0.006, 0.006, 0.016], [0.095, 0.4, 0.006, 0.006, 0.016]], { sub: 1 });                                    // the staff
  blob(Wh, [0.095, 0.41, z0 + 0.016], [0.011, 0.02, 0.008], 2, 5);                                                              // its head of bone
  // the round shield on the far shoulder
  blob(W, [-0.035, 0.27, z0 + 0.03], [0.035, 0.04, 0.007], 3, 7); blob(Rd, [-0.035, 0.27, z0 + 0.038], [0.014, 0.017, 0.004], 2, 5);
  // the head in profile: the skull, the brow, the nose, the lips, the chin; the eye
  blob(Sk, [0.008, 0.352, z0 + 0.012], [0.026 * j(1), 0.03, 0.017], 3, 7);
  blob(Sk, [0.035, 0.34, z0 + 0.012], [0.014, 0.018, 0.012], 2, 5);                                                              // the nose and face
  blob(Sk, [0.03, 0.322, z0 + 0.012], [0.012, 0.009, 0.01], 2, 5);                                                               // the chin
  blob(K, [0.026, 0.355, z0 + 0.024], [0.004, 0.004, 0.003], 2, 4);
  // the headdress: the eagle knight's helmet with its beak, the jaguar knight's with ears; both with a fan of feathers streaming back
  if (eagle) { tb(W, [[0.0, 0.372, 0.034, 0.02, 0.008], [0.035, 0.38, 0.026, 0.012, 0.012], [0.058, 0.366, 0.012, 0.01, 0.014]], { cap: [1, 1] }); tb(Wh, [[0.045, 0.362, 0.008, 0.004, 0.018], [0.056, 0.352, 0.004, 0.003, 0.018]]); }
  else { blob(W, [0.005, 0.372, z0 + 0.012], [0.032, 0.03, 0.02], 3, 7); blob(K, [-0.012, 0.385, z0 + 0.03], [0.007, 0.007, 0.004], 2, 4); blob(W, [0.02, 0.4, z0 + 0.012], [0.01, 0.012, 0.01], 2, 5); }
  const nf = lod ? 3 : 5;
  for (let i = 0; i < nf; i++) { const a = 0.5 + i * 0.28; blobDir(G, [-0.01 - 0.03 * Math.cos(a) * 0.5, 0.385 + 0.03 * Math.sin(a), z0 + 0.026], [-Math.cos(a * 0.8), Math.sin(a) * 0.9 + 0.2, 0.05], 0.045 * j(10 + i), 0.012, 0.005, [0, 0, 1], 2, 5); }
}

/**
 * A tile of the bench's front (2 m long, 0.47 m high under the lip, facing +z, built to the old tile's frame): the procession of warriors
 * (eagle knights and jaguar knights alternating) toward the middle or toward the end `dir`; `zac`: the zacatapayolli with its bloodied
 * spines in the middle where the processions meet; and the serpents undulating along the lip as tubes.
 */
export function benchTile(C, { dir = 1, zac = false, seed = 0, lod = 0 } = {}) {
  const R = C.S('stucco_red'), Wh = C.S('plaster_white'), Y = C.S('paint_ochre');
  // the serpents along the lip: a body in red, scales picked out in white, a head at each end of a run
  for (let r = 0; r < 2; r++) {
    const x0 = -1 + r, pts = []; for (let i = 0; i <= 9; i++) pts.push([x0 + i * 0.1, 0.545 + 0.022 * Math.sin(i * 1.4 + r), 0.062, 0.03, 0.026]);
    tube(R, pts.map((p) => [p[0], p[1], p[2], 0.026, 0.024]), { seg: lod ? 4 : 5, sub: 1, cap: [1, 1], ref: [0, 0, 1] });
    if (!lod) for (let i = 1; i < 9; i += 2) blob(Wh, [pts[i][0], pts[i][1] + 0.012, 0.083], [0.012, 0.01, 0.006], 2, 5);
  }
  const figs = [-0.66, 0, 0.66].map((x) => x);
  figs.forEach((x, i) => {
    if (zac && Math.abs(x) < 0.3) return;
    const sub = new Carver({ at: [0, 0, 0] });
    warriorRelief(sub, { eagle: i % 2 === 0, seed: seed * 7 + i, lod });
    const sgn = dir;
    for (const [m, q] of sub.by) { const S = C.S(m); for (let k = 0; k < q.pos.length; k += 3) { const px = sgn * q.pos[k] + x, py = q.pos[k + 1] + 0.035, pz = q.pos[k + 2]; const p = C.xf([px, py, pz]); S.pos.push(p[0], p[1], p[2]); const n = sub.xf === undefined ? [0, 0, 1] : [sgn * q.nor[k], q.nor[k + 1], q.nor[k + 2]], u = norm(sub2(C.xf([px + n[0], py + n[1], pz + n[2]]), p)); S.nor.push(u[0], u[1], u[2]); } }
  });
  if (zac) {                                                                                                   // the grass ball with its spines
    blob(Y, [0, 0.2, 0.06], [0.13, 0.12, 0.07], 4, 8);
    for (let j = 0; j < 7; j++) { const a = 0.4 + j * 0.42; cone(Wh, [Math.cos(a) * 0.1, 0.2 + Math.sin(a) * 0.1, 0.1], [Math.cos(a) * 0.24, 0.2 + Math.sin(a) * 0.24, 0.12], 0.008, 0.002, 4); }
    tube(R, [[0, 0.1, 0.05, 0.02, 0.02], [0.03, 0.04, 0.05, 0.02, 0.012]], { seg: 4, sub: 1, cap: [1, 1] });
  }
}
const sub2 = sub;

// ---- braziers and the sacrificial stone ---------------------------------------------------------------------------------------------------
/** A bow of knotted bark paper (amate) facing +z, 0.3 m wide: two flat loops, the knot between them, two tails hanging with a blue stripe. */
export function paperBow(C, { x = 0, y = 0, z = 0, k = 1, paint = 'maya_blue', seed = 0 } = {}) {
  const P = C.S('cloth_white'), B = C.S(paint), a = (p) => [x + p[0] * k, y + p[1] * k, z + p[2] * k];
  const j = 1 + 0.08 * (hash3(seed, x, y) - 0.5);
  for (const s of [-1, 1]) {
    const pts = [[s * 0.02, 0, 0.0], [s * 0.1, 0.1 * j, 0.02], [s * 0.2, 0.07, 0.03], [s * 0.22, -0.04, 0.03], [s * 0.12, -0.1, 0.02], [s * 0.03, -0.02, 0.005]];
    tube(P, pts.map((p) => { const q = a(p); return [q[0], q[1], q[2], 0.05 * k, 0.01 * k]; }), { seg: 6, sub: 1, cap: [1, 1], ref: [0, 1, 0] });
    const t = [[s * 0.03, -0.03, 0.01], [s * 0.07, -0.13, 0.02], [s * 0.09, -0.24, 0.015]];
    tube(P, t.map((p) => { const q = a(p); return [q[0], q[1], q[2], 0.04 * k, 0.008 * k]; }), { seg: 5, sub: 1, cap: [1, 1], ref: [0, 0, 1] });
    tube(B, t.map((p) => { const q = a([p[0], p[1], p[2] + 0.004]); return [q[0], q[1], q[2], 0.008 * k, 0.006 * k]; }), { seg: 4, sub: 1, cap: [1, 1], ref: [0, 0, 1] });
  }
  blob(B, a([0, -0.005, 0.022]), [0.03 * k, 0.03 * k, 0.022 * k], 3, 6);
}
/**
 * A brazier of Tlaloc (mesoweb: tears of rain; ancient-history-sites, Stage IV: braziers of Tlaloc and Huitzilopochtli round the platform),
 * about 0.8 m, facing +z: the vessel of clay turned with its flared rim, on it the god's face in relief — the goggles of blue rings, the
 * eyes, the nose, the upper lip with its two fangs, the tears — and over the brow the knotted bow of paper. `lod` 1 drops the finest.
 */
export function tlalocBrazier(C, { lod = 0, seed = 0 } = {}) {
  const T = C.S('terracotta'), Bl = C.S('maya_blue'), W = C.S('plaster_white'), K = C.S('paint_minoan_black'), n = lod ? 9 : 13;
  turn(T, [[0.002, 0], [0.19, 0.0], [0.17, 0.1], [0.2, 0.28], [0.27, 0.56], [0.32, 0.74], [0.3, 0.8], [0.25, 0.78], [0.002, 0.7]], n);
  for (const s of [-1, 1]) {
    torus(Bl, [s * 0.1, 0.57, 0.255], [1, 0, 0], [0, 1, 0], 0.062, 0.016, { seg: lod ? 8 : 12, sec: 4 });
    blob(W, [s * 0.1, 0.57, 0.265], [0.028, 0.028, 0.014], 2, 5); blob(K, [s * 0.1, 0.57, 0.275], [0.014, 0.014, 0.006], 2, 4);
    cone(W, [s * 0.055, 0.425, 0.29], [s * 0.05, 0.33, 0.3], 0.018, 0.003, 5);                      // the fangs
    if (!lod) tube(Bl, [[s * 0.15, 0.5, 0.25, 0.007, 0.007], [s * 0.17, 0.4, 0.24, 0.007, 0.007], [s * 0.18, 0.3, 0.22, 0.007, 0.007]], { seg: 4, sub: 1, cap: [1, 1] });   // the tears
  }
  tube(T, [[0, 0.55, 0.27, 0.05, 0.03], [0, 0.5, 0.29, 0.06, 0.03]], { seg: 6, sub: 1, cap: [1, 1], ref: [1, 0, 0] });                                                  // the nose
  tube(Bl, [[-0.11, 0.455, 0.275, 0.014, 0.02], [0, 0.465, 0.295, 0.014, 0.02], [0.11, 0.455, 0.275, 0.014, 0.02]], { seg: 5, sub: 1, cap: [1, 1], ref: [0, 1, 0] });      // the lip
  paperBow(C, { x: 0, y: 0.69, z: 0.25, k: 1.1, seed });
}
/**
 * The sacrificial stone (techcatl; World History Encyclopedia: the stone over which victims were stretched [stated]; its form inferred): a
 * block of basalt with rounded edges and a convex top on which the victim's back arched, a band of red under the rim, the stain, a flint
 * knife (tecpatl) with its handle of ochre lying on it. About 0.9 × 0.6 × 0.6 m at s = 1; the long side along x.
 */
export function techcatl(C, { seed = 0 } = {}) {
  const B = C.S('basalt'), R = C.S('stucco_red'), sq = (p) => (t, th) => (Math.abs(Math.cos(th)) ** p + Math.abs(Math.sin(th)) ** p) ** (-1 / p);
  tube(B, [[0, 0, 0, 0.46, 0.3], [0, 0.48, 0, 0.46, 0.3]], { seg: 16, sub: 1, cap: [0, 0], ref: [1, 0, 0], fold: sq(4.5) });
  ellipsoid(B, [0, 0.48, 0], [0.45, 0, 0], [0, 0.11, 0], [0, 0, 0.29], 3, 14);                                  // the convex top
  tube(R, [[0, 0.3, 0, 0.472, 0.312], [0, 0.38, 0, 0.472, 0.312]], { seg: 16, sub: 1, cap: [0, 0], ref: [1, 0, 0], fold: sq(4.5) });
  blob(R, [0.05, 0.585, 0.03], [0.2, 0.012, 0.09], 2, 8);                                                       // the stain
  tube(C.S('obsidian'), [[-0.22 + 0.1 * (hash3(seed, 3, 3) - 0.5), 0.6, 0.1, 0.035, 0.008], [-0.04, 0.605, 0.12, 0.045, 0.01], [0.14, 0.6, 0.14, 0.02, 0.006]], { seg: 5, sub: 1, cap: [1, 1], ref: [0, 1, 0] });   // the knife's blade
  tube(C.S('paint_ochre'), [[0.14, 0.6, 0.14, 0.022, 0.016], [0.3, 0.597, 0.16, 0.026, 0.02]], { seg: 6, sub: 1, cap: [1, 1] });                 // its handle
}
