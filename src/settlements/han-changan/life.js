// Han Chang'an — the standing life (docs/settlements/han-changan.md §7): the harnessed horses and drivers of the chariot park, the officials waiting
// in groups and the guards lining the paved way of the forecourt; the sellers behind their counters and the customers in the market lanes, the stalls
// of the cross lanes; the palace quarters' lanes with their benches, wells and woodpiles; the keepers at the ward gates; ox-carts on the great
// avenue. Plans of style 'life' (src/objects/index.js), placed from layout.js.
import { RADIUS, AX, PALACE, WEST_MARKET, EAST_MARKET, WARDS, WARD_WALL, AVENUE, QUARTERS, QUARTER_LANES, MARKET_WALL, marketShops, GATE_S, GATE_W, WALL_W, WALL_S } from './layout.js';
import { chariotSpots } from '../../styles/han/court.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const plan = (id, elements) => ({ id, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [AX, 60], facing: 'n' } });
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];
const faceTo = (dx, dz) => Math.atan2(-dx, -dz);                       // the rotation of a thing that faces −z by default, to face (dx, dz)

/** A figure in the dress of the Han: the role by trade. */
function figure(rand, at, rot, role, o = {}) {
  const base = { t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', top: '', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', hair: 'topknot', hairMat: 'hair_dark', feet: 'shod', carry: 'none', pose: 'stand' };
  const R = {
    official: { cloth: pick(rand, ['cloth_black', 'cloth_red', 'cloth_blue', 'cloth_green']), cloth2: 'cloth_white', hat: 'cap', over: 'sash', beard: rand() < 0.6 ? 1 : 0 },
    guard: { cloth: pick(rand, ['cloth_grey', 'cloth_brown']), cloth2: 'cloth_black', hat: 'cap', over: 'belt', pose: 'staff', carry: 'staff', len: 2.2 },
    seller: { dress: 'tunic', legs: 'hose', cloth: pick(rand, ['cloth_brown', 'cloth_ochre', 'cloth_indigo', 'cloth_green']), cloth2: 'cloth_brown', hat: rand() < 0.5 ? 'cap' : 'none', over: 'belt' },
    customer: { cloth: pick(rand, ['cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_red', 'cloth_indigo', 'cloth_brown']), cloth2: 'cloth_white', hat: 'cap', over: 'sash' },
    woman: { cloth: pick(rand, ['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_blue']), cloth2: 'cloth_white', hair: 'bun', over: 'none' },
    labourer: { dress: 'trousers', top: 'bare', cloth: pick(rand, ['cloth_white', 'cloth_grey', 'cloth_brown']), cloth2: 'cloth_grey', feet: 'bare', hat: rand() < 0.5 ? 'straw' : 'none' },
    hu: { dress: 'tunic', legs: 'hose', cloth: pick(rand, ['cloth_indigo', 'cloth_red', 'cloth_green']), cloth2: 'cloth_brown', hat: 'brim', beard: 1, skin: 'skin_medium', over: 'belt' },
    boy: { dress: 'tunic', legs: 'hose', cloth: pick(rand, ['cloth_white', 'cloth_ochre', 'cloth_green']), feet: 'bare', over: 'none', h: 1.15, child: true },
  };
  return { ...base, ...R[role], ...o };
}

/** The forecourt: harnessed teams at the chariots, drivers, waiting groups of officials, guards down the axis. */
function forecourt() {
  const rand = rng(310), L = [];
  chariotSpots(AX, PALACE[3] - 2).forEach((c, k) => {
    const dx = Math.cos(c.yaw), dz = Math.sin(c.yaw), rot = faceTo(dx, dz);
    if (k % 3 !== 2) for (const v of [-0.42, 0.42]) L.push({ t: 'animal', kind: 'horse', at: [c.x + dx * 2.7 - dz * v, c.z + dz * 2.7 + dx * v], y: 0, rot, seed: Math.floor(rand() * 1e9), gear: true });
    if (k % 2 === 0) L.push(figure(rand, [c.x - dx * 0.2, c.z - dz * 0.2], rot, 'guard', { y: 0.62, pose: 'stand', carry: 'none', cloth: 'cloth_brown' }));
  });
  // the waiting groups under the corridors' walls: officials in threes and fours, turned to one another
  for (const s of [-1, 1]) for (let g = 0; g < 4; g++) {
    const cx = AX + s * (60 + rand() * 10), cz = -40 + g * 26 + rand() * 6, n = 3 + (g & 1);
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + g, x = cx + Math.cos(a) * 1.0, z = cz + Math.sin(a) * 1.0; L.push(figure(rand, [x, z], faceTo(cx - x, cz - z), 'official', { pose: 'talk' })); }
  }
  // the guards in pairs down the paved way, facing it
  for (let z = 70; z > -80; z -= 14) for (const s of [-1, 1]) L.push(figure(rand, [AX + s * 6.9, z], s < 0 ? -Math.PI / 2 : Math.PI / 2, 'guard'));
  return L;
}

