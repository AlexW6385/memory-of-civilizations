// Zagwe Lalibela (c. 1220) — the layout (docs/settlements/lalibela.md §2): the church precinct
// level on the plateau, its churches standing in pits cut down into the tuff, trenches leading down
// and joining them, the Jordan between the northern and south-eastern groups, Bete Giyorgis alone to
// the south-west; the village of round houses on the slopes round about. Pure data. +x east, +z south.

export const RADIUS = 380;
export const EDGE = 3;                                 // the band inside a cut's edge where its wall stands
export const OUTER = 2;                                // the walls reach this far outside the edge (under the ground)
// pits: { rect, depth }; churches stand on their floors
export const PITS = {
  giyorgis: { rect: [-216, 114, -174, 156], depth: 12 },     // the cross 25.6 m over its plinth, a court of about 5 m round it
  medhane: { rect: [-15, -112, 35, -68], depth: 11.5 },
  maryam: { rect: [55, -104, 85, -76], depth: 9 },
  golgotha: { rect: [-72, -104, -32, -78], depth: 9 },
  amanuel: { rect: [20, 44, 60, 76], depth: 12 },
  gabriel: { rect: [104, 28, 136, 52], depth: 10 },
};
// trenches: { rect, axis ('x'|'z'), d0 (depth at the low-coordinate end), d1 }
export const TRENCHES = [
  { rect: [-262, 123, -216, 133], axis: 'x', d0: 0, d1: 12 },          // down to Bete Giyorgis
  { rect: [4, -146, 16, -112], axis: 'z', d0: 0, d1: 11.5 },          // down to Medhane Alem from the north
  { rect: [-58, -130, -46, -104], axis: 'z', d0: 0, d1: 9 },           // to Golgotha
  { rect: [35, -96, 55, -84], axis: 'x', d0: 11.5, d1: 9 },            // Medhane Alem to Maryam
  { rect: [-150, -22, -120, -6], axis: 'x', d0: 0, d1: 7 },            // into the Jordan's west end
  { rect: [-120, -22, 180, -6], axis: 'x', d0: 7, d1: 7 },             // the Jordan
  { rect: [180, -22, 212, -6], axis: 'x', d0: 7, d1: 0 },              // out of its east end
  { rect: [34, -8, 46, 44], axis: 'z', d0: 7, d1: 12 },               // the Jordan to Amanuel
  { rect: [114, -8, 126, 28], axis: 'z', d0: 7, d1: 10 },             // the Jordan to Gabriel-Rufael
];
export const PRECINCT = 250;                             // level within this radius; slopes beyond
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const edgeIn = (r, x, z) => Math.min(x - r[0], r[2] - x, z - r[1], r[3] - z);
/** The depth of the cuts at (x, z) (0 outside them): full on their floors, falling to 0 across the wall band at their edges. */
// the ground drops sharply half a metre in from the cut's edge, well inside the rock walls (which
// stand from 2 m outside the edge to EDGE inside it): the ground's mesh, some 2 m between vertices
// and not aligned with the cuts, then slopes down only within the walls, never in front of their
// faces nor in a dip before their kerbs
const DROP = (e) => Math.max(0, Math.min(1, (e - 0.35) / 0.3));
export function cutDepth(x, z) {
  let d = 0;
  for (const p of Object.values(PITS)) if (inRect(p.rect, x, z)) d = Math.max(d, p.depth * DROP(edgeIn(p.rect, x, z)));
  for (const t of TRENCHES) if (inRect(t.rect, x, z)) {
    const [x0, z0, x1, z1] = t.rect, u = t.axis === 'x' ? (x - x0) / (x1 - x0) : (z - z0) / (z1 - z0);
    const side = t.axis === 'x' ? Math.min(z - z0, z1 - z) : Math.min(x - x0, x1 - x);
    d = Math.max(d, (t.d0 + (t.d1 - t.d0) * u) * DROP(side));
  }
  return d;
}
export const inCut = (x, z, m = 0) => Object.values(PITS).some((p) => inRect(p.rect, x, z, m)) || TRENCHES.some((t) => inRect(t.rect, x, z, m));
export function slope(x, z) { const r = Math.hypot(x, z); return Math.max(0, r - PRECINCT) * 0.16 * (0.8 + 0.2 * Math.sin(Math.atan2(z, x) * 3)); }
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let HOUSES = null;
/** Round houses (some of two storeys) scattered over the slopes and the precinct's edges, clear of the cuts. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1220);
  for (let k = 0; k < 2400 && HOUSES.length < 420; k++) {
    const a = rand() * Math.PI * 2, d = 120 + Math.sqrt(rand()) * (RADIUS - 150), x = Math.cos(a) * d, z = Math.sin(a) * d;
    const r = 2.6 + rand() * 1.8;
    if (inCut(x, z, r + 8) || Math.hypot(x + 200, z - 130) < 50) continue;
    if (HOUSES.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.r + r + 5)) continue;
    HOUSES.push({ c: [x, z], r, storeys: rand() < 0.3 ? 2 : 1, seed: Math.floor(rand() * 1e6) });
  }
  return HOUSES;
}
export const nearHouse = (x, z, m = 0) => houses().some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.r + m);
