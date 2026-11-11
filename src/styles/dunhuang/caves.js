// The cave interiors (docs/settlements/dunhuang.md §3): a hall cave of the Tang type (fudou ceiling, altar with a
// group of clay figures), a central-pillar cave, a monk's cell. Each builds only its lining, floor, paintings,
// statues and lamps inside the hole the cliff leaves for it (cliff.js); the rock round it is the cliff's.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { statue } from '../chinese/statues.js';
import { buddha } from '../chinese/index.js';
import { figure } from '../../objects/figures.js';
import { Panel, wallPanel, PAL, friezeM, thousandM, donorsM, tableauM, apsaraM, lotusM, bodhiM, buddhaM, rngOf } from './paint.js';

const PLASTER = 'lime_plaster', FLOORM = 'brick_grey';

export function oilLamp(ctx, x, y, z, h = 0.9, intensity = 2.4, distance = 8) {
  const { bag, lights } = ctx;
  bag.add('bronze', lathe([[0.16, 0], [0.16, 0.03], [0.1, 0.08], [0.04, 0.14], [0.03, h - 0.1], [0.12, h - 0.03], [0.13, h], [0.001, h]], 10, null, x, y, z));
  bag.add('flame', lathe([[0.01, 0], [0.016, 0.025], [0.001, 0.06]], 6, null, x, y + h + 0.01, z));
  lights?.push({ at: [x, y + h + 0.1, z], color: '#ffb46b', intensity, distance });
  ctx.col.circle(x, z, 0.17, y, y + h);
}
const slab = (ctx, mat, x0, y0, z0, x1, y1, z1) => ctx.bag.add(mat, box(x0, y0, z0, x1, y1, z1));

/** The four walls' plaster, the door in the east wall (zc ± 1.0, to 2.6 m), the floor and its walk. */
function shell(ctx, S) {
  const { x0, x1, z0, z1, y, h, zc } = S, t = 0.04;
  slab(ctx, FLOORM, x0, y - 0.12, z0, x1, y, z1);
  slab(ctx, FLOORM, x1, y - 0.12, zc - 1, S.xf, y, zc + 1);
  ctx.col.floor([x0, z0, x1, z1], y);
  ctx.col.floor([x1, zc - 1, S.xf, zc + 1], y);
  slab(ctx, PLASTER, x0, y, z0, x0 + t, y + h, z1);                     // the west (back)
  slab(ctx, PLASTER, x0, y, z0, x1, y + h, z0 + t);                     // the north
  slab(ctx, PLASTER, x0, y, z1 - t, x1, y + h, z1);                     // the south
  slab(ctx, PLASTER, x1 - t, y, z0, x1, y + h, zc - 1);                 // the east, beside the door
  slab(ctx, PLASTER, x1 - t, y, zc + 1, x1, y + h, z1);
  slab(ctx, PLASTER, x1 - t, y + 2.6, zc - 1, x1, y + h, zc + 1);       // over the door
  // the passage: its sides and lintel painted red-brown, jambs of timber
  for (const s of [-1, 1]) slab(ctx, 'timber_red', S.xf - 0.5, y, zc + s * 1.0 - (s > 0 ? 0 : -0.0), x1, y + 2.6, zc + s * 1.0 + (s > 0 ? 0.0 : 0));
}

