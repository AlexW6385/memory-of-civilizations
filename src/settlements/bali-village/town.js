// Round the pura (docs/settlements/bali-village.md §4): the walled family compounds along the village street and the cross lane, the banjar's wantilan with its gamelan
// at the crossing, the kulkul and the banyan, the subak channel along the street, the penjors of the temple festival, the flooded paddies of the terraces, the shrine of the
// water temple; the people — the gamelan's players, the worshippers in the temple, the households in their natah, the farmers in the paddies.
import { RADIUS, CORE, WANTILAN, KULKUL, BANYAN, CHANNEL_X, PURA, lots, height, flooded, TREAD } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, style, elements, o = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -30], facing: 'n' }, ...o });

/** The flooded paddies' water: rectangles over the flat treads, row-merged along x. */
function paddyWater() {
  const S = 1.5, out = [], R2 = (RADIUS - 8) ** 2;
  for (let z = -RADIUS; z < RADIUS; z += S) {
    let run = null;
    for (let x = -RADIUS; x < RADIUS; x += S) {
      const cx = x + S / 2, cz = z + S / 2;
      let ok = false, y = 0;
      if (cx * cx + cz * cz < R2 && !(cx > CORE[0] - 1 && cx < CORE[2] + 1 && cz > CORE[1] - 1 && cz < CORE[3] + 1)) {
        const h = [height(x, z), height(x + S, z), height(x, z + S), height(x + S, z + S), height(cx, cz)];
        const lo = Math.min(...h), hi = Math.max(...h);
        y = h[4];
        ok = hi - lo < 0.012 && flooded(cx, cz, y);
      }
      if (ok && run && Math.abs(run.y - y) < 0.012) run.x1 = x + S;
      else { if (run) out.push([run.x0, z, run.x1, z + S, run.y + 0.07]); run = ok ? { x0: x, x1: x + S, y } : null; }
    }
    if (run) out.push([run.x0, z, run.x1, z + S, run.y + 0.07]);
  }
  return out;
}

function compounds() {
  const L = lots(), plans = [];
  for (let i = 0; i < L.length; i += 7) plans.push(base(`bali-compounds-${i / 7}`, 'balinese', L.slice(i, i + 7).map((l) => ({ t: 'bali_compound', rect: l.rect, front: l.front, seed: l.seed, rich: l.rich, gateF: l.gateF }))));
  return plans;
}

