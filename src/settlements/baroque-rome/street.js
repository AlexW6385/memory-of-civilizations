// Coaches and pilgrims (docs/settlements/baroque-rome.md §5): a cardinal's coach waiting before the steps, an
// ambassador's crossing the oval, a coach in the Borgo Nuovo, a sedan chair set down with its bearers; pilgrims
// with their staffs, broad hats and capes about the obelisk, the fountains and the steps, some kneeling; beggars
// by the colonnade; a seller of rosaries and medals. Pure data: the coaches are the baroque style's, the rest the
// shared objects (life).

import { OVAL, FRONT_X, BORGO } from './layout.js';

const plan = (id, style, elements, bounds, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds, rooms: [], elements, ...extra });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A local point (lx, lz) of something at (x, z) turned by rot (as rotateY), in the world. */
const at = (x, z, rot, lx, lz) => [x + lx * Math.cos(rot) + lz * Math.sin(rot), z - lx * Math.sin(rot) + lz * Math.cos(rot)];

export function streetPlans() {
  const C = [], L = [], rand = rng(1670);
  const livery = (seed, o) => ({ t: 'figure', seed, dress: 'robe', legs: 'hose', skin: 'skin_light', cloth: 'cloth_red', cloth2: 'cloth_black', hat: 'brim', over: 'cape', ...o });
  const coachAt = (x, z, rot, o = {}) => {
    C.push({ t: 'coach', at: [x, z], rot, y: 0, ...o });
    for (const s of [-1, 1]) L.push({ t: 'animal', kind: 'horse', at: at(x, z, rot, s * 0.62, -3.55), rot, seed: Math.floor(x * 31 + z * 7 + s * 101), mat: o.horse ?? 'hide_black', graze: false, gear: false });
    L.push(livery(Math.floor(x * 3 + z), { at: at(x, z, rot, 0, -1.6), rot, y: 1.2, pose: 'sit', cloth: o.livery ?? 'cloth_red' }));
    if (o.footmen) for (const s of [-1, 1]) L.push(livery(Math.floor(x * 5 + z + s), { at: at(x, z, rot, s * 0.25, 1.85), rot, y: 1.12, pose: 'stand', cloth: o.livery ?? 'cloth_red' }));
  };
  // a cardinal's coach before the steps, facing the church, its footmen; an ambassador's in the oval; one in the Borgo Nuovo
  coachAt(FRONT_X + 58, 24, Math.PI / 2, { footmen: true, cloth: 'cloth_red', livery: 'cloth_red' });
  coachAt(OVAL.c[0] + 30, -52, 0.35, { body: 'wood_painted', cloth: 'cloth_indigo', livery: 'cloth_indigo', footmen: true, horse: 'hide_grey' });
  coachAt(150, BORGO[0], -Math.PI / 2, { cloth: 'cloth_green', livery: 'cloth_green', horse: 'hide_brown' });
  // a sedan chair set down near the steps, its two bearers standing at the poles
  const sx = FRONT_X + 50, sz = -20, sr = Math.PI / 2;
  C.push({ t: 'sedan_chair', at: [sx, sz], rot: sr, y: 0, cloth: 'cloth_red' });
  for (const lz of [-1.75, 1.75]) L.push(livery(Math.floor(lz * 10 + 7), { at: at(sx, sz, sr, 0.9, lz), rot: sr + (lz < 0 ? 0 : Math.PI), y: 0, pose: 'talk', hat: 'cap', over: 'none', cloth: 'cloth_brown', cloth2: 'cloth_brown' }));
  // pilgrims: in groups, with the staff, the broad hat and the short cape; some kneeling toward the church
  const pilgrim = (x, z, rot, o = {}) => L.push({ t: 'figure', at: [x, z], y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', legs: 'hose', skin: rand() < 0.8 ? 'skin_light' : 'skin_medium',
    cloth: ['cloth_brown', 'cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_ochre'][Math.floor(rand() * 5)], cloth2: 'cloth_brown', hat: rand() < 0.75 ? 'brim' : 'veil', over: 'cape', carry: rand() < 0.7 ? 'staff' : 'none', ...o });
  const groups = [[OVAL.c[0] - 12, 8, 5], [OVAL.c[0] + 10, -14, 4], [OVAL.c[0] - 4, 44, 3], [OVAL.c[0] - 2, -48, 4], [-40, -10, 6], [-55, 18, 4], [OVAL.c[0] + 52, 14, 5], [OVAL.c[0] + 85, -6, 4]];
  for (const [gx, gz, n] of groups) {
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + rand(), r = 0.9 + rand() * 0.6, x = gx + Math.cos(a) * r, z = gz + Math.sin(a) * r;
      const kneel = gx < 0 && i === 0;
      pilgrim(x, z, kneel ? Math.PI / 2 : Math.atan2(x - gx, z - gz) + Math.PI, kneel ? { pose: 'kneel', arms: 'pray', carry: 'none' } : { pose: rand() < 0.5 ? 'talk' : 'stand' });
    }
  }
  for (let i = 0; i < 9; i++) pilgrim(OVAL.c[0] + 110 - i * 9 + rand() * 2, (rand() - 0.5) * 6, Math.PI / 2 + (rand() - 0.5) * 0.4, { pose: 'stand' });   // walking in from the Borgo toward the church
  // beggars on the ground by the colonnade's inner columns, a seller of rosaries and medals at a stall
  for (const [x, z] of [[OVAL.c[0] - 30, -78], [OVAL.c[0] + 28, 80], [OVAL.c[0] - 52, 62]]) L.push({ t: 'figure', at: [x, z], y: 0, rot: Math.atan2(OVAL.c[0] - x, OVAL.c[1] - z) + Math.PI, seed: Math.floor(x * 11 + z), pose: 'ground', dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_brown', skin: 'skin_medium', hat: 'none', over: 'cape', feet: 'bare' });
  L.push({ t: 'stall', at: [OVAL.c[0] + 40, 46], rot: -2.3, seed: 77, awning: 'cloth_white', goods: ['basket', 'cloth', 'basket'], w: 2.2, d: 1.2 });
  L.push({ t: 'figure', at: at(OVAL.c[0] + 40, 46, -2.3, 0, -1.2), y: 0, rot: -2.3 + Math.PI, seed: 78, pose: 'stand', dress: 'robe', cloth: 'cloth_black', skin: 'skin_light', hat: 'cap', over: 'none' });
  L.push({ t: 'chickens', kind: 'pigeon', n: 12, at: [OVAL.c[0] + 18, 22], seed: 9 });
  L.push({ t: 'animal', kind: 'dog', at: [OVAL.c[0] + 60, -30], rot: 1.2, seed: 5 });
  return [
    plan('baroque-rome-coaches', 'baroque', C, [-100, -100, 200, 100], { center: [40, 0], near: 300 }),
    plan('baroque-rome-pilgrims', 'life', L, [-100, -100, 200, 100], { center: [40, 0], near: 300 }),
  ];
}
