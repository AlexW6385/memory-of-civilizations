// The traffic of Westminster about 1870 (docs/settlements/london.md §5a): the hansom cab — two tall wheels, the
// low body with its folding doors and curved fender, the driver high on his seat at the back, one horse in the
// shafts; the knifeboard omnibus — two horses, the long back-to-back seat along the roof, the driver's box, the
// conductor on the step at the back, the rungs up to the roof, the fleet's colours and boards; the cast-iron gas
// lamp; the Thames: the penny paddle steamers with their tall funnels ringed in their route's colours, the
// dumb lighters loaded with coal, the floating pier at Westminster Bridge with its gangway.
//
// Every vehicle is drawn in its own frame (forward −z, like the figures and beasts) and turned by rot about y.

import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { animal, BEASTS } from '../../objects/animals.js';
import { figure } from '../../objects/figures.js';

/** the beasts and people of a vehicle: drawn here, or (el.riders === false) left to a plan of the life style, where
 * they are instanced with the rest of the town's figures — ridersOf(el) lists them for that */
function rider(el, ctx, e) { if (el.collect) el.collect.push(e); else if (el.riders !== false) (e.t === 'animal' ? animal : figure)(e, ctx); }
const NULL_CTX = { bag: { add() {} }, col: { circle() {}, rect() {}, floor() {}, segment() {} } };
export function ridersOf(el) {
  const out = [], f = { hansom_cab: hansomCab, omnibus, paddle_steamer: paddleSteamer, lighter }[el.t];
  if (f) f({ ...el, collect: out }, NULL_CTX);
  return out;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** a placer for frame (at, y, rot) */
function frame(el, bag) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.rot ?? 0, c = Math.cos(r), s = Math.sin(r);
  const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  return { put: (m, g) => { g.rotateY(r); g.translate(x, y, z); bag.add(m, g); }, P, y, r };
}
const tri = (pts) => fromTriangles(orientOutward(pts));
function hexa(b, t) { const o = [], q = (a, b2, c, d) => o.push(...a, ...b2, ...c, ...a, ...c, ...d); q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]); for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); } return tri(o); }
/** a spoked wheel on an axle along x at (x, r, z): the iron tyre, the felloe, the spokes, the hub */
function wheel(put, x, z, r, n, mat) {
  const rim = lathe([[r - 0.06, -0.035], [r, -0.035], [r, 0.035], [r - 0.06, 0.035], [r - 0.06, -0.035]], 24); rim.rotateZ(Math.PI / 2); rim.translate(x, r, z); put(mat, rim);
  const tyre = lathe([[r, -0.03], [r + 0.015, -0.03], [r + 0.015, 0.03], [r, 0.03], [r, -0.03]], 24); tyre.rotateZ(Math.PI / 2); tyre.translate(x, r, z); put('iron', tyre);
  for (let k = 0; k < n; k++) { const g = box(-0.018, 0.08, -0.022, 0.018, r - 0.05, 0.022); g.rotateX(k * 2 * Math.PI / n); g.translate(x, r, z); put(mat, g); }
  const hub = lathe([[0.06, -0.12], [0.1, -0.08], [0.1, 0.08], [0.06, 0.12]], 10); hub.rotateZ(Math.PI / 2); hub.translate(x, r, z); put(mat, hub);
}
const gent = (seed, cloth, pose, extra = {}) => ({ t: 'figure', seed, dress: 'trousers', cloth, cloth2: 'cloth_black', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_black', pose, hair: 'short', ...extra });

/** hansom_cab: { at, y, rot, seed, mat } */
export function hansomCab(el, ctx) {
  const { bag, col } = ctx, F = frame(el, bag), put = F.put, rand = rng(el.seed ?? 1), M = el.mat ?? 'car_black', r = 0.8;
  for (const s of [-1, 1]) wheel(put, s * 0.86, 0, r, 12, 'wood_dark');
  put('iron', box(-0.86, r - 0.04, -0.04, 0.86, r + 0.04, 0.04));                                         // the cranked axle
  // the body: low-slung between the wheels, its floor under the axle, the passengers' seat, the roof
  put(M, box(-0.66, 0.42, -0.6, 0.66, 0.52, 0.72));
  for (const s of [-1, 1]) {
    put(M, box(s * 0.66 - 0.03, 0.52, -0.25, s * 0.66 + 0.03, 1.95, 0.72));                                // the side panels
    put(M, hexa([[s * 0.63, 0.52, -0.6], [s * 0.69, 0.52, -0.6], [s * 0.69, 0.52, -0.25], [s * 0.63, 0.52, -0.25]], [[s * 0.63, 1.2, -0.55], [s * 0.69, 1.2, -0.55], [s * 0.69, 1.2, -0.25], [s * 0.63, 1.2, -0.25]]));
    put('glass_outer', box(s * 0.66 - 0.035, 1.3, 0.05, s * 0.66 + 0.035, 1.75, 0.5));                     // the small side window
    put('paint_cab_yellow', box(s * 0.66 - 0.04, 1.18, -0.25, s * 0.66 + 0.04, 1.22, 0.72));              // a line along the waist
    put('iron', box(s * 0.66 - 0.02, 1.2, -0.27, s * 0.66 + 0.02, 1.95, -0.23));                            // the door pillar
  }
  put(M, box(-0.66, 0.52, 0.66, 0.66, 1.95, 0.74));                                                         // the back
  put(M, box(-0.7, 1.95, -0.32, 0.7, 2.02, 0.8));                                                          // the roof, its hatch
  put('wood_dark', box(-0.2, 2.02, -0.05, 0.2, 2.05, 0.3));
  put('cloth_red', box(-0.6, 0.52, 0.25, 0.6, 0.95, 0.66)); put('cloth_red', box(-0.6, 0.95, 0.56, 0.6, 1.6, 0.66));   // the seat and its back
  // the folding doors over the passengers' knees, the curved fender before them
  for (const s of [-1, 1]) put('wood_dark', box(s < 0 ? -0.62 : 0.01, 0.52, -0.6, s < 0 ? -0.01 : 0.62, 1.15, -0.55));
  for (let k = 0; k < 5; k++) { const a0 = k / 5 * 1.2, a1 = (k + 1) / 5 * 1.2, R = 0.5; put(M, hexa([[-0.6, 0.45 + Math.sin(a0) * R, -0.6 - Math.cos(a0) * R * 0.5], [0.6, 0.45 + Math.sin(a0) * R, -0.6 - Math.cos(a0) * R * 0.5], [0.6, 0.45 + Math.sin(a0) * R + 0.02, -0.6 - Math.cos(a0) * R * 0.5 + 0.02], [-0.6, 0.45 + Math.sin(a0) * R + 0.02, -0.6 - Math.cos(a0) * R * 0.5 + 0.02]], [[-0.6, 0.45 + Math.sin(a1) * R, -0.6 - Math.cos(a1) * R * 0.5], [0.6, 0.45 + Math.sin(a1) * R, -0.6 - Math.cos(a1) * R * 0.5], [0.6, 0.45 + Math.sin(a1) * R + 0.02, -0.6 - Math.cos(a1) * R * 0.5 + 0.02], [-0.6, 0.45 + Math.sin(a1) * R + 0.02, -0.6 - Math.cos(a1) * R * 0.5 + 0.02]])); }
  // the driver's seat high at the back, on its iron stay; the lamps at the front corners
  put('wood_dark', box(-0.32, 2.4, 0.85, 0.32, 2.5, 1.25)); put('iron', box(-0.03, 1.3, 0.74, 0.03, 2.4, 0.8));
  for (const s of [-1, 1]) put('iron', box(s * 0.25 - 0.02, 2.02, 0.9, s * 0.25 + 0.02, 2.4, 0.94)); put('wood_dark', box(-0.3, 2.5, 1.2, 0.3, 2.85, 1.26));
  for (const s of [-1, 1]) { put('iron', box(s * 0.7 - 0.025, 1.45, -0.3, s * 0.7 + 0.025, 1.6, -0.25)); put('lamp_glass', lathe([[0.07, 0], [0.09, 0.12], [0.07, 0.24], [0.001, 0.3]], 6, null, s * 0.74, 1.6, -0.28)); }
  // the shafts to the horse's sides, the horse
  const K = BEASTS.horse, hz = -0.62 - 0.4 - K.L / 2;
  for (const s of [-1, 1]) put('wood_dark', rod([s * 0.62, 0.55, -0.55], [s * 0.42, K.H * 0.62, hz - K.L * 0.38], 0.04, 6));
  { const [ax, az] = F.P(0, hz); rider(el, ctx, { t: 'animal', kind: 'horse', gear: true, graze: false, seed: (el.seed ?? 1) + 3, at: [ax, az], y: F.y, rot: F.r }, ctx); }
  // the driver on his perch, the reins running forward over the roof to the horse's head
  { const [dx, dz] = F.P(0, 1.05); rider(el, ctx, { ...gent((el.seed ?? 1) * 7 + 1, rand() < 0.5 ? 'cloth_brown' : 'cloth_grey', 'sit', { over: 'cape' }), at: [dx, dz], y: F.y + 1.93, rot: F.r }, ctx); }
  for (const s of [-1, 1]) put('hide_brown', rod([s * 0.15, 2.95, 0.65], [s * 0.12, K.H + 0.15, hz - K.L * 0.55], 0.012, 4));
  { const [cx, cz] = F.P(0, -0.3); col.circle(cx, cz, 1.1, F.y, F.y + 2.5); }
}

/** omnibus: { at, y, rot, seed, mat, board } — the knifeboard omnibus with two horses */
export function omnibus(el, ctx) {
  const { bag, col } = ctx, F = frame(el, bag), put = F.put, rand = rng(el.seed ?? 2), M = el.mat ?? 'car_cream', B = el.board ?? 'cloth_red';
  for (const s of [-1, 1]) { wheel(put, s * 1.0, -1.35, 0.5, 10, 'wood_dark'); wheel(put, s * 1.0, 1.25, 0.72, 12, 'wood_dark'); }
  put('iron', box(-1.0, 0.46, -1.39, 1.0, 0.54, -1.31)); put('iron', box(-1.0, 0.68, 1.21, 1.0, 0.76, 1.29));
  // the body: panels, windows along each side, the boards for the route and the advertisements over them
  put('wood_dark', box(-0.92, 0.72, -2.0, 0.92, 0.82, 2.1));
  put(M, box(-0.9, 0.82, -1.95, 0.9, 2.55, 2.05));
  for (const s of [-1, 1]) {
    for (let k = 0; k < 5; k++) { const z0 = -1.75 + k * 0.76; put('glass_outer', box(s * 0.9 - 0.015, 1.55, z0, s * 0.9 + 0.015, 2.25, z0 + 0.6)); put('wood_dark', box(s * 0.9 - 0.03, 1.5, z0 - 0.08, s * 0.9 + 0.03, 2.3, z0)); }
    put('wood_dark', box(s * 0.9 - 0.03, 1.5, 2.0, s * 0.9 + 0.03, 2.3, 2.05)); put('wood_dark', box(s * 0.9 - 0.03, 1.45, -1.95, s * 0.9 + 0.03, 1.52, 2.05)); put('wood_dark', box(s * 0.9 - 0.03, 2.28, -1.95, s * 0.9 + 0.03, 2.35, 2.05));
    put(B, box(s * 0.9 - 0.03, 0.95, -1.8, s * 0.9 + 0.035, 1.38, 1.9));                                    // the fleet's name and the route
    put('paint_white', box(s * 0.92 - 0.03, 2.58, -1.9, s * 0.92 + 0.035, 2.95, 2.0));                     // the advertisement board along the roof
    put('cloth_black', box(s * 0.92 - 0.04, 2.66, -1.5, s * 0.92 + 0.04, 2.86, 1.6));
  }
  put('glass_outer', box(-0.55, 1.55, 2.04, 0.55, 2.25, 2.07));                                             // the back window over the door
  // the roof, the knifeboard seat along it back to back, the rail round its edge
  put('wood_dark', box(-0.95, 2.55, -2.0, 0.95, 2.6, 2.1));
  put('wood_dark', box(-0.04, 2.6, -1.6, 0.04, 3.4, 1.65));
  for (const s of [-1, 1]) { put('wood_dark', box(s < 0 ? -0.5 : 0.04, 3.0, -1.6, s < 0 ? -0.04 : 0.5, 3.06, 1.65)); for (const z of [-1.5, 0, 1.55]) put('iron', box(s * 0.3 - 0.02, 2.6, z - 0.02, s * 0.3 + 0.02, 3.0, z + 0.02)); put('wood_dark', box(s * 0.6 - 0.02, 2.6, -1.6, s * 0.6 + 0.02, 2.7, 1.65)); }
  for (const s of [-1, 1]) for (let z = -1.9; z <= 2.0; z += 0.5) put('iron', box(s * 0.92 - 0.015, 2.95, z - 0.015, s * 0.92 + 0.015, 3.2, z + 0.015));
  for (const s of [-1, 1]) put('iron', box(s * 0.92 - 0.02, 3.18, -1.9, s * 0.92 + 0.02, 3.22, 2.0));
  // the step and platform at the back, the rungs up to the roof
  put('wood_dark', box(-0.5, 0.42, 2.05, 0.5, 0.5, 2.45)); put('iron', box(-0.45, 0.5, 2.4, -0.42, 2.6, 2.43));
  for (let k = 0; k < 6; k++) put('iron', box(0.55, 0.85 + k * 0.32, 2.06, 0.85, 0.89 + k * 0.32, 2.1));
  for (const x of [0.55, 0.85]) put('iron', box(x - 0.015, 0.8, 2.06, x + 0.015, 2.6, 2.1));
  // the driver's box at the front, its footboard, the pole to the pair
  put('wood_dark', box(-0.6, 2.55, -2.45, 0.6, 2.85, -1.95)); put('wood_dark', box(-0.65, 2.32, -2.85, 0.65, 2.38, -2.4)); put('wood_dark', box(-0.65, 1.9, -2.88, 0.65, 2.38, -2.82)); put('iron', box(-0.03, 0.8, -2.5, 0.03, 2.55, -2.42));
  const K = BEASTS.horse, hz = -2.0 - 0.6 - K.L / 2;
  put('wood_dark', rod([0, 0.6, -1.6], [0, K.H * 0.55, hz - K.L * 0.45], 0.05, 6));
  for (const s of [-1, 1]) { const [ax, az] = F.P(s * 0.55, hz); rider(el, ctx, { t: 'animal', kind: 'horse', gear: true, graze: false, seed: (el.seed ?? 2) * 5 + (s + 1), at: [ax, az], y: F.y, rot: F.r }, ctx); put('hide_brown', rod([s * 0.1, 3.3, -2.3], [s * 0.55, K.H + 0.15, hz - K.L * 0.55], 0.012, 4)); }
  // the driver, the conductor on the step, passengers on the roof facing outward
  { const [dx, dz] = F.P(0, -2.2); rider(el, ctx, { ...gent((el.seed ?? 2) * 3 + 1, 'cloth_brown', 'sit', { over: 'cape' }), at: [dx, dz], y: F.y + 2.28, rot: F.r }, ctx); }
  { const [cx, cz] = F.P(0, 2.25); rider(el, ctx, { ...gent((el.seed ?? 2) * 3 + 2, 'cloth_grey', 'stand', { hat: 'cap', hatMat: 'cloth_black' }), at: [cx, cz], y: F.y + 0.5, rot: F.r + Math.PI }, ctx); }
  const coats = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo'];
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { if (rand() < 0.25) continue; const [px, pz] = F.P(s * 0.3, -1.1 + k * 1.05); rider(el, ctx, { ...gent((el.seed ?? 2) * 11 + k * 2 + (s + 1), coats[Math.floor(rand() * 4)], 'sit'), at: [px, pz], y: F.y + 2.49, rot: F.r - s * Math.PI / 2 }, ctx); }
  { const [cx, cz] = F.P(0, -0.5); col.circle(cx, cz, 1.6, F.y, F.y + 3.2); }
}

/** gas_lamp: { at, y } — a cast-iron column on its base, the ladder bar, the lantern of four panes under its crown */
export function gasLamp(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 3.3;
  bag.add('iron', lathe([[0.2, 0], [0.2, 0.12], [0.15, 0.2], [0.14, 0.6], [0.1, 0.72], [0.085, 0.9], [0.075, h - 0.3], [0.1, h - 0.2], [0.07, h]], 8, (t, i) => (i > 4 && i < 7 ? 1 + 0.08 * Math.cos(8 * t) : 1), x, y, z));
  bag.add('iron', box(x - 0.4, y + h - 0.45, z - 0.025, x + 0.4, y + h - 0.38, z + 0.025));
  for (const s of [-1, 1]) bag.add('iron', lathe([[0.035, 0], [0.001, 0.08]], 6, null, x + s * 0.4, y + h - 0.38, z));
  bag.add('iron', lathe([[0.1, 0], [0.16, 0.05], [0.16, 0.08], [0.001, 0.08]], 4, null, x, y + h, z));
  bag.add('lamp_glass', lathe([[0.12, 0], [0.2, 0.55], [0.001, 0.55]], 4, null, x, y + h + 0.08, z));
  for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; bag.add('iron', rod([x + Math.cos(a) * 0.12, y + h + 0.08, z + Math.sin(a) * 0.12], [x + Math.cos(a) * 0.205, y + h + 0.64, z + Math.sin(a) * 0.205], 0.015, 4)); }
  bag.add('iron', lathe([[0.25, 0], [0.24, 0.04], [0.12, 0.18], [0.05, 0.22], [0.03, 0.34], [0.001, 0.36]], 4, null, x, y + h + 0.62, z));
  col.circle(x, z, 0.2, y, y + h);
}

/** a hull of length L, beam B, depth D in the frame (bow at −z), its sheer a little raised at the ends */
function hull(L, B, D, bluff = 0.5) {
  const n = 16, m = 6, T = [];
  const P = (i, j) => { const t = i / n, s = j / m * 2 - 1, half = Math.pow(Math.sin(Math.PI * t), bluff) * B / 2, sh = 0.35 * (2 * t - 1) ** 4; return [half * s, sh - D * (1 - Math.abs(s) ** 3) * Math.pow(Math.sin(Math.PI * t), 0.25), -L / 2 + L * t]; };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) { const p = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1); T.push(...p, ...b, ...c, ...p, ...c, ...d); }
  // the deck closing it: a fan over the sheer
  for (let i = 0; i < n; i++) { const a = P(i, 0), b = P(i + 1, 0), c = P(i + 1, m), d = P(i, m); T.push(...a, ...d, ...c, ...a, ...c, ...b); }
  return fromTriangles(T);
}

