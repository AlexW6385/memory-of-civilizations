// The Pantheon's Corinthian column, close up (docs/buildings/pantheon.md §8c): an Attic base on its plinth (two tori
// parted by a scotia between astragals), the shaft with its entasis and the bead at its neck, and the capital as the
// Roman workshops cut it — a bell hidden under two rows of eight acanthus leaves of five lobes each (the lower row
// facing the axes and the diagonals, the upper row standing in the gaps between them), eight fluted stalks with their
// calyx leaves, the four great corner scrolls (two to a corner, one for each face) and the four pairs of helices under
// the abacus, and on the abacus's middle of each face a flower of eight petals. [stated: the order's parts —
// Vitruvius IV.1, W. L. MacDonald, The Pantheon; the Pantheon's capitals and bases are Pentelic marble, the shafts
// granite — Wikipedia; leaf form, proportions and the counts inferred]
//
// column { at, y, h (plinth to the top of the abacus), d (the shaft's lower diameter), mat, shaftMat, lod }
// lod 2: the portico's, seen from a few metres; lod 1: the forecourt's, seen from afar and in rows.

import { box, lathe, fromTriangles, orientOutward, quad } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { merge } from '../../styles/greek/columns.js';

const TAU = Math.PI * 2;

/** Flip every triangle that faces toward the column's axis (for the leaves, which are shells round it). */
function orientAxis(t) {
  for (let i = 0; i < t.length; i += 9) {
    const ax = t[i], ay = t[i + 1], az = t[i + 2];
    const ux = t[i + 3] - ax, uy = t[i + 4] - ay, uz = t[i + 5] - az;
    const vx = t[i + 6] - ax, vy = t[i + 7] - ay, vz = t[i + 8] - az;
    const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx;
    const mx = (ax + t[i + 3] + t[i + 6]) / 3, mz = (az + t[i + 5] + t[i + 8]) / 3;
    if (nx * mx + nz * mz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
  return t;
}

/** n points of a circular arc (centre radius cr at height cy, radius rr, from angle a0 to a1 in degrees). */
const arc = (cr, cy, rr, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
  return [cr + rr * Math.cos(a), cy + rr * Math.sin(a)];
});

/**
 * One acanthus leaf as a shell standing on the bell: from the bell's surface at its foot it swells outward, then bends
 * its five lobes away from the column at the tip; the lobes are parted by notches that cut down into the leaf, each with
 * a raised midrib.
 */
function leaf(out, o) {
  const { th, half, y0, H, R, S, T, tip, rb, lobes } = o;
  const rows = [];
  for (let j = 0; j <= T; j++) {
    const t = j / T, row = [];
    for (let i = 0; i <= S; i++) {
      const s = -1 + 2 * i / S, p = (s + 1) / 2 * lobes, f = p - Math.floor(p), lobe = Math.abs(Math.sin(Math.PI * Math.min(0.9999, f === 0 && i === S ? 1 : f)));
      const top = (0.8 + 0.2 * Math.pow(lobe, 0.6)) * (1 - 0.1 * Math.abs(s));
      const y = y0 + t * top * H;
      const edge = 1 - 0.92 * Math.pow(Math.abs(s), 3);
      const off = R * (0.008 + tip * Math.pow(t, 1.8) * (0.55 + 0.45 * lobe)) * edge + R * 0.05 * lobe * Math.sin(Math.PI * Math.min(1, t * 1.15)) * edge;
      const r = rb(y) + off, a = th + s * half;
      row.push([r * Math.cos(a), y, r * Math.sin(a)]);
    }
    rows.push(row);
  }
  for (let j = 0; j < T; j++) for (let i = 0; i < S; i++) {
    const a = rows[j][i], b = rows[j][i + 1], c = rows[j + 1][i + 1], d = rows[j + 1][i];
    out.push(...a, ...b, ...c, ...a, ...c, ...d);
  }
}

/** A scroll (volute or helix): a ribbon winding inward in the plane of a face. Frame: n outward, u along, y up. */
function scroll(out, o) {
  const { psi, n, u, y, ro, dir, w0, dep, N, turns } = o;
  const nx = Math.cos(psi), nz = Math.sin(psi), ux = -nz, uz = nx;
  const W = (uu, yy, nn) => [nx * nn + ux * uu, yy, nz * nn + uz * uu];
  const ring = [];
  for (let i = 0; i <= N; i++) {
    const tau = i / N, phi = -Math.PI / 2 + dir * tau * turns * TAU, r = ro * Math.pow(0.22, tau), w = w0 * (1 - 0.55 * tau);
    const c = [u + r * Math.cos(phi), y + r * Math.sin(phi)], rr = [Math.cos(phi), Math.sin(phi)];
    ring.push([[c[0] + rr[0] * w / 2, c[1] + rr[1] * w / 2], [c[0] - rr[0] * w / 2, c[1] - rr[1] * w / 2]]);
  }
  const d2 = dep / 2;
  for (let i = 0; i < N; i++) {
    const [o0, i0] = ring[i], [o1, i1] = ring[i + 1];
    const q = (A, B, C, D, out2) => { const t = []; quad(t, A, B, C, D); flipTo(t, out2, 0); out.push(...t); };
    const mid = [(o0[0] + i0[0] + o1[0] + i1[0]) / 4, (o0[1] + i0[1] + o1[1] + i1[1]) / 4];
    const cen = W(mid[0], mid[1], n);
    q(W(o0[0], o0[1], n + d2), W(o1[0], o1[1], n + d2), W(i1[0], i1[1], n + d2), W(i0[0], i0[1], n + d2), cen);   // the face
    q(W(o0[0], o0[1], n - d2), W(o1[0], o1[1], n - d2), W(o1[0], o1[1], n + d2), W(o0[0], o0[1], n + d2), cen);   // the outer edge
    q(W(i0[0], i0[1], n + d2), W(i1[0], i1[1], n + d2), W(i1[0], i1[1], n - d2), W(i0[0], i0[1], n - d2), cen);   // the inner edge
  }
}
/** Flip a quad's two triangles (given as a flat list) so that they face away from the point c. */
function flipTo(t, c, _) {
  const m = [0, 0, 0];
  for (let k = 0; k < t.length; k += 3) { m[0] += t[k]; m[1] += t[k + 1]; m[2] += t[k + 2]; }
  const q = t.length / 3; m[0] /= q; m[1] /= q; m[2] /= q;
  for (let i = 0; i < t.length; i += 9) {
    const ax = t[i], ay = t[i + 1], az = t[i + 2];
    const ux = t[i + 3] - ax, uy = t[i + 4] - ay, uz = t[i + 5] - az, vx = t[i + 6] - ax, vy = t[i + 7] - ay, vz = t[i + 8] - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    // the normal must point away from the spiral's own centre line c (the ribbon's middle), using the quad's offset from it
    void m;
    const tx = (ax + t[i + 3] + t[i + 6]) / 3 - c[0], ty = (ay + t[i + 4] + t[i + 7]) / 3 - c[1], tz = (az + t[i + 5] + t[i + 8]) / 3 - c[2];
    if (nx * tx + ny * ty + nz * tz < 0) for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; }
  }
}