/** The pyramid-truncated ceiling (fudou) from the wall tops at y+h up to the well at y+h+rise, inset f. Returns the slope panels. */
function fudou(ctx, S, f, rise, seed) {
  const { x0, x1, z0, z1, y, h } = S, yt = y + h, ya = yt + rise, sl = Math.hypot(f, rise), bag = ctx.bag;
  const sides = [
    { o: [x0, yt, z0], inn: [0, 1], L: x1 - x0 },        // north
    { o: [x1, yt, z1], inn: [0, -1], L: x1 - x0 },       // south
    { o: [x1, yt, z0], inn: [-1, 0], L: z1 - z0 },       // east
    { o: [x0, yt, z1], inn: [1, 0], L: z1 - z0 },        // west
  ];
  const out = [];
  for (const [i, s] of sides.entries()) {
    const [ix, iz] = s.inn;
    const P = new Panel(bag, s.o, [iz, 0, -ix], [ix * f / sl, rise / sl, iz * f / sl], [ix * rise / sl, -f / sl, iz * rise / sl]);
    P.poly(PLASTER, [[0, 0], [s.L, 0], [s.L - f, sl], [f, sl]], 0);
    out.push({ P, L: s.L, sl, i });
  }
  // the well: a flat square at the top, a lotus medallion in nested squares, four apsaras at its corners
  const wx0 = x0 + f, wx1 = x1 - f, wz0 = z0 + f, wz1 = z1 - f;
  const W = new Panel(bag, [wx0, ya, wz0], [1, 0, 0], [0, 0, 1], [0, -1, 0]);
  const a = wx1 - wx0, b = wz1 - wz0, cu = a / 2, cv = b / 2;
  W.rect(PAL.red, 0, 0, a, b, 0); W.rect(PAL.green, 0.12, 0.12, a - 0.12, b - 0.12, 1); W.rect(PAL.blue2, 0.3, 0.3, a - 0.3, b - 0.3, 2); W.rect(PAL.white, 0.42, 0.42, a - 0.42, b - 0.42, 3);
  lotusM(W, cu, cv, Math.min(a, b) * 0.34, 4, { petal: PAL.red, petal2: PAL.blue });
  for (const [u, v, d] of [[0.7, 0.7, 1], [a - 0.7, 0.7, -1], [0.7, b - 0.7, 1], [a - 0.7, b - 0.7, -1]]) lotusM(W, u, v, 0.28, 4, {});
  W.flush();
  return out;
}

/** A valance of hanging triangles in three colours along a slope's lower edge. */
function valance(P, L, h = 0.3, L1 = 6) {
  P.rect(PAL.black, 0, 0, L, 0.04, L1);
  const n = Math.round(L / 0.3), w = L / n, cols = [PAL.red, PAL.green, PAL.blue, PAL.ochre];
  for (let k = 0; k < n; k++) P.poly(cols[k % 4], [[k * w, 0.04], [(k + 1) * w, 0.04], [(k + 0.5) * w, 0.04 + h]], L1 + 1);
}

