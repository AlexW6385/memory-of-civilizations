// Shaolin — the moving life (docs/settlements/shaolin.md §7): monks in grey robes with the shaven head walking the courts, some with a
// staff or carrying water, pilgrims and villagers in Ming dress (men in long gown and square cap or topknot, women in long robes),
// porters with shoulder poles on the approach road. No boats. Data for the engine's movers (src/engine/movers.js, read in its worker);
// the ways come from layout.js.
import { RADIUS, WALL, CROSS, AXIS, HOUSES, gateX, hw } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 4, rain: 0.5, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -50,
};

/** The ways: the courts' processional way and flanks, the side gates (through the cross walls), the forecourt and the approach road. */
export function walkways() {
  const rects = [], links = [];
  const zs = CROSS.map((c) => c[1]).sort((a, b) => b - a);
  // the courts between the cross walls: the axis way (wide), the gates' lines to the flanks
  for (let i = 0; i + 1 < zs.length; i++) {
    const za = zs[i + 1] + 3, zb = zs[i] - 3;
    rects.push({ r: [-4, za, 4, zb], weight: 1.5, market: 1.0, kind: 'street' });
    rects.push({ r: [-WALL[2] + 14, za, WALL[2] - 14, za + 4], weight: 0.4, market: 0.2, kind: 'lane' });
    rects.push({ r: [-WALL[2] + 14, zb - 4, WALL[2] - 14, zb], weight: 0.4, market: 0.2, kind: 'lane' });
  }
  // the gates through each cross wall (and the halls' own passage at the gate hall and the Heavenly Kings)
  CROSS.forEach(([name, z], i) => { if (!i) return; const g = gateX(name); for (const s of [-1, 1]) rects.push({ r: [s * g - 1.0, z - 3.5, s * g + 1.0, z + 3.5], weight: 0.9, market: 0.5, kind: 'lane' }); });
  rects.push({ r: [-2.5, AXIS.shanmen[1] - 4, 2.5, AXIS.shanmen[3] + 4], weight: 1.5, market: 1.0, kind: 'street' });
  rects.push({ r: [-2.5, AXIS.tianwang[1] - 1, 2.5, AXIS.tianwang[3] + 1], weight: 1.0, market: 0.6, kind: 'street' });
  // the forecourt, the approach road and the village street
  rects.push({ r: [-14, 130, 14, 152], weight: 1.4, market: 1.4, kind: 'street' });
  rects.push({ r: [-4, 152, 4, RADIUS - 24], weight: 1.4, market: 1.2, kind: 'street' });
  rects.push({ r: [-90, 152, 90, 158], weight: 1.2, market: 1.2, kind: 'street' });
  // the path west to the Pagoda Forest
  rects.push({ r: [-106, 68, -62, 72], weight: 0.5, market: 0.1, kind: 'lane' });
  rects.push({ r: [-165, 64, -106, 72], weight: 0.5, market: 0.1, kind: 'lane' });
  void hw; void HOUSES;
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { grey: 'cloth_grey', ochre: 'cloth_ochre', indigo: 'cloth_indigo', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', maroon: 'cloth_maroon', green: 'cloth_green' };
export const WALKERS = [
  // the monk: grey robe, the ochre kasaya over it, the head shaven
  { id: 'monk', weight: 2.0, market: 0.8, el: { dress: 'robe', hair: 'shaven', hat: 'none', over: 'sash', arms: 'hang', feet: 'shod' },
    c1: [CL.grey, CL.grey, CL.ochre], c2: [CL.ochre, CL.brown], c3: [CL.black], speed: [0.95, 1.2], stride: 1.35 },
  // the monk with his staff (the Shaolin staff)
  { id: 'staff', weight: 0.9, market: 0.4, el: { dress: 'trousers', hair: 'shaven', hat: 'none', over: 'sash', carry: 'staff', arms: 'staff', feet: 'shod' },
    c1: [CL.grey, CL.grey, CL.brown], c2: [CL.ochre, CL.grey], c3: [CL.black], speed: [1.0, 1.3], stride: 1.45 },
  { id: 'scholar', weight: 0.8, market: 1.2, el: { dress: 'robe', hair: 'netknot', hat: 'cap', cap: 'ming', over: 'collar', arms: 'hang' },
    c1: [CL.indigo, CL.grey, CL.brown, '#4a5a6e'], c2: [CL.white, CL.grey], c3: [CL.black], speed: [1.05, 1.3], stride: 1.45 },
  { id: 'townsman', weight: 1.4, market: 1.4, el: { dress: 'robe', hair: 'netknot', over: 'sash', arms: 'hang' },
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.black, CL.indigo, CL.white], c3: [CL.black], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'woman', weight: 1.1, market: 1.3, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'hang' }, swing: 0.7,
    c1: [CL.indigo, CL.white, CL.maroon, CL.ochre, CL.green], c2: [CL.white, CL.indigo, CL.black], c3: [CL.black], speed: [0.95, 1.2], stride: 1.25, h: [0.9, 0.97] },
  { id: 'farmer', weight: 0.9, market: 0.8, el: { dress: 'trousers', hair: 'netknot', hat: 'straw', arms: 'hang' },
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.grey, CL.brown], c3: [CL.black], speed: [1.15, 1.45], stride: 1.4 },
  { id: 'porter', weight: 0.8, market: 1.0, el: { dress: 'trousers', hair: 'netknot', hat: 'straw', carry: 'pole', arms: 'pole' }, swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1, pole: true },
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
