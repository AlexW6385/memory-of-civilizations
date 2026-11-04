// Sailendra Java (c. 825) — the layout (docs/settlements/borobudur.md §2): Borobudur at the middle,
// square to the compass; a monastery compound to the north-west; hamlets of houses on posts in
// groves round about, fields between; the approach from the east. Pure data. +x east, +z south.

export const RADIUS = 380;
export const MONUMENT = { c: [0, 0], base: { a: 56.5, p: 5, h: 4, foot: 3 } };
export const SQUARES = [{ a: 49.5, y: 7.5 }, { a: 45.5, y: 10.5 }, { a: 41.5, y: 13.3 }, { a: 37.5, y: 15.9 }, { a: 33.5, y: 18.3 }];
export const CIRCLES = [{ r: 24, y: 19.8, n: 32 }, { r: 18, y: 21.3, n: 24 }, { r: 12.5, y: 22.8, n: 16 }];
export const MONASTERY = [-210, -170, -130, -105];
export const HAMLETS = [[230, -60, 45], [150, 210, 40], [-120, 220, 45], [-260, 60, 40], [60, -250, 40], [270, 140, 30]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
/** Houses on posts, 5–9 m, scattered in each hamlet round its open yard, a granary or two among them. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(825);
  for (const [hx, hz, hr] of HAMLETS) {
    for (let k = 0; k < 60 && HOUSES.length < 400; k++) {
      const a = rand() * Math.PI * 2, d = 10 + rand() * hr, x = hx + Math.cos(a) * d, z = hz + Math.sin(a) * d;
      const w = 5 + rand() * 4, dd = 4 + rand() * 3, r = [x - w / 2, z - dd / 2, x + w / 2, z + dd / 2];
      if (Math.hypot(x, z) > RADIUS - 30 || HOUSES.some((h) => inRect(h.rect, x, z, w / 2 + dd / 2 + 2))) continue;
      HOUSES.push({ rect: r, seed: Math.floor(rand() * 1e6) });
    }
  }
  return HOUSES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const nearHamlet = (x, z) => HAMLETS.some(([hx, hz, hr]) => Math.hypot(x - hx, z - hz) < hr + 22);
