// Muromachi Kyoto — the moving life (docs/settlements/muromachi-kyoto.md §7): townspeople in robes of hemp with the topknot or
// the hair worn long, women in layered robes, porters and pedlars with straw hats and carrying poles, samurai with the sword hung
// at the hip and the eboshi, monks with shaven heads in black robes and round hats. No boats. Data for the engine's movers.
import { RADIUS, streets, RYOAN, GINKAKU, SHRINE } from './layout.js';
import '../../styles/muromachi/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 4, rain: 0.6, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: 0,
};
/** The ways: every street (the busier the wider), the temples' paths and the shrine's approach. */
export function walkways() {
  const rects = streets().map((r) => {
    const w = Math.min(r[2] - r[0], r[3] - r[1]), near = (p) => r[2] > p[0] && r[0] < p[2] && r[3] > p[1] && r[1] < p[3];
    const sacred = near(RYOAN.rect) || near(GINKAKU.rect) || near(SHRINE.rect);
    return { r, weight: (w > 6 ? 1.3 : 0.8) * (sacred ? 1.2 : 1), market: sacred ? 0.3 : 1, kind: w > 6 ? 'street' : 'lane' };
  });
  return { rects, links: [], clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red' };
export const WALKERS = [
  { id: 'townsman', weight: 1.6, market: 1.6, el: { dress: 'robe', hair: 'topknot', hairMat: 'hair_dark', over: 'sash', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.brown, CL.grey, CL.indigo, CL.ochre, CL.green], c2: [CL.grey, CL.brown], c3: [CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'samurai', weight: 0.8, market: 0.6, el: { dress: 'robe', hair: 'topknot', hat: 'cap', hairMat: 'hair_dark', over: 'collar', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.black, CL.indigo, CL.maroon, CL.green], c2: [CL.grey, CL.black], c3: [CL.black], speed: [1.0, 1.25], stride: 1.5 },
  { id: 'woman', weight: 1.1, market: 1.3, el: { dress: 'robe', hair: 'long', hairMat: 'hair_dark', over: 'sash', arms: 'hang', feet: 'shod' }, wet: 'cape', swing: 0.6,
    c1: [CL.indigo, CL.maroon, CL.ochre, CL.green, CL.grey], c2: [CL.red, CL.ochre, CL.white], c3: [CL.black], speed: [0.9, 1.15], stride: 1.1, h: [0.9, 0.96] },
  { id: 'monk', weight: 0.8, market: 0.3, el: { dress: 'robe', hair: 'shaven', over: 'collar', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.black, CL.grey, CL.black], c2: [CL.grey, CL.brown], c3: [CL.black], speed: [0.9, 1.15], stride: 1.3 },
  { id: 'pedlar', weight: 0.9, market: 1.3, el: { dress: 'wrap', hair: 'topknot', hat: 'straw', carry: 'pole', arms: 'pole', feet: 'bare' }, wet: 'cape', swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.white, CL.indigo], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1, pole: true },
  { id: 'porter', weight: 0.7, market: 0.7, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', carry: 'sack', arms: 'sack', feet: 'bare' }, wet: 'cape',
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.indigo, CL.grey], c3: [CL.black], speed: [1.15, 1.4], stride: 1.4 },
  { id: 'child', weight: 0.35, market: 0.3, el: { dress: 'robe', hair: 'long', arms: 'hang' }, c1: [CL.ochre, CL.indigo, CL.red], c2: [CL.white], c3: [CL.black], speed: [1.2, 1.7], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
];
export const CREW = {};
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet) { el.over = 'cloak'; cape = 'thatch_palm'; if (!el.hat || el.hat === 'none' || el.hat === 'cap') { el.hat = 'straw'; el.hatMat = 'thatch'; } }
    addFigure(sb, v, figure, el, { far, cape });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
