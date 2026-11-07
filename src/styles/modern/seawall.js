// The harbour's sea wall (docs/settlements/sydney.md §6): the hand-hewn sandstone wall round Sydney Cove
// (Circular Quay, begun 1841), round Farm Cove from the Opera House to Mrs Macquarie's Point (the "thirty
// year wall", 1848–1879) and along the foreshores — a vertical face of coursed blocks from below the water to
// the land's level, the band the tide wets dark and green, a coping of dressed slabs with a rounded nose, the
// joints between the coping stones, and at intervals iron mooring rings let into the face.

import { fromTriangles, rod, lathe } from '../../core/geom.js';

const quad = (T, a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
/** sea_wall: { pts: [[x, z]] (the face line), n: [[nx, nz]] (landward, mitred), top: [y] (the land behind), base, level (the water) } */
export function seaWall(el, { bag }) {
  const P = el.pts, N = el.n, Y = el.top, base = el.base ?? -7.4, lv = el.level ?? -2.4, back = 2.1, nose = 0.07, ct = 0.3;
  const face = [], wet = [], cope = [], joint = [];
  // the face's side toward the water: its normal is -n
  const at = (i, off, y) => [P[i][0] - N[i][0] * off, y, P[i][1] - N[i][1] * off];
  const cum = [0];
  for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  for (let i = 0; i + 1 < P.length; i++) {
    const j = i + 1, t0 = Y[i], t1 = Y[j];
    // the face (wound to face the water), from the bed under the water to the coping's underside
    quad(face, at(i, 0, base), at(i, 0, t0 - ct + 0.01), at(j, 0, t1 - ct + 0.01), at(j, 0, base));
    // the tidal band: weed and wet stone a hand's breadth proud of the face, uneven along the wall
    const w0 = lv + 0.55 + 0.18 * Math.sin(cum[i] * 0.37), w1 = lv + 0.55 + 0.18 * Math.sin(cum[j] * 0.37);
    quad(wet, at(i, 0.015, lv - 0.5), at(i, 0.015, w0), at(j, 0.015, w1), at(j, 0.015, lv - 0.5));
    // the coping: the slab's top from the nose back to the land, its front, and the nose's underside
    const fi = (k, y) => at(k, nose, y), bi = (k, y) => [P[k][0] + N[k][0] * back, y, P[k][1] + N[k][1] * back];
    const ti = (k) => at(k, nose - 0.03, Y[k] + 0.04);
    quad(cope, ti(i), bi(i, Y[i] + 0.04), bi(j, Y[j] + 0.04), ti(j));                                     // the top
    quad(cope, fi(i, Y[i] - 0.03), ti(i), ti(j), fi(j, Y[j] - 0.03));                                    // the worn arris
    quad(cope, fi(i, Y[i] - ct), fi(i, Y[i] - 0.03), fi(j, Y[j] - 0.03), fi(j, Y[j] - ct));               // the front
    quad(cope, at(i, 0, Y[i] - ct), fi(i, Y[i] - ct), fi(j, Y[j] - ct), at(j, 0, Y[j] - ct));             // under the nose
  }
  // the joints between the coping stones (every 1.4 m along the wall): a dark line across the slab's top and front
  for (let s = 0.7; s < cum[cum.length - 1]; s += 1.4) {
    let i = 0; while (i < cum.length - 2 && cum[i + 1] < s) i++;
    const f = (s - cum[i]) / ((cum[i + 1] - cum[i]) || 1), x = P[i][0] + (P[i + 1][0] - P[i][0]) * f, z = P[i][1] + (P[i + 1][1] - P[i][1]) * f;
    const nx = N[i][0], nz = N[i][1], y = Y[i] + (Y[i + 1] - Y[i]) * f, tx = -nz * 0.012, tz = nx * 0.012;
    const a = [x - nx * (nose + 0.004), y + 0.045, z - nz * (nose + 0.004)], b = [x + nx * back, y + 0.045, z + nz * back];
    const a2 = [x - nx * (nose - 0.03), y + 0.045, z - nz * (nose - 0.03)];
    quad(joint, [a2[0] + tx, a2[1], a2[2] + tz], [b[0] + tx, b[1], b[2] + tz], [b[0] - tx, b[1], b[2] - tz], [a2[0] - tx, a2[1], a2[2] - tz]);
    quad(joint, [a[0] + tx, y - ct, a[2] + tz], [a[0] + tx, y - 0.025, a[2] + tz], [a[0] - tx, y - 0.025, a[2] - tz], [a[0] - tx, y - ct, a[2] - tz]);
  }
  bag.add('sandstone', fromTriangles(face));
  bag.add('sandstone_green', fromTriangles(wet));
  bag.add('sandstone_dressed', fromTriangles(cope));
  bag.add('pottery_dark', fromTriangles(joint));
  // iron mooring rings let into the face every ~24 m where the wall stands well clear of the water
  for (let s = 9; s < cum[cum.length - 1]; s += 24) {
    let i = 0; while (i < cum.length - 2 && cum[i + 1] < s) i++;
    const f = (s - cum[i]) / ((cum[i + 1] - cum[i]) || 1), x = P[i][0] + (P[i + 1][0] - P[i][0]) * f, z = P[i][1] + (P[i + 1][1] - P[i][1]) * f;
    const y = Y[i] + (Y[i + 1] - Y[i]) * f - 0.75, nx = N[i][0], nz = N[i][1];
    if (y < lv + 1.2) continue;
    bag.add('iron', rod([x + nx * 0.05, y + 0.12, z + nz * 0.05], [x - nx * 0.06, y + 0.12, z - nz * 0.06], 0.035, 5));                        // the eye bolt
    const tx = -nz, tz = nx, R = 0.13, pts = [];
    for (let k = 0; k <= 12; k++) { const a = k / 12 * Math.PI * 2; pts.push([x - nx * 0.08 + tx * Math.sin(a) * R, y + Math.cos(a) * R, z - nz * 0.08 + tz * Math.sin(a) * R]); }
    for (let k = 0; k < 12; k++) bag.add('iron', rod(pts[k], pts[k + 1], 0.016, 4));                                                        // the ring hanging from it
    bag.add('iron', lathe([[0.07, 0], [0.07, 0.02], [0.001, 0.02]], 8, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(Math.atan2(-nx, -nz)).translate(x - nx * 0.005, y + 0.12, z - nz * 0.005));
  }
}
