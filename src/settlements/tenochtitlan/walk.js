// The visitor's walk in Tenochtitlan (docs/settlements/tenochtitlan.md §20): from the arrival through the priests' quarter, the west gate,
// the avenue to the market on the west canal and over the canal's bridge, and the compounds of the calpulli that stand by it — opened:
// their gates 1.8 m and their room doors 1.6 m wide (the walker's raster reads anything nearer than 0.75 m of the line it walks as a
// wall), the lane from the gate to the hearth room's door kept clear of the patio's things. Pure data and functions; the routes are
// walked by tools/walk-check.mjs from the landmark's `walks` (plan.js).
import { STYLES, Colliders } from '../../core/build.js';
import '../../styles/aztec/index.js';
import { houseNoble, MARKET } from './layout.js';
import { GEOM, aisles, spots } from './market.js';

export { WALK, openSet, isOpen } from './opened.js';

const nop = new Proxy(() => nop, { get: (o, k) => (k === Symbol.toPrimitive ? () => 0 : nop), apply: () => nop });
const REC = new Map();
/**
 * What the shared builder made of a compound (it is a pure function of the element, so read once): { gate: { side, at }, patio, rooms:
 * [{ role, door, at, inward, rect }], solids: [[x0, z0, x1, z1] | [x, z, r]] (the colliders it made: walls, jars, the hearth) }.
 */
export function recordOf(h) {
  let r = REC.get(h.seed);
  if (r) return r;
  const col = new Colliders();
  STYLES.aztec.elements.calli({ t: 'calli', ...h, noble: houseNoble(h), open: true, record: (x) => { r = x; } }, { bag: nop, col });
  r.solids = col.obstacles.filter((o) => (o.y1 ?? 9) - (o.y0 ?? 0) > 0.5).map((o) => (o.circle ? o.circle : [Math.min(...o.poly.map((p) => p[0])), Math.min(...o.poly.map((p) => p[1])), Math.max(...o.poly.map((p) => p[0])), Math.max(...o.poly.map((p) => p[1]))]));
  REC.set(h.seed, r);
  return r;
}

const OUT = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };
const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k];
/** Is the point p free of the solids (inflated by `m`) and inside the rect? */
function free(p, solids, rect, m) {
  if (p[0] < rect[0] + m || p[0] > rect[2] - m || p[1] < rect[1] + m || p[1] > rect[3] - m) return false;
  for (const o of solids) {
    if (o.length === 3) { if (Math.hypot(p[0] - o[0], p[1] - o[1]) < o[2] + m) return false; }
    else if (p[0] > o[0] - m && p[0] < o[2] + m && p[1] > o[1] - m && p[1] < o[3] + m) return false;
  }
  return true;
}
const sees = (a, b, solids, rect, m) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.2); for (let i = 1; i < n; i++) if (!free([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n], solids, rect, m)) return false; return true; };
/** A path from a to b over a 0.25 m grid inside rect keeping m clear of the solids (A*), made short by line of sight; null if none. */
export function pathTo(a, b, solids, rect, m = 0.8) {
  const S = 0.25, W = Math.ceil((rect[2] - rect[0]) / S), H = Math.ceil((rect[3] - rect[1]) / S), cell = (p) => [Math.round((p[0] - rect[0]) / S), Math.round((p[1] - rect[1]) / S)], pos = ([i, j]) => [rect[0] + i * S, rect[1] + j * S];
  const A = cell(a), B = cell(b), key = (c) => c[1] * (W + 1) + c[0], open = [{ c: A, g: 0, f: 0 }], best = new Map([[key(A), 0]]), from = new Map();
  while (open.length) {
    open.sort((p, q) => p.f - q.f);
    const cur = open.shift();
    if (cur.c[0] === B[0] && cur.c[1] === B[1]) {
      const pts = [pos(B)]; let k = key(B); while (from.has(k)) { const c = from.get(k); pts.push(pos(c)); k = key(c); }
      pts.reverse(); const out = [pts[0]];
      for (let i = 1; i < pts.length; i++) if (i === pts.length - 1 || !sees(out[out.length - 1], pts[i + 1], solids, rect, m)) out.push(pts[i]);
      return out;
    }
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const c = [cur.c[0] + di, cur.c[1] + dj]; if (c[0] < 0 || c[1] < 0 || c[0] > W || c[1] > H) continue;
      const q = pos(c); if (!free(q, solids, rect, m) && !(c[0] === B[0] && c[1] === B[1])) continue;
      const g = cur.g + (di && dj ? 1.414 : 1), kk = key(c);
      if (best.has(kk) && best.get(kk) <= g) continue;
      best.set(kk, g); from.set(kk, cur.c); open.push({ c, g, f: g + Math.hypot(c[0] - B[0], c[1] - B[1]) });
    }
  }
  return null;
}
/** The route into a compound: from the lane outside its gate, in, across the patio to the hearth room's door, and into the room. */
export function routeInto(h) {
  const r = recordOf(h), o = OUT[r.gate.side], g = r.gate.at, door = r.rooms[0], inw = door.inward;
  const P2 = add(g, o, -1.2), before = add(door.at, inw, -1.4), rect = h.rect;
  const mid = pathTo(P2, before, r.solids, rect, 1.0) || pathTo(P2, before, r.solids, rect, 0.8) || pathTo(P2, before, r.solids, rect, 0.6) || [P2, before];
  return [add(g, o, 3.2), g, ...mid, door.at, add(door.at, inw, 1.9)];
}
const segPt = (p, a, b) => { const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)); return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t); };
/**
 * Where a figure stands in an opened compound's patio: the free spot (0.8 m from the solids) nearest the patio's middle that is at least
 * 1.9 m off the route from the gate to the hearth room's door, so that nobody stands in the walker's way. Falls back to null.
 */
