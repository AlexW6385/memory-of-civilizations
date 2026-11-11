// The town's houses (docs/settlements/cahokia.md §5), four of them opened and furnished (§5.1), and the
// life of the plaza and the yards (§5.2): chunkey played on the plaza's yards with the crowd along
// their banks, people on the ramp up Monks Mound, women at work at the house doors, dogs.
import { RADIUS, PLAZA, SUMMIT, CREEK, lots, gaps, height, onMound, inLot, inRect, inPond, inCreek, creekZ, smallPlazas, inSmallPlaza } from './layout.js';
import { HOUSE_KINDS } from '../../styles/mississippian/dress.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const base = (id, elements, style = 'mississippian') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-25, -5], facing: 'n' } });
const dist0 = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 + 25, (l.rect[1] + l.rect[3]) / 2 + 5);
let OPEN = null;
/** The houses that can be walked into: the 26 nearest the ramp below Monks Mound, and about one in ten of the rest within 230 m, to about 56. */
export function openSet() {
  if (OPEN) return OPEN;
  const L = lots(), order = L.map((l, k) => [k, dist0(l)]).sort((a, b) => a[1] - b[1]).map(([k]) => k);
  OPEN = new Map();
  order.slice(0, 26).forEach((k, i) => OPEN.set(k, i < 4 ? 'cook' : HOUSE_KINDS[(L[k].seed >> 3) % HOUSE_KINDS.length]));
  for (const k of order.slice(26)) { if (OPEN.size >= 56 || dist0(L[k]) > 230) break; if (L[k].seed % 9 === 0) OPEN.set(k, HOUSE_KINDS[(L[k].seed >> 3) % HOUSE_KINDS.length]); }
  return OPEN;
}
const near = () => [...openSet().keys()].slice(0, 4);
export async function houses() {
  const all = lots().map((l) => ({ ...l, g: height }));
  for (const [k, kind] of openSet()) { all[k].open = true; all[k].kind = kind; }
  const plans = [];
  for (let i = 0; i < all.length; i += 150) plans.push(base(`cahokia-houses-${i / 150}`, all.slice(i, i + 150).map((l) => ({ t: 'miss_house', ...l }))));
  return [...plans, ...yards(all), ...fences(all), ...fillers(), ...plazaGoods(), ...fieldsAndCreek(), base('cahokia-people', life(), 'life')];
}

