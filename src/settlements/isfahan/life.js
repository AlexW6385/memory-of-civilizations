// The square's life about 1630 (docs/settlements/isfahan.md §5, §15): horses held by grooms at both ends of the polo
// field, by the stone goalposts; the guard's horses before Ali Qapu; people at the Qeysarieh portal and on the walks.

import { RADIUS, SQUARE, CANAL, ALIQAPU } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function life() {
  const rand = rng(1630), L = [], pick = (a) => a[Math.floor(rand() * a.length)], [sx0, sz0, sx1, sz1] = SQUARE;
  /** A man in a long robe with a sash and a turban (the Qizilbash's red one now and then), or a woman wrapped and veiled. */
  const person = (at, rot, o = {}) => {
    const woman = !o.man && rand() < 0.25;
    L.push({ t: 'figure', at, y: 0.04, rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.8 ? 'skin_medium' : 'skin_light', dress: 'robe',
      ...(woman ? { cloth: pick(['cloth_black', 'cloth_indigo', 'cloth_white']), cloth2: 'cloth_white', hat: 'veil', hair: 'long' }
        : { cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_brown']), cloth2: pick(['cloth_white', 'cloth_ochre', 'cloth_red']), over: 'sash', hat: 'turban', hatMat: rand() < 0.3 ? 'cloth_red' : pick(['cloth_white', 'cloth_ochre']), hair: 'short', beard: true }),
      pose: rand() < 0.3 ? 'talk' : 'stand', ...o });
  };
  // the polo field's two ends: horses held by grooms beside the goalposts, riders waiting by them
  const q0 = sz0 + CANAL, q1 = sz1 - CANAL;
  for (const [zEnd, face] of [[q0 + 14, Math.PI], [q1 - 14, 0]]) {
    for (const x of [-36, -29, -22, 22, 29, 36]) {
      const at = [x + (rand() - 0.5), zEnd + (rand() - 0.5) * 3], rot = face + (rand() - 0.5) * 0.6;
      L.push({ t: 'animal', kind: 'horse', at, y: 0.04, rot, seed: Math.floor(rand() * 1e9) });
      person([at[0] + 0.9, at[1] + (face ? -0.6 : 0.6)], rot, { man: true, pose: 'stand' });
      if (rand() < 0.5) person([at[0] - 1.1, at[1]], rot + Math.PI / 2, { man: true, pose: 'talk' });
    }
  }
  // the guard's horses before Ali Qapu
  const ax = ALIQAPU.rect[2] + 7;
  for (const z of [-48, -44, -36, -32]) { L.push({ t: 'animal', kind: 'horse', at: [ax, z], y: 0.04, rot: -Math.PI / 2, seed: Math.floor(rand() * 1e9) }); person([ax + 0.8, z + 0.7], -Math.PI / 2, { man: true, cloth: 'cloth_red', hatMat: 'cloth_red' }); }
  // people before the Qeysarieh portal and along the walks by the arcades
  for (let k = 0; k < 10; k++) person([(rand() - 0.5) * 24, sz0 + 3 + rand() * 7], rand() * 6.28);
  for (let k = 0; k < 16; k++) { const side = rand() < 0.5 ? sx0 + 3 + rand() * 6 : sx1 - 3 - rand() * 6; person([side, sz0 + 30 + rand() * (sz1 - sz0 - 60)], rand() < 0.5 ? 0 : Math.PI); }
  return L;
}
export const lifePlan = () => ({ id: 'isfahan-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -150], facing: 's' } });
