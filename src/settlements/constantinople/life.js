// The life of the first hill about 562 (docs/settlements/constantinople.md §10): the shops of the Mese's
// porticoes with their goods set out before the doors and their keepers; people walking the Mese, in
// tunics and cloaks, women veiled; donkeys and an ox-cart in the street; officials and clergy on the
// Augustaion before the Senate house and the Chalke; a few people in the Forum of Constantine.

import { RADIUS, AUGUSTAION, MESE, FORUM, SENATE, CHALKE, height } from './layout.js';
import { MESE_STOAS } from './plan.js';
import { nearProcession } from './procession.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const fp = (o, u, s, t) => [o[0] + s * u[0] - t * u[1], o[1] + s * u[1] + t * u[0]];

export function life() {
  const rand = rng(562), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const BRIGHT = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_brown'], DULL = ['cloth_brown', 'cloth_grey', 'cloth_white', 'linen', 'cloth_ochre'];
  /** A man in a knee-length belted tunic with hose, or an ankle-length one with a cloak; a woman in a long robe, her hair veiled. */
  const person = (at, rot, o = {}) => {
    const woman = rand() < 0.35, rich = rand() < 0.25, c = woman ? pick(BRIGHT) : rich ? pick(['cloth_white', 'cloth_indigo', 'cloth_green']) : pick(DULL);
    L.push({ t: 'figure', at, y: height(at[0], at[1]) + (o.dy ?? 0), rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.8 ? 'skin_light' : 'skin_medium',
      ...(woman ? { dress: 'robe', cloth: c, cloth2: pick(BRIGHT), hat: 'veil' } : rich ? { dress: 'robe', cloth: c, cloth2: 'cloth_white', over: 'collar', hat: 'none' } : { dress: 'tunic', legs: 'hose', cloth: c, cloth2: pick(DULL), hat: rand() < 0.15 ? 'cap' : 'none' }),
      pose: rand() < 0.25 ? 'talk' : 'stand', ...o });
  };
  // the shops of the Mese: goods before about half the doors, the keeper by them, a customer or two
  const GOODS = [['amphora', 'amphora', 'water_pot'], ['basket'], ['sacks'], ['crates'], ['cloth'], ['produce']];
  for (const st of MESE_STOAS) {
    if (!st.shops) continue;
    const [ax, az] = st.a, [bx, bz] = st.b, len = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / len, (bz - az) / len], s = st.side, D = 5;
    const ns = Math.max(1, Math.round(len / 4.4)), sw = len / ns;
    for (let k = 0; k < ns; k++) {
      if (rand() < 0.45) continue;
      const c = (k + 0.5) * sw, g = pick(GOODS), dy = 0.18, face = Math.atan2(u[1] * s, -u[0] * s);   // facing the street
      const P = (along, t) => fp(st.a, u, c + along, t * s);
      if (g[0] === 'cloth' || g[0] === 'produce') L.push({ t: 'stall', at: P(0, D - 1.0), y: height(ax, az) + dy, rot: face, seed: Math.floor(rand() * 1e9), w: 2.2, d: 0.9, awning: pick(['cloth_white', 'cloth_ochre', 'linen']), goods: [g[0], g[0] === 'cloth' ? 'cloth' : 'basket'] });
      else if (g[0] === 'sacks' || g[0] === 'crates') L.push({ t: g[0], at: P(-1.4, D - 0.6), y: height(ax, az) + dy, rot: face, seed: Math.floor(rand() * 1e9) });
      else if (g[0] === 'basket') for (const q of [-1.5, -0.9, 1.2]) L.push({ t: 'basket', at: P(q, D - 0.5), y: height(ax, az) + dy, seed: Math.floor(rand() * 1e9) });
      else for (const q of [-1.6, -1.15, 1.3, 1.75]) L.push({ t: 'pot', kind: pick(g), at: P(q, D - 0.45), y: height(ax, az) + dy, n: 1, seed: Math.floor(rand() * 1e9) });
      person(P(rand() < 0.5 ? -0.4 : 0.6, D - 1.7), face, { dy, pose: rand() < 0.5 ? 'sit' : 'stand' });
      if (rand() < 0.6) person(P(rand() - 0.5, D - 3.0), face + Math.PI, { dy });
    }
  }
  // people and beasts in the Mese
  const P = MESE.path;
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, az] = P[i], [bx, bz] = P[i + 1], len = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / len, (bz - az) / len];
    for (let d = 6; d < len - 6; d += 5 + rand() * 9) {
      const [x, z] = fp(P[i], u, d, (rand() - 0.5) * 9);
      if (Math.hypot(x, z) > RADIUS - 30 || Math.hypot(x - FORUM.c[0], z - FORUM.c[1]) < 8) continue;
      const rot = Math.atan2(-u[0], -u[1]) + (rand() < 0.5 ? 0 : Math.PI);
      if (rand() < 0.12) { L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: height(x, z), rot, seed: Math.floor(rand() * 1e9), gear: true }); person(fp([x, z], u, rand() < 0.5 ? 1.4 : -1.4, 0.9), rot); }
      else person([x, z], rot);
    }
  }
  // an ox-cart with sacks coming up the Mese's second leg, a dog
  L.push({ t: 'cart', kind: 'two', load: 'sacks', beast: 'ox', at: [-178, 78], y: height(-178, 78), rot: Math.PI, seed: 11 });
  person([-176.6, 74.5], Math.PI, { dress: 'tunic', legs: 'hose', cloth: 'cloth_brown' });
  L.push({ t: 'animal', kind: 'dog', at: [-150, 106], y: 0, rot: 1.2, seed: 5 });
  // the Augustaion: officials in white with cloaks before the Senate house, clergy in black, people crossing
  const [x0, z0, x1, z1] = AUGUSTAION;
  for (let k = 0; k < 7; k++) person([SENATE[0] - 15 - rand() * 6, SENATE[1] + 4 + rand() * 18], Math.PI / 2 + (rand() - 0.5), { dress: 'robe', cloth: 'cloth_white', cloth2: rand() < 0.5 ? 'cloth_red' : 'cloth_white', over: 'collar', hat: 'none', pose: rand() < 0.5 ? 'talk' : 'stand' });
  for (let k = 0; k < 3; k++) person([-20 + rand() * 20, z0 + 4 + rand() * 6], Math.PI + (rand() - 0.5), { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_black', hat: 'none' });
  // guards at the Chalke's door
  for (const s of [-1, 1]) person([CHALKE.c[0] - 8.6, CHALKE.c[1] + s * 3.2], -Math.PI / 2 + Math.PI, { dress: 'tunic', legs: 'hose', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'none', pose: 'stand', carry: 'staff', len: 2.4 });
  for (let k = 0; k < 22; k++) {
    const x = x0 + 10 + rand() * (x1 - x0 - 40), z = z0 + 6 + rand() * (z1 - z0 - 20);
    if (Math.hypot(x - (x0 + 24), z - (z0 + 32)) < 9 || nearProcession(x, z, 6)) continue;   // the column's steps, the procession
    person([x, z], rand() * 6.28);
  }
  // the Forum of Constantine: people under its porticoes and about the column
  for (let k = 0; k < 18; k++) {
    const a = rand() * 6.28, r = rand() < 0.5 ? 12 + rand() * 18 : FORUM.r + 1.5 + rand() * 3;
    const x = FORUM.c[0] + Math.cos(a) * r, z = FORUM.c[1] + Math.sin(a) * r;
    person([x, z], rand() * 6.28, { dy: r > FORUM.r ? 0.08 : 0 });
  }
  return L;
}

export const lifePlan = () => ({ id: 'constantinople-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-150, 110], facing: 'e' } });
