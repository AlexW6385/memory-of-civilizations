// The life of the great streets (docs/settlements/alexandria.md §17): the stalls of the hawkers along the Soma street and the Canopic Way,
// porters with a load slung on a pole, a litter with its bearers, a fountain-house of the street, an honorific statue on its base. Built
// into the near plans (figures included), with materials the plans already hold. All forms [inferred] from Hellenistic street usage;
// the stalls' words are the trade words of script.js, the king's style on the statue's base is the decree's head (script.js DECREE).

import { box, lathe, rod } from '../../core/geom.js';
import { inscribe, layout, SHOP_WORD, DECREE } from './script.js';
import { rng, pick, amphora, basket, sack, awning, lampBracket } from './dress.js';

export const STALL_TRADES = ['wine', 'oil', 'fish', 'bread', 'cloth', 'pottery', 'grain', 'papyrus'];
/** The one build of a standing figure the near plans of the houses already use (house.js), so the figures share meshes with the houses' keepers: only dress colour, skin tone and beard vary. */
const STAND = (rand, seed, extra = {}) => ({ seed, dress: 'robe', cloth: pick(rand, GARB), skin: rand() < 0.3 ? 'skin_dark' : 'skin_medium', hair: 'short', beard: rand() < 0.5, pose: 'stand', ...extra });
const GARB = ['cloth_white', 'linen', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'cloth_red'];

/** A local frame: u along the front, v out from the back (the customers' side), on the axis `out` ([±1, 0] or [0, ±1]). */
function frameOf(at, out) {
  const al = [-out[1], out[0]];
  const P = (u, v) => [at[0] + al[0] * u + out[0] * v, at[1] + al[1] * u + out[1] * v];
  return { P, al, out };
}
function boxer(F, bag, col, y) {
  return (u0, v0, u1, v1, y0, y1, m, solid = false) => {
    const a = F.P(u0, v0), b = F.P(u1, v1), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    if (m) bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3]));
    if (solid) col.rect(r, y + y0, y + y1);
  };
}

