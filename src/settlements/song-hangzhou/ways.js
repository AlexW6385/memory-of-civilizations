// Southern Song Lin'an — the life's view of the town's layout (docs/settlements/song-hangzhou.md §12).
// The layout (layout.js) belongs to the townscape; this reads what it exports and gives the living
// systems (movers, fauna, smoke, shops, interiors) one normalised set of ways and waters, so that
// they follow the plan when it changes. Names read, each optional:
//   STREETS  [[x0, z0, x1, z1], …]   walkable street rectangles (the Imperial Way, lanes, roads)
//   IMPERIAL [x0, z0, x1, z1]        the Imperial Way (Yujie) alone, if the layout names it
//   CANALS   [[x0, z0, x1, z1], …]   canal water rectangles (boats run along their long axis)
//   BRIDGES  [{ at: [x, z], span, width, across }, …]
//   LAKE     { rect | c + r | poly }  West Lake (the pleasure boats' water)
//   LEVEL    { street, canal, lake, river }
//   lots()   [{ rect, front, storeys, shop, trade?, seed }]
// Without them the riverside quarter of layout.js (road, canal streets, lanes) is used.

import * as L from './layout.js';

export const RADIUS = L.RADIUS;
export const LEVEL = { street: 0, canal: -1.4, lake: -0.6, river: -2.2, ...(L.LEVEL || {}) };
const lotsFn = L.lots || (() => []);
export const lots = lotsFn;

/** The street entries: { r: [x0, z0, x1, z1], kind } — the layout's `streets()` (objects with `r`) or `STREETS` (rectangles), the canal streets and the river road added. */
export function streetEntries() {
  const out = [];
  const src = typeof L.streets === 'function' ? L.streets() : L.STREETS;
  if (src) for (const e of src) out.push(Array.isArray(e) ? { r: e, kind: 'lane' } : { kind: 'lane', ...e });
  else if (L.ROAD) {
    // the old layout: the lanes between its rows (z + 26 … z + 36)
    for (let z = -320; z < L.ROAD.z0 - 40; z += 36) {
      out.push({ r: [-60, z + 26, (L.CANAL_STREETS?.[0]?.[0] ?? 126) - 16, z + 36], kind: 'lane' });
      out.push({ r: [(L.CANAL_STREETS?.[1]?.[2] ?? 162) + 16, z + 26, L.RADIUS - 20, z + 36], kind: 'lane' });
    }
  }
  if (L.ROAD) out.push({ r: [-L.RADIUS + 20, L.ROAD.z0, L.RADIUS - 20, L.ROAD.z1], kind: 'road' });
  for (const c of L.CANAL_STREETS || []) out.push({ r: c, kind: 'canal' });
  return out;
}
/** The street rectangles. */
export const streets = () => streetEntries().map((e) => e.r);
/** The Imperial Way's rectangles (the layout's `IMPERIAL`, or its streets of kind 'imperial'). */
export function imperialRects() { const k = streetEntries().filter((e) => e.kind === 'imperial').map((e) => e.r); return k.length ? k : L.IMPERIAL ? [L.IMPERIAL] : []; }
export const imperialWay = () => L.IMPERIAL || null;
/** Is a lot on the Imperial Way? (the layout's `where`, else its front within 2 m of the way's rectangle) */
export function onImperial(l, front) {
  if (l.where) return l.where === 'imperial';
  const iw = imperialWay();
  if (!iw || !front) return false;
  return front[0] > iw[0] - 2 && front[0] < iw[2] + 2 && front[1] > iw[1] - 2 && front[1] < iw[3] + 2;
}

/** The canal rectangles. */
export function canals() {
  if (L.CANALS) return L.CANALS;
  if (L.CANAL) return [[L.CANAL.x0, L.CANAL.z0, L.CANAL.x1, L.CANAL.z1]];
  return [];
}
/** The bridges over the canals: { at: [x, z], span (along the canal), width, link: { a, b } (the walkers' crossing) }. */
export function bridges() {
  if (L.BRIDGES) return L.BRIDGES;
  if (L.CANAL_BRIDGES && L.CANAL) {
    const xm = (L.CANAL.x0 + L.CANAL.x1) / 2, cs = L.CANAL_STREETS || [];
    return L.CANAL_BRIDGES.map((z) => ({ at: [xm, z], span: 8, width: 5, link: cs.length ? { a: [(cs[0][0] + cs[0][2]) / 2, z], b: [(cs[1][0] + cs[1][2]) / 2, z] } : null }));
  }
  return [];
}

