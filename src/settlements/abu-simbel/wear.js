// Abu Simbel's wear (docs/settlements/abu-simbel.md §22): what feet, hands, smoke and the desert wind did to the camp and the terrace in a few years of use —
// the doorsteps worn to a dish, the plaster flaked off the lane walls to the mudbrick under it, soot over the doors of the trades that kept a fire, sand blown
// into the doorways, the paving black under the terrace's braziers. Thin pieces in materials the camp already uses (no new draw), placed from each lot's own seed
// and door (walk.js doorX): no counters, no Math.random. Not built: inscriptions and signs (§22: no sign of the writing could be checked glyph by glyph).
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { TERRACE, lots } from './layout.js';

const hash = (a, b = 0) => { let h = Math.imul(Math.floor(a * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 97.31) + 0x7f4a7c15, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
/** A box turned a little about y (laid by hand, not on the grid): such pieces never match one another as instanced copies. */
const tbox = (x0, y0, z0, x1, y1, z1, ang) => { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, g = box(x0 - cx, y0, z0 - cz, x1 - cx, y1, z1 - cz); g.rotateY(ang); g.translate(cx, 0, cz); return g; };
const SOOTY = new Set(['potter', 'jeweller', 'brewer']);

/** abu_wear { doors: [{ x, zo (the wall's outer face), s (+1 faces south, −1 north), seed, trade, kind, xr: [x0, x1] }] }: the wear at each door. */
function wearEl(el, { bag }) {
  for (const d of el.doors) {
    const { x, zo, s, seed } = d, a = hash(seed, 1), b = hash(seed, 2), c = hash(seed, 3);
    const zs = (u0, u1) => (s > 0 ? [zo + u0, zo + u1] : [zo - u1, zo - u0]);
    // the doorstep worn to a dish: a slab of limestone with a darker hollow where feet cross it (clear of the style's own threshold)
    { const hw = 0.7 + a * 0.16, dp = 0.68 + b * 0.14, th = 0.03 + c * 0.012, [z0, z1] = zs(0.06, 0.06 + dp); bag.add('limestone_core', tbox(x - hw, 0, z0, x + hw, th, z1, (c - 0.5) * 0.08)); const [h0, h1] = zs(0.2 + c * 0.05, 0.56 + b * 0.1); bag.add('plaster_grey', tbox(x - 0.3 - a * 0.1, th, h0, x + 0.3 + c * 0.1, th + 0.004, h1, (a - 0.5) * 0.08)); }
    // sand blown into the doorway on the side the wind comes from
    if (a < 0.55) bag.add('sandstone_yellow', lathe([[1, 0], [0.8, 0.2], [0.45, 0.62], [0.001, 1]], 9).scale(0.45 + b * 0.4, 0.07 + c * 0.07, 0.3 + a * 0.3).translate(x + (b - 0.5) * 1.3, -0.01, zo + s * (0.95 + c * 0.3)));
    // the plaster flaked off beside the door: two patches of the mudbrick under it, higher on the weathered side
    for (let k = 0; k < 2; k++) {
      const side = k ? 1 : -1, w = 0.28 + hash(seed, 4 + k) * 0.3, h = 0.4 + hash(seed, 6 + k) * 0.5, off = 0.75 + hash(seed, 8 + k) * 0.9, y0 = 0.45 + hash(seed, 10 + k) * 0.9, px = x + side * (off + w / 2);
      if (px - w / 2 < d.xr[0] + 0.3 || px + w / 2 > d.xr[1] - 0.3 || d.kind === 'bakery') continue;
      const [z0, z1] = zs(0.02, 0.032); bag.add('mudbrick', tbox(px - w / 2, y0, z0, px + w / 2, y0 + h, z1, (hash(seed, 12 + k) - 0.5) * 0.06));
    }
    // the soot over the door of a trade that kept a fire
    if (d.kind === 'shop' && SOOTY.has(d.trade)) { const [z0, z1] = zs(0.014, 0.02); bag.add('pottery_dark', tbox(x - 0.34 - a * 0.1, 2.78, z0, x + 0.34 + b * 0.1, 3.02 + c * 0.08, z1, 0.0005 * (a + 1))); }
  }
  // the way from the south to the Great Temple's door, worn by pilgrims' feet: dark dished scuffs, thicker and wider toward the door (docs §24)
  for (const [px, pz, w] of el.way ?? []) bag.add('limestone_core', lathe([[1, 0], [1, 0.003], [0.001, 0.003]], 10).scale(w * 0.32, 1, w * 0.17).rotateY(hash(px, pz) * 3).translate(px, 0.0435 + hash(pz, px) * 0.0004, pz));
  // the terrace's paving black under the braziers' bowls
  for (const [bx, bz] of el.rings ?? []) bag.add('pottery_dark', lathe([[0.62, 0], [0.62, 0.004], [0.001, 0.004]], 12, null, bx, 0.043, bz));
}

let done = false;
export function registerWear() { if (done) return; done = true; STYLES.ramesside.elements.abu_wear = wearEl; }
export { hash as wearHash };

/** The doors with their wear, from the lots (doorX is replayed by the caller to keep this file free of walk.js's dice). */
export function wearElements(doorX) {
  const doors = lots().map((l) => { const n = l.front === 'n', th = l.kind === 'bakery' ? 0.5 : 0.45; return { x: doorX(l), zo: n ? l.rect[1] - th / 2 : l.rect[3] + th / 2, s: n ? -1 : 1, seed: l.seed, trade: l.trade, kind: l.kind, xr: [l.rect[0], l.rect[2]] }; });
  return [{ t: 'abu_wear', doors, rings: [-9.8, 9.8].map((z) => [TERRACE[0] + 14.5, z]), way: wayWear() }];
}

/** The scuffs of the way: from the arrival's end of the terrace (−4, 17) to the door (z 0), spread by a hash of their own place. */
function wayWear() {
  const out = [];
  for (let k = 0; k < 70; k++) {
    const t = Math.pow((k + 0.5) / 70, 0.8), cx = TERRACE[0] + 0.6 + t * (-6 - TERRACE[0] - 0.6), spread = 0.6 + 2.2 * t, zc = 17 * Math.max(0, (t - 0.25) / 0.75);
    out.push([cx + (hash(k, 1) - 0.5) * 1.6, zc + (hash(k, 2) - 0.5) * spread, 0.35 + hash(k, 3) * 0.35 + (1 - t) * 0.25]);
  }
  return out;
}
