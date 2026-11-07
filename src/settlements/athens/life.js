// The life of Athens about 410 BC (docs/settlements/athens.md §10): in Simon's house by the south-west corner of the
// Agora the shoemaker at his bench and a bearded man in his himation talking with him (Socrates came to the
// workshops round the Agora to talk); the woman of the house at the loom; the slave at the hearth; people in the
// Agora between the booths and the stoas; a man leading a donkey along the Panathenaic Way.

import { height } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export const SIMON = [-291, -107, -278, -93];

export function life() {
  const rand = rng(410), L = [], seed = () => Math.floor(rand() * 1e9);
  // the chiton under the himation (a robe with a cape-like wrap) for the citizens; the short tunic for workmen and slaves
  const citizen = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_medium', dress: 'robe',
    cloth: ['cloth_white', 'linen', 'cloth_ochre'][Math.floor(rand() * 3)], cloth2: ['cloth_white', 'cloth_brown', 'cloth_indigo', 'cloth_red'][Math.floor(rand() * 4)], over: 'cloak', hair: 'short', beard: 1, hat: 'none', pose: 'stand', ...o });
  const worker = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_medium', dress: 'tunic', legs: 'bare',
    cloth: ['cloth_brown', 'cloth_grey', 'linen', 'cloth_ochre'][Math.floor(rand() * 4)], over: 'belt', hair: 'short', beard: 0.6, hat: rand() < 0.2 ? 'cap' : 'none', feet: 'bare', pose: 'stand', ...o });
  const woman = (at, rot, o = {}) => L.push({ t: 'figure', at, y: o.y ?? height(at[0], at[1]), rot, seed: seed(), skin: 'skin_light', dress: 'robe',
    cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: rand() < 0.4 ? 'veil' : 'none', pose: 'stand', ...o });
  const [X0, Z0, X1, Z1] = SIMON;
  // the shop: Simon on his stool at the bench (facing north, the bench before him), his visitor standing by the door
  worker([X0 + 0.5 + 0.92, Z0 + 0.5 + 2.75], 0, { y: 0, pose: 'sit_low', beard: 1, cloth: 'cloth_brown' });
  citizen([X0 + 2.6, Z0 + 1.6], -2.3, { y: 0, pose: 'talk', cloth: 'cloth_grey', cloth2: 'cloth_brown', feet: 'bare' });
  // the loom room: the woman at the loom facing the south wall; the slave squatting at the hearth
  woman([X0 + 0.5 + 2.1, Z1 - 0.5 - 1.35], Math.PI, { y: 0, hat: 'none' });
  worker([X0 + 0.5 + 4.3 + 0.4 + 1.7 - 0.75, Z1 - 0.5 - 1.25], Math.PI / 2, { y: 0, pose: 'squat', beard: 0, cloth: 'cloth_grey' });
  // the Agora: citizens talking under and before the stoas, buyers among the booths, a few women with water jars
  for (let k = 0; k < 26; k++) {
    let x = -268 + rand() * 90, z = -222 + rand() * 96;
    // among the booths (rows from z −197 every 13 m, x > −240): keep to the aisles between the rows
    if (x > -242 && z > -199 && z < -132) z = -197 + Math.round((z + 197 - 4.3) / 13) * 13 + 4.3 + (rand() - 0.5) * 1.2;
    if (Math.hypot(x + 240, z + 208) < 9 || Math.hypot(x + 280, z + 133) < 13) continue;           // the altar, the Tholos
    const r = rand();
    if (r < 0.55) citizen([x, z], rand() * 6.28, { pose: rand() < 0.5 ? 'talk' : 'stand' });
    else if (r < 0.8) worker([x, z], rand() * 6.28, { carry: rand() < 0.4 ? 'sack' : 'none' });
    else woman([x, z], rand() * 6.28, { carry: 'pot', hat: 'none' });
  }
  // in the Painted Stoa: men standing in talk before the paintings
  for (let k = 0; k < 6; k++) citizen([-248 + rand() * 40, -228.9 + rand() * 1.4], Math.PI + (rand() - 0.5), { y: 0.62, pose: 'talk' });
  // a man leading a donkey with panniers into the Agora along the Way
  L.push({ t: 'animal', kind: 'donkey', at: [-262, -214], y: height(-262, -214), rot: -2.6, seed: 9, gear: true });
  worker([-260.6, -212.4], -2.6, { carry: 'staff' });
  return L;
}

export const lifePlan = () => ({ id: 'athens-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-420, -420, 420, 420], entrance: { at: [-300, 70], facing: 'e' } });
