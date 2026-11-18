// The things of use standing in the streets of Florence about 1480 (docs/settlements/florence.md §12): the public wells with
// their pulleys, benches of stone against the house fronts, stacks of firewood, the wine merchants' barrels, a handcart left
// at a wall, crates and sacks, pigeons on the paving. They stand against the wall at the slit between two lots (never in front of
// a door), one in about every sixth lot away from the arrival, chosen by rule from the lot's own seed. Pure data for the 'life' style.

import { ARRIVALS } from '../../planet/arrivals.js';
import { RADIUS, lots } from './layout.js';
import { enterable, upper } from './town.js';

const TILE = 150, NEAR = 220 - 50 * Math.SQRT2 + (TILE / 2) * Math.SQRT2;
const OFF = 0.7;

export function streetPlans() {
  const A = ARRIVALS['florence'], by = new Map(), all = lots(), open = enterable(all);
  let n = 0;
  all.forEach((l, i) => {
    const [x0, z0, x1, z1] = l.rect, f = l.front, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (Math.hypot(cx - A[0], cz - A[2]) < 22 || (l.seed * 7 + i) % 6 !== 0) return;
    if (open.has(l) && upper(l)) return;   // (the way to a door that is walked up from is kept clear)
    // the wall's foot at the lot's low end along the street, OFF out into the street
    const horiz = f === 'n' || f === 's', rot = horiz ? 0 : Math.PI / 2;
    const at = f === 's' ? [x0 + 1.1, z1 + OFF] : f === 'n' ? [x0 + 1.1, z0 - OFF] : f === 'e' ? [x1 + OFF, z0 + 1.1] : [x0 - OFF, z0 + 1.1];
    const kind = (l.seed >> 3) % 8, seed = l.seed % 997, E = [];
    const along = (d) => (horiz ? [at[0] + d, at[1]] : [at[0], at[1] + d]);
    // (the item and its facing: the street side is the one the lot's front looks to)
    const toStreet = f === 's' ? 0 : f === 'n' ? Math.PI : f === 'e' ? Math.PI / 2 : -Math.PI / 2;
    if (kind === 0) E.push({ t: 'well', kind: 'pulley', mat: 'limestone', at: [at[0] + (f === 'e' ? 0.3 : f === 'w' ? -0.3 : 0), at[1] + (f === 's' ? 0.3 : f === 'n' ? -0.3 : 0)], y: 0, rot: toStreet, seed, mould: true });
    else if (kind === 1) E.push({ t: 'barrel', at: along(0.9), y: 0, rot, seed, n: 3 });
    else if (kind === 2) E.push({ t: 'firewood', at: along(1.0), y: 0, rot, seed, len: 1.75 });
    else if (kind === 3) E.push({ t: 'handcart', at: along(1.1), y: 0, rot: rot + Math.PI / 2, seed, load: ['sacks', 'baskets', 'crates', 'baskets'][seed % 4] });
    else if (kind === 4) { E.push({ t: 'sacks', at: along(0.6), rot: seed * 0.1, seed }); E.push({ t: 'crates', at: along(1.9), rot: 0.2 * (seed % 5), seed: seed + 1 }); }
    else if (kind === 5) E.push({ t: 'bench', at: along(1.2), y: 0, rot, seed, len: 2.4, mat: 'limestone_yellow' });
    else if (kind === 6) E.push({ t: 'chickens', kind: 'pigeon', at: along(2.0), n: 5, rot: 0.3 * (seed % 7), seed });
    else E.push({ t: 'stool', at: along(0.8), y: 0, rot: toStreet, seed }, { t: 'basket', at: along(1.4), y: 0, rot: 0, seed });
    const k = `${Math.floor((cx + TILE / 2) / TILE)},${Math.floor((cz + TILE / 2) / TILE)}`;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(...E); n++;
  });
  void n;
  return [...by].map(([k, elements]) => { const [i, j] = k.split(',').map(Number); return { id: `florence-streetlife-${k}`, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements, center: [i * TILE, j * TILE], near: NEAR }; });
}
