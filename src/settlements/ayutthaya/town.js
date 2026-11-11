// The town of Ayutthaya (docs/settlements/ayutthaya.md §5): the brick-faced canals with their bridges and landing stages; the stilt houses along
// them and the river; the floating houses moored on the river and the floating market on its reach below the palace (boats with fruit,
// pots, rice and fish, the vendors sitting in them); sugar palms and the granaries; the monks and the people of the banks.
import { lodTiles } from '../lod.js';
import { RADIUS, WATER, CANALS, BRIDGES, MARKET, RIVER_W, ISLAND, inRect, wet, lots, onBridge, onPath, paths, inLot, WAT, PALACE, UBOSOT, wetRiver } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const plan = (id, style, elements, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [10, -90], facing: 'n' }, ...extra });
const KINDS = ['sampan', 'sampan', 'vendor', 'vendor', 'ruea'];

/** The boats and floating houses standing on the river and the canals (elements), shared with the movers (which keep clear of them). */
export function waterElements() {
  const E = [], rand = rng(87);
  // the floating houses: rows along the river's east bank, outside the market's reach
  const raftFree = (x, z) => !inRect(MARKET, x, z, 4) && Math.hypot(x, z) < RADIUS - 40;
  for (const [x, rows] of [[-252, 0], [-266, 1]]) for (let z = -230; z < 215; z += 10 + Math.floor(rand() * 4)) {
    if (!raftFree(x, z) || (rows && rand() < 0.45)) continue;
    E.push({ t: 'floating_house', c: [x + (rand() - 0.5) * 2, z], rot: Math.PI / 2 + (rand() - 0.5) * 0.08, y: WATER, w: 3.8 + rand() * 1.4, d: 5 + rand() * 1.6, seed: Math.floor(rand() * 1e6) });
    if (rand() < 0.5) E.push({ t: 'boat', at: [x - 5.2, z + (rand() - 0.5) * 2], rot: (rand() - 0.5) * 0.2, y: WATER, kind: 'sampan', load: 'empty', seed: Math.floor(rand() * 1e6) });
  }
  // south river bank
  for (let x = -215; x < 280; x += 11 + Math.floor(rand() * 4)) { const z = 238 + (rand() - 0.5) * 3; if (!raftFree(x, z)) continue; E.push({ t: 'floating_house', c: [x, z], rot: 0, y: WATER, w: 3.8 + rand() * 1.4, d: 5 + rand() * 1.6, seed: Math.floor(rand() * 1e6) }); }
  // the floating market: boats close together, bow to bow, with their awnings, fruit, pots, rice and fish
  const loads = ['fruit', 'fruit', 'pots', 'rice', 'fish', 'fruit'];
  for (let k = 0; k < 26; k++) {
    const x = MARKET[0] + 14 + rand() * (MARKET[2] - MARKET[0] - 36), z = MARKET[1] + 8 + rand() * (MARKET[3] - MARKET[1] - 16);
    if (E.some((e) => e.t === 'boat' && Math.hypot(e.at[0] - x, e.at[1] - z) < 4.2) || Math.hypot(x, z) > RADIUS - 44) continue;
    E.push({ t: 'boat', at: [x, z], rot: (rand() < 0.5 ? 0 : Math.PI) + (rand() - 0.5) * 0.5, y: WATER, kind: rand() < 0.75 ? 'vendor' : 'sampan', load: loads[k % loads.length], awning: rand() < 0.65 ? (rand() < 0.5 ? 'cloth' : 'atap') : false, seed: Math.floor(rand() * 1e6), vendor: true });
  }
  // moored along the canals at the landings
  for (const c of CANALS) {
    const [a, b, c1, d] = c.rect, ew = c1 - a > d - b;
    for (let k = 0; k < (ew ? 9 : 5); k++) {
      const t = rand(), side = rand() < 0.5 ? -1 : 1, kind = KINDS[Math.floor(rand() * KINDS.length)];
      const x = ew ? a + 14 + t * (c1 - a - 40) : (a + c1) / 2 + side * 2.2, z = ew ? (b + d) / 2 + side * 2.2 : b + 14 + t * (d - b - 40);
      if (!inRect(ISLAND, x, z, -6) || onBridge(x, z, 6) || Math.hypot(x, z) > RADIUS - 50) continue;
      E.push({ t: 'boat', at: [x, z], rot: ew ? Math.PI / 2 + (rand() < 0.5 ? 0 : Math.PI) + (rand() - 0.5) * 0.05 : (rand() < 0.5 ? 0 : Math.PI) + (rand() - 0.5) * 0.05, y: WATER, kind: kind === 'ruea' ? 'sampan' : kind, load: ['fruit', 'pots', 'rice', 'empty', 'empty'][Math.floor(rand() * 5)], awning: rand() < 0.4 ? 'atap' : false, seed: Math.floor(rand() * 1e6), moored: true });
    }
  }
  return E;
}

