// Round the Temple (docs/settlements/lu-qufu.md §2, §6–§8): the Kong Mansion east of it, the Ming city's south wall with the Wanren Gongqiang
// gate, the Jinsheng Yuzhen archway, Queli Street and its shops, the courtyard houses of the town, the edge of the Kong Forest with
// Confucius's tomb, and the people: the sacrificing officials and the guards of the temple, students in the court, the shopkeepers.

import { RADIUS, TEMPLE, MANSION, MX, MANSION_HALLS, MANSION_RANGES, CITY_WALL, WANREN, JINSHENG, QUELI, SQUARE, HALL, GATE_HALLS, ALTAR, KONG_FOREST, streets, lots, shopRuns } from './layout.js';
import { HOUSE } from '../../styles/qing/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, style = 'lu') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -60], facing: 'n' } });
const R = RADIUS - 22;
function clip([x0, z0, x1, z1]) {
  if (x1 - x0 > z1 - z0) { const z = Math.min(Math.abs(z0), Math.abs(z1)); if (z >= R) return null; const h = Math.sqrt(R * R - z * z); return [Math.max(x0, -h), z0, Math.min(x1, h), z1]; }
  const x = Math.min(Math.abs(x0), Math.abs(x1)); if (x >= R) return null; const h = Math.sqrt(R * R - x * x); return [x0, Math.max(z0, -h), x1, Math.min(z1, h)];
}
const MWALL = { pal: { plaster: 'brick_grey', roof: 'tile_grey', plinth: 'granite_block' } };

function paving() {
  const E = [];
  E.push({ t: 'lane', rect: QUELI, y: 0.04, mat: 'bluestone' });
  E.push({ t: 'lane', rect: [-8, 170, 8, 262], y: 0.04, mat: 'bluestone' });
  E.push({ t: 'lane', rect: SQUARE, y: 0.03, mat: 'brick_paving' });
  E.push({ t: 'lane', rect: [-3.2, 118, 3.2, 262], y: 0.07, mat: 'granite_block' });
  E.push({ t: 'lane', rect: [MX - 5, 112, MX + 5, 125], y: 0.03, mat: 'brick_paving' });
  void streets; void clip;
  return base('qufu-paving', E);
}

function cityWall() {
  const E = [], z = CITY_WALL.z, L = Math.sqrt(R * R - z * z);
  E.push({ t: 'ming_wall', a: [-L, z], b: [L, z], y: 0, h: CITY_WALL.h, th: CITY_WALL.th, gates: [{ at: L + WANREN.x, w: WANREN.w, h: 5.6 }], ...MWALL });
  E.push({ t: 'gate_doors', at: [WANREN.x, z], along: 'x', w: WANREN.w, h: 5.6, y: 0.03, swing: -1, off: CITY_WALL.th / 2 });
  // the gate tower on the wall over the passage: double eaves, grey tile
  E.push({ t: 'qing_hall', rect: [-14, z - 4.4, 14, z + 4.4], y: CITY_WALL.h, H: 5.0, double: 3.8, roof: 'xieshan', bays: [7, 2], front: 's', four: true, plat: 0.3, pal: HOUSE });
  E.push({ t: 'lu_pailou', c: [0, JINSHENG.z], across: 'x', w: JINSHENG.w, h: 7.0, n: 4, roof: true });
  // the guard-houses beside the gate, and the moat's stone kerb is left out
  return base('qufu-wall', E);
}

function mansion() {
  const E = [], [x0, z0, x1, z1] = MANSION, wall = (a, b, gates) => E.push({ t: 'ming_wall', a, b, y: 0, h: 4.6, th: 0.9, ...(gates ? { gates } : {}), ...MWALL });
  const gateHall = MANSION_HALLS[0], cg = MANSION_HALLS[1], nz = MANSION_HALLS[5];
  const hw = (h) => (h.rect[2] - h.rect[0]) / 2 + 1, zc = (h) => (h.rect[1] + h.rect[3]) / 2;
  // outer walls; the cross walls between the courts, each in two halves round its gate hall
  wall([x0, z1], [MX - hw(gateHall), z1]); wall([MX + hw(gateHall), z1], [x1, z1]);
  wall([x0, z1], [x0, z0]); wall([x1, z1], [x1, z0]); wall([x0, z0], [x1, z0]);
  for (const h of [cg, nz]) { const z = zc(h); wall([x0, z], [MX - hw(h), z]); wall([MX + hw(h), z], [x1, z]); }
  wall([x0, -146], [MX - 4, -146]); wall([MX + 4, -146], [x1, -146]);
  for (const h of MANSION_HALLS) E.push({ t: 'qing_hall', rect: h.rect, y: 0.45, H: h.H, ...(h.double ? { double: h.double } : {}), roof: 'xieshan', bays: h.bays, front: 's', doors: h.doors, four: false, plat: 0.45, platMargin: 1.2, pal: HOUSE });
  for (const r of MANSION_RANGES) E.push({ t: 'qing_hall', rect: r.rect, y: 0.4, H: 4.0, roof: 'gable', bays: [11, 2], front: r.front, four: false, plat: 0.4, pal: HOUSE });
  E.push({ t: 'lane', rect: [MX - 3.5, -146, MX + 3.5, 112], y: 0.04, mat: 'bluestone' });
  E.push({ t: 'lane', rect: [x0 + 2, 36, x1 - 2, 108], y: 0.03, mat: 'brick_paving' });
  // the back garden (Tieshan): a pavilion and a rock or two under old trees
  E.push({ t: 'ming_pavilion', c: [MX - 26, -158], shape: 'square', w: 4.4, y: 0.45, H: 3.8, plat: 0.45, pal: HOUSE });
  E.push({ t: 'ming_pavilion', c: [MX + 26, -158], shape: 'oct', r: 2.6, y: 0.45, H: 3.8, plat: 0.45, pal: HOUSE });
  for (const [dx, dz] of [[-10, -152], [12, -160], [0, -164]]) E.push({ t: 'taihu', c: [MX + dx, dz], y: 0.1, h: 2.2, seed: Math.abs(Math.round(dx)) + 7, lod: 1 });
  return base('qufu-mansion', E);
}

