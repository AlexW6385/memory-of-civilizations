// Victorian London about 1870 — the layout (docs/settlements/london.md §2, §6): Westminster. The Palace of
// Westminster along the Thames's west bank with the Clock Tower at its north end and the Victoria
// Tower at its south, Westminster Hall behind; Westminster Abbey to the west; Parliament Square;
// Westminster Bridge across to Lambeth; brick terraces on both banks. Pure data. +x east, +z south
// (the river runs north–south here).

export const RADIUS = 470;
export const GROUND = 2, RIVER = { x0: 115, x1: 255, level: -2.5, bed: -6 };
export const PALACE = [40, -140, 112, 130];
export const CLOCK = [96, -152];
export const HALL = [PALACE[0] - 30, -125, PALACE[0] - 6, -52];     // Westminster Hall, 73 m by 24 m over its walls
export const PORCH = [15, -52, 29, -41.5];                          // St Stephen's Porch, south of the hall
export const STEPHEN = [30.2, -50.5, 59.2, -41.5];                  // St Stephen's Hall, 29 m by 9 m, east from the porch
export const LOBBY = [69.7, -46];                                   // the Central Lobby's centre, under the Central Tower
export const VICTORIA = [80, 140];
export const ABBEY = [-200, 20, -70, 62];
export const SQUARE = [-60, -215, 40, -150];
export const SQ = { walkZ: -180, walkX: -10, statue: [22, -180] };            // Parliament Square's walks and Canning's plaza
export const BRIDGE = { z: -170, w: 16 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const bank = (z) => [RIVER.x0 + 6 * Math.sin(z / 90), RIVER.x1 + 8 * Math.sin(z / 110)];
export const inRiver = (x, z) => { const [a, b] = bank(z); return x > a + 2 && x < b - 2 && Math.hypot(x, z) < RADIUS - 60; };
export function height(x, z) {
  const [a, b] = bank(z), d = Math.min(x - a, b - x), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  const h = d > 0 ? GROUND + (RIVER.bed - GROUND) * smooth(0, 6, d) * (1 - edge) : GROUND;
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the streets (dossier §6): east–west streets every 30 m on Bridge Street's axis (7 m wide, Bridge Street itself 16 m),
// north–south cross streets every 84 m (7 m), the terraces in blocks between them, every house's front on a street.
export const STREET_W = 9, MAIN_W = 16, BLOCK_STEP = 30, CROSS_STEP = 84, CROSS_X0 = 44;
/** the centres of the east–west streets (z) and of the north–south cross streets (x) */
export const streetsZ = () => { const o = []; for (let k = -Math.ceil(RADIUS / BLOCK_STEP); k <= Math.ceil(RADIUS / BLOCK_STEP); k++) o.push(BRIDGE.z + k * BLOCK_STEP); return o; };
export const crossX = () => { const o = []; for (let k = -Math.ceil(RADIUS / CROSS_STEP) - 1; k <= Math.ceil(RADIUS / CROSS_STEP) + 1; k++) o.push(CROSS_X0 + k * CROSS_STEP); return o; };
const streetHalf = (zc) => (Math.abs(zc - BRIDGE.z) < 1 ? MAIN_W : STREET_W) / 2;
/** is this point in a part of the town given to something other than terraces (the palace, the hall's court, the abbey, the square, the tower's garden, the river and its roads) */
export function blocked(x, z, m = 0) {
  const [a, b] = bank(z);
  return inRect(PALACE, x, z, 14 + m) || inRect(ABBEY, x, z, 16 + m) || inRect(SQUARE, x, z, 6 + m) || (x > a - 14 - m && x < b + 14 + m)
    || inRect([HALL[0] - 12, -150, PALACE[0], HALL[3] + 22], x, z, m) || inRect([VICTORIA[0] - 60, VICTORIA[1] - 10, VICTORIA[0] + 20, VICTORIA[1] + 40], x, z, m);
}
const onCross = (x0, x1) => crossX().some((c) => x1 > c - STREET_W / 2 - 0.5 && x0 < c + STREET_W / 2 + 0.5);
/** the trade of a shop by the seed */
export const TRADES = ['draper', 'grocer', 'butcher', 'chemist', 'baker', 'pawnbroker', 'bootmaker', 'barber', 'tobacconist', 'greengrocer'];
let LOTS = null;
/** Terraces in blocks between the streets, back to back, each row's front on its street. The rows on and near Bridge Street are shops
 *  with a pub at the corners where the cross streets meet it (and at a few corners elsewhere); the rest are houses. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1870), zs = streetsZ();
  for (let k = 0; k + 1 < zs.length; k++) {
    const b0 = zs[k] + streetHalf(zs[k]), b1 = zs[k + 1] - streetHalf(zs[k + 1]), D = (b1 - b0 - 0.5) / 2;
    const main = Math.min(Math.abs(zs[k] - BRIDGE.z), Math.abs(zs[k + 1] - BRIDGE.z)) < 1;       // a block on Bridge Street
    const near = Math.min(Math.abs(zs[k] - BRIDGE.z), Math.abs(zs[k + 1] - BRIDGE.z)) < 70;
    for (const [za, front] of [[b0, 'n'], [b1 - D, 's']]) {
      const onMain = main && ((front === 'n' && Math.abs(zs[k] - BRIDGE.z) < 1) || (front === 's' && Math.abs(zs[k + 1] - BRIDGE.z) < 1));
      for (let x = -RADIUS + 30; x < RADIUS - 30;) {
        let w = 5.5 + rand() * 1.5;
        // the lot next to a cross street's corner: perhaps a pub, wider
        const nextC = crossX().find((c) => c - STREET_W / 2 - 0.5 >= x + 4), prevC = crossX().find((c) => Math.abs(c + STREET_W / 2 + 0.5 - x) < 0.6);
        const east = nextC !== undefined && nextC - STREET_W / 2 - 0.5 - (x + w) < 7.5, corner = east || prevC !== undefined;
        let pub = false;
        if (corner && rand() < (onMain ? 0.7 : 0.09)) { pub = true; w = east ? Math.min(10.5, Math.max(w, nextC - STREET_W / 2 - 0.5 - x)) : 7.5 + rand() * 2.5; }
        const x0 = x, x1 = x + w - 0.2, cx = x + w / 2, cz = za + D / 2;
        x += w;
        if (onCross(x0, x1)) { const c = crossX().find((c2) => x1 > c2 - STREET_W / 2 - 0.5 && x0 < c2 + STREET_W / 2 + 0.5); x = Math.max(x, c + STREET_W / 2 + 0.5); continue; }
        if (Math.hypot(cx, cz) > RADIUS - 45 || blocked(cx, cz) || blocked(x0, cz) || blocked(x1, cz)) continue;
        const e = { rect: [x0, za, x1, za + D], seed: Math.floor(rand() * 1e6), front, storeys: Math.hypot(cx, cz) > 290 && rand() < 0.55 ? 2 : 3 + (rand() < 0.3 ? 1 : 0), y: GROUND, pw: onMain ? 2.6 : 1.9 };
        if (pub) { e.pub = true; e.storeys = 3; e.corner = east ? 'e' : 'w'; }
        else if (onMain ? rand() < 0.9 : near ? rand() < 0.45 : rand() < 0.12) { e.shop = true; e.trade = TRADES[Math.floor(rand() * TRADES.length)]; e.storeys = 3 + (rand() < 0.2 ? 1 : 0); }
        LOTS.push(e);
      }
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** The ways walked, as rectangles { r, kind, weight }: the east–west streets and north–south cross streets in the stretches that are free,
 *  Bridge Street, the squares' paving and the embankments' promenades. */
export function walkRects() {
  const out = [], free = (x, z) => !blocked(x, z, -2) && Math.hypot(x, z) < RADIUS - 28, step = 6;
  const runs = (axis, c, h, lo, hi, kind, weight) => {
    let s = null;
    for (let t = lo; t <= hi + 0.01; t += step) {
      const ok = t <= hi && (axis === 'x' ? free(t, c) : free(c, t)) && (axis === 'x' ? free(t, c - h) && free(t, c + h) : free(c - h, t) && free(c + h, t));
      if (ok && s === null) s = t;
      if ((!ok || t + step > hi) && s !== null) { const e = ok ? t : t - step; if (e - s >= 10) out.push({ r: axis === 'x' ? [s, c - h, e, c + h] : [c - h, s, c + h, e], kind, weight }); s = null; }
    }
  };
  for (const zc of streetsZ()) { const main = Math.abs(zc - BRIDGE.z) < 1; runs('x', zc, (main ? MAIN_W : STREET_W) / 2 - 1.6, -RADIUS + 30, RADIUS - 30, main ? 'main' : 'street', main ? 3 : 1); }
  for (const xc of crossX()) runs('z', xc, STREET_W / 2 - 1.6, -RADIUS + 30, RADIUS - 30, 'street', 0.9);
  // the squares and the embankments' promenades along both banks
  out.push({ r: [SQUARE[0] + 3, SQUARE[1] + 3, SQUARE[2] - 3, SQUARE[3] - 3], kind: 'main', weight: 2.2 });
  for (const side of [0, 1]) for (let z = -RADIUS + 40; z < RADIUS - 56; z += 14) {
    if (Math.abs(z - BRIDGE.z) < BRIDGE.w / 2 + 6) continue;
    const xa = bank(z)[side] + (side ? 2.2 : -2.2), xb = bank(z + 14)[side] + (side ? 2.2 : -2.2), x0 = side ? Math.max(xa, xb) : Math.min(xa, xb) - 6, x1 = side ? Math.max(xa, xb) + 6 : Math.max(xa, xb);
    if (Math.hypot((x0 + x1) / 2, z) < RADIUS - 40) out.push({ r: [Math.min(x0, x1) + (side ? 0 : 0), z, Math.max(x0, x1), z + 14], kind: 'street', weight: 1.4 });
  }
  return out;
}
