// The sculpture of the Oba's palace seen from two metres (docs/settlements/benin-city.md §14): the brass plaques as high relief on a ground of incised
// river leaves (quatrefoils), the figures modelled with the nabataean sculptor's kit (src/styles/nabataean/sculpt.js, read only): rounded limbs, a head with
// brow, nose and lips, a collar of beads, baldrics, a spear, a matchlock, a leopard, a mudfish. A plaque has three levels of detail by its distance from the way
// a visitor walks (lodAt): full within 12 m, reduced to 30 m, and beyond a minimal form (a gilt panel with its figures in one block).
// Everything is deterministic: variety comes from a hash of the plaque's own position, never from a counter or a random number.
import { Sculpt, tube, blob, hash3, rodT } from '../nabataean/sculpt.js';
import { BufferGeometry, Float32BufferAttribute, ExtrudeGeometry, Shape, Path } from '../../core/three.js';

export { Sculpt, tube, blob, hash3, rodT };
const TAU = Math.PI * 2;

// ── levels of detail ────────────────────────────────────────────────────────────────────────────────────────
/** 2 full (≤ 15 m from the way in), 1 reduced (≤ 40 m), 0 far; k scales the distances (tall things are seen from farther). No way in the plan: full. */
export function lodAt(ctx, x, z, k = 1) {
  const pl = ctx.plan, way = pl?.walks;
  if (!way || !way.length) return 2;
  const pts = [...(pl.entrance?.at ? [pl.entrance.at] : []), ...way[0]];
  let d = 1e9;
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz;
    let t = L ? ((x - a[0]) * dx + (z - a[1]) * dz) / L : 0; t = Math.max(0, Math.min(1, t));
    d = Math.min(d, Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz));
  }
  return d <= 12 * k ? 2 : d <= 30 * k ? 1 : 0;
}

// ── a pack of sculpted geometry by material, split into small pieces ────────────────────────────────────────
/** The sculpts of one carving by material; xf the frame → world map. */
export class Pack {
  constructor(xf, clip = false) { this.xf = xf; this.clip = clip; this.m = {}; this.raw = {}; this.masks = []; }
  s(mat, flat = 1) { let S = this.m[mat]; if (!S) S = this.m[mat] = new Sculpt(this.xf, { clip: this.clip }); S.flat = flat; return S; }
  /** triangles given in the frame as [x, y, w, …] with their normals: put through xf (rotation part for the normals). */
  tris(mat, pos, nor) { (this.raw[mat] ??= []).push([pos, nor]); }
  /** every geometry of the pack, jittered about `c` by `jit` (a hair, from the piece's own place), cut into pieces under 0.4 m */
  emit(bag, c, jit, cell = 0.18) {
    const out = [];
    for (const mat in this.m) out.push([mat, this.m[mat].pos, this.m[mat].nor]);
    for (const mat in this.raw) for (const [p, n] of this.raw[mat]) out.push([mat, p, n]);
    for (const [mat, pos, nor] of out) {
      if (!pos.length) continue;
      const cells = new Map();
      for (let i = 0; i < pos.length; i += 9) {
        const cx = (pos[i] + pos[i + 3] + pos[i + 6]) / 3, cy = (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3, cz = (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3;
        const k = `${Math.floor(cx / cell)},${Math.floor(cy / cell)},${Math.floor(cz / cell)}`;
        let L = cells.get(k); if (!L) cells.set(k, (L = []));
        L.push(i);
      }
      for (const L of cells.values()) {
        const P = new Float32Array(L.length * 9), N = new Float32Array(L.length * 9);
        L.forEach((i, j) => { for (let q = 0; q < 9; q += 3) { P[j * 9 + q] = c[0] + (pos[i + q] - c[0]) * jit; P[j * 9 + q + 1] = c[1] + (pos[i + q + 1] - c[1]) * jit; P[j * 9 + q + 2] = c[2] + (pos[i + q + 2] - c[2]) * jit; N[j * 9 + q] = nor[i + q]; N[j * 9 + q + 1] = nor[i + q + 1]; N[j * 9 + q + 2] = nor[i + q + 2]; } });
        const g = new BufferGeometry();
        g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3));
        bag.add(mat, g);
      }
    }
  }
}
/** The frame of a carving on a face: origin (x, y, z) on the surface, `face` 'n' | 's' | 'e' | 'w' (the way it looks), k the scale; w = 0 is the surface. */
export function faceFrame(x, y, z, face, k = 1) {
  const dir = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[face], right = [dir[1], -dir[0]];
  return (p) => [x + (right[0] * p[0] + dir[0] * (p[2] + 0.012)) * k, y + p[1] * k, z + (right[1] * p[0] + dir[1] * (p[2] + 0.012)) * k];
}

// ── the figure ──────────────────────────────────────────────────────────────────────────────────────────────
const T0 = 0.005;                                    // the ground plate's thickness: figures stand on w = T0
/** limb: points [x, y, w, half-width, half-depth] */
function lim(S, pts, seg, sub, o = {}) { return tube(S, pts.map((p) => [p[0], p[1], p[2] + T0, p[4] ?? p[3] * 0.8, p[3]]), { seg: Math.min(seg, 6), sub: Math.min(sub, 2), capN: 1, ref: [0, 0, 1], ...o }); }
const ball = (S, c, r, nlat = 3, nlon = 5) => blob(S, [c[0], c[1], c[2] + T0], Array.isArray(r) ? r : [r, r, r], Math.min(nlat, 4), Math.min(nlon, 7));

/**
 * A man on the plaque, frontal, his feet at (cx, y0) and his height H (the head a third of the body, the Benin proportion). o: type 'oba' | 'chief' | 'page' |
 * 'portuguese', hat 'crown' | 'cap' | 'helmet' | 'morion' | 'brim' | 'none', legs 'stand' | 'fish' | 'kneel', arms 'held' (forearms raised outward, held by
 * attendants) | 'down' | 'spear' | 'gun' | 'horn' | 'shield', hold: what he carries ('ada', 'spear', 'bell', 'shield', 'manilla'), side ±1, lod 0 full, 1 reduced.
 */
