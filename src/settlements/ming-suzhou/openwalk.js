// The streets a visitor walks in Ming Suzhou, and which lots on them are opened (docs/settlements/ming-suzhou.md §26): the route from the
// residence gate along the south street, up the two canal streets and along the north lane to the temple, and the lots that front it.
// Every shop on it is open-fronted (the shutters down and stacked, a counter at the street, the doorway beside it) and can be entered to the
// depth of its front room; every house has its door ajar on a screen wall and a court, and some can be walked through (hall, kitchen, back door).
// Pure data and functions (the plans are built in walkfront.js): the lots' own fields, the base house's pieces read once through a spy
// (analyse), the routes for walk-check.

import { STYLES } from '../../core/build.js';
import { lots, LEVEL } from './layout.js';
import { upOf, frameOf, layoutOf } from './uphouses.js';
import { prepareTown, HOUSE_TRADE } from './shopprep.js';
import './townwork.js';

/** The walk: polylines along the middle of the streets, from the way in (the residence's street gate at 0, 62). */
export const WALK = [
  [[-94, 65], [93, 65]],                       // the south street
  [[-94, 65], [-94, -92.7]],                   // the west canal street, to the north lane
  [[93, 65], [93, -92.7]],                     // the east canal street
  [[-94, -92.7], [93, -92.7]],                 // the north lane, with the temple's gate at x −40 and the north road at 17
];
const REACH = 8.5;                             // m: a lot whose front lies within this of the walk is on it
export const MIN_SHOP = 3.3;                   // narrower shops keep their shutters (the doorway, the counter and the aisle need 3.3 m)

// the kit (rooms*.js) each trade's room is furnished from
const SHOP_USE = { cloth: 'cloth', medicine: 'medicine', books: 'books', rice: 'rice', lacquer: 'lacquer', wine: 'wine', pawn: 'pawn', food: 'food', pottery: 'pottery', iron: 'iron', fans: 'fans', tea: 'grocer' };