function water() {
  const E = [];
  for (const c of CANALS) { if (c.id === 'north') continue; E.push({ t: 'canal_bank', rect: c.rect, bed: -2.3, top: 0.1 }); }
  E.push({ t: 'canal_bank', rect: CANALS[0].rect, bed: -2.3, top: 0.1 });
  for (const b of BRIDGES) E.push({ t: 'thai_bridge', c: b.c, dir: b.dir, kind: b.kind, span: 8, y: 0 });
  // landing stages at some banks, where the lanes reach the water
  const rand = rng(33);
  for (const c of CANALS) {
    const [a, b, c1, d] = c.rect, ew = c1 - a > d - b;
    for (let k = 0; k < (ew ? 7 : 4); k++) {
      const t = rand(), side = rand() < 0.5 ? -1 : 1, x = ew ? a + 20 + t * (c1 - a - 50) : (side < 0 ? a - 0.2 : c1 + 0.2), z = ew ? (side < 0 ? b - 0.2 : d + 0.2) : b + 20 + t * (d - b - 50);
      if (!inRect(ISLAND, x, z, -8) || onBridge(x, z, 5) || Math.hypot(x, z) > RADIUS - 50) continue;
      E.push({ t: 'landing', at: [x, z], dir: ew ? (side < 0 ? 's' : 'n') : (side < 0 ? 'e' : 'w'), y: 0.1, len: 3 });
    }
  }
  for (const e of waterElements()) E.push(e);
  return plan('ayutthaya-water', 'siamese', E);
}
/** The palms (sugar and coconut stand-ins), granaries and rest houses scattered where the ground is free. */
function garden() {
  const E = [], rand = rng(168);
  for (let k = 0; k < 210; k++) {
    const x = -228 + rand() * 520, z = -240 + rand() * 462;
    if (!inRect(ISLAND, x, z, -6) || Math.hypot(x, z) > RADIUS - 40 || wet(x, z) < 3.5 || inLot(x, z, 2.2) || onPath(x, z, 0.8) || onBridge(x, z, 4) || inRect(WAT.wall, x, z, 4) || inRect(PALACE.wall, x, z, 4) || wetRiver(x, z) < 8) continue;
    E.push({ t: 'sugar_palm', at: [x, z], y: 0, s: 0.75 + rand() * 0.5, rot: rand() * 6.28 });
  }
  for (let k = 0; k < 40; k++) {
    const x = -220 + rand() * 500, z = -235 + rand() * 450;
    if (!inRect(ISLAND, x, z, -8) || Math.hypot(x, z) > RADIUS - 44 || wet(x, z) < 6 || inLot(x, z, 3) || onPath(x, z, 1.5) || onBridge(x, z, 5) || inRect(WAT.wall, x, z, 5) || inRect(PALACE.wall, x, z, 5) || wetRiver(x, z) < 14) continue;
    E.push(k % 3 ? { t: 'k_granary', at: [x, z], seed: k } : { t: 'k_sala', rect: [x, z, x + 5, z + 4], front: 's', seed: k });
  }
  return plan('ayutthaya-garden', 'siamese', E);
}
/** The people standing about: monks at the wat, vendors sitting in the market's boats, villagers on the banks. */
function people() {
  const rand = rng(1687), P = [];
  const skin = () => (rand() < 0.75 ? 'skin_medium' : 'skin_dark');
  const CL = ['cloth_ochre', 'cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_green', 'cloth_maroon'];
  const face = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));
  const fig = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: CL[Math.floor(rand() * CL.length)], cloth2: 'cloth_white', top: 'bare', over: 'shawl', skin: skin(), hat: 'none', feet: 'bare', hair: 'short', beard: false, ...o });
  // monks in saffron, the shoulder bare, the head shaven: on the platform and the forecourt
  const monk = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', over: 'sash', skin: skin(), hat: 'none', feet: 'bare', hair: 'shaven', beard: false, ...o });
  for (const [x, z, r] of [[-4, -127, 0.4], [18, -126, -0.6], [38, -127, 0.2], [0, -108, 1.2], [20, -112, -1.0], [-30, -105, 0.5]]) monk([x, z], x < 60 && z < -120 ? 0.8 : 0, r, { pose: rand() < 0.5 ? 'sit_ground' : undefined });
  // inside the royal wihan: monks sitting before the image, a woman kneeling with offerings
  for (const z of [-141.2, -138.8]) monk([73.5, z], 1.2, -Math.PI / 2, { pose: 'sit_ground', legs: 'cross' });
  fig([75, -137], 1.2, -Math.PI / 2, { pose: 'sit_ground', legs: 'cross', top: '', over: 'shawl' });
  // vendors sitting in the market's boats: a woman at the stern with her goods
  for (const e of waterElements()) {
    if (e.t !== 'boat' || !e.vendor) continue;
    const s = Math.sin(e.rot ?? 0), c = Math.cos(e.rot ?? 0), L = e.kind === 'vendor' ? 5.2 : 6;
    const sx = e.at[0] - s * L * 0.32 * -1, sz = e.at[1] + c * L * 0.32;
    fig([sx, sz], WATER + (e.kind === 'vendor' ? 0.45 : 0.4), (e.rot ?? 0) + Math.PI, { pose: 'sit_ground', hat: rand() < 0.7 ? 'straw' : 'none', hair: 'bun', over: 'none' });
  }
  // the banks: women with baskets and pots, men fishing at the landings, a boy with a buffalo's rope, people talking
  const strips = paths().filter((q) => (q.r[2] - q.r[0]) * (q.r[3] - q.r[1]) > 120);
  for (let k = 0; k < 70; k++) {
    const q = strips[Math.floor(rand() * strips.length)].r, x = q[0] + rand() * (q[2] - q[0]), z = q[1] + rand() * (q[3] - q[1]);
    if (Math.hypot(x, z) > RADIUS - 50 || P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 3)) continue;
    const r = rand(), rot = (q[2] - q[0] > q[3] - q[1] ? 0 : Math.PI / 2) + (rand() < 0.5 ? 0 : Math.PI);
    if (r < 0.25) fig([x, z], 0, rot, { carry: 'basket' }); else if (r < 0.45) fig([x, z], 0, rot, { carry: 'pot' }); else if (r < 0.6) fig([x, z], 0, rot, { pose: 'sit_ground', legs: 'cross', hat: 'straw' });
    else if (r < 0.7) fig([x, z], 0, rot, { child: true, h: 0.7 }); else if (r < 0.8) { fig([x, z], 0, rot, { pose: 'talk' }); const b = [x + Math.sin(rot) * -1.1, z + Math.cos(rot) * -1.1]; fig(b, 0, face(b, [x, z])); } else fig([x, z], 0, rot, { hat: 'straw', carry: 'pole' });
  }
  void face;
  return plan('ayutthaya-people', 'life', P);
}
export async function town() {
  const plans = [water(), garden(), people()];
  const els = lots().map((l) => ({ t: 'thai_house', rect: l.rect, front: l.front, seed: l.seed, kind: l.kind }));
  plans.push(...lodTiles('ayutthaya-houses', 'siamese', els, { R: RADIUS, near: 150 }));
  void UBOSOT;
  return plans;
}
