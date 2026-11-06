// The Sixth Avenue Elevated as it still ran in 1931 (docs/settlements/new-york.md §1b): two tracks on a steel
// viaduct over the middle of the avenue — latticed columns with flared feet and knee braces, a plate cross
// girder on every bent, lattice girders under each rail line, timber ties, running rails, guard timbers and the
// third rail; at 33rd, 38th and 42nd Streets a station of two side platforms, each with its station house of
// painted boards under a gabled roof (Jasper Cropsey's design of 1878), a canopy over the platform and a stair
// down to the pavement.

import { box, fromTriangles } from '../../core/geom.js';

const IRON = 'iron';
/** A flat bar (a ribbon, both faces) from a to b, w wide, its width across in the direction `side` (unit, 3-D). */
function bar(T, a, b, w, side) {
  const h = w / 2, p = (q, s) => [q[0] + side[0] * h * s, q[1] + side[1] * h * s, q[2] + side[2] * h * s];
  const A = p(a, -1), B = p(b, -1), C = p(b, 1), D = p(a, 1);
  T.push(...A, ...B, ...C, ...A, ...C, ...D, ...A, ...C, ...B, ...A, ...D, ...C);
}
/**
 * el_track: { x, z0, z1, y, yAt?(z), stations?: [z of the station's middle] } — the viaduct over the avenue's
 * middle line x, along z. Columns stand at x ± 3.9 (traffic keeps clear of them), a bent every 15 m.
 */
