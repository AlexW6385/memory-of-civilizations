// Alexandria's streets and quays dressed (docs/settlements/alexandria.md §12): the cross streets and alleys paved, goods piled on the
// emporium's quay and cranes lifting them, nets drying at the Eunostos, the horrea behind the quay, washing across the alleys, shrines
// of Isis at the crossings; and the life at the house fronts — jars, sacks and baskets by trade, donkeys with loads, dogs, cats,
// fowl, old men on benches. Positions all derive from layout.js.

import { frame } from '../../styles/greek/agora.js';
import { houseLayout } from '../../styles/ptolemaic/house.js';
import { RADIUS, GROUND, SEA, QUAY, PIER, CANOPIC, SOMA, AGORA, STREETS_Z, ALLEYS_X, ROYAL, GYMZONE, MOLE, lots, wet, inRect, inLot } from './layout.js';

const g = GROUND;
const FIG = [];            // the figures at the quay's work (filled by quayLife, drawn by streetLife)
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
  FIG.length = 0;
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
  // date palms along the promenade and in the agora, fig trees in the agora's corners
  for (let x = -200; x < 420; x += 34 + rand() * 10) if (dry(x, -83, 2) && !E.some((e) => e.at && Math.abs(e.at[0] - x) < 6 && Math.abs(e.at[1] + 85) < 3) && Math.abs(x - 100) > 12) E.push({ t: 'ptol_tree', at: [x, -82.8], y, kind: 'palm', h: 5 + rand() * 3, seed: Math.floor(rand() * 1e6) });
  for (const [dx, dz] of [[2, 2], [AGORA[2] - AGORA[0] - 2, 2], [2, AGORA[3] - AGORA[1] - 2], [AGORA[2] - AGORA[0] - 2, AGORA[3] - AGORA[1] - 2]]) E.push({ t: 'ptol_tree', at: [AGORA[0] + dx, AGORA[1] + dz], y: g + 0.04, kind: 'fig', h: 3.6, seed: dx * 3 + dz });
  // the pier before the arrival: the solid stone of its head out into the harbour, goods piled along both edges with a lane between,
  // a treadwheel crane at the head, moorings, and the dockers, the carriers, a ship's master and a merchant at their business
  {
    const [px0, pz0, px1, pz1] = PIER, pc = (px0 + px1) / 2, py = g + 0.05, ARR = [100, -86], fa = (p) => Math.atan2(-(ARR[0] - p[0]), -(ARR[1] - p[1]));
    E.push({ t: 'quay', rect: [px0, pz0, px1, pz1 + 1.5], y0: SEA - 2.2, y1: py, bollards: false });
    E.push({ t: 'cargo_pile', at: [px0 + 1.5, -97], y: py, rot: Math.PI / 2, kind: 'amphorae', n: 3, seed: 501 });
    E.push({ t: 'cargo_pile', at: [px1 - 1.5, -101], y: py, rot: Math.PI / 2, kind: 'sacks', n: 3, seed: 502 });
    E.push({ t: 'cargo_pile', at: [px0 + 1.4, -108], y: py, rot: Math.PI / 2, kind: 'bales', n: 2, seed: 503 });
    E.push({ t: 'cargo_pile', at: [px1 - 1.4, -112], y: py, rot: Math.PI / 2, kind: 'crates', n: 3, seed: 504 });
    E.push({ t: 'cargo_pile', at: [px0 + 1.5, -117], y: py, rot: Math.PI / 2, kind: 'ingots', n: 3, seed: 505 });
    E.push({ t: 'crane', at: [pc + 1.2, pz0 + 3.2], y: py, rot: 0 });
    for (const z of [-96, -104, -114, -122]) for (const x of [px0 + 0.35, px1 - 0.35]) E.push({ t: 'mooring', at: [x, z], y: py, rot: z * 3 + x, seed: Math.round(-z * 7 + x) });
    E.push({ t: 'net_rack', at: [px1 + 1.2, -92.5], y: g + 0.04, rot: Math.PI / 2, len: 3.0, seed: 506 });
    const f = (at, o) => FIG.push({ at, rot: fa(at), dress: 'tunic', hair: 'short', skin: 'skin_medium', seed: Math.round(at[0] * 13 - at[1] * 7), ...o });
    f([pc + 0.3, -94], { carry: 'sack', cloth: 'cloth_brown', hat: 'cap', rot: Math.PI });
    f([pc - 0.6, -99.5], { carry: 'sack', cloth: 'linen', hat: 'cap', skin: 'skin_dark', rot: 0 });
    f([pc + 0.7, -104.5], { carry: 'sack', cloth: 'cloth_ochre', hat: 'cap', rot: Math.PI });
    f([pc - 0.4, -110.5], { pose: 'talk', dress: 'robe', over: 'cape', cloth: 'cloth_white', beard: true, hat: 'brim', rot: -2.3 });
    f([pc + 0.9, -111.3], { pose: 'talk', cloth: 'cloth_maroon', over: 'belt', hat: 'cap', rot: 0.85 });
    f([pc - 1.0, -116], { dress: 'loincloth', cloth: 'linen', hair: 'shaven', skin: 'skin_dark', rot: Math.PI });
    f([pc + 1.0, -118.5], { dress: 'loincloth', cloth: 'linen', hair: 'shaven', skin: 'skin_dark', rot: 3.5 });
    f([px0 + 0.3, -121], { pose: 'sit_ground', dress: 'loincloth', cloth: 'linen', hair: 'shaven', skin: 'skin_dark', rot: -1.57 });
    f([px1 - 0.5, -119.5], { pose: 'sit_ground', cloth: 'cloth_brown', hat: 'cap', rot: 1.57 });
    f([pc, -124.3], { pose: 'stand', dress: 'tunic', cloth: 'cloth_red', over: 'belt', hat: 'cap', rot: 0 });
    f([pc + 1.1, -100], { dress: 'robe', over: 'cape', cloth: 'cloth_indigo', beard: true, hat: 'brim', rot: 0.4 });
  }
  // the quay's workers: sitting at the nets, standing by the cranes, porters with sacks
  for (const e of E) {
    if (e.t === 'net_rack') FIG.push({ at: [e.at[0] + 0.8, e.at[1] + 1.4], rot: 0, pose: 'sit_ground', dress: 'loincloth', cloth: 'linen', hair: 'shaven', skin: 'skin_dark', seed: e.seed });
    else if (e.t === 'crane') for (const dx of [-0.9, 0.9]) FIG.push({ at: [e.at[0] + dx, e.at[1] + 2.4], rot: Math.PI, pose: 'stand', dress: 'loincloth', cloth: 'linen', hair: 'shaven', skin: 'skin_dark', seed: Math.floor(e.at[0]) + dx });
    else if (e.t === 'cargo_pile' && e.at[1] < -80 && rand() < 0.5) FIG.push({ at: [e.at[0] + 2.0, e.at[1] + 1.3], rot: 1.2, pose: 'stand', dress: 'tunic', cloth: pick(rand, ['cloth_brown', 'linen', 'cloth_ochre']), hat: 'cap', carry: 'sack', skin: 'skin_medium', hair: 'short', seed: e.seed });
  }
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
  for (const f of FIG) L.push({ t: 'figure', y: g + 0.04, ...f });
  const tiles = new Map();
  for (const e of L) { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); }
  return [...tiles].map(([k, list]) => { const [i, j] = k.split(',').map(Number); return { ...base(`alexandria-streetlife-${k}`, list), style: 'life', center: [i * 100 + 50, j * 100 + 50], near: 200 }; });
}
export function streetPlans() { return [paving(), quayLife(), washing(), ...streetLife()]; }
void SEA;
