// Westminster Bridge of 1862 (docs/settlements/london.md §1): Thomas Page's seven iron arches, the largest
// in the middle, on granite piers with pointed cutwaters; Charles Barry's Gothic detail — open spandrels of
// iron tracery, a cast-iron parapet of pointed arcading; footways on each side of the roadway; lamp
// standards over the piers.

import { box, lathe, sweep, rod } from '../../core/geom.js';
import { prism, vprism, ngon } from '../dutch/facade.js';

/** iron_bridge: { x0, x1 (its ends, along x), z (its axis), w (width), y (deck), water, bed, spans (count) } */
export function ironBridge(el, { bag, col }) {
  const { x0, x1, z } = el, w = el.w ?? 16, y = el.y ?? 2.4, water = el.water ?? -2.5, bed = el.bed ?? -6, n = el.spans ?? 7, ab = el.abut ?? 8, pw = 3.2;
  const wt = Array.from({ length: n }, (_, i) => 1 - 0.22 * Math.abs(i - (n - 1) / 2) / ((n - 1) / 2)), tot = wt.reduce((a, b) => a + b, 0);
  const free = x1 - x0 - 2 * ab - (n - 1) * pw, spans = []; let u = x0 + ab;
  for (let i = 0; i < n; i++) { const S = free * wt[i] / tot; spans.push([u, u + S]); u += S + pw; }
  const G = 'granite_grey', I = 'iron', za = z - w / 2, zb = z + w / 2;
  // the abutments and the piers: granite, cutwaters pointed up- and downstream, a cornice at the springing
  for (const [a, b] of [[x0, x0 + ab], [x1 - ab, x1]]) { bag.add('granite_block', box(a, bed, za - 0.6, b, y - 0.65, zb + 0.6)); col.rect([a, za - 0.6, b, zb + 0.6], bed, y); }
  const spring = water + 0.9;
  for (let i = 0; i < n - 1; i++) {
    const a = spans[i][1], b = spans[i + 1][0], c = (a + b) / 2;
    bag.add('granite_block', vprism([[a, za - 0.6], [b, za - 0.6], [b, zb + 0.6], [a, zb + 0.6]], bed, spring + 0.6));
    for (const s of [-1, 1]) { const e = s < 0 ? za - 0.6 : zb + 0.6; bag.add('granite_block', vprism([[a, e], [b, e], [c, e + s * 2.2]], bed, spring + 0.6)); bag.add(G, vprism([[a - 0.2, e], [b + 0.2, e], [c, e + s * 2.5]], spring + 0.6, spring + 1.0)); }
    bag.add(G, box(a - 0.2, spring + 0.6, za - 0.8, b + 0.2, spring + 1.0, zb + 0.8));
    // over the cutwaters, octagonal granite pedestals rising to the parapet, each bearing a lamp standard
    for (const s of [-1, 1]) {
      const pz = s < 0 ? za - 0.9 : zb + 0.9;
      bag.add(G, lathe([[1.1, 0], [1.1, y + 0.4 - spring - 1.0], [1.25, y + 0.6 - spring - 1.0], [1.25, y + 1.3 - spring - 1.0]], 8, null, c, spring + 1.0, pz));
      lamp(bag, c, y + 1.3, pz);
    }
    col.rect([a, za - 2.5, b, zb + 2.5], bed, spring + 1.0);
  }
  // the arch ribs: five across the width, deeper at the springing; open spandrels of posts and iron rings
  const deckU = y - 0.75, ribs = 5;
  for (const [a, b] of spans) {
    const S = b - a, r = deckU - 0.2 - spring, R = (S * S / 4 + r * r) / (2 * r), m = (a + b) / 2;
    const arc = (t) => spring + Math.sqrt(Math.max(0, R * R - (t - m) ** 2)) - (R - r), N = 16;
    for (let j = 0; j < ribs; j++) {
      const zr = za + 0.4 + j * (w - 0.8) / (ribs - 1), F = { at: (uu, d) => [uu, zr + d] }, outer = j === 0 || j === ribs - 1, th = outer ? 0.35 : 0.25;
      for (let k = 0; k < N; k++) {
        const t0 = a + S * k / N, t1 = a + S * (k + 1) / N, dep0 = 0.55 + 0.5 * Math.abs(t0 - m) / (S / 2), dep1 = 0.55 + 0.5 * Math.abs(t1 - m) / (S / 2);
        bag.add(I, prism(F, 0, [[t0, arc(t0)], [t1, arc(t1)], [t1, arc(t1) + dep1], [t0, arc(t0) + dep0]], -th / 2, th / 2));
      }
      if (!outer) continue;
      // the outer ribs' spandrels: posts up to the deck girder, a ring of tracery between each pair
      const side = j === 0 ? -1 : 1;
      for (let k = 1; k < 10; k++) {
        const t = a + S * k / 10, top = arc(t) + 0.55 + 0.5 * Math.abs(t - m) / (S / 2);
        if (deckU - top > 0.25) bag.add(I, prism(F, 0, [[t - 0.08, top - 0.05], [t + 0.08, top - 0.05], [t + 0.08, deckU], [t - 0.08, deckU]], -0.12, 0.12));
        const tm = t - S / 20, tp = arc(tm) + 0.55 + 0.5 * Math.abs(tm - m) / (S / 2), rr = Math.min(0.45 * S / 10, (deckU - tp) / 2 - 0.08);
        if (rr > 0.18) { const ring = ngon(tm, (tp + deckU) / 2, rr, 12); for (let q = 0; q < 12; q++) { const p0 = ring[q], p1 = ring[(q + 1) % 12], cx = tm, cy = (tp + deckU) / 2, f = 0.07 / rr; bag.add(I, prism(F, 0, [p0, p1, [p1[0] + (cx - p1[0]) * f, p1[1] + (cy - p1[1]) * f], [p0[0] + (cx - p0[0]) * f, p0[1] + (cy - p0[1]) * f]], side * 0.1 - 0.06, side * 0.1 + 0.06)); } }
      }
    }
  }
  // the deck: the iron girder at each face with its cusped arcading, the roadway of setts, raised footways
  bag.add(I, box(x0 + ab - 0.1, deckU, za, x1 - ab + 0.1, y - 0.1, zb));
  for (const s of [-1, 1]) {
    const zf = s < 0 ? za - 0.05 : zb + 0.05, F = { at: (uu, d) => [uu, zf + s * d] };
    bag.add(I, prism(F, 0, [[x0 + ab, deckU - 0.15], [x1 - ab, deckU - 0.15], [x1 - ab, y], [x0 + ab, y]], -0.05, 0.08));
    for (let t = x0 + ab + 0.6; t < x1 - ab - 0.3; t += 1.2) bag.add(I, prism(F, 0, [[t - 0.5, y - 0.12], [t + 0.5, y - 0.12], [t, y - 0.55]], 0.08, 0.14));
  }
  bag.add('granite_block', box(x0, y - 0.1, z - w / 2 + 3.2, x1, y, z + w / 2 - 3.2));
  for (const s of [-1, 1]) { const q = s < 0 ? [za, z - w / 2 + 3.2] : [z + w / 2 - 3.2, zb]; bag.add('flagstone', box(x0, y - 0.1, q[0], x1, y + 0.15, q[1])); bag.add(G, box(x0, y - 0.1, s < 0 ? q[1] - 0.25 : q[0], x1, y + 0.17, s < 0 ? q[1] : q[0] + 0.25)); }
  col.floor([x0, za, x1, zb], y + 0.15);
  // the cast-iron parapets: posts, rails, balusters and a pointed arcade between the rails
  for (const s of [-1, 1]) {
    const zp = s < 0 ? za + 0.12 : zb - 0.12, F = { at: (uu, d) => [uu, zp + d] };
    bag.add(I, box(x0, y + 0.15, zp - 0.15, x1, y + 0.3, zp + 0.15)); bag.add(I, box(x0, y + 1.1, zp - 0.12, x1, y + 1.22, zp + 0.12)); bag.add(I, box(x0, y + 0.95, zp - 0.05, x1, y + 1.0, zp + 0.05));
    for (let t = x0 + 0.1; t < x1; t += 2.4) bag.add(I, box(t - 0.1, y + 0.15, zp - 0.15, t + 0.1, y + 1.35, zp + 0.15));
    for (let t = x0 + 0.25; t < x1; t += 0.3) {
      bag.add(I, box(t - 0.02, y + 0.3, zp - 0.025, t + 0.02, y + 0.95, zp + 0.025));
      for (const [p0, p1] of [[[t, y + 0.74], [t + 0.15, y + 0.95]], [[t + 0.15, y + 0.95], [t + 0.3, y + 0.74]]]) bag.add(I, prism(F, 0, [[p0[0], p0[1] - 0.02], [p1[0], p1[1] - 0.02], [p1[0], p1[1] + 0.02], [p0[0], p0[1] + 0.02]], -0.02, 0.02));
    }
    col.rect([x0, zp - 0.15, x1, zp + 0.15], y, y + 1.35);
  }
}

