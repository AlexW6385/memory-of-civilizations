// A group of elements built in a frame of their own and turned about the plan's origin by any angle:
// Manhattan's grid, which runs 29° east of true north (docs/settlements/new-york.md §3). A plan's own
// `yaw` turns only by quarter turns (its colliders stay on the axes), so the grid's elements are laid
// out square in the grid's frame and turned here: their geometry and lights exactly; their
// obstacles (polygons and circles) exactly; their floors and ramps, which the collision world keeps
// as axis-aligned rectangles, as strips of rectangles inside the turned ones (a ramp's strips cut
// short along it too, each level at the ramp's height at its middle: steps of a few centimetres).

import { Matrix4 } from '../../core/three.js';
import { Colliders } from '../../core/build.js';

const STRIP = 0.5;     // m: the width of a floor's strips (a ramp's pieces are as long)

/** Local (x, z) of the grid → the plan's, turned by `a` (as Matrix4.makeRotationY(a)). */
export const turnPoint = (a, x, z) => { const c = Math.cos(a), s = Math.sin(a); return [c * x + s * z, -s * x + c * z]; };

/**
 * turned: { angle (radians, as makeRotationY), elements: [...] } — the elements, built by the
 * plan's style, turned by `angle` about the origin.
 */
export function turned(el, ctx) {
  const a = el.angle ?? 0, R = new Matrix4().makeRotationY(a), real = ctx.bag, done = new WeakSet();
  const bag = Object.create(real);
  bag.add = (mat, g) => {
    if (!g) return;
    if (g.index) g = g.toNonIndexed();
    else if (done.has(g)) g = g.clone();       // the same piece added twice: turned once each
    done.add(g);
    real.add(mat, g.applyMatrix4(R));
  };
  bag.addInstance = (mat, g, m, opts) => real.addInstance(mat, g, new Matrix4().multiplyMatrices(R, m), opts);
  const col = new Colliders(), lights = [];
  const sub = { ...ctx, bag, col, lights };
  for (const e of el.elements) {
    const fn = ctx.style.elements?.[e.t];
    if (!fn) throw new Error(`${ctx.plan.id}: no builder for element type ${e.t}`);
    fn(e, sub);
  }
  const P = (x, z) => turnPoint(a, x, z);
  for (const o of col.obstacles) {
    if (o.circle) { const [x, z] = P(o.circle[0], o.circle[1]); ctx.col.obstacles.push({ circle: [x, z, o.circle[2]], y0: o.y0, y1: o.y1 }); }
    else ctx.col.obstacles.push({ poly: o.poly.map(([x, z]) => P(x, z)), y0: o.y0, y1: o.y1 });
  }
  for (const f of col.floors) for (const g of floorStrips(a, f)) ctx.col.floors.push(g);
  for (const l of lights) { const [x, z] = P(l.at[0], l.at[2]); ctx.lights.push({ ...l, at: [x, l.at[1], z] }); }
}

/** A floor or ramp of the grid's frame as axis-aligned strips inside its turned rectangle. */
function floorStrips(a, f) {
  const [x0, z0, x1, z1] = f.rect, corners = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]].map(([x, z]) => turnPoint(a, x, z));
  const back = (x, z) => turnPoint(-a, x, z);
  // the z-interval of the turned rectangle along the line x = X (null outside)
  const span = (X) => {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < 4; i++) {
      const [ax, az] = corners[i], [bx, bz] = corners[(i + 1) % 4];
      if ((ax - X) * (bx - X) > 0 || ax === bx) continue;
      const z = az + ((X - ax) / (bx - ax)) * (bz - az);
      lo = Math.min(lo, z); hi = Math.max(hi, z);
    }
    return lo <= hi ? [lo, hi] : null;
  };
  const xs = corners.map((p) => p[0]), X0 = Math.min(...xs), X1 = Math.max(...xs), out = [];
  const n = Math.max(1, Math.round((X1 - X0) / STRIP)), w = (X1 - X0) / n;
  // (the strips of a floor narrower than one strip, or the outermost: from a little inside the edge)
  for (let i = 0; i < n; i++) {
    const xa = X0 + i * w, xb = xa + w, A = span(i === 0 ? xa + Math.min(0.05, w / 4) : xa), B = span(i === n - 1 ? xb - Math.min(0.05, w / 4) : xb);
    if (!A || !B) continue;
    const za = Math.max(A[0], B[0]), zb = Math.min(A[1], B[1]);
    if (zb - za < 0.05) continue;
    if (f.y1 === undefined) { out.push({ rect: [xa, za, xb, zb], y: f.y, tag: f.tag }); continue; }
    const m = Math.max(1, Math.round((zb - za) / STRIP));
    for (let j = 0; j < m; j++) {
      const ca = za + ((zb - za) * j) / m, cb = za + ((zb - za) * (j + 1)) / m, [lx, lz] = back((xa + xb) / 2, (ca + cb) / 2);
      out.push({ rect: [xa, ca, xb, cb], y: rampY(f, lx, lz), tag: f.tag });
    }
  }
  return out;
}

/** The height of a ramp (its frame's dir of ascent) at a local point. */
function rampY(f, x, z) {
  const [x0, z0, x1, z1] = f.rect;
  const t = f.dir === 'n' ? (z1 - z) / (z1 - z0) : f.dir === 's' ? (z - z0) / (z1 - z0) : f.dir === 'e' ? (x - x0) / (x1 - x0) : (x1 - x) / (x1 - x0);
  return f.y + (f.y1 - f.y) * Math.max(0, Math.min(1, t));
}
