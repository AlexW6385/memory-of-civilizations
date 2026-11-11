// Khafre's valley temple (docs/settlements/giza.md §10): a square of massive limestone blocks cased in red granite, the
// floor of alabaster, the main hall T-shaped with sixteen monolithic granite pillars carrying granite architraves under a
// roof of slabs with narrow slits for light, the statue rooms on either side of the stem with twenty-three seated statues
// of the king in dark diorite against their walls, two doors in the east front, a door in the west to the causeway.
// Element: ok_khafre_temple { rect: [x0, z0, x1, z1] (46 × 42 m), y } — east is the front.

import { box } from '../../core/geom.js';

const W = 46, D = 42, HR = 6.7, HT = 8.0;           // the building's width (east–west) and depth, the ceilings' and the roof's height

/** A seated statue of the king on a low base, facing +x (east), at (x, z) on the floor y. */
function statue(bag, x, y, z, face) {
  // (local f forward, l left; the figure faces `face`: 'e' | 'w' | 'n' | 's')
  const R = { e: [1, 0], w: [-1, 0], s: [0, 1], n: [0, -1] }[face], f = R, l = [-R[1], R[0]];
  const B = (f0, l0, y0, f1, l1, y1, mat = 'granite_black') => {
    const p = [x + f[0] * f0 + l[0] * l0, z + f[1] * f0 + l[1] * l0], q = [x + f[0] * f1 + l[0] * l1, z + f[1] * f1 + l[1] * l1];
    bag.add(mat, box(Math.min(p[0], q[0]), y + y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + y1, Math.max(p[1], q[1])));
  };
  B(-0.5, -0.5, 0, 0.5, 0.5, 0.22, 'marble_smooth');                         // the alabaster base
  B(-0.35, -0.3, 0.22, 0.3, 0.3, 0.7);                                      // the throne
  B(-0.35, -0.3, 0.7, -0.2, 0.3, 1.5);                                      // its back slab
  B(-0.15, -0.2, 0.7, 0.28, 0.2, 0.88);                                     // the thighs
  B(0.12, -0.19, 0.3, 0.26, 0.19, 0.7);                                     // the shins, the feet on the footboard
  B(-0.15, -0.2, 0.88, 0.05, 0.2, 1.3);                                     // the torso
  B(-0.12, -0.25, 1.0, 0.03, -0.2, 1.28); B(-0.12, 0.2, 1.0, 0.03, 0.25, 1.28);   // the arms
  B(-0.1, -0.1, 1.3, 0.08, 0.1, 1.55);                                      // the head
  B(-0.2, -0.17, 1.4, -0.08, 0.17, 1.58);                                   // the headcloth's wings behind the face
  B(-0.3, -0.07, 1.5, -0.2, 0.07, 1.72, 'granite_black');                   // the falcon's head over the nape, its wings round it
}

