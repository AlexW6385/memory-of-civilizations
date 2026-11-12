// Southern Song Lin'an — life at the water and at the posts of the city (docs/settlements/song-hangzhou.md §25):
// washing and fishing at the canal's landings, the bridgeheads' markets, the river's stairs and anglers on
// the flood wall, the fire-watch towers manned with their water jars, the storehouses' porters and clerks.
// Everything is placed from layout.js (canalLandings, CANAL_BRIDGES, WATCH_TOWERS, TAFANG, the walls).
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { placer } from '../../objects/kit.js';
import { CANAL, CANAL_BRIDGES, CANAL_STREETS, CITY, WALL, ROAD, TAFANG, TAFANG_FRONT, WATCH_TOWERS, RADIUS, LEVEL, IMPERIAL, canalLandings } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const CLOTH = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_black', 'cloth_green'];
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);

/**
 * hz_fishing { at, y, rot (toward the water), seed }: an angler's gear on the bank: a bamboo rod (3.4 m, bending out over the water), its line and float,
 * a bamboo creel, a wooden bucket and a stool [inferred: line fishing from the banks of Lin'an's canals and the lake — the fishermen and the fish-sellers of
 * Mengliang lu ch. 16 and the fish ponds of Lin'an; the rod and creel are the common Chinese forms].
 */
function fishing(el, { bag, col }) {
  const put = placer(el, bag), y0 = el.y ?? 0, rot = el.rot ?? 0;
  void put;
  const c = Math.cos(rot), s = Math.sin(rot), [x, z] = el.at;
  const P = (a, h, b) => [x + a * c + b * s, y0 + h, z - a * s + b * c];
  // the stool
  bag.add('timber', rod(P(0, 0.3, 0), P(0, 0.31, 0), 0.2, 8));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('wood_dark', rod(P(sx * 0.13, 0, sz * 0.13), P(sx * 0.13, 0.29, sz * 0.13), 0.02, 4));
  // the rod: from the angler's hand (a little forward of the stool, 0.9 m up) out and up over the water; the line falls to a float
  const hand = P(0.35, 0.9, 0.35), tip = P(0.55, 2.2, 3.4);
  bag.add('bamboo_culm', rod(hand, tip, 0.014, 4));
  bag.add('bamboo_culm', rod(P(0.35, 0.5, 0.12), P(0.35, 0.9, 0.35), 0.012, 4));     // the butt rested on the knee-high forked stick
  bag.add('wood_dark', rod(P(0.35, 0, 0.12), P(0.35, 0.62, 0.12), 0.015, 4));
  const fl = [tip[0] + (-c * 0.0) + s * 0.4, y0 + (el.water ?? LEVEL.canal) - y0 + 0.05, tip[2] + c * 0.4];
  bag.add('rope_fibre', rod(tip, fl, 0.003, 3));
  bag.add('cloth_red', lathe([[0.001, 0], [0.012, 0.01], [0.012, 0.05], [0.001, 0.07]], 5, null, fl[0], fl[1], fl[2]));
  // the creel and the bucket
  bag.add('wicker', lathe([[0.001, 0], [0.13, 0], [0.16, 0.14], [0.11, 0.3], [0.001, 0.3]], 8, null, ...P(-0.5, 0, 0.1)));
  bag.add('timber', lathe([[0.15, 0], [0.19, 0.0], [0.2, 0.26], [0.15, 0.26]], 8, null, ...P(-0.45, 0, -0.35)));
  col.circle(x, z, 0.25, y0, y0 + 0.4);
}
STYLES.life.elements.hz_fishing = fishing;

