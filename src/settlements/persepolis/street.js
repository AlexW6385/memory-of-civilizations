// The street life of Parsa that stands still (docs/settlements/persepolis.md §16): at each door its water jar, its firewood, its basket,
// its stool and the woman or the old man on it; before the shops their goods in the street, the shopkeeper behind the counter in the houses
// walked into and a buyer or two before it; at the wells women with jars; hens, dogs, tethered donkeys, goats in the lanes; washing and
// ladders on the roofs; the market's well, carts and buyers. Elements of the `life` style, which instances every piece. Positions come
// from layout.js (the lots, their doors, the streets); the ones near the arrival first.
import { lots, wells, MARKET, ROAD, ARRIVAL, STREETS } from './layout.js';
import { houseDoor, frameOf } from '../../styles/achaemenid/houses-data.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rotOut = (o) => Math.atan2(-o[0], -o[1]);          // the rot that faces along o
const rotIn = (o) => Math.atan2(o[0], o[1]);            // the rot that faces against o
const CLOTH = ['cloth_white', 'cloth_ochre', 'cloth_brown', 'cloth_indigo', 'cloth_red', 'cloth_green', 'linen'];
let CACHE = null;
/** { figures } of style 'life'. */
export function street() {
  if (CACHE) return CACHE;
  const rand = rng(6101), F = [], pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const person = (at, rot, o = {}) => {
    const w = o.woman, dress = w ? 'robe' : pick(['robe', 'robe', 'trousers']);
    F.push({ t: 'figure', at, y: o.y ?? 0, rot, seed: seed(), dress, cloth: o.cloth ?? pick(CLOTH), cloth2: pick(CLOTH), over: dress === 'robe' ? 'sash' : 'belt', hat: w ? 'veil' : o.hat ?? pick(['cap', 'cap', 'none']), hatMat: 'cloth_white', hair: w ? undefined : 'short', beard: !w && !o.child, skin: 'skin_medium', feet: 'shod', child: o.child, h: o.child ? undefined : w ? 1.52 + rand() * 0.1 : 1.64 + rand() * 0.14, ...(o.el ?? {}) });
  };
  const A = lots().filter((l) => l.enter || Math.hypot(l.rect[0] - ARRIVAL[0], l.rect[1] - ARRIVAL[1]) < 150);
  const sideOf = (o) => [-o[1], o[0]];                    // along the front
  for (const l of A) {
    const d = houseDoor(l), o = d.out, s = sideOf(o), [px, pz] = d.p, kind = l.kind;
    const at = (u, v) => [px + s[0] * u + o[0] * v, pz + s[1] * u + o[1] * v];
    const side = rand() < 0.5 ? 1 : -1, rot = rotOut(o);
    // the water jar by the door, firewood against the wall, a basket
    const jarAt = at(side * (d.w / 2 + 0.7), 0.5);
    F.push({ t: 'pot', kind: rand() < 0.4 ? 'pithos' : 'water_pot', n: 2, at: jarAt, rot: 0, seed: seed() });
    if (rand() < 0.4) F.push({ t: 'firewood', len: 1.2, at: at(-side * (d.w / 2 + 1.4), 0.4), rot: rot + Math.PI / 2, seed: seed() });
    if (rand() < 0.3) F.push({ t: 'basket', n: 2, at: at(-side * (d.w / 2 + 0.6), 0.45), rot: 0, seed: seed() });
    if (rand() < 0.2) F.push({ t: 'ladder', len: 3.4, at: at(side * (d.w / 2 + 2.6), 0.9), rot: rotIn(o) + Math.PI, seed: seed() });
    // someone at the door on a stool
    if (kind !== 'shop' && rand() < 0.4) {
      const st = at(-side * (d.w / 2 + 1.2), 1.0);
      F.push({ t: 'stool', at: st, rot, seed: seed() });
      person([st[0], st[1]], rot + (rand() - 0.5) * 0.8, { woman: rand() < 0.6, el: { pose: 'sit_low' } });
    }
    if (rand() < 0.22) F.push({ t: 'chickens', kind: 'chickens', n: 4, at: at(side * 3.4, 1.6), rot: 0, seed: seed() });
    if (rand() < 0.12) F.push({ t: 'animal', kind: 'dog', at: at(-side * 3.2, 1.4), y: 0, rot: rot + 1, seed: seed() });
    if (rand() < 0.12) F.push({ t: 'animal', kind: 'donkey', at: at(side * 4.5, 1.6), y: 0, rot: rot + Math.PI / 2, seed: seed() });
    // the roof: washing on a line, a sunshade's mat
    if (rand() < 0.3) {                                   // a line of washing over the roof: a court house's roof is its back range only
      const m = d.m, P = frameOf(m.rect, m.front).P, a = 1.8 + rand() * (m.L - 3.6), b = m.court ? m.D * 0.54 + 1.4 : m.D * 0.2 + 0.9;
      F.push({ t: 'laundry', len: 3.2, at: P(a, b), y: d.h + 0.14, rot: rotOut(o) + Math.PI / 2, seed: seed() });
    }
    if (kind === 'shop') {
      const g = { grain: ['sacks', 3], potter: ['pot', 3], wine: ['barrel', 3], fruit: ['basket', 3], carpenter: ['firewood', 0], baker: ['firewood', 0], butcher: ['crates', 2], cloth: ['crates', 1], dyer: ['pot', 2], smith: ['crates', 2] }[l.trade];
      if (g) {
        const e = { t: g[0], n: g[1], at: at(-side * 2.6, 2.4), rot: rotOut(o) + Math.PI / 2, seed: seed() };
        if (g[0] === 'pot') e.kind = 'pithos'; if (g[0] === 'firewood') e.len = 1.6;
        F.push(e);
      }
      if (l.enter) person(at(-0.2 + d.w * 0.25, -1.1), rotOut(o), { el: { pose: 'talk' } });
      if (rand() < 0.5) person(at(-0.5, 2.2), rotIn(o), { woman: rand() < 0.5, el: { pose: rand() < 0.5 ? 'talk' : 'stand' } });
    } else if (l.enter && rand() < 0.5) person(at(-1.0, -2.0 - rand() * 1.5), rand() * 6, { woman: rand() < 0.6, el: { pose: 'cross' } });
  }
  // the wells: the windlass, a trough, women with jars and a donkey waiting
  for (const w of wells()) {
    if (Math.hypot(w.at[0] - ARRIVAL[0], w.at[1] - ARRIVAL[1]) > 220) continue;
    const [x, z] = w.at;
    F.push({ t: 'well', kind: 'windlass', at: [x, z], y: 0, rot: 0, mat: 'limestone_persian', seed: seed() });
    F.push({ t: 'trough', at: [x + 1.3, z - 1.4], rot: 0.3, mat: 'limestone_persian', seed: seed() });
    for (let k = 0; k < 3; k++) person([x + Math.cos(k * 2.1 + 0.5) * 1.5, z + Math.sin(k * 2.1 + 0.5) * 1.5], k * 2.1 + 3.6, { woman: k < 2, el: k === 0 ? { carry: 'pot', arms: 'head' } : { pose: 'stand' } });
    F.push({ t: 'animal', kind: 'donkey', at: [x - 2.4, z + 1.8], y: 0, rot: 1.2, seed: seed(), gear: true });
  }
  // the market: carts and the buyers between the rows, hens and a dog
  const cx = (MARKET[0] + MARKET[2]) / 2, cz = (MARKET[1] + MARKET[3]) / 2;
  for (let k = 0; k < 16; k++) person([MARKET[0] + 6 + rand() * (MARKET[2] - MARKET[0] - 12), cz - 3.5 + rand() * 7], rand() * 6.28, { woman: rand() < 0.4, el: rand() < 0.3 ? { carry: 'basket', arms: 'head' } : rand() < 0.3 ? { pose: 'talk' } : {} });
  F.push({ t: 'cart', kind: 'two', load: 'sacks', beast: 'ox', at: [MARKET[0] + 10, MARKET[3] + 3], y: 0, rot: 1.57, seed: seed() });
  F.push({ t: 'cart', kind: 'two', load: 'sacks', beast: 'donkey', at: [MARKET[2] - 8, MARKET[1] - 3.5], y: 0, rot: -1.57, seed: seed() });
  F.push({ t: 'chickens', kind: 'chickens', n: 6, at: [cx + 6, cz + 5], rot: 0, seed: seed() });
  F.push({ t: 'animal', kind: 'dog', at: [cx - 7, cz - 4], y: 0, rot: 2, seed: seed() });
  // goats and sheep driven along the lanes
  const lane = STREETS[1];
  for (let k = 0; k < 5; k++) F.push({ t: 'animal', kind: k % 2 ? 'goat' : 'sheep', at: [(lane[0] + lane[2]) / 2 + (rand() - 0.5) * 2.4, -20 + k * 2.2 + rand()], y: 0, rot: 0.2 + rand() * 0.3, seed: seed() });
  void ROAD;
  CACHE = { figures: F };
  return CACHE;
}
