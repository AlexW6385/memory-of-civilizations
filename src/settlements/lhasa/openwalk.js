// The visitor's walk in Lhasa (docs/settlements/lhasa.md §19): the routes that prove a visitor can enter the street's trading houses and tea houses (each one room, goods
// to the beams, its keeper behind the counter), the printing house (through its gate into the court and the block store), and the chapel of the great prayer wheel.
// Pure data from layout.js (the shops' and the chapel's own rects); the doors are the style's (styles/tibetan/shops.js: the front's middle).
import { shops, CHAPEL, PRINTERY } from './layout.js';

/** The routes into the street's shops: the three tea houses and the sixteen trading houses nearest the street's middle, from the street's axis through the door into the room. */
export function shopWalks() {
  const near = shops().filter((s) => s.kind !== 'stall').map((s) => ({ s, d: Math.abs((s.rect[1] + s.rect[3]) / 2 - 110) }));
  const pick = [...near.filter((q) => q.s.kind === 'tea'), ...near.filter((q) => q.s.kind === 'trade').sort((a, b) => a.d - b.d).slice(0, 16)];
  return pick.map(({ s }) => {
    const [x0, z0, x1, z1] = s.rect, e = s.door === 'e', o = e ? 1 : -1, fx = e ? x1 : x0, zc = (z0 + z1) / 2, deep = s.kind === 'tea' ? 3.2 : 1.7;
    return [[0, zc], [fx + o * 1.2, zc], [fx - o * 1.2, zc], [fx - o * deep, zc]];
  });
}
/**
 * The printing house: from the street's axis out along the wide lane, round the printery's west and south sides (the way a walker is clear of every wall and lot: found by search on the
 * collision world), in at the gate on the south and up the court to the block store; and the chapel from the circuit's west leg (the ground there stands a little above 0.5 m: y0).
 */
export function placeWalks() {
  const [x0, z0, x1, z1] = PRINTERY, gx = (x0 + 6 + x1 - 6) / 2, C1 = z0 + 7.5, cy = (CHAPEL[1] + CHAPEL[3]) / 2;
  const to = [[0, 141], [15.5, 149.5], [25, 159], [131, 161.5], [131.5, 162], [145.5, 178], [146.5, 183], [150, 199.2], [gx - 2, z1 + 1.4], [gx - 0.5, z1 + 0.5], [gx + 1, z1 - 5.5], [gx + 1.5, z1 - 6], [gx + 3.5, z1 - 6], [gx + 5, z1 - 9], [gx + 5, C1 + 4], [gx + 1, C1], [gx, C1 - 2.5]];
  const chapel = [[-216, cy], [CHAPEL[0] + 1.5, cy - 0.5], [CHAPEL[0] + 1.6, cy - 1.2]];
  return [Object.assign(to, { y0: 0 }), Object.assign(chapel, { y0: 0.5 })];
}
