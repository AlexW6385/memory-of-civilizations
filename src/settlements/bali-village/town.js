// Round the pura (docs/settlements/bali-village.md §4): the walled family compounds along the village street and the cross lane, the banjar's wantilan with its gamelan
// at the crossing, the kulkul and the banyan, the subak channel along the street, the penjors of the temple festival, the flooded paddies of the terraces, the shrine of the
// water temple; the people — the gamelan's players, the worshippers in the temple, the households in their natah, the farmers in the paddies.
import { RADIUS, CORE, WANTILAN, KULKUL, BANYAN, CHANNEL_X, PURA, DALEM_C, lots, lotFrame, outward, height, flooded, TREAD } from './layout.js';

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
  for (let i = 0; i < L.length; i += 7) plans.push(base(`bali-compounds-${i / 7}`, 'balinese', L.slice(i, i + 7).map((l) => ({ t: 'bali_compound', rect: l.rect, front: l.front, seed: l.seed, rich: l.rich, gateF: l.gateF, shop: l.shop }))));
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
  // the pura dalem at the kelod end of the street, its split gate on the street
  E.push({ t: 'bali_dalem', c: DALEM_C, y: 0, turns: -1, seed: 31 });
  // canang on the street before each gate, two a day, and the cockfight's ring in the wantilan
  { const o = []; for (const l of L) { const [ox, oz] = outward(l), [gx, gz] = l.gate, tx = -oz, tz = ox; for (const k of [-0.5, 0.5]) o.push([gx + ox * 1.1 + tx * k, 0.01, gz + oz * 1.1 + tz * k]); } E.push({ t: 'bali_offerings', list: o }); }
  E.push({ t: 'bali_cockpit', c: [(WANTILAN[0] + WANTILAN[2]) / 2, -0.2], r: 2.1, y: 0.5 });
  // the field huts and scarecrows on the terraces' flat treads
  {
    let hut = 0, sc = 0;
    for (let k = 0; k < 600 && (hut < 14 || sc < 26); k++) {
      const a = rand() * 6.283, d = 110 + rand() * 62, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.95, r2 = Math.hypot(x, z);
      if (r2 > RADIUS - 12 || (x > CORE[0] - 3 && x < CORE[2] + 3 && z > CORE[1] - 3 && z < CORE[3] + 3)) continue;
      const y = height(x, z);
      if (![[2, 0], [-2, 0], [0, 2], [0, -2]].every(([dx, dz]) => Math.abs(height(x + dx, z + dz) - y) < 0.02)) continue;
      if (flooded(x, z, y)) continue;
      if (hut < 14 && rand() < 0.35) { E.push({ t: 'bali_pondok', at: [x, z], y }); hut++; } else if (sc < 26) { E.push({ t: 'bali_scarecrow', at: [x, z], y, h: 1.6 + rand() * 0.3 }); sc++; }
    }
  }
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
  // the market of the festival before the temple: stalls down both sides of the forecourt, sellers behind them, buyers before them, women with their goods on mats
  {
    const wares = [['heap', 'melons'], ['greens', 'spice'], ['bolts'], ['pottery', 'baskets'], ['baskets', 'heap'], ['spice', 'greens']], awn = ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_indigo'];
    let n = 0;
    for (let z = -68.5; z <= -47; z += 4.3) for (const sd of [-1, 1]) {
      const x = sd * 10.4, rot = sd < 0 ? Math.PI / 2 : -Math.PI / 2;
      E.push({ t: 'stall', at: [x, z], y: 0, rot, seed: 400 + n, awning: awn[n % 4], goods: wares[n % 6] });
      (n % 2 ? woman : man)([x + sd * 1.25, z + (rand() - 0.5) * 0.4], 0, rot + Math.PI, n % 3 ? { pose: 'talk' } : {});
      if (rand() < 0.6) (rand() < 0.5 ? woman : temple)([x - sd * 2.2, z + (rand() - 0.5) * 1.5], 0, rot, rand() < 0.5 ? { carry: 'basket' } : { pose: 'talk' });
      n++;
    }
    for (let z = -66; z <= -49; z += 5.6) for (const sd of [-1, 1]) {
      const x = sd * 5.9;
      E.push({ t: 'goods_mat', at: [x, z], y: 0, rot: rand() * 3, seed: 700 + n, goods: ['baskets', 'heap', 'greens'], mat: 'reed_mat' });
      woman([x + 0.1, z - 0.9], 0, rand() * 6.28, { pose: 'sit_ground', carry: 'none' });
      n++;
    }
    for (let k = 0; k < 6; k++) E.push({ t: 'basket', at: [-9.3 + rand() * 18.6, -70 + rand() * 20], y: 0, seed: 900 + k, n: 2 });
  }
  // the traders in the stalls of the street fronts, at their work; a customer before most
  for (const l of lots()) {
    if (!l.shop) continue;
    const F = lotFrame(l), { kind, u0, u1 } = l.shop, um = (u0 + u1) / 2, [ox, oz] = outward(l), out = Math.atan2(-ox, -oz), fl = 0.3;
    const at = (u, v) => F(u, v);
    if (kind === 'warung') woman(at(u0 + 0.95, 1.6), fl, out, { pose: 'talk' });
    else if (kind === 'pande') man(at(um + 0.3, 2.1), fl, out, { pose: 'squat', carry: 'none', top: 'bare' });
    else if (kind === 'carver') man(at(um, 2.4), fl, out, { pose: 'sit_ground' });
    else if (kind === 'weaver') woman(at(um, 0.75), fl + 0.28, out + Math.PI, { pose: 'sit_ground' });
    else if (kind === 'offerings') woman(at(u1 - 0.55, 1.7), fl, out, { pose: 'sit_ground' });
    else if (kind === 'potter') man(at(um, 1.85), fl, out, { pose: 'sit_ground' });
    else if (kind === 'cloth') man(at(um, 1.7), fl, out, { pose: 'talk' });
    else man(at(um, 1.8), fl, out, { pose: 'sit_ground' });
    if (rand() < 0.65) (rand() < 0.5 ? woman : man)(at(um + (rand() - 0.5) * 1.2, -1.2), 0, out + Math.PI + (rand() - 0.5) * 0.8, { pose: 'talk' });
    const wares = { warung: ['baskets'], offerings: ['baskets', 'greens'], cloth: ['bolts'], potter: ['pottery'], basket: ['baskets'], weaver: ['bolts'] }[kind];
    if (wares) { const p = at(um + (u1 - u0) / 2 + 0.2, -1.5); E.push({ t: 'goods_mat', at: p, y: 0, rot: Math.atan2(-ox, -oz), seed: l.seed, goods: wares, mat: 'reed_mat' }); }
  }
  // the street itself: women sweeping before the gates, women washing at the channel with the ducks beside, friends talking at the gate
  for (const l of lots()) {
    const [ox, oz] = outward(l), [gx, gz] = l.gate, tx = -oz, tz = ox, r = rand();
    if (r < 0.34) woman([gx + ox * 1.6 + tx * 1.2, gz + oz * 1.6 + tz * 1.2], 0, Math.atan2(tx, tz) + rand(), { pose: 'sweep', carry: 'besom' });
    else if (r < 0.58) { man([gx + ox * 1.9 - tx * 0.5, gz + oz * 1.9 - tz * 0.5], 0, Math.atan2(-tx, -tz) + rand() - 0.5, { pose: 'talk' }); man([gx + ox * 1.9 + tx * 0.5, gz + oz * 1.9 + tz * 0.5], 0, Math.atan2(tx, tz) + rand() - 0.5, { pose: 'talk' }); }
  }
  for (const z of [20, 44, 66, 92, 118]) {
    woman([CHANNEL_X + 0.85, z], 0, Math.PI / 2, { pose: 'squat', carry: 'none' });
    E.push({ t: 'basket', at: [CHANNEL_X + 0.8, z + 0.8], y: 0, seed: z, n: 2 });
    E.push({ t: 'chickens', at: [CHANNEL_X + 0.7, z + 3.2], n: 4, kind: 'duck', seed: z + 1, rot: 1.57 });
  }
  // the cockfight in the wantilan: the men squatting round the ring, their cocks in their hands (the cocks' baskets beside them), the bettors behind
  {
    const cx = (WANTILAN[0] + WANTILAN[2]) / 2, cz = -0.2, fl = 0.5;
    for (let k = 0; k < 14; k++) {
      const a = k / 14 * 6.283 + 0.2, rr = 2.9 + (k % 2) * 0.1, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr, rot = Math.atan2(x - cx, z - cz);
      if (z < -5.2) continue;
      man([x, z], fl, rot, { pose: 'squat', carry: 'none' });
    }
    for (let k = 0; k < 6; k++) { const a = rand() * 6.283, rr = 4.4 + rand() * 0.8, x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr; if (z > -5.0 && z < 3.4 && x > WANTILAN[0] + 0.5 && x < WANTILAN[2] - 0.5) man([x, z], fl, Math.atan2(cx - x, cz - z) + Math.PI, { pose: 'talk' }); }
    for (const [dx, dz] of [[-3.8, 1.5], [3.9, -1.0], [-2.0, 3.1]]) E.push({ t: 'basket', at: [cx + dx, cz + dz], y: fl, seed: dx * 10 + 90, n: 1 });
  }
  // the pura dalem: the priest and the women kneeling before the gedong, a man at the gate (the temple turned to face west: local (dx, dz) is world (cx − dz, cz + dx))
  {
    const [cx, cz] = DALEM_C, W2 = (dx, dz) => [cx - dz, cz + dx], fl = 0.4, east = -Math.PI / 2;
    temple(W2(0, -6.5), fl, east, { pose: 'seiza', arms: 'pray', hat: 'turban', beard: true });
    for (const dx of [-3, -1.5, 1.5, 3]) woman(W2(dx, -4.5), fl, east, { pose: 'seiza', arms: 'pray', cloth: 'cloth_white', hat: 'none', hair: 'bun' });
    woman(W2(-2, 4.5), fl, rand() * 6, { carry: 'basket' }); man(W2(2.4, 6.0), fl, rand() * 6, { pose: 'talk' });
  }
  // the buffalo pulling the plough in a dry paddy, the plowman behind it, and a boy with the ducks' stick at the water
  {
    let nb = 0;
    for (let k = 0; k < 300 && nb < 7; k++) {
      const a = rand() * 6.283, d = 116 + rand() * 50, x = Math.cos(a) * d, z = Math.sin(a) * d * 0.95;
      if (Math.hypot(x, z) > RADIUS - 14 || (x > CORE[0] - 2 && x < CORE[2] + 2 && z > CORE[1] - 2 && z < CORE[3] + 2)) continue;
      const y = height(x, z);
      if (![[2, 0], [-2, 0], [0, 2], [0, -2]].every(([dx, dz]) => Math.abs(height(x + dx, z + dz) - y) < 0.02) || flooded(x, z, y)) continue;
      const rot = rand() * 6.28;
      E.push({ t: 'animal', kind: 'buffalo', at: [x, z], y, rot, seed: 60 + k });
      man([x - Math.sin(rot) * -2.4, z - Math.cos(rot) * -2.4], y, rot, { carry: 'hoe', hat: 'straw', top: 'bare' }); nb++;
    }
  }
  void TREAD; void KULKUL; void BANYAN;
  return base('bali-people', 'life', [...P, ...E]);
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  return (CACHE = [...compounds(), village(), people()]);
}
