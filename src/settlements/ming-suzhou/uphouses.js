// The houses of Ming Suzhou whose upper floors can be climbed (docs/settlements/ming-suzhou.md §6,
// "Upstairs"): which lots, what each is used for, and where the way in, the stair and the rooms
// lie in the house's own frame. Pure data and a few functions: town.js builds the houses from it
// (upstairs.js), plan.js walks them (the walk-check routes).
//
// Local frame of a house (as the canal houses of src/styles/ming): a runs along the front, b from
// the street (0) to the back wall. The first sixteen all face south onto the south street (a = 0 is the east end,
// x1, and b grows northward); the houses added later (NEXT, picked from the lots by their distance to the way in)
// face any way: n, e, w too, and a waterside lot is turned to face the lane behind it (its canal side becomes the
// back, with a back door and steps down to the water). `mir` turns a end for end.
import { lots } from './layout.js';

export const D_FRONT = 0.7;          // the ground floor's front line (the shutter line), b
export const U_FRONT = 1.0;          // the upper floor's front wall (set back behind the gallery), b
export const GALLERY = 0.25;         // how far the deck goes over the street: its outer edge at b = −GALLERY
export const RISERS = 16, TREAD = 0.17;
export const STAIR = { a0: 0.25, a1: 1.3, b0: 1.55 };         // the steep stair along the side wall: foot at b0, 2.55 m of run
STAIR.b1 = STAIR.b0 + (RISERS - 1) * TREAD;

/**
 * The houses: x0 the lot's west edge (to find it), use, the roof (the lot's own is kept), mir (the stair at
 * the far end), the floor heights (ground floor to the upper floor, the upper storey).
 */
export const UP = [
  { x0: -71.71, use: 'rice', Hf: 3.4, Hu: 2.75, label: 'the rice shop with its granary loft' },
  { x0: -64.94, use: 'inn', Hf: 3.4, Hu: 2.8, label: 'the tea house with its guest rooms' },
  { x0: -50.48, use: 'merchant', Hf: 3.15, Hu: 2.8, label: 'the merchant\'s house, hall below, bedroom and study above' },
  { x0: 43.0, use: 'cloth', Hf: 3.4, Hu: 2.7, mir: true, label: 'the cloth shop with the tailor\'s workroom' },
  { x0: 50.14, use: 'medicine', Hf: 3.4, Hu: 2.75, mir: true, label: 'the physician\'s shop with its herb loft' },
  { x0: 56.76, use: 'books', Hf: 3.4, Hu: 2.8, mir: true, label: 'the bookshop with its block-cutting room' },
  { x0: 71.21, use: 'lacquer', Hf: 3.4, Hu: 2.75, mir: true, label: 'the lacquer shop with its drying room' },
  { x0: 78.08, use: 'tenement', Hf: 3.0, Hu: 2.6, mir: true, label: 'the tenement: kitchen below, two families\' rooms above' },
  // the narrow houses that stand between them (rooms2.js), each with the trade whose sign hangs outside
  { x0: -90, use: 'wine', trade: 'wine', Hf: 3.3, Hu: 2.7, label: 'the wine shop with its jars' },
  { x0: -86.3144740720978, use: 'pawn', trade: 'pawn', Hf: 3.4, Hu: 2.75, label: 'the pawnshop with its grille and storeroom' },
  { x0: -75.56236214335075, use: 'food', trade: 'food', Hf: 3.3, Hu: 2.7, label: 'the noodle house' },
  { x0: -54.40958784276153, use: 'silk', trade: 'cloth', Hf: 3.3, Hu: 2.7, label: 'the embroiderer' },
  { x0: 63.87040823984426, use: 'pottery', trade: 'pottery', mir: true, Hf: 3.3, Hu: 2.7, label: 'the potter' },
  { x0: 67.77528853372206, use: 'iron', trade: 'iron', mir: true, Hf: 3.2, Hu: 2.65, label: 'the ironmonger' },
  { x0: 85.35959949837998, use: 'fans', trade: 'fans', mir: true, Hf: 3.3, Hu: 2.7, label: 'the fan and umbrella maker' },
  { x0: -79.13, use: 'weaver', Hf: 3.15, Hu: 2.7, label: 'the weaver\'s house with its loom' },
];

// ── the houses added after the first sixteen ────────────────────────────────────────────────────────────────
const WAY_IN = [0, 65];                                   // where the visitor comes into the quarter (the residence's street gate)
const OPP = { n: 's', s: 'n', e: 'w', w: 'e' };
/**
 * The households of the added houses, with what each needs of its lot: wide (a lot of 6.2 m or more), water (a
 * waterside lot: the canal behind it), the trade of the street sign if it keeps a shop front.
 */
