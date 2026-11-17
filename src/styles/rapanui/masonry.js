// Rapa Nui — dry-laid stonework of the village (docs/settlements/rapa-nui.md §4i): the chicken houses
// (hare moa) as coursed, battered cairns over a long narrow chamber with their small closable openings,
// and the garden enclosures (manavai) as rings of laid stones with a gap to go in by, soil, mulch and
// the crops inside. Stones are laid course by course, long side to the wall, each course set half a stone
// over the one below.
import { Matrix4 } from '../../core/three.js';
import { box, frustum, lathe, fromTriangles, orientOutward, rod } from '../../core/geom.js';

const B = 'basalt_ahu';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ROUND = [0, 1, 2].map((k) => lathe([[1, -0.6], [1.06, 0.05], [0.78, 0.6], [0.35, 0.85], [0.001, 0.9]], 7, (th) => 1 + 0.12 * Math.sin(th * (2 + k) + k) + 0.06 * Math.cos(th * 5 + k * 2)));
const _m = new Matrix4(), _t = new Matrix4(), _s = new Matrix4();
/** A laid stone at (x, base, z): its long side along `ang`, half-length a, half-width b, half-height c (its foot on `base`). */
function laid(bag, mat, x, base, z, ang, a, b, c, k, reach = 230) {
  const kk = Math.abs(Math.floor(k)) % 3;
  _m.makeRotationY(ang).premultiply(_t.makeTranslation(x, base + 0.6 * c / 0.8, z)).multiply(_s.makeScale(a, c / 0.8, b));
  const m = _m.clone();
  if (bag.addInstance) bag.addInstance(mat, ROUND[kk], m, { reach }); else bag.add(mat, ROUND[kk].clone().applyMatrix4(m));
}
/** A convex solid from eight corners (bottom four, then top four), faced outward. */
function hull8(p) {
  const F = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], t = [];
  for (const [a, b, c, d] of F) t.push(...p[a], ...p[b], ...p[c], ...p[a], ...p[c], ...p[d]);
  return fromTriangles(orientOutward(t));
}
/** Points at about `step` apart along a closed polyline, with the tangent's angle (turning about y: x → local u). */
function along(poly, step, off = 0) {
  const out = []; let acc = off * step;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    while (acc <= L) { const t = acc / L; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, -Math.atan2(b[1] - a[1], b[0] - a[0])]); acc += step; }
    acc -= L;
  }
  return out;
}
const rounded = (a, b, n = 4, N = 96) => Array.from({ length: N }, (_, i) => { const t = i / N * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); return [a * Math.sign(c) * Math.abs(c) ** (2 / n), b * Math.sign(s) * Math.abs(s) ** (2 / n)]; });

/**
 * hare_moa: a chicken house { c, y, yaw, len } — "substantial, carefully built stone structures with a long, narrow
 * internal chamber and one or two small openings … just large enough for a chicken", a rock put into the gap to close it
 * [stated: vernianera.com "Features and sites"; southamerica.cl "Hare moa"]. Ours: a battered cairn of dry-laid
 * stones in six courses over a core, its ends rounded, capped with slabs laid across; on each long side a small opening
 * at the foot under a lintel — one with a rock lying beside it, the other with a rock set in it [inferred: sizes, courses].
 */
