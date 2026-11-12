// Delphi about 400 BC (docs/settlements/delphi.md §4): the Temple of Apollo on its terrace (with the altar of the Chians, the Serpent
// Column, the Naxian sphinx and the offerings), and the sanctuary below and above it: the Sacred Way with its treasuries (the Athenian
// among them) and the Athenian Stoa under the polygonal wall, the theatre and the stadium above, the Castalian spring, the gate and
// the forecourt. Elements; the heights come from layout.js.
import { STAIR, TT, TT_Y, TREASURIES, STOA, THEATRE, STADIUM, STADIUM_Y, SPRING, SPRING_Y, WAY, WAY2, wayY, way2Y, wayPoints, FC, FC_Y, height, WALL_S } from './layout.js';
import { terraceDedications, wayDedications } from './votives.js';
import { temple, treasury, stoa, terraceMonuments, terraceWalls, retain } from './buildings.js';

const room = (id, rect, y, kind) => ({ id, rect, y, kind });

// ── the temple's terrace
const T = [];
const tr = temple(T);
T.push({ t: 'floor', rect: [TT[0] + 0.5, TT[1] + 0.5, TT[2] - 0.5, TT[3] - 0.5], y: TT_Y + 0.03, th: 0.3, mat: 'limestone', walk: false });
terraceMonuments(T);
terraceDedications(T);
const rib = (P, o) => ({ t: 'ribbon', pts: P.map((p) => [p[0], p[2]]), ys: P.map((p) => p[1]), ...o });
T.push(rib(wayPoints(WAY, wayY).filter((p) => p[2] < 30), { w: 3.6, mat: 'flagstone', kerb: false, lift: 0.04 }));
const terraceRooms = [room('the terrace', [-34, -20, 90, 24], TT_Y, 'open'), room('before the temple', [30, -12, 70, 12], TT_Y, 'open'), ...tr.rooms];
const twalks = [[[88, 26], [66, 8], [54, 6], [40, 4], [31.5, -1], [26, -1], [20.5, -1], [12, -1], [4, -3.5], [-6, -3.5], [-12, -1], [-15.2, -1], [-17.5, -1], [-20, 2], [-21, -1.5]]];
twalks[0].y0 = TT_Y;
export const temple_plan = {
  id: 'delphi-temple',
  name: { en: 'The Temple of Apollo, Delphi', zh: '德尔斐阿波罗神庙' },
  era: { en: 'Delphi, about 400 BC', zh: '德尔斐，约公元前400年' },
  style: 'delphi',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [88, 26], facing: 'n' },
  bounds: [-40, -26, 96, 30],
  view: [-30, -14, 31, 12],
  viewY: tr.ST,
  bakeTop: TT_Y + 18,
  elements: T,
  rooms: terraceRooms,
  walks: twalks,
};

