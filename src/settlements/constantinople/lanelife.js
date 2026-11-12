// The fronts of the lanes dressed at eye level (docs/settlements/constantinople.md §11): before the tenements' ground
// floors of the first hill's grid the things of daily use stand against the wall: amphorae and water pots by the door,
// a stone bench with someone sitting on it, a stack of firewood, barrels, sacks, baskets, a cat on a step, a woman at her
// door, a man resting. Life-style plans in 160 m tiles, near the viewer only (as town.js's houses).

import { RADIUS, lots, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TILE = 160, NEAR = 120, PEOPLE = 150;

export function laneLife() {
  const E = [];
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, d = Math.hypot(cx, cz);
    if (d > 210 || x1 - x0 < 8) continue;
    const r = rng(l.seed + 91), pick = (a) => a[Math.floor(r() * a.length)], s = l.front === 's' ? 1 : -1, zf = s > 0 ? z1 + 0.55 : z0 - 0.55;
    const X = () => x0 + 1.4 + r() * (x1 - x0 - 2.8), Y = (x) => height(x, zf), sd = () => Math.floor(r() * 1e9);
    const rot = s > 0 ? 0 : Math.PI;                                          // faces the lane
    if (r() < 0.55) { const x = X(); for (const q of [0, 0.5, 0.95].slice(0, 2 + (r() < 0.5 ? 1 : 0))) E.push({ t: 'pot', kind: pick(['amphora', 'water_pot', 'amphora']), at: [x + q, zf + s * 0.1 * q], y: Y(x), n: 1, seed: sd() }); }
    if (r() < 0.3) { const x = X(); E.push({ t: 'bench', at: [x, zf + s * 0.25], y: Y(x), rot: 0, len: 1.8, mat: 'limestone', seed: 1 });
      if (d < PEOPLE && r() < 0.7) E.push({ t: 'figure', at: [x + (r() - 0.5) * 0.6, zf + s * 0.35], y: Y(x) + 0.02, rot: rot + Math.PI, seed: sd(), skin: 'skin_light', pose: 'sit', ...(r() < 0.4 ? { dress: 'robe', hat: 'veil', cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo']) } : { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_ochre']), hat: 'none' }) }); }
    if (r() < 0.22) { const x = X(); E.push({ t: 'firewood', at: [x, zf + s * 0.1], y: Y(x), rot: 0, len: 1.4, seed: sd() }); }
    if (r() < 0.2) { const x = X(); E.push({ t: 'barrel', at: [x, zf + s * 0.1], y: Y(x), n: 2, seed: sd() }); }
    if (r() < 0.22) { const x = X(); E.push(r() < 0.5 ? { t: 'sacks', at: [x, zf + s * 0.2], y: Y(x), rot, seed: sd() } : { t: 'basket', at: [x, zf + s * 0.2], y: Y(x), seed: sd() }); }
    if (r() < 0.08) { const x = X(); E.push({ t: 'animal', kind: 'cat', at: [x, zf + s * 0.1], y: Y(x), rot: r() * 6, seed: sd() }); }
    if (d < PEOPLE && r() < 0.3) { const x = X(); E.push({ t: 'figure', at: [x, zf + s * 1.1], y: Y(x), rot: r() < 0.5 ? rot : rot + Math.PI, seed: sd(), skin: 'skin_light', pose: r() < 0.4 ? 'talk' : 'stand', ...(r() < 0.5 ? { dress: 'robe', hat: 'veil', cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo']), carry: r() < 0.3 ? 'basket' : undefined } : { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_white']), hat: r() < 0.2 ? 'cap' : 'none' }) }); }
  }
  return E;
}

export function laneLifePlans() {
  const tiles = new Map();
  for (const e of laneLife()) {
    const k = `${Math.floor(e.at[0] / TILE)},${Math.floor(e.at[1] / TILE)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of tiles) {
    const [i, j] = k.split(',').map(Number);
    plans.push({ id: `constantinople-lane-life-${k}`, center: [(i + 0.5) * TILE, (j + 0.5) * TILE], near: NEAR, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: list, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-150, 110], facing: 'e' } });
  }
  return plans;
}
