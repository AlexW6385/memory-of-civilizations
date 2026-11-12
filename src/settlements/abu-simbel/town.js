// Abu Simbel — the townscape (docs/settlements/abu-simbel.md §5–§8, §13): the cliff and its talus, the terrace's furniture, the ramp and the quay with its
// goods and boats, the priests' lanes, the camp's rows of houses back to back with the market street and its shops, the bakeries and granaries, the masons' yard,
// the fields and shadufs of the bank, the people of terrace, market, lanes, quay and yard.

import { RADIUS, FX, FXS, ZS, WATER, BANK_X, QUAY, QUAY_Y, TERRACE, GATE, SGATE, ALTAR, MARKET, FIELDS, GRAN_YARD, WAY, cliffFace, lots, lanes, granaries as granaryList } from './layout.js';
import { ground } from './ground.js';
import { cliffTop } from '../../styles/ramesside/dims.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, y = 0, rooms = []) => ({ id, style: 'ramesside', origin: [0, 0], base: y, yaw: 0, feature: true, elements, rooms, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [FX + 44, 0], facing: 'w' } });
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));          // a figure faces −z when rot = 0
const h = (x, z) => ground.height(x, z);
export const YARD = [-36, 141, 10, 170];
const yardHere = Math.hypot(YARD[2], YARD[3]) < RADIUS - 5;

/** Where a point of a lot's canonical frame (its front to the south) lies in the world: lots facing north are mirrored in z. */
const toWorld = (l, [x, z]) => (l.front === 'n' ? [x, l.rect[1] + l.rect[3] - z] : [x, z]);
/** The craftsman's place and the one he works at, by trade, in the shop's frame { at, to, pose } (docs §13: the potter at his wheel, the weaver kneeling at the loom ...). */
function craftsman(l) {
  const [x0, z0, x1, z1] = l.rect, ix0 = x0 + 0.225, ix1 = x1 - 0.225, iz0 = z0 + 0.225, iz1 = z1 - 0.225, mid = (iz0 + iz1) / 2;
  switch (l.trade) {
    case 'potter': return { at: [ix0 + 1.0, mid + 0.85], to: [ix0 + 1.0, mid + 0.2], pose: 'sit_low' };
    case 'weaver': { const lx0 = ix0 + 0.5, lx1 = Math.min(ix1 - 0.8, lx0 + 2.4); return { at: [(lx0 + lx1) / 2, mid + 1.3], to: [(lx0 + lx1) / 2, mid + 0.3], pose: 'kneel' }; }
    case 'scribe': { const tx = (ix0 + ix1) / 2 - 0.3; return { at: [tx, mid + 0.88], to: [tx, mid], pose: 'sit_low', y: 0.08 }; }
    case 'sandals': { const bx = (ix0 + ix1) / 2; return { at: [bx, iz1 - 1.3 - 0.75], to: [bx, iz1 - 1.3], pose: 'sit_low' }; }
    case 'jeweller': return { at: [(ix0 + ix1) / 2, iz0 + 0.62], to: [(ix0 + ix1) / 2, z1], pose: 'stand' };
    case 'carpenter': return { at: [ix0 + 1.5, mid + 0.8], to: [ix0 + 1.5, mid], pose: 'stand' };
    case 'butcher': return { at: [ix1 - 0.8, iz1 - 1.55], to: [ix1 - 0.8, z1], pose: 'stand' };
    case 'brewer': return { at: [ix0 + 1.0, mid + 1.4], to: [ix0 + 1.0, mid + 0.5], pose: 'squat' };
  }
  return null;
}

