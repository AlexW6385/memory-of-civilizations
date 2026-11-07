// Granada about 1390 — the layout (docs/settlements/granada.md §2): the Alhambra on the long Sabika
// hill — the Alcazaba with its towers at the west end, the Nasrid palaces on the north edge
// (the Court of the Myrtles with the Comares Tower over the Darro, the Court of the Lions), the
// walls and towers round the hill's rim; the Darro's valley to the north and the Albaicín's white
// houses climbing beyond it. Pure data. +x east, +z south.

export const RADIUS = 400;
export const HILL = { c: [20, 10], r: [200, 62], top: 30 };
export const MYRTLES = [8, -32, 31, 4];
export const COMARES = [11.5, -57.6, 27.5, -41.6];   // the tower, 16 m square (§4.2)
export const LIONS = [44, -22, 72, -6];
export const ALCAZABA = [-170, -30, -120, 30];
// the Partal (§4.5): the Tower of the Ladies in the line of the north wall, the portico before it, the pool
export const PARTAL = { tower: [105, -48, 115, -38], pool: [103, -31.5, 117, -20.5] };
// the Rauda (§4.6): the royal mausoleum by the Palace of the Lions and its garden of tombs
export const RAUDA = { rect: [57, 8, 72, 18.2], garden: [57, 18.2, 72, 31] };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const hillE = (x, z) => Math.hypot((x - HILL.c[0]) / HILL.r[0], (z - HILL.c[1]) / HILL.r[1]);

