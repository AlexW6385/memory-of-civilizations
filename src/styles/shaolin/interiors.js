// The furnished halls of the monastery (docs/settlements/shaolin.md §6): the Heavenly Kings, the Mahavira Hall with its Three
// Buddhas and Eighteen Arhats, the Dharma Hall's sutra cabinets, the Thousand Buddha Hall's murals and Vairocana, a monk's cell.
// Everything is built in world coordinates (halls face south; x east, z south) and emitted once per hall.
import { Parts, limb, ball, T } from '../qing/carving.js';
import { box, lathe } from '../../core/geom.js';
import { sumeru } from '../qing/carving.js';
import { buddha } from '../chinese/index.js';
import { statue } from '../chinese/statues.js';
import {
  brickFloor, longTable, table, armchair, stand, candleStand, lantern, lampStand, carpet, books, bolster, hangingScroll, couch, deskThings, plumVase, teaSet,
  rng, W,
} from '../../settlements/ming-suzhou/props.js';

const HALL = { tianwang: tianwang, mahavira, fatang, qianfo, cell };

export function shaolinInterior(el, ctx) {
  const fn = HALL[el.kind];
  if (!fn) throw new Error('shaolin_interior: unknown kind ' + el.kind);
  fn(el, ctx);
}

const censer = (P, s = 1) => {
  P.add('bronze', lathe([[0.001, 0], [0.2 * s, 0.02], [0.3 * s, 0.1], [0.34 * s, 0.35], [0.28 * s, 0.5], [0.34 * s, 0.56], [0.001, 0.56]], 14, null, 0, 0.18 * s, 0));
  for (const a of [0, 2.1, 4.2]) P.add('bronze', limb([Math.cos(a) * 0.2 * s, 0.2 * s, Math.sin(a) * 0.2 * s], [Math.cos(a) * 0.26 * s, 0, Math.sin(a) * 0.26 * s], 0.04 * s, 0.05 * s, 5));
  for (const s2 of [-1, 1]) P.add('bronze', limb([s2 * 0.34 * s, 0.7 * s, 0], [s2 * 0.34 * s, 0.82 * s, 0], 0.03, 0.03, 4));
  P.add('flame', lathe([[0.001, 0.76 * s], [0.012, 0.78 * s], [0.001, 0.8 * s]], 5));
};
/** A prayer cushion of rush and a kneeling board. */
const cushion = (P, c = 'cloth_ochre') => { P.add(c, T(ball(0.26, 0.07, 0.26, 8, 4), 0, 0.07, 0)); P.add('reed_mat', box(-0.3, 0, -0.3, 0.3, 0.02, 0.3)); };
/** A hanging banner of silk (a long strip with a rod, tassels) at x, z, from the top yT down len. */
const banner = (P, len, c) => { P.add('lacquer_red', box(-0.27, -0.03, -0.015, 0.27, 0, 0.015)); P.add(c, box(-0.22, -len, -0.006, 0.22, -0.03, 0.006)); P.add('gilt_bronze', box(-0.22, -len, -0.007, -0.19, -0.03, 0.007)); P.add('gilt_bronze', box(0.19, -len, -0.007, 0.22, -0.03, 0.007)); };
/** The drum on its stand (a great one: red lacquer body, hide heads) and a hanging wooden fish. */
const drumStand = (P) => {
  P.add('lacquer_red', lathe([[0.001, 0], [0.5, 0.0], [0.62, 0.45], [0.5, 0.9], [0.001, 0.9]], 16).rotateZ(Math.PI / 2).translate(0, 0.9, 0).scale(0.55, 1, 1));
  P.add('hide_tan', lathe([[0.001, 0], [0.5, 0]], 16).rotateZ(Math.PI / 2).translate(0.28, 0.9, 0));
  for (const sz of [-1, 1]) P.add(W, box(-0.4, 0, sz * 0.55 - 0.05, 0.4, 0.1, sz * 0.55 + 0.05));
  for (const sz of [-1, 1]) P.add(W, limb([0, 0.1, sz * 0.5], [0, 0.88, sz * 0.2], 0.05, 0.04, 5));
};
const woodenFish = (P) => { P.add('lacquer_red', T(ball(0.2, 0.17, 0.26, 10, 6), 0, 0, 0)); P.add('lacquer_black', box(-0.14, -0.01, 0.2, 0.14, 0.01, 0.255)); };

