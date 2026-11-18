// The people of Chichén Itzá's stone (docs/settlements/chichen-itza.md §18): bodies from the Parthenon's skeleton kit (rounded limbs, torsos, heads with brow, nose
// and lips) dressed after the Toltec–Maya reliefs: the warrior with his feather headdress, atlatl and darts; the Atlantean under the altar; the chacmool; the ball
// player. Each is built at height 1 (feet at y = 0, facing +z) into a Parts; relief figures are then squeezed to a few centimetres.
import { segBox, Parts, bodyOf, skeleton, blob, blobDir, tube, rodT, torus, hash3, ST, RD, BL, GR, OC, BK, WH, JD } from './sculpt.js';
import { Matrix4, BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe } from '../../core/geom.js';

const TAU = Math.PI * 2;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const nrm = (a) => { const l = Math.hypot(...a) || 1; return mul(a, 1 / l); };
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Drop the triangles whose centre lies within r of c (the head of a beheaded player). */
function cutBall(g, c, r) {
  const p = g.attributes.position.array, n = g.attributes.normal.array, P = [], N = [];
  for (let i = 0; i < p.length; i += 9) {
    const x = (p[i] + p[i + 3] + p[i + 6]) / 3, y = (p[i + 1] + p[i + 4] + p[i + 7]) / 3, z = (p[i + 2] + p[i + 5] + p[i + 8]) / 3;
    if (Math.hypot(x - c[0], y - c[1], z - c[2]) < r) continue;
    for (let k = 0; k < 9; k++) { P.push(p[i + k]); N.push(n[i + k]); }
  }
  const o = new BufferGeometry(); o.setAttribute('position', new Float32BufferAttribute(P, 3)); o.setAttribute('normal', new Float32BufferAttribute(N, 3));
  return o;
}
const triOf = (g) => (g.index ? g.toNonIndexed() : g);

/** The body of a figure: bodyOf's stone into ST (the loincloth and ornaments are added by the callers); `headless` takes the head away. */
function body(P, o, headless = false) {
  const f = bodyOf({ drape: 'nude', hair: 'none', ...o }), J = skeleton({ drape: 'nude', ...o });
  for (const g0 of f.stone) { let g = triOf(g0); if (headless) { g = cutBall(g, J.head, 0.075); if (!g.attributes.position.count) continue; } P.geo(ST, g); }
  return J;
}

/** The feather headdress: a band, a fan of plumes (green, blue between) rising from the crown and trailing, long ones at the middle. */
function headdress(P, c, { lod = 0, face = 1, tall = 1 } = {}) {
  const R = P.sc(RD), G = P.sc(GR), B = P.sc(BL);
  torus(R, [c[0], c[1] + 0.028, c[2]], [1, 0, 0], [0, 0, 1], 0.058, 0.011, { seg: 12, sec: 5 });
  const n = lod === 0 ? 9 : 5;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) - 0.5, ang = t * 2.2, len = (0.2 + 0.11 * (1 - Math.abs(t) * 1.6)) * tall;
    const d = nrm([Math.sin(ang) * 0.45 - 0.3 * face * 0.3 + (0.05 * face), Math.cos(ang) * 0.9 + 0.2, -0.28 - Math.abs(t) * 0.2]);
    blobDir(i % 2 ? B : G, add([c[0] + t * 0.06, c[1] + 0.06, c[2] - 0.02], mul(d, len * 0.9)), d, len, 0.028, 0.009, [0, 0, 1], 3, 6);
  }
}

