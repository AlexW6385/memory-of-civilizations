// The domed halls of the Ulugh Beg Madrasa (docs/settlements/timurid-samarkand.md §17): the four corner rooms under the
// madrasa's domes. Each is a hall of one square domed bay between two flat-ceilinged side bays: the bay's four corners
// turned to an octagon by stepped squinches of tile, a drum with its lit lattice windows, the inner dome in lapis ribbed
// with gilt; the walls dressed with a tile dado, a lapis band and a Kufic frieze. Pure geometry; coordinates in metres.

import { box, lathe, place, rod } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import * as F from '../mughal/furnish.js';
import { bannai, wallRun, LAP, TUR, CRE, WHI } from './kit.js';

const bx = (bag, m, x0, y0, z0, x1, y1, z1) => bag.add(m, box(Math.min(x0, x1), y0, Math.min(z0, z1), Math.max(x0, x1), y1, Math.max(z0, z1)));
const R2 = Math.SQRT2;

/**
 * The inner dome over a square bay { c: [x, z], a (half the bay's side), y (the ceiling's level), ribs }: three tiers of
 * squinch in each corner (stepped slabs of tile, a gilt edge under each), the drum with eight lattice windows, the
 * inner dome. Returns the y of the dome's apex.
 */
export function hallDome(bag, o) {
  const [cx, cz] = o.c, a = o.a, y0 = o.y + 0.02, ir = a - 0.1, lf = 2 * a - R2 * ir, tier = 0.5, ribs = o.ribs ?? 16;
  const legs = [lf * 0.4, lf * 0.72, lf + 0.04], mats = [TUR, LAP, TUR];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const C = [cx + sx * a, cz + sz * a], n = [sx / R2, sz / R2];
    legs.forEach((l, t) => {
      const th = l / R2, A = [C[0] - sx * l + n[0] * th / 2, C[1] + n[1] * th / 2], B = [C[0] + n[0] * th / 2, C[1] - sz * l + n[1] * th / 2];
      const yb = y0 + t * tier;
      bag.add(mats[t], orientedBox(A, B, th, yb, yb + tier));
      // the gilt edge along the foot of the step, on the hypotenuse's face
      const ea = [A[0] - n[0] * (th / 2 + 0.012), A[1] - n[1] * (th / 2 + 0.012)], eb = [B[0] - n[0] * (th / 2 + 0.012), B[1] - n[1] * (th / 2 + 0.012)];
      bag.add('mosaic_gold', orientedBox(ea, eb, 0.03, yb, yb + 0.05));
      // a small pointed cell in the middle of the step's face: the muqarnas in little
      const mid = [(ea[0] + eb[0]) / 2 - n[0] * 0.01, (ea[1] + eb[1]) / 2 - n[1] * 0.01], hl = l * R2 * 0.2;
      const t2 = [(eb[0] - ea[0]) / (l * R2), (eb[1] - ea[1]) / (l * R2)];
      bag.add(t === 1 ? TUR : CRE, orientedBox([mid[0] - t2[0] * hl, mid[1] - t2[1] * hl], [mid[0] + t2[0] * hl, mid[1] + t2[1] * hl], 0.02, yb + 0.12, yb + tier - 0.06));
    });
  }
  const yd = y0 + 3 * tier, dh = 1.2;
  bag.add('plaster_persian', lathe([[ir, yd + dh], [ir, yd]], 32, null, cx, 0, cz));
  bag.add('tile_turquoise', lathe([[ir - 0.02, yd + dh * 0.62], [ir - 0.02, yd + dh * 0.5]], 32, null, cx, 0, cz));
  bag.add('mosaic_gold', lathe([[ir - 0.03, yd + dh * 0.5], [ir - 0.03, yd + dh * 0.5 - 0.06]], 32, null, cx, 0, cz));
  bag.add('mosaic_gold', lathe([[ir - 0.03, yd + dh * 0.62], [ir - 0.03, yd + dh * 0.62 + 0.05]], 32, null, cx, 0, cz));
  // eight arched windows round the drum, screened with lattice (the light of the hall)
  for (let k = 0; k < 8; k++) {
    const ang = (k + 0.5) / 8 * Math.PI * 2, wx = cx + Math.cos(ang) * (ir - 0.04), wz = cz + Math.sin(ang) * (ir - 0.04), yaw = -ang - Math.PI / 2;
    bag.add('tile_cream', place(box(-0.36, yd + 0.1, -0.03, 0.36, yd + dh - 0.12, 0.03), wx, 0, wz, yaw));
    bag.add('lattice', place(box(-0.28, yd + 0.16, -0.05, 0.28, yd + dh - 0.2, 0.05), wx, 0, wz, yaw));
  }
  const prof = [], n = 20, y1 = yd + dh, dhh = o.rise ?? 2.6;
  for (let i = 0; i <= n; i++) { const t = i / n, ang = t * Math.PI / 2; prof.push([Math.max(0.001, ir * Math.cos(ang) ** 0.9), dhh * Math.sin(ang) ** 1.1]); }
  const rev = prof.slice().reverse();
  bag.add('glaze_lapis', lathe(rev, ribs * 4, (th, i) => (i < rev.length - 1 ? 1 + 0.025 * Math.cos(ribs * th) : 1), cx, y1, cz));
  // gilt ribs: a thin gilt strip up the crest of each of eight ribs
  for (let k = 0; k < 8; k++) {
    const ang = k / 8 * Math.PI * 2 + Math.PI / ribs * 0, pts = prof.filter((_, i) => i > 1 && i < n - 1);
    for (let i = 0; i + 1 < pts.length; i += 2) {
      const [r0, h0] = pts[i], [r1, h1] = pts[i + 1];
      bag.add('mosaic_gold', rod([cx + Math.cos(ang) * (r0 - 0.02), y1 + h0, cz + Math.sin(ang) * (r0 - 0.02)], [cx + Math.cos(ang) * (r1 - 0.02), y1 + h1, cz + Math.sin(ang) * (r1 - 0.02)], 0.022, 3));
    }
  }
  bag.add('mosaic_gold', lathe([[0.001, dhh - 0.02], [ir * 0.12, dhh - 0.06], [ir * 0.12, dhh - 0.3], [0.001, dhh - 0.36]].reverse(), 10, null, cx, y1, cz));
  bag.add('mosaic_gold', lathe([[ir - 0.02, 0.02], [ir - 0.02, 0.5]].reverse(), 32, null, cx, y1, cz));
  return y1 + dhh;
}

