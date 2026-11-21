// Ayutthaya about 1687 — the shops and the street furniture of the visitor's walk (docs/settlements/ayutthaya.md §13.1).
// Wraps the style's `thai_house` from here (the style file stays as it was): a shop with a `trade` (layout.js gives it to the shops on the walk) gets that trade's
// stock on the lane before its counter, and `ay_gear` elements (a water jar with its dipper, a bridge-head spirit house, a seller's mat) stand along the way.
// Every piece is in a material the houses already use, so the tile's detail merges as before; each piece's variation is a hash of its own place.
import '../../styles/siamese/index.js';
import { lathe, rod, box, fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { kit, rng, spiritHouse, CLOTH } from '../../styles/siamese/houses.js';

/** A number in [0, 1) from a position alone (no counters, no Math.random). */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The side of the entry gap of a shop and the gap's middle across the front (the style's own draws: plinth, upper wall, side). */
export function shopGap(el, hS) {
  const r = rng(el.seed || 1); r(); r();
  const side = r() < 0.5 ? -1 : 1, pu = hS - 0.28 - 0.1;
  return { side, ug: side * (pu - 0.775) };
}

// ── the stock of each trade, on the lane before the counter ──────────────────────────────────────────────────
/** A low bamboo table: four legs, a top of planks, at local (u, v), w by d, top at height h. */
function table(k, u, v, w, d, h = 0.72, y = 0) {
  const { bag, W } = k;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const [x, z] = W(u + sx * (w / 2 - 0.05), v + sz * (d / 2 - 0.05)); bag.add('bamboo_culm', rod([x, y, z], [x, y + h, z], 0.022, 4)); }
  k.B('planks_grey', u - w / 2, u + w / 2, v - d / 2, v + d / 2, y + h, y + h + 0.04);
  k.C(u - w / 2, u + w / 2, v - d / 2, v + d / 2, y, y + h + 0.05);
}
const bowl = (k, m, u, v, y, r = 0.14, h = 0.12) => k.L(m, [[0.001, 0], [r * 0.7, 0], [r, h * 0.8], [r * 0.9, h]], u, v, y, 7);
const sack = (k, u, v, y, s = 1) => k.L('sacking', [[0.001, 0], [0.2 * s, 0], [0.26 * s, 0.14 * s], [0.22 * s, 0.38 * s], [0.12 * s, 0.5 * s], [0.001, 0.52 * s]], u, v, y, 7);
const taper = (k, m, u, v, y, r, h, seg = 5) => k.L(m, [[r, 0], [r * 0.9, h * 0.9], [0.001, h]], u, v, y, seg);

