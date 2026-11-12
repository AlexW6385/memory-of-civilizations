// The people on the terrace (docs/settlements/persepolis.md §13): guards — the "apple bearers" in Persian dress with
// their pleated headdresses, spears with golden pomegranates and quivers — at the Gate of All Nations and at the foot
// of the Apadana's north stairway; delegations of the peoples, each led by an usher, carrying their vessels and
// leading their animals from the gate toward the Apadana, as the stairways' reliefs show them (Livius).
import { TERRACE, ROAD, MARKET, COURT } from './layout.js';

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
  // the court day in the court before the Apadana's west stair (the visitor's side): three more delegations walking east to be received,
  // each an usher, three bearers with their vessels and an animal led behind; guards at the stair's foot; scribes at their mats; grooms
  // holding the horses of the nobles; courtiers talking in the shade of the stair [inferred from the reliefs and Herodotus/Xenophon's court]
  const delegation = (d, xh, zl) => {
    const u = { at: [xh, zl - 0.4], y: T, rot: E, h: 1.75, seed: seed(), len: 1.2 };
    figures.push({ t: 'figure', ...u, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'sash', hair: 'short', beard: true, hat: 'none', feet: 'shod', skin: 'skin_medium', carry: 'staff', staffMat: 'wood_dark' });
    gear.push({ t: 'guard_gear', ...u, hatMat: 'cloth_white', courtier: true });
    for (let k = 0; k < 3; k++) {
      const b = { at: [xh - 1.3 - k * 1.25, zl + (k % 2 ? 0.35 : -0.25)], y: T, rot: E + (rand() - 0.5) * 0.1, h: 1.66 + rand() * 0.1, seed: seed() };
      figures.push({ t: 'figure', ...b, dress: d.dress, top: d.top, cloth: d.cloth[k % 2], cloth2: d.cloth[(k + 1) % 2], over: d.over ?? (d.dress === 'robe' ? 'sash' : 'none'), hat: d.hat, hatMat: d.cloth[1], beard: true, hair: d.hat === 'none' ? 'long' : 'short', skin: d.skin ?? 'skin_medium', feet: d.dress === 'wrap' ? 'bare' : 'shod', arms: 'clasp', carry: 'none' });
      gear.push({ t: 'gift', ...b, kind: d.gift[0], mat: d.gift[1] });
    }
    const ax = xh - 5.6;
    figures.push({ t: 'animal', kind: d.beast, at: [ax - 0.6, zl + 1.3], y: T, rot: E, seed: seed(), gear: true });
    figures.push({ t: 'figure', at: [ax + 0.2, zl - 0.1], y: T, rot: E, h: 1.68, seed: seed(), dress: d.dress, top: d.top, cloth: d.cloth[1], cloth2: d.cloth[0], hat: d.hat, hatMat: d.cloth[0], beard: true, skin: d.skin ?? 'skin_medium', feet: d.dress === 'wrap' ? 'bare' : 'shod', pose: 'staff', len: 1.3, staffMat: 'wood_dark' });
  };
  // the delegations wait either side of the royal way, in view of the visitor arriving at its head; two ranks of guards line the way to the stair
  delegation({ dress: 'robe', hat: 'cap', cloth: ['cloth_indigo', 'cloth_ochre'], gift: ['bowl', 'gold'], beast: 'horse' }, -101, -73.5);                       // Lydians
  delegation({ dress: 'trousers', hat: 'cap', cloth: ['cloth_red', 'cloth_brown'], gift: ['jar', 'silver'], beast: 'horse' }, -101, -46.5);                 // Scythians
  delegation({ dress: 'robe', hat: 'turban', cloth: ['cloth_white', 'linen'], gift: ['phial', 'gold'], beast: 'camel' }, -94, -85);                      // Bactrians
  delegation({ dress: 'wrap', top: 'bare', hat: 'turban', skin: 'skin_dark', cloth: ['cloth_white', 'cloth_ochre'], gift: ['jar', 'gold'], beast: 'zebu' }, -94, -26);   // Arachosians
  COURT.ranks.forEach((rz, ri) => { for (let x = COURT.x0, k = 0; x <= COURT.x1 + 0.1; x += 4.2, k++) guard([x, rz], ri ? N : S, k + ri); });
  // the guards at the foot of the stair, facing the court
  [[-89, -78.5], [-89, -41.5], [-89, -77], [-89, -43]].forEach(([x, gz], i) => guard([x, gz], W, i));
  // the scribes at their mats (plan.js: the scribe kits), each with a petitioner standing before him
  [[-100.5, -34.5], [-100.5, -32.5]].forEach(([x, sz], i) => figures.push({ t: 'figure', at: [x - 0.15, sz], y: T + 0.012, rot: E, h: 1.66, seed: seed(), dress: 'robe', cloth: i ? 'cloth_ochre' : 'cloth_white', cloth2: 'cloth_brown', over: 'sash', hair: 'short', beard: true, hat: 'cap', hatMat: 'cloth_white', skin: 'skin_medium', feet: 'shod', pose: 'cross' }));
  figures.push({ t: 'figure', at: [-97.2, -33.5], y: T, rot: W, h: 1.7, seed: seed(), dress: 'trousers', cloth: 'cloth_green', cloth2: 'cloth_brown', over: 'belt', hat: 'cap', hatMat: 'cloth_brown', beard: true, skin: 'skin_medium', feet: 'shod', pose: 'talk' });
  figures.push({ t: 'figure', at: [-107 - 0.15, -104], y: T + 0.012, rot: E, h: 1.66, seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'sash', hair: 'short', beard: true, hat: 'none', skin: 'skin_medium', feet: 'shod', pose: 'cross' });
  // grooms with the nobles' horses, tethered in a line north of the court, and a pair of the nobles' camels couched to the south, saddlecloths on
  for (let k = 0; k < 4; k++) {
    const hx = -116 + k * 5.2, hz = -96 + (k % 2) * 0.8;
    figures.push({ t: 'animal', kind: 'horse', at: [hx, hz], y: T, rot: k % 2 ? S : N, seed: seed(), gear: true });
    figures.push({ t: 'figure', at: [hx + 0.9, hz + 0.3], y: T, rot: k % 2 ? E : W, h: 1.66, seed: seed(), dress: 'trousers', cloth: ['cloth_brown', 'cloth_green', 'cloth_ochre', 'cloth_red'][k], cloth2: 'cloth_brown', over: 'belt', hat: 'cap', hatMat: 'cloth_brown', beard: k % 2 === 0, skin: 'skin_medium', feet: 'shod', pose: 'staff', carry: 'staff', len: 1.5, staffMat: 'wood_dark' });
  }
  figures.push({ t: 'trough', at: [-96, -96.5], y: T, rot: 0, mat: 'limestone_persian', seed: seed() });
  // fodder heaped on mats beside the nobles' horses, jars of water for the waiting delegations, and the water-bearers who fill them
  for (let k = 0; k < 4; k++) figures.push({ t: 'goods_mat', at: [-116 + k * 5.2 - 0.9, -96 + (k % 2) * 0.8 + 1.9], y: T, rot: 0, seed: seed(), goods: ['heap', 'baskets'], mat: 'reed_mat' });
  for (const [x, gz] of [[-104.5, -79.5], [-104.5, -40.5]]) figures.push({ t: 'goods_mat', at: [x, gz], y: T, rot: 0, seed: seed(), goods: ['pottery', 'pottery'], mat: 'reed_mat' });
  for (const [x, gz, rt] of [[-106.4, -79.2, W], [-106.4, -40.8, W]]) figures.push({ t: 'figure', at: [x, gz], y: T, rot: rt, h: 1.64, seed: seed(), dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_ochre', over: 'belt', hat: 'cap', hatMat: 'cloth_brown', beard: false, skin: 'skin_medium', feet: 'shod', pose: 'stand', carry: 'pot', arms: 'head' });
  // courtiers in conversation, waiting to be called: groups of three and four either side of the royal way and farther off
  [[-111, -69.5], [-111, -50.5], [-100, -62.5 + 0], [-108, -88], [-113, -33], [-102, -105]].forEach(([gx, gz], gi) => {
    if (gi === 2) return;
    for (let k = 0; k < 3 + (gi % 2); k++) {
      const a = k * 2.1 + gi, at = [gx + Math.cos(a) * 1.0, gz + Math.sin(a) * 1.0];
      figures.push({ t: 'figure', at, y: T, rot: a + 3.1 + (rand() - 0.5) * 0.4, h: 1.7 + rand() * 0.08, seed: seed(), dress: 'robe', cloth: ['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_maroon'][(gi + k) % 4], cloth2: 'cloth_red', over: 'sash', hat: 'cap', hatMat: 'cloth_white', beard: true, skin: 'skin_medium', feet: 'shod', pose: k % 2 ? 'talk' : 'stand' });
    }
  });
  // servants and courtiers of the terrace: courtiers in groups on the Hundred Columns' platform and before the Hadish, cup-bearers and food-bearers crossing the courts
  const GROUPS = [[75, -95], [60, -75], [90, -110], [-10, 100], [20, 95], [-45, 20], [-52, 40], [90, 130], [70, 160]];
  GROUPS.forEach(([gx, gz], gi) => {
    for (let k = 0; k < 3; k++) {
      const at = [gx + (k - 1) * 1.1 + (rand() - 0.5) * 0.4, gz + (k % 2) * 0.9], bearer = gi % 3 === 2 && k === 0;
      figures.push({ t: 'figure', at, y: T, rot: rand() * 6.28, h: 1.7 + rand() * 0.08, seed: seed(), dress: 'robe', cloth: ['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_maroon'][(gi + k) % 4], cloth2: 'cloth_red', over: 'sash', hat: 'cap', hatMat: 'cloth_white', beard: true, skin: 'skin_medium', feet: 'shod', pose: k === 1 ? 'talk' : 'stand', ...(bearer ? { carry: 'pot', arms: 'head' } : {}) });
    }
  });
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
    if (w % 3 === 0) { figures.push({ t: 'stall', at: [x, z], y: 0, rot: north ? N : S, seed: seed(), awning: ['cloth_white', 'cloth_ochre', 'cloth_red'][w % 3 === 0 ? (w / 3) % 3 : 0], stripe: null, goods: g, w: 2.6, d: 1.3 }); figures.push({ ...seller, at: [x + 0.3, z + back * 1.4], rot, pose: 'talk' }); }
    else { figures.push({ t: 'goods_mat', at: [x, z], y: 0, rot, seed: seed(), goods: g, mat: 'reed_mat' }); figures.push({ ...seller, at: [x - 0.2, z + back * 1.0], rot, pose: 'sit_ground' }); }
    if (rand() < 0.5) figures.push({ ...seller, seed: seed(), cloth: 'cloth_red', at: [x + (rand() - 0.5), z - back * 1.7], rot: rot + S + (rand() - 0.5) * 0.5, pose: 'stand' });
  }
  return { figures, gear };
}
