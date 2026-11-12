// The gorge floor's life and the workers' village (docs/settlements/ajanta.md §6, §7): mud-walled huts with thatch
// round a yard with its well on the east bank, a pilgrims' shelter at the stair's foot, the monks, painters, masons and
// worshippers at the caves, goats, zebu and fowl.
import { RADIUS, RIVER, EAST, XF, ZW, FLOOR, VILLAGE, WELL, PEN, THRESH, VSHRINE, GRANARIES, GHATS, C1, C19, C12, PATHS, rng, inRect, riverX } from './layout.js';
import '../../styles/ajanta/index.js';

const base = (id, style, elements, b = 0) => ({ id, style, origin: [0, 0], base: b, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-20, 14], facing: 'w' } });

/** Every hut: { rect, front, seed }, exported for the movers and the smoke. */
export function lots() {
  const r = rng(480), out = [], [vx0, , vx1] = VILLAGE;
  const rows = [{ zc: 12, front: 's' }, { zc: 52, front: 'n' }, { zc: 64, front: 's' }, { zc: 76, front: 'n' }];
  rows.forEach((row, ri) => {
    for (let x = vx0 + 6; x < vx1 - 6; x += 8.5 + r() * 3) {
      const w = 4.6 + r() * 1.8, d = 3.8 + r() * 1.4, cx = x + w / 2, cz = row.zc + (r() - 0.5) * 2;
      const rect = [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2];
      const k = r(), skip = r() < 0.12 || Math.abs(rect[0] - WELL[0]) < 3 && Math.abs(rect[1] - WELL[1]) < 3;
      if (skip) continue;
      let variant = k < 0.3 ? 0 : k < 0.55 ? 1 : k < 0.8 ? 2 : 3;
      if (variant === 2 && row.front === 'n') variant = 1;
      out.push({ rect, front: row.front, row: ri, variant, seed: Math.round(x * 13 + row.zc * 7), mud: r() < 0.3 ? 'earth_wall' : 'mud_plaster' });
    }
  });
  return out;
}

