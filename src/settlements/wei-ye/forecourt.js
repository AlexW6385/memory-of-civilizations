// The Sparrow's forecourt (docs/settlements/wei-ye.md §6.2): what the visitor stands among on arrival — the garden's paving before the Bronze Sparrow's stair, the
// stone chimeras and banners at the stair's foot, the censers on the royal way, the officials' carriages waiting with their horses and grooms, the poets
// on their mats on the lawns either side, the attendants. Pure data; positions derive from layout.js (the stair, the garden's ways).
import { SPARROW, stairRect, zOf, POND } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const P = (kind, x, z, o = {}) => ({ t: 'wei_prop', kind, at: [x, z], ...o });
const ZC = zOf(SPARROW), FOOT = stairRect(SPARROW)[2];

/** The carriages and the places kept clear of planting: [x, z, radius]. */
export const CARRIAGES = [[-133, ZC - 12.8, Math.PI / 2, 'cloth_black'], [-129, ZC + 12.6, Math.PI / 2, 'cloth_red'], [-152, ZC - 16, Math.PI / 2, 'cloth_blue']];
export const MATS = [[-124, ZC - 17, 0.15], [-109, ZC - 12.5, -0.2], [-124.5, ZC + 17, 3.0], [-108, ZC + 14, 3.3], [-134, ZC + 24, 2.9]];
export const KEEP = [...CARRIAGES.map(([x, z]) => [x + 2, z, 7]), ...MATS.map(([x, z]) => [x, z, 4.2])];

export function forecourtElements() {
  const E = [];
  // the royal way: a band of dressed stone down the axis of the stair across the garden's paving, the kerb stones on its edges
  E.push({ t: 'floor', rect: [FOOT - 0.2, ZC - 5.8, -141, ZC + 5.8], y: 0.02, mat: 'brick_paving', th: 0.3 });
  E.push({ t: 'floor', rect: [FOOT - 0.2, ZC - 0.9, -100, ZC + 0.9], y: 0.03, mat: 'bluestone', th: 0.3 });
  for (const s of [-1, 1]) E.push({ t: 'floor', rect: [FOOT - 0.2, ZC + s * 5.5 - 0.15, -100, ZC + s * 5.5 + 0.15], y: 0.03, mat: 'bluestone', th: 0.3 });
  // the chimeras flanking the stair's foot, the banners of the army and the braziers of the watch
  for (const s of [-1, 1]) {
    E.push(P('beast', FOOT + 1.6, ZC + s * 6.6, { yaw: Math.PI / 2, s: 1.15 }));
    E.push(P('flag', FOOT - 6, ZC + s * 8.4, { h: 8.6, cloth: s < 0 ? 'cloth_red' : 'cloth_black', cloth2: s < 0 ? 'cloth_black' : 'cloth_red', long: true, yaw: 0 }));
    E.push(P('brazier', FOOT + 3.6, ZC + s * 5.0));
    E.push(P('censer', FOOT + 9.5, ZC + s * 2.8, { s: 1.15 }));
    E.push(P('rack', FOOT + 1.2, ZC + s * 9.6, { n: 6, yaw: Math.PI / 2 }));
    E.push(P('block', FOOT + 6, ZC + s * 7.6, {}));
  }
  E.push(P('drum', FOOT + 14, ZC - 8.6, { yaw: Math.PI / 2 }), P('bells', FOOT + 14, ZC + 8.6, { yaw: Math.PI / 2, n: 5 }));
  // the officials' carriages in the shade on the lawns (the horses and grooms are in life)
  for (const [x, z, yaw, cloth] of CARRIAGES) E.push(P('chariot', x, z, { yaw, cloth }));
  // the poets' mats
  MATS.forEach(([x, z, yaw], i) => E.push(P('mat', x, z, { yaw, seed: 40 + i, zither: i % 2 === 0 })));
  // a well and a jar stand for the attendants beside the south lawn, rocks by the pond's landing already in town.js
  E.push(P('well', -116, ZC + 22), P('jars', -118.5, ZC + 20, { seed: 7, n: 5 }), P('bench', -118, ZC + 24.5, { len: 2.4, yaw: Math.PI / 2 }));
  void POND;
  return E;
}

