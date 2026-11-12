// Round the Citadel (docs/settlements/mohenjo-daro.md §2, §6, §7): the Lower Town's houses in their grid with the drains along the streets and
// lanes, the workshops, the market place with its great well, the town wall on the south, the landing on the Indus with its boats and the
// harbour office, and the people — priests at the Bath, craftsmen, merchants, porters, carts with zebu.
import { RADIUS, PLAT, XS, STREET_W, PLAZA, WELL_BIG, WALL, WALL_Z, RIVER, QUAY, CUSTOMS, BATH, GRANARY, PILLARED, COLLEGE, EAST_STAIR, MOUND, riverX, streets, lanes, lots, inRect } from './layout.js';
import { boatFloat } from '../../objects/index.js';
import { stallSpots } from '../../styles/indus/town.js';

/** The quay's apron: sheds along its back (west), net frames and washing on its front. */
export const SHEDS = [-98, -50, -8, 22].map((z) => [QUAY.x0 + 1.4, z - 6, QUAY.x0 + 8.4, z + 6]);
export const FISH = [[261, -68], [261, 2], [261, 54]];
export const WEIRS = [[286, -125], [288, 128], [284, -35]];

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];
const base = (id, elements, o = {}) => ({ id, style: 'indus', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-155, -72.5], facing: 'n' }, ...o });
/** A point of a lot in its frame (u along the lane, v into the lot). */
const P = (l, u, v) => { const [x0, z0, x1, z1] = l.rect; return l.front === 'w' ? [x0 + v, z0 + u] : l.front === 'e' ? [x1 - v, z0 + u] : l.front === 'n' ? [x0 + u, z0 + v] : [x0 + u, z1 - v]; };
const facing = (l) => ({ w: -Math.PI / 2, e: Math.PI / 2, n: Math.PI, s: 0 })[l.front] ?? 0;   // (a figure faces −z at rot 0; sin(rot) is its x)

