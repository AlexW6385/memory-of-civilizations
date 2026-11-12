// Ptolemaic Alexandria about 250 BC — the layout (docs/settlements/alexandria.md §2). North is the sea: the Great Harbour
// opens to it between the island of Pharos (with the lighthouse at its east end) and the Lochias cape; the Heptastadion, the
// mole, runs from the island to the town with two arched channels; west of it the Eunostos; the town on its strip between the
// sea and Lake Mareotis (the south): the royal quarter with the Museion in the north-east, the Jewish quarter east of it,
// the old Egyptian Rhakotis with the Serapeum's rock in the west, the Canopic Way and the Soma street crossing at the middle.
// Compressed from 5.4 km to this disc. Pure data. +x east, +z south.

export const RADIUS = 520;
export const SEA = -2.5, RIM = -10, GROUND = 1.2;
export const ISLAND = [-400, -340, 45, -250];
export const MOLE = [-246, -262, -228, -88];                       // the Heptastadion
export const CHANNELS = [[-246, -214, -228, -204], [-246, -150, -228, -140]];   // the two channels under it
export const MAIN = [-470, -90, 470, 255];
export const LOCHIAS = [330, -160, 430, -88];
export const HILL = { c: [-330, 150], R: 90, h: 12 };              // the rock of Rhakotis, the Serapeum on its top
export const PHAROS = { c: [-14, -296], base: 30 };
export const CANOPIC = [-470, 58, 470, 82];                         // the Canopic Way, 24 m
export const SOMA = [48, -90, 72, 255];                             // the street of the Soma
export const QUAY = [-228, -90, 430, -82];                          // the promenade on the harbour front
export const ROYAL = [128, -90, 440, 58];                           // the Brucheion
export const MUSEION = [150, -84, 330, -6];
export const JEWISH = [335, 0, 470, 255];
export const EGYPTIAN = [-470, -90, -126, 255];
export const SEROUTE = { rect: [-372, 108, -288, 192], y: 12 };      // the Serapeum's precinct
export const AGORA = [76, 86, 128, 142];
export const GYM = [150, 88, 184, 119];
export const OPEN_HOUSE = [96, -42, 109, -28];                       // a Greek craftsman's house that can be walked into (greek simon_house)
export const GYMZONE = [140, 84, 240, 150];
export const STREETS_Z = [-45, -8, 21, 108, 146, 184, 222];             // the cross streets (6 m), besides the Canopic Way
export const ALLEYS_X = [-396, -300, -210, -126, 150, 232, 318, 404];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const inside = (r, x, z) => Math.min(x - r[0], r[2] - x, z - r[1], r[3] - z);

