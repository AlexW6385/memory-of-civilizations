// The life of Athens about 410 BC (docs/settlements/athens.md §10): in Simon's house by the south-west corner of the
// Agora the shoemaker at his bench and a bearded man in his himation talking with him (Socrates came to the
// workshops round the Agora to talk); the woman of the house at the loom; the slave at the hearth; people in the
// Agora between the booths and the stoas; a man leading a donkey along the Panathenaic Way.

import { height, SHOPROW, FOUNTAIN } from './layout.js';
import { WORKSHOPS, localFrame, EXEDRA, PALAESTRA, PARADROMIS } from './quarters.js';

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
  // ── the fourth wave: the Kerameikos, the shops under the south side, the fountain, the Academy
  const face = (dx, dz) => Math.atan2(-dx, -dz);
  const slave = (at, rot, o = {}) => worker(at, rot, { beard: 0.3, ...o });
  WORKSHOPS.forEach((w) => {
    const { P } = localFrame(w.rect, w.front), toFront = face(0, w.front === 's' ? 1 : -1), toBack = face(0, w.front === 's' ? -1 : 1);
    const at = (u, v) => P(u, v), yy = 0;
    if (w.trade === 'potter') {
      worker(at(4.2, 3.5), toFront, { y: yy, pose: 'sit', beard: 1, cloth: 'cloth_brown', hat: 'none' });          // at the wheel, on his stool
      slave(at(5.0, 2.6), face(-1, 0), { y: yy, pose: 'squat', cloth: 'cloth_grey' });                              // the boy who turns it
      slave(at(8.0, 4.3), toBack, { y: yy, carry: 'basket' });
    } else if (w.trade === 'painter') {
      worker(at(4.4, 2.9), toFront, { y: yy, pose: 'sit', beard: 0.8, cloth: 'linen', hat: 'none' });               // the painter at his bench, the krater before him
      slave(at(7.2, 3.2), toFront, { y: yy, pose: 'sit', cloth: 'cloth_grey' });
    } else if (w.trade === 'tile') {
      slave(at(5.0, 2.2), toBack, { y: yy, carry: 'basket', cloth: 'cloth_ochre' });
      worker(at(7.6, 3.0), toFront, { y: yy, beard: 1, cloth: 'cloth_brown' });
    } else {
      worker(at(4.5, 2.7), toFront, { y: yy, pose: 'sit', beard: 0.8, cloth: 'linen' });
    }
    // in the yard: a slave at the kiln's mouth with a log, the master by the racks
    const [kx, kz, kr] = w.kiln, dir = Math.cos(kr) > 0 ? 1 : -1;
    slave([kx + dir * 3.6, kz - 0.2], face(-dir, 0), { y: 0, carry: 'none', cloth: 'cloth_grey' });
    const [yx, yz] = w.yardMid; citizen([yx + 0.5, yz - 1.2], rand() * 6.28, { y: 0, pose: 'talk', cloth: 'cloth_white' });
  });
  // the shops: the shopkeeper behind his counter, a buyer before it
  [0, 1, 2, 3, 4].forEach((k) => {
    const x = SHOPROW[0] + 0.7 + k * 5.32 + 3.6, z = SHOPROW[1] + 11.3;
    worker([x, z], face(0, -1), { y: 0.35, beard: 0.9, cloth: ['cloth_brown', 'cloth_ochre', 'linen', 'cloth_grey', 'cloth_brown'][k] });
    if (k < 4) citizen([x + 0.3, z - 2.2], face(0, 1), { y: 0.35, pose: 'talk' });
  });
  // the fountain: women with their hydriai at the spouts, one going away with hers on her head
  for (let k = 0; k < 3; k++) woman([FOUNTAIN[0] + 16 * (1 + 2 * k) / 8, FOUNTAIN[3] - 2.2], face(0, 1), { y: 0.1, carry: k === 1 ? 'pot' : 'none', hat: k === 0 ? 'veil' : 'none' });
  woman([FOUNTAIN[0] + 12.5, FOUNTAIN[1] - 2.4], face(0, -1), { y: 0, carry: 'pot', arms: 'head', hat: 'none' });
  // the Academy: the old man in his himation and his companions on the exedra's seats, talking
  { const [cx, cz] = EXEDRA;
    L.push({ t: 'figure', at: [cx, cz - 0.4], y: 0, rot: face(0, 1), seed: seed(), skin: 'skin_medium', dress: 'wrap', top: 'bare', cloth: 'cloth_brown', hair: 'short', beard: 1, hat: 'none', feet: 'bare', pose: 'talk' });
    for (let k = 0; k < 5; k++) { const a = Math.PI * (k * 2 + 1.0) / 10 + 0.15, sx = cx + Math.cos(a) * 3.2, sz = cz + Math.sin(a) * 3.2;
      citizen([sx, sz], face(cx - sx, cz - sz), { y: 0.0, pose: 'sit', cloth: ['cloth_white', 'linen', 'cloth_ochre'][k % 3] }); }
    citizen([cx + 2.0, cz - 3.0], face(-1, 0.6), { y: 0, pose: 'talk' }); }
  // the palaestra: the trainer with his staff, boys at wrestling, a man at the jumping pit, runners on the track
  { const P0 = [PALAESTRA[0] + 17, PALAESTRA[1] + 14];
    citizen([P0[0] - 3, P0[1] + 3], face(1, -1), { y: 0, carry: 'staff', cloth: 'cloth_white', pose: 'stand' });
    for (const [dx, dz, r] of [[0, 0, 0], [0, -1.0, Math.PI]]) L.push({ t: 'figure', at: [P0[0] + 2 + dx, P0[1] - 3 + dz], y: 0, rot: r, seed: seed(), skin: 'skin_medium', dress: 'loincloth', cloth: 'linen', hair: 'short', beard: 0, hat: 'none', feet: 'bare', pose: 'stand' });
    for (let k = 0; k < 3; k++) L.push({ t: 'figure', at: [PARADROMIS[0] + 12 + k * 3.5, (PARADROMIS[1] + PARADROMIS[3]) / 2 + (k % 2) * 1.2], y: 0, rot: face(1, 0), seed: seed(), skin: 'skin_medium', dress: 'loincloth', cloth: 'linen', hair: 'short', beard: 0, hat: 'none', feet: 'bare', pose: 'stand' }); }
  return L;
}

export const lifePlan = () => ({ id: 'athens-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-420, -420, 420, 420], entrance: { at: [-300, 70], facing: 'e' } });
