// The town and the plaza of Chichén Itzá, dressed (docs/settlements/chichen-itza.md §15): what stands in the house lots
// besides the oval houses — the kitchen shelter, the maize crib, the drying rack, the hammock, the stingless bees' logs,
// firewood, jars, turkeys and a dog — the long stone-footed houses of the better families, the thatched awnings of the
// market, the backstrap loom, the ceiba, the sweat bath at the cenote, the roots and the swallows' nests on the cenote's
// wall; on the plaza the wear of a thousand years (cracks, stains, patches of new plaster, grass in the joints), stelae and
// small altars; the Castillo's weathering. Repeated things are merged per material and laid as instances.

import { box, lathe, place } from '../../core/geom.js';
import { BufferGeometry, Float32BufferAttribute, Matrix4 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { Kit, carved, warriorPanelKit } from './meso.js';
import { hearthKit, ollaKit, metateKit, waterJarKit, bedKit, storeJarKit, put } from './household.js';

const L = 'limestone_maya';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A kit's pieces merged into one geometry per material (kept in the kit's cache), so a thing laid many times costs a few draws. */
const MERGED = new WeakMap();
function merged(kit) {
  if (MERGED.has(kit)) return MERGED.get(kit);
  const out = [];
  for (const [mat, list] of kit.m) {
    const P = [], N = [];
    for (const g0 of list) { const g = g0.index ? g0.toNonIndexed() : g0, p = g.attributes.position.array, n = g.attributes.normal.array; for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(n[i]); } }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3));
    out.push([mat, g]);
  }
  MERGED.set(kit, out);
  return out;
}
/** Lay a kit at (x, y, z), turned by yaw, scaled s, as instances (merged where there are few). */
function lay(bag, kit, x, y, z, yaw = 0, s = 1, reach = 200) {
  const m = new Matrix4().makeRotationY(yaw); if (s !== 1) m.multiply(new Matrix4().makeScale(s, s, s)); m.setPosition(x, y, z);
  for (const [mat, g] of merged(kit)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), m, { reach }); else bag.add(mat, g.clone().applyMatrix4(m)); }
}
const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------------------------------------------- kits
/** The maize crib on four posts: a store of sticks under a pyramid of thatch, 2.2 m across, 2.6 m high. Faces +z. */
const cribKit = () => carved('crib', (k) => {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx('log_pine', sx * 0.8 - 0.06, sx * 0.8 + 0.06, 0, 0.8, sz * 0.55 - 0.06, sz * 0.55 + 0.06);
  k.bx('timber', -0.95, 0.95, 0.8, 0.88, -0.7, 0.7);
  k.bx('timber', -0.85, 0.85, 0.88, 1.7, -0.6, 0.6);
  for (let i = 0; i < 7; i++) { k.bx('log_pine', -0.9, 0.9, 0.92 + i * 0.11, 0.96 + i * 0.11, 0.6, 0.64); k.bx('log_pine', -0.9, 0.9, 0.92 + i * 0.11, 0.96 + i * 0.11, -0.64, -0.6); }
  k.bx('timber', -0.3, 0.3, 0.9, 1.4, 0.6, 0.62);                                              // the little door, a board
  k.fy('thatch_palm', [-1.15, 1.15, -0.9, 0.9], [-0.06, 0.06, -0.06, 0.06], 1.66, 2.65);
});
/** The drying rack: two posts, a beam, strings of maize cobs and of chile hanging; 2.7 m across. Faces +z. */
const rackKit = () => carved('rack', (k) => {
  for (const s of [-1, 1]) k.bx('log_pine', s * 1.25 - 0.05, s * 1.25 + 0.05, 0, 1.95, -0.05, 0.05);
  k.bx('timber', -1.35, 1.35, 1.78, 1.86, -0.05, 0.05); k.bx('timber', -1.35, 1.35, 1.2, 1.26, -0.04, 0.04);
  for (let i = 0; i < 10; i++) {
    const x = -1.08 + i * 0.24, red = i % 4 === 3, y0 = red ? 1.0 : 1.2 - (i % 2) * 0.1;
    k.bx('rope_fibre', x - 0.01, x + 0.01, y0 + 0.1, 1.78, -0.01, 0.01);
    k.bx(red ? 'cloth_red' : 'paint_ochre', x - 0.06, x + 0.06, y0, y0 + 0.5, -0.06, 0.06);
    if (!red) k.bx('cloth_white', x - 0.065, x + 0.065, y0 + 0.4, y0 + 0.52, -0.065, 0.065);       // the husks turned back
  }
});
/** The kitchen: a thatched roof on four posts over the hearth ground, 3.6 × 2.8 m, 3 m to the ridge. Faces +z. */
const shelterKit = () => carved('shelter', (k) => {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.bx('log_pine', sx * 1.6 - 0.07, sx * 1.6 + 0.07, 0, 2.05, sz * 1.2 - 0.07, sz * 1.2 + 0.07);
  k.bx('timber', -1.7, 1.7, 1.98, 2.06, -1.28, -1.12); k.bx('timber', -1.7, 1.7, 1.98, 2.06, 1.12, 1.28);
  k.fy('thatch_palm', [-2.1, 2.1, -1.7, 1.7], [-0.9, 0.9, -0.05, 0.05], 1.95, 3.1);
  k.bx('timber', -1.0, 1.0, 1.55, 1.6, -1.2, -1.15);                                           // a shelf of poles along the back for the pots
});
/** Three logs of the stingless bees (hobon) laid on forked posts, their ends stopped with stone discs. Faces +z. */
const hobonKit = () => carved('hobon', (k) => {
  for (const s of [-1, 1]) { k.bx('log_pine', s * 0.55 - 0.04, s * 0.55 + 0.04, 0, 0.55, -0.04, 0.04); k.seg('log_pine', [s * 0.55, 0.5, 0], [s * 0.5, 0.72, 0.1], 0.03, 0.03); k.seg('log_pine', [s * 0.55, 0.5, 0], [s * 0.6, 0.72, -0.1], 0.03, 0.03); }
  for (const [x, y] of [[0, 0.76], [-0.3, 0.6], [0.3, 0.6]]) { k.seg('bark_dark', [-0.62, y, x * 0.2], [0.62, y, x * 0.2], 0.1, 0.1); k.bx('rubble', 0.6, 0.66, y - 0.07, y + 0.07, x * 0.2 - 0.07, x * 0.2 + 0.07); }
  k.fy('thatch_palm', [-0.8, 0.8, -0.35, 0.35], [-0.6, 0.6, -0.05, 0.05], 1.0, 1.25);        // a little roof over them
  for (const s of [-1, 1]) k.bx('log_pine', s * 0.75 - 0.03, s * 0.75 + 0.03, 0, 1.0, -0.03, 0.03);
});
/** A hammock slung between two posts, its sag in cotton cord and a blanket in it, 3.4 m between the posts. Faces +z. */
const hammockKit = () => carved('hammock', (k) => {
  for (const s of [-1, 1]) k.bx('log_pine', s * 1.75 - 0.07, s * 1.75 + 0.07, 0, 1.6, -0.07, 0.07);
  const N = 9, pt = (i) => { const t = i / N; return [-1.7 + 3.4 * t, 1.45 - 0.62 * 4 * t * (1 - t), 0]; };
  for (let i = 0; i < N; i++) k.seg(i % 3 === 1 ? 'cloth_ochre' : 'cloth_white', pt(i), pt(i + 1), 0.42, 0.015, i === 0 ? 0.04 : 0.42, 0.015);
  k.seg('cloth_red', pt(3), pt(5), 0.4, 0.03);
});
/** The backstrap loom: a post, the warp stretched from a stick at the post to the weaver's belt, a strip of banded cotton on it. Faces +z (the weaver kneels at +z). */
const loomKit = () => carved('loom', (k) => {
  k.bx('log_pine', -0.05, 0.05, 0, 1.3, -0.05, 0.05);
  k.bx('timber', -0.35, 0.35, 0.78, 0.82, -0.06, -0.02); k.bx('timber', -0.35, 0.35, 0.46, 0.5, 0.88, 0.92);
  const bands = ['cloth_white', 'cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_white'];
  bands.forEach((m, i) => { const x = -0.3 + i * 0.1; k.seg(m, [x, 0.8, -0.04], [x, 0.48, 0.9], 0.045, 0.006); });
  k.bx('rope_fibre', -0.3, 0.3, 0.44, 0.47, 0.9, 1.0);                                          // the strap
  k.bx('cloth_white', 0.4, 0.8, 0, 0.05, 0.1, 0.5);                                             // a folded finished cloth beside
});
/** A ladle censer: a shallow dish of fired clay on a hollow foot, a handle shaped as a serpent's head. */
const censerKit = () => carved('censer', (k) => {
  k.geo('terracotta', lathe([[0.001, 0], [0.1, 0], [0.1, 0.07], [0.19, 0.11], [0.22, 0.16], [0.18, 0.17], [0.001, 0.1]], 12));
  k.seg('terracotta', [0.2, 0.14, 0], [0.55, 0.12, 0], 0.035, 0.03); k.bx('stucco_red', 0.55, 0.62, 0.1, 0.17, -0.04, 0.04);
  k.geo('flame', lathe([[0.001, 0.12], [0.1, 0.13], [0.001, 0.2]], 8));                        // the copal burning
});
/** A stela: a drum base and a slab 0.38 m thick, 3.2 m high, a warrior carved on its face, a red top. Faces +z. */
const stelaKit = (v) => carved(`stela:${v}`, (k) => {
  k.geo(L, lathe([[0.001, 0], [0.8, 0], [0.8, 0.45], [0.6, 0.5], [0.001, 0.5]], 14));
  k.bx(L, -0.5, 0.5, 0.5, 3.2, -0.19, 0.19);
  k.bx(L, -0.43, 0.43, 3.2, 3.3, -0.14, 0.14);
  k.bx('stucco_red', -0.5, 0.5, 2.95, 3.0, 0.19, 0.2); k.bx('stucco_red', -0.5, 0.5, 0.9, 0.95, 0.19, 0.2);
  warriorPanelKit().emit({ add: (m, g) => k.geo(m, g) }, 0, 0.92, 0.2, 0, 1, 0.78);
  if (v) k.bx('maya_blue', -0.4, 0.4, 3.0, 3.2, 0.19, 0.2);
});

