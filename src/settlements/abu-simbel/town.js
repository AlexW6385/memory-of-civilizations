// Abu Simbel — the townscape (docs/settlements/abu-simbel.md §5–§8): the cliff along the bank, the ramp and the quay with the boats, the priests' houses and
// the workmen's camp of mudbrick with their bakeries and granaries, the people of the terrace, the camp and the quay.

import { RADIUS, FX, FXS, ZS, WATER, BANK_X, QUAY, QUAY_Y, TERRACE, GATE, ALTAR, lots, granaries as granaryList } from './layout.js';
import { ground } from './ground.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, y = 0) => ({ id, style: 'ramesside', origin: [0, 0], base: y, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [FX + 44, 0], facing: 'w' } });
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));          // a figure faces −z when rot = 0
const h = (x, z) => ground.height(x, z);

/** Priests, the offering-bearers and the porters; the workmen and their women (docs/settlements/abu-simbel.md §7). */
function people() {
  const rand = rng(1256), T = [];
  const fig = (at, y, rot, o) => T.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: 'cloth_white', skin: 'skin_dark', hat: 'none', hair: 'shaven', hairMat: 'hair_dark', feet: 'bare', carry: 'none', pose: 'stand', ...o });
  // the temple's priests on the terrace: at the door in pairs, before the altar of Ra-Horakhty, along the terrace; the long kilt, the sash, the shaven head
  for (const z of [-2.4, 2.4]) fig([FX + 12, z], 0.04, -Math.PI / 2, { dress: 'wrap', over: 'sash', pose: 'stand' });
  fig([ALTAR.x + 3.6, ALTAR.z], 0.9, Math.PI / 2, { dress: 'wrap', over: 'sash', pose: 'kneel' }); fig([ALTAR.x + 4.4, ALTAR.z + 1.4], 0.9, Math.PI / 2, { pose: 'stand', over: 'sash' });
  fig([FX + 22, -9], 0.04, Math.PI / 2, { over: 'sash', pose: 'talk' }); fig([FX + 22.9, -8.6], 0.04, -Math.PI / 2, { pose: 'talk', hair: 'short' });
  fig([-14, 12], 0.04, 0.4, { over: 'sash', carry: 'staff', pose: 'staff', len: 1.7 });
  // inside: a priest at the offering stone in the sanctuary, a lector reading before the pillars
  fig([FX - 58.6 + 1.3, 0], 1.24, Math.PI / 2, { over: 'sash', pose: 'kneel' });
  fig([FX - 15, 0.0], 0.04, Math.PI / 2, { over: 'sash', pose: 'stand' });
  // along the terrace and the ramp: bearers with bread and beer, a man with a basket, a scribe
  for (let k = 0; k < 6; k++) { const x = FX + 8 + rand() * 40, z = (rand() - 0.5) * 20; if (x > BANK_X - 2) continue; fig([x, z], 0.04, rand() * 6.28, { dress: rand() < 0.5 ? 'wrap' : 'sheath', hair: rand() < 0.5 ? 'short' : 'long', carry: rand() < 0.5 ? 'basket' : 'pot' }); }
  // the quay: porters off the boats, the scribe counting, the overseer
  for (const [x, z] of [[48.5, -5], [49.4, 2.4], [52, 9]]) fig([x, z], QUAY_Y, rand() * 6.28, { carry: rand() < 0.5 ? 'basket' : 'pot', hair: 'short' });
  fig([53.5, -2], QUAY_Y, Math.PI / 2, { pose: 'kneel', over: 'sash', hair: 'long', dress: 'wrap' }); fig([54.6, -2.1], QUAY_Y, -Math.PI / 2, { pose: 'staff', carry: 'staff', len: 1.7, over: 'sash' });
  // the camp: women kneeling at the querns and the ovens, men carrying, boys
  for (const l of lots()) {
    if (l.kind === 'bakery') { const [x0, z0, x1, z1] = l.rect, at = [x0 + 1.2 + rand() * (x1 - x0 - 2.4), z1 - 2.3]; fig(at, h(...at), face(at, [at[0], at[1] + 1]), { dress: 'sheath', hair: 'long', pose: 'squat' }); continue; }
    if (rand() < 0.45) { const [x0, z0, x1, z1] = l.rect, x = (x0 + x1) / 2 + (rand() - 0.5) * 2, z = z1 + 1.6 + rand() * 0.8; fig([x, z], h(x, z), rand() * 6.28, rand() < 0.6 ? { dress: 'sheath', hair: 'long', carry: 'pot', top: 'sheath' } : { carry: 'basket', hair: 'short' }); }
  }
  return T;
}
function boats() {
  const rand = rng(1257), L = [], W = WATER;
  // moored at the quay's face: a barge of the sandstone blocks and the reed skiffs; a papyrus skiff drawn up at the bank
  L.push({ t: 'boat', kind: 'barge', len: 12, at: [QUAY[2] + 1.6, -6], y: W, rot: 0, seed: 11 });
  L.push({ t: 'boat', kind: 'reed', len: 6, at: [QUAY[2] + 1.4, 5], y: W, rot: 0.1, seed: 12 });
  L.push({ t: 'boat', kind: 'reed', len: 5.5, at: [QUAY[2] + 2.6, 9], y: W, rot: -0.15, seed: 13 });
  L.push({ t: 'boat', kind: 'reed', len: 5, at: [53.2, -20], y: W, rot: 1.2, seed: 14 });
  void rand;
  return L;
}

