// Southern Song Lin'an — the furnished interiors (docs/settlements/song-hangzhou.md §19): a tea house,
// a wine house (restaurant), the shops of the Imperial Way, a townsman's house. Each is an element of
// the street life that furnishes a building the town has raised over `rect` (its floor at `floor`,
// its front open or doored on the side `front`): tables, lantern-back chairs and benches, counters
// with their goods, hangings, lamps; kept clear of the walls' and doors' lines. Built in the
// room's own frame (a across, b from the back wall toward the front, y up) and turned into place.
// The furniture is of the Song: tables with square-sectioned legs and stretchers, the lantern-hanging
// chair (dengguayi) and the long bench (changdeng), the couch (ta) with its screen, the three-fold
// screen, the painted hanging scrolls, the black tea bowl on its lacquer stand.

import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { Parts, ball, limb } from '../../styles/qing/carving.js';
import { rng } from '../../objects/kit.js';

const W = 'lacquer_chestnut';
const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);
const ly = (prof, seg = 10, x = 0, y = 0, z = 0) => lathe(prof, seg, null, x, y, z);

// ── furniture, built facing −z at the origin (the sitter's front) ───────────────────────────────
/** A table w × d, h high: the top, four square legs, a stretcher at the ends and a waist apron (zhuo). */
export function table(P, w, d, h, m = W) {
  P.add(m, box(-w / 2, h - 0.045, -d / 2, w / 2, h, d / 2));
  const lx = w / 2 - 0.05, lz = d / 2 - 0.05;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, box(sx * lx - 0.022, 0, sz * lz - 0.022, sx * lx + 0.022, h - 0.045, sz * lz + 0.022));
  for (const s of [-1, 1]) P.add(m, box(-lx, h - 0.12, s * lz - 0.012, lx, h - 0.045, s * lz + 0.012));
  for (const s of [-1, 1]) P.add(m, box(s * lx - 0.012, 0.18, -lz, s * lx + 0.012, 0.21, lz));
}
/** The lantern-hanging chair (dengguayi): seat, four legs rising into the back posts, a top rail that runs out past them, two rails below, a splat. */
export function chair(P, m = W) {
  const sw = 0.25, sd = 0.22, sh = 0.46;
  P.add(m, box(-sw, sh - 0.035, -sd, sw, sh, sd));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, box(sx * (sw - 0.025) - 0.017, 0, sz * (sd - 0.025) - 0.017, sx * (sw - 0.025) + 0.017, sz > 0 ? 0.98 : sh - 0.035, sz * (sd - 0.025) + 0.017));
  P.add(m, box(-sw - 0.06, 0.96, sd - 0.045, sw + 0.06, 1.0, sd + 0.0));                          // the top rail, ends beyond the posts
  P.add(m, box(-sw + 0.03, 0.62, sd - 0.03, sw - 0.03, 0.65, sd - 0.005)); P.add(m, box(-0.04, 0.65, sd - 0.03, 0.04, 0.96, sd - 0.005));
  for (const s of [-1, 1]) P.add(m, box(s * (sw - 0.025) - 0.01, 0.2, -sd + 0.02, s * (sw - 0.025) + 0.01, 0.23, sd - 0.02));
  P.add('reed_mat', box(-sw + 0.02, sh, -sd + 0.02, sw - 0.02, sh + 0.006, sd - 0.02));
}
/** A long bench (changdeng). */
export function bench(P, len = 1.3, m = W) {
  P.add(m, box(-len / 2, 0.42, -0.13, len / 2, 0.46, 0.13));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, box(sx * (len / 2 - 0.08) - 0.02, 0, sz * 0.09 - 0.02, sx * (len / 2 - 0.08) + 0.02, 0.42, sz * 0.09 + 0.02));
  for (const s of [-1, 1]) P.add(m, box(s * (len / 2 - 0.08) - 0.01, 0.16, -0.09, s * (len / 2 - 0.08) + 0.01, 0.19, 0.09));
}
export function stool(P, m = W) {
  P.add(m, box(-0.17, 0.4, -0.17, 0.17, 0.44, 0.17));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, box(sx * 0.13 - 0.018, 0, sz * 0.13 - 0.018, sx * 0.13 + 0.018, 0.4, sz * 0.13 + 0.018));
}
/** A black tea bowl (zhan) with its lacquer stand (tuo) at (x, y, z). */
export function teabowl(P, x, y, z) {
  P.add('lacquer_red', ly([[0.001, 0], [0.05, 0], [0.065, 0.025], [0.04, 0.05], [0.015, 0.045], [0.001, 0.04]], 8, x, y, z));
  P.add('lacquer_black', ly([[0.001, 0], [0.034, 0], [0.065, 0.025], [0.085, 0.07], [0.078, 0.072], [0.06, 0.034], [0.001, 0.014]], 8, x, y + 0.04, z));
}
/** A brazier with its copper ewer and a lidded jar beside it. */
export function brazier(P, x, y, z) {
  P.add('iron', box(x - 0.17, y, z - 0.17, x + 0.17, y + 0.2, z + 0.17)); P.add('flame', box(x - 0.1, y + 0.2, z - 0.1, x + 0.1, y + 0.215, z + 0.1));
  P.add('bronze', ly([[0.001, 0], [0.08, 0], [0.11, 0.1], [0.075, 0.2], [0.035, 0.23], [0.001, 0.23]], 9, x, y + 0.22, z)); P.add('bronze', limb([x + 0.09, y + 0.34, z], [x + 0.2, y + 0.4, z], 0.012, 0.012, 4));
}
/** A vase with a flowering branch. */
export function vase(P, x, y, z, k = 1, bloom = 'cloth_white') {
  P.add('glaze_white', ly([[0.001, 0], [0.05 * k, 0], [0.085 * k, 0.12 * k], [0.065 * k, 0.24 * k], [0.03 * k, 0.3 * k], [0.04 * k, 0.34 * k], [0.001, 0.34 * k]], 9, x, y, z));
  P.add('bark_dark', limb([x, y + 0.3 * k, z], [x + 0.1, y + 0.75 * k, z + 0.03], 0.012, 0.006, 4)); P.add('bark_dark', limb([x + 0.04, y + 0.5 * k, z + 0.01], [x - 0.12, y + 0.78 * k, z - 0.02], 0.008, 0.004, 4));
  for (const [dx, dy, dz] of [[0.1, 0.75, 0.03], [0.06, 0.62, 0.02], [-0.12, 0.78, -0.02], [-0.06, 0.66, 0], [0.12, 0.84, 0.01]]) P.add(bloom, ball(0.028, 0.028, 0.028, 5, 4).translate(x + dx, y + dy * k, z + dz));
}
/** A hanging scroll (a landscape in ink): the mounting, the paper, the dark ranges, the roller ends. y is the scroll's foot. */
export function scroll(P, x, y, z, w = 0.5, h = 1.3, seed = 1) {
  const r = rng(seed);
  P.add('cloth_ochre', box(x - w / 2 - 0.05, y, z, x + w / 2 + 0.05, y + h + 0.1, z + 0.012));
  P.add('paint_white', box(x - w / 2, y + 0.08, z + 0.012, x + w / 2, y + h - 0.05, z + 0.016));
  for (let k = 0; k < 4; k++) {                                          // far, middle and near ranges, mist between
    const yy = y + 0.2 + k * (h - 0.5) / 3.2, a = 0.12 + r() * 0.1, cx = x + (r() - 0.5) * w * 0.5, hh = 0.12 + r() * 0.12;
    P.add('slate', fromTriangles([cx - a, yy, z + 0.017, cx + a, yy, z + 0.017, cx + (r() - 0.5) * 0.05, yy + hh, z + 0.017]));
  }
  P.add('timber', box(x - w / 2 - 0.06, y + h + 0.1, z - 0.004, x + w / 2 + 0.06, y + h + 0.125, z + 0.016)); P.add('timber', box(x - w / 2 - 0.06, y - 0.025, z - 0.004, x + w / 2 + 0.06, y, z + 0.016));
  for (const s of [-1, 1]) P.add('lacquer_black', box(x + s * (w / 2 + 0.06) - 0.012, y - 0.03, z - 0.008, x + s * (w / 2 + 0.06) + 0.012, y + 0.01, z + 0.02));
}
/** A palace lantern hung on a cord from y (its top). */
export function lantern(P, x, y, z, mat = 'lamp_paper') {
  P.add('lacquer_black', limb([x, y, z], [x, y - 0.25, z], 0.006, 0.006, 4));
  P.add('lacquer_red', ly([[0.001, -0.29], [0.1, -0.29], [0.1, -0.25], [0.001, -0.25]], 8, x, y, z));
  P.add(mat, ly([[0.001, -0.5], [0.11, -0.46], [0.15, -0.38], [0.15, -0.3], [0.001, -0.29]], 8, x, y, z).scale(1, 1, 1));
  P.add('lacquer_red', ly([[0.001, -0.54], [0.09, -0.54], [0.09, -0.5], [0.001, -0.5]], 8, x, y, z)); P.add('cloth_red', limb([x, y - 0.54, z], [x, y - 0.72, z], 0.012, 0.004, 4));
}
/** A three-fold screen (pingfeng) with its painted panels, standing. */
export function screen3(P, w = 1.8, h = 1.5, seed = 2) {
  const r = rng(seed), pw = w / 3;
  for (let k = 0; k < 3; k++) {
    const x = -w / 2 + pw * (k + 0.5), z = (k === 1 ? 0 : 0.14) * (k === 1 ? 1 : 1), ang = 0;
    void ang;
    P.add('lacquer_black', box(x - pw / 2 + 0.01, 0.06, z - 0.015, x + pw / 2 - 0.01, h, z + 0.015));
    P.add('paint_white', box(x - pw / 2 + 0.05, 0.14, z + 0.015, x + pw / 2 - 0.05, h - 0.08, z + 0.02));
    const cx = x + (r() - 0.5) * 0.1, a = 0.1 + r() * 0.08;
    P.add('slate', fromTriangles([cx - a, 0.4 + r() * 0.2, z + 0.021, cx + a, 0.4 + r() * 0.2, z + 0.021, cx, 0.8 + r() * 0.3, z + 0.021]));
    P.add('paint_ochre', box(x - 0.08, 1.1, z + 0.021, x + 0.08, 1.12, z + 0.022));
    P.add('lacquer_black', box(x - pw / 2, 0, z - 0.05, x + pw / 2, 0.06, z + 0.05));
  }
}
/** A couch (ta): a wide low platform with a three-sided screen back, a low table. */
export function couch(P, w = 1.9, d = 0.95) {
  P.add(W, box(-w / 2, 0.38, -d / 2, w / 2, 0.46, d / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(W, box(sx * (w / 2 - 0.06) - 0.03, 0, sz * (d / 2 - 0.06) - 0.03, sx * (w / 2 - 0.06) + 0.03, 0.38, sz * (d / 2 - 0.06) + 0.03));
  P.add('cloth_indigo', box(-w / 2 + 0.05, 0.46, -d / 2 + 0.05, w / 2 - 0.05, 0.5, d / 2 - 0.05));
  P.add(W, box(-w / 2, 0.46, d / 2 - 0.05, w / 2, 0.98, d / 2)); P.add('paint_white', box(-w / 2 + 0.06, 0.55, d / 2 - 0.058, w / 2 - 0.06, 0.9, d / 2 - 0.048));
  for (const s of [-1, 1]) P.add(W, box(s * w / 2 - (s > 0 ? 0.05 : 0), 0.46, -d / 2 + 0.2, s * w / 2 + (s < 0 ? 0.05 : 0), 0.78, d / 2));
}
/** A chest (xiang) with iron fittings. */
export function chest(P, w = 0.8, d = 0.45, h = 0.5) {
  P.add(W, box(-w / 2, 0, -d / 2, w / 2, h, d / 2)); P.add('lacquer_black', box(-w / 2 - 0.01, h, -d / 2 - 0.01, w / 2 + 0.01, h + 0.04, d / 2 + 0.01));
  P.add('iron', box(-0.04, h * 0.5, -d / 2 - 0.012, 0.04, h * 0.75, -d / 2));
  for (const s of [-1, 1]) P.add('iron', box(s * (w / 2 - 0.1) - 0.02, 0, -d / 2 - 0.006, s * (w / 2 - 0.1) + 0.02, h, -d / 2));
}
/** A qin on a low table, a censer by it. */
export function qinTable(P) {
  table(P, 0.8, 0.35, 0.5);
  P.add('lacquer_black', box(-0.6 / 2, 0.5, -0.07, 0.6 / 2, 0.545, 0.07).translate(0, 0, 0)); P.add('lacquer_black', box(-0.5, 0.5, -0.05, -0.3, 0.52, 0.05));
  P.add('bronze', ly([[0.001, 0], [0.04, 0], [0.06, 0.05], [0.055, 0.09], [0.001, 0.08]], 8, 0.32, 0.5, 0.0));
}
/** The altar of the household's ancestors: a high table, tablets in a shrine box, a censer between candlesticks. */
export function altar(P, w = 1.2) {
  table(P, w, 0.4, 0.95);
  P.add(W, box(-0.35, 0.95, 0.1, 0.35, 1.45, 0.18)); P.add('paint_ochre', box(-0.3, 1.0, 0.075, 0.3, 1.4, 0.1)); P.add('lacquer_black', box(-0.14, 1.04, 0.07, -0.06, 1.36, 0.08)); P.add('lacquer_black', box(0.06, 1.04, 0.07, 0.14, 1.36, 0.08));
  P.add('bronze', ly([[0.001, 0], [0.05, 0], [0.09, 0.07], [0.1, 0.11], [0.001, 0.1]], 9, 0, 0.95, -0.05));
  for (const s of [-1, 1]) { P.add('bronze', ly([[0.001, 0], [0.03, 0], [0.012, 0.15], [0.001, 0.16]], 7, s * 0.3, 0.95, -0.02)); P.add('paint_white', limb([s * 0.3, 1.1, -0.02], [s * 0.3, 1.2, -0.02], 0.01, 0.008, 5)); }
}
/** A counter (guitai) with a shelf behind it of bowls or goods; goods: colours of what sits on the shelf. */
export function counter(P, w, goods = 'cloth_white') {
  P.add(W, box(-w / 2, 0.9, -0.3, w / 2, 0.95, 0.3));
  P.add('lacquer_black', box(-w / 2, 0.0, -0.28, w / 2, 0.9, 0.28));
  P.add('timber', box(-w / 2 - 0.02, 0.0, -0.3, -w / 2 + 0.02, 0.95, 0.3)); P.add('timber', box(w / 2 - 0.02, 0.0, -0.3, w / 2 + 0.02, 0.95, 0.3));
  void goods;
}
/** A wall shelf unit of n rows, w wide, with bolts or bowls on it. */
export function shelf(P, w, rows, kind, seed = 3) {
  const r = rng(seed), cols = ['cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_green'];
  P.add(W, box(-w / 2, 0, -0.17, -w / 2 + 0.04, rows * 0.4 + 0.1, 0.0)); P.add(W, box(w / 2 - 0.04, 0, -0.17, w / 2, rows * 0.4 + 0.1, 0.0));
  for (let k = 0; k <= rows; k++) P.add(W, box(-w / 2, 0.1 + k * 0.4 - 0.02, -0.17, w / 2, 0.1 + k * 0.4 + 0.02, 0.0));
  for (let k = 0; k < rows; k++) {
    const y = 0.12 + k * 0.4;
    if (kind === 'bowls') { for (let m = 0; m < Math.floor(w / 0.2); m++) P.add('glaze_white', ly([[0.001, 0], [0.04, 0], [0.08, 0.05], [0.085, 0.09], [0.001, 0.02]], 7, -w / 2 + 0.14 + m * 0.18, y, -0.09)); }
    else if (kind === 'books') { for (let m = 0; m < Math.floor(w / 0.17); m++) P.add(r() < 0.5 ? 'cloth_indigo' : 'cloth_brown', box(-w / 2 + 0.08 + m * 0.16, y, -0.14, -w / 2 + 0.2 + m * 0.16, y + 0.3, -0.04)); }
    else if (kind === 'jars') { for (let m = 0; m < Math.floor(w / 0.26); m++) P.add('pottery_dark', ly([[0.001, 0], [0.07, 0], [0.11, 0.1], [0.1, 0.2], [0.06, 0.28], [0.001, 0.28]], 8, -w / 2 + 0.16 + m * 0.25, y, -0.08)); }
    else for (let m = 0; m < Math.floor(w / 0.3); m++) P.add(cols[Math.floor(r() * cols.length)], box(-w / 2 + 0.08 + m * 0.28, y, -0.15, -w / 2 + 0.34 + m * 0.28, y + 0.12 + (m % 2) * 0.06, -0.02));   // bolts of cloth lying folded
  }
}
/** A stepped rack of potted pines and flowers (Mengliang lu), 1.2 wide. */
export function flowerRack(P) {
  for (let s = 0; s < 3; s++) { P.add('timber', box(-0.6 + s * 0.12, s * 0.38, -0.3 + s * 0.2, 0.6 - s * 0.12, s * 0.38 + 0.04, -0.1 + s * 0.2)); for (const x of [-0.6 + s * 0.12, 0.57 - s * 0.12]) P.add('timber', box(x, 0, -0.3 + s * 0.2, x + 0.03, s * 0.38, -0.1 + s * 0.2)); }
  for (let s = 0; s < 3; s++) for (let k = 0; k < 3 - s + 1; k++) {
    const x = -0.4 + s * 0.14 + k * (0.8 - s * 0.28) / Math.max(1, 3 - s), y = s * 0.38 + 0.04, z = -0.2 + s * 0.2;
    P.add('glaze_green', ly([[0.001, 0], [0.06, 0], [0.08, 0.04], [0.085, 0.13], [0.07, 0.15], [0.001, 0.14]], 8, x, y, z));
    if ((s + k) % 2) { P.add('bark_pine', limb([x, y + 0.13, z], [x + 0.03, y + 0.35, z], 0.014, 0.01, 4)); P.add('glaze_green', ball(0.11, 0.07, 0.11, 6, 4).translate(x + 0.03, y + 0.38, z)); }
    else P.add(['cloth_red', 'cloth_ochre', 'cloth_white'][(s + k) % 3], ball(0.1, 0.09, 0.1, 6, 4).translate(x, y + 0.24, z));
  }
}

// ── the rooms ───────────────────────────────────────────────────────────────────────────────────
/** The room's frame: its width, depth, origin (the back wall's middle) and the yaw to the front; local → world. */
function frame(el) {
  const [x0, z0, x1, z1] = el.rect, front = el.front ?? 's', alongX = front === 'n' || front === 's';
  const Wd = alongX ? x1 - x0 : z1 - z0, Dp = alongX ? z1 - z0 : x1 - x0;
  const origin = { s: [(x0 + x1) / 2, z0], n: [(x0 + x1) / 2, z1], e: [x0, (z0 + z1) / 2], w: [x1, (z0 + z1) / 2] }[front];
  const yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[front], cs = Math.cos(yaw), sn = Math.sin(yaw);
  const WC = (a, b) => [origin[0] + a * cs + b * sn, origin[1] - a * sn + b * cs];
  return { Wd, Dp, yaw, WC, front };
}
/** A tool for one room: put(P, a, b, yaw): a piece at (a, b), turned; rect(a0, b0, a1, b1, h): a collider; fig(a, b, pose, …): a figure element. */
function room(el, ctx) {
  const F = frame(el), floor = el.floor ?? (el.y ?? 0) + 0.45, S = new Parts(), figs = [];
  const put = (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw);
  const rect = (a0, b0, a1, b1, h) => { const p = F.WC(a0, b0), q = F.WC(a1, b1); ctx.col?.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], floor, floor + h); };
  const circ = (a, b, r, h) => { const p = F.WC(a, b); ctx.col?.circle(p[0], p[1], r, floor, floor + h); };
  const flush = () => { S.emit(ctx.bag, F.origin?.[0] ?? 0, 0, 0, 0); };
  void flush;
  // placing in world space: build the parts in the local frame, then turn and move them to the room (all at once)
  const emit = () => S.emit(ctx.bag, F.WC(0, 0)[0], floor, F.WC(0, 0)[1], F.yaw);
  const person = (a, b, towardA, towardB, extra = {}) => { const p = F.WC(a, b), q = F.WC(a + towardA, b + towardB); figs.push({ t: 'figure', at: p, y: floor, rot: Math.atan2(-(q[0] - p[0]), -(q[1] - p[1])), seed: Math.floor(rng((el.seed ?? 1) + figs.length * 7)() * 1e9), skin: 'skin_light', carry: 'none', ...extra }); };
  return { F, floor, S, put, rect, circ, emit, person, figs };
}
const CL = ['cloth_indigo', 'cloth_white', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_black', 'cloth_green'];

/** hz_teahouse: tea tables with benches and lantern-back chairs, the host's counter with its brazier and bowl shelves, a long storyteller's table, scrolls on the back wall, plum in vases, a flower rack by the door, lanterns. */
function teaHouse(el, ctx) {
  const R = room(el, ctx), { F, put } = R, rand = rng(el.seed || 1), pick = (a) => a[Math.floor(rand() * a.length)];
  const { Wd, Dp } = F, a0 = -Wd / 2 + 0.55, a1 = Wd / 2 - 0.55;
  // the back wall: three hanging scrolls over a long table with two vases of plum, the counter on the east wall
  const n = Wd > 9 ? 4 : 3;
  for (let k = 0; k < n; k++) { const P = new Parts(); scroll(P, 0, 0, 0, 0.5, 1.3, (el.seed || 1) + k); put(P, -Wd / 2 + (k + 0.5) * Wd * 0.7 / n - Wd * 0.1, 0.06, 0, 1.15); }
  { const P = new Parts(); table(P, 1.8, 0.4, 0.8); put(P, -Wd * 0.2, 0.4, Math.PI); R.rect(-Wd * 0.2 - 0.9, 0.2, -Wd * 0.2 + 0.9, 0.6, 0.8); const V = new Parts(); vase(V, 0, 0.8, 0, 1.2); vase(V, 0.5, 0.8, 0, 1, 'cloth_red'); put(V, -Wd * 0.2 - 0.3, 0.4, 0); }
  { const w = Math.min(3.4, Wd * 0.38), P = new Parts(); counter(P, w); put(P, a1 - w / 2, 1.3, 0, 0); R.rect(a1 - w, 1.0, a1, 1.6, 0.95);
    const B = new Parts(); brazier(B, 0, 0.95, 0); put(B, a1 - w * 0.8, 1.3, 0); for (let k = 0; k < 5; k++) { const T = new Parts(); teabowl(T, 0, 0.95, 0); put(T, a1 - w * 0.55 + k * 0.17, 1.3, 0); }
    const S = new Parts(); shelf(S, w - 0.3, 2, 'bowls', (el.seed || 1) + 9); put(S, a1 - w / 2, 0.3, Math.PI); R.person(a1 - w / 2, 0.85, 0, 1, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'cap', pose: 'stand' }); }
  // tables in rows with benches and chairs; customers seated at some
  const rows = Math.max(1, Math.floor((Dp - 3.2) / 2.0)), cols = Math.max(1, Math.floor((Wd - 3.0) / 2.4));
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const a = -Wd / 2 + 1.7 + (j + 0.5) * (Wd - 3.4) / cols + (rand() - 0.5) * 0.2, b = 2.2 + i * 2.0;
    if (a > a1 - 3.4 && b < 2.0) continue;
    const T = new Parts(); table(T, 0.9, 0.7, 0.76); put(T, a, b, 0); R.rect(a - 0.45, b - 0.35, a + 0.45, b + 0.35, 0.76);
    for (const s of [-1, 1]) { const Bn = new Parts(); bench(Bn, 0.8); put(Bn, a + s * 0.0, b + s * 0.62, s > 0 ? Math.PI : 0); if (rand() < 0.7) R.person(a + (rand() - 0.5) * 0.3, b + s * 0.62, 0, -s, { dress: 'robe', cloth: pick(CL), cloth2: pick(CL), hat: pick(['cap', 'cap', 'none']), pose: 'sit' }); }
    const C = new Parts(); teabowl(C, 0, 0.76, 0); teabowl(C, 0.2, 0.76, 0.08); put(C, a - 0.15, b, 0);
  }
  // by the door, the flower rack
  { const P = new Parts(); flowerRack(P); put(P, a0 + 0.3, Dp - 0.9, Math.PI); R.rect(a0 - 0.3, Dp - 1.2, a0 + 0.9, Dp - 0.6, 1.0); }
  for (let k = 0; k < 3; k++) { const L = new Parts(); lantern(L, 0, 3.2, 0); put(L, -Wd / 2 + (k + 0.5) * Wd / 3, Dp * 0.5, 0, 0); }
  R.emit();
  return R.figs;
}
/** hz_restaurant: a wine house — tables with lantern-back chairs, private rooms (xiaoge) of lattice and bamboo curtain along the back with a table each, a wine counter with jars and silver ewers, a screen, lanterns, the incense woman's small burner. */
function restaurant(el, ctx) {
  const R = room(el, ctx), { F, put } = R, rand = rng(el.seed || 1), pick = (a) => a[Math.floor(rand() * a.length)];
  const { Wd, Dp } = F;
  // the private rooms along the back wall: each 2.4 wide, a lattice front with a bamboo curtain half rolled, a table, four chairs, a lantern
  const nr = Math.max(2, Math.min(6, Math.floor((Wd - 1.6) / 2.6)));
  for (let k = 0; k < nr; k++) {
    const a = -Wd / 2 + 0.8 + (k + 0.5) * (Wd - 1.6) / nr, w = (Wd - 1.6) / nr - 0.15, bz = 2.9;
    const P = new Parts();
    for (const s of [-1, 1]) P.add('lacquer_black', box(s * w / 2 - 0.03, 0, -0.03, s * w / 2 + 0.03, 2.4, 0.03));
    P.add('lacquer_black', box(-w / 2, 2.1, -0.03, w / 2, 2.4, 0.03)); P.add('lacquer_black', box(-w / 2, 0.0, -0.03, w / 2, 0.15, 0.03));
    for (let m = 1; m < 9; m++) P.add('lattice_red', box(-w / 2 + m * w / 9 - 0.01, 0.15, -0.015, -w / 2 + m * w / 9 + 0.01, 2.1, 0.015));
    P.add('reed_mat', box(-w / 2 + 0.03, 1.5, 0.02, w / 2 - 0.03, 2.1, 0.03));                          // the curtain half rolled
    put(P, a, bz, 0); R.rect(a - w / 2, bz - 0.05, a + w / 2, bz + 0.05, 2.4);
    const T = new Parts(); table(T, 1.0, 0.8, 0.76); put(T, a, bz - 1.2, 0); R.rect(a - 0.5, bz - 1.6, a + 0.5, bz - 0.8, 0.76);
    for (const [dx, dz, ry] of [[-0.35, 0.55, 0], [0.35, 0.55, 0], [-0.35, -0.55, Math.PI], [0.35, -0.55, Math.PI]]) { const C = new Parts(); chair(C); put(C, a + dx, bz - 1.2 + dz, ry); if (rand() < 0.35) R.person(a + dx, bz - 1.2 + dz * 0.9, 0, -Math.sign(dz) * 1, { dress: 'robe', cloth: pick(CL), cloth2: pick(CL), hat: 'cap', pose: 'sit' }); }
    const Wv = new Parts(); for (let m = 0; m < 3; m++) { Wv.add('silver', ly([[0.001, 0], [0.04, 0], [0.055, 0.1], [0.035, 0.2], [0.02, 0.24], [0.001, 0.24]], 8, -0.25 + m * 0.25, 0.76, 0)); } put(Wv, a, bz - 1.2, 0);
    const L = new Parts(); lantern(L, 0, 3.4, 0); put(L, a, bz - 1.2, 0);
  }
  // the hall: tables in rows, chairs, the wine counter
  const rows = Math.max(1, Math.floor((Dp - 4.6) / 2.0)), cols = Math.max(2, Math.floor((Wd - 3.0) / 2.2));
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    const a = -Wd / 2 + 1.6 + (j + 0.5) * (Wd - 3.2) / cols, b = 5.0 + i * 2.0;
    if (b > Dp - 1.6) continue;
    const T = new Parts(); table(T, 0.9, 0.9, 0.76); put(T, a, b, 0); R.rect(a - 0.45, b - 0.45, a + 0.45, b + 0.45, 0.76);
    const Wv = new Parts(); Wv.add('silver', ly([[0.001, 0], [0.04, 0], [0.055, 0.1], [0.035, 0.2], [0.02, 0.24], [0.001, 0.24]], 8, 0, 0.76, 0)); teabowl(Wv, 0.2, 0.76, 0.1); teabowl(Wv, -0.2, 0.76, -0.1); put(Wv, a, b, 0);
    for (const [dx, dz] of [[-0.62, 0], [0.62, 0], [0, 0.62], [0, -0.62]]) { const C = new Parts(); chair(C); put(C, a + dx, b + dz, faceYaw(-dx, -dz)); if (rand() < 0.4) R.person(a + dx, b + dz, -dx, -dz, { dress: 'robe', cloth: pick(CL), cloth2: pick(CL), hat: pick(['cap', 'cap', 'none']), pose: 'sit' }); }
  }
  { const w = 3.0, P = new Parts(); counter(P, w); put(P, Wd / 2 - 1.9, Dp - 2.2, 0); R.rect(Wd / 2 - 1.9 - w / 2, Dp - 2.5, Wd / 2 - 1.9 + w / 2, Dp - 1.9, 0.95);
    const J = new Parts(); for (let m = 0; m < 5; m++) J.add('pottery_dark', ly([[0.001, 0], [0.12, 0], [0.18, 0.18], [0.16, 0.34], [0.09, 0.44], [0.001, 0.44]], 9, -0.9 + m * 0.4, 0.95, 0)), J.add('cloth_red', ly([[0.001, 0.44], [0.1, 0.44], [0.1, 0.5], [0.001, 0.54]], 8, -0.9 + m * 0.4, 0.95, 0)); put(J, Wd / 2 - 1.9, Dp - 2.2, 0);
    R.person(Wd / 2 - 1.9, Dp - 2.7, 0, 1, { dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_black', hat: 'cap', pose: 'stand' }); }
  { const P = new Parts(); screen3(P, 2.0, 1.6, el.seed); put(P, -Wd / 2 + 2.0, Dp - 2.6, Math.PI); R.rect(-Wd / 2 + 1.0, Dp - 2.8, -Wd / 2 + 3.0, Dp - 2.4, 1.6); }
  for (let k = 0; k < Math.floor(Wd / 3); k++) { const L = new Parts(); lantern(L, 0, 3.4, 0); put(L, -Wd / 2 + 1.5 + k * 3, Dp * 0.6, 0); }
  // the incense woman with her small burner, going between the tables
  R.person(-Wd / 2 + 4.2, Dp - 3.2, 0.5, 0.5, { dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_white', hair: 'bun', pose: 'stand' });
  R.emit();
  return R.figs;
}
/** hz_imperial_shop: a shop of the Imperial Way furnished by its trade: the counter across the width, its shelves along the back wall (bolts of silk, bowls, volumes, jars), a stool and a table, the keeper and a customer, a lantern. */
function imperialShop(el, ctx) {
  const R = room(el, ctx), { F, put } = R, rand = rng(el.seed || 1), pick = (a) => a[Math.floor(rand() * a.length)];
  const { Wd, Dp } = F, kind = { silk: 'cloth', tea: 'bowls', books: 'books', medicine: 'jars', wine: 'jars', lacquer: 'bowls', fans: 'cloth', incense: 'jars', food: 'bowls' }[el.trade] ?? 'cloth';
  const sw = Math.min(Wd - 1.2, 4.2);
  { const P = new Parts(); shelf(P, sw, 3, kind, el.seed); put(P, 0, 0.3, Math.PI); R.rect(-sw / 2, 0.1, sw / 2, 0.45, 1.4); }
  { const w = Math.min(Wd - 1.0, 4.0), P = new Parts(); counter(P, w); put(P, 0, Dp * 0.55, 0); R.rect(-w / 2, Dp * 0.55 - 0.3, w / 2, Dp * 0.55 + 0.3, 0.95);
    if (el.trade === 'silk') { const S = new Parts(); for (let k = 0; k < 4; k++) S.add(pick(['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_green']), box(-w / 2 + 0.3 + k * 0.5, 0.95, -0.15, -w / 2 + 0.7 + k * 0.5, 1.05, 0.15)); put(S, 0, Dp * 0.55, 0); }
    if (el.trade === 'tea') { const T = new Parts(); brazier(T, 0, 0.95, 0); for (let k = 0; k < 4; k++) teabowl(T, -0.5 + k * 0.17, 0.95, 0.12); put(T, -w / 4, Dp * 0.55, 0); }
    if (el.trade === 'medicine') { const T = new Parts(); T.add('iron', box(-0.3, 0.95, -0.1, 0.3, 1.05, 0.1)); T.add('iron', ly([[0.001, 0], [0.16, 0], [0.16, 0.03], [0.001, 0.03]], 12).rotateX(Math.PI / 2).translate(0, 1.2, 0)); put(T, -w / 4, Dp * 0.55, 0); }
    R.person(0, Dp * 0.55 - 0.7, 0, 1, { dress: 'robe', cloth: pick(CL), cloth2: pick(CL), hat: 'cap', pose: 'stand' }); }
  { const T = new Parts(); table(T, 0.8, 0.6, 0.74); put(T, Wd / 2 - 1.0, Dp * 0.55 + 1.4, 0); R.rect(Wd / 2 - 1.4, Dp * 0.55 + 1.1, Wd / 2 - 0.6, Dp * 0.55 + 1.7, 0.74); const S = new Parts(); stool(S); put(S, Wd / 2 - 1.0, Dp * 0.55 + 0.7, 0); }
  { const L = new Parts(); lantern(L, 0, 3.1, 0); put(L, 0, Dp * 0.5, 0); }
  R.emit();
  return R.figs;
}
/** hz_house: a townsman's main room: the ancestors' altar on the back wall with its table and two chairs before it, a couch with its screen, a chest, a qin table, a clothes rack, hanging scrolls, a lantern. */
function house(el, ctx) {
  const R = room(el, ctx), { F, put } = R, rand = rng(el.seed || 1), pick = (a) => a[Math.floor(rand() * a.length)];
  const { Wd, Dp } = F;
  { const P = new Parts(); altar(P, 1.3); put(P, 0, 0.3, 0); R.rect(-0.65, 0.1, 0.65, 0.5, 0.95); }
  for (const s of [-1, 1]) { const P = new Parts(); scroll(P, 0, 0, 0, 0.45, 1.5, (el.seed || 1) + s); put(P, s * 1.45, 0.06, 0, 0.9); }
  for (const s of [-1, 1]) { const C = new Parts(); chair(C); put(C, s * 1.1, 1.5, Math.PI); R.rect(s * 1.1 - 0.3, 1.25, s * 1.1 + 0.3, 1.75, 1.0); }
  { const T = new Parts(); table(T, 0.7, 0.5, 0.74); put(T, 0, 1.5, 0); R.rect(-0.35, 1.25, 0.35, 1.75, 0.74); const V = new Parts(); teabowl(V, 0, 0.74, 0); teabowl(V, 0.16, 0.74, 0); put(V, 0, 1.5, 0); }
  if (Wd > 5) { const P = new Parts(); couch(P, 1.9, 0.95); put(P, -Wd / 2 + 1.1, Dp * 0.55, Math.PI / 2 * 0 + Math.PI); R.rect(-Wd / 2 + 0.1, Dp * 0.55 - 0.5, -Wd / 2 + 2.1, Dp * 0.55 + 0.5, 0.98); }
  { const P = new Parts(); chest(P); put(P, Wd / 2 - 0.5, 0.6, -Math.PI / 2 * 0 + 0); R.rect(Wd / 2 - 0.9, 0.4, Wd / 2 - 0.1, 0.8, 0.5); }
  if (Wd > 4.5) { const P = new Parts(); qinTable(P); put(P, Wd / 2 - 1.2, Dp * 0.6, Math.PI); R.rect(Wd / 2 - 1.6, Dp * 0.6 - 0.2, Wd / 2 - 0.8, Dp * 0.6 + 0.2, 0.55); }
  { const L = new Parts(); lantern(L, 0, 2.9, 0); put(L, 0, Dp * 0.5, 0); }
  if (rand() < 0.7) R.person(0.4, 2.6, 0, -1, { dress: 'robe', cloth: pick(CL), cloth2: pick(CL), hat: 'cap', pose: 'sit' });
  R.emit();
  return R.figs;
}

/** The elements: each draws the furniture into the bag and lets the caller place the figures it returns (see life.js). */
export const INTERIORS = { hz_teahouse: teaHouse, hz_restaurant: restaurant, hz_imperial_shop: imperialShop, hz_house: house };
for (const [name, fn] of Object.entries(INTERIORS)) {
  STYLES.life.elements[name] = (el, ctx) => {
    const figs = fn(el, ctx);
    // the figures stand in the room: drawn by the life style's figure element
    for (const f of figs) STYLES.life.elements.figure(f, ctx);
  };
}