/** Priests, pilgrims, vendors, craftsmen, bearers, workmen, women and children (docs/settlements/abu-simbel.md §9). */
function people() {
  const rand = rng(1256), T = [];
  const fig = (at, y, rot, o) => T.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'shendyt', top: 'bare', cloth: 'cloth_white', skin: rand() < 0.65 ? 'skin_dark' : 'skin_medium', hat: 'none', hair: 'shaven', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  const man = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'shendyt', over: 'belt', hair: rand() < 0.5 ? 'short' : 'wig', cloth: ['cloth_white', 'linen', 'cloth_white', 'cloth_ochre'][Math.floor(rand() * 4)], ...o });
  const woman = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'sheath', hair: 'long', cloth: ['cloth_white', 'linen', 'cloth_white'][Math.floor(rand() * 3)], over: rand() < 0.4 ? 'wesekh' : 'none', ...o });
  const kid = (at, y, rot, o = {}) => fig(at, y, rot, { child: true, dress: 'loincloth', over: 'none', hair: 'short', ...o });
  const priest = (at, y, rot, o = {}) => fig(at, y, rot, { dress: 'wrap', over: 'sash', ...o });
  const F = 0.04, X0 = TERRACE[0];
  // ── the temple's priests on the terrace: at the door in pairs, before the altar of Ra-Horakhty, along the terrace; the long kilt, the sash, the shaven head
  for (const z of [-2.4, 2.4]) priest([FX + 12, z], F, -Math.PI / 2);
  priest([ALTAR.x + 3.6, ALTAR.z], 0.9, Math.PI / 2, { pose: 'kneel' }); priest([ALTAR.x + 4.4, ALTAR.z + 1.4], 0.9, Math.PI / 2);
  priest([FX + 22, -9], F, Math.PI / 2, { pose: 'talk' }); fig([FX + 22.9, -8.6], F, -Math.PI / 2, { pose: 'talk', hair: 'short' });
  priest([-14, 12], F, 0.4, { carry: 'staff', pose: 'staff', len: 1.7 });
  // pilgrims and offerers at the tables before the colossi, kneeling and standing; one with a goose, one with a jar
  for (const zc of [-13.7, -5.9, 5.9, 13.7]) {
    const t = [X0 + 11.5, zc];
    if (rand() < 0.8) (rand() < 0.5 ? woman : man)([t[0] + 1.1, zc + (rand() - 0.5) * 0.8], F, Math.PI / 2, { pose: 'kneel', arms: 'pray' });
    if (rand() < 0.5) man([t[0] + 1.9, zc + 0.9 + rand()], F, Math.PI / 2, { carry: 'pot' });
  }
  // the harpist on a mat in the pilgrims' shade, a boy and a woman listening; a scribe on the bench writing for the pilgrims
  fig([X0 + 14, -23.5], F + 0.03, 0, { pose: 'harp', dress: 'shendyt', hair: 'wig', over: 'wesekh' }); woman([X0 + 15.6, -22.6], F, Math.PI / 2, { pose: 'sit_ground' }); kid([X0 + 12.2, -22.4], F, 1.2, { pose: 'sit_ground' });
  man([X0 + 14.3, 22.7], F + 0.42, Math.PI, { pose: 'sit', dress: 'wrap', over: 'sash', hair: 'shaven' }); woman([X0 + 12.9, 22.7], F + 0.42, Math.PI, { pose: 'sit' });
  // sitting along the walls on the benches in the shade, at the basins washing; pilgrims walking
  for (const [bx, zw, s] of [[X0 + 5, -28.1, 1], [X0 + 18, -28.1, 1], [X0 + 11.5, 28.1, -1], [X0 + 24.5, 28.1, -1]]) { man([bx - 0.5, zw + s * 0.1], F + 0.45, s > 0 ? 0 : Math.PI, { pose: 'sit', hair: 'short' }); if (rand() < 0.6) woman([bx + 0.5, zw + s * 0.1], F + 0.45, s > 0 ? 0 : Math.PI, { pose: 'sit' }); }
  for (const zb of [-17, 17]) { priest([X0 + 22 - 1.4, zb], F, Math.PI / 2, { pose: 'squat' }); }
  for (let k = 0; k < 12; k++) { const x = X0 + 6 + rand() * 46, z = (rand() - 0.5) * 36; if (x > BANK_X - 2 || (Math.abs(z) < 3 && x < X0 + 12)) continue; (rand() < 0.5 ? woman : man)([x, z], F, rand() * 6.28, rand() < 0.4 ? { carry: rand() < 0.5 ? 'basket' : 'pot' } : {}); }
  // inside: a priest at the offering stone in the sanctuary, a lector reading before the pillars, an old man resting on a bench
  priest([FX - 58.6 + 1.3, 0], 1.24, Math.PI / 2, { pose: 'kneel' });
  priest([FX - 15, 2.2], F, Math.PI / 2);
  man([FX - 14.8, 7.9], F + 0.45, Math.PI, { pose: 'sit', hair: 'shaven' });
  // the Small Temple's priestess at the door and a chanter before the Hathor pillars
  woman([FXS + 6, ZS - 3.7], F, Math.PI / 2, { dress: 'sheath', over: 'wesekh', hair: 'wig' }); priest([FXS + 12, ZS + 2.0], F, Math.PI / 2, { pose: 'kneel' });
  // the way north: a donkey-driver is the life pass's; a priest walking with offerings
  woman([-18, -60], F, 0.3, { carry: 'basket' }); man([-17.5, -90], F, 0, { carry: 'pot' });
  // ── the market street: at every shop the vendor behind the counter's window, a customer at it, the craftsman in his room
  const L = lots();
  for (const l of L) {
    if (l.kind !== 'shop') continue;
    const [x0, z0, x1, z1] = l.rect, left = rng(l.seed || 5)() < 0.5, W = x1 - x0, U = (u) => (left ? x0 + u : x1 - u), cw = (2.2 + Math.min(W - 0.4, 4.5)) / 2;
    const out = l.front === 'n' ? -1 : 1, W2 = (p) => toWorld(l, p), cx = U(cw);
    const c = craftsman(l);
    if (c) { const a = W2(c.at), to = W2(c.to); (l.trade === 'weaver' || l.trade === 'sandals' ? woman : man)(a, c.y ?? 0, face(a, to), { pose: c.pose }); }
    else { const a = W2([cx, z1 - 0.9]); man(a, 0, face(a, W2([cx, z1 + 2])), {}); }
    if (rand() < 0.75) { const a = W2([cx - 0.3, z1 - 0.9]); if (c) { const to = W2([cx, z1 + 2]); (rand() < 0.5 ? woman : man)(a, 0, face(a, to), { pose: 'stand' }); } }
    if (rand() < 0.8) { const a = W2([cx + (rand() - 0.5) * 1.2, z1 + 1.35]), to = W2([cx, z1 + 0.25]); (rand() < 0.6 ? woman : man)(a, 0, face(a, to), rand() < 0.4 ? { carry: 'basket' } : {}); }
    void out;
  }
  // in the street between: women with jars on their heads, men with sacks, boys running, two quarrelling over a price, a donkey-boy
  { const [mx0, mz0, mx1, mz1] = MARKET;
    for (let k = 0; k < 16; k++) { const x = mx0 + 3 + rand() * (mx1 - mx0 - 6), z = mz0 + 1.3 + rand() * (mz1 - mz0 - 2.6); (rand() < 0.5 ? woman : man)([x, z], 0, rand() * 6.28, rand() < 0.5 ? { carry: ['basket', 'pot', 'sack'][Math.floor(rand() * 3)], ...(rand() < 0.5 ? {} : {}) } : {}); }
    kid([mx0 + 14, mz0 + 2.4], 0, 0.5); kid([mx0 + 15.2, mz0 + 3.0], 0, 3.7); man([mx0 + 24, mz0 + 2.2], 0, Math.PI / 2, { pose: 'talk' }); man([mx0 + 24.9, mz0 + 2.3], 0, -Math.PI / 2, { pose: 'talk' }); }
  // ── the lanes: bearers, children at play, women grinding at doors, men on their way to work
  for (const ln of lanes()) {
    if (ln.kind === 'market') continue;
    const [x0, z0, x1, z1] = ln.r, horiz = x1 - x0 > z1 - z0, len = horiz ? x1 - x0 : z1 - z0, n = Math.floor(len / (ln.kind === 'cross' ? 20 : 9));
    for (let k = 0; k < n; k++) {
      const t = (k + 0.3 + rand() * 0.5) / n, x = horiz ? x0 + len * t : (x0 + x1) / 2 + (rand() - 0.5) * 1.0, z = horiz ? (z0 + z1) / 2 + (rand() - 0.5) * 1.2 : z0 + len * t, r = rand();
      if (Math.hypot(x, z) > RADIUS - 45) continue;
      if (r < 0.3) woman([x, z], 0, rand() * 6.28, { carry: rand() < 0.6 ? 'pot' : 'basket' });
      else if (r < 0.55) man([x, z], 0, rand() * 6.28, { carry: rand() < 0.4 ? 'sack' : 'none' });
      else if (r < 0.75) { kid([x, z], 0, rand() * 6.28, { pose: rand() < 0.5 ? 'sit_ground' : 'stand' }); kid([x + 0.7, z + 0.4], 0, rand() * 6.28, {}); }
      else if (r < 0.9) woman([x, z], 0, rand() * 6.28, { pose: 'squat' });
      else man([x, z], 0, rand() * 6.28, { pose: 'sit_ground' });
    }
  }
  // the camp's bakeries: the women kneeling at the ovens, a man with the loaves
  for (const l of L) {
    if (l.kind !== 'bakery') continue;
    const [x0, z0, x1, z1] = l.rect, at = [x0 + 1.2 + rand() * (x1 - x0 - 2.4), z1 - 2.3];
    woman(at, 0, face(at, [at[0], at[1] + 1]), { pose: 'squat' }); man([x1 - 1.0, z0 + 1.3], 0, 0, { carry: 'basket' });
  }
  // ── the quay: porters off the boats, the scribe counting, the overseer, women washing at the water's edge
  for (const [x, z] of [[48.5, -2], [49.4, 2.4], [52, 9], [55, 4.5], [57, -3.5]]) man([x, z], QUAY_Y, rand() * 6.28, { carry: rand() < 0.5 ? 'basket' : 'sack' });
  man([53.5, -1.0], QUAY_Y, Math.PI / 2, { pose: 'kneel', dress: 'wrap', over: 'sash', hair: 'wig' }); man([54.6, -1.1], QUAY_Y, -Math.PI / 2, { pose: 'staff', carry: 'staff', len: 1.7, dress: 'wrap', over: 'sash' });
  for (let k = 0; k < 3; k++) woman([QUAY[2] - 0.5, 6 + k * 1.1], QUAY_Y, Math.PI / 2, { pose: k === 1 ? 'kneel' : 'squat' });
  man([QUAY[2] - 0.5, -9.5], QUAY_Y, Math.PI / 2, { pose: 'squat', carry: 'rope' });
  // on the ramp: a man leading a donkey is the life pass's; two bearers with a stone-jar between them
  man([22, 1.5], h(22, 1.5), -Math.PI / 2, { carry: 'sack' }); woman([30, -1.2], h(30, -1.2), Math.PI / 2, { carry: 'pot' }); man([38, 0.5], h(38, 0.5), -Math.PI / 2, { carry: 'basket' });
  // ── the masons' yard: the dressers at their blocks, two hauling a sledge, the overseer with his staff
  if (yardHere) {
    const [x0, z0, x1, z1] = YARD;
    for (let k = 0; k < 6; k++) { const x = x0 + 6 + rand() * (x1 - x0 - 12), z = z0 + 6 + rand() * (z1 - z0 - 14); man([x, z], 0, rand() * 6.28, { pose: rand() < 0.5 ? 'kneel' : 'squat', hair: 'short', cloth: 'cloth_white' }); }
    for (let k = 0; k < 3; k++) man([x0 + 11 - k * 1.2, z1 - 5.5 + (k % 2) * 0.4], 0, Math.PI / 2, { pose: 'pull', hair: 'short' });
    man([x0 + 20, z0 + 8], 0, 2, { pose: 'staff', carry: 'staff', len: 1.7, dress: 'wrap', over: 'sash', hair: 'wig' });
  }
  // ── the fields: the hoers and the man at the shaduf
  for (const [x, z] of [[22, -30], [26, -40], [24, 30], [27, 42]]) man([x, z], h(x, z), rand() * 6.28, { carry: 'hoe', hair: 'short', dress: 'loincloth', over: 'none' });
  // ── a procession across the terrace to the door, in the arrival's view: priests with the offerings for the morning rite, bearers behind them, a boy with a goose
  {
    const r2 = rng(1257), line = (k) => [-10.5 - k * 2.3, 5.4 + Math.sin(k * 0.9) * 0.7 + (r2() - 0.5) * 0.3];
    const kinds = [
      (a) => priest(a, F, Math.PI / 2, { carry: 'staff', pose: 'staff', len: 1.7 }), (a) => priest(a, F, Math.PI / 2, { carry: 'pot' }), (a) => priest(a, F, Math.PI / 2, { carry: 'basket' }),
      (a) => woman(a, F, Math.PI / 2, { carry: 'pot' }), (a) => man(a, F, Math.PI / 2, { carry: 'basket' }), (a) => woman(a, F, Math.PI / 2, { carry: 'basket' }),
      (a) => man(a, F, Math.PI / 2, { carry: 'sack' }), (a) => kid(a, F, Math.PI / 2, {}),
    ];
    kinds.forEach((f, k) => f(line(k)));
  }
  return T;
}

