// A build context turned by a quarter-turn about a centre (the pura dalem is authored facing south and stood facing west): geometry and colliders go through it.
// θ = −π/2 · turns, three's rotation about y: x' = cx + dx cosθ + dz sinθ, z' = cz − dx sinθ + dz cosθ.

/** ctx turned by `turns` quarter turns (−1: local +z faces world −x, i.e. an entrance on the west side). */
export function turned(ctx, c, turns) {
  if (!turns) return ctx;
  const th = turns * Math.PI / 2, co = Math.round(Math.cos(th)), si = Math.round(Math.sin(th)), [cx, cz] = c;
  const pt = (x, z) => [cx + (x - cx) * co + (z - cz) * si, cz - (x - cx) * si + (z - cz) * co];
  const rect = ([x0, z0, x1, z1]) => { const a = pt(x0, z0), b = pt(x1, z1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const V = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
  const dirOf = (d) => { const [x, z] = V[d], nx = x * co + z * si, nz = -x * si + z * co; return Math.abs(nx) > Math.abs(nz) ? (nx > 0 ? 'e' : 'w') : (nz > 0 ? 's' : 'n'); };
  const bag = { add: (m, g) => { if (g) g.translate(-cx, 0, -cz).rotateY(th).translate(cx, 0, cz); ctx.bag.add(m, g); } };
  const col = {
    floor: (r, y, t) => ctx.col.floor(rect(r), y, t),
    ramp: (r, y0, y1, d) => ctx.col.ramp(rect(r), y0, y1, dirOf(d)),
    rect: (r, y0, y1) => ctx.col.rect(rect(r), y0, y1),
    circle: (x, z, r, y0, y1) => { const p = pt(x, z); ctx.col.circle(p[0], p[1], r, y0, y1); },
    segment: (a, b, t, y0, y1) => ctx.col.segment(pt(...a), pt(...b), t, y0, y1),
  };
  return { ...ctx, bag, col };
}
