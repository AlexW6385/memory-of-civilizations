// Conques about 1120 — the moving life of the village (docs/settlements/conques.md §5b): pilgrims on the way to
// Santiago climbing the Rue Charlemagne's stair from the bridge and along the lane to the abbey's square, with
// their staffs, wide hats, scrips, gourds and the scallop shell; monks of the abbey; villagers, women with baskets,
// peasants with sacks, children, on the lanes and stairs of the terraced village. Data for the engine's movers
// (src/engine/movers.js), read in its worker: the ways (from layout.js), who walks. No boats.

import { RADIUS, ABBEY, GATE, STAIR, lanes, stairs } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 34, night: 3, rain: 0.6, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -4,
};

/** The ways: the lanes and the stair streets (the pilgrims' way busy), the abbey's square, the road down to the bridge. */
export function walkways() {
  const rects = [], t = ABBEY.terrace;
  for (const l of lanes()) {
    const main = Math.abs(l.z - 10.5) < 1 && l.x0 < -62;
    rects.push({ r: [l.x0, l.z - 1.5, l.x1, l.z + 1.5], weight: main ? 4 : 1.2, market: main ? 3 : 0.6, kind: 'street' });
  }
  for (const s of stairs()) rects.push({ r: [s.x - STAIR.tread / 2, s.z0 - 1.5, s.x + STAIR.tread / 2, s.z1 + 1.5], weight: s.x === -80 ? 3.5 : 1, market: s.x === -80 ? 2 : 0.5, kind: 'lane' });
  // the square before the west front, and the way out of the gate down to the bridge
  rects.push({ r: [t[0] + 1.5, -30, ABBEY.origin[0] - 2, 52], weight: 2.5, market: 1.5, kind: 'street' });
  rects.push({ r: [GATE.x - 1.2, GATE.z - 1.6, GATE.x + 1.2, 203], weight: 2, market: 0.4, kind: 'lane' });
  return { rects, links: [], clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// ── who walks ────────────────────────────────────────────────────────────────
// Dress of the 12th century in the Rouergue: the pilgrim in a long plain coat with a hood or a wide-brimmed hat, a
// leather scrip at the hip, a gourd, a staff (the bourdon) with an iron foot, the scallop shell sewn on the cape;
// the monk of the abbey in the black Benedictine habit with a cowl; the villagers in tunics and the women in long
// gowns with veils, undyed wool and linen, browns, greys, ochre, madder red and woad blue.
const CL = { brown: 'cloth_brown', grey: 'cloth_grey', black: 'cloth_black', ochre: 'cloth_ochre', white: 'cloth_white', red: 'cloth_maroon', blue: 'cloth_indigo', green: 'cloth_green' };

const blob = (cx, cy, cz, rx, ry, rz, n = 7) => {
  const t = [], P = (a, b) => [cx + Math.cos(a) * Math.sin(b) * rx, cy + Math.cos(b) * ry, cz + Math.sin(a) * Math.sin(b) * rz];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, b0 = j / n * Math.PI, b1 = (j + 1) / n * Math.PI;
    t.push(...P(a0, b0), ...P(a0, b1), ...P(a1, b1), ...P(a0, b0), ...P(a1, b1), ...P(a1, b0));
  }
  return t;
};
/** The pilgrim's marks: the scallop shell on the cape (a fan of ribs), the scrip at the right hip, the gourd on the left. */
function pilgrimGear(add) {
  const shell = [], c = [-0.13, 1.37, -0.19];
  for (let k = 0; k < 7; k++) {
    const a0 = Math.PI * (0.05 + k * 0.9 / 7), a1 = Math.PI * (0.05 + (k + 1) * 0.9 / 7), r = 0.075;
    shell.push(c[0], c[1] - 0.04, c[2], c[0] + Math.cos(a1) * r, c[1] - 0.04 + Math.sin(a1) * r, c[2] - 0.012, c[0] + Math.cos(a0) * r, c[1] - 0.04 + Math.sin(a0) * r, c[2] - 0.012);
  }
  add('cloth', flat(shell), { col: factor('cloth', 'cloth_white', 1.1) });
  add('cloth', flat(blob(0.22, 0.98, -0.1, 0.1, 0.12, 0.06)), { col: factor('cloth', 'hide_brown', 0.9) });
  add('wood', flat(blob(-0.24, 0.95, -0.08, 0.055, 0.1, 0.055, 6)), { col: factor('wood', 'wood_ochre', 0.95) });
}
export const WALKERS = [
  { id: 'pilgrim', weight: 2.2, market: 2.2, el: { dress: 'robe', hair: 'short', hat: 'brim', over: 'cape', carry: 'staff', len: 1.8, arms: 'staff' }, gear: pilgrimGear,
    c1: [CL.brown, CL.grey, CL.brown, CL.ochre], c2: [CL.grey, CL.brown, CL.black], c3: [CL.brown, CL.black, CL.grey], speed: [0.85, 1.1], stride: 1.4 },
  { id: 'pilgrim_hood', weight: 1.0, market: 1.4, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'cape', carry: 'staff', len: 1.8, arms: 'staff' }, gear: pilgrimGear,
    c1: [CL.grey, CL.brown, CL.black], c2: [CL.brown, CL.grey], c3: [CL.grey, CL.brown], speed: [0.8, 1.05], stride: 1.35 },
  { id: 'monk', weight: 1.0, market: 0.5, el: { dress: 'robe', hair: 'shaven', hat: 'veil', over: 'cape', arms: 'hang' },
    c1: [CL.black], c2: [CL.black], c3: [CL.black], speed: [0.9, 1.15], stride: 1.4 },
  { id: 'villager', weight: 1.3, market: 1.2, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.ochre, CL.green], c2: [CL.brown, CL.white, CL.blue], c3: [CL.brown, CL.red], speed: [1.0, 1.3], stride: 1.45 },
  { id: 'woman', weight: 1.3, market: 1.6, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'apron', arms: 'hang', carry: 'basket' }, swing: 0.7,
    c1: [CL.blue, CL.red, CL.ochre, CL.grey], c2: [CL.white, CL.brown], c3: [CL.white], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'peasant', weight: 0.9, market: 0.6, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', carry: 'sack', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.green], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'carrier', weight: 0.6, market: 0.8, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', carry: 'pails', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.blue], c2: [CL.brown, CL.white], c3: [CL.brown], speed: [0.85, 1.05], stride: 1.3 },
  { id: 'woodman', weight: 0.5, market: 0.2, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', carry: 'wood_head', arms: 'hang' },
    c1: [CL.brown, CL.green, CL.grey], c2: [CL.brown], c3: [CL.brown], speed: [0.85, 1.1], stride: 1.3 },
  { id: 'child', weight: 0.5, market: 0.8, el: { dress: 'robe', hair: 'short', arms: 'hang' },
    c1: [CL.brown, CL.red, CL.ochre], c2: [CL.white, CL.grey], c3: [CL.black], speed: [1.1, 1.5], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
];
export const CREW = {};

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`);
    addFigure(sb, v, figure, { ...k.el }, { far, cape: null, extra: k.gear && !far ? k.gear : null });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
