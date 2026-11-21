// The Pharos' foot as it was used (docs/settlements/alexandria.md §17): the lead run between the blocks of the granite foot [stated: Wikipedia
// "Lighthouse of Alexandria", Idrisi: lead between the blocks], the way trodden across the court to the steps and the steps worn where feet and
// hooves climbed to the door, the hitching rail, the trough and the mounting block of the mules that took the fuel up the ramp [the ramp: stated;
// the rail, trough and block: inferred]. Materials the plan already holds (limestone, lead, wood_dark, bronze, water).

import { box, lathe } from '../../core/geom.js';

/** pharos_court: { c [x, z] (the tower), y (the ground), base (30) } — added to the landmark's plan beside `pharos`. */
function pharosCourt(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 1.2, h = (el.base ?? 30) / 2, y0 = y + 0.66, hw = h + 0.5;
  // 1. lead in the joints of the granite foot (blocks 2.6 m long, 1 m high, bonded): four faces, the door's gap left bare
  const lo = y0 - 0.3, top = y0 + 4.0;
  const doorGap = (face, u) => face === 's' && Math.abs(u) < 2.9;
  for (const face of ['s', 'n', 'e', 'w']) {
    const sx = face === 'e' ? 1 : face === 'w' ? -1 : 0, sz = face === 's' ? 1 : face === 'n' ? -1 : 0, ox = sx * (hw + 0.012), oz = sz * (hw + 0.012);
    const P = (u, yy) => [cx + (sz ? u : ox), yy, cz + (sz ? oz : u)];
    const slab = (u0, u1, y1, y2) => { const a = P(u0, y1), b = P(u1, y2); bag.add('lead', sz ? box(a[0], a[1], a[2] - 0.012, b[0], b[1], b[2] + 0.012) : box(a[0] - 0.012, a[1], a[2], b[0] + 0.012, b[1], b[2])); };
    for (let k = 0; k < 4; k++) {
      const yj = y0 + 0.7 + k;
      if (face === 's') { slab(-hw, -2.9, yj, yj + 0.03); slab(2.9, hw, yj, yj + 0.03); } else slab(-hw, hw, yj, yj + 0.03);
      for (let u = -hw + 1.3 + (k % 2) * 1.3; u < hw - 0.4; u += 2.6) if (!doorGap(face, u)) slab(u, u + 0.03, yj - 1.0 < lo ? lo : yj - 1.0, yj);
    }
  }
  // 2. the way trodden across the court to the steps (a strip of dressed limestone against the paving) and the treads worn along the door's line
  const zs = cz + 20;                                                                  // the lowest step's outer edge
  bag.add('limestone', box(cx - 1.7, y + 0.05, zs + 0.0, cx + 1.7, y + 0.062, zs + 15));
  for (let i = 0; i < 2; i++) bag.add('tura_limestone', box(cx - 1.5, y + 0.22 * (i + 1) + 0.0, zs - 0.5 * (i + 1) + 0.05, cx + 1.5, y + 0.22 * (i + 1) + 0.012, zs - 0.5 * i - 0.0));
  bag.add('tura_limestone', box(cx - 1.3, y0 + 0.0, cz + hw, cx + 1.3, y0 + 0.012, cz + h + 3.95));
  // 3. the mules' hitching rail (two posts, a rail, bronze rings), the stone trough and a mounting block, east of the steps
  const hx = cx + 8.5, hz = cz + 24;
  for (const u of [-1.4, 1.4]) { bag.add('wood_dark', box(hx + u - 0.07, y + 0.05, hz - 0.07, hx + u + 0.07, y + 1.25, hz + 0.07)); col.circle(hx + u, hz, 0.09, y + 0.05, y + 1.25); }
  bag.add('wood_dark', box(hx - 1.45, y + 1.05, hz - 0.05, hx + 1.45, y + 1.15, hz + 0.05));
  for (const u of [-0.8, 0.8]) bag.add('bronze', lathe([[0.06, 0], [0.06, 0.2], [0.001, 0.2]], 5, null, hx + u, y + 0.95, hz + 0.08));
  const tx = cx + 8.5, tz = hz + 2.0;
  bag.add('limestone', box(tx - 1.0, y + 0.05, tz - 0.3, tx + 1.0, y + 0.55, tz + 0.3)); col.rect([tx - 1.0, tz - 0.3, tx + 1.0, tz + 0.3], y + 0.05, y + 0.55);
  bag.add('water', box(tx - 0.85, y + 0.5, tz - 0.17, tx + 0.85, y + 0.52, tz + 0.17));
  const mx = cx - 8.5, mz = cz + 22;
  bag.add('limestone', box(mx - 0.5, y + 0.05, mz - 0.4, mx + 0.5, y + 0.3, mz + 0.4)); bag.add('limestone', box(mx - 0.5, y + 0.3, mz - 0.4, mx + 0.1, y + 0.6, mz + 0.4));
  col.rect([mx - 0.5, mz - 0.4, mx + 0.5, mz + 0.4], y + 0.05, y + 0.6);
}
export const PHAROS_COURT = { pharos_court: pharosCourt };
