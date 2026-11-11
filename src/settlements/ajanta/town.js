// The gorge floor's life and the workers' village (docs/settlements/ajanta.md §6, §7): mud-walled huts with thatch
// round a yard with its well on the east bank, a pilgrims' shelter at the stair's foot, the monks, painters, masons and
// worshippers at the caves, goats, zebu and fowl.
import { RADIUS, XF, ZW, FLOOR, VILLAGE, WELL, C1, C19, C12, PATHS, rng, inRect, riverX } from './layout.js';
import '../../styles/ajanta/index.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-20, 14], facing: 'w' } });

/** Every hut: { rect, front, seed }, exported for the movers and the smoke. */
export function lots() {
  const r = rng(480), out = [], [vx0, , vx1] = VILLAGE;
  const rows = [{ zc: 12, front: 's' }, { zc: 52, front: 'n' }, { zc: 64, front: 's' }];
  for (const row of rows) for (let x = vx0 + 6; x < vx1 - 6; x += 8.5 + r() * 3) {
    const w = 4.6 + r() * 1.8, d = 3.8 + r() * 1.4, cx = x + w / 2, cz = row.zc + (r() - 0.5) * 2;
    const rect = [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2];
    if (r() < 0.12 || Math.abs(rect[0] - WELL[0]) < 3 && Math.abs(rect[1] - WELL[1]) < 3) continue;
    out.push({ rect, front: row.front, seed: Math.round(x * 13 + row.zc * 7), mud: r() < 0.3 ? 'earth_wall' : 'mud_plaster' });
  }
  return out;
}
export const SHELTER = [XF + 12, -52, XF + 17, -47];

