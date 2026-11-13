// Petra — the goods and the people of the shops and houses (docs/settlements/petra.md §15, §16): the shops of the colonnaded
// street's south side by trade (the incense and spice dealer, the potter, the cloth merchant, the oil and wine seller, the
// grain dealer), each with its keeper; the furnished rooms and courts of the houses near the street. Pure data (life style).
import { shopUnits, lots } from './layout.js';
import { houseLayout } from '../../styles/nabataean/house.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CL = ['cloth_white', 'linen', 'cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_brown'];
const TRADES = ['incense', 'potter', 'cloth', 'oil', 'grain', 'incense', 'potter', 'spice'];
/** The trade of a shop unit (layout.js `shopUnits`). */
export const tradeOf = (s) => TRADES[(s.i * 5 + 3) % TRADES.length];

export function shopLife() {
  const L = [], rand = rng(5150), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), over: pick(['sash', 'cape', 'none']), skin: 'skin_medium', hat: 'none', hatMat: 'cloth_white', feet: 'shod', ...o });
  for (const s of shopUnits()) {
    const trade = TRADES[(s.i * 5 + 3) % TRADES.length], y = s.yf, xl = s.x0 + 0.5, xr = s.x1 - 0.5, zb = s.z1 - 0.5, zf = s.z0 + 0.5, k = s.i * 20;
    // the counter stands just inside the door on the left (the style's); the keeper behind it, facing the street (-z)
    const counterX = s.x0 + 0.9 + (s.m - s.dw / 2 + 0.2 - s.x0 - 0.9) / 2;
    if (trade === 'incense' || trade === 'spice') {
      // frankincense and myrrh in sacks and baskets, spices in lidded jars along the back wall, resin on the counter in a basket
      L.push({ t: 'sacks', n: 4, at: [xr - 0.5, zb - 0.5], y, rot: 0.3, seed: k + 1 });
      L.push({ t: 'basket', n: 2, at: [xl + 0.4, zb - 0.4], y, seed: k + 2, goods: 'hide_tan' });
      for (let i = 0; i < 4; i++) L.push({ t: 'pot', kind: pick(['glazed_jar', 'blue_jar', 'water_pot', 'dark_pot']), at: [xl + 1.0 + i * 0.8, zb], y, seed: k + 3 + i });
      L.push({ t: 'basket', n: 1, at: [counterX, zf + 0.9], y: y + 0.95, seed: k + 9, goods: 'hide_tan' });
    } else if (trade === 'potter') {
      for (let i = 0; i < 5; i++) L.push({ t: 'pot', kind: pick(['dark_pot', 'water_pot', 'amphora', 'dark_pot']), n: 2 + (i % 2), at: [xl + 0.3 + i * 0.75, zb - 0.3 - (i % 2) * 0.7], y, seed: k + i });
      L.push({ t: 'pot', kind: 'pithos', at: [xr - 0.4, zf + 1.2], y, seed: k + 8 });
      L.push({ t: 'pot', kind: 'dark_pot', n: 3, at: [counterX, zf + 0.9], y: y + 0.95, seed: k + 9 });
    } else if (trade === 'cloth') {
      L.push({ t: 'basket', n: 3, at: [xl + 0.5, zb - 0.4], y, seed: k + 1 });
      L.push({ t: 'sacks', n: 3, at: [xr - 0.6, zb - 0.6], y, rot: 1.2, seed: k + 2 });
      L.push({ t: 'crates', at: [(xl + xr) / 2, zb - 0.5], y, seed: k + 3 });
      L.push({ t: 'laundry', at: [(xl + xr) / 2, zb - 1.4], y, seed: k + 4 });
    } else if (trade === 'oil') {
      for (let i = 0; i < 4; i++) L.push({ t: 'pot', kind: pick(['amphora', 'pithos', 'amphora']), at: [xl + 0.4 + i * 0.7, zb - 0.2], y, seed: k + i });
      L.push({ t: 'pot', kind: 'amphora', n: 3, at: [counterX, zf + 0.9], y: y + 0.95, seed: k + 9 });
      L.push({ t: 'barrel', at: [xr - 0.5, zf + 1.5], y, seed: k + 6 });
    } else {
      L.push({ t: 'sacks', n: 6, at: [(xl + xr) / 2, zb - 0.6], y, rot: 0, seed: k + 1 });
      L.push({ t: 'sacks', n: 4, at: [xr - 0.5, zf + 1.5], y, rot: 1.5, seed: k + 2 });
      L.push({ t: 'basket', n: 2, at: [xl + 0.4, zb - 0.5], y, seed: k + 3 });
    }
    // the keeper: on the stool behind the counter, a headcloth for some; a customer in the door for every third
    L.push({ t: 'stool', at: [counterX, zf + 1.5], y, rot: 0, seed: k + 12 });
    person([counterX, zf + 1.5], y, Math.PI, { pose: 'sit_low', beard: rand() < 0.8, hat: rand() < 0.5 ? 'turban' : 'none', hatMat: 'cloth_white' });
    if (s.i % 3 === 1) person([s.m, s.z0 - 1.9], 0.15, 0, { pose: rand() < 0.5 ? 'talk' : 'stand', beard: true, over: 'cape', hat: 'turban', hatMat: 'cloth_white' });
  }
  return L;
}

