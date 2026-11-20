// The keepers behind the counters of the opened shops and the wells of the walk (docs/settlements/versailles.md §11.2): street-life elements (the
// figures and wells of the life style) for streets.js to put in its tiles, placed from the shops' own frame (openwalk.js) so that each keeper stands
// where the room's furniture (src/styles/classical_fr/interiors.js) leaves the floor behind the counter free.
import { RISE, YARDS, YARD_Y, lots } from './layout.js';
import { opened, doorOf, frameAt, faceOut, walkDist } from './openwalk.js';

/** What each trade's keeper wears: [coat, apron or second cloth, hat, hat cloth] [inferred from the trades' dress about 1690]. */
const DRESS = {
  baker: ['cloth_white', 'cloth_white', 'cap', 'cloth_white'], tavern: ['cloth_brown', 'cloth_white', 'none', 'cloth_white'], draper: ['cloth_indigo', 'cloth_white', 'none', 'cloth_black'],
  apothecary: ['cloth_black', 'cloth_white', 'cap', 'cloth_black'], cobbler: ['cloth_brown', 'hide_tan', 'cap', 'cloth_brown'], barber: ['cloth_maroon', 'cloth_white', 'none', 'cloth_white'],
  cutler: ['cloth_grey', 'hide_tan', 'cap', 'cloth_grey'], vintner: ['cloth_green', 'cloth_white', 'brim', 'cloth_black'], bookseller: ['cloth_black', 'cloth_white', 'cap', 'cloth_black'],
  butcher: ['cloth_red', 'cloth_white', 'cap', 'cloth_white'], hatter: ['cloth_brown', 'cloth_white', 'brim', 'cloth_black'], chandler: ['cloth_ochre', 'cloth_white', 'cap', 'cloth_brown'],
};
/** The spot behind the counter in the shop's frame: [u in the layout's own mirrored sense, v in from the front] — counters stand at v 2.0–2.7, the floor behind is free. */
export function keeperSpot(el) {
  const L = el.rect[2] - el.rect[0], D = el.rect[3] - el.rect[1], d = doorOf(el), mirrored = d.u > L / 2;
  const u0 = el.use === 'tavern' ? 2.0 : 1.3, v = el.use === 'tavern' ? D - 0.6 - 2.5 : 3.1;
  return [mirrored ? u0 : L - u0, v];
}
/** The keepers of the open shops of the avenue (at most `n`, nearest the walk first). */
export function keeperElements(n = 16) {
  const out = [];
  const shops = opened().filter((e) => !e.yard && e.kind === 'shop' && DRESS[e.use]).sort((a, b) => walkDist([(a.rect[0] + a.rect[2]) / 2, (a.rect[1] + a.rect[3]) / 2]) - walkDist([(b.rect[0] + b.rect[2]) / 2, (b.rect[1] + b.rect[3]) / 2]));
  for (const el of shops.slice(0, n)) {
    const [u, v] = keeperSpot(el), [x, z] = frameAt(el, u, v), [c1, c2, hat, hm] = DRESS[el.use];
    out.push({ t: 'figure', at: [x, z], y: RISE + 0.14, rot: faceOut(el), h: 1.62 + ((el.seed >>> 3) % 12) / 100, seed: el.seed, dress: 'tunic', legs: 'hose', skin: 'skin_light', cloth: c1, cloth2: c2, hat, hatMat: hm, over: 'apron', pose: 'stand' });
  }
  return out;
}
/** Wells: a stone curb with a windlass and its bucket, one in the back of each service yard and two in the avenue de Paris, at its kerbs [inferred: the town drew its water from wells and water-carriers]. */
export function wellElements() {
  const out = [];
  for (const [i, r] of YARDS.entries()) out.push({ t: 'well', at: [r[0] + 6, i === 0 ? r[3] - 3 : r[1] + 3], y: YARD_Y, rot: i * 1.57, seed: 90 + i, kind: 'windlass', square: true });
  for (const [x, z] of [[326, 10], [378, -10]]) out.push({ t: 'well', at: [x, z], y: RISE, rot: x, seed: x, kind: 'windlass', square: true });
  return out;
}
void lots;
