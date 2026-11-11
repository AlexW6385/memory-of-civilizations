// Han Chang'an about 100 BC — the moving life (docs/settlements/han-changan.md §7): officials in the black cap and the long robe crossed right over left,
// clerks and scholars, merchants, women in the curved-hem robe with the hair in a bun, porters with the carrying pole and sacks, soldiers with the halberd,
// Hu merchants of the Western Regions in pointed hats and long coats, camel-drivers, boys; on the avenue, the ward lanes, the market streets and
// the palace's forecourt, the road to the west gate. Data for the engine's movers (src/engine/movers.js, read in its worker); the ways come from layout.js.
import { RADIUS, AX, PALACE, AVENUE, WEST_MARKET, EAST_MARKET, GATE_W, WALL_W, streets, QUARTER_LANES } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 56, night: 5, rain: 0.35, reach: 160, spawnMin: 26, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -1.6,
};

export function walkways() {
  const rects = [], r = (a, weight, market, kind = 'street') => rects.push({ r: a, weight, market, kind });
  for (const s of streets()) { const w = Math.min(s[2] - s[0], s[3] - s[1]); r([s[0] + 0.4, s[1] + 0.4, s[2] - 0.4, s[3] - 0.4], w > 8 ? 1.8 : 1.0, 0.4, w < 6 ? 'lane' : 'street'); }
  // the great avenue and the road to the west gate carry the most
  r([AVENUE[0] + 3, AVENUE[1] + 30, AVENUE[2] - 3, AVENUE[3] - 20], 2.6, 0.8);
  r([WALL_W - 60, GATE_W.z - 4, -252, GATE_W.z + 4], 2.2, 1.2);
  // the palace's forecourt and the way up the ramp to the crown
  r([AX - 76, -100, AX + 76, 100], 1.3, 0.3);
  r([AX - 4, -127, AX + 4, -91], 1.0, 0.2);
  // inside the markets: the cross lanes
  for (const [x0, z0, x1, z1] of [WEST_MARKET, EAST_MARKET]) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    r([x0 + 4, cz - 7, x1 - 4, cz + 7], 3, 3); r([cx - 7, z0 + 4, cx + 7, z1 - 4], 3, 3);
  }
  void PALACE; void QUARTER_LANES;
  return { rects, links: [], clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', grey: 'cloth_grey', blue: 'cloth_blue', green: 'cloth_green', indigo: 'cloth_indigo' };
export const WALKERS = [
  // the official: a robe of black, red or blue, the sash, the cap (guan)
  { id: 'official', weight: 1.0, market: 0.8, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', hair: 'topknot', feet: 'shod', beard: true },
    c1: [CL.black, CL.red, CL.blue, CL.green], c2: [CL.white, CL.red], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'scholar', weight: 0.9, market: 0.8, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'staff', carry: 'staff', hair: 'topknot', feet: 'shod' },
    c1: [CL.white, CL.grey, CL.blue, CL.brown], c2: [CL.white], c3: [CL.black], speed: [0.9, 1.15], stride: 1.3 },
  { id: 'commoner', weight: 2.0, market: 1.4, el: { dress: 'tunic', legs: 'hose', hat: 'cap', over: 'belt', arms: 'hang', hair: 'topknot', feet: 'shod' },
    c1: [CL.brown, CL.grey, CL.white, CL.ochre, CL.indigo], c2: [CL.brown, CL.white], c3: [CL.black], speed: [0.95, 1.3], stride: 1.35 },
  { id: 'merchant', weight: 1.4, market: 2.0, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', hair: 'topknot', feet: 'shod' },
    c1: [CL.green, CL.ochre, CL.red, CL.indigo], c2: [CL.white, CL.brown], c3: [CL.black], speed: [0.9, 1.2], stride: 1.3 },
  { id: 'woman', weight: 1.3, market: 1.4, el: { dress: 'robe', hat: 'none', over: 'none', arms: 'hang', hair: 'bun', feet: 'shod' }, swing: 0.7,
    c1: [CL.red, CL.ochre, CL.green, CL.blue, CL.white], c2: [CL.white, CL.black], c3: [CL.black], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'bearer', weight: 0.9, market: 1.0, el: { dress: 'robe', hat: 'none', over: 'none', carry: 'pot', arms: 'head', hair: 'bun', feet: 'shod' }, swing: 0.6,
    c1: [CL.green, CL.brown, CL.indigo], c2: [CL.white], c3: [CL.black], speed: [0.75, 1.0], stride: 1.1, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.1, market: 1.6, el: { dress: 'trousers', top: 'bare', hat: 'none', carry: 'sack', arms: 'sack', hair: 'topknot', feet: 'bare' },
    c1: [CL.white, CL.grey, CL.brown], c2: [CL.white, CL.grey], c3: [CL.black], speed: [0.9, 1.2], stride: 1.15 },
  { id: 'carrier', weight: 0.8, market: 1.2, el: { dress: 'trousers', hat: 'straw', carry: 'pole', arms: 'pole', hair: 'topknot', feet: 'bare' }, swing: 0.75,
    c1: [CL.brown, CL.indigo, CL.white], c2: [CL.indigo, CL.brown], c3: [CL.black], speed: [0.95, 1.2], stride: 1.1 },
  { id: 'soldier', weight: 0.8, market: 0.3, el: { dress: 'robe', hat: 'cap', over: 'belt', arms: 'staff', carry: 'staff', hair: 'topknot', feet: 'shod' },
    c1: [CL.grey, CL.brown, CL.black], c2: [CL.brown, CL.black], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  // the Hu merchant of the Western Regions: a long belted coat of red, green or blue over trousers and boots, a pointed cap, a beard
  { id: 'hu', weight: 1.1, market: 1.8, el: { dress: 'tunic', legs: 'hose', hat: 'brim', over: 'belt', arms: 'hang', hair: 'short', beard: true, feet: 'shod' },
    c1: [CL.green, CL.red, CL.blue, CL.indigo], c2: [CL.white, CL.ochre], c3: [CL.black], speed: [0.9, 1.2], stride: 1.3 },
  { id: 'driver', weight: 0.7, market: 0.8, el: { dress: 'tunic', legs: 'hose', hat: 'brim', over: 'belt', carry: 'staff', arms: 'staff', hair: 'short', beard: true, feet: 'shod' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.black], speed: [0.9, 1.2], stride: 1.35 },
  { id: 'boy', weight: 0.6, market: 0.8, el: { dress: 'tunic', legs: 'hose', hat: 'none', over: 'none', arms: 'hang', hair: 'topknot', feet: 'bare' },
    c1: [CL.white, CL.ochre, CL.green], c2: [CL.brown], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`);
    addFigure(sb, v, figure, { ...k.el }, { far, cape: null });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none: the tower-ship rides at anchor (town.js) */ }
