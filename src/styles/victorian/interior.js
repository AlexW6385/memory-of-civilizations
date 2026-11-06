// The Palace of Westminster inside, about 1870 (docs/settlements/london.md §1.5): the route of the principal floor from
// Westminster Hall — St Stephen's Porch and its great south window; up the steps into St Stephen's Hall, vaulted in
// five bays, its statesmen in marble on their pedestals; the Central Lobby, the stone octagon under its vault of
// mosaic between ribs and gilded bosses, the brass chandelier, kings and queens in the niches round the high windows,
// Poynter's St George over the door to the Lords; the Commons Corridor and Lobby to Barry's House of Commons (green
// benches, the Speaker's chair under its canopy, the Table with the despatch boxes and the mace, the galleries and the
// Ladies' Gallery behind its grille, the canted ceiling of oak panels); the Lords Corridor, the Peers' Lobby with its
// brass gates, the House of Lords (red benches, the woolsack, the gilded throne and canopy, the barons between the
// windows, the frescoes, the flat heraldic ceiling). Over the lobby, the Central Tower and its spire.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { faceFrame, prism, ngon, vprism } from '../dutch/facade.js';
import { windowOn, kingNiche, pointed, hexa } from './hall.js';
import { inner, frame, poly, fb, wall, archTrim, panels, painting, shield, bayVault, ribSeg, shaft, statue, benches, ST, SY, CV, OAK, LD, G } from './rooms.js';

const AU = 'clay_gilt';
const pinn = (bag, m, x, y, z, s, h) => { bag.add(m, box(x - s / 2, y, z - s / 2, x + s / 2, y + h * 0.4, z + s / 2)); bag.add(m, lathe([[s * 0.62, 0], [0.001, h * 0.6]], 4, null, x, y + h * 0.4, z)); bag.add(m, lathe([[0.001, 0], [s * 0.18, s * 0.15], [0.001, s * 0.4]], 6, null, x, y + h, z)); };
/** A floor slab with its walkable top; `m` its surface. */
const slab = (bag, col, m, r, y0, y1, walk = true) => { bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); if (walk) col.floor(r, y1); };

/** The outside of a range: buttresses at `at` (u along the face) ending in pinnacles, a parapet, glazed windows. */
function outside(bag, F, { v0, top, at = [], windows = [], skip = () => false }) {
  for (const u of at) { if (skip(u)) continue; fb(bag, F, SY, u - 0.45, u + 0.45, v0, top - 0.6, 0, 0.7); fb(bag, F, SY, u - 0.5, u + 0.5, v0, v0 + 3, 0, 0.95); const [x, z] = F.at(u, 0.35); pinn(bag, SY, x, top - 0.6, z, 0.6, 3.2); }
  fb(bag, F, SY, 0, F.w, top - 0.2, top + 0.9, -0.3, 0.12); fb(bag, F, SY, -0.05, F.w + 0.05, top + 0.9, top + 1.05, -0.35, 0.18);
  for (const w of windows) if (!skip(w.uc)) windowOn(bag, F, 0, { glass: 'glass_outer', depth: 0.18, ...w });
}
/** A pitched lead roof along z (or x) over rect from the eaves at y0 to the ridge at y1, with gables of stone at the ends. */
function roof(bag, r, y0, y1, along = 'z', gables = [true, true]) {
  const [x0, z0, x1, z1] = r;
  if (along === 'z') {
    const cx = (x0 + x1) / 2;
    for (const [a, b] of [[x0 - 0.2, cx], [x1 + 0.2, cx]]) bag.add(LD, hexa([[a, y0, z0], [b, y1, z0], [b, y1, z1], [a, y0, z1]], [[a, y0 + 0.25, z0], [b, y1 + 0.25, z0], [b, y1 + 0.25, z1], [a, y0 + 0.25, z1]]));
    bag.add('iron', box(cx - 0.06, y1 + 0.2, z0, cx + 0.06, y1 + 0.7, z1));
    for (let z = z0 + 0.6; z < z1; z += 1.2) bag.add('iron', lathe([[0.001, 0], [0.09, 0.12], [0.001, 0.45]], 4, null, cx, y1 + 0.65, z));
    gables.forEach((g, i) => { if (!g) return; const za = i ? z1 - 0.6 : z0, zb = i ? z1 : z0 + 0.6; bag.add(SY, hexa([[x0, y0 - 0.01, za], [x1, y0 - 0.01, za], [x1, y0 - 0.01, zb], [x0, y0 - 0.01, zb]], [[cx - 0.01, y1 + 0.5, za], [cx + 0.01, y1 + 0.5, za], [cx + 0.01, y1 + 0.5, zb], [cx - 0.01, y1 + 0.5, zb]])); pinn(bag, SY, cx, y1 + 0.4, (za + zb) / 2, 0.5, 2.6); });
  } else {
    const cz = (z0 + z1) / 2;
    for (const [a, b] of [[z0 - 0.2, cz], [z1 + 0.2, cz]]) bag.add(LD, hexa([[x0, y0, a], [x0, y1, b], [x1, y1, b], [x1, y0, a]], [[x0, y0 + 0.25, a], [x0, y1 + 0.25, b], [x1, y1 + 0.25, b], [x1, y0 + 0.25, a]]));
    bag.add('iron', box(x0, y1 + 0.2, cz - 0.06, x1, y1 + 0.7, cz + 0.06));
    for (let x = x0 + 0.6; x < x1; x += 1.2) bag.add('iron', lathe([[0.001, 0], [0.09, 0.12], [0.001, 0.45]], 4, null, x, y1 + 0.65, cz));
    gables.forEach((g, i) => { if (!g) return; const xa = i ? x1 - 0.6 : x0, xb = i ? x1 : x0 + 0.6; bag.add(SY, hexa([[xa, y0 - 0.01, z0], [xb, y0 - 0.01, z0], [xb, y0 - 0.01, z1], [xa, y0 - 0.01, z1]], [[xa, y1 + 0.5, cz - 0.01], [xb, y1 + 0.5, cz - 0.01], [xb, y1 + 0.5, cz + 0.01], [xa, y1 + 0.5, cz + 0.01]])); pinn(bag, SY, (xa + xb) / 2, y1 + 0.4, cz, 0.5, 2.6); });
  }
}
/** Two oak door leaves standing shut in a wall's opening (F inner frame, the leaves at depth d). */
function doorsShut(bag, col, F, u0, u1, v0, v1, d) {
  fb(bag, F, 'wood_dark', u0, u1, v0, v1, d - 0.08, d);
  for (let j = 0; j < 4; j++) fb(bag, F, 'iron', u0 + 0.1, u1 - 0.1, v0 + 0.5 + j * (v1 - v0 - 0.8) / 3, v0 + 0.58 + j * (v1 - v0 - 0.8) / 3, d, d + 0.02);
  fb(bag, F, 'wood_dark', (u0 + u1) / 2 - 0.03, (u0 + u1) / 2 + 0.03, v0, v1, d, d + 0.03);
  col.segment(F.at(u0, d - 0.04), F.at(u1, d - 0.04), 0.1, v0, v1);
}

