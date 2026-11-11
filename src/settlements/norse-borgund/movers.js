// Norse Norway about 1250 — the moving life of the valley (docs/settlements/norse-borgund.md §10): farmers and
// their wives going between the yards, the church and the river landing, thralls and boys with loads, women
// carrying water, herders with their sticks, the priest crossing to the church. Data for the engine's movers
// (src/engine/movers.js); the ways come from layout.js. No moving boats (the boats at the quay stand).
import { RADIUS, YARD, FARMS, LANDING, RIVER, height, inBuilding, inRiver, buildings } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 30, night: 3, rain: 0.7, reach: 170, spawnMin: 22, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: RIVER.level,
};

const clear = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 1.0); for (let i = 0; i <= n; i++) { const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n; if (inBuilding(x, z, 1.1) || inRiver(x, z)) return false; } return true; };
/** A free point in a farm's yard (clear of its buildings), nearest the church side. */
function yardPoint([fx, fz]) {
  let best = null, bd = 1e9;
  for (let r = 3; r < 22; r += 1.5) for (let a = 0; a < 6.28; a += 0.4) { const p = [fx + Math.cos(a) * r, fz + Math.sin(a) * r]; if (inBuilding(p[0], p[1], 1.5) || height(...p) > 2) continue; const d = Math.hypot(p[0], p[1] + 4) + r * 0.5; if (d < bd) { bd = d; best = p; } }
  return best || [fx, fz];
}
/** The ways: a valley track along the floor from the church's gate to the farms, spurs into the yards, the churchyard's gate, the way down to the quay. */
export function walkways() {
  const links = [], L = (a, b, w, weight, kind = 'street') => { if (clear(a, b)) links.push({ a, b, w, kind, weight }); };
  const gate = [0, YARD[3] + 5];
  const nodes = [gate, ...FARMS.map(yardPoint)];
  // the track: a gate-ward spine, each farm to the church's gate and to its nearest neighbours
  nodes.forEach((p, i) => {
    if (i > 0) L(p, gate, 1.3, 1.0);
    const near = nodes.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j]).filter(([, j]) => j !== i).sort((a, b) => a[0] - b[0]).slice(0, 2);
    for (const [, j] of near) L(p, nodes[j], 1.3, 0.9);
  });
  // to and through the churchyard: gate → church door's side
  L(gate, [0, YARD[3] - 3], 1.6, 1.8); L([0, YARD[3] - 3], [-16, -29], 1.5, 1.8);
  // the river landing: from the nearest farm yard down the bank to the head of the quay
  const q = [LANDING.x, LANDING.top - 2];
  let best = nodes[1], bd = 1e9; for (const p of nodes.slice(1)) { const d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < bd) { bd = d; best = p; } }
  L(best, q, 1.3, 0.9); L(q, [LANDING.x, LANDING.top + 1], 1.8, 1.2);
  void buildings;
  return { rects: [], links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { brown: 'cloth_brown', grey: 'cloth_grey', white: 'cloth_white', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', green: 'cloth_green', black: 'cloth_black', ochre: 'cloth_ochre' };
// Dress after the finds and the laws of the period: undyed and natural wool of brown and grey, the tunic to the knee over hose
// (wound leg-bands), cloaks pinned at the shoulder, caps and hoods for men; women in long tunics with a linen head-cloth.
export const WALKERS = [
  { id: 'farmer', weight: 2.0, market: 1.2, el: { dress: 'tunic', hat: 'cap', hair: 'short', beard: 1, over: 'cloak', legs: 'hose', feet: 'shod', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.green, CL.brown, CL.blue], c2: [CL.brown, CL.grey], c3: [CL.brown, CL.black], speed: [0.95, 1.25], stride: 1.4 },
  { id: 'woman', weight: 1.5, market: 1.2, el: { dress: 'robe', hat: 'none', hair: 'long', over: 'shawl', arms: 'hang', feet: 'shod' }, swing: 0.7,
    c1: [CL.red, CL.blue, CL.green, CL.brown, CL.indigo], c2: [CL.white, CL.white, CL.brown], c3: [CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.97] },
  { id: 'water', weight: 1.0, market: 0.8, el: { dress: 'robe', hat: 'none', hair: 'long', carry: 'yoke', arms: 'yoke', feet: 'shod' }, swing: 0.5,
    c1: [CL.brown, CL.indigo, CL.grey], c2: [CL.white, CL.brown], c3: [CL.white], speed: [0.8, 1.0], stride: 1.15, h: [0.9, 0.97] },
  { id: 'labourer', weight: 1.4, market: 0.9, el: { dress: 'tunic', hat: 'cap', hair: 'short', beard: 0, carry: 'pole', arms: 'pole', legs: 'hose', feet: 'shod' }, swing: 0.75,
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.brown], speed: [0.95, 1.2], stride: 1.3, pole: true },
  { id: 'herder', weight: 0.9, market: 0.6, el: { dress: 'tunic', hat: 'cap', hair: 'short', beard: 1, carry: 'staff', arms: 'staff', legs: 'hose', feet: 'shod' },
    c1: [CL.brown, CL.grey, CL.green], c2: [CL.grey, CL.brown], c3: [CL.brown], speed: [0.9, 1.2], stride: 1.35 },
  { id: 'boy', weight: 0.6, market: 0.7, el: { dress: 'tunic', hat: 'none', hair: 'short', arms: 'hang', legs: 'hose', feet: 'shod' },
    c1: [CL.brown, CL.red, CL.grey], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
  { id: 'priest', weight: 0.3, market: 0.4, el: { dress: 'robe', hat: 'none', hair: 'shaven', beard: 0, over: 'cape', arms: 'hang', feet: 'shod' },
    c1: [CL.black, CL.grey], c2: [CL.white], c3: [CL.black], speed: [0.8, 1.0], stride: 1.2 },
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