/** The shops' sellers and customers, the cross lanes' stalls. */
function market(rect, seedBase) {
  const rand = rng(seedBase * 7 + 3), L = [], [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  let idx = 0;
  for (const row of marketShops(rect, seedBase)) {
    const [rx0, rz0, rx1, rz1] = row.rect, sw = (rx1 - rx0) / row.n, n = row.front === 'n' ? 1 : -1;
    const zFront = row.front === 'n' ? rz0 : rz1;
    for (let i = 0; i < row.n; i++, idx++) {
      const u0 = rx0 + i * sw, mid = u0 + sw / 2;
      if (idx % 5 === 0) L.push(figure(rand, [u0 + 0.3 + (sw / 2 - 0.4) / 2 + 0.3, zFront + n * 1.35], faceTo(0, -n), idx % 10 === 0 ? 'woman' : 'seller'));
      else if (idx % 12 === 4) L.push(figure(rand, [mid + (rand() - 0.5) * 2, zFront - n * 1.9], faceTo(0, n), idx % 2 ? 'customer' : 'woman'));
      else if (idx % 23 === 7) L.push(figure(rand, [mid, zFront - n * 2.2], faceTo(0, n), 'hu'));
    }
  }
  // the stalls in the cross lanes, the sellers behind them
  const stall = (x, z, rot, seed) => {
    const f = [Math.sin(rot), Math.cos(rot)];
    L.push({ t: 'stall', at: [x, z], y: 0, rot, seed, w: 2.6, d: 1.4, goods: pick(rand, [['bolts', 'cloth'], ['pottery'], ['baskets', 'heap'], ['greens', 'heap'], ['fish'], ['bolts']]), awning: pick(rand, ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white']) });
    L.push(figure(rand, [x - f[0] * 1.2, z - f[1] * 1.2], faceTo(f[0], f[1]), rand() < 0.35 ? 'woman' : 'seller'));
  };
  for (let x = x0 + 16; x < x1 - 14; x += 11 + rand() * 3) { if (Math.abs(x - cx) < 13) continue; if (rand() < 0.5) continue; stall(x, cz - 5.0, 0, Math.floor(rand() * 1e9)); if (rand() < 0.7) stall(x + 4, cz + 5.0, Math.PI, Math.floor(rand() * 1e9)); }
  for (let z = z0 + 16; z < z1 - 14; z += 11 + rand() * 3) { if (Math.abs(z - cz) < 13) continue; if (rand() < 0.5) continue; stall(cx - 5.0, z, Math.PI / 2, Math.floor(rand() * 1e9)); if (rand() < 0.7) stall(cx + 5.0, z + 4, -Math.PI / 2, Math.floor(rand() * 1e9)); }
  // goods laid on mats at the lane edges, a barrow and an ox-cart unloading by each gate
  for (const [gx, gz, f] of [[cx, z0 + MARKET_WALL.th + 4, 1], [cx, z1 - MARKET_WALL.th - 4, -1], [x0 + MARKET_WALL.th + 4, cz, 0], [x1 - MARKET_WALL.th - 4, cz, 0]]) {
    const alongX = f !== 0, ox = alongX ? 2.5 : 0, oz = alongX ? 0 : 2.5;
    L.push({ t: 'cart', at: [gx + ox, gz + oz], y: 0, rot: alongX ? 0 : Math.PI / 2, seed: Math.floor(rand() * 1e9), beast: 'ox' });
    L.push({ t: 'goods_mat', at: [gx - ox * 1.6, gz - oz * 1.6], y: 0, rot: 0, seed: Math.floor(rand() * 1e9), goods: ['pottery', 'baskets'] });
    L.push(figure(rand, [gx + ox * 0.2 - oz * 0.5, gz + oz * 0.2 + ox * 0.5], rand() * 6, 'labourer'));
  }
  return L;
}

/** The palace quarters' lanes: benches with sitters, a well, firewood, vats, a boy. */
function quarters() {
  const rand = rng(77), L = [];
  for (const [qx0, zl0, qx1, zl1] of QUARTER_LANES) {
    const cz = (zl0 + zl1) / 2;
    for (let x = qx0 + 8; x < qx1 - 8; x += 17 + rand() * 6) {
      const t = rand();
      const side = rand() < 0.5 ? -1 : 1, z = cz + side * 1.5, face = side < 0 ? Math.PI : 0;
      if (t < 0.3) { L.push({ t: 'bench', at: [x, z], y: 0, rot: face, seed: Math.floor(rand() * 1e9), len: 1.8 }); L.push(figure(rand, [x - 0.4, z], face, rand() < 0.5 ? 'guard' : 'official', { pose: 'sit', carry: 'none' })); if (rand() < 0.6) L.push(figure(rand, [x + 0.5, z], face, 'seller', { pose: 'sit' })); }
      else if (t < 0.5) L.push({ t: 'well', at: [x, cz], y: 0, rot: 0, seed: Math.floor(rand() * 1e9), kind: 'windlass', mat: 'bluestone' });
      else if (t < 0.7) { L.push({ t: 'firewood', at: [x, z], y: 0, rot: face, seed: Math.floor(rand() * 1e9), len: 1.5 }); L.push(figure(rand, [x + 1.4, z], rand() * 6, 'labourer', { pose: 'squat' })); }
      else if (t < 0.85) { L.push({ t: 'pot', at: [x, z], y: 0, rot: 0, seed: Math.floor(rand() * 1e9), kind: 'vat' }); L.push(figure(rand, [x + 0.8, cz], rand() * 6, 'woman')); }
      else { L.push(figure(rand, [x, cz], faceTo(1, 0), 'boy')); L.push(figure(rand, [x + 1.2, cz + 0.4], faceTo(-1, 0), 'boy', { pose: 'squat' })); L.push({ t: 'animal', kind: 'dog', at: [x + 2.4, cz], y: 0, rot: rand() * 6, seed: Math.floor(rand() * 1e9) }); }
    }
  }
  return L;
}

/** The keepers at the ward gates (the ward's two-lane gates on the west side) and an ox-cart or two on the great avenue. */
function gates() {
  const rand = rng(91), L = [];
  for (const w of WARDS) {
    const z0 = w[1], lc = [z0 + WARD_WALL + 24.55, z0 + WARD_WALL + 72.85];
    for (const c of [lc[0]]) for (const [x, rot, dx] of [[w[0], Math.PI / 2, 2.2]]) {
      L.push(figure(rand, [x + dx, c - 1.8], rot, 'guard'));
      if (rand() < 0.5) { L.push({ t: 'bench', at: [x + dx * 1.3, c + 2.0], y: 0, rot: rot, seed: Math.floor(rand() * 1e9), len: 1.6 }); L.push(figure(rand, [x + dx * 1.3, c + 2.0], rot, 'seller', { pose: 'sit' })); }
    }
  }
  const A = AVENUE;
  for (let z = -380; z < 230; z += 52 + rand() * 40) {
    const side = rand() < 0.5 ? -1 : 1, x = side < 0 ? A[0] + 3.2 : A[2] - 3.2;
    if (Math.abs(z - GATE_S.x) < 0 || z > 218) continue;
    L.push({ t: 'cart', at: [x, z], y: 0, rot: Math.PI / 2 * (rand() < 0.5 ? 1 : -1) + (rand() - 0.5) * 0.2, seed: Math.floor(rand() * 1e9), beast: 'ox' });
    L.push(figure(rand, [x + side * 1.3, z + 1.5], rand() * 6, 'labourer', { carry: 'staff', len: 1.8, pose: 'staff' }));
  }
  void WALL_W; void WALL_S; void GATE_W;
  return L;
}

export function lifePlans() {
  return [plan('han-life-court', forecourt()), plan('han-life-west', market(WEST_MARKET, 600)), plan('han-life-east', market(EAST_MARKET, 700)), plan('han-life-quarters', quarters()), plan('han-life-gates', gates())];
}
