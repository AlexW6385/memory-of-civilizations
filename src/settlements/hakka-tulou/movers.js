// The Hakka tulou — the moving life (docs/settlements/hakka-tulou.md §5): clan members walking between the tulou,
// the drying ground, the court and its lane, the road over the stream and the paddy: women in indigo jackets and
// trousers with the broad straw hat, men in black or indigo with a cap or a straw hat, a water-bearer with two
// pails on a pole, a farmer with the hoe, boys, an elder with a staff. No boats. Data for the engine's movers
// (src/engine/movers.js, read in its worker); the ways come from layout.js.
import { RADIUS, T, NEIGHBOURS, STREAM, streamZ, YARD } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 4, rain: 0.5, reach: 150, spawnMin: 28, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: STREAM.water,
};
const BRIDGES = [0, -66];
/**
 * The ways: the road from the north gate to the south over the stream, the court's axis and lane (tiles round a
 * circle), the passages of the second ring, the drying ground, the lanes to the neighbouring tulou, the bridges as links.
 */
export function walkways() {
  const rects = [], links = [];
  const road = (x0, z0, x1, z1, w = 1, k = 'street', m = 1) => rects.push({ r: [x0, z0, x1, z1], weight: w, market: m, kind: k });
  road(-1.4, T.R + 1, 1.4, streamZ(0) - 4.3, 1.4, 'street', 0.8);
  road(-1.4, streamZ(0) + 4.3, 1.4, 150, 0.8, 'street', 0.3);
  road(YARD[0], YARD[1], YARD[2], YARD[3], 1.6, 'street', 1.6);
  road(-1.2, -80, 1.2, -T.R - 1, 0.6, 'lane', 0.1);
  // through the gate and across the court to the hall; round the hall; the passages out to the lane
  road(-1.1, 6.2, 1.1, T.R + 1, 1.2, 'lane', 0.8);
  road(-10, 6.2, 10, 9.4, 0.9, 'lane', 0.5); road(-10, -9.4, 10, -6.2, 0.7, 'lane', 0.3);
  road(-12.5, -9.4, -9.6, 9.4, 0.7, 'lane', 0.3); road(9.6, -9.4, 12.5, 9.4, 0.7, 'lane', 0.3);
  road(-1.1, -T.R - 1, 1.1, -9.4, 0.6, 'lane', 0.2);
  road(9.6, -1.1, 25, 1.1, 0.5, 'lane', 0.2); road(-25, -1.1, -9.6, 1.1, 0.5, 'lane', 0.2);
  // the lane between the rings: tiles of 4 m
  for (let a = 0; a < 360; a += 9) { const x = 21 * Math.cos(a * Math.PI / 180), z = 21 * Math.sin(a * Math.PI / 180); road(x - 2.2, z - 2.2, x + 2.2, z + 2.2, 0.9, 'lane', 0.6); }
  // to the neighbours' gates
  for (const n of NEIGHBOURS) {
    const s = n.kind === 'square' ? n.half : n.R, gz = n.gate === 'n' ? n.c[1] - s : n.c[1] + s, y0 = n.gate === 'n' ? gz - 14 : gz;
    if (n.gate === 's') { road(n.c[0] - 1.2, gz, n.c[0] + 1.2, 51.5, 0.5, 'lane', 0.1); road(Math.min(n.c[0], 0) - 1, 48.5, Math.max(n.c[0], 0) + 1, 51.5, 0.5, 'lane', 0.1); }
    else { road(n.c[0] - 1.2, streamZ(n.c[0]) + 4.3, n.c[0] + 1.2, gz, 0.4, 'lane', 0.1); void y0; }
    // the court of each: the way in and round
    if (n.kind === 'round') road(n.c[0] - n.R * 0.4, n.c[1] - n.R * 0.4, n.c[0] + n.R * 0.4, n.c[1] + n.R * 0.4, 0.3, 'lane', 0.1);
  }
  for (const x of BRIDGES) { const z = streamZ(x); links.push({ a: [x, z - 4.6], b: [x, z + 4.6], w: 0.5, kind: 'bridge', weight: 1.0 }); }
  road(BRIDGES[1] - 1.2, streamZ(BRIDGES[1]) - 20, BRIDGES[1] + 1.2, streamZ(BRIDGES[1]) - 4.3, 0.4, 'lane', 0.1);
  road(BRIDGES[1] - 1.2, streamZ(BRIDGES[1]) + 4.3, BRIDGES[1] + 1.2, 105, 0.4, 'lane', 0.1);
  return { rects, links, clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { indigo: 'cloth_indigo', black: 'cloth_black', blue: 'cloth_blue', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', red: 'cloth_red' };
export const WALKERS = [
  { id: 'woman', weight: 2.0, market: 1.6, el: { dress: 'trousers', hair: 'bun', hat: 'none', arms: 'hang', over: 'none', feet: 'shod' }, wet: 'cape', swing: 0.7,
    c1: [CL.indigo, CL.black, CL.blue, CL.indigo], c2: [CL.black, CL.indigo], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'hatwoman', weight: 1.5, market: 0.8, el: { dress: 'trousers', hair: 'bun', hat: 'straw', arms: 'hang', over: 'none', feet: 'shod' }, wet: 'cape', swing: 0.7,
    c1: [CL.indigo, CL.blue, CL.black], c2: [CL.black], c3: [CL.black], speed: [0.95, 1.2], stride: 1.3, h: [0.9, 0.97] },
  { id: 'man', weight: 1.8, market: 1.4, el: { dress: 'trousers', hair: 'short', hat: 'cap', arms: 'hang', over: 'none', feet: 'shod' }, wet: 'cape',
    c1: [CL.black, CL.indigo, CL.grey, CL.brown], c2: [CL.black, CL.indigo], c3: [CL.black], speed: [1.05, 1.35], stride: 1.4 },
  { id: 'farmer', weight: 1.3, market: 0.4, el: { dress: 'trousers', hair: 'short', hat: 'straw', arms: 'hang', over: 'none', feet: 'shod' }, wet: 'cape',
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.indigo, CL.black], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'pails', weight: 0.9, market: 0.7, el: { dress: 'trousers', hair: 'short', hat: 'straw', carry: 'pole', arms: 'pole', over: 'none', feet: 'shod' }, wet: 'cape', swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.indigo, CL.black], c3: [CL.black], speed: [0.9, 1.15], stride: 1.1, pole: true },
  { id: 'elder', weight: 0.6, market: 0.8, el: { dress: 'trousers', hair: 'short', hat: 'cap', arms: 'staff', over: 'none', feet: 'shod' },
    c1: [CL.black, CL.indigo], c2: [CL.black], c3: [CL.black], speed: [0.6, 0.8], stride: 0.95 },
  { id: 'boy', weight: 0.8, market: 0.9, el: { dress: 'trousers', hair: 'short', hat: 'none', arms: 'hang', over: 'none', feet: 'shod' },
    c1: [CL.red, CL.blue, CL.white, CL.grey], c2: [CL.indigo, CL.black], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet && k.wet === 'cape') { el.over = 'cloak'; cape = 'thatch_palm'; }
    addFigure(sb, v, figure, el, { far, cape });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
