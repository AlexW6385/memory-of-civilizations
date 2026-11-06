// Modern (1930s–1970s; docs/settlements/sydney.md §4): the Opera House — the granite-clad podium
// and its broad stair, the two halls' rows of white-tiled shells rising toward the harbour, glazed
// at their mouths; the Harbour Bridge's steel arch of two trussed ribs, its deck hung beneath, the
// granite pylons; the Cahill Expressway and the quay; towers of concrete and glass; the Rocks'
// sandstone terraces.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, frustum } from '../../core/geom.js';
import '../qing/index.js';
import '../artdeco/index.js';
import { rocksTerrace } from './rocks.js';
import { archBridge } from './bridge.js';
import { wharf } from './wharf.js';

/** Both faces of a triangle. */
const tri2 = (t, a, b, c) => t.push(...a, ...b, ...c, ...a, ...c, ...b);
/** One shell: from the south base at z0 to the mouth at z1 (z1 < z0: it opens north), half-width hw, height H, on y. */
function shell(bag, cx, z0, z1, hw, H, y) {
  // each half of the shell's section is an arc of a circle (the shells are cut from one sphere), the two
  // meeting in a sharp ridge along the top
  const c = 0.55, R = 1 + c, arc = (a) => Math.sqrt(Math.max(0, R * R - (a + c) * (a + c))), a0 = arc(0), a1 = arc(1);
  const sect = (s) => (arc(Math.abs(s)) - a1) / (a0 - a1);
  const nu = 16, nv = 14, P = (i, j) => {
    const s = -1 + 2 * i / nu, t = j / nv, h = H * (1 - (1 - t) ** 2.2), w = hw * (1 - 0.3 * t);
    return [cx + s * w, y + h * sect(s), z0 + (z1 - z0) * t + (z1 - z0) * 0.16 * t * t * (1 - Math.abs(s))];
  };
  const T = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { tri2(T, P(i, j), P(i + 1, j), P(i + 1, j + 1)); tri2(T, P(i, j), P(i + 1, j + 1), P(i, j + 1)); }
  bag.add('tile_opera', fromTriangles(T));
  // the underside: the precast concrete of the shell, 0.4 m under the tiles, its edge at the mouth, and the ribs
  // running up it from the pedestal to the mouth (§1a)
  const Q = (i, j) => { const p = P(i, j); return [p[0], p[1] - 0.4, p[2]]; }, U = [], E = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { tri2(U, Q(i, j), Q(i + 1, j), Q(i + 1, j + 1)); tri2(U, Q(i, j), Q(i + 1, j + 1), Q(i, j + 1)); }
  for (let i = 0; i < nu; i++) { tri2(E, P(i, nv), P(i + 1, nv), Q(i + 1, nv)); tri2(E, P(i, nv), Q(i + 1, nv), Q(i, nv)); }
  bag.add('concrete_light', fromTriangles(U)); bag.add('concrete_light', fromTriangles(E));
  for (let i = 1; i < nu; i++) for (let j = 1; j < nv; j++) { const a = Q(i, j), b = Q(i, j + 1); if (a[1] - y < 1.2) continue; bag.add('concrete_light', rod([a[0], a[1] - 0.12, a[2]], [b[0], b[1] - 0.12, b[2]], 0.2, 4)); }
  // the ridge: a rib of the cream tiles along the top, and the ribs fanning down the shell's face
  const rib = [];
  for (let j = 0; j < nv; j++) { const a = P(nu / 2, j), b = P(nu / 2, j + 1); rib.push(rod([a[0], a[1] + 0.05, a[2]], [b[0], b[1] + 0.05, b[2]], 0.28, 6)); }
  for (const i of [3, 6, 10, 13]) for (let j = 2; j < nv; j++) { const a = P(i, j), b = P(i, j + 1); rib.push(rod(a, b, 0.12, 4)); }
  for (const g of rib) bag.add('tile_cream', g);
  // the chevrons of the tile lids: V-shaped joints of the cream tiles between the ribs, pointing up the shell
  const ch = [];
  for (const [ia, ib] of [[0, 3], [3, 6], [6, 8], [8, 10], [10, 13], [13, 16]]) for (let j = 3; j < nv - 1; j += 2) {
    const im = Math.round((ia + ib) / 2), a = P(ia, j), m = P(im, j + 1), b = P(ib, j);
    ch.push(rod(a, m, 0.07, 4), rod(m, b, 0.07, 4));
  }
  for (const g of ch) bag.add('tile_cream', g);
  // the glass wall hung in the mouth: pleated, its folds running down from the shell's edge to the podium,
  // on steel mullions, with transoms every few metres
  const G = [], depth = (z0 - z1) * 0.07, foot = (i) => { const a = P(i, nv); return [a[0], y, z1 + depth + (i % 2 ? 1.1 : -0.2) + (z1 - z0) * 0.16 * (1 - Math.abs(-1 + 2 * i / nu)) * 0.7]; };
  for (let i = 0; i < nu; i++) {
    const a = P(i, nv), b = P(i + 1, nv), fa = foot(i), fb = foot(i + 1);
    if (a[1] - y < 0.3 && b[1] - y < 0.3) continue;
    tri2(G, a, b, fb); tri2(G, a, fb, fa);
  }
  bag.add('glass_topaz', fromTriangles(G));        // Hall's topaz-tinted glass
  for (let i = 1; i < nu; i++) {
    const a = P(i, nv), f = foot(i); if (a[1] - y < 1) continue;
    bag.add('steel_grey', rod([a[0], a[1] - 0.1, a[2]], f, 0.09, 5));
    for (let k = 1; k * 3.2 < a[1] - y; k++) {
      const t = k * 3.2 / (a[1] - y), b = P(i + 1, nv), fb = foot(i + 1), tb = k * 3.2 / Math.max(0.01, b[1] - y);
      if (tb >= 1 || i + 1 >= nu) continue;
      const p = [f[0] + (a[0] - f[0]) * t, f[1] + (a[1] - f[1]) * t, f[2] + (a[2] - f[2]) * t], q = [fb[0] + (b[0] - fb[0]) * tb, fb[1] + (b[1] - fb[1]) * tb, fb[2] + (b[2] - fb[2]) * tb];
      bag.add('steel_grey', rod(p, q, 0.05, 4));
    }
  }
}
/** opera_house: { rect (the podium), y, h (podium height), halls: [{ x, hw, shells: [[z0, z1, H]] }], stair (depth, on the south) } */
function operaHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 9, st = el.stair ?? 22;
  bag.add('granite_podium', box(x0, y - 4, z0, x1, y + h, z1)); col.rect(el.rect, y - 4, y + h); col.floor(el.rect, y + h);
  // the monumental stair up the south side
  const n = 18;
  for (let k = 0; k < n; k++) { const zz = z1 + st * (1 - k / n), yy = y + h * (k + 1) / n; bag.add('granite_podium', box(x0 + 8, y - 0.5, zz - st / n, x1 - 8, yy - 0.04, zz)); bag.add('granite_grey', box(x0 + 8, yy - 0.04, zz - st / n, x1 - 8, yy, zz + 0.04)); col.floor([x0 + 8, zz - st / n, x1 - 8, zz], yy); }
  // the stair's cheeks: low granite walls stepping down with it
  for (const sx of [x0 + 6.6, x1 - 8]) {
    // a prism: its top sloping with the stair, 1 m above the treads
    const a = sx, b = sx + 1.4, zA = z1, zB = z1 + st, yA = y + h + 1.0, yB = y + 1.0, yb = y - 0.5, T = [];
    const q = (p1, p2, p3, p4) => T.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4, ...p1, ...p3, ...p2, ...p1, ...p4, ...p3);
    q([a, yb, zA], [a, yA, zA], [a, yB, zB], [a, yb, zB]); q([b, yb, zA], [b, yA, zA], [b, yB, zB], [b, yb, zB]);
    q([a, yA, zA], [b, yA, zA], [b, yB, zB], [a, yB, zB]); q([a, yb, zB], [a, yB, zB], [b, yB, zB], [b, yb, zB]);
    bag.add('granite_grey', fromTriangles(T));
  }
  // the podium's sides: granite in courses, the long bands of the foyers' and the concourse's glazing under the broadwalk
  for (const [xa, sg] of [[x0, -1], [x1, 1]]) {
    for (let k = 1; k < 4; k++) bag.add('granite_grey', box(sg < 0 ? xa - 0.08 : xa, y + k * h / 4 - 0.05, z0, sg < 0 ? xa : xa + 0.08, y + k * h / 4 + 0.05, z1));
    for (let zz = z0 + 6; zz < z1 - 6; zz += 7) bag.add('glass_outer', box(sg < 0 ? xa - 0.06 : xa, y + 1.2, zz, sg < 0 ? xa : xa + 0.06, y + h / 2 - 0.4, zz + 5.4));
  }
  for (let xx = x0 + 6; xx < x1 - 6; xx += 7) bag.add('glass_outer', box(xx, y + 1.2, z0 - 0.06, xx + 5.4, y + h / 2 - 0.4, z0));
  // the broadwalk round the podium's foot
  bag.add('granite_grey', box(x0 - 6, y - 4, z0 - 6, x1 + 6, y + 0.2, z1 + st + 2));
  for (const hall of el.halls ?? []) for (const [a, b, H, hw] of hall.shells) shell(bag, hall.x, a, b, hw ?? hall.hw, H, y + h);
  // under each hall's shells: the auditorium's enclosure, clad in brush box, stepping up northward under the
  // shells' envelope to its north wall, and between that wall and the glass the northern foyer over the harbour:
  // its floor, the benches facing the glass, a bar against the enclosure, the lamps (§1a)
  const yf = y + h;
  for (const hall of el.halls ?? []) {
    const env = (xx, zz) => {               // the lowest inner surface of the shells over (xx, zz), from their section and profile
      let best = 0;
      for (const [a, b, H, hw0] of hall.shells) {
        const hw = hw0 ?? hall.hw, t = (zz - a) / (b - a); if (t < 0 || t > 1) continue;
        const w = hw * (1 - 0.3 * t), sx = (xx - hall.x) / w; if (Math.abs(sx) >= 1) continue;
        const c = 0.55, R = 1 + c, arc = (q) => Math.sqrt(Math.max(0, R * R - (q + c) * (q + c))), sect = (arc(Math.abs(sx)) - arc(1)) / (arc(0) - arc(1));
        best = Math.max(best, H * (1 - (1 - t) ** 2.2) * sect - 0.6);
      }
      return best;
    };
    const last = hall.shells[hall.shells.length - 1], zMouth = last[1], zN = zMouth + (last[0] - last[1]) * 0.62, zS = hall.shells[0][0] - 10, aw = hall.hw * 0.55;
    for (let zz = zS; zz > zN; zz -= 4) {
      const zb = Math.max(zN, zz - 4), hh = Math.min(env(hall.x - aw, zz), env(hall.x - aw, zb), env(hall.x + aw, zz), env(hall.x + aw, zb)) * 0.82;
      if (hh < 3) continue;
      bag.add('brushbox', box(hall.x - aw, yf, zb, hall.x + aw, yf + hh, zz));
    }
    // the north wall of the enclosure, in three tiers stepping back as they rise
    const hN = Math.min(env(hall.x - aw, zN), env(hall.x + aw, zN)) * 0.82;
    for (let k = 0; k < 3; k++) bag.add('brushbox', box(hall.x - aw + k * 0.8, yf + hN * k / 3, zN - 3 + k * 1.0, hall.x + aw - k * 0.8, yf + hN * (k + 1) / 3 - 0.05, zN));
    for (let k = 0; k < 3; k++) for (let u = hall.x - aw + k * 0.8 + 0.4; u < hall.x + aw - k * 0.8 - 0.3; u += 0.6) bag.add('brushbox', box(u - 0.08, yf + hN * k / 3 + (k ? 0.05 : 0.3), zN - 3 + k * 1.0 - 0.1, u + 0.08, yf + hN * (k + 1) / 3 - 0.4, zN - 3 + k * 1.0));   // the brush-box battens
    for (let k = 1; k < 3; k++) bag.add('glass_outer', box(hall.x - aw + 2, yf + hN * k / 3 - 0.05 - 1.4, zN - 3 + (k - 1) * 1.0 - 0.02, hall.x + aw - 2, yf + hN * k / 3 - 0.35, zN - 3 + (k - 1) * 1.0));
    col.rect([hall.x - aw, zN - 3, hall.x + aw, zS], yf, yf + 20);
    // the foyer's floor, the bar, benches facing the harbour, lamps on stands
    const f0 = zMouth + 2.5, f1 = zN - 3;
    bag.add('timber', box(hall.x - aw - 4, yf, f0, hall.x + aw + 4, yf + 0.04, f1));
    bag.add('marble_dark', box(hall.x - 6, yf, f1 - 1.2, hall.x + 6, yf + 1.1, f1 - 0.4)); bag.add('timber', box(hall.x - 6.1, yf + 1.1, f1 - 1.3, hall.x + 6.1, yf + 1.16, f1 - 0.3));
    col.rect([hall.x - 6, f1 - 1.2, hall.x + 6, f1 - 0.4], yf, yf + 1.2);
    for (let r = 0; r < 2; r++) for (let k = -2; k <= 2; k++) {
      const bx = hall.x + k * 5.2, bz = f0 + 3 + r * 4;
      bag.add('cloth_red', box(bx - 1.8, yf + 0.04, bz - 0.4, bx + 1.8, yf + 0.45, bz + 0.4));
      bag.add('steel_grey', box(bx - 1.8, yf + 0.04, bz - 0.45, bx + 1.8, yf + 0.12, bz + 0.45));
    }
    for (const k of [-1, 1]) { const lx = hall.x + k * (aw + 2); bag.add('steel_grey', lathe([[0.25, 0], [0.25, 0.05], [0.03, 0.08], [0.03, 2.2], [0.001, 2.2]], 8, null, lx, yf + 0.04, f1 - 2)); bag.add('lamp_white', lathe([[0.001, 0], [0.3, 0.05], [0.32, 0.4], [0.001, 0.5]], 10, null, lx, yf + 2.2, f1 - 2)); }
  }
  // the small restaurant shells at the south-west corner
  shell(bag, x0 + 14, z1 - 4, z1 - 20, 9, 12, y + h);
  shell(bag, x0 + 14, z1 - 18, z1 - 30, 8, 9, y + h);
}
/** round_tower: { c, r, h, y } — a round office tower of concrete fins and glass (Australia Square). */
function roundTower(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 21, h = el.h ?? 170, y = el.y ?? 0;
  bag.add('facade_grey', lathe([[r, 0], [r, h], [0.001, h]], 32, null, x, y - 0.5, z)); col.circle(x, z, r, y, y + h);
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; bag.add('plaster_white', box(x + Math.cos(a) * (r + 0.3) - 0.4, y, z + Math.sin(a) * (r + 0.3) - 0.4, x + Math.cos(a) * (r + 0.3) + 0.4, y + h, z + Math.sin(a) * (r + 0.3) + 0.4)); }
  bag.add('plaster_white', lathe([[r + 1, 0], [r + 1, 2], [0.001, 2]], 32, null, x, y + h, z));
}
/** viaduct: { rect (along x), y (deck), w } — the Cahill Expressway over the quay's station. */
function viaduct(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 13;
  bag.add('plaster_grey', box(x0, y - 1.5, z0, x1, y, z1)); col.floor(el.rect, y);
  bag.add('plaster_grey', box(x0, -0.5, z0 + 2, x1, y - 6, z1 - 2)); col.rect([x0, z0 + 2, x1, z1 - 2], -0.5, y - 6);
  for (let x = x0 + 6; x < x1; x += 12) bag.add('opening', box(x - 3, 0.5, z0 + 1.95, x + 3, y - 8, z0 + 2.02));
  for (let x = x0; x <= x1; x += 9) for (const z of [z0 + 0.6, z1 - 0.6]) bag.add('plaster_grey', box(x - 0.5, y - 6, z - 0.5, x + 0.5, y - 1.5, z + 0.5));
}
/**
 * ferry: { at, y (the water), rot (0: bows toward −z), kind ('lady' | 'manly' | 'hydrofoil') } — the harbour's
 * ferries of 1973: the double-ended Lady class (about 38 m) with a wheelhouse at each end; a Manly ferry
 * (about 60 m), double-ended, two decks of saloons and a funnel; a hydrofoil.
 */