/**
 * The roof of a hall that has one domed bay: o = { room: [x0, z0, x1, z1] (clear inside), mass: [x0, z0, x1, z1] (the block's
 * outer rectangle over it), y (ceiling), top (the block's top), bay: { c: [x, z], a }, apex }. A painted ceiling and the
 * block over each side bay; over the domed bay only what is left of the block (the strip along the wall, the cap over the
 * dome). The wall that stands under a strip is the caller's.
 */
export function hallRoof(bag, col, o) {
  const [x0, z0, x1, z1] = o.room, [mx0, mz0, mx1, mz1] = o.mass, y = o.y, top = o.top, bx0 = o.bay.c[0] - o.bay.a, bx1 = o.bay.c[0] + o.bay.a;
  for (const [s0, s1, m0, m1] of [[x0, bx0, mx0, bx0], [bx1, x1, bx1, mx1]]) {
    if (s1 - s0 < 0.05 && m1 - m0 < 0.05) continue;
    bx(bag, 'ceiling_painted', s0, y, mz0, s1, y + 0.3, mz1);
    bx(bag, 'brick_buff', m0, y + 0.3, mz0, m1, top, mz1); col.rect([m0, mz0, m1, mz1], y, top);
  }
  if (mz1 > z1 + 0.01) { bx(bag, 'brick_buff', bx0, y, z1, bx1, top, mz1); col.rect([bx0, z1, bx1, mz1], y, top); }
  if (mz0 < z0 - 0.01) { bx(bag, 'brick_buff', bx0, y, mz0, bx1, top, z0); col.rect([bx0, mz0, bx1, z0], y, top); }
  bx(bag, 'brick_buff', bx0, o.apex + 0.2, z0, bx1, top, z1); col.rect([bx0, z0, bx1, z1], o.apex + 0.2, top);
}

/**
 * The dress of a room's walls: a dado of cream tile under a lapis stripe edged with gilt, a Kufic frieze on lapis under the
 * ceiling. o = { room: [x0, z0, x1, z1], h (ceiling), doors: { W|E|N|S: [centre, width] } } (a door's span is left bare below
 * its lintel). The finish is laid on the walls' inner faces, 3.5 cm thick.
 */
