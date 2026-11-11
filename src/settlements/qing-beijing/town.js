// The city round the palace (docs/settlements/qing-beijing.md §6): the moat with its stone walls,
// the street round it and the avenue south from the Meridian Gate, the east–west lanes (hutong)
// and the north–south streets, and the grey-brick courtyard houses between the lanes, in plans of
// a few dozen each so that they build in turn.

import { RADIUS, LEVEL, MOAT, RING, AVENUE, NOTCH, TEMPLE, DANBI, STREET_X, lanes, houses, houseTrees, shopRows, wells } from './layout.js';
import './townstyle.js';
import { lifePlans } from './life.js';

const R = RADIUS - 26;
const base = (id, elements, style = 'qing') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 215], facing: 'n' } });
function clip([x0, z0, x1, z1]) {
  const horiz = x1 - x0 > z1 - z0;
  if (horiz) { const z = Math.min(Math.abs(z0), Math.abs(z1)); if (z >= R) return null; const h = Math.sqrt(R * R - z * z); return [Math.max(x0, -h), z0, Math.min(x1, h), z1]; }
  const x = Math.min(Math.abs(x0), Math.abs(x1)); if (x >= R) return null; const h = Math.sqrt(R * R - x * x); return [x0, Math.max(z0, -h), x1, Math.min(z1, h)];
}

