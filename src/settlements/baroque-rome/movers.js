// Baroque Rome — the moving life of the piazza and the Borgo (docs/settlements/baroque-rome.md §5, "Romans"):
// Romans in the black of the seicento (the ferraiolo cloak, the broad hat), clergy (secular priests in the
// cassock, Capuchins in brown, monsignori in violet, a cardinal's red), pilgrims with staff and hat, women
// veiled, porters and water-carriers, boys. Data for the engine's movers (src/engine/movers.js). No boats:
// the Tiber is out at the edge.

import { walkRects, RADIUS } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 56, night: 5, rain: 0.6, reach: 160, spawnMin: 28, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -5,
};
export function walkways() { return { rects: walkRects(), links: [], clip: RADIUS - 14 }; }
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// Dress (dossier §5): gentlemen and officials in black with the cloak and the broad-brimmed hat; artisans in the
// short doublet, breeches and the soft cap; women in the dark gown with the shawl or a veil; the clergy in the
// cassock; pilgrims in the pelerine with a staff; porters with the pole.
const CL = { black: 'cloth_black', red: 'cloth_red', blue: 'cloth_blue', indigo: 'cloth_indigo', brown: 'cloth_brown', white: 'cloth_white', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'gentleman', weight: 1.1, market: 0.9, el: { dress: 'robe', hair: 'long', hat: 'brim', over: 'cloak', arms: 'hang' }, wet: 'cloak',
    c1: [CL.black, CL.black, CL.indigo, CL.brown], c2: [CL.black, CL.black, CL.grey], c3: [CL.black], speed: [1.0, 1.25], stride: 1.45 },
  { id: 'artisan', weight: 1.5, market: 1.5, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'apron', arms: 'hang' }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.ochre, CL.indigo, CL.green], c2: [CL.white, CL.brown, CL.grey, CL.black], c3: [CL.brown, CL.black], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'woman', weight: 1.2, market: 1.5, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'shawl', arms: 'hang' }, wet: 'cloak', swing: 0.7,
    c1: [CL.black, CL.maroon, CL.indigo, CL.brown, CL.green, CL.ochre], c2: [CL.white, CL.black, CL.red], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'priest', weight: 1.0, market: 0.6, el: { dress: 'robe', hair: 'short', hat: 'brim', over: 'sash', arms: 'hang' }, wet: 'cloak',
    c1: [CL.black, CL.black, CL.black, CL.black], c2: [CL.black, CL.red], c3: [CL.black], speed: [0.95, 1.2], stride: 1.5 },
  { id: 'capuchin', weight: 0.45, market: 0.4, el: { dress: 'robe', hair: 'shaven', hat: 'none', over: 'sash', arms: 'hang' }, wet: 'cloak',
    c1: [CL.brown, CL.brown], c2: [CL.white, CL.grey], c3: [CL.brown], speed: [0.95, 1.15], stride: 1.5 },
  { id: 'monsignore', weight: 0.25, market: 0.2, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'cape', arms: 'hang' }, wet: 'cloak',
    c1: ['#5a2d6e', CL.maroon, CL.black], c2: [CL.white, '#5a2d6e'], c3: [CL.red], speed: [0.9, 1.1], stride: 1.5 },
  { id: 'cardinal', weight: 0.08, market: 0.1, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'cape', arms: 'hang' }, wet: 'cloak',
    c1: [CL.red], c2: [CL.white], c3: [CL.red], speed: [0.85, 1.0], stride: 1.5 },
  { id: 'pilgrim', weight: 1.4, market: 0.7, el: { dress: 'robe', legs: 'hose', hair: 'short', hat: 'brim', over: 'cape', carry: 'staff', arms: 'staff' }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.black, CL.ochre], c2: [CL.brown, CL.brown, CL.grey], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'porter', weight: 0.7, market: 1.3, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', carry: 'pole', arms: 'pole' }, wet: 'cloak', swing: 0.75,
    c1: [CL.grey, CL.brown, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.brown, CL.grey], speed: [1.0, 1.25], stride: 1.1, pole: true },
  { id: 'waterseller', weight: 0.35, market: 1.2, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', carry: 'yoke' }, wet: 'cloak', swing: 0.7,
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.white], c3: [CL.brown], speed: [0.9, 1.1], stride: 1.15 },
  { id: 'basketwoman', weight: 0.6, market: 1.4, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'shawl', carry: 'basket' }, wet: 'cloak', swing: 0.5,
    c1: [CL.maroon, CL.green, CL.ochre, CL.indigo], c2: [CL.white, CL.black], c3: [CL.black], speed: [0.85, 1.05], stride: 1.2, h: [0.9, 0.97] },
  { id: 'guard', weight: 0.3, market: 0.2, el: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'cape', carry: 'staff', arms: 'staff' }, wet: 'cloak',
    c1: [CL.red, CL.red, CL.ochre], c2: [CL.ochre, CL.red], c3: [CL.red], speed: [0.9, 1.1], stride: 1.4 },
  { id: 'boy', weight: 0.5, market: 0.6, el: { dress: 'tunic', legs: 'hose', hair: 'short', arms: 'hang' },
    c1: [CL.ochre, CL.green, CL.red, CL.blue], c2: [CL.white, CL.red, CL.blue], c3: [CL.brown], speed: [1.2, 1.7], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet && k.wet === 'cloak') { el.over = 'cloak'; cape = 'cloth_brown'; }
    addFigure(sb, v, figure, el, { far, cape });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