// ── St Stephen's Porch and St Stephen's Hall ─────────────────────────────────────────────────────────────────────
/** st_stephens: { porch: rect, hall: rect (long along x, the porch at its west end), y, L (the porch's floor), P (the principal floor) } */
export function stStephens(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, L = el.L, P = el.P, pr = el.porch, hr = el.hall;
  const [px0, pz0, px1, pz1] = pr, [hx0, hz0, hx1, hz1] = hr, Wp = L + 10, Ws = P + 17, ys = P + 12.5, VH = 4.0;
  // ── the porch: its floor at the landing of Westminster Hall's steps, its walls, the door up into the hall on the east
  slab(bag, col, 'flagstone', [px0, pz0, px1, pz1], y - 0.4, L);
  const dz0 = -48.5 - pz0, dz1 = -43.5 - pz0;                                     // the door (u along the porch's east wall)
  slab(bag, col, 'flagstone', [px1, pz0 + dz0, hx0, pz0 + dz1], y - 0.4, L);
  const Fw = inner(pr, 'w'), Fs = inner([px0 - 1, pz0, hx0, pz1], 's'), Fe = inner(pr, 'e'), Fn = inner(pr, 'n');
  wall(bag, col, SY, Fw, y - 0.5, Wp, 1.0);
  wall(bag, col, SY, Fs, y - 0.5, Wp, 1.2);
  wall(bag, col, SY, Fe, y - 0.5, Wp, hx0 - px1, [{ u0: dz0, u1: dz1, v0: y - 0.5, v1: L + 5.0, rise: 2.5 }]);
  // inside: the arch from Westminster Hall in its orders, panelling, the shafts and the star vault, the great south window
  archTrim(bag, Fn, CV, 22 - px0, 3.2, L, y + 6.6, 3.0, { orders: 3, w: 0.18, d: 0.26 });
  archTrim(bag, Fe, CV, (dz0 + dz1) / 2, 2.5, L, L + 5.0, 2.5, { orders: 2 });
  for (const [F, u0, u1] of [[Fw, 0.5, Fw.w - 0.5], [Fn, 0.5, 22 - px0 - 4.2], [Fn, 22 - px0 + 4.2, Fn.w - 0.5], [Fe, 0.5, dz0 - 0.9], [Fe, dz1 + 0.9, Fe.w - 0.5]]) {
    panels(bag, F, CV, u0, u1, L + 0.3, L + 3.0, { pw: 0.55 });
    if (F === Fw) { panels(bag, F, CV, u0, u1, L + 3.3, L + 5.8, { pw: 0.55 }); for (const u of [Fw.w * 0.3, Fw.w * 0.7]) kingNiche(bag, F, 0, u, L + 5.95 + 0.3, 0, ctx, Math.round(u * 7)); }
  }
  for (const [x, z] of [[px0 + 0.25, pz0 + 0.25], [px1 - 0.25, pz0 + 0.25], [px0 + 0.25, pz1 - 0.25], [px1 - 0.25, pz1 - 0.25]]) shaft(bag, CV, x, z, L, L + 6.2, 0.13, [x < 22 ? 1 : -1, 0]);
  bayVault(bag, pr, L + 6.2, 3.3, { along: 'x', cell: SY, rib: CV, boss: G, N: 12 });
  windowOn(bag, Fs, 0, { uc: hx0 - 22, hw: 4.0, v0: L + 2.4, vs: L + 6.0, rise: 2.4, lights: 6, transoms: [L + 4.2], glass: 'stained_glass', depth: 0.22, label: false });
  // outside: the window, the lead flat and its parapet, pinnacles
  const Fso = faceFrame([px0 - 1, pz0, hx0, pz1 + 1.2], 's');
  windowOn(bag, Fso, 0, { uc: 23 - px0, hw: 4.0, v0: L + 2.4, vs: L + 6.0, rise: 2.4, lights: 6, transoms: [L + 4.2], glass: 'glass_outer', depth: 0.3 });
  bag.add(LD, box(px0 - 1, Wp, pz0, hx0 - 1.2, Wp + 0.25, pz1 + 1.2));
  outside(bag, Fso, { v0: y, top: Wp, at: [0.5, Fso.w - 2.5] });
  outside(bag, faceFrame([px0 - 1, pz0, hx0, pz1 + 1.2], 'w'), { v0: y, top: Wp, at: [0.5, 6] });

  // ── St Stephen's Hall: the steps up from the porch, the floor, the walls, the windows, the vault, the statesmen
  const nb = 5, bw = (hx1 - hx0) / nb, sx = hx0 + 5;
  for (let i = 0; i < 12; i++) bag.add('limestone', box(hx0 + 5 * i / 12, y - 0.4, hz0, sx, L + (P - L) * (i + 1) / 12, hz1));
  col.ramp([hx0, hz0, sx, hz1], L, P, 'e');
  slab(bag, col, 'marble_floor', [sx, hz0, hx1, hz1], y - 0.4, P); col.floor([hx1, -48.1, hx1 + 1.8, -43.9], P);
  bag.add('opus_sectile', box(sx + 0.8, P - 0.05, -47.5, hx1 - 0.6, P + 0.02, -44.5));
  // the brass studs marking where the Speaker's chair and the Table stood in St Stephen's Chapel
  for (const [a, b, c, d] of [[hx1 - 2.6, -46.6, hx1 - 1.6, -45.4], [hx1 - 5.8, -46.4, hx1 - 3.6, -45.6]]) for (let t = 0; t < 1; t += 0.1) for (const [x, z] of [[a + (c - a) * t, b], [a + (c - a) * t, d], [a, b + (d - b) * t], [c, b + (d - b) * t]]) bag.add(G, lathe([[0.03, 0], [0.025, 0.012], [0.001, 0.016]], 6, null, x, P + 0.02, z));
  const N = inner([hx0, hz0, 61.0, hz1], 'n'), S = inner([hx0, hz0, 61.0, hz1], 's'), E = inner([hx0, hz0, hx1, hz1], 'e'), W = inner(hr, 'w');
  wall(bag, col, SY, N, y - 0.5, Ws, 1.5); wall(bag, col, SY, S, y - 0.5, Ws, 1.2);
  bag.add(SY, box(px1, Wp, pz0, hx0, Ws, pz1 + 1.2)); col.rect([px1, pz0, hx0, pz1 + 1.2], Wp, Ws);
  wall(bag, col, SY, E, P, Ws, 0.6, [{ u0: 2.4, u1: 6.6, v0: P, v1: P + 5.0, rise: 2.1 }]);
  archTrim(bag, E, CV, 4.5, 2.1, P, P + 5.0, 2.1, { orders: 2 });
  archTrim(bag, W, CV, -41.5 - (-46), 2.5, L, L + 5.0, 2.5, { orders: 2, d: 0.2 });
  for (const u of [1.15, 7.85]) kingNiche(bag, E, 0, u, P + 2.2, 0, ctx, Math.round(u * 5));
  windowOn(bag, W, 0, { uc: 4.5, hw: 2.6, v0: Wp + 0.9, vs: P + 13.0, rise: 2.0, lights: 4, glass: 'stained_glass', depth: 0.2, label: false });
  const uN = (x) => x - hx0, uS = (x) => 61.0 - x;
  for (const [F, uf, rot, zs] of [[N, uN, Math.PI, hz0 + 0.8], [S, uS, 0, hz1 - 0.8]]) {
    // the dado of panelling, the blind arcade (where the paintings of the 1920s now hang), the string course
    panels(bag, F, CV, Math.min(uf(sx), uf(hx1)) + 0.3, Math.max(uf(sx), uf(hx1)) - 0.3, P + 0.3, P + 2.5, { pw: 0.6 });
    for (let k = 0; k < nb; k++) {
      const xa = hx0 + k * bw, xb = xa + bw, ua = Math.min(uf(xa), uf(xb)), ub = Math.max(uf(xa), uf(xb));
      if (xa >= sx - 0.1) panels(bag, F, CV, ua + 0.45, ub - 0.45, P + 2.9, P + 7.6, { n: 3, d: 0.14 });
      windowOn(bag, F, 0, { uc: (ua + ub) / 2, hw: 1.7, v0: P + 8.6, vs: P + 11.6, rise: 1.5, lights: 3, transoms: [P + 10.1], glass: 'stained_glass', depth: 0.2, label: false });
    }
    fb(bag, F, CV, Math.min(uf(hx0), uf(hx1)), Math.max(uf(hx0), uf(hx1)), P + 8.0, P + 8.25, 0, 0.18);
    // the shafts carrying the transverse ribs
    for (let k = 0; k <= nb; k++) { const x = hx0 + k * bw, [sx2, sz2] = [Math.min(Math.max(x, hx0 + 0.25), hx1 - 0.25), F === N ? hz0 + 0.22 : hz1 - 0.22]; shaft(bag, CV, sx2, sz2, x < sx ? L + (P - L) * Math.max(0, x - hx0) / 5 : P, ys, 0.13, [1, 0]); }
    // the statesmen on their pedestals (from the west on the north: Selden, Hampden, Falkland, Clarendon, Somers,
    // Walpole; on the south Chatham, Mansfield, Burke, Fox, Pitt, Grattan)
    for (let j = 0; j < 6; j++) {
      const x = sx + 2.0 + j * 4.1, z = zs;
      bag.add('marble', box(x - 0.52, P, z - 0.52, x + 0.52, P + 0.22, z + 0.52)); bag.add('marble', box(x - 0.42, P + 0.22, z - 0.42, x + 0.42, P + 1.1, z + 0.42)); bag.add('marble', box(x - 0.5, P + 1.1, z - 0.5, x + 0.5, P + 1.28, z + 0.5));
      col.rect([x - 0.52, z - 0.52, x + 0.52, z + 0.52], P, P + 1.28);
      statue(ctx, x, z, P + 1.28, rot, 31 + j + (F === S ? 7 : 0), { h: 2.05, over: j % 2 ? 'cape' : 'collar', beard: false, hair: j % 3 ? 'short' : 'long' });
    }
  }
  for (let k = 0; k < nb; k++) bayVault(bag, [hx0 + k * bw, hz0, hx0 + (k + 1) * bw, hz1], ys, VH, { along: 'x', cell: SY, rib: CV, boss: G, transverse: [k === 0, true] });
  // outside: buttresses at the bays, the windows, the parapets, the roof and its west gable
  const No = faceFrame([px1, pz0, 61.0, pz1 + 1.2], 'n'), So = faceFrame([px1, pz0, 61.0, pz1 + 1.2], 's');
  const bays = Array.from({ length: nb + 1 }, (_, k) => hx0 + k * bw);
  outside(bag, No, { v0: y, top: Ws, at: bays.map((x) => 61.0 - x), windows: bays.slice(0, -1).map((x) => ({ uc: 61.0 - x - bw / 2, hw: 1.7, v0: P + 8.6, vs: P + 11.6, rise: 1.5, lights: 3 })), skip: (u) => 61.0 - u < 35 || 61.0 - u > hx1 - 0.6 });
  outside(bag, So, { v0: y, top: Ws, at: bays.map((x) => x - px1), windows: bays.slice(0, -1).map((x) => ({ uc: x - px1 + bw / 2, hw: 1.7, v0: P + 8.6, vs: P + 11.6, rise: 1.5, lights: 3 })), skip: (u) => u + px1 > hx1 - 0.6 });
  windowOn(bag, faceFrame([px1, pz0, hx0, pz1 + 1.2], 'w'), 0, { uc: 6, hw: 2.6, v0: Wp + 0.9, vs: P + 13.0, rise: 2.0, lights: 4, glass: 'glass_outer', depth: 0.25 });
  roof(bag, [px1, pz0, 61.0, pz1 + 1.2], Ws + 1.0, Ws + 4.8, 'x', [true, false]);
}

