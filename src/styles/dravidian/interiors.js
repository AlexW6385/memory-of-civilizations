// The enterable houses and shops of Madurai about 1650 (docs/settlements/madurai.md §14): every house and shop of the
// first rings of the city is hollow in its front room — a doorway from the thinnai or the shop's platform,
// a floored, ceilinged room with furniture and the goods of its trade — and its fronts are weathered and dressed at
// eye level (damp, streaks, fallen plaster, a name board over each shop, mango-leaf toranam over house doors,
// water pots, firewood, a cot, washing on a line). Everything is built in the lot's own frame (see houses.js).
import { lathe, disc, clothBox, addCloth } from '../../core/geom.js';

const G = 'granite_tamil', TH = 0.32, I = 'plaster_white';
const vessel = (bag, x, y, z, s = 1, mat = 'bronze') => bag.add(mat, lathe([[0.001, 0], [0.07 * s, 0], [0.1 * s, 0.05 * s], [0.17 * s, 0.17 * s], [0.18 * s, 0.26 * s], [0.12 * s, 0.38 * s], [0.07 * s, 0.44 * s], [0.1 * s, 0.5 * s], [0.07 * s, 0.5 * s]], 8, null, x, y, z));
const dome = (bag, mat, x, y, z, r, h) => bag.add(mat, lathe([[0.001, 0], [r, 0], [r * 0.92, h * 0.5], [r * 0.6, h * 0.88], [0.001, h]], 7, null, x, y, z));
const strip = (F, mat, u, ytop, v, w, len) => {
  const [x, , z] = F.P(u, 0, v), [ax, , az] = F.P(u + w, 0, v + 0.04);
  addCloth(F.bag, mat, clothBox(Math.min(x, ax), ytop - len, Math.min(z, az), Math.max(x, ax), ytop, Math.max(z, az)), ytop);
};
const lampDish = (bag, x, y, z) => { bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.1, 0.06], [0.001, 0.05]], 8, null, x, y, z)); bag.add('lamp_glass', lathe([[0.001, 0], [0.025, 0.02], [0.001, 0.07]], 5, null, x, y + 0.05, z)); };

/** Where the doorway of a lot lies (local u range) and how deep the room is. */
export function plan(el, W, D, ver, rand) {
  const shop = el.kind === 'shop', door = shop ? (el.trade === 'sweets' ? [0.55, 1.85] : [W - 1.85, W - 0.55]) : [W / 2 - 0.55, W / 2 + 0.55];
  const rd = Math.max(2.4, Math.min(shop ? 5.0 : el.kind === 'agra' ? 6.4 : 4.7, D - ver - 2 * TH - 2.2));
  return { g0: door[0], g1: door[1], rd, shop };
}

/** The hollow front room: walls with the doorway, floor, ceiling and beams, and the solid mass behind. */
export function shell(F, o) {
  const { W, D, B, C, Fl } = F, { wash, h, ver, py, g0, g1, rd, shop } = o, vs = ver + TH + rd;
  const wall = (m, u0, v0, u1, v1, y0 = -0.3, y1 = h) => { B(m, u0, y0, v0, u1, y1, v1); C(u0, v0, u1, v1, Math.max(0, y0), y1 + 0.1); };
  wall(wash, 0, ver, g0, ver + TH); wall(wash, g1, ver, W, ver + TH); wall(wash, g0, ver, g1, ver + TH, 2.35, h);
  wall(I, 0, ver + TH, TH, vs + TH); wall(I, W - TH, ver + TH, W, vs + TH); wall(I, TH, vs, W - TH, vs + TH);
  wall(wash, 0, vs + TH, W, D);
  B(G, g0, -0.3, ver, g1, py, ver + TH); Fl(g0, ver, g1, ver + TH, py);
  B(shop ? G : 'cotto_floor', TH, py - 0.15, ver + TH, W - TH, py, vs); Fl(TH, ver + TH, W - TH, vs, py);
  B('timber', TH + 0.02, h - 0.52, ver + TH + 0.02, W - TH - 0.02, h - 0.46, vs - 0.02); B('stucco_cream', TH + 0.02, h - 0.46, ver + TH + 0.02, W - TH - 0.02, h - 0.43, vs - 0.02);
  const nb = Math.max(2, Math.round((W - 2 * TH) / 1.6));
  for (let i = 0; i < nb; i++) { const u = TH + (i + 0.5) * (W - 2 * TH) / nb; B('wood_dark', u - 0.07, h - 0.62, ver + TH + 0.03, u + 0.07, h - 0.52, vs - 0.03); }
  return { v0: ver + TH, vs };
}

