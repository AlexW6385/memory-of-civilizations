// The life of the town's streets (docs/settlements/versailles.md §5, "The town's fabric"): before each house what stood there about 1690 — a bench
// by the door, barrels and crates before the shops, a basket of the day's bread, firewood stacked, a hand-cart left against the wall — and
// the people about: neighbours in talk at their doors, a maid sweeping her step, a child at play, a water-carrier with his pails, a
// carter with his horse, dogs and cats. Derived from layout.js (the lots and their fronts), in 100 m tiles drawn near the visitor.
import { RADIUS, RISE, PLACE, lots } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const OUT = { n: [0, -1], s: [0, 1] };
const faceRot = (nx, nz) => Math.atan2(-nx, -nz);
const fig = (rand, o) => ({ t: 'figure', y: RISE, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'hose', skin: 'skin_light', cloth2: 'cloth_white', hat: 'brim', hatMat: 'cloth_black', ...o });
const C = ['cloth_brown', 'cloth_grey', 'cloth_indigo', 'cloth_green', 'cloth_red', 'cloth_black'];
const pick = (rand, a) => a[Math.floor(rand() * a.length)];

export function streetPlans() {
  const rand = rng(1691), tiles = new Map();
  const put = (e) => { const k = `${Math.floor(e.at[0] / 100)},${Math.floor(e.at[1] / 100)}`; if (!tiles.has(k)) tiles.set(k, []); tiles.get(k).push(e); };
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, w = x1 - x0, [nx, nz] = OUT[l.front] ?? [0, 1], fz = l.front === 'n' ? z0 : z1;
    if (Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) > RADIUS - 70) continue;
    const at = (u, d) => [x0 + u, fz + nz * d], ro = faceRot(nx, nz), along = Math.PI / 2;
    const a = rand();
    if (l.kind === 'shop') {
      if (a < 0.3) put({ t: pick(rand, ['barrel', 'crates', 'basket', 'sacks']), at: at(w * (0.15 + rand() * 0.7), 1.2), y: RISE, n: 2 + Math.floor(rand() * 2), seed: Math.floor(rand() * 1e6), rot: rand() * 6 });
      else if (a < 0.45) put({ t: 'handcart', at: at(w * (0.3 + rand() * 0.4), 2.1), y: RISE, rot: along + rand() * 0.3, seed: Math.floor(rand() * 1e6) });
      else if (a < 0.6) put({ t: 'stool', at: at(w * 0.7, 1.0), y: RISE, rot: ro });
    } else {
      if (a < 0.2) put({ t: 'bench', at: at(w * (0.15 + rand() * 0.2), 0.8), y: RISE, rot: ro, len: 1.6, back: true });
      else if (a < 0.34) put({ t: 'firewood', at: at(w * (0.6 + rand() * 0.3), 0.8), y: RISE, rot: along, len: 1.4, seed: Math.floor(rand() * 1e6) });
      else if (a < 0.46) put({ t: 'pot', kind: pick(rand, ['water_pot', 'dark_pot', 'glazed_jar']), at: at(w * (0.15 + rand() * 0.7), 0.6), y: RISE, rot: rand() * 6, n: 1, seed: Math.floor(rand() * 1e6) });
    }
    const p = rand();
    if (p < 0.16) {                                                    // neighbours in talk at the door
      const [px, pz] = at(w * (0.2 + rand() * 0.6), 2.4), a0 = rand() * 6.28;
      for (let q = 0; q < 2; q++) { const dx = Math.cos(a0 + q * Math.PI) * 0.55, dz = Math.sin(a0 + q * Math.PI) * 0.55; put(fig(rand, { at: [px + dx, pz + dz], rot: Math.atan2(-dx, -dz) + Math.PI, pose: q ? 'stand' : 'talk', h: 1.55 + rand() * 0.2, dress: q ? 'robe' : 'tunic', cloth: pick(rand, C), hat: q ? 'veil' : 'brim', hatMat: q ? 'cloth_white' : 'cloth_black' })); }
    } else if (p < 0.24) {                                             // a maid sweeping her step
      const [px, pz] = at(w * (0.3 + rand() * 0.4), 1.6); put(fig(rand, { at: [px, pz], rot: ro + (rand() - 0.5) * 0.6, dress: 'robe', cloth: pick(rand, C), hat: 'veil', hatMat: 'cloth_white', carry: 'besom', h: 1.54 }));
    } else if (p < 0.31) {                                             // a child at its play
      const [px, pz] = at(w * (0.2 + rand() * 0.6), 3.0); put(fig(rand, { at: [px, pz], rot: rand() * 6.28, child: true, cloth: pick(rand, C), hat: 'none' }));
    } else if (p < 0.37) {                                             // a dog or a cat
      const [px, pz] = at(w * (0.2 + rand() * 0.6), 1.4); put({ t: 'animal', kind: rand() < 0.6 ? 'dog' : 'cat', at: [px, pz], y: RISE, rot: rand() * 6, seed: Math.floor(rand() * 1e6) });
    } else if (p < 0.43) {                                             // someone going by on the street, a porter or a woman with her basket
      const [px, pz] = at(w * (0.2 + rand() * 0.6), 4.4); put(fig(rand, { at: [px, pz], rot: along * (rand() < 0.5 ? 1 : -1) + (rand() - 0.5) * 0.4, carry: pick(rand, ['basket', 'sack', 'pails', 'basket']), cloth: pick(rand, C), dress: rand() < 0.5 ? 'robe' : 'tunic', hat: rand() < 0.5 ? 'veil' : 'cap', h: 1.55 + rand() * 0.15 }));
    }
  }
  // the coaches' and the carters' horses standing in the avenue de Paris, a carter at their heads
  for (const [x, z, r] of [[PLACE[2] + 18, -3.5, 1.57], [PLACE[2] + 55, 4.6, -1.57], [PLACE[2] + 96, -4.2, 1.57]]) {
    put({ t: 'animal', kind: 'horse', at: [x, z], y: RISE, rot: r, seed: Math.floor(x), mat: 'hide_brown', gear: true });
    put({ t: 'cart', at: [x - Math.sin(r) * -3.6, z], y: RISE, rot: r, seed: Math.floor(x * 3) });
    put(fig(rand, { at: [x + Math.sin(r) * -1.2, z + 1.1], rot: r, cloth: 'cloth_brown', cloth2: 'cloth_grey', pose: 'stand', hat: 'brim' }));
  }
  const out = [];
  for (const [k, E] of tiles) { const [i, j] = k.split(',').map(Number); out.push({ id: `versailles-streets-${k}`, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: E, entrance: { at: [180, 0], facing: 'w' }, center: [i * 100 + 50, j * 100 + 50], near: 190 }); }
  return out;
}
