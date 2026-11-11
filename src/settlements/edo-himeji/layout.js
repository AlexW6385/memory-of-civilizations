// Edo Himeji (c. 1620) — the layout of the settlement (docs/settlements/edo-himeji.md §2): the inner
// enclosure in its moat with Himeyama hill, the baileys on their stone ramparts and the keep cluster
// on top, the lord's residence in the Sannomaru, the main gate on the south; the samurai quarter
// round the moat; the middle moat on the south and the merchants' street beyond. Pure data.
// Coordinates: metres, +x east, +z south.

export const RADIUS = 400;
export const INNER = [-230, -200, 190, 210];          // within the inner moat
export const MOAT = 20;
export const BANK = 2;                                // the inner enclosure's ground above the plain
export const LEVEL = { bed: -3, water: -1.1 };
export const HILL = { c: [-30, -55], rx: 175, rz: 145, h: 24 };
// the baileys' stone platforms (top heights above the plain)
export const NINO = { rect: [-104, -142, 58, 26], top: 30 };
export const HON = { rect: [-80, -120, 30, 0], top: 37 };
export const DAI = { rect: [-58, -96, 2, -34], top: 46 };            // the keep cluster's base
export const NISHI = { rect: [-202, -95, -122, 55], top: 24 };
export const KEEP = { c: [-13, -50], base: 52 };                      // the main keep on its own stone base
export const SMALL = [{ c: [-13, -82], n: 'east' }, { c: [-45, -82], n: 'northwest' }, { c: [-45, -50], n: 'west' }];
export const GOTEN = [-62, 96, 62, 172];                             // the lord's residence
export const OTEMON = { x: 0, w: 16 };                                // the causeway and gate over the moat
export const MIDDLE = { z0: 296, z1: 314, gap: 8 };                   // the middle moat (south only)
export const STREET = { z0: 332, z1: 340 };                           // the merchants' street

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const [ix0, iz0, ix1, iz1] = INNER;
export const OUTER = [ix0 - MOAT, iz0 - MOAT, ix1 + MOAT, iz1 + MOAT];
/** In the inner moat's water (the causeway at the main gate left dry)? */
export const inMoat = (x, z) => inRect(OUTER, x, z) && !inRect(INNER, x, z) && !(Math.abs(x - OTEMON.x) < OTEMON.w / 2 && z > iz1);
export const inMiddle = (x, z) => z > MIDDLE.z0 && z < MIDDLE.z1 && Math.abs(x) > MIDDLE.gap / 2;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const fits = (r, m) => Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) <= RADIUS - m;

let LOTS = null;
/**
 * The town: samurai compounds (yashiki) on blocks round the inner moat, larger to the south; the
 * merchants' machiya, narrow and deep, on both sides of the street beyond the middle moat.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1609);
  // samurai blocks: 2 × n compounds of ~36 × 30 m between streets 8 m wide
  for (let x = -RADIUS; x < RADIUS; x += 44) for (let z = -RADIUS; z < MIDDLE.z0 - 6; z += 34) {
    const r = [x + 4, z + 3, x + 40, z + 31];
    if (!fits(r, 24) || inRect(OUTER, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, 22) || r[3] > MIDDLE.z0 - 4) continue;
    if (Math.abs((r[0] + r[2]) / 2) < 30 && r[1] > OUTER[3]) continue;                       // the avenue from the main gate
    if (rand() < 0.06) continue;
    LOTS.push({ t: 'yashiki', rect: r, seed: Math.floor(rand() * 1e6), gate: (r[1] + r[3]) / 2 > OUTER[3] ? 'n' : (r[3] < OUTER[1] ? 's' : ((r[0] + r[2]) / 2 < 0 ? 'e' : 'w')) });
  }
  // machiya: fronts of 6–9 m on both sides of the street
  for (const [z0, z1, front] of [[MIDDLE.z1 + 2, STREET.z0, 's'], [STREET.z1, STREET.z1 + 30, 'n']]) {
    for (let x = -RADIUS; x < RADIUS;) {
      const w = 6 + rand() * 3, r = [x, z0, x + w - 0.3, z1];
      x += w;
      if (!fits(r, 22) || Math.abs(r[0] + w / 2) < 6) continue;
      LOTS.push({ t: 'machiya', rect: r, seed: Math.floor(rand() * 1e6), front });
    }
  }
  // the trades of the merchants' fronts (docs §5.3): by their own stream so that the lots stay where they were
  const tr = rng(1688), TR = ['cloth', 'pottery', 'rice', 'dye', 'oil', 'sandals', 'tea', 'medicine', 'paper', 'fish', 'tofu', 'bucket'];
  const M = LOTS.filter((l) => l.t === 'machiya');
  for (const l of M) l.trade = TR[Math.floor(tr() * TR.length)];
  // one sake brewer (on the deep north row, near the middle) and two teahouses, each the lot nearest its place
  const near = (x, front) => M.filter((l) => l.front === front).reduce((a, l) => (Math.abs((l.rect[0] + l.rect[2]) / 2 - x) < Math.abs((a.rect[0] + a.rect[2]) / 2 - x) ? l : a));
  near(-90, 'n').trade = 'sake'; near(70, 's').trade = 'tea'; near(-150, 's').trade = 'tea';
  return LOTS;
}
let GRID = null;
export function inLot(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of lots()) for (let i = Math.floor((h.rect[0] - 3) / 20); i <= Math.floor((h.rect[2] + 3) / 20); i++) for (let j = Math.floor((h.rect[1] - 3) / 20); j <= Math.floor((h.rect[3] + 3) / 20); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
/** The hill's height above the inner enclosure's ground (before the platforms). */
export function hill(x, z) {
  const q = Math.hypot((x - HILL.c[0]) / HILL.rx, (z - HILL.c[1]) / HILL.rz);
  return q >= 1 ? 0 : HILL.h * smooth(0, 1, 1 - q) ** 0.8;
}
export const PLATFORMS = [NINO, NISHI, HON, DAI];
export const onPlatform = (x, z, m = 0) => PLATFORMS.some((p) => inRect(p.rect, x, z, m));

