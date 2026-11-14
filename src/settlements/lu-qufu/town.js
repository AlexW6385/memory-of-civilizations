// Round the Temple (docs/settlements/lu-qufu.md §2, §6–§8): the Kong Mansion east of it, the Ming city's south wall with the Wanren Gongqiang
// gate, the Jinsheng Yuzhen archway, Queli Street and its shops, the courtyard houses of the town, the edge of the Kong Forest with
// Confucius's tomb, and the people: the sacrificing officials and the guards of the temple, students in the court, the shopkeepers.

import { RADIUS, TEMPLE, MANSION, MX, MANSION_HALLS, MANSION_RANGES, CITY_WALL, WANREN, JINSHENG, QUELI, SQUARE, HALL, GATE_HALLS, ALTAR, KONG_FOREST, DRUM, OLD, streets, lots, shopRuns, streetItems, laneZs, LANES_X, STREET_W, ANCILLARY, STELE_PAV } from './layout.js';
import { HOUSE } from '../../styles/qing/index.js';
void [laneZs, LANES_X, STREET_W];

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
  const KIND = { chongguang: ['yamen'], datang: ['yamen', 1], ertang: ['yamen'], santang: ['yamen'], neizhai: ['parlor'], qianshang: ['parlor'], qiantang: ['parlor'], houtang: ['parlor'], flower: ['study'] };
  for (const h of MANSION_HALLS) if (KIND[h.id]) E.push({ t: 'lu_inside', kind: KIND[h.id][0], grand: !!KIND[h.id][1], rect: h.rect, y: 0.45, seed: Math.abs(Math.round(h.rect[1])) + 11, ceil: 0.45 + h.H - 0.15 });
  for (const r of MANSION_RANGES) E.push({ t: 'qing_hall', rect: r.rect, y: 0.4, H: 4.0, roof: 'gable', bays: [11, 2], front: r.front, four: false, plat: 0.4, pal: HOUSE });
  E.push({ t: 'lane', rect: [MX - 3.5, -146, MX + 3.5, 112], y: 0.04, mat: 'bluestone' });
  E.push({ t: 'lane', rect: [x0 + 2, 36, x1 - 2, 108], y: 0.03, mat: 'brick_paving' });
  // the back garden (Tieshan): a pavilion and a rock or two under old trees
  E.push({ t: 'ming_pavilion', c: [MX - 26, -158], shape: 'square', w: 4.4, y: 0.45, H: 3.8, plat: 0.45, pal: HOUSE });
  E.push({ t: 'ming_pavilion', c: [MX + 26, -158], shape: 'oct', r: 2.6, y: 0.45, H: 3.8, plat: 0.45, pal: HOUSE });
  for (const [dx, dz] of [[-10, -152], [12, -160], [0, -164]]) E.push({ t: 'taihu', c: [MX + dx, dz], y: 0.1, h: 2.2, seed: Math.abs(Math.round(dx)) + 7, lod: 1 });
  return base('qufu-mansion', E);
}

/** The Drum Tower on its brick platform across the west street, the passage through it, the stair up the east side. */
function drumTower() {
  const E = [], { x, z, w, d, h, pass, stair } = DRUM;
  for (const [a, b, y0] of [[x - w / 2, x - pass / 2, 0], [x + pass / 2, x + w / 2, 0], [x - pass / 2, x + pass / 2, 4.6]]) E.push({ t: 'block', rect: [a, z - d / 2, b, z + d / 2], y0, y1: h, mat: 'brick_grey', walk: true, batter: [0, 0, 0, 0] });
  for (const sx of [-1, 1]) E.push({ t: 'block', rect: [x + sx * w / 2 - 0.4, z - d / 2 - 0.3, x + sx * w / 2 + 0.4, z + d / 2 + 0.3], y0: h, y1: h + 0.9, mat: 'granite_grey', collide: true });
  E.push({ t: 'qing_hall', rect: [x - w / 2 + 2, z - d / 2 + 2, x + w / 2 - 2, z + d / 2 - 2], y: h, H: 4.4, double: 3.4, roof: 'xieshan', bays: [5, 2], front: 's', four: true, plat: 0.3, pal: HOUSE });
  E.push({ t: 'lu_inside', kind: 'drum', rect: [x - w / 2 + 2, z - d / 2 + 2, x + w / 2 - 2, z + d / 2 - 2], y: h });
  E.push({ t: 'stairs', rect: stair, y0: 0.03, y1: h, dir: 'w' });
  E.push({ t: 'lane', rect: [x - pass / 2, z - d / 2 - 0.5, x + pass / 2, z + d / 2 + 0.5], y: 0.04, mat: 'bluestone' });
  return base('qufu-drum', E);
}

