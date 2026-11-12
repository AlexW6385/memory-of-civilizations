// Bauhaus Dessau, c. 1927 — the layout (docs/settlements/bauhaus-dessau.md §2–§4). Pure data.
// +x east, +z south, y up, metres. The school stands at the origin; Kothener Strasse runs east–west under
// its bridge, Mauerstrasse north–south beside the workshop wing's glass wall; the Masters' Houses stand in the
// pine grove on Ebertallee to the south-east; Törten's rows at the south-west edge.

export const RADIUS = 190;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The school building (docs §2): levels, wings, stairs. */
export const LV = { f0: 0.3, f1: 4.4, f2: 8.5, roof: 12.6 };
export const PL = { f0: 0.3, f1: 3.45, f2: 6.6, f3: 9.75, f4: 12.9, roof: 16.05 };       // the Prellerhaus' floors
export const B = {
  ww: [-17, 4, 1, 34],            // workshop wing (glass wall on its west face)
  bridge: [-15, -10, 1, 4],       // over Kothener Strasse
  nw: [-17, -28, 35, -10],        // north wing (the school)
  fest: [1, 14, 41, 34],          // Aula, stage, canteen
  pre: [41, 8, 51, 34],           // Prellerhaus
};
export const ROAD_K = [-190, -10, 190, 4];                    // Kothener Strasse
export const ROAD_M = [-34, -190, -20, 190];                  // Mauerstrasse
export const ROAD_KV = [-100, -190, -88, 190];                // Kavalierstrasse
export const ROAD_C1 = [-190, -100, -34, -90], ROAD_C2 = [-190, 96, -34, 106];
export const ROAD_E = [-20, 74, 190, 84];                     // Ebertallee
export const ROADS = [ROAD_K, ROAD_M, ROAD_KV, ROAD_C1, ROAD_C2, ROAD_E];
export const inRoad = (x, z, m = 0) => ROADS.some((r) => inRect(r, x, z, m));
export const FOOT = 2.5;                                       // the pavement beside each street

/** The Masters' Houses on Ebertallee's north side: the director's house and three doubles. */
export const MASTERS = [
  { id: 'gropius', rect: [48, 48, 66, 68], kind: 'single', turn: 0, seed: 1 },
  { id: 'moholy', rect: [78, 48, 102, 68], kind: 'double', turn: 0, seed: 2 },
  { id: 'muche', rect: [112, 48, 134, 70], kind: 'double', turn: 1, seed: 3 },
  { id: 'kandinsky', rect: [144, 48, 168, 68], kind: 'double', turn: 0, seed: 4 },
];
export const PINES = [30, 38, 188, 72];                        // the grove
/** Törten's rows (docs §4): rows of two-storey flat-roofed houses, south-west. */
export const TORTEN = [[-12, 118, 62, 128], [-12, 138, 62, 148], [-12, 162, 62, 172]];
export const TORTEN_FRONT = ['s', 'n', 's'];                   // rows 1 and 2 face each other across a lane; row 3 faces south
export const KONSUM = [66, 118, 81.5, 130];                   // Gropius's cooperative shop and tower, at the end of the first row (1928)