function streets() {
  const E = [];
  // the moat: water, its walls, the street round it
  const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
  const nx = NOTCH.x;
  for (const r of [[a0, b0, a1, d0], [a0, d1, -nx, b1], [nx, d1, a1, b1], [a0, d0, c0, d1], [c1, d0, a1, d1]]) E.push({ t: 'water_rect', rect: r, y: LEVEL.moat });
  // the walls of the water: the south side stops at the Meridian Gate's forecourt, where a stone causeway crosses the moat and its ends are walled
  const walls = [[[a0, b0], [a1, b0]], [[a0, b1], [-nx, b1]], [[nx, b1], [a1, b1]], [[a0, b0], [a0, b1]], [[a1, b0], [a1, b1]], [[c0, d0], [c1, d0]], [[c0, d1], [-nx, d1]], [[nx, d1], [c1, d1]], [[c0, d0], [c0, d1]], [[c1, d0], [c1, d1]], [[-nx, d1], [-nx, b1]], [[nx, d1], [nx, b1]]];
  for (const [p, q] of walls) {
    E.push({ t: 'canal_wall', a: p, b: q, y: 0.05, bed: LEVEL.moatBed, th: 0.8 });
    // a low wall of grey brick under a stone coping along each bank, open at the side bridges' landings (the notch's end walls have none)
    const vert = p[0] === q[0], side = vert && Math.abs(p[0]) !== nx;
    E.push({ t: 'low_wall', a: p, b: q, y: 0.05, h: 1.05, th: 0.5, open: side ? [[65 - 4.6 - p[1], 65 + 4.6 - p[1]]] : [] });
  }
  // the bridges over the moat at the side gates (the axis crosses by the causeway)
  E.push({ t: 'ming_arch_bridge', at: [(a0 + c0) / 2, 65], across: 'x', span: c0 - a0 + 0.6, width: 7, rise: 1.2, landing: 4, y: 0.04, water: LEVEL.moat, bed: LEVEL.moatBed, pal: { base: 'marble' } });
  E.push({ t: 'ming_arch_bridge', at: [(a1 + c1) / 2, 65], across: 'x', span: a1 - c1 + 0.6, width: 7, rise: 1.2, landing: 4, y: 0.04, water: LEVEL.moat, bed: LEVEL.moatBed, pal: { base: 'marble' } });
  // the causeway's two edges, over the moat's cut ends: a marble balustrade each side, as on the bridges
  for (const sx of [-1, 1]) E.push({ t: 'rail', a: [sx * (nx - 0.4), d1 + 0.2], b: [sx * (nx - 0.4), b1 - 0.2], y: 0.04, carve: 'qing' });
  // the band between the moat and the palace wall, paved
  for (const r of [[c0, d0, c1, -194], [c0, 179, c1, d1], [c0, -194, -116, 179], [116, -194, c1, 179]]) E.push({ t: 'lane', rect: r, y: 0.03 });
  // the ring street, the avenue, the lanes
  for (const r of [[RING[0], RING[1], RING[2], b0], [RING[0], b1, -nx, RING[3]], [nx, b1, RING[2], RING[3]], [RING[0], b0, a0, b1], [a1, b0, RING[2], b1]]) E.push({ t: 'lane', rect: r, y: 0.03, mat: 'bluestone' });
  // the Meridian Gate's forecourt: the causeway across the south moat, paved with brick, with the stone way down its axis to the avenue
  E.push({ t: 'lane', rect: [-nx, d1 - 0.5, nx, RING[3]], y: 0.03, mat: 'brick_paving' });
  E.push({ t: 'lane', rect: [-3.6, d1 - 0.5, 3.6, RING[3] + 2], y: 0.06, mat: 'marble_floor' });
  // the forecourt's end (§29): a red wall across its south side under a gate hall over three passages (the Duan Gate's place before the avenue),
  // returning north along the causeway's ends; the paved apron south of the gate between two low walls, with a pair of stone lions
  const zw = RING[3], pal = { plaster: 'palace_wall', roof: 'tile_yellow', plinth: 'marble' };
  E.push({ t: 'palace_wall', a: [-nx, zw], b: [nx, zw], y: 0, h: 5.5, th: 2.4, gates: [{ at: nx, w: 7, h: 5.2 }, { at: nx - 14, w: 4.6, h: 4.6 }, { at: nx + 14, w: 4.6, h: 4.6 }] });
  for (const sx of [-1, 1]) E.push({ t: 'palace_wall', a: [sx * nx, b1], b: [sx * nx, zw - 1.2], y: 0, h: 5.5, th: 2.4 });
  E.push({ t: 'qing_hall', rect: [-19, zw - 1.7, 19, zw + 1.7], y: 5.5, H: 4.4, double: 3.4, roof: 'xieshan', bays: [7, 2], front: 's', four: true, plat: 0.3, orn: { figures: 5 } });
  for (const [x, w, h] of [[0, 7, 5.2], [-14, 4.6, 4.6], [14, 4.6, 4.6]]) E.push({ t: 'gate_doors', at: [x, zw], along: 'x', w, h, y: 0.03, swing: -1, off: 1.25, nails: 7 });
  E.push({ t: 'lane', rect: [-26, zw + 1.2, 26, zw + 12], y: 0.03, mat: 'brick_paving' });
  E.push({ t: 'lane', rect: [-3.6, zw + 1.2, 3.6, zw + 12], y: 0.06, mat: 'marble_floor' });
  for (const sx of [-1, 1]) {
    E.push({ t: 'palace_wall', a: [sx * 26, zw + 1.2], b: [sx * 26, zw + 12], y: 0, h: 3.5, th: 1.4 });
    E.push({ t: 'bronze', kind: 'lion', at: [sx * 11, zw + 7], y: 0.06, s: 0.85, face: [0, 1], metal: 'marble_smooth', paw: sx > 0 ? 'ball' : 'cub' });
  }
  for (const l of lanes()) { const r = clip(l); if (r && l[2] - l[0] < 20) E.push({ t: 'lane', rect: r, y: 0.02, mat: 'bluestone' }); }
  return base('qing-beijing-streets', E);
}

/** The avenue as a commercial street and the hutong as packed-earth lanes (street.js). */
function surfaces() {
  const av = clip(AVENUE), plans = [], E = [];
  let k = 0;
  // the hutong, cut where the avenue and the north–south streets cross them (those keep their own surface)
  for (const l of lanes()) {
    if (l[2] - l[0] < 20) continue;
    const r = clip(l); if (!r) continue;
    let parts = [[r[0], r[2]]];
    const cuts = STREET_X.map((x) => [x - 4, x + 4]);
    if (r[1] + 5 > av[1] - 1) cuts.push([av[0] - 8.6, av[2] + 8.6]);
    for (const [c0, c1] of cuts) parts = parts.flatMap(([p, q]) => (c1 <= p || c0 >= q ? [[p, q]] : [[p, c0], [c1, q]].filter(([m, n]) => n - m > 2)));
    for (const [p, q] of parts) E.push({ t: 'bj_lane', rect: [p, r[1], q, r[3]], seed: 100 + k++ });
  }
  const per = 8;
  for (let i = 0; i < E.length; i += per) plans.push({ ...base(`qing-beijing-lanes-${i / per}`, E.slice(i, i + per), 'beijing-site') });
  plans.push(base('qing-beijing-avenue', [{ t: 'bj_street', z0: av[1], z1: av[3], seed: 5 }], 'beijing-site'));
  return plans;
}

