// The lighters of the canals (docs/settlements/amsterdam.md §5.10): goods came off the ships in the IJ and went
// "by barge along the canal" to the merchants' warehouses. The praam: a flat-bottomed open boat of tarred planks,
// bluff and round at both ends, its sheer rising to them; a short deck forward and aft, a pair of leeboards
// (zwaarden) hung on the sides and lifted, a rudder with its tiller; the hold laden with casks, bales or peat.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { bar } from './facade.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** praam: { at: [x, z], y (the water), rot (its length along +z turned by rot), len, load ('casks' | 'bales' | 'peat' | 'empty'), seed }. */
export function praam(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, L = el.len ?? 11, B = L * 0.27, D = 0.95, rand = rng(el.seed || 1);
  const c = Math.cos(a), s = Math.sin(a);
  const W = (p) => [x + p[0] * c + p[2] * s, y + p[1], z - p[0] * s + p[2] * c];
  const put = (m, g) => { g.rotateY(a); g.translate(x, y, z); bag.add(m, g); };
  // the hull: stations along its length, each a flat bottom turning up hard into near-upright sides; both faces
  const n = 18, m = 8, T = [];
  const half = (t) => B / 2 * Math.pow(Math.max(0, 1 - Math.abs(2 * t - 1) ** 3), 0.42);
  const sheer = (t) => 0.42 + 0.32 * (2 * t - 1) ** 2;
  const P = (i, j) => {
    const t = i / n, u = j / m * 2 - 1, h = half(t), lift = Math.pow(Math.abs(2 * t - 1), 5) * 0.6;
    const yb = -0.5 + lift, yy = yb + (sheer(t) - yb) * Math.pow(Math.abs(u), 5);
    return [h * u * (0.88 + 0.12 * Math.abs(u)), yy, -L / 2 + L * t];
  };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const p = P(i, j), q = P(i + 1, j), r = P(i + 1, j + 1), d = P(i, j + 1);
    T.push(...p, ...q, ...r, ...p, ...r, ...d, ...p, ...r, ...q, ...p, ...d, ...r);
  }
  put('tar_wood', fromTriangles(T));
  // the rubbing strake and the gunwale along the sheer on both sides, painted; the stem and stern posts
  for (const j of [0, m]) for (let i = 1; i < n - 1; i++) {
    const p = W(P(i, j)), q = W(P(i + 1, j));
    bag.add('shutter_green', rod([p[0], p[1] + 0.02, p[2]], [q[0], q[1] + 0.02, q[2]], 0.045, 5));
    const pl = W(P(i, j === 0 ? 1 : m - 1)), ql = W(P(i + 1, j === 0 ? 1 : m - 1)), k = 0.55;
    bag.add('timber', rod([p[0] * k + pl[0] * (1 - k), p[1] - 0.2, p[2] * k + pl[2] * (1 - k)], [q[0] * k + ql[0] * (1 - k), q[1] - 0.2, q[2] * k + ql[2] * (1 - k)], 0.035, 4));
  }
  for (const e of [0, n]) { const t = W(P(e, m / 2)); bag.add('timber', rod([t[0], y - 0.3, t[2]], [t[0], t[1] + 0.25, t[2]], 0.07, 6)); }
  // the decks fore and aft, the floor boards of the hold between, a thwart amidships
  const dk = (z0, z1, yy) => { const hw = Math.min(half((z0 + L / 2) / L), half((z1 + L / 2) / L)) * 0.84; put('timber', box(-hw, yy - 0.05, z0, hw, yy, z1)); };
  dk(-L / 2 + 0.6, -L / 2 + 1.7, 0.42); dk(L / 2 - 2.0, L / 2 - 0.6, 0.42);
  put('planks_grey', box(-B * 0.36, -0.42, -L / 2 + 1.7, B * 0.36, -0.38, L / 2 - 2.0));
  put('timber', box(-B * 0.47, 0.3, -0.12, B * 0.47, 0.36, 0.12));
  // the leeboards, hung on a bolt at the gunwale amidships and lifted: fans of planks, broad at the foot
  for (const sd of [-1, 1]) {
    const xs = sd * (B / 2 + 0.06), z0 = -0.4, Tq = [];
    const fan = [[0, 0.5, z0], [0, -0.35, z0 - 0.45], [0, -0.55, z0 - 1.25], [0, -0.35, z0 - 1.6], [0, 0.5, z0 - 0.25]];
    const q = fan.map(([, yy, zz]) => [xs, yy, zz]), qb = fan.map(([, yy, zz]) => [xs + sd * 0.05, yy, zz]);
    for (let i = 1; i < q.length - 1; i++) Tq.push(...q[0], ...q[i], ...q[i + 1], ...q[0], ...q[i + 1], ...q[i], ...qb[0], ...qb[i], ...qb[i + 1], ...qb[0], ...qb[i + 1], ...qb[i]);
    for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; Tq.push(...q[i], ...qb[i], ...qb[j], ...q[i], ...qb[j], ...q[j], ...q[i], ...qb[j], ...qb[i], ...q[i], ...q[j], ...qb[j]); }
    const g = fromTriangles(Tq); g.rotateX(-sd * 0.0); put('tar_wood', g);
    put('iron', box(xs - 0.02, 0.38, z0 - 0.18, xs + sd * 0.08, 0.46, z0 - 0.06));
  }
  // the rudder hung on the sternpost, its tiller running inboard over the after deck
  { const t = P(n, m / 2); put('tar_wood', box(-0.05, -0.45, t[2] + 0.05, 0.05, 0.55, t[2] + 0.75)); put('timber', box(-0.035, 0.62, t[2] - 1.6, 0.035, 0.7, t[2] + 0.4)); }
  // the load in the hold
  const load = el.load ?? 'casks', zA = -L / 2 + 1.9, zB = L / 2 - 2.2;
  if (load === 'casks') {
    for (let zz = zA + 0.45; zz < zB - 0.4; zz += 0.95) for (const xx of [-0.45, 0.45]) {
      if (rand() < 0.15) continue;
      const g = lathe([[0.27, -0.42], [0.33, -0.2], [0.35, 0], [0.33, 0.2], [0.27, 0.42], [0.001, 0.42]], 12); g.rotateZ(Math.PI / 2); g.translate(xx * B / 2.6, -0.38 + 0.35, zz); put('wood_painted', g);
      for (const k of [-0.3, 0.3]) { const h = lathe([[0.34 - Math.abs(k) * 0.15, -0.02], [0.345 - Math.abs(k) * 0.15, 0.02], [0.001, 0.02]], 12); h.rotateZ(Math.PI / 2); h.translate(xx * B / 2.6 + k, -0.03, zz); put('iron', h); }
    }
  } else if (load === 'bales') {
    for (let zz = zA + 0.5; zz < zB - 0.5; zz += 0.9) for (const [xx, yy] of [[-0.5, 0], [0.5, 0], [0, 0.55]]) { if (rand() < 0.2) continue; const g = box(-0.42, 0, -0.38, 0.42, 0.52, 0.38); g.rotateY((rand() - 0.5) * 0.2); g.translate(xx * B / 2.4, -0.38 + yy, zz); put('sacking', g); }
  } else if (load === 'peat') {
    for (let zz = zA + 0.2; zz < zB - 0.2; zz += 0.5) { const hh = 0.55 + rand() * 0.3; put('pottery_dark', box(-B * 0.33, -0.38, zz - 0.22, B * 0.33, -0.38 + hh, zz + 0.22)); }
  }
}

