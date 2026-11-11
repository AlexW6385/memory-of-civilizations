// The things of the street (carts, stalls, barrels, baskets, benches, laundry, firewood, animals...):
// plans built with town.js's `base`, added to the town. Owned by the street-life pass (docs/batches.md B1).
//
// What Bianjing's streets hold at eye level, after the Qingming scroll (docs/settlements/song-kaifeng.md §11):
// at every shop its trade's goods spilling into the street (baskets, jars, sacks, barrels, mats of wares, a
// bench for the customers, a hawker's stand with its parasol), at the houses the firewood stacked against the
// wall, the water vat by the door, the drying tray, the wash on its line, in the streets the parked carts,
// barrows, sedan chairs and their bearers resting, the beasts tethered to hitching posts, the public wells
// with their bucket-carriers, and along the river's quays the sacks, barrels, crates, mooring posts and
// porters. Everything is derived from layout.js (lots, streets, lanes, river) at build time; every thing is an
// instance of the shared life-style objects (src/objects), merged per material by the plan.
import { RADIUS, RIVER, BRIDGE, WALL_X, FIELDS_X, GATE, STREETS, LANES, STONE_BANK, WHARVES, STEPS, lots, inLot, inRect, bridgeDeck } from './layout.js';
import { tradeOf } from './trades.js';
import { shopElements } from './shops.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FR = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_ochre'];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
const Y = 0.04;

/** A lot's front: P(t, off) a point at fraction t along it, off out into the street (negative: in); rot turns an object's +z outward. */
function frontOf(l) {
  const [x0, z0, x1, z1] = l.rect, f = l.front, n = FR[f], along = f === 'n' || f === 's';
  const P = (t, off) => (along ? [x0 + (x1 - x0) * t, (f === 'n' ? z0 : z1) + n[1] * off] : [(f === 'e' ? x1 : x0) + n[0] * off, z0 + (z1 - z0) * t]);
  return { P, n, L: along ? x1 - x0 : z1 - z0, rot: Math.atan2(n[0], n[1]) };
}
/** How far into its street a lot's things may stand (a lane leaves its middle free; the main streets give a wide margin). */
function reach(l) {
  const r = l.street >= 100 ? LANES[l.street - 100] : STREETS[l.street];
  if (!r) return 1;
  const w = Math.min(r[2] - r[0], r[3] - r[1]);
  return w <= 4.5 ? 0.85 : w <= 8.5 ? 1.9 : 4.6;
}
const onWay = (x, z, m = -0.15) => STREETS.some((s) => inRect(s, x, z, m)) || LANES.some((s) => inRect(s, x, z, m));
const inRiverStrip = (x, z) => z > RIVER.z0 - 0.6 && z < RIVER.z1 + 0.6;

