// Classical Athens about 410 BC (docs/settlements/athens.md §2–§4): on the Acropolis, the Parthenon
// (the full building of the previous design, src/buildings/parthenon), the Propylaia, the Temple of
// Athena Nike on its bastion, the Erechtheion with its maiden porch, the Athena Promachos, the
// summit's wall; in the Agora, the Hephaisteion on its hill, the stoas, the Tholos.

import { ACRO, AGORA, KOLONOS, height } from './layout.js';
import parthenonPlan from '../../buildings/parthenon/plan.js';

const T = ACRO.top, E = [];
/** A peripteral or prostyle temple: { c, nx, nz (columns on the fronts and flanks; nz = 0: prostyle porches only), A (spacing), h, d, order, y, len, wid, front (+1: east) }. */
function temple({ c: [cx, cz], nx, nz, A, h, d, order = 'doric', y, prostyle = 0, cellaW, cellaL }) {
  const X = Array.from({ length: nz ? nz : 2 }, (_, k) => cx + (k - ((nz || 2) - 1) / 2) * A), Z = Array.from({ length: nx }, (_, k) => cz + (k - (nx - 1) / 2) * A);
  const hx = (X[X.length - 1] - X[0]) / 2 + d, hz = (Z[Z.length - 1] - Z[0]) / 2 + d, ST = 3 * 0.4;
  E.push({ t: 'krepis', rect: [cx - hx - 0.6, cz - hz - 0.6, cx + hx + 0.6, cz + hz + 0.6], y0: y, steps: 3, rise: 0.4, tread: 0.4, mat: 'marble' });
  const ring = [];
  if (nz) { for (const x of X) ring.push([x, Z[0]], [x, Z[Z.length - 1]]); for (const z of Z.slice(1, -1)) ring.push([X[0], z], [X[X.length - 1], z]); }
  else for (const z of Z) ring.push([X[0], z], [X[X.length - 1], z]);
  for (const [x, z] of ring) E.push({ t: 'column', at: [x, z], y: y + ST, h, d, mat: 'marble_column', order, yaw: order === 'ionic' ? Math.PI / 2 : 0 });
  const ENT = y + ST + h, arch = h * 0.13, frieze = h * 0.13, geison = h * 0.06;
  E.push({ t: 'doric_entablature', axes: { x: X, z: Z }, y: ENT, face: d * 0.45, arch, frieze, geison, tw: d * 0.45, overhang: d * 0.35, mat: 'marble' });
  const top = ENT + arch + frieze + geison, pad = d * 0.45 + d * 0.35;
  E.push({ t: 'pediment_roof', rect: [X[0] - pad, Z[0] - pad, X[X.length - 1] + pad, Z[Z.length - 1] + pad], y: top, rise: (hz * 2) * 0.12, tympanumInset: 0.5, rakingGeison: 0.4, mat: 'marble' });
  const cw = cellaW ?? (hz * 2 - A * 2.2), cl = cellaL ?? (hx * 2 - A * 3);
  if (cw > 2 && cl > 2) {
    const r = [cx - cl / 2, cz - cw / 2, cx + cl / 2, cz + cw / 2], wy = ENT + arch + frieze;
    E.push({ t: 'wall', a: [r[0], r[1]], b: [r[2], r[1]], th: 0.9, y0: y + ST, y1: wy, mat: 'marble' }, { t: 'wall', a: [r[0], r[3]], b: [r[2], r[3]], th: 0.9, y0: y + ST, y1: wy, mat: 'marble' });
    E.push({ t: 'wall', a: [r[0], r[1]], b: [r[0], r[3]], th: 0.9, y0: y + ST, y1: wy, mat: 'marble' });
    E.push({ t: 'wall', a: [r[2], r[1]], b: [r[2], r[3]], th: 0.9, y0: y + ST, y1: wy, mat: 'marble', openings: [{ at: cw / 2, w: Math.min(3.5, cw * 0.4), h: h * 0.7, y0: y + ST }] });
  }
}
// the Propylaia: the central gate building (six Doric columns west and east) and its two wings
temple({ c: [-124, 0], nx: 6, nz: 2, A: 3.6, h: 8.8, d: 1.56, y: T - 4, cellaW: 0 });
E.push({ t: 'stair', rect: [-140, -9, -131, 9], dir: 'e', y0: T - 4.8, y1: T - 3, riser: 0.3, base: T - 5, mat: 'marble' });
E.push({ t: 'stair', rect: [-116, -9, -108, 9], dir: 'e', y0: T - 2.8, y1: T, riser: 0.25, base: T - 3, mat: 'marble' });
E.push({ t: 'block', rect: [-140, -32, -112, -14], y0: T - 10, y1: T - 3, mat: 'marble', walk: true });
E.push({ t: 'block', rect: [-140, 14, -126, 26], y0: T - 10, y1: T - 3, mat: 'marble', walk: true });
// the Nike bastion and its little Ionic temple (four columns at each end)
E.push({ t: 'block', rect: [-150, 16, -128, 34], y0: T - 14, y1: T - 3, mat: 'limestone', walk: true });
temple({ c: [-139, 25], nx: 4, nz: 0, A: 1.65, h: 4.0, d: 0.53, order: 'ionic', y: T - 3, cellaW: 4.2, cellaL: 3.8 });
// the Athena Promachos
E.push({ t: 'statue', c: [-80, -6], h: 9, y: T });
// the Erechtheion: an Ionic east porch of six, the cella, and the porch of the maidens on the south
temple({ c: [32, -46], nx: 6, nz: 0, A: 2.3, h: 6.6, d: 0.69, order: 'ionic', y: T, cellaW: 11.6, cellaL: 20 });
for (let i = 0; i < 6; i++) E.push({ t: 'column', at: [24 + (i % 3) * 2.4, -38.5 + Math.floor(i / 3) * 2.3], y: T + 1.2 + 1.8, h: 2.3, d: 0.6, mat: 'marble_column', order: 'ionic' });
E.push({ t: 'block', rect: [22.5, -40, 31, -35.5], y0: T + 1.2, y1: T + 3, mat: 'marble' });
E.push({ t: 'block', rect: [22, -40.5, 31.5, -35], y0: T + 5.3, y1: T + 6.2, mat: 'marble' });
// the summit's wall along the rim
for (let k = 0; k < 48; k++) {
  const a0 = k / 48 * Math.PI * 2, a1 = (k + 1) / 48 * Math.PI * 2, m = (a0 + a1) / 2;
  if (Math.cos(m) < -0.9) continue;                                            // open at the west end (the Propylaia)
  E.push({ t: 'wall', a: [ACRO.c[0] + Math.cos(a0) * ACRO.r[0], ACRO.c[1] + Math.sin(a0) * ACRO.r[1]], b: [ACRO.c[0] + Math.cos(a1) * ACRO.r[0], ACRO.c[1] + Math.sin(a1) * ACRO.r[1]], th: 1.6, y0: T - 6, y1: T + 1.6, mat: 'limestone' });
}
E.push({ t: 'floor', rect: [-108, -55, 128, 55], y: T + 0.04, th: 0.3, mat: 'limestone', walk: true });