export function man(P, cx, y0, H, o = {}) {
  const lod = o.lod ?? 0, seg = lod ? 4 : 6, sub = 1, X = (f) => cx + f * H, Y = (f) => y0 + f * H, R = (f) => f * H, sd = o.side ?? 1;
  const B = P.s('bronze'), G = P.s('gilt_bronze'), I = P.s('iron'), V = P.s('ivory');
  const type = o.type ?? 'chief', pt = type === 'portuguese';
  P.masks.push([cx - 0.19 * H, y0, cx + 0.19 * H, y0 + 1.15 * H], [cx - 0.3 * H, y0 + 0.35 * H, cx + 0.3 * H, y0 + 0.75 * H]);
  if (lod || H < 0.25) {                                // the reduced figure: legs, wrapper, trunk, head, headdress and what he carries, from few tubes
    const sg2 = 4;
    for (const s of [-1, 1]) lim(B, [[X(s * 0.06), Y(0.24), 0, R(0.036)], [X(s * 0.068), Y(0.02), 0, R(0.03)]], sg2, 1);
    if (pt) { lim(B, [[X(0), Y(0.4), 0, R(0.13), R(0.06)], [X(0), Y(0.26), 0, R(0.12), R(0.06)]], sg2 + 2, 1); }
    else lim(B, [[X(0), Y(0.5), 0, R(0.125), R(0.055)], [X(0), Y(0.2), 0, R(0.15), R(0.06)]], sg2 + 2, 1);
    lim(B, [[X(0), Y(0.5), 0, R(0.105), R(0.06)], [X(0), Y(0.7), 0, R(0.108), R(0.06)]], sg2 + 2, 1);
    if (!pt) lim(G, [[X(0), Y(0.69), 0, R(0.105), R(0.07)], [X(0), Y(0.79), 0, R(0.085), R(0.066)]], sg2 + 2, 1);
    if (!pt && (type === 'oba' || type === 'chief')) for (const s of [-1, 1]) lim(G, [[X(-s * 0.1), Y(0.69), R(0.062), R(0.018), R(0.012)], [X(s * 0.1), Y(0.42), R(0.062), R(0.018), R(0.012)]], 3, 1);
    for (const s of [-1, 1]) {
      const a = o.arms ?? 'down', up = a === 'held' ? [X(s * 0.27), Y(0.62)] : a === 'down' ? [X(s * 0.15), Y(0.38)] : s === sd ? [X(s * 0.2), Y(0.6)] : [X(s * 0.14), Y(0.4)];
      const wr = o.reach && o.reach[s] !== undefined ? o.reach[s] : [up[0], up[1], R(0.03)];
      lim(B, [[X(s * 0.115), Y(0.66), 0, R(0.04)], [wr[0], wr[1], wr[2], R(0.028)]], 4, 1); o['wrist' + s] = [wr[0], wr[1], wr[2]];
    }
    ball(B, [X(0), Y(0.865), 0], [R(0.105), R(0.118), R(0.105)], 3, 5);
    const hat0 = o.hat ?? 'none';
    if (hat0 === 'crown' || hat0 === 'cap' || hat0 === 'helmet') lim(G, [[X(0), Y(0.93), 0, R(0.112), R(0.1)], [X(0), Y(hat0 === 'crown' ? 1.07 : hat0 === 'cap' ? 0.99 : 1.04), 0, R(0.11), R(0.1)]], 5, 1);
    else if (hat0 === 'morion' || hat0 === 'brim') lim(G, [[X(-0.17), Y(0.93), R(0.02), R(0.02)], [X(0.17), Y(0.93), R(0.02), R(0.02)]], 4, 1);
    const hold0 = o.hold, w0 = o['wrist' + sd];
    if (hold0 === 'spear') lim(B, [[w0[0], Y(-0.02), R(0.05), R(0.011)], [w0[0], Y(1.2), R(0.05), R(0.011)]], 3, 1);
    else if (hold0 === 'shield' || hold0 === 'bell') ball(G, [hold0 === 'bell' ? X(-sd * 0.15) : w0[0], hold0 === 'bell' ? Y(0.36) : w0[1] + R(0.05), R(0.04)], hold0 === 'bell' ? R(0.05) : [R(0.12), R(0.2), R(0.05)], 3, 6);
    else if (hold0 === 'gun') lim(I, [[X(-sd * 0.1), Y(0.32), R(0.1), R(0.016)], [X(sd * 0.3), Y(0.8), R(0.1), R(0.013)]], 4, 1);
    else if (hold0 === 'ada') lim(G, [[w0[0], w0[1] - R(0.04), R(0.04), R(0.01)], [w0[0] + sd * R(0.03), w0[1] + R(0.4), R(0.045), R(0.07), R(0.008)]], 4, 1);
    else if (hold0 === 'horn') lim(V, [[X(sd * 0.02), Y(0.77), R(0.12), R(0.012)], [X(sd * 0.3), Y(0.9), R(0.1), R(0.03)]], 4, 1);
    return o;
  }
  // the legs
  const lg = o.legs ?? 'stand';
  for (const s of [-1, 1]) {
    if (lg === 'fish') {                                // the Oba's legs are mudfish: two curving bodies ending in the fish heads and their barbels
      lim(B, [[X(s * 0.05), Y(0.24), 0, R(0.034)], [X(s * 0.1), Y(0.14), 0, R(0.032)], [X(s * 0.16), Y(0.05), 0, R(0.026)]], seg, sub);
      ball(B, [X(s * 0.17), Y(0.03), 0], [R(0.04), R(0.028), R(0.02)]);
      if (!lod) for (const q of [-1, 1]) lim(B, [[X(s * 0.18), Y(0.03), R(0.01), R(0.007)], [X(s * 0.18 + q * s * 0.06), Y(0.0), R(0.012), R(0.005)]], 4, 1, { cap: [1, 1] });
    } else if (lg === 'kneel') {
      lim(B, [[X(s * 0.07), Y(0.2), 0, R(0.04)], [X(s * 0.1), Y(0.06), R(0.02), R(0.04)]], seg, sub);
    } else {
      lim(B, [[X(s * 0.06), Y(pt ? 0.3 : 0.24), 0, R(pt ? 0.04 : 0.036)], [X(s * 0.066), Y(0.1), 0, R(pt ? 0.032 : 0.034)], [X(s * 0.068), Y(0.03), 0, R(0.03)]], seg, sub);
      ball(B, [X(s * 0.07), Y(0.015), R(0.02)], [R(0.04), R(0.022), R(0.045)]);
    }
  }
  // the wrapper: a pleated skirt from the waist to the knee, a band of gilt at its hem; the Portuguese in puffed breeches
  if (pt) {
    for (const s of [-1, 1]) ball(B, [X(s * 0.065), Y(0.34), 0], [R(0.075), R(0.1), R(0.06)], 5, 7);
    lim(G, [[X(-0.14), Y(0.46), R(0.05), R(0.012)], [X(0.14), Y(0.46), R(0.05), R(0.012)]], 5, 3);
  } else {
    lim(B, [[X(0), Y(0.5), 0, R(0.125), R(0.055)], [X(0), Y(0.34), 0, R(0.14), R(0.06)], [X(0), Y(0.2), 0, R(0.152), R(0.06)]], seg, sub, { fold: (t, th) => 1 + 0.06 * Math.cos(th * 5 + t * 2) });
    lim(G, [[X(-0.152), Y(0.2), R(0.04), R(0.014)], [X(0.152), Y(0.2), R(0.04), R(0.014)]], 5, 3);
    lim(G, [[X(-0.13), Y(0.5), R(0.045), R(0.016)], [X(0.13), Y(0.5), R(0.045), R(0.016)]], 5, 3);
    if (!lod && type === 'oba') for (const s of [-1, 1]) ball(G, [X(s * 0.15), Y(0.4), R(0.05)], [R(0.03), R(0.03), R(0.014)]);     // the leopard-head pendants at the hips
  }
  // the trunk and the high collar of beads rising to the lip, the crossed baldrics
  lim(B, [[X(0), Y(0.5), 0, R(0.105), R(0.06)], [X(0), Y(0.6), 0, R(0.115), R(0.064)], [X(0), Y(0.7), 0, R(0.108), R(0.06)]], seg, sub);
  if (pt) ball(B, [X(0), Y(0.6), R(0.01)], [R(0.115), R(0.13), R(0.07)], 5, 8);            // the breastplate
  else lim(G, [[X(0), Y(0.69), 0, R(0.105), R(0.07)], [X(0), Y(0.735), 0, R(0.1), R(0.072)], [X(0), Y(0.79), 0, R(0.085), R(0.066)]], seg, sub, { fold: (t) => 1 + 0.07 * Math.sin(t * TAU * 5) });
  if (type === 'oba' || type === 'chief') {
    for (const s of [-1, 1]) lim(G, [[X(-s * 0.1), Y(0.69), R(0.062), R(0.018), R(0.012)], [X(s * 0.1), Y(0.42), R(0.062), R(0.018), R(0.012)]], 5, lod ? 1 : 4, { fold: (t) => 1 + 0.18 * Math.sin(t * TAU * 11) });
    if (!lod) ball(G, [X(0), Y(0.555), R(0.06)], [R(0.032), R(0.032), R(0.014)]);
  }
  // the arms
  const arms = o.arms ?? 'down';
  for (const s of [-1, 1]) {
    const sh = [X(s * 0.115), Y(0.66), 0];
    let el, wr;
    if (arms === 'held') { el = [X(s * 0.2), Y(0.52), R(0.01)]; wr = [X(s * 0.27), Y(0.62), R(0.02)]; }
    else if (arms === 'spear') { el = [X(s * 0.16), Y(0.52), R(0.03)]; wr = s === sd ? [X(s * 0.2), Y(0.6), R(0.05)] : [X(s * 0.14), Y(0.4), R(0.03)]; }
    else if (arms === 'gun') { el = [X(s * 0.15), Y(0.5), R(0.04)]; wr = s === sd ? [X(-s * 0.02), Y(0.55), R(0.09)] : [X(s * 0.17), Y(0.58), R(0.08)]; }
    else if (arms === 'horn') { el = [X(s * 0.16), Y(0.56), R(0.03)]; wr = s === sd ? [X(s * 0.035), Y(0.76), R(0.09)] : [X(s * 0.15), Y(0.4), R(0.03)]; }
    else if (arms === 'shield') { el = [X(s * 0.17), Y(0.54), R(0.03)]; wr = s === sd ? [X(s * 0.2), Y(0.66), R(0.05)] : [X(s * 0.17), Y(0.4), R(0.04)]; }
    else { el = [X(s * 0.15), Y(0.52), R(0.015)]; wr = [X(s * 0.15), Y(0.37), R(0.02)]; }
    if (o.reach && o.reach[s] !== undefined) wr = o.reach[s];
    lim(B, [[sh[0], sh[1], sh[2], R(0.04)], [el[0], el[1], el[2], R(0.032)], [wr[0], wr[1], wr[2], R(0.026)]], seg, sub);
        ball(B, [wr[0], wr[1], wr[2]], [R(0.03), R(0.034), R(0.022)]);
    o['wrist' + s] = wr;
  }
  // the head: large, round, the brow, the nose with its wings, the lips, the ears, the eyes
  const hy = Y(0.865), hr = R(0.105);
  ball(B, [X(0), hy, 0], [hr, R(0.118), R(0.105)], lod ? 3 : 4, lod ? 5 : 7);
  if (!lod) {
    lim(B, [[X(-0.065), Y(0.895), R(0.1), R(0.014), R(0.014)], [X(0.065), Y(0.895), R(0.1), R(0.014), R(0.014)]], 5, 3);   // the brow
    lim(B, [[X(0), Y(0.885), R(0.105), R(0.016), R(0.02)], [X(0), Y(0.82), R(0.13), R(0.02), R(0.024)]], 5, 2);              // the nose
    ball(B, [X(-0.028), Y(0.805), R(0.12)], R(0.014), 3, 5); ball(B, [X(0.028), Y(0.805), R(0.12)], R(0.014), 3, 5);
    ball(B, [X(0), Y(0.77), R(0.108)], [R(0.045), R(0.014), R(0.016)], 3, 7);                                                 // the lips
    ball(B, [X(0), Y(0.745), R(0.098)], [R(0.03), R(0.014), R(0.012)], 3, 6);
    for (const s of [-1, 1]) { ball(I, [X(s * 0.042), Y(0.875), R(0.108)], R(0.014), 3, 5); ball(B, [X(s * 0.108), Y(0.86), R(0.02)], [R(0.01), R(0.036), R(0.026)], 3, 5); }
  }
  // the headdress
  const hat = o.hat ?? 'none';
  if (hat === 'crown' || hat === 'cap') {                // a cylinder of coral beads in rows, a flared lip, the high feather (the oro) of the Oba's crown
    const top = hat === 'crown' ? 1.07 : 0.99;
    lim(G, [[X(0), Y(0.93), 0, R(0.112), R(0.1)], [X(0), Y((0.93 + top) / 2), 0, R(0.118), R(0.105)], [X(0), Y(top), 0, R(0.11), R(0.1)]], seg, 2, { fold: (t) => 1 + 0.055 * Math.sin(t * TAU * (hat === 'crown' ? 5 : 3)) });
    if (!lod) lim(G, [[X(-0.11), Y(0.93), R(0.1), R(0.012)], [X(0.11), Y(0.93), R(0.1), R(0.012)]], 5, 3);
    if (hat === 'crown' && !lod) { lim(G, [[X(0.085), Y(1.04), R(0.03), R(0.012)], [X(0.14), Y(1.14), R(0.01), R(0.018)], [X(0.15), Y(1.2), 0, R(0.008)]], 5, 2); }
    if (hat === 'crown' && !lod) for (let i = -2; i <= 2; i++) ball(B, [X(i * 0.045), Y(0.935), R(0.1)], R(0.017), 3, 5);   // strands down the brow
  } else if (hat === 'helmet') { lim(G, [[X(0), Y(0.93), 0, R(0.115), R(0.1)], [X(0), Y(0.99), 0, R(0.11), R(0.1)], [X(0), Y(1.04), 0, R(0.06), R(0.06)]], seg, sub); lim(G, [[X(0), Y(1.03), 0, R(0.012)], [X(0.02), Y(1.14), 0, R(0.01)]], 4, 1); }
  else if (hat === 'morion') { ball(G, [X(0), Y(0.95), 0], [R(0.125), R(0.08), R(0.105)], 4, 8); lim(G, [[X(0), Y(1.0), 0, R(0.014), R(0.04)], [X(0), Y(1.06), 0, R(0.014), R(0.05)], [X(0), Y(1.0), 0, R(0.01), R(0.03)]], 4, 1); lim(G, [[X(-0.19), Y(0.915), R(0.01), R(0.012)], [X(0.19), Y(0.915), R(0.01), R(0.012)]], 5, 3); }
  else if (hat === 'brim') { lim(G, [[X(-0.19), Y(0.925), R(0.02), R(0.014), R(0.03)], [X(0.19), Y(0.925), R(0.02), R(0.014), R(0.03)]], 5, 4); ball(G, [X(0), Y(0.97), 0], [R(0.09), R(0.06), R(0.08)], 4, 7); }
  if (pt && !lod) { ball(B, [X(0), Y(0.735), R(0.1)], [R(0.05), R(0.04), R(0.02)], 3, 7); lim(B, [[X(-0.04), Y(0.78), R(0.108), R(0.014)], [X(0.04), Y(0.78), R(0.108), R(0.014)]], 4, 2); }
  // what he carries
  const hold = o.hold;
  const wrS = o['wrist' + sd];
  if (hold === 'spear') {
    const x = wrS[0];
    lim(B, [[x, Y(-0.02), R(0.05), R(0.011)], [x, Y(1.17), R(0.05), R(0.011)]], 5, 5);
    ball(G, [x, Y(1.22), R(0.05)], [R(0.024), R(0.055), R(0.01)], 3, 6);
  } else if (hold === 'bell') {                          // a hand bell hung at the belt on a strap: a flared body with a clapper
    const bx = X(-sd * 0.15), by = Y(0.42);
    lim(G, [[bx, by + R(0.1), R(0.07), R(0.014)], [bx, by + R(0.01), R(0.08), R(0.052)], [bx, by - R(0.07), R(0.08), R(0.075)]], 6, 2, { cap: [1, 0] });
    ball(I, [bx, by - R(0.075), R(0.08)], R(0.016), 3, 5);
    if (!lod) lim(G, [[X(-sd * 0.1), Y(0.68), R(0.07), R(0.01)], [bx, by + R(0.1), R(0.075), R(0.01)]], 4, 2);
  } else if (hold === 'ada') {                           // the ceremonial sword (ada): a broad leaf blade on a grip, raised in the right hand
    const x = wrS[0], y = wrS[1];
    lim(G, [[x, y - R(0.04), R(0.04), R(0.01)], [x, y + R(0.1), R(0.04), R(0.012)]], 5, 2);
    lim(G, [[x, y + R(0.1), R(0.045), R(0.045), R(0.008)], [x + sd * R(0.03), y + R(0.3), R(0.045), R(0.085), R(0.008)], [x + sd * R(0.04), y + R(0.44), R(0.045), R(0.02), R(0.006)]], 6, 3);
  } else if (hold === 'shield') {                        // an oval shield with a boss, held before the body
    const x = wrS[0], y = wrS[1];
    ball(G, [x, y + R(0.05), R(0.03)], [R(0.13), R(0.22), R(0.05)], 5, 10);
    ball(B, [x, y + R(0.05), R(0.075)], [R(0.04), R(0.06), R(0.025)], 3, 7);
  } else if (hold === 'gun') {                           // the matchlock: a long barrel on a stock, the lock with its serpentine and the burning match
    const a = [X(-sd * 0.1), Y(0.32), R(0.1)], b = [X(sd * 0.3), Y(0.8), R(0.1)];
    lim(I, [[a[0], a[1], a[2], R(0.016)], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, a[2], R(0.014)], [b[0], b[1], b[2], R(0.013)]], 5, 4);
    lim(B, [[a[0] - sd * R(0.03), a[1] - R(0.06), a[2], R(0.03), R(0.035)], [a[0] + sd * R(0.12), a[1] + R(0.1), a[2], R(0.026), R(0.03)]], 5, 2);
    ball(I, [a[0] + sd * R(0.16), a[1] + R(0.15), a[2] + R(0.02)], [R(0.03), R(0.025), R(0.012)], 3, 6);
    lim(I, [[a[0] + sd * R(0.15), a[1] + R(0.15), a[2] + R(0.02), R(0.006)], [a[0] + sd * R(0.2), a[1] + R(0.25), a[2] + R(0.02), R(0.006)]], 4, 1);
  } else if (hold === 'horn') {                          // an ivory side-blown horn raised to the lips
    lim(V, [[X(sd * 0.02), Y(0.77), R(0.12), R(0.012)], [X(sd * 0.18), Y(0.78), R(0.12), R(0.024)], [X(sd * 0.3), Y(0.9), R(0.1), R(0.03)]], 6, 3);
  } else if (hold === 'manilla') {                       // a manilla (an open brass ring of Portuguese trade) in the raised hand
    const x = wrS[0], y = wrS[1];
    tube(B, [[x - R(0.05), y + R(0.04), R(0.04) + T0, R(0.012)], [x, y + R(0.08), R(0.04) + T0, R(0.012)], [x + R(0.05), y + R(0.04), R(0.04) + T0, R(0.012)], [x, y, R(0.04) + T0, R(0.012)], [x - R(0.05), y + R(0.04), R(0.04) + T0, R(0.012)]], { seg: 5, sub: 2, cap: [0, 0] });
  }
  return o;
}

