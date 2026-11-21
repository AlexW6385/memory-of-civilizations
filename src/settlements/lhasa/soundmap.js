// Where Lhasa's sounds are (docs/settlements/lhasa.md §19): the places of the emitters and the geometry the audio engine needs (soundscape.js's
// `LIFE.map`, the interface of Suzhou's and Bhaktapur's maps): the long horns on the Potala's roofs, the orchestra in the Deyang Shar, the chant in the
// halls, the prayer wheels and the pilgrims' circuit, the street's shops and tea houses, the printing house, the incense burners, the yaks, the mastiffs
// of the gates, the rooms. Pure data and functions of layout.js (no three.js). Coordinates: metres, +x east, +z south. [inferred throughout.]
import { RADIUS, STREET, SHOL, CHAPEL, PRINTERY, BENCHES, POND, shops, lots, inRect } from './layout.js';
import './voices.js';

/** Where the audio puts the listener when the engine gives none: the way in, below the palace. */
export const HOME = [-4, 60];
export const FAR = {};
export const WELLS = [];                                         // no bucket wells are known to the dossier
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];

/** The Great East Hall (plan.js 'potala_hall', floor 84 m) and the tomb hall of the Fifth Dalai Lama (plan.js 'tomb_chapel', floor 104.3 m), the Deyang Shar's court (floor 70 m). */
export const HALLS = { east: { r: [62, -92.5, 90, -66.7], y: 84 }, tomb: { r: [-27, -85.5, -3, -74.5], y: 104.3 }, court: { r: [100, -80, 145, -45], y: 70 } };
/** The row of prayer wheels on the circuit's north leg (town.js 'mani_gallery'), the circuit's legs (town.js people()), the stairs' foot. */
export const WHEELS = [[-150, -24, -211.2], [24, 150, -211.2]];
export const CIRCUIT = [[[150, 222], [-190, 222]], [[-213, 200], [-213, -40]], [[-150, -215], [150, -215]], [[213, -40], [213, 200]]];
export const PALACE_ROOF = [-10, 24];                           // the frontage roof, where the long horns are blown (the monks' place on the roof, town.js)
export const SANG = [-3.4, 166];                                // the street's incense burner (town.js)

// ── the trades of the houses and the street ────────────────────────────────────
/** The work heard from a house of each kind: [voice, gap in seconds [min, max], hours [from, to]]. */
export const WORK = {
  trade: [['lhsScale', [16, 40], [8, 18.5]], ['lhsMurmur', [24, 60], [8, 18.5]]],
  tea: [['lhsChurn', [14, 34], [6, 21]], ['lhsTeaBowl', [8, 20], [6.5, 21.5]]],
  print: [['lhsPrint', [10, 22], [8.5, 17]]],
  weaver: [['loom', [10, 24], [7, 18]]],
  home: [['kitchen', [14, 34], [5.5, 20.5]]],
};
let SITES = null;
/** The houses with sounds: { use, rect, at, id, work }: the street's shops and tea houses, the printing house, the houses of Shöl within 130 m of the lane's crossing (every fifth with a loom). */
export function sites() {
  if (SITES) return SITES;
  SITES = [];
  for (const s of shops()) if (s.kind !== 'stall') SITES.push({ use: s.kind, rect: s.rect, at: mid(s.rect), id: 's:' + Math.round(s.rect[0]) + ':' + Math.round(s.rect[1]), work: WORK[s.kind] });
  SITES.push({ use: 'print', rect: PRINTERY, at: mid(PRINTERY), id: 'print', work: WORK.print });
  const hs = lots().filter((l) => !l.farm && Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 - 134) < 130)
    .sort((a, b) => Math.hypot(...mid(a.rect).map((v, i) => v - [0, 134][i])) - Math.hypot(...mid(b.rect).map((v, i) => v - [0, 134][i]))).slice(0, 40);
  for (const l of hs) SITES.push({ use: l.seed % 5 === 0 ? 'weaver' : 'home', rect: l.rect, at: mid(l.rect), id: 'h:' + Math.round(l.rect[0]) + ':' + Math.round(l.rect[1]), work: l.seed % 5 === 0 ? WORK.weaver : WORK.home });
  return SITES;
}

