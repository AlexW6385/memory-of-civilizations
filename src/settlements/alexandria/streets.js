// Alexandria's streets and quays dressed (docs/settlements/alexandria.md §12): the cross streets and alleys paved, goods piled on the
// emporium's quay and cranes lifting them, nets drying at the Eunostos, the horrea behind the quay, washing across the alleys, shrines
// of Isis at the crossings; and the life at the house fronts — jars, sacks and baskets by trade, donkeys with loads, dogs, cats,
// fowl, old men on benches. Positions all derive from layout.js.

import { frame } from '../../styles/greek/agora.js';
import { houseLayout } from '../../styles/ptolemaic/house.js';
import { RADIUS, GROUND, SEA, QUAY, CANOPIC, SOMA, AGORA, STREETS_Z, ALLEYS_X, ROYAL, GYMZONE, MOLE, lots, wet, inRect, inLot } from './layout.js';

const g = GROUND;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, a) => a[Math.floor(rand() * a.length)];
const base = (id, elements, extra = {}) => ({ id, style: 'ptolemaic', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [100, -86], facing: 'e' }, ...extra });
const dry = (x, z, m = 3) => wet(x, z) > m && Math.hypot(x, z) < RADIUS - 80;
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

/** The runs of a street line free of water and of houses: [[a, b], …]. */
function runs(fixed, alongX, from, to, half) {
  const out = []; let a = null;
  for (let t = from; t <= to; t += 2) {
    const x = alongX ? t : fixed, z = alongX ? fixed : t;
    const ok = dry(x, z, 1) && !inLot(x, z, -0.1) && !inRect(ROYAL, x, z, 0) && !inRect(GYMZONE, x, z, 0) && !inRect(AGORA, x, z, 0) && !inRect(SOMA, x, z, 0) && !inRect(CANOPIC, x, z, 0);
    if (ok && a === null) a = t;
    if ((!ok || t + 2 > to) && a !== null) { if (t - a >= 8) out.push([a, t - 2]); a = null; }
  }
  void half; return out;
}
/** The cross streets flagged, the alleys of beaten pebbles, with a stone gutter along the middle. */
function paving() {
  const E = [];
  for (const z of STREETS_Z) for (const [a, b] of runs(z, true, -440, 440)) {
    E.push({ t: 'floor', rect: [a, z - 3, b, z + 3], y: g + 0.035, th: 0.2, mat: 'flagstone' });
    E.push({ t: 'floor', rect: [a, z - 0.2, b, z + 0.2], y: g + 0.03, th: 0.2, mat: 'limestone' });
  }
  for (const x of ALLEYS_X) for (const [a, b] of runs(x, false, -80, 250)) E.push({ t: 'floor', rect: [x - 3, a, x + 3, b], y: g + 0.035, th: 0.2, mat: 'pebbles' });
  return base('alexandria-paving', E);
}
/** The harbour front: goods on the quay, cranes, net racks, mooring gear, shrines and the fountain of the agora. */
function quayLife() {
  const rand = rng(331), E = [], y = g + 0.04, zq = QUAY[1] + 5.2;
  const kinds = ['amphorae', 'sacks', 'bales', 'logs', 'amphorae', 'crates', 'sacks', 'ingots', 'bales'];
  let i = 0;
  for (let x = -214; x < 420; x += 17 + rand() * 13) {
    if (!dry(x, zq, 2) || Math.abs(x - 100) < 9 || (x > 120 && x < 340 && rand() < 0.5)) continue;
    E.push({ t: 'cargo_pile', at: [x, zq + (rand() - 0.5) * 1.2], y, rot: rand() * 0.4 - 0.2, kind: kinds[i++ % kinds.length], n: 2 + Math.floor(rand() * 2), seed: Math.floor(rand() * 1e6) });
  }
  for (const x of [-170, -80, 20, 200, 300]) if (dry(x, QUAY[1] + 1.6, 2)) { E.push({ t: 'crane', at: [x, QUAY[1] + 1.4], y, rot: 0 }); }
  for (let x = -214; x < 420; x += 9 + rand() * 6) if (dry(x, QUAY[1] + 0.9, 2) && rand() < 0.7) E.push({ t: 'mooring', at: [x, QUAY[1] + 0.9], y, rot: rand() * 6, seed: Math.floor(rand() * 1e6) });
  // the Eunostos: nets and drying fish on the quay, the fishermen's side
  for (let x = -395; x < -260; x += 22) if (dry(x, QUAY[1] + 3.5, 2)) E.push({ t: 'net_rack', at: [x, -85.5], y, rot: 0, len: 3.4, seed: Math.round(x) });
  E.push({ t: 'cargo_pile', at: [-300, -85], y, rot: 0, kind: 'logs', n: 3, seed: 3 });
  // the mole: nets and baskets along its sides
  for (const z of [-240, -190, -120]) E.push({ t: 'net_rack', at: [MOLE[0] + 1.6, z], y, rot: Math.PI / 2, len: 3.0, seed: z });
  // street shrines of Isis at the great crossing and the cross streets
  for (const [x, z, rot] of [[SOMA[0] - 1.6, CANOPIC[1] - 1.2, 0], [SOMA[2] + 1.6, CANOPIC[3] + 1.2, Math.PI], [-300, CANOPIC[1] - 1.2, 0], [330, CANOPIC[3] + 1.2, Math.PI], [AGORA[0] + 4, AGORA[3] + 1, Math.PI]]) E.push({ t: 'shrine', at: [x, z], y: g + 0.04, rot });
  // the agora: the fountain house, stelae with decrees, a herm already built (town.js); goods heaped about
  E.push({ t: 'nymphaeum', c: [AGORA[2] - 7, (AGORA[1] + AGORA[3]) / 2], y: g + 0.04, rot: Math.PI / 2 });
  for (const dz of [-5, 5]) E.push({ t: 'stele', at: [AGORA[0] + 12, (AGORA[1] + AGORA[3]) / 2 + dz], y: g + 0.04, rot: 0.2 * dz, h: 2.1 });
  E.push({ t: 'cargo_pile', at: [AGORA[0] + 40, AGORA[1] + 28], y: g + 0.04, rot: 0.3, kind: 'amphorae', n: 3, seed: 8 });
  E.push({ t: 'cargo_pile', at: [AGORA[0] + 14, AGORA[1] + 26], y: g + 0.04, rot: 0, kind: 'sacks', n: 3, seed: 9 });
  return base('alexandria-quay', E);
}
/** Washing across the alleys between the upper windows. */
function washing() {
  const rand = rng(77), E = [];
  for (const x of ALLEYS_X) for (const [a, b] of runs(x, false, -80, 250)) for (let z = a + 6; z < b - 6; z += 14 + rand() * 12) if (rand() < 0.55) E.push({ t: 'ptol_wash', a: [x - 2.9, z], b: [x + 2.9, z], y: g + 4.9 + rand() * 0.8, seed: Math.floor(rand() * 1e6) });
  return base('alexandria-wash', E);
}
/** The life at the fronts, as the `life` style's objects (instanced settlement-wide): by the house's trade, donkeys, dogs, benches, fowl. */
export function streetLife() {
  const rand = rng(1250), L = [], R0 = RADIUS - 80;
  for (const l of lots()) {
    if (l.warehouse || Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) > R0) continue;
    const F = frame(l.rect, l.front), n = FR[l.front], rot = Math.atan2(n[0], n[1]), y = l.y, pt = (u, v) => F.P(u, -v);
    if (l.quarter === 'egyptian') {
      if (rand() < 0.35) L.push({ t: 'pot', kind: 'water_pot', n: 2, at: pt(F.L * (0.2 + rand() * 0.6), 0.5), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.2) L.push({ t: 'chickens', n: 3, at: pt(F.L * rand(), 1.2), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.16) L.push({ t: 'animal', kind: 'goat', at: pt(F.L * rand(), 1.6), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.14) L.push({ t: 'animal', kind: 'dog', at: pt(F.L * rand(), 1.4), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
      if (rand() < 0.12) L.push({ t: 'animal', kind: 'cat', at: pt(F.L * rand(), 0.8), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
      continue;
    }
    const K = houseLayout({ rect: l.rect, seed: l.seed, front: l.front });
    if (K.aShop) {
      const u0 = 1.0, u1 = K.wA - 0.3, trade = K.trade;
      const at = (u, v) => pt(u, v);
      if (trade === 'wine' || trade === 'oil') for (let k = 0; k < 3; k++) L.push({ t: 'pot', kind: 'amphora', n: 2, at: at(u0 + k * 1.0, 1.3), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
      else if (trade === 'grain' || trade === 'bread') L.push({ t: 'sacks', at: at((u0 + u1) / 2, 1.4), y, rot, n: 3, seed: Math.floor(rand() * 1e9) });
      else if (trade === 'fish') for (let k = 0; k < 3; k++) L.push({ t: 'basket', n: 2, at: at(u0 + k * 1.1, 1.4), y, seed: Math.floor(rand() * 1e9), goods: 'steel_grey' });
      else if (trade === 'cloth') L.push({ t: 'basket', n: 3, at: at(u0 + 1.0, 1.4), y, seed: Math.floor(rand() * 1e9), goods: 'cloth_ochre' });
      else if (trade === 'pottery') for (let k = 0; k < 4; k++) L.push({ t: 'pot', kind: pick(rand, ['dark_pot', 'water_pot', 'amphora']), n: 2, at: at(u0 + k * 0.9, 1.4), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
      else L.push({ t: 'crates', at: at((u0 + u1) / 2, 1.5), y, rot, seed: Math.floor(rand() * 1e9) });
    }
    if (rand() < 0.16) L.push({ t: 'animal', kind: 'donkey', at: pt(F.L * (0.2 + rand() * 0.6), 1.8), y, rot: rot + Math.PI / 2 + (rand() - 0.5) * 0.5, seed: Math.floor(rand() * 1e9), gear: true });
    if (rand() < 0.1) L.push({ t: 'animal', kind: 'dog', at: pt(F.L * rand(), 1.6), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
    if (rand() < 0.14) L.push({ t: 'animal', kind: 'cat', at: pt(F.L * rand(), 0.7), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
    if (rand() < 0.1) L.push({ t: 'chickens', n: 3, at: pt(F.L * rand(), 1.2), y, rot: rand() * 6, seed: Math.floor(rand() * 1e9) });
  }
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`alexandria-streetlife-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 200 }; });
}
export function streetPlans() { return [paving(), quayLife(), washing(), ...streetLife()]; }
void SEA;