/** The street furniture and the carts and animals of the lanes. */
function streetLife() {
  const S = streetItems(), E = [], L = [];
  for (const a of S.stalls) E.push({ t: 'lu_stall', ...a });
  for (const a of S.wells) E.push({ t: 'lu_well', ...a });
  for (const a of S.lamps) E.push({ t: 'lu_lamp', ...a });
  for (const a of S.hitches) E.push({ t: 'lu_hitch', ...a });
  for (const a of S.carts) E.push({ t: 'lu_handcart', ...a });
  for (const [px, pz] of OLD) if (Math.abs(px) < 90 && pz > -232 && pz < 118) E.push({ t: 'lu_treeguard', at: [px, pz], w: 1.4, bench: pz > -60 });
  let k = 1;
  for (const a of S.hitches) L.push({ t: 'animal', kind: 'donkey', at: [a.at[0], a.at[1] + 1.8], y: 0, rot: 0, gear: true, graze: false, seed: k++ });
  for (const a of S.carts.slice(0, 6)) L.push({ t: 'animal', kind: 'donkey', at: [a.at[0] + 2.2, a.at[1]], y: 0, rot: a.seed % 6, gear: false, graze: true, seed: k++ });
  return [base('qufu-street', E), { ...base('qufu-street-animals', L), style: 'life' }];
}

