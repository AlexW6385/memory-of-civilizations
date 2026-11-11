// Town houses of the Mediterranean and of France (docs/settlements/{florence,baroque-rome,venice,
// granada,ottoman-istanbul,versailles}.md §5), one builder with a variant for each place:
//   tuscan   — Florence and Rome: stucco in ochres and creams, string courses, windows with stone
//              surrounds and green shutters, arched shop doors, a wide timber eave (gronda) under a
//              low tiled roof; now and then a roof loggia (altana) or a tower house.
//   venetian — red and rose stucco, Istrian-stone sills, pointed and round-headed windows, the
//              funnel chimneys (camini), the wooden altana on the roof.
//   moorish  — Granada: whitewash, few small windows, a latticed balcony, flat roofs with parapets
//              or low tiled roofs, the odd small tower (algorfa).
//   ottoman  — Istanbul: a stone ground storey, the upper storeys of painted timber boards jettied
//              out, the bay (cumba), wide eaves under a hipped tiled roof.
//   french   — Versailles: limestone and plaster, tall windows with grey shutters, a steep slate roof
//              with dormers and tall chimney stacks.
// { rect, y (floor), foot (lowest ground), storeys, front ('n'|'s'|'e'|'w'), seed, variant }

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, l) => l[Math.floor(rand() * l.length)];

const V = {
  tuscan: { walls: ['stucco_pale', 'stucco_siena', 'stucco_ochre', 'stucco_cream', 'stucco_warm', 'stucco_rome'], base: 'pietra_serena', trim: 'pietra_serena', shut: ['shutter_green', 'shutter_green', 'shutter_brown'], st: [3.6, 4.2], roof: 'roof_tile', pitch: 17, eave: 1.0, win: [0.85, 1.6], arched: 0.5 },
  roman: { walls: ['stucco_rome', 'stucco_saffron', 'stucco_ochre', 'stucco_rose', 'stucco_siena', 'stucco_pale'], base: 'travertine', trim: 'travertine', shut: ['shutter_green', 'shutter_brown'], st: [3.5, 4.0], roof: 'roof_tile', pitch: 16, eave: 0.7, win: [0.85, 1.6], arched: 0.4 },
  venetian: { walls: ['stucco_venice', 'stucco_rose', 'limewash_red', 'stucco_ochre', 'stucco_cream', 'stucco_siena'], base: 'limestone', trim: 'marble', shut: ['shutter_green', 'shutter_brown'], st: [3.3, 3.8], roof: 'roof_tile', pitch: 18, eave: 0.35, win: [0.8, 1.7], pointed: 0.35 },
  moorish: { walls: ['limewash_white', 'limewash_white', 'limewash_white', 'plaster_white', 'stucco_pale'], base: 'limewash_white', trim: 'brick', shut: ['wood_painted'], st: [3.0, 3.3], roof: 'roof_tile', pitch: 20, eave: 0.3, win: [0.6, 0.9], flat: 0.45 },
  ottoman: { walls: ['wood_painted', 'wood_ochre', 'limewash_red', 'stucco_pale', 'shutter_grey', 'timber'], base: 'rubble', trim: 'timber', shut: ['timber'], st: [2.9, 3.2], roof: 'roof_tile', pitch: 22, eave: 0.9, win: [0.7, 1.3], jetty: 0.8 },
  french: { walls: ['limestone', 'plaster_white', 'stucco_pale', 'plaster_white'], base: 'limestone', trim: 'limestone', shut: ['shutter_grey', 'shutter_grey', 'shutter_green'], st: [3.4, 3.8], roof: 'slate', pitch: 48, eave: 0.25, win: [0.95, 2.0], dormers: 1 },
};

/** A hipped roof over R from height ye, the slopes at `pitch` degrees, overhang o; faces pointing up. */
function hipRoof(bag, mat, R, ye, pitch, o) {
  const ex0 = R[0] - o, ez0 = R[1] - o, ex1 = R[2] + o, ez1 = R[3] + o, wx = ex1 - ex0, wz = ez1 - ez0, rise = Math.min(wx, wz) / 2 * Math.tan(pitch * Math.PI / 180), t = [];
  if (wx >= wz) {
    const r0 = [ex0 + wz / 2, ye + rise, (ez0 + ez1) / 2], r1 = [ex1 - wz / 2, ye + rise, (ez0 + ez1) / 2];
    t.push(ex0, ye, ez0, ...r0, ...r1, ex0, ye, ez0, ...r1, ex1, ye, ez0, ex1, ye, ez1, ...r1, ...r0, ex1, ye, ez1, ...r0, ex0, ye, ez1, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex1, ye, ez0, ...r1, ex1, ye, ez1);
  } else {
    const r0 = [(ex0 + ex1) / 2, ye + rise, ez0 + wx / 2], r1 = [(ex0 + ex1) / 2, ye + rise, ez1 - wx / 2];
    t.push(ex1, ye, ez0, ...r0, ...r1, ex1, ye, ez0, ...r1, ex1, ye, ez1, ex0, ye, ez1, ...r1, ...r0, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex0, ye, ez0, ...r0, ex1, ye, ez0, ex1, ye, ez1, ...r1, ex0, ye, ez1);
  }
  for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2]; if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; } }
  bag.add(mat, fromTriangles(t));
  return rise;
}

