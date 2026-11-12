// Round the landmarks (docs/settlements/shang-yinxu.md §2, §5, §6): the Huan with its plank bridges, the bronze foundry, the
// lineage compounds and workshops, and the people (kings' diviners kneeling at the fire, officials and guards in the court,
// scribes and diviners at the archive, the casters at the furnaces, the families in their yards), oxen, pigs, dogs, carts.
import { RADIUS, RIVER, BRIDGES, HALL, FLANKS, AXIS, COURT, TOMB, ARCHIVE, FOUNDRY, FURNACES, lots, streets, inRect, inRiver, inMoat, lotPoint, lotRot, spots, landings, height } from './layout.js';
import { boatFloat } from '../../objects/index.js';

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
    guard([-48, -93.2], 0.3); guard([-38.5, -93.2], -0.3); }
  // the archive: scribes and diviners kneeling at the benches, a porter with a basket of shells, a keeper at the door
  { const [sx0, sz0, sx1] = ARCHIVE.shed; for (let i = 0; i < 3; i++) for (const du of [0.8, 2.0]) if (rand() < 0.85) fig([sx0 + 1.5 + i * 9 + du, sz0 + 4.5], 0, { pose: 'kneel', dress: 'robe', legs: undefined, cloth: pick(rand, ['cloth_grey', 'cloth_brown']), over: 'sash', hair: 'bun' });
    fig([sx1 - 4, sz0 + 8], 2.0, { carry: 'basket' }); noble([(ARCHIVE.rect[0] + ARCHIVE.rect[2]) / 2 + 2.4, ARCHIVE.rect[3] + 1.4], 3.1, { pose: 'stand' }, ARCHIVE.h); }
  // the foundry: casters at the furnaces (bare-armed in short coats), mould-makers kneeling at the benches, porters with ore and charcoal, an overseer
  for (const [x, z] of FURNACES) fig([x, z + 2.2], Math.PI, { cloth: 'cloth_brown', carry: rand() < 0.4 ? 'staff' : 'none', pose: rand() < 0.4 ? 'staff' : 'stand', len: 1.8 });
  for (const i of [0, 1]) for (const k of [0, 1]) fig([-135 + i * 9 + 0.8 + k * 1.6, 105.2], 0, { pose: 'kneel' });
  for (let k = 0; k < 9; k++) fig([-136 + rand() * 90, 118 + rand() * 30], rand() * 6.28, { carry: pick(rand, ['basket', 'sack', 'pole', 'none']) });
  for (const x of [-92, -84]) fig([x, 128], 0, { cloth: 'cloth_brown', pose: 'stand' });
  noble([-60, 118], 2.4, { pose: 'talk' });
  // the yards of the lineages: by kind, the family at its work at the hearth, the grindstone, the loom and the well; the nearest lots fullest
  for (const l of lots()) {
    const W = l.rect[2] - l.rect[0], D = l.rect[3] - l.rect[1], S = spots(l.kind, W, D), at = (u, v) => lotPoint(l, u, v), ry = lotRot(l);
    const n = l.lod === 0 ? 1 : 0;
    const P = (u, v, rot, o = {}, f = woman) => { const p = at(u, v); if (free(p[0], p[1], 1.0)) f(p, rot, o); };
    if (l.kind === 'workshop') {
      P(W / 2 - 2.5, D - 7.2, ry, { pose: 'kneel', dress: 'tunic', cloth: 'cloth_brown', over: 'belt', hair: 'topknot' }, fig); P(W / 2 + 3.2, D - 7.2, ry, { pose: 'kneel', dress: 'tunic', cloth: 'cloth_grey', over: 'belt', hair: 'topknot' }, fig);
      if (n) { P(W - 4, 7, ry + 1, { carry: 'basket' }, fig); P(4, 8, ry - 1, {}, fig); P(W / 2, 4, ry, { pose: 'talk' }, fig); }
      continue;
    }
    if (!n) { if (rand() < 0.45) P(S.hearth[0] - 0.9, S.hearth[1] + 1.4, ry + 2.6, { pose: 'squat' }); continue; }
    P(S.hearth[0] - 0.9, S.hearth[1] + 1.4, ry + 2.6, { pose: 'squat' }); P(S.hearth[0] + 0.8, S.hearth[1] + 0.2, ry + 1.4, { pose: 'kneel', carry: 'none' });
    { P(S.well[0] + 1.2, S.well[1] + 1.4, ry + 3, { carry: 'pot' }); P(S.yard[0] - 3, S.yard[1] + 2, ry, { child: true, h: 1.1 }); }
    if (l.kind === 'court') { P(W / 2 - 7.8, 14.0, ry + 0.4, { pose: 'kneel', dress: 'tunic', cloth: 'cloth_brown', over: 'belt', hair: 'topknot' }, fig); P(W / 2 - 1.8, D - 9.6, ry, { pose: 'sit_ground', hair: 'bun' }); if (n) { P(W / 2 + 2, 6, ry + 1, { pose: 'talk' }, noble); P(W / 2, 3.2, ry + 3.14, { pose: 'staff', carry: 'staff', len: 2.0 }, guard); } }
    else if (l.kind === 'row') { P(W / 2 + 6.4, 8.2, ry, { pose: 'stand', carry: 'hoe' }, fig); if (n) P(20, 3.4, ry, { pose: 'sit_ground', hair: 'bun' }); P(W / 2 - 1, 14.6, ry + 2, { carry: 'basket' }); }
    else { P(S.yard[0] + 3, S.yard[1] + 3.8, ry + 4, { carry: 'sack' }, fig); if (n) P(S.yard[0] - 2, S.yard[1] - 2.6, ry, { pose: 'sit_ground', hair: 'bun' }); }
  }
  // the lane: people before the lots' fronts, by the bench and the doors
  for (const l of lots()) {
    if (l.lod !== 0 || l.kind === 'workshop') continue;
    const ry = lotRot(l), q = lotPoint(l, 3 + rand() * 20, -1.4);
    if (free(q[0], q[1], 1.5)) { const r = rand(); (r < 0.4 ? woman : fig)(q, ry + (rand() - 0.5), r < 0.3 ? { pose: 'talk' } : r < 0.55 ? { carry: pick(rand, ['basket', 'pot', 'sack']) } : {}); }
  }
  // the river: women washing at the landings, fishers on the stages, a boy with a rod
  for (const g of landings()) {
    const n = g.n, t = g.tang, P = (s, u) => [g.a[0] + n[0] * s + t[0] * u, g.a[1] + n[1] * s + t[1] * u], ry = Math.atan2(n[0], n[1]);
    const w1 = P(3.2, 1.4), w2 = P(3.6, -0.6);
    const hy = (p) => Math.max(0.02, height(p[0], p[1]));
    if (rand() < 0.7 && free(w1[0], w1[1], 1.0)) { fig(w1, ry, { pose: 'squat', dress: 'robe', legs: undefined, hair: 'bun', over: 'sash', cloth: pick(rand, ['cloth_ochre', 'cloth_brown', 'cloth_grey']), beard: false }, 0.02); }
    if (rand() < 0.5 && free(w2[0], w2[1], 1.0)) { fig(w2, ry, { pose: 'sit_ground', dress: 'tunic', hair: 'topknot', cloth: 'cloth_brown', carry: 'none' }, 0.02); }
    if (rand() < 0.4) { const p = P(-2.6, 2.4); if (free(p[0], p[1], 1.0)) fig(p, ry + 3.14, { carry: 'basket' }, hy(p)); }
  }
  return L;
}

