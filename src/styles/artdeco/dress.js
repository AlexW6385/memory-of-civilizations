// The eye-level dress of a Midtown front in 1931 (docs/settlements/new-york.md §1i): the lettered signs of the shops over their
// windows, the goods behind the glass, the lettering on the panes, the vertical signs on their brackets, the sign boards on
// the roofs; and the pavement itself — bluestone flags and granite curbs — with what stood on it: hydrants, mail boxes,
// ash cans, traffic signals, the cast-iron clocks of Fifth Avenue, fire alarm boxes, manhole covers, the garment district's
// racks and hand trucks, crates and barrels at the grocers', the sandwich boards of the lunch rooms.
// Letters are flat quads from a 5x5 bitmap face (a sign painter's block capitals), merged by run, so a whole street of
// signs costs a few thousand triangles.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { face } from './blocks.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** The entrance of the settlement, in the grid's frame (plan.js): the signs within 230 m of it are lettered in full, further out only the boards stand. */
const ENT = [4, 176];
export const nearEntrance = (x, z, m = 230) => Math.hypot(x - ENT[0], z - ENT[1]) < m;

// ── the lettering ──────────────────────────────────────────────────────────────────────────────────
const GL = {
  A: ['.###.', '#...#', '#####', '#...#', '#...#'], B: ['####.', '#...#', '####.', '#...#', '####.'], C: ['.####', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '####.'], E: ['#####', '#....', '###..', '#....', '#####'], F: ['#####', '#....', '###..', '#....', '#....'],
  G: ['.####', '#....', '#.###', '#...#', '.###.'], H: ['#...#', '#...#', '#####', '#...#', '#...#'], I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..###', '...#.', '...#.', '#..#.', '.##..'], K: ['#...#', '#..#.', '###..', '#..#.', '#...#'], L: ['#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'], O: ['.###.', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '####.', '#....', '#....'], Q: ['.###.', '#...#', '#.#.#', '#..#.', '.##.#'], R: ['####.', '#...#', '####.', '#..#.', '#...#'],
  S: ['.####', '#....', '.###.', '....#', '####.'], T: ['#####', '..#..', '..#..', '..#..', '..#..'], U: ['#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '.#.#.', '..#..'], W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], X: ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  Y: ['#...#', '.#.#.', '..#..', '..#..', '..#..'], Z: ['#####', '...#.', '..#..', '.#...', '#####'],
  0: ['.###.', '#..##', '#.#.#', '##..#', '.###.'], 1: ['.#.', '##.', '.#.', '.#.', '###'], 2: ['####.', '....#', '.###.', '#....', '#####'], 3: ['####.', '....#', '.###.', '....#', '####.'],
  4: ['#..#.', '#..#.', '#####', '...#.', '...#.'], 5: ['#####', '#....', '####.', '....#', '####.'], 6: ['.###.', '#....', '####.', '#...#', '.###.'], 7: ['#####', '....#', '...#.', '..#..', '..#..'],
  8: ['.###.', '#...#', '.###.', '#...#', '.###.'], 9: ['.###.', '#...#', '.####', '....#', '.###.'],
  '&': ['.##..', '#..#.', '.##.#', '#..#.', '.##.#'], '-': ['.....', '.....', '###..', '.....', '.....'], '.': ['.', '.', '.', '.', '#'], "'": ['#', '#', '.', '.', '.'], ' ': ['..', '..', '..', '..', '..'],
};
const gl = (ch) => GL[ch] ?? GL[' '];
/** The length of a text, in metres, at a cell size. */
export const textLen = (text, cell) => [...text].reduce((s, ch) => s + (gl(ch)[0].length + 1) * cell, 0) - cell;
/** The cell size that fits a text in a width (at most `max`). */
export const fitCell = (text, width, max = 0.08) => Math.min(max, width / ((text.length * 6) - 1));
/** Push the letters of a text as double-sided quads: at(h, v) gives the point at h along the line of writing (left to right) and v up. */
export function letters(T, text, cell, at, h0 = 0, v0 = 0) {
  let h = h0;
  for (const ch of text) {
    const g = gl(ch);
    for (let r = 0; r < 5; r++) {
      const row = g[r];
      for (let c = 0; c < row.length;) {
        if (row[c] !== '#') { c++; continue; }
        let e = c; while (e < row.length && row[e] === '#') e++;
        const v = v0 + (4 - r) * cell, a = at(h + c * cell, v), b = at(h + e * cell, v), c2 = at(h + e * cell, v + cell), d = at(h + c * cell, v + cell);
        T.push(...a, ...b, ...c2, ...a, ...c2, ...d, ...a, ...c2, ...b, ...a, ...d, ...c2);
        c = e;
      }
    }
    h += (g[0].length + 1) * cell;
  }
}
/** A collection of quads by material, added to the bag at the end. */
export class Quads {
  constructor() { this.m = new Map(); }
  t(mat) { let a = this.m.get(mat); if (!a) this.m.set(mat, a = []); return a; }
  /** A double-sided quad of four points in order. */
  quad(mat, a, b, c, d) { this.t(mat).push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); }
  flush(bag) { for (const [mat, t] of this.m) if (t.length) bag.add(mat, fromTriangles(t)); this.m.clear(); }
}