/**
 * The rooms, courts, doorsteps and roofs of every house (docs/settlements/petra.md §18): the water jar by the door, storage, a
 * bench and a mat with a lamp's pot, the woman at her work in the court; before the door a stool and the old man on it, firewood, a
 * beast tied; on the roof the wash on its line, figs drying on a mat, a jar, the woman among them.
 */
export function houseLife(list = lots(), k0 = 0) {
  const L = [], rand = rng(777), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CL), cloth2: pick(CL), over: 'shawl', skin: 'skin_medium', hat: 'none', hatMat: 'cloth_white', feet: 'bare', ...o });
  list.forEach((lot, i0) => {
    const i = i0 + k0, H = houseLayout(lot), { P, y } = H, k = i * 20, F = y + 0.03, rin = H.front === 's' ? Math.PI : 0, rout = rin + Math.PI;
    const ph = (u, v) => P(u, v);
    const roofY = y + H.h + 0.03;
    if (H.court) {
      const [cx0, cz0, cx1, cz1] = H.court.rect, rm = H.room.rect;
      L.push({ t: 'pot', kind: 'dark_pot', n: 2, at: ph(cx1 - 0.5, cz0 + 0.9), y: F, seed: k + 1 });
      L.push({ t: 'firewood', at: ph(cx1 - 0.4, cz0 + 2.0), y: F, rot: 1.57, len: 1, seed: k + 2 });
      L.push({ t: 'pot', kind: 'zir', at: ph(H.gate.u + 1.6, cz0 + 0.8), y: F, seed: k + 3 });
      if (i % 2 === 0) person(ph(cx1 - 1.6, cz0 + 1.6), F, 0.6, { pose: 'squat', hat: 'veil', hatMat: 'cloth_white' });
      if (i % 3 === 0) L.push({ t: 'animal', kind: 'donkey', at: ph((cx0 + cx1) / 2 - 1.3, cz1 - 1.1), y: F, rot: 3.14, seed: k + 5 });
      else if (i % 3 === 1) { L.push({ t: 'animal', kind: 'goat', at: ph(cx0 + 1.4, cz1 - 1.0), y: F, rot: rand() * 6, seed: k + 5 }); L.push({ t: 'animal', kind: 'goat', at: ph(cx0 + 2.3, cz1 - 1.6), y: F, rot: rand() * 6, seed: k + 6, graze: true }); }
      else L.push({ t: 'goods_mat', at: ph(cx0 + 1.8, cz1 - 1.6), y: F, rot: rin, goods: ['heap'], seed: k + 7 });
      L.push({ t: 'ladder', at: ph(cx0 + 0.5, cz1 - 0.3), y: F, rot: rin + 1.57, len: 2.4, seed: k + 8 });
      for (let q = 0; q < 3; q++) L.push({ t: 'pot', kind: pick(['pithos', 'amphora', 'water_pot']), at: ph(rm[0] + 0.5 + q * 0.7, rm[3] - 0.45), y: F, seed: k + 6 + q });
      L.push({ t: 'sacks', n: 3, at: ph(rm[2] - 0.6, rm[3] - 0.6), y: F, rot: 0.5, seed: k + 10 });
      L.push({ t: 'basket', n: 2, at: ph((rm[0] + rm[2]) / 2, rm[1] + 0.5), y: F, seed: k + 11 });
      // the room's bench along its side wall, the bedding mat, the old woman at the spindle
      L.push({ t: 'bench', at: ph(rm[0] + 1.3, rm[1] + 0.35), y: F, rot: rout, mat: 'sandstone_rose_ashlar', len: 1.8, seed: k + 12 });
      L.push({ t: 'goods_mat', at: ph(rm[2] - 1.2, (rm[1] + rm[3]) / 2), y: F, rot: rin, mat: 'reed_mat', goods: ['basket'], seed: k + 13 });
      if (i % 3 === 2) person(ph(rm[0] + 2.4, (rm[1] + rm[3]) / 2), F, rin + 0.5, { pose: 'cross', hat: 'veil', hatMat: 'cloth_white' });
      // the roof of the range
      const rv = (H.range.v0 + H.D) / 2, ru1 = Math.max(2.4, H.W - 4.2);
      L.push({ t: 'wash_line', at: ph(1.0 + (ru1 - 1) / 2, H.D - 1.0), y: roofY, rot: 0, len: Math.min(4, ru1 - 0.4), seed: k + 14 });
      if (i % 2 === 0) L.push({ t: 'goods_mat', at: ph(1.6, rv - 0.3), y: roofY, rot: 0, goods: ['heap'], seed: k + 15 });
      L.push({ t: 'pot', kind: 'water_pot', n: 2, at: ph(Math.min(ru1 + 0.2, H.W - 4.4), rv + 0.4), y: roofY, seed: k + 16 });
      if (i % 4 === 1) person(ph(2.4, rv + 0.6), roofY, rand() * 6, { pose: 'stand', carry: 'basket', hat: 'veil', hatMat: 'cloth_white' });
      // before the gate
      L.push({ t: 'pot', kind: 'water_pot', n: 2, at: ph(H.gate.u - 1.5, -0.7), y: y, seed: k + 17 });
      if (i % 3 === 0) { L.push({ t: 'stool', at: ph(H.gate.u + 1.6, -1.0), y: y, rot: rout, seed: k + 18 }); person(ph(H.gate.u + 1.6, -1.0), y, rout, { pose: 'sit_low', beard: true, over: 'cape', hat: 'turban', hatMat: 'cloth_white', feet: 'shod' }); }
    } else {
      const rm = H.room.rect, d = H.door.u;
      L.push({ t: 'pot', kind: 'zir', at: ph(Math.min(H.W - 1.3, d + 1.0), rm[1] + 0.4), y: F, seed: k + 1 });
      for (let q = 0; q < 2; q++) L.push({ t: 'pot', kind: pick(['pithos', 'amphora']), at: ph(rm[2] - 0.5 - q * 0.8, rm[3] - 0.5), y: F, seed: k + 2 + q });
      L.push({ t: 'sacks', n: 3, at: ph(rm[0] + 0.7, rm[3] - 0.6), y: F, rot: 0.2, seed: k + 5 });
      L.push({ t: 'basket', n: 1, at: ph(rm[0] + 0.5, rm[1] + 0.9), y: F, seed: k + 6 });
      L.push({ t: 'bench', at: ph(d < H.W / 2 ? H.W * 0.72 : H.W * 0.28, rm[1] + 0.3), y: F, rot: rout, mat: 'sandstone_rose_ashlar', len: 1.8, seed: k + 7 });
      L.push({ t: 'goods_mat', at: ph(rm[0] + 1.5, (rm[1] + rm[3]) / 2), y: F, rot: rin, mat: 'reed_mat', goods: ['basket'], seed: k + 8 });
      if (i % 2 === 1) person(ph((rm[0] + rm[2]) / 2, (rm[1] + rm[3]) / 2), F, 1.2, { pose: 'sit_ground', hat: 'veil', hatMat: 'cloth_indigo' });
      // the roof (clear of the roof chamber at the back-left): the wash, figs drying, a jar, a woman
      const ru0 = 3.6, ru1 = H.W - 1.3;
      if (ru1 - ru0 > 1.6) {
        L.push({ t: 'wash_line', at: ph((ru0 + ru1) / 2, H.D * 0.42), y: roofY, rot: 0, len: Math.min(4, ru1 - ru0), seed: k + 9 });
        if (i % 2 === 0) L.push({ t: 'goods_mat', at: ph(ru0 + 0.9, H.D * 0.72), y: roofY, rot: 0, goods: ['heap'], seed: k + 10 });
        L.push({ t: 'pot', kind: 'water_pot', at: ph(ru1 - 0.4, H.D * 0.8), y: roofY, seed: k + 11 });
        if (i % 3 === 0) person(ph((ru0 + ru1) / 2, H.D * 0.64), roofY, rand() * 6, { pose: 'stand', carry: 'basket', hat: 'veil', hatMat: 'cloth_white' });
      }
      // before the door
      L.push({ t: 'pot', kind: 'water_pot', at: ph(d - 1.2, -0.7), y: y, seed: k + 12 });
      if (i % 3 === 1) { L.push({ t: 'stool', at: ph(d + 1.3, -1.0), y: y, rot: rout, seed: k + 13 }); person(ph(d + 1.3, -1.0), y, rout, { pose: 'sit_low', beard: true, over: 'cape', hat: 'turban', hatMat: 'cloth_white', feet: 'shod' }); }
      else if (i % 3 === 2) L.push({ t: 'animal', kind: 'goat', at: ph(d + 1.8, -1.6), y: y, rot: rand() * 6, seed: k + 14, graze: true });
      else L.push({ t: 'firewood', at: ph(1.2, -0.6), y: y, rot: rin + 1.57, len: 1.2, seed: k + 15 });
    }
  });
  return L;
}
