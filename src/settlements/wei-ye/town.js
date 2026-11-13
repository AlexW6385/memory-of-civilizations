// Round the terraces (docs/settlements/wei-ye.md §2, §6–§7): the palace's walls, gate, corridors and halls; the offices of the court along the avenue;
// the walled wards with their houses, the Qili ward; the market with its tower and shop rows; the city wall with its gates; the Xuanwu pond; the Zhang River;
// the people — the court in the Wenchang Hall, the poets on the terrace, the guards, the merchants.
import { forecourtElements, forecourtLife } from './forecourt.js';
import { streetElements, marketElements, wallElements, compoundElements, riverElements, farmElements, lifeElements } from './dressing.js';
import { RADIUS, PALACE, PALACE_WALL, WENCHANG, W_TERRACE, MARKET, MARKET_WALL, WARDS, WARD_WALL, POND, POND_Y, CITY_WALL, WALL, GATES_S, GATES_N, GATE_W, AVENUE_Z, TOWER, SPARROW, ICE, TIGER,
  cityWalls, lots, riverZ, RIVER, stairRect, zOf, LODGES } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, o = {}) => ({ id, style: 'wei', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 5], facing: 'n' }, ...o });
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

function walledRect(rect, th, h, mat, gates) {
  const [x0, z0, x1, z1] = rect, E = [];
  const gaps = (side) => gates.filter((g) => g.side === side).map((g) => ({ at: g.c - ((side === 'n' || side === 's') ? x0 : z0), w: g.w }));
  E.push({ t: 'han_wall', a: [x0, z0], b: [x1, z0], th, h, mat, gaps: gaps('n') }, { t: 'han_wall', a: [x0, z1], b: [x1, z1], th, h, mat, gaps: gaps('s') },
    { t: 'han_wall', a: [x0, z0], b: [x0, z1], th, h, mat, gaps: gaps('w') }, { t: 'han_wall', a: [x1, z0], b: [x1, z1], th, h, mat, gaps: gaps('e') });
  for (const g of gates) {
    const ax = g.side === 'n' || g.side === 's';
    const c = g.side === 'n' ? [g.c, z0] : g.side === 's' ? [g.c, z1] : g.side === 'w' ? [x0, g.c] : [x1, g.c];
    E.push({ t: 'han_gate', c, axis: ax ? 'x' : 'z', th, h, n: 1, pw: g.w - 6, ph: Math.min(5, h - 2.5), mat });
  }
  return E;
}

