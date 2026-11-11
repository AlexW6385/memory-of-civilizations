// Athens — what stands before the houses and in the lanes (docs/settlements/athens.md §5c): at each front the jar by the door,
// a stone or timber bench, a stack of firewood, baskets, a line of washing, the shop's goods on its counter board; hens and a
// dog in the lane, a cart; the wells and herms where the lanes cross; and the people who belong to the fronts — the shopkeeper
// behind his counter, the woman at her door, the old man on his bench — and to the walk-in houses (the family at the loom,
// the slave at the hearth). All derived from layout.js (the lots, their fronts and the door places of ward.js).

import { lots, height, OPEN_CORES } from './layout.js';
import { frame } from '../../styles/greek/agora.js';
import { kindOf } from '../../styles/greek/ward.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** The street props (life elements) and the figures belonging to the fronts. */
export function fronts() {
  const E = [], r0 = rng(77), sd = () => Math.floor(r0() * 1e9);
  for (const l of lots()) {
    if (l.tier < 1 || l.road === undefined && false) continue;
    const F = frame(l.rect, l.front), { L, D } = F, R = rng(l.seed * 7 + 3), t2 = l.tier === 2;
    const K = kindOf({ seed: l.seed }, L, D, l.tier), open = !!l.open;
    const along = F.alongX ? 0 : Math.PI / 2, wallRot = F.yaw + Math.PI;
    const at = (u, v) => { const p = F.P(u, v); return [p, height(p[0], p[1])]; };
    const put = (t, u, v, o = {}) => { const [p, y] = at(u, v); E.push({ t, at: p, y: o.y ?? y, rot: o.rot ?? along, seed: sd(), ...o }); };
    const busy = (u) => Math.abs(u - K.du) < 1.5 || (K.shop && u > K.shopU - 0.8 && u < K.shopU + 3.2) || (open && u > 0.4 && u < 5.0) || u < 0.7 || u > L - 0.7;
    const spot = (w = 0) => { for (let k = 0; k < 8; k++) { const u = 0.9 + R() * (L - 1.8); if (!busy(u) && !busy(u - w) && !busy(u + w)) return u; } return -1; };
    // the jar by the door; the shop's goods on its counter board and the baskets and sacks before it
    put('pot', K.du - 0.95 - R() * 0.3, -0.4, { kind: R() < 0.5 ? 'water_pot' : 'pithos', n: 1, s: 0.9 });
    if (K.shop && !open) {
      const m = K.shopU + 1.2, pick = R();
      put('pot', m, -0.17, { y: height(...F.P(m, -0.17)) + 0.96, kind: pick < 0.5 ? 'water_pot' : pick < 0.8 ? 'dark_pot' : 'amphora', n: 3, s: 0.75 });
      put('basket', K.shopU - 0.35, -0.7, { n: 2, goods: R() < 0.5 ? 'cloth_ochre' : 'cloth_red' });
      put('sacks', K.shopU + 3.0, -0.55, { n: 3, s: 0.8, rot: along });
      if (t2) {
        const [p, y] = at(m, 1.4);
        E.push({ t: 'figure', at: p, y, rot: F.yaw + Math.PI, seed: sd(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: ['cloth_brown', 'linen', 'cloth_ochre'][Math.floor(R() * 3)], over: 'belt', hair: 'short', beard: 0.9, hat: 'none', feet: 'bare', pose: 'stand' });
      }
    }
    // the open houses' shop: goods on the front of the counter, a customer in the street
    if (open) {
      const [px, py] = at(3.8, -1.3);
      E.push({ t: 'figure', at: px, y: py, rot: F.yaw, seed: sd(), skin: 'skin_medium', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_brown', over: 'cloak', hair: 'short', beard: 1, hat: 'none', pose: 'talk' });
    }
    if (l.tier < 2) { const u = spot(1); if (u > 0 && R() < 0.6) put('firewood', u, -0.35, { len: 1.5 }); continue; }
    // tier 2: bench, firewood, basket, hens, dog, washing, a cart; the people of the fronts
    const items = ['bench', 'firewood', 'basket', 'hens', 'dog', 'laundry', 'cart', 'stool', 'jar2'];
    for (let k = items.length - 1; k > 0; k--) { const j = Math.floor(R() * (k + 1)); [items[k], items[j]] = [items[j], items[k]]; }
    for (const it of items.slice(0, 4 + Math.floor(R() * 3))) {
      if (it === 'bench') { const u = spot(1.1); if (u > 0) { put('bench', u, -0.3, { len: 1.8, mat: R() < 0.5 ? 'limestone' : 'timber', back: false, rot: wallRot + (F.alongX ? 0 : 0) }); if (R() < 0.55) { const [p, y] = at(u, -0.4); E.push({ t: 'figure', at: p, y, rot: F.yaw, seed: sd(), skin: 'skin_medium', dress: 'robe', cloth: ['cloth_white', 'linen', 'cloth_ochre'][Math.floor(R() * 3)], cloth2: 'cloth_brown', over: 'cloak', hair: 'short', beard: 1, hat: 'none', pose: 'sit' }); } } }
      else if (it === 'firewood') { const u = spot(0.9); if (u > 0) put('firewood', u, -0.35, { len: 1.6 }); }
      else if (it === 'basket') { const u = spot(0.5); if (u > 0) put('basket', u, -0.5, { n: 2 }); }
      else if (it === 'hens') { const u = spot(1.2); if (u > 0) put('chickens', u, -1.8, { kind: 'hen', n: 3 + Math.floor(R() * 3) }); }
      else if (it === 'dog') { const u = spot(0.8); if (u > 0) put('animal', u, -1.2, { kind: 'dog', rot: R() * 6.28 }); }
      else if (it === 'laundry') { const u = spot(1.7); if (u > 0 && (K.two || R() < 0.5)) put('laundry', u, -1.1, { len: 3, rot: along }); }
      else if (it === 'cart') { const u = spot(1.4); if (u > 0) put('handcart', u, -1.9, { load: ['sacks', 'baskets', 'crates'][Math.floor(R() * 3)], rot: along + Math.PI / 2 }); }
      else if (it === 'stool') { const u = spot(0.6); if (u > 0) { put('stool', u, -0.5, { kind: 'low' }); const [p, y] = at(u, -0.55); E.push({ t: 'figure', at: p, y, rot: F.yaw, seed: sd(), skin: 'skin_light', dress: 'robe', cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][Math.floor(R() * 4)], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: R() < 0.5 ? 'veil' : 'none', pose: 'sit_low', carry: R() < 0.5 ? 'basket' : 'none' }); } }
      else if (it === 'jar2') { const u = spot(0.5); if (u > 0) put('pot', u, -0.4, { kind: 'amphora', n: 2, s: 0.9 }); }
    }
  }
  return E;
}

/** The runs' ends and lane crossings: a herm at some of them (the Hermai stood at crossroads and doors). Greek-style elements. */
export function crossings() {
  const herms = [], wells = [], R = rng(91);
  const seen = new Set();
  for (const l of lots()) {
    if (l.tier < 1 || l.road) continue;
    const [x0, z0, x1, z1] = l.rect, key = `${Math.round(x1)}|${Math.round(z0)}`;
    if (seen.has(key)) continue; seen.add(key);
    // the east end of a run: nothing abuts it within the cross-lane's width
    const lane = (x) => !lots().some((o) => o !== l && o.rect[0] < x + 0.6 && o.rect[2] > x - 0.6 && o.rect[1] < z0 + 5 && o.rect[3] > z0 + 3);
    if (!lane(x1 + 1.7)) continue;
    const t = R();
    if (t < 0.3) { const x = x1 + 0.45, z = z0 + (l.front === 'n' ? 0.5 : 5) ; herms.push({ at: [x, z], y: height(x, z), rot: -Math.PI / 2 }); }
    else if (t < 0.4 && l.tier === 2) wells.push({ t: 'well', at: [x1 + 1.7, z0 + 12], y: height(x1 + 1.7, z0 + 12), rot: 0, seed: Math.floor(R() * 1e9) });
  }
  return { herms, wells };
}

/** The family of each walk-in house (athens-open-k, in order of lots with `open`): the keeper at his counter, the woman at the loom, the slave at the hearth. */
export function openLife() {
  const E = [], R = rng(55), sd = () => Math.floor(R() * 1e9);
  lots().filter((l) => l.open).forEach((l, k) => {
    const [X0, Z0, , Z1] = l.rect, y = l.y;
    if (k % 6 !== 1) E.push({ t: 'figure', at: [X0 + 3.9, Z0 + 2.5], y, rot: 0, seed: sd(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: ['cloth_brown', 'linen', 'cloth_ochre', 'cloth_grey'][k % 4], over: 'belt', hair: 'short', beard: 0.9, hat: 'none', feet: 'bare', pose: 'stand' });
    else E.push({ t: 'figure', at: [X0 + 1.42, Z0 + 3.25], y, rot: 0, seed: sd(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: 'cloth_brown', over: 'belt', hair: 'short', beard: 1, hat: 'none', feet: 'bare', pose: 'sit_low' });
    E.push({ t: 'figure', at: [X0 + 2.6, Z1 - 1.85], y, rot: Math.PI, seed: sd(), skin: 'skin_light', dress: 'robe', cloth: ['cloth_red', 'cloth_indigo', 'cloth_ochre'][k % 3], cloth2: 'cloth_white', over: 'shawl', hair: 'bun', hat: 'none', pose: 'stand' });
    E.push({ t: 'figure', at: [X0 + 6.65, Z1 - 1.75], y, rot: Math.PI / 2, seed: sd(), skin: 'skin_medium', dress: 'tunic', legs: 'bare', cloth: 'cloth_grey', over: 'belt', hair: 'short', beard: 0.3, hat: 'none', feet: 'bare', pose: 'squat' });
    if (k % 2 === 0) E.push({ t: 'figure', at: [X0 + 9.0, Z0 + 3.6], y, rot: -Math.PI / 2, seed: sd(), skin: 'skin_medium', dress: 'wrap', top: 'bare', cloth: 'cloth_white', hair: 'short', beard: 1, hat: 'none', feet: 'bare', pose: 'sit' });
  });
  void OPEN_CORES; void dist;
  return E;
}