const clearYard = (r, m = 0.6) => ![[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2]].some(([x, z]) => onMound(x, z) || inLot(x, z, m) || inSmallPlaza(x, z, 2) || inPond(x, z, 3) || inRect(PLAZA, x, z, 2));
/** The courtyard fences: about two houses in five (within 280 m) have a wattle fence round the yard before the door, a gap for the gate. */
function fences(all) {
  const rand = rng(2024), E = [];
  for (const l of all) {
    if (l.open || l.lod > 1 || rand() > 0.42) continue;
    const [x0, z0, x1, z1] = l.rect, mx = (x0 + x1) / 2, sg = l.door === 'n' ? -1 : 1, f = sg < 0 ? z0 : z1, dep = 2.2, xa = x0 - 0.7, xb = x1 + 0.7, zf = f + sg * dep;
    const yard = [xa, Math.min(f, zf), xb, Math.max(f, zf)];
    if (!clearYard(yard, 0.8)) continue;
    E.push({ t: 'wattle_fence', pts: [[xa, f + sg * 0.3], [xa, zf], [mx - 0.8, zf]], y: height }, { t: 'wattle_fence', pts: [[mx + 0.8, zf], [xb, zf], [xb, f + sg * 0.3]], y: height });
  }
  const out = [];
  for (let i = 0; i < E.length; i += 160) out.push(base(`cahokia-fences-${i / 160}`, E.slice(i, i + 160)));
  return out;
}
/** The empty cells of the grid, filled: a lone granary, a yard fire, a garden, a woodpile, a rack of maize. */
let FILL = null;
/** The yards' fillers as plan elements (cached: the smoke and the fauna read them too). */
export function fillerList() {
  if (FILL) return FILL;
  const E = [];
  for (const g of gaps()) {
    const [cx, cz] = g.c;
    if (Math.hypot(cx, cz) > 250 || inSmallPlaza(cx, cz, 4)) continue;
    const k = g.seed % 6, r = [cx - 2.4, cz - 2.4, cx + 2.4, cz + 2.4];
    if (!clearYard(r, 0.2)) continue;
    if (k === 0) E.push({ t: 'granary', c: [cx, cz], y: height, s: 2.2 + (g.seed % 5) * 0.1, seed: g.seed });
    else if (k === 1) E.push({ t: 'yard_fire', c: [cx, cz], y: height, seed: g.seed });
    else if (k === 2) E.push({ t: 'garden', rect: [cx - 2.4, cz - 1.8, cx + 2.4, cz + 1.8], y: height, seed: g.seed });
    else if (k === 3) E.push({ t: 'woodpile', c: [cx, cz], y: height, rot: (g.seed % 2) * 1.57, seed: g.seed });
    else if (k === 4) E.push({ t: 'drying_rack', rect: [cx - 2.4, cz - 0.3, cx + 2.4, cz + 0.3], y: height, kind: g.seed % 3 ? 'maize' : 'fish', seed: g.seed });
    else E.push({ t: 'craft_arbor', rect: [cx - 1.6, cz - 1.2, cx + 1.6, cz + 1.2], y: height, trade: g.seed % 2 ? 'pottery' : 'shell', seed: g.seed });
  }
  return (FILL = E);
}
function fillers() {
  const E = fillerList(), out = [];
  for (let i = 0; i < E.length; i += 120) out.push(base(`cahokia-fill-${i / 120}`, E.slice(i, i + 120)));
  return out;
}
export const PLAZA_STALLS = [[-105, -14, 'shell'], [-105, 28, 'pots'], [-105, 48, 'chert'], [-105, 90, 'hides'], [-105, 112, 'salt'], [105, -14, 'copper'], [105, 28, 'maize'], [105, 48, 'pots'], [105, 90, 'shell'], [105, 112, 'hides'], [-60, 138, 'maize'], [-20, 138, 'chert'], [20, 138, 'salt'], [60, 138, 'copper'], [-60, -28, 'pots'], [60, -28, 'hides']];
export const PLAZA_ARBORS = [[28, 31, 34, 36], [-65, 104, -59, 109], [73, 120, 79, 125]];
/** The Grand Plaza's trade and shade: the traders' mats under hide awnings along its edges, the arbors by the chunkey yards. */
function plazaGoods() {
  const E = PLAZA_STALLS.map(([x, z, kind], i) => ({ t: 'trade_mat', c: [x, z], y: 0, rot: x === -105 ? 0 : x === 105 ? 0 : 1.57, kind, seed: 50 + i }));
  for (const [x0, z0, x1, z1] of PLAZA_ARBORS) E.push({ t: 'shade_arbor', rect: [x0, z0, x1, z1], y: 0 });
  return [base('cahokia-plaza', E)];
}
const FIELD_CELLS = [34, 26];
/** The fields of maize beyond the houses, and the life of the creek: landings with their canoes, the net and the fish racks, a weir. */
export function fieldRects() {
  const out = [];
  for (let i = -14; i < 14; i++) for (let j = -16; j < 16; j++) {
    if (!((i + j) & 1)) continue;
    const x0 = i * FIELD_CELLS[0] + 2, z0 = j * FIELD_CELLS[1] + 2, x1 = x0 + FIELD_CELLS[0] - 4, z1 = z0 + FIELD_CELLS[1] - 4, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, d = Math.hypot(cx, cz);
    if (d < 310 || d > RADIUS - 24 || Math.abs(cz - creekZ(cx)) < CREEK.w / 2 + 30 || cz < -330) continue;
    const r = [x0, z0, x1, z1];
    if (!clearYard(r, 4)) continue;
    out.push({ r, d });
  }
  return out.sort((a, b) => a.d - b.d).slice(0, 18).map((o) => o.r);
}
export const LANDINGS = [-150, 35, 190];
function fieldsAndCreek() {
  const E = fieldRects().map((r, i) => ({ t: 'field', rect: r, y: height, seed: 300 + i }));
  const C = [];
  for (const x of LANDINGS) {
    const z = creekZ(x) + CREEK.w / 2 + 2.6;
    C.push({ t: 'landing', c: [x, z], y: height, rot: -Math.PI / 2, seed: x });
    C.push({ t: 'dugout', c: [x + 2.6, creekZ(x + 2.6) + 7.8], y: CREEK.level, rot: 1.35, len: 5.4, seed: x + 1 });
    C.push({ t: 'dugout', c: [x - 3.4, creekZ(x - 3.4) + 8.4], y: CREEK.level, rot: 1.6, len: 4.6, seed: x + 2 });
    C.push({ t: 'dugout', c: [x + 8, creekZ(x + 8) - 1], y: CREEK.level, rot: 0.2, len: 5.8, seed: x + 3 });
  }
  C.push({ t: 'weir', c: [62, creekZ(62)], tip: [0, 0], a: [48, creekZ(48) - 9.5], b: [48, creekZ(48) + 9.5], y: CREEK.level });
  return [base('cahokia-fields', E), base('cahokia-creek-life', C)];
}

