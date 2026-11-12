// Round the landmarks (docs/settlements/shang-yinxu.md §2, §5, §6): the Huan with its plank bridges, the bronze foundry, the
// lineage compounds and workshops, and the people (kings' diviners kneeling at the fire, officials and guards in the court,
// scribes and diviners at the archive, the casters at the furnaces, the families in their yards), oxen, pigs, dogs, carts.
import { RADIUS, RIVER, BRIDGES, HALL, FLANKS, AXIS, COURT, TOMB, ARCHIVE, FOUNDRY, FURNACES, lots, streets, inRect, inRiver, inMoat } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, o = {}) => ({ id, style: 'shang', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 'n' }, ...o });
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

/** The people. */
function people() {
  const rand = rng(1201), L = [], used = [];
  const free = (x, z, d = 1.0) => !used.some((p) => Math.hypot(p[0] - x, p[1] - z) < d);
  const fig = (at, rot, o = {}, y = 0) => { used.push(at); L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', legs: 'hose', cloth: pick(rand, ['cloth_brown', 'cloth_ochre', 'cloth_grey', 'cloth_brown']), cloth2: 'cloth_brown', over: 'belt', skin: pick(rand, ['skin_medium', 'skin_light']), hat: 'none', feet: 'shod', hair: 'topknot', beard: rand() < 0.2, ...o }); };
  const noble = (at, rot, o = {}, y = 0) => fig(at, rot, { dress: 'robe', legs: undefined, cloth: pick(rand, ['cloth_red', 'cloth_black', 'cloth_red', 'cloth_ochre']), cloth2: pick(rand, ['cloth_black', 'cloth_ochre']), over: 'sash', beard: rand() < 0.5, ...o }, y);
  const woman = (at, rot, o = {}, y = 0) => fig(at, rot, { dress: 'robe', legs: undefined, cloth: pick(rand, ['cloth_ochre', 'cloth_brown', 'cloth_grey', 'cloth_red']), cloth2: 'cloth_black', over: 'sash', hair: 'bun', beard: false, ...o }, y);
  const guard = (at, rot, o = {}, y = 0) => fig(at, rot, { cloth: 'cloth_brown', cloth2: 'cloth_red', pose: 'staff', carry: 'staff', len: 2.2, ...o }, y);
  const hy = HALL.h + 0.07;
  // the ancestral hall: the king on his mat, the diviners kneeling at the two braziers, an attendant; guards at the doors
  noble([AXIS, -88.9], 0, { pose: 'seiza', cloth: 'cloth_red', cloth2: 'cloth_black', beard: true, hat: 'none' }, hy);
  for (const s of [-1, 1]) noble([AXIS + s * 6, -89.0], 0, { pose: 'seiza', cloth: 'cloth_black', cloth2: 'cloth_red', beard: true }, hy);
  noble([AXIS - 6, -92.4], 0.3, { pose: 'talk' }, hy);
  for (const s of [-1, 1]) guard([AXIS + s * 4, -78.3], Math.PI, {}, HALL.h);
  // the court: diviners kneeling over fires heating plastrons, officials and petitioners, guards along the sides, the pits' tenders
  for (let k = 0; k < 4; k++) { const x = 4 + k * 10.5; fig([x, -30], 0, { pose: 'kneel', dress: 'robe', legs: undefined, cloth: 'cloth_black', cloth2: 'cloth_red', over: 'sash', beard: true }); }
  for (let k = 0; k < 18; k++) { const x = COURT[0] + 4 + rand() * (COURT[2] - COURT[0] - 8), z = -74 + rand() * 110; if (!free(x, z, 1.6) || (Math.abs(x - AXIS) < 3.4 && z < -70)) continue; (rand() < 0.5 ? noble : fig)([x, z], rand() * 6.28, rand() < 0.3 ? { pose: 'talk' } : {}); }
  for (const z of [-20, 0, 20]) for (const x of [-2, 42]) guard([x, z], x < 0 ? Math.PI / 2 : -Math.PI / 2);
  for (const s of [-1, 1]) guard([AXIS + s * 3.6, 44.6], Math.PI);
  // the flanking halls: attendants on their platforms
  for (const f of FLANKS) { const cx = (f.plat[0] + f.plat[2]) / 2; for (const z of [-55, -40]) noble([cx, z], rand() * 6, { pose: rand() < 0.5 ? 'talk' : 'stand' }, f.h); }
  // Fu Hao's tomb: mourners kneeling at the offering table, guards at the chariot
  { const cx = (TOMB.hall[0] + TOMB.hall[2]) / 2; for (const s of [-1, 1]) noble([cx + s * 1.1, TOMB.hall[1] + 3.2], 0, { pose: 'seiza', cloth: 'cloth_grey', cloth2: 'cloth_grey' }, TOMB.h);
    guard([-44, -94.5], 0.3); guard([-52, -94.5], -0.3); }
  // the archive: scribes and diviners kneeling at the benches, a porter with a basket of shells, a keeper at the door
  { const [sx0, sz0, sx1] = ARCHIVE.shed; for (let i = 0; i < 3; i++) for (const du of [0.8, 2.0]) if (rand() < 0.85) fig([sx0 + 1.5 + i * 9 + du, sz0 + 4.5], 0, { pose: 'kneel', dress: 'robe', legs: undefined, cloth: pick(rand, ['cloth_grey', 'cloth_brown']), over: 'sash', hair: 'bun' });
    fig([sx1 - 4, sz0 + 8], 2.0, { carry: 'basket' }); noble([(ARCHIVE.rect[0] + ARCHIVE.rect[2]) / 2 + 2.4, ARCHIVE.rect[3] + 1.4], 3.1, { pose: 'stand' }, ARCHIVE.h); }
  // the foundry: casters at the furnaces (bare-armed in short coats), mould-makers kneeling at the benches, porters with ore and charcoal, an overseer
  for (const [x, z] of FURNACES) fig([x, z + 2.2], Math.PI, { cloth: 'cloth_brown', carry: rand() < 0.4 ? 'staff' : 'none', pose: rand() < 0.4 ? 'staff' : 'stand', len: 1.8 });
  for (const i of [0, 1]) for (const k of [0, 1]) fig([-135 + i * 9 + 0.8 + k * 1.6, 105.2], 0, { pose: 'kneel' });
  for (let k = 0; k < 9; k++) fig([-136 + rand() * 90, 118 + rand() * 30], rand() * 6.28, { carry: pick(rand, ['basket', 'sack', 'pole', 'none']) });
  for (const x of [-92, -84]) fig([x, 128], 0, { cloth: 'cloth_brown', pose: 'stand' });
  noble([-60, 118], 2.4, { pose: 'talk' });
  // the yards of the lineages: the family at its work, children, a man with the hoe
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, n = l.kind === 'workshop' ? 3 : 2 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) {
      const x = x0 + 4 + rand() * (x1 - x0 - 8), z = (l.front === 'n' ? z0 : z1 - 12) + 4 + rand() * 8, r = rand();
      if (!free(x, z, 1.8)) continue;
      if (r < 0.35) woman([x, z], rand() * 6.28, { carry: pick(rand, ['pot', 'basket', 'none']) }); else if (r < 0.5) woman([x, z], rand() * 6.28, { child: true, h: 1.1 });
      else if (r < 0.8) fig([x, z], rand() * 6.28, { carry: pick(rand, ['hoe', 'sack', 'none']) }); else fig([x, z], rand() * 6.28, { h: 0.7 });
    }
  }
  return L;
}

