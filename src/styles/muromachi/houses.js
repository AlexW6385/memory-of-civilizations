// The Muromachi machiya (docs/settlements/muromachi-kyoto.md §5): one storey of posts and boards, a gabled roof of planks
// weighted with stones, the shop front with its hinged shutter (tsuri-mise) propped up and its noren, the earth passage
// (doma) along one side; open inside as a shop with the mats, the hearth and the goods of its trade. Built facing +z (the street).
import { fromTriangles } from '../../core/geom.js';
import { WD } from './kit.js';
import { machiyaElements, TRADES as TR } from './machiya.js';

export const TRADES = TR;

/** A fence of split bamboo (kakine) a → b, h high: posts, rails, upright culms; with the ground height y. */
function bambooFence(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), h = el.h ?? 1.5, y = el.y ?? 0, u = [(bx - ax) / L, (bz - az) / L], n = Math.max(1, Math.round(L / 2));
  const t = []; const bx3 = (x0, y0, z0, x1, y1, z1) => bag.add('bamboo_culm', box3(x0, y0, z0, x1, y1, z1));
  for (let i = 0; i <= n; i++) { const x = ax + u[0] * L * i / n, z = az + u[1] * L * i / n; bag.add(WD, box3(x - 0.05, y, z - 0.05, x + 0.05, y + h + 0.1, z + 0.05)); }
  const alongX = Math.abs(u[0]) > Math.abs(u[1]);
  for (const hy of [0.25, h * 0.55, h - 0.05]) bx3(Math.min(ax, bx) - (alongX ? 0 : 0.04), y + hy, Math.min(az, bz) - (alongX ? 0.04 : 0), Math.max(ax, bx) + (alongX ? 0 : 0.04), y + hy + 0.05, Math.max(az, bz) + (alongX ? 0.04 : 0));
  for (let s = 0.12; s < L; s += 0.14) { const x = ax + u[0] * s, z = az + u[1] * s; bx3(x - 0.025, y, z - 0.025, x + 0.025, y + h, z + 0.025); }
  col.segment(el.a, el.b, 0.2, y, y + h); void t;
}
import { box as box3 } from '../../core/geom.js';
void fromTriangles;
export const houseElements = { ...machiyaElements, bamboo_fence: bambooFence };
