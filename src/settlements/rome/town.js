// The insulae of the Campus Martius (docs/settlements/rome.md §5): in 100 m tiles, each in full
// (shops, windows, shutters, balconies, cornices) near and in outline far (as src/settlements/lod.js, but in 160 m tiles:
// fewer plan x material buckets, DESIGN geometry budget).
import { RADIUS, VIA_LATA, lots, inRect, rows, INN, FULLER, STADIUM, saeptaRows, quayRows, riverEdge, fountains, fills, gardens, FORUM, TEMPLE, PISTRINUM, LATRINE } from './layout.js';
import '../../styles/roman/ways.js';
import '../../styles/roman/houses.js';
import { DOMUS, LITTER, lifePlan } from './life.js';
/** lodTiles of src/settlements/lod.js with a wider tile (the geometry budget counts plan x material buckets). */
function tiles160(id, style, elements, { near, R, entrance, T = 160 }) {
  const tiles = new Map();
  for (const e of elements) {
    const [x, z] = e.rect ? [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2] : (e.at ?? e.c);
    const k = `${Math.floor(x / T)},${Math.floor(z / T)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of tiles) {
    const [i, j] = k.split(',').map(Number), center = [i * T + T / 2, j * T + T / 2];
    const base = { style, origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-R, -R, R, R], entrance, center };
    plans.push({ ...base, id: `${id}-${k}`, near, elements: list });
    plans.push({ ...base, id: `${id}-${k}-far`, far: near, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}
const site = (id, elements, rooms = []) => ({ id, style: 'rome-site', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' } });
export async function town() {
  // the lot by the street north of the Pantheon holds the atrium house with its thermopolium (§4.4), walked into
  const same = (r, q) => r.every((v, i) => Math.abs(v - q[i]) < 1);
  const free = lots().filter((l) => !inRect(DOMUS, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) && !same(l.rect, INN) && !same(l.rect, FULLER));
  const inn = lots().find((l) => same(l.rect, INN)), full = lots().find((l) => same(l.rect, FULLER));
  const R = (r, u0, u1, d0, d1) => [r[0] + u0, r[3] - d1, r[0] + u1, r[3] - d0];                  // the frame of a building with its front on the south
  const houses = { id: 'rome-houses', style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' },
    elements: [{ t: 'caupona', rect: inn.rect, front: 's', seed: inn.seed }, { t: 'fullonica', rect: full.rect, front: 's', seed: full.seed }],
    rooms: [
      { id: 'caupona-bar', rect: R(inn.rect, 0.6, 8.4, 0.6, 7.9), y: 0, kind: 'hall', market: false },
      { id: 'caupona-stable', rect: R(inn.rect, 12.7, 19.4, 0.6, 7.9), y: 0, kind: 'hall', market: false },
      { id: 'caupona-court', rect: R(inn.rect, 0.6, 17.4, 9.0, 13.6), y: 0, kind: 'hall', market: false },
      { id: 'fullonica-shop', rect: R(full.rect, 0.6, 17.4, 0.6, 5.9), y: 0, kind: 'hall', market: false },
      { id: 'fullonica-court', rect: R(full.rect, 0.6, 17.4, 6.5, 14.6), y: 0, kind: 'hall', market: false },
    ] };
  const [fx0, fz0, fx1, fz1] = FORUM, zm = (fz0 + fz1) / 2, cl = (a, b, side, gaps) => ({ t: 'colonnade', a, b, at: a, y: 0, h: 7.6, step: 3.9, depth: 5, side, gaps });
  const forum = [
    { t: 'forum_floor', rect: FORUM, y: 0 },
    { t: 'forum_kit', rect: FORUM, temple: TEMPLE, at: [(FORUM[0] + FORUM[2]) / 2, (FORUM[1] + FORUM[3]) / 2], seed: 5 },
    cl([TEMPLE[2] + 2, fz0 + 5], [fx1 - 6, fz0 + 5], -1), cl([TEMPLE[2] + 2, fz1 - 5], [fx1 - 6, fz1 - 5], 1),
    cl([fx1 - 5, fz0 + 5], [fx1 - 5, fz1 - 5], -1, [[zm - fz0 - 5 - 7, zm - fz0 - 5 + 7]]),
    { t: 'temple', rect: TEMPLE, at: [(TEMPLE[0] + TEMPLE[2]) / 2, (TEMPLE[1] + TEMPLE[3]) / 2], front: 'e', y: 0, h: 11.5, nf: 6, podium: 2.6 },
    ...[[-84, -142, 0], [-84, -96, Math.PI], [-102, -146, 0], [-102, -92, Math.PI], [-124, -146, 0], [-124, -92, Math.PI]].map(([x, z, r], i) => ({ t: 'statue', at: [x, z], y: 0, rot: r, h: 2.0, base: 1.3, mat: i % 2 ? 'marble' : 'gilt_bronze' })),
  ];
  // the ways: basalt paving on the Via Lata and the two cross streets in 100 m pieces, the stepping stones at the alleys, street furniture, the closed alleys, the gardens
  const xs = VIA_LATA.x, hw = VIA_LATA.w / 2 + 0.4, zmax = Math.floor(Math.sqrt((RADIUS - 30) ** 2 - xs * xs)), ways = [];
  for (let a = -zmax; a < zmax; a += 100) {
    const b = Math.min(zmax, a + 100);
    ways.push({ t: 'paving', rect: [xs - hw, a, xs + hw, b], cross: [[-175, 5.4], [165, 5.4]] });
    for (let s = a; s < b; s += 50) ways.push({ t: 'street_kit', at: [xs, s + 25], along: 'z', len: 50, half: hw, seed: 300 + s, shrine: Math.abs(s + 200) < 25 ? [20, 1] : Math.abs(s - 140) < 25 ? [10, -1] : null });
  }
  for (let a = -184; a < xs - hw; a += 100) {
    const b = Math.min(xs - hw, a + 100);
    ways.push({ t: 'paving', rect: [a, -180.5, b, -169.5] }, { t: 'paving', rect: [a, 160, b, 170.5] });
    for (let s = a; s < b; s += 50) ways.push({ t: 'street_kit', at: [s + 25, -175], along: 'x', len: 50, half: 5.4, seed: 500 + s, shrine: s === -34 ? [10, 1] : null }, { t: 'street_kit', at: [s + 25, 165], along: 'x', len: 50, half: 5.4, seed: 700 + s });
  }
  for (const f of fills()) { ways.push({ t: 'alley_fill', ...f }); if (f.front === 'e') ways.push({ t: 'crossing', at: [xs, (f.rect[1] + f.rect[3]) / 2], along: 'x', w: VIA_LATA.w - 2.4 }); }
  for (const g of gardens()) ways.push({ t: 'hortus', ...g });
  ways.push({ t: 'arena_kit', rect: [STADIUM[0] + 28, STADIUM[1] + 28, STADIUM[2] - 28, STADIUM[3] - 28], y: 0 });
  // the Tiber's east quay: the embankment wall and the paved quay, flights of steps into the water, treadwheel cranes, warehouses
  { const E = riverEdge(1);
    for (let i = 0; i + 8 < E.length; i += 8) ways.push({ t: 'quay', at: E[i + 4], edge: E.slice(i, i + 9), land: 1, level: -5 });
    for (const i of [4, 14, 24, 31]) if (E[i]) ways.push({ t: 'landing', at: [E[i][0], E[i][1]], land: 1, level: -5, w: 4 });
    for (const i of [9, 20]) if (E[i]) ways.push({ t: 'crane', at: [E[i][0] + 5.5, E[i][1]], rot: -Math.PI / 2, y: 0.06 });
    for (const r of quayRows()) ways.push({ t: 'taberna_row', ...r }); }
  const tiles = tiles160('rome-insulae', 'roman', [...ways, ...free.map((l) => ({ t: 'insula', ...l })), ...rows().map((r) => ({ t: 'taberna_row', ...r })), ...saeptaRows().map((r) => ({ t: 'taberna_row', ...r })), ...fountains().map((f) => ({ t: 'fountain', ...f })), ...forum], { near: 270, R: RADIUS, entrance: { at: [0, -200], facing: 's' } });
  const [x0, z0, x1, z1] = DOMUS;
  return [...tiles, houses,
    site('rome-domus', [{ t: 'domus', rect: DOMUS, y: 0 }, { t: 'litter', at: LITTER.at, y: 0, rot: LITTER.rot }], [
      { id: 'atrium', rect: [x0 + 3.9, z0 + 5.1, x1 - 3.9, z1 - 5.9], y: 0, kind: 'hall', market: false },
      { id: 'thermopolium', rect: [x0 + 0.6, z1 - 5.6, (x0 + x1) / 2 - 1.6, z1 - 0.6], y: 0, kind: 'hall', market: false },
      { id: 'tablinum', rect: [(x0 + x1) / 2 - 2.4, z0 + 0.6, (x0 + x1) / 2 + 2.4, z0 + 4.6], y: 0, kind: 'hall', market: false }]),
    { id: 'rome-street', style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' },
      elements: [{ t: 'pistrinum', rect: PISTRINUM, front: 's', y: 0 }, { t: 'latrine', rect: LATRINE, front: 's', y: 0 }],
      rooms: [{ id: 'pistrinum', rect: [PISTRINUM[0] + 0.5, PISTRINUM[1] + 0.5, PISTRINUM[2] - 0.5, PISTRINUM[3] - 0.5], y: 0, kind: 'hall', market: false }, { id: 'latrine', rect: [LATRINE[0] + 0.5, LATRINE[1] + 0.5, LATRINE[2] - 0.5, LATRINE[3] - 0.5], y: 0, kind: 'hall', market: false }] },
    lifePlan()];
}