/** How far onto land (negative in the water). */
export function wet(x, z) {
  let w = Math.max(inside(MAIN, x, z), inside(ISLAND, x, z), inside(MOLE, x, z), inside(LOCHIAS, x, z));
  for (const c of CHANNELS) { const d = inside(c, x, z); if (d > -0.01) w = Math.min(w, -d - 0.5); }
  return Math.min(w, RADIUS - 60 - Math.hypot(x, z));
}
export const inWater = (x, z) => wet(x, z) < -0.5;
export function height(x, z) {
  const w = wet(x, z), r = Math.hypot(x, z);
  let h = w > 0.5 ? GROUND : w > -0.5 ? GROUND + (SEA - 2 - GROUND) * smooth(0.5, -0.5, w) : SEA - 2;
  if (w > 2) { const d = Math.hypot(x - HILL.c[0], z - HILL.c[1]); h += HILL.h * smooth(HILL.R, HILL.R * 0.6, d); }
  return r > RADIUS - 60 ? h + (RIM - h) * smooth(RADIUS - 60, RADIUS - 10, r) : h;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The quay walls along the harbour front, the mole and the island (rects: x0, z0, x1, z1; the stone's face is its water side). */
export const QUAYS = [
  [-228, -91.2, 430, -89.0],                                        // the harbour front, the Great Harbour's
  [-400, -91.2, -246, -89.0],                                       // the Eunostos's
  [-228.8, -262, -227.2, -216],                                      // the mole's east side, between the channels and the island
  [-228.8, -202, -227.2, -152], [-228.8, -138, -227.2, -91],
  [-247.8, -262, -246.2, -216], [-247.8, -202, -246.2, -152], [-247.8, -138, -246.2, -91],
  [-228, -251.2, 45, -249.0],                                       // the island's south side, on the harbour
];

let LOTS = null;
/**
 * The houses: in rows between the streets, each facing a street; { rect, seed, y, front ('s'|'n'), quarter ('greek'|'egyptian'|'jewish'), w, d }.
 * Kept off the royal quarter, the Gymnasium, the agora, the Serapeum's hill, the streets and the alleys.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(250);
  const bands = [[-82, -48, 2], [-42, -11, 2], [-5, 18, 's'], [24, 43, 'n'], [111, 143, 2], [149, 181, 2], [187, 219, 2], [225, 252, 'n']];
  for (const [za, zb, k] of bands) {
    const rows = k === 2 ? [[za, (za + zb) / 2 - 0.4, 'n'], [(za + zb) / 2 + 0.4, zb, 's']] : [[za, zb, k]];
    for (const [z0, z1, face] of rows) {
      // a row of houses; 'n' rows face the street on their north (front toward −z), 's' rows the street on their south
      for (let x = -440; x < 440;) {
        const w = 13 + Math.floor(rand() * 8), d = z1 - z0, cx = x + w / 2, cz = (z0 + z1) / 2;
        const rect = [x, z0, x + w, z1];
        x += w + (rand() < 0.15 ? 2 : 0.6);
        if (ALLEYS_X.some((a) => cx > a - 4 && cx < a + 4 + w / 2) && rand() < 1) { /* the alley's mouth: skip a house width */ if (ALLEYS_X.some((a) => Math.abs(cx - a) < w / 2 + 3)) continue; }
        if (inRect(ROYAL, cx, cz, 3) || inRect(SOMA, cx, cz, 10) || inRect(AGORA, cx, cz, 4) || inRect(OPEN_HOUSE, cx, cz, 14) || inRect(GYMZONE, cx, cz, 0)) continue;
        if (inRect(SEROUTE.rect, cx, cz, 14) || Math.hypot(cx - HILL.c[0], cz - HILL.c[1]) < 60) continue;
        if ([rect[0], rect[2]].some((px) => [z0, z1].some((pz) => wet(px, pz) < 3)) || Math.hypot(cx, cz) > RADIUS - 75) continue;
        if (rand() < 0.07) continue;
        const ys = [[rect[0], z0], [rect[2], z0], [rect[0], z1], [rect[2], z1]].map(([a, b]) => height(a, b));
        if (Math.max(...ys) - Math.min(...ys) > 2.2) continue;
        const quarter = cx < EGYPTIAN[2] ? 'egyptian' : cx > JEWISH[0] && cz > JEWISH[1] ? 'jewish' : 'greek';
        const warehouse = z0 === -82 && face === 'n' && cx > -215 && cx < 90 && d > 14;      // the horrea along the emporium's quay
        LOTS.push({ rect, seed: Math.floor(rand() * 1e6), y: Math.min(...ys), front: face, quarter, w, d, warehouse });
      }
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** The paved and open ground that is street. */
export function onStreet(x, z, m = 0) {
  if (inRect(CANOPIC, x, z, m) || inRect(SOMA, x, z, m) || inRect(QUAY, x, z, m)) return true;
  if (STREETS_Z.some((s) => Math.abs(z - s) < 3 + m) || ALLEYS_X.some((a) => Math.abs(x - a) < 3 + m)) return wet(x, z) > 0.5 && !inRect(ROYAL, x, z) ? !inLot(x, z, -0.1) : false;
  return false;
}

