// Round the Citadel (docs/settlements/mohenjo-daro.md §2, §6, §7): the Lower Town's houses in their grid with the drains along the streets and
// lanes, the workshops, the market place with its great well, the town wall on the south, the landing on the Indus with its boats and the
// harbour office, and the people — priests at the Bath, craftsmen, merchants, porters, carts with zebu.
import { RADIUS, PLAT, XS, STREET_W, PLAZA, WELL_BIG, WALL, WALL_Z, RIVER, QUAY, CUSTOMS, BATH, GRANARY, PILLARED, COLLEGE, EAST_STAIR, riverX, streets, lanes, lots, inRect } from './layout.js';
import { boatFloat } from '../../objects/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];
const base = (id, elements, o = {}) => ({ id, style: 'indus', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-155, -72.5], facing: 'n' }, ...o });
/** A point of a lot in its frame (u along the lane, v into the lot). */
const P = (l, u, v) => { const [x0, z0, x1, z1] = l.rect; return l.front === 'w' ? [x0 + v, z0 + u] : l.front === 'e' ? [x1 - v, z0 + u] : l.front === 'n' ? [x0 + u, z0 + v] : [x0 + u, z1 - v]; };
const facing = (l) => ({ w: -Math.PI / 2, e: Math.PI / 2, n: Math.PI, s: 0 })[l.front] ?? 0;   // (a figure faces −z at rot 0; sin(rot) is its x)