// ── the Central Lobby and the Central Tower ─────────────────────────────────────────────────────────────────────────
/** central_lobby: { c, a (inner apothem), T, y, P, top } */
export function centralLobby(el, ctx) {
  const { bag, col, lights } = ctx, [cx, cz] = el.c, a = el.a ?? 9, T = el.T ?? 1.5, y = el.y ?? 0, P = el.P, top = el.top ?? y + 91;
  const t8 = Math.tan(Math.PI / 8), c8 = Math.cos(Math.PI / 8), V0 = P + 15, Vc = P + 23, Wt = P + 30, Wd = P + 52;
  const corner = (k, ap = a) => { const th = k * Math.PI / 4 - Math.PI / 8, R = ap / c8; return [cx + R * Math.cos(th), cz + R * Math.sin(th)]; };
  const oct = (ap) => Array.from({ length: 8 }, (_, k) => corner(k, ap));
  const faceF = (k, ap = a, out = false) => { const l = corner(k, ap), r = corner(k + 1, ap), w = 2 * ap * t8, t = [(r[0] - l[0]) / w, (r[1] - l[1]) / w], n = [Math.cos(k * Math.PI / 4), Math.sin(k * Math.PI / 4)]; return frame(l, t, out ? n : [-n[0], -n[1]], w); };
  const w = 2 * a * t8, uc = w / 2, door = { u0: uc - 2.1, u1: uc + 2.1, v0: y - 0.45, v1: P + 5.0, rise: 2.1 };
  // the podium and the floor of Minton's tiles: a border, the band of the psalm's words, a star at the centre
  bag.add(SY, vprism(oct(a + T), y - 0.45, P - 0.2)); bag.add('opus_sectile', vprism(oct(a + T), P - 0.2, P));
  col.floor([cx - a - T, cz - a - T, cx + a + T, cz + a + T], P);
  for (let k = 0; k < 8; k++) {
    const ring = (r0, r1, m, y0, y1) => bag.add(m, vprism([corner(k, r0), corner(k + 1, r0), corner(k + 1, r1), corner(k, r1)], y0, y1));
    ring(7.3, 8.0, 'tile_dark', P - 0.03, P + 0.02); ring(6.6, 7.3, 'tile_cream', P - 0.03, P + 0.02);
    // the letters of the band (Nisi Dominus aedificaverit domum…): strokes in dark tile
    const l = corner(k, 6.95), r = corner(k + 1, 6.95), n = [Math.cos(k * Math.PI / 4) * 0.18, Math.sin(k * Math.PI / 4) * 0.18];
    for (let j = 0; j < 13; j++) { const t0 = 0.08 + j * 0.065, p = [l[0] + (r[0] - l[0]) * t0, l[1] + (r[1] - l[1]) * t0], tx = (r[0] - l[0]) * 0.012, tz = (r[1] - l[1]) * 0.012;
      for (const o of (j * 7 + k) % 3 ? [0, 1.8] : [0, 1.8, 3.6]) bag.add('tile_dark', vprism([[p[0] + tx * o - n[0], p[1] + tz * o - n[1]], [p[0] + tx * (o + 0.7) - n[0], p[1] + tz * (o + 0.7) - n[1]], [p[0] + tx * (o + 0.7) + n[0], p[1] + tz * (o + 0.7) + n[1]], [p[0] + tx * o + n[0], p[1] + tz * o + n[1]]], P + 0.0, P + 0.04)); }
  }
  for (let j = 0; j < 16; j++) { const a0 = j * Math.PI / 8, a1 = a0 + Math.PI / 16, a2 = a0 + Math.PI / 8, R = j % 2 ? 2.4 : 3.2;
    bag.add(j % 2 ? 'glaze_red' : 'tile_dark', vprism([[cx, cz], [cx + Math.cos(a0) * 0.9, cz + Math.sin(a0) * 0.9], [cx + Math.cos(a1) * R, cz + Math.sin(a1) * R], [cx + Math.cos(a2) * 0.9, cz + Math.sin(a2) * 0.9]], P - 0.03, P + 0.02)); }
  bag.add('tile_cream', lathe([[0.001, 0], [0.85, 0], [0.85, 0.05], [0.001, 0.05]], 16, null, cx, P, cz));
  // the walls of the octagon, up through the vault into the tower; the wedges that close their outer corners
  for (let k = 0; k < 8; k++) {
    const F = faceF(k), cardinal = k % 2 === 0;
    wall(bag, col, SY, F, y - 0.45, Wt, T, cardinal ? [door] : []);
    const Fk1 = faceF(k + 1);
    bag.add(SY, vprism([corner(k + 1), F.at(w, -T), corner(k + 1, a + T), Fk1.at(0, -T)], y - 0.45, Wt));
    if (k === 0) doorsShut(bag, col, F, door.u0, door.u1, P, P + 5.0, -T / 2);
    if (k === 0) for (let i = 0; i < 10; i++) { const p0 = -2.1 + 0.42 * i, p1 = p0 + 0.42; poly(bag, F, 'wood_dark', [[uc + p0, P + 5.0], [uc + p1, P + 5.0], [uc + p1, P + 5.0 + pointed(p1, 2.1, 2.1)], [uc + p0, P + 5.0 + pointed(p0, 2.1, 2.1)]], -T / 2 - 0.08, -T / 2); }
    // the face: its great arch on the corner shafts, under it the door with its tympanum, or the panelling, the kings
    // and queens in their niches and the high window
    archTrim(bag, F, CV, uc, 3.3, P, P + 8.4, 6.2, { orders: 2, w: 0.17, d: 0.3, shaft: null, label: false });
    fb(bag, F, CV, 0, w, V0 - 0.35, V0, 0, 0.24); fb(bag, F, CV, 0, w, P + 8.25, P + 8.45, 0, 0.16);
    if (cardinal) {
      archTrim(bag, F, CV, uc, 2.1, P, P + 5.0, 2.1, { orders: 3, w: 0.17 });
      for (const [u0, u1] of [[0.5, uc - 2.8], [uc + 2.8, w - 0.5]]) { panels(bag, F, CV, u0, u1, P + 0.3, P + 4.3, { n: 1 }); panels(bag, F, CV, u0, u1, P + 4.5, P + 7.9, { n: 1 }); }
      // the tympanum: a pointed panel in a moulded frame, St George's mosaic in the one over the door to the Lords
      const r = 3.0, Hh = 5.7, vb = P + 8.45, mosaic = k === 2;
      for (let i = 0; i < 12; i++) { const p0 = -r + 2 * r * i / 12, p1 = p0 + 2 * r / 12; poly(bag, F, mosaic ? 'mosaic_gold' : ST, [[uc + p0, vb], [uc + p1, vb], [uc + p1, vb + pointed(p1, r, Hh)], [uc + p0, vb + pointed(p0, r, Hh)]], 0, 0.04);
        poly(bag, F, CV, [[uc + p0, vb + pointed(p0, r, Hh)], [uc + p1, vb + pointed(p1, r, Hh)], [uc + p1 * 1.07, vb + pointed(p1 * 1.07, r * 1.07, Hh + 0.2)], [uc + p0 * 1.07, vb + pointed(p0 * 1.07, r * 1.07, Hh + 0.2)]], 0, 0.14); }
      fb(bag, F, CV, uc - r - 0.2, uc + r + 0.2, vb - 0.25, vb, 0, 0.2);
      if (mosaic) stGeorge(bag, F, uc, vb);
      else panels(bag, F, CV, uc - r + 0.6, uc + r - 0.6, vb + 0.3, vb + 2.6, { n: 6, d: 0.08 });
    } else {
      panels(bag, F, CV, 0.5, w - 0.5, P + 0.3, P + 2.3, { pw: 0.55 }); panels(bag, F, CV, 0.5, w - 0.5, P + 2.5, P + 4.5, { pw: 0.55 });
      for (const du of [-2.55, -0.85, 0.85, 2.55]) kingNiche(bag, F, 0, uc + du, P + 4.8, 0, ctx, k * 4 + Math.round(du * 2 + 6));
      windowOn(bag, F, 0, { uc, hw: 1.9, v0: P + 9.2, vs: P + 11.6, rise: 2.0, lights: 3, transoms: [P + 10.4], glass: 'stained_glass', depth: 0.2, label: false });
      windowOn(bag, faceF(k, a + T, true), 0, { uc: (2 * (a + T) * t8) / 2, hw: 1.9, v0: P + 9.2, vs: P + 11.6, rise: 2.0, lights: 3, transoms: [P + 10.4], glass: 'glass_outer', depth: 0.25 });
    }
    // the clustered shaft in the corner, from the floor to the vault's springing
    const th = (k + 1) * Math.PI / 4 - Math.PI / 8, [sx, sz] = corner(k + 1, a - 0.25 * c8);
    shaft(bag, CV, sx, sz, P, V0, 0.16, [Math.cos(th), Math.sin(th)]);
    // outside: string courses, the parapet of the lower stage
    const Fo = faceF(k, a + T, true), wo = 2 * (a + T) * t8;
    fb(bag, Fo, SY, 0, wo, P + 15, P + 15.3, 0, 0.2); fb(bag, Fo, SY, 0, wo, Wt - 0.2, Wt + 1.0, -0.3, 0.12); fb(bag, Fo, SY, -0.05, wo + 0.05, Wt + 1.0, Wt + 1.15, -0.35, 0.18);
    panels(bag, Fo, SY, 0.9, wo - 0.9, P + 16.5, Wt - 1.2, { pw: 0.8, d: 0.12 });
    const [px, pz] = corner(k + 1, a + T + 0.35); bag.add(SY, box(px - 0.5, y, pz - 0.5, px + 0.5, Wt + 0.4, pz + 0.5)); pinn(bag, SY, px, Wt + 0.4, pz, 0.7, 4.2);
  }
  // ── the vault: eight cells of glass mosaic rising from the springing to the central boss, ribs of stone along the
  // angles and the middles of the cells, tiercerons, two rings of liernes, gilded bosses where they cross
  const S8 = 8, T8 = 12, tmax = 0.965, hv = (t) => V0 + (Vc - V0) * Math.sin(t * Math.PI / 2);
  const Pt = (k, s, t) => { const l = corner(k), r = corner(k + 1), q = [l[0] + (r[0] - l[0]) * s, l[1] + (r[1] - l[1]) * s]; return [cx + (1 - t) * (q[0] - cx), hv(t), cz + (1 - t) * (q[1] - cz)]; };
  const tris = [], up = [];
  for (let k = 0; k < 8; k++) for (let i = 0; i < S8; i++) for (let j = 0; j < T8; j++) {
    const s0 = i / S8, s1 = (i + 1) / S8, t0 = j / T8 * tmax, t1 = (j + 1) / T8 * tmax, A = Pt(k, s0, t0), B = Pt(k, s1, t0), C = Pt(k, s1, t1), D = Pt(k, s0, t1);
    for (const [p, q, r] of [[A, B, C], [A, C, D]]) { tris.push(...p, ...r, ...q); up.push(...p.map((v, m) => v + (m === 1 ? 0.3 : 0)), ...q.map((v, m) => v + (m === 1 ? 0.3 : 0)), ...r.map((v, m) => v + (m === 1 ? 0.3 : 0))); }
  }
  bag.add('mosaic_gold', shell(tris, true)); bag.add('mosaic_gold', shell(up, false));
  const ribAlong = (k, s0, t0, s1, t1, n, wR) => { for (let i = 0; i < n; i++) ribSeg(bag, ST, Pt(k, s0 + (s1 - s0) * i / n, t0 + (t1 - t0) * i / n), Pt(k, s0 + (s1 - s0) * (i + 1) / n, t0 + (t1 - t0) * (i + 1) / n), wR, 0.26); };
  for (let k = 0; k < 8; k++) {
    ribAlong(k, 0, 0, 0, tmax, 14, 0.42); ribAlong(k, 0.5, 0, 0.5, tmax, 14, 0.3);
    ribAlong(k, 0, 0, 0.5, 0.42, 8, 0.26); ribAlong(k, 1, 0, 0.5, 0.42, 8, 0.26);
    ribAlong(k, 0, 0.42, 1, 0.42, 10, 0.24); ribAlong(k, 0, 0.74, 1, 0.74, 8, 0.24);
    for (const [s, t, r] of [[0.5, 0.42, 0.34], [0, 0.42, 0.38], [0, 0.74, 0.32], [0.5, 0.74, 0.3]]) { const [x, yy, z] = Pt(k, s, t); bag.add(G, lathe([[0.001, 0], [r, -0.04], [r * 1.1, -0.2], [r * 0.75, -0.34], [0.001, -0.4]], 10, null, x, yy - 0.22, z)); }
  }
  bag.add(G, lathe([[0.001, 0.32], [1.25, 0.3], [1.3, 0.05], [1.1, -0.25], [0.7, -0.4], [0.35, -0.45], [0.001, -0.46]], 16, null, cx, Vc, cz));
  // ── the chandelier: a corona of gilt brass hung from the boss, two rings of gas lights under a crown
  chandelier(bag, lights, cx, cz, P, Vc);
  // ── the Central Tower: the lead flat over the lower stage, the lantern stage with its tall windows, the spire
  bag.add(LD, vprism(oct(a + T - 0.3), Wt, Wt + 0.15));
  bag.add(SY, vprism(oct(7.5), Wt + 0.15, Wd));
  for (let k = 0; k < 8; k++) {
    const F = faceF(k, 7.5, true), wl = 2 * 7.5 * t8;
    windowOn(bag, F, 0, { uc: wl / 2, hw: 1.5, v0: Wt + 4, vs: Wd - 7, rise: 2.6, lights: 2, transoms: [Wt + 10], glass: 'opening', depth: 0.25 });
    fb(bag, F, SY, 0, wl, Wt + 2.6, Wt + 2.9, 0, 0.22); fb(bag, F, SY, 0, wl, Wd - 1.2, Wd, -0.2, 0.25);
    panels(bag, F, SY, 0.5, wl - 0.5, Wd - 3.6, Wd - 1.4, { pw: 0.5, d: 0.1 });
    const [px, pz] = corner(k + 1, 7.75); bag.add(SY, box(px - 0.45, Wt + 0.15, pz - 0.45, px + 0.45, Wd + 0.6, pz + 0.45)); pinn(bag, SY, px, Wd + 0.6, pz, 0.65, 4.8);
  }
  const sp = lathe([[7.5 / c8 + 0.05, 0], [0.001, top - Wd]], 8, null, 0, 0, 0); sp.rotateY(-Math.PI / 8); sp.translate(cx, Wd, cz); bag.add(SY, sp);
  for (let j = 1; j < 6; j++) { const h = (top - Wd) * j / 6.5, r = (7.5 / c8) * (1 - h / (top - Wd)) + 0.12, g = lathe([[r, 0], [r, 0.35], [r - 0.12, 0.45]], 8, null, 0, 0, 0); g.rotateY(-Math.PI / 8); g.translate(cx, Wd + h, cz); bag.add(SY, g); }
  for (let k = 0; k < 8; k++) for (let j = 0; j < 3; j++) {               // lucarnes up the spire, on alternate faces
    if ((k + j) % 2) continue;
    const h = (top - Wd) * (0.14 + j * 0.24), ap = 7.5 * (1 - h / (top - Wd)), F = faceF(k, ap, true), wl = 2 * ap * t8;
    fb(bag, F, 'opening', wl / 2 - 0.35, wl / 2 + 0.35, Wd + h, Wd + h + 1.6, -0.4, 0.06); poly(bag, F, SY, [[wl / 2 - 0.6, Wd + h + 1.6], [wl / 2 + 0.6, Wd + h + 1.6], [wl / 2, Wd + h + 2.6]], -0.6, 0.25);
    fb(bag, F, SY, wl / 2 - 0.6, wl / 2 - 0.35, Wd + h, Wd + h + 1.6, -0.6, 0.25); fb(bag, F, SY, wl / 2 + 0.35, wl / 2 + 0.6, Wd + h, Wd + h + 1.6, -0.6, 0.25);
  }
  bag.add(G, lathe([[0.35, 0], [0.22, 0.8], [0.4, 1.2], [0.12, 1.6], [0.08, 3.2], [0.001, 3.6]], 8, null, cx, top - 0.2, cz));
}
function shell(t, down) {
  for (let i = 0; i < t.length; i += 9) {
    const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2];
    if ((uz * vx - ux * vz > 0) === down) for (let k = 0; k < 3; k++) { const s = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = s; }
  }
  return fromTriangles(t);
}