export const HOUSEHOLDS = {
  boatman:  { water: true, label: 'the boatman\'s house, with its back door and steps down to the canal' },
  teahouse: { wide: true, water: true, label: 'the tea house over the water, with its storyteller\'s table' },
  drawloom: { label: 'the silk weaver\'s house with its drawloom' },
  lodging:  { wide: true, water: true, label: 'the inn: kitchen, hall and guest rooms' },
  scholar:  { wide: true, label: 'the scholar-official\'s house: ancestors\' shelf, study and bed alcove' },
  printer:  { label: 'the woodblock printer\'s' },
  grocer:   { trade: 'tea', label: 'the grocer\'s, with the family\'s rooms behind the shop' },
  dwelling: { wide: true, label: 'a merchant family\'s house: hall, kitchen and bedrooms' },
  jade:     { label: 'the jade cutter\'s' },
  tinsmith: { label: 'the tinsmith\'s' },
};
const PREFER = ['boatman', 'teahouse', 'drawloom', 'lodging', 'scholar', 'printer', 'grocer', 'dwelling', 'jade', 'tinsmith'];
const MIN_L = 3.3;                                        // narrower lots keep their closed upper floor (the stair and the gallery door need 3.3 m)

let NEXT = null;
/** The added houses: Map lot → { use, Hf, Hu, mir, front, flip, trade?, label }, picked once from the lots (their layout-given fields only). */
function nextHouses() {
  if (NEXT) return NEXT;
  NEXT = new Map();
  const all = lots(), along = (l) => l.front === 'n' || l.front === 's';
  const len = (l) => (along(l) ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]);
  const dist = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - WAY_IN[0], (l.rect[1] + l.rect[3]) / 2 - WAY_IN[1]);
  const isStatic = (l) => UP.some((q) => Math.abs(q.x0 - l.rect[0]) < 0.06) && l.front === 's' && l.rect[3] > 61.9 && l.rect[3] < 62.1;
  const ok = (l) => !isStatic(l) && l.storeys > 1 && (l.kind === 'row' || l.kind === 'court') && !(l.shop0 ?? l.shop) && len(l) >= MIN_L && l.detail === 2;
  const near = all.filter(ok).sort((a, b) => dist(a) - dist(b));
  const picks = near.slice(0, 8);
  // the nearest lot of each side street's facing (east, west), one more each, so that every front is walked
  for (const f of ['e', 'w']) { const l = near.find((q) => q.front === f && !q.water); if (l) picks.push(l); }
  const left = [...PREFER];
  for (const l of picks) {
    const wide = len(l) >= 6.2;
    const k = left.findIndex((u) => (!HOUSEHOLDS[u].wide || wide) && (!HOUSEHOLDS[u].water || l.water) && !(u === 'boatman' && !l.water));
    if (k < 0) continue;
    const use = left.splice(k, 1)[0];
    NEXT.set(l, { x0: l.rect[0], use, trade: HOUSEHOLDS[use].trade, Hf: 3.3, Hu: 2.7, mir: ((l.seed >>> 3) & 1) === 1, flip: !!l.water, fresh: true, front: l.water ? OPP[l.front] : l.front, label: HOUSEHOLDS[use].label });
  }
  return NEXT;
}

/** The upper house's description for a lot: { use, Hf, Hu, mir, front, … } or null. */
export function upOf(lot) {
  const q = UP.find((u) => Math.abs(u.x0 - lot.rect[0]) < 0.06 && lot.front === 's' && lot.rect[3] > 61.9 && lot.rect[3] < 62.1);
  if (q) return q.front ? q : (q.front = 's', q);
  return nextHouses().get(lot) || null;
}

/** The side a climbable house faces (a waterside lot faces the lane behind it). */
export const faceOf = (lot, u) => u.front || lot.front;

const FRONT = {
  s: (r) => ({ o: [r[2], r[3]], u: [-1, 0] }),
  n: (r) => ({ o: [r[0], r[1]], u: [1, 0] }),
  e: (r) => ({ o: [r[2], r[1]], u: [0, 1] }),
  w: (r) => ({ o: [r[0], r[3]], u: [0, -1] }),
};
/**
 * The frame of a house on its lot: at(a, b) → [x, z] in the settlement, for a front n, e, s or w. a runs along the front from
 * the end the stair is at (the frame as houseJiangnan's, turned end for end by mir), b from the front line to the back.
 */
export function frameOf(rect, mir, front = 's') {
  const f = FRONT[front](rect), alongX = front === 'n' || front === 's';
  const L = alongX ? rect[2] - rect[0] : rect[3] - rect[1], D = alongX ? rect[3] - rect[1] : rect[2] - rect[0];
  const v = [-f.u[1], f.u[0]];
  let o = f.o, u = f.u;
  if (mir) { o = [o[0] + u[0] * L, o[1] + u[1] * L]; u = [-u[0], -u[1]]; }
  return { L, D, u, v, front, at: (a, b) => [o[0] + u[0] * a + v[0] * b, o[1] + u[1] * a + v[1] * b] };
}

/**
 * Where the openings lie, in the house's frame (a along the front): the ground door (dc), the partition between the
 * stair room and the rest (pa; none in a narrow house), the upper floor's windows and its door to the gallery (du),
 * and the way one walks from the stair's top to the gallery (via).
 */
