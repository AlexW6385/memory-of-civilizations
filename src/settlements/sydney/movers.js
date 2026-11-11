// Modern Sydney, 1973 — the moving life (docs/settlements/sydney.md §10): Sydneysiders walking the streets, the Rocks' lanes,
// the quay's promenade, the Opera House's stair and broadwalk and the Botanic Garden's paths; ferries of the Lady class crossing the
// harbour from the quay and along it. Data for the engine's movers (src/engine/movers.js, read in its worker), in the format of
// Suzhou's: the ways come from layout.js; the boats are the modern style's ferry (with its passengers baked into the hull set); they
// have no oar and no boatman (those variants are empty).

import { RADIUS, LEVEL, STREETS_X, STREETS_Z, OPERA, QUAY, BENNELONG } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../styles/modern/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 6, rain: 0.7, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 5, reach: 420, spawnMin: 90, far: 160, speed: [4.2, 6.0], bridgeSpeed: 4 },
  water: LEVEL,
};

// ── the ways ─────────────────────────────────────────────────────────────────
const [, oz0, , oz1] = OPERA.rect;
/** The streets, lanes, the promenade, the Opera House's stair and broadwalk, the Garden's paths (rectangles), and the links round the viaduct. */
export function walkways() {
  const rects = [];
  const street = (r, weight, market = 0.6, kind = 'street') => rects.push({ r, weight, market, kind });
  // the city's streets running south: George, Pitt and the rest; the cross streets east–west (the Garden's edge at x ≈ 162)
  for (const s of STREETS_X) {
    const north = s < -100 ? -80 : s > 90 && s < 120 ? oz1 + OPERA.stair + 4 : 34;       // (the Rocks' streets run down to Dawes Point; the one at x 100 to the Opera House's stair)
    street([s - 4, north, s + 4, RADIUS - 20], s === -40 || s === 30 ? 3.2 : 2.2, 1);
  }
  for (const z of STREETS_Z) street([-RADIUS + 30, z - 3.5, z < 160 ? 162 : RADIUS - 30, z + 3.5], z === 70 ? 3.0 : 2.0, 1);
  // the Rocks' lanes between the facing rows of terraces (layout.js lots: rows every 16 m, the fronts of the pairs face each other)
  for (let k = 0; k < 12; k += 2) street([-300, -120 + 16 * (k + 1) - 2.2, -104, -120 + 16 * (k + 1) - 0.4], 1.0, 0.3, 'lane');
  // the quay's promenade along the head of the cove, and the ways up round the viaduct to the streets beyond
  street([QUAY[0] - 6, -5.6, QUAY[2] + 6, -0.6], 4.0, 1.4);
  street([QUAY[0] - 7.5, -3, QUAY[0] - 4.5, 38], 2.0, 1);
  street([QUAY[2] + 4.5, -3, QUAY[2] + 7.5, 38], 2.0, 1);
  // the Opera House: the approach from the street, the forecourt, the great stair, the strip across the podium's front, the broadwalk down both sides
  street([50, -104, 150, -98], 2.6, 1);
  street([92, oz1 - 0.5, 108, oz1 + OPERA.stair + 4], 3.0, 1.6);
  street([64, oz1 - 4.5, 136, oz1 - 0.5], 2.4, 1.4);
  street([49, oz0 + 6, 57, -100], 1.6, 1); street([143, oz0 + 6, 151, -100], 1.6, 1);
  // the Royal Botanic Garden: paths round Farm Cove and across the lawns
  street([158, 40, 166, 72], 1.2, 0.5, 'lane');
  street([162, 40, 410, 48], 1.8, 0.8, 'lane'); street([196, -30, 204, 142], 1.4, 0.8, 'lane'); street([316, -30, 324, 142], 1.2, 0.8, 'lane');
  return { rects, links: [], clip: RADIUS - 12 };
}
/** The ferries' lanes: from the quay's wharves north into the harbour, and across it (wide: the boats are 38 m). */
export function waterways() {
  return {
    rects: [
      { r: [-16, -330, 28, -74], weight: 1.4, kind: 'lake' },
      { r: [-170, -335, 200, -305], weight: 1, kind: 'lake' },
    ],
    bridges: [], clip: RADIUS - 18,
  };
}
/** No boats stand in the lanes (the ferry at the east wharf is berthed beside them). */
export async function staticBoats() { return []; }

