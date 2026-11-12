// The village's own life (docs/settlements/dogon.md §4.1, §5, §7): the old men sitting under the toguna's low roof on mats and stools,
// women with jars on the place and the lanes, men talking, children, goats on the terraces and dogs about; people on the middle lane.
import { TOGUNA, PLACE, PLACE_Y, COMPOUNDS, FORGE, DYE, THRESH, PENS, SHADE, height, inCompound, nearBaobab } from './layout.js';
import { frontOf } from '../../styles/dogon/compound.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-90, -90, 90, 90], entrance: { at: [0, 30], facing: 'n' } });

export async function town() {
  const rand = rng(1930), P = [];
  const cl = (a) => a[Math.floor(rand() * a.length)];
  const SK = () => ({ skin: 'skin_dark', hairMat: 'hair_dark' });
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: cl(['cloth_indigo', 'cloth_white', 'cloth_blue', 'cloth_ochre']), cloth2: cl(['cloth_white', 'cloth_indigo']), over: 'shawl', hat: 'none', feet: 'bare', hair: 'bun', beard: false, ...SK(), ...o });
  const man = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'hose', cloth: cl(['cloth_indigo', 'cloth_white', 'cloth_blue', 'cloth_brown']), cloth2: cl(['cloth_indigo', 'cloth_white']), over: 'belt', hat: 'cap', feet: 'bare', hair: 'short', beard: false, ...SK(), ...o });
  const [cx, cz] = TOGUNA.c, F = TOGUNA.y + 0.12;
  // under the toguna: the elders on the bench and the stools (toguna.js: stools at +1.8/+0.6, +2.5/+1.0, −2.4/+1.6; mat at −1.8…+0.2 × +0.2…+1.4), facing the place
  man([cx + 1.8, cz + 0.6], F + 0.26, 0, { pose: 'sit', dress: 'robe', cloth: 'cloth_white', over: 'none' });
  man([cx - 2.4, cz + 1.6], F + 0.26, 0.5, { pose: 'sit' });
  man([cx - 0.9, cz + 0.8], F, 0.3, { pose: 'sit_ground', dress: 'robe', cloth: 'cloth_white', over: 'none' });
  // the place: women with jars, men talking in twos, children
  const at = (x, z) => P.every((p) => Math.hypot(p.at[0] - x, p.at[1] - z) > 1.6) && Math.hypot(x - cx, z - cz) > TOGUNA.w / 2 + 2.2;
  for (let k = 0; k < 18; k++) {
    const x = PLACE[0] + 2 + rand() * (PLACE[2] - PLACE[0] - 4), z = 22 + rand() * 10;
    if (!at(x, z)) continue;
    const r = rand(), rot = rand() * 6.28;
    if (r < 0.35) woman([x, z], PLACE_Y, rot, { carry: 'pot' });
    else if (r < 0.5) woman([x, z], PLACE_Y, rot, { child: true, h: 1.12 });
    else if (r < 0.8) { man([x, z], PLACE_Y, rot, { pose: 'talk' }); const b = [x - Math.sin(rot) * 1.1, z - Math.cos(rot) * 1.1]; man(b, PLACE_Y, rot + Math.PI); }
    else woman([x, z], PLACE_Y, rot);
  }
  // on the middle lane and the lanes between the rows
  for (let k = 0; k < 12; k++) {
    const x = (rand() < 0.5 ? -1 : 1) * (1.0 + rand() * 0.9), z = -30 + rand() * 54, y = height(x, z);
    if (!at(x, z)) continue;
    (rand() < 0.6 ? woman : man)([x, z], y, rand() < 0.5 ? 0 : Math.PI, rand() < 0.5 ? { carry: 'basket' } : {});
  }
  // goats and dogs on the slope and in the lanes, a few cattle on the plain
  const A = [];
  for (let k = 0; k < 14; k++) {
    const x = -50 + rand() * 100, z = -8 + rand() * 50;
    if (inCompound(x, z, 1.5) || nearBaobab(x, z, 3) || Math.hypot(x - cx, z - cz) < 7) continue;
    A.push({ t: 'animal', kind: k % 5 === 0 ? 'dog' : 'goat', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: k + 3 });
  }
  for (let k = 0; k < 4; k++) { const x = -30 + rand() * 60, z = 50 + rand() * 20; A.push({ t: 'animal', kind: 'zebu', at: [x, z], y: height(x, z), rot: rand() * 6.28, seed: 40 + k }); }
  // under the toguna's roof, at the loom: the weaver on his low stool at the east end, the strip growing before him
  man([cx + 1.75, cz - 1.35], F, Math.PI / 2, { pose: 'sit_low', cloth: 'cloth_white' });
  // the forge: the smith at his anvil, the boy at the bellows
  const [fx, fz] = FORGE.at, fy = height(fx, fz - 1.9) + 0.08;
  man([fx - 0.7, fz - 1.15], fy, 0, { pose: 'stand', legs: 'bare', dress: 'tunic', over: 'apron', hat: 'none', cloth: 'cloth_brown' });
  man([fx + 0.45, fz - 1.2], fy, 0, { pose: 'sit_low', child: true, h: 1.25 });
  man([fx - 1.9, fz + 1.0], height(fx - 1.9, fz + 1.0), 1.0, { pose: 'talk' });
  // the dyers' yard: women at the pits, one with a jar to the next
  const [dx, dz] = DYE.at, dy = height(dx, dz);
  for (const k of [0, 2]) woman([dx - 2.1 + k * 1.4, dz + 1.25], dy, 0.2, { cloth: 'cloth_indigo', cloth2: 'cloth_white' });
  woman([dx + 0.7, dz + 2.0], dy, Math.PI, { carry: 'pot' });
  woman([dx + 3.0, dz + 1.7], dy, -0.7, { pose: 'sit_low', cloth: 'cloth_indigo' });
  // the threshing floors: women pounding at the mortars (they face the mortar, two to each in turn), a man winnowing, children underfoot
  for (const t of THRESH) {
    const [tx, tz] = t.at, ty = height(tx, tz);
    woman([tx + 1.15, tz - 0.7], ty, -Math.PI / 2, { arms: 'hang' });
    woman([tx + 2.65, tz - 0.7], ty, Math.PI / 2, { arms: 'hang' });
    woman([tx + 0.85, tz + 0.9], ty, -Math.PI / 2, { arms: 'hang', cloth: 'cloth_ochre' });
    man([tx - 1.6, tz + 1.4], ty, 1.2, { pose: 'sit_ground' });
    P.push({ t: 'figure', at: [tx - 0.2, tz - 2.0], y: ty, rot: 0.7, seed: 8800 + Math.round(tx), dress: 'tunic', legs: 'bare', cloth: 'cloth_white', over: 'none', hat: 'none', feet: 'bare', hair: 'short', beard: false, child: true, h: 1.05, ...SK() });
  }
  // the fronts: at every compound's ginna, by the doors — what the day is doing there
  const L = [], seat = (x, z, yy, rot, o) => { L.push({ t: 'stool', at: [x, z], y: yy, rot }); (o.m ? man : woman)([x, z - 0.02], yy, rot, { pose: 'sit_low', ...o.f }); };
  for (const [n, c] of COMPOUNDS.entries()) {
    const f = frontOf(c), zz = f.zf + 1.5, r = rand;
    const gy = (x, z) => height(x, z);
    const d = f.doors[Math.floor(r() * f.doors.length)];
    L.push({ t: 'pot', kind: r() < 0.5 ? 'water_pot' : 'dark_pot', n: 2 + Math.floor(r() * 2), at: [d + (r() < 0.5 ? -1.4 : 1.4), f.zf + 0.9], y: f.y, rot: r() * 6, seed: n * 7 + 1 });
    if (r() < 0.6) L.push({ t: 'basket', n: 2, at: [f.x0 + 0.8 + r() * (f.x1 - f.x0 - 1.6), f.zf + 1.0], y: f.y, rot: r() * 6, seed: n * 7 + 2 });
    if (r() < 0.55) L.push({ t: 'chickens', kind: 'hen', n: 3 + Math.floor(r() * 3), at: [f.x0 + r() * (f.x1 - f.x0), zz + 0.3], y: gy(f.x0, zz), rot: r() * 6, seed: n * 7 + 3 });
    if (r() < 0.35) L.push({ t: 'sacks', n: 3, at: [f.x1 - 0.8, f.zf + 0.9], y: f.y, rot: 0, seed: n * 7 + 4 });
    // someone sitting at the door on a low stool: a woman sorting millet, a man mending, with a child by her
    if (r() < 0.6) {
      const x = d + (r() < 0.5 ? -1.9 : 1.9), z = f.zf + 1.5;
      if (x > f.x0 && x < f.x1) {
        seat(x, z, f.y, 0, { m: r() < 0.35, f: {} });
        if (r() < 0.5) P.push({ t: 'figure', at: [x + 0.8, z + 0.3], y: f.y, rot: 0.6, seed: n * 91 + 5, dress: 'tunic', legs: 'bare', cloth: cl(['cloth_white', 'cloth_ochre']), over: 'none', hat: 'none', feet: 'bare', hair: 'short', beard: false, child: true, h: 1.1, pose: 'sit_ground', ...SK() });
      }
    }
    // washing hung on a line across the front of some, the compound's goat tied at the wall of others
    if (r() < 0.3) L.push({ t: 'laundry', len: 2.5, at: [f.x0 + 1.4 + r() * (f.x1 - f.x0 - 2.8), f.zf + 2.6], y: gy(f.x0 + 2, f.zf + 2.6), rot: 0, seed: n * 7 + 5 });
    if (r() < 0.5) A.push({ t: 'animal', kind: r() < 0.7 ? 'goat' : 'sheep', at: [f.x0 + r() * (f.x1 - f.x0), zz + 1.2], y: gy(f.x0, zz + 1.2), rot: r() * 6, seed: n * 13 + 5 });
    if (r() < 0.2) A.push({ t: 'animal', kind: 'dog', at: [f.x0 + r() * (f.x1 - f.x0), zz + 0.6], y: gy(f.x0, zz + 0.6), rot: r() * 6, seed: n * 13 + 7 });
  }
  // the place: mats of goods (millet cakes in baskets, cotton cloth, pots, tobacco, iron work from the smith), sellers behind them, shoppers
  for (const [i, [mx, mz]] of [[6, 30.2], [8.6, 29.4], [11.2, 30.6], [-13.5, 31], [-16, 30.2]].entries()) {
    L.push({ t: 'goods_mat', at: [mx, mz], y: PLACE_Y, rot: 0, goods: i % 2 ? ['basket', 'water_pot', 'dark_pot'] : ['heap', 'basket'], seed: 400 + i });
    woman([mx, mz - 0.1], PLACE_Y, Math.PI, { pose: 'sit_ground' });
  }
  for (const [i, t] of SHADE.slice(0, 2).entries()) {
    L.push({ t: 'bench', at: [t.at[0] + 1.6, t.at[1] + 1.4], y: PLACE_Y, rot: 0.3 + i, seed: 9 + i });
    man([t.at[0] - 1.2, t.at[1] + 1.8], PLACE_Y, 0.5, { pose: 'sit_ground' });
  }
  // the pens: goats and a few sheep inside, a boy with a stick at the gap
  for (const [i, p] of PENS.entries()) {
    const [px, pz] = p.at, py = height(px, pz);
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + i, rr = 0.8 + (k % 3) * 0.55; A.push({ t: 'animal', kind: k % 3 === 2 ? 'sheep' : 'goat', at: [px + Math.cos(a) * rr, pz + Math.sin(a) * rr], y: py, rot: a + 1.3, seed: 70 + i * 10 + k }); }
  }
  A.push({ t: 'animal', kind: 'donkey', at: [-39, 28.4], y: PLACE_Y, rot: 1.7, seed: 99 }, { t: 'animal', kind: 'donkey', at: [22.5, 22], y: PLACE_Y, rot: 3.5, seed: 98 });
  void COMPOUNDS;
  return [plan('dogon-people', 'life', [...P, ...A, ...L])];
}
