// Giza in the reign of Khufu (c. 2560 BC) — the layout of the settlement (docs/settlements/giza.md
// §2): the Great Pyramid in the middle, cased in white, inside its enclosure wall; its mortuary
// temple on the east, the queens' pyramids south of it, the causeway down to the valley temple and
// the harbour; the cemeteries of mastabas west and east; south of the Wall of the Crow the workers'
// town. Pure data. Coordinates: metres, +x east, +z south; the plateau falls away to the east.

export const RADIUS = 420;
export const PYRAMID = { c: [0, -40], a: 115.15, h: 146.6 };
export const ENCLOSURE = [-127, -167, 127, 87];
export const TEMPLE = [127, -66, 168, -14];
export const QUEENS = [[160, 18, 23, 30], [160, 70, 23, 29], [160, 118, 22, 28]];   // [x, z, half-base, height]
export const CAUSEWAY = { a: [168, -40], b: [318, 52] };
export const VALLEY_TEMPLE = [312, 34, 346, 70];
export const HARBOUR = [346, 18, 400, 96];
export const WEST_FIELD = [-330, -230, -150, 110];
export const EAST_FIELD = [200, -250, 300, -80];
export const CROW_WALL = { a: [-140, 150], b: [80, 150], h: 10, th: 10, gate: { at: 150, w: 4, h: 7 } };
export const TOWN = [-160, 165, 230, 360];

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
/** The plateau's height: level round the pyramid, falling east toward the valley and south toward the town. */
export const VALLEY = -12, TOWN_Y = -5;
export function plateau(x, z) {
  const east = Math.max(0, x - 300), south = Math.max(0, z - 140);
  return -Math.min(-VALLEY, east * 0.4) - Math.min(-TOWN_Y, south * 0.2);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let MASTABAS = null;
/** The mastabas in their streets: { c, a, b, h, mat } in the west and east fields. */
export function mastabas() {
  if (MASTABAS) return MASTABAS;
  MASTABAS = [];
  const rand = rng(2560);
  for (const [F, mat] of [[WEST_FIELD, 'limestone_core'], [EAST_FIELD, 'tura_limestone']]) {
    for (let x = F[0] + 12; x < F[2] - 12; x += 30) for (let z = F[1] + 10; z < F[3] - 10; z += 18) {
      const c = [x + (rand() - 0.5) * 2, z + (rand() - 0.5) * 2];
      if (Math.hypot(c[0], c[1]) > RADIUS - 30 || rand() < 0.15) continue;
      MASTABAS.push({ c, a: 9 + rand() * 4, b: 4.5 + rand() * 1.5, h: 4 + rand() * 2.5, mat });
    }
  }
  return MASTABAS;
}
let TOWNS = null;
/** The workers' town: gallery halls in blocks, houses, bakeries: { kind, rect, seed }. */
export function town() {
  if (TOWNS) return TOWNS;
  TOWNS = [];
  const rand = rng(2550);
  // four blocks of galleries (long halls, 35 × 5 m, in rows) along streets
  for (let b = 0; b < 4; b++) {
    const x0 = -140 + b * 52;
    for (let k = 0; k < 7; k++) { const z0 = 172 + k * 7.5; TOWNS.push({ kind: 'gallery', rect: [x0, z0, x0 + 40, z0 + 5.6], seed: k }); }
  }
  // houses and bakeries round them
  for (let x = -150; x < 220; x += 11) for (let z = 236; z < 350; z += 11) {
    if (rand() < 0.25 || Math.hypot(x, z) > RADIUS - 28) continue;
    const w = 7 + rand() * 3, d = 7 + rand() * 3;
    TOWNS.push({ kind: 'house', rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  for (let x = 80; x < 200; x += 12) for (let z = 172; z < 226; z += 12) {
    if (rand() < 0.3 || Math.hypot(x, z) > RADIUS - 28) continue;
    TOWNS.push({ kind: 'house', rect: [x, z, x + 9, z + 9], seed: Math.floor(rand() * 1e6) });
  }
  return TOWNS;
}
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
