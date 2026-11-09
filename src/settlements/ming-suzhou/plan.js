// The Humble Administrator's Garden (Zhuozheng Yuan) and its owner's residence, as Wang Xianchen
// laid it out from 1509 and Wen Zhengming painted it in 1533: a pond filling a third of the garden,
// islands with their hills, halls and pavilions round the water, galleries along the white walls,
// zigzag stone bridges, Taihu rock on the shores (docs/settlements/ming-suzhou.md §4). South of
// the garden, the residence: a gate hall on the street, a sedan-chair hall, the main hall and the
// two-storey women's building behind, in courtyards on one axis.

import { PLACED } from '../../planet/layout.js';
import {
  LEVEL, GARDEN, RESIDENCE, POND, ISLANDS, MOUNDS, BUILDINGS, GALLERIES, GARDEN_BRIDGES, LOQUAT_COURT, ROCK_PATHS, pondDistance, inRect, nearRockPath,
} from './layout.js';
import { ground } from './ground.js';

void PLACED; void MOUNDS;
const G = LEVEL.garden;
const E = [];
const H = (x, z) => ground.height(x, z);

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rand = rng(1509);

// ── the pond: its water, its stone edge, the rock along its shores, the lotus ─
E.push({ t: 'water_cells', rect: [GARDEN[0], GARDEN[1], GARDEN[2], GARDEN[3]], y: LEVEL.pond, cell: 0.5, inside: (x, z) => pondDistance(x, z) < -0.05 });
const TAU = Math.PI * 2;
function segDist(x, z, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (z - a[1]) * vz) / l2));
  return Math.hypot(x - a[0] - vx * t, z - a[1] - vz * t);
}
const polyDist = (x, z, pts) => { let d = Infinity; for (let i = 0; i + 1 < pts.length; i++) d = Math.min(d, segDist(x, z, pts[i], pts[i + 1])); return d; };
const nearBridge = (x, z, m) => GARDEN_BRIDGES.some((b) => polyDist(x, z, b.pts) < m);
const nearBuilding = (x, z, m) => Object.values(BUILDINGS).some((b) => (b.rect ? inRect(b.rect, x, z, m) : Math.hypot(x - b.c[0], z - b.c[1]) < (b.r || b.w / 2) + m));
// the garden's paths (pebble mosaic) — the first of them leaves the court before the Hall of Distant Fragrance
const PATHS = [
  [[14, 23], [8, 14], [0, 8], [-1.7, 0.5]],                            // from the garden gate to the hall's court
  [[-9.45, -7.4], [-12, -8], [-20, -11.8]],                             // to the Leaning Jade
  [[9.45, -3.4], [16, -2], [26, -4], [30, -2.5]],                       // east to the loquat court's moon gate
  [[-22, -19], [-26, -21], [-28, -23]],                                  // to the bridge for the Lotus Breeze islet
  [[-38, 2], [-42, 3.5]],
  [[-58, 14], [-48, 10], [-44, 7.6]],
  [[48, -30], [54, -38], [56, -40.5]],                                   // to the Wutong and Bamboo Retreat
  [[45, -57], [52, -62], [57, -66]],                                     // up to the Green Ripples
  [[-56, -50], [-58, -44], [-55, -40.6]],
];
const nearWalk = (x, z, m) => PATHS.some((p) => polyDist(x, z, p) < m) || nearBridge(x, z, m) || nearBuilding(x, z, m) || nearRockPath(x, z, m);
// the revetment (bo an): rubble laid along the shore of the pond and of every island, two courses
// stepping down into the water, so that nowhere does turf meet the water; it stops at the bridges'
// landings, the buildings on piers and the rockery paths
const shore = [...POND, ...ISLANDS];
const arcs = [];
for (const sh of shore) {
  const per = Math.PI * (sh.r[0] + sh.r[1]), n = Math.ceil(per / 0.3);
  let arc = [];
  for (let k = 0; k <= n; k++) {
    const a = k / n * TAU, x = sh.c[0] + Math.cos(a) * sh.r[0], z = sh.c[1] + Math.sin(a) * sh.r[1];
    const ok = Math.abs(pondDistance(x, z)) < 0.12 && !nearBuilding(x, z, 1.1) && !nearBridge(x, z, 1.5) && !nearRockPath(x, z, 1.3);
    if (ok) arc.push([x, z]); else { if (arc.length > 2) arcs.push(arc); arc = []; }
  }
  if (arc.length > 2) arcs.push(arc);
}
E.push({ t: 'revetment', arcs, dist: pondDistance, ground: H, water: LEVEL.pond, seed: 31 });
// Taihu stones along the shores and on the hills: a few standing in the water, some on the bank,
// singly or in pairs, none on a path; the near ones fine, the far ones plain (garden-stone.js).
// The near shapes (lod 0) and the far (lod 1) are drawn from short lists so that each is instanced many times.
const FAR = [7, 10, 12, 13], NEAR = [5, 6, 7, 8, 9, 10, 12, 13];
const stones = [];
for (const [si, sh] of shore.entries()) {
  const per = Math.PI * (sh.r[0] + sh.r[1]);
  for (let a = rand() * 0.2; a < TAU;) {
    const x = sh.c[0] + Math.cos(a) * sh.r[0], z = sh.c[1] + Math.sin(a) * sh.r[1];
    a += (3.2 + rand() * 6.5) / per * Math.PI;           // every 3–10 m
    if (Math.abs(pondDistance(x, z)) > 0.15 || nearBuilding(x, z, 2) || nearBridge(x, z, 2.2) || nearRockPath(x, z, 2)) continue;
    const e = 0.2, gx = pondDistance(x + e, z) - pondDistance(x - e, z), gz = pondDistance(x, z + e) - pondDistance(x, z - e), gl = Math.hypot(gx, gz) || 1;
    const nx = gx / gl, nz = gz / gl;                    // toward the land
    const m = 1 + (rand() < 0.4 ? 1 : 0);
    for (let k = 0; k < m; k++) {
      const off = (rand() < 0.35 ? -0.4 : 0.55 + rand() * 0.6) + k * 0.5, t = k * 1.1 + (rand() - 0.5) * 0.4;
      const px = x + nx * off - nz * t, pz = z + nz * off + nx * t;
      stones.push({ x: px, z: pz, near: nearWalk(px, pz, 7), s: 0.65 + rand() * 0.7, si });
    }
  }
}
const nNear = stones.filter((q) => q.near).length, nFar = stones.length - nNear;
const useNear = NEAR.slice(0, Math.max(1, Math.min(NEAR.length, Math.floor(nNear / 12)))), useFar = FAR.slice(0, Math.max(1, Math.min(FAR.length, Math.floor(nFar / 12))));
let kn = 0, kf = 0;
for (const q of stones) {
  const near = q.near, v = near ? useNear[kn++ % useNear.length] : useFar[kf++ % useFar.length];
  E.push({ t: 'taihu', c: [q.x, q.z], y: H(q.x, q.z) + 0.12, v, s: q.s, lod: near ? 0 : 1, yaw: rand() * TAU, tx: (rand() - 0.5) * 0.12, tz: (rand() - 0.5) * 0.12 });
}
// the rockery hills on the islands and the mounds: tall single stones (the peaks of the garden) and piles
for (const [i, s] of [...ISLANDS.slice(0, 2), ...MOUNDS].entries()) {
  let tall = 0;
  for (let k = 0; k < 9 && tall + k < 14; k++) {
    const a = rand() * TAU, d = 0.3 + rand() * 0.5;
    const x = s.c[0] + Math.cos(a) * s.r[0] * d, z = s.c[1] + Math.sin(a) * s.r[1] * d;
    if (nearBuilding(x, z, 2.4) || nearRockPath(x, z, 2.2) || nearBridge(x, z, 2)) continue;
    const feature = tall < 2 && i < 2;
    if (feature) tall++;
    const v = feature ? 2 + ((i + tall) % 2) : [5, 6, 7, 8, 9, 10][(i + k) % 6];
    E.push({ t: 'taihu', c: [x, z], y: H(x, z) - 0.05, v, s: feature ? 0.8 + rand() * 0.35 : 0.7 + rand() * 0.5, lod: 0, yaw: rand() * TAU, tx: (rand() - 0.5) * 0.08, tz: (rand() - 0.5) * 0.08, solid: true });
  }
}
// the standing stones at the focal points: two peaks flanking the terrace of the Hall of Distant
// Fragrance, one in the loquat court's corner, one at the lake's west end by the Leaning Jade
for (const [x, z, v, sc] of [[-12.5, -26.6, 0, 0.95], [12.5, -26.6, 2, 1.15], [47.8, -11, 3, 0.85], [-33.5, -21, 2, 0.9]]) E.push({ t: 'taihu', c: [x, z], y: H(x, z) - 0.05, v, s: sc, lod: 0, yaw: x > 0 ? 0.3 : -0.3, plinth: true, solid: true });
// the paths up the island hills among piled stone, from the bridges to the hill pavilions (a
// short grotto on the way up to Snowy Fragrance; docs/settlements/ming-suzhou.md §5)
ROCK_PATHS.forEach((p, i) => {
  const n = p.pts.length;
  const pts = p.pts.map(([x, z], k) => [x, z, k === n - 1 ? p.end : Math.max(G + 0.05, H(x, z) + 0.06)]);
  E.push({ t: 'ming_rockery', pts, w: 1.3, ground: H, cave: p.cave, seed: 4100 + i * 17 });
});
// lotus in clumps with open water between, north of the Hall of Distant Fragrance and in the bays; water lilies in the smaller bays
const wet = (x, z) => pondDistance(x, z) < -1.2 && !nearBridge(x, z, 1.4) && !nearBuilding(x, z, 0.8);
for (const [c, r, n, sq] of [[[0, -36], 24, 300, 0.42], [[-38, -40], 12, 150, 0.9], [[35, -45], 14, 160, 0.8], [[-48, -61], 8, 70, 0.8], [[-47, -18], 14, 45, 0.35]]) E.push({ t: 'lotus', c, r, n, sq, y: LEVEL.pond, seed: Math.round(c[0] * 7 + 3), inside: wet });
for (const [c, r, n, sq] of [[[-49, -62], 9, 44, 0.8], [[-47, -10], 12, 32, 0.4], [[-47, 0], 5, 20, 0.8], [[35, -48], 14, 50, 0.8], [[-36, -38], 11, 40, 0.9], [[0, -40], 22, 60, 0.5]]) E.push({ t: 'water_lily', c, r, n, sq, y: LEVEL.pond, seed: Math.round(c[0] * 5 + 11), inside: wet });

