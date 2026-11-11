// The houses of the Lower Town (docs/settlements/mohenjo-daro.md §2, §5, §6): a baked-brick shell with a plain street front, one door on the
// lane (a baffle wall behind it), an open court with a well in one house in three, rooms on two or three sides under a flat mud roof with a
// parapet, a brick stair to the roof, a drain mouth through the wall to the lane; the workshops of the beadmakers, seal-cutters, potters,
// coppersmiths and shell-workers. Frame: u along the lane, v from the lane into the lot.
import { lathe } from './kit.js';
import { rng, pick, lotFrame, wellAt } from './kit.js';

const T = 0.7, H = 3.3, PAR = 0.35;

/** A room box: walls t thick round the rect (u0, v0, u1, v1) with a doorway on side `door` ('u0'|'u1'|'v0'|'v1') at `at`, a roof slab with a parapet ring. */
function room(F, r, door, at, o = {}) {
  const [u0, v0, u1, v1] = r, t = o.t ?? 0.45, h = o.h ?? H, dw = 1.0, dh = 2.0, wm = o.mat ?? 'mudbrick';
  const wall = (a0, b0, a1, b1, isDoor, alongU) => {
    if (!isDoor) { F.b(wm, a0, 0, b0, a1, h, b1); return; }
    const c = at, lo = c - dw / 2, hi = c + dw / 2;
    if (alongU) { F.b(wm, a0, 0, b0, lo, h, b1); F.b(wm, hi, 0, b0, a1, h, b1); F.b(wm, lo, dh, b0, hi, h, b1); F.b('timber', lo - 0.05, dh - 0.12, b0 - 0.04, hi + 0.05, dh, b1 + 0.04, false); }
    else { F.b(wm, a0, 0, lo, a1, h, b0 === undefined ? lo : lo); }
  };
  void wall;
  const along = (side, from, to) => {
    // a wall segment along u (sides v0 / v1) or along v (sides u0 / u1), the doorway cut out of the side `door`
    const isDoor = door === side, u = side === 'v0' || side === 'v1';
    const pos0 = side === 'v0' ? v0 : side === 'v1' ? v1 - t : side === 'u0' ? u0 : u1 - t, pos1 = pos0 + t;
    const lo = at - 0.5, hi = at + 0.5;
    const seg = (s0, s1, y0, y1, m = wm) => { if (s1 - s0 < 0.02 || y1 - y0 < 0.02) return; if (u) F.b(m, s0, y0, pos0, s1, y1, pos1); else F.b(m, pos0, y0, s0, pos1, y1, s1); };
    if (!isDoor) seg(from, to, 0, h);
    else { seg(from, lo, 0, h); seg(hi, to, 0, h); seg(lo, hi, 2.05, h); seg(lo - 0.04, hi + 0.04, 1.95, 2.05, 'timber'); }
  };
  along('v0', u0, u1); along('v1', u0, u1); along('u0', v0 + t, v1 - t); along('u1', v0 + t, v1 - t);
  // the flat roof: a slab of mud over beams, its parapet; walkable
  if (!o.noRoof) {
    F.b('mud_plaster', u0 - 0.05, h - 0.32, v0 - 0.05, u1 + 0.05, h, v1 + 0.05, false);
    F.floor(u0, v0, u1, v1, h);
    if (o.parapet !== false) F.b(wm, u0 - 0.05, h, v0 - 0.05, u1 + 0.05, h + PAR, v0 + 0.2) , F.b(wm, u0 - 0.05, h, v1 - 0.2, u1 + 0.05, h + PAR, v1 + 0.05), F.b(wm, u0 - 0.05, h, v0 + 0.2, u0 + 0.2, h + PAR, v1 - 0.2), F.b(wm, u1 - 0.2, h, v0 + 0.2, u1 + 0.05, h + PAR, v1 - 0.2);
  }
}
const jar = (F, mat, u, v, s = 1, y = 0) => F.lathe(mat, [[0.07 * s, 0], [0.2 * s, 0.12 * s], [0.24 * s, 0.3 * s], [0.19 * s, 0.5 * s], [0.1 * s, 0.6 * s], [0.12 * s, 0.66 * s], [0.001, 0.66 * s]], u, y, v, 8);
const kiln = (F, u, v, r = 0.9, h = 1.7) => { F.lathe('terracotta', [[r, 0], [r * 0.92, h * 0.5], [r * 0.6, h * 0.92], [r * 0.5, h], [r * 0.38, h], [r * 0.38, h * 0.7], [0.001, h * 0.7]], u, 0, v, 12); F.circ(u, v, r + 0.05, 0, h); F.b('bitumen', u - 0.25, 0.2, v - r - 0.02, u + 0.25, 0.7, v - r + 0.1, false); };

