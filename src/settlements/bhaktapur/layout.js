// Bhaktapur about 1710 — the layout (docs/settlements/bhaktapur.md §2): Taumadhi square with the Nyatapola on
// its plinth, the Bhairabnath, the stone shikhara, a dabali, a pati, a spout and a chaitya; Pottery
// Square in the south-west; brick streets on a grid of about 35 m, the houses along them in continuous fronts;
// terraced fields beyond. Pure data. +x east, +z south. The houses are made by a rule from the streets (lots()).

export const RADIUS = 190;
export const HOUSE_R = 158;                                   // the houses stand within this
export const SQ = [-30, -34, 42, 24];                         // Taumadhi: the paved square
export const POT = [-100, 52, -56, 92];                       // Pottery Square: earth, the drying ground
export const NYA = { c: [-8, -14] };                          // the Nyatapola, its stair toward +x
export const BHA = { c: [30, -6] };                           // the Bhairabnath, its front toward −x
export const SHI = { c: [-24, 8] };                           // the Siddhi Lakshmi stone shrine
export const DABALI = [22, 12, 34, 19];
export const PATI = [8, -33, 21, -26];
export const DHARA = { c: [-18, 19.6], yaw: 0 };
export const CHAITYA = { c: [2, 13] };
export const TREES = [[-22, -30], [37, 15]];
/** The enterable house on the square's south side (its front toward the square, north). */
export const HOUSE = { rect: [14, 24, 24.5, 32.5], front: 'n', n: 3 };
export const STALLS = [[-8, 5, 0, 'pots'], [-2, 6.6, 0, 'fruit'], [3, 5.6, 0, 'grain'], [-14, 3, 0, 'cloth'], [26, 5, 0, 'pots'], [36, 8, 0, 'fruit'], [-19, 5.2, 0, 'cloth'], [9, 4.1, 0, 'fruit'], [14.5, 4.1, 0, 'pots'], [20.5, 4.0, 0, 'grain'], [31, 4.3, 0, 'cloth']];

/** The pagoda of Nyatapola and the Bhairabnath in the style's terms (src/styles/newar/temples.js). */
export const NYATAPOLA = {
  c: NYA.c, front: 'e', plinth: { hw: [8.2, 7.3, 6.4, 5.5, 4.6], h: 1.0, tread: 2.2, top: 1.0, stair: 4.4 },
  roofs: [{ hw: 7.5, core: 4.0, wall: 2.6, rise: 2.0 }, { hw: 6.4, core: 3.3, wall: 2.6, rise: 2.0 }, { hw: 5.3, core: 2.6, wall: 2.6, rise: 2.0 }, { hw: 4.2, core: 1.9, wall: 2.6, rise: 1.9 }, { hw: 3.1, core: 1.3, wall: 2.6, rise: 1.6 }],
  bells: [80, 68, 56, 44, 32],
};
export const BHAIRAB = {
  c: BHA.c, front: 'w', chamber: true, plinth: { hw: [5.4, 4.6, 3.8], h: 0.9, tread: 1.8, top: 1.2, stair: 3.6 }, guard: [],
  roofs: [{ hw: 5.6, core: 3.3, wall: 2.4, rise: 1.7 }, { hw: 4.6, core: 2.5, wall: 2.4, rise: 1.7 }, { hw: 3.6, core: 1.7, wall: 2.4, rise: 1.5 }],
  bells: [40, 32, 24],
};