const STOCK = {
  // candles of beeswax and tallow in bundles, sticks of incense tied with red cord, packets of gold leaf for the images, trays of lotus buds: for the wat's gate
  offerings(k, u, v, y, h) {
    for (let i = 0; i < 5; i++) { const uu = u - 0.5 + i * 0.25; for (let c = 0; c < 4; c++) k.L(c % 2 ? 'glaze_yellow' : 'cloth_white', [[0.011, 0], [0.011, 0.26 + 0.03 * c]], uu + (c - 1.5) * 0.026, v - 0.25, y + h, 5); k.L('cloth_red', [[0.03, 0.08], [0.03, 0.1]], uu, v - 0.25, y + h, 6); }
    for (let i = 0; i < 3; i++) { const uu = u - 0.4 + i * 0.4; for (let s = 0; s < 5; s++) k.L('timber_red', [[0.006, 0], [0.006, 0.42]], uu + (s - 2) * 0.012, v + 0.12, y + h, 4); k.L('cloth_red', [[0.04, 0.12], [0.04, 0.14]], uu, v + 0.12, y + h, 6); }
    for (let i = 0; i < 3; i++) k.B('gold', u + 0.35 + i * 0.1 - 0.04, u + 0.35 + i * 0.1 + 0.04, v + 0.2, v + 0.3, y + h, y + h + 0.015 * (i + 1));
  },
  // lotus buds standing in baskets, strings of jasmine and marigold hung from a pole, as the people take to the wat
  flowers(k, u, v, y, h) {
    for (let i = 0; i < 3; i++) {
      const uu = u - 0.5 + i * 0.5; k.L('wicker', [[0.001, 0], [0.15, 0], [0.2, 0.2], [0.001, 0.2]], uu, v, y, 8);
      for (let b = 0; b < 9; b++) { const a = b * 2.4 + hashAt(uu, v, b) * 2, rr = 0.03 + 0.09 * hashAt(uu, v + b, 2), hh = 0.3 + 0.2 * hashAt(uu + b, v, 3); const [x, z] = k.W(uu + Math.cos(a) * rr, v + Math.sin(a) * rr); k.bag.add('lotus_leaf', rod([x, y + 0.18, z], [x, y + 0.18 + hh, z], 0.006, 3)); k.L(b % 3 ? 'cloth_white' : 'cloth_red', [[0.001, 0], [0.028, 0.03], [0.022, 0.07], [0.001, 0.12]], uu + Math.cos(a) * rr, v + Math.sin(a) * rr, y + 0.18 + hh, 5); }
    }
    for (let i = 0; i < 4; i++) { const uu = u - 0.45 + i * 0.3, [x, z] = k.W(uu, v + 0.35); k.bag.add('rope_fibre', rod([x, y + 1.7, z], [x, y + 1.15 - 0.1 * (i % 2), z], 0.004, 3)); for (let b = 0; b < 6; b++) k.L(b % 2 ? 'glaze_yellow' : 'cloth_white', [[0.001, 0], [0.025, 0.015], [0.001, 0.045]], uu, v + 0.35, y + 1.7 - 0.09 * (b + 1) - 0.1 * (i % 2) * 0.5, 5); }
    { const a = k.W(u - 0.7, v + 0.35), b = k.W(u + 0.7, v + 0.35); k.bag.add('bamboo_culm', rod([a[0], y + 1.72, a[1]], [b[0], y + 1.72, b[1]], 0.018, 4)); }
  },
  // sacks of rice and husked rice, the baskets that measure it, a winnowing tray leaned against the table
  rice(k, u, v, y, h) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2 - (i > 1 ? 1 : 0); j++) sack(k, u - 0.5 + i * 0.5 + (j ? 0.1 : 0), v - 0.1 + (hashAt(u + i, v, j) - 0.5) * 0.1, y + h + j * 0.4, 0.95 + 0.1 * hashAt(u, v + i, j));
    bowl(k, 'wicker', u + 0.7, v + 0.25, y + h, 0.18, 0.2); k.L('timber', [[0.001, 0.2], [0.04, 0.2], [0.001, 0.26]], u + 0.7, v + 0.25, y + h, 5);
    { const a = k.W(u - 0.7, v + 0.4); k.bag.add('wicker', lathe([[0.001, 0], [0.3, 0.02], [0.34, 0.06], [0.001, 0.03]], 10, null, a[0], y + 0.3, a[1]).rotateX(0.0)); }
  },
  // water jars of red clay stacked in a pyramid, dark glazed jars with their lids, cooking pots by the tripod
  pots(k, u, v, y, h) {
    const jarAt = (m, uu, vv, yy, s) => k.L(m, [[0.001, 0], [0.18 * s, 0], [0.28 * s, 0.14 * s], [0.31 * s, 0.32 * s], [0.25 * s, 0.5 * s], [0.17 * s, 0.58 * s], [0.2 * s, 0.62 * s], [0.001, 0.62 * s]], uu, vv, yy, 8);
    for (let i = 0; i < 3; i++) jarAt('terracotta', u - 0.5 + i * 0.5, v, 0, 1.15 + 0.1 * hashAt(u + i, v, 1));
    for (let i = 0; i < 2; i++) jarAt('terracotta', u - 0.25 + i * 0.5, v - 0.05, 0.62, 0.95);
    jarAt('pottery_dark', u + 0.9, v + 0.1, 0, 1.4); jarAt('pottery_dark', u - 0.95, v + 0.15, 0, 1.2);
    for (let i = 0; i < 4; i++) bowl(k, i % 2 ? 'terracotta' : 'pottery_dark', u - 0.45 + i * 0.3, v + 0.1, y + h, 0.12, 0.1);
  },
  // baskets of areca nuts and betel leaf, lime in small white pots, the tray with its cutters: what every Siamese chews
  betel(k, u, v, y, h) {
    for (let i = 0; i < 3; i++) {
      const uu = u - 0.5 + i * 0.5; bowl(k, 'wicker', uu, v, y + h, 0.18, 0.14);
      for (let n = 0; n < 12; n++) { const a = n * 2.4, rr = 0.1 * hashAt(uu, v + n, 4); k.L(i === 1 ? 'lotus_leaf' : 'timber', [[0.001, 0], [0.034, 0.025], [0.026, 0.05], [0.001, 0.056]], uu + Math.cos(a) * rr, v + Math.sin(a) * rr, y + h + 0.1 + 0.04 * hashAt(uu + n, v, 5), 5); }
    }
    for (let i = 0; i < 3; i++) k.L('plaster_white', [[0.001, 0], [0.05, 0], [0.06, 0.06], [0.001, 0.07]], u - 0.3 + i * 0.12, v + 0.35, y + h, 6);
    k.B('timber', u + 0.2, u + 0.65, v + 0.25, v + 0.45, y + h, y + h + 0.03); k.B('silver', u + 0.3, u + 0.5, v + 0.33, v + 0.36, y + h + 0.03, y + h + 0.045);
  },
  // bolts of printed and plain cloth folded over a bamboo rail, pieces hung down: the painted cloths of Coromandel and the local weaving
  cloth(k, u, v, y, h) {
    for (const s of [-1, 1]) { const [x, z] = k.W(u + s * 0.8, v); k.bag.add('bamboo_culm', rod([x, y, z], [x, y + 1.5, z], 0.025, 4)); }
    { const a = k.W(u - 0.8, v), b = k.W(u + 0.8, v); k.bag.add('bamboo_culm', rod([a[0], y + 1.45, a[1]], [b[0], y + 1.45, b[1]], 0.02, 4)); }
    for (let i = 0; i < 6; i++) { const uu = u - 0.65 + i * 0.26, c = CLOTH[Math.floor(hashAt(uu, v, 6) * CLOTH.length)], hh = 0.5 + 0.35 * hashAt(uu, v, 7); k.sheet(c, uu - 0.11, v + 0.03, uu + 0.11, v + 0.03, y + 1.44, y + 1.44 - hh); k.sheet(CLOTH[(CLOTH.indexOf(c) + 2) % CLOTH.length], uu - 0.11, v - 0.03, uu + 0.11, v - 0.03, y + 1.44, y + 1.44 - hh * 0.8); }
    for (let i = 0; i < 4; i++) k.B(CLOTH[Math.floor(hashAt(u + i, v, 8) * CLOTH.length)], u - 0.55 + i * 0.3 - 0.12, u - 0.55 + i * 0.3 + 0.12, v + 0.3, v + 0.5, y + h, y + h + 0.1 + 0.03 * (i % 3));
  },
  // fish split and salted drying on a bamboo frame, jars of fish paste with cloth over their mouths, baskets of small shrimp
  fish(k, u, v, y, h) {
    for (const s of [-1, 1]) { const [x, z] = k.W(u + s * 0.85, v); k.bag.add('bamboo_culm', rod([x, y, z], [x, y + 1.5, z], 0.025, 4)); }
    for (const yy of [0.8, 1.45]) { const a = k.W(u - 0.85, v), b = k.W(u + 0.85, v); k.bag.add('bamboo_culm', rod([a[0], y + yy, a[1]], [b[0], y + yy, b[1]], 0.018, 4)); }
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const [x, z] = k.W(u - 0.7 + i * 0.28, v + (r ? 0.05 : -0.05)); const L = 0.34 + 0.12 * hashAt(x, z, 9); k.bag.add('silver', box(x - 0.045, y + (r ? 1.45 : 0.8) - L, z - 0.012, x + 0.045, y + (r ? 1.45 : 0.8), z + 0.012)); }
    for (let i = 0; i < 2; i++) { k.L('pottery_dark', [[0.001, 0], [0.16, 0], [0.22, 0.18], [0.2, 0.34], [0.14, 0.4]], u - 0.4 + i * 0.5, v + 0.55, y, 8); k.L('cloth_white', [[0.15, 0.4], [0.17, 0.43], [0.001, 0.44]], u - 0.4 + i * 0.5, v + 0.55, y, 8); }
    bowl(k, 'wicker', u + 0.55, v + 0.5, y, 0.2, 0.16);
  },
  // the Chinese store: a cabinet of small drawers, jars of tea, sugar loaves, a stack of lacquered boxes, a scale hung from the lintel
  chinese(k, u, v, y, h) {
    k.BC('timber_red', u - 0.6, u + 0.6, v - 0.2, v + 0.2, y, y + 1.1);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) k.B('timber', u - 0.55 + c * 0.28, u - 0.31 + c * 0.28, v + 0.2, v + 0.215, y + 0.1 + r * 0.32, y + 0.36 + r * 0.32);
    for (let i = 0; i < 3; i++) { k.L('glaze_green', [[0.001, 0], [0.12, 0], [0.16, 0.14], [0.13, 0.3], [0.08, 0.34]], u - 0.4 + i * 0.4, v, y + 1.1, 7); }
    for (let i = 0; i < 4; i++) taper(k, 'plaster_white', u + 0.8 + (i % 2) * 0.16, v + (i > 1 ? 0.15 : -0.05), y, 0.09, 0.3, 6);
    for (let i = 0; i < 3; i++) k.B('timber_red', u + 0.7 - 0.12, u + 0.7 + 0.12, v + 0.55, v + 0.75, y + i * 0.1, y + i * 0.1 + 0.09);
  },
};

