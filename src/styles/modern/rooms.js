// Two rooms of the Sydney of 1973 one can walk into (docs/settlements/sydney.md §1f): a tenant's terrace house in the Rocks
// — the ground floor of one two-storey house of the row: the passage down the party wall, the front room with its fireplace
// and television, the bedroom behind it, and the kitchen in the timber addition at the back with its stove, table and
// refrigerator — and an espresso bar of the Italian and Greek kind: the counter and its machine, the back bar, the terrazzo
// floor, the little tables and bentwood chairs, the jukebox, and tables with umbrellas on the footpath.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

/** The local frame of a lot: u along the front from a0, d inward from the front face; returns W (point) and B (box). */
function frame(rect, f) {
  const [x0, z0, x1, z1] = rect, along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, Dp = along ? z1 - z0 : x1 - x0, a0 = along ? x0 : z0;
  const o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1;
  const W = (u, d, yy) => { const q = o - sg * d; return along ? [a0 + u, yy, q] : [q, yy, a0 + u]; };
  const R = (u0, u1, d0, d1) => { const p = W(u0, d0, 0), q = W(u1, d1, 0); return [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]; };
  const B = (u0, u1, d0, d1, ya, yb) => { const r = R(u0, u1, d0, d1); return box(r[0], ya, r[1], r[2], yb, r[3]); };
  return { L, Dp, W, R, B, rise: { n: 's', s: 'n', w: 'e', e: 'w' }[f] };
}
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };

/** A table-height thing's kit: a chair at (u, d) with its back toward `bk` (+1: toward larger d, −1: toward the front, 'u+'/'u−': along). */
function chair(bag, B, u, d, yy, bk, mat = 'wood_painted', seat = 'cloth_red') {
  const s = 0.21, h = 0.45;
  bag.add(mat, B(u - s, u + s, d - s, d + s, yy + h - 0.04, yy + h)); bag.add(seat, B(u - s + 0.01, u + s - 0.01, d - s + 0.01, d + s - 0.01, yy + h, yy + h + 0.03));
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add(mat, B(u + a * (s - 0.02) - 0.015, u + a * (s - 0.02) + 0.015, d + b * (s - 0.02) - 0.015, d + b * (s - 0.02) + 0.015, yy, yy + h - 0.04));
  const [bu0, bu1, bd0, bd1] = bk === 1 ? [u - s, u + s, d + s - 0.03, d + s] : bk === -1 ? [u - s, u + s, d - s, d - s + 0.03] : bk === 'u+' ? [u + s - 0.03, u + s, d - s, d + s] : [u - s, u - s + 0.03, d - s, d + s];
  bag.add(mat, B(bu0, bu1, bd0, bd1, yy + h, yy + h + 0.42));
}

/**
 * The ground floor of one house of a Rocks terrace, built hollow inside the row's wall (rocks.js calls this for the house
 * `enter`): c = { bag, col, lights, B, W, R (the row's local frame), u0, u1 (the house's bay), PR (the front layer's depth), Dp, F (the floor),
 * H1 (the storey), top, wall (the walls' material), rand, door (the door's left edge, u) }.
 */
