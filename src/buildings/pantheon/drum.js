// The rotunda seen from outside (docs/buildings/pantheon.md §8f): the drum's two upper zones as brickwork with the
// relieving arches of the structure showing — in the second zone sixteen great round arches over the eight piers and
// niches, in the third sixteen smaller ones standing between them — each arch a ring of voussoirs (alternately proud)
// over jamb quoins, standing out from a plastered skin; and the three cornices that part the zones, swept round the
// drum as a moulded profile (cyma, dentils, corona with modillions, cymatium). [stated: brick-faced drum with relieving
// arches, three zones divided by cornices, 30.4 m high — archeoroma/Wikipedia (dossier §4, §5); the arches' count, span
// and rise, the plastered skin and the cornice profile inferred]
//
// drum_exterior { c, RO (outer radius), y0 (foot of zone 2), zones: [y1, y2, y3] (tops of the cornices), gap: half-angle in degrees
// of the portico side left bare (bearing 0), mat, fieldMat, trimMat }

import { fromTriangles, quad } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

const D2R = Math.PI / 180;

/** Make each triangle face the way `dir(centroid)` says (a vector). */
function faceTo(t, dir) {
  for (let i = 0; i < t.length; i += 9) {
    const ax = t[i], ay = t[i + 1], az = t[i + 2];
    const ux = t[i + 3] - ax, uy = t[i + 4] - ay, uz = t[i + 5] - az, vx = t[i + 6] - ax, vy = t[i + 7] - ay, vz = t[i + 8] - az;
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    const d = dir((ax + t[i + 3] + t[i + 6]) / 3, (ay + t[i + 4] + t[i + 7]) / 3, (az + t[i + 5] + t[i + 8]) / 3, i);
    if (n[0] * d[0] + n[1] * d[1] + n[2] * d[2] < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
}

export function drumExterior(el, { bag }) {
  const [cx, cz] = el.c, RO = el.RO, y0 = el.y0, [yc1, yc2, yc3] = el.zones, gap = (el.gap ?? 33) * D2R;
  const field = [], trim = [];
  const ang = (bearing) => (bearing - 90) * D2R;
  const inGap = (a) => { let b = ((a / D2R + 90) % 360 + 360) % 360; if (b > 180) b -= 360; return Math.abs(b) < gap / D2R; };

  // ── the brick skin of the two upper zones: an arc of a shell, with its top ledge hidden under the cornice
  const skinFrom = (ya, yb) => {
    const NS = 180;
    for (let i = 0; i < NS; i++) {
      const a = -Math.PI + 2 * Math.PI * i / NS, b = -Math.PI + 2 * Math.PI * (i + 1) / NS;
      if (inGap((a + b) / 2)) continue;
      const P = (r, th, y) => [cx + Math.cos(th) * r, y, cz + Math.sin(th) * r];
      quad(field, P(RO + 0.1, a, ya), P(RO + 0.1, a, yb), P(RO + 0.1, b, yb), P(RO + 0.1, b, ya));
    }
  };
  skinFrom(yc1, yc3 - 0.9);

  // ── the arches: (u along the wall in metres, y) → world at depth d
  const arch = (bearing, span, spring, depthTop) => {
    const a0 = ang(bearing), Rr = RO + 0.1;
    const W = (u, y, d) => { const th = a0 + u / Rr; return [cx + Math.cos(th) * (Rr + d), y, cz + Math.sin(th) * (Rr + d)]; };
    const r = span / 2, base = depthTop.base;
    // jamb quoins: alternating long and short blocks up each side; the voussoir ring; a keystone
    const bw = 0.62;
    for (const s of [-1, 1]) {
      let y = base, k = 0;
      while (y < spring - 0.05) {
        const hh = Math.min(0.46 + (k % 2) * 0.04, spring - y), proj = 0.16 + (k % 2) * 0.05;
        const u0 = s * (r - 0.02), u1 = s * (r + bw + (k % 2 ? 0.14 : 0));
        hexa(trim, [W(u0, y + 0.01, 0), W(u1, y + 0.01, 0), W(u1, y + 0.01, proj), W(u0, y + 0.01, proj)], [W(u0, y + hh - 0.01, 0), W(u1, y + hh - 0.01, 0), W(u1, y + hh - 0.01, proj), W(u0, y + hh - 0.01, proj)]);
        y += hh; k++;
      }
    }
    const NV = 13;
    for (let i = 0; i < NV; i++) {
      const t0 = Math.PI * i / NV, t1 = Math.PI * (i + 1) / NV;
      const ri = r - 0.02, ro = r + bw + (i % 2 ? 0.1 : 0), proj = 0.16 + (i % 2) * 0.05 + (i === (NV - 1) / 2 ? 0.07 : 0);
      const P = (rad, t, d) => W(-rad * Math.cos(t), spring + rad * Math.sin(t), d);
      const g = 0.012;                                   // a joint between voussoirs
      hexa(trim, [P(ri, t0 + g, 0), P(ro, t0 + g, 0), P(ro, t1 - g, 0), P(ri, t1 - g, 0)], [P(ri, t0 + g, proj), P(ro, t0 + g, proj), P(ro, t1 - g, proj), P(ri, t1 - g, proj)]);
    }
  };
  const nArch = (zoneBase, zoneTop, count, offset, span, springAbove, top) => {
    for (let k = 0; k < count; k++) {
      const b = offset + k * 360 / count;
      if (inGap(ang(b))) continue;
      arch(b, span, zoneBase + springAbove, { base: zoneBase + 0.35 });
    }
    void zoneTop; void top;
  };
  nArch(yc1, yc2 - 0.9, 16, 0, 8.0, 3.4);
  nArch(yc2, yc3 - 0.9, 16, 11.25, 5.6, 2.6);

  // ── the cornices: a profile swept round the drum, dentils and (above) modillions on it
  const prof = [[-0.1, -0.92], [0.08, -0.92], [0.1, -0.84], [0.2, -0.82], [0.27, -0.74], [0.29, -0.66], [0.3, -0.58], [0.3, -0.5], [0.42, -0.5], [0.44, -0.42], [0.58, -0.4], [0.6, -0.14], [0.54, -0.12], [0.5, -0.05], [0.4, 0], [-0.1, 0]];
  const NS = 150, cor = [], dent = [];
  for (const yt of [yc1, yc2, yc3]) {
    for (let i = 0; i < NS; i++) {
      const a = -Math.PI + 2 * Math.PI * i / NS, b = -Math.PI + 2 * Math.PI * (i + 1) / NS;
      if (inGap((a + b) / 2)) continue;
      const P = (p, th) => [cx + Math.cos(th) * (RO + p[0]), yt + p[1], cz + Math.sin(th) * (RO + p[0])];
      for (let j = 0; j < prof.length; j++) {
        const p = prof[j], q = prof[(j + 1) % prof.length];
        const t = [];
        quad(t, P(p, a), P(q, a), P(q, b), P(p, b));
        const ex = q[0] - p[0], ey = q[1] - p[1];     // for this loop the outward normal is (ey, −ex) in (dr, dy) when the loop turns counter-clockwise
        faceTo(t, (x, y, z) => { const rx = x - cx, rz = z - cz, L = Math.hypot(rx, rz) || 1; return [rx / L * (-ey), ex, rz / L * (-ey)]; });
        cor.push(...t);
      }
    }
    // dentils under the corona
    const step = 0.4;
    const nD = Math.floor(2 * Math.PI * RO / step);
    for (let i = 0; i < nD; i++) {
      const th = -Math.PI + 2 * Math.PI * (i + 0.5) / nD;
      if (inGap(th)) continue;
      const tx = -Math.sin(th), tz = Math.cos(th), rx = Math.cos(th), rz = Math.sin(th);
      const B = (hu, r0, r1, ya, yb) => hexa(dent, [[cx + rx * (RO + r0) - tx * hu, yt + ya, cz + rz * (RO + r0) - tz * hu], [cx + rx * (RO + r1) - tx * hu, yt + ya, cz + rz * (RO + r1) - tz * hu], [cx + rx * (RO + r1) + tx * hu, yt + ya, cz + rz * (RO + r1) + tz * hu], [cx + rx * (RO + r0) + tx * hu, yt + ya, cz + rz * (RO + r0) + tz * hu]],
        [[cx + rx * (RO + r0) - tx * hu, yt + yb, cz + rz * (RO + r0) - tz * hu], [cx + rx * (RO + r1) - tx * hu, yt + yb, cz + rz * (RO + r1) - tz * hu], [cx + rx * (RO + r1) + tx * hu, yt + yb, cz + rz * (RO + r1) + tz * hu], [cx + rx * (RO + r0) + tx * hu, yt + yb, cz + rz * (RO + r0) + tz * hu]]);
      B(0.09, 0.3, 0.4, -0.64, -0.51);
    }
  }
  bag.add(el.fieldMat || 'dome_stucco', fromTriangles(field));
  bag.add(el.trimMat || 'marble', fromTriangles(cor));
  bag.add(el.trimMat || 'marble', fromTriangles(dent));
  // the voussoirs and quoins: buff brick (the palette's giallo, a material already in every cell of the rotunda)
  bag.add(el.mat || 'giallo', fromTriangles(trim));
}
