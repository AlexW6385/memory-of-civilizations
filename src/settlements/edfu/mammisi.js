// The birth house (mammisi) of Edfu, built under Ptolemy VIII and decorated under Ptolemy IX
// (docs/settlements/edfu.md §4.2): on a podium before the pylon to the west, a sanctuary of two
// rooms (the hall and the birth room) wrapped on its sides and back by an ambulatory of columns,
// with an open forecourt of columns in front; floral capitals carrying tall dados with Bes on every
// face; low screen walls between the columns crowned with cornices and cobras; the entrance in the
// middle of the front row, facing the temple's forecourt. Pure data in settlement coordinates.

import { MAMMISI } from './layout.js';

const [x0, z0, x1, z1] = MAMMISI, cx = (x0 + x1) / 2;
const P = 1.0;                                   // the podium's top
const COL_H = 5.6, COL_D = 0.9, DADO = 1.4, ARCH = 0.8, ROOF = 0.6;
const yDado = P + COL_H, yArch = yDado + DADO, yRoof = yArch + ARCH, yTop = yRoof + ROOF;
const xL = x0 + 1.1, xR = x1 - 1.1, zF = z0 + 1.1, zB = z1 - 1.1;
const CORE = [cx - 6, z0 + 11, cx + 6, zB - 3];    // the sanctuary's outer faces
const CAPS = ['composite_a', 'papyrus_open', 'composite_b', 'palm', 'composite_c', 'lotus'];

const E = [];
// the podium and its stair from the north
E.push({ t: 'block', rect: [x0, z0, x1, z1], y0: -0.5, y1: P, mat: 'sandstone', walk: true, trim: { torus: 0.12, cornice: 0, corners: true } });
E.push({ t: 'stair', rect: [cx - 2.6, z0 - 2.6, cx + 2.6, z0], dir: 's', y0: 0, y1: P, riser: 0.17, base: -0.3 });

// the columns: the front and back rows of eight, thirteen down each side
const cols = [];
const side = 13, row = 8;
for (let i = 0; i < side; i++) { const z = zF + (zB - zF) * i / (side - 1); cols.push({ x: xL, z, k: i, face: 'w' }, { x: xR, z, k: i, face: 'e' }); }
for (let i = 1; i < row - 1; i++) { const x = xL + (xR - xL) * i / (row - 1); cols.push({ x, z: zF, k: Math.min(i, row - 1 - i), face: 'n' }, { x, z: zB, k: Math.min(i, row - 1 - i) + 2, face: 's' }); }
for (const c of cols) {
  E.push({ t: 'column', at: [c.x, c.z], y: P, h: COL_H, d: COL_D, cap: CAPS[c.k % CAPS.length], mat: 'sandstone_column' });
  E.push({ t: 'obj', kind: 'bes_dado', at: [c.x, c.z], y: yDado, w: 0.95, h: DADO });
}
// the architraves round the whole colonnade and its cornice (open over the forecourt)
for (const [a, b] of [[[xL, zF], [xR, zF]], [[xR, zF], [xR, zB]], [[xR, zB], [xL, zB]], [[xL, zB], [xL, zF]]]) E.push({ t: 'beam', a, b, y: yArch, w: 1.0, h: ARCH, ext: 0.5, mat: 'sandstone' });
E.push({ t: 'trim', rect: [xL - 0.5, zF - 0.5, xR + 0.5, zB + 0.5], y0: yArch, y1: yRoof, trim: { torus: 0.14, cornice: 0.9, corners: false, cap: false }, mat: 'sandstone' });

// the screen walls between the columns, open only in the middle of the front row
const screens = [];
const sp = (zB - zF) / (side - 1), rp = (xR - xL) / (row - 1);
for (let i = 0; i < side - 1; i++) { const za = zF + sp * i + 0.3, zb = zF + sp * (i + 1) - 0.3; screens.push([[xL, za], [xL, zb], [false, true, false, false]], [[xR, za], [xR, zb], [false, false, false, true]]); }
for (let i = 0; i < row - 1; i++) {
  const xa = xL + rp * i + 0.3, xb = xL + rp * (i + 1) - 0.3;
  if (i !== (row - 2) / 2) screens.push([[xa, zF], [xb, zF], [false, false, true, false]]);
  screens.push([[xa, zB], [xb, zB], [true, false, false, false]]);
}
for (const [a, b, sides] of screens) E.push({ t: 'wall', a, b, th: 0.5, y0: P, y1: P + 2.6, openings: [], mat: 'sandstone', trim: { torus: 0.1, cornice: 0.5, corners: false, uraei: { sides, h: 0.42 } } });

// the sanctuary: its walls up to the roof, the door from the forecourt, the cross wall between the
// hall and the birth room, the roof over it and over the ambulatory, the cornice round it all
const [c0, d0, c1, d1] = CORE, th = 1.2, h2 = th / 2;
E.push({ t: 'wall', a: [c0 + th, d0 + h2], b: [c1 - th, d0 + h2], th, y0: P, y1: yTop, openings: [{ at: (c1 - c0) / 2 - th, w: 2.2, h: 4.6 }], mat: 'sandstone' });
E.push({ t: 'wall', a: [c0 + th, d1 - h2], b: [c1 - th, d1 - h2], th, y0: P, y1: yTop, mat: 'sandstone' });
for (const x of [c0 + h2, c1 - h2]) E.push({ t: 'wall', a: [x, d0], b: [x, d1], th, y0: P, y1: yTop, mat: 'sandstone' });
E.push({ t: 'wall', a: [c0 + th, d0 + 10.5], b: [c1 - th, d0 + 10.5], th: 0.9, y0: P, y1: yRoof, openings: [{ at: (c1 - c0) / 2 - th, w: 1.6, h: 3.6 }], mat: 'sandstone' });
E.push({ t: 'slab', rect: [c0 + th, d0 + th, c1 - th, d1 - th], y0: yRoof, y1: yTop, mat: 'sandstone' });
for (const r of [[xL, d0, c0, zB], [c1, d0, xR, zB], [c0, d1, c1, zB]]) E.push({ t: 'slab', rect: r, y0: yRoof, y1: yTop, mat: 'sandstone' });
E.push({ t: 'trim', rect: [c0, d0, c1, d1], y0: P, y1: yTop, trim: { torus: 0.25, cornice: 1.1, corners: true, cap: false }, mat: 'sandstone' });
// in the birth room an offering table before the back wall
E.push({ t: 'obj', kind: 'altar', at: [cx, d1 - th - 2.2], y: P, w: 1.6, d: 1.0, h: 1.0 });

export const mammisi = {
  id: 'edfu-mammisi', style: 'egyptian', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [cx, z0 - 6], facing: 's' }, bounds: [x0 - 2, z0 - 4, x1 + 2, z1 + 2], rooms: [], elements: E,
};
export default mammisi;
