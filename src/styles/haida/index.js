// Haida building of the Northwest Coast about 1850 (docs/settlements/sgang-gwaay.md §4): the cedar-plank
// house dug into the terrace, its walls of horizontal planks, a low gabled roof of long planks held down by
// poles and stones, a smoke hole at the ridge, the frontal pole standing against the front with the door
// through its foot; inside a sunk floor in tiers, four house posts under two great beams, a hearth, sleeping
// platforms with plank screens, bentwood boxes, stores hung from the rafters; the mortuary and memorial poles
// (generic beings, black and red, in sequences of our own: no crest of a real family is copied); canoes with
// their high bows, drying racks, plank and wood stacks, drift logs, a log being hollowed, sheds.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, rod, fromTriangles, hull, prism, sideprism, ellipse, board, frame, placer, rng, Matrix4 } from './util.js';
import '../qing/index.js';

const BLK = 'tar_wood', RED = 'kokowai', WHT = 'plaster_white';
const woodOf = (age, r) => (r < age ? 'planks_grey' : r < age + 0.35 ? 'timber' : 'cedar');
/** A transform for a piece placed inside a placed frame: M (outer) then (x, y, z, yaw). */
const sub = (M, x, y, z, yaw = 0) => new Matrix4().multiplyMatrices(M, frame(x, y, z, yaw));

// ── carved beings: a stack of them makes a pole ─────────────────────────────────────────
/**
 * One being cut into a pole of radius r from y0 up len, facing −z, in the frame `add` places: a body of
 * the log, the eyes and brows of the formline (black, red inside), the mouth, and what marks the being.
 * type: bird | bear | whale | human | watchman (human with the tall ringed hat).
 */
function being(add, type, y0, len, r, wood, rand) {
  const zf = -r * 0.97, t = 0.07;
  add(wood, lathe([[r, y0], [r * 1.03, y0 + len * 0.5], [r * 0.95, y0 + len], [0.001, y0 + len]], 12));
  const ey = y0 + len * 0.62, ex = r * 0.44, rx = r * 0.25, ry = r * 0.17;
  for (const s of [-1, 1]) {
    add(BLK, ellipse(s * ex, ey, rx, ry, zf - t, zf + 0.03));
    add(RED, ellipse(s * ex, ey, rx * 0.62, ry * 0.62, zf - t - 0.02, zf + 0.03));
    add(BLK, ellipse(s * ex, ey, rx * 0.25, ry * 0.3, zf - t - 0.04, zf + 0.03));
    add(BLK, board([s * r * 0.06, ey + ry * 1.55], [s * r * 0.9, ey + ry * 1.15], 0.08, zf - t, zf + 0.03));
  }
  const my = y0 + len * 0.3;
  if (type !== 'whale') {
    add(RED, board([-r * 0.55, my], [r * 0.55, my], len * 0.12, zf - t - 0.02, zf + 0.03));
    for (const dy of [-1, 1]) add(BLK, board([-r * 0.6, my + dy * len * 0.07], [r * 0.6, my + dy * len * 0.07], 0.045, zf - t - 0.03, zf + 0.03));
  }
  const q = (a) => a * len;
  if (type === 'bird') {
    // the hooked beak, red with a black edge, over the mouth's place
    const yb = y0 + len * 0.48;
    add(RED, sideprism([[-r * 0.9, yb + q(0.12)], [-r * 1.9, yb - q(0.02)], [-r * 1.95, yb - q(0.2)], [-r * 1.2, yb - q(0.34)], [-r * 0.9, yb - q(0.24)]], -r * 0.28, r * 0.28));
    add(BLK, sideprism([[-r * 1.5, yb + q(0.06)], [-r * 1.9, yb - q(0.02)], [-r * 1.95, yb - q(0.1)], [-r * 1.5, yb - q(0.02)]], -r * 0.3, r * 0.3));
    for (const s of [-1, 1]) {
      // folded wings: long boards down the sides, the ends curled out, red-edged
      add(BLK, board([s * r * 1.02, y0 + len * 0.86], [s * r * 1.12, y0 + len * 0.1], r * 0.55, -r * 0.5, r * 0.45).translate(0, 0, 0));
      add(RED, board([s * r * 1.1, y0 + len * 0.78], [s * r * 1.16, y0 + len * 0.2], r * 0.2, -r * 0.46, r * 0.36));
      for (let k = 0; k < 5; k++) add(RED, board([s * r * 0.8, y0 + len * (0.72 - k * 0.13)], [s * r * 1.35, y0 + len * (0.66 - k * 0.13)], 0.03, -r * 0.54, -r * 0.48));
    }
  } else if (type === 'bear') {
    add(wood, box(-r * 0.4, y0 + len * 0.36, -r * 1.55, r * 0.4, y0 + len * 0.58, zf + 0.1));
    add(BLK, box(-r * 0.16, y0 + len * 0.5, -r * 1.58, r * 0.16, y0 + len * 0.58, -r * 1.5));
    for (let k = -3; k <= 3; k++) add(WHT, box(k * r * 0.1 - 0.03, y0 + len * 0.3, -r * 1.5, k * r * 0.1 + 0.03, y0 + len * 0.37, -r * 1.42));
    for (const s of [-1, 1]) {
      add(wood, ellipse(s * r * 0.62, y0 + len * 0.93, r * 0.2, r * 0.2, -r * 0.45, -r * 0.1));
      add(BLK, ellipse(s * r * 0.62, y0 + len * 0.93, r * 0.11, r * 0.11, -r * 0.5, -r * 0.12));
      add(BLK, board([s * r * 0.98, y0 + len * 0.3], [s * r * 1.15, y0 + len * 0.1], r * 0.4, -r * 0.8, -r * 0.3));   // the paws
    }
  } else if (type === 'whale') {
    add(RED, board([-r * 0.7, my], [r * 0.7, my + q(0.04)], len * 0.2, zf - t - 0.03, zf + 0.03));
    add(BLK, board([-r * 0.7, my + q(0.1)], [r * 0.7, my + q(0.1)], 0.06, zf - t - 0.04, zf + 0.03));
    add(BLK, sideprism([[-r * 0.1, y0 + len * 0.96], [-r * 0.28, y0 + len * 1.42], [r * 0.45, y0 + len * 0.96]], -0.07, 0.07));   // the tall fin
    add(RED, ellipse(0, y0 + len * 0.88, r * 0.1, r * 0.06, -r * 0.1, r * 0.05));
    for (const s of [-1, 1]) add(BLK, board([s * r * 1.0, y0 + len * 0.55], [s * r * 1.5, y0 + len * 0.2], r * 0.38, -r * 0.4, -r * 0.05));   // the flippers
  } else if (type === 'frog') {
    // a very wide flat mouth, the eyes standing up on top of the head, the hands with spread fingers on the chest
    add(RED, board([-r * 0.95, my], [r * 0.95, my], len * 0.1, zf - t - 0.04, zf + 0.03));
    for (const s of [-1, 1]) {
      add(wood, ellipse(s * ex, ey + ry * 1.5, rx * 0.9, ry * 1.0, zf - 0.16, zf + 0.04)); add(BLK, ellipse(s * ex, ey + ry * 1.5, rx * 0.45, ry * 0.5, zf - 0.19, zf + 0.0));
      for (let k = 0; k < 3; k++) add(BLK, board([s * (r * 0.5 + k * r * 0.14), y0 + len * 0.2], [s * (r * 0.58 + k * r * 0.22), y0 + len * 0.06], 0.05, zf - 0.08, zf + 0.03));
    }
  } else if (type === 'beaver') {
    // the two great incisors under the nose, the scaled tail hanging down the chest
    add(wood, box(-r * 0.3, y0 + len * 0.45, -r * 1.3, r * 0.3, y0 + len * 0.6, zf + 0.1));
    for (const s of [-1, 1]) add(WHT, box(s * r * 0.02 + (s > 0 ? 0 : -r * 0.2), y0 + len * 0.12, zf - 0.14, s * r * 0.02 + (s > 0 ? r * 0.2 : 0), y0 + len * 0.31, zf - 0.04));
    add(BLK, board([0, y0 + len * 0.02], [0, y0 + len * 0.12], r * 0.9, zf - 0.1, zf - 0.02));
    for (let k = 0; k < 4; k++) add(RED, board([-r * 0.4, y0 + len * (0.025 + k * 0.025)], [r * 0.4, y0 + len * (0.025 + k * 0.025)], 0.02, zf - 0.11, zf - 0.02));
  } else {
    add(wood, box(-r * 0.13, y0 + len * 0.42, -r * 1.25, r * 0.13, y0 + len * 0.66, zf + 0.1));                 // the nose
    for (const s of [-1, 1]) {
      add(BLK, board([s * r * 0.92, y0 + len * 0.42], [s * r * 0.5, y0 + len * 0.18], r * 0.3, -r * 0.95, -r * 0.5));   // the arms folded to the chest
      add(RED, ellipse(s * r * 0.46, y0 + len * 0.16, r * 0.16, r * 0.1, -r * 1.0, -r * 0.7));
    }
    if (type === 'watchman') {
      // the tall hat of stacked rings
      for (let k = 0; k < 5; k++) add(k % 2 ? BLK : 'planks_grey', lathe([[r * (0.5 - k * 0.04), 0], [r * (0.62 - k * 0.04), 0.05], [r * (0.5 - k * 0.04), 0.3]], 12, null, 0, y0 + len + k * 0.28, 0));
    }
  }
  // weathering: dark cracks down the back and sides of the log, a collar of moss at the foot of some beings
  const rr = rand;
  for (let k = 0; k < 3; k++) {
    const a = 1.0 + rr() * 1.7, sg = rr() < 0.5 ? -1 : 1, x = Math.sin(a) * r * 0.98 * sg, z = -Math.cos(a) * r * 0.98, ya = y0 + len * (0.05 + rr() * 0.4);
    add('wood_dark', box(x - 0.012, ya, z - 0.012, x + 0.012, ya + len * (0.25 + rr() * 0.3), z + 0.012));
  }
  if (rr() < 0.35) add('sod', lathe([[r * 1.07, y0], [r * 1.07, y0 + 0.1], [r * 0.99, y0 + 0.14], [r * 0.99, y0]], 12));
}

const KINDS = ['bear', 'bird', 'whale', 'human', 'bird', 'bear', 'frog', 'beaver'];
/** The pole's beings from y0 up to y0 + total, the sequence from the seed; the top one the watchman or a bird. */
function carved(add, y0, total, r0, r1, wood, seed, topHat = true) {
  const rand = rng(seed), n = Math.max(2, Math.round(total / 1.9)), len = total / n;
  let last = -1;
  for (let k = 0; k < n; k++) {
    let t = Math.floor(rand() * KINDS.length); if (t === last) t = (t + 2) % KINDS.length; last = t;
    const type = k === n - 1 && topHat ? 'watchman' : KINDS[t], r = r0 + (r1 - r0) * (k + 0.5) / n;
    being(add, type, y0 + k * len, len, r, wood, rand);
  }
}