/** alx_stall: { at, out, y, trade, seed } — a hawker's stall at the street's edge: a trestle counter under a sloping awning, goods by the trade, the keeper behind it, a customer, a lamp. */
function stall(el, ctx) {
  if (el.simple) return;
  const { bag, col } = ctx, y = el.y ?? 0, F = frameOf(el.at, el.out), B = boxer(F, bag, col, y), rand = rng(el.seed ?? 3), trade = el.trade ?? 'bread';
  // counter: a board on trestles, a back rail, the posts
  B(-1.3, -0.1, 1.3, 0.7, 0.84, 0.9, 'timber');
  for (const u of [-1.15, 1.15]) for (const v of [0.05, 0.55]) B(u - 0.04, v - 0.04, u + 0.04, v + 0.04, 0, 0.84, 'wood_dark');
  B(-1.3, -0.1, 1.3, 0.7, 0, 0.9, null, true);
  for (const u of [-1.4, 1.4]) { B(u - 0.05, -0.75, u + 0.05, -0.65, 0, 2.5, 'timber'); const [px, pz] = F.P(u, -0.7); col.circle(px, pz, 0.07, y, y + 2.5); }
  B(-1.45, -0.75, 1.45, -0.65, 2.3, 2.4, 'timber');
  const wall = F.out[0] > 0 ? 'x0' : F.out[0] < 0 ? 'x1' : F.out[1] > 0 ? 'z0' : 'z1', a = F.P(-1.55, -0.9), b = F.P(1.55, 1.05);
  const aw = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  awning(bag, aw, wall, y + 2.55, y + 2.15, ['cloth_ochre', 'cloth_red', 'linen', 'cloth_indigo', 'cloth_white', 'cloth_red'][Math.floor(rand() * 6)], col);
  // the trade's board on the front edge, in bronze letters
  if (SHOP_WORD[trade]) {
    const word = [SHOP_WORD[trade]], h = Math.min(0.2, 2.2 / layout(word[0], 0.2).width);
    B(-1.15, 1.02, 1.15, 1.06, 1.78, 2.14, 'plaster_white');
    const [bx, bz] = F.P(0, 1.06); inscribe(bag, word, { at: [bx, bz], n: F.out, y: y + 2.1, h, mat: 'bronze', pitch: 0.2 });
  }
  // the goods
  const T = (u, v, dy = 0.9) => { const [x, z] = F.P(u, v); return [x, y + dy, z]; };
  if (trade === 'wine' || trade === 'oil') {
    for (let k = 0; k < 5; k++) { const [x, yy, z] = T(-1.0 + k * 0.5, 0.35 + (k % 2) * 0.1); amphora(bag, x, yy, z, { s: 0.55, seg: 6, mat: k % 2 ? 'terracotta' : 'stucco_siena', rot: rand() * 6 }); }
    for (const u of [-1.9, 1.9]) { const [x, yy, z] = T(u, 0.2, 0); amphora(bag, x, y, z, { s: 1, seg: 6, tilt: 0.06 * (u > 0 ? 1 : -1), rot: u }); col.circle(x, z, 0.3, y, y + 0.9); }
  } else if (trade === 'fish') {
    for (let k = 0; k < 4; k++) { const [x, yy, z] = T(-0.95 + k * 0.62, 0.35); basket(bag, x, yy, z, 0.26, 0.2, 'sacking'); }
  } else if (trade === 'bread') {
    for (let k = 0; k < 4; k++) { const [x, yy, z] = T(-0.95 + k * 0.62, 0.35); basket(bag, x, yy, z, 0.27, 0.2, 'sacking'); }
  } else if (trade === 'cloth') {
    [['cloth_red', -0.95], ['cloth_indigo', -0.35], ['cloth_white', 0.25], ['cloth_ochre', 0.85]].forEach(([m, u], i) => { const n = 2 + (i % 3); for (let q = 0; q < n; q++) B(u - 0.22, 0.12, u + 0.22, 0.58, 0.9 + q * 0.07, 0.97 + q * 0.07, m); });
    B(-1.2, -0.62, 1.2, -0.6, 1.0, 2.2, 'cloth_red');
  } else if (trade === 'pottery') {
    for (let k = 0; k < 6; k++) { const [x, yy, z] = T(-1.05 + k * 0.42, 0.2 + (k % 3) * 0.14); amphora(bag, x, yy, z, { s: 0.35 + (k % 3) * 0.08, seg: 6, mat: k % 2 ? 'terracotta' : 'terracotta', rot: k }); }
    for (const u of [-1.9, 1.9]) { const [x, , z] = T(u, 0.1, 0); amphora(bag, x, y, z, { s: 0.9, seg: 6, mat: 'terracotta', rot: u }); col.circle(x, z, 0.3, y, y + 0.9); }
  } else if (trade === 'grain') {
    for (let k = 0; k < 4; k++) { const [x, , z] = T(-1.0 + k * 0.62, 0.2, 0); sack(bag, x, y, z, k * 1.3); }
    { const [x, yy, z] = T(0.2, 0.35); basket(bag, x, yy, z, 0.3, 0.22, 'cloth_ochre'); }
    for (const u of [-1.9, 1.9]) { const [x, , z] = T(u, 0.2, 0); sack(bag, x, y, z, u); sack(bag, x + 0.2, y, z + 0.1, u + 1); col.circle(x, z, 0.35, y, y + 0.55); }
  } else {                                                                              // papyrus: rolls laid in a rack, a few unrolled
    for (let k = 0; k < 6; k++) { const [x, yy, z] = T(-1.0 + k * 0.4, 0.3); const [x2, , z2] = T(-1.0 + k * 0.4, 0.5); bag.add('linen', rod([x, yy + 0.05, z], [x2, yy + 0.05, z2], 0.04, 6)); }
    B(-1.1, 0.12, -0.2, 0.22, 0.9, 1.05, 'linen');
  }
  // the lamp on the counter's corner (lit in the evening: the halo is made in nightlight.js)
  { const [x, yy, z] = T(1.1, 0.55); bag.add('bronze', lathe([[0.001, 0], [0.06, 0.02], [0.07, 0.07], [0.04, 0.1], [0.001, 0.1]], 6, null, x, yy, z)); bag.add('flame', lathe([[0.001, 0], [0.02, 0.01], [0.001, 0.06]], 5, null, x, yy + 0.1, z)); }
}

/** alx_porters: { at, dir, y, seed } — two porters at a pole between their shoulders with amphorae slung from it, walking along `dir` (an axis). */
function porters(el, ctx) {
  if (el.simple) return;
  const { bag } = ctx, y = el.y ?? 0, F = frameOf(el.at, el.dir), rand = rng(el.seed ?? 5);
  // F.out is the way they go (v); the pole runs along it
  const p0 = F.P(0, -1.25), p1 = F.P(0, 1.25);
  bag.add('timber', rod([p0[0], y + 1.42, p0[1]], [p1[0], y + 1.42, p1[1]], 0.035, 5));
  for (const t of [-0.3, 0.3]) {
    const [x, z] = F.P(0, t);
    bag.add('rope_fibre', rod([x, y + 1.42, z], [x, y + 1.05, z], 0.012, 3));
    amphora(bag, x, y + 0.45, z, { s: 0.95, seg: 6, mat: t < 0 ? 'terracotta' : 'stucco_siena', rot: rand() * 6 });
  }
}