export function streetPlans(base) {
  const L = [], S = [], rand = rng(2024), pick = (a) => a[Math.floor(rand() * a.length)];
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: rand() < 0.65 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', hat: pick(['none', 'cap', 'cap', 'straw', 'brim']), carry: 'none', ...extra });
  const animal = (kind, at, rot, extra = {}) => L.push({ t: 'animal', kind, at, y: Y, rot, seed: Math.floor(rand() * 1e9), gear: false, ...extra });
  const seed = () => Math.floor(rand() * 1e9);
  const dBridge = (x, z) => Math.hypot(x, z - BRIDGE.at[1]);
  // the sign poles stand out in front of the shops: keep the things clear of them
  const poles = [];
  for (const e of shopElements()) { const c = Math.cos(e.rot), s = Math.sin(e.rot); poles.push([e.at[0] + e.poleX * c + e.poleZ * s, e.at[1] - e.poleX * s + e.poleZ * c]); }
  const nearPole = (x, z, r) => poles.some(([px, pz]) => Math.abs(px - x) < r && Math.abs(pz - z) < r);
  /** Is a disc of radius r at (x, z) free: on a way, off the houses and the river, clear of the poles? */
  const free = (x, z, r) => Math.hypot(x, z) < RADIUS - 32 && !inRiverStrip(x, z) && onWay(x, z, -r * 0.5) && !inLot(x, z, r) && !nearPole(x, z, r + 0.35) && !(x > GATE.rect[0] - 3 && x < GATE.rect[2] + 3 && z > GATE.rect[1] && z < GATE.rect[3]);
  const taken = [];
  const clear = (x, z, r) => !taken.some(([a, b, q]) => (a - x) ** 2 + (b - z) ** 2 < (q + r) ** 2);
  const claim = (x, z, r) => taken.push([x, z, r]);
  // the colour gates, the tea houses' tables, the Rainbow Bridge's crowd are town.js's: keep off the bridge approach and the wine and tea lots
  const special = new Set(lots().filter((l) => l.kind === 'wine' || l.kind === 'tea'));
  for (const l of special) { const [x0, z0, x1, z1] = l.rect; claim((x0 + x1) / 2, (z0 + z1) / 2, Math.hypot(x1 - x0, z1 - z0) / 2 + 3); }
  // the town.js sedan chairs, oxcarts, barrows, the physician's boards and the fortune tellers
  for (const [x, z, r] of [[-3.5, -30, 4], [3.2, 8, 4], [-3, 40, 4], [3.5, 130, 4], [-3.2, 170, 4], [-176, -81.5, 7], [3.6, 162, 7], [-118, 51.5, 4], [-3.8, 124, 4], [60, 199, 5], [-236, -77.9, 4], [5.3, 22, 4], [-282, -84, 6], [-268, -81, 4]]) claim(x, z, r);
  const spot = (x, z, r) => free(x, z, r) && clear(x, z, r);
  const add = (el, r = 0.5) => { L.push(el); claim(el.at[0], el.at[1], r); };

  // ---- the lots' fronts ---------------------------------------------------------------------------------
  for (const l of lots()) {
    if (special.has(l) || l.zone === 'country' && l.kind !== 'farm') continue;
    const F = frontOf(l), d = dBridge(...F.P(0.5, 0)), trade = tradeOf(l), lim = reach(l), r = rng(l.seed * 7 + 3), rp = (a) => a[Math.floor(r() * a.length)];
    if (Math.hypot(...F.P(0.5, 0)) > RADIUS - 40) continue;
    const near = d < 260, along = (t, o) => F.P(t, o);
    const tryAdd = (el, rad, t, off) => { const p = along(t, off); if (!spot(p[0], p[1], rad)) return false; add({ ...el, at: p }, rad); return true; };
    if (l.shop && trade && l.kind !== 'warehouse') {
      // slots along the front, each with one of the trade's things; a bench with sitters at some, a hawker's stand on the wide streets
      const slots = Math.max(1, Math.min(4, Math.floor(F.L / 3.4))), out = Math.min(lim, 1.35 + (l.storeys === 2 ? 0.1 : 0.4));
      const things = THINGS[trade] ?? THINGS.generic;
      if (lim > 1 && r() < (near ? 0.55 : 0.3)) benchWith(F, l, r, lim, tryAdd, person);
      for (let k = 0; k < slots; k++) {
        if (r() < (near ? 0.12 : 0.45)) continue;
        const t = (k + 0.5 + (r() - 0.5) * 0.5) / slots, th = rp(things), off = out + r() * Math.max(0, Math.min(lim - out, 0.5)), rot = F.rot;
        const p = th(F, { t, off, rot, seed: seed(), r });
        for (const e of p) tryAdd(e.el, e.r, e.t ?? t, e.off ?? off);
      }
      // the shop's lantern box hangs from the eaves at night: the houses draw their own (houses.js); here the hawker's stand in the open street
      if (lim > 4 && F.L > 5 && r() < (near ? 0.5 : 0.2)) {
        const off = lim - 0.4 - r() * 0.8, t = 0.2 + r() * 0.6, p = along(t, off), rad = 1.5;
        if (spot(p[0], p[1], rad)) {
          add(r() < 0.55 ? { t: 'stall', at: p, y: Y, rot: F.rot + Math.PI, w: 2.2 + r() * 0.6, d: 1.1, awning: rp(['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_red']), goods: rp([['heap', 'greens', 'melons'], ['bread', 'baskets'], ['bolts', 'pottery'], ['fish', 'greens'], ['basket', 'produce']]), seed: seed() } : { t: 'goods_mat', at: p, y: Y, rot: F.rot, goods: rp([['heap', 'baskets'], ['greens', 'basket'], ['pottery', 'bolts'], ['melons', 'heap']]), seed: seed() }, rad);
          if (r() < 0.8) person([p[0] + F.n[0] * 1.5, p[1] + F.n[1] * 1.5], Y, faceTo([-F.n[0], -F.n[1]]), { pose: 'stand', carry: rp(['basket', 'none', 'none']) });
          if (r() < 0.5) person([p[0] - F.n[0] * 1.4, p[1] - F.n[1] * 1.4], Y, faceTo(F.n), { pose: rp(['sit_low', 'squat']), hat: rp(['straw', 'cap']), cloth: rp(CLOTH) });
        }
      }
    } else if (l.kind === 'house' || l.kind === 'thatch' || l.kind === 'farm' || l.kind === 'inn' || l.kind === 'warehouse') {
      const dens = l.kind === 'warehouse' || l.kind === 'inn' ? 0.9 : l.det >= 2 ? 0.95 : l.det === 1 ? 0.75 : 0.5;
      if (r() > dens) continue;
      const out = l.kind === 'farm' ? 1.2 : 0.55;
      // the firewood stacked against the wall, or the water vat by the door, a drying tray, the baskets, the wash on its line
      const k = r();
      const a = 0.12 + r() * 0.2, b = 0.62 + r() * 0.25, e = r() < 0.5 ? a : b;
      if (l.kind === 'warehouse') {
        tryAdd({ t: 'sacks', y: Y, rot: F.rot, n: 3 + Math.floor(r() * 3), seed: seed() }, 0.9, a, Math.min(lim, 1.5));
        tryAdd({ t: 'crates', y: Y, rot: F.rot, n: 4, seed: seed() }, 0.8, b, Math.min(lim, 1.4));
        if (r() < 0.6) tryAdd({ t: 'barrow', y: Y, rot: F.rot + Math.PI / 2, seed: seed() }, 0.9, 0.5, Math.min(lim, 2.4));
      } else if (k < 0.3) tryAdd({ t: 'firewood', y: Y, rot: F.rot, len: 1.5, seed: seed() }, 0.8, e, out);
      else if (k < 0.55) tryAdd({ t: 'pot', kind: 'vat', y: Y, rot: r() * 6.28 }, 0.45, e, out + 0.1);
      else if (k < 0.7) tryAdd({ t: 'drying_tray', y: Y, rot: r() * 6.28, seed: seed() }, 0.6, e, out + 0.3);
      else if (k < 0.85) tryAdd({ t: 'basket', y: Y, rot: r() * 6.28, n: 2, seed: seed() }, 0.6, e, out + 0.1);
      else if (lim > 1.5 || l.kind === 'farm') tryAdd({ t: 'laundry', y: Y, rot: F.rot + Math.PI / 2, len: 3.5, seed: seed() }, 1.2, 0.5, out + 1.3);
      if (r() < 0.3) tryAdd({ t: 'bench', y: Y, rot: F.rot, len: 1.5, mat: 'timber' }, 0.8, 1 - e, out + 0.1);
      if (r() < 0.12) tryAdd({ t: 'chickens', y: Y, rot: r() * 6.28, seed: seed() }, 0.8, r(), out + 0.8);
      // a neighbour on the doorstep, a woman at her work
      if (near && r() < 0.18 && lim > 0.9) { const p = along(0.2 + r() * 0.6, out + 0.7); if (spot(p[0], p[1], 0.4)) { person(p, Y, faceTo(F.n), { pose: rp(['sit_low', 'squat', 'stand']), dress: 'robe', hat: 'none', hair: 'bun', cloth: rp(CLOTH) }); claim(p[0], p[1], 0.5); } }
    }
  }

  // ---- the streets: parked carts, barrows, sedan chairs and their bearers, tethered beasts, wells ---------
  const mains = STREETS.slice(0, 6);
  for (const s of mains) {
    const horiz = s[2] - s[0] > s[3] - s[1], w = horiz ? s[3] - s[1] : s[2] - s[0];
    const a0 = horiz ? Math.max(s[0], WALL_X + 20) : s[1], a1 = horiz ? Math.min(s[2], FIELDS_X - 10) : s[3];
    const cen = horiz ? (s[1] + s[3]) / 2 : (s[0] + s[2]) / 2, side = w / 2 - 1.3;
    const W = (a, o) => (horiz ? [a, cen + o] : [cen + o, a]);
    for (let a = a0 + 6 + rand() * 14; a < a1 - 8; a += 13 + rand() * 20) {
      const o = (rand() < 0.5 ? -1 : 1) * (side - rand() * 0.7), p = W(a, o), dir = horiz ? [rand() < 0.5 ? 1 : -1, 0] : [0, rand() < 0.5 ? 1 : -1];
      const nearB = dBridge(...p) < 260;
      if (rand() > (nearB ? 0.8 : 0.4) || !spot(p[0], p[1], 2.4)) continue;
      const along = dir, out = [horiz ? 0 : (o > 0 ? 1 : -1), horiz ? (o > 0 ? 1 : -1) : 0], rot0 = faceTo(along) + Math.PI;
      const q = rand();
      claim(p[0], p[1], 3.2);
      if (q < 0.22) {                            // a two-wheeled cart with its donkey, unhitched or standing in the shafts, the driver asleep on the load
        L.push({ t: 'cart', kind: 'two', beast: pick(['donkey', 'donkey', 'ox']), load: pick(['sacks', 'barrels', 'hay', 'sacks']), at: p, y: Y, rot: rot0, seed: seed() });
        person([p[0] - along[0] * 2.5 + out[0] * 0.9, p[1] - along[1] * 2.5 + out[1] * 0.9], Y, faceTo(along), { dress: 'trousers', hat: 'straw', cloth: pick(CLOTH), pose: pick(['sit_low', 'stand']) });
      } else if (q < 0.4) {                      // a wheelbarrow with its load, a man resting by it
        L.push({ t: 'barrow', at: p, y: Y, rot: rot0, seed: seed() });
        person([p[0] + out[0] * 1.2 + along[0] * 0.4, p[1] + out[1] * 1.2 + along[1] * 0.4], Y, faceTo([-out[0], -out[1]]), { dress: 'trousers', hat: pick(['straw', 'none']), cloth: pick(CLOTH), carry: 'none', pose: 'stand' });
      } else if (q < 0.52) {                     // a handcart of baskets or crates
        L.push({ t: 'handcart', at: p, y: Y, rot: rot0, load: pick(['baskets', 'crates', 'sacks']), seed: seed() });
      } else if (q < 0.7) {                      // a hitching post and a tethered beast, its fodder in a trough or heaped, its owner nearby
        const kind = pick(['donkey', 'donkey', 'horse', 'ox', 'camel']), post = [p[0] + out[0] * 0.5, p[1] + out[1] * 0.5], bp = [p[0] - along[0] * 0.2, p[1] - along[1] * 0.2];
        S.push({ t: 'block', rect: [post[0] - 0.09, post[1] - 0.09, post[0] + 0.09, post[1] + 0.09], y0: Y, y1: 1.35, mat: 'timber', collide: true });
        S.push({ t: 'tow_line', pts: [[post[0], 1.15, post[1]], [bp[0] + along[0] * 0.5, 1.0, bp[1] + along[1] * 0.5]], sag: 0.05, r: 0.012 });
        animal(kind, bp, faceTo(out) + (rand() - 0.5) * 0.6, { gear: kind !== 'ox' && rand() < 0.7, graze: rand() < 0.4 });
        L.push({ t: 'trough', at: [bp[0] + along[0] * 2.0, bp[1] + along[1] * 2.0], y: Y, rot: rot0 + Math.PI / 2, mat: 'timber' });
        if (rand() < 0.6) person([p[0] + along[0] * 2.6, p[1] + along[1] * 2.6], Y, faceTo(out), { dress: 'trousers', hat: 'brim', cloth: pick(CLOTH), pose: 'talk' });
      } else if (q < 0.86) {                     // a sedan chair set down, the bearers squatting by its poles, the passenger away
        S.push({ t: 'sedan', at: p, y: Y, rot: rot0 + Math.PI / 2 });
        for (const sgn of [-1, 1]) person([p[0] + along[0] * sgn * 1.85, p[1] + along[1] * sgn * 1.85], Y, faceTo([-along[0] * sgn, -along[1] * sgn]), { dress: 'trousers', cloth: pick(['cloth_indigo', 'cloth_grey', 'cloth_brown']), hat: pick(['cap', 'none']), pose: pick(['squat', 'stand', 'sit_low']) });
      } else {                                   // a public well: a windlass over a stone curb, a woman at the bucket, jars waiting
        L.push({ t: 'well', at: p, y: Y, kind: 'windlass', mat: 'granite_grey', seed: seed() });
        person([p[0] + out[0] * 1.2, p[1] + out[1] * 1.2], Y, faceTo([-out[0], -out[1]]), { dress: 'robe', hair: 'bun', hat: 'none', carry: 'pails', cloth: pick(CLOTH) });
        L.push({ t: 'pot', kind: 'water_pot', at: [p[0] + along[0] * 1.3 + out[0] * 0.5, p[1] + along[1] * 1.3 + out[1] * 0.5], y: Y, n: 2, seed: seed() });
      }
    }
  }

  // ---- the river's quays: along both banks the landing places of the grain, the stone and the timber ------
  const quay = (bank, x) => {
    const n = bank === 'n', z = n ? RIVER.z0 - 1.05 : RIVER.z1 + 1.05, d = n ? -1 : 1;
    if (Math.abs(x) > RADIUS - 70) return;
    const y = Math.abs(x) > STONE_BANK ? Y : Y, p = [x, z];
    if (!clear(x, z, 3) || nearPole(x, z, 2)) return;
    claim(x, z, 3);
    const k = rand();
    if (k < 0.34) {                                              // grain landed in sacks, a porter with a load, the clerk tallying
      S.push({ t: 'sack_pile', at: [x, z + d * 0.3], y, rot: 0, rows: pick([[4, 3, 2], [5, 4, 3, 2], [3, 2]]) });
      L.push({ t: 'sacks', at: [x + 2.4, z + d * 0.2], y, rot: 0.2, n: 5, seed: seed() });
      person([x - 2.2, z - d * 1.2], y, faceTo([1, d * 0.4]), { dress: 'trousers', cloth: pick(['cloth_white', 'cloth_grey', 'cloth_brown']), top: 'bare', hat: 'none', carry: 'sack', skin: 'skin_medium' });
      person([x + 1.2, z - d * 1.6], y, faceTo([0, d]), { dress: 'robe', hat: 'cap', cloth: 'cloth_indigo', pose: 'talk' });
    } else if (k < 0.58) {                                       // wine and oil in casks and jars, ropes coiled round a post
      L.push({ t: 'barrel', at: [x, z], y, rot: 0.1, n: 3, seed: seed() });
      L.push({ t: 'pot', kind: 'blue_jar', at: [x + 2.2, z], y, n: 3, seed: seed() });
      L.push({ t: 'crates', at: [x - 2.3, z + d * 0.2], y, rot: 0.2, n: 4, seed: seed() });
      person([x + 0.6, z - d * 1.5], y, faceTo([0, d]), { dress: 'trousers', cloth: pick(CLOTH), hat: 'straw', pose: 'squat' });
    } else if (k < 0.8) {                                        // fishermen: baskets of the catch, nets drying on poles, a boy squatting at the edge
      L.push({ t: 'basket', at: [x, z], y, n: 3, seed: seed(), goods: 'cloth_grey' });
      L.push({ t: 'wash_line', at: [x + 3.2, z + d * 0.3], y: y + 1.6, rot: Math.PI / 2, len: 5, pole: true, emb: [0.3, 0.3], seed: seed() });
      person([x - 1.5, z + d * 0.3], y, faceTo([0, d]), { dress: 'trousers', cloth: 'cloth_brown', hat: 'straw', pose: 'sit_low', skin: 'skin_medium' });
      person([x + 1.0, z - d * 1.4], y, faceTo([0, d]), { dress: 'trousers', cloth: 'cloth_indigo', hat: 'straw', carry: 'pole', skin: 'skin_medium' });
    } else {                                                     // timber and bamboo: poles stacked, men resting, a barrow
      L.push({ t: 'firewood', at: [x, z - d * 0.3], y, rot: 0, len: 2.5, seed: seed() });
      L.push({ t: 'barrow', at: [x + 3.2, z - d * 1.0], y, rot: Math.PI / 2 * pick([1, -1]), seed: seed() });
      person([x - 1.8, z - d * 1.2], y, faceTo([1, 0]), { dress: 'trousers', cloth: 'cloth_grey', hat: 'straw', pose: 'sit_low' });
    }
  };
  for (const bank of ['n', 's']) for (let x = -RADIUS + 75; x < RADIUS - 75; x += 6 + rand() * 8) {
    if (Math.abs(x) < 16) continue;                                // the bridge's abutments
    if (x < WALL_X + 12) continue;
    quay(bank, x + (rand() - 0.5) * 4);
  }
  // the promenade along the water: hawkers' stands under awnings and mats of wares between the quays and the shops, benches facing the river
  for (const bank of ['n', 's']) for (let x = -300; x < FIELDS_X - 30; x += (Math.abs(x) < 150 ? 4.5 : 9) + rand() * (Math.abs(x) < 150 ? 5 : 9)) {
    if (Math.abs(x) < 14) continue;
    const n = bank === 'n', d = n ? -1 : 1, z = n ? RIVER.z0 - 4.2 : RIVER.z1 + 4.2, p = [x, z];
    if (dBridge(x, z) > 150 && rand() < 0.5) continue;
    if (!spot(x, z, 1.7)) continue;
    claim(x, z, 2);
    const k = rand();
    if (k < 0.4) { L.push({ t: 'stall', at: p, y: Y, rot: n ? 0 : Math.PI, w: 2.4, d: 1.1, awning: pick(['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_red']), goods: pick([['heap', 'greens', 'melons'], ['bread', 'baskets'], ['bolts', 'pottery'], ['fish', 'greens']]), seed: seed() });
      person([x + 0.5, z - d * 1.4], Y, faceTo([0, d]), { pose: 'stand', carry: 'none' }); person([x - 0.6, z + d * 1.7], Y, faceTo([0, -d]), { pose: pick(['stand', 'talk']), carry: pick(['basket', 'none']) }); }
    else if (k < 0.7) { L.push({ t: 'goods_mat', at: p, y: Y, rot: 0, goods: pick([['heap', 'baskets'], ['greens', 'basket'], ['pottery', 'bolts']]), seed: seed() }); person([x, z - d * 1.0], Y, faceTo([0, d]), { pose: 'squat', hat: 'straw' }); }
    else { L.push({ t: 'bench', at: [x, z + d * 1.6], y: Y, rot: 0, len: 1.8, mat: 'timber' }); for (const dx of rand() < 0.5 ? [-0.5, 0.5] : [0]) person([x + dx, z + d * 1.62], Y, faceTo([0, d]), { pose: 'sit', dress: 'robe', hat: pick(['cap', 'none']) }); }
  }
  // the wharves and steps: stacks of goods at their heads, a post for the lines, people waiting for the ferry
  for (const w of [...WHARVES, ...STEPS]) {
    const n = w.bank === 'n', z = n ? RIVER.z0 - 1.3 : RIVER.z1 + 1.3, d = n ? -1 : 1;
    for (const dx of [-3.2, 3.4]) if (clear(w.x + dx, z, 1.2) && Math.abs(w.x + dx) > 12 && w.x + dx > WALL_X + 12) {
      claim(w.x + dx, z, 1.4);
      if (rand() < 0.5) L.push({ t: 'basket', at: [w.x + dx, z], y: Y, n: 2, seed: seed() }); else L.push({ t: 'barrel', at: [w.x + dx, z], y: Y, rot: 0, n: 2, seed: seed() });
    }
    if (rand() < 0.55 && clear(w.x + 1.4, z - d * 1.6, 1)) person([w.x + 1.4, z - d * 1.6], Y, faceTo([0, d]), { dress: 'robe', carry: rand() < 0.5 ? 'basket' : 'none', pose: 'stand' });
  }
  // the walker's route along the main street's axis (x = 0) and over the bridge stays free of standing people
  for (let i = L.length - 1; i >= 0; i--) if (L[i].t === 'figure' && Math.abs(L[i].at[0]) < 0.9 && L[i].at[1] > -84 && L[i].at[1] < 204) L.splice(i, 1);
  return [base('song-kaifeng-street-life', L, 'life'), base('song-kaifeng-street-things', S)];
}

