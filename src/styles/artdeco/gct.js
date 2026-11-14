// Grand Central Terminal's front on 42nd Street, as in 1931 (docs/settlements/new-york.md §1c): granite at street
// level and limestone above; the three great arched windows between paired columns; the entablature, the
// cornice and the attic; the statuary group about the great clock — Mercury between Hercules and Minerva, some
// 15 m high, the clock 4 m across; the elevated roadway along the front, carried over 42nd and 41st Streets
// to Park Avenue by the viaduct of 1919.

import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { concourse } from './concourse.js';

const LS = 'limestone', GR = 'granite_grey';
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };

/** A seated or reclining figure's mass, roughly: a torso, a head, limbs; all in limestone (the group is seen from the street, 40 m below). */
function figure(bag, x, y, z, s, pose, facing = 1) {
  const P = (dx, dy, dz) => [x + dx * s * facing, y + dy * s, z + dz * s], S = (pr) => pr.map(([r, hh]) => [r * s, hh * s]);
  if (pose === 'stand') {                                    // Mercury: standing, one arm raised, the winged hat
    bag.add(LS, lathe(S([[0.32, 0], [0.4, 0.9], [0.36, 1.6], [0.48, 2.3], [0.44, 2.9], [0.2, 3.1], [0.001, 3.12]]), 10, null, x, y, z));
    bag.add(LS, lathe(S([[0.001, 0], [0.22, 0.05], [0.25, 0.3], [0.2, 0.55], [0.001, 0.6]]), 10, null, x, y + 3.05 * s, z));
    bag.add(LS, rod(P(0.45, 2.7, 0), P(1.1, 3.9, 0.2), 0.13 * s, 6));
    bag.add(LS, rod(P(-0.45, 2.7, 0), P(-0.9, 1.8, 0.3), 0.13 * s, 6));
    for (const sg of [-1, 1]) bag.add(LS, fromTriangles(both([...P(sg * 0.18, 3.55, 0), ...P(sg * 0.55, 3.9, -0.05), ...P(sg * 0.2, 3.75, 0.05)])));
    bag.add(LS, fromTriangles(both([...P(-0.5, 2.6, -0.2), ...P(0.5, 2.6, -0.2), ...P(0.9, 0.4, -0.3), ...P(-0.5, 2.6, -0.2), ...P(0.9, 0.4, -0.3), ...P(-0.8, 0.6, -0.3)])));   // the cloak behind
    return;
  }
  // Hercules (seated, leaning out) or Minerva (seated, shield at her side)
  { const a = P(-0.7, 0, -0.6), b = P(0.7, 0.9, 0.6); bag.add(LS, box(Math.min(a[0], b[0]), a[1], a[2], Math.max(a[0], b[0]), b[1], b[2])); }
  bag.add(LS, rod(P(0, 0.9, 0), P(0.35, 2.4, 0.1), 0.42 * s, 8));                             // the torso, leaning
  bag.add(LS, lathe(S([[0.001, 0], [0.2, 0.05], [0.24, 0.3], [0.2, 0.5], [0.001, 0.56]]), 10, null, ...P(0.42, 2.45, 0.12)));
  for (const sg of [-1, 1]) bag.add(LS, rod(P(0.1, 1.0, sg * 0.25), P(1.1, 0.85, sg * 0.3 + 0.2), 0.19 * s, 6));   // the thighs
  for (const sg of [-1, 1]) bag.add(LS, rod(P(1.1, 0.85, sg * 0.3 + 0.2), P(1.25, 0, sg * 0.3 + 0.35), 0.15 * s, 6));
  bag.add(LS, rod(P(0.3, 2.1, -0.35), P(-0.4, 1.2, -0.5), 0.14 * s, 6));
  if (pose === 'minerva') {
    bag.add(LS, lathe(S([[0.001, 0], [0.75, 0.05], [0.78, 0.15], [0.001, 0.22]]), 16, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(...P(-0.72, 1.0, 0.1)));   // the shield
    bag.add(LS, rod(P(0.6, 0, -0.4), P(0.9, 3.4, -0.4), 0.05 * s, 4));                        // the spear
    bag.add(LS, lathe(S([[0.25, 0], [0.26, 0.2], [0.05, 0.45], [0.001, 0.5]]), 10, null, ...P(0.42, 2.9, 0.12)));   // the helmet
  } else {
    bag.add(LS, rod(P(-0.4, 1.2, -0.5), P(-1.0, 0.4, -0.2), 0.16 * s, 6));                     // the club
  }
}
/** grand_central: { rect, y, h (to the cornice), deck (the roadway's height), viaduct: { x, z1, w } } — the front faces +z. */
export function grandCentral(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 30, dk = el.deck ?? 8.5, SB = 8, zf = z1 - SB, cx = (x0 + x1) / 2;
  // the ground storey under the roadway: granite, with the street doors, and behind them the concourse (concourse.js); the body above is its shell
  const D = 1.6, zc = zf - D;                                                           // the façade slab and the core behind
  const doors = [];
  for (let x = x0 + 4; x < x1 - 3; x += 7) {
    const door = Math.abs(x + 1.5 - cx) < 12;
    if (door) doors.push(x + 1.5);
    else bag.add('opening', box(x, y, z1, x + 3, y + 3.0, z1 + 0.04));
    bag.add('granite_block', box(x - 0.3, y + (door ? 4.2 : 3.0), z1, x + 3.3, y + (door ? 4.9 : 3.6), z1 + 0.2));
  }
  concourse(bag, col, lights, { x0, z0, x1, z1, zc, y, dk, h, T: 1.2, doors, seed: 1931 });
  col.rect([x0, z0, x1, zf], y + dk, y + h + 6);
  // the terrace: the roadway's deck, its balustrade, lamp standards
  bag.add('asphalt', box(x0, y + dk, zf, x1, y + dk + 0.05, z1)); col.floor([x0, zf, x1, z1], y + dk + 0.05);
  const bal = (xa, xb, z, yy) => {
    bag.add(LS, box(xa, yy, z - 0.3, xb, yy + 0.25, z + 0.3)); bag.add(LS, box(xa, yy + 0.95, z - 0.32, xb, yy + 1.15, z + 0.32));
    for (let x = xa + 0.25; x < xb - 0.1; x += 0.36) bag.add(LS, lathe([[0.09, 0], [0.14, 0.15], [0.07, 0.4], [0.12, 0.55], [0.07, 0.7]], 6, null, x, yy + 0.25, z));
  };
  const gap = el.viaduct ? [el.viaduct.x - el.viaduct.w / 2, el.viaduct.x + el.viaduct.w / 2] : [cx, cx];
  bal(x0, gap[0], z1 - 0.35, y + dk + 0.05); bal(gap[1], x1, z1 - 0.35, y + dk + 0.05);
  col.segment([x0, z1 - 0.35], [gap[0], z1 - 0.35], 0.6, y + dk, y + dk + 1.2); col.segment([gap[1], z1 - 0.35], [x1, z1 - 0.35], 0.6, y + dk, y + dk + 1.2);
  // the front: end bays solid with two windows each, three arched windows between paired columns
  const W = x1 - x0, endW = W * 0.19, bayW = (W - 2 * endW) / 3, aw = bayW * 0.56, ya = y + dk + 1.5, ys = y + h - 4.5 - aw / 2, ent = y + h - 3.2;
  const F = (u0, u1, d0, d1, ya2, yb2) => box(u0, ya2, zf - D + d0, u1, yb2, zf - D + d1);   // d from the core's face, out to +z
  // the end bays and the piers between the arches, full height
  const piers = [[x0, x0 + endW], [x1 - endW, x1]];
  for (let i = 1; i < 3; i++) { const u = x0 + endW + i * bayW; piers.push([u - (bayW - aw) / 2, u + (bayW - aw) / 2]); }
  piers.push([x0 + endW, x0 + endW + (bayW - aw) / 2], [x1 - endW - (bayW - aw) / 2, x1 - endW]);
  for (const [a, b] of piers) bag.add(LS, F(a, b, 0, D, y + dk, ent));
  for (const xb of [x0 + endW / 2]) for (const s of [0, 1]) {                           // the end bays' windows, framed
    const u = s ? x1 - endW / 2 : xb;
    for (const [w0, w1] of [[y + dk + 3, y + dk + 9], [y + dk + 11.5, y + dk + 16.5]]) {
      bag.add('glass_outer', F(u - 1.6, u + 1.6, D, D + 0.02, w0, w1));
      bag.add(LS, F(u - 2.0, u + 2.0, D, D + 0.25, w1, w1 + 0.6)); bag.add(LS, F(u - 1.9, u + 1.9, D, D + 0.3, w0 - 0.5, w0));
    }
  }
  // the arches: the spandrel over each, the soffit round the head, the sill below, the glass and its mullions behind
  for (let i = 0; i < 3; i++) {
    const u = x0 + endW + (i + 0.5) * bayW, r = aw / 2, N = 16, S = [], SO = [], G = [];
    bag.add(LS, F(u - r, u + r, 0, D, y + dk, ya));                                         // under the sill
    bag.add(LS, F(u - r - 0.2, u + r + 0.2, D, D + 0.35, ya - 0.35, ya));                     // the sill
    for (let k = 0; k < N; k++) {
      const t0 = Math.PI * k / N, t1 = Math.PI * (k + 1) / N, p0 = [u - Math.cos(t0) * r, ys + Math.sin(t0) * r], p1 = [u - Math.cos(t1) * r, ys + Math.sin(t1) * r];
      const corner = k < N / 2 ? [u - r, ent] : [u + r, ent];
      S.push(p0[0], p0[1], zf, p1[0], p1[1], zf, corner[0], corner[1], zf);
      if (k === N / 2 - 1) S.push(p1[0], p1[1], zf, u + r, ent, zf, u - r, ent, zf);
      SO.push(p0[0], p0[1], zf, p1[0], p1[1], zc, p1[0], p1[1], zf, p0[0], p0[1], zf, p0[0], p0[1], zc, p1[0], p1[1], zc);
      G.push(u, ys, zc + 0.02, p1[0], p1[1], zc + 0.02, p0[0], p0[1], zc + 0.02);
    }
    bag.add(LS, fromTriangles(both(S))); bag.add(LS, fromTriangles(both(SO)));
    bag.add('glass_outer', fromTriangles(both(G))); bag.add('glass_outer', F(u - r, u + r, 0.02, 0.04, ya, ys));
    for (let k = 1; k < 6; k++) { const xx = u - r + k * aw / 6, top = ys + Math.sqrt(Math.max(0, r * r - (xx - u) ** 2)); bag.add('iron', F(xx - 0.07, xx + 0.07, 0.04, 0.2, ya, top)); }
    for (let yy = ya + 2.2; yy < ys + r - 0.3; yy += 2.2) { const hw = yy <= ys ? r : Math.sqrt(Math.max(0, r * r - (yy - ys) ** 2)); bag.add('iron', F(u - hw, u + hw, 0.04, 0.2, yy - 0.07, yy + 0.07)); }
    // the keystone
    bag.add(LS, F(u - 0.6, u + 0.6, D, D + 0.4, ys + r - 0.6, ys + r + 1.4));
  }
  // the paired columns on their pedestals, in front of the piers between and beside the arches
  for (let i = 0; i <= 3; i++) {
    const u = x0 + endW + i * bayW;
    for (const s of [-1, 1]) {
      const px = u + s * 1.25 + (i === 0 ? 1.6 : i === 3 ? -1.6 : 0), pz = zf + 0.9, cy = y + dk + 0.05;
      bag.add(LS, box(px - 1.0, cy, pz - 1.0, px + 1.0, cy + 2.2, pz + 0.9));
      const L = ent - cy - 2.7;
      bag.add(LS, lathe([[0.92, 0], [0.92, 0.3], [0.8, 0.45], [0.78, 0.6], [0.74, L * 0.4], [0.66, L - 0.8], [0.7, L - 0.7], [0.92, L - 0.1], [0.92, L]], 16, null, px, cy + 2.2, pz));
      bag.add(LS, box(px - 1.0, ent - 0.5, pz - 1.0, px + 1.0, ent, pz + 0.95));   // the abacus
    }
  }
  // the entablature, the cornice, the attic and its central block
  bag.add(LS, box(x0, ent, zc, x1, y + h, zf + 0.2));
  bag.add(LS, box(x0 - 0.4, ent + 1.1, zc, x1 + 0.4, ent + 1.4, zf + 0.6));
  bag.add(LS, box(x0 - 0.9, y + h, z0, x1 + 0.9, y + h + 1.2, zf + 1.4));
  bag.add(LS, box(x0 + 1, y + h + 1.2, z0 + 1, x1 - 1, y + h + 5, zf + 0.4));
  for (let x = x0 + 3; x < x1 - 2; x += 2.4) bag.add(LS, box(x - 0.2, y + h - 0.5, zf + 0.2, x + 0.2, y + h, zf + 1.3));   // the modillions
  const ab = y + h + 5;
  bag.add(LS, box(cx - 9, ab, zf - 2.5, cx + 9, ab + 1.6, zf + 0.6));
  // the clock, 4 m across, with its gilt frame and hour marks, and the group about it
  const ck = [cx, ab + 4.2, zf + 0.5];
  bag.add(LS, box(cx - 3.0, ab + 1.6, zf - 1.0, cx + 3.0, ab + 7.4, zf + 0.5));
  bag.add('glass_lamp', lathe([[0.001, 0], [2.0, 0], [2.0, 0.08], [0.001, 0.1]], 32, null, 0, 0, 0).rotateX(Math.PI / 2).translate(ck[0], ck[1], ck[2]));
  bag.add('gilt_bronze', lathe([[2.0, 0], [2.35, 0], [2.35, 0.28], [2.0, 0.28], [2.0, 0]], 32, null, 0, 0, 0).rotateX(Math.PI / 2).translate(ck[0], ck[1], ck[2] + 0.18));
  for (let k = 0; k < 12; k++) { const t = k / 12 * Math.PI * 2; bag.add('gilt_bronze', box(-0.1, 1.45, -0.03, 0.1, 1.8, 0.03).rotateZ(t).translate(ck[0], ck[1], ck[2] + 0.14)); }
  bag.add('iron', box(-0.06, 0, -0.03, 0.06, 1.2, 0.03).rotateZ(-0.9).translate(ck[0], ck[1], ck[2] + 0.16));
  bag.add('iron', box(-0.08, 0, -0.03, 0.08, 0.85, 0.03).rotateZ(1.9).translate(ck[0], ck[1], ck[2] + 0.2));
  figure(bag, cx, ab + 7.4, zf - 0.3, 2.0, 'stand');                                         // Mercury over the clock
  figure(bag, cx - 6.6, ab + 1.6, zf - 0.6, 2.7, 'hercules', -1);
  figure(bag, cx + 6.6, ab + 1.6, zf - 0.6, 2.7, 'minerva', 1);
  // the eagle-crowned lamp standards on the terrace
  for (let x = x0 + 6; x < x1 - 4; x += 14) {
    if (x > gap[0] - 1 && x < gap[1] + 1) continue;
    bag.add('iron', lathe([[0.25, 0], [0.25, 0.4], [0.09, 0.6], [0.07, 4.2], [0.001, 4.25]], 8, null, x, y + dk + 0.05, z1 - 1.2));
    bag.add('lamp_glass', lathe([[0.001, 0], [0.3, 0.1], [0.32, 0.5], [0.001, 0.75]], 10, null, x, y + dk + 4.2, z1 - 1.2));
  }
  // the viaduct: from the terrace south over 42nd and 41st Streets to the ground at 40th — steel spans over the
  // streets, stone-faced walls between, a balustrade each side
  const v = el.viaduct;
  if (!v) return;
  const va = v.x - v.w / 2, vb = v.x + v.w / 2, zEnd = v.z1, gy = el.yAt ?? (() => y), spans = v.spans ?? [];
  const deckY = (z) => z < (v.flat ?? z1 + 14) ? y + dk : y + dk - (y + dk - gy(zEnd)) * Math.min(1, (z - (v.flat ?? z1 + 14)) / (zEnd - (v.flat ?? z1 + 14)));
  const n = Math.ceil((zEnd - z1) / 2);
  for (let k = 0; k < n; k++) {
    const za = z1 + k * (zEnd - z1) / n, zb = z1 + (k + 1) * (zEnd - z1) / n, ya2 = deckY(za), yb2 = deckY(zb), zm = (za + zb) / 2;
    const overStreet = spans.some(([s0, s1]) => zm > s0 && zm < s1), T = [];
    const q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
    q([va, ya2 + 0.05, za], [va, yb2 + 0.05, zb], [vb, yb2 + 0.05, zb], [vb, ya2 + 0.05, za]);
    bag.add('asphalt', fromTriangles(T));
    if (overStreet) {                                                                       // the steel girders, their webs riveted
      for (const xx of [va + 0.3, vb - 0.3, v.x]) bag.add('iron', box(xx - 0.25, Math.min(ya2, yb2) - 1.4, za, xx + 0.25, Math.min(ya2, yb2), zb));
      bag.add('iron', box(va, Math.min(ya2, yb2) - 0.3, za, vb, Math.min(ya2, yb2) + 0.05, zb));
    } else {
      for (const xx of [va, vb]) bag.add('granite_block', box(xx - (xx === va ? 0.6 : 0), gy(zm) - 0.5, za, xx + (xx === vb ? 0.6 : 0), Math.min(ya2, yb2) + 0.05, zb));
      bag.add(GR, box(va, gy(zm) - 0.5, za, vb, Math.min(ya2, yb2), zb));
    }
    for (const xx of [va - 0.3, vb + 0.3]) { bag.add(LS, box(xx - 0.3, Math.min(ya2, yb2) + 0.05, za, xx + 0.3, Math.max(ya2, yb2) + 1.1, zb)); }
  }
  for (const [s0, s1] of spans) for (const zz of [s0, s1]) bag.add('granite_block', box(va - 0.6, gy(zz) - 0.5, zz - (zz === s0 ? 1.2 : 0), vb + 0.6, deckY(zz) - 1.4, zz + (zz === s1 ? 1.2 : 0)));   // the abutments
  col.ramp([va, v.flat ?? z1 + 14, vb, zEnd], gy(zEnd), y + dk + 0.05, 'n');
  col.floor([va, z1, vb, v.flat ?? z1 + 14], y + dk + 0.05);
  // (the walls on the fill stand from the ground; over a street only the balustrade stands, at the deck: the street runs under the span)
  for (let k = 0; k < n; k++) {
    const za = z1 + k * (zEnd - z1) / n, zb = z1 + (k + 1) * (zEnd - z1) / n, ya2 = deckY(za), yb2 = deckY(zb), zm = (za + zb) / 2;
    const overStreet = spans.some(([s0, s1]) => zm > s0 && zm < s1), y0 = overStreet ? Math.min(ya2, yb2) + 0.05 : gy(zm) - 0.5, y1 = Math.max(ya2, yb2) + 1.1;
    for (const xx of [va - 0.3, vb + 0.3]) col.segment([xx, za], [xx, zb], 0.6, y0, y1);
  }
}
