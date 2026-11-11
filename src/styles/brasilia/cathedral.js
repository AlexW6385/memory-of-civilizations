// The Metropolitan Cathedral (docs/settlements/brasilia.md §1b): sixteen concrete columns on a ring 70 m across leaning together
// into a hyperboloid, the coloured glazing between them, a reflecting pool round it with the tunnel passing under, the nave sunk
// 4.5 m below the plaza (pews, the altar, three angels hung on cables), the bell tower, the baptistery's ovoid, the four Evangelists.
import { box, lathe, rod, disc, fromTriangles } from '../../core/geom.js';
import { revSurf, ring, wedgeZ, turnedBox, ringSegments, dAng, tri2, TAU } from './util.js';
import { CATH, TUNNEL, cathR } from '../../settlements/brasilia/layout.js';

const CONC = 'concrete_light';
const BAND = [['glaze_blue', 'stained_glass', 'glaze_green'], ['stained_glass', 'glaze_white', 'glaze_blue'], ['glaze_green', 'lacquer_chestnut', 'stained_glass'], ['glaze_white', 'glaze_blue', 'glaze_green']];

function angel(bag, x, y, z, s, yaw) {
  // a bronze angel hung by its cables: a long robe, a head, the arms out, two long swept wings
  const R = (g) => bag.add('bronze', g);
  R(lathe([[0.02, 0], [0.12, 0.2], [0.22, 0.9], [0.17, 1.5], [0.09, 1.9], [0.12, 2.0], [0.001, 2.05]].map(([r, h]) => [r * s, h * s]), 10, null, x, y, z));
  R(lathe([[0.001, 0], [0.09, 0.05], [0.1, 0.16], [0.001, 0.24]].map(([r, h]) => [r * s, h * s]), 8, null, x, y + 2.05 * s, z));
  const c = Math.cos(yaw), sn = Math.sin(yaw);
  for (const k of [-1, 1]) {
    R(turnedBox(x + k * 0.55 * s * c, z + k * 0.55 * s * sn, 1.0 * s, 0.06 * s, y + 1.35 * s, y + 1.45 * s, yaw + k * 0.2));               // the arm held out
    R(turnedBox(x + k * 0.8 * s * c - sn * 0.12 * s, z + k * 0.8 * s * sn + c * 0.12 * s, 1.4 * s, 0.05 * s, y + 1.45 * s, y + 2.1 * s + 0.0, yaw + k * 0.35));   // the wing
  }
}
function evangelist(bag, col, x, z, yaw, seed) {
  bag.add('granite_grey', box(x - 0.55, 0, z - 0.55, x + 0.55, 0.7, z + 0.55));
  bag.add('bronze', lathe([[0.42, 0], [0.4, 0.5], [0.32, 1.1], [0.3, 1.4], [0.2, 1.55], [0.001, 1.6]], 10, null, x, 0.7, z));
  bag.add('bronze', lathe([[0.001, 0], [0.11, 0.06], [0.12, 0.2], [0.001, 0.27]], 8, null, x, 0.7 + 1.55, z));
  const c = Math.cos(yaw), s = Math.sin(yaw), e = seed % 2 ? 1 : -1;
  bag.add('bronze', turnedBox(x - s * 0.3 * e, z + c * 0.3 * e, 0.12, 0.55, 0.7 + 1.0, 0.7 + 1.55, yaw));                      // an arm raised with a book or scroll
  bag.add('bronze', turnedBox(x + c * 0.32, z + s * 0.32, 0.34, 0.5, 0.7 + 1.1, 0.7 + 1.18, yaw + 0.3));
  col.circle(x, z, 0.75, 0, 2.4);
}

