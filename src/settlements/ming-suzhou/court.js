// The residence's courts (docs/settlements/ming-suzhou.md §11): the great water vat (taiping gang), the
// stone drums (baogu shi) at the gate, the screen wall (zhaobi), a stone well, plants in tubs.

import { Parts, box, lathe, limb, T, ball, torus, prismX, rng, W, plaqueBuild } from './props.js';
import { disc } from '../../core/geom.js';

/** The great water vat kept full against fire, on three stone blocks, its rim bound in bronze, two ring handles, lotus leaves on the water. */
function vat(P) {
  P.add('granite_grey', lathe([[0.001, 0], [0.5, 0], [0.5, 0.1], [0.001, 0.1]], 12));
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3 + 0.5; P.add('granite_grey', box(-0.14, 0, -0.1, 0.14, 0.13, 0.1).rotateY(-a).translate(Math.cos(a) * 0.33, 0, Math.sin(a) * 0.33)); }
  P.add('glaze_blue', lathe([[0.001, 0.13], [0.3, 0.13], [0.42, 0.2], [0.55, 0.45], [0.56, 0.62], [0.5, 0.86], [0.52, 0.9], [0.46, 0.9], [0.45, 0.85]], 24));
  P.add('glaze_white', lathe([[0.553, 0.4], [0.564, 0.44], [0.564, 0.5], [0.555, 0.54]], 24));
  P.add('bronze', lathe([[0.5, 0.855], [0.535, 0.855], [0.535, 0.905], [0.5, 0.905], [0.5, 0.855]], 24));
  for (const s of [-1, 1]) { P.add('bronze', torus(0.06, 0.01, 12, 5).rotateX(Math.PI / 2).translate(s * 0.585, 0.72, 0)); P.add('bronze', T(ball(0.025, 0.025, 0.025, 6, 4), s * 0.545, 0.78, 0)); }
  P.add('water', disc(0.46, 0.78, 24));
  for (const [x, z, r] of [[-0.12, 0.08, 0.14], [0.15, -0.1, 0.12], [0.05, 0.22, 0.1]]) P.add('lotus_leaf', T(ball(r, 0.012, r, 8, 3), x, 0.785, z));
}
/** A stone drum (baogu shi) beside a gate, its round face toward +z: plinth, the drum with a boss and scroll rings, the tail running into the jamb. */
function drumStone(P) {
  P.add('granite_grey', box(-0.27, 0, -0.42, 0.27, 0.15, 0.4)); P.add('granite_grey', box(-0.3, 0.15, -0.42, 0.3, 0.2, 0.42));
  P.add('granite_grey', lathe([[0.001, 0], [0.3, 0], [0.3, 0.34], [0.001, 0.34]], 22).rotateX(Math.PI / 2).translate(0, 0.5, -0.17));
  P.add('granite_grey', box(-0.18, 0.22, -0.42, 0.18, 0.56, -0.17));
  P.add('granite_grey', T(ball(0.12, 0.12, 0.06, 10, 5), 0, 0.5, 0.2));
  P.add('granite_black', torus(0.2, 0.018, 20, 5).rotateX(Math.PI / 2).translate(0, 0.5, 0.175));
  P.add('granite_black', torus(0.27, 0.014, 22, 5).rotateX(Math.PI / 2).translate(0, 0.5, 0.175));
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; P.add('granite_grey', T(ball(0.02, 0.02, 0.02, 4, 3), Math.cos(a) * 0.235, 0.5 + Math.sin(a) * 0.235, 0.18)); }
  P.add('granite_grey', T(ball(0.1, 0.07, 0.1, 8, 4), 0, 0.22, 0.28));
}
/** The screen wall (zhaobi): a stone plinth, a white wall with a brick frame and a roundel, a tiled coping. Faces +z. */
function screenWall(P, w, h) {
  P.add('granite_block', box(-w / 2 - 0.1, 0, -0.32, w / 2 + 0.1, 0.5, 0.32));
  P.add('granite_grey', box(-w / 2 - 0.13, 0.5, -0.34, w / 2 + 0.13, 0.56, 0.34));
  P.add('plaster_white', box(-w / 2, 0.56, -0.24, w / 2, h - 0.4, 0.24));
  for (const s of [-1, 1]) {
    const z = s * 0.24, d = s * 0.035, zz = [Math.min(z, z + d), Math.max(z, z + d)], fx = w * 0.36, y0 = 1.05, y1 = h - 0.85;
    for (const [a, b, c, e] of [[-fx, y0, fx, y0 + 0.09], [-fx, y1 - 0.09, fx, y1], [-fx, y0, -fx + 0.09, y1], [fx - 0.09, y0, fx, y1]]) P.add('brick_grey', box(a, b, zz[0], c, e, zz[1]));
    for (const [cx, cy] of [[-fx + 0.17, y0 + 0.17], [fx - 0.17, y0 + 0.17], [-fx + 0.17, y1 - 0.17], [fx - 0.17, y1 - 0.17]]) P.add('brick_grey', T(ball(0.07, 0.07, 0.025, 8, 4), cx, cy, z + d * 1.2));
    const cy = (y0 + y1) / 2, R = Math.min((y1 - y0) / 2 - 0.2, 0.55);
    P.add('brick_grey', torus(R, 0.035, 28, 5).rotateX(Math.PI / 2).translate(0, cy, z + d * 0.9));
    P.add('plaster_grey', lathe([[0.001, 0], [R * 0.7, 0], [R * 0.7, 0.01], [0.001, 0.012]], 24).rotateX(s > 0 ? Math.PI / 2 : -Math.PI / 2).translate(0, cy, z + d * 0.4));
    P.add('brick_grey', T(ball(R * 0.3, R * 0.3, 0.03, 10, 5), 0, cy, z + d * 1.4));
  }
  P.add('plaster_grey', box(-w / 2 - 0.04, h - 0.4, -0.27, w / 2 + 0.04, h - 0.32, 0.27));
  P.add('tile_dark', prismX([[-0.44, h - 0.32], [0.44, h - 0.32], [0.44, h - 0.26], [0.0, h + 0.14], [-0.44, h - 0.26]], -w / 2 - 0.16, w / 2 + 0.16));
  P.add('tile_dark', prismX([[-0.05, h + 0.12], [0.05, h + 0.12], [0.05, h + 0.2], [-0.05, h + 0.2]], -w / 2 - 0.16, w / 2 + 0.16));
  for (const s of [-1, 1]) P.add('tile_dark', T(ball(0.1, 0.12, 0.1, 8, 4), s * (w / 2 + 0.12), h + 0.2, 0));
}
/**
 * The brick-carved gate tower (zhuandiao menlou) of an inner gate, built in the wall's frame (x along the wall, z the wall's
 * thickness, both faces carved alike, +z the front): a granite plinth, brick piers with raised panels, over the doorway the lower
 * beam, the frieze with pendant lotus posts, the tablet (zibei) between two carved panels, the upper beam, three tiers of
 * brick brackets, a tiled roof with a ridge and upturned ends. A 2.3 m doorway, the leaves folded back inside.
 */
