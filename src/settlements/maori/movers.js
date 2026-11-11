// The pā by Lake Rotorua — the moving life (docs/settlements/maori.md §4d): people going up and down
// the path through the gateways, along the terraces, between the kāinga's houses, to the gardens and
// down to the lake shore: women with kete (flax baskets), men with fish and nets on a pole, children,
// old men in dog-skin cloaks, men of the pā with the taiaha. Data for the engine's movers
// (src/engine/movers.js); the ways come from layout.js. No moving boats: the waka stand drawn up on the shore.
import { RADIUS, HILL, PATH, LAKE, shoreZ, village } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 26, night: 3, rain: 0.5, reach: 170, spawnMin: 26, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: LAKE.level,
};

const [hx, hz] = HILL.c;
/** The ways: the path up the south face to the summit; a ring path on each terrace; the summit's marae; a way round the foot; the shore path with spurs down from the kāinga; paths through the gardens. */
export function walkways() {
  const links = [], L = (a, b, w, weight, kind = 'street') => links.push({ a, b, w, kind, weight });
  const gate = [PATH.x, hz + HILL.ditch + 12];
  // the path: from the gardens' edge through the outer gate and up the face to the summit
  L([PATH.x, 215], gate, 1.4, 1.6); L(gate, [PATH.x, hz + 100], 1.4, 1.8); L([PATH.x, hz + 100], [PATH.x, hz + 70], 1.4, 1.8);
  L([PATH.x, hz + 70], [PATH.x, hz + 44], 1.4, 1.8); L([PATH.x, hz + 44], [PATH.x, hz + HILL.tihi - 3], 1.4, 2.0);
  // a ring path round each terrace (mid-width), cut at the path's gap
  const ring = (r, weight) => {
    const n = Math.round(r * Math.PI * 2 / 9), gap = (PATH.w / 2 + 2) / r;
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, m = (a0 + a1) / 2;
      if (Math.abs(((m - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < gap) continue;
      L([hx + Math.cos(a0) * r, hz + Math.sin(a0) * r], [hx + Math.cos(a1) * r, hz + Math.sin(a1) * r], 1.2, weight);
    }
  };
  ring(40, 1.0); ring(68, 1.0); ring(95, 1.0);
  // each ring joins the path where the path crosses it
  for (const r of [40, 68, 95]) { L([PATH.x - 3.2, hz + r], [PATH.x, hz + r], 1.2, 1.0); L([PATH.x, hz + r], [PATH.x + 3.2, hz + r], 1.2, 1.0); }
  // the summit: the marae ātea before the chief's house, the cooking place, the weavers
  L([PATH.x, hz + HILL.tihi - 3], [-5, 28], 1.6, 2.0); L([-5, 28], [-5, 14], 1.6, 1.8); L([-5, 28], [hx + 13, hz + 12], 1.4, 1.2); L([-5, 28], [hx - 15, hz + 10], 1.4, 1.2);
  // the way round the foot of the hill (outside the ditch) and across the kāinga, east and west
  const rf = HILL.ditch + 16, nf = 60;
  for (let i = 0; i < nf; i++) {
    const a0 = i / nf * Math.PI * 2, a1 = (i + 1) / nf * Math.PI * 2, p = [hx + Math.cos(a0) * rf, hz + Math.sin(a0) * rf], q = [hx + Math.cos(a1) * rf, hz + Math.sin(a1) * rf];
    if (Math.hypot(p[0], p[1]) > RADIUS - 50 || Math.hypot(q[0], q[1]) > RADIUS - 50) continue;
    if (Math.abs(p[0]) < 4 && p[1] > hz) { L(p, [PATH.x, p[1]], 1.4, 1.0); continue; }
    L(p, q, 1.3, 0.9);
  }
  // the shore: a path along the beach, joined to the way round the hill on each side
  const sh = (x) => [x, shoreZ(x) + 10];
  for (let x = -220; x < 220; x += 20) L(sh(x), sh(x + 20), 1.4, 1.2);
  for (const x of [-100, 100]) { const z = hz - Math.sqrt(Math.max(1, rf * rf - (x - hx) ** 2)); L([x, z], sh(x), 1.3, 1.1); }
  for (const x of [-190, 190]) { const z = hz - Math.sqrt(Math.max(1, rf * rf - Math.min(rf - 1, Math.abs(x)) ** 2)); L([Math.sign(x) * Math.min(rf - 1, Math.abs(x)), z], sh(x), 1.3, 0.7); }
  // from the kāinga's houses to the way round the hill, the nearer ones
  const v = village();
  for (const h of v.houses.slice(1)) {
    if (Math.hypot(h.c[0] - hx, h.c[1] - hz) < HILL.ditch + 10) continue;
    const r = Math.hypot(h.c[0] - hx, h.c[1] - hz), k = rf / r, t = [hx + (h.c[0] - hx) * k, hz + (h.c[1] - hz) * k];
    if (r > rf + 5 && r < rf + 60 && Math.hypot(t[0], t[1]) < RADIUS - 55) L([h.c[0] + Math.sin(h.yaw) * -(h.l / 2 + 2.3), h.c[1] + Math.cos(h.yaw) * -(h.l / 2 + 2.3)], t, 1.0, 0.45);
  }
  // paths between the garden plots (the gaps of 3 m between the columns of plots, x = −96.5 + 21 k)
  for (const x of [-96.5, -54.5, -12.5 - 21, 29.5, 71.5]) L([x, 155], [x, 300], 0.9, 0.5);
  L([-96.5, 155], [96.5 - 25, 155], 1.0, 0.5);
  void LAKE;
  return { rects: [], links, clip: RADIUS - 14 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// ── who walks ────────────────────────────────────────────────────────────────
// After Cook's, Banks's and Parkinson's accounts and drawings of 1769–70 and the dress of the period (dossier
// §4d): the kilt of flax strands (piupiu) or a plain belt on the men, the cloak (kākahu) of flax fibre — plain
// muka (pale gold), dyed brown or black, edged with taniko — and of dog skin for the chiefs and the old; women
// in a flax skirt and a cloak tied at the shoulder, the hair long or in a knot; everyone barefoot.
const CL = { ochre: 'cloth_ochre', brown: 'cloth_brown', black: 'cloth_black', tan: 'hide_tan', white: 'hide_white', hbrown: 'hide_brown', grey: 'cloth_grey' };
const SK = { skin: 'skin_dark', hairMat: 'hair_dark' };
export const WALKERS = [
  { id: 'man', weight: 1.6, market: 1.2, el: { dress: 'strands', over: 'cape', hat: 'none', arms: 'hang', hair: 'bun', beard: 0, feet: 'bare', ...SK },
    c1: [CL.ochre, CL.brown, CL.ochre, CL.black], c2: [CL.brown, CL.ochre], c3: [CL.brown], speed: [1.0, 1.35], stride: 1.4 },
  { id: 'warrior', weight: 0.7, market: 0.5, el: { dress: 'strands', over: 'belt', hat: 'none', carry: 'staff', arms: 'staff', hair: 'bun', beard: 0, feet: 'bare', ...SK },
    c1: [CL.ochre, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [1.0, 1.35], stride: 1.45 },
  { id: 'woman', weight: 1.6, market: 1.3, el: { dress: 'wrap', over: 'shawl', hat: 'none', arms: 'hang', hair: 'long', feet: 'bare', ...SK }, swing: 0.7,
    c1: [CL.ochre, CL.brown, CL.ochre, CL.tan], c2: [CL.brown, CL.ochre], c3: [CL.ochre], speed: [0.85, 1.15], stride: 1.2, h: [0.9, 0.97] },
  { id: 'kete', weight: 1.3, market: 1.4, el: { dress: 'wrap', over: 'shawl', carry: 'basket', arms: 'head', hair: 'bun', hat: 'none', feet: 'bare', ...SK }, swing: 0.5,
    c1: [CL.ochre, CL.brown, CL.tan], c2: [CL.brown, CL.ochre], c3: [CL.ochre], speed: [0.8, 1.05], stride: 1.15, h: [0.9, 0.97] },
  { id: 'fisher', weight: 1.0, market: 0.8, el: { dress: 'strands', over: 'belt', carry: 'pole', arms: 'pole', hair: 'bun', hat: 'none', feet: 'bare', ...SK }, swing: 0.75,
    c1: [CL.ochre, CL.brown], c2: [CL.brown], c3: [CL.brown], speed: [1.0, 1.25], stride: 1.15, pole: true },
  { id: 'elder', weight: 0.6, market: 0.5, el: { dress: 'wrap', over: 'cape', hat: 'none', arms: 'staff', carry: 'staff', hair: 'bun', beard: 1, feet: 'bare', ...SK },
    c1: [CL.white, CL.hbrown, CL.white], c2: [CL.brown], c3: [CL.brown], speed: [0.65, 0.85], stride: 1.0 },
  { id: 'child', weight: 0.8, market: 0.7, el: { dress: 'wrap', over: 'none', hat: 'none', arms: 'hang', hair: 'short', feet: 'bare', ...SK }, swing: 1.1,
    c1: [CL.ochre, CL.brown, CL.tan], c2: [CL.brown], c3: [CL.brown], speed: [1.1, 1.5], stride: 1.0, h: [0.55, 0.7] },
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
