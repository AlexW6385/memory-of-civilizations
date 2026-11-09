// The scholar's study of the residence's west court (docs/settlements/ming-suzhou.md §11): a room of
// solid plaster walls on a timber dado, latticed only to the court, a boarded coffered ceiling on moon
// beams, a floor of true square bricks, a round moon screen dividing the study from the tea room at
// the door, and the things of Wen Zhenheng's Treatise on Superfluous Things.

import {
  W, Parts, box, lathe, limb, T, ball, torus, prismX, moonProfile, table, armchair, books, deskThings, rock, brickFloor,
  qin, handWarmer, plumVase, scrollPot, bolster, drumStool, flowerStand, teaSet, lampStand, couch,
} from './props.js';

const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);

/** The moon screen (yuanguang zhao) across the room: frame, skirt, a round opening in a rim, fretwork of fine bars in the spandrels and the transom; faces +z, spans x ±w/2. */
function moonScreen(P, w, h, R = 1.0) {
  const sill = 0.14, cy = sill + R, rr = R + 0.1;
  P.add(W, box(-w / 2, 0, -0.06, w / 2, sill, 0.06));
  for (const s of [-1, 1]) P.add(W, box(s > 0 ? w / 2 - 0.11 : -w / 2, 0, -0.06, s > 0 ? w / 2 : -w / 2 + 0.11, h, 0.06));
  P.add(W, box(-w / 2, h - 0.13, -0.06, w / 2, h, 0.06));
  P.add(W, box(-w / 2, h - 0.2, -0.045, w / 2, h - 0.13, 0.045));
  // the rim of the opening: a rounded ring, and a thin ring of gilt-free dark wood inside it
  P.add(W, torus(R + 0.05, 0.055, 40, 6).rotateX(Math.PI / 2).translate(0, cy, 0));
  P.add('lacquer_black', torus(R + 0.115, 0.012, 40, 4).rotateX(Math.PI / 2).translate(0, cy, 0.04));
  // the fretwork: a square lattice (bubu jin) of bars 14 mm wide every 12.5 cm, cut by the circle
  const x0 = -w / 2 + 0.11, x1 = w / 2 - 0.11, y0 = sill, y1 = h - 0.2, st = 0.125;
  const nx = Math.round((x1 - x0) / st), ny = Math.round((y1 - y0) / st);
  const bar = (a, b, c, d) => { if (Math.max(b - a, d - c) > 0.03) P.add(W, box(a, c, -0.018, b, d, 0.018)); };
  for (let i = 1; i < nx; i++) {
    const x = x0 + (x1 - x0) * i / nx;
    if (Math.abs(x) < rr) { const c = Math.sqrt(rr * rr - x * x); bar(x - 0.007, x + 0.007, y0, cy - c); bar(x - 0.007, x + 0.007, cy + c, y1); } else bar(x - 0.007, x + 0.007, y0, y1);
  }
  for (let j = 1; j < ny; j++) {
    const y = y0 + (y1 - y0) * j / ny;
    if (Math.abs(y - cy) < rr) { const c = Math.sqrt(rr * rr - (y - cy) ** 2); bar(x0, -c, y - 0.007, y + 0.007); bar(c, x1, y - 0.007, y + 0.007); } else bar(x0, x1, y - 0.007, y + 0.007);
  }
  // little rosettes where the bars cross, round the opening
  for (const a of [0.8, 2.34, 3.94, 5.48]) P.add(W, T(ball(0.07, 0.07, 0.025, 8, 4), Math.cos(a) * (R + 0.34), cy + Math.sin(a) * (R + 0.34), 0.0));
}

