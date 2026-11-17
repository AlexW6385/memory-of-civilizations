// The tile courses of the yellow roofs (docs/settlements/lu-qufu.md §12): a glazed roof is laid in pan tiles (the flat, curved channels) and
// cover tiles (the half-round ridges that close the joints between them), the cover tiles ending at the eave in a round disc (wadang).
// rectRoof (src/styles/ming) gives a smooth sheet; here the cover tiles are laid over it as raised half-round ribs that follow the sheet's own
// height field, one per 0.4 m, from the eave up to the ridge or the hip. All ribs and discs of a roof are one geometry of one material.
import { fromTriangles } from '../../core/geom.js';

/**
 * tileCourses(bag, r, o): r is the same record rectRoof took { c: [cx, cz], A, B, y, rise, p, sweep, kind ('hip' | 'xieshan'), alongZ, gableAt };
 * o: { mat ('tile_yellow'), pitch (0.36), w (rib width 0.2), hh (rib height 0.075), reach (the most metres up the slope from the eave: the
 * skirt of a double-eaved hall ends at its upper wall), seed }.
 */
export function tileCourses(bag, r, o = {}) {
  const [cx, cz] = r.c, A = r.A, B = r.B, R = r.rise, p = r.p ?? 1.7, sw = r.sweep ?? 0.9, kind = r.kind || 'xieshan', gAt = r.gableAt ?? 0.42;
  const pitch = o.pitch ?? 0.4, w = o.w ?? 0.2, hh = o.hh ?? 0.08, reach = o.reach ?? 99, mat = o.mat ?? 'glaze_yellow';
  const rot = (x, z) => (r.alongZ ? [cx - (z - cz), cz + (x - cx)] : [x, z]);
  const H = (x, z) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz), ts = Math.max(0, Math.min(1, (B - az) / B));
    let te = Math.max(0, (A - ax) / B);
    if (kind === 'xieshan' && te > gAt) te = 9;
    const t = Math.min(ts, te), corner = Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
    return r.y + R * Math.pow(t, p) + sw * corner * corner;
  };
  const tri = [], disc = [];
  const rib = (pts) => {
    const q = pts.map(([x, z]) => { const [rx, rz] = rot(x, z); return [rx, H(x, z), rz]; });
    for (let k = 0; k + 1 < q.length; k++) {
      const a = q[k], b = q[k + 1];
      const dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz);
      if (l < 1e-4) continue;
      const nx = -dz / l * w / 2, nz = dx / l * w / 2;
      const aL = [a[0] + nx, a[1] - 0.02, a[2] + nz], aR = [a[0] - nx, a[1] - 0.02, a[2] - nz], aT = [a[0], a[1] + hh, a[2]];
      const bL = [b[0] + nx, b[1] - 0.02, b[2] + nz], bR = [b[0] - nx, b[1] - 0.02, b[2] - nz], bT = [b[0], b[1] + hh, b[2]];
      // outward: the left face looks along (nx, nz) and up, the right face the other way; wound counter-clockwise seen from outside
      tri.push(...aL, ...bL, ...bT, ...aL, ...bT, ...aT, ...aR, ...aT, ...bT, ...aR, ...bT, ...bR);
    }
    // the round disc closing the cover tile at the eave: a hexagon facing down the slope
    const a = q[0], b = q[1];
    const tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2], tl = Math.hypot(tx, ty, tz);
    const ux = tx / tl, uy = ty / tl, uz = tz / tl;                   // up the slope
    const hl = Math.hypot(ux, uz) || 1, sx = -uz / hl, sz = ux / hl;  // across, horizontal
    const vx = -uy * ux / hl, vy = hl, vz = -uy * uz / hl;   // the axis across the slope's face, normal to both
    const cxp = a[0], cyp = a[1] + hh * 0.5, czp = a[2], rr = w * 0.62;
    const ring = [];
    for (let k = 0; k < 6; k++) { const th = k * Math.PI / 3; ring.push([cxp + (sx * Math.cos(th) + vx * Math.sin(th)) * rr, cyp + vy * Math.sin(th) * rr, czp + (sz * Math.cos(th) + vz * Math.sin(th)) * rr]); }
    const cc = [cxp - ux * 0.04, cyp - uy * 0.04, czp - uz * 0.04];   // set a little out of the cover tile's end, so it looks like a cap
    for (let k = 0; k < 6; k++) disc.push(...cc, ...ring[k], ...ring[(k + 1) % 6]);
  };
  const step = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => a + (b - a) * i / n);
  // the ribs of the long slopes run across the eave (z), each from the eave to its ridge or the crease of the hip
  const nA = Math.floor((A - 0.1) / pitch);
  for (let i = -nA; i <= nA; i++) {
    const x = cx + i * pitch + (o.seed ?? 0) * 0.001, ax = Math.abs(x - cx);
    let te = Math.max(0, (A - ax) / B); if (kind === 'xieshan' && te > gAt) te = 9;
    const dMax = Math.min(B * Math.min(1, te) - 0.1, reach, B - 0.12);
    if (dMax < 0.8) continue;
    const n = Math.max(2, Math.ceil(dMax / 1.8));
    for (const sz of [-1, 1]) rib(step(0, dMax, n).map((d) => [x, cz + sz * (B - d)]));
  }
  // the ribs of the hip ends run along the ridge's direction (x), from the end eave to the crease or (a xieshan) the gable line
  const nB = Math.floor((B - 0.1) / pitch);
  for (let j = -nB; j <= nB; j++) {
    const z = cz + j * pitch + 0.1 * pitch + (o.seed ?? 0) * 0.001, az = Math.abs(z - cz), ts = Math.max(0, Math.min(1, (B - az) / B));
    const eMax = Math.min(B * ts - 0.1, kind === 'xieshan' ? gAt * B - 0.05 : 99, reach, A - 0.12);
    if (eMax < 0.8) continue;
    const n = Math.max(2, Math.ceil(eMax / 1.8));
    for (const sx of [-1, 1]) rib(step(0, eMax, n).map((e) => [cx + sx * (A - e), z]));
  }
  if (tri.length) bag.add(mat, fromTriangles(tri.concat(disc)));
}