function village() {
  const E = [], rand = rng(77);
  // the banjar's wantilan at the north-east corner of the crossing, the kulkul and the banyan's seat at the north-west
  E.push({ t: 'bali_wantilan', rect: WANTILAN, y: 0, seed: 21 });
  E.push({ t: 'bali_kulkul', c: KULKUL, y: 0 });
  E.push({ t: 'bali_banyan_seat', c: BANYAN, y: 0, r: 2.7 });
  E.push({ t: 'floor', rect: [WANTILAN[0] - 1.5, WANTILAN[3] + 0.3, WANTILAN[2] + 1.5, WANTILAN[3] + 2.0], y: 0.02, th: 0.1, mat: 'brick_paving', walk: false });
  // the subak channel down the street's west edge, under the lane; a footbridge at each gate on the channel's side
  E.push({ t: 'bali_channel', pts: [[CHANNEL_X, -62], [CHANNEL_X, 4.6]], y: 0, w: 0.55 });
  E.push({ t: 'bali_channel', pts: [[CHANNEL_X, 14.4], [CHANNEL_X, 132]], y: 0, w: 0.55 });
  const L = lots();
  for (const l of L) if (l.front === 'e') E.push({ t: 'bali_footbridge', at: [CHANNEL_X, l.gate[1]], axis: 'x', len: 1.9, y: 0 });
  // the penjors of the temple's festival: arches over the approach, one by each gate on the street
  for (let z = -68; z <= -48; z += 5) for (const s of [-1, 1]) E.push({ t: 'bali_penjor', at: [s * 7.5, z + (s > 0 ? 2 : 0)], dir: [-s, 0], h: 7.5 + rand() * 2.0, y: 0 });
  for (const l of L) {
    if (rand() < 0.3) continue;
    const [gx, gz] = l.gate;
    if (l.front === 'e') E.push({ t: 'bali_penjor', at: [-3.9, gz + 2.0], dir: [1, 0], h: 6 + rand() * 2.5, y: 0 });
    else if (l.front === 'w') E.push({ t: 'bali_penjor', at: [3.9, gz - 2.0], dir: [-1, 0], h: 6 + rand() * 2.5, y: 0 });
    else if (l.front === 'n') E.push({ t: 'bali_penjor', at: [gx + 2.0, 11.8], dir: [0, -1], h: 6 + rand() * 2.5, y: 0 });
    else E.push({ t: 'bali_penjor', at: [gx - 2.0, 7.2], dir: [0, 1], h: 6 + rand() * 2.5, y: 0 });
  }
  // offerings on the ground before the temple's stair and at the crossing
  E.push({ t: 'bali_offerings', list: [[-2.5, 0.01, -70.5], [-1, 0.01, -70.5], [1, 0.01, -70.5], [2.5, 0.01, -70.5], [-1.2, 0.01, 10.5], [1.2, 0.01, 9]] });
  // the paddies' water and the water temple's shrine among them
  E.push({ t: 'bali_water', rects: paddyWater() });
  E.push({ t: 'bali_subak_shrine', at: [-32, 146], y: height(-32, 146) });
  E.push({ t: 'bali_subak_shrine', at: [112, -40], y: height(112, -40) });
  return base('bali-village', 'balinese', E);
}