export function khafreTemple(el, { bag, col }) {
  const [rx0, rz0] = el.rect, y0 = el.y ?? 0;
  const X = (u) => rx0 + u, Z = (v) => rz0 + v;
  const R = (u0, v0, u1, v1) => [u0, v0, u1, v1];
  // ── the voids: the rooms and passages, with the height they rise to ───────────────────────────────────────────
  const voids = [
    { r: R(29, 4, 38, 38), h: HR },                       // the hall's crossbar, the east arm
    { r: R(8, 15, 29, 27), h: HR },                       // the stem, running west
    { r: R(8, 6, 26, 13), h: HR }, { r: R(8, 29, 26, 36), h: HR },        // the statue rooms, north and south
    { r: R(16.8, 13, 19.4, 15), h: 3.8 }, { r: R(16.8, 27, 19.4, 29), h: 3.8 },     // their doors from the stem
    { r: R(40, 8, 43.5, 13), h: 4.4 }, { r: R(40, 29, 43.5, 34), h: 4.4 },          // the lobbies behind the front doors
    { r: R(38, 9.3, 40, 11.7), h: 4.0 }, { r: R(38, 30.3, 40, 32.7), h: 4.0 },      // the doors from the lobbies into the hall
    { r: R(43.5, 9.3, 46, 11.7), h: 4.4 }, { r: R(43.5, 30.3, 46, 32.7), h: 4.4 },  // the front doors
    { r: R(0, 19.8, 8, 22.2), h: 4.4 },                                              // the west door and passage to the causeway
  ];
  const cuts = (k) => [...new Set([0, k === 0 ? W : D, ...voids.flatMap((v) => (k === 0 ? [v.r[0], v.r[2]] : [v.r[1], v.r[3]]))])].sort((a, b) => a - b);
  const us = cuts(0), vs = cuts(1);
  // the solid mass between: every cell outside the voids is granite-faced core; over the lower doors a lintel
  for (let j = 0; j < vs.length - 1; j++) {
    let run = null;
    for (let i = 0; i < us.length; i++) {
      const cell = i < us.length - 1 ? [us[i], vs[j], us[i + 1], vs[j + 1]] : null;
      const mid = cell && [(cell[0] + cell[2]) / 2, (cell[1] + cell[3]) / 2];
      const v = mid && voids.find((q) => mid[0] > q.r[0] && mid[0] < q.r[2] && mid[1] > q.r[1] && mid[1] < q.r[3]);
      const solid = cell && !v;
      if (solid) { run = run ? [run[0], run[1], cell[2], run[3]] : cell.slice(); continue; }
      if (run) { bag.add('granite_red', box(X(run[0]), y0, Z(run[1]), X(run[2]), y0 + HR, Z(run[3]))); col.rect([X(run[0]), Z(run[1]), X(run[2]), Z(run[3])], y0, y0 + HR); run = null; }
      if (v && v.h < HR - 0.01) bag.add('granite_red', box(X(cell[0]), y0 + v.h, Z(cell[1]), X(cell[2]), y0 + HR, Z(cell[3])));   // the lintel over a door
    }
  }
  // ── the floor of alabaster, throughout the rooms; the temple's paved terrace round it ─────────────────────────
  bag.add('marble_smooth', box(X(0.2), y0 - 0.3, Z(0.2), X(W - 0.2), y0 + 0.1, Z(D - 0.2)));
  col.floor([X(0), Z(0), X(W), Z(D)], y0 + 0.1);
  bag.add('tura_limestone', box(X(-3), y0 - 0.4, Z(-3), X(W + 3), y0 + 0.04, Z(0)));
  bag.add('tura_limestone', box(X(-3), y0 - 0.4, Z(D), X(W + 3), y0 + 0.04, Z(D + 3)));
  bag.add('tura_limestone', box(X(-3), y0 - 0.4, Z(0), X(0), y0 + 0.04, Z(D)));
  bag.add('tura_limestone', box(X(W), y0 - 0.4, Z(0), X(W + 3), y0 + 0.04, Z(D)));
  col.floor([X(-3), Z(-3), X(W + 3), Z(D + 3)], y0 + 0.04);
  // the front's plinth course, the cornice's stone lip all round
  bag.add('granite_block', box(X(-0.25), y0, Z(-0.25), X(W + 0.25), y0 + 0.7, Z(0)));
  bag.add('granite_block', box(X(-0.25), y0, Z(D), X(W + 0.25), y0 + 0.7, Z(D + 0.25)));
  bag.add('granite_block', box(X(-0.25), y0, Z(0), X(0), y0 + 0.7, Z(D)));
  bag.add('granite_block', box(X(W), y0, Z(0), X(W + 0.25), y0 + 0.7, Z(D)));
  // the joints of the granite casing: horizontal courses 1.3 m high, the vertical joints staggered (blocks of 3–5 m)
  {
    const J = (u0, v0, u1, v1, y, hh = 0.05) => bag.add('basalt', box(X(u0), y0 + y, Z(v0), X(u1), y0 + y + hh, Z(v1)));
    const doorsE = [[9.3, 11.7], [30.3, 32.7]];
    for (let c = 1; c < 6; c++) {
      const y = 0.7 + c * 1.25;
      J(-0.28, -0.28, W + 0.28, -0.22, y); J(-0.28, D + 0.22, W + 0.28, D + 0.28, y); J(-0.28, -0.28, -0.22, D + 0.28, y);
      for (const [a, b] of [[-0.28, doorsE[0][0]], [doorsE[0][1], doorsE[1][0]], [doorsE[1][1], D + 0.28]]) J(W + 0.22, a, W + 0.28, b, y);
      const off = (c % 2) * 2.1;
      for (let u = 2.5 + off; u < W - 1; u += 3.6 + (c % 3) * 0.7) { J(u, -0.28, u + 0.05, -0.22, y - 1.25, 1.25); J(u, D + 0.22, u + 0.05, D + 0.28, y - 1.25, 1.25); }
      for (let v = 3 + off; v < D - 1; v += 3.8) { J(-0.28, v, -0.22, v + 0.05, y - 1.25, 1.25); if (!doorsE.some(([a, b]) => v > a - 0.3 && v < b + 0.3)) J(W + 0.22, v, W + 0.28, v + 0.05, y - 1.25, 1.25); }
    }
  }
  // ── the roof: slabs from the ceiling to the top, slits left open over the hall for the light ─────────────────
  const slitsU = [[31.4, 31.8], [35.2, 35.6]], slitsV = [[16.4, 16.8], [25.2, 25.6]];
  const roof = (u0, v0, u1, v1) => { bag.add('tura_limestone', box(X(u0), y0 + HR, Z(v0), X(u1), y0 + HT, Z(v1))); };
  // strips: in u, with the crossbar's slits (running north–south) cut out; then the stem's (running east–west)
  const uCuts = [0, ...slitsU.flat(), W], vCuts = [0, ...slitsV.flat(), D];
  const rows = [[0, 4], [4, 38], [38, D]];
  for (const [va, vb] of rows) {
    if (va === 4) for (let i = 0; i < uCuts.length - 1; i += 1) { const a = uCuts[i], b = uCuts[i + 1], slit = slitsU.some(([s0, s1]) => a === s0 && b === s1); if (!slit) roof(a, va, b, vb); }
    else roof(0, va, W, vb);
  }
  void vCuts; void slitsV;
  bag.add('tura_limestone', box(X(-0.3), y0 + HT, Z(-0.3), X(W + 0.3), y0 + HT + 0.3, Z(D + 0.3)));   // (a lip over the whole roof, a little proud)
  // ── the pillars: sixteen monoliths of red granite, square, with architraves along their rows ─────────────────
  const P = [];
  for (const u of [32.2, 35.0]) for (const v of [10, 15.5, 21, 26.5, 32]) P.push([u, v]);        // the crossbar: two rows of five
  for (const v of [17.9, 24.1]) for (const u of [13, 18.5, 24]) P.push([u, v]);                   // the stem: two rows of three
  for (const [u, v] of P) {
    bag.add('granite_red', box(X(u) - 0.7, y0 + 0.1, Z(v) - 0.7, X(u) + 0.7, y0 + HR - 1.2, Z(v) + 0.7));
    col.rect([X(u) - 0.7, Z(v) - 0.7, X(u) + 0.7, Z(v) + 0.7], y0, y0 + HR);
  }
  for (const u of [32.2, 35.0]) bag.add('granite_red', box(X(u) - 0.75, y0 + HR - 1.2, Z(8.6), X(u) + 0.75, y0 + HR, Z(33.4)));
  for (const v of [17.9, 24.1]) bag.add('granite_red', box(X(11.6), y0 + HR - 1.2, Z(v) - 0.75, X(25.4), y0 + HR, Z(v) + 0.75));
  // ── the twenty-three statues of the king, seated against the statue rooms' walls and the hall's ends ──────────
  let n = 0;
  const put = (u, v, face) => { statue(bag, X(u), y0 + 0.1, Z(v), face); n++; };
  for (let k = 0; k < 6; k++) { put(10.5 + k * 2.8, 7.1, 's'); put(10.5 + k * 2.8, 34.9, 'n'); }          // along the rooms' outer walls (12)
  for (let k = 0; k < 3; k++) { put(10.5 + k * 5.4, 12.0, 'n'); put(10.5 + k * 5.4, 30.0, 's'); }          // and their inner walls (6)
  for (const v of [6, 14.7, 27.3, 36]) put(30.0, v, 'e');                                                   // the crossbar's west wall's ends (4)
  put(9.3, 16.4, 'e');                                                                                       // and one at the stem's west end
  void n;
}