// ------------------------------------------------------------------------------------------------------------ the lots
/**
 * maya_yard: the things of a house lot { rect, keep: [{ c, r }] (where the houses stand), gate, seed, level (1 full … 0.3) }:
 * along the walls, clear of the houses and the gateway, a kitchen (a thatched shelter with its hearth, the metate and a
 * woman grinding), a crib or two, a drying rack, a hammock, the logs of the stingless bees, firewood, water jars, turkeys, a dog.
 */
function mayaYard(el, ctx) {
  const { bag, col } = ctx, L2 = STYLES.life.elements, rand = rng(el.seed >>> 0), [x0, z0, x1, z1] = el.rect, level = el.level ?? 1;
  const mid = [(x0 + x1) / 2, (z0 + z1) / 2], gate = [[mid[0], z0], [x1, mid[1]], [mid[0], z1], [x0, mid[1]]][el.gate];
  const placed = [];
  const free = (x, z, r) => !el.keep.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.r + r) && Math.hypot(gate[0] - x, gate[1] - z) > 4.5 + r && x > x0 + r + 0.5 && x < x1 - r - 0.5 && z > z0 + r + 0.5 && z < z1 - r - 0.5 && !placed.some((p) => Math.hypot(p[0] - x, p[1] - z) < p[2] + r);
  const spot = (r, tries = 24) => {
    for (let i = 0; i < tries; i++) {
      const u = rand(), side = Math.floor(rand() * 4), off = r + 0.7 + rand() * 4;
      const x = side < 2 ? x0 + 2 + u * (x1 - x0 - 4) : side === 2 ? x0 + off : x1 - off, z = side < 2 ? (side ? z1 - off : z0 + off) : z0 + 2 + u * (z1 - z0 - 4);
      if (free(x, z, r)) { placed.push([x, z, r]); return { x, z, face: side < 2 ? (side ? -Math.PI / 2 : Math.PI / 2) : (side === 2 ? 0 : Math.PI), side }; }
    }
    return null;
  };
  const gy = el.y ?? 0, Y = (x, z) => (el.h ? el.h(x, z) : gy);
  const yawToward = (side) => [Math.PI, 0, -Math.PI / 2, Math.PI / 2][side] ?? 0;         // the kit's +z toward the lot's middle
  // the kitchen
  if (rand() < 0.75 * Math.min(1, level + 0.3)) {
    const s = spot(2.6);
    if (s) {
      const yaw = yawToward(s.side), y = Y(s.x, s.z);
      lay(bag, shelterKit(), s.x, y, s.z, yaw);
      for (const [dx, dz] of [[1.6, 1.2], [-1.6, 1.2], [1.6, -1.2], [-1.6, -1.2]]) { const c = Math.cos(yaw), sn = Math.sin(yaw); col.circle(s.x + dx * c + dz * sn, s.z - dx * sn + dz * c, 0.12, y, y + 2); }
      const f = (dx, dz) => { const c = Math.cos(yaw), sn = Math.sin(yaw); return [s.x + dx * c + dz * sn, s.z - dx * sn + dz * c]; };
      let p = f(-0.5, -0.1); put(bag, hearthKit('rubble'), p[0], y, p[1], 0); col.circle(p[0], p[1], 0.45, y, y + 0.3);
      p = f(0.5, -0.6); put(bag, ollaKit(), p[0], y, p[1], 0); p = f(-1.2, -0.7); put(bag, waterJarKit(), p[0], y, p[1], 0); col.circle(p[0], p[1], 0.33, y, y + 0.8);
      p = f(0.9, 0.5); put(bag, metateKit(), p[0], y, p[1], yaw + Math.PI);
      if (level > 0.5 && rand() < 0.8) { p = f(0.9, 1.0); L2.figure({ at: p, y, rot: yaw + Math.PI, seed: Math.floor(rand() * 1e9), pose: 'kneel', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', skin: 'skin_dark', hair: rand() < 0.5 ? 'bun' : 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx); }
    }
  }
  const want = Math.round((2 + 4 * level) * (0.8 + rand() * 0.4));
  const kinds = ['crib', 'rack', 'wood', 'jars', 'turkey', 'hammock', 'hobon', 'crib', 'dog', 'wood', 'jars', 'loom'];
  for (let i = 0; i < want; i++) {
    const kind = kinds[Math.floor(rand() * kinds.length)];
    const r = { crib: 1.6, rack: 1.5, wood: 1.1, jars: 0.9, turkey: 1.1, hammock: 2.1, hobon: 1.0, dog: 0.6, loom: 1.3 }[kind], s = spot(r);
    if (!s) continue;
    const y = Y(s.x, s.z), yaw = yawToward(s.side) + (rand() - 0.5) * 0.3, seed = Math.floor(rand() * 1e6);
    if (kind === 'crib') { lay(bag, cribKit(), s.x, y, s.z, yaw); for (const [dx, dz] of [[0.8, 0.55], [-0.8, 0.55], [0.8, -0.55], [-0.8, -0.55]]) col.circle(s.x + dx, s.z + dz, 0.12, y, y + 1); }
    else if (kind === 'rack') { lay(bag, rackKit(), s.x, y, s.z, yaw); col.circle(s.x, s.z, 0.5, y, y + 1.9); }
    else if (kind === 'hobon') { lay(bag, hobonKit(), s.x, y, s.z, yaw); col.circle(s.x, s.z, 0.6, y, y + 1); }
    else if (kind === 'hammock') { lay(bag, hammockKit(), s.x, y, s.z, yaw + Math.PI / 2 * (rand() < 0.5 ? 0 : 1)); }
    else if (kind === 'wood') L2.firewood({ at: [s.x, s.z], y, rot: s.face, seed, len: 1.4 }, ctx);
    else if (kind === 'jars') { L2.pot({ at: [s.x, s.z], y, kind: rand() < 0.5 ? 'water_pot' : 'dark_pot', n: 2 + Math.floor(rand() * 3), seed }, ctx); }
    else if (kind === 'turkey') L2.chickens({ at: [s.x, s.z], y, kind: 'turkey', n: 3 + Math.floor(rand() * 3), rot: rand() * TAU, seed }, ctx);
    else if (kind === 'dog') L2.animal({ at: [s.x, s.z], y, kind: 'dog', rot: rand() * TAU, seed }, ctx);
    else if (kind === 'loom') {
      lay(bag, loomKit(), s.x, y, s.z, yaw);
      const c = Math.cos(yaw), sn = Math.sin(yaw), px = s.x + 1.05 * sn, pz = s.z + 1.05 * c;
      L2.figure({ at: [px, pz], y, rot: yaw + Math.PI, seed, pose: 'kneel', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', skin: 'skin_dark', hair: 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx);
    }
  }
  // a water jar and a basket at the gate's inner side
  if (level > 0.5) { const gx = gate[0] + (mid[0] - gate[0]) * 0.1, gz = gate[1] + (mid[1] - gate[1]) * 0.1, ox = el.gate % 2 ? 0 : 3.4, oz = el.gate % 2 ? 3.4 : 0; if (free(gx + ox, gz + oz, 0.5)) L2.pot({ at: [gx + ox, gz + oz], y: Y(gx + ox, gz + oz), kind: 'water_pot', n: 1, seed: el.seed }, ctx); }
}

/**
 * maya_range: the long house of a better family { c, a (half-length), b (half-width), rot (0, 90, 180, 270 deg: the front toward +z at 0), seed }:
 * a rubble platform 0.9 m high with its stair, a room of stone and plaster with three doors in front, its flat roof of beams and
 * plaster under a painted band, inside a masonry bench along the back with mats and blankets, jars, a hearth outside the door.
 */
function mayaRange(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed >>> 0), [cx, cz] = el.c, a = el.a, b = el.b, rot = el.rot ?? 0, y0 = el.y ?? 0, c = Math.cos(rot), sn = Math.sin(rot);
  const W = (u, v) => [cx + u * c + v * sn, cz - u * sn + v * c];      // local (u along the long side, v toward the front) to world
  const piece = (mat, u0, u1, v0, v1, ya, yb) => { const g = box(Math.min(u0, u1), ya, Math.min(v0, v1), Math.max(u0, u1), yb, Math.max(v0, v1)); place(g, cx, 0, cz, rot); bag.add(mat, g); };
  const F = y0 + 0.9, wt = 0.55, H = 2.9, ib = b - wt, ia = a - wt;
  piece('rubble', -a - 1.2, a + 1.2, -b - 1.2, b + 2.6, y0 - 0.2, F);
  piece('limestone', -a - 1.3, a + 1.3, b + 2.5, b + 2.7, F - 0.04, F + 0.04);                       // the lip
  // the platform's stair at the front, walked
  piece('rubble', -2, 2, b + 2.6, b + 3.9, y0 - 0.2, y0 + 0.3); piece('rubble', -2, 2, b + 2.6, b + 3.3, y0 - 0.2, y0 + 0.6);
  col.ramp(rotRect(c, sn, cx, cz, -2, b + 2.6, 2, b + 4.0), y0, F, Math.abs(sn) > 0.5 ? (-sn > 0 ? 'e' : 'w') : (-c > 0 ? 's' : 'n'));
  const plat = rotRect(c, sn, cx, cz, -a - 1.2, -b - 1.2, a + 1.2, b + 2.6);
  col.rect(plat, y0 - 0.2, F - 0.31); col.floor(plat, F);
  // walls: the back, the two ends, the front in four pieces round three doors
  const wall = (u0, u1, v0, v1, mat = 'stucco') => { piece(mat, u0, u1, v0, v1, F, F + H); const p = W((u0 + u1) / 2, (v0 + v1) / 2), r = rotRect(c, sn, cx, cz, u0, v0, u1, v1); col.rect(r, F, F + H); void p; };
  wall(-a, a, -b, -b + wt); wall(-a, -a + wt, -b, b); wall(a - wt, a, -b, b);
  const dw = 1.1, doors = [-a * 0.62, 0, a * 0.62];
  let u = -a;
  for (const d of doors) { wall(u, d - dw / 2, b - wt, b); u = d + dw / 2; }
  wall(u, a, b - wt, b);
  for (const d of doors) piece('timber', d - dw / 2 - 0.1, d + dw / 2 + 0.1, b - wt - 0.05, b + 0.05, F + 2.05, F + 2.3);     // the lintels
  // the roof of beams and plaster, its painted band, the cornice
  piece('limestone_core', -a - 0.3, a + 0.3, -b - 0.3, b + 0.5, F + 2.3, F + H + 0.25);
  piece('stucco_red', -a - 0.35, a + 0.35, -b - 0.35, b + 0.55, F + H - 0.35, F + H - 0.05);
  piece('maya_blue', -a - 0.37, a + 0.37, b + 0.5, b + 0.57, F + H - 0.3, F + H - 0.1);
  col.floor(rotRect(c, sn, cx, cz, -a - 0.3, -b - 0.3, a + 0.3, b + 0.5), F + H + 0.25);
  // inside: the masonry bench along the back with mats, jars, a hearth stone, a woman sitting
  piece('stucco', -ia + 0.3, ia - 0.3, -ib, -ib + 0.95, F, F + 0.5); col.rect(rotRect(c, sn, cx, cz, -ia + 0.3, -ib, ia - 0.3, -ib + 0.95), F, F + 0.5);
  for (const [uu, cl] of [[-ia * 0.55, 'cloth_white'], [ia * 0.1, 'cloth_ochre'], [ia * 0.62, 'cloth_white']]) {
    const [bx, bz] = W(uu, -ib + 0.5); put(bag, bedKit(cl, 'cloth_red'), bx, F + 0.5, bz, rot + Math.PI / 2 * 0);
  }
  for (const uu of [-ia + 0.9, ia - 0.9]) { const [jx, jz] = W(uu, -ib + 1.4); put(bag, storeJarKit(), jx, F, jz, 0); col.circle(jx, jz, 0.28, F, F + 0.6); }
  { const [wx, wz] = W(ia * 0.35, -ib + 1.6); put(bag, waterJarKit(), wx, F, wz, 0); col.circle(wx, wz, 0.33, F, F + 0.8); }
  if (rand() < 0.7) { const [hx, hz] = W(a + 0.6, b + 0.4); put(bag, hearthKit('rubble'), hx, F, hz, 0); col.circle(hx, hz, 0.45, F, F + 0.3); }
  { const [lx, lz] = W(0, 0); ctx.lights?.push({ at: [lx, F + 1.7, lz], color: '#ffb46b', intensity: 2.4, distance: 7 }); }      // a lamp of resinous wood (a torch of ocote) lights the long room
  const L2 = STYLES.life.elements;
  if (rand() < 0.6) { const [px, pz] = W(-ia * 0.2, -ib + 1.3); L2.figure({ at: [px, pz], y: F, rot: rot, seed: Math.floor(rand() * 1e9), pose: 'sit_ground', dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', skin: 'skin_dark', hair: 'bun', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx); }
}
/** The axis-aligned rectangle covering a rotated local rectangle (for the collision floors and blocks). */
function rotRect(c, sn, cx, cz, u0, v0, u1, v1) {
  const P = [[u0, v0], [u1, v0], [u0, v1], [u1, v1]].map(([u, v]) => [cx + u * c + v * sn, cz - u * sn + v * c]);
  return [Math.min(...P.map((p) => p[0])), Math.min(...P.map((p) => p[1])), Math.max(...P.map((p) => p[0])), Math.max(...P.map((p) => p[1]))];
}

// ----------------------------------------------------------------------------------------------------------- the market
/** maya_awning: a roof of palm thatch on poles over a stretch of the market { rect [x0, z0, x1, z1], y, h (front eave, default 2.1) }, sloping to the back (−z). */
function mayaAwning(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, hf = el.h ?? 2.2, hb = hf + 0.7, k = new Kit();
  k.hex('thatch_palm', [[x0, hf, z1 + 0.2], [x1, hf, z1 + 0.2], [x1, hb, z0 - 0.2], [x0, hb, z0 - 0.2], [x0, hf + 0.18, z1 + 0.2], [x1, hf + 0.18, z1 + 0.2], [x1, hb + 0.18, z0 - 0.2], [x0, hb + 0.18, z0 - 0.2]]);
  k.hex('rope_fibre', [[x0, hf - 0.1, z1 + 0.2], [x1, hf - 0.1, z1 + 0.2], [x1, hb - 0.1, z0 - 0.2], [x0, hb - 0.1, z0 - 0.2], [x0, hf, z1 + 0.2], [x1, hf, z1 + 0.2], [x1, hb, z0 - 0.2], [x0, hb, z0 - 0.2]]);
  const n = Math.max(2, Math.round((x1 - x0) / 3.2));
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n;
    k.bx('log_pine', x - 0.06, x + 0.06, 0, hf - 0.05, z1 - 0.06, z1 + 0.06); k.bx('log_pine', x - 0.06, x + 0.06, 0, hb - 0.05, z0 - 0.06, z0 + 0.06);
    col.circle(x, z1, 0.1, y, y + hf); col.circle(x, z0, 0.1, y, y + hb);
  }
  for (const [mat, list] of k.m) for (const gg of list) bag.add(mat, place(gg.clone(), 0, y, 0, 0));
}

// ------------------------------------------------------------------------------------------------------------ the plaza
/**
 * plaza_wear: a thousand years on the plaza's paving { rect, seed, skip: [rects], n }: darker stains of damp and soot,
 * lighter patches of new plaster over old, hair-cracks, grass and weeds in the joints and along the foot of the platforms.
 */
function plazaWear(el, { bag }) {
  const rand = rng(el.seed >>> 0), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0.04, skip = el.skip ?? [], n = el.n ?? 140;
  const ok = (x, z, m = 0) => !skip.some((r) => x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m);
  const at = () => [x0 + rand() * (x1 - x0), z0 + rand() * (z1 - z0)];
  for (let i = 0; i < n; i++) {                                                                             // patches
    const [x, z] = at(); if (!ok(x, z)) continue;
    const w = 0.8 + rand() * 3.2, d = 0.6 + rand() * 2.4, dark = rand() < 0.55, g = box(-w / 2, 0, -d / 2, w / 2, 0.006 + rand() * 0.004, d / 2); g.rotateY(rand() * Math.PI);
    bag.add(dark ? (rand() < 0.5 ? 'plaster_grey' : 'plaster_damp') : 'plaster_white', g.translate(x, y + 0.004, z));
  }
  for (let i = 0; i < n * 0.8; i++) {                                                                       // cracks
    let [x, z] = at(); if (!ok(x, z)) continue;
    let a = rand() * Math.PI;
    for (let s = 0, m = 3 + Math.floor(rand() * 4); s < m; s++) {
      const len = 0.5 + rand() * 1.1, g = box(-len / 2, 0, -0.012, len / 2, 0.012, 0.012); g.rotateY(a);
      bag.add('bark_dark', g.translate(x + Math.cos(a) * len / 2, y + 0.004, z - Math.sin(a) * len / 2)); x += Math.cos(a) * len; z -= Math.sin(a) * len; a += (rand() - 0.5) * 1.2;
    }
  }
  for (let i = 0; i < n * 0.9; i++) {                                                                       // tufts in the joints
    const [x, z] = at(); if (!ok(x, z)) continue;
    for (let j = 0, m = 4 + Math.floor(rand() * 5); j < m; j++) {
      const a = rand() * TAU, r = rand() * 0.14, hgt = 0.1 + rand() * 0.22, g = box(-0.012, 0, -0.012, 0.012, hgt, 0.012);
      g.rotateZ((rand() - 0.5) * 0.7); g.rotateY(a); bag.add(j % 4 ? 'clay_green' : 'ichu', g.translate(x + Math.cos(a) * r, y, z + Math.sin(a) * r));
    }
  }
}

/** maya_stela: a carved stela { at, y, rot, v }. */
function mayaStela(el, { bag, col }) {
  lay(bag, stelaKit(el.v ?? 0), el.at[0], el.y ?? 0, el.at[1], el.rot ?? 0, el.s ?? 1);
  col.circle(el.at[0], el.at[1], 0.8, el.y ?? 0, (el.y ?? 0) + 3.3);
}
/** maya_shrine: a small altar platform with steps on one side and a censer on its top { at, y, rot, a (half-size) }. */
function mayaShrine(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.a ?? 1.7, rot = el.rot ?? 0, k = new Kit();
  k.fy(L, [-a - 0.3, a + 0.3, -a - 0.3, a + 0.3], [-a, a, -a, a], 0, 0.55);
  k.bx('stucco_red', -a, a, 0.55, 0.62, -a, a);
  k.bx(L, -a * 0.5, a * 0.5, 0.62, 0.95, -a * 0.35, a * 0.35);
  k.fy(L, [-0.9, 0.9, a + 0.3, a + 1.3], [-0.9, 0.9, a, a + 0.3], 0, 0.3);
  k.bx('stucco_red', -a * 0.5, a * 0.5, 0.9, 0.95, -a * 0.35, a * 0.35);
  lay(bag, k, x, y, z, rot);
  lay(bag, censerKit(), x + Math.sin(rot) * 0 - 0.4, y + 0.95, z, rot + 1);
  const m = rotRect(Math.cos(rot), Math.sin(rot), x, z, -a - 0.3, -a - 0.3, a + 0.3, a + 0.3);
  col.rect(m, y, y + 0.55); col.floor(m, y + 0.62);
}
/** maya_ceiba: the ceiba (yaxche), the world tree: a buttressed trunk and a wide flat crown { at, y, s, seed }; about 24 m at s = 1. */
function mayaCeiba(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, s = el.s ?? 1, rand = rng((el.seed ?? 1) >>> 0), k = new Kit();
  const bt = (th, i, r) => (i < 3 ? 1 + 0.9 * Math.pow(Math.abs(Math.cos(th * 2.5 + (el.seed ?? 0))), 2.5) * (1 - i / 3) : 1);
  k.geo('bark_grey', lathe([[0.001, 0], [2.4, 0], [1.1, 1.2], [0.85, 3], [0.7, 8], [0.62, 14], [0.001, 15]], 18, bt));
  const crown = (r0, y0, t) => k.geo('clay_green', lathe([[0.001, y0], [r0 * 0.7, y0 - 0.5], [r0, y0 + 0.4], [r0 * 0.85, y0 + t], [r0 * 0.4, y0 + t * 1.2], [0.001, y0 + t * 1.05]], 14, (th) => 0.85 + 0.15 * Math.sin(th * 3 + rand() * 6)));
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + rand(), r = 4.5 + rand() * 2.5; k.seg('bark_grey', [0, 13 + rand() * 2, 0], [Math.cos(a) * r, 15.5 + rand() * 2, Math.sin(a) * r], 0.28, 0.28, 0.14, 0.14); }
  crown(8.5, 16, 3.4); crown(5.5, 19.2, 3); crown(6.5, 15.5, 2.2);
  for (let i = 0; i < 4; i++) { const a = i * 1.57 + 0.4 + rand() * 0.4; k.geo('clay_green', lathe([[0.001, 16.2], [4.5, 15.8], [5.2, 17.2], [0.001, 18.2]], 10).translate(Math.cos(a) * 6.5, 0, Math.sin(a) * 6.5)); }
  lay(bag, k, x, y, z, rand() * TAU, s, 420);
  col.circle(x, z, 1.4 * s, y, y + 15 * s);
}

// ------------------------------------------------------------------------------------------------------------ the cenote
/**
 * maya_cenote_life: on the Sacred Cenote's wall { c, r, h (the ground's height), water, seed }: roots of the figs and
 * lianas hanging from the rim down the wall, shrubs on the lip, and the clay-cup nests of the swallows in rows on the face.
 */
function cenoteLife(el, { bag }) {
  const rand = rng(el.seed >>> 0), [cx, cz] = el.c, R = el.r, H = el.h;
  // the wall's radius at height y: the ground falls toward the middle, so bisect
  const wallR = (th, y) => { let lo = R - 6, hi = R + 2; for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2; (H(cx + Math.cos(th) * m, cz + Math.sin(th) * m) > y ? (hi = m) : (lo = m)); } return (lo + hi) / 2; };
  const top = (th) => H(cx + Math.cos(th) * (R + 1.5), cz + Math.sin(th) * (R + 1.5));
  const k = new Kit();
  for (let i = 0; i < 90; i++) {                                                                            // roots and lianas
    const th = rand() * TAU, y1 = top(th) - 0.3, len = 5 + rand() * (el.water ? Math.min(18, y1 - el.water + 1.5) : 12), w0 = 0.04 + rand() * 0.09, n = 5;
    let prev = null;
    for (let s = 0; s <= n; s++) {
      const y = y1 - len * s / n, rr = wallR(th + Math.sin(s * 1.7 + i) * 0.01, y) - 0.12 - rand() * 0.18, p = [cx + Math.cos(th) * rr, y, cz + Math.sin(th) * rr];
      if (prev) k.seg(rand() < 0.2 ? 'cloth_green' : 'bark_dark', prev, p, w0 * (1 - 0.5 * s / n), w0 * (1 - 0.5 * s / n), w0 * (1 - 0.5 * (s + 1) / n), w0 * (1 - 0.5 * (s + 1) / n));
      prev = p;
    }
  }
  for (let i = 0; i < 70; i++) {                                                                            // swallows' nests
    const th = rand() * TAU, y = top(th) - 2 - rand() * 14; if (el.water && y < el.water + 1.5) continue;
    const rr = wallR(th, y) - 0.05, a = th + Math.PI;
    for (let j = 0, m = 2 + Math.floor(rand() * 4); j < m; j++) {
      const t2 = th + (rand() - 0.5) * 0.02, yy = y + (rand() - 0.5) * 0.6, r2 = wallR(t2, yy) - 0.04;
      k.geo('mud_plaster', lathe([[0.001, 0], [0.11, 0], [0.12, 0.08], [0.08, 0.13], [0.001, 0.13]], 7).rotateX(Math.PI / 2).rotateY(-t2 + Math.PI / 2).translate(cx + Math.cos(t2) * r2, yy, cz + Math.sin(t2) * r2));
    }
    void a;
  }
  for (const [mat, g] of merged(k)) bag.add(mat, g.clone());
}
/** maya_sweatbath: the steam bath (temazcal) { at, y, rot }: a low stone room under a mound of earth, its crawl-door, the firebox outside with firewood and stones, a water jar. */
function mayaSweatbath(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), sn = Math.sin(rot), k = new Kit(), A = 2.1, T = 0.7, H = 1.9;
  const W = (u, v) => [cx + u * c + v * sn, cz - u * sn + v * c];
  const wall = (u0, v0, u1, v1, y0 = 0, y1 = H) => { k.bx('rubble', u0, u1, y0, y1, v0, v1); if (y0 === 0) col.rect(rotRect(c, sn, cx, cz, u0, v0, u1, v1), y, y + y1); };
  wall(-A, -A, A, -A + T); wall(-A, -A, -A + T, A); wall(A - T, -A, A, A);
  wall(-A, A - T, -0.45, A); wall(0.45, A - T, A, A); wall(-0.45, A - T, 0.45, A, 1.0, H);          // the low door, 1 m high
  k.fy('sod', [-A - 0.3, A + 0.3, -A - 0.3, A + 0.3], [-1.0, 1.0, -1.0, 1.0], H - 0.05, H + 1.0);
  k.bx('rubble', -0.4, 0.4, 0, 0.5, -0.4, 0.4); k.bx('basalt', -0.3, 0.3, 0.5, 0.62, -0.3, 0.3);  // the stones in the middle
  k.bx('stucco', -A + T, A - T, 0, 0.45, -A + T, -A + T + 0.6);                                     // the bench along the back
  k.bx('rubble', -0.7, 0.7, 0, 0.7, A + 0.8, A + 1.8); k.bx('basalt', -0.5, 0.5, 0.7, 0.82, A + 1.0, A + 1.6);  // the firebox outside
  lay(bag, k, cx, y, cz, rot);
  col.floor(rotRect(c, sn, cx, cz, -A, -A, A, A), y + H + 0.9);
  void W;
}

// ------------------------------------------------------------------------------------------------------------ weather
/** maya_weather: the streaks of damp and the grass on a stepped pyramid { c, base, top, h, tiers, stairW, seed, stairs }: dark runs below each moulding, tufts on the ledges. */
function mayaWeather(el, { bag }) {
  const [cx, cz] = el.c, n = el.tiers, H = el.h, A0 = el.base, A1 = el.top, th = H / n, rand = rng(el.seed >>> 0), sw = (el.stairW ?? 8.8) / 2 + 1.5;
  const k = new Kit(), tuft = new Kit();
  for (let t = 0; t < n; t++) {
    const a0 = A0 - (A0 - A1) * t / n, a1 = A0 - (A0 - A1) * (t + 1) / n, y0 = t * th, step = a0 - a1, ap = a0 - step * 0.42, d = ap - step * 0.04 + 0.03;
    for (const [fx, fz] of [[0, -1], [0, 1], [1, 0], [-1, 0]]) for (let i = 0; i < 6; i++) {
      const cellw = (2 * ap - 1.6) / 6, u = -ap + 0.8 + (i + 0.2 + rand() * 0.6) * cellw; if (Math.abs(u) < sw) continue;
      const w = 0.1 + rand() * Math.min(0.3, cellw * 0.25), len = th * (0.2 + rand() * 0.28), top = y0 + th * 0.9 - rand() * th * 0.05;
      const o = rand() * 0.04, [x0, x1, z0, z1] = fz ? [u - w, u + w, fz * (d + o), fz * (d + o + 0.012)] : [fx * (d + o), fx * (d + o + 0.012), u - w, u + w];
      k.bx(rand() < 0.65 ? 'plaster_damp' : 'bark_grey', Math.min(x0, x1), Math.max(x0, x1), top - len, top, Math.min(z0, z1), Math.max(z0, z1));
    }
    for (let i = 0; i < 6; i++) {                                                                           // grass and weeds on the ledge
      const f = Math.floor(rand() * 4), [fx, fz] = [[0, -1], [0, 1], [1, 0], [-1, 0]][f], u = (rand() * 2 - 1) * (a0 - 1.5), dd = ap + step * 0.1 + rand() * step * 0.2;
      if (Math.abs(u) < sw) continue;
      for (let j = 0; j < 5; j++) { const q = (rand() - 0.5) * 0.3, h2 = 0.2 + rand() * 0.35, x = fz ? u + q : fx * dd, z = fz ? fz * dd : u + q; tuft.bx(j % 3 ? 'clay_green' : 'ichu', x - 0.02, x + 0.02, y0 + th - 0.02, y0 + th + h2, z - 0.02, z + 0.02); }
    }
  }
  const put2 = (kk, reach) => { for (const [mat, g] of merged(kk)) bag.add(mat, place(g.clone(), cx, 0, cz, 0)); void reach; };
  put2(k, 120); put2(tuft, 60);
}

/** sacbe_edge: kerb stones along the white road's two sides, weeds in its joints, and a shrine by the way { a, b, w, seed }. */
function sacbeEdge(el, { bag }) {
  const rand = rng(el.seed >>> 0), [ax, az] = el.a, [bx, bz] = el.b, w = el.w, k = new Kit(), len = Math.abs(bz - az);
  for (const s of [-1, 1]) for (let z = Math.min(az, bz) + 1; z < Math.max(az, bz) - 1; z += 1.7) {
    const lz = 1.2 + rand() * 0.5, x = ax + s * (w / 2 + 0.08);
    k.bx(L, x - 0.22, x + 0.22, 0.78, 0.9 + rand() * 0.06, z, z + lz);
    if (rand() < 0.35) for (let j = 0; j < 4; j++) k.bx('clay_green', x - 0.2 + j * 0.1, x - 0.17 + j * 0.1, 0.9, 1.0 + rand() * 0.2, z + rand(), z + rand() + 0.02);
  }
  for (let i = 0; i < len * 0.9; i++) { const x = ax + (rand() - 0.5) * (w - 0.6), z = Math.min(az, bz) + rand() * len; k.bx(rand() < 0.5 ? 'plaster_damp' : 'plaster_grey', x - 0.4, x + 0.4, 0.8, 0.806, z - 0.5, z + 0.5); }
  for (const [mat, g] of merged(k)) bag.add(mat, g.clone());
}


/**
 * plaza_marks { rect, ring: [x0, z0, x1, z1], skip, y }: the painted bands of the Great Plaza [inferred: the plaster floors were painted and
 * renewed]: a red band round the Castillo's apron, a thin blue-green line a metre outside it, and the worn way (a darker, trodden strip of
 * plaster) from the south edge to the stair's foot; 2.5 cm proud of the plaster.
 */
function plazaMarks(el, { bag }) {
  const [a0, b0, a1, b1] = el.ring, y = el.y ?? 0.04, h = 0.025, skip = el.skip ?? [];
  const ok = (x0, z0, x1, z1) => !skip.some((r) => (x0 + x1) / 2 > r[0] && (x0 + x1) / 2 < r[2] && (z0 + z1) / 2 > r[1] && (z0 + z1) / 2 < r[3]);
  const band = (mat, x0, z0, x1, z1) => { if (ok(x0, z0, x1, z1)) bag.add(mat, box(x0, y, z0, x1, y + h, z1)); };
  const ring = (mat, m, w) => {
    const r = [a0 - m, b0 - m, a1 + m, b1 + m];
    for (let x = r[0]; x < r[2]; x += 6) { band(mat, x, r[1], Math.min(r[2], x + 6), r[1] + w); band(mat, x, r[3] - w, Math.min(r[2], x + 6), r[3]); }
    for (let z = r[1]; z < r[3]; z += 6) { band(mat, r[0], z, r[0] + w, Math.min(r[3], z + 6)); band(mat, r[2] - w, z, r[2], Math.min(r[3], z + 6)); }
  };
  ring('stucco_red', 0, 0.55); ring('maya_blue', 1.2, 0.18);
  if (!el.noWay) for (let z = b1 + 2; z < (el.rect ? el.rect[3] - 4 : b1 + 70); z += 5) band('plaster_grey', -1.8 + 0.3 * Math.sin(z * 0.2), z, 1.8 + 0.3 * Math.sin(z * 0.2), z + 5.2);
  // trodden ways [[x0, z0, x1, z1]] (the long side runs along the way): a darker strip worn in the plaster
  for (const [x0, z0, x1, z1] of el.ways ?? []) {
    if (x1 - x0 > z1 - z0) for (let x = x0; x < x1; x += 5) band('plaster_grey', x, z0 + 0.3 * Math.sin(x * 0.2), Math.min(x1, x + 5.2), z1 + 0.3 * Math.sin(x * 0.2));
    else for (let z = z0; z < z1; z += 5) band('plaster_grey', x0 + 0.3 * Math.sin(z * 0.2), z, x1 + 0.3 * Math.sin(z * 0.2), Math.min(z1, z + 5.2));
  }
}

export const mayaTownElements = { plaza_marks: plazaMarks, maya_yard: mayaYard, maya_range: mayaRange, maya_awning: mayaAwning, plaza_wear: plazaWear, maya_stela: mayaStela, maya_shrine: mayaShrine, maya_ceiba: mayaCeiba, maya_cenote_life: cenoteLife, maya_sweatbath: mayaSweatbath, maya_weather: mayaWeather, sacbe_edge: sacbeEdge };