function boats() {
  const L = [], W = WATER, Q = QUAY;
  // moored at the quay's face: a barge of the sandstone blocks, reed skiffs; a papyrus skiff drawn up at the bank; fishermen at their nets out on the river
  L.push({ t: 'boat', kind: 'barge', len: 12, at: [Q[2] + 1.6, -6], y: W, rot: 0, seed: 11 });
  L.push({ t: 'boat', kind: 'reed', len: 6, at: [Q[2] + 1.4, 5], y: W, rot: 0.1, seed: 12 });
  L.push({ t: 'boat', kind: 'reed', len: 5.5, at: [Q[2] + 2.6, 9], y: W, rot: -0.15, seed: 13 });
  L.push({ t: 'boat', kind: 'reed', len: 5, at: [53.2, -20], y: W, rot: 1.2, seed: 14 });
  L.push({ t: 'boat', kind: 'barge', len: 14, at: [Q[2] + 4.2, -17.5], y: W, rot: 0.04, seed: 15 });
  L.push({ t: 'boat', kind: 'reed', len: 4.6, at: [75, 22], y: W, rot: 0.8, seed: 16 }, { t: 'boat', kind: 'reed', len: 4.8, at: [82, 31], y: W, rot: 0.3, seed: 17 }, { t: 'boat', kind: 'reed', len: 5.2, at: [70, -34], y: W, rot: 1.9, seed: 18 });
  L.push({ t: 'boat', kind: 'reed', len: 5, at: [57, 26], y: W, rot: 1.45, seed: 19 }, { t: 'boat', kind: 'reed', len: 5.4, at: [59, 38], y: W, rot: 1.5, seed: 20 });
  return L;
}
/** The crews of the boats: poling fishermen, a bargeman, and the catch. */
function crews() {
  const T = [], W = WATER, fig = (at, y, rot, o) => T.push({ t: 'figure', at, y, rot, seed: Math.floor(at[0] * 31 + at[1] * 17), dress: 'loincloth', top: 'bare', cloth: 'cloth_white', skin: 'skin_dark', hat: 'none', hair: 'short', feet: 'bare', carry: 'none', pose: 'stand', over: 'none', ...o });
  for (const [x, z, rot] of [[75, 22, 0.8], [82, 31, 0.3], [70, -34, 1.9], [57, 26, 1.45], [59, 38, 1.5]]) fig([x - Math.sin(rot) * 1.2, z - Math.cos(rot) * 1.2], W + 0.25, rot + Math.PI, { pose: 'punt', carry: 'punt', len: 3.2 });
  fig([QUAY[2] + 1.6, -4.8], W + 0.6, Math.PI / 2, { pose: 'stand', carry: 'staff', len: 1.6, dress: 'shendyt' });
  fig([QUAY[2] + 1.4, 5.8], W + 0.25, 0, { pose: 'squat' });
  return T;
}

