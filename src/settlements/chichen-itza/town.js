// The town round the Great Plaza (docs/settlements/chichen-itza.md §6): house lots enclosed by
// dry-stone walls, each with one to three oval houses of wattle and thatch.

import { RADIUS, PLAZA, CENOTE, lots, cenoteDist, PLAZA_STELAE, PLAZA_SHRINES, CEIBAS, SWEATBATH, WEAR_SKIP } from './layout.js';
import { ground } from './ground.js';

const base = (id, elements) => ({ id, style: 'maya', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 62], facing: 'n' } });

function lotElements(l) {
  const [x0, z0, x1, z1] = l.rect, E = [], gw = 2.4;
  const sides = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
  sides.forEach(([a, b], i) => {
    if (i !== l.gate) { E.push({ t: 'albarrada', pts: [a, b] }); return; }
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    E.push({ t: 'albarrada', pts: [a, [m[0] - ux * gw, m[1] - uz * gw]] });
    E.push({ t: 'albarrada', pts: [[m[0] + ux * gw, m[1] + uz * gw], b] });
  });
  for (const h of l.houses) E.push({ t: 'maya_house', ...h });
  if (l.range) E.push({ t: 'maya_range', ...l.range, y: ground.height(l.range.c[0], l.range.c[1]) });
  E.push({ t: 'maya_yard', rect: l.rect, gate: l.gate, seed: l.seed, level: l.level, h: ground.height,
    keep: [...l.houses.map((h) => ({ c: h.c, r: h.a + 1.4 })), ...(l.range ? [{ c: l.range.c, r: 9 }] : [])] });
  // agave grown in the lot along its wall, for its fibre (§13)
  const r = rng(Math.floor(x0 * 31 + z1 * 17) >>> 0), P = [];
  for (let i = 0; i < 2 + Math.floor(r() * 4); i++) {
    const side = Math.floor(r() * 4), u = 3 + r() * (x1 - x0 - 6), off = 1.4;
    const x = side < 2 ? x0 + u : side === 2 ? x0 + off : x1 - off, z = side < 2 ? (side ? z1 - off : z0 + off) : z0 + u;
    if (l.houses.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.a + 2.5)) continue;
    if ([0, 2, 3, 1][side] === l.gate && Math.abs(u - (side < 2 ? x1 - x0 : z1 - z0) / 2) < 3.6) continue;     // clear of the gateway
    P.push(['maguey', x, z, ground.height(x, z), 0.5 + r() * 0.3, Math.floor(r() * 4) * Math.PI / 2, Math.floor(r() * 3)]);
  }
  if (P.length) E.push({ t: 'meso_plants', plants: P });
  return E;
}

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * The market on the plaza south of the Thousand Columns (§11): rows of sellers sitting behind their palm mats with
 * baskets of maize, beans and chile, cloth, and dark cooking pots; buyers walking between, some carrying baskets or
 * water jars on their heads. Men in loincloth and cape, women in the long cotton dress (the wrap stands in).
 */
