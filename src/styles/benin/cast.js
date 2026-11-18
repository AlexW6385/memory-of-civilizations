// The cast and carved things of the altars and the roofs (docs/settlements/benin-city.md §14), modelled with the nabataean sculptor's kit: the commemorative
// head of an Oba with its beaded collar to the lip, its lattice cap and the tusk in the crown, the tusk with its registers of carved figures; the python of the
// turrets with its scales and open jaws; the bird with spread wings; the leopard aquamanile.
import { Sculpt, tube, blob, torus, hash3, norm, sub, mul, add, cross, dot, len } from '../nabataean/sculpt.js';
import { Pack, leopard } from './relief.js';

const TAU = Math.PI * 2;
/** the frame of a thing standing at (x, y, z) turned by rot (0 faces +z): local x right, y up, w forward */
const turnFrame = (x, y, z, rot, s = 1) => { const c = Math.cos(rot), n = Math.sin(rot); return (p) => [x + (c * p[0] + n * p[2]) * s, y + p[1] * s, z + (-n * p[0] + c * p[2]) * s]; };
const bl = (S, c, r, a = 4, b = 7) => blob(S, c, Array.isArray(r) ? r : [r, r, r], a, b);
const tb = (S, pts, o = {}) => tube(S, pts, { seg: 6, sub: 1, capN: 1, ...o });

/**
 * The commemorative head (the Met 1979.206.86 and the Art Institute's: a round, regular face, the cap of coral beads in a lattice, the strands at the temples
 * and the bead down the brow, the collar of rings of coral rising to the lip, a flared base, the opening in the crown for the tusk), lod 2 full, 1 reduced.
 * Returns the local frame so that the tusk can be set in its crown.
 */
export function headCast(ctx, x, y, z, rot, seed, tusk, lod = 2) {
  const P = new Pack(turnFrame(x, y, z, rot)), B = P.s('bronze'), C = P.s('wall_red'), G = P.s('gilt_bronze'), I = P.s('iron');
  const f = lod === 2, seg = f ? 12 : 8;
  // the flared base, then the collar: rings of beads narrowing a little toward the top, to the lip
  tb(B, [[0, 0, 0, 0.21, 0.21], [0, 0.035, 0, 0.2, 0.2], [0, 0.07, 0, 0.17, 0.17]], { seg, sub: 1, ref: [0, 0, 1] });
  const rings = f ? 7 : 4;
  for (let i = 0; i < rings; i++) { const yy = 0.085 + i * (0.19 / (rings - 1)), r = 0.178 - i * (0.05 / (rings - 1)); torus(C, [0, yy, 0], [1, 0, 0], [0, 0, 1], r, f ? 0.03 : 0.04, { seg: f ? 10 : 7, sec: 3 }); }
  // the face: a round egg, the brow, the nose with its wings, thick lips, the eyes with their lids, the ears; two short lines of iron on the brow
  bl(B, [0, 0.4, 0], [0.118, 0.14, 0.108], f ? 6 : 4, f ? 10 : 7);
  tb(B, [[-0.085, 0.455, 0.088, 0.016, 0.016], [0, 0.462, 0.1, 0.016, 0.016], [0.085, 0.455, 0.088, 0.016, 0.016]], { seg: 5, sub: 2, ref: [0, 1, 0] });
  tb(B, [[0, 0.45, 0.098, 0.02, 0.02], [0, 0.4, 0.124, 0.024, 0.026], [0, 0.375, 0.13, 0.03, 0.02]], { seg: 6, sub: 1, ref: [1, 0, 0] });
  if (f) {
    for (const s of [-1, 1]) {
      bl(B, [s * 0.034, 0.37, 0.124], [0.022, 0.016, 0.014], 3, 6);
      bl(B, [s * 0.058, 0.43, 0.098], [0.03, 0.015, 0.014], 3, 7); bl(I, [s * 0.058, 0.429, 0.109], [0.011, 0.011, 0.006], 3, 6);
      bl(B, [s * 0.12, 0.4, 0.0], [0.014, 0.04, 0.03], 4, 6);
      for (const q of [0, 1]) tb(I, [[s * (0.03 + q * 0.014), 0.485, 0.095, 0.004, 0.004], [s * (0.034 + q * 0.014), 0.535, 0.088, 0.004, 0.004]], { seg: 4, sub: 1, ref: [1, 0, 0] });
    }
    bl(B, [0, 0.335, 0.11], [0.05, 0.014, 0.018], 3, 8); bl(B, [0, 0.31, 0.1], [0.036, 0.016, 0.018], 3, 7);
  }
  // the cap of coral beads: a dome with its gilt band, the lattice of ribs over it, the strands at the temples, the bead down the brow
  bl(C, [0, 0.5, -0.006], [0.148, 0.125, 0.148], f ? 5 : 3, f ? 10 : 7);
  torus(G, [0, 0.49, 0], [1, 0, 0], [0, 0, 1], 0.15, 0.011, { seg: f ? 16 : 10, sec: 4 });
  const nr = f ? 6 : 4;
  for (let i = 0; i < nr; i++) {
    const a = i * TAU / nr + 0.2, pts = [];
    for (let k = 0; k <= 3; k++) { const ph = k / 3 * Math.PI * 0.46; pts.push([Math.sin(a) * Math.cos(ph) * 0.153, 0.5 + Math.sin(ph) * 0.13, Math.cos(a) * Math.cos(ph) * 0.153, 0.0065, 0.0065]); }
    tb(G, pts, { seg: 4, sub: 1, cap: [0, 1], capN: 1 });
  }
  if (f) for (const yy of [0.545, 0.585]) { const rr = Math.sqrt(1 - ((yy - 0.5) / 0.13) ** 2) * 0.153; torus(G, [0, yy, 0], [1, 0, 0], [0, 0, 1], rr, 0.006, { seg: 14, sec: 3 }); }
  for (const s of [-1, 1]) for (const q of [0, 1]) tb(C, [[s * (0.145 + q * 0.0), 0.49, 0.03 + q * 0.03, 0.012, 0.012], [s * (0.148), 0.42, 0.04 + q * 0.03, 0.011, 0.011], [s * 0.14, 0.34, 0.05 + q * 0.03, 0.01, 0.01]], { seg: 5, sub: 2, ref: [0, 0, 1] });
  tb(C, [[0, 0.5, 0.15, 0.011, 0.011], [0, 0.47, 0.145, 0.01, 0.01], [0, 0.41, 0.13, 0.01, 0.01]], { seg: 5, sub: 2, ref: [1, 0, 0] });
  // the crown: the collar of brass the tusk stands in
  tb(B, [[0, 0.6, 0, 0.085, 0.085], [0, 0.64, 0, 0.075, 0.075], [0, 0.68, 0, 0.068, 0.068]], { seg: f ? 12 : 8, sub: 1, ref: [0, 0, 1] });
  torus(B, [0, 0.68, 0], [1, 0, 0], [0, 0, 1], 0.068, 0.012, { seg: 10, sec: 3 });
  if (tusk) tuskCast(P, seed, lod);
  P.emit(ctx.bag, [x, y, z], 1 + (hash3(x, y, z, 3) - 0.5) * 0.02);
}