export function terraceInterior(c) {
  const { bag, col, lights, B, W, R, u0, u1, PR, Dp, F, H1, top, wall } = c;
  const C = F + H1 - 0.3;                                   // the ceiling's underside
  const rc = (a, b, d0, d1, ya, yb) => col.rect(R(a, b, d0, d1), ya, yb);
  const S = (m, a, b, d0, d1, ya, yb) => { bag.add(m, B(a, b, d0, d1, ya, yb)); rc(a, b, d0, d1, ya, yb); };
  const fl = (a, b, d0, d1, yy) => col.floor(R(a, b, d0, d1), yy);
  // the shell: party walls (brick, plastered within), the back wall, the first-floor slab over all, the upper storey solid above it
  const pw = 0.25, i0 = u0 + pw, i1 = u1 - pw, dB = Dp - pw;
  for (const [a, b, s] of [[u0, i0, 1], [i1, u1, -1]]) { S(wall, a, b, PR, Dp, F, C); bag.add('plaster_white', B(s > 0 ? b : a - 0.03, s > 0 ? b + 0.03 : a, PR, dB, F, C)); }
  S(wall, u0, u1, dB, Dp, F, C); bag.add('plaster_white', B(i0, i1, dB - 0.03, dB, F, C));
  bag.add('plaster_white', B(u0, u1, PR, Dp, C, F + H1)); bag.add(wall, B(u0, u1, PR, Dp, F + H1, top)); rc(u0, u1, PR, Dp, F + H1, top + 3);
  rc(u0, u1, PR, Dp, C, F + H1);
  // the front wall's inside: plastered; the picture rail and the skirting round the rooms are drawn with each room
  bag.add('plaster_white', B(i0, i1, PR, PR + 0.03, F, C));
  // the floor: boards over the footing's stone
  bag.add('timber', B(i0, i1, PR, dB, F, F + 0.04)); fl(i0, i1, PR, dB, F + 0.04);
  const f = F + 0.04;
  // the passage along the left party wall (the door's side), the thin wall to the rooms with its two doors; the rooms and kitchen beyond
  const pu = u0 + 1.3, dP1 = PR + 4.5, dP2 = dP1 + 3.5, dr = 0.9;
  const doorWall = (d0, d1, ctr) => {      // the passage wall from d0 to d1 with a door's gap at ctr
    S('plaster_white', pu, pu + 0.12, d0, ctr - dr / 2, f, C); S('plaster_white', pu, pu + 0.12, ctr + dr / 2, d1, f, C);
    bag.add('plaster_white', B(pu, pu + 0.12, ctr - dr / 2, ctr + dr / 2, f + 2.1, C));
    bag.add('wood_dark', B(pu - 0.03, pu + 0.15, ctr - dr / 2 - 0.05, ctr - dr / 2, f, f + 2.15)); bag.add('wood_dark', B(pu - 0.03, pu + 0.15, ctr + dr / 2, ctr + dr / 2 + 0.05, f, f + 2.15));
    bag.add('wood_dark', B(pu - 0.03, pu + 0.15, ctr - dr / 2 - 0.05, ctr + dr / 2 + 0.05, f + 2.1, f + 2.2));
  };
  doorWall(PR + 0.04, dP1, PR + 2.4); doorWall(dP1, dP2, dP1 + 1.9);
  S('plaster_white', pu + 0.12, i1, dP1, dP1 + 0.12, f, C); S('plaster_white', pu + 0.12, i1, dP2, dP2 + 0.12, f, C);   // the partitions between the rooms
  // the stair's door in the passage wall (the stair runs up behind the partition; the upper floor is not open), the kitchen's door
  bag.add('wood_dark', B(u0 + pw, u0 + pw + 0.05, dP2 - 1.9, dP2 - 0.9, f, f + 2.0)); bag.add('wood_dark', B(u0 + pw - 0.001, u0 + pw + 0.06, dP2 - 1.95, dP2 - 0.85, f + 2.0, f + 2.05));
  // the door of the house, standing open against the passage wall (its leaf and the fanlight's glass are not drawn in the front)
  const dl = c.door;
  bag.add(c.doorMat ?? 'shutter_green', B(dl + 0.02, dl + 0.07, PR, PR + 0.95, f, f + 2.2));
  // lights: a pendant in each room and the passage
  const pend = (u, d, h = C - 0.35) => { const p = W(u, d, h); bag.add('lamp_white', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.2], [0.05, 0.3], [0.001, 0.3]], 10, null, p[0], p[1], p[2])); bag.add('iron', rod([p[0], C, p[2]], [p[0], p[1] + 0.3, p[2]], 0.01, 4)); lights.push({ at: [p[0], p[1] + 0.1, p[2]], color: '#ffd9a0', intensity: 2.2, distance: 6 }); };
  pend(u0 + 0.9, PR + 2.4); pend((pu + i1) / 2 + 0.2, PR + 2.2); pend((pu + i1) / 2, dP1 + 1.9); pend((i0 + i1) / 2, dP2 + 1.7); pend(u0 + 0.9, dP2 - 1.2);
  // the passage: a runner of red carpet, a hall stand with its mirror, a telephone on its table, a framed picture
  bag.add('cloth_red', B(u0 + 0.35, pu - 0.2, PR + 0.3, dP2 - 0.1, f, f + 0.012));
  S('wood_dark', u0 + pw, u0 + pw + 0.3, dP1 + 0.2, dP1 + 1.0, f, f + 0.85); bag.add('wood_dark', B(u0 + pw, u0 + pw + 0.06, dP1 + 0.25, dP1 + 0.95, f + 0.85, f + 1.95)); bag.add('mirror_tin', B(u0 + pw + 0.06, u0 + pw + 0.07, dP1 + 0.32, dP1 + 0.88, f + 1.1, f + 1.8));
  S('wood_dark', u0 + pw, u0 + pw + 0.3, PR + 3.4, PR + 3.8, f, f + 0.72); bag.add('car_black', B(u0 + pw + 0.04, u0 + pw + 0.26, PR + 3.45, PR + 3.75, f + 0.72, f + 0.82)); bag.add('car_black', B(u0 + pw + 0.1, u0 + pw + 0.2, PR + 3.5, PR + 3.7, f + 0.82, f + 0.88));
  bag.add('gilt_bronze', B(u0 + pw, u0 + pw + 0.02, dP2 - 0.8, dP2 - 0.2, f + 1.4, f + 1.9)); bag.add('fresco_green', B(u0 + pw + 0.02, u0 + pw + 0.03, dP2 - 0.75, dP2 - 0.25, f + 1.45, f + 1.85));
  // ── the front room (the parlour): the fireplace in the right party wall under its mantel, an armchair either side of it, the television
  const ru0 = pu + 0.12 + 0.04, ru1 = i1 - 0.03, rm = (ru0 + ru1) / 2;
  bag.add('cloth_maroon', B(ru0 + 0.3, ru1 - 0.4, PR + 0.5, dP1 - 0.4, f, f + 0.012));      // the carpet square
  bag.add('slate', B(ru1 - 0.12, ru1, PR + 1.75, PR + 3.15, f, f + 0.95));                    // the chimney breast's lower part: slate surround
  bag.add('car_black', B(ru1 - 0.1, ru1 - 0.02, PR + 2.05, PR + 2.85, f + 0.1, f + 0.7)); bag.add('flame', B(ru1 - 0.12, ru1 - 0.1, PR + 2.2, PR + 2.7, f + 0.15, f + 0.35));
  S('wood_dark', ru1 - 0.28, ru1, PR + 1.65, PR + 3.25, f + 0.95, f + 1.05);                    // the mantel shelf
  bag.add('plaster_white', B(ru1 - 0.12, ru1, PR + 1.75, PR + 3.15, f + 1.05, C));
  bag.add('mirror_tin', B(ru1 - 0.13, ru1 - 0.12, PR + 2.0, PR + 2.9, f + 1.35, f + 2.1));
  for (const [d, h] of [[1.9, 0.16], [2.95, 0.12]]) bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0.01], [0.06, h], [0.04, h + 0.05], [0.001, h + 0.05]], 8, null, ...W(ru1 - 0.16, PR + d, f + 1.05)));
  for (const d of [1.0, 3.6]) { S('cloth_brown', ru1 - 0.95, ru1 - 0.2, PR + d - 0.4, PR + d + 0.4, f, f + 0.42); bag.add('cloth_brown', B(ru1 - 0.2, ru1 - 0.1, PR + d - 0.4, PR + d + 0.4, f, f + 0.95)); bag.add('cloth_brown', B(ru1 - 0.95, ru1 - 0.1, PR + d - 0.4, PR + d - 0.3, f + 0.42, f + 0.65)); bag.add('cloth_brown', B(ru1 - 0.95, ru1 - 0.1, PR + d + 0.3, PR + d + 0.4, f + 0.42, f + 0.65)); }
  // the television on its legs against the passage wall: a wooden cabinet, the screen's glass, the knobs; a settee opposite
  S('wood_dark', ru0, ru0 + 0.5, PR + 1.5, PR + 2.4, f + 0.35, f + 0.85); for (const d of [1.55, 2.35]) for (const uu of [ru0 + 0.04, ru0 + 0.44]) bag.add('wood_dark', B(uu, uu + 0.04, d + PR - 0.0, d + PR + 0.04, f, f + 0.35));
  bag.add('glass_lamp', B(ru0 + 0.5, ru0 + 0.51, PR + 1.6, PR + 2.2, f + 0.45, f + 0.78)); bag.add('car_black', B(ru0 + 0.5, ru0 + 0.52, PR + 2.25, PR + 2.35, f + 0.5, f + 0.7));
  bag.add('timber', B(ru0 + 0.02, ru0 + 0.2, PR + 1.45, PR + 1.5, f + 0.85, f + 0.95));
  S('cloth_ochre', rm - 0.2, rm + 0.45, PR + 3.0, PR + 4.15, f, f + 0.4); bag.add('cloth_ochre', B(rm - 0.2, rm + 0.45, PR + 4.05, PR + 4.15, f + 0.4, f + 0.95));
  // a standard lamp, a bookcase, framed photographs, the curtains at the street window
  const lp = W(ru1 - 0.4, PR + 4.0, f); bag.add('iron', lathe([[0.15, 0], [0.15, 0.03], [0.02, 0.05], [0.02, 1.5], [0.001, 1.5]], 8, null, lp[0], lp[1], lp[2])); bag.add('lamp_paper', lathe([[0.001, 0], [0.18, 0.05], [0.22, 0.34], [0.001, 0.4]], 12, null, lp[0], lp[1] + 1.45, lp[2]));
  lights.push({ at: [lp[0], lp[1] + 1.7, lp[2]], color: '#ffcf90', intensity: 1.6, distance: 5 });
  for (const [d, wd] of [[1.0, 0.5], [1.6, 0.4]]) { bag.add('gilt_bronze', B(ru0 + 0.0, ru0 + 0.02, PR + d + 2.3, PR + d + 2.3 + wd, f + 1.4, f + 1.4 + wd * 0.8)); bag.add('fresco_green', B(ru0 + 0.02, ru0 + 0.03, PR + d + 2.35, PR + d + 2.25 + wd, f + 1.45, f + 1.35 + wd * 0.8)); }
  bag.add('cloth_green', B(i1 - 1.2, i1 - 0.15, PR + 0.31, PR + 0.4, f + 0.9, f + 3.0));
  // ── the bedroom behind it: an iron bedstead with a chenille cover, a wardrobe, a dressing table with its mirror, a chair, a rag rug
  const bu0 = ru0, bu1 = ru1, bd0 = dP1 + 0.16, bd1 = dP2 - 0.02;
  bag.add('cloth_blue', B(bu0 + 0.3, bu1 - 0.3, bd0 + 0.9, bd1 - 0.5, f, f + 0.012));
  const bx0 = bu1 - 1.55, bx1 = bu1 - 0.15;
  S('iron', bx0, bx1, bd0 + 0.3, bd1 - 0.2, f + 0.3, f + 0.36); bag.add('cloth_white', B(bx0 + 0.04, bx1 - 0.04, bd0 + 0.34, bd1 - 0.24, f + 0.36, f + 0.58)); bag.add('cloth_ochre', B(bx0 + 0.02, bx1 - 0.02, bd0 + 0.5, bd1 - 0.22, f + 0.58, f + 0.64));
  for (const d of [bd0 + 0.3, bd1 - 0.22]) { bag.add('iron', B(bx0, bx0 + 0.03, d, d + 0.03, f, f + (d < bd0 + 1 ? 1.1 : 0.7))); bag.add('iron', B(bx1 - 0.03, bx1, d, d + 0.03, f, f + (d < bd0 + 1 ? 1.1 : 0.7))); }
  bag.add('iron', B(bx0, bx1, bd0 + 0.3, bd0 + 0.33, f + 0.95, f + 1.1)); bag.add('cloth_white', B(bx0 + 0.1, bx1 - 0.1, bd0 + 0.36, bd0 + 0.7, f + 0.58, f + 0.7));
  S('wood_dark', bu0 + 0.02, bu0 + 0.6, bd1 - 1.5, bd1 - 0.2, f, f + 1.9); bag.add('wood_painted', B(bu0 + 0.6, bu0 + 0.63, bd1 - 1.42, bd1 - 0.28, f + 0.05, f + 1.85)); bag.add('steel_chrome', B(bu0 + 0.62, bu0 + 0.65, bd1 - 0.9, bd1 - 0.85, f + 0.9, f + 1.1));
  S('wood_dark', bu0 + 0.02, bu0 + 0.5, bd0 + 0.25, bd0 + 1.25, f, f + 0.78); bag.add('mirror_tin', B(bu0 + 0.02, bu0 + 0.05, bd0 + 0.4, bd0 + 1.1, f + 0.9, f + 1.6)); bag.add('timber', B(bu0 + 0.02, bu0 + 0.06, bd0 + 0.36, bd0 + 1.14, f + 1.6, f + 1.66));
  chair(bag, B, bu0 + 0.95, bd0 + 0.75, f, 'u-');
  // ── the kitchen at the back, in the timber addition: a wood stove with its flue, the sink under the window, the table and four chairs, the refrigerator, a dresser
  const ku0 = i0 + 0.02, ku1 = i1 - 0.02, kd0 = dP2 + 0.14, kd1 = dB - 0.02;
  bag.add('timber', B(ku0, ku1, kd0, kd1, f, f + 0.01));
  S('iron', ku1 - 0.75, ku1, kd1 - 0.8, kd1 - 0.1, f, f + 0.85); bag.add('iron', B(ku1 - 0.8, ku1, kd1 - 0.85, kd1 - 0.05, f + 0.85, f + 0.9)); bag.add('iron', rod(W(ku1 - 0.4, kd1 - 0.4, f + 0.9), W(ku1 - 0.4, kd1 - 0.4, C + 0.2), 0.07, 8));
  bag.add('flame', B(ku1 - 0.78, ku1 - 0.76, kd1 - 0.65, kd1 - 0.35, f + 0.18, f + 0.3));
  S('glaze_white', ku0 + 0.0, ku0 + 0.55, kd1 - 1.7, kd1 - 0.9, f + 0.7, f + 0.85); bag.add('wood_painted', B(ku0, ku0 + 0.55, kd1 - 1.7, kd1 - 0.9, f, f + 0.7)); bag.add('steel_chrome', rod(W(ku0 + 0.12, kd1 - 1.3, f + 0.85), W(ku0 + 0.12, kd1 - 1.3, f + 1.1), 0.015, 5));
  bag.add('wood_painted', B(ku0, ku0 + 0.4, kd1 - 0.9, kd1 - 0.15, f, f + 0.9)); rc(ku0, ku0 + 0.4, kd1 - 0.9, kd1 - 0.15, f, f + 0.9); bag.add('paint_cab_yellow', B(ku0, ku0 + 0.42, kd1 - 0.9, kd1 - 0.15, f + 0.9, f + 0.94));
  S('paint_white', ku1 - 0.7, ku1 - 0.02, dP2 + 0.2, dP2 + 0.9, f, f + 1.5); bag.add('steel_chrome', B(ku1 - 0.72, ku1 - 0.7, dP2 + 0.3, dP2 + 0.34, f + 0.75, f + 1.15)); bag.add('steel_chrome', B(ku1 - 0.72, ku1 - 0.7, dP2 + 0.3, dP2 + 0.34, f + 1.2, f + 1.35));
  S('wood_painted', ku0, ku0 + 0.4, dP2 + 0.2, dP2 + 1.1, f, f + 0.85); bag.add('wood_painted', B(ku0, ku0 + 0.28, dP2 + 0.2, dP2 + 1.1, f + 0.85, f + 2.0)); bag.add('glass_outer', B(ku0 + 0.28, ku0 + 0.29, dP2 + 0.25, dP2 + 1.05, f + 1.1, f + 1.9));
  for (let k = 0; k < 4; k++) bag.add('glaze_white', lathe([[0.1, 0], [0.11, 0.01], [0.001, 0.012]], 10, null, ...W(ku0 + 0.15, dP2 + 0.35 + k * 0.2, f + 1.3)));
  const kx = (ku0 + ku1) / 2 + 0.15, kz = (kd0 + kd1) / 2 - 0.1;
  S('wood_painted', kx - 0.55, kx + 0.55, kz - 0.4, kz + 0.4, f + 0.72, f + 0.76); bag.add('cloth_white', B(kx - 0.5, kx + 0.5, kz - 0.36, kz + 0.36, f + 0.76, f + 0.765));
  for (const [a, b] of [[-0.5, -0.36], [0.5, -0.36], [-0.5, 0.36], [0.5, 0.36]]) bag.add('wood_painted', B(kx + a - 0.025, kx + a + 0.025, kz + b - 0.025, kz + b + 0.025, f, f + 0.72));
  for (const [dx, dz, bk] of [[-0.75, 0, 'u-'], [0.75, 0, 'u+'], [0, -0.62, -1], [0, 0.62, 1]]) chair(bag, B, kx + dx, kz + dz, f, bk, 'wood_painted', 'cloth_blue');
  bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0.02], [0.08, 0.14], [0.03, 0.17], [0.001, 0.17]], 10, null, ...W(kx + 0.1, kz, f + 0.765)));
  // the back door, closed, with a pane over the sink; the calendar and a clock
  bag.add('wood_dark', B(i1 - 1.4, i1 - 0.8, dB - 0.04, dB, f, f + 2.0)); bag.add('glass_outer', B(u0 + 1.1, u0 + 2.0, dB - 0.04, dB - 0.01, f + 1.15, f + 2.0)); bag.add('paint_white', B(u0 + 1.55 - 0.02, u0 + 1.55 + 0.02, dB - 0.05, dB - 0.01, f + 1.15, f + 2.0));
  bag.add('paint_white', B(ku0 + 0.9, ku0 + 1.25, dP2 + 0.15, dP2 + 0.17, f + 1.5, f + 1.9)); bag.add('car_red', B(ku0 + 0.92, ku0 + 1.23, dP2 + 0.17, dP2 + 0.18, f + 1.78, f + 1.88));
  void both; void fromTriangles;
}

