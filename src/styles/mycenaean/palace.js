// The palace on the summit (docs/settlements/mycenae.md §4.4): wings of plastered mudbrick round the Great Court, the propylon, the court with its
// portico and altar, and the megaron — porch with two columns between the antae, vestibule, and the hall with its painted floor, the round hearth,
// four columns under a raised roof, the throne against the right-hand wall and the frescoes.

import { box, lathe, disc, frustum, fromTriangles, quad } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { minoanColumn } from '../minoan/index.js';
import { rng, mergeG } from './util.js';

const PLASTER = 'lime_plaster', SOCLE = 'rubble', ROOF = 'earth_wall', TIM = 'timber', RED = 'paint_minoan_red', BLUE = 'egyptian_blue', OCHRE = 'paint_ochre';
const fresco = (el, ctx) => STYLES.minoan.elements.fresco(el, ctx);

/** palace_wing: { rect, y, h, faces ('nsew' letters that carry windows and timber ties), seed } — a plastered block on a stone socle, flat roof with a parapet. */
export function palaceWing(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h, rand = rng(el.seed ?? 1), P = 0.35;
  bag.add(SOCLE, box(x0, y - 1.5, z0, x1, y + 0.9, z1));
  bag.add(PLASTER, box(x0 + 0.04, y + 0.9, z0 + 0.04, x1 - 0.04, y + h, z1 - 0.04));
  bag.add(ROOF, box(x0, y + h, z0, x1, y + h + 0.3, z1));
  bag.add(PLASTER, mergeG([box(x0, y + h + 0.3, z0, x1, y + h + 0.3 + P, z0 + 0.35), box(x0, y + h + 0.3, z1 - 0.35, x1, y + h + 0.3 + P, z1), box(x0, y + h + 0.3, z0, x0 + 0.35, y + h + 0.3 + P, z1), box(x1 - 0.35, y + h + 0.3, z0, x1, y + h + 0.3 + P, z1)]));
  col.rect(el.rect, y - 1.5, y + h + 0.3);
  const tie = [], win = [], T = 0.1;
  const faces = { n: [x0, z0, x1, z0, 0, -1], s: [x0, z1, x1, z1, 0, 1], w: [x0, z0, x0, z1, -1, 0], e: [x1, z0, x1, z1, 1, 0] };
  for (const f of el.faces ?? '') {
    const [ax, az, bx, bz, nx, nz] = faces[f], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    const put = (list, u0, u1, ya, yb, off) => {
      const p = [ax + ux * u0 + nx * off, az + uz * u0 + nz * off], q = [ax + ux * u1 + nx * (off + T), az + uz * u1 + nz * (off + T)];
      list.push(box(Math.min(p[0], q[0]), ya, Math.min(p[1], q[1]), Math.max(p[0], q[0]), yb, Math.max(p[1], q[1])));
    };
    for (const ya of h > 5 ? [y + 0.95, y + 3.3, y + h - 0.45] : [y + 0.95, y + h - 0.45]) put(tie, 0.1, L - 0.1, ya, ya + 0.14, -0.0);
    for (let u = 1.6 + rand() * 0.8; u < L - 1.2; u += 3 + rand() * 1.4) {
      put(win, u, u + 0.8, y + 1.7, y + 2.6, 0);
      if (h > 5) put(win, u, u + 0.8, y + 4.3, y + 5.1, 0);
    }
  }
  if (tie.length) bag.add(TIM, mergeG(tie));
  if (win.length) bag.add('opening', mergeG(win));
}

/** court: { rect, y } — the Great Court's plastered floor with its painted grid, the round altar and the portico's columns on the north side. */
export function court(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y;
  bag.add(PLASTER, frustum([x0, z0, x1, z1], y - 0.4, y, 0, 0, 0, 0, { noBottom: true }));
  col.floor(el.rect, y);
  const lines = [];
  for (let x = x0 + 2; x < x1 - 1; x += 2) lines.push(box(x - 0.04, y, z0, x + 0.04, y + 0.008, z1));
  for (let z = z0 + 2; z < z1 - 1; z += 2) lines.push(box(x0, y, z - 0.04, x1, y + 0.012, z + 0.04));
  bag.add(RED, mergeG(lines));
  // the round altar, its top blackened
  const [ax, az] = el.altar;
  bag.add('limestone_yellow', lathe([[1.0, 0], [0.9, 0.5], [0.001, 0.5]], 16, null, ax, y, az));
  bag.add('pottery_dark', lathe([[0.7, 0.5], [0.001, 0.52]], 12, null, ax, y, az));
  col.circle(ax, az, 0.95, y, y + 0.5);
  // the portico on the north side: columns, the beam, the roof sloping from the wall
  const zc = z0 + 2.4;
  for (let x = x0 + 4; x < x1 - 2; x += 4.4) minoanColumn(bag, col, x, zc, y, 3.7, 0.3);
  bag.add(TIM, box(x0 + 0.6, y + 3.7, zc - 0.25, x1 - 0.6, y + 4.1, zc + 0.25));
  bag.add(ROOF, box(x0 + 0.4, y + 4.1, z0, x1 - 0.4, y + 4.35, zc + 0.6));
  // the pavement edge: a kerb of limestone round the court
  bag.add('limestone_yellow', mergeG([box(x0, y, z1 - 0.3, x1, y + 0.05, z1), box(x0, y, z0, x1, y + 0.05, z0 + 0.3)]));
  void quad; void fromTriangles;
}