/** The life at the water and at the posts: a list of life elements (figures, stalls, goods, anglers) for one plan in the 'life' style, and the stairs on the river (static, style 'song'). */
export function watersideLife(y0 = LEVEL.street) {
  const L = [], rand = rng(2024), pick = (a) => a[Math.floor(rand() * a.length)], seed = () => Math.floor(rand() * 1e9);
  const person = (at, y, rot, extra = {}) => L.push({ t: 'figure', at, y, rot, seed: seed(), dress: rand() < 0.5 ? 'robe' : 'trousers', cloth: pick(CLOTH), cloth2: pick(CLOTH), skin: rand() < 0.7 ? 'skin_light' : 'skin_medium', hat: pick(['none', 'cap', 'straw']), carry: 'none', ...extra });
  // ---- the canal's landings: women at the wash (squatting at the top step with a basket of cloth and a bat), men fishing, a boy fishing with a net on a pole, a pair of porters
  for (const [i, { z, west, hl }] of canalLandings().entries()) {
    const fx = west ? CANAL.x0 : CANAL.x1, dir = west ? 1 : -1, out = [dir, 0], k = rand();
    if (Math.hypot(fx, z) > RADIUS - 30) continue;
    if (k < 0.42) {
      // washing: one, two or three at the head of the steps, a basket and a tub
      const n = 1 + (hl > 2 ? 1 : 0) + (rand() < 0.4 ? 1 : 0);
      for (let q = 0; q < n; q++) {
        const zz = z - (n - 1) * 0.5 + q * 1.0 + (rand() - 0.5) * 0.2, p = [fx - dir * 0.55, zz];
        person(p, y0, faceTo(out), { pose: 'squat', dress: 'trousers', woman: true, hat: 'none', cloth: pick(['cloth_indigo', 'cloth_brown', 'cloth_grey']), hair: 'bun' });
        L.push({ t: 'basket', at: [p[0] - dir * 0.7, p[1] + 0.2], y: y0, rot: rand() * 6, n: 1, goods: 'cloth_white', seed: seed() });
      }
      if (rand() < 0.5) L.push({ t: 'rain_tub', at: [fx - dir * 1.7, z + hl * 0.8], y: y0, rot: 0, seed: seed() });
    } else if (k < 0.72) {
      const zz = z + (rand() - 0.5) * hl, rot = faceTo(out);
      L.push({ t: 'hz_fishing', at: [fx - dir * 0.7, zz], y: y0, rot: Math.atan2(out[0], out[1]), water: LEVEL.canal, seed: seed() });
      person([fx - dir * 0.85, zz - 0.35], y0, rot, { pose: 'sit', dress: 'trousers', hat: 'straw', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo']) });
    } else if (k < 0.86 && hl > 2) {
      person([fx - dir * 1.2, z - 0.8], y0, faceTo(out), { pose: 'stand', dress: 'trousers', carry: 'pole', hat: 'straw' });
      person([fx - dir * 1.2, z + 0.8], y0, faceTo(out), { pose: 'stand', dress: 'trousers', carry: 'sack', hat: 'none' });
    } else {
      L.push({ t: 'sacks', at: [fx - dir * 1.0, z], y: y0, rot: rand() * 3, n: 3, seed: seed() });
      person([fx - dir * 1.9, z + 0.4], y0, faceTo([0, 1]), { pose: 'sit_low', dress: 'trousers', hat: 'cap', skin: 'skin_medium' });
    }
    void i;
  }
  // ---- the bridgeheads: the busiest spots of any town (Zhong'an Bridge, Mengliang lu): stalls either side of the approach, goods laid out, hawkers, a crowd
  const xs = [(CANAL_STREETS[0][0] + CANAL_STREETS[0][2]) / 2, (CANAL_STREETS[1][0] + CANAL_STREETS[1][2]) / 2];
  for (const bz of CANAL_BRIDGES) for (const [side, sx] of xs.entries()) {
    if (bz > ROAD.z0 - 8 || Math.abs(bz - CITY.zs) < 14 || Math.abs(bz - CITY.zn) < 14) continue;
    const dir = side ? -1 : 1;   // away from the canal: on the west bank's street +1 (the canal lies east), on the east bank's −1
    for (const sz of [-1, 1]) {
      const zz = bz + sz * (4.6 + rand() * 0.6), xx = sx - dir * (1.0 + rand() * 1.4);
      L.push({ t: 'stall', at: [xx, zz], y: y0, rot: sz > 0 ? Math.PI : 0, w: 2.4 + rand() * 0.6, d: 1.3, awning: pick(['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red']), stripe: rand() < 0.4 ? pick(['cloth_red', 'cloth_indigo']) : undefined, goods: pick([['produce', 'basket'], ['dark_pot', 'water_pot', 'basket'], ['cloth', 'basket'], ['produce', 'produce', 'basket']]), seed: seed() });
      person([xx + (rand() - 0.5) * 0.8, zz + sz * 0.95], y0, faceTo([0, -sz]), { pose: 'stand', dress: pick(['robe', 'trousers']), hat: 'cap' });
      if (rand() < 0.85) person([xx + (rand() - 0.5) * 1.2, zz - sz * 1.7], y0, faceTo([0, sz]) + (rand() - 0.5) * 0.4, { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
    }
    // goods laid out on mats at the foot of the bridge, a hawker squatting by his pole and baskets, a handcart with a porter
    L.push({ t: 'goods_mat', at: [sx - dir * 0.2, bz + 3.4], y: y0, rot: 0, goods: pick([['heap', 'baskets'], ['pottery', 'baskets'], ['bolts', 'heap']]), seed: seed() });
    L.push({ t: 'handcart', at: [sx - dir * 2.4, bz - 3.3], y: y0, rot: Math.PI / 2, seed: seed() });
    person([sx - dir * 2.4, bz - 2.1], y0, faceTo([0, 1]), { pose: 'stand', dress: 'trousers', hat: 'straw', carry: 'pole' });
    person([sx - dir * 0.6, bz + 2.4], y0, faceTo([0, -1]), { pose: 'squat', dress: 'trousers', hat: 'straw', cloth: pick(['cloth_brown', 'cloth_grey']) });
    for (let q = 0; q < 3; q++) person([sx - dir * (0.5 + q * 0.6), bz + (rand() - 0.5) * 3], y0, faceTo([dir, 0]) + (rand() - 0.5) * 1.2, { pose: rand() < 0.4 ? 'talk' : 'stand', carry: rand() < 0.2 ? 'basket' : 'none' });
  }
  // ---- the fire-watch towers (望火楼): two soldiers in the tower's room, the water jars and tubs at its foot, a duty soldier at the door [inferred from Mengliang lu's fire towers and its soldiers on watch]
  for (const r of WATCH_TOWERS) {
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, dir = cx < (IMPERIAL[0] + IMPERIAL[2]) / 2 ? 1 : -1, edge = dir > 0 ? r[2] : r[0], top = 5.8 + 0.3;
    person([cx - 1.0, cz + 1.2], top, faceTo([0, 1]), { pose: 'staff', dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_black', hat: 'cap', carry: 'staff' });
    person([cx + 1.0, cz - 1.2], top, faceTo([1, -0.3]), { pose: 'stand', dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_black', hat: 'cap' });
    person([edge + dir * 1.0, cz + 1.4], y0, faceTo([dir, 0.4]), { pose: 'staff', dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_black', hat: 'cap', carry: 'staff' });
    for (const dz of [-2.0, 0.2, 2.2]) L.push({ t: 'pot', kind: 'water_pot', at: [edge + dir * 0.7, cz + dz], y: y0, rot: rand() * 6, n: 2, seed: seed() });
    L.push({ t: 'rain_tub', at: [edge + dir * 0.9, cz - 3.0], y: y0, rot: 0, seed: seed() });
    L.push({ t: 'ladder', at: [edge + dir * 0.3, cz + 3.4], y: y0, rot: dir > 0 ? Math.PI / 2 : -Math.PI / 2, seed: seed() });
  }
  // ---- the storehouses' platforms: porters with sacks and poles, a clerk squatting with his tally, a watchman
  TAFANG.forEach((r, i) => {
    const f = TAFANG_FRONT[i], px = f === 'w' ? r[0] - 1.1 : r[2] + 1.1, dir = f === 'w' ? -1 : 1, yp = y0 + 0.38;
    for (let z = r[1] + 4; z < r[3] - 4; z += 7 + rand() * 5) {
      const k = rand();
      if (k < 0.45) person([px + dir * (rand() * 0.5 - 0.3), z], yp, faceTo([-dir, 0]), { pose: 'stand', dress: 'trousers', carry: pick(['sack', 'pole', 'sack']), hat: pick(['none', 'straw']), skin: 'skin_medium' });
      else if (k < 0.7) person([px, z], yp, faceTo([dir, 0.5]), { pose: 'squat', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'cap' });
      else person([px, z], yp, faceTo([dir, 0]), { pose: rand() < 0.5 ? 'talk' : 'stand', dress: 'trousers' });
    }
  });
  // ---- the flood wall east of the canal and beyond the tide-day crowd's stretch: anglers along its edge, a watchman
  const zw = WALL.z1 - 0.75, yW = 1.0;
  for (let x = 170; x < RADIUS - 45; x += 11 + rand() * 12) {
    if (Math.hypot(x, zw) > RADIUS - 40) break;
    L.push({ t: 'hz_fishing', at: [x, zw], y: yW, rot: 0, water: LEVEL.river, seed: seed() });
    person([x - 0.3, zw - 0.2], yW, faceTo([0, 1]), { pose: 'sit', dress: 'trousers', hat: 'straw', cloth: pick(['cloth_brown', 'cloth_grey', 'cloth_indigo']), skin: 'skin_medium' });
    if (rand() < 0.4) person([x + 1.6, zw - 0.3], yW, faceTo([0.3, 1]), { pose: 'stand', carry: pick(['none', 'basket']) });
  }
  return L;
}

/** The river's stairs: granite flights down the flood wall's river face to the water, with a mooring ring (static, 'song' style); where the boats' crews and the washers go. */
export function riverStairs() {
  const E = [], r = rng(77), xs = [];
  for (let x = 176; x < RADIUS - 70; x += 38 + r() * 14) xs.push(x);
  for (let x = -270; x < -215; x += 40 + r() * 10) xs.push(x);
  for (const x of xs) {
    if (Math.hypot(x, WALL.z1) > RADIUS - 44) continue;
    const hl = 3.4;
    E.push({ t: 'water_steps', a: [x - hl, WALL.z1], b: [x + hl, WALL.z1], dir: [0, 1], y: 1.0, water: LEVEL.river, moor: true });
  }
  return E;
}
void CITY;