/** The building lots of the town: tenements along the streets (rect, front, storeys, shop, roof, seed). */
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1927), R = RADIUS - 14;
  const fits = (rect) => Math.hypot((rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2) < R && !ROADS.some((r) => inRect(r, (rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2, 0)) && !blocked(rect);
  const blocked = (rect) => [B.ww, B.bridge, B.nw, B.fest, B.pre].some((b) => !(rect[2] < b[0] - 6 || rect[0] > b[2] + 6 || rect[3] < b[1] - 6 || rect[1] > b[3] + 6))
    || MASTERS.some((m) => !(rect[2] < m.rect[0] - 4 || rect[0] > m.rect[2] + 4 || rect[3] < m.rect[1] - 4 || rect[1] > m.rect[3] + 4));
  /** a row of lots along z from za to zb at depth rect [x0, x1]; front 'e' (door on the east side) or 'w'. */
  const rowZ = (x0, x1, za, zb, front, skip = []) => {
    let z = za;
    while (z < zb - 10) {
      const w = 12 + Math.floor(rand() * 5) * 2, ze = Math.min(z + w, zb);
      const rect = [x0, z, x1, ze];
      if (ze - z >= 10 && fits(rect) && !skip.some((s) => !(rect[3] < s[0] || rect[1] > s[1]))) push(rect, front);
      z = ze;
    }
  };
  const rowX = (z0, z1, xa, xb, front) => {
    let x = xa;
    while (x < xb - 10) {
      const w = 12 + Math.floor(rand() * 5) * 2, xe = Math.min(x + w, xb), rect = [x, z0, xe, z1];
      if (xe - x >= 10 && fits(rect)) push(rect, front);
      x = xe;
    }
  };
  const push = (rect, front) => {
    const r = rand(), shop = r < 0.22, modern = !shop && rand() < 0.14;
    LOTS.push({ rect, front, storeys: modern ? 3 : 3 + Math.floor(rand() * 2), shop, modern, roof: modern ? 'flat' : rand() < 0.3 ? 'mansard' : 'hip', seed: Math.floor(rand() * 1e6) });
  };
  const F = FOOT, cross1 = [ROAD_C1[1] - 1, ROAD_C1[3] + 1], cross2 = [ROAD_C2[1] - 1, ROAD_C2[3] + 1];
  // Mauerstrasse's west side and Kavalierstrasse's east side (the block between them), north and south of Kothener
  for (const [za, zb] of [[-186, -14 - F], [7 + F, 186]]) {
    rowZ(ROAD_M[0] - F - 24, ROAD_M[0] - F, za, zb, 'e', [cross1, cross2]);
    rowZ(ROAD_KV[2] + F, ROAD_KV[2] + F + 24, za, zb, 'w', [cross1, cross2]);
    rowZ(ROAD_KV[0] - F - 24, ROAD_KV[0] - F, za, zb, 'e', [cross1, cross2]);
  }
  // Mauerstrasse's east side north of the school, and Kothener's two sides east of the school
  rowZ(ROAD_M[2] + F, ROAD_M[2] + F + 22, -186, -34, 'w');
  rowX(ROAD_K[1] - F - 20, ROAD_K[1] - F, 40, 186, 's');
  rowX(ROAD_K[3] + F, ROAD_K[3] + F + 18, 66, 186, 'n');
  // the cross streets' sides in the west
  rowX(ROAD_C1[1] - F - 20, ROAD_C1[1] - F, -186, ROAD_KV[0] - F - 24, 's');
  rowX(ROAD_C2[3] + F, ROAD_C2[3] + F + 20, -186, ROAD_KV[0] - F - 24, 'n');
  // Ebertallee's south side: villas
  rowX(ROAD_E[3] + F + 3, ROAD_E[3] + F + 17, -15, 186, 'n');
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** The Törten rows' own footprints and the Konsum (no planting there). */
export const inTortenHouses = (x, z, m = 0) => TORTEN.some((r) => inRect(r, x, z, m)) || inRect(KONSUM, x, z, m);
export const inMasters = (x, z, m = 0) => MASTERS.some((h) => inRect(h.rect, x, z, m));
export const inTorten = (x, z, m = 0) => TORTEN.some((r, i) => inRect([r[0] - 3, r[1] - (TORTEN_FRONT[i] === 's' ? 8 : 3), r[2] + 3, r[3] + (TORTEN_FRONT[i] === 's' ? 3 : 8)], x, z, m)) || inRect(KONSUM, x, z, m);
export const inSchool = (x, z, m = 0) => [B.ww, B.bridge, B.nw, B.fest, B.pre].some((b) => inRect(b, x, z, m));

/** Walking rectangles for the townspeople (movers.js): { r, weight, kind }. */
export function walkRects() {
  const out = [], F = FOOT;
  for (const r of [ROAD_K, ROAD_M, ROAD_KV, ROAD_E, ROAD_C1, ROAD_C2]) {
    const alongX = r[2] - r[0] > r[3] - r[1];
    if (alongX) out.push({ r: [r[0], r[1] - F, r[2], r[1]], weight: 1, kind: 'street' }, { r: [r[0], r[3], r[2], r[3] + F], weight: 1, kind: 'street' });
    else out.push({ r: [r[0] - F, r[1], r[0], r[3]], weight: 1, kind: 'street' }, { r: [r[2], r[1], r[2] + F, r[3]], weight: 1, kind: 'street' });
  }
  return out;
}
