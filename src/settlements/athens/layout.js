// Classical Athens about 410 BC — the layout (docs/settlements/athens.md §2): the Acropolis rock in
// the middle (its summit 70 m above the town), the ramp climbing its west end to the Propylaia;
// the Areopagus to the north-west; the Agora beyond it with the Hephaisteion on its low hill and
// the Panathenaic Way running diagonally across to the Acropolis; houses packed all round. The
// Agora is brought nearer (it lies about 500 m from the Acropolis). Pure data. +x east, +z south.

export const RADIUS = 420;
export const ACRO = { c: [0, 0], r: [140, 72], top: 70, slope: 70 };
export const AREO = { c: [-175, -95], r: 38, h: 18 };
export const KOLONOS = { c: [-300, -250], r: 55, h: 10 };
export const AGORA = [-290, -235, -160, -110];
// the court north of the Erechtheion, about 3 m below the summit (the temple stands on the slope: its north and west
// sides about 3 m lower than the south and east), reached by a stair from the east
export const NCOURT = { rect: [14, -72, 48, -51.2], drop: 3, edge: -52.6 };      // the ground lowered under the temple's north side too; `edge` the court's south wall
export const RAMP = [[-310, 70], [-235, 45], [-175, 18], [-148, 2]];       // the Panathenaic ramp up the west end
export const WAY = [[-390, -330], [-260, -220], [-180, -60], [-210, 55], [-310, 70]];   // the Panathenaic Way from the Dipylon
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return [Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t), t]; }
export function pathAt(x, z, p) { let best = [Infinity, 0], acc = 0, total = 0; const L = []; for (let i = 0; i + 1 < p.length; i++) { L.push(Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1])); total += L[i]; } for (let i = 0; i + 1 < p.length; i++) { const [d, t] = segDist(x, z, p[i], p[i + 1]); if (d < best[0]) best = [d, (acc + t * L[i]) / total]; acc += L[i]; } return best; }
/** How far inside the Acropolis's summit ellipse (1 at the rim, < 1 inside). */
export const acroE = (x, z) => Math.hypot((x - ACRO.c[0]) / ACRO.r[0], (z - ACRO.c[1]) / ACRO.r[1]);
export function height(x, z) {
  const e = acroE(x, z), dist = (e - 1) * Math.min(ACRO.r[0], ACRO.r[1]);
  let h = e <= 1 ? ACRO.top : ACRO.top * smooth(ACRO.slope, 0, dist) ** 1.6;
  if (e <= 1 && inRect(NCOURT.rect, x, z)) h = ACRO.top - NCOURT.drop - 0.15;
  const a = Math.hypot(x - AREO.c[0], z - AREO.c[1]) / AREO.r; if (a < 1) h = Math.max(h, AREO.h * smooth(1, 0.4, a));
  const k = Math.hypot(x - KOLONOS.c[0], z - KOLONOS.c[1]) / KOLONOS.r; if (k < 1) h = Math.max(h, KOLONOS.h * smooth(1, 0.3, k));
  // the ramp: rising evenly from the town to the Propylaia's foot
  const [d, t] = pathAt(x, z, RAMP);
  if (d < 12) { const ry = ACRO.top * smooth(0, 1, t) ** 1.0, w = smooth(12, 6, d); h = Math.max(h * (1 - w) + ry * w, h * (d < 6 ? 0 : 1)); if (d < 6) h = ry; }
  return h * (1 - smooth(RADIUS - 50, RADIUS - 5, Math.hypot(x, z)));
}
export const onWay = (x, z, m = 0) => pathAt(x, z, WAY)[0] < 5 + m;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Courtyard houses packed in blocks wherever the ground is low and free. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(430);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 15) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 14) {
    const w = 11 + rand() * 3, d = 10 + rand() * 3, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 40 || acroE(cx, cz) < 1.75 || inRect(AGORA, cx, cz, 12) || onWay(cx, cz, 9) || pathAt(cx, cz, RAMP)[0] < 18) continue;
    if (Math.hypot(cx - AREO.c[0], cz - AREO.c[1]) < AREO.r + 6 || Math.hypot(cx - KOLONOS.c[0], cz - KOLONOS.c[1]) < KOLONOS.r * 0.8) continue;
    if (rand() < 0.2) continue;
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    if (Math.max(...ys) - Math.min(...ys) > 2.5) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.min(...ys) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