/** West Lake: { rect, y } or null (a polygon is reduced to its bounds; boats use `laneRects`). */
export function lake() {
  let k = L.LAKE;
  if (!k && L.WEST_LAKE) { const r = L.WEST_LAKE.rect; k = { rect: [Math.max(r[0], -L.RADIUS), Math.max(r[1], -L.RADIUS), Math.min(r[2], L.RADIUS), Math.min(r[3], L.RADIUS)], y: L.WEST_LAKE.level }; }
  if (!k) return null;
  const y = k.y ?? LEVEL.lake;
  if (k.rect) return { rect: k.rect, y, dist: k.dist };
  if (k.c && k.r) return { rect: [k.c[0] - k.r, k.c[1] - k.r, k.c[0] + k.r, k.c[1] + k.r], y, c: k.c, r: k.r, dist: k.dist };
  if (k.poly) {
    const xs = k.poly.map((p) => p[0]), zs = k.poly.map((p) => p[1]);
    return { rect: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], y, poly: k.poly, dist: k.dist };
  }
  return null;
}
/** Is (x, z) inside the lake, by the layout's own test if it gives one? */
export function inLake(x, z) {
  const k = lake();
  if (!k) return false;
  if (L.inLake) return L.inLake(x, z);
  if (k.dist) return k.dist(x, z) < 0;
  if (k.c) return Math.hypot(x - k.c[0], z - k.c[1]) < k.r;
  if (k.poly) { let c = false; const P = k.poly; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; }
  return x > k.rect[0] && x < k.rect[2] && z > k.rect[1] && z < k.rect[3];
}
/**
 * Straight boat lanes across the lake, as long thin rectangles (the engine's boat graph is made of
 * rectangles): a few east–west and north–south tracks kept `margin` m from the shore, in the lake's
 * middle part, crossing so that boats turn at the junctions.
 */
export function lakeLanes(margin = 22, width = 14) {
  const k = lake();
  if (!k) return [];
  const [x0, z0, x1, z1] = k.rect, out = [];
  const ok = (x, z) => inLake(x, z) && [[margin, 0], [-margin, 0], [0, margin], [0, -margin]].every(([dx, dz]) => inLake(x + dx, z + dz));
  const run = (alongX, c) => {
    let a = null, b = null;
    for (let t = alongX ? x0 : z0; t <= (alongX ? x1 : z1); t += 4) {
      const good = alongX ? ok(t, c) : ok(c, t);
      if (good) { if (a === null) a = t; b = t; } else if (a !== null) { if (b - a > 60) out.push(alongX ? [a, c - width / 2, b, c + width / 2] : [c - width / 2, a, c + width / 2, b]); a = null; }
    }
    if (a !== null && b - a > 60) out.push(alongX ? [a, c - width / 2, b, c + width / 2] : [c - width / 2, a, c + width / 2, b]);
  };
  const w = x1 - x0, h = z1 - z0;
  for (const f of [0.3, 0.5, 0.7]) { run(true, z0 + h * f); run(false, x0 + w * f); }
  return out;
}

/** Signed distance to the lake's shore (negative inside), by sampling rings when the layout gives no function. */
export function lakeDist(x, z) {
  const k = lake();
  if (!k) return 1e3;
  if (k.dist) return k.dist(x, z);
  const inside = inLake(x, z);
  for (let r = 1.5; r <= 60; r += 1.5) for (let a = 0; a < 16; a++) { const th = a / 16 * Math.PI * 2; if (inLake(x + Math.cos(th) * r, z + Math.sin(th) * r) !== inside) return inside ? -r : r; }
  return inside ? -60 : 60;
}
/** Signed distance to a rectangle's edge (negative inside). */
export function rectDist(r, x, z) {
  const dx = Math.max(r[0] - x, x - r[2]), dz = Math.max(r[1] - z, z - r[3]);
  return dx > 0 || dz > 0 ? Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) : Math.max(dx, dz);
}
/** Signed distance to the nearest canal. */
export function canalDist(x, z) { let d = 1e3; for (const r of canals()) d = Math.min(d, rectDist(r, x, z)); return d; }