function people() {
  const rand = rng(2500), L = [];
  let k0 = 0;
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', over: 'none', cloth: 'cloth_white', cloth2: 'cloth_white', skin: pick(rand, ['skin_medium', 'skin_dark', 'skin_medium']), hat: 'none', hair: pick(rand, ['bun', 'short']), hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const man = (at, rot, o = {}) => fig(at, rot, { over: pick(rand, ['shawl', 'shawl', 'none']), cloth: pick(rand, ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_red']), cloth2: 'cloth_red', beard: rand() < 0.5 ? 1 : 0, ...o });
  const woman = (at, rot, o = {}) => fig(at, rot, { top: '', over: 'shawl', hair: 'bun', cloth: pick(rand, ['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_white']), cloth2: 'cloth_ochre', beard: 0, ...o });
  // the Bath: attendants and bathers' watchers on the court's paving, a figure at the south doors
  const [cx0, cz0, cx1, cz1] = BATH.court, [px0, pz0, px1, pz1] = BATH.pool;
  for (const [x, z, r] of [[px0 - 2, (pz0 + pz1) / 2 - 2, Math.PI / 2], [px1 + 2.2, (pz0 + pz1) / 2 + 1, -Math.PI / 2], [(px0 + px1) / 2 + 1, pz0 - 1.6, 0], [px0 - 3.5, pz1 + 0.5, Math.PI]]) man([x, z], r, { y: PLAT, hair: 'shaven', beard: 0, cloth: 'cloth_white', over: 'shawl' });
  man([px1 + 4.5, pz0 + 3], -Math.PI / 2, { y: PLAT, pose: 'cross', cloth: 'cloth_white' });
  // bathers on the pool's steps (the water stands at the coping less 0.35 m; the steps rise 0.2 m each, 0.283 m deep), attendants on the benches of the court's west wall
  {
    const yb = PLAT - BATH.depth, stepY = (s) => yb + 0.2 * (Math.floor(s / 0.2833) + 1);
    // (the water stands 1.05 m below the coping: waist-deep on the third step from the bed, seated hip-deep on the fifth)
    for (const [s, x, south, sit] of [[0.7, px0 + 1.3, false, false], [0.7, px0 + 3.4, false, false], [1.25, px1 - 1.3, false, true], [0.7, px0 + 2.2, true, false], [0.7, px1 - 2.0, true, false], [1.25, px0 + 4.5, true, true]]) {
      const z = south ? pz1 - 3.4 + s : pz0 + 3.4 - s;
      man([x, z], south ? 0 : Math.PI, { y: stepY(s), dress: 'loincloth', over: 'none', cloth: 'cloth_white', hair: 'shaven', beard: 0, pose: sit ? 'sit' : 'stand' });
    }
    for (let k = 0; k < 4; k++) man([BATH.outer[0] + 1.2 + 0.3, cz0 + 3 + k * 4.5 + 0.0], Math.PI / 2, { y: PLAT + 0.45, pose: 'cross', cloth: 'cloth_white', hair: 'shaven', beard: 0 });
    for (const [x, z] of [[cx0 + 2, cz0 + 4], [cx1 - 2.5, cz1 - 3], [cx1 - 2, cz0 + 8]]) woman([x, z], rand() * 6.28, { y: PLAT, carry: 'pot', arms: 'head' });
  }
  // the priests at the College's court, the gate's keepers, the Pillared Hall's assembly
  for (let k = 0; k < 5; k++) man([COLLEGE[0] + 14 + k * 9, COLLEGE[1] + 13.5], 0, { y: PLAT, pose: k % 2 ? 'cross' : 'stand', cloth: 'cloth_white', hair: 'shaven', beard: 0 });
  for (const [x, z] of [[-157, COLLEGE[1] - 1], [-153, COLLEGE[1] - 1]]) man([x, z], Math.PI, { y: PLAT, pose: 'staff', carry: 'staff', len: 2.0 });
  for (let k = 0; k < 8; k++) man([PILLARED[0] + 4 + (k % 4) * 7, PILLARED[1] + 5 + Math.floor(k / 4) * 13], rand() * 6.28, { y: PLAT + 0.45, pose: k % 3 === 0 ? 'cross' : 'stand' });
  // the granary: porters with sacks at the ramp, a clerk at the tally
  for (let k = 0; k < 4; k++) man([GRANARY[0] + 24 + k * 0.5, GRANARY[3] + 3 + k * 2.2], Math.PI, { y: PLAT, arms: 'sack', carry: 'sack', cloth: 'cloth_ochre', beard: 0 });
  man([GRANARY[0] + 12, GRANARY[1] + 3.5], Math.PI, { y: PLAT + 1.78, pose: 'cross', cloth: 'cloth_white' });
  // the Citadel's streets: at each well a woman with her pot on the head and a man waiting his turn; elders and a woman seated on the pipal's brick seat; the water-stand's keeper
  for (const [wx, wz] of [[-124, -71], [-192, -80.5], [-72, -92], [-150, -18]]) {
    const f = (x, z) => Math.atan2(wx - x, -(wz - z));
    woman([wx + 1.9, wz + 0.9], f(wx + 1.9, wz + 0.9), { y: PLAT, carry: 'pot', arms: 'head' });
    man([wx - 1.8, wz - 1.6], f(wx - 1.8, wz - 1.6), { y: PLAT, pose: 'stand' });
  }
  for (const [px, pz, n] of [[-121, -97, 4], [-178, -80, 2]]) for (let k = 0; k < n; k++) { const a = 0.6 + k * (6.28 / n), x = px + Math.cos(a) * 1.9, z = pz + Math.sin(a) * 1.9; (k % 3 === 2 ? woman : man)([x, z], Math.atan2(px - x, -(pz - z)), { y: PLAT + 0.58, pose: 'cross', hair: k % 2 ? 'shaven' : 'bun', beard: k % 2 ? 0 : 1 }); }
  man([-188, -66.3], 0, { y: PLAT + 0.44, pose: 'sit', cloth: 'cloth_white' }); woman([-187.2, -68.4], Math.PI, { y: PLAT, carry: 'pot', arms: 'head' });
  for (const [x, z, r] of [[-176, -61, 0], [-146, -63.5, Math.PI], [-134, -61, Math.PI / 2]]) man([x, z], r, { y: PLAT, arms: 'sack', carry: 'sack', cloth: 'cloth_ochre', beard: 0 });
  // the market place: sellers on their mats, buyers, a water-carrier at the well
  for (const sp of stallSpots(PLAZA)) {
    const dx = sp.along ? 0 : sp.face, dz = sp.along ? sp.face : 0, r = Math.atan2(dx, -dz), kind = sp.goods;
    (kind === 'cloth' || kind === 'beads' ? man : (k0++ % 2 ? woman : man))([sp.x - dx * 0.25, sp.z - dz * 0.25], r, { y: 0.07, pose: 'cross', carry: 'none', cloth: 'cloth_white' });
    if (rand() < 0.6) (rand() < 0.5 ? woman : man)([sp.x + dx * 2.1 + (rand() - 0.5), sp.z + dz * 2.1 + (rand() - 0.5)], r + Math.PI + (rand() - 0.5) * 0.5, { pose: 'stand', carry: rand() < 0.4 ? 'pot' : 'none' });
  }
  for (let k = 0; k < 14; k++) {
    const a = rand() * 6.28, r = 7 + rand() * 12, x = WELL_BIG[0] + Math.cos(a) * r * 1.2, z = WELL_BIG[1] + Math.sin(a) * r;
    if (!inRect(PLAZA, x, z, -1)) continue;
    (k % 3 === 0 ? woman : man)([x, z], rand() * 6.28, { pose: rand() < 0.3 ? 'cross' : 'stand', carry: rand() < 0.3 ? 'pot' : 'none', arms: undefined });
  }
  woman([WELL_BIG[0] + 3.3, WELL_BIG[1] + 0.5], Math.PI / 2, { carry: 'pot', arms: 'head' });
  // the workshops: the master at his bench in the court, seated on the ground
  for (const l of lots()) if (!['house', 'small'].includes(l.kind)) { const p = P(l, l.rect[3] - l.rect[1] > 0 ? Math.min(l.front === 'w' || l.front === 'e' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0], 99) / 2 : 6, 6.0); man(p, facing(l) + Math.PI, { y: l.y, pose: 'cross', cloth: 'cloth_ochre', beard: 1 }); }
  // an apprentice at each workshop, the mistress of each furnished house at her hearth in the court
  for (const l of lots()) {
    if (!['house', 'small'].includes(l.kind)) { const p = P(l, 3.5, 6.0); man(p, facing(l) + Math.PI + 0.6, { y: l.y, pose: 'stand', hair: 'short', cloth: 'cloth_white', beard: 0 }); }
    else if (l.open && l.kind === 'house') { const p = P(l, (l.front === 'w' || l.front === 'e' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0]) * 0.45, 4.6); woman(p, rand() * 6.28, { y: l.y, pose: 'cross', carry: 'none' }); }
  }
  // the quay: washing and net-mending on the apron; fishermen and boatmen are set on the boats (life)
  for (const [x, z] of FISH) { woman([x + 3.6, z + 1.2], Math.PI / 2, { y: QUAY.top + 0.02, pose: 'squat', carry: 'none' }); woman([x + 3.6, z + 3.2], -Math.PI / 2, { y: QUAY.top + 0.02, pose: 'squat', carry: 'none' }); man([x + 5, z - 1.6], 0, { y: QUAY.top + 0.02, pose: 'cross', cloth: 'cloth_ochre', beard: 1 }); }
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
  // the crews: a fisherman poling each reed boat, a steersman sitting at the stern of each cargo barge, one more reed boat among the weirs
  for (const [z, d] of [[-70, 12], [-20, 14], [30, 10], [80, 13]]) { const x = riverX(z) - 6 + d * 0.3, rot = 0.1; L.push({ t: 'figure', at: [x - Math.sin(rot) * 2.5, z - Math.cos(rot) * 2.5], y: RIVER.level + rf + 0.28, rot, seed: z + 5, dress: 'loincloth', top: 'bare', over: 'none', cloth: 'cloth_white', skin: 'skin_dark', hair: 'short', feet: 'bare', carry: 'none', pose: 'punt', poleMat: 'timber' }); }
  for (const [z, len] of [[-92, 12], [-46, 10], [10, 12], [58, 11]]) { const x = riverX(z) - RIVER.hw + 3.8; L.push({ t: 'figure', at: [x, z + len * 0.36], y: RIVER.level + bf + 0.15, rot: 0, seed: z + 99, dress: 'loincloth', top: 'bare', over: 'none', cloth: 'cloth_ochre', skin: 'skin_medium', hair: 'short', feet: 'bare', carry: 'none', pose: 'sit' }); }
  for (const [x, z] of WEIRS) { L.push({ t: 'boat', kind: 'reed', len: 6.4, at: [x - 4, z + 7], y: RIVER.level + rf, rot: 1.2, seed: Math.round(z) }); L.push({ t: 'figure', at: [x - 4 - Math.sin(1.2) * 2.5, z + 7 - Math.cos(1.2) * 2.5], y: RIVER.level + rf + 0.28, rot: 1.2, seed: Math.round(z) + 3, dress: 'loincloth', top: 'bare', over: 'none', cloth: 'cloth_brown', skin: 'skin_dark', hair: 'bun', feet: 'bare', carry: 'none', pose: 'punt', poleMat: 'timber' }); }
  for (let k = 0; k < 14; k++) { const z = QUAY.z0 + 8 + rand() * (QUAY.z1 - QUAY.z0 - 16); if (QUAY.stairs.some((s) => Math.abs(s - z) < 6)) continue; L.push({ t: k % 3 ? 'sacks' : 'pot', kind: 'water_pot', n: 3, at: [QUAY.x1 - 2.6 - rand() * 3, z], y: QUAY.top + 0.02, rot: rand() * 6.28, seed: k * 7 + 1 }); }
  // at the house doors: jars, baskets, firewood, a hearth's pots
  for (const l of lots()) {
    if (rand() > 0.55) continue;
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
  { const ST = streets(); for (let i = 0; i < ST.length; i += 3) plans.push(base(`md-streetwork-${i / 3}`, [{ t: 'indus_streetwork', streets: ST.slice(i, i + 3), seed: 40 + i, avoid: [PLAZA, [QUAY.x0, QUAY.z0, QUAY.x1, QUAY.z1], CUSTOMS] }])); }
  // wells at the mouths of some lanes, in the street before them: the lanes' neighbours draw from them (one well to every three houses is the city's figure; the courts keep their own)
  {
    const W = [];
    lanes().filter((l) => l[3] - l[1] > l[2] - l[0] && l[3] - l[1] > 30 && !inRect(MOUND, (l[0] + l[2]) / 2, (l[1] + l[3]) / 2)).forEach((l, i) => {
      const x = (l[0] + l[2]) / 2, z = i % 2 ? l[1] - 2.9 : l[3] + 2.9;
      if (i % 4 !== 1 || Math.hypot(x, z) > RADIUS - 70 || inRect(PLAZA, x, z, 9) || x > QUAY.x0 - 12) return;
      W.push({ t: 'indus_pwell', c: [x, z], y: 0, seed: 100 + i });
    });
    for (let i = 0; i < W.length; i += 6) plans.push(base(`md-wells-${i / 6}`, W.slice(i, i + 6)));
  }
  plans.push(base('md-market', [{ t: 'indus_market', rect: PLAZA, well: WELL_BIG }, ...[[12, 12], [36, 12], [12, 36], [36, 36]].map(([a, b]) => ({ t: 'indus_shade', c: [PLAZA[0] + a, PLAZA[1] + b] }))], { rooms: [{ id: 'market place', rect: PLAZA, y: 0, kind: 'open', market: true }] }));
  // the river in strips of 30 m, each its own plan, so that each one's bounds stay inside the disc
  for (let x = QUAY.x1, k = 0; x < 439; x += 30, k++) plans.push(base('md-river-' + k, [{ t: 'indus_river', x0: x, x1: x + 30, level: RIVER.level }]));
  plans.push(base('md-landing', [...SHEDS.map((r, i) => ({ t: 'indus_shed', rect: r, front: 'e', seed: 20 + i })), ...FISH.map(([x, z], i) => ({ t: 'indus_fishery', x, z, seed: 30 + i })), ...WEIRS.map(([x, z], i) => ({ t: 'indus_weir', x, z, level: RIVER.level, seed: 50 + i }))]));
  plans.push(base('md-quay', [{ t: 'indus_quay', ...QUAY, bed: RIVER.bed, level: RIVER.level }, { t: 'indus_office', rect: CUSTOMS }]));
  // the wall on the south with its gate and towers
  {
    const E = [], g = WALL.gate;
    E.push({ t: 'indus_wall', a: [WALL.x0, WALL_Z], b: [WALL.x1, WALL_Z], th: WALL.th, h: WALL.h, gaps: [{ at: g - WALL.x0, w: 7 }] });
    for (const s of [-1, 1]) E.push({ t: 'indus_tower', c: [g + s * 6.6, WALL_Z], a: 3, y: 0, h: 8.5 });
    for (const x of [WALL.x0 + 14, WALL.x1 - 14, -40, 160]) E.push({ t: 'indus_tower', c: [x, WALL_Z], a: 2.6, y: 0, h: 7 });
    plans.push(base('md-wall', E));
  }
  for (let i = 0; i < LT.length; i += 60) plans.push(base(`md-houses-${i / 60}`, LT.slice(i, i + 60).map((l) => ({ t: 'indus_house', rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, open: l.open, y: l.y, street: l.street, ends: l.ends }))));
  plans.push({ ...base('md-life', life()), style: 'life' });
  plans.push({ ...base('md-people', people()), style: 'life' });
  return (CACHE = plans);
}
void STREET_W;
