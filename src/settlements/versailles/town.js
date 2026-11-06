import { lodTiles, openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The town (docs/settlements/versailles.md §5); the court in the gardens (§5a): courtiers walking and talking on
// the terrace before the garden front and down the walk between the basins of the water parterre, others at the
// Latona basin; on the Grand Canal the gondolas sent by Venice (1674) with their gondoliers, and the King's rowing boats.
import { RADIUS, RISE, LATONA, LATONA_Y, CANAL, lots } from './layout.js';
const base = (id, elements, style = 'vernacular') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [180, 0], facing: 'w' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));       // a figure faces −z when rot = 0

function court() {
  const rand = rng(1690), L = [];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const COATS = ['cloth_red', 'cloth_indigo', 'cloth_brown', 'cloth_green', 'cloth_grey', 'cloth_black'], GOWNS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_grey'];
  const man = (at, y, rot, pose = 'stand') => L.push({ t: 'figure', at, y, rot, h: 1.66 + rand() * 0.12, seed: Math.floor(rand() * 1e9), dress: 'tunic', cloth: pick(COATS), cloth2: 'cloth_white', skin: 'skin_light', hat: 'brim', hatMat: 'cloth_black', pose });
  const lady = (at, y, rot, pose = 'stand') => L.push({ t: 'figure', at, y, rot, h: 1.55 + rand() * 0.1, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(GOWNS), cloth2: pick(['cloth_white', 'cloth_ochre']), skin: 'skin_light', hat: 'none', pose });
  const group = (c, y, n) => {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rand() * 0.6, p = [c[0] + Math.cos(a) * 0.75, c[1] + Math.sin(a) * 0.75];
      (k % 2 ? lady : man)(p, y, face(p, c), k === 0 ? 'talk' : 'stand');
    }
  };
  // the terrace before the garden front
  for (const z of [-38, -21, -6, 12, 29, 44]) group([-7.5 - rand() * 2.5, z + rand() * 3], RISE + 0.04, 2 + Math.floor(rand() * 2));
  // strolling down the walk between the two basins, toward Latona (kept off the axis, clear of the arrival's view)
  for (let k = 0; k < 6; k++) { const p = [-46 + k * 5 + rand() * 2, (k % 2 ? 1 : -1) * (2.5 + rand() * 0.7)]; (k % 3 === 1 ? lady : man)(p, RISE + 0.04, face(p, [p[0] - 5, p[1]])); }
  // round the Latona basin
  for (const a of [0.4, 2.2, 3.6, 5.1]) { const c = [LATONA[0] + Math.cos(a) * 17.5, LATONA[1] + Math.sin(a) * 17.5]; group(c, LATONA_Y, 2); }
  return base('versailles-court', L, 'life');
}

function canal() {
  const L = [], y = -1.05, X = CANAL.x0 - 14;
  // two gondolas along the canal, a gondolier standing at each stern; two of the King's rowing boats
  for (const [x, z, rot] of [[X, -7, Math.PI / 2], [X - 6, 9, -Math.PI / 2 + 0.2]]) {
    L.push({ t: 'boat', kind: 'gondola', at: [x, z], y, rot });
    const s = 4.2, c = Math.cos(rot), sn = Math.sin(rot);
    L.push({ t: 'figure', at: [x + s * sn, z + s * c], y: y + 0.32, rot: rot + Math.PI, h: 1.7, seed: 77 + Math.round(x), dress: 'tunic', cloth: 'cloth_black', cloth2: 'cloth_white', skin: 'skin_medium', hat: 'cap', hatMat: 'cloth_red', pose: 'stand' });
    L.push({ t: 'oar', at: [x + (s + 0.6) * sn, z + (s + 0.6) * c], y: y + 0.6, rot: rot + Math.PI / 2 });
  }
  L.push({ t: 'boat', kind: 'rowboat', len: 6, at: [X + 6, 13], y, rot: Math.PI / 2 - 0.15 });
  L.push({ t: 'boat', kind: 'rowboat', len: 6, at: [X - 4, -14], y, rot: Math.PI / 2 + 0.3 });
  return base('versailles-canal-boats', L, 'life');
}

export async function houses() {
  const all = lots(), plans = [], open = openLots(all, [ARRIVALS['versailles'][0], ARRIVALS['versailles'][2]]);
  plans.push(...lodTiles('versailles-houses', 'vernacular', all.map((l) => ({ t: 'house_med', variant: 'french', ...l, ...(open.has(l) ? { open: true, use: open.get(l) } : {}) })), { R: RADIUS }));
  return [...plans, court(), canal()];
}