function frame(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, y = el.y + (el.floorUp ?? 0.05), S = new Parts();
  const { bag, col, lights } = ctx;
  return {
    x0, z0, x1, z1, y, S, bag, col, lights, cx: (x0 + x1) / 2, H: el.H ?? 5,
    put: (Q, x, z, yaw = 0, up = 0) => Q.emit(S, x, up, z, yaw),
    done: () => S.emit(bag, 0, y, 0, 0),
    light: (x, yy, z, c = '#ffb46b', i = 1.6, d = 8) => lights?.push({ at: [x, y + yy, z], color: c, intensity: i, distance: d }),
  };
}
/** Lanterns hung under the roof beams along a row. */
function lanterns(f, xs, z) {
  for (const x of xs) { const yHook = f.H - 0.95, ch = Math.max(0.1, yHook - 2.45 - 0.98); const P = new Parts(); lantern(P, ch); f.put(P, x, z, 0, yHook); }
}
/** A sumeru pedestal block with collision. */
function pedestal(f, x0, z0, x1, z1, h, mat = 'granite_grey', up = 0) {
  const P = new Parts(); sumeru(P, mat, x0, z0, x1, z1, h, up); f.put(P, 0, 0);
  f.col.rect([x0, z0, x1, z1], f.y + up, f.y + up + h);
}

// ── the gate hall: Maitreya, Weituo, the four heavenly kings ─────────────────────────
function tianwang(el, ctx) {
  const f = frame(el, ctx), { x0, z0, x1, cx, y } = f, rand = rng(11);
  brickFloor(f.S, x0 + 0.5, z0 + 0.5, x1 - 0.5, f.z1 - 0.4, 5);
  // Maitreya on the axis facing the gate, Weituo behind him facing the other way
  pedestal(f, cx - 1.7, z0 + 2.0, cx + 1.7, z0 + 5.0, 0.85);
  buddha({ at: [cx, z0 + 3.5], y: y + 0.85, h: 2.9, dir: [0, 1], robe: 'clay_robe' }, ctx);
  // the four kings, two to a side, in the side bays, each on his stone base (their colours: green, blue, red, white-ish)
  const robes = ['clay_green', 'paint_blue', 'lacquer_red', 'clay_robe'];
  [-8.2, -4.6, 4.6, 8.2].forEach((dx, i) => {
    const px = cx + dx;
    pedestal(f, px - 1.2, z0 + 1.2, px + 1.2, z0 + 3.9, 0.6);
    statue({ at: [px, z0 + 2.55], y: y + 0.6, h: 3.6, dir: [0, 1], type: 'king', robe: robes[i], robe2: robes[(i + 1) % 4], seed: 20 + i }, ctx);
  });
  // an offering table and a censer before Maitreya's base; cushions
  { const P = new Parts(), h = 0.95; longTable(P, 1.8, 0.5, h); const C = new Parts(); censer(C, 0.9); C.emit(P, 0, h, 0); f.put(P, cx, z0 + 5.8); f.col.rect([cx - 1, z0 + 5.5, cx + 1, z0 + 6.1], y, y + 1); }
  for (const dx of [-0.9, 0.9]) { const P = new Parts(); cushion(P); f.put(P, cx + dx, z0 + 6.6); }
  for (const s of [-1, 1]) { const P = new Parts(); candleStand(P, 1.2); f.put(P, cx + s * 2.6, z0 + 5.8); }
  f.light(cx, 1.4, z0 + 5.8, '#ffb46b', 1.4, 7); f.light(cx - 8, 1.6, z0 + 4.6, '#ffc07a', 1.0, 6);
  lanterns(f, [-8, -4, 4, 8].map((d) => cx + d), z0 + 5.3);
  void rand; f.done();
}

