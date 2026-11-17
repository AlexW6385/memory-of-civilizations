// Small builders the Benin style shares (docs/settlements/benin-city.md §3, §5): red clay walls ridged in bands, lean-to and gabled
// roofs of palm thatch and shingle, posts sheathed in brass with plaques nailed to them, the clay altar with its heads and tusks.
import { box, frustum, lathe, rod } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const WALLS = ['tuff_red', 'stucco_red', 'tuff_red', 'scoria_red'];
export const wallMat = (rand) => WALLS[Math.floor(rand() * WALLS.length)];
/** A box on a plan rectangle: world rect, y0..y1; solid adds the collider. */
export const B = ({ bag, col }, mat, r, y0, y1, solid = false) => { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); };

/** A wall on the centre line a→b with openings [{ at, w, h }] and, on both faces, ridges in bands (the clay's fluting). */
export function clayWall(ctx, a, b, th, y0, y1, mat, openings = [], ridges = true) {
  const { bag, col } = ctx, Ln = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / Ln, uz = (b[1] - a[1]) / Ln;
  const ops = openings.map((o) => ({ ...o, s0: o.at - o.w / 2, s1: o.at + o.w / 2 })).sort((p, q) => p.s0 - q.s0);
  const piece = (s0, s1, ya, yb, rid) => {
    if (s1 - s0 < 1e-3 || yb - ya < 1e-3) return;
    const p0 = [a[0] + ux * s0, a[1] + uz * s0], p1 = [a[0] + ux * s1, a[1] + uz * s1];
    bag.add(mat, orientedBox(p0, p1, th, ya, yb)); col.segment(p0, p1, th, ya, yb);
    if (ridges && rid) for (let y = ya + 0.7; y < yb - 0.25; y += 0.62) bag.add(mat, orientedBox(p0, p1, th + 0.1, y, y + 0.13));
  };
  let s = 0;
  for (const o of ops) { piece(s, o.s0, y0, y1, true); piece(o.s0, o.s1, y0 + o.h, y1, false); s = o.s1; }
  piece(s, Ln, y0, y1, true);
}
/** The thatch or shingle of a gabled roof over rect, the ridge along x or z, eaves over by `over`. */
export function gable(ctx, rect, y, rise, mat, ridge = 'x', over = 0.5) {
  const [x0, z0, x1, z1] = rect, w = ridge === 'x' ? z1 - z0 : x1 - x0, r = [x0 - over, z0 - over, x1 + over, z1 + over], ins = (w + 2 * over) / 2;
  ctx.bag.add(mat, frustum(r, y, y + rise, ridge === 'x' ? 0 : ins, ridge === 'x' ? 0 : ins, ridge === 'x' ? ins : 0, ridge === 'x' ? ins : 0, { noBottom: true }));
}
/**
 * Courses of shingle laid over a roof frustum: the roof is (rect, y0 → y1, ins = [xn, xp, zn, zp] the insets of its top). Each course is a thin
 * wedge with a thick butt (0.09 m) that tapers to the roof's own surface, so the slope reads as rows of overlapping shingles with a shadow line
 * under each. `step` is the course's height along the slope's rise; seed varies the lip by a millimetre so the courses merge, not instance.
 */
