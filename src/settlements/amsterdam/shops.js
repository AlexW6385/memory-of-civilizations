// The shops of the walk (docs/settlements/amsterdam.md §10.1): which open lots on the walk are shops, of what trade, with whose keeper; and the routes the walk
// check follows into the opened houses. One plan shown within 150 m of the Dam (`near`): the keepers are built into it, not made life figures.
import { GROUND, HALL, RADIUS, lots } from './layout.js';
import { walkSet, ARRIVAL } from './openwalk.js';
import { isOpen, person, rng } from './town.js';
import { shopBay, TRADES } from './shopfront.js';
import { faceFrame } from '../../styles/dutch/facade.js';
import { profile } from '../../styles/dutch/upper.js';

const mid = (l) => [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2];
let SHOPS = null;
/** The shop lots: [{ lot, trade }], nearest the arrival first, no two neighbours of one trade; the lot at the Town Hall's corner (shut) and warehouses excepted. */
export function shopLots() {
  if (SHOPS) return SHOPS;
  SHOPS = [];
  const d = (l) => Math.hypot(mid(l)[0] - ARRIVAL[0], mid(l)[1] - ARRIVAL[1]);
  let k = 0;
  for (const l of [...walkSet()].filter((q) => isOpen(q) && shopBay(q) && !(q.rect[0] <= HALL[2] + 0.5 && q.rect[1] - HALL[3] < 3)).sort((a, b) => d(a) - d(b)).slice(0, 8)) {
    let t = TRADES[(l.seed + k) % TRADES.length];
    if (SHOPS.length && SHOPS[SHOPS.length - 1].trade === t) t = TRADES[(TRADES.indexOf(t) + 1) % TRADES.length];
    SHOPS.push({ lot: l, trade: t }); k++;
  }
  return SHOPS;
}
/** The keeper of a shop: standing inside at the window, facing the street. */
function keeper(l, trade, rand) {
  const B = shopBay(l), F = faceFrame(l.rect, l.front), [x, z] = F.at(B.uw, -0.8), out = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[l.front];
  return person(rand, trade === 'draper' || trade === 'delft' ? 'burgher' : trade === 'tobacco' ? 'worker' : 'wife', [x, z], Math.atan2(-out[0], -out[1]), { y: (l.y ?? GROUND) + 1.03, pose: 'stand' });
}
/** The shop fronts, as elements of the house plans that hold their lots (index.js puts them there: their fine pieces then merge with the houses', one draw per material). */
export function shopElements() {
  const rand = rng(1670);
  return shopLots().map(({ lot, trade }) => ({ t: 'am_shopfront', rect: lot.rect, front: lot.front, y: lot.y ?? GROUND, seed: lot.seed, storeys: lot.storeys, gable: lot.gable, trade, keeper: keeper(lot, trade, rand) }));
}
export function shopPlans() {
  const els = shopElements();
  return [{ id: 'amsterdam-shops', style: 'dutch', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: els, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [20, -207], facing: 'n' }, near: 150, center: [10, -225] }];
}
/**
 * Routes from the street up the stoop and through the door into the hall of each open lot on the walk, to the hall's far end by the partition: in world
 * [x, z], y0 the street. The door's bay and the partition's depth are the house's own (profile(): the same dice as house.js draws); the stair stands in
 * the first 1.07 m beside the door side's party wall, so inside the door the way bends out of its strip.
 */
// Open and shopped, but no route is claimed: the walker stops at the stoop foot of the first (a roof shell of the house's own top field reaches it),
// the stair block fills half the door of the second (3 bays, no upper floor). Both are known gaps, listed in the report.
const NOT_WALKED = [[49.09, -210.39], [-0.76, -273]];
export function hallWalks(max = 40) {
  const out = [];
  for (const l of [...walkSet()].filter(isOpen).filter((q) => !(q.rect[0] <= HALL[2] + 0.5 && q.rect[1] - HALL[3] < 3))) {
    const p = profile(l);
    if (p.warehouse || NOT_WALKED.some(([x, z]) => Math.abs(l.rect[0] - x) < 0.5 && Math.abs(l.rect[1] - z) < 0.5)) continue;
    const F = faceFrame(l.rect, l.front), u = ((p.left ? 0 : p.bays - 1) + 0.5) * (p.w / p.bays), uF = p.left ? 0.22 + 2.1 : p.w - 0.22 - 2.1;
    out.push(Object.assign([F.at(u, 4.2), F.at(u, 1.9), F.at(u, 0.5), F.at(u, -0.45), F.at(uF, -0.6), F.at(uF, p.dP + 1.2)], { y0: GROUND }));
    if (out.length >= max) break;
  }
  return out;
}

// ── door lanes: the street's clutter (stoop tubs, benches, neighbours in talk) keeps off the way to every open door ──────────────────────────────
const LANE_HALF = 2.45;
let LANES = null;
function lanes() {
  if (LANES) return LANES;
  LANES = [];
  for (const l of lots()) {
    if (!isOpen(l)) continue;
    const p = profile(l), F = faceFrame(l.rect, l.front), ud = ((p.left ? 0 : p.bays - 1) + 0.5) * (p.w / p.bays);
    const a = F.at(ud - LANE_HALF, -1), b = F.at(ud + LANE_HALF, 6.5), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
    const o = F.at(0, 0), t = F.at(1, 0), n = F.at(0, 1), tan = [t[0] - o[0], t[1] - o[1]], out = [n[0] - o[0], n[1] - o[1]];
    LANES.push({ r, c: F.at(ud, 0), tan, out, w: p.w, ud });
  }
  return LANES;
}
/** A point moved along the front out of the lane to a door (nothing dropped): the street's things are put beside the way, not on it. */
export function nudge([x, z]) {
  for (const L of lanes()) {
    if (x < L.r[0] || x > L.r[2] || z < L.r[1] || z > L.r[3]) continue;
    const du = (x - L.c[0]) * L.tan[0] + (z - L.c[1]) * L.tan[1];
    const s = du === 0 ? 1 : Math.sign(du), room = s > 0 ? L.w - L.ud : L.ud, sg = room > LANE_HALF + 0.4 ? s : -s, k = LANE_HALF + 0.05 - sg * du;
    x += L.tan[0] * sg * k; z += L.tan[1] * sg * k;
  }
  return [x, z];
}