/** Animals: oxen and pigs and dogs in the yards, a pair of oxen at the carts. */
function animals() {
  const rand = rng(1202), L = [];
  lots().forEach((l, i) => {
    const [x0, z0, x1, z1] = l.rect, x = x0 + 3 + rand() * (x1 - x0 - 6), z = z0 + 3 + rand() * (z1 - z0 - 6);
    if (l.kind === 'workshop') return;
    if (i % 3 === 0) L.push({ t: 'animal', kind: 'pig', at: [x, z], y: 0, rot: rand() * 6.28, seed: i + 5 });
    if (i % 4 === 1) L.push({ t: 'animal', kind: 'dog', at: [x + 2, z + 1], y: 0, rot: rand() * 6.28, seed: i + 9 });
    if (i % 7 === 2) L.push({ t: 'animal', kind: 'ox', at: [x, z - 1], y: 0, rot: rand() * 6.28, seed: i + 13 });
  });
  for (const [x, z] of [[-4, -10], [40, 10], [18, 30]]) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: Math.round(x) + 40 });
  return L;
}

/** Carts on the lanes: ox carts with loads of turtle shells and charcoal, a chariot team on the court. */
function carts() {
  const rand = rng(1203), L = [], S = streets().filter((r) => r[2] - r[0] > r[3] - r[1] && r[2] - r[0] > 20);
  let i = 0;
  for (const r of S) { if (i++ % 2) continue; const x = r[0] + 8 + rand() * (r[2] - r[0] - 16), z = (r[1] + r[3]) / 2; if (inRect([-30, -104, 70, 56], x, z) || inRiver(x, z, 4) || inMoat(x, z, 3)) continue;
    L.push({ t: 'cart', kind: 'two', at: [x, z], y: 0, rot: rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, seed: Math.floor(rand() * 1e9), load: pick(rand, ['sacks', 'hay', 'barrels']), beast: pick(rand, ['ox', 'ox', 'horse']) }); if (L.length > 8) break; }
  L.push({ t: 'cart', kind: 'two', at: [-4, 6], y: 0, rot: 0, seed: 77, load: 'sacks', beast: 'horse' });
  return L;
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  const plans = [];
  plans.push(base('yinxu-river', [{ t: 'shang_river', pts: RIVER.pts }, ...BRIDGES.map((b) => ({ t: 'shang_bridge', a: b.a, b: b.b }))]));
  plans.push(base('yinxu-foundry', [{ t: 'shang_foundry' }]));
  plans.push({ ...base('yinxu-people', people()), style: 'life' });
  plans.push({ ...base('yinxu-animals', animals()), style: 'life' });
  plans.push({ ...base('yinxu-carts', carts()), style: 'life' });
  const K = { court: 'shang_court_house', pits: 'shang_pit_yard', row: 'shang_row_house', workshop: 'shang_workshop' };
  const LOTS = lots();
  for (let i = 0; i < LOTS.length; i += 16) plans.push(base(`yinxu-town-${i / 16}`, LOTS.slice(i, i + 16).map((l) => ({ t: K[l.kind], rect: l.rect, front: l.front, seed: l.seed, open: l.open, trade: l.trade, lod: l.lod }))));
  void FOUNDRY;
  return (CACHE = plans);
}
