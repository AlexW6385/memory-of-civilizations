// Ming Suzhou's shop fronts (docs/settlements/ming-suzhou.md §6, "Shop signs and goods"): what the
// canal houses' shop fronts (src/styles/ming) lack — the name boards with their gilt characters,
// the vertical signboards (hung from the eave on a bracket, or standing on stone feet at the front),
// the banner poles with each trade's sign (the wine flag, cloth streamers, the physician's gourd,
// the rice measure, a hung bowl, pan, vase, umbrella …), the plank shutters (paimen ban) stacked
// against the posts, and the goods of each trade out on the apron and on trestles in the street,
// not one shop the same as its neighbour.
//
// It is an element of the street life (`suzhou_shop`, one per shop, built in style `life`): every
// piece goes in as an instance of its shape (the shapes are shared by all shops and the viewer draws
// each as one instanced mesh), so a street of shops costs a few hundred matrices, not geometry.
// Local frame of a shop: x along the front, z out into the street, y up from the street.

import { box, lathe, fromTriangles, rod, hangFrom, windMat, placeHanging } from '../../core/geom.js';
import { placer, assembly, rng } from '../../objects/kit.js';
import { Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { prismX } from './props.js';
import { glyphGeometry } from './script.js';

// ── the writing: characters as brush relief (script.js, brush.js; docs/settlements/ming-suzhou.md §23) ──
// Each character is built in two forms of one cell of 1 m, scaled by the placing: the near form in full relief
// (the strokes tapered, bevelled and raised 9 cm of the cell; drawn within about 20 m) and the far form flat,
// its face a little inside the near form's walls so that the two never show at once (drawn to the street's far end).
// Each is built in six hands (the stroke weight differs a little), picked by a hash of the place.
const HANDS = [0.94, 1.0, 1.06, 1.12, 0.97, 1.03], SHAPES = new Map();
function glyphShape(ch, v) {
  const key = ch + v;
  let s = SHAPES.get(key);
  if (!s) SHAPES.set(key, (s = { near: glyphGeometry(ch, 0, 0.09, { thick: HANDS[v] }), far: glyphGeometry(ch, 0.04, 0.04, { flat: true, top: 0.74, thick: HANDS[v] }) }));
  return s;
}
const hashPos = (x, z, y) => { let h = (Math.round(x * 37) * 73856093) ^ (Math.round(z * 37) * 19349663) ^ (Math.round(y * 37) * 83492791); h = Math.imul(h ^ (h >>> 13), 0x5bd1e995); return ((h ^ (h >>> 15)) >>> 0) / 4294967296; };
const _gm = new Matrix4(), _gq = new Quaternion(), _gu = new Vector3(0, 1, 0), _gp = new Vector3(), _gs = new Vector3();

// ── the shapes (built once, shared by every shop) ─────────────────────────────────────────────────
const U = {}, DEF = {};
/** unit(name, { role: default material }, build(add)): the pieces of a shape gathered by role (one geometry each). */
function unit(name, defaults, build) { DEF[name] = defaults; U[name] = assembly(`suzhou-shop|${name}`, build); }
const mv = (g, x = 0, y = 0, z = 0) => { g.translate(x, y, z); return g; };
/** Finer lathes (more rows, more sides) for the shapes that are few but must still be instanced (FINE > 1; see LIFE_MIN_TRIS in the viewer). */
let FINE = 1;
const subdiv = (p, k) => { const o = []; for (let i = 0; i < p.length - 1; i++) for (let j = 0; j < k; j++) o.push([p[i][0] + (p[i + 1][0] - p[i][0]) * j / k, p[i][1] + (p[i + 1][1] - p[i][1]) * j / k]); o.push(p[p.length - 1]); return o; };
const ly = (prof, seg = 10, x = 0, y = 0, z = 0) => lathe(FINE > 1 ? subdiv(prof, FINE) : prof, Math.round(seg * (FINE > 1 ? 1 + FINE * 0.75 : 1)), null, x, y, z);
const drum = (r0, r1, h, seg, x, y, z) => ly([[0.001, 0], [r0, 0], [r1, h], [0.001, h]], Math.round(seg * 1.5), x, y, z);
const rodG = (a, b, r, seg = 6) => rod(a, b, r, seg);
/** a bowl, its mouth up, at (x, y, z), scaled by k */
const bowl = (x, y, z, k = 1) => ly([[0.001, 0], [0.036 * k, 0], [0.07 * k, 0.026 * k], [0.088 * k, 0.07 * k], [0.082 * k, 0.072 * k], [0.064 * k, 0.034 * k], [0.001, 0.014 * k]], 8, x, y, z);
const jar = (r, h, x, y, z) => ly([[0.001, 0], [r * 0.5, 0], [r, h * 0.22], [r * 1.12, h * 0.5], [r * 0.9, h * 0.78], [r * 0.55, h * 0.93], [r * 0.6, h], [0.001, h]], 10, x, y, z);

/** the roles of a unit that are cloth in the wind (their `hang` set from the attachment's height) */
const WINDY = new Set(['flag.c', 'flag.e', 'streamers.c']);
// the characters on a flag (cloth, sewn on: they sway with it; its top is 1.04 above the cell's middle at the flag's scale)
for (const ch of ['酒', '茶', '麵', '當']) {
  unit(`f${ch}`, { g: 'cloth_black' }, (a) => a('g', hangFrom(glyphGeometry(ch, 0.03, 0.03, { flat: true, top: 1 }), 1.04)));
  WINDY.add(`f${ch}.g`);
}

// the name board: a lacquered field in a raised frame, W 1.9 m, H 0.46, 0.05 deep (its face at z 0.05)
unit('plate', { f: 'lacquer_black', b: 'gilt_bronze' }, (a) => {
  const W = 1.9, H = 0.46;
  a('f', box(-W / 2, 0, 0, W / 2, H, 0.05));
  // the field in raised mouldings: a margin, a panel for the characters, cartouches at the ends, ruyi-cloud heads on the top edge
  for (const s of [-1, 1]) {
    a('f', box(s * (W / 2 - 0.15) - 0.05, 0.1, 0.05, s * (W / 2 - 0.15) + 0.05, H - 0.1, 0.06));
    a('f', prismX([[0.0, H], [0.07, H], [0.1, H + 0.04], [0.04, H + 0.08], [-0.02, H + 0.04]], s * (W / 2 - 0.22) - 0.05, s * (W / 2 - 0.22) + 0.05));
  }
  for (let k = -2; k <= 2; k++) { a('f', prismX([[0.0, H + 0.012], [0.06, H + 0.012], [0.09, H + 0.047], [0.03, H + 0.077], [-0.02, H + 0.047]], k * 0.34 - 0.06, k * 0.34 + 0.06)); }
  const fr = 0.035;
  a('b', box(-W / 2 - 0.02, -0.02, 0.02, W / 2 + 0.02, fr - 0.02, 0.085)); a('b', box(-W / 2 - 0.02, H - fr + 0.02, 0.02, W / 2 + 0.02, H + 0.02, 0.085));
  a('b', box(-W / 2 - 0.02, fr - 0.02, 0.02, -W / 2 + fr - 0.02, H - fr + 0.02, 0.085)); a('b', box(W / 2 - fr + 0.02, fr - 0.02, 0.02, W / 2 + 0.02, H - fr + 0.02, 0.085));
  for (const s of [-1, 1]) for (const yy of [0.12, 0.34]) a('b', drum(0.028, 0.02, 0.03, 6, s * (W / 2 - 0.09), yy, 0.05));
  for (const s of [-1, 1]) a('b', ly([[0.001, 0], [0.04, 0], [0.05, 0.02], [0.001, 0.04]], 12, s * (W / 2 - 0.16), 0.23, 0.065).rotateX(0));
});
// the pawnshop's wall: a black panel in a gilt frame (the great 當 is laid on it), 1.5 × 1.5 m, its face at z 0.05; origin at its foot
unit('pawnwall', { f: 'lacquer_black', b: 'gilt_bronze' }, (a) => {
  a('f', box(-0.75, 0, -0.06, 0.75, 1.5, 0.05));
  const fr = 0.05;
  a('b', box(-0.8, -0.04, -0.06, 0.8, fr - 0.04, 0.07)); a('b', box(-0.8, 1.5 - fr + 0.04, -0.06, 0.8, 1.54, 0.07));
  a('b', box(-0.8, fr - 0.04, -0.06, -0.75, 1.5 - fr + 0.04, 0.07)); a('b', box(0.75, fr - 0.04, -0.06, 0.8, 1.5 - fr + 0.04, 0.07));
});
// the hanging signboard (a vertical board on a bracket out of the post): origin at the bracket's root on the post, y at the arm
unit('hsign', { w: 'timber', b: 'lacquer_black', f: 'gilt_bronze', t: 'cloth_red' }, (a) => {
  a('w', box(-0.03, 0, 0, 0.03, 0.07, 0.98)); a('w', rodG([0, -0.42, 0.04], [0, 0.0, 0.62], 0.022, 8));
  a('w', box(-0.012, -0.2, 0.7, 0.012, 0, 0.74)); a('w', box(-0.012, -0.2, 0.9, 0.012, 0, 0.94));   // the cords
  for (const z of [0.25, 0.5]) a('w', ly([[0.001, 0.0], [0.05, 0.0], [0.05, 0.07], [0.001, 0.09]], 10, 0, -0.0, z)); // carved knobs on the arm
  a('w', rodG([0, -0.3, 0.04], [0, 0.0, 0.3], 0.016, 6)); a('w', box(-0.04, -0.46, 0.0, 0.04, -0.4, 0.07));
  a('b', box(-0.018, -1.32, 0.66, 0.018, -0.22, 0.96));
  a('b', box(-0.04, -0.2, 0.62, 0.04, -0.15, 1.0)); a('b', box(-0.03, -0.15, 0.66, 0.03, -0.11, 0.96)); a('b', box(-0.02, -0.11, 0.72, 0.02, -0.08, 0.9));  // the cap
  a('b', box(-0.03, -1.36, 0.66, 0.03, -1.34, 0.96));
  a('f', box(-0.032, -1.34, 0.64, 0.032, -1.31, 0.98)); a('f', box(-0.032, -0.23, 0.64, 0.032, -0.2, 0.98));
  a('f', box(-0.032, -1.31, 0.64, 0.032, -0.23, 0.665)); a('f', box(-0.032, -1.31, 0.955, 0.032, -0.23, 0.98));
  a('f', box(-0.01, -1.4, 0.76, 0.01, -1.36, 0.86)); a('f', box(-0.01, -1.12, 0.84, 0.01, -1.08, 0.88));
  for (const z of [0.76, 0.81, 0.86]) a('t', rodG([0, -1.36, z], [0, -1.58 - (z === 0.81 ? 0.08 : 0), z], 0.012, 5));
  a('t', ly([[0.001, -1.62], [0.04, -1.62], [0.03, -1.74], [0.001, -1.78]], 10, 0, 0, 0.81)); a('t', ly([[0.001, -1.36], [0.03, -1.38], [0.03, -1.44], [0.001, -1.46]], 8, 0, 0, 0.81));
});
// the standing signboard on stone feet (a board 0.4 × 1.6 between two posts, a little tiled hood)
unit('sboard', { w: 'timber', b: 'lacquer_black', f: 'gilt_bronze', r: 'tile_dark', s: 'granite_grey' }, (a) => {
  a('s', box(-0.3, 0, -0.2, 0.3, 0.16, 0.2)); a('s', box(-0.2, 0.16, -0.12, 0.2, 0.26, 0.12));
  for (const z of [-0.29, 0.29]) a('w', box(-0.04, 0.26, z - 0.04, 0.04, 2.0, z + 0.04));
  a('b', box(-0.025, 0.46, -0.27, 0.025, 1.94, 0.27)); a('w', box(-0.05, 0.4, -0.31, 0.05, 0.46, 0.31));
  for (const [y0, y1] of [[0.46, 0.5], [1.9, 1.94]]) a('f', box(-0.032, y0, -0.27, 0.032, y1, 0.27));
  for (const z of [-0.27, 0.23]) a('f', box(-0.032, 0.5, z, 0.032, 1.9, z + 0.04));
  a('r', prismX([[-0.4, 2.0], [0.4, 2.0], [0.28, 2.16], [-0.28, 2.16]], -0.14, 0.14)); a('r', box(-0.16, 2.0, -0.4, 0.16, 2.03, 0.4));
});
// the pole for the banner (幌子): a bamboo pole on a stone foot, leaning a little out, a cross-arm along +z at its top
unit('pole', { p: 'bamboo_culm', s: 'granite_grey', w: 'timber' }, (a) => {
  a('s', box(-0.22, 0, -0.22, 0.22, 0.12, 0.22)); a('s', box(-0.18, 0.12, -0.18, 0.18, 0.26, 0.18)); a('s', box(-0.14, 0.26, -0.14, 0.14, 0.34, 0.14));
  
  a('p', rodG([0, 0.3, 0], [0, 4.6, 0.12], 0.05, 8)); a('p', rodG([0, 4.6, 0.12], [0, 4.7, 0.13], 0.034, 6));
  a('w', box(-0.03, 4.28, 0.1, 0.03, 4.34, 0.95)); a('w', rodG([0, 4.0, 0.1], [0, 4.3, 0.6], 0.018, 6)); a('w', rodG([0, 3.95, 0.12], [0, 4.28, 0.9], 0.012, 6));
  for (const z of [0.3, 0.5, 0.7, 0.9]) a('w', ly([[0.001, 0], [0.03, 0], [0.025, 0.05], [0.001, 0.07]], 8, 0, 4.34, z));
  a('w', ly([[0.001, 4.65], [0.05, 4.65], [0.04, 4.75], [0.001, 4.82]], 8, 0, 0, 0.13));
  for (const y of [1.2, 2.4, 3.4]) a('p', box(-0.056, y - 0.012, -0.056, 0.056, y + 0.012, 0.056).translate(0, 0, 0.0 + y * 0.028));   // the joints
});
// banner pieces hung at (0, 4.28, 0.9) of the pole, plane across the street (normal ±x)
unit('flag', { c: 'cloth_white', w: 'timber', e: 'cloth_black' }, (a) => {
  a('w', box(-0.02, -0.05, 0.12, 0.02, 0.02, 0.88));
  const f = prismX([[0.14, -0.04], [0.86, -0.04], [0.86, -1.18], [0.5, -0.94], [0.14, -1.18]], -0.008, 0.008);
  a('c', hangFrom(f, -0.04)); a('e', hangFrom(prismX([[0.14, -0.04], [0.86, -0.04], [0.86, -0.1], [0.14, -0.1]], -0.011, 0.011), -0.04));
});
unit('streamers', { c: 'cloth_indigo', w: 'timber' }, (a) => {
  a('w', box(-0.02, -0.04, 0.1, 0.02, 0.02, 0.9));
  for (const [z, h] of [[0.2, 1.15], [0.38, 0.8], [0.56, 1.3], [0.74, 0.95]]) a('c', hangFrom(prismX([[z - 0.07, -0.04], [z + 0.07, -0.04], [z + 0.07, -h], [z, -h + 0.14], [z - 0.07, -h]], -0.008, 0.008), -0.04));
});
unit('gourd', { g: 'lacquer_chestnut', t: 'cloth_red' }, (a) => {
  a('g', ly([[0.001, -0.62], [0.11, -0.64], [0.2, -0.76], [0.21, -0.9], [0.14, -1.0], [0.1, -1.02], [0.12, -1.12], [0.2, -1.26], [0.21, -1.4], [0.13, -1.5], [0.001, -1.52]], 10, 0, 0, 0.5));
  a('g', ly([[0.001, -0.5], [0.03, -0.5], [0.035, -0.62], [0.001, -0.62]], 6, 0, 0, 0.5));
  a('t', rodG([0, -0.02, 0.5], [0, -0.5, 0.5], 0.012, 4)); a('t', rodG([0, -1.52, 0.5], [0, -1.78, 0.5], 0.02, 5));
});
unit('dou', { w: 'timber', i: 'iron', t: 'cloth_white' }, (a) => {         // the rice measure, hung on its cord
  a('w', rodG([0, -0.02, 0.5], [0, -0.55, 0.5], 0.012, 4));
  a('w', box(-0.17, -0.95, 0.33, 0.17, -0.55, 0.67)); a('i', box(-0.18, -0.67, 0.32, 0.18, -0.64, 0.68)); a('i', box(-0.18, -0.87, 0.32, 0.18, -0.84, 0.68));
  a('t', box(-0.19, -1.28, 0.38, -0.178, -0.95, 0.62));
});
FINE = 1;
unit('hbowl', { g: 'lacquer_red', t: 'cloth_red' }, (a) => {                // a hung bowl, vase, pan: one profile each
  a('g', ly([[0.001, -0.5], [0.09, -0.5], [0.2, -0.62], [0.27, -0.76], [0.28, -0.8], [0.25, -0.8], [0.18, -0.68], [0.001, -0.58]], 10, 0, 0, 0.5));
  a('t', rodG([0, -0.02, 0.5], [0, -0.5, 0.5], 0.012, 4)); a('t', rodG([0, -0.78, 0.5], [0, -1.05, 0.5], 0.02, 5));
});
unit('hvase', { g: 'glaze_blue', t: 'cloth_red' }, (a) => {
  a('g', ly([[0.001, -1.16], [0.1, -1.16], [0.17, -0.98], [0.2, -0.82], [0.12, -0.64], [0.07, -0.58], [0.1, -0.5], [0.001, -0.5]], 10, 0, 0, 0.5));
  a('t', rodG([0, -0.02, 0.5], [0, -0.5, 0.5], 0.012, 4));
});
unit('hpan', { g: 'iron', t: 'timber' }, (a) => {
  a('t', rodG([0, -0.02, 0.5], [0, -0.45, 0.5], 0.012, 4));
  a('g', ly([[0.001, -1.0], [0.12, -1.02], [0.26, -0.9], [0.34, -0.74], [0.35, -0.7], [0.32, -0.7], [0.001, -0.9]], 12, 0, 0, 0.5));
  a('t', rodG([0, -0.45, 0.5], [0.0, -0.7, 0.77], 0.014, 4));
});
unit('humbrella', { c: 'cloth_ochre', w: 'bamboo_culm', t: 'cloth_red' }, (a) => {
  a('w', rodG([0, -0.02, 0.5], [0, -0.45, 0.5], 0.012, 4)); a('w', rodG([0, -0.35, 0.5], [0, -1.05, 0.5], 0.018, 5));
  a('c', ly([[0.001, -0.5], [0.2, -0.62], [0.44, -0.84], [0.5, -0.9], [0.46, -0.91], [0.001, -0.74]], 14, 0, 0, 0.5));
  a('t', rodG([0, -1.05, 0.5], [0, -1.28, 0.5], 0.02, 5));
});
unit('hbook', { c: 'cloth_indigo', p: 'paint_white', w: 'timber' }, (a) => {   // a hung bundle of volumes
  a('w', rodG([0, -0.02, 0.5], [0, -0.4, 0.5], 0.012, 4));
  for (let k = 0; k < 4; k++) { const y = -0.42 - k * 0.2; a('c', box(-0.15, y - 0.17, 0.35, 0.15, y, 0.67)); a('p', box(-0.13, y - 0.16, 0.36, 0.13, y - 0.01, 0.37)); }
  a('w', box(-0.16, -1.2, 0.34, 0.16, -1.24, 0.68));
});
unit('hlantern', { l: 'lamp_paper', b: 'lacquer_black', t: 'cloth_red' }, (a) => {   // the tall lantern sign (茶), characters on its two faces
  a('b', rodG([0, -0.02, 0.5], [0, -0.3, 0.5], 0.012, 4));
  a('b', ly([[0.001, -0.3], [0.12, -0.3], [0.12, -0.36], [0.001, -0.36]], 10, 0, 0, 0.5));
  a('l', ly([[0.001, -0.36], [0.16, -0.38], [0.21, -0.52], [0.22, -0.76], [0.21, -0.94], [0.15, -1.04], [0.001, -1.05]], 12, 0, 0, 0.5));
  a('b', ly([[0.001, -1.05], [0.14, -1.05], [0.14, -1.1], [0.001, -1.1]], 10, 0, 0, 0.5));
  a('t', rodG([0, -1.1, 0.5], [0, -1.36, 0.5], 0.02, 5));
});

FINE = 1;
// shutters stacked against a post: seven boards 0.29 m wide leaning, the end of each showing its groove
unit('shutters', { w: 'timber', d: 'wood_dark' }, (a) => {
  for (let k = 0; k < 9; k++) {
    const g = box(-0.145, 0, -0.012, 0.145, 1.92, 0.012); g.rotateX(-0.09); g.translate(-0.2 + k * 0.05, 0.02, 0.1 - k * 0.012 + 0.012);
    a('w', g);
  }
  a('d', box(-0.22, 0, -0.04, 0.34, 0.07, 0.24)); a('d', box(-0.22, 0.07, 0.2, 0.34, 0.45, 0.24));
  for (let k = 0; k < 9; k += 2) a('d', box(-0.2 + k * 0.05 - 0.01, 1.84 - k * 0.01, 0.0 - k * 0.012 - 0.02, -0.2 + k * 0.05 + 0.01, 1.94 - k * 0.01, 0.0 - k * 0.012 + 0.02));
  a('d', box(-0.22, 1.5, 0.2, 0.34, 1.56, 0.24));
});

// the goods ------------------------------------------------------------------------------------------
unit('trestle', { t: 'lacquer_chestnut' }, (a) => {   // a trestle table 1.3 × 0.6 × 0.8
  a('t', box(-0.65, 0.76, -0.3, 0.65, 0.81, 0.3));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('t', box(sx * 0.58 - 0.025, 0, sz * 0.24 - 0.025, sx * 0.58 + 0.025, 0.76, sz * 0.24 + 0.025));
  for (const sz of [-1, 1]) a('t', box(-0.58, 0.22, sz * 0.24 - 0.012, 0.58, 0.26, sz * 0.24 + 0.012));
  for (const sx of [-1, 1]) a('t', box(sx * 0.58 - 0.012, 0.22, -0.24, sx * 0.58 + 0.012, 0.26, 0.24));
});
unit('stacks', { c: 'cloth_white' }, (a) => {         // folded cloth, volumes, packets: three stacks (on a table: y 0.81)
  const r = rng(11);
  for (const [x, n] of [[-0.4, 6], [0, 5], [0.4, 4]]) for (let k = 0; k < n; k++) a('c', box(x - 0.17 + (r() - 0.5) * 0.03, k * 0.052, -0.22 + (r() - 0.5) * 0.03, x + 0.17 + (r() - 0.5) * 0.03, k * 0.052 + 0.048, 0.22 + (r() - 0.5) * 0.03));
  a('c', box(-0.55, 0, -0.07, -0.54, 0.002, 0.07));
});
unit('bowls', { b: 'glaze_white' }, (a) => {          // three stacks of bowls and a lone one
  for (const [x, z, n] of [[-0.4, -0.08, 3], [0.0, 0.1, 3], [0.4, -0.06, 3], [-0.2, 0.18, 1]]) for (let k = 0; k < n; k++) a('b', bowl(x, k * 0.052, z, 1));
});
unit('jars', { j: 'pottery_dark', c: 'cloth_red', l: 'wood_dark' }, (a) => {   // five jars on the ground, caps bound on their mouths (y 0)
  for (const [x, z, r, h, cap] of [[-0.5, -0.1, 0.2, 0.58, 1], [-0.05, -0.15, 0.22, 0.64, 1], [0.42, -0.08, 0.19, 0.52, 1], [-0.28, 0.24, 0.16, 0.42, 0], [0.2, 0.22, 0.17, 0.46, 0]]) {
    a('j', jar(r, h, x, 0, z));
    if (cap) { a('c', ly([[r * 0.62, h - 0.02], [r * 0.7, h + 0.03], [r * 0.66, h + 0.06], [r * 0.5, h + 0.1], [r * 0.3, h + 0.12], [0.001, h + 0.13]], 14, x, 0, z)); a('l', ly([[r * 0.6, h - 0.06], [r * 0.61, h - 0.05], [r * 0.6, h - 0.04]], 12, x, 0, z)); }
    else { a('l', drum(r * 0.6, r * 0.52, 0.05, 12, x, h, z)); a('l', ly([[0.001, h + 0.05], [0.04, h + 0.05], [0.03, h + 0.09], [0.001, h + 0.1]], 10, x, 0, z)); }
  }
});
unit('baskets', { w: 'wicker', g: 'cloth_ochre' }, (a) => {    // wicker baskets of leaves, grain, fruit
  for (const [x, z, r, h] of [[-0.42, 0, 0.3, 0.34], [0.12, 0.1, 0.26, 0.3], [0.5, -0.06, 0.22, 0.26]]) {
    a('w', ly([[0.001, 0], [r * 0.7, 0], [r, h], [r * 0.95, h], [r * 0.66, 0.03], [0.001, 0.03]], 12, x, 0, z));
    a('g', ly([[r * 0.9, h - 0.04], [r * 0.6, h + 0.05], [r * 0.25, h + 0.1], [0.001, h + 0.12]], 10, x, 0, z));
  }
});
unit('sacks', { s: 'sacking' }, (a) => {            // sacks, three and two and one
  const sk = (x, y, z) => { const g = ly([[0.001, 0], [0.22, 0], [0.28, 0.14], [0.25, 0.42], [0.12, 0.56], [0.001, 0.58]], 10, 0, 0, 0); g.scale(1, 1, 0.8); return mv(g, x, y, z); };
  for (const x of [-0.5, 0, 0.5]) a('s', sk(x, 0, 0));
  for (const x of [-0.25, 0.25]) a('s', sk(x, 0.4, 0.02));
});
unit('bin', { w: 'timber', r: 'plaster', m: 'wood_dark' }, (a) => {   // a bin of grain with a measure on it
  a('w', box(-0.5, 0, -0.3, 0.5, 0.62, 0.3)); a('r', drum(0.46, 0.2, 0.2, 10, 0, 0.62, 0).scale(1, 1, 0.6)); a('w', box(-0.52, 0.55, -0.32, 0.52, 0.6, 0.32));
  a('m', box(0.1, 0.8, -0.1, 0.3, 0.98, 0.1)); a('m', box(-0.5, 0.2, 0.3, 0.5, 0.26, 0.34));
});
FINE = 1;
unit('mortar', { i: 'iron', w: 'timber', g: 'granite_grey' }, (a) => {  // the physician's iron roller in its trough (药碾)
  a('w', box(-0.5, 0, -0.16, 0.5, 0.3, 0.16));
  a('i', prismX([[-0.14, 0.3], [0.14, 0.3], [0.2, 0.42], [0.14, 0.5], [-0.14, 0.5], [-0.2, 0.42]], -0.46, 0.46));
  a('i', ly([[0.001, -0.18], [0.14, -0.18], [0.14, 0.18], [0.001, 0.18]], 12).rotateZ(Math.PI / 2).translate(0.0, 0.64, 0.0));
  a('i', rodG([-0.3, 0.64, 0], [0.3, 0.64, 0], 0.016, 5)); a('w', rodG([-0.9, 0.64, 0], [-0.3, 0.64, 0], 0.02, 5)); a('w', rodG([0.3, 0.64, 0], [0.9, 0.64, 0], 0.02, 5));
  a('g', drum(0.14, 0.1, 0.2, 8, 0.7, 0.0, 0.25));
});
FINE = 1;
unit('woks', { i: 'iron', w: 'timber', b: 'bronze' }, (a) => {   // woks and pans, an anvil on its block, tongs and hammers
  for (const [x, z, r, y] of [[-0.55, 0.06, 0.3, 0.0], [-0.55, 0.06, 0.27, 0.1], [-0.05, -0.06, 0.28, 0.0], [-0.05, -0.06, 0.25, 0.09]]) a('i', ly([[0.001, 0], [0.06, 0], [r * 0.6, 0.06], [r, 0.18], [r * 0.95, 0.19], [r * 0.5, 0.1], [0.001, 0.07]], 12, x, y, z));
  a('w', drum(0.2, 0.22, 0.4, 8, 0.55, 0, 0)); a('i', box(0.4, 0.4, -0.1, 0.7, 0.5, 0.1)); a('i', box(0.46, 0.5, -0.06, 0.64, 0.58, 0.06)); a('i', box(0.68, 0.45, -0.04, 0.8, 0.5, 0.04));
  a('i', rodG([0.15, 0.0, 0.3], [0.15, 0.7, 0.35], 0.012, 4)); a('i', rodG([0.25, 0.0, 0.3], [0.25, 0.7, 0.35], 0.012, 4));
  a('b', ly([[0.001, 0], [0.08, 0], [0.1, 0.1], [0.001, 0.12]], 8, -0.1, 0, 0.24));
});
unit('toolrack', { w: 'timber', i: 'iron' }, (a) => {         // a board hung with blades, scissors, hoes
  a('w', box(-0.6, 0.9, -0.02, 0.6, 1.5, 0.02)); for (const x of [-0.58, 0.58]) a('w', box(x - 0.025, 0, -0.04, x + 0.025, 0.9, 0.04));
  for (let k = 0; k < 6; k++) { const x = -0.48 + k * 0.19; a('i', box(x - 0.04, 1.0 + (k % 2) * 0.08, 0.02, x + 0.04, 1.4 - (k % 3) * 0.06, 0.036)); a('w', box(x - 0.02, 1.4 - (k % 3) * 0.06, 0.02, x + 0.02, 1.48, 0.04)); }
});
FINE = 1;
unit('umbrellas', { c: 'cloth_ochre', w: 'bamboo_culm', t: 'timber', r: 'cloth_red' }, (a) => {   // umbrellas (closed, in a stand; two open)
  a('t', box(-0.55, 0, -0.14, 0.55, 0.06, 0.14)); a('t', box(-0.55, 0.5, -0.14, 0.55, 0.54, 0.14)); for (const x of [-0.53, 0.53]) a('t', box(x - 0.02, 0, -0.14, x + 0.02, 0.9, 0.14));
  for (let k = 0; k < 6; k++) { const x = -0.45 + k * 0.18, z = (k % 2 ? 0.07 : -0.07); a('w', rodG([x, 0.06, z], [x, 1.2, z], 0.012, 4)); a('c', ly([[0.04, 1.2], [0.055, 0.95], [0.001, 0.7]], 6, x, 0, z).scale(1, 1, 1)); }
  a('r', rodG([-0.45, 1.2, 0.0], [-0.45, 1.3, 0.0], 0.015, 4));
});
unit('fans', { c: 'paint_white', w: 'bamboo_culm', r: 'cloth_red', t: 'timber' }, (a) => {   // round fans in a rack and a bundle of folding fans
  a('t', box(-0.55, 0, -0.1, 0.55, 0.05, 0.1)); for (const x of [-0.53, 0.53]) a('t', box(x - 0.02, 0, -0.1, x + 0.02, 1.0, 0.1)); a('t', box(-0.55, 0.96, -0.1, 0.55, 1.0, 0.1));
  for (let k = 0; k < 4; k++) { const x = -0.38 + k * 0.25; a('c', ly([[0.001, 0], [0.12, 0], [0.12, 0.012], [0.001, 0.012]], 10, 0, 0, 0).rotateX(Math.PI / 2).translate(x, 0.74, 0.0)); a('w', rodG([x, 0.52, 0.0], [x, 0.62, 0.0], 0.01, 4)); a('r', ly([[0.12, 0.0], [0.125, 0.0], [0.125, 0.014], [0.12, 0.014]], 10, 0, 0, 0).rotateX(Math.PI / 2).translate(x, 0.74, 0.0)); }
  for (let k = 0; k < 5; k++) a('w', rodG([-0.4 + k * 0.03, 0.05, 0.04], [-0.34 + k * 0.03, 0.4, 0.06], 0.008, 4));
});
FINE = 1;
FINE = 1;
unit('steamers', { b: 'brick_grey', i: 'iron', w: 'wicker', l: 'bamboo_culm', k: 'bronze', c: 'glaze_white' }, (a) => {   // a stove with the steamers stacked on it, a kettle, bowls
  a('b', box(-0.4, 0, -0.3, 0.4, 0.62, 0.3)); a('b', box(-0.12, 0.62, 0.18, 0.12, 1.25, 0.3));
  a('i', drum(0.3, 0.32, 0.12, 12, 0, 0.62, -0.02));
  for (let k = 0; k < 4; k++) { a('w', drum(0.29, 0.29, 0.1, 10, 0, 0.74 + k * 0.1, -0.02)); a('w', ly([[0.292, 0.74 + k * 0.1 + 0.03], [0.3, 0.74 + k * 0.1 + 0.04], [0.292, 0.74 + k * 0.1 + 0.05]], 14, 0, 0, -0.02)); }
  a('l', ly([[0.001, 1.14], [0.31, 1.14], [0.28, 1.18], [0.001, 1.24]], 12, 0, 0, -0.02));
  a('k', ly([[0.001, 0], [0.12, 0], [0.14, 0.1], [0.08, 0.2], [0.001, 0.22]], 9, 0.62, 0.0, -0.04)); a('k', rodG([0.74, 0.12, -0.04], [0.84, 0.22, -0.04], 0.012, 4));
  for (const [x, z] of [[-0.62, 0.0], [-0.62, 0.17], [-0.62, -0.17]]) a('c', bowl(x, 0, z, 1.1));
});
FINE = 1;
unit('scrolls', { w: 'bamboo_culm', p: 'paint_white', t: 'timber' }, (a) => {   // a stand of scrolls and rolls of paper, brushes in a pot
  a('t', box(-0.4, 0, -0.18, 0.4, 0.06, 0.18)); a('t', box(-0.4, 0.5, -0.18, 0.4, 0.54, 0.18));
  for (let k = 0; k < 10; k++) { const x = -0.45 + k * 0.1; a('p', drum(0.034, 0.034, 0.46, 8, x, 0.06, (k % 2) * 0.05 - 0.02)); a('w', drum(0.012, 0.012, 0.5, 6, x, 0.06, (k % 2) * 0.05 - 0.02)); }
  a('w', ly([[0.001, 0.54], [0.06, 0.54], [0.06, 0.66], [0.001, 0.66]], 8, 0.0, 0, -0.04));
  for (let k = 0; k < 5; k++) a('t', rodG([0.0 + k * 0.012 - 0.024, 0.6, -0.04], [(k - 2) * 0.03, 0.92, -0.04 + (k % 2) * 0.02], 0.006, 3));
});
unit('lacquer', { r: 'lacquer_red', k: 'lacquer_black', g: 'gilt_bronze' }, (a) => {   // lacquerware on the table: nested boxes, trays, bowls
  for (const [x, z, w, h] of [[-0.4, 0, 0.36, 0.2], [0.05, 0.05, 0.3, 0.26], [0.45, -0.04, 0.24, 0.18]]) { a('r', box(x - w / 2, 0, z - w / 2, x + w / 2, h, z + w / 2)); a('k', box(x - w / 2 - 0.01, h, z - w / 2 - 0.01, x + w / 2 + 0.01, h + 0.04, z + w / 2 + 0.01)); a('g', box(x - w / 2 + 0.03, h * 0.35, z + w / 2, x + w / 2 - 0.03, h * 0.65, z + w / 2 + 0.006)); }
  for (const [x, z, n] of [[-0.18, 0.2, 2], [0.28, 0.22, 2]]) for (let k = 0; k < n; k++) a('k', bowl(x, k * 0.05, z, 1.15));
});
unit('teajars', { j: 'glaze_white', l: 'wood_dark', s: 'bamboo_culm' }, (a) => {   // tea in lidded jars and a scoop, on a table
  for (const [x, z, r, h] of [[-0.45, 0.0, 0.12, 0.3], [-0.2, 0.06, 0.1, 0.24], [0.04, -0.02, 0.12, 0.32], [0.28, 0.05, 0.1, 0.26], [0.5, -0.04, 0.11, 0.28]]) { a('j', jar(r, h, x, 0, z)); a('l', drum(r * 0.6, r * 0.5, 0.05, 12, x, h, z)); a('l', ly([[0.001, h + 0.05], [0.035, h + 0.05], [0.03, h + 0.08], [0.001, h + 0.09]], 12, x, 0, z)); }
  a('s', rodG([0.1, 0.0, 0.22], [0.1, 0.0, 0.34], 0.02, 5));
});

// ── the shop: its parts, laid out by trade and by seed ────────────────────────────────────────────
/** The characters of a trade's own name, and the pool of names. */
const TRADE_CHAR = { cloth: '布', tea: '茶', rice: '米', medicine: '藥', lacquer: '漆', books: '書', wine: '酒', pottery: '瓷', iron: '金', fans: '扇', food: '麵', pawn: '當' };
/** The names of the houses (two characters before the trade's own): auspicious compounds, picked by the shop's seed. */
const NAMES = ['永和', '同和', '大昌', '泰昌', '元和', '正泰', '太和', '同泰', '永昌', '大和', '元昌', '正大', '正和', '永泰', '元泰', '太昌'];
const FLAG = { wine: ['cloth_white', 'cloth_indigo', 'cloth_ochre'], tea: ['cloth_green', 'cloth_ochre'], food: ['cloth_red', 'cloth_white', 'cloth_ochre'], cloth: ['cloth_indigo'], pawn: ['cloth_red', 'cloth_white'] };
/** The banner each trade hangs from its pole: [unit, y of its hook from the arm]. */
const BANNER = { wine: 'flag', food: 'flag', tea: 'flag', pawn: 'flag', cloth: 'streamers', medicine: 'gourd', rice: 'dou', lacquer: 'hbowl', books: 'hbook', pottery: 'hvase', iron: 'hpan', fans: 'humbrella' };
/** What each trade shows: [unit, materials, top (on a trestle) ?]. */
const GOODS = {
  cloth: [['stacks', { c: 'cloth' }, true], ['stacks', { c: 'cloth' }, true]],
  tea: [['teajars', {}, true], ['baskets', { g: 'cloth_green' }, false]],
  rice: [['sacks', {}, false], ['baskets', { g: 'cloth_white' }, false]],
  medicine: [['mortar', {}, false], ['stacks', { c: 'cloth_white' }, true], ['jars', { j: 'pottery_dark', c: 'cloth_ochre' }, false]],
  lacquer: [['lacquer', {}, true], ['lacquer', {}, true]],
  books: [['scrolls', {}, false], ['stacks', { c: 'book' }, true], ['stacks', { c: 'book' }, true]],
  wine: [['jars', { j: 'pottery_dark', c: 'cloth_red' }, false], ['bowls', { b: 'glaze_white' }, true], ['jars', { j: 'pottery_dark', c: 'cloth_red' }, false]],
  pottery: [['bowls', { b: 'glaze_blue' }, true], ['jars', { j: 'glaze_blue', c: 'cloth_white' }, false], ['jars', { j: 'glaze_blue', c: 'cloth_white' }, false]],
  iron: [['woks', {}, false], ['toolrack', {}, false]],
  fans: [['umbrellas', {}, false], ['fans', {}, false]],
  food: [['steamers', {}, false], ['bowls', { b: 'glaze_white' }, true], ['baskets', { g: 'cloth_ochre' }, false]],
  pawn: [],
};
const CLOTHS = ['cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_grey', 'cloth_brown', 'cloth_green', 'cloth_black'];
const BOOKS = ['cloth_white', 'cloth_indigo', 'cloth_brown'];
const PLATE = [['lacquer_black', 'gilt_bronze', 'paint_ochre'], ['lacquer_black', 'gilt_bronze', 'paint_ochre'], ['lacquer_black', 'gilt_bronze', 'paint_ochre'], ['lacquer_red', 'gilt_bronze', 'paint_ochre']];

/**
 * suzhou_shop: the signs and goods of one shop front { at (the middle of its front, on the lot's edge), y,
 * rot (out into the street), L (the front's width), v0 (the depth of the shutter line), trade, seed,
 * open (the lane-front shop, no name board), detail, water (its front on a canal: no goods outside) }.
 */
function suzhouShop(el, { bag, col }) {
  const rand = rng(el.seed || 1), pick = (a) => a[Math.floor(rand() * a.length)];
  const [cx, cz] = el.at, y0 = el.y ?? 0, rot = el.rot, L = el.L, v0 = el.v0, trade = el.trade, c = Math.cos(rot), s = Math.sin(rot);
  const loc = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
  const put = (name, { mats = {}, x = 0, z = 0, y = 0, ry = 0, k = 1 } = {}) => {
    const P = placer({ t: el.t, at: loc(x, z), y: y0 + y, rot: rot + ry, s: k }, bag);
    for (const [role, g] of Object.entries(U[name])) { let m = mats[role] ?? DEF[name][role]; if (WINDY.has(`${name}.${role}`)) m = windMat(m); if (globalThis.__shopStat) { const key = `${name}.${role}:${m}`; globalThis.__shopStat[key] = (globalThis.__shopStat[key] || 0) + 1; } P(m, g.clone()); }
  };
  // a character on a board, a sign or a wall: the near form (full relief, to about 20 m; a larger character a little farther) and
  // the far form (flat, to the street's end), in the hand the place's hash picks (script.js)
  const glyph = (ch, o) => {
    const [gx, gz] = loc(o.x, o.z), k = o.k, { near, far } = glyphShape(ch, Math.floor(hashPos(gx, gz, o.y) * HANDS.length));
    _gm.compose(_gp.set(gx, y0 + o.y, gz), _gq.setFromAxisAngle(_gu, rot + (o.ry ?? 0)), _gs.set(k, k, k));
    if (!bag.addInstance) { const g = near.clone(); placeHanging(g, _gm); bag.add(o.m, g); return; }
    bag.addInstance(o.m, near.clone(), _gm, { real: o.m, reach: Math.max(12, Math.min(25, k * 60)) });
    bag.addInstance(o.m, far.clone(), _gm, { real: o.m, reach: 230 });
  };
  const tc = TRADE_CHAR[trade] || '永';
  // the doorways in the street before this shop (its own, and a neighbour's that falls in its front): spans along the front kept clear of pole, shutters and goods
  const gaps = el.gaps ?? (el.gap ? [el.gap] : []), inGap = (x0, x1) => gaps.some((g) => x1 > g[0] && x0 < g[1]);

  // the name board: over the shutters on the shop board, or on the beam where there is none; its three characters
  // (the house's two-character name, then the trade's own) are 0.34 m tall, so that they read from across the street
  const house = pick(NAMES);
  {
    const k = el.open ? 1.1 : Math.min(1.2, (L - 0.5) / 1.9);
    const zp = el.open ? 0.05 - v0 : el.detail > 0 ? 0.18 - v0 : 0.02 - v0, yc = el.open ? 3.625 : el.detail > 0 ? 3.05 : 3.55;
    const [fm, bm, gm] = pick(PLATE);
    put('plate', { mats: { f: fm, b: bm }, z: zp, y: yc - 0.23 * k, k });
    const chars = [house[0], house[1], tc], pitch = 0.56 * k;
    chars.forEach((ch, j) => glyph(ch, { m: gm, x: (1 - j) * pitch, z: zp + 0.045 * k, y: yc, k: 0.34 * k }));
  }
  // the pawnshop (dang pu): its front a blank wall to the street with the one great character 當 painted on it, the tall counter within
  if (trade === 'pawn' && !el.open && !el.water) {
    put('pawnwall', { x: 0, z: 0.08 - v0, y: 0.9 });
    glyph('當', { m: 'cloth_white', x: 0, z: 0.08 - v0 + 0.052, y: 0.9 + 0.75, k: 1.05 });
  }
  // the signboard hung out of a post, and the pole with the trade's banner, at the two ends
  const side = rand() < 0.5 ? -1 : 1, zPost = 0.04 - v0;
  if (rand() < (el.water ? 0.8 : 0.7)) {
    const x = side * (L / 2 - 0.125), top = 3.08, chars = [house[0], house[1], tc];
    put('hsign', { x, z: zPost, y: top, k: 1 });
    for (const ry of [Math.PI / 2, -Math.PI / 2]) chars.forEach((ch, j) => glyph(ch, { m: 'paint_ochre', x: x + Math.sin(ry) * 0.036, z: zPost + 0.81, y: top - 0.42 - j * 0.34, ry, k: 0.31 }));
  }
  if (!el.water) {
    let x = -side * (L / 2 - 0.2); const zp = 0.2, bn = BANNER[trade];
    if (inGap(x - 0.5, x + 0.5) && !inGap(-x - 0.5, -x + 0.5)) x = -x;               // (a doorway at that end: the pole stands at the other)
    put('pole', { x, z: zp, k: 1 });
    // the banner at the end of the cross-arm
    const hang = { x, z: zp, y: 4.28 };
    if (bn === 'flag') {
      const cl = pick(FLAG[trade] || FLAG.wine);
      put('flag', { mats: { c: cl, e: cl === 'cloth_white' ? 'cloth_black' : 'cloth_white' }, ...hang });
      for (const ry of [Math.PI / 2, -Math.PI / 2]) put(`f${tc}`, { mats: { g: cl === 'cloth_white' || cl === 'cloth_ochre' ? 'cloth_black' : 'cloth_white' }, x: x + Math.sin(ry) * 0.012, z: zp + 0.5, y: 4.28 - 0.56, ry, k: 0.5 });
    } else if (bn === 'streamers') put('streamers', { mats: { c: pick(CLOTHS.slice(0, 5)) }, ...hang });
    else if (bn === 'hlantern') {
      put('hlantern', hang);
      for (const ry of [Math.PI / 2, -Math.PI / 2]) glyph(tc, { m: 'cloth_black', x: x + Math.sin(ry) * 0.222, z: zp + 0.5, y: 4.28 - 0.7, ry, k: 0.26 });
    } else if (bn) put(bn, bn === 'humbrella' ? { mats: { c: pick(['cloth_ochre', 'cloth_red', 'cloth_indigo']) }, ...hang } : bn === 'hbook' ? { mats: { c: pick(BOOKS) }, ...hang } : hang);
    if (col && !inGap(x - 0.5, x + 0.5)) col.circle(...loc(x, zp), 0.22, y0, y0 + 4.6);
  }
  // the shutters of the shop, some stacked against the end post (the boards taken down at the opening)
  if (!el.water && L > 3.2 && rand() < 0.65) { let sx = side * (L / 2 - 0.34); if (inGap(sx - 0.45, sx + 0.45)) sx = -sx; if (!inGap(sx - 0.45, sx + 0.45)) put('shutters', { x: sx, z: 0.0 - 0.15, ry: Math.PI, k: 1 }); }
  // goods on the apron and on trestles in front of the shutters, by trade
  if (!el.water) {
    const list = GOODS[trade] || GOODS.cloth, free0 = -L / 2 + 0.62, free1 = L / 2 - 0.62;
    let x = side > 0 ? free0 : free1, dir = side > 0 ? 1 : -1;
    const order = list;
    let first = true;
    for (const [name, m, top] of order) {
      const w = (name === 'trestle' || top ? 1.35 : name === 'umbrellas' || name === 'fans' || name === 'mortar' || name === 'woks' ? 1.4 : 1.2);
      let xc = x + dir * w / 2;
      for (const g of gaps) if (xc + w / 2 > g[0] && xc - w / 2 < g[1]) { x = dir > 0 ? g[1] : g[0]; xc = x + dir * w / 2; }   // (the doorways are kept clear)
      if (!first && (xc - w / 2 < free0 - 0.25 || xc + w / 2 > free1 + 0.25)) break;
      first = false;
      const mats = { ...m };
      if (mats.c === 'cloth') mats.c = pick(CLOTHS); else if (mats.c === 'book') mats.c = pick(BOOKS);
      const zc = 0.08 + rand() * 0.12, ry = (rand() - 0.5) * 0.25;
      if (top) { put('trestle', { x: xc, z: zc, ry }); put(name, { mats, x: xc, z: zc, y: 0.81, ry }); col?.circle(...loc(xc, zc), 0.5, y0, y0 + 0.85); }
      else { put(name, { mats, x: xc, z: zc, ry: name === 'bin' || name === 'woks' || name === 'umbrellas' || name === 'fans' || name === 'toolrack' || name === 'mortar' ? 0 : ry * 2 }); col?.circle(...loc(xc, zc), 0.45, y0, y0 + 0.8); }
      x += dir * (w + 0.12);
    }
  }
}
export { suzhouShop, U as __units };