// ── the Mahavira Hall: three Buddhas, Guanyin behind, eighteen arhats, the altar, drum and bell ─────
function mahavira(el, ctx) {
  const f = frame(el, ctx), { x0, z0, x1, z1, cx, y } = f;
  brickFloor(f.S, x0 + 0.5, z0 + 0.5, x1 - 0.5, z1 - 0.4, 9);
  // the three Buddhas on one long sumeru: Shakyamuni (centre, larger), the Medicine Buddha and Amitabha
  pedestal(f, cx - 11, z0 + 0.9, cx + 11, z0 + 5.6, 0.95);
  buddha({ at: [cx, z0 + 3.2], y: y + 0.95, h: 4.3, dir: [0, 1], robe: 'clay_robe' }, ctx);
  buddha({ at: [cx - 7, z0 + 3.2], y: y + 0.95, h: 3.7, dir: [0, 1], robe: 'clay_green' }, ctx);
  buddha({ at: [cx + 7, z0 + 3.2], y: y + 0.95, h: 3.7, dir: [0, 1], robe: 'clay_robe' }, ctx);
  // Guanyin on the back of the central sumeru, facing the north door
  statue({ at: [cx, z0 + 0.7], y: y + 0.95, h: 2.4, dir: [0, -1], type: 'bodhisattva', robe: 'clay_green', robe2: 'clay_robe', seed: 7 }, ctx);
  // the eighteen arhats, nine along each side wall, each on a small base
  for (const side of [-1, 1]) {
    const wx = side < 0 ? x0 + 1.0 : x1 - 1.0;
    pedestal(f, side < 0 ? wx - 0.9 : wx - 0.9, z0 + 6.5, side < 0 ? wx + 0.9 : wx + 0.9, z1 - 0.8, 0.5);
    for (let k = 0; k < 9; k++) {
      const z = z0 + 7.2 + k * (z1 - 0.8 - z0 - 7.6) / 8;
      statue({ at: [wx, z], y: y + 0.5, h: 1.75, dir: [-side, 0], type: 'disciple', robe: k % 2 ? 'clay_robe' : 'cloth_ochre', robe2: k % 3 ? 'clay_green' : 'paint_blue', seed: 100 + k + (side > 0 ? 9 : 0) }, ctx);
    }
  }
  // the altar before the Buddhas with the great censer, candlesticks and fruit; the kneeling cushions in rows
  { const P = new Parts(), h = 1.0; longTable(P, 4.4, 0.6, h); const C = new Parts(); censer(C, 1.2); C.emit(P, 0, h, 0);
    for (const s of [-1, 1]) { const V = new Parts(); plumVase(V, 9 + s); V.emit(P, s * 1.5, h, 0); const Cd = new Parts(); candleStand(Cd, 0.5); Cd.emit(P, s * 0.8, h - 0.35, 0.05); }
    f.put(P, cx, z0 + 7.0); f.col.rect([cx - 2.3, z0 + 6.6, cx + 2.3, z0 + 7.4], y, y + 1.1); }
  for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) { const P = new Parts(); cushion(P, k % 2 ? 'cloth_ochre' : 'cloth_grey'); f.put(P, cx - 4.5 + k * 1.5, z0 + 8.6 + r * 1.1); }
  for (const s of [-1, 1]) { const P = new Parts(); candleStand(P, 1.3); f.put(P, cx + s * 3.2, z0 + 7.0); f.col.circle(cx + s * 3.2, z0 + 7.0, 0.22, y, y + 1.4); }
  // the great drum (east) and the bell stand with a wooden fish (west), by the front corners
  { const P = new Parts(); drumStand(P); f.put(P, x1 - 2.2, z1 - 1.8, Math.PI / 2); f.col.rect([x1 - 3, z1 - 2.5, x1 - 1.4, z1 - 1.1], y, y + 1.6); }
  { const P = new Parts(); P.add('bronze', lathe([[0.3, 0], [0.34, 0.15], [0.3, 0.9], [0.22, 0.95], [0.001, 0.98]], 14, null, 0, 0.4, 0)); P.add(W, box(-0.5, 0, -0.06, 0.5, 0.06, 0.06)); P.add(W, limb([-0.45, 0, 0], [-0.45, 1.5, 0], 0.05, 0.04, 5)); P.add(W, limb([0.45, 0, 0], [0.45, 1.5, 0], 0.05, 0.04, 5)); P.add(W, box(-0.5, 1.4, -0.04, 0.5, 1.5, 0.04)); const F = new Parts(); woodenFish(F); F.emit(P, 0.0, 0.2, 0.7);
    f.put(P, x0 + 2.2, z1 - 1.8); f.col.rect([x0 + 1.5, z1 - 2.4, x0 + 3.0, z1 - 1.0], y, y + 1.6); }
  // banners hung from the beams, in the bays before the Buddhas
  for (let k = 0; k < 8; k++) { const P = new Parts(); banner(P, 2.3, k % 2 ? 'cloth_ochre' : 'cloth_red'); f.put(P, x0 + 4 + k * 3.1, z0 + 5.9, 0, f.H - 1.2); }
  lanterns(f, [-9, -4.5, 0, 4.5, 9].map((d) => cx + d), z0 + 8.2);
  for (const d of [-8, 0, 8]) f.light(cx + d, 1.5, z0 + 6, '#ffb46b', 1.8, 9); f.light(cx, 1.5, z0 + 9.8, '#ffc07a', 1.2, 9);
  f.done();
}

