// The family's walk-in shelters at Ubirr (docs/settlements/kakadu.md §5c): a gabled bark house, a paperbark dome and an open brush shade.
// All sizes and forms [inferred] from the bark shelters and wet-season huts of the region's ethnography; none is dated to the rock's painters.
// Local frame: the door on +z; the element's rot turns it. Walls collide, the door and the open sides do not; the roofs do not (the head is free).
import { box, rod, fromTriangles } from '../../core/geom.js';
import { placer, assembly } from '../../objects/kit.js';

/** A thin bark slab from four corners, seen from both faces. */
function slab(p0, p1, p2, p3, d = 0.04) {
  const t = [], o = (p) => [p[0], p[1] - d, p[2]];
  const q = (A, B, C, D, f) => { for (const p of f ? [A, C, B, A, D, C] : [A, B, C, A, C, D]) t.push(...p); };
  q(p0, p1, p2, p3, false); q(o(p0), o(p1), o(p2), o(p3), true);
  return fromTriangles(t);
}
const tri = (a, b, c) => { const t = []; for (const p of [a, b, c, a, c, b]) t.push(...p); return fromTriangles(t); };

/** Sizes of each kind: the footprint's half-extents, the fire's place (local x, z), the people's places. */
export const HOUSE = {
  bark: { hw: 1.9, hd: 2.3, fire: [0.75, -0.55], bed: [-0.95, -1.15], goods: [[0, -1.75, 'bags'], [1.05, -1.55, 'yams']], sit: [[1.15, 0.55, -2.0], [-1.1, 0.35, 1.6]], child: [-0.9, -1.1] },
  dome: { hw: 2.0, hd: 2.0, fire: [0.35, -0.45], bed: [-0.8, -0.75], goods: [[0.5, -1.35, 'yams']], sit: [[0.9, 0.55, -2.2]], child: [-0.8, -0.8] },
  shade: { hw: 2.3, hd: 1.9, fire: [0.9, 0.1], bed: [-1.2, -0.7], goods: [[0.2, -1.3, 'bags'], [1.6, -1.1, 'trap']], sit: [[1.7, 0.9, -2.4], [-0.6, 0.7, 1.4]], child: [-1.2, -0.7] },
};

function barkHouse(a) {
  const W = 1.7, D = 2.0, WH = 1.9, RH = 3.0, DW = 0.7;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) a('pole', rod([sx * W, 0, sz * D], [sx * W, WH + 0.1, sz * D], 0.05, 5));
  a('pole', rod([0, RH, -D - 0.25], [0, RH, D + 0.25], 0.07, 5));
  for (const sx of [-1, 1]) {
    a('pole', rod([sx * DW, 0, D], [sx * DW, WH + 0.05, D], 0.06, 5));
    a('pole', rod([sx * (W + 0.25), WH - 0.2, -D - 0.2], [sx * (W + 0.25), WH - 0.2, D + 0.2], 0.04, 4));    // the eaves' pole
  }
  a('sheet', box(-W - 0.03, 0, -D, -W + 0.03, WH, D)); a('sheet', box(W - 0.03, 0, -D, W + 0.03, WH, D));
  a('sheet', box(-W, 0, -D - 0.03, W, WH, -D + 0.03));
  a('sheet', box(-W, 0, D - 0.03, -DW, WH, D + 0.03)); a('sheet', box(DW, 0, D - 0.03, W, WH, D + 0.03));
  a('sheet', tri([-W, WH, D], [W, WH, D], [0, RH, D])); a('sheet', tri([-W, WH, -D], [W, WH, -D], [0, RH, -D]));
  for (const s of [-1, 1]) a('sheet', slab([s * (W + 0.4), WH - 0.25, -D - 0.3], [s * (W + 0.4), WH - 0.25, D + 0.3], [0, RH + 0.05, D + 0.3], [0, RH + 0.05, -D - 0.3], 0.06));
  a('mat', box(-W + 0.15, 0.01, -D + 0.2, W - 0.15, 0.03, D - 0.3));
  a('pole', box(-W + 0.08, 0.34, -D + 0.1, -0.15, 0.4, 0.1));                                                    // the sleeping platform on poles, a mat on it
  for (const [x, z] of [[-W + 0.1, -D + 0.12], [-0.17, -D + 0.12], [-W + 0.1, 0.08], [-0.17, 0.08]]) a('pole', rod([x, 0, z], [x, 0.34, z], 0.04, 4));
  a('mat', box(-W + 0.2, 0.4, -D + 0.2, -0.25, 0.43, 0));
}