/** alx_litter: { at, dir, y, seed } — a litter on two poles, a seated passenger on the cushions under a canopy, four bearers and a man before with a staff. */
function litter(el, ctx) {
  if (el.simple) return;
  const { bag, col } = ctx, y = el.y ?? 0, F = frameOf(el.at, el.dir), B = boxer(F, bag, col, y);
  for (const u of [-0.5, 0.5]) { const a = F.P(u, -1.9), b = F.P(u, 1.9); bag.add('timber', rod([a[0], y + 1.0, a[1]], [b[0], y + 1.0, b[1]], 0.035, 5)); }
  B(-0.55, -1.0, 0.55, 1.0, 1.02, 1.08, 'timber');
  B(-0.5, -0.95, 0.5, 0.95, 1.08, 1.2, 'cloth_red');
  B(-0.5, -0.95, 0.5, -0.8, 1.2, 1.62, 'cloth_red');
  for (const u of [-0.52, 0.52]) for (const v of [-0.98, 0.98]) B(u - 0.025, v - 0.025, u + 0.025, v + 0.025, 1.08, 2.15, 'wood_dark');
  B(-0.6, -1.05, 0.6, 1.05, 2.15, 2.19, 'cloth_white');
  B(-0.6, -1.05, 0.6, -1.0, 1.7, 2.15, 'cloth_white'); B(-0.6, 1.0, 0.6, 1.05, 1.9, 2.15, 'cloth_white');
  B(-0.62, -1.07, 0.62, -1.03, 2.1, 2.15, 'egyptian_blue'); B(-0.62, 1.03, 0.62, 1.07, 2.1, 2.15, 'egyptian_blue');
  B(-0.55, -1.0, 0.55, 1.0, 1.0, 2.2, null, true);
}

/**
 * alx_fountain: { at (middle of the back wall's street face), out, y } — a fountain-house of the street: a back wall with a painted band and two lion-head spouts,
 * a stone basin in front, a roof on two columns over it; women with jars wait their turn; a lamp on the wall. 5.2 × 3 m.
 */
function fountain(el, ctx) {
  if (el.simple) return;
  const { bag, col } = ctx, y = el.y ?? 0, F = frameOf(el.at, el.out), B = boxer(F, bag, col, y);
  B(-2.6, -0.7, 2.6, 0.0, 0, 3.4, 'plaster_white', true);
  B(-2.6, 0.0, 2.6, 0.06, 2.75, 3.05, 'egyptian_blue');
  for (const u of [-2.55, 2.55]) B(u - 0.12, 0.0, u + 0.12, 0.2, 0.2, 3.4, 'limestone');
  B(-2.7, -0.8, 2.7, 2.2, 3.4, 3.7, 'limestone');
  B(-2.6, 0.0, 2.6, 2.1, 3.7, 3.82, 'timber');
  B(-2.6, 0.0, 2.6, 0.5, 0, 0.2, 'limestone');
  for (const u of [-2.45, 2.45]) { const [x, z] = F.P(u, 1.95); bag.add('limestone', lathe([[0.26, 0], [0.22, 0.12], [0.19, 0.2], [0.17, 3.0], [0.2, 3.1], [0.26, 3.2], [0.26, 3.4]], 10, null, x, y, z)); col.circle(x, z, 0.26, y, y + 3.4); }
  // the basin: a rim round the water
  B(-2.0, 0.55, 2.0, 0.8, 0, 0.8, 'limestone', true); B(-2.0, 1.5, 2.0, 1.75, 0, 0.8, 'limestone', true);
  B(-2.0, 0.8, -1.75, 1.5, 0, 0.8, 'limestone', true); B(1.75, 0.8, 2.0, 1.5, 0, 0.8, 'limestone', true);
  B(-1.75, 0.8, 1.75, 1.5, 0.6, 0.66, 'water');
  B(-2.1, 0.5, 2.1, 1.85, 0.8, 0.88, 'limestone');
  for (const u of [-0.9, 0.9]) {
    const [x, z] = F.P(u, 0.14); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.0], [0.14, 0.08], [0.1, 0.22], [0.001, 0.22]], 7, null, x, y + 1.25, z));
    B(u - 0.02, 0.14, u + 0.02, 0.2, 0.7, 1.28, 'water');
  }
  lampBracket(bag, ...F.P(1.8, 0.06).flatMap((v, i) => (i === 0 ? [v] : [y + 2.6, v])), F.out[0], F.out[1]);
  for (let k = 0; k < 3; k++) { const [x, z] = F.P(-1.5 + k * 0.5, 2.55); amphora(bag, x, y, z, { s: 0.5, seg: 6, mat: 'terracotta', rot: k }); }
}