export function forecourtLife() {
  const L = [], r = rng(606), pick = (a) => a[Math.floor(r() * a.length) % a.length];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(r() * 1e9), dress: 'robe', top: '', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_light', hat: 'cap', hair: 'topknot', hairMat: 'hair_dark', feet: 'shod', carry: 'none', pose: 'stand', over: 'sash', ...o });
  // the carriages: a horse in the shafts (or held by the groom), the groom at its head, the driver on his heels
  for (const [x, z, yaw, cloth] of CARRIAGES) {
    const fx = x + Math.sin(yaw) * 3.7, fz = z + Math.cos(yaw) * 3.7, rot = Math.atan2(-Math.sin(yaw), -Math.cos(yaw));
    L.push({ t: 'animal', kind: 'horse', at: [fx, fz], y: 0, rot, seed: Math.floor(r() * 99), gear: true });
    fig([fx + Math.sin(yaw) * 1.5 + 0.9, fz + Math.cos(yaw) * 1.5], rot + 2.4, { cloth: 'cloth_brown', hat: 'none', over: 'belt', pose: 'stand' });
    fig([x - Math.sin(yaw) * 2.3 + 0.7, z - Math.cos(yaw) * 2.3 - 0.2], rot + 0.6, { cloth: pick(['cloth_grey', 'cloth_brown']), hat: 'none', over: 'belt', pose: 'squat' });
    void cloth;
  }
  // the poets on their mats: three at each, one with the zither or the wine, a boy attending
  const COL = ['cloth_white', 'cloth_blue', 'cloth_indigo', 'cloth_grey', 'cloth_green'];
  MATS.forEach(([x, z, yaw], i) => {
    const c = Math.cos(yaw), s = Math.sin(yaw), at = (u, v) => [x + u * c + v * s, z - u * s + v * c];
    fig(at(-0.55, 0.85), yaw + Math.PI, { y: 0.04, pose: 'seiza', cloth: pick(COL), cloth2: 'cloth_white', beard: r() < 0.5 ? 1 : 0 });
    fig(at(0.55, 0.85), yaw + Math.PI, { y: 0.04, pose: 'seiza', cloth: pick(COL), cloth2: 'cloth_white', beard: r() < 0.5 ? 1 : 0 });
    if (i % 2 === 0) fig(at(0, -0.95), yaw, { y: 0.04, pose: 'seiza', cloth: pick(COL), cloth2: 'cloth_white', beard: 1 });
    else fig(at(1.7, -0.2), yaw + 1.2, { cloth: 'cloth_brown', hat: 'none', over: 'belt', h: 1.15, pose: 'stand' });
  });
  // the officials at the stair's foot talking, the porters at the carriages' rear, a woman of the court with her maid
  const [ax, az] = [FOOT - 4.5, ZC];
  fig([-131, ZC - 1.8], 0.4, { cloth: 'cloth_black', cloth2: 'cloth_red', pose: 'talk', beard: 1 }); fig([-130.1, ZC - 1.3], 0.4 + Math.PI, { cloth: 'cloth_blue', pose: 'talk', beard: 1 });
  fig([-128, ZC + 3.4], 1.9, { cloth: 'cloth_red', hat: 'none', hair: 'bun', over: 'none', h: 1.5, pose: 'stand' }); fig([-129.3, ZC + 4.3], 1.9, { cloth: 'cloth_green', hat: 'none', hair: 'bun', over: 'none', h: 1.48, pose: 'stand', carry: 'pot' });
  fig([-137, ZC + 8.9], Math.PI / 2, { cloth: 'cloth_grey', hat: 'cap', pose: 'staff', carry: 'staff', len: 2.0 });
  void ax; void az;
  return L;
}