// the streets: [x0, z0, x1, z1] (width 5, the main ones 7), long enough to leave by the disc
const HZ = [[-140, 5], [-106, 5], [-72, 5], [0, 7], [44, 5], [78, 5], [112, 5], [146, 5]];
const VX = [[-150, 5], [-116, 5], [-82, 5], [-52, 5], [8, 6], [60, 6], [94, 5], [128, 5], [162, 5]];
const L = RADIUS;
export const STREETS = [
  ...HZ.map(([z, w]) => [-L, z - w / 2, L, z + w / 2]),
  ...VX.map(([x, w]) => [x - w / 2, -L, x + w / 2, L]),
];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
const overlap = (a, b, m = 0) => a[0] < b[2] - m && a[2] > b[0] + m && a[1] < b[3] - m && a[3] > b[1] + m;
function minus(r, o) {
  if (!overlap(r, o)) return [r];
  const out = [];
  if (o[1] > r[1]) out.push([r[0], r[1], r[2], o[1]]);
  if (o[3] < r[3]) out.push([r[0], o[3], r[2], r[3]]);
  const z0 = Math.max(r[1], o[1]), z1 = Math.min(r[3], o[3]);
  if (o[0] > r[0]) out.push([r[0], z0, o[0], z1]);
  if (o[2] < r[2]) out.push([o[2], z0, r[2], z1]);
  return out.filter((q) => q[2] - q[0] > 0.05 && q[3] - q[1] > 0.05);
}
/** The streets' paving: each cut by the squares and by the streets before it, and clipped to the disc's chord. */
export const PAVED = (() => {
  const done = [SQ, POT], out = [];
  for (const s of STREETS) {
    const horiz = s[2] - s[0] > s[3] - s[1], c = horiz ? (s[1] + s[3]) / 2 : (s[0] + s[2]) / 2, h = Math.sqrt(Math.max(0, (RADIUS - 12) ** 2 - c * c));
    if (h < 10) continue;
    let pieces = [horiz ? [-h, s[1], h, s[3]] : [s[0], -h, s[2], h]];
    for (const o of done) pieces = pieces.flatMap((q) => minus(q, o));
    out.push(...pieces); done.push(horiz ? [-h, s[1], h, s[3]] : [s[0], -h, s[2], h]);
  }
  return out;
})();
export const onStreet = (x, z, m = 0) => STREETS.some((s) => inRect(s, x, z, m)) || inRect(SQ, x, z, m) || inRect(POT, x, z, m);

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * The houses: stood along each frontage (a street's two sides, the square's four edges, Pottery Square's) from the middle out,
 * each of a width of 5.5–9 m and the greatest depth (6–10 m) that clears what is placed, in continuous fronts; now and then a gap of
 * 1.8 m (a passage). Storeys by the distance from the square: three or four near, two or three farther; detail by distance (src/styles/newar/house.js).
 */
let _lots = null;
export function lots() {
  if (_lots) return _lots;
  const rand = rng(1710), placed = [HOUSE.rect], out = [];
  // frontages: { f: facing, line (the facade's coordinate), a, b (the extent along it) }
  const F = [];
  const sq = SQ, pt = POT;
  F.push({ f: 's', line: sq[1], a: sq[0], b: sq[2] }, { f: 'e', line: sq[0], a: sq[1], b: sq[3] }, { f: 'w', line: sq[2], a: sq[1], b: sq[3] }, { f: 'n', line: sq[3], a: sq[0], b: sq[2] });
  F.push({ f: 's', line: pt[1], a: pt[0], b: pt[2] }, { f: 'e', line: pt[0], a: pt[1], b: pt[3] }, { f: 'w', line: pt[2], a: pt[1], b: pt[3] }, { f: 'n', line: pt[3], a: pt[0], b: pt[2] });
  const order = [...HZ.map(([z, w]) => ({ h: true, c: z, w })), ...VX.map(([x, w]) => ({ h: false, c: x, w }))].sort((p, q) => Math.abs(p.c) - Math.abs(q.c));
  for (const o of order) {
    if (o.h) F.push({ f: 's', line: o.c - o.w / 2, a: -RADIUS, b: RADIUS }, { f: 'n', line: o.c + o.w / 2, a: -RADIUS, b: RADIUS });
    else F.push({ f: 'e', line: o.c - o.w / 2, a: -RADIUS, b: RADIUS }, { f: 'w', line: o.c + o.w / 2, a: -RADIUS, b: RADIUS });
  }
  const rectOf = (f, line, t, W, D) => (f === 's' ? [t, line - D, t + W, line] : f === 'n' ? [t, line, t + W, line + D] : f === 'e' ? [line - D, t, line, t + W] : [line, t, line + D, t + W]);
  const blocked = (r) => placed.some((p) => overlap(r, p, 0.04)) || overlap(r, SQ, -0.0) || overlap(r, POT) || STREETS.some((s) => overlap(r, s, 0.04));
  for (const fr of F) {
    for (let t = fr.a; t < fr.b - 4;) {
      if (rand() < 0.07) { t += 1.8; continue; }
      const W = 5.5 + rand() * 3.5 + (rand() < 0.2 ? 1.5 : 0);
      let done = false;
      for (let D = 10; D >= 6 && !done; D -= 0.5) {
        const r = rectOf(fr.f, fr.line, t, W, D), cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
        if (Math.max(Math.hypot(r[0], r[1]), Math.hypot(r[2], r[1]), Math.hypot(r[0], r[3]), Math.hypot(r[2], r[3])) > HOUSE_R) break;
        if (blocked(r)) continue;
        const d = Math.hypot(cx, cz), n = d < 100 ? (rand() < 0.35 ? 4 : 3) : d < 135 ? (rand() < 0.5 ? 3 : 2) : 2;
        out.push({ rect: r, front: fr.f, n, detail: d < 45 ? 2 : d < 90 ? 1 : 0, seed: Math.floor(rand() * 1e6), shop: fr.line === SQ[1] || fr.line === SQ[0] || fr.line === SQ[2] || fr.line === SQ[3] || fr.line === POT[1] ? rand() < 0.5 : undefined });
        placed.push(r); t += W; done = true;
      }
      if (!done) t += 0.25;
    }
  }
  // the plan's second stream (a separate rng, so the lots stay as they were): the shop-houses that stand open, the courts kept for a spout, a rest-house, a pipal or a shrine, the doors, seats and trades
  const r2 = rng(8800), ctr = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], dist = (l) => Math.hypot(...ctr(l));
  const wOf = (l) => (l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]), dOf = (l) => (l.front === 'n' || l.front === 's' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0]);
  const COURTS = ['dhara', 'tree', 'pati', 'shrine'], cs = [];
  let ci = 0;
  for (const l of out) {
    if (l.shop !== undefined || wOf(l) < 6 || dOf(l) < 6.5 || dist(l) < 30 || dist(l) > 112 || r2() > 0.1) continue;
    if (cs.some((q) => Math.hypot(ctr(q)[0] - ctr(l)[0], ctr(q)[1] - ctr(l)[1]) < 30)) continue;
    l.use = COURTS[ci++ % COURTS.length]; cs.push(l);
  }
  const TR = ['curd', 'cloth', 'brass', 'carver', 'grain', 'pots', 'curd', 'cloth'];
  const byD = out.filter((l) => !l.use).sort((a, b) => dist(a) - dist(b));
  let nOpen = 0, ti = 0;
  for (const l of byD) {
    const d = dist(l), W = wOf(l);
    if (nOpen < 40 && W >= 6.4 && dOf(l) >= 6.5 && d < 100 && r2() < (d < 40 ? 0.55 : d < 70 ? 0.4 : 0.22)) {
      l.open = true; l.shop = false; l.trade = l.rect[1] >= POT[1] - 0.5 && l.rect[3] <= POT[3] + 12 && l.rect[0] < POT[2] + 6 && l.rect[2] > POT[0] - 6 ? 'pots' : TR[(ti++ + Math.floor(r2() * 3)) % TR.length]; l.light = nOpen < 14; nOpen++;
      continue;
    }
    l.shop = l.shop ?? r2() < 0.3;
    l.dx = r2() < 0.5 ? W / 2 - 0.6 : 0.7 + r2() * Math.max(0.1, W - 2.4);
    l.pid = !l.shop && r2() < 0.35;
  }
  return (_lots = out);
}
/** A point (lx along the facade, lz into the house) of a lot in world coordinates (house.js's frame). */
export function fp(l, lx, lz) {
  const [x0, z0, x1, z1] = l.rect, f = l.front;
  return f === 's' ? [x0 + lx, z1 - lz] : f === 'n' ? [x1 - lx, z0 + lz] : f === 'e' ? [x1 - lz, z1 - lx] : [x0 + lz, z0 + lx];
}
/** The facing of a lot toward the street, as the figure rotation the engine uses (rot 0 faces −z). */
export const frontRot = (f) => ({ s: Math.PI, n: 0, e: -Math.PI / 2, w: Math.PI / 2 }[f]);
export const inLot = (x, z, m = 0) => inRect(HOUSE.rect, x, z, m) || lots().some((l) => inRect(l.rect, x, z, m));
/** Footprints of the temples, for keeping ground cover and walkers off them. */
export const KEEP = [
  [NYA.c[0] - 8.5, NYA.c[1] - 8.5, NYA.c[0] + 15.5, NYA.c[1] + 8.5], [BHA.c[0] - 11, BHA.c[1] - 6, BHA.c[0] + 6, BHA.c[1] + 6],
  [SHI.c[0] - 3, SHI.c[1] - 3, SHI.c[0] + 3, SHI.c[1] + 3], DABALI, PATI,
];
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The ground: level through the town, rising in terraces beyond it, fading to the plain at the rim. */
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r >= RADIUS) return 0;
  const rise = 2.4 * smooth(HOUSE_R + 6, HOUSE_R + 22, r) + 0.18 * Math.sin(r * 0.55) * smooth(HOUSE_R + 8, HOUSE_R + 14, r);
  return rise * (1 - smooth(RADIUS - 24, RADIUS, r));
}
