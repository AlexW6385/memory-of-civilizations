// The coffee house (kahvehane) of Ottoman Istanbul about 1560 (docs/settlements/ottoman-istanbul.md §10): coffee
// houses were first opened in Istanbul in 1554–55, at Tahtakale, by Hakem of Aleppo and Şems of Damascus; men met in
// them in companies of twenty or thirty, reading, playing backgammon and chess, reciting their poems [stated: TDV
// İA "Kahvehane", after Peçevi]. The windows were left open to the street, the front room like a house's sitting
// room, the shoes left at the door [stated: Wikipedia "Ottoman coffeehouse"]. Ours, of the lane's own building
// [inferred]: a timber-framed room on a rubble footing, open on the lane between posts above a low parapet, under a
// hipped roof of tiles with deep eaves; inside raised benches (sedir) along three walls, spread with kilims and
// cushions; in the back corner the hearth (ocak) under its hood and chimney, the coffee boiling in brass pots on it,
// a shelf of small cups over it; a water jar, a basin; a backgammon board on a low stool between two seats; the shoes
// on the step. No pipe: tobacco came to Istanbul about 1600, after our moment [inferred from the date].

import { box, lathe, rod } from '../../core/geom.js';
import * as F from '../mughal/furnish.js';

/**
 * kahvehane: { rect, y (floor level: the lot's highest corner), foot (its lowest), front ('n' | 's' | 'e' | 'w': the
 * lane side), seed }.
 */
