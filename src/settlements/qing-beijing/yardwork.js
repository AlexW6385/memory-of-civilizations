// The household in the yards of the courtyard houses that are walked into (docs/settlements/qing-beijing.md §46): what a family left
// standing in its yard on an early-autumn day of the 1690s — the water vat by the kitchen wing, a rack of corn and chillies drying, the
// coal balls the household made for the winter stacked by the wall, a caged bird on its stand, an elder on a stool, someone sweeping, a
// child squatting. Built into the house's near plan (rooms.js calls it: the `bj_rooms` element of the life plan within 140 m of the visitor),
// so the figures and things cost no plan of their own. Every choice is a hash of the house's seed or of the place: no counters, no Math.random.
import { box, lathe } from '../../core/geom.js';
import { Parts, limb } from '../../styles/qing/carving.js';
import { figure } from '../../objects/figures.js';
import { houseTrees } from './layout.js';
import { vat, stool } from './interiors.js';
import { hashAt } from './nightlight.js';

const FIG = { dress: 'robe', cloth2: 'cloth_black', skin: 'skin_light', hair: 'shaven' };

/** A bamboo bird cage on a stand: a post with a crook, the cage hung from it, a seed cup. Origin at the foot. */
function birdStand(P) {
  P.add('timber', limb([0, 0, 0], [0, 1.75, 0], 0.025, 0.02, 5));
  P.add('timber', box(-0.16, 0, -0.16, 0.16, 0.05, 0.16));
  P.add('timber', limb([0, 1.75, 0], [0.26, 1.78, 0], 0.016, 0.014, 4));
  P.add('timber', limb([0.26, 1.78, 0], [0.26, 1.7, 0], 0.01, 0.01, 3));
  const cage = lathe([[0.001, 1.34], [0.13, 1.35], [0.15, 1.44], [0.15, 1.6], [0.1, 1.68], [0.001, 1.7]], 10, null, 0.26, 0, 0);
  P.add('wicker', cage);
  P.add('lacquer_black', lathe([[0.001, 1.33], [0.14, 1.33], [0.14, 1.36], [0.001, 1.36]], 10, null, 0.26, 0, 0));
}
/** A drying rack along z, 1.7 m long: two posts and a pole with strings of dried corn and red chillies hung from it (autumn's store, §33). Origin at its middle. */
function dryRack(P, k) {
  for (const s of [-1, 1]) P.add('wood_dark', limb([-0.12, 0, s * 0.85], [0, 2.0, s * 0.85], 0.04, 0.035, 5));
  P.add('wood_dark', limb([-0.02, 1.98, -0.92], [-0.02, 1.98, 0.92], 0.03, 0.03, 5));
  for (let i = 0; i < 6; i++) {
    const z = -0.7 + i * 0.28, corn = (i + k) % 2 === 0, len = 0.7 + 0.1 * ((i * 7 + k) % 4);
    P.add('timber', limb([-0.02, 1.98, z], [-0.02, 1.98 - len, z], 0.008, 0.008, 3));
    if (corn) for (let q = 0; q < 4; q++) P.add('cloth_ochre', lathe([[0.001, 0], [0.04, 0.03], [0.045, 0.14], [0.02, 0.22], [0.001, 0.24]], 6, null, -0.02 + (q % 2 ? 0.03 : -0.03), 1.98 - len + q * 0.17, z));
    else for (let q = 0; q < 6; q++) P.add('cloth_red', lathe([[0.001, 0], [0.025, 0.04], [0.02, 0.14], [0.001, 0.2]], 5, null, -0.02 + (q % 2 ? 0.025 : -0.025), 1.98 - len + q * 0.1, z));
  }
}
/** A stack of coal balls (meitou: coal dust, loess and water pressed in a mould), a cone with a flat top against the wall. */
function coalPile(P, k) {
  P.add('granite_black', lathe([[0.001, 0.62 * k], [0.28 * k, 0.6 * k], [0.52 * k, 0.28 * k], [0.62 * k, 0.0], [0.001, 0.0]], 9));
  P.add('granite_black', lathe([[0.62 * k, 0.0], [0.7 * k, 0.0], [0.64 * k, 0.1 * k], [0.55 * k, 0.12 * k]], 9));
}