// ── what each trade leaves in the street ─────────────────────────────────────────────────────────────────
// A thing is (front, {t, off, rot, seed, r}) → [{ el, r (the radius it needs) }]; the element's own `at` is set by the caller.
const E = (el, r, t, off) => ({ el: { y: Y, ...el }, r, t, off });
const TH = {
  baskets: (F, c) => [E({ t: 'basket', rot: c.r() * 6.28, n: 2 + Math.floor(c.r() * 2), seed: c.seed }, 0.7, c.t, c.off)],
  pots: (F, c) => [E({ t: 'pot', kind: ['water_pot', 'dark_pot', 'glazed_jar', 'blue_jar'][Math.floor(c.r() * 4)], n: 3, seed: c.seed }, 0.8, c.t, c.off)],
  jars: (F, c) => [E({ t: 'pot', kind: 'dark_pot', n: 4, seed: c.seed }, 0.9, c.t, c.off), E({ t: 'pot', kind: 'blue_jar', n: 2, seed: c.seed + 1 }, 0.7, c.t + 0.18, c.off)],
  barrels: (F, c) => [E({ t: 'barrel', rot: c.r() * 3, n: 2, seed: c.seed }, 0.8, c.t, c.off)],
  sacks: (F, c) => [E({ t: 'sacks', rot: F.rot, n: 3 + Math.floor(c.r() * 3), seed: c.seed }, 0.9, c.t, c.off)],
  crates: (F, c) => [E({ t: 'crates', rot: F.rot + (c.r() - 0.5) * 0.4, n: 2 + Math.floor(c.r() * 3), seed: c.seed }, 0.8, c.t, c.off)],
  mat: (F, c) => [E({ t: 'goods_mat', rot: F.rot, goods: [['heap', 'baskets'], ['bolts', 'basket'], ['pottery', 'basket']][Math.floor(c.r() * 3)], seed: c.seed }, 0.95, c.t, c.off + 0.2)],
  tray: (F, c) => [E({ t: 'drying_tray', rot: c.r() * 6.28, seed: c.seed }, 0.7, c.t, c.off)],
  wood: (F, c) => [E({ t: 'firewood', rot: F.rot, len: 1.6, seed: c.seed }, 0.9, c.t, c.off - 0.35)],
  barrow: (F, c) => [E({ t: 'barrow', rot: F.rot + Math.PI / 2, seed: c.seed }, 1.0, c.t, c.off + 0.3)],
  ladder: (F, c) => [E({ t: 'ladder', rot: F.rot, seed: c.seed }, 0.5, c.t, c.off - 0.55)],
  stoolset: (F, c) => [E({ t: 'stool', rot: F.rot + Math.PI, seed: c.seed }, 0.3, c.t, c.off), E({ t: 'stool', rot: F.rot + Math.PI, seed: c.seed }, 0.3, c.t + 0.1, c.off + 0.2)],
};
const THINGS = {
  generic: [TH.baskets, TH.pots, TH.crates, TH.tray, TH.wood],
  cloth: [TH.mat, TH.baskets, TH.crates],
  tea: [TH.pots, TH.baskets, TH.stoolset],
  medicine: [TH.tray, TH.baskets, TH.pots, TH.mat],
  books: [TH.crates, TH.mat],
  incense: [TH.baskets, TH.tray, TH.pots],
  food: [TH.tray, TH.baskets, TH.stoolset, TH.pots, TH.wood],
  lacquer: [TH.crates, TH.mat],
  pottery: [TH.pots, TH.jars, TH.pots, TH.mat],
  rice: [TH.sacks, TH.sacks, TH.barrow, TH.baskets],
  iron: [TH.barrels, TH.crates, TH.wood],
  saddlery: [TH.crates, TH.barrels, TH.barrow],
  butcher: [TH.barrels, TH.baskets, TH.wood],
  inn: [TH.barrels, TH.pots, TH.stoolset, TH.baskets],
  wine: [TH.jars, TH.barrels],
};
/** A bench along the front with one or two people sitting on it (customers, an old man, a woman with her sewing), a tea table out in the street for the food shops. */
function benchWith(F, l, r, lim, tryAdd, person) {
  const t = 0.15 + r() * 0.7, off = 0.7;
  const el = { t: 'bench', y: Y, rot: F.rot, len: 1.7, mat: 'timber' };
  if (!tryAdd(el, 0.9, t, off)) return;
  const [x0, z0] = F.P(t, off + 0.02);
  const n = r() < 0.45 ? 0 : r() < 0.6 ? 1 : 2;
  for (let k = 0; k < n; k++) person([x0 + (F.n[1] ? (k ? 0.45 : -0.45) : 0), z0 + (F.n[0] ? (k ? 0.45 : -0.45) : 0)], Y + 0.0, faceTo(F.n), { pose: 'sit', dress: 'robe', hat: r() < 0.5 ? 'cap' : 'none', cloth: CLOTH[Math.floor(r() * CLOTH.length)] });
}
void bridgeDeck;