// ── the house ───────────────────────────────────────────────────────────────────────────
/**
 * haida_house: { c: [x, z], yaw, w (across), d (deep), age (0 new … 1 old), ridge, eave (m over the terrace g),
 * seed, g (the terrace's height), landmark, tiers (the floor tiers from the layout, only the landmark) }. Local frame: u across,
 * v deep, the front at −v. The wall planks run horizontally, in courses; the door is the oval through the frontal
 * pole's foot, a way through the front wall behind it. The landmark's is open and furnished; the others' door is
 * closed with a dark board (their insides stay empty).
 */
function house(el, ctx) {
  const { bag, col, lights } = ctx, rand = rng(el.seed), g = el.g ?? 1, M = frame(el.c[0], 0, el.c[1], el.yaw), add = placer(bag, M);
  const cs = Math.cos(el.yaw), sn = Math.sin(el.yaw), W = (u, v) => [el.c[0] + u * cs + v * sn, el.c[1] - u * sn + v * cs];
  const segL = (a, b, th, y0, y1) => col.segment(W(...a), W(...b), th, y0, y1);
  const circL = (u, v, r, y0, y1) => { const [x, z] = W(u, v); col.circle(x, z, r, y0, y1); };
  const rectL = (u0, v0, u1, v1, y0, y1) => { const a = W(u0, v0), b = W(u1, v1); col.rect([a[0], a[1], b[0], b[1]], y0, y1); };
  const floorL = (r, y) => { const a = W(r[0], r[1]), b = W(r[2], r[3]); col.floor([a[0], a[1], b[0], b[1]], y); };
  const hw = el.w / 2, hd = el.d / 2, wt = 0.65, R = hw + 0.7, ridgeY = g + el.ridge, eaveY = g + el.eave;
  const K = (ridgeY - eaveY) / R, yAt = (u) => ridgeY - Math.abs(u) * K;
  const yTop = yAt(hw) - 0.1, y0 = -0.3, ch = 0.32, nC = Math.ceil((yTop - y0) / ch);
  const doorK = Math.ceil((g + 2.3 - y0) / ch), doorTop = y0 + doorK * ch, dw = 0.5;
  // the wall planks: courses, each a little proud of the one below
  for (let c = 0; c < nC; c++) {
    const a = y0 + c * ch, b = Math.min(yTop, a + ch - 0.015), m = woodOf(el.age, rand()), o = (c % 2) * 0.03;
    for (const s of [-1, 1]) add(m, box(s > 0 ? hw - wt : -hw - o, a, -hd + wt, s > 0 ? hw + o : -hw + wt, b, hd - wt));
    // the back wall whole; the front with the doorway through it
    add(m, box(-hw - o, a, hd - wt, hw + o, b, hd + o));
    if (c < doorK) { add(m, box(-hw - o, a, -hd - o, -dw, b, -hd + wt)); add(m, box(dw, a, -hd - o, hw + o, b, -hd + wt)); }
    else add(m, box(-hw - o, a, -hd - o, hw + o, b, -hd + wt));
  }
  // the gable ends over the walls: a triangle of boards, split by thin battens
  for (const s of [-1, 1]) {
    const v0 = s > 0 ? hd - wt : -hd, v1 = s > 0 ? hd : -hd + wt;
    add(woodOf(el.age, rand()), prism([[-hw, yTop - 0.02], [hw, yTop - 0.02], [0, ridgeY - 0.1]], v0, v1));
    for (let u = -hw + 1.3; u < hw - 0.5; u += 1.15) add('wood_dark', box(u - 0.025, yTop, s > 0 ? hd : -hd - 0.03, u + 0.025, Math.min(yAt(u) - 0.16, yTop + 2), s > 0 ? hd + 0.03 : -hd));
  }
  // the roof: long planks laid up the slope, the front and back eaves reaching 0.9 m past the walls;
  // over the hearth the smoke hole is cut in the landmark's (1.4 m across the ridge by 2.6 m along it)
  const vF = -hd - 0.9, vB = hd + 0.9, hole = el.tiers ? { u: 1.5, v: 1.3 } : null;
  const slab = (s, u0, u1, v0, v1, m) => add(m, prism([[s * u0, yAt(u0) + 0.04], [s * u1, yAt(u1) + 0.04], [s * u1, yAt(u1) - 0.1], [s * u0, yAt(u0) - 0.1]], v0, v1));
  for (const s of [-1, 1]) {
    const m = woodOf(el.age, rand());
    if (hole) { slab(s, 0, R, vF, -hole.v, m); slab(s, 0, R, hole.v, vB, m); slab(s, hole.u, R, -hole.v, hole.v, m); }
    else slab(s, 0, R, vF, vB, m);
    // the plank edges: thin lines up the slope every 0.55 m, and the weighting poles across with their stones
    for (let v = vF + 0.3; v < vB - 0.2; v += 0.55) {
      if (hole && Math.abs(v) < hole.v) continue;
      add('wood_dark', prism([[s * 0.3, yAt(0.3) + 0.045], [s * (R - 0.05), yAt(R - 0.05) + 0.045], [s * (R - 0.05), yAt(R - 0.05) + 0.075], [s * 0.3, yAt(0.3) + 0.075]], v, v + 0.03));
    }
    for (const v of [vF + 0.6, vF + 3.3, 0, vB - 3.3, vB - 0.6].filter((q) => !hole || Math.abs(q) > hole.v + 0.3 || q === 0 ? !hole || Math.abs(q) > hole.v : true)) {
      const a = [s * 0.7, yAt(0.7) + 0.2, v], b = [s * (R - 0.2), yAt(R - 0.2) + 0.2, v];
      add('log_pine', rod(a, b, 0.07, 6));
      for (let u = 1.5; u < R - 0.5; u += 2.1 + rand()) add('rock_boulder', lathe([[0.26, 0], [0.22, 0.12], [0.001, 0.2]], 6, null, s * u, yAt(u) + 0.2, v + (rand() - 0.5) * 0.2));
    }
  }
  add('log_pine', rod([0, ridgeY + 0.08, vF], [0, ridgeY + 0.08, vB], 0.1, 6));
  if (hole) {
    // the smoke hole's shutter, a board on a pole propped at the east side, and its rope
    add('timber', board([hole.u + 0.2, yAt(hole.u + 0.2) + 0.1], [hole.u + 1.5, yAt(hole.u + 1.5) + 0.7], 0.06, -hole.v + 0.1, hole.v - 0.1));
    add('rope_fibre', rod([hole.u + 1.4, yAt(hole.u + 1.4) + 0.6, 0.6], [hole.u + 2.6, yAt(hole.u + 2.6) + 0.1, 0.9], 0.02, 4));
  } else {
    add('lacquer_black', box(0.1, ridgeY - 0.04, -0.9, 1.2, ridgeY + 0.04, 0.9));
    add('timber', board([0.9, ridgeY + 0.04], [1.7, ridgeY + 0.6], 0.05, -0.9, 0.9));
  }
  // the frontal pole, set against the front: 1.6 m through, the door an oval through its foot
  const pz = -hd - 0.15 - 0.8, pw = 0.8, wood = woodOf(el.age, rand()), P = sub(M, 0, g, pz, 0), padd = placer(bag, P);
  const lint = 2.1, top = 2.95;
  for (const s of [-1, 1]) {
    padd(wood, box(s > 0 ? dw : -pw, 0, -0.8, s > 0 ? pw : -dw, top, 0.8));
    padd(BLK, ellipse(s * 0.66, 1.55, 0.13, 0.2, -0.86, -0.78)); padd(RED, ellipse(s * 0.66, 1.55, 0.07, 0.12, -0.9, -0.78));
    padd(BLK, ellipse(s * 0.66, 0.7, 0.12, 0.17, -0.86, -0.78)); padd(RED, ellipse(s * 0.66, 0.7, 0.06, 0.1, -0.9, -0.78));
  }
  padd(wood, box(-pw, lint, -0.8, pw, top, 0.8));
  padd(BLK, board([-0.7, 2.5], [0.7, 2.5], 0.2, -0.86, -0.78)); padd(RED, board([-0.5, 2.5], [0.5, 2.5], 0.09, -0.9, -0.78));
  carved(padd, top, el.landmark ? 7.6 : (el.pole ?? 5.8) , 0.72, 0.55, wood, el.seed * 7 + 3);
  for (const s of [-1, 1]) rectL(s > 0 ? dw : -pw, pz - 0.8, s > 0 ? pw : -dw, pz + 0.8, g, g + top);
  houseFront(el, { bag, add, col, W, segL, rectL, rand, hw, hd, g, yTop, ridgeY, eaveY, R, vF, vB, yAt, hole, pz, dw, pw });
  // the doorway's floor board and the dark board that shuts it in the other houses
  if (!el.tiers) { add('lacquer_black', box(-dw, 0, -hd, dw, doorTop, -hd + 0.12)); segL([-dw, -hd + 0.05], [dw, -hd + 0.05], 0.1, -0.3, doorTop); }
  // the walls' colliders (the doorway left open in the landmark)
  const wl = (a, b) => segL(a, b, wt, -0.3, yTop);
  wl([-hw + wt / 2, -hd], [-hw + wt / 2, hd]); wl([hw - wt / 2, -hd], [hw - wt / 2, hd]);
  wl([-hw, hd - wt / 2], [hw, hd - wt / 2]);
  wl([-hw, -hd + wt / 2], [-dw, -hd + wt / 2]); wl([dw, -hd + wt / 2], [hw, -hd + wt / 2]);
  if (!el.tiers) return;

  // ── the landmark's inside ────────────────────────────────────────────────────────────────
  const T = el.tiers, yL = g - 0.4, yLo = g - 0.8, yP = g - 1.2;
  const slabs = (rs, y, m) => { for (const r of rs) { add(m, box(r[0], y - 0.4, r[1], r[2], y, r[3])); floorL(r, y); } };
  slabs(T.ledge, yL, 'timber'); slabs(T.low, yLo, 'planks_grey');
  floorL([-dw, -hd, dw, -hd + 0.4], g); add('timber', box(-dw, g - 0.1, -hd - 0.05, dw, g, -hd + 0.4));          // the sill
  // the pit's floor of beaten earth is the ground itself; the hearth: a ring of boulders, the fire, the stacked wood
  const hs = 1.1;
  for (const [a, b, c2, d] of [[-hs, -hs, hs, -hs + 0.28], [-hs, hs - 0.28, hs, hs], [-hs, -hs, -hs + 0.28, hs], [hs - 0.28, -hs, hs, hs]]) add('rock_boulder', box(a, yP, b, c2, yP + 0.34, d));
  add('flame', lathe([[0.28, 0], [0.22, 0.2], [0.001, 0.5]], 7, null, 0, yP + 0.05, 0)); add('wood_dark', box(-0.5, yP, -0.12, 0.5, yP + 0.14, 0.12));
  for (let k = 0; k < 8; k++) add('log_pine', rod([-hs - 0.9 + (k % 2) * 0.05, yP + 0.14 + Math.floor(k / 2) * 0.14, -hs + 0.3 * k * 0.3 - 0.3], [-hs - 0.9 + (k % 2) * 0.05, yP + 0.14 + Math.floor(k / 2) * 0.14, -hs + 0.3 * k * 0.3 + 0.8], 0.06, 6));
  if (lights) { const [lx, lz] = W(0, 0); lights.push({ at: [lx, yP + 0.7, lz], color: '#ff9a4a', intensity: 3.4, distance: 9 }); const [hx, hz] = W(2.2, 0); lights.push({ at: [hx, g + 3.6, hz], color: '#d9e4f2', intensity: 1.0, distance: 7 }); }
  // the four house posts, each carved with a being facing the fire, under the two beams along the house
  const hwI = hw - 0.4, hdI = hd - 0.4;
  const pu = el.landmark ? 3.5 : hwI * 0.47, pv = el.landmark ? 3.25 : hdI * 0.5, bY = yAt(pu) - 0.45;
  for (const [su, sv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const Q = sub(M, su * pu, 0, sv * pv, 0);
    placer(bag, Q)(woodOf(el.age, 0.5), lathe([[0.46, yP], [0.43, bY - 0.2], [0.001, bY - 0.2]], 12));
    being(placer(bag, sub(M, su * pu, 0, sv * pv, (su > 0 ? Math.PI / 2 : -Math.PI / 2))), sv < 0 ? 'bear' : 'human', yP + 1.1, 2.1, 0.46, woodOf(el.age, 0.2), rand);
    circL(su * pu, sv * pv, 0.48, yP, bY);
  }
  for (const s of [-1, 1]) {
    add('timber', rod([s * pu, bY, -hd + 0.3], [s * pu, bY, hd - 0.3], 0.3, 8));
    const pp = Math.min(pu + 2.7, hw - 0.9);
    add('timber', rod([s * pp, yAt(pp) - 0.3, -hd + 0.3], [s * pp, yAt(pp) - 0.3, hd - 0.3], 0.17, 7));
  }
  add('timber', rod([0, ridgeY - 0.35, -hd + 0.3], [0, ridgeY - 0.35, hd - 0.3], 0.16, 7));
  for (const v of [-pv, pv]) add('timber', rod([-pu, bY, v], [pu, bY, v], 0.2, 7));
  // the sleeping places: platforms on the ledge along the left, right and back, divided by upright plank screens;
  // mats and hides on them; the chief's quarter behind the painted screen at the back
  const beds = [[-hwI, -hdI + 1.5, -hwI + 1.5, hdI - 2.0], [hwI - 1.5, -hdI + 1.5, hwI, hdI - 2.0]];
  for (const [u0, v0, u1, v1] of beds) {
    add('timber', box(u0, yL, v0, u1, yL + 0.3, v1)); rectL(u0, v0, u1, v1, yL, yL + 0.3);
    const n = 4, L = (v1 - v0) / n;
    for (let k = 0; k < n; k++) {
      const va = v0 + k * L, vb = va + L;
      add(k % 2 ? 'hide_brown' : 'reed_mat', box(u0 + 0.05, yL + 0.3, va + 0.1, u1 - 0.05, yL + 0.36, vb - 0.1));
      if (rand() < 0.7) add(rand() < 0.5 ? 'hide_tan' : 'hide_grey', box(u0 + 0.2, yL + 0.36, va + 0.3, u1 - 0.4, yL + 0.44, vb - 0.4));
      if (k) { add('cedar', box(u0, yL + 0.3, va - 0.04, u1, yL + 1.9, va + 0.04)); rectL(u0, va - 0.04, u1, va + 0.04, yL + 0.3, yL + 1.9); }
      add('cloth_ochre', box(u0 + 0.04 + (k % 2) * 0.2, yL + 1.0, va + 0.2, u0 + 0.1 + (k % 2) * 0.2, yL + 1.8, va + 0.6));          // a cape on a peg
    }
  }
  // the screen and the chief's room
  const sv = hdI - 2.05, sh = 3.0;
  const door = [-0.5, 0.5];
  add('cedar', box(-hwI + 1.5, yL, sv - 0.06, door[0], yL + sh, sv + 0.06)); add('cedar', box(door[1], yL, sv - 0.06, hwI - 1.5, yL + sh, sv + 0.06));
  add('cedar', box(door[0], yL + 2.1, sv - 0.06, door[1], yL + sh, sv + 0.06));
  rectL(-hwI + 1.5, sv - 0.06, door[0], sv + 0.06, yL, yL + sh); rectL(door[1], sv - 0.06, hwI - 1.5, sv + 0.06, yL, yL + sh);
  // the painted front of the screen (toward −v): two black eyes of the formline with red, and a red band
  const spw = hwI - 1.5, sr = rng(el.seed + 5), design = el.landmark ? 0 : Math.floor(sr() * 3);
  for (const s of [-1, 1]) {
    const cx = s * spw * 0.55, face = (m, e) => add(m, e.translate(0, 0, 0));
    if (design === 0) {
      face(BLK, ellipse(cx, yL + 1.9, 0.8, 0.5, sv - 0.09, sv - 0.055)); face(RED, ellipse(cx, yL + 1.9, 0.5, 0.3, sv - 0.1, sv - 0.055)); face(BLK, ellipse(cx, yL + 1.9, 0.18, 0.18, sv - 0.11, sv - 0.055));
      face(RED, board([s * spw * 0.1, yL + 0.6], [s * spw * 0.97, yL + 0.6], 0.5, sv - 0.09, sv - 0.055));
    } else if (design === 1) {
      // a pair of broad ovoids with a red field between them, the lower band black
      face(RED, ellipse(cx, yL + 1.7, 0.95, 0.75, sv - 0.09, sv - 0.055)); face(BLK, ellipse(cx, yL + 1.7, 0.6, 0.42, sv - 0.1, sv - 0.055)); face(RED, ellipse(cx, yL + 1.7, 0.22, 0.2, sv - 0.11, sv - 0.055));
      face(BLK, board([s * spw * 0.1, yL + 0.5], [s * spw * 0.97, yL + 0.5], 0.4, sv - 0.09, sv - 0.055));
    } else {
      // a black field with a red crescent-brow and two small eyes
      face(BLK, box(cx - 1.0, yL + 0.9, sv - 0.09, cx + 1.0, yL + 2.5, sv - 0.055)); face(RED, board([cx - 0.8, yL + 2.1], [cx + 0.8, yL + 2.1], 0.2, sv - 0.1, sv - 0.055));
      face(RED, ellipse(cx - 0.35, yL + 1.6, 0.2, 0.15, sv - 0.1, sv - 0.055)); face(RED, ellipse(cx + 0.35, yL + 1.6, 0.2, 0.15, sv - 0.1, sv - 0.055));
    }
  }
  add('timber', box(-hwI + 1.5, yL, sv + 0.2, hwI - 1.5, yL + 0.3, hdI)); rectL(-hwI + 1.5, sv + 0.2, hwI - 1.5, hdI, yL, yL + 0.3);
  add('hide_brown', box(-hwI + 1.9, yL + 0.3, sv + 0.4, 0, yL + 0.4, hdI - 0.2));
  // pigments (red ochre, black) and the grinding stone by the screen; the carved dish
  add(RED, lathe([[0.1, 0], [0.08, 0.08], [0.001, 0.1]], 8, null, 1.3, yL + 0.3, sv + 0.6)); add(BLK, lathe([[0.1, 0], [0.08, 0.08], [0.001, 0.1]], 8, null, 1.6, yL + 0.3, sv + 0.7));
  add('rock_boulder', box(2.0, yL + 0.3, sv + 0.45, 2.45, yL + 0.37, sv + 0.8));
  // bentwood boxes along the walls and the back; painted, the lids carved
  const boxAt = (u, v, yy, w, d, hh, yaw2) => {
    const B = placer(bag, sub(M, u, yy, v, yaw2)); B('cedar', box(-w / 2, 0, -d / 2, w / 2, hh, d / 2));
    B(BLK, box(-w / 2 + 0.06, hh * 0.35, -d / 2 - 0.015, w / 2 - 0.06, hh * 0.85, -d / 2)); B(RED, ellipse(0, hh * 0.6, w * 0.22, hh * 0.18, -d / 2 - 0.03, -d / 2 - 0.005));
    B('timber', box(-w / 2 - 0.02, hh, -d / 2 - 0.02, w / 2 + 0.02, hh + 0.04, d / 2 + 0.02));
  };
  for (let k = 0; k < 9; k++) {
    const side = k % 2 ? 1 : -1, v = -hdI + 2.0 + (k >> 1) * 1.7 + rand() * 0.3, u = side * (hwI - 0.45), yy = yL + 0.36;
    boxAt(u, v, yy, 0.8, 0.5, 0.55, side > 0 ? Math.PI / 2 : -Math.PI / 2);
    if (k % 3 === 0) boxAt(u, v, yy + 0.6, 0.65, 0.45, 0.45, side > 0 ? Math.PI / 2 : -Math.PI / 2);
    rectL(u - 0.3, v - 0.4, u + 0.3, v + 0.4, yy, yy + 0.6);
  }
  for (const u of el.landmark ? [-2.2, 1.6, 3.4] : [-2.2, 1.6]) boxAt(u, hdI - 0.45, yL + 0.3, 0.9, 0.55, 0.6, Math.PI);
  // baskets, a carved dish, floats, hats on pegs; and the store hung under the roof: strings of dried halibut and salmon
  for (const [u, v] of [[-hwI + 0.7, -hdI + 1.7], [hwI - 0.7, hdI - 3.3], [hwI - 0.75, -hdI + 0.5]]) add('wicker', lathe([[0.2, 0], [0.28, 0.2], [0.26, 0.4], [0.001, 0.4]], 9, null, u, yL, v));
  for (const [u, v] of [[-pu * 0.9, pv * 1.15], [pu * 0.86, -pv * 1.08], [-pu * 0.92, 0.2]]) {
    for (let k = 0; k < 7; k++) {
      const fy = bY - 0.2 - rand() * 0.4, fu = u + (k - 3) * 0.17, fv = v + (rand() - 0.5) * 0.3;
      add('rope_fibre', rod([fu, bY - 0.05, fv], [fu, fy + 0.25, fv], 0.012, 3));
      add(k % 3 ? 'hide_tan' : 'hide_brown', ellipse(fu, fy, 0.07, 0.3, fv - 0.02, fv + 0.02, 8));
    }
  }
  for (const s of [-1, 1]) add('rope_fibre', rod([s * 2.0, bY, -1.3], [s * 2.0, bY - 0.5, -1.3], 0.012, 3));
  houseLife(el, { bag, col, add, M, W, rectL, rand, hwI, hdI, yL, yLo, yP, bY, yAt, hole, hw, hd, g });
  void yLo; void yP;
}

// ── the house's front and its weathering: paint, bench, moss, stains, the pole's stones ───────────────────────
/** The outside of a house in the rain: moss at the foot of the walls and in patches on the roof planks (the damper, the older), dark drips
 * under the eaves and from the roof edge, a painted formline panel on some fronts (generic ovoids and bands), a plank bench by the door
 * with the things hung over it, stones about the frontal pole's foot. [inferred: the wet climate; the dossier §5] */
function houseFront(el, { bag, add, col, W, segL, rectL, rand, hw, hd, g, yTop, ridgeY, eaveY, R, vF, vB, yAt, hole, pz, dw, pw }) {
  const fr = rng(el.seed * 13 + 5), age = el.age ?? 0.5;
  // moss and mud at the foot of the walls: patches, thicker at the older houses
  const foot = (u0, v0, u1, v1) => add('sod', box(u0, g - 0.08, v0, u1, g + 0.22 + 0.2 * fr() * age, v1));
  for (let k = 0; k < 6; k++) {
    const u = -hw + 0.8 + fr() * (el.w - 2.2), l = 0.8 + fr() * 1.6;
    if (fr() < 0.55 + age * 0.3) { if (Math.abs(u) > dw + 0.3) foot(Math.max(-hw, u), -hd - 0.045, Math.min(hw, u + l), -hd - 0.025); }
    if (fr() < 0.7) foot(Math.max(-hw, u), hd + 0.025, Math.min(hw, u + l), hd + 0.045);
  }
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const v = -hd + 0.6 + fr() * (el.d - 2), l = 1 + fr() * 1.8; if (fr() < 0.7) foot(...(s > 0 ? [hw + 0.025, v, hw + 0.045, Math.min(hd, v + l)] : [-hw - 0.045, v, -hw - 0.025, Math.min(hd, v + l)])); }
  // the stains: dark drips down the boards under the eave and the gable's edge
  for (let k = 0; k < 9; k++) {
    const u = (fr() - 0.5) * (el.w - 1), l = 0.5 + fr() * 1.5, y1 = g + 2.55 - fr() * 0.3;
    if (Math.abs(u) < pw + 0.1) continue;
    add('wood_dark', box(u - 0.04, y1 - l, -hd - 0.07, u + 0.04, y1, -hd - 0.04));
    if (k < 5) add('wood_dark', box(u - 0.05, y1 - l, hd + 0.04, u + 0.05, y1, hd + 0.07));
  }
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const v = -hd + 0.8 + fr() * (el.d - 1.6), l = 0.5 + fr() * 1.2, y1 = g + 2.6; add('wood_dark', box(s > 0 ? hw + 0.04 : -hw - 0.07, y1 - l, v - 0.05, s > 0 ? hw + 0.07 : -hw - 0.04, y1, v + 0.05)); }
  // moss on the roof planks, in patches (not about the smoke hole)
  const nm = 3 + Math.round(age * 4 + fr() * 3);
  for (const s of [-1, 1]) for (let k = 0; k < nm; k++) {
    const u0 = 0.8 + fr() * (R - 2.6), u1 = u0 + 0.6 + fr() * 1.2, v0 = vF + 0.3 + fr() * (vB - vF - 2), v1 = v0 + 0.5 + fr() * 1.3;
    if (hole && v1 > -hole.v - 0.3 && v0 < hole.v + 0.3) continue;
    add('sod', prism([[s * u0, yAt(u0) + 0.045], [s * Math.min(u1, R - 0.1), yAt(Math.min(u1, R - 0.1)) + 0.045], [s * Math.min(u1, R - 0.1), yAt(Math.min(u1, R - 0.1)) + 0.085], [s * u0, yAt(u0) + 0.085]], v0, Math.min(v1, vB - 0.05)));
  }
  // the painted front on most houses: formline ovoids and bands each side of the pole, generic and different in each
  const ptype = Math.floor(fr() * 5);
  if (ptype < 3) {
    const yc = g + 1.7, zf = -hd - 0.075, zb = -hd - 0.04, ux = Math.min(hw - 1.6, 2.2 + fr() * 1.2);
    for (const s of [-1, 1]) {
      const cx = s * ux;
      if (ptype === 0) { add(BLK, ellipse(cx, yc, 0.7, 0.45, zf, zb)); add(RED, ellipse(cx, yc, 0.44, 0.27, zf - 0.015, zb)); add(BLK, ellipse(cx, yc, 0.15, 0.15, zf - 0.03, zb)); add(RED, board([s * 1.3, yc - 0.85], [s * (ux + 1.0), yc - 0.85], 0.28, zf, zb)); }
      else if (ptype === 1) { add(RED, box(cx - 0.8, yc - 0.6, zf, cx + 0.8, yc + 0.6, zb)); add(BLK, ellipse(cx, yc, 0.5, 0.36, zf - 0.015, zb)); add(RED, ellipse(cx, yc, 0.18, 0.16, zf - 0.03, zb)); }
      else { add(BLK, board([s * 1.3, yc + 0.5], [s * (ux + 0.9), yc + 0.8], 0.3, zf, zb)); add(RED, ellipse(cx, yc - 0.1, 0.4, 0.3, zf, zb)); add(BLK, ellipse(cx, yc - 0.1, 0.17, 0.17, zf - 0.015, zb)); }
    }
  }
  // the bench: a thick plank on two blocks, either side of the door, a cape or a mat over it, a basket under it
  for (const s of [-1, 1]) {
    if (fr() < 0.35) continue;
    const u0 = s * (2.3 + fr() * 0.6), L = 1.5 + fr() * 0.7, ua = Math.min(u0, u0 + s * L), ub = Math.max(u0, u0 + s * L), vb = -hd - 0.5;
    add('cedar', box(ua, g + 0.45, vb - 0.17, ub, g + 0.5, vb + 0.17)); add('timber', box(ua + 0.1, g, vb - 0.12, ua + 0.3, g + 0.45, vb + 0.12)); add('timber', box(ub - 0.3, g, vb - 0.12, ub - 0.1, g + 0.45, vb + 0.12));
    if (fr() < 0.6) add(fr() < 0.5 ? 'roof_bark' : 'cloth_brown', box(ua + 0.2, g + 0.455, vb - 0.15, ub - 0.2, g + 0.47, vb + 0.15));
    if (fr() < 0.5) add('wicker', lathe([[0.15, 0], [0.2, 0.14], [0.18, 0.26], [0.001, 0.26]], 8, null, (ua + ub) / 2, g, vb));
    const a = W(ua, vb - 0.2), b = W(ub, vb + 0.2); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], g, g + 0.5);
  }
  // pegs on the front wall with a cape, a net, a pair of paddles
  for (const s of [-1, 1]) if (fr() < 0.6) {
    const u = s * (hw * 0.62 + fr() * 0.6), kind = Math.floor(fr() * 3);
    if (kind === 0) add('roof_bark', box(u - 0.28, g + 1.0, -hd - 0.1, u + 0.28, g + 1.9, -hd - 0.06));
    else if (kind === 1) { add('rope_fibre', ellipse(u, g + 1.5, 0.4, 0.55, -hd - 0.09, -hd - 0.06, 8)); add('timber', rod([u - 0.5, g + 2.05, -hd - 0.1], [u + 0.5, g + 2.05, -hd - 0.1], 0.02, 4)); }
    else for (const d of [-0.12, 0.12]) { add('timber', rod([u + d, g + 0.1, -hd - 0.1], [u + d * 2, g + 2.0, -hd - 0.1], 0.025, 5)); add('cedar', box(u + d - 0.07, g + 0.1, -hd - 0.12, u + d + 0.07, g + 0.7, -hd - 0.09)); }
  }
  // stones about the frontal pole's foot, moss between them
  for (let k = 0; k < 6; k++) {
    const a = k * 1.05 + fr() * 0.4, rr = 0.95 + fr() * 0.2;
    add('rock_boulder', lathe([[0.3, 0], [0.26, 0.15], [0.001, 0.26]], 6, null, Math.cos(a) * rr * 0.9, g, pz + Math.sin(a) * rr));
  }
  add('sod', lathe([[1.1, 0], [1.0, 0.05], [0.001, 0.07]], 12, null, 0, g, pz));
  void segL; void rectL; void rand; void ridgeY; void eaveY; void yTop;
}