/** The streets and lanes of the town (rectangles [x0, z0, x1, z1]) for the walkers: the avenue from the main gate, the lanes between the samurai blocks, the merchants' street. */
export function streets() {
  const R = [], hit = (r) => r[2] > OUTER[0] - 3 && r[0] < OUTER[2] + 3 && r[3] > OUTER[1] - 3 && r[1] < OUTER[3] + 3;
  const ok = (r) => !hit(r) && Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) < RADIUS - 24;
  R.push([-4, OUTER[3] - 40, 4, STREET.z0 + 2]);
  for (let x = -RADIUS; x < RADIUS; x += 44) for (let z = -RADIUS; z < MIDDLE.z0 - 6; z += 34) {
    const v = [x + 40.6, z, x + 47.4, z + 34], h = [x, z + 31.6, x + 44, z + 36.4];
    if (ok(v) && v[3] < MIDDLE.z0 - 4) R.push(v);
    if (ok(h) && h[3] < MIDDLE.z0 - 4) R.push(h);
  }
  R.push([-RADIUS + 30, STREET.z0 + 0.5, RADIUS - 30, STREET.z1 - 0.5]);
  return R.filter((r) => r[2] > r[0] && r[3] > r[1]);
}
/** Street furniture: wells in the merchants' street, sake barrels by the brewer, boats and landings on the middle moat. */
export function furniture() {
  const F = [], rand = rng(404);
  for (let x = -270; x < 270; x += 78) { const wx = x + rand() * 20; if (Math.abs(wx) > 10) F.push({ t: 'ido', at: [wx, STREET.z0 + 1.6], rot: 0 }); }
  const xs = Math.sqrt(RADIUS ** 2 - MIDDLE.z1 ** 2) - 36;
  for (const sx of [-1, 1]) for (const k of [0.3, 0.62]) {
    const x = sx * xs * k + sx * MIDDLE.gap / 2 + sx * 6;
    F.push({ t: 'landing', x, z0: MIDDLE.z0 });
    F.push({ t: 'moat_boat', at: [x + 6, MIDDLE.z0 + 4.2], dir: [1, 0], len: 6.5 + rand() * 1.5 });
  }
  // the civic furniture (docs §5.7): neighbourhood gates across the street, the fire-watch tower, notice boards, Jizō and Inari
  const sw = STREET.z1 - STREET.z0, zc = (STREET.z0 + STREET.z1) / 2;
  for (const x of [-160, -75, 75, 160]) F.push({ t: 'kido', at: [x, zc], w: sw });
  F.push({ t: 'hinomi_yagura', at: [-122, STREET.z0 + 1.7], h: 9 }, { t: 'hinomi_yagura', at: [112, STREET.z1 - 1.7], h: 9 });
  F.push({ t: 'kosatsu', at: [18, STREET.z1 - 0.8], rot: 0 }, { t: 'kosatsu', at: [-8.5, 262], rot: Math.PI / 2 });
  F.push({ t: 'inari', at: [14, 262], rot: Math.PI / 2 });
  const Y = lots().filter((l) => l.t === 'yashiki' && l.rect[3] > 200 && l.rect[3] < 295 && Math.abs((l.rect[0] + l.rect[2]) / 2) > 50 && Math.abs((l.rect[0] + l.rect[2]) / 2) < 150);
  for (let i = 0; i < Y.length; i += 3) F.push({ t: 'jizo', at: [Y[i].rect[2] + 1.8, Y[i].rect[3] + 1.8], rot: i % 2 ? 0 : Math.PI / 2 });
  return F;
}
