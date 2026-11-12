// The furnishing of the houses, workshops, stores and shrines (docs/settlements/mycenae.md §5.2): hearths, pithoi, benches, looms, querns, beds and
// the tools of each trade. Everything is placed in the house's own frame (u along the front, v inward from the door wall), mapped to the plan by `m`.

import { box, lathe, disc } from '../../core/geom.js';
import { mergeG } from './util.js';

/** The frame of a house: its width W (along the front) and depth D, and the maps from (u, v) to the plan. */
export function mapper(rect, face) {
  const [x0, z0, x1, z1] = rect, alongX = face === 'n' || face === 's';
  const W = alongX ? x1 - x0 : z1 - z0, D = alongX ? z1 - z0 : x1 - x0;
  const P = (u, v) => (face === 'n' ? [x0 + u, z0 + v] : face === 's' ? [x0 + u, z1 - v] : face === 'w' ? [x0 + v, z0 + u] : [x1 - v, z0 + u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (u0, y0, v0, u1, y1, v1) => { const r = R(u0, v0, u1, v1); return box(r[0], y0, r[1], r[2], y1, r[3]); };
  /** The direction of ascent in the plan for a rise along +u or +v. */
  const dirU = alongX ? 'e' : 's';
  const dirV = face === 'n' ? 's' : face === 's' ? 'n' : face === 'w' ? 'e' : 'w';
  return { W, D, P, R, B, dirU, dirV, alongX };
}

const PITHOS = [[0.2, 0], [0.38, 0.25], [0.45, 0.6], [0.38, 1.0], [0.24, 1.15], [0.27, 1.22], [0.001, 1.22]];
const AMPHORA = [[0.04, 0], [0.09, 0.08], [0.2, 0.3], [0.21, 0.42], [0.12, 0.6], [0.06, 0.68], [0.07, 0.75], [0.001, 0.75]];
const STIRRUP = [[0.05, 0], [0.16, 0.06], [0.2, 0.2], [0.15, 0.32], [0.04, 0.36], [0.001, 0.37]];
const BOWL = [[0.001, 0], [0.1, 0.01], [0.2, 0.09], [0.24, 0.17], [0.22, 0.17], [0.17, 0.1], [0.001, 0.04]];
const JUG = [[0.06, 0], [0.12, 0.05], [0.14, 0.2], [0.1, 0.3], [0.05, 0.34], [0.08, 0.4], [0.001, 0.4]];

/** The builder for one house: gathers pieces by material and adds each once at the end (`done`). */
export function furnisher(ctx, m, y, seedRand) {
  const { bag, col, lights } = ctx, L = new Map(), rand = seedRand;
  const add = (mat, g) => { if (!L.has(mat)) L.set(mat, []); L.get(mat).push(g); };
  const B = (mat, u0, y0, v0, u1, y1, v1) => add(mat, m.B(u0, y0, v0, u1, y1, v1));
  const solid = (u0, v0, u1, v1, y0, y1) => col.rect(m.R(u0, v0, u1, v1), y0, y1);
  const lt = (prof, mat, u, v, y0, s = 1, seg = 9) => { const [x, z] = m.P(u, v); add(mat, lathe(prof.map(([r, h]) => [r * s, h * s]), seg, null, x, y0, z)); };
  const F = {
    add, B, solid, rand, lt, y0: y, lights,
    pp: (u, v, yy) => { const [x, z] = m.P(u, v); return [x, yy, z]; },
    done() { for (const [mat, list] of L) bag.add(mat, mergeG(list)); L.clear(); },
    pithos(u, v, s = 1, y0 = y) { lt(PITHOS, 'terracotta', u, v, y0, s, 10); if (s > 0.9) B('pottery_dark', u - 0.001, y0 + 1.22 * s, v - 0.001, u + 0.001, y0 + 1.22 * s + 0.001, v + 0.001); solid(u - 0.4 * s, v - 0.4 * s, u + 0.4 * s, v + 0.4 * s, y0, y0 + 1.2 * s); },
    amphora(u, v, s = 1, y0 = y) { lt(AMPHORA, 'terracotta', u, v, y0, s, 8); },
    stirrup(u, v, y0 = y, s = 1) { lt(STIRRUP, 'terracotta', u, v, y0, s, 8); },
    bowl(u, v, y0, s = 1, mat = 'terracotta') { lt(BOWL, mat, u, v, y0, s, 8); },
    jug(u, v, y0, s = 1, mat = 'pottery_dark') { lt(JUG, mat, u, v, y0, s, 8); },
    /** a bench of mudbrick or timber along the wall */
    bench(u0, v0, u1, v1, h = 0.45, mat = 'mudbrick') { B(mat, u0, y, v0, u1, y + h, v1); solid(u0, v0, u1, v1, y, y + h); },
    table(u, v, w = 1.1, d = 0.7, h = 0.72) {
      B('timber', u - w / 2, y + h - 0.05, v - d / 2, u + w / 2, y + h, v + d / 2);
      for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B('timber', u + a * (w / 2 - 0.06) - 0.03, y, v + b * (d / 2 - 0.06) - 0.03, u + a * (w / 2 - 0.06) + 0.03, y + h - 0.05, v + b * (d / 2 - 0.06) + 0.03);
      solid(u - w / 2, v - d / 2, u + w / 2, v + d / 2, y, y + h);
    },
    stool(u, v, h = 0.36) { B('timber', u - 0.2, y + h - 0.05, v - 0.2, u + 0.2, y + h, v + 0.2); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B('timber', u + a * 0.15 - 0.025, y, v + b * 0.15 - 0.025, u + a * 0.15 + 0.025, y + h - 0.05, v + b * 0.15 + 0.025); },
    /** a bed: a platform of mudbrick, a hide and a woollen cover */
    bed(u0, v0, u1, v1, cover = 'cloth_red') {
      B('mudbrick', u0, y, v0, u1, y + 0.38, v1); B('hide_brown', u0 + 0.03, y + 0.38, v0 + 0.03, u1 - 0.03, y + 0.43, v1 - 0.03);
      B(cover, u0 + 0.05, y + 0.43, v0 + (v1 - v0) * 0.35, u1 - 0.05, y + 0.5, v1 - 0.03); B('linen', u0 + 0.08, y + 0.43, v0 + 0.05, u1 - 0.08, y + 0.52, v0 + 0.3);
      solid(u0, v0, u1, v1, y, y + 0.5);
    },
    chest(u, v, w = 0.9, d = 0.5, h = 0.5) { B('timber', u - w / 2, y, v - d / 2, u + w / 2, y + h, v + d / 2); B('paint_minoan_red', u - w / 2 - 0.004, y + h - 0.12, v - d / 2 - 0.004, u + w / 2 + 0.004, y + h - 0.08, v + d / 2 + 0.004); solid(u - w / 2, v - d / 2, u + w / 2, v + d / 2, y, y + h); },
    /** a shelf of boards on pegs against a wall running along u at the given v, with pots on it */
    shelf(u0, u1, v, hy = 1.5, pots = 0, dir = 1) {
      B('timber', u0, y + hy, v, u1, y + hy + 0.04, v + 0.25 * dir);
      for (let i = 0; i < pots; i++) { const uu = u0 + 0.2 + i * ((u1 - u0 - 0.4) / Math.max(1, pots - 1)); if (i % 3 === 0) F.jug(uu, v + 0.12 * dir, y + hy + 0.04, 1, 'terracotta'); else if (i % 3 === 1) F.bowl(uu, v + 0.12 * dir, y + hy + 0.04, 0.75); else F.jug(uu, v + 0.12 * dir, y + hy + 0.04, 0.8); }
    },
    /** the hearth: a low round clay platform ringed with stones, ash and embers; the flame and a light if asked */
    hearth(u, v, r = 0.62, light = false, lh = 0.5) {
      const [x, z] = m.P(u, v);
      add('plaster_ochre', lathe([[r + 0.05, 0], [r + 0.05, 0.1], [r, 0.13], [0.001, 0.13]], 14, null, x, y, z));
      add('pottery_dark', disc(r * 0.72, y + 0.135, 12, x, z));
      for (let i = 0; i < 7; i++) { const a = i * 0.9 + 0.3; B('rock_boulder', u + Math.cos(a) * (r + 0.08) - 0.06, y, v + Math.sin(a) * (r + 0.08) - 0.06, u + Math.cos(a) * (r + 0.08) + 0.06, y + 0.16, v + Math.sin(a) * (r + 0.08) + 0.06); }
      for (let i = 0; i < 3; i++) { const a = i * 2.1; B('timber', u + Math.cos(a) * 0.15 - 0.26, y + 0.14, v + Math.sin(a) * 0.15 - 0.03, u + Math.cos(a) * 0.15 + 0.26, y + 0.2, v + Math.sin(a) * 0.15 + 0.03); }
      solid(u - r - 0.05, v - r - 0.05, u + r + 0.05, v + r + 0.05, y, y + 0.16);
      if (light) {
        add('flame', lathe([[0.2, 0], [0.13, 0.15], [0.06, 0.32], [0.001, 0.46]], 7, null, x, y + 0.2, z));
        lights.push({ at: [x, y + lh + 0.3, z], color: '#ff9a45', intensity: 3.2, distance: 7 });
      }
      // a cooking pot on three stones, a ladle
      F.jug(u + r * 0.2, v - r * 0.1, y + 0.14, 1.1, 'pottery_dark');
    },
    /** a warp-weighted loom standing against a wall: two posts, a beam, the cloth, the weights */
    loom(u, v, cloth = 'cloth_ochre', w = 1.5, hh = 1.9) {
      B('timber', u - w / 2, y, v - 0.04, u - w / 2 + 0.1, y + hh, v + 0.04); B('timber', u + w / 2 - 0.1, y, v - 0.04, u + w / 2, y + hh, v + 0.04); B('timber', u - w / 2 - 0.04, y + hh - 0.1, v - 0.05, u + w / 2 + 0.04, y + hh, v + 0.05);
      B(cloth, u - w / 2 + 0.1, y + 0.55, v - 0.012, u + w / 2 - 0.1, y + hh - 0.1, v + 0.012);
      const wg = []; for (let i = 0; i < 10; i++) wg.push(m.B(u - w / 2 + 0.16 + i * ((w - 0.32) / 9) - 0.04, y + 0.38, v - 0.04, u - w / 2 + 0.16 + i * ((w - 0.32) / 9) + 0.04, y + 0.55, v + 0.04));
      add('terracotta', mergeG(wg)); solid(u - w / 2, v - 0.15, u + w / 2, v + 0.15, y, y + hh);
    },
    /** a saddle quern on a bench: a lower stone, an upper one, a heap of flour */
    quern(u, v) { B('mudbrick', u - 0.4, y, v - 0.3, u + 0.4, y + 0.38, v + 0.3); B('rock_boulder', u - 0.34, y + 0.38, v - 0.24, u + 0.34, y + 0.46, v + 0.24); B('rock_boulder', u - 0.2, y + 0.46, v - 0.12, u + 0.2, y + 0.53, v + 0.12); B('plaster_white', u + 0.22, y + 0.38, v - 0.1, u + 0.36, y + 0.44, v + 0.1); solid(u - 0.4, v - 0.3, u + 0.4, v + 0.3, y, y + 0.5); },
    basket(u, v, y0 = y, s = 1) { lt([[0.14, 0], [0.22, 0.12], [0.26, 0.3], [0.001, 0.3]], 'wicker', u, v, y0, s, 8); },
    sacks(u, v, n = 3) { for (let i = 0; i < n; i++) { const a = (i % 2) * 0.45, b = Math.floor(i / 2) * 0.4; B('sacking', u + a - 0.2, y, v + b - 0.15 - (i === 2 ? 0 : 0), u + a + 0.2, y + 0.55 - b * 0.1, v + b + 0.2); } solid(u - 0.25, v - 0.2, u + 0.7, v + 0.6, y, y + 0.6); },
    /** bundles of herbs and onions hung from the beams */
    hang(u, v, hy = 2.35) { B('wicker', u - 0.03, y + hy - 0.4, v - 0.03, u + 0.03, y + hy, v + 0.03); B('cloth_green', u - 0.09, y + hy - 0.5, v - 0.09, u + 0.09, y + hy - 0.2, v + 0.09); },
    rack(u0, u1, v, hy = 0.9, dir = 1, mat = 'timber') { B(mat, u0, y + hy, v, u1, y + hy + 0.04, v + 0.35 * dir); B(mat, u0, y, v + 0.3 * dir - 0.02, u0 + 0.05, y + hy, v + 0.3 * dir + 0.02); B(mat, u1 - 0.05, y, v + 0.3 * dir - 0.02, u1, y + hy, v + 0.3 * dir + 0.02); },
  };
  return F;
}

/** The furnishing of a room by its use. `r` = { u0, v0, u1, v1 } the room's floor, door = the u of the way in (so that the way stays free). */
export const FIT = {
  /** the main room of a home: hearth, table and stools, pithoi, a quern, a bench, shelves, hanging herbs */
  living(F, r, { light = false, door = 0 } = {}) {
    const { u0, v0, u1, v1 } = r, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, rand = F.rand;
    F.hearth(cu, cv, 0.6, light);
    const side = door < cu ? 1 : -1;                         // furniture on the side away from the door
    const ub = side > 0 ? u1 : u0;
    F.pithos(ub - side * 0.5, v0 + 0.55, 1); F.pithos(ub - side * 1.3, v0 + 0.5, 0.85); F.amphora(ub - side * 2.0, v0 + 0.4, 1);
    F.quern(ub - side * 0.6, cv + 1.0);
    F.table(cu + side * 1.5, v1 - 1.1); F.stool(cu + side * 0.8, v1 - 1.0); F.stool(cu + side * 2.2, v1 - 1.0);
    F.bench(side > 0 ? u0 + 0.1 : u1 - 1.9, v1 - 0.5, side > 0 ? u0 + 1.9 : u1 - 0.1, v1 - 0.1, 0.42);
    F.shelf(Math.max(u0 + 0.2, cu - 1.2), Math.min(u1 - 0.2, cu + 1.2), v1 - 0.02, 1.45, 5, -1);
    F.basket(side > 0 ? u0 + 0.4 : u1 - 0.4, v0 + 0.5); F.basket(side > 0 ? u0 + 0.9 : u1 - 0.9, v0 + 0.4, y0of(F), 0.8);
    for (let i = 0; i < 4; i++) F.hang(cu - 1 + i * 0.7 + rand() * 0.2, cv + (rand() - 0.5) * 1.5, 2.3);
  },
  /** the back room: sleeping places, a chest, a loom, jars of store */
  sleeping(F, r, { stairs = false } = {}) {
    const { u0, v0, u1, v1 } = r, cu = (u0 + u1) / 2, rand = F.rand;
    const covers = ['cloth_red', 'cloth_indigo', 'cloth_ochre'];
    if (!stairs) {
      F.bed(u0 + 0.15, v1 - 1.1, Math.min(u0 + 2.2, cu), v1 - 0.12, covers[Math.floor(rand() * 3)]);
      if (u1 - u0 > 5.5) F.bed(Math.max(cu + 0.2, u1 - 2.2), v1 - 1.1, u1 - 0.9, v1 - 0.12, covers[Math.floor(rand() * 3)]);
      F.loom(cu, v1 - 0.12, covers[Math.floor(rand() * 3)], 1.5);
    }
    if (!stairs || u1 - u0 > 7) F.chest(u1 - 0.75, v1 - 0.45);
    F.pithos(u0 + 0.5, v0 + 0.55, 1.0); F.pithos(u0 + 1.3, v0 + 0.5, 0.8); F.amphora(u0 + 2.0, v0 + 0.4); F.amphora(u0 + 2.4, v0 + 0.45, 0.9);
    F.basket(u1 - 0.5, v0 + 0.5);
  },
  /** the loft: a bed, a chest and the weaver's loom under the window */
  loft(F, r, { sy }) {
    const { u0, v0, u1, v1 } = r, cu = (u0 + u1) / 2, rand = F.rand, yy = sy;
    F.bed(u0 + 0.2, v1 - 1.1, u0 + 2.4, v1 - 0.12, 'cloth_indigo');
    F.bed(u1 - 2.4, v1 - 1.1, u1 - 0.2, v1 - 0.12, 'cloth_red');
    F.chest(cu, v1 - 0.45); F.loom(u1 - 1.0, v0 + 0.3, 'cloth_red', 1.4);
    for (let i = 0; i < 4; i++) F.hang(cu - 1.2 + i * 0.8 + rand() * 0.2, (v0 + v1) / 2 + (rand() - 0.5), 2.3);
    void yy;
  },
  store(F, r, { door = 0, stairs = false } = {}) {
    const { u0, v0, u1, v1 } = r, rand = F.rand;
    // rows of pithoi on either side of a free aisle, sacks, a scribe's bench
    const cu = (u0 + u1) / 2, aisle = 1.2, su = stairs ? u0 + 4.9 : u0 + 0.6;
    for (let u = su; u < cu - aisle / 2 - 0.4; u += 1.05) for (let v = v1 - 0.65; v > v0 + 2.4; v -= 1.1) F.pithos(u, v, 0.9 + rand() * 0.25);
    for (let u = u1 - 0.6; u > cu + aisle / 2 + 0.4; u -= 1.05) for (let v = v1 - 0.65; v > v0 + 2.4; v -= 1.1) F.pithos(u, v, 0.9 + rand() * 0.25);
    F.sacks(u1 - 1.0, v0 + 0.6, 4); F.sacks(u0 + (stairs ? 5.0 : 0.5), v0 + 0.5, 3);
    const bu = Math.min(u1 - 1.8, Math.max(u0 + 0.3, door + 1.2));
    F.bench(bu, v0 + 0.1, bu + 1.5, v0 + 0.55, 0.42);
  },
  /** the archive of the palace: shelves of clay tablets in baskets, the scribes' tables */
  archive(F, r) {
    const { u0, v0, u1, v1 } = r, y0 = F.y0, rand = F.rand;
    for (const hy of [0.5, 1.1, 1.7]) {
      F.B('timber', u0 + 0.2, y0 + hy, v1 - 0.4, u1 - 0.2, y0 + hy + 0.04, v1 - 0.02);
      const tb = [];
      for (let u = u0 + 0.35; u < u1 - 0.5; u += 0.34) { const hh = 0.1 + rand() * 0.06; F.B('mud_plaster', u, y0 + hy + 0.04, v1 - 0.34, u + 0.24, y0 + hy + 0.04 + hh, v1 - 0.06); }
    }
    for (const u of [u0 + 0.3, u1 - 0.3]) F.B('timber', u - 0.04, y0, v1 - 0.4, u + 0.04, y0 + 1.9, v1 - 0.02);
    F.table((u0 + u1) / 2 - 2.2, (v0 + v1) / 2, 1.6, 0.8); F.table((u0 + u1) / 2 + 2.2, (v0 + v1) / 2, 1.6, 0.8);
    for (const du of [-2.2, 2.2]) { const cu = (u0 + u1) / 2 + du; F.stool(cu - 0.4, (v0 + v1) / 2 + 0.9); F.stool(cu + 0.4, (v0 + v1) / 2 + 0.9); for (let k = 0; k < 4; k++) F.B('mud_plaster', cu - 0.6 + k * 0.3, y0 + 0.72, (v0 + v1) / 2 - 0.2, cu - 0.4 + k * 0.3, y0 + 0.78, (v0 + v1) / 2 + 0.1); }
    for (let k = 0; k < 6; k++) F.basket(u0 + 0.6 + k * 0.55, v0 + 0.6, y0, 0.9);
    F.chest(u1 - 0.8, v0 + 0.5, 1.1, 0.55); F.chest(u1 - 2.2, v0 + 0.5, 1.0, 0.5);
  },
  /** a guest room of the palace: beds, a bath of clay, a chest, a brazier */
  guest(F, r, { stairs = false } = {}) {
    const { u0, v0, u1, v1 } = r, y0 = F.y0, cu = (u0 + u1) / 2;
    const su = stairs ? u0 + 4.8 : u0;
    F.bed(su + 0.2, v1 - 1.2, su + 2.4, v1 - 0.12, 'cloth_indigo'); F.bed(u1 - 2.6, v1 - 1.2, u1 - 0.4, v1 - 0.12, 'cloth_red');
    // the bathtub: a clay basin with a rim, a pitcher beside it
    F.B('terracotta', cu - 0.5, y0, v0 + 0.5, cu + 0.5, y0 + 0.55, v0 + 1.7); F.B('plaster_white', cu - 0.4, y0 + 0.5, v0 + 0.6, cu + 0.4, y0 + 0.56, v0 + 1.6); F.solid(cu - 0.5, v0 + 0.5, cu + 0.5, v0 + 1.7, y0, y0 + 0.56);
    F.jug(cu + 0.9, v0 + 0.7, y0, 1.3, 'terracotta'); F.stool(cu - 1.0, v0 + 0.9);
    F.chest(su + 0.8, v0 + 0.5); F.table(cu + 2.2, (v0 + v1) / 2, 1.3, 0.7); F.hearth(u1 - 1.2, v0 + 0.9, 0.5, false);
    F.rack(su + 0.2, Math.min(su + 3.0, u1 - 3), v1 - 1.6, 0.0, 1);
  },
  /** the guard-room of the gate: spears in a rack, figure-eight shields on the wall, a bench, a table with the dice, a brazier */
  guard(F, r) {
    const { u0, v0, u1, v1 } = r, y0 = F.y0, cu = (u0 + u1) / 2;
    for (let i = 0; i < 7; i++) { const u = u0 + 0.5 + i * 0.28; F.B('timber', u - 0.015, y0, v1 - 0.25, u + 0.015, y0 + 2.2, v1 - 0.22); F.B('bronze', u - 0.03, y0 + 2.2, v1 - 0.26, u + 0.03, y0 + 2.4, v1 - 0.21); }
    F.B('timber', u0 + 0.4, y0 + 0.5, v1 - 0.3, u0 + 0.5 + 6 * 0.28 + 0.1, y0 + 0.55, v1 - 0.12);
    for (let i = 0; i < 3; i++) { const u = cu + 0.8 + i * 1.0; F.B('hide_brown', u - 0.35, y0 + 0.7, v1 - 0.05, u + 0.35, y0 + 1.9, v1 - 0.0); F.B('hide_white', u - 0.12, y0 + 0.7, v1 - 0.06, u + 0.12, y0 + 1.9, v1 - 0.0); }
    F.bench(u0 + 0.1, v0 + 0.1, u0 + 0.6, v1 - 1.2, 0.42, 'timber'); F.bench(u1 - 0.6, v0 + 0.1, u1 - 0.1, v1 - 1.2, 0.42, 'timber');
    F.table(cu, (v0 + v1) / 2 + 0.3, 1.2, 0.8); F.stool(cu - 0.8, (v0 + v1) / 2 + 0.3); F.stool(cu + 0.8, (v0 + v1) / 2 + 0.3);
    F.add('bronze', lathe([[0.3, 0], [0.12, 0.04], [0.06, 0.3], [0.06, 0.8], [0.22, 0.9], [0.001, 0.9]], 10, null, ...F.pp(u1 - 0.9, v0 + 0.9, y0)));
    F.B('ivory', cu - 0.3, y0 + 0.77, (v0 + v1) / 2 + 0.2, cu - 0.2, y0 + 0.82, (v0 + v1) / 2 + 0.3);
    F.pithos(u0 + 0.5, v1 - 1.0, 0.8); F.jug(cu - 0.1, (v0 + v1) / 2 + 0.4, y0 + 0.72, 1, 'terracotta');
  },
  cult(F, r) {
    const { u0, v0, u1, v1 } = r, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2;
    // benches round the walls, a plastered offering table, a shelf of figurines, a tripod table; the dado red
    F.bench(u0 + 0.1, v0 + 0.1, u0 + 0.6, v1 - 0.1, 0.4, 'lime_plaster'); F.bench(u1 - 0.6, v0 + 0.1, u1 - 0.1, v1 - 0.1, 0.4, 'lime_plaster'); F.bench(u0 + 0.7, v1 - 0.55, u1 - 0.7, v1 - 0.1, 0.4, 'lime_plaster');
    F.B('lime_plaster', cu - 0.7, F.y0, cv - 0.5, cu + 0.7, F.y0 + 0.62, cv + 0.5); F.solid(cu - 0.7, cv - 0.5, cu + 0.7, cv + 0.5, F.y0, F.y0 + 0.62);
    F.B('paint_minoan_red', cu - 0.72, F.y0 + 0.5, cv - 0.52, cu + 0.72, F.y0 + 0.56, cv + 0.52);
    F.jug(cu - 0.3, cv, F.y0 + 0.62, 0.9, 'terracotta'); F.bowl(cu + 0.25, cv, F.y0 + 0.62, 0.9);
    F.B('timber', r.u0 + 0.8, F.y0 + 1.5, v1 - 0.03, u1 - 0.8, F.y0 + 1.54, v1 - 0.03 + 0.25);
    for (let i = 0; i < 6; i++) { const uu = u0 + 1.0 + i * ((u1 - u0 - 2.0) / 5); F.B('terracotta', uu - 0.05, F.y0 + 1.54, v1 - 0.17, uu + 0.05, F.y0 + 1.82, v1 - 0.07); F.B('terracotta', uu - 0.11, F.y0 + 1.7, v1 - 0.17, uu + 0.11, F.y0 + 1.76, v1 - 0.07); }
    F.B('plaster_ochre', u0 + 0.05, F.y0 + 0.45, v1 - 0.02, u1 - 0.05, F.y0 + 1.3, v1 - 0.0);
  },
  /** workshops by trade */
  workshop(F, r, { trade, door = 0, light = false }) {
    const { u0, v0, u1, v1 } = r, cu = (u0 + u1) / 2, cv = (v0 + v1) / 2, rand = F.rand, y0 = F.y0;
    if (trade === 'potter') {
      // the wheel: a disc on a post, a stool; clay in a trough; drying shelves; pots in rows
      F.add('timber', lathe([[0.07, 0], [0.07, 0.5], [0.001, 0.5]], 6, null, ...F.pp(cu, cv, y0))); F.add('terracotta', lathe([[0.001, 0.5], [0.36, 0.5], [0.36, 0.56], [0.001, 0.56]], 14, null, ...F.pp(cu, cv, y0))); F.stool(cu + 0.55, cv + 0.3, 0.3);
      F.add('terracotta', lathe([[0.001, 0.56], [0.16, 0.57], [0.15, 0.8], [0.08, 0.78], [0.001, 0.7]], 10, null, ...F.pp(cu, cv, y0)));
      F.B('mud_plaster', u1 - 1.5, y0, v1 - 0.9, u1 - 0.1, y0 + 0.5, v1 - 0.1); F.solid(u1 - 1.5, v1 - 0.9, u1 - 0.1, v1 - 0.1, y0, y0 + 0.5);
      for (const hy of [0.7, 1.4]) F.rack(u0 + 0.2, Math.min(u0 + 3.6, u1 - 2), v1 - 0.4, hy, 1, 'timber');
      for (let i = 0; i < 9; i++) { const uu = u0 + 0.4 + (i % 9) * 0.38, hy = i < 5 ? 0.74 : 0.74; F.jug(uu, v1 - 0.25, y0 + hy, 0.9, 'terracotta'); }
      for (let i = 0; i < 6; i++) F.stirrup(u0 + 0.5 + i * 0.45, v1 - 0.3, y0 + 1.44, 1.0);
      for (let i = 0; i < 4; i++) F.pithos(u0 + 0.5 + i * 1.0, v0 + 0.55, 0.9 + rand() * 0.2); F.amphora(u1 - 0.5, v0 + 0.5);
    } else if (trade === 'smith') {
      // the forge: a clay hearth with a hood; a bellows; an anvil stone; a quench trough; charcoal; ingots on a bench
      F.B('mudbrick', u1 - 1.8, y0, v1 - 1.5, u1 - 0.2, y0 + 0.75, v1 - 0.2); F.solid(u1 - 1.8, v1 - 1.5, u1 - 0.2, v1 - 0.2, y0, y0 + 0.75);
      F.B('pottery_dark', u1 - 1.5, y0 + 0.75, v1 - 1.25, u1 - 0.5, y0 + 0.8, v1 - 0.5);
      F.B('mudbrick', u1 - 1.8, y0 + 0.75, v1 - 0.4, u1 - 0.2, y0 + 2.1, v1 - 0.2); F.B('mudbrick', u1 - 1.8, y0 + 1.5, v1 - 1.5, u1 - 0.2, y0 + 1.8, v1 - 0.2); F.B('pottery_dark', u1 - 1.6, y0 + 1.5, v1 - 1.35, u1 - 0.4, y0 + 1.505, v1 - 0.4);
      F.B('hide_brown', u1 - 1.2, y0 + 0.5, v1 - 1.9, u1 - 0.7, y0 + 0.8, v1 - 1.5);
      F.add('flame', lathe([[0.25, 0], [0.16, 0.2], [0.07, 0.4], [0.001, 0.55]], 7, null, ...F.pp(u1 - 1.0, v1 - 0.85, y0 + 0.82)));
      if (light) F.lights.push({ at: F.pp(u1 - 1.0, v1 - 0.85, y0 + 1.3), color: '#ff7a2e', intensity: 4.5, distance: 8 });
      F.B('rock_boulder', cu - 0.3, y0, cv - 0.25, cu + 0.3, y0 + 0.5, cv + 0.25); F.B('bronze', cu - 0.2, y0 + 0.5, cv - 0.06, cu + 0.2, y0 + 0.54, cv + 0.06); F.solid(cu - 0.3, cv - 0.25, cu + 0.3, cv + 0.25, y0, y0 + 0.5);
      F.add('pottery_dark', lathe([[0.001, 0], [0.34, 0], [0.38, 0.4], [0.001, 0.4]], 10, null, ...F.pp(u0 + 0.8, v1 - 0.7, y0))); F.add('water', lathe([[0.001, 0.38], [0.33, 0.38]], 10, null, ...F.pp(u0 + 0.8, v1 - 0.7, y0)));
      F.bench(u0 + 1.6, v1 - 0.6, u0 + 3.4, v1 - 0.15, 0.7, 'timber');
      for (let i = 0; i < 5; i++) F.B('bronze', u0 + 1.7 + i * 0.3, y0 + 0.7, v1 - 0.5, u0 + 1.95 + i * 0.3, y0 + 0.76, v1 - 0.3);
      F.basket(u0 + 0.5, v0 + 0.5); F.B('pottery_dark', u0 + 0.2, y0, v0 + 0.8, u0 + 1.0, y0 + 0.4, v0 + 1.4); F.solid(u0 + 0.2, v0 + 0.8, u0 + 1.0, v0 + 1.4, y0, y0 + 0.4);
      for (let i = 0; i < 4; i++) F.B('bronze', u0 + 0.4 + i * 0.22, y0 + 1.5, v1 - 0.05, u0 + 0.46 + i * 0.22, y0 + 1.9, v1 - 0.02);
    } else if (trade === 'weaver') {
      F.loom(u0 + 1.3, v1 - 0.15, 'cloth_red', 1.7); F.loom(cu + 0.2, v1 - 0.15, 'cloth_indigo', 1.7); F.loom(u1 - 1.3, v1 - 0.15, 'cloth_ochre', 1.7);
      F.bench(u0 + 0.2, v0 + 0.15, u0 + 2.4, v0 + 0.6, 0.42, 'timber'); F.stool(cu, v1 - 1.1); F.stool(u1 - 1.0, v1 - 1.1);
      for (let i = 0; i < 5; i++) F.basket(u1 - 0.5 - i * 0.45, v0 + 0.45, y0, 0.9);
      F.B('timber', u0 + 0.1, y0 + 2.0, cv - 0.03, u1 - 0.1, y0 + 2.06, cv + 0.03);
      const cl = ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_brown'];
      for (let i = 0; i < 5; i++) F.B(cl[i], u0 + 0.5 + i * ((u1 - u0 - 1.2) / 5), y0 + 1.1, cv - 0.02, u0 + 1.1 + i * ((u1 - u0 - 1.2) / 5), y0 + 2.0, cv + 0.02);
      F.pithos(u0 + 0.5, v1 - 0.6, 0.9);
    } else if (trade === 'oil') {
      F.add('limestone_yellow', lathe([[0.95, 0], [0.95, 0.5], [0.62, 0.5], [0.62, 0.36], [0.001, 0.36]], 14, null, ...F.pp(cu, cv + 0.4, y0)));
      F.B('timber', cu - 0.1, y0, cv + 0.3, cu + 0.1, y0 + 1.7, cv + 0.5); F.B('timber', cu - 0.4, y0 + 1.0, cv + 0.28, cu + 2.4, y0 + 1.2, cv + 0.52); F.B('rock_boulder', cu + 2.1, y0 + 0.4, cv + 0.1, cu + 2.7, y0 + 1.0, cv + 0.7);
      F.solid(cu - 1.0, cv - 0.55, cu + 1.0, cv + 1.35, y0, y0 + 0.5);
      for (let i = 0; i < 5; i++) F.pithos(u0 + 0.6 + i * 1.0, v1 - 0.6, 1.0 + (i % 2) * 0.1);
      for (let i = 0; i < 5; i++) F.amphora(u0 + 0.5 + i * 0.5, v0 + 0.5, 1);
      F.sacks(u1 - 1.0, v0 + 0.6, 4); F.stirrup(cu - 1.5, cv - 0.8); F.stirrup(cu - 1.2, cv - 0.7);
    } else if (trade === 'ivory') {
      F.table(cu, v1 - 1.0, 2.2, 0.8, 0.8); F.stool(cu - 0.5, v1 - 1.8); F.stool(cu + 0.5, v1 - 1.8);
      for (let i = 0; i < 4; i++) F.B('ivory', cu - 1.0 + i * 0.5, y0 + 0.8, v1 - 1.2 + (i % 2) * 0.2, cu - 0.8 + i * 0.5, y0 + 0.84, v1 - 0.95 + (i % 2) * 0.2);
      F.B('ivory', cu - 0.1, y0 + 0.8, v1 - 1.1, cu + 0.9, y0 + 0.9, v1 - 1.0);
      F.shelf(u0 + 0.3, u1 - 0.3, v1 - 0.02, 1.3, 0, -1); F.shelf(u0 + 0.3, u1 - 0.3, v1 - 0.02, 1.8, 0, -1);
      for (let i = 0; i < 7; i++) F.B('ivory', u0 + 0.5 + i * 0.5, y0 + 1.34, v1 - 0.2, u0 + 0.62 + i * 0.5, y0 + 1.62, v1 - 0.1);
      F.chest(u0 + 0.7, v0 + 0.5); F.basket(u1 - 0.5, v0 + 0.5); F.bench(u1 - 1.3, v0 + 0.1, u1 - 0.1, v0 + 0.5, 0.45);
    } else {
      // perfume and oil of herbs: a bronze cauldron over a hearth, rows of small jars, bundles of herbs
      F.hearth(cu, cv, 0.55, light); F.add('bronze', lathe([[0.001, 0], [0.3, 0.04], [0.42, 0.25], [0.4, 0.4], [0.001, 0.4]], 12, null, ...F.pp(cu, cv, y0 + 0.5)));
      F.B('timber', cu - 0.5, y0 + 0.3, cv - 0.03, cu + 0.5, y0 + 0.36, cv + 0.03);
      F.shelf(u0 + 0.3, u1 - 0.3, v1 - 0.02, 0.9, 9, -1); F.shelf(u0 + 0.3, u1 - 0.3, v1 - 0.02, 1.5, 9, -1);
      for (let i = 0; i < 9; i++) F.stirrup(u0 + 0.4 + i * 0.45, v1 - 0.15, y0 + 1.54, 0.8);
      for (let i = 0; i < 6; i++) F.hang(u0 + 0.6 + i * 0.7, v0 + 1.2 + rand() * 0.6, 2.3);
      F.table(u1 - 1.0, v0 + 0.8, 1.2, 0.7); F.pithos(u0 + 0.5, v0 + 0.55, 0.9);
    }
    void door;
  },
};
const y0of = (F) => F.y0;