/** A Corinthian column of the Pantheon's pattern. */
export function pantheonColumn(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.h, R = el.d / 2, lod = el.lod ?? 2;
  const mat = el.mat || 'marble', shaftMat = el.shaftMat || mat;
  const hi = lod >= 2;
  const plH = R * 0.5, bH = R * 0.65, capH = R * 2.3;
  const shaftH = H - plH - bH - capH;
  const seg = hi ? 40 : 18;
  const parts = [], shaft = [];

  // the plinth and the Attic base
  parts.push(box(-R * 1.42, 0, -R * 1.42, R * 1.42, plH, R * 1.42));
  if (hi) parts.push(box(-R * 1.36, plH, -R * 1.36, R * 1.36, plH + 0.012, R * 1.36));
  const bp = [[R * 1.2, 0]];
  const A = (pts) => { for (const p of pts) bp.push([p[0] * R, p[1] * R]); };
  A(arc(1.16, 0.1, 0.1, -90, 90, hi ? 5 : 2));                       // the lower torus
  bp.push([R * 1.16, R * 0.23]);                                        // a fillet
  A([[1.1, 0.25], [1.05, 0.29], [1.03, 0.31], [1.05, 0.33], [1.1, 0.36]]);   // the scotia
  A(arc(1.1, 0.395, 0.035, -90, 90, hi ? 3 : 1));                        // an astragal
  A(arc(1.04, 0.505, 0.075, -90, 90, hi ? 4 : 2));                       // the upper torus
  bp.push([R * 1.06, R * 0.60], [R * 1.04, R * 0.62], [R * 1.0, R * 0.65]);  // fillet and apophyge
  bp[0] = [R * 1.2, 0];
  parts.push(lathe(bp.map(([r, h]) => [r, h]), seg, null, 0, plH, 0));

  // the shaft: entasis, the bead (astragal) and fillet at the neck
  const top = R * 0.86, sy0 = plH + bH;
  const prof = [[R * 1.0, 0]];
  const N = hi ? 9 : 4;
  for (let i = 1; i <= N; i++) { const t = i / N; prof.push([R - (R - top) * (t < 0.3 ? 0.35 * t / 0.3 * 0.3 : 0.105 + 0.895 * Math.pow((t - 0.3) / 0.7, 1.35)), shaftH * t - R * 0.2 * t]); }
  prof.pop();
  const sTop = shaftH - R * 0.2;
  prof.push([top * 1.0, sTop]);
  const neck = [[top * 1.02, shaftH - R * 0.17], [top * 1.08, shaftH - R * 0.15], [top * 1.1, shaftH - R * 0.12], [top * 1.08, shaftH - R * 0.09], [top * 1.02, shaftH - R * 0.07], [top * 1.02, shaftH]];
  for (const p of neck) prof.push(p);
  shaft.push(lathe(prof, seg, null, 0, sy0, 0));

  // the capital: the bell
  const c0 = sy0 + shaftH, abH = capH * 0.14, abY0 = capH - abH;
  const rtop = R * 1.2, bellTop = capH * 0.84;
  const rb = (yy) => top * 1.02 + (rtop - top * 1.02) * Math.pow(Math.max(0, Math.min(1, yy / bellTop)), 1.7);
  const bell = [];
  for (let i = 0; i <= 8; i++) { const yy = bellTop * i / 8; bell.push([rb(yy), yy]); }
  bell.push([rb(bellTop) * 1.03, bellTop * 1.02], [0, bellTop * 1.02]);
  parts.push(lathe(bell, hi ? 36 : 16, null, 0, c0, 0));

  // the two rows of eight acanthus leaves (the lower row at 0°, 45°, …; the upper in the gaps)
  const lt = [];
  const LS = hi ? 15 : 8, LT = hi ? 4 : 2;
  for (let k = 0; k < 8; k++) {
    leaf(lt, { th: k * Math.PI / 4, half: 0.395, y0: 0.02 * capH, H: 0.36 * capH, R, S: LS, T: LT, tip: 0.38, rb, lobes: 5 });
    leaf(lt, { th: k * Math.PI / 4 + Math.PI / 8, half: 0.37, y0: 0.31 * capH, H: 0.33 * capH, R, S: LS, T: LT, tip: 0.34, rb, lobes: 5 });
  }
  const leaves = fromTriangles(orientAxis(lt));
  leaves.translate(0, c0, 0);
  parts.push(leaves);

  // the fluted stalks (caulicoli) between the upper leaves, each in its calyx; the scrolls
  const yStalk0 = 0.46 * capH, yStalk1 = 0.69 * capH;
  const sc = [];
  for (let k = 0; k < 8; k += (hi ? 1 : 2)) {
    const th = k * Math.PI / 4, corner = k % 2 === 1;
    const r0 = rb(yStalk0) + R * 0.1, r1 = (corner ? rb(yStalk1) + R * 0.2 : rb(yStalk1) + R * 0.1);
    const cx = Math.cos(th), cz = Math.sin(th);
    // a leaning column of eight flutes: built as a lathe on the stalk's axis, then sheared outward
    const sr = R * (hi ? 0.1 : 0.12);
    const st = lathe([[sr * 1.1, 0], [sr, 0.07 * capH], [sr * 0.85, (yStalk1 - yStalk0) * 0.8], [sr * 1.6, (yStalk1 - yStalk0) * 0.9], [sr * 1.3, yStalk1 - yStalk0 + 0.03 * capH], [0.001, yStalk1 - yStalk0 + 0.035 * capH]], hi ? 8 : 6, null, 0, 0, 0);
    const m = new Matrix4().set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    // shear: x offset grows from r0 to r1 along the height
    const dr = (r1 - r0) / (yStalk1 - yStalk0);
    const pa = st.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const yy = pa.getY(i), rr = r0 + dr * yy;
      pa.setX(i, pa.getX(i) + rr * cx); pa.setZ(i, pa.getZ(i) + rr * cz); pa.setY(i, yy + yStalk0 + c0);
    }
    void m;
    parts.push(st);
  }
  if (hi) {
    // scrolls: the four corner pairs and the four pairs of helices
    for (let k = 0; k < 4; k++) {
      const psi = k * Math.PI / 2;
      const base = { psi, y: c0 + abY0 - R * 0.36, ro: R * 0.36, w0: R * 0.17, dep: R * 0.2, N: 10, turns: 1.15 };
      for (const s of [-1, 1]) {
        scroll(sc, { ...base, n: R * 1.12, u: s * R * 1.12, dir: s });
        scroll(sc, { ...base, n: R * 1.04, u: s * R * 0.3, y: c0 + abY0 - R * 0.25, ro: R * 0.25, w0: R * 0.12, dep: R * 0.16, dir: -s, N: 9, turns: 1.2 });
      }
    }
    parts.push(fromTriangles(sc));
  }

  // the abacus: a square with concave sides and a moulded lower edge (an ovolo), the flower on each face
  const aw = R * 1.5, n = hi ? 10 : 4, abY0w = c0 + abY0, abY1w = c0 + capH;
  const abT = [];
  const pt = (i) => {
    const side = Math.floor(i / n), t = (i % n) / n;
    const corners = [[1, 1], [-1, 1], [-1, -1], [1, -1]];
    const [ax, az] = corners[side], [bx, bz] = corners[(side + 1) % 4];
    const sag = 0.16 * Math.sin(Math.PI * t);
    let px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
    px -= Math.sign(px) * (Math.abs(ax - bx) < 1e-6 ? sag : 0);
    pz -= Math.sign(pz) * (Math.abs(az - bz) < 1e-6 ? sag : 0);
    return [px * aw, pz * aw];
  };
  const ring = Array.from({ length: n * 4 }, (_, i) => pt(i));
  const mid = abY0w + abH * 0.62;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i], q = ring[(i + 1) % ring.length], k = 0.93;
    quad(abT, [p[0] * k, abY0w, p[1] * k], [q[0] * k, abY0w, q[1] * k], [q[0] * k, mid, q[1] * k], [p[0] * k, mid, p[1] * k]);     // the lower, set-back part
    quad(abT, [p[0] * k, mid, p[1] * k], [q[0] * k, mid, q[1] * k], [q[0], mid, q[1]], [p[0], mid, p[1]]);                 // its ledge
    quad(abT, [p[0], mid, p[1]], [q[0], mid, q[1]], [q[0], abY1w, q[1]], [p[0], abY1w, p[1]]);                          // the face
    abT.push(0, abY1w, 0, q[0], abY1w, q[1], p[0], abY1w, p[1]);
    abT.push(0, abY0w, 0, p[0] * k, abY0w, p[1] * k, q[0] * k, abY0w, q[1] * k);
  }
  parts.push(fromTriangles(orientOutward(abT)));
  if (hi) {
    // the flower: eight petals round a boss, on the middle of each abacus face
    const fl = [];
    for (let k = 0; k < 4; k++) {
      const psi = k * Math.PI / 2, nx = Math.cos(psi), nz = Math.sin(psi), ux = -nz, uz = nx;
      const fr = aw * 0.84 + 0.004, fy = (mid + abY1w) / 2 - 0.004, pr = abH * 0.27;
      const P = (uu, yy, nn) => [nx * (fr + nn) + ux * uu, yy, nz * (fr + nn) + uz * uu];
      for (let p = 0; p < 8; p++) {
        const a = p * Math.PI / 4, ca = Math.cos(a), sa = Math.sin(a);
        const cc = (l, wd, nn) => [P(ca * l - sa * wd, fy + sa * l + ca * wd, nn)];
        // a petal: a lozenge from the boss out to pr, 0.035 proud
        const q0 = P(ca * pr * 0.25, fy + sa * pr * 0.25, 0), q1 = P(ca * pr * 0.6 - sa * pr * 0.2, fy + sa * pr * 0.6 + ca * pr * 0.2, 0.03), q2 = P(ca * pr, fy + sa * pr, 0.012), q3 = P(ca * pr * 0.6 + sa * pr * 0.2, fy + sa * pr * 0.6 - ca * pr * 0.2, 0.03);
        void cc;
        const b0 = P(ca * pr * 0.25, fy + sa * pr * 0.25, -0.01), b1 = P(ca * pr * 0.6 - sa * pr * 0.2, fy + sa * pr * 0.6 + ca * pr * 0.2, -0.01), b2 = P(ca * pr, fy + sa * pr, -0.01), b3 = P(ca * pr * 0.6 + sa * pr * 0.2, fy + sa * pr * 0.6 - ca * pr * 0.2, -0.01);
        const tt = [];
        quad(tt, q0, q1, q2, q3);
        for (const [a2, b2_, c2, d2] of [[b0, b1, q1, q0], [b1, b2, q2, q1], [b2, b3, q3, q2], [b3, b0, q0, q3]]) quad(tt, a2, b2_, c2, d2);
        const ctr = P(0, fy, -0.2);
        flipTo(tt, ctr, 0);
        fl.push(...tt);
      }
      const boss = P(0, fy, 0.02);
      const bq = [];
      for (let p = 0; p < 6; p++) {
        const a0 = p * TAU / 6, a1 = (p + 1) * TAU / 6, r = pr * 0.2;
        bq.push(...boss, ...P(Math.cos(a1) * r, fy + Math.sin(a1) * r, 0.0), ...P(Math.cos(a0) * r, fy + Math.sin(a0) * r, 0.0));
      }
      flipTo(bq, P(0, fy, -0.2), 0);
      fl.push(...bq);
    }
    parts.push(fromTriangles(fl));
  }

  const m = new Matrix4().makeTranslation(x, y, z);
  const g = merge(parts); g.applyMatrix4(m); bag.add(mat, g);
  const s = merge(shaft); s.applyMatrix4(m); bag.add(shaftMat, s);
  col.circle(x, z, R * 1.08, y, y + H);
}
