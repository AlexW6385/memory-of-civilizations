// Brasília about 1970 — the town (docs/settlements/brasilia.md §5, §10): the ministries in two files along the Esplanade with the Itamaraty
// and the Justice palaces at the Congress end, the superquadra's eight blocks on pilotis with the commercial strip, the carriageways'
// and the avenue's traffic of cars and buses, the lamps and benches, and the people of the lawn, the pavements, the square and the
// plaza. Everything is placed from layout.js.
import { RADIUS, LAWN, ROAD_N, ROAD_S, AVENUE, SQ, SQ2, SQS, RING, MINISTRIES, ITAMARATY, JUSTICE, ALL_BLOCKS, SHOPS, CATH, PRACA, TUNNEL, POOLS, RAMP, PLATFORM, PARKS, CHAPEL, MUSEU, PLAYS, PITCH_AT, KIOSKS, CARTS, inRect, inBuilding, rng } from './layout.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-110, 0], facing: 'e' } });
const N = -Math.PI / 2, S = Math.PI / 2;   // heading east (rot −π/2) and west (π/2); north 0, south π
const CAR = ['car_cream', 'car_blue', 'car_red', 'car_black', 'car_cream', 'paint_white', 'car_blue'];
const KIND = ['beetle', 'beetle', 'beetle', 'aero', 'kombi'];