/**
 * The carved tusk set in a head's crown: an ivory curve rising from a brass ferrule, the carving in registers, each a band of figures in relief (the Oba
 * between his attendants, a leopard, a mudfish, a Portuguese in his hat) with a plain ring between the registers. Local frame of the head.
 */
export function tuskCast(P, seed, lod) {
  const V = P.s('ivory'), B = P.s('bronze'), f = lod === 2;
  const h = 1.0 + hash3(seed, 1, 2, 3) * 0.3, lean = 0.3, N = 9;
  const c = (u) => [lean * u * u, 0.66 + u * h, 0.05 * u * u], rad = (u) => 0.055 - 0.04 * u;
  const spine = []; for (let i = 0; i <= N; i++) { const u = i / N, p = c(u); spine.push([p[0], p[1], p[2], rad(u), rad(u)]); }
  tube(V, spine, { seg: f ? 8 : 6, sub: f ? 2 : 1, capN: 1, ref: [0, 0, 1], fold: f ? (t) => 1 + 0.045 * Math.sin(t * TAU * 12) : null });
  tube(B, [spine[0], spine[1]], { seg: 8, sub: 1, ref: [0, 0, 1] });
  if (!f) return;
  // the frame of the spine at u: the tangent, two normals
  const frame = (u) => { const a = c(Math.max(0, u - 0.01)), b = c(Math.min(1, u + 0.01)), T = norm(sub(b, a)); let n = sub([0, 0, 1], mul(T, T[2])); n = norm(n); return { T, n, b: cross(T, n), p: c(u) }; };
  const regs = [0.14, 0.34, 0.54, 0.73];
  regs.forEach((u0, ri) => {
    const F = frame(u0), r = rad(u0), n = 4, figH = 0.1 - 0.012 * ri;
    for (let i = 0; i < n; i++) {
      const phi = i * TAU / n + ri * 0.5 + hash3(seed, ri, i, 5) * 0.12, dir = add(mul(F.n, Math.cos(phi)), mul(F.b, Math.sin(phi)));
      const base = add(F.p, mul(dir, r * 0.92)), top = add(base, mul(F.T, figH));
      const kind = (i + ri) % 4;
      if (kind === 0 || kind === 3) {                                    // a standing figure: body, head, the arms out
        tube(B, [[...add(base, mul(F.T, 0.004)), 0.0085, 0.0085], [...add(base, mul(F.T, figH * 0.55)), 0.0095, 0.0095], [...top, 0.007, 0.007]].map((p) => [p[0], p[1], p[2], p[3], p[4]]), { seg: 5, sub: 1, ref: dir });
        bl(V, add(top, mul(F.T, 0.01)), [0.011, 0.012, 0.011], 3, 6);
        tube(B, [[...add(add(base, mul(F.T, figH * 0.5)), mul(F.b, -0.02)), 0.004, 0.004], [...add(add(base, mul(F.T, figH * 0.45)), mul(F.b, 0.02)), 0.004, 0.004]], { seg: 4, sub: 1 });
      } else if (kind === 1) {                                           // a leopard, along the tusk
        bl(B, add(base, mul(F.T, figH * 0.4)), [0.011, 0.012, 0.035], 3, 6);
        bl(B, add(base, mul(F.T, figH * 0.75)), [0.012, 0.012, 0.012], 3, 6);
      } else {                                                           // a mudfish, a little coil
        tube(B, [[...add(base, mul(F.T, figH * 0.1)), 0.006, 0.007], [...add(add(base, mul(F.T, figH * 0.5)), mul(F.b, 0.012)), 0.008, 0.009], [...add(add(base, mul(F.T, figH * 0.9)), mul(F.b, -0.01)), 0.005, 0.006]], { seg: 5, sub: 1, ref: dir });
      }
    }
    // the ring above the register
    const q = frame(u0 + 0.065);
    torus(V, q.p, q.n, q.b, rad(u0 + 0.065) * 1.02, 0.007, { seg: 10, sec: 3 });
  });
}

