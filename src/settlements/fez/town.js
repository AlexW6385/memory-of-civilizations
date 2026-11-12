// The medina of Fez about 1350 (docs/settlements/fez.md §5): the courtyard houses in their blocks, the lanes' walls, the souks, the Place Seffarine,
// the funduq, the quarter mosque, the tannery, the river between its quays with its bridges, the wall and its gates, the wall fountains; and the people.
import { lodTiles } from '../lod.js';
import { RADIUS, WALL_R, RIVER, SITES, SOUKS, BRIDGES, lots, fabric, fountains, riverZ, ground0, quayY, siteY, height } from './layout.js';
import { lifePlans } from './life.js';
import { houseList, laneElements } from './houses.js';
import { streetPlans } from './street.js';

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
export async function town() {
  const F = fabric(), houses = [...houseList(), ...laneElements()];
  for (const f of F.fills) if (f.rect[2] - f.rect[0] > 0.8 && f.rect[3] - f.rect[1] > 0.8) houses.push({ t: 'fez_mass', rect: f.rect, y: f.y, foot: f.y - 1.0, storeys: 2, seed: Math.round(f.rect[0] * 7 + f.rect[1]) });
  const plans = lodTiles('fez-houses', 'marinid', houses, { R: RADIUS, near: 220, entrance: { at: [-132.5, -30], facing: 's' } });
  plans.push(base('fez-civic', 'marinid', civic()));
  plans.push(...lifePlans());
  plans.push(...streetPlans());
  return plans;
}
void quayY;
