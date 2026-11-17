// The Great Harbour of Alexandria about 250 BC (docs/settlements/alexandria.md §5): ships of the Hellenistic kinds (the round
// merchantman with one square sail and the steering oars, the long galley with its ram and banks of oars, the lighter), the
// stone quays with their bollards, and the Heptastadion's two bridges. Registered into the `ptolemaic` style (index.js).

import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { vase } from '../greek/vessels.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * A hull lofted along z (bow at −z, the waterline at y 0): half-beam, draught and gunwale height by station; the swan-neck stern
 * and the stem rise. Returns the closed hull's triangles and the deck's (a strip just above the gunwale line).
 */
export function hull(L, B, draft, D, { bowRise = 0.5, sternRise = 1.0, nS = 16, nJ = 6, sharp = 0.7 } = {}) {
  const st = [];
  for (let i = 0; i <= nS; i++) {
    const s = i / nS, f = Math.pow(Math.sin(Math.PI * (0.03 + 0.94 * s)), sharp);
    const b = (B / 2) * (0.05 + 0.95 * f), d = draft * (0.35 + 0.65 * Math.pow(Math.sin(Math.PI * Math.min(1, s * 0.9 + 0.05)), 0.6));
    const h = D + (s < 0.22 ? bowRise * Math.pow(1 - s / 0.22, 2) : 0) + (s > 0.78 ? sternRise * Math.pow((s - 0.78) / 0.22, 2) : 0);
    st.push({ z: -L / 2 + s * L, b, d, h });
  }
  const ring = (S) => { const R = []; for (let j = 0; j <= nJ; j++) { const t = j / nJ * Math.PI / 2; R.push([S.b * Math.sin(t), -S.d + (S.h + S.d) * (1 - Math.cos(t)), S.z]); } return R; };
  const rings = st.map(ring), T = [];
  const tri = (a, b, c) => T.push(...a, ...b, ...c);
  const mir = (p) => [-p[0], p[1], p[2]];
  for (let i = 0; i < nS; i++) for (let j = 0; j < nJ; j++) {
    const a = rings[i][j], b = rings[i][j + 1], c = rings[i + 1][j + 1], d = rings[i + 1][j];
    tri(a, b, c); tri(a, c, d); tri(mir(a), mir(c), mir(b)); tri(mir(a), mir(d), mir(c));
  }
  for (let i = 0; i < nS; i++) {                                     // the keel strip between the two sides
    const a = rings[i][0], c = rings[i + 1][0];
    tri(a, [a[0], a[1] + 0.01, a[2]], c);
  }
  // the deck (closed hull top) and the two ends
  const top = rings.map((r) => r[nJ]);
  for (let i = 0; i < nS; i++) { const a = top[i], b = top[i + 1]; tri(a, b, mir(b)); tri(a, mir(b), mir(a)); }
  for (const e of [0, nS]) { const r = rings[e]; for (let j = 0; j < nJ; j++) { tri(r[j], r[j + 1], mir(r[j + 1])); tri(r[j], mir(r[j + 1]), mir(r[j])); } }
  const hullT = orientOutward(T), deck = [];
  for (let i = 1; i < nS - 1; i++) {
    const a = top[i], b = top[i + 1], k = 0.96, up = 0.025;
    const A = [a[0] * k, a[1] + up, a[2]], Bb = [b[0] * k, b[1] + up, b[2]];
    deck.push(...A, ...Bb, ...[-Bb[0], Bb[1], Bb[2]], ...A, ...[-Bb[0], Bb[1], Bb[2]], ...[-A[0], A[1], A[2]]);
  }
  // make sure every deck triangle faces up
  for (let i = 0; i < deck.length; i += 9) {
    const ux = deck[i + 3] - deck[i], uy = deck[i + 4] - deck[i + 1], uz = deck[i + 5] - deck[i + 2], vx = deck[i + 6] - deck[i], vy = deck[i + 7] - deck[i + 1], vz = deck[i + 8] - deck[i + 2];
    if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const t = deck[i + 3 + k]; deck[i + 3 + k] = deck[i + 6 + k]; deck[i + 6 + k] = t; }
  }
  return { hull: hullT, deck, st };
}
/** A square sail: a bulged patch of cloth on a yard, both faces, from the yard (y1, width w) down to y0, the belly toward the bow (−z). */
function sail(w, y0, y1, z, bulge = 0.5, nx = 6, ny = 4) {
  const P = (i, j) => { const u = i / nx * 2 - 1, v = j / ny; return [u * w / 2 * (1 - 0.12 * v), y1 + (y0 - y1) * v, z - bulge * (1 - u * u) * Math.sin(Math.PI * (0.15 + 0.7 * v))]; };
  const T = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
    T.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  return fromTriangles(T);
}

