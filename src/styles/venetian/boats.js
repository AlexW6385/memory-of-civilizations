// The boats of the Molo about 1500 (docs/settlements/venice.md §4b): gondolas as Carpaccio and
// Gentile Bellini painted them in the 1490s — a long narrow hull rising at both ends, the small iron
// at the bow, the cabin (felze) of dark cloth on hoops amidships on some, the oarsman's forcola at
// the stern and the single long oar — moored stern to the quay between their mooring posts.

import { box, rod, lathe } from '../../core/geom.js';
import { sheet, Local } from '../renaissance/face.js';
import { tube, blob, limb, ring } from './stone.js';

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
  if (el.fine === 'only') {
    const bow = st(1); ferro(Lc, bow); if (el.felze) felze(Lc);
    for (const list of Lc.m.values()) for (const g of list) { g.rotateY(-yaw); g.translate(px, yw, pz); }
    Lc.emit(bag); return;
  }
  // the hull: five lines along the boat (gunwale, bilge, keel, bilge, gunwale), skinned between them
  Lc.add('lacquer_black', sheet(rows));
  // the floorboards, the thwarts, the gunwale strakes
  Lc.add('wood_dark', box(-Ln * 0.32, -0.05, -0.38, Ln * 0.32, 0.0, 0.38));
  for (const x of [-2.6, 2.4]) Lc.add('wood_dark', box(x - 0.15, 0.25, -0.55, x + 0.15, 0.3, 0.55));
  // the iron at the bow, a little ornament at the stern
  const bow = st(1), stern = st(0);
  if (!el.noFerro) {
  Lc.add('iron', box(bow.x - 0.06, bow.g - 0.35, -0.02, bow.x + 0.06, bow.g + 0.45, 0.02));
  for (const k of [0, 1, 2]) Lc.add('iron', box(bow.x + 0.04, bow.g - 0.2 + k * 0.17, -0.02, bow.x + 0.2, bow.g - 0.14 + k * 0.17, 0.02)); }
  Lc.add('iron', box(stern.x - 0.04, stern.g - 0.2, -0.02, stern.x + 0.04, stern.g + 0.2, 0.02));
  // the forcola and the oar, shipped along the boat
  Lc.add('wood_dark', box(-Ln * 0.36, 0.3, 0.42, -Ln * 0.36 + 0.14, 1.1, 0.56));
  Lc.add('wood_dark', rod([-Ln * 0.36, 1.05, 0.5], [Ln * 0.2, 0.42, 0.62], 0.045, 6));
  if (el.felze) {
    // the cabin: hoops under dark cloth, open at the front
    Lc.add('cloth_black', lathe([[0.62, 0], [0.6, 0.55], [0.42, 0.95], [0.001, 1.08]], 12, null, 0, 0, 0).scale(1.9 * 0.8, 0.8, 0.8).translate(0.3, 0.32, 0));
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

/** The ferro: the steel prow, a blade rising from the stem and leaning forward, the comb of teeth down its fore edge, the curled top. */
function ferro(Lc, bow) {
  const x = bow.x, y = bow.g;
  Lc.add('iron', tube([[x - 0.02, y - 0.3, 0], [x + 0.0, y + 0.05, 0], [x + 0.03, y + 0.45, 0], [x + 0.12, y + 0.74, 0]], [[0.016, 0.07], [0.014, 0.075], [0.014, 0.065], [0.012, 0.05]], { seg: 6, sub: 1, side: [0, 0, 1] }));
  for (let k = 0; k < 6; k++) { const yy = y - 0.05 + k * 0.1; Lc.add('iron', limb([x + 0.03 + 0.005 * k, yy, 0], [x + 0.17 + 0.006 * k, yy - 0.02, 0], 0.014, 0.007, 4)); }   // the six teeth
  Lc.add('iron', blob([x + 0.14, y + 0.78, 0], 0.045, [1.2, 0.8, 0.55], 6));
  Lc.add('iron', tube([[x - 0.03, y + 0.1, 0], [x - 0.15, y + 0.25, 0], [x - 0.12, y + 0.4, 0]], [0.014, 0.011, 0.008], { seg: 5, sub: 0, side: [0, 0, 1] }));   // the back tooth, curled
  Lc.add('iron', box(x - 0.09, y - 0.44, -0.035, x + 0.05, y - 0.3, 0.035));
}
/** The felze: four hoops under a black cloth with its folds, the front open, shuttered windows on the sides. */
function felze(Lc) {
  const X0 = -0.9, X1 = 1.5;
  Lc.add('cloth_black', tube([[X0, 0.32, 0], [(X0 + X1) / 2, 0.32, 0], [X1, 0.32, 0]], [[0.6, 0.9], [0.65, 1.1], [0.56, 0.8]], { seg: 14, sub: 2, capA: true, capB: false, side: [0, 0, 1],
    mod: (th, t) => (Math.sin(th) < 0 ? 0.04 : 1 + 0.025 * Math.cos(11 * th + 7 * t)) }));
  for (let k = 0; k < 5; k++) { const x = X0 + 0.05 + k * (X1 - X0 - 0.1) / 4, s = 1 - 0.07 * (k === 4 ? 1 : 0); Lc.add('wood_dark', ring(0.66 * s, 0.66 * s, 0.022, 14, 4).rotateZ(Math.PI / 2).scale(1, 1.66, 1).translate(x, 0.32, 0)); }
  for (const z of [-1, 1]) {
    Lc.add('wood_dark', box(X0 + 0.5, 0.52, z * 0.6 - 0.02, X1 - 0.5, 0.95, z * 0.6 + 0.02));
    for (let k = 0; k < 6; k++) Lc.add('wood_dark', box(X0 + 0.55 + k * 0.17, 0.56, z * 0.62 - 0.012, X0 + 0.65 + k * 0.17, 0.9, z * 0.62 + 0.012).rotateZ(0));
  }
  Lc.add('wood_dark', box(-0.95, 0.3, -0.58, 1.5, 0.45, 0.58));
}
