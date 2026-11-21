// Ayutthaya about 1687 — wear and writing (docs/settlements/ayutthaya.md §13.5). Wraps the siamese style's `thai_house` from here (the style files stay
// as they were); pure functions of each element's own numbers, nothing random:
//  - the stair of an entered house worn dark down the middle of its treads, and the worn sill of its door; the threshold of an entered shop polished by the feet
//    that cross it; the black mildew of the monsoon running down the shophouses' piers from under the lintel (§10) — all in `tile_dark`, which the tile already holds,
//    a hair above the surface they lie on (the chedis' cornice streaks were tried and dropped: they cost an arrival draw);
//  - the shop signs of the Chinese merchants (§11.1): one Chinese character in relief on both faces of the gilt plaque that hangs from the shop's front, where the trade
//    is a Chinese one and the character is in the brush's own table (brush-data.js: 香 incense, 米 rice, 布 cloth, 茶 tea); the Siamese sellers' shops have no writing,
//    and there is no Thai script anywhere (it is not modelled: the letters cannot be checked).
import '../../styles/siamese/index.js';
import './walkwork.js';
import './nightlight.js';
import { box } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { frame } from '../../styles/khmer/village.js';
import { rng } from '../../styles/siamese/houses.js';
import { reliefGeometry } from '../ming-suzhou/brush.js';
import { GLYPH } from '../ming-suzhou/brush-data.js';
import { shopGap, hashAt } from './walkwork.js';

/** What each Chinese trade writes on its sign: one character [inferred: incense and candles, rice, cloth, tea]. */
export const SIGN = { offerings: '香', rice: '米', cloth: '布', chinese: '茶' };

const rect = (bag, mat, R, y0, y1) => bag.add(mat, box(R[0], y0, R[1], R[2], y1, R[3]));

function wearShop(el, bag) {
  const { W, R, F, hF, hS } = frame(el.rect, el.front), { side, ug } = shopGap(el, hS), y0 = 0.3, uy = y0 + 3.1 + 0.25;
  // the threshold: the plinth's top polished dark where the feet cross it, at the gap beside the counter
  rect(bag, 'tile_dark', R(ug - 0.34, ug + 0.34, hF - 0.4, hF + 0.24), y0 + 0.002, y0 + 0.005);
  // mildew running down the piers' fronts from under the lintel
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const q = W(s * (hS - 0.37), hF), r = hashAt(q[0] + i, q[1], 51 + i), r2 = hashAt(q[0], q[1] + i, 61), u = s * (hS - 0.12 - 0.5 * r), w = 0.04 + 0.07 * r2, len = 0.5 + 1.5 * hashAt(q[0] + i, q[1] + 3, 71);
    rect(bag, 'tile_dark', R(u - w, u + w, hF + 0.006, hF + 0.012), y0 + 2.58 - len, y0 + 2.58);
  }
  // the sign: one character in relief on each face of the gilt plaque (its faces look along the lane)
  const ch = SIGN[el.trade], strokes = ch && GLYPH[ch];
  if (strokes) {
    const sgn = -side, pu = sgn * (hS - 0.05), pv = hF + 0.95, pc = uy - 0.65;
    for (const face of [-1, 1]) {
      const n = [face * -F[1] * 0 + 0, 0], dn = W(pu + face * 0.03, pv), dw = W(pu + face * 0.03 + face, pv), nx = dw[0] - dn[0], nz = dw[1] - dn[1];
      void n;
      // basis: x → the viewer's right (nz, -nx), y → up, z → the face's normal (nx, nz)
      const g = reliefGeometry(strokes, 0, 0, 0.2, 0.002, 0.012, { thick: 1 });
      g.applyMatrix4(new Matrix4().set(nz, 0, nx, dn[0], 0, 1, 0, pc, -nx, 0, nz, dn[1], 0, 0, 0, 1));
      bag.add('timber_red', g);
    }
  }
}
function wearStilt(el, bag) {
  const { W, R, hF, hS } = frame(el.rect, el.front), r = rng(el.seed || 1), up = 1.9 + r() * 0.6; r(); r();
  const door = (r() < 0.5 ? -1 : 1) * hS * 0.38, td = el.kind === 'small' ? 0.9 : el.kind === 'big' ? 2.3 : 1.6, vb = hF - td;
  // the stair: its treads worn dark along their middle (the treads' own heights: the style's stair, 0.34 m deep, 1.0 m wide)
  const run = 0.34, nSteps = Math.ceil(up / 0.3), rise = up / nSteps, vd = hF + 0.02;
  for (let n = 1; n < nSteps; n++) { const v0 = vd + (n - 1) * run, y = up - n * rise; rect(bag, 'tile_dark', R(-0.27, 0.27, v0 + 0.05, v0 + run - 0.06), y + 0.002, y + 0.005); }
  // the door's sill, and the terrace's boards before it
  rect(bag, 'tile_dark', R(door - 0.38, door + 0.38, vb - 0.06, vb + 0.5), up + 0.002, up + 0.005);
  void W;
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.siamese.elements, house = E.thai_house;
  E.thai_house = function worn(el, ctx) {
    const r = house.call(this, el, ctx);
    if (el.simple) return r;
    if (el.kind === 'shop') { if (el.walk || el.trade) wearShop(el, ctx.bag); } else if (el.walk) wearStilt(el, ctx.bag);
    return r;
  };
}
registerWear();