// ── what the house holds: the work of its families, by seed ──────────────────────────────────────
/**
 * The goods and tools of a winter house in the places the floor leaves free (the low platform along the sides, the landing by the
 * door, the front corners of the ledge), a different set in each house: looms, cooking boxes with their hot stones, drums, paddles,
 * bark, hides on frames, baskets, a cradle, a dog's bed, the speaker's staff and hat (the landmark's); mats hung on the walls and the
 * soot that darkens the roof boards over the fire. [inferred: the work done in the houses (weaving, steaming, carving, hide work)]
 */
function houseLife(el, { bag, col, add, M, W, rectL, rand, hwI, hdI, yL, yLo, yP, bY, yAt, hole, hw, hd, g }) {
  const kr = rng(el.seed * 3 + 11), S = (u, v, y, yaw = 0) => placer(bag, sub(M, u, y, v, yaw));
  const bowl = (B, x, y, z, r, m = 'cedar') => B(m, lathe([[r, 0], [r * 1.05, r * 0.5], [r * 0.9, r * 0.55], [0.001, r * 0.2]], 9, null, x, y, z));
  const loom = (u, v, s) => {
    const B = S(u, v, yLo, s > 0 ? Math.PI / 2 : -Math.PI / 2);
    for (const dx of [-0.5, 0.5]) B('cedar', rod([dx, 0, 0], [dx, 1.5, 0], 0.035, 5));
    B('cedar', rod([-0.55, 1.5, 0], [0.55, 1.5, 0], 0.03, 5)); B('cedar', rod([-0.55, 0.45, 0], [0.55, 0.45, 0], 0.03, 5));
    for (let k = 0; k < 11; k++) { const x = -0.45 + k * 0.09; B('rope_fibre', rod([x, 1.48, 0], [x, 0.5 - (k % 3) * 0.1, 0], 0.006, 3)); }
    B('wicker', box(-0.45, 0.55, -0.01, 0.45, 1.0, 0.012)); B('cloth_brown', box(-0.45, 0.55, -0.011, 0.45, 0.62, 0.013));
    B('reed_mat', box(-0.5, 0.0, -0.7, 0.5, 0.04, -0.3)); bowl(B, 0.55, 0, -0.5, 0.14, 'wicker');
  };
  const steam = (u, v, s) => {
    const B = S(u, v, yLo, kr() * 3);
    B('cedar', box(-0.4, 0, -0.3, 0.4, 0.5, 0.3)); B('bitumen', box(-0.34, 0.5, -0.24, 0.34, 0.505, 0.24));
    B(BLK, box(-0.36, 0.12, -0.34, 0.36, 0.34, -0.29)); B(RED, ellipse(0, 0.23, 0.14, 0.07, -0.36, -0.28));
    for (let k = 0; k < 4; k++) B('rock_boulder', lathe([[0.15, 0], [0.12, 0.08], [0.001, 0.13]], 6, null, 0.65 + (k % 2) * 0.22, 0, -0.2 + (k >> 1) * 0.3));
    B('wood_dark', rod([-0.3, 0.52, 0.2], [-0.9, 0.9, 0.5], 0.02, 4)); B('wood_dark', rod([-0.34, 0.52, 0.16], [-0.9, 0.86, 0.46], 0.02, 4));
    const [bx, bz] = W(u, v); col.circle(bx, bz, 0.5, yLo, yLo + 0.5);
  };
  const drum = (u, v, y, yaw) => {
    const B = S(u, v, y, yaw);
    B('cedar', box(-0.45, 0, -0.35, 0.45, 0.7, 0.35)); B(BLK, box(-0.4, 0.15, -0.38, 0.4, 0.6, -0.34)); B(RED, ellipse(0, 0.38, 0.22, 0.14, -0.41, -0.33)); B(BLK, ellipse(0, 0.38, 0.08, 0.07, -0.44, -0.32));
    B('timber', rod([0.6, 0, -0.1], [0.5, 0.75, -0.1], 0.015, 4)); B('timber', rod([0.55, 0.78, -0.1], [0.7, 0.62, 0.15], 0.02, 4));     // the beater
  };
  const paddles = (s, v) => {
    for (let k = 0; k < 3; k++) {
      const u = s * (hw - 0.8), B = S(u, v + k * 0.22, yL, 0);
      B('timber', rod([0, 0, 0], [-s * 0.18, 1.9, 0], 0.025, 5)); B('cedar', ellipse(-s * 0.02, 0.35, 0.07, 0.3, -0.012, 0.012, 7).translate(0, 0, 0));
      B(BLK, box(-s * 0.02 - 0.05, 0.5, -0.03, -s * 0.02 + 0.05, 0.6, 0.03));
    }
  };
  const bark = (u, v, y) => { for (let k = 0; k < 3; k++) S(u + k * 0.28, v + (k % 2) * 0.1, y)('rope_fibre', lathe([[0.13, 0], [0.13, 0.9], [0.1, 0.9], [0.1, 0.0]], 8, null, 0, 0, 0)); };
  const hideFrame = (u, v, s) => {
    const B = S(u, v, yLo, s > 0 ? Math.PI / 2 : -Math.PI / 2);
    for (const dx of [-0.6, 0.6]) B('log_pine', rod([dx, 0, 0], [dx, 1.6, 0], 0.04, 5));
    B('log_pine', rod([-0.65, 1.55, 0], [0.65, 1.55, 0], 0.03, 5)); B('log_pine', rod([-0.65, 0.15, 0], [0.65, 0.15, 0], 0.03, 5));
    B(kr() < 0.5 ? 'hide_tan' : 'hide_white', ellipse(0, 0.85, 0.52, 0.66, -0.012, 0.012, 9)); for (const [x, y] of [[-0.55, 1.5], [0.55, 1.5], [-0.55, 0.2], [0.55, 0.2], [0, 1.52], [0, 0.18]]) B('rope_fibre', rod([x, y, 0], [x * 0.9, 0.85 + (y - 0.85) * 0.8, 0], 0.006, 3));
  };
  const cradle = (u, v, y) => {
    const B = S(u, v, y, kr());
    B('cedar', box(-0.22, 0.08, -0.4, 0.22, 0.3, 0.4)); B('timber', rod([-0.25, 0.04, -0.4], [-0.25, 0.04, 0.4], 0.04, 5)); B('timber', rod([0.25, 0.04, -0.4], [0.25, 0.04, 0.4], 0.04, 5));
    B('hide_white', box(-0.18, 0.28, -0.35, 0.18, 0.33, 0.3)); B(RED, box(-0.22, 0.2, -0.42, 0.22, 0.26, -0.39));
  };
  const dog = (u, v, y) => { const B = S(u, v, y, kr() * 6); B('hide_grey', ellipse(0, 0.04, 0.4, 0.3, -0.04, 0.04, 8).translate(0, 0, 0)); B('hide_brown', box(-0.2, 0.0, -0.1, 0.2, 0.2, 0.25)); };
  const baskets = (u, v, y) => { const B = S(u, v, y); for (let k = 0; k < 4; k++) B('wicker', lathe([[0.2 - k * 0.01, 0], [0.28, 0.2], [0.26, 0.38], [0.001, 0.38]], 9, null, (k % 2) * 0.55 - 0.1, k > 1 ? 0.38 : 0, (k >> 1) * 0.1 + (k > 1 ? 0.05 : 0.5))); bowl(B, 0.9, 0, 0.1, 0.16); };
  const wood = (u, v, y, yaw) => { const B = S(u, v, y, yaw); for (let r = 0; r < 3; r++) for (let k = 0; k < 5 - r; k++) B('log_pine', rod([-0.55 + k * 0.24 + r * 0.12, 0.1 + r * 0.2, -0.3], [-0.55 + k * 0.24 + r * 0.12, 0.1 + r * 0.2, 0.3], 0.09, 5)); };
  const sideV = (k, lo = 2.2) => -hdI + lo + k * 2.2;
  const maxK = Math.max(1, Math.floor((hdI * 2 - 5.8) / 2.2));
  // the low platform: work places along both sides, a different trade on each side of the fire
  const work = [loom, steam, hideFrame];
  for (const s of [-1, 1]) {
    let a = Math.floor(kr() * 3);
    for (let k = 0; k <= maxK; k++) {
      const v = sideV(k), u = s * (hwI - 2.7);
      if (v > hdI - 4.0) break;
      if (el.landmark ? false : kr() < 0.25) continue;
      work[(a + k) % 3](u, v, s);
    }
  }
  // the landing and the front corners
  const corner = [(s) => paddles(s, -hdI + 0.4), (s) => bark(s * (hwI - 0.9), -hdI + 0.6, yL), (s) => baskets(s * (hwI - 1.3), -hdI + 0.6, yL), (s) => drum(s * (hwI - 0.9), -hdI + 0.7, yL, s > 0 ? -Math.PI / 2 : Math.PI / 2), (s) => cradle(s * (hwI - 1.0), -hdI + 0.8, yL), (s) => dog(s * (hwI - 1.4), -hdI + 0.8, yL)];
  const cs = Math.floor(kr() * 6);
  corner[cs % 6](-1); corner[(cs + 2 + Math.floor(kr() * 3)) % 6](1);
  wood(-(hwI - 3.0), -hdI + 0.8, yL, Math.PI / 2); if (kr() < 0.6) wood(hwI - 3.0, -hdI + 0.8, yL, Math.PI / 2);
  // mats hung on the walls, one or two between the beds' screens
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) if (kr() < 0.7) add(kr() < 0.5 ? 'reed_mat' : 'cloth_brown', box(s > 0 ? hw - wtI - 0.03 : -hw + wtI, yL + 1.9, -hdI + 3.2 + k * 3.6, s > 0 ? hw - wtI : -hw + wtI + 0.03, yL + 3.0, -hdI + 4.7 + k * 3.6));
  // the soot over the fire: the roof boards and the beams blackened
  if (hole) for (const s of [-1, 1]) add('wood_dark', prism([[s * (hole.u + 0.05), yAt(hole.u + 0.05) - 0.12], [s * (hole.u + 2.6), yAt(hole.u + 2.6) - 0.12], [s * (hole.u + 2.6), yAt(hole.u + 2.6) - 0.125], [s * (hole.u + 0.05), yAt(hole.u + 0.05) - 0.125]], -hole.v - 1.0, hole.v + 1.0));
  if (el.landmark) {
    // the speaker's staff against the screen, and a hat of stacked rings on a peg (generic)
    const B = S(-2.4, hdI - 2.6, yL + 0.3);
    B('tar_wood', rod([0, 0, 0], [0.12, 2.2, 0], 0.035, 6)); B(RED, ellipse(0.12, 2.1, 0.06, 0.1, -0.04, 0.04, 8));
    for (let k = 0; k < 4; k++) S(2.6, hdI - 2.55, yL + 1.9)(k % 2 ? BLK : 'planks_grey', lathe([[0.2 - k * 0.025, 0], [0.26 - k * 0.025, 0.04], [0.2 - k * 0.025, 0.12]], 10, null, 0, k * 0.1, 0));
  }
  void yP; void bY; void g; void hd; void col; void rand;
}
const wtI = 0.65;