/** Animals: pigs in the pens, hens and dogs in the yards, oxen, a team of horses at each parked chariot, ducks and an egret's company on the river. */
function animals() {
  const rand = rng(1202), L = [];
  lots().forEach((l, i) => {
    const W = l.rect[2] - l.rect[0], D = l.rect[3] - l.rect[1], S = spots(l.kind, W, D), at = (u, v) => lotPoint(l, u, v);
    if (l.kind === 'workshop') { L.push({ t: 'chickens', at: at(4, 6), y: 0, rot: rand() * 6, n: 3, seed: i + 300 }); return; }
    const pn = at(S.pen[0], S.pen[1]);
    if (i % 3 !== 2) { L.push({ t: 'animal', kind: 'pig', at: [pn[0] - 0.4, pn[1]], y: 0, rot: rand() * 6.28, seed: i + 5 }); if (i % 2 === 0) L.push({ t: 'animal', kind: 'pig', at: [pn[0] + 0.7, pn[1] + (l.front === 's' ? -0.9 : 0.9)], y: 0, rot: rand() * 6.28, seed: i + 105 }); }
    else L.push({ t: 'animal', kind: 'ox', at: [pn[0], pn[1]], y: 0, rot: rand() * 6.28, seed: i + 13 });
    const hp = at(S.hearth[0] - 2.4, S.hearth[1] + 1.8);
    L.push({ t: 'chickens', at: hp, y: 0, rot: rand() * 6, n: 4 + (i % 3), seed: i + 400 });
    if (i % 3 === 0) L.push({ t: 'animal', kind: 'dog', at: at(S.hearth[0] + 2.4, S.hearth[1] + 1.2), y: 0, rot: rand() * 6.28, seed: i + 9 });
    if (l.lod === 0 && i % 4 === 1) { const q = lotPoint(l, 8 + rand() * 12, -1.6); L.push({ t: 'animal', kind: 'dog', at: q, y: 0, rot: rand() * 6.28, seed: i + 29 }); }
  });
  for (const [x, z] of [[-4, -10], [40, 10], [18, 30]]) L.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: Math.round(x) + 40 });
  // the teams of the two chariots parked in the court (src/styles/shang/court.js): two horses abreast before the pole
  for (const [cx, cz] of [[0.5, 14], [40, 18]]) for (const s of [-0.5, 0.5]) L.push({ t: 'animal', kind: 'horse', at: [cx + s, cz + 4.3], y: 0, rot: Math.PI + (s * 0.1), seed: Math.round(cx) + 90 + (s > 0 ? 1 : 0) });
  for (const s of [-0.55, 0.55]) L.push({ t: 'animal', kind: 'horse', at: [-43 + s, -94.2], y: 0, rot: Math.PI, seed: 70 + (s > 0 ? 1 : 0) });
  L.push({ t: 'animal', kind: 'ox', at: [-2, 30], y: 0, rot: 1.0, seed: 61 }, { t: 'animal', kind: 'ox', at: [44, 28], y: 0, rot: 2.0, seed: 62 });
  // the river: ducks at the landings
  for (const g of landings()) if (rand() < 0.6) L.push({ t: 'chickens', kind: 'duck', at: [g.b[0] + g.n[0] * 2.5 + g.tang[0] * 4, g.b[1] + g.n[1] * 2.5 + g.tang[1] * 4], y: RIVER.water, rot: rand() * 6, n: 3 + Math.floor(rand() * 3), seed: Math.floor(rand() * 1e6) });
  return L;
}

