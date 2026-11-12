// The village's eye-level dressing beyond the fronts' own (docs/settlements/dogon.md §4.1, §7): the market on the place under cloth
// awnings (the Dogon market runs on a five-day week; the stalls of cotton strips, indigo cloth, millet, shallots, pots and iron), wood
// stacked at the walls, shallots and millet spread to dry on mats at the doors, children at play in the lanes, the farmers in the millet
// on the plain with the sacks at the field's edge. Static life figures and goods in the village's own coordinates (layout.js).
import { PLACE, PLACE_Y, COMPOUNDS, TOGUNA, height, inCompound, nearBaobab } from './layout.js';
import { frontOf } from '../../styles/dogon/compound.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const ARRIVAL = [4.5, 27.5];

export function dressing() {
  const rand = rng(4417), E = [];
  const SK = { skin: 'skin_dark', hairMat: 'hair_dark' };
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (at, y, rot, o = {}) => E.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: pick(['cloth_indigo', 'cloth_white', 'cloth_blue', 'cloth_ochre']), cloth2: pick(['cloth_white', 'cloth_indigo']), over: 'shawl', hat: 'none', feet: 'bare', hair: 'bun', beard: false, ...SK, ...o });
  const man = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'tunic', legs: 'hose', cloth: pick(['cloth_indigo', 'cloth_white', 'cloth_blue', 'cloth_brown']), over: 'belt', hat: 'cap', hair: 'short', ...o });
  const child = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'tunic', legs: 'bare', cloth: pick(['cloth_white', 'cloth_ochre']), over: 'none', hair: 'short', child: true, h: 1.0 + rand() * 0.15, ...o });
  const farAway = (x, z, m = 6) => Math.hypot(x - ARRIVAL[0], z - ARRIVAL[1]) > m;

  // the market on the place, along its north edge, the sellers behind their tables on stools, buyers before them
  const stalls = [[9.4, 23.4, 'cloth_white', 'cloth_indigo', ['cloth', 'basket']], [12.9, 23.4, 'cloth_indigo', null, ['produce', 'basket']], [-13.4, 22.8, 'cloth_ochre', 'cloth_white', ['cloth', 'produce']], [-16.6, 22.8, 'cloth_white', null, ['basket', 'produce']]];
  stalls.forEach(([x, z, aw, stripe, goods], i) => {
    E.push({ t: 'stall', at: [x, z], y: PLACE_Y, rot: 0, awning: aw, stripe: stripe ?? undefined, goods, w: 2.4, d: 1.3, seed: 700 + i });
    E.push({ t: 'stool', at: [x, z - 1.0], y: PLACE_Y, rot: Math.PI });
    (i % 2 ? man : fig)([x, z - 1.02], PLACE_Y, Math.PI, { pose: 'sit_low' });
    const bx = x + (rand() - 0.5) * 1.4;
    if (rand() < 0.8) fig([bx, z + 1.5], PLACE_Y, 0, { carry: rand() < 0.5 ? 'basket' : 'pot', pose: 'stand' });
    if (rand() < 0.5) man([bx + 1.1, z + 1.7], PLACE_Y, -0.4, { pose: 'talk' });
  });
  // more mats of goods and pots on the earth, wood and shallots at the shade trees
  for (const [i, [mx, mz]] of [[2.0, 31.6], [-18.5, 30.8], [-20.6, 31.4], [20.4, 31.6]].entries()) {
    if (!farAway(mx, mz, 2.4)) continue;
    E.push({ t: 'goods_mat', at: [mx, mz], y: PLACE_Y, rot: 0.15 * i, goods: pick([['heap', 'basket'], ['water_pot', 'dark_pot', 'basket'], ['heap']]), seed: 900 + i });
    (i % 2 ? man : fig)([mx, mz - 0.1], PLACE_Y, Math.PI, { pose: 'sit_ground' });
  }
  // the lanes' fronts: wood stacked at the wall, shallots and millet drying on a mat at the door
  for (const [n, c] of COMPOUNDS.entries()) {
    if (c.landmark) continue;
    const f = frontOf(c), w = f.x1 - f.x0;
    if (rand() < 0.45) E.push({ t: 'firewood', at: [f.x0 + 0.9, f.zf + 0.75], y: f.y, rot: 0, len: 1.2, seed: n });
    if (rand() < 0.4 && w > 5) {
      const x = f.x0 + w * (0.3 + rand() * 0.4);
      E.push({ t: 'goods_mat', at: [x, f.zf + 1.5], y: f.y, rot: 0, goods: ['heap', 'basket'], seed: 1200 + n });
    }
    // a child or two playing before the door, a dog asleep in the dust
    if (rand() < 0.35) { const x = f.x0 + 1.2 + rand() * (w - 2.4), z = f.zf + 1.6 + rand(); if (farAway(x, z)) { child([x, z], f.y, rand() * 6.28, { pose: rand() < 0.5 ? 'stand' : 'sit_ground' }); if (rand() < 0.6) child([x + 0.9, z + 0.4], f.y, rand() * 6.28); } }
    if (rand() < 0.2) E.push({ t: 'animal', kind: 'dog', at: [f.x0 + rand() * w, f.zf + 2.0], y: f.y, rot: rand() * 6.28, seed: n * 5 + 9 });
  }
  // the millet fields: the farmers at the hoe, the sacks and the donkey at the field's edge, a woman bringing the water jar
  for (let k = 0; k < 16; k++) {
    const x = -62 + rand() * 124, z = 47 + rand() * 24;
    if (Math.hypot(x, z) > 80 || nearBaobab(x, z, 3)) continue;
    const y = height(x, z);
    if (rand() < 0.7) man([x, z], y, rand() * 6.28, { carry: 'staff', arms: 'staff', cloth: pick(['cloth_indigo', 'cloth_brown', 'cloth_white']) });
    else fig([x, z], y, rand() * 6.28, { carry: 'pot', arms: 'head' });
  }
  for (const [x, z] of [[-18, 45.5], [22, 45]]) { E.push({ t: 'sacks', n: 4, at: [x, z], y: height(x, z), rot: rand() * 3, seed: Math.round(x) }); }
  E.push({ t: 'animal', kind: 'donkey', at: [-16, 46.5], y: height(-16, 46.5), rot: 2.2, seed: 301 });
  // a little troop of goats on the slope above the compounds' row A, a herdboy with his stick
  { const bx = -44, bz = -20, by = height(bx, bz);
    for (let k = 0; k < 5; k++) E.push({ t: 'animal', kind: k % 4 === 3 ? 'sheep' : 'goat', at: [bx + rand() * 5, bz + rand() * 4], y: height(bx + 2.5, bz + 2), rot: rand() * 6.28, seed: 500 + k });
    child([bx + 5.5, bz + 1], by, 2.4, { carry: 'staff', arms: 'staff', h: 1.2 }); }
  // the lane crossings: a bench of logs where two lanes meet, the old men on it with their staffs, talking
  for (const [bx, bz] of [[3.9, -3.2], [-3.9, -3.2], [3.9, -19.6], [-3.9, -19.6]]) {
    const by = height(bx, bz);
    E.push({ t: 'bench', at: [bx, bz], y: by, rot: 0, len: 1.9, mat: 'timber', seed: Math.round(bx * 3 + bz) });
    man([bx - 0.4, bz + 0.02], by + 0.47, 0, { pose: 'sit', dress: 'robe', cloth: 'cloth_white', over: 'none', carry: 'staff' });
    if (rand() < 0.8) man([bx + 0.45, bz + 0.02], by + 0.47, 0.2, { pose: 'sit' });
    if (rand() < 0.5) child([bx + 1.5, bz + 0.9], by, 3.4, { pose: 'sit_ground' });
  }
  void PLACE; void TOGUNA; void inCompound;
  return E;
}