/**
 * The neighbourhoods' furnishings: round each small plaza the fire ring, benches and post, two
 * granaries, a rack of maize and one of hides or fish, an arbor for the shell-bead makers or the
 * potters; and a garden plot behind some of the houses.
 */
function yards(all) {
  const rand = rng(1176), P = smallPlazas(), E = [], G = [];
  P.forEach((p, i) => {
    const [cx, cz] = p.c, r = (k) => ((p.seed >> k) & 7) / 7;
    E.push({ t: 'small_plaza', c: p.c, y: height, seed: p.seed });
    E.push({ t: 'granary', c: [cx - 6, cz - 5.5], y: height, s: 2.2 + r(1) * 0.5, seed: p.seed });
    E.push({ t: 'granary', c: [cx + 6, cz + 5.5], y: height, s: 2.2 + r(3) * 0.5, seed: p.seed + 1 });
    E.push({ t: 'drying_rack', rect: [cx - 5, cz + 5.6, cx - 0.5, cz + 6.2], y: height, kind: 'maize', seed: p.seed });
    E.push({ t: 'drying_rack', rect: [cx - 7.4, cz - 1.5, cx - 6.8, cz + 3], y: height, kind: r(5) < 0.5 ? 'hide' : 'fish', seed: p.seed + 2 });
    E.push({ t: 'craft_arbor', rect: [cx + 3.4, cz - 6.8, cx + 6.8, cz - 4.2], y: height, trade: i % 2 ? 'pottery' : 'shell', seed: p.seed });
  });
  for (const l of all) {
    if (l.open || Math.hypot(l.rect[0], l.rect[1]) > 230 || rand() > 0.3) continue;
    const [x0, z0, x1, z1] = l.rect, cz = (z0 + z1) / 2, r = [x1 + 1.2, cz - 2, x1 + 5.4, cz + 2];
    if (onMound(r[2], cz) || inLot(r[0], r[1], 0.5) || inLot(r[2], r[3], 0.5) || inLot((r[0] + r[2]) / 2, cz, 0.5) || inSmallPlaza(r[2], cz, 8)) continue;
    G.push({ t: 'garden', rect: r, y: height, seed: l.seed });
  }
  const out = [];
  for (let i = 0; i < E.length; i += 200) out.push(base(`cahokia-yards-${i / 200}`, E.slice(i, i + 200)));
  for (let i = 0; i < G.length; i += 60) out.push(base(`cahokia-gardens-${i / 60}`, G.slice(i, i + 60)));
  return out;
}