/** The furnishing of a workshop's court by trade (docs/settlements/mohenjo-daro.md §6). */
function trade(F, kind, u0, v0, u1, v1, rand, lights) {
  const mu = (u0 + u1) / 2;
  const bench = (u, v, w = 2.2) => { F.b('mudbrick', u - w / 2, 0, v - 0.4, u + w / 2, 0.42, v + 0.4); F.b('reed_mat', u - w / 2 + 0.1, 0.42, v - 0.3, u + w / 2 - 0.1, 0.45, v + 0.3, false); };
  if (kind === 'bead') {
    for (const [u, v] of [[u0 + 1.6, v0 + 1.4], [u1 - 1.8, v0 + 1.4]]) {
      bench(u, v);
      F.b('timber', u - 0.8, 0.45, v - 0.2, u - 0.7, 1.35, v - 0.1, false); F.b('timber', u + 0.7, 0.45, v - 0.2, u + 0.8, 1.35, v - 0.1, false); F.b('timber', u - 0.8, 1.3, v - 0.2, u + 0.8, 1.38, v - 0.1, false);   // the bow-drill frame
      for (let k = 0; k < 5; k++) F.b('inlay_carnelian', u - 0.7 + k * 0.3, 0.45, v + 0.05, u - 0.62 + k * 0.3, 0.5, v + 0.12, false);
      F.b('granite_grey', u + 0.1, 0.45, v + 0.1, u + 0.5, 0.55, v + 0.3, false);
    }
    for (let k = 0; k < 6; k++) F.b(k % 2 ? 'inlay_carnelian' : 'cloth_ochre', mu - 1.4 + k * 0.5, 1.5, v0 + 0.5, mu - 1.34 + k * 0.5, 2.2, v0 + 0.54, false);   // strings of beads hung to cure
    kiln(F, mu, v1 - 1.6, 0.7, 1.3); jar(F, 'terracotta', u0 + 1.2, v1 - 1.2, 1.2); jar(F, 'pottery_dark', u0 + 2.0, v1 - 1.0, 1);
  } else if (kind === 'seal') {
    for (const [u, v] of [[u0 + 1.8, v0 + 1.4], [u1 - 1.8, v0 + 1.4], [mu, v1 - 1.5]]) {
      bench(u, v, 2.4);
      for (let k = 0; k < 4; k++) F.b('soapstone', u - 0.8 + k * 0.45, 0.45, v - 0.15, u - 0.6 + k * 0.45, 0.6, v + 0.05, false);
      F.b('bronze', u + 0.9, 0.45, v + 0.1, u + 1.0, 0.5, v + 0.45, false);
    }
    kiln(F, u1 - 1.2, v1 - 1.3, 0.6, 1.1); F.b('soapstone', u0 + 0.5, 0, v1 - 1.8, u0 + 1.4, 0.7, v1 - 0.5); for (let k = 0; k < 6; k++) F.b('soapstone', u0 + 0.55 + (k % 3) * 0.28, 0.7, v1 - 1.7 + (k % 2) * 0.5, u0 + 0.75 + (k % 3) * 0.28, 0.8, v1 - 1.5 + (k % 2) * 0.5, false);
  } else if (kind === 'potter') {
    F.lathe('terracotta', [[0.5, 0], [0.5, 0.3], [0.001, 0.3]], u0 + 2, 0.4, v0 + 2, 14); F.b('mudbrick', u0 + 1.4, 0, v0 + 1.4, u0 + 2.6, 0.4, v0 + 2.6);
    kiln(F, u1 - 1.8, v1 - 1.8, 1.1, 2.0); kiln(F, u1 - 1.4, v0 + 1.8, 0.9, 1.6);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) jar(F, (i + j) % 2 ? 'terracotta' : 'pottery_dark', u0 + 1.2 + i * 0.8, v1 - 1.0 - j * 0.8, 1.1 + (j % 2) * 0.3);
  } else if (kind === 'bronze') {
    F.b('brick_baked', mu - 0.9, 0, v0 + 1.2, mu + 0.9, 0.7, v0 + 2.4); F.b('bitumen', mu - 0.5, 0.7, v0 + 1.5, mu + 0.5, 0.74, v0 + 2.1, false); F.lathe('bronze', [[0.12, 0], [0.18, 0.1], [0.2, 0.22], [0.001, 0.22]], mu, 0.74, v0 + 1.8, 8);
    F.b('granite_grey', u0 + 1.0, 0, v0 + 1.3, u0 + 1.6, 0.5, v0 + 1.9); F.b('hide_brown', mu + 1.1, 0.3, v0 + 1.6, mu + 1.9, 0.7, v0 + 2.0, false);
    for (let k = 0; k < 6; k++) F.b('bronze', u1 - 2.4 + (k % 3) * 0.5, 0, v1 - 1.6 + Math.floor(k / 3) * 0.5, u1 - 2.0 + (k % 3) * 0.5, 0.12 + (k % 2) * 0.1, v1 - 1.3 + Math.floor(k / 3) * 0.5, false);
    kiln(F, u0 + 1.4, v1 - 1.5, 0.8, 1.4);
  } else if (kind === 'shell') {
    for (let k = 0; k < 14; k++) { const a = rand() * 6.28, r = rand() * 1.1; F.lathe('chalk', [[0.001, 0], [0.12, 0.04], [0.09, 0.14], [0.001, 0.2]], u0 + 1.8 + Math.cos(a) * r, 0, v1 - 1.6 + Math.sin(a) * r, 6); }
    bench(mu + 0.4, v0 + 1.4, 2.6); for (let k = 0; k < 7; k++) F.lathe('ivory', [[0.14, 0], [0.14, 0.06], [0.1, 0.06], [0.1, 0]], mu - 0.6 + k * 0.32, 0.45, v0 + 1.4, 10);
    F.b('timber', u1 - 4.2, 0.02, v1 - 1.5, u1 - 2.4, 1.2, v1 - 1.4, false); for (let k = 0; k < 6; k++) F.lathe('ivory', [[0.15, 0], [0.15, 0.05], [0.11, 0.05], [0.11, 0]], u1 - 4.0 + k * 0.3, 1.0, v1 - 1.45, 10);
  }
  lights.push({ at: [F.pt(mu, v0 + 3)[0], F.y + 2.0, F.pt(mu, v0 + 3)[1]], color: '#ffd9a0', intensity: 2.5, distance: 9 });
}

