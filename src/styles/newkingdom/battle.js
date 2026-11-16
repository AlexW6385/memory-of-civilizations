// The war reliefs on the outside of the Great Hypostyle Hall (docs/settlements/thebes.md §4.1): Seti I's campaigns on the north wall and
// Ramesses II's on the south, in registers, in raised relief that has weathered to the colour of the stone. Built of convex polygons
// (kit.prism): the king in his chariot drawing the bow over a team at full gallop, the fallen and the fleeing, the Egyptian archers and the
// ladder against the fortress with its crenellated tower and its defenders tumbling from the wall, the king smiting captives, the line of
// bound prisoners led home. A scene is about 2.7 register-heights wide; a wall's scenes face toward its middle (where the gateway is).
import { fromTriangles } from '../../core/geom.js';
import { prism, rng, TAU } from './kit.js';

/** The drawing kit for one layer: every shape is raised d off the wall. */
function pen(T, place, d) {
  const P = (poly) => prism(T, poly, place, d);
  const rect = (u0, v0, u1, v1) => P([[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
  const line = (a, b, w) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
    P([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]);
  };
  const ell = (cx, cy, rx, ry, k = 8) => P(Array.from({ length: k }, (_, i) => [cx + Math.cos(i / k * TAU) * rx, cy + Math.sin(i / k * TAU) * ry]));
  return { P, rect, line, ell };
}

/** A standing man of height h at (cx, vb) looking along dir: head, torso, kilt, two legs in stride, two arms (reach, drop of the hand). */
function man(g, cx, vb, h, dir, o = {}) {
  const { P, line, ell } = g, hip = vb + h * 0.46, sh = vb + h * 0.8, st = (o.stride ?? 0.15) * h;
  line([cx - dir * h * 0.02, hip], [cx + dir * st, vb], h * 0.075);
  line([cx + dir * h * 0.02, hip], [cx - dir * st, vb], h * 0.075);
  P([[cx - h * 0.1, hip - h * 0.02], [cx + h * 0.1, hip - h * 0.02], [cx + h * 0.075, sh], [cx - h * 0.075, sh]]);
  P([[cx - h * 0.09, hip + 0.02 * h], [cx + dir * h * 0.16, hip - h * 0.14], [cx + dir * h * 0.14, hip - h * 0.2], [cx - h * 0.09, hip - h * 0.16]]);          // the kilt's front
  ell(cx + dir * h * 0.015, vb + h * 0.9, h * 0.075, h * 0.1);
  line([cx, sh - h * 0.03], [cx + dir * (o.reach ?? 0.26) * h, sh - (o.drop ?? 0.12) * h], h * 0.055);
  if (o.arm2 !== false) line([cx, sh - h * 0.05], [cx + dir * (o.reach2 ?? 0.12) * h, sh - (o.drop2 ?? 0.3) * h], h * 0.055);
}
/** A man laid on his back or face down on the ground (a fallen enemy) from (cx, vb) toward dir. */
function fallen(g, cx, vb, h, dir) {
  const { line, ell } = g;
  line([cx, vb + h * 0.1], [cx + dir * h * 0.55, vb + h * 0.14], h * 0.15);
  ell(cx + dir * h * 0.64, vb + h * 0.17, h * 0.08, h * 0.09);
  line([cx, vb + h * 0.1], [cx - dir * h * 0.2, vb + h * 0.42], h * 0.07); line([cx + dir * h * 0.05, vb + h * 0.14], [cx - dir * h * 0.02, vb + h * 0.52], h * 0.07);
  line([cx + dir * h * 0.4, vb + h * 0.2], [cx + dir * h * 0.55, vb + h * 0.52], h * 0.06);
}
/** A horse at full gallop, height h to the shoulders' top... the whole animal h high with its plume, facing dir; centre cx. */
function horse(g, cx, vb, h, dir, k = 0) {
  const { P, line, ell } = g, by = vb + h * 0.56, X = (u) => cx + dir * u * h;
  ell(cx, by, h * 0.42, h * 0.17, 10);
  P([[X(0.3), by + h * 0.08], [X(0.5), by + h * 0.36], [X(0.62), by + h * 0.28], [X(0.4), by - h * 0.1]]);                                     // the neck
  P([[X(0.5), by + h * 0.38], [X(0.62), by + h * 0.4], [X(0.78), by + h * 0.17], [X(0.74), by + h * 0.11], [X(0.56), by + h * 0.26]]);        // the head
  line([X(0.56), by + h * 0.4], [X(0.58 - 0.05 * k), by + h * 0.62], h * 0.05);                                                                // the plume
  line([X(0.3), by - h * 0.08], [X(0.72), vb + h * 0.3 + h * 0.06 * k], h * 0.065); line([X(0.26), by - h * 0.08], [X(0.6), vb + h * 0.1], h * 0.065);
  line([X(-0.3), by - h * 0.05], [X(-0.75), vb + h * 0.25], h * 0.065); line([X(-0.26), by - h * 0.05], [X(-0.55 - 0.05 * k), vb + h * 0.03], h * 0.065);
  line([X(-0.42), by + h * 0.05], [X(-0.7), by - h * 0.32], h * 0.05);                                                                          // the tail
}
/** The king's chariot with its team, the king drawing the bow: chariot at cx, height H (the horses' height), toward dir; returns the arrow's tip u. */
function chariot(g, cx, vb, H, dir) {
  const { P, line, ell } = g, X = (u) => cx + dir * u * H;
  ell(cx, vb + H * 0.2, H * 0.2, H * 0.2, 10);                                                                                             // the wheel
  P([[X(-0.38), vb + H * 0.25], [X(0.3), vb + H * 0.25], [X(0.3), vb + H * 0.6], [X(0.05), vb + H * 0.5], [X(-0.38), vb + H * 0.46]]);        // the box, its rail rising toward the front
  line([X(0.25), vb + H * 0.4], [X(0.95), vb + H * 0.56], H * 0.05);                                                                        // the pole to the yoke
  horse(g, X(1.2), vb, H, dir, 0); horse(g, X(1.12), vb + H * 0.04, H, dir, 1);
  man(g, X(-0.02), vb + H * 0.25, H * 0.8, dir, { stride: 0.06, reach: 0.34, drop: -0.02, reach2: 0.26, drop2: 0.0 });                      // the king, both arms drawing
  const bx = X(0.42), by = vb + H * 0.25 + H * 0.56;                                                                                         // the bow: a curve of three strokes and its string
  const B = [[0.0, 0.26], [0.09, 0.12], [0.09, -0.08], [0.0, -0.22]].map(([u, v]) => [bx + dir * u * H, by + v * H]);
  line(B[0], B[1], H * 0.045); line(B[1], B[2], H * 0.045); line(B[2], B[3], H * 0.045); line(B[0], B[3], H * 0.02);
  line([X(-0.2), vb + H * 0.52], [X(-0.38), vb + H * 0.95], H * 0.05);                                                                       // the quiver at his back
  for (const dv of [-0.08, 0.02, 0.12]) line([bx + dir * H * 0.1, by + dv * H], [bx + dir * H * (1.0 + dv), by + dv * H * 0.2 - H * 0.1], H * 0.02);   // arrows in flight
  return X(1.95);
}
/** An Egyptian archer kneeling-free: a standing bowman of height h. */
function archer(g, cx, vb, h, dir) {
  const { line } = g;
  man(g, cx, vb, h, dir, { reach: 0.34, drop: 0.02, reach2: 0.22, drop2: 0.02, stride: 0.1 });
  const by = vb + h * 0.78;
  const B = [[0.0, 0.2], [0.08, 0.1], [0.08, -0.1], [0.0, -0.2]].map(([u, v]) => [cx + dir * (0.34 * h + u * h), by + v * h]);
  line(B[0], B[1], h * 0.05); line(B[1], B[2], h * 0.05); line(B[2], B[3], h * 0.05); line(B[0], B[3], h * 0.022);
}
/** A fortress of crenellated tower and wall: width w, height h, at (cx, vb). */
function fortress(g, cx, vb, w, h) {
  const { P, rect } = g, n = Math.max(3, Math.round(w / (h * 0.16)));
  P([[cx - w / 2 - w * 0.04, vb], [cx + w / 2 + w * 0.04, vb], [cx + w / 2, vb + h * 0.5], [cx - w / 2, vb + h * 0.5]]);                  // the battered foot
  rect(cx - w / 2, vb + h * 0.5, cx + w / 2, vb + h * 0.86);
  P([[cx - w / 2 - w * 0.06, vb + h * 0.86], [cx + w / 2 + w * 0.06, vb + h * 0.86], [cx + w / 2 + w * 0.06, vb + h * 0.92], [cx - w / 2 - w * 0.06, vb + h * 0.92]]);  // the corbelled platform
  for (let i = 0; i < n; i++) { const u0 = cx - w / 2 - w * 0.06 + i * (w * 1.12) / n; rect(u0 + w * 0.03, vb + h * 0.92, u0 + (w * 1.12) / n - w * 0.03, vb + h); }   // the crenellations
  rect(cx - w * 0.1, vb, cx + w * 0.1, vb + h * 0.32);                                                                                   // the gate
  for (const s of [-0.28, 0.28]) rect(cx + s * w - w * 0.025, vb + h * 0.58, cx + s * w + w * 0.025, vb + h * 0.78);                    // the slits
}

const SCENES = {
  // the fortress under attack: bowmen advancing, a ladder, the defenders on the wall and one falling
  siege(g, u0, u1, vb, H, dir, r) {
    const w = H * 0.95, fx = dir > 0 ? u1 - w * 0.62 : u0 + w * 0.62, h = H * 0.82;
    fortress(g.b, fx, vb, w, h);
    const { line } = g.f;
    for (let i = 0; i < 3; i++) archer(g.f, (dir > 0 ? u0 + H * 0.35 : u1 - H * 0.35) + dir * i * H * 0.5, vb, H * 0.55, dir);
    line([fx - dir * w * 0.58, vb], [fx - dir * w * 0.3, vb + h * 0.98], H * 0.04); line([fx - dir * w * 0.42, vb], [fx - dir * w * 0.14, vb + h * 0.98], H * 0.04);   // the ladder's rails
    for (let k = 1; k < 6; k++) line([fx - dir * (w * 0.58 - k * w * 0.048), vb + h * 0.16 * k], [fx - dir * (w * 0.42 - k * w * 0.048), vb + h * 0.16 * k], H * 0.025);
    for (const d of [-0.2, 0.18]) man(g.f, fx + d * w, vb + h, H * 0.34, -dir, { reach: 0.2, drop: -0.1, stride: 0 });
    man(g.f, fx - dir * w * 0.74, vb + H * 0.4, H * 0.34, -dir, { reach: 0.2, drop: -0.3, stride: 0.3 });                              // one tumbling from the wall
    fallen(g.f, fx - dir * w * 0.7, vb, H * 0.4, -dir);
    for (const dv of [0.2, 0.45, 0.7]) line([fx - dir * w * (1.5 - dv * 0.2), vb + H * (0.45 + dv * 0.4)], [fx - dir * w * (0.6 - dv * 0.1), vb + H * (0.62 + dv * 0.25)], H * 0.02);   // arrows against the wall
    void r;
  },
  // the king's charge: the chariot over the fallen and the fleeing
  charge(g, u0, u1, vb, H, dir, r) {
    const start = dir > 0 ? u0 + H * 0.5 : u1 - H * 0.5;
    chariot(g.f, start, vb, H * 0.62, dir);
    for (let i = 0; i < 4; i++) {
      const x = start + dir * (H * (1.55 + i * 0.33) + r() * 0.15 * H);
      if (i % 2 === 0) fallen(g.f, x, vb, H * 0.45, dir * (r() < 0.5 ? 1 : -1)); else man(g.f, x, vb + H * 0.04, H * 0.5, -dir, { stride: 0.3, reach: 0.2, drop: -0.25 });
    }
  },
  // the king smiting the captives he grasps by the hair, the mace raised
  smite(g, u0, u1, vb, H, dir) {
    const { P, line, ell } = g.f, cx = (u0 + u1) / 2 - dir * H * 0.3, h = H * 0.82;
    man(g.f, cx, vb, h, dir, { stride: 0.3, reach: 0.2, drop: -0.22, reach2: 0.3, drop2: 0.04 });
    line([cx + dir * h * 0.2, vb + h * 0.84], [cx + dir * h * 0.3, vb + h * 1.18], h * 0.05); ell(cx + dir * h * 0.3, vb + h * 1.2, h * 0.07, h * 0.08);    // the mace
    P([[cx - h * 0.06, vb + h * 0.94], [cx + h * 0.06, vb + h * 0.94], [cx + h * 0.08, vb + h * 1.1], [cx, vb + h * 1.16], [cx - h * 0.08, vb + h * 1.06]]);  // the crown
    for (let i = 0; i < 3; i++) { const x = cx + dir * (h * 0.52 + i * h * 0.17); man(g.f, x, vb, h * (0.5 - i * 0.04), -dir, { stride: 0.05, reach: 0.2, drop: 0.1 }); }
  },
  // the prisoners led home, bound at the elbows in a line, an officer before and behind with the staff
  march(g, u0, u1, vb, H, dir) {
    const { line } = g.f, a = dir > 0 ? u0 + H * 0.3 : u1 - H * 0.3;
    for (let i = 0; i < 5; i++) { const x = a + dir * (H * 0.55 + i * H * 0.38); man(g.f, x, vb, H * 0.62, dir, { stride: 0.17, reach: 0.12, drop: 0.28, arm2: false }); if (i) line([x - dir * H * 0.38 + dir * H * 0.06, vb + H * 0.4], [x - dir * H * 0.06, vb + H * 0.42], H * 0.02); }
    man(g.f, a, vb, H * 0.7, dir, { stride: 0.2, reach: 0.18, drop: 0.12 }); line([a + dir * H * 0.1, vb], [a + dir * H * 0.12, vb + H * 0.85], H * 0.025);
    man(g.f, a + dir * H * 2.5, vb, H * 0.7, dir, { stride: 0.2, reach: 0.18, drop: 0.12 });
  },
};
const KINDS = [['siege', 'charge', 'smite', 'march'], ['charge', 'siege', 'march', 'smite'], ['march', 'smite', 'charge', 'siege']];

/**
 * battle_wall(ctx, { a, b (the wall from a to b), n (its outward normal), y, v0 (the lowest ground line), reg (register height), nreg, seed })
 * ctx.bag may filter (hall.js `facing`), keeping only the triangles that face out.
 */
export function battleWall(ctx, el) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), U = [(bx - ax) / L, (bz - az) / L], N = el.n, y = el.y ?? 0;
  const place = (u, v, d) => [ax + U[0] * u + N[0] * (0.012 + d), y + v, az + U[1] * u + N[1] * (0.012 + d)];
  const T1 = [], T2 = [], r = rng(el.seed ?? 3);
  const g = { f: pen(T1, place, 0.075), b: pen(T2, place, 0.04), base: pen(T2, place, 0.04) };
  const sw = el.reg * 2.7, k = Math.max(2, Math.round((L - 3) / sw)), w = (L - 3) / k;
  for (let j = 0; j < el.nreg; j++) {
    const vb = el.v0 + j * el.reg, H = el.reg * 0.82;
    g.base.rect(0.6, vb - 0.07, L - 0.6, vb);                                                                                             // the ground line
    for (let i = 0; i < k; i++) {
      const u0 = 1.5 + i * w + 0.25, u1 = 1.5 + (i + 1) * w - 0.25, dir = (u0 + u1) / 2 < L / 2 ? 1 : -1;
      SCENES[KINDS[j % 3][(i + (el.seed ?? 0)) % 4]](g, u0, u1, vb + 0.05, H, dir, r);
    }
  }
  const vt = el.v0 + el.nreg * el.reg;
  g.base.rect(0.6, vt - 0.05, L - 0.6, vt + 0.06);                                                                                          // the frieze over the top register
  if (T1.length) ctx.bag.add('sandstone_relief', fromTriangles(T1));
  if (T2.length) ctx.bag.add('limestone_carved', fromTriangles(T2));
}
