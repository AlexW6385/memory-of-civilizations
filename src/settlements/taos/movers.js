// Taos Pueblo c. 1500 — the moving life (docs/settlements/taos.md §4.4): people of the pueblo on the plaza, in the alleys
// between the house blocks, along the creek and over its log bridges and fords: women in the manta of cotton or deerskin
// tied over one shoulder, men in deerskin shirt and leggings with a blanket of rabbit fur, all in moccasins with the hair long;
// water-bearers with a jar on the head, wood-carriers with a bundle on the back, boys. No boats. Data for the engine's movers
// (src/engine/movers.js, read in its worker); the ways come from layout.js.

import { RADIUS, WALL, NORTH, SOUTH, CELL, CREEK, creekZ } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 48, night: 3, rain: 0.5, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: CREEK.water,
};

/** Alleys: the house blocks' empty columns (heights all zero down a column). */
function alleys(B) {
  const H = B.heights, out = [];
  for (let j = 0; j < H[0].length; j++) if (H.every((row) => row[j] === 0)) out.push([B.x0 + j * CELL + 0.6, B.z0, B.x0 + (j + 1) * CELL - 0.6, B.z0 + H.length * CELL]);
  return out;
}

/**
 * The ways: the plaza's two banks in 10 m lengths following the creek, the log bridges at x −35 and 30 and the fords at
 * x −12 and 14 as links, the alleys between the houses, the road out through the gap in the south wall.
 */
export function walkways() {
  const rects = [], links = [];
  for (let x = -65; x <= 65; x += 10) {
    const cz = creekZ(x), e = CREEK.w / 2 + 0.7;
    rects.push({ r: [x - 5.5, -41, x + 5.5, cz - e], weight: 1.4, market: 1.2, kind: 'street' });
    rects.push({ r: [x - 5.5, cz + e, x + 5.5, 41], weight: 1.2, market: 1.0, kind: 'street' });
  }
  for (const x of [-35, 30]) { const z = creekZ(x); links.push({ a: [x, z - 4.5], b: [x, z + 4.5], w: 0.5, kind: 'bridge', weight: 1.3 }); }
  for (const x of [-12, 14]) { const z = creekZ(x); links.push({ a: [x, z - 3.6], b: [x, z + 3.6], w: 0.4, kind: 'bridge', weight: 0.6 }); }
  // the alleys of the North House run down to the plaza; those of the South House up to it
  for (const r of alleys(NORTH)) rects.push({ r: [r[0], r[1] + 2, r[2], 41], weight: 0.5, market: 0.2, kind: 'lane' });
  for (const r of alleys(SOUTH)) rects.push({ r: [r[0], 41, r[2], r[3] + 4], weight: 0.5, market: 0.2, kind: 'lane' });
  // round the South House's east end and out by the gap in the wall (x −6…6) to the fields
  const sx1 = SOUTH.x0 + SOUTH.heights[0].length * CELL, sz1 = SOUTH.z0 + SOUTH.heights.length * CELL;
  rects.push({ r: [sx1 + 1, 41, sx1 + 6, sz1 + 4], weight: 0.4, market: 0.1, kind: 'lane' });
  rects.push({ r: [-5, sz1 + 1, sx1 + 6, sz1 + 5], weight: 0.4, market: 0.1, kind: 'lane' });
  rects.push({ r: [-5, sz1 + 1, 5, WALL[3] + 40], weight: 0.6, market: 0.1, kind: 'lane' });
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { white: 'cloth_white', red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', grey: 'cloth_grey', tan: '#a8845a', hide: '#8a6a48', fur: '#d8cdb8' };
export const WALKERS = [
  // the woman: the manta tied over one shoulder, a belt, moccasins, the hair long
  { id: 'woman', weight: 2.0, market: 1.6, el: { dress: 'wrap', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', feet: 'shod' }, swing: 0.7,
    c1: [CL.white, CL.tan, CL.brown, CL.black, CL.ochre], c2: [CL.red, CL.ochre, CL.white], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  // the water-bearer: a jar on the head
  { id: 'jar', weight: 1.6, market: 1.2, el: { dress: 'wrap', hat: 'none', over: 'belt', carry: 'pot', arms: 'head', hair: 'long', feet: 'shod' }, swing: 0.5,
    c1: [CL.white, CL.tan, CL.brown], c2: [CL.red, CL.ochre], c3: [CL.black], speed: [0.75, 1.0], stride: 1.15, h: [0.9, 0.97] },
  // the man: deerskin shirt and leggings
  { id: 'man', weight: 1.8, market: 1.4, el: { dress: 'tunic', legs: 'hose', hat: 'none', over: 'belt', arms: 'hang', hair: 'long', beard: false, feet: 'shod' },
    c1: [CL.hide, CL.tan, CL.hide, CL.brown], c2: [CL.tan, CL.hide], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  // the elder with a blanket of rabbit fur over the shoulders
  { id: 'elder', weight: 0.9, market: 0.8, el: { dress: 'tunic', legs: 'hose', hat: 'none', over: 'cloak', arms: 'hang', hair: 'long', beard: false, feet: 'shod' },
    c1: [CL.hide, CL.tan], c2: [CL.fur, CL.fur, CL.white], c3: [CL.black], speed: [0.7, 0.9], stride: 1.1 },
  // the wood-carrier: a bundle on the back
  { id: 'wood', weight: 0.9, market: 0.5, el: { dress: 'tunic', legs: 'hose', hat: 'none', over: 'belt', arms: 'sack', carry: 'sack', hair: 'long', beard: false, feet: 'shod' },
    c1: [CL.hide, CL.tan, CL.brown], c2: [CL.tan], c3: [CL.black], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'boy', weight: 0.7, market: 0.8, el: { dress: 'tunic', legs: 'hose', hat: 'none', over: 'none', arms: 'hang', hair: 'long', beard: false, feet: 'shod' },
    c1: [CL.tan, CL.hide], c2: [CL.tan], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
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
