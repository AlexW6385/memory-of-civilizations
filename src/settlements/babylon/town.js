// The houses of the inner city (docs/settlements/babylon.md §5) and the people (§4.9): the golden image of Marduk
// seated in his cella; priests in Esagila's court; Babylonians on the Processional Way and the bridge in the dress
// Herodotus gives them (1.195: a linen tunic to the feet, a woollen one over it, a white mantle; long hair bound
// with fillets; a carved staff); boatmen standing in the round boats, a live ass in the largest (1.194).
import { RADIUS, WAY, WALL_Z, ESAGILA, RIVER, BRIDGE, QUAY, MARKET, riverX, lots } from './layout.js';
import { QUFFAS } from './plan.js';
import { esagilaStatue } from '../../styles/babylonian/temple.js';

const base = (id, elements) => ({ id, style: 'babylonian', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, -370], facing: 's' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const CLOTH = ['cloth_white', 'cloth_white', 'linen', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_brown'];

function people() {
  const rand = rng(575), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CLOTH), cloth2: 'cloth_white', over: 'cape', hair: 'long', beard: true, hairMat: 'hide_black', skin: rand() < 0.5 ? 'skin_medium' : 'skin_light', hat: 'none', feet: 'shod', carry: rand() < 0.35 ? 'staff' : 'none', len: 1.5, staffMat: 'wood_dark', ...o });
  const woman = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, h: 1.5 + rand() * 0.08, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CLOTH), cloth2: pick(CLOTH), hat: 'veil', skin: 'skin_medium', feet: 'shod', carry: rand() < 0.3 ? 'pot' : 'none', ...o });
  // the god in his cella: the seated image of gold (Herodotus 1.183), its feet on the golden footstool
  const st = esagilaStatue(ESAGILA);
  L.push({ t: 'figure', ...st, seed: 3, dress: 'robe', cloth: 'gold', cloth2: 'gold', skin: 'gold', hairMat: 'gold', hairShade: 1, hair: 'long', beard: true, over: 'sash', hat: 'none', feet: 'shod', pose: 'sit' });
  // priests in white linen before the cella and at the great altar
  const zc = (ESAGILA[1] + ESAGILA[3]) / 2, cx = ESAGILA[0] + 32;
  for (const [dx, dz, pose] of [[4.5, -1.6, 'pray'], [4.5, 1.5, 'pray'], [14, -2.6, 'stand'], [19.5, 2.8, 'talk']]) man([cx + dx, zc + dz], 0.06, face([cx + dx, zc + dz], dx < 10 ? [cx, zc] : [cx + 17, zc]), { pose, cloth: 'linen', cloth2: 'cloth_white', over: 'sash', carry: 'none' });
  // on the Processional Way, in twos and threes, going to and from the gate
  for (let k = 0; k < 9; k++) {
    const z = WALL_Z + 45 + rand() * 180, x = WAY.x + (rand() - 0.5) * 12, north = rand() < 0.5, rot = north ? Math.PI + (rand() - 0.5) * 0.3 : (rand() - 0.5) * 0.3;
    const n = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) (rand() < 0.7 ? man : woman)([x + i * 0.75, z + (rand() - 0.5) * 0.6], 0.12, rot + Math.PI, {});
  }
  for (let k = 0; k < 6; k++) { const z = WALL_Z - 60 - rand() * 50, x = WAY.x + (rand() - 0.5) * 12; man([x, z], 0.12, Math.PI + (rand() - 0.5) * 0.4); }
  // on the bridge and its bridgeheads; a donkey with its driver
  const xr = riverX(BRIDGE.z);
  for (const [dx, dz, east] of [[-20, -2.5, 1], [-17, -1.8, 1], [6, 2.2, 0], [26, -2.6, 0], [38, 1.5, 1]]) (rand() < 0.75 ? man : woman)([xr + dx, BRIDGE.z + dz], BRIDGE.y, east ? -Math.PI / 2 : Math.PI / 2);
  L.push({ t: 'animal', kind: 'donkey', at: [xr + 12, BRIDGE.z + 1.6], y: BRIDGE.y, rot: Math.PI / 2, seed: 41 });
  man([xr + 14, BRIDGE.z + 2.4], BRIDGE.y, Math.PI / 2, { carry: 'staff', len: 1.4 });
  // the boatmen: two standing with their paddles in each boat on the stream, one in each moored boat
  for (const b of QUFFAS) {
    const x = riverX(b.z) + b.d, y = RIVER.level - 0.31, boat = { cloth: pick(['cloth_white', 'cloth_brown', 'linen']), over: 'none', dress: 'tunic', legs: 'bare', feet: 'bare', hair: 'long', carry: 'none' };
    if (b.moored) { man([x - 0.4, b.z + 0.3], y, -Math.PI / 2, { ...boat, pose: 'squat' }); continue; }
    for (const s of [-1, 1]) man([x + s * b.r * 0.45, b.z + s * 0.3], y, Math.PI + s * 0.4, { ...boat, pose: 'punt', len: 3.2, poleMat: 'timber' });
    if (b.cargo === 'ass') L.push({ t: 'animal', kind: 'donkey', at: [x, b.z - 0.6], y, rot: 0.6, seed: 17 });
  }
  // on the quay, at the moored boats: men carrying jars up from them
  for (const b of QUFFAS.filter((q) => q.moored)) { const x = riverX(b.z) + QUAY.d0 + 2.2; man([x, b.z - 1], QUAY.y, -Math.PI / 2, { carry: 'pot', over: 'none', dress: 'tunic' }); man([x + 1.4, b.z + 1.2], QUAY.y, Math.PI / 2, { pose: 'talk' }); }
  // a caravan of camels coming down the road to the Ishtar Gate, its Arab drivers bareheaded in long robes (as the Arabs
  // of the Apadana's reliefs); a man with a loaded donkey behind them
  for (let k = 0; k < 4; k++) L.push({ t: 'animal', kind: 'camel', at: [WAY.x + 7.2 + (k % 2) * 0.5, -341 + k * 3.4], y: 0.12, rot: Math.PI + (rand() - 0.5) * 0.12, seed: Math.floor(rand() * 1e9), gear: true });
  man([WAY.x + 6.4, -327.6], 0.12, Math.PI, { cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'sash', carry: 'staff', pose: 'staff', len: 1.8 });
  man([WAY.x + 8.6, -343.6], 0.12, Math.PI, { cloth: 'cloth_brown', cloth2: 'cloth_white', over: 'cape', carry: 'staff', pose: 'staff', len: 1.7 });
  L.push({ t: 'animal', kind: 'donkey', at: [WAY.x + 6.8, -350], y: 0.12, rot: Math.PI, seed: 77, gear: true });
  man([WAY.x + 6.1, -348.5], 0.12, Math.PI, { carry: 'staff', len: 1.4, dress: 'tunic', over: 'belt' });
  // the market at the bridge's east end: sellers behind their mats and stalls — dates, fish, greens, bread, pots, baskets,
  // cloth — buyers before them, donkeys standing loaded
  const [mx0, mz0, mx1, mz1] = MARKET, WARES = [['heap', 'baskets'], ['fish', 'fish'], ['greens', 'heap'], ['bread', 'baskets'], ['pottery', 'pottery'], ['bolts', 'bolts'], ['heap', 'melons']];
  let w = 0;
  for (const z of [mz0 + 10, mz1 - 10]) for (let x = mx0 + 14; x < mx1 - 4; x += 6.5) {
    if (rand() < 0.12) continue;
    const g = WARES[w++ % WARES.length], north = z < (mz0 + mz1) / 2, back = north ? -1 : 1, rot = north ? Math.PI : 0;   // the sellers on the outer side, facing the middle
    if (w % 3 === 0) { L.push({ t: 'stall', at: [x, z], y: 0, rot: north ? 0 : Math.PI, seed: Math.floor(rand() * 1e9), awning: pick(['cloth_white', 'cloth_ochre', 'cloth_indigo']), stripe: 'none', goods: g, w: 2.6, d: 1.3 }); man([x + 0.4, z + back * 1.4], 0, rot, { carry: 'none', pose: 'talk' }); }
    else { L.push({ t: 'goods_mat', at: [x, z], y: 0, rot, seed: Math.floor(rand() * 1e9), goods: g, mat: 'reed_mat' }); man([x - 0.2, z + back * 1.0], 0, rot, { pose: 'sit_ground', carry: 'none' }); }
    if (rand() < 0.55) (rand() < 0.6 ? man : woman)([x + (rand() - 0.5), z - back * 1.7], 0, rot + Math.PI + (rand() - 0.5) * 0.5, {});
  }
  for (const [x, z] of [[mx1 - 6, mz0 + 18], [mx1 - 8, mz0 + 20.5]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: 0, rot: Math.PI / 2, seed: Math.floor(rand() * 1e9), gear: true });
  // on the quay by the moored boats two scribes record a cargo, one on a clay tablet in cuneiform, the other in Aramaic
  // on a leather scroll (as the Assyrian reliefs show them, in pairs)
  { const z = 103, x = riverX(z) + QUAY.d0 + 6.5;
    man([x, z - 0.8], QUAY.y + 0.03, Math.PI / 2, { pose: 'cross', cloth: 'linen', over: 'sash', carry: 'none' });
    man([x, z + 0.8], QUAY.y + 0.03, Math.PI / 2, { pose: 'cross', cloth: 'cloth_white', over: 'cape', carry: 'none' });
    man([x - 2.2, z], QUAY.y, -Math.PI / 2, { pose: 'talk', cloth: 'cloth_indigo', carry: 'staff' }); }
  return { id: 'babylon-people', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: L, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-40, -370], facing: 's' }, center: [-60, 0], near: 420 };
}

export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 160) plans.push(base(`babylon-houses-${i / 160}`, all.slice(i, i + 160).map((l) => ({ t: 'ur_house', ...l }))));
  // the market (a market room: the generic life pass adds to it) and the scribes' mats on the quay
  const z = 103, x = riverX(z) + QUAY.d0 + 6.5;
  plans.push({ ...base('babylon-market', [{ t: 'scribe_kit', at: [x, z - 0.8], y: QUAY.y, rot: Math.PI / 2 }, { t: 'scribe_kit', at: [x, z + 0.8], y: QUAY.y, rot: Math.PI / 2, scroll: true }]), rooms: [{ id: 'market', rect: MARKET, y: 0, kind: 'open', market: true }] });
  return plans;
}
export { people };
