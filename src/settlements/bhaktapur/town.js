// Bhaktapur's town (docs/settlements/bhaktapur.md §2, §4, §6): the brick streets, the small stupas at the crossings, the houses in
// four plans (each builds in turn while the visitor already walks), and the people and animals of the squares and lanes:
// the potters at their wheels, the market's sellers and buyers, women with water pots and baskets, children, dogs, a cow or two.

import { RADIUS, lots, PAVED, SQ, POT, KEEP, HOUSE, STALLS, inRect, onStreet, inLot, STREETS, fp, frontRot, NYA } from './layout.js';
import taumadhi, { POT_WHEELS, POT_KILNS } from './plan.js';
import './../../styles/newar/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [16, 6], facing: 'n' } });

/** Newar townspeople about 1710 [inferred dress]: men in a wrapped tunic and tight trousers with the topi, a sash; women in the black patasi with a red shawl, the hair in a bun; children. */
export function newar(rand) {
  const skin = () => (rand() < 0.75 ? 'skin_medium' : 'skin_dark');
  const man = (at, y, rot, o = {}) => ({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'trousers', cloth: ['cloth_white', 'cloth_ochre', 'cloth_grey', 'cloth_white'][Math.floor(rand() * 4)], cloth2: ['cloth_white', 'cloth_grey'][Math.floor(rand() * 2)], over: rand() < 0.5 ? 'sash' : 'belt', skin: skin(), hat: 'cap', hatMat: ['cloth_black', 'cloth_red', 'cloth_indigo'][Math.floor(rand() * 3)], feet: 'bare', hair: 'short', beard: false, ...o });
  const woman = (at, y, rot, o = {}) => ({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: rand() < 0.6 ? 'cloth_black' : ['cloth_red', 'cloth_indigo', 'cloth_maroon'][Math.floor(rand() * 3)], cloth2: 'cloth_red', over: 'shawl', skin: skin(), hat: 'none', feet: 'bare', hair: 'bun', ...o });
  return { man, woman };
}