export function courses(ctx, rect, y0, y1, ins, mat, step = 0.42, butt = 0.09) {
  const [x0, z0, x1, z1] = rect, H = y1 - y0, n = Math.max(2, Math.round(H / step)), e = [0, 0, 0, 0];
  for (let i = 1; i < n; i++) {
    const t0 = i / n, t1 = (i + 1) / n, dt = t1 - t0, m = (i % 3) * 0.001;
    const a = ins.map((v) => v * t0);
    const r = [x0 + a[0] - butt - m, z0 + a[2] - butt - m, x1 - a[1] + butt + m, z1 - a[3] + butt + m];
    const q = ins.map((v, k) => (v ? v * dt : 0) + (v ? butt - 0.02 : butt - 0.02));
    void e;
    ctx.bag.add(mat, frustum(r, y0 + H * t0 - 0.02, y0 + H * t1, q[0], q[1], q[2], q[3], { noBottom: true }));
  }
}
/** A row of upright crest tiles along a ridge from a to b at height y (the cap of a Benin roof). */
export function crest(ctx, x0, x1, z, y, mat = 'roof_ridge', gap = 0.9, h = 0.38) {
  for (let x = x0 + 0.3; x < x1 - 0.2; x += gap) ctx.bag.add(mat, box(x - 0.2, y, z - 0.16, x + 0.2, y + h, z + 0.16));
}
/** A lean-to over rect with its low edge on `low` ('xn' | 'xp' | 'zn' | 'zp'), from yLow up to yHigh; a ceiling of timber below. */
export function lean(ctx, rect, low, yLow, yHigh, mat, over = 0.4, ceil = true) {
  const [x0, z0, x1, z1] = rect, ins = [0, 0, 0, 0], k = { xn: 0, xp: 1, zn: 2, zp: 3 }[low];
  ins[k] = k < 2 ? x1 - x0 + 2 * over : z1 - z0 + 2 * over;
  ctx.bag.add(mat, frustum([x0 - over, z0 - over, x1 + over, z1 + over], yLow, yHigh, ...ins, { noBottom: true }));
  if (ceil) ctx.bag.add('timber', box(x0 - over, yLow - 0.08, z0 - over, x1 + over, yLow, z1 + over));
}
/** A hipped roof of rect, pitched `rise` (a pyramid when square). */
export function hip(ctx, rect, y, rise, mat, over = 0.5) {
  const [x0, z0, x1, z1] = rect, w = x1 - x0 + 2 * over, d = z1 - z0 + 2 * over, i = Math.min(w, d) / 2 - 0.05;
  ctx.bag.add(mat, frustum([x0 - over, z0 - over, x1 + over, z1 + over], y, y + rise, i, i, i, i, { noBottom: true }));
}
/** A tall pillar sheathed in cast brass: post of radius r from y to y+h, a carved collar and capital. */
export function pillar(ctx, x, z, y, h, r = 0.21, mat = 'bronze') {
  const { bag, col } = ctx;
  // the sheath is cast with two raised twisted bands low down and two high up (the engraved and moulded cast copper of Dapper's pillars), clear of the plaques
  const prof = [[r * 1.25, 0], [r * 1.25, 0.12], [r, 0.2]];
  if (h > 2.6) for (const yb of [0.5, 0.64, h * 0.74, h * 0.74 + 0.16]) prof.push([r, yb - 0.025], [r * 1.12, yb - 0.012], [r * 1.12, yb + 0.012], [r, yb + 0.025]);
  prof.push([r, h - 0.3], [r * 1.2, h - 0.2], [r * 1.35, h - 0.1], [r * 1.35, h], [0.001, h]);
  bag.add(mat, lathe(prof, 10, null, x, y, z));
  bag.add('wood_dark', lathe([[r * 1.45, 0], [r * 1.45, 0.14], [0.001, 0.14]], 8, null, x, y - 0.14, z));
  col.circle(x, z, r * 1.3, y, y + h);
}
/**
 * A brass plaque nailed to a pillar or wall, its face toward 'n' | 's' | 'e' | 'w' at (x, z) on the surface, centre height y. A gilt field in a
 * double frame with nail heads at the corners and river leaves (quatrefoils of pointed leaves) between the figures, which stand in relief
 * in three depths, the heads highest (the Benin plaques: figures on a field of river leaves and stippling; heads in the highest relief,
 * a third of the body; the Oba on his mudfish legs with two attendants; war chiefs; Portuguese in brimmed hats with manillas; leopards;
 * British Museum Af1898,0115.26 and Art Institute of Chicago, in docs/settlements/benin-city.md §12). The composition is chosen by seed.
 */