// ── the leopard and the mudfish ─────────────────────────────────────────────────────────────────────────────
/**
 * A leopard in profile facing +x, its feet at y0, L the body's length (nose to rump about 1.35 L with the head): a deep chest and haunch with their muscle, legs
 * with shoulder, elbow, wrist and paw, a neck, a round head with brow, muzzle, an open mouth with fangs of ivory, ears, the ring spots, a tail curling up
 * in three prongs. o.dep: the depth of the flank (relief 0.3, round 0.85), o.round: the far legs too, o.lod.
 */
export function leopard(P, cx, y0, L, o = {}) {
  P.masks.push([cx - 0.95 * L, y0, cx + 0.95 * L, y0 + 0.75 * L]);
  const lod = o.lod ?? 0, seg = lod ? 4 : 6, sub = 1, d = o.dep ?? 0.35, rnd = !!o.round, dir = o.dir ?? 1, X = (f) => cx + dir * f * L, Y = (f) => y0 + f * L, R = (f) => f * L;
  const B = P.s('bronze'), G = P.s('gilt_bronze'), V = P.s('ivory'), I = P.s('iron');
  const T = o.round ? 0 : T0, W = (f) => R(f) * d;
  const lm = (S, pts, opt = {}) => tube(S, pts.map((p) => [p[0], p[1], p[2] + T, p[4] ?? p[3] * 0.85, p[3]]), { seg, sub, capN: 1, ref: [0, 0, 1], ...opt });
  const bl = (S, c, r, a = 3, b = 6) => blob(S, [c[0], c[1], c[2] + T], Array.isArray(r) ? r : [r, r, r], Math.min(a, 4), Math.min(b, 8));
  if ((lod || L < 0.15) && !rnd) {                      // the reduced leopard of a plaque: body, four legs, head, tail
    tube(B, [[X(-0.43), Y(0.36), T, W(0.15), R(0.15)], [X(0.0), Y(0.38), T, W(0.125), R(0.12)], [X(0.38), Y(0.36), T, W(0.14), R(0.15)]], { seg: 5, sub: 1, ref: [0, 0, 1], capN: 1 });
    for (const [fx, ht] of [[0.26, 0], [0.14, 0], [-0.32, 1], [-0.2, 1]]) lm(B, [[X(fx), Y(0.3), W(0.1), R(0.09)], [X(fx + 0.03), Y(0.03), W(0.1), R(0.04)]], { seg: 3, sub: 1 });
    bl(B, [X(0.62), Y(0.57), 0], [R(0.13), R(0.1), W(0.1)], 3, 5);
    lm(B, [[X(-0.5), Y(0.4), 0, R(0.04)], [X(-0.85), Y(0.3), 0, R(0.035)], [X(-0.9), Y(0.55), 0, R(0.025)]], { seg: 3, sub: 1 });
    return;
  }
  // the body: from the haunch over the loin to the chest (a tube about the long axis, deeper at the chest and the haunch, narrow at the waist)
  tube(B, [[X(-0.43), Y(0.36), T, W(0.15), R(0.15)], [X(-0.22), Y(0.38), T, W(0.13), R(0.13)], [X(0.02), Y(0.38), T, W(0.125), R(0.12)], [X(0.25), Y(0.37), T, W(0.15), R(0.155)], [X(0.38), Y(0.36), T, W(0.13), R(0.14)]], { seg: seg + 2, sub: 2, ref: [0, 0, 1], cap: [1, 1], capN: 1 });
  bl(B, [X(-0.31), Y(0.31), 0], [R(0.17), R(0.17), W(0.15)], 5, 8);       // the haunch
  bl(B, [X(0.26), Y(0.3), 0], [R(0.15), R(0.16), W(0.14)], 5, 8);        // the shoulder
  // the legs (near and, in the round, the far pair): the hind leg bends at knee and hock, the fore leg stands straight on its wrist
  for (const [s, off] of rnd ? [[1, 1], [-1, -1]] : [[1, 1]]) {
    const w = off * W(0.12);
    for (const [fx, hind, ph] of [[0.26, 0, 0], [-0.32, 1, 1]]) {
      const x = fx + (s < 0 ? (hind ? 0.1 : -0.08) : 0);
      if (hind) {
        lm(B, [[X(x), Y(0.3), w, R(0.115)], [X(x + 0.1), Y(0.17), w, R(0.075)], [X(x - 0.02), Y(0.1), w, R(0.045)], [X(x + 0.03), Y(0.04), w, R(0.04)]], { seg, sub });
        bl(B, [X(x + 0.1), Y(0.17), w], R(0.075), 3, 6);
        bl(B, [X(x + 0.09), Y(0.025), w + R(0.01)], [R(0.075), R(0.032), R(0.05)], 3, 7);
      } else {
        lm(B, [[X(x), Y(0.3), w, R(0.1)], [X(x - 0.01), Y(0.16), w, R(0.058)], [X(x + 0.01), Y(0.05), w, R(0.045)]], { seg, sub });
        bl(B, [X(x + 0.035), Y(0.025), w + R(0.01)], [R(0.07), R(0.032), R(0.05)], 3, 7);
      }
      if (!lod) for (const t of [-1, 0, 1]) bl(I, [X(x + 0.095 + (hind ? 0.05 : 0.0)), Y(0.015), w + R(0.012) * t], [R(0.01), R(0.006), R(0.006)], 2, 4);
    }
  }
  // the neck, the head with its brow and muzzle, the jaw open (the Benin leopards bare ivory teeth), the ears, the eyes
  lm(B, [[X(0.36), Y(0.42), T, R(0.14), W(0.13)], [X(0.5), Y(0.52), T, R(0.125), W(0.12)], [X(0.57), Y(0.56), T, R(0.12), W(0.11)]], { seg, sub });
  bl(B, [X(0.63), Y(0.575), 0], [R(0.12), R(0.095), W(0.1)], 4, 8);
  lm(B, [[X(0.66), Y(0.555), 0, R(0.07), W(0.075)], [X(0.78), Y(0.53), 0, R(0.056), W(0.065)]], { seg: Math.max(5, seg - 1), sub: 1 });   // the muzzle
  lm(B, [[X(0.64), Y(0.5), 0, R(0.042), W(0.06)], [X(0.76), Y(0.47), 0, R(0.03), W(0.05)]], { seg: 5, sub: 1 });                         // the lower jaw, a little open
  ball(I, [X(0.79), Y(0.545), 0], [R(0.02), R(0.016), W(0.04)], 3, 5);                                                                  // the nose
  if (!lod) {
    for (const t of rnd ? [-1, 1] : [1]) {
      bl(V, [X(0.77 - 0.01), Y(0.50), t * W(0.04)], [R(0.007), R(0.026), R(0.007)], 2, 4); bl(V, [X(0.7), Y(0.505), t * W(0.045)], [R(0.007), R(0.024), R(0.007)], 2, 4);
      bl(V, [X(0.68), Y(0.60), t * W(0.095)], [R(0.022), R(0.02), R(0.008)], 3, 6); bl(I, [X(0.682), Y(0.6), t * W(0.1)], [R(0.012), R(0.011), R(0.006)], 2, 5);
      bl(B, [X(0.58), Y(0.66), t * W(0.06)], [R(0.04), R(0.045), R(0.014)], 3, 6);
    }
    for (let i = 0; i < 6; i++) { const a = i * 0.9; lm(B, [[X(0.42), Y(0.52 - i * 0.03), W(0.1) * (rnd ? 1 : 0.5), R(0.02)], [X(0.45 + 0.01 * (i % 2)), Y(0.43 - i * 0.03), W(0.12) * (rnd ? 1 : 0.5), R(0.012)]], { seg: 4, sub: 1 }); void a; }   // the ruff of tufts
  }
  // the tail: from the rump curling up, ending in three prongs
  lm(B, [[X(-0.5), Y(0.4), 0, R(0.045), W(0.04)], [X(-0.68), Y(0.3), 0, R(0.04), W(0.035)], [X(-0.84), Y(0.34), 0, R(0.036), W(0.032)], [X(-0.9), Y(0.5), 0, R(0.03), W(0.028)]], { seg: 5, sub: 2 });
  for (const t of [-1, 0, 1]) lm(B, [[X(-0.9), Y(0.5), 0, R(0.026), W(0.024)], [X(-0.93 - t * 0.02), Y(0.6 + Math.abs(t) * -0.02), t * R(0.02), R(0.014), W(0.012)]], { seg: 4, sub: 1 });
  // the ring spots: gilt rings on the flank in staggered rows (a disc of gilt with a bronze eye)
  const spots = lod ? [] : [[-0.34, 0.42], [-0.2, 0.46], [-0.06, 0.45], [0.08, 0.46], [0.2, 0.43], [-0.28, 0.31], [-0.12, 0.34], [0.04, 0.33], [-0.22, 0.2], [-0.05, 0.22], [0.28, 0.4], [0.32, 0.27], [-0.4, 0.29]];
  for (const [sx, sy] of spots) for (const t of rnd ? [-1, 1] : [1]) {
    const dd = t * (d * R(0.13) * (1 - Math.abs(sy - 0.37) * 2.2) + R(0.004)) ;
    bl(G, [X(sx), Y(sy), dd], [R(0.034), R(0.03), R(0.008)], 2, 6);
  }
}