/**
 * The courtyard houses (§5, §17): each with the gate of its rank; plans of 24 houses so that they build
 * in turn, near ones (full detail) apart from the far ones. The furnished ones (life.js) are chosen by layout.js furnishedHouses().
 */
function courtyards() {
  const all = [...houses()].sort((a, b) => (a.lod - b.lod) || (Math.atan2(a.rect[1], a.rect[0]) - Math.atan2(b.rect[1], b.rect[0]))), plans = [];
  const N = 8;
  for (let i = 0; i < all.length; i += N) {
    const part = all.slice(i, i + N);
    plans.push(base(`qing-beijing-houses-${i / N}`, part.map((h) => ({ t: 'hutong_house', rect: h.rect, seed: h.seed, gate: h.gate, courts: h.courts, wealth: h.wealth, lod: h.lod, trees: houseTrees(h).map((t) => [t[0], t[1]]) })), 'beijing-site'));
  }
  return plans;
}

/** The shop street (§16): the shops on the avenue's two sides, their yards, the wells of the lanes. */
function shopStreet() {
  const plans = [], rows = shopRows(), E = [];
  const mk = (id, els) => plans.push(base(id, els, 'beijing-site'));
  for (let i = 0; i < rows.length; i += 4) {
    const els = [];
    for (const row of rows.slice(i, i + 4)) {
      for (const s of row.shops) els.push({ t: 'qing_shop', side: row.side, front: row.front, z0: s.z0, z1: s.z1, depth: 8.4, trade: s.trade, seed: s.seed, storeys: s.storeys, enter: !!s.interior });
      els.push({ t: 'shop_yard', side: row.side, rect: [Math.min(row.yard[0], row.yard[2]), row.yard[1], Math.max(row.yard[0], row.yard[2]), row.yard[3]], seed: row.shops[0].seed });
    }
    mk(`qing-beijing-shops-${i / 4}`, els);
  }
  for (const w of wells()) E.push({ t: 'qing_well', at: w });
  if (E.length) mk('qing-beijing-wells', E);
  return plans;
}

/**
 * The Temple of Heaven's Hall of Prayer for Good Harvests (§13): the round altar and the hall
 * (qinian, src/styles/qing/tiantan.js) in its square walled court — red walls under green-glazed
 * copings, the Gate of Prayer for Good Harvests on the south, a gate on the west to the avenue —
 * the court paved with brick.
 */