export function figureSpot(h, k = 0) {
  const r = recordOf(h), route = routeInto(h), pr = r.patio;
  const cx = (pr[0] + pr[2]) / 2, cz = (pr[1] + pr[3]) / 2;
  let best = null, bd = 1e9;
  for (let x = pr[0] + 0.8; x < pr[2] - 0.8; x += 0.3) for (let z = pr[1] + 0.8; z < pr[3] - 0.8; z += 0.3) {
    const p = [x, z];
    if (!free(p, r.solids, h.rect, 0.8)) continue;
    let d = 1e9; for (let i = 0; i + 1 < route.length; i++) d = Math.min(d, segPt(p, route[i], route[i + 1]));
    if (d < 1.9) continue;
    const s = Math.hypot(x - cx, z - cz) + (k % 2 ? 0.15 : 0) * Math.sin(x * 7 + z * 3);
    if (s < bd) { bd = s; best = p; }
  }
  return best;
}

// ---- the tianguis: along its row aisles and cross aisles, steering clear of the people who stand in them
const AIS = () => aisles().slice(0, GEOM.rows + 1).map((a) => (a[1] + a[3]) / 2);   // z of the row aisles' middle lines
/** An offset (m, across the aisle) at which the line z = zc + d from xa to xb passes 0.95 m clear of everyone standing in the aisles. */
function lane(zc, xa, xb) {
  const lo = Math.min(xa, xb) - 0.9, hi = Math.max(xa, xb) + 0.9, S = spots().filter((p) => p[0] > lo && p[0] < hi);
  for (const d of [0, -0.5, 0.5, -1.0, 1.0, -1.25, 1.25]) if (S.every((p) => Math.abs(p[1] - zc - d) > 0.95)) return zc + d;
  return zc;
}
/**
 * The walks through the market: in from the street at the east side by a row aisle, west to the cross aisle, along it, and out by another row (A);
 * west to the canal's quay by a row aisle and north along the quay to the top of the landing stair (B).
 */
export function marketRoutes() {
  const Z = AIS(), [X0, , X1] = MARKET, xc = GEOM.xCross, xw = GEOM.xWest, out = X1 + 4, a0 = 1;
  const vlane = (za, zb) => { const S = spots().filter((p) => p[1] > Math.min(za, zb) - 0.9 && p[1] < Math.max(za, zb) + 0.9); for (const d of [0, -0.4, 0.4, -0.7, 0.7]) if (S.every((p) => Math.abs(p[0] - xc - d) > 0.9)) return xc + d; return null; };
  // A: row aisle 1 west to the cross aisle, down it to the first lower row whose crossing is free of people, and out by that row
  let A = null;
  for (let r = 6; r > 2 && !A; r--) {
    const x = vlane(Z[a0], Z[r]); if (x === null) continue;
    const za = lane(Z[a0], out, x), zb = lane(Z[r], x, out);
    A = [[out - 8, 0], [out, 8], [out, za], [x, za], [x, Z[r] - 1.3], [x, zb], [out, zb]];
  }
  const z3 = lane(Z[3], out, xw), B = [[out - 8, 0], [out, 8], [out, z3], [xw, z3], [X0 - 2, z3], [X0 - 2, 36.2]];
  return [A, B];
}
