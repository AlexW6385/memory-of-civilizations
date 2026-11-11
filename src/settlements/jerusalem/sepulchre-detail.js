// The Church of the Holy Sepulchre furnished (docs/settlements/jerusalem.md §1b, §1e): the altar under its canopy in
// the apse, the chancel screen and the pulpit in the nave, lamps hung over nave, aisles and the rotunda's
// ambulatory, candle stands at the Tomb and at Golgotha, the fountain in the atrium; and the clergy and
// pilgrims at them. Positions follow city.js's sepulchre(). Pure data.

import { SEPULCHRE, SEP_Y, SEP_STAIR, CARDO, CARDO_Y } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const [sx0, sz0, sx1, sz1] = SEPULCHRE, zc = (sz0 + sz1) / 2, Y = SEP_Y, xs = sx1 - SEP_STAIR, bx1 = xs - 14, bx0 = bx1 - 40, rc = [sx0 + 18.4, zc];
const D2R = Math.PI / 180;

export function sepulchreFurnish() {
  const E = [], F = Y + 0.06;
  E.push({ t: 'ciborium', at: [bx0 - 3.2, zc], y: F, dir: [1, 0], s: 1.2 });
  E.push({ t: 'templon', a: [bx0 + 8, zc - 6.4], b: [bx0 + 8, zc + 6.4], y: F });
  E.push({ t: 'ambo', at: [bx0 + 14, zc - 3.2], y: F, dir: [0, 1] });
  for (const z of [-4.2, 4.2]) E.push({ t: 'candelabrum', at: [bx0 - 0.4, zc + z], y: F, arms: 7 });
  // lamps: the nave's long line, the aisles', and the ambulatory's ring
  for (let k = 0; k < 8; k++) E.push({ t: 'lamp_chain', at: [bx0 + 4 + k * 4.4, zc], y: Y + 14.6, drop: 9.2, n: 1, dir: [1, 0] });
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) { E.push({ t: 'lamp_chain', at: [bx0 + 4 + k * 6.6, zc + s * 10.2], y: Y + 9.1, drop: 4.6, n: 1, dir: [1, 0] }); E.push({ t: 'lamp_chain', at: [bx0 + 6 + k * 6.6, zc + s * 16.7], y: Y + 9.1, drop: 4.4, n: 1, dir: [1, 0] }); }
  for (let k = 0; k < 16; k++) { const a = (k + 0.5) * 22.5 * D2R, r = 13.9; E.push({ t: 'lamp_chain', at: [rc[0] + Math.cos(a) * r, rc[1] + Math.sin(a) * r], y: Y + 10.55, drop: 3.3, n: 1, dir: [1, 0] }); }
  // the Tomb: candle stands round the shrine, a lamp over the porch's door
  for (const a of [-50, -25, 25, 50]) E.push({ t: 'candelabrum', at: [rc[0] + Math.cos(a * D2R) * 6.3, rc[1] + Math.sin(a * D2R) * 6.3], y: F, arms: 9 });
  // Golgotha
  for (const [x, z] of [[bx0 - 6.0, sz1 - 8.0], [bx0 - 12.0, sz1 - 8.0]]) E.push({ t: 'candelabrum', at: [x, z], y: Y, arms: 7 });
  // the atrium: the fountain, benches along the façade
  E.push({ t: 'cantharus', at: [(xs + bx1) / 2 + 0.5, zc], y: Y, r: 1.7 });
  return E;
}