/** A lamp standard: a fluted iron column, a crossbar and three lanterns. */
function lamp(bag, x, y, z) {
  bag.add('iron', lathe([[0.32, 0], [0.32, 0.3], [0.2, 0.45], [0.12, 0.6], [0.11, 3.4], [0.16, 3.5], [0.16, 3.6]], 10, null, x, y, z));
  bag.add('iron', box(x - 0.75, y + 3.55, z - 0.04, x + 0.75, y + 3.65, z + 0.04));
  for (const dx of [-0.75, 0, 0.75]) {
    const yy = y + (dx ? 3.65 : 3.6);
    bag.add('lamp_glass', lathe([[0.1, 0], [0.2, 0.15], [0.2, 0.55], [0.12, 0.65], [0.001, 0.66]], 8, null, x + dx, yy, z));
    bag.add('iron', lathe([[0.24, 0], [0.12, 0.18], [0.001, 0.32]], 8, null, x + dx, yy + 0.66, z));
  }
}

/**
 * embankment: { path: [[x, z]…] (the wall's line; `side` 1 when the river lies toward (dz, -dx) of the path's direction, -1 otherwise), y (the
 * road), bed, lamps (spacing) } — Bazalgette's granite river wall with its parapet, and Vulliamy's
 * dolphin lamp standards (1870) on granite plinths along it.
 */