/** A two-faced strip standing on the gunwale along stations i0..i1 of a hull: a bulwark (inboard of the side by k), from the gunwale up by hgt. */
function bulwark(H, s, i0, i1, hgt, k = 0.97) {
  const T = [];
  for (let i = i0; i < i1; i++) {
    const a = H.st[i], b = H.st[i + 1], xa = a.b * s * k, xb = b.b * s * k;
    T.push(xa, a.h, a.z, xb, b.h, b.z, xb, b.h + hgt, b.z, xa, a.h, a.z, xb, b.h + hgt, b.z, xa, a.h + hgt, a.z);
    T.push(xa, a.h, a.z, xb, b.h + hgt, b.z, xb, b.h, b.z, xa, a.h, a.z, xa, a.h + hgt, a.z, xb, b.h + hgt, b.z);
  }
  return fromTriangles(T);
}
/** A curved post of rods along the points (radius r tapering to 0.6 r), the way a swan-neck stern or a curled stem was drawn. */
function curl(add, mat, pts, r) {
  for (let i = 0; i < pts.length - 1; i++) add(mat, rod(pts[i], pts[i + 1], r * (1 - 0.4 * i / (pts.length - 1)), 5));
}
/** Standing rigging for a one-masted ship: forestay, backstay, three shrouds a side to the gunwale, lines up the sail's face. */
function rigging(add, H, S, mz, top, L, sailOpts) {
  const bow = H.st[1], stern = H.st[H.st.length - 2];
  add('timber', rod([0, top, mz], [0, bow.h + 0.5 * S, bow.z], 0.025 * S + 0.01, 3));
  add('timber', rod([0, top, mz], [0, stern.h + 0.5 * S, stern.z], 0.025 * S + 0.01, 3));
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const st = H.st[Math.max(2, Math.min(H.st.length - 3, Math.round((mz + L / 2) / L * (H.st.length - 1)) + k - 1))];
    add('timber', rod([0, top - 0.3 * S, mz + (k - 1) * 0.1], [s * st.b * 1.0, st.h + 0.1, st.z], 0.02 * S + 0.008, 3));
  }
  if (sailOpts) {
    const { w, y0, y1, z, bulge } = sailOpts;
    for (const u of [-0.66, -0.33, 0, 0.33, 0.66]) {
      const P = (v) => [u * w / 2 * (1 - 0.12 * v), y1 + (y0 - y1) * v, z - bulge * (1 - u * u) * Math.sin(Math.PI * (0.15 + 0.7 * v)) - 0.04];
      for (let j = 0; j < 4; j++) add('timber', rod(P(j / 4), P((j + 1) / 4), 0.014 * S + 0.006, 3));
    }
  }
}
export function shipParts(kind, L, seed = 1) {
  const rand = rng(seed), S = L / 26, out = [];
  const add = (m, g) => out.push([m, g]);
  if (kind === 'galley') {
    const H = hull(L, L * 0.13, 0.7 * S, 1.1 * S, { bowRise: 1.0 * S, sternRise: 2.4 * S, sharp: 0.55 });
    add('wood_dark', fromTriangles(H.hull)); add('timber', fromTriangles(H.deck));
    add('bronze', rod([0, 0.1, -L / 2 + 0.2], [0, 0.0, -L / 2 - 2.2 * S], 0.14 * S, 6));                                 // the ram
    for (const s of [-1, 1]) for (let k = 0; k < 16; k++) { const z = -L * 0.3 + k * (L * 0.56 / 15); const w = H.st[Math.round((z / L + 0.5) * 16)]?.b ?? 0.8; add('wood_ochre', rod([s * (w - 0.05), 1.1 * S, z], [s * (w + 2.6 * S), -0.1, z + 0.5], 0.035, 4)); }
    add('timber', rod([0, 0.4, 0.5 * S], [0, 7.5 * S, 0.5 * S], 0.1 * S, 6)); add('timber', rod([-4.2 * S, 6.6 * S, 0.5 * S], [4.2 * S, 6.6 * S, 0.5 * S], 0.06 * S, 6));
    add('linen', sail(8.2 * S, 2.6 * S, 6.5 * S, 0.5 * S, 0.5 * S));
    // the bulwark with a row of round shields along it, the outrigger (parexeiresia) the oars work through, the stern's fan and the helmsman's shelter, the stays
    for (const s of [-1, 1]) {
      add('wood_ochre', bulwark(H, s, 3, 14, 0.55 * S));
      for (let i = 3; i < 14; i++) { const a = H.st[i], b = H.st[i + 1]; add('wood_ochre', rod([s * a.b * 0.97, a.h + 0.55 * S, a.z], [s * b.b * 0.97, b.h + 0.55 * S, b.z], 0.05 * S + 0.02, 4)); }
      for (let i = 4; i < 14; i++) { const a = H.st[i]; const d = lathe([[0.001, 0], [0.34 * S, 0.0], [0.3 * S, 0.06], [0.001, 0.1]], 8); d.rotateZ(-s * Math.PI / 2); d.translate(s * (a.b * 0.97 + 0.04), a.h + 0.28 * S, a.z); add(i % 2 ? 'bronze' : 'wood_ochre', d); }
      add('wood_ochre', box(s * (H.st[8].b + 0.05) - 0.12, 1.0 * S, -L * 0.34, s * (H.st[8].b + 0.9 * S) + 0.12, 1.14 * S, L * 0.3));
      for (let k = 0; k < 6; k++) { const z = -L * 0.32 + k * L * 0.11; add('timber', rod([s * (H.st[8].b + 0.5 * S), 0.2, z], [s * (H.st[8].b + 2.3 * S), 1.0 * S, z], 0.04 * S + 0.01, 4)); }
    }
    const st16 = H.st[16];
    curl(add, 'wood_ochre', [[0, st16.h, st16.z - 0.1], [0, st16.h + 1.2 * S, st16.z + 0.3 * S], [0, st16.h + 2.4 * S, st16.z + 0.1 * S], [0, st16.h + 3.0 * S, st16.z - 0.6 * S], [0, st16.h + 2.5 * S, st16.z - 1.3 * S]], 0.1 * S + 0.03);
    for (let f = -2; f <= 2; f++) add('bronze', rod([0, st16.h + 2.2 * S, st16.z - 0.2 * S], [f * 0.45 * S, st16.h + 3.2 * S - Math.abs(f) * 0.25 * S, st16.z - 0.7 * S], 0.03 * S + 0.012, 4));
    for (const x of [-1, 1]) add('timber', rod([x * 0.7 * S, H.st[13].h, L * 0.3], [x * 0.7 * S, H.st[13].h + 2.2 * S, L * 0.3], 0.05 * S + 0.02, 4));
    add('timber', box(-0.9 * S, H.st[13].h + 2.2 * S, L * 0.26, 0.9 * S, H.st[13].h + 2.4 * S, L * 0.4));
    for (const p of [[0.3, 0.12], [0.5, 0.2]]) add('bronze', rod([0, 0.2, -L / 2 + 0.2], [0, 0.1 + p[0], -L / 2 - 1.8 * S], 0.03 * S + 0.02 + p[1] * 0, 4));
    rigging(add, H, S, 0.5 * S, 7.5 * S, L, { w: 8.2 * S, y0: 2.6 * S, y1: 6.5 * S, z: 0.5 * S, bulge: 0.5 * S });
    return out;
  }
  const lighter = kind === 'lighter';
  const H = hull(L, L * (lighter ? 0.3 : 0.3), (lighter ? 0.6 : 1.5) * S, (lighter ? 1.0 : 1.7) * S, { bowRise: 0.7 * S, sternRise: (lighter ? 1.2 : 2.6) * S, sharp: lighter ? 0.8 : 0.6 });
  add('wood_dark', fromTriangles(H.hull)); add('timber', fromTriangles(H.deck));
  // the wales: a lighter band along the gunwale, painted eyes at the bow
  for (const s of [-1, 1]) { const T = []; for (let i = 2; i < 14; i++) { const a = H.st[i], b = H.st[i + 1], y = (q) => q.h - 0.1 * S; T.push(a.b * s * 1.002, y(a), a.z, b.b * s * 1.002, y(b), b.z, b.b * s * 1.002, y(b) + 0.22 * S, b.z, a.b * s * 1.002, y(a), a.z, b.b * s * 1.002, y(b) + 0.22 * S, b.z, a.b * s * 1.002, y(a) + 0.22 * S, a.z); } for (let i = 0; i < T.length; i += 9) if (s > 0) for (let k = 0; k < 3; k++) { const t = T[i + 3 + k]; T[i + 3 + k] = T[i + 6 + k]; T[i + 6 + k] = t; } add('wood_ochre', fromTriangles(T)); }
  const mz = -L * 0.06;
  add('timber', rod([0, 0.3, mz], [0, (lighter ? 7 : 11) * S, mz], 0.13 * S, 6));
  add('timber', rod([-5 * S, (lighter ? 6 : 9.6) * S, mz], [5 * S, (lighter ? 6 : 9.6) * S, mz], 0.07 * S, 6));
  add('linen', sail(9.6 * S, 3.2 * S, (lighter ? 6 : 9.5) * S, mz - 0.1, 0.9 * S));
  add('cloth_red', sail(9.6 * S, (lighter ? 6 : 9.5) * S - 0.9 * S, (lighter ? 6 : 9.5) * S - 0.1, mz - 0.1, 0.5 * S, 6, 1));
  if (!lighter) {
    add('timber', rod([0, 1.7 * S, -L * 0.42], [0, 4.6 * S, -L * 0.52], 0.07 * S, 5));                              // the raking foremast (artemon)
    add('linen', sail(3.4 * S, 2.6 * S, 4.3 * S, -L * 0.45, 0.3 * S, 3, 2));
    add('wood_painted', box(-1.3 * S, 1.7 * S, L * 0.3, 1.3 * S, 3.0 * S, L * 0.47));                              // the stern cabin
    add('roof_tile', box(-1.4 * S, 3.0 * S, L * 0.29, 1.4 * S, 3.15 * S, L * 0.48));
  }
  // the two steering oars at the quarters, long blades trailing into the water
  const zq = L * 0.4;
  for (const s of [-1, 1]) {
    add('timber', rod([s * (H.st[13].b - 0.1), H.st[13].h + 1.4 * S, zq], [s * (H.st[13].b + 0.5 * S), -1.0 * S, zq + 2.2 * S], 0.06 * S, 5));
    add('wood_ochre', box(s * (H.st[13].b + 0.45 * S) - 0.1, -1.6 * S, zq + 2.1 * S, s * (H.st[13].b + 0.45 * S) + 0.1, -0.5 * S, zq + 2.5 * S));
  }
  // the cargo on deck: amphorae and sacks, a stack of them forward of the mast
  if (kind !== 'lighter') {
    const mk = { add: (m, g) => add(m, g) };
    for (let k = 0; k < 7; k++) vase(mk, 'amphora', ((k % 3) - 1) * 0.8 * S, H.st[8].h + 0.03, L * 0.18 + Math.floor(k / 3) * 0.7 * S, { s: 1.0, dark: false, tilt: 0.0, seg: 8 });
  } else {
    const mk = { add: (m, g) => add(m, g) };
    for (let k = 0; k < 6; k++) vase(mk, 'amphora', ((k % 2) - 0.5) * 0.9 * S, H.st[7].h * 0.7, -L * 0.2 + Math.floor(k / 2) * 0.9 * S, { s: 1.0, dark: false, seg: 8 });
    add('sacking', box(-0.9 * S, 0.3 * S, L * 0.12, 0.9 * S, 0.9 * S, L * 0.3));
  }
  // the bulwark and its rail, the curled stem and the swan-neck stern (with the goose-head), the hatch, bitts and the anchor at the bow, the stays and the lines on the sail
  for (const s of [-1, 1]) {
    add('wood_ochre', bulwark(H, s, 2, 15, (lighter ? 0.45 : 0.8) * S));
    for (let i = 2; i < 15; i++) { const a = H.st[i], b = H.st[i + 1], q = (lighter ? 0.45 : 0.8) * S; add('wood_ochre', rod([s * a.b * 0.97, a.h + q, a.z], [s * b.b * 0.97, b.h + q, b.z], 0.05 * S + 0.02, 4)); }
  }
  { const sb = H.st[1], se = H.st[15];
    curl(add, 'wood_ochre', [[0, sb.h, sb.z + 0.1], [0, sb.h + 0.7 * S, sb.z - 0.5 * S], [0, sb.h + 1.5 * S, sb.z - 0.5 * S], [0, sb.h + 1.9 * S, sb.z - 0.1 * S]], 0.1 * S + 0.03);
    curl(add, 'wood_ochre', [[0, se.h, se.z + 0.1], [0, se.h + 1.0 * S, se.z + 0.5 * S], [0, se.h + 2.2 * S, se.z + 0.2 * S], [0, se.h + 3.2 * S, se.z - 0.5 * S], [0, se.h + 3.6 * S, se.z - 1.3 * S]], 0.11 * S + 0.03);
    add('wood_ochre', lathe([[0.001, -0.18 * S], [0.16 * S, -0.1 * S], [0.14 * S, 0.12 * S], [0.001, 0.18 * S]], 6, null, 0, se.h + 3.55 * S, se.z - 1.5 * S));   // the goose-head
    if (!lighter) {
      add('timber', box(-0.7 * S, H.st[8].h, L * 0.04, 0.7 * S, H.st[8].h + 0.35 * S, L * 0.14)); add('wood_ochre', box(-0.8 * S, H.st[8].h + 0.35 * S, L * 0.035, 0.8 * S, H.st[8].h + 0.42 * S, L * 0.145));   // the hatch
      for (const x of [-1, 1]) add('wood_ochre', box(x * 0.9 * S - 0.1, H.st[4].h, -L * 0.3, x * 0.9 * S + 0.1, H.st[4].h + 0.6 * S, -L * 0.3 + 0.2));
      add('timber', rod([-0.5 * S, H.st[2].h, sb.z + 0.6], [-0.7 * S, H.st[2].h - 1.4 * S, sb.z + 1.0], 0.04 * S + 0.015, 4)); add('timber', rod([-1.0 * S, H.st[2].h - 1.2 * S, sb.z + 1.0], [-0.4 * S, H.st[2].h - 1.2 * S, sb.z + 1.0], 0.04 * S + 0.015, 4));   // the anchor hung at the cathead
    }
  }
  if (!lighter) rigging(add, H, S, mz, (lighter ? 7 : 11) * S, L, { w: 9.6 * S, y0: 3.2 * S, y1: (lighter ? 6 : 9.5) * S, z: mz - 0.1, bulge: 0.9 * S });
  void rand;
  return out;
}
/** ship: { at [x, z], rot (yaw, radians about +y), y (the waterline), kind ('merchant' | 'galley' | 'lighter'), len, seed } */
function ship(el, { bag }) {
  const L = el.len ?? (el.kind === 'galley' ? 34 : el.kind === 'lighter' ? 9 : 24), rot = el.rot ?? 0;
  for (const [m, g] of shipParts(el.kind ?? 'merchant', L, el.seed ?? 1)) { g.rotateY(rot); g.translate(el.at[0], el.y ?? 0, el.at[1]); bag.add(m, g); }
}
/** The quay's stone: blocks of ashlar from the harbour floor to the paving, a coping of dressed stone, bollards every 12 m along it. */
function quay(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y0 = el.y0 ?? -4.7, y1 = el.y1 ?? 1.25;
  bag.add('limestone', box(x0, y0, z0, x1, y1, z1)); col.rect(el.rect, y0, y1 - 0.1); col.floor(el.rect, y1);
  const alongX = x1 - x0 > z1 - z0, n = Math.floor((alongX ? x1 - x0 : z1 - z0) / 12);
  if (!el.bollards) return;
  for (let k = 0; k < n; k++) {
    const u = (alongX ? x0 : z0) + 6 + k * 12, x = alongX ? u : (x0 + x1) / 2, z = alongX ? (z0 + z1) / 2 + (el.side ?? 0) : u;
    bag.add('granite_grey', lathe([[0.24, 0], [0.2, 0.05], [0.17, 0.4], [0.26, 0.46], [0.001, 0.48]], 8, null, x, y1, z));
    col.circle(x, z, 0.24, y1, y1 + 0.48);
  }
}
/** The Heptastadion's bridge over one channel: the stone deck on its two walls, low parapets along the sides. { rect (the channel), y (the roadway) } */
function mole_bridge(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 1.2, th = 1.0;
  bag.add('limestone', box(x0, y - th, z0 - 0.5, x1, y, z1 + 0.5)); col.floor([x0, z0 - 0.5, x1, z1 + 0.5], y);
  for (const z of [z0 - 0.5, z1 + 0.5 - 1.0]) bag.add('limestone', box(x0, -4.7, z, x1, y - th, z + 1.0));      // the channel's walls
  for (const x of [x0, x1 - 0.4]) { bag.add('limestone', box(x, y, z0 - 0.5, x + 0.4, y + 0.9, z1 + 0.5)); col.rect([x, z0 - 0.5, x + 0.4, z1 + 0.5], y, y + 0.9); }
}
export const HARBOUR = { ship, quay, mole_bridge };