export async function town() {
  const plans = [];
  // the cliff along the bank: slices of the rock, the two temples left out of them (they are cut in it)
  plans.push(base('abu-simbel-cliff', [{ t: 'cliff', z0: -200, z1: 200, skip: [[-20, 20], [ZS - 16, ZS + 16]], seed: 1255 }]));
  // the ramp from the terrace's end down the bank to the quay (the ground's own height, kerbs either side), the quay with its bollards and the landing's steps
  {
    const pts = []; for (let x = BANK_X; x <= QUAY[0] + 0.1; x += 4) pts.push([x, h(x, 0) + 0.06]);
    pts[0][1] = 0.04;
    plans.push(base('abu-simbel-quay', [
      { t: 'ramp_way', pts, z0: -5, z1: 5 },
      { t: 'block', walk: true, rect: [QUAY[0], QUAY[1], QUAY[2], QUAY[3]], y0: -10, y1: QUAY_Y, mat: 'sandstone_dressed' },
      { t: 'bollards', y: QUAY_Y, posts: [[QUAY[2] - 0.6, -9], [QUAY[2] - 0.6, -3], [QUAY[2] - 0.6, 3], [QUAY[2] - 0.6, 9]] },
    ]));
  }
  // the camp: houses and bakeries of mudbrick, round granaries at its east
  const L = lots();
  const kinds = (l) => (l.kind === 'bakery' ? { t: 'bakery', rect: l.rect, seed: l.seed } : { t: 'mud_house', rect: l.rect, seed: l.seed, furnish: !!l.furnish });
  const north = L.filter((l) => l.quarter === 'priests'), south = L.filter((l) => l.quarter === 'camp');
  plans.push(base('abu-simbel-priests', north.map(kinds)));
  for (let i = 0; i < south.length; i += 14) plans.push(base(`abu-simbel-camp-${i / 14}`, south.slice(i, i + 14).map(kinds)));
  plans.push(base('abu-simbel-granaries', [{ t: 'granaries', list: granaryList(), y: 0 }]));
  plans.push({ ...base('abu-simbel-people', people()), style: 'life' });
  plans.push({ ...base('abu-simbel-boats', boats(), 0), style: 'life' });
  void TERRACE; void GATE; void FXS;
  return plans;
}
