// The pilgrims' tea shed by the monastery gate (docs/settlements/tang-wutai.md §16): an open-fronted shed with a thatched gable roof on six
// posts, a stove with two pots at its back, low tables and benches, a shelf of cups and jars, a banner on a pole. Element of the `wutai-site`
// style, `wutai_teashed { at: [x, z] (its centre), y, seed }`; the front is open to the north (the lane). [inferred: a rest-stop for pilgrims on
// the way up to the monastery; tea was drunk in Tang monasteries and sold on the roads (Lu Yu's Chajing, c. 760)]

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';

function hexa(out, b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}
export const TEASHED = { hl: 2.6, hd: 1.8 };

export function wutaiTeashed({ at: [cx, cz], y }, { bag, col }) {
  const { hl, hd } = TEASHED, F = y + 0.15, H = 2.7;
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { bag.add(m, box(cx + u0, ya, cz + v0, cx + u1, yb, cz + v1)); if (c) col.rect([cx + u0, cz + v0, cx + u1, cz + v1], ya, yb); };
  const pot = (m, u, v, r, h, ya) => bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 10, null, cx + u, ya, cz + v));
  B('brick_grey', -hl - 0.2, -hd - 0.2, hl + 0.2, hd + 0.2, y - 0.3, F - 0.02, true);
  col.floor([cx - hl - 0.2, cz - hd - 0.2, cx + hl + 0.2, cz + hd + 0.2], F);
  B('bluestone', -hl, -hd, hl, hd, F - 0.03, F + 0.012);
  // posts, the beams along and across them
  for (const u of [-hl + 0.1, 0, hl - 0.1]) for (const v of [-hd + 0.15, hd - 0.15]) B('timber', u - 0.08, v - 0.08, u + 0.08, v + 0.08, F, F + H, true);
  for (const v of [-hd + 0.15, hd - 0.15]) B('timber', -hl - 0.1, v - 0.1, hl + 0.1, v + 0.1, F + H, F + H + 0.24);
  for (const u of [-hl + 0.1, 0, hl - 0.1]) B('timber', u - 0.09, -hd + 0.05, u + 0.09, hd - 0.05, F + H + 0.24, F + H + 0.42);
  // the walls: mud-plastered at the back and on the east side, the west side open
  B('mud_plaster', -hl + 0.1, hd - 0.23, hl - 0.1, hd - 0.07, F, F + H, true);
  B('mud_plaster', hl - 0.18, -hd + 0.23, hl - 0.02, hd - 0.23, F, F + H - 0.2, true);
  B('schist_rubble', -hl + 0.1, hd - 0.25, hl - 0.1, hd - 0.05, F, F + 0.45, false);
  // the roof: two slabs of thatch falling from the ridge along x, a ridge roll, the gables' boards
  const yE = F + H + 0.42, rise = 1.15, ev = hd + 0.8, th = 0.26;
  for (const s of [-1, 1]) {
    const t = [], p = (u, v, yy) => [cx + u, yy, cz + v];
    hexa(t, [p(-hl - 0.5, s * ev, yE - th), p(hl + 0.5, s * ev, yE - th), p(hl + 0.5, 0, yE + rise - th), p(-hl - 0.5, 0, yE + rise - th)], [p(-hl - 0.5, s * ev, yE), p(hl + 0.5, s * ev, yE), p(hl + 0.5, 0, yE + rise), p(-hl - 0.5, 0, yE + rise)]);
    bag.add('thatch', fromTriangles(t));
  }
  B('thatch', -hl - 0.6, -0.16, hl + 0.6, 0.16, yE + rise - 0.02, yE + rise + 0.14);
  for (const s of [-1, 1]) { const w = (u) => { B('timber', u - 0.04, -0.04, u + 0.04, 0.04, yE + 0.0, yE + rise - 0.1); }; w(s * (hl + 0.2)); }
  // the stove at the back: a brick range with two iron pots, a chimney through the roof
  B('brick_grey', 1.2, hd - 1.0, 2.3, hd - 0.25, F, F + 0.85, true); pot('iron', 1.5, hd - 0.62, 0.3, 0.26, F + 0.85); pot('iron', 2.0, hd - 0.62, 0.3, 0.26, F + 0.85);
  B('brick_grey', 1.9, hd - 0.4, 2.2, hd - 0.12, F + 0.85, F + H + 1.35);
  B('lacquer_chestnut', -1.0, hd - 0.7, 0.9, hd - 0.25, F, F + 0.9, true);                       // the counter
  for (let k = 0; k < 6; k++) B('glaze_white', -0.9 + k * 0.28, hd - 0.58, -0.78 + k * 0.28, hd - 0.46, F + 0.9, F + 0.98);   // bowls on it
  B('timber', -2.3, hd - 0.3, 0.0, hd - 0.07, F + 1.55, F + 1.6);                               // a shelf of cups and jars
  for (let k = 0; k < 5; k++) B(k % 2 ? 'glaze_green' : 'glaze_white', -2.2 + k * 0.42, hd - 0.28, -2.05 + k * 0.42, hd - 0.12, F + 1.6, F + 1.74);
  pot('pottery_dark', -2.1, hd - 0.7, 0.34, 0.8, F); pot('glaze_green', -1.55, hd - 0.7, 0.3, 0.75, F);   // the water vat and a jar
  B('timber', hl - 0.7, hd - 0.9, hl - 0.2, hd - 0.3, F, F + 0.55); B('timber', hl - 0.7, hd - 1.2, hl - 0.2, hd - 0.9, F, F + 0.4);   // firewood
  // two low tables with benches, bowls on them
  for (const u of [-1.4, 0.7]) {
    B('lacquer_chestnut', u - 0.42, -0.65, u + 0.42, -0.05, F + 0.55, F + 0.61, true);
    for (const [a, b] of [[-0.38, -0.61], [0.34, -0.61], [-0.38, -0.09], [0.34, -0.09]]) B('lacquer_chestnut', u + a, b, u + a + 0.04, b + 0.04, F, F + 0.55);
    for (const a of [-0.15, 0.15]) B('glaze_white', u + a - 0.05, -0.45, u + a + 0.05, -0.35, F + 0.61, F + 0.68);
    B('timber', u - 0.45, -1.15, u + 0.45, -0.85, F + 0.3, F + 0.36, true); B('timber', u - 0.45, 0.15, u + 0.45, 0.45, F + 0.3, F + 0.36, true);
    for (const v of [-1.15, -0.85, 0.15, 0.45]) for (const a of [-0.42, 0.38]) B('timber', u + a, v + (v < 0 ? 0.03 : 0.03), u + a + 0.04, v + 0.07, F, F + 0.3);
  }
  // the banner on its pole at the front corner: a long strip of red cloth (the sign of a tea seller)
  B('timber', hl + 0.35, -hd - 0.5, hl + 0.43, -hd - 0.42, y, y + 4.2, true); B('timber', hl + 0.1, -hd - 0.5, hl + 0.43, -hd - 0.45, y + 3.95, y + 4.0);
  B('cloth_red', hl + 0.12, -hd - 0.49, hl + 0.32, -hd - 0.46, y + 1.9, y + 3.95);
}