export function plaque(ctx, x, y, z, face, seed, w = 0.4, h = 0.5) {
  const { bag } = ctx, rand = rng(seed), t = 0.018;
  const dir = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[face], al = [-dir[1], dir[0]];
  const P = (u, v, d) => [x + al[0] * u + dir[0] * d, y + v, z + al[1] * u + dir[1] * d];
  const slab = (u0, v0, u1, v1, d0, d1, m = 'bronze') => {
    const a = P(u0, v0, d0), b = P(u1, v1, d1), r = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])];
    if (r[2] - r[0] < 1e-3) { r[0] -= 0.002; r[2] += 0.002; }
    if (r[3] - r[1] < 1e-3) { r[1] -= 0.002; r[3] += 0.002; }
    bag.add(m, box(r[0], Math.min(a[1], b[1]), r[1], r[2], Math.max(a[1], b[1]), r[3]));
  };
  const lim = (u0, v0, u1, v1, d0, d1, m) => slab(u0, v0, u1, v1, d0, d1, m);
  const bar = (u0, v0, u1, v1, r, d, m = 'bronze') => { const a = P(u0, v0, d), b = P(u1, v1, d); bag.add(m, rod(a, b, r, 4)); };
  // the field, the double frame (an outer rim and an inner fillet), the nail heads
  slab(-w / 2, -h / 2, w / 2, h / 2, 0, t, 'gilt_bronze');
  for (const [u0, v0, u1, v1] of [[-w / 2, -h / 2, w / 2, -h / 2 + 0.03], [-w / 2, h / 2 - 0.03, w / 2, h / 2], [-w / 2, -h / 2, -w / 2 + 0.03, h / 2], [w / 2 - 0.03, -h / 2, w / 2, h / 2]]) slab(u0, v0, u1, v1, t, t + 0.014, 'bronze');
  for (const [u0, v0, u1, v1] of [[-w / 2 + 0.045, -h / 2 + 0.045, w / 2 - 0.045, -h / 2 + 0.05], [-w / 2 + 0.045, h / 2 - 0.05, w / 2 - 0.045, h / 2 - 0.045]]) slab(u0, v0, u1, v1, t, t + 0.006, 'bronze');
  for (const [u, v] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1], [0, -1]]) { const nu = u * (w / 2 - 0.015), nv = v * (h / 2 - 0.015); slab(nu - 0.005, nv - 0.005, nu + 0.005, nv + 0.005, t + 0.014, t + 0.02, 'iron'); }
  // river leaves: four pointed leaves crossing at a heart, three clusters (rods lying in the field)
  const leaves = (cu, cv, s) => { for (const [du, dv] of [[1, 0], [0, 1], [0.7, 0.7], [0.7, -0.7]]) bar(cu - du * s, cv - dv * s, cu + du * s, cv + dv * s, 0.0055, t + 0.004); slab(cu - 0.007, cv - 0.007, cu + 0.007, cv + 0.007, t + 0.004, t + 0.012); };
  const kind = (seed >>> 0) % 20, K = kind < 10 ? 0 : kind < 14 ? 1 : kind < 17 ? 2 : 3;
  const g = h * 0.5, base = -h * 0.4;                          // unit and ground line
  // one standing, seated or kneeling figure: u its axis, vb its feet, k its scale (1 = 0.8 of the plaque's height)
  const person = (u, vb, k, o = {}) => {
    const H = h * 0.8 * k, V = (f) => vb + H * f, W = (f) => H * f;
    const d1 = t + 0.004, d2 = t + 0.009, d3 = t + 0.013;      // gilt parts stay below 0.04 m (the ridges of a clay wall stand 0.05 m proud)
    // legs: the Oba's on mudfish (two curving rods ending in the fish heads), others plain and kneeling or standing
    if (o.legs === 'mudfish') for (const s of [-1, 1]) { bar(u + s * W(0.05), V(0.3), u + s * W(0.2), V(0.04), W(0.028), d2); slab(u + s * W(0.2) - W(0.045), V(0), u + s * W(0.2) + W(0.045), V(0.05), d2, d3); }
    else if (o.legs === 'kneel') { slab(u - W(0.16), V(0.02), u + W(0.16), V(0.13), d1, d2); for (const s of [-1, 1]) bar(u + s * W(0.06), V(0.3), u + s * W(0.1), V(0.06), W(0.034), d2); }
    else for (const s of [-1, 1]) { slab(u + s * W(0.06) - W(0.03), V(0), u + s * W(0.06) + W(0.03), V(0.3), d1, d2); slab(u + s * W(0.06) - W(0.05), V(0), u + s * W(0.06) + W(0.04) * s, V(0.04), d1, d2); }
    // the wrapper (a gilt-banded skirt), the tunic, the beaded collar, the arms
    slab(u - W(0.15), V(0.27), u + W(0.15), V(0.5), d1, d2); if (k > 0.8) for (const f of [0.31, 0.38, 0.45]) slab(u - W(0.15), V(f), u + W(0.15), V(f) + W(0.018), d2, d2 + 0.004, 'gilt_bronze');
    slab(u - W(0.11), V(0.5), u + W(0.11), V(0.68), d1, d2);
    if (k > 0.8) for (let i = 0; i < 4; i++) slab(u - W(0.11) + i * W(0.055), V(0.5), u - W(0.11) + i * W(0.055) + W(0.02), V(0.68), d2, d2 + 0.004, 'gilt_bronze');
    slab(u - W(0.15), V(0.66), u + W(0.15), V(0.74), d2, d3); if (k > 0.8) for (const f of [0.69, 0.72]) slab(u - W(0.15), V(f), u + W(0.15), V(f) + W(0.01), d3, d3 + 0.004, 'gilt_bronze');
    for (const s of [-1, 1]) bar(u + s * W(0.12), V(0.64), u + s * W(0.2), V(o.arms === 'up' ? 0.9 : 0.42), W(0.024), d2);
    // the head, large (a third of the figure) and in the highest relief, with its headdress
    slab(u - W(0.08), V(0.74), u + W(0.08), V(0.9), d2, d3 + 0.012);
    slab(u - W(0.012), V(0.78), u + W(0.012), V(0.84), d3 + 0.012, d3 + 0.02);
    if (o.hat === 'crown') { slab(u - W(0.095), V(0.9), u + W(0.095), V(1.04), d2, d3 + 0.004, 'gilt_bronze'); slab(u + W(0.095), V(0.97), u + W(0.14), V(1.0), d3, d3 + 0.01); for (const s of [-1, 0, 1]) slab(u + s * W(0.05) - W(0.012), V(1.04), u + s * W(0.05) + W(0.012), V(1.07), d3, d3 + 0.012); }
    else if (o.hat === 'helmet') { slab(u - W(0.09), V(0.9), u + W(0.09), V(1.0), d2, d3 + 0.004, 'gilt_bronze'); bar(u, V(1.0), u + W(0.03), V(1.12), W(0.012), d3); }
    else if (o.hat === 'brim') { slab(u - W(0.17), V(0.9), u + W(0.17), V(0.935), d2, d3 + 0.016); slab(u - W(0.07), V(0.935), u + W(0.07), V(1.03), d2, d3 + 0.014); }
    // what the figure carries: the ceremonial sword (a broad blade), a shield, a manilla, a spear
    const fl = o.flip ?? 1;                                    // the side the carried thing is on (the attendants hold theirs toward the middle)
    if (o.hold === 'ada') { slab(u + fl * W(0.2), V(0.3), u + fl * W(0.235), V(0.9), d2, d2 + 0.012); slab(Math.min(u + fl * (W(0.2) - W(0.03)), u + fl * (W(0.235) + W(0.12))), V(0.9), Math.max(u + fl * (W(0.2) - W(0.03)), u + fl * (W(0.235) + W(0.12))), V(1.04), d2, d2 + 0.008, 'gilt_bronze'); }
    if (o.hold === 'shield') { slab(u - fl * W(0.5), V(0.36), u - fl * W(0.2), V(0.9), d2, d3 + 0.004, 'gilt_bronze'); slab(u - fl * W(0.44), V(0.5), u - fl * W(0.26), V(0.78), d3 + 0.004, d3 + 0.012); }
    if (o.hold === 'spear') bar(u + fl * W(0.26), V(0), u + fl * W(0.26), V(1.15), W(0.012), d2);
    if (o.hold === 'manilla') { const m = [u + W(0.22), V(0.3), u + W(0.5), V(0.55)]; for (const [a, b, c, e] of [[m[0], m[1], m[2], m[1] + 0.012], [m[0], m[3] - 0.012, m[2], m[3]], [m[0], m[1], m[0] + 0.012, m[3]], [m[2] - 0.012, m[1], m[2], m[3]]]) slab(a, b, c, e, d2, d3); }
  };
  if (K === 0) {                                              // the Oba with his two attendants
    person(0, base, 1.0, { legs: 'mudfish', hat: 'crown', hold: 'ada' });
    for (const s of [-1, 1]) person(s * w * 0.34, base, 0.6, { legs: 'kneel', hat: 'crown', arms: 'up' });
    leaves(-w * 0.34, h * 0.32, 0.03); leaves(w * 0.34, h * 0.32, 0.03); leaves(0, -h * 0.03 + h * 0.44, 0.022);
  } else if (K === 1) {                                       // a war chief with sword and shield, two shield-bearers
    person(0, base, 1.0, { legs: 'stand', hat: 'helmet', hold: 'ada' });
    for (const s of [-1, 1]) person(s * w * 0.35, base, 0.6, { legs: 'stand', hat: 'helmet', hold: 'shield', flip: s });
    leaves(-w * 0.34, h * 0.34, 0.028); leaves(w * 0.34, h * 0.34, 0.028);
  } else if (K === 2) {                                       // a Portuguese in his brimmed hat, a manilla in his hand; two boys holding manillas
    person(0, base, 1.0, { legs: 'stand', hat: 'brim', hold: 'manilla' });
    for (const s of [-1, 1]) { const u = s * w * 0.36, r = [u - 0.034, base + h * 0.5, u + 0.034, base + h * 0.5 + 0.068]; for (const [a, b, c, e] of [[r[0], r[1], r[2], r[1] + 0.01], [r[0], r[3] - 0.01, r[2], r[3]], [r[0], r[1], r[0] + 0.01, r[3]], [r[2] - 0.01, r[1], r[2], r[3]]]) slab(a, b, c, e, t, t + 0.016); }
    leaves(-w * 0.34, h * 0.32, 0.026); leaves(w * 0.34, h * 0.32, 0.026);
  } else {                                                    // two leopards face to face, spotted, their tails three-pronged
    for (const s of [-1, 1]) {
      const u0 = s * w * 0.04, bv = -h * 0.12, L = w * 0.32;                     // body from the middle outward
      slab(Math.min(u0, u0 + s * L), bv, Math.max(u0, u0 + s * L), bv + h * 0.2, t, t + 0.012);
      slab(u0 - s * 0.004, bv + h * 0.2, u0 + s * w * 0.1, bv + h * 0.31, t, t + 0.02);                 // the head toward the middle
      for (const f of [0.28, 0.56, 0.84]) slab(u0 + s * L * f - 0.012, bv + h * 0.06, u0 + s * L * f + 0.012, bv + h * 0.1, t + 0.012, t + 0.017, 'gilt_bronze');
      for (const f of [0.18, 0.42, 0.7]) slab(u0 + s * L * f - 0.012, bv + h * 0.13, u0 + s * L * f + 0.012, bv + h * 0.17, t + 0.012, t + 0.017, 'gilt_bronze');
      for (const f of [0.1, 0.9]) slab(u0 + s * L * f - 0.014, bv - h * 0.2, u0 + s * L * f + 0.014, bv, t, t + 0.012);
      for (const k of [-1, 0, 1]) bar(u0 + s * L, bv + h * 0.16, u0 + s * (L + 0.035), bv + h * 0.16 + k * 0.04, 0.007, t + 0.01);
    }
    leaves(0, h * 0.3, 0.03); leaves(-w * 0.32, h * 0.33, 0.024); leaves(w * 0.32, h * 0.33, 0.024); leaves(0, -h * 0.36, 0.022);
  }
  void rand; void lim;
}
/**
 * The commemorative head of an Oba (the Met 1979.206.86, the Cleveland head, the Art Institute's: a round face of regular features, a cap of coral beads
 * in a lattice with strands hanging at the temples and a bead down the brow to the nose, many rings of coral beads in a collar rising to the chin,
 * on a flared base, a hole in the crown for the carved tusk). Built as a mid-period head (collar to the lip, heavier walls) facing `rot`
 * (0 = +z; sin, cos), with the tusk, whose face is carved in bands, set in its top.
 */