/** alx_statue: { at, y, rot } — an honorific statue of the king on a stepped base: a bronze standing in the cloak with a spear, the style of the king cut in the pedestal. */
function statue(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot), P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const R = (u0, v0, u1, v1, y0, y1, m, solid = false) => { const g = box(u0, y + y0, v0, u1, y + y1, v1); g.rotateY(rot); g.translate(x, 0, z); bag.add(m, g); if (solid) { const a = P(u0, v0), b = P(u1, v1); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y + y0, y + y1); } };
  R(-1.25, -1.25, 1.25, 1.25, 0, 0.2, 'limestone'); R(-1.05, -1.05, 1.05, 1.05, 0.2, 0.4, 'limestone', true);
  R(-0.75, -0.75, 0.75, 0.75, 0.4, 1.85, 'limestone', true); R(-0.85, -0.85, 0.85, 0.85, 1.85, 2.05, 'limestone');
  const n = [Math.sin(rot), Math.cos(rot)], [ix, iz] = P(0, 0.75);
  inscribe(bag, DECREE, { at: [ix, iz], n, y: y + 1.7, h: 0.1, mat: 'bronze', pitch: 0.2 });
  const top = y + 2.05;
  bag.add('bronze', lathe([[0.001, 0], [0.3, 0], [0.31, 0.05], [0.25, 0.9], [0.3, 1.15], [0.27, 1.35], [0.14, 1.46], [0.001, 1.48]], 9, null, x, top, z));        // the cloaked body
  bag.add('bronze', lathe([[0.001, 0], [0.075, 0.02], [0.09, 0.12], [0.07, 0.22], [0.001, 0.25]], 8, null, x, top + 1.46, z));                                  // the head
  const [ax, az] = P(0.34, 0.0);
  bag.add('bronze', rod([ax, top - 0.05, az], [ax, top + 2.2, az], 0.022, 5));                                                          // the spear
  bag.add('bronze', lathe([[0.001, 0], [0.03, 0.04], [0.001, 0.2]], 5, null, ax, top + 2.2, az));
}

/**
 * The people of the scenes, as `figure` elements of the `life` style (world x, z; y given): the keepers and customers, the porters, the bearers and the passenger, the women at the
 * fountain. Placed as life elements, they share the settlement's figure meshes and add no draw of their own (soma.js).
 */
export function crew(el) {
  const out = [], y = el.y ?? 0, mk = (at, to, extra) => ({ t: 'figure', at, y, rot: Math.atan2(-(to[0] - at[0]), -(to[1] - at[1])), ...extra });
  if (el.t === 'alx_stall') {
    const F = frameOf(el.at, el.out), rand = rng((el.seed ?? 3) * 31);
    out.push(mk(F.P(el.shift ?? 0.3, -0.35), F.P(el.shift ?? 0.3, 3), STAND(rand, (el.seed ?? 3) * 7 + 1)));
    if (rand() < 0.66) out.push(mk(F.P(-0.5, 1.7), F.P(-0.5, 0), STAND(rand, (el.seed ?? 3) * 11 + 5)));
  } else if (el.t === 'alx_porters') {
    const F = frameOf(el.at, el.dir), rand = rng((el.seed ?? 5) * 31);
    for (const t of [-1.0, 1.0]) out.push(mk(F.P(0, t), F.P(0, t + 3), STAND(rand, (el.seed ?? 5) * 3 + (t > 0 ? 1 : 0), { dress: 'loincloth', cloth: 'linen', hair: 'shaven', beard: false })));
  } else if (el.t === 'alx_litter') {
    const F = frameOf(el.at, el.dir), rand = rng((el.seed ?? 9) * 31);
    out.push({ ...mk(F.P(0, -0.2), F.P(0, 3), { seed: (el.seed ?? 9) * 5, dress: 'robe', over: 'cape', cloth: 'cloth_red', skin: 'skin_medium', hair: 'short', beard: true, pose: 'sit' }), y: y + 0.66 });
    for (const [u, v] of [[-0.5, -2.3], [0.5, -2.3], [-0.5, 2.3], [0.5, 2.3]]) out.push(mk(F.P(u, v), F.P(u, v + 3), STAND(rand, (el.seed ?? 9) * 13 + Math.round(u * 4 + v), { dress: 'tunic', cloth: 'cloth_ochre', beard: false })));
    out.push(mk(F.P(1.3, 4.0), F.P(1.3, 7), STAND(rand, (el.seed ?? 9) * 17, { carry: 'staff' })));
  } else if (el.t === 'alx_fountain') {
    const F = frameOf(el.at, el.out), rand = rng((el.seed ?? 4) * 31);
    for (const [u, v] of [[-0.8, 2.4], [0.0, 2.9], [0.9, 2.5]]) out.push(mk(F.P(u, v), F.P(u * 0.4, 0.8), STAND(rand, (el.seed ?? 4) * 19 + Math.round(u * 5), { dress: 'sheath', hair: 'long', carry: 'pot', beard: false })));
  }
  return out;
}
export const STREET_EL = { alx_stall: stall, alx_porters: porters, alx_litter: litter, alx_fountain: fountain, alx_statue: statue };
