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
// the causeway runs level on the plateau, goes down its edge with the ground and enters the valley
// temple by its west door (CAUSEWAY.down: where the descent begins and ends)
export const CAUSEWAY = { a: [168, -40], b: [312.5, 52], down: [270, 300] };
export const VALLEY_TEMPLE = [312, 34, 346, 70];
export const HARBOUR = [346, 18, 400, 96];
export const WEST_FIELD = [-330, -230, -150, 110];
export const EAST_FIELD = [200, -250, 300, -80];
export const CROW_WALL = { a: [-140, 150], b: [80, 150], h: 10, th: 10, gate: { at: 150, w: 4, h: 7 } };
export const TOWN = [-160, 165, 230, 360];
// c. 2500 BC, a generation later (docs/settlements/giza.md §10): the Great Sphinx lying in its quarry pit south-east of
// the plateau's edge, looking east, with Khafre's valley temple on the valley floor before it. Khafre's own pyramid and
// its upper temple lie beyond the settlement's edge, south-west; his causeway comes down to the valley temple from there.
export const SPHINX = { x0: 212, x1: 285, z: 166, len: 73, floor: -12.5 };
export const SPHINX_PIT = [205, 142, 296, 190];
export const KHAFRE_VT = [304, 112, 350, 154];
export const KV_Y = -12.3;
// Khafre's causeway: level on the plateau, down its edge, into the valley temple's west door (it goes on, beyond the settlement, to his pyramid)
export const KHAFRE_CW = { a: [212, 133], down: [270, 301], b: [304, 133] };
// the working quarry south of the boat pits, north of the Wall of the Crow: three benches cut down from the plateau
export const QUARRY = [46, 104, 134, 141];
export const QUARRY_DEPTH = 7.2;
// the five boat pits (docs/settlements/giza.md §4.2): two rectangular ones south of the pyramid,
// sealed with beams of limestone; three boat-shaped ones east of it — north and south of the
// mortuary temple and beside the causeway — sealed the same way. { c, len, w, ang, shape }
const CW = Math.atan2(CAUSEWAY.b[1] - CAUSEWAY.a[1], CAUSEWAY.b[0] - CAUSEWAY.a[0]);
export const BOAT_PITS = [
  { c: [22, 97], len: 31.2, w: 4.2, ang: 0, shape: 'rect', n: 41 },
  { c: [-16, 97], len: 32.5, w: 4.2, ang: 0, shape: 'rect', n: 40 },
  { c: [148, -112], len: 50, w: 7, ang: Math.PI / 2, shape: 'boat' },
  { c: [147, -9.6], len: 34, w: 4.4, ang: 0, shape: 'boat' },
  { c: [CAUSEWAY.a[0] + Math.cos(CW) * 45 + Math.sin(CW) * 11, CAUSEWAY.a[1] + Math.sin(CW) * 45 - Math.cos(CW) * 11], len: 45, w: 6.5, ang: CW, shape: 'boat' },
];
// Khufu's ship moored in the harbour beside the landing, her bow to the north
export const SHIP = { at: [366, 57], len: 43.6, ang: -Math.PI / 2 };

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
/** The plateau's height: level round the pyramid, falling east toward the valley and south toward the
 *  town. Its eastern edge lies at x 300 by the east cemetery and at x 270 from the causeway south, so
 *  that the causeway goes down it with the ground and the valley temple stands on the valley floor. */
