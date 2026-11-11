// The row of monasteries and temples, the tanks, the votive stupas, the village and the people of Nalanda (docs/settlements/nalanda.md §3, §9).
import { openLots } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
import { RADIUS, MONASTERIES, TEMPLES, TANKS, LEVEL, WAY, T3, M1, mgate, lots, tankD } from './layout.js';
import { HALL } from './plan.js';
import '../../styles/nalanda/index.js';
import '../../styles/vernacular/index.js';
import '../../objects/index.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 40], facing: 'n' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const face = ([dx, dz]) => Math.atan2(-dx, -dz);

/** The votive stupas: lining the way on both sides, and ringing the temples. */
function votives() {
  const at = [];
  const gates = MONASTERIES.map((m) => mgate(m)[1]);
  for (let z = -128; z <= 128; z += 7) {
    if (Math.abs(z) < 30 || Math.abs(z + 92) < 3.5 || z > 112) continue;                                           // before Temple 3's stair the way stays open
    at.push([WAY.x0 - 2.5, z, 0.85]);
    if (!gates.some((g) => Math.abs(g - z) < 5)) at.push([WAY.x1 + 2.5, z, 0.85]);
  }
  const ring = (t, gap) => {
    const h = t.half + t.tierH * 1.04 + 4;
    for (let i = -h; i <= h; i += 6.5) for (const [x, z] of [[t.c[0] + i, t.c[1] - h], [t.c[0] + i, t.c[1] + h], [t.c[0] - h, t.c[1] + i], [t.c[0] + h, t.c[1] + i]]) {
      if (x > t.c[0] + h - 1 && Math.abs(z - t.c[1]) < gap) continue;
      at.push([x, z, 0.7]);
    }
  };
  ring(T3, 7); for (const t of TEMPLES.slice(1)) ring(t, 5);
  return { t: 'votives', at: at.filter(([x, z]) => !(x > WAY.x0 - 1 && x < WAY.x1 + 1)).map(([x, z, s]) => [x, z, s]) };
}

