// Modern Sydney, 1973 — the layout (docs/settlements/sydney.md §2): the harbour across the north;
// Bennelong Point running out into it with the Opera House on its podium; Sydney Cove and Circular
// Quay with the ferry wharves and the Cahill Expressway; Dawes Point and the Rocks on the west, the
// Harbour Bridge springing north from them to Milsons Point; Farm Cove and the Botanic Garden on
// the east; the city's towers to the south. The Opera House at true size; the bridge at about half
// scale (its 503 m arch → 260 m); the city compressed. Pure data. +x east, +z south.

export const RADIUS = 460;
export const LEVEL = -2.4;
export const OPERA = { rect: [58, -250, 142, -128], stair: 22, h: 9 };
export const BENNELONG = [40, -275, 160, -90];
export const COVE = [-45, -100, 40, -8];
export const FARM = [175, -100, 330, -38];
export const DAWES = [-265, -140, -105, -90];
export const NORTH = [-320, -560, -20, -385];
export const BRIDGE = { x: -150, z0: -372, z1: -112, rise: 62, deck: 26, w: 25, approach: 70, pylon: 46 };
export const QUAY = [-60, 2, 52, 30];                         // the Cahill Expressway over the station
export const AUSTRALIA_SQ = [-70, 230];
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
/** Signed distance into a rect with rounded corners (positive inside). */
function sdRect([x0, z0, x1, z1], x, z, round = 12) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hx = (x1 - x0) / 2 - round, hz = (z1 - z0) / 2 - round;
  const qx = Math.abs(x - cx) - hx, qz = Math.abs(z - cz) - hz;
  return -(Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - round);
}
/** How far (m) into the land; negative in the water. */
export function shore(x, z) {
  let d = Math.min(z + 100, -sdRect(COVE, x, z, 20), -sdRect(FARM, x, z, 28));
  for (const [r, k] of [[BENNELONG, 30], [DAWES, 14], [NORTH, 20]]) d = Math.max(d, sdRect(r, x, z, k));
  return d;
}
export const inWater = (x, z) => shore(x, z) < 0 && Math.hypot(x, z) < RADIUS - 50;
export function height(x, z) {
  const d = shore(x, z), edge = smooth(RADIUS - 60, RADIUS - 25, Math.hypot(x, z));
  const land = 3 + 9 * smooth(-60, -200, x) * smooth(120, 20, z) + 4 * smooth(60, 300, z);       // the Rocks' sandstone ridge, the city rising south
  const h = -7 + (land + 7) * smooth(-10, 5, d);
  return h * (1 - edge);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const GARDEN = [150, -38, 420, 150];
export const STREETS_X = [-250, -180, -110, -40, 30, 100];       // George, Pitt and the rest, running south
export const STREETS_Z = [70, 140, 210, 280, 350];
const onStreet = (x, z) => STREETS_X.some((s) => Math.abs(x - s) < 9) || STREETS_Z.some((s) => Math.abs(z - s) < 8);
let LOTS = null;
/** The city's buildings: sandstone terraces in the Rocks, office towers of the 1960s and 70s among older blocks in the city. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1973);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 16) for (let z = -120; z < RADIUS - 20; z += 16) {
    const w = 11 + rand() * 4, d = 11 + rand() * 4, cx = x + 8, cz = z + 8;
    if (Math.hypot(cx, cz) > RADIUS - 45 || shore(cx, cz) < 10 || inRect(GARDEN, cx, cz, 4) || inRect(QUAY, cx, cz, 10) || inRect(BENNELONG, cx, cz, 4) || onStreet(cx, cz)
      || Math.abs(cx - BRIDGE.x) < 22 && cz < 0 || Math.hypot(cx - AUSTRALIA_SQ[0], cz - AUSTRALIA_SQ[1]) < 34 || rand() < 0.12) continue;
    const rocks = cx < -100 && cz < 70, ys = [height(cx - w / 2, cz - d / 2), height(cx + w / 2, cz - d / 2), height(cx - w / 2, cz + d / 2), height(cx + w / 2, cz + d / 2)];
    let h, mat;
    if (rocks) { h = 7 + rand() * 7; mat = 'sandstone_dressed'; }
    else { h = 15 + rand() * 30; mat = ['facade_buff', 'facade_grey', 'facade_limestone'][Math.floor(rand() * 3)]; if (rand() < 0.22) { h = 60 + rand() * 90; mat = rand() < 0.6 ? 'facade_glass' : 'facade_grey'; } }
    LOTS.push({ rect: [x, z, x + w, z + d], y: Math.max(...ys), h: Math.round(h), mat, seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
