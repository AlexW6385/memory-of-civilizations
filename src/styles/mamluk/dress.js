// The dressing of Cairo's blocks (docs/settlements/mamluk-cairo.md §13): shop fronts with their cells, mastabas and goods; the weathering
// of the lane faces; the roofs' life (dovecotes, washing, palm-stick shelters, jars); palms in the back gaps; sabats (rooms bridging a
// lane); walled yards; the Rumayla's trough, tents and trees. Built in the frame of a house of house_mamluk (u along the front,
// d outward from it), so as to sit on the houses of src/styles/vernacular/house-mamluk.js without touching them.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const dbl = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return fromTriangles(o); };

/** The frame of a house: u along the front (0…L), d outward from the front plane (negative: inward). */
function frame(el, bag, col) {
  const [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const rect = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, u1, v0, v1, ya, yb) => { const r = rect(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); return r; };
  const O = (m, u0, u1, ya, yb, d0, d1) => B(m, u0, u1, -d1, -d0, ya, yb);
  const C = (u0, u1, d0, d1, ya, yb) => col?.rect(rect(u0, -d1, u1, -d0), ya, yb);
  const at = (u, d, y) => { const p = P(u, -d); return [p[0], y, p[1]]; };
  return { L, D, P, rect, B, O, C, at, f, y: el.y ?? 0 };
}
/** The house's heights, from the same draws as house_mamluk (the first three). */
function heights(el) {
  const r = rng(el.seed || 1), n = Math.max(2, el.storeys || 2), st0 = 3.7 + r() * 0.4, stU = 3.0 + r() * 0.35, J1 = 0.5 + r() * 0.2, J2 = n > 2 && r() < 0.45 ? 0.3 : 0;
  return { n, st0, stU, J1, Jt: J1 + J2, H: st0 + (n - 1) * stU };
}

/** A date palm: the curved trunk with its ring scars, the crown of arching fronds, a hand of dates. */
export function palm(bag, x, z, h, seed, y0 = 0) {
  const r = rng(seed), lean = (r() - 0.5) * 0.9, dir = r() * 6.28, seg = 6;
  let p = [x, y0, z];
  for (let k = 1; k <= seg; k++) {
    const t = k / seg, q = [x + Math.cos(dir) * lean * t * t * h * 0.12, y0 + h * t, z + Math.sin(dir) * lean * t * t * h * 0.12];
    bag.add('palm_trunk', rod(p, q, 0.24 - 0.07 * (k - 1) / seg, 6)); p = q;
  }
  const nf = 10;
  for (let i = 0; i < nf; i++) {
    const a = i / nf * 6.28 + r() * 0.3, up = i < 3 ? 1.1 : 0.35 - (i % 3) * 0.2, len = 3.2 + r() * 0.9, ca = Math.cos(a), sa = Math.sin(a), w = 0.55;
    const pt = (s, side) => [p[0] + ca * len * s - sa * w * side * (1 - s * 0.6), p[1] + up * len * s * (1 - s * 0.9) - s * s * len * 0.2 + 0.1, p[2] + sa * len * s + ca * w * side * (1 - s * 0.6)];
    const a0 = pt(0, 0), b0 = pt(0.5, -1), b1 = pt(0.5, 1), c0 = pt(1, 0);
    bag.add('palm_leaf', dbl([...a0, ...b0, ...b1, ...b0, ...c0, ...b1]));
  }
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + r(); bag.add('wood_ochre', lathe([[0.001, 0], [0.12, 0.2], [0.001, 0.4]], 5, null, p[0] + Math.cos(a) * 0.35, p[1] - 0.5, p[2] + Math.sin(a) * 0.35)); }
}