export async function town() {
  const rand = rng(1970), pick = (a) => a[Math.floor(rand() * a.length)];
  const B = [], L = [], P = [];
  // ── the buildings ──
  for (const m of MINISTRIES) B.push({ t: 'ministry', rect: m.rect, side: m.side, h: 38, seed: m.seed });
  B.push({ t: 'arcade_palace', rect: ITAMARATY, variant: 'arches', front: 'n' });
  B.push({ t: 'arcade_palace', rect: JUSTICE, variant: 'curtain', front: 's' });
  for (const b of ALL_BLOCKS) B.push({ t: 'superblock', rect: b.rect, h: 21.6, pilotis: 3.6, seed: b.seed, tile: b.tile });
  B.push({ t: 'shops_row', rect: SHOPS, floors: 2, seed: 5 });
  B.push({ t: 'chapel' }, { t: 'museu' }, { t: 'roadmarks' });
  for (const pk of PARKS) B.push({ t: 'parking', rect: pk.rect, side: pk.side });
  for (const r of PLAYS) B.push({ t: 'playground', rect: r });
  B.push({ t: 'pitch', rect: PITCH_AT });
  // the street furniture: bus shelters on the lawn's kerbs and the avenue's pavements, kiosks and vendors' carts where people gather
  for (const x of [-405, -310, -215, -130, -40]) { B.push({ t: 'bus_shelter', at: [x, -115.2], r: 2, seed: x }, { t: 'bus_shelter', at: [x - 30, 115.2], r: 0, seed: x + 1 }); }
  B.push({ t: 'bus_shelter', at: [15.2, 333.5], r: 1, seed: 3 }, { t: 'bus_shelter', at: [46.2, 316], r: 3, seed: 4 }, { t: 'bus_shelter', at: [46.2, 386], r: 3, seed: 5 }, { t: 'bus_shelter', at: [15.2, 380], r: 1, seed: 6 });
  KIOSKS.forEach(([x, z, r, kind], i) => { if (i < 6 || !inBuilding(x, z, 2)) B.push({ t: 'kiosk', at: [x, z], r, kind, seed: i + 1 }); });
  CARTS.forEach(([x, z, kind], i) => { if (!inBuilding(x, z, 1.5)) B.push({ t: 'cart', at: [x, z], r: i % 4, kind }); });

  // ── traffic ──
  const clear = (x, z, m) => !inBuilding(x, z, m);
  const lane = (axis, c, from, to, rot, gap0, gap1, n0 = 24, n1 = 60) => {
    for (let v = from + rand() * 20; v < to; v += n0 + rand() * (n1 - n0)) {
      const x = axis === 'x' ? v : c, z = axis === 'x' ? c : v;
      if (Math.hypot(x, z) > RADIUS - 40 || !clear(x, z, 2) || (gap0 !== undefined && v > gap0 && v < gap1)) continue;
      if (rand() < 0.14) B.push({ t: 'bus', at: [x, z], rot, mat: pick(['paint_blue', 'paint_blue', 'car_red', 'paint_ochre']) });
      else B.push({ t: 'car60', at: [x, z], rot, kind: pick(KIND), mat: pick(CAR) });
    }
  };
  for (const [R, z0] of [[ROAD_N, -139.2], [ROAD_S, 119.2]]) {
    // the eight-lane carriageway: four lanes each way, the outer ones the busiest (about the 4 m lane)
    const [x0, , x1] = R;
    lane('x', z0 + 1.8, x0 + 30, x1 - 60, N, -135, -115);
    lane('x', z0 + 5.4, x0 + 30, x1 - 60, N, -135, -115, 40, 90);
    lane('x', z0 + 14.6, x0 + 30, x1 - 60, S, -135, -115, 40, 90);
    lane('x', z0 + 18.2, x0 + 30, x1 - 60, S, -135, -115);
  }
  // the avenue south: the residential axis
  for (const [x, rot] of [[AVENUE[0] + 4, 0], [AVENUE[0] + 9, 0], [AVENUE[0] + 17, Math.PI], [AVENUE[0] + 22, Math.PI]]) lane('z', x, AVENUE[1] + 30, AVENUE[3] - 40, rot, undefined, undefined, 22, 55);
  // the ring road round the superquadra: its east and west sides, a bus at the stop by the shops
  for (const x of [SQ[0] - RING / 2 - 2.5, SQ[0] - RING / 2 + 2.5]) lane('z', x, SQ[1] + 10, SQ[3] - 10, x < SQ[0] - RING / 2 ? 0 : Math.PI, undefined, undefined, 60, 120);
  B.push({ t: 'bus', at: [AVENUE[0] - 4.2, 322], rot: 0, mat: 'paint_blue' }, { t: 'bus', at: [AVENUE[0] - 4.2, 345], rot: 0, mat: 'car_red' });
  // parked: the cars at the ministries' feet and the shops' kerb
  for (let z = SHOPS[1] + 4; z < SHOPS[3] - 3; z += 6.2 + rand() * 6) if (rand() < 0.75) B.push({ t: 'car60', at: [AVENUE[2] - 1.4, z], rot: 0, kind: pick(KIND), mat: pick(CAR) });
  // the car parks' bays: about two in five taken
  for (const pk of PARKS) {
    const [px0, pz0, px1, pz1] = pk.rect;
    for (const [bx, rot] of [[px0 + 0.5 + 2.5, S], [px1 - 0.5 - 2.5, N]]) for (let z = pz0 + 1.25; z < pz1 - 1.3; z += 2.5) if (rand() < 0.4) B.push({ t: 'car60', at: [bx, z], rot, kind: pick(KIND), mat: pick(CAR) });
  }
  for (const m of MINISTRIES) {
    const [x0, z0, x1, z1] = m.rect, zz = m.side === 'n' ? z1 + 6 : z0 - 6;
    if (rand() < 0.7) B.push({ t: 'car60', at: [x0 + 4 + rand() * 8, zz], rot: S, kind: pick(KIND), mat: pick(CAR) });
  }

  // ── lamps, benches, flags ──
  for (let x = -450; x < 80; x += 36) { L.push({ t: 'street_lamp', at: [x, -117], y: 0, h: 6.5 }, { t: 'street_lamp', at: [x, 117], y: 0, h: 6.5 }); }
  for (let z = AVENUE[1] + 12; z < AVENUE[3] - 20; z += 36) L.push({ t: 'street_lamp', at: [AVENUE[0] - 1.5, z], y: 0, h: 6.5 }, { t: 'street_lamp', at: [AVENUE[2] + 1.5, z], y: 0, h: 6.5 });
  for (let x = PRACA[0] + 12; x < PRACA[2] - 8; x += 40) for (const z of [-132, 132]) L.push({ t: 'street_lamp', at: [x, z], y: 0, h: 7 });
  for (let x = -420; x < -120; x += 52) for (const z of [-104, 104]) L.push({ t: 'bench', at: [x, z], y: 0, rot: z < 0 ? Math.PI : 0, len: 1.9, back: true });
  for (let x = SQ[0] + 14; x < SQ[2] - 10; x += 34) for (let z = SQ[1] + 14; z < SQ[3] - 8; z += 38) if (!inBuilding(x, z, 4) && !inBuilding(x, z + 2, 2)) L.push({ t: 'bench', at: [x, z], y: 0, rot: rand() * 6.28, len: 1.9, back: true });
  const [cx, cz] = CATH.c;
  for (let a = 0; a < 6.28; a += 0.42) { const x = cx + Math.cos(a) * (CATH.pool + 8), z = cz + Math.sin(a) * (CATH.pool + 8); if (Math.abs(x - cx) < 14 && z < cz) continue; L.push({ t: 'bench', at: [x, z], y: 0, rot: a + Math.PI / 2, len: 1.9, back: true }); }

  // ── people ──
  const woman = () => rand() < 0.45;
  const DRESS = ['cloth_white', 'cloth_blue', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_indigo'];
  const SK = ['skin_light', 'skin_medium', 'skin_medium', 'skin_dark', 'skin_dark'];
  const person = (x, z, rot, o = {}) => {
    if ((!o.inside && !clear(x, z, 0.8)) || (Math.abs(z) < 3.5 && x > -140 && x < 80) || P.some((q) => Math.hypot(q.at[0] - x, q.at[1] - z) < 1.3)) return;
    const w = o.w ?? woman(), t = rand();
    const o2 = o.kind === 'student' ? { dress: w ? 'robe' : 'trousers', cloth: 'cloth_white', cloth2: 'cloth_blue', hat: 'none', hair: w ? 'bun' : 'short', h: 0.8 }
      : o.kind === 'worker' ? { dress: 'trousers', cloth: pick(['cloth_ochre', 'cloth_brown', 'cloth_grey']), cloth2: pick(['cloth_brown', 'cloth_indigo']), hat: pick(['straw', 'cap']), hair: 'short', over: 'belt' }
      : o.kind === 'guard' ? { dress: 'trousers', cloth: 'prussian_blue', cloth2: 'prussian_blue', hat: 'cap', hair: 'short', over: 'belt' }
      : o.kind === 'nun' ? { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'veil', over: 'none' }
      : o.kind === 'priest' ? { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_black', hat: 'none', hair: 'short', over: 'none' }
      : w ? { dress: 'robe', cloth: pick(DRESS), cloth2: pick(['cloth_white', 'cloth_black']), hat: 'none', hair: pick(['bun', 'short', 'long']), over: pick(['none', 'belt']) }
        : { dress: 'trousers', cloth: t < 0.7 ? 'cloth_white' : pick(['cloth_blue', 'cloth_ochre']), cloth2: pick(['cloth_grey', 'cloth_black', 'cloth_indigo']), hat: 'none', hair: 'short', over: 'collar' };
    P.push({ t: 'figure', at: [x, z], y: o.y ?? 0, rot, seed: Math.floor(rand() * 1e9), skin: pick(SK), pose: o.pose, ...o2 });
  };
  // the Esplanade's lawn: along its paths and the carriageways' edges, in twos, talking; students and civil servants
  for (let k = 0; k < 70; k++) {
    const x = -440 + rand() * 330, edge = rand() < 0.55, z = edge ? (rand() < 0.5 ? -1 : 1) * (110 + rand() * 4) : (rand() - 0.5) * 8;
    const rot = edge ? (rand() < 0.5 ? N : S) : (rand() < 0.5 ? N : S) + (rand() - 0.5) * 0.3;
    person(x, z, rot, { kind: rand() < 0.15 ? 'student' : rand() < 0.1 ? 'worker' : undefined });
    if (rand() < 0.3) person(x + 1.0, z + 0.5, rot + Math.PI, { pose: 'talk' });
  }
  // the Salão Negro under the deck: visitors in twos before the busts and panels, guards at the door; on the deck: tourists, photographers, clerks at their lunch
  for (let k = 0; k < 10; k++) person(-6 + rand() * 38, -104 + rand() * 22, rand() * 6.28, { inside: true, kind: k < 2 ? 'student' : undefined });
  person(-7.5, -95.5, Math.PI / 2, { inside: true, kind: 'worker', w: false }); person(-7.5, -88.5, Math.PI / 2, { inside: true, kind: 'worker', w: false });
  for (let k = 0; k < 30; k++) { const x = -6 + rand() * 70, z = -100 + rand() * 200; if (Math.hypot(x - 38, z + 72) < 28 || Math.hypot(x - 38, z - 72) < 38 || (x > 28 && x < 48 && Math.abs(Math.abs(z) - 32) < 16) || Math.abs(z) < 3.5) continue; person(x, z, rand() * 6.28, { inside: true, y: 6.5, kind: rand() < 0.12 ? 'student' : undefined }); }
  // the palaces' lobbies: clerks and visitors at the reception, a guard at each door; sentries at the Planalto's ramp
  for (const [x0, x1, z0, z1, y, n] of [[-79, -43, 163, 193, 0.54, 7], [-79, -43, -193, -163, 0.54, 7], [156, 244, -176, -151, 0.66, 12], [172, 228, 151, 169, 0.66, 8]]) for (let k = 0; k < n; k++) person(x0 + rand() * (x1 - x0), z0 + rand() * (z1 - z0), rand() * 6.28, { inside: true, y, kind: k < 2 ? 'worker' : undefined });
  for (const [x, z, r, y] of [[200, -141, Math.PI, 0.3], [206, -141, Math.PI, 0.3], [201, 140.5, 0, 0.3], [207, 140.5, 0, 0.3], [-61, 159.2, 0, 0.5], [-61, -159.2, Math.PI, 0.5]]) person(x, z, r, { inside: true, kind: 'guard', w: false, y });
  // the ramp's apron and the pools: visitors, a priest and nuns by the Cathedral
  for (let k = 0; k < 22; k++) person(-112 + rand() * 16, -24 + rand() * 48, rand() * 6.28, {});
  for (let k = 0; k < 40; k++) person(PRACA[0] + 10 + rand() * 220, -120 + rand() * 240, rand() * 6.28, { kind: rand() < 0.12 ? 'student' : undefined });
  for (let k = 0; k < 26; k++) { const a = rand() * 6.28, r = CATH.pool + 3 + rand() * 9, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (z < cz - 30 && Math.abs(x - cx) < 10) continue; person(x, z, a + Math.PI / 2 + (rand() - 0.5), { kind: k < 3 ? 'nun' : k === 3 ? 'priest' : undefined }); }
  // the superquadra: under the pilotis and along the lawns, children at the school's lawn, women with baskets by the shops
  for (const b of ALL_BLOCKS) for (let k = 0; k < 3; k++) { const [x0, z0, x1, z1] = b.rect; person(x0 + 6 + rand() * (x1 - x0 - 12), (z0 + z1) / 2 + (rand() - 0.5) * 6, rand() * 6.28, {}); }
  for (const q of SQS) for (let k = 0; k < 24; k++) person(q[0] + 14 + rand() * (q[2] - q[0] - 28), q[1] + 14 + rand() * (q[3] - q[1] - 28), rand() * 6.28, { kind: rand() < 0.4 ? 'student' : undefined });
  // the playgrounds' children, the players on the pitch, a congregation at the little church's door
  for (const r of PLAYS) for (let k = 0; k < 6; k++) person(r[0] + 2 + rand() * (r[2] - r[0] - 4), r[1] + 2 + rand() * (r[3] - r[1] - 4), rand() * 6.28, { kind: 'student', inside: true });
  for (let k = 0; k < 8; k++) person(PITCH_AT[0] + 4 + rand() * (PITCH_AT[2] - PITCH_AT[0] - 8), PITCH_AT[1] + 3 + rand() * (PITCH_AT[3] - PITCH_AT[1] - 6), rand() * 6.28, { kind: 'worker', w: false, pose: 'talk', inside: true });
  for (let k = 0; k < 5; k++) person((CHAPEL[0] + CHAPEL[2]) / 2 + (rand() - 0.5) * 8, CHAPEL[3] + 2.5 + rand() * 3, rand() * 6.28, { inside: true });
  // inside the chapel and the museum: worshippers in the pews, visitors before the Marco
  for (let k = 0; k < 4; k++) person((CHAPEL[0] + CHAPEL[2]) / 2 + (k % 2 ? 2.2 : -2.2) * (1 + (k >> 1) * 0.3), CHAPEL[3] - 4 - k * 1.1, 0, { inside: true });
  for (let k = 0; k < 7; k++) person(MUSEU[0] + 4 + rand() * 18, MUSEU[1] + 4 + rand() * 18, rand() * 6.28, { inside: true });
  for (let z = SHOPS[1] + 3; z < SHOPS[3]; z += 5 + rand() * 5) person(SHOPS[0] - 1.0 - rand() * 3, z, rand() < 0.5 ? 0 : Math.PI, {});
  // the shops of the strip: a shopkeeper behind each counter, customers in the aisles, people at the doors
  { const n = Math.floor((SHOPS[3] - SHOPS[1] - 0.4) / 4.2); for (let k = 0; k < n; k++) { const z = SHOPS[1] + 0.4 + k * 4.2; person(SHOPS[0] + 3.4 + 0.4 + 3.6, z + 3.6, 0, { inside: true, kind: rand() < 0.4 ? 'worker' : undefined, w: rand() < 0.35 }); if (rand() < 0.6) person(SHOPS[0] + 3.4 + 0.4 + 2.2 + rand() * 2.5, z + 1.9, Math.PI + (rand() - 0.5) * 0.6, { inside: true }); if (rand() < 0.35) person(SHOPS[0] + 1.5, z + 1.5 + rand() * 2, rand() * 6.28, { inside: true }); } }
  // at the bus stops and kiosks: a few waiting
  for (const b of B.filter((q) => q.t === 'bus_shelter')) for (let k = 0; k < 2; k++) { const al = (k - 0.5) * 1.6, v = 0.3, r = b.r; const P = [[b.at[0] + al, b.at[1] + v], [b.at[0] + v, b.at[1] - al], [b.at[0] - al, b.at[1] - v], [b.at[0] - v, b.at[1] + al]][r]; person(P[0], P[1], [Math.PI, -Math.PI / 2, 0, Math.PI / 2][r], { inside: true }); }
  for (const b of B.filter((q) => q.t === 'kiosk')) { const r = b.r % 4; person(b.at[0] + [0, 1.8, 0, -1.8][r], b.at[1] + [1.8, 0, -1.8, 0][r], [0, Math.PI / 2, Math.PI, -Math.PI / 2][r], { inside: true }); }
  // the candangos: a gang of workers at the verge, the Presidential Guard before the Planalto
  for (let k = 0; k < 6; k++) person(-60 + k * 1.6, 144.5, S, { kind: 'worker', w: false });
  // the vehicles' fronts are not in the way: the people stand clear of the roadways (the carriageways are not walked by the still figures)
  void inRect; void POOLS; void RAMP; void PLATFORM; void TUNNEL; void LAWN;
  return [base('brasilia-buildings', 'brasilia', B), base('brasilia-life', 'life', [...L, ...P])];
}
