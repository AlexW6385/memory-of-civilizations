// The village of Mount Wutai's valley (docs/settlements/tang-wutai.md §5): walled yards on a lane grid, each with its
// house at the back (flat earth roof, single-pitch roof or brick-arched), often a side wing, the yard's gate on the
// lane; a well and a stone roller mill on the green; the goods and animals of the yards (plan of the `life` style).
// Elements of the chinese style (src/styles/chinese/village.js). Pure data from layout.js.

import { lots, height, GREEN, GATE_X } from './layout.js';
import { frame, dirOf } from '../../styles/chinese/village.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const g4 = (r) => [height(r[0], r[1]), height(r[2], r[1]), height(r[0], r[3]), height(r[2], r[3])];
const gh = (x, z) => height(x, z);

let BUILT = null;
/** { chinese: [elements], life: [elements], doors: [[x, z]] } for the whole village (computed once). */
export function village() {
  if (BUILT) return BUILT;
  const C = [], Lf = [], smoke = [];
  const all = lots();
  // the open houses: the three yards nearest the gate on the main lane's two sides, an inn first
  const near = [...all].filter((l) => (l.rect[2] - l.rect[0]) >= 13).sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2 + 76, (a.rect[1] + a.rect[3]) / 2) - Math.hypot((b.rect[0] + b.rect[2]) / 2 + 76, (b.rect[1] + b.rect[3]) / 2)).slice(0, 3);
  for (const l of all) {
    const rand = rng(l.seed), fr = frame(l.rect, l.front), { L, D, P, R } = fr, open = near.includes(l);
    const dist = Math.hypot((l.rect[0] + l.rect[2]) / 2 + 80, (l.rect[1] + l.rect[3]) / 2);
    // the gate on the lane side, away from the house's front door
    const gu = L * (0.22 + rand() * 0.2) + (rand() < 0.5 ? L * 0.38 : 0);
    C.push({ t: 'wutai_yard', rect: l.rect, front: l.front, hc: g4(l.rect), gate: [gu, 2.2], seed: l.seed, wall: rand() < 0.6 ? 'earth_wall' : 'mud_plaster' });
    // the house: by the yard's means — the inner yards richer (brick-arched, three bays), the outer poorer
    const r = rand(), rich = dist < 70 || r < 0.2;
    let kind = open ? 'flat' : rich && r < 0.45 ? 'arch' : r < 0.6 ? 'flat' : r < 0.85 ? 'shed' : 'flat';
    const wing = L >= 16 && rand() < 0.75, nb = rich || open ? 3 : 2 + (rand() < 0.4 ? 1 : 0), bay = kind === 'arch' ? 3.6 : 3.3, Wh = nb * bay;
    const Dh = kind === 'arch' ? 4.8 : kind === 'shed' ? 5.0 : 5.4;
    const v0 = D - 1.3 - Dh, u0 = Math.min(L - Wh - 1.0, wing ? 4.9 + rand() * 1.0 : (L - Wh) / 2 + (rand() - 0.5) * 1.2);
    const hr = R(u0, v0, u0 + Wh, v0 + Dh), hs = [[hr[0], hr[1]], [hr[2], hr[1]], [hr[0], hr[3]], [hr[2], hr[3]]].map(([x, z]) => gh(x, z));
    // the house's front faces the lane, as the yard does
    C.push({ t: 'wutai_house', rect: hr, front: l.front, y: Math.max(...hs), foot: Math.min(...hs), seed: l.seed + 7, kind, nb, ...(open ? { open: true } : {}) });
    const hy = Math.max(...hs), vf = v0, doorU = u0 + (Math.floor(nb / 2) + 0.5) * bay;
    smoke.push({ p: [...P(u0 + Wh - 0.5, v0 + Dh - 0.6)], y: hy + 0.4 + (kind === 'shed' ? 2.5 : 3.7), r: l.seed });
    // the wing: a lean-to of two rooms along the yard's side wall, facing across the yard
    if (wing) {
      const wr = R(0.7, v0 - 0.5, 0.7 + 3.4, v0 - 0.5 + 6.2), ws = [[wr[0], wr[1]], [wr[2], wr[1]], [wr[0], wr[3]], [wr[2], wr[3]]].map(([x, z]) => gh(x, z));
      C.push({ t: 'wutai_house', rect: wr, front: dirOf(fr, 1, 0), y: Math.max(...ws), foot: Math.min(...ws), seed: l.seed + 11, kind: 'shed', nb: 2, bare: true });
    }
    // the yard's things: the water vat by the door, firewood against the house's side, a haystack or the drying rack,
    // hens, now and then a goat or a donkey, a ladder on a flat roof's side
    const at = (u, v) => P(u, v), put = (el, u, v, extra = {}) => { const [x, z] = at(u, v); Lf.push({ ...el, at: [x, z], y: gh(x, z), ...extra }); };
    const yaw = { n: 0, s: Math.PI, e: -Math.PI / 2, w: Math.PI / 2 };
    put({ t: 'pot', kind: 'vat', n: 1, seed: l.seed }, doorU + 1.2, vf - 0.9);
    put({ t: 'firewood', seed: l.seed + 3, rot: yaw[l.front] + Math.PI / 2 }, u0 + Wh + 0.7, v0 + 1.0);
    if (rand() < 0.6) put({ t: 'chickens', n: 3 + Math.floor(rand() * 3), kind: 'hen', seed: l.seed + 5 }, Math.min(L - 2, u0 + Wh * 0.5), vf - 2.6);
    if (rand() < 0.35) put({ t: 'haystack', seed: l.seed + 9 }, Math.max(1.8, u0 - 1.6), 2.2);
    if (rand() < 0.22) put({ t: 'animal', kind: ['goat', 'sheep', 'donkey', 'ox'][Math.floor(rand() * 4)], seed: l.seed + 13, rot: rand() * 6.28 }, L * (0.3 + rand() * 0.4), vf - 4.2);
    if (kind === 'flat' && !open && rand() < 0.5) put({ t: 'ladder', seed: l.seed + 15, rot: yaw[l.front] }, u0 + Wh - 1.0, v0 - 0.1);
    if (rand() < 0.45) { const [x, z] = at(L * 0.55, vf - 1.4); C.push({ t: 'wutai_rack', at: [x, z], y: gh(x, z), rot: l.front === 'n' || l.front === 's' ? 0 : Math.PI / 2, len: 3 }); }
    // the front yard's work (second pass): corn and peppers drying, a stone roller or a millstone, a cart or a barrow
    // against the side wall, a trough, a washing line, stools and a basket for the work of the hands, a rain tub,
    // sacks of grain; each in its own free place (the gate's way to the door and the things above are kept clear)
    const used = [[gu, 1.0, 1.9], [doorU + 1.2, vf - 0.9, 0.9], [u0 + Wh + 0.7, v0 + 1.0, 1.4], [Math.max(1.8, u0 - 1.6), 2.2, 1.8], [Math.min(L - 2, u0 + Wh * 0.5), vf - 2.6, 1.4], [L * 0.55, vf - 1.4, 2.0], [L * 0.5, vf - 4.2, 1.6]];
    for (let v = 1.0; v < vf - 0.5; v += 1.0) used.push([doorU, v, 1.3]);                  // the way from the gate's line to the door
    for (let v = 1.0; v < 3.0; v += 1.0) used.push([gu, v, 1.7]);
    const free = (u, v, r) => u > r + 0.4 && u < L - r - 0.4 && v > r * 0.6 + 0.4 && v < vf - 0.4 - r * 0.6 && used.every(([a, b, c]) => Math.hypot(a - u, b - v) > r + c);
    const drop = (el, r, tries = 14, extra = {}) => {
      for (let i = 0; i < tries; i++) { const u = r + 0.5 + rand() * (L - 2 * r - 1), v = 0.8 + rand() * (vf - 1.6); if (free(u, v, r)) { used.push([u, v, r]); put(el, u, v, { rot: rand() * 6.28, ...extra }); return true; } }
      return false;
    };
    const along = (el, r, side) => {                                                    // flat against the yard's side wall
      for (let i = 0; i < 8; i++) { const v = 2.0 + rand() * Math.max(0.5, vf - 5.0), u = side > 0 ? L - 1.0 - r * 0.5 : 1.0 + r * 0.5; if (free(u, v, r)) { used.push([u, v, r]); put(el, u, v, { rot: Math.PI / 2 + (side > 0 ? Math.PI : 0) }); return true; } }
      return false;
    };
    if (rand() < 0.5) drop({ t: 'drying_tray', seed: l.seed + 21 }, 0.9);
    if (rand() < 0.35) drop({ t: 'drying_tray', seed: l.seed + 22 }, 0.9);
    if (rand() < 0.3) { const [mx, mz] = [0, 0]; void mx; void mz; for (let i = 0; i < 10; i++) { const u = 1.8 + rand() * (L - 3.6), v = 1.8 + rand() * (vf - 4.4); if (free(u, v, 1.5)) { used.push([u, v, 1.5]); const [x, z] = at(u, v); C.push({ t: 'wutai_mill', at: [x, z], y: gh(x, z), rot: rand() * 6.28 }); break; } } }
    const kindCart = rand();
    if (kindCart < 0.22) along({ t: 'cart', kind: 'two', load: ['sacks', 'hay', 'empty'][Math.floor(rand() * 3)], seed: l.seed + 31 }, 1.5, rand() < 0.5 ? 1 : -1);
    else if (kindCart < 0.45) along({ t: 'barrow', seed: l.seed + 33 }, 1.1, rand() < 0.5 ? 1 : -1);
    else if (kindCart < 0.55) along({ t: 'handcart', load: 'baskets', seed: l.seed + 35 }, 1.1, rand() < 0.5 ? 1 : -1);
    if (rand() < 0.4) drop({ t: 'trough', seed: l.seed + 37 }, 0.9);
    if (rand() < 0.45) drop({ t: 'laundry', len: 2.6, seed: l.seed + 39 }, 1.6);
    if (rand() < 0.45) { const u = 1.4 + rand() * (L - 2.8), v = 1.0 + rand() * (vf - 3); if (free(u, v, 0.7)) { used.push([u, v, 0.7]); put({ t: 'stool', seed: l.seed + 41 }, u, v, { rot: rand() * 6.28 }); put({ t: 'basket', n: 2, seed: l.seed + 43 }, u + 0.55, v + 0.2); } }
    if (rand() < 0.4) drop({ t: 'sacks', n: 4, seed: l.seed + 45 }, 1.0);
    if (rand() < 0.3) drop({ t: 'barrel', n: 2, seed: l.seed + 47 }, 0.8);
    if (rand() < 0.35) drop({ t: 'crates', n: 3, seed: l.seed + 49 }, 0.9);
    if (rand() < 0.3) drop({ t: 'firewood', seed: l.seed + 51 }, 1.0);
    if (rand() < 0.25) drop({ t: 'chickens', n: 2 + Math.floor(rand() * 3), kind: rand() < 0.3 ? 'goose' : 'hen', seed: l.seed + 53 }, 1.2);
    if (rand() < 0.15) drop({ t: 'animal', kind: ['donkey', 'ox', 'sheep', 'goat'][Math.floor(rand() * 4)], seed: l.seed + 55 }, 1.4);
    if (kind === 'flat') { for (let k = 0; k < nb; k++) if (k !== Math.floor(nb / 2) && rand() < 0.35) put({ t: 'stool', seed: l.seed + 60 + k }, (k + 0.5) * bay + u0, vf - 0.7, { rot: rand() * 6.28 }); }
    // on the lane outside the wall: firewood or sorghum stalks piled against it, a barrow, a donkey tied by the gate, a bench
    const lane = (el, r, extra = {}) => {
      for (let i = 0; i < 6; i++) { const u = 1.2 + rand() * (L - 2.4); if (Math.abs(u - gu) > 1.9 + r) { put(el, u, -0.6, { rot: yaw[l.front] + Math.PI / 2, ...extra }); return true; } }
      return false;
    };
    if (rand() < 0.6) lane({ t: 'firewood', len: 1.5 + rand() * 0.5, seed: l.seed + 71 }, 1.0);
    if (rand() < 0.28) lane({ t: 'haystack', seed: l.seed + 73 }, 1.3);
    if (rand() < 0.2) lane({ t: 'barrow', seed: l.seed + 75 }, 1.1);
    if (rand() < 0.2) lane({ t: 'bench', len: 1.6, seed: l.seed + 77 }, 0.9);
    if (rand() < 0.15) put({ t: 'animal', kind: ['donkey', 'ox'][Math.floor(rand() * 2)], seed: l.seed + 79, rot: yaw[l.front] + Math.PI / 2 }, Math.min(L - 1.5, gu + 2.6), -0.9);
    if (rand() < 0.22) { const u = gu + (rand() < 0.5 ? 2.2 : -2.2); put({ t: 'stool', seed: l.seed + 81 }, u, -0.55, { rot: yaw[l.front] });
      const [x, z] = at(u, -0.55); const d = yaw[l.front]; Lf.push({ t: 'figure', at: [x, z], y: gh(x, z) + 0.0, rot: d + Math.PI, seed: l.seed + 83, dress: 'robe', cloth: ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white'][Math.floor(rand() * 4)], cloth2: 'cloth_white', skin: 'skin_light', hair: rand() < 0.5 ? 'bun' : 'topknot', hat: 'none', pose: 'low', carry: rand() < 0.5 ? 'basket' : 'none' }); }
  }
  // the green before the gate: the village well, a stone roller mill, a bench
  const gx = (GREEN[0] + GREEN[2]) / 2;
  C.push({ t: 'wutai_well', at: [gx - 6, 7.5], y: gh(gx - 6, 7.5) });
  C.push({ t: 'wutai_mill', at: [gx + 8, -8.5], y: gh(gx + 8, -8.5) });
  Lf.push({ t: 'barrel', at: [gx - 4.5, 7.2], y: gh(gx - 4.5, 7.2), n: 2, seed: 4 }, { t: 'basket', at: [gx - 7.2, 8.4], y: gh(gx - 7.2, 8.4), n: 2, seed: 5 });
  // the green's life: benches under the well's side, a goods mat of a pedlar, stools, baskets, a cart, a donkey, sacks, a stack of firewood, a laundry line
  const pl = (el, x, z, extra = {}) => Lf.push({ ...el, at: [x, z], y: gh(x, z), ...extra });
  pl({ t: 'bench', len: 1.8, seed: 31 }, gx - 9.5, 6.3, { rot: 0 }); pl({ t: 'bench', len: 1.8, seed: 32 }, gx - 2.4, 8.3, { rot: 0 });
  pl({ t: 'goods_mat', seed: 33 }, gx - 14, -6.5); pl({ t: 'stool', seed: 34 }, gx - 11.5, -6.8); pl({ t: 'basket', n: 3, seed: 35 }, gx - 14.8, -5.2);
  pl({ t: 'cart', kind: 'two', load: 'hay', seed: 36 }, gx + 12, 6.6, { rot: 0.6 }); pl({ t: 'animal', kind: 'ox', seed: 37 }, gx + 14.8, 4.4, { rot: 2.2 });
  pl({ t: 'sacks', n: 5, seed: 38 }, gx + 5.8, -5.2); pl({ t: 'firewood', len: 2, seed: 39 }, gx + 3, -9.0, { rot: 0 });
  pl({ t: 'handcart', load: 'sacks', seed: 40 }, gx - 5, -7.4, { rot: 1.9 }); pl({ t: 'chickens', n: 4, kind: 'hen', seed: 41 }, gx - 7.8, 4.4);
  pl({ t: 'laundry', len: 3, seed: 42 }, gx + 1.5, 8.5, { rot: 0 }); pl({ t: 'drying_tray', seed: 43 }, gx + 9, 7.8); pl({ t: 'drying_tray', seed: 44 }, gx + 11, 8.6);
  // villagers about the green: a pedlar crouched at his mat, two women talking at the well, a woman at the washing line, a boy with the ox, a man with a barrow
  const vf = (x, z, rot, seed, extra = {}) => Lf.push({ t: 'figure', at: [x, z], y: gh(x, z), rot, seed, dress: 'robe', cloth: ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white'][seed % 4], cloth2: 'cloth_white', skin: 'skin_light', hair: 'topknot', hat: 'brim', carry: 'none', pose: 'stand', ...extra });
  vf(gx - 14, -5.6, 0.4, 501, { pose: 'low', hat: 'straw' }); vf(gx - 5.2, 8.1, 2.8, 502, { hair: 'bun', hat: 'none', carry: 'basket' }); vf(gx - 7.2, 8.9, 5.6, 503, { hair: 'bun', hat: 'none', pose: 'talk' });
  vf(gx + 1.5, 7.6, 3.1, 504, { hair: 'bun', hat: 'none' }); vf(gx + 13.5, 4.9, 1.0, 505, { dress: 'trousers', hat: 'straw' }); vf(gx - 4, -8.1, 4.4, 506, { dress: 'trousers', hat: 'straw', carry: 'pole' });
  vf(gx + 8.8, -6.8, 2.5, 507, { pose: 'talk' });
  Lf.push({ t: 'animal', kind: 'donkey', at: [gx + 6.4, -8.4], y: gh(gx + 6.4, -8.4), rot: 1.2, seed: 21 });
  BUILT = { chinese: C, life: Lf, smoke };
  return BUILT;
}