export function head(ctx, x, y, z, rot, seed, tusk = true) {
  const { bag } = ctx, rand = rng(seed);
  const put = (m, g) => { g.rotateY(rot); g.translate(x, y, z); bag.add(m, g); };
  // the flared base with its rim, then the collar: stacked rings of coral beads narrowing a little toward the top
  put('bronze', lathe([[0.21, 0], [0.21, 0.035], [0.18, 0.05], [0.17, 0.07], [0.001, 0.07]], 12));
  const col = [[0.17, 0.07]];
  for (let i = 0; i < 6; i++) { const y0 = 0.07 + i * 0.04, r = 0.185 - i * 0.008; col.push([r + 0.018, y0 + 0.012], [r + 0.026, y0 + 0.022], [r + 0.018, y0 + 0.032], [r, y0 + 0.04]); }
  col.push([0.15, 0.32], [0.001, 0.32]);
  put('wall_red', lathe(col, 12));
  // the face: an egg of cast brass, the brow ridge, nose, lips, ears; the eyes of iron
  put('bronze', lathe([[0.001, 0.3], [0.085, 0.305], [0.12, 0.35], [0.13, 0.4], [0.125, 0.45], [0.11, 0.5], [0.001, 0.52]], 12));
  const fx = (m, b) => put(m, b);
  fx('bronze', box(-0.125, 0.455, 0.075, 0.125, 0.475, 0.12));                     // the brow
  fx('bronze', box(-0.02, 0.37, 0.115, 0.02, 0.46, 0.15)); fx('bronze', box(-0.045, 0.365, 0.105, 0.045, 0.385, 0.13));   // the nose and its wings
  fx('bronze', box(-0.05, 0.325, 0.095, 0.05, 0.345, 0.125)); fx('bronze', box(-0.04, 0.345, 0.1, 0.04, 0.358, 0.12));       // the lips
  for (const s of [-1, 1]) { fx('iron', box(s * 0.065 - 0.02, 0.425, 0.108, s * 0.065 + 0.02, 0.445, 0.122)); fx('bronze', box(s * 0.128, 0.395, -0.03, s * 0.14, 0.45, 0.04)); }
  // the cap: a dome of beads, banded, with the lattice (diamonds of beads) over it, the strands at the temples, the bead down the brow
  put('wall_red', lathe([[0.13, 0.485], [0.145, 0.5], [0.15, 0.54], [0.135, 0.58], [0.09, 0.61], [0.001, 0.62]], 12));
  put('gilt_bronze', lathe([[0.148, 0.49], [0.153, 0.5], [0.153, 0.512], [0.148, 0.52], [0.001, 0.52]], 12));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, c = Math.cos(a), s = Math.sin(a); put('gilt_bronze', rod([c * 0.153, 0.52, s * 0.153], [c * 0.145, 0.575, s * 0.145], 0.007, 4)); }
  for (const s of [-1, 1]) for (const f of [0.0, 0.5]) put('wall_red', rod([s * (0.135 + f * 0.012), 0.5 - f * 0.05, 0.02 + f * 0.01], [s * (0.14 + f * 0.012), 0.36, 0.015 + f * 0.01], 0.011, 5));
  put('wall_red', rod([0, 0.585, 0.12], [0, 0.49, 0.145], 0.01, 4));
  // the socket of the tusk: a short collar of brass rising from the crown
  put('bronze', lathe([[0.075, 0.6], [0.075, 0.62], [0.055, 0.66], [0.001, 0.66]], 10));
  if (tusk) {
    const h = 1.0 + rand() * 0.3, pts = [], k = [Math.cos(rot), -Math.sin(rot)];
    for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push([x + k[0] * u * u * 0.3, y + 0.64 + u * h, z + k[1] * u * u * 0.3]); }
    for (let i = 0; i < 8; i++) {
      const r = 0.05 - i * 0.0045;
      bag.add('ivory', rod(pts[i], pts[i + 1], r, 6));
      // the carving: raised bands round the tusk in two courses of a pattern, a band of bronze at the foot
      if (i % 2 === 1) bag.add('ivory', rod(pts[i], [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * 0.35, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * 0.35, pts[i][2] + (pts[i + 1][2] - pts[i][2]) * 0.35], r + 0.011, 6));
    }
    bag.add('bronze', rod(pts[0], pts[1], 0.056, 6));
  }
}
/**
 * The brass bird on a spire (Dapper: "casted copper birds" on the little spired towers; the bird of the plaques and of the turret tops has its
 * wings spread): a plump body, a neck with a small head and a pointed beak looking to -z, a fan of three tail feathers behind, and each wing a
 * leading edge and a fan of five feathers swept back, rising a little at the tips. s: scale (1 = about 1.1 m across the wings).
 */
