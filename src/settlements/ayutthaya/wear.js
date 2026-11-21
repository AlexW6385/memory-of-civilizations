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
import { box, lathe, rod } from '../../core/geom.js';
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
  for (let n = 1; n < nSteps; n++) { const v0 = vd + (n - 1) * run, y = up - n * rise; rect(bag, 'pottery_dark', R(-0.27, 0.27, v0 + 0.05, v0 + run - 0.06), y + 0.002, y + 0.005); }
  // the door's sill, and the terrace's boards before it
  rect(bag, 'pottery_dark', R(door - 0.38, door + 0.38, vb - 0.06, vb + 0.5), up + 0.002, up + 0.005);
  // the room's household things on its floor (the style gives mats, hearth, chest and altar; the middle of the floor stayed bare): a low round tray-table with
  // rice bowls and a pot of curry, a winnowing tray with a heap of rice, a betel set, a big water jar by the wall, away from the door's lane [inferred]
  const lat = (m, prof, u, v, y, seg = 8) => { const [x, z] = W(u, v); bag.add(m, lathe(prof, seg, null, x, y, z)); };
  const sg = door < 0 ? 1 : -1, rv0 = -hF + 0.15, rv1 = vb - 0.15, mid = (rv0 + rv1) / 2, tu = sg * Math.min(0.9, hS * 0.4), tv = mid - 0.1;
  lat('timber', [[0.001, 0.32], [0.34, 0.32], [0.34, 0.35], [0.001, 0.35]], tu, tv, up, 12);
  for (const a of [0.8, 2.9, 5.0]) { const [x, z] = W(tu + Math.cos(a) * 0.23, tv + Math.sin(a) * 0.23); bag.add('timber', rod([x, up, z], [x, up + 0.32, z], 0.025, 4)); }
  for (let i = 0; i < 3; i++) { const a = i * 2.1 + 0.4; lat(i === 1 ? 'pottery_dark' : 'terracotta', [[0.001, 0.35], [0.06, 0.35], [0.1, 0.4], [0.11, 0.43], [0.001, 0.43]], tu + Math.cos(a) * 0.17, tv + Math.sin(a) * 0.17, up, 7); }
  lat('wicker', [[0.001, 0.0], [0.3, 0.015], [0.34, 0.05], [0.001, 0.03]], tu + sg * -0.2, tv - 1.0, up, 10);
  lat('wicker', [[0.001, 0.02], [0.2, 0.02], [0.12, 0.09], [0.001, 0.12]], tu + sg * -0.2, tv - 1.0, up, 8);
  lat('wicker', [[0.001, 0.0], [0.13, 0.0], [0.14, 0.05], [0.001, 0.05]], tu + sg * 0.6, tv + 0.6, up, 8);
  lat('timber', [[0.001, 0.05], [0.04, 0.05], [0.05, 0.09], [0.001, 0.09]], tu + sg * 0.6, tv + 0.6, up, 6);
  lat('terracotta', [[0.001, 0], [0.2, 0], [0.3, 0.15], [0.32, 0.35], [0.25, 0.55], [0.18, 0.62], [0.001, 0.62]], sg * (hS - 0.5), rv0 + 0.8 + 0.3 * hashAt(el.rect[0], el.rect[1], 5), up, 9);
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.siamese.elements, house = E.thai_house;
  const chedi = E.chedi;
  if (chedi) E.chedi = function mildewed(el, ctx) {
    const r = chedi.call(this, el, ctx);
    if (el.mini || (el.w ?? 14) < 8) return r;
    // black mildew of the monsoon running down the pedestals' faces from under each tier's cornice, in the gaps between the dentils (§10) [inferred]; in `opening`,
    // a dark material the landmark's plan already holds (a new material there costs the arrival a draw)
    const [cx, cz] = el.c, y = el.y ?? 0, w = el.w ?? 14, k = w / 14, v = (el.h ?? 36) / 36, a = w / 2;
    for (const [rr, y0, y1] of [[a, 0, 1.7 * v], [a * 0.86, 1.7 * v, 3.2 * v], [a * 0.72, 3.2 * v, 4.5 * v]]) {
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let u = -rr + 0.5 * k + 0.375 * k, n = 0; u < rr - 0.6 * k; u += 0.75 * k, n++) {
        const h1 = hashAt(cx + dx * 3 + n, cz + dz * 3 + y1, 81); if (h1 > 0.3) continue;
        const len = (0.12 + 0.3 * hashAt(cx + n, cz + y1, 82)) * v + 0.1, hw = (0.025 + 0.03 * hashAt(cx, cz + n, 83)) * k, top = y + y1 - 0.64 * v, bot = Math.max(top - len, y + y0 + 0.3 * v);
        const px = cx + dx * rr + (dz ? u : 0), pz = cz + dz * rr + (dx ? u : 0);
        const e = 0.012, x0 = px + (dx ? Math.min(0, e * dx) : -hw), x1 = px + (dx ? Math.max(0, e * dx) : hw), z0 = pz + (dz ? Math.min(0, e * dz) : -hw), z1 = pz + (dz ? Math.max(0, e * dz) : hw);
        ctx.bag.add('opening', box(x0, bot, z0, x1, top, z1));
      }
    }
    return r;
  };
  E.thai_house = function worn(el, ctx) {
    const r = house.call(this, el, ctx);
    if (el.simple) return r;
    if (el.kind === 'shop') { if (el.walk || el.trade) wearShop(el, ctx.bag); } else if (el.walk) wearStilt(el, ctx.bag);
    return r;
  };
}
registerWear();