// ── the walls, their gates and windows ───────────────────────────────────────
const [gx0, gz0, gx1, gz1] = GARDEN;
const wall = (a, b, opts = {}) => E.push({ t: 'ming_wall', a, b, y: G, h: 4.4, th: 0.42, ...opts });
// the leaky windows: frames of many outlines, each with its own tracery (docs/settlements/ming-suzhou.md §5)
const SHAPES = ['rect', 'oct', 'round', 'begonia', 'hex', 'fan', 'rect'];
const leaky = (at, k, w = 1.1, h = 1.1, sill = 1.5) => ({ at, w: SHAPES[k % 7] === 'fan' ? w * 1.25 : w, h: SHAPES[k % 7] === 'fan' ? h * 0.8 : h, sill, shape: SHAPES[k % 7] });
wall([gx0, gz0], [gx1, gz0], { windows: [-50, -20, 10, 40].map((at, k) => leaky(at + 74, k)) });
wall([gx1, gz0], [gx1, gz1], { windows: [30, 60, 84].map((at, k) => leaky(at, k + 4)) });
wall([gx0, gz1], [gx0, gz0], { gates: [{ at: 52, r: 1.3 }] });                       // a moon gate west toward the town
// the south wall: the door from the residence (the garden's own gate), leaky windows along it. The
// women's building backs onto the wall on the axis, so the door is east of it, reached from the
// court before that building along its east side
wall([gx1, gz1], [gx0, gz1], { gates: [{ at: 60, w: 2.2, h: 2.8, plaque: true }], windows: [20, 34, 46, 102, 114, 128].map((at, k) => leaky(at, k + 1, 1.2, 1.2, 1.4)) });
// the loquat court: low walls with a moon gate on the west and a gate north to the pond
const [lx0, lz0, lx1, lz1] = LOQUAT_COURT;
const low = { h: 3.2, th: 0.32 };
wall([lx0, lz1], [lx0, lz0], { ...low, gates: [{ at: 10.5, r: 1.15 }], windows: [leaky(4, 2, 0.9, 0.9, 1.3), leaky(17, 3, 0.9, 0.9, 1.3)] });
wall([lx0, lz0], [lx1, lz0], { ...low, gates: [{ at: 9, w: 1.6, h: 2.3 }], windows: [leaky(3.5, 1, 0.9, 0.9, 1.3), leaky(15, 4, 0.9, 0.9, 1.3)] });

