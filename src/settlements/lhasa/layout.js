// Lhasa in 1694 — the layout (docs/settlements/lhasa.md §2): Marpo Ri's east–west ridge north of the
// middle with the Potala climbing its south face, Shöl walled at its foot, Chokpori to the
// south-west, the valley's fields round about. Pure data. +x east, +z south.

export const RADIUS = 420;
export const SHOL = [-200, 62, 200, 210];
export const CHOKPORI = { c: [-280, 230], r: 75, h: 35 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Marpo Ri: a ridge 60 m high along x, its crest at z = −110, the south face steeper than the north. */
export function hill(x, z) {
  const fx = smooth(250, 175, Math.abs(x)), fz = z < -110 ? smooth(-240, -110, z) : smooth(35, -110, z);
  const c = Math.hypot(x - CHOKPORI.c[0], z - CHOKPORI.c[1]) / CHOKPORI.r;
  return Math.max(60 * fx * fz, c < 1 ? CHOKPORI.h * smooth(1, 0, c) : 0);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses in Shöl (close-packed) and scattered farmsteads on the valley floor. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1694);
  for (let x = SHOL[0] + 6; x < SHOL[2] - 14; x += 17) for (let z = SHOL[1] + 6; z < SHOL[3] - 14; z += 17) {
    if (Math.abs(x + 4) < 10) continue;                                    // the street up to the palace
    if (rand() < 0.12) continue;
    const w = 10 + rand() * 4, d = 9 + rand() * 4;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  for (let k = 0; k < 400 && LOTS.length < 260; k++) {
    const a = rand() * Math.PI * 2, d = 230 + rand() * 160, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (z < 40 || hill(x, z) > 1 || Math.hypot(x, z) > RADIUS - 30) continue;
    if (LOTS.some((l) => Math.abs(l.rect[0] - x) < 30 && Math.abs(l.rect[1] - z) < 30)) continue;
    LOTS.push({ rect: [x, z, x + 12 + rand() * 4, z + 10 + rand() * 4], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