/** The ships at their moorings along the quays (the harbour plan builds them; the movers keep clear of them). */
export const SHIPS = [
  { kind: 'merchant', at: [-190, -97], rot: Math.PI / 2, len: 24, seed: 1 }, { kind: 'merchant', at: [-152, -97.5], rot: Math.PI / 2, len: 26, seed: 2 },
  { kind: 'galley', at: [-104, -97], rot: Math.PI / 2, len: 34, seed: 3 }, { kind: 'merchant', at: [-56, -97], rot: Math.PI / 2, len: 24, seed: 4 },
  { kind: 'lighter', at: [-22, -95.5], rot: Math.PI / 2 + 0.05, len: 9, seed: 5 }, { kind: 'lighter', at: [-8, -95.5], rot: Math.PI / 2 - 0.04, len: 9, seed: 6 },
  { kind: 'merchant', at: [26, -97], rot: Math.PI / 2, len: 25, seed: 7 }, { kind: 'lighter', at: [62, -95.5], rot: Math.PI / 2, len: 9, seed: 8 },
  { kind: 'merchant', at: [150, -97.5], rot: Math.PI / 2, len: 26, seed: 9 }, { kind: 'galley', at: [214, -98.5], rot: Math.PI / 2, len: 34, seed: 10 },
  { kind: 'galley', at: [262, -98.5], rot: Math.PI / 2, len: 34, seed: 11 }, { kind: 'merchant', at: [330, -97], rot: Math.PI / 2, len: 24, seed: 12 },
  { kind: 'merchant', at: [-330, -97], rot: Math.PI / 2, len: 24, seed: 13 }, { kind: 'merchant', at: [-292, -97], rot: Math.PI / 2, len: 26, seed: 14 },
  { kind: 'lighter', at: [-372, -95.5], rot: Math.PI / 2, len: 9, seed: 15 }, { kind: 'merchant', at: [-120, -257.5], rot: Math.PI / 2, len: 24, seed: 16 },
  { kind: 'merchant', at: [-60, -257.5], rot: Math.PI / 2, len: 26, seed: 17 },
  // the pier before the arrival and the ships lying off it, in the view to the Pharos (the arrival looks north-west)
  { kind: 'merchant', at: [72.6, -108], rot: 0, len: 26, seed: 18 }, { kind: 'lighter', at: [84.9, -112], rot: 0.04, len: 9, seed: 19 },
  // the island's quay: the fishermen's and the keepers' lighters, and a merchantman standing in from the open sea
  { kind: 'lighter', at: [-46, -246.5], rot: Math.PI / 2, len: 9, seed: 24 }, { kind: 'lighter', at: [-110, -246.5], rot: Math.PI / 2 + 0.03, len: 9, seed: 25 },
  { kind: 'lighter', at: [-168, -246.5], rot: Math.PI / 2, len: 9, seed: 26 }, { kind: 'merchant', at: [140, -262], rot: 2.6, len: 25, seed: 27 },
  { kind: 'galley', at: [230, -200], rot: 2.0, len: 34, seed: 28 },
    { kind: 'merchant', at: [40, -170], rot: 1.1, len: 24, seed: 20 }, { kind: 'galley', at: [112, -190], rot: 1.9, len: 34, seed: 21 },
  { kind: 'lighter', at: [96, -140], rot: 0.5, len: 9, seed: 22 }, { kind: 'merchant', at: [10, -215], rot: 2.2, len: 26, seed: 23 },
];
/** The pier running out into the Great Harbour before the arrival (x0, z0, x1, z1): its deck is the quay's level, ships on both sides, a crane at its head. */
export const PIER = [77, -126, 83, -90];

let ISLE = null;
/**
 * The village of the island of Pharos (docs/settlements/alexandria.md §12): a row of fishermen's and keepers' houses on the island's
 * south side facing the quay, east and west of the tower's court, and the fuel store for the fire. { houses: [{ rect, seed, y }], store: rect, palms, nets }
 */
export function isle() {
  if (ISLE) return ISLE;
  const rand = rng(331), houses = [], zs = [-274, -260], STORE = [-84, -274, -62, -260];
  for (let x = -212; x < 40;) {
    const w = 11 + Math.floor(rand() * 4), rect = [x, zs[0], x + w, zs[1]];
    x += w + 0.8 + (rand() < 0.2 ? 2.5 : 0);
    if (rect[2] > PHAROS.c[0] - 40 && rect[0] < PHAROS.c[0] + 40) continue;                                       // the tower's court
    if (rect[2] > STORE[0] - 1 && rect[0] < STORE[2] + 1) continue;
    if ([rect[0], rect[2]].some((px) => zs.some((pz) => wet(px, pz) < 3))) continue;
    houses.push({ rect, seed: Math.floor(rand() * 1e6), y: height((rect[0] + rect[2]) / 2, (zs[0] + zs[1]) / 2) });
  }
  const palms = [], nets = [];
  for (let x = -200; x < 30; x += 22 + rand() * 8) if (wet(x, -255) > 2 && Math.abs(x - PHAROS.c[0]) > 36) palms.push([x, -254.6]);
  for (let x = -190; x < 30; x += 38 + rand() * 12) if (wet(x, -254) > 2 && Math.abs(x - PHAROS.c[0]) > 36) nets.push([x, -255.4]);
  ISLE = { houses, store: STORE, palms, nets };
  return ISLE;
}