/** The cliff's slices exactly as the style cuts them (shore.js cliff: its dice are replayed), for the weathering of the face: [[x of the face, z, height]]. */
function cliffPts() {
  const r = rng(1255), skip = [[-20, 20], [ZS - 16, ZS + 16]], out = [];
  for (let z = -200; z < 200; z += 4) {
    const zm = z + 2;
    if (skip.some(([a, b]) => zm > a && zm < b)) continue;
    const near = skip.some(([a, b]) => zm > a - 12 && zm < b + 12), top = cliffTop(zm) + (near ? 0 : (r() - 0.5) * 2.4);
    if (top < 0.8) continue;
    const xf = cliffFace(zm) + (near ? 0 : (r() - 0.5) * 0.8);
    if (zm > -150 && zm < 150 && top > 8) out.push([xf, zm, top]);
  }
  return out;
}

export async function town() {
  const plans = [];
  // the cliff along the bank: slices of the rock, the two temples left out of them (they are cut in it); its talus
  plans.push(base('abu-simbel-cliff', [{ t: 'cliff', z0: -200, z1: 200, skip: [[-20, 20], [ZS - 16, ZS + 16]], seed: 1255 }, { t: 'cliff_wear', pts: cliffPts(), seed: 29 }]));
  { const pts = [], r = rng(77); for (let z = -190; z < 190; z += 3.2 + r() * 3.4) { if ((z > -22 && z < 22) || (z > ZS - 18 && z < ZS + 18)) continue; pts.push([cliffFace(z), z]); } plans.push(base('abu-simbel-talus', [{ t: 'talus', pts, seed: 17 }])); }
  // the way to the Small Temple: low walls, standards; gaps where the priests' lanes open on it
  plans.push(base('abu-simbel-way', [{ t: 'way_dress', x0: WAY[0], x1: WAY[2], z0: WAY[1] + 0.5, z1: -31.4, gaps: [[-41.4, -35], [-61.4, -56.4], [-81.4, -76.4]], y: 0.04, seed: 37 }]));
  // the terrace: benches, offering tables, braziers, basins, shades, sand against the walls
  plans.push(base('abu-simbel-terrace', [{ t: 'terrace_dress', x0: TERRACE[0], x1: TERRACE[2], z0: TERRACE[1], z1: TERRACE[3], y: 0.04, gates: [GATE.x, SGATE.x], seed: 31 }]));
  // the ramp from the terrace's end down the bank to the quay (the ground's own height, kerbs either side), the quay with its bollards, its goods and its store
  {
    const pts = []; for (let x = BANK_X; x <= QUAY[0] + 0.1; x += 4) pts.push([x, h(x, 0) + 0.06]);
    pts[0][1] = 0.04;
    plans.push(base('abu-simbel-quay', [
      { t: 'ramp_way', pts, z0: -5, z1: 5 },
      { t: 'block', walk: true, rect: [QUAY[0], QUAY[1], QUAY[2], QUAY[3]], y0: -10, y1: QUAY_Y, mat: 'sandstone_dressed' },
      { t: 'bollards', y: QUAY_Y, posts: [[QUAY[2] - 0.6, -9], [QUAY[2] - 0.6, -3], [QUAY[2] - 0.6, 3], [QUAY[2] - 0.6, 9]] },
      { t: 'quay_dress', rect: [QUAY[0], QUAY[1], QUAY[2], QUAY[3]], y: QUAY_Y, seed: 41 },
    ]));
  }
  // the bank: contour ridges of the fields (low walls of mud holding the water), shadufs at the lower edge
  {
    const E = [];
    for (const [fx0, fz0, fx1, fz1] of FIELDS) {
      for (let x = fx0 + 1; x <= fx1; x += 4.5) for (let z = fz0; z < fz1; z += 4) { const y = h(x, z + 2); E.push({ t: 'block', rect: [x - 0.18, z, x + 0.18, z + 4], y0: y - 0.5, y1: y + 0.22, mat: 'mud_plaster' }); }
      for (const zz of [fz0 + 3, fz1 - 3]) { const x = fx1 + 3, y = h(x, zz); E.push({ t: 'shaduf', at: [x, zz], y, rot: 0 }); }
    }
    plans.push(base('abu-simbel-bank', E));
  }
  // the houses of the priests' lanes (whitewashed fronts), the camp's rows back to back
  const L = lots();
  const house = (l) => ({ t: 'ram_house', rect: l.rect, seed: l.seed, furnish: l.furnish, front: l.front, wash: l.quarter === 'priests' || l.seed % 5 < 2 });
  plans.push(base('abu-simbel-priests', L.filter((l) => l.quarter === 'priests').map(house)));
  const camp = L.filter((l) => l.quarter === 'camp'), market = camp.filter((l) => l.kind !== 'house' || l.rect[1] < 55), rest = camp.filter((l) => !market.includes(l));
  // the market: the shops and bakeries on the street, the lanes' washing and the shades over the street
  plans.push(base('abu-simbel-market', [
    ...market.map((l) => (l.kind === 'shop' ? { t: 'ram_shop', rect: l.rect, seed: l.seed, front: l.front, trade: l.trade, shop: true } : l.kind === 'bakery' ? { t: 'bakery', rect: l.rect, seed: l.seed, front: 'n' } : house(l))),
    { t: 'lane_dress', lanes: lanes().filter((x) => x.r[1] < 60 || x.kind === 'cross'), market: MARKET, seed: 23 },
  ], 0, [{ id: 'the market street', kind: 'open', rect: MARKET, y: 0, market: true }]));
  const shopsAt = (l) => (l.kind === 'shop' ? { t: 'ram_shop', rect: l.rect, seed: l.seed, front: l.front, trade: l.trade, shop: true } : l.kind === 'bakery' ? { t: 'bakery', rect: l.rect, seed: l.seed, front: 'n' } : house(l));
  for (let i = 0; i < rest.length; i += 14) plans.push(base(`abu-simbel-camp-${i / 14}`, rest.slice(i, i + 14).map(shopsAt)));
  plans.push(base('abu-simbel-lanes', [{ t: 'lane_dress', lanes: lanes().filter((x) => x.r[1] >= 60 && x.kind !== 'cross'), seed: 24 }]));
  plans.push(base('abu-simbel-granaries', [{ t: 'granaries', list: granaryList(), y: 0 }]));
  if (yardHere) plans.push(base('abu-simbel-yard', [{ t: 'masons_yard', rect: YARD, y: 0, seed: 53 }]));
  plans.push({ ...base('abu-simbel-people', people()), style: 'life' });
  plans.push({ ...base('abu-simbel-boats', [...boats(), ...crews()], 0), style: 'life' });
  void GRAN_YARD; void FXS; void ALTAR;
  return plans;
}