/** Open leaves of a house door: jambs and lintel in cream, the two dark leaves swung back against the front. */
export function openDoor(F, uc, ver, w = 1.1) {
  const { B, bag } = F;
  for (const s of [-1, 1]) {
    B('stucco_cream', s < 0 ? uc - w / 2 - 0.22 : uc + w / 2, 0.55, ver - 0.06, s < 0 ? uc - w / 2 : uc + w / 2 + 0.22, 2.55, ver + TH + 0.03);
    B('wood_dark', s < 0 ? uc - w / 2 - 0.5 : uc + w / 2 + 0.46, 0.58, ver - 0.12, s < 0 ? uc - w / 2 - 0.46 : uc + w / 2 + 0.5, 2.3, ver - 0.06);
    for (let r = 0; r < 3; r++) { const [x, , z] = F.P(s < 0 ? uc - w / 2 - 0.515 : uc + w / 2 + 0.515, 0, ver - 0.09); bag.add('gilt_bronze', lathe([[0.001, 0], [0.03, 0], [0.02, 0.02], [0.001, 0.025]], 5, null, x, 0.85 + r * 0.45, z)); }
  }
  B('timber', uc - w / 2 - 0.35, 2.3, ver - 0.11, uc + w / 2 + 0.35, 2.55, ver + TH + 0.03);
}

/** Damp, streaks and fallen plaster on the street front (between the openings), strictly flat on the wall. */
export function weather(F, o, rand) {
  const { B } = F, { ver, py, h, W, g0, g1, uc, hut } = o;
  if (hut) return;
  const free = [[0.25, Math.max(0.3, g0 - 0.35)], [Math.min(W - 0.3, g1 + 0.35), W - 0.25]].filter(([a, b]) => b - a > 0.45);
  if (!free.length) return;
  const at = () => { const [a, b] = free[Math.floor(rand() * free.length)], w = 0.25 + rand() * Math.min(1.1, b - a - 0.2); return [a + rand() * (b - a - w), w]; };
  for (let k = 0; k < 3; k++) { const [u, w] = at(); B('plaster_damp', u, py + 0.45, ver - 0.035, u + w, py + 0.8 + rand() * 0.55, ver + 0.02); }
  for (let k = 0; k < 2; k++) { const [u] = at(), w = 0.1 + rand() * 0.14; B('plaster_streak', u, Math.max(h - 1.5 + rand() * 0.5, py + 1.45), ver - 0.09, u + w, h - 0.17, ver + 0.04); }
  if (rand() < 0.6) { const [u, w] = at(), pw = Math.min(w, 0.7); B('brick', u, py + 0.45 + rand() * 0.5, ver - 0.04, u + pw, py + 0.85 + rand() * 0.6, ver + 0.03); }
}

/** A shop's name board under the awning's edge (Tamil script stood in for by chalk strokes) and a blade of goods. */
export function nameBoard(F, o, rand) {
  const { B } = F, { W, yEdge, vf, trade } = o;
  const col = { flowers: 'cloth_green', pooja: 'cloth_maroon', brass: 'cloth_indigo', cloth: 'cloth_red', sweets: 'stucco_saffron', grain: 'cloth_brown', coconut: 'cloth_green' }[trade] ?? 'cloth_red';
  B(col, 0.08, yEdge - 0.66, vf - 0.045, W - 0.08, yEdge - 0.22, vf - 0.005);
  let u = 0.3;
  while (u < W - 0.55) { const w = 0.1 + rand() * 0.2; B('chalk', u, yEdge - 0.56 + rand() * 0.08, vf - 0.08, u + w, yEdge - 0.36 - rand() * 0.04, vf - 0.035); u += w + 0.07 + rand() * 0.14; if (rand() < 0.16) u += 0.2; }
}

