// Gyeongbokgung in the 1880s, as rebuilt in 1865–68 (docs/settlements/joseon-seoul.md §2–§4, §12):
// the wall and its gates; on the axis Gwanghwamun on its stone base, Heungnyemun, the Yeongjegyo
// bridge, Geunjeongmun, the cloister round the throne court, Geunjeongjeon on its two tiers,
// Sajeongjeon, Gangnyeongjeon, Gyotaejeon and Amisan's terraces with their chimneys; Gyeonghoeru of
// 1867 in its walled pond; Hyangwonjeong on its island with Chwihyanggyo, Geoncheonggung beyond; the
// ministries along the avenue.

import { PALACE, POND, ISLAND, AVENUE, MINISTRIES, STREAM, HYANG, HISLE, GEONCHEONG, AMISAN } from './layout.js';

const E = [];
const [px0, pz0, px1, pz1] = PALACE;
const wall = (a, b, gates = [], h = 5.5) => E.push({ t: 'ming_wall', a, b, y: 0, h, th: 1.4, gates });
wall([px0, pz0], [px1, pz0], [{ at: (px1 - px0) / 2, w: 5, h: 4 }]); wall([px0, pz0], [px0, pz1], [{ at: 200, w: 4.5, h: 3.8 }]); wall([px1, pz0], [px1, pz1], [{ at: 200, w: 4.5, h: 3.8 }]);
wall([px0, pz1], [-22, pz1]); wall([22, pz1], [px1, pz1]);
// Gwanghwamun: the stone base with three arched ways, the two-storey gate pavilion on it
E.push({ t: 'block', walk: true, rect: [-22, pz1 - 8, -8, pz1 + 8], y0: 0, y1: 7, mat: 'granite_korea' });
E.push({ t: 'block', walk: true, rect: [8, pz1 - 8, 22, pz1 + 8], y0: 0, y1: 7, mat: 'granite_korea' });
E.push({ t: 'block', walk: true, rect: [-3.2, pz1 - 8, 3.2, pz1 + 8], y0: 0, y1: 7, mat: 'granite_korea' });
E.push({ t: 'block', walk: true, rect: [-8, pz1 - 8, -3.2, pz1 + 8], y0: 4.8, y1: 7, mat: 'granite_korea' });
E.push({ t: 'block', walk: true, rect: [3.2, pz1 - 8, 8, pz1 + 8], y0: 4.8, y1: 7, mat: 'granite_korea' });
E.push({ t: 'qing_hall', rect: [-15, pz1 - 6, 15, pz1 + 6], y: 7, H: 5, double: 4.2, roof: 'xieshan', bays: [3, 2], front: 's', four: true, plat: 0.3, open: true, orn: { joseon: true, figures: 7 }, dapo: { tiers: 2, inter: 3 } });
// the haetae (haechi) before the gate, the beasts that know right from wrong
for (const s of [-1, 1]) E.push({ t: 'bronze', kind: 'haetae', at: [s * 13, pz1 + 16], y: 0.03, s: 0.85, face: [0, 1], stone: 'granite_korea', ped: 1.0 });
// the courts' cross walls with their gate halls; the stream and its bridge
const gateHall = (z, w = 16) => E.push({ t: 'ming_hall', rect: [-w / 2, z - 4.5, w / 2, z + 4.5], y: 0, H: 5.2, front: 's', roof: 'xieshan', plat: 0.8, eave: 1.6, sweep: 0.8, open: true, orn: { figures: 5 }, dapo: { tiers: 2, inter: 2 } });
for (const z of [160, 92]) { wall([px0, z], [-9, z], [], 4.6); wall([9, z], [px1, z], [], 4.6); gateHall(z); }
E.push({ t: 'water_rect', rect: [-150, STREAM.z0, 150, STREAM.z1], y: -1.2 });
E.push({ t: 'canal_wall', a: [-150, STREAM.z0], b: [150, STREAM.z0], y: 0.05, bed: -2.6, th: 0.6 });
E.push({ t: 'canal_wall', a: [-150, STREAM.z1], b: [150, STREAM.z1], y: 0.05, bed: -2.6, th: 0.6 });
E.push({ t: 'ming_arch_bridge', at: [0, (STREAM.z0 + STREAM.z1) / 2], across: 'z', span: 8.4, width: 9, rise: 1.4, landing: 4, y: 0.04, water: -1.2, bed: -2.6, pal: { base: 'granite_korea' }, rail: { head: 'lotus' } });
// the four cheonrok on the banks beside Yeongjegyo, watching the water for evil coming in by the stream
for (const sx of [-1, 1]) {
  E.push({ t: 'bronze', kind: 'cheonrok', at: [sx * 7.2, STREAM.z0 - 1.4], y: 0.02, face: [0, 1], stone: 'granite_korea' });
  E.push({ t: 'bronze', kind: 'cheonrok', at: [sx * 7.2, STREAM.z1 + 1.4], y: 0.02, face: [0, -1], stone: 'granite_korea' });
}
// the throne court: its cloister, the two-tier platform, Geunjeongjeon
const [cx0, cz0, cx1, cz1] = [-62, -18, 62, 88];
for (const pts of [[[cx0, cz0], [cx0, cz1]], [[cx1, cz0], [cx1, cz1]], [[cx0, cz0], [-12, cz0]], [[12, cz0], [cx1, cz0]], [[cx0, cz1], [-10, cz1]], [[10, cz1], [cx1, cz1]]]) E.push({ t: 'ming_gallery', pts, y: 0.3, w: 4.4, H: 3.2, side: 0 });
E.push({ t: 'lane', rect: [cx0 + 3, cz0 + 3, cx1 - 3, cz1 - 3], y: 0.04, mat: 'granite_korea' });
// the royal path down the court in three lanes, the king's in the middle a little higher; the rank stones
// in two rows beside it, from the platform's stair to the gate (the civil ranks east, the military west)
E.push({ t: 'block', rect: [-1.6, 56, 1.6, cz1 - 3], y0: 0, y1: 0.2, mat: 'granite_korea', collide: false, walk: true });
for (const sx of [-1, 1]) E.push({ t: 'block', rect: sx < 0 ? [-3.6, 56, -1.6, cz1 - 3] : [1.6, 56, 3.6, cz1 - 3], y0: 0, y1: 0.12, mat: 'granite_korea', collide: false, walk: true });
for (let i = 0; i < 12; i++) for (const sx of [-1, 1]) {
  const z = 59 + i * 2.25, x = sx * 7.5;
  E.push({ t: 'block', rect: [x - 0.32, z - 0.22, x + 0.32, z + 0.22], y0: 0, y1: 0.14, mat: 'granite_korea', collide: false });
  E.push({ t: 'block', rect: [x - 0.2, z - 0.07, x + 0.2, z + 0.07], y0: 0.14, y1: 0.72, mat: 'granite_korea' });
}
// the two tiers of the platform (woldae), their granite balustrades with stone beasts on the posts at
// the corners and beside the stairs (the Four Guardians and the twelve animals of the zodiac)
E.push({ t: 'terrace', rect: [-38, 4, 38, 50], y0: 0, y1: 1.6, open: { s: [[34, 42]] }, carve: 'joseon', beasts: true });
E.push({ t: 'terrace', rect: [-33, 7, 33, 42], y0: 1.6, y1: 3.2, open: { s: [[29, 37]] }, carve: 'joseon', beasts: true });
// the bronze tripod burners (jeong) on the upper tier, the fire-scaring basins (deumu) on the lower
for (const s of [-1, 1]) {
  E.push({ t: 'bronze', kind: 'tripod', at: [s * 10, 38.5], y: 3.2, stone: 'granite_korea' });
  E.push({ t: 'bronze', kind: 'deumu', at: [s * 35.5, 45], y: 1.6, stone: 'granite_korea' });
}
E.push({ t: 'stairs', rect: [-4, 50, 4, 56], y0: 0, y1: 1.6, dir: 'n' });
E.push({ t: 'stairs', rect: [-4, 42, 4, 50], y0: 1.6, y1: 3.2, dir: 'n' });
E.push({ t: 'throne_hall', rect: [-15, 13, 15, 34], y: 3.2, H: 6.8, bays: [5, 5], d: 0.6, kind: 'joseon' });
E.push({ t: 'qing_hall', rect: [-15, 13, 15, 34], y: 3.2, H: 6.8, double: 5.5, roof: 'xieshan', bays: [5, 5], front: 's', four: true, plat: 0.3, orn: { joseon: true, figures: 7 }, dapo: { tiers: 3, inter: 2 } });
// the inner halls, with their own walled courts
E.push({ t: 'ming_hall', rect: [-14, -52, 14, -38], y: 0, H: 5, front: 's', four: true, roof: 'xieshan', plat: 1, eave: 1.6, sweep: 0.8, orn: { figures: 5 }, dapo: { tiers: 3, inter: 2 } });
for (const [z, w] of [[-108, 34], [-165, 32]]) {
  // Gangnyeongjeon and Gyotaejeon: hip-and-gable roofs with no main ridge (muryang), brackets on the posts only
  E.push({ t: 'ming_hall', rect: [-w / 2, z - 7, w / 2, z + 7], y: 0, H: 4.6, front: 's', four: true, roof: 'xieshan', muryang: true, plat: 1, eave: 1.5, sweep: 0.8, orn: { figures: 5 }, dapo: { tiers: 2, inter: 0 } });
  wall([-w / 2 - 14, z - 20], [w / 2 + 14, z - 20], [], 3.6); wall([-w / 2 - 14, z + 22], [-5, z + 22], [], 3.6); wall([5, z + 22], [w / 2 + 14, z + 22], [], 3.6);
  wall([-w / 2 - 14, z - 20], [-w / 2 - 14, z + 22], [], 3.6); wall([w / 2 + 14, z - 20], [w / 2 + 14, z + 22], [], 3.6);
}
// Amisan behind the queen's hall: four terraces walled in granite, their ends walled too; on them the
// four hexagonal chimneys of Gyotaejeon's ondol (1869) and two stone basins
{
  const { faces, levels, hw, back } = AMISAN;
  for (let k = 0; k < 4; k++) {
    E.push({ t: 'terrace_wall', a: [-hw, faces[k]], b: [hw, faces[k]], y0: k ? levels[k - 1] : 0, y1: levels[k], th: 1.8 });
    const zn = k < 3 ? faces[k + 1] : back;
    // the ends: walls along z from this face back to the next, their faces outward
    E.push({ t: 'terrace_wall', a: [hw, faces[k]], b: [hw, zn], y0: 0, y1: levels[k], th: 1.8 });
    E.push({ t: 'terrace_wall', a: [-hw, zn], b: [-hw, faces[k]], y0: 0, y1: levels[k], th: 1.8 });
  }
  for (const [x, k, f] of [[-16, 1, 0.3], [16, 1, -0.2], [-6, 2, 0.1], [6, 2, 0.5]]) E.push({ t: 'chimney', at: [x, (faces[k] + faces[k + 1]) / 2 - 0.9], y: levels[k], h: 2.7, face: f, seed: 11 + x });
  for (const sx of [-1, 1]) {
    const x = sx * 10, z = (faces[0] + faces[1]) / 2 - 0.9;
    E.push({ t: 'block', rect: [x - 0.75, z - 0.4, x + 0.75, z + 0.4], y0: levels[0], y1: levels[0] + 0.45, mat: 'granite_korea' });
    E.push({ t: 'water_rect', rect: [x - 0.6, z - 0.27, x + 0.6, z + 0.27], y: levels[0] + 0.38 });
  }
}
// Gyeonghoeru: the pond's stone banks, the island, three bridges, the pavilion
E.push({ t: 'water_rect', rect: POND, y: -1.2 });
const [ox0, oz0, ox1, oz1] = POND;
for (const [a, b] of [[[ox0, oz0], [ox1, oz0]], [[ox0, oz1], [ox1, oz1]], [[ox0, oz0], [ox0, oz1]], [[ox1, oz0], [ox1, oz1]]]) E.push({ t: 'canal_wall', a, b, y: 0.05, bed: -2.6, th: 0.8 });
E.push({ t: 'block', walk: true, rect: ISLAND, y0: -2.6, y1: 0.5, mat: 'granite_korea' });
// the island's granite balustrade, open where the three bridges land; the bridges on their piers
{
  const [ix0, iz0, ix1, iz1] = ISLAND, m = 0.35, B = { carve: 'joseon', mat: 'granite_korea', beasts: true, step: 1.75 };
  E.push({ t: 'balustrade_run', a: [ix0 + m, iz0 + m], b: [ix1 - m, iz0 + m], y: 0.5, ...B });
  E.push({ t: 'balustrade_run', a: [ix0 + m, iz1 - m], b: [ix1 - m, iz1 - m], y: 0.5, ...B });
  E.push({ t: 'balustrade_run', a: [ix0 + m, iz0 + m], b: [ix0 + m, iz1 - m], y: 0.5, ...B });
  E.push({ t: 'balustrade_run', a: [ix1 - m, iz0 + m], b: [ix1 - m, iz1 - m], y: 0.5, open: [-20, -4, 12].map((z) => [z - iz0 - m - 2.6, z - iz0 - m + 2.6]), ...B });
}
for (const z of [-20, -4, 12]) {
  E.push({ t: 'isle_bridge', a: [ISLAND[2] - 0.2, z], b: [ox1 + 0.6, z], w: 5, y: 0.5, piers: 3 });
  E.push({ t: 'block', walk: true, rect: [ox1 + 0.6, z - 2.2, ox1 + 1.3, z + 2.2], y0: -0.2, y1: 0.25, mat: 'granite_korea' });   // the step up onto the bridge
}
E.push({ t: 'nu', rect: [-142.2, -24.25, -107.8, 4.25], y: 0.5, bays: [7, 5], h1: 4.8, h2: 4.4 });
// the wall round Gyeonghoeru's pond (1867), three gates on the east facing the bridges, one on the north
E.push({ t: 'ming_wall', a: [-72, -56], b: [-72, 50], y: 0, h: 3.2, th: 0.7, gates: [-20, -4, 12].map((z) => ({ at: z + 56, w: 3.4, h: 2.8 })) });
E.push({ t: 'ming_wall', a: [-182, -56], b: [-72, -56], y: 0, h: 3.2, th: 0.7, gates: [{ at: 57, w: 3, h: 2.6 }] });
E.push({ t: 'ming_wall', a: [-182, 50], b: [-72, 50], y: 0, h: 3.2, th: 0.7, gates: [] });
E.push({ t: 'ming_wall', a: [-182, -56], b: [-182, 50], y: 0, h: 3.2, th: 0.7, gates: [] });
// Hyangwonji: its banks, the round island with Hyangwonjeong, Chwihyanggyo north to Geoncheonggung, lotus
E.push({ t: 'water_rect', rect: HYANG, y: -1.2 });
{
  const [hx0, hz0, hx1, hz1] = HYANG, [icx, icz] = HISLE.c;
  for (const [a, b] of [[[hx0, hz0], [hx1, hz0]], [[hx0, hz1], [hx1, hz1]], [[hx0, hz0], [hx0, hz1]], [[hx1, hz0], [hx1, hz1]]]) E.push({ t: 'canal_wall', a, b, y: 0.05, bed: -2.6, th: 0.6 });
  E.push({ t: 'ring_bank', c: HISLE.c, r: HISLE.r, y: 0.05, bed: -2.6 });
  E.push({ t: 'hyangwonjeong', c: HISLE.c, y: 0, r: 2.9 });
  E.push({ t: 'plank_bridge', a: [icx, icz - HISLE.r + 0.3], b: [icx, hz0 - 1.2], w: 1.8, ya: 0.12, yb: 0.12, rise: 0.6, rows: 3, bed: -2.6 });
  E.push({ t: 'lotus', c: [hx0 + 14, hz1 - 12], r: 9, y: -1.2, n: 60, seed: 5 });
  E.push({ t: 'lotus', c: [hx1 - 12, hz1 - 10], r: 7, y: -1.2, n: 40, seed: 9 });
}
// Geoncheonggung (1873): the king's residence built after a scholar's house, unpainted — its walls and
// gates, the king's quarters (Jangandang) on the west, the queen's (Gonnyeonghap) on the east
{
  const [gx0, gz0, gx1, gz1] = GEONCHEONG, xm = -124, U = { wood: 'timber', column: 'timber', soffit: 'timber', lattice: 'shoji', leaky: 'shoji', base: 'granite_korea', floor: 'granite_korea', plinth: 'granite_korea' };
  E.push({ t: 'ming_wall', a: [gx0, gz1], b: [gx1, gz1], y: 0, h: 3, th: 0.6, gates: [{ at: -150 - gx0, w: 2.6, h: 2.5 }, { at: -116 - gx0, w: 2.6, h: 2.5 }] });
  E.push({ t: 'ming_wall', a: [gx0, gz0], b: [gx1, gz0], y: 0, h: 3, th: 0.6, gates: [] });
  E.push({ t: 'ming_wall', a: [gx0, gz0], b: [gx0, gz1], y: 0, h: 3, th: 0.6, gates: [] });
  E.push({ t: 'ming_wall', a: [gx1, gz0], b: [gx1, gz1], y: 0, h: 3, th: 0.6, gates: [{ at: 50, w: 2.6, h: 2.5 }] });
  E.push({ t: 'ming_wall', a: [xm, gz0], b: [xm, gz1], y: 0, h: 2.6, th: 0.5, gates: [{ at: 50, w: 2.2, h: 2.2 }] });
  const house = (rect, front, H = 3.1) => E.push({ t: 'ming_hall', rect, y: 0, H, front, roof: 'xieshan', plat: 0.75, eave: 1.2, sweep: 0.5, pal: U });
  house([-170, -266, -136, -255], 's');                        // Jangandang
  house([-170, -255, -161, -234], 'e', 2.9);                   // its wing
  house([-112, -274, -82, -263], 's');                         // Gonnyeonghap
  house([-82, -263, -72, -240], 'w', 2.9);                     // its wing, toward Okhoru
  house([-160, -210, -132, -203], 'n', 2.7);                   // the service range by the gate
  house([-108, -210, -84, -203], 'n', 2.7);
}
// ranges of service rooms (haenggak) along the inner side of the east and west walls, halls of the
// eastern palace and the offices
for (const [x0, x1] of [[px1 - 16, px1 - 6], [px0 + 6, px0 + 16]]) for (const z0 of [-280, -200, -120, 60, 180]) {
  if (x0 < 0 && z0 > -60 && z0 < 60) continue;
  E.push({ t: 'ming_hall', rect: [x0, z0, x1, z0 + 46], y: 0, H: 3.4, front: x0 > 0 ? 'w' : 'e', roof: 'xieshan', plat: 0.5, eave: 1.1, sweep: 0.5, simple: true });
}
for (const [x, z] of [[110, -60], [110, 10], [100, 90], [-60, 190], [70, 190], [100, -200]]) E.push({ t: 'ming_hall', rect: [x - 14, z - 7, x + 14, z + 7], y: 0, H: 3.8, front: 's', roof: 'xieshan', plat: 0.7, eave: 1.3, sweep: 0.6, simple: true });
// the avenue of the ministries south of the gate
E.push({ t: 'lane', rect: AVENUE, y: 0.03, mat: 'granite_korea' });
for (const [i, r] of MINISTRIES.entries()) {
  const [mx0, mz0, mx1, mz1] = r;
  wall([mx0, mz0], [mx1, mz0], [], 3.2); wall([mx0, mz1], [mx1, mz1], [], 3.2);
  const side = r[0] < 0 ? mx1 : mx0;
  wall([side, mz0], [side, (mz0 + mz1) / 2 - 3], [], 3.2); wall([side, (mz0 + mz1) / 2 + 3], [side, mz1], [], 3.2);
  wall([r[0] < 0 ? mx0 : mx1, mz0], [r[0] < 0 ? mx0 : mx1, mz1], [], 3.2);
  E.push({ t: 'ming_hall', rect: [(mx0 + mx1) / 2 - 16, (mz0 + mz1) / 2 - 6, (mx0 + mx1) / 2 + 16, (mz0 + mz1) / 2 + 6], y: 0, H: 4.2, front: r[0] < 0 ? 'e' : 'w', roof: 'xieshan', plat: 0.7, eave: 1.4, sweep: 0.7, simple: i > 1 });
}

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('throne court', [cx0, cz0, cx1, cz1], 0, 'open'), room('hall', [-15, 13, 15, 34], 3.2, 'hall'),
  room('gyeonghoeru island', [-104 - 40 + 2, 8, -108, 18], 0.5, 'open'), room('hyangwonji island', [HISLE.c[0] - 2, HISLE.c[1] + 4.5, HISLE.c[0] + 2, HISLE.c[1] + 6.5], 0, 'open')];
const walks = [[[0, 300], [0, 236], [0, 160], [0, 132], [0, 92], [0, 56]]];
walks[0].y0 = 0;

export const palace = {
  id: 'joseon-seoul-gyeongbokgung',
  name: { en: 'Gyeongbokgung', zh: '景福宫' },
  era: { en: 'Joseon, c. 1888', zh: '朝鲜王朝，约1888年' },
  style: 'joseon',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 70], facing: 'n' },
  bounds: [-200, -300, 200, 360],
  bakeBounds: [-175, -240, 125, 245],
  view: [-38, 4, 38, 50],
  bakeTop: 30,
  elements: E,
  rooms,
  walks,
};
export default palace;
