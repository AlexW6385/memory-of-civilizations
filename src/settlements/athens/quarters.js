// The quarters of the fourth wave (docs/settlements/athens.md §11), as data the town, the life, the smoke and the
// ground all read: the potters' workshops of the Kerameikos in two rows on either side of a lane, the gymnasium and
// the grove of the Academy, the South-East Fountain House, the shops under the Agora's south stoa.
// +x east, +z south. A workshop's local frame: u along its front, v from the front back (as the stoas').

import { KERAMEIKOS, ACADEMY, FOUNTAIN, SHOPROW } from './layout.js';

export const WS = { L: 17, D: 15, front: 5.4 };       // a workshop 17 × 15 m: the workroom range 5.4 m deep on the lane, the yard behind
const TRADES_A = ['potter', 'painter', 'potter', 'tile'], TRADES_B = ['potter', 'coroplast', 'painter', 'potter'];

/** The local frame of a rectangle whose front faces 's' or 'n'. */
export const localFrame = (rect, front) => {
  const [x0, z0, x1, z1] = rect;
  return { P: (u, v) => (front === 's' ? [x0 + u, z1 - v] : [x0 + u, z0 + v]), sg: front === 's' ? -1 : 1 };
};

/** The workshops: { rect, front, trade, seed, kiln: [x, z, rot], shed: 'l' | 'r', yard: [u, v] (the middle of the yard's open part) }. */
export const WORKSHOPS = (() => {
  const out = [], [kx0, kz0] = KERAMEIKOS;
  for (const [row, trades] of [[0, TRADES_A], [1, TRADES_B]]) {
    const z0 = row === 0 ? kz0 + 7 : kz0 + 30, front = row === 0 ? 's' : 'n';
    trades.forEach((trade, k) => {
      const x0 = kx0 + 1 + k * 18.5, rect = [x0, z0, x0 + WS.L, z0 + WS.D], seed = 430 + row * 7 + k, kilnRight = (seed % 2) === 0;
      const { P } = localFrame(rect, front);
      const [kx, kz] = P(kilnRight ? WS.L - 3.1 : 3.1, 9.6);
      out.push({ rect, front, trade, seed, kiln: [kx, kz, kilnRight ? Math.PI : 0], shed: kilnRight ? 'l' : 'r', yardMid: P(WS.L / 2, 8.5) });
    });
  }
  return out;
})();

/** The gymnasium (palaestra) inside the Academy's precinct: its rectangle, entrance facing south. */
export const PALAESTRA = [ACADEMY[0] + 26, ACADEMY[1] + 4, ACADEMY[0] + 60, ACADEMY[1] + 35];      // 34 × 31 m
export const XYSTOS = [ACADEMY[0] + 6, ACADEMY[3] - 13, ACADEMY[0] + 60, ACADEMY[3] - 5.5];         // the covered track, front north
export const PARADROMIS = [XYSTOS[0], XYSTOS[1] - 7, XYSTOS[2], XYSTOS[1] - 1.5];                  // the open track before it
export const GATE = [ACADEMY[2], (ACADEMY[1] + ACADEMY[3]) / 2];                                     // the gate in the east wall
export const ALTAR_PROMETHEUS = [ACADEMY[0] + 10, ACADEMY[1] + 24];
export const HEROON = [ACADEMY[0] + 8, ACADEMY[1] + 9];
export const EXEDRA = [ACADEMY[0] + 40, ACADEMY[1] + 46];                                           // the philosophers' seat, its back to the south
export const ACADEMY_PATHS = [[GATE[0], GATE[1], PALAESTRA[0] + 17, GATE[1]], [PALAESTRA[0] + 17, PALAESTRA[3], PALAESTRA[0] + 17, GATE[1]]];
export { KERAMEIKOS, ACADEMY, FOUNTAIN, SHOPROW };