// ── the galleries, along the walls and between the halls ─────────────────────
// the beauty's rest (mei ren kao) where a bench looks on water (within 5.5 m of the pond), a plain bench elsewhere
const facesWater = (x, z) => pondDistance(x, z) < 5.5;
GALLERIES.forEach((pts, i) => E.push({ t: 'ming_gallery', fine: true, wet: facesWater, pts, y: G + 0.3, w: 2.0, H: 2.8, side: i === 0 ? -1 : i === 1 ? 1 : i === 2 ? 1 : 0 }));

// ── the halls and pavilions ──────────────────────────────────────────────────
const B = BUILDINGS;
// the Hall of Distant Fragrance: lattice on all four sides, a terrace north over the pond
E.push({ t: 'paving', rect: [-10, -26, 10, -19.6], y: G + B.yuanxiang.y - 0.05, th: 1.6, mat: 'bluestone' });
E.push({ t: 'ming_hall', rect: B.yuanxiang.rect, y: G + B.yuanxiang.y, H: 5.0, front: 'n', four: true, roof: 'xieshan', plat: 0.6, eave: 1.5, sweep: 1.3, ...B.yuanxiang.hall });
E.push({ t: 'ming_hall', rect: B.yiyu.rect, y: G + B.yiyu.y, H: 3.8, front: B.yiyu.front, four: true, roof: 'xieshan', plat: 0.4, ...B.yiyu.hall });
E.push({ t: 'ming_hall', rect: B.linglong.rect, y: G + B.linglong.y, H: 3.9, front: 'w', four: false, roof: 'xieshan', plat: 0.35, ...B.linglong.hall });
E.push({ t: 'stone_boat', rect: B.xiangzhou.rect, y: G + B.xiangzhou.y });
E.push({ t: 'lou', rect: B.jianshan.rect, y: G + B.jianshan.y });
// Little Canglang: a water pavilion standing over the inlet on stone piers
E.push({ t: 'ming_slab_bridge', pts: [[-52, 5], [-42, 5]], w: 5, y: G + B.xiaocanglang.y, bed: LEVEL.pondBed });
E.push({ t: 'ming_hall', rect: B.xiaocanglang.rect, y: G + B.xiaocanglang.y, H: 3.4, front: 'n', four: true, roof: 'xieshan', plat: 0.01, eave: 1.0, platMargin: 0.02, ...B.xiaocanglang.hall });
// Small Flying Rainbow: a covered bridge, the only one in the city's gardens
{
  const [x0, z0, x1, z1] = B.xiaofeihong.rect, zc = (z0 + z1) / 2;
  E.push({ t: 'ming_slab_bridge', pts: [[x0 - 1, zc], [(x0 + x1) / 2, zc], [x1 + 1, zc]], w: z1 - z0 + 0.2, y: G + B.xiaofeihong.y, bed: LEVEL.pondBed });
  E.push({ t: 'ming_gallery', fine: true, wet: facesWater, pts: [[x0, zc], [x1, zc]], y: G + B.xiaofeihong.y + 0.01, w: z1 - z0 - 0.4, H: 2.7, side: 0 });
}
for (const id of ['hefeng', 'xuexiang', 'daishuang', 'wuzhu', 'lvyi']) {
  const b = B[id], hill = b.y > 1.5;
  const shape = b.kind === 'hex' ? 'hex' : b.kind === 'pav_rect' ? 'rect' : 'square';
  E.push({ t: 'ming_pavilion', fine: true, wet: facesWater, c: b.c, shape, r: b.r, w: b.w, d: b.d, y: G + b.y, H: b.moons ? 4.4 : 3.3, moons: b.moons, plat: hill ? 1.4 : 0.45, open: shape === 'hex' ? [1, 4] : [0, 2] });
}