// ── poles standing alone ───────────────────────────────────────────────────────────────────
/** haida_pole: { kind: 'memorial' | 'mortuary', c, yaw, h, r, seed, y (the ground), age }. */
function pole(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), age = el.age ?? 0.7;
  // the old poles lean a little, the way the ground has taken them
  const lean = (rand() - 0.5) * 0.07 * age, lean2 = (rand() - 0.5) * 0.05 * age;
  const M = frame(el.c[0], el.y, el.c[1], el.yaw).multiply(new Matrix4().makeRotationZ(lean).multiply(new Matrix4().makeRotationX(lean2)));
  const add = placer(bag, M), wood = woodOf(age, rand());
  const r = el.r, h = el.h, base = placer(bag, frame(el.c[0], el.y, el.c[1], el.yaw));
  if (el.kind === 'memorial') {
    const wings = el.seed % 3 === 0;
    carved(add, 0, h - 0.2, r * 1.1, r * 0.8, wood, el.seed * 3 + 1, !wings);
    add(wood, lathe([[r * 1.1, -0.4], [r * 1.15, 0], [0.001, 0]], 10));
    if (wings) {
      // a bird at the head, its wings spread wide: boards raised either side, black with red feather lines
      const yt = h - 0.2, rt = r * 0.8 * 0.95;
      for (const sg of [-1, 1]) {
        add(BLK, board([sg * rt * 0.7, yt + 0.05], [sg * rt * 4.2, yt + 1.5], 0.55, -0.1, 0.1));
        add(RED, board([sg * rt * 0.9, yt + 0.0], [sg * rt * 4.3, yt + 1.35], 0.14, -0.12, 0.11));
        for (let k = 0; k < 5; k++) add(RED, board([sg * (rt * 1.5 + k * rt * 0.55), yt + 0.2 + k * 0.28], [sg * (rt * 1.6 + k * rt * 0.55), yt + 0.55 + k * 0.28], 0.04, -0.13, 0.12));
      }
    }
    // the foot: a mound of earth and moss, stones set to hold it, fern at the edge
    base('sod', lathe([[r * 2.0, 0], [r * 1.5, 0.22], [r * 1.05, 0.34], [0.001, 0.36]], 12));
    for (let k = 0; k < 5; k++) { const a = k * 1.3 + rand(), d = r * (1.6 + rand() * 0.5); base('rock_boulder', lathe([[0.26, 0], [0.22, 0.13], [0.001, 0.22]], 6, null, Math.cos(a) * d, 0, Math.sin(a) * d)); }
  } else {
    // the mortuary pole: a post, a carved length of two beings, and the chest on top that holds the dead
    add(wood, lathe([[r * 1.15, -0.4], [r, h * 0.3], [0.001, h * 0.3]], 10));
    carved(add, h * 0.3 - 0.01, h * 0.45, r, r * 0.9, wood, el.seed * 5 + 2, false);
    const y1 = h * 0.75;
    add(wood, box(-r * 1.9, y1, -r * 1.5, r * 1.9, y1 + 0.18, r * 1.5));
    add('cedar', box(-r * 1.8, y1 + 0.18, -r * 1.4, r * 1.8, y1 + 0.18 + r * 2.1, r * 1.4));
    add(BLK, box(-r * 1.5, y1 + 0.18 + r * 0.5, -r * 1.45, r * 1.5, y1 + 0.18 + r * 1.7, -r * 1.38)); add(RED, ellipse(0, y1 + 0.18 + r * 1.1, r * 0.7, r * 0.4, -r * 1.5, -r * 1.38));
    add('planks_grey', prism([[-r * 1.95, y1 + 0.18 + r * 2.1], [r * 1.95, y1 + 0.18 + r * 2.1], [0, y1 + 0.18 + r * 3.0]], -r * 1.6, r * 1.6));
    // the lashings round the chest, the moss on its lid, the overhang's drip stains
    for (const dy of [0.35, 1.45]) add('rope_fibre', box(-r * 1.83, y1 + 0.18 + r * dy, -r * 1.43, r * 1.83, y1 + 0.18 + r * dy + 0.05, r * 1.43));
    add('sod', box(-r * 1.2, y1 + 0.18 + r * 2.1 + r * 0.55, -r * 0.8, r * 0.2, y1 + 0.18 + r * 2.1 + r * 0.7, r * 0.9));
    add('wood_dark', box(-r * 1.2 - 0.02, y1 - 0.5, -r * 1.55, -r * 1.2 + 0.03, y1, -r * 1.5));
    // at the foot: a small heap of stones, a shell dish, a bundle of cedar bark (what the family leaves)
    for (let k = 0; k < 3; k++) { const a = k * 2.2 + rand(), d = r * (1.4 + rand() * 0.4); base('rock_boulder', lathe([[0.2, 0], [0.17, 0.1], [0.001, 0.17]], 6, null, Math.cos(a) * d, 0, Math.sin(a) * d)); }
    base('coral', lathe([[0.16, 0], [0.19, 0.04], [0.001, 0.05]], 8, null, -r * 1.7, 0, -r * 0.8));
  }
  col.circle(el.c[0], el.c[1], r * 1.1, el.y, el.y + Math.min(h, 3));
}

