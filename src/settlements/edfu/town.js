// The town on its mound (docs/settlements/edfu.md §5): mudbrick houses round little courts.
import { RADIUS, NILE, QUAY, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'oldkingdom', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 170], facing: 'n' } });
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`edfu-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'mud_house', ...l }))));
  return plans;
}

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The quay on the Nile (docs/settlements/edfu.md §6.1): a platform of sandstone blocks over the bank, two flights of
 *  steps down to the water, mooring posts along its edge; barges and skiffs alongside, jars and sacks being landed. */
export function quay() {
  const [x0, z0, x1, z1] = QUAY.rect, T = QUAY.top, W = NILE.level, rand = rng(5757);
  const E = [{ t: 'block', rect: [x0, z0, x1, z1], y0: -7.5, y1: T, mat: 'sandstone_dressed', walk: true }];
  // a coping course along the river face, a little proud
  E.push({ t: 'block', rect: [x0 - 0.15, z0, x0 + 0.6, z1], y0: T - 0.35, y1: T + 0.05, mat: 'sandstone', walk: true });
  for (const z of QUAY.stairs) {
    E.push({ t: 'stair', rect: [x0 - 7.2, z, x0 - 0.15, z + 3.2], dir: 'e', y0: W - 0.6, y1: T, mat: 'sandstone_dressed', base: -7.5 });
  }
  for (let z = z0 + 3; z < z1 - 1; z += 6.5) if (!QUAY.stairs.some((s) => z > s - 1.5 && z < s + 4.5)) E.push({ t: 'block', rect: [x0 + 0.15, z - 0.17, x0 + 0.49, z + 0.17], y0: T + 0.05, y1: T + 0.85, mat: 'sandstone' });
  const life = [];
  for (const [z, kind, len] of [[42, 'barge', 12], [57, 'rowboat', 5], [76, 'barge', 11], [68, 'rowboat', 4.5]]) life.push({ t: 'boat', kind, len, at: [x0 - (kind === 'barge' ? 2.4 : 1.6), z], y: W, rot: 0, seed: z });
  for (let k = 0; k < 7; k++) {
    const at = [x0 + 2 + rand() * (x1 - x0 - 5), z0 + 3 + rand() * (z1 - z0 - 6)], r = rand();
    life.push(r < 0.5 ? { t: 'pot', kind: 'amphora', n: 3 + Math.floor(rand() * 4), at, y: T, seed: k + 1 } : r < 0.8 ? { t: 'sacks', n: 3 + Math.floor(rand() * 4), at, y: T, rot: rand() * 6.28, seed: k + 9 } : { t: 'basket', n: 3, at, y: T, goods: 'cloth_ochre', seed: k + 17 });
  }
  for (let k = 0; k < 6; k++) {
    const at = [x0 + 1.5 + rand() * (x1 - x0 - 3), z0 + 2 + rand() * (z1 - z0 - 4)], carry = rand() < 0.5 ? (rand() < 0.5 ? 'basket' : 'pot') : 'none';
    life.push({ t: 'figure', at, y: T, rot: rand() * 6.28, seed: 900 + k, dress: 'tunic', cloth: 'cloth_white', skin: 'skin_medium', hair: 'short', hairMat: 'hair_dark', carry, pose: carry === 'none' && rand() < 0.4 ? 'talk' : 'stand' });
  }
  return [base('edfu-quay', E), { ...base('edfu-quay-life', life), style: 'life' }];
}
