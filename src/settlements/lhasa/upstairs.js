// Lhasa's houses whose upper floors are walked (docs/settlements/lhasa.md §18): which of the lots near the arrival (the lane crossing at
// (0, 134)) and along the way in from the south gate are opened, and the routes that prove a visitor can go up in each. Pure data from
// layout.js and the house's own keys (styles/tibetan houseKeys): the way up is the house's, not drawn here.
import { lots } from './layout.js';
import { houseKeys } from '../../styles/tibetan/index.js';

/** The lots opened, as [x of the lot's west edge, z of its north edge]: the row north of the wide lane (its gates face the lane), the row behind it and the row south of the lane, nearest the arrival first; then two farmsteads by the road. */
const SHOL_OPEN = [[10.0, 123.7], [25.8, 123.7], [-39.4, 123.7], [-55.4, 123.7], [41.5, 123.7], [-70.4, 123.7], [-26.6, 108.9], [10.0, 108.9], [25.1, 145.5], [-39.7, 145.5]];
const FARM_OPEN = [[-14.7, 234.4], [-19.0, 266.0]];
const near = (l, [x, z]) => Math.abs(l.rect[0] - x) < 0.6 && Math.abs(l.rect[1] - z) < 0.6;
let LIST = null;
/** [{ lot, work, keys }]: the opened lots (`work`: the side range with the weaving room, the one toward the street). */
export function openHouses() {
  if (LIST) return LIST;
  LIST = [];
  for (const l of lots()) {
    if (!(l.farm ? FARM_OPEN : SHOL_OPEN).some((p) => near(l, p))) continue;
    const work = !l.farm && (l.rect[0] + l.rect[2]) / 2 < 0 ? 'e' : 'w';
    LIST.push({ lot: l, work, keys: houseKeys({ t: 'tibetan_house', ...l, y: 0, open: true, work }) });
  }
  return LIST;
}
/** The flags a lot's house takes: { open, work } or nothing. */
export function openFlags(l) { const o = openHouses().find((q) => q.lot === l); return o ? { open: true, work: o.work } : {}; }

/**
 * The routes a visitor walks to prove the upper floors (plan.walks): from the lane (or, for a farmstead, the road) through the gate and
 * the court, up the ladder to the gallery and into the main room; into the weaving room at the gallery's end; and up the stair on the
 * court's west wall to the roof and, where the house has a third storey, into the roof room.
 */
export function openWalks(ground) {
  const all = lots().filter((l) => !l.farm).sort((a, b) => a.rect[0] - b.rect[0]), out = [];
  const gapsOf = (row) => { const r = all.filter((l) => Math.abs(l.rect[1] - row) < 0.6); return r.slice(1).map((l, i) => [(r[i].rect[2] + l.rect[0]) / 2, l.rect[0] - r[i].rect[2]]); };
  for (const { lot, work, keys: K } of openHouses()) {
    const [x0, z0, x1, z1] = lot.rect, C = K.C, gy = lot.farm ? ground((x0 + x1) / 2, (z0 + z1) / 2) : 0, gs = lot.farm ? ground(-1, 228) : 0, up = K.rooms.find((r) => r.y > 1 && r.kind === 'living') || K.rooms.find((r) => r.y > 1);
    const xl = K.xb - 0.65;
    // the way from the street to the gate
    let start;
    const front = lot.farm ? z1 + 0.8 : z1 + 1.6;
    if (lot.farm) { const sx = K.hayE ? x0 - 4.8 : x1 + 4.8; start = [[-1, 228], [sx, 228], [sx, front]]; }          // round the side the haystack is not on
    else if (z0 > 122 && z1 < 137) start = [[0, 141], [K.gx, 141]];                                        // north of the wide lane: the gate faces it
    else if (z0 > 140) {                                                                           // south of the lane: down a gap between the houses of the row, along the lane behind
      const g = gapsOf(z0).filter(([x, w]) => w > 2.4 && Math.abs(x) > 11).sort((a, b) => Math.abs(a[0] - K.gx) - Math.abs(b[0] - K.gx))[0];
      start = [[0, 141], [g[0], 141], [g[0], z1 + 1.6]];
    } else {                                                                                       // the row behind the first: through a gap in the first row, along the lane between
      const g = gapsOf(123.7).filter(([x, w]) => w > 2.4 && Math.abs(x) > 11).sort((a, b) => Math.abs(a[0] - K.gx) - Math.abs(b[0] - K.gx))[0];
      start = [[0, 141], [g[0], 141], [g[0], z1 + 1.6]];
    }
    const toGate = [...start, [K.gx, front]];
    const court = [[K.gx, z1 - 0.5], [K.gx, C[3] - 1.2]];
    // 1. up the ladder, along the gallery, into the main room
    const r1 = [...toGate, ...court, [xl, K.zb + 1.95], [xl, K.zb + 0.5], [xl, C[1] + 0.6], [up.door, C[1] + 0.6], [up.door, C[1] - 0.8], [up.door, C[1] - 1.5]];
    r1.y0 = gs; out.push(r1);
    // 2. the weaving room: the gallery's end, through the door into the room
    if (K.wr) {
      const W = K.wr, xe = W.side === 'w' ? C[0] + 0.5 : C[2] - 0.5, xi = W.side === 'w' ? C[0] - 0.9 : C[2] + 0.9;
      const r2 = [[K.gx, C[3] - 1.2], [xl, K.zb + 1.95], [xl, K.zb + 0.5], [xl, C[1] + 0.6], [xe, C[1] + 0.6], [xe, W.doorZ], [xi, W.doorZ], [xi, W.doorZ + 1.8]];
      r2.y0 = gy; out.push(r2);
    }
    // 3. the roof stair on the court's west wall, up onto the gallery's roof, along it and into the roof room
    if (K.rs) {
      const R = K.rs.rect, xs = C[0] + 0.5, xo = Math.max(C[0] + 1.7, Math.min(xs + 1.8, K.gx - K.gw / 2 - 0.9)), r3 = [[K.gx, C[3] - 1.2], [xo, R[3]], [xs, R[3]], [xs, R[1] + 0.2], [xs, K.zb - 0.2], [C[0] + 1.6, C[1] + 0.7]];
      if (K.loft) { const d = K.loft.room.door; r3.push([d, C[1] + 0.7], [d, C[1] - 0.8], [d, C[1] - 1.8]); }
      r3.y0 = gy; out.push(r3);
    }
  }
  return out;
}
