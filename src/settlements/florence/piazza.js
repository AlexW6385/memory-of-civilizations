// The Piazza del Duomo about 1480 — the people and the market of the square (docs/settlements/florence.md §10):
// knots of citizens in the lucco and the berretto talking before the Baptistery, friars of the four orders,
// women with baskets and children, porters, a few stalls under cloth awnings with their sellers, a donkey
// cart. Pure data for the 'life' style (src/objects/life.js); placed from layout.js, nothing hard-coded
// beyond the arrival it must keep clear of.

import { ARRIVALS } from '../../planet/arrivals.js';
import { PIAZZA_DUOMO, BAPTISTERY, CAMPANILE, DUOMO, inRect } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CL = ['cloth_black', 'cloth_red', 'cloth_blue', 'cloth_indigo', 'cloth_brown', 'cloth_grey', 'cloth_green', 'cloth_ochre', 'cloth_maroon', 'cloth_white'];
// what stands in the square and must be kept clear: the Baptistery, the campanile, the cathedral's front and body
const SOLID = [
  [BAPTISTERY[0] - 15, BAPTISTERY[1] - 15, BAPTISTERY[0] + 15, BAPTISTERY[1] + 15],
  [CAMPANILE[0] - 10, CAMPANILE[1] - 10, CAMPANILE[0] + 10, CAMPANILE[1] + 10],
  [DUOMO.c[0] - DUOMO.nave - 28, -86, DUOMO.c[0] + 60, -34],
];
const faceTo = (dx, dz) => Math.atan2(-dx, -dz);