// ── the bridges over the pond and the paths ──────────────────────────────────
for (const b of GARDEN_BRIDGES) E.push({ t: 'ming_slab_bridge', pts: b.pts, w: b.w, y: G + 0.05, bed: LEVEL.pondBed });
for (const p of PATHS) E.push({ t: 'path', pts: p.map(([x, z]) => [x, z]), w: 1.4, y: Math.max(G, ...p.map(([x, z]) => H(x, z))) + 0.03 });
// the courts in pebble mosaic (hua jie pu di): the court behind the Hall of Distant Fragrance, where one arrives, with a crane; the loquat court with a plum blossom
E.push({ t: 'pebble_paving', rect: [-9, -9.1, 9, -0.3], y: G + 0.03, field: 'hex', medallion: 'crane', at: [0, -4.7], d: 4.6, seed: 1 });
E.push({ t: 'pebble_paving', rect: [32, -1.2, 48.5, 7.4], y: G + 0.03, field: 'coin', medallion: 'plum', at: [40, 1.6], d: 2.8, seed: 2 });

// ── the residence ────────────────────────────────────────────────────────────
// on one axis from the street north: the gate hall, the sedan-chair hall, the main hall (ting),
// the women's building (two storeys); courtyards between, paved with bluestone, walled
const [rx0, rz0, rx1, rz1] = RESIDENCE;
E.push({ t: 'paving', rect: [rx0, rz0, rx1, rz1], y: G + 0.02, th: 0.3 });
const rwall = (a, b, opts = {}) => E.push({ t: 'ming_wall', a, b, y: G, h: 5.2, th: 0.45, ...opts });
rwall([rx0, rz1], [rx0, rz0]); rwall([rx1, rz0], [rx1, rz1]);
// the street front: the gate hall in the middle, and west of it the side door to the side passage
// (bei long) by which the household goes from court to court without crossing the halls
rwall([rx0, rz1], [-6, rz1], { gates: [{ at: -12 - rx0, w: 1.6, h: 2.6 }] }); rwall([6, rz1], [rx1, rz1]);
// granite steps from the street up to the gate hall's platform
E.push({ t: 'stair', rect: [-3, rz1 + 0.9, 3, rz1 + 2.1], y0: LEVEL.street, y1: G + 0.45, dir: 'n', riser: 0.15, mat: 'granite_block' });
const halls = [
  { rect: [-6, 54, 6, 60], H: 4.0, roof: 'gable', four: false, lat: 'lattice_bubujin' },      // the gate hall, its door on the street
  { rect: [-8, 43, 8, 49.5], H: 4.2, roof: 'gable', four: true, walls: { e: 'plaster', w: 'plaster' }, doors: ['n'], winWall: true, lat: 'lattice_lantern' },   // the sedan-chair hall: doors to both courts, plastered sides
  { rect: [-10, 32, 10, 39.5], H: 5.0, roof: 'xieshan', four: true, walls: { n: 'board', e: 'plaster', w: 'plaster' }, doors: ['n'], winWall: true, lat: 'lattice_bubujin' },  // the main hall: boards behind, brick-plastered gable walls
  { rect: [-11, 24.6, 11, 29], H: 6.6, roof: 'gable', four: true, walls: { n: 'plaster', e: 'plaster', w: 'plaster' }, winWall: true, lat: { door: 'lattice_haitang', window: 'lattice_haitang' } },    // the women's building: lattice to the court only
];
for (const h of halls) E.push({ t: 'ming_hall', rect: h.rect, y: G + 0.45, H: h.H, front: 's', four: h.four, roof: h.roof, plat: 0.45, eave: 1.0, walls: h.walls, doors: h.doors, winWall: h.winWall, lat: h.lat });
// the courtyards' cross walls, each with a carved brick gateway on the axis
for (const z of [52, 41]) { rwall([rx0, z], [-1.5, z], { h: 4.6 }); rwall([1.5, z], [rx1, z], { h: 4.6 }); }
// side courtyards: a small study hall each side with its rockery and a well
E.push({ t: 'ming_hall', rect: [-34, 30, -22, 36], y: G + 0.35, H: 3.8, front: 'e', four: true, roof: 'xieshan', plat: 0.35, walls: { n: 'plaster', s: 'plaster', w: 'board' }, winWall: true, lat: { door: 'lattice_ice', window: 'lattice_ice' } });
E.push({ t: 'ming_hall', rect: [22, 44, 34, 50], y: G + 0.35, H: 3.8, front: 'w', four: false, roof: 'gable', plat: 0.35, winWall: true, lat: { door: 'lattice_wan', window: 'lattice_wan' } });
// standing stones on rough stone feet in the side courts; round them the courts are paved in pebble mosaic: a crane before the east hall's door, a lotus before the study's, coins and a plum in the west court
E.push({ t: 'taihu', c: [-30, 44], y: G + 0.04, v: 3, s: 0.95, lod: 0, yaw: 0.4, plinth: true, solid: true });
E.push({ t: 'taihu', c: [28, 32], y: G + 0.04, v: 3, s: 1.0, lod: 0, yaw: -0.5, plinth: true, solid: true });
E.push({ t: 'pebble_paving', rect: [12.5, 42.2, 21.2, 51.2], y: G + 0.035, field: 'hex', medallion: 'crane', at: [16.85, 46.7], d: 5.2, seed: 3 });
E.push({ t: 'pebble_paving', rect: [-21.4, 29.5, -12.8, 40.3], y: G + 0.035, field: 'coin', medallion: 'lotus', at: [-17.1, 35], d: 5.4, seed: 4 });
E.push({ t: 'pebble_paving', rect: [-38, 42.2, -14, 51.2], y: G + 0.035, field: 'coin', medallion: 'plum', at: [-21, 46.7], d: 5.2, seed: 5 });