function houses() {
  const L = lots(), out = [];
  for (let i = 0; i < L.length; i += 20) out.push(base(`qufu-houses-${i / 20}`, L.slice(i, i + 20).map((l) => ({ t: 'lu_house', rect: l.rect, seed: l.seed, wealth: l.wealth, lod: l.lod, shop: l.wealth > 0.3 && l.seed % 3 === 0, trade: l.seed % 4 }))));
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
  for (const [dx, dz, o] of [[-1.6, 12.8, { pose: 'kneel', cloth: 'cloth_blue' }], [1.6, 12.8, { pose: 'kneel', cloth: 'cloth_blue' }], [-3.6, 14.6, { cloth: 'cloth_red' }], [3.6, 14.6, { cloth: 'cloth_red' }], [6.5, 15.4, { cloth: 'cloth_blue', pose: 'staff', carry: 'staff', len: 1.8 }], [-12, 12, {}], [12, 12, {}]])
    fig([cx + dx, hz0 + 1 + dz], 0, { y, ...o });
  // the guards (bannermen) at the gates
  for (const g of GATE_HALLS) for (const s of [-1, 1]) fig([s * (g.w / 2 + 2.2), g.z + 4.6], Math.PI, { y: 0, pose: 'staff', carry: 'staff', len: 2.0, cloth: 'cloth_red', over: 'sash' });
  // students and scholars in the court before the Apricot Altar, in blue gowns; a teacher among them
  const [ax, az] = ALTAR.c;
  for (let k = 0; k < 9; k++) {
    const a = k / 9 * Math.PI * 2, r = 9.4 + rand() * 4, at = [ax + Math.cos(a) * r * 1.5, az + Math.sin(a) * r];
    fig(at, face(at, [ax, az]), { cloth: pick(['cloth_blue', 'cloth_indigo', 'cloth_white', 'cloth_grey']), pose: k % 3 === 0 ? 'talk' : 'stand' });
  }
  fig([ax + 2.8, az - 1.4], Math.PI / 2, { y: 0.6, cloth: 'cloth_indigo', cloth2: 'cloth_white', beard: 1, pose: 'sit' });
  // pilgrims in the first courts
  for (let k = 0; k < 14; k++) { const at = [-34 + rand() * 68, 33 + rand() * 80]; if (Math.abs(at[0]) < 3 && at[1] > 85 && at[1] < 112) continue; fig(at, rand() * 6.28, { cloth: pick(['cloth_indigo', 'cloth_brown', 'cloth_grey', 'cloth_ochre']), pose: rand() < 0.3 ? 'talk' : 'stand' }); }
  // the shopkeepers at their counters
  for (const s of shopRuns()) {
    const [x0, z0, x1, z1] = s.rect, sw = (z1 - z0) / s.n, west = s.front === 'w';
    for (let i = 0; i < s.n; i++) if (rand() < 0.7) fig([west ? x0 + 1.5 : x1 - 1.5, z0 + (i + 0.5) * sw], west ? -Math.PI / 2 : Math.PI / 2, { y: 0.18, cloth: pick(['cloth_indigo', 'cloth_brown', 'cloth_grey']), over: 'sash' });
  }
  // the hawkers at their stalls: the seller on his stool, a customer or two before the table
  const SI = streetItems(), CL = ['cloth_indigo', 'cloth_brown', 'cloth_grey', 'cloth_ochre', 'cloth_blue', 'cloth_white'];
  for (const a of SI.stalls) {
    const c = Math.cos(a.rot), sn = Math.sin(a.rot), P = (u, w) => [a.at[0] + u * c + w * sn, a.at[1] - u * sn + w * c];
    fig(P(0.8, 0.9), face(P(0.8, 0.9), a.at), { pose: 'sit', y: 0, cloth: pick(CL), over: 'sash' });
    for (let k = 0; k < 1 + Math.floor(rand() * 2.4); k++) { const q = P(-0.9 + k * 1.1, 1.6 + rand() * 0.5); fig(q, face(q, a.at), { cloth: pick(CL), pose: rand() < 0.3 ? 'talk' : 'stand', carry: rand() < 0.2 ? 'basket' : 'none' }); }
  }
  // the street: pilgrims and townsfolk in twos and threes along Queli Street, the square and the lanes
  for (let k = 0; k < 46; k++) {
    const sq = k < 14, at = sq ? [-30 + rand() * 60, 122 + rand() * 44] : [-7.5 + rand() * 15, 172 + rand() * 86];
    if (Math.abs(at[0]) < 3.5 && at[1] > 130 && at[1] < 160) continue;
    fig(at, rand() * 6.28, { cloth: pick(CL), pose: rand() < 0.4 ? 'talk' : 'stand', carry: rand() < 0.12 ? 'basket' : 'none', hat: rand() < 0.15 ? 'straw' : 'cap' });
    if (rand() < 0.5) fig([at[0] + 0.8, at[1] + 0.3], rand() * 6.28, { cloth: pick(CL), pose: 'talk' });
  }
  for (const s of streets()) {
    const w = Math.min(s[2] - s[0], s[3] - s[1]), len = Math.max(s[2] - s[0], s[3] - s[1]);
    if (w > 14 || Math.hypot((s[0] + s[2]) / 2, (s[1] + s[3]) / 2) > 190 || len < 12) continue;
    const n = Math.min(3, Math.floor(len / 40));
    for (let k = 0; k < n; k++) {
      const at = s[2] - s[0] > s[3] - s[1] ? [s[0] + 3 + rand() * (len - 6), s[1] + rand() * w] : [s[0] + rand() * w, s[1] + 3 + rand() * (len - 6)];
      fig(at, rand() * 6.28, { cloth: pick(CL), pose: ['stand', 'talk', 'squat'][Math.floor(rand() * 3)], dress: rand() < 0.3 ? 'trousers' : 'robe' });
    }
  }
  // the temple: pilgrims kneeling at the burners and the altar, scholars before the Kuiwen Pavilion, the guides
  for (const [x, z] of [[-9.5, -44], [9.5, -44], [0, ALTAR.c[1] + 7]]) fig([x + 1.6, z + 0.2], Math.PI / 2, { pose: 'kneel', arms: 'pray', cloth: pick(CL) });
  for (let k = 0; k < 18; k++) { const at = [-50 + rand() * 100, -96 + rand() * 40]; if (Math.hypot(at[0], at[1] - ALTAR.c[1]) < 10 || Math.abs(at[0]) < 4.5) continue; fig(at, rand() * 6.28, { cloth: pick(['cloth_blue', 'cloth_white', 'cloth_indigo']), pose: rand() < 0.4 ? 'talk' : 'stand' }); }
  for (let k = 0; k < 12; k++) { const at = [-14 + rand() * 28, -16 + rand() * 40]; if (Math.abs(at[0]) < 4.5) continue; fig(at, rand() * 6.28, { cloth: pick(CL), pose: 'stand', carry: rand() < 0.2 ? 'staff' : 'none' }); }
  // the Duke's household: guards at the mansion's gate, the Duke at his table in the great hall, clerks at their desks, servants in the court
  for (const sx of [-1, 1]) fig([MX + sx * 4.5, 114], Math.PI, { pose: 'staff', carry: 'staff', len: 2.0, cloth: 'cloth_red', over: 'sash' });
  const dt = MANSION_HALLS[3];
  fig([MX, dt.rect[1] + 1.9], Math.PI, { y: 0.85, pose: 'sit', cloth: 'cloth_maroon', cloth2: 'cloth_black', beard: 1 });
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) fig([MX + sx * (5 + k * 1.2), dt.rect[1] + 7.5], -sx * Math.PI / 2, { y: 0.45, cloth: pick(['cloth_blue', 'cloth_indigo']), pose: 'stand' });
  for (let k = 0; k < 14; k++) { const at = [MX - 12 + rand() * 24, -146 + rand() * 250]; if (MANSION_HALLS.some((h) => at[0] > h.rect[0] - 1 && at[0] < h.rect[2] + 1 && at[1] > h.rect[1] - 1 && at[1] < h.rect[3] + 1)) continue; fig(at, rand() * 6.28, { cloth: pick(CL), pose: rand() < 0.3 ? 'talk' : 'stand', carry: rand() < 0.25 ? 'basket' : 'none' }); }
  // the service halls of the side roads: the temple's musicians in the Jinsi Hall, the clerk of the vessel store, the cooks of the Divine Kitchen, the teacher and his pupils in the Shili Hall, a keeper in each house
  { const A = Object.fromEntries(ANCILLARY.map((a) => [a.id, a.rect])), mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], y0 = 0.45;
    const m = mid(A.jinsi);
    fig([m[0] - 5.0, A.jinsi[1] + 2.4], 0, { y: y0, cloth: 'cloth_blue', pose: 'stand' }); fig([m[0] + 5.0, A.jinsi[1] + 2.4], 0, { y: y0, cloth: 'cloth_blue', pose: 'stand' });
    fig([m[0] - 1.1, A.jinsi[1] + 5.9], Math.PI, { y: y0, cloth: 'cloth_indigo', pose: 'sit' }); fig([m[0] + 2.4, A.jinsi[1] + 5.9], Math.PI, { y: y0, cloth: 'cloth_white', pose: 'sit' });
    fig([A.vessels[2] - 3.2, A.vessels[3] - 2.3], Math.PI / 2, { y: y0, cloth: 'cloth_grey', over: 'sash', pose: 'sit' });
    const k = A.shenchu;
    for (const [dx, dz, o] of [[2.4, 2.4, {}], [6.0, 2.6, { pose: 'talk' }], [9.5, 2.5, {}]]) fig([k[0] + dx, k[1] + dz], 0, { y: y0, cloth: 'cloth_white', cloth2: 'cloth_grey', over: 'apron', hat: 'cap', ...o });
    fig([(k[0] + k[2]) / 2, (k[1] + k[3]) / 2 + 2.3], Math.PI, { y: y0, cloth: 'cloth_grey', over: 'apron' });
    const sh = A.shili, sm = mid(sh);
    fig([sm[0], sh[1] + 2.4], Math.PI, { y: y0, cloth: 'cloth_indigo', cloth2: 'cloth_white', beard: 1, pose: 'sit' });
    for (const dx of [-5.5, -2.0, 2.0, 5.5]) fig([sm[0] + dx, sh[1] + 6.2], 0, { y: y0, cloth: dx < 0 ? 'cloth_blue' : 'cloth_white', pose: 'sit' });
    for (const id of ['keeper-w', 'cooks-e']) { const r = A[id], c = mid(r); fig([c[0] + 1.4, r[1] + 2.6], Math.PI, { y: y0, cloth: 'cloth_brown', over: 'sash', pose: 'stand' }); }
    // a keeper and a kneeling pilgrim in the stele pavilions
    for (const [i, p] of STELE_PAV.entries()) if (i % 3 === 0) fig([p.c[0] + (p.big ? 2.6 : 1.8), p.c[1] + 1.0], -Math.PI / 2, { y: 0.5, cloth: 'cloth_grey', over: 'sash', pose: 'stand' });
    for (const i of [1, 8]) { const p = STELE_PAV[i]; fig([p.c[0], p.c[1] + (p.big ? 3.0 : 2.1)], Math.PI, { y: 0.5, pose: 'kneel', arms: 'pray', cloth: 'cloth_indigo' }); } }
  // the Drum Tower's keeper on the platform, and a gossiping group under it
  fig([DRUM.x + 5, DRUM.z + 4.5], Math.PI, { y: DRUM.h, cloth: 'cloth_red', pose: 'staff', carry: 'staff', len: 1.9, over: 'sash' });
  for (let k = 0; k < 3; k++) fig([DRUM.x + 6.5 + k * 0.9, DRUM.z - 8], rand() * 6, { cloth: pick(CL), pose: 'talk' });
  return { ...base('qufu-people', L), style: 'life' };
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  void TEMPLE; void MANSION_RANGES;
  return (CACHE = [paving(), cityWall(), drumTower(), mansion(), ...houses(), shops(), ...streetLife(), forest(), people()]);
}