// ── no canals, no bridges: the engine's boats and sedans are not asked for ──────
export const canalSpot = () => null;
export const canalTrack = () => null;
export const bridgeTrack = () => null;
export const shoreSpot = () => null;
export const streetTrack = () => null;
/** The pond behind the palace: a point on its water within `reach` of (x, z), or null. */
export function pondSpot(x, z, rnd, reach = 24) {
  if (Math.hypot(x - POND.c[0], z - POND.c[1]) > POND.rx + reach) return null;
  for (let k = 0; k < 10; k++) { const a = rnd() * Math.PI * 2, d = 3 + rnd() * reach, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (Math.hypot((px - POND.c[0]) / POND.rx, (pz - POND.c[1]) / POND.rz) < 0.85) return [px, pz]; }
  return null;
}

// ── the street and the circuit: walkers and caravans ────────────────────────────
const day = (a, b) => (h, rain) => h >= a && h < b && rain < 0.5;
/** A track along the street (x −2 … 2, from the south gate to the open ground below the stairs), passing the nearest point to (x, z) within `reach`, or null. */
function streetPath(x, z, rnd, reach, lead, north) {
  const d = Math.abs(x) < 12 ? 0 : Math.abs(x) - 12;
  if (z < 40 || z > 245 || d > reach) return null;
  const near = Math.max(75, Math.min(205, z)), a = Math.max(62, Math.min(236, near + (north ? lead * (0.6 + 0.8 * rnd()) : -lead)));
  const b = Math.max(62, Math.min(236, near + (north ? -lead * (0.8 + 0.8 * rnd()) : lead * 1.3))), off = (rnd() - 0.5) * 2;
  return Math.abs(b - a) < 10 ? null : { pts: [[off, a], [off, b]] };
}
/** A track along the pilgrims' circuit (sunwise) near (x, z) within `reach`: the leg nearest to the listener, from a little before the nearest point. */
function circuitPath(x, z, rnd, reach, lead) {
  let best = null;
  CIRCUIT.forEach(([a, b], i) => {
    const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (L * L))), px = a[0] + dx * t, pz = a[1] + dz * t, d = Math.hypot(px - x, pz - z);
    if (d < reach && (!best || d < best.d)) best = { d, i, t, L, a, b, dx: dx / L, dz: dz / L };
  });
  if (!best) return null;
  const s0 = Math.max(0, best.t * best.L - lead * (0.5 + 0.7 * rnd())), s1 = Math.min(best.L, best.t * best.L + lead * (0.8 + 0.8 * rnd()));
  if (s1 - s0 < 10) return null;
  const sd = 0.8 + rnd() * 0.8, nx = -best.dz * sd, nz = best.dx * sd;
  return { pts: [[best.a[0] + best.dx * s0 + nx, best.a[1] + best.dz * s0 + nz], [best.a[0] + best.dx * s1 + nx, best.a[1] + best.dz * s1 + nz]] };
}
export const TRACKS = [
  // a yak caravan in from the south gate to the foot of the palace, by day
  { key: 'lhsCaravan', voice: 'lhsCaravan', speed: 1.0, r50: 18, gap: [120, 260], ok: day(7, 17), get: (x, z, rnd) => (z > 60 ? streetPath(x, z, rnd, 120, 60, true) : null) },
  // pilgrims on the circuit, murmuring, with their wheels turning
  { key: 'lhsPilgrim', voice: 'lhsPilgrim', speed: 0.95, r50: 10, gap: [35, 80], ok: day(5.5, 19), get: (x, z, rnd) => circuitPath(x, z, rnd, 90, 34) },
  { key: 'lhsWheel', voice: 'lhsHandWheel', speed: 0.9, r50: 8, gap: [45, 100], ok: day(6, 18.5), get: (x, z, rnd) => circuitPath(x, z, rnd, 90, 28) },
];