// ---- the ships in the IJ (docs/settlements/amsterdam.md §5.11) -----------------------------------------------------------
// A three-masted merchantman of the 1660s at anchor in the harbour, after the pictures of the IJ by the van de Veldes and
// Hendrick Dubbels: a round, beamy hull with a high stern (poop, stern gallery and lantern), tumblehome, a bowsprit, three masts
// with their topmasts and yards, the sails furled on the yards or hanging set in loose bellies, shrouds and stays, the Prince's flag
// at the stern. Built in a frame along +x (the bow), turned to its heading dir.

const tri = (T, a, b, c) => T.push(...a, ...b, ...c);
const quad2 = (T, a, b, c, d) => { tri(T, a, b, c); tri(T, a, c, d); tri(T, a, c, b); tri(T, a, d, c); };     // both faces

/** ship: { at: [x, z], dir: [dx, dz], len, y (the water), seed, sails: 'set' | 'furled' }. */
export function ship(el, { bag }) {
  const [px, pz] = el.at, L = el.len ?? 34, y = el.y ?? 0, [dx, dz] = el.dir ?? [1, 0], rand = rng(el.seed ?? Math.floor(px * 7 + pz * 13));
  const B = L * 0.27, draft = L * 0.085, free = L * 0.075;
  const yaw = -Math.atan2(dz, dx);
  const put = (m, g) => { g.rotateY(yaw); g.translate(px, y, pz); bag.add(m, g); };
  const P = (x, yy, z) => { const c = Math.cos(yaw), s = Math.sin(yaw); return [px + x * c + z * s, y + yy, pz - x * s + z * c]; };     // local → world (for bars)
  // ---- the hull: stations from the stern (t = 0) to the stem (t = 1), rows from the keel (s = 0) to the gunwale (s = 1)
  const n = 24, m = 9;
  const half = (t) => (B / 2) * (t < 0.12 ? 0.55 + 0.45 * Math.sqrt(t / 0.12) : t > 0.55 ? Math.pow(Math.max(0, 1 - ((t - 0.55) / 0.45) ** 1.8), 0.55) : 1);
  const top = (t) => free + (t < 0.24 ? (0.24 - t) / 0.24 * L * 0.05 : 0) + (t > 0.9 ? (t - 0.9) * L * 0.18 : 0) + 0.2 * (2 * t - 1) ** 2 * (t > 0.5 ? 1 : 0.4);
  const keel = (t) => -draft * (t < 0.1 ? 0.45 + 5.5 * t : t > 0.85 ? 1 - (t - 0.85) * 4.5 : 1);
  const pt = (i, j, side) => {
    const t = i / n, s = j / m, hb = half(t), tum = 1 - 0.16 * Math.max(0, (s - 0.55) / 0.45) ** 1.4;
    const wprof = Math.pow(Math.sin(Math.min(1, s * 1.15) * Math.PI / 2), 0.7) * tum;
    return [-L / 2 + L * t, keel(t) + (top(t) - keel(t)) * Math.pow(s, 1.15), side * hb * wprof];
  };
  const lower = [], upper = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) for (const side of [-1, 1]) {
    const a = pt(i, j, side), b = pt(i + 1, j, side), c = pt(i + 1, j + 1, side), d = pt(i, j + 1, side);
    const hi = (a[1] + c[1]) / 2 > 0.3;
    quad2(hi ? upper : lower, a, b, c, d);
  }
  put('tar_wood', fromTriangles(lower)); put('wood_painted', fromTriangles(upper));
  // the transom: closed from the keel's rise to the gunwale, flat to the stern gallery
  { const T = []; for (let j = 0; j < m; j++) quad2(T, pt(0, j, -1), pt(0, j + 1, -1), pt(0, j + 1, 1), pt(0, j, 1)); put('wood_painted', fromTriangles(T)); }
  // the wales (the black strakes along the sides) and the gilt band under the gunwale
  for (const side of [-1, 1]) for (const [s, mat, th] of [[0.5, 'iron', 0.09], [0.94, 'gilt_bronze', 0.07]]) for (let i = 1; i < n - 1; i++) {
    const a = pt(i, 0, side), b = pt(i + 1, 0, side); void a; void b;
    const t0 = i / n, t1 = (i + 1) / n, q = (t) => { const p = pt(Math.round(t * n), 0, side); void p; const tt = t, hb = half(tt), tum = 1 - 0.16 * Math.max(0, (s - 0.55) / 0.45) ** 1.4; return [-L / 2 + L * tt, keel(tt) + (top(tt) - keel(tt)) * Math.pow(s, 1.15), side * (hb * Math.pow(Math.sin(Math.min(1, s * 1.15) * Math.PI / 2), 0.7) * tum + 0.02)]; };
    const A = q(t0), C = q(t1); bag.add(mat, bar(P(...A), P(...C), 0.06, th));
  }
  // the main deck, the poop deck over the stern and the forecastle, the rail round them
  { const T = []; for (let i = 0; i < n; i++) { const a = pt(i, m, -1), b = pt(i + 1, m, -1), c = pt(i + 1, m, 1), d = pt(i, m, 1); const k = 0.9; quad2(T, [a[0], a[1] - k, a[2] * 0.96], [b[0], b[1] - k, b[2] * 0.96], [c[0], c[1] - k, c[2] * 0.96], [d[0], d[1] - k, d[2] * 0.96]); } put('timber', fromTriangles(T)); }
  const poopX = -L / 2 + L * 0.26, poopV = free + 1.7;
  put('wood_painted', box(-L / 2 + 0.3, free - 1.0, -B * 0.4, poopX, poopV, B * 0.4));                          // the poop's block, a deck over it
  put('timber', box(-L / 2 + 0.2, poopV, -B * 0.43, poopX + 0.3, poopV + 0.12, B * 0.43));
  for (const sd of [-1, 1]) put('wood_painted', box(-L / 2 + 0.2, poopV, sd * B * 0.43 - 0.04, poopX + 0.3, poopV + 0.9, sd * B * 0.43 + 0.04));
  put('wood_painted', box(-L / 2 + 0.2, poopV, -B * 0.43, -L / 2 + 0.28, poopV + 0.95, B * 0.43));
  put('timber', box(-L / 2 + L * 0.9, free + 0.2, -B * 0.28, L / 2 - L * 0.045, free + 1.3, B * 0.28));               // the forecastle's block
  // the stern: a gallery of windows under the poop's after edge, a lantern on a post, the Prince's flag
  { const gx = -L / 2 - 0.35; put('wood_painted', box(gx, free - 0.6, -B * 0.36, -L / 2 + 0.1, free + 1.3, B * 0.36));
    for (let k = -2; k <= 2; k++) put('opening', box(gx - 0.02, free - 0.2, k * B * 0.14 - 0.3, gx + 0.02, free + 0.95, k * B * 0.14 + 0.3));
    put('gilt_bronze', box(gx - 0.05, free + 1.3, -B * 0.37, -L / 2 + 0.1, free + 1.45, B * 0.37));
    for (const sd of [-1, 1]) { put('gilt_bronze', box(-L / 2 - 0.4, poopV + 0.9, sd * B * 0.3 - 0.07, -L / 2 - 0.2, poopV + 1.9, sd * B * 0.3 + 0.07)); put('opening', box(-L / 2 - 0.43, poopV + 1.0, sd * B * 0.3 - 0.05, -L / 2 - 0.4, poopV + 1.7, sd * B * 0.3 + 0.05)); }
    const st = [-L / 2 + 0.4, poopV + 0.1]; bag.add('timber', bar(P(st[0], st[1], 0), P(st[0] - 0.9, st[1] + 4.2, 0), 0.09));
    for (const [k, mat] of [[0, 'cloth_ochre'], [1, 'cloth_white'], [2, 'cloth_blue']]) { const T = [], v0 = st[1] + 4.1 - k * 0.42, v1 = v0 - 0.4, x0 = st[0] - 0.9, x1 = x0 - 3.0; quad2(T, [x0, v0, 0], [x1, v0 - 0.15, 0.1], [x1, v1 - 0.15, 0.1], [x0, v1, 0]); put(mat, fromTriangles(T)); } }
  // the bowsprit, the stem's beakhead
  bag.add('timber', bar(P(L / 2 - L * 0.12, free + 0.4, 0), P(L / 2 + L * 0.2, free + L * 0.1, 0), 0.38, 0.38));
  // ---- the masts: [x from the stern (share of L), height over the deck (share of L), furled?] ----
  const deckV = free - 0.9 + 0.1, masts = [[0.66, 0.78, 0], [0.42, 0.9, 1], [0.17, 0.62, 2]];
  const set = el.sails === 'set' || (el.sails !== 'furled' && rand() < 0.35);
  for (const [sx, sh, kind] of masts) {
    const x = -L / 2 + L * sx, H = L * sh, r = L * 0.0105;
    bag.add('timber', bar(P(x, deckV, 0), P(x, deckV + H * 0.62, 0), r * 2, r * 2));                              // the lower mast
    bag.add('timber', bar(P(x, deckV + H * 0.5, 0), P(x, deckV + H * 0.88, 0), r * 1.3, r * 1.3));              // the topmast
    if (kind < 2) bag.add('timber', bar(P(x, deckV + H * 0.8, 0), P(x, deckV + H * 1.0, 0), r * 0.9, r * 0.9));  // the topgallant mast
    bag.add('timber', box(...(() => { const a = P(x - 0.6, deckV + H * 0.62, -0.6), b2 = P(x + 0.6, deckV + H * 0.62 + 0.22, 0.6); return [Math.min(a[0], b2[0]), a[1], Math.min(a[2], b2[2]), Math.max(a[0], b2[0]), b2[1], Math.max(a[2], b2[2])]; })()));    // the top (platform)
    // yards across the ship (z), the sails under them
    const yards = kind === 2 ? [] : [[0.2, 0.5 - kind * 0.04], [0.57, 0.36 - kind * 0.04], [0.84, 0.22 - kind * 0.03]];
    for (const [hv, wf] of yards) {
      const yv = deckV + H * hv + (hv < 0.3 ? 0.4 : 0), yl = L * wf, depth = H * (hv < 0.3 ? 0.4 : hv < 0.6 ? 0.3 : 0.2);
      bag.add('timber', bar(P(x, yv, -yl / 2), P(x, yv, yl / 2), r * 1.1, r * 1.1));
      if (set) {
        const T = [], bw = yl * 0.46, belly = 0.9 + 0.3 * rand(), hs = Math.max(2, Math.round(yl / 2));
        for (let k = 0; k < hs; k++) {
          const z0 = -yl / 2 + yl * k / hs, z1 = -yl / 2 + yl * (k + 1) / hs, wz = (z) => 1 - 0.18 * (Math.abs(z) / (yl / 2)) ** 2, bx = (z) => belly * (1 - (z / (yl / 2)) ** 2);
          quad2(T, [x + bx(z0) * 0.7, yv - 0.1, z0 * wz(z0)], [x + bx(z1) * 0.7, yv - 0.1, z1 * wz(z1)], [x + bx(z1), yv - depth, z1 * wz(z1) * 0.88], [x + bx(z0), yv - depth, z0 * wz(z0) * 0.88]);
        }
        put('cloth_white', fromTriangles(T));
      } else {
        const sc = new Float32Array(0); void sc;                                                                 // furled: a bundle along the yard
        put('cloth_white', lathe([[r * 2.2, 0], [r * 2.2, yl * 0.82]], 7, null, 0, 0, 0).rotateX(Math.PI / 2).translate(x + r * 1.5, yv - r * 1.6, -yl * 0.41));
      }
    }
    if (kind === 2) {                                                                                                // the mizzen's lateen yard, slanted over the poop, its sail
      const a = P(x + L * 0.07, deckV + H * 0.18, 0), b = P(x - L * 0.2, deckV + H * 0.92, 0);
      bag.add('timber', bar(a, b, r * 1.1, r * 1.1));
      if (set) { const T = [], p = (u, v, w) => [x + L * 0.07 - u * L * 0.27, deckV + H * 0.18 + v, w]; const q = P(0, 0, 0); void q; quad2(T, p(0, 0.2, 0.0), p(1, H * 0.74, 0.0), p(1, H * 0.2, 0.15), p(0.1, 0.2, 0.1)); put('cloth_white', fromTriangles(T)); }
    }
    // the shrouds: from the masthead to the channels on each side, four a side
    for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) { const xx = x - 0.9 + k * 0.6; bag.add('rope_fibre', bar(P(x - 0.2 + k * 0.15, deckV + H * 0.6, sd * 0.3), P(xx, deckV + 0.05, sd * (B * 0.47)), 0.05)); }
    // the stay to the next mast forward
    if (kind > 0) { const nx = -L / 2 + L * masts[kind - 1][0]; bag.add('rope_fibre', bar(P(x, deckV + H * 0.85, 0), P(nx, deckV + L * masts[kind - 1][1] * 0.6, 0), 0.045)); }
  }
  bag.add('rope_fibre', bar(P(-L / 2 + L * 0.66, deckV + L * 0.78 * 0.85, 0), P(L / 2 + L * 0.2 - 1, free + L * 0.1, 0), 0.05));   // the forestay to the bowsprit
}
