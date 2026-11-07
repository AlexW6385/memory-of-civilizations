// The life of Knossos about 1600 BC (docs/settlements/knossos.md §10): the potter at his wheel in the yard by the
// Royal Road and his boy feeding the kiln; porters bringing jars up the road on their heads and a laden donkey;
// people in the West Court and the Central Court — the men in kilt or loincloth, bare above the belt, long-haired;
// the women in the long flounced skirt; a priestess before the Tripartite Shrine.

import { ROAD, height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const YARD = [-212, -86.4, -204, -81.0];

export function life() {
  const rand = rng(1601), L = [], seed = () => Math.floor(rand() * 1e9);
  const man = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_medium', dress: rand() < 0.5 ? 'shendyt' : 'loincloth',
    cloth: ['cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_indigo'][Math.floor(rand() * 4)], over: 'belt', hair: 'long', beard: 0, feet: 'bare', hat: 'none', pose: 'stand', ...o });
  const woman = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_light', dress: 'robe',
    cloth: ['cloth_indigo', 'cloth_red', 'cloth_ochre'][Math.floor(rand() * 3)], cloth2: 'cloth_white', over: 'sash', hair: rand() < 0.5 ? 'long' : 'bun', feet: 'bare', hat: 'none', pose: 'stand', ...o });
  // the potter's yard (its floor at the highest corner's ground)
  const yy = Math.max(height(YARD[0], YARD[1]), height(YARD[2], YARD[3]), height(YARD[0], YARD[3]), height(YARD[2], YARD[1])) + 0.02;
  const kx1 = YARD[0] + 2.3, wx = (kx1 + YARD[2]) / 2 + 0.3, wz = YARD[1] + 1.6;
  man([wx, wz + 0.6], 0, { y: yy, pose: 'sit_low', dress: 'loincloth', cloth: 'cloth_white' });
  man([kx1 + 0.75, YARD[3] - 1.2], Math.PI / 2, { y: yy, pose: 'squat', dress: 'loincloth', cloth: 'cloth_brown', h: 1.35, child: true });
  L.push({ t: 'firewood', at: [kx1 + 0.6, YARD[3] - 0.3], y: yy, rot: 0, seed: 3 });
  // the Royal Road: porters with jars on their heads walking toward the palace, a donkey laden with jars and its driver
  for (let x = ROAD.x0 + 40; x < ROAD.x1 - 20; x += 22 + rand() * 30) {
    const z = ROAD.z + (rand() - 0.5) * 1.6, toward = rand() < 0.65;
    if (rand() < 0.22) {
      L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: height(x, z) + 0.12, rot: toward ? -Math.PI / 2 : Math.PI / 2, seed: seed(), gear: true });
      man([x + (toward ? 1.5 : -1.5), z + 0.7], toward ? -Math.PI / 2 : Math.PI / 2, { y: height(x, z) + 0.12, carry: 'staff' });
    } else if (rand() < 0.5) woman([x, z], toward ? -Math.PI / 2 : Math.PI / 2, { y: height(x, z) + 0.12, carry: 'pot' });
    else man([x, z], toward ? -Math.PI / 2 : Math.PI / 2, { y: height(x, z) + 0.12, carry: rand() < 0.6 ? 'pot' : 'sack' });
  }
  // the West Court: people crossing it and talking by the façade
  for (let k = 0; k < 12; k++) {
    const x = -116 + rand() * 46, z = -46 + rand() * 90;
    (rand() < 0.45 ? woman : man)([x, z], rand() * 6.28, { y: 0.05, pose: rand() < 0.4 ? 'talk' : 'stand' });
  }
  // the Central Court: a few people under the porticoes and crossing; the priestess before the shrine with her offering
  for (let k = 0; k < 10; k++) {
    const x = -11 + rand() * 22, z = -23 + rand() * 46;
    if (Math.abs(x) > 9.5 || (x < -8 && z > -2 && z < 13)) continue;
    (rand() < 0.5 ? woman : man)([x, z], rand() * 6.28, { y: 0.05, pose: rand() < 0.3 ? 'talk' : 'stand' });
  }
  woman([-11.6, 6], -Math.PI / 2, { y: 0.05, cloth: 'cloth_indigo', cloth2: 'cloth_ochre', pose: 'pray' });
  for (const z of [4.6, 7.4]) L.push({ t: 'pot', kind: 'water_pot', at: [-12.6, z], y: 0.05, n: 1, seed: seed() });
  return L;
}

export const lifePlan = () => ({ id: 'knossos-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-350, -350, 350, 350], entrance: { at: [-100, 0], facing: 'e' } });
