// Mississippian Cahokia — the moving life of the plaza, the ramp and the lanes between the houses
// (docs/settlements/cahokia.md §5.4): men and women walking the Grand Plaza and the lanes of the
// neighbourhoods, up and down the ramp of Monks Mound, with baskets and loads on the back. No boats
// (the creek lies beyond the town). Data for the engine's movers (src/engine/movers.js): the ways
// (from layout.js), who walks. Dress after the Southeastern peoples as the dossier has it; the men
// in a tunic of tanned deerskin and leggings (the engine's walkers swing bare legs as arms, so the
// breechcloth of the standing figures is traded for leggings here) [inferred], the women in a wrap
// skirt of woven fibre with a mantle.
import { RADIUS, PLAZA, PALISADE, WOODHENGE, CREEK, lots, inRect, inCreek, mounds, creekZ, smallPlazas } from './layout.js';
import '../../styles/mississippian/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 5, rain: 0.6, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: CREEK.level,
};

let LANES = null;
/** The lanes between the houses: the grid lines of the lots (11 m apart) where no house stands, 1 m wide, in runs. */
function lanes() {
  if (LANES) return LANES;
  LANES = [];
  const L = lots(), G = 11, o = -RADIUS + 20, clear = (r) => !L.some((l) => l.rect[0] < r[2] + 0.5 && l.rect[2] > r[0] - 0.5 && l.rect[1] < r[3] + 0.5 && l.rect[3] > r[1] - 0.5)
    && ![[r[0], r[1]], [r[2], r[3]], [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]].some(([x, z]) => mounds(x, z) > 0.05 || inRect(PLAZA, x, z, 3) || inCreek(x, z) || Math.abs(z - creekZ(x)) < CREEK.w / 2 + 6
      || Math.hypot(x - WOODHENGE.c[0], z - WOODHENGE.c[1]) < WOODHENGE.r + 4 || Math.abs(x - PALISADE[0]) < 3.5 || Math.abs(x - PALISADE[2]) < 3.5 || Math.abs(z - PALISADE[1]) < 3.5 || Math.abs(z - PALISADE[3]) < 3.5
      || smallPlazas().some((p) => inRect(p.rect, x, z, 1)) || Math.hypot(x, z) > 330);
  for (const horiz of [false, true]) for (let g = o; g < RADIUS - 20; g += G) {
    let run = null;
    for (let a = o; a < RADIUS - 20; a += G) {
      const r = horiz ? [a, g - 0.5, a + G, g + 0.5] : [g - 0.5, a, g + 0.5, a + G];
      if (clear(r)) { if (run) run[horiz ? 2 : 3] = horiz ? r[2] : r[3]; else run = r.slice(); } else { if (run) LANES.push(run); run = null; }
    }
    if (run) LANES.push(run);
  }
  return LANES.filter((r) => Math.max(r[2] - r[0], r[3] - r[1]) >= 20);
}

