import { openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The houses and palaces of the streets (docs/settlements/florence.md §5).
import { RADIUS, lots } from './layout.js';

// The houses in two levels of detail as src/settlements/lod.js makes them, but in tiles of TILE m
// rather than 100 m: every house wears one of six stuccoes, so each tile costs a mesh per stucco per
// level, and fewer, larger tiles leave room in the mesh budget for the landmarks (DESIGN §8). The
// near distance grows with the tile so that the full houses still reach as far round the walker as
// before (220 m less the half-diagonal of a 100 m tile).
const TILE = 150, NEAR = 220 - 50 * Math.SQRT2 + (TILE / 2) * Math.SQRT2;
function tiles(id, style, elements) {
  const by = new Map();
  for (const e of elements) {
    const x = (e.rect[0] + e.rect[2]) / 2, z = (e.rect[1] + e.rect[3]) / 2;
    const k = `${Math.floor((x + TILE / 2) / TILE)},${Math.floor((z + TILE / 2) / TILE)}`;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of by) {
    const [i, j] = k.split(',').map(Number), center = [i * TILE, j * TILE];
    const base = { style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, center };
    plans.push({ ...base, id: `${id}-${k}`, near: NEAR, elements: list });
    plans.push({ ...base, id: `${id}-${k}-far`, far: NEAR, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}

export async function houses() {
  const all = lots(), open = openLots(all, [ARRIVALS['florence'][0], ARRIVALS['florence'][2]]);
  // the three houses nearest the arrival can be entered (the vernacular builder's furnished ground storey); the rest are Florence's own
  const mine = all.filter((l) => !open.has(l)).map((l) => ({ t: 'casa', ...l }));
  const enter = all.filter((l) => open.has(l)).map((l) => ({ t: 'house_med', variant: 'tuscan', ...l, kind: undefined, open: true, use: open.get(l) }));
  return [...tiles('florence-houses', 'renaissance', mine), ...(enter.length ? tiles('florence-open', 'vernacular', enter) : [])];
}