// ── the sanctuary
const S = [];
terraceWalls(S);
S.push({ t: 'stair', rect: STAIR, dir: 'n', y0: 13.1, y1: TT_Y, riser: 0.17, base: 11, mat: 'limestone' });
S.push(rib(wayPoints(WAY, wayY).filter((p) => p[2] >= 24 && !(p[0] > 85.9 && p[0] < 86.1 && p[2] < 43.9)), { w: 3.6, mat: 'flagstone', kerb: true, lift: 0.04 }));
S.push(rib(wayPoints(WAY2, way2Y), { w: 2.4, mat: 'flagstone', kerb: false, lift: 0.04 }));
wayDedications(S);
const sanctRooms = [];
for (const t of TREASURIES) sanctRooms.push(treasury(S, t));
STOA.y = STOA.y ?? 0;
sanctRooms.push(stoa(S));
// the votive statues on their bases along the Way's legs
{
  const spots = [[60, 98.5], [72, 97.8], [88, 98], [52, 76.5], [74, 76.5], [88, 73], [84, 56.5], [60, 56.4], [40, 56.5], [20, 56.4], [0, 56.5], [8, 42.5], [30, 42.5], [50, 42.5], [78, 42.5]];
  spots.forEach(([x, z], i) => S.push({ t: 'ex_voto', at: [x, z], yaw: i % 2 ? Math.PI : 0, kind: i % 5 === 2 ? 'group' : 'man', h: 1.9 + (i % 3) * 0.15, y: height(x, z) }));
  S.push({ t: 'ex_voto', at: [-6, 56.5], yaw: 0, kind: 'bull', y: height(-6, 56.5) });
}
// the theatre in its first form, cut in the slope: the small round orchestra, the benches on the earth bank
S.push({ t: 'orchestra', c: THEATRE.c, y: THEATRE.y, r: THEATRE.r });
S.push({ t: 'theatron', c: THEATRE.c, y: THEATRE.y, d0: THEATRE.d0, rows: THEATRE.rows, tread: THEATRE.tread, rise: THEATRE.rise, facets: THEATRE.facets, end: THEATRE.end, base: THEATRE.y - 8 });
retain(S, [THEATRE.c[0] - 24, THEATRE.c[1] + 9], [THEATRE.c[0] + 24, THEATRE.c[1] + 9], THEATRE.y - 0.1, -1, 400);
// the stadium: the earthen track, stone starting sills at its east end with the grooves for the runners' toes, the turning post at the west, the stone seat of the judges
{
  const [x0, z0, x1, z1] = STADIUM, y = STADIUM_Y;
  retain(S, [x0, z1], [x1, z1], y, -1, 500);
  S.push({ t: 'block', rect: [x1 - 3.0, z0 + 2.0, x1 - 1.8, z1 - 2.0], y0: y - 0.3, y1: y + 0.06, mat: 'limestone', collide: false });
  for (let z = z0 + 2.3; z < z1 - 2.2; z += 0.72) S.push({ t: 'block', rect: [x1 - 2.95, z, x1 - 1.85, z + 0.07], y0: y + 0.055, y1: y + 0.075, mat: 'marble_dark', collide: false });
  S.push({ t: 'block', rect: [x0 + 2.0, (z0 + z1) / 2 - 0.4, x0 + 2.8, (z0 + z1) / 2 + 0.4], y0: y - 0.3, y1: y + 1.5, mat: 'limestone' });
  S.push({ t: 'block', rect: [x1 - 42, z0 - 0.6, x1 - 38.5, z0 + 0.9], y0: y - 0.2, y1: y + 0.9, mat: 'marble' });
}
// the Castalian spring: the fountain house with its basin, benches, lion-head spouts, against the foot of the cliff; the paved court
{
  const [x0, z0, x1, z1] = SPRING;
  S.push({ t: 'fountain_house', rect: [x0, z0, x1, z1], front: 'w', y: SPRING_Y });
  S.push({ t: 'floor', rect: [x0 - 9, z0 - 1, x0 - 0.3, z1 + 1], y: SPRING_Y, th: 0.4, mat: 'flagstone', walk: false });
  for (const z of [z0 - 0.5, z1 + 0.5]) S.push({ t: 'block', rect: [x0 - 8, z - 0.3, x0 - 3, z + 0.3], y0: SPRING_Y, y1: SPRING_Y + 0.5, mat: 'limestone' });
  retain(S, [x0 - 9, z0 - 1], [x0 - 9, z1 + 1], SPRING_Y, 1, 600, { rough: true, th: 0.8 });
}
// the gate's forecourt: stalls of the votive sellers beside the way in
{
  [[100.2, 112, 103.6, 114.4], [100.2, 119, 103.6, 121.4], [88.5, 116, 92, 118.4], [88.5, 123, 92, 125.4], [106, 124, 109.4, 126.4]].forEach((r, i) => S.push({ t: 'stall', rect: r, y: FC_Y, seed: i }));
}
// the forecourt as a market: two more rows of stalls, the water trough, benches in the shade of the planes, a herm at the gate, braziers
{
  const y = FC_Y;
  for (let k = 0; k < 6; k++) S.push({ t: 'stall', rect: [108.6 + k * 6.6, 108.6, 112.0 + k * 6.6, 111.0], y, seed: 20 + k });
  for (let k = 0; k < 5; k++) S.push({ t: 'stall', rect: [110 + k * 7, 125.6, 113.4 + k * 7, 128.0], y, seed: 40 + k });
  for (const [x, z] of [[104.5, 118], [123, 119.5], [146, 118.5]]) S.push({ t: 'tree', kind: 'plane', at: [x, z], y, seed: Math.round(x) });
  for (const [x, z, yw] of [[106.2, 121.5, 0], [125.5, 116.5, 0], [141, 121, Math.PI]]) S.push({ t: 'stone_bench', at: [x, z], y, yaw: yw, len: 2.4 });
  S.push({ t: 'block', rect: [116, 119.6, 119.4, 120.4], y0: y, y1: y + 0.6, mat: 'limestone' }, { t: 'block', rect: [116.1, 119.7, 119.3, 120.3], y0: y + 0.5, y1: y + 0.52, mat: 'water', collide: false });
  S.push({ t: 'brazier', at: [101.8, 110.6], y }, { t: 'brazier', at: [134, 112.8], y }, { t: 'basin', at: [93.2, 109.3], y: FC_Y + 0.35 });
  S.push({ t: 'herm', at: [93, 111.3], y: FC_Y + 0.3, rot: 0 }, { t: 'herm', at: [99.6, 111.3], y: FC_Y + 0.3, rot: 0 });
  // the cliffs' side: the wall holding the lane above
}
// the theatre's front row of stone for the priests, the thymele in the orchestra, trees on the bank behind
{
  const [cx, cz] = THEATRE.c;
  for (const a of [-0.55, -0.27, 0, 0.27, 0.55]) { const x = cx + Math.sin(a) * (THEATRE.d0 + 0.7), z = cz - Math.cos(a) * (THEATRE.d0 + 0.7); S.push({ t: 'stone_bench', at: [x, z], y: THEATRE.y - 0.1, yaw: -a + Math.PI / 2 * 0 + 0, len: 1.9, mat: 'marble' }); }
  S.push({ t: 'block', rect: [cx - 0.6, cz - 0.6, cx + 0.6, cz + 0.6], y0: THEATRE.y - 0.3, y1: THEATRE.y + 0.35, mat: 'limestone' });
  for (const [dx, dz] of [[-24, -34], [18, -36], [34, -22], [-34, -18], [4, -40]]) { const x = cx + dx, z = cz + dz; S.push({ t: 'tree', kind: dx % 2 ? 'cypress' : 'holm', at: [x, z], y: height(x, z), seed: dx * 3 }); }
}
// the stadium: trees on its banks, benches for the judges, the athletes' basin, a herm at the starting sills
{
  const [x0, z0, x1, z1] = STADIUM, y = STADIUM_Y;
  for (let k = 0; k < 7; k++) { const x = x0 + 10 + k * 14, z = z1 + 5 + (k % 2) * 3; S.push({ t: 'tree', kind: k % 3 ? 'cypress' : 'holm', at: [x, z], y: height(x, z), seed: 70 + k }); }
  for (let k = 0; k < 4; k++) { const x = x1 - 20 - k * 22; S.push({ t: 'stone_bench', at: [x, z0 - 1.8], y: height(x, z0 - 1.8), yaw: Math.PI, len: 2.4 }); }
  S.push({ t: 'basin', at: [x1 - 6, z1 + 2.2], y: y + 0.0 }, { t: 'herm', at: [x1 - 3.6, z0 + 1.3], y, rot: -Math.PI / 2 }, { t: 'herm', at: [x1 - 3.6, z1 - 1.3], y, rot: -Math.PI / 2 });
  S.push({ t: 'tree', kind: 'plane', at: [x1 + 5, z0 + 10], y: height(x1 + 5, z0 + 10), seed: 3 });
}
// the spring: planes in the ravine, benches, a niche with offerings
{
  const [x0, z0] = SPRING;
  for (const [dx, dz] of [[-16, -4], [-14, 6], [-20, 1]]) { const x = x0 + dx, z = z0 + 9 + dz; S.push({ t: 'tree', kind: 'plane', at: [x, z], y: height(x, z), seed: 5 + dx }); }
  for (const [dx, dz] of [[-12, 4], [-11, 3]]) { const x = x0 + dx, z = z0 + dz; S.push({ t: 'tree', kind: 'bay', at: [x, z], y: height(x, z), seed: dx }); }
  S.push({ t: 'offering_table', at: [x0 - 6.8, 0], y: SPRING_Y, yaw: Math.PI / 2, seed: 31 });
}
void FC; void WALL_S; void TT;
const swalks = [wayPoints(WAY, wayY, 4).map(([x, , z]) => [x, z]).filter(([, z]) => z >= 26)];
swalks[0].y0 = wayY(0);
export const sanctuary = {
  id: 'delphi-sanctuary',
  name: { en: 'The Sanctuary of Apollo, Delphi', zh: '德尔斐阿波罗圣所' },
  era: { en: 'Delphi, about 400 BC', zh: '德尔斐，约公元前400年' },
  style: 'delphi',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [98, 134], facing: 'n' },
  bounds: [-125, -135, 165, 140],
  bakeTop: 64,
  elements: S,
  rooms: sanctRooms,
  walks: swalks,
};
export default sanctuary;
