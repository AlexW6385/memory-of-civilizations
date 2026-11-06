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
/** The printing house (Shöl Parkhang, c. 1690), "a two-story building on the southeast corner of the Shol". */
export const PRINTERY = [150, 164, 192, 198];
/** The printers' benches in its upper room (pairs facing each other across each), along the room's middle. */
export const BENCHES = [158.6, 162.2, 165.8, 169.4, 173, 176.6, 180.2].map((x) => [x, PRINTERY[1] + 7.5 - 2.5]);
let LOTS = null;
/** Houses in Shöl (close-packed) and scattered farmsteads on the valley floor. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1694);
  for (let x = SHOL[0] + 6; x < SHOL[2] - 14; x += 17) for (let z = SHOL[1] + 6; z < SHOL[3] - 14; z += 17) {
    if (Math.abs(x + 4) < 10) continue;                                    // the street up to the palace
    if (Math.abs(z - 136) < 1) continue;                                   // the lane between the east and west gates
    if (rand() < 0.12) continue;
    const w = 10 + rand() * 4, d = 9 + rand() * 4;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  LOTS = LOTS.filter((l) => !(l.rect[2] > PRINTERY[0] - 4 && l.rect[0] < PRINTERY[2] + 4 && l.rect[3] > PRINTERY[1] - 4 && l.rect[1] < SHOL[3]));
  for (let k = 0; k < 400 && LOTS.length < 260; k++) {
    const a = rand() * Math.PI * 2, d = 230 + rand() * 160, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (z < 40 || hill(x, z) > 1 || Math.hypot(x, z) > RADIUS - 30) continue;
    if (LOTS.some((l) => Math.abs(l.rect[0] - x) < 30 && Math.abs(l.rect[1] - z) < 30)) continue;
    LOTS.push({ rect: [x, z, x + 12 + rand() * 4, z + 10 + rand() * 4], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** The pond behind the palace, left where the earth for the Potala's mortar was dug (now the Lukhang's lake); its little island. */
export const POND = { c: [0, -292], rx: 68, rz: 32, level: -1.0, bed: -2.4, island: { c: [8, -288], rx: 9, rz: 6.5 } };
/** Signed distance (m, roughly) to the pond's shore: negative over the water, positive on land and on the island. */
export function pondDist(x, z) {
  const e = Math.hypot((x - POND.c[0]) / POND.rx, (z - POND.c[1]) / POND.rz), d = (e - 1) * Math.min(POND.rx, POND.rz);
  const I = POND.island, ei = Math.hypot((x - I.c[0]) / I.rx, (z - I.c[1]) / I.rz);
  return ei < 1 ? (1 - ei) * Math.min(I.rx, I.rz) : d;
}
