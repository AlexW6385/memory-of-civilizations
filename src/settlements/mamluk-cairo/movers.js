// Mamluk Cairo about 1363–1400 — the moving life (docs/settlements/mamluk-cairo.md §12): people walking the Qasaba, the
// Bayn al-Qasrayn, the khan's covered lanes, the Rumayla square and the lanes, in the dress of the place: men in the long
// robe (jubba) with the wound turban, the sash at the waist; soldiers of the sultan's mamluks in the short-sleeved coat
// with the tall coloured cap under a turban; scholars in the wide sleeves and large white turban; women wrapped in the
// black or white izar and veiled; porters with baskets, water carriers with the earthen pot on the head, boys in the shirt.
// Data for the engine's movers (src/engine/movers.js), read in its worker; the ways come from layout.js. No boats.

import { RADIUS, STREETS, SUQ, SUQ2, SUQ3, BAYN, SQUARE } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 46, night: 4, rain: 1, reach: 170, spawnMin: 26, far: 48 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the Qasaba and the lanes, the Bayn, the khan's market streets (the crowd), the square. */
export function walkways() {
  const covered = [SUQ, SUQ2, SUQ3];
  const rects = STREETS.map((r) => {
    const suq = covered.includes(r), big = r === BAYN || r === SQUARE;
    const w = Math.min(r[2] - r[0], r[3] - r[1]);
    // the covered streets keep to their open middle (the shops' benches stand at the sides)
    const rr = suq ? [r[0] + 6.2, r[1] + 1, r[2] - 6.2, r[3] - 1] : r;
    return { r: rr, weight: suq ? 4 : big ? 3 : w > 8 ? 1.6 : 0.8, market: suq ? 3 : big ? 1 : 0.3, kind: suq || w > 8 ? 'street' : 'lane' };
  });
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', black: 'cloth_black', brown: 'cloth_brown', grey: 'cloth_grey', green: 'cloth_green', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', maroon: 'cloth_maroon', blue: 'cloth_blue' };
export const WALKERS = [
  { id: 'townsman', weight: 2.2, market: 1.6, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang' },
    c1: [CL.white, CL.indigo, CL.ochre, CL.green, CL.brown, CL.white], c2: [CL.white, CL.ochre, CL.red], c3: [CL.white, CL.white, CL.indigo], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'merchant', weight: 1.1, market: 2.0, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang' },
    c1: [CL.green, CL.maroon, CL.indigo, CL.ochre], c2: [CL.white, CL.red], c3: [CL.white], speed: [0.8, 1.0], stride: 1.3 },
  { id: 'mamluk', weight: 0.8, market: 0.5, el: { dress: 'robe', hat: 'turban', over: 'sash', arms: 'hang', carry: 'staff' },
    c1: [CL.red, CL.indigo, CL.green, CL.maroon], c2: [CL.ochre, CL.white], c3: [CL.red, CL.green, CL.white], speed: [1.0, 1.3], stride: 1.5 },
  { id: 'scholar', weight: 0.6, market: 0.4, el: { dress: 'robe', hat: 'turban', over: 'none', arms: 'hang' },
    c1: [CL.white, CL.grey, CL.green], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.2 },
  { id: 'woman', weight: 1.5, market: 1.6, el: { dress: 'robe', hat: 'veil', over: 'none', arms: 'hang' }, swing: 0.7,
    c1: [CL.black, CL.black, CL.white, CL.indigo, CL.maroon], c2: [CL.white, CL.black], c3: [CL.black, CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'porter', weight: 1.0, market: 1.8, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', carry: 'basket' },
    c1: [CL.brown, CL.grey, CL.ochre, CL.indigo], c2: [CL.brown, CL.white], c3: [CL.white, CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'saqqa', weight: 0.6, market: 1.2, el: { dress: 'robe', hat: 'cap', over: 'sash', arms: 'hang', carry: 'pot' },
    c1: [CL.brown, CL.ochre, CL.indigo], c2: [CL.white], c3: [CL.white, CL.red], speed: [0.85, 1.05], stride: 1.3 },
  { id: 'fellah', weight: 0.7, market: 0.8, el: { dress: 'robe', hat: 'cap', over: 'none', arms: 'hang' },
    c1: [CL.blue, CL.indigo, CL.grey], c2: [CL.white], c3: [CL.white, CL.brown], speed: [0.9, 1.15], stride: 1.35 },
  { id: 'boy', weight: 0.5, market: 0.8, el: { dress: 'robe', legs: 'bare', hat: 'cap', arms: 'hang' },
    c1: [CL.white, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.white], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