const STRIPE = ['cloth_white', 'cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_white', 'cloth_ochre'];
/** Goods on a mastaba (u0..u1 at d out from the front) by trade. */
function goods(F, trade, u0, u1, y, rand) {
  const { O, at } = F, bag = F.bag, W = u1 - u0;
  const potM = ['terracotta', 'glaze_blue', 'glaze_green', 'pottery_dark', 'glaze_white'];
  if (trade === 'cloth') {
    for (let k = 0; k < Math.floor(W / 0.5); k++) O(['cloth_indigo', 'cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_maroon'][Math.floor(rand() * 6)], u0 + k * 0.5, u0 + k * 0.5 + 0.45, y, y + 0.3 + rand() * 0.3, 0.1, 0.55);
    for (let k = 0; k < 3; k++) { const u = u0 + 0.4 + k * (W - 0.8) / 2; O(['cloth_red', 'cloth_white', 'cloth_indigo'][k], u - 0.2, u + 0.2, y + 1.7, y + 2.5, 0.35, 0.38); }   // lengths hung from the awning
  } else if (trade === 'brass') {
    for (let k = 0; k < Math.floor(W / 0.55); k++) { const [px, , pz] = at(u0 + 0.3 + k * 0.55, -0.35, 0); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.02], [0.17, 0.2], [0.12, 0.34], [0.07, 0.4], [0.001, 0.42]], 8, null, px, y, pz)); }
    for (let k = 0; k < Math.floor(W / 0.45); k++) { const [px, , pz] = at(u0 + 0.25 + k * 0.45, -0.1, 0); bag.add('bronze', rod([px, y + 2.2, pz], [px, y + 1.3, pz], 0.008, 3)); bag.add('bronze', lathe([[0.001, 0], [0.2, 0.02], [0.22, 0.05], [0.001, 0.03]], 8, null, px, y + 1.3, pz)); }
  } else if (trade === 'pottery') {
    for (let k = 0; k < Math.floor(W / 0.45); k++) { const [px, , pz] = at(u0 + 0.25 + k * 0.45, -0.3, 0); bag.add(potM[Math.floor(rand() * 5)], lathe([[0.001, 0], [0.1, 0.02], [0.17, 0.2], [0.12, 0.36], [0.09, 0.42], [0.11, 0.45]], 8, null, px, y, pz)); if (rand() < 0.6) bag.add(potM[Math.floor(rand() * 5)], lathe([[0.001, 0], [0.09, 0.02], [0.14, 0.16], [0.08, 0.3], [0.09, 0.33]], 8, null, px, y + 0.46, pz)); }
  } else if (trade === 'lamps') {
    for (let k = 0; k < Math.floor(W / 0.5); k++) { const [px, , pz] = at(u0 + 0.3 + k * 0.5, -0.1, 0), hh = 1.6 + rand() * 0.6; bag.add('rope_fibre', rod([px, y + 2.5, pz], [px, y + hh, pz], 0.006, 3)); bag.add('lamp_glass', lathe([[0.001, 0], [0.07, 0.05], [0.1, 0.16], [0.06, 0.2], [0.07, 0.24]], 8, null, px, y + hh - 0.24, pz)); }
    for (let k = 0; k < Math.floor(W / 0.5); k++) { const [px, , pz] = at(u0 + 0.3 + k * 0.5, -0.35, 0); bag.add('lamp_glass', lathe([[0.001, 0], [0.08, 0.02], [0.1, 0.12], [0.05, 0.2]], 8, null, px, y, pz)); }
  } else if (trade === 'grain') {
    for (let k = 0; k < Math.floor(W / 0.7); k++) { const [px, , pz] = at(u0 + 0.4 + k * 0.7, -0.35, 0); bag.add(['sacking', 'cloth_ochre', 'sacking'][k % 3], lathe([[0.001, 0], [0.26, 0.02], [0.3, 0.3], [0.2, 0.5], [0.14, 0.58], [0.001, 0.52]], 7, null, px, y, pz)); bag.add('thatch', lathe([[0.24, 0.5], [0.12, 0.62], [0.001, 0.64]], 7, null, px, y, pz)); }
  } else if (trade === 'sweets') {
    for (let k = 0; k < Math.floor(W / 0.6); k++) { const [px, , pz] = at(u0 + 0.35 + k * 0.6, -0.35, 0); bag.add('bronze', lathe([[0.001, 0], [0.26, 0.01], [0.28, 0.04], [0.001, 0.03]], 8, null, px, y, pz)); bag.add(['cloth_ochre', 'plaster_white', 'cloth_red'][k % 3], lathe([[0.001, 0.02], [0.22, 0.03], [0.16, 0.14], [0.001, 0.16]], 8, null, px, y, pz)); }
  } else if (trade === 'butcher') {
    for (let k = 0; k < Math.floor(W / 0.7); k++) { const [px, , pz] = at(u0 + 0.4 + k * 0.7, -0.2, 0); bag.add('iron', rod([px, y + 2.5, pz], [px, y + 2.0, pz], 0.008, 3)); bag.add('hide_tan', lathe([[0.001, 0], [0.1, 0.1], [0.14, 0.4], [0.08, 0.6], [0.001, 0.62]], 7, null, px, y + 1.4, pz).scale(1, 1, 0.6)); }
  } else {   // spice: open sacks and mounds
    for (let k = 0; k < Math.floor(W / 0.6); k++) { const [px, , pz] = at(u0 + 0.35 + k * 0.6, -0.35, 0); bag.add('sacking', lathe([[0.001, 0], [0.2, 0.01], [0.23, 0.22], [0.17, 0.3]], 7, null, px, y, pz)); bag.add(['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_green'][k % 4], lathe([[0.17, 0.28], [0.08, 0.38], [0.001, 0.4]], 7, null, px, y, pz)); }
  }
}