/** Monks, teachers, students, lay people, a few animals. */
function people() {
  const r = rng(640), P = [];
  let seed = 7;
  const skin = () => (r() < 0.6 ? 'skin_medium' : 'skin_dark');
  const monk = (at, y, dir, o = {}) => P.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'robe', cloth: r() < 0.6 ? 'cloth_ochre' : 'cloth_maroon', cloth2: 'cloth_ochre', over: 'sash', hair: 'shaven', feet: 'bare', skin: skin(), hat: 'none', carry: 'none', pose: 'stand', ...o });
  const lay = (at, y, dir, o = {}) => P.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'shawl', hair: 'short', feet: 'bare', skin: skin(), hat: r() < 0.4 ? 'turban' : 'none', carry: 'none', pose: 'stand', ...o });
  const woman = (at, y, dir, o = {}) => P.push({ t: 'figure', at, y, rot: face(dir), seed: seed++ * 7919, dress: 'wrap', cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre'][Math.floor(r() * 3)], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', feet: 'bare', skin: skin(), hat: 'none', carry: 'pot', pose: 'stand', h: 0.95, ...o });
  // Monastery 1's court: the teacher on the podium, the students on their mats before it, two debaters at the well, a monk at the shrine
  const [x0, z0, x1, z1] = M1.rect, zc = (z0 + z1) / 2, mx = (x0 + 7.6 + x1 - 7.6) / 2, c0 = x0 + 7.6;
  const lz1 = zc + 10.6;
  monk([mx - 1.8, lz1 - 0.8], 1.62, [0, -1], { pose: 'cross', cloth: 'cloth_maroon' });
  for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) {
    const sx = mx - 7.4 + k * 1.9 + (row % 2) * 0.6, sz = zc + 2.1 + row * 1.35;
    if (Math.hypot(sx - (mx - 8), sz - (zc - 5.5)) < 2.2 || r() < 0.3) continue;
    (r() < 0.8 ? monk : lay)([sx, sz - 0.05], 0.03, [0, 1], { pose: 'cross' });
  }
  monk([c0 + 7.4, zc - 4.6], 0, [1, 0.3], { pose: 'talk' }); monk([c0 + 9.0, zc - 4.2], 0, [-1, -0.2], { pose: 'talk' });
  monk([mx + 7.4, zc + 0.2], 0.35, [1, 0], { pose: 'kneel', arms: 'pray' });
  // in two cells: a monk reading on the bed, below and above
  const nc = 15, pitch = (x1 - x0) / nc;
  monk([x0 + 7.5 * pitch - 0.98, z0 + 2.0], 0.45, [0, 1], { pose: 'cross' });
  monk([x0 + 6.5 * pitch - 0.98, z0 + 2.0], 3.7 + 0.45, [0, 1], { pose: 'cross' });
  // the library's ground hall: copyists at the desks
  for (let i = 0; i < 4; i++) for (const sz of [-1, 1]) if (r() < 0.7) { const dx = HALL.c[0] - 3 + i * 3.2, dz = HALL.c[1] + sz * 2.6; monk([dx, dz + sz * 0.95], 0.03, [0, -sz], { pose: 'cross', cloth: 'cloth_ochre' }); }
  // before Temple 3's stair: a flower seller and her buyers, monks going up, a few pilgrims
  const ts = T3.c[0] + T3.half + T3.tierH * 1.04 + 3;
  P.push({ t: 'goods_mat', at: [ts + 2.5, 8], y: 0, rot: face([-1, 0]), seed: 5, goods: ['heap', 'heap', 'baskets'], produce: ['cloth_white', 'cloth_red', 'cloth_ochre'] });
  woman([ts + 3.5, 8.5], 0, [-1, 0], { pose: 'sit_ground', carry: 'none' }); lay([ts + 0.5, 7.8], 0, [1, 0.2], { pose: 'talk' });
  monk([ts - 7, -2.5], 0, [-1, 0]); monk([ts - 4, 3], 0, [-1, 0], { pose: 'talk' }); monk([ts - 3, 4.5], 0, [-1, 0], { pose: 'talk' });
  // at the east tank's ghats: women filling pots, a monk washing, a boy
  for (const [gz, k] of [[-75, 2], [-25, 0], [25, 1], [75, 2]]) {
    const gx = TANKS[0].rect[0] - 3.7;
    woman([gx - 0.6, gz + 1.0], 0, [1, 0], { pose: 'stand' });
    if (k === 0) monk([gx - 1.2, gz - 1.6], 0, [1, 0.2], { pose: 'squat', carry: 'none' });
  }
  // the village: women at the doors with pots and baskets, men and porters, zebu and dogs
  const L = lots();
  for (let i = 0; i < L.length; i += 3) {
    const [rx0, rz0, rx1, rz1] = L[i].rect, f = L[i].front, x = f === 'w' ? rx0 - 1.6 : (rx0 + rx1) / 2 + 2, z = f === 'n' ? rz0 - 1.6 : (rz0 + rz1) / 2;
    if (tankD(x, z) < 6) continue;
    const t = r();
    if (t < 0.4) woman([x, z], 0, f === 'w' ? [1, 0] : [0, 1], { pose: 'stand', carry: r() < 0.5 ? 'basket' : 'pot' });
    else if (t < 0.7) lay([x, z], 0, f === 'w' ? [1, 0] : [0, 1], { pose: 'talk' });
    else P.push({ t: 'animal', kind: r() < 0.7 ? 'zebu' : 'dog', at: [x + 2, z + 0.5], y: 0, rot: r() * 6.28, seed: i + 3 });
  }
  void LEVEL;
  return base('nalanda-people', 'life', P);
}

export async function town() {
  const E = [];
  for (const m of MONASTERIES) if (!m.enter) E.push({ t: 'monastery', rect: m.rect, enter: false, seed: m.seed });
  for (const t of TEMPLES.slice(1)) E.push({ t: 'temple', ...t, y: 0, niches: true });
  for (const t of TANKS) E.push({ t: 'tank', rect: t.rect, level: LEVEL, ghats: t.ghats });
  E.push(votives());
  const all = lots(), houses = [], open = openLots(all, [ARRIVALS['nalanda'][0], ARRIVALS['nalanda'][2]]);
  for (let i = 0; i < all.length; i += 160) houses.push(base(`nalanda-houses-${i / 160}`, 'vernacular', all.slice(i, i + 160).map((l) => ({ t: 'house_india', ...l, ...(open.has(l) ? { open: true } : {}) }))));
  return [base('nalanda-town', 'nalanda', E), people(), ...houses];
}