export function bird(ctx, x, y, z, s = 1, rot = 0, mat = 'bronze') {
  const { bag } = ctx, put = (g) => { g.rotateY(rot); g.translate(x, y, z); bag.add(mat, g); };
  const R = (a, b, r, n = 4) => put(rod([a[0] * s, a[1] * s, a[2] * s], [b[0] * s, b[1] * s, b[2] * s], r * s, n));
  const body = lathe([[0.001, -0.24], [0.08, -0.17], [0.115, -0.02], [0.1, 0.14], [0.05, 0.27], [0.001, 0.31]], 8); body.rotateX(Math.PI / 2); body.scale(s, s, s); body.translate(0, 0.17 * s, 0); put(body);
  R([0, 0.2, -0.16], [0, 0.31, -0.3], 0.05, 5);
  { const hd = lathe([[0.001, -0.06], [0.06, -0.03], [0.065, 0.02], [0.001, 0.06]], 7); hd.scale(s, s, s); hd.translate(0, 0.33 * s, -0.33 * s); put(hd); }
  R([0, 0.33, -0.38], [0, 0.29, -0.52], 0.02);
  for (const k of [-1, 0, 1]) R([0, 0.16, 0.25], [k * 0.07, 0.11, 0.6], 0.022);
  for (const sg of [-1, 1]) {
    R([sg * 0.08, 0.24, -0.1], [sg * 0.58, 0.3, -0.08], 0.026);                                   // the leading edge
    for (let i = 0; i < 5; i++) R([sg * 0.1, 0.23, -0.06 + i * 0.045], [sg * (0.56 - i * 0.04), 0.28 + i * 0.004, 0.08 + i * 0.1], 0.022);
  }
}
/**
 * A brass snake running down a face: a wavy body of short rods from (x, yTop, z) down h, along `al` the face's across-direction, standing
 * off `dir`; mat: the metal (new cast brass is bright, `gilt_bronze`), waves: how many turns, the head at the foot pointing down.
 */