/** Poynter's St George (1870) in glass mosaic on the gold ground of the tympanum: the saint in armour with his cross on a white surcoat, cloak, shield and sword, the dragon dead at his feet. */
function stGeorge(bag, F, u, v) {
  const M = (m, pts, d = 0.05) => poly(bag, F, m, pts, 0.04, d);
  M('mosaic_green', [[u - 2.2, v + 0.15], [u + 2.2, v + 0.15], [u + 2.0, v + 0.6], [u - 2.0, v + 0.6]]);      // the ground
  for (let i = 0; i < 7; i++) { const x = u - 1.9 + i * 0.6, r = 0.36 - Math.abs(i - 3) * 0.03; M('mosaic_green', ngon(x, v + 0.75 + Math.sin(i * 1.3) * 0.12, r, 8), 0.06); }   // the dragon's coils
  M('mosaic_green', [[u + 1.9, v + 0.8], [u + 2.4, v + 1.3], [u + 2.25, v + 1.4], [u + 1.7, v + 1.05]], 0.06);
  M('cloth_red', [[u - 0.75, v + 0.9], [u + 0.75, v + 0.9], [u + 0.6, v + 3.4], [u - 0.6, v + 3.4]], 0.055);   // the cloak behind
  M('mosaic_silver', [[u - 0.32, v + 0.7], [u - 0.08, v + 0.7], [u - 0.1, v + 2.0], [u - 0.36, v + 2.0]], 0.07);  // the legs in armour
  M('mosaic_silver', [[u + 0.08, v + 0.7], [u + 0.32, v + 0.7], [u + 0.36, v + 2.0], [u + 0.1, v + 2.0]], 0.07);
  M('cloth_white', [[u - 0.5, v + 1.9], [u + 0.5, v + 1.9], [u + 0.42, v + 3.25], [u - 0.42, v + 3.25]], 0.075);   // the surcoat and its red cross
  M('cloth_red', [[u - 0.07, v + 2.0], [u + 0.07, v + 2.0], [u + 0.07, v + 3.15], [u - 0.07, v + 3.15]], 0.085);
  M('cloth_red', [[u - 0.4, v + 2.75], [u + 0.4, v + 2.75], [u + 0.38, v + 2.9], [u - 0.38, v + 2.9]], 0.085);
  M('mosaic_silver', [[u - 0.6, v + 3.25], [u + 0.6, v + 3.25], [u + 0.45, v + 3.5], [u - 0.45, v + 3.5]], 0.075);   // the shoulders
  M('tile_cream', ngon(u, v + 3.82, 0.24, 12), 0.08);                                                                 // the head and the halo
  for (let i = 0; i < 16; i++) { const a0 = i * Math.PI / 8, a1 = a0 + Math.PI / 8; M('glaze_yellow', [[u + Math.cos(a0) * 0.42, v + 3.85 + Math.sin(a0) * 0.42], [u + Math.cos(a1) * 0.42, v + 3.85 + Math.sin(a1) * 0.42], [u + Math.cos(a1) * 0.5, v + 3.85 + Math.sin(a1) * 0.5], [u + Math.cos(a0) * 0.5, v + 3.85 + Math.sin(a0) * 0.5]], 0.065); }
  M('mosaic_silver', [[u + 0.55, v + 1.0], [u + 0.62, v + 1.0], [u + 0.68, v + 3.0], [u + 0.61, v + 3.0]], 0.09);       // the sword, point down on the dragon
  M('glaze_yellow', [[u + 0.4, v + 3.0], [u + 0.9, v + 3.0], [u + 0.9, v + 3.08], [u + 0.4, v + 3.08]], 0.095);
  M('cloth_white', [[u - 1.25, v + 1.5], [u - 0.55, v + 1.5], [u - 0.55, v + 2.6], [u - 0.9, v + 2.9], [u - 1.25, v + 2.6]], 0.09);   // the shield
  M('cloth_red', [[u - 0.95, v + 1.6], [u - 0.85, v + 1.6], [u - 0.85, v + 2.7], [u - 0.95, v + 2.7]], 0.1); M('cloth_red', [[u - 1.2, v + 2.2], [u - 0.6, v + 2.2], [u - 0.6, v + 2.3], [u - 1.2, v + 2.3]], 0.1);
  // the scroll of his name over him, and stars on the gold
  M('tile_cream', [[u - 1.2, v + 4.5], [u + 1.2, v + 4.5], [u + 1.2, v + 4.75], [u - 1.2, v + 4.75]], 0.06);
  for (const [du, dv] of [[-1.8, 3.2], [1.8, 3.2], [-1.4, 4.2], [1.4, 4.2], [-2.2, 2.0], [2.2, 2.0]]) M('cloth_red', ngon(u + du, v + dv, 0.12, 6), 0.06);
}

/** The Central Lobby's chandelier of gilt brass: the rod and its knops, the crown, the arms, two rings of gas lights. */
function chandelier(bag, lights, x, z, P, Vc) {
  bag.add(G, lathe([[0.06, 0], [0.06, Vc - P - 13.6]], 8, null, x, P + 13.6, z));
  for (const h of [15.5, 18, 20.5]) bag.add(G, lathe([[0.06, 0], [0.16, 0.12], [0.16, 0.3], [0.06, 0.42]], 10, null, x, P + h, z));
  bag.add(G, lathe([[0.001, 0], [0.22, 0.05], [0.3, 0.6], [0.16, 1.2], [0.26, 1.6], [0.12, 2.2], [0.2, 2.9], [0.12, 3.6], [0.25, 4.2], [0.25, 4.6], [0.1, 4.8]], 12, null, x, P + 8.8, z));
  for (const [R, h, n] of [[2.6, 10.2, 24], [1.7, 11.7, 16]]) {
    bag.add(G, lathe([[R - 0.06, 0], [R + 0.06, 0], [R + 0.06, 0.16], [R - 0.06, 0.16], [R - 0.06, 0]], 32, null, x, P + h, z));
    for (let i = 0; i < n; i++) { const t = i * 2 * Math.PI / n, ex = x + Math.cos(t) * R, ez = z + Math.sin(t) * R;
      bag.add(G, lathe([[0.04, 0], [0.04, 0.25], [0.07, 0.3]], 6, null, ex, P + h + 0.16, ez));
      bag.add('lamp_glass', lathe([[0.04, 0], [0.09, 0.08], [0.1, 0.2], [0.05, 0.34], [0.001, 0.36]], 8, null, ex, P + h + 0.46, ez));
      if (i % 2 === 0) bag.add(G, lathe([[0.03, 0], [0.001, 0.45]], 4, null, ex, P + h + 0.16, ez)); }
    for (let i = 0; i < 8; i++) { const t = i * Math.PI / 4 + 0.2; bag.add(G, rod([x + Math.cos(t) * 0.2, P + h - 0.9, z + Math.sin(t) * 0.2], [x + Math.cos(t) * R, P + h + 0.05, z + Math.sin(t) * R], 0.035, 6)); }
  }
  // the crown of cresting over the upper ring, the chains to it
  for (let i = 0; i < 16; i++) { const t = i * Math.PI / 8; bag.add(G, lathe([[0.04, 0], [0.04, 0.4], [0.12, 0.5], [0.001, 0.75]], 4, null, x + Math.cos(t) * 1.0, P + 13.0, z + Math.sin(t) * 1.0)); }
  bag.add(G, lathe([[0.95, 0], [1.05, 0], [1.05, 0.12], [0.95, 0.12], [0.95, 0]], 24, null, x, P + 12.9, z));
  for (let i = 0; i < 4; i++) { const t = i * Math.PI / 2; bag.add(G, rod([x + Math.cos(t) * 1.0, P + 13.0, z + Math.sin(t) * 1.0], [x, P + 14.2, z], 0.025, 4)); }
  lights.push({ at: [x, P + 10.6, z], color: '#ffc27a', intensity: 30, distance: 22 });
}