/** The people and dogs. Men in the breechcloth, some with a mantle of skin; women in a wrap skirt of woven fibre with a mantle over the shoulders [inferred]. */
function life() {
  const rand = rng(1175), E = [];
  const skin = () => (rand() < 0.7 ? 'skin_medium' : 'skin_dark');
  const man = (at, y, rot, o = {}) => { const sk = skin(), cape = rand() < 0.25; E.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'loincloth', cloth: 'hide_tan', cloth2: cape ? 'hide_brown' : 'hide_tan', over: cape ? 'cape' : 'none', skin: sk, hat: 'none', feet: 'shod', hair: rand() < 0.5 ? 'topknot' : 'bun', beard: false, ...o }); };
  const woman = (at, y, rot, o = {}) => E.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: ['cloth_brown', 'hide_tan', 'cloth_ochre', 'cloth_black'][Math.floor(rand() * 4)], cloth2: 'hide_tan', over: rand() < 0.6 ? 'shawl' : 'none', skin: skin(), hat: 'none', feet: 'shod', hair: 'long', beard: false, ...o });
  // chunkey: at the head of each yard two players with their poles, one stone rolling down it; the crowd along the banks
  for (const [r, axis] of [[[12, 20, 48, 24], 'x'], [[-80, 92, -44, 96], 'x'], [[58, 104, 62, 140], 'z']]) {
    const [x0, z0, x1, z1] = r, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const head = axis === 'x' ? [x0 + 3, cz] : [cx, z0 + 3], down = axis === 'x' ? [x1, cz] : [cx, z1];
    for (const s of [-0.7, 0.7]) { const at = axis === 'x' ? [head[0], cz + s] : [cx + s, head[1]]; man(at, 0, face(at, down), { carry: 'pole', len: 1.8, pose: 'stand', over: 'none' }); }
    const n = 22;
    for (let k = 0; k < n; k++) {
      const f = 0.05 + 0.9 * k / n + (rand() - 0.5) * 0.02, side = k % 2 ? 1 : -1, off = 2.6 + rand() * 1.2;
      const at = axis === 'x' ? [x0 + (x1 - x0) * f, (side > 0 ? z1 : z0) + side * off] : [(side > 0 ? x1 : x0) + side * off, z0 + (z1 - z0) * f];
      const look = axis === 'x' ? [at[0], cz] : [cx, at[1]];
      (rand() < 0.65 ? man : woman)(at, 0, face(at, look) + (rand() - 0.5) * 0.5, rand() < 0.3 ? { pose: 'squat' } : rand() < 0.3 ? { pose: 'talk' } : {});
    }
  }
  // people on the plaza and on the ramp up the mound
  for (let k = 0; k < 60; k++) {
    const x = PLAZA[0] + 8 + rand() * (PLAZA[2] - PLAZA[0] - 16), z = PLAZA[1] + 8 + rand() * (PLAZA[3] - PLAZA[1] - 16);
    if (E.some((e) => Math.hypot(e.at[0] - x, e.at[1] - z) < 2.5) || Math.hypot(x, z - 55) < 3) continue;
    (rand() < 0.5 ? man : woman)([x, z], 0, rand() * 6.28, rand() < 0.3 ? { carry: 'basket' } : {});
  }
  for (const z of [-44, -52, -61, -70, -112, -125, -138]) { const at = [-25 + (rand() - 0.5) * 3, z]; man(at, height(at[0], at[1]), (rand() < 0.7 ? 0 : Math.PI) + (rand() - 0.5) * 0.3); }
  // at the open houses: the household at its work inside, another at the mortar or the pots by the door
  const L = lots();
  for (const [k, kind] of openSet()) {
    const l = L[k], [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, F = l.y + 0.04, dd = height;
    const at = kind === 'cook' ? [cx - 0.75, cz + 0.6] : kind === 'weaver' ? [cx + 0.3, z0 + 1.5] : kind === 'knapper' ? [x0 + 1.45, z0 + 2.2] : kind === 'shell' ? [cx - 0.4, z0 + 1.45] : kind === 'drum' ? [x0 + 1.4, z0 + 1.9] : [cx - 0.75, cz + 0.6];
    const look = kind === 'weaver' || kind === 'shell' ? [at[0], z0] : kind === 'knapper' ? [x0, at[1]] : [cx, cz + 0.15];
    (kind === 'knapper' || kind === 'drum' ? man : woman)(at, F, face(at, look), { pose: kind === 'cook' ? 'kneel' : kind === 'weaver' ? 'squat' : 'cross', over: 'none' });
    if (kind === 'cook' && rand() < 0.5) { const a2 = [cx + 1.1, cz - 0.4]; woman(a2, F, face(a2, [cx, cz]), { pose: 'squat', over: 'none' }); }
    const d = [cx - 1.6, z1 + 1.4]; (rand() < 0.5 ? woman : man)(d, dd(d[0], d[1]), face(d, [cx + 3, z1 + 6]), { pose: rand() < 0.5 ? 'squat' : 'stand' });
  }
  // the chief on his seat on the summit, his attendants either side; the people of the small plazas: the bead maker and the potter at their mats, others at the fire and the racks
  { const hx = (SUMMIT[0] + SUMMIT[2]) / 2, hz = SUMMIT[1] + 20 + 0.5 + 1.6, F = height(hx, hz + 6) + 0.04;
    man([hx, hz], F + 0.6, Math.PI, { pose: 'sit', over: 'cape', cloth: 'cloth_white', cloth2: 'hide_white', hair: 'topknot', carry: 'staff', len: 1.4 });
    for (const sd of [-1, 1]) man([hx + sd * 2.6, hz + 0.3], F + 0.55, Math.PI + sd * 0.2, { pose: 'stand', over: 'cape', cloth2: 'hide_brown' }); }
  smallPlazas().forEach((pl, i) => {
    if (Math.hypot(pl.c[0], pl.c[1]) > 250) return;
    const [cx, cz] = pl.c, y = (x, z) => height(x, z);
    const ax = cx + 5.1, az = cz - 5.6;                                       // the arbor's mat
    (i % 2 ? man : woman)([ax - 0.3, az - 0.4], y(ax, az) + 0.04, face([ax, az], [ax + 0.5, az + 0.2]), { pose: 'cross', over: 'none' });
    for (const [dx, dz, w] of [[1.6, 0.8, 1], [-1.8, 1.2, 0], [0.3, -1.9, 1]]) { const at = [cx + dx, cz + dz]; (w ? woman : man)(at, y(at[0], at[1]), face(at, [cx, cz]), { pose: 'squat', over: 'none' }); }
    const rk = [cx - 2.7, cz + 6.9]; woman(rk, y(rk[0], rk[1]), Math.PI, { carry: 'basket' });
  });
  // round the other houses, here and there: people at the door, pots, firewood, a dog
  let n = 0;
  for (const l of L) {
    if (n > 300) break;
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, r = rand();
    if (r > 0.3) continue;
    const at = [x1 + 1.3, (z0 + z1) / 2 + (rand() - 0.5) * 2];
    if (onMound(at[0], at[1]) || inLot(at[0], at[1], 0.8)) continue;
    const y = height(at[0], at[1]); n++;
    const q = rand();
    if (q < 0.35) (rand() < 0.6 ? woman : man)(at, y, rand() * 6.28, rand() < 0.4 ? { pose: 'squat' } : {});
    else if (q < 0.55) E.push({ t: 'pot', kind: 'dark_pot', n: 2 + Math.floor(rand() * 2), at, y, seed: n });
    else if (q < 0.75) E.push({ t: 'firewood', at, y, rot: rand() * 3, len: 1.5, seed: n });
    else if (q < 0.85) E.push({ t: 'basket', n: 2, at, y, seed: n, goods: 'cloth_ochre' });
    else E.push({ t: 'animal', kind: 'dog', at, y, rot: rand() * 6.28, seed: n });
    void cx;
  }
  // the traders on the plaza, each on her mat with a customer; people in the arbors
  PLAZA_STALLS.forEach(([x, z], i) => {
    const t = [x - 0.2, z + 0.9], c = [x + (x < 0 ? 2.4 : -2.4), z + 0.6];
    (i % 3 ? woman : man)(t, 0, face(t, [x, z - 4]), { pose: 'squat', over: 'none' });
    (i % 2 ? man : woman)(c, 0, face(c, [x, z]), { carry: i % 4 ? 'basket' : 'none' });
  });
  for (const [x0, z0, x1, z1] of PLAZA_ARBORS) for (const [dx, dz] of [[1.2, 0.9], [4.0, 0.9], [2.4, 3.9]]) { const at = [x0 + dx, z0 + dz]; (rand() < 0.5 ? man : woman)(at, 0, rand() * 6.28, { pose: rand() < 0.6 ? 'squat' : 'talk' }); void x1; void z1; }
  // the fishers, the washers and the net-menders at the creek
  for (const x of LANDINGS) {
    const zc = creekZ(x), px = x + 8, pz = creekZ(px) - 1;
    man([px, pz], CREEK.level + 0.12, 1.5, { pose: 'punt', carry: 'punt', len: 3.2, over: 'none' });
    woman([x - 1.0, zc + CREEK.w / 2 + 4.0], height(x - 1.0, zc + CREEK.w / 2 + 4.0), -Math.PI / 2, { pose: 'kneel', over: 'none' });
    const nm = [x - 2.0, zc + CREEK.w / 2 + 0.6]; man(nm, height(nm[0], nm[1]), 1.57, { pose: 'squat', over: 'none' });
    const fr = [x, zc + CREEK.w / 2 + 6.4]; woman(fr, height(fr[0], fr[1]), 3.14, { pose: 'stand', carry: 'basket' });
  }
  for (let k = 0; k < 10; k++) { const at = [PLAZA[0] + 10 + rand() * 200, PLAZA[1] + 10 + rand() * 170]; E.push({ t: 'animal', kind: 'dog', at, y: 0, rot: rand() * 6.28, seed: 100 + k }); }
  return E;
}