// ── the Dharma Hall: the sutra library ───────────────────────────────────────────────────
function fatang(el, ctx) {
  const f = frame(el, ctx), { x0, z0, x1, z1, cx, y } = f, rand = rng(31);
  brickFloor(f.S, x0 + 0.5, z0 + 0.5, x1 - 0.5, z1 - 0.4, 13);
  // cabinets along the back and side walls: lacquered doors, shelves of bound books behind lattice, name labels
  const cab = (x, z, yaw, w) => {
    const P = new Parts(), h = 2.4, d = 0.55;
    P.add('lacquer_red', box(-w / 2, 0, -d / 2, w / 2, h, d / 2));
    P.add('lacquer_black', box(-w / 2 + 0.04, 0.5, d / 2, w / 2 - 0.04, h - 0.1, d / 2 + 0.012));
    for (let k = 0; k < 4; k++) P.add('paint_white', box(-w / 2 + 0.08, 0.62 + k * 0.45, d / 2 + 0.012, w / 2 - 0.08, 0.62 + k * 0.45 + 0.05, d / 2 + 0.02));
    const B = new Parts(); for (let k = 0; k < 3; k++) { const Q = new Parts(); books(Q, 7, Math.floor(rand() * 1e5), 0.3, 0.3); Q.emit(B, -w / 3 + k * w / 3, 0.65 + (k % 2) * 0.45, 0.0); }
    B.emit(P, 0, 0, d / 2 - 0.05, 0);
    f.put(P, x, z, yaw);
  };
  for (let k = 0; k < 7; k++) { const x = x0 + 1.6 + k * (x1 - x0 - 3.2) / 6; cab(x, z0 + 0.7, 0, 2.2); f.col.rect([x - 1.1, z0 + 0.4, x + 1.1, z0 + 1.0], y, y + 2.4); }
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const z = z0 + 3 + k * 2.6; const x = s < 0 ? x0 + 0.7 : x1 - 0.7; cab(x, z, s < 0 ? -Math.PI / 2 : Math.PI / 2, 2.2); f.col.rect([x - 0.4, z - 1.1, x + 0.4, z + 1.1], y, y + 2.4); }
  // the master's seat on a dais at the middle of the back; two long reading tables with benches
  { const P = new Parts(); P.add('lacquer_black', box(-1.6, 0, -0.9, 1.6, 0.25, 0.9)); const A = new Parts(); armchair(A); A.emit(P, 0, 0.25, 0.2, Math.PI); f.put(P, cx, z0 + 2.2); f.col.rect([cx - 1.6, z0 + 1.3, cx + 1.6, z0 + 3.1], y, y + 0.25); }
  for (const s of [-1, 1]) {
    const P = new Parts(), h = 0.82; longTable(P, 4.0, 0.7, h); const Sc = new Parts(); books(Sc, 5, 40 + s, 0.25, 0.3); Sc.emit(P, -0.8, h, 0); const Tp = new Parts(); teaSet(Tp); Tp.emit(P, 1.2, h, 0);
    f.put(P, cx + s * 4.2, z0 + 5.6); f.col.rect([cx + s * 4.2 - 2, z0 + 5.2, cx + s * 4.2 + 2, z0 + 6.0], y, y + 0.9);
    for (const dz of [-0.75, 0.75]) { const B = new Parts(); table(B, 1.6, 0.3, 0.46); f.put(B, cx + s * 4.2, z0 + 5.6 + dz); }
  }
  for (const s of [-1, 1]) { const P = new Parts(); candleStand(P, 1.2); f.put(P, cx + s * 1.9, z0 + 4.4); }
  lanterns(f, [-6, -2, 2, 6].map((d) => cx + d), z0 + 5.0);
  f.light(cx, 1.6, z0 + 4.5, '#ffc07a', 1.3, 9); f.light(cx - 6, 1.6, z0 + 3, '#ffc07a', 1.0, 7);
  void z1; f.done();
}

