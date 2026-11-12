// Tang Chang'an — the dressing of the streets and fronts (docs/settlements/tang-changan.md §15), as elements of the shared `life` style: before
// the gates of the courtyard houses (firewood, vats, a bench with an old man on it, hens, sacks, a hand cart, a dog), along the avenue's
// roadside (ox carts, tea tables, benches under the locusts, pedlars' mats, porters resting), on the cross streets, at the crossings of the
// market's lanes (wells, notice boards, barrows, carts), at the avenue's ditches (washers, ducks), in the temple courts (pilgrims kneeling,
// monks sweeping, lamps) and the Daoist court. Every position is derived from layout.js.
import { YAW, rng } from '../../styles/tang/kit.js';
import { lots, STREETS, AVE, DITCH, MARKET_LANES, MARKET_INNER, DACI, DACI_AX, DACI_MAIN, DAO_AX, PAGODA, RADIUS, WARDS } from './layout.js';

const ext = (rect, f) => { const w = rect[2] - rect[0], d = rect[3] - rect[1]; return f === 'n' || f === 's' ? [w, d] : [d, w]; };
const frameOf = (c, front) => { const yaw = YAW[front], cs = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw)); return { P: ([x, z]) => [c[0] + x * cs + z * sn, c[1] - x * sn + z * cs], D: ([x, z]) => [x * cs + z * sn, -x * sn + z * cs] }; };
const faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
const CLOTH = ['cloth_brown', 'cloth_grey', 'cloth_white', 'cloth_indigo', 'cloth_ochre'];