function dome(a) {
  const P = [[1.75, 0], [1.72, 0.6], [1.5, 1.3], [1.0, 1.85], [0.45, 2.15], [0.001, 2.25]], N = 16, step = Math.PI * 2 / N, d = 0.07;
  for (let k = 0; k < N; k++) {
    if (k === 3 || k === 4) continue;                                                                           // the doorway, 1.4 m
    const t0 = k * step, t1 = t0 + step, g = k % 2 ? 1.02 : 1;                                                  // the sheets overlap, each a hair out from the last
    for (let i = 0; i + 1 < P.length; i++) {
      const [r0, y0] = P[i], [r1, y1] = P[i + 1], pt = (r, y, t, s) => [(r * g - s) * Math.cos(t), y, (r * g - s) * Math.sin(t)];
      a('dome', fromTriangles([...pt(r0, y0, t0, 0), ...pt(r0, y0, t1, 0), ...pt(r1, y1, t1, 0), ...pt(r0, y0, t0, 0), ...pt(r1, y1, t1, 0), ...pt(r1, y1, t0, 0),
        ...pt(r0, y0, t0, d), ...pt(r1, y1, t1, d), ...pt(r0, y0, t1, d), ...pt(r0, y0, t0, d), ...pt(r1, y1, t0, d), ...pt(r1, y1, t1, d)]));
    }
  }
  for (const t of [3 * step, 5 * step]) for (let i = 0; i + 1 < P.length - 2; i++) a('pole', rod([P[i][0] * Math.cos(t), P[i][1], P[i][0] * Math.sin(t)], [P[i + 1][0] * Math.cos(t), P[i + 1][1], P[i + 1][0] * Math.sin(t)], 0.05, 5));   // the door's jambs follow the shell's edge
  a('mat', box(-1.35, 0.01, -1.35, 1.35, 0.03, 1.2));
  a('pole', box(-1.5, 0.3, -1.45, -0.2, 0.36, -0.1));
  for (const [x, z] of [[-1.45, -1.4], [-0.25, -1.4], [-1.45, -0.15], [-0.25, -0.15]]) a('pole', rod([x, 0, z], [x, 0.3, z], 0.04, 4));
  a('mat', box(-1.45, 0.36, -1.4, -0.25, 0.39, -0.2));
  a('sheet', box(0.85, 0, 1.75, 1.5, 1.35, 1.8));                                                                // the bark door-flap propped open beside the doorway
}

function brushShade(a) {
  const W = 2.2, D = 1.7, HB = 2.0, HF = 2.5;
  for (const [x, z, h] of [[-W + 0.2, -D + 0.2, HB], [W - 0.2, -D + 0.2, HB], [-W + 0.2, D - 0.2, HF], [W - 0.2, D - 0.2, HF]]) a('pole', rod([x, 0, z], [x, h + 0.1, z], 0.06, 5));
  a('pole', rod([-W, HB, -D], [W, HB, -D], 0.05, 5)); a('pole', rod([-W, HF, D], [W, HF, D], 0.05, 5));
  a('thatch', slab([-W - 0.25, HB + 0.05, -D - 0.2], [W + 0.25, HB + 0.05, -D - 0.2], [W + 0.25, HF + 0.08, D + 0.35], [-W - 0.25, HF + 0.08, D + 0.35], 0.16));
  a('sheet', box(-W + 0.15, 0, -D + 0.1, W - 0.15, 1.5, -D + 0.16)); a('sheet', box(-W + 0.12, 0, -D + 0.16, -W + 0.18, 1.1, 0.2));
  a('sheet', box(W - 0.18, 0, -D + 0.16, W - 0.12, 1.1, -0.2));
  a('mat', box(-W + 0.3, 0.01, -D + 0.3, W - 0.3, 0.03, D - 0.5));
  a('pole', box(-W + 0.25, 0.35, -D + 0.2, -0.3, 0.41, 0.0));
  for (const [x, z] of [[-W + 0.3, -D + 0.25], [-0.35, -D + 0.25], [-W + 0.3, -0.05], [-0.35, -0.05]]) a('pole', rod([x, 0, z], [x, 0.35, z], 0.04, 4));
  a('mat', box(-W + 0.3, 0.41, -D + 0.25, -0.35, 0.44, -0.05));
  for (let k = 0; k < 5; k++) a('thatch', rod([-1.6 + k * 0.8, HF + 0.02, D + 0.3], [-1.6 + k * 0.8, HF - 0.35 - (k % 2) * 0.12, D + 0.32], 0.03, 3));   // the thatch's fringe over the open front
}

const MAKE = { bark: barkHouse, dome, shade: brushShade };
/** A walk-in shelter: el.kind bark | dome | shade, el.rot turns the door (local +z). Lit by the fire inside (one point light). */
export function house(el, { bag, col, lights }) {
  const put = placer(el, bag), kind = el.kind ?? 'bark', H = HOUSE[kind];
  const A = assembly(`ka_house|${kind}`, (a) => MAKE[kind](a));
  put('wood_dark', A.pole.clone()); if (A.sheet) put('roof_bark', A.sheet.clone()); if (A.dome) put('bark_birch', A.dome.clone());
  if (A.thatch) put('palm_leaf', A.thatch.clone()); put('reed_mat', A.mat.clone());
  const [x, z] = el.at, y = el.y ?? 0, r = el.rot ?? 0, c = Math.cos(r), s = Math.sin(r), w = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  const seg = (p, q, y1 = 1.9) => col?.segment(w(...p), w(...q), 0.12, y, y + y1);
  if (kind === 'bark') {
    const W = 1.7, D = 2.0; seg([-W, -D], [-W, D]); seg([W, -D], [W, D]); seg([-W, -D], [W, -D]); seg([-W, D], [-0.7, D]); seg([0.7, D], [W, D]);
  } else if (kind === 'dome') {
    const N = 16, st = Math.PI * 2 / N;
    for (let k = 0; k < N; k++) if (k !== 3 && k !== 4) seg([1.75 * Math.cos(k * st), 1.75 * Math.sin(k * st)], [1.75 * Math.cos((k + 1) * st), 1.75 * Math.sin((k + 1) * st)], 1.8);
  } else { const W = 2.2, D = 1.7; seg([-W + 0.15, -D + 0.13], [W - 0.15, -D + 0.13], 1.5); seg([-W + 0.15, -D + 0.13], [-W + 0.15, 0.2], 1.1); seg([W - 0.15, -D + 0.13], [W - 0.15, -0.2], 1.1); }
  const [fx, fz] = w(...H.fire);
  lights?.push({ at: [fx, y + 0.8, fz], color: '#ff9a4a', intensity: 3.2, distance: 7 });
}
/** The ground a house stands on, marked so that the street life keeps clear of it: draws nothing. */
export function homeSite() {}