/**
 * A mudfish (Olokun's fish, the Edo's symbol of the sea and the Oba's legs): a long body flattened at the head with a wide mouth and two pairs of barbels, small eyes,
 * a ridged back, pectoral fins, a tail fin. From (x, y) along a curve (a: the angle of its axis, c: the curl), length L, head toward +x before the turn.
 */
export function mudfish(P, x, y, L, a = 0, curl = 0.3, o = {}) {
  P.masks.push([x - L * 0.45, y - L * 0.3, x + L * 0.45, y + L * 0.3]);
  const lod = o.lod ?? 0, seg = lod ? 4 : 6, sub = 1, ca = Math.cos(a), sa = Math.sin(a), B = P.s('bronze'), G = P.s('gilt_bronze'), I = P.s('iron');
  const at = (t, off = 0) => { const u = (t - 0.5) * L, v = Math.sin(t * Math.PI * 1.6 + 0.5) * curl * L * 0.18 + off; return [x + ca * u - sa * v, y + sa * u + ca * v]; };
  const pts = [], prof = [[0.012, 0.01], [0.042, 0.022], [0.055, 0.026], [0.04, 0.022], [0.02, 0.016]];
  [0.02, 0.3, 0.55, 0.8, 0.98].forEach((t, i) => { const p = at(t), r = prof[i]; pts.push([p[0], p[1], T0, r[1] * L * 3.0 * 0.45, r[0] * L * 3.6]); });
  tube(B, pts.map((p) => [p[0], p[1], p[2], p[3], p[4] * 0.5]), { seg: seg + 2, sub: sub + 1, ref: [0, 0, 1], fold: (t, th) => 1 + 0.06 * Math.sin(t * TAU * 9) });
  // the flat head: a wide skull, the mouth, two eyes
  const h = at(0.97);
  blob(B, [h[0], h[1], T0], [L * 0.07, L * 0.06, 0.012], 3, 8);
  if (!lod) {
    for (const s of [-1, 1]) {
      blob(I, [h[0] + ca * L * 0.02 - sa * s * L * 0.035, h[1] + sa * L * 0.02 + ca * s * L * 0.035, T0 + 0.01], [0.006, 0.006, 0.005], 2, 5);
      for (const q of [0, 1]) tube(B, [[h[0] + ca * L * 0.05 - sa * s * L * 0.04, h[1] + sa * L * 0.05 + ca * s * L * 0.04, T0 + 0.006, 0.004], [h[0] + ca * L * (0.1 + q * 0.03) - sa * s * L * (0.09 + q * 0.04), h[1] + sa * L * (0.1 + q * 0.03) + ca * s * L * (0.09 + q * 0.04), T0 + 0.004, 0.003]], { seg: 4, sub: 1, cap: [1, 1] });   // the barbels
      const f = at(0.75), g = [f[0] - sa * s * L * 0.11, f[1] + ca * s * L * 0.11];
      tube(G, [[f[0], f[1], T0 + 0.004, 0.006, 0.012], [g[0], g[1], T0 + 0.004, 0.004, 0.02], [g[0] - ca * L * 0.05, g[1] - sa * L * 0.05, T0 + 0.003, 0.003, 0.01]], { seg: 4, sub: 1 });   // the pectoral fins
    }
    for (let i = 0; i < 7; i++) { const p = at(0.12 + i * 0.12); blob(G, [p[0], p[1], T0 + 0.016 * (1 - Math.abs(i - 3) * 0.1)], [0.012, 0.012, 0.004], 2, 5); }     // the ridge of the back
  }
  const t = at(0.0), t2 = at(-0.07, 0.03), t3 = at(-0.07, -0.03);
  tube(G, [[t[0], t[1], T0 + 0.003, 0.004, 0.012], [t2[0], t2[1], T0 + 0.003, 0.003, 0.014]], { seg: 4, sub: 1 }); tube(G, [[t[0], t[1], T0 + 0.003, 0.004, 0.012], [t3[0], t3[1], T0 + 0.003, 0.003, 0.014]], { seg: 4, sub: 1 });
}