// ── the halls furnished, their boards and couplets, potted landscapes in the courts (§11) ──
E.push({ t: 'hall_furniture', rect: B.yuanxiang.rect, y: G + B.yuanxiang.y, front: 'n', H: 5.0 });
E.push({ t: 'scholar_study', rect: [-34, 30, -22, 36], y: G + 0.35, door: 'e', H: 3.8 });
E.push({ t: 'hall_furniture', rect: [-10, 32, 10, 39.5], y: G + 0.45, front: 's', H: 5.0, variant: 'main' });
E.push({ t: 'hall_furniture', rect: B.linglong.rect, y: G + B.linglong.y, front: 'w', H: 3.9 });
E.push({ t: 'hall_furniture', rect: B.yiyu.rect, y: G + B.yiyu.y, front: B.yiyu.front, H: 3.8 });
// ── the residence's courts: stone drums at the gate, the screen wall before the side door, the great vats, a well, plants in tubs (§11)
{
  const g = G + 0.02;
  for (const s of [-1, 1]) E.push({ t: 'court_piece', kind: 'drum', at: [s * 2.55, 60.45], y: G + 0.45, yaw: 0 });
  E.push({ t: 'court_piece', kind: 'screen', at: [-12, 56.8], y: g, yaw: 0, w: 3.8, h: 3.3 });
  for (const [x, z] of [[-14.5, 38.5], [14.5, 38.5], [-13.5, 47], [13.5, 47]]) E.push({ t: 'court_piece', kind: 'vat', at: [x, z], y: g });
  E.push({ t: 'court_piece', kind: 'well', at: [-17, 46], y: g });
  const plants = [[-12.2, 33, 'shrub'], [12.2, 33, 'shrub'], [-12.2, 36, 'orchid'], [12.2, 36, 'orchid'], [-12.4, 27, 'bamboo'], [12.4, 27, 'bamboo'],
    [-9.5, 51, 'orchid'], [9.5, 51, 'orchid'], [38.6, 28, 'bamboo'], [38.6, 33, 'bamboo'], [38.6, 38, 'bamboo'], [-38.6, 28, 'bamboo'], [-38.6, 38, 'bamboo'],
    [-20, 56, 'shrub'], [-8.5, 56, 'orchid'], [-30, 56, 'bamboo'], [20, 56, 'shrub'], [32, 56, 'bamboo']];
  plants.forEach(([x, z, plant], i) => E.push({ t: 'court_piece', kind: 'plant', at: [x, z], y: g, plant, seed: 200 + i }));
}
// the inscribed boards under the eaves over the doorways (the doorway is the front's middle bay, as ming_hall lays it out)
const board = (at, y, facing, w, n, seed, extra = {}) => E.push({ t: 'plaque', at, y, facing, w, h: 0.72, n, seed, ...extra });
board([1.8, B.yuanxiang.rect[1] - 0.2], G + B.yuanxiang.y + 5.0 - 1.02, [0, -1], 2.4, 4, 11);
board([1.8, B.yuanxiang.rect[3] + 0.2], G + B.yuanxiang.y + 5.0 - 1.02, [0, 1], 2.4, 3, 12);
board([-20, B.yiyu.rect[1] - 0.2], G + B.yiyu.y + 3.8 - 0.98, [0, -1], 1.8, 3, 13, { h: 0.6 });
board([B.linglong.rect[0] - 0.2, -3.375], G + B.linglong.y + 3.9 - 0.98, [-1, 0], 1.8, 4, 14, { h: 0.6 });
board([1.67, 39.7], G + 0.45 + 5.0 - 1.02, [0, 1], 2.4, 4, 15);
board([-21.8, 34.5], G + 0.35 + 3.8 - 0.98, [1, 0], 1.6, 3, 16, { h: 0.55 });
// the couplet on the two columns of the Hall of Distant Fragrance's doorway, facing the pond
for (const x of [0, 3.6]) E.push({ t: 'plaque', at: [x, B.yuanxiang.rect[1] - 0.17], y: G + B.yuanxiang.y + 1.2, facing: [0, -1], w: 0.3, h: 2.5, n: 7, vertical: true, seed: 20 + x, field: 'lacquer_black', ink: 'gilt_bronze' });
// potted landscapes on stone stands: in the loquat court, before the Hall of Distant Fragrance, in the study's court
for (const [at, kind, seed] of [[[33, 4.5], 'pine', 1], [[36.5, 4.5], 'rock', 2], [[40, 4.5], 'pine', 3], [[43.5, 4.5], 'pine', 4], [[47, 4.5], 'rock', 5],
  [[-4.5, -7.6], 'pine', 6], [[4.5, -7.6], 'rock', 7], [[-25, 39], 'pine', 8], [[-31, 39], 'rock', 9]]) E.push({ t: 'penjing', at, y: Math.max(G, H(at[0], at[1])), kind, seed });