export const VALLEY = -12, TOWN_Y = -5;
export function plateau(x, z) {
  const t = Math.max(0, Math.min(1, (z + 70) / 30)), edge = 300 - 30 * t * t * (3 - 2 * t);
  const east = Math.max(0, x - edge), south = Math.max(0, z - 140);
  return -Math.min(-VALLEY, east * 0.4) - Math.min(-TOWN_Y, south * 0.2);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let MASTABAS = null, SLOTS = null;
/** The empty slots of the cemetery's grid (where a tomb is not built, or not yet): { c, a, b, mat }. */
export function slots() { mastabas(); return SLOTS; }
/** The mastabas in their streets (docs/settlements/giza.md §4.4): { c, a (half east–west), b (half north–south), h, mat,
 *  seed } — rows along streets running north–south, crossed by east–west streets, the long axis of each tomb north–south
 *  and its chapel on the east face, in the West Field and the East Field. */
export function mastabas() {
  if (MASTABAS) return MASTABAS;
  MASTABAS = []; SLOTS = [];
  const rand = rng(2560);
  for (const [F, mat] of [[WEST_FIELD, 'limestone_core'], [EAST_FIELD, 'tura_limestone']]) {
    for (let x = F[0] + 10; x < F[2] - 14; x += 21) for (let z = F[1] + 16; z < F[3] - 14; z += 32) {
      const c = [x + (rand() - 0.5) * 1.2, z + (rand() - 0.5) * 1.5], a = 4.6 + rand() * 1.4, b = 9 + rand() * 4.5;
      if (Math.hypot(c[0] + a + 3, c[1]) > RADIUS - 30 || Math.hypot(c[0], c[1] + b) > RADIUS - 30 || Math.hypot(c[0], c[1] - b) > RADIUS - 30) continue;
      if (rand() < 0.12) { SLOTS.push({ c, a, b, mat }); continue; }
      MASTABAS.push({ c, a, b, h: 4.2 + rand() * 2.4, mat, seed: Math.floor(rand() * 1e6) });
    }
  }
  return MASTABAS;
}
let TOWNS = null;
const YARDS = ['pen', 'pen', 'pen', 'brickyard', 'brickyard', 'silo', 'silo', 'midden', 'threshing', 'threshing'];
/** Is this house furnished (enterable with its room and court fitted out)? Two in three. */
export const furnished = (l) => l.seed % 3 !== 2;
/** The workers' town: gallery halls in blocks, houses, bakeries: { kind, rect, seed }. */
export function town() {
  if (TOWNS) return TOWNS;
  TOWNS = [];
  const rand = rng(2550);
  // four blocks of galleries (long halls, 35 × 5 m, in rows) along streets
  for (let b = 0; b < 4; b++) {
    const x0 = -140 + b * 52;
    for (let k = 0; k < 7; k++) { const z0 = 172 + k * 7.5; TOWNS.push({ kind: 'gallery', rect: [x0, z0, x0 + 40, z0 + 5.6], seed: k }); }
    // the bakeries at the gallery block's south end (§5)
    for (let k = 0; k < 4; k++) TOWNS.push({ kind: 'bakery', rect: [x0 + 2 + k * 9.5, 227, x0 + 9.5 + k * 9.5, 232.5], seed: b * 4 + k + 1 });
  }
  // houses and bakeries round them
  for (let x = -150; x < 220; x += 11) for (let z = 236; z < 350; z += 11) {
    const skip = rand() < 0.25;
    if (Math.hypot(x, z) > RADIUS - 28) continue;
    const w = 7 + rand() * 3, d = 7 + rand() * 3;
    // (an empty lot is a yard: pen, brickyard, silo, midden or threshing floor)
    if (skip) { TOWNS.push({ kind: 'yard', yk: YARDS[Math.floor(rand() * YARDS.length)], rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) }); continue; }
    TOWNS.push({ kind: 'house', rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  for (let x = 80; x < 200; x += 12) for (let z = 172; z < 226; z += 12) {
    const skip = rand() < 0.3;
    if (Math.hypot(x, z) > RADIUS - 28) continue;
    if (skip) { TOWNS.push({ kind: 'yard', yk: YARDS[Math.floor(rand() * YARDS.length)], rect: [x, z, x + 9, z + 9], seed: Math.floor(rand() * 1e6) }); continue; }
    TOWNS.push({ kind: 'house', rect: [x, z, x + 9, z + 9], seed: Math.floor(rand() * 1e6) });
  }
  return TOWNS;
}
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