/**
 * The ground storey of an open house: its four walls (the door cut in the front's middle), a step
 * up from the street, the floor, the ceiling of the storey above; furnished by `el.use`: 'inn' (the
 * osteria, the taverna, the auberge: tables and benches, a counter with jugs and barrels, the hearth
 * with its pot, hams and garlic hanging) or 'home' (in Granada and Istanbul a raised divan round
 * the walls with cushions and a brass tray on a stand; elsewhere a table and stools, a chest, the bed,
 * a cupboard of crockery, the hearth).
 */
function openGround(bag, col, el, { O, wall, y, st, f, rand }) {
  const [x0, z0, x1, z1] = el.rect, T = 0.4, fy = y + 0.6, along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  // a frame: u along the front (0…L), v in from the front (0…D)
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const B = (mat, u0, v0, u1, v1, ya, yb, c = false) => { const a = P(u0, v0), b = P(u1, v1), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya - 0.5, yb); };
  const dw = 1.2, dc = Math.floor(Math.max(1, Math.round(L / (el.variant === 'moorish' ? 3.6 : 2.5))) / 2), bays = Math.max(1, Math.round(L / (el.variant === 'moorish' ? 3.6 : 2.5))), du = (dc + 0.5) * L / bays;
  // the walls: back and sides whole, the front either side of the door and over it
  B(wall, 0, D - T, L, D, fy, y + st, true); B(wall, 0, T, T, D - T, fy, y + st, true); B(wall, L - T, T, L, D - T, fy, y + st, true);
  B(wall, 0, 0, du - dw / 2, T, fy, y + st, true); B(wall, du + dw / 2, 0, L, T, fy, y + st, true); B(wall, du - dw / 2, 0, du + dw / 2, T, fy + 2.5, y + st);
  col.rect([x0, z0, x1, z1], y + st, y + st + 0.4);
  // the step, the floor (stone flags or terracotta), the beams of the ceiling
  B(O.base, du - 0.8, -0.55, du + 0.8, 0, fy - 0.3, fy - 0.02, false); { const a = P(du - 0.8, -0.55), b = P(du + 0.8, 0); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], fy - 0.3); }
  const floorMat = el.variant === 'moorish' || el.variant === 'ottoman' ? 'brick_paving' : el.variant === 'french' ? 'flagstone' : 'cotto_floor';
  B(floorMat, T, T, L - T, D - T, fy - 0.12, fy + 0.015); { const a = P(0, 0), b = P(L, D); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], fy); }
  B('plaster_white', T, T, L - T, D - T, y + st - 0.05, y + st - 0.02);
  for (let v = T + 0.5; v < D - T; v += 0.8) B('wood_dark', T, v - 0.08, L - T, v + 0.08, y + st - 0.24, y + st - 0.05);
  // the door leaf, standing open against the wall inside
  B('wood_dark', du - dw / 2 - 0.02, T, du - dw / 2 + 0.06, T + dw, fy, fy + 2.45);
  const h = (mat, u, v, r, ht, ya = 0) => { const p = P(u, v); bag.add(mat, lathe([[r * 0.6, 0], [r, ht * 0.4], [r * 0.7, ht * 0.85], [r * 0.4, ht], [0.001, ht]], 10, null, p[0], fy + ya, p[1])); };
  const table = (u, v, w, d, ht, mat = 'wood_dark') => { B(mat, u - w / 2, v - d / 2, u + w / 2, v + d / 2, fy + ht - 0.06, fy + ht, true); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(mat, u + a * (w / 2 - 0.08) - 0.04, v + b * (d / 2 - 0.08) - 0.04, u + a * (w / 2 - 0.08) + 0.04, v + b * (d / 2 - 0.08) + 0.04, fy, fy + ht - 0.06); };
  const hearth = (u) => { B('brick', u - 0.8, D - T - 0.7, u + 0.8, D - T, fy, fy + 0.45, true); B('brick', u - 0.9, D - T - 0.75, u + 0.9, D - T, fy + 1.6, fy + 1.9); for (const sg of [-1, 1]) B('brick', u + sg * 0.8 - 0.1, D - T - 0.7, u + sg * 0.8 + 0.1, D - T, fy + 0.45, fy + 1.6); B('brick', u - 0.6, D - T - 0.5, u + 0.6, D - T, fy + 1.9, y + st); B('wood_dark', u - 0.5, D - T - 0.55, u + 0.5, D - T - 0.05, fy + 0.45, fy + 0.47); h('terracotta', u, D - T - 0.35, 0.22, 0.3, 0.47); B('timber', u - 0.3, D - T - 0.45, u + 0.3, D - T - 0.25, fy + 0.45, fy + 0.55); };
  const islamic = el.variant === 'moorish' || el.variant === 'ottoman';
  if (el.use === 'inn' && !islamic) {
    // tables with benches, the counter along one side with jugs, barrels behind it, the hearth at the back, hams hanging
    const nt = Math.max(1, Math.floor((L - 2.6) / 2.2));
    for (let k = 0; k < nt; k++) for (const v of [D * 0.38, D * 0.62]) {
      const u = 1.2 + k * 2.2 + 0.4; if (u > L - 1.8 || v > D - 1.4) continue;
      table(u, v, 1.4, 0.7, 0.78); for (const s2 of [-1, 1]) { B('timber', u - 0.7, v + s2 * 0.55 - 0.13, u + 0.7, v + s2 * 0.55 + 0.13, fy + 0.42, fy + 0.46, true); for (const a of [-0.6, 0.55]) B('timber', u + a, v + s2 * 0.55 - 0.1, u + a + 0.05, v + s2 * 0.55 + 0.1, fy, fy + 0.42); }
      h('terracotta', u - 0.3, v, 0.07, 0.24, 0.78); h('plaster_white', u + 0.2, v + 0.1, 0.05, 0.12, 0.78);
    }
    const cu = L - T - 0.6;
    B('wood_dark', cu - 0.3, T + 1.2, cu + 0.3, D - T - 1.2, fy, fy + 1.05, true); B('timber', cu - 0.35, T + 1.15, cu + 0.35, D - T - 1.15, fy + 1.05, fy + 1.1);
    for (let v = T + 1.5; v < D - T - 1.4; v += 0.55) h('terracotta', cu, v, 0.08, 0.28, 1.1);
    for (let v = T + 1.4; v < D - T - 1.2; v += 0.8) { const p = P(L - T - 0.25, v); const g = lathe([[0.28, 0], [0.33, 0.35], [0.28, 0.7], [0.001, 0.7]], 12, null, 0, 0, 0); g.rotateX(Math.PI / 2); g.translate(p[0], fy + 0.32, p[1]); bag.add('timber', g); }
    hearth(Math.min(L / 2, L - 2.5));
    for (let k = 0; k < 4; k++) { const u = 1 + k * 0.6; h(k % 2 ? 'terracotta' : 'plaster_white', u, D - T - 1.5, 0.1, 0.35, st - 1.0); B('wood_dark', u - 0.005, D - T - 1.505, u + 0.005, D - T - 1.495, fy + st - 0.65, y + st - 0.24); }
  } else if (islamic) {
    // the divan: a low platform along the walls with mattresses and cushions, a rug, the brass tray on its stand, a lamp, a chest
    const dv = 0.75;
    for (const [u0, v0, u1, v1] of [[T, D - T - dv, L - T, D - T], [T, T + 1.0, T + dv, D - T - dv], [L - T - dv, T + 1.0, L - T, D - T - dv]]) { B('timber', u0, v0, u1, v1, fy, fy + 0.3, true); B(el.variant === 'ottoman' ? 'cloth_red' : 'cloth_indigo', u0 + 0.02, v0 + 0.02, u1 - 0.02, v1 - 0.02, fy + 0.3, fy + 0.42); }
    for (let u = T + 0.6; u < L - T - 0.4; u += 0.7) B(['cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_white'][Math.floor(rand() * 4)], u - 0.25, D - T - 0.2, u + 0.25, D - T - 0.05, fy + 0.42, fy + 0.85);
    B('cloth_red', T + dv + 0.3, T + 1.2, L - T - dv - 0.3, D - T - dv - 0.3, fy + 0.01, fy + 0.025); B('cloth_ochre', T + dv + 0.5, T + 1.4, L - T - dv - 0.5, D - T - dv - 0.5, fy + 0.025, fy + 0.03);
    const tc = P(L / 2, (T + 1.2 + D - T - dv) / 2); bag.add('wood_dark', lathe([[0.25, 0], [0.18, 0.15], [0.22, 0.38], [0.001, 0.38]], 8, null, tc[0], fy + 0.03, tc[1])); bag.add('gilt_bronze', lathe([[0.001, 0], [0.42, 0.01], [0.45, 0.05], [0.43, 0.06], [0.001, 0.03]], 20, null, tc[0], fy + 0.41, tc[1])); col.circle(tc[0], tc[1], 0.45, fy, fy + 0.5);
    h('gilt_bronze', L / 2 - 0.15, (T + 1.2 + D - T - dv) / 2, 0.05, 0.18, 0.45); h('glaze_white', L / 2 + 0.15, (T + 1.2 + D - T - dv) / 2 + 0.1, 0.04, 0.06, 0.45);
    B('wood_painted', T + 0.1, T + 0.2, T + 1.0, T + 0.8, fy, fy + 0.6, true);
    const lp = P(L / 2, D / 2); bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.15, 0.2], [0.08, 0.3], [0.001, 0.32]], 10, null, lp[0], y + st - 0.9, lp[1])); B('iron', L / 2 - 0.005, D / 2 - 0.005, L / 2 + 0.005, D / 2 + 0.005, y + st - 0.58, y + st - 0.24);
  } else {
    // a home: the table and stools, the hearth, a chest, the bed in the corner, a cupboard with crockery
    table(L / 2, D * 0.45, 1.3, 0.8, 0.78); for (const [a, b] of [[-0.9, 0], [0.9, 0], [0, -0.65]]) { const p = [L / 2 + a, D * 0.45 + b]; B('timber', p[0] - 0.18, p[1] - 0.18, p[0] + 0.18, p[1] + 0.18, fy, fy + 0.45, true); }
    h('terracotta', L / 2 - 0.2, D * 0.45, 0.09, 0.3, 0.78); h('plaster_white', L / 2 + 0.25, D * 0.45 - 0.1, 0.1, 0.06, 0.78);
    hearth(L - 1.6 > 2 ? L - 1.6 : L / 2);
    B('wood_dark', T + 0.1, T + 0.2, T + 1.1, T + 0.75, fy, fy + 0.65, true); B('timber', T + 0.1, T + 0.2, T + 1.1, T + 0.25, fy + 0.5, fy + 0.56);
    if (D > 4.5) { B('wood_dark', T + 0.05, D - T - 2.1, T + 1.45, D - T - 0.05, fy, fy + 0.5, true); B('cloth_white', T + 0.1, D - T - 2.05, T + 1.4, D - T - 0.1, fy + 0.5, fy + 0.62); B('cloth_red', T + 0.1, D - T - 1.4, T + 1.4, D - T - 0.1, fy + 0.62, fy + 0.66); B('cloth_white', T + 0.25, D - T - 0.55, T + 1.25, D - T - 0.15, fy + 0.62, fy + 0.78); }
    const cu = L - T - 0.25; B('wood_dark', cu - 0.2, T + 0.3, cu + 0.2, T + 1.5, fy, fy + 1.9, true); for (const hh of [1.0, 1.45]) { B('wood_dark', cu - 0.22, T + 0.3, cu + 0.2, T + 1.5, fy + hh, fy + hh + 0.03); for (let v = T + 0.45; v < T + 1.4; v += 0.3) h(rand() < 0.5 ? 'plaster_white' : 'terracotta', cu - 0.05, v, 0.08, 0.16, hh + 0.03); }
  }
}