export function embankment(el, { bag, col }) {
  const p = el.path, y = el.y ?? 2, bed = el.bed ?? -6, side = el.side ?? 1, sp = el.lamps ?? 18;
  const rect = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1], [u0, v0]];
  bag.add('granite_block', sweep(rect(-0.6, bed - y, 0.6, 0.0), p, y, false));                       // the wall
  bag.add('granite_grey', sweep(rect(-0.35, 0, 0.35, 0.95), p, y, false));                          // the parapet
  bag.add('granite_grey', sweep(rect(-0.45, 0.95, 0.45, 1.1), p, y, false));                        // its coping
  bag.add('granite_grey', sweep(rect(side * 0.6 - 0.25, -1.6, side * 0.6 + 0.25, -1.2), p, y, false));  // a string course on the river face
  let acc = sp / 2;
  for (let i = 1; i < p.length; i++) {
    const [ax, az] = p[i - 1], [bx, bz] = p[i], L = Math.hypot(bx - ax, bz - az);
    col.segment(p[i - 1], p[i], 0.9, y - 1, y + 1.1);
    for (let t = 0; t < L; t += 0.5) {
      acc += 0.5;
      if (acc < sp) continue;
      acc = 0;
      const x = ax + (bx - ax) * t / L, z = az + (bz - az) * t / L;
      dolphinLamp(bag, x, y + 1.1, z);
      // and on the river face below it, a lion's head holding a mooring ring
      const nx = (bz - az) / L * side, nz = -(bx - ax) / L * side;
      const hx = x + nx * 0.6, hz = z + nz * 0.6;
      const head = lathe([[0.001, 0], [0.3, 0], [0.32, 0.1], [0.26, 0.2], [0.12, 0.27], [0.001, 0.28]], 12);
      head.rotateX(Math.PI / 2); head.rotateY(Math.atan2(nx, nz)); head.translate(hx, y - 1.0, hz); bag.add('bronze', head);
      const ring = lathe([[0.2, -0.035], [0.235, 0], [0.2, 0.035], [0.165, 0], [0.2, -0.035]], 12);
      ring.rotateX(Math.PI / 2); ring.rotateY(Math.atan2(nx, nz)); ring.translate(hx + nx * 0.18, y - 1.47, hz + nz * 0.18); bag.add('bronze', ring);
    }
  }
}

/** A dolphin lamp: a granite plinth, two dolphins writhing round the foot, a fluted column, a white globe and a crown. */
function dolphinLamp(bag, x, y, z) {
  bag.add('granite_grey', box(x - 0.35, y, z - 0.35, x + 0.35, y + 0.5, z + 0.35));
  const yb = y + 0.5;
  bag.add('iron', lathe([[0.3, 0], [0.3, 0.12], [0.22, 0.2], [0.2, 1.0], [0.13, 1.15]], 10, null, x, yb, z));
  for (const s of [0, Math.PI]) {
    const pts = Array.from({ length: 9 }, (_, i) => { const t = i / 8, a = s + t * 2.4; return [x + Math.cos(a) * (0.26 + 0.08 * Math.sin(t * 6)), yb + 0.1 + t * 1.0, z + Math.sin(a) * (0.26 + 0.08 * Math.sin(t * 6))]; });
    for (let i = 0; i < 8; i++) bag.add('iron', rod(pts[i], pts[i + 1], 0.09 - i * 0.007, 6));
    bag.add('iron', lathe([[0.001, 0], [0.13, 0.08], [0.14, 0.2], [0.001, 0.3]], 6, null, pts[0][0], yb, pts[0][2]));
  }
  bag.add('iron', lathe([[0.1, 0], [0.09, 2.2], [0.14, 2.3], [0.14, 2.4]], 12, (th) => 1 + 0.08 * Math.cos(th * 12), x, yb + 1.15, z));
  const yg = yb + 3.55;
  bag.add('lamp_white', lathe([[0.08, 0], [0.22, 0.1], [0.27, 0.3], [0.22, 0.5], [0.08, 0.6]], 12, null, x, yg, z));
  bag.add('iron', lathe([[0.12, 0], [0.2, 0.06], [0.14, 0.2], [0.18, 0.3], [0.001, 0.42]], 8, null, x, yg + 0.58, z));
}
