// The opened shops (lavki) of the trading rows (docs/settlements/muscovy.md §12): what stands inside the shops the visitor can enter, as the style
// element `lavka_open`, built into a plan that is drawn only near the visitor (town.js): the counter's wares, the goods of the shop's trade on
// its shelves and floor, the hung sign of the trade at the door, the keeper, and the colliders of the counter, the shelves and the heavy goods.
// The shell (the wide door, the free room, the side counter, the piers) is the style's rows() with `open` keys (styles/muscovite/index.js).
// Shop frame: u along z from the cell's start, w into the room from the slab's inner face, v up. [inferred throughout: see the dossier.]
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { SLAB } from '../../styles/muscovite/rowsgeo.js';

const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const CLOTH = ['cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'linen'];

/** The trades of the rows and the kind (0 cloth, 1 pots, 2 hides, 3 baskets) of the generic goods on the back shelves that fits each. */
export const TRADE_SHELF = { cloth: 0, hats: 3, boots: 2, candles: 3, icons: 0, pots: 1, iron: 1, furs: 2, fish: 3, flour: 3, bread: 3, saddles: 2 };

/** One opened shop's contents. el: { s (the shop: x0, sg, z0, step, depth), trade, seed, keeper, y }. */
function lavka(el, { bag, col }) {
  const { s, trade, y = 0 } = el, r = rng(el.seed), sg = s.sg, st = s.step, D = s.depth;
  const X = (w) => s.x0 - sg * w, Z = (u) => s.z0 + u;
  const B = (m, u0, u1, v0, v1, w0, w1) => bag.add(m, box(Math.min(X(w0), X(w1)), y + v0, Z(u0), Math.max(X(w0), X(w1)), y + v1, Z(u1)));
  const L = (m, prof, seg, u, w, v) => bag.add(m, lathe(prof, seg, null, X(w), y + v, Z(u)));
  const C = (u0, u1, w0, w1, v0, v1) => col.rect([Math.min(X(w0), X(w1)), Z(u0), Math.max(X(w0), X(w1)), Z(u1)], y + v0, y + v1);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const u1 = st - 0.17;                                                      // the room's far side wall (the near one is at 0.17, the counter's side)
  // the counter (built by the shell): its colliders; the back shelves (a strip along the back wall)
  C(0.17, 0.72, 0, 1.7, 0, 0.95); C(0.2, u1, D - 0.5, D, 0, 2.2);
  const on = 0.92;                                                           // the counter's top
  const stack = (m, u, w, n, lw = 0.4, ld = 0.3) => { for (let k = 0; k < n; k++) B(m, u + 0.005 * k, u + lw - 0.005 * k, on + k * 0.07, on + (k + 1) * 0.07, w, w + ld); };
  const pot = (m, u, w, v, sc = 1) => L(m, [[0.001, 0], [0.09 * sc, 0.01], [0.15 * sc, 0.1 * sc], [0.17 * sc, 0.2 * sc], [0.12 * sc, 0.3 * sc], [0.13 * sc, 0.33 * sc], [0.001, 0.33 * sc]], 8, u, w, v);
  const barrel = (u, w, h = 0.8) => { L('timber', [[0.26, 0], [0.32, h * 0.5], [0.26, h], [0.001, h]], 10, u, w, 0); C(u - 0.3, u + 0.3, w - 0.3, w + 0.3, 0, h); };
  const sack = (u, w, v, m = 'sacking') => B(m, u - 0.22, u + 0.22, v, v + 0.5, w - 0.17, w + 0.17);
  const peg = (u, v, w = 0.12) => B('timber', u - 0.02, u + 0.02, v, v + 0.03, w, w + 0.14);
  const wallU = u1 - 0.02;                                                   // goods hung on the far side wall hang from here
  const hang = (m, v, w, h, wd = 0.3) => B(m, wallU - 0.04, wallU, v, v + h, w, w + wd);
  const emblem = { cloth: 'cloth_red', hats: 'hide_black', boots: 'hide_brown', candles: 'hide_tan', icons: 'gilt_bronze', pots: 'terracotta', iron: 'pottery_dark', furs: 'hide_tan', fish: 'hide_grey', flour: 'sacking', bread: 'wicker', saddles: 'hide_brown' }[trade] || 'timber';
  switch (trade) {
    case 'cloth':
      for (let k = 0; k < 3; k++) stack(pick(CLOTH), 0.2 + k * 0.45 * 0.25, 0.25 + k * 0.5, 3 + (k % 2));
      B('timber', wallU - 0.03, wallU, 1.2, 1.26, 0.2, 1.4);                  // the ell-rod hung on the wall
      for (let k = 0; k < 3; k++) hang(pick(CLOTH), 1.1 + k * 0.0, 0.3 + k * 0.5, 0.9, 0.35);
      break;
    case 'hats':
      for (let k = 0; k < 4; k++) { const w = 0.3 + k * 0.45; peg(wallU - 0.16, 1.5, w); L(pick(['cloth_grey', 'hide_brown', 'hide_black', 'cloth_red']), [[0.001, 0], [0.14, 0], [0.13, 0.06], [0.1, 0.2], [0.001, 0.22]], 8, wallU - 0.18, w + 0.07, 1.42); }
      for (let k = 0; k < 3; k++) L(pick(['cloth_grey', 'hide_brown', 'hide_black']), [[0.001, 0], [0.17, 0], [0.16, 0.08], [0.12, 0.2], [0.001, 0.22]], 8, 0.34 + k * 0.1, 0.3 + k * 0.22, on);
      break;
    case 'boots':
      for (let k = 0; k < 4; k++) { const w = 0.3 + k * 0.45; B('hide_brown', wallU - 0.14, wallU - 0.05, 1.3, 1.78, w, w + 0.14); B('hide_black', wallU - 0.14, wallU - 0.05, 1.22, 1.3, w - 0.02, w + 0.3); B('hide_brown', wallU - 0.14, wallU - 0.05, 1.3, 1.78, w + 0.2, w + 0.34); B('hide_black', wallU - 0.14, wallU - 0.05, 1.22, 1.3, w + 0.18, w + 0.5); }
      for (let k = 0; k < 3; k++) { B('hide_brown', 0.25 + k * 0.1, 0.38 + k * 0.1, on, on + 0.28, 0.3 + k * 0.22, 0.4 + k * 0.22); B('hide_black', 0.23 + k * 0.1, 0.4 + k * 0.1, on, on + 0.05, 0.28 + k * 0.22, 0.58 + k * 0.22); }
      break;
    case 'candles':
      for (let k = 0; k < 6; k++) { const w = 0.3 + k * 0.3; B('linen', wallU - 0.18, wallU - 0.14, 1.0, 1.45, w, w + 0.04); B('hide_tan', wallU - 0.2, wallU - 0.12, 1.45, 1.5, w - 0.02, w + 0.06); }
      for (let k = 0; k < 4; k++) L(k % 2 ? 'hide_tan' : 'linen', [[0.001, 0], [0.12, 0], [0.12, 0.09], [0.001, 0.09]], 8, 0.3 + k * 0.04, 0.35 + k * 0.28, on);
      B('hide_tan', 0.28, 0.6, on, on + 0.4, 0.3, 0.46);
      break;
    case 'icons':
      for (let k = 0; k < 5; k++) { const w = 0.25 + k * 0.4; B('wood_painted', wallU - 0.05, wallU - 0.02, 1.3 + (k % 2) * 0.35, 1.78 + (k % 2) * 0.35, w, w + 0.32); B('gilt_bronze', wallU - 0.056, wallU - 0.05, 1.5 + (k % 2) * 0.35, 1.7 + (k % 2) * 0.35, w + 0.06, w + 0.26); }
      for (let k = 0; k < 2; k++) { B('wood_painted', 0.3 + k * 0.1, 0.34 + k * 0.1, on, on + 0.34, 0.3 + k * 0.4, 0.6 + k * 0.4); B('gilt_bronze', 0.346 + k * 0.1, 0.35 + k * 0.1, on + 0.1, on + 0.26, 0.36 + k * 0.4, 0.54 + k * 0.4); }
      break;
    case 'pots':
      for (let k = 0; k < 5; k++) pot('terracotta', 0.4 + (k % 2) * 0.25, 0.3 + k * 0.28, on, 0.9);
      for (let k = 0; k < 3; k++) { pot(k % 2 ? 'pottery_dark' : 'terracotta', 1.0 + k * 0.5, D - 0.95, 0, 1.4 + 0.15 * k); C(0.85 + k * 0.5, 1.15 + k * 0.5, D - 1.2, D - 0.7, 0, 0.5); }
      break;
    case 'iron':
      for (let k = 0; k < 6; k++) { const w = 0.3 + k * 0.3; B('pottery_dark', wallU - 0.1, wallU - 0.06, 1.3, 1.62 + (k % 3) * 0.1, w, w + 0.04); B('timber', wallU - 0.1, wallU - 0.06, 1.2, 1.3, w - 0.02, w + 0.06); }
      for (let k = 0; k < 3; k++) B('pottery_dark', 0.3 + k * 0.12, 0.42 + k * 0.12, on, on + 0.07, 0.3 + k * 0.3, 0.55 + k * 0.3);
      B('pottery_dark', 1.2, 1.6, 0, 0.45, D - 1.3, D - 0.9); C(1.2, 1.6, D - 1.3, D - 0.9, 0, 0.45);
      break;
    case 'furs':
      for (let k = 0; k < 4; k++) { const w = 0.3 + k * 0.45; hang(k % 2 ? 'hide_tan' : 'hide_brown', 0.95, w, 0.9, 0.34); hang('hide_white', 1.7, w + 0.04, 0.2, 0.26); }
      for (let k = 0; k < 2; k++) B(pick(['hide_brown', 'hide_grey', 'hide_tan']), 0.25, 0.65, on + k * 0.1, on + 0.1 + k * 0.1, 0.3, 0.8);
      break;
    case 'fish':
      barrel(0.7, D - 0.75); barrel(1.7, D - 0.7, 0.7); barrel(2.3, D - 0.9, 0.9);
      for (let k = 0; k < 5; k++) { const w = 0.3 + k * 0.35; B('hide_grey', wallU - 0.12, wallU - 0.08, 1.1, 1.6, w, w + 0.1); }
      for (let k = 0; k < 3; k++) B('hide_grey', 0.3, 0.55, on, on + 0.05, 0.3 + k * 0.4, 0.62 + k * 0.4);
      break;
    case 'flour':
      for (let k = 0; k < 4; k++) sack(0.5 + (k % 2) * 0.6, D - 0.75 - Math.floor(k / 2) * 0.1, Math.floor(k / 2) * 0.5 + (k % 2) * 0, k % 3 ? 'sacking' : 'linen');
      C(0.3, 1.3, D - 1.0, D - 0.5, 0, 1.0);
      sack(1.9, D - 0.7, 0); C(1.68, 2.12, D - 0.88, D - 0.52, 0, 0.5);
      L('wicker', [[0.2, 0], [0.26, 0.15], [0.001, 0.15]], 10, 0.42, 0.7, on);
      break;
    case 'bread':
      for (let k = 0; k < 4; k++) { L('wicker', [[0.2, 0], [0.26, 0.15], [0.001, 0.15]], 10, 0.4 + (k % 2) * 0.1, 0.3 + k * 0.3, on); B('hide_tan', 0.3 + (k % 2) * 0.1, 0.5 + (k % 2) * 0.1, on + 0.15, on + 0.22, 0.2 + k * 0.3, 0.4 + k * 0.3); }
      for (let k = 0; k < 4; k++) { const w = 0.3 + k * 0.4; L('hide_tan', [[0.001, 0], [0.12, 0], [0.12, 0.03], [0.001, 0.03]], 8, wallU - 0.14, w + 0.1, 1.5); }
      break;
    case 'saddles':
      B('timber', 0.8, 1.9, 0.6, 0.68, 0.6, 1.0); B('timber', 0.85, 0.93, 0, 0.6, 0.6, 1.0); B('timber', 1.77, 1.85, 0, 0.6, 0.6, 1.0); C(0.8, 1.9, 0.6, 1.0, 0, 0.7);
      B('hide_brown', 1.0, 1.7, 0.68, 0.84, 0.66, 0.94); B('hide_black', 1.0, 1.1, 0.84, 0.92, 0.7, 0.9);
      for (let k = 0; k < 3; k++) { const w = 0.3 + k * 0.5; B('hide_brown', wallU - 0.1, wallU - 0.06, 1.1, 1.8, w, w + 0.05); B('pottery_dark', wallU - 0.14, wallU - 0.06, 1.0, 1.12, w - 0.04, w + 0.12); }
      break;
    default: break;
  }
  // the trade's sign hung at the door: a bracket from the far pier and the thing itself (a boot, a hat, a bundle of candles, a pot)
  { const w = -0.55, v = 2.15; B('timber', st - 0.16, st - 0.12, v + 0.28, v + 0.32, w, SLAB * 0.0 + 0.0); B(emblem, st - 0.22, st - 0.06, v - 0.1, v + 0.28, w - 0.04, w + 0.12); }
  // the keeper behind the counter at the room's back, facing the door; built here, not placed in the street life (its figures are drawn at 170 m)
  if (STYLES.life && el.keeper) {
    const a = [X(D - 0.65), Z(0.62)], t = [X(0), Z(1.5)];
    STYLES.life.elements.figure({ at: a, y: y + 0.02, rot: Math.atan2(-(t[0] - a[0]), -(t[1] - a[1])), pose: 'stand', carry: 'none', ...el.keeper }, { bag, col });
  }
}

/** Register `lavka_open` with the style (called by index.js). */
export function registerLavki() {
  const S = STYLES.muscovite;
  if (S && !S.elements.lavka_open) S.elements.lavka_open = (el, ctx) => { for (const one of el.list) lavka({ ...one, y: el.y }, ctx); };
}
registerLavki();
/** A keeper's dress by seed (as the street life's people of town.js). */
export function keeperOf(seed) {
  const r = rng(seed ^ 0x5bd1e995), pick = (a) => a[Math.floor(r() * a.length)];
  return { dress: 'robe', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: 'skin_light', hat: r() < 0.6 ? 'cap' : 'none', hatMat: r() < 0.5 ? 'hide_brown' : 'cloth_red', hair: r() < 0.6 ? 'short' : 'long', beard: r() < 0.75 ? 1 : 0, legs: 'hose', feet: 'shod', over: r() < 0.4 ? 'sash' : 'apron', seed: Math.floor(r() * 1e9) };
}