// ── the Agora ──
const ky = KOLONOS.h;
temple({ c: [KOLONOS.c[0], KOLONOS.c[1]], nx: 6, nz: 13, A: 2.6, h: 5.7, d: 1.0, y: ky - 0.2, cellaW: 7.5, cellaL: 17 });
E.push({ t: 'stoa', rect: [AGORA[0] + 30, AGORA[1] - 2, AGORA[2] - 10, AGORA[1] + 12], h: 6, front: 's', y: height(AGORA[0] + 60, AGORA[1] + 5) });  // the Stoa Poikile
E.push({ t: 'stoa', rect: [AGORA[0] - 6, AGORA[1] + 20, AGORA[0] + 8, AGORA[1] + 70], h: 6, front: 'e', y: height(AGORA[0], AGORA[1] + 45) });  // the Stoa of Zeus
E.push({ t: 'stoa', rect: [AGORA[0] + 20, AGORA[3] - 12, AGORA[2], AGORA[3] + 2], h: 5.5, front: 'n', y: height(AGORA[0] + 60, AGORA[3]) });  // the South Stoa
E.push({ t: 'tholos', c: [AGORA[0] + 4, AGORA[3] - 22], r: 9, h: 5, y: height(AGORA[0] + 4, AGORA[3] - 22) });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('acropolis', [-108, -55, 128, 55], T + 0.04, 'open'), room('agora', AGORA, 0, 'open')];
const walks = [[[-300, 70], [-235, 45], [-175, 18], [-150, 2], [-136, 0], [-100, 0]]];
walks[0].y0 = height(-300, 70);

export const acropolis = {
  id: 'athens-acropolis',
  name: { en: 'The Acropolis and the Agora', zh: '雅典卫城与广场' },
  era: { en: 'Classical Athens, about 410 BC', zh: '古典雅典，约公元前410年' },
  style: 'greek',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-300, 70], facing: 'e' },
  bounds: [-330, -310, 145, 80],
  view: [-150, -20, -100, 30],
  viewY: T,
  bakeTop: 90,
  elements: E,
  rooms,
  walks,
};
// the Parthenon itself: the previous design's full building, set on the summit
export const parthenon = { ...parthenonPlan, origin: [18, 18], base: T, district: undefined, view: [18 - 35, 18 - 16, 18 + 35, 18 + 16], viewY: T };
export default acropolis;