// ── canoes, racks, stacks, logs ──────────────────────────────────────────────────────────────
/**
 * haida_canoe: { c, yaw, l, y (the keel), moored, seed }. The long axis along local z, the bow at −z: a hull from one cedar log
 * (a U-section lofted from stations, the sheer rising to the bow), a separate carved bow piece standing up and forward,
 * a lower stern piece, the paint black at the bow end with red lines; drawn up on two rollers or afloat.
 */
function canoe(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), M = frame(el.c[0], el.y, el.c[1], el.yaw), add = placer(bag, M);
  const L = el.l, B = 0.11 * L + 0.4, Dp = B * 0.5, N = 16, ring = [], ringIn = [];
  const bW = (s) => B / 2 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(s), 2.4)), 0.55) + 0.015;
  const sheer = (s) => Dp * 0.55 + (s < 0 ? Dp * 0.9 * Math.pow(-s, 3) : Dp * 0.35 * Math.pow(s, 3));
  const keel = (s) => (s < 0 ? Dp * 0.5 * Math.pow(-s, 3) : Dp * 0.15 * Math.pow(s, 3));
  const prof = [[1, 1], [0.9, 0.55], [0.5, 0.15], [0, 0]];                                    // (share of the half-beam, share of the depth from the keel)
  const pts = (s, inset) => {
    const b = bW(s), yk = keel(s), yg = sheer(s), z = s * L / 2, left = [], right = [];
    for (const [kb, kh] of prof) {
      const x = Math.max(0, b * kb - (kb > 0 ? inset : 0)), y = yk + (yg - yk) * kh + (kh < 1 ? inset : 0);
      left.push([-x, y, z]); if (kb > 0) right.unshift([x, y, z]);
    }
    return [...left, ...right];
  };
  for (let i = 0; i <= N; i++) { const s = i / N * 2 - 1; ring.push(pts(s, 0)); ringIn.push(pts(s, 0.045)); }
  const tris = [], ax = (p) => [0, (keel(0) + sheer(0)) / 2 + 0.1, p[2]];
  const push = (a, b, c, outward) => { const n = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
    const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3], o = ax(m), d = n[0] * (m[0] - o[0]) + n[1] * (m[1] - o[1]);
    if ((d > 0) === outward) tris.push(...a, ...b, ...c); else tris.push(...a, ...c, ...b); };
  const n = ring[0].length;
  for (let i = 0; i < N; i++) for (let j = 0; j < n - 1; j++) {
    for (const [R_, out] of [[ring, true], [ringIn, false]]) { const a = R_[i][j], b = R_[i][j + 1], c = R_[i + 1][j + 1], d = R_[i + 1][j]; push(a, b, c, out); push(a, c, d, out); }
    // the gunwale's top: between the outer and inner rings at the rim (j = 0 and n − 2…)
  }
  for (const j of [0, n - 1]) for (let i = 0; i < N; i++) {
    const a = ring[i][j], b = ring[i + 1][j], c = ringIn[i + 1][j], d = ringIn[i][j];
    tris.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  }
  const wood = el.moored ? 'cedar' : rand() < 0.5 ? 'cedar' : 'timber';
  add(wood, fromTriangles(tris));
  // the paint: a black band round the bow end, red lines along the sheer
  add(BLK, prism([[-B * 0.5, sheer(-0.55) + 0.02], [B * 0.5, sheer(-0.55) + 0.02], [B * 0.5, sheer(-0.55) + 0.03], [-B * 0.5, sheer(-0.55) + 0.03]], -L * 0.5, -L * 0.3).translate(0, 0, 0));
  // the bow piece and the stern piece
  const zb = -L / 2, yb = sheer(-1) + 0.0;
  add(BLK, sideprism([[zb + 0.55, yb - 0.1], [zb - 0.1, yb + 0.1], [zb - 0.5, yb + Dp * 1.2], [zb - 0.25, yb + Dp * 1.5], [zb + 0.05, yb + Dp * 1.25], [zb + 0.5, yb + 0.25]], -0.13, 0.13));
  add(RED, sideprism([[zb - 0.1, yb + Dp * 0.6], [zb - 0.35, yb + Dp * 1.1], [zb - 0.18, yb + Dp * 1.18], [zb + 0.1, yb + Dp * 0.72]], -0.14, 0.14));
  const zs = L / 2, ys = sheer(1);
  add(wood, sideprism([[zs - 0.5, ys - 0.1], [zs + 0.1, ys + 0.05], [zs + 0.3, ys + Dp * 0.5], [zs + 0.05, ys + Dp * 0.55], [zs - 0.4, ys + 0.2]], -0.1, 0.1));
  // thwarts, a bailer, paddles laid in
  for (const s of [-0.5, -0.1, 0.3]) { const b = bW(s) * 0.92; add('timber', box(-b, sheer(s) - 0.08, s * L / 2 - 0.08, b, sheer(s) - 0.02, s * L / 2 + 0.08)); }
  if (!el.moored) for (const dz of [-0.35, 0.35]) add('log_pine', rod([-B * 0.9, -keel(0.0) - 0.12 - 0.0, dz * L], [B * 0.9, -0.12, dz * L], 0.12, 6));
  else for (const dz of [-0.2, 0.15]) add('timber', rod([-B * 0.3, sheer(0) - 0.1, dz * L], [B * 0.45, sheer(0) + 0.05, dz * L + 0.5], 0.03, 5));
  col.circle(el.c[0], el.c[1], 0.4, el.y, el.y + 0.01);
}

