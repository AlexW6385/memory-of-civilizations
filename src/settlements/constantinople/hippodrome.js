// The crowd of the Hippodrome (docs/settlements/constantinople.md §4.1, §10): the factions in their stands, each in its colour — the
// Blues and the Greens (the two great ones) facing each other across the track, the Reds and the Whites toward the carceres —
// standing on the tiers of the stadium (src/styles/roman/town.js `stadium`: 12 rows of 1.7 m), shouting; and, by the starting gates,
// grooms with the horses and the charioteers in their faction tunics. Static life in a near-only plan (the Hippodrome is ~260 m from the arrival).

import { HIPPODROME, RADIUS, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const T = 26, ROWS = 12, H = 18, FD = Math.min(5.4, T * 0.3), SD = T - FD;

export function crowd() {
  const [x0, z0, x1, z1] = HIPPODROME, ax0 = x0 + T, ax1 = x1 - T, rand = rng(532), E = [];
  const pod = Math.min(2.2, H * 0.12), T2 = H - 2, rowTop = (i) => pod + (T2 - pod) * (i + 1) / ROWS;
  const FACTION = { blue: ['cloth_indigo', 'cloth_white'], green: ['cloth_green', 'cloth_white'], red: ['cloth_red', 'cloth_white'], white: ['cloth_white', 'cloth_grey'] };
  const section = (side, zA, zB, faction, rows) => {
    const [c1, c2] = FACTION[faction];
    for (const i of rows) {
      const xm = side < 0 ? ax0 - SD * (i + 0.5) / ROWS : ax1 + SD * (i + 0.5) / ROWS;
      for (let z = zA + rand() * 1.5; z < zB; z += 2.7 + rand() * 1.6) {
        if (rand() < 0.18) continue;
        const woman = rand() < 0.12, p = [xm + (rand() - 0.5) * 0.5, z];
        E.push({ t: 'figure', at: p, y: height(p[0], p[1]) + rowTop(i), rot: side < 0 ? -Math.PI / 2 : Math.PI / 2, seed: Math.floor(rand() * 1e9), skin: rand() < 0.8 ? 'skin_light' : 'skin_medium',
          ...(woman ? { dress: 'robe', hat: 'veil', cloth: c1 } : { dress: 'tunic', legs: 'hose', cloth: c1, cloth2: c2, hat: rand() < 0.15 ? 'cap' : 'none' }), pose: rand() < 0.45 ? 'talk' : 'stand' });
      }
    }
  };
  const zN = z0 + FD;
  section(-1, zN + 70, zN + 120, 'green', [5, 6, 7, 8]);        // the Greens, the west stand
  section(1, zN + 70, zN + 120, 'blue', [5, 6, 7, 8]);          // the Blues, opposite
  section(-1, zN + 8, zN + 50, 'white', [4, 5, 6]);
  section(1, zN + 8, zN + 50, 'red', [4, 5, 6]);
  // the carceres: grooms with the teams, charioteers in the colours of the factions
  const cx = (ax0 + ax1) / 2, zc = z0 + T + 4;
  [['blue', -16], ['green', -8], ['red', 8], ['white', 16]].forEach(([f, dx], k) => {
    const [c1, c2] = FACTION[f], x = cx + dx, z = zc + 3.5;
    E.push({ t: 'animal', kind: 'horse', at: [x - 0.9, z], y: 0, rot: Math.PI, seed: 600 + k * 2, gear: true }, { t: 'animal', kind: 'horse', at: [x + 0.9, z], y: 0, rot: Math.PI, seed: 601 + k * 2, gear: true });
    E.push({ t: 'figure', at: [x, z - 3.4], y: 0, rot: Math.PI, seed: 700 + k, skin: 'skin_light', dress: 'tunic', legs: 'hose', cloth: c1, cloth2: c2, hat: 'cap', over: 'sash', pose: 'stand' });
    E.push({ t: 'figure', at: [x + 2.3, z - 0.6], y: 0, rot: Math.PI / 2, seed: 800 + k, skin: 'skin_medium', dress: 'tunic', legs: 'hose', cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'none', pose: 'talk' });
  });
  return E;
}
export const hippodromePlan = () => ({ id: 'constantinople-hippodrome-crowd', center: [(HIPPODROME[0] + HIPPODROME[2]) / 2, (HIPPODROME[1] + HIPPODROME[3]) / 2], near: 150, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: crowd(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-150, 110], facing: 'e' } });
