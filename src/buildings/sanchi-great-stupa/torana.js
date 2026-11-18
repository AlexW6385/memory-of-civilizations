// The Great Stupa's gateways (torana). docs/buildings/sanchi-great-stupa.md §4, §8 and docs/settlements/sanchi.md §18, §19:
// two square pillars, chamfered, on a plinth, carved in framed panels on all four faces, each capped by a lotus cushion, an
// abacus and four beasts back to back; three architraves of moulded section that rise toward their ends, their faces a
// continuous modelled relief of scenes and their ends rolled into spiral volutes; riders in the round between them; the wheel
// and a triratna above; the yakshis leaning from the pillars under the lowest beam, each with her mango tree.
// Detail by distance from the arrival (the way people come in from the south): lvl 2 the south gateway, 1 the others, 0 the small
// gateway of Stupa 3. Everything of one gateway goes into two geometries (sandstone_dressed, sandstone_rail), each in one piece.

import { lathe, rod } from '../../core/geom.js';
import { Soup, Relief, tube, bead, nets, Field, hash3, join } from './sculpt.js';
import { yakshi, lion, elephant, dwarf, horseRider } from './figures.js';
import { compose, person, tree, stupa as stupaScene, wheel } from './scenes.js';

const STONE = 'sandstone_dressed', RAIL = 'sandstone_rail';

/** A frame: a = along the gateway, d = out of it, y up. */
function frame(at, dir) {
  const u = [-dir[1], dir[0]];
  return { u, dir, at, p: (a, d, y) => [at[0] + u[0] * a + dir[0] * d, y, at[1] + u[1] * a + dir[1] * d] };
}
/** A triangle whose normal points away from `ref`. */
function tri(out, a, b, c, ref) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const mx = (a[0] + b[0] + c[0]) / 3 - ref[0], my = (a[1] + b[1] + c[1]) / 3 - ref[1], mz = (a[2] + b[2] + c[2]) / 3 - ref[2];
  if (nx * mx + ny * my + nz * mz < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
const centroid = (pts) => { const c = [0, 0, 0]; for (const p of pts) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; } return c.map((v) => v / pts.length); };
/** A solid swept through rings of equal point counts (star-shaped about their centres). */
function loft(out, rings, caps = true) {
  const n = rings[0].length, cs = rings.map(centroid);
  for (let i = 0; i + 1 < rings.length; i++) {
    const ref = [(cs[i][0] + cs[i + 1][0]) / 2, (cs[i][1] + cs[i + 1][1]) / 2, (cs[i][2] + cs[i + 1][2]) / 2];
    for (let j = 0; j < n; j++) {
      const a = rings[i][j], b = rings[i][(j + 1) % n], c = rings[i + 1][(j + 1) % n], d = rings[i + 1][j];
      tri(out, a, b, c, ref); tri(out, a, c, d, ref);
    }
  }
  if (caps) {
    const last = rings.length - 1;
    for (let j = 1; j + 1 < n; j++) { tri(out, rings[0][0], rings[0][j], rings[0][j + 1], cs[last]); tri(out, rings[last][0], rings[last][j], rings[last][j + 1], cs[0]); }
  }
}
/** A solid swept through the rings of a non-convex profile: every quad faces away from the profile's own inside (the winding is set once from the profile's area). */
function sweepRings(out, rings, outward) {
  const n = rings[0].length;
  // the first quad of the first segment on a face known to look along `outward` (point 3→4 is the face at +D)
  const probe = (i, j) => { const a = rings[i][j], b = rings[i][(j + 1) % n], d = rings[i + 1][j]; const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = d[0] - a[0], vy = d[1] - a[1], vz = d[2] - a[2]; return (uy * vz - uz * vy) * outward[0] + (uz * vx - ux * vz) * outward[1] + (ux * vy - uy * vx) * outward[2]; };
  const flip = probe(0, 2) < 0;
  for (let i = 0; i + 1 < rings.length; i++) for (let j = 0; j < n; j++) {
    const a = rings[i][j], b = rings[i][(j + 1) % n], c = rings[i + 1][(j + 1) % n], d = rings[i + 1][j];
    if (flip) out.push(...a, ...c, ...b, ...a, ...d, ...c); else out.push(...a, ...b, ...c, ...a, ...c, ...d);
  }
}
/** A convex outline [[a, y]] extruded from depth d0 to d1 in frame f. */
function slab(out, f, ol, d0, d1) {
  const m = ol.length, cu = ol.reduce((s, p) => s + p[0], 0) / m, cv = ol.reduce((s, p) => s + p[1], 0) / m, ref = f.p(cu, (d0 + d1) / 2, cv);
  for (let i = 1; i + 1 < m; i++) { tri(out, f.p(ol[0][0], d0, ol[0][1]), f.p(ol[i][0], d0, ol[i][1]), f.p(ol[i + 1][0], d0, ol[i + 1][1]), ref); tri(out, f.p(ol[0][0], d1, ol[0][1]), f.p(ol[i][0], d1, ol[i][1]), f.p(ol[i + 1][0], d1, ol[i + 1][1]), ref); }
  for (let i = 0; i < m; i++) {
    const a = ol[i], b = ol[(i + 1) % m];
    tri(out, f.p(a[0], d0, a[1]), f.p(b[0], d0, b[1]), f.p(b[0], d1, b[1]), ref); tri(out, f.p(a[0], d0, a[1]), f.p(b[0], d1, b[1]), f.p(a[0], d1, a[1]), ref);
  }
}
const RING = (cu, cv, rx, ry, m = 8) => Array.from({ length: m }, (_, i) => { const a = Math.PI * 2 * i / m; return [cu + Math.cos(a) * rx, cv + Math.sin(a) * ry]; });
const QUAD = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];