/** haida_rack: a drying rack of two posts and two rails, strings of split halibut and salmon hanging on it. { c, yaw, w, y, seed } */
function rack(el, { bag, col }) {
  const rand = rng(el.seed), add = placer(bag, frame(el.c[0], el.y, el.c[1], el.yaw)), w = el.w;
  for (const s of [-1, 1]) add('log_pine', rod([s * w / 2, -0.3, 0], [s * w / 2, 2.8, 0], 0.09, 6));
  for (const yy of [1.8, 2.6]) add('log_pine', rod([-w / 2 - 0.1, yy, 0], [w / 2 + 0.1, yy, 0], 0.05, 6));
  for (let u = -w / 2 + 0.2; u < w / 2 - 0.1; u += 0.2) for (const yy of [1.8, 2.6]) {
    const l = 0.4 + rand() * 0.35;
    add(rand() < 0.6 ? 'hide_tan' : 'hide_brown', ellipse(u, yy - 0.02 - l / 2, 0.06, l / 2, -0.015, 0.015, 7));
  }
  col.circle(...[el.c[0] + Math.cos(el.yaw) * w / 2, el.c[1] - Math.sin(el.yaw) * w / 2], 0.12, el.y, el.y + 2.8);
  col.circle(...[el.c[0] - Math.cos(el.yaw) * w / 2, el.c[1] + Math.sin(el.yaw) * w / 2], 0.12, el.y, el.y + 2.8);
}

/** haida_stack: cedar planks stacked on stickers, or split firewood in a pile. { c, yaw, kind: 'planks' | 'wood', y, seed } */
function stack(el, { bag, col }) {
  const rand = rng(el.seed), add = placer(bag, frame(el.c[0], el.y, el.c[1], el.yaw));
  if (el.kind === 'planks') {
    for (let k = 0; k < 6; k++) { add(rand() < 0.5 ? 'cedar' : 'timber', box(-0.3, 0.1 + k * 0.1, -1.7 + rand() * 0.1, 0.3, 0.17 + k * 0.1, 1.7)); add('log_pine', box(-0.3, 0.1 + k * 0.1 - 0.04, -1.0, 0.3, 0.1 + k * 0.1, -0.9)); }
    col.rect([...[el.c[0] - 0.4, el.c[1] - 1.7], el.c[0] + 0.4, el.c[1] + 1.7].map((v) => v), el.y, el.y + 0.8);
  } else {
    for (let r = 0; r < 4; r++) for (let k = 0; k < 7 - r; k++) add('log_pine', rod([-1.0 + k * 0.28 + r * 0.14, 0.14 + r * 0.24, -0.5], [-1.0 + k * 0.28 + r * 0.14, 0.14 + r * 0.24, 0.5], 0.11, 6));
    col.rect([el.c[0] - 1.2, el.c[1] - 0.6, el.c[0] + 1.2, el.c[1] + 0.6], el.y, el.y + 1);
  }
}