/** A hall cave: S = { xf (the cliff face), zc, y (the floor) }. */
export function hallCave(ctx, S0) {
  const { bag, col } = ctx, d = 6.4, w = 6.0, h = 3.4, rise = 2.0, f = 1.3;
  const x1 = S0.xf - 1.4, S = { ...S0, x1, x0: x1 - d, z0: S0.zc - w / 2, z1: S0.zc + w / 2, h }, { x0, z0, z1, zc, y } = S;
  shell(ctx, S);
  const slopes = fudou(ctx, S, f, rise, S0.seed ?? 1);
  // ceiling: thousand Buddhas on the north and south slopes, clouds and apsaras on the east and west, valances on all four
  for (const { P, L, sl, i } of slopes) {
    valance(P, L, 0.28);
    if (i < 2) thousandM(P, f + 0.1, 0.42, L - f - 0.1, sl - 0.1, 3, 31 + i, 0.34);
    else {
      P.rect(PAL.blue2, f * 0.6, 0.4, L - f * 0.6, sl - 0.1, 3);
      for (let k = 0; k < 4; k++) apsaraM(P, f + 0.5 + k * (L - 2 * f - 1) / 3.2, 1.0 + (k % 2) * 0.45, 0.8, k % 2 ? 1 : -1, { scarf: k % 2 ? PAL.red : PAL.white, dress: PAL.green }, 4);
      for (let k = 0; k < 3; k++) lotusM(P, f + 0.9 + k * (L - 2 * f - 1.8) / 2, 0.75, 0.18, 4);
    }
    P.flush();
  }
  // the walls
  const wall = (a, b, n, kind) => {
    const P = wallPanel(bag, a, b, y, n), L = P.len;
    P.rect(PAL.black, 0, 0, L, 0.1, 1);                                              // the skirting
    P.rect(PAL.red, 0, 0.1, L, 0.16, 1);
    friezeM(P, 0, L, h - 0.34, h - 0.04, 1, kind === 'main' ? 0 : 2);                                    // the upper frieze
    if (kind === 'main') {
      donorsM(P, 0.3, L - 0.3, 0.22, 1.25, 1, 5);
      friezeM(P, 0.1, L - 0.1, 1.1, 1.26, 1, 1);
      tableauM(P, 0.18, 1.34, L - 0.18, h - 0.42, 11 + Math.round(L), 2);
    } else if (kind === 'door') {
      thousandM(P, 0.2, 0.3, L - 0.2, h - 0.45, 2, 77, 0.36);
    } else {
      // the back (west) wall: the halo and mandorla behind the altar, apsaras above, bodhisattvas and disciples painted at the sides
      P.rect(PAL.green2, 0.2, 0.2, L - 0.2, h - 0.4, 1);
      P.ell(PAL.blue2, L / 2, 2.3, 1.9, 2.1, 2, 20);
      P.ell(PAL.green, L / 2, 2.3, 1.5, 1.7, 3, 20);
      P.ell(PAL.red, L / 2, 2.3, 1.1, 1.3, 4, 20);
      P.disc(PAL.gold, L / 2, 2.4, 0.78, 5, 18);
      for (const s of [-1, 1]) {
        bodhiM(P, L / 2 + s * 2.35, 0.7, 1.7, { skirt: s > 0 ? PAL.blue : PAL.red, scarf: PAL.white }, 3);
        bodhiM(P, L / 2 + s * 1.7, 0.7, 1.3, { skirt: s > 0 ? PAL.ochre : PAL.green }, 3);
        apsaraM(P, L / 2 + s * 1.2, h - 0.85, 1.0, -s, { scarf: s > 0 ? PAL.red : PAL.blue }, 5);
        for (let k = 0; k < 3; k++) buddhaM(P, L / 2 + s * (0.5 + k * 0.55), h - 0.72, 0.46, { robe: k % 2 ? PAL.blue : PAL.red2 }, 5);
      }
    }
    P.flush();
  };
  wall([x0, z0], [x1, z0], [0, 1], 'main');           // north (facing south)
  wall([x1, z1], [x0, z1], [0, -1], 'main');           // south
  wall([x0, z1], [x0, z0], [1, 0], 'back');            // west
  wall([x1, z0], [x1, z1], [-1, 0], 'door');           // east; the door's cut is under the paint (the thousand Buddhas stop at its edges)
  // the altar: a platform with a lotus-bordered front, the group of seven on it facing east
  const ax1 = x0 + 2.5, base = y + 0.55;
  slab(ctx, PLASTER, x0, y, zc - 2.5, ax1, base, zc + 2.5);
  slab(ctx, 'lacquer_red', ax1, y + 0.1, zc - 2.5, ax1 + 0.04, base - 0.06, zc + 2.5);
  slab(ctx, 'clay_gilt', ax1, base - 0.06, zc - 2.5, ax1 + 0.05, base, zc + 2.5);
  col.rect([x0, zc - 2.5, ax1 + 0.05, zc + 2.5], y, base); col.floor([x0, zc - 2.5, ax1, zc + 2.5], base);
  const P = wallPanel(bag, [ax1 + 0.05, zc + 2.5], [ax1 + 0.05, zc - 2.5], y + 0.1, [1, 0], 0);
  for (let k = 0; k < 6; k++) lotusM(P, 0.4 + k * 0.84, 0.18, 0.15, 1);
  P.flush();
  const dir = [1, 0];
  buddha({ at: [x0 + 1.25, zc], y: base, h: 2.3, dir, robe: 'clay_robe' }, ctx);
  col.circle(x0 + 1.25, zc, 0.8, base, base + 2.4);
  for (const s of [-1, 1]) {
    statue({ at: [x0 + 1.2, zc + s * 1.05], y: base, h: 1.65, dir, type: 'disciple', robe: s > 0 ? 'clay_robe' : 'paint_ochre', robe2: 'clay_green', seed: 3 + s }, ctx);
    statue({ at: [x0 + 1.25, zc + s * 1.7], y: base, h: 1.85, dir, type: 'bodhisattva', robe: 'clay_green', robe2: 'clay_robe', seed: 9 + s }, ctx);
    statue({ at: [x0 + 2.0, zc + s * 2.2], y: base, h: 2.0, dir: [1, -s * 0.35], type: 'king', robe: 'paint_blue', robe2: 'clay_robe', seed: 21 + s }, ctx);
    col.circle(x0 + 1.2, zc + s * 1.05, 0.35, base, base + 1.7); col.circle(x0 + 1.25, zc + s * 1.7, 0.4, base, base + 1.9); col.circle(x0 + 2.0, zc + s * 2.2, 0.38, base, base + 2);
  }
  // lamps before the altar, incense burner, mat; a kneeling donor at the door side
  oilLamp(ctx, ax1 + 0.9, y, zc - 1.6, 1.0, 2.6, 9); oilLamp(ctx, ax1 + 0.9, y, zc + 1.6, 1.0, 2.6, 9);
  bag.add('bronze', lathe([[0.001, 0], [0.14, 0.02], [0.12, 0.12], [0.16, 0.2], [0.001, 0.2]], 10, null, ax1 + 0.9, y + 0.0, zc));
  bag.add('reed_mat', box(ax1 + 1.5, y, zc - 1.1, ax1 + 3.1, y + 0.025, zc + 1.1));
  ctx.lights?.push({ at: [x1 - 1.0, y + 2.6, zc], color: '#ffe0b0', intensity: 2.0, distance: 8 });
}