let done = false;
/** Wraps `thai_house`: a shop with a trade (before the style builds it, so its colliders are the style's own) and the street pieces of `ay_gear`. */
export function registerWalk() {
  if (done) return; done = true;
  const E = STYLES.siamese.elements, base = E.thai_house;
  E.thai_house = function tradeShop(el, ctx) {
    // the style's lean-to over a terrace or a kitchen is a sheet with no underside: to the walker's collision it is a slab from the floor up, and shuts the stair's head (docs §13.1);
    // a second sheet 0.08 m below it is its underside
    const real = ctx.bag, bag = el.simple ? real : new Proxy(real, { get(t, k) {
      if (k === 'add') return (mat, g, ...rest) => {
        if (!globalThis.AY_OFF?.includes('under') && (mat === 'thatch_palm' || mat === 'roof_tile') && g?.attributes?.position?.count === 12) { g.computeBoundingBox(); const b = g.boundingBox; if (b.max.y - b.min.y < 0.2 && b.max.y - b.min.y > 0.02) t.add(mat, g.clone().translate(0, -0.08, 0)); }
        return t.add(mat, g, ...rest);
      };
      const v = t[k]; return typeof v === 'function' ? v.bind(t) : v;
    } });
    ctx = el.simple ? ctx : { ...ctx, bag };
    const r = base.call(this, el, ctx);
    if (el.simple || el.kind !== 'shop' || !el.trade || !STOCK[el.trade] || globalThis.AY_OFF?.includes('stock')) return r;
    const k = kit(el, ctx), { hS, hF } = k, { side, ug } = shopGap(el, hS);
    // the table before the counter on the side away from the gap, on the lane's step (the plinth ends 0.25 m out from the front); the gap's middle stays clear
    const u = -side * Math.min(hS - 1.15, 1.5) + 0.0, v = hF + 0.82;
    if (Math.abs(u - ug) < 1.3) return r;
    const tw = 1.7, h = ['offerings', 'rice', 'betel', 'cloth'].includes(el.trade) ? 0.76 : 0;
    if (h > 0) table(k, u, v, tw, 0.8, 0.72);
    STOCK[el.trade](k, u, v, 0, h);
    // the shop's trade board: a small hung plank over the table (no writing: Thai script is not modelled; docs §13.5)
    return r;
  };
  E.ay_gear = gear;
}
/** ay_gear: { at: [x, z], kind: 'angnam' | 'shrine' | 'mat', rot, seed } — the street's furniture; nothing in the far form. */
function gear(el, ctx) {
  if (el.simple || globalThis.AY_OFF?.includes('gear') || globalThis.AY_OFF?.includes(el.kind)) return;
  const { bag, col } = ctx, [x, z] = el.at, rot = el.rot ?? 0, s = Math.sin(rot), c = Math.cos(rot), P = (u, v) => [x + c * u + s * v, z - s * u + c * v], y = el.y ?? 0;
  const L = (m, prof, u, v, yy, seg = 8) => { const [px, pz] = P(u, v); bag.add(m, lathe(prof, seg, null, px, yy, pz)); };
  if (el.kind === 'angnam') {
    // a water jar on a stand of three posts with a coconut-shell dipper on its lid, set out by the way for the traveller (the Thai custom of the ang nam) [inferred for 1687]
    for (const [u, v] of [[-0.3, -0.2], [0.3, -0.2], [0, 0.3]]) { const [px, pz] = P(u, v); bag.add('timber', lathe([[0.04, 0], [0.035, 0.5]], 5, null, px, y, pz)); }
    L('terracotta', [[0.001, 0.5], [0.3, 0.5], [0.4, 0.68], [0.42, 0.95], [0.34, 1.2], [0.24, 1.3], [0.28, 1.34], [0.001, 1.34]], 0, 0, y);
    L('timber', [[0.001, 1.34], [0.26, 1.34], [0.22, 1.4], [0.001, 1.42]], 0, 0, y, 8);
    L('wicker', [[0.001, 1.42], [0.09, 1.42], [0.1, 1.48], [0.001, 1.46]], 0.08, 0.05, y, 6);
    col.circle(x, z, 0.45, y, y + 1.4);
  } else if (el.kind === 'shrine') {
    // the spirit house on its post at the bridge head with garlands and a lamp on its shelf (the same as at the houses: docs §11.1)
    const k = { bag, col, W: (u, v) => P(u, v) };
    spiritHouse(k, 0, 0, y);
  } else if (el.kind === 'mat') {
    // a woven mat on the bank with a seller's baskets of fruit, a pair of baskets on a shoulder pole laid beside it
    const [px, pz] = P(0, 0), q = hashAt(x, z, 11);
    bag.add('reed_mat', box(px - 0.9, y, pz - 0.6, px + 0.9, y + 0.02, pz + 0.6));
    const fruit = [['glaze_yellow', 0.05], ['glaze_green', 0.06], ['glaze_yellow', 0.08], ['cloth_red', 0.045]][Math.floor(q * 4)];
    for (let i = 0; i < 3; i++) {
      const u = -0.55 + i * 0.55, v = (i - 1) * 0.1;
      L('wicker', [[0.001, 0.02], [0.2, 0.02], [0.27, 0.2], [0.001, 0.2]], u, v, y, 8);
      for (let n = 0; n < 11; n++) { const a = n * 2.4, rr = 0.15 * hashAt(x + u, z + n, 12); L(fruit[0], [[0.001, 0], [fruit[1], 0.02], [fruit[1] * 0.9, fruit[1] * 1.6], [0.001, fruit[1] * 2]], u + Math.cos(a) * rr, v + Math.sin(a) * rr, y + 0.2 + 0.05 * (n % 3), 5); }
    }
    { const a = P(-0.8, 0.5), b = P(0.8, 0.5); bag.add('bamboo_culm', rod([a[0], y + 0.05, a[1]], [b[0], y + 0.05, b[1]], 0.02, 4)); }
    { const a = P(0.0, -0.45), b = P(0.45, -0.35); bag.add('silver', rod([a[0], y + 0.03, a[1]], [b[0], y + 0.03, b[1]], 0.012, 4)); }
  }
}
registerWalk();
void fromTriangles;