/** The thinnai's small things, by chance: kudam water pot, firewood, a cot, the stone grinder, a line of washing, toranam. */
export function thinnai(F, o, rand) {
  const { B, bag } = F, { W, py, ver, uc, yb, g1, hut } = o;
  if (hut || o.shop) return;
  const rr = rand();
  const [px, , pz] = F.P(0.5 + rand() * 0.3, 0, ver - 0.4); vessel(bag, px, py, pz, 1.3, 'terracotta');
  if (rr < 0.3) {          // the cot (charpai): a timber frame on four legs, a rope net
    const u = W - 1.9, v = 0.7;
    B('timber', u, py + 0.34, v, u + 1.7, py + 0.4, v + 0.85); B('rope_fibre', u + 0.06, py + 0.4, v + 0.06, u + 1.64, py + 0.42, v + 0.79);
    for (const [a, b] of [[0, 0], [1.62, 0], [0, 0.77], [1.62, 0.77]]) B('timber', u + a, py, v + b, u + a + 0.08, py + 0.34, v + b + 0.08);
  } else if (rr < 0.5) {   // firewood stacked against the end of the wall
    const u = W - 0.75;
    for (let r = 0; r < 4; r++) for (let k = 0; k < 5 - r; k++) B('timber', u - 0.02 + k * 0.13 + r * 0.06, py + r * 0.11, ver - 0.62, u + 0.09 + k * 0.13 + r * 0.06, py + 0.11 + r * 0.11, ver - 0.04);
  } else if (rr < 0.62) {  // the stone grinder and a mortar
    const [gx, , gz] = F.P(W - 0.8, 0, ver - 0.5); bag.add(G, lathe([[0.001, 0], [0.26, 0], [0.26, 0.14], [0.001, 0.16]], 9, null, gx, py, gz));
    const [mx, , mz] = F.P(W - 1.5, 0, ver - 0.4); bag.add(G, lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.2], [0.07, 0.24]], 8, null, mx, py, mz));
  }
  if (rand() < 0.28) {     // washing on a line between the first two posts
    const nb = Math.max(1, 2 * Math.round((W / 2.5 - 1) / 2) + 1), ua = 0.25, ub = 0.25 + (W - 0.5) / nb;
    B('rope_fibre', ua, 2.15, 0.27, ub, 2.17, 0.29);
    const cols = ['cloth_white', 'cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'];
    strip(F, cols[Math.floor(rand() * 5)], ua + 0.2, 2.17, 0.28, 0.75, 0.95); if (ub - ua > 2.3) strip(F, 'cloth_white', ua + 1.2, 2.17, 0.28, 0.6, 1.2);
  }
  if (!o.shop) for (let i = 0; i < 6; i++) strip(F, 'stucco_leaf', uc - 0.5 + i * 0.2, 2.3, ver - 0.17, 0.07, 0.24 + (i % 2) * 0.08);   // mango-leaf toranam
  void yb; void g1;
}

const SHELF = {
  cloth: ['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_blue'],
  flowers: ['cloth_white', 'cloth_green', 'cloth_red'], brass: ['bronze', 'gilt_bronze', 'bronze'], grain: ['sacking', 'cloth_brown', 'stucco_saffron', 'cloth_red'],
  pooja: ['hide_brown', 'cloth_white', 'cloth_red', 'stucco_saffron'], sweets: ['stucco_saffron', 'cloth_brown', 'cloth_white'], coconut: ['hide_brown', 'stucco_leaf'],
};

