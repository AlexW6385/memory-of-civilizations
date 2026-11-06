// The people on the terrace (docs/settlements/persepolis.md §13): guards — the "apple bearers" in Persian dress with
// their pleated headdresses, spears with golden pomegranates and quivers — at the Gate of All Nations and at the foot
// of the Apadana's north stairway; delegations of the peoples, each led by an usher, carrying their vessels and
// leading their animals from the gate toward the Apadana, as the stairways' reliefs show them (Livius).
import { TERRACE } from './layout.js';

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
  return { figures, gear };
}