/** The mango tree behind a yakshi, in world points: trunk from the corbel, boughs, leaf masses and fruit. Into `rail`. */
function mangoTree(rail, base, crown, hand, lvl, seedAt) {
  const lerpP = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const wob = (p, k) => [p[0] + (hash3(p[0], k, 1) - 0.5) * 0.06, p[1], p[2] + (hash3(p[2], k, 2) - 0.5) * 0.06];
  const trunk = Array.from({ length: 8 }, (_, i) => wob(lerpP(base, crown, i / 7), i));
  rail.mesh(tube(trunk, (t) => 0.2 - 0.09 * t, lvl >= 2 ? 10 : 6));
  const bough = [lerpP(crown, hand, 0), lerpP(crown, hand, 0.35), lerpP(crown, hand, 0.7), hand].map((p, i) => wob(p, 10 + i));
  rail.mesh(tube(bough, (t) => 0.05 - 0.025 * t, 6));
  // the crown: leaf masses, the lower ones hanging, fruit on stalks
  const F = new Field();
  const cs = [[0, 0, 0, 0.3], [0.35, -0.1, 0.1, 0.24], [-0.35, -0.05, -0.05, 0.24], [0.1, 0.18, -0.2, 0.22], [0.15, -0.28, 0.2, 0.2], [-0.15, -0.3, -0.12, 0.2], [0.5, -0.32, -0.1, 0.16]];
  for (const [dx, dy, dz, r] of cs) F.ball([crown[0] + dx * 1.2, crown[1] + dy * 1.1 + 0.1, crown[2] + dz * 1.2], [r * 1.4, r * 0.85, r * 1.15], 0.07, { rz: hash3(dx, dy, dz) - 0.5 });
  const m = nets(F, F.box(0.03), lvl >= 2 ? 0.07 : 0.1);
  rail.mesh(m);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.7 + seedAt, p = [crown[0] + Math.cos(a) * 0.28, crown[1] - 0.2, crown[2] + Math.sin(a) * 0.2];
    rail.mesh(tube([p, [p[0], p[1] - 0.08, p[2]]], 0.006, 4));
    rail.mesh(bead([p[0], p[1] - 0.17, p[2]], 0.05, 6, 4));
  }
}

/**
 * A gateway at { at [x, z], dir (outward), y, s, kind: 'elephant' | 'lion' | 'dwarf' } into `bag0` (merged per material).
 * Its detail level follows from where it stands: the south gateway of the Great Stupa (kind 'lion', s ≥ 1) in full.
 */
