// Victorian London about 1870 — the layout (docs/settlements/london.md §2): Westminster. The Palace of
// Westminster along the Thames's west bank with the Clock Tower at its north end and the Victoria
// Tower at its south, Westminster Hall behind; Westminster Abbey to the west; Parliament Square;
// Westminster Bridge across to Lambeth; brick terraces on both banks. Pure data. +x east, +z south
// (the river runs north–south here).

export const RADIUS = 420;
export const GROUND = 2, RIVER = { x0: 115, x1: 255, level: -2.5, bed: -6 };
export const PALACE = [40, -140, 112, 130];
export const CLOCK = [96, -152];
export const VICTORIA = [80, 140];
export const ABBEY = [-200, 20, -70, 62];
export const SQUARE = [-60, -215, 40, -150];
export const BRIDGE = { z: -170, w: 16 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const bank = (z) => [RIVER.x0 + 6 * Math.sin(z / 90), RIVER.x1 + 8 * Math.sin(z / 110)];
export const inRiver = (x, z) => { const [a, b] = bank(z); return x > a + 2 && x < b - 2 && Math.hypot(x, z) < RADIUS - 60; };
export function height(x, z) {
  const [a, b] = bank(z), d = Math.min(x - a, b - x), edge = smooth(RADIUS - 70, RADIUS - 40, Math.hypot(x, z));
  const h = d > 0 ? GROUND + (RIVER.bed - GROUND) * smooth(0, 6, d) * (1 - edge) : GROUND;
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Terraces in rows along the streets on both banks. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1870);
  for (let z = -RADIUS + 30; z < RADIUS - 30; z += 30) for (const [za, front] of [[z, 's'], [z + 12, 'n']]) for (let x = -RADIUS + 30; x < RADIUS - 30;) {
    const w = 5.5 + rand() * 1.5, cx = x + w / 2, cz = za + 5.5;
    x += w;
    const [a, b] = bank(cz);
    if (Math.hypot(cx, cz) > RADIUS - 45 || (cx > a - 14 && cx < b + 14) || inRect(PALACE, cx, cz, 14) || inRect(ABBEY, cx, cz, 16) || inRect(SQUARE, cx, cz, 6) || Math.abs(cz - BRIDGE.z) < 14 || inRect([VICTORIA[0] - 60, VICTORIA[1] - 10, VICTORIA[0] + 20, VICTORIA[1] + 40], cx, cz)) continue;
    LOTS.push({ rect: [x - w, za, x - 0.2, za + 11], seed: Math.floor(rand() * 1e6), front, storeys: 3 + (rand() < 0.3 ? 1 : 0), y: GROUND });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
