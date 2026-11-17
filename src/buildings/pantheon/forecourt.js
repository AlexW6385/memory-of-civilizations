// The forecourt's north gate (docs/buildings/pantheon.md §10): a round-arched gateway through the portico's back wall, on the
// axis, framed as the Romans framed a city gate — the piers faced in marble up to impost blocks, a ring of voussoirs with a
// keystone on each face, spandrels filling the wall's opening round the curve, and a coffered soffit down the thickness of
// the wall. The columns, entablature and pediment over it are separate elements of the plan. [inferred: the dossier has the
// porticoes' gateway only as a gap; the form after Roman gateways such as the Porta Marzia at Perugia]
//
// gate_arch { at [x, z] (the wall's centre line), th (the wall's thickness), r (the clear half-span), spring (its springing
// height), top (the top of the wall's opening: the spandrels fill up to it), bw (the voussoir ring's width) }

import { fromTriangles, quad } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

function faceTo(t, dir) {
  for (let i = 0; i < t.length; i += 9) {
    const ax = t[i], ay = t[i + 1], az = t[i + 2];
    const ux = t[i + 3] - ax, uy = t[i + 4] - ay, uz = t[i + 5] - az, vx = t[i + 6] - ax, vy = t[i + 7] - ay, vz = t[i + 8] - az;
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    const d = dir((ax + t[i + 3] + t[i + 6]) / 3, (ay + t[i + 4] + t[i + 7]) / 3, (az + t[i + 5] + t[i + 8]) / 3);
    if (n[0] * d[0] + n[1] * d[1] + n[2] * d[2] < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
}

export function gateArch(el, { bag }) {
  const [x, z] = el.at, th = el.th ?? 1.0, r = el.r, sp = el.spring, top = el.top, bw = el.bw ?? 0.6;
  const zn = z - th / 2, zs = z + th / 2;                      // north and south faces; the court is to the south
  const st = [], tr = [], co = [];
  const arcY = (u) => sp + Math.sqrt(Math.max(0, r * r - u * u));
  // spandrels between the curve and the top of the opening, on both faces, and the soffit between them
  const NF = 28;
  for (let i = 0; i < NF; i++) {
    const u0 = -r + 2 * r * i / NF, u1 = -r + 2 * r * (i + 1) / NF;
    for (const [zz, dz] of [[zs, 1], [zn, -1]]) {
      const t = [];
      quad(t, [x + u0, arcY(u0), zz], [x + u1, arcY(u1), zz], [x + u1, top, zz], [x + u0, top, zz]);
      faceTo(t, () => [0, 0, dz]);
      st.push(...t);
    }
    const s = [];
    quad(s, [x + u0, arcY(u0), zn], [x + u1, arcY(u1), zn], [x + u1, arcY(u1), zs], [x + u0, arcY(u0), zs]);
    faceTo(s, (px, py) => [x - px, sp - py, 0]);           // the soffit faces into the passage
    st.push(...s);
  }
  // the soffit's coffers: three rows of square coffers, each a frame standing a little proud of the vault
  const rows = 3, cw = th / rows;
  for (let k = 0; k < 9; k++) {
    const a0 = Math.PI * (k + 0.14) / 9, a1 = Math.PI * (k + 0.86) / 9;
    for (let rI = 0; rI < rows; rI++) {
      const z0 = zn + rI * cw + cw * 0.14, z1 = zn + (rI + 1) * cw - cw * 0.14, ri = r - 0.06;
      const P = (a, zz) => [x - ri * Math.cos(a), sp + ri * Math.sin(a), zz];
      const t = [];
      quad(t, P(a0, z0), P(a1, z0), P(a1, z1), P(a0, z1));
      faceTo(t, (px, py) => [x - px, sp - py, 0]);
      co.push(...t);
    }
  }
  // the voussoir rings on each face with their keystones, the impost blocks, the jamb facings
  const NV = 11;
  for (const [zz, dz] of [[zs, 1], [zn, -1]]) {
    for (let i = 0; i < NV; i++) {
      const t0 = Math.PI * i / NV, t1 = Math.PI * (i + 1) / NV, key = i === (NV - 1) / 2;
      const ri = r - 0.03, ro = r + bw + (key ? 0.32 : 0), pj = 0.14 + (key ? 0.1 : (i % 2) * 0.03), g = 0.012;
      const P = (rad, t, d) => [x - rad * Math.cos(t), sp + rad * Math.sin(t), zz + dz * d];
      hexa(tr, [P(ri, t0 + g, 0), P(ro, t0 + g, 0), P(ro, t1 - g, 0), P(ri, t1 - g, 0)], [P(ri, t0 + g, pj), P(ro, t0 + g, pj), P(ro, t1 - g, pj), P(ri, t1 - g, pj)]);
    }
    for (const s of [-1, 1]) {
      const u0 = s * (r - 0.04), u1 = s * (r + bw + 0.45);
      const B = (ua, ub, ya, yb, d) => hexa(tr, [[x + ua, ya, zz], [x + ub, ya, zz], [x + ub, ya, zz + dz * d], [x + ua, ya, zz + dz * d]], [[x + ua, yb, zz], [x + ub, yb, zz], [x + ub, yb, zz + dz * d], [x + ua, yb, zz + dz * d]]);
      B(u0, u1, sp - 0.42, sp - 0.06, 0.24);                // the impost block
      B(u0, u1 + s * 0.06, sp - 0.06, sp + 0.08, 0.3);      // its cap moulding
      // the jamb: courses of ashlar up the pier below the impost, alternately long and short
      let y = 0, k = 0;
      while (y < sp - 0.42) {
        const hh = Math.min(0.62, sp - 0.42 - y), long = k % 2 === 0;
        B(s * (r - 0.03), s * (r + (long ? 1.2 : 0.8)), y + 0.012, y + hh - 0.012, 0.1);
        y += hh; k++;
      }
    }
  }
  bag.add('marble', fromTriangles(st));
  bag.add('marble', fromTriangles(tr));
  bag.add('marble', fromTriangles(co));
}
