// The Humble Administrator's Garden (Zhuozheng Yuan) and its owner's residence, as Wang Xianchen
// laid it out from 1509 and Wen Zhengming painted it in 1533: a pond filling a third of the garden,
// islands with their hills, halls and pavilions round the water, galleries along the white walls,
// zigzag stone bridges, Taihu rock on the shores (docs/settlements/ming-suzhou.md §4). South of
// the garden, the residence: a gate hall on the street, a sedan-chair hall, the main hall and the
// two-storey women's building behind, in courtyards on one axis.

import { PLACED } from '../../planet/layout.js';
import {
  LEVEL, GARDEN, RESIDENCE, POND, ISLANDS, MOUNDS, BUILDINGS, GALLERIES, GARDEN_BRIDGES, LOQUAT_COURT, pondDistance, inRect,
} from './layout.js';
import { ground } from './ground.js';

void PLACED; void MOUNDS;
const G = LEVEL.garden;
const E = [];
const H = (x, z) => ground.height(x, z);

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rand = rng(1509);

// ── the pond: its water, the rock along its shores, the lotus ───────────────
E.push({ t: 'water_cells', rect: [GARDEN[0], GARDEN[1], GARDEN[2], GARDEN[3]], y: LEVEL.pond, cell: 0.5, inside: (x, z) => pondDistance(x, z) < -0.05 });
// Taihu rock heaped along the shores (every 1.5–3 m round each ellipse, where the shore is open)
const shore = [...POND, ...ISLANDS];
for (const s of shore) {
  const per = Math.PI * (s.r[0] + s.r[1]), n = Math.round(per / 2.2);
  for (let k = 0; k < n; k++) {
    const a = (k + rand() * 0.6) / n * Math.PI * 2;
    const x = s.c[0] + Math.cos(a) * s.r[0], z = s.c[1] + Math.sin(a) * s.r[1];
    if (Math.abs(pondDistance(x, z)) > 0.9) continue;           // inside another lobe: not a shore
    if (Object.values(BUILDINGS).some((b) => (b.rect ? inRect(b.rect, x, z, 1.2) : Math.hypot(x - b.c[0], z - b.c[1]) < (b.r || b.w / 2) + 1.4))) continue;
    if (GARDEN_BRIDGES.some((b) => b.pts.some((p) => Math.hypot(p[0] - x, p[1] - z) < 1.8))) continue;
    E.push({ t: 'taihu', c: [x, z], r: 0.7 + rand() * 0.9, h: 0.7 + rand() * 0.9, y: LEVEL.pond - 0.25, seed: 100 + k * 7 + Math.round(s.c[0] * 13) });
  }
}
// the rockery hills on the islands and the mounds: tall single stones and piles
for (const [i, s] of [...ISLANDS.slice(0, 2), ...MOUNDS].entries()) {
  for (let k = 0; k < 6; k++) {
    const a = rand() * Math.PI * 2, d = 0.35 + rand() * 0.45;
    const x = s.c[0] + Math.cos(a) * s.r[0] * d, z = s.c[1] + Math.sin(a) * s.r[1] * d;
    if (Object.values(BUILDINGS).some((b) => (b.rect ? inRect(b.rect, x, z, 2) : Math.hypot(x - b.c[0], z - b.c[1]) < (b.r || b.w / 2) + 2.2))) continue;
    E.push({ t: 'taihu', c: [x, z], r: 0.6 + rand() * 0.8, h: 1.2 + rand() * 1.8, y: H(x, z) - 0.1, seed: 900 + i * 31 + k, solid: true });
  }
}
// lotus north of the Hall of Distant Fragrance and in the west bay
for (const [c, r, n] of [[[0, -32], 9, 80], [[-38, -40], 6, 40], [[34, -42], 6, 36], [[-48, -60], 4, 22]]) E.push({ t: 'lotus', c, r, n, y: LEVEL.pond, seed: c[0] * 7 + 3 });