/** The people: gamelan players, worshippers, households, farmers. */
function people() {
  const rand = rng(1900), P = [];
  const skin = () => (rand() < 0.75 ? 'skin_medium' : 'skin_dark');
  const man = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: ['cloth_brown', 'cloth_white', 'cloth_indigo', 'cloth_ochre'][Math.floor(rand() * 4)], cloth2: 'cloth_ochre', over: 'sash', skin: skin(), hat: 'turban', hatMat: 'cloth_ochre', hair: 'short', feet: 'bare', beard: false, ...o });
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo'][Math.floor(rand() * 4)], cloth2: 'cloth_ochre', over: 'sash', skin: skin(), hat: 'none', hair: 'bun', feet: 'bare', beard: false, h: 1.5 + rand() * 0.1, ...o });
  const temple = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'sash', skin: skin(), hat: 'turban', hatMat: 'cloth_white', hair: 'short', feet: 'bare', beard: false, ...o });
  const wantilanX = (WANTILAN[0] + WANTILAN[2]) / 2, wy = 0.5;
  // the gamelan in the wantilan: players behind the metallophones, a drummer, the gong's player; the same in the temple's gong pavilion
  for (const [cx, z0, f] of [[wantilanX, WANTILAN[1], wy], [21, -104, PURA.y1 + 0.5]]) {
    const cz = z0 + 3.8;
    for (let r = 0; r < 3; r++) for (const s of [-1, 1]) man([cx + s * 2.6 - 0.3 + rand() * 0.4, cz - 1.0 + r * 1.1 + 0.6], f, 0, { pose: 'cross' });
    man([cx - 1.0, cz - 1.2 + 0.7], f, 0, { pose: 'cross' }); man([cx + 1.0, cz - 1.2 + 0.7], f, 0, { pose: 'cross' });
    man([cx - 0.8, cz + 1.4], f, 0, { pose: 'cross' }); man([cx + 0.6, cz + 1.4], f, 0, { pose: 'cross' });
    man([cx - 1.05, cz + 1.95], f, 0.4, { pose: 'drum' }); man([cx + 1.05, cz + 1.95], f, -0.4, { pose: 'drum' });
    man([cx + 1.1, cz - 2.8 + 1.0], f, 0, { pose: 'cross' });
  }
  // the worshippers: kneeling in rows in the inner court facing the merus, in white with the yellow sash; the priest at the front; devotees in the middle court
  const y2 = PURA.y2;
  for (let r = 0; r < 3; r++) for (let k = -5; k <= 5; k++) if (rand() < 0.7) { const at = [k * 1.5 + (rand() - 0.5) * 0.3, -126 + r * 1.9]; (rand() < 0.5 ? woman : temple)(at, y2, 0, { pose: 'seiza', arms: 'pray', cloth: 'cloth_white', hat: 'none', hair: 'bun' }); }
  temple([0, -131], y2, 0, { pose: 'seiza', arms: 'pray', hat: 'turban', beard: true });
  for (let k = 0; k < 7; k++) woman([-20 + rand() * 40, -100 + rand() * 20], PURA.y1, rand() * 6.28, rand() < 0.5 ? { carry: 'basket' } : { pose: 'talk' });
  for (let k = 0; k < 4; k++) temple([-3 + rand() * 6, -66 + rand() * 12], 0, rand() * 6.28, { pose: 'talk' });
  // the households: a woman, a man or a child in the natah of most compounds, hens, a pig, a dog
  const E = [];
  lots().forEach((l, i) => {
    const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2 + (rand() - 0.5) * 2, cz = (z0 + z1) / 2 + (rand() - 0.5) * 2, r = rand();
    if (r < 0.45) woman([cx, cz], 0, rand() * 6.28, rand() < 0.5 ? { carry: 'pot' } : { pose: 'sit_ground' });
    else if (r < 0.75) man([cx, cz], 0, rand() * 6.28, { pose: rand() < 0.5 ? 'sit_ground' : 'talk' });
    else woman([cx, cz], 0, rand() * 6.28, { child: true, h: 1.1 });
    E.push({ t: 'chickens', at: [cx + 2.5, cz - 1.5], n: 4, kind: 'hen', seed: i + 5, rot: rand() * 6 });
    if (rand() < 0.4) E.push({ t: 'animal', kind: 'pig', at: [cx - 2.5, cz + 2.0], y: 0, rot: rand() * 6.28, seed: i + 9 });
    if (rand() < 0.35) E.push({ t: 'animal', kind: 'dog', at: [cx + 1.8, cz + 2.4], y: 0, rot: rand() * 6.28, seed: i + 31 });
  });
  // the farmers on the terraces: hoeing in the green paddies, in conical straw hats; ducks in the flooded ones
  for (let k = 0; k < 160 && P.length < 150; k++) {
    const a = rand() * 6.283, d = 112 + rand() * 60, x = Math.cos(a) * d * 1.0, z = Math.sin(a) * d * 0.95, r2 = Math.hypot(x, z);
    if (r2 > RADIUS - 14 || (x > CORE[0] - 2 && x < CORE[2] + 2 && z > CORE[1] - 2 && z < CORE[3] + 2)) continue;
    const y = height(x, z), flat = [height(x + 1, z), height(x - 1, z), height(x, z + 1), height(x, z - 1)].every((h) => Math.abs(h - y) < 0.02);
    if (!flat) continue;
    if (flooded(x, z, y)) { if (rand() < 0.3) E.push({ t: 'chickens', at: [x, z], n: 5, kind: 'duck', seed: k + 3, rot: rand() * 6, y: y + 0.06 }); else if (rand() < 0.5) man([x, z], y + 0.08, rand() * 6.28, { carry: 'hoe', hat: 'straw', top: 'bare' }); }
    else if (rand() < 0.7) (rand() < 0.5 ? man : woman)([x, z], y, rand() * 6.28, { carry: 'hoe', hat: 'straw', top: 'bare' });
  }
  void TREAD; void KULKUL; void BANYAN;
  return base('bali-people', 'life', [...P, ...E]);
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  return (CACHE = [...compounds(), village(), people()]);
}
