// Babylon about 570 BC — the standing life of the lanes, the shops, the open houses, the yards, the river bank and the Way
// (docs/settlements/babylon.md §13.5): people at their work in the rooms they work in, shopkeepers behind their counters,
// customers before them, women at the water stands, men on the benches, a priest at each street shrine, flocks in the pens,
// brick-makers in the yards, gardeners at the shadufs, washers and fishermen on the bank, guards at the gate, pilgrims'
// sellers by the Way's walls. Positions come from layout.js; each tile of 100 m is a plan that shows within 230 m.
import { RADIUS, WAY, WALL_Z, PALACE, RIVER, QUAY, BRIDGE, lots, yards, laneProps, riverX, MARKET } from './layout.js';
import { frameOf } from '../../styles/babylonian/shop.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));
const CLOTH = ['cloth_white', 'cloth_white', 'linen', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_brown'];

export function lifeElements() {
  const rand = rng(9157), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CLOTH), cloth2: 'cloth_white', over: pick(['cape', 'sash', 'none']), hair: 'long', beard: true, hairMat: 'hide_black', skin: rand() < 0.5 ? 'skin_medium' : 'skin_light', hat: 'none', feet: 'shod', carry: 'none', ...o });
  const woman = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, h: 1.5 + rand() * 0.08, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: pick(CLOTH), cloth2: pick(CLOTH), hat: 'veil', skin: 'skin_medium', feet: 'shod', carry: 'none', ...o });
  const worker = (at, y, rot, o = {}) => man(at, y, rot, { dress: 'tunic', over: 'belt', cloth: pick(['cloth_white', 'cloth_brown', 'linen', 'cloth_ochre']), legs: 'bare', feet: 'bare', beard: rand() < 0.6, ...o });
  const boy = (at, y, rot, o = {}) => man(at, y, rot, { h: 1.1 + rand() * 0.2, beard: false, dress: 'tunic', over: 'none', legs: 'bare', feet: 'bare', hair: 'short', ...o });
  const animal = (kind, at, y, rot, o = {}) => L.push({ t: 'animal', kind, at, y, rot, seed: Math.floor(rand() * 1e9), ...o });
  // ---- the shops: the keeper behind the counter, the craftsman at his work, a customer at the window --------------
  for (const l of lots()) {
    if (!l.shop && !l.open) continue;
    const { U, V, W } = frameOf(l.rect, l.door), t = 0.5, yard0 = t + 5.6 + 0.4, y = 0.06;
    const at = (u, v) => W(u, v), to = (u, v, u2, v2) => face(at(u, v), at(u2, v2));
    if (l.shop) {
      const trade = l.shop, wu = (3.0 + U - 1.0) / 2;
      // the keeper stands inside the window (one in each shop); the trades' own people at their tools
      const keeper = (u, v, o = {}) => (trade === 'baker' || trade === 'weaver' || trade === 'brewer' ? woman : man)(at(u, v), y, to(u, v, u, -3), { carry: 'none', pose: 'stand', ...o });
      if (trade === 'potter') { keeper(wu, 1.4); man(at(2.2, 4.0), y, to(2.2, 4.0, 2.2, 3.2), { pose: 'squat', dress: 'tunic', over: 'belt', cloth: 'cloth_brown', legs: 'bare', feet: 'bare' }); worker(at(U * 0.3 + 1.9, yard0 + 2.0), 0.05, to(U * 0.3 + 1.9, yard0 + 2.0, U * 0.3, yard0 + 2.0), { carry: 'none' }); }
      else if (trade === 'baker') { keeper(wu, 1.4); woman(at(1.65, 4.2), y, to(1.65, 4.2, 1.65, 3.2), { pose: 'stand' }); woman(at(U * 0.3 + 0.85, yard0 + 3.0), 0.05, to(U * 0.3 + 0.85, yard0 + 3.0, U * 0.3 + 0.85, yard0 + 1.7), { pose: 'stand' }); }
      else if (trade === 'weaver') { keeper(wu, 1.4, { carry: 'basket' }); woman(at(1.95, 2.5), y, to(1.95, 2.5, 1.95, 3.4), { pose: 'squat', cloth: 'cloth_ochre' }); }
      else if (trade === 'brewer') { keeper(U / 2, 4.2, { carry: 'pot' }); for (const u of [1.9, U - 2.2]) worker(at(u, 4.3), y, to(u, 4.3, u + 0.9, 4.0), { pose: 'sit_ground' }); }
      else if (trade === 'smith') { man(at(2.0, 3.9), y, to(2.0, 3.9, 2.0, 3.2), { dress: 'tunic', over: 'apron', cloth: 'cloth_brown', legs: 'bare', feet: 'bare', beard: true }); boy(at(U - 2.4, 4.2), y, to(U - 2.4, 4.2, U - 2.4, 5.5), { carry: 'none' }); keeper(wu, 1.4); }
      else if (trade === 'grocer') { keeper(wu, 1.4); boy(at(1.4, 2.4), y, to(1.4, 2.4, 1.4, 1.0), {}); }
      else { man(at(2.2, 3.9), y, to(2.2, 3.9, 2.2, 3.0), { dress: 'tunic', over: 'apron', cloth: 'linen', legs: 'bare', feet: 'bare' }); worker(at(U * 0.4, yard0 + 2.2), 0.05, to(U * 0.4, yard0 + 2.2, U * 0.4, yard0 + 0.8), {}); keeper(wu, 1.4); }
      if (rand() < 0.65) (rand() < 0.5 ? man : woman)(at(3.4 + rand() * (U - 6.2), -1.5), 0, to(3.4, -1.5, 3.4, 0), { pose: rand() < 0.5 ? 'stand' : 'talk', carry: rand() < 0.4 ? 'basket' : 'none' });
    } else {
      // the open house: the housewife at the hearth, the master on his stool in the reception room, a child in the court
      const dF = Math.max(1.9, Math.min(2.4, V * 0.18)), dB = Math.max(2.7, Math.min(3.4, V * 0.26)), vC0 = 0.55 + dF + 0.4, vC1 = V - 0.55 - dB - 0.4, vk = (vC0 + vC1) / 2;
      const uC1 = U - 0.55 - 2.6 - 0.4, cu = (0.55 + uC1) / 2, cv = (vC0 + vC1) / 2;
      woman(at(U - 1.9, vk), y, to(U - 1.9, vk, U - 0.6, vk), { pose: 'stand' });
      man(at(1.15, V - 0.55 - 0.08 - 0.85 - 0.75), 0.0, to(1.15, V - 2.2, 2.0, V - 0.9), { pose: 'sit', carry: 'none', over: 'cape' });
      boy(at(cu - 0.6, cv + 0.3), y, to(cu, cv, cu + 0.6, cv + 0.3), { pose: 'stand' });
      if (l.school) {
        const ra = 0.55, va = V - 0.55 - dB, mid = va + dB / 2 - 0.27;
        man(at(ra + 0.45, mid), y + 0.0, to(ra + 0.45, mid, ra + 3.0, mid), { pose: 'sit', over: 'sash' });
        for (const [u, v] of [[ra + 1.45, va + 1.0], [ra + 1.95, va + 1.0], [ra + 1.45, va + 1.95]]) boy(at(u, v), y, to(u, v, ra, v), { pose: 'cross' });
      }
    }
  }
  // ---- the yards ------------------------------------------------------------------------------------------------------
  const core = (x, z, r = 190) => Math.hypot(x + 40, z + 100) < r;
  for (const y0 of yards()) {
    if (!core((y0.rect[0] + y0.rect[2]) / 2, (y0.rect[1] + y0.rect[3]) / 2, 170)) continue;
    const { U, V, W } = frameOf(y0.rect, y0.door), at = (u, v) => W(u, v), r = rng(y0.seed);
    if (y0.kind === 'pen') {
      for (let k = 0; k < 6; k++) animal(k % 3 === 0 ? 'goat' : 'sheep', at(1.0 + r() * (U - 2), 1.6 + r() * (V - 4)), 0.04, r() * 6.28, {});
      worker(at(U * 0.5, 2.2), 0.04, face(at(U * 0.5, 2.2), at(U * 0.5, V)), { carry: 'staff', len: 1.5, pose: 'staff' });
    } else if (y0.kind === 'brickyard') {
      for (let k = 0; k < 3; k++) worker(at(2.4 + k * 2.2, 3.4), 0.04, face(at(2.4 + k * 2.2, 3.4), at(2.4 + k * 2.2, 1.5)), { pose: k === 1 ? 'squat' : 'stand' });
      animal('donkey', at(U - 2.0, V - 1.8), 0.04, r() * 6.28, { gear: true });
    } else if (y0.kind === 'garden') {
      worker(at(2.0 - 1.1, V - 2.2), 0.04, face(at(0.9, V - 2.2), at(0.4, V - 1.6)), { pose: 'stand', carry: 'staff', len: 1.4 });
      woman(at(U - 2.4, 3.2), 0.04, face(at(U - 2.4, 3.2), at(U * 0.5, 2.3)), { carry: 'pot' });
    } else if (y0.kind === 'kiln') {
      worker(at(U * 0.3 + 1.8, V * 0.5 - 1.8), 0.04, face(at(U * 0.3 + 1.8, V * 0.5 - 1.8), at(U * 0.3, V * 0.5 - 1.5)), {});
    }
  }
  // ---- the lanes: at the water stands, on the benches, at the shrines, at the troughs -------------------------------
  for (const p of laneProps()) {
    const [x, z] = p.at;
    if (!core(x, z, 150) || rand() < 0.35) continue;
    const c = Math.cos(p.rot), s = Math.sin(p.rot), P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c], r = rng(p.seed);
    if (p.kind === 'zir' && r() < 0.6) (r() < 0.7 ? woman : man)(P(-0.1, -1.0), 0, face(P(-0.1, -1.0), [x, z]), { carry: r() < 0.6 ? 'pot' : 'none', pose: r() < 0.5 ? 'stand' : 'talk' });
    else if (p.kind === 'bench' && r() < 0.8) for (const lx of [-0.45, 0.35]) man(P(lx, 0.0), 0.0, face(P(lx, 0), P(lx, -3)), { pose: 'sit', carry: lx < 0 ? 'staff' : 'none', len: 1.3 });
    else if (p.kind === 'shrine' && r() < 0.5) woman(P(0, -1.5), 0, face(P(0, -1.5), [x, z]), { pose: 'pray', cloth: 'cloth_white' });
    else if (p.kind === 'trough' && r() < 0.7) { animal(r() < 0.7 ? 'donkey' : 'ox', P(0.3, -1.1), 0, p.rot + Math.PI / 2 + (r() < 0.5 ? Math.PI : 0), {}); if (r() < 0.6) worker(P(-1.0, -1.0), 0, face(P(-1.0, -1.0), P(0.3, -1.1)), { carry: 'staff', len: 1.3, pose: 'staff' }); }
    else if (p.kind === 'bricks' && r() < 0.5) worker(P(1.1, -0.8), 0, face(P(1.1, -0.8), [x, z]), { carry: 'basket' });
  }
  // ---- the river bank: gardeners at the shadufs on the west bank, women washing, fishermen with their nets at the quay ---
  for (const z of [-110, -30, 120, 190]) {
    const xr = riverX(z), d = 46, sx = xr - d;
    // the shaduf: the man at the lever, a boy carrying the water on to the bed
    worker([sx - 0.2, z + 1.6], 0, face([sx - 0.2, z + 1.6], [sx + 1.2, z]), { pose: 'pull', carry: 'rope', len: 1.4 });
    boy([sx - 3.0, z + 1.4], 0, face([sx - 3.0, z + 1.4], [sx - 1.5, z + 3.5]), { carry: 'pot' });
  }
  for (const z of [-80, 14, 70, 160, 225]) {
    if (Math.abs(z - BRIDGE.z) < 22) continue;
    const xq = riverX(z) + QUAY.d0 + 0.8;
    for (let k = 0; k < 2; k++) woman([xq + 0.3, z + k * 1.3], QUAY.y, -Math.PI / 2, { pose: 'kneel', carry: 'none', arms: 'pray', cloth: pick(['cloth_ochre', 'cloth_brown', 'cloth_indigo']) });   // kneeling at the water's edge
    L.push({ t: 'pot', at: [xq + 1.0, z + 0.6], y: QUAY.y, kind: 'water_pot', seed: Math.floor(rand() * 1e6) });
  }
  for (const z of [-120, 5, 78, 175]) {
    if (Math.abs(z - BRIDGE.z) < 22) continue;
    const xq = riverX(z) + QUAY.d0 + 1.2;
    worker([xq, z], QUAY.y, -Math.PI / 2, { pose: 'stand', carry: 'rope', len: 1.2 });
    L.push({ t: 'quay_goods', at: [xq + 1.4, z + 0.8], y: QUAY.y, rot: 0.3, kind: 'net' });
  }
  // ---- the gate and the Way ----------------------------------------------------------------------------------------
  // guards at the Ishtar Gate's inner mouth, spearmen in the long tunic and the round cap
  for (const [dx, dz] of [[-3.2, -262], [3.2, -262], [-8.5, -263], [8.5, -263], [-3.2, -321], [3.2, -321]]) man([WAY.x + dx, dz], 0.12, dz > -300 ? 0 : Math.PI, { carry: 'staff', len: 2.2, pose: 'staff', cloth: 'cloth_indigo', cloth2: 'cloth_red', over: 'sash', hat: 'cap', beard: true });
  // pilgrims' sellers by the glazed walls south of the gate: baskets of doves, flowers, incense, small clay figures
  const WARES = [['bread', 'baskets'], ['heap', 'baskets'], ['pottery', 'pottery'], ['heap', 'melons']];
  for (let k = 0; k < 8; k++) {
    const z = -255 + k * 12.5, east = k % 2 === 0, x = WAY.x + (east ? 8.3 : -8.3), rot = east ? Math.PI / 2 : -Math.PI / 2;
    L.push({ t: 'goods_mat', at: [x, z], y: 0.12, rot: east ? -Math.PI / 2 : Math.PI / 2, seed: Math.floor(rand() * 1e9), goods: WARES[k % WARES.length], mat: 'reed_mat' });
    (k % 3 === 0 ? man : woman)([x + (east ? 1.0 : -1.0), z], 0.12, rot + Math.PI, { pose: 'sit_ground' });
    if (k % 2 === 1) man([x + (east ? -2.2 : 2.2), z + 0.8], 0.12, rot, { pose: 'talk', carry: 'none' });
  }
  // ---- the Way before the gate (§13.6): where the visitor arrives — pilgrims and sellers between the glazed walls, a file of
  // priests going down to the gate with incense, a loaded ass, children at their games, water carriers, dogs. Nothing within ~4 m
  // of the arrival (x −40, z −360) or in the view down the middle for the first few metres.
  {
    const ok = ([x, z]) => !(Math.abs(x - WAY.x) < 4.2 && z > -366 && z < -350);
    const put = (fn, at, ...rest) => { if (ok(at)) fn(at, ...rest); };
    // sellers on mats along both walls, a buyer or two before each
    const NW = [['heap', 'baskets'], ['bread', 'baskets'], ['pottery', 'pottery'], ['heap', 'melons'], ['greens', 'heap'], ['bolts', 'bolts']];
    for (let k = 0, z = -376; z < -322; k++, z += 8.6 + rand() * 2) {
      const east = k % 2 === 0, x = WAY.x + (east ? 6.6 : -6.6), rot = east ? -Math.PI / 2 : Math.PI / 2;
      if (!ok([x, z])) continue;
      L.push({ t: 'goods_mat', at: [x, z], y: 0.12, rot, seed: Math.floor(rand() * 1e9), goods: NW[k % NW.length], mat: 'reed_mat' });
      (k % 3 === 1 ? man : woman)([x + (east ? 1.1 : -1.1), z + 0.2], 0.12, rot + Math.PI, { pose: 'sit_ground' });
      if (rand() < 0.7) put(rand() < 0.5 ? man : woman, [x + (east ? -1.6 : 1.6), z + (rand() - 0.5) * 1.2], 0.12, rot, { pose: rand() < 0.5 ? 'stand' : 'talk', carry: rand() < 0.4 ? 'basket' : 'none' });
    }
    // the file of Marduk's priests going down to the gate with incense, the foremost with the staff of the god
    for (let k = 0; k < 7; k++) {
      const at = [WAY.x - 5.2 + (k % 2) * 1.3, -343 + k * 2.3];
      man(at, 0.12, 0, { cloth: 'linen', cloth2: 'cloth_white', over: 'sash', hair: 'shaven', beard: false, pose: k === 0 ? 'staff' : 'stand', carry: k === 0 ? 'staff' : k === 3 || k === 5 ? 'pot' : 'none', len: 2.0 });
    }
    // a loaded ass with its driver by the east wall, and a second beast tethered at a trough's post
    animal('donkey', [WAY.x + 8.4, -336], 0.12, Math.PI, { gear: true });
    worker([WAY.x + 7.4, -333.6], 0.12, Math.PI * 1.1, { carry: 'staff', len: 1.4, pose: 'staff' });
    // water carried from the Euphrates: women with jars on their heads walking along the walls
    for (const [dx, z] of [[-8.0, -352], [7.8, -372], [-7.4, -318]]) woman([WAY.x + dx, z], 0.12, dx < 0 ? Math.PI : 0, { carry: 'pot' });
    // pilgrims in twos and threes, a family with children, boys at a game of knucklebones in the dust, dogs
    for (const [dx, z, n] of [[3.4, -354, 2], [-2.6, -372, 3], [5.0, -318, 2], [-6.0, -341, 2]]) for (let i = 0; i < n; i++) put(rand() < 0.65 ? man : woman, [WAY.x + dx + i * 0.8, z + (rand() - 0.5) * 0.8], 0.12, rand() < 0.5 ? 0 : Math.PI, { pose: i === 1 && n === 2 ? 'talk' : 'stand' });
    for (const [dx, z] of [[-4.0, -330], [4.6, -347]]) put(boy, [WAY.x + dx, z], 0.12, rand() * 6.28, { pose: 'squat' });
    put(boy, [WAY.x + 5.4, -346.6], 0.12, rand() * 6.28, { pose: 'squat' });
    put(boy, [WAY.x - 3.2, -329.4], 0.12, rand() * 6.28, { pose: 'stand' });
    for (const [dx, z] of [[-6.2, -362], [7.0, -326]]) put((at, y, rot) => animal('dog', at, y, rot), [WAY.x + dx, z], 0.12, rand() * 6.28);
  }
  // the precinct gate: priests of Marduk in white linen with the staff, two at each side of the way
  for (const [dx, dz] of [[-7, -64], [7, -64], [-7.8, -68], [7.8, -68]]) man([WAY.x + dx, dz], 0.12, Math.PI / 2 * (dx < 0 ? -1 : 1) + Math.PI, { cloth: 'linen', cloth2: 'cloth_white', over: 'sash', pose: 'staff', carry: 'staff', len: 1.7, hair: 'shaven', beard: false });
  void RADIUS; void PALACE; void WALL_Z; void RIVER; void MARKET;
  return L;
}

/** The elements in plans by tile of 100 m, each visible within 230 m of its tile's middle. */
export function lifePlans(base) {
  const tiles = new Map();
  const goods = [];
  for (const e of lifeElements()) {
    if (e.t === 'quay_goods') { goods.push(e); continue; }
    const [x, z] = e.at, key = `${Math.floor(x / 100)},${Math.floor(z / 100)}`;
    if (!tiles.has(key)) tiles.set(key, []);
    tiles.get(key).push(e);
  }
  const out = [{ ...base('babylon-quay-goods', goods) }];
  for (const [k, list] of tiles) { const [a, b] = k.split(',').map(Number); out.push({ ...base(`babylon-life-${out.length}`, list), style: 'life', center: [a * 100 + 50, b * 100 + 50], near: 200 }); }
  return out;
}
