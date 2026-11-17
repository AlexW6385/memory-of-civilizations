// The tile work of a Nara hall's roof (docs/settlements/nara.md §18): the roof's surface carries the rows of half-round tiles (maru-gawara)
// that run from the eave up to the ridge and the hips between flat tiles, the round end-tiles (nokimaru-gawara) close the eave's rows in
// a line of discs along the whole edge, and the ridge is a stack of stepped tile courses [inferred: the type of the Nara-period tile roof;
// the shared hipRoof gives a bare smooth surface].

import { fromTriangles, orientOutward } from '../../core/geom.js';

/** Rows of half-round tiles and the eave's end discs on a hip roof { c, A, B, y, rise, S, PW, lift } at scale K. */
export function tileWork(bag, o, K) {
  const [cx, cz] = o.c, { A, B, S, PW } = o, R = o.rise, U = o.lift;
  const h = (x, z) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz);
    const t = Math.max(0, Math.min(1, Math.min((B - az) / B, (A - ax) / B)));
    const corner = Math.max(0, 1 - (A - ax) / 5) * Math.max(0, 1 - (B - az) / 5);
    return o.y + S * B * t + (R - S * B) * Math.pow(t, PW) + U * corner * corner;
  };
  const T = [], sp = 0.9 * K, hw = 0.09 * K, ht = 0.14 * K;
  // a row of tiles along a polyline of plan points: a low triangular-section ridge on the roof
  const row = (pts) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz);
      if (l < 1e-3) continue;
      const px = -dz / l * hw, pz = dx / l * hw, ya = h(ax, az) + 0.02, yb = h(bx, bz) + 0.02;
      const a0 = [ax - px, ya, az - pz], a1 = [ax + px, ya, az + pz], at = [ax, ya + ht, az], b0 = [bx - px, yb, bz - pz], b1 = [bx + px, yb, bz + pz], bt = [bx, yb + ht, bz];
      T.push(...a0, ...b0, ...bt, ...a0, ...bt, ...at, ...a1, ...at, ...bt, ...a1, ...bt, ...b1);
    }
  };
  const steps = (len) => Math.max(2, Math.ceil(len / 4));
  const line = (p, q) => { const n = steps(Math.hypot(q[0] - p[0], q[1] - p[1])); return Array.from({ length: n + 1 }, (_, i) => [p[0] + (q[0] - p[0]) * i / n, p[1] + (q[1] - p[1]) * i / n]); };
  const L = A - B, nF = Math.floor(A * 2 / sp), nS = Math.floor(B * 2 / sp);
  // the long slopes (north and south): rows square to the eave, ending at the hips or the ridge
  for (let i = 1; i < nF; i++) {
    const x = cx - A + i * (2 * A) / nF, ax = Math.abs(x - cx), zEnd = ax > L ? B - (A - ax) : 0;
    if (B - zEnd < 1) continue;
    for (const s of [-1, 1]) row(line([x, cz + s * (B - 0.2)], [x, cz + s * Math.max(zEnd, 0.3)]));
  }
  // the end slopes (east and west)
  for (let j = 1; j < nS; j++) {
    const z = cz - B + j * (2 * B) / nS, az = Math.abs(z - cz), xEnd = B - az;
    if (xEnd < 1) continue;
    for (const s of [-1, 1]) row(line([cx + s * (A - 0.2), z], [cx + s * (A - xEnd), z]));
  }
  bag.add('tile_grey', fromTriangles(orientOutward(T)));
  discRing(bag, o.c, A, B, h, K);
}

/** The eave's end discs: round tiles standing at the edge of a rectangular eave (half-sizes A, B), facing out, with the edge's height h(x, z) at scale K. */
export function discRing(bag, c, A, B, h, K) {
  const [cx, cz] = c;
  const D = [], r = 0.27 * K, per = 4 * (A + B), n = Math.floor(per / (0.62 * K));
  for (let k = 0; k < n; k++) {
    const d = per * (k + 0.5) / n;
    let x, z, nx, nz;
    if (d < 2 * A) { x = cx - A + d; z = cz - B; nx = 0; nz = -1; }
    else if (d < 2 * A + 2 * B) { x = cx + A; z = cz - B + (d - 2 * A); nx = 1; nz = 0; }
    else if (d < 4 * A + 2 * B) { x = cx + A - (d - 2 * A - 2 * B); z = cz + B; nx = 0; nz = 1; }
    else { x = cx - A; z = cz + B - (d - 4 * A - 2 * B); nx = -1; nz = 0; }
    const ux = -nz, uz = nx, yc = h(x, z) + 0.02 + 0.1;
    // a disc of 8 sides, 0.1 thick, with a boss, standing on the edge
    const ring = (o2, rr, yy) => Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2; return [x + nx * o2 + ux * Math.cos(a) * rr, yc + Math.sin(a) * rr * 0.9 + yy, z + nz * o2 + uz * Math.cos(a) * rr]; });
    const back = ring(0, r, 0), front = ring(0.12, r, 0), cf = [x + nx * 0.12, yc, z + nz * 0.12], cf2 = [x + nx * 0.2, yc, z + nz * 0.2], bossR = ring(0.12, r * 0.38, 0);
    const tri = [];
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      tri.push(...back[i], ...front[i], ...front[j], ...back[i], ...front[j], ...back[j]);
      tri.push(...front[i], ...cf, ...front[j]);                                   // the face (the boss rises over it)
    }
    for (let i = 0; i < 8; i++) { const j = (i + 1) % 8; tri.push(...bossR[i], ...cf2, ...bossR[j]); }
    D.push(...orientOutward(tri));
  }
  bag.add('tile_grey', fromTriangles(D));
}
