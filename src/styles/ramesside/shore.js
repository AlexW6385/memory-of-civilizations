// The ground-level pieces of Abu Simbel: the cliff along the bank, the paved ramp down to the river, the quay's bollards, the round granaries
// of the camp, the open-air altar of Ra-Horakhty at the end of the terrace, the stone gate through the enclosure's wall.

import { box, frustum, lathe, fromTriangles, quad, place } from '../../core/geom.js';
import { cavettoProfile } from '../egyptian/trim.js';
import { baboon } from './statues.js';
import { extrudeProfile, rng } from './util.js';
import { put } from './great.js';
import { cliffFace, cliffTop } from './dims.js';

/** The cliff in slices of 4 m along the bank (the two temples are cut in the slices left out: `skip`), each with its hill falling away in steps behind. */
export function cliff(el, { bag, col }) {
  const r = rng(el.seed ?? 7), skip = el.skip ?? [];
  for (let z = el.z0; z < el.z1; z += 4) {
    const zm = z + 2;
    if (skip.some(([a, b]) => zm > a && zm < b)) continue;
    const near = skip.some(([a, b]) => zm > a - 12 && zm < b + 12);
    const top = cliffTop(zm) + (near ? 0 : (r() - 0.5) * 2.4);
    if (top < 0.8) continue;
    const xf = cliffFace(zm) + (near ? 0 : (r() - 0.5) * 0.8);
    bag.add('sandstone_yellow', box(xf - 60, -1, z, xf, top, z + 4)); col.rect([xf - 60, z, xf, z + 4], -1, top);
    for (let j = 1; j <= 5; j++) { const x1 = xf - 60 - 13 * (j - 1), x0 = x1 - 13, t = top * (1 - j / 6); if (t > 0.5) { bag.add('sandstone_yellow', box(x0, -1, z, x1, t, z + 4)); col.rect([x0, z, x1, z + 4], -1, t); } }
  }
}

/** A paved way down the bank in straight pieces along x: pts [[x, y]] (the ground's own height, taken by the plan), the way z0..z1 wide, skirts to the ground under it. */
export function rampWay(el, { bag, col }) {
  const { z0, z1 } = el, th = el.th ?? 0.5, T = [], mat = el.mat || 'sandstone_floor', P = el.pts;
  for (let i = 0; i + 1 < P.length; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1];
    quad(T, [x0, y0, z0], [x0, y0, z1], [x1, y1, z1], [x1, y1, z0]);                       // the top (seen from above)
    quad(T, [x0, y0 - th, z1], [x1, y1 - th, z1], [x1, y1, z1], [x0, y0, z1]);               // the skirts, outward
    quad(T, [x1, y1 - th, z0], [x0, y0 - th, z0], [x0, y0, z0], [x1, y1, z0]);
    if (y1 > y0) col.ramp([x0, z0, x1, z1], y0, y1, 'e'); else if (y1 < y0) col.ramp([x0, z0, x1, z1], y1, y0, 'w'); else col.floor([x0, z0, x1, z1], y0);
  }
  bag.add(mat, fromTriangles(T));
  // the kerbs: a low course of dressed stone along each side
  for (let i = 0; i + 1 < P.length; i++) {
    const [x0, y0] = P[i], [x1, y1] = P[i + 1], k = [];
    for (const [za, zb] of [[z0 - 0.3, z0], [z1, z1 + 0.3]]) {
      quad(k, [x0, y0, zb], [x1, y1, zb], [x1, y1 + 0.3, zb], [x0, y0 + 0.3, zb]); quad(k, [x1, y1, za], [x0, y0, za], [x0, y0 + 0.3, za], [x1, y1 + 0.3, za]);
      quad(k, [x0, y0 + 0.3, za], [x0, y0 + 0.3, zb], [x1, y1 + 0.3, zb], [x1, y1 + 0.3, za]);
      quad(k, [x0, y0, za], [x0, y0 + 0.3, za], [x0, y0 + 0.3, zb], [x0, y0, zb]);
      quad(k, [x1, y1, zb], [x1, y1 + 0.3, zb], [x1, y1 + 0.3, za], [x1, y1, za]);
    }
    bag.add('sandstone_dressed', fromTriangles(k));
  }
}

/** Stone mooring posts along a quay's edge: { y, posts: [[x, z]] }. */
export function bollards(el, { bag, col }) {
  for (const [x, z] of el.posts) {
    bag.add('sandstone_dressed', lathe([[0.2, 0], [0.19, 0.3], [0.13, 0.36], [0.13, 0.5], [0.2, 0.55], [0.2, 0.6], [0.001, 0.6]], 10, null, x, el.y, z));
    col.circle(x, z, 0.2, el.y, el.y + 0.6);
  }
}

