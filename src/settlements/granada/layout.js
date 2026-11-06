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
export function height(x, z) {
  const e = hillE(x, z), hill = HILL.top * smooth(1.35, 1.0, e);
  const albaicin = 26 * smooth(-120, -330, z), darro = -4 * smooth(40, 0, Math.abs(z + 110));
  return Math.max(hill, albaicin + darro) * (1 - smooth(RADIUS - 50, RADIUS - 5, Math.hypot(x, z)));
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
