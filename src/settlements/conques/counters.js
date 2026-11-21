// Conques about 1120 — the open shops' keepers and the goods on their counters, modelled one by one (docs/settlements/conques.md §21).
// The keeper stands inside, behind the counter-board of the shop's arch, facing the lane; he is built into a near plan (a life element's figures
// reach 170 m wherever they stand). The goods lie on the board's inner half (the baskets and pots of town.js `goods` keep its outer edge).
// [inferred: the trades' stock; nothing at Conques about 1120 records a counter.]
import '../../styles/romanesque/index.js';
import { STYLES } from '../../core/build.js';
import { lathe, rod, box } from '../../core/geom.js';
import { lots, RADIUS } from './layout.js';
import { shopPoint, doorU } from '../../styles/romanesque/village.js';
import { figure } from '../../objects/figures.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const CELL = 100;

/** conques_counters { list: [{ rect, front, y, seed, trade }] }: for each open shop its keeper and the goods of its trade on the board. */
function counters(el, ctx) {
  const bag = ctx.bag;
  for (const l of el.list) {
    const sp = shopPoint(l), a0 = sp.a0, P = sp.P, r = rng(l.seed * 7 + 3), top = l.y + 0.96;
    const at = (u, v) => P(a0 + u, v);
    const L = (m, u, v, prof, k = 1) => { const p = at(u, v); bag.add(m, lathe(prof.map(([a, b]) => [a * k, b * k]), 8, null, p[0], top, p[1])); };
    const T = l.trade;
    if (T === 'bread') for (let k = 0; k < 6; k++) L('hide_tan', -1.1 + (k % 3) * 0.3 + (k > 2 ? 0.14 : 0), 0.45 + Math.floor(k / 3) * 0.28, [[0.001, 0], [0.11, 0.03], [0.13, 0.07], [0.09, 0.11], [0.001, 0.125]], 0.9 + r() * 0.2);
    else if (T === 'shells') for (let k = 0; k < 7; k++) L('ivory', -1.15 + (k % 4) * 0.24, 0.45 + Math.floor(k / 4) * 0.26, [[0.001, 0], [0.07, 0.01], [0.055, 0.03], [0.001, 0.036]], 0.9 + r() * 0.2);
    else if (T === 'pots') for (let k = 0; k < 4; k++) L(k % 2 ? 'terracotta' : 'pottery_dark', -1.15 + k * 0.3, 0.55 + (k % 2) * 0.12, [[0.001, 0], [0.07, 0.01], [0.115, 0.1], [0.08, 0.2], [0.09, 0.23], [0.06, 0.25]], 0.9 + r() * 0.25);
    else if (T === 'tavern') for (let k = 0; k < 4; k++) L('wood_dark', -1.15 + k * 0.26, 0.5 + (k % 2) * 0.2, [[0.001, 0], [0.05, 0], [0.06, 0.1], [0.055, 0.11]], 1);
    else if (T === 'staffs') { for (let k = 0; k < 3; k++) { const a = at(-1.25 + k * 0.05, 0.5), b = at(-0.5 - k * 0.04, 0.78); bag.add('wood_ochre', rod([a[0], top + 0.02, a[1]], [b[0], top + 0.05, b[1]], 0.016, 6)); } L('hide_brown', -0.95, 0.65, [[0.001, 0], [0.07, 0.03], [0.08, 0.1], [0.04, 0.17], [0.001, 0.18]], 1); }
    else if (T === 'cloth' || T === 'weaver') {
      const cols = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white'];
      for (let k = 0; k < 3; k++) { const a = at(-1.2 + k * 0.38, 0.45), b = at(-0.9 + k * 0.38, 0.8), x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]); bag.add(cols[(k + (l.seed % 3)) % 5], box(x0, top, z0, x1, top + 0.1 + (k % 2) * 0.05, z1)); }
    } else if (T === 'smith') for (let k = 0; k < 3; k++) { const a = at(-1.2 + k * 0.1, 0.5 + k * 0.1), b = at(-0.8 + k * 0.1, 0.55 + k * 0.1); bag.add('iron', rod([a[0], top + 0.02, a[1]], [b[0], top + 0.02, b[1]], 0.014, 6)); }
    // the keeper, behind the board (v 1.4), facing the lane
    const du = doorU(l).du, side = du > a0 ? -1 : 1, k = at(side * 1.05, 1.35), H = 1.58 + r() * 0.14, mat = ['cloth_brown', 'cloth_grey', 'cloth_ochre', 'cloth_green'][Math.floor(r() * 4)];
    const rot = sp.out + Math.PI + (r() - 0.5) * 0.3;
    figure({ at: k, y: l.y + 0.1, rot, h: H, seed: Math.floor(r() * 1e9), dress: T === 'smith' || T === 'bread' ? 'tunic' : 'robe', cloth: T === 'bread' ? 'cloth_white' : mat, cloth2: 'cloth_grey', over: T === 'smith' ? 'belt' : 'none', skin: 'skin_light', hat: r() < 0.5 ? 'cap' : 'none', hatMat: 'cloth_brown', pose: 'stand', carry: 'none' }, { bag, col: ctx.col });
  }
}

let done = false;
function register() { if (done) return; done = true; (STYLES.romanesque.elements ??= {}).conques_counters = counters; }
register();

/** The near plans (100 m cells) holding the keepers and goods of the open shops. */
export function counterPlans() {
  const cells = new Map();
  for (const l of lots()) {
    if (!l.shop || !l.open || l.hostel) continue;
    const key = `${Math.floor((l.rect[0] + l.rect[2]) / 2 / CELL)},${Math.floor((l.rect[1] + l.rect[3]) / 2 / CELL)}`;
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push({ rect: l.rect, front: l.front, y: l.y, seed: l.seed, trade: l.trade });
  }
  return [...cells].map(([k, list]) => {
    const [i, j] = k.split(',').map(Number);
    return { id: `conques-counters-${k}`, style: 'romanesque', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [{ t: 'conques_counters', list }], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, 0], facing: 'e' }, center: [i * CELL + CELL / 2, j * CELL + CELL / 2], near: 110 };
  });
}
