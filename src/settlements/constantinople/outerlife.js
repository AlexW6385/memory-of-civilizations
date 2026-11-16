// The outer lanes' street life (docs/settlements/constantinople.md §4.11): beyond the first 120 m of the arrival point the lanes had
// little but their own fronts. At the east end of some rows of houses (the wall of the row on one side of a cross lane) a street
// stall stands against the wall under an awning with its keeper and a buyer, at others a street well with its windlass and
// a woman with her water jars, at others a niche fountain (town.js); a donkey with its load and a porter wait at the corners.
// Life-style plans in 160 m tiles, near the viewer only (as lanelife.js).

import { RADIUS, lots, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TILE = 160, NEAR = 150, MIN = 120, ARRIVAL = [-10, 86];
const WARES = [['bread', 'baskets'], ['heap', 'melons'], ['greens', 'baskets'], ['pottery', 'baskets'], ['bolts', 'bolts'], ['fish', 'heap'], ['spice', 'bread']];
const AW = ['cloth_white', 'cloth_ochre', 'cloth_red', 'linen', 'cloth_indigo', 'cloth_green'];
const CL = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_brown'];

/** The rows' east ends beyond MIN of the arrival, the lane at their east side: where a stall, a well or a fountain may stand. */
export function laneEnds() {
  const out = [];
  for (const l of lots()) {
    if (l.abut.e) continue;
    const [x0, z0, x1, z1] = l.rect;
    if (z1 - z0 < 12 || Math.hypot((x1 + 2.5) - ARRIVAL[0], (z0 + z1) / 2 - ARRIVAL[1]) < MIN || Math.hypot(x1, (z0 + z1) / 2) > RADIUS - 70) continue;
    out.push({ x: x1, z0, z1, l });
  }
  return out;
}

/** Which row ends take a niche fountain (about one in ten): the stall, the well and the donkey keep to the others. */
const fountainKeys = () => { const r = rng(77), S = new Set(); for (const e of laneEnds()) if (r() < 0.1) S.add(`${e.x},${e.z0}`); return S; };

export function outerLife() {
  const FK = fountainKeys();
  const E = [], r = rng(5621), pick = (a) => a[Math.floor(r() * a.length)], sd = () => Math.floor(r() * 1e9), face = (p, q) => Math.atan2(-(q[0] - p[0]), -(q[1] - p[1]));
  const who = (at, y, rot, o = {}) => E.push({ t: 'figure', at, y, rot, seed: sd(), skin: 'skin_light', ...(r() < 0.5 ? { dress: 'robe', hat: 'veil', cloth: pick(CL) } : { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_white', 'cloth_ochre']), hat: r() < 0.2 ? 'cap' : 'none' }), pose: 'stand', ...o });
  for (const { x, z0, z1 } of laneEnds()) {
    if (FK.has(`${x},${z0}`)) continue;
    const k = r(), zc = z0 + 8 + r() * (z1 - z0 - 14), y = height(x + 1, zc);
    if (k < 0.16) {
      // a stall against the wall, its front to the lane, the keeper beside it, a buyer in front
      const at = [x + 0.55, zc];
      E.push({ t: 'stall', at, y, rot: Math.PI / 2, seed: sd(), w: 2.3, d: 0.95, awning: pick(AW), goods: pick(WARES) });
      who([x + 0.6, zc + 1.7], y, face([x + 0.6, zc + 1.7], at), { pose: r() < 0.4 ? 'sit' : 'stand' });
      if (r() < 0.7) who([x + 1.9, zc + (r() - 0.5) * 0.8], y, face([x + 1.9, zc], at), r() < 0.5 ? { pose: 'talk' } : {});
    } else if (k < 0.23) {
      // a street well with its windlass under a little roof, a woman with her jars
      const at = [x + 1.8, zc];
      E.push({ t: 'well', at, y, kind: 'windlass', mat: 'limestone', mould: true, roof: true, seed: sd() });
      who([x + 3.0, zc + 0.6], y, face([x + 3.0, zc + 0.6], at), { dress: 'robe', hat: 'veil', cloth: pick(CL), carry: 'basket' });
      E.push({ t: 'pot', kind: 'water_pot', at: [x + 2.6, zc - 1.3], y, n: 2, seed: sd() });
    } else if (k < 0.27) {
      // a porter's donkey with its load, waiting at the corner, the porter beside it
      const at = [x + 1.4, zc];
      E.push({ t: 'animal', kind: 'donkey', at, y, rot: Math.PI / 2 + (r() - 0.5) * 0.3, seed: sd(), gear: true });
      who([x + 1.4, zc + 1.6], y, Math.PI, { cloth: 'cloth_brown' });
    }
  }
  return E;
}

export function outerLifePlans() {
  const tiles = new Map();
  for (const e of outerLife()) {
    const k = `${Math.floor(e.at[0] / TILE)},${Math.floor(e.at[1] / TILE)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of tiles) {
    const [i, j] = k.split(',').map(Number);
    plans.push({ id: `constantinople-outer-life-${k}`, center: [(i + 0.5) * TILE, (j + 0.5) * TILE], near: NEAR, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: list, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-150, 110], facing: 'e' } });
  }
  return plans;
}

/** The niche fountains of the outer lanes (town.js): against the east wall of some rows' last house, facing the lane, beyond MIN of the arrival. */
export function laneFountains() {
  const FK = fountainKeys(), out = [];
  for (const { x, z0, z1 } of laneEnds()) {
    if (!FK.has(`${x},${z0}`)) continue;
    const zc = (z0 + z1) / 2, y = height(x + 1.2, zc);
    out.push({ t: 'byz_fountain', at: [x + 0.35, zc], y, rot: -Math.PI / 2, kind: 'niche' });
  }
  return out;
}