// ── the planting and the town's hubbub ──────────────────────────────────────────
const WILLOWS = [[-30, 40], [-18, 42], [14, 41], [26, 40], [40, 43], [-44, 38]];
/** A tree to put a bird in near (x, z): the willows and poplars of the open ground below the palace (docs §15), the pond's willows, or null. */
export function treeSpot(x, z, rnd, reach = 40) {
  const near = [...WILLOWS, [POND.c[0] - 40, POND.c[1] + 18], [POND.c[0] + 36, POND.c[1] + 20], [POND.c[0], POND.c[1] - 34]].filter((p) => Math.hypot(p[0] - x, p[1] - z) < reach);
  return near.length ? near[Math.floor(rnd() * near.length)] : null;
}
export const bambooNear = () => 0;
export const lotusNear = () => 0;
export const leafNear = (x, z) => Math.min(1, 0.12 + 0.5 * (1 - sm(0, 60, Math.hypot(x - WILLOWS[0][0], z - 40))) + 0.5 * (1 - sm(0, 90, Math.hypot(x - POND.c[0], z - POND.c[1]))));
export const greenNear = (x, z) => Math.min(1, 0.06 + 0.8 * sm(240, 330, Math.hypot(x, z)));
/** 0..1: how much of the town's hubbub reaches (x, z): the street and the lanes of Shöl; little behind the hill or out in the fields. */
export function townNear(x, z) {
  if (inRect(SHOL, x, z, 12)) return 1;
  if (z > 20 && z < 62) return 0.6;
  return Math.max(0.1, 0.6 * (1 - sm(40, 300, Math.hypot(x, z - 130))));
}
/** The frogs' ground: the pond behind the hill and the wet fields at the rim (the valley's barley is dry: only the pond). */
export const frogGround = (x, z) => 0.7 * (1 - sm(0, 70, Math.max(0, Math.hypot((x - POND.c[0]) / POND.rx, (z - POND.c[1]) / POND.rz) * 40 - 40)));

// ── the rooms ────────────────────────────────────────────────────────────────────
/** The room the listener is in: { use, at, upper, same } or null in the open. */
export function roomAt(x, z, y = 0) {
  const upper = y > 2.4;
  for (const [k, H] of Object.entries(HALLS)) if (k !== 'court' && inRect(H.r, x, z) && Math.abs(y - H.y) < 6) return { use: k === 'east' ? 'hall' : 'tomb', at: mid(H.r), upper: false, same: 'hall:' + k };
  if (inRect(CHAPEL, x, z)) return { use: 'lhakhang', at: mid(CHAPEL), upper: false, same: 'lhakhang' };
  if (inRect(PRINTERY, x, z)) return { use: 'print', at: mid(PRINTERY), upper, same: 'print' };
  for (const s of sites()) if ((s.use === 'trade' || s.use === 'tea') && inRect(s.rect, x, z)) return { use: s.use, at: s.at, upper: false, same: s.id };
  for (const l of lots()) if (inRect(l.rect, x, z)) return { use: l.seed % 5 === 0 && !l.farm ? 'weaver' : 'home', at: mid(l.rect), upper, same: 'h:' + Math.round(l.rect[0]) + ':' + Math.round(l.rect[1]) };
  return null;
}
const ROOM = (tone, hush, work = []) => ({ tone, roof: 0.8, hush, work });
export const ROOMS = {
  hall: { tone: [150, 0.2], roof: 0.5, hush: 0.45, work: [['lhsChant', 70]] },                          // the Great East Hall: high, hung with cloth, the monks' seats
  tomb: { tone: [140, 0.2], roof: 0.5, hush: 0.4, work: [['lhsChant', 90]] },
  lhakhang: { tone: [200, 0.3], roof: 0.7, hush: 0.6, work: [['lhsHandWheel', 22], ['lhsDamaru', 90]] },
  print: ROOM([300, 0.3], 0.8, [['lhsPrint', 14]]),
  trade: ROOM([280, 0.22], 0.75, [['lhsScale', 30]]),
  tea: ROOM([420, 0.4], 0.9, [['lhsChurn', 22], ['lhsTeaBowl', 12]]),
  weaver: ROOM([340, 0.3], 0.8, [['loom', 18]]),
  home: ROOM([300, 0.25], 0.8, [['kitchen', 40]]),
};
export const UPPER = { tone: [230, 0.15], roof: 1.2, hush: 0.6, work: [['broom', 70]] };