export async function town() {
  const E = [], L = [], V = [], rand = rng(481), seed = () => Math.floor(rand() * 1e9);
  const LOTS = lots();
  for (const l of LOTS) E.push({ t: 'aj_house', rect: l.rect, front: l.front, mud: l.mud, variant: l.variant, seed: l.seed });
  // low mud walls close the street front between the houses (a gap left to pass)
  for (let i = 0; i < LOTS.length - 1; i++) {
    const a = LOTS[i], b = LOTS[i + 1];
    if (a.row !== b.row || a.variant === 2 || b.variant === 2) continue;
    const gap = b.rect[0] - a.rect[2];
    if (gap < 1.5 || gap > 7) continue;
    const z = a.front === 's' ? (a.rect[3] + b.rect[3]) / 2 - 0.3 : (a.rect[1] + b.rect[1]) / 2 + 0.3, mid = (a.rect[2] + b.rect[0]) / 2;
    if (gap > 3) { E.push({ t: 'aj_mudwall', pts: [[a.rect[2], z], [mid - 0.6, z]] }); E.push({ t: 'aj_mudwall', pts: [[mid + 0.6, z], [b.rect[0], z]] }); }
    else E.push({ t: 'aj_mudwall', pts: [[a.rect[2], z], [b.rect[0], z]] });
  }
  for (const [gx, gz] of GRANARIES) E.push({ t: 'aj_granary', at: [gx, gz], y: 0 });
  E.push({ t: 'aj_pen', rect: PEN, gate: 'n', seed: 5 });
  E.push({ t: 'aj_thresh', at: THRESH, r: 4.2 });
  E.push({ t: 'aj_vshrine', at: VSHRINE });
  // ── the life
  let T = L;
  const CL = ['cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_brown'];
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const monk = (at, y, rot, o = {}) => T.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'robe', cloth: pick(['cloth_ochre', 'cloth_ochre', 'cloth_maroon']), over: 'sash', hat: 'none', hair: 'shaven', skin: 'skin_medium', pose: 'stand', ...o });
  const lay = (at, y, rot, o = {}) => T.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'wrap', cloth: pick(['cloth_white', 'cloth_white', 'cloth_ochre']), over: 'shawl', hat: rand() < 0.4 ? 'turban' : 'none', skin: pick(['skin_medium', 'skin_dark']), pose: 'stand', ...o });
  const worker = (at, y, rot, o = {}) => T.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'wrap', top: 'bare', cloth: pick(['cloth_white', 'cloth_brown']), over: 'none', hat: 'none', skin: pick(['skin_dark', 'skin_medium']), pose: 'stand', ...o });
  const woman = (at, y, rot, o = {}) => T.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'wrap', cloth: pick(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_blue']), over: 'shawl', hair: 'bun', skin: pick(['skin_medium', 'skin_dark']), pose: 'stand', ...o });
  const y1 = FLOOR[1];
  // Cave 1: a painter and his boy on the scaffold at Vajrapani, a monk before the Buddha, a worshipper at the porch
  const xh0 = -60 - 3.8 - 1.0 - 19.5;
  worker([xh0 + 0.5, C1.z - 2.7], y1 + 3.2, -Math.PI / 2, { pose: 'talk', cloth: 'cloth_white' });
  worker([xh0 + 0.9, C1.z - 3.5], y1 + 3.2, -Math.PI / 2, { pose: 'squat', cloth: 'cloth_brown' });
  worker([xh0 + 0.7, C1.z - 3.0], y1 + 1.6, -Math.PI / 2, { pose: 'talk' });
  T.push({ t: 'pot', kind: 'water_pot', n: 3, at: [xh0 + 1.0, C1.z - 1.9], y: y1 + 1.6, seed: 5 });
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
  for (const z of [-8, 16]) T.push({ t: 'pot', kind: 'water_pot', n: 3, at: [XF + 2.2, z], y: y1, seed: Math.round(z) });
  for (const z of [-44, -10, 29]) T.push({ t: 'basket', at: [XF + 4.6, z], y: y1, rot: z, seed: Math.round(z) });
  // the path along the gorge floor below the painted caves, seen from the arrival (-42, -4): pilgrims, porters and monks going up the gorge to the stair, women with pots coming down, a monk resting by the way
  monk([-47.2, -12.5], 0, 0, { pose: 'stand', carry: 'staff' });
  lay([-46.4, -17.2], 0, 0, { pose: 'stand', carry: 'basket' });
  woman([-49.1, -9.0], 0, Math.PI, { pose: 'stand', carry: 'pot', arms: 'head' }); woman([-48.0, -7.4], 0, Math.PI, { pose: 'stand', carry: 'basket' });
  worker([-47.6, -24.5], 0, 0, { pose: 'stand', carry: 'basket' }); worker([-48.6, -27.0], 0, 0, { pose: 'stand', carry: 'basket' });
  monk([-44.2, -21.5], 0, Math.PI / 2, { pose: 'sit_ground' }); lay([-43.0, -22.4], 0, Math.PI / 2, { pose: 'talk' });
  T.push({ t: 'pot', kind: 'water_pot', n: 3, at: [-45.2, -14.0], y: 0, seed: 13 }); T.push({ t: 'basket', at: [-44.6, -19.6], y: 0, rot: 1.0, seed: 14 });
  T.push({ t: 'animal', kind: 'zebu', at: [-44.5, -31.0], y: 0, rot: 2.6, seed: 15, graze: true });
  // the stair's foot and the path: pilgrims coming up, porters with rubble baskets, water carriers
  lay([XF + 9.2, -50], 0.0, 0.0, { pose: 'stand', carry: 'staff' }); monk([-43.5, -49.6], 0.06, Math.PI, { pose: 'sit_ground' });
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
  // the flower and lamp-oil sellers' stalls along the path to the stair, a basket seller on a mat
  for (const [x, goods, aw] of [[-32, ['produce', 'basket'], 'cloth_ochre'], [-27, ['water_pot', 'cloth'], 'cloth_red'], [-22, ['basket', 'produce'], 'cloth_white']]) {
    T.push({ t: 'stall', at: [x, -46.9], y: 0, rot: 0, awning: aw, goods, seed: seed() });
    (rand() < 0.5 ? woman : worker)([x, -48.0], 0, 0, { pose: 'stand' });
  }
  lay([-29.5, -43.3], 0, Math.PI, { pose: 'talk' }); lay([-24.6, -43.5], 0, 3.6, { pose: 'stand' }); monk([-18.5, -44.6], 0, Math.PI / 2, { pose: 'stand', carry: 'staff' });
  // the masons' and painters' yard: the grinder of colours, the lime-stirrer, the chiseller at the pillar
  woman([XF + 22.7, -ZW + 9.9], 0, 0, { pose: 'squat', cloth: 'cloth_ochre' });
  worker([XF + 25.0, -ZW + 9.9], 0, Math.PI, { pose: 'squat', cloth: 'cloth_brown' });
  worker([XF + 29.5, -ZW + 11.2], 0, Math.PI / 2, { pose: 'stand', carry: 'staff' });
  worker([XF + 24.5, -ZW + 6.5], 0, Math.PI, { pose: 'squat', cloth: 'cloth_white' });
  worker([XF + 27.0, -ZW + 3.0], 0, 2.2, { pose: 'talk', cloth: 'cloth_brown' });
  // the washing places: the women kneeling at the stones, a buffalo and her herdboy in the shallows
  for (const gz of GHATS) {
    for (const k of [-1.8, 0.2, 2.2]) woman([riverX(gz + k) - 5.4, gz + k], 0.12, Math.PI / 2, { pose: k > 0 ? 'squat' : 'stand', carry: k > 1 ? 'basket' : 'none' });
  }
  T.push({ t: 'animal', kind: 'buffalo', at: [riverX(34) + 3.2, 38], y: -0.3, rot: 1.0, seed: 71 }); T.push({ t: 'animal', kind: 'buffalo', at: [riverX(34) + 2.5, 41], y: -0.3, rot: 2.0, seed: 72 });
  worker([riverX(34) + 6.2, 39], 0, -Math.PI / 2, { pose: 'stand', carry: 'staff' });
  // pigeons on the ledge before the painted caves
  T.push({ t: 'chickens', kind: 'pigeon', at: [XF + 3.0, -12], y: FLOOR[1], seed: 5 }); T.push({ t: 'chickens', kind: 'pigeon', at: [XF + 3.0, 28], y: FLOOR[1], seed: 6 });
  // ── the arrival's view (the east bank's path at (-21.5, -4), looking west-north-west across the river at the cave row)
  // the river's foreground: a herd boy and two buffalo wallowing in the shallows, a reed boat drawn up on the bank, a fisherman
  T.push({ t: 'animal', kind: 'buffalo', at: [riverX(-9) + 2.4, -9], y: -0.3, rot: 1.9, seed: 81 });
  T.push({ t: 'animal', kind: 'buffalo', at: [riverX(-12) + 3.1, -12.5], y: -0.3, rot: 1.2, seed: 82, graze: true });
  worker([riverX(-9) + 7.4, -9.5], 0, -1.9, { pose: 'stand', carry: 'staff', cloth: 'cloth_ochre' });
  T.push({ t: 'boat', kind: 'reed', at: [riverX(-17) + 4.4, -17], y: RIVER.water - 0.12, rot: 0.25, seed: 83 });
  worker([riverX(-17) + 8.0, -15.8], 0, -1.6, { pose: 'sit_ground', cloth: 'cloth_white' });
  T.push({ t: 'basket', at: [riverX(-17) + 8.6, -17.2], y: 0, rot: 0.4, seed: 84 });
  // the east bank's path: a family going up to the ford with a bundle, a woman with water, a pair of monks with bowls, a boy with goats
  monk([riverX(2) + 8.7, 3], 0, 0, { pose: 'stand', carry: 'staff' }); monk([riverX(2) + 9.9, 5.2], 0, 0, { pose: 'stand' });
  lay([riverX(8) + 8.4, 9.5], 0, 0.2, { pose: 'stand', carry: 'basket' }); woman([riverX(8) + 9.4, 10.6], 0, 0.1, { pose: 'stand', carry: 'child' });
  woman([riverX(-25) + 8.8, -25.5], 0, Math.PI, { pose: 'stand', carry: 'pot', arms: 'head' });
  worker([riverX(-30) + 12.5, -30], 0, 2.4, { pose: 'stand', carry: 'staff' });
  for (let k = 0; k < 4; k++) T.push({ t: 'animal', kind: 'goat', at: [riverX(-30) + 10.5 + (k % 2) * 1.5, -33 + k * 1.2], y: 0, rot: 1.5 + k, seed: 85 + k, graze: k % 2 === 0 });
  // across the river: the washing place's women are GHATS' own; the pilgrims climbing the stair to the ledge (the ramp's height under each)
  { const sx = XF + 7.2; for (const [z, k] of [[-55.2, 0], [-51.8, 1], [-47.6, 2], [-44.2, 3]]) { const y = (z + 57) / 15 * 9; (k % 2 ? lay : monk)([sx, z], y, 0, { pose: 'stand', carry: k === 1 ? 'basket' : k === 3 ? 'staff' : 'none' }); } }
  // before Cave 1's porch: the faithful coming with offerings, two lay friends in talk, a flute and a lute at the ledge's edge, a monk at his meditation in the porch, three standing in its pillars
  lay([-56.6, -33.2], y1, -Math.PI / 2, { pose: 'stand', carry: 'basket' }); woman([-56.3, -31.4], y1, -Math.PI / 2, { pose: 'stand', carry: 'pot', arms: 'head' }); monk([-57.0, -29.4], y1, -Math.PI / 2, { pose: 'stand', carry: 'staff' });
  lay([-57.0, -20.4], y1, Math.PI / 2 + 0.3, { pose: 'talk' }); monk([-58.2, -19.2], y1, -Math.PI / 2 - 0.3, { pose: 'talk' });
  monk([-56.7, -12.6], y1, -Math.PI / 2, { pose: 'cross', carry: 'flute' }); lay([-56.1, -14.1], y1, -Math.PI / 2, { pose: 'cross', carry: 'lute' });
  monk([-62.6, -23.9], y1, Math.PI / 2, { pose: 'cross', arms: 'pray' });
  for (const [z, rot] of [[-33.6, 0.4], [-29.6, -0.3], [-21.8, 0.2]]) lay([-62.2, z], y1, Math.PI / 2 + rot, { pose: 'stand' });
  monk([-62.0, -17.8], y1, Math.PI / 2, { pose: 'stand', carry: 'staff' });
  // before Cave 19: a pair of monks come from the cell, pilgrims at the chaitya's porch, a woman with a lamp-oil jar
  monk([-56.4, 17.0], y1, Math.PI, { pose: 'stand' }); lay([-57.0, 19.2], y1, -Math.PI / 2, { pose: 'talk' }); monk([-57.6, 20.4], y1, -Math.PI / 2 + 0.4, { pose: 'talk' });
  woman([-57.3, 30.0], y1, Math.PI / 2, { pose: 'stand', carry: 'pot', arms: 'head' }); lay([-58.9, 27.0], y1, Math.PI / 2, { pose: 'kneel', arms: 'pray' }); lay([-58.4, 21.6], y1, Math.PI / 2, { pose: 'kneel', arms: 'pray' });
  T = V;
  // the village: the well and its women, hearths, grain, wood, fowl, goats and a zebu with a cart
  const [wx, wz] = WELL;
  T.push({ t: 'well', kind: 'shaduf', mat: 'rubble', at: [wx, wz], y: 0 });
  woman([wx + 1.8, wz + 0.5], 0, Math.PI / 2, { pose: 'stand', carry: 'pot', arms: 'head' }); woman([wx - 1.8, wz - 0.6], 0, -Math.PI / 2, { pose: 'talk' });
  woman([wx + 0.8, wz + 2.0], 0, Math.PI, { pose: 'squat' });
  T.push({ t: 'pot', kind: 'water_pot', n: 3, at: [wx + 2.6, wz + 1.6], y: 0, seed: 7 });
  for (const l of LOTS) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, front = l.front === 's' ? z1 + 1.4 : z0 - 1.4;
    if (rand() < 0.5) T.push({ t: 'drying_tray', at: [cx + 1.2, front], y: 0, rot: 0, seed: seed() });
    if (rand() < 0.5) T.push({ t: 'firewood', at: [x1 + 0.6, (z0 + z1) / 2], y: 0, rot: 0, seed: seed() });
    if (rand() < 0.45) T.push({ t: 'pot', kind: 'water_pot', n: 2, at: [x0 - 0.5, front], y: 0, seed: seed() });
    if (rand() < 0.5) (rand() < 0.5 ? woman : worker)([cx - 1.4, front + (l.front === 's' ? 1.0 : -1.0)], 0, l.front === 's' ? 0 : Math.PI, { pose: rand() < 0.4 ? 'squat' : 'stand' });
  }
  // the pen: two zebu and a calf-sized goat herd inside, the herdsman at the gate; the threshing floor at work; the shrine's keeper
  T.push({ t: 'animal', kind: 'zebu', at: [(PEN[0] + PEN[2]) / 2 - 1.5, (PEN[1] + PEN[3]) / 2 + 1], y: 0, rot: 0.6, seed: 61 });
  T.push({ t: 'animal', kind: 'buffalo', at: [(PEN[0] + PEN[2]) / 2 + 1.6, (PEN[1] + PEN[3]) / 2 + 0.8], y: 0, rot: 2.4, seed: 62, graze: true });
  T.push({ t: 'animal', kind: 'goat', at: [PEN[0] + 1.2, PEN[3] - 1.2], y: 0, rot: 1.0, seed: 63 });
  worker([(PEN[0] + PEN[2]) / 2 + 2.6, PEN[1] - 1.0], 0, 0.3, { pose: 'stand', carry: 'staff' });
  worker([THRESH[0] - 1.6, THRESH[1] + 0.8], 0, 1.0, { pose: 'stand', carry: 'staff' }); woman([THRESH[0] + 1.8, THRESH[1] + 2.4], 0, -2.0, { pose: 'squat' }); woman([THRESH[0] - 2.2, THRESH[1] + 1.6], 0, 0.8, { pose: 'talk' });
  T.push({ t: 'sacks', at: [THRESH[0] + 3.2, THRESH[1] + 3.3], y: 0, seed: 3 });
  monk([VSHRINE[0] + 1.6, VSHRINE[1] + 2.0], 0, Math.PI, { pose: 'kneel', arms: 'pray', cloth: 'cloth_white', hair: 'long', dress: 'wrap' });
  T.push({ t: 'pot', kind: 'water_pot', n: 2, at: [VSHRINE[0] - 1.6, VSHRINE[1] + 1.5], y: 0, seed: 11 });
  for (const l of LOTS) {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, front = l.front === 's' ? z1 + (l.variant === 2 ? 3.7 : l.variant === 1 ? 2.2 : 1.4) : z0 - (l.variant === 1 ? 2.2 : 1.4);
    if (rand() < 0.3) { T.push({ t: 'stool', at: [cx + 1.3, front + (l.front === 's' ? 0.5 : -0.5)], y: 0, rot: 0, seed: seed() }); woman([cx + 1.3, front + (l.front === 's' ? 0.5 : -0.5)], 0.0, l.front === 's' ? 0 : Math.PI, { pose: 'sit_low' }); }
    if (rand() < 0.3) T.push({ t: 'animal', kind: rand() < 0.5 ? 'goat' : 'dog', at: [x0 - 1.2, front], y: 0, rot: rand() * 6.28, seed: seed(), graze: rand() < 0.5 });
    if (rand() < 0.25) T.push({ t: 'chickens', at: [x1 + 1.8, front], y: 0, seed: seed() });
    if (rand() < 0.3) T.push({ t: 'basket', at: [x1 + 0.6, front], y: 0, rot: rand() * 6, seed: seed() });
  }
  T.push({ t: 'chickens', at: [wx - 6, wz + 4], y: 0, seed: 3 }); T.push({ t: 'chickens', at: [wx + 9, wz - 5], y: 0, seed: 4 });
  for (let k = 0; k < 4; k++) T.push({ t: 'animal', kind: 'goat', at: [wx - 10 + k * 1.6, wz + 7 + (k % 2)], y: 0, rot: rand() * 6.28, seed: 40 + k, graze: k % 2 === 0 });
  T.push({ t: 'cart', kind: 'two', beast: 'zebu', load: 'sacks', at: [wx + 12, wz + 3], y: 0, rot: Math.PI / 2, seed: 9 });
  T.push({ t: 'animal', kind: 'zebu', at: [wx + 15, wz - 8], y: 0, rot: 1.2, seed: 21, graze: true });
  T.push({ t: 'haystack', kind: 'pole', at: [VILLAGE[2] - 6, 40], y: 0, seed: 2 });
  T = L;
  for (let k = 0; k < 4; k++) { const x = -46 + rand() * 30, z = -60 + rand() * 130; if (!inRect(VILLAGE, x, z, 6) && Math.hypot(x - riverX(z), 0) > 8 && !PATHS.flat().some(([px, pz]) => Math.hypot(px - x, pz - z) < 6)) T.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 }); }
  return [base('ajanta-village', 'ajanta', E, EAST), base('ajanta-people', 'life', L), base('ajanta-village-life', 'life', V, EAST)];
}