function people() {
  const rand = rng(2500), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', over: 'none', cloth: 'cloth_white', cloth2: 'cloth_white', skin: pick(rand, ['skin_medium', 'skin_dark', 'skin_medium']), hat: 'none', hair: pick(rand, ['bun', 'short']), hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const man = (at, rot, o = {}) => fig(at, rot, { over: pick(rand, ['shawl', 'shawl', 'none']), cloth: pick(rand, ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_red']), cloth2: 'cloth_red', beard: rand() < 0.5 ? 1 : 0, ...o });
  const woman = (at, rot, o = {}) => fig(at, rot, { top: '', over: 'shawl', hair: 'bun', cloth: pick(rand, ['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_white']), cloth2: 'cloth_ochre', beard: 0, ...o });
  // the Bath: attendants and bathers' watchers on the court's paving, a figure at the south doors
  const [cx0, cz0, cx1, cz1] = BATH.court, [px0, pz0, px1, pz1] = BATH.pool;
  for (const [x, z, r] of [[px0 - 2, (pz0 + pz1) / 2 - 2, Math.PI / 2], [px1 + 2.2, (pz0 + pz1) / 2 + 1, -Math.PI / 2], [(px0 + px1) / 2 + 1, pz0 - 1.6, 0], [px0 - 3.5, pz1 + 0.5, Math.PI]]) man([x, z], r, { y: PLAT, hair: 'shaven', beard: 0, cloth: 'cloth_white', over: 'shawl' });
  man([px1 + 4.5, pz0 + 3], -Math.PI / 2, { y: PLAT, pose: 'cross', cloth: 'cloth_white' });
  // the priests at the College's court, the gate's keepers, the Pillared Hall's assembly
  for (let k = 0; k < 5; k++) man([COLLEGE[0] + 14 + k * 9, COLLEGE[1] + 13.5], 0, { y: PLAT, pose: k % 2 ? 'cross' : 'stand', cloth: 'cloth_white', hair: 'shaven', beard: 0 });
  for (const [x, z] of [[-157, COLLEGE[1] - 1], [-153, COLLEGE[1] - 1]]) man([x, z], Math.PI, { y: PLAT, pose: 'staff', carry: 'staff', len: 2.0 });
  for (let k = 0; k < 8; k++) man([PILLARED[0] + 4 + (k % 4) * 7, PILLARED[1] + 5 + Math.floor(k / 4) * 13], rand() * 6.28, { y: PLAT + 0.45, pose: k % 3 === 0 ? 'cross' : 'stand' });
  // the granary: porters with sacks at the ramp, a clerk at the tally
  for (let k = 0; k < 4; k++) man([GRANARY[0] + 24 + k * 0.5, GRANARY[3] + 3 + k * 2.2], Math.PI, { y: PLAT, arms: 'sack', carry: 'sack', cloth: 'cloth_ochre', beard: 0 });
  man([GRANARY[0] + 12, GRANARY[1] + 3.5], Math.PI, { y: PLAT + 1.78, pose: 'cross', cloth: 'cloth_white' });
  // the market place: sellers on their mats, buyers, a water-carrier at the well
  for (let k = 0; k < 14; k++) {
    const a = rand() * 6.28, r = 7 + rand() * 12, x = WELL_BIG[0] + Math.cos(a) * r * 1.2, z = WELL_BIG[1] + Math.sin(a) * r;
    if (!inRect(PLAZA, x, z, -1)) continue;
    (k % 3 === 0 ? woman : man)([x, z], rand() * 6.28, { pose: rand() < 0.3 ? 'cross' : 'stand', carry: rand() < 0.3 ? 'pot' : 'none', arms: undefined });
  }
  woman([WELL_BIG[0] + 3.3, WELL_BIG[1] + 0.5], Math.PI / 2, { carry: 'pot', arms: 'head' });
  // the workshops: the master at his bench in the court, seated on the ground
  for (const l of lots()) if (!['house', 'small'].includes(l.kind)) { const p = P(l, l.rect[3] - l.rect[1] > 0 ? Math.min(l.front === 'w' || l.front === 'e' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0], 99) / 2 : 6, 6.0); man(p, facing(l) + Math.PI, { y: l.y, pose: 'cross', cloth: 'cloth_ochre', beard: 1 }); }
  // the quay: boatmen and porters at the stairs, the harbour clerk at his office
  for (const z of QUAY.stairs) for (let k = 0; k < 2; k++) man([QUAY.x1 - 2.5, z + (k ? 4 : -4)], Math.PI / 2, { y: QUAY.top + 0.02, arms: k ? 'sack' : undefined, carry: k ? 'sack' : 'none' });
  man([CUSTOMS[0] + 2.4, (CUSTOMS[1] + CUSTOMS[3]) / 2], Math.PI / 2, { y: 0.04, pose: 'cross', cloth: 'cloth_white', beard: 1 });
  // the stair's foot: a pair of keepers
  for (const dz of [-8, 8]) man([EAST_STAIR.rect[2] + 3, (EAST_STAIR.rect[1] + EAST_STAIR.rect[3]) / 2 + dz], -Math.PI / 2, { pose: 'staff', carry: 'staff', len: 2.0 });
  // the wall's gate: two guards
  for (const dx of [-5, 5]) man([WALL.gate + dx, WALL_Z - 4], 0, { pose: 'staff', carry: 'staff', len: 2.0 });
  return L;
}
/** The carts with zebu, animals, jars and baskets at the fronts, boats on the river. */
function life() {
  const rand = rng(2501), L = [], bf = boatFloat('barge'), rf = boatFloat('reed');
  const cart = (at, rot, load) => { L.push({ t: 'cart', kind: 'two', beast: 'zebu', load, at, y: 0, rot, seed: Math.floor(rand() * 1e9) }); };
  // the carts on First Street and the street to the market, in the market place, at the quay and on the platform
  for (const [x, z, r] of [[62, -120, 0], [62, -4, Math.PI], [60, 90, 0], [-30, -150, 0], [154, 20, Math.PI], [100, -40, Math.PI / 2], [180, -40, -Math.PI / 2], [62, 160, Math.PI], [246, -60, 0], [246, 40, Math.PI]]) cart([x + (rand() - 0.5) * 2, z], r, pick(rand, ['sacks', 'hay', 'empty']));
  cart([GRANARY[0] + 25.5, GRANARY[3] + 14], Math.PI, 'sacks'); L[L.length - 1].y = PLAT;
  cart([-158, 62], 0, 'sacks');
  // the animals: zebu and buffalo, goats, dogs in the streets
  for (let k = 0; k < 26; k++) {
    const sx = pick(rand, XS.slice(1, 5)), horizontal = rand() < 0.4;
    const x = horizontal ? -20 + rand() * 250 : sx + (rand() - 0.5) * 5, z = horizontal ? pick(rand, [-128, -40, 48, 136]) + (rand() - 0.5) * 3 : -200 + rand() * 390;
    if (Math.hypot(x, z) > RADIUS - 40 || inRect(PLAZA, x, z, 2)) continue;
    L.push({ t: 'animal', kind: pick(rand, ['zebu', 'zebu', 'buffalo', 'goat', 'goat', 'dog']), at: [x, z], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
  }
  for (let k = 0; k < 6; k++) L.push({ t: 'animal', kind: pick(rand, ['goat', 'dog', 'zebu']), at: [-210 + rand() * 120, 60 + rand() * 60], y: 0, rot: rand() * 6.28, seed: k + 9 });
  // the landing: moored plank-and-reed boats alongside, loaded; reed boats beyond; goods on the quay
  for (const [z, len, load] of [[-92, 12, 'cargo'], [-46, 10, 'cargo'], [10, 12, 'cargo'], [58, 11, 'cargo']]) {
    const x = riverX(z) - RIVER.hw + 3.8;
    L.push({ t: 'boat', kind: 'barge', len, at: [x, z], y: RIVER.level + bf, rot: 0, seed: Math.round(z * 3) });
  }
  for (const [z, d] of [[-70, 12], [-20, 14], [30, 10], [80, 13]]) L.push({ t: 'boat', kind: 'reed', len: 6.4, at: [riverX(z) - 6 + d * 0.3, z], y: RIVER.level + rf, rot: 0.1, seed: Math.round(z) });
  for (let k = 0; k < 14; k++) { const z = QUAY.z0 + 8 + rand() * (QUAY.z1 - QUAY.z0 - 16); if (QUAY.stairs.some((s) => Math.abs(s - z) < 6)) continue; L.push({ t: k % 3 ? 'sacks' : 'pot', kind: 'water_pot', n: 3, at: [QUAY.x1 - 2.6 - rand() * 3, z], y: QUAY.top + 0.02, rot: rand() * 6.28, seed: k * 7 + 1 }); }
  // at the house doors: jars, baskets, firewood, a hearth's pots
  for (const l of lots()) {
    if (rand() > 0.34) continue;
    const du = P(l, 1.2 + rand() * (Math.max(l.front === 'w' || l.front === 'e' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0], 3) - 2.4), -0.5);
    L.push({ t: pick(rand, ['pot', 'basket', 'firewood']), kind: pick(rand, ['water_pot', 'dark_pot', 'matka']), at: du, y: l.y, rot: rand() * 6.28, n: 2, seed: Math.floor(rand() * 1e9) });
  }
  return L;
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  const plans = [], LT = lots();
  plans.push(base('md-streets', [{ t: 'indus_streets', streets: streets(), lanes: lanes() }]));
  plans.push(base('md-market', [{ t: 'indus_market', rect: PLAZA, well: WELL_BIG }], { rooms: [{ id: 'market place', rect: PLAZA, y: 0, kind: 'open', market: true }] }));
  plans.push(base('md-river', [{ t: 'indus_river', x0: QUAY.x1, level: RIVER.level }]));
  plans.push(base('md-quay', [{ t: 'indus_quay', ...QUAY, bed: RIVER.bed, level: RIVER.level }, { t: 'indus_office', rect: CUSTOMS }]));
  // the wall on the south with its gate and towers
  {
    const E = [], g = WALL.gate;
    E.push({ t: 'indus_wall', a: [WALL.x0, WALL_Z], b: [WALL.x1, WALL_Z], th: WALL.th, h: WALL.h, gaps: [{ at: g - WALL.x0, w: 7 }] });
    for (const s of [-1, 1]) E.push({ t: 'indus_tower', c: [g + s * 6.6, WALL_Z], a: 3, y: 0, h: 8.5 });
    for (const x of [WALL.x0 + 14, WALL.x1 - 14, -40, 160]) E.push({ t: 'indus_tower', c: [x, WALL_Z], a: 2.6, y: 0, h: 7 });
    plans.push(base('md-wall', E));
  }
  for (let i = 0; i < LT.length; i += 60) plans.push(base(`md-houses-${i / 60}`, LT.slice(i, i + 60).map((l) => ({ t: 'indus_house', rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, open: l.open, y: l.y }))));
  plans.push({ ...base('md-life', life()), style: 'life' });
  plans.push({ ...base('md-people', people()), style: 'life' });
  return (CACHE = plans);
}
void STREET_W;