// ── the python ──────────────────────────────────────────────────────────────────────────────────────────────
/**
 * The great python down a turret's roof (van Nyendael: roofs with brass snakes; the Digital Benin plaque Af1898,0115.46: a snake down the front of the
 * turret, head first): a body of new brass along the world points `pts` (head last), its scales in rows that swell and narrow, a ridge down the back, the
 * head at the eave with its jaws open, fangs of ivory, a forked tongue, eyes of iron. r: the body's radius at the neck; lod 2 full, 1 reduced.
 */
export function pythonCast(ctx, pts, mat, r = 0.14, lod = 2) {
  const f = lod === 2, ident = (p) => p, S = new Sculpt(ident);
  const n = pts.length, L = pts.reduce((a, p, i) => a + (i ? len(sub(p, pts[i - 1])) : 0), 0), period = f ? 0.17 : 0.3;
  const spine = pts.map((p, i) => { const t = i / (n - 1), rr = r * (1 - 0.42 * t) * (1 + 0.14 * Math.sin(t * Math.PI)); return [p[0], p[1], p[2], rr, rr * 0.92]; });
  tube(S, spine, { seg: f ? 8 : 5, sub: f ? 7 : 3, ref: [0, 0, 1], cap: [0, 0], fold: (t, th) => 1 + (f ? 0.07 : 0.05) * Math.sin(t * L / period * TAU) * (0.65 + 0.35 * Math.cos(th * 2)) });
  // the head: the skull, the snout, the lower jaw hinged open, the fangs, the tongue, the eyes. Frame: w along the way down, y up out of the roof, x across.
  const h = pts[n - 1], F = norm(sub(h, pts[n - 2])), up0 = Math.abs(F[1]) > 0.95 ? [0, 0, 1] : [0, 1, 0], Rt = norm(cross(F, up0)), U = cross(Rt, F);
  const xf = (p) => [h[0] + Rt[0] * p[0] + U[0] * p[1] + F[0] * p[2], h[1] + Rt[1] * p[0] + U[1] * p[1] + F[1] * p[2], h[2] + Rt[2] * p[0] + U[2] * p[1] + F[2] * p[2]];
  const hs = r * 1.1 / 0.14;
  const H = new Sculpt(xf), K = new Sculpt(xf), I = new Sculpt(xf), V = new Sculpt(xf);
  const q = (v) => v * hs;
  blob(H, [0, 0, q(0.1)], [q(0.15), q(0.11), q(0.2)], f ? 6 : 4, f ? 10 : 7);                               // the skull
  tube(H, [[0, q(0.02), q(0.22), q(0.095), q(0.12)], [0, q(0.0), q(0.4), q(0.07), q(0.095)], [0, q(-0.01), q(0.52), q(0.05), q(0.07)]], { seg: 8, sub: 1, ref: [0, 1, 0], cap: [0, 1] });   // the upper jaw
  const jaw = [[0, q(-0.06), q(0.2), q(0.045), q(0.1)], [0, q(-0.17), q(0.34), q(0.035), q(0.085)], [0, q(-0.27), q(0.46), q(0.028), q(0.06)]];
  tube(H, jaw, { seg: 7, sub: 1, ref: [0, 1, 0], cap: [0, 1] });                                               // the lower jaw, open
  if (f) {
    for (const s of [-1, 1]) {
      bl(I, [s * q(0.1), q(0.07), q(0.2)], q(0.028), 3, 6);
      tb(V, [[s * q(0.05), q(-0.045), q(0.44), q(0.01), q(0.01)], [s * q(0.05), q(-0.14), q(0.46), q(0.004), q(0.004)]], { seg: 4, sub: 1 });   // the fangs
      tb(V, [[s * q(0.04), q(-0.19), q(0.43), q(0.008), q(0.008)], [s * q(0.04), q(-0.12), q(0.46), q(0.003), q(0.003)]], { seg: 4, sub: 1 });
      bl(K, [s * q(0.03), q(0.0), q(0.52)], q(0.012), 2, 5);
    }
  }
  const T = new Sculpt(xf); T.flat = 1;
  tube(T, [[0, q(-0.1), q(0.3), q(0.012), q(0.012)], [0, q(-0.14), q(0.5), q(0.01), q(0.01)], [0, q(-0.17), q(0.62), q(0.008), q(0.008)]], { seg: 4, sub: 1, ref: [0, 1, 0] });
  for (const s of [-1, 1]) tb(T, [[0, q(-0.17), q(0.62), q(0.007), q(0.007)], [s * q(0.04), q(-0.17), q(0.7), q(0.004), q(0.004)]], { seg: 4, sub: 1 });
  const P = new Pack(ident);
  P.m[mat] = S; P.m[mat + '|h'] = H; P.m.iron = I; P.m.ivory = V; P.m['bronze|k'] = K; P.m['iron|t'] = T;
  const out = new Pack(ident);
  for (const k in P.m) { const m = k.split('|')[0]; out.raw[m] ??= []; out.raw[m].push([P.m[k].pos, P.m[k].nor]); }
  const c = pts[Math.floor(n / 2)];
  out.emit(ctx.bag, c, 1 + (hash3(c[0], c[1], c[2], 9) - 0.5) * 0.01, 0.6);
}