export function elTrack(el, { bag, col }) {
  const x = el.x, z0 = el.z0, z1 = el.z1, y = el.y ?? 0, gy = el.yAt ?? (() => y), H = 9, cxs = [-3.9, 3.9], T = [], span = 15;
  const tracks = [-2.0, 2.0], gauge = 0.72;
  const stations = el.stations ?? [], inStation = (z) => stations.some((s) => Math.abs(z - s) < 31);
  // the bents: two latticed columns (two channels joined by lattice bars), a flared foot, a knee brace each side, the cross girder
  for (let z = z0; z <= z1 + 0.01; z += span) {
    const yb = gy(z) - 0.3;
    for (const dx of cxs) {
      const cx = x + dx;
      for (const s of [-1, 1]) bag.add(IRON, box(cx - 0.28, yb, z + s * 0.24 - 0.05, cx + 0.28, y + H, z + s * 0.24 + 0.05));      // the channels
      for (let k = 0, yy = yb + 1.4; yy < y + H - 0.8; k++, yy += 0.55) for (const sx of [-1, 1]) {
        const xx = cx + sx * 0.25;
        const za = k % 2 ? z + 0.2 : z - 0.2;
        bar(T, [xx, yy, za], [xx, yy + 0.55, 2 * z - za], 0.07, [0, 0, 1]);
      }
      bag.add(IRON, box(cx - 0.45, yb, z - 0.45, cx + 0.45, yb + 1.4, z + 0.45));                     // the foot, a cast base
      bag.add(IRON, box(cx - 0.36, yb + 1.4, z - 0.36, cx + 0.36, yb + 1.6, z + 0.36));
      for (const s of [-1, 1]) bar(T, [cx, y + H - 2.0, z + s * 0.25], [cx, y + H, z + s * 1.8], 0.22, [1, 0, 0]);   // the knee braces along the line
      bar(T, [cx + (dx < 0 ? 0.28 : -0.28), y + H - 1.8, z], [cx + (dx < 0 ? 1.8 : -1.8), y + H, z], 0.2, [0, 0, 1]);
      col.rect([cx - 0.45, z - 0.45, cx + 0.45, z + 0.45], yb, y + H);
    }
    bag.add(IRON, box(x - 4.7, y + H, z - 0.3, x + 4.7, y + H + 1.0, z + 0.3));                       // the cross girder
    bag.add(IRON, box(x - 4.7, y + H - 0.08, z - 0.4, x + 4.7, y + H, z + 0.4));
  }
  // the lattice girders: two under each track, top and bottom chords and a zig-zag of bars between
  for (const tx of tracks) for (const gx of [tx - 0.85, tx + 0.85]) {
    const xx = x + gx;
    bag.add(IRON, box(xx - 0.22, y + H + 0.9, z0, xx + 0.22, y + H + 1.05, z1));
    bag.add(IRON, box(xx - 0.22, y + H, z0, xx + 0.22, y + H + 0.12, z1));
    for (let z = z0, k = 0; z < z1 - 0.01; z += 0.9, k++) bar(T, [xx, y + H + 0.12, z + (k % 2 ? 0.9 : 0)], [xx, y + H + 0.9, z + (k % 2 ? 0 : 0.9)], 0.09, [0, 0, 1]);
    for (let z = z0; z < z1; z += 3.75) bag.add(IRON, box(xx - 0.2, y + H + 0.12, z - 0.04, xx + 0.2, y + H + 0.9, z + 0.04));   // stiffeners
  }
  // the ties, the running rails, the guard timbers, the third rail on the outer side of each track
  for (const tx of tracks) {
    for (let z = z0; z < z1; z += 0.75) bag.add('timber', box(x + tx - 1.35, y + H + 1.05, z - 0.11, x + tx + 1.35, y + H + 1.25, z + 0.11));
    for (const s of [-1, 1]) bag.add('steel_chrome', box(x + tx + s * gauge - 0.04, y + H + 1.25, z0, x + tx + s * gauge + 0.04, y + H + 1.4, z1));
    for (const s of [-1, 1]) bag.add('timber', box(x + tx + s * 1.2 - 0.1, y + H + 1.25, z0, x + tx + s * 1.2 + 0.1, y + H + 1.42, z1));
    const s3 = Math.sign(tx);
    bag.add(IRON, box(x + tx + s3 * 0.95 - 0.05, y + H + 1.32, z0, x + tx + s3 * 0.95 + 0.05, y + H + 1.45, z1));
    for (let z = z0; z < z1; z += 3) bag.add('glaze_white', box(x + tx + s3 * 0.95 - 0.06, y + H + 1.25, z - 0.06, x + tx + s3 * 0.95 + 0.06, y + H + 1.32, z + 0.06));
  }
  // the stations: side platforms outside the tracks, each with its house, canopy, railing and stair
  const PY = y + H + 2.25;
  for (const sz of stations) for (const sg of [-1, 1]) {
    const a = x + sg * 3.55, b = x + sg * 6.9, xa = Math.min(a, b), xb = Math.max(a, b), za = sz - 30, zb = sz + 30;
    bag.add('planks_grey', box(xa, PY - 0.25, za, xb, PY, zb)); col.floor([xa, za, xb, zb], PY);
    for (let z = za + 1; z < zb; z += 5) {
      bag.add(IRON, box(xa + 0.1, y + H + 1.0, z - 0.1, xb - 0.1, PY - 0.25, z + 0.1));                   // the brackets
      bar(T, [x + sg * 3.9, y + H - 1.2, z], [x + sg * 6.6, PY - 0.3, z], 0.16, [0, 0, 1]);
    }
    // the railing on the outer edge, leaving a gap at the stair's head
    const ox = x + sg * 6.85;
    for (const [r0, r1] of [[za, zb - 8], [zb - 5.5, zb]]) {
      bag.add(IRON, box(ox - 0.03, PY + 1.0, r0, ox + 0.03, PY + 1.06, r1));
      for (let z = r0; z <= r1; z += 1.2) bag.add(IRON, box(ox - 0.025, PY, z - 0.025, ox + 0.025, PY + 1.0, z + 0.025));
    }
    col.segment([ox, za], [ox, zb - 8], 0.1, PY, PY + 1.06);
    // the station house: boarded walls, a door and windows to the platform, a gabled roof facing the street, cresting and finials
    const h0 = sz - 13, h1 = sz + 5, hx0 = x + sg * 4.6, hx1 = x + sg * 6.85, qx0 = Math.min(hx0, hx1), qx1 = Math.max(hx0, hx1), HY = PY + 3.2;
    bag.add('shutter_green', box(qx0, PY, h0, qx1, HY, h1)); col.rect([qx0, h0, qx1, h1], PY, HY);
    for (let z = h0 + 0.3; z < h1; z += 0.3) bag.add('shutter_green', box(qx0 - 0.02, PY + 0.2, z - 0.02, qx0, HY - 0.3, z + 0.02).translate(sg < 0 ? 0 : qx1 - qx0 + 0.02, 0, 0));   // the battens
    const inner = sg < 0 ? qx1 : qx0, isg = -sg;
    for (let z = h0 + 1.5; z < h1 - 1; z += 2.4) {
      const door = Math.abs(z - (h0 + h1) / 2) < 1.3;
      bag.add(door ? 'opening' : 'glass_outer', box(Math.min(inner, inner + isg * 0.03), PY + (door ? 0 : 1.0), z - 0.6, Math.max(inner, inner + isg * 0.03), PY + (door ? 2.4 : 2.5), z + 0.6));
      bag.add('wood_painted', box(Math.min(inner, inner + isg * 0.06), PY + (door ? 2.4 : 2.5), z - 0.75, Math.max(inner, inner + isg * 0.06), PY + (door ? 2.6 : 2.7), z + 0.75));
    }
    // the roof: two slopes falling to the platform and to the street side, the gables at the ends
    const mx = (qx0 + qx1) / 2, RH = 1.6, R = [];
    const e0 = qx0 - 0.4, e1 = qx1 + 0.4, ey = HY - 0.5;
    for (const [p, q] of [[e0, mx], [e1, mx]]) R.push(...[p, ey, h0 - 0.4], ...[q, HY + RH, h0 - 0.4], ...[q, HY + RH, h1 + 0.4], ...[p, ey, h0 - 0.4], ...[q, HY + RH, h1 + 0.4], ...[p, ey, h1 + 0.4]);
    const G = [];
    for (const zz of [h0, h1]) G.push(...[qx0, HY, zz], ...[qx1, HY, zz], ...[mx, HY + RH - 0.1, zz]);
    bag.add('slate', fromTriangles([...R, ...R.slice(0).reduce((o, _, i, arr) => { if (i % 9 === 0) o.push(...arr.slice(i, i + 3), ...arr.slice(i + 6, i + 9), ...arr.slice(i + 3, i + 6)); return o; }, [])]));
    bag.add('shutter_green', fromTriangles([...G, ...G.reduce((o, _, i, arr) => { if (i % 9 === 0) o.push(...arr.slice(i, i + 3), ...arr.slice(i + 6, i + 9), ...arr.slice(i + 3, i + 6)); return o; }, [])]));
    bag.add(IRON, box(mx - 0.06, HY + RH, h0 - 0.4, mx + 0.06, HY + RH + 0.35, h1 + 0.4));            // the cresting
    for (const zz of [h0 - 0.4, h1 + 0.4]) bag.add(IRON, box(mx - 0.08, HY + RH, zz - 0.08, mx + 0.08, HY + RH + 1.0, zz + 0.08));   // the finials
    // the canopy over the rest of the platform: iron posts, a shallow roof
    const c0 = h1 + 0.6, c1 = zb - 9, cy = PY + 3.0;
    for (let z = c0 + 1; z < c1; z += 4) bag.add(IRON, box(mx - 0.08, PY, z - 0.08, mx + 0.08, cy, z + 0.08));
    bag.add('iron_galv', box(xa - 0.2, cy, c0, xb + 0.3, cy + 0.12, c1));
    for (let z = za + 2; z < h0 - 1; z += 6) bag.add('timber', box(mx - 0.25, PY, z - 0.9, mx + 0.25, PY + 0.45, z + 0.9));   // benches
    // the stair down to the pavement, beside the avenue, from the platform's end
    const sx0 = x + sg * 9.2, sx1 = x + sg * 10.8, qa = Math.min(sx0, sx1), qb = Math.max(sx0, sx1), top = zb - 5.5, foot = gy(top - 18) + 0.0, run = 17.5, n = 42;
    const la = Math.min(x + sg * 6.9, qb), lb = Math.max(x + sg * 6.9, qa), l0 = Math.min(la, lb, qa), l1 = Math.max(la, lb, qb);
    bag.add('planks_grey', box(l0, PY - 0.25, top - 2.5, l1, PY, top)); col.floor([l0, top - 2.5, l1, top], PY);   // the landing, out over the kerb
    for (const zz of [top - 2.5, top]) { bag.add(IRON, box(l0, PY + 1.0, zz - 0.03, l1, PY + 1.06, zz + 0.03)); }
    for (const xx of [qa + 0.25, qb - 0.25]) { bag.add(IRON, box(xx - 0.12, gy(top) - 0.3, top - 1.4, xx + 0.12, PY - 0.25, top - 1.1)); col.rect([xx - 0.12, top - 1.4, xx + 0.12, top - 1.1], gy(top) - 0.3, PY - 0.25); }
    for (let k = 0; k < n; k++) {
      const zz = top - 2.5 - run * (k + 1) / n, yy = PY - (PY - foot) * (k + 1) / n;
      bag.add('planks_grey', box(qa + 0.1, yy - 0.05, zz, qb - 0.1, yy, zz + run / n + 0.02));
    }
    col.ramp([qa, top - 2.5 - run, qb, top - 2.5], foot, PY, 's');
    for (const xx of [qa, qb]) {
      const A = [xx, PY + 0.1, top - 2.5], B = [xx, foot + 0.1, top - 2.5 - run];
      bar(T, [A[0], A[1] - 0.4, A[2]], [B[0], B[1] - 0.4, B[2]], 0.45, [0, 1, 0]);                         // the stringer
      bar(T, [A[0], A[1] + 0.9, A[2]], [B[0], B[1] + 0.9, B[2]], 0.08, [0, 1, 0]);                         // the handrail
      for (let k = 0; k <= 8; k++) { const f = k / 8, P = [xx, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f]; bag.add(IRON, box(xx - 0.03, P[1] - 0.2, P[2] - 0.03, xx + 0.03, P[1] + 0.9, P[2] + 0.03)); }
    }
    for (let k = 1; k <= 3; k++) { const zz = top - 2.5 - run * k / 4, yy = PY - (PY - foot) * k / 4; bag.add(IRON, box(qa + 0.2, foot - 0.3, zz - 0.12, qa + 0.45, yy - 0.3, zz + 0.12)); bag.add(IRON, box(qb - 0.45, foot - 0.3, zz - 0.12, qb - 0.2, yy - 0.3, zz + 0.12)); }
    col.segment([qa, top - 2.5 - run], [qa, top - 2.5], 0.1, foot, PY + 1); col.segment([qb, top - 2.5 - run], [qb, top - 2.5], 0.1, foot, PY + 1);
  }
  void inStation;
  bag.add(IRON, fromTriangles(T));
}