function temple() {
  const E = [], [cx, cz] = TEMPLE.c, w = TEMPLE.wall, pal = { plaster: 'palace_wall', roof: 'tile_green', plinth: 'marble' };
  E.push({ t: 'lane', rect: [cx - w + 0.6, cz - w + 0.6, cx + w - 0.6, cz + w - 0.6], y: 0.03 });
  E.push({ t: 'qinian', c: [cx, cz], y: 0.03 });
  const wall = (a, b, gates = []) => E.push({ t: 'ming_wall', a, b, y: 0, h: 3.6, th: 1.0, gates, pal });
  const gp = { wood: 'paint_caihua', column: 'lacquer_red', soffit: 'paint_caihua', base: 'marble', floor: 'brick_paving', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'palace_wall', plinth: 'marble', roof: 'tile_green' };
  // the court's walls with a gate in the middle of each side (the inner wall had gates on four sides, §13), each under a gatehouse of three bays
  wall([cx - w, cz - w], [cx - 4, cz - w]); wall([cx + 4, cz - w], [cx + w, cz - w]);
  wall([cx + w, cz - w], [cx + w, cz - 4]); wall([cx + w, cz + 4], [cx + w, cz + w]);
  wall([cx - w, cz + w], [cx - w, cz + 4]); wall([cx - w, cz - 4], [cx - w, cz - w]);
  wall([cx - w, cz + w], [cx - 13, cz + w]); wall([cx + 13, cz + w], [cx + w, cz + w]);
  // (the gates: a passage 4 m wide under a hall on the wall, its leaves open into the court)
  for (const [x, z, front, rect, along, swing] of [[cx, cz - w, 'n', [cx - 5, cz - w - 1.6, cx + 5, cz - w + 1.6], 'x', 1], [cx + w, cz, 'e', [cx + w - 1.6, cz - 5, cx + w + 1.6, cz + 5], 'z', -1], [cx - w, cz, 'w', [cx - w - 1.6, cz - 5, cx - w + 1.6, cz + 5], 'z', 1]]) {
    E.push({ t: 'ming_wall', a: along === 'x' ? [x - 4, z] : [x, z - 4], b: along === 'x' ? [x + 4, z] : [x, z + 4], y: 0, h: 3.6, th: 1.0, gates: [{ at: 4, w: 4, h: 3.0 }], pal });
    E.push({ t: 'qing_hall', rect, y: 3.6, H: 3.0, roof: 'xieshan', bays: [3, 2], front, four: true, plat: 0.2, pal: gp, orn: { figures: 3 } });
    E.push({ t: 'gate_doors', at: [x, z], along, w: 4, h: 3.0, y: 0.03, swing, off: 0.5, nails: 7 });
  }
  // the Gate of Prayer for Good Harvests: a hall of five bays on a marble platform, its middle bays open
  E.push({ t: 'qing_hall', rect: [cx - 12, cz + w - 4, cx + 12, cz + w + 4], y: 1.2, H: 5.4, roof: 'xieshan', bays: [5, 2], front: 'n', four: true, plat: 1.2, open: true, orn: { figures: 7 }, pal: { wood: 'paint_caihua', column: 'lacquer_red', soffit: 'paint_caihua', base: 'marble', floor: 'brick_paving', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'palace_wall', plinth: 'marble', roof: 'tile_green' } });
  E.push({ t: 'stairs', rect: [cx - 3, cz + w - 8.4, cx + 3, cz + w - 4.9], y0: 0.03, y1: 1.2, dir: 's' });
  // the Danbi bridge-way (丹陛桥), §13/§29: the raised way south from the gate, 29 m wide, a marble-edged brick platform with the white stone Shendao
  // in the middle and a brick way on each side, a balustrade along each edge, steps across its south end, cypress rows either side
  const [dx0, dz0, dx1, dz1] = DANBI.rect, dy = DANBI.y, dxm = (dx0 + dx1) / 2;
  E.push({ t: 'block', walk: true, rect: [dx0, dz0, dx1, dz1], y0: 0, y1: dy - 0.1, mat: 'marble' });
  E.push({ t: 'block', walk: true, rect: [dx0 + 0.45, dz0, dx1 - 0.45, dz1 - 0.45], y0: dy - 0.1, y1: dy, mat: 'brick_paving' });
  E.push({ t: 'stone_way', rect: [dxm - 2.6, dz0, dxm + 2.6, dz1 - 0.45], y: dy, cols: [1.8, 1.8, 1.8], seed: 7 });
  for (const sx of [-1, 1]) {
    E.push({ t: 'block', walk: true, rect: [sx < 0 ? dxm - 7.3 : dxm + 5.3, dz0, sx < 0 ? dxm - 5.3 : dxm + 7.3, dz1 - 0.45], y0: dy, y1: dy + 0.02, mat: 'bluestone' });   // the Yudao (east) and Wangdao (west), each a brick strip
    E.push({ t: 'rail', a: [sx < 0 ? dx0 + 0.3 : dx1 - 0.3, dz0 + 0.5], b: [sx < 0 ? dx0 + 0.3 : dx1 - 0.3, dz1 - 1.5], y: dy });
  }
  E.push({ t: 'stairs', rect: [dxm - 12, dz1 - 0.45, dxm + 12, dz1 + 4.0], y0: 0.03, y1: dy, dir: 'n' });
  for (const sx of [-1, 1]) E.push({ t: 'bronze', kind: 'vat', at: [dxm + sx * 12.5, dz0 + 4], y: dy, s: 0.9 });
  // the paved plaza at the way's foot, a pair of stone lions at the stairs
  E.push({ t: 'lane', rect: [dx0 - 5, dz1, dx1 + 5, dz1 + 16], y: 0.03, mat: 'brick_paving' });
  for (const sx of [-1, 1]) E.push({ t: 'bronze', kind: 'lion', at: [dxm + sx * 14, dz1 + 8], y: 0.06, s: 0.85, face: [0, 1], metal: 'marble_smooth', paw: sx > 0 ? 'ball' : 'cub' });
  // the path in from the avenue to the west gate
  E.push({ t: 'lane', rect: [AVENUE[2] - 0.5, cz - 3, cx - w - 0.5, cz + 3], y: 0.035, mat: 'bluestone' });
  return { ...base('qing-beijing-temple', E), center: [cx, cz] };
}

