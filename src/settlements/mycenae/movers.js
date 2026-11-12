// Mycenae about 1250 BC (docs/settlements/mycenae.md §9): the people of the approach road, the gate, the stepped ramp, the Great Court and the lanes of the
// lower town: men in the kilt or the short tunic, long-haired, some bearded; women in the flounced skirt and bodice; bearers with jars and sacks;
// boys. Data for the engine's movers; the ways come from layout.js. No boats.

import { RADIUS, LANES, RAMP, PALACE, GCA, LION } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 42, night: 4, rain: 0.4, reach: 170, spawnMin: 22, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -9,
};

/** The ways: the road to the gate, through it and up the ramp to the palace, the court, the circle, the lanes of the lower town. */
export function walkways() {
  const rects = [], links = [], L = (a, b, w, weight, extra = {}) => links.push({ a, b, w, kind: 'street', weight, ...extra });
  for (const lane of LANES) for (let i = 0; i < lane.length - 1; i++) L(lane[i], lane[i + 1], 2.4, i === 0 && lane === LANES[0] ? 3 : 1.4);
  L([-107, 0], [LION.x - 3, 0], 3, 2.6); L([LION.x - 3, 0], RAMP[0], 2.6, 2.6);
  for (let i = 0; i < RAMP.length - 1; i++) L(RAMP[i], RAMP[i + 1], 3.6, 2.8);
  L(RAMP[3], [GCA.x + 8, GCA.z - 10], 2.4, 1.0);
  rects.push({ r: [PALACE.court[0] + 2, PALACE.court[1] + 3, PALACE.court[2] - 2, PALACE.court[3] - 3], weight: 1.4, market: 0.8, kind: 'street' });
  rects.push({ r: [GCA.x - 8, GCA.z - 8, GCA.x + 8, GCA.z + 8], weight: 0.6, market: 0.3, kind: 'street' });
  rects.push({ r: [-168, -6, -108, 6], weight: 2.0, market: 1.0, kind: 'street' });
  return { rects, links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', brown: 'cloth_brown', ochre: 'cloth_ochre', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', linen: 'linen' };
export const WALKERS = [
  // the man: the kilt, the belt pinching the waist, bare chest, long hair, often bearded
  { id: 'man', weight: 2.2, market: 1.6, el: { dress: 'shendyt', top: 'bare', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', beard: 1, feet: 'bare' }, c1: [CL.white, CL.red, CL.ochre, CL.indigo], c2: [CL.red, CL.indigo, CL.ochre], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.4 },
  // the herdsman and the porter: a short tunic or the loincloth, a sack on the shoulder
  { id: 'porter', weight: 1.6, market: 1.4, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'belt', arms: 'sack', carry: 'sack', hair: 'long', beard: 0, feet: 'bare' }, c1: [CL.brown, CL.white, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [0.8, 1.05], stride: 1.3 },
  { id: 'tunic', weight: 1.0, market: 1.0, el: { dress: 'tunic', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', beard: 1, feet: 'shod', legs: 'bare' }, c1: [CL.red, CL.ochre, CL.white], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.4 },
  // the woman: the flounced skirt and the fitted bodice, the hair bound or long
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'robe', hat: 'none', over: 'sash', arms: 'hang', hair: 'bun' }, swing: 0.7, c1: [CL.indigo, CL.red, CL.ochre, CL.blue], c2: [CL.white, CL.ochre], c3: [CL.white], speed: [0.8, 1.0], stride: 1.2, h: [0.9, 0.97] },
  // the bearer: a jar on the head
  { id: 'jar', weight: 1.5, market: 1.5, el: { dress: 'robe', hat: 'none', over: 'sash', carry: 'pot', arms: 'head', hair: 'bun' }, swing: 0.5, c1: [CL.indigo, CL.red, CL.ochre], c2: [CL.white], c3: [CL.white], speed: [0.75, 0.95], stride: 1.15, h: [0.9, 0.97] },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'loincloth', top: 'bare', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: 0, feet: 'bare' }, c1: [CL.white, CL.ochre], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