function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
const frontPoint = (l) => { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : l.front === 's' ? [(x0 + x1) / 2, z1] : l.front === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; };
/** The distance of a lot's front from the walk. */
export function walkDistance(l) { const p = frontPoint(l); let best = 1e9; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
const lotL = (l) => (l.front === 'n' || l.front === 's' ? l.rect[2] - l.rect[0] : l.rect[3] - l.rect[1]);
const lotD = (l) => (l.front === 'n' || l.front === 's' ? l.rect[3] - l.rect[1] : l.rect[2] - l.rect[0]);

/**
 * The element the shared house builder is given for a lot (the town's own mapping; a walk lot's upper floor never juts over the street);
 * the walk's elements (walkfront.js) carry the same fields, so that each can read what the builder made of the lot (analyse).
 */
export function baseEl(l) {
  return { t: 'house_jiangnan', rect: l.rect, y: LEVEL.street, front: l.front, storeys: l.storeys, shop: l.shop, trade: HOUSE_TRADE[l.trade] || l.trade, water: l.water, seed: l.seed, open: false, kind: l.kind, roof: l.roof, detail: l.detail, overhang: false, balcony: l.balcony, tone: l.tone };
}

let SET = null;
/**
 * The opened lots: Map lot → { type ('shop' | 'ajar' | 'house'), L, D, use (the kit of a shop), n (its distance along the way in) }.
 * Sets `overhang` false on them (the shop front stands at the shutter line). Skipped: yards, grand houses, waterside lots, the climbable
 * houses (already open), and the shops under 3.3 m.
 */
export function walkSet() {
  if (SET) return SET;
  const open = prepareTown();
  SET = new Map();
  const cand = [];
  for (const l of lots()) {
    if (l.kind === 'yard' || l.kind === 'grand' || l.water || upOf(l) || open.has(l)) continue;
    if (walkDistance(l) > REACH) continue;
    cand.push({ l, n: Math.hypot((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2 - 65) });
  }
  cand.sort((a, b) => a.n - b.n);
  let k = 0;
  for (const { l, n } of cand) {
    const L = lotL(l), D = lotD(l);
    if (l.shop) {
      if (L < MIN_SHOP) continue;
      SET.set(l, { type: 'shop', L, D, use: SHOP_USE[l.trade] || 'cloth', n });
    } else {
      // a house is walked through where it is wide and deep enough for a hall, a kitchen and a back door (three in four of such houses)
      const enter = (l.kind === 'row' || l.kind === 'simple') && D >= 9.4 && L >= 3.0 && k++ % 4 !== 1;
      SET.set(l, { type: enter ? 'house' : 'ajar', L, D, n });
    }
    l.overhang = false;
  }
  return SET;
}

// ── reading the shared house's pieces ────────────────────────────────────────────────────────────────────────
const ANA = new Map();
/**
 * What the shared builder made of an element, in the house's own frame (a along the front, b from the front line back, y): the ground floor's
 * eave height (yf), the back wall of the front hall (vb0: its front face at vb0 − 0.25), the door of a lane house (dc, along the front). The
 * builder is a pure function of the element, so the walk's three elements (shell, far, near) each read the same.
 */
export function analyse(el) {
  const key = `${el.rect.join(',')}|${el.front}|${el.seed}`;
  let A = ANA.get(key);
  if (A) return A;
  const F = frameOf(el.rect, false, el.front), o = F.at(0, 0), L = F.L, y0 = (el.y ?? 0) + 0.45;
  const rec = [];
  const bag = {
    add(mat, g) {
      const p = (g.index ? g.toNonIndexed() : g).attributes.position.array;
      let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9, h0 = 1e9, h1 = -1e9;
      for (let i = 0; i < p.length; i += 3) {
        const a = (p[i] - o[0]) * F.u[0] + (p[i + 2] - o[1]) * F.u[1], b = (p[i] - o[0]) * F.v[0] + (p[i + 2] - o[1]) * F.v[1];
        if (a < a0) a0 = a; if (a > a1) a1 = a; if (b < b0) b0 = b; if (b > b1) b1 = b; if (p[i + 1] < h0) h0 = p[i + 1]; if (p[i + 1] > h1) h1 = p[i + 1];
      }
      rec.push({ mat, n: p.length / 9, a0, a1, b0, b1, h0, h1 });
    },
    addInstance() {},
  };
  const nop = () => {}, col = { rect: nop, floor: nop, ramp: nop, circle: nop, segment: nop };
  STYLES['suzhou-quarter'].elements.house_jiangnan({ ...el, t: 'house_jiangnan' }, { bag, col });
  const near = (x, y) => Math.abs(x - y) < 0.02;
  A = { L, D: F.D, y0, vb0: null, yf: y0 + 3.35, dc: null, dcw: 0.95, kind: el.kind };
  let yfH = null;
  for (const r of rec) {
    // the back wall of the front hall: a box across the house, a quarter metre deep, standing on the floor, past the front's depth
    if (near(r.a0, 0.25) && near(r.a1, L - 0.25) && near(r.b1 - r.b0, 0.25) && near(r.h0, y0) && r.n === 12 && r.b0 > 1.5 && (A.vb0 === null || r.b1 < A.vb0)) A.vb0 = r.b1;
    // the front wall of a lane house: boxes from 0.7 to 0.92 across between the side walls, to the eave
    if (!el.shop && near(r.a0, 0.25) && near(r.a1, L - 0.25) && near(r.b0, 0.7) && near(r.b1, 0.92) && r.n === 12) yfH = Math.max(yfH ?? 0, r.h1);
    if (r.mat === 'lacquer_chestnut' && near(r.a1 - r.a0, 0.95) && near(r.b1 - r.b0, 0.13) && near(r.h1 - r.h0, 2.3)) A.dc = (r.a0 + r.a1) / 2;
  }
  if (yfH !== null) A.yf = yfH;
  ANA.set(key, A);
  return A;
}

/** The walk's element for a lot: the shared builder's fields, and what the lot is opened as. */
export function walkElement(l, s) {
  return { ...baseEl(l), wk: s.type, use: s.use, y: LEVEL.street };
}

// ── the routes walk-check follows ────────────────────────────────────────────────────────────────────────────
/**
 * Routes into the opened lots, for the settlement's walk check: a shop: in at the doorway and along the aisle to the side wall; a house walked
 * through: in at the door, along the hall to the back door and out onto the step. The lanes' doors that are only ajar have no route.
 */
export function walkRoutes() {
  const out = [];
  for (const [l, s] of walkSet()) {
    const F = frameOf(l.rect, false, l.front), p = ([a, b]) => F.at(a, b);
    let r;
    if (s.type === 'shop') { const dc = layoutOf(s.L).dc - 0.2; r = [[dc, -2.2], [dc, 0.2], [dc, 1.9], [1.0, 1.9]]; }   // (off the party wall's cell: the collision raster is half a metre)
    else if (s.type === 'house') {
      const A = analyse(walkElement(l, s)), dc = A.dc ?? s.L / 2;
      r = [[dc, -2.2], [dc, 0.2], [dc, 1.9], [dc, A.vb0 - 1.0], [dc, A.vb0 + 0.2], [dc, A.vb0 + 0.9]];
    } else continue;
    const w = r.map(p);
    w.y0 = LEVEL.street;
    out.push(w);
  }
  return out;
}