/** haida_log: a drift log on the beach, one end with its roots. { c, yaw, l, r, y } */
function log(el, { bag }) {
  const add = placer(bag, frame(el.c[0], el.y, el.c[1], el.yaw)), r = el.r;
  add('bark_grey', rod([0, r * 0.9, -el.l / 2], [0, r * 0.9, el.l / 2], r, 8));
  for (let k = 0; k < 4; k++) add('bark_grey', rod([0, r * 0.9, -el.l / 2], [Math.cos(k * 1.7) * r * 2, r * 0.9 + Math.sin(k * 1.7) * r * 2 + r, -el.l / 2 - r * 1.5], r * 0.25, 5));
}

/** haida_hollow: the log being hollowed for a canoe: a long cedar log with its top cut away, adze and chips about it. { c, yaw, l, y } */
function hollow(el, { bag, col }) {
  const add = placer(bag, frame(el.c[0], el.y, el.c[1], el.yaw)), L = el.l;
  add('log_pine', rod([0, 0.55, -L / 2], [0, 0.55, L / 2], 0.55, 10));
  add('wood_dark', box(-0.3, 0.9, -L / 2 + 0.6, 0.3, 1.0, L / 2 - 0.6));
  for (const dz of [-L * 0.3, L * 0.3]) for (const s of [-1, 1]) add('log_pine', rod([s * 0.7, 0, dz], [s * 0.4, 0.35, dz], 0.1, 5));
  add('iron', box(1.0, 0.04, 0.5, 1.5, 0.08, 0.58)); add('timber', box(1.5, 0.04, 0.52, 2.0, 0.08, 0.56));
  for (let k = 0; k < 14; k++) add('cedar', box(-1.4 + (k % 7) * 0.2, 0.02, -L * 0.2 + Math.floor(k / 7) * 1.2, -1.3 + (k % 7) * 0.2, 0.06, -L * 0.2 + Math.floor(k / 7) * 1.2 + 0.1));
  col.rect([el.c[0] - 0.6, el.c[1] - L / 2, el.c[0] + 0.6, el.c[1] + L / 2].map((v) => v), el.y, el.y + 1.1);
}

/** haida_shed: a small plank shed with a lean-to roof, behind the houses. { c, yaw, y, seed } */
function shed(el, { bag, col }) {
  const add = placer(bag, frame(el.c[0], el.y, el.c[1], el.yaw)), rand = rng(el.seed);
  const m = rand() < 0.5 ? 'planks_grey' : 'timber';
  for (let c = 0; c < 6; c++) add(m, box(-1.3 - (c % 2) * 0.02, c * 0.3 - 0.1, -1.0, 1.3 + (c % 2) * 0.02, c * 0.3 + 0.2, 1.0));
  add('planks_grey', prism([[-1.6, 1.7], [1.6, 1.4], [1.6, 1.32], [-1.6, 1.62]], -1.4, 1.4));
  add('lacquer_black', box(-0.4, 0, -1.04, 0.4, 1.4, -1.0));
  col.rect([el.c[0] - 1.4, el.c[1] - 1.1, el.c[0] + 1.4, el.c[1] + 1.1], el.y, el.y + 1.7);
}

/**
 * haida_prop: the small things of the street and the beach: { kind, c, yaw, y, seed, w? }. kind: midden (a heap of clam and mussel shell),
 * hideframe (a hide stretched on a frame), fire (an open cooking fire, split salmon on stakes about it), logbench (a squared log to sit on),
 * clams (baskets of clams and a digging stick), bark (cedar bark in rolls and sheets), net (a dip net or a drying net between two poles),
 * boxes (bentwood boxes for steaming, stones heaped), weir (the stakes of a fish trap in the shallows), kelp (floating kelp), floats
 * (fishing floats and a coil of line), cradle (the cradle of poles a canoe is built on), ladder (a notched log), tub (a bark tub of water).
 * [inferred: the work of the shore; the dossier §5]
 */
