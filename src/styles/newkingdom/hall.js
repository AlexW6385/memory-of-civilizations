// The Great Hypostyle Hall of Karnak (docs/settlements/thebes.md §4): 134 painted papyrus columns in 16 rows — the twelve of the
// nave (21 m, open capitals) and 122 in the aisles (14 m, closed buds), architraves, the aisle roof at 16 m, the raised nave
// with its clerestory of stone grilles, the painted ceilings, the painted reliefs on the walls. Local frame: the axis along z
// toward −z (the sanctuary), the hall between z0 (east end) and z1 (the entrance), the half-width `half` either side of x = 0.
import { box, fromTriangles } from '../../core/geom.js';
import { trim } from '../egyptian/trim.js';
import { wallReliefs, astroCeiling, offeringTable } from '../egyptian/objects.js';
import { nkColumn } from './columns.js';

/**
 * A bag that keeps of what is added to it only the triangles facing along N = [nx, nz] (the horizontal direction a wall's face looks):
 * the egyptian vocabulary's reliefs are extruded solids drawn from both sides (a figure's side walls, its back, the tops of the bands),
 * four fifths of their triangles against a wall that is never seen from behind.
 */
function facing(bag, N) {
  const out = Object.create(bag);
  out.add = (mat, g, ...rest) => {
    const q = g.index ? g.toNonIndexed() : g, P = q.attributes.position.array, T = [];
    for (let i = 0; i + 8 < P.length; i += 9) {
      const ux = P[i + 3] - P[i], uy = P[i + 4] - P[i + 1], uz = P[i + 5] - P[i + 2], vx = P[i + 6] - P[i], vy = P[i + 7] - P[i + 1], vz = P[i + 8] - P[i + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, L = Math.hypot(nx, ny, nz);
      if (L > 1e-12 && (nx * N[0] + nz * N[1]) / L > 0.5) for (let k = 0; k < 9; k++) T.push(P[i + k]);
    }
    if (T.length) return bag.add(mat, fromTriangles(T), ...rest);
  };
  return out;
}

/** nk_hall: { z0, z1, half, wall } */
export function nkHall(el, ctx) {
  const { bag, col } = ctx;
  const zA = el.z0, zB = el.z1, Hh = el.half ?? 52, wt = el.wall ?? 3, mat = 'sandstone';
  const H1 = 14, H2 = 21, A1 = 1.2, A2 = 1.5, ROOF1 = 16.0, ROOF2 = 23.4, NV = 5.6;
  // the floor of dressed sandstone, the walls
  bag.add('sandstone_floor', box(-Hh, -0.5, zA, Hh, 0, zB)); col.floor([-Hh, zA, Hh, zB], 0);
  for (const s of [-1, 1]) {
    const r = s < 0 ? [-Hh - wt, zA, -Hh, zB] : [Hh, zA, Hh + wt, zB];
    bag.add(mat, box(r[0], -0.5, r[1], r[2], ROOF1, r[3])); col.rect(r, -0.5, ROOF1);
    trim({ t: 'block', rect: r, y0: -0.5, y1: ROOF1, mat, trim: { torus: 0.3, cornice: 1.4, corners: false } }, ctx);
  }
  // the columns: the nave's twelve (six along each of the two middle rows), then 14 rows of the aisles (a row of 7 and six of 9 each side)
  const navZ = Array.from({ length: 6 }, (_, k) => zB - 4.4 - 8.8 * k), aisleZ = Array.from({ length: 9 }, (_, k) => zB - 3.7 - 5.7 * k);
  const rows = [12.0, 18.2, 24.4, 30.6, 36.8, 43.0, 49.2];
  let v = 0;
  for (const s of [-1, 1]) for (const zz of navZ) nkColumn({ at: [s * NV, zz], h: H2, d: 3.57, cap: 'open', seed: 3 + (v++ % 2) }, ctx);
  rows.forEach((lx, i) => { for (const s of [-1, 1]) for (let k = 0; k < 9; k++) { if (i === 0 && (k === 0 || k === 8)) continue; nkColumn({ at: [s * lx, aisleZ[k]], h: H1, d: 2.74, cap: 'bud', seed: 11 + ((i + k + (s > 0 ? 1 : 0)) % 4) }, ctx); } });
  // the architraves along every row (a span between each pair of columns, and to the pylons' faces), the frieze of blue and cartouches on both faces
  const beams = (lx, ys, w, zs, h) => {
    const pts = [zB, ...zs, zA];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      bag.add(mat, box(lx - w / 2, ys, b, lx + w / 2, ys + h, a));
      col.rect([lx - w / 2, b, lx + w / 2, a], ys, ys + h);
      // the frieze of blue and the cartouches on both faces: one quad each, facing out (a thin box was 12 triangles, 11 of them never seen)
      for (const f of [-1, 1]) {
        const X = lx + f * w / 2 + f * 0.015, Q = (y0, y1, z0, z1) => (f > 0 ? [X, y0, z0, X, y1, z0, X, y1, z1, X, y0, z0, X, y1, z1, X, y0, z1] : [X, y0, z0, X, y1, z1, X, y1, z0, X, y0, z0, X, y0, z1, X, y1, z1]);
        bag.add('egyptian_blue', fromTriangles(Q(ys + h - 0.45, ys + h - 0.15, b + 0.2, a - 0.2)));
        const C = [];
        for (let z = b + 0.6; z < a - 0.5; z += 1.1) C.push(...Q(ys + 0.25, ys + h - 0.55, z, z + 0.5));
        if (C.length) bag.add('paint_ochre', fromTriangles(C));
      }
    }
  };
  for (const s of [-1, 1]) {
    beams(s * NV, H2, 1.6, navZ.slice().sort((p, q) => q - p), A2);
    for (const lx of rows) beams(s * lx, H1, 1.4, (lx === 12.0 ? aisleZ.slice(1, 8) : aisleZ), A1);
  }
  // the roofs: the aisles' slabs at 16 m, the nave's at 23.4 m
  for (const s of [-1, 1]) bag.add(mat, box(s < 0 ? -Hh - wt : 6.3, 15.2, zA, s < 0 ? -6.3 : Hh + wt, ROOF1, zB));
  bag.add(mat, box(-6.4, 22.5, zA, 6.4, ROOF2, zB));
  // the clerestory: between the nave's capitals, stone grilles lighting the nave from over the aisles' roofs; solid wall at the ends
  const capR = 3.3;
  for (const s of [-1, 1]) {
    const lx = s * NV, spans = [[zB, navZ[0] + capR], ...navZ.slice(0, 5).map((z, k) => [z - capR, navZ[k + 1] + capR]), [navZ[5] - capR, zA]];
    spans.forEach(([a, b], i) => {
      const end = i === 0 || i === spans.length - 1;
      if (end) { bag.add(mat, box(lx - 0.6, ROOF1, Math.min(a, b), lx + 0.6, H2, Math.max(a, b))); col.rect([lx - 0.6, Math.min(a, b), lx + 0.6, Math.max(a, b)], ROOF1, H2); return; }
      const hi = Math.max(a, b), lo = Math.min(a, b);
      bag.add(mat, box(lx - 0.6, ROOF1, lo, lx + 0.6, ROOF1 + 0.5, hi)); bag.add(mat, box(lx - 0.6, H2 - 0.45, lo, lx + 0.6, H2, hi));
      bag.add(mat, box(lx - 0.6, ROOF1 + 0.5, lo, lx + 0.6, H2 - 0.45, lo + 0.2)); bag.add(mat, box(lx - 0.6, ROOF1 + 0.5, hi - 0.2, lx + 0.6, H2 - 0.45, hi));
      for (let z = lo + 0.2 + 0.28; z < hi - 0.3; z += 0.56) bag.add('sandstone_dressed', box(lx - 0.3, ROOF1 + 0.5, z - 0.12, lx + 0.3, H2 - 0.45, z + 0.12));   // the slats of the grille
    });
  }
  // the painted ceilings: the nave's night sky with vultures and winged discs flying toward the sanctuary, Nut and the star gods over the aisles, stars over the rest
  const bays = [[-4.8, zA, 4.8, zB, 'vultures']], plain = [], lines = [NV, ...rows];
  for (let i = 0; i < lines.length - 1; i++) {
    const x0 = lines[i] + (i === 0 ? 2.0 : 0.7), x1 = lines[i + 1] - 0.7;
    for (const s of [-1, 1]) { const bay = s < 0 ? [-x1, zA, -x0, zB, 'sky'] : [x0, zA, x1, zB, 'sky']; (i < 3 ? bays : plain).push(bay); }
  }
  astroCeiling({ y: 22.5, bays }, ctx); astroCeiling({ y: 15.2, bays: bays.filter((b) => b[4] === 'sky') }, ctx);
  void plain;
  for (const [x0, , x1] of plain) bag.add('vault_stars', box(x0, 15.18, zA, x1, 15.2, zB));
  // the painted reliefs of the side walls and of the pylons' faces
  const W = (a, b, n, gaps = []) => wallReliefs({ a, b, n, y: 0, v0: 1.4, top: 12.6, reg: 2.8, inward: 1, gods: 'paint', gaps }, { ...ctx, bag: facing(bag, n) });
  W([Hh, zB], [Hh, zA], [-1, 0]); W([-Hh, zB], [-Hh, zA], [1, 0]);
  W([-Hh, zB], [-4.5, zB], [0, -1]); W([Hh, zB], [4.5, zB], [0, -1]);
  W([-Hh, zA], [-4.5, zA], [0, 1]); W([Hh, zA], [4.5, zA], [0, 1]);
  // the offering tables set in the nave before the gate of the sanctuary side
  for (const [x, z] of [[-2.7, zA + 9], [2.7, zA + 9], [-2.7, zA + 17], [2.7, zA + 25]]) offeringTable({ at: [x, z], y: 0, yaw: 0 }, ctx);
}