// ── rooms and the walk ───────────────────────────────────────────────────────
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('yuanxiang', B.yuanxiang.rect, G + B.yuanxiang.y, 'hall'),
  room('main-hall', [-10, 32, 10, 39.5], G + 0.45, 'hall'),
  room('sedan-hall', [-8, 43, 8, 49.5], G + 0.45, 'hall'),
  room('garden', GARDEN, G, 'open'),
  room('residence', RESIDENCE, G, 'open'),
];
const walks = [[[0, 64], [0, 57], [0, 46], [0, 40], [0, 30.6], [14, 30.6], [14, 25.5], [14, 22], [8, 14], [0, 8], [0, -9], [0, -21], [-12, -8], [-21, -12]]];
walks[0].y0 = 0;

export const garden = {
  id: 'ming-suzhou-garden',
  name: { en: 'The Humble Administrator\'s Garden', zh: '拙政园' },
  era: { en: 'Ming dynasty, 1509–1533', zh: '明，正德四年至嘉靖十二年（1509–1533年）' },
  style: 'suzhou-site',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 65], facing: 'n' },
  bounds: [GARDEN[0] - 2, GARDEN[1] - 2, GARDEN[2] + 2, RESIDENCE[3] + 2],
  bakeBounds: [-48, -62, 48, 24],
  view: [-9, -27, 9, -9],          // what one arrives to see: the Hall of Distant Fragrance and its terrace
  bakeTop: 14,
  bakeSpacing: 1.2,
  elements: E,
  rooms,
  walks,
};

export default garden;
