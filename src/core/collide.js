// Collision world: walkable surfaces (floors and ramps) and obstacles (plan polygons and
// circles with a vertical extent). Shared by the walking controller and the plan checker.

const CELL = 8;

export class CollisionWorld {
  constructor() {
    this.floors = [];
    this.obstacles = [];
    this.grid = new Map();
    this.floorGrid = new Map();
    this.terrain = () => 0;   // height of the open ground of the world at (x, z)
    this.tops = [];           // the buildings' upper surfaces (topField), to stand on from above
  }

  add(c) {
    cutUnderRamps(c);
    const { floors, obstacles, tops } = c;
    if (tops) this.tops.push(tops);
    for (const f of floors) { this.floors.push(f); this._index(this.floorGrid, f.rect, f); }
    for (const o of obstacles) {
      if (o.circle) { const [x, z, r] = o.circle; o.bb = [x - r, z - r, x + r, z + r]; }
      else {
        const xs = o.poly.map((p) => p[0]), zs = o.poly.map((p) => p[1]);
        o.bb = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
      }
      this.obstacles.push(o);
      this._index(this.grid, o.bb, o);
    }
  }

  /** Take out what add() put in (a building that is unloaded). */
  remove({ floors, obstacles, tops }) {
    if (tops) this.tops = this.tops.filter((t) => t !== tops);
    const fs = new Set(floors), os = new Set(obstacles);
    this.floors = this.floors.filter((f) => !fs.has(f));
    this.obstacles = this.obstacles.filter((o) => !os.has(o));
    for (const [grid, items] of [[this.floorGrid, floors], [this.grid, obstacles]]) {
      const drop = items === floors ? fs : os;
      for (const it of items) {
        const [x0, z0, x1, z1] = it.rect ? [Math.min(it.rect[0], it.rect[2]), Math.min(it.rect[1], it.rect[3]), Math.max(it.rect[0], it.rect[2]), Math.max(it.rect[1], it.rect[3])] : it.bb;
        for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) for (let j = Math.floor(z0 / CELL); j <= Math.floor(z1 / CELL); j++) {
          const k = i + ',' + j, list = grid.get(k);
          if (!list) continue;
          const kept = list.filter((q) => !drop.has(q));
          if (kept.length) grid.set(k, kept); else grid.delete(k);
        }
      }
    }
  }

  _index(grid, [x0, z0, x1, z1], item) {
    for (let i = Math.floor(x0 / CELL); i <= Math.floor(x1 / CELL); i++) {
      for (let j = Math.floor(z0 / CELL); j <= Math.floor(z1 / CELL); j++) {
        const k = i + ',' + j;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(item);
      }
    }
  }

  _near(grid, x, z) { return grid.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL)) || []; }

  /** Height of a floor item at (x, z), or null if outside it. */
  static floorHeight(f, x, z) {
    const [x0, z0, x1, z1] = f.rect;
    if (x < x0 || x > x1 || z < z0 || z > z1) return null;
    if (f.y1 === undefined) return f.y;
    let t;
    if (f.dir === 'n') t = (z1 - z) / (z1 - z0);
    else if (f.dir === 's') t = (z - z0) / (z1 - z0);
    else if (f.dir === 'e') t = (x - x0) / (x1 - x0);
    else t = (x1 - x) / (x1 - x0);
    return f.y + (f.y1 - f.y) * t;
  }

  /** Highest walkable surface at (x, z) not above maxY. */
  groundAt(x, z, maxY) {
    const t = this.terrain(x, z);
    let best = t <= maxY ? t : -Infinity;
    for (const f of this._near(this.floorGrid, x, z)) {
      const h = CollisionWorld.floorHeight(f, x, z);
      if (h !== null && h <= maxY && h > best) best = h;
    }
    return best;
  }

  /** Highest top of an obstacle under the circle (x, z, r) not above maxY (roofs and walls to land on). */
  topAt(x, z, r, maxY) {
    let best = -Infinity;
    // over the walker's footprint, so that a gap of a cell between roof tiles is not a hole
    const f = Math.min(r, 0.2);
    for (const T of this.tops) {
      const i0 = Math.max(0, Math.floor((x - f - T.x0) / T.res)), i1 = Math.min(T.w - 1, Math.floor((x + f - T.x0) / T.res));
      const j0 = Math.max(0, Math.floor((z - f - T.z0) / T.res)), j1 = Math.min(T.h - 1, Math.floor((z + f - T.z0) / T.res));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const h = T.data[j * T.w + i];
        if (h <= maxY && h > best) best = h;
      }
    }
    for (const o of this._near(this.grid, x, z)) {
      if (o.y1 > maxY || o.y1 <= best) continue;
      if (x + r < o.bb[0] || x - r > o.bb[2] || z + r < o.bb[1] || z - r > o.bb[3]) continue;
      if (o.circle ? Math.hypot(x - o.circle[0], z - o.circle[1]) < o.circle[2] + r : circlePoly(x, z, r, o.poly)) best = o.y1;
    }
    return best;
  }

  /** Is anything (an obstacle, or a floor seen from below) in the way of rising from y0 to y1 at (x, z)? */
  ceilingBetween(x, z, r, y0, y1) {
    if (this.blockedAt(x, z, r, y0, y1)) return true;
    for (const f of this._near(this.floorGrid, x, z)) {
      const h = CollisionWorld.floorHeight(f, x, z);
      if (h !== null && h > y0 && h <= y1) return true;
    }
    return false;
  }

  /** Would a body at (x, z) from y0 to y1 be inside a roof's shell (between a top higher than
   *  `climb` and its underside, with no floor or ramp of its own up there)? Roofs are not
   *  obstacles; this keeps one from walking into a slope. */
  inShell(x, z, r, y0, y1, climb) {
    for (const T of this.tops) {
      if (!T.under) continue;
      for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]]) {
        const i = Math.floor((x + dx - T.x0) / T.res), j = Math.floor((z + dz - T.z0) / T.res);
        if (i < 0 || j < 0 || i >= T.w || j >= T.h) continue;
        const o = j * T.w + i, top = T.data[o];
        // (not where a floor or a ramp runs at about that height, at the cell's centre where the top
        // was taken: the top is what one walks on there)
        if (top > climb && top > y0 && T.under[o] < y1 && this.groundAt(T.x0 + (i + 0.5) * T.res, T.z0 + (j + 0.5) * T.res, top + 0.05) < top - 0.3) return true;
      }
    }
    return false;
  }

  /** Lowest surface above y at (x, z) (a ceiling for the head check), from obstacles only. */
  blockedAt(x, z, r, y0, y1) {
    for (const o of this._near(this.grid, x, z)) {
      if (o.y1 <= y0 || o.y0 >= y1) continue;
      if (x + r < o.bb[0] || x - r > o.bb[2] || z + r < o.bb[1] || z - r > o.bb[3]) continue;
      if (o.circle) {
        const [cx, cz, cr] = o.circle;
        if (Math.hypot(x - cx, z - cz) < cr + r) return true;
      } else if (circlePoly(x, z, r, o.poly)) return true;
    }
    return false;
  }

  /** Push the circle (x, z, r) out of obstacles overlapping y0..y1. Returns [x, z]. */
  resolve(x, z, r, y0, y1) {
    for (let iter = 0; iter < 4; iter++) {
      let moved = false;
      for (const o of this._near(this.grid, x, z)) {
        if (o.y1 <= y0 || o.y0 >= y1) continue;
        if (x + r < o.bb[0] || x - r > o.bb[2] || z + r < o.bb[1] || z - r > o.bb[3]) continue;
        if (o.circle) {
          const [cx, cz, cr] = o.circle;
          const dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz), m = cr + r;
          if (d < m) { const k = d > 1e-6 ? (m - d) / d : 0; x += dx * k; z += dz * k; if (d <= 1e-6) x += m; moved = true; }
        } else {
          const p = pushOut(x, z, r, o.poly);
          if (p) { x = p[0]; z = p[1]; moved = true; }
        }
      }
      if (!moved) break;
    }
    return [x, z];
  }
}

