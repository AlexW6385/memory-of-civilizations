// The shops of the Cardo (docs/settlements/jerusalem.md §4d): a stone room behind each portico, its wide
// door with dressed jambs and a lintel, the wooden shutters folded back, a barrel-vaulted ceiling, a
// shelf along the back wall and a table at the side set with the wares of its trade; walkable from the
// portico. Built in the colonnade's frame (city.js): s along the street, t outward from the column line,
// the sign of t flipped for the street's other side.

import { box, lathe, fromTriangles } from '../../core/geom.js';

const MATS = { ceramic: 'terracotta', dark: 'pottery_dark', green: 'glaze_green', blue: 'glaze_blue', white: 'glaze_white' };
// profiles [[r, y]…], after src/objects/index.js (amphora, water_pot, dark_pot, glazed_jar, blue_jar)
const PROF = {
  amphora: [[0.04, 0], [0.09, 0.08], [0.2, 0.3], [0.21, 0.42], [0.12, 0.6], [0.06, 0.68], [0.07, 0.75], [0.001, 0.75]],
  pithos: [[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]],
  pot: [[0.08, 0], [0.2, 0.08], [0.24, 0.22], [0.18, 0.36], [0.08, 0.42], [0.1, 0.46], [0.001, 0.46]],
  cook: [[0.1, 0], [0.22, 0.1], [0.25, 0.25], [0.16, 0.38], [0.14, 0.44], [0.001, 0.44]],
  jar: [[0.16, 0], [0.3, 0.2], [0.34, 0.45], [0.26, 0.7], [0.16, 0.78], [0.17, 0.84], [0.001, 0.84]],
  bottle: [[0.001, 0], [0.07, 0.01], [0.09, 0.08], [0.06, 0.16], [0.025, 0.22], [0.03, 0.3], [0.001, 0.3]],
  bowl: [[0.001, 0], [0.07, 0], [0.14, 0.07], [0.13, 0.08], [0.06, 0.012], [0.001, 0.012]],
  lamp: [[0.001, 0], [0.05, 0], [0.07, 0.025], [0.045, 0.045], [0.001, 0.05]],
  pan: [[0.001, 0], [0.14, 0.005], [0.2, 0.06], [0.19, 0.065], [0.001, 0.012]],
  ewer: [[0.07, 0], [0.12, 0.08], [0.1, 0.22], [0.05, 0.3], [0.07, 0.36], [0.001, 0.36]],
  sack: [[0.001, 0], [0.2, 0], [0.26, 0.2], [0.22, 0.46], [0.12, 0.6], [0.001, 0.62]],
  basket: [[0.001, 0], [0.22, 0], [0.3, 0.26], [0.001, 0.26]],
  heap: [[0.24, 0], [0.15, 0.12], [0.001, 0.2]],
};
const CLOTH = ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_brown', 'cloth_maroon', 'cloth_grey'];
const TRADES = ['pottery', 'pottery', 'cloth', 'cloth', 'grain', 'produce', 'oil', 'copper', 'glass', 'bread', 'spice'];

/** Triangles turned to face the point p (the room's inside): for a ceiling seen from below. */
function facing(tris, p) {
  for (let i = 0; i < tris.length; i += 9) {
    const ax = tris[i], ay = tris[i + 1], az = tris[i + 2];
    const ux = tris[i + 3] - ax, uy = tris[i + 4] - ay, uz = tris[i + 5] - az, vx = tris[i + 6] - ax, vy = tris[i + 7] - ay, vz = tris[i + 8] - az;
    // (fromTriangles' normal is (c − b) × (a − b))
    const wx = tris[i + 6] - tris[i + 3], wy = tris[i + 7] - tris[i + 4], wz = tris[i + 8] - tris[i + 5], qx = ax - tris[i + 3], qy = ay - tris[i + 4], qz = az - tris[i + 5];
    const nx = wy * qz - wz * qy, ny = wz * qx - wx * qz, nz = wx * qy - wy * qx;
    const mx = p[0] - (ax + tris[i + 3] + tris[i + 6]) / 3, my = p[1] - (ay + tris[i + 4] + tris[i + 7]) / 3, mz = p[2] - (az + tris[i + 5] + tris[i + 8]) / 3;
    if (nx * mx + ny * my + nz * mz < 0) for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; }
    void ux; void uy; void uz; void vx; void vy; void vz;
  }
  return tris;
}