export function snake(ctx, x, yTop, z, h, al, dir, amp = 0.35, r = 0.09, mat = 'bronze', waves = 4) {
  const pts = [], n = Math.max(14, Math.round(h * 3.2));
  for (let i = 0; i <= n; i++) { const t = i / n, u = Math.sin(t * Math.PI * waves) * amp; pts.push([x + al[0] * u + dir[0] * 0.1, yTop - t * h, z + al[1] * u + dir[1] * 0.1]); }
  for (let i = 0; i < n; i++) ctx.bag.add(mat, rod(pts[i], pts[i + 1], r * (1 - 0.55 * i / n), 6));
  const hd = pts[n]; ctx.bag.add(mat, lathe([[0.001, 0], [r * 1.5, 0.05], [r * 1.5, 0.25], [r * 0.8, 0.34], [0.001, 0.36]], 6, null, hd[0], hd[1] - 0.3, hd[2]));
}
/**
 * A royal ancestral altar (Wikipedia "Benin ancestral altars": royal altars are round, of white clay): a round platform of two steps in
 * white clay set against the back of `rect`, on it a half-circle of cast heads with carved tusks, the brass bell (eroro) at the front,
 * a row of rattle staffs (ukhurue) at the back. `facing` is the side the altar looks to; heads: how many heads.
 */