// ── what the shops are called and sell, by district ────────────────────────────────────────────────────────
const NAMES = {
  garment: { sur: ['LEVY', 'COHEN', 'ROSEN', 'KLEIN', 'SILVER', 'BERG', 'GOLD', 'MARKS', 'KAHN', 'SIMON', 'BLOCH', 'FEIN'], trade: [['FABRICS', 'fabric'], ['TRIMMINGS', 'notions'], ['WOOLENS', 'fabric'], ['NOTIONS', 'notions'], ['BUTTONS', 'notions'], ['LADIES COATS', 'dress'], ['DRESSES', 'dress'], ['MILLINERY', 'hat'], ['FURS', 'dress'], ['LININGS', 'fabric'], ['SILKS', 'fabric']] },
  murray: { sur: ['MURPHY', 'ROSSI', 'SCHMIDT', 'DOYLE', 'COSTA', 'BRENNAN', 'FISCHER', 'ROMANO', 'KELLY', 'MEYER', 'LANE'], trade: [['GROCERY', 'deli'], ['DELICATESSEN', 'deli'], ['DRUGS', 'drug'], ['BAKERY', 'bakery'], ['LAUNDRY', 'gen'], ['CLEANERS', 'dress'], ['TAILOR', 'dress'], ['SHOE REPAIR', 'shoe'], ['BARBER', 'gen'], ['CANDY', 'bakery'], ['MEATS', 'deli'], ['FRUITS', 'fruit']] },
  midtown: { sur: ['RUSSELL', 'HARRIS', 'LEWIS', 'MORRIS', 'WALKER', 'KING', 'STONE', 'BAKER', 'WARD'], trade: [['RESTAURANT', 'deli'], ['CIGARS', 'cigar'], ['HATTERS', 'hat'], ['SHOES', 'shoe'], ['HABERDASHER', 'dress'], ['OPTICIAN', 'gen'], ['JEWELER', 'jewel'], ['BANK', 'bank'], ['STATIONERS', 'gen'], ['LUNCH', 'deli'], ['DRUGS', 'drug'], ['BOOKS', 'gen']] },
};
export const districtOf = (x, z) => (x < -10 ? 'garment' : x > 60 && z > -150 ? 'murray' : 'midtown');
const PANE = { drug: ['SODA', 'PRESCRIPTIONS', 'ICE CREAM'], deli: ['LUNCH', 'COFFEE 5 CENTS', 'SANDWICHES'], bakery: ['FRESH BREAD', 'PIES'], shoe: ['REPAIRS', 'HEELS WHILE U WAIT'], cigar: ['CIGARS', 'TOBACCO'], hat: ['HATS', 'CLEANED'], dress: ['SALE', 'TAILORING'], fabric: ['WHOLESALE'], notions: ['WHOLESALE'], fruit: ['FRESH FRUIT'], gen: ['OPEN'], bank: ['SAVINGS'], jewel: ['WATCHES'] };
const BOARD = [['car_black', 'gold'], ['shutter_green', 'paint_white'], ['car_black', 'paint_white'], ['car_blue', 'gold'], ['wood_dark', 'gold'], ['paint_white', 'car_black'], ['stucco_cream', 'car_black'], ['cloth_maroon', 'gold'], ['prussian_blue', 'paint_white']];
const GOODS = {
  drug: ['glaze_blue', 'glaze_green', 'paint_white', 'cloth_red', 'paint_cab_yellow'], deli: ['cloth_red', 'cloth_ochre', 'cloth_brown', 'paint_white', 'cloth_green'], bakery: ['wood_ochre', 'cloth_ochre', 'cloth_brown', 'paint_white'],
  fabric: ['cloth_red', 'cloth_indigo', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_blue', 'cloth_maroon'], notions: ['cloth_red', 'paint_white', 'cloth_blue', 'cloth_ochre', 'cloth_green'],
  dress: ['cloth_black', 'cloth_indigo', 'cloth_red', 'cloth_grey', 'cloth_green', 'cloth_brown'], hat: ['cloth_black', 'cloth_grey', 'cloth_brown', 'cloth_indigo'], shoe: ['cloth_black', 'cloth_brown', 'cloth_brown', 'car_red'],
  cigar: ['wood_ochre', 'cloth_brown', 'car_red', 'paint_white'], fruit: ['cloth_red', 'cloth_green', 'paint_cab_yellow', 'cloth_ochre'], gen: ['paint_white', 'cloth_blue', 'cloth_ochre', 'cloth_grey', 'cloth_red'], jewel: ['gold', 'silver', 'cloth_indigo'], bank: ['paint_white'],
};
/** The name and trade of the nth shop of a front: { text, kind, board: [board material, letter material] }. */
export function shopName(x, z, r) {
  const D = NAMES[districtOf(x, z)], [trade, kind] = D.trade[Math.floor(r() * D.trade.length)], sur = D.sur[Math.floor(r() * D.sur.length)];
  const long = trade.length > 7, text = long || r() < 0.4 ? trade : `${sur} ${trade}`;
  const pn = PANE[kind] ?? [];
  return { text, kind, board: BOARD[Math.floor(r() * BOARD.length)], pane: pn.length && r() < 0.55 ? pn[Math.floor(r() * pn.length)] : null };
}

/** The goods behind a shop window's glass (the gap between the wall and the glass, 0.14 m) as flat cards, shelves and forms. */
function windowGoods(Q, F, g0, g1, y, kind, r) {
  if (kind === 'bank') return;
  const pal = GOODS[kind] ?? GOODS.gen, d = 0.1, yb = y + 0.82, yt = y + 3.1;
  const P = (u, v) => F.P(u, d, v);
  Q.quad('wood_dark', P(g0 + 0.05, yb), P(g1 - 0.05, yb), P(g1 - 0.05, yt), P(g0 + 0.05, yt));                 // the back of the window
  if (kind === 'dress' || kind === 'hat') {
    // forms: a dress form (a skirt, a bust, a stick) or a hat on a stand, spaced along the window
    for (let u = g0 + 0.7; u < g1 - 0.5; u += 0.9 + r() * 0.5) {
      const m = pal[Math.floor(r() * pal.length)];
      if (kind === 'dress') { Q.quad(m, P(u - 0.2, yb + 0.15), P(u + 0.2, yb + 0.15), P(u + 0.12, yb + 1.05), P(u - 0.12, yb + 1.05)); Q.quad('cloth_white', P(u - 0.1, yb + 1.05), P(u + 0.1, yb + 1.05), P(u + 0.09, yb + 1.45), P(u - 0.09, yb + 1.45)); }
      else Q.quad(m, P(u - 0.17, yb + 0.55 + (r() < 0.5 ? 0.4 : 0)), P(u + 0.17, yb + 0.55 + (r() < 0.5 ? 0.4 : 0)), P(u + 0.12, yb + 0.7), P(u - 0.12, yb + 0.7));
      Q.quad('iron', P(u - 0.012, yb), P(u + 0.012, yb), P(u + 0.012, yb + 0.55), P(u - 0.012, yb + 0.55));
    }
    Q.quad('car_red', P(g0 + 0.2, yt - 0.5), P(g0 + 0.8, yt - 0.5), P(g0 + 0.8, yt - 0.25), P(g0 + 0.2, yt - 0.25));      // a price card
    return;
  }
  for (let v = yb + 0.5; v < yt - 0.3; v += 0.62) {
    Q.quad('wood_dark', P(g0 + 0.05, v), P(g1 - 0.05, v), P(g1 - 0.05, v + 0.03), P(g0 + 0.05, v + 0.03));          // a shelf
    for (let u = g0 + 0.15; u < g1 - 0.25;) {
      const w = 0.1 + r() * (kind === 'fabric' ? 0.12 : 0.2), h = (kind === 'fabric' ? 0.45 : 0.1) + r() * 0.3, m = pal[Math.floor(r() * pal.length)];
      if (r() < 0.82) Q.quad(m, P(u, v + 0.03), P(u + w, v + 0.03), P(u + w, v + 0.03 + h), P(u, v + 0.03 + h));
      u += w + 0.03 + r() * 0.08;
    }
  }
  Q.quad('paint_white', P(g0 + 0.3, yb + 0.1), P(g0 + 0.75, yb + 0.1), P(g0 + 0.75, yb + 0.3), P(g0 + 0.3, yb + 0.3));  // a price card
}

/**
 * The dress of one shop on a front face F: its lettered fascia, the goods in its window, the lettering on the glass.
 * u0..u1 the shop's width (the fascia's), g0..g1 its plate glass, y the street. `rand` is the shop's own stream.
 */
export function shopSign(bag, F, u0, u1, y, shop, g0, g1, full, r, glassD = 0.18) {
  const [bm, lm] = shop.board, Q = new Quads();
  // the board over the glass: a painted board standing 5 cm proud of the fascia, framed in a narrow moulding
  const yb = y + 3.72, yt = y + 4.26;
  bag.add(bm, F.R(u0 + 0.05, u1 - 0.05, yb, yt, 0.4, 0.45));
  bag.add('wood_dark', F.R(u0 + 0.02, u1 - 0.02, yt, yt + 0.05, 0.38, 0.47)); bag.add('wood_dark', F.R(u0 + 0.02, u1 - 0.02, yb - 0.05, yb, 0.38, 0.47));
  if (!full) return;
  const rs = F.sg < 0 === (F.along) ? -1 : 1, mid = (u0 + u1) / 2, cell = fitCell(shop.text, u1 - u0 - 0.5, 0.075), tl = textLen(shop.text, cell);
  const at = (d, v0) => (h, v) => F.P(mid - rs * tl / 2 + rs * h, d, v0 + v);
  letters(Q.t(lm), shop.text, cell, at(0.46, yb + (yt - yb - 5 * cell) / 2), 0, 0);
  windowGoods(Q, F, g0, g1, y, shop.kind, r);
  if (shop.pane && g1 - g0 > 2.6) {
    const c2 = fitCell(shop.pane, g1 - g0 - 0.8, 0.05), l2 = textLen(shop.pane, c2), m2 = (g0 + g1) / 2;
    letters(Q.t('paint_white'), shop.pane, c2, (h, v) => F.P(m2 - rs * l2 / 2 + rs * h, glassD + 0.006, y + 2.5 + v), 0, 0);
  }
  Q.flush(bag);
}

/** A face's reading direction (+1: toward +u) — the n and e faces read toward −u, the s and w faces toward +u (seen from the street). */
export const readDir = (f) => (f === 'n' || f === 'e' ? -1 : 1);

/**
 * A vertical blade sign on its bracket (the face F, at u, standing out from d0 to d1, from yb up hh), lettered down both
 * sides, a letter to a line (5x5 cells), the lines read from the top.
 */
export function bladeText(bag, F, f, u, d0, d1, yb, hh, text, lm) {
  const Q = new Quads(), cell = Math.min(0.07, (d1 - d0 - 0.2) / 5), T = Q.t(lm), dc = (d0 + d1) / 2;
  let v = yb + hh - 0.15 - 5 * cell;
  for (const ch of text) {
    if (v < yb + 0.05) break;
    const w = gl(ch)[0].length * cell;
    for (const sd of [-1, 1]) { const k = -readDir(f) * sd; letters(T, ch, cell, (h, vv) => F.P(u + sd * 0.075, dc + k * (h - w / 2), v + vv), 0, 0); }
    v -= 6.4 * cell;
  }
  Q.flush(bag);
}
export { box, lathe, rod };
