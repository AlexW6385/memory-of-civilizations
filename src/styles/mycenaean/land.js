// The walls and cuttings of the land round Mycenae (docs/settlements/mycenae.md §5.3): dry-stone terrace and field walls that follow the ground, the facades
// of the chamber tombs cut into the hillsides, the stone-lined spring basin.

import { box, lathe, place } from '../../core/geom.js';
import { rng, mergeG } from './util.js';

/** dry_wall: { pts: [[x, z], ...], ys: [ground at each point], h, th, seed } — a wall of fitted rubble with a cap of boulders, its base following the ground. */
export function dryWall(el, { bag, col }) {
  const rand = rng(el.seed ?? 1), th = el.th ?? 0.55, H = el.h ?? 1.0, body = [], cap = [];
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const [ax, az] = el.pts[i], [bx, bz] = el.pts[i + 1], ya = el.ys[i], yb = el.ys[i + 1], L = Math.hypot(bx - ax, bz - az);
    if (L < 0.05) continue;
    const n = Math.max(1, Math.round(L / 1.3)), yaw = -Math.atan2(bz - az, bx - ax);
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n, tm = (t0 + t1) / 2, l = L / n, g = Math.min(ya + (yb - ya) * t0, ya + (yb - ya) * t1), top = Math.max(ya + (yb - ya) * t0, ya + (yb - ya) * t1) + H * (0.85 + rand() * 0.3);
      const x = ax + (bx - ax) * tm, z = az + (bz - az) * tm;
      body.push(place(box(-l / 2 - 0.02, g - 0.7, -th / 2 - rand() * 0.06, l / 2 + 0.02, top - 0.14, th / 2 + rand() * 0.06), x, 0, z, yaw));
      cap.push(place(box(-l / 2 + 0.02, top - 0.16, -th / 2 - 0.05, l / 2 - 0.02, top + 0.02 + rand() * 0.08, th / 2 + 0.05), x, 0, z, yaw));
      col.segment([x - Math.cos(yaw) * l / 2, z + Math.sin(yaw) * l / 2], [x + Math.cos(yaw) * l / 2, z - Math.sin(yaw) * l / 2], th, g - 0.2, top);
    }
  }
  if (body.length) { bag.add('rubble', mergeG(body)); bag.add('rock_boulder', mergeG(cap)); }
}

/** chamber_tomb: { at: [x, z] (the door's foot), y, rot (the turn of the way out; local +z), seed } — the dressed facade of a rock-cut chamber tomb: wings of rubble holding the slope, a doorway under a lintel, blocked with stones. */
export function chamberTomb(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, rot = el.rot ?? 0, rand = rng(el.seed ?? 1), dress = [], rub = [], stones = [];
  const P = (g) => place(g, x, 0, z, rot);
  rub.push(P(box(-1.9, y - 1.4, -0.9, 1.9, y + 3.4, 0.0)));
  for (const s of [-1, 1]) {
    rub.push(P(box(s > 0 ? 1.9 : -3.0, y - 1.8, -0.9, s > 0 ? 3.0 : -1.9, y + 2.7, 3.2)));
    col.rect(rectOf(x, z, rot, s > 0 ? 1.9 : -3.0, -0.9, s > 0 ? 3.0 : -1.9, 3.2), y - 1.0, y + 2.7);
  }
  dress.push(P(box(-0.95, y, -0.12, -0.55, y + 2.1, 0.12)), P(box(0.55, y, -0.12, 0.95, y + 2.1, 0.12)), P(box(-1.2, y + 2.1, -0.15, 1.2, y + 2.55, 0.15)));
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) stones.push(P(box(-0.55 + c * 0.37 + rand() * 0.03, y + r * 0.4, -0.35, -0.2 + c * 0.37, y + r * 0.4 + 0.37, -0.1)));
  col.rect(rectOf(x, z, rot, -1.9, -0.9, 1.9, 0.12), y - 1.0, y + 3.4);
  bag.add('rubble', mergeG(rub)); bag.add('limestone_yellow', mergeG(dress)); bag.add('rock_boulder', mergeG(stones));
  bag.add('flagstone', P(box(-1.1, y - 0.3, 0.0, 1.1, y - 0.02, 2.4)));
}
/** The plan rectangle (axis-aligned bound) of a local rectangle turned by rot about (x, z). */
function rectOf(x, z, rot, u0, v0, u1, v1) {
  const c = Math.cos(rot), s = Math.sin(rot), xs = [], zs = [];
  for (const [u, v] of [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]) { xs.push(x + c * u + s * v); zs.push(z - s * u + c * v); }
  return [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
}

/** basin: { at, y, rot, seed } — the spring's basin: a stone trough with a back wall, a step and the water, jars standing round. */
export function basin(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, rot = el.rot ?? 0, P = (g) => place(g, x, 0, z, rot);
  bag.add('limestone_yellow', mergeG([P(box(-1.6, y - 0.6, -0.6, 1.6, y + 0.55, -0.4)), P(box(-1.6, y - 0.6, 0.6, 1.6, y + 0.55, 0.8)), P(box(-1.6, y - 0.6, -0.6, -1.4, y + 0.55, 0.8)), P(box(1.4, y - 0.6, -0.6, 1.6, y + 0.55, 0.8)), P(box(-1.6, y - 0.6, -0.6, 1.6, y + 0.1, 0.8))]));
  bag.add('water', P(box(-1.4, y + 0.38, -0.4, 1.4, y + 0.4, 0.6)));
  bag.add('rock_boulder', mergeG([P(box(-2.0, y - 0.6, -1.4, 2.0, y + 1.6, -0.9)), P(box(-1.8, y + 1.6, -1.3, 1.8, y + 1.85, -0.95))]));
  bag.add('timber', P(box(-0.12, y + 0.9, -0.9, 0.12, y + 1.0, -0.2)));      // the spout's trough
  bag.add('limestone_yellow', P(box(-1.2, y - 0.6, 0.8, 1.2, y + 0.12, 1.6)));
  col.rect(rectOf(x, z, rot, -2.0, -1.4, 2.0, 0.8), y - 1.0, y + 1.6);
  void lathe;
}
