// The houses of Ming Suzhou whose upper floors can be climbed (docs/settlements/ming-suzhou.md §6,
// "Upstairs"): which lots, what each is used for, and where the way in, the stair and the rooms
// lie in the house's own frame. Pure data and a few functions: town.js builds the houses from it
// (upstairs.js), plan.js walks them (the walk-check routes).
//
// Local frame of a house (as the canal houses of src/styles/ming): a runs along the front, b from
// the street (0) to the back wall; every house of this list faces south onto the south street, so
// that a = 0 is the east end (x1) and b grows northward (z falls). `mir` turns a end for end.

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

/** The upper house's description for a lot: { rect, front, use, … } or null. */
export function upOf(lot) {
  if (lot.front !== 's') return null;
  const u = UP.find((q) => Math.abs(q.x0 - lot.rect[0]) < 0.06 && lot.rect[3] > 61.9 && lot.rect[3] < 62.1);
  return u || null;
}

/** The frame of a house on its lot: A(a, b) → [x, z] in the settlement (front 's'). */
export function frameOf(rect, mir) {
  const [x0, , x1, z1] = rect, L = x1 - x0;
  return { L, D: z1 - rect[1], at: (a, b) => [x1 - (mir ? L - a : a), z1 - b] };
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

/** The route one walks in each house for walk-check: from the street in at the door, to the stair's foot, up, through the upper floor and out onto the gallery. */
export function routeOf(lot, u) {
  const F = frameOf(lot.rect, !!u.mir), lay = layoutOf(F.L), p = ([a, b]) => F.at(a, b);
  const sa = 0.75;
  const pts = [[lay.dc, -2.2], [lay.dc, 0.2], [lay.dc, 1.9], [sa + 0.75, 1.9], [sa + 0.75, 1.4], [sa, STAIR.b0 - 0.2], [sa, STAIR.b0 + 1.2], [sa, STAIR.b1 - 0.1], [1.9, STAIR.b1 + 0.25], ...lay.via, [lay.du, 0.5], [lay.du, 0.3]];
  return pts.map(p);
}

/** The doorway's span along the front, in the shop element's frame (x east of the front's middle), kept clear of goods. */
export function doorGap(lot, u) {
  const L = lot.rect[2] - lot.rect[0], lay = layoutOf(L), x = u.mir ? lay.dc - L / 2 : L / 2 - lay.dc;
  return [x - 1.0, x + 1.0];
}
/** Where the shopkeeper stands: behind the counter, clear of the doorway and of the way to the stair. */
export function shopkeeperAt(lot, u) {
  const F = frameOf(lot.rect, !!u.mir), L = F.L;
  if (L < 5.5) return F.at(L - 0.55, 2.45);          // (a narrow shop: no room behind the counter; he stands in the east back corner, off the way to the stair)
  return F.at((0.25 + L - 1.9) / 2 + 0.4, 1.0);
}
