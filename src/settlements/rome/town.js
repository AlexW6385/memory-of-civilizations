// The insulae of the Campus Martius (docs/settlements/rome.md §5): in 100 m tiles, each in full
// (shops, windows, shutters, balconies, cornices) near and in outline far (as src/settlements/lod.js, but in 160 m tiles:
// fewer plan x material buckets, DESIGN geometry budget).
import './sculpt.js';
import { RADIUS, VIA_LATA, lots, inRect, rows, INN, FULLER, STADIUM, saeptaRows, quayRows, riverEdge, fountains, fills, gardens, FORUM, TEMPLE, PISTRINUM, LATRINE, inn2 } from './layout.js';
import '../../styles/roman/ways.js';
import '../../styles/roman/houses.js';
import { DOMUS, LITTER, lifePlan } from './life.js';
import './flats.js';
import { furnishElement } from './upper.js';
import { rowFurnElement } from './upper-rows.js';
import { cauponaFurn, fullonicaFurn } from './upper-inns.js';
import './nightlight.js';
import './writing.js';
import { shopKeepers } from './keepers.js';
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
    plans.push({ ...base, id: `${id}-${k}`, near, elements: list.map((e) => (e.openRow ? { ...e, t: 'taberna_up' } : e)) });
    plans.push({ ...base, id: `${id}-${k}-far`, far: near, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}
const site = (id, elements, rooms = []) => ({ id, style: 'rome-site', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' } });
/** The lares of a crossroads shrine: where street_kit puts it (src/styles/roman/ways.js), turned as it is. */
function shrineLares(w) {
  const zz = w.along !== 'x', side = w.shrine[1], u = w.shrine[0], off = side * (w.half - 0.6);
  const [x, z] = zz ? [w.at[0] + off, w.at[1] + u] : [w.at[0] + u, w.at[1] + off];
  return { t: 'rome_lares', at: [x, z], y: 0, yaw: zz ? (side > 0 ? -Math.PI / 2 : Math.PI / 2) : (side > 0 ? Math.PI : 0) };
}
/** The rows nearest the arrival whose flats are opened (src/settlements/rome/upper-rows.js). */
const OPEN_ROWS = rows().filter((r) => r.front === 's').sort((a, b) => Math.hypot((a.rect[0] + a.rect[2]) / 2, (a.rect[1] + a.rect[3]) / 2 + 150) - Math.hypot((b.rect[0] + b.rect[2]) / 2, (b.rect[1] + b.rect[3]) / 2 + 150)).slice(0, 3);
/** A small plan with the furnishing of an opened house, shown within 55 m of it. */
function furnPlan(id, el, near = 18) {
  const c = [(el.rect[0] + el.rect[2]) / 2, (el.rect[1] + el.rect[3]) / 2];
  return { id, style: 'rome-site', origin: [0, 0], base: 0, yaw: 0, feature: true, near, center: c, elements: [el], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' } };
}
export async function town() {
  // the lot by the street north of the Pantheon holds the atrium house with its thermopolium (§4.4), walked into
  const same = (r, q) => r.every((v, i) => Math.abs(v - q[i]) < 1);
  const free = lots().filter((l) => !inRect(DOMUS, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2) && !same(l.rect, INN) && !same(l.rect, FULLER) && !(inn2() && same(l.rect, inn2().rect)));
  // beyond the first 120 m from the arrival (0, -120): every third insula of the middle belt is one walked into (flats.js)
  const dA = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 + 120);
  const cand = free.filter((l) => dA(l) > 125 && dA(l) < 340 && (l.rect[2] - l.rect[0] >= 17.5 || l.rect[3] - l.rect[1] >= 17.5)).sort((a, b) => dA(a) - dA(b));
  const openLots = cand.filter((_, i) => i % 3 === 1).slice(0, 14).map((l) => {
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, ns = l.rect[3] - l.rect[1] >= 17.5;
    return { t: 'insula_open', rect: l.rect, seed: l.seed, front: ns ? (cz > 0 ? 'n' : 's') : (cx > 0 ? 'w' : 'e') };
  });
  const dArr = (e) => Math.hypot((e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2 + 200);
  const upLots = [...openLots].sort((p, q) => dArr(p) - dArr(q)).slice(0, 3);                    // the three nearest the arrival: their first floors are walked (flats.js, docs §4.16)
  for (const e of upLots) e.upper = true;
  const openSet = new Set(openLots.map((e) => e.rect));
  free.splice(0, free.length, ...free.filter((l) => !openSet.has(l.rect)));
  const inn = lots().find((l) => same(l.rect, INN)), full = lots().find((l) => same(l.rect, FULLER));
  const R = (r, u0, u1, d0, d1) => [r[0] + u0, r[3] - d1, r[0] + u1, r[3] - d0];                  // the frame of a building with its front on the south
  const houses = { id: 'rome-houses', style: 'rome-town', origin: [0, 0], base: 0, yaw: 0, feature: true, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' },
    elements: [{ t: 'caupona_up', rect: inn.rect, front: 's', seed: inn.seed }, { t: 'fullonica_up', rect: full.rect, front: 's', seed: full.seed }, ...(inn2() ? [{ t: 'caupona_up', rect: inn2().rect, front: 's', seed: inn2().seed }] : [])],
    rooms: [
      ...(inn2() ? [{ id: 'caupona2-bar', rect: R(inn2().rect, 0.6, 8.4, 0.6, 7.9), y: 0, kind: 'hall', market: false }, { id: 'caupona2-stable', rect: R(inn2().rect, 12.7, 19.4, 0.6, 7.9), y: 0, kind: 'hall', market: false }, { id: 'caupona2-court', rect: R(inn2().rect, 0.6, 17.4, 9.0, 13.6), y: 0, kind: 'hall', market: false }] : []),
      { id: 'caupona-bar', rect: R(inn.rect, 0.6, 8.4, 0.6, 7.9), y: 0, kind: 'hall', market: false },
      { id: 'caupona-stable', rect: R(inn.rect, 12.7, 19.4, 0.6, 7.9), y: 0, kind: 'hall', market: false },
      { id: 'caupona-court', rect: R(inn.rect, 0.6, 17.4, 9.0, 13.6), y: 0, kind: 'hall', market: false },
      { id: 'fullonica-shop', rect: R(full.rect, 0.6, 17.4, 0.6, 5.9), y: 0, kind: 'hall', market: false },
      { id: 'fullonica-court', rect: R(full.rect, 0.6, 17.4, 6.5, 14.6), y: 0, kind: 'hall', market: false },
    ] };
  const [fx0, fz0, fx1, fz1] = FORUM, zm = (fz0 + fz1) / 2, cl = (a, b, side, gaps) => ({ t: 'colonnade', a, b, at: a, y: 0, h: 7.6, step: 3.9, depth: 5, side, gaps });
  const forum = [
    { t: 'forum_floor', rect: FORUM, y: 0 },
    { t: 'rome_forum_kit', rect: FORUM, temple: TEMPLE, at: [(FORUM[0] + FORUM[2]) / 2, (FORUM[1] + FORUM[3]) / 2], seed: 5 },
    { t: 'rome_rostra', at: [fx1 - 18, zm], y: 0 },
    { t: 'rome_equestrian', at: [-96, zm], y: 0, yaw: 0 },
    cl([TEMPLE[2] + 2, fz0 + 5], [fx1 - 6, fz0 + 5], -1), cl([TEMPLE[2] + 2, fz1 - 5], [fx1 - 6, fz1 - 5], 1),
    cl([fx1 - 5, fz0 + 5], [fx1 - 5, fz1 - 5], -1, [[zm - fz0 - 5 - 7, zm - fz0 - 5 + 7]]),
    { t: 'temple', rect: TEMPLE, at: [(TEMPLE[0] + TEMPLE[2]) / 2, (TEMPLE[1] + TEMPLE[3]) / 2], front: 'e', y: 0, h: 11.5, nf: 6, podium: 2.6 },
    ...[[-84, -142, 0], [-84, -96, Math.PI], [-102, -146, 0], [-102, -92, Math.PI], [-124, -146, 0], [-124, -92, Math.PI]].map(([x, z, r], i) => ({ t: 'rome_statue', i, at: [x, z], y: 0, rot: r, h: 2.0, base: 1.3, mat: i % 2 ? 'marble' : 'gilt_bronze' })),
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
  const tiles = tiles160('rome-insulae', 'rome-town', [...ways, ...free.map((l) => ({ t: 'insula', ...l })), ...rows().map((r) => ({ t: 'taberna_row', ...r, storeys: r.front === 's' && r.seed % 3 === 0 ? 2 : undefined, openRow: OPEN_ROWS.includes(r) })), ...saeptaRows().map((r) => ({ t: 'taberna_row', ...r })), ...fountains().map((f) => ({ t: 'rome_fountain', ...f })), ...ways.filter((w) => w.shrine).map(shrineLares), ...forum], { near: 270, R: RADIUS, entrance: { at: [0, -200], facing: 's' } });
  const [x0, z0, x1, z1] = DOMUS;
  return [...tiles, houses,
    site('rome-domus', [{ t: 'domus', rect: DOMUS, y: 0 }, { t: 'litter', at: LITTER.at, y: 0, rot: LITTER.rot }], [
      { id: 'atrium', rect: [x0 + 3.9, z0 + 5.1, x1 - 3.9, z1 - 5.9], y: 0, kind: 'hall', market: false },
      { id: 'thermopolium', rect: [x0 + 0.6, z1 - 5.6, (x0 + x1) / 2 - 1.6, z1 - 0.6], y: 0, kind: 'hall', market: false },
      { id: 'tablinum', rect: [(x0 + x1) / 2 - 2.4, z0 + 0.6, (x0 + x1) / 2 + 2.4, z0 + 4.6], y: 0, kind: 'hall', market: false }]),
    { id: 'rome-street', style: 'rome-town', origin: [0, 0], base: 0, yaw: 0, feature: true, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -200], facing: 's' },
      elements: [{ t: 'pistrinum', rect: PISTRINUM, front: 's', y: 0 }, { t: 'latrine', rect: LATRINE, front: 's', y: 0 }],
      rooms: [{ id: 'pistrinum', rect: [PISTRINUM[0] + 0.5, PISTRINUM[1] + 0.5, PISTRINUM[2] - 0.5, PISTRINUM[3] - 0.5], y: 0, kind: 'hall', market: false }, { id: 'latrine', rect: [LATRINE[0] + 0.5, LATRINE[1] + 0.5, LATRINE[2] - 0.5, LATRINE[3] - 0.5], y: 0, kind: 'hall', market: false }] },
    site('rome-flats', openLots), nightLife(ways), awningPlan(), ...shopKeepers(),
    ...upLots.map((e, i) => furnPlan(`rome-up-flat-${i}`, { t: 'up_cells_flat', rect: e.rect, front: e.front, seed: e.seed })),
    furnPlan('rome-up-inn', { ...cauponaFurn({ rect: inn.rect, front: 's' }), seed: inn.seed }), furnPlan('rome-up-fuller', { ...fullonicaFurn({ rect: full.rect, front: 's' }), seed: full.seed }),
    ...(inn2() ? [furnPlan('rome-up-inn2', { ...cauponaFurn({ rect: inn2().rect, front: 's' }), seed: inn2().seed })] : []),
    ...OPEN_ROWS.map((r, i) => furnPlan(`rome-up-row-${i}`, { ...rowFurnElement({ ...r, storeys: r.front === 's' && r.seed % 3 === 0 ? 2 : 3 }), seed: r.seed }, 14))];
}

/** The street life's plan with the night's lamps added (nightlight.js): the household gods' lamp at each crossroads shrine, the litter's torch. */
function nightLife(ways) {
  const L = lifePlan(), add = [];
  for (const w of ways.filter((q) => q.shrine)) { const l = shrineLares(w); add.push({ t: 'rome_halo', kind: 'shrine', at: [l.at[0] + 0.4 * Math.sin(l.yaw), l.at[1] + 0.4 * Math.cos(l.yaw)], y: 0, rot: 0 }); }
  const [cx, cz] = LITTER.at, a = LITTER.rot, f = [-Math.sin(a), -Math.cos(a)], r = [Math.cos(a), -Math.sin(a)];
  add.push({ t: 'rome_halo', kind: 'torch', at: [cx + f[0] * 4.6 + r[0] * 0.5, cz + f[1] * 4.6 + r[1] * 0.5], y: 0, rot: 0 });
  return { ...L, elements: [...L.elements, ...add] };
}
/** The cloth awnings over the doors of the tabernae along the street before the forecourt and the Via Lata (every other shop, in the colours of the cloth dyers). */
function awningPlan() {
  const rand = rng(2128), list = [], MAT = ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_indigo', 'cloth_ochre', 'cloth_red'];
  for (const r of rows()) {
    const [x0, z0, x1, z1] = r.rect, f = r.front, W = f === 'e' || f === 'w' ? z1 - z0 : x1 - x0, nb = Math.max(2, Math.round(W / 4.4)), bw = W / nb;
    const rot = f === 'e' ? Math.PI / 2 : f === 'w' ? -Math.PI / 2 : f === 's' ? 0 : Math.PI;          // out into the street (the yaw of +z)
    const P = (u) => f === 'e' ? [x1, z0 + u] : f === 'w' ? [x0, z0 + u] : f === 's' ? [x0 + u, z1] : [x0 + u, z0];
    for (let i = 0; i < nb; i++) { const q = rand(); if (q < 0.5) list.push({ at: P((i + 0.5) * bw), rot, w: bw - 0.7, mat: MAT[Math.floor(q * 14) % MAT.length] }); }
  }
  return site('rome-awnings', [{ t: 'shop_awnings', list }]);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