/** A central-pillar cave. */
export function pillarCave(ctx, S0) {
  const { bag, col } = ctx, d = 8.4, w = 7.0, h = 3.6, rise = 1.4;
  const x1 = S0.xf - 1.6, S = { ...S0, x1, x0: x1 - d, z0: S0.zc - w / 2, z1: S0.zc + w / 2, h }, { x0, z0, z1, zc, y } = S;
  shell(ctx, S);
  const yt = y + h, xg = x0 + 4.5;
  // the rear ceiling, flat; the front's gabled ("human-shaped") ceiling with painted rafters over the east half
  const flat = new Panel(bag, [x0, yt, z1], [1, 0, 0], [0, 0, -1], [0, -1, 0]);
  flat.rect(PAL.green2, 0, 0, xg - x0, w, 0); flat.rect(PAL.red, 0, 0, xg - x0, 0.25, 1); flat.rect(PAL.red, 0, w - 0.25, xg - x0, w, 1);
  for (let k = 0; k < 3; k++) for (let j = 0; j < 2; j++) lotusM(flat, 0.9 + k * 1.2, 1.3 + j * 4.4, 0.45, 2);
  flat.flush();
  const gab = Math.hypot(w / 2, rise);
  for (const s of [-1, 1]) {
    const zE = zc + s * w / 2, o = [x1, yt, zE];
    const G = new Panel(bag, o, [-1, 0, 0], [0, rise / gab, -s * (w / 2) / gab], [0, -(w / 2) / gab, -s * rise / gab]);
    G.poly(PLASTER, [[0, 0], [x1 - xg, 0], [x1 - xg, gab], [0, gab]], 0);
    for (let k = 0; k < 14; k++) G.rect(PAL.red, 0.1 + k * (x1 - xg - 0.3) / 13, 0, 0.1 + k * (x1 - xg - 0.3) / 13 + 0.1, gab, 1);     // rafters
    for (let k = 0; k < 4; k++) for (let j = 0; j < 14; j++) if ((k + j) % 2 === 0) G.rect(k % 2 ? PAL.blue : PAL.green, 0.22 + j * (x1 - xg - 0.3) / 13, 0.15 + k * gab / 4.2, 0.22 + j * (x1 - xg - 0.3) / 13 + 0.38, 0.15 + k * gab / 4.2 + 0.3, 2);
    G.flush();
  }
  // the gable's west end above the flat ceiling is open to the roof; its east end over the door wall is closed by a triangle
  const E = new Panel(bag, [x1 - 0.04, yt, z0], [0, 0, 1], [0, 1, 0], [-1, 0, 0]);
  E.poly(PLASTER, [[0, 0], [w, 0], [w / 2, rise]], 0); E.flush();
  const Wg = new Panel(bag, [xg, yt, z1], [0, 0, -1], [0, 1, 0], [1, 0, 0]);
  Wg.poly(PLASTER, [[0, 0], [w, 0], [w / 2, rise]], 0); Wg.rect(PAL.red, 0.1, 0, w - 0.1, 0.18, 1); Wg.flush();
  // the walls: skirting and yaksha band (triangles), thousand Buddhas, an upper band of apsaras; a tableau on each side wall
  const wall = (a, b, n, kind) => {
    const P = wallPanel(bag, a, b, y, n), L = P.len;
    P.rect(PAL.black, 0, 0, L, 0.9, 1);
    const m = Math.round(L / 0.45);
    for (let k = 0; k < m; k++) P.poly(k % 2 ? PAL.red : PAL.ochre, [[k * L / m, 0.02], [(k + 1) * L / m, 0.02], [(k + 0.5) * L / m, 0.82]], 2);
    friezeM(P, 0, L, 0.92, 1.1, 1, 2);
    thousandM(P, 0.1, 1.15, L - 0.1, 2.5, 2, 40 + Math.round(L), 0.36);
    P.rect(PAL.red, 0, 2.5, L, 2.58, 1);
    P.rect(PAL.green2, 0, 2.58, L, h, 1);
    for (let k = 0; k < Math.floor(L / 1.15); k++) apsaraM(P, 0.8 + k * 1.15, 2.85, 0.62, k % 2 ? 1 : -1, { scarf: k % 3 ? PAL.red : PAL.white, dress: k % 2 ? PAL.blue : PAL.green }, 3);
    if (kind === 'side') tableauM(P, L * 0.28, 1.2, L * 0.72, 2.45, 7 + Math.round(L), 8);
    P.flush();
  };
  wall([x0, z0], [x1, z0], [0, 1], 'side'); wall([x1, z1], [x0, z1], [0, -1], 'side'); wall([x0, z1], [x0, z0], [1, 0], 'back'); wall([x1, z0], [x1, z1], [-1, 0], 'door');
  // the pillar: 2.6 m square from the floor to the ceiling, a niche with a Buddha on its east face, painted on the others
  const px = x0 + 3.2, hp = 1.3, pe = px + hp;
  slab(ctx, PLASTER, px - hp, y, zc - hp, pe, yt, zc + hp);
  col.rect([px - hp, zc - hp, pe, zc + hp], y, yt);
  slab(ctx, 'timber_red', pe, y + 0.4, zc - 0.95, pe + 0.06, y + 2.7, zc - 0.85); slab(ctx, 'timber_red', pe, y + 0.4, zc + 0.85, pe + 0.06, y + 2.7, zc + 0.95); slab(ctx, 'timber_red', pe, y + 2.6, zc - 0.95, pe + 0.06, y + 2.7, zc + 0.95);
  slab(ctx, 'clay_gilt', pe, y + 0.4, zc - 0.85, pe + 0.03, y + 2.6, zc + 0.85);
  buddha({ at: [pe + 0.5, zc], y: y + 0.0, h: 2.4, dir: [1, 0], robe: 'clay_robe' }, ctx);
  col.circle(pe + 0.5, zc, 0.8, y, y + 2.4);
  for (const [a, b, n] of [[[pe, zc + hp], [pe, zc - hp], [1, 0]], [[px - hp, zc - hp], [px + hp, zc - hp], [0, -1]], [[px + hp, zc + hp], [px - hp, zc + hp], [0, 1]], [[px - hp, zc + hp], [px - hp, zc - hp], [-1, 0]]]) {
    if (n[0] === 1) continue;
    const P = wallPanel(bag, a, b, y, n, 0), L = P.len;
    P.rect(PAL.black, 0, 0, L, 0.2, 1); thousandM(P, 0.1, 0.3, L - 0.1, yt - y - 0.4, 2, 90 + Math.round(L), 0.34); P.flush();
  }
  for (const z of [zc - 2.7, zc + 2.7]) oilLamp(ctx, pe + 1.0, y, z, 1.0, 2.6, 10);
  oilLamp(ctx, px - hp - 1.0, y, zc - 1.2, 1.0, 2.2, 9);
  ctx.lights?.push({ at: [x1 - 1.0, y + 2.8, zc], color: '#ffe0b0', intensity: 2.0, distance: 9 });
  bag.add('reed_mat', box(pe + 1.3, y, zc - 1.2, pe + 2.7, y + 0.025, zc + 1.2));
}

