// The houses of the citadel and the lower town (docs/settlements/mycenae.md §5): a rubble socle, mudbrick walls plastered, timber ties, small
// windows, a flat clay roof with a parapet and a spout; the granary; the workshops' yards (kiln, pithoi, loom, oil press).

import { box, lathe, place } from '../../core/geom.js';
import { rng, mergeG } from './util.js';

const WALLS = ['mud_plaster', 'lime_plaster_rough', 'plaster_ochre', 'mud_plaster', 'mudbrick'];
const DOOR = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] };

/** A thin box laid on a face: along u from u0 to u1 (distance from the face's start), proud by `t`. */
function onFace(rect, f, u0, u1, ya, yb, t, off = 0) {
  const [x0, z0, x1, z1] = rect;
  if (f === 'n') return box(x0 + u0, ya, z0 - t - off, x0 + u1, yb, z0 - off);
  if (f === 's') return box(x0 + u0, ya, z1 + off, x0 + u1, yb, z1 + t + off);
  if (f === 'w') return box(x0 - t - off, ya, z0 + u0, x0 - off, yb, z0 + u1);
  return box(x1 + off, ya, z0 + u0, x1 + t + off, yb, z0 + u1);
}
const lenOf = (rect, f) => (f === 'n' || f === 's' ? rect[2] - rect[0] : rect[3] - rect[1]);

/** house: { rect, y (floor), face (the door's side), storeys, seed, kind ('house' | 'cult' | 'store' | 'workshop') } */
export function house(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed ?? 1), kind = el.kind ?? 'house', st = kind === 'store' ? 1 : (el.storeys ?? 1), SH = 2.7, h = st * SH + (kind === 'store' ? 0.3 : 0);
  const wall = kind === 'cult' ? 'lime_plaster' : WALLS[Math.floor(rand() * WALLS.length)];
  const low = el.low ?? y - 3.5;
  bag.add('rubble', box(x0 - 0.15, low, z0 - 0.15, x1 + 0.15, y + 0.75, z1 + 0.15));
  bag.add(wall, box(x0, y + 0.75, z0, x1, y + h, z1));
  bag.add('earth_wall', box(x0 - 0.1, y + h, z0 - 0.1, x1 + 0.1, y + h + 0.28, z1 + 0.1));
  bag.add(wall, mergeG([box(x0, y + h + 0.28, z0, x1, y + h + 0.7, z0 + 0.25), box(x0, y + h + 0.28, z1 - 0.25, x1, y + h + 0.7, z1), box(x0, y + h + 0.28, z0, x0 + 0.25, y + h + 0.7, z1), box(x1 - 0.25, y + h + 0.28, z0, x1, y + h + 0.7, z1)]));
  col.rect(el.rect, low, y + h + 0.7);
  const tie = [], win = [], frame = [], F = ['n', 's', 'w', 'e'];
  for (const f of F) {
    const L = lenOf(el.rect, f);
    for (let s = 0; s < st; s++) tie.push(onFace(el.rect, f, 0.05, L - 0.05, y + 0.78 + s * SH, y + 0.9 + s * SH, 0.07));
    tie.push(onFace(el.rect, f, 0.05, L - 0.05, y + h - 0.25, y + h - 0.12, 0.07));
    if (f === el.face) {
      const dc = L * (0.3 + rand() * 0.4), dw = 1.0;
      win.push(onFace(el.rect, f, dc - dw / 2, dc + dw / 2, y + 0.75, y + 2.35, 0.05));
      frame.push(onFace(el.rect, f, dc - dw / 2 - 0.14, dc - dw / 2, y + 0.75, y + 2.5, 0.1), onFace(el.rect, f, dc + dw / 2, dc + dw / 2 + 0.14, y + 0.75, y + 2.5, 0.1), onFace(el.rect, f, dc - dw / 2 - 0.14, dc + dw / 2 + 0.14, y + 2.35, y + 2.5, 0.1));
      if (st > 1) win.push(onFace(el.rect, f, dc - 0.45, dc + 0.45, y + SH + 1.0, y + SH + 1.9, 0.05));
      // the stone sill step at the door
      bag.add('rubble', onFace(el.rect, f, dc - 0.7, dc + 0.7, y - 0.25, y + 0.12, 0.7, 0.15));
    } else if (kind !== 'store' && rand() < 0.7) {
      const wc = L * (0.25 + rand() * 0.5);
      win.push(onFace(el.rect, f, wc - 0.3, wc + 0.3, y + 1.5, y + 2.1, 0.05));
    }
  }
  bag.add('timber', mergeG(tie)); bag.add('opening', mergeG(win)); bag.add('timber', mergeG(frame));
  // a clay spout on the roof edge and, on some roofs, jars and a stack of fuel
  bag.add('terracotta', box(x0 + 1 + rand() * 2, y + h + 0.06, z0 - 0.35, x0 + 1.25 + rand() * 2, y + h + 0.16, z0 + 0.1));
  if (kind === 'cult') bag.add('plaster', mergeG([box(x0 + 0.5, y + h + 0.7, z0 + 0.5, x0 + 1.9, y + h + 1.2, z0 + 0.9), box(x1 - 1.9, y + h + 0.7, z0 + 0.5, x1 - 0.5, y + h + 1.2, z0 + 0.9)]));
}

