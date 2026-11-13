// The Generalife's people about 1400 (docs/settlements/granada.md §10.7): few, the place being the
// sultans' private retreat — gardeners in the beds and the huerta, men of the household talking and
// seated, women walking in the Sultana's garden, a man at prayer, horses and grooms in the Dismount court.

import { darroSlots } from '../../styles/nasrid/streets.js';
import { isShop } from '../../styles/nasrid/houses.js';
import { RADIUS, lots, gardens, DARRO, DARRO_BRIDGES, GY, ACEQUIA, GEN, TERRACES, SULTANA_Y, DISMOUNT_Y, HILL, LIONS, COMARES, MYRTLES, PARTAL } from './layout.js';

export function life() {
  const L = [], T = Object.fromEntries(TERRACES.map((t) => [t.id, t]));

  let seed = 1400;
  const rot = { n: 0, s: Math.PI, w: Math.PI / 2, e: -Math.PI / 2 };
  const P = (at, y, dir, o = {}) => L.push({ t: 'figure', at, y, rot: typeof dir === 'number' ? dir : rot[dir], seed: (seed += 7919), skin: 'skin_medium', dress: 'robe', pose: 'stand', ...o });
  const man = (at, y, dir, o = {}) => P(at, y, dir, { cloth: ['cloth_brown', 'cloth_red', 'cloth_white', 'cloth_ochre'][seed % 4], cloth2: 'cloth_white', over: 'sash', hat: seed % 3 ? 'turban' : 'none', hatMat: 'cloth_white', hair: 'short', beard: true, ...o });
  const woman = (at, y, dir, o = {}) => P(at, y, dir, { cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'veil', hair: 'long', h: 1.55, ...o });
  const gardener = (at, y, dir, o = {}) => P(at, y, dir, { dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'belt', hat: 'cap', hatMat: 'cloth_white', hair: 'short', beard: true, legs: 'bare', ...o });
  const [ax0, , ax1] = ACEQUIA, acx = (ax0 + ax1) / 2;
  // the Acequia: a gardener at work in a bed among the orange trees; two men talking on the walk by the channel
  gardener([acx - 3.33, -23.7], GY - 0.5 + 0.02, 'e', { pose: 'squat' });
  man([acx - 1.0, -4.2], GY + 0.02, 's', { pose: 'talk' }); man([acx - 1.0, -2.9], GY + 0.02, 'n', { pose: 'talk' });
  // the north portico's gallery: two men seated on the floor looking down the court, a servant standing by with a jar
  man([acx - 2.2, -37.6], GY + 0.04, 's', { pose: 'cross', cloth: 'cloth_white' }); man([acx - 0.9, -37.7], GY + 0.04, 's', { pose: 'cross', cloth: 'cloth_red' });
  P([acx + 0.8, -37.4], GY + 0.04, 'w', { dress: 'tunic', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'cap', hatMat: 'cloth_white', carry: 'pot', hair: 'short' });
  // the west mirador: a woman of the household seated at a window over the orchards
  woman([GEN.wMirador[0] + 1.3, (GEN.wMirador[1] + GEN.wMirador[3]) / 2], GY + 0.04, 'w', { pose: 'sit_ground' });
  // the Sultana's garden: two women walking on the cross of paths
  { const [s0, sz0, s1, sz1] = GEN.sultana, scx = (s0 + s1 - 0.6) / 2, scz = (sz0 + sz1) / 2; woman([scx, scz - 6.5], SULTANA_Y + 0.08, 's'); woman([scx + 0.35, scz + 5.2], SULTANA_Y + 0.08, 'n', { cloth: 'cloth_ochre' }); }
  // the oratory: a man at prayer on the mat before the mihrab
  man([GEN.oratory[2] - 1.6, (GEN.oratory[1] + GEN.oratory[3]) / 2], GEN.stair.y1 + 0.07, 'e', { pose: 'kneel', arms: 'pray', hat: 'turban' });
  // the Dismount court: horses waiting by the stables, their grooms
  for (const [x, z] of [[274.5, 45.2], [289, 44.9]]) {
    L.push({ t: 'animal', kind: 'horse', at: [x, z], y: DISMOUNT_Y + 0.04, rot: rot.e, seed: (seed += 7919) });
    P([x + 1.5, z - 0.45], DISMOUNT_Y + 0.04, 'w', { dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_white', over: 'belt', hat: 'cap', hatMat: 'cloth_red', hair: 'short', beard: true });
  }
  // the huerta: a man hoeing between the beds, another weeding, a woman with a basket by the baskets
  gardener([T.orchard1.r[0] + 5.5, 19.0], T.orchard1.y + 0.02, 'n', { carry: 'hoe' });
  gardener([T.orchard1.r[0] + 1.4 + 0.9 * 3, -1.0], T.orchard1.y + 0.02, 'w', { pose: 'squat' });
  P([T.orchard1.r[0] + 11.9, 13.2], T.orchard1.y + 0.02, 'w', { dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'veil', hair: 'long', carry: 'basket', h: 1.55 });
  alhambra(P, man, woman);
  streets(P, man, woman, L);
  return L;
}
/**
 * The Alhambra's people about 1390 (§4.9): men of the court talking in the galleries of the Court of the
 * Lions, envoys standing before the sultan's alcove in the Hall of the Ambassadors with a secretary,
 * men walking by the pool of the Myrtles (clear of the arrival at its south end), a gardener at the
 * hedges, two women seated by the Partal's pool.
 */
function alhambra(P, man, woman) {
  const T = HILL.top + 0.05, [lx0, lz0, lx1, lz1] = LIONS;
  man([lx0 + 6.2, lz0 + 1.3], T, 'e', { pose: 'talk', cloth: 'cloth_white' }); man([lx0 + 7.4, lz0 + 1.25], T, 'w', { pose: 'talk', cloth: 'cloth_red' });
  man([lx1 - 1.0, lz1 - 2.8], T, 'n', { cloth: 'cloth_brown' });
  man([lx0 + 18.5, lz1 - 1.3], T, 'w', { pose: 'talk', cloth: 'cloth_ochre' }); man([lx0 + 17.3, lz1 - 1.35], T, 'e', { pose: 'talk', cloth: 'cloth_white', hat: 'turban' });
  const [c0, cz0, c1, cz1] = COMARES, hx = (c0 + c1) / 2;
  man([hx - 0.6, cz0 + 7.6], T, 'n', { cloth: 'cloth_red', hat: 'turban' }); man([hx + 0.6, cz0 + 7.7], T, 'n', { cloth: 'cloth_white', hat: 'turban' });
  man([c0 + 4.2, cz0 + 5.0], T, 'e', { pose: 'cross', cloth: 'cloth_white', hat: 'turban' });
  const [mx0, mz0] = MYRTLES;
  man([mx0 + 2.6, mz0 + 14.0], T, 's', { pose: 'talk', cloth: 'cloth_white' }); man([mx0 + 2.7, mz0 + 15.2], T, 'n', { pose: 'talk', cloth: 'cloth_brown' });
  P([mx0 + 5.7, mz0 + 22.0], T, 'e', { dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'belt', hat: 'cap', hatMat: 'cloth_white', hair: 'short', beard: true, legs: 'bare', pose: 'squat' });
  const [, , , pz1] = PARTAL.pool, px = (PARTAL.pool[0] + PARTAL.pool[2]) / 2;
  woman([px - 1.2, pz1 + 1.0], T, 'n', { pose: 'sit_ground' }); woman([px - 0.1, pz1 + 1.05], T, 'n', { pose: 'sit_ground', cloth: 'cloth_ochre' });
}
/** At the Albaicín's cisterns (§5.1): women filling jars, now and then a water-carrier with his donkey. */
export function aljibeLife(list) {
  const L = []; let seed = 1391;
  for (const [i, a] of list.entries()) {
    const [x, z] = a.at, f = z + 1.3 + 0.9;
    L.push({ t: 'figure', at: [x - 0.5, f], y: a.y, rot: Math.PI, seed: (seed += 7919), skin: 'skin_medium', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'veil', hair: 'long', h: 1.55, pose: 'stand', carry: 'pot' });
    if (i % 2) L.push({ t: 'figure', at: [x + 0.7, f + 0.6], y: a.y, rot: Math.PI - 0.4, seed: (seed += 7919), skin: 'skin_medium', dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_white', hat: 'veil', hair: 'long', h: 1.55, pose: 'talk' });
    if (i % 3 === 0) {
      L.push({ t: 'animal', kind: 'donkey', at: [x + 2.6, f + 0.4], y: a.y, rot: Math.PI / 2, seed: (seed += 7919) });
      L.push({ t: 'figure', at: [x + 1.4, f + 0.2], y: a.y, rot: -Math.PI / 2, seed: (seed += 7919), skin: 'skin_medium', dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_white', over: 'belt', hat: 'cap', hatMat: 'cloth_white', hair: 'short', beard: true, legs: 'bare', pose: 'stand' });
    }
  }
  return L;
}
export const lifePlan = () => ({ id: 'granada-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } });

/**
 * The streets' people (§14): washerwomen kneeling at the wash-stones of the Darro's quays, men mending nets, an old man on a
 * bench by the water, women with baskets; in the medina's huertas a gardener among the orange trees, a woman at the well, a
 * cat on the wall — the gardens nearest the way in only.
 */
function streets(P, man, woman, L) {
  let k = 0;
  for (const { x, sg, kind } of darroSlots({ x0: -140, x1: 230, seed: 7, gaps: DARRO_BRIDGES })) {
    if (x < -110 || x > 170) continue;
    const face = sg < 0 ? 0 : Math.PI, Z = (d) => DARRO.z + sg * d, y = DARRO.y + 0.02, w = DARRO.w;
    k++;
    if (kind === 0) { woman([x + 1.7, Z(w + 1.5)], y, face, { pose: 'squat', cloth: k % 2 ? 'cloth_ochre' : 'cloth_white' }); if (k % 3 === 0) woman([x + 2.9, Z(w + 1.6)], y, face + 0.5, { cloth: 'cloth_red', carry: 'basket' }); }
    else if (kind === 1) man([x + 1.3, Z(w + 2.2)], y, sg < 0 ? Math.PI : 0, { pose: 'squat', cloth: 'cloth_brown', hat: 'cap' });
    else if (kind === 2 && k % 2 === 0) man([x + 0.9, Z(7.3)], y + 0.48, face, { pose: 'sit', cloth: 'cloth_grey', hat: 'turban' });
  }
  // the households at home: a woman or a man on the divan of the ground room, the shopkeeper behind his counter (the houses nearest the way in)
  {
    const A = [19.5, 3], near = lots().filter((l) => l.y === HILL.top && Math.hypot((l.rect[0] + l.rect[2]) / 2 - A[0], (l.rect[1] + l.rect[3]) / 2 - A[1]) < 110)
      .sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 - A[0], (a.rect[1] + a.rect[3]) / 2 - A[1]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 - A[0], (b.rect[1] + b.rect[3]) / 2 - A[1]));
    let n = 0;
    for (const l of near) {
      if (n >= 16 || l.seed % 3 === 1) continue;
      const [x0, z0, x1, z1] = l.rect, sf = l.front === 's', Ln = x1 - x0, D = z1 - z0, F = (u, v) => (sf ? [x1 - u, z1 - v] : [x0 + u, z0 + v]), y = l.y + 0.15, face = sf ? Math.PI : 0;
      if (isShop(l.seed)) woman(F(Ln / 2 + 0.4, 3.25), y, face, { cloth: ['cloth_ochre', 'cloth_red', 'cloth_indigo'][l.seed % 3] }), n++;
      else if (l.seed % 2) { woman(F(Ln * 0.38, D - 0.9), y + 0.36, face, { pose: 'sit', cloth: 'cloth_ochre' }); n++; }
      else { man(F(Ln * 0.62, D - 0.9), y + 0.36, face, { pose: 'sit', cloth: 'cloth_white' }); n++; }
    }
  }
  const at = [20, 30];
  for (const g of gardens().sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 - at[0], (a.rect[1] + a.rect[3]) / 2 - at[1]) - Math.hypot((b.rect[0] + b.rect[2]) / 2 - at[0], (b.rect[1] + b.rect[3]) / 2 - at[1])).slice(0, 6)) {
    const [x0, z0, x1, z1] = g.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y = g.y + 0.08;
    P([cx + 0.2, cz + 0.4], y, 0.8, { dress: 'tunic', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'belt', hat: 'cap', hatMat: 'cloth_white', hair: 'short', beard: true, legs: 'bare', pose: 'squat' });
    L.push({ t: 'animal', kind: 'cat', at: [x0 + 0.17, z0 + (g.front === 's' ? 3 : (z1 - z0) - 3)], y: g.y + 2.3, rot: 1.2, seed: 40 + Math.floor(x0) });
  }
}