export async function town() {
  const rand = rng(1710), L = lots();
  const out = [];
  // the streets' brick paving, and the small stupas at some crossings
  out.push(base('bhaktapur-streets', 'newar', [...PAVED.map((rect) => ({ t: 'newar_paving', rect, y: 0.05, th: 0.3, mat: 'brick_paving' })), ...PAVED.map((rect, i) => ({ t: 'newar_lane', rect, y: 0.05, seed: i + 3 }))]));
  const stupas = [];
  for (const [x, z] of [[8, -72], [8, 44], [-52, 0], [60, 0], [-52, -72], [60, 44], [-82, 0], [94, 0], [8, -106], [8, 78]]) if (Math.hypot(x, z) < 150) stupas.push({ t: 'newar_chaitya', c: [x, z], s: 0.9 });
  out.push(base('bhaktapur-shrines', 'newar', stupas));
  // the houses, by quadrant
  const Q = [[], [], [], []];
  const courts = [];
  for (const l of L) { if (l.use) { courts.push({ t: 'newar_court', rect: l.rect, front: l.front, use: l.use, seed: l.seed }); continue; } const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2; Q[(cx < 0 ? 0 : 1) + (cz < 0 ? 0 : 2)].push({ t: 'newar_house', ...l }); }
  Q.forEach((els, i) => out.push(base('bhaktapur-houses-' + i, 'newar', els)));
  out.push(base('bhaktapur-courts', 'newar', courts));
  // the people
  const { man, woman } = newar(rand), P = [];
  // the walk-check's routes are kept clear of figures (they stand as obstacles)
  const nearRoute = (x, z) => taumadhi.walks.some((w) => w.some((a, i) => { if (!i) return false; const b = w[i - 1], dx = a[0] - b[0], dz = a[1] - b[1], t = Math.max(0, Math.min(1, ((x - b[0]) * dx + (z - b[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(x - b[0] - dx * t, z - b[1] - dz * t) < 1.4; }));
  const free = (x, z, m = 1.3) => !nearRoute(x, z) && !KEEP.some((k) => inRect(k, x, z, m)) && !inLot(x, z, 0.6) && !inRect(HOUSE.rect, x, z, 0.6) && !STALLS.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 2) && !P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.3) && !POT_KILNS.some(([kx, kz]) => Math.hypot(x - kx, z - kz) < 5);
  const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
  // the potters at their wheels (seated north of each wheel, facing it), and the pot-sellers by the drying ground
  for (const [x, z] of POT_WHEELS) P.push(man([x + 0.1, z - 0.55], 0, Math.PI, { pose: 'sit_low', hat: 'cap', hatMat: 'cloth_ochre', hair: 'short' }));
  for (const [x, z] of POT_KILNS) { P.push(man([x + 2.6, z + 1.2], 0, 2.2)); P.push(woman([x - 2.5, z + 1.8], 0, 0.8, { carry: 'basket' })); }
  for (let k = 0; k < 7; k++) { const x = POT[0] + 6 + rand() * (POT[2] - POT[0] - 12), z = 78 + rand() * 6 * 0; if (free(x, z, 0.5) && !(x > -81 && x < -75)) P.push((k % 2 ? man : woman)([x, 54.5 + rand() * 1.4], 0, rand() * 6.28, { pose: 'talk' })); }
  // the market in Taumadhi: a seller behind each stall, a buyer before it
  for (const [x, z, yaw] of STALLS) {
    P.push((rand() < 0.5 ? man : woman)([x, z - 0.95], 0, Math.PI, { pose: 'sit_low' }));
    P.push((rand() < 0.5 ? woman : man)([x + 0.3, z + 0.95], 0, 0, { pose: 'talk' }));
    void yaw;
  }
  // the square: people crossing, talking in twos, women with water pots and baskets, children, the elders on the dabali and the pati
  for (let k = 0; k < 80; k++) {
    const x = SQ[0] + 2 + rand() * (SQ[2] - SQ[0] - 4), z = SQ[1] + 2 + rand() * (SQ[3] - SQ[1] - 4);
    if (!free(x, z)) continue;
    const r = rand(), rot = rand() * 6.28;
    if (r < 0.25) P.push(woman([x, z], 0, rot, { carry: rand() < 0.5 ? 'pot' : 'basket' }));
    else if (r < 0.38) P.push(woman([x, z], 0, rot, { child: true, h: 1.1 }));
    else if (r < 0.7) { P.push(man([x, z], 0, rot, { pose: 'talk' })); const b = [x + Math.sin(rot) * -1.1, z + Math.cos(rot) * -1.1]; if (free(b[0], b[1], 0.3)) P.push((rand() < 0.5 ? man : woman)(b, 0, face(b, [x, z]))); }
    else P.push(man([x, z], 0, rot));
  }
  for (const [x, z] of [[24.5, 14], [27.5, 14.4], [30.5, 13.8]]) P.push(man([x, z], 0.8, Math.PI, { pose: 'sit_low' }));              // on the dabali
  for (const [x, z] of [[11, -29], [14.5, -29.5], [17.5, -28.8]]) P.push((rand() < 0.5 ? man : woman)([x, z], 0.55, 0.0, { pose: 'sit_ground' }));    // in the pati
  // the shop-houses: a keeper at the goods, a customer at the opening; the seats of the pidha before the plain houses; the courts' people
  const mkP = (m, w) => (rand() < 0.62 ? m : w);
  for (const l of L) {
    if (l.use) {
      const [x0, z0, x1, z1] = l.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rot = frontRot(l.front), dir = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] }[l.front], side = [-dir[1], dir[0]];
      const at = (u, v) => [cx + dir[0] * v + side[0] * u, cz + dir[1] * v + side[1] * u];
      if (l.use === 'dhara') { for (const [u, v] of [[-0.8, 1.9], [0.8, 2.0]]) { const q = at(u, v); P.push(woman(q, 0, rot + Math.PI, { carry: 'pot' })); } const q = at(0.1, 2.9); P.push(woman(q, 0, rot, { child: true, h: 1.05 })); }
      else if (l.use === 'pati') for (const [u, v] of [[-1.2, 0.6], [0.2, 0.2], [1.4, 0.7]]) { const q = at(u, v); P.push(mkP(man, woman)(q, 0.55, rot, { pose: u < 0 ? 'sit_ground' : 'sit_low' })); }
      else if (l.use === 'tree') { const q = at(1.7, 0.2); P.push(man(q, 0.45, rot + 1.2, { pose: 'sit_low' })); const q2 = at(-1.7, 0.3); P.push(woman(q2, 0.45, rot - 1.0, { pose: 'sit_low' })); }
      else { const q = at(0, 2.7); P.push(woman(q, 0.05, rot + Math.PI, { pose: 'kneel', arms: 'pray' })); }
      continue;
    }
    const W = l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1];
    if (Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) > 105) continue;
    const rot = frontRot(l.front);
    if (l.open) {
      const kx = l.trade === 'cloth' ? W - 0.55 - 2.2 : l.trade === 'carver' ? W - 0.55 - 1.9 : W / 2 + (rand() - 0.5) * 1.2, kz = l.trade === 'carver' ? 3.3 : l.trade === 'cloth' ? 3.1 : l.trade === 'grain' ? 3.3 : 2.75;
      const kp = fp(l, kx, kz); P.push(mkP(man, woman)(kp, 0.1, rot, { pose: l.trade === 'carver' ? 'sit_low' : 'stand' }));
      if (rand() < 0.65) { const cp = fp(l, W / 2 + (rand() - 0.5) * 2, -0.9); P.push(mkP(woman, man)(cp, 0.05, rot + Math.PI, { pose: 'talk' })); }
    } else if (l.pid && rand() < 0.7) {
      const dx = l.dx, a = dx - 0.2 > 1.2 ? 0.7 : dx + 2.1, p = fp(l, a, -0.38);
      P.push(mkP(man, woman)(p, 0.46, rot, { pose: 'sit_low' })); if (rand() < 0.5) P.push(woman(fp(l, a + 0.5, -0.4), 0.46, rot + 0.3, { pose: 'sit_low' }));
    } else if (rand() < 0.1) { P.push(woman(fp(l, l.dx + 0.6, -1.1), 0.05, rot + Math.PI, { pose: 'sit_ground', carry: 'basket' })); }
  }
  // the worshippers on the treads of the Nyatapola's plinth, women with their offerings
  for (const [k, z] of [[1, -5.8], [1, 5.9], [2, 5.7], [2, -6.1], [3, 5.4]]) P.push(woman([NYA.c[0] + [14.4, 12.2, 10, 7.8][k] + 1.25, NYA.c[1] + z], k, -Math.PI / 2, { pose: 'sit_ground' }));
  // the lanes: walkers going about, a few with loads
  for (let k = 0; k < 150; k++) {
    const s = PAVED[Math.floor(rand() * PAVED.length)], x = s[0] + 0.8 + rand() * Math.max(0.1, s[2] - s[0] - 1.6), z = s[1] + 0.8 + rand() * Math.max(0.1, s[3] - s[1] - 1.6);
    if (Math.hypot(x, z) > 120 || !free(x, z, 0.5) || !onStreet(x, z, -0.5)) continue;
    const r = rand(), rot = rand() * 6.28;
    if (r < 0.3) P.push(woman([x, z], 0, rot, { carry: rand() < 0.4 ? 'pot' : 'basket' }));
    else if (r < 0.4) P.push(woman([x, z], 0, rot, { child: true, h: 1.05 }));
    else if (r < 0.55) P.push(man([x, z], 0, rot, { carry: 'sack' }));
    else P.push((rand() < 0.5 ? man : woman)([x, z], 0, rot));
  }
  // dogs in the lanes, a cow in the square and one in a lane, a goat or two
  const A = [];
  for (let k = 0; k < 16; k++) { const s = PAVED[Math.floor(rand() * PAVED.length)], x = s[0] + 1 + rand() * Math.max(0.1, s[2] - s[0] - 2), z = s[1] + 1 + rand() * Math.max(0.1, s[3] - s[1] - 2); if (Math.hypot(x, z) < 110 && free(x, z, 0.5)) A.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 }); }
  for (const [x, z] of [[-18, -2], [30, 30], [-60, -70]]) A.push({ t: 'animal', kind: 'zebu', at: [x, z], y: 0, rot: rand() * 6.28, seed: Math.round(x) });
  // water buffalo in two lanes, a cat on a pidha here and there, dogs sleeping before the shops
  for (const [x, z] of [[-24, 5], [70, -40]]) A.push({ t: 'animal', kind: 'buffalo', at: [x, z], y: 0, rot: rand() * 6.28, seed: Math.round(x) + 9 });
  for (const l of L) if (!l.use && !l.open && l.pid && rand() < 0.22 && Math.hypot(...fp(l, 2, 0)) < 100) { const q = fp(l, 3.2, -0.45); A.push({ t: 'animal', kind: 'cat', at: q, y: 0.46, rot: rand() * 6.28, seed: l.seed % 97 }); }
  for (const l of L) if (l.open && rand() < 0.35) { const q = fp(l, (l.rect[2] - l.rect[0] > 0 ? 1.0 : 1.0) + rand() * 2, -1.2); A.push({ t: 'animal', kind: 'dog', at: q, y: 0.05, rot: rand() * 6.28, seed: l.seed % 53 }); }
  for (const [x, z] of [[8, 60], [-70, -30]]) A.push({ t: 'animal', kind: 'goat', at: [x, z], y: 0, rot: rand() * 6.28, seed: Math.round(z) });
  void STREETS;
  // the arrival (src/planet/arrivals.js, 19 m, 21 m): no figure within 6 m of the visitor's feet, and none close on the right of the lens
  const AR = [19, 21];
  const awayFromArrival = (e) => Math.hypot(e.at[0] - AR[0], e.at[1] - AR[1]) > 6;
  out.push({ ...base('bhaktapur-people', 'life', [...P.filter(awayFromArrival), ...A.filter(awayFromArrival)]), feature: true });
  return out;
}