/** granary: { rect, y } — a long storehouse with a stone base, closed walls, a door, the clay roof (pithoi of wheat inside). */
export function granary(el, ctx) {
  const { bag } = ctx;
  house({ ...el, kind: 'store', face: el.face ?? 'n', low: el.y - 1.5 }, ctx);
  const [x0, , x1, z1] = el.rect;
  for (let x = x0 + 1; x < x1 - 0.8; x += 1.4) bag.add('terracotta', lathe([[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]], 12, null, x, el.y, z1 + 1.0));
}

/** yard: { kind ('kiln' | 'pithoi' | 'loom' | 'press'), at: [x, z], y, rot, seed } — the small works that stand by a workshop. */
export function yard(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, rand = rng(el.seed ?? 1);
  if (el.kind === 'kiln') {
    bag.add('mudbrick', lathe([[1.1, 0], [1.05, 0.5], [0.8, 1.1], [0.35, 1.5], [0.28, 1.6], [0.001, 1.6]], 14, null, x, y, z));
    bag.add('opening', box(x - 0.3, y + 0.1, z + 0.95, x + 0.3, y + 0.7, z + 1.05));
    bag.add('pottery_dark', lathe([[0.3, 1.58], [0.28, 1.7], [0.001, 1.7]], 8, null, x, y, z));
    col.circle(x, z, 1.15, y, y + 1.6);
    for (let i = 0; i < 6; i++) bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.03], [0.17, 0.2], [0.1, 0.34], [0.001, 0.34]], 8, null, x + 2.0 + (i % 3) * 0.5, y, z - 0.4 + Math.floor(i / 3) * 0.5));
  } else if (el.kind === 'pithoi') {
    for (let i = 0; i < 6; i++) {
      const px = x + (i % 3) * 1.0, pz = z + Math.floor(i / 3) * 1.0, s = 0.9 + rand() * 0.25;
      bag.add('terracotta', lathe([[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]].map(([r, hh]) => [r * s, hh * s]), 12, null, px, y, pz));
      col.circle(px, pz, 0.42 * s, y, y + 1.2 * s);
    }
  } else if (el.kind === 'loom') {
    // the warp-weighted loom: two posts and a beam, the threads, the clay weights at their ends
    bag.add('timber', mergeG([box(x - 0.8, y, z - 0.05, x - 0.7, y + 1.9, z + 0.05), box(x + 0.7, y, z - 0.05, x + 0.8, y + 1.9, z + 0.05), box(x - 0.85, y + 1.8, z - 0.06, x + 0.85, y + 1.9, z + 0.06)]));
    bag.add('cloth_ochre', box(x - 0.7, y + 0.45, z - 0.01, x + 0.7, y + 1.8, z + 0.01));
    const w = []; for (let i = 0; i < 12; i++) w.push(box(x - 0.66 + i * 0.12, y + 0.3, z - 0.04, x - 0.58 + i * 0.12, y + 0.45, z + 0.04));
    bag.add('terracotta', mergeG(w)); col.rect([x - 0.85, z - 0.1, x + 0.85, z + 0.1], y, y + 1.9);
  } else {
    // the oil press: a stone basin, a beam weighted by a stone, jars
    bag.add('limestone_yellow', lathe([[0.9, 0], [0.9, 0.5], [0.6, 0.5], [0.6, 0.35], [0.001, 0.35]], 12, null, x, y, z));
    bag.add('timber', mergeG([box(x - 0.1, y, z - 0.1, x + 0.1, y + 1.6, z + 0.1), box(x - 0.3, y + 1.0, z - 0.12, x + 2.6, y + 1.2, z + 0.12)]));
    bag.add('rock_boulder', box(x + 2.3, y + 0.35, z - 0.3, x + 2.9, y + 1.0, z + 0.3));
    col.circle(x, z, 0.95, y, y + 0.5);
    bag.add('terracotta', lathe([[0.001, 0], [0.14, 0.03], [0.22, 0.25], [0.2, 0.42], [0.12, 0.5], [0.001, 0.5]], 10, null, x - 1.3, y, z + 0.3));
  }
  void place;
}