/** The Toltec warrior in relief, his torso to the front, legs and head in profile toward +x (face = 1) or −x: feather headdress, ear spools, pectoral, belt and apron, atlatl in one hand, darts in the other. Height 1. */
export function warrior(P, { part = 'all', face = 1, pose = 'stride', kind = 'warrior', v = 0 } = {}) {
  const base = part !== 'fine', fine = part !== 'base', lod = 0;
  const player = kind === 'player', arms = player ? { R: [-0.1 - 0.05 * v, 0.55 + 0.1 * v, 0.1], L: [0.24 + 0.06 * v, 0.62 - 0.12 * v, 0.1] } : { R: [-0.13, 0.5, 0.09], L: [0.22, 0.7, 0.1] };
  const mir = face < 0, J = base ? body(P, { pose, lod: 2, look: 82, arms, mirror: mir }) : skeleton({ drape: 'nude', pose, look: 82, arms, mirror: mir });
  const S = P.sc(ST), R = P.sc(RD), B = P.sc(BL), O = P.sc(OC), W = P.sc(WH), K = P.sc(BK), T = P.sc('timber');
  const pel = J.pelvis, hd = J.head;
  if (fine) headdress(P, hd, { lod });
  if (fine) blob(O, [hd[0] - 0.012 * face, hd[1] - 0.002, hd[2] + 0.018], [0.015, 0.02, 0.012], 3, 6);                    // the ear spool
  if (base) blob(B, add(J.chest, [0.005, 0.07, 0.07]), [0.07, 0.045, 0.02], 4, 8);                                // the pectoral, a butterfly of blue
  // the belt and the apron falling in front, the maxtlatl
  if (base) tube(R, [add(pel, [-0.105, 0.03, -0.02]), add(pel, [-0.06, 0.035, 0.095]), add(pel, [0.06, 0.035, 0.095]), add(pel, [0.105, 0.03, -0.02])].map((p) => [...p, 0.018, 0.016]), { seg: 6, sub: 2, ref: [0, 1, 0] });
  if (base) blobDir(R, add(pel, [0.0, -0.09, 0.1]), [0, -1, 0], 0.1, 0.1, 0.014, [0, 0, 1], 3, 8);
  if (base) blobDir(B, add(pel, [0.0, -0.17, 0.105]), [0, -1, 0], 0.035, 0.07, 0.012, [0, 0, 1], 3, 6);
  // sandals
  if (fine) for (const k of ['anR', 'anL']) blob(O, add(J[k], [0.02 * face, -0.02, 0.025]), [0.03, 0.006, 0.055], 3, 6);
  if (player && base) {
    torus(S, add(pel, [0, 0.0, 0]), [1, 0, 0], [0, 0, 1], 0.105, 0.028, { seg: 14, sec: 6 });            // the stone yoke at the hips
    blob(S, add(J.knL, [0, 0.0, 0.045]), [0.05, 0.06, 0.03], 4, 8);                                       // the knee pad
    blob(S, add(J.wrL, [0.03 * face, 0.0, 0.04]), [0.03, 0.03, 0.03], 3, 6);                                     // the handstone
  }
  // the atlatl: a rod with a hook, along the rear hand's reach; the darts upright in the other hand
  if (fine && !player) {
  const hr = add(J.wrR, [0.01 * face, 0.02, 0.03]);
    rodT(T, add(hr, [-0.04 * face, -0.05, 0]), add(hr, [0.15 * face, 0.1, 0.0]), 0.0085, 0.0075);
    rodT(T, add(hr, [0.15 * face, 0.1, 0.0]), add(hr, [0.17 * face, 0.14, 0]), 0.007, 0.004);
    const hl = add(J.wrL, [0.01 * face, 0.0, 0.035]);
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.022, a = add(hl, [(dx - 0.02) * face, -0.2, 0]), b = add(hl, [(dx + 0.04 * i - 0.02) * face, 0.38, 0.0]);
      rodT(T, a, b, 0.006, 0.005); rodT(K, b, add(b, [0.012 * face, 0.07, 0]), 0.009, 0.001);
      rodT(G(P), a, add(a, [0, 0.07, 0]), 0.007, 0.007);
    }
  }
  void S; void W; void lod;
  return P;
}
const G = (P) => P.sc(GR);

/** An Atlantean under the altar: a stocky warrior, 1 m, arms raised to the slab, butterfly pectoral, loincloth, feather cap. */
export function atlantean(P, { part = 'all' } = {}) {
  const base = part !== 'fine', fine = part !== 'base';
  const J = base ? body(P, { pose: 'stand', lod: 2, arms: { R: [-0.15, 0.96, 0.05], L: [0.15, 0.96, 0.05] } }) : skeleton({ drape: 'nude', pose: 'stand', arms: { R: [-0.15, 0.96, 0.05], L: [0.15, 0.96, 0.05] } });
  const R = P.sc(RD), B = P.sc(BL), O = P.sc(OC), G2 = P.sc(GR);
  const pel = J.pelvis;
  if (base) blob(B, add(J.chest, [0, 0.08, 0.075]), [0.095, 0.06, 0.022], 4, 8);
  if (base) blobDir(R, add(pel, [0, -0.1, 0.085]), [0, -1, 0], 0.12, 0.1, 0.016, [0, 0, 1], 3, 8);
  if (base) blobDir(R, add(pel, [0, -0.1, -0.085]), [0, -1, 0], 0.1, 0.1, 0.014, [0, 0, -1], 3, 8);
  if (base) torus(R, add(pel, [0, 0.03, 0]), [1, 0, 0], [0, 0, 1], 0.098, 0.014, { seg: 14, sec: 5 });
  const hd = J.head;
  if (fine) torus(G2, [hd[0], hd[1] + 0.03, hd[2]], [1, 0, 0], [0, 0, 1], 0.06, 0.016, { seg: 12, sec: 5 });
  if (fine) for (let i = 0; i < 5; i++) blobDir(i % 2 ? B : G2, [hd[0] + (i - 2) * 0.02, hd[1] + 0.06, hd[2] - 0.01], [(i - 2) * 0.3, 1, -0.3], 0.07, 0.016, 0.008, [0, 0, 1], 3, 5);
  if (fine) for (const s of [-1, 1]) blob(O, [hd[0] + s * 0.057, hd[1] - 0.012, hd[2]], [0.01, 0.018, 0.018], 3, 6);
  if (fine) for (const k of ['anR', 'anL']) blob(O, add(J[k], [0, -0.02, 0.03]), [0.03, 0.006, 0.055], 3, 6);

  return P;
}