// ── the Thousand Buddha Hall: Vairocana, the murals, the worn floor ──────────────────────
function qianfo(el, ctx) {
  const f = frame({ ...el, floorUp: 0.19 }, ctx), { x0, z0, x1, z1, cx, y } = f, rand = rng(57);
  // (the practice floor itself is the element practice_floor, laid by the plan at the same y; the hall's floor top is el.y + 0.19)
  // Vairocana: a great seated Buddha in gilt on a lotus-and-sumeru throne, a halo behind, offering table before
  pedestal(f, cx - 3.4, z0 + 0.9, cx + 3.4, z0 + 5.7, 1.2);
  buddha({ at: [cx, z0 + 3.3], y: y + 1.2, h: 5.2, dir: [0, 1], robe: 'clay_gilt', gilt: 'clay_gilt' }, ctx);
  for (const s of [-1, 1]) { pedestal(f, cx + s * 5.4 - 0.9, z0 + 1.2, cx + s * 5.4 + 0.9, z0 + 3.0, 0.7); statue({ at: [cx + s * 5.4, z0 + 2.1], y: y + 0.7, h: 2.6, dir: [0, 1], type: 'disciple', robe: 'cloth_ochre', robe2: 'clay_green', seed: 300 + s }, ctx); }
  { const P = new Parts(), h = 0.95; longTable(P, 2.6, 0.55, h); const C = new Parts(); censer(C, 1.0); C.emit(P, 0, h, 0); f.put(P, cx, z0 + 6.35); f.col.rect([cx - 1.4, z0 + 6.0, cx + 1.4, z0 + 6.7], y, y + 1); }
  // the murals: the five hundred arhats paying homage to Vairocana — painted bands on the back and side walls, a ground of
  // green and blue with rows of small figures in robes (three rows of twenty on the back wall, on the sides too)
  const band = (ax, az, bx, bz, n, rows, yaw) => {
    const P = new Parts(), L = Math.hypot(bx - ax, bz - az);
    P.add('fresco_green', box(0, 1.0, -0.015, L, 4.2, 0.0));
    P.add('paint_blue', box(0, 0.8, 0.0, L, 1.0, 0.006)); P.add('paint_caihua', box(0, 4.2, 0.0, L, 4.4, 0.006));
    for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) {
      const u = (k + 0.5 + (r % 2) * 0.35) * L / (n + 0.4), v = 1.35 + r * 0.95, rob = ['clay_robe', 'cloth_ochre', 'cloth_red', 'cloth_indigo'][(k + r * 2) % 4];
      P.add(rob, T(ball(0.13, 0.2, 0.05, 8, 4), u, v, 0.03)); P.add('skin_medium', T(ball(0.055, 0.065, 0.05, 6, 3), u, v + 0.27, 0.035));
      if ((k + r) % 3 === 0) P.add('gilt_bronze', T(ball(0.1, 0.1, 0.012, 6, 3), u, v + 0.28, 0.02));
    }
    f.put(P, ax, az, yaw);
  };
  band(x0 + 1.4, z0 + 0.2, x1 - 1.4, z0 + 0.2, 23, 3, 0);                       // north wall (the back): facing south
  band(x0 + 0.2, z1 - 1.0, x0 + 0.2, z0 + 1.4, 11, 3, Math.PI / 2);            // west wall, facing east
  band(x1 - 0.2, z0 + 1.4, x1 - 0.2, z1 - 1.0, 11, 3, -Math.PI / 2);           // east wall, facing west
  // the sides hold the monks' staffs on racks, and the drum
  for (const s of [-1, 1]) { const P = new Parts(); P.add(W, box(-0.04, 0, -1.0, 0.04, 0.1, 1.0)); P.add(W, box(-0.04, 1.35, -1.0, 0.04, 1.45, 1.0)); for (let k = 0; k < 7; k++) P.add('timber', limb([0, 0.05, -0.85 + k * 0.28], [0.12 * s, 2.0, -0.85 + k * 0.28], 0.02, 0.022, 5)); f.put(P, s < 0 ? x0 + 0.9 : x1 - 0.9, z1 - 2.6); }
  void rand; lanterns(f, [-9, -4.5, 0, 4.5, 9].map((d) => cx + d), z0 + 8);
  for (const d of [-8, 0, 8]) f.light(cx + d, 1.6, z0 + 7, '#ffc07a', 1.2, 9);
  void z1; f.done();
}