// ── the Commons ─────────────────────────────────────────────────────────────────────────────────────────────────
/** commons: { x (the axis), z0 (the Central Lobby's north face), y, P } — the corridor, the lobby, the chamber, northward. */
export function commons(el, ctx) {
  const { bag, col } = ctx, ax = el.x, z0 = el.z0, y = el.y ?? 0, P = el.P;
  // the corridor and its paintings by E. M. Ward
  const cr = [ax - 2.25, z0 - 12.5, ax + 2.25, z0];
  corridor(bag, col, cr, y, P, 'n');
  // the Commons Lobby, square, vaulted, with doors on its four sides
  const lr = [ax - 6.1, cr[1] - 1 - 11.2, ax + 6.1, cr[1] - 1];
  const zc1 = lr[1] - 1, ch = [ax - 6.85, zc1 - 22.8, ax + 6.85, zc1];
  lobby(bag, col, lr, y, P, P + 12.5, { s: { u: lr[2] - ax, w: 4.5, v1: P + 5.0, rise: 1.8 }, n: { u: ax - lr[0], w: 2.6, v1: P + 3.0, rise: 1.0 } }, 'commons');
  // ── the chamber
  const [x0, cz0, x1, cz1] = ch, Wc = P + 12.8, Fw = inner(ch, 'w'), Fe = inner(ch, 'e'), Fn = inner([x0 - 1, cz0, x1 + 1, cz1], 'n'), Fs = inner(ch, 's');
  slab(bag, col, OAK, ch, y - 0.4, P);
  wall(bag, col, SY, Fw, y - 0.5, Wc, 1.0); wall(bag, col, SY, Fe, y - 0.5, Wc, 1.0); wall(bag, col, SY, Fn, y - 0.5, Wc, 1.0);
  bag.add(SY, box(x0 - 1, P + 12.5, zc1, x1 + 1, Wc, zc1 + 1));
  for (const s of [-1, 1]) bag.add(SY, box(Math.min(ax + s * 7.1, ax + s * 7.85), y - 0.5, zc1, Math.max(ax + s * 7.1, ax + s * 7.85), P + 12.5, zc1 + 1));
  bag.add('reed_mat', box(ax - 2.5, P - 0.02, cz0 + 4.4, ax + 2.5, P + 0.02, cz1 - 1.2));
  // the benches of green leather on either side, four rows, the gangway across them
  for (const s of [-1, 1]) benches(bag, col, { xf: ax + s * 2.6, s, z0: cz0 + 4.2, z1: cz1 - 2.2, rows: 4, y: P, cloth: 'leather_bench', breaks: [[cz0 + 11.1, cz0 + 12.0]] });
  // the Speaker's chair on its dais under the canopy, at the north end
  { const zb = cz0 + 0.6, X = ax;
    bag.add(OAK, box(X - 1.4, P, cz0 + 0.1, X + 1.4, P + 0.18, cz0 + 2.4)); bag.add(OAK, box(X - 1.1, P + 0.18, cz0 + 0.1, X + 1.1, P + 0.36, cz0 + 2.0)); col.rect([X - 1.4, cz0 + 0.1, X + 1.4, cz0 + 2.4], P, P + 0.36);
    bag.add(OAK, box(X - 0.75, P + 0.36, zb, X + 0.75, P + 3.6, zb + 0.4));
    bag.add('leather_bench', box(X - 0.5, P + 0.92, zb + 0.4, X + 0.5, P + 2.0, zb + 0.47));
    bag.add(OAK, box(X - 0.55, P + 0.36, zb + 0.4, X + 0.55, P + 0.82, zb + 1.2)); bag.add('leather_bench', box(X - 0.5, P + 0.82, zb + 0.42, X + 0.5, P + 0.92, zb + 1.15));
    for (const s of [-1, 1]) { bag.add(OAK, box(X + s * 0.55 - 0.08, P + 0.36, zb + 0.4, X + s * 0.55 + 0.08, P + 1.45, zb + 1.25)); bag.add(OAK, box(X + s * 0.8 - 0.05, P + 0.36, zb, X + s * 0.8 + 0.05, P + 3.6, zb + 1.3)); }
    const Fc = faceFrame([X - 0.75, zb, X + 0.75, zb + 0.4], 's');
    panels(bag, Fc, OAK, 0.15, 1.35, P + 2.1, P + 3.4, { n: 4, d: 0.05 });
    bag.add(OAK, box(X - 0.95, P + 3.6, zb - 0.1, X + 0.95, P + 3.9, zb + 1.4));
    for (let u = X - 0.9; u < X + 0.95; u += 0.15) bag.add(OAK, lathe([[0.04, 0], [0.001, 0.22]], 4, null, u, P + 3.9, zb + 1.35));
    for (const s of [-1, 1]) pinn(bag, OAK, X + s * 0.9, P + 3.9, zb + 1.3, 0.14, 0.55);
    shield(bag, faceFrame([X - 0.95, zb - 0.1, X + 0.95, zb + 1.4], 's'), 0.95, P + 3.75, 0.11, 0, 0, 'cloth_red');
    col.rect([X - 0.9, zb, X + 0.9, zb + 1.3], P, P + 3.6); }
  // the Table of the House: the despatch boxes, the mace on its rests, papers and books; the clerks' chairs
  { const t0 = cz0 + 4.6, t1 = t0 + 4.0;
    bag.add(OAK, box(ax - 0.65, P, t0 + 0.1, ax + 0.65, P + 0.78, t1 - 0.1)); bag.add(OAK, box(ax - 0.75, P + 0.78, t0, ax + 0.75, P + 0.86, t1)); col.rect([ax - 0.75, t0, ax + 0.75, t1], P, P + 0.86);
    for (const s of [-1, 1]) { const bx = ax + s * 0.42; bag.add('wood_dark', box(bx - 0.2, P + 0.86, t1 - 0.75, bx + 0.2, P + 1.08, t1 - 0.3)); for (const e of [t1 - 0.73, t1 - 0.34]) bag.add(G, box(bx - 0.21, P + 0.866, e - 0.025, bx + 0.21, P + 1.09, e + 0.025)); bag.add(G, box(bx - 0.06, P + 1.08, t1 - 0.56, bx + 0.06, P + 1.1, t1 - 0.5)); }
    for (const e of [t0 + 1.2, t0 + 2.4]) bag.add(G, box(ax - 0.06, P + 0.86, e - 0.04, ax + 0.06, P + 0.96, e + 0.04));
    bag.add(G, rod([ax, P + 1.0, t0 + 0.8], [ax, P + 1.0, t0 + 2.3], 0.035, 8)); bag.add(G, lathe([[0.001, 0], [0.09, 0.05], [0.11, 0.2], [0.07, 0.28], [0.1, 0.36], [0.001, 0.44]], 8, null, 0, 0, 0).rotateX(Math.PI / 2).translate(ax, P + 1.0, t0 + 2.3));
    for (const [dx, dz, w2, h2] of [[-0.35, 0.6, 0.18, 0.04], [0.3, 0.9, 0.16, 0.06], [-0.3, 3.2, 0.2, 0.03]]) bag.add(dz === 0.9 ? 'hide_brown' : 'paint_white', box(ax + dx - w2, P + 0.86, t0 + dz - 0.13, ax + dx + w2, P + 0.86 + h2, t0 + dz + 0.13));
    for (const dx of [-0.5, 0, 0.5]) chair(bag, col, ax + dx, t0 - 0.45, P, 'leather_bench', 1); }
  // the galleries: the members' along the sides on brackets, the strangers' over the bar at the south, the reporters'
  // over the Speaker's chair and above it the Ladies' Gallery behind its brass grille
  const gy = P + 4.4;
  for (const s of [-1, 1]) { const xw = s < 0 ? x0 : x1, xf = xw - s * 2.3, za = cz0 + 4.5, zb = cz1 - 4.6;
    bag.add(OAK, box(Math.min(xw, xf), gy, za, Math.max(xw, xf), gy + 0.2, zb)); col.floor([Math.min(xw, xf), za, Math.max(xw, xf), zb], gy + 0.2);
    galleryFront(bag, s < 0 ? faceFrame([xf - 0.1, za, xf, zb], 'e') : faceFrame([xf, za, xf + 0.1, zb], 'w'), gy + 0.2);
    for (let z = za + 1.0; z < zb; z += 2.4) bag.add(OAK, rod([xw - s * 0.05, gy - 1.4, z], [xf + s * 0.3, gy + 0.02, z], 0.09, 6));
    benches(bag, col, { xf: xf + s * 0.15, s, z0: za + 0.1, z1: zb - 0.1, rows: 2, dep: 0.95, rise: 0.36, y: gy + 0.2, cloth: 'leather_bench' }); }
  { const zf = cz1 - 4.6;
    bag.add(OAK, box(x0, gy, zf, x1, gy + 0.2, cz1)); col.floor([x0, zf, x1, cz1], gy + 0.2);
    galleryFront(bag, faceFrame([x0, zf - 0.1, x1, zf], 'n'), gy + 0.2);
    for (let x = x0 + 1.2; x < x1; x += 2.3) bag.add(OAK, rod([x, gy - 1.4, cz1 - 0.05], [x, gy + 0.02, cz1 - 1.6], 0.09, 6));
    benches(bag, col, { xf: zf + 0.15, s: 1, z0: x0 + 0.1, z1: x1 - 0.1, rows: 4, dep: 0.95, rise: 0.4, y: gy + 0.2, cloth: 'leather_bench', along: 'x', breaks: [[ax - 0.5, ax + 0.5]] }); }
  { const ry = P + 4.6, zf = cz0 + 1.8;
    bag.add(OAK, box(x0, ry, cz0, x1, ry + 0.2, zf)); col.floor([x0, cz0, x1, zf], ry + 0.2);
    galleryFront(bag, faceFrame([x0, zf, x1, zf + 0.1], 's'), ry + 0.2);
    bag.add(OAK, box(x0 + 0.3, ry + 0.2, zf - 0.7, x1 - 0.3, ry + 1.0, zf - 0.1)); bag.add('hide_brown', hexa([[x0 + 0.3, ry + 1.0, zf - 0.7], [x1 - 0.3, ry + 1.0, zf - 0.7], [x1 - 0.3, ry + 1.0, zf - 0.1], [x0 + 0.3, ry + 1.0, zf - 0.1]], [[x0 + 0.3, ry + 1.12, zf - 0.7], [x1 - 0.3, ry + 1.12, zf - 0.7], [x1 - 0.3, ry + 1.06, zf - 0.1], [x0 + 0.3, ry + 1.06, zf - 0.1]]));
    const ly = P + 7.5, zl = cz0 + 1.3;
    bag.add(OAK, box(x0, ly, cz0, x1, ly + 0.2, zl)); bag.add(OAK, box(x0, ly + 0.2, zl - 0.1, x1, ly + 0.9, zl));
    for (let x = x0 + 1.5; x <= x1 - 1.5 + 1e-6; x += 0.13) bag.add(G, box(x - 0.012, ly + 0.9, zl - 0.06, x + 0.012, ly + 2.5, zl - 0.03));
    for (let v = ly + 0.9; v <= ly + 2.5 + 1e-6; v += 0.32) bag.add(G, box(x0 + 1.45, v - 0.02, zl - 0.07, x1 - 1.45, v + 0.02, zl - 0.02));
    for (let x = x0 + 1.7; x < x1 - 1.5; x += 0.52) bag.add(G, lathe([[0.03, 0], [0.09, 0.08], [0.001, 0.3]], 4, null, x, ly + 2.5, zl - 0.045));
    bag.add(OAK, box(x0, ly + 2.5, zl - 0.12, x1, ly + 2.7, zl)); for (const [a, b] of [[x0, x0 + 1.45], [x1 - 1.45, x1]]) bag.add(OAK, box(a, ly + 0.9, zl - 0.1, b, ly + 2.5, zl)); }
  // the walls: oak panelling, the stained glass of the boroughs' arms in the windows over the galleries; the canted ceiling
  const zs = [0, 1, 2, 3].map((i) => cz0 + 4.0 + i * 4.9 + 2.45);
  for (const [F, uf] of [[Fw, (z) => cz1 - z], [Fe, (z) => z - cz0]]) {
    panels(bag, F, OAK, 0.3, F.w - 0.3, P + 0.2, P + 4.3, { pw: 0.5, d: 0.06 }); panels(bag, F, OAK, 0.3, F.w - 0.3, P + 4.7, P + 6.3, { pw: 0.5, d: 0.06 });
    for (const z of zs) windowOn(bag, F, 0, { uc: uf(z), hw: 1.4, v0: P + 6.7, vs: P + 10.0, rise: 1.4, lights: 3, transoms: [P + 8.4], glass: 'stained_glass', depth: 0.18, label: false });
  }
  panels(bag, Fn, OAK, 1.3, Fn.w - 1.3, P + 4.9, P + 7.3, { pw: 0.5, d: 0.06 }); panels(bag, Fn, OAK, 1.3, Fn.w - 1.3, P + 0.2, P + 4.3, { pw: 0.5, d: 0.06 }); panels(bag, Fs, OAK, 0.3, Fs.w - 0.3, P + 4.8, P + 6.6, { pw: 0.5, d: 0.06 });
  panels(bag, Fs, OAK, 0.3, Fs.w / 2 - 1.9, P + 0.2, P + 4.2, { pw: 0.5, d: 0.06 }); panels(bag, Fs, OAK, Fs.w / 2 + 1.9, Fs.w - 0.3, P + 0.2, P + 4.2, { pw: 0.5, d: 0.06 });
  ceiling(bag, ch, P + 11.6, P + 12.6, ax);
  // outside: buttresses, windows, the roof
  for (const [f, ufo] of [['w', (z) => z - cz0 + 1.0], ['e', (z) => cz1 + 0 - z]]) {
    const Fo = faceFrame([x0 - 1, cz0 - 1, x1 + 1, cz1], f);
    outside(bag, Fo, { v0: y, top: Wc, at: [0, 1, 2, 3, 4].map((i) => ufo(cz0 + 4.0 + i * 4.9)), windows: zs.map((z) => ({ uc: ufo(z), hw: 1.4, v0: P + 6.7, vs: P + 10.0, rise: 1.4, lights: 3, transoms: [P + 8.4] })) });
  }
  outside(bag, faceFrame([x0 - 1, cz0 - 1, x1 + 1, cz1], 'n'), { v0: y, top: Wc, at: [0.5, x1 - x0 + 1.5] });
  roof(bag, [x0 - 1, cz0 - 1, x1 + 1, cz1 + 1], Wc + 1.0, Wc + 5.5, 'z');
}