// ── the walls, their gates and windows ───────────────────────────────────────
const [gx0, gz0, gx1, gz1] = GARDEN;
const wall = (a, b, opts = {}) => E.push({ t: 'ming_wall', a, b, y: G, h: 4.4, th: 0.42, ...opts });
// the leaky windows: frames of many outlines, each with its own tracery (docs/settlements/ming-suzhou.md §5)
const SHAPES = ['rect', 'oct', 'round', 'begonia', 'hex', 'fan', 'rect'];
const leaky = (at, k, w = 1.1, h = 1.1, sill = 1.5) => ({ at, w: SHAPES[k % 7] === 'fan' ? w * 1.25 : w, h: SHAPES[k % 7] === 'fan' ? h * 0.8 : h, sill, shape: SHAPES[k % 7] });
wall([gx0, gz0], [gx1, gz0], { windows: [-50, -20, 10, 40].map((at, k) => leaky(at + 74, k)) });
wall([gx1, gz0], [gx1, gz1], { windows: [30, 60, 84].map((at, k) => leaky(at, k + 4)) });
wall([gx0, gz1], [gx0, gz0], { gates: [{ at: 52, r: 1.3 }] });                       // a moon gate west toward the town
// the south wall: the door from the residence (the garden's own gate), leaky windows along it
wall([gx1, gz1], [gx0, gz1], { gates: [{ at: 74, w: 2.2, h: 2.8, plaque: true }], windows: [20, 34, 46, 102, 114, 128].map((at, k) => leaky(at, k + 1, 1.2, 1.2, 1.4)) });
// the loquat court: low walls with a moon gate on the west and a gate north to the pond
const [lx0, lz0, lx1, lz1] = LOQUAT_COURT;
const low = { h: 3.2, th: 0.32 };
wall([lx0, lz1], [lx0, lz0], { ...low, gates: [{ at: 10.5, r: 1.15 }], windows: [leaky(4, 2, 0.9, 0.9, 1.3), leaky(17, 3, 0.9, 0.9, 1.3)] });
wall([lx0, lz0], [lx1, lz0], { ...low, gates: [{ at: 9, w: 1.6, h: 2.3 }], windows: [leaky(3.5, 1, 0.9, 0.9, 1.3), leaky(15, 4, 0.9, 0.9, 1.3)] });

// ── the galleries, along the walls and between the halls ─────────────────────
GALLERIES.forEach((pts, i) => E.push({ t: 'ming_gallery', pts, y: G + 0.3, w: 2.0, H: 2.8, side: i === 0 ? -1 : i === 1 ? 1 : i === 2 ? 1 : 0 }));

// ── the halls and pavilions ──────────────────────────────────────────────────
const B = BUILDINGS;
// the Hall of Distant Fragrance: lattice on all four sides, a terrace north over the pond
E.push({ t: 'paving', rect: [-10, -26, 10, -19.6], y: G + B.yuanxiang.y - 0.05, th: 1.6, mat: 'bluestone' });
E.push({ t: 'ming_hall', rect: B.yuanxiang.rect, y: G + B.yuanxiang.y, H: 5.0, front: 'n', four: true, roof: 'xieshan', plat: 0.6, eave: 1.5, sweep: 1.3 });
E.push({ t: 'ming_hall', rect: B.yiyu.rect, y: G + B.yiyu.y, H: 3.8, front: B.yiyu.front, four: true, roof: 'xieshan', plat: 0.4 });
E.push({ t: 'ming_hall', rect: B.linglong.rect, y: G + B.linglong.y, H: 3.9, front: 'w', four: false, roof: 'xieshan', plat: 0.35 });
E.push({ t: 'stone_boat', rect: B.xiangzhou.rect, y: G + B.xiangzhou.y });
E.push({ t: 'lou', rect: B.jianshan.rect, y: G + B.jianshan.y });
// Little Canglang: a water pavilion standing over the inlet on stone piers
E.push({ t: 'ming_slab_bridge', pts: [[-52, 5], [-42, 5]], w: 5, y: G + B.xiaocanglang.y, bed: LEVEL.pondBed });
E.push({ t: 'ming_hall', rect: B.xiaocanglang.rect, y: G + B.xiaocanglang.y, H: 3.4, front: 'n', four: true, roof: 'xieshan', plat: 0.01, eave: 1.0 });
// Small Flying Rainbow: a covered bridge, the only one in the city's gardens
{
  const [x0, z0, x1, z1] = B.xiaofeihong.rect, zc = (z0 + z1) / 2;
  E.push({ t: 'ming_slab_bridge', pts: [[x0 - 1, zc], [(x0 + x1) / 2, zc], [x1 + 1, zc]], w: z1 - z0 + 0.2, y: G + B.xiaofeihong.y, bed: LEVEL.pondBed });
  E.push({ t: 'ming_gallery', pts: [[x0, zc], [x1, zc]], y: G + B.xiaofeihong.y + 0.01, w: z1 - z0 - 0.4, H: 2.7, side: 0 });
}
for (const id of ['hefeng', 'xuexiang', 'daishuang', 'wuzhu', 'lvyi']) {
  const b = B[id], hill = b.y > 1.5;
  const shape = b.kind === 'hex' ? 'hex' : b.kind === 'pav_rect' ? 'rect' : 'square';
  E.push({ t: 'ming_pavilion', c: b.c, shape, r: b.r, w: b.w, d: b.d, y: G + b.y, H: b.moons ? 4.4 : 3.3, moons: b.moons, plat: hill ? 1.4 : 0.45, open: shape === 'hex' ? [1, 4] : [0, 2] });
}