function gateTower(P) {
  const HW = 2.7, DW = 1.15, B = 'brick_grey';
  for (const s of [-1, 1]) {
    P.add('granite_block', box(s > 0 ? DW : -HW, 0, -0.5, s > 0 ? HW : -DW, 0.32, 0.5));
    P.add(B, box(s > 0 ? DW : -HW, 0.32, -0.4, s > 0 ? HW : -DW, 2.85, 0.4));
    for (const f of [-1, 1]) {                                                    // raised panels on both faces of the piers
      const z = f * 0.4, zz = [Math.min(z, z + f * 0.035), Math.max(z, z + f * 0.035)], x0 = Math.min(s * 1.4, s * 2.5), x1 = Math.max(s * 1.4, s * 2.5);
      for (const [a, b, c, e] of [[x0, 0.62, x1, 0.7], [x0, 2.45, x1, 2.53], [x0, 0.62, x0 + 0.08, 2.53], [x1 - 0.08, 0.62, x1, 2.53]]) P.add('granite_grey', box(a, b, zz[0], c, e, zz[1]));
      P.add('plaster_grey', box(x0 + 0.08, 0.7, Math.min(z, z + f * 0.01), x1 - 0.08, 2.45, Math.max(z, z + f * 0.01)));
      P.add(B, T(ball(0.22, 0.22, 0.03, 10, 5), s * 1.95, 1.58, z + f * 0.03));
      for (const [dx, dy] of [[-0.27, -0.27], [0.27, -0.27], [-0.27, 0.27], [0.27, 0.27]]) P.add(B, T(ball(0.06, 0.06, 0.025, 6, 4), s * 1.95 + dx, 1.58 + dy, z + f * 0.03));
    }
    P.add('lacquer_black', box(s * (DW - 0.06) - 0.04, 0.32, -1.05, s * (DW - 0.06) + 0.04, 2.6, -0.2));      // the door leaf folded back
    for (let k = 0; k < 5; k++) P.add('bronze', T(ball(0.025, 0.025, 0.02, 5, 3), s * (DW - 0.06) + s * 0.05, 1.0 + k * 0.28, -0.25 - 0.14 * k));
  }
  P.add('granite_grey', box(-DW, 0, -0.35, DW, 0.07, 0.35));                      // the threshold
  P.add('timber', box(-DW - 0.02, 2.7, -0.3, DW + 0.02, 2.85, 0.3));              // the door's lintel
  P.add(B, box(-HW, 2.85, -0.42, HW, 3.1, 0.42));                                  // the lower beam
  P.add('granite_grey', box(-HW, 2.83, -0.44, HW, 2.87, 0.44));
  P.add(B, box(-HW, 3.1, -0.38, HW, 3.45, 0.38));                                  // the frieze: bands of carved scrolls
  const r = rng(7);
  for (const f of [-1, 1]) {
    const z = f * 0.38;
    for (let k = 0; k < 17; k++) { const x = -HW + 0.2 + k * (2 * HW - 0.4) / 16; P.add('granite_grey', T(ball(0.07, 0.07, 0.035, 6, 4), x, 3.275, z + f * 0.02)); P.add('granite_grey', T(ball(0.04, 0.04, 0.025, 5, 3), x + 0.13, 3.275 + (k % 2 ? 0.06 : -0.06), z + f * 0.02)); }
    for (const x of [-DW, -HW + 0.18, DW, HW - 0.18]) P.add(W, lathe([[0.001, 0], [0.05, 0.02], [0.06, 0.18], [0.045, 0.3], [0.09, 0.4], [0.001, 0.52]], 8, null, x, 2.58, f * 0.5));   // the pendant lotus posts
    P.add(W, box(-HW + 0.1, 3.0, z + f * 0.02 - 0.02, HW - 0.1, 3.1, z + f * 0.02 + 0.02));                                                      // the hanging frieze board
    // the tablet and the carved panels
    P.add(B, box(-HW + 0.05, 3.45, Math.min(z, z + f * 0.03), HW - 0.05, 4.2, Math.max(z, z + f * 0.03)));
    for (const sx of [-1, 1]) {
      const x0 = sx > 0 ? 1.05 : -2.5, x1 = sx > 0 ? 2.5 : -1.05;
      for (const [a, b, c, e] of [[x0, 3.52, x1, 3.58], [x0, 4.07, x1, 4.13], [x0, 3.52, x0 + 0.06, 4.13], [x1 - 0.06, 3.52, x1, 4.13]]) P.add('granite_grey', box(a, b, Math.min(z, z + f * 0.05), c, e, Math.max(z, z + f * 0.05)));
      P.add('plaster_grey', box(x0 + 0.06, 3.58, Math.min(z, z + f * 0.02), x1 - 0.06, 4.07, Math.max(z, z + f * 0.02)));
      const cx = (x0 + x1) / 2;                                                         // a carved scene: rocks, a pavilion's roof, a figure, a tree
      P.add(B, box(cx - 0.55, 3.62, z + f * 0.02 - 0.015, cx + 0.55, 3.68, z + f * 0.02 + 0.015));
      P.add(B, T(ball(0.2, 0.1, 0.03, 8, 4), cx - 0.3, 3.74, z + f * 0.05)); P.add(B, T(ball(0.14, 0.14, 0.03, 8, 4), cx + 0.35, 3.82, z + f * 0.05));
      P.add(B, box(cx - 0.18, 3.78, z + f * 0.02 - 0.015, cx + 0.18, 3.86, z + f * 0.02 + 0.015)); P.add(B, box(cx - 0.24, 3.86, z + f * 0.02 - 0.015, cx + 0.24, 3.9, z + f * 0.02 + 0.015));
      for (let k = 0; k < 4; k++) P.add(B, T(ball(0.035, 0.05, 0.02, 5, 3), cx - 0.45 + k * 0.28 + (r() - 0.5) * 0.05, 3.98, z + f * 0.045));
    }
    const Q = new Parts(); plaqueBuild(Q, { w: 1.9, h: 0.66, n: 4, seed: 61, field: 'paint_white', ink: 'lacquer_black' });
    Q.emit(P, 0, 3.49, z + f * 0.03, f > 0 ? 0 : Math.PI);
  }
  P.add(B, box(-HW, 4.2, -0.42, HW, 4.45, 0.42));                                 // the upper beam
  P.add('granite_grey', box(-HW, 4.43, -0.45, HW, 4.47, 0.45));
  for (const f of [-1, 1]) for (let t = 0; t < 3; t++) {                          // three tiers of brick brackets, each reaching farther
    const y = 4.47 + t * 0.17, out = 0.2 + t * 0.2, n = 11 - t * 2;
    P.add(B, box(-HW + 0.1 + t * 0.12, y + 0.1, Math.min(0, f * (0.45 + out)), HW - 0.1 - t * 0.12, y + 0.17, Math.max(0, f * (0.45 + out))));
    for (let k = 0; k < n; k++) { const x = -HW + 0.3 + t * 0.12 + k * (2 * HW - 0.6 - t * 0.24) / (n - 1); P.add(B, box(x - 0.06, y, Math.min(0, f * (0.4 + out * 0.9)), x + 0.06, y + 0.1, Math.max(0, f * (0.4 + out * 0.9)))); }
  }
  P.add(B, box(-HW, 4.47, -0.4, HW, 4.98, 0.4));                                  // the core behind the brackets
  P.add('plaster_white', box(-HW + 0.2, 4.98, -0.3, HW - 0.2, 5.12, 0.3));
  P.add('tile_dark', prismX([[-1.15, 5.12], [-0.9, 5.12], [-0.45, 5.35], [0, 5.98], [0.45, 5.35], [0.9, 5.12], [1.15, 5.12], [1.0, 5.2], [0.55, 5.52], [0.0, 6.12], [-0.55, 5.52], [-1.0, 5.2]].reverse(), -HW - 0.45, HW + 0.45));
  P.add('plaster_grey', prismX([[-0.9, 5.12], [0.9, 5.12], [0.45, 5.35], [0, 5.98], [-0.45, 5.35]], -HW - 0.4, HW + 0.4));   // the gable's infill under the tiles
  P.add('tile_dark', prismX([[-0.12, 6.08], [0.12, 6.08], [0.12, 6.22], [-0.12, 6.22]], -HW - 0.4, HW + 0.4));      // the ridge
  for (const s of [-1, 1]) { P.add('tile_dark', T(ball(0.14, 0.2, 0.12, 8, 4), s * (HW + 0.42), 6.26, 0)); P.add('tile_dark', limb([s * (HW + 0.25), 5.12, 1.12], [s * (HW + 0.45), 5.3, 1.22], 0.04, 0.025, 5)); P.add('tile_dark', limb([s * (HW + 0.25), 5.12, -1.12], [s * (HW + 0.45), 5.3, -1.22], 0.04, 0.025, 5)); }
}
/** A well (jing): an octagonal wellhead of granite with a stone pad, a wooden bucket beside it. */
function well(P) {
  P.add('granite_block', box(-0.95, 0, -0.95, 0.95, 0.06, 0.95));
  P.add('granite_grey', lathe([[0.64, 0.06], [0.64, 0.6], [0.36, 0.6], [0.36, 0.14]], 8));
  P.add('lacquer_black', disc(0.36, 0.14, 8));
  P.add('timber', lathe([[0.001, 0], [0.12, 0], [0.15, 0.2], [0.14, 0.2], [0.11, 0.02]], 10, null, 0.8, 0.06, 0.2));
  P.add('bark_dark', limb([0.65, 0.58, 0.2], [0.86, 0.26, 0.2], 0.006, 0.006, 4));
}
/** A plant in a glazed tub on a low stone: 'shrub' (camellia in flower), 'bamboo', 'orchid'. */
function plant(P, kind, seed) {
  const r = rng(seed), s = kind === 'orchid' ? 0.75 : 1;
  P.add('granite_grey', lathe([[0.001, 0], [0.24 * s, 0], [0.24 * s, 0.1], [0.001, 0.1]], 10));
  const tub = kind === 'shrub' ? 'glaze_blue' : kind === 'bamboo' ? 'glaze_green' : 'glaze_white';
  P.add(tub, lathe([[0.001, 0.1], [0.15 * s, 0.1], [0.2 * s, 0.2], [0.24 * s, 0.42], [0.26 * s, 0.46], [0.22 * s, 0.46], [0.001, 0.4]], 14));
  P.add('ground', disc(0.22 * s, 0.44, 12));
  const y0 = 0.44;
  if (kind === 'shrub') {
    for (let k = 0; k < 3; k++) { const a = k * 2.1; P.add('bark_dark', limb([0, y0, 0], [Math.cos(a) * 0.12, y0 + 0.6, Math.sin(a) * 0.12], 0.025, 0.014, 5)); }
    const balls = [];
    for (let k = 0; k < 9; k++) { const a = r() * 6.28, d = 0.08 + r() * 0.2, h = y0 + 0.45 + r() * 0.5; balls.push([Math.cos(a) * d, h, Math.sin(a) * d]); P.add('lotus_leaf', T(ball(0.2, 0.15, 0.2, 7, 4), Math.cos(a) * d, h, Math.sin(a) * d)); }
    for (let k = 0; k < 16; k++) { const c = balls[k % balls.length], a = r() * 6.28, e = (r() - 0.2) * 1.2, rr = 0.2; P.add(r() < 0.75 ? 'cloth_red' : 'paint_white', T(ball(0.035, 0.03, 0.035, 5, 3), c[0] + Math.cos(a) * Math.cos(e) * rr * 0.97, c[1] + Math.sin(e) * 0.15 * 0.97, c[2] + Math.sin(a) * Math.cos(e) * rr * 0.97)); }
  } else if (kind === 'bamboo') {
    for (let k = 0; k < 8; k++) {
      const a = r() * 6.28, d = r() * 0.14, hh = 1.3 + r() * 0.8, lean = 0.1 + r() * 0.15, la = r() * 6.28;
      const b = [Math.cos(a) * d, y0, Math.sin(a) * d], tp = [b[0] + Math.cos(la) * lean, y0 + hh, b[2] + Math.sin(la) * lean];
      P.add('bamboo_culm', limb(b, tp, 0.014, 0.008, 5));
      for (let j = 1; j < 4; j++) { const t = j / 4; P.add('bamboo_culm', limb([b[0] + (tp[0] - b[0]) * t, y0 + hh * t - 0.01, b[2] + (tp[2] - b[2]) * t], [b[0] + (tp[0] - b[0]) * t, y0 + hh * t + 0.01, b[2] + (tp[2] - b[2]) * t], 0.017 - t * 0.006, 0.017 - t * 0.006, 5)); }
      for (let j = 0; j < 6; j++) { const t = 0.55 + j * 0.08, bx = b[0] + (tp[0] - b[0]) * t, bz = b[2] + (tp[2] - b[2]) * t, yy = y0 + hh * t, ang = r() * 3.14; P.add('lotus_leaf', T(ball(0.16, 0.012, 0.035, 6, 3), bx + Math.cos(ang) * 0.1, yy - 0.04, bz + Math.sin(ang) * 0.1, ang)); }
    }
  } else {
    for (let k = 0; k < 14; k++) {
      const a = k * 0.45 + r() * 0.3, L = 0.35 + r() * 0.25, up = [Math.cos(a) * 0.05, y0 + L * 0.7, Math.sin(a) * 0.05], tip = [Math.cos(a) * L * 0.9, y0 + L * 0.5, Math.sin(a) * L * 0.9];
      P.add('palm_leaf', limb([0, y0, 0], up, 0.008, 0.006, 3)); P.add('palm_leaf', limb(up, tip, 0.006, 0.002, 3));
    }
    for (let k = 0; k < 3; k++) { const a = k * 2.1 + 0.4, tp = [Math.cos(a) * 0.08, y0 + 0.55 + k * 0.05, Math.sin(a) * 0.08]; P.add('bamboo_culm', limb([0, y0, 0], tp, 0.004, 0.003, 3)); for (let j = 0; j < 3; j++) P.add('paint_white', T(ball(0.022, 0.016, 0.022, 5, 3), tp[0], tp[1] - j * 0.04, tp[2])); }
  }
}