/** The tops of the walls' faces: dust at the foot, soot, plaster fallen off to the brick, streaks under the spouts. */
function weather(F, h, rand, simple) {
  const { O, L } = F, y = F.y;
  O('plaster_grey', 0, L, y + 0.3, y + 1.1, 0.0, 0.025);                                              // the dust and splash band at the street foot
  for (let k = 0; k < 2 + Math.floor(rand() * 3); k++) { const u = rand() * (L - 1.4); O('plaster_streak', u, u + 0.5 + rand() * 0.6, y + 0.3 + rand() * 1.2, y + 2.4 + rand() * 1.0, 0.025, 0.04); }
  if (simple) return;
  const yU = y + h.st0, d = h.J1;
  for (let k = 0; k < 1 + Math.floor(rand() * 3); k++) { const u = 0.5 + rand() * (L - 2), w = 0.5 + rand() * 0.9, v = yU + 0.7 + rand() * (h.stU - 1.9); O('brick', u, u + w, v, v + 0.4 + rand() * 0.7, d, d + 0.02); }   // plaster gone
  for (const u of [L * 0.3, L * 0.7]) O('plaster_streak', u - 0.12, u + 0.12, y + h.H - 3.4, y + h.H - 0.5, h.Jt + 0.07, h.Jt + 0.09);
  if (rand() < 0.5) O('plaster_damp', 0, L, yU + 0.05, yU + 0.4, d + 0.045, d + 0.06);
}