export function hallFinish(bag, o) {
  const [x0, z0, x1, z1] = o.room, h = o.h, T = 0.035;
  const walls = {
    W: { a: [x0, z1], b: [x0, z0], n: [1, 0], L: z1 - z0, rect: (s0, s1, y0, y1, d0, d1) => [x0 + d0, y0, z1 - s1, x0 + d1, y1, z1 - s0] },
    E: { a: [x1, z0], b: [x1, z1], n: [-1, 0], L: z1 - z0, rect: (s0, s1, y0, y1, d0, d1) => [x1 - d1, y0, z0 + s0, x1 - d0, y1, z0 + s1] },
    N: { a: [x0, z0], b: [x1, z0], n: [0, 1], L: x1 - x0, rect: (s0, s1, y0, y1, d0, d1) => [x0 + s0, y0, z0 + d0, x0 + s1, y1, z0 + d1] },
    S: { a: [x1, z1], b: [x0, z1], n: [0, -1], L: x1 - x0, rect: (s0, s1, y0, y1, d0, d1) => [x1 - s1, y0, z1 - d1, x1 - s0, y1, z1 - d0] },
  };
  const toS = { W: (z) => z1 - z, E: (z) => z - z0, N: (x) => x - x0, S: (x) => x1 - x };
  for (const k of ['W', 'E', 'N', 'S']) {
    const w = walls[k], door = o.doors?.[k], gap = door ? [toS[k](door[0]) - door[1] / 2 - 0.08, toS[k](door[0]) + door[1] / 2 + 0.08] : null;
    const spans = gap ? [[0, gap[0]], [gap[1], w.L]] : [[0, w.L]];
    const put = (m, s0, s1, y0, y1, d0, d1) => { const r = w.rect(s0, s1, y0, y1, d0, d1); bx(bag, m, r[0], r[1], r[2], r[3], r[4], r[5]); };
    for (const [s0, s1] of spans) {
      if (s1 - s0 < 0.1) continue;
      put('tile_cream', s0, s1, 0.06, 1.15, 0, T);
      put('tile_turquoise', s0, s1, 0.5, 0.62, T, T + 0.01);
      put('tile_lapis', s0, s1, 1.15, 1.3, 0, T + 0.005);
      put('mosaic_gold', s0, s1, 1.3, 1.36, 0, T + 0.01);
    }
    // the frieze: lapis ground, gilt lines, square Kufic in white, cream and turquoise
    put('tile_lapis', 0, w.L, h - 1.5, h - 0.4, 0, T);
    put('mosaic_gold', 0, w.L, h - 1.55, h - 1.5, 0, T + 0.01); put('mosaic_gold', 0, w.L, h - 0.4, h - 0.35, 0, T + 0.01);
    bannai(bag, { a: w.a, b: w.b, n: w.n, d: T + 0.004, y: 0, s0: 0.15, s1: w.L - 0.15, v0: h - 1.35, v1: h - 0.55, kind: 'kufic', base: LAP, ink: WHI, alt: CRE, ink2: TUR, cell: 0.42, seed: 31 + k.charCodeAt(0) });
  }
}

/** A door's two leaves, open against the jambs on the room's side: wall plane at x (axis 'z', the wall runs along z) or z (axis 'x'). */
export function doorLeaves(bag, axis, at, c, w, side, h = 2.5) {
  for (const s of [-1, 1]) {
    const j = c + s * w / 2;
    if (axis === 'z') bx(bag, 'wood_dark', at, 0.04, j - 0.025, at + side * 0.75, h, j + 0.025);
    else bx(bag, 'wood_dark', j - 0.025, 0.04, at, j + 0.025, h, at + side * 0.75);
  }
}

/** The teacher's seat (kursi) of a lecture hall: a platform of three steps with a high back, a cushion; faces +x (toward the room) when yaw = 0. */
export function kursi(bag, col, x, z, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const add = (m, u0, y0, v0, u1, y1, v1) => bag.add(m, place(box(u0, y0, v0, u1, y1, v1), x, 0, z, yaw));
  add('wood_dark', 0, 0.06, -0.6, 0.95, 0.52, 0.6);
  for (let i = 0; i < 3; i++) add('wood_dark', 0.95 + i * 0.28, 0.06, -0.45, 1.23 + i * 0.28, 0.06 + (3 - i) * 0.15, 0.45);
  add('wood_painted', 0, 0.52, -0.62, 0.95, 0.58, 0.62);
  add('wood_painted', 0, 0.58, -0.62, 0.1, 2.0, 0.62);
  for (const sg of [-1, 1]) add('wood_painted', 0.1, 0.58, sg * 0.6 - (sg > 0 ? 0.05 : 0) , 0.95, 0.95, sg * 0.6 + (sg > 0 ? 0 : 0.05));
  add('wood_ochre', -0.02, 1.95, -0.7, 0.16, 2.1, 0.7);
  F.cushion(bag, x + 0.5 * c, 0.58, z - 0.5 * s, 0.8, 0.8, 0.14, yaw, 'cloth_red');
  const r = [P(-0.05, -0.62), P(1.6, 0.62)];
  col.rect([Math.min(r[0][0], r[1][0]), Math.min(r[0][1], r[1][1]), Math.max(r[0][0], r[1][0]), Math.max(r[0][1], r[1][1])], 0, 2.1);
}