// ── the bird ────────────────────────────────────────────────────────────────────────────────────────────────
/**
 * The brass bird of a spire, its wings spread (Dapper: "casted copper birds"; the plaques show the bird with outstretched wings): a plump body, a neck and a small
 * head with a pointed beak looking to −z, a fan of three tail feathers, and on each side an arm and two rows of feathers fanned back and a little up, each feather
 * a long flattened leaf with its tip turned. s: scale (1 = about 1.1 m across), lod 2 full, 1 reduced.
 */
export function birdCast(ctx, x, y, z, s, rot, mat, lod = 2) {
  const f = lod === 2, c = Math.cos(rot), n = Math.sin(rot);
  const xf = (p) => [x + (c * p[0] + n * p[2]) * s, y + p[1] * s, z + (-n * p[0] + c * p[2]) * s];
  const S = new Sculpt(xf), E = new Sculpt(xf); S.flat = 1; E.flat = 1;
  const ft = (a, b, w, th = 0.006, tipUp = 0.02) => { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + tipUp * 0.4, (a[2] + b[2]) / 2]; tube(S, [[...a, th, w * 0.35], [...m, th, w], [b[0], b[1] + tipUp, b[2], th * 0.5, w * 0.25]], { seg: 4, sub: 1, ref: [0, 1, 0], cap: [1, 1], capN: 1 }); };
  tube(S, [[0, 0.2, -0.2, 0.06, 0.06], [0, 0.18, -0.02, 0.11, 0.1], [0, 0.17, 0.16, 0.085, 0.08], [0, 0.18, 0.3, 0.03, 0.03]], { seg: f ? 8 : 6, sub: f ? 2 : 1, ref: [0, 1, 0] });   // the body
  tube(S, [[0, 0.21, -0.17, 0.05, 0.05], [0, 0.3, -0.27, 0.04, 0.04], [0, 0.34, -0.33, 0.04, 0.04]], { seg: 6, sub: 1, ref: [1, 0, 0] });                                  // the neck
  blob(S, [0, 0.35, -0.36], [0.052, 0.055, 0.06], f ? 4 : 3, 7);                                                                                                         // the head
  tube(S, [[0, 0.345, -0.4, 0.022, 0.026], [0, 0.325, -0.52, 0.002, 0.002]], { seg: 5, sub: 1, ref: [1, 0, 0], cap: [0, 1] });                                         // the beak
  if (f) for (const sg of [-1, 1]) blob(E, [sg * 0.04, 0.36, -0.385], [0.01, 0.01, 0.01], 2, 5);
  for (const k of [-1, 0, 1]) ft([0, 0.17, 0.2], [k * 0.1, 0.15 + (k ? 0.01 : 0), 0.62], 0.04);                                                                          // the tail
  for (const sg of [-1, 1]) {
    tube(S, [[sg * 0.07, 0.24, -0.1, 0.03, 0.03], [sg * 0.3, 0.29, -0.11, 0.024, 0.024], [sg * 0.56, 0.33, -0.1, 0.014, 0.014]], { seg: 5, sub: 1, ref: [0, 1, 0] });       // the arm
    const nP = f ? 7 : 5, armY = (x) => 0.24 + (Math.abs(x) - 0.07) / 0.49 * 0.09;
    for (let i = 0; i < nP; i++) {                                        // the primaries: from the arm's trailing edge outward, fanned back and overlapping
      const t = i / (nP - 1), x0 = sg * (0.12 + t * 0.4), y0 = armY(x0) - 0.012;
      ft([x0, y0, -0.085], [x0 + sg * (0.16 - 0.1 * t), y0 + 0.03 + 0.02 * t, -0.085 + 0.4 - 0.1 * t], 0.062 - 0.012 * t, 0.007, 0.03);
    }
    if (f) for (let i = 0; i < 5; i++) { const t = i / 4, x0 = sg * (0.09 + t * 0.34), y0 = armY(x0) - 0.03; ft([x0, y0, -0.02 + t * 0.0], [x0 + sg * 0.05, y0 + 0.02, 0.2 - t * 0.04], 0.05, 0.006, 0.0); }   // the secondaries
  }
  const P = new Pack((p) => p);
  P.raw[mat] = [[S.pos, S.nor]]; P.raw.iron = [[E.pos, E.nor]];
  P.emit(ctx.bag, [x, y, z], 1 + (hash3(x, y, z, 11) - 0.5) * 0.02, 0.6);
}

