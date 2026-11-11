// Vienna, spring 1902 — the moving life (docs/settlements/vienna.md §7): people walking the Ring's promenades, the streets between the
// tenements, the Naschmarkt's aisle, the Karlsplatz and the garden behind the Secession, in the dress of the day — frock coats and
// bowlers, officers in pike-grey, ladies in long skirts and big hats, market women in headscarves, students, newspaper boys,
// porters. Data for the engine's movers (src/engine/movers.js), read in its worker; the format is Suzhou's; the ways come from
// layout.js. No boats (the Wien is a walled channel).

import { RADIUS, EW, NS, WIEN, NASCH, PATHS, SQUARE, SEC_COURT, SEC, KARLSPLATZ, CAFE, paving } from './layout.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 44, night: 6, rain: 0.6, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: WIEN.water,
};

// ── the ways ─────────────────────────────────────────────────────────────────
export function walkways() {
  const rects = [];
  const chan = [-WIEN.x1 - 5, WIEN.z0 - 2, WIEN.x1 + 5, WIEN.z1 + 10];
  const outside = (r) => !(r[0] < chan[2] && r[2] > chan[0] && r[1] < chan[3] && r[3] > chan[1]);
  for (const s of EW) {
    const ring = s.name === 'ring', k = ring ? 7 : 2.6, near = Math.abs(s.z) < 140 ? 1.3 : 1;
    for (const sg of [-1, 1]) rects.push({ r: [s.x0 + 14, sg < 0 ? s.z - s.w / 2 + 0.4 : s.z + s.w / 2 - k + 0.4, s.x1 - 14, sg < 0 ? s.z - s.w / 2 + k - 0.4 : s.z + s.w / 2 - 0.4], weight: (ring ? 2.8 : 1.9) * near, market: ring ? 1.0 : 1.3, kind: 'street' });
  }
  for (const s of NS) for (const sg of [-1, 1]) {
    const x = s.x + sg * (s.w / 2 - 1.3), a = Math.max(s.z0, -250) + 10, b = s.z1 - 10;
    for (const [p, q] of [[a, WIEN.z0 - 4], [WIEN.z1 + 12, b]]) if (q - p > 14) rects.push({ r: [x - 1.2, p, x + 1.2, q], weight: 1.0, market: 1.0, kind: 'lane' });
    void outside;
  }
  rects.push({ r: [NASCH.x0 + 6, 54.8, NASCH.x1 - 6, 56.4], weight: 3.4, market: 3.2, kind: 'street' });
  rects.push({ r: [-250, 49.6, -64, 51.0], weight: 1.4, market: 2.0, kind: 'street' });
  for (const { w, pts } of PATHS) for (let i = 0; i + 1 < pts.length; i++) { const [ax, az] = pts[i], [bx, bz] = pts[i + 1]; rects.push({ r: [Math.min(ax, bx) - w / 2 + 0.3, Math.min(az, bz) - w / 2 + 0.3, Math.max(ax, bx) + w / 2 - 0.3, Math.max(az, bz) + w / 2 - 0.3], weight: 1.5, market: 0.5, kind: 'street' }); }
  rects.push({ r: [SEC_COURT[0] + 3, SEC_COURT[1] + 2, SEC_COURT[2] - 3, SEC[1] - 5.5], weight: 2.2, market: 0.8, kind: 'street' });
  rects.push({ r: [CAFE[0] + 2, CAFE[3] + 0.5, CAFE[2] - 2, CAFE[3] + 2.2], weight: 1.6, market: 1.6, kind: 'street' });
  void SQUARE; void KARLSPLATZ; void paving;
  return { rects, links: [], clip: RADIUS - 40 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

// ── who walks ────────────────────────────────────────────────────────────────
const CL = { grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', red: 'cloth_red', green: 'cloth_green', blue: 'cloth_blue', indigo: 'cloth_indigo', maroon: 'cloth_maroon', ochre: 'cloth_ochre' };
export const WALKERS = [
  { id: 'herr', weight: 1.5, market: 1.1, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'collar', arms: 'hang', beard: 0.6 }, wet: 'cloak',
    c1: [CL.black, CL.grey, CL.brown, CL.black], c2: [CL.black, CL.grey], c3: [CL.black, CL.grey, CL.brown], speed: [1.0, 1.35], stride: 1.5 },
  { id: 'dame', weight: 1.4, market: 1.5, el: { dress: 'robe', hair: 'bun', hat: 'brim', over: 'cape', arms: 'hang' }, wet: 'cloak', swing: 0.6,
    c1: [CL.maroon, CL.green, CL.indigo, CL.grey, CL.black, CL.blue, CL.white], c2: [CL.black, CL.grey, CL.white], c3: [CL.black, CL.maroon, CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.96] },
  { id: 'officer', weight: 0.5, market: 0.7, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'belt', arms: 'hang', beard: 0.6 }, wet: 'cloak',
    c1: [CL.grey, 'prussian_blue'], c2: [CL.red, CL.grey], c3: [CL.black], speed: [1.0, 1.3], stride: 1.55 },
  { id: 'student', weight: 0.7, market: 0.8, el: { dress: 'trousers', hair: 'short', hat: 'cap', over: 'collar', carry: 'basket', arms: 'hang' }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.black, CL.grey], c3: [CL.black, CL.brown], speed: [1.2, 1.5], stride: 1.5 },
  { id: 'marktfrau', weight: 1.0, market: 3.0, el: { dress: 'robe', hair: 'bun', hat: 'none', over: 'shawl', carry: 'basket', arms: 'hang' }, wet: 'cloak', swing: 0.5,
    c1: [CL.indigo, CL.red, CL.brown, CL.green, CL.maroon], c2: [CL.white, CL.grey], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.96] },
  { id: 'arbeiter', weight: 1.1, market: 0.9, el: { dress: 'trousers', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang', beard: 0.5 }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.ochre, CL.indigo], c2: [CL.brown, CL.grey, CL.black], c3: [CL.brown, CL.grey, CL.black], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'zeitungsbub', weight: 0.5, market: 1.0, el: { dress: 'trousers', hair: 'short', hat: 'cap', arms: 'hang' },
    c1: [CL.brown, CL.grey, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.grey, CL.brown, CL.red], speed: [1.3, 1.8], stride: 1.0, h: [0.62, 0.72], swing: 1.1 },
  { id: 'wachmann', weight: 0.35, market: 0.8, el: { dress: 'trousers', hair: 'short', hat: 'brim', over: 'belt', arms: 'hang', beard: 0.7 }, wet: 'cloak',
    c1: [CL.black, 'prussian_blue'], c2: [CL.black], c3: [CL.black], speed: [0.95, 1.15], stride: 1.55 },
  { id: 'trager', weight: 0.7, market: 1.4, el: { dress: 'trousers', hair: 'short', hat: 'cap', carry: 'sack', arms: 'sack', beard: 0.3 },
    c1: [CL.brown, CL.grey, CL.ochre, CL.white], c2: [CL.brown, CL.black], c3: [CL.brown, CL.grey], speed: [1.0, 1.25], stride: 1.15 },
];
export const CREW = {};
export function walkerShapes(sb) {
  for (const k of WALKERS) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    if (wet) el.over = 'cloak';
    addFigure(sb, v, figure, el, { far });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* none */ }