/** A table-top astrolabe: a bronze disc with its rete, a pointer and the ring, standing on its foot at (x, y, z), its face toward `yaw`. */
export function astrolabe(bag, x, y, z, yaw = 0) {
  const d = lathe([[0.001, 0], [0.13, 0], [0.13, 0.012], [0.001, 0.012]], 20); d.rotateX(Math.PI / 2.6);
  bag.add('bronze', place(d, x, y + 0.13, z, yaw));
  const r = lathe([[0.04, 0], [0.04, 0.012], [0.12, 0.012], [0.12, 0]].reverse(), 20); r.rotateX(Math.PI / 2.6);
  bag.add('gilt_bronze', place(r, x, y + 0.134, z, yaw));
  bag.add('bronze', place(box(-0.03, 0, -0.02, 0.03, 0.12, 0.02), x, y, z, yaw));
  bag.add('bronze', lathe([[0.001, 0.255], [0.025, 0.262], [0.001, 0.27]], 8, null, x, y, z));
}

/** A small armillary sphere on a stand (rings of rods about an axis tilted toward the pole), at (x, y, z), radius r. */
export function armillary(bag, x, y, z, r = 0.5) {
  bag.add('wood_dark', lathe([[0.2, 0], [0.2, 0.05], [0.08, 0.1], [0.06, 0.5], [0.12, 0.55], [0.001, 0.58]], 12, null, x, y, z));
  const cy = y + 0.58 + r;
  const ring = (rad, tilt, spin, m, th) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = i / 24 * Math.PI * 2; let px = Math.cos(a) * rad, py = Math.sin(a) * rad, pz = 0;
      const y1 = py * Math.cos(tilt) - pz * Math.sin(tilt), z1 = py * Math.sin(tilt) + pz * Math.cos(tilt);
      py = y1; pz = z1;
      const x2 = px * Math.cos(spin) + pz * Math.sin(spin), z2 = -px * Math.sin(spin) + pz * Math.cos(spin);
      pts.push([x + x2, cy + py, z + z2]);
    }
    for (let i = 0; i < 24; i++) bag.add(m, rod(pts[i], pts[i + 1], th, 3));
  };
  ring(r, 0, 0, 'bronze', 0.014); ring(r, Math.PI / 2, 0, 'bronze', 0.014); ring(r, Math.PI / 2, Math.PI / 2, 'gilt_bronze', 0.014); ring(r * 0.78, 0.41, 0.6, 'bronze', 0.012);
  bag.add('bronze', rod([x, cy - r * 1.05, z], [x, cy + r * 1.05, z], 0.012, 3));
  bag.add('gilt_bronze', lathe([[0.001, -0.07], [0.07, 0], [0.001, 0.07]], 8, null, x, cy, z));
}

/** A star chart on a wall: a lapis disc ringed with gold with gilt stars; faces (nx, nz), its centre at (x, y, z). */
export function starChart(bag, x, y, z, nx, nz, r = 0.8) {
  const yaw = Math.atan2(nx, nz);
  const d1 = lathe([[0.001, 0], [r, 0], [r, 0.03], [0.001, 0.03]], 24); d1.rotateX(Math.PI / 2);
  bag.add('tile_lapis', place(d1, x, y, z, yaw));
  const d2 = lathe([[r, 0.045], [r * 1.1, 0.045], [r * 1.1, 0], [r, 0]], 24); d2.rotateX(Math.PI / 2);
  bag.add('mosaic_gold', place(d2, x, y, z, yaw));
  const d3 = lathe([[r * 0.55, 0.04], [r * 0.58, 0.04], [r * 0.58, 0.03], [r * 0.55, 0.03]], 24); d3.rotateX(Math.PI / 2);
  bag.add('mosaic_gold', place(d3, x, y, z, yaw));
  for (let i = 0; i < 16; i++) { const q = i * 2.4, rr = r * (0.15 + (i % 5) * 0.15); bag.add('mosaic_gold', place(box(-0.025, -0.025, 0.03, 0.025, 0.025, 0.045), x, y, z, yaw).translate(Math.cos(q) * rr * Math.cos(yaw), Math.sin(q) * rr, -Math.cos(q) * rr * Math.sin(yaw))); }
}