// ── a monk's cell ──────────────────────────────────────────────────────────────────────────
function cell(el, ctx) {
  const f = frame(el, ctx), { x0, z0, x1, z1, y } = f;
  brickFloor(f.S, x0 + 0.4, z0 + 0.4, x1 - 0.4, z1 - 0.4, 71);
  const wx = x0 + 0.55, cz = (z0 + z1) / 2;
  // the platform bed along the back (west) wall: a wooden frame, a thin quilt rolled at the head, a pillow of rush
  { const P = new Parts(); P.add(W, box(-0.5, 0.3, -1.0, 0.5, 0.42, 1.0)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(W, box(sx * 0.46 - 0.04, 0, sz * 0.96 - 0.04, sx * 0.46 + 0.04, 0.3, sz * 0.96 + 0.04));
    P.add('reed_mat', box(-0.48, 0.42, -0.98, 0.48, 0.45, 0.98)); P.add('cloth_grey', box(-0.46, 0.45, -0.6, 0.46, 0.53, 0.98)); P.add('cloth_ochre', T(ball(0.2, 0.09, 0.14, 8, 4), 0, 0.55, -0.82));
    f.put(P, wx + 0.5, z0 + 1.6); f.col.rect([wx, z0 + 0.6, wx + 1.0, z0 + 2.6], y, y + 0.5); }
  // the meditation seat by the window: a rush cushion (putuan) and a low table with sutras, a lamp, the wooden fish and begging bowl
  { const P = new Parts(), h = 0.42; table(P, 1.0, 0.5, h); const B = new Parts(); books(B, 6, 8, 0.22, 0.3); B.emit(P, -0.25, h, 0); const D = new Parts(); deskThings(D, 0); D.emit(P, 0.25, h, 0.0);
    const F = new Parts(); woodenFish(F); F.emit(P, 0.4, h + 0.17, -0.12); P.add('pottery_dark', lathe([[0.001, 0], [0.09, 0.0], [0.12, 0.05], [0.13, 0.1], [0.001, 0.1]], 10, null, -0.05, h, 0.12));
    f.put(P, (x0 + x1) / 2 + 1.6, z1 - 1.3); f.col.rect([(x0 + x1) / 2 + 1.0, z1 - 1.6, (x0 + x1) / 2 + 2.2, z1 - 1.0], y, y + 0.45); }
  { const P = new Parts(); cushion(P, 'reed_mat'); f.put(P, (x0 + x1) / 2 + 1.6, z1 - 2.2); }
  { const P = new Parts(); lampStand(P, 1.25); f.put(P, x1 - 1.0, z1 - 1.0); }
  // a shelf of books on the north wall, the water basin on its stand, the staff leaning in the corner, a hanging scroll over the bed
  { const P = new Parts(); P.add(W, box(-0.8, 0, -0.16, 0.8, 1.7, 0.16)); for (let k = 0; k < 4; k++) P.add('lacquer_black', box(-0.76, 0.3 + k * 0.4, -0.12, 0.76, 0.33 + k * 0.4, 0.16));
    for (let k = 0; k < 3; k++) { const B = new Parts(); books(B, 7, 60 + k, 0.28, 0.24); B.emit(P, (k - 1) * 0.5, 0.33 + k * 0.4, 0); }
    f.put(P, (x0 + x1) / 2 + 0.6, z0 + 0.55); f.col.rect([(x0 + x1) / 2 - 0.2, z0 + 0.4, (x0 + x1) / 2 + 1.4, z0 + 0.75], y, y + 1.7); }
  { const P = new Parts(); table(P, 0.5, 0.5, 0.75); P.add('pottery_dark', lathe([[0.001, 0.75], [0.2, 0.75], [0.24, 0.84], [0.001, 0.84]], 10, null, 0, 0, 0)); f.put(P, x1 - 0.8, z0 + 0.9); f.col.circle(x1 - 0.8, z0 + 0.9, 0.3, y, y + 0.85); }
  { const P = new Parts(); P.add('timber', limb([0, 0, 0], [0.12, 2.1, 0.1], 0.025, 0.022, 5)); f.put(P, x1 - 0.5, z0 + 2.2); }
  { const P = new Parts(); hangingScroll(P, 0.7, 1.4, 6); f.put(P, x0 + 0.5, cz, Math.PI / 2, 1.0); }
  f.light((x0 + x1) / 2 + 1.5, 1.4, z1 - 1, '#ffc07a', 1.2, 6);
  f.done();
}
