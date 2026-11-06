// The hamlets round the monument (docs/settlements/borobudur.md §5): houses on posts in their groves;
// and the pilgrims on the monument (§10): monks and lay people walking the galleries clockwise,
// the monument on their right, as the reliefs are read, climbing terrace by terrace.
import { RADIUS, MONUMENT, SQUARES, CIRCLES, MONASTERY, houses } from './layout.js';
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
  // devotees kneeling at the main wall with their offerings set down before them (flowers in a
  // basket, water in a pot), one or two in each gallery, clear of the projections and the stairs
  for (let i = 0; i < walls.length; i++) {
    const a = next[i], y = ys[i];
    for (const [ox, oz] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      if (rand() < 0.35) continue;
      const u = (rand() < 0.5 ? -1 : 1) * (a / 3 + 3 + rand() * Math.max(1, a * 2 / 3 - 8)), tx = -oz, tz = ox;      // along the side
      const d = a + 0.95, at = [ox * d + tx * u, oz * d + tz * u], seed = Math.floor(rand() * 1e9);
      L.push({ t: 'figure', at, y, rot: faceTo([-ox, -oz]), seed, dress: 'wrap', cloth: pick(['cloth_white', 'cloth_brown', 'cloth_indigo']), cloth2: 'cloth_white', skin: pick(['skin_medium', 'skin_dark']), hat: 'none', pose: 'kneel', arms: 'pray', hair: pick(['bun', 'long']) });
      const oat = [ox * (a + 0.45) + tx * u, oz * (a + 0.45) + tz * u];
      if (rand() < 0.6) L.push({ t: 'basket', at: oat, y, seed: seed + 3, goods: pick(['cloth_red', 'cloth_ochre', 'cloth_white']) });
      else L.push({ t: 'pot', at: oat, y, seed: seed + 3, kind: 'water_pot' });
    }
  }
  // on the round terraces, monks walking round the stupas, and one seated in meditation by the crowning stupa
  for (const [k, c] of CIRCLES.entries()) {
    // between the ring of stupas (their cushions reach 1.28 r round them) and the wall of the terrace above
    const sr = k === CIRCLES.length - 1 ? 1.35 : 1.45, inner = c.r + 1.6 - 2 * sr * 1.28 - 0.25, wallIn = k + 1 < CIRCLES.length ? CIRCLES[k + 1].r + 1.6 : 5 * 1.18;
    const n = 3 - k, R = (inner + wallIn) / 2;
    for (let j = 0; j < n; j++) {
      let ang = rand() * Math.PI * 2;
      const off = ((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
      if (off < 0.2 || off > Math.PI / 2 - 0.2) ang += 0.4;                 // not on the stairs coming up the axes
      const at = [Math.cos(ang) * R, Math.sin(ang) * R], dir = [-Math.sin(ang), Math.cos(ang)];
      L.push({ t: 'figure', at, y: c.y, rot: faceTo(dir), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', skin: 'skin_medium', hat: 'none', hair: 'shaven', pose: 'stand' });
    }
  }
  L.push({ t: 'figure', at: [0, 8.2], y: CIRCLES[2].y, rot: faceTo([0, 1]), seed: 77, dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', skin: 'skin_dark', hat: 'none', hair: 'shaven', pose: 'cross', arms: 'pray' });
  // on the way from the east, a party of pilgrims coming up with offerings on their heads and slung from poles
  for (let k = 0; k < 9; k++) {
    const x = 80 + k * 6.5 + rand() * 3, z = (k % 2 ? 1 : -1) * (0.7 + rand() * 0.6), carry = pick(['basket', 'basket', 'pot', 'pole', 'none']);
    L.push({ t: 'figure', at: [x, z], y: 0, rot: faceTo([-1, 0]), seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: pick(['cloth_white', 'cloth_brown', 'cloth_red', 'cloth_indigo']), cloth2: 'cloth_white', skin: pick(['skin_medium', 'skin_dark']), hat: 'none', carry, hair: pick(['bun', 'long', 'short']) });
  }
  return { ...base('borobudur-pilgrims', L), style: 'life', center: [0, 0], near: 260 };
}

/**
 * The life of the monastery (§12): monks seated in the great pavilion at their recitation, one
 * teaching before them; the abbot's pavilion; lay people bringing rice and water to the gate; the
 * well, the water jars and the firewood of the kitchen yard by the monks' houses.
 */
function monastery() {
  const L = [], rand = rng(800), faceTo = ([dx, dz]) => Math.atan2(-dx, -dz), [mx0, mz0, mx1, mz1] = MONASTERY;
  const monk = (at, y, dir, pose, arms, extra = {}) => L.push({ t: 'figure', at, y, rot: faceTo(dir), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.8 ? 'cloth_ochre' : 'cloth_red', cloth2: 'cloth_ochre', skin: rand() < 0.5 ? 'skin_medium' : 'skin_dark', hat: 'none', hair: 'shaven', pose, arms, ...extra });
  // the great pavilion (−182…−158, −150…−132, its floor 0.8 up): three rows of monks facing west to the teacher
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) monk([-174 + r * 2.4 + 2, -147 + c * 3], 0.8, [-1, 0], 'cross', c % 2 ? 'pray' : undefined);
  monk([-178.5, -141], 0.8, [1, 0], 'cross', 'talk');
  // the small pavilion: two monks with a palm-leaf book between them
  monk([-197.5, -120], 0.8, [1, 0], 'cross', 'talk'); monk([-192.5, -120], 0.8, [-1, 0], 'cross', 'pray');
  // at the gate in the east wall, lay people bringing alms; a monk receiving them
  const gz = (mz0 + mz1) / 2;
  monk([mx1 - 3, gz], 0, [1, 0], 'stand', 'clasp');
  for (const [dx, dz, carry] of [[2.5, -1.2, 'basket'], [3.4, 0.6, 'pot'], [5.2, -0.4, 'pole']]) L.push({ t: 'figure', at: [mx1 + dx, gz + dz], y: 0, rot: faceTo([-1, 0]), seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_brown', skin: 'skin_medium', hat: 'none', carry, hair: 'bun' });
  // the kitchen yard by the monks' houses on the north side
  L.push({ t: 'well', at: [-173, -162], y: 0, kind: 'pulley', mat: 'brick', seed: 5 });
  L.push({ t: 'pot', at: [-169.5, -163.5], y: 0, kind: 'water_pot', n: 4, seed: 6 }, { t: 'pot', at: [-200, -158], y: 0, kind: 'dark_pot', n: 3, seed: 7 });
  L.push({ t: 'firewood', at: [-188, -166.3], y: 0, rot: 0, len: 1.6, seed: 2 }, { t: 'basket', at: [-166.5, -160], y: 0, n: 3, seed: 8 });
  return { ...base('borobudur-monastery-life', L), style: 'life', center: [(mx0 + mx1) / 2, (mz0 + mz1) / 2], near: 260 };
}

export async function town() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 120) plans.push(base(`borobudur-hamlets-${i / 120}`, all.slice(i, i + 120).map((h) => ({ t: 'rumah', ...h }))));
  plans.push(pilgrims(), monastery());
  return plans;
}