export function kahvehane(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, f = el.front ?? 'e';
  // the local frame: x across the front, z from the front (−) to the back (+); turned to the lane side
  const turn = { n: 0, e: -Math.PI / 2, s: Math.PI, w: Math.PI / 2 }[f];
  const c = Math.cos(turn), s = Math.sin(turn);
  const W = (f === 'n' || f === 's') ? x1 - x0 : z1 - z0, D = (f === 'n' || f === 's') ? z1 - z0 : x1 - x0;
  const toW = (u, v) => [cx + u * c + v * s, cz - u * s + v * c];
  const R = (u0, v0, u1, v1) => { const a = toW(u0, v0), b = toW(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, y0, v0, u1, y1, v1) => { const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const yaw = turn, at = (u, v) => toW(u, v);
  const hw = W / 2 - 0.2, hd = D / 2 - 0.2, y = (el.y ?? 0) + 0.45, foot = (el.foot ?? el.y ?? 0) - 0.3, Hh = 3.4;
  // the footing of rubble, the floor of boards, a step up at the front
  col.rect(R(-hw, -hd, hw, hd), foot, y);
  B('limestone', -hw, foot, -hd, hw, y - 0.08, hd);
  B('timber', -hw, y - 0.08, -hd, hw, y, hd); col.floor(R(-hw, -hd, hw, hd), y);
  B('limestone', -1.2, foot, -hd - 0.6, 1.2, y - 0.25, -hd); col.floor(R(-1.2, -hd - 0.6, 1.2, -hd), y - 0.25);
  // the walls: the back and the sides, posts and studs of timber with plaster between; the front open between posts
  const wt = 0.18;
  for (const [u0, v0, u1, v1] of [[-hw, hd - wt, hw, hd], [-hw, -hd + 0.3, -hw + wt, hd - wt], [hw - wt, -hd + 0.3, hw, hd - wt]]) {
    const r = B('lime_plaster', u0, y, v0, u1, y + Hh, v1); col.rect(r, y, y + Hh);
  }
  // the frame showing on the plaster outside and in: sills, plates, posts at 1.2 m, a brace in each corner panel
  const frame = (u0, v0, u1, v1, out) => {
    const L = Math.hypot(u1 - u0, v1 - v0), n = Math.max(2, Math.round(L / 1.2)), du = (u1 - u0) / L, dv = (v1 - v0) / L, nu = -dv * out, nv = du * out;
    const bar = (a, b, ya, yb) => B('wood_dark', Math.min(a[0], b[0]) - 0.06, ya, Math.min(a[1], b[1]) - 0.06, Math.max(a[0], b[0]) + 0.06, yb, Math.max(a[1], b[1]) + 0.06);
    for (let k = 0; k <= n; k++) { const p = [u0 + du * L * k / n + nu * 0.06, v0 + dv * L * k / n + nv * 0.06]; bar(p, p, y, y + Hh); }
    for (const yy of [y, y + Hh - 0.14]) bar([u0 + nu * 0.06, v0 + nv * 0.06], [u1 + nu * 0.06, v1 + nv * 0.06], yy, yy + 0.14);
    bar([u0 + nu * 0.06, v0 + nv * 0.06], [u1 + nu * 0.06, v1 + nv * 0.06], y + 1.05, y + 1.15);
  };
  frame(-hw, hd, hw, hd, 1); frame(-hw, -hd + 0.3, -hw, hd, 1); frame(hw, -hd + 0.3, hw, hd, -1);
  // the front: corner posts and two between, a low parapet of boards, a plate over the opening; shutters propped up
  for (const u of [-hw, -hw / 3, hw / 3, hw]) { const r = B('wood_dark', u - 0.09, y, -hd - 0.09 + 0.3, u + 0.09, y + Hh, -hd + 0.09 + 0.3); col.rect(r, y, y + Hh); }
  for (const [u0, u1] of [[-hw, -hw / 3], [hw / 3, hw]]) { const r = B('timber', u0, y, -hd + 0.25, u1, y + 0.75, -hd + 0.33); col.rect(r, y, y + 0.75); B('wood_dark', u0, y + 0.75, -hd + 0.22, u1, y + 0.82, -hd + 0.36); }
  B('wood_dark', -hw - 0.1, y + Hh - 0.25, -hd + 0.2, hw + 0.1, y + Hh, -hd + 0.4);
  // the roof: a low hip of tiles over deep eaves on brackets, the eaves' boards under
  const E = 0.9, rh = 1.5, ry = y + Hh;
  { const r = R(-hw - E, -hd + 0.3 - E, hw + E, hd + E); bag.add('timber', box(r[0], ry, r[1], r[2], ry + 0.08, r[3])); col.floor(R(-hw, -hd + 0.3, hw, hd), ry + 0.08);
    const g = lathe([[1, 0], [0.001, 1]], 4); g.rotateY(Math.PI / 4); g.scale((r[2] - r[0]) / 2 / Math.SQRT1_2, rh, (r[3] - r[1]) / 2 / Math.SQRT1_2); g.translate((r[0] + r[2]) / 2, ry + 0.08, (r[1] + r[3]) / 2); bag.add('roof_tile', g);
    const g2 = lathe([[1, 0], [1, 0.12], [0.001, 0.12]], 4); g2.rotateY(Math.PI / 4); g2.scale((r[2] - r[0]) / 2 / Math.SQRT1_2 + 0.002, 1, (r[3] - r[1]) / 2 / Math.SQRT1_2 + 0.002); g2.translate((r[0] + r[2]) / 2, ry - 0.04, (r[1] + r[3]) / 2); bag.add('wood_dark', g2); }
  for (const u of [-hw, -hw / 3, hw / 3, hw]) B('wood_dark', u - 0.06, ry - 0.5, -hd + 0.3 - E + 0.1, u + 0.06, ry - 0.04, -hd + 0.3);
  // the chimney over the hearth (the back corner on the −u side)
  B('brick', -hw + 0.25, ry, hd - 0.95, -hw + 0.85, ry + rh + 0.9, hd - 0.35); B('roof_tile', -hw + 0.18, ry + rh + 0.9, hd - 1.02, -hw + 0.92, ry + rh + 1.0, hd - 0.28);
  // ---- inside: the benches round three walls, spread with kilims and cushions
  const bh = 0.45, bd = 0.85, toward = toW(0, 0);
  const seats = [[[-hw + wt, hd - wt], [hw - wt - 1.4, hd - wt]], [[-hw + wt, -hd + 0.6], [-hw + wt, hd - wt - bd - 1.3]], [[hw - wt, -hd + 0.6], [hw - wt, hd - wt]]];
  for (const [a, b] of seats) {
    F.divan(bag, col, toW(...a), toW(...b), y, toward, { h: bh, depth: bd, base: 'timber', mattress: 'cloth_red', backs: ['cloth_ochre', 'cloth_indigo', 'cloth_red'] });
  }
  { const p = at(0, 0.1); F.kilim(bag, p[0], y, p[1], Math.max(1, 2 * hw - 2 * bd - 0.6), Math.max(1, 2 * hd - bd - 1.2), yaw, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_ochre']); }
  // ---- the hearth in the back corner: a masonry block with an ash pan, a hood of plaster on brackets to the chimney
  const hx0 = -hw + wt, hz1 = hd - wt;
  { const r = B('brick', hx0, y, hz1 - 1.3, hx0 + 1.3, y + 0.75, hz1); col.rect(r, y, y + 0.75); }
  B('wood_dark', hx0 + 0.25, y + 0.75, hz1 - 1.05, hx0 + 1.05, y + 0.77, hz1 - 0.25);
  { const g = lathe([[0.75, 0], [0.75, 0.12], [0.3, 1.25], [0.3, Hh - 1.6], [0.001, Hh - 1.6]], 4); g.rotateY(Math.PI / 4); g.scale(0.92, 1, 0.92); const p = at(hx0 + 0.65, hz1 - 0.65); g.translate(p[0], y + 1.6, p[1]); bag.add('lime_plaster', g); B('wood_dark', hx0 + 1.2, y + 1.48, hz1 - 0.1, hx0 + 1.3, y + 1.6, hz1 - 1.3 + 0.1); B('wood_dark', hx0, y + 1.48, hz1 - 1.3, hx0 + 1.3, y + 1.6, hz1 - 1.2); }
  for (let k = 0; k < 3; k++) { const p = at(hx0 + 0.4 + (k % 2) * 0.45, hz1 - 0.45 - (k >> 1) * 0.45); F.ewer(bag, p[0], y + 0.77, p[1], 0.85 - k * 0.1, yaw + k); }
  { const p = at(hx0 + 0.65, hz1 - 0.65); for (let k = 0; k < 4; k++) bag.add('flame', lathe([[0.001, 0], [0.04, 0.01], [0.001, 0.04]], 6, null, p[0] + (k % 2 - 0.5) * 0.25, y + 0.77, p[1] + ((k >> 1) - 0.5) * 0.25)); if (lights) lights.push({ at: [p[0], y + 1.1, p[1]], color: '#ff9a50', intensity: 2, distance: 6 }); }
  // the shelf of cups on the back wall by the hearth, a tray stood behind them
  { const r0 = R(hx0 + 1.4, hz1 - 0.3, hx0 + 2.9, hz1); bag.add('timber', box(r0[0], y + 1.5, r0[1], r0[2], y + 1.54, r0[3]));
    for (let k = 0; k < 10; k++) { const p = at(hx0 + 1.5 + k * 0.14, hz1 - 0.15); F.cup(bag, p[0], y + 1.54, p[1], 'glaze_white'); }
    const g = lathe([[0.001, 0], [0.3, 0], [0.32, 0.02], [0.001, 0.01]], 16); g.rotateX(Math.PI / 2); const p = at(hx0 + 2.2, hz1 - 0.02); g.rotateY(yaw); g.translate(p[0], y + 1.85, p[1]); bag.add('bronze', g); }
  // the water jar and the basin by the door; the shoes on the step
  { const p = at(hw - 0.5, -hd + 0.75); F.waterJar(bag, p[0], y, p[1], 0.9); }
  for (let k = 0; k < 4; k++) { const p = at(-0.6 + k * 0.38, -hd - 0.3); bag.add('wood_dark', lathe([[0.001, 0], [0.05, 0.0], [0.05, 0.04], [0.001, 0.05]], 6, null, p[0], y - 0.25, p[1]).scale(1, 1, 1)); }
  // a low stool with the backgammon board open on it between the benches, a book on the bench
  { const p = at(hw - wt - bd - 0.45, 0.2); bag.add('wood_dark', box(p[0] - 0.25, y, p[1] - 0.25, p[0] + 0.25, y + 0.3, p[1] + 0.25));
    bag.add('timber', box(p[0] - 0.24, y + 0.3, p[1] - 0.2, p[0] + 0.24, y + 0.33, p[1] + 0.2));
    for (let k = 0; k < 6; k++) for (const sg of [-1, 1]) bag.add(k % 2 ? 'glaze_white' : 'wood_dark', lathe([[0.001, 0], [0.016, 0], [0.001, 0.07]], 3, null, p[0] - 0.2 + k * 0.035 + (k > 2 ? 0.05 : 0), y + 0.331, p[1] + sg * 0.12));
    for (let k = 0; k < 8; k++) bag.add(k < 4 ? 'glaze_white' : 'wood_dark', lathe([[0.001, 0], [0.018, 0], [0.018, 0.008], [0.001, 0.008]], 8, null, p[0] - 0.15 + (k % 4) * 0.1, y + 0.331, p[1] + (k < 4 ? 0.05 : -0.05))); }
  { const p = at(-hw + wt + 0.4, -0.5); bag.add('wood_dark', box(p[0] - 0.12, y + bh + 0.1, p[1] - 0.09, p[0] + 0.12, y + bh + 0.14, p[1] + 0.09)); }
  // a lamp hung from the plate over the room
  { const p = at(0, 0.3); bag.add('bronze', rod([p[0], y + 2.4, p[1]], [p[0], ry, p[1]], 0.008, 3)); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.03], [0.14, 0.1], [0.1, 0.16], [0.001, 0.17]], 10, null, p[0], y + 2.25, p[1])); if (lights) lights.push({ at: [p[0], y + 2.3, p[1]], color: '#ffb46b', intensity: 2.5, distance: 7 }); }
}
