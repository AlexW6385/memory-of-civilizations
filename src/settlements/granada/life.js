// The Generalife's people about 1400 (docs/settlements/granada.md §10.7): few, the place being the
// sultans' private retreat — gardeners in the beds and the huerta, men of the household talking and
// seated, women walking in the Sultana's garden, a man at prayer, horses and grooms in the Dismount court.

import { RADIUS, GY, ACEQUIA, GEN, TERRACES, SULTANA_Y, DISMOUNT_Y } from './layout.js';

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
  return L;
}
export const lifePlan = () => ({ id: 'granada-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } });
