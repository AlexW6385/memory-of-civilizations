// The town of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §2, §6–§8): the quay and the ships at anchor; the Ribeira
// palace with the Tower of the King, the Terreiro do Paço, the Ribeira das Naus; the Sé and the castle on the Alfama hill; the
// merchants' houses of the Rua Nova, the lanes of the Alfama, the fishermen of Belém; the goods and the people at every front.
import '../../styles/manueline/index.js';
import { lodTiles } from '../lod.js';
import { lifeElements } from './life.js';
import { RADIUS, GROUND, SEA, QUAY, PALACE, TERREIRO, YARD, SE, CASTLE, SQUARE, SHIPS, SLIPS, PLAZA, height, lots, onStreet, inRect, wet } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, extra = {}) => ({ id, style: 'manueline', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-206, 114], facing: 'n' }, ...extra });
const g = GROUND;

function harbour() {
  const E = [];
  // the stone quay of the Ribeira, the promenade and the Terreiro paved in slabs
  E.push({ t: 'quay', rect: [QUAY[0], QUAY[1] - 0.4, QUAY[2], QUAY[1] + 1.8], y0: SEA - 2.2, y1: g + 0.05, bollards: true, side: 0.9 });
  E.push({ t: 'floor', rect: [QUAY[0], QUAY[1] - 3.5, QUAY[2], QUAY[1] + 1.8], y: g + 0.04, th: 0.2, mat: 'flagstone' });
  E.push({ t: 'floor', rect: TERREIRO, y: g + 0.04, th: 0.2, mat: 'flagstone' });
  E.push({ t: 'floor', rect: [YARD[0], YARD[1], YARD[2], YARD[3] - 3.5], y: g + 0.03, th: 0.2, mat: 'pebbles' });
  for (const s of SHIPS) E.push({ t: 'ship', ...s, y: SEA });
  return base('lisbon-harbour', E);
}
function civic() {
  const y = g + 0.04, yS = height((SE[0] + SE[2]) / 2, (SE[1] + SE[3]) / 2), yC = height((CASTLE[0] + CASTLE[2]) / 2, (CASTLE[1] + CASTLE[3]) / 2);
  const E = [
    { t: 'palace', rect: PALACE, y, seed: 7 },
    { t: 'se', rect: SE, y: yS },
    { t: 'castle', rect: CASTLE, y: yC, seed: 3 },
    { t: 'pelourinho', at: [(SQUARE[0] + SQUARE[2]) / 2 + 8, (SQUARE[1] + SQUARE[3]) / 2], y: g },
    { t: 'fountain', at: [(SQUARE[0] + SQUARE[2]) / 2 - 8, (SQUARE[1] + SQUARE[3]) / 2], y: g },
    { t: 'fountain', at: [(TERREIRO[0] + TERREIRO[2]) / 2 + 10, 60], y },
    { t: 'floor', rect: SQUARE, y: g + 0.03, th: 0.2, mat: 'flagstone' },
  ];
  return base('lisbon-civic', E);
}
function yard() {
  const E = [], rand = rng(15);
  for (const [x0, z0, x1, z1] of SLIPS) E.push({ t: 'hull_stocks', rect: [x0, z0, x1, z1], y: g + 0.03 });
  E.push({ t: 'rope_walk', rect: [158, 44, 252, 52], y: g + 0.03 });
  for (let i = 0; i < 6; i++) E.push({ t: 'timber_stack', rect: [206 + (i % 3) * 14, 78 + Math.floor(i / 3) * 8, 217 + (i % 3) * 14, 83.5 + Math.floor(i / 3) * 8], y: g + 0.03, seed: i + 1 });
  E.push({ t: 'crane', at: [146, 92], y: g + 0.03, dir: 1 }, { t: 'crane', at: [260, 92], y: g + 0.03, dir: -1 });
  void rand;
  return base('lisbon-yard', E);
}
export async function town() {
  const plans = [harbour(), civic(), yard()];
  const els = lots().map((l) => (l.kind === 'yard' ? { t: 'manu_yard', rect: l.rect, seed: l.seed, y: l.y, front: l.front } : { t: 'manu_house', rect: l.rect, seed: l.seed, y: l.y, plinth: l.plinth, front: l.front, kind: l.kind, ...(l.open ? { open: true, use: l.use } : {}) }));
  plans.push(...lodTiles('lisbon-houses', 'manueline', els, { R: RADIUS }));
  plans.push(...streetLife());
  return plans;
}

// ── the goods and the people (life.js) ──
function streetLife() {
  const tiles = lifeElements();
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`lisbon-life-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
}
void SEA;
