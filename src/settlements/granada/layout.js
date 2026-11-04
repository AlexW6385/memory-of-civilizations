// Granada about 1390 — the layout (docs/settlements/granada.md §2): the Alhambra on the long Sabika
// hill — the Alcazaba with its towers at the west end, the Nasrid palaces on the north edge
// (the Court of the Myrtles with the Comares Tower over the Darro, the Court of the Lions), the
// walls and towers round the hill's rim; the Darro's valley to the north and the Albaicín's white
// houses climbing beyond it. Pure data. +x east, +z south.

export const RADIUS = 400;
export const HILL = { c: [20, 10], r: [200, 62], top: 30 };
export const MYRTLES = [8, -32, 31, 4];
export const COMARES = [6, -48, 33, -36];
export const LIONS = [44, -22, 72, -6];
export const ALCAZABA = [-170, -30, -120, 30];
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
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