// ── the leopard aquamanile and the cast leopard ─────────────────────────────────────────────────────────────
/**
 * A leopard in the round at (x, y, z) facing rot (0: +z), L the length unit (nose to tail 1.8 L). aqua: the vessel (a pouring leopard: the filling hole on the back with its lid and
 * a ring, the open mouth the spout; the Art Institute's pair "may have stood either side of the throne"). Modelled as the plaque leopard but deep, with both flanks and four legs.
 */
export function leopardRound(ctx, x, y, z, rot, L, aqua, lod = 2, dir = 1) {
  const c = Math.cos(rot), n = Math.sin(rot);
  const P = new Pack((p) => [x + c * p[2] + n * p[0], y + p[1], z - n * p[2] + c * p[0]]);
  leopard(P, 0, 0, L, { round: true, dep: 0.8, lod: lod === 2 ? 0 : 1, dir });
  if (aqua && lod === 2) {
    const G = P.s('gilt_bronze'), B = P.s('bronze');
    const xx = dir * (-0.02) * L, yy = 0.53 * L;
    torus(B, [xx, yy, 0], [1, 0, 0], [0, 0, 1], 0.045 * L, 0.012 * L, { seg: 10, sec: 4 });
    blob(G, [xx, yy + 0.012 * L, 0], [0.04 * L, 0.012 * L, 0.04 * L], 3, 8);
    torus(G, [xx, yy + 0.03 * L, 0], [1, 0, 0], [0, 1, 0], 0.02 * L, 0.006 * L, { seg: 8, sec: 3 });
  }
  P.emit(ctx.bag, [x, y, z], 1 + (hash3(x, y, z, 13) - 0.5) * 0.01, 0.6);
}