export function scholarStudy(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H ?? 3.8, Lx = x1 - x0, Lz = z1 - z0;
  const yC = H - 0.75, S = new Parts();
  const put = (Q, u, v, yaw = 0, up = 0) => Q.emit(S, u, up, v, yaw);
  const blk = (u0, v0, u1, v1, h) => col.rect([x0 + u0, z0 + v0, x0 + u1, z0 + v1], y, y + h);
  const t0 = 0.25, t1 = 0.31, uE = Lx - 0.14, vN = t0, vS = Lz - t0;
  // the floor of square bricks and the walls
  brickFloor(S, t0, t0, uE, vS + 0.06, 41);
  const wall = (a0, b0, a1, b1, room) => {
    // a0..a1 × b0..b1 is the wall's plan (thin side first); room: where the room is (the face with the rail)
    S.add('plaster_white', box(a0, 0.95, b0, a1, yC, b1));
    S.add('timber', box(a0, 0.1, b0, a1, 0.9, b1));
    const g = 0.015;
    if (room === 'u+') { S.add(W, box(a0, 0, b0, a1 + g, 0.1, b1)); S.add(W, box(a0, 0.9, b0, a1 + g, 0.95, b1)); S.add(W, box(a0, yC - 0.06, b0, a1 + g * 3, yC, b1)); }
    if (room === 'v+') { S.add(W, box(a0, 0, b0, a1, 0.1, b1 + g)); S.add(W, box(a0, 0.9, b0, a1, 0.95, b1 + g)); S.add(W, box(a0, yC - 0.06, b0, a1, yC, b1 + g * 3)); }
    if (room === 'v-') { S.add(W, box(a0, 0, b0 - g, a1, 0.1, b1)); S.add(W, box(a0, 0.9, b0 - g, a1, 0.95, b1)); S.add(W, box(a0, yC - 0.06, b0 - g * 3, a1, yC, b1)); }
  };
  wall(t0, t0, t1, vS + 0.06, 'u+');                  // the back (west) wall
  wall(t1, t0, uE, t1 - 0.0, 'v+');                   // the north wall
  wall(t1, vS, uE, vS + 0.06, 'v-');                  // the south wall
  // the ceiling: boards, battens in a grid of 60 cm squares, the cornice, moon beams across
  S.add('timber', box(t0, yC, t0, uE, yC + 0.04, vS + 0.06));
  const nU = Math.round((uE - t1) / 0.6), nV = Math.round((vS - t1) / 0.6);
  for (let i = 0; i <= nU; i++) { const u = t1 + (uE - t1) * i / nU; S.add(W, box(u - 0.025, yC - 0.045, t1, u + 0.025, yC, vS)); }
  for (let j = 0; j <= nV; j++) { const v = t1 + (vS - t1) * j / nV; S.add(W, box(t1, yC - 0.045, v - 0.025, uE, yC, v + 0.025)); }
  const zc = (t1 + vS) / 2, moon = (u) => { const B = prismX(moonProfile(vS - t1, 0.26, 0.1), u - 0.1, u + 0.1); B.translate(0, yC - 0.36, zc); S.add(W, B); };
  moon(Lx / 3); moon(2 * Lx / 3);
  // the round moon screen at the third post line, dividing the study from the tea room
  const uS = 2 * Lx / 3, vc = (t0 + vS + 0.06) / 2;
  { const P = new Parts(); moonScreen(P, vS + 0.06 - t0, yC - 0.04); put(P, uS, vc, Math.PI / 2); }
  blk(uS - 0.08, t0, uS + 0.08, vc - 0.85, yC); blk(uS - 0.08, vc + 0.85, uS + 0.08, vS + 0.06, yC);
  // ── the study: couch-bed against the back wall, its low table with tea and a hand-warmer, a bolster
  { const P = new Parts(); couch(P);
    const K = new Parts(); table(K, 0.7, 0.4, 0.26); K.emit(P, 0, 0.448, 0);
    const Hw = new Parts(); handWarmer(Hw); Hw.emit(P, -0.15, 0.708, 0);
    const Tea = new Parts(); teaSet(Tea); Tea.emit(P, 0.12, 0.708, 0);
    const Bo = new Parts(); bolster(Bo); Bo.emit(P, -0.8, 0.448, 0.0, Math.PI / 2);
    put(P, 0.82, vc, -Math.PI / 2); blk(t1, vc - 1.0, 1.33, vc + 1.0, 0.9); }
  // the qin on its table against the north wall, a drum stool before it
  { const P = new Parts(); table(P, 1.1, 0.4, 0.72); const Q = new Parts(); qin(Q); Q.emit(P, 0, 0.72, 0); put(P, 2.9, vN + 0.26); blk(2.3, vN, 3.5, vN + 0.5, 0.75); }
  { const P = new Parts(); drumStool(P); put(P, 2.9, 1.4); col.circle(x0 + 2.9, z0 + 1.4, 0.2, y, y + 0.46); }
  // the bookshelf: one, not many ("otherwise the room looks like a bookstore")
  { const P = new Parts(), w = 1.1, d = 0.42, h = 1.9;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(W, box(sx * w / 2 - 0.02, 0, sz * d / 2 - 0.02, sx * w / 2 + 0.02, h, sz * d / 2 + 0.02));
    for (const yy of [0.1, 0.7, 1.3, 1.88]) P.add(W, box(-w / 2, yy, -d / 2, w / 2, yy + 0.025, d / 2));
    for (const [yy, x, n] of [[0.125, -0.3, 5], [0.125, 0.05, 4], [0.725, -0.32, 7], [0.725, 0.2, 3], [1.325, -0.25, 4]]) { const Bk = new Parts(); books(Bk, n, Math.round(x * 100 + yy * 10)); Bk.emit(P, x, yy, 0, Math.PI / 2); }
    P.add('lacquer_red', box(0.18, 1.325, -0.12, 0.45, 1.47, 0.12)); P.add('lacquer_black', box(0.1, 0.125, -0.13, 0.45, 0.26, 0.13));
    P.add(W, box(-w / 2, 0.1, -d / 2 + 0.01, w / 2, h, -d / 2 + 0.025));
    put(P, 5.45, vN + 0.25); blk(4.9, vN, 6.0, vN + 0.5, 1.95); }
  { const P = new Parts(); scrollPot(P); put(P, 7.35, 0.75); col.circle(x0 + 7.35, z0 + 0.75, 0.22, y, y + 0.55); }
  // the painting table, free-standing (Wen: "the writing desk … brushes, incense powder boxes, and incense burners"), the armchair behind it
  { const P = new Parts(), h = 0.82; table(P, 1.8, 0.8, h, 'flat'); deskThings(P, h);
    const Bk = new Parts(); books(Bk, 6, 7); Bk.emit(P, 0.7, h, -0.18);
    const C = new Parts(); armchair(C); C.emit(P, 0, 0, 0.5);
    put(P, 4.95, 3.15, -Math.PI / 2); blk(4.5, 2.2, 5.4, 4.05, 0.85); blk(3.85, 2.85, 4.5, 3.5, 0.9); }
  { const P = new Parts(); lampStand(P); put(P, 5.9, 1.75); col.circle(x0 + 5.9, z0 + 1.75, 0.22, y, y + 1.7); }
  // the rock on a high table by the south wall, the plum vase on a flower stand in the corner
  { const P = new Parts(); table(P, 0.9, 0.45, 0.85); const R = new Parts(); rock(R, 0.55, 11); R.emit(P, 0, 0.85, 0); put(P, 3.4, vS - 0.3, Math.PI); blk(2.9, vS - 0.55, 3.9, vS, 1.4); }
  { const P = new Parts(); flowerStand(P); const V = new Parts(); plumVase(V, 9); V.emit(P, 0, 0.82, 0); put(P, 0.8, vS - 0.3); col.circle(x0 + 0.8, z0 + vS - 0.3, 0.2, y, y + 1.4); }
  // ── the tea room by the door: a tea table, two armchairs facing across, the incense burner on its own stand apart from the flowers
  { const P = new Parts(); table(P, 0.8, 0.8, 0.76); const Tea = new Parts(); teaSet(Tea); Tea.emit(P, 0, 0.76, 0); put(P, 9.7, 1.55); blk(9.3, 1.15, 10.1, 1.95, 0.8); }
  for (const [u, d] of [[8.8, 1], [10.6, -1]]) { const C = new Parts(); armchair(C); put(C, u, 1.55, faceYaw(d, 0)); blk(u - 0.3, 1.25, u + 0.3, 1.85, 1.0); }
  { const P = new Parts(); table(P, 0.36, 0.36, 0.72);
    P.add('bronze', lathe([[0.001, 0], [0.09, 0.0], [0.11, 0.05], [0.1, 0.11], [0.08, 0.12], [0.085, 0.14], [0.001, 0.14]], 12, null, 0, 0.72, 0));
    for (const a of [0, 2.1, 4.2]) P.add('bronze', limb([Math.cos(a) * 0.07, 0.75, Math.sin(a) * 0.07], [Math.cos(a) * 0.09, 0.71, Math.sin(a) * 0.09], 0.01, 0.008, 4));
    put(P, 11.3, 0.7); col.circle(x0 + 11.3, z0 + 0.7, 0.25, y, y + 0.9); }
  // the door curtain: a rod and valance across the doorway, the curtain drawn aside and tied
  { const P = new Parts(), vA = 3.08, vB = Lz - 0.08;
    P.add('bamboo_culm', limb([0, 2.58, vA], [0, 2.58, vB], 0.016, 0.016, 6));
    P.add('cloth_indigo', box(-0.012, 2.1, vA, 0.012, 2.52, vB));
    for (let k = 0; k <= 12; k++) P.add('cloth_red', T(ball(0.03, 0.03, 0.012, 6, 3), 0.0, 2.1, vA + (vB - vA) * k / 12));
    for (const [a, b] of [[vA, vA + 0.42], [vB - 0.42, vB]]) {
      const n = 8;
      for (let k = 0; k < n; k++) { const v = a + (b - a) * k / n, dep = k % 2 ? 0.035 : 0.0; P.add('cloth_indigo', box(-0.03 - dep, 0.3, v, 0.0, 2.1, v + (b - a) / n)); }
      P.add('cloth_red', box(-0.05, 1.05, a - 0.005, 0.0, 1.1, b + 0.005)); P.add('cloth_red', limb([-0.03, 1.05, (a + b) / 2], [-0.03, 0.8, (a + b) / 2], 0.01, 0.006, 4));
      P.add('cloth_red', lathe([[0.001, 0.74], [0.025, 0.78], [0.02, 0.84], [0.001, 0.84]], 8, null, -0.03, 0, (a + b) / 2));
    }
    put(P, Lx - 0.17, 0); }
  S.emit(bag, x0, y + 0.05, z0, 0);
}