function market() {
  const rand = rng(1000), L = [], M = [], Y = 0.04, pick = (a) => a[Math.floor(rand() * a.length)];
  const skin = () => pick(['skin_dark', 'skin_dark', 'skin_medium']);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    if (rand() < 0.15) continue;
    const x = 96 + c * 10 + (rand() - 0.5) * 2, z = 56 + r * 7 + (rand() - 0.5) * 1.2, woman = rand() < 0.55;
    M.push({ t: 'petate', at: [x, z + 0.4], y: Y, w: 1.8, d: 1.2, rot: (rand() - 0.5) * 0.2 });
    if (rand() < 0.85) M.push({ t: 'maya_awning', rect: [x - 1.9, z - 1.2, x + 1.9, z + 1.2], y: Y, h: 2.15 });
    L.push({ t: 'figure', at: [x, z - 0.55], y: Y, rot: Math.PI, h: woman ? 1.5 : 1.6, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'wrap', cloth: woman ? 'cloth_white' : pick(['cloth_white', 'cloth_ochre']), cloth2: pick(['cloth_red', 'cloth_white', 'cloth_ochre']), skin: skin(), hat: 'none', hair: woman ? pick(['long', 'bun']) : 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: woman ? 'none' : 'cape', pose: rand() < 0.6 ? 'squat' : 'sit_ground' });
    for (let k = 0; k < 3; k++) {
      const at = [x - 0.55 + k * 0.55 + (rand() - 0.5) * 0.1, z + 0.45 + (rand() - 0.5) * 0.3];
      const g = rand();
      if (g < 0.55) L.push({ t: 'basket', at, y: Y + 0.015, seed: Math.floor(rand() * 1e6), goods: pick(['paint_ochre', 'cloth_red', 'pottery_dark', 'cloth_ochre', 'fresco_green']) });
      else L.push({ t: 'pot', kind: pick(['dark_pot', 'water_pot']), at, y: Y + 0.015, seed: Math.floor(rand() * 1e6) });
    }
  }
  // buyers between the rows
  for (let k = 0; k < 14; k++) {
    const woman = rand() < 0.5, at = [94 + rand() * 54, 59.5 + Math.floor(rand() * 3) * 7 + (rand() - 0.5) * 1.5];
    L.push({ t: 'figure', at, y: Y, rot: rand() * 6.28, h: woman ? 1.52 : 1.62, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'wrap', cloth: 'cloth_white', cloth2: pick(['cloth_red', 'cloth_ochre', 'cloth_white']), skin: skin(), hat: 'none', hair: pick(['long', 'bun', 'short']), hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: woman ? 'none' : pick(['cape', 'sash']), carry: pick(['basket', 'pot', 'none', 'none']), pose: rand() < 0.3 ? 'talk' : 'stand' });
  }
  return [{ ...base('chichen-itza-market', L), style: 'life' }, base('chichen-itza-market-mats', M)];
}

/**
 * The people of the rites (§12): priests at the Sacred Cenote's rim with their offerings and the pilgrims kneeling
 * behind them, pilgrims coming and going on the sacbe, people crossing the plaza to the Castillo and climbing its
 * south stair, priests on its summit and at the altar in the Temple of the Warriors.
 */