/** cairo_dress: { rect, front, storeys, seed, y, simple } — what is added to one house of house_mamluk. */
export function cairoDress(el, { bag, col }) {
  if (el.simple) return;
  const F = frame(el, bag, col); F.bag = bag;
  const rand = rng((el.seed || 1) + 77), h = heights(el), { O, B, L, D, y } = F, yT = y + h.H;
  weather(F, h, rand, false);
  // the water-jar stand (a poor man's sabil) at the lane's foot of the wall, a hanging lantern, a mounting block, a hung cage, a dung-cake oven
  const u = 0.5 + rand() * (L - 1.4);
  if (rand() < 0.28) {
    O('wood_dark', u, u + 0.9, y + 0.8, y + 0.88, 0.0, 0.5); for (const s of [0.05, 0.8]) O('wood_dark', u + s, u + s + 0.06, y, y + 0.8, 0.4, 0.46);
    for (let k = 0; k < 2; k++) { const [px, , pz] = F.at(u + 0.25 + k * 0.4, 0.28, 0); bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.19, 0.22], [0.12, 0.42], [0.09, 0.5], [0.12, 0.54]], 8, null, px, y + 0.88, pz)); }
    O('cloth_white', u - 0.05, u + 0.95, y + 1.5, y + 1.55, 0.0, 0.7);
  }
  if (rand() < 0.35) { const uu = 0.4 + rand() * (L - 0.8), [px, , pz] = F.at(uu, 0.55, 0); O('iron', uu - 0.02, uu + 0.02, y + 2.45, y + 2.5, 0, 0.55); bag.add('lamp_glass', lathe([[0.001, 0], [0.07, 0.04], [0.08, 0.2], [0.001, 0.26]], 6, null, px, y + 2.1, pz)); }
  if (rand() < 0.2) { const uu = 0.5 + rand() * (L - 1.2); O('wood_dark', uu, uu + 0.45, y + 2.3, y + 2.75, h.J1 + 0.02, h.J1 + 0.4); O('wood_dark', uu, uu + 0.45, y + h.st0 + 1.9, y + h.st0 + 2.0, h.J1 + 0.02, h.J1 + 0.45); }   // a cage of quail hung out
  if (rand() < 0.2) { const uu = 0.5 + rand() * (L - 1.6); O('mud_plaster', uu, uu + 0.9, y, y + 0.9, 0.0, 0.8); O('opening', uu + 0.25, uu + 0.65, y + 0.3, y + 0.7, 0.8, 0.82); F.C(uu, uu + 0.9, 0, 0.8, y, y + 0.9); }   // the tannur
  // the roof: a dovecote (many houses kept pigeons), washing, the palm-stick shelter, jars along the parapet
  const rr = rand();
  if (rr < 0.16 && L > 6 && D > 6) {
    const uu = 1.0 + rand() * (L - 3.4), vv = 1.2 + rand() * (D - 3.4);
    B('plaster_white', uu, uu + 2.0, vv, vv + 2.0, yT, yT + 3.2); B('plaster_white', uu - 0.12, uu + 2.12, vv - 0.12, vv + 2.12, yT + 3.2, yT + 3.35);
    for (let r2 = 0; r2 < 4; r2++) for (let c = 0; c < 5; c++) { const w = uu + 0.2 + c * 0.38, v = yT + 0.5 + r2 * 0.62; B('opening', w, w + 0.18, vv + 2.0, vv + 2.03, v, v + 0.2); B('wood_dark', w - 0.03, w + 0.21, vv + 2.03, vv + 2.07, v - 0.04, v - 0.02); B('opening', w, w + 0.18, vv - 0.03, vv, v, v + 0.2); }
    for (let k = 0; k < 5; k++) B('wood_dark', uu - 0.1 + k * 0.55, uu - 0.06 + k * 0.55, vv - 0.05, vv + 2.05, yT + 3.35, yT + 3.8);
  } else if (rr < 0.42) {
    const uu = 1.2 + rand() * Math.max(0.1, L - 4.2), vv = D - 1.1;                                       // washing on a line along the back parapet
    for (const s of [0, 3.0]) B('wood_dark', uu + s, uu + s + 0.07, vv, vv + 0.07, yT, yT + 2.1);
    B('rope_fibre', uu, uu + 3.07, vv + 0.02, vv + 0.04, yT + 2.0, yT + 2.03);
    for (let k = 0; k < 4; k++) B(['cloth_white', 'cloth_blue', 'cloth_ochre', 'cloth_white'][k], uu + 0.2 + k * 0.7, uu + 0.75 + k * 0.7, vv, vv + 0.03, yT + 1.1 + rand() * 0.2, yT + 2.0);
  } else if (rr < 0.58) {
    const uu = 1.0 + rand() * Math.max(0.1, L - 3.4), vv = 1.4 + rand() * Math.max(0.1, D - 5);           // a shelter of palm sticks with a reed mat, jars under it
    for (const [a, b] of [[0, 0], [2, 0], [0, 1.6], [2, 1.6]]) B('palm_trunk', uu + a, uu + a + 0.08, vv + b, vv + b + 0.08, yT, yT + 1.9);
    B('reed_mat', uu - 0.1, uu + 2.2, vv - 0.1, vv + 1.8, yT + 1.9, yT + 2.0);
    for (let k = 0; k < 3; k++) { const p = F.P(uu + 0.4 + k * 0.5, vv + 0.6); bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.22, 0.25], [0.14, 0.48], [0.14, 0.52]], 8, null, p[0], yT, p[1])); }
  } else if (rr < 0.68) {
    for (let k = 0; k < Math.min(5, Math.floor(L / 1.6)); k++) { const p = F.P(0.8 + k * 1.5 + rand() * 0.4, -(-h.Jt + 0.4)); bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.16, 0.2], [0.1, 0.36], [0.08, 0.4]], 7, null, p[0], yT, p[1])); }
  }
  // a date palm in the back gap, rising over the roofs
  if (rand() < 0.14 && D > 8) { const p = F.P(rand() * L, -(D + 1.0)); if (Math.hypot(p[0], p[1]) < 400) { palm(bag, p[0], p[1], 8 + rand() * 5, el.seed, y); col.circle?.(p[0], p[1], 0.3, y, y + 12); } }
}

/**
 * cairo_shopfront: { rect, front, storeys, seed, trade, y, simple } — a house of the market streets: the stone storey a row of cells
 * (rab') 2.4–3 m wide, each opening under a lintel of two-coloured stones, a mastaba before it with the goods of the trade, the shutter
 * folded up as a flap over it, a striped awning on poles on every second cell, the door to the stair between; above it the
 * plastered storeys on their corbels with mashrabiyas, as the house; the roof behind its parapet.
 */
