// Persepolis about 480 BC — the layout (docs/settlements/persepolis.md §2): the terrace 300 m east–
// west by 455 m north–south, 14 m above the plain, against Kuh-e Rahmat on the east; the double
// stair up its west face at the north end; the Gate of All Nations; the Apadana; the Hall of a
// Hundred Columns; the palaces of Darius (Tachara) and Xerxes (Hadish); the Treasury; the town of
// Parsa on the plain to the west. Pure data. +x east, +z south.

export const RADIUS = 360;
export const TERRACE = { rect: [-150, -228, 150, 227], h: 14 };
export const STAIR = { x: -150, z: -140, w: 7 };            // the double-return stair's centre on the west face
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Kuh-e Rahmat: the mountain rising east of the terrace (fading at the settlement's edge). */
export function mountain(x, z) {
  const r = Math.hypot(x, z), f = smooth(RADIUS - 10, RADIUS - 110, r);
  return 90 * smooth(165, 330, x) * f;
}
export const ROAD = [-400, -146, -150, -134];               // the road from the plain to the stair
/** The market of Parsa beside the road to the terrace (docs/settlements/persepolis.md §14): no houses on it. */
export const MARKET = [-300, -128, -238, -92];
/** The royal workshops of Parsa beside the road below the stair (docs/settlements/persepolis.md §15): masons', carpenters' and smiths' yards in one walled compound. */
export const WORKSHOPS = [-238, -124, -178, -66];
/** The streets of Parsa (rectangles; the road to the stair, the cross streets, the market and the workshops' forecourt), 5 m wide. */
export const STREETS = [
  ...[-352, -306, -250, -190].map((x) => [x - 2.5, -330, x + 2.5, 340]),
  ...[-40, 60, 150, 240].map((z) => [-380, z - 2.5, -175, z + 2.5]),
  [-238, -66, -178, -60],
];
const overlaps = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null, GARDENS = null;
/** Where the visitor arrives (the foot of the road, before the stair): the houses near it are the ones walked into. */
export const ARRIVAL = [-220, -140];
export const TRADES = ['baker', 'potter', 'cloth', 'grain', 'fruit', 'butcher', 'carpenter', 'wine', 'smith', 'dyer'];
/** Houses of Parsa on the plain west and south-west of the terrace, packed in the blocks between the streets; each with its `front`, the side toward the nearest street. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; GARDENS = [];
  const rand = rng(480), ways = [ROAD, ...STREETS.slice(0, -1)];
  const XB = [[-382, -354.5], [-349.5, -308.5], [-303.5, -252.5], [-247.5, -192.5], [-187.5, -176]];
  const ZB = [[-332, -148.5], [-131.5, -42.5], [-37.5, 57.5], [62.5, 147.5], [152.5, 237.5], [242.5, 336]];
  for (const [bx0, bx1] of XB) for (const [bz0, bz1] of ZB) {
    for (let x = bx0 + 0.6; x < bx1 - 8;) {
      const w = Math.min(10.4 + rand() * 3, bx1 - x);
      for (let z = bz0 + 0.6; z < bz1 - 8;) {
        const d = Math.min(11.5 + rand() * 3.5, bz1 - z), seed = Math.floor(rand() * 1e6), r = [x, z, x + w, z + d], skip = rand() < 0.07;
        z += d + 1.1;
        if (Math.hypot(r[0], r[1]) > RADIUS - 28 || Math.hypot(r[0], r[3]) > RADIUS - 28 || overlaps(r, ROAD, 1) || overlaps(r, MARKET, 3) || overlaps(r, WORKSHOPS, 3) || overlaps(r, [-170, -200, -100, -80], 0)) continue;
        if (skip) { GARDENS.push({ rect: r, seed }); continue; }
        const mids = { n: [x + w / 2, r[1]], s: [x + w / 2, r[3]], w: [x, r[1] + d / 2], e: [x + w, r[1] + d / 2] };
        let front = 'n', best = 1e9, major = false;
        for (const [k, [px, pz]] of Object.entries(mids)) for (const s of ways) {
          const e = Math.hypot(Math.max(s[0] - px, 0, px - s[2]), Math.max(s[1] - pz, 0, pz - s[3]));
          if (e < best) { best = e; front = k; major = s === ROAD; }
        }
        // what the house is: a court-house, a plain house, or a shop (more of them near the road and the market)
        const q = rng(seed ^ 0x9e3779b9), mx = x + w / 2 - (MARKET[0] + MARKET[2]) / 2, mz = r[1] + d / 2 - (MARKET[1] + MARKET[3]) / 2, dm = Math.hypot(mx, mz);
        const pShop = major ? 0.7 : dm < 90 ? 0.5 : dm < 170 ? 0.3 : 0.14;
        const u = q(), kind = u < pShop ? 'shop' : u < pShop + (1 - pShop) * 0.5 ? 'court' : 'home';
        const da = Math.hypot(x + w / 2 - ARRIVAL[0], r[1] + d / 2 - ARRIVAL[1]);
        const enter = da < 210 && q() < (kind === 'court' ? 0.45 : 0.62);
        LOTS.push({ rect: r, seed, front, kind, enter, trade: kind === 'shop' ? TRADES[Math.floor(q() * TRADES.length)] : null });
      }
      x += w + 1.1;
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/** The lots left as gardens (orchards and vegetable plots behind low walls): { rect, seed }. */
export function gardens() { lots(); return GARDENS; }
export const inGarden = (x, z, m = 0) => gardens().some((g) => inRect(g.rect, x, z, m));
/** Wells (qanat shafts with a windlass) at the crossings of the streets nearest the market, and the market's own. */
export function wells() {
  const out = [], xs = [-352, -306, -250, -190], zs = [-40, 60, 150, 240];
  xs.forEach((x, i) => zs.forEach((z, j) => { if ((i + j) % 2 === 0 && Math.hypot(x, z) < RADIUS - 40) out.push({ at: [x + 1.3, z + 1.3], y: 0 }); }));
  out.push({ at: [(MARKET[0] + MARKET[2]) / 2, (MARKET[1] + MARKET[3]) / 2], y: 0 });
  return out;
}