function rites() {
  const rand = rng(1100), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (x, z, y, rot, o = {}) => {
    const woman = o.woman ?? rand() < 0.4;
    L.push({ t: 'figure', at: [x, z], y, rot, h: woman ? 1.5 : 1.6, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'wrap', cloth: 'cloth_white', cloth2: pick(['cloth_red', 'cloth_ochre', 'cloth_white']), skin: pick(['skin_dark', 'skin_dark', 'skin_medium']), hat: 'none', hair: woman ? pick(['long', 'bun']) : 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: woman ? 'none' : pick(['cape', 'sash']), pose: 'stand', ...o });
  };
  const priest = (x, z, y, rot, o = {}) => fig(x, z, y, rot, { woman: false, cloth: 'cloth_white', cloth2: 'cloth_red', over: 'cloak', hat: 'cap', hatMat: 'stucco_leaf', ...o });
  // at the cenote's rim, west of the sacbe's end: the priests facing the water, the pilgrims behind
  const g = (x, z) => ground.height(x, z);
  priest(-6.6, -241.0, g(-6.6, -241.0), 0, { pose: 'talk' }); priest(-4.6, -240.6, g(-4.6, -240.6), 0.2, { carry: 'staff', len: 1.9, staffMat: 'timber' });
  for (const [x, z] of [[-7.8, -238.4], [-5.6, -238.0], [-3.6, -237.8]]) fig(x, z, g(x, z), 0, { pose: 'kneel', arms: 'pray', woman: rand() < 0.5 });
  fig(-9.2, -237.2, g(-9.2, -237.2), -0.4, { carry: 'basket' });
  // on the sacbe
  for (let i = 0; i < 9; i++) { const z = -150 - i * 10 - rand() * 4, x = (i % 2 ? 1.4 : -1.4) + (rand() - 0.5) * 0.6; fig(x, z, 0.8, i % 3 ? 0 : Math.PI, { carry: pick(['none', 'basket', 'pot', 'none']), pose: rand() < 0.2 ? 'talk' : 'stand' }); }
  // crossing the plaza toward the Castillo, and on its south stair (its foot 35.3 m out, 91 steps to 24 m)
  for (let i = 0; i < 14; i++) { const x = -22 + rand() * 60, z = 40 + rand() * 26; fig(x, z, 0.04, Math.PI + (rand() - 0.5) * 1.2, { carry: pick(['none', 'none', 'basket', 'pot']), pose: rand() < 0.25 ? 'talk' : 'stand' }); }
  const stepAt = (i) => [35.27 - 24 * (i + 0.5) / 91, 24 * (i + 1) / 91];
  for (const [i, x, rot] of [[9, -2.2, Math.PI], [12, 1.6, Math.PI], [40, 0.6, 0], [66, -1.4, Math.PI], [70, 2.4, Math.PI]]) { const [z, y] = stepAt(i); fig(x, z, y, rot, { woman: false }); }
  priest(2.6, 8.4, 24, Math.PI); priest(-3.0, 8.6, 24, Math.PI * 0.9, { carry: 'staff', len: 1.8, staffMat: 'timber' });
  // at the small altars: someone kneeling with a hand to the censer, a second standing by
  for (const [x, z, r] of PLAZA_SHRINES) { fig(x + 0.9, z + 3.0, 0.04, Math.PI + r, { pose: 'kneel', arms: 'pray', woman: rand() < 0.5 }); if (rand() < 0.5) fig(x - 1.2, z + 3.4, 0.04, Math.PI, { pose: 'talk' }); }
  // in the Temple of the Warriors: a priest at the altar of the Atlanteans, another in the hall
  priest(118.0, -13.2, 13.43, -Math.PI / 2, { pose: 'talk' }); priest(106.4, -16.6, 13.43, Math.PI / 2);
  return { ...base('chichen-itza-rites', L), style: 'life' };
}
/**
 * A game in the Great Ball Court (§13): two teams of four in the alley about the middle line, in loincloths with
 * hip guards of hide, the ball between them; people watching from the tops of the two platforms and of the end
 * temples' platforms, sitting along the edges or standing.
 */
