// The people on the terrace (docs/settlements/persepolis.md §13): guards — the "apple bearers" in Persian dress with
// their pleated headdresses, spears with golden pomegranates and quivers — at the Gate of All Nations and at the foot
// of the Apadana's north stairway; delegations of the peoples, each led by an usher, carrying their vessels and
// leading their animals from the gate toward the Apadana, as the stairways' reliefs show them (Livius).
import { TERRACE, ROAD, MARKET } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const T = TERRACE.h, E = -Math.PI / 2, N = 0, S = Math.PI, W = Math.PI / 2;     // the figure's rot to face east, north, south, west

/** { figures (style 'life'), gear (style 'achaemenid': headdresses, spearheads, quivers, vessels) }. */
export function people() {
  const rand = rng(480), figures = [], gear = [], seed = () => Math.floor(rand() * 1e9);
  const guard = (at, rot, i) => {
    const el = { at, y: T, rot, h: 1.78, seed: seed(), len: 2.3 };
    figures.push({ t: 'figure', ...el, dress: 'robe', cloth: i % 2 ? 'cloth_ochre' : 'cloth_white', cloth2: 'cloth_red', over: 'sash', hair: 'short', beard: true, hairMat: 'hide_black', skin: 'skin_medium', hat: 'none', feet: 'shod', carry: 'staff', staffMat: 'wood_dark' });
    gear.push({ t: 'guard_gear', ...el, hatMat: i % 2 ? 'cloth_white' : 'cloth_ochre' });
  };
  // the Gate of All Nations: a pair at each door, clear of the colossi; the Apadana's north stairway
  [[[-112 - 3.2, -125.6], S], [[-112 + 3.2, -125.6], S], [[-91, -143.2], E], [[-91, -136.8], E], [[-134, -143.6], W], [[-134, -136.4], W],
    [[-48.6, -118.4], N], [[-11.4, -118.4], N], [[-46, -120.5], N], [[-14, -120.5], N]].forEach(([at, rot], i) => guard(at, rot, i));
  // the delegations, walking east from the gate toward the Apadana in a file along z = −123
  const z = -123.2;
  const D = [
    { who: 'Armenians', dress: 'trousers', hat: 'cap', cloth: ['cloth_red', 'cloth_brown'], gift: ['jar', 'silver'], beast: 'horse' },
    { who: 'Babylonians', dress: 'robe', hat: 'cap', cloth: ['cloth_indigo', 'cloth_white'], gift: ['bowl', 'gold'], beast: 'zebu' },
    { who: 'Syrians', dress: 'robe', hat: 'none', over: 'belt', cloth: ['cloth_white', 'cloth_ochre'], gift: ['bowl', 'bronze'], beast: 'sheep', two: true },
    { who: 'Arabs', dress: 'robe', hat: 'none', cloth: ['cloth_white', 'linen'], gift: ['phial', 'gold'], beast: 'camel' },
    { who: 'Indians', dress: 'wrap', top: 'bare', hat: 'turban', cloth: ['cloth_white', 'cloth_ochre'], gift: ['jar', 'gold'], beast: 'buffalo', skin: 'skin_dark' },
  ];
  let x = -50;
  for (const d of D) {
    // the usher, a Persian courtier with his staff, leading the delegation's first man
    const u = { at: [x, z - 0.4], y: T, rot: E, h: 1.75, seed: seed(), len: 1.2 };
    figures.push({ t: 'figure', ...u, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'sash', hair: 'short', beard: true, hat: 'none', feet: 'shod', skin: 'skin_medium', carry: 'staff', staffMat: 'wood_dark' });
    gear.push({ t: 'guard_gear', ...u, hatMat: 'cloth_white', courtier: true });
    // the bearers with their vessels held before them
    for (let k = 0; k < 3; k++) {
      const b = { at: [x - 1.3 - k * 1.25, z + (k % 2 ? 0.35 : -0.25)], y: T, rot: E + (rand() - 0.5) * 0.1, h: 1.66 + rand() * 0.1, seed: seed() };
      figures.push({ t: 'figure', ...b, dress: d.dress, top: d.top, cloth: d.cloth[k % 2], cloth2: d.cloth[(k + 1) % 2], over: d.over ?? (d.dress === 'robe' ? 'sash' : 'none'), hat: d.hat, hatMat: d.cloth[1], beard: true, hair: d.hat === 'none' ? 'long' : 'short', skin: d.skin ?? 'skin_medium', feet: d.dress === 'wrap' ? 'bare' : 'shod', arms: 'clasp', carry: 'none' });
      gear.push({ t: 'gift', ...b, kind: d.gift[0], mat: d.gift[1] });
    }
    // the animal led behind them, its leader at its head
    const ax = x - 5.6;
    figures.push({ t: 'animal', kind: d.beast, at: [ax - 0.6, z + 1.3], y: T, rot: E, seed: seed() });
    if (d.two) figures.push({ t: 'animal', kind: d.beast, at: [ax - 1.9, z + 1.6], y: T, rot: E, seed: seed() });
    figures.push({ t: 'figure', at: [ax + 0.2, z - 0.1], y: T, rot: E, h: 1.68, seed: seed(), dress: d.dress, top: d.top, cloth: d.cloth[1], cloth2: d.cloth[0], hat: d.hat, hatMat: d.cloth[0], beard: true, skin: d.skin ?? 'skin_medium', feet: d.dress === 'wrap' ? 'bare' : 'shod', pose: 'staff', len: 1.3, staffMat: 'wood_dark' });
    x -= 10.5;
  }
  // the archivist in the Treasury's hall, cross-legged at his mat by the benches of tablets (his mat in plan.js: the treasury)
  figures.push({ t: 'figure', at: [123.6, 115.8], y: T + 0.09, rot: S, h: 1.7, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'sash', hair: 'short', beard: true, hat: 'cap', hatMat: 'cloth_white', skin: 'skin_medium', feet: 'shod', pose: 'cross' });
  // on the road across the plain: a caravan of camels bound for the terrace with their drivers, donkeys loaded with
  // sacks, a horseman of the guard
  const rz = (ROAD[1] + ROAD[3]) / 2;
  for (let k = 0; k < 5; k++) figures.push({ t: 'animal', kind: 'camel', at: [-330 + k * 3.6, rz + 2.8 + (k % 2) * 0.4], y: 0, rot: E + (rand() - 0.5) * 0.1, seed: seed(), gear: true });
  for (const [x, dz] of [[-314.5, 1.6], [-333.6, 2.2]]) figures.push({ t: 'figure', at: [x, rz + dz], y: 0, rot: E, h: 1.72, seed: seed(), dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'belt', hat: 'cap', hatMat: 'cloth_ochre', beard: true, skin: 'skin_medium', feet: 'shod', pose: 'staff', carry: 'staff', len: 1.7, staffMat: 'wood_dark' });
  for (let k = 0; k < 3; k++) figures.push({ t: 'animal', kind: 'donkey', at: [-262 + k * 2.4, rz - 3.0], y: 0, rot: W, seed: seed(), gear: true });
  figures.push({ t: 'figure', at: [-264.6, rz - 2.6], y: 0, rot: W, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_brown', over: 'sash', hat: 'none', hair: 'short', beard: true, skin: 'skin_medium', feet: 'shod', carry: 'staff', len: 1.4, staffMat: 'wood_dark' });
  figures.push({ t: 'animal', kind: 'horse', at: [-200, rz + 1.5], y: 0, rot: W, seed: seed(), gear: true });
  // the market of Parsa: sellers behind their mats and stalls, buyers before them
  const WARES = [['heap', 'baskets'], ['bread', 'heap'], ['greens', 'melons'], ['pottery', 'pottery'], ['bolts', 'baskets'], ['heap', 'greens']];
  let w = 0;
  for (const z of [MARKET[1] + 9, MARKET[3] - 9]) for (let x = MARKET[0] + 6; x < MARKET[2] - 4; x += 6.5) {
    if (rand() < 0.15) continue;
    const g = WARES[w++ % WARES.length], north = z < (MARKET[1] + MARKET[3]) / 2, back = north ? -1 : 1, rot = north ? S : N;
    const seller = { t: 'figure', y: 0, seed: seed(), dress: rand() < 0.5 ? 'robe' : 'trousers', cloth: ['cloth_white', 'cloth_brown', 'cloth_ochre', 'cloth_indigo'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: 'sash', hat: rand() < 0.5 ? 'cap' : 'none', hatMat: 'cloth_white', beard: true, skin: 'skin_medium', feet: 'shod' };
    if (w % 3 === 0) { figures.push({ t: 'stall', at: [x, z], y: 0, rot: north ? N : S, seed: seed(), awning: ['cloth_white', 'cloth_ochre', 'cloth_red'][w % 3 === 0 ? (w / 3) % 3 : 0], stripe: 'none', goods: g, w: 2.6, d: 1.3 }); figures.push({ ...seller, at: [x + 0.3, z + back * 1.4], rot, pose: 'talk' }); }
    else { figures.push({ t: 'goods_mat', at: [x, z], y: 0, rot, seed: seed(), goods: g, mat: 'reed_mat' }); figures.push({ ...seller, at: [x - 0.2, z + back * 1.0], rot, pose: 'sit_ground' }); }
    if (rand() < 0.5) figures.push({ ...seller, seed: seed(), cloth: 'cloth_red', at: [x + (rand() - 0.5), z - back * 1.7], rot: rot + S + (rand() - 0.5) * 0.5, pose: 'stand' });
  }
  return { figures, gear };
}