/** The fronts of the lots on the lanes (eye level): firewood and jars and baskets by the doors, a bench, sacks, a stack of shocks; nearer lots dressed fuller. */
function fronts() {
  const rand = rng(1204), L = [];
  for (const l of lots()) {
    const ry = lotRot(l), W = l.rect[2] - l.rect[0], full = l.lod === 0, P = (u, off = -0.55) => lotPoint(l, u, off);
    const n = full ? 4 : 2;
    for (let k = 0; k < n; k++) {
      const u = 1.5 + (W - 3) * ((k + rand() * 0.6) / n), r = rand(), at = P(u, -0.7);
      if (r < 0.28) L.push({ t: 'firewood', at, y: 0, rot: ry + Math.PI / 2, len: 1.4 + rand() * 0.6, seed: Math.floor(rand() * 99) });
      else if (r < 0.52) L.push({ t: 'pot', kind: pick(rand, ['pithos', 'dark_pot', 'water_pot']), at, y: 0, rot: ry, n: 1 + Math.floor(rand() * 3), seed: Math.floor(rand() * 99) });
      else if (r < 0.7) L.push({ t: 'basket', at, y: 0, rot: ry, n: 2, seed: Math.floor(rand() * 99), goods: pick(rand, ['cloth_ochre', 'hide_tan', 'cloth_brown']) });
      else if (r < 0.82) L.push({ t: 'sacks', at, y: 0, rot: ry, n: 3 + Math.floor(rand() * 3), seed: Math.floor(rand() * 99), mat: 'sacking' });
      else if (r < 0.92) L.push({ t: 'bench', at, y: 0, rot: ry, len: 1.7, seed: 1 });
      else L.push({ t: 'haystack', at: lotPoint(l, u, -1.8), y: 0, rot: ry, kind: 'pole', seed: Math.floor(rand() * 9) });
    }
  }
  return L;
}

