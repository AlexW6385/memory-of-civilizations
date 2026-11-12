// Dunhuang c. 850 — the moving life (docs/settlements/dunhuang.md §7): people of the oasis town in the dress of the
// Guiyi period and the Silk Road: Chinese townsfolk in belted robes, Sogdian merchants in caps and boots, monks in
// grey and ochre with shaven heads, camel-drivers, women with water jars, pilgrims on the cliff-foot apron and in
// the caves' porches; along the main street and its lanes, over the bridge, round the caravanserai's gate. No boats
// (the Daquan is a stream). Data for src/engine/movers.js; the ways come from layout.js.
import { RADIUS, XF, STREET, CROSS, LANE_W, GATE, SERAI, RIVER, riverX, TOWN } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 38, night: 3, rain: 0.4, reach: 150, spawnMin: 34, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: RIVER.water,
};

/** The ways: the main street (cut at the bridge), the cross lanes, the back lanes, the apron at the cliff foot, the serai's yard, the ways to the spring. */
export function walkways() {
  const rects = [], links = [];
  const bx = riverX(0), b0 = bx - 6.5, b1 = bx + 6.5, h = 4.6;
  rects.push({ r: [XF + 8, -h, b0 + 0.2, h], weight: 1.2, market: 0.8, kind: 'street' });
  rects.push({ r: [b1 - 0.2, -h, GATE.x + 12, h], weight: 1.8, market: 1.6, kind: 'street' });
  links.push({ a: [b0 + 0.2, 0], b: [b1 - 0.2, 0], w: 1.4, kind: 'bridge', weight: 1.2 });
  for (const c of CROSS) rects.push({ r: [c - LANE_W / 2 + 0.4, -TOWN[3] + 3, c + LANE_W / 2 - 0.4, TOWN[3] - 3], weight: 0.7, market: 0.3, kind: 'lane' });
  for (const z of [-22, 22]) rects.push({ r: [TOWN[0] + 2, z - 1.7, TOWN[2] - 2, z + 1.7], weight: 0.6, market: 0.2, kind: 'lane' });
  // the apron along the cliff foot and the way down from it to the street
  rects.push({ r: [XF + 1.2, -125, XF + 6.5, 125], weight: 1.0, market: 0.4, kind: 'street' });
  // the caravanserai: the open ground before its gate and the yard inside
  rects.push({ r: [SERAI.x0 + 2, 6.5, SERAI.x1 - 2, SERAI.z0 - 0.4], weight: 1.0, market: 1.0, kind: 'street' });
  rects.push({ r: [(SERAI.x0 + SERAI.x1) / 2 - 1.8, SERAI.z0 - 0.2, (SERAI.x0 + SERAI.x1) / 2 + 1.8, SERAI.z0 + 3.2], weight: 0.9, market: 0.8, kind: 'lane' });
  rects.push({ r: [SERAI.x0 + 6.5, SERAI.z0 + 3.4, SERAI.x1 - 6, SERAI.z1 - 7], weight: 0.9, market: 0.9, kind: 'street' });
  // the stair to the second tier's gallery is left to the visitor
  void STREET;
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', grey: 'cloth_grey', blue: 'cloth_blue', green: 'cloth_green', indigo: 'cloth_indigo' };
export const WALKERS = [
  // the townsman: a belted round-collared robe of grey, brown or blue, a soft cap
  { id: 'han', weight: 1.8, market: 1.4, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', hair: 'short', feet: 'shod' },
    c1: [CL.brown, CL.grey, CL.blue, CL.ochre], c2: [CL.brown, CL.white], c3: [CL.black], speed: [0.9, 1.25], stride: 1.3 },
  // the Sogdian merchant: a belted coat of red, green or blue over white trousers and boots, a pointed cap, a beard
  { id: 'sogdian', weight: 1.4, market: 1.8, el: { dress: 'tunic', legs: 'hose', hat: 'cap', over: 'belt', arms: 'hang', hair: 'short', beard: true, feet: 'shod' },
    c1: [CL.green, CL.red, CL.blue, CL.indigo], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.9, 1.2], stride: 1.3 },
  // the monk: an ochre or grey robe with a shawl over one shoulder, the head shaven
  { id: 'monk', weight: 1.5, market: 0.5, el: { dress: 'robe', hat: 'none', over: 'shawl', arms: 'hang', hair: 'shaven', feet: 'shod' },
    c1: [CL.ochre, CL.grey, CL.brown], c2: [CL.brown, CL.red], c3: [CL.black], speed: [0.7, 1.0], stride: 1.1 },
  // the woman with a jar on the head, the hair in a high bun, a long skirt and a short jacket
  { id: 'jar', weight: 1.2, market: 1.0, el: { dress: 'robe', hat: 'none', over: 'none', carry: 'pot', arms: 'head', hair: 'bun', feet: 'shod' },
    c1: [CL.red, CL.green, CL.ochre, CL.blue], c2: [CL.white], c3: [CL.black], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  // the camel-driver with a staff, a felt hat, a heavy robe
  { id: 'driver', weight: 1.0, market: 0.9, el: { dress: 'tunic', legs: 'hose', hat: 'brim', over: 'belt', carry: 'staff', arms: 'staff', hair: 'short', beard: true, feet: 'shod' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [0.9, 1.2], stride: 1.35 },
  // the farmer with a bundle of fodder or a hoe, in undyed hemp
  { id: 'farmer', weight: 1.0, market: 0.3, el: { dress: 'tunic', legs: 'hose', hat: 'straw', over: 'belt', carry: 'hoe', arms: 'hoe', hair: 'short', feet: 'bare' },
    c1: [CL.white, CL.grey, CL.brown], c2: [CL.brown], c3: [CL.black], speed: [0.8, 1.1], stride: 1.3 },
  // the porter: a pole across the shoulders with a load at each end (water jars, fodder, goods for the market)
  { id: 'porter', weight: 0.9, market: 1.2, el: { dress: 'tunic', legs: 'hose', hat: 'straw', over: 'belt', carry: 'pole', arms: 'pole', hair: 'short', feet: 'bare' },
    c1: [CL.white, CL.grey, CL.brown], c2: [CL.brown], c3: [CL.black], speed: [0.8, 1.05], stride: 1.2 },
  // the woman with a basket on her head (bread, fruit, washing)
  { id: 'basket', weight: 0.9, market: 1.1, el: { dress: 'robe', hat: 'none', over: 'none', carry: 'basket', arms: 'head', hair: 'bun', feet: 'shod' },
    c1: [CL.green, CL.ochre, CL.red, CL.indigo], c2: [CL.white], c3: [CL.black], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  // the pilgrim: a long robe, a shawl, a staff, a bundle (come to the caves from the oases along the road)
  { id: 'pilgrim', weight: 0.7, market: 0.3, el: { dress: 'robe', hat: 'none', over: 'shawl', carry: 'staff', arms: 'staff', hair: 'short', feet: 'shod' },
    c1: [CL.white, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [0.7, 0.95], stride: 1.1 },
  { id: 'boy', weight: 0.5, market: 0.8, el: { dress: 'tunic', legs: 'hose', hat: 'none', over: 'none', arms: 'hang', hair: 'short', feet: 'bare' },
    c1: [CL.white, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