/**
 * The upper surface of built geometry, as a height field: the highest upward-facing surface over
 * each cell of `res` metres (roofs, wall tops, terraces). From above one lands and walks on it;
 * from inside (below the roof) it is out of reach. parts: [{ mat, geometry }] (unindexed, in the
 * collision world's coordinates). Gives the thread back every few milliseconds.
 */
export async function topField(parts, res = 0.5, skip = ['water', 'glass_outer', 'glass_topaz', 'water_jet', 'foam']) {
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const { mat, geometry } of parts) {
    if (skip.includes(mat)) continue;
    const b = geometry.boundingBox || (geometry.computeBoundingBox(), geometry.boundingBox);
    x0 = Math.min(x0, b.min.x); z0 = Math.min(z0, b.min.z); x1 = Math.max(x1, b.max.x); z1 = Math.max(z1, b.max.z);
  }
  if (!Number.isFinite(x0)) return null;
  const w = Math.ceil((x1 - x0) / res) + 1, h = Math.ceil((z1 - z0) / res) + 1;
  const data = new Float32Array(w * h).fill(-Infinity);
  let t = performance.now();
  for (const { mat, geometry } of parts) {
    if (skip.includes(mat)) continue;
    const P = geometry.attributes.position.array;
    for (let k = 0; k < P.length; k += 9) {
      const ax = P[k], ay = P[k + 1], az = P[k + 2], bx = P[k + 3], by = P[k + 4], bz = P[k + 5], cx = P[k + 6], cy = P[k + 7], cz = P[k + 8];
      // faces less steep than about 72°, whichever way they are wound (some roofs are wound
      // downward: the highest face over a spot is its top all the same)
      const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (Math.abs(ny) <= 0.3 * Math.hypot(nx, ny, nz)) continue;
      const det = ux * vz - uz * vx;
      if (Math.abs(det) < 1e-9) continue;
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx, cx) - x0) / res)), i1 = Math.min(w - 1, Math.floor((Math.max(ax, bx, cx) - x0) / res));
      const j0 = Math.max(0, Math.floor((Math.min(az, bz, cz) - z0) / res)), j1 = Math.min(h - 1, Math.floor((Math.max(az, bz, cz) - z0) / res));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const px = x0 + (i + 0.5) * res - ax, pz = z0 + (j + 0.5) * res - az;
        const s = (px * vz - pz * vx) / det, q = (ux * pz - uz * px) / det;
        if (s < -0.02 || q < -0.02 || s + q > 1.02) continue;
        const y = ay + uy * s + vy * q, o = j * w + i;
        if (y > data[o]) data[o] = y;
      }
      if ((k & 1023) === 0 && performance.now() - t > 8) { await new Promise((r) => setTimeout(r, 0)); t = performance.now(); }
    }
  }
  // under each top, the underside of the same shell: the highest face below the top (none: solid
  // down to the ground). Between the two one cannot stand or walk (a roof's slope).
  const under = new Float32Array(w * h).fill(-Infinity);
  for (const { mat, geometry } of parts) {
    if (skip.includes(mat)) continue;
    const P = geometry.attributes.position.array;
    for (let k = 0; k < P.length; k += 9) {
      const ax = P[k], ay = P[k + 1], az = P[k + 2], bx = P[k + 3], by = P[k + 4], bz = P[k + 5], cx = P[k + 6], cy = P[k + 7], cz = P[k + 8];
      const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (Math.abs(ny) <= 0.3 * Math.hypot(nx, ny, nz)) continue;
      const det = ux * vz - uz * vx;
      if (Math.abs(det) < 1e-9) continue;
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx, cx) - x0) / res)), i1 = Math.min(w - 1, Math.floor((Math.max(ax, bx, cx) - x0) / res));
      const j0 = Math.max(0, Math.floor((Math.min(az, bz, cz) - z0) / res)), j1 = Math.min(h - 1, Math.floor((Math.max(az, bz, cz) - z0) / res));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const px = x0 + (i + 0.5) * res - ax, pz = z0 + (j + 0.5) * res - az;
        const s = (px * vz - pz * vx) / det, q = (ux * pz - uz * px) / det;
        if (s < -0.02 || q < -0.02 || s + q > 1.02) continue;
        const y = ay + uy * s + vy * q, o = j * w + i;
        if (y < data[o] - 0.05 && y > under[o]) under[o] = y;
      }
      if ((k & 1023) === 0 && performance.now() - t > 8) { await new Promise((r) => setTimeout(r, 0)); t = performance.now(); }
    }
  }
  return { x0, z0, res, w, h, data, under };
}