function houses() {
  const L = lots(), out = [];
  for (let i = 0; i < L.length; i += 20) out.push(base(`qufu-houses-${i / 20}`, L.slice(i, i + 20).map((l) => ({ t: 'siheyuan', rect: l.rect, seed: l.seed, furnish: l.seed % 5 === 0 }))));
  return out;
}

function shops() {
  return base('qufu-shops', shopRuns().map((s) => ({ t: 'lu_shop_row', rect: s.rect, front: s.front, n: s.n, seed: s.seed, storeys: s.storeys })));
}

function forest() {
  const E = [], [x0, z0, x1, z1] = KONG_FOREST, rand = rng(55);
  E.push({ t: 'lu_tomb', c: [0, z0 + 40], r: 8, h: 4, face: [0, 1] });
  // the lesser graves of the clan under the trees, each its mound and stele
  for (let k = 0; k < 14; k++) {
    const x = x0 + 12 + rand() * (x1 - x0 - 24), z = z0 + 10 + rand() * (z1 - z0 - 20);
    if (Math.abs(x) < 16 && z > z0 + 20) continue;
    E.push({ t: 'lu_tomb', c: [x, z], r: 3 + rand() * 1.5, h: 1.4 + rand() * 0.8, face: [0, 1] });
  }
  return base('qufu-forest', E);
}

/** The people (docs/settlements/lu-qufu.md §7). */
function people() {
  const rand = rng(1730), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_black', skin: 'skin_light', hat: 'cap', hair: 'shaven', hairMat: 'hair_dark', feet: 'shod', carry: 'none', pose: 'stand', over: 'collar', ...o });
  const pick = (a) => a[Math.floor(rand() * a.length) % a.length];
  const face = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));
  // the sacrifice in the Dacheng Hall: officials in blue and red robes before the table, two kneeling, the master of ceremonies
  const [hx0, hz0, hx1] = HALL.rect, cx = (hx0 + hx1) / 2, y = HALL.y;
  for (const [dx, dz, o] of [[-1.6, 12.8, { pose: 'kneel', cloth: 'cloth_blue' }], [1.6, 12.8, { pose: 'kneel', cloth: 'cloth_blue' }], [-3.6, 14.6, { cloth: 'cloth_red' }], [3.6, 14.6, { cloth: 'cloth_red' }], [0, 16.2, { cloth: 'cloth_blue', pose: 'staff', carry: 'staff', len: 1.8 }], [-12, 12, {}], [12, 12, {}]])
    fig([cx + dx, hz0 + 1 + dz], 0, { y, ...o });
  // the guards (bannermen) at the gates
  for (const g of GATE_HALLS) for (const s of [-1, 1]) fig([s * (g.w / 2 + 2.2), g.z + 4.6], Math.PI, { y: 0, pose: 'staff', carry: 'staff', len: 2.0, cloth: 'cloth_red', over: 'sash' });
  // students and scholars in the court before the Apricot Altar, in blue gowns; a teacher among them
  const [ax, az] = ALTAR.c;
  for (let k = 0; k < 9; k++) {
    const a = k / 9 * Math.PI * 2, r = 9.4 + rand() * 4, at = [ax + Math.cos(a) * r * 1.5, az + Math.sin(a) * r];
    fig(at, face(at, [ax, az]), { cloth: pick(['cloth_blue', 'cloth_indigo', 'cloth_white', 'cloth_grey']), pose: k % 3 === 0 ? 'talk' : 'stand' });
  }
  fig([ax, az + 1.4], Math.PI, { y: 0.6, cloth: 'cloth_indigo', cloth2: 'cloth_white', beard: 1, pose: 'sit' });
  // pilgrims in the first courts
  for (let k = 0; k < 14; k++) { const at = [-34 + rand() * 68, 33 + rand() * 80]; if (Math.abs(at[0]) < 3 && at[1] > 85 && at[1] < 112) continue; fig(at, rand() * 6.28, { cloth: pick(['cloth_indigo', 'cloth_brown', 'cloth_grey', 'cloth_ochre']), pose: rand() < 0.3 ? 'talk' : 'stand' }); }
  // the shopkeepers at their counters
  for (const s of shopRuns()) {
    const [x0, z0, x1, z1] = s.rect, sw = (z1 - z0) / s.n, west = s.front === 'w';
    for (let i = 0; i < s.n; i++) if (rand() < 0.7) fig([west ? x0 + 1.5 : x1 - 1.5, z0 + (i + 0.5) * sw], west ? -Math.PI / 2 : Math.PI / 2, { y: 0.18, cloth: pick(['cloth_indigo', 'cloth_brown', 'cloth_grey']), over: 'sash' });
  }
  return { ...base('qufu-people', L), style: 'life' };
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  void TEMPLE; void MANSION_RANGES;
  return (CACHE = [paving(), cityWall(), mansion(), ...houses(), shops(), forest(), people()]);
}
