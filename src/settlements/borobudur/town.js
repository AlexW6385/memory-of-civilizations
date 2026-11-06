// The hamlets round the monument (docs/settlements/borobudur.md §5): houses on posts in their groves;
// and the pilgrims on the monument (§10): monks and lay people walking the galleries clockwise,
// the monument on their right, as the reliefs are read, climbing terrace by terrace.
import { RADIUS, MONUMENT, SQUARES, CIRCLES, houses } from './layout.js';
const base = (id, elements) => ({ id, style: 'javanese', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [90, 0], facing: 'w' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Pilgrims on the galleries: each gallery's middle line, a few figures along each side walking clockwise (pradakshina). */
function pilgrims() {
  const L = [], rand = rng(825), pick = (a) => a[Math.floor(rand() * a.length)], faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  const B = MONUMENT.base, walls = [B.a + 0.2, ...SQUARES.map((s) => s.a)], next = [...SQUARES.map((s) => s.a), CIRCLES[0].r + 1.6], ys = [B.h, ...SQUARES.map((s) => s.y)];
  for (let i = 0; i < walls.length; i++) {
    const m = (walls[i] - 0.5 + next[i]) / 2, y = ys[i];
    // the four sides, each walked in the clockwise sense: north eastward, east southward, south westward, west northward
    for (const [px, pz, dx, dz] of [[0, -m, 1, 0], [m, 0, 0, 1], [0, m, -1, 0], [-m, 0, 0, -1]]) {
      const n = 2 + Math.floor(rand() * 3);
      for (let k = 0; k < n; k++) {
        let u = (rand() * 2 - 1) * (m - 4);
        if (Math.abs(u) < 3.5) u += Math.sign(u || 1) * 4;                  // not in the stair's passage
        const at = [px + (dx ? u : 0) + (dz ? (rand() - 0.5) * 0.8 : 0), pz + (dz ? u : 0) + (dx ? (rand() - 0.5) * 0.8 : 0)];
        const monk = rand() < 0.45, seed = Math.floor(rand() * 1e9);
        if (monk) L.push({ t: 'figure', at, y, rot: faceTo([dx, dz]), seed, dress: 'robe', cloth: pick(['cloth_ochre', 'cloth_ochre', 'cloth_red']), cloth2: 'cloth_ochre', skin: pick(['skin_medium', 'skin_dark']), hat: 'none', carry: 'none', pose: 'stand' });
        else L.push({ t: 'figure', at, y, rot: faceTo([dx, dz]), seed, dress: 'wrap', cloth: pick(['cloth_white', 'cloth_brown', 'cloth_red', 'cloth_indigo']), cloth2: pick(['cloth_white', 'cloth_ochre']), skin: pick(['skin_medium', 'skin_dark']), hat: 'none', carry: pick(['basket', 'none', 'none']), pose: 'stand' });
        // now and then a second one beside, walking with the first or stopped before the reliefs
        if (rand() < 0.3) L.push({ t: 'figure', at: [at[0] + dz * 0.7 + dx * 0.4, at[1] - dx * 0.7 + dz * 0.4], y, rot: faceTo([dx, dz]), seed: seed + 1, dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', skin: 'skin_medium', hat: 'none', carry: 'none', pose: 'stand' });
      }
    }
  }
  return { ...base('borobudur-pilgrims', L), style: 'life', center: [0, 0], near: 260 };
}

export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 120) plans.push(base(`borobudur-hamlets-${i / 120}`, all.slice(i, i + 120).map((h) => ({ t: 'rumah', ...h }))));
  plans.push(pilgrims());
  return plans;
}
