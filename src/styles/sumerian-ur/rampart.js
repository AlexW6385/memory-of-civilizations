// The city rampart of Ur (docs/settlements/ur.md §5.10): Ur-Nammu's wall round the oval of the town — a retaining mass of
// mud brick with a steep outer face and a gentler inner one, a battlement of burnt brick along the top (the gates are
// built apart: gate_tower). rampart: { r (radius of the crest's middle), arcs: [[a0, a1], ...] (angles, 0 east, +z south) }.

import { fromTriangles, orientOutward } from '../../core/geom.js';

// the section across the wall, [u outward from the crest's middle, y]: the toe of the inner slope, its top, the outer top, the outer face's three bands, the toe
export const SECTION = [[-8, 0], [-2.5, 7], [2.5, 7], [3.6, 4.7], [4.8, 2.4], [6, 0]];
const MAT = ['mudbrick', 'mudbrick', 'mud_plaster', 'mudbrick', 'mud_plaster'];     // the faces (inner slope, top, the three bands of the outer face)

export function rampart(el, { bag, col }) {
  const r = el.r ?? 368, cen = [0, 3.5];
  for (const [a0, a1] of el.arcs) {
    const n = Math.max(1, Math.ceil((a1 - a0) * r / 12)), da = (a1 - a0) / n;
    const pt = (a, [u, y]) => [Math.cos(a) * (r + u), y, Math.sin(a) * (r + u)];
    const T = {};
    for (let i = 0; i < n; i++) {
      const a = a0 + i * da, b = a + da;
      for (let j = 0; j + 1 < SECTION.length; j++) {
        const p = SECTION[j], q = SECTION[j + 1], mx = (p[0] + q[0]) / 2 - cen[0], my = (p[1] + q[1]) / 2 - cen[1];
        const A = pt(a, p), B = pt(b, p), C = pt(b, q), D = pt(a, q), am = (a + b) / 2;
        const out = [Math.cos(am) * mx, my, Math.sin(am) * mx];
        const tri = [...A, ...B, ...C, ...A, ...C, ...D];
        // keep the winding that faces outward from the section's middle
        const nrm = (k) => { const ux = tri[k + 3] - tri[k], uy = tri[k + 4] - tri[k + 1], uz = tri[k + 5] - tri[k + 2], vx = tri[k + 6] - tri[k], vy = tri[k + 7] - tri[k + 1], vz = tri[k + 8] - tri[k + 2]; return [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx]; };
        const nn = nrm(0);
        if (nn[0] * out[0] + nn[1] * out[1] + nn[2] * out[2] > 0) { for (const k of [0, 9]) { const t = tri.slice(k + 3, k + 6); for (let m = 0; m < 3; m++) { tri[k + 3 + m] = tri[k + 6 + m]; tri[k + 6 + m] = t[m]; } } }
        // (fromTriangles takes the normal from c − b × a − b: flip so that it matches the order used there)
        (T[MAT[j]] ??= []).push(...tri);
      }
      // the solid mass to walk into nothing: its layers as the section narrows
      const A = [Math.cos(a) * r, Math.sin(a) * r], B = [Math.cos(b) * r, Math.sin(b) * r];
      for (const [y0, y1, th] of [[0, 1.75, 14], [1.75, 3.5, 11.6], [3.5, 5.25, 8.6], [5.25, 8.4, 5.4]]) col.segment(A, B, th, y0, y1);
      // the battlement: a wall of burnt brick along the outer edge of the top, a merlon every 2.4 m
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), w0 = 1.6, w1 = 2.7;
      const q = [[ca * (r + w0), sa * (r + w0)], [cb * (r + w0), sb * (r + w0)], [cb * (r + w1), sb * (r + w1)], [ca * (r + w1), sa * (r + w1)]];
      const wall = []; for (const [y] of [[7], [8.0]]) for (const [x, z] of q) wall.push([x, y, z]);
      const lo = wall.slice(0, 4), hi = wall.slice(4), tt = [];
      const quad = (p0, p1, p2, p3) => tt.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
      quad(hi[0], hi[3], hi[2], hi[1]); quad(lo[0], lo[1], hi[1], hi[0]); quad(lo[2], lo[3], hi[3], hi[2]); quad(lo[1], lo[2], hi[2], hi[1]); quad(lo[3], lo[0], hi[0], hi[3]);
      bag.add('brick_baked', fromTriangles(orientOutward(tt)));
      for (const k of [0.1, 0.3, 0.5, 0.7, 0.9]) { const am = a + da * k, cx = Math.cos(am) * (r + 2.15), cz = Math.sin(am) * (r + 2.15), t = []; const tx = -Math.sin(am), tz = Math.cos(am), ox = Math.cos(am), oz = Math.sin(am);
        const P4 = [[cx - tx * 0.65 - ox * 0.55, cz - tz * 0.65 - oz * 0.55], [cx + tx * 0.65 - ox * 0.55, cz + tz * 0.65 - oz * 0.55], [cx + tx * 0.65 + ox * 0.55, cz + tz * 0.65 + oz * 0.55], [cx - tx * 0.65 + ox * 0.55, cz - tz * 0.65 + oz * 0.55]];
        const l2 = P4.map(([x, z]) => [x, 8.0, z]), h2 = P4.map(([x, z]) => [x, 8.9, z]);
        const qd = (p0, p1, p2, p3) => t.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
        qd(h2[0], h2[3], h2[2], h2[1]); qd(l2[0], l2[1], h2[1], h2[0]); qd(l2[2], l2[3], h2[3], h2[2]); qd(l2[1], l2[2], h2[2], h2[1]); qd(l2[3], l2[0], h2[0], h2[3]);
        bag.add('brick_baked', fromTriangles(orientOutward(t))); }
    }
    for (const [mat, tri] of Object.entries(T)) bag.add(mat, fromTriangles(tri));
  }
}