// ── the ground: incised quatrefoils ─────────────────────────────────────────────────────────────────────────
/** put a three.js geometry (positions, normals; non-indexed) through the pack's frame into a raw list */
function addGeo(P, mat, g) {
  const p = g.attributes.position.array, n = g.attributes.normal.array, pos = new Float32Array(p.length), nor = new Float32Array(p.length), o = P.xf([0, 0, 0]);
  for (let i = 0; i < p.length; i += 3) {
    const q = P.xf([p[i], p[i + 1], p[i + 2]]), m = P.xf([n[i], n[i + 1], n[i + 2]]);
    pos[i] = q[0]; pos[i + 1] = q[1]; pos[i + 2] = q[2];
    const a = m[0] - o[0], b = m[1] - o[1], c = m[2] - o[2], l = Math.hypot(a, b, c) || 1; nor[i] = a / l; nor[i + 1] = b / l; nor[i + 2] = c / l;
  }
  P.tris(mat, pos, nor);
}
/** the extruded plate without its back cap (the faces looking into the wall) */
function dropBack(g) {
  const p = g.attributes.position.array, n = g.attributes.normal.array, kp = [], kn = [];
  for (let i = 0; i < p.length; i += 9) { if (n[i + 2] < -0.9 && n[i + 5] < -0.9 && n[i + 8] < -0.9) continue; for (let k = 0; k < 9; k++) { kp.push(p[i + k]); kn.push(n[i + k]); } }
  const o = new BufferGeometry(); o.setAttribute('position', new Float32BufferAttribute(new Float32Array(kp), 3)); o.setAttribute('normal', new Float32BufferAttribute(new Float32Array(kn), 3)); return o;
}
/** a quad in the frame at depth w, its front toward +w */
function quadAt(P, mat, x0, y0, x1, y1, w) {
  const pos = [x0, y0, w, x1, y0, w, x1, y1, w, x0, y0, w, x1, y1, w, x0, y1, w], nor = [];
  for (let i = 0; i < 6; i++) nor.push(0, 0, 1);
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(new Float32Array(pos), 3)); g.setAttribute('normal', new Float32BufferAttribute(new Float32Array(nor), 3));
  addGeo(P, mat, g);
}
/** a quatrefoil, four petals of a river leaf, as a closed outline about (cx, cy) with petal length R, turned by a */
function quatrefoil(cx, cy, R, a) {
  const pts = [];
  for (let i = 0; i < 12; i++) { const th = i / 12 * TAU, r = R * (0.28 + 0.72 * Math.pow(Math.abs(Math.cos(2 * th)), 1.5)); pts.push([cx + Math.cos(th + a) * r, cy + Math.sin(th + a) * r]); }
  return pts;
}
/**
 * The field of a plaque, from -Wn/2 to Wn/2 and -Hn/2 to Hn/2 (the frame's own units): the dark floor of the leaves a hair under the gilt plate, and the plate
 * in tiles of 0.1 each cut with a quatrefoil where no figure covers it (`masks`: rects [u0, v0, u1, v1] the figures stand on).
 */
