// The town of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §2, §6–§8): the quay and the ships at anchor; the Ribeira
// palace with the Tower of the King, the Terreiro do Paço, the Ribeira das Naus; the Sé and the castle on the Alfama hill; the
// merchants' houses of the Rua Nova, the lanes of the Alfama, the fishermen of Belém; the goods and the people at every front.
import '../../styles/manueline/index.js';
import { lodTiles } from '../lod.js';
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

// ── the goods and the people ──
const CL = ['cloth_indigo', 'cloth_brown', 'cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_grey', 'cloth_white', 'cloth_maroon', 'cloth_black', 'cloth_blue'];
const FR = { n: [0, -1], s: [0, 1] };
function streetLife() {
  const L = [], rand = rng(1521), pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: 'tunic', cloth: pick(CL), cloth2: pick(CL), skin: pick(['skin_light', 'skin_light', 'skin_medium', 'skin_dark']), hat: pick(['none', 'cap', 'cap', 'brim']), over: pick(['cape', 'belt', 'none']), carry: 'none', ...extra });
  const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  const ok = ([x, z]) => Math.hypot(x, z) < RADIUS - 40 && wet(x, z) > 2;
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, n = FR[l.front], out = n, fz = l.front === 'n' ? z0 : z1, w = x1 - x0;
    const P = (t, off) => [x0 + w * t, fz + n[1] * off], mid = P(0.5, 0);
    if (!ok(mid) || !onStreet(P(0.5, 2.5)[0], P(0.5, 2.5)[1], 0.5)) continue;
    const y = height(mid[0], mid[1]);
    if (l.kind === 'merchant') {
      if (rand() < 0.75) L.push({ t: 'stall', at: P(0.2 + rand() * 0.6, 1.5), y, rot: Math.atan2(n[0], n[1]), awning: pick(CL), stripe: pick(['cloth_white', 'cloth_ochre']), goods: pick([['blue_jar', 'glazed_jar'], ['cloth'], ['produce'], ['basket'], ['amphora', 'water_pot']]), seed: seed() });
      if (rand() < 0.5) L.push({ t: 'crates', at: P(0.85, 0.8), y, rot: 0, n: 3, seed: seed() });
      if (rand() < 0.45) person(P(0.3 + rand() * 0.4, 3.0), y, faceTo(out), { pose: rand() < 0.5 ? 'talk' : 'stand' });
    } else if (l.kind === 'alfama') {
      if (rand() < 0.25) L.push({ t: 'laundry', at: P(0.5, 2.0), y, rot: 0, len: Math.min(w, 5), seed: seed() });
      if (rand() < 0.3) L.push({ t: 'pot', kind: pick(['water_pot', 'glazed_jar']), at: P(0.15, 0.5), y, rot: 0, n: 2, seed: seed() });
      if (rand() < 0.2) person(P(0.5, 2.0), y, faceTo(out), { dress: 'robe', hat: 'veil', pose: 'sit_low', over: 'shawl' });
      if (rand() < 0.12) L.push({ t: 'animal', kind: pick(['dog', 'goat', 'donkey']), at: P(0.7, 2.5), y, rot: rand() * 6.28, seed: seed() });
    } else {
      if (rand() < 0.4) L.push({ t: 'basket', at: P(0.3, 0.8), y, rot: 0, n: 2, seed: seed(), goods: 'hide_tan' });
      if (rand() < 0.3) L.push({ t: 'laundry', at: P(0.5, 2.2), y, rot: 0, len: 4, seed: seed() });
    }
  }
  // the quay and the Terreiro: porters with sacks and barrels, sailors, a cart with its ox, merchants talking, the shipyard's workers
  const qz = QUAY[1] - 1.2;
  for (let x = QUAY[0] + 12; x < QUAY[2] - 10; x += 9 + rand() * 12) {
    const p = [x, qz - rand() * 2.2], k = rand();
    if (!ok(p) || inRect(PLAZA, p[0], p[1])) continue;
    if (k < 0.3) L.push({ t: 'barrel', at: p, y: g + 0.04, rot: 0, n: 2, seed: seed() });
    else if (k < 0.5) L.push({ t: 'sacks', at: p, y: g + 0.04, rot: rand() * 3, n: 4, seed: seed() });
    else if (k < 0.7) L.push({ t: 'crates', at: p, y: g + 0.04, rot: 0, n: 3, seed: seed() });
    else if (k < 0.8) L.push({ t: 'cart', at: p, y: g + 0.04, rot: Math.PI / 2, kind: 'two', load: 'barrels', beast: 'ox', seed: seed() });
    else person(p, g + 0.04, rand() * 6.28, { carry: 'sack', pose: 'stand' });
  }
  for (let k = 0; k < 14; k++) { const p = [TERREIRO[0] + 6 + rand() * (TERREIRO[2] - TERREIRO[0] - 12), TERREIRO[1] + 6 + rand() * 60]; person(p, g + 0.04, rand() * 6.28, { pose: rand() < 0.4 ? 'talk' : 'stand' }); }
  for (let k = 0; k < 8; k++) person([YARD[0] + 8 + rand() * 90, YARD[1] + 10 + rand() * 50], g + 0.03, rand() * 6.28, { dress: 'tunic', hat: 'cap', over: 'apron', pose: 'stand' });
  // the monks of the Jerónimos in their white habits and black scapulars, at the portal and in the cloister
  for (const [p, r] of [[[-210, 52], 3.1], [[-200, 60], 2.5], [[-196, 28], 1.4]]) person(p, g + 0.05, r, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', over: 'cape', hat: 'none', hair: 'shaven', pose: 'stand' });
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`lisbon-life-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 230 }; });
}
void SEA;