/** The round granaries of mud, domed, with the hatch at the top and the little door at the foot: { list: [[x, z, r, h]], y }. */
export function granaries(el, { bag, col }) {
  for (const [x, z, r, h] of el.list) {
    const y = el.y ?? 0;
    bag.add('mud_plaster', lathe([[r, 0], [r * 1.02, h * 0.45], [r * 0.9, h * 0.75], [r * 0.55, h * 0.93], [r * 0.3, h], [r * 0.001, h]], 14, null, x, y, z));
    bag.add('mudbrick', lathe([[r * 1.08, 0], [r * 1.08, 0.18], [r * 1.02, 0.18]], 14, null, x, y, z));                      // the footing
    bag.add('palm_trunk', box(x - r * 0.18, y + h * 0.92, z - r * 0.18, x + r * 0.18, y + h * 0.99, z + r * 0.18));          // the lid of the hatch
    bag.add('lacquer_black', box(x + r * 0.9, y + 0.2, z - 0.2, x + r * 1.0, y + 0.8, z + 0.2));                              // the little door at the foot, facing east
    col.circle(x, z, r * 1.08, y, y + h);
  }
}

/**
 * The altar of Ra-Horakhty at the northern end of the terrace: two low platforms, the altar block with its stela, a pair of baboons
 * adoring the east; { at: [x, z], y }.
 */
export function sunAltar(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('sandstone_dressed', box(x - 3.2, y - 0.1, z - 3.2, x + 3.2, y + 0.45, z + 3.2)); col.rect([x - 3.2, z - 3.2, x + 3.2, z + 3.2], y - 0.1, y + 0.45); col.floor([x - 3.2, z - 3.2, x + 3.2, z + 3.2], y + 0.45);
  bag.add('sandstone_dressed', box(x - 2.0, y + 0.45, z - 2.0, x + 2.0, y + 0.85, z + 2.0)); col.rect([x - 2.0, z - 2.0, x + 2.0, z + 2.0], y + 0.45, y + 0.85); col.floor([x - 2.0, z - 2.0, x + 2.0, z + 2.0], y + 0.85);
  const ya = y + 0.85;
  bag.add('sandstone_dressed', box(x - 0.8, ya, z - 0.8, x + 0.8, ya + 1.0, z + 0.8)); col.rect([x - 0.8, z - 0.8, x + 0.8, z + 0.8], ya, ya + 1.0);
  bag.add('sandstone_dressed', extrudeProfile(cavettoProfile(0.2, 0.15, 0.05), x - 0.78, ya + 1.0, z - 0.8, z + 0.8, 1));   // a little cornice
  bag.add('sandstone_dressed', box(x - 0.78, ya + 1.2, z - 0.55, x - 0.62, ya + 2.6, z + 0.55));                           // the stela behind
  col.rect([x - 0.78, z - 0.55, x - 0.62, z + 0.55], ya + 1.0, ya + 2.6);
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.18, 0.02], [0.16, 0.1], [0.001, 0.12]], 10, null, x + 0.1, ya + 1.0, z));
  for (const s of [-1, 1]) { put(bag, baboon(), x + 1.5, ya, z + s * 1.4, -Math.PI / 2, 1); col.circle(x + 1.5, z + s * 1.4, 0.55, ya, ya + 1.7); }
}

/** A gate of dressed stone through a mudbrick wall running east–west at z: two jambs and a lintel under a cavetto cornice: { at: [x, z], w, h, th }. */
export function stoneGate(el, { bag, col }) {
  const [x, z] = el.at, w = el.w, h = el.h, th = el.th ?? 2.2, y = el.y ?? 0, j = 1.1;
  for (const s of [-1, 1]) {
    const a = s > 0 ? x + w / 2 : x - w / 2 - j, b = a + j;
    bag.add('sandstone_dressed', frustum([a, z - th / 2 - 0.2, b, z + th / 2 + 0.2], y, y + h + 0.5, 0, 0, 0.08, 0.08)); col.rect([a, z - th / 2 - 0.2, b, z + th / 2 + 0.2], y, y + h + 0.5);
  }
  bag.add('sandstone_dressed', box(x - w / 2 - j, y + h, z - th / 2 - 0.2, x + w / 2 + j, y + h + 0.5, z + th / 2 + 0.2));
  const L = w + 2 * j, cor = cavettoProfile(0.5, 0.4, 0.1);
  bag.add('sandstone_dressed', place(extrudeProfile(cor, 0, y + h + 0.5, -L / 2, L / 2, 1), x, 0, z - th / 2 - 0.2, Math.PI / 2));     // the cornice, north face
  bag.add('sandstone_dressed', place(extrudeProfile(cor, 0, y + h + 0.5, -L / 2, L / 2, 1), x, 0, z + th / 2 + 0.2, -Math.PI / 2));    // and south face
}