function field(P, Wn, Hn, masks, lod) {
  if (lod < 2) { quadAt(P, 'gilt_bronze', -Wn / 2, -Hn / 2, Wn / 2, Hn / 2, T0); return; }
  quadAt(P, 'bronze', -Wn / 2, -Hn / 2, Wn / 2, Hn / 2, 0.0015);
  const pitch = 0.1, nx = Math.max(1, Math.round(Wn / pitch)), ny = Math.max(1, Math.round(Hn / pitch)), tw = Wn / nx, th = Hn / ny;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x0 = -Wn / 2 + i * tw, y0 = -Hn / 2 + j * th, cx = x0 + tw / 2, cy = y0 + th / 2;
    const rr = Math.min(tw, th) * 0.4, covered = masks.some((m) => cx + rr > m[0] && cx - rr < m[2] && cy + rr > m[1] && cy - rr < m[3]);
    const edge = i === 0 || j === 0 || i === nx - 1 || j === ny - 1;
    if (covered || edge) { quadAt(P, 'gilt_bronze', x0, y0, x0 + tw, y0 + th, T0); continue; }
    const sh = new Shape(); sh.moveTo(x0, y0); sh.lineTo(x0 + tw, y0); sh.lineTo(x0 + tw, y0 + th); sh.lineTo(x0, y0 + th); sh.lineTo(x0, y0);
    const q = quatrefoil(cx, cy, Math.min(tw, th) * 0.4, ((i * 7 + j * 3) % 5) * 0.03);
    const hole = new Path(); hole.moveTo(q[0][0], q[0][1]); for (let k = 1; k < q.length; k++) hole.lineTo(q[k][0], q[k][1]); hole.lineTo(q[0][0], q[0][1]);
    sh.holes.push(hole);
    addGeo(P, 'gilt_bronze', dropBack(new ExtrudeGeometry(sh, { depth: T0, bevelEnabled: false, curveSegments: 1 })));
  }
}
/** the double frame (a rolled rim) and the nail heads at the corners and the middle of the top and bottom */
function frame(P, Wn, Hn, lod) {
  if (lod < 2) { quadAt(P, 'bronze', -Wn / 2, -Hn / 2, Wn / 2, Hn / 2, 0.001); return; }
  const B = P.s('bronze'), I = P.s('iron'), w = Wn / 2 - 0.008, h = Hn / 2 - 0.008, r = 0.0075;
  const bar = (a, b) => { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.2)); tube(B, [[a[0], a[1], T0 + 0.001, r, r], [b[0], b[1], T0 + 0.001, r, r]], { seg: 4, sub: n, cap: [1, 1], capN: 1, ref: [0, 0, 1] }); };
  bar([-w, -h], [w, -h]); bar([w, -h], [w, h]); bar([w, h], [-w, h]); bar([-w, h], [-w, -h]);
  if (lod < 2) return;
  for (const [u, v] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1], [0, -1]]) blob(I, [u * (Wn / 2 - 0.026), v * (Hn / 2 - 0.026), T0 + 0.004], [0.008, 0.008, 0.005], 2, 6);
}