/** propylon: { rect: [x0, z0, x1, z1], y, wall (the court wall's x) } — a porch of two columns between antae and a door in the court's west wall. */
export function propylon(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, zm = (z0 + z1) / 2, H = 4.4;
  for (const [a, b] of [[z0, z0 + 1.0], [z1 - 1.0, z1]]) { bag.add(PLASTER, box(x0, y, a, x1, y + H, b)); col.rect([x0, a, x1, b], y, y + H); }
  for (const dz of [-1.1, 1.1]) minoanColumn(bag, col, x0 + 0.8, zm + dz, y, H - 0.4, 0.3);
  bag.add(TIM, box(x0 - 0.1, y + H - 0.4, z0, x1 + 1.0, y + H, z1));
  bag.add(ROOF, box(x0 - 0.2, y + H, z0 - 0.1, x1 + 1.0, y + H + 0.3, z1 + 0.1));
  // the stone threshold and the porch's floor
  bag.add('limestone_yellow', box(x0 - 0.5, y - 0.5, z0 + 0.8, x1 + 1.0, y, z1 - 0.8)); col.floor([x0 - 0.5, z0 + 1.0, x1 + 1.0, z1 - 1.0], y);
}

/**
 * megaron: { x0, x1, z0, z1, th, ax, y, seed } — the unit of porch (x0 …), vestibule and hall; the hall's hearth at its centre. The walls are the plan's 'wall'
 * elements; this builds the floors, ceilings, columns, hearth, throne, frescoes and lamps.
 */