/**
 * One shop. F: { bag, col, o, u, side, y, H, D, Sd } (the colonnade's frame); s0…s1 its stretch along the street;
 * rand: the shop's own generator. Builds the front (jambs, lintel, window, shutters), the floor, the barrel
 * vault, and the shelves, table and wares inside. Walls, roofs and the portico belong to the colonnade.
 */
export function shopUnit(F, s0, s1, rand) {
  const { bag, col, o, u, side, y, H, D, Sd } = F, n = [-u[1], u[0]];
  const f0 = D, f1 = D + 0.6, bk = D + Sd, tb = bk - 0.6;                       // front wall face … back wall's inner face
  const closed = rand() < 0.1, trade = closed ? 'none' : TRADES[Math.floor(rand() * TRADES.length)];
  const d0 = s0 + 1.0, d1 = s1 - 1.0, sc = (s0 + s1) / 2, a0 = s0 + 0.3, a1 = s1 - 0.3;
  const P = (s, t) => [o[0] + u[0] * s + n[0] * t * side, o[1] + u[1] * s + n[1] * t * side];
  const T = (t0, t1) => [Math.min(t0 * side, t1 * side), Math.max(t0 * side, t1 * side)];
  const fb = (mat, sa, sb, ta, tb2, ya, yb) => {
    const [p, q] = T(ta, tb2), g = box(sa, ya, p, sb, yb, q), A = g.attributes.position.array, N = g.attributes.normal.array;
    for (let i = 0; i < A.length; i += 3) {
      const s = A[i], t = A[i + 2]; A[i] = o[0] + s * u[0] + t * n[0]; A[i + 2] = o[1] + s * u[1] + t * n[1];
      const a = N[i], b = N[i + 2]; N[i] = a * u[0] + b * n[0]; N[i + 2] = a * u[1] + b * n[1];
    }
    bag.add(mat, g);
  };
  const put = (mat, prof, s, t, yy, seg = 8, sx = 1) => { const [x, z] = P(s, t); bag.add(mat, lathe(sx === 1 ? prof : prof.map(([r, h]) => [r * sx, h * sx]), seg, null, x, yy, z)); };
  const yf = y + 0.12;                                                      // the shop's floor
  const w = d1 - d0;
  // ── the front: jambs of dressed stone proud of the wall, a lintel, a window over it, the shutters folded back
  for (const [sa, sb] of [[d0 - 0.22, d0], [d1, d1 + 0.22]]) fb('limestone_carved', sa, sb, f0 - 0.06, f1 + 0.02, y, y + 2.9);
  fb('limestone_carved', d0 - 0.4, d1 + 0.4, f0 - 0.08, f1 + 0.04, y + 2.9, y + 3.28);
  fb('limestone_carved', d0 - 0.5, d1 + 0.5, f0 - 0.14, f0 - 0.06, y + 3.28, y + 3.4);          // a drip moulding
  fb('limestone_carved', d0 - 0.4, d1 + 0.4, f0 - 0.12, f1 + 0.06, y - 0.02, y + 0.16);         // the threshold step
  // a relieving arch of seven voussoirs over the lintel, its tympanum plastered
  { const r = (w + 0.8) / 2 + 0.1;
    for (let k = 0; k < 7; k++) { const a = Math.PI * k / 7, b = Math.PI * (k + 1) / 7, xa = sc - Math.cos(a) * r, xb = sc - Math.cos(b) * r; fb('limestone_carved', Math.min(xa, xb) - 0.015, Math.max(xa, xb) + 0.015, f0 - 0.07, f0 - 0.0, y + 3.4 + Math.sin((a + b) / 2) * r * 0.42 - 0.12, y + 3.4 + Math.sin((a + b) / 2) * r * 0.42 + 0.14); }
    fb('plaster', sc - r + 0.3, sc + r - 0.3, f0 - 0.04, f0 + 0.0, y + 3.45, y + 3.78); }
  // the transom window above the lintel's moulding: a dark opening, sill and head
  fb('opening', sc - 0.5, sc + 0.5, f0 - 0.02, f0 + 0.03, y + 4.05, y + 4.9);
  fb('limestone_carved', sc - 0.62, sc + 0.62, f0 - 0.1, f0 + 0.02, y + 3.92, y + 4.05);
  fb('limestone_carved', sc - 0.62, sc + 0.62, f0 - 0.08, f0 + 0.02, y + 4.9, y + 5.05);
  // the shutters of vertical planks: folded back against the piers (open), or standing across the door (closed)
  if (closed) {
    for (let k = 0; k < 6; k++) { const sa = d0 + w * k / 6; fb('timber', sa + 0.01, sa + w / 6 - 0.01, f0 + 0.05, f0 + 0.17, y + 0.14, y + 2.88); }
    fb('iron', d0, d1, f0 + 0.03, f0 + 0.05, y + 0.5, y + 0.58); fb('iron', d0, d1, f0 + 0.03, f0 + 0.05, y + 2.2, y + 2.28);
  } else {
    for (const [sa, sb] of [[d0 - 0.2 - 0.46, d0 - 0.22], [d1 + 0.22, d1 + 0.2 + 0.46]]) { for (let k = 0; k < 3; k++) { const wa = sa + (sb - sa) * k / 3; fb('timber', wa + 0.008, wa + (sb - sa) / 3 - 0.008, f0 - 0.14, f0 - 0.08, y + 0.14, y + 2.6); }
      fb('iron', sa, sb, f0 - 0.15, f0 - 0.14, y + 0.5, y + 0.56); fb('iron', sa, sb, f0 - 0.15, f0 - 0.14, y + 2.0, y + 2.06); }
  }
  // the lamp hook and a sign board: a plank over the door with the trade's mark (a coloured band)
  if (!closed) { const m = { pottery: 'cloth_ochre', cloth: 'cloth_red', grain: 'cloth_brown', produce: 'cloth_green', oil: 'cloth_ochre', copper: 'bronze', glass: 'glaze_blue', bread: 'cloth_ochre', spice: 'cloth_maroon' }[trade];
    fb('timber', sc - 0.5, sc + 0.5, f0 - 0.2, f0 - 0.14, y + 3.5, y + 3.75); fb(m, sc - 0.42, sc + 0.42, f0 - 0.215, f0 - 0.2, y + 3.55, y + 3.7); }
  if (closed) return;
  // ── inside
  // the floor of flags, walkable
  { const xs = [P(a0, f1)[0], P(a1, tb)[0], P(a0, tb)[0], P(a1, f1)[0]], zs = [P(a0, f1)[1], P(a1, tb)[1], P(a0, tb)[1], P(a1, f1)[1]]; col.floor([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)], yf); }
  // the barrel vault: a segmental arch springing at 3.0 m from the party walls, plastered
  { const hw = (a1 - a0) / 2, ys = y + 3.0, rise = 1.35, N = 8, tris = [];
    const pa = (j, t) => { const a = Math.PI * j / N, [x, z] = P(sc - Math.cos(a) * hw, t); return [x, ys + Math.sin(a) * rise, z]; };
    for (let j = 0; j < N; j++) { const A = pa(j, f1), B = pa(j + 1, f1), C = pa(j + 1, tb), Dd = pa(j, tb); tris.push(...A, ...B, ...C, ...A, ...C, ...Dd); }
    const cen = P(sc, (f1 + tb) / 2); bag.add('lime_plaster', fromTriangles(facing(tris, [cen[0], y + 1.2, cen[1]]))); }
  // wooden shelves on the back wall: three boards on brackets, the wares in rows
  const SH = [0.62, 1.3, 1.98], shw = a1 - a0 - 0.5, sa = a0 + 0.25;
  for (const hy of SH) { fb('timber', sa, sa + shw, tb - 0.4, tb, y + hy, y + hy + 0.05); for (const s of [sa + 0.05, sa + shw - 0.1, sc - 0.03]) fb('timber', s, s + 0.06, tb - 0.38, tb, y + hy - 0.3, y + hy); }
  const row = (hy, make, step = 0.46) => { const m = Math.floor(shw / step); for (let k = 0; k < m; k++) make(sa + step * (k + 0.5) + (shw - m * step) / 2, tb - 0.2, y + hy + 0.05, k); };
  // a table at the side, a stool beside it
  const ts = rand() < 0.5 ? a0 + 0.95 : a1 - 0.95, tt = f1 + 1.7;
  fb('timber', ts - 0.6, ts + 0.6, tt - 0.4, tt + 0.4, y + 0.82, y + 0.88);
  for (const [a, b] of [[-0.55, -0.35], [0.5, 0.35], [-0.55, 0.35], [0.5, -0.35]]) fb('timber', ts + a - 0.03, ts + a + 0.03, tt + b - 0.03, tt + b + 0.03, y + 0.12, y + 0.82);
  const tab = (make) => { for (let k = 0; k < 3; k++) make(ts - 0.38 + k * 0.38, tt + (k % 2 ? 0.1 : -0.08), y + 0.88, k); };
  const pick = (a) => a[Math.floor(rand() * a.length)];
  if (trade === 'pottery') {
    row(SH[0], (s, t, yy, k) => put(k % 3 === 0 ? MATS.dark : MATS.ceramic, k % 3 === 0 ? PROF.cook : PROF.pot, s, t, yy, 8));
    row(SH[1], (s, t, yy, k) => put(MATS.ceramic, PROF.bowl, s, t, yy, 8, 1.4)); row(SH[1], (s, t, yy) => put(MATS.ceramic, PROF.bowl, s, t, yy + 0.04, 8, 1.4), 0.46);
    row(SH[2], (s, t, yy, k) => put(k % 2 ? MATS.green : MATS.blue, PROF.bottle, s, t, yy, 8, 1.2));
    tab((s, t, yy, k) => put(k === 1 ? MATS.green : MATS.ceramic, k === 1 ? PROF.jar : PROF.amphora, s, t, yy, 8, 0.7));
    put(MATS.ceramic, PROF.pithos, a0 + 0.5, tb - 0.55, y + 0.12, 10, 0.9); put(MATS.ceramic, PROF.amphora, a1 - 0.35, tb - 0.35, y + 0.12, 8);
  } else if (trade === 'cloth') {
    // folded cloths stacked on the shelves, bolts hanging at the back, a bale on the table
    for (const hy of SH) { const m = Math.floor(shw / 0.62); for (let k = 0; k < m; k++) { const s = sa + 0.62 * (k + 0.5) + (shw - m * 0.62) / 2, c = pick(CLOTH), c2 = pick(CLOTH); const h = 2 + Math.floor(rand() * 3); for (let q = 0; q < h; q++) fb(q % 2 ? c2 : c, s - 0.27, s + 0.27, tb - 0.38, tb - 0.05, y + hy + 0.05 + q * 0.09, y + hy + 0.14 + q * 0.09); } }
    tab((s, t, yy, k) => { for (let q = 0; q < 3; q++) fb(pick(CLOTH), s - 0.24, s + 0.24, t - 0.17, t + 0.17, yy + q * 0.1, yy + 0.1 + q * 0.1); });
    for (let k = 0; k < 3; k++) { const s = a0 + 0.7 + k * (a1 - a0 - 1.4) / 2; fb(pick(CLOTH), s - 0.28, s + 0.28, f1 + 0.1, f1 + 0.14, y + 1.5, y + 2.7); }   // lengths hung inside the door
  } else if (trade === 'grain') {
    for (let k = 0; k < 4; k++) put('sacking', PROF.sack, a0 + 0.45 + k * 0.55, tb - 0.4, y + 0.12, 8);
    for (let k = 0; k < 3; k++) put('sacking', PROF.sack, a0 + 0.7 + k * 0.55, tb - 1.0, y + 0.12, 8);
    put('sacking', PROF.sack, a0 + 1.0, tb - 0.4, y + 0.74, 8); put('sacking', PROF.sack, a0 + 1.55, tb - 0.4, y + 0.74, 8);
    for (let k = 0; k < 3; k++) put('wicker', PROF.basket, a1 - 0.45, tb - 0.45 - k * 0.7, y + 0.12, 8, 1.2);
    for (let k = 0; k < 3; k++) put('cloth_ochre', PROF.heap, a1 - 0.45, tb - 0.45 - k * 0.7, y + 0.12 + 0.28, 8, 1.2);
    row(SH[1], (s, t, yy) => put(MATS.ceramic, PROF.pot, s, t, yy, 8));
    tab((s, t, yy, k) => { put('wicker', PROF.basket, s, t, yy, 8, 0.9); put(k % 2 ? 'cloth_brown' : 'cloth_ochre', PROF.heap, s, t, yy + 0.23, 8, 0.9); });
  } else if (trade === 'produce') {
    const PM = ['cloth_green', 'cloth_red', 'cloth_ochre', 'glaze_yellow'];
    for (let k = 0; k < 4; k++) { const s = a0 + 0.5 + k * 0.62; put('wicker', PROF.basket, s, tb - 0.45, y + 0.12, 8, 1.3); put(PM[k % 4], PROF.heap, s, tb - 0.45, y + 0.12 + 0.3, 8, 1.3); }
    for (let k = 0; k < 3; k++) { const t = tb - 1.5 - k * 0.65; put('wicker', PROF.basket, a1 - 0.45, t, y + 0.12, 8, 1.2); put(PM[(k + 2) % 4], PROF.heap, a1 - 0.45, t, y + 0.12 + 0.28, 8, 1.2); }
    row(SH[1], (s, t, yy, k) => { put('wicker', PROF.basket, s, t, yy, 6, 0.55); put(PM[k % 4], PROF.heap, s, t, yy + 0.14, 6, 0.55); }, 0.5);
    tab((s, t, yy, k) => { put('wicker', PROF.basket, s, t, yy, 8, 0.85); put(PM[(k + 1) % 4], PROF.heap, s, t, yy + 0.22, 8, 0.85); });
  } else if (trade === 'oil') {
    for (let k = 0; k < 3; k++) put(MATS.ceramic, PROF.pithos, a0 + 0.5 + k * 0.85, tb - 0.55, y + 0.12, 10, 0.8);
    row(SH[0], (s, t, yy) => put(MATS.ceramic, PROF.amphora, s, t, yy, 8, 0.7), 0.5);
    row(SH[1], (s, t, yy, k) => put(MATS.ceramic, PROF.lamp, s, t, yy, 8, 1.1), 0.34); row(SH[2], (s, t, yy, k) => put(k % 2 ? MATS.ceramic : MATS.dark, PROF.lamp, s, t, yy, 8, 1.1), 0.34);
    tab((s, t, yy, k) => put(MATS.ceramic, k === 1 ? PROF.water_pot ?? PROF.pot : PROF.amphora, s, t, yy, 8, 0.6));
  } else if (trade === 'copper') {
    // the coppersmith: pans hung on the back wall, ewers and pots on the shelves, a block and anvil
    for (let k = 0; k < 5; k++) { const s = sa + 0.3 + k * ((shw - 0.6) / 4); put('bronze', PROF.pan, s, tb - 0.05, y + 1.75 + (k % 2) * 0.35, 10, 1.1); }
    row(SH[0], (s, t, yy) => put('bronze', PROF.ewer, s, t, yy, 8)); row(SH[1], (s, t, yy, k) => put('bronze', k % 2 ? PROF.cook : PROF.ewer, s, t, yy, 8, 0.9));
    tab((s, t, yy, k) => put('bronze', k === 1 ? PROF.jar : PROF.pot, s, t, yy, 8, 0.6));
    fb('timber', sc - 0.2, sc + 0.2, tb - 1.8, tb - 1.4, y + 0.12, y + 0.5); fb('iron', sc - 0.17, sc + 0.17, tb - 1.77, tb - 1.43, y + 0.5, y + 0.62);
  } else if (trade === 'glass') {
    row(SH[0], (s, t, yy, k) => put(k % 3 === 0 ? MATS.green : MATS.white, PROF.bottle, s, t, yy, 8, 1.3), 0.3);
    row(SH[1], (s, t, yy, k) => put(k % 2 ? MATS.blue : MATS.green, PROF.bottle, s, t, yy, 8, 1.1), 0.3); row(SH[2], (s, t, yy, k) => put(k % 2 ? MATS.white : MATS.blue, PROF.bowl, s, t, yy, 8, 1.3), 0.34);
    tab((s, t, yy, k) => put(k % 2 ? MATS.blue : MATS.green, PROF.jar, s, t, yy, 8, 0.5));
  } else if (trade === 'bread') {
    // flat loaves in stacks on boards, a basket of rolls, the oven's mouth at the back (a dark arch)
    for (const hy of [SH[0], SH[1]]) { const m = Math.floor(shw / 0.6); for (let k = 0; k < m; k++) { const s = sa + 0.6 * (k + 0.5) + (shw - m * 0.6) / 2; for (let q = 0; q < 3 + (k % 2); q++) put('hide_tan', PROF.pan, s, tb - 0.2, y + hy + 0.05 + q * 0.06, 10, 0.95); } }
    fb('opening', sc + 0.3, sc + 1.1, tb - 0.04, tb, y + 0.4, y + 1.1);
    tab((s, t, yy) => put('wicker', PROF.basket, s, t, yy, 8, 0.8)); put('cloth_white', PROF.heap, ts - 0.38, tt - 0.08, yy0(y), 8, 0.9);
  } else if (trade === 'spice') {
    const SP = ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_green', 'cloth_maroon', 'cloth_ochre'];
    for (const hy of [SH[0], SH[1], SH[2]]) row(hy, (s, t, yy, k) => { put(MATS.ceramic, PROF.bowl, s, t, yy, 8, 1.2); put(SP[(k + Math.round(hy * 5)) % 6], PROF.heap, s, t, yy + 0.03, 8, 0.6); }, 0.4);
    for (let k = 0; k < 3; k++) put('sacking', PROF.sack, a0 + 0.45 + k * 0.5, tb - 0.4, y + 0.12, 8, 0.8);
    tab((s, t, yy, k) => { put(MATS.ceramic, PROF.bowl, s, t, yy, 8, 1.4); put(SP[k], PROF.heap, s, t, yy + 0.03, 8, 0.8); });
  }
  // a hanging oil lamp over the room's middle, lit
  { const [x, z] = P(sc, (f1 + tb) / 2); bag.add('iron', box(x - 0.01, y + 2.9, z - 0.01, x + 0.01, y + 3.7, z + 0.01)); bag.add('lamp_glass', lathe([[0.001, 0], [0.07, 0.02], [0.1, 0.1], [0.06, 0.15], [0.001, 0.16]], 8, null, x, y + 2.76, z)); }
  void yf;
}
const yy0 = (y) => y + 0.88;