// ── the twelve designs, in the frame of a plaque 0.4 × 0.5 (u right, v up from the centre) ───────────────────────
const gy = (Hn) => -Hn / 2 + 0.045;
const DESIGNS = [
  // 0: the Oba frontal with two attendants holding his arms
  (P, Wn, Hn, lod) => { const g = gy(Hn), a = { lod }, m = man(P, 0, g, 0.37, { type: 'oba', hat: 'crown', legs: 'fish', arms: 'held', hold: 'ada', side: 1, ...a });
    for (const s of [-1, 1]) man(P, s * 0.145, g, 0.2, { type: 'page', hat: 'cap', arms: 'down', legs: 'kneel', reach: { [-s]: [m['wrist' + s][0] - s * 0.01, m['wrist' + s][1], 0.02] }, ...a });
    return; },
  // 1: the Oba with the ada and two shield-bearers
  (P, Wn, Hn, lod) => { const g = gy(Hn);
    man(P, 0, g, 0.37, { type: 'oba', hat: 'crown', legs: 'stand', arms: 'down', hold: 'ada', side: 1, lod });
    for (const s of [-1, 1]) man(P, s * 0.15, g, 0.22, { type: 'page', hat: 'helmet', arms: 'shield', hold: 'shield', side: -s, lod });
    return; },
  // 2: a war chief with spear and bell, two spearmen
  (P, Wn, Hn, lod) => { const g = gy(Hn);
    man(P, 0, g, 0.37, { type: 'chief', hat: 'helmet', arms: 'spear', hold: 'spear', side: 1, lod });
    for (const s of [-1, 1]) man(P, s * 0.15, g, 0.2, { type: 'page', hat: 'cap', arms: 'spear', hold: 'bell', side: s, lod });
    return; },
  // 3: two warriors with spears, a great bell between them
  (P, Wn, Hn, lod) => { const g = gy(Hn);
    for (const s of [-1, 1]) man(P, s * 0.11, g, 0.3, { type: 'chief', hat: 'helmet', arms: 'spear', hold: 'spear', side: -s, lod });
    const B = P.s('gilt_bronze'); tube(B, [[0, 0.17, T0 + 0.02, 0.01, 0.01], [0, 0.1, T0 + 0.03, 0.03, 0.03], [0, 0.0, T0 + 0.03, 0.058, 0.058]], { seg: 8, sub: 2, cap: [1, 0], ref: [0, 0, 1] });
    tube(B, [[0, 0.17, T0 + 0.02, 0.01, 0.01], [0, 0.22, T0 + 0.02, 0.008, 0.008]], { seg: 4, sub: 1, ref: [0, 0, 1] });
    return; },
  // 4: a leopard
  (P, Wn, Hn, lod) => { leopard(P, 0.01, gy(Hn) + 0.03, 0.2, { lod, dep: 0.4 }); },
  // 5: a Portuguese soldier with his matchlock
  (P, Wn, Hn, lod) => { const g = gy(Hn);
    man(P, 0, g, 0.38, { type: 'portuguese', hat: 'morion', arms: 'gun', hold: 'gun', side: 1, lod });
    man(P, -0.15, g, 0.18, { type: 'page', hat: 'cap', arms: 'down', hold: 'manilla', side: 1, lod });
    return; },
  // 6: two Portuguese in their hats, a manilla between them
  (P, Wn, Hn, lod) => { const g = gy(Hn) + 0.06;
    for (const s of [-1, 1]) man(P, s * 0.1, g, 0.3, { type: 'portuguese', hat: 'brim', arms: 'down', hold: s < 0 ? 'manilla' : undefined, side: 1, lod });
    return; },
  // 7: two mudfish crossing
  (P, Wn, Hn, lod) => { mudfish(P, 0, 0.08, 0.3, 0.45, 0.4, { lod }); mudfish(P, 0, -0.08, 0.3, -0.45, 0.4, { lod }); },
  // 8: a horn blower and a bell boy
  (P, Wn, Hn, lod) => { const g = gy(Hn);
    man(P, -0.03, g, 0.37, { type: 'chief', hat: 'cap', arms: 'horn', hold: 'horn', side: 1, lod });
    man(P, 0.14, g, 0.2, { type: 'page', hat: 'cap', arms: 'down', hold: 'bell', side: 1, lod });
    return; },
  // 9: the Oba between two leopards
  (P, Wn, Hn, lod) => { const g = gy(Hn);
    man(P, 0, g + 0.05, 0.33, { type: 'oba', hat: 'crown', legs: 'stand', arms: 'held', side: 1, lod });
    for (const s of [-1, 1]) leopard(P, s * 0.115, g, 0.085, { lod, dep: 0.4, dir: -s });
    return; },
  // 10: a warrior with sword and shield and a boy with a spear
  (P, Wn, Hn, lod) => { const g = gy(Hn);
    man(P, 0, g, 0.38, { type: 'chief', hat: 'helmet', arms: 'shield', hold: 'shield', side: -1, lod });
    man(P, 0.16, g, 0.22, { type: 'page', hat: 'cap', arms: 'spear', hold: 'spear', side: 1, lod });
    return; },
  // 11: two leopards face to face
  (P, Wn, Hn, lod) => { const g = gy(Hn);
    leopard(P, 0.0, g + 0.17, 0.19, { lod, dep: 0.4, dir: 1 });
    leopard(P, 0.0, g, 0.19, { lod, dep: 0.4, dir: -1 });
    return; },
];
export const DESIGN_COUNT = DESIGNS.length;