export async function town() {
  const E = [], L = [], rand = rng(481), seed = () => Math.floor(rand() * 1e9);
  for (const l of lots()) E.push({ t: 'aj_hut', rect: l.rect, front: l.front, mud: l.mud });
  E.push({ t: 'aj_shelter', rect: SHELTER });
  // ── the life
  const CL = ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_brown'];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const monk = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'robe', cloth: pick(['cloth_ochre', 'cloth_ochre', 'cloth_maroon']), over: 'sash', hat: 'none', hair: 'shaven', skin: 'skin_medium', pose: 'stand', ...o });
  const lay = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'wrap', cloth: pick(['cloth_white', 'cloth_white', 'cloth_ochre']), over: 'shawl', hat: rand() < 0.4 ? 'turban' : 'none', skin: pick(['skin_medium', 'skin_dark']), pose: 'stand', ...o });
  const worker = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'wrap', top: 'bare', cloth: pick(['cloth_white', 'cloth_brown']), over: 'none', hat: 'none', skin: pick(['skin_dark', 'skin_medium']), pose: 'stand', ...o });
  const woman = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'wrap', cloth: pick(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_blue']), over: 'shawl', hair: 'bun', skin: pick(['skin_medium', 'skin_dark']), pose: 'stand', ...o });
  const y1 = FLOOR[1];
  // Cave 1: a painter and his boy on the scaffold at Vajrapani, a monk before the Buddha, a worshipper at the porch
  const xh0 = -60 - 3.8 - 1.0 - 19.5;
  worker([xh0 + 0.5, C1.z - 2.7], y1 + 3.2, -Math.PI / 2, { pose: 'talk', cloth: 'cloth_white' });
  worker([xh0 + 0.9, C1.z - 3.5], y1 + 3.2, -Math.PI / 2, { pose: 'squat', cloth: 'cloth_brown' });
  worker([xh0 + 0.7, C1.z - 3.0], y1 + 1.6, -Math.PI / 2, { pose: 'talk' });
  L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [xh0 + 1.0, C1.z - 1.9], y: y1 + 1.6, seed: 5 });
  monk([xh0 - 3.0, C1.z + 1.0], y1, -Math.PI / 2, { pose: 'cross', arms: 'pray' });
  monk([xh0 - 3.2, C1.z - 1.2], y1, -Math.PI / 2, { pose: 'cross', arms: 'pray' });
  monk([-71, C1.z + 7], y1, -Math.PI / 2, { pose: 'stand', carry: 'staff' });
  lay([-69, C1.z - 4], y1, Math.PI, { pose: 'talk' }); lay([-69, C1.z - 5], y1, 0, { pose: 'talk' });
  monk([-62.5, C1.z + 9.5], y1, Math.PI, { pose: 'sit_ground' });
  // Cave 19: monks at the stupa
  monk([-70.4, C19.z + 1.3], y1, -Math.PI / 2, { pose: 'kneel', arms: 'pray' }); lay([-69.6, C19.z - 0.6], y1, -Math.PI / 2, { pose: 'kneel', arms: 'pray' });
  woman([-67, C19.z + 2.0], y1, -Math.PI / 2, { pose: 'stand', carry: 'basket' });
  // Cave 12's cell: a monk reading on his stone bed
  monk([-62.8, C12.z + 2.2], y1 + 0.45, 0, { pose: 'cross' });
  // the ledge: monks, pilgrims and offerings
  for (const [z, rot] of [[-36, -Math.PI / 2], [3, Math.PI / 2], [12, -Math.PI / 2], [38, Math.PI / 2]]) monk([XF + 3.4, z], y1, rot, { pose: 'stand', carry: 'staff' });
  for (const [z, rot] of [[-45, 0.5], [8, 2.5], [30, 3.8], [52, -2.0]]) lay([XF + 4.2 + rand(), z], y1, rot, { pose: rand() < 0.5 ? 'pray' : 'talk' });
  monk([XF + 2.0, 6], y1, -Math.PI / 2, { pose: 'cross', arms: 'pray' });
  for (const z of [-8, 16]) L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [XF + 2.2, z], y: y1, seed: Math.round(z) });
  for (const z of [-44, -10, 29]) L.push({ t: 'basket', at: [XF + 4.6, z], y: y1, rot: z, seed: Math.round(z) });
  // the stair's foot and the path: pilgrims coming up, porters with rubble baskets, water carriers
  lay([XF + 9.2, -50], 0.0, 0.0, { pose: 'stand', carry: 'staff' }); monk([-47.5, -52], 0, Math.PI, { pose: 'sit_ground' });
  lay([-45, -44], 0, Math.PI / 2, { pose: 'talk' }); lay([-43.6, -44.4], 0, -Math.PI / 2, { pose: 'talk' });
  // the mason at the north wing's niche, his labourers with baskets, the chips; a boy grinding colour on the apron
  const mz = -ZW + 1.9;
  worker([XF + 15.8, mz], 1.8, Math.PI, { pose: 'talk', cloth: 'cloth_white', over: 'none' });
  worker([XF + 17.4, mz + 0.2], 3.6, Math.PI, { pose: 'squat' });
  worker([XF + 12.5, -ZW + 4.2], 0, Math.PI / 2, { pose: 'stand', carry: 'basket' }); worker([XF + 21.5, -ZW + 5.5], 0, -Math.PI / 2, { pose: 'stand', carry: 'basket' });
  worker([XF + 9.5, -ZW + 5.0], 0, 0.6, { pose: 'squat' });
  // the river: women washing, a man at the ford, an egret is the fauna's
  woman([riverX(-30) - 4.8, -30], 0, Math.PI / 2, { pose: 'squat' }); woman([riverX(-28) - 5.2, -27], 0, Math.PI / 2, { pose: 'stand', carry: 'pot', arms: 'head' });
  worker([riverX(14) + 6.2, 14.5], 0, -Math.PI / 2, { pose: 'stand', carry: 'staff' });
  // the village: the well and its women, hearths, grain, wood, fowl, goats and a zebu with a cart
  const [wx, wz] = WELL;
  L.push({ t: 'well', kind: 'shaduf', mat: 'rubble', at: [wx, wz], y: 0 });
  woman([wx + 1.8, wz + 0.5], 0, Math.PI / 2, { pose: 'stand', carry: 'pot', arms: 'head' }); woman([wx - 1.8, wz - 0.6], 0, -Math.PI / 2, { pose: 'talk' });
  woman([wx + 0.8, wz + 2.0], 0, Math.PI, { pose: 'squat' });
  L.push({ t: 'pot', kind: 'water_pot', n: 3, at: [wx + 2.6, wz + 1.6], y: 0, seed: 7 });
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, front = l.front === 's' ? z1 + 1.4 : z0 - 1.4;
    if (rand() < 0.5) L.push({ t: 'drying_tray', at: [cx + 1.2, front], y: 0, rot: 0, seed: seed() });
    if (rand() < 0.5) L.push({ t: 'firewood', at: [x1 + 0.6, (z0 + z1) / 2], y: 0, rot: 0, seed: seed() });
    if (rand() < 0.45) L.push({ t: 'pot', kind: 'water_pot', n: 2, at: [x0 - 0.5, front], y: 0, seed: seed() });
    if (rand() < 0.5) (rand() < 0.5 ? woman : worker)([cx - 1.4, front + (l.front === 's' ? 1.0 : -1.0)], 0, l.front === 's' ? 0 : Math.PI, { pose: rand() < 0.4 ? 'squat' : 'stand' });
  }
  L.push({ t: 'chickens', at: [wx - 6, wz + 4], y: 0, seed: 3 }); L.push({ t: 'chickens', at: [wx + 9, wz - 5], y: 0, seed: 4 });
  for (let k = 0; k < 4; k++) L.push({ t: 'animal', kind: 'goat', at: [wx - 10 + k * 1.6, wz + 7 + (k % 2)], y: 0, rot: rand() * 6.28, seed: 40 + k, graze: k % 2 === 0 });
  L.push({ t: 'cart', kind: 'two', beast: 'zebu', load: 'sacks', at: [wx + 12, wz + 3], y: 0, rot: Math.PI / 2, seed: 9 });
  L.push({ t: 'animal', kind: 'zebu', at: [wx + 15, wz - 8], y: 0, rot: 1.2, seed: 21, graze: true });
  L.push({ t: 'haystack', kind: 'pole', at: [VILLAGE[2] - 6, 40], y: 0, seed: 2 });
  for (let k = 0; k < 4; k++) { const x = -30 + rand() * 120, z = -60 + rand() * 130; if (!inRect(VILLAGE, x, z, 6) && x > -45 && Math.hypot(x - riverX(z), 0) > 8 && !PATHS.flat().some(([px, pz]) => Math.hypot(px - x, pz - z) < 6)) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 }); }
  return [base('ajanta-village', 'ajanta', E), base('ajanta-people', 'life', L)];
}
