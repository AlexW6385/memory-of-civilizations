// The buildings of Karkh you can enter besides the shops (docs/settlements/abbasid-baghdad.md §12): the khan (a caravanserai: a gate to the street,
// a court with a pool and trees, cells of two kinds for the merchants and their goods round it, stables at the back, the doorman's rooms by
// the gate), the hammam (a changing hall, a warm room, a hot room with its marble platform and a dome), and the workshops of the bakers,
// coppersmiths and perfumers, single rooms on the street. Built in a local frame turned by the face; rooms are built by dress.js.
import { box, fromTriangles, lathe } from '../../core/geom.js';
import { local, wallRun, rng, domeShell, merlons, gardenTree } from './kit.js';
import { archway } from './palace.js';
import { buildRooms, furnish } from './dress.js';

const YAWS = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
export const KHAN = { W: 36, D: 40 };

/** The khan's rooms in its local frame (front +z). */
export function khanRooms() {
  const { W, D } = KHAN, hw = W / 2, hd = D / 2, out = [];
  const add = (name, [x0, z0, x1, z1], door, kinds) => {
    const alongZ = door === '+x' || door === '-x', len = alongZ ? z1 - z0 : x1 - x0, n = Math.max(1, Math.floor(len / (kinds[0] === 'stable' ? 6 : 4.6))), rl = len / n;
    for (let k = 0; k < n; k++) out.push({ id: `${name} ${k + 1}`, door, kind: kinds[k % kinds.length], k, n, rect: alongZ ? [x0, z0 + k * rl, x1, z0 + (k + 1) * rl] : [x0 + k * rl, z0, x0 + (k + 1) * rl, z1] });
  };
  add('khan west cell', [-hw + 1, -hd + 6, -hw + 6, hd - 6], '+x', ['bedroom', 'store', 'bedroom', 'bedroom', 'store', 'bedroom']);
  add('khan east cell', [hw - 6, -hd + 6, hw - 1, hd - 6], '-x', ['store', 'bedroom', 'bedroom', 'store', 'bedroom', 'bedroom']);
  add('khan stable', [-hw + 6, -hd + 1, hw - 6, -hd + 6], '+z', ['stable']);
  add('khan doorman west', [-hw + 6, hd - 6, -2.6, hd - 1], '-z', ['guard']); add('khan doorman east', [2.6, hd - 6, hw - 6, hd - 1], '-z', ['reception']);
  return out;
}
/** local rect → world rect for a building centred (cx, cz) turned by face. */
export function worldRect(face, [cx, cz], r) {
  const [x0, z0, x1, z1] = r;
  if (face === 's') return [cx + x0, cz + z0, cx + x1, cz + z1];
  if (face === 'n') return [cx - x1, cz - z1, cx - x0, cz - z0];
  if (face === 'e') return [cx - z1, cz + x0, cx - z0, cz + x1];
  return [cx + z0, cz - x1, cx + z1, cz - x0];
}