export function cairoShopfront(el, { bag, col }) {
  const F = frame(el, bag, col); F.bag = bag;
  const rand = rng(el.seed || 1), h = heights(el), { O, B, L, D, y } = F, simple = !!el.simple, trade = el.trade || 'spice';
  const wall = simple ? 'plaster' : el.plaster > 0.75 ? 'plaster_white' : el.plaster > 0.3 ? 'plaster' : 'mud_plaster', yU = y + h.st0, yT = y + h.H;
  B('limestone', -0.08, L + 0.08, -0.08, D + 0.08, y - 0.8, y + 0.3);
  B('limestone_yellow', 0, L, 0, D, y + 0.3, yU); col.rect(F.rect(0, 0, L, D), y - 0.8, y + h.H);
  const dm = L > 7 ? 0.8 : -1, c0 = dm > 0 ? 1.6 : 0.3, N = Math.max(2, Math.floor((L - c0 - 0.3) / 2.8)), cw = (L - c0 - 0.3) / N;
  const cs = Array.from({ length: N }, (_, i) => [c0 + i * cw, c0 + (i + 1) * cw]);
  cs.forEach(([a, b], i) => {
    const w = b - a - 0.5, m = (a + b) / 2, u0 = m - w / 2, u1 = m + w / 2;
    O('opening', u0, u1, y + 0.55, y + 2.7, 0.0, 0.03);
    for (let k = 0; k < 7; k++) O(k % 2 ? 'marble_dark' : 'limestone', u0 - 0.1 + k * (w + 0.2) / 7, u0 - 0.1 + (k + 1) * (w + 0.2) / 7, y + 2.7, y + 3.05, 0, 0.06);
    if (simple) return;
    O('limestone', u0 - 0.1, u0, y + 0.3, y + 2.7, 0, 0.06); O('limestone', u1, u1 + 0.1, y + 0.3, y + 2.7, 0, 0.06);
    O('limestone', u0 - 0.1, u1 + 0.1, y + 0.3, y + 0.58, 0, 0.62); F.C(u0 - 0.1, u1 + 0.1, 0, 0.62, y, y + 0.58);   // the mastaba
    O('wood_dark', u0, u1, y + 2.35, y + 2.7, 0.04, 0.12);                                                    // the shutter folded up
    for (let k = 1; k < 4; k++) O('wood_dark', u0 + k * w / 4 - 0.02, u0 + k * w / 4 + 0.02, y + 0.58, y + 2.35, 0.03, 0.06);   // the folded boards' ribs, a back screen of laths
    goods(F, trade, u0, u1, y + 0.58, rand);
    if (i % 2 === 0) {
      for (let k = 0; k < 6; k++) O(STRIPE[k], u0 - 0.2 + k * (w + 0.4) / 6, u0 - 0.2 + (k + 1) * (w + 0.4) / 6, y + 2.78 - k * 0.0, y + 2.82, 0.0, 1.5);
      for (const s of [u0 - 0.15, u1 + 0.1]) { O('wood_dark', s, s + 0.07, y, y + 2.8, 1.4, 1.47); F.C(s, s + 0.07, 1.4, 1.47, y, y + 2.8); }
    }
  });
  // the door to the stair, between two cells, a lamp over it
  if (!simple && dm > 0) { O('opening', dm - 0.4, dm + 0.4, y + 0.3, y + 2.4, 0, 0.03); O('wood_painted', dm - 0.38, dm + 0.38, y + 0.3, y + 2.3, 0.03, 0.07); O('limestone', dm - 0.5, dm + 0.5, y + 2.4, y + 2.6, 0, 0.08); }
  // the upper storeys: the plaster stepped out on corbels, the mashrabiya, windows, the cornice, the parapet
  const J = h.Jt;
  B(wall, 0, L, -J, D, yU, yT);
  if (!simple) {
    const nc = Math.max(3, Math.round(L / 0.8));
    for (let i = 0; i < nc; i++) { const uc = (i + 0.5) * L / nc; for (let k = 0; k < 3; k++) O('limestone', uc - 0.14, uc + 0.14, yU - 0.66 + k * 0.22, yU - 0.44 + k * 0.22, 0, h.J1 * (k + 1) / 3); }
    O('wood_dark', 0, L, yU - 0.06, yU + 0.14, h.J1 - 0.02, h.J1 + 0.05);
  }
  const bw = Math.min(3.0, L - 1.8) * 0.9, bm = L * (0.35 + rand() * 0.3), a = bm - bw / 2, b = bm + bw / 2;
  for (let s = 1; s < h.n; s++) {
    const yo = y + h.st0 + (s - 1) * h.stU + 0.3, Df = h.J1;
    if (s === 1 && L >= 4.6) {
      if (simple) O('koshi', a, b, yo, yo + 2.2, Df, Df + 0.6);
      else {
        for (const uc of [a + 0.12, bm, b - 0.12]) for (let k = 0; k < 3; k++) O('wood_dark', uc - 0.07, uc + 0.07, yo - 0.62 + k * 0.2, yo - 0.42 + k * 0.2, Df, Df + 0.2 * (k + 1));
        O('wood_painted', a, b, yo + 0.05, yo + 0.42, Df + 0.54, Df + 0.6); O('koshi', a + 0.08, b - 0.08, yo + 0.42, yo + 1.95, Df + 0.55, Df + 0.59);
        for (const s2 of [a, b]) O('koshi', s2 === a ? a : b - 0.04, s2 === a ? a + 0.04 : b, yo + 0.42, yo + 1.95, Df, Df + 0.52);
        O('wood_dark', a - 0.1, b + 0.1, yo + 1.95, yo + 2.1, Df, Df + 0.75);
      }
    }
    for (let k = 0; k < Math.max(2, Math.floor(L / 2.4)); k++) {
      const uc = (k + 0.5) * L / Math.max(2, Math.floor(L / 2.4)); if (s === 1 && uc + 0.7 > a && uc - 0.7 < b) continue; if (rand() < 0.2) continue;
      const w = 0.9, yw = y + h.st0 + (s - 1) * h.stU + 0.9, dd = s === 1 ? h.J1 : h.Jt;
      O(simple ? 'koshi' : 'wood_dark', uc - w / 2 - 0.05, uc + w / 2 + 0.05, yw - 0.1, yw, dd, dd + 0.37); O('koshi', uc - w / 2, uc + w / 2, yw, yw + 1.25, dd + 0.28, dd + 0.31); O('wood_dark', uc - w / 2 - 0.08, uc + w / 2 + 0.08, yw + 1.25, yw + 1.35, dd, dd + 0.4);
    }
  }
  if (!simple) { O('wood_dark', 0, L, yT - 0.42, yT - 0.3, J, J + 0.05); O(wall, 0, L, yT - 0.3, yT, J, J + 0.14); }
  const par = 1.1, t = 0.25;
  for (const [u0, u1, v0, v1] of [[0, L, -J, -J + t], [0, L, D - t, D], [0, t, -J + t, D - t], [L - t, L, -J + t, D - t]]) B(wall, u0, u1, v0, v1, yT, yT + par);
  if (!simple) weather(F, h, rand, false);
}