/**
 * A stair or ramp declares where one walks: what its own plan built under it may not stand in the
 * way. Many stairs are a flight of treads laid over a stepped or sloping mass (a pyramid's
 * terraces, a podium, a platform) whose ledges rise through the treads by a little. For each ramp
 * of one plan's colliders (in place, once):
 * - an obstacle that reaches below the ramp where the two overlap and whose top does not rise more
 *   than half a metre over the ramp's upper end (a mass under the stair, not a wall across it) is
 *   cut back to what lies outside the ramp's rectangle (it still stands beside the stair);
 * - in the top field, a cell over the ramp whose top lies above the ramp, no higher than half a
 *   metre over its upper end, and whose underside is lower than a head over the ramp (the mass the
 *   stair is built in, a ledge or moulding through it — not a roof or a floor over it) is lowered
 *   to the ramp, so that one is not caught "inside a roof" on the steps.
 * Walls and roofs over a stair (higher than its upper end, or with their underside above one's
 * head) are kept.
 */
export function cutUnderRamps(c) {
  if (c._cut || !c.floors) return;
  c._cut = true;
  const ramps = c.floors.filter((f) => f.y1 !== undefined);
  if (!ramps.length) return;
  for (const f of ramps) {
    const hi = Math.max(f.y, f.y1);
    if (f.rect[2] - f.rect[0] < 0.3 || f.rect[3] - f.rect[1] < 0.3) continue;
    // the rectangle grown at its upper end by a little more than the walker's radius: a steep flight
    // that ends against the mass it climbs onto is not stopped by its edge a few centimetres short
    const up = f.y1 > f.y ? f.dir : { n: 's', s: 'n', e: 'w', w: 'e' }[f.dir], G = 0.35;
    const [x0, z0, x1, z1] = [f.rect[0] - (up === 'w' ? G : 0), f.rect[1] - (up === 'n' ? G : 0), f.rect[2] + (up === 'e' ? G : 0), f.rect[3] + (up === 's' ? G : 0)];
    const on = (x, z) => CollisionWorld.floorHeight(f, Math.min(f.rect[2], Math.max(f.rect[0], x)), Math.min(f.rect[3], Math.max(f.rect[1], z)));
    const out = [];
    let cut = false;
    for (const o of c.obstacles) {
      if (o.circle || o.y1 > hi + 0.5) { out.push(o); continue; }
      const b = o.bb || (o.bb = polyBox(o.poly));
      const ox0 = Math.max(x0, b[0]), ox1 = Math.min(x1, b[2]), oz0 = Math.max(z0, b[1]), oz1 = Math.min(z1, b[3]);
      if (ox1 - ox0 < 0.05 || oz1 - oz0 < 0.05) { out.push(o); continue; }
      // the ramp's lowest point over the overlap (it is linear: at a corner), and a walker's radius
      // down the ramp from there: the mass must reach under the one and rise into a body on the other
      const dx = up === 'e' ? -G : up === 'w' ? G : 0, dz = up === 's' ? -G : up === 'n' ? G : 0;
      const corners = [[ox0, oz0], [ox1, oz0], [ox0, oz1], [ox1, oz1]];
      const h = Math.min(...corners.map(([x, z]) => on(x, z))), hDown = Math.min(...corners.map(([x, z]) => on(x + dx, z + dz)));
      if (!(o.y0 < h && o.y1 > Math.min(h, hDown) + 0.25)) { out.push(o); continue; }
      cut = true;
      const mid = clip(clip(o.poly, 0, -1, -x0), 0, 1, x1);           // x0 ≤ x ≤ x1
      for (const piece of [clip(o.poly, 0, 1, x0), clip(o.poly, 0, -1, -x1), clip(mid, 1, 1, z0), clip(mid, 1, -1, -z1)]) {
        if (piece.length >= 3 && Math.abs(area(piece)) > 1e-3) out.push({ ...o, poly: piece, bb: undefined });
      }
    }
    if (cut) c.obstacles.splice(0, c.obstacles.length, ...out);
    const T = c.tops;
    if (!T?.under) continue;
    const i0 = Math.max(0, Math.floor((x0 - T.x0) / T.res)), i1 = Math.min(T.w - 1, Math.floor((x1 - T.x0) / T.res));
    const j0 = Math.max(0, Math.floor((z0 - T.z0) / T.res)), j1 = Math.min(T.h - 1, Math.floor((z1 - T.z0) / T.res));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const x = Math.min(x1, Math.max(x0, T.x0 + (i + 0.5) * T.res)), z = Math.min(z1, Math.max(z0, T.z0 + (j + 0.5) * T.res));
      const h = on(x, z), o = j * T.w + i;
      if (T.data[o] > h + 0.02 && T.under[o] < h + 1.9 && T.data[o] <= hi + 0.5) { T.data[o] = h; T.under[o] = Math.min(T.under[o], h - 0.06); }
    }
  }
}

