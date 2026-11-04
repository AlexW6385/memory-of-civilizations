// Umayyad Jerusalem about 700 — the layout (docs/settlements/jerusalem.md §2): the Haram al-Sharif,
// the great esplanade on its retaining walls (compressed to 300 × 400 m), with the Dome of the Rock
// on its platform north of the middle and the al-Aqsa mosque at the south end; the Kidron valley
// falling away on the east; the Tyropoeon valley on the west and the city climbing beyond it to
// the Church of the Holy Sepulchre. Pure data. +x east, +z south.

export const RADIUS = 420;
export const HARAM = { rect: [-150, -200, 150, 200], top: 14 };
export const AQSA = [-40, 118, 40, 194];
export const SEPULCHRE = [-350, -160, -290, -40];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function height(x, z) {
  if (inRect(HARAM.rect, x, z)) return HARAM.top;
  let h = 6 + 18 * smooth(-170, -390, x);                                   // the Tyropoeon and the upper city climbing west
  if (x > 150) h = 6 - 30 * smooth(155, 245, x) + 24 * smooth(270, 400, x); // the Kidron valley, the slope of the Mount of Olives
  return h * (1 - smooth(RADIUS - 60, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Courtyard houses west and south of the Haram. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(700);
  for (let x = -RADIUS + 20; x < 150; x += 17) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 16) {
    const w = 12 + rand() * 4, d = 12 + rand() * 3, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || inRect(HARAM.rect, cx, cz, 16) || inRect(SEPULCHRE, cx, cz, 14) || Math.abs(cz - 0) < 6 || Math.abs(cx + 230) < 6 || rand() < 0.15) continue;
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    if (Math.max(...ys) - Math.min(...ys) > 2.5) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.min(...ys) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