/** cairo_sabat: { c:[x,z], along:'z'|'x', span, y, seed } — a room bridging the lane, on beams, its sides plaster with a lattice. */
export function cairoSabat(el, { bag }) {
  if (el.simple) return;
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.span, w = 3.0, h0 = y + 4.3, h1 = h0 + 3.0, alongZ = el.along !== 'x';
  const R = (a0, a1, b0, b1, ya, yb, m) => alongZ ? bag.add(m, box(cx - b1, ya, cz - a1, cx - b0, yb, cz - a0)) : bag.add(m, box(cx - a1, ya, cz - b1, cx - a0, yb, cz - b0));
  // a = across the lane (−s/2…s/2), b = along it (−w/2…w/2)
  R(-s / 2, s / 2, -w / 2, w / 2, h0 + 0.3, h1, 'plaster');
  for (let k = 0; k < 5; k++) R(-s / 2, s / 2, -w / 2 + 0.1 + k * (w - 0.2) / 4 - 0.07, -w / 2 + 0.1 + k * (w - 0.2) / 4 + 0.07, h0, h0 + 0.3, 'palm_trunk');
  R(-s / 2 - 0.1, s / 2 + 0.1, -w / 2 - 0.1, w / 2 + 0.1, h1, h1 + 0.2, 'limestone');
  for (const sd of [-1, 1]) { R(sd * (s / 2 - 0.06) - 0.06, sd * (s / 2 - 0.06) + 0.06, -w / 2 - 0.04, w / 2 + 0.04, h0 + 1.0, h0 + 2.6, 'wood_dark'); }
  R(-0.9, 0.9, -w / 2 - 0.08, -w / 2, h0 + 1.0, h0 + 2.4, 'koshi'); R(-0.9, 0.9, w / 2, w / 2 + 0.08, h0 + 1.0, h0 + 2.4, 'koshi');
}

