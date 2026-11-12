// Round the pyramid (docs/settlements/giza.md §6): the cemeteries of mastabas west and east, the
// valley temple and the harbour with the king's ship, the boat pits, the Wall of the Crow and the
// workers' town south of it.

import { RADIUS, PYRAMID, VALLEY, TOWN_Y, VALLEY_TEMPLE, HARBOUR, CROW_WALL, BOAT_PITS, SHIP, SPHINX, KHAFRE_VT, KV_Y, KHAFRE_CW, QUARRY, ENCLOSURE, mastabas, slots, furnished, town as townLots } from './layout.js';
import { ground } from './ground.js';
import { RAMP, haulRoad } from './works.js';
import { CAMP_ITEMS, CHIPS, campLife } from './camps.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
/** The funerary priests at the chapels' doors, the offering bearers bringing bread and beer along the cemetery streets
 *  (docs/settlements/giza.md §4.4); the bakers at the hearths of the workers' town (§5). */
function people() {
  const rand = rng(2561), C = [], T = [];
  const fig = (L, at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hairMat: 'hair_dark', ...o });
  for (const m of mastabas()) {
    const dx = m.c[0] + m.a + 2.9, dz = m.c[1] + m.b - 2.6, r = rand();
    if (r < 0.22) fig(C, [dx + 0.9, dz + (rand() - 0.5) * 0.4], face([dx + 0.9, dz], [dx - 1, dz]), { dress: 'wrap', hair: 'shaven', over: 'sash', pose: 'stand' });
    else if (r < 0.4) {
      const z = m.c[1] + (rand() - 0.5) * m.b * 1.6, x = dx + 1.4 + rand() * 1.2, n = rand() < 0.5 ? -1 : 1, woman = rand() < 0.6;
      fig(C, [x, z], face([x, z], [x, z + n]), woman ? { dress: 'robe', hair: 'long', over: 'none', carry: 'basket' } : { dress: 'wrap', hair: 'short', over: 'none', carry: rand() < 0.5 ? 'basket' : 'pot' });
    }
  }
  for (const l of townLots()) if (l.kind === 'bakery') {
    const [x0, z0, x1, z1] = l.rect, mx = (x0 + x1) / 2;
    if (rand() < 0.7) { const at = [x0 + 1.2 + rand() * (x1 - x0 - 2.4), z1 - 2.3]; fig(T, at, face(at, [at[0], at[1] + 1]), { dress: 'tunic', hair: 'short', pose: 'squat' }); }
    // a brewer kneeling at a vat, working the mash (§5c)
    if (rand() < 0.6) { const vx = rand() < 0.5 ? mx + 0.9 : x1 - 0.25 - 0.8; fig(T, [vx, z0 + 0.25 + 1.95], 0, { dress: 'wrap', top: 'bare', hair: 'short', pose: 'kneel' }); }
  }
  // the women grinding grain at the querns in the courts of the furnished houses
  for (const l of townLots()) if (l.kind === 'house' && furnished(l) && rand() < 0.3) {
    const [x0, z0, x1, z1] = l.rect, r2 = rng(l.seed || 1); r2(); const court = r2() < 0.7, split = court ? x0 + (x1 - x0) * (0.45 + r2() * 0.2) : x1;
    const qz = Math.min(z1 - 1.6, z0 + 0.225 + 1.9), qx = split + 0.225 + 0.45;
    if (court && qz > z0 + 0.225 + 0.65 + 0.9) fig(T, [qx, qz - 0.75], Math.PI, { dress: 'sheath', hair: 'long', pose: 'kneel', h: 1.52 });
  }
  return { C, T };
}

/** The harbour (docs/settlements/giza.md §5c): stone barges at the quay, papyrus skiffs, a block on its sledge hauled off
 *  the landing by a gang on the rope with its overseer, porters; cattle brought in for the town, with their herder. */
