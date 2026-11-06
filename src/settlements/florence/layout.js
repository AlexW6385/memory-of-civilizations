// Florence about 1480 — the layout (docs/settlements/florence.md §2): the cathedral with its dome in
// the middle, the campanile at its south-west corner, the Baptistery before its west front; the Piazza
// della Signoria to the south with the Palazzo della Signoria and its tower and the Loggia; the Arno
// at the south edge with the Ponte Vecchio and its shops; tiled houses and palaces in the streets
// between. Distances compressed a little. Pure data. +x east, +z south.

export const RADIUS = 400;
export const DUOMO = { c: [40, -60], nave: 90, w: 40, h: 40, d: 45.5 };
export const CAMPANILE = [-63, -30];
export const BAPTISTERY = [-125, -60];
export const PIAZZA_DUOMO = [-160, -110, 100, -10];
export const SIGNORIA = [0, 110, 110, 205];
export const PALAZZO = [62, 120, 102, 160];
export const LOGGIA = [12, 165, 50, 182];
export const ORSAN = [16, 20, 48.4, 42.1];                      // Orsanmichele, between the cathedral and the Signoria (32.4 × 22.1 m)
export const MEDICI = [-12, -196, 28, -156];                   // the Palazzo Medici on the Via Larga, north of the cathedral (40 × 40 m)
export const ARNO = { z: 275, w: 60, level: -4, bed: -7 };
export const BRIDGE = { x: 40 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const arnoZ = (x) => ARNO.z + 12 * Math.sin(x / 130);
export const inArno = (x, z) => Math.abs(z - arnoZ(x)) < ARNO.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 55;
export function height(x, z) {
  const d = Math.abs(z - arnoZ(x)), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  return ARNO.bed * smooth(ARNO.w / 2 + 6, ARNO.w / 2 - 6, d) * (1 - edge);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1480);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 12) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 12) {
    const w = 9 + rand() * 2, d = 9 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || inRect(PIAZZA_DUOMO, cx, cz, 6) || inRect(SIGNORIA, cx, cz, 6) || Math.abs(cz - arnoZ(cx)) < ARNO.w / 2 + 12 || (Math.abs(cx - BRIDGE.x) < 8 && cz > SIGNORIA[3]) || Math.abs((cz + 400) % 48 - 24) < 3 || rand() < 0.1) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.3, storeys: 3 + (rand() < 0.4 ? 1 : 0), front: rand() < 0.5 ? 'n' : 's', plaster: rand() < 0.6 });
  }
  // the block of Orsanmichele and its four streets (after the draw, so that the other lots stay as they were)
  LOTS = LOTS.filter((l) => !inRect(ORSAN, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2, 9));
  // the Palazzo Medici's block, the Via Larga before it and the Via de' Gori beside it
  LOTS = LOTS.filter((l) => !overlaps(l.rect, [MEDICI[0] - 2, MEDICI[1] - 2, MEDICI[2] + 9, MEDICI[3] + 8]));
  return LOTS;
}
const overlaps = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