export function megaron(el, ctx) {
  const { bag, col, lights } = ctx, y = el.y, ax = el.ax, rand = rng(el.seed ?? 3);
  const { x0, x1, th } = el, zi0 = el.z0 + th, zi1 = el.z1 - th;
  const xP = x0 + 6.4, xV = xP + 0.9, xV1 = xV + 3.7, xH = xV1 + 0.9, hallLen = x1 - th - xH, hx = xH + hallLen / 2;
  const hearth = [hx, ax];
  // ── floors: plastered, painted ──
  bag.add(PLASTER, frustum([x0, zi0, xP, zi1], y - 0.4, y, 0, 0, 0, 0, { noBottom: true })); col.floor([x0, zi0, xP, zi1], y);
  bag.add(PLASTER, frustum([xV, zi0, xV1, zi1], y - 0.4, y, 0, 0, 0, 0, { noBottom: true })); col.floor([xV, zi0, xV1, zi1], y);
  bag.add(PLASTER, frustum([xH, zi0, x1 - th, zi1], y - 0.4, y, 0, 0, 0, 0, { noBottom: true })); col.floor([xH, zi0, x1 - th, zi1], y);
  // the door sills joining them
  bag.add(PLASTER, mergeG([box(xP, y - 0.4, ax - 1.3, xV, y, ax + 1.3), box(xV1, y - 0.4, ax - 1.3, xH, y, ax + 1.3)]));
  col.floor([xP, ax - 1.3, xV, ax + 1.3], y); col.floor([xV1, ax - 1.3, xH, ax + 1.3], y);
  // the hall's floor in painted squares of a metre, a white joint between
  const paints = [RED, OCHRE, BLUE, 'paint_white'], sq = [[], [], [], []];
  for (let i = 0; i < Math.floor(hallLen); i++) for (let j = 0; j < Math.floor(zi1 - zi0); j++) {
    const k = (i * 3 + j * 5 + Math.floor(rand() * 2)) % 4, u0 = xH + 0.04 + i + (hallLen % 1) / 2, v0 = zi0 + 0.04 + j + ((zi1 - zi0) % 1) / 2;
    sq[k].push(box(u0, y, v0, u0 + 0.92, y + 0.01, v0 + 0.92));
  }
  paints.forEach((m, k) => sq[k].length && bag.add(m, mergeG(sq[k])));
  // the porch and the vestibule: a band of paint along the walls
  bag.add(RED, mergeG([box(x0 + 0.3, y, zi0, xP - 0.2, y + 0.01, zi0 + 0.3), box(x0 + 0.3, y, zi1 - 0.3, xP - 0.2, y + 0.01, zi1), box(xV + 0.2, y, zi0, xV1 - 0.2, y + 0.01, zi0 + 0.3), box(xV + 0.2, y, zi1 - 0.3, xV1 - 0.2, y + 0.01, zi1)]));
  // ── the hearth: a round platform 3.7 m across, painted in rings, the fire on it ──
  const R = 1.85;
  bag.add(PLASTER, lathe([[R, 0.012], [R, 0.2], [R - 0.1, 0.23], [0.001, 0.23]], 28, null, hx, y, ax));
  const rings = [[R - 0.15, RED], [R - 0.5, 'paint_white'], [R - 0.65, BLUE], [R - 1.0, OCHRE], [R - 1.3, 'paint_white']];
  rings.forEach(([r, m], i) => bag.add(m, disc(r, y + 0.232 + i * 0.002, 28, hx, ax)));
  bag.add('pottery_dark', disc(0.7, y + 0.245, 14, hx, ax));
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4; bag.add(TIM, box(hx + Math.cos(a) * 0.25 - 0.4, y + 0.25, ax + Math.sin(a) * 0.25 - 0.06, hx + Math.cos(a) * 0.25 + 0.4, y + 0.37, ax + Math.sin(a) * 0.25 + 0.06)); }
  bag.add('flame', lathe([[0.3, 0], [0.2, 0.2], [0.09, 0.45], [0.001, 0.65]], 8, (t) => 1 + 0.2 * Math.sin(t * 3), hx, y + 0.3, ax));
  lights.push({ at: [hx, y + 0.9, ax], color: '#ffa24d', intensity: 7, distance: 13 });
  for (const dz of [-1.9, 1.9]) minoanColumn(bag, col, x0 + 0.9, ax + dz, y, 4.3, 0.33);
  // ── the four columns round the hearth, under the raised roof ──
  const HC = 5.7, HR = 7.0, cd = 2.15;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) minoanColumn(bag, col, hx + sx * cd, ax + sz * cd, y, HR - 0.2, 0.38);
  // ── ceilings and roofs: the porch and the vestibule lower, the hall's with a raised roof (the clerestory) over the hearth ──
  const lowY = y + 4.7;
  bag.add(TIM, box(x0 - 0.05, lowY - 0.4, el.z0, xH, lowY, el.z1)); bag.add(ROOF, box(x0 - 0.05, lowY, el.z0 - 0.1, xH, lowY + 0.3, el.z1 + 0.1));
  const hole = [hx - 3.2, ax - 3.2, hx + 3.2, ax + 3.2], hall = [xH - 0.05, el.z0 - 0.1, x1 + 0.05, el.z1 + 0.1];
  const Y0 = y + HC;
  const pieces = [[hall[0], hall[1], hall[2], hole[1]], [hall[0], hole[3], hall[2], hall[3]], [hall[0], hole[1], hole[0], hole[3]], [hole[2], hole[1], hall[2], hole[3]]];
  for (const r of pieces) { bag.add(TIM, box(r[0], Y0 - 0.4, r[1], r[2], Y0, r[3])); bag.add(ROOF, box(r[0], Y0, r[1], r[2], Y0 + 0.3, r[3])); }
  // the beams that carry it, across the hall
  const beams = [];
  for (let u = xH + 1.2; u < x1 - th - 0.6; u += 1.6) beams.push(box(u - 0.12, Y0 - 0.65, zi0, u + 0.12, Y0 - 0.4, zi1));
  bag.add(TIM, mergeG(beams));
  // the raised roof on the four columns, open all round
  bag.add(TIM, box(hole[0] - 0.4, y + HR - 0.4, hole[1] - 0.4, hole[2] + 0.4, y + HR, hole[3] + 0.4)); bag.add(ROOF, box(hole[0] - 0.5, y + HR, hole[1] - 0.5, hole[2] + 0.5, y + HR + 0.3, hole[3] + 0.5));
  // ── the throne against the right-hand (south) wall, an offering table beside it ──
  const tx = hx, tz = zi1;
  bag.add('limestone_yellow', mergeG([box(tx - 0.7, y, tz - 1.0, tx + 0.7, y + 0.2, tz), box(tx - 0.55, y + 0.2, tz - 0.85, tx + 0.55, y + 0.5, tz), box(tx - 0.55, y + 0.5, tz - 0.22, tx + 0.55, y + 1.7, tz)]));
  bag.add(RED, box(tx - 0.45, y + 0.9, tz - 0.235, tx + 0.45, y + 1.5, tz - 0.22));
  col.rect([tx - 0.7, tz - 1.0, tx + 0.7, tz], y, y + 1.7);
  bag.add(TIM, mergeG([box(tx + 1.2, y + 0.62, tz - 0.8, tx + 2.0, y + 0.68, tz - 0.2), ...[[1.25, 0.25], [1.95, 0.25], [1.25, 0.75], [1.95, 0.75]].map(([a, b]) => box(tx + a - 0.04, y, tz - b - 0.04, tx + a + 0.04, y + 0.62, tz - b + 0.04))]));
  col.rect([tx + 1.2, tz - 0.8, tx + 2.0, tz - 0.2], y, y + 0.68);
  bag.add('terracotta', lathe([[0.001, 0], [0.09, 0.02], [0.14, 0.12], [0.07, 0.24], [0.08, 0.28], [0.001, 0.28]], 10, null, tx + 1.45, y + 0.68, tz - 0.5));
  bag.add('silver', lathe([[0.001, 0], [0.07, 0], [0.09, 0.1], [0.001, 0.1]], 10, null, tx + 1.75, y + 0.68, tz - 0.5));
  // the libation channel: a groove of dark stone running from the throne to the hearth
  bag.add('pottery_dark', box(tx - 0.04, y, hearth[1] + R, tx + 0.04, y + 0.012, tz - 1.0));
  // ── the walls' dado and the frescoes ──
  bag.add(RED, mergeG([box(xH, y, zi0, x1 - th, y + 0.9, zi0 + 0.012), box(xH, y, zi1 - 0.012, x1 - th, y + 0.9, zi1), box(x1 - th - 0.012, y, zi0, x1 - th, y + 0.9, zi1)]));
  bag.add(OCHRE, mergeG([box(xH, y + 4.0, zi0, x1 - th, y + 4.5, zi0 + 0.012), box(xH, y + 4.0, zi1 - 0.012, x1 - th, y + 4.5, zi1), box(x1 - th - 0.012, y + 4.0, zi0, x1 - th, y + 4.5, zi1)]));
  fresco({ kind: 'griffin', at: [tx - 3.0, zi1 - 0.002], face: 'n', y0: y + 1.7, w: 3.2, h: 1.7, bg: 'wall_red', d: 0.02 }, ctx);
  fresco({ kind: 'griffin', at: [tx + 4.2, zi1 - 0.002], face: 'n', y0: y + 1.7, w: 3.2, h: 1.7, bg: 'wall_red', d: 0.02, flip: true }, ctx);
  fresco({ kind: 'procession', at: [hx, zi0 + 0.002], face: 's', y0: y + 1.2, w: Math.min(hallLen - 1, 9), h: 2.3, bg: 'plaster_white', d: 0.02 }, ctx);
  fresco({ kind: 'bull_leaping', at: [x1 - th - 0.002, ax], face: 'w', y0: y + 1.4, w: 3.4, h: 1.9, bg: BLUE, d: 0.02 }, ctx);
  // the doors' timber frames and the lamps
  for (const x of [xP, xV1]) bag.add(TIM, mergeG([box(x - 0.1, y, ax - 1.45, x + 1.0, y + 3.5, ax - 1.3), box(x - 0.1, y, ax + 1.3, x + 1.0, y + 3.5, ax + 1.45)]));
  lights.push({ at: [xH + 1.5, y + 3.2, zi0 + 1], color: '#ffb46b', intensity: 4, distance: 9 }, { at: [x1 - th - 1.5, y + 3.2, zi1 - 1], color: '#ffb46b', intensity: 4, distance: 9 });
  lights.push({ at: [(xV + xV1) / 2, y + 3, ax], color: '#ffb46b', intensity: 3, distance: 8 });
  // two bronze braziers either side of the hall's door, a tall pithos by the wall
  for (const s of [-1, 1]) { bag.add('bronze', lathe([[0.3, 0], [0.12, 0.04], [0.06, 0.3], [0.06, 0.8], [0.22, 0.9], [0.001, 0.9]], 10, null, xH + 0.9, y, ax + s * 2.2)); col.circle(xH + 0.9, ax + s * 2.2, 0.28, y, y + 0.9); }
  bag.add('terracotta', lathe([[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]], 14, null, x1 - th - 0.7, y, zi0 + 0.7)); col.circle(x1 - th - 0.7, zi0 + 0.7, 0.45, y, y + 1.2);
  void STYLES;
}