export function torana(bag0, col, at, dir, y, s = 1, kind = 'elephant') {
  const lvl = s < 0.6 ? 0 : kind === 'lion' ? 2 : 1;
  const stone = new Soup(), rail = new Soup(), S = [], R = [];
  const f = frame(at, dir), { u } = f, W = 2.1 * s, P = 0.35 * s, H = 5.2 * s;
  const at2 = (k, d = 0) => [at[0] + u[0] * k + dir[0] * d, at[1] + u[1] * k + dir[1] * d];
  const sq = (a, d, hw, hd, ch, yy) => [[a - hw + ch, d - hd, yy], [a + hw - ch, d - hd, yy], [a + hw, d - hd + ch, yy], [a + hw, d + hd - ch, yy], [a + hw - ch, d + hd, yy], [a - hw + ch, d + hd, yy], [a - hw, d + hd - ch, yy], [a - hw, d - hd + ch, yy]].map(([a2, d2, y2]) => f.p(a2, d2, y2));
  const yawOf = (dx, dz) => Math.atan2(-dz, dx);
  // the cell of the grids, by level (metres on the stone)
  const cellBeast = lvl === 2 ? 0.036 : lvl === 1 ? 0.06 : 0.07, cellRider = lvl === 2 ? 0.06 : 0.08, cellYak = lvl === 2 ? 0.04 : 0.06, cellFrieze = lvl === 2 ? 0.032 : 0.05, cellPanel = lvl === 2 ? 0.032 : 0.055;

  // ---- the pillars ----
  for (const k of [-1, 1]) {
    const a = k * W, ch = 0.06 * s;
    loft(S, [sq(a, 0, P * 1.28, P * 1.28, 0.04 * s, y - 0.02), sq(a, 0, P * 1.28, P * 1.28, 0.04 * s, y + 0.2 * s)]);
    loft(S, [sq(a, 0, P * 1.14, P * 1.14, 0.04 * s, y + 0.2 * s), sq(a, 0, P * 1.14, P * 1.14, 0.04 * s, y + 0.42 * s)]);
    loft(S, [sq(a, 0, P, P, ch, y + 0.42 * s), sq(a, 0, P, P, ch, y + H - 0.5 * s)]);
    // the capital: a lotus cushion with petals, two abaci, the beasts back to back
    stone.geom(lathe([[P * 0.95, 0], [P * 1.2, 0.1 * s], [P * 1.45, 0.28 * s], [P * 1.5, 0.45 * s], [P * 1.0, 0.5 * s], [0.001, 0.5 * s]], 32, (th, i) => (i >= 1 && i <= 3 ? 1 + 0.07 * Math.abs(Math.cos(th * 8)) : 1), at2(a)[0], y + H - 0.5 * s, at2(a)[1]));
    loft(S, [sq(a, 0, P * 1.55, P * 1.55, 0.05 * s, y + H), sq(a, 0, P * 1.55, P * 1.55, 0.05 * s, y + H + 0.1 * s)]);
    loft(S, [sq(a, 0, P * 1.9, P * 1.9, 0.08 * s, y + H + 0.1 * s), sq(a, 0, P * 1.9, P * 1.9, 0.08 * s, y + H + 0.2 * s)]);
    const c = at2(a);
    for (const ax of [u, [-u[0], -u[1]], dir, [-dir[0], -dir[1]]]) {
      const yw = yawOf(ax[0], ax[1]), yy = y + H + 0.2 * s;
      if (kind === 'lion') rail.mesh(lion(cellBeast, 0.72 * s), { x: c[0] + ax[0] * 0.2 * s, y: yy, z: c[1] + ax[1] * 0.2 * s, yaw: yw, s: 0.72 * s });
      else if (kind === 'dwarf') rail.mesh(dwarf(cellBeast, 0.94 * s), { x: c[0] + ax[0] * 0.3 * s, y: yy, z: c[1] + ax[1] * 0.3 * s, yaw: yw, s: 0.94 * s });
      else rail.mesh(elephant(cellBeast, 0.62 * s, hash3(ax[0], ax[1], a) > 0.5), { x: c[0] + ax[0] * 0.3 * s, y: yy, z: c[1] + ax[1] * 0.3 * s, yaw: yw, s: 0.62 * s });
    }
    loft(S, [sq(a, 0, P * 1.7, P * 1.7, 0.06 * s, y + H + 1.05 * s), sq(a, 0, P * 1.7, P * 1.7, 0.06 * s, y + H + 1.2 * s)]);
    if (col) col.rect([c[0] - P, c[1] - P, c[0] + P, c[1] + P], y, y + H);
    // the panels on all four faces: a frame of four fillets and a modelled relief (the Bodhi tree, a stupa, the wheel, each with its worshippers)
    for (const face of [0, 1, 2, 3]) {
      const sg = face % 2 ? -1 : 1, onDir = face < 2, shaft = H - 0.5 * s - 0.42 * s, np = onDir ? 3 : 2, pit = shaft / np;
      const gf = onDir ? f : { u: dir, dir: [u[0] * sg, u[1] * sg], p: (a2, d2, y2) => [c[0] + dir[0] * a2 + u[0] * sg * d2, y2, c[1] + dir[1] * a2 + u[1] * sg * d2] };
      const ca = onDir ? a : 0, dep = onDir ? sg * P : P, out = onDir ? sg : 1, hw = P * 0.8, en = [gf.dir[0] * out, 0, gf.dir[1] * out], eu = [gf.u[0], 0, gf.u[1]];
      for (let pi = 0; pi < np; pi++) {
        const y0 = y + 0.42 * s + pi * pit + 0.1 * s, y1 = y + 0.42 * s + (pi + 1) * pit - 0.1 * s, e = 0.07 * s, ph = y1 - y0;
        for (const [ua, ub, va, vb] of [[-hw, hw, y0, y0 + e], [-hw, hw, y1 - e, y1], [-hw, -hw + e, y0, y1], [hw - e, hw, y0, y1]]) slab(R, gf, QUAD(ca + ua, va, ca + ub, vb), dep - out * 0.001 * s, dep + out * 0.03 * s);
        if (lvl === 0) continue;
        const Rl = new Relief(-hw + e, 0, hw - e, ph - 2 * e, cellPanel), iu = hw - e, ih = ph - 2 * e;
        const kind2 = onDir ? ['tree', 'stupa', 'wheel'][pi] : (pi ? 'tree' : 'stupa');
        const hh = ih * 0.62;
        if (kind2 === 'tree') tree(Rl, 0, ih * 0.34, hh * 0.85, true, 0.05); else if (kind2 === 'stupa') stupaScene(Rl, 0, ih * 0.34, hh * 0.85, 0.05); else wheel(Rl, 0, ih * 0.3, hh, 0.05);
        for (const g of [-1, 1]) { person(Rl, g * iu * 0.7, 0.03, ih * 0.3, -g, 'worship', 0.05, pi); }
        person(Rl, 0, 0.03, ih * 0.3, 1, 'bearer', 0.05, pi + 3);
        Rl.mesh(rail, (uu, vv, hg) => gf.p(ca + uu, dep + out * (hg + 0.001 * s), y0 + e + vv), eu, [0, 1, 0], en, { full: false });
      }
    }
  }
  // ---- the architraves ----
  const HB = 0.65 * s, D = 0.32 * s, half = 4.3 * s, rise = 0.3 * s, gapY = 1.35 * s, y1st = y + H + 1.2 * s, Dr = D - 0.04 * s, fb = 0.11 * s, fh = HB - 2 * fb;
  const yAt = (b, t) => y1st + b * gapY + rise * t * t;
  const prof = [[-D + 0.06 * s, 0], [D - 0.06 * s, 0], [D, 0.05 * s], [D, fb], [Dr - 0.01 * s, fb], [Dr - 0.01 * s, HB - fb], [D, HB - fb], [D, HB - 0.07 * s], [D - 0.04 * s, HB - 0.015 * s], [D - 0.1 * s, HB],
    [-D + 0.1 * s, HB], [-D + 0.04 * s, HB - 0.015 * s], [-D, HB - 0.07 * s], [-D, HB - fb], [-Dr + 0.01 * s, HB - fb], [-Dr + 0.01 * s, fb], [-D, fb], [-D, 0.05 * s]];
  const uLim = half * 0.9;
  for (let b = 0; b < 3; b++) {
    const rings = [], N = 28;
    for (let i = 0; i <= N; i++) { const t = -1 + 2 * i / N; rings.push(prof.map(([d, h]) => f.p(t * half, d, yAt(b, t) + h))); }
    sweepRings(S, rings, [dir[0], 0, dir[1]]);
    // the frieze: one continuous relief in the recessed field of each face
    if (lvl > 0) for (const sg of [-1, 1]) {
      const Rl = new Relief(-uLim, 0, uLim, fh, cellFrieze); Rl.k = 1.3;
      compose(Rl, -uLim, uLim, 0.02, fh, b, sg > 0);
      const en = [dir[0] * sg, 0, dir[1] * sg];
      Rl.mesh(rail, (uu, vv, hg) => f.p(uu, sg * (Dr + hg), yAt(b, uu / half) + fb + vv), [u[0], 0, u[1]], [0, 1, 0], en, { full: true });
    } else for (const sg of [-1, 1]) slab(R, f, QUAD(-uLim, yAt(b, 0) + fb, uLim, yAt(b, 0) + fb + fh), sg * Dr, sg * (Dr + 0.01 * s));
    // the volutes: the beam's end rolled up
    for (const k of [-1, 1]) {
      const cu = k * (half + 0.08 * s), cy = yAt(b, k) + HB * 0.55, r0 = 0.44 * s, turns = 2.4, segs = lvl ? 26 : 14, wr = 0.075 * s, dep = D + 0.03 * s;
      const rr = [];
      for (let j = 0; j <= segs; j++) {
        const th = j / segs * turns * 2 * Math.PI, r = r0 - (r0 - 0.07 * s) * j / segs, a = k * th, ca = Math.cos(a), sa = Math.sin(a);
        rr.push([[cu + k * ca * (r - wr / 2), -dep, cy - sa * (r - wr / 2) * k], [cu + k * ca * (r + wr / 2), -dep, cy - sa * (r + wr / 2) * k], [cu + k * ca * (r + wr / 2), dep, cy - sa * (r + wr / 2) * k], [cu + k * ca * (r - wr / 2), dep, cy - sa * (r - wr / 2) * k]].map(([a2, d2, y2]) => f.p(a2, d2, y2)));
      }
      loft(R, rr);
      const core = [];
      for (const d2 of [-(D - 0.075 * s), D - 0.075 * s]) core.push(Array.from({ length: 20 }, (_, j) => { const th = j / 20 * Math.PI * 2; return f.p(cu + Math.cos(th) * r0 * 0.99, d2, cy + Math.sin(th) * r0 * 0.99); }));
      loft(S, core);
    }
    // uprights between this beam and the next, and the riders in the round
    if (b < 2) {
      for (const aa of [-W, -0.91 * s, 0.91 * s, W]) {
        const t = aa / half, y0 = yAt(b, t) + HB * 0.5, y1 = yAt(b + 1, t) + 0.2 * s;
        loft(S, [sq(aa, 0, 0.18 * s, 0.18 * s, 0.04 * s, y0), sq(aa, 0, 0.18 * s, 0.18 * s, 0.04 * s, y1)]);
      }
      for (const dd of [-1.5 * W / 2.1, 0, 1.5 * W / 2.1, -(W + 1.4 * s), W + 1.4 * s]) {
        const t = dd / half, base = yAt(b, t) + HB - 0.02 * s, outer = Math.abs(dd) > W + 0.5 * s;
        for (const sg of [-1, 1]) {
          const p = at2(dd, sg * 0.1 * s), yw = yawOf(dir[0] * sg, dir[1] * sg), sc = 0.5 * s;
          const m = outer ? (b === 0 ? elephant(cellRider, sc, true) : lion(cellRider, sc * 1.1)) : (b === 0 ? elephant(cellRider, sc, true) : horseRider(cellRider, sc));
          rail.mesh(m, { x: p[0], y: base, z: p[1], yaw: yw, s: outer && b === 1 ? sc * 1.1 : sc });
        }
      }
    }
  }
  // ---- the yakshis and their mango trees under the lowest architrave's ends: each on a corbel from the pillar, facing out, her raised hand in the boughs
  for (const k of [-1, 1]) {
    const cy = y + H - 2.1 * s, a0 = k * (W + P), a1 = k * (W + P + 1.2 * s), ax = k * (W + P + 0.62 * s);
    const lo = Math.min(a0 - k * 0.1 * s, a1), hi = Math.max(a0 - k * 0.1 * s, a1);
    slab(S, f, [[lo, cy - 0.3 * s], [hi, cy - 0.1 * s], [hi, cy + 0.08 * s], [lo, cy + 0.08 * s]], -0.28 * s, 0.28 * s);
    const fp = f.p(ax, 0, cy + 0.08 * s);
    // her local +z is the pillar's side: mirrored for the other pillar so that the raised arm is the outer one
    rail.mesh(yakshi(cellYak), { x: fp[0], y: fp[1], z: fp[2], yaw: yawOf(dir[0], dir[1]), s, lean: 0.06, mirror: k < 0 });
    const tb = f.p(k * (W + P + 1.05 * s), -0.2 * s, cy + 0.08 * s), tc = f.p(ax + k * 0.45 * s, -0.12 * s, y + H + 0.7 * s), hand = f.p(ax + k * 0.14 * s, 0.14 * s, cy + 0.08 * s + 2.05 * s);
    mangoTree(rail, tb, tc, hand, lvl, k);
  }
  // ---- the emblems: the spoked wheel on its pillar at the middle, a triratna over each post (the whole gateway about 10.5 m) ----
  const topY = yAt(2, 0) + HB, wr0 = 0.34 * s, wy = topY + 0.1 * s + wr0;
  loft(S, [sq(0, 0, 0.26 * s, 0.18 * s, 0.05 * s, topY), sq(0, 0, 0.26 * s, 0.18 * s, 0.05 * s, topY + 0.1 * s)]);
  const rim = [];
  for (let j = 0; j <= 24; j++) { const th = j / 24 * Math.PI * 2, co = Math.cos(th), si = Math.sin(th); rim.push([[wr0, -0.08 * s], [wr0, 0.08 * s], [wr0 - 0.07 * s, 0.08 * s], [wr0 - 0.07 * s, -0.08 * s]].map(([r, d2]) => f.p(co * r, d2, wy + si * r))); }
  loft(R, rim);
  for (let i = 0; i < 16; i++) { const th = i * Math.PI / 8; stone.geom(rod(f.p(Math.cos(th) * 0.06 * s, 0, wy + Math.sin(th) * 0.06 * s), f.p(Math.cos(th) * (wr0 - 0.05 * s), 0, wy + Math.sin(th) * (wr0 - 0.05 * s)), 0.018 * s, 5)); }
  stone.geom(lathe([[0.001, -0.08 * s], [0.07 * s, -0.07 * s], [0.07 * s, 0.07 * s], [0.001, 0.08 * s]], 12, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(Math.atan2(dir[0], dir[1])).translate(at[0], wy, at[1]));
  for (const k of [-1, 1]) {
    const a = k * W;
    loft(S, [sq(a, 0, 0.3 * s, 0.12 * s, 0.05 * s, topY - 0.02 * s), sq(a, 0, 0.3 * s, 0.12 * s, 0.05 * s, topY + 0.08 * s)]);
    const t0 = topY + 0.08 * s, q = 0.5 * s;
    slab(R, f, [[a - 0.05 * s, t0], [a + 0.05 * s, t0], [a + 0.1 * s, t0 + 0.4 * q * 2], [a, t0 + 0.9 * q * 2], [a - 0.1 * s, t0 + 0.4 * q * 2]], -0.08 * s, 0.08 * s);
    for (const g of [-1, 1]) {
      slab(R, f, RING(a + g * 0.2 * s, t0 + 0.42 * q * 2, 0.09 * s, 0.22 * s, 10), -0.08 * s, 0.08 * s);
      slab(R, f, [[a + g * 0.07 * s, t0], [a + g * 0.24 * s, t0], [a + g * 0.23 * s, t0 + 0.25 * s], [a + g * 0.09 * s, t0 + 0.22 * s]], -0.08 * s, 0.08 * s);
    }
  }
  stone.flat(S); rail.flat(R);
  bag0.add(STONE, stone.geometry());
  bag0.add(RAIL, rail.geometry());
}
void join;