/** The room furnished: a sleeping bed (a frame of timber with a rope net), a quern, jars, a lamp, a hearth. */
function furnish(F, r, rand, lights) {
  const [u0, v0, u1, v1] = r, mu = (u0 + u1) / 2, mv = (v0 + v1) / 2;
  F.b('reed_mat', u0 + 0.7, 0, v0 + 0.7, u0 + 2.3, 0.04, v0 + 2.3, false);
  F.b('timber', u1 - 2.0, 0.28, v1 - 1.3, u1 - 0.7, 0.34, v1 - 0.6, false); for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) F.b('timber', u1 - 2.0 + a * 1.25, 0, v1 - 1.3 + b * 0.62, u1 - 1.9 + a * 1.25, 0.28, v1 - 1.2 + b * 0.62, false);
  F.b('rope_fibre', u1 - 1.95, 0.34, v1 - 1.25, u1 - 0.75, 0.37, v1 - 0.65, false);
  F.b('granite_grey', u0 + 0.6, 0, v1 - 1.2, u0 + 1.5, 0.22, v1 - 0.6, false); F.b('granite_grey', u0 + 0.85, 0.22, v1 - 1.05, u0 + 1.25, 0.34, v1 - 0.75, false);   // the saddle quern
  jar(F, 'terracotta', mu, v1 - 0.8, 1.6); jar(F, 'pottery_dark', mu + 0.6, v1 - 0.8, 1.2); jar(F, 'terracotta', u0 + 0.6, mv, 1.3);
  F.b('brick_baked', mu - 0.95, 0.02, mv - 0.2, mu - 0.05, 0.2, mv + 0.4, false); F.b('bitumen', mu - 0.8, 0.2, mv - 0.05, mu - 0.2, 0.24, mv + 0.25, false);
  const p = F.pt(mu - 0.5, mv - 0.5); lights.push({ at: [p[0], F.y + 1.6, p[1]], color: '#ffc98a', intensity: 3, distance: 8 });
  void rand;
}

