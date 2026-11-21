// The visitor's walk in Hanyang, c. 1888 (docs/settlements/joseon-seoul.md §19.1): from the arrival in the throne court south through
// Heungnyemun, over Yeongjegyo, through Geunjeongmun and Gwanghwamun, down the avenue of the ministries to Jongno, the bell street, and
// along it east and west to the lanes of the hanok quarters. What is opened along it: the shops of Jongno that are two bays wide (a way
// in of 1.7 m beside the maru, the keeper on his floor, the goods on the shelves), the bell pavilion, the yangban house and the hanok
// houses at the lanes' ends (gate open, the way across the yard to the main range, the hall open to the veranda).
// Pure data and functions of layout.js and the houses' own layout (no three.js): the shop blocks and their two-bay shops, the houses that
// can be entered, the routes the walk check follows.

import { SHOPS, lots, YANGBAN, BELL, JONGNO } from './layout.js';
import { ground } from './ground.js';
import { homeLayout, classOf } from '../../styles/joseon/home.js';
import { rangeFrame } from '../../styles/joseon/house.js';

/** The walk: polylines along the middle of the ways, from the arrival (0, 83.5) in the throne court. */
export const WALK = [
  [[0, 83.5], [0, 92], [0, 132], [0, 160], [0, 236], [0, 300], [0, 357]],   // the court, Heungnyemun, Yeongjegyo, Geunjeongmun, Gwanghwamun, the avenue to Jongno
  [[-148, 357], [148, 357]],                                              // Jongno, east and west
];

/** Jongno's shop rows cut into blocks by the lanes running south (blocks of eight bays of 2.6 m): { rect, k, nb, bw, wide }. */
export function blocksOf() {
  const out = [];
  for (const [x0, z0, x1, z1] of SHOPS) {
    let x = x0, k = 0;
    while (x < x1 - 8) {
      const xe = Math.min(x1, x + 20.8), nb = Math.max(1, Math.round((xe - x) / 2.6));
      // two shops of two bays in each block, the rest of one bay (shops of one and two kan, as Jongno had): which bays by the block's own number
      const wide = nb >= 7 ? [k % 3, 4 + (k % 2)] : [];
      out.push({ rect: [x, z0, xe, z1], k: k++, nb, bw: (xe - x) / nb, wide });
      x = xe + 3.2;
    }
  }
  return out;
}

/**
 * The shops of a block as the sijeon builds them: [{ x (the maru's middle), xin (the way in's middle), x0 (the shop's left edge), x1 (its right),
 * z (the front line), open (a shop of two bays: its way in is 1.7 m and can be walked), n (bays) }].
 */
export function shopsOf(b) {
  const out = [], [bx0, z0] = b.rect, w = new Set(b.wide);
  for (let k = 0; k < b.nb; k++) {
    if (w.has(k - 1)) continue;
    const kk = w.has(k) ? k + 1 : k, xa = bx0 + k * b.bw + 0.12, xb = bx0 + (kk + 1) * b.bw - 0.12, ww = kk > k ? 1.7 : 0.95, xm = xb - ww;
    out.push({ x: (xa + xm) / 2, xin: xb - ww / 2, x0: xa, x1: xb, z: z0, open: kk > k, n: kk - k + 1 });
  }
  return out;
}

/** The hanok houses that can be entered: every gentry house and the others by their seed (half of them), where the ground is level. */
export const enterable = (l) => { const [a, b, c, d] = l.rect; return [[a, b], [c, b], [a, d], [c, d]].every(([x, z]) => ground.height(x, z) < 0.05) && (classOf(l) === 'gentry' || l.seed % 2 === 0); };

/** A route into a hanok house: from the lane at its gate, along the flagstones, across the yard to the main range's step, onto the veranda and into the hall. */
export function homeRoute(l) {
  const L = homeLayout({ ...l, cls: classOf(l) }), m = L.ranges[0], f = rangeFrame(m), hall = f.spans.find((s) => s.kind === 'daecheong'), a = (hall.a0 + hall.a1) / 2;
  const gz = l.rect[3], P = f.P, gx = L.gate.x, step = P(a, f.C + f.V + 1.7), onto = P(a, f.C + f.V + 0.55), inside = P(a, 1.7);
  return [[gx, gz + 2.0], [gx, gz - 1.0], [gx, step[1]], [step[0], step[1]], [onto[0], onto[1]], [inside[0], inside[1]]];
}

/** The houses the walk enters, nearest the ends of Jongno first: the lanes' ends east and west of the ministries. */
export function walkHomes(n = 7) {
  const c = [JONGNO[0], 330], e = [JONGNO[2], 330];
  return lots().filter(enterable).map((l) => ({ l, d: Math.min(Math.hypot((l.rect[0] + l.rect[2]) / 2 - c[0], (l.rect[1] + l.rect[3]) / 2 - c[1]), Math.hypot((l.rect[0] + l.rect[2]) / 2 - e[0], (l.rect[1] + l.rect[3]) / 2 - e[1])) }))
    .sort((p, q) => p.d - q.d).slice(0, n).map((p) => p.l);
}

/** The routes walk-check follows (the palace plan's `walks`): in at the way of each two-bay shop of the blocks nearest the avenue, along the aisle to the shelves; the bell pavilion's street side; the yangban house; the hanok houses. */
export function seoulWalks() {
  const out = [];
  const blocks = blocksOf().sort((p, q) => Math.abs((p.rect[0] + p.rect[2]) / 2) - Math.abs((q.rect[0] + q.rect[2]) / 2));
  for (const b of blocks.slice(0, 6)) for (const s of shopsOf(b).filter((q) => q.open).slice(0, 2)) { const z = s.z; out.push(Object.assign([[s.xin, z - 4], [s.xin, z - 1.2], [s.xin, z + 0.6], [s.xin, z + 2.6], [s.xin, z + 4.4]], { y0: 0 })); }
  // the bell pavilion: from Jongno in at its middle bays (the rail is low and open there) — the floor is 0.9 m up on its base
  const [bx0, bz0, bx1, bz1] = BELL;
  void bx0; void bx1; void bz1; void bz0;
  out.push(Object.assign([[(bx0 + bx1) / 2, bz0 - 5], [(bx0 + bx1) / 2, bz0 - 1.5], [(bx0 + bx1) / 2, bz0 + 1.2], [(bx0 + bx1) / 2, bz0 + 1.3]], { y0: 0 }));
  // the yangban house: in at its gate on the south, across the yard to the anchae's hall
  const [yx0, yz0, yx1, yz1] = YANGBAN, W = yx1 - yx0, xc = yx0 + W * 0.62;
  out.push(Object.assign([[xc, yz1 + 2], [xc, yz1 - 1], [xc, yz0 + 1.6 + 2.9 + 1.0 + 1.7], [xc, yz0 + 1.6 + 2.9 + 1.0 + 0.55], [xc, yz0 + 1.6 + 1.7]], { y0: 0 }));
  for (const l of walkHomes()) out.push(Object.assign(homeRoute(l), { y0: 0 }));
  return out;
}
