// Tikal c. 750 — what the opened places hold (docs/settlements/maya-tikal.md §16): the goods and tools of each craftsman's house, laid along the back wall where the visitor
// sees them from the door, and the stock of the market hall's rooms on its benches. Two elements added to the tikal style from here (the style file stays as it was):
//   mt_stock { c, w, d, door, craft, seed }   a craftsman's house (layout.js CRAFTS): obsidian, potter, cloth, cook, painter
//   mt_stall { c, face, n, y, seed }          the market hall's rooms (a k_range): the trade of each room by its place
// Every piece is a function of its own place (hashAt): no counters, no Math.random.
import '../../styles/tikal/index.js';
import { box, lathe, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { hashAt, houseFrame, frame, PLATFORM } from './walk.js';

const pot = (bag, mat, x, y, z, h, r, k = 0) => bag.add(mat, lathe([[0.001, 0], [r * 0.55, 0.01], [r, h * 0.38], [r * 0.9, h * 0.72], [r * 0.52, h * 0.93], [r * 0.6, h], [r * 0.45, h], [0.001, h * 0.9]], 10, null, x, y, z));
const slabAt = (bag, mat, x, y, z, a, b, h, rot = 0) => { const g = box(-a / 2, 0, -b / 2, a / 2, h, b / 2); if (rot) g.rotateY(rot); bag.add(mat, g.translate(x, y, z)); };
const ball = (bag, mat, x, y, z, r) => bag.add(mat, lathe([[0.001, 0], [r * 0.9, r * 0.3], [r, r], [r * 0.9, r * 1.7], [0.001, r * 2]], 8, null, x, y, z));

/** The goods of one craft along a wall: `P(a, u)` the world point at along-wall offset a and depth u (u from the wall's face into the room), y the floor. */
function craftGoods(bag, craft, P, y, seed) {
  const h = (k) => hashAt(seed, k, 3);
  const at = (a, u) => P(a, u);
  if (craft === 'obsidian') {
    // a mat, a core on it with the blades struck from it laid in a fan, the hammerstone, a heap of flakes, a basket of finished blades
    const m = at(0, 0.45); slabAt(bag, 'reed_mat', m[0], y, m[1], 1.7, 0.9, 0.02, 0);
    for (let i = 0; i < 3; i++) { const c = at(-0.5 + i * 0.28, 0.3 + 0.1 * h(i)); bag.add('obsidian', rod([c[0], y + 0.02, c[1]], [c[0], y + 0.15 + 0.03 * h(i + 5), c[1]], 0.04 + 0.01 * h(i + 9), 6)); }
    for (let i = 0; i < 15; i++) { const c = at(0.15 + i * 0.045, 0.2 + 0.25 * Math.abs(Math.sin(i * 0.7)) + 0.05 * h(20 + i)); const g = box(-0.075 - 0.02 * h(i), 0, -0.012, 0.075, 0.012, 0.012); g.rotateY(-0.5 + i * 0.07 + 0.1 * h(i)); bag.add('obsidian', g.translate(c[0], y + 0.025, c[1])); }
    for (let i = 0; i < 18; i++) { const c = at(-0.8 + 0.12 * (i % 6) + 0.05 * h(40 + i), 0.55 + 0.09 * Math.floor(i / 6) + 0.04 * h(60 + i)); const g = box(-0.02, 0, -0.015, 0.025, 0.01 + 0.01 * h(80 + i), 0.015); g.rotateY(h(100 + i) * 3); bag.add('obsidian', g.translate(c[0], y + 0.025, c[1])); }
    const hs = at(-0.2, 0.62); ball(bag, 'limestone_maya', hs[0], y + 0.02, hs[1], 0.05);
    const bs = at(1.0, 0.35); bag.add('timber', lathe([[0.001, 0], [0.2, 0.02], [0.24, 0.16], [0.21, 0.2], [0.001, 0.18]], 10, null, bs[0], y, bs[1]));
  } else if (craft === 'potter') {
    // pots drying along the wall (dark and red, by height), the lump of clay, the turning plate, coils, burnishing stones
    for (let i = 0; i < 7; i++) { const c = at(-1.0 + i * 0.34 + 0.05 * h(i), 0.3 + 0.08 * h(10 + i)); pot(bag, i % 3 === 0 ? 'terracotta' : 'pottery_dark', c[0], y, c[1], 0.25 + 0.3 * h(20 + i), 0.12 + 0.07 * h(30 + i)); }
    const cl = at(0.7, 0.9); bag.add('mud_plaster', lathe([[0.001, 0], [0.3, 0.01], [0.26, 0.12], [0.12, 0.2], [0.001, 0.22]], 10, null, cl[0], y, cl[1]));
    const tp = at(-0.3, 0.9); bag.add('rubble', lathe([[0.001, 0], [0.16, 0], [0.16, 0.12], [0.001, 0.12]], 8, null, tp[0], y, tp[1])); bag.add('terracotta', lathe([[0.001, 0.12], [0.3, 0.12], [0.3, 0.145], [0.001, 0.145]], 12, null, tp[0], y, tp[1]));
    for (let i = 0; i < 3; i++) { const c = at(0.15 + 0.12 * i, 0.95 + 0.1 * i); bag.add('mud_plaster', rod([c[0] - 0.12, y + 0.03, c[1]], [c[0] + 0.12, y + 0.03, c[1] + 0.04], 0.025, 6)); }
    for (let i = 0; i < 3; i++) { const c = at(-0.75 + 0.1 * i, 0.9 + 0.05 * h(50 + i)); ball(bag, 'basalt', c[0], y, c[1], 0.035); }
  } else if (craft === 'cloth') {
    // a backstrap loom hung from the wall: the warp between two bars, the woven band; cotton in a basket; a spindle with its whorl; folded mantles
    const top = 1.45, bot = 0.62, a0 = -0.55, a1 = 0.55, u = 0.22;
    const t0 = at(a0 - 0.1, u), t1 = at(a1 + 0.1, u), b0 = at(a0 - 0.1, u + 0.3), b1 = at(a1 + 0.1, u + 0.3);
    bag.add('timber', rod([t0[0], y + top, t0[1]], [t1[0], y + top, t1[1]], 0.02, 6)); bag.add('timber', rod([b0[0], y + bot, b0[1]], [b1[0], y + bot, b1[1]], 0.02, 6));
    for (let i = 0; i < 20; i++) { const a = a0 + (a1 - a0) * i / 19, p0 = at(a, u), p1 = at(a, u + 0.3); bag.add('cloth_white', rod([p0[0], y + top, p0[1]], [p1[0], y + bot, p1[1]], 0.004, 3)); }
    for (const [k, mat] of [[0, 'cloth_red'], [1, 'cloth_blue']]) { const a = at((a0 + a1) / 2, u + 0.3 - 0.09 * (1 - k * 0.3)); const g = box(-0.5, 0, -0.012, 0.5, 0.09, 0.012); bag.add(mat, g.translate(a[0], y + bot + 0.02 + k * 0.1, a[1])); }
    for (const a of [a0, a1]) { const p = at(a, u - 0.06); bag.add('timber', rod([p[0], y + 1.7, p[1]], [p[0], y + 1.2, p[1]], 0.012, 4)); }
    const cb = at(0.95, 0.4); bag.add('timber', lathe([[0.001, 0], [0.22, 0.02], [0.28, 0.2], [0.001, 0.22]], 10, null, cb[0], y, cb[1]));
    for (let i = 0; i < 4; i++) { const c = at(0.95 + 0.12 * Math.cos(i * 1.7), 0.4 + 0.12 * Math.sin(i * 1.7)); ball(bag, 'cloth_white', c[0], y + 0.14, c[1], 0.07); }
    const sp = at(-1.0, 0.5); bag.add('timber', rod([sp[0], y, sp[1]], [sp[0] + 0.04, y + 0.3, sp[1]], 0.008, 4)); bag.add('rubble', lathe([[0.001, 0], [0.04, 0], [0.001, 0.015]], 8, null, sp[0] + 0.01, y + 0.06, sp[1]));
    for (let i = 0; i < 4; i++) { const c = at(-0.85 + 0.0, 1.0 + 0.0); slabAt(bag, ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_blue'][i], c[0], y + 0.04 * i, c[1], 0.5 + 0.02 * h(i), 0.38, 0.04, 0.1 * h(i + 3)); }
  } else if (craft === 'cook') {
    // the metate lies in the house's kitchen end; here: tortillas on a comal on its stones, a stack of cooked ones, a pot of beans, strings of chile on the wall, a cacao pot
    const cm = at(-0.3, 0.55);
    for (let i = 0; i < 3; i++) { const a = i * 2.09 + 0.3; ball(bag, 'rubble', cm[0] + Math.cos(a) * 0.17, y, cm[1] + Math.sin(a) * 0.17, 0.07); }
    bag.add('terracotta', lathe([[0.001, 0.17], [0.27, 0.17], [0.27, 0.19], [0.001, 0.19]], 14, null, cm[0], y, cm[1]));
    for (let i = 0; i < 4; i++) { const a = i * 1.6; bag.add('cloth_ochre', lathe([[0.001, 0.19], [0.09, 0.19], [0.09, 0.2], [0.001, 0.2]], 10, null, cm[0] + Math.cos(a) * 0.12, y + 0.0, cm[1] + Math.sin(a) * 0.12)); }
    const st = at(0.5, 0.45); for (let i = 0; i < 6; i++) bag.add('cloth_ochre', lathe([[0.001, 0], [0.1, 0], [0.1, 0.02], [0.001, 0.02]], 10, null, st[0], y + 0.14 + 0.02 * i, st[1]));
    slabAt(bag, 'limestone_maya', st[0], y, st[1], 0.4, 0.4, 0.14);
    pot(bag, 'pottery_dark', ...[at(0.95, 0.5)[0], y, at(0.95, 0.5)[1]], 0.42, 0.24);
    pot(bag, 'terracotta', ...[at(-1.1, 0.4)[0], y, at(-1.1, 0.4)[1]], 0.36, 0.17);
    for (let i = 0; i < 4; i++) { const a = -0.7 + i * 0.45, p = at(a, 0.05); bag.add('rope_fibre', rod([p[0], y + 1.7, p[1]], [p[0], y + 1.25, p[1]], 0.01, 4)); for (let k = 0; k < 4; k++) { const g = box(-0.025, 0, -0.025, 0.025, 0.13, 0.025); bag.add('cloth_red', g.translate(p[0] + 0.02 * ((k + i) % 2), y + 1.25 + 0.1 * k - 0.05, p[1] + 0.01)); } }
  } else {
    // the painter-scribe: bowls of pigment (red, blue, ochre, white, black), the stone palette, a pot of brushes, a book of folded bark paper on its stand, a polished slab for the stucco
    const cols = ['stucco_red', 'maya_blue', 'paint_ochre', 'stucco_cream', 'wood_dark'];
    const base = at(-0.4, 0.4); slabAt(bag, 'limestone_carved', base[0], y, base[1], 1.5, 0.5, 0.1);
    for (let i = 0; i < 5; i++) { const c = at(-0.95 + i * 0.3, 0.4); bag.add('pottery_dark', lathe([[0.001, 0.1], [0.07, 0.1], [0.09, 0.15], [0.075, 0.17], [0.001, 0.14]], 8, null, c[0], y, c[1])); bag.add(cols[i], lathe([[0.001, 0.145], [0.065, 0.145], [0.065, 0.155], [0.001, 0.155]], 8, null, c[0], y, c[1])); }
    const bp = at(0.7, 0.45); bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0], [0.08, 0.2], [0.001, 0.2]], 8, null, bp[0], y, bp[1]));
    for (let i = 0; i < 5; i++) bag.add('timber', rod([bp[0] + (i - 2) * 0.012, y + 0.15, bp[1]], [bp[0] + (i - 2) * 0.03, y + 0.38, bp[1] + 0.02 * (i % 2)], 0.006, 4));
    const bk = at(0.15, 0.95); slabAt(bag, 'timber', bk[0], y, bk[1], 0.4, 0.3, 0.3);
    for (let i = 0; i < 12; i++) { const g = box(-0.09, 0, -0.005, 0.09, 0.26, 0.005); g.rotateZ(0); g.rotateY((i % 2 ? 0.25 : -0.25)); bag.add(i % 2 ? 'cloth_white' : 'stucco_cream', g.translate(bk[0] - 0.17 + i * 0.03, y + 0.3, bk[1])); }
    const sl = at(-0.9, 0.95); slabAt(bag, 'limestone_maya', sl[0], y, sl[1], 0.5, 0.4, 0.05);
  }
}

