// Gyeongbokgung about 1430 (docs/settlements/joseon-seoul.md §2–§4): the wall and its gates; on the
// axis Gwanghwamun on its stone base, Heungnyemun, the Yeongjegyo bridge, Geunjeongmun, the cloister
// round the throne court, Geunjeongjeon on its two tiers, Sajeongjeon, Gangnyeongjeon, Gyotaejeon;
// Gyeonghoeru in its pond; the ministries along the avenue.

import { PALACE, POND, ISLAND, AVENUE, MINISTRIES, STREAM } from './layout.js';

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
E.push({ t: 'throne_hall', rect: [-15, 13, 15, 34], y: 3.2, H: 6.8, bays: [5, 5], gilt: false, d: 0.6, screen: 'irworo', elephants: false, daisW: 4.6, daisD: 2.8 });
E.push({ t: 'qing_hall', rect: [-15, 13, 15, 34], y: 3.2, H: 6.8, double: 5.5, roof: 'xieshan', bays: [5, 5], front: 's', four: true, plat: 0.3, orn: { joseon: true, figures: 7 }, dapo: { tiers: 3, inter: 2 } });
// the inner halls, with their own walled courts
E.push({ t: 'ming_hall', rect: [-14, -52, 14, -38], y: 0, H: 5, front: 's', four: true, roof: 'xieshan', plat: 1, eave: 1.6, sweep: 0.8, orn: { figures: 5 }, dapo: { tiers: 3, inter: 2 } });
for (const [z, w] of [[-108, 34], [-165, 32]]) {
  // Gangnyeongjeon and Gyotaejeon: hip-and-gable roofs with no main ridge (muryang), brackets on the posts only
  E.push({ t: 'ming_hall', rect: [-w / 2, z - 7, w / 2, z + 7], y: 0, H: 4.6, front: 's', four: true, roof: 'xieshan', muryang: true, plat: 1, eave: 1.5, sweep: 0.8, orn: { figures: 5 }, dapo: { tiers: 2, inter: 0 } });
  wall([-w / 2 - 14, z - 20], [w / 2 + 14, z - 20], [], 3.6); wall([-w / 2 - 14, z + 22], [-5, z + 22], [], 3.6); wall([5, z + 22], [w / 2 + 14, z + 22], [], 3.6);
  wall([-w / 2 - 14, z - 20], [-w / 2 - 14, z + 22], [], 3.6); wall([w / 2 + 14, z - 20], [w / 2 + 14, z + 22], [], 3.6);
}
for (const y of [1, 2, 3]) E.push({ t: 'block', walk: true, rect: [-40 + y * 3, -232 + y * 8, 40 - y * 3, -224 + y * 8], y0: 0, y1: y * 0.9, mat: 'brick_grey' });
// Gyeonghoeru: the pond's stone banks, the island, three bridges, the pavilion
E.push({ t: 'water_rect', rect: POND, y: -1.2 });
const [ox0, oz0, ox1, oz1] = POND;
for (const [a, b] of [[[ox0, oz0], [ox1, oz0]], [[ox0, oz1], [ox1, oz1]], [[ox0, oz0], [ox0, oz1]], [[ox1, oz0], [ox1, oz1]]]) E.push({ t: 'canal_wall', a, b, y: 0.05, bed: -2.6, th: 0.8 });
E.push({ t: 'block', walk: true, rect: ISLAND, y0: -2.6, y1: 0.5, mat: 'granite_korea' });
for (const z of [-20, -4, 12]) E.push({ t: 'block', walk: true, rect: [ISLAND[2], z - 2.5, ox1 + 0.5, z + 2.5], y0: -1.6, y1: 0.5, mat: 'granite_korea' });
E.push({ t: 'nu', rect: [-142, -24, -108, 4], y: 0.5, bays: [7, 5], h1: 4.8, h2: 4.6 });
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
const rooms = [room('throne court', [cx0, cz0, cx1, cz1], 0, 'open'), room('hall', [-15, 13, 15, 34], 3.2, 'hall')];
const walks = [[[0, 300], [0, 236], [0, 160], [0, 132], [0, 92], [0, 56]]];
walks[0].y0 = 0;

export const palace = {
  id: 'joseon-seoul-gyeongbokgung',
  name: { en: 'Gyeongbokgung', zh: '景福宫' },
  era: { en: 'Joseon, c. 1430', zh: '朝鲜王朝，约1430年' },
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