function khan(el, ctx) {
  const [cx, cz] = mid(el.rect), face = el.face || 's', y = el.y ?? 0, rand = rng(el.seed ?? 71), { W, D } = KHAN, hw = W / 2, hd = D / 2;
  local(ctx, [cx, cz], YAWS[face], (c) => {
    const { bag, col } = c, H = 8.0, mat = 'brick_baked';
    // the outer walls with a coping; the front with the gate (arch 4.2 × 5.6), the gate-hall's side walls
    wallRun(c, { a: [-hw, -hd + 0.5], b: [hw, -hd + 0.5], th: 1, y0: y, y1: y + H, mat }); wallRun(c, { a: [-hw + 0.5, -hd], b: [-hw + 0.5, hd], th: 1, y0: y, y1: y + H, mat }); wallRun(c, { a: [hw - 0.5, -hd], b: [hw - 0.5, hd], th: 1, y0: y, y1: y + H, mat });
    wallRun(c, { a: [-hw, hd - 0.5], b: [-2.1, hd - 0.5], th: 1, y0: y, y1: y + H, mat }); wallRun(c, { a: [2.1, hd - 0.5], b: [hw, hd - 0.5], th: 1, y0: y, y1: y + H, mat });
    for (const sx of [-1, 1]) wallRun(c, { a: [sx * 2.4, hd - 6], b: [sx * 2.4, hd], th: 0.6, y0: y, y1: y + H, mat });
    archway(c, { x: 0, w: 4.2, hh: 5.4, z0: hd - 1, z1: hd, top: y + H, mat: 'brick_baked', vault: 'plaster_white' });
    archway(c, { x: 0, w: 4.2, hh: 5.4, z0: hd - 6, z1: hd - 5, top: y + 6.4, mat: 'brick_buff', vault: 'plaster_white', ring: false });
    bag.add('mud_plaster', box(-2.4, y + 6.4, hd - 6, 2.4, y + 6.54, hd - 1));
    for (const [a, b] of [[[-hw, -hd + 0.5], [hw, -hd + 0.5]], [[-hw + 0.5, -hd], [-hw + 0.5, hd]], [[hw - 0.5, -hd], [hw - 0.5, hd]], [[-hw, hd - 0.5], [-2.4, hd - 0.5]], [[2.4, hd - 0.5], [hw, hd - 0.5]]]) merlons(bag, mat, a, b, 1, y + H, { w: 0.8, gap: 0.7, h: 0.9 });
    // the corners behind the ranges: solid blocks (the stairs to the roof and the privies)
    for (const sx of [-1, 1]) { bag.add('brick_buff', box(sx * (hw - 3.5) - 2.5, y, -hd + 1, sx * (hw - 3.5) + 2.5, y + 6.5, -hd + 6)); col.rect([sx * (hw - 3.5) - 2.5, -hd + 1, sx * (hw - 3.5) + 2.5, -hd + 6], y, y + 6.5); }
    buildRooms(c, khanRooms(), { y, RH: 6.2, TOP: 7.6, ceil: 4.6, floor: 'brick_paving', rand, mat: 'brick_buff', lightEvery: 3 });
    // the court: paving, a pool with a rim, four trees in pits, the trough at the back, a well
    bag.add('brick_paving', box(-hw + 6, y - 0.2, -hd + 6, hw - 6, y + 0.02, hd - 6)); bag.add('brick_paving', box(-2.4, y - 0.2, hd - 6, 2.4, y + 0.02, hd));
    bag.add('limestone', box(-2.6, y, -2.6, 2.6, y + 0.5, 2.6)); bag.add('water', fromTriangles([-2.2, y + 0.36, -2.2, -2.2, y + 0.36, 2.2, 2.2, y + 0.36, 2.2, -2.2, y + 0.36, -2.2, 2.2, y + 0.36, 2.2, 2.2, y + 0.36, -2.2])); col.rect([-2.6, -2.6, 2.6, 2.6], y, y + 0.5);
    for (const [tx, tz] of [[-8, -9], [8, -9], [-8, 9], [8, 9]]) { bag.add('limestone', box(tx - 1.1, y, tz - 1.1, tx + 1.1, y + 0.2, tz + 1.1)); gardenTree(bag, col, tx, tz, y + 0.2, 3.4, 1.5, false); }
    for (const sx of [-1, 1]) { bag.add('limestone', box(sx * 6 - 1.5, y, hd - 8, sx * 6 + 1.5, y + 0.5, hd - 7.4)); col.rect([sx * 6 - 1.5, hd - 8, sx * 6 + 1.5, hd - 7.4], y, y + 0.5); }
    // the sign over the gate: a board
    bag.add('cedar', box(-1.8, y + 6.0, hd + 0.02, 1.8, y + 6.7, hd + 0.08)); bag.add('plaster_white', box(-1.7, y + 6.1, hd + 0.08, 1.7, y + 6.6, hd + 0.1));
    for (let k = 0; k < 5; k++) bag.add('lacquer_black', box(-1.4 + k * 0.6, y + 6.25, hd + 0.1, -1.2 + k * 0.6, y + 6.45 + (k % 2) * 0.05, hd + 0.105));
  });
}