/** The furnished room: a shop's shelves, stock and the cashier's seat; a house's mat, cot, chest, shelf, god's niche, hearth. */
export function furnish(F, o, rand, lightAt) {
  const { W, B, C, bag } = F, { py, v0, vs, h, g0, shop, trade, el } = o, ctx = o.ctx;
  const U0 = TH, U1 = W - TH, vm = (v0 + vs) / 2, doorRight = g0 > W / 2;
  const lamp = (u, y, v) => { const [x, , z] = F.P(u, 0, v); if (lightAt) ctx.lights.push({ at: [x, y, z], color: '#ffb46b', intensity: 3.5, distance: 7 }); };
  if (shop) {
    const cols = SHELF[trade] ?? SHELF.cloth;
    for (const [ua, ub, sg] of [[U0, U0 + 0.42, 1], [U1 - 0.42, U1, -1]]) {
      B('wood_dark', ua, py, v0 + 0.25, ub, py + 0.72, vs - 0.25); C(ua, v0 + 0.25, ub, vs - 0.25, py, py + 0.76);
      for (const y of [py + 0.72, py + 1.35]) {
        B('timber', ua, y, v0 + 0.25, ub, y + 0.04, vs - 0.25);
        let v = v0 + 0.4, i = 0;
        while (v < vs - 0.6) {
          const w = 0.3 + rand() * 0.2, c = cols[(i++ + Math.floor(rand() * 3)) % cols.length], hh = 0.18 + rand() * 0.2;
          if (trade === 'brass') { const [x, , z] = F.P((ua + ub) / 2, 0, v + w / 2); vessel(bag, x, y + 0.04, z, 0.55 + rand() * 0.25, c); }
          else B(c, sg > 0 ? ua + 0.05 : ub - 0.34, y + 0.04, v, sg > 0 ? ua + 0.34 : ub - 0.05, y + 0.04 + hh, v + w);
          v += w + 0.1 + rand() * 0.12;
        }
      }
    }
    // the cashier's seat against the partition: a low platform, a white mattress, a bolster, a cash box and a ledger
    const cu = doorRight ? W * 0.36 : W * 0.64;
    B('timber', cu - 1.1, py, vs - 1.05, cu + 1.1, py + 0.2, vs - 0.02); C(cu - 1.1, vs - 1.05, cu + 1.1, vs - 0.02, py, py + 0.22);
    B('cloth_white', cu - 1.0, py + 0.2, vs - 0.98, cu + 1.0, py + 0.26, vs - 0.06); B('cloth_red', cu - 0.9, py + 0.26, vs - 0.3, cu - 0.2, py + 0.44, vs - 0.08);
    B('wood_dark', cu + 0.35, py + 0.26, vs - 0.7, cu + 0.85, py + 0.5, vs - 0.3); B('cloth_brown', cu - 0.4, py + 0.26, vs - 0.75, cu - 0.05, py + 0.32, vs - 0.45);
    B('timber', U0, py + 1.25, vs - 0.34, U1, py + 1.29, vs);
    for (let u = U0 + 0.5; u < U1 - 0.4; u += 0.5 + rand() * 0.2) { const [x, , z] = F.P(u, 0, vs - 0.2); vessel(bag, x, py + 1.29, z, 0.5, rand() < 0.6 ? 'bronze' : 'terracotta'); }
    // the stock of the trade on the floor, on the side away from the door
    const su = doorRight ? [U0 + 0.8, W * 0.46] : [W * 0.54, U1 - 0.8];
    for (let k = 0; k < 3; k++) {
      const u = su[0] + (k + 0.5) * (su[1] - su[0]) / 3, v = v0 + 1.0 + (k % 2) * 0.8, [x, , z] = F.P(u, 0, v);
      if (trade === 'grain') { B('sacking', u - 0.3, py, v - 0.2, u + 0.3, py + 0.75, v + 0.2); B('sacking', u - 0.26, py + 0.75, v - 0.18, u + 0.26, py + 1.0, v + 0.18); }
      else if (trade === 'cloth') { B(cols[k % cols.length], u - 0.4, py, v - 0.3, u + 0.4, py + 0.5 + k * 0.1, v + 0.3); B('cloth_white', u - 0.36, py + 0.5 + k * 0.1, v - 0.27, u + 0.36, py + 0.62 + k * 0.1, v + 0.27); }
      else if (trade === 'flowers' || trade === 'coconut') { bag.add('wicker', lathe([[0.3, 0], [0.4, 0.14], [0.4, 0.3], [0.001, 0.3]], 8, null, x, py, z)); dome(bag, cols[k % cols.length], x, py + 0.24, z, 0.37, 0.3); }
      else if (trade === 'sweets') { B('brick', u - 0.4, py, v - 0.3, u + 0.4, py + 0.4, v + 0.3); bag.add('bronze', lathe([[0.001, 0], [0.3, 0.08], [0.4, 0.25], [0.36, 0.28], [0.001, 0.12]], 10, null, x, py + 0.38, z)); }
      else vessel(bag, x, py, z, 1.5 + k * 0.1, trade === 'brass' ? 'bronze' : 'terracotta');
    }
    // the hanging lamp and the scale
    const [hx, , hz] = F.P(W / 2, 0, vm);
    bag.add('bronze', lathe([[0.001, 0], [0.15, 0.04], [0.17, 0.12], [0.001, 0.17]], 8, null, hx, h - 1.02, hz)); B('bronze', W / 2 - 0.008, h - 0.85, vm - 0.008, W / 2 + 0.008, h - 0.5, vm + 0.008); bag.add('lamp_glass', lathe([[0.001, 0], [0.03, 0.02], [0.001, 0.08]], 5, null, hx, h - 1.0, hz));
    lamp(W / 2, h - 1.1, vm);
    return;
  }
  // the house: the hall
  const chestU = (rand() < 0.5);
  { const a = chestU ? U0 : U1 - 0.55, b = a + 0.55; B('wood_dark', a, py, v0 + 0.4, b, py + 0.55, v0 + 1.5); B('cloth_ochre', a + 0.04, py + 0.55, v0 + 0.5, b - 0.04, py + 0.62, v0 + 1.4); C(a, v0 + 0.4, b, v0 + 1.5, py, py + 0.62); }
  { const a = chestU ? U1 - 0.95 : U0 + 0.05, v = v0 + 0.9;      // the cot on the other side
    B('timber', a, py + 0.34, v, a + 0.9, py + 0.4, v + 1.75); B('rope_fibre', a + 0.06, py + 0.4, v + 0.06, a + 0.84, py + 0.42, v + 1.69);
    for (const [p, q] of [[0, 0], [0.82, 0], [0, 1.67], [0.82, 1.67]]) B('timber', a + p, py, v + q, a + p + 0.08, py + 0.34, v + q + 0.08);
    C(a, v, a + 0.9, v + 1.75, py, py + 0.5); }
  const mu = W / 2 + (chestU ? 0.6 : -2.2) * (W > 6 ? 1 : 0.7);
  B('reed_mat', mu, py, vm - 0.6, mu + 1.7, py + 0.02, vm + 0.9); for (let k = 0; k < 2; k++) { const [x, , z] = F.P(mu + 0.4 + k * 0.7, 0, vm + 0.15); bag.add('bronze', lathe([[0.001, 0], [0.13, 0.01], [0.15, 0.04], [0.001, 0.03]], 8, null, x, py + 0.02, z)); }
  B('timber', U0 + 0.3, py + 0.9, vs - 0.3, U1 - 0.3, py + 0.94, vs);     // a shelf of vessels on the back wall
  for (let u = U0 + 0.6; u < U1 - 0.5; u += 0.5) { const [x, , z] = F.P(u, 0, vs - 0.15); vessel(bag, x, py + 0.94, z, 0.5 + rand() * 0.2, rand() < 0.5 ? 'bronze' : 'terracotta'); }
  for (const [k, c] of [[-1, 'stucco_rose'], [0, 'stucco_sky'], [1, 'stucco_saffron']]) if (W / 2 + k * 0.85 > U0 + 0.5 && W / 2 + k * 0.85 < U1 - 0.5) { const u = W / 2 + k * 0.85; B('gilt_bronze', u - 0.32, py + 1.25, vs - 0.07, u + 0.32, py + 2.0, vs); B(c, u - 0.26, py + 1.31, vs - 0.1, u + 0.26, py + 1.94, vs - 0.07); B('gilt_bronze', u - 0.08, py + 1.5, vs - 0.12, u + 0.08, py + 1.75, vs - 0.1); }
  { const [x, , z] = F.P(W / 2, 0, vs - 0.25); lampDish(bag, x, py + 0.94, z); lamp(W / 2, py + 1.05, vs - 0.3); }
  for (let k = 0; k < 3; k++) { const [x, , z] = F.P(U0 + 0.35 + (k % 2) * 0.4, 0, vs - 0.45 - Math.floor(k / 2) * 0.5); vessel(bag, x, py, z, 1.5, 'terracotta'); }
  // the hearth in the corner: a clay stove with its pot, the soot above, firewood
  { const a = U1 - 1.15, b = U1 - 0.3; B('brick', a, py, vs - 0.95, b, py + 0.42, vs - 0.1); C(a, vs - 0.95, b, vs - 0.1, py, py + 0.5); const [x, , z] = F.P((a + b) / 2, 0, vs - 0.52); vessel(bag, x, py + 0.42, z, 1.0, 'bronze'); B('bitumen', a - 0.1, py + 0.5, vs - 0.035, b + 0.05, py + 1.7, vs);
    for (let r = 0; r < 3; r++) B('timber', a - 0.65, py + r * 0.1, vs - 0.9, a - 0.1, py + 0.1 + r * 0.1, vs - 0.8 + (r % 2) * 0.1); }
  strip(F, ['cloth_red', 'cloth_white', 'cloth_indigo'][el.seed % 3], W / 2 - 1.4, h - 0.56, vm + 0.2, 0.55, 0.95);
}
