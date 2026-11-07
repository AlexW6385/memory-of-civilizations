// The farms and the life of the valley (docs/settlements/norse-borgund.md §5, §10): the log buildings
// of the eight tun; and as still figures and objects the farm's summer work — hay being made in the
// meadows and stacked, wood cut and stacked by the doors, the sledges of the farm, hens in the yards;
// cattle, sheep, goats and horses at pasture with their herders; at the church the priest at the
// altar and a few people in the churchyard and at its gate.
import { RADIUS, CHURCH, YARD, FARMS, RIVER, height, buildings, inBuilding, inRiver, riverZ } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, elements });
const CLOTH = ['cloth_brown', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_red', 'cloth_indigo', 'hide_tan'];
const HAIR = ['hide_tan', 'hide_brown', 'hide_tan', 'hide_black'];
/** Open, gentle ground away from buildings, the river and the church's yard. */
const free = (x, z, m = 2) => !inBuilding(x, z, m) && !inRiver(x, z) && Math.abs(z - riverZ(x)) > RIVER.w / 2 + 4 && height(x, z) < 7 && Math.hypot(x, z) < RADIUS - 70
  && !(x > YARD[0] - 3 && x < YARD[2] + 3 && z > YARD[1] - 3 && z < YARD[3] + 3);

export function life() {
  const rand = rng(1251), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.55 ? 'tunic' : 'robe', cloth: CLOTH[Math.floor(rand() * CLOTH.length)], cloth2: CLOTH[Math.floor(rand() * CLOTH.length)], skin: 'skin_light', hat: rand() < 0.3 ? 'cap' : 'none', hair: rand() < 0.5 ? 'short' : 'long', hairMat: HAIR[Math.floor(rand() * HAIR.length)], beard: rand() < 0.4 ? 1 : 0, legs: 'hose', feet: 'shod', ...o });
  const beast = (kind, at, rot) => L.push({ t: 'animal', kind, at, y: height(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9) });
  const put = (t, at, o = {}) => L.push({ t, at, y: height(at[0], at[1]), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), ...o });
  const near = (c, r) => { for (let k = 0; k < 30; k++) { const a = rand() * 6.28, d = r * (0.3 + rand() * 0.7), p = [c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d]; if (free(p[0], p[1], 1.5)) return p; } return null; };
  const B = buildings();
  // at each farm: people at their work in the yard, wood stacked by the dwelling, a sledge, hens, a dog
  FARMS.forEach(([fx, fz], i) => {
    for (const b of B.filter((q) => Math.hypot((q.rect[0] + q.rect[2]) / 2 - fx, (q.rect[1] + q.rect[3]) / 2 - fz) < 20)) {
      if (b.kind === 'stue') { const p = [b.rect[0] - 0.9, (b.rect[1] + b.rect[3]) / 2]; if (free(p[0], p[1], 0.3)) put('firewood', p, { rot: Math.PI / 2, len: Math.min(2.4, b.rect[3] - b.rect[1] - 0.6) }); }
      if (b.kind === 'barn' && rand() < 0.6) { const p = [b.rect[2] + 3.4, (b.rect[1] + b.rect[3]) / 2]; if (free(p[0], p[1], 2)) put('haystack', p); }
    }
    let p = near([fx, fz], 9); if (p) fig(p, rand() * 6.28, { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
    p = near([fx, fz], 9); if (p) fig(p, rand() * 6.28, { pose: 'squat' });
    p = near([fx, fz], 12); if (p) put('chickens', p, { n: 3 + Math.floor(rand() * 4) });
    p = near([fx, fz], 14); if (p) put('sledge', p, { load: rand() < 0.5 ? 'empty' : 'bales' });
    if (i % 2 === 0) { p = near([fx, fz], 10); if (p) beast('dog', p, rand() * 6.28); }
    if (i % 3 === 0) { p = near([fx, fz], 14); if (p) put('barrel', p, { n: 2 }); }
    // water carried up from the river on the shoulder yoke; wood split at the block by the woodpile
    p = near([fx, fz], 13); if (p) fig(p, rand() * 6.28, { carry: 'yoke', dress: 'robe', hair: 'long', beard: 0 });
    if (i % 2 === 1) { p = near([fx, fz], 10); if (p) { put('firewood', [p[0] + 1.2, p[1]], { rot: 0, len: 1.6 }); fig(p, -Math.PI / 2, { pose: 'squat', dress: 'tunic' }); } }
  });
  // haymaking in the meadows by the farms: the mowers with their scythes (a pole), the rakers, the stacks rising
  for (const [fx, fz] of FARMS.filter((_, i) => i % 2 === 1)) {
    const c = [fx + (fx < 0 ? 34 : -34), fz + 6];
    for (let k = 0; k < 3; k++) { const p = near(c, 12); if (p && free(p[0], p[1], 2.5)) put('haystack', p); }
    for (let k = 0; k < 4; k++) { const p = near(c, 14); if (p) fig(p, rand() * 6.28, { carry: k < 2 ? 'pole' : 'hoe', dress: 'tunic' }); }
  }
  // cattle, sheep and goats at pasture with a herder; the farms' horses
  const herds = [[[-60, -95], 'ox', 5], [[120, -115], 'sheep', 9], [[-185, 10], 'sheep', 8], [[190, 75], 'ox', 4], [[-120, 120], 'goat', 6], [[60, 115], 'horse', 3], [[-20, 60], 'ox', 3], [[150, -10], 'horse', 2]];
  for (const [c, kind, n] of herds) {
    if (!free(c[0], c[1], 3)) continue;
    const dir = rand() * 6.28;
    for (let k = 0; k < n; k++) { const p = near(c, kind === 'sheep' ? 7 : 10); if (p) beast(kind, p, dir + (rand() - 0.5) * 1.6); }
    const h = near(c, 9); if (h) fig(h, dir + Math.PI, { carry: 'pole', dress: 'tunic' });
  }
  // at the church: the priest at the altar; people in the churchyard and at the gate
  const S = 0.85, cy = height(...CHURCH) + 0.35 * S;
  fig([CHURCH[0] + 8.0 * S, CHURCH[1]], Math.PI / 2 + Math.PI, { y: cy, dress: 'robe', cloth: 'linen', cloth2: 'cloth_white', over: 'cape', hat: 'none', hair: 'shaven', beard: 0, pose: 'stand' });
  for (const [x, z, pose] of [[-8, -12, 'talk'], [-6.6, -11.2, 'talk'], [9, -42, 'stand'], [-1.2, -4.5, 'stand'], [1.0, -3.6, 'talk']]) fig([x, z], Math.atan2(-(CHURCH[0] - x), -(CHURCH[1] - z)), { pose });
  return L;
}

export function farms() {
  return [
    base('norse-borgund-farms', 'norse', buildings().map((b) => ({ t: 'log_house', ...b, open: b.kind === 'stue' && (b.rect[2] - b.rect[0]) * (b.rect[3] - b.rect[1]) > 40 }))),
    base('norse-borgund-life', 'life', life()),
  ];
}