// ── the Lords ───────────────────────────────────────────────────────────────────────────────────────────────────
/** lords: { x, z0 (the Central Lobby's south face), y, P } — the corridor, the Peers' Lobby, the chamber, southward. */
export function lords(el, ctx) {
  const { bag, col, lights } = ctx, ax = el.x, z0 = el.z0, y = el.y ?? 0, P = el.P;
  const cr = [ax - 2.25, z0, ax + 2.25, z0 + 12.5];
  corridor(bag, col, cr, y, P, 's');
  const lr = [ax - 6.0, cr[3] + 1, ax + 6.0, cr[3] + 1 + 12.0];
  const LH = P + 11;
  lobby(bag, col, lr, y, P, LH, { n: { u: lr[2] - ax, w: 4.5, v1: P + 4.2, rise: 1.4 }, s: { u: lr[2] - ax, w: 3.0, v1: P + 3.6, rise: 1.2 } }, 'peers');
  const zc0 = lr[3] + 1, ch = [ax - 6.85, zc0, ax + 6.85, zc0 + 24.4], [x0, cz0, x1, cz1] = ch, Wc = P + 14.2, Hc = P + 13.7;
  const Fw = inner(ch, 'w'), Fe = inner(ch, 'e'), Fs = inner([x0 - 1, cz0, x1 + 1, cz1], 's'), Fn = inner(ch, 'n');
  slab(bag, col, OAK, ch, y - 0.4, P);
  wall(bag, col, SY, Fw, y - 0.5, Wc, 1.0); wall(bag, col, SY, Fe, y - 0.5, Wc, 1.0); wall(bag, col, SY, Fs, y - 0.5, Wc, 1.0);
  bag.add(SY, box(x0 - 1, LH, zc0 - 1, x1 + 1, Wc, zc0));
  for (const s of [-1, 1]) bag.add(SY, box(Math.min(ax + s * 7.0, ax + s * 7.85), y - 0.5, zc0 - 1, Math.max(ax + s * 7.0, ax + s * 7.85), LH, zc0));
  bag.add('cloth_red', box(ax - 2.2, P - 0.02, cz0 + 4.6, ax + 2.2, P + 0.02, cz0 + 20.2));
  // the benches of red leather: four rows either side, the cross benches facing the throne, the Bar
  for (const s of [-1, 1]) benches(bag, col, { xf: ax + s * 2.4, s, z0: cz0 + 4.8, z1: cz0 + 18.8, rows: 4, y: P, cloth: 'cloth_red', breaks: [[cz0 + 11.4, cz0 + 12.3]] });
  benches(bag, col, { xf: cz0 + 3.9, s: -1, z0: ax - 4.6, z1: ax + 4.6, rows: 2, y: P, cloth: 'cloth_red', along: 'x', breaks: [[ax - 1.1, ax + 1.1]] });
  for (const [a, b] of [[x0, ax - 0.8], [ax + 0.8, x1]]) { bag.add(OAK, box(a, P, cz0 + 1.15, b, P + 0.95, cz0 + 1.3)); bag.add(G, box(a, P + 0.95, cz0 + 1.1, b, P + 1.05, cz0 + 1.35)); col.rect([a, cz0 + 1.1, b, cz0 + 1.35], P, P + 1.05); }
  // the clerks' table, the judges' woolsack, the woolsack with the mace on its back, the gilded rail before the throne
  { const t0 = cz0 + 12.8;
    bag.add(OAK, box(ax - 0.7, P, t0 + 0.1, ax + 0.7, P + 0.76, t0 + 2.9)); bag.add(OAK, box(ax - 0.8, P + 0.76, t0, ax + 0.8, P + 0.82, t0 + 3.0)); bag.add('cloth_red', box(ax - 0.74, P + 0.82, t0 + 0.06, ax + 0.74, P + 0.84, t0 + 2.94)); col.rect([ax - 0.8, t0, ax + 0.8, t0 + 3.0], P, P + 0.84);
    for (const dx of [-0.5, 0, 0.5]) chair(bag, col, ax + dx, t0 - 0.45, P, 'cloth_red', 1);
    bag.add('paint_white', box(ax - 0.3, P + 0.84, t0 + 0.4, ax + 0.05, P + 0.87, t0 + 0.7)); bag.add('hide_brown', box(ax + 0.2, P + 0.84, t0 + 1.4, ax + 0.45, P + 0.92, t0 + 1.75));
    bag.add('cloth_red', box(ax - 1.6, P, cz0 + 16.6, ax + 1.6, P + 0.5, cz0 + 17.8)); bag.add('cloth_red', box(ax - 1.5, P + 0.5, cz0 + 16.7, ax + 1.5, P + 0.58, cz0 + 17.7)); col.rect([ax - 1.6, cz0 + 16.6, ax + 1.6, cz0 + 17.8], P, P + 0.58);
    bag.add('cloth_red', box(ax - 1.3, P, cz0 + 18.4, ax + 1.3, P + 0.58, cz0 + 19.7)); bag.add('cloth_red', box(ax - 1.2, P + 0.58, cz0 + 19.5, ax + 1.2, P + 1.12, cz0 + 19.72)); bag.add('cloth_red', box(ax - 1.22, P + 0.58, cz0 + 18.5, ax + 1.22, P + 0.66, cz0 + 19.5)); col.rect([ax - 1.3, cz0 + 18.4, ax + 1.3, cz0 + 19.72], P, P + 1.12);
    bag.add(G, rod([ax - 0.75, P + 1.18, cz0 + 19.6], [ax + 0.75, P + 1.18, cz0 + 19.6], 0.035, 8)); bag.add(G, lathe([[0.001, 0], [0.09, 0.05], [0.11, 0.2], [0.07, 0.28], [0.1, 0.36], [0.001, 0.44]], 8, null, 0, 0, 0).rotateZ(-Math.PI / 2).translate(ax + 0.75, P + 1.18, cz0 + 19.6));
    for (const [a, b] of [[x0 + 2.2, ax - 0.9], [ax + 0.9, x1 - 2.2]]) { bag.add(G, box(a, P + 0.95, cz0 + 20.35, b, P + 1.02, cz0 + 20.42)); for (let x = a; x <= b + 1e-6; x += 0.4) bag.add(G, lathe([[0.025, 0], [0.025, 0.95], [0.05, 1.0], [0.001, 1.1]], 6, null, x, P, cz0 + 20.385)); col.rect([a, cz0 + 20.3, b, cz0 + 20.45], P, P + 1.0); } }
  // the throne under its canopy, the Prince of Wales's chair of state, the gilded screens across the south end
  throne(bag, col, ax, cz1, P);
  for (const [a, b] of [[x0, ax - 2.8], [ax + 2.8, x1]]) { bag.add(AU, box(a, P, cz1 - 0.15, b, P + 5.0, cz1)); panels(bag, inner([a, cz0, b, cz1 - 0.15], 's'), G, 0.2, b - a - 0.2, P + 0.4, P + 4.6, { pw: 0.45, d: 0.06 }); }
  for (const s of [-1, 1]) candelabrum(bag, lights, ax + s * 3.6, cz1 - 4.8, P);
  // the galleries: the strangers' and reporters' over the Bar, the ambassadors' either side of the canopy, and the
  // narrow brass-railed galleries along the side walls under the windows
  const gy = P + 5.0;
  { const zf = cz0 + 3.6; bag.add(OAK, box(x0, gy, cz0, x1, gy + 0.2, zf)); col.floor([x0, cz0, x1, zf], gy + 0.2); galleryFront(bag, faceFrame([x0, zf, x1, zf + 0.1], 's'), gy + 0.2, true);
    benches(bag, col, { xf: zf - 0.15, s: -1, z0: x0 + 0.1, z1: x1 - 0.1, rows: 3, y: gy + 0.2, cloth: 'cloth_red', along: 'x', breaks: [[ax - 0.5, ax + 0.5]] }); }
  for (const [a, b] of [[x0, ax - 3.0], [ax + 3.0, x1]]) { const zf = cz1 - 2.6; bag.add(OAK, box(a, gy, zf, b, gy + 0.2, cz1 - 0.15)); galleryFront(bag, faceFrame([a, zf - 0.1, b, zf], 'n'), gy + 0.2, true); }
  for (const s of [-1, 1]) { const xw = s < 0 ? x0 : x1, xf = xw - s * 1.0, za = cz0 + 3.7, zb = cz1 - 2.7, ny = P + 6.6;
    bag.add(OAK, box(Math.min(xw, xf), ny, za, Math.max(xw, xf), ny + 0.15, zb));
    for (let z = za + 0.4; z < zb; z += 2.0) bag.add(G, rod([xw - s * 0.05, ny - 0.9, z], [xf + s * 0.15, ny + 0.01, z], 0.05, 6));
    bag.add(G, box(xf - 0.03, ny + 0.95, za, xf + 0.03, ny + 1.0, zb)); for (let z = za; z <= zb + 1e-6; z += 0.45) bag.add(G, lathe([[0.02, 0], [0.02, 0.96], [0.001, 1.0]], 6, null, xf, ny + 0.15, z)); }
  // the walls: oak panelling to the narrow galleries; above, the windows of kings and queens, the barons between them
  const nw = 6, sp = 24.4 / nw;
  for (const [F, uf, rot] of [[Fw, (z) => cz1 - z, -Math.PI / 2], [Fe, (z) => z - cz0, Math.PI / 2]]) {
    panels(bag, F, OAK, 0.3, F.w - 0.3, P + 0.2, P + 6.4, { pw: 0.45, d: 0.06 });
    for (let i = 0; i < nw; i++) windowOn(bag, F, 0, { uc: uf(cz0 + sp * (i + 0.5)), hw: 1.1, v0: P + 8.3, vs: P + 11.9, rise: 1.3, lights: 2, transoms: [P + 10.0], glass: 'stained_glass', depth: 0.18, label: false });
    for (let j = 1; j < nw; j++) baron(bag, ctx, F, uf(cz0 + sp * j), P + 8.3, rot, 50 + j + (F === Fe ? 10 : 0));
  }
  // the ends: the three frescoes in their arched recesses over the throne and over the strangers' gallery, barons flanking
  for (const [F, rot, sd] of [[Fs, 0, 70], [Fn, Math.PI, 80]]) {
    const w = 13.7, off = F === Fs ? 1.0 : 0;
    for (const du of [-4.0, 0, 4.0]) painting(bag, F, off + w / 2 + du - 1.55, off + w / 2 + du + 1.55, P + 8.7, P + 12.0, { arch: 1.2 });
    for (const u of [0.62, 4.85, 8.85, 13.08]) baron(bag, ctx, F, off + u, P + 8.3, rot, sd + Math.round(u));
  }
  // the flat ceiling in eighteen compartments, heraldic, its beams and bosses gilded
  bag.add('ceiling_coffer', box(x0, Hc, cz0, x1, Hc + 0.2, cz1));
  for (let i = 1; i < 3; i++) { const x = x0 + (x1 - x0) * i / 3; bag.add(OAK, box(x - 0.18, Hc - 0.36, cz0, x + 0.18, Hc, cz1)); }
  for (let j = 1; j < 6; j++) { const z = cz0 + 24.4 * j / 6; bag.add(OAK, box(x0, Hc - 0.38, z - 0.18, x1, Hc, z + 0.18)); for (let i = 1; i < 3; i++) bag.add(G, lathe([[0.001, 0], [0.32, -0.04], [0.36, -0.2], [0.001, -0.32]], 10, null, x0 + (x1 - x0) * i / 3, Hc - 0.36, z)); }
  for (const [a, b, c, d] of [[x0, cz0, x1, cz0 + 0.3], [x0, cz1 - 0.3, x1, cz1], [x0, cz0, x0 + 0.3, cz1], [x1 - 0.3, cz0, x1, cz1]]) bag.add(G, box(a, Hc - 0.45, b, c, Hc, d));
  // outside
  for (const [f, ufo] of [['w', (z) => z - cz0 + 1], ['e', (z) => cz1 + 1 - z]]) {
    const Fo = faceFrame([x0 - 1, cz0 - 1, x1 + 1, cz1 + 1], f);
    outside(bag, Fo, { v0: y, top: Wc, at: Array.from({ length: nw + 1 }, (_, j) => ufo(cz0 + sp * j)), windows: Array.from({ length: nw }, (_, i) => ({ uc: ufo(cz0 + sp * (i + 0.5)), hw: 1.1, v0: P + 8.3, vs: P + 11.9, rise: 1.3, lights: 2, transoms: [P + 10.0] })) });
  }
  outside(bag, faceFrame([x0 - 1, cz0 - 1, x1 + 1, cz1 + 1], 's'), { v0: y, top: Wc, at: [0.5, x1 - x0 + 1.5] });
  roof(bag, [x0 - 1, cz0 - 1, x1 + 1, cz1 + 1], Wc + 1.0, Wc + 5.8, 'z');
}