/** cairo_yard: { rect, front, seed, y } — a walled yard (hosh): a mud wall, the gate, a well with its jars, a palm-stick shed, dung cakes, fodder, palms. */
export function cairoYard(el, { bag, col }) {
  const F = frame({ ...el, front: el.front || 's' }, bag, col); F.bag = bag;
  const rand = rng(el.seed || 3), { B, L, D, y } = F, g = 1.6, gu = L / 2 - g / 2, wh = 2.2, t = 0.35;
  B('mud_plaster', 0, gu, 0, t, y, y + wh); B('mud_plaster', gu + g, L, 0, t, y, y + wh); B('mud_plaster', 0, L, D - t, D, y, y + wh); B('mud_plaster', 0, t, 0, D, y, y + wh); B('mud_plaster', L - t, L, 0, D, y, y + wh);
  col.rect(F.rect(0, 0, gu, t), y, y + wh); col.rect(F.rect(gu + g, 0, L, t), y, y + wh); col.rect(F.rect(0, D - t, L, D), y, y + wh); col.rect(F.rect(0, 0, t, D), y, y + wh); col.rect(F.rect(L - t, 0, L, D), y, y + wh);
  B('limestone', gu - 0.15, gu, 0, t, y, y + wh + 0.2); B('limestone', gu + g, gu + g + 0.15, 0, t, y, y + wh + 0.2); B('wood_dark', gu - 0.15, gu + g + 0.15, 0, t, y + wh, y + wh + 0.2);
  B('ground', t, L - t, t, D - t, y, y + 0.04);
  const wp = F.P(L * 0.3, D * 0.5);
  bag.add('limestone', lathe([[0.7, 0], [0.7, 0.9], [0.5, 0.9], [0.5, 0.0]], 10, null, wp[0], y, wp[1])); col.circle(wp[0], wp[1], 0.75, y, y + 0.9);
  for (const s of [-0.7, 0.7]) bag.add('wood_dark', rod([wp[0] + s, y, wp[1]], [wp[0] + s, y + 2.0, wp[1]], 0.05, 5));
  bag.add('wood_dark', rod([wp[0] - 0.7, y + 2.0, wp[1]], [wp[0] + 0.7, y + 2.0, wp[1]], 0.04, 5));
  for (let k = 0; k < 3; k++) { const p = F.P(L * 0.3 + 1.2 + k * 0.45, D * 0.5 + 0.9); bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.02], [0.22, 0.25], [0.14, 0.5], [0.15, 0.55]], 8, null, p[0], y, p[1])); }
  const sh = [L * 0.62, D * 0.55];                                                                                // the shed
  for (const [a, b] of [[0, 0], [2.6, 0], [0, 2.2], [2.6, 2.2]]) col.rect(B('palm_trunk', sh[0] + a, sh[0] + a + 0.1, sh[1] + b, sh[1] + b + 0.1, y, y + 1.9), y, y + 1.9);
  B('thatch_palm', sh[0] - 0.2, sh[0] + 2.9, sh[1] - 0.2, sh[1] + 2.5, y + 1.9, y + 2.05); B('hide_tan', sh[0] + 0.3, sh[0] + 2.3, sh[1] + 0.4, sh[1] + 2.0, y, y + 0.08);
  for (let k = 0; k < 5; k++) { const p = F.P(L * 0.12 + k * 0.7, D * 0.8 - (k % 2) * 0.5); bag.add('mudbrick', lathe([[0.4, 0], [0.34, 0.4], [0.18, 0.7], [0.001, 0.82]], 7, null, p[0], y, p[1])); }    // dung cakes stacked
  { const p = F.P(L * 0.8, D * 0.85); bag.add('thatch', lathe([[0.9, 0], [0.8, 0.7], [0.4, 1.3], [0.001, 1.5]], 8, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.8, y, y + 1.3); }
  const pp = F.P(L * 0.15, D * 0.4); palm(bag, pp[0], pp[1], 9 + rand() * 4, el.seed + 1, y); col.circle(pp[0], pp[1], 0.3, y, y + 12);
  if (L > 9) { const pq = F.P(L * 0.85, D * 0.3); palm(bag, pq[0], pq[1], 8 + rand() * 4, el.seed + 2, y); col.circle(pq[0], pq[1], 0.3, y, y + 12); }
}