function hareMoa(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, L = el.len ?? 6, yaw = el.yaw ?? 0, rand = rng(Math.floor(x * 7 + z * 11)), ca = Math.cos(yaw), sa = Math.sin(yaw);
  const P = (u, v) => [x + u * ca + v * sa, z - u * sa + v * ca];
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z), add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const NC = 6, CH = 0.25, A0 = L / 2, B0 = 1.2;
  // the core: a battered solid inside the stones, with the chamber's dark mouths drawn on it
  add('pebbles', frustum([-A0 + 0.25, -B0 + 0.3, A0 - 0.25, B0 - 0.3], -0.3, NC * CH - 0.02, 0.28, 0.28, 0.3, 0.3));
  const openings = [[-1, L / 4, 'open'], [1, -L / 4, 'shut']];
  for (let c = 0; c < NC; c++) {
    const a = A0 - 0.1 * c, b = B0 - 0.14 * c, base = c * CH - 0.03, poly = rounded(a, b);
    const ring = along(poly, 0.46 + 0.04 * (c % 2), (c % 2) * 0.5);
    ring.forEach(([u, v, ang], i) => {
      for (const [s, uo, st] of openings) if (c < 2 && Math.sign(v) === s && Math.abs(u - uo) < (st === 'shut' ? 0.2 : 0.3) && Math.abs(v) > b * 0.7) { if (st === 'open' || c === 1) return; }
      const k = rand(), [wx, wz] = P(u, v);
      laid(bag, B, wx, y0 + base, wz, ang + yaw, 0.26 + k * 0.1, 0.19 + rand() * 0.05, 0.1 + rand() * 0.03, i + c * 5);
    });
  }
  // capstones: flat slabs laid across the ridge, each overlapping the next
  const top = NC * CH - 0.04, nslab = Math.max(3, Math.round(L / 1.15));
  for (let k = 0; k < nslab; k++) {
    const u = -L / 2 + 0.75 + k * (L - 1.5) / (nslab - 1), w = 0.62 + rand() * 0.15, dz = 0.12 * (rand() - 0.5);
    add(B, hull8([[u - 0.55, top, -w], [u + 0.55, top, -w + dz], [u + 0.55, top, w + dz], [u - 0.55, top, w], [u - 0.5, top + 0.2 + (k % 2) * 0.05, -w + 0.1], [u + 0.5, top + 0.2 + (k % 2) * 0.05, -w + 0.1 + dz], [u + 0.5, top + 0.2 + (k % 2) * 0.05, w - 0.1 + dz], [u - 0.5, top + 0.2 + (k % 2) * 0.05, w - 0.1]]));
  }
  // the small openings at the foot: a lintel across, a dark mouth; the stopping rock beside or in it
  for (const [s, uo, st] of openings) {
    const vf = s * (B0 - 0.3 - 0.015 + 0.0);
    if (st === 'open') add('opening', box(uo - 0.17, 0.0, Math.min(vf, vf + s * 0.07), uo + 0.17, 0.33, Math.max(vf, vf + s * 0.07)));
    const vs = s * (B0 - 0.04);
    add(B, hull8([[uo - 0.33, 0.33, vs - 0.3 * s], [uo + 0.33, 0.33, vs - 0.3 * s], [uo + 0.33, 0.33, vs + 0.1 * s], [uo - 0.33, 0.33, vs + 0.1 * s], [uo - 0.3, 0.5, vs - 0.26 * s], [uo + 0.3, 0.5, vs - 0.26 * s], [uo + 0.3, 0.5, vs + 0.06 * s], [uo - 0.3, 0.5, vs + 0.06 * s]]));
    const [rx, rz] = P(uo + (st === 'open' ? 0.7 : 0), s * (B0 + (st === 'open' ? 0.22 : -0.12)));
    laid(bag, B, rx, y0 - 0.02, rz, rand() * 3, 0.24, 0.2, st === 'open' ? 0.13 : 0.17, uo * 3);
  }
  const rr = Math.max(1.2, B0);
  for (const s of [-1, 0, 1]) col.circle(x + ca * s * L / 3, z - sa * s * L / 3, rr, y0, y0 + 1.6);
}

/**
 * manavai: a garden enclosure { c, y, r, seed, n (stalks of cane) } — "circular, protected plants from wind and helped hold
 * moisture" [stated: vernianera.com "Features and sites"]. Ours: a ring wall of dry-laid stones in five courses leaning in
 * a little, a gap to go in by, inside a bed of dark soil strewn with small stones (mulch), and by the wall clumps of
 * sugar cane [inferred: the cane and the mulch; the crops of the manavai were bananas, sugar cane, mulberry and ti
 * — Wikipedia "Easter Island" for the first two].
 */