/** A book rack: a tall frame with shelves of manuscripts, its back to the wall at (x, z), facing (nx, nz), w wide. */
export function bookRack(bag, col, x, z, nx, nz, w = 1.7) {
  const yaw = Math.atan2(nx, nz), d = 0.45;
  bag.add('wood_dark', place(box(-w / 2, 0.06, 0, w / 2, 2.3, d), x, 0, z, yaw));
  for (let r = 0; r < 4; r++) {
    bag.add('wood_painted', place(box(-w / 2 + 0.04, 0.4 + r * 0.55, 0.04, w / 2 - 0.04, 0.45 + r * 0.55, d), x, 0, z, yaw));
    for (let b = 0; b < Math.floor((w - 0.2) / 0.19); b++) bag.add(b % 3 === 1 ? 'hide_brown' : b % 3 === 2 ? 'linen' : 'hide_tan', place(box(-w / 2 + 0.12 + b * 0.19, 0.45 + r * 0.55, 0.1, -w / 2 + 0.28 + b * 0.19, 0.45 + r * 0.55 + 0.22 + (b % 2) * 0.05, 0.36), x, 0, z, yaw));
  }
  const rr = [x - w / 2 * Math.abs(nz) - d * Math.max(0, -nx), z - w / 2 * Math.abs(nx) - d * Math.max(0, -nz), x + w / 2 * Math.abs(nz) + d * Math.max(0, nx), z + w / 2 * Math.abs(nx) + d * Math.max(0, nz)];
  col.rect(rr, 0, 2.3);
}

/** A hall of one domed bay centred in its room: dome, roof, wall dress. Returns { c: [x, z] (the bay's middle), apex }. */
export function domedHall(bag, col, o) {
  const [x0, z0, x1, z1] = o.room, a = (z1 - z0) / 2, c = [(x0 + x1) / 2, (z0 + z1) / 2], y = o.y ?? 5.8;
  const apex = hallDome(bag, { c, a, y, ribs: o.ribs ?? 16 });
  hallRoof(bag, col, { room: o.room, mass: o.mass, y, top: o.top, bay: { c, a }, apex });
  hallFinish(bag, { room: o.room, h: y, doors: o.doors });
  return { c, apex };
}