/** A corridor of the principal floor from the Central Lobby (dir 'n' or 's' away from it): oak dado, the history paintings in their gilt frames, a rib vault in three bays. */
function corridor(bag, col, r, y, P, dir) {
  const [x0, z0, x1, z1] = r, H = P + 8.5;
  slab(bag, col, 'opus_sectile', r, y - 0.4, P);
  const Fw = inner(r, 'w'), Fe = inner(r, 'e');
  wall(bag, col, SY, Fw, y - 0.5, H, 1.0); wall(bag, col, SY, Fe, y - 0.5, H, 1.0);
  for (const F of [Fw, Fe]) {
    panels(bag, F, OAK, 0.2, F.w - 0.2, P + 0.2, P + 1.7, { pw: 0.42, d: 0.05 });
    fb(bag, F, OAK, 0, F.w, P + 1.7, P + 1.85, 0, 0.09);
    for (let j = 0; j < 4; j++) { const uc = (j + 0.5) * F.w / 4; painting(bag, F, uc - 1.2, uc + 1.2, P + 2.3, P + 4.5); }
    fb(bag, F, CV, 0, F.w, P + 5.4, P + 5.6, 0, 0.14);
  }
  const L = z1 - z0;
  for (let k = 0; k < 3; k++) { bayVault(bag, [x0, z0 + k * L / 3, x1, z0 + (k + 1) * L / 3], P + 5.6, 2.2, { along: 'z', cell: SY, rib: CV, boss: G, N: 8, transverse: [true, true] }); for (const x of [x0 + 0.2, x1 - 0.2]) for (const z of [z0 + k * L / 3, z0 + (k + 1) * L / 3]) shaft(bag, CV, x, Math.min(Math.max(z, z0 + 0.2), z1 - 0.2), P, P + 5.6, 0.1, [0, 1]); }
  bag.add(LD, box(x0 - 1, H, z0, x1 + 1, H + 0.2, z1));
  for (const f of ['w', 'e']) outside(bag, faceFrame([x0 - 1, z0, x1 + 1, z1], f), { v0: y, top: H });
  void dir;
}

/**
 * A lobby: square, vaulted, its doors { n, s, e, w: { u (centre along the wall), w (width), v1, rise } } open, the
 * others shut; panelling, shields over the doors, a tiled floor (the Peers' with its Tudor rose in a brass octagon).
 */
function lobby(bag, col, r, y, P, H, doors, kind) {
  const [x0, z0, x1, z1] = r, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  slab(bag, col, 'opus_sectile', r, y - 0.4, P);
  const F = { n: inner([x0 - 1, z0, x1 + 1, z1], 'n'), s: inner([x0 - 1, z0, x1 + 1, z1], 's'), w: inner(r, 'w'), e: inner(r, 'e') };
  for (const f of 'nsew') {
    const Fi = F[f], d = doors[f], uc = d ? d.u + (f === 'n' || f === 's' ? 1 : 0) : Fi.w / 2, wd = d ? d.w : 2.4;
    const hole = { u0: uc - wd / 2, u1: uc + wd / 2, v0: d ? y - 0.5 : P, v1: d ? d.v1 : P + 3.6, rise: d ? d.rise : 1.2 };
    wall(bag, col, SY, Fi, y - 0.5, H, 1.0, [hole]);
    if (!d) doorsShut(bag, col, Fi, hole.u0, hole.u1, P, hole.v1, -0.5);
    else { const [ax, az] = Fi.at(uc - wd / 2, 0), [bx, bz] = Fi.at(uc + wd / 2, -1.0); slab(bag, col, 'opus_sectile', [Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz)], y - 0.4, P); }
    archTrim(bag, Fi, CV, uc, wd / 2, P, hole.v1, hole.rise, { orders: 2, w: 0.16 });
    const top = hole.v1 + hole.rise + 0.5;
    panels(bag, Fi, CV, 0.4, uc - wd / 2 - 0.6, P + 0.3, P + 3.4, { pw: 0.5 }); panels(bag, Fi, CV, uc + wd / 2 + 0.6, Fi.w - 0.4, P + 0.3, P + 3.4, { pw: 0.5 });
    // the shields over the doors (in the Peers' Lobby the arms of the six royal houses, three over each door)
    for (let j = -1; j <= 1; j++) shield(bag, Fi, uc + j * 1.3, Math.min(top + 0.9, H - 3.4 - 0.95), 0.42, 0.02, j + 1 + (f === 's' ? 3 : 0), Math.abs(j + (f === 'n' ? 0 : 1)) % 2 ? 'paint_blue' : 'cloth_red');
    fb(bag, Fi, CV, 0, Fi.w, H - 3.4 - 0.22, H - 3.4, 0, 0.16);
  }
  bag.add(LD, box(x0 - 1, H, z0 - 1, x1 + 1, H + 0.2, z1 + 1));
  for (const [x, z] of [[x0 + 0.25, z0 + 0.25], [x1 - 0.25, z0 + 0.25], [x0 + 0.25, z1 - 0.25], [x1 - 0.25, z1 - 0.25]]) shaft(bag, CV, x, z, P, H - 3.4, 0.14, [1, 0]);
  bayVault(bag, r, H - 3.4, 3.0, { along: 'z', cell: SY, rib: CV, boss: G, N: 12 });
  if (kind === 'peers') {
    // the Tudor rose of Derbyshire marbles in its octagon of engraved brass
    const oc = (ap) => Array.from({ length: 8 }, (_, k) => { const th = k * Math.PI / 4 - Math.PI / 8, R = ap / Math.cos(Math.PI / 8); return [cx + R * Math.cos(th), cz + R * Math.sin(th)]; });
    for (let k = 0; k < 8; k++) { const A = oc(2.0), B = oc(2.35); bag.add(G, vprism([A[k], A[(k + 1) % 8], B[(k + 1) % 8], B[k]], P - 0.03, P + 0.02)); }
    bag.add('marble_dark', vprism(oc(2.0), P - 0.03, P + 0.02));
    for (let i = 0; i < 5; i++) { const t = i * 2 * Math.PI / 5 - Math.PI / 2; bag.add('breccia_red', lathe([[0.001, 0], [0.62, 0], [0.62, 0.02], [0.001, 0.02]], 14, null, cx + Math.cos(t) * 0.75, P + 0.02, cz + Math.sin(t) * 0.75));
      bag.add('serpentine', vprism([[cx + Math.cos(t + 0.63) * 0.9, cz + Math.sin(t + 0.63) * 0.9], [cx + Math.cos(t + 0.53) * 1.55, cz + Math.sin(t + 0.53) * 1.55], [cx + Math.cos(t + 0.63) * 1.8, cz + Math.sin(t + 0.63) * 1.8], [cx + Math.cos(t + 0.73) * 1.55, cz + Math.sin(t + 0.73) * 1.55]], P + 0.0, P + 0.035));
      bag.add('marble_smooth', lathe([[0.001, 0], [0.36, 0], [0.36, 0.02], [0.001, 0.02]], 12, null, cx + Math.cos(t + 0.63) * 0.42, P + 0.04, cz + Math.sin(t + 0.63) * 0.42)); }
    bag.add('giallo', lathe([[0.001, 0], [0.3, 0], [0.3, 0.02], [0.001, 0.02]], 12, null, cx, P + 0.06, cz));
    // the brass gates (Hardman's) of the south door, standing open against its reveals: pierced, studded
    const Fs = F.s, d = doors.s, uc = d.u + 1;
    for (const s of [-1, 1]) { const ue = uc + s * (d.w / 2 - 0.06), [gx, gz] = Fs.at(ue, 0), L = d.w / 2 - 0.1;
      const G2 = faceFrame([gx - 0.04, gz - L, gx + 0.04, gz], s < 0 ? 'e' : 'w');
      for (const [u0, u1, v0, v1] of [[0, L, P + 0.05, P + 0.2], [0, L, P + 3.4, P + 3.55], [0, 0.12, P + 0.05, P + 3.55], [L - 0.12, L, P + 0.05, P + 3.55], [0, L, P + 1.75, P + 1.85]]) fb(bag, G2, G, u0, u1, v0, v1, -0.04, 0.04);
      for (let i = 1; i < 6; i++) fb(bag, G2, G, i * L / 6 - 0.025, i * L / 6 + 0.025, P + 0.2, P + 3.4, -0.03, 0.03);
      for (let j = 1; j < 9; j++) { const v = P + 0.2 + j * 3.2 / 9; fb(bag, G2, G, 0.12, L - 0.12, v - 0.02, v + 0.02, -0.03, 0.03); for (let i = 1; i < 6; i++) fb(bag, G2, G, i * L / 6 - 0.045, i * L / 6 + 0.045, v - 0.045, v + 0.045, -0.05, 0.05); }
      col.segment(G2.at(0, 0), G2.at(L, 0), 0.1, P, P + 3.55); }
  }
}