/** cairo_square: { rect, y, seed, hole } — the Rumayla's furniture: troughs, hitching posts, tents, fodder, palms and sycamores round its edge. */
export function cairoSquare(el, { bag, col }) {
  if (el.simple) return;
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed || 5), y = el.y ?? 0, ok = (x, z) => !el.keep?.some(([a, b, c, d]) => x > a && x < c && z > b && z < d);
  // troughs of stone for the horses and camels
  for (const [x, z, r] of el.troughs ?? []) { const c = Math.cos(r), s = Math.sin(r); bag.add('limestone', box(x - 2.2, y, z - 0.5, x + 2.2, y + 0.7, z + 0.5)); bag.add('water_jet', box(x - 2.0, y + 0.55, z - 0.3, x + 2.0, y + 0.58, z + 0.3)); col.rect([x - 2.2, z - 0.5, x + 2.2, z + 0.5], y, y + 0.7); void c; void s; }
  // hitching posts with their rails
  for (let k = 0; k < 6; k++) { const x = x0 + 8 + k * 3.2, z = z0 + 6; if (!ok(x, z)) continue; bag.add('wood_dark', rod([x, y, z], [x, y + 1.3, z], 0.07, 5)); if (k < 5) bag.add('wood_dark', rod([x, y + 1.1, z], [x + 3.2, y + 1.1, z], 0.04, 4)); }
  // tents of the market: a canvas on poles, a ridge, a flap
  for (const [x, z] of el.tents ?? []) {
    for (const [a, b] of [[-1.8, -1.4], [1.8, -1.4], [-1.8, 1.4], [1.8, 1.4]]) { bag.add('wood_dark', rod([x + a, y, z + b], [x + a, y + 2.0, z + b], 0.05, 5)); col.circle(x + a, z + b, 0.1, y, y + 2); }
    bag.add('wood_dark', rod([x, y, z - 1.4], [x, y + 2.8, z - 1.4], 0.06, 5)); bag.add('wood_dark', rod([x, y, z + 1.4], [x, y + 2.8, z + 1.4], 0.06, 5));
    bag.add('cloth_white', dbl([x - 2.1, y + 2.0, z - 1.6, x + 2.1, y + 2.0, z - 1.6, x, y + 2.8, z - 1.6, x - 2.1, y + 2.0, z + 1.6, x, y + 2.8, z + 1.6, x + 2.1, y + 2.0, z + 1.6]));
    bag.add('cloth_white', dbl([x - 2.1, y + 2.0, z - 1.6, x, y + 2.8, z - 1.6, x - 2.1, y + 2.0, z + 1.6, x - 2.1, y + 2.0, z + 1.6, x, y + 2.8, z - 1.6, x, y + 2.8, z + 1.6, x + 2.1, y + 2.0, z - 1.6, x, y + 2.8, z - 1.6, x + 2.1, y + 2.0, z + 1.6, x + 2.1, y + 2.0, z + 1.6, x, y + 2.8, z - 1.6, x, y + 2.8, z + 1.6]));
    for (let k = 0; k < 4; k++) bag.add(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][k], box(x - 1.2 + k * 0.6, y, z - 0.4, x - 0.7 + k * 0.6, y + 0.4, z + 0.4));
  }
  // fodder: stacks of straw and clover (berseem), the bundles tied
  for (const [x, z] of el.fodder ?? []) { bag.add('thatch', lathe([[1.1, 0], [1.0, 0.8], [0.6, 1.5], [0.001, 1.8]], 9, null, x, y, z)); col.circle(x, z, 1.0, y, y + 1.5); }
  // palms and sycamores round the edge
  for (const [x, z] of el.palms ?? []) { palm(bag, x, z, 9 + rand() * 4, Math.floor(x * 31 + z), y); col.circle(x, z, 0.3, y, y + 12); }
  for (const [x, z] of el.figs ?? []) {
    bag.add('bark_grey', lathe([[0.7, 0], [0.5, 1.2], [0.4, 2.5], [0.001, 3.0]], 8, null, x, y, z)); col.circle(x, z, 0.6, y, y + 3);
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.28; bag.add('doum_leaf', lathe([[0.001, 0], [2.6, 0.6], [3.0, 1.6], [2.0, 2.6], [0.001, 3.0]], 8, null, x + Math.cos(a) * 1.8, y + 3.2 + (k % 2) * 0.5, z + Math.sin(a) * 1.8)); }
    bag.add('doum_leaf', lathe([[0.001, 0], [3.2, 0.8], [3.6, 2.0], [2.4, 3.2], [0.001, 3.8]], 9, null, x, y + 3.8, z));
  }
}