const lampOn = (bag, lights, x, y, z, nx, nz) => {
  bx(bag, 'wood_dark', x - 0.1 + (nx ? 0 : 0), y - 0.05, z - 0.1, x + 0.1, y - 0.01, z + 0.1);
  F.oilLamp(bag, lights, x + nx * 0.02, y, z + nz * 0.02, 'bronze', 1.2);
};
const table = (bag, col, x, z, w, d) => {
  bx(bag, 'wood_dark', x - w / 2, 0.7, z - d / 2, x + w / 2, 0.76, z + d / 2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bx(bag, 'wood_dark', x + sx * (w / 2 - 0.06) - 0.035, 0.06, z + sz * (d / 2 - 0.06) - 0.035, x + sx * (w / 2 - 0.06) + 0.035, 0.7, z + sz * (d / 2 - 0.06) + 0.035);
  col.rect([x - w / 2, z - d / 2, x + w / 2, z + d / 2], 0, 0.76);
};

/**
 * One of the two west corner halls of the madrasa, built into the empty room under its dome: o = { s (-1 north, +1 south),
 * x0, x1 (the room's west and east faces), z0, z1, door (the z of the door in its east wall), top, kind: 'lecture' | 'astronomy', cx0 (the court's west edge) }.
 */
export function cornerHall(bag, col, lights, o) {
  const { x0, x1, z0, z1, s } = o, cz = (z0 + z1) / 2, room = [x0, z0, x1, z1];
  // the east wall with its door, the floor
  wallRun(bag, col, 'plaster_persian', 'z', z0, z1, x1 + 0.4, 0.8, 0, 5.8, [[o.door, 1.5, 2.8]]);
  bx(bag, 'brick_paving', x0, 0, z0, x1, 0.06, z1);
  const dome = domedHall(bag, col, { room, mass: [x0, z0, x1 + 0.8, z1], top: o.top, doors: { E: [o.door, 1.5] } });
  doorLeaves(bag, 'z', x1, o.door, 1.5, -1);
  // lamps on little brackets, a water jar by the door
  for (const x of [x0 + 2.4, x0 + 6.4]) { lampOn(bag, lights, x, 1.6, z0 + 0.04, 0, 1); lampOn(bag, lights, x, 1.6, z1 - 0.04, 0, -1); }
  F.waterJar(bag, x1 - 0.45, 0.06, s < 0 ? z0 + 0.5 : z1 - 0.5, 0.9);
  F.mosqueLamp(bag, lights, dome.c[0], 4.0, dome.c[1], dome.apex - 0.3, { k: 1.2, glow: 4, reach: 10 });
  if (o.kind === 'lecture') {
    F.carpet(bag, (x0 + x1) / 2 + 0.3, 0.06, cz, (x1 - x0) - 2.2, (z1 - z0) - 1.0, 0, 'persian');
    kursi(bag, col, x0 + 0.04, cz, 0);
    bookRack(bag, col, x0 + 0.035, z0 + 1.0, 1, 0, 1.7); bookRack(bag, col, x0 + 0.035, z1 - 1.0, 1, 0, 1.7);
    for (let i = 0; i < 4; i++) {
      for (const sz of [-1, 1]) F.bolster(bag, x0 + 2.2 + i * 1.9, 0.07, sz < 0 ? z0 + 0.45 : z1 - 0.45, 1.2, 0.13, 0, (i + (sz > 0 ? 1 : 0)) % 2 ? 'cloth_red' : 'cloth_indigo', 'cloth_ochre');
    }
    for (const x of [x0 + 4.4, x0 + 6.4, x0 + 8.2]) for (const dz of [-1.6, 0, 1.6]) {
      F.rahle(bag, x, 0.08, cz + dz, -Math.PI / 2); F.cushion(bag, x + 0.62, 0.08, cz + dz, 0.6, 0.55, 0.12, 0.1 * dz, dz ? 'cloth_indigo' : 'cloth_maroon');
    }
  } else {
    F.carpet(bag, (x0 + x1) / 2, 0.06, cz, (x1 - x0) - 1.6, (z1 - z0) - 1.0, 0, 'persian');
    const c = dome.c;
    bag.add('marble', lathe([[0.62, 0], [0.62, 0.5], [0.46, 0.56]], 18, null, c[0], 0.06, c[1])); col.circle(c[0], c[1], 0.64, 0, 0.6);
    armillary(bag, c[0], 0.62, c[1], 0.55);
    const ts = s < 0 ? z0 + 0.55 : z1 - 0.55, tn = s < 0 ? 1 : -1;
    for (const x of [x0 + 2.4, x0 + 7.0]) {
      table(bag, col, x, ts + 0.0, 1.7, 0.8);
      astrolabe(bag, x - 0.35, 0.76, ts, s < 0 ? 0 : Math.PI);
      F.rahle(bag, x + 0.35, 0.76, ts + 0.05, 0.3, { h: 0.25 });
      bx(bag, 'linen', x + 0.05, 0.76, ts - 0.15, x + 0.35, 0.79, ts + 0.15);
      F.cushion(bag, x, 0.07, ts + tn * 0.95, 0.7, 0.55, 0.12, 0, 'cloth_indigo');
    }
    for (const dz of [-1.7, 1.7]) starChart(bag, x0 + 0.04, 2.7, cz + dz, 1, 0, 0.8);
    starChart(bag, (x0 + x1) / 2, 2.9, s < 0 ? z0 + 0.04 : z1 - 0.04, 0, tn, 0.8);
    for (const [dx, dz] of [[-2.0, -1.5], [2.0, -1.5], [-2.0, 1.5], [2.0, 1.5]]) { F.rahle(bag, c[0] + dx * 1.1, 0.08, c[1] + dz, Math.PI / 2); F.cushion(bag, c[0] + dx * 1.1 + (dx < 0 ? -0.62 : 0.62), 0.08, c[1] + dz, 0.6, 0.55, 0.12, 0.2, 'cloth_red'); }
  }
}
