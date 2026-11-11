// The life of the Taj complex about 1653 (docs/settlements/mughal-agra.md §5, §10): goods set out on the verandahs of
// the forecourt's bazaar cells with their keepers sitting by them and buyers in the street; horses held by grooms in
// the forecourt, where visitors dismounted; boats on the Yamuna below the riverfront terrace.

import { RADIUS, STREETS, FORECOURT, KATRAS, HAVELI_OPEN, WORKSHOP, PLINTH, GATE, TERRACE, GARDEN, POOL, GWALKS, RIVER_Z, houses } from './layout.js';
import { ground } from './ground.js';
import { frameOf } from '../../styles/mughal/townhouse.js';
import { boatFloat } from '../../objects/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const WATER = -2.4;                                   // the Yamuna's level (ground.js)

export function life() {
  const rand = rng(1653), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const MEN = ['cloth_white', 'cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_indigo'], WOMEN = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white'];
  /** A man in the jama (a long robe) with a sash and a turban, or a woman in a long robe, her head veiled. */
  const person = (at, y, rot, o = {}) => {
    const woman = !o.man && rand() < 0.3;
    L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.7 ? 'skin_medium' : 'skin_dark', dress: 'robe',
      ...(woman ? { cloth: pick(WOMEN), cloth2: pick(WOMEN), hat: 'veil', hair: 'long' } : { cloth: pick(MEN), cloth2: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_white']), over: 'sash', hat: 'turban', hatMat: pick(['cloth_white', 'cloth_red', 'cloth_ochre']), hair: 'short', beard: rand() < 0.6 }),
      pose: rand() < 0.3 ? 'talk' : 'stand', ...o });
  };
  // the bazaar streets of the forecourt: cells of 3.2 m, verandahs 3 m deep on a plinth of 0.35 m (plan.js)
  const [fx0, , fx1] = FORECOURT, BZ = 200, BW = 4.5, PY = 0.35;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x0 = sx < 0 ? fx0 + 4.2 : 48, x1 = sx < 0 ? -48 : fx1 - 4.2, zf = BZ + sz * BW, s = sz < 0 ? 1 : -1, n = Math.round((x1 - x0) / 3.2), bw = (x1 - x0) / n;
    const face = s > 0 ? Math.PI : 0;                                        // toward the street
    for (let k = 0; k < n; k++) {
      if (rand() < 0.35) continue;
      const xc = x0 + (k + 0.5) * bw, zg = zf - s * 1.35, r = rand();
      for (const dx of [-0.55, 0.55]) {
        if (rand() < 0.25) continue;
        const at = [xc + dx, zg], q = rand();
        L.push(r < 0.3 ? { t: 'pot', kind: pick(['water_pot', 'dark_pot']), n: 2 + Math.floor(rand() * 4), at, y: PY, seed: Math.floor(rand() * 1e9) }
          : r < 0.55 ? { t: 'sacks', n: 2 + Math.floor(rand() * 3), at, y: PY, rot: face + (rand() - 0.5) * 0.4, seed: Math.floor(rand() * 1e9), mat: q < 0.5 ? 'sacking' : 'linen' }
            : { t: 'basket', n: 2 + Math.floor(rand() * 3), at, y: PY, seed: Math.floor(rand() * 1e9), goods: pick(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_indigo']) });
      }
      if (rand() < 0.6) person([xc, zf - s * 2.1], PY, face, { man: true, pose: 'cross' });
    }
    // buyers and passers-by in the street
    for (let k = 0; k < 7; k++) { const x = x0 + 3 + rand() * (x1 - x0 - 6); person([x, BZ + sz * (1 + rand() * 2.2)], 0.04, rand() < 0.6 ? face + Math.PI : rand() * 6.28); }
  }
  // horses held by grooms in the forecourt before the great gate, a few visitors
  for (const [x, z, rot] of [[-14, 179, 0.3], [-17.5, 180.5, 0.1], [15, 179.5, -0.2], [19, 181, -0.4], [-30, 215, 1.4], [33, 214, -1.6]]) {
    L.push({ t: 'animal', kind: 'horse', at: [x, z], y: 0.05, rot, seed: Math.floor(rand() * 1e9) });
    person([x + Math.cos(rot) * 0.9, z - Math.sin(rot) * 0.9 + 0.6], 0.05, rot, { man: true, pose: 'stand', cloth: 'cloth_white' });
  }
  // elephants with their mahouts astride the neck, goad in hand: one under a canopied howdah, one in its caparison
  // alone, an attendant at each ("would dismount from their horses or elephants" there: Wikipedia, Origins and
  // architecture of the Taj Mahal [stated]; the caparison, the howdah with its railing and canopy after Mughal
  // paintings, e.g. "Elephant with Mahout", c. 1660, https://www.metmuseum.org/art/collection/search/825608 [inferred])
  for (const [x, z, rot, o] of [[-38, 190, 0.35, { howdah: true, canopy: true, cloth: 'cloth_red', tusks: 'long' }], [41, 193, -0.5, { cloth: 'cloth_green', tusks: 'short' }]]) {
    L.push({ t: 'animal', kind: 'elephant', at: [x, z], y: 0.05, rot, seed: Math.floor(rand() * 1e9), gear: true, mahout: { cloth: pick(MEN), hatMat: pick(['cloth_white', 'cloth_red', 'cloth_ochre']) }, ...o });
    person([x + Math.cos(rot) * 1.9, z - Math.sin(rot) * 1.9 - 0.8], 0.05, rot, { man: true, pose: 'stand', cloth: 'cloth_white' });
  }
  for (let k = 0; k < 8; k++) person([(rand() - 0.5) * 70, 184 + rand() * 8], 0.05, rand() * 6.28);
  // the caravanserais of the Taj Ganj (§11): camels kneeling and standing in the courts with their bales, bullocks and a
  // cart, the merchants on the verandahs among their goods, the keeper at the gate, a water carrier (bhishti) with his
  // goatskin, porters bringing bales in; the lodger seated in the furnished cell
  for (const k of KATRAS) {
    const [x0, z0, x1, z1] = k.rect, zc = (z0 + z1) / 2, cx = (x0 + x1) / 2, g = k.gate === 'e' ? 1 : -1;
    for (let i = 0; i < 3; i++) L.push({ t: 'animal', kind: 'camel', at: [cx - g * (6 + i * 3.2), zc + (i % 2 ? 2.2 : -2.4)], y: 0.04, rot: Math.PI / 2 + (rand() - 0.5) * 0.6, seed: Math.floor(rand() * 1e9), gear: i !== 1 });
    if (k.id === 'resham') for (const dz of [-4.2, 4.6]) L.push({ t: 'laundry', at: [cx - g * 12, zc + dz], y: 0.04, rot: Math.PI / 2, len: 10, seed: 91 + Math.round(dz) });   // dyed silk hung out to dry in the court
    for (let i = 0; i < 2; i++) L.push({ t: 'animal', kind: 'zebu', at: [cx + g * (9 + i * 2.2), zc - 3.5], y: 0.04, rot: -g * Math.PI / 2, seed: Math.floor(rand() * 1e9) });
    L.push({ t: 'cart', at: [cx + g * 12.5, zc + 2.6], y: 0.04, rot: Math.PI / 2, seed: Math.floor(rand() * 1e9) });
    person([cx - g * 4.5, zc + 0.6], 0.04, rand() * 6.28, { man: true, pose: 'staff', cloth: 'cloth_white', cloth2: 'cloth_red' });
    person([k.gate === 'e' ? x1 - 2.5 : x0 + 2.5, zc + 1.6], 0.04, g * Math.PI / 2, { man: true, carry: 'bundle', loadCloth: 'hide_brown', cloth: 'cloth_white', cloth2: 'cloth_white' });
    person([k.gate === 'e' ? x1 - 3.2 : x0 + 3.2, zc - 1.5], 0.04, -g * Math.PI / 2, { man: true, carry: 'headload', loadCloth: pick(['cloth_white', 'sacking', 'cloth_indigo']) });
    for (const [zv, face] of [[z0 + 6.2, Math.PI], [z1 - 6.2, 0]]) for (let i = 0; i < 4; i++) { if (rand() < 0.35) continue; const x = x0 + 4 + i * 9 + rand() * 3; person([x, zv], 0.35, face, { man: true, pose: 'cross' }); L.push({ t: 'sacks', n: 2 + Math.floor(rand() * 3), at: [x + 1.0, zv], y: 0.35, rot: face, seed: Math.floor(rand() * 1e9), mat: k.id === 'fulel' || k.id === 'resham' ? 'linen' : 'sacking' }); }
  }
  // the open house: the master on his takht with the hookah, a woman by the water pots in the court
  { const [x0, z0, x1, z1] = HAVELI_OPEN, tx = (x0 + 3.4 + x1 - 3.8) / 2; person([tx - 0.3, z0 + 1.3], 0.45 + 0.4 + 0.02, Math.PI, { man: true, pose: 'cross', cloth: 'cloth_white', cloth2: 'cloth_green' }); person([x0 + 3.4 + 1.6, z1 - 3.4 - 1.3], 0.04, -Math.PI / 2, { cloth: 'cloth_red', cloth2: 'cloth_ochre', hat: 'veil', hair: 'long', beard: false, over: 'none' }); }
  // the shops of the town's streets: the keeper sits cross-legged on his platform among his goods, a customer stands in the street at some
  for (const h of houses()) {
    if (!h.shop || rand() < 0.3) continue;
    const f = frameOf(h.rect, h.front), n = Math.max(1, Math.round((f.W - 0.8) / 2.7)), bw = (f.W - 0.8) / n, i = Math.floor(rand() * n);
    const lx = -f.W / 2 + 0.4 + (i + 0.5) * bw + 0.5, [x, z] = f.pt(lx, -1.15);
    person([x, z], 0.37, Math.PI + f.yaw, { man: true, pose: 'cross', cloth: 'cloth_white', hatMat: pick(['cloth_white', 'cloth_red', 'cloth_ochre']) });
    if (rand() < 0.3) { const [cx, cz] = f.pt(lx + 0.4, 1.8); person([cx, cz], 0.04, f.yaw, rand() < 0.5 ? { man: true, pose: 'talk' } : { pose: 'stand' }); }
  }
  // the inlay workshop (§12): two stone-cutters at their wheels, three inlayers at their benches, the master on his cushion
  { const f = frameOf(WORKSHOP.rect, WORKSHOP.front), FY = 0.38;
    for (const [lx, lz] of [[-4.0, -3.75], [-1.6, -3.75], [-3.8, -7.45], [-1.2, -7.45], [3.0, -8.25]]) { const [x, z] = f.pt(lx, lz); person([x, z], FY, f.yaw, { man: true, pose: 'cross', cloth: 'cloth_white', cloth2: pick(['cloth_ochre', 'cloth_green']), hatMat: 'cloth_white' }); }
    const [mx, mz] = f.pt(4.3, -4.0); person([mx, mz], FY, Math.PI + f.yaw - 0.3, { man: true, pose: 'cross', cloth: 'cloth_white', cloth2: 'cloth_indigo', beard: true, hatMat: 'cloth_red' }); }
  // washermen (dhobi) on the Yamuna's bank east of the terrace: standing at their stones, cloth spread on the sand
  for (let k = 0; k < 5; k++) { const x = 182 + k * 9 + rand() * 3; person([x, -253.2], 0.0, Math.PI / 2 * 0 + 0.2, { man: true, pose: 'stand', cloth: 'cloth_white', hat: undefined, hatMat: 'cloth_white' }); }



  // ── inside the Taj's halls (§14): the faithful at prayer in the mosque, a reader in the jawab and the pavilions, the guards in the gate's rooms ──
  { const ty = TERRACE.y + 0.05, X0 = -138 + 1.6, mz0 = -232 + 1.4, mw = 0.91, ml = 1.95;
    // the mosque's rows: men kneeling on their rugs facing the qibla (west), the front rows fuller; the imam before the mihrab
    for (let row = 0; row < 3; row++) for (let c = 0; c < 56; c++) {
      if (rand() > (row === 0 ? 0.28 : row === 1 ? 0.18 : 0.08)) continue;
      const x = X0 + 0.9 + row * ml + ml * 0.55, z = mz0 + 0.5 + c * mw + mw / 2;
      person([x, z], ty, Math.PI / 2, { man: true, pose: 'kneel', arms: 'pray', cloth: 'cloth_white', cloth2: 'cloth_white', hatMat: pick(['cloth_white', 'cloth_white', 'cloth_ochre']) });
    }
    person([X0 + 1.4, -203 - 4.6 + 4.6], ty, Math.PI / 2, { man: true, pose: 'kneel', arms: 'pray', cloth: 'cloth_white', cloth2: 'cloth_green', hatMat: 'cloth_white', beard: true });
    person([-120, -203 + 6], ty, Math.PI / 2, { man: true, pose: 'cross', cloth: 'cloth_white', hatMat: 'cloth_white', beard: true });
    person([123, -203 - 7], ty, 0, { man: true, pose: 'cross', cloth: 'cloth_white', cloth2: 'cloth_ochre', hatMat: 'cloth_red', beard: true });
    // the garden's pavilions: a keeper dozing on the divan and a visitor
    for (const sx of [-1, 1]) person([sx < 0 ? GARDEN[0] - 3.5 : GARDEN[2] + 2.5, 4], 0.65, sx < 0 ? Math.PI / 2 : -Math.PI / 2, { man: true, pose: 'cross', cloth: 'cloth_white', cloth2: 'cloth_ochre', hatMat: 'cloth_white' });
    // the guards of the gate: one on each middle charpoy, one standing at the door within
    for (const sg of [-1, 1]) {
      const cx = GATE.c[0], cz = GATE.c[1], w = GATE.w / 2, d = GATE.d / 2, ow = sg < 0 ? cx - w + 2.4 : cx + w - 2.4, zc = cz, ox2 = sg < 0 ? 1 : -1;
      person([ow + ox2 * 1.0, zc], 0.04 + 0.45, sg < 0 ? Math.PI / 2 : -Math.PI / 2, { man: true, pose: 'cross', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'sash', hatMat: 'cloth_red', beard: true });
      person([ow + ox2 * 5.2, zc + 2.2], 0.04, sg < 0 ? Math.PI / 2 : -Math.PI / 2, { man: true, pose: 'staff', cloth: 'cloth_white', cloth2: 'cloth_red', hatMat: 'cloth_red' });
      void d;
    }
  }
  // ── the streets of the town (§14): tea stalls with their stools, water stands (pyau), hawkers with their mats, handcarts,
  // zebu resting at the frontage, wells at the crossings, a goat tied at a post — spread along each street from the layout ──
  { const lim = RADIUS - 34, ok = (x, z) => Math.hypot(x, z) < lim && z > -214, bay = (s) => (s.bazaar ? 15 : 24);
    let n = 0;
    for (const s of STREETS) {
      const [x0, z0, x1, z1] = s.rect, alongZ = z1 - z0 > x1 - x0, mid = alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2, half = (alongZ ? x1 - x0 : z1 - z0) / 2;
      const a0 = (alongZ ? z0 : x0) + 6, a1 = (alongZ ? z1 : x1) - 6;
      for (let t = a0 + rand() * 6; t < a1; t += bay(s) * (0.8 + rand() * 0.5)) {
        const side = rand() < 0.5 ? -1 : 1, off = Math.max(half - 2.3 - rand() * 1.0, 0.8), v = mid + side * off;
        const x = alongZ ? v : t, z = alongZ ? t : v;
        if (!ok(x, z)) continue;
        const th = alongZ ? -side * Math.PI / 2 : (side < 0 ? 0 : Math.PI), sd = Math.floor(rand() * 1e9), k = n++ % 7, q = rand();
        const along = (d) => (alongZ ? [x, z + d] : [x + d, z]);      // a point d metres along the street from the item
        if (k === 0 || (k === 4 && s.bazaar)) {
          // the tea stall: a low table, a stool each side with a man sitting, the stall-keeper squatting by the fire-pot
          L.push({ t: 'tea_table', at: [x, z], y: 0.04, rot: th, seed: sd });
          for (const d of [-0.85, 0.85]) { const [px, pz] = along(d); L.push({ t: 'stool', at: [px, pz], y: 0.04, rot: th + (alongZ ? (d < 0 ? Math.PI / 2 : -Math.PI / 2) : (d < 0 ? Math.PI / 2 : -Math.PI / 2)), seed: sd }); person([px, pz], 0.04, th + (d < 0 ? -Math.PI / 2 : Math.PI / 2) + (alongZ ? 0 : 0), { man: true, pose: 'sit_low', cloth: pick(MEN), hatMat: pick(['cloth_white', 'cloth_red', 'cloth_ochre']) }); }
          const [kx, kz] = along(-2.2); person([kx, kz], 0.04, th, { man: true, pose: 'squat', cloth: 'cloth_white', cloth2: 'cloth_brown', hatMat: 'cloth_white' });
        } else if (k === 1) {
          // the water stand: jars on a bench under a cloth, a woman or a boy giving drink
          L.push({ t: 'pot', kind: 'matka', n: 1, at: [x, z], y: 0.04, seed: sd }); { const [px, pz] = along(0.55); L.push({ t: 'pot', kind: 'matka', n: 1, at: [px, pz], y: 0.04, seed: sd + 1 }); const [ox, oz] = along(1.1); L.push({ t: 'pot', kind: 'matka', n: 1, at: [ox, oz], y: 0.04, seed: sd + 2 }); }
          const [wx, wz] = along(-0.9); person([wx, wz], 0.04, th, { cloth: pick(WOMEN), cloth2: 'cloth_white', hat: 'veil', hair: 'long', pose: 'cross' });
        } else if (k === 2 || k === 5) {
          // the hawker on his mat with fruit, pottery or spice, sitting behind it
          L.push({ t: 'goods_mat', at: [x, z], y: 0.04, rot: th, goods: pick([['melons', 'greens'], ['pottery', 'baskets'], ['spice', 'heap'], ['bread', 'baskets'], ['greens', 'melons']]), seed: sd });
          const bx = x - Math.sin(th) * 0.95, bz = z - Math.cos(th) * 0.95; person([bx, bz], 0.04, th + Math.PI, { man: q < 0.7, pose: 'cross', cloth: pick(MEN), hatMat: pick(['cloth_white', 'cloth_ochre']) });
        } else if (k === 3) {
          // a handcart at rest with its load, a zebu lying near it
          L.push({ t: 'handcart', at: [x, z], y: 0.04, rot: th, load: pick(['sacks', 'baskets', 'crates']), seed: sd });
        } else if (k === 6) {
          // a zebu cow at the frontage, a dog asleep
          L.push({ t: 'animal', kind: q < 0.55 ? 'zebu' : 'buffalo', at: [x, z], y: 0.04, rot: th + Math.PI / 2 + (rand() - 0.5), seed: sd });
          const [dx2, dz2] = along(2.4); L.push({ t: 'animal', kind: q < 0.5 ? 'dog' : 'goat', at: [dx2, dz2], y: 0.04, rot: rand() * 6.28, seed: sd + 3 });
        }
      }
    }
    // wells with their troughs where the streets cross
    const wells = []; for (const v of STREETS.filter((q) => q.rect[3] - q.rect[1] > q.rect[2] - q.rect[0])) for (const h of STREETS.filter((q) => q.rect[2] - q.rect[0] > q.rect[3] - q.rect[1])) if (v.rect[0] < h.rect[2] && v.rect[2] > h.rect[0] && v.rect[1] < h.rect[3] && v.rect[3] > h.rect[1]) wells.push([v.rect[2] - 1.8, h.rect[1] + 1.8]);
    for (const [x, z] of wells) if (ok(x, z)) { L.push({ t: 'well', at: [x, z], y: 0, rot: 0, seed: Math.floor(rand() * 1e9) }); person([x + 1.6, z + 1.0], 0, 0.3, { cloth: pick(WOMEN), cloth2: 'cloth_white', hat: 'veil', hair: 'long', carry: 'pot' }); }
  }
  // ── the Taj's garden and the plinth (docs/settlements/mughal-agra.md §13): the visitors, gardeners and servants ──
  // strolling groups on the axial walks (the marble-edged lanes either side of the channel), a gardener watering the
  // beds, the sweepers and the readers of the Qur'an on the plinth, guards at the gate
  { const lane = 0.35;
    for (const [z, sx] of [[118, -1], [96, 1], [74, -1], [48, 1], [30, -1], [-34, 1], [-58, -1], [-84, 1], [-108, -1], [-124, 1], [22, 1]]) {
      const x = sx * (6 + rand() * 3);
      // a gentleman with an attendant behind him (one with a fly-whisk's staff), or a veiled woman with a maid
      if (rand() < 0.55) { person([x, z], lane, Math.PI * (rand() < 0.5 ? 0 : 1) + (rand() - 0.5) * 0.4, { man: true, cloth: pick(['cloth_white', 'cloth_ochre', 'cloth_blue']), cloth2: pick(['cloth_green', 'cloth_maroon', 'cloth_red']), hatMat: pick(['cloth_red', 'cloth_ochre', 'cloth_white']), pose: 'stand' }); person([x + sx * 1.1, z + 1.2], lane, Math.PI, { man: true, pose: 'staff', cloth: 'cloth_white' }); }
      else { person([x, z], lane, rand() * 6.28, { cloth: pick(['cloth_red', 'cloth_maroon', 'cloth_green']), cloth2: 'cloth_white', hat: 'veil', hair: 'long', pose: 'stand' }); person([x + 1.0, z + 0.6], lane, rand() * 6.28, { cloth: 'cloth_ochre', cloth2: 'cloth_white', hat: 'veil', hair: 'long', carry: 'child' }); }
    }
    // pilgrims and children sitting on the edge of the great tank and the lotus tanks' marble rim
    for (let k = 0; k < 6; k++) { const a = k * 1.05 + 0.3, r = POOL.a + 3.6; person([Math.cos(a) * r, Math.sin(a) * r], lane + 0.02, a + Math.PI, { pose: k % 2 ? 'sit_ground' : 'stand', man: k % 3 !== 0 }); }
    // the gardeners (mali): one with a pot on his head carrying water to the beds, two at work in the beds with hoes
    for (const [x, z, o] of [[-30, 60, { carry: 'pot' }], [34, -66, { carry: 'hoe' }], [-64, -102, { carry: 'hoe', pose: 'squat' }], [66, 100, { carry: 'pot' }], [-98, 40, { carry: 'broom' }]]) person([x, z], 0, rand() * 6.28, { man: true, cloth: 'cloth_white', cloth2: 'cloth_brown', hat: 'turban', hatMat: 'cloth_white', beard: false, ...o });
    // the plinth: sweepers at the tomb's marble, mourners and readers of the Qur'an before the south door, their carpets
    const py = PLINTH.y, pz = PLINTH.c[1];
    for (const [x, z, o] of [[-14, pz + 36, { carry: 'broom' }], [20, pz + 38, { carry: 'broom' }]]) person([x, z], py, rand() * 6.28, { man: true, cloth: 'cloth_white', cloth2: 'cloth_brown', hat: 'turban', ...o });
    for (const [x, z, p] of [[-9, pz + 33.5, 'cross'], [-6.2, pz + 34.2, 'pray'], [7, pz + 33.8, 'cross'], [10.5, pz + 34.6, 'kneel'], [-12, pz + 32.5, 'cross']]) person([x, z], py, Math.PI + (rand() - 0.5) * 0.3, { man: true, pose: p, cloth: 'cloth_white', cloth2: 'cloth_white', hatMat: 'cloth_white' });
    for (const [x, z] of [[-9.6, pz + 33.2], [8.4, pz + 33.4]]) L.push({ t: 'goods_mat', at: [x, z], y: py, rot: 0, seed: Math.floor(rand() * 1e9), goods: [] });
    // by the gate: the guards on duty under the arch, spears and shields at the posts
    for (const [x, z, rot] of [[-5, GATE.c[1] - 8.5, 0], [5, GATE.c[1] - 8.5, 0], [-4, GATE.c[1] + 9.2, Math.PI], [4, GATE.c[1] + 9.2, Math.PI]]) person([x, z], 0.04, rot, { man: true, pose: 'staff', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'sash', hatMat: 'cloth_red', beard: true });
    // pigeon feeders and a fakir at the south door of the forecourt
    L.push({ t: 'chickens', kind: 'pigeon', n: 9, at: [-22, 186], y: 0.05, seed: 77 }); L.push({ t: 'chickens', kind: 'pigeon', n: 7, at: [24, 210], y: 0.05, seed: 78 });
    person([-3, 208], 0.05, 0, { man: true, pose: 'cross', cloth: 'cloth_ochre', cloth2: 'cloth_ochre', hat: 'turban', hatMat: 'cloth_ochre', beard: true, over: 'none' });
    L.push({ t: 'goods_mat', at: [-3, 207.2], y: 0.05, rot: 0, seed: 5, goods: [] });
  }
  // ── the Yamuna: people and cattle at the water, boatmen in the boats, nets on the sand (§13) ──
  { const wy = (x, z) => ground.height(x, z);
    // the buffaloes of the washermen's side, standing in the shallows with a herdsman on the bank
    for (const [x, z, rot] of [[-176, RIVER_Z + 2.3, 1.5], [-168, RIVER_Z + 1.6, 1.8], [-183, RIVER_Z + 2.8, 1.2]]) L.push({ t: 'animal', kind: 'buffalo', at: [x, z], y: wy(x, z), rot, seed: Math.floor(rand() * 1e9) });
    person([-172, RIVER_Z + 8.5], wy(-172, RIVER_Z + 8.5), 0.4, { man: true, pose: 'staff', cloth: 'cloth_brown', cloth2: 'cloth_white', hatMat: 'cloth_ochre' });
    // bathers' clothes and washing laid out by the dhobi, a line of sheets
    L.push({ t: 'laundry', at: [190, -246.2], y: 0, rot: 0, len: 9, seed: 41 }); L.push({ t: 'laundry', at: [212, -245.6], y: 0, rot: 0.06, len: 7, seed: 42 });
    for (let k = 0; k < 3; k++) L.push({ t: 'pot', kind: 'water_pot', n: 2, at: [181 + k * 17, -255.6], y: 0, seed: Math.floor(rand() * 1e9) });
    // two women filling pots at the water's edge, a boy fishing from the rocks
    for (const x of [-132, 128]) { const z = RIVER_Z + 5.4; person([x, z], wy(x, z), 0.1, { cloth: pick(WOMEN), cloth2: 'cloth_white', hat: 'veil', hair: 'long', pose: 'squat' }); }
    person([14, -259.4], wy(14, -259.4), 0, { man: true, child: true, pose: 'sit_ground', cloth: 'cloth_white' });
    // fishing nets spread to dry on the sand, a drying rack of poles
    for (let k = 0; k < 3; k++) L.push({ t: 'block', rect: [-70 + k * 4.4, -255.0, -67 + k * 4.4, -252.6], y0: 0, y1: 0.025, mat: 'rope_fibre', collide: false });
  }
  // boats on the Yamuna: thatch-roofed barges and rowing boats along the river, below the terrace
  for (const [x, z, kind, len] of [[-95, -268.6, 'barge', 12], [-40, -270, 'rowboat', 5], [10, -269, 'barge', 11], [70, -270.2, 'rowboat', 4.5], [118, -268.6, 'barge', 12.5], [160, -271, 'rowboat', 5], [-150, -270, 'rowboat', 4.8], [-122, -307, 'rowboat', 4.5], [98, -310, 'rowboat', 4.8]]) {
    if (Math.hypot(x, z) > RADIUS - 40) continue;
    const rot = Math.PI / 2 + (rand() - 0.5) * 0.3, by = WATER + boatFloat(kind), c = Math.cos(rot), sn = Math.sin(rot), at = (lx, lz) => [x + lx * c + lz * sn, z - lx * sn + lz * c];
    L.push({ t: 'boat', kind, len, at: [x, z], y: by, rot, seed: Math.floor(rand() * 1e9) });
    // the boatman at the stern poling or at the oars, a passenger or a fisherman amidships (the boats stand: their men pole in place)
    person(at(0, -len * 0.34), by + 0.12, rot + Math.PI, { man: true, pose: kind === 'barge' ? 'punt' : 'row', carry: kind === 'barge' ? 'punt' : 'oars', cloth: 'cloth_brown', cloth2: 'cloth_white', hat: 'turban', hatMat: 'cloth_white', over: 'none' });
    if (kind === 'barge') { for (const [lz, g] of [[len * 0.12, 'cloth_white'], [len * 0.2, 'cloth_ochre']]) L.push({ t: 'sacks', n: 3, at: at(0.2, lz), y: by + 0.1, rot, seed: Math.floor(rand() * 1e9), mat: g === 'cloth_white' ? 'linen' : 'sacking' }); }
    else person(at(0, len * 0.1), by + 0.12, rot, { man: true, pose: 'cross', cloth: 'cloth_white', cloth2: 'cloth_green', hatMat: 'cloth_red' });
  }
  return L;
}
export const lifePlan = () => ({ id: 'mughal-agra-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 245], facing: 'n' } });