function houseMed(el, { bag, col }) {
  const rand = rng(el.seed || 1), O = V[el.variant] ?? V.tuscan, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4;
  const simple = !!el.simple;
  const tower = !el.noTower && rand() < (el.variant === 'tuscan' ? 0.025 : el.variant === 'moorish' ? 0.03 : 0.01) && x1 - x0 < 11 && z1 - z0 < 11;
  const n = tower ? el.storeys + 3 : el.storeys, st = O.st[0] + rand() * (O.st[1] - O.st[0]), H = n * st;
  const wall = pick(rand, O.walls), shut = pick(rand, O.shut), f = el.front || 's';
  const jet = O.jetty && n > 1 ? O.jetty : 0;
  // the ground storey of stone, the rest of the house's wall
  const OPEN = !!el.open && !tower;
  bag.add(O.base, box(x0 - 0.06, foot - 0.6, z0 - 0.06, x1 + 0.06, y + (jet && !OPEN ? st : 0.6), z1 + 0.06));
  const R = [x0, z0, x1, z1];
  if (jet) {
    // the upper storeys jettied out over the street on the front, on timber brackets
    if (f === 's') R[3] += jet; else if (f === 'n') R[1] -= jet; else if (f === 'e') R[2] += jet; else R[0] -= jet;
    bag.add(wall, box(R[0], y + st, R[1], R[2], y + H, R[3]));
    bag.add('timber', box(R[0] - 0.05, y + st - 0.18, R[1] - 0.05, R[2] + 0.05, y + st, R[3] + 0.05));
  } else bag.add(wall, box(x0, y + (OPEN ? st : 0.6), z0, x1, y + H, z1));
  if (!OPEN) col.rect(el.rect, foot - 0.6, y + H);
  else openGround(bag, col, el, { O, wall: jet ? O.base : wall, y, st, H, foot, f, rand });
  // string courses at the floors
  if (!simple && O.trim && el.variant !== 'moorish') for (let s = 1; s < n; s++) bag.add(O.trim, box(R[0] - 0.07, y + s * st - 0.12, R[1] - 0.07, R[2] + 0.07, y + s * st + 0.04, R[3] + 0.07));
  // the openings on the street front and the back: a shop arch or door below, windows above with surrounds and shutters
  const faces = simple ? [f] : [f, { n: 's', s: 'n', e: 'w', w: 'e' }[f]];
  for (const face of faces) {
    const along = face === 'n' || face === 's', L = along ? R[2] - R[0] : R[3] - R[1], a0 = along ? R[0] : R[1];
    const fz = face === 'n' ? R[1] : face === 's' ? R[3] : face === 'w' ? R[0] : R[2], sg = face === 'n' || face === 'w' ? -1 : 1;
    const put = (mat, u0, u1, v0, v1, d0, d1) => { const p0 = fz + sg * d0, p1 = fz + sg * d1; const q = along ? [a0 + u0, Math.min(p0, p1), a0 + u1, Math.max(p0, p1)] : [Math.min(p0, p1), a0 + u0, Math.max(p0, p1), a0 + u1]; bag.add(mat, box(q[0], y + v0, q[1], q[2], y + v1, q[3])); };
    const bays = Math.max(1, Math.round(L / (el.variant === 'moorish' ? 3.6 : 2.5)));
    const main = face === f;
    for (let s = 0; s < n; s++) {
      if (el.variant === 'moorish' && !main && s === 0) continue;
      for (let b = 0; b < bays; b++) {
        const u = (b + 0.5) * L / bays;
        if (s === 0) {
          if (!main) continue;
          if (simple) { if (b === Math.floor(bays / 2)) put('opening', u - 0.6, u + 0.6, 0.5, 2.8, jet ? -jet - 0.01 : -0.01, jet ? -jet + 0.03 : 0.03); continue; }
          if (OPEN && main && b === Math.floor(bays / 2)) { put(O.trim, u - 0.75, u + 0.75, 0.5, 3.15, -0.01, 0.06); continue; }   // the open door (its frame; the way in is cut in openGround)
          if (b === Math.floor(bays / 2) || (el.variant !== 'moorish' && el.variant !== 'french' && rand() < 0.35)) {
            // a door, or a shop's arch with its stone frame
            const w = b === Math.floor(bays / 2) ? 1.2 : Math.min(2.2, L / bays - 0.5), h = Math.min(st - 0.6, 2.4 + w * 0.3);
            if (jet && main) { put('opening', u - w / 2, u + w / 2, 0.5, 0.5 + h, -jet - 0.01, -jet + 0.03); continue; }
            put(O.trim, u - w / 2 - 0.15, u + w / 2 + 0.15, 0.5, 0.65 + h, -0.01, 0.08);
            put('opening', u - w / 2, u + w / 2, 0.6, 0.6 + h, 0.07, 0.11);
            // the door leaves (or a shop's shutters), one of them a little open now and then
            if (b === Math.floor(bays / 2) || rand() < 0.5) { const open = rand() < 0.3; put(el.variant === 'french' || el.variant === 'venetian' ? 'shutter_brown' : 'wood_dark', u - w / 2 + 0.05, open ? u - 0.05 : u + w / 2 - 0.05, 0.62, 0.55 + h, 0.105, 0.13); if (open) put('wood_dark', u + w / 2 - 0.12, u + w / 2 - 0.04, 0.62, 0.55 + h, 0.13, 0.75); }
            if (O.arched && rand() < O.arched) put(O.trim, u - w / 2 - 0.05, u + w / 2 + 0.05, 0.6 + h - 0.35, 0.6 + h, 0.06, 0.12);
          } else if (el.variant !== 'moorish') {
            // a small window of the ground storey behind its grating (wooden bars in Florence's tiles, whose
            // meshes are at their limit; iron elsewhere), a stone sill outside Florence
            put('opening', u - 0.35, u + 0.35, 1.4, 2.2, -0.01, 0.03);
            const gm = el.variant === 'tuscan' ? 'wood_dark' : 'iron';
            for (const g of [-0.175, 0, 0.175]) put(gm, u + g - 0.018, u + g + 0.018, 1.4, 2.2, 0.03, 0.065);
            for (const g of [1.6, 2.0]) put(gm, u - 0.35, u + 0.35, g - 0.018, g + 0.018, 0.065, 0.095);
            if (el.variant !== 'tuscan') put(O.trim, u - 0.45, u + 0.45, 1.3, 1.4, -0.01, 0.12);
          }
          continue;
        }
        if (el.variant === 'moorish' && rand() < 0.5) continue;
        if (simple || !main) { const ww = O.win[0], wh = Math.min(st - 1.1, O.win[1]), v0 = s * st + (st - wh) * 0.45; put('opening', u - ww / 2, u + ww / 2, v0, v0 + wh, -0.01, 0.03); continue; }
        const ww = O.win[0] * (0.9 + rand() * 0.2), wh = Math.min(st - 1.1, O.win[1] * (s === 1 && el.variant !== 'moorish' ? 1.15 : 1)), v0 = s * st + (st - wh) * 0.45;
        // the stone surround, the sill, the window, its shutters (open, or closed now and then)
        if (el.variant !== 'ottoman') put(O.trim, u - ww / 2 - 0.12, u + ww / 2 + 0.12, v0 - 0.12, v0 + wh + 0.12, -0.01, 0.05);
        put(O.trim, u - ww / 2 - 0.18, u + ww / 2 + 0.18, v0 - 0.18, v0 - 0.06, -0.01, 0.16);
        const closed = rand() < 0.25;
        put(closed ? shut : 'opening', u - ww / 2, u + ww / 2, v0, v0 + wh, 0.04, 0.08);
        // the casement's frame: a mullion and a transom
        if (!closed) { put('wood_dark', u - 0.03, u + 0.03, v0, v0 + wh, 0.08, 0.1); put('wood_dark', u - ww / 2, u + ww / 2, v0 + wh * 0.66 - 0.03, v0 + wh * 0.66 + 0.03, 0.08, 0.1); }
        if (!closed && shut && el.variant !== 'moorish' && el.variant !== 'ottoman') for (const sd of [-1, 1]) put(shut, sd < 0 ? u - ww - 0.12 : u + ww / 2 + 0.12, sd < 0 ? u - ww / 2 - 0.12 : u + ww + 0.12, v0, v0 + wh, 0.03, 0.08);
        if (el.variant === 'french' && s === 1 && !closed && (b % 2 === 0 || bays < 3)) {
          // a balcony of wrought iron on two stone consoles: bars between rails, scrolled ends
          const bw = ww * 0.62, bd = 0.42;
          put(O.trim, u - bw, u + bw, v0 - 0.1, v0 + 0.0, 0.05, bd + 0.05);
          for (const sx of [-1, 1]) put(O.trim, u + sx * (bw - 0.15) - 0.06, u + sx * (bw - 0.15) + 0.06, v0 - 0.4, v0 - 0.1, 0.05, 0.3);
          put('iron', u - bw, u + bw, v0 + 0.9, v0 + 0.95, bd, bd + 0.04); put('iron', u - bw, u + bw, v0 + 0.02, v0 + 0.06, bd, bd + 0.03);
          for (let x = u - bw + 0.04; x <= u + bw - 0.03; x += 0.13) put('iron', x - 0.012, x + 0.012, v0 + 0.06, v0 + 0.9, bd, bd + 0.025);
          for (const sx of [-1, 1]) put('iron', sx < 0 ? u - bw : u + bw - 0.04, sx < 0 ? u - bw + 0.04 : u + bw, v0 + 0.06, v0 + 0.95, 0.06, bd);
        }
        if (O.pointed && rand() < O.pointed) put(O.trim, u - 0.08, u + 0.08, v0 + wh, v0 + wh + 0.4, 0.0, 0.08);
        if (el.variant === 'venetian' && s === 1 && b === Math.floor(bays / 2) && rand() < 0.35) {
          // a balcony: a slab of Istrian stone on two brackets, an iron railing of bars between rails
          const bw = ww, bd = 0.75;
          put(O.trim, u - bw, u + bw, v0 - 0.22, v0 - 0.06, 0.05, bd + 0.05);
          for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) put(O.trim, u + sx * (bw - 0.2) - 0.07, u + sx * (bw - 0.2) + 0.07, v0 - 0.52 + k * 0.1, v0 - 0.42 + k * 0.1, 0.05, 0.05 + bd * (k + 1) / 3);
          put('iron', u - bw, u + bw, v0 + 0.84, v0 + 0.9, bd - 0.03, bd + 0.03);
          put('iron', u - bw, u + bw, v0 + 0.02, v0 + 0.06, bd - 0.02, bd + 0.02);
          for (let x = u - bw + 0.03; x <= u + bw - 0.02; x += 0.12) put('iron', x - 0.012, x + 0.012, v0 - 0.06, v0 + 0.84, bd - 0.012, bd + 0.012);
          for (const sx of [-1, 1]) { put('iron', sx < 0 ? u - bw : u + bw - 0.03, sx < 0 ? u - bw + 0.03 : u + bw, v0 + 0.84, v0 + 0.9, 0.08, bd - 0.03); for (let d = 0.2; d < bd - 0.05; d += 0.15) put('iron', sx < 0 ? u - bw + 0.003 : u + bw - 0.027, sx < 0 ? u - bw + 0.027 : u + bw - 0.003, v0 - 0.06, v0 + 0.84, d - 0.012, d + 0.012); }
        }
        if (el.variant === 'moorish' && main && s === 1 && rand() < 0.3) put('lattice', u - ww / 2 - 0.2, u + ww / 2 + 0.2, v0 - 0.2, v0 + wh + 0.2, 0.05, 0.6);   // the latticed balcony
      }
    }
    // the bay (cumba) of an Ottoman house on its front
    if (!simple && el.variant === 'ottoman' && main && n > 1 && rand() < 0.6) {
      // the cumba: a closed bay of boards on stepped brackets, a row of sash windows round its three faces,
      // their lower parts behind wooden lattice (kafes), a cornice board above
      const u = L / 2, w = Math.min(3, L * 0.45), a = u - w / 2, b = u + w / 2, D = 0.75, ya = st + 0.3, yb = st * 2 - 0.2, wa = st + 0.95, wb = st * 2 - 0.55;
      put(wall, a, b, ya, yb, 0, D);
      put('timber', a - 0.1, b + 0.1, st + 0.2, st + 0.32, -0.02, D + 0.1);
      for (const ub of [a + 0.15, u, b - 0.15]) for (let k = 0; k < 3; k++) put('timber', ub - 0.07, ub + 0.07, st - 0.4 + k * 0.2, st - 0.2 + k * 0.2, 0, D * (k + 1) / 3);
      const nw = Math.max(2, Math.round((w - 0.3) / 0.7)), ww2 = (w - 0.3) / nw;
      for (let k = 0; k < nw; k++) {
        const c0 = a + 0.15 + k * ww2 + 0.06, c1 = a + 0.15 + (k + 1) * ww2 - 0.06;
        put('opening', c0, c1, wa, wb, D, D + 0.01);
        put('koshi', c0, c1, wa, wa + (wb - wa) * 0.55, D + 0.01, D + 0.03);
        put('timber', c0 - 0.06, c0, wa - 0.05, wb + 0.05, D, D + 0.05); put('timber', c1, c1 + 0.06, wa - 0.05, wb + 0.05, D, D + 0.05);
      }
      put('timber', a + 0.1, b - 0.1, wa - 0.1, wa - 0.02, D, D + 0.08); put('timber', a + 0.1, b - 0.1, wb, wb + 0.08, D, D + 0.06);
      put('timber', a - 0.15, b + 0.15, yb, yb + 0.12, -0.02, D + 0.15);
    }
  }
  if (el.variant === 'french' && !simple) {
    // chain quoins of cut stone at the corners (long and short in turn), and a hanging iron sign with its painted board over a shop door
    for (const [cx0, cz0] of [[R[0], R[1]], [R[2], R[1]], [R[0], R[3]], [R[2], R[3]]]) for (let k = 0, v = 0.6; v < H - 0.3; k++, v += 0.55) {
      const q = k % 2 ? 0.5 : 0.85, sx = cx0 === R[0] ? 1 : -1, sz = cz0 === R[1] ? 1 : -1;
      bag.add(O.trim, box(Math.min(cx0 - sx * 0.04, cx0 + sx * q), y + v, Math.min(cz0 - sz * 0.04, cz0 + sz * 0.04), Math.max(cx0 - sx * 0.04, cx0 + sx * q), y + v + 0.5, Math.max(cz0 - sz * 0.04, cz0 + sz * 0.04)));
    }
    if (!OPEN && rand() < 0.45) {
      const along = f === 'n' || f === 's', sg = f === 'n' || f === 'w' ? -1 : 1, fz = f === 'n' ? R[1] : f === 's' ? R[3] : f === 'w' ? R[0] : R[2], u0 = along ? R[0] + (R[2] - R[0]) * 0.8 : R[1] + (R[3] - R[1]) * 0.8;
      const B = (mat, a0, a1, v0, v1, d0, d1) => { const p0 = fz + sg * d0, p1 = fz + sg * d1, q = along ? [u0 + a0, Math.min(p0, p1), u0 + a1, Math.max(p0, p1)] : [Math.min(p0, p1), u0 + a0, Math.max(p0, p1), u0 + a1]; bag.add(mat, box(q[0], y + v0, q[1], q[2], y + v1, q[3])); };
      B('iron', -0.02, 0.02, 3.0, 3.04, 0.05, 1.05); B('iron', -0.02, 0.02, 3.04, 3.5, 0.05, 0.09);
      B(rand() < 0.5 ? 'paint_blue' : 'cloth_red', -0.03, 0.03, 2.15, 2.95, 0.35, 0.95); B('gilt_bronze', -0.04, 0.04, 2.12, 2.15, 0.33, 0.97);
    }
  }
  // the top: a cornice and a roof (low tiled, steep slate, or flat behind a parapet)
  const ye = y + H, flat = O.flat && rand() < O.flat;
  if (flat) {
    for (const [a, b, c, d] of [[R[0], R[1], R[2], R[1] + 0.25], [R[0], R[3] - 0.25, R[2], R[3]], [R[0], R[1], R[0] + 0.25, R[3]], [R[2] - 0.25, R[1], R[2], R[3]]]) bag.add(wall, box(a, ye, b, c, ye + 0.9, d));
    bag.add('brick_paving', box(R[0] + 0.25, ye - 0.05, R[1] + 0.25, R[2] - 0.25, ye + 0.02, R[3] - 0.25));
  } else {
    if (O.eave > 0.5) { bag.add('timber', box(R[0] - O.eave, ye - 0.22, R[1] - O.eave, R[2] + O.eave, ye, R[3] + O.eave)); if (!simple && (f === 'n' || f === 's')) for (let u = R[0] - O.eave + 0.3; u < R[2] + O.eave; u += 0.9) { const zz = f === 's' ? R[3] + 0.05 : R[1] - 0.17; bag.add('wood_dark', box(u, ye - 0.36, Math.min(zz, zz + (f === 's' ? 0 : 0)), u + 0.1, ye - 0.22, zz + 0.12 + (f === 's' ? O.eave - 0.2 : 0)).translate(0, 0, f === 's' ? 0 : -(O.eave - 0.2))); } }
    else { const ov = Math.max(0.35, O.eave); bag.add(O.trim, box(R[0] - ov, ye - 0.3, R[1] - ov, R[2] + ov, ye, R[3] + ov)); }   // the cornice, as deep as the roof's overhang
    const rise = hipRoof(bag, O.roof, R, ye, O.pitch + (rand() - 0.5) * 4, Math.max(0.35, O.eave));
    // dormers in a steep roof
    if (O.dormers && !simple) { const along = f === 'n' || f === 's', L = along ? R[2] - R[0] : R[3] - R[1], nd = Math.max(1, Math.floor(L / 3.5)); for (let k = 0; k < nd; k++) { const u = (k + 0.5) * L / nd, zf = f === 's' ? R[3] - 0.6 : f === 'n' ? R[1] + 0.6 : 0, xf = f === 'e' ? R[2] - 0.6 : f === 'w' ? R[0] + 0.6 : 0; const q = along ? [R[0] + u - 0.55, zf - 0.6, R[0] + u + 0.55, zf + 0.6] : [xf - 0.6, R[1] + u - 0.55, xf + 0.6, R[1] + u + 0.55]; bag.add('plaster_white', box(q[0], ye, q[1], q[2], ye + 1.7, q[3])); hipRoof(bag, 'slate', q, ye + 1.7, 45, 0.1); } }
    // chimneys: funnel chimneys in Venice, tall stacks in France, plain stacks elsewhere
    const nc = simple ? (el.variant === 'venetian' || el.variant === 'french' ? 1 : 0) : el.variant === 'venetian' ? 1 + Math.floor(rand() * 3) : el.variant === 'french' ? 2 : rand() < 0.5 ? 1 : 0;
    for (let k = 0; k < nc; k++) {
      const cx = R[0] + 1 + rand() * (R[2] - R[0] - 2), cz = R[1] + 1 + rand() * (R[3] - R[1] - 2), ch = rise + (el.variant === 'french' ? 2.2 : 1.1);
      bag.add(el.variant === 'french' ? 'limestone' : 'brick', box(cx - 0.3, ye, cz - 0.3, cx + 0.3, ye + ch, cz + 0.3));
      if (el.variant === 'venetian') bag.add('stucco_venice', lathe([[0.25, 0], [0.55, 0.8], [0.6, 1.0], [0.001, 1.0]], 8, null, cx, ye + ch, cz));
    }
    // a roof loggia (altana) in Venice and Florence
    if (!simple && (el.variant === 'venetian' || el.variant === 'tuscan') && rand() < 0.15) {
      const ax = (R[0] + R[2]) / 2, az = (R[1] + R[3]) / 2, ay = ye + rise * 0.7;
      bag.add('timber', box(ax - 1.4, ay, az - 1.2, ax + 1.4, ay + 0.12, az + 1.2));
      for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('timber', box(ax + dx * 1.3 - 0.05, ye, az + dz * 1.1 - 0.05, ax + dx * 1.3 + 0.05, ay + 1.1, az + dz * 1.1 + 0.05));
      bag.add('timber', box(ax - 1.4, ay + 1.0, az - 1.2, ax + 1.4, ay + 1.08, az + 1.2).translate(0, 0, 0));
    }
  }
}
STYLES.vernacular.elements.house_med = houseMed;
