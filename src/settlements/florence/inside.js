// The people inside the houses that can be entered (docs/settlements/florence.md §5): the innkeeper behind his counter and two
// customers on the benches of the osteria, the tradesman at his counter or bench in each bottega, the wife at the hearth of
// a home with a child at the table. Positions are taken in the house's own frame as casa-open.js lays it out (u along the front
// from its right-hand corner, v inward; the floor at 0.15 m), so the room's furniture and these people agree. Pure data for the 'life' style.

import { RADIUS } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const T = 0.4, FY = 0.15;
/** The bench of a trade's counter or bench: its v (in from the front) and how far behind it the worker stands. */
const WORK = { cloth: [0.45, 0.8], wine: [0.4, 0.8], bread: [-1, 0.85], spice: [0.45, 0.8], leather: [0.45, 1.15], smith: [0.4, 0.75], goldsmith: [0.5, 0.8], woodwork: [0.4, 1.05], candles: [-1, 0.85] };

export function insidePlans(open) {
  const rand = rng(1481), by = new Map(), TILE = 150;
  const hat = ['cap', 'cap', 'none'];
  for (const l of open) {
    const E = [], [x0, z0, x1, z1] = l.rect, f = l.front || 's', along = f === 'n' || f === 's';
    const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
    const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
    const o = P(0, 0), face = (du, dv) => { const p = P(du, dv); return Math.atan2(-(p[0] - o[0]), -(p[1] - o[1])); };
    const put = (u, v, du, dv, kind, extra = {}) => {
      const base = { t: 'figure', at: P(u, v), y: FY, rot: face(du, dv), seed: Math.floor(rand() * 1e9), skin: 'skin_light', pose: 'stand', arms: 'hang', beard: false };
      const k = {
        man: { dress: 'robe', hair: 'short', hat: hat[Math.floor(rand() * 3)], over: 'sash', cloth: ['cloth_red', 'cloth_blue', 'cloth_maroon', 'cloth_indigo'][Math.floor(rand() * 4)], cloth2: 'cloth_black', h: 1.68 },
        worker: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'apron', cloth: ['cloth_grey', 'cloth_brown', 'cloth_indigo'][Math.floor(rand() * 3)], cloth2: 'cloth_white', h: 1.66 },
        woman: { dress: 'robe', hair: 'bun', hat: 'none', over: 'shawl', cloth: ['cloth_maroon', 'cloth_green', 'cloth_blue', 'cloth_ochre'][Math.floor(rand() * 4)], cloth2: 'cloth_white', h: 1.54 },
        child: { dress: 'tunic', legs: 'hose', hair: 'short', hat: 'none', over: 'none', cloth: 'cloth_ochre', cloth2: 'cloth_white', child: true },
      }[kind];
      E.push({ ...base, ...k, ...extra });
    };
    if (l.use === 'inn') {
      // the first table of the osteria (u 1.6, v 0.38 D and 0.62 D): a pair of customers on its benches, facing each other across it; the keeper behind the counter on the east wall
      const u = 1.6, v = D * 0.38;
      if (u < L - 1.8 && v < D - 1.4) { put(u - 0.3, v + 0.55, 0, -1, 'man', { pose: 'sit' }); put(u + 0.3, v - 0.55, 0, 1, 'worker', { pose: 'talk', arms: 'talk' }); }
      put(L - T - 1.55, D * 0.5, 1, 0, 'worker', { cloth: 'cloth_white' });
    } else if (l.use === 'home') {
      const hu = L - 1.6 > 2 ? L - 1.6 : L / 2;
      put(hu, D - T - 1.35, 0, 1, 'woman');
      put(L / 2 - 0.9, D * 0.45, 1, 0, 'man', { pose: 'sit' });
      put(L / 2 + 0.95, D * 0.45 + 0.1, -1, 0, 'child', { pose: 'sit' });
    } else if (WORK[l.use]) {
      const [cv, behind] = WORK[l.use], v = cv < 0 ? T + 1.2 + behind : D * cv + behind;
      if (v < D - T - 0.7) put(L * 0.5, v, 0, -1, 'worker', { arms: l.use === 'smith' || l.use === 'woodwork' || l.use === 'goldsmith' ? 'talk' : 'hang' });
    }
    const k = `${Math.floor(((x0 + x1) / 2 + TILE / 2) / TILE)},${Math.floor(((z0 + z1) / 2 + TILE / 2) / TILE)}`;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(...E);
  }
  // in the houses' own tiles (town.js), shown as near as the houses' interiors are
  return [...by].map(([k, elements]) => { const [i, j] = k.split(',').map(Number); return { id: `florence-inside-${k}`, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements, center: [i * TILE, j * TILE], near: 220 - 50 * Math.SQRT2 + (TILE / 2) * Math.SQRT2 }; });
}