function manavai(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, r = el.r ?? 3, rand = rng(Math.floor(x * 13 + z * 7)), gap = rand() * Math.PI * 2, gw = Math.min(0.5, 0.45 / r) * 2;
  const NC = 5, CH = 0.25, NS = Math.max(14, Math.round(r * 7));
  const inGap = (a) => { let d = Math.abs(((a - gap) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI); d = Math.PI - d; return d < gw / 2; };
  // the wall's core, in segments so that the gap stays open
  for (let k = 0; k < NS; k++) {
    const a0 = k / NS * Math.PI * 2, a1 = (k + 1) / NS * Math.PI * 2, am = (a0 + a1) / 2;
    if (inGap(am)) continue;
    const P = (a, rad, y) => [x + Math.cos(a) * rad, y0 + y, z + Math.sin(a) * rad];
    bag.add('pebbles', hull8([P(a0, r + 0.1, -0.4), P(a1, r + 0.1, -0.4), P(a1, r + 0.5, -0.4), P(a0, r + 0.5, -0.4), P(a0, r + 0.1, NC * CH - 0.03), P(a1, r + 0.1, NC * CH - 0.03), P(a1, r + 0.34, NC * CH - 0.03), P(a0, r + 0.34, NC * CH - 0.03)]));
    col.segment([x + Math.cos(a0) * (r + 0.3), z + Math.sin(a0) * (r + 0.3)], [x + Math.cos(a1) * (r + 0.3), z + Math.sin(a1) * (r + 0.3)], 0.6, y0 - 0.4, y0 + 1.3);
  }
  // the stones: outer face in five courses, battered; inner face in the top three
  for (let c = 0; c < NC; c++) {
    const ro = r + 0.62 - 0.07 * c, ri = r + 0.02 + 0.035 * c, nn = Math.round(2 * Math.PI * ro / (0.5 + 0.03 * (c % 2))), off = (c % 2) * 0.5;
    for (let k = 0; k < nn; k++) {
      const a = (k + off) / nn * Math.PI * 2, rd = ro + (rand() - 0.5) * 0.06;
      if (!inGap(a)) laid(bag, B, x + Math.cos(a) * rd, y0 + c * CH - 0.05, z + Math.sin(a) * rd, -(a + Math.PI / 2), 0.28 + rand() * 0.12, 0.2 + rand() * 0.06, 0.105 + rand() * 0.04, k + c * 7, 260);
    }
    if (c >= 2) for (let k = 0; k < Math.round(2 * Math.PI * ri / 0.5); k++) {
      const a = (k + off) / Math.round(2 * Math.PI * ri / 0.5) * Math.PI * 2;
      if (!inGap(a)) laid(bag, B, x + Math.cos(a) * ri, y0 + c * CH - 0.05, z + Math.sin(a) * ri, -(a + Math.PI / 2), 0.25 + rand() * 0.1, 0.16 + rand() * 0.05, 0.1 + rand() * 0.03, k * 1.3 + c, 220);
    }
  }
  // ends of the wall at the gap: a tall stone set up each side; a flat step stone
  for (const s of [-1, 1]) {
    const a = gap + s * (gw / 2 + 0.07), px = x + Math.cos(a) * (r + 0.32), pz = z + Math.sin(a) * (r + 0.32);
    laid(bag, B, px, y0 - 0.05, pz, -(a + Math.PI / 2), 0.22, 0.3, 0.62, 3 + s);
  }
  laid(bag, B, x + Math.cos(gap) * (r + 1.2), y0 - 0.03, z + Math.sin(gap) * (r + 1.2), -(gap + Math.PI / 2), 0.4, 0.28, 0.07, 2);
  // the bed: dark soil, small stones strewn over it as mulch, the cane in clumps by the wall
  bag.add('cloth_brown', lathe([[r - 0.02, -0.05], [r - 0.04, 0.1], [r * 0.6, 0.15], [0.001, 0.17]], 18, null, x, y0, z));
  for (let k = 0; k < Math.round(r * r * 3); k++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * (r - 0.2);
    laid(bag, rand() < 0.7 ? B : 'pebbles', x + Math.cos(a) * d, y0 + 0.13, z + Math.sin(a) * d, rand() * 3, 0.07 + rand() * 0.06, 0.06 + rand() * 0.05, 0.035 + rand() * 0.02, k, 120);
  }
  const clumps = r > 2.6 ? 2 : 1;
  for (let q = 0; q < clumps; q++) {
    const a = gap + Math.PI + (q - 0.5 * (clumps - 1)) * 1.7 + (rand() - 0.5) * 0.3, cx = x + Math.cos(a) * (r - 0.75), cz = z + Math.sin(a) * (r - 0.75);
    for (let k = 0; k < 7; k++) {
      const bx = cx + (rand() - 0.5) * 0.5, bz = cz + (rand() - 0.5) * 0.5, h = 1.5 + rand() * 0.9, lx = (rand() - 0.5) * 0.22, lz = (rand() - 0.5) * 0.22;
      bag.add('papyrus', rod([bx, y0 + 0.14, bz], [bx + lx, y0 + 0.14 + h, bz + lz], 0.016 + rand() * 0.006, 5));
      for (let l = 0; l < 3; l++) {                                  // the long leaves arching out from the top
        const a2 = rand() * Math.PI * 2, tx = bx + lx + Math.cos(a2) * 0.55, tz = bz + lz + Math.sin(a2) * 0.55, y1 = y0 + 0.14 + h - 0.1 - l * 0.12;
        const p0 = [bx + lx, y1 + 0.18, bz + lz], p1 = [(bx + lx + tx) / 2, y1 + 0.28, (bz + lz + tz) / 2], p2 = [tx, y1 - 0.2, tz], w = [-Math.sin(a2) * 0.035, 0, Math.cos(a2) * 0.035];
        const q0 = [p0[0] - w[0], p0[1], p0[2] - w[2]], q1 = [p0[0] + w[0], p0[1], p0[2] + w[2]], m0 = [p1[0] - w[0] * 2, p1[1], p1[2] - w[2] * 2], m1 = [p1[0] + w[0] * 2, p1[1], p1[2] + w[2] * 2];
        const t = [...q0, ...q1, ...m1, ...q0, ...m1, ...m0, ...m0, ...m1, ...p2];
        bag.add('flax_leaf', fromTriangles(t.concat(flipTris(t))));
      }
    }
  }
}
const flipTris = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };

export const MASONRY = { hare_moa: hareMoa, manavai };
export { laid, hull8, along, rounded };