/** indus_house: { rect, front, kind ('house' | 'small' | trade), seed, open, y } */
export function house(el, ctx) {
  const rand = rng(el.seed), F = lotFrame(ctx, el.rect, el.front, el.y ?? 0), W = F.W, D = F.D, kind = el.kind, small = kind === 'small', isTrade = !['house', 'small'].includes(kind);
  const lowH = 2.2;
  // the shell: lower baked brick, above it mud brick; the door on the lane
  const du = Math.max(1.6, Math.min(W - 1.6, W * (0.25 + 0.5 * rand())));
  const lane = (s0, s1, y0, y1, m) => F.b(m, s0, y0, 0, s1, y1, T);
  lane(0, du - 0.55, 0, lowH, 'brick_baked'); lane(du + 0.55, W, 0, lowH, 'brick_baked');
  lane(0, du - 0.55, lowH, H, 'mudbrick'); lane(du + 0.55, W, lowH, H, 'mudbrick'); lane(du - 0.55, du + 0.55, 2.2, H, 'mudbrick');
  F.b('timber', du - 0.62, 1.95, -0.05, du + 0.62, 2.15, T + 0.05, false);
  F.b('brick_baked', du - 0.6, 0, -0.3, du + 0.6, 0.12, 0, false);                                   // the threshold
  const back = (m, y0, y1) => F.b(m, 0, y0, D - T, W, y1, D);
  back('brick_baked', 0, lowH); back('mudbrick', lowH, H);
  for (const [u0, u1] of [[0, T], [W - T, W]]) { F.b('brick_baked', u0, 0, T, u1, lowH, D - T); F.b('mudbrick', u0, lowH, T, u1, H, D - T); }
  F.b('mudbrick', 0, H, 0, W, H + PAR, 0.25); F.b('mudbrick', 0, H, D - 0.25, W, H + PAR, D); F.b('mudbrick', 0, H, 0.25, 0.25, H + PAR, D - 0.25); F.b('mudbrick', W - 0.25, H, 0.25, W, H + PAR, D - 0.25);
  // waterspouts along the roof edge, the drain mouth through the wall at the foot
  for (const u of [W * 0.3, W * 0.72]) F.b('brick_baked', u - 0.12, H - 0.5, -0.35, u + 0.12, H - 0.38, 0.2, false);
  const dm = (du < W / 2 ? W - 1.4 : 1.4);
  F.b('brick_baked', dm - 0.16, 0.2, -0.45, dm + 0.16, 0.34, 0.1, false); F.b('bitumen', dm - 0.08, 0.2, -0.46, dm + 0.08, 0.3, -0.3, false);
  // a small high window of brick lattice
  if (rand() < 0.6) { const wu = du < W / 2 ? W * 0.72 : W * 0.28; F.b('brick_baked', wu - 0.3, 2.45, -0.05, wu + 0.3, 2.85, T + 0.05, false); F.b('wood_dark', wu - 0.22, 2.5, -0.06, wu + 0.22, 2.8, 0.06, false); }
  // the court floor
  F.b('brick_paving', T, 0.04, T, W - T, 0.08, D - T, false);
  // the baffle behind the door, the court's rooms
  F.b('mudbrick', du + 0.9, 0, T + 1.4, du + 2.9, 2.4, T + 1.85);
  const rb = small ? 3.6 : 4.4, ls = (!small && W > 12 && rand() < 0.7), rs = (!small && W > 15 && rand() < 0.5);
  const lw = 3.4;
  // the back range, in two or three rooms
  const nb = W > 15 ? 3 : 2, bw = (W - 2 * T) / nb;
  const roomsOpen = [];
  for (let i = 0; i < nb; i++) {
    const r = [T + i * bw, D - T - rb, T + (i + 1) * bw, D - T];
    room(F, r, 'v0', (r[0] + r[2]) / 2, { noRoof: false, t: 0.4, parapet: false }); roomsOpen.push(r);
  }
  if (ls) { const r = [T, T + 2.6, T + lw, D - T - rb]; if (r[3] - r[1] > 3) { room(F, r, 'u1', (r[1] + r[3]) / 2, { t: 0.4, parapet: false }); roomsOpen.push(r); } }
  if (rs) { const r = [W - T - lw, T + 2.6, W - T, D - T - rb]; if (r[3] - r[1] > 3) { room(F, r, 'u0', (r[1] + r[3]) / 2, { t: 0.4, parapet: false }); roomsOpen.push(r); } }
  // the stair to the roof, in the court against the back range's front wall
  const sx = W - T - (rs ? lw + 0.1 : 0) - 1.1, sv1 = D - T - rb;
  if (sv1 - (T + 3.2) > 3.6) F.stairs(sx - 0.45, sv1 - 3.8, sx + 0.45, sv1, 0.05, H, 1);
  // a second storey over one of the back rooms in some houses
  if (!small && !isTrade && rand() < 0.2) { const r = roomsOpen[0]; F.b('mudbrick', r[0], H, r[1], r[2], H + 2.7, r[3]); F.b('mudbrick', r[0] - 0.05, H + 2.7, r[1] - 0.05, r[2] + 0.05, H + 3.0, r[3] + 0.05, false); F.b('wood_dark', (r[0] + r[2]) / 2 - 0.3, H + 1.5, r[1] - 0.05, (r[0] + r[2]) / 2 + 0.3, H + 2.2, r[1] + 0.05, false); }
  // the well, in the court's front corner, a quern or jars at the wall
  if (isTrade) { trade(F, kind, T + (ls ? lw : 0) + 0.3, T + 2.2, W - T - (rs ? lw : 0) - 0.3, D - T - rb - 0.2, rand, ctx.lights); }
  else if (rand() < 0.36 || el.open) { const p = F.pt(W - T - 1.6, T + 3.2); wellAt(ctx.bag, ctx.col, p[0], F.y, p[1], 0.55); }
  if (!isTrade && rand() < 0.5) for (let k = 0; k < 2; k++) jar(F, 'terracotta', T + 0.8 + k * 0.5, D - T - rb - 0.5, 1.2);
  if (el.open && roomsOpen[0]) furnish(F, roomsOpen[0], rand, ctx.lights);
  if (el.open && roomsOpen[1]) furnish(F, roomsOpen[1], rand, ctx.lights);
  void pick; void lathe;
}