/**
 * A brass plaque at (x, y, z) on a surface looking toward `face`, w × h: the design is picked by the hash of its own place (twelve designs), built at the level
 * of detail given by the distance from the way in (lod 2 full, 1 reduced, 0 a minimal panel). Returns the design's number.
 */
export function reliefPlaque(ctx, x, y, z, face, seed, w = 0.4, h = 0.5, lod = 2, force = -1) {
  const k = Math.min(w / 0.4, h / 0.5), Wn = w / k, Hn = h / k, kind = force >= 0 ? force : Math.floor(hash3(x * 1.3, y * 1.7, z * 1.1, seed) * DESIGNS.length) % DESIGNS.length;
  const P = new Pack(faceFrame(x, y, z, face, k), true);
  if (lod === 0) {
    quadAt(P, 'bronze', -Wn / 2, -Hn / 2, Wn / 2, Hn / 2, 0.001); quadAt(P, 'gilt_bronze', -Wn / 2 + 0.012, -Hn / 2 + 0.012, Wn / 2 - 0.012, Hn / 2 - 0.012, T0);
    blob(P.s('bronze'), [0, -0.01, T0], [0.1, 0.17, 0.025], 3, 5);
  } else {
    DESIGNS[kind](P, Wn, Hn, lod === 2 ? 0 : 1);
    field(P, Wn, Hn, P.masks, lod); frame(P, Wn, Hn, lod);
  }
  P.emit(ctx.bag, [x, y, z], 1 + (hash3(x, y, z, 7) - 0.5) * 0.03);
  return kind;
}