/** A monk's cell: kang, stove, shelf of sutras, water jar, mat; a monk at the lamp. */
export function cellCave(ctx, S0) {
  const { bag, col } = ctx, d = 3.8, w = 3.2, h = 2.3;
  const x1 = S0.xf - 1.2, S = { ...S0, x1, x0: x1 - d, z0: S0.zc - w / 2, z1: S0.zc + w / 2, h }, { x0, z0, z1, zc, y } = S;
  shell(ctx, S);
  const c = new Panel(bag, [x0, y + h, z1], [1, 0, 0], [0, 0, -1], [0, -1, 0]);
  c.rect('wood_dark', 0, 0, d, w, 0); c.flush();
  const r = rngOf(5);
  // beams of the ceiling (the soot-dark roof of a cell), skirting
  for (let k = 0; k < 4; k++) slab(ctx, 'timber', x0 + 0.3 + k * 1.0, y + h - 0.14, z0, x0 + 0.5 + k * 1.0, y + h, z1);
  // the kang along the west wall, its stove at the south end with a pot, the flue's soot on the wall
  slab(ctx, 'mudbrick', x0, y, z0, x0 + 1.5, y + 0.55, z1 - 0.7); col.rect([x0, z0, x0 + 1.5, z1 - 0.7], y, y + 0.55); col.floor([x0, z0, x0 + 1.5, z1 - 0.7], y + 0.55);
  slab(ctx, 'reed_mat', x0 + 0.05, y + 0.55, z0 + 0.05, x0 + 1.45, y + 0.58, z1 - 0.75);
  slab(ctx, 'mudbrick', x0, y, z1 - 0.7, x0 + 0.8, y + 0.9, z1); col.rect([x0, z1 - 0.7, x0 + 0.8, z1], y, y + 0.9);
  bag.add('iron', lathe([[0.001, 0], [0.18, 0.02], [0.26, 0.12], [0.22, 0.24], [0.26, 0.26], [0.001, 0.26]], 12, null, x0 + 0.4, y + 0.9, z1 - 0.35));
  bag.add('lacquer_black', box(x0 + 0.02, y + 0.9, z1 - 0.7, x0 + 0.08, y + h, z1 - 0.1));
  // a low table, shelf of sutra rolls, water jar, bedroll
  slab(ctx, 'timber', x0 + 1.9, y + 0.32, zc - 0.5, x0 + 2.5, y + 0.36, zc + 0.5); for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) slab(ctx, 'timber', x0 + 1.95 + a * 0.5, y, zc - 0.45 + b * 0.9, x0 + 2.0 + a * 0.5, y + 0.32, zc - 0.4 + b * 0.9);
  col.rect([x0 + 1.9, zc - 0.5, x0 + 2.5, zc + 0.5], y, y + 0.36);
  slab(ctx, 'timber', x0 + 0.02, y + 1.3, z0 + 0.02, x0 + 0.3, y + 1.35, z0 + 1.6);
  for (let k = 0; k < 9; k++) bag.add(k % 3 ? 'paint_white' : 'cloth_ochre', lathe([[0.04, 0], [0.04, 0.26], [0.001, 0.26]], 6, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(x0 + 0.17, y + 1.39, z0 + 0.15 + k * 0.16));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.25], [0.25, 0.5], [0.15, 0.55], [0.17, 0.62], [0.001, 0.62]], 12, null, x1 - 0.4, y, z0 + 0.4));
  col.circle(x1 - 0.4, z0 + 0.4, 0.28, y, y + 0.62);
  bag.add('reed_mat', box(x0 + 1.7, y, zc - 0.8, x0 + 2.9, y + 0.02, zc + 0.8));
  // the niche lamp and a small clay Buddha on the wall shelf
  oilLamp(ctx, x0 + 1.0, y + 0.58, z0 + 0.35, 0.3, 2.2, 7);
  ctx.lights?.push({ at: [x0 + 2.0, y + 1.7, zc], color: '#ffc27a', intensity: 1.6, distance: 6 });
  const P = wallPanel(bag, [x0, z1], [x0, z0], y + 0.9, [1, 0]); P.rect(PAL.green2, 0.8, 0.3, 2.2, 1.2, 1); buddhaM(P, 1.5, 0.35, 0.9, {}, 2); P.flush();
  figure({ at: [x0 + 2.0, zc - 0.05], y, rot: -Math.PI / 2, seed: 8, dress: 'robe', cloth: 'cloth_ochre', cloth2: 'cloth_brown', pose: 'cross', hair: 'shaven', hat: 'none', over: 'shawl', skin: 'skin_medium', feet: 'bare' }, ctx);
  void r;
}
