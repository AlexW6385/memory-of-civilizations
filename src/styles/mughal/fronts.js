// The dressing of the Taj Ganj's house fronts at eye level (docs/settlements/mughal-agra.md §14): an element of the street
// life (`mughal_front`, one per lot, built in style `life` so that every piece is an instance of a shape shared
// town-wide): over the door a garland of marigolds, by it the water jar (matka) on its stand, a stone bench
// (chabutra) with a neighbour sitting on it, a charpoy set out, cakes of dried dung (upla) stacked against the wall
// or heaped in a beehive store (bitora), firewood, hens, a goat or a tied zebu, a bamboo pole of washing out of an
// upper window, a tray of chillies; on a shop a hanging lamp from the beam, the cloth banner of the trade on its bracket,
// sacks, baskets and jars of its goods spilling onto the street, a mat of produce.
// Local frame of a lot as in townhouse.js (x along the front, z out into the street).

import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { placer, assembly, rng } from '../../objects/kit.js';
import { layoutOf, FH } from './townhouse.js';
import * as F from './furnish.js';

/** dung: cakes of dried dung stacked against a wall (v 0) or a beehive store, the bitora (v 1); local z+ out from the wall. */
function dung(el, { bag }) {
  const put = placer(el, bag), v = (el.v ?? 0) | 0;
  const A = assembly(`mughal-dung|${v}`, (a) => {
    if (v === 1) {
      a('d', lathe([[0.62, 0], [0.7, 0.18], [0.62, 0.55], [0.46, 0.95], [0.24, 1.25], [0.001, 1.4]], 10, null, 0, 0, 0.7));
      a('p', box(-0.18, 0, 0.0, 0.18, 0.5, 0.1));
      return;
    }
    for (let i = 0; i < 5; i++) for (let k = 0; k < 8 - i; k++) a('d', lathe([[0.001, 0], [0.135, 0], [0.14, 0.02], [0.125, 0.04], [0.001, 0.04]], 8, null, -1.0 + i * 0.14 + k * 0.28 + ((i + k) % 2) * 0.012, i * 0.04, 0.16 + (k % 2) * 0.012));
    // the cakes slapped on the wall to dry: a patch of handprints in rows
    for (let i = 0; i < 6; i++) for (let k = 0; k < 4; k++) a('d', box(-1.0 + i * 0.3, 0.5 + k * 0.26, 0, -1.0 + i * 0.3 + 0.2, 0.5 + k * 0.26 + 0.2, 0.02));
  });
  put('mud_plaster', A.d.clone());
  if (A.p) put('wood_dark', A.p.clone());
}

/** chabutra: a stone bench platform against a front, w long, 0.45 high, 0.6 deep. */
function chabutra(el, { bag, col }) {
  const put = placer(el, bag), w = Math.round((el.w ?? 1.8) * 2) / 2;
  const A = assembly(`mughal-chabutra|${w}`, (a) => { a('s', box(-w / 2, 0, 0, w / 2, 0.45, 0.62)); a('t', box(-w / 2 - 0.03, 0.45, -0.02, w / 2 + 0.03, 0.5, 0.66)); });
  put('sandstone_red', A.s.clone()); put('marble', A.t.clone());
  if (col) { const [x, z] = el.at, c = Math.cos(el.rot), s = Math.sin(el.rot), pts = [[-w / 2, 0], [w / 2, 0], [w / 2, 0.62], [-w / 2, 0.62]].map(([lx, lz]) => [x + lx * c + lz * s, z - lx * s + lz * c]); col.rect([Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))], el.y ?? 0, (el.y ?? 0) + 0.5); }
}

/** garland: strands of marigolds looped across a doorway { w } at the height y, hung 0.2 below at their ends' middle. */
function garland(el, { bag }) {
  const put = placer(el, bag), w = Math.round((el.w ?? 1.6) * 5) / 5;
  const A = assembly(`mughal-garland|${w}`, (a) => {
    for (const [k, yy] of [[0, 0], [1, -0.16]]) for (let i = 0; i <= 14; i++) {
      const u = i / 14, x = -w / 2 + w * u, y = yy - 0.22 * Math.sin(Math.PI * u) - k * 0.04, c = (i + k) % 3 === 0 ? 'r' : 'o';
      a(c, box(x - 0.035, y - 0.035, 0.0, x + 0.035, y + 0.035, 0.07));
    }
  });
  put('cloth_ochre', A.o.clone()); put('cloth_red', A.r.clone());
}

/** A charpoy set out in the street's edge: the bed in its frame, a quilt on it, and (opt.) the seated man. */
function charpoyOut(el, { bag, col }) {
  const [x, z] = el.at;
  F.charpoy(bag, col, x, el.y ?? 0, z, el.rot ?? 0, { quilt: el.quilt ?? 'cloth_indigo', made: el.made ?? true });
}