export function cathedral(el, { bag, col, lights }) {
  const [cx, cz] = CATH.c, R = CATH.R, F = CATH.floor, N = CATH.n;
  const tunnelAng = -Math.PI / 2, tHalf = 6 / (R - 1.2);
  // ── the pool's slab, its curbs, the water ──
  const wallR = R - 1.2;
  bag.add(CONC, ring(wallR, CATH.pool, 0.02, 96, cx, cz, true));
  bag.add(CONC, ring(wallR, CATH.pool, -0.6, 96, cx, cz, false));
  bag.add(CONC, revSurf([[CATH.pool, -0.6], [CATH.pool, 0.5]], 96, { cx, cz }));
  bag.add(CONC, revSurf([[CATH.pool - 0.4, 0.5], [CATH.pool - 0.4, 0.02]], 96, { cx, cz, flip: true }));
  bag.add(CONC, ring(CATH.pool - 0.4, CATH.pool, 0.5, 96, cx, cz, true));
  bag.add(CONC, revSurf([[R + 0.1, 0.02], [R + 0.1, 0.55]], 96, { cx, cz, flip: true }));
  bag.add(CONC, ring(R - 0.6, R + 0.1, 0.55, 96, cx, cz, true));
  bag.add('water', ring(R + 0.1, CATH.pool - 0.4, 0.3, 96, cx, cz, true));
  bag.add('granite_grey', ring(CATH.pool, CATH.pool + 14, 0.035, 96, cx, cz, true));
  ringSegments(col, cx, cz, CATH.pool - 0.2, 0.6, -0.55, 0.6, 96, (m) => Math.abs(dAng(m, tunnelAng)) < 7.5 / CATH.pool);
  ringSegments(col, cx, cz, R - 0.25, 1.0, -0.55, 0.6, 72, (m) => Math.abs(dAng(m, tunnelAng)) < 8 / R);
  // ── the nave: its wall (open where the tunnel comes in), floor, pews, altar, angels ──
  const gap = (th) => Math.abs(dAng(th, tunnelAng)) < tHalf;
  bag.add(CONC, revSurf([[wallR, 0.02], [wallR, F - 0.2]], 96, { cx, cz, skip: gap }));
  bag.add('marble_floor', disc(wallR + 0.02, F, 64, cx, cz, true));
  for (let k = 0; k < 6; k++) bag.add('marble_dark', ring(3 + k * 5.5, 3.2 + k * 5.5, F + 0.01, 64, cx, cz, true));        // inlaid rings in the floor
  for (let zz = -33; zz < 33; zz += 1) { const w = Math.sqrt(Math.max(0, wallR * wallR - (Math.abs(zz) + 0.5) ** 2)) - 0.1; if (w > 0.5) col.floor([cx - w, cz + zz, cx + w, cz + zz + 1], F); }
  // the altar at the south end on its steps; Our Lady's image above; the chapel beneath is only its steps
  const ax = cx, az = cz + 25;
  for (let k = 0; k < 3; k++) { bag.add('marble', box(ax - 8 + k * 1.2, F, az - 3 + k * 0.7, ax + 8 - k * 1.2, F + 0.22 * (k + 1), az + 5)); col.floor([ax - 8 + k * 1.2, az - 3 + k * 0.7, ax + 8 - k * 1.2, az + 5], F + 0.22 * (k + 1)); }
  bag.add('marble', box(ax - 1.4, F + 0.66, az, ax + 1.4, F + 1.75, az + 1.1)); col.rect([ax - 1.4, az, ax + 1.4, az + 1.1], F + 0.66, F + 1.8);
  bag.add('gilt_bronze', box(ax - 1.5, F + 1.75, az - 0.05, ax + 1.5, F + 1.82, az + 1.15));
  bag.add('bronze', rod([ax, F + 4.5, az + 3.2], [ax, F + 9.0, az + 3.2], 0.09, 6)); bag.add('bronze', rod([ax - 1.2, F + 7.7, az + 3.2], [ax + 1.2, F + 7.7, az + 3.2], 0.08, 6));   // the cross on its stem
  bag.add('plaster_white', box(ax - 1.0, F + 2.5, az + 3.8, ax + 1.0, F + 4.8, az + 3.9)); bag.add('cloth_blue', box(ax - 0.8, F + 2.8, az + 3.75, ax + 0.8, F + 4.6, az + 3.8));   // the image of Our Lady Aparecida
  col.rect([ax - 1.4, az, ax + 1.4, az + 1.1], F, F + 1.8);
  // pews: rows facing the altar with a central aisle, each block a low obstacle
  for (let r = 0; r < 12; r++) {
    const zz = cz - 20 + r * 2.5;
    const half = Math.sqrt(Math.max(0, (wallR - 1.2) ** 2 - (zz - cz) ** 2));
    for (const sg of [-1, 1]) {
      const xa = 2.4, xb = Math.min(13.5, half - 0.5); if (xb - xa < 2) continue;
      const a = cx + sg * xa, b = cx + sg * xb, lo = Math.min(a, b), hi = Math.max(a, b);
      bag.add('timber', box(lo, F + 0.02, zz, hi, F + 0.46, zz + 0.62)); bag.add('timber', box(lo, F + 0.46, zz - 0.04, hi, F + 1.02, zz + 0.06));
      bag.add('timber', box(lo, F, zz - 0.5, hi, F + 0.18, zz - 0.1));                                                   // the kneeler
      col.rect([lo, zz - 0.5, hi, zz + 0.62], F, F + 1.05);
    }
  }
  // the three angels, hung from the crown on steel cables at three heights over the nave
  const hang = [[cx - 4.5, cz + 3, 2.22, 0.2], [cx + 3.5, cz - 4, 3.4, 1.3], [cx + 2.5, cz + 9, 4.25, 2.4]];
  hang.forEach(([x, z, h, yaw], i) => { const y0 = [16, 19.5, 14][i], s = h / 2.05; angel(bag, x, y0, z, s, yaw); for (const dx of [-0.25, 0.25]) bag.add('steel_chrome', rod([x + dx * 0.5, y0 + 2.1 * s, z], [x + dx * 3, CATH.top - 3, z + (i - 1) * 2], 0.012, 4)); });
  // ── the columns (§1b): each a tapering shaft along the hyperbola of the roof, wide at the foot and slender at the waist ──
  const wt = (y) => 0.5 + 1.35 * (1 - Math.min(1, Math.max(0, y) / CATH.yw)) ** 1.5, wr = (y) => 0.45 + 0.75 * (1 - Math.min(1, Math.max(0, y) / CATH.yw)) ** 1.5;
  const ys = []; for (let k = 0; k <= 30; k++) ys.push(-0.6 + (CATH.top + 0.6) * (k / 30) ** 1.0);
  for (let i = 0; i < N; i++) {
    const th = i / N * TAU, ct = Math.cos(th), st = Math.sin(th), T = [];
    const ringAt = (y) => { const r = cathR(Math.max(0, y)), c = [cx + ct * r, cz + st * r], w = wt(y), d = wr(y); return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [c[0] - st * a * w + ct * b * d, y, c[1] + ct * a * w + st * b * d]); };
    let A = ringAt(ys[0]);
    for (let k = 1; k < ys.length; k++) {
      const B = ringAt(ys[k]);
      for (let j = 0; j < 4; j++) { const j2 = (j + 1) % 4; tri2(T, A[j], A[j2], B[j2]); tri2(T, A[j], B[j2], B[j]); }
      A = B;
    }
    const top = ringAt(CATH.top); tri2(T, top[0], top[1], top[2]); tri2(T, top[0], top[2], top[3]);
    bag.add(CONC, fromTriangles(T));
    // the glazing between this column and the next: a ruled strip on the roof's surface, in bands of colour
    const th2 = (i + 1) / N * TAU, GT = [[], [], []];
    const gy = [0, 5, 10, 15, 20, 25, 30];
    for (let k = 0; k < gy.length - 1; k++) {
      const band = Math.min(2, Math.floor(k / 2));
      for (const [y0, y1] of [[gy[k], gy[k + 1]]]) for (let u = 0; u < 5; u++) {
        const P = (y, uu) => { const r = cathR(y), d = wt(y) / r, a = th + d + (th2 - th - 2 * d) * uu / 5; return [cx + Math.cos(a) * (r - 0.1), y, cz + Math.sin(a) * (r - 0.1)]; };
        const a = P(y0, u), b = P(y0, u + 1), c2 = P(y1, u + 1), d2 = P(y1, u);
        GT[band].push(...a, ...b, ...c2, ...a, ...c2, ...d2, ...a, ...c2, ...b, ...a, ...d2, ...c2);
      }
    }
    for (let b = 0; b < 3; b++) bag.add(BAND[i % 4][b], fromTriangles(GT[b]));
  }
  // the crown: a ring beam and the skylight at the top
  bag.add(CONC, lathe([[cathR(CATH.top) + 0.5, CATH.top - 0.5], [cathR(CATH.top) + 0.5, CATH.top + 0.3], [cathR(CATH.top) - 0.9, CATH.top + 0.3], [cathR(CATH.top) - 0.9, CATH.top - 0.5]], 48, null, cx, 0, cz));
  bag.add('glass_outer', ring(0.01, cathR(CATH.top) - 0.9, CATH.top - 0.4, 32, cx, cz, false));
  // ── the tunnel and its ramp: walls, the floor, the roof is the pool's slab; a rail along the open ramp ──
  const { x0, x1, z0, zR } = TUNNEL, zN = cz - wallR + 0.6, wy0 = F - 0.3;
  bag.add('marble_floor', wedgeZ(x0 + 0.5, x1 - 0.5, zR, z0, 0, F, F - 0.6));
  bag.add('marble_floor', box(x0 + 0.5, F - 0.6, z0, x1 - 0.5, F, zN + 0.1));
  col.ramp([x0 + 0.5, zR, x1 - 0.5, z0], F, 0, 'n');
  col.floor([x0 + 0.5, z0, x1 - 0.5, zN + 0.4], F);
  for (const [xa, xb] of [[x0, x0 + 0.5], [x1 - 0.5, x1]]) {
    bag.add(CONC, wedgeZ(xa, xb, zR, z0, 0.0, F, wy0)); bag.add(CONC, box(xa, wy0, z0, xb, 0.02, zN));
    col.rect([xa - 0.1, zR, xb + 0.1, zN], F - 0.4, 1.1);
    bag.add('steel_grey', box(xa + 0.1, 0.02, zR, xb - 0.1, 1.0, z0 - 1));                                           // the rail along the ramp's cheek, over the wall
  }
  bag.add(CONC, box(x0 + 0.5, F + 3.6, z0, x1 - 0.5, F + 3.9, zN)); bag.add('plaster_white', box(x0 + 0.5, F + 3.45, z0, x1 - 0.5, F + 3.6, zN));
  for (let zz = z0 + 2; zz < zN - 1; zz += 3.5) { lights.push({ at: [cx, F + 3.0, zz], color: '#ffd9a0', intensity: 3.0, distance: 8 }); bag.add('lamp_white', box(cx - 0.4, F + 3.35, zz - 0.15, cx + 0.4, F + 3.45, zz + 0.15)); }
  lights.push({ at: [cx, F + 12, cz], color: '#d8e4ff', intensity: 6, distance: 34 }, { at: [cx, F + 3, cz + 14], color: '#fff0d0', intensity: 4, distance: 22 });
  // ── the bell tower, to the right of the entrance (west), 20 m ──
  {
    const bx = cx - 30, bz = cz - 54;
    for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) { bag.add(CONC, box(bx + dx - 0.35, 0, bz + dz - 0.35, bx + dx + 0.35, 20, bz + dz + 0.35)); col.rect([bx + dx - 0.4, bz + dz - 0.4, bx + dx + 0.4, bz + dz + 0.4], 0, 20); }
    for (const h of [6, 12.5, 19.3]) bag.add(CONC, box(bx - 1.8, h, bz - 1.8, bx + 1.8, h + 0.45, bz + 1.8));
    bag.add(CONC, box(bx - 2.2, 20, bz - 2.2, bx + 2.2, 20.5, bz + 2.2));
    for (const [dx, dz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) {
      bag.add('bronze', lathe([[0.001, 0], [0.14, 0.05], [0.4, 0.4], [0.55, 1.0], [0.62, 1.15], [0.55, 1.15]], 12, null, bx + dx, 15.9, bz + dz));
      bag.add('steel_grey', box(bx + dx - 0.04, 17.1, bz + dz - 0.04, bx + dx + 0.04, 19.3, bz + dz + 0.04));
    }
  }
  // ── the baptistery: a low ovoid of white concrete to the left, east ──
  {
    const bx = cx + 30, bz = cz - 54, a = 10, b = 6.5;
    bag.add('plaster_white', lathe([[1, 0], [0.99, 2.5], [0.93, 5.5], [0.78, 8], [0.55, 9.7], [0.25, 10.6], [0.001, 10.9]].map(([r, h]) => [r, h]), 40, (th) => 1 / Math.hypot(Math.cos(th) / a, Math.sin(th) / b), bx, 0, bz));
    col.circle(bx, bz, 8.0, 0, 11);
    bag.add(CONC, disc(a + 0.5, 0.03, 40, bx, bz, true));
  }
  // ── the Evangelists in the entrance square (§1b: four bronzes by Ceschiatti and Croce, 1968) ──
  [[cx - 14, cz - 55], [cx + 14, cz - 55], [cx - 24, cz - 50], [cx + 24, cz - 50]].forEach(([x, z], i) => evangelist(bag, col, x, z, i * 1.1, i));
}