/** The boats of the Huan: dugout canoes and reed rafts moored at the landings, others pulled up on the bank. */
function boats() {
  const rand = rng(1205), L = [], fy = RIVER.water + boatFloat('canoe');
  for (const g of landings()) {
    const [nx, nz] = g.n, [tx, tz] = g.tang, side = rand() < 0.5 ? 1 : -1, len = 5 + rand() * 2.2;
    const at = [g.b[0] + tx * side * 2.6 + nx * 0.4, g.b[1] + tz * side * 2.6 + nz * 0.4];
    L.push({ t: 'boat', kind: 'canoe', len, at, y: fy, rot: g.rot + (rand() < 0.5 ? 0 : Math.PI), seed: Math.floor(rand() * 1e6) });
    if (rand() < 0.6) L.push({ t: 'boat', kind: 'reed', len: 3.8 + rand() * 1.2, at: [at[0] + nx * 3.2 - tx * side * 0.8, at[1] + nz * 3.2 - tz * side * 0.8], y: RIVER.water + boatFloat('reed'), rot: g.rot + 0.2, seed: Math.floor(rand() * 1e6) });
    if (rand() < 0.4) { const p = [g.a[0] - nx * 4.5 - tx * side * 5, g.a[1] - nz * 4.5 - tz * side * 5]; L.push({ t: 'boat', kind: 'canoe', len: 5, at: p, y: Math.max(0, height(p[0], p[1])) + 0.2, rot: g.rot + 0.1, seed: Math.floor(rand() * 1e6) }); }
  }
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
  plans.push(base('yinxu-river', [{ t: 'shang_river', pts: RIVER.pts }, ...BRIDGES.map((b) => ({ t: 'shang_bridge', a: b.a, b: b.b })), ...landings().map((g, i) => ({ t: 'shang_landing', ...g, seed: i }))]));
  plans.push(base('yinxu-foundry', [{ t: 'shang_foundry' }]));
  plans.push({ ...base('yinxu-people', people()), style: 'life' });
  plans.push({ ...base('yinxu-animals', animals()), style: 'life' });
  plans.push({ ...base('yinxu-carts', carts()), style: 'life' });
  plans.push({ ...base('yinxu-fronts', fronts()), style: 'life' });
  plans.push({ ...base('yinxu-boats', boats()), style: 'life' });
  const K = { court: 'shang_court_house', pits: 'shang_pit_yard', row: 'shang_row_house', workshop: 'shang_workshop' };
  const LOTS = lots();
  for (let i = 0; i < LOTS.length; i += 16) plans.push(base(`yinxu-town-${i / 16}`, LOTS.slice(i, i + 16).map((l) => ({ t: K[l.kind], rect: l.rect, front: l.front, seed: l.seed, open: l.open, trade: l.trade, lod: l.lod }))));
  void FOUNDRY;
  return (CACHE = plans);
}