/** The yard's household: `el` the house element (rect, seed, courts, wealth, lod), `P` houses.js houseParts(el), ctx the builder's { bag, col }. */
export function yardHousehold(el, P, ctx) {
  const { bag, col } = ctx;
  if ((el.lod ?? 0) > 1 || !P.wings.length) return;
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, seed = el.seed || 1;
  const h01 = (s) => hashAt(seed % 997, Math.floor(seed / 997) % 991, s);
  const trees = houseTrees({ rect: el.rect, seed, courts: el.courts, wealth: el.wealth });
  const free = (x, z, r) => trees.every(([tx, tz]) => Math.hypot(tx - x, tz - z) > r + 1.0) && Math.abs(x - cx) > r + 0.9;
  const wE = P.wings.find((w) => w.side === 'e'), wW = P.wings.find((w) => w.side === 'w');          // the west and the east wing ('e' faces east)
  const place = (Q, x, z, yaw = 0) => Q.emit(bag, x, 0.03, z, yaw);
  const zs = (w) => w.rect[3];                                                                          // the wings' south ends
  const fig = (x, z, rot, extra) => figure({ t: 'figure', at: [x, z], y: 0.03, rot, seed: Math.floor(h01(Math.floor(x * 7 + z * 3)) * 1e9), ...FIG, ...extra }, ctx);
  // the water vat by the kitchen wing (the west one): carried in from the lane's well; its wooden lid leaned against it
  if (wE) {
    const x = wE.rect[2] + 1.45, z = zs(wE) - 1.3;
    if (free(x, z, 0.5)) { const Q = new Parts(); vat(Q, 0.42); place(Q, x, z); col.circle(x, z, 0.5, 0.03, 1.0); }
    // an elder on a low stool beside it, in the sun, a pipe in the hand's place left out (the stool is the thing seen)
    if (h01(2) < 0.7) {
      const sx = x + 1.7, sz = z - 0.9;
      if (free(sx, sz, 0.4)) { const S = new Parts(); stool(S, 0.4, 0.34); place(S, sx, sz); fig(sx, sz, Math.PI / 2 + 0.4, { pose: 'sit', cloth: 'cloth_grey', hat: 'cap', hair: 'bun', y: 0.03 + 0.4 }); col.circle(sx, sz, 0.4, 0.03, 0.9); }
    }
  }
  // the east wing: coal balls stacked against its wall at the south end, the drying rack at the north
  if (wW) {
    const x = wW.rect[0] - 1.5, z = zs(wW) - 1.1;
    if (free(x, z, 0.7) && h01(3) < 0.85) { const Q = new Parts(); coalPile(Q, 1.0 + 0.3 * h01(4)); place(Q, x, z, h01(5) * 6.28); col.circle(x, z, 0.65, 0.03, 0.7); }
    // (the rack in the north half of the wing's front, clear of the door's middle: the wing is 6.6 m long, its door in the middle)
    const rz = wW.rect[1] + 1.35, rx = wW.rect[0] - 1.6;
    if (free(rx, rz, 1.0) && h01(6) < 0.9) { const Q = new Parts(); dryRack(Q, seed % 4); place(Q, rx, rz); col.rect([rx - 0.2, rz - 0.95, rx + 0.2, rz + 0.95], 0.03, 2.1); }
    // a child squatting by the coal pile, a clay toy before it
    if (h01(7) < 0.55) fig(x - 1.3, z - 0.5, -Math.PI / 2, { child: true, pose: 'squat', dress: 'trousers', cloth: 'cloth_indigo', hat: 'none', over: 'none' });
  }
  // the caged bird on its stand before the main house, the keeper's way of passing the morning [stated: §25, bird keepers]
  {
    const sg = h01(8) < 0.5 ? -1 : 1, bx = cx + sg * 3.3, bz = P.main[3] + 2.2;
    if (free(bx, bz, 0.5) && h01(9) < 0.8) { const Q = new Parts(); birdStand(Q); place(Q, bx, bz, sg * 0.8); col.circle(bx, bz, 0.3, 0.03, 1.8); }
  }
  // someone sweeping the yard's paving, a long bamboo broom
  {
    const sx = cx + (h01(10) < 0.5 ? -1 : 1) * 2.2, sz = P.main[3] + 4.6;
    if (free(sx, sz, 0.5) && h01(11) < 0.85) fig(sx, sz, h01(12) * 6.28, { carry: 'broom', dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_indigo', hat: 'cap', over: 'none', hair: 'shaven' });
  }
}