function harbourLife() {
  const rand = rng(2562), L = [], W = -1.2;
  const man = (at, y, rot, o) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  for (const [x, z, kind, len] of [[354.5, 24, 'barge', 12], [354.5, 90, 'barge', 11], [376, 26, 'reed', 6], [388, 84, 'reed', 5.5], [382, 90, 'reed', 6]]) L.push({ t: 'boat', kind, len, at: [x, z], y: W, rot: kind === 'reed' ? 0.3 : 0, seed: Math.round(x * 3 + z) });
  // the gang hauling the block west off the landing, two by two on the rope, the overseer with his staff
  for (let k = 0; k < 4; k++) for (const dz of [-0.45, 0.45]) man([343.8 - k * 1.25, 52 + dz + (k % 2) * 0.1], 0, Math.PI / 2, { pose: 'pull', carry: 'rope', len: 1.4 });
  man([345, 54.6], 0, Math.PI * 0.7, { pose: 'staff', carry: 'staff', over: 'sash', len: 1.7 });
  man([348.2, 31.6], 0, Math.PI, { pose: 'talk' }); man([346.6, 40], 0.02, -0.2, { carry: 'basket' }); man([347.2, 63], 0.02, 3.0, { carry: 'pot' });
  // women washing linen at the quay's edge (kneeling, facing the water), a scribe tallying the jars, porters on the south quay, men mending a net
  const woman = (at, rot, o) => L.push({ t: 'figure', at, y: 0.02, rot, seed: Math.floor(rand() * 1e9), dress: 'sheath', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'long', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  for (const z of [21.5, 23.8, 36]) woman([350.3, z], -Math.PI / 2, { pose: 'kneel' });
  man([347.6, 79], 0.02, Math.PI / 2, { pose: 'kneel', over: 'sash' }); man([348.6, 90], 0.02, -1.2, { pose: 'staff', carry: 'staff', over: 'sash', len: 1.7 });
  man([348.4, 67], 0.02, 3.0, { carry: 'pot' }); man([349.4, 76], 0.02, 0.2, { carry: 'basket' }); man([349.4, 84.5], 0.02, 3.3, { carry: 'pot' });
  man([348.2, 30], 0.02, 0.1, { pose: 'squat' }); man([348.2, 36.5], 0.02, 3.2, { pose: 'squat' });
  return L;
}
function cattle() {
  const rand = rng(2563), L = [];
  for (let k = 0; k < 7; k++) { const x = 262 + rand() * 18, z = 196 + rand() * 16; L.push({ t: 'animal', kind: 'ox', at: [x, z], y: ground.height(x, z), rot: rand() * 6.28, seed: Math.floor(rand() * 1e9), mat: ['hide_white', 'hide_brown', 'hide_black', 'hide_tan'][k % 4] }); }
  L.push({ t: 'figure', at: [258, 206], y: ground.height(258, 206), rot: -Math.PI / 2, seed: 77, dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'staff', pose: 'staff', len: 1.6 });
  return L;
}

/** The quarry (docs/settlements/giza.md §11): blocks marked out on the benches, loose ones, heaps, a roughed-out giant on the floor, the sleeper road out. */
function quarryWorks() {
  const rand = rng(2564), blocks = [], toolAt = [], h = (x, z) => ground.height(x, z);
  const row = (z, x0, x1, kind) => { for (let x = x0; x < x1; x += 1.55) {
    const r = rand(), zz = z + (rand() - 0.5) * 0.3, y = h(x, zz);
    if (r < 0.1) continue;                                                      // a block already taken
    if (r < 0.16) { blocks.push({ kind: 'heap', x, y, z: zz, a: 0.7 + rand() * 0.5, h: 0.4 + rand() * 0.3 }); continue; }
    blocks.push({ kind: r < 0.22 ? 'loose' : 'cut', x, y, z: zz, a: 0.68, b: 0.52 + rand() * 0.06, h: 0.85 + rand() * 0.1 });
    if (r > 0.93) toolAt.push([x + 0.9, y, zz + 0.9, 'jar']);
  } };
  row(QUARRY[1] + 3.2, 52, 97, 'cut'); row(QUARRY[1] + 8.8, 54, 95, 'cut'); row(QUARRY[3] - 3.3, 52, 97, 'cut'); row(QUARRY[3] - 8.8, 54, 95, 'cut');
  for (const [x, z, a, b, hh] of [[78, 121, 2.5, 1.7, 2.6], [64, 124, 2.2, 1.5, 2.3], [93, 118, 2.1, 1.5, 2.2]]) blocks.push({ kind: 'rough', x, y: h(x, z), z, a, b, h: hh });
  for (let k = 0; k < 9; k++) { const x = 58 + rand() * 40, z = 117 + rand() * 11; if (!blocks.some((q) => q.kind === 'rough' && Math.abs(q.x - x) < 4 && Math.abs(q.z - z) < 3.4)) blocks.push({ kind: 'heap', x, y: h(x, z), z, a: 0.9 + rand() * 0.8, h: 0.5 + rand() * 0.5 }); }
  for (const [x, z] of [[70, 118.5], [86, 126], [97, 123], [60, 112.6]]) toolAt.push([x, h(x, z), z, 'mallet'], [x + 0.9, h(x + 0.9, z + 0.5), z + 0.5, 'pounder']);
  toolAt.push([83.6, h(83.6, 121.4), 121.4, 'lever']);
  const pts = []; for (let x = 100; x <= 133; x += 3.3) pts.push([x, h(x, 122) + 0.02, 122]);
  return { blocks, toolAt, pts, sledgeY: h(116, 122) };
}
function quarryLife(Q) {
  const rand = rng(2565), L = [], hh = (x, z) => ground.height(x, z);
  const man = (at, rot, o) => L.push({ t: 'figure', at, y: hh(at[0], at[1]), rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  // the gang on the rope, two by two, hauling the sledge up the road to the east, the overseer beside them
  for (let k = 0; k < 5; k++) for (const dz of [-0.45, 0.45]) { const x = 123.2 + k * 1.25; man([x, 122 + dz], -Math.PI / 2, { pose: 'pull', carry: 'rope', len: 1.4, y: hh(x, 122 + dz) }); }
  man([121.5, 124.4], -Math.PI / 2, { pose: 'staff', carry: 'staff', over: 'sash', len: 1.7 });
  // quarrymen kneeling at the marked blocks, the mallet and chisel in their hands; a water-carrier; a scribe counting
  for (const [x, z] of [[72, 119.8], [88, 125.6], [99, 121.4], [61, 112.4]]) man([x, z], rand() * 6.28, { pose: 'kneel' });
  man([68, 116.2], 0.5, { pose: 'talk', over: 'sash' }); man([90.6, 129.5], 3.6, { carry: 'pot', y: hh(90.6, 129.5) });
  return L;
}
/** Is the box (x, z, r) clear of every building of the town (walls with 0.45 m of thickness and the eaves)? */
function clearOf(lots, x, z, r) {
  for (const l of lots) { const [a, b, c, d] = l.rect; if (x > a - 0.9 - r && x < c + 0.9 + r && z > b - 0.9 - r && z < d + 0.9 + r) return false; }
  return true;
}
const KINDS_LANE = [['stand', 1], ['ash', 2], ['sherds', 2], ['bench', 1.5], ['pots', 1.5], ['wood', 1.5], ['basket', 1]];
function laneItems(lots) {
  const rand = rng(2566), items = [], pick = () => { let r = rand() * KINDS_LANE.reduce((q, k) => q + k[1], 0); for (const [k, w] of KINDS_LANE) { r -= w; if (r <= 0) return k; } return 'ash'; };
  const solid = lots.filter((l) => l.kind !== 'yard');
  // beside the houses: on one of their sides, where the lane is wide enough
  for (const l of lots) if (l.kind === 'house' && rand() < 0.7) {
    const [x0, z0, x1, z1] = l.rect, side = Math.floor(rand() * 4), t = 0.15 + rand() * 0.7, kind = pick();
    const off = kind === 'stand' ? 1.2 : 0.75, [x, z, rot] = side === 0 ? [x0 + (x1 - x0) * t, z0 - off, 0] : side === 1 ? [x1 + off, z0 + (z1 - z0) * t, Math.PI / 2] : side === 2 ? [x0 + (x1 - x0) * t, z1 + off, 0] : [x0 - off, z0 + (z1 - z0) * t, Math.PI / 2];
    const others = solid.filter((q) => q !== l);
    if (clearOf(others, x, z, kind === 'stand' ? 0.9 : 0.55) && Math.hypot(x, z) < RADIUS - 30) items.push([x, z, kind, rot, Math.floor(rand() * 1e6)]);
  }
  // the broad streets between the gallery blocks: along the blocks' east walls, in the open porch's lee; the stretch under the Wall of the Crow
  for (let b = 0; b < 4; b++) {
    const xe = -140 + b * 52 + 40.3 + 0.9;
    for (let z = 176; z < 224; z += 4.2 + rand() * 2.5) { const kind = pick(); if (kind !== 'wood') items.push([xe + (kind === 'stand' ? 0.4 : 0), z, kind, Math.PI / 2, Math.floor(rand() * 1e6)]); }
  }
  const wall = [];
  for (let x = CROW_WALL.a[0] + 6; x < CROW_WALL.b[0]; x += 5 + rand() * 4) wall.push([x, CROW_WALL.a[1] + CROW_WALL.th / 2 + 0.9, pick(), 0, Math.floor(rand() * 1e6)]);
  return { items, wall };
}
/** The tombs in the building, the work in the gaps between them, the masons' shades and tool caches. */
function cemeteryItems() {
  const rand = rng(2567), items = [], M = mastabas();
  for (const sl of slots()) items.push({ kind: 'unfinished', x: sl.c[0], z: sl.c[1], a: sl.a, b: sl.b, seed: Math.floor(rand() * 1e6) });
  for (const m of M) for (const s of [-1, 1]) {
    if (rand() > 0.55) continue;
    const z = m.c[1] + s * (m.b + 1.3);
    const next = M.find((q) => Math.abs(q.c[0] - m.c[0]) < 4 && s * (q.c[1] - m.c[1]) > 0 && s * (q.c[1] - m.c[1]) < 45);
    const gap = next ? Math.abs(next.c[1] - m.c[1]) - m.b - next.b : 99;
    if (gap < 8) continue;
    const kind = ['blocks', 'shade', 'cache', 'offering'][Math.floor(rand() * 4)];
    items.push({ kind, x: m.c[0] - m.a * 0.5 + rand() * m.a, z: z + (kind === 'shade' ? s * 1.0 : 0), rot: 0, seed: Math.floor(rand() * 1e6) });
  }
  return items;
}
function extras(lots) {
  const E = [];
  const LI = laneItems(lots);
  E.push(base('giza-lane', [{ t: 'ok_lane', items: LI.items }], TOWN_Y), base('giza-lane-wall', [{ t: 'ok_lane', items: LI.wall }], ground.height(0, CROW_WALL.a[1] + CROW_WALL.th / 2 + 0.9)));
  E.push(base('giza-cemetery-dress', [{ t: 'ok_cemetery', items: cemeteryItems() }]));
  // the storerooms along the court's inner wall, north and south of the pyramid (doors to the court)
  const [ex0, ez0, ex1, ez1] = ENCLOSURE;
  E.push(base('giza-magazines', [
    { t: 'ok_magazines', rect: [ex0 + 17, ez0 + 2.5, -30, ez0 + 7.5], n: 13, side: 's', seed: 1 }, { t: 'ok_magazines', rect: [30, ez0 + 2.5, ex1 - 17, ez0 + 7.5], n: 13, side: 's', seed: 2 },
    { t: 'ok_magazines', rect: [ex0 + 17, ez1 - 7.5, -30, ez1 - 2.5], n: 13, side: 'n', seed: 3 }, { t: 'ok_magazines', rect: [30, ez1 - 7.5, ex1 - 17, ez1 - 2.5], n: 13, side: 'n', seed: 4 },
  ]));
  E.push(base('giza-quay', [{ t: 'ok_quay', rect: [HARBOUR[0] + 1.2, 19, HARBOUR[0] + 5, 45], y: 0.02, seed: 3 }, { t: 'ok_quay', rect: [HARBOUR[0] + 1.2, 60, HARBOUR[0] + 5, 95], y: 0.02, seed: 4 }], VALLEY));
  // life in the yards: beasts in the pens, a man at the brick pit, the herdsman at the threshing floor
  const rand = rng(2568), L = [];
  const man = (at, rot, o) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  for (const l of lots) if (l.kind === 'yard') {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (l.yk === 'pen') for (let k = 0, n = 2 + Math.floor(rand() * 4); k < n; k++) L.push({ t: 'animal', kind: ['goat', 'goat', 'sheep', 'donkey'][Math.floor(rand() * 4)], at: [x0 + 1.5 + rand() * (x1 - x0 - 3), z0 + 1.4 + rand() * (z1 - z0 - 3)], y: 0, rot: rand() * 6.28, seed: Math.floor(rand() * 1e9) });
    else if (l.yk === 'brickyard') { man([x0 + 2.2, z0 + 2.6], Math.PI, { pose: 'kneel' }); if (rand() < 0.6) man([x1 - 2, z0 + 1.4], 0.6, { pose: 'squat' }); }
    else if (l.yk === 'threshing') { if (rand() < 0.7) man([cx + 1.5, cz], rand() * 6, { pose: 'kneel' }); if (rand() < 0.5) L.push({ t: 'animal', kind: 'ox', at: [cx - 1.6, cz + 1.2], y: 0, rot: rand() * 6, seed: Math.floor(rand() * 1e9), mat: 'hide_brown' }); }
    else if (l.yk === 'silo' && rand() < 0.6) man([cx, (z0 + z1) / 2 + 1.5], rand() * 6, { carry: 'basket' });
  }
  // the masons at the tombs in the building: on the ramp, at the blocks
  const M = [], man0 = (at, rot, o) => M.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  for (const sl of slots()) { const [x, z] = sl.c; man0([x, z + sl.b + 2.5], Math.PI, { pose: 'pull', carry: 'rope', len: 1.4 }); man0([x + 1.0, z + sl.b + 2.8], 3.4, { pose: 'staff', carry: 'staff', over: 'sash', len: 1.7 }); man0([x + sl.a + 2.4, z + 2], 1.0, { pose: 'kneel' }); }
  E.push({ ...base('giza-yard-life', L, TOWN_Y), style: 'life' }, { ...base('giza-mason-life', M), style: 'life' });
  return E;
}
/** The works at the plateau's edge in the arrival's view (docs/settlements/giza.md §13): the casing stones hauled up the rubble ramp on their sledges (the ramp half taken down),
 *  masons dressing and setting the last of the Tura stone, the sleeper road, a procession of priests and bearers going in to the mortuary temple, donkeys with their loads. */
function worksLife() {
  const rand = rng(2570), L = [], hr = RAMP.heightAt;
  const man = (at, rot, o) => L.push({ t: 'figure', at, y: o?.y ?? 0, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const woman = (at, rot, o) => L.push({ t: 'figure', at, y: o?.y ?? 0, rot, seed: Math.floor(rand() * 1e9), dress: 'sheath', cloth: 'cloth_white', skin: 'skin_medium', hat: 'none', hair: 'long', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const W = -Math.PI / 2 * -1, E = -Math.PI / 2;           // facing west (rot π/2), east (rot −π/2)
  const rz = RAMP.z;
  // the gang on the ramp, two by two on the rope, the sledge behind them with its block; the overseer with his staff; a boy pouring water on the sand before the runners
  for (let k = 0; k < 5; k++) for (const dz of [-0.45, 0.45]) { const x = RAMP.sledge - 6.2 - k * 1.25; man([x, rz + dz + (k % 2) * 0.1], W, { pose: 'pull', carry: 'rope', len: 1.4, y: hr(x) }); }
  man([RAMP.sledge - 3.2, rz + 2.0], Math.PI * 0.8, { pose: 'staff', carry: 'staff', over: 'sash', len: 1.7, y: hr(RAMP.sledge - 3.2) });
  man([RAMP.sledge - 4.4, rz - 1.8], W, { carry: 'pot', y: hr(RAMP.sledge - 4.4), child: true, dress: 'loincloth' });
  // bearers of rubble and water going up and down the ramp's sides
  for (const [x, dz, r, c] of [[RAMP.x1 - 4, -2.6, W, 'basket'], [RAMP.x1 - 8, 2.5, E, 'basket'], [RAMP.sledge + 5, -2.7, W, 'pot'], [RAMP.sledge + 9, 2.6, E, 'basket']]) man([x, rz + dz], r, { carry: c, y: hr(x) });
  // masons dressing the casing stones at the stacks: kneeling, the mallet and chisel; a scribe tallying under the shade; a lever-man
  for (const [x, z, r] of [[214, -74.4, 0.2], [218.6, -76.2, 3.3], [201.6, -75.4, 0.4], [207.2, -75.0, 3.4], [210.6, -54.4, 0.2], [216.4, -54.8, 3.0]]) man([x, z], r, { pose: 'kneel' });
  man([211.4, -56.1], 1.0, { pose: 'squat' }); man([196.4, -74.6], 2.6, { pose: 'squat' });
  man([207.0, -85.2], 0.2, { pose: 'sit', over: 'sash' }); man([208.6, -84.6], 3.5, { pose: 'talk', over: 'sash', carry: 'staff', len: 1.7 });
  man([224.0, -55.4], W, { carry: 'pot' }); woman([220.6, -56.8], E, { carry: 'pot' });
  // the procession along the plateau to the doorway of the causeway's north wall: priests with staffs and censers, bearers with bread, beer and linen
  const line = (k) => [233 - k * 2.5, -46.4 + Math.sin(k * 1.3) * 0.5];
  [['priest', 'staff'], ['priest', 'pot'], ['woman', 'pot'], ['man', 'basket'], ['woman', 'basket'], ['man', 'sack'], ['priest', 'staff'], ['woman', 'pot'], ['man', 'basket'], ['priest', 'pot']].forEach(([kind, carry], k) => {
    const at = line(k), o = carry === 'staff' ? { pose: 'staff', carry, len: 1.7 } : { carry };
    if (kind === 'priest') man(at, W, { ...o, over: 'sash', hair: 'shaven' }); else if (kind === 'woman') woman(at, W, o); else man(at, W, o);
  });
  // donkeys with their panniers of rubble and sand, led by a boy
  for (let k = 0; k < 3; k++) L.push({ t: 'animal', kind: 'donkey', at: [206 + k * 2.7, -53.5 - (k % 2) * 0.6], y: 0, rot: Math.PI / 2 + (rand() - 0.5) * 0.2, seed: Math.floor(rand() * 1e9) });
  man([202.4, -53.2], W, { carry: 'staff', pose: 'staff', len: 1.4, child: true, dress: 'loincloth' });
  return L;
}
function worksPlan() {
  const [x0, x1, z, w, h] = [RAMP.x0, RAMP.x1, RAMP.z, RAMP.w, RAMP.h], sy = RAMP.heightAt(RAMP.sledge) + 0.06;
  const stacks = [[214, -77, 0.2, 2], [217.8, -78.4, -0.1, 3], [209.6, -78.6, 0.4, 1], [205.6, -77.4, 0.1, 2], [200.6, -78, 0.0, 3], [195.4, -76.6, 0.3, 2], [214.6, -55, 0.3, 2], [210.2, -55.8, 0, 1], [205, -55.4, 0.5, 3], [219.4, -57.6, 0.1, 1]];
  const tools = []; for (const [x, zz] of [[214, -74.4], [218.6, -76.2], [201.6, -75.4], [207.2, -75], [210.6, -54.4], [216.4, -54.8]]) tools.push([x + 0.8, 0, zz + 0.5, 'mallet'], [x - 0.7, 0, zz - 0.4, 'pounder'], [x + 0.3, 0, zz + 1.1, 'jar']);
  tools.push([198.6, 0, -75.2, 'lever']);
  return base('giza-works', [
    { t: 'ok_ramp', x0, x1, z, w, h, y: 0 },
    { t: 'ok_track', pts: haulRoad(), w: 3.4 },
    { t: 'stone_sledge', at: [RAMP.sledge, RAMP.z], y: sy, rot: Math.PI, w: 1.15, len: 1.7 },
    { t: 'ok_casing', at: stacks },
    { t: 'ok_tools', at: tools },
    { t: 'ok_shade', rect: [204.4, -88, 210.6, -83.2], h: 2.3 },
    // the gangs' and masons' belongings about the stacks and the road: water jars, bread baskets, sherds, a bench in the shade, the firewood for the noon meal
    { t: 'ok_lane', items: [[203.6, -86.2, 'bench', 0, 11], [212.4, -72.6, 'pots', 0.3, 12], [199.2, -72.4, 'basket', 0, 13], [219.8, -73.6, 'pots', 0, 14], [208.6, -57.6, 'pots', 0, 15], [213, -52.4, 'basket', 0.4, 16], [203.4, -51.4, 'sherds', 0, 17],
      [218.2, -52.8, 'ash', 0, 18], [221.6, -55.2, 'wood', 0, 19], [194.6, -55.6, 'pots', 0, 20], [190.4, -73.4, 'basket', 0, 21], [228.4, -68.6, 'pots', 0, 22], [224.6, -58.8, 'sherds', 0, 23], [200.4, -82.4, 'wood', 0, 24]] },
  ]);
}

const base = (id, elements, y = 0) => ({ id, style: 'oldkingdom', origin: [0, 0], base: y, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [200, -40], facing: 'w' } });

export async function town() {
  const plans = [];
  // the Great Pyramid's passages and chambers, open for the burial (docs/settlements/giza.md §4.6)
  plans.push(base('giza-pyramid-interior', [{ t: 'ok_pyramid_interior', c: PYRAMID.c, a: PYRAMID.a, h: PYRAMID.h }]));
  plans.push(base('giza-cemeteries', mastabas().map((m) => ({ t: 'mastaba', ...m }))));
  const P = people();
  plans.push({ ...base('giza-people', P.C), style: 'life' }, { ...base('giza-bakers', P.T, TOWN_Y), style: 'life' });
  plans.push(base('giza-valley', [
    { t: 'ok_temple', rect: VALLEY_TEMPLE.map((v, i) => v), h: 8, court: [318, 40, 340, 64], pillars: 5, door: 'e', backDoor: true },
    { t: 'water_rect', rect: [HARBOUR[0] - 1, HARBOUR[1] - 1, HARBOUR[2], HARBOUR[3] + 1], y: -1.2 },
    { t: 'block', walk: true, rect: [HARBOUR[0] - 2, 46, HARBOUR[0] + 10, 58], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    // the quay along the temple's front, from the valley floor on either side to the landing
    { t: 'block', walk: true, rect: [HARBOUR[0] - 1, HARBOUR[1] - 1, HARBOUR[0] + 5, 46], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    { t: 'block', walk: true, rect: [HARBOUR[0] - 1, 58, HARBOUR[0] + 5, HARBOUR[3] + 1], y0: -2.6, y1: 0.02, mat: 'tura_limestone' },
    { t: 'royal_ship', at: SHIP.at, y: -1.2, len: SHIP.len, ang: SHIP.ang },
  ], VALLEY));
  plans.push({ ...base('giza-harbour-life', harbourLife(), VALLEY), style: 'life' }, { ...base('giza-cattle', cattle()), style: 'life' });
  plans.push(base('giza-hauling', [{ t: 'stone_sledge', at: [350, 52], y: 0.02, rot: Math.PI, w: 1.15, len: 1.7 }, { t: 'stone_sledge', at: [349.5, 30], y: 0.02, rot: Math.PI / 2, w: 1.0, len: 1.5 }], VALLEY));
  // c. 2500 BC: the Sphinx in its pit, Khafre's valley temple on the valley floor with his causeway going up to the plateau
  plans.push(base('giza-sphinx', [{ t: 'ok_sphinx', x0: SPHINX.x0, z: SPHINX.z, floor: SPHINX.floor, len: SPHINX.len }]));
  plans.push(base('giza-khafre-temple', [{ t: 'ok_khafre_temple', rect: KHAFRE_VT, y: KV_Y }]));
  {
    const [ax, az] = KHAFRE_CW.a, [d0, d1] = KHAFRE_CW.down, [bx, bz] = KHAFRE_CW.b, w = 4.6;
    plans.push(base('giza-khafre-causeway', [
      { t: 'causeway', a: [ax, az], b: [d0, az], w, h: 5, ya: 0, yb: 0 },
      { t: 'causeway', a: [d0, az], b: [d1, az], w, h: 5, ya: 0, yb: KV_Y },
      { t: 'causeway', a: [d1, az], b: [bx, bz], w, h: 5, ya: KV_Y, yb: KV_Y },
    ]));
  }
  plans.push(worksPlan(), { ...base('giza-works-life', worksLife()), style: 'life' });
  plans.push(base('giza-camps', [{ t: 'ok_camp', items: CAMP_ITEMS }, { t: 'ok_chips', at: CHIPS }]), { ...base('giza-camp-life', campLife()), style: 'life' });
  const Q = quarryWorks();
  plans.push(base('giza-quarry', [{ t: 'ok_quarry', blocks: Q.blocks }, { t: 'ok_track', pts: Q.pts, w: 3.6 }, { t: 'ok_tools', at: Q.toolAt }, { t: 'stone_sledge', at: [116, 122], y: Q.sledgeY + 0.1, rot: 0, w: 1.15, len: 1.7 }]));
  plans.push({ ...base('giza-quarry-life', quarryLife(Q)), style: 'life' });
  plans.push(base('giza-boat-pits', BOAT_PITS.map((p) => ({ t: 'boat_pit', ...p }))));
  plans.push(base('giza-wall', [{ t: 'crow_wall', ...CROW_WALL }], -2.5));
  const lots = townLots();
  for (let i = 0; i < lots.length; i += 80) plans.push(base(`giza-town-${i / 80}`, lots.slice(i, i + 80).map((l) => (l.kind === 'gallery' ? { t: 'gallery_hall', rect: l.rect } : l.kind === 'bakery' ? { t: 'bakery', rect: l.rect, seed: l.seed } : l.kind === 'yard' ? { t: 'ok_yard', rect: l.rect, kind: l.yk, seed: l.seed } : { t: 'mud_house', rect: l.rect, seed: l.seed, furnish: furnished(l) })), TOWN_Y));
  plans.push(...extras(lots));
  return plans;
}
