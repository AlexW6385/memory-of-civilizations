// SG̱ang Gwaay Llnagaay about 1850 — the layout (docs/settlements/sgang-gwaay.md §2): the sea to the
// east, a crescent beach, one row of seventeen cedar-plank houses on the terrace above it with their
// gable ends and frontal poles to the sea, the landmark house at z = 0; mortuary and memorial poles
// in the street between the houses and the water and at the south end; canoes on the shore; the
// rain forest rising behind. Each house is dug into the terrace. Pure data. +x east, +z south.

export const RADIUS = 190;
export const SEA = -2.0;        // the sea (the disc's base stands 2 m above the planet's sea level)
export const RIM = -14;         // the sea floor at the disc's rim
export const G = 1.0;           // the terrace, flat, above high water
export const PIT = 1.2;         // how deep the houses are dug (three tiers of 0.4 m)
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The shore line (the beach's top, the sea to its east): a crescent, with small bays. */
export const arc = (z) => 44 + 0.0018 * z * z;
export const shoreX = (z) => arc(z) + 1.6 * Math.sin(z / 23) + 0.9 * Math.sin(z / 9 + 1);
const westX = (z) => -128 + 0.0022 * z * z;
const N_END = -168, S_END = 168;
function inland(x, z) {
  // the soft minimum of the distances to the four coasts (the island is a strip, rounded at its ends)
  const d = [shoreX(z) - x, x - westX(z), z - N_END, S_END - z], s = 12;
  return -s * Math.log(d.reduce((a, v) => a + Math.exp(-v / s), 0));
}
const lump = (x, z) => 0.9 * Math.sin(x / 13 + 1) * Math.sin(z / 11) + 0.6 * Math.sin(x / 5.5 + z / 7);

/** The ground without the houses' pits. */
export function baseHeight(x, z) {
  const d = inland(x, z), dE = shoreX(z) - x;
  let h;
  if (d < 0) h = Math.max(-9, 0.2 + 0.3 * d);
  else if (d < 6) h = 0.2 + (G - 0.2) * smooth(0, 6, d);
  else h = G;
  if (d >= 6) h += (22 * smooth(46, 125, dE) + lump(x, z) * smooth(46, 75, dE)) * smooth(8, 40, d);
  const edge = smooth(RADIUS - 60, RADIUS - 8, Math.hypot(x, z));
  return h * (1 - edge) + RIM * edge;
}

// ── the houses ──
// Interior half-extents are w/2 − 0.4 across and d/2 − 0.4 deep (the walls 0.4 thick, boards on posts).
const ORDER = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
export const LANDMARK = 8;
let HOUSES = null;
/** The houses: { i, c: [x, z] (centre), yaw, w (across), d (deep), seed, age (0 new … 1 old), ridge, eave }. */
export function houses() {
  if (HOUSES) return HOUSES;
  const rand = rng(1850);
  const ws = ORDER.map((i) => (i === LANDMARK ? 15.6 : 11.2 + Math.round(rand() * 38) / 10));
  const zs = [];
  zs[LANDMARK] = 0;
  for (let i = LANDMARK + 1; i < ORDER.length; i++) zs[i] = zs[i - 1] + (ws[i - 1] + ws[i]) / 2 + 3 + rand() * 2;
  for (let i = LANDMARK - 1; i >= 0; i--) zs[i] = zs[i + 1] - (ws[i + 1] + ws[i]) / 2 - 3 - rand() * 2;
  HOUSES = ORDER.map((i) => {
    const z = zs[i], w = ws[i], d = i === LANDMARK ? 14 : 12 + Math.round(rand() * 15) / 10;
    const front = 14.5 + (rand() - 0.5) * 3 - (i === LANDMARK ? 1 : 0);          // the front wall's distance from the arc
    const slope = 0.0036 * z, fl = Math.hypot(1, slope), fx = 1 / fl, fz = -slope / fl;
    const dist = front + d / 2, x = arc(z) - dist * fx, zc = z - dist * fz;
    const yaw = Math.atan2(-fx, -fz);
    return { i, c: [x, zc], yaw, w, d, seed: 100 + i * 31, age: i === LANDMARK ? 0.55 : rand(), ridge: 4.9 + (w - 11) * 0.1, eave: 2.7, front: [fx, fz], landmark: i === LANDMARK };
  });
  return HOUSES;
}
/** A point in a house's frame: u across (+x local), v deep (+z local, the back); the front is −v. */
export function toLocal(h, x, z) {
  const dx = x - h.c[0], dz = z - h.c[1], c = Math.cos(h.yaw), s = Math.sin(h.yaw);
  return [dx * c - dz * s, dx * s + dz * c];
}
export function toWorld(h, u, v) {
  const c = Math.cos(h.yaw), s = Math.sin(h.yaw);
  return [h.c[0] + u * c + v * s, h.c[1] - u * s + v * c];
}
/** Inside a house's walls by margin m (m > 0: inside, m < 0: a margin outside). */
export function inHouse(x, z, m = 0) {
  for (const h of houses()) {
    const [u, v] = toLocal(h, x, z);
    if (Math.abs(u) < h.w / 2 - m && Math.abs(v) < h.d / 2 - m) return h;
  }
  return null;
}
/** The ground: the terrain with each house's pit dug (the whole inside, 1.2 m down, its rim under the ledge). */
export function height(x, z) {
  let h = baseHeight(x, z);
  if (x < -60 || x > 100) return h;
  for (const H of houses()) {
    if (Math.abs(z - H.c[1]) > H.d / 2 + 4) continue;
    const [u, v] = toLocal(H, x, z);
    const k = smooth(0, 0.8, Math.min(H.w / 2 - 0.65 - Math.abs(u), H.d / 2 - 0.65 - Math.abs(v)));
    if (k > 0 && h > G - PIT) h = h + (G - PIT - h) * k;   // a pit only lowers the ground (a house by the shore leaves the sea bed alone)
  }
  return h;
}
export const inSea = (x, z) => height(x, z) < SEA - 0.2;

/** The house floor tiers in the house's frame (u across, v deep), as rects [u0, v0, u1, v1] with the depth below the terrace. */
export function tiers(h) {
  const hw = h.w / 2 - 0.4, hd = h.d / 2 - 0.4;
  const t1 = 2.0, t2 = 3.4;                                   // the ledge's width, the lower platform's outer edge
  const fr = 1.4;                                             // the front landing (v from −hd)
  return {
    hw, hd,
    ledge: [[-hw, -hd, -hw + t1, hd], [hw - t1, -hd, hw, hd], [-hw + t1, hd - t1, hw - t1, hd], [-hw + t1, -hd, hw - t1, -hd + fr]],
    low: [[-hw + t1, -hd + fr, -hw + t2, hd - t1], [hw - t2, -hd + fr, hw - t1, hd - t1], [-hw + t2, hd - t2 + 0.6, hw - t2, hd - t1], [-hw + t1, -hd + fr, hw - t1, -hd + fr + 1.4]],
    pit: [-hw + t2, -hd + fr + 1.4, hw - t2, hd - t2 + 0.6],
  };
}

// ── poles, canoes, racks ──
let FIT = null;
const frontOf = (z) => { const slope = 0.0036 * z, fl = Math.hypot(1, slope); return [1 / fl, -slope / fl]; };
/** Everything else on the ground: { poles, canoes, racks, boxes, logs }. */
export function village() {
  if (FIT) return FIT;
  const rand = rng(46), H = houses();
  const poles = [], canoes = [], racks = [], logs = [], stacks = [];
  // the frontal pole of each house, set 0.85 m before the front wall's middle (the house's element draws it)
  // memorial poles: in the street between the houses and the water, before some of the houses
  H.forEach((h, k) => {
    const [fx, fz] = h.front;
    if (k % 3 === 1 || k === LANDMARK + 1) {
      const dist = 10 + rand() * 2, p = [arc(h.c[1]) - dist * fx + (rand() - 0.5) * 3, h.c[1] + (h.w * 0.22) * (k % 2 ? 1 : -1)];
      poles.push({ kind: 'memorial', c: p, yaw: h.yaw, h: 11 + rand() * 3.4, seed: 300 + k, r: 0.5 });
    }
    // mortuary poles near the house corners, at the front, between neighbours
    if (k < H.length - 1 && k % 2 === 0) {
      const z = (h.c[1] + H[k + 1].c[1]) / 2, [gx, gz] = frontOf(z), dist = 15.5 + rand() * 2;
      poles.push({ kind: 'mortuary', c: [arc(z) - dist * gx, z], yaw: h.yaw, h: 6 + rand() * 2.2, seed: 400 + k, r: 0.34 });
    }
  });
  // the graveyard at the south end: mortuary poles close set
  const zs0 = H[H.length - 1].c[1] + 17;
  for (let k = 0; k < 7; k++) {
    const z = zs0 + (k % 4) * 3.4 + rand() * 1.5, dist = 16 + Math.floor(k / 4) * 4.5 + rand() * 1.5, [gx, gz] = frontOf(z);
    if (Math.hypot(arc(z) - dist * gx, z) > RADIUS - 40) continue;
    poles.push({ kind: 'mortuary', c: [arc(z) - dist * gx, z], yaw: Math.atan2(-gx, -gz), h: 5.6 + rand() * 2.4, seed: 500 + k, r: 0.32 });
  }
  // canoes drawn up the beach, bow to the land, on rollers; a few moored in the shallows
  const cz = [-128, -104, -80, -61, -38, -20, 18, 40, 62, 86, 110, 132];
  cz.forEach((z, k) => {
    const l = 6.5 + rand() * 7.5, top = shoreX(z) + 2.0 + rand() * 1.5;       // the bow near the beach's top
    const moored = k % 4 === 3, ax = moored ? shoreX(z) + 12 + rand() * 4 : top + l / 2;
    canoes.push({ c: [ax, z + (rand() - 0.5) * 2], yaw: Math.PI / 2 + (rand() - 0.5) * (moored ? 0.5 : 0.18), l, moored, seed: 600 + k });
  });
  // drying racks and woodpiles in the street, plank stacks by the houses
  H.forEach((h, k) => {
    const [fx, fz] = h.front;
    if (k % 3 === 0) { const dist = 8.5, z = h.c[1] + h.w * 0.3; const [gx] = frontOf(z); racks.push({ c: [arc(z) - dist * gx, z], yaw: h.yaw, w: 3.6 + rand() * 1.4, seed: 700 + k }); }
    if (k % 4 === 2) { const side = h.w / 2 + 1.1, p = toWorld(h, side, -h.d / 2 + 2.2); stacks.push({ c: p, yaw: h.yaw, kind: 'planks', seed: 750 + k }); }
    if (k % 3 === 1) { const p = toWorld(h, -h.w / 2 - 1.0, -h.d / 2 + 1.4); stacks.push({ c: p, yaw: h.yaw, kind: 'wood', seed: 780 + k }); }
    void fx; void fz;
  });
  // driftwood logs on the beach top
  for (let z = -150; z <= 150; z += 17 + rand() * 12) logs.push({ c: [shoreX(z) + 0.4 + rand() * 1.2, z], yaw: Math.PI / 2 + (rand() - 0.5) * 0.7, l: 4 + rand() * 6, r: 0.22 + rand() * 0.2 });
  // the log being hollowed, at the north end
  const zn = H[0].c[1] - 16, [nx] = frontOf(zn);
  const hollow = { c: [arc(zn) - 12 * nx, zn], yaw: Math.PI / 2 + 0.1, l: 9 };
  return (FIT = { poles, canoes, racks, logs, stacks, hollow });
}
export const footprints = () => village().poles.map((p) => p.c);

/** Sea lanes for the paddled canoes (x0, z0, x1, z1): a long lane off the beach and one across the bay. */
export const LANES = [[78, -150, 96, 150]];