/** The part of a polygon where s · p[axis] ≤ v (axis 0: x, 1: z; s = 1: p ≤ v, s = −1: p ≥ −v). */
function clip(poly, axis, s, v) {
  const out = [], inn = (p) => s * p[axis] <= v + 1e-9;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], ia = inn(a), ib = inn(b);
    if (ia) out.push(a);
    if (ia !== ib) {
      const t = (v - s * a[axis]) / (s * (b[axis] - a[axis]));
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

function polyBox(poly) {
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const [x, z] of poly) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
  return [x0, z0, x1, z1];
}

function area(poly) {
  let s = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) s += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  return s / 2;
}

function inside(x, z, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

function closestOnPoly(x, z, poly) {
  let best = null, bd = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j], [bx, bz] = poly[i];
    const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz || 1;
    let t = ((x - ax) * vx + (z - az) * vz) / l2;
    t = Math.max(0, Math.min(1, t));
    const px = ax + vx * t, pz = az + vz * t, d = Math.hypot(x - px, z - pz);
    if (d < bd) { bd = d; best = [px, pz]; }
  }
  return [best, bd];
}

function circlePoly(x, z, r, poly) {
  if (inside(x, z, poly)) return true;
  return closestOnPoly(x, z, poly)[1] < r;
}

function pushOut(x, z, r, poly) {
  const [p, d] = closestOnPoly(x, z, poly);
  const ins = inside(x, z, poly);
  if (!ins && d >= r) return null;
  let nx = x - p[0], nz = z - p[1];
  const l = Math.hypot(nx, nz) || 1;
  nx /= l; nz /= l;
  if (ins) { nx = -nx; nz = -nz; }
  return [p[0] + nx * (r + 1e-3), p[1] + nz * (r + 1e-3)];
}