function prop(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), add = placer(bag, frame(el.c[0], el.y, el.c[1], el.yaw)), w = el.w ?? 3;
  const circ = (r, h = 0.6) => col.circle(el.c[0], el.c[1], r, el.y, el.y + h);
  switch (el.kind) {
    case 'midden': {
      add('coral', lathe([[w * 0.5, 0], [w * 0.38, 0.22], [w * 0.15, 0.36], [0.001, 0.38]], 10));
      for (let k = 0; k < 10; k++) { const a = rand() * 6.28, d = rand() * w * 0.42; add(k % 3 ? 'chalk' : 'pebbles', lathe([[0.07, 0], [0.001, 0.05]], 5, null, Math.cos(a) * d, 0.3 - d * 0.5, Math.sin(a) * d)); }
      add('sod', lathe([[w * 0.55, 0], [w * 0.48, 0.05], [w * 0.38, 0.1], [0.001, 0.1]], 10));
      break;
    }
    case 'hideframe': {
      for (const dx of [-0.8, 0.8]) add('log_pine', rod([dx, -0.2, 0], [dx, 1.9, 0], 0.045, 5));
      add('log_pine', rod([-0.85, 1.85, 0], [0.85, 1.85, 0], 0.035, 5)); add('log_pine', rod([-0.85, 0.2, 0], [0.85, 0.2, 0], 0.035, 5));
      add(rand() < 0.5 ? 'hide_tan' : 'hide_brown', ellipse(0, 1.05, 0.72, 0.8, -0.015, 0.015, 10));
      for (const [x, y] of [[-0.8, 1.8], [0.8, 1.8], [-0.8, 0.25], [0.8, 0.25], [0, 1.85], [0, 0.2], [-0.8, 1.0], [0.8, 1.0]]) add('rope_fibre', rod([x, y, 0], [x * 0.88, 1.05 + (y - 1.05) * 0.82, 0], 0.007, 3));
      circ(0.9, 1.9); break;
    }
    case 'fire': {
      for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28; add('rock_boulder', lathe([[0.17, 0], [0.14, 0.09], [0.001, 0.15]], 6, null, Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62)); }
      add('bitumen', lathe([[0.5, 0], [0.4, 0.05], [0.001, 0.06]], 9)); add('flame', lathe([[0.2, 0.04], [0.15, 0.2], [0.001, 0.4]], 7));
      for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28 + 0.3; add('wood_dark', rod([Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1], [Math.cos(a) * 0.45, 0.85, Math.sin(a) * 0.45], 0.012, 4)); add(k % 2 ? 'hide_tan' : 'cedar', ellipse(Math.cos(a) * 0.72, 0.55, 0.05, 0.22, -0.01, 0.01, 6).translate(0, 0, 0)); }
      for (const dx of [-1.6, 1.4]) add('log_pine', rod([dx - 0.7, 0.17, 0.2], [dx + 0.7, 0.17, 0.2], 0.17, 6));
      circ(0.8, 0.5); break;
    }
    case 'logbench': {
      add('log_pine', box(-0.9, 0.18, -0.22, 0.9, 0.46, 0.22)); for (const dx of [-0.65, 0.65]) add('timber', box(dx - 0.1, 0, -0.18, dx + 0.1, 0.18, 0.18));
      circ(0.9, 0.5); break;
    }
    case 'clams': {
      for (let k = 0; k < 4; k++) add('wicker', lathe([[0.17, 0], [0.26, 0.17], [0.24, 0.32], [0.001, 0.32]], 9, null, (k % 2) * 0.5 - 0.2, 0, (k >> 1) * 0.45));
      for (let k = 0; k < 6; k++) add('chalk', lathe([[0.05, 0], [0.001, 0.04]], 5, null, (rand() - 0.5) * 1.4, 0, 0.9 + rand() * 0.5));
      add('timber', rod([0.9, 0, 0.1], [1.35, 0.9, 0.1], 0.02, 4)); break;
    }
    case 'bark': {
      for (let k = 0; k < 5; k++) add(k % 2 ? 'rope_fibre' : 'cedar', lathe([[0.15, 0], [0.15, 1.0], [0.1, 1.0], [0.1, 0]], 8, null, (k % 3) * 0.32, 0, (k >> 1) * 0.3));
      for (let k = 0; k < 4; k++) add('roof_bark', box(-0.4, 0.04 + k * 0.05, 0.9, 0.7, 0.08 + k * 0.05, 1.5 + (k % 2) * 0.1));
      circ(1.0, 1.0); break;
    }
    case 'net': {
      for (const dx of [-w / 2, w / 2]) add('log_pine', rod([dx, -0.3, 0], [dx, 2.2, 0], 0.06, 5));
      add('log_pine', rod([-w / 2, 2.1, 0], [w / 2, 2.1, 0], 0.035, 5));
      for (let u = -w / 2 + 0.1; u < w / 2; u += 0.14) { const l = 0.9 + 0.35 * Math.sin(u * 2 + rand()); add('rope_fibre', rod([u, 2.1, 0], [u, 2.1 - l, 0], 0.006, 3)); }
      for (let k = 0; k < 5; k++) add('rope_fibre', rod([-w / 2, 2.0 - k * 0.2, 0], [w / 2, 2.0 - k * 0.2 - 0.12, 0], 0.005, 3));
      for (let k = 0; k < 4; k++) add('log_pine', ellipse(-w / 2 + (k + 0.5) * w / 4, 1.1, 0.05, 0.09, -0.04, 0.04, 6));
      circ(0.1, 2); col.circle(el.c[0] + w / 2 * Math.cos(el.yaw), el.c[1] - w / 2 * Math.sin(el.yaw), 0.1, el.y, el.y + 2); break;
    }
    case 'boxes': {
      for (let k = 0; k < 3; k++) { const x = (k - 1) * 0.95, hh = 0.5 + rand() * 0.15; add('cedar', box(x - 0.4, 0, -0.3, x + 0.4, hh, 0.3)); add(BLK, box(x - 0.34, hh * 0.3, -0.34, x + 0.34, hh * 0.8, -0.29)); add(RED, ellipse(x, hh * 0.55, 0.13, hh * 0.15, -0.37, -0.28)); if (k === 1) add('bitumen', box(x - 0.34, hh, -0.24, x + 0.34, hh + 0.01, 0.24)); }
      for (let k = 0; k < 6; k++) add('rock_boulder', lathe([[0.14, 0], [0.11, 0.08], [0.001, 0.12]], 6, null, -0.5 + (k % 3) * 0.3, 0, 0.7 + (k >> 1) * 0.2));
      circ(1.4, 0.7); break;
    }
    case 'weir': {
      // two rows of stakes in a V, the point to the sea, brush woven between them
      for (let k = 0; k < 12; k++) for (const sg of [-1, 1]) { const t = k / 11; add('log_pine', rod([sg * (3.2 - t * 3.0), -0.6, t * 6.0], [sg * (3.2 - t * 3.0), 1.1 + rand() * 0.3, t * 6.0], 0.035, 4)); }
      for (let k = 0; k < 11; k++) for (const sg of [-1, 1]) { const t0 = k / 11, t1 = (k + 1) / 11; add('bark_dark', rod([sg * (3.2 - t0 * 3.0), 0.25, t0 * 6.0], [sg * (3.2 - t1 * 3.0), 0.25, t1 * 6.0], 0.02, 3)); }
      break;
    }
    case 'kelp': {
      for (let k = 0; k < 14; k++) { const a = rand() * 6.28, d = rand() * w * 0.5, l = 0.6 + rand() * 0.9; add('flax_leaf', ellipse(0, 0, 0.06, l * 0.5, -0.01, 0.01, 6).rotateX(Math.PI / 2).rotateY(rand() * 6.28).translate(Math.cos(a) * d, 0.03, Math.sin(a) * d)); }
      add('bark_dark', lathe([[0.18, 0], [0.12, 0.06], [0.001, 0.1]], 6, null, 0, 0.02, 0)); break;
    }
    case 'floats': {
      for (let k = 0; k < 6; k++) add('hide_white', lathe([[0.001, 0], [0.16, 0.1], [0.14, 0.24], [0.001, 0.32]], 8, null, (k % 3) * 0.34 - 0.3, 0, (k >> 1) * 0.3));
      add('rope_fibre', lathe([[0.3, 0], [0.3, 0.1], [0.18, 0.1], [0.18, 0]], 10, null, 0.9, 0, 0.1)); break;
    }
    case 'cradle': {
      // the log of a canoe being finished, held off the ground on forked posts; chips below it
      const l = w;
      for (const dz of [-l * 0.3, l * 0.3]) for (const sg of [-1, 1]) { add('log_pine', rod([sg * 0.55, 0, dz], [sg * 0.28, 0.75, dz], 0.06, 5)); }
      add('cedar', rod([0, 0.95, -l / 2], [0, 0.95, l / 2], 0.5, 9)); add('wood_dark', box(-0.26, 1.28, -l / 2 + 0.7, 0.26, 1.34, l / 2 - 0.7));
      for (let k = 0; k < 16; k++) add('cedar', box(-1.2 + rand() * 2.4, 0.01, -l / 2 + rand() * l, -1.1 + rand() * 2.4, 0.05, -l / 2 + rand() * l + 0.1));
      col.rect([el.c[0] - 0.7, el.c[1] - l / 2, el.c[0] + 0.7, el.c[1] + l / 2], el.y, el.y + 1.4); break;
    }
    case 'ladder': {
      add('log_pine', rod([0, 0, 0], [0.15, 3.4, 0.9], 0.14, 6)); for (let k = 0; k < 7; k++) add('wood_dark', box(-0.17, 0.4 + k * 0.45, 0.04 * k - 0.1 + 0.02, 0.17 + 0.15 * 0, 0.46 + k * 0.45, 0.13 + 0.12 * k)); break;
    }
    case 'tub': {
      add('cedar', lathe([[0.35, 0], [0.4, 0.3], [0.38, 0.5], [0.33, 0.5], [0.001, 0.05]], 10)); add('bitumen', lathe([[0.3, 0.44], [0.001, 0.45]], 9));
      circ(0.45, 0.5); break;
    }
    case 'wrack': {
      // the tide's line on the beach: bull kelp and eel-grass in long ropes and tangles, a few shells and crab shells in it, a driftwood stick or two
      for (let k = 0; k < 12; k++) { const a = rand() * 6.28, d = rand() * w * 0.5, l = 0.5 + rand() * 1.1; add(k % 3 ? 'flax_leaf' : 'bark_dark', ellipse(0, 0, 0.05 + rand() * 0.05, l * 0.5, -0.012, 0.012, 6).rotateX(Math.PI / 2).rotateY(a).translate(Math.cos(a) * d * 1.6, 0.025, Math.sin(a) * d * 0.5)); }
      for (let k = 0; k < 3; k++) add('bark_dark', lathe([[0.001, 0], [0.12, 0.03], [0.08, 0.1], [0.001, 0.14]], 6, null, (rand() - 0.5) * w * 0.7, 0, (rand() - 0.5) * 0.6));
      for (let k = 0; k < 7; k++) add(k % 2 ? 'chalk' : 'coral', lathe([[0.05, 0], [0.001, 0.035]], 5, null, (rand() - 0.5) * w * 0.9, 0.0, (rand() - 0.5) * 0.9));
      add('log_pine', rod([-0.6, 0.04, 0.2], [0.7, 0.07, 0.35], 0.03, 4)); break;
    }
    case 'chopblock': {
      // a cedar block for splitting, wedges of yew in its cracks, a stone maul beside it, split billets and chips about, a pile of cut shakes
      add('cedar', lathe([[0.3, 0], [0.28, 0.42], [0.001, 0.43]], 9)); add('wood_dark', box(-0.05, 0.43, -0.03, 0.05, 0.62, 0.03)); add('wood_dark', box(-0.2, 0.43, 0.06, -0.12, 0.54, 0.1));
      add('rock_boulder', lathe([[0.001, 0], [0.09, 0.03], [0.07, 0.14], [0.001, 0.16]], 6, null, 0.55, 0, 0.1)); add('wood_dark', rod([0.55, 0.12, 0.1], [0.95, 0.04, 0.24], 0.018, 4));
      for (let k = 0; k < 6; k++) { const a = rand() * 6.28, d = 0.4 + rand() * 0.8; add('cedar', box(Math.cos(a) * d - 0.04, 0, Math.sin(a) * d - 0.1, Math.cos(a) * d + 0.04, 0.3 + rand() * 0.2, Math.sin(a) * d + 0.1)); }
      for (let k = 0; k < 14; k++) add('timber', box(-1.2 + rand() * 2.4, 0.0, -1.0 + rand() * 2.0, -1.1 + rand() * 2.4, 0.03, -0.95 + rand() * 2.0));
      for (let k = 0; k < 5; k++) add('cedar', box(-1.3, k * 0.04, 0.9, -0.2, k * 0.04 + 0.04, 1.2));
      circ(0.5, 0.5); break;
    }
    case 'matframe': {
      // a frame of two uprights and a cross-bar on which a cedar-bark mat is plaited: the strips hanging down, those woven across, a basket of strips at its foot
      for (const dx of [-0.9, 0.9]) add('log_pine', rod([dx, -0.1, 0], [dx, 1.7, 0], 0.04, 5));
      add('log_pine', rod([-0.95, 1.65, 0], [0.95, 1.65, 0], 0.03, 5));
      for (let u = -0.8; u < 0.8; u += 0.1) add(u > 0.2 ? 'cedar' : 'roof_bark', box(u, 0.6, -0.01, u + 0.07, 1.62, 0.01));
      for (let k = 0; k < 6; k++) { const v = 0.62 + k * 0.09; if (-0.8 + (k + 1) * 0.28 < 0.2) add(k % 2 ? 'rope_fibre' : 'cedar', box(-0.8, v, -0.02, -0.8 + (k + 1) * 0.28, v + 0.045, 0.02)); }
      add('wicker', lathe([[0.2, 0], [0.28, 0.2], [0.26, 0.34], [0.001, 0.34]], 9, null, 1.2, 0, 0.3));
      for (let k = 0; k < 4; k++) add('roof_bark', rod([1.0 + k * 0.05, 0.3, 0.3], [1.5 + k * 0.05, 0.05, 0.9 + k * 0.1], 0.015, 4));
      circ(1.0, 1.7); break;
    }
    case 'puddle': {
      // standing water in the beaten street, edged with dark mud; dead ripples are not drawn
      add('bitumen', ellipse(0, 0, w * 0.5 + 0.12, w * 0.32 + 0.1, -0.003, 0.004, 12).rotateX(Math.PI / 2).translate(0, 0.012, 0));
      add('water', ellipse(0, 0, w * 0.5, w * 0.32, -0.003, 0.004, 12).rotateX(Math.PI / 2).translate(0, 0.02, 0)); break;
    }
    case 'ferns': {
      // sword fern and salal at a house corner: fronds in fans, a few salmonberry canes
      for (let k = 0; k < 9; k++) { const a = rand() * 6.28, d = rand() * 0.4; for (let j = 0; j < 5; j++) { const b = j / 5 * 6.28 + a; add('palm_leaf', rod([Math.cos(a) * d, 0, Math.sin(a) * d], [Math.cos(a) * d + Math.cos(b) * (0.7 + rand() * 0.35), 0.45 + rand() * 0.35, Math.sin(a) * d + Math.sin(b) * (0.7 + rand() * 0.35)], 0.014, 3)); } }
      for (let k = 0; k < 4; k++) { const a = rand() * 6.28; add('bark_dark', rod([Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3], [Math.cos(a) * 0.4, 1.3 + rand() * 0.4, Math.sin(a) * 0.4], 0.012, 3)); add('palm_leaf', lathe([[0.001, 0], [0.2, 0.06], [0.001, 0.14]], 6, null, Math.cos(a) * 0.4, 1.3, Math.sin(a) * 0.4)); }
      break;
    }
    case 'roots': {
      // spruce-root work in the open: coils of split root hung on a peg-rail, a half-woven hat on a block, a basket on its side
      add('log_pine', box(-0.9, 1.4, -0.03, 0.9, 1.5, 0.03)); for (const dx of [-0.85, 0.85]) add('log_pine', rod([dx, 0, 0], [dx, 1.45, 0], 0.035, 5));
      for (let k = 0; k < 5; k++) add('rope_fibre', lathe([[0.1, 0], [0.12, 0.05], [0.1, 0.1], [0.07, 0.05]], 8, null, -0.7 + k * 0.35, 1.0 - rand() * 0.1, 0.06).rotateX(0.0));
      add('wicker', lathe([[0.001, 0], [0.3, 0.02], [0.24, 0.16], [0.08, 0.26], [0.001, 0.27]], 10, null, 1.1, 0, 0.5));
      add('wicker', lathe([[0.25, 0.0], [0.28, 0.25], [0.001, 0.26]], 9, null, -0.6, 0, 0.7)); circ(1.0, 1.5); break;
    }
    case 'toy': {
      // the children's play: a toy canoe of cedar bark with a paddle, a ring of small stones, a doll of rushes
      add('cedar', ellipse(0, 0.04, 0.45, 0.07, -0.09, 0.09, 8).rotateY(0)); add('roof_bark', box(-0.4, 0.05, -0.06, 0.4, 0.14, 0.06)); add('wood_dark', rod([0.1, 0.1, 0.1], [0.5, 0.18, 0.6], 0.012, 4));
      for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28; add('rock_boulder', lathe([[0.04, 0], [0.001, 0.05]], 5, null, 0.9 + Math.cos(a) * 0.35, 0, 0.1 + Math.sin(a) * 0.35)); }
      add('reed_mat', lathe([[0.001, 0], [0.04, 0.05], [0.05, 0.2], [0.001, 0.26]], 6, null, 1.8, 0, 0.0)); break;
    }
    default: break;
  }
}

registerStyle('haida', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, haida_house: house, haida_pole: pole, haida_canoe: canoe, haida_rack: rack, haida_stack: stack, haida_log: log, haida_hollow: hollow, haida_shed: shed, haida_prop: prop },
  objects: {},
});