/**
 * court_piece: { kind ('vat' | 'drum' | 'screen' | 'well' | 'plant'), at: [x, z], y, yaw, plant ('shrub' | 'bamboo' | 'orchid'), seed, w, h }
 * a piece of the residence's courts, turned by yaw about y (0 faces +z, the street).
 */
export function courtPiece(el, { bag, col }) {
  const P = new Parts(), [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, K = el.kind;
  if (K === 'vat') { vat(P); col.circle(x, z, 0.62, y, y + 1.0); }
  else if (K === 'drum') { drumStone(P); col.circle(x, z, 0.4, y, y + 0.8); }
  else if (K === 'gate_tower') { gateTower(P); for (const sx of [-1, 1]) col.rect([sx > 0 ? 1.15 : -2.7, -0.45, sx > 0 ? 2.7 : -1.15, 0.45].map((v, i) => v + (i % 2 ? z : x)), y, y + 6.4); col.rect([x - 1.15, z - 0.45, x + 1.15, z + 0.45], y + 2.7, y + 6.4); }
  else if (K === 'well') { well(P); col.circle(x, z, 0.66, y, y + 0.6); }
  else if (K === 'screen') {
    const w = el.w ?? 4.2, h = el.h ?? 3.3; screenWall(P, w, h);
    const c = Math.cos(yaw), s = Math.sin(yaw), hw = w / 2 + 0.1, hd = 0.34, ex = Math.abs(c) * hw + Math.abs(s) * hd, ez = Math.abs(s) * hw + Math.abs(c) * hd;
    col.rect([x - ex, z - ez, x + ex, z + ez], y, y + h + 0.3);
  } else { plant(P, el.plant ?? 'shrub', el.seed ?? 3); col.circle(x, z, 0.3, y, y + 0.6); }
  P.emit(bag, x, y, z, yaw);
}
void W;