export function layoutOf(L) {
  const pa = L >= 5.5 ? 3.05 : null;
  const e0 = pa === null ? 1.45 : pa + 0.06, e1 = L - 0.25;
  const wins = [], du = pa === null ? L - 1.15 : e1 - 0.9;
  if (pa === null) wins.push({ ac: 0.85, w: 0.8 });
  else { wins.push({ ac: 0.85, w: 0.9 }); for (let a = e0 + 0.75; a < du - 1.35; a += 1.9) wins.push({ ac: a, w: 1.0 }); }
  // from the stair's top down the stair room's side to the doorway at the front, along the front to the gallery door
  const via = pa === null ? [[1.9, 3.4], [du - 0.2, 2.2], [du, 1.45]] : [[1.9, 3.2], [1.9, 1.9], [pa, 1.9], [pa + 0.7, 1.9], [du - 0.3, 1.9], [du, 1.45]];
  return { pa, dc: L - 0.9, wins, du, via, e0, e1, gal: [Math.max(e0 + 0.05, du - 1.35), Math.min(e1 - 0.05, du + 1.35)], door: [1.45, 2.35] };
}

/** The route one walks in each house for walk-check: from the street in at the door, to the stair's foot, up, through the upper floor and out onto the gallery; in a waterside house back down and through to the back door, out to the landing and down the steps. */
export function routeOf(lot, u) {
  const F = frameOf(lot.rect, !!u.mir, faceOf(lot, u)), lay = layoutOf(F.L), p = ([a, b]) => F.at(a, b);
  const sa = 0.75;
  const up = [[lay.dc, -2.2], [lay.dc, 0.2], [lay.dc, 1.9], [sa + 0.75, 1.9], [sa + 0.75, 1.4], [sa, STAIR.b0 - 0.2], [sa, STAIR.b0 + 1.2], [sa, STAIR.b1 - 0.1], [1.9, STAIR.b1 + 0.25], ...lay.via, [lay.du, 0.5], [lay.du, 0.3]];
  if (!u.flip) return up.map(p);
  // and back: down the stair, through the ground floor to the back door (backDoor, below), out onto the landing and down to the water
  const back = backWay(F, lay, u);
  const down = [[lay.du, 0.5], ...[...lay.via].reverse(), [1.9, STAIR.b1 + 0.25], [sa, STAIR.b1 - 0.1], [sa, STAIR.b0 + 1.2], [sa, STAIR.b0 - 0.2]];
  return [...up, ...down, ...back].map(p);
}

/**
 * Where the back door and the steps down to the canal lie in a waterside house's frame (upstairs.js builds them, rooms3.js keeps
 * the way to them clear): the doorway at a = bc, 1.2 m wide, in the back wall (outer face at vb); the deck over the canal wall
 * and the water, deck = [a0, a1, depth beyond vb]; then n treads of run along the wall toward a = 0 from aS, each of rise down to
 * the slab just over the water (land, absolute height; slab long).
 */
export function backDoor(L, D) {
  const bc = L - 1.0, vb = D - 0.15;
  return { a0: bc - 0.6, a1: bc + 0.6, bc, vb, deck: [bc - 0.75, bc + 0.75, 1.3], n: 6, run: 0.26, slab: 0.8, aS: bc - 0.75, land: -0.61 };
}
function backWay(F, lay, u) {
  void lay; void u;
  const bd = backDoor(F.L, F.D), ib = bd.vb - 0.25, pts = [[1.5, 1.4], [1.5, 1.9], [1.9, 1.9], [1.9, STAIR.b1 + 0.6], [bd.bc, ib - 1.2], [bd.bc, bd.vb - 0.12], [bd.bc, bd.vb + 0.5], [bd.bc, bd.vb + 0.85]];
  for (let k = 0; k < bd.n; k++) pts.push([bd.aS - (k + 0.5) * bd.run, bd.vb + 0.85]);
  pts.push([bd.aS - bd.n * bd.run - bd.slab / 2, bd.vb + 0.85]);
  return pts;
}

/** The doorway's span along the front, in the shop element's frame (x east of the front's middle), kept clear of goods. */
export function doorGap(lot, u) {
  const F = frameOf(lot.rect, !!u.mir, faceOf(lot, u)), lay = layoutOf(F.L), p = F.at(lay.dc, 0), m = F.at(F.L / 2, 0);
  const f = faceOf(lot, u), n = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[f], rot = Math.atan2(n[0], n[1]);
  const x = (p[0] - m[0]) * Math.cos(rot) - (p[1] - m[1]) * Math.sin(rot);
  return [x - 1.0, x + 1.0];
}
/** Where the shopkeeper stands: behind the counter, clear of the doorway and of the way to the stair. */
export function shopkeeperAt(lot, u) {
  const F = frameOf(lot.rect, !!u.mir, faceOf(lot, u)), L = F.L;
  if (L < 5.5) return F.at(L - 0.55, 2.45);          // (a narrow shop: no room behind the counter; he stands in the east back corner, off the way to the stair)
  return F.at((0.25 + L - 1.9) / 2 + 0.4, 1.0);
}
