// The city round the palace (docs/settlements/qing-beijing.md §6): the moat with its stone walls,
// the street round it and the avenue south from the Meridian Gate, the east–west lanes (hutong)
// and the north–south streets, and the grey-brick courtyard houses between the lanes, in plans of
// a few dozen each so that they build in turn.

import { RADIUS, LEVEL, MOAT, RING, AVENUE, NOTCH, TEMPLE, SHOP_APRONS, lanes, houses, houseTrees, shopRows, wells } from './layout.js';
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
  // the band between the moat and the palace wall, paved
  for (const r of [[c0, d0, c1, -194], [c0, 179, c1, d1], [c0, -194, -116, 179], [116, -194, c1, 179]]) E.push({ t: 'lane', rect: r, y: 0.03 });
  // the ring street, the avenue, the lanes
  for (const r of [[RING[0], RING[1], RING[2], b0], [RING[0], b1, -nx, RING[3]], [nx, b1, RING[2], RING[3]], [RING[0], b0, a0, b1], [a1, b0, RING[2], b1]]) E.push({ t: 'lane', rect: r, y: 0.03, mat: 'bluestone' });
  // the Meridian Gate's forecourt: the causeway across the south moat, paved with brick, with the stone way down its axis to the avenue
  E.push({ t: 'lane', rect: [-nx, d1 - 0.5, nx, RING[3]], y: 0.03, mat: 'brick_paving' });
  E.push({ t: 'lane', rect: [-3.6, d1 - 0.5, 3.6, RING[3] + 2], y: 0.06, mat: 'marble_floor' });
  E.push({ t: 'lane', rect: clip(AVENUE), y: 0.04, mat: 'bluestone' });
  for (const l of lanes()) { const r = clip(l); if (r) E.push({ t: 'lane', rect: r, y: 0.02, mat: l[2] - l[0] < 20 ? 'bluestone' : 'brick_paving' }); }
  return base('qing-beijing-streets', E);
}

/**
 * The courtyard houses (§5, §17): each with the gate of its rank; plans of 24 houses so that they build
 * in turn, near ones (full detail) apart from the far ones. The furnished ones (life.js) are chosen by layout.js furnishedHouses().
 */
function courtyards() {
  const all = [...houses()].sort((a, b) => (a.lod - b.lod) || (Math.atan2(a.rect[1], a.rect[0]) - Math.atan2(b.rect[1], b.rect[0]))), plans = [];
  const N = 24;
  for (let i = 0; i < all.length; i += N) {
    const part = all.slice(i, i + N);
    plans.push(base(`qing-beijing-houses-${i / N}`, part.map((h) => ({ t: 'hutong_house', rect: h.rect, seed: h.seed, gate: h.gate, courts: h.courts, wealth: h.wealth, lod: h.lod, trees: houseTrees(h).map((t) => [t[0], t[1]]) })), 'beijing-site'));
  }
  return plans;
}

/** The shop street (§16): the shops on the avenue's two sides, their yards, the wells of the lanes. */
function shopStreet() {
  const plans = [], rows = shopRows(), E = [];
  const apron = SHOP_APRONS.map((r) => ({ t: 'lane', rect: r, y: 0.04, mat: 'bluestone' }));
  const mk = (id, els) => plans.push(base(id, els, 'beijing-site'));
  mk('qing-beijing-shop-aprons', apron);
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
  wall([cx - w, cz - w], [cx + w, cz - w]);
  wall([cx + w, cz - w], [cx + w, cz + w]);
  wall([cx - w, cz + w], [cx - w, cz - w], [{ at: w, w: 4, h: 3.0 }]);
  wall([cx - w, cz + w], [cx - 13, cz + w]); wall([cx + 13, cz + w], [cx + w, cz + w]);
  E.push({ t: 'gate_doors', at: [cx - w, cz], along: 'z', w: 4, h: 3.0, y: 0.03, swing: 1, off: 0.5 });
  // the Gate of Prayer for Good Harvests: a hall of five bays on a marble platform, its middle bays open
  E.push({ t: 'qing_hall', rect: [cx - 12, cz + w - 4, cx + 12, cz + w + 4], y: 1.2, H: 5.4, roof: 'xieshan', bays: [5, 2], front: 'n', four: true, plat: 1.2, open: true, orn: { figures: 7 }, pal: { wood: 'paint_caihua', column: 'lacquer_red', soffit: 'paint_caihua', base: 'marble', floor: 'brick_paving', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'palace_wall', plinth: 'marble', roof: 'tile_yellow' } });
  for (const [z0, z1, dir] of [[cz + w - 8.4, cz + w - 4.9, 's'], [cz + w + 4.9, cz + w + 8.4, 'n']]) E.push({ t: 'stairs', rect: [cx - 3, z0, cx + 3, z1], y0: 0.03, y1: 1.2, dir });
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

export async function town() { return [streets(), temple(), ...traffic(), ...courtyards(), ...shopStreet(), ...(await lifePlans())]; }