export function walkways() {
  const rects = [];
  const push = (r, weight, kind, market = 0) => rects.push({ r, weight, market, kind });
  // the Grand Plaza: lines across it, clear of the chunkey yards
  for (const x of [-95, -25, 85]) push([x - 1.5, PLAZA[1] + 4, x + 1.5, PLAZA[3] - 4], 1.4, 'street', 0.5);
  for (const z of [5, 70, 130]) push([PLAZA[0] + 4, z - 1.5, PLAZA[2] - 4, z + 1.5], 1.4, 'street', 0.5);
  // the ramp of Monks Mound up to the first terrace and the summit's edge
  push([-26.2, -200, -23.8, -38], 1.0, 'street');
  // the first terrace of Monks Mound, and the path along the creek's bank from landing to landing
  push([-56, -85, 56, -83], 0.7, 'street');
  for (let x = -330; x < 330; x += 20) push([x, creekZ(x + 10) + CREEK.w / 2 + 3.5, x + 20, creekZ(x + 10) + CREEK.w / 2 + 4.8], 0.5, 'lane');
  // the lanes of the neighbourhoods, busier near the plaza
  for (const r of lanes()) push(r, 0.5, 'lane');
  // the ways round the small plazas
  for (const p of smallPlazas()) { const [x0, z0, x1, z1] = p.rect; for (const [r] of [[[x0 - 8, p.c[1] - 0.6, x1 + 8, p.c[1] + 0.6]], [[p.c[0] - 0.6, z0 - 8, p.c[0] + 0.6, z1 + 8]]]) if (Math.hypot(p.c[0], p.c[1]) < 280) push(r, 0.6, 'lane'); }
  return { rects, links: [], clip: RADIUS - 40 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { tan: 'hide_tan', brown: 'hide_brown', white: 'hide_white', grey: 'hide_grey', ochre: 'cloth_ochre', black: 'cloth_black', fibre: 'cloth_brown' };
export const WALKERS = [
  { id: 'man', weight: 1.4, market: 1.4, el: { dress: 'trousers', hair: 'topknot', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.tan, CL.tan, CL.brown, CL.white], c2: [CL.tan, CL.brown, CL.grey], c3: [CL.black], speed: [1.05, 1.35], stride: 1.45 },
  { id: 'chief', weight: 0.25, market: 0.5, el: { dress: 'trousers', hair: 'topknot', over: 'cape', arms: 'hang', feet: 'shod' }, wet: 'cape',
    c1: [CL.white, CL.tan], c2: [CL.white, CL.brown], c3: [CL.black], speed: [0.85, 1.05], stride: 1.5 },
  { id: 'woman', weight: 1.4, market: 1.3, el: { dress: 'wrap', hair: 'long', over: 'shawl', arms: 'hang', feet: 'shod' }, wet: 'cape', swing: 0.7,
    c1: [CL.fibre, CL.tan, CL.ochre, CL.black], c2: [CL.tan, CL.brown], c3: [CL.black], speed: [0.95, 1.2], stride: 1.25, h: [0.9, 0.97] },
  { id: 'basket', weight: 0.9, market: 1.0, el: { dress: 'wrap', hair: 'long', over: 'none', arms: 'pole', carry: 'pole', feet: 'shod' }, wet: 'cape', swing: 0.75,
    c1: [CL.fibre, CL.tan, CL.ochre], c2: [CL.tan], c3: [CL.black], speed: [0.95, 1.2], stride: 1.1, pole: true, h: [0.9, 0.97] },
  { id: 'hunter', weight: 0.5, market: 0.3, el: { dress: 'trousers', hair: 'topknot', arms: 'staff', carry: 'staff', staffMat: 'timber', len: 1.8, feet: 'shod' },
    c1: [CL.tan, CL.brown], c2: [CL.tan, CL.brown], c3: [CL.black], speed: [1.1, 1.4], stride: 1.5 },
  { id: 'water', weight: 0.7, market: 0.8, el: { dress: 'wrap', hair: 'long', over: 'none', carry: 'pot', feet: 'shod' }, wet: 'cape', swing: 0.4,
    c1: [CL.fibre, CL.tan, CL.ochre], c2: [CL.tan], c3: [CL.black], speed: [0.9, 1.1], stride: 1.1, h: [0.9, 0.97] },
  { id: 'elder', weight: 0.3, market: 0.5, el: { dress: 'trousers', hair: 'bun', over: 'cape', arms: 'staff', carry: 'staff', staffMat: 'timber', len: 1.6, feet: 'shod' }, wet: 'cape',
    c1: [CL.white, CL.tan, CL.grey], c2: [CL.tan, CL.brown], c3: [CL.black], speed: [0.7, 0.9], stride: 1.1 },
  { id: 'boy', weight: 0.4, market: 0.3, el: { dress: 'trousers', hair: 'bun', arms: 'hang' },
    c1: [CL.tan, CL.brown], c2: [CL.tan], c3: [CL.black], speed: [1.2, 1.7], stride: 1.0, h: [0.55, 0.68], swing: 1.1 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`), el = { ...k.el };
    let cape = null;
    if (wet) { el.over = 'cloak'; cape = 'thatch_palm'; }          // the rain cape of woven fibre
    addFigure(sb, v, figure, el, { far, cape });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
