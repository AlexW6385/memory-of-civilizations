// The houses of the first hill (docs/settlements/constantinople.md §11, §14): rows of tenements of the Roman kind sharing
// their side walls along the lanes, balconies frequent (Zeno's law regulated them), walled gardens filling some blocks,
// house-bridges, awnings and wall shrines in the lanes; in 100 m tiles, full near and in outline far.
import { RADIUS, lots, gardens, special, height, xl, zl, PX, PZ } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The lane kit: bridges between facing houses, awnings, shrines on the ends of rows, niche fountains on garden walls. */
export function laneKit() {
  const E = [], rand = rng(414), L = lots();
  const near = (x, z) => Math.hypot(x, z) < 300;
  const byKey = new Map();
  for (const l of L) { const kx = Math.round(l.rect[0] * 2), kz = `${l.k},${l.j},${l.row}`; byKey.set(`${kz}|${kx}`, l); }
  for (const l of L) {
    if (l.abut.e) continue;                                           // the last house of a row: its east side is on a cross lane
    const [x0, z0, x1, z1] = l.rect, zc = (z0 + z1) / 2, xe = x1 + 2.5;
    // the house on the other side of the lane in the same row
    const o = L.find((q) => q.row === l.row && Math.abs(q.rect[0] - (x1 + 5)) < 0.3 && Math.abs(q.rect[1] - z0) < 0.3);
    if (!near(xe, zc)) continue;
    const r = rand();
    if (o && r < 0.22) E.push({ t: 'byz_bridge', at: [xe, z0 + 3 + rand() * (z1 - z0 - 6)], y: height(xe, zc), along: 'z', w: 5, len: 3.6, h: 4.4, top: 7.0 });
    else if (r < 0.5) E.push({ t: 'byz_awning', at: [xe, z0 + 2.5 + rand() * (z1 - z0 - 5)], y: height(xe, zc), along: 'z', w: 5, len: 2.2 + rand(), mat: ['cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_indigo', 'linen'][Math.floor(rand() * 5)] });
    else if (r < 0.64) E.push({ t: 'byz_shrine', at: [x1 + 0.4, z0 + 1.2 + rand() * 2], y: height(x1, z0), rot: -Math.PI / 2 });
  }
  // awnings over the east-west lanes
  for (const l of L) if (l.row === 1 && !l.abut.e && near(l.rect[2], l.rect[3]) && rand() < 0.35) { const x = l.rect[0] + (l.rect[2] - l.rect[0]) * 0.5, z = l.rect[3] + 2.5; E.push({ t: 'byz_awning', at: [x, z], y: height(x, z), along: 'x', w: 5, len: 2.4, mat: ['cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_green'][Math.floor(rand() * 4)] }); }
  return E;
}

export function townElements() {
  const S = special(), skip = new Set(Object.values(S));
  void skip;
  const E = lots().map((l) => ({ t: 'byz_house', balcony: 0.55, ...l, storeys: undefined }));
  const fountainAt = [];
  for (const g of gardens()) {
    const e = { t: 'byz_walled_yard', rect: g.rect, y: Math.min(...[[g.rect[0], g.rect[1]], [g.rect[2], g.rect[3]]].map(([x, z]) => height(x, z))), seed: g.seed };
    if (g.seed % 3 === 0 && Math.hypot(g.rect[0], g.rect[1]) < 320) { e.gate = 's'; fountainAt.push([(g.rect[0] + g.rect[2]) / 2 + (g.seed % 7) - 3, g.rect[1] + 0.15, e.y]); }
    E.push(e);
  }
  for (const [x, z, y] of fountainAt) E.push({ t: 'byz_fountain', at: [x, z], y, rot: Math.PI, kind: 'niche' });
  E.push(...laneKit());
  return E;
}
/** The houses in 160 m tiles (the geometry budget counts a mesh per tile × material), each in full near and simple far (as src/settlements/lod.js). */
const TILE = 160, NEAR = 230;
export async function houses() {
  const tiles = new Map(), entrance = { at: [-150, 110], facing: 'e' };
  for (const e of townElements()) {
    const [x, z] = e.rect ? [(e.rect[0] + e.rect[2]) / 2, (e.rect[1] + e.rect[3]) / 2] : (e.at ?? e.c);
    const k = `${Math.floor(x / TILE)},${Math.floor(z / TILE)}`;
    if (!tiles.has(k)) tiles.set(k, []);
    tiles.get(k).push(e);
  }
  const plans = [];
  for (const [k, list] of tiles) {
    const [i, j] = k.split(',').map(Number), center = [(i + 0.5) * TILE, (j + 0.5) * TILE];
    const base = { style: 'roman', origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance, center };
    plans.push({ ...base, id: `constantinople-houses-${k}`, near: NEAR, elements: list });
    plans.push({ ...base, id: `constantinople-houses-${k}-far`, far: NEAR, elements: list.map((e) => ({ ...e, simple: true })), nocollide: true });
  }
  return plans;
}
export { PX, PZ, xl, zl };