/**
 * The chacmool, lying along x (head at −x), turned to look out at +z: reclining on his back propped on the elbows, knees drawn up, the head turned
 * to face the viewer, a flat dish held on the belly; the figure 1.45 m from head to heel at height 1 → scaled by the caller. Includes the base.
 */
export function chacmool(P, { part = 'all' } = {}) {
  const base = part === 'base' || part === 'all', fine = part === 'fine' || part === 'all';
  // figure in a sitting-back pose facing +z, then turned to lie along +x
  const pose = { pose: 'seat', lod: 1, look: -90, J: {
    pelvis: [0, 0.14, 0], chest: [0.0, 0.3, -0.2], neck: [0, 0.4, -0.33], head: [0, 0.47, -0.4], shR: [-0.11, 0.37, -0.25], shL: [0.11, 0.37, -0.25],
    hipR: [-0.06, 0.14, 0.0], hipL: [0.06, 0.14, 0.0], anR: [-0.075, 0.04, 0.2], anL: [0.075, 0.04, 0.2], wrR: [-0.05, 0.36, 0.03], wrL: [0.05, 0.36, 0.03]},
    legBend: [0, 1, 0.1], armBendR: [-0.6, -1, -0.5], armBendL: [0.6, -1, -0.5] };
  const J = base ? body(P, pose) : skeleton({ drape: 'nude', ...pose });
  const R = P.sc(RD), B = P.sc(BL), O = P.sc(OC), G2 = P.sc(GR), S = P.sc(ST);
  if (part === 'far') {   // the landmark's form beyond 45 m: the slab and a few boxy masses inside the modelled body (torso, thighs, head)
    P.sc(ST).box(-0.25, -0.12, -0.62, 0.25, 0, 0.42);
    segBox(S, J.pelvis, J.chest, 0.05); segBox(S, J.hipR, J.knR, 0.035); segBox(S, J.hipL, J.knL, 0.035); segBox(S, J.neck, J.head, 0.03);
    return P;
  }
  // loincloth between the thighs, the belt, the necklace, the wristlets, the ear spools, the headband
  if (base) blobDir(R, add(J.pelvis, [0, 0.03, 0.09]), [0, -0.3, 1], 0.11, 0.055, 0.016, [0, 1, 0], 3, 8);
  if (base) torus(R, add(J.pelvis, [0, 0.04, 0]), [1, 0, 0], [0, 0.3, 1], 0.1, 0.015, { seg: 14, sec: 5 });
  if (fine) torus(B, add(J.neck, [0, -0.04, 0.05]), [1, 0, 0], [0, 0.3, 1], 0.06, 0.012, { seg: 12, sec: 5 });
  if (fine) for (const k of ['wrR', 'wrL']) torus(O, J[k], [1, 0, 0], [0, 0.6, 1], 0.026, 0.008, { seg: 8, sec: 4 });
  const hd = J.head;
  if (fine) for (const s of [-1, 1]) blob(O, [hd[0] + s * 0.056, hd[1] - 0.02, hd[2]], [0.012, 0.02, 0.02], 3, 6);
  if (fine) torus(G2, [hd[0], hd[1] + 0.035, hd[2]], [1, 0, 0], [0, 0.2, 1], 0.06, 0.018, { seg: 12, sec: 5 });
  if (fine) for (let i = 0; i < 5; i++) blobDir(i % 2 ? B : G2, [hd[0] + (i - 2) * 0.022, hd[1] + 0.07, hd[2] - 0.02], [(i - 2) * 0.35, 0.8, -0.5], 0.07, 0.018, 0.008, [0, 0, 1], 3, 5);
  if (fine) for (const k of ['anR', 'anL']) blob(O, add(J[k], [0, -0.02, 0.03]), [0.03, 0.006, 0.055], 3, 6);
  // the dish on the belly: a shallow round plate held in both hands
  const dish = lathe([[0.001, 0], [0.09, 0.0], [0.115, 0.018], [0.108, 0.026], [0.09, 0.012], [0.001, 0.012]], 14);
  dish.translate(0, 0.0, 0); const c = lerp(J.wrR, J.wrL, 0.5);
  dish.applyMatrix4(new Matrix4().makeRotationX(0.45).setPosition(c[0], c[1] + 0.03, c[2] + 0.07));
  if (base) P.geo(ST, dish);
  void S; void WH; void JD; void hash3; void blobDir; void nrm; void sub; void mul; void TAU;
  return P;
}
