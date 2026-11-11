// Paris in 1248 — the street life at the visitor's eye (docs/settlements/paris.md §5b): the fronts of the rues dressed by trade
// (casks at the cooper's and the tavern, flour sacks at the baker's, a bench and a stool at the shoemaker's door, firewood, crates,
// a lantern), the masters behind the counters of the open shops, craftsmen working at their doors, washing hung across the
// ruelles, washerwomen kneeling at the strand of the Seine, fishermen on the quay and the bridges' piers. Pure data from layout.js.
import { RIVER, NORTH_ARM, SOUTH_ARM, QUAY, lots, laneCenters, rowMids, LANE_WIDTH, inLot, inRect, ISLAND, height } from './layout.js';
import { shopPoint } from '../../styles/gothic/houses.js';
import { openSet } from './town.js';

function lrng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const faceTo = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
const CL = ['cloth_brown', 'cloth_grey', 'cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white'];
const FOCUS = [70, 0], REACH = 190;

export function lifePlans() {
  const rand = lrng(1253), L = [], pick = (a) => a[Math.floor(rand() * a.length)], open = openSet();
  const fig = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, h: 1.56 + rand() * 0.18, seed: Math.floor(rand() * 1e9), dress: rand() < 0.5 ? 'robe' : 'tunic', cloth: pick(CL), cloth2: pick(CL), skin: 'skin_light', hat: pick(['cap', 'none', 'brim', 'cap', 'veil']), hatMat: pick(['cloth_brown', 'cloth_red', 'cloth_black', 'cloth_white']), legs: 'hose', feet: 'shod', hair: pick(['short', 'long', 'short']), ...o });
  const tag = (l) => { const sp = shopPoint({ rect: l.rect, y: 1, seed: l.seed, front: l.front }); return sp; };
  const y0 = RIVER.ground;
  let nHome = 0;
  for (const l of lots()) {
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    if (Math.hypot(cx - FOCUS[0], cz - FOCUS[1]) > REACH) continue;
    const sp = tag(l), [ox, oz] = sp.out, side = [oz, ox], pt = (a, b) => [sp.at[0] + ox * a + side[0] * b, sp.at[1] + oz * a + side[1] * b];
    const rot = Math.atan2(ox, oz) + Math.PI;                       // facing out of the house, away from its wall
    const isOpen = open.has(l);
    // the master behind the counter of an open shop (inside), and at the counter's outside a customer
    if (isOpen) fig(sp.inside, y0 + 0.1, faceTo(sp.inside, sp.at), { pose: 'stand', over: pick(['sash', 'none']), carry: 'none' });
    if (rand() < (isOpen ? 0.75 : 0.35)) { const a = pt(0.2, (rand() - 0.5) * 1.4); fig(a, y0, faceTo(a, [a[0] - ox, a[1] - oz]), { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' }); }
    // by the trade
    const q = (a, b) => pt(a, b);
    switch (sp.trade) {
      case 'cooper': L.push({ t: 'barrel', at: q(1.4, 1.2), y: y0, rot: rand() * 6, n: 3, seed: Math.floor(rand() * 1e6) }, { t: 'barrel', at: q(1.9, -0.8), y: y0, rot: rand() * 6, n: 2, seed: Math.floor(rand() * 1e6) });
        if (rand() < 0.6) { const a = q(1.8, 0.2); L.push({ t: 'stool', at: a, y: y0, rot: rot, seed: 1 }); fig(a, y0, rot + Math.PI, { pose: 'low', dress: 'tunic', hat: 'cap', carry: 'none' }); } break;
      case 'baker': L.push({ t: 'sacks', at: q(1.3, 1.5), y: y0, rot: rand() * 6, n: 3, seed: Math.floor(rand() * 1e6) }); L.push({ t: 'firewood', at: q(0.8, -1.9), y: y0, rot: rot + Math.PI / 2, len: 1.5, seed: Math.floor(rand() * 100) }); break;
      case 'tavern': { const a = q(1.5, 1.4); L.push({ t: 'bench', at: a, y: y0, rot: rot + Math.PI / 2, len: 1.6 }, { t: 'barrel', at: q(1.0, -1.7), y: y0, rot: 0, n: 2, seed: Math.floor(rand() * 1e6) });
        if (rand() < 0.7) fig([a[0] + side[0] * 0.3, a[1] + side[1] * 0.3], y0, rot, { pose: 'sit', dress: 'tunic', hat: 'cap' }); break; }
      case 'shoemaker': { const a = q(1.6, 0.6); L.push({ t: 'stool', at: a, y: y0, rot, seed: 2 }); fig(a, y0, rot + Math.PI, { pose: 'low', dress: 'tunic', hat: 'cap', cloth: 'cloth_brown', carry: 'none' }); break; }
      case 'butcher': L.push({ t: 'crates', at: q(1.2, 1.4), y: y0, rot: rand() * 6, seed: Math.floor(rand() * 1e6) }); break;
      case 'fishmonger': L.push({ t: 'basket', at: q(1.1, 1.0), y: y0, rot: 0, s: 1, seed: Math.floor(rand() * 1e6) }, { t: 'basket', at: q(1.3, -0.5), y: y0, rot: 1, s: 0.9, seed: Math.floor(rand() * 1e6) }); break;
      case 'scribe': { const a = q(1.4, 0.5); L.push({ t: 'bench', at: a, y: y0, rot: rot + Math.PI / 2, len: 1.1 }); break; }
      default: if (rand() < 0.6) L.push({ t: rand() < 0.5 ? 'crates' : 'basket', at: q(1.1, 1.2), y: y0, rot: rand() * 6, seed: Math.floor(rand() * 1e6) });
    }
    // the homes' doors: firewood, a rain barrel, a woman with a besom or a spindle on the step, a child at play
    if (!isOpen && rand() < 0.4) {
      const k = rand();
      if (k < 0.35) L.push({ t: 'firewood', at: q(0.7, 1.3), y: y0, rot: rot + Math.PI / 2, len: 1.2, seed: Math.floor(rand() * 100) });
      else if (k < 0.65) L.push({ t: 'barrel', at: q(0.6, -1.1), y: y0, rot: 0, n: 1, seed: Math.floor(rand() * 1e6) });
      else { const a = q(1.0, 0.0); fig(a, y0, rot, { pose: 'stand', dress: 'robe', hat: 'veil', carry: pick(['basket', 'none']), broom: undefined }); nHome++; }
    }
    if (rand() < 0.07) { const a = q(2.0, (rand() - 0.5) * 2); fig(a, y0, rand() * 6.28, { pose: 'stand', h: 1.05 + rand() * 0.15, dress: 'tunic', hat: 'none', cloth: pick(CL) }); }
    if (rand() < 0.35) L.push({ t: 'lantern', at: q(0.3, 1.9), y: y0 + 0, rot: 0, kind: 'iron', h: 2.7 });
  }
  void nHome;
  // washing hung across the ruelles between the upper storeys, a wash rope from window to window
  const rows = rowMids(); let nw = 0;
  for (const c of laneCenters(FOCUS[0] - REACH, FOCUS[0] + REACH)) for (const z of rows) {
    if (nw >= 70 || Math.hypot(c - FOCUS[0], z - FOCUS[1]) > REACH || rand() < 0.45) continue;
    if (!inLot(c - LANE_WIDTH / 2 - 0.4, z) || !inLot(c + LANE_WIDTH / 2 + 0.4, z)) continue;
    L.push({ t: 'wash_line', at: [c, z], y: y0 + 5.2 + rand() * 1.2, rot: 0, len: LANE_WIDTH + 0.4, emb: [0.15, 0.15], clear: [0.4, 0.4], drop: 0.9, seed: Math.floor(rand() * 1000) }); nw++;
  }
  // the strand of the Seine: washerwomen kneeling at the water's edge with their beetles, wash spread on the grass to bleach,
  // fishermen sitting on the quay and the bank with their rods and a basket; nets hung to dry on poles
  const bank = (arm, side) => (side < 0 ? arm[1] - 1.4 : arm[3] + 1.4);
  for (const [arm, sd] of [[NORTH_ARM, -1], [SOUTH_ARM, 1]]) {
    const z = bank(arm, sd === -1 ? -1 : 1), face = sd < 0 ? 0 : Math.PI;                                    // faces the water
    for (let x = FOCUS[0] - 170; x < FOCUS[0] + 170; x += 24 + rand() * 20) {
      if (inLot(x, z + sd * 3, 1) || Math.abs(x) < 14 || Math.abs(x - 110) < 14) continue;
      const k = rand();
      if (k < 0.5) { for (let i = 0; i < 2; i++) fig([x + i * 1.0, z], height(x, z), face, { pose: 'kneel', dress: 'robe', hat: 'veil', cloth: pick(['cloth_indigo', 'cloth_grey', 'cloth_brown']), carry: 'none' }); L.push({ t: 'basket', at: [x - 0.9, z + sd * 0.6], y: height(x, z), rot: 0, seed: Math.floor(rand() * 1e6) }); }
      else if (k < 0.8) { fig([x, z], height(x, z), face, { pose: 'low', dress: 'tunic', hat: 'brim', cloth: pick(['cloth_brown', 'cloth_ochre']), carry: 'none' }); L.push({ t: 'basket', at: [x + 0.8, z + sd * 0.4], y: height(x, z), rot: 1, s: 0.8, seed: Math.floor(rand() * 1e6) }); }
      else L.push({ t: 'laundry', at: [x, z + sd * 2.2], y: height(x, z + sd * 2.2), rot: 0, len: 3.2, seed: Math.floor(rand() * 1000) });
    }
  }
  // the quay of the palace: grooms and boatmen, a porter with a sack
  for (const x of [-312, -292, -258, -190, -158, -140, -118]) fig([x, QUAY.z + 1.6], QUAY.y, faceTo([x, QUAY.z + 1.6], [x, QUAY.z - 3]), { pose: pick(['stand', 'low', 'talk']), dress: 'tunic', hat: pick(['cap', 'brim']), carry: 'none' });
  void inRect; void ISLAND;
  return [{ id: 'paris-fronts-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, -135], facing: 'n' }, bounds: [-420, -420, 420, 420], rooms: [], elements: L }];
}