/** paddle_steamer: { at, y (water), rot, seed, ring } — a Thames penny steamer */
export function paddleSteamer(el, ctx) {
  const { bag } = ctx, F = frame(el, bag), put = F.put, rand = rng(el.seed ?? 3), L = el.len ?? 30, B = 4.4, fb = 1.1, ring = el.ring ?? 'cloth_red';
  const H = hull(L, B, 1.9, 0.45); H.translate(0, fb, 0); put('car_black', H);
  const deck = fb + 0.02;
  // the deck planking, the rail round it on stanchions
  { const g = hull(L * 0.985, B * 0.97, 0.05, 0.45); g.translate(0, deck, 0); put('planks_grey', g); }
  for (let t = -L / 2 + 1.2; t < L / 2 - 1; t += 1.1) { const half = Math.pow(Math.sin(Math.PI * (t + L / 2) / L), 0.45) * B / 2 - 0.08, sh = 0.35 * (2 * (t + L / 2) / L - 1) ** 4; for (const s of [-1, 1]) put('iron', box(s * half - 0.02, deck + sh, t - 0.02, s * half + 0.02, deck + sh + 0.95, t + 0.02)); }
  for (const s of [-1, 1]) { const pts = []; for (let k = 0; k <= 20; k++) { const t = -L / 2 + 1.2 + k * (L - 2.4) / 20, half = Math.pow(Math.sin(Math.PI * (t + L / 2) / L), 0.45) * B / 2 - 0.08, sh = 0.35 * (2 * (t + L / 2) / L - 1) ** 4; pts.push([s * half, deck + sh + 0.95, t]); } for (let k = 0; k < 20; k++) put('wood_dark', rod(pts[k], pts[k + 1], 0.035, 4)); }
  // the paddle boxes amidships, each a half drum with its radiating panels, the sponsons, the bridge across between them
  const pz = -L * 0.04, R = 1.75;
  for (const s of [-1, 1]) {
    const g = lathe([[R, 0], [R, 1.1], [0.001, 1.1]], 16, null, 0, 0, 0); g.rotateZ(-s * Math.PI / 2); g.translate(s * (B / 2 - 0.05), fb - 0.15, pz);
    put('paint_white', g);
    for (let k = 0; k < 7; k++) { const a = (k + 0.5) / 7 * Math.PI, gg = box(-0.025, 0, -0.04, 0.025, R - 0.15, 0.04); gg.rotateX(a - Math.PI / 2); gg.translate(s * (B / 2 + 1.06), fb - 0.15, pz); put('car_black', gg); }
    put('wood_dark', box(Math.min(s * B / 2, s * (B / 2 + 1.1)), deck - 0.05, pz - R - 1.2, Math.max(s * B / 2, s * (B / 2 + 1.1)), deck + 0.05, pz + R + 1.2));
  }
  put('wood_dark', box(-B / 2 - 1.1, fb + R - 0.1, pz - 0.6, B / 2 + 1.1, fb + R - 0.03, pz + 0.6));
  for (const s of [-1, 1]) for (const dz of [-0.6, 0.6]) put('iron', box(s * (B / 2 + 1.05) - 0.02, fb + R - 0.03, pz + dz - 0.02, s * (B / 2 + 1.05) + 0.02, fb + R + 0.85, pz + dz + 0.02));
  put('iron', box(-B / 2 - 1.1, fb + R + 0.83, pz - 0.62, B / 2 + 1.1, fb + R + 0.87, pz - 0.58));
  // the funnel, tall and raked, the rings of its route; the steam pipe; the engine-room casing; the mast forward with its flag
  put('wood_dark', box(-1.0, deck - 0.3, pz - 1.6, 1.0, deck + 1.1, pz + 1.6));
  { const g = lathe([[0.5, 0], [0.5, 6.5], [0.55, 6.6], [0.55, 6.8], [0.001, 6.8]], 14, null, 0, 0, 0); g.rotateX(0.12); g.translate(0, deck + 1.1, pz - 0.2); put('car_black', g);
    for (const v of [4.6, 5.3]) { const r2 = lathe([[0.512, 0], [0.512, 0.35], [0.001, 0.35]], 14, null, 0, 0, 0); r2.rotateX(0.12); const off = v * Math.sin(0.12); r2.translate(0, deck + 1.1 + v * Math.cos(0.12), pz - 0.2 + off); put(v < 5 ? ring : 'paint_white', r2); } }
  put('steel_chrome', rod([0.4, deck + 1.1, pz + 0.6], [0.45, deck + 6.6, pz + 1.3], 0.05, 6));
  put('wood_dark', rod([0, deck, -L * 0.33], [0, deck + 7.0, -L * 0.36], 0.08, 6));
  put('cloth_red', box(-0.01, deck + 6.2, -L * 0.36 + 0.05, 0.01, deck + 6.85, -L * 0.36 + 1.05));
  // the saloon aft, low with windows; the wheel and its little platform
  put('wood_dark', box(-1.5, deck - 0.3, L * 0.18, 1.5, deck + 1.0, L * 0.4));
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) put('glass_outer', box(s * 1.5 - 0.02, deck + 0.45, L * 0.2 + k * 1.2, s * 1.5 + 0.02, deck + 0.85, L * 0.2 + k * 1.2 + 0.7));
  put('timber', box(-1.55, deck + 1.0, L * 0.18 - 0.05, 1.55, deck + 1.06, L * 0.4 + 0.05));
  { const g = lathe([[0.45, -0.03], [0.45, 0.03], [0.4, 0.03], [0.4, -0.03], [0.45, -0.03]], 12); g.rotateX(Math.PI / 2); g.translate(0, fb + R + 0.6, pz + 0.2); put('wood_dark', g); }
  // benches on the open deck, passengers standing at the rail and sitting
  for (const t of [-L * 0.25, -L * 0.17, L * 0.08, L * 0.13]) put('timber', box(-1.2, deck + 0.4, t - 0.18, 1.2, deck + 0.46, t + 0.18));
  const dress = ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_green'];
  for (let k = 0; k < 9; k++) {
    const t = -L * 0.28 + rand() * L * 0.42, s = rand() < 0.5 ? -1 : 1, half = Math.pow(Math.sin(Math.PI * (t + L / 2) / L), 0.45) * B / 2 - 0.45;
    if (Math.abs(t - pz) < 2.2) continue;
    const [px, pz2] = F.P(s * half, t), lady = rand() < 0.4;
    rider(el, ctx, lady ? { t: 'figure', seed: (el.seed ?? 3) * 13 + k, dress: 'robe', cloth: dress[Math.floor(rand() * 5)], cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', hair: 'bun', pose: 'stand', at: [px, pz2], y: F.y + deck, rot: F.r - s * Math.PI / 2 } : { ...gent((el.seed ?? 3) * 13 + k, dress[Math.floor(rand() * 5)], 'stand'), at: [px, pz2], y: F.y + deck, rot: F.r - s * Math.PI / 2 }, ctx);
  }
}

/** lighter: { at, y (water), rot, seed, load } — a dumb barge of the river, open, loaded with coal; the lighterman with his sweep */
export function lighter(el, ctx) {
  const { bag } = ctx, F = frame(el, bag), put = F.put, L = el.len ?? 13, B = 3.8;
  const H = hull(L, B, 1.3, 0.25); H.translate(0, 0.45, 0); put('tar_wood', H);
  for (const s of [-1, 1]) put('timber', box(s * B / 2 - 0.12, 0.42, -L * 0.36, s * B / 2 + 0.02, 0.6, L * 0.36));
  put('timber', box(-B / 2 + 0.1, 0.42, -L * 0.42, B / 2 - 0.1, 0.62, -L * 0.36)); put('timber', box(-B / 2 + 0.1, 0.42, L * 0.36, B / 2 - 0.1, 0.62, L * 0.42));
  if ((el.load ?? 'coal') === 'coal') for (const t of [-L * 0.2, L * 0.1]) { const g = lathe([[1.6, 0], [1.3, 0.45], [0.6, 0.85], [0.001, 0.95]], 10, (th) => 1 + 0.06 * Math.cos(5 * th), 0, 0, 0); g.scale(1, 1, 1.8); g.translate(0, 0.2, t); put('bitumen', g); }
  else for (let k = 0; k < 8; k++) put('sacking', box(-1.4 + (k % 2) * 1.45, 0.2, -L * 0.3 + Math.floor(k / 2) * 1.6, -0.05 + (k % 2) * 1.45, 0.95, -L * 0.3 + Math.floor(k / 2) * 1.6 + 1.4));
  put('timber', rod([0.6, 0.62, L * 0.3], [1.6, 2.2, L * 0.48 + 5.0], 0.05, 5));
  const [px, pz] = F.P(0.3, L * 0.36);
  rider(el, ctx, { ...gent((el.seed ?? 4) * 17, 'cloth_brown', 'stand', { hat: 'cap', hatMat: 'cloth_brown' }), at: [px, pz], y: F.y + 0.62, rot: F.r + Math.PI }, ctx);
}

/** steamboat_pier: { x0, x1 (pontoon across), z0, z1, y (water), bankX, bankY } — the floating pier and its gangway from the embankment */
export function steamboatPier(el, { bag, col }) {
  const { x0, x1, z0, z1 } = el, y = (el.y ?? 0) + 0.55, bx = el.bankX, by = el.bankY;
  bag.add('tar_wood', box(x0, y - 1.0, z0, x1, y - 0.1, z1));
  bag.add('planks_grey', box(x0, y - 0.1, z0, x1, y, z1)); col.floor([x0, z0, x1, z1], y);
  for (const s of [-1, 1]) for (let z = z0 + 0.4; z < z1; z += 1.8) bag.add('iron', box((s < 0 ? x0 : x1) - 0.03, y, z - 0.03, (s < 0 ? x0 : x1) + 0.03, y + 1.0, z + 0.03));
  for (const xx of [x0, x1]) bag.add('wood_dark', box(xx - 0.04, y + 0.95, z0 + 0.4, xx + 0.04, y + 1.02, z1 - 0.4));
  // the shelter on the pontoon: posts and a ridged roof
  const zm = (z0 + z1) / 2, sx0 = x0 + 0.6, sx1 = x1 - 0.6;
  for (const xx of [sx0, sx1]) for (const zz of [zm - 4, zm, zm + 4]) bag.add('iron', box(xx - 0.06, y, zz - 0.06, xx + 0.06, y + 2.6, zz + 0.06));
  bag.add('slate', hexa([[sx0 - 0.3, y + 2.6, zm - 4.5], [sx1 + 0.3, y + 2.6, zm - 4.5], [sx1 + 0.3, y + 2.6, zm + 4.5], [sx0 - 0.3, y + 2.6, zm + 4.5]], [[(sx0 + sx1) / 2 - 0.05, y + 3.4, zm - 4.5], [(sx0 + sx1) / 2 + 0.05, y + 3.4, zm - 4.5], [(sx0 + sx1) / 2 + 0.05, y + 3.4, zm + 4.5], [(sx0 + sx1) / 2 - 0.05, y + 3.4, zm + 4.5]]));
  for (let k = 0; k < 3; k++) bag.add('timber', box(sx0 + 0.2, y + 0.42, zm - 3 + k * 2.6, sx0 + 0.6, y + 0.48, zm - 1.6 + k * 2.6));
  // the gangway: a plank way with handrails from the embankment's top down to the pontoon
  const gz = z1 - 2.2, w = 1.4, gx0 = bx, gx1 = x0 + 0.4;
  bag.add('timber', hexa([[gx0, by - 0.12, gz - w / 2], [gx1, y - 0.12, gz - w / 2], [gx1, y - 0.12, gz + w / 2], [gx0, by - 0.12, gz + w / 2]], [[gx0, by, gz - w / 2], [gx1, y, gz - w / 2], [gx1, y, gz + w / 2], [gx0, by, gz + w / 2]]));
  for (const s of [-1, 1]) { const zz = gz + s * w / 2; bag.add('iron', rod([gx0, by + 1.0, zz], [gx1, y + 1.0, zz], 0.025, 5)); for (let t = 0; t <= 1.001; t += 0.25) { const xx = gx0 + (gx1 - gx0) * t, yy = by + (y - by) * t; bag.add('iron', box(xx - 0.025, yy, zz - 0.025, xx + 0.025, yy + 1.0, zz + 0.025)); } }
  // the mooring posts
  for (const zz of [z0 + 1, z1 - 1]) bag.add('iron', lathe([[0.16, 0], [0.13, 0.5], [0.18, 0.6], [0.001, 0.65]], 8, null, x1 - 0.3, y, zz));
}
void hexa; void tri;