// ── the bridges over the pond and the paths ──────────────────────────────────
for (const b of GARDEN_BRIDGES) E.push({ t: 'ming_slab_bridge', pts: b.pts, w: b.w, y: G + 0.05, bed: LEVEL.pondBed });
const paths = [
  [[0, 23], [0, 8], [-2, 0], [0, -8], [0, -9.8]],                      // from the garden gate to the hall
  [[-2, -6], [-12, -8], [-20, -11.8]],                                  // to the Leaning Jade
  [[3, -4], [16, -2], [26, -4], [30, -2.5]],                            // east to the loquat court's moon gate
  [[-22, -19], [-26, -21], [-28, -23]],                                  // to the bridge for the Lotus Breeze islet
  [[-38, 2], [-42, 3.5]],
  [[-58, 14], [-48, 10], [-44, 7.6]],
  [[48, -30], [54, -38], [56, -40.5]],                                   // to the Wutong and Bamboo Retreat
  [[45, -57], [52, -62], [57, -66]],                                     // up to the Green Ripples
  [[-56, -50], [-58, -44], [-55, -40.6]],
];
for (const p of paths) E.push({ t: 'path', pts: p.map(([x, z]) => [x, z]), w: 1.4, y: Math.max(G, ...p.map(([x, z]) => H(x, z))) + 0.03 });

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
  { rect: [-6, 54, 6, 60], H: 4.0, roof: 'gable', four: false },      // the gate hall, its door on the street
  { rect: [-8, 43, 8, 49.5], H: 4.2, roof: 'gable', four: true },      // the sedan-chair hall
  { rect: [-10, 32, 10, 39.5], H: 5.0, roof: 'xieshan', four: true },  // the main hall
  { rect: [-11, 24.6, 11, 29], H: 6.6, roof: 'gable', four: true },    // the women's building
];
for (const h of halls) E.push({ t: 'ming_hall', rect: h.rect, y: G + 0.45, H: h.H, front: 's', four: h.four, roof: h.roof, plat: 0.45, eave: 1.0 });
// the courtyards' cross walls, each with a carved brick gateway on the axis
for (const z of [52, 41]) { rwall([rx0, z], [-1.5, z], { h: 4.6 }); rwall([1.5, z], [rx1, z], { h: 4.6 }); }
// side courtyards: a small study hall each side with its rockery and a well
E.push({ t: 'ming_hall', rect: [-34, 30, -22, 36], y: G + 0.35, H: 3.8, front: 'e', four: true, roof: 'xieshan', plat: 0.35 });
E.push({ t: 'ming_hall', rect: [22, 44, 34, 50], y: G + 0.35, H: 3.8, front: 'w', four: false, roof: 'gable', plat: 0.35 });
E.push({ t: 'taihu', c: [-30, 44], r: 1.6, h: 2.6, y: G, seed: 77, solid: true });
E.push({ t: 'taihu', c: [28, 32], r: 1.2, h: 2.0, y: G, seed: 78, solid: true });

// ── rooms and the walk ───────────────────────────────────────────────────────
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('yuanxiang', B.yuanxiang.rect, G + B.yuanxiang.y, 'hall'),
  room('main-hall', [-10, 32, 10, 39.5], G + 0.45, 'hall'),
  room('sedan-hall', [-8, 43, 8, 49.5], G + 0.45, 'hall'),
  room('garden', GARDEN, G, 'open'),
  room('residence', RESIDENCE, G, 'open'),
];
const walks = [[[0, 64], [0, 57], [0, 46], [0, 40], [0, 30], [0, 23], [0, 8], [0, -9], [0, -21], [-12, -8], [-21, -12]]];
walks[0].y0 = 0;

export const garden = {
  id: 'ming-suzhou-garden',
  name: { en: 'The Humble Administrator\'s Garden', zh: '拙政园' },
  era: { en: 'Ming dynasty, 1509–1533', zh: '明，正德四年至嘉靖十二年（1509–1533年）' },
  style: 'ming',
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