export function piazzaPlans() {
  const rand = rng(1480), pick = (a) => a[Math.floor(rand() * a.length)], A = ARRIVALS['florence'];
  const [x0, z0, x1, z1] = PIAZZA_DUOMO, E = [];
  const free = (x, z, m = 1.5) => inRect([x0 + 2, z0 + 2, x1 - 2, z1 - 2], x, z) && !SOLID.some((r) => inRect(r, x, z, m)) && Math.hypot(x - A[0], z - A[2]) > 6;
  const spot = (near) => {
    for (let k = 0; k < 80; k++) {
      const a = rand() * 6.283, r = near ? 8 + rand() * 62 : 20 + rand() * 120;
      const x = near ? A[0] + Math.cos(a) * r : x0 + 4 + rand() * (x1 - x0 - 8), z = near ? A[2] + Math.sin(a) * r : z0 + 4 + rand() * (z1 - z0 - 8);
      if (free(x, z)) return [x, z];
    }
    return null;
  };
  // the kinds of people (dossier §10): rot is set by the group
  const KINDS = [
    () => ({ dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', cloth: pick(['cloth_red', 'cloth_black', 'cloth_blue', 'cloth_maroon', 'cloth_indigo']), cloth2: pick(['cloth_black', 'cloth_white']), h: 1.68 + rand() * 0.1 }),
    () => ({ dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'belt', cloth: pick(CL), cloth2: pick(['cloth_red', 'cloth_blue', 'cloth_white', 'cloth_green']), h: 1.62 + rand() * 0.12 }),
    () => ({ dress: 'robe', hair: 'bun', hat: 'none', over: 'shawl', cloth: pick(['cloth_maroon', 'cloth_green', 'cloth_blue', 'cloth_ochre', 'cloth_red']), cloth2: 'cloth_white', h: 1.52 + rand() * 0.08, carry: rand() < 0.4 ? 'basket' : 'none' }),
    () => ({ dress: 'tunic', legs: 'hose', hair: 'short', hat: 'cap', over: 'apron', cloth: pick(['cloth_grey', 'cloth_brown', 'cloth_indigo']), cloth2: 'cloth_white', h: 1.66 }),
    () => ({ dress: 'robe', hair: 'short', hat: 'none', over: 'sash', cloth: pick(['cloth_white', 'cloth_brown', 'cloth_grey']), cloth2: pick(['cloth_black', 'cloth_brown']), h: 1.7 }),
  ];
  const person = (x, z, rot, kind, extra = {}) => E.push({ t: 'figure', at: [x, z], y: 0, rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.85 ? 'skin_light' : 'skin_medium', pose: 'stand', arms: 'hang', ...KINDS[kind](), ...extra });
  // knots of two to four talking
  for (let g = 0; g < 26; g++) {
    const c = spot(g < 17); if (!c) continue;
    const n = 2 + Math.floor(rand() * 3), a0 = rand() * 6.283, r = 0.8 + rand() * 0.3;
    for (let k = 0; k < n; k++) {
      const a = a0 + (k / n) * 6.283, x = c[0] + Math.cos(a) * r, z = c[1] + Math.sin(a) * r;
      person(x, z, faceTo(c[0] - x, c[1] - z), rand() < 0.3 ? 2 : pick([0, 1, 1, 3, 4]), { pose: k % 2 ? 'stand' : 'talk', ...(rand() < 0.5 ? { arms: 'talk' } : {}) });
    }
  }
  // singles going about: porters, friars, women with baskets
  for (let k = 0; k < 14; k++) {
    const c = spot(k < 10); if (!c) continue;
    const rot = rand() * 6.283, kind = [4, 2, 3, 1, 2][k % 5];
    person(c[0], c[1], rot, kind, k % 7 === 0 ? { carry: 'pole', arms: 'pole', dress: 'tunic', legs: 'hose', hat: 'cap', cloth: pick(['cloth_grey', 'cloth_brown']) } : k % 4 === 1 ? { carry: 'sack' } : {});
  }
  // children at play
  for (let k = 0; k < 4; k++) { const c = spot(true); if (!c) continue; for (let j = 0; j < 2; j++) E.push({ t: 'figure', at: [c[0] + j * 0.9, c[1] + rand() * 0.5], y: 0, rot: rand() * 6.283, seed: Math.floor(rand() * 1e9), child: true, pose: 'stand', dress: 'tunic', legs: 'hose', skin: 'skin_light', cloth: pick(['cloth_ochre', 'cloth_green', 'cloth_red', 'cloth_blue']), cloth2: 'cloth_white', hat: 'none', over: 'none' }); }
  // the market along the Baptistery's side and the north edge: stalls with their sellers and a buyer each
  const stalls = [];
  for (let k = 0; k < 9; k++) {
    let c = null;
    for (let t = 0; t < 60 && !c; t++) { const s = spot(true); if (s && !stalls.some((q) => Math.hypot(q[0] - s[0], q[1] - s[1]) < 7) && Math.hypot(s[0] - A[0], s[1] - A[2]) > 9) c = s; }
    if (!c) continue;
    stalls.push(c);
    const toward = Math.atan2(A[0] - c[0], A[2] - c[1]) + (rand() - 0.5) * 1.2;       // the front turned to the walker's side
    const fx = Math.sin(toward), fz = Math.cos(toward);
    E.push({ t: 'stall', at: c, y: 0, rot: toward, awning: pick(['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_green']), stripe: rand() < 0.5 ? 'cloth_white' : null, goods: pick([['produce', 'basket'], ['cloth'], ['basket', 'produce', 'jar'], ['jar', 'basket']]), seed: Math.floor(rand() * 1e9) });
    person(c[0] - fx * 1.1, c[1] - fz * 1.1, toward + Math.PI, 3, { pose: 'talk', arms: 'talk' });                     // the seller behind
    person(c[0] + fx * 1.7, c[1] + fz * 1.7, toward, rand() < 0.6 ? 2 : 1, { pose: 'stand' });                       // a buyer in front
  }
  // a donkey cart with sacks, a handcart with baskets, sacks and crates by the stalls
  const cs = spot(true);
  if (cs) { E.push({ t: 'cart', kind: 'two', load: 'sacks', beast: 'donkey', at: cs, y: 0, rot: rand() * 6.283, seed: 71 }); person(cs[0] + 2.6, cs[1] + 1.2, 2.2, 3, { carry: 'staff' }); }
  const ch = spot(true);
  if (ch) E.push({ t: 'handcart', load: 'baskets', at: ch, y: 0, rot: rand() * 6.283, seed: 72 });
  for (const s of stalls) { E.push({ t: 'crates', at: [s[0] + 1.9, s[1] - 0.8], rot: rand() * 3, seed: Math.floor(rand() * 99) }); E.push({ t: 'basket', at: [s[0] - 1.8, s[1] + 0.6], y: 0, rot: rand() * 6, s: 0.9, seed: Math.floor(rand() * 99) }); }
  const bounds = [x0 - 4, z0 - 4, x1 + 4, z1 + 4];
  return [{ id: 'florence-piazza-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds, rooms: [], elements: E, center: [(x0 + x1) / 2, (z0 + z1) / 2], near: 260 }];
}
