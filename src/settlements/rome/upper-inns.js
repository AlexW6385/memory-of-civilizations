// The inn (caupona) and the fuller's workshop (fullonica) with their upper floors (docs/settlements/rome.md §4.16). The ground floors are the
// shared builders' (src/styles/roman/houses.js), their ceilings and roofs left out and built again here over a walkable floor.
//   caupona_up: the guest rooms over the bar, the passage and the stable gate, a timber loggia over the court, a stair up the court's wall.
//   fullonica_up: the fuller's dwelling over the shop (a stair up the shop's wall), a gallery over the washing court, a ladder to the roof terrace where cloth dries.
import { STYLES } from '../../core/build.js';
import { rod } from '../../core/geom.js';
import '../../styles/roman/houses.js';
import { hip } from '../../styles/roman/street.js';
import { makeT, frameOf, slab, wall, flight, flightRail, fence, windowDress, balcony, backT, dropAbove, hash } from './upper.js';

const win = (uc, yf, hw = 0.55) => ({ a: uc - hw, b: uc + hw, ya: yf + 0.9, yb: yf + 2.1 });
const door = (uc, yf, hw = 0.55) => ({ a: uc - hw, b: uc + hw, ya: yf, yb: yf + 2.15 });

// ── the inn ──────────────────────────────────────────────────────────────────────────────────────────────────
export const CF1 = 4.8, CTOP = 7.8, CFD = 8.5;
export function cauponaRooms(W) {
  const pw = (W - 1) / 4, out = [];
  for (let k = 0; k < 4; k++) out.push([0.5 + k * pw + (k ? 0.15 : 0), 0.5 + (k + 1) * pw - (k < 3 ? 0.15 : 0)]);
  return out;
}
function cauponaUp(el, ctx) {
  const y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, T = makeT(ctx, y, frameOf(el)), R = cauponaRooms(W);
  STYLES.roman.elements.caupona(el, dropAbove(ctx, y, 4.55, T.R(0, W, 0.6, CFD)));
  const t = 0.5, F1 = CF1, top = CTOP;
  const fh = R.map(([a, b], i) => (i === 1 ? door((a + b) / 2, F1, 0.6) : win((a + b) / 2, F1)));
  wall(T, 'stucco_rome', true, 0, t, 0, W, F1, top, fh);
  wall(T, 'stucco_rome', false, 0, t, 0, CFD, F1, top); wall(T, 'stucco_rome', false, W - t, t, 0, CFD, F1, top);
  wall(T, 'stucco_rome', true, 8.0, t, t, W - t, F1, top, R.map(([a, b]) => door((a + b) / 2, F1, 0.5)));
  for (let k = 1; k < 4; k++) wall(T, 'stucco_rome', false, R[k][0] - 0.15, 0.3, t, 8.0, F1, top);
  // the floor over the front block and the loggia over the court, the stair's opening in it
  const sx = 19.3, hole = [sx - 0.1, sx + 1.1, 9.0, 10.0];   // (between the posts of the court's colonnade, which stand at 1.5 + 3.2 k)
  slab(T, [t, W - t, t, 10.0], F1, [hole]);
  for (let u = 1.0; u < W - 2.4; u += 3.9) T.B('timber', u - 0.1, u + 0.1, 9.8, 10.0, 0, F1 - 0.16, true);
  fence(T, t + 0.05, 9.95, sx - 0.1, 9.95, F1); fence(T, sx - 0.1, 9.2, sx - 0.1, 9.95, F1); fence(T, sx + 1.1, 9.2, sx + 1.1, 9.95, F1); fence(T, sx + 1.1, 9.95, W - 0.55, 9.95, F1);
  // the stair up the court's east wall, from the court's floor to the loggia
  const f = { u0: sx, u1: sx + 1.0, d0: 9.0, d1: D - 4.5, up: '-d', yA: 0, yB: F1, n: 22 };
  flight(T, f); flightRail(T, f, sx, -1); flightRail(T, f, sx + 1.0, 1);
  // the balcony of the second room over the street, the windows' dress
  balcony(T, (R[1][0] + R[1][1]) / 2 - 1.1, (R[1][0] + R[1][1]) / 2 + 1.1, F1);
  R.forEach(([a, b], i) => { if (i !== 1) windowDress(T, (a + b) / 2, 0.55, F1 + 0.9, F1 + 2.1, hash((a + b) / 2, F1, el.seed ?? 0)); });
  // the ceiling and the hip over the front block
  T.B('timber', t, W - t, t, CFD - 0.05, top - 0.15, top);
  for (let u = 0.8; u < W - 0.6; u += 0.75) T.B('wood_dark', u - 0.07, u + 0.07, t, CFD - 0.05, top - 0.45, top - 0.15);
  hip(ctx, T.R(0, W, 0, CFD), y + top, 2.0, 0.5);
}
STYLES.roman.elements.caupona_up = cauponaUp;
export function cauponaFurn(el) {
  const W = el.rect[2] - el.rect[0], R = cauponaRooms(W), roles = ['sleep', 'sleep', 'store', 'sleep'];
  return { t: 'up_cells', rect: el.rect, front: el.front, y: 0, rooms: R.map(([a, b], i) => ({ rect: [a, b, 0.5, 8.0], door: 'd1', dc: (b - a) / 2, y: CF1, role: roles[i] })), halls: [{ rect: [0.5, W - 2.2, 8.5, 10.0], y: CF1 }] };
}

