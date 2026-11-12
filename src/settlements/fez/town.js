// The medina of Fez about 1350 (docs/settlements/fez.md §5): the courtyard houses in their blocks, the lanes' walls, the souks, the Place Seffarine,
// the funduq, the quarter mosque, the tannery, the river between its quays with its bridges, the wall and its gates, the wall fountains; and the people.
import { lodTiles } from '../lod.js';
import { RADIUS, WALL_R, RIVER, SITES, SOUKS, BRIDGES, lots, lanes, fabric, fountains, riverZ, ground0, quayY, siteY, height } from './layout.js';
import { lifePlan } from './life.js';

const base = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-132.5, -30], facing: 's' } });

export function civic() {
  const E = [];
  // the souks
  for (const s of SOUKS) {
    const [ax, az] = s.a, [bx, bz] = s.b, alongX = Math.abs(az - bz) < 0.1, y0 = ground0(ax, az), y1 = ground0(bx, bz), L = Math.hypot(bx - ax, bz - az);
    E.push({ t: 'fez_souk', a: s.a, b: s.b, w: s.w, depth: s.depth, y0, slope: (y1 - y0) / L, trades: s.trades, covered: s.covered, gaps: s.gaps, seed: s.id.length * 7 + 3 });
    void alongX;
  }
  E.push({ t: 'fez_square', rect: SITES.seffarine, y: ground0(102, 39) + 0.05, seed: 9 });
  E.push({ t: 'fez_funduq', rect: SITES.funduq, y: siteY('funduq'), seed: 31 });
  E.push({ t: 'fez_mosque', rect: SITES.mosque, y: siteY('mosque') });
  E.push({ t: 'fez_tannery', rect: SITES.tannery, y: siteY('tannery'), seed: 21 });
  // the river and its bridges
  const pts = []; for (let x = -RADIUS + 28; x <= RADIUS - 28; x += 8) pts.push([x, riverZ(x)]);
  E.push({ t: 'fez_river', pts, w: RIVER.w, bed: RIVER.bed, water: RIVER.water, top: 0.2 });
  for (const b of BRIDGES) E.push({ t: 'fez_bridge', x: b.x, z: riverZ(b.x), w: b.w, span: RIVER.w, y: 0.22 });
  // the wall: points round the circle, the gates cutting it
  const GATES = [{ a: Math.PI, axis: 'x', z: -21 }, { a: -Math.PI / 2, axis: 'z', x: 62 }, { a: Math.PI / 2, axis: 'z', x: -40 }, { a: 0, axis: 'x', z: 58 }];
  const gp = GATES.map((g) => (g.axis === 'x' ? [Math.sign(Math.cos(g.a)) * Math.sqrt(WALL_R ** 2 - g.z ** 2), g.z] : [g.x, Math.sign(Math.sin(g.a)) * Math.sqrt(WALL_R ** 2 - g.x ** 2)]));
  const N = 96, runs = [[]], inGap = (x, z) => gp.some(([gx, gz]) => Math.hypot(x - gx, z - gz) < 9) || Math.abs(z - riverZ(x)) < 6;
  for (let i = 0; i <= N; i++) {
    const a = -Math.PI + (i / N) * Math.PI * 2, x = Math.cos(a) * WALL_R, z = Math.sin(a) * WALL_R;
    if (inGap(x, z)) { if (runs[runs.length - 1].length) runs.push([]); continue; }
    runs[runs.length - 1].push([x, z, height(x, z)]);
  }
  for (const r of runs) if (r.length > 1) E.push({ t: 'fez_wall', pts: r, th: 2.0, h: 7.5, towers: 3 });
  GATES.forEach((g, i) => E.push({ t: 'fez_gate', at: gp[i], axis: g.axis, y: height(gp[i][0], gp[i][1]) + 0.05 }));
  for (const f of fountains()) E.push({ t: 'fez_fountain', at: f.at, face: f.face, y: f.y });
  return E;
}
/** The lane a lot's door opens on: { w, kind } of the lane touching the door's side, or null. */
export function doorLane(l) {
  const r = l.rect, e = l.door, m = 0.8;
  for (const q of lanes()) {
    if (e === 's' && q.axis === 'x' && Math.abs(r[3] - q.r[1]) < m && q.r[2] > r[0] + 2 && q.r[0] < r[2] - 2) return q;
    if (e === 'n' && q.axis === 'x' && Math.abs(r[1] - q.r[3]) < m && q.r[2] > r[0] + 2 && q.r[0] < r[2] - 2) return q;
    if (e === 'e' && q.axis === 'z' && Math.abs(r[2] - q.r[0]) < m && q.r[3] > r[1] + 2 && q.r[1] < r[3] - 2) return q;
    if (e === 'w' && q.axis === 'z' && Math.abs(r[0] - q.r[2]) < m && q.r[3] > r[1] + 2 && q.r[1] < r[3] - 2) return q;
  }
  return null;
}
const rngS = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
/** The trades of the dukkans along a street at x: bakers and potters in the west, booksellers and chandlers toward the Qarawiyyin. */
export function tradesAt(x, seed) {
  const W = ['bread', 'pottery', 'dates', 'cloth', 'bread', 'slipper'], M = ['spice', 'cloth', 'brass', 'dates', 'slipper', 'pottery'], Q = ['books', 'perfume', 'candle', 'books', 'henna', 'dates'];
  const set = x < -60 ? W : x > 100 ? Q : M;
  return [set[seed % set.length], set[(seed * 3 + 1) % set.length]];
}
/** The houses of the medina with their dukkans: the lots on a main street carry shops; a share of those on the row lanes and the derbs near the core. */
export function houseList() {
  const L = lots(), houses = [], rand = rngS(55);
  // the houses nearest the madrasa's door are open and furnished (a riad with its salon): wide, deep
  const near = (l) => Math.hypot((l.rect[0] + l.rect[2]) / 2 + 132, (l.rect[1] + l.rect[3]) / 2 + 30);
  const cand = L.filter((l) => l.w >= 10.5 && l.d >= 14).sort((a, b) => near(a) - near(b)).slice(0, 14);
  for (const l of L) {
    const open = cand.includes(l), rich = open || (l.seed % 9 === 0 && Math.hypot(l.rect[0], l.rect[1]) < 200);
    const q = doorLane(l), cx = (l.rect[0] + l.rect[2]) / 2, dist = Math.hypot(cx, (l.rect[1] + l.rect[3]) / 2);
    const shop = q && (q.kind === 'street' || (q.kind === 'lane' && dist < 230 && rand() < 0.3) || (q.kind === 'derb' && dist < 170 && rand() < 0.07));
    houses.push({ t: 'fez_house', rect: l.rect, y: l.y, foot: l.foot, door: l.door, storeys: l.storeys, seed: l.seed, open, rich, laneW: q ? q.w : 2.4, shops: shop ? tradesAt(cx, l.seed) : undefined });
  }
  return houses;
}
export async function town() {
  const F = fabric(), houses = houseList();
  for (const f of F.fills) if (f.rect[2] - f.rect[0] > 0.8 && f.rect[3] - f.rect[1] > 0.8) houses.push({ t: 'fez_mass', rect: f.rect, y: f.y, foot: f.y - 1.0, storeys: 2, seed: Math.round(f.rect[0] * 7 + f.rect[1]) });
  const plans = lodTiles('fez-houses', 'marinid', houses, { R: RADIUS, near: 220, entrance: { at: [-132.5, -30], facing: 's' } });
  plans.push(base('fez-civic', 'marinid', civic()));
  plans.push(lifePlan());
  return plans;
}
void quayY;