export function altar(ctx, rect, facing, seed, heads = 5) {
  const { bag, col } = ctx, rand = rng(seed), [x0, z0, x1, z1] = rect, w = x1 - x0, d = z1 - z0;
  const dir = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[facing], al = [-dir[1], dir[0]];
  const r = Math.max(0.7, Math.min(1.25, (facing === 's' || facing === 'n' ? w : d) / 2 - 0.2)), cx0 = (x0 + x1) / 2, cz0 = (z0 + z1) / 2;
  const back = Math.max(0, r - (facing === 's' || facing === 'n' ? d : w) / 2), cx = cx0 - dir[0] * back, cz = cz0 - dir[1] * back;
  bag.add('chalk', lathe([[r, 0], [r, 0.3], [r * 0.82, 0.3], [r * 0.82, 0.55], [0.001, 0.55]], 16, null, cx, 0, cz)); col.circle(cx, cz, r, 0, 0.6);
  const rot = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[facing], n = Math.max(1, heads);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (i / (n - 1) - 0.5) * 2.3, rr = r * 0.52;
    // a point at angle t from the back, on the circle of radius rr
    const px = cx - dir[0] * rr * Math.cos(t) + al[0] * rr * Math.sin(t) * 1.0, pz = cz - dir[1] * rr * Math.cos(t) + al[1] * rr * Math.sin(t) * 1.0;
    head(ctx, px, 0.55, pz, rot, seed * 7 + i, true);
  }
  for (let i = 0; i < 3; i++) { const o = (i - 1) * r * 0.55, bx = cx - dir[0] * r * 0.9 + al[0] * o, bz = cz - dir[1] * r * 0.9 + al[1] * o; bag.add('wood_dark', rod([bx, 0.5, bz], [bx, 1.7 - (i % 2) * 0.2, bz], 0.022, 5)); bag.add('bronze', lathe([[0.001, 0], [0.05, 0.02], [0.04, 0.12], [0.001, 0.16]], 6, null, bx, 1.7 - (i % 2) * 0.2, bz)); }
  const fx = cx + dir[0] * r * 0.6, fz = cz + dir[1] * r * 0.6;
  bag.add('bronze', lathe([[0.001, 0], [0.13, 0.02], [0.11, 0.2], [0.04, 0.3], [0.001, 0.32]], 8, null, fx, 0.55, fz));
  if (rand() < 0.5) bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.07, 0.15], [0.001, 0.2]], 7, null, fx + al[0] * 0.5, 0.55, fz + al[1] * 0.5));
}
export { box, frustum, lathe, rod, orientedBox };