function ferry(el, { bag, col }) {
  const kind = el.kind ?? 'lady', K = { lady: { L: 38, B: 9.6, fb: 1.7, decks: 1 }, manly: { L: 60, B: 11.2, fb: 2.0, decks: 2 }, hydrofoil: { L: 21, B: 6.2, fb: 1.6, decks: 1 } }[kind];
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), sn = Math.sin(rot), parts = [];
  const W = (lx, ly, lz) => [x + lx * c + lz * sn, y + ly, z - lx * sn + lz * c];
  const half = (t, B) => { const e = kind === 'hydrofoil' ? Math.max(0, Math.min(1, (1 - t) * 3.2)) * Math.min(1, t * 8) : 1 - Math.abs(2 * t - 1) ** 3.2; return B / 2 * Math.sqrt(Math.max(0, e)); };
  // the hull: sections from the sheer down to below the water, the sheer rising a little to both ends
  const H = [], n = 28, m = 6, sheer = (t) => K.fb + 0.5 * (2 * t - 1) ** 2;
  const HP = (i, j) => { const t = i / n, hw = half(t, K.B), a = j / m * Math.PI / 2; return W(hw * Math.cos(a) * (j === m ? 0 : 1), sheer(t) - (sheer(t) + 1.6) * Math.sin(a), -K.L / 2 + K.L * t); };
  const HPm = (i, j) => { const p = HP(i, j), t = i / n, hw = half(t, K.B), a = j / m * Math.PI / 2; return W(-hw * Math.cos(a) * (j === m ? 0 : 1), sheer(t) - (sheer(t) + 1.6) * Math.sin(a), -K.L / 2 + K.L * t); };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { tri2(H, HP(i, j), HP(i + 1, j), HP(i + 1, j + 1)); tri2(H, HP(i, j), HP(i + 1, j + 1), HP(i, j + 1)); tri2(H, HPm(i, j), HPm(i + 1, j), HPm(i + 1, j + 1)); tri2(H, HPm(i, j), HPm(i + 1, j + 1), HPm(i, j + 1)); }
  bag.add(kind === 'hydrofoil' ? 'paint_white' : 'paint_ferry_green', fromTriangles(H));
  const D = [];
  for (let i = 0; i < n; i++) { const a = HP(i, 0), b = HP(i + 1, 0), am = HPm(i, 0), bm = HPm(i + 1, 0); tri2(D, a, b, bm); tri2(D, a, bm, am); }
  bag.add('planks_grey', fromTriangles(D));
  // the rubbing strake along the sheer
  for (let i = 0; i < n; i++) for (const f of [HP, HPm]) { const a = f(i, 0), b = f(i + 1, 0); bag.add(kind === 'hydrofoil' ? 'steel_grey' : 'car_cream', rod([a[0], a[1] - 0.25, a[2]], [b[0], b[1] - 0.25, b[2]], 0.12, 4)); }
  // the saloons: a prism of the hull's plan drawn in, a wall below, the band of windows, the cornice, the deck over it
  const prism = (k0, k1, ins, y0, y1, mat, cap = true) => {
    const T = [], N = 20, pt = (i, sg, yy) => { const t = k0 + (k1 - k0) * i / N, hw = Math.max(0.3, half(t, K.B) - ins); return W(sg * hw, yy, -K.L / 2 + K.L * t); };
    for (let i = 0; i < N; i++) for (const sg of [-1, 1]) { tri2(T, pt(i, sg, y0), pt(i + 1, sg, y0), pt(i + 1, sg, y1)); tri2(T, pt(i, sg, y0), pt(i + 1, sg, y1), pt(i, sg, y1)); if (cap) { tri2(T, pt(i, -1, y1), pt(i + 1, -1, y1), pt(i + 1, 1, y1)); tri2(T, pt(i, -1, y1), pt(i + 1, 1, y1), pt(i, 1, y1)); } }
    for (const i of [0, N]) { tri2(T, pt(i, -1, y0), pt(i, 1, y0), pt(i, 1, y1)); tri2(T, pt(i, -1, y0), pt(i, 1, y1), pt(i, -1, y1)); }
    bag.add(mat, fromTriangles(T));
  };
  let yy = K.fb + 0.4;
  for (let d = 0; d < K.decks; d++) {
    const k0 = kind === 'hydrofoil' ? 0.22 : 0.12 + d * 0.08, k1 = kind === 'hydrofoil' ? 0.8 : 0.88 - d * 0.08, ins = 0.5 + d * 0.5;
    prism(k0, k1, ins, yy - 0.5, yy + 0.8, 'paint_white', false);
    prism(k0, k1, ins + 0.06, yy + 0.8, yy + 1.9, 'glass_outer', false);
    prism(k0, k1, ins, yy + 1.9, yy + 2.3, 'paint_white', false);
    prism(k0 - 0.03, k1 + 0.03, ins - 0.35, yy + 2.3, yy + 2.45, 'car_cream');
    for (let i = 1; i < 18; i++) { const t = k0 + (k1 - k0) * i / 18, hw = half(t, K.B) - ins - 0.03; for (const sg of [-1, 1]) bag.add('paint_white', rod(W(sg * hw, yy + 0.8, -K.L / 2 + K.L * t), W(sg * hw, yy + 1.9, -K.L / 2 + K.L * t), 0.06, 4)); }
    yy += 2.45;
  }
  if (kind === 'hydrofoil') { for (const t of [0.12, 0.82]) { const a = W(-K.B / 2 - 0.6, -0.6, -K.L / 2 + K.L * t), b = W(K.B / 2 + 0.6, -0.6, -K.L / 2 + K.L * t); bag.add('steel_grey', rod(a, b, 0.18, 6)); } return; }
  // the wheelhouses at both ends, the railings of the upper deck, the funnel or the mast
  for (const t of [0.17 + (K.decks - 1) * 0.08, 0.83 - (K.decks - 1) * 0.08]) {
    const a = W(-1.6, yy, -K.L / 2 + K.L * t - 1.4), b = W(1.6, yy + 2.2, -K.L / 2 + K.L * t + 1.4);
    const q = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])];
    bag.add('paint_white', box(q[0], a[1], q[1], q[2], a[1] + 1.0, q[3])); bag.add('glass_outer', box(q[0] + 0.05, a[1] + 1.0, q[1] + 0.05, q[2] - 0.05, a[1] + 1.9, q[3] - 0.05));
    bag.add('car_cream', box(q[0] - 0.2, a[1] + 1.9, q[1] - 0.2, q[2] + 0.2, a[1] + 2.1, q[3] + 0.2));
  }
  const k0 = 0.12 + (K.decks - 1) * 0.08, k1 = 0.88 - (K.decks - 1) * 0.08;
  for (const sg of [-1, 1]) for (let i = 0; i < 16; i++) { const t0 = k0 + (k1 - k0) * i / 16, t1 = k0 + (k1 - k0) * (i + 1) / 16, h0 = half(t0, K.B) - 0.5 - (K.decks - 1) * 0.5 + 0.2, h1 = half(t1, K.B) - 0.5 - (K.decks - 1) * 0.5 + 0.2; bag.add('paint_white', rod(W(sg * h0, yy + 1.0, -K.L / 2 + K.L * t0), W(sg * h1, yy + 1.0, -K.L / 2 + K.L * t1), 0.04, 4)); bag.add('paint_white', rod(W(sg * h0, yy, -K.L / 2 + K.L * t0), W(sg * h0, yy + 1.0, -K.L / 2 + K.L * t0), 0.03, 4)); }
  if (kind === 'manly') { const f = W(0, yy, 0); bag.add('car_cream', lathe([[1.3, 0], [1.3, 4.2], [1.15, 4.2]], 14, (th) => 1 + 0.4 * Math.abs(Math.cos(th)), f[0], f[1], f[2])); bag.add('car_black', lathe([[1.32, 0], [1.32, 0.8], [0.001, 0.8]], 14, (th) => 1 + 0.4 * Math.abs(Math.cos(th)), f[0], f[1] + 4.2, f[2])); }
  else { const f = W(0, yy, 0); bag.add('steel_grey', rod(f, [f[0], f[1] + 5, f[2]], 0.1, 6)); bag.add('steel_grey', rod([f[0] - 1.2 * c, f[1] + 4, f[2] + 1.2 * sn], [f[0] + 1.2 * c, f[1] + 4, f[2] - 1.2 * sn], 0.05, 4)); }
  col.circle(x, z, K.B / 2, y - 1, y + yy);
  void parts;
}
registerStyle('modern', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ...STYLES.artdeco.elements, opera_house: operaHouse, arch_bridge: archBridge, round_tower: roundTower, wharf, viaduct, ferry, rocks_terrace: rocksTerrace },
  objects: {},
});
