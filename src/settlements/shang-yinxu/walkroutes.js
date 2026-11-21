// The routes walk-check follows (walk.js; docs/settlements/shang-yinxu.md §9): the whole way from the arrival through the court, and in at the door of
// each opened place on it. The doors are those of the houses' own builders (src/styles/shang/houses.js: the main house of a court lot on the lot's axis,
// the middle row house at u 15.3, the middle pit house of a pit yard, the shed of a workshop open on the lane). A pure function of the layout.
import { lots, lotPoint, FOUNDRY, ARCHIVE, TOMB, HALL, FLANKS, AXIS } from './layout.js';
import { WALK_REACH, walkDistance, frontPoint } from './walk.js';

const route = (pts, kind, id, y0 = 0) => { const r = pts.map((p) => [p[0], p[1]]); r.y0 = y0; r.kind = kind; r.id = id; return r; };

/** The way from the arrival through the court to the lane of the east quarter and out to the archive (one route). */
export function mainRoute() {
  const ax = (ARCHIVE.rect[0] + ARCHIVE.rect[2]) / 2;
  const r = [[20, -34], [20, -20], [76, -20], [86, -24], [86, -40], [86, -58], [ax - 8, -58], [ax, -58], [ax, -66], [ax, ARCHIVE.rect[3] + 2.4], [ax, ARCHIVE.rect[3] - 1.2], [ax, ARCHIVE.rect[3] - 6]];
  r.y0 = 0;
  return r;
}

/** The door routes of a lot's opened houses, in the lot's frame (u along the front, v in from it). */
function lotRoutes(l) {
  const W = l.rect[2] - l.rect[0], D = l.rect[3] - l.rect[1], P = (u, v) => lotPoint(l, u, v), id = 'lot:' + l.seed;
  if (l.kind === 'court') {
    const hv = D - 7.7, c = W / 2;
    return [route([P(c, -2.6), P(c, 1.6), P(c, hv - 2.6), P(c, hv - 0.8), P(c, hv + 0.45), P(c, hv + 1.25)], 'court-house', id)];
  }
  if (l.kind === 'row') return [route([P(15.3, -2.6), P(15.3, -0.6), P(15.3, 0.95), P(15.3, 1.9)], 'row-house', id)];
  if (l.kind === 'pits') {
    const rv = D - 6.4, dc = W / 2 - 0.7;
    return [route([P(W / 2, -2.6), P(W / 2, 3), P(W / 2 - 2.6, 9), P(W / 2 - 2.6, 13), P(dc, rv - 1.6), P(dc, rv + 0.4), P(dc, rv + 1.6)], 'pit-house', id)];
  }
  return [route([P(W / 2, -2.6), P(W / 2, 2), P(W / 2, D - 12), P(W / 2 + 6, D - 8.4)], 'workshop', id)];
}

/** [{ kind, id, route: [[x, z], …], y0 }] for each opened place on the walk. */
export function walkRoutes(all = false) {
  const out = [];
  const fh = (f, i) => { const cx = (f.plat[0] + f.plat[2]) / 2, cz = (f.plat[1] + f.plat[3]) / 2, e = i ? f.plat[0] : f.plat[2], s = i ? -1 : 1; return route([[cx + s * 14, cz - 1.5], [e + s * 3.0, cz - 1.5], [e + s * 1.2, cz - 1.5], [cx + 0, cz - 1.5]], 'flank-hall', 'hall:' + f.name, 0); };
  FLANKS.forEach((f, i) => out.push(fh(f, i)));
  const tx = (TOMB.plat[0] + TOMB.plat[2]) / 2;
  out.push(route([[tx, -94], [tx - 5, -98], [tx - 5, -101.6], [tx, -101.6], [tx, TOMB.plat[3] - 0.3], [tx, TOMB.hall[1] + 4]], 'tomb-hall', 'tomb', 0));
  out.push(route([[-100.5, 90], [-103, 97], [-103, 118], [-103, 126], [-100.5, 135], [-100.5, 154], [-97, 158], [-97, 161.2], [-100.5, 162.3], [-100.5, 164.4], [-100.5, 166]], 'casters-pit-house', 'foundry', 0));
  for (const l of lots()) {
    if (!all && walkDistance(frontPoint(l)) > WALK_REACH) continue;
    out.push(...lotRoutes(l));
  }
  void HALL; void AXIS; void FOUNDRY;
  return out;
}