/**
 * The traffic of the streets (§15): strings of camels bringing coal in sacks from the hills to the
 * west, each led by its drover; Peking carts with their blue tops, the carter at the beast's head;
 * on the avenue and the ring street people on foot.
 */
function traffic() {
  const T = [], L = [], rand = rng(1697);
  const man = (at, rot, extra = {}) => L.push({ t: 'figure', at, y: 0.03, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.6 ? 'robe' : 'trousers', cloth: ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_black'][Math.floor(rand() * 4)], cloth2: ['cloth_black', 'cloth_grey', 'cloth_indigo'][Math.floor(rand() * 3)], skin: 'skin_light', hat: rand() < 0.6 ? 'cap' : 'none', hair: 'short', ...extra });
  const face = ([dx, dz]) => Math.atan2(-dx, -dz);
  for (const [at, dir, n] of [[[6, 300], [0, -1], 6], [[-130, 201.5], [1, 0], 5], [[-200, 173.5], [-1, 0], 5], [[138, 20], [0, 1], 6], [[-6, 352], [0, -1], 5]]) {
    T.push({ t: 'camel_string', at, dir, n, y: 0.03, seed: Math.floor(rand() * 1e6) });
    // the drover walking at the head of the string, the lead rope in his hand; his mate at the tail
    man([at[0] + dir[0] * 2.3 + dir[1] * 0.6, at[1] + dir[1] * 2.3 - dir[0] * 0.6], face(dir), { dress: 'trousers', hat: rand() < 0.5 ? 'cap' : 'brim', carry: 'staff', pose: 'staff', len: 1.4, staffMat: 'timber', cloth: 'cloth_brown' });
    if (rand() < 0.6) man([at[0] - dir[0] * (2.9 * n + 0.4) + dir[1] * 0.7, at[1] - dir[1] * (2.9 * n + 0.4) - dir[0] * 0.7], face(dir), { dress: 'trousers', cloth: 'cloth_grey' });
  }
  for (const [at, dir] of [[[-5, 262], [0, -1]], [[6, 236], [0, 1]], [[100, 201.5], [1, 0]], [[-170, 115.5], [1, 0]], [[230, -58.5], [-1, 0]], [[-260, 231.5], [1, 0]], [[138, -60], [0, -1]]]) {
    const rot = face(dir);
    T.push({ t: 'peking_cart', at, rot, y: 0.03, seed: Math.floor(rand() * 1e6), beast: 'horse', coat: ['hide_black', 'hide_brown', 'hide_grey'][Math.floor(rand() * 3)] });
    // the carter standing at the beast's head, the whip in hand
    man([at[0] + dir[0] * 3.9 + dir[1] * 0.75, at[1] + dir[1] * 3.9 - dir[0] * 0.75], rot + Math.PI / 2 * (rand() < 0.5 ? 1 : -1), { dress: 'trousers', carry: 'staff', pose: 'staff', len: 1.6, staffMat: 'timber' });
  }
  return [{ ...base('qing-beijing-traffic', T), center: [0, 120] }, { ...base('qing-beijing-people', L), style: 'life', center: [0, 120] }];
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export async function town() { return [streets(), ...surfaces(), temple(), ...traffic(), ...courtyards(), ...shopStreet(), ...(await lifePlans())]; }