export function dressLife() {
  const L = [], rand = rng(770), pick = (a) => a[Math.floor(rand() * a.length)], sd = () => Math.floor(rand() * 1e9);
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: 0, rot, seed: sd(), dress: 'trousers', skin: 'skin_light', hat: 'cap', hatMat: 'cloth_black', hair: 'topknot', carry: 'none', cloth: pick(CLOTH), cloth2: pick(CLOTH), ...o });
  const woman = (at, rot, o = {}) => fig(at, rot, { dress: 'robe', cloth: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_blue', 'cloth_white']), cloth2: pick(['cloth_white', 'cloth_ochre', 'cloth_red']), over: 'shawl', hair: 'bun', hat: 'none', ...o });
  const monk = (at, rot, o = {}) => fig(at, rot, { dress: 'robe', cloth: pick(['cloth_grey', 'cloth_brown', 'cloth_ochre']), cloth2: pick(['cloth_ochre', 'cloth_maroon']), over: 'shawl', hair: 'shaven', hat: 'none', ...o });
  const hu = (at, rot, o = {}) => fig(at, rot, { dress: 'robe', cloth: pick(['cloth_indigo', 'cloth_green', 'cloth_maroon', 'cloth_ochre']), cloth2: 'cloth_white', over: 'belt', hat: pick(['brim', 'turban']), skin: pick(['skin_medium', 'skin_dark']), beard: true, hair: 'short', ...o });

  // ── before the gates of the houses ──
  for (const l of lots()) {
    if (l.det < 1 && rand() < 0.45) continue;
    const [W, D] = ext(l.rect, l.front), c = [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2], F = frameOf(c, l.front), yaw = YAW[l.front];
    const gx = (rng(l.seed)() < 0.5 ? -1 : 1) * W * 0.2, zo = D / 2 + 0.275, out = F.D([0, 1]), toward = faceTo(out);
    const n = l.det >= 1 ? 3 + Math.floor(rand() * 2) : 1 + Math.floor(rand() * 2);
    const slots = [];
    for (let k = 0; k < n; k++) {
      let x = gx + (rand() < 0.5 ? -1 : 1) * (2.4 + rand() * 4.5); if (Math.abs(x) > W / 2 - 1.5) x = gx - Math.sign(x - gx) * (2.4 + rand() * 3);
      if (Math.abs(x) > W / 2 - 1.5 || slots.some((q) => Math.abs(q - x) < 2.2)) continue;
      slots.push(x);
      const at = F.P([x, zo + 0.55 + rand() * 0.5]), r = rand(), s = sd();
      if (r < 0.22) L.push({ t: 'firewood', at, y: 0, rot: yaw, seed: s, len: 1.0 + rand() * 0.6 });
      else if (r < 0.40) L.push({ t: 'pot', kind: pick(['vat', 'dark_pot', 'water_pot']), n: 1 + Math.floor(rand() * 3), at, y: 0, rot: rand() * 6.28, seed: s });
      else if (r < 0.56) { L.push({ t: 'bench', at, y: 0, rot: yaw, len: 1.7 }); if (rand() < 0.6) { const p = F.P([x + (rand() - 0.5) * 0.6, zo + 0.55]); fig(p, toward, { pose: 'sit', cloth: pick(CLOTH), beard: rand() < 0.5, hat: pick(['cap', 'none', 'straw']) }); } }
      else if (r < 0.68) L.push({ t: 'chickens', at, y: 0, rot: rand() * 6.28, n: 3 + Math.floor(rand() * 3), kind: 'hen', seed: s });
      else if (r < 0.78) L.push({ t: 'sacks', at, y: 0, rot: yaw, n: 2 + Math.floor(rand() * 3), seed: s });
      else if (r < 0.86) L.push({ t: 'basket', at, y: 0, rot: rand() * 6.28, n: 2, seed: s });
      else if (r < 0.92) L.push({ t: 'handcart', at, y: 0, rot: yaw + (rand() < 0.5 ? 0 : Math.PI), seed: s });
      else if (r < 0.96) L.push({ t: 'drying_tray', at, y: 0, rot: yaw, seed: s });
      else L.push({ t: 'animal', kind: 'dog', at, y: 0, rot: rand() * 6.28, seed: s });
    }
    if (l.det >= 1 && rand() < 0.35) { const p = F.P([gx + (rand() < 0.5 ? -2 : 2), zo + 1.6]); (rand() < 0.5 ? woman : fig)(p, rand() * 6.28, { pose: rand() < 0.5 ? 'talk' : 'stand' }); }
  }

  // ── the avenue's roadside and the cross streets ──
  const roadItem = (x, z, along, side) => {
    const r = rand(), s = sd(), rot = along ? 0 : Math.PI / 2;
    if (r < 0.2) { const cr = rot + (rand() < 0.5 ? 0 : Math.PI); L.push({ t: 'cart', kind: 'two', beast: 'ox', load: pick(['sacks', 'barrels', 'hay']), at: [x, z], y: 0, rot: cr, seed: s }); const q = [x + (along ? 2.4 : 0), z + (along ? 0 : 2.4)]; fig(q, rand() * 6.28, { pose: 'stand', carry: 'staff', hat: 'straw' }); }
    else if (r < 0.36) { L.push({ t: 'tea_table', at: [x, z], c: [x, z], r: 1.1, y: 0, rot: rot, seed: s }); for (const [dx, dz] of [[0.85, 0], [-0.85, 0], [0, 0.85]]) if (rand() < 0.75) fig([x + dx, z + dz], faceTo([-dx, -dz]), { pose: 'sit', hat: pick(['cap', 'brim', 'none']), dress: pick(['trousers', 'robe']), beard: rand() < 0.4 }); }
    else if (r < 0.5) { L.push({ t: 'bench', at: [x, z], y: 0, rot: rot, len: 2.2 }); fig([x, z + (along ? 0 : 0.1)], rot + (side > 0 ? Math.PI / 2 : -Math.PI / 2) * (along ? 1 : 0), { pose: 'sit', hat: pick(['cap', 'none']) }); }
    else if (r < 0.64) { L.push({ t: 'goods_mat', at: [x, z], y: 0.01, rot: rand() * 6.28, goods: pick([['heap', 'baskets'], ['pottery'], ['bolts']]), seed: s, mat: 'reed_mat' }); fig([x + 1.2, z], faceTo([-1, 0]), { pose: 'sit_ground', carry: 'none', hat: 'straw' }); }
    else if (r < 0.78) { L.push({ t: 'sacks', at: [x, z], y: 0, rot: rot, n: 5, seed: s }); for (let k = 0; k < 2; k++) fig([x + 1.5 + k * 0.9, z + 0.6], rand() * 6.28, { pose: 'squat', hat: 'straw', carry: 'none' }); }
    else if (r < 0.9) { L.push({ t: 'animal', kind: pick(['donkey', 'horse']), at: [x, z], y: 0, rot: rot + 1.4, seed: s, gear: true }); fig([x - 1.6, z + 0.3], rot + 1.4, { pose: 'stand', hat: 'brim', skin: 'skin_medium', beard: true }); }
    else { L.push({ t: 'barrow', at: [x, z], y: 0, rot: rot, seed: s }); fig([x + (along ? 0 : 1.6), z + (along ? 1.6 : 0)], rand() * 6.28, { pose: 'stand', hat: 'straw' }); }
  };
  for (const side of [-1, 1]) for (let z = -RADIUS + 60; z < RADIUS - 60; z += 22 + rand() * 20) {
    if (STREETS.slice(1).some((s2) => s2[2] - s2[0] > s2[3] - s2[1] && Math.abs(z - (s2[1] + s2[3]) / 2) < (s2[3] - s2[1]) / 2 + 4)) continue;   // the cross streets are dressed below
    roadItem(side * (33 + rand() * 6), z, true, side);
  }
  // before the visitor at the arrival: the crossing of the avenue and street A, a tea stall, a cart, pedlars, a group waiting
  const A = [28, 20];
  L.push({ t: 'tea_table', at: [A[0] + 7, A[1] - 9], c: [A[0] + 7, A[1] - 9], r: 1.1, y: 0, rot: 0.3, seed: 77 }); fig([A[0] + 7.9, A[1] - 9], faceTo([-1, 0]), { pose: 'sit', beard: true }); fig([A[0] + 6.1, A[1] - 9], faceTo([1, 0]), { pose: 'sit', hat: 'none', hair: 'topknot' }); hu([A[0] + 7, A[1] - 7.4], faceTo([0, 1]), { pose: 'sit' });
  L.push({ t: 'cart', kind: 'two', beast: 'ox', load: 'sacks', at: [A[0] - 9, A[1] + 12], y: 0, rot: 0.2, seed: 91 }); fig([A[0] - 6.4, A[1] + 12.4], 1.3, { pose: 'stand', carry: 'staff', hat: 'straw' });
  L.push({ t: 'goods_mat', at: [A[0] + 4, A[1] + 7], y: 0.01, rot: 0.4, goods: ['pottery'], seed: 12, mat: 'reed_mat' }); fig([A[0] + 5.4, A[1] + 7.2], faceTo([-1, 0]), { pose: 'sit_ground', hat: 'straw' });
  L.push({ t: 'goods_mat', at: [A[0] - 3, A[1] - 7], y: 0.01, rot: 2.1, goods: ['bolts'], seed: 13, mat: 'reed_mat' }); hu([A[0] - 3, A[1] - 8.4], 0, { pose: 'sit_ground' });
  for (let k = 0; k < 4; k++) fig([A[0] - 14 + k * 1.1, A[1] - 3 + (k % 2) * 0.7], 2.6, { pose: k % 2 ? 'squat' : 'stand', carry: k === 0 ? 'pole' : 'none', hat: 'straw' });
  L.push({ t: 'animal', kind: 'horse', at: [A[0] + 13, A[1] + 3], y: 0, rot: 4.4, seed: 5, gear: true }); hu([A[0] + 11.2, A[1] + 3.6], 4.4, { pose: 'stand', carry: 'staff' });
  // the cross streets: roadside by the ward walls
  for (const st of STREETS.slice(1)) {
    const horiz = st[2] - st[0] > st[3] - st[1];
    if (!horiz) continue;
    const zc = (st[1] + st[3]) / 2, hw = (st[3] - st[1]) / 2;
    for (const sx of [-1, 1]) for (let x = AVE + 24; x < RADIUS - 70; x += 24 + rand() * 20) for (const sz of [-1, 1]) { if (rand() < 0.45) continue; roadItem(sx * x, zc + sz * (hw - 3.4 - rand() * 2), false, sz); }
  }

  // ── the market's crossings ──
  for (const lx of MARKET_LANES.x) for (const lz of MARKET_LANES.z) {
    L.push({ t: 'well', kind: 'windlass', at: [lx + 2.6, lz + 2.6], y: 0, roof: true, seed: 3 });
    L.push({ t: 'barrow', at: [lx - 2.8, lz + 2.2], y: 0, rot: 0.5, seed: Math.round(lx) });
    L.push({ t: 'barrel', at: [lx - 2.6, lz - 2.8], y: 0, rot: 0, n: 2, seed: Math.round(lz) });
    L.push({ t: 'cart', kind: 'two', beast: 'ox', load: 'barrels', at: [lx + 1.6, lz - 12], y: 0, rot: Math.PI / 2 + 0.1, seed: Math.round(lx + lz) });
  }
  const [m0, mz0, m1, mz1] = MARKET_INNER;
  for (let k = 0; k < 26; k++) {   // tea tables and mats of the market's lanes, with their sitters
    const vert = rand() < 0.5, x = vert ? pick(MARKET_LANES.x) + (rand() < 0.5 ? -2.7 : 2.7) : m0 + 10 + rand() * (m1 - m0 - 20), z = vert ? mz0 + 10 + rand() * (mz1 - mz0 - 20) : pick(MARKET_LANES.z) + (rand() < 0.5 ? -2.7 : 2.7);
    if (rand() < 0.5) { L.push({ t: 'goods_mat', at: [x, z], y: 0.01, rot: rand() * 6.28, goods: pick([['pottery'], ['bolts'], ['heap', 'baskets']]), seed: sd(), mat: 'reed_mat' }); hu([x + 1.3, z], faceTo([-1, 0]), { pose: 'sit_ground' }); }
    else { L.push({ t: 'tea_table', at: [x, z], c: [x, z], r: 1.0, y: 0, rot: rand() * 3, seed: sd() }); for (const [dx, dz] of [[0.85, 0], [-0.85, 0]]) fig([x + dx, z + dz], faceTo([-dx, -dz]), { pose: 'sit', hat: pick(['brim', 'cap', 'turban']), dress: 'robe', beard: true, skin: pick(['skin_light', 'skin_medium']) }); }
  }

  // ── the avenue's ditches: washers on the bank, ducks ──
  for (const side of [-1, 1]) for (let z = -RADIUS + 90; z < RADIUS - 90; z += 55 + rand() * 40) {
    if (STREETS.slice(1).some((s2) => s2[2] - s2[0] > s2[3] - s2[1] && Math.abs(z - (s2[1] + s2[3]) / 2) < (s2[3] - s2[1]) / 2 + 8)) continue;
    const bx = side * 42.8;
    woman([bx, z], faceTo([side, 0]), { pose: 'kneel', carry: 'none' }); L.push({ t: 'basket', at: [bx - side * 0.8, z + 0.5], y: 0, rot: rand() * 6, n: 2, seed: sd(), goods: 'cloth_white' });
    L.push({ t: 'chickens', at: [side * 43.4, z + 3 + rand() * 2], y: 0, rot: rand() * 6, n: 3 + Math.floor(rand() * 3), kind: 'duck', seed: sd() });
    if (rand() < 0.4) { fig([bx - side * 0.2, z + 12], faceTo([side, 0]), { pose: 'squat', hat: 'straw', carry: 'none' }); }
  }

  // ── Daci'en: pilgrims kneeling before the main hall, monks sweeping and passing, lamps and benches along the court ──
  const ax = DACI_AX, mh = DACI_MAIN[1];
  for (let k = 0; k < 9; k++) { const x = ax + 3.5 + (k % 5) * 2.3, z = mh + 13 + Math.floor(k / 5) * 2.6; (k % 3 === 0 ? woman : k % 3 === 1 ? fig : hu)([x, z], faceTo([0, -1]), { pose: 'kneel', arms: 'pray', carry: 'none' }); }
  for (let k = 0; k < 7; k++) { const x = ax + (rand() - 0.5) * 44, z = mh + 20 + rand() * 18; if (Math.abs(x - ax) < 3.5 || Math.abs(x - (ax - 15)) < 3.5) continue; monk([x, z], rand() * 6.28, { carry: 'staff', pose: 'stand' }); }
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { L.push({ t: 'bench', at: [ax + s * 30, 160 + k * 7], y: 0, rot: Math.PI / 2, len: 2.0 }); if (k % 2 === 0) (k < 2 ? monk : fig)([ax + s * 30, 160 + k * 7], faceTo([-s, 0]), { pose: 'sit' }); }
  for (const s of [-1, 1]) for (const z of [100, 112, 124]) L.push({ t: 'lantern', kind: 'iron', at: [ax + s * 20, z], y: 0, h: 2.0 });
  for (let k = 0; k < 6; k++) { const a = rand() * 6.28; monk([PAGODA[0] + Math.cos(a) * 30, PAGODA[1] + 25 + Math.abs(Math.sin(a)) * 10], faceTo([Math.cos(a), 0.2]), { pose: rand() < 0.4 ? 'talk' : 'stand' }); }
  // ── the Daoist court: priests in indigo with topknots, visitors ──
  for (let k = 0; k < 5; k++) fig([DAO_AX + (rand() - 0.5) * 30, -60 - rand() * 40], rand() * 6.28, { dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_white', over: 'sash', hat: 'cap', hatMat: 'cloth_black', beard: true, pose: rand() < 0.4 ? 'talk' : 'stand' });
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) L.push({ t: 'bench', at: [DAO_AX + s * 12, -62 - k * 9], y: 0, rot: Math.PI / 2, len: 2.0 });
  void WARDS; void DACI; void DITCH;
  return L;
}
