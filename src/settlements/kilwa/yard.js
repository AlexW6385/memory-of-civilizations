// Kilwa about 1330 — the open ground of the town (docs/settlements/kilwa.md §18): the Great Mosque's forecourt with its
// ablution tank, worshippers, a drum and a flute at the evening, palms; the graveyard east of the mosque with its slab
// and pillar tombs; benches against the lane walls; Husuni Kubwa's courts with the sultan on his pavilion, courtiers
// on mats, guards, servants at the well; the beach with fish-drying racks, net-menders, children and canoes at the
// shallows. Returns { S: swahili-style elements, L: life-style elements }; every place is derived from layout.js.
import { MOSQUE, MOSQUE_STREET, LANES, COURTS, PY, SEA, height, inLot, inSea } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
const shoreAt = (x) => -120 - 15 * Math.sin(x / 60);
let CACHE = null;
export function yard() {
  if (CACHE) return CACHE;
  const S = [], L = [], rand = rng(1802), pick = (a) => a[Math.floor(rand() * a.length)];
  const fig = (at, y, face, o = {}) => L.push({ t: 'figure', at, y, rot: faceTo(at, face), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(['cloth_white', 'cloth_white', 'cloth_indigo', 'cloth_ochre']), cloth2: 'cloth_white', skin: pick(['skin_dark', 'skin_dark', 'skin_medium']), hat: 'cap', hatMat: 'cloth_white', hair: 'short', hairMat: 'hair_dark', beard: rand() < 0.4, feet: 'bare', over: pick(['sash', 'none']), carry: 'none', pose: 'stand', ...o });
  const woman = (at, y, face, o = {}) => fig(at, y, face, { dress: 'wrap', hat: 'veil', over: 'shawl', hair: 'bun', beard: false, cloth: pick(['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_maroon']), cloth2: 'cloth_white', h: 0.93, ...o });
  const child = (at, y, face, o = {}) => fig(at, y, face, { dress: 'wrap', top: 'bare', hat: 'none', over: 'none', h: 0.6 + rand() * 0.1, cloth: 'cloth_white', beard: false, ...o });
  const [mx0, mz0, mx1, mz1] = MOSQUE, my = height(-10, 15);

  // ---- the mosque's forecourt (between the mosque street and the north wall)
  const zt = MOSQUE_STREET[3] + 3.4;
  S.push({ t: 'swahili_tank', rect: [-5, zt, -0.8, zt + 2.2], y: height(-3, zt + 1) });
  for (const x of [-34, -2, 12]) S.push({ t: 'swahili_bench', rect: [x, MOSQUE_STREET[3] + 0.5, x + 2.2, MOSQUE_STREET[3] + 1.0], y: height(x, MOSQUE_STREET[3] + 0.7) });
  for (const [x, z] of [[-47, -20], [27.5, -20], [-46, 45], [26, 46], [-47, 12], [27, 20]]) S.push({ t: 'coconut_palm', at: [x, z], y: height(x, z) - 0.1, h: 12 + rand() * 6, lean: 1 + rand() * 1.5, dir: rand() * 6.28, seed: Math.floor(rand() * 1e6) });
  // worshippers coming to the doors, an imam in a long robe, men talking, boys with a jar from the tank
  for (let k = 0; k < 9; k++) { const x = -34 + k * 6 + rand() * 3, z = mz0 - 4 - rand() * 6; fig([x, z], height(x, z), [x, mz0], { pose: k % 3 === 0 ? 'talk' : 'stand', over: 'none', hat: pick(['cap', 'cap', 'turban']), carry: rand() < 0.2 ? 'staff' : 'none' }); }
  fig([-3.5, zt + 3.4], height(-3.5, zt + 3.4), [-3, zt + 1], { pose: 'kneel', over: 'none' });
  child([0.8, zt + 1.2], height(0.8, zt + 1.2), [-3, zt + 1], { pose: 'stand' });
  // the evening's music before the mosque street: a drum (ngoma), a flute (zumari), the listeners on mats
  { const cx = -26, cz = MOSQUE_STREET[3] + 6.5, y = height(cx, cz);
    fig([cx, cz], y, [cx + 3, cz], { pose: 'drum', over: 'none', hat: 'cap' });
    fig([cx + 1.4, cz + 0.6], y, [cx + 3, cz], { pose: 'flute', over: 'none', hat: 'turban' });
    for (let k = 0; k < 4; k++) fig([cx + 3.2 + (k % 2) * 0.9, cz - 0.9 + k * 0.7], y, [cx, cz], { pose: 'cross', over: 'none' });
    L.push({ t: 'goods_mat', goods: ['baskets'], at: [cx + 3.7, cz], y, rot: 0, seed: 77 }); }
  // ---- inside the hall: rows of worshippers kneeling toward the qibla (north), men reciting on the mats by the walls
  { const nx = Math.floor((mx1 - mx0) / 4.6), nz = Math.floor((mz1 - mz0) / 4.6), sx = (mx1 - mx0) / nx, sz = (mz1 - mz0) / nz;
    for (let k = 1; k < 6; k++) for (let i = 2; i < nx - 1; i += 2) { if (rand() < 0.25) continue; const x = mx0 + (i + 0.5) * sx + (rand() - 0.5) * 0.8, z = mz0 + (k + 0.5) * sz; fig([x, z], my + 0.05, [x, z - 5], { pose: 'kneel', arms: 'pray', over: 'none', hat: pick(['cap', 'cap', 'turban']) }); }
    for (let k = 0; k < 6; k++) { const x = mx0 + 3 + k * 2.2, z = mz1 - 1.6; fig([x, z], my + 0.05, [x, z - 3], { pose: 'cross', over: 'none', hat: 'cap' }); } }
  // ---- the graveyard east of the mosque
  for (let k = 0; k < 9; k++) { const x = mx1 + 3.2 + (k % 2) * 2.0 + rand() * 0.6, z = mz0 + 4 + k * 3.6; S.push({ t: 'swahili_tomb', at: [x, z], y: height(x, z), rot: 0, kind: k === 2 || k === 6 ? 'pillar' : 'slab', seed: k }); }
  // ---- benches against the lane walls (the lots' blank flanks), jars at their feet
  for (const r of LANES) for (let z = -102 + rand() * 4; z < -30; z += 9 + rand() * 6) {
    const side = rand() < 0.5 ? -1 : 1, x = side < 0 ? r[0] + 0.05 : r[2] - 0.55;
    if (!inLot(side < 0 ? r[0] - 0.8 : r[2] + 0.8, z)) continue;
    S.push({ t: 'swahili_bench', rect: [x, z, x + 0.5, z + 1.8], y: height(x, z) });
    if (rand() < 0.5) L.push({ t: 'pot', kind: pick(['water_pot', 'dark_pot']), n: 2, at: [side < 0 ? r[0] + 0.7 : r[2] - 0.7, z + 0.9], y: height(x, z), seed: Math.floor(rand() * 1e6) });
    if (rand() < 0.3) fig([x + (side < 0 ? 0.25 : 0.25), z + 0.6], height(x, z), [x + side * -3, z + 0.6], { pose: 'sit', over: 'none' });
  }
  // ---- Husuni Kubwa: the audience court, the pavilion, the domestic court
  { const a = COURTS.audience.rect, y = PY + 0.03, pavY = PY + 3.03;
    const sultan = [166.0, -115.2];
    fig(sultan, pavY, [150, -115.2], { pose: 'sit', cloth: 'cloth_white', cloth2: 'cloth_maroon', over: 'sash', hat: 'turban', hatMat: 'cloth_white', beard: true });
    for (const dz of [-1.8, 1.8]) fig([sultan[0] + 0.2, sultan[1] + dz], pavY, [150, -115.2], { pose: 'stand', cloth: 'cloth_green', over: 'sash', hat: 'turban' });
    for (let k = 0; k < 8; k++) { const x = a[0] + 4 + (k % 2) * 2.4, z = a[1] + 2.5 + Math.floor(k / 2) * 3.0; fig([x, z], y, [sultan[0], sultan[1]], { pose: 'cross', cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_maroon', 'cloth_green']), hat: pick(['turban', 'cap']) }); }
    for (const dz of [-1.4, 1.4]) fig([a[0] + 1.2, (a[1] + a[3]) / 2 + dz], y, [a[0] + 8, (a[1] + a[3]) / 2 + dz], { pose: 'stand', carry: 'staff', cloth: 'cloth_white', over: 'sash', hat: 'turban' });
    const d = COURTS.domestic.rect, dy = PY - COURTS.domestic.sunk + 0.03;
    for (let k = 0; k < 3; k++) woman([(d[0] + d[2]) / 2 - 1.8 + k * 1.8, (d[1] + d[3]) / 2 + 2.5], dy, [(d[0] + d[2]) / 2, (d[1] + d[3]) / 2], { carry: k === 1 ? 'pot' : 'basket' });
    L.push({ t: 'goods_mat', goods: ['pottery', 'spice'], at: [(d[0] + d[2]) / 2 + 3.6, (d[1] + d[3]) / 2 - 3], y: dy, rot: 0.3, seed: 91 });
    fig([(d[0] + d[2]) / 2 + 4.2, (d[1] + d[3]) / 2 - 3.6], dy, [(d[0] + d[2]) / 2, (d[1] + d[3]) / 2], { pose: 'cross', over: 'none' }); }
  // ---- the beach: racks of drying fish, net-menders, children at the water, canoes in the shallows
  for (const x of [-165, -128, -95, -58, -22, 22, 48]) {
    const z = shoreAt(x) + 11.5, y = height(x, z);
    if (y < 0.4 || inLot(x, z, 3)) continue;
    S.push({ t: 'fish_rack', at: [x, z], y, rot: 0, len: 3.4 });
    if (rand() < 0.7) fig([x + 2.6, z + 0.6], y, [x, z], { pose: 'sit_ground', dress: 'wrap', top: 'bare', over: 'none', hat: 'cap', carry: 'none' });
    if (rand() < 0.6) woman([x - 2.6, z + 0.8], y, [x, z], { carry: 'basket' });
  }
  for (let k = 0; k < 6; k++) { const x = -180 + k * 47 + rand() * 12, z = shoreAt(x) + 8.5; if (height(x, z) > 0.3) { child([x, z], height(x, z), [x, z - 5], { pose: 'stand' }); if (rand() < 0.6) child([x + 0.9, z + 0.3], height(x, z), [x, z - 5], { pose: 'stand' }); } }
  for (const x of [-150, -85, -35, 10, 40]) {
    let z = shoreAt(x) - 4;
    for (let i = 0; i < 30 && !inSea(x, z); i++) z -= 1;
    if (!inSea(x, z - 3)) continue;
    const zc = z - 5;
    L.push({ t: 'boat', kind: 'canoe', len: 5.6, at: [x, zc], y: SEA, rot: Math.PI / 2 + (rand() - 0.5) * 0.4, seed: Math.round(x) + 5 });
    fig([x + 0.4, zc], SEA - 0.05, [x + 6, zc], { pose: 'punt', dress: 'wrap', top: 'bare', over: 'none', hat: 'cap', carry: 'punt' });
  }
  return (CACHE = { S, L });
}