/** A chair with an upholstered seat and back, facing +z (dir 1) or −z. */
function chair(bag, col, x, z, P, cloth, dir) {
  const b = z - dir * 0.22;
  bag.add(OAK, box(x - 0.24, P, z - 0.22, x + 0.24, P + 0.42, z + 0.22)); bag.add(cloth, box(x - 0.22, P + 0.42, z - 0.2, x + 0.22, P + 0.5, z + 0.2));
  bag.add(OAK, box(x - 0.24, P + 0.42, Math.min(b, b - dir * 0.06), x + 0.24, P + 1.1, Math.max(b, b - dir * 0.06))); bag.add(cloth, box(x - 0.18, P + 0.55, Math.min(b, b + dir * 0.03), x + 0.18, P + 1.0, Math.max(b, b + dir * 0.03)));
  col.rect([x - 0.24, z - 0.28, x + 0.24, z + 0.22], P, P + 1.1);
}
/** The front of a gallery: an oak parapet of traceried panels with a moulded rail (gilt in the Lords). */
function galleryFront(bag, F, v, gilt = false) {
  fb(bag, F, OAK, 0, F.w, v - 0.35, v + 0.95, -0.1, 0); panels(bag, F, gilt ? G : OAK, 0.1, F.w - 0.1, v - 0.25, v + 0.8, { pw: 0.42, d: 0.04 });
  fb(bag, F, gilt ? G : OAK, -0.02, F.w + 0.02, v + 0.95, v + 1.05, -0.14, 0.05);
}
/** The canted ceiling of Barry's House of Commons (1852): sloping sides and a flat centre of oak panels, the Tudor rose and the portcullis alternating. */
function ceiling(bag, r, y0, y1, ax) {
  const [x0, z0, x1, z1] = r, xa = x0 + 2.6, xb = x1 - 2.6, n = 12, step = (z1 - z0) / n;
  bag.add(OAK, box(xa, y1, z0, xb, y1 + 0.15, z1));
  for (const [a, b] of [[x0, xa], [x1, xb]]) bag.add(OAK, hexa([[a, y0, z0], [b, y1, z0], [b, y1, z1], [a, y0, z1]], [[a, y0 + 0.15, z0], [b, y1 + 0.15, z0], [b, y1 + 0.15, z1], [a, y0 + 0.15, z1]]));
  for (let i = 0; i <= 4; i++) { const x = xa + (xb - xa) * i / 4; bag.add(OAK, box(x - 0.09, y1 - 0.16, z0, x + 0.09, y1, z1)); }
  for (const [a, b] of [[x0, xa], [x1, xb]]) bag.add(OAK, hexa([[a, y0 - 0.16, z0], [b, y1 - 0.16, z0], [b, y1 - 0.16, z0 + 0.2], [a, y0 - 0.16, z0 + 0.2]], [[a, y0 + 0.01, z0], [b, y1 + 0.01, z0], [b, y1 + 0.01, z0 + 0.2], [a, y0 + 0.01, z0 + 0.2]]));
  for (let j = 0; j <= n; j++) { const z = z0 + j * step; bag.add(OAK, box(xa, y1 - 0.18, z - 0.09, xb, y1, z + 0.09)); for (const [a, b] of [[x0, xa], [x1, xb]]) bag.add(OAK, hexa([[a, y0 - 0.18, z - 0.09], [b, y1 - 0.18, z - 0.09], [b, y1 - 0.18, z + 0.09], [a, y0 - 0.18, z + 0.09]], [[a, y0 + 0.01, z - 0.09], [b, y1 + 0.01, z - 0.09], [b, y1 + 0.01, z + 0.09], [a, y0 + 0.01, z + 0.09]])); }
  for (let j = 0; j < n; j++) for (let i = 0; i < 4; i++) {
    const x = xa + (xb - xa) * (i + 0.5) / 4, z = z0 + (j + 0.5) * step;
    if ((i + j) % 2) bag.add(G, lathe([[0.001, 0], [0.3, -0.01], [0.32, -0.05], [0.18, -0.08], [0.1, -0.11], [0.001, -0.12]], 10, (th) => 1 + 0.18 * Math.cos(th * 5), x, y1, z));
    else { for (let k = -2; k <= 2; k++) bag.add(G, box(x + k * 0.1 - 0.018, y1 - 0.05, z - 0.28, x + k * 0.1 + 0.018, y1, z + 0.3)); for (let k = -2; k <= 2; k++) bag.add(G, box(x - 0.24, y1 - 0.04, z + k * 0.11 - 0.015, x + 0.24, y1, z + k * 0.11 + 0.015)); for (let k = -2; k <= 2; k++) bag.add(G, lathe([[0.02, 0], [0.001, -0.1]], 4, null, x + k * 0.1, y1 - 0.05, z + 0.3)); }
  }
  void ax;
}
/** A baron of Magna Carta in his niche between the windows: a bracket, the figure in bronze, a gilt canopy over him. */
function baron(bag, ctx, F, u, v, rot, seed) {
  fb(bag, F, 'opening', u - 0.48, u + 0.48, v, v + 2.45, -0.02, 0.02);
  for (const s of [-1, 1]) fb(bag, F, G, u + s * 0.48 - 0.06, u + s * 0.48 + 0.06, v - 0.2, v + 3.2, 0, 0.32);
  fb(bag, F, G, u - 0.5, u + 0.5, v - 0.25, v, 0, 0.62); poly(bag, F, G, [[u - 0.5, v - 0.25], [u + 0.5, v - 0.25], [u, v - 0.85]], 0, 0.5);
  fb(bag, F, G, u - 0.54, u + 0.54, v + 2.45, v + 2.7, 0, 0.42); poly(bag, F, G, [[u - 0.54, v + 2.7], [u + 0.54, v + 2.7], [u, v + 3.4]], 0, 0.36);
  const [x, z] = F.at(u, 0.33), [tx, tz] = F.at(u, 0.2);
  bag.add(G, lathe([[0.001, 0], [0.1, 0.1], [0.001, 0.32]], 6, null, tx, v + 3.4, tz));
  statue(ctx, x, z, v, rot, seed, { m: 'bronze', h: 1.78, over: 'cape', beard: true, hair: 'short' });
}
/** The throne of 1847 on its dais, under the gilded canopy with its pinnacles and the royal arms. */
function throne(bag, col, ax, zb, P) {
  for (let i = 0; i < 3; i++) bag.add(i === 2 ? 'cloth_red' : OAK, box(ax - 3.5 + i * 0.5, P + Math.max(0, 0.2 * i - 0.05), zb - 3.4 + i * 0.5, ax + 3.5 - i * 0.5, P + 0.2 * (i + 1), zb - 0.15));
  col.ramp([ax - 3.5, zb - 3.4, ax + 3.5, zb - 2.4], P, P + 0.6, 's'); col.floor([ax - 2.5, zb - 2.4, ax + 2.5, zb - 0.15], P + 0.6);
  const Y = P + 0.6, z = zb - 1.0;
  const seat = (x, k) => {
    bag.add(AU, box(x - 0.6 * k, Y, z - 0.45 * k, x + 0.6 * k, Y + 0.5, z + 0.35)); bag.add('cloth_red', box(x - 0.52 * k, Y + 0.5, z - 0.4 * k, x + 0.52 * k, Y + 0.62, z + 0.3));
    for (const s of [-1, 1]) bag.add(AU, box(x + s * 0.6 * k - 0.08, Y + 0.5, z - 0.4 * k, x + s * 0.6 * k + 0.08, Y + 1.05, z + 0.35));
    bag.add(AU, box(x - 0.7 * k, Y, z + 0.35, x + 0.7 * k, Y + 2.7 * k, z + 0.6)); bag.add('cloth_red', box(x - 0.5 * k, Y + 0.7, z + 0.31, x + 0.5 * k, Y + 2.2 * k, z + 0.35));
    poly(bag, faceFrame([x - 0.7 * k, z + 0.35, x + 0.7 * k, z + 0.6], 'n'), AU, [[0, Y + 2.7 * k], [1.4 * k, Y + 2.7 * k], [0.7 * k, Y + 3.3 * k]], 0, 0.25);
    for (const s of [-1, 1]) pinn(bag, AU, x + s * 0.66 * k, Y + 2.7 * k, z + 0.47, 0.16, 0.9 * k);
    col.rect([x - 0.7 * k, z - 0.45 * k, x + 0.7 * k, z + 0.6], Y, Y + 2.7 * k);
  };
  seat(ax, 1); seat(ax + 1.75, 0.8);
  // the canopy: the back screen of gilt panelling, the canopy proper on slender shafts, gablets, pinnacles, the arms
  bag.add(AU, box(ax - 2.8, P, zb - 0.15, ax + 2.8, P + 8.4, zb)); panels(bag, inner([ax - 2.8, zb - 10, ax + 2.8, zb - 0.15], 's'), G, 0.2, 5.4, P + 3.6, P + 8.1, { pw: 0.5, d: 0.07 });
  bag.add(AU, box(ax - 2.5, P + 4.6, zb - 2.2, ax + 2.5, P + 5.2, zb - 0.15));
  for (let x = ax - 2.45; x <= ax + 2.45 + 1e-6; x += 0.25) bag.add(AU, lathe([[0.05, 0], [0.001, -0.3]], 4, null, x, P + 4.6, zb - 2.17));
  for (const s of [-1, 1]) bag.add(AU, lathe([[0.1, 0], [0.07, 0.3], [0.06, 3.7], [0.12, 4.0]], 8, null, ax + s * 2.4, Y, zb - 2.1));
  const Fc = faceFrame([ax - 2.5, zb - 2.2, ax + 2.5, zb - 0.15], 'n');
  for (const du of [0.85, 2.5, 4.15]) { poly(bag, Fc, AU, [[du - 0.8, P + 5.2], [du + 0.8, P + 5.2], [du, P + 6.8]], 0, 0.2); pinn(bag, AU, ...Fc.at(du - 0.82, 0.1).flatMap((c, i) => (i === 0 ? [c, P + 5.2] : [c])), 0.18, 1.6); }
  { const [x2, z2] = Fc.at(5.0, 0.1); pinn(bag, AU, x2, P + 5.2, z2, 0.18, 1.6); }
  shield(bag, Fc, 2.5, P + 5.75, 0.32, 0.2, 0, 'cloth_red');
}
/** A standing candelabrum of gilt brass with three tiers of gas lights. */
function candelabrum(bag, lights, x, z, P) {
  bag.add(G, lathe([[0.45, 0], [0.42, 0.15], [0.2, 0.3], [0.1, 0.6], [0.08, 3.4], [0.14, 3.6], [0.05, 3.9]], 10, null, x, P, z));
  for (const [h, R, n] of [[2.2, 0.55, 6], [2.9, 0.4, 5], [3.5, 0.25, 4]]) for (let i = 0; i < n; i++) { const t = i * 2 * Math.PI / n, ex = x + Math.cos(t) * R, ez = z + Math.sin(t) * R;
    bag.add(G, rod([x, P + h - 0.25, z], [ex, P + h, ez], 0.025, 5)); bag.add('lamp_glass', lathe([[0.03, 0], [0.07, 0.06], [0.08, 0.16], [0.04, 0.26], [0.001, 0.28]], 8, null, ex, P + h, ez)); }
  lights.push({ at: [x, P + 3.0, z], color: '#ffc27a', intensity: 8, distance: 10 });
}