// ── the fuller's ─────────────────────────────────────────────────────────────────────────────────────────────
export const FF1 = 4.6, FTOP = 7.6, FSD = 6.0;
export function fulloRooms(W) { return [[0.5, 6.4], [6.7, 12.4], [12.7, W - 0.5]]; }
function fullonicaUp(el, ctx) {
  const y = el.y ?? 0, [x0, z0, x1, z1] = el.rect, W = x1 - x0, T = makeT(ctx, y, frameOf(el)), R = fulloRooms(W), t = 0.5, F1 = FF1, top = FTOP, blk = FSD + 0.4;
  STYLES.roman.elements.fullonica(el, dropAbove(ctx, y, 4.35, T.R(0, W, 0.6, blk)));
  const c2 = (R[2][0] + R[2][1]) / 2 - 1.3, c0 = (R[0][0] + R[0][1]) / 2, c1 = (R[1][0] + R[1][1]) / 2;
  wall(T, 'stucco_rome', true, 0, t, 0, W, F1, top + 1.0, [win(c0, F1), win(c1, F1), win(c2, F1)]);   // (the front wall rises as the parapet of the terrace)
  wall(T, 'stucco_rome', false, 0, t, 0, blk, F1, top + 1.0); wall(T, 'stucco_rome', false, W - t, t, 0, blk, F1, top + 1.0);
  wall(T, 'stucco_rome', true, FSD, 0.4, t, W - t, F1, top + 1.0, [door(c0, F1, 0.5), door(c1, F1, 0.5), door(c2, F1, 0.5)]);
  for (const u of [6.4, 12.4]) wall(T, 'stucco_rome', false, u, 0.3, t, FSD, F1, top);
  // the stair up the east wall of the shop; the opening in the floor over it
  const sx = W - 1.6, hole = [sx - 0.05, sx + 1.05, t, 5.6];
  slab(T, [t, W - t, t, FSD], F1, [hole]);
  const f = { u0: sx, u1: sx + 1.0, d0: 1.0, d1: 5.6, up: '+d', yA: 0, yB: F1, n: 23 };
  flight(T, f); flightRail(T, f, sx, -1); flightRail(T, f, sx + 1.0, 1);
  // the gallery over the washing court, on corbels from the back wall of the block
  balcony(backT(T, blk), 0.9, W - 0.9, F1, 1.1);
  // the terrace on the roof, its floor of tile over joists, a parapet, the ladder from the room A through a hatch
  const lx = 1.3, hatch = [lx, lx + 1.3, 1.4, 2.5];
  slab(T, [t, W - t, t, blk], top, [hatch], { mat: 'cotto_floor' });
  wall(T, 'brick', true, blk - 0.4, 0.4, t, W - t, top, top + 1.0);
  T.B('travertine', -0.1, W + 0.1, -0.1, 0.55, top + 1.0, top + 1.12); T.B('travertine', -0.1, 0.55, -0.1, blk + 0.1, top + 1.0, top + 1.12); T.B('travertine', W - 0.55, W + 0.1, -0.1, blk + 0.1, top + 1.0, top + 1.12);
  T.col.ramp(T.R(lx, lx + 1.3, 1.4, 2.5), T.y + F1 - 0.5, T.y + top, T.dirW('+d'));
  for (const s of [0.06, 1.24]) { const a = T.P(lx + s, 1.3), b = T.P(lx + s, 2.6); T.bag.add('wood_dark', rod([a[0], T.y + F1, a[1]], [b[0], T.y + top + 1.0, b[1]], 0.04, 6)); }
  for (let yy = F1 + 0.3; yy < top + 0.8; yy += 0.3) { const k = (yy - F1) / (top + 1.0 - F1), d = 1.3 + k * 1.3, a = T.P(lx + 0.06, d), b = T.P(lx + 1.24, d); T.bag.add('wood_dark', rod([a[0], T.y + yy, a[1]], [b[0], T.y + yy, b[1]], 0.025, 5)); }
  for (const [c, s] of [[c0, el.seed ?? 0], [c1, 7], [c2, 9]]) windowDress(T, c, 0.55, F1 + 0.9, F1 + 2.1, hash(W, F1, s));
}
STYLES.roman.elements.fullonica_up = fullonicaUp;
export function fullonicaFurn(el) {
  const W = el.rect[2] - el.rect[0], R = fulloRooms(W), roles = ['sleep', 'work', 'store'];
  return { t: 'up_cells', rect: el.rect, front: el.front, y: 0,
    rooms: R.map(([a, b], i) => ({ rect: [a, i === 2 ? W - 2.5 : b, 0.5, 6.0], door: 'd1', dc: i === 2 ? (W - 0.5 - a) / 2 - 1.3 : (b - a) / 2, y: FF1, role: roles[i] })),
    solarium: { y: FTOP, W, blk: FSD + 0.4 } };
}