// ——— The Generalife (§10): on the slope of the Cerro del Sol east of the Alhambra, across the
// ravine (the Cuesta de los Chinos), higher than the Alhambra; its palace on a terrace along the
// contour, the Patio de la Acequia running north–south, the orchards stepping down to the west and
// south-west, the water stairway climbing the hill to the east. The sultan's walled passage runs
// from a postern at the Alhambra's east end down into the ravine and up to the entrance courts.
export const GY = 38;                                   // the walks of the Patio de la Acequia
export const ACEQUIA = [281, -36, 293.8, 12.7];          // 12.8 × 48.7 m (§10.2)
export const GEN = {
  west: [280.2, -36, 281, 12.7],                         // the tall west wall, its mirador in the middle
  wMirador: [277.2, -14.65, 280.2, -8.65],
  north: [280.2, -46.4, 294.6, -36],                     // the north pavilion: portico, gallery, Sala Regia
  mirador: [284.4, -52.4, 290.4, -46.4],                 // Isma'il I's mirador tower (1319)
  passage: [293.8, -39.8, 300.5, -36],                   // from the gallery's east end up to the Sultana
  neBlock: [294.6, -54, 300.5, -39.8],
  east: [293.8, -36, 300.5, 12.7],                       // the east range
  south: [280.2, 12.7, 294.6, 19.7],                     // the south pavilion
  polo: [280.2, 19.7, 298, 35],                          // the Patio de Polo
  dismount: [266, 35, 298, 52],                          // the Patio del Descabalgamiento
  sultana: [300.5, -52, 314, -24],                       // the Patio de la Sultana (a walled garden, §10.4)
  stair: { x0: 314, x1: 334, z: -37, y0: 40.5, y1: 47.5 }, // the Escalera del Agua: four flights, three round landings
  oratory: [336, -39.5, 341, -34.5],
  gate: [212.5, 9, 220.5, 17],                           // the postern at the Alhambra's east end
};
export const SULTANA_Y = 40.5, DISMOUNT_Y = 35.5;
/** The Escalera del Agua along x at z: the flights [x0, x1, y0, y1] and the landings [xc, y]. */
export function escalera() {
  const { x0, x1, y0, y1 } = GEN.stair, D = 3, F = (x1 - x0 - 3 * D) / 4, R = (y1 - y0) / 4, flights = [], landings = [];
  for (let k = 0; k < 4; k++) { const a = x0 + k * (F + D); flights.push([a, a + F, y0 + k * R, y0 + (k + 1) * R]); if (k < 3) landings.push([a + F + D / 2, y0 + (k + 1) * R]); }
  return { flights, landings, D, F, R };
}
// the levels the ground is cut and filled to (each flat; a step goes down over the lower side, under the
// retaining wall on the upper one's edge): the palace, the Sultana and the terraces beside the stairway,
// the entrance court, the three orchard terraces (paratas) below the palace
const ESC = escalera();
export const TERRACES = [
  { id: 'palace', r: [280.2, -57, 300.5, 35], y: GY - 0.6 },
  { id: 'sultana', r: [300.5, -54, ESC.flights[1][0] - 3, -22], y: SULTANA_Y },
  ...ESC.flights.slice(1).map((f, k) => ({ id: 'side' + (k + 1), r: [f[0] - 3, -50, k < 2 ? ESC.flights[k + 2][0] - 3 : GEN.stair.x1, -24], y: f[2] })),
  { id: 'top', r: [GEN.stair.x1, -50, 343, -24], y: GEN.stair.y1 },
  { id: 'dismount', r: [264, 35, 300.5, 54], y: DISMOUNT_Y },
  { id: 'orchard1', r: [266, -44, 280.2, 35], y: 34.5 },
  { id: 'orchard2', r: [256, -40, 266, 35], y: 31 },
  { id: 'orchard3', r: [248, -36, 256, 35], y: 27.5 },
];
// the sultan's passage: a lane between walls from the postern (y 30) down to the ravine's floor, along
// it, and up to the gate of the entrance court — [x, z, y] at its corners
export const LANE = [[GEN.gate[2], 13, HILL.top], [241.5, 13, 25], [241.5, 44, 24.6], [GEN.dismount[0], 44, DISMOUNT_Y]];
export const LANE_W = 3.2;
const dRect = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
/** The open hillside of the Cerro del Sol rising east from the ravine's floor (y 22), falling to the Darro on the north and to the rim on the east. */
function cerro(x, z) {
  const t = Math.max(0, Math.min(1, (x - 244) / 100)), hill = (22 + 24 * (1 - (1 - t) * (1 - t))) * smooth(-112, -60, z);
  const floor = 22 * smooth(-105, -25, z) * smooth(206, 238, x), w = smooth(244, 276, x);   // the ravine's floor, falling north to the Darro
  return (floor * (1 - w) + hill * w) * (1 - 0.35 * smooth(70, 160, z)) * (1 - smooth(342, 395, Math.hypot(x, z)));
}
/** The nearest point of the lane to (x, z): { d, y }. */
export function laneAt(x, z) {
  let best = { d: Infinity, y: 0 };
  for (let i = 0; i + 1 < LANE.length; i++) {
    const [ax, az, ay] = LANE[i], [bx, bz, by] = LANE[i + 1], L2 = (bx - ax) ** 2 + (bz - az) ** 2;
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / L2)), px = ax + (bx - ax) * t, pz = az + (bz - az) * t, d = Math.hypot(x - px, z - pz);
    if (d < best.d) best = { d, y: ay + (by - ay) * t };
  }
  return best;
}
/** The ground of the Generalife's estate over the natural ground h (only east of the Alhambra). */
function estate(x, z, h) {
  const K = 1.6;
  let inside = null, lo = -Infinity, hi = Infinity;
  for (const T of TERRACES) {
    const d = dRect(T.r, x, z);
    if (d === 0 && (!inside || T.y > inside.y)) inside = T;
    lo = Math.max(lo, T.y - K * d); hi = Math.min(hi, T.y + K * d);
  }
  if (inside) { let g = inside.y; for (const T of TERRACES) if (T.y > inside.y) g = Math.max(g, T.y - K * dRect(T.r, x, z)); return g; }
  return lo > hi ? lo : Math.min(hi, Math.max(lo, h));
}
export function height(x, z, lane = true) {
  const e = hillE(x, z), hill = HILL.top * smooth(1.35, 1.0, e);
  const albaicin = 26 * smooth(-120, -330, z), darro = -4 * smooth(40, 0, Math.abs(z + 110));
  let h = Math.max(hill, albaicin + darro) * (1 - smooth(RADIUS - 50, RADIUS - 5, Math.hypot(x, z)));
  if (x < 205) return h;
  h = Math.max(h, cerro(x, z));
  if (x > 240 && x < 350 && z > -64 && z < 62) h = estate(x, z, h);
  // the lane: its floor between the walls, the ground beyond blending to it
  if (!lane) return h;
  const L = laneAt(x, z), w = LANE_W / 2 + 0.6;
  if (L.d < w + 4) h = L.d <= w ? L.y : L.y + (h - L.y) * smooth(w, w + 4, L.d);
  return h;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** The Albaicín across the Darro, and the town below the hill to the south-west. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1390);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 12) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 11) {
    const w = 8 + rand() * 3, d = 8 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || hillE(cx, cz) < 1.45 || Math.abs(cz + 110) < 14 || rand() < 0.3) continue;
    if (cx > 222 && cz > -100) continue;                                             // the ravine, the Generalife's estate and the open hillside of the Cerro del Sol
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    if (Math.max(...ys) - Math.min(...ys) > 3) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.max(...ys), foot: Math.min(...ys), storeys: rand() < 0.6 ? 2 : 1, front: rand() < 0.5 ? 'n' : 's', plaster: true });
  }
  // inside the walls (§5): the medina's houses along the streets east of the palaces and in the dip
  // between the Alcazaba and the palaces; the military quarter's houses either side of its street in
  // the Alcazaba — kept clear of the palaces, the Partal, the Rauda, the way in and the walls
  const keep = [[-6, -66, 92, 6], [-6, 6, 44, 40], [96, -56, 124, -14], [52, 4, 77, 35], [-176, -36, -114, 36]];
  const put = (x, z, w, d, front) => {
    const r = [x, z, x + w, z + d];
    if ([[x, z], [x + w, z], [x, z + d], [x + w, z + d]].some(([a, b]) => hillE(a, b) > 0.8)) return;
    if (keep.some((k) => r[0] < k[2] && r[2] > k[0] && r[1] < k[3] && r[3] > k[1])) return;
    LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6), y: HILL.top, foot: HILL.top, storeys: rand() < 0.5 ? 2 : 1, front, plaster: true });
  };
  for (let x = -104; x < 200; x += 12.5) for (const [z, f] of [[-34, 's'], [-23.5, 'n'], [-9, 's'], [1.5, 'n'], [16, 's'], [26.5, 'n'], [40, 's']]) if (rand() < 0.85) put(x + rand() * 1.5, z, 9 + rand() * 1.5, 9, f);
  // the military quarter: a row of houses north of the street, storehouses south of it
  for (let x = -162; x < -135; x += 11) { put2(x, -14, 9.5, 10, 's'); put2(x, 4, 9.5, 9, 'n'); }
  function put2(x, z, w, d, front) { LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: HILL.top, foot: HILL.top, storeys: 1, front, plaster: true }); }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
