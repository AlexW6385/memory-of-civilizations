// The gorge floor and the village (docs/settlements/ajanta.md §6, §7): the Waghora's water and its ford of stepping
// stones, the waterfall and its pool, the workers' mud huts with thatch, a pilgrims' shelter, the painters' scaffold.
import { box, lathe, quad, fromTriangles, rod, frustum, disc } from '../../core/geom.js';
import { RIVER, riverX, inRiver, FALL, FORD, RADIUS, XF, FLOOR } from '../../settlements/ajanta/layout.js';

const up = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2]; if (uz * vx - ux * vz >= 0) o.push(...t.slice(i, i + 9)); else o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); } return o; };

/** The river's water in 2 m steps along z, clipped to the disc. */
function river(el, { bag }) {
  const t = [], y = RIVER.water, w = RIVER.w / 2 - 0.2;
  for (let z0 = -130; z0 < 130; z0 += 2) {
    const z1 = z0 + 2.02, a = riverX(z0), b = riverX(z1);
    if (!inRiver(a, z0, -3) || !inRiver(b, z1, -3)) continue;
    t.push(a - w, y, z0, b - w, y, z1, b + w, y, z1, a - w, y, z0, b + w, y, z1, a + w, y, z0);
  }
  if (t.length) bag.add('water', fromTriangles(up(t)));
}
/** Stepping stones across the river at the ford: flat stones whose tops stand just over the water. */
function ford(el, { bag, col }) {
  const z = FORD.z, xr = riverX(z), n = 13;
  for (let i = 0; i < n; i++) {
    const x = xr - 6.2 + i * 1.04, dz = Math.sin(i * 2.1) * 0.25;
    bag.add('rubble', box(x - 0.6, RIVER.bed, z - 0.55 + dz, x + 0.6, -0.02, z + 0.55 + dz));
    col.floor([x - 0.6, z - 0.55 + dz, x + 0.6, z + 0.55 + dz], -0.02);
  }
}
/** The waterfall: a sheet of water down the north wing's face into its pool, foam at the foot. */
function fall(el, { bag }) {
  const { x, z, w, pool, pr } = FALL, top = 27.5, segs = 6;
  for (let k = 0; k < segs; k++) {
    const y0 = top - (k + 1) * (top / segs), y1 = top - k * (top / segs), o = (k / segs) ** 2 * 0.5, o1 = ((k + 1) / segs) ** 2 * 0.5;
    const wk = w * (1 + k * 0.12);
    bag.add('water_jet', box(x - wk / 2, y0, z + o - 0.06 + 0.2, x + wk / 2, y1, z + o1 + 0.2));
  }
  bag.add('foam', lathe([[0.001, 0], [1.9, 0.0], [1.6, 0.12], [0.8, 0.2], [0.001, 0.2]], 12, null, x, -0.2, z + 1.4));
  bag.add('water', disc(pr - 0.3, -0.15, 20, pool[0], pool[1]));
}
/** A worker's hut: mud walls with a low door, a thatch roof from a hip; rect [x0, z0, x1, z1], the door on side `front` (n/s/e/w). */
function hut(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, f = el.front ?? 's', wall = el.high ?? 2.3, t = 0.35, y = 0;
  const mud = el.mud ?? 'mud_plaster';
  const door = 0.55, dw = 0.5, dh = 1.7;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const W = (a, b, c, d) => { bag.add(mud, box(a, y, b, c, y + wall, d)); col.rect([a, b, c, d], y, y + wall); };
  // four walls; the door's gap in the front one, a lintel over it
  const gap = (lo, hi, c) => [[lo, c - dw], [c + dw, hi]];
  if (f === 's') { for (const [a, b] of gap(x0, x1, cx)) W(a, z1 - t, b, z1); bag.add(mud, box(cx - dw, y + dh, z1 - t, cx + dw, y + wall, z1)); } else W(x0, z1 - t, x1, z1);
  if (f === 'n') { for (const [a, b] of gap(x0, x1, cx)) W(a, z0, b, z0 + t); bag.add(mud, box(cx - dw, y + dh, z0, cx + dw, y + wall, z0 + t)); } else W(x0, z0, x1, z0 + t);
  if (f === 'w') { for (const [a, b] of gap(z0, z1, cz)) W(x0, a, x0 + t, b); bag.add(mud, box(x0, y + dh, cz - dw, x0 + t, y + wall, cz + dw)); } else W(x0, z0 + t, x0 + t, z1 - t);
  if (f === 'e') { for (const [a, b] of gap(z0, z1, cz)) W(x1 - t, a, x1, b); bag.add(mud, box(x1 - t, y + dh, cz - dw, x1, y + wall, cz + dw)); } else W(x1 - t, z0 + t, x1, z1 - t);
  void door;
  bag.add('earth_wall', box(x0 + t, y - 0.1, z0 + t, x1 - t, y + 0.02, z1 - t)); col.floor([x0 + t, z0 + t, x1 - t, z1 - t], 0.02);
  // the roof: a hip of thatch, overhanging, over a flat ceiling
  bag.add('thatch', frustum([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], y + wall - 0.1, y + wall + 1.3, 0.55, 0.55, 0.55, 0.55));
  bag.add('timber', box(x0 + t, y + wall - 0.1, z0 + t, x1 - t, y + wall, z1 - t));
  // a plinth of the mud's wash at the foot, a pot by the door
  bag.add('banco', box(x0 - 0.08, y, z0 - 0.08, x1 + 0.08, y + 0.28, z1 + 0.08));
}
/** A pilgrims' shelter: four posts, a plank bench, a thatch roof; rect. */
function shelter(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = 2.6;
  for (const x of [x0 + 0.2, x1 - 0.2]) for (const z of [z0 + 0.2, z1 - 0.2]) { bag.add('timber', rod([x, 0, z], [x, h, z], 0.1, 6)); col.circle(x, z, 0.12, 0, h); }
  bag.add('thatch', frustum([x0 - 0.5, z0 - 0.5, x1 + 0.5, z1 + 0.5], h, h + 1.2, 0.7, 0.7, 0.7, 0.7));
  bag.add('planks_grey', box(x0 + 0.3, 0.4, z1 - 0.9, x1 - 0.3, 0.5, z1 - 0.3)); col.rect([x0 + 0.3, z1 - 0.9, x1 - 0.3, z1 - 0.3], 0, 0.5);
  bag.add('earth_wall', box(x0, -0.05, z0, x1, 0.06, z1)); col.floor([x0, z0, x1, z1], 0.06);
}
/** The painters' scaffold against a wall: `at` the wall's foot at the scaffold's left end, w along the wall (axis 'x' or 'z'), standing out to `side` (±1) by 1.3 m: poles, lashed planks on levels, a rail, a ladder; at floor y. */
function scaffold(el, { bag, col }) {
  const [ax, az] = el.at, w = el.w ?? 5, h = el.h ?? 3.6, n = el.levels ?? 2, s = el.side ?? 1, y = el.y ?? 0, lv = h / n, out = 1.3, A = el.axis ?? 'x';
  // (a, b): a along the wall, b out from it; mapped to the world
  const a0 = A === 'x' ? ax : az, b0 = A === 'x' ? az : ax;
  const bx = (a1, y1, b1, a2, y2, b2) => { const p = Math.min(b0 + s * b1, b0 + s * b2), q = Math.max(b0 + s * b1, b0 + s * b2); return A === 'x' ? box(a0 + a1, y + y1, p, a0 + a2, y + y2, q) : box(p, y + y1, a0 + a1, q, y + y2, a0 + a2); };
  const rd = (a1, y1, b1, a2, y2, b2, r) => { const P = [a0 + a1, y + y1, b0 + s * b1], Q = [a0 + a2, y + y2, b0 + s * b2]; return A === 'x' ? rod(P, Q, r, 6) : rod([P[2], P[1], P[0]], [Q[2], Q[1], Q[0]], r, 6); };
  const k = Math.max(1, Math.round(w / 1.6));
  for (let i = 0; i <= k; i++) {
    const a = i * w / k;
    bag.add('log_pine', rd(a, 0, out, a, h + 0.9, out, 0.05));
    const px = A === 'x' ? a0 + a : b0 + s * out, pz = A === 'x' ? b0 + s * out : a0 + a;
    col.circle(px, pz, 0.06, y, y + h + 0.9);
    for (let j = 1; j <= n; j++) bag.add('log_pine', rd(a, j * lv - 0.1, 0.06, a, j * lv - 0.1, out, 0.04));
  }
  for (let j = 1; j <= n; j++) {
    bag.add('planks_grey', bx(-0.05, j * lv - 0.08, 0.05, w + 0.05, j * lv, out + 0.1));
    const r = A === 'x' ? [a0 - 0.05, Math.min(b0 + s * 0.05, b0 + s * (out + 0.1)), a0 + w + 0.05, Math.max(b0 + s * 0.05, b0 + s * (out + 0.1))] : [Math.min(b0 + s * 0.05, b0 + s * (out + 0.1)), a0 - 0.05, Math.max(b0 + s * 0.05, b0 + s * (out + 0.1)), a0 + w + 0.05];
    col.floor(r, y + j * lv);
    bag.add('log_pine', rd(0, j * lv + 0.95, out, w, j * lv + 0.95, out, 0.03));
  }
  for (let j = 0; j < n; j++) bag.add('log_pine', rd(w * 0.5, j * lv, out + 0.55, w * 0.5 - 0.3, (j + 1) * lv + 0.2, out + 0.1, 0.035));
  void RADIUS; void XF; void FLOOR;
}
/** A heap of rubble and stone chips (the masons' waste) at the foot of the cliff: rect, n pieces. */
function chips(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, r = (i) => { const v = Math.sin(i * 91.7 + (el.seed ?? 1) * 7.3) * 43758.5453; return v - Math.floor(v); };
  for (let i = 0; i < (el.n ?? 14); i++) { const x = x0 + r(i) * (x1 - x0), z = z0 + r(i + 50) * (z1 - z0), s = 0.12 + r(i + 90) * 0.3; bag.add('rubble', box(x - s, 0, z - s, x + s, s * 1.1, z + s)); }
}
export const VILLAGE_ELEMENTS = { aj_river: river, aj_ford: ford, aj_fall: fall, aj_hut: hut, aj_shelter: shelter, aj_scaffold: scaffold, aj_chips: chips };
