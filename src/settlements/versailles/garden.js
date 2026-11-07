// Orange trees, chairs and gardeners (docs/settlements/versailles.md §1a): the orange trees set out in their boxes
// along both sides of the water parterre; gardeners at work among them; two blue hired chairs and their bearers in
// blue at the Place d'Armes, where visitors without the Honneurs du Louvre left their coaches, the coaches waiting
// there; a courtier's own chair on the terrace. Pure data: the classical_fr style's builders and the shared objects.

import { PARTERRE, PLACE, RISE, height } from './layout.js';

const plan = (id, style, elements, bounds, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds, rooms: [], elements, ...extra });
const at = (x, z, rot, lx, lz) => [x + lx * Math.cos(rot) + lz * Math.sin(rot), z - lx * Math.sin(rot) + lz * Math.cos(rot)];

export function gardenPlans() {
  const trees = [];
  for (const zs of [PARTERRE[1] - 6, PARTERRE[3] + 6]) for (let x = PARTERRE[0] + 2; x <= PARTERRE[2] - 4; x += 6) trees.push([x, zs]);
  const G = [{ t: 'orange_trees', at: trees, ys: trees.map(([x, z]) => height(x, z)), seed: 1686 }], L = [];
  const fig = (o) => L.push({ t: 'figure', y: 0, dress: 'robe', legs: 'hose', skin: 'skin_light', over: 'none', ...o });
  // gardeners: hoeing, sweeping the walks, one with a barrow
  for (const [x, z, carry, rot] of [[-40, -64, 'hoe', 0.4], [-22, 64, 'broom', -2.6], [-58, 63, 'none', 1.2], [-10, -63, 'broom', 2.0]])
    fig({ at: [x, z], y: height(x, z), rot, seed: Math.floor(x * 7 - z), carry, pose: carry === 'none' ? 'squat' : 'stand', cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'brim', hatMat: 'thatch' });
  L.push({ t: 'barrow', at: [-56, 61.5], y: height(-56, 61.5), rot: 0.3, seed: 3 });
  // a courtier's own chair, gilt and with his arms, set down on the terrace; its bearers in his livery
  const cx = -2, cz = -48, cr = Math.PI;
  G.push({ t: 'sedan_chair', at: [cx, cz], rot: cr, y: height(cx, cz), body: 'gilt_bronze', cloth: 'cloth_red' });
  for (const lz of [-1.8, 1.8]) fig({ at: at(cx, cz, cr, 0.95, lz), y: height(cx, cz), rot: cr + (lz < 0 ? 0 : Math.PI), seed: 90 + lz * 10, pose: 'stand', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'brim', over: 'cape' });
  // the hired chairs, painted blue, their bearers in blue, at the Place d'Armes; coaches left waiting there
  for (const [x, z, r] of [[PLACE[0] + 14, -18, Math.PI / 2], [PLACE[0] + 14, -12, Math.PI / 2]]) {
    G.push({ t: 'sedan_chair', at: [x, z], rot: r, y: RISE, body: 'paint_blue', cloth: 'cloth_white' });
    for (const lz of [-1.8, 1.8]) fig({ at: at(x, z, r, 0.95, lz), y: RISE, rot: r + (lz < 0 ? 0 : Math.PI), seed: Math.floor(x + z * 3 + lz * 10), pose: lz < 0 ? 'talk' : 'stand', cloth: 'cloth_indigo', cloth2: 'cloth_indigo', hat: 'brim' });
  }
  for (const [x, z, body, cloth, horse] of [[PLACE[0] + 40, 30, 'lacquer_black', 'cloth_red', 'hide_black'], [PLACE[0] + 52, 38, 'wood_painted', 'cloth_indigo', 'hide_grey']]) {
    const r = Math.PI / 2;
    G.push({ t: 'coach', at: [x, z], rot: r, y: RISE, body, cloth });
    for (const s of [-1, 1]) L.push({ t: 'animal', kind: 'horse', at: at(x, z, r, s * 0.62, -3.55), y: RISE, rot: r, seed: Math.floor(x * 31 + s), mat: horse, graze: false, gear: false });
    fig({ at: at(x, z, r, 0, -1.6), y: RISE + 1.2, rot: r, seed: Math.floor(x * 3), pose: 'sit', cloth, cloth2: 'cloth_black', hat: 'brim', over: 'cape' });
  }
  return [
    plan('versailles-garden-objects', 'classical_fr', G, [-80, -80, 220, 80], { center: [60, 0], near: 320 }),
    plan('versailles-garden-life', 'life', L, [-80, -80, 220, 80], { center: [60, 0], near: 320 }),
  ];
}