/** The people: the king and his court in the Wenchang Hall, the poets in the Sparrow's tower and on its dais, the guards at the stairs and gates, merchants at the market. */
function people() {
  const rand = rng(215), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', top: '', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', hair: 'topknot', hairMat: 'hair_dark', feet: 'shod', carry: 'none', pose: 'stand', ...o });
  const dz = WENCHANG.z0, f = WENCHANG.floor, W = WENCHANG;
  fig([W.cx, dz + 2.6], Math.PI, { y: f + 1.64, pose: 'seiza', cloth: 'cloth_black', cloth2: 'cloth_red', hat: 'cap', over: 'sash', beard: 1 });
  for (const s of [-1, 1]) fig([W.cx + s * 3.6, dz + 4.4], Math.PI, { y: f + 1.2, cloth: 'cloth_red', hat: 'cap', over: 'sash', pose: 'staff', carry: 'staff', len: 2.0 });
  const aisle = W.bayW * 1.6, x0 = W.cx - W.w / 2, cols = [];
  for (let i = 0; i <= W.bays; i++) for (let j = 0; j <= W.depth; j++) {
    const inner = j > 0 && j < W.depth && i > 0 && i < W.bays && (j === 1 || j === W.depth - 1) && Math.abs(i - W.bays / 2) >= Math.max(2, W.bays / 4);
    if (inner) cols.push([x0 + i * W.bayW, dz + j * W.depthW]);
  }
  for (const s of [-1, 1]) for (const z of [dz + 9.5, dz + 13.5]) for (let k = 0; k < 5; k++) {
    const x = W.cx + s * (aisle + 1.2 + k * 3.4);
    if (cols.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 1.9) || Math.abs(x - W.cx) > W.w / 2 - 3 || rand() < 0.15) continue;
    fig([x, z + 0.3], 0, { y: f + 0.05, pose: 'seiza', cloth: pick(rand, ['cloth_blue', 'cloth_indigo', 'cloth_brown', 'cloth_green', 'cloth_red']), cloth2: 'cloth_white', hat: 'cap', over: 'sash', beard: rand() < 0.5 ? 1 : 0 });
  }
  // the poets of the loft above it (the second storey), at their mats and the zither
  for (let k = 0; k < 3; k++) for (const s of [0, 1]) if (rand() < 0.8) fig([TOWER.c[0] - 5.0 + k * 3.0, TOWER.c[1] + 0.6 + s * 3.4 + 0.3], 0, { y: TOWER.floor + 4.9 + 0.05, pose: 'seiza', cloth: pick(rand, ['cloth_white', 'cloth_blue', 'cloth_grey', 'cloth_indigo']), cloth2: 'cloth_white', hat: 'cap', over: 'sash', beard: rand() < 0.4 ? 1 : 0 });
  // the garden: scholars at the pond looking at the ships, the musicians at the pavilion, attendants at the stair's foot
  for (const [x, z, r0] of [[-128, -132, 2.6], [-124, -131.5, 2.8], [-100, -132.6, 3.3], [-93, -132.2, 3.5], [-104, -92, 1.5], [-102, -84, -1.5]]) fig([x, z], r0, { cloth: pick(rand, ['cloth_white', 'cloth_blue', 'cloth_indigo']), hat: 'cap', over: 'sash', pose: 'stand' });
  for (let k = 0; k < 3; k++) fig([POND[2] + 5.0 + k * 1.1, POND[1] + 8.6], Math.PI, { y: 0, pose: 'seiza', cloth: pick(rand, ['cloth_red', 'cloth_blue', 'cloth_white']), cloth2: 'cloth_white', hat: 'cap', over: 'sash' });
  // the poets at their mats in the Sparrow's ground storey (the same places as src/styles/wei/terrace.js), and standing on the dais
  const [tx, tz] = TOWER.c, tf = TOWER.floor;
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) if (rand() < 0.8) fig([tx - 3.6 + k * 3.6, tz + s * 4.6 + 0.3], 0, { y: tf + 0.05, pose: 'seiza', cloth: pick(rand, ['cloth_white', 'cloth_blue', 'cloth_grey', 'cloth_indigo']), cloth2: 'cloth_white', hat: 'cap', over: 'sash', beard: rand() < 0.4 ? 1 : 0 });
  const [d0, d1, d2, d3] = SPARROW.dais;
  for (let k = 0; k < 7; k++) { const x = d0 + 4 + rand() * (d2 - d0 - 8), z = d1 + 4 + rand() * (d3 - d1 - 8); if (Math.abs(x - tx) < 10 && Math.abs(z - tz) < 10) continue; fig([x, z], rand() * 6.28, { y: SPARROW.daisTop, cloth: pick(rand, ['cloth_white', 'cloth_blue', 'cloth_black']), hat: 'cap', over: 'sash', pose: k % 2 ? 'staff' : 'stand', carry: k % 2 ? 'staff' : 'none', len: 1.8 }); }
  // the guards: at the foot and the head of each terrace's stair, at the palace's gate and the city gates
  const guards = [];
  for (const t of [ICE, SPARROW, TIGER]) { const r = stairRect(t), zc = zOf(t); guards.push([r[2] + 0.5, zc - 5.5, Math.PI / 2, 0], [r[2] + 0.5, zc + 5.5, Math.PI / 2, 0], [r[0] + 2, zc - 5.2, Math.PI / 2, t.top], [r[0] + 2, zc + 5.2, Math.PI / 2, t.top]); }
  guards.push([-5, PALACE[3] + 2, 0, 0], [5, PALACE[3] + 2, 0, 0], [-5, W_TERRACE.r[3] + 6, Math.PI, 0], [5, W_TERRACE.r[3] + 6, Math.PI, 0]);
  for (const x of GATES_S) guards.push([x - 11, WALL.s - 9, 0, 0], [x + 11, WALL.s - 9, 0, 0]);
  guards.push([WALL.e - 9, AVENUE_Z - 11, Math.PI / 2, 0], [WALL.e - 9, AVENUE_Z + 11, Math.PI / 2, 0], [WALL.w + 9, AVENUE_Z - 11, -Math.PI / 2, 0], [WALL.w + 9, AVENUE_Z + 11, -Math.PI / 2, 0]);
  for (const [x, z, r, y] of guards) fig([x, z], r, { y, dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_black', hat: 'cap', over: 'belt', pose: 'staff', carry: 'staff', len: 2.2 });
  // the market: sellers by the tower, officials of the market
  const cx = (MARKET[0] + MARKET[2]) / 2, cz = (MARKET[1] + MARKET[3]) / 2;
  for (const s of [-1, 1]) fig([cx + s * 8, cz + 8], 0, { y: 2.6, cloth: 'cloth_blue', hat: 'cap', over: 'sash', pose: 'staff', carry: 'staff', len: 1.7 });
  return L;
}

/** The people in the garden's lodgings: each stands in the middle of its room, facing the door (the hall of a court is at the back of its lot, of a row at the front). */
function lodgeLife() {
  const rand = rng(216), L = [], pick = (a) => a[Math.floor(rand() * a.length) % a.length];
  for (const l of LODGES) {
    const [x0, z0, x1, z1] = l.rect, W = x1 - x0, D = z1 - z0, s = l.front === 's';
    const hallV = l.kind === 'row' ? [1.4, 7.8] : l.kind === 'tower' ? [D - 7.0, D - 0.9] : [D - 7.8, D - 0.9];
    const at = (u, v) => [x0 + u, s ? z1 - v : z0 + v], rot = s ? Math.PI : 0;
    const vm = hallV[0] + 4.7, n = l.room === 'barracks' || l.room === 'music' ? 3 : 2;
    for (let k = 0; k < n; k++) {
      const guard = l.room === 'barracks', sing = l.room === 'music';
      L.push({ t: 'figure', at: at(W / 2 - 1.6 + k * 1.7 + (rand() - 0.5) * 0.3, vm - (k % 2) * 0.4), y: 0.33, rot: rot + (rand() - 0.5) * 0.8, seed: Math.floor(rand() * 1e9), dress: 'robe', top: '', skin: 'skin_light', hair: 'topknot', hairMat: 'hair_dark', feet: 'shod', carry: guard ? 'staff' : 'none', len: 2.2,
        cloth: guard ? 'cloth_grey' : sing ? pick(['cloth_red', 'cloth_blue', 'cloth_white']) : pick(['cloth_brown', 'cloth_grey', 'cloth_indigo', 'cloth_ochre']), cloth2: guard ? 'cloth_black' : 'cloth_white', hat: guard ? 'cap' : 'none', over: guard ? 'belt' : 'sash', pose: guard ? 'staff' : sing && k === 0 ? 'seiza' : rand() < 0.4 ? 'talk' : 'stand', ...(l.room === 'kitchen' || l.room === 'loom' ? { h: 1.52 } : {}) });
    }
  }
  return L;
}

function marketRows(rect, seedBase) {
  const [x0, z0, x1, z1] = rect, th = MARKET_WALL.th, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, lane = 8, E = [];
  const quads = [[x0 + th + 3, z0 + th + 3, cx - lane, cz - lane], [cx + lane, z0 + th + 3, x1 - th - 3, cz - lane], [x0 + th + 3, cz + lane, cx - lane, z1 - th - 3], [cx + lane, cz + lane, x1 - th - 3, z1 - th - 3]];
  let seed = seedBase;
  for (const [qx0, qz0, qx1, qz1] of quads) {
    const nShops = Math.max(2, Math.floor((qx1 - qx0) / 5.2));
    for (let zz = qz0; zz + 12 <= qz1 + 0.01; zz += 16) E.push({ t: 'wei_shop_row', rect: [qx0, zz, qx0 + nShops * 5.2, zz + 6], front: 'n', n: nShops, seed: seed++ }, { t: 'wei_shop_row', rect: [qx0, zz + 6, qx0 + nShops * 5.2, zz + 12], front: 's', n: nShops, seed: seed++ });
  }
  return E;
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  const plans = [];
  // ── the palace: walls, the south gate, the corridors of the forecourt, the halls behind the Wenchang ──
  {
    const E = walledRect(PALACE, PALACE_WALL.th, PALACE_WALL.h, 'lime_plaster', [{ side: 's', c: 0, w: 14 }, { side: 'n', c: 0, w: 14 }]);
    for (const s of [-1, 1]) E.push({ t: 'han_corridor', a: [s * 40, -36], b: [s * 40, -12], w: 3.4, h: 3.6, wall: s });
    E.push({ t: 'han_hall', cx: 0, z1: -128, bays: 7, bayW: 6.6, depth: 2, depthW: 6.5, floor: 0.9, base: 0.9, h: 5.8, roof: 'hip', rise: 4.6, overhang: 2.8, ap: 1.8, furnish: 'court', open: [3, 3], seed: 31 });
    for (const [cx, sd] of [[-56, 41], [56, 43]]) E.push({ t: 'han_hall', cx, z1: -112, bays: 4, bayW: 5.2, depth: 2, depthW: 5, floor: 0.9, base: 0.9, h: 5.0, roof: 'gable', rise: 3.4, overhang: 2.2, ap: 1.4, furnish: 'office', open: [1, 2], seed: sd });
    E.push({ t: 'floor', rect: [-6, -37.5, 6, PALACE[3] - 1.5], y: 0.03, mat: 'bluestone', th: 0.3 }, { t: 'floor', rect: [-30, -50, 30, -37.5], y: 0.02, mat: 'brick_paving', th: 0.3 });
    // the que before the gate, the banners, braziers and bronze of the forecourt, the court's drum and bells, the guards' racks
    for (const sg of [-1, 1]) E.push({ t: 'han_que', at: [sg * 16.5, 3], sub: [sg, 0], h: 11, seed: 3 });
    for (const sg of [-1, 1]) {
      for (const z of [-14, -22, -30]) E.push({ t: 'wei_prop', kind: 'brazier', at: [sg * 7.8, z] });
      for (const x of [14, 24, 34]) E.push({ t: 'wei_prop', kind: 'flag', at: [sg * x, -44.5], yaw: sg > 0 ? 0 : Math.PI, h: 7.4, cloth: x === 24 ? 'cloth_black' : 'cloth_red', long: x === 14 });
      E.push({ t: 'wei_prop', kind: 'ding', at: [sg * 9, -45], s: 1.3 });
      E.push({ t: 'wei_prop', kind: 'rack', at: [sg * 13, -12.5], n: 8 });
      E.push({ t: 'wei_prop', kind: 'jars', at: [sg * 33, -15], seed: 5 + sg, n: 5 });
      E.push({ t: 'wei_prop', kind: 'board', at: [sg * 22, -11.5], yaw: Math.PI });
      E.push({ t: 'wei_prop', kind: 'bench', at: [sg * 30, -33.5], yaw: 0, len: 3 });
    }
    E.push({ t: 'wei_prop', kind: 'drum', at: [-24, -20], yaw: 0 }, { t: 'wei_prop', kind: 'bells', at: [24, -20], yaw: 0, n: 7 });
    // the inner palace behind the Wenchang: the residences of the court's households, and the guards' halls beside the terrace
    for (const [cx, sd] of [[-62, 51], [-34, 52], [34, 53], [62, 54]]) E.push({ t: 'han_hall', cx, z1: -150, bays: 3, bayW: 4.6, depth: 2, depthW: 5, floor: 0.7, base: 0.7, h: 4.6, roof: 'gable', rise: 2.8, overhang: 2.0, ap: 1.4, furnish: 'office', open: [1, 1], seed: sd });
    for (const [cx, sd] of [[-64, 55], [64, 56]]) E.push({ t: 'han_hall', cx, z1: -62, bays: 3, bayW: 4.4, depth: 2, depthW: 4.8, floor: 0.6, base: 0.6, h: 4.2, roof: 'gable', rise: 2.4, overhang: 2.0, ap: 1.2, furnish: 'office', open: [1, 1], seed: sd });
    for (const sg of [-1, 1]) {
      E.push({ t: 'han_corridor', a: [sg * 64, -73], b: [sg * 64, -102], w: 3.0, h: 3.4, wall: sg });
      E.push({ t: 'wei_prop', kind: 'well', at: [sg * 64, -86], yaw: 0 });
      E.push({ t: 'wei_prop', kind: 'rack', at: [sg * 58, -56], n: 6 });
      E.push({ t: 'wei_prop', kind: 'granary', at: [sg * 68, -128], yaw: 0, w: 4.6, d: 3.6 });
      E.push({ t: 'wei_prop', kind: 'granary', at: [sg * 54, -128], yaw: 0, w: 4.6, d: 3.6 });
      E.push({ t: 'wei_prop', kind: 'lamp', at: [sg * 12, -118] }, { t: 'wei_prop', kind: 'ding', at: [sg * 26, -123], s: 1.0 });
      E.push({ t: 'wei_prop', kind: 'brazier', at: [sg * 52, -97] });
    }
    plans.push(base('wei-palace', E));
  }
  // ── the garden: the Xuanwu pond, the pavilions of the Tongque Garden ──
  {
    const E = [{ t: 'han_pond', rect: POND, y: POND_Y }];
    E.push({ t: 'han_pavilion', c: [POND[2] + 6, POND[1] + 8], A: 3.4, B: 3.4, y: 0, h: 3.6, tiers: 1, walls: false });
    E.push({ t: 'han_pavilion', c: [POND[0] - 8, POND[3] - 6], A: 3.4, B: 3.4, y: 0, h: 3.6, tiers: 1, walls: false });
    E.push({ t: 'floor', rect: [-141, zOf(SPARROW) - 5.5, -100, zOf(SPARROW) + 5.5], y: 0.02, mat: 'brick_paving', th: 0.3 });
    // the paths of the garden: north to the pond's landing, south to the poets' hall, east to the palace's west gate
    E.push({ t: 'floor', rect: [-114, -135, -108, -93], y: 0.02, mat: 'brick_paving', th: 0.3 }, { t: 'floor', rect: [-114, -83, -108, -37], y: 0.02, mat: 'brick_paving', th: 0.3 },
      { t: 'floor', rect: [-136, -37.5, -98, -33], y: 0.02, mat: 'brick_paving', th: 0.3 });
    // the poets' hall (the Wenxue hall of the Jian'an circle) with its corridor, a pavilion on each of the garden's hummocks, the garden's furniture
    E.push({ t: 'han_hall', cx: -117, z1: -26, bays: 5, bayW: 5.4, depth: 2, depthW: 5.4, floor: 0.7, base: 0.7, h: 4.8, roof: 'hip', rise: 3.6, overhang: 2.4, ap: 1.6, furnish: 'lecture', open: [2, 2], seed: 61 });
    E.push({ t: 'han_corridor', a: [-143, -29], b: [-131, -29], w: 3.0, h: 3.4, wall: 1 });
    for (const [x, z] of [[-95, -100], [-150, -118], [-92, -60]]) E.push({ t: 'han_pavilion', c: [x, z], A: 3.4, B: 3.4, y: 0, h: 3.6, tiers: 1, walls: false });
    for (let x = -137; x <= -103; x += 11) for (const sg of [-1, 1]) E.push({ t: 'wei_prop', kind: 'lamp', at: [x, zOf(SPARROW) + sg * 6.4] });
    for (const x of [-132, -122, -106]) for (const sg of [-1, 1]) E.push({ t: 'wei_prop', kind: 'bench', at: [x, zOf(SPARROW) + sg * 7.4], len: 2.2 });
    const rr = rng(77);
    for (let k = 0; k < 20; k++) {
      const a = k / 20 * 6.28, rx = 33 + rr() * 6, rz = 20 + rr() * 5, x = (POND[0] + POND[2]) / 2 + Math.cos(a) * rx, z = (POND[1] + POND[3]) / 2 + Math.sin(a) * rz;
      if (z > -100 || (x > -150 && x < -90 && z > -135 && z < -130)) continue;
      E.push({ t: 'wei_prop', kind: 'rock', at: [x, z], seed: k + 4, s: 0.8 + rr() * 0.9 });
    }
    for (const [x, z] of [[-128, -128], [-108, -128], [-100, -110], [-118, -64]]) E.push({ t: 'wei_prop', kind: 'rock', at: [x, z], seed: Math.round(x), s: 1.2 });
    // the fleet's pond: the tower-ship at anchor, fighting ships and a skiff, the landing
    E.push({ t: 'han_ship', at: [-120, -147.5], y: POND_Y, len: 15, yaw: 0 });
    E.push({ t: 'wei_boat', at: [-97, -142], y: POND_Y, yaw: 1.2, len: 8, kind: 'war' }, { t: 'wei_boat', at: [-104, -153], y: POND_Y, yaw: 0.25, len: 9, kind: 'war' },
      { t: 'wei_boat', at: [-132, -139], y: POND_Y, yaw: 0.5, len: 5, kind: 'skiff' });
    E.push(...forecourtElements());
    plans.push(base('wei-garden', E));
  }
  // ── the household of the garden: lodgings and workrooms, entered from the garden's paths (rooms for the ambience) ──
  {
    const rooms = LODGES.map((l) => ({ id: l.say, rect: [l.rect[0] + 1.2, l.rect[1] + (l.front === 's' ? 0.9 : l.rect[3] - l.rect[1] - 8.4), l.rect[2] - 1.2, l.rect[1] + (l.front === 's' ? l.rect[3] - l.rect[1] - 0.9 : 8.4)], y: 0.33, kind: 'inner' }));
    plans.push(base('wei-lodges', LODGES.map((l) => ({ t: 'wei_house', rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, room: l.room, open: true })), { rooms }));
    plans.push({ ...base('wei-lodges-life', lodgeLife()), style: 'life' });
  }
  // ── the offices along the avenue ──
  {
    const E = [];
    for (const l of lots()) if (l.kind === 'office') E.push({ t: 'wei_office', rect: l.rect, seed: l.seed, open: l.seed % 2 === 0 });
    if (E.length) plans.push(base('wei-offices', E));
  }
  // ── wards: walls and gates, the houses ──
  {
    const E = [];
    for (const w of WARDS) {
      const z0 = w[1], lc = [z0 + WARD_WALL + 24.55, z0 + WARD_WALL + 72.85];
      E.push({ t: 'han_ward', rect: w, gates: [{ side: 'w', c: lc[0], w: 4.5 }, { side: 'e', c: lc[0], w: 4.5 }, { side: 'w', c: lc[1], w: 3.5 }, { side: 'e', c: lc[1], w: 3.5 }] });
    }
    plans.push(base('wei-wards', E));
    const H = lots().filter((l) => l.kind !== 'office');
    for (let i = 0; i < H.length; i += 40) plans.push(base(`wei-houses-${i / 40}`, H.slice(i, i + 40).map((l) => ({ t: 'wei_house', rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, open: l.open }))));
  }
  // ── the market ──
  {
    const cx = (MARKET[0] + MARKET[2]) / 2, cz = (MARKET[1] + MARKET[3]) / 2;
    plans.push(base('wei-market', [{ t: 'han_market', rect: MARKET, gates: { n: cx, s: cx, e: cz, w: cz }, th: MARKET_WALL.th, h: MARKET_WALL.h }, ...marketRows(MARKET, 600), ...marketElements()]));
  }
  // ── the city wall and its gates; the river ──
  {
    const E = [], th = CITY_WALL.th, h = CITY_WALL.h, gw = GATE_W - 1.2;
    const gates = [...GATES_S.map((x) => ({ c: [x, WALL.s], axis: 'x' })), ...GATES_N.map((x) => ({ c: [x, WALL.n], axis: 'x' })), { c: [WALL.e, AVENUE_Z], axis: 'z' }, { c: [WALL.w, AVENUE_Z], axis: 'z' }];
    for (const { a, b } of cityWalls()) {
      const alongX = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]), gaps = [];
      for (const g of gates) {
        if (g.axis === 'x' && alongX && Math.abs(a[1] - g.c[1]) < 1 && g.c[0] > a[0] && g.c[0] < b[0]) gaps.push({ at: g.c[0] - a[0], w: gw });
        if (g.axis === 'z' && !alongX && Math.abs(a[0] - g.c[0]) < 1 && g.c[1] > a[1] && g.c[1] < b[1]) gaps.push({ at: g.c[1] - a[1], w: gw });
      }
      E.push({ t: 'han_wall', a, b, th, h, mat: 'earth_wall', walk: true, layers: true, gaps });
    }
    for (const g of gates) { const r = Math.hypot(...g.c); if (r < RADIUS - 30) E.push({ t: 'han_gate', c: g.c, axis: g.axis, th, h, n: 3, pw: 6, pier: 2.4, ph: 5.4 }); }
    plans.push(base('wei-citywall', [...E, ...wallElements()]));
    plans.push(base('wei-river', [{ t: 'wei_river', x0: -218, x1: 218, zc: riverZ, w: RIVER.w, y: RIVER.y }, ...riverElements()]));
    plans.push(base('wei-streets', streetElements()));
    plans.push(base('wei-compound', compoundElements()));
    plans.push(base('wei-farms', farmElements()));
    plans.push({ ...base('wei-life', lifeElements()), style: 'life' });
  }
  plans.push({ ...base('wei-people', people()), style: 'life' });
  plans.push({ ...base('wei-forecourt', forecourtLife()), style: 'life' });
  return (CACHE = plans);
}