/**
 * espresso_bar: { rect, y (the floor), front, seed } — an espresso bar of two storeys on a street corner lot, built hollow on its ground floor.
 */
export function espressoBar(el, { bag, col, lights }) {
  const { L, Dp, W, R, B, rise } = frame(el.rect, el.front ?? 'n');
  const y = el.y ?? 0, F = y + 0.12, H1 = 3.7, top = y + 8.2, T = 0.3, gy = el.gy ?? y;
  const rc = (a, b, d0, d1, ya, yb) => col.rect(R(a, b, d0, d1), ya, yb);
  const S = (m, a, b, d0, d1, ya, yb) => { bag.add(m, B(a, b, d0, d1, ya, yb)); rc(a, b, d0, d1, ya, yb); };
  const dw = 1.15, du = L * 0.62;                                                                 // the door
  // the foundation and the floor of terrazzo with a border of dark tiles
  bag.add('concrete_light', B(0, L, 0, Dp, y - 1.5, F - 0.1));
  bag.add('tile_cream', B(T, L - T, T, Dp - T, F - 0.1, F)); col.floor(R(T, L - T, T, Dp - T), F);
  for (let u = T + 0.25; u < L - T; u += 0.5) for (let d = T + 0.25; d < Dp - T; d += 0.5) if (((u / 0.5 | 0) + (d / 0.5 | 0)) % 2 === 0) bag.add('tile_dark', B(u - 0.12, u + 0.12, d - 0.12, d + 0.12, F, F + 0.008));
  // the shopfront: a glass wall in aluminium frames between brick piers, a stall riser of glazed tile, the doorway; a fascia with the name over it
  const fy1 = F + 2.75;
  bag.add('brick', B(0, 0.45, 0, T + 0.15, y - 0.5, F + H1)); bag.add('brick', B(L - 0.45, L, 0, T + 0.15, y - 0.5, F + H1)); rc(0, 0.45, 0, T + 0.15, y - 0.5, F + H1); rc(L - 0.45, L, 0, T + 0.15, y - 0.5, F + H1);
  const front = (a, b, door) => {
    S('tile_cream', a, b, 0.05, 0.2, F, F + 0.55);
    bag.add('glass_outer', B(a, b, 0.1, 0.12, F + 0.55, fy1)); rc(a, b, 0.08, 0.14, F + 0.55, fy1);
    for (let u = a; u <= b + 0.001; u += (b - a) / Math.max(1, Math.round((b - a) / 1.3))) bag.add('aluminium_dull', B(u - 0.03, u + 0.03, 0.08, 0.16, F + 0.55, fy1));
    bag.add('aluminium_dull', B(a, b, 0.08, 0.16, F + 0.52, F + 0.58)); bag.add('aluminium_dull', B(a, b, 0.08, 0.16, fy1 - 0.03, fy1 + 0.03));
    void door;
  };
  front(0.45, du - dw / 2); front(du + dw / 2, L - 0.45);
  bag.add('aluminium_dull', B(du - dw / 2, du + dw / 2, 0.08, 0.16, fy1 - 0.03, fy1 + 0.03));
  // the door standing open inward, a glazed leaf in an aluminium frame; the step up from the footpath
  bag.add('glass_outer', B(du + dw / 2 - 0.04, du + dw / 2 - 0.02, 0.25, 0.25 + dw - 0.1, F + 0.1, fy1 - 0.05)); bag.add('aluminium_dull', B(du + dw / 2 - 0.05, du + dw / 2 - 0.01, 0.25, 0.25 + dw - 0.1, fy1 - 0.12, fy1 - 0.05));
  const n = Math.max(1, Math.ceil((F - gy) / 0.17)), hh = (F - gy) / n;
  for (let k = 0; k < n; k++) { const d1 = -0.38 * (k), d0 = -0.38 * (k + 1); bag.add('granite_grey', B(du - dw / 2, du + dw / 2, d0 - 0.02, 0.05, gy - 0.5, gy + hh * (n - k))); col.floor(R(du - dw / 2, du + dw / 2, d0, d1 + 0.05), gy + hh * (n - k)); }
  col.floor(R(du - dw / 2, du + dw / 2, 0.05, T), F);
  // the fascia and the awning (a fixed canvas hood over the footpath tables), the name in letters
  bag.add('plaster_white', B(0.45, L - 0.45, 0, 0.3, fy1, F + H1)); bag.add('car_red', B(0.6, L - 0.6, -0.04, 0, fy1 + 0.1, F + H1 - 0.1));
  for (let u = 1.2; u < L - 1.6; u += 0.5) bag.add('paint_white', B(u, u + 0.3, -0.06, -0.04, fy1 + 0.22, F + H1 - 0.22));
  for (let k = 0; k < 8; k++) { const u0 = 0.45 + k * (L - 0.9) / 8, u1 = u0 + (L - 0.9) / 8, T2 = [W(u0, 0, F + H1 - 0.1), W(u1, 0, F + H1 - 0.1), W(u1, -1.9, fy1 + 0.1), W(u0, 0, F + H1 - 0.1), W(u1, -1.9, fy1 + 0.1), W(u0, -1.9, fy1 + 0.1)]; bag.add(k % 2 ? 'cloth_white' : 'cloth_red', fromTriangles(both(T2.flat()))); }
  // the walls: brick, plastered inside, the side walls and the back
  const wall = el.wall ?? 'brick';
  for (const [a, b] of [[0, T], [L - T, L]]) { S(wall, a, b, T + 0.15, Dp, F, F + H1); bag.add('plaster_white', B(a === 0 ? T : a - 0.03, a === 0 ? T + 0.03 : a, T + 0.15, Dp - T, F, F + H1 - 0.3)); }
  S(wall, 0, L, Dp - T, Dp, F, F + H1); bag.add('plaster_white', B(T, L - T, Dp - T - 0.03, Dp - T, F, F + H1 - 0.3));
  // the ceiling and the upper storey (solid): brick with its windows and a parapet
  bag.add('plaster_white', B(0.45, L - 0.45, 0.16, Dp, F + H1 - 0.3, F + H1)); rc(0, L, 0, Dp, F + H1 - 0.3, F + H1);
  bag.add(wall, B(0, L, 0, Dp, F + H1, top)); rc(0, L, 0, Dp, F + H1, top + 1);
  for (let u = 0.9; u + 1.1 < L - 0.5; u += 2.0) { bag.add('glass_outer', B(u, u + 1.1, -0.02, 0.0, F + H1 + 1.0, F + H1 + 2.7)); bag.add('paint_white', B(u - 0.1, u + 1.2, -0.08, 0.0, F + H1 + 0.92, F + H1 + 1.0)); bag.add('paint_white', B(u - 0.1, u + 1.2, -0.06, 0.0, F + H1 + 2.7, F + H1 + 2.85)); bag.add('paint_white', B(u + 0.53, u + 0.57, -0.03, 0.0, F + H1 + 1.0, F + H1 + 2.7)); }
  bag.add('concrete_light', B(-0.05, L + 0.05, -0.15, Dp + 0.05, top, top + 0.25));
  // ── inside: the counter along the right wall with the machine, the back bar, the tables, the jukebox
  const cu0 = L - T - 1.55, cu1 = L - T - 0.95, c0 = T + 3.0, c1 = Dp - T - 1.0;
  S('wood_dark', cu0, cu1, c0, c1, F, F + 1.0); bag.add('car_cream', B(cu0 - 0.02, cu0, c0, c1, F + 0.15, F + 0.95)); bag.add('steel_chrome', B(cu0 - 0.03, cu0, c0, c1, F + 0.18, F + 0.22)); bag.add('marble', B(cu0 - 0.08, cu1 + 0.05, c0 - 0.05, c1 + 0.05, F + 1.0, F + 1.05));
  for (let d = c0 + 0.6; d < c1 - 0.3; d += 0.7) { bag.add('steel_chrome', lathe([[0.19, 0], [0.19, 0.03], [0.05, 0.06], [0.04, 0.6], [0.06, 0.64], [0.001, 0.64]], 10, null, ...W(cu0 - 0.55, d, F))); bag.add('car_red', lathe([[0.18, 0], [0.19, 0.05], [0.16, 0.08], [0.001, 0.09]], 12, null, ...W(cu0 - 0.55, d, F + 0.64))); col.circle?.(...W(cu0 - 0.55, d, F).filter((_, i) => i !== 1), 0.2, F, F + 0.74); }
  // the machine: a big chrome two-group lever machine with its boiler, the eagle, the group heads and the portafilters; cups, a grinder, the till
  const mu = (cu0 + cu1) / 2, md = c0 + 1.5;
  bag.add('steel_chrome', B(mu - 0.28, mu + 0.28, md - 0.4, md + 0.4, F + 1.05, F + 1.3)); bag.add('steel_chrome', lathe([[0.001, 0], [0.22, 0.01], [0.22, 0.45], [0.16, 0.55], [0.001, 0.58]], 16, null, ...W(mu, md, F + 1.3)));
  bag.add('gold', lathe([[0.001, 0], [0.05, 0.02], [0.05, 0.12], [0.001, 0.14]], 8, null, ...W(mu, md, F + 1.88)));
  for (const s of [-0.25, 0.25]) { bag.add('steel_chrome', B(mu - 0.34, mu - 0.2, md + s - 0.05, mu - 0.2 + 0.0, F + 1.18, F + 1.28)); bag.add('car_black', rod(W(mu - 0.34, md + s, F + 1.2), W(mu - 0.62, md + s, F + 1.2), 0.022, 6)); bag.add('steel_chrome', rod(W(mu - 0.28, md + s - 0.06, F + 1.22), W(mu - 0.28, md + s - 0.06, F + 1.5), 0.02, 5)); }
  for (let k = 0; k < 6; k++) bag.add('glaze_white', lathe([[0.04, 0], [0.045, 0.06], [0.04, 0.065], [0.001, 0.0]], 10, null, ...W(mu - 0.1 + (k % 3) * 0.12, md + 0.55 + (k / 3 | 0) * 0.1, F + 1.05)));
  bag.add('car_black', lathe([[0.001, 0], [0.09, 0.01], [0.09, 0.3], [0.03, 0.42], [0.001, 0.42]], 10, null, ...W(mu, md + 1.2, F + 1.05))); bag.add('steel_chrome', B(mu - 0.2, mu + 0.2, md + 2.2 - 0.0, md + 2.6, F + 1.05, F + 1.35)); bag.add('paint_white', B(mu - 0.14, mu + 0.14, md + 2.25, md + 2.35, F + 1.35, F + 1.5));
  // the glass case of cakes on the counter and the pastries in it
  bag.add('glass_outer', B(mu - 0.3, mu + 0.3, md + 3.0, md + 4.2, F + 1.08, F + 1.55)); bag.add('aluminium_dull', B(mu - 0.32, mu + 0.32, md + 2.98, md + 4.22, F + 1.05, F + 1.08)); bag.add('aluminium_dull', B(mu - 0.32, mu + 0.32, md + 2.98, md + 4.22, F + 1.55, F + 1.58));
  for (let k = 0; k < 5; k++) { bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.01], [0.09, 0.07], [0.001, 0.09]], 10, null, ...W(mu - 0.12 + (k % 2) * 0.24, md + 3.2 + k * 0.2, F + 1.05))); }
  // behind the counter: the back bar against the right wall — a mirror, shelves of glasses and tins, the menu board, a coffee roaster's calendar
  const bu = L - T - 0.05;
  S('wood_dark', bu - 0.5, bu, c0 - 0.2, c1 + 0.2, F, F + 0.95); bag.add('mirror_tin', B(bu - 0.03, bu, c0, c1, F + 1.1, F + 2.5));
  for (const h of [1.5, 1.9, 2.3]) { bag.add('timber', B(bu - 0.25, bu - 0.03, c0, c1, F + h, F + h + 0.04)); for (let d = c0 + 0.2; d < c1 - 0.1; d += 0.28) bag.add(h > 2 ? 'glaze_white' : 'glass_outer', lathe([[0.05, 0], [0.055, 0.1], [0.001, 0.1]], 8, null, ...W(bu - 0.12, d, F + h + 0.04))); }
  bag.add('car_black', B(bu - 0.04, bu, c1 + 0.3, c1 + 1.3, F + 1.3, F + 2.4)); for (let k = 0; k < 7; k++) bag.add('paint_white', B(bu - 0.05, bu - 0.04, c1 + 0.38, c1 + 0.38 + 0.3 + (k % 3) * 0.15, F + 2.2 - k * 0.14, F + 2.25 - k * 0.14));
  // the wall by the window: the bentwood chairs and the little round tables with white tops on one iron leg
  const tbl = (u, d) => {
    bag.add('iron', lathe([[0.2, 0], [0.2, 0.025], [0.04, 0.04], [0.04, 0.7], [0.001, 0.7]], 10, null, ...W(u, d, F)));
    bag.add('paint_white', lathe([[0.001, 0], [0.34, 0], [0.35, 0.02], [0.001, 0.02]], 16, null, ...W(u, d, F + 0.7)));
    bag.add('car_red', lathe([[0.34, 0], [0.35, 0.02], [0.35, 0.03], [0.34, 0.03]], 16, null, ...W(u, d, F + 0.7)));
    bag.add('glaze_white', lathe([[0.04, 0], [0.045, 0.06], [0.04, 0.065], [0.001, 0.0]], 10, null, ...W(u + 0.1, d, F + 0.72)));
    for (const [a, b, k] of [[-0.5, 0, 'u-'], [0.5, 0, 'u+']]) chair(bag, B, u + a, d + b, F, k, 'wood_dark', 'leather_bench');
    col.circle?.(...W(u, d, F).filter((_, i) => i !== 1), 0.36, F, F + 0.74);
  };
  let k = 0; for (let d = T + 1.3; d < Dp - T - 1.0; d += 1.5, k++) for (const u of [T + 1.1, T + 3.2]) if (u + 0.9 < cu0 - 0.6 && !(d > Dp - 3.0 && u > L - 4)) tbl(u, d);
  // the jukebox by the back wall: its arch of coloured light, the record window, the chrome; a poster
  const ju = T + 0.45, jd = Dp - T - 0.4;
  S('car_red', ju - 0.4, ju + 0.4, jd - 0.3, jd + 0.15, F, F + 1.2); bag.add('gold', B(ju - 0.3, ju + 0.3, jd - 0.31, jd - 0.3, F + 0.4, F + 0.9)); bag.add('glass_lamp', lathe([[0.001, 0], [0.3, 0.0], [0.3, 0.3], [0.2, 0.48], [0.001, 0.5]], 14, null, ...W(ju, jd - 0.08, F + 1.2)));
  bag.add('steel_chrome', B(ju - 0.41, ju + 0.41, jd - 0.31, jd - 0.28, F + 0.08, F + 0.14));
  lights.push({ at: [...W(ju, jd - 0.5, F + 0.9)], color: '#ff9ab0', intensity: 1.4, distance: 3.5 });
  // pendant globes down the room and a strip light behind the counter
  for (let d = T + 1.5; d < Dp - 1.2; d += 2.6) for (const u of [T + 2.2]) { const p = W(u, d, F + H1 - 0.7); bag.add('lamp_white', lathe([[0.001, 0], [0.18, 0.1], [0.2, 0.25], [0.1, 0.42], [0.001, 0.42]], 12, null, p[0], p[1], p[2])); bag.add('iron', rod([p[0], F + H1 - 0.3, p[2]], [p[0], p[1] + 0.42, p[2]], 0.01, 4)); lights.push({ at: [p[0], p[1] + 0.2, p[2]], color: '#ffe0b0', intensity: 2.4, distance: 6 }); }
  // the footpath tables under the awning's edge: round tables with umbrellas' absence — canvas chairs and little tables on the pavement, clear of the walk
  for (let u = 1.5; u < L - 1.2; u += 2.6) if (Math.abs(u - du) > 1.1) {
    const d = -1.0, p = W(u, d, gy);
    bag.add('aluminium_dull', lathe([[0.18, 0], [0.18, 0.02], [0.03, 0.03], [0.03, 0.7], [0.001, 0.7]], 10, null, p[0], p[1], p[2]));
    bag.add('paint_white', lathe([[0.001, 0], [0.3, 0], [0.3, 0.02], [0.001, 0.02]], 14, null, p[0], p[1] + 0.7, p[2]));
    for (const a of [-0.55, 0.55]) { const q = W(u + a, d, gy); bag.add('aluminium_dull', lathe([[0.001, 0], [0.2, 0], [0.2, 0.03], [0.001, 0.03]], 8, null, q[0], q[1] + 0.45, q[2])); for (const [ax, az] of [[-1, -1], [1, 1], [-1, 1], [1, -1]]) bag.add('aluminium_dull', rod([q[0] + ax * 0.17, q[1] + 0.45, q[2] + az * 0.17], [q[0] + ax * 0.19, q[1], q[2] + az * 0.19], 0.012, 4)); }
  }
  void rise; void top;
}
