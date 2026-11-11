// Mongol Karakorum c. 1254 — the moving life (docs/settlements/mongol-karakorum.md §8): Mongols in the long right-lapel robe and boots, in hats with brims or fur
// caps; women in the tall headdress; Saracen merchants in turbans; Chinese craftsmen in tunics and round caps; Buddhist monks; envoys of many nations in
// their own dress (a Franciscan in grey); herd-boys. They walk the main street and the cross-street, the lanes between the courts, the approaches of the gates
// and the paths of the palace court and the ger camps. No boats. The ways come from layout.js; data for src/engine/movers.js.
import { RADIUS, MAIN, CROSS, LOTS, CAMPS, WALL, GATES } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 4, rain: 0.5, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -50,
};

export function walkways() {
  const rects = [], links = [];
  // the main street (stone-paved) in 20 m lengths, the cross-street likewise
  for (let x = -130; x < 130; x += 20) rects.push({ r: [x, MAIN.z - 3.6, Math.min(x + 20.5, 131), MAIN.z + 3.6], weight: 1.6, market: 1.6, kind: 'street' });
  for (let z = -95; z < 95; z += 20) if (Math.abs(z + 10) > 8) rects.push({ r: [CROSS.x - 3, z, CROSS.x + 3, Math.min(z + 20.5, 96)], weight: 1.0, market: 0.8, kind: 'street' });
  // the lanes: between the rows of courts and the columns of lots
  for (const [z0, z1] of [[-17.5, -14.6], [-37.5, -34.4], [-55.5, -52.4], [14.4, 17.6], [32.4, 35.6], [50.4, 53.6], [68.4, 71.6]]) rects.push({ r: [-130, z0, -30, z1], weight: 0.5, market: 0.2, kind: 'lane' });
  for (const l of LOTS) void l;
  for (const k of [0, 1, 2, 3, 4]) { const x = -112.25 + 17.5 * k; rects.push({ r: [x - 1.1, -69, x + 1.1, -18], weight: 0.35, market: 0.1, kind: 'lane' }); rects.push({ r: [x - 1.1, 17, x + 1.1, 86], weight: 0.35, market: 0.1, kind: 'lane' }); }
  // the Cathayan lanes
  rects.push({ r: [30.5, 10, 35.5, 94], weight: 0.6, market: 0.3, kind: 'lane' });
  rects.push({ r: [66, 77, 78, 95], weight: 0.7, market: 0.3, kind: 'lane' });
  rects.push({ r: [8, 93, 130, 94.9], weight: 0.5, market: 0.2, kind: 'lane' });
  // the gates and the markets outside: the roads out
  rects.push({ r: [-3, -134, 3, -99], weight: 1.0, market: 1.0, kind: 'street' }, { r: [-3, 99, 3, 130], weight: 1.0, market: 1.0, kind: 'street' });
  rects.push({ r: [-172, -3, -133, 3], weight: 1.0, market: 1.0, kind: 'street' }, { r: [133, -3, 168, 3], weight: 1.0, market: 1.0, kind: 'street' });
  // the palace court: the way from the gate to the hall's steps, and the open court to the west
  rects.push({ r: [66, -38, 74, -12], weight: 0.9, market: 0.2, kind: 'street' }, { r: [14, -36, 46, -12], weight: 0.4, market: 0.1, kind: 'lane' });
  rects.push({ r: [66, -14, 74, -4], weight: 0.9, market: 0.2, kind: 'street' });
  // the ger camps outside the south wall: the lanes between the rows of gers
  for (const c of [CAMPS.sw, CAMPS.se]) {
    rects.push({ r: [c[0] - 30, c[1] - 8.6, c[0] + 30, c[1] - 3.4], weight: 0.5, market: 0.2, kind: 'lane' });
    rects.push({ r: [c[0] - 30, c[1] + 8.4, c[0] + 30, c[1] + 14.0], weight: 0.5, market: 0.2, kind: 'lane' });
    rects.push({ r: [c[0] - 30, c[1] - 24, c[0] + 30, c[1] - 19.6], weight: 0.4, market: 0.1, kind: 'lane' });
    rects.push({ r: [c[0] - 4, c[1] - 24, c[0] + 4, c[1] + 6], weight: 0.0, market: 0.0, kind: 'lane' });
  }
  void WALL; void GATES;
  return { rects: rects.filter((q) => q.weight > 0), links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', grey: 'cloth_grey', blue: 'cloth_blue', green: 'cloth_green', indigo: 'cloth_indigo', maroon: 'cloth_maroon', hat: ['hide_brown', 'hide_black', 'cloth_indigo'] };
export const WALKERS = [
  // the Mongol man: the long belted robe, boots, a brimmed or fur-trimmed hat, braids
  { id: 'mongol', weight: 3.0, market: 1.6, el: { dress: 'robe', hat: 'brim', over: 'sash', arms: 'hang', hair: 'long', feet: 'shod', beard: false }, swing: 0.8,
    c1: [CL.blue, CL.brown, CL.ochre, CL.maroon, CL.green, CL.indigo], c2: [CL.red, CL.ochre, CL.white], c3: CL.hat, speed: [1.0, 1.35], stride: 1.35 },
  // the Mongol woman: the robe, the sash, the tall headdress (a cap stands in)
  { id: 'mwoman', weight: 1.6, market: 1.3, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', hair: 'bun', feet: 'shod' }, swing: 0.7,
    c1: [CL.red, CL.green, CL.blue, CL.ochre], c2: [CL.white, CL.ochre], c3: [CL.red], speed: [0.85, 1.15], stride: 1.15 },
  // the Saracen merchant in his turban
  { id: 'saracen', weight: 2.4, market: 2.2, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang', hair: 'short', feet: 'shod', beard: true }, swing: 0.7,
    c1: [CL.white, CL.green, CL.indigo, CL.ochre, CL.grey], c2: [CL.white, CL.red], c3: [CL.white], speed: [0.85, 1.15], stride: 1.2 },
  // the Chinese craftsman
  { id: 'cathay', weight: 1.8, market: 1.0, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', hair: 'bun', feet: 'shod' }, swing: 0.7,
    c1: [CL.indigo, CL.grey, CL.brown, CL.blue], c2: [CL.white], c3: [CL.black], speed: [0.9, 1.2], stride: 1.25 },
  // the carrier: a load on the head or the back (water, goods)
  { id: 'carrier', weight: 1.0, market: 1.2, el: { dress: 'robe', hat: 'cap', over: 'belt', carry: 'sack', arms: 'sack', hair: 'bun', feet: 'shod' }, swing: 0.5,
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.brown], c3: [CL.black], speed: [0.75, 1.0], stride: 1.1 },
  // the Buddhist monk in ochre and maroon
  { id: 'monk', weight: 0.7, market: 0.4, el: { dress: 'robe', hat: 'none', over: 'cloak', arms: 'hang', hair: 'shaven', feet: 'shod' }, swing: 0.5,
    c1: [CL.ochre, CL.maroon, CL.red], c2: [CL.ochre, CL.red], c3: [CL.black], speed: [0.75, 1.0], stride: 1.1 },
  // the envoy or friar: a grey habit, a rope belt, bare of hat, bearded
  { id: 'envoy', weight: 0.6, market: 0.9, el: { dress: 'robe', hat: 'none', over: 'belt', arms: 'hang', hair: 'short', feet: 'shod', beard: true }, swing: 0.6,
    c1: [CL.grey, CL.brown, CL.black, CL.indigo], c2: [CL.brown, CL.white], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', hair: 'bun', feet: 'shod' }, swing: 1.1,
    c1: [CL.red, CL.ochre, CL.green], c2: [CL.white], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72] },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`);
    addFigure(sb, v, figure, { ...k.el }, { far, cape: null });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