function front(el, ctx) {
  const L = layoutOf(el), { f, hw, shop, st, dx } = L, r = rng(((el.seed | 0) * 13 + 5) >>> 0), E = STYLES.life.elements, pick = (a) => a[Math.floor(r() * a.length)];
  const yaw = f.yaw, at = (lx, lz) => f.pt(lx, lz), sd = () => Math.floor(r() * 1e9);
  const sub = (name, o) => E[name]({ t: name, ...o }, ctx);
  const side = r() < 0.5 ? -1 : 1;
  if (shop) {
    // the lamp on the beam, the banner at one end on its bracket, the goods at the platform's other end on the street
    sub('hang_lantern', { at: at(-side * (hw * 0.5), 0.04), y: FH - 0.4, kind: 'white', rot: yaw, seed: sd() });
    sub('shop_sign', { at: at(side * (hw - 0.2), 0.02), y: 0, rot: yaw, h: 3.1, len: 1.5, cloth: pick(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon']), seed: sd() });
    const g = L.trade, gx = -side * (hw - 0.9);
    if (g === 'spice') { sub('sacks', { at: at(gx, 0.9), y: 0, rot: yaw, n: 4, mat: pick(['sacking', 'linen']), seed: sd() }); if (r() < 0.6) sub('drying_tray', { at: at(gx + side * 1.1, 1.0), y: 0, rot: yaw, seed: sd() }); }
    else if (g === 'pots' || g === 'brass') { sub('pot', { kind: pick(['water_pot', 'dark_pot', 'matka']), n: 3, at: at(gx, 0.9), y: 0, seed: sd() }); sub('pot', { kind: 'water_pot', n: 4, at: at(gx + side * 1.0, 1.2), y: 0, seed: sd() }); }
    else if (g === 'cloth' || g === 'carpets') sub('basket', { at: at(gx, 0.9), y: 0, rot: yaw, n: 3, goods: pick(['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo']), seed: sd() });
    if (r() < 0.3) sub('goods_mat', { at: at(r() * hw * 0.8 * side, 1.9), y: 0, rot: yaw, goods: pick([['melons', 'greens'], ['pottery', 'baskets'], ['spice', 'heap'], ['bread', 'baskets']]), seed: sd() });
    if (r() < 0.25) sub('chickens', { kind: 'hen', n: 3, at: at(r() * hw * 0.6, 1.6), y: 0, seed: sd() });
    if (r() < 0.12) sub('animal', { kind: pick(['goat', 'dog', 'zebu']), at: at(side * (hw * 0.4), 2.4), y: 0, rot: yaw + (r() - 0.5) * 2, seed: sd() });
    if (st > 1 && L.variant !== 'loggia' && r() < 0.3) sub('laundry_pole', { at: at(-hw + 1.3, 0.1), y: FH + 0.75, rot: yaw, len: 2.2, prop: false, seed: sd() });
    return;
  }
  const doorSide = dx > 0 ? 1 : -1;
  sub('pot', { kind: 'matka', at: at(dx + doorSide * 1.35, 0.55), y: 0, seed: sd() });
  if (r() < 0.55) sub('garland', { at: at(dx, 0.13), y: 2.55, rot: yaw, w: 1.5 });
  const wall = -doorSide * (hw - 1.1);                         // the far side of the front from the door, free for what is heaped there
  if (r() < 0.45) sub('dung', { at: at(wall, 0.0), y: 0, rot: yaw, v: r() < 0.7 ? 0 : 1 });
  else if (r() < 0.35) sub('firewood', { at: at(wall, 0.45), y: 0, rot: yaw, len: 1.4, seed: sd() });
  if (r() < 0.4 && hw > 3.2) {
    const bx = Math.max(-hw + 1.0, Math.min(hw - 1.0, dx - doorSide * 2.1));
    if (Math.abs(bx - dx) > 1.7 && Math.abs(bx - wall) > 1.6) {
      sub('chabutra', { at: at(bx, 0.16), y: 0, rot: yaw, w: 1.8 });
      if (r() < 0.6) sub('figure', { at: at(bx + (r() - 0.5) * 0.4, 0.46), y: 0, rot: yaw + Math.PI, seed: sd(), dress: 'robe', pose: 'sit', cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_blue']), cloth2: 'cloth_white', hat: 'turban', hatMat: pick(['cloth_white', 'cloth_red']), hair: 'short', beard: r() < 0.6, over: 'sash', skin: pick(['skin_medium', 'skin_dark']) });
    }
  }
  if (r() < 0.22) sub('charpoy_out', { at: at(wall * 0.3 + (r() - 0.5), 1.5), y: 0, rot: yaw, quilt: pick(['cloth_red', 'cloth_indigo', 'cloth_green']), made: r() < 0.6 });
  if (r() < 0.25) sub('chickens', { kind: 'hen', n: 3, at: at(r() * hw * 0.6, 1.5), y: 0, seed: sd() });
  if (r() < 0.12) sub('animal', { kind: pick(['goat', 'zebu', 'dog', 'goat']), at: at(wall * 0.5, 2.3), y: 0, rot: yaw + (r() - 0.5) * 2.4, seed: sd() });
  if (r() < 0.14) sub('drying_tray', { at: at(r() * hw * 0.5, 1.2), y: 0, rot: yaw, seed: sd() });
  if (st > 1 && r() < 0.4) sub('laundry_pole', { at: at(-doorSide * (hw - 1.3), 0.1), y: FH + 0.75, rot: yaw, len: 2.2, prop: false, seed: sd() });
}

STYLES.life.elements.mughal_front = front;
STYLES.life.elements.dung = dung;
STYLES.life.elements.chabutra = chabutra;
STYLES.life.elements.garland = garland;
STYLES.life.elements.charpoy_out = charpoyOut;
void fromTriangles;
export { front };