export function sepulchreLife() {
  const E = [], rand = rng(741), F = Y + 0.06, pick = (a) => a[Math.floor(rand() * a.length)];
  const cl = ['cloth_brown', 'cloth_grey', 'cloth_ochre', 'linen', 'cloth_indigo', 'cloth_green'];
  const person = (x, z, y, rot, o = {}) => E.push({ t: 'figure', at: [x, z], y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'hose', cloth: pick(cl), cloth2: pick(cl), skin: 'skin_medium', hat: 'cap', over: 'cloak', hair: 'short', beard: rand() < 0.5, ...o });
  const priest = (x, z, y, rot, o = {}) => person(x, z, y, rot, { dress: 'robe', legs: undefined, cloth: 'cloth_black', cloth2: 'cloth_black', hat: 'none', over: 'none', beard: true, ...o });
  // at the altar: three priests, one standing before it facing east, two kneeling
  priest(bx0 - 3.2 + 1.9, zc, F, Math.PI / 2, {}); priest(bx0 - 5.4, zc - 1.6, F, -Math.PI / 2, { pose: 'kneel', arms: 'pray' }); priest(bx0 - 5.4, zc + 1.6, F, -Math.PI / 2, { pose: 'kneel', arms: 'pray' });
  // in the nave: pilgrims standing in the aisles, a few kneeling before the screen
  for (let k = 0; k < 14; k++) { const x = bx0 + 4 + rand() * 34, z = zc + (rand() < 0.5 ? -1 : 1) * (rand() < 0.5 ? 2.5 + rand() * 3 : 9 + rand() * 7); if (Math.abs(x - (bx0 + 8)) < 1.2 || (Math.abs(x - (bx0 + 14)) < 2.2 && Math.abs(z - zc + 3.2) < 2.4)) continue; person(x, z, F, rand() * 6.28, { pose: rand() < 0.3 ? 'kneel' : 'stand', arms: rand() < 0.3 ? 'pray' : undefined }); }
  for (let k = 0; k < 4; k++) person(bx0 + 9.4 + rand(), zc - 4.5 + k * 3, F, Math.PI / 2 + Math.PI, { pose: 'kneel', arms: 'pray' });
  // in the rotunda: a line of pilgrims waiting at the Tomb's porch, two priests at its door, others in the ambulatory
  for (let k = 0; k < 7; k++) person(rc[0] + 6.4 + k * 0.5 + rand() * 0.3, rc[1] - 2.5 + k * 0.8, F, -Math.PI / 2 - 0.4, { pose: k < 2 ? 'kneel' : 'stand', arms: k < 2 ? 'pray' : undefined });
  priest(rc[0] + 5.4, rc[1] - 0.8, F, Math.PI / 2, { carry: 'staff', pose: 'staff' }); priest(rc[0] + 5.4, rc[1] + 0.8, F, Math.PI / 2, {});
  for (let k = 0; k < 12; k++) { const a = rand() * 6.28, r = 12.5 + rand() * 2.5; person(rc[0] + Math.cos(a) * r, rc[1] + Math.sin(a) * r, F, rand() * 6.28, { pose: rand() < 0.2 ? 'pray' : 'stand' }); }
  // in the Holy Garden at Golgotha: three kneeling at the rock's foot
  for (let k = 0; k < 3; k++) person(bx0 - 7.6 - k * 0.9, sz1 - 8.4 + (k % 2) * 0.8, Y, Math.PI * 0.6, { pose: 'kneel', arms: 'pray' });
  // the atrium round the fountain: pilgrims drinking and resting, a woman with a jar
  for (let k = 0; k < 10; k++) { const a = rand() * 6.28, r = 3.2 + rand() * 4; person((xs + bx1) / 2 + Math.cos(a) * r * 0.9, zc + Math.sin(a) * r * 2, Y, rand() * 6.28, { pose: rand() < 0.25 ? 'talk' : 'stand', carry: rand() < 0.15 ? 'pot' : 'none' }); }
  // the yards north and south of the basilica: pilgrims resting by the wall, a well
  E.push({ t: 'well', kind: 'pulley', at: [bx0 + 20, sz1 - 5], y: Y + 0.03, seed: 17 });
  for (let k = 0; k < 8; k++) person(bx0 + 4 + rand() * 36, rand() < 0.5 ? sz0 + 3 + rand() * 4 : sz1 - 3 - rand() * 4, Y, rand() * 6.28, { pose: rand() < 0.4 ? 'sit_ground' : 'stand' });
  void CARDO; void CARDO_Y;
  return E;
}
