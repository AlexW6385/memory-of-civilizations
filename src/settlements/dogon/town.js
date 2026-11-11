// The village's own life (docs/settlements/dogon.md §4.1, §5, §7): the old men sitting under the toguna's low roof on mats and stools,
// women with jars on the place and the lanes, men talking, children, goats on the terraces and dogs about; people on the middle lane.
import { TOGUNA, PLACE, PLACE_Y, COMPOUNDS, height, inCompound, nearBaobab } from './layout.js';

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
  void COMPOUNDS;
  return [plan('dogon-people', 'life', [...P, ...A])];
}
