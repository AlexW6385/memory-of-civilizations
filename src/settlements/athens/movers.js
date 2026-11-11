// Classical Athens about 410 BC — the moving life (docs/settlements/athens.md §12): citizens in chiton and himation on the
// Panathenaic Way and across the Agora, philosophers in the himation alone, young men in the short chiton, the chlamys and
// the broad petasos, women in the peplos with the veil, women with water jars to the fountains, slaves and workmen in the short
// tunic with the felt cap, carrying sacks and baskets, boys. Data for the engine's movers (src/engine/movers.js, read in its
// worker); the ways come from layout.js and quarters.js. No boats (no water is shown).

import { RADIUS, WAY, RAMP, AGORA } from './layout.js';
import { KERAMEIKOS, PALAESTRA, PARADROMIS, GATE } from './quarters.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 60, night: 5, rain: 0.6, reach: 170, spawnMin: 24, far: 46 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the Panathenaic Way and the ramp as links, the Agora's aisles and open middle, the Kerameikos lane, the Academy's paths and track. */
export function walkways() {
  const rects = [], links = [];
  for (let i = 0; i < WAY.length - 1; i++) links.push({ a: WAY[i], b: WAY[i + 1], w: 3.0, kind: 'street', weight: 3.2 });
  for (let i = 0; i < RAMP.length - 1; i++) links.push({ a: RAMP[i], b: RAMP[i + 1], w: 3.4, kind: 'street', weight: 2 });
  // the market's aisles between the rows of booths (rows from z −197 every 13 m), the open middle before the Stoa of Zeus
  for (let k = 0; k < 5; k++) { const z = -197 + k * 13 + 4.3; rects.push({ r: [-238, z - 1.0, -180, z + 1.0], weight: 1.4, market: 3, kind: 'lane' }); }
  rects.push({ r: [-262, -205, -246, -146], weight: 1.6, market: 1.5, kind: 'street' });
  rects.push({ r: [-250, -222, -208, -217], weight: 1.2, market: 1.5, kind: 'street' });
  rects.push({ r: [AGORA[0] + 30, -128, AGORA[2] - 20, -126], weight: 0.8, market: 1.5, kind: 'lane' });
  // the Kerameikos: the lane between the two rows of workshops
  rects.push({ r: [KERAMEIKOS[0], KERAMEIKOS[1] + 22, KERAMEIKOS[2], KERAMEIKOS[1] + 28], weight: 1.8, market: 1, kind: 'street' });
  // the Academy: the way in from the gate, the court of the palaestra, the running track
  rects.push({ r: [PALAESTRA[0] + 17 - 1.4, GATE[1] - 1.4, GATE[0] - 2, GATE[1] + 1.4], weight: 1.2, market: 0.3, kind: 'street' });
  rects.push({ r: [PALAESTRA[0] + 3.5, PALAESTRA[1] + 4, PALAESTRA[2] - 3.5, PALAESTRA[1] + 20], weight: 1.4, market: 0.2, kind: 'street' });
  rects.push({ r: [PARADROMIS[0] + 2, PARADROMIS[1] + 1, PARADROMIS[2] - 2, PARADROMIS[3] - 1], weight: 1.0, market: 0.2, kind: 'lane' });
  // the summit, between the Propylaia and the Promachos
  rects.push({ r: [-116, -3, -90, 3], weight: 1.2, market: 0.3, kind: 'street' });
  return { rects, links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', black: 'cloth_black', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon', linen: 'linen' };
export const WALKERS = [
  // the citizen: the chiton under the himation thrown over the left shoulder, a beard, bare-headed
  { id: 'citizen', weight: 2.4, market: 1.8, el: { dress: 'robe', hat: 'none', over: 'cloak', arms: 'hang', hair: 'short', beard: 1 },
    c1: [CL.white, CL.linen, CL.ochre, CL.white], c2: [CL.white, CL.brown, CL.indigo, CL.red, CL.grey], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.4 },
  // the philosopher or the poor old citizen: the himation alone over the bare chest, barefoot
  { id: 'philosopher', weight: 0.8, market: 0.8, el: { dress: 'wrap', top: 'bare', hat: 'none', arms: 'hang', hair: 'short', beard: 1, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.white, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.65, 0.85], stride: 1.3 },
  // the ephebe or young horseman: the short chiton, the chlamys at the shoulder, the broad petasos
  { id: 'young', weight: 1.0, market: 0.8, el: { dress: 'tunic', legs: 'bare', hat: 'brim', over: 'cloak', arms: 'hang', hair: 'short', beard: 0 },
    c1: [CL.white, CL.ochre, CL.linen], c2: [CL.red, CL.indigo, CL.green, CL.brown], c3: [CL.brown, CL.ochre], speed: [1.1, 1.45], stride: 1.5 },
  // the woman: the peplos pinned at the shoulders, a shawl, the hair bound, often veiled
  { id: 'woman', weight: 1.3, market: 1.6, el: { dress: 'robe', hat: 'veil', over: 'shawl', arms: 'hang', hair: 'bun' }, swing: 0.7,
    c1: [CL.white, CL.red, CL.ochre, CL.indigo, CL.linen], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.9, 0.97] },
  // the woman with the hydria on her head, going to or from the fountain
  { id: 'hydria', weight: 1.1, market: 1.3, el: { dress: 'robe', hat: 'none', over: 'shawl', hair: 'bun', carry: 'pot', arms: 'head' }, swing: 0.5,
    c1: [CL.white, CL.red, CL.ochre, CL.linen], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  // the slave or workman: the short tunic belted, the felt cap, bare legs, a sack or a basket
  { id: 'slave', weight: 1.6, market: 1.5, el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', arms: 'hang', hair: 'short', beard: 0.4, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown, CL.grey], speed: [0.9, 1.2], stride: 1.3 },
  { id: 'porter', weight: 1.0, market: 1.6, el: { dress: 'tunic', legs: 'bare', hat: 'cap', over: 'belt', arms: 'hang', carry: 'basket', hair: 'short', beard: 0.3, feet: 'bare' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'sacker', weight: 0.8, market: 1.3, el: { dress: 'tunic', legs: 'bare', hat: 'none', over: 'belt', arms: 'sack', carry: 'sack', hair: 'short', beard: 0.5, feet: 'bare' },
    c1: [CL.brown, CL.linen, CL.grey], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'tunic', legs: 'bare', hat: 'none', arms: 'hang', hair: 'short', beard: 0, feet: 'bare' },
    c1: [CL.white, CL.linen, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