/** mt_stock: the goods of a craftsman's house, along its back wall; the rolled mat over the door. */
function stock(el, { bag, col }) {
  const { F, depth } = houseFrame(el), y = PLATFORM, ub = depth - 0.16;
  craftGoods(bag, el.craft, (a, u) => F.P(ub - u, a), y, el.seed);
  const r = F.R(ub - 1.2, ub, -1.2, 1.2); col.rect(r, y, y + 0.6);
  // the door's mat rolled up over the lintel (the house is open by day)
  const m0 = F.P(-0.09, -0.8), m1 = F.P(-0.09, 0.8);
  bag.add('reed_mat', rod([m0[0], y + 2.28, m0[1]], [m1[0], y + 2.28, m1[1]], 0.07, 8));
}

const GOODS = ['cacao', 'salt', 'cloth', 'obsidian', 'jade', 'pottery', 'feathers', 'honey'];
/** What one trade lays out on a bench top (benchP(a, d): the world point at along-bench offset a, d from the bench's front edge; y the bench top). */
function benchStock(bag, kind, P, y, seed) {
  const h = (k) => hashAt(seed, k, 9);
  if (kind === 'cacao') {
    for (let i = 0; i < 14; i++) { const c = P(-1.4 + 0.14 * (i % 7) + 0.03 * h(i), 0.25 + 0.14 * Math.floor(i / 7)); const g = lathe([[0.001, 0], [0.04, 0.03], [0.045, 0.07], [0.03, 0.12], [0.001, 0.14]], 6, null, 0, 0, 0); g.rotateZ(Math.PI / 2); bag.add('wood_ochre', g.translate(c[0], y + 0.05, c[1])); }
    for (const a of [-0.3, 0.2]) { const c = P(a, 0.6); bag.add('timber', lathe([[0.001, 0], [0.2, 0.02], [0.26, 0.2], [0.001, 0.23]], 10, null, c[0], y, c[1])); for (let k = 0; k < 6; k++) ball(bag, 'wood_dark', c[0] - 0.1 + 0.04 * k, y + 0.2, c[1] + 0.03 * (k % 3), 0.03); }
  } else if (kind === 'salt') {
    for (let i = 0; i < 10; i++) { const row = i < 5 ? 0 : i < 8 ? 1 : 2, k = i < 5 ? i : i < 8 ? i - 5 : i - 8; const c = P(-1.2 + k * 0.3 + row * 0.15, 0.4); slabAt(bag, 'plaster_white', c[0], y + row * 0.1, c[1], 0.24 + 0.02 * h(i), 0.16, 0.1, 0.08 * h(i + 30)); }
  } else if (kind === 'cloth') {
    for (let i = 0; i < 5; i++) { const c = P(-1.4 + i * 0.42, 0.45); for (let k = 0; k < 5; k++) slabAt(bag, ['cloth_white', 'cloth_blue', 'cloth_red', 'cloth_ochre'][(i + k) % 4], c[0], y + 0.04 * k, c[1], 0.36 + 0.03 * h(i * 5 + k), 0.28, 0.04, 0.05 * h(i + k)); }
  } else if (kind === 'obsidian') {
    const m = P(-0.7, 0.45); slabAt(bag, 'cloth_red', m[0], y, m[1], 1.5, 0.6, 0.01);
    for (let i = 0; i < 18; i++) { const c = P(-1.35 + i * 0.08, 0.3 + 0.2 * h(i)); const g = box(-0.07, 0, -0.012, 0.07, 0.012, 0.012); g.rotateY(0.3 * (h(i + 50) - 0.5)); bag.add('obsidian', g.translate(c[0], y + 0.012, c[1])); }
    for (let i = 0; i < 3; i++) { const c = P(-0.2 + 0.2 * i, 0.55); bag.add('obsidian', rod([c[0], y + 0.01, c[1]], [c[0], y + 0.13, c[1]], 0.04, 6)); }
  } else if (kind === 'jade') {
    const m = P(-0.6, 0.45); slabAt(bag, 'cloth_white', m[0], y, m[1], 1.3, 0.55, 0.01);
    for (let i = 0; i < 24; i++) { const c = P(-1.2 + 0.1 * (i % 12), 0.3 + 0.12 * Math.floor(i / 12) + 0.03 * h(i)); ball(bag, 'inlay_jade', c[0], y + 0.01, c[1], 0.022); }
    for (let i = 0; i < 4; i++) { const c = P(-0.5 + 0.28 * i, 0.7); bag.add('shell_inlay', lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.05], [0.04, 0.07], [0.001, 0.05]], 8, null, c[0], y, c[1])); }
  } else if (kind === 'pottery') {
    for (let i = 0; i < 6; i++) { const c = P(-1.35 + i * 0.28, 0.4 + 0.1 * h(i)); pot(bag, i % 2 ? 'pottery_dark' : 'terracotta', c[0], y, c[1], 0.2 + 0.18 * h(i + 7), 0.09 + 0.05 * h(i + 20)); }
    for (let i = 0; i < 3; i++) { const c = P(-1.0 + 0.5 * i, 0.75); bag.add('pottery_dark', lathe([[0.001, 0], [0.07, 0], [0.13, 0.06], [0.15, 0.08], [0.001, 0.08]], 10, null, c[0], y, c[1])); }
  } else if (kind === 'feathers') {
    for (let b = 0; b < 4; b++) { const c = P(-1.2 + b * 0.5, 0.5); bag.add('timber', lathe([[0.001, 0], [0.1, 0.02], [0.13, 0.2], [0.001, 0.22]], 8, null, c[0], y, c[1])); for (let i = 0; i < 9; i++) bag.add(i % 5 === 0 ? 'cloth_red' : 'stucco_leaf', rod([c[0], y + 0.2, c[1]], [c[0] + 0.12 * Math.cos(i * 1.3), y + 0.7 + 0.2 * h(b * 9 + i), c[1] + 0.12 * Math.sin(i * 1.3)], 0.006, 3)); }
  } else {
    for (let i = 0; i < 5; i++) { const c = P(-1.3 + i * 0.3, 0.4 + 0.1 * h(i)); bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0.01], [0.13, 0.1], [0.1, 0.18], [0.07, 0.2], [0.001, 0.2]], 9, null, c[0], y, c[1])); bag.add('limestone_maya', lathe([[0.001, 0.2], [0.075, 0.2], [0.075, 0.225], [0.001, 0.225]], 8, null, c[0], y, c[1])); }
    const w = P(0.2, 0.06); bag.add('rope_fibre', rod([w[0] - 0.7, y + 1.75, w[1]], [w[0] + 0.7, y + 1.75, w[1]], 0.01, 4));
    for (let i = 0; i < 8; i++) { const c = P(-0.4 + i * 0.14, 0.06); const g = box(-0.08, 0, -0.01, 0.08, 0.025, 0.01); bag.add('cloth_brown', rod([c[0], y + 1.75, c[1]], [c[0], y + 1.45 - 0.05 * h(i), c[1]], 0.008, 3)); bag.add('cloth_brown', g.translate(c[0], y + 1.38 - 0.05 * h(i), c[1])); }
  }
}

/** mt_stall: the market hall's rooms (a k_range, n rooms): each lays out one trade on its bench, by the room's place. */
function stall(el, { bag }) {
  const rw = el.rw ?? 4.2, pt = 1.1, tf = 1.2, rd = 2.7, F = frame(el.face, ...el.c), y = el.y ?? 0, Lv = el.n * rw + (el.n + 1) * pt, V0 = -Lv / 2;
  for (let i = 0; i < el.n; i++) {
    const vc = V0 + pt + i * (rw + pt) + rw / 2, ub = tf + rd, kind = GOODS[(i + Math.floor(hashAt(el.c[0], el.c[1], 4) * 8)) % GOODS.length];
    // along the bench: a = metres to the left of the keeper's place; the bench's top at y + 0.5, its front edge at u = ub - 1.0
    benchStock(bag, kind, (a, d) => F.P(ub - 1.0 + d, vc - 0.4 + a * 0.62 - 0.1), y + 0.52, i * 11 + 3);
  }
}

export const HALL_GOODS = GOODS;
let done = false;
export function registerStock() {
  if (done) return; done = true;
  STYLES.tikal.elements.mt_stock = stock;
  STYLES.tikal.elements.mt_stall = stall;
}
registerStock();
