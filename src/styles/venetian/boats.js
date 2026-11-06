// The boats of the Molo about 1500 (docs/settlements/venice.md §4b): gondolas as Carpaccio and
// Gentile Bellini painted them in the 1490s — a long narrow hull rising at both ends, the small iron
// at the bow, the cabin (felze) of dark cloth on hoops amidships on some, the oarsman's forcola at
// the stern and the single long oar — moored stern to the quay between their mooring posts.

import { box, rod, lathe } from '../../core/geom.js';
import { sheet, Local } from '../renaissance/face.js';

/** gondola: { at: [x, z], yaw (rad), y (water), len, felze } — built along +x, the bow at +x. */
export function gondola(el, { bag }) {
  const [px, pz] = el.at, yaw = el.yaw ?? 0, yw = el.y ?? 0, Ln = el.len ?? 10.8, W = 1.4, N = 18, Lc = new Local();
  const st = (t) => {
    const s = 2 * t - 1, w = W / 2 * Math.pow(Math.max(0, Math.sin(Math.PI * t)), 0.7);
    return { x: s * Ln / 2, w, g: 0.38 + (s > 0 ? 1.15 : 0.85) * s ** 4, k: -0.22 + 0.32 * s * s };
  };
  const rows = [[], [], [], [], []];
  for (let i = 0; i <= N; i++) {
    const { x, w, g, k } = st(i / N), m = (g + k) / 2 - 0.08;
    rows[0].push([x, g, -w]); rows[1].push([x, m, -w * 0.9]); rows[2].push([x, k, 0]); rows[3].push([x, m, w * 0.9]); rows[4].push([x, g, w]);
  }
  // the hull: five lines along the boat (gunwale, bilge, keel, bilge, gunwale), skinned between them
  Lc.add('lacquer_black', sheet(rows));
  // the floorboards, the thwarts, the gunwale strakes
  Lc.add('wood_dark', box(-Ln * 0.32, -0.05, -0.38, Ln * 0.32, 0.0, 0.38));
  for (const x of [-2.6, 2.4]) Lc.add('wood_dark', box(x - 0.15, 0.25, -0.55, x + 0.15, 0.3, 0.55));
  // the iron at the bow, a little ornament at the stern
  const bow = st(1), stern = st(0);
  Lc.add('iron', box(bow.x - 0.06, bow.g - 0.35, -0.02, bow.x + 0.06, bow.g + 0.45, 0.02));
  for (const k of [0, 1, 2]) Lc.add('iron', box(bow.x + 0.04, bow.g - 0.2 + k * 0.17, -0.02, bow.x + 0.2, bow.g - 0.14 + k * 0.17, 0.02));
  Lc.add('iron', box(stern.x - 0.04, stern.g - 0.2, -0.02, stern.x + 0.04, stern.g + 0.2, 0.02));
  // the forcola and the oar, shipped along the boat
  Lc.add('wood_dark', box(-Ln * 0.36, 0.3, 0.42, -Ln * 0.36 + 0.14, 1.1, 0.56));
  Lc.add('wood_dark', rod([-Ln * 0.36, 1.05, 0.5], [Ln * 0.2, 0.42, 0.62], 0.045, 6));
  if (el.felze) {
    // the cabin: hoops under dark cloth, open at the front
    Lc.add('cloth_black', lathe([[0.62, 0], [0.6, 0.55], [0.42, 0.95], [0.001, 1.08]], 12, null, 0, 0, 0).scale(1.9, 1, 1).translate(0.3, 0.32, 0));
    Lc.add('wood_dark', box(-0.85, 0.3, -0.55, 1.45, 0.42, 0.55));
  } else Lc.add('wood_dark', box(-0.6, 0.3, -0.45, 1.0, 0.62, 0.45));                     // a seat with its cushion box
  for (const list of Lc.m.values()) for (const g of list) { g.rotateY(-yaw); g.translate(px, yw, pz); }
  Lc.emit(bag);
}

/** palo: { at: [x, z], y (bottom), h } — a mooring post, its cap. */
export function palo(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? -4, h = el.h ?? 6;
  bag.add('wood_painted', lathe([[0.16, 0], [0.15, h - 0.3], [0.2, h - 0.25], [0.2, h - 0.05], [0.001, h + 0.15]], 8, null, x, y, z));
}