function ballgame() {
  const rand = rng(1200), L = [], pick = (a) => a[Math.floor(rand() * a.length)], X0 = -128.5, X1 = -101.5, ZC = -37;
  const person = (x, z, y, rot, o = {}) => {
    const woman = o.woman ?? rand() < 0.35;
    L.push({ t: 'figure', at: [x, z], y, rot, h: woman ? 1.5 : 1.6, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'wrap', cloth: 'cloth_white', cloth2: pick(['cloth_red', 'cloth_ochre', 'cloth_white']), skin: pick(['skin_dark', 'skin_dark', 'skin_medium']), hat: 'none', hair: woman ? pick(['long', 'bun']) : 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: woman ? 'none' : pick(['cape', 'sash', 'none']), pose: 'stand', ...o });
  };
  // the players: each team on its half, facing the middle; the hip guards (the belt in hide) and the knee pad
  for (const [side, cloth2] of [[-1, 'cloth_red'], [1, 'cloth_indigo']]) for (let i = 0; i < 4; i++) {
    const x = X0 + 4 + rand() * (X1 - X0 - 8), z = ZC + side * (3 + i * 5 + rand() * 3);
    person(x, z, 0.04, side < 0 ? Math.PI : 0, { woman: false, dress: 'loincloth', top: 'bare', cloth: 'cloth_white', cloth2, over: 'belt', hat: i === 0 ? 'cap' : 'none', hatMat: 'stucco_leaf', pose: i === 1 ? 'kneel' : 'stand' });
  }
  const ball = { t: 'm_ball', at: [X0 + 13 + rand() * 2, ZC + 1.2], y: 0.04 };
  // the watchers on the platforms' tops (8.5 m), along their inner edges; and on the end temples' platforms (3.2 m)
  for (const s of [-1, 1]) for (let i = 0; i < 16; i++) {
    const z = -82 + rand() * (s > 0 ? 72 : 90), x = (s < 0 ? -133 - 0.7 : -97 + 0.7) - s * 0 + s * rand() * 2.5 * (rand() < 0.5 ? 1 : 0);
    person(x, z, 8.5, s < 0 ? -Math.PI / 2 : Math.PI / 2, { pose: rand() < 0.55 ? 'sit_ground' : rand() < 0.3 ? 'talk' : 'stand' });
  }
  for (const zt of [-118, 44]) for (let i = 0; i < 6; i++) person(-127 + rand() * 24, zt + (zt < 0 ? 4.5 : -4.5) + (rand() - 0.5), 3.2, zt < 0 ? Math.PI : 0, { pose: rand() < 0.5 ? 'sit_ground' : 'stand' });
  return [{ ...base('chichen-itza-ballgame', L), style: 'life' }, base('chichen-itza-ball', [ball])];
}
/** The plaza's own dressing and the cenote's: wear of the paving, stelae and altars, the ceibas, the cenote's roots and nests, the sweat bath. */
function dressing() {
  const E = [{ t: 'plaza_wear', rect: PLAZA, seed: 77, skip: WEAR_SKIP, n: 260, y: 0.04 }];
  for (const [x, z, rot] of PLAZA_STELAE) E.push({ t: 'maya_stela', at: [x, z], y: 0.04, rot, v: Math.abs(x * 7 + z) % 2 });
  for (const [x, z, rot] of PLAZA_SHRINES) E.push({ t: 'maya_shrine', at: [x, z], y: 0.04, rot });
  E.push({ t: 'sacbe_edge', a: SACBE_A, b: SACBE_B, w: 6, seed: 5 });
  const out = [base('chichen-itza-dressing', E)];
  const T = [];
  for (const [x, z] of CEIBAS) T.push({ t: 'maya_ceiba', at: [x, z], y: ground.height(x, z), s: 0.9 + ((x * 3 + z) % 7) / 20, seed: Math.abs(Math.floor(x * 5 + z)) });
  T.push({ t: 'maya_sweatbath', at: SWEATBATH.at, y: ground.height(...SWEATBATH.at), rot: SWEATBATH.rot });
  T.push({ t: 'maya_cenote_life', c: CENOTE.c, r: CENOTE.r, h: ground.height, water: CENOTE.water, seed: 9 });
  out.push(base('chichen-itza-trees', T));
  return out;
}
const SACBE_A = [0, -140], SACBE_B = [0, -240];
function riteObjects() { return base('chichen-itza-offering', [{ t: 'm_offering', at: [-5.6, -240.2], y: ground.height(-5.6, -240.2) + 0.02, dir: [0, -1] }]); }

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 30) plans.push(base(`chichen-itza-town-${i / 30}`, all.slice(i, i + 30).flatMap(lotElements)));
  // the water in the Sacred Cenote, 20 m below the rim (docs/settlements/chichen-itza.md)
  const [cx, cz] = CENOTE.c, r = CENOTE.r;
  plans.push({ ...base('chichen-itza-cenote-water', [{ t: 'water_cells', rect: [cx - r, cz - r, cx + r, cz + r], y: CENOTE.water, cell: 0.75, inside: (x, z) => cenoteDist(x, z) < 0 && ground.height(x, z) < CENOTE.water }]), style: 'ming' });
  return [...plans, ...market(), rites(), riteObjects(), ...ballgame(), ...dressing()];
}