// ── the emitters in the open ─────────────────────────────────────────────────────
const E = (voice, at, r50, gap, hours, o = {}) => ({ voice, at, r50, gap, hours, ...o });
const bandsOf = (list) => list.flatMap((p) => p);
export const EMITTERS = [
  // the long horns from the palace's roofs at dawn and dusk, heard across the whole town
  E('lhsDungchen', PALACE_ROOF, 150, [160, 300], [5.4, 5.9], { dry: true, after: true }),
  E('lhsDungchen', PALACE_ROOF, 150, [160, 300], [18.4, 18.9], { dry: true, after: true }),
  // the orchestra in the Deyang Shar for the morning and the evening assemblies (and the monks' chant from the halls)
  E('lhsGyaling', mid(HALLS.court.r), 60, [150, 300], [8, 9.5], { dry: true, after: true }),
  E('lhsGyaling', mid(HALLS.court.r), 60, [200, 400], [15.5, 17], { dry: true, after: true }),
  E('lhsChant', mid(HALLS.east.r), 45, [50, 110], [6, 9.5], { inside: 'hall:east', after: true }),
  E('lhsChant', mid(HALLS.east.r), 45, [60, 120], [15, 18], { inside: 'hall:east', after: true }),
  E('lhsChant', mid(HALLS.tomb.r), 35, [60, 120], [6, 22], { inside: 'hall:tomb', after: true, lv: 0.8 }),
  E('lhsChant', [0, -40], 140, [220, 400], [19.5, 22], { dry: false, after: true, lv: 0.6 }),     // at night, from the palace's halls, far and low
  // the rows of fixed prayer wheels behind the hill, the chapel of the great wheel on the west leg
  ...WHEELS.map(([a, b, z]) => E('lhsWheelRow', [(a + b) / 2, z + 1], 40, [18, 45], [5.5, 20], { dry: true })),
  E('lhsHandWheel', mid(CHAPEL), 14, [16, 36], [5.5, 20], { dry: true, inside: 'lhakhang' }),
  E('lhsDamaru', mid(CHAPEL), 14, [60, 120], [5.5, 19.5], { dry: true, inside: 'lhakhang' }),
  // pilgrims at the foot of the stairs and the outer pillar: the mantra, a prostrating pilgrim
  E('lhsMani', [-12, 50], 14, [24, 60], [5.5, 19], { dry: true }),
  E('lhsMani', [8, 49], 14, [30, 70], [5.5, 19], { dry: true }),
  E('lhsMani', [2, 238], 12, [40, 90], [5.5, 19], { dry: true }),
  E('lhsProstrate', [-30, 58], 16, [60, 140], [6, 18], { dry: true }),
  E('lhsProstrate', [-1, 230], 14, [80, 160], [6, 18], { dry: true }),
  // prayer flags over the street and the lanes, on the roofs' poles: always, the more the wind blows
  ...[[-1, 100], [-1, 160], [-1, 190], [-100, 142], [100, 142], [0, 60]].map(([x, z]) => E('lhsFlags', [x, z], 22, [6, 12], [0, 24])),
  // the incense burners: the street's (all day) and the juniper at dawn and dusk on the roofs
  E('lhsJuniper', SANG, 10, [11, 15], [5, 20], { dry: false }),
  E('lhsJuniper', [-1, 234], 10, [11, 15], [5, 19]),
  E('lhsJuniper', [-70, 60], 40, [30, 60], [5.3, 7.2], { lv: 0.5 }), E('lhsJuniper', [80, 60], 40, [30, 60], [17.3, 19], { lv: 0.5 }),
  // the street's stalls and shop fronts: the bargaining
  ...shops().filter((s) => s.kind === 'stall' && s.at[1] < 200).filter((_, i) => i % 2 === 0).map((s) => E('lhsMurmur', s.at, 8, [10, 24], [7, 18], { dry: true })),
  // yaks tethered in the street and the lane (town.js YAKS); the farms' yaks on the threshing floors
  ...[[6.4, 136], [-6.5, 136.5], [-2.2, 119], [-3.4, 190]].map(([x, z]) => E('lhsYak', [x, z], 16, [40, 100], [5.5, 20], { dry: true })),
  // mastiffs chained at the gates: some of the houses along the wide lane and at the south gate, mostly by night
  ...[[-60, 141], [60, 141], [-20, 123.5], [30, 123.5], [-1, 209]].map(([x, z], i) => E('lhsMastiff', [x, z], 22, [50 + 8 * i, 120], [19, 5.5], { dry: true })),
  E('lhsMastiff', [-60, 141], 22, [140, 300], [6, 19], { dry: true, lv: 0.7 }),
  // the dogs of the lanes at night, from lane to lane; the wind over the roofs at evening
  ...[[-100, 120], [110, 160], [-40, 180], [50, 100]].map(([x, z], i) => E('lhsDogs', [x, z], 50, [60 + 10 * i, 130], [19.5, 5], { dry: true })),
  E('lhsWind', [0, 120], 120, [40, 80], [16, 22], { lv: 0.8 }),
];
void STREET; void BENCHES; void bandsOf;