export const HAMMAM = { W: 14, D: 26 };
export function hammamRooms() {
  const { W, D } = HAMMAM, hw = W / 2, hd = D / 2;
  return [{ id: 'hammam changing hall', rect: [-hw + 0.5, hd - 8, hw - 0.5, hd - 0.5], kind: 'reception', door: '+z' }, { id: 'hammam warm room', rect: [-hw + 0.5, hd - 16, hw - 0.5, hd - 8.5], kind: 'bath', door: '+z' }, { id: 'hammam hot room', rect: [-hw + 0.5, -hd + 0.5, hw - 0.5, hd - 16.5], kind: 'bath', door: '+z' }];
}
function hammam(el, ctx) {
  const [cx, cz] = mid(el.rect), face = el.face || 's', y = el.y ?? 0, rand = rng(el.seed ?? 88), { W, D } = HAMMAM, hw = W / 2, hd = D / 2;
  local(ctx, [cx, cz], YAWS[face], (c) => {
    const { bag } = c, H = 4.8, mat = 'brick_baked';
    wallRun(c, { a: [-hw, hd - 0.4], b: [hw, hd - 0.4], th: 0.8, y0: y, y1: y + H, mat, ops: [{ at: hw, w: 2.0, h: 3.4 }, { at: hw - 3.6, w: 0.7, h: 0.8, y0: y + 2.0, flat: true }, { at: hw + 3.6, w: 0.7, h: 0.8, y0: y + 2.0, flat: true }] });
    wallRun(c, { a: [-hw + 0.4, -hd], b: [-hw + 0.4, hd], th: 0.8, y0: y, y1: y + H, mat }); wallRun(c, { a: [hw - 0.4, -hd], b: [hw - 0.4, hd], th: 0.8, y0: y, y1: y + H, mat }); wallRun(c, { a: [-hw, -hd + 0.4], b: [hw, -hd + 0.4], th: 0.8, y0: y, y1: y + H, mat });
    for (const zz of [hd - 8.25, hd - 16.25]) wallRun(c, { a: [-hw, zz], b: [hw, zz], th: 0.5, y0: y, y1: y + H, mat: 'brick_buff', ops: [{ at: hw, w: 1.5, h: 2.5 }] });
    bag.add('mud_plaster', box(-hw, y + H, -hd, hw, y + H + 0.16, hd)); bag.add('timber', box(-hw + 0.8, y + 4.0, -hd + 0.8, hw - 0.8, y + 4.14, hd - 0.8)); bag.add('marble_floor', box(-hw, y - 0.2, -hd, hw, y + 0.03, hd));
    for (const [z, r] of [[-hd + 6.2, 3.6], [hd - 12.2, 2.6], [hd - 4.2, 3.0]]) domeShell(bag, 'plaster_white', 0, z, r, y + H + 0.16, { pointed: 0.12, seg: 16, rows: 5 });
    for (const [z] of [[-hd + 6.2], [hd - 12.2], [hd - 4.2]]) for (let k = 0; k < 4; k++) bag.add('daylight', box(-1.6 + k * 1.05, y + H + 0.17, z - 0.3, -1.35 + k * 1.05, y + H + 0.22, z - 0.05));
    for (const rm of hammamRooms()) furnish(c, rm.kind, rm.rect, rm.door, y + 0.03, 4.0, rand, { light: false });
    bag.add('cedar', box(-1.5, y + 3.5, hd + 0.02, 1.5, y + 4.1, hd + 0.08)); bag.add('plaster_white', box(-1.4, y + 3.58, hd + 0.08, 1.4, y + 4.02, hd + 0.1));
    for (let k = 0; k < 4; k++) bag.add('lacquer_black', box(-1.1 + k * 0.6, y + 3.7, hd + 0.1, -0.9 + k * 0.6, y + 3.9, hd + 0.105));
    c.lights.push({ at: [0, y + 3.4, hd - 4], color: '#ffc27a', intensity: 3, distance: 9 });
  });
}

/** abbasid_workshop: { rect, face, kind: 'bakery' | 'perfumer' | 'coppersmith' | 'potter', seed } — one room on the street with a wide door. */
export const WORK = { bakery: 'bakery', perfumer: 'perfumer', coppersmith: 'coppersmith', potter: 'workshop' };
function workshop(el, ctx) {
  const [cx, cz] = mid(el.rect), face = el.face || 's', y = el.y ?? 0, rand = rng(el.seed ?? 9);
  const turned = face === 's' || face === 'n', w = turned ? el.rect[2] - el.rect[0] : el.rect[3] - el.rect[1], d = turned ? el.rect[3] - el.rect[1] : el.rect[2] - el.rect[0], hw = w / 2, hd = d / 2;
  local(ctx, [cx, cz], YAWS[face], (c) => {
    const { bag } = c, rect = [-hw, -hd, hw, hd];
    buildRooms(c, [{ rect, door: '+z', kind: WORK[el.kind] ?? 'workshop', k: 0, n: 1, doorW: 3.0, doorH: 3.0 }], { y, RH: 4.4, TOP: 5.4, ceil: 3.8, floor: 'brick_paving', rand, mat: 'brick_buff', back: true, lightEvery: 1 });
    bag.add('cedar', box(-1.6, y + 4.2, hd + 0.02, 1.6, y + 4.9, hd + 0.08)); bag.add('plaster_white', box(-1.5, y + 4.28, hd + 0.08, 1.5, y + 4.82, hd + 0.1));
    for (let k = 0; k < 4; k++) bag.add('lacquer_black', box(-1.2 + k * 0.65, y + 4.4, hd + 0.1, -0.95 + k * 0.65, y + 4.65, hd + 0.105));
    bag.add('limestone', box(-1.5, y, hd - 0.1, 1.5, y + 0.1, hd + 0.5)); void lathe;
  });
}
export const khanElements = { abbasid_khan: khan, abbasid_hammam: hammam, abbasid_workshop: workshop };