// ── who walks ────────────────────────────────────────────────────────────────
// After the dress of 1973 (dossier §10): office men in shirt and tie or a suit, some with hats; women in knee-length dresses
// and skirts in bright colours; secretaries and shop girls; tradesmen in work clothes with the bush hat; the young in flared
// trousers; schoolchildren in uniform; tourists with cameras. In the rain, raincoats.
const CL = { grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', red: 'cloth_red', green: 'cloth_green', blue: 'cloth_blue', indigo: 'cloth_indigo', maroon: 'cloth_maroon', ochre: 'cloth_ochre' };
export const WALKERS = [
  { id: 'office', weight: 2.0, market: 1.3, el: { dress: 'trousers', hair: 'short', over: 'collar', arms: 'hang' }, wet: 'cloak',
    c1: [CL.white, CL.blue, CL.white, CL.ochre, CL.grey], c2: [CL.grey, CL.brown, CL.black, CL.indigo, CL.grey], c3: [CL.black], speed: [1.3, 1.7], stride: 1.55 },
  { id: 'suit', weight: 1.0, market: 1.1, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'collar', arms: 'hang' }, wet: 'cloak',
    c1: [CL.grey, CL.black, CL.indigo, CL.brown], c2: [CL.grey, CL.black, CL.indigo, CL.brown], c3: [CL.grey, CL.brown, CL.black], speed: [1.25, 1.6], stride: 1.5 },
  { id: 'woman', weight: 2.0, market: 1.8, el: { dress: 'tunic', hair: 'long', arms: 'hang' }, wet: 'cloak', swing: 0.6,
    c1: [CL.red, CL.ochre, CL.green, CL.blue, CL.white, CL.maroon, '#c5742c', '#4a8a8a'], c2: [CL.white, CL.black, CL.brown], c3: [CL.black], speed: [1.15, 1.5], stride: 1.3, h: [0.92, 0.98] },
  { id: 'secretary', weight: 1.3, market: 1.6, el: { dress: 'tunic', hair: 'bun', over: 'belt', arms: 'hang' }, wet: 'cloak', swing: 0.7,
    c1: [CL.blue, CL.grey, CL.green, CL.white, CL.maroon], c2: [CL.white, CL.grey], c3: [CL.black], speed: [1.3, 1.65], stride: 1.3, h: [0.9, 0.96] },
  { id: 'youth', weight: 1.1, market: 1.3, el: { dress: 'trousers', hair: 'long', arms: 'hang' }, wet: 'cloak',
    c1: [CL.ochre, CL.red, CL.green, CL.blue, CL.white], c2: [CL.indigo, CL.indigo, CL.brown, CL.black], c3: [CL.black], speed: [1.25, 1.6], stride: 1.5 },
  { id: 'tradesman', weight: 1.0, market: 0.7, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'belt', arms: 'hang' }, wet: 'cloak',
    c1: [CL.ochre, CL.brown, CL.grey, CL.blue], c2: [CL.brown, CL.grey, CL.indigo], c3: [CL.ochre, CL.brown, CL.grey], speed: [1.2, 1.55], stride: 1.5 },
  { id: 'schoolgirl', weight: 0.5, market: 1.2, el: { dress: 'tunic', hair: 'short', hat: 'brim', arms: 'hang' }, wet: 'cloak', swing: 0.9,
    c1: [CL.blue, CL.blue, CL.green], c2: [CL.white], c3: [CL.blue, CL.green], speed: [1.3, 1.7], stride: 1.1, h: [0.74, 0.84] },
];
export const CREW = { boatman: { el: {}, c1: [CL.white], c2: [CL.white], c3: [CL.white] }, passenger: { el: {}, c1: [CL.white], c2: [CL.white], c3: [CL.white] } };

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of [false, true]) for (const far of [false, true]) {
    if (wet && !k.wet) continue;
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`), el = { ...k.el };
    if (wet) el.over = 'cloak';
    addFigure(sb, v, figure, el, { far });
  }
  // (no crew: the ferries' skippers are in their wheelhouses, unseen)
  for (const id of ['boatman', 'passenger']) for (const wet of [false, true]) for (const far of [false, true]) sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
}

// ── what floats ──────────────────────────────────────────────────────────────
/**
 * The Lady-class ferry (the modern style's `ferry`, 38 m, double-ended, bow toward −z) as the boat of both kinds, with its
 * passengers on the upper deck's benches and at the rails, broadened by 1.28 in x against the engine's scale of 0.78 across.
 * The oar's variant is empty.
 */
export const BOAT = { L: 38, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [6.1, 19] };
export function boatShapes(sb) {
  const got = [];
  STYLES.modern.elements.ferry({ at: [0, 0], y: 0, rot: 0, kind: 'lady' }, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {} } });
  const yU = 4.7, yD = 2.2, S = 1.28;
  const plan = [];
  for (let k = 0; k < 8; k++) { const sg = k % 2 ? 1 : -1; plan.push([sg * 3.3, yU, -10 + k * 2.8, sg > 0 ? -Math.PI / 2 : Math.PI / 2, k, false]); }
  for (let k = 0; k < 4; k++) plan.push([-1.2 + k * 0.8, yD, -17.5, Math.PI, 20 + k, true]);
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of got) { const q = g.clone(); q.scale(S, 1, 1); sb.addPiece(v, 'wood', q, { slot: SLOT.none, col: factor('wood', m) }); }
    if (far) continue;
    // benches on the upper deck, and the people
    const bag = { add: (m, g) => { const q = g.clone(); q.scale(S, 1, 1); sb.addPiece(v, 'wood', q, { slot: SLOT.none, col: factor('wood', m) }); } };
    STYLES.life.elements.bench && [-6, 0, 6].forEach((dz) => STYLES.life.elements.bench({ t: 'bench', at: [0, dz], y: yU, rot: Math.PI / 2, len: 3.2, back: true, mat: 'timber', seed: dz + 10 }, { bag, col: { circle() {}, rect() {}, box() {} } }));
    let s = 77; const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296), pick = (a) => a[Math.floor(rand() * a.length)];
    for (const [x, y, z, rot, n, up] of plan) {
      figure({ t: 'figure', at: [x, z], y, rot, seed: 900 + n * 37, dress: rand() < 0.45 ? 'tunic' : 'trousers', cloth: pick(['cloth_grey', 'cloth_indigo', 'cloth_brown', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_white']), cloth2: pick(['cloth_white', 'cloth_grey']), skin: 'skin_light', hat: rand() < 0.12 ? 'brim' : 'none', hatMat: 'cloth_grey', pose: !up && n % 3 === 0 ? 'talk' : 'stand' }, { bag, col: { circle() {}, rect() {}, box() {} } });
    }
  }
  sb.variant('oar');
}
void BENNELONG;
