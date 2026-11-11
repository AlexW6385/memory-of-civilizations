// The timber-framed houses of Paris about 1250 (docs/settlements/paris.md §5a), registered into the
// `gothic` style as `paris_house`: a stone ground storey with the shop's opening, the counter board
// let down on chains and the shutter above it raised as a pent, the hanging sign on its iron bracket;
// two or three upper storeys of framed timber (posts, studs, braces, sill and plate beams) on joist
// ends and knee-braces, each jetted a little beyond the one below; a gable to the street with its
// bargeboards, hoist beam and attic window; a steep roof of slate or tile; a chimney on the party wall.
// { rect, y, foot, front 'n|s|e|w', seed, storeys, simple? }. The simple form (far tiles) is the mass.

import { STYLES } from '../../core/build.js';
import { box, rod, fromTriangles, lathe } from '../../core/geom.js';
import './index.js';
import { openGround } from './shop-interior.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ST0 = 3.3, ST = 2.75;                         // the stone storey (a shop's opening needs height), the upper storeys

/** The trades of the shop fronts: the sign's board and emblem, what lies on the counter. */
const TRADES = [
  { id: 'baker', board: 'wood_ochre', emblem: 'hide_tan', goods: 'loaves' },
  { id: 'draper', board: 'cloth_red', emblem: 'cloth_white', goods: 'bolts' },
  { id: 'butcher', board: 'paint_ochre', emblem: 'cloth_red', goods: 'meat' },
  { id: 'tavern', board: 'cloth_green', emblem: 'cloth_green', goods: 'jugs' },
  { id: 'goldsmith', board: 'cloth_indigo', emblem: 'gold', goods: 'metal' },
  { id: 'shoemaker', board: 'hide_brown', emblem: 'hide_tan', goods: 'shoes' },
  { id: 'cooper', board: 'wood_dark', emblem: 'timber', goods: 'barrels' },
  { id: 'chandler', board: 'paint_ochre', emblem: 'ivory', goods: 'candles' },
  { id: 'scribe', board: 'cloth_brown', emblem: 'ivory', goods: 'sheets' },
  { id: 'fishmonger', board: 'cloth_blue', emblem: 'hide_white', goods: 'fish' },
];
export const tradeOfSeed = (seed) => TRADES[(seed >>> 3) % TRADES.length].id;

function paris_house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y, f = el.front || 's';
  const along = f === 's' || f === 'n', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const n = Math.max(2, el.storeys || 3), simple = !!el.simple;
  // the house's own frame: u along the front, d into the house from the front (d < 0: over the street)
  const map = (u, d) => (f === 's' ? [x0 + u, z1 - d] : f === 'n' ? [x1 - u, z0 + d] : f === 'e' ? [x1 - d, z0 + u] : [x0 + d, z1 - u]);
  const B = (m, u0, u1, ya, yb, d0, d1) => { const a = map(u0, d0), b = map(u1, d1); bag.add(m, box(Math.min(a[0], b[0]), y + ya, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + yb, Math.max(a[1], b[1]))); };
  const P = (u, yy, d) => { const a = map(u, d); return [a[0], y + yy, a[1]]; };
  const R = (m, a, b, r, seg = 5) => bag.add(m, rod(P(...a), P(...b), r, seg));
  // triangles from local points, oriented away from the centre c
  const solid = (m, tris, c) => {
    const t = [];
    for (const q of tris) t.push(...P(...q[0]), ...P(...q[1]), ...P(...q[2]));
    const cc = P(...c);
    for (let i = 0; i < t.length; i += 9) {
      const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const mx = (t[i] + t[i + 3] + t[i + 6]) / 3 - cc[0], my = (t[i + 1] + t[i + 4] + t[i + 7]) / 3 - cc[1], mz = (t[i + 2] + t[i + 5] + t[i + 8]) / 3 - cc[2];
      if (nx * mx + ny * my + nz * mz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
    }
    bag.add(m, fromTriangles(t));
  };
  const J = 0.3 + rand() * 0.12, jet = (s) => J * s;           // storey s (1…) overhangs the one below by J
  const trade = TRADES[(el.seed >>> 3) % TRADES.length];

  // ── the stone storey and the footing
  const OPEN = !!el.open && !simple;
  if (!OPEN) {
    { const a = map(-0.1, -0.1), b = map(L + 0.1, D + 0.1); bag.add('limestone', box(Math.min(a[0], b[0]), el.foot - 0.6, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + ST0, Math.max(a[1], b[1]))); }
    col.rect([x0, z0, x1, z1], el.foot - 0.6, y + ST0 + (n - 1) * ST);
  } else col.rect([x0, z0, x1, z1], y + ST0, y + ST0 + (n - 1) * ST);

  // ── the upper storeys: a plaster mass, each jetted
  let top = ST0;
  for (let s = 1; s < n; s++) { B('lime_plaster', 0, L, top, top + ST, -jet(s), D); top += ST; }
  const jt = jet(n - 1), ye = top;                              // the top storey's front face, the eaves
  // the roof
  const p = 1.28 + rand() * 0.2, o = 0.32, yr = ye + (L / 2 + o) * p - 0.0, dF = -jt - 0.36, dB = D + 0.3, roof = rand() < 0.55 ? 'slate' : 'roof_tile';
  const yE = (u) => ye + (u < L / 2 ? -u : u - L) * -p;        // roof surface above u (ridge at L/2)
  void yE;
  for (const side of [0, 1]) {
    const ue = side ? L + o : -o, um = L / 2, ya = ye - o * p, th = 0.1;
    const a = [ue, ya, dF], b = [ue, ya, dB], c = [um, yr - 0.0, dB], d = [um, yr, dF];
    // the slab: its top face (roof) and, under it, the eaves board and the edges (timber)
    const q = [a, b, c, d], lo = q.map(([u, yy, dd]) => [u, yy - th, dd]);
    const cen = [(ue + um) / 2, (ya + yr) / 2 - th / 2, (dF + dB) / 2];
    solid(roof, [[q[0], q[1], q[2]], [q[0], q[2], q[3]]], cen);
    solid('timber', [[lo[0], lo[2], lo[1]], [lo[0], lo[3], lo[2]], [q[0], lo[1], q[1]], [q[0], lo[0], lo[1]], [q[3], q[2], lo[2]], [q[3], lo[2], lo[3]], [q[0], q[3], lo[3]], [q[0], lo[3], lo[0]], [q[1], lo[1], lo[2]], [q[1], lo[2], q[2]]], cen);
  }
  bag.add('roof_ridge', (() => { const a = P(L / 2, 0, dF), b = P(L / 2, 0, dB); return box(Math.min(a[0], b[0]) - (along ? 0.13 : 0), y + yr - 0.07, Math.min(a[2], b[2]) - (along ? 0 : 0.13), Math.max(a[0], b[0]) + (along ? 0.13 : 0), y + yr + 0.13, Math.max(a[2], b[2]) + (along ? 0 : 0.13)); })());
  // the gable on the street: a plaster triangle in the plane of the top storey's face
  solid('lime_plaster', [[[0, ye, -jt], [L, ye, -jt], [L / 2, yr - 0.14, -jt]], [[0, ye, -jt + 0.18], [L / 2, yr - 0.14, -jt + 0.18], [L, ye, -jt + 0.18]], [[0, ye, -jt], [L / 2, yr - 0.14, -jt], [L / 2, yr - 0.14, -jt + 0.18]], [[0, ye, -jt], [L / 2, yr - 0.14, -jt + 0.18], [0, ye, -jt + 0.18]], [[L, ye, -jt], [L, ye, -jt + 0.18], [L / 2, yr - 0.14, -jt + 0.18]], [[L, ye, -jt], [L / 2, yr - 0.14, -jt + 0.18], [L / 2, yr - 0.14, -jt]]], [L / 2, ye + 1, -jt + 0.09]);
  // a stone chimney on the party wall
  if (rand() < 0.45) {
    const u = rand() < 0.5 ? 0.3 : L - 0.3, dd = D * (0.5 + rand() * 0.2), up = ye + (L / 2 - Math.abs(u - L / 2)) * p + 1.3;
    B('limestone', u - 0.32, u + 0.32, ye - 0.3, up, dd - 0.32, dd + 0.32); B('limestone', u - 0.4, u + 0.4, up, up + 0.14, dd - 0.4, dd + 0.4);
  }
  if (simple) {
    // the door and the shop's opening only
    B('opening', 0.5, Math.min(L - 0.5, 3), 0.1, 2.7, -0.02, 0.05);
    return;
  }

  // ── detail on the street front
  // the stone storey: the shop's opening, framed, with its counter board, shutter and sign; the door beside it
  const doorL = rand() < 0.5, ws = Math.max(2.2, Math.min(4.0, L - 1.7)), su = doorL ? L - 0.35 - ws : 0.35, du = doorL ? 0.3 : L - 1.2;
  const lintel = 2.75;
  if (OPEN) openGround({ bag, col, rect: el.rect, y, foot: el.foot, f, L, D, st: ST0, su, ws, du, doorL, trade: trade.id, seed: el.seed });
  else B('opening', su, su + ws, 0.12, lintel, -0.03, 0.05);
  for (const u of [su - 0.2, su + ws]) B('timber', u, u + 0.2, 0, lintel + 0.3, -0.14, 0.06);                 // the posts
  B('timber', su - 0.2, su + ws + 0.2, lintel, lintel + 0.32, -0.18, 0.08);                                 // the head beam
  B('limestone', su - 0.35, su + ws + 0.35, 0, 0.18, -0.12, 0.06);                                          // the step/stall-riser
  // the counter: the lower shutter let down, held by two chains; the upper raised as a pent roof
  B('timber', su, su + ws, 0.92, 0.98, -0.78, -0.04);
  for (const u of [su + 0.08, su + ws - 0.08]) R('iron', [u, 2.15, -0.04], [u, 0.98, -0.74], 0.008, 3);
  if (!OPEN) B('timber', su - 0.04, su + ws + 0.04, 0.12, 0.92, -0.06, -0.02);                              // the board's outer face, shut against the riser
  B('wood_dark', su, su + ws, 2.38, 2.45, -0.8, -0.1);
  for (const u of [su + 0.06, su + ws - 0.06]) R('iron', [u, 2.38, -0.8], [u, 2.72, -0.1], 0.008, 3);
  goods(trade.goods, B, R, su, ws, 0.98, rand);
  // the door: boards under a pointed head, an iron ring
  if (!OPEN) { B('opening', du - 0.02, du + 1.0, 0.0, 2.35, -0.02, 0.05); B('wood_dark', du, du + 0.96, 0.0, 2.3, -0.06, -0.02); }
  B('limestone', du - 0.12, du + 1.12, 2.3, 2.52, -0.1, 0.06);
  R('iron', [du + 0.78, 1.1, -0.07], [du + 0.78, 1.1, -0.065], 0.07, 8);
  // the sign on its iron bracket from the stone storey's wall, over the door or the shop
  { const su2 = trade.id === 'tavern' ? du + 0.5 : su + ws * 0.5, sy = 3.0;
    R('iron', [su2, sy, 0.0], [su2, sy, -1.15], 0.018, 4); R('iron', [su2, sy - 0.5, -0.02], [su2, sy, -0.8], 0.012, 4);
    if (trade.id === 'tavern') { bag.add('cloth_green', lathe([[0.001, 0], [0.22, 0.12], [0.3, 0.35], [0.2, 0.6], [0.001, 0.66]], 8, null, ...P(su2, sy - 0.62, -1.15).map((v, i) => (i === 1 ? 0 : v)))); }
    else {
      B(trade.board, su2 - 0.02, su2 + 0.02, sy - 0.62, sy - 0.12, -1.12, -0.58);
      B(trade.emblem, su2 - 0.03, su2 + 0.03, sy - 0.5, sy - 0.26, -1.0, -0.74);
    }
  }

  // each upper storey's frame and windows
  let yb = ST0;
  for (let s = 1; s < n; s++) {
    const jf = jet(s), jl = jet(s - 1), dd = -jf - 0.07, last = s === n - 1;
    // the bressummer (the sill beam on the joist ends), the plate beam, the corner posts
    B('timber', -0.03, L + 0.03, yb, yb + 0.27, dd, -jf + 0.02);
    B('timber', -0.03, L + 0.03, yb + ST - 0.17, yb + ST, dd, -jf + 0.02);
    for (const u of [-0.03, L - 0.17]) B('timber', u, u + 0.2, yb, yb + ST, dd, -jf + 0.02);
    // the joist ends and the soffit under the jetty, the knee braces at the corners
    B('timber', 0, L, yb - 0.04, yb, -jf, -jl);
    for (let u = 0.4; u < L - 0.3; u += 0.55) B('timber', u - 0.07, u + 0.07, yb - 0.24, yb - 0.04, -jf + 0.04, -jl);
    for (const u of [0.1, L - 0.1]) R('timber', [u, yb - 1.0 + (s === 1 ? 0 : 0), -jl], [u, yb - 0.04, -jf + 0.1], 0.065, 5);
    // windows and the posts between them
    const nw = Math.max(1, Math.floor((L - 0.4) / 2.0)), sp = L / nw;
    for (let k = 0; k < nw; k++) {
      const uc = (k + 0.5) * sp, ww = 0.95, hw = 1.2, ya = yb + 0.78;
      if (k > 0) B('timber', k * sp - 0.065, k * sp + 0.065, yb + 0.27, yb + ST - 0.17, dd, -jf + 0.02);
      // the opening in two lights with a transom (the glass or oiled cloth dark), its frame and sill; the shutters
      B('timber', uc - ww / 2 - 0.09, uc + ww / 2 + 0.09, ya - 0.12, ya + hw + 0.1, dd + 0.01, -jf + 0.02);
      B('opening', uc - ww / 2, uc + ww / 2, ya, ya + hw, dd - 0.02, -jf + 0.03);
      B('timber', uc - 0.03, uc + 0.03, ya, ya + hw, dd - 0.03, -jf);
      B('timber', uc - ww / 2, uc + ww / 2, ya + hw * 0.62, ya + hw * 0.62 + 0.05, dd - 0.03, -jf);
      B('timber', uc - ww / 2 - 0.12, uc + ww / 2 + 0.12, ya - 0.2, ya - 0.1, dd - 0.1, -jf);              // the sill
      const open = rand();
      for (const sg of [-1, 1]) {
        const ue = uc + sg * (ww / 2 + 0.01);
        if (open < 0.4) B('wood_dark', ue, ue + sg * 0.04, ya, ya + hw, dd - 0.5, dd - 0.02);               // opened out against the wall's face
        else if (open < 0.75) { const e = ue + sg * 0.1; B('wood_dark', Math.min(e, e + sg * 0.45), Math.max(e, e + sg * 0.45), ya, ya + hw, dd - 0.06, dd - 0.02); }
        else B('wood_dark', Math.min(ue, ue - sg * ww / 2), Math.max(ue, ue - sg * ww / 2), ya, ya + hw, dd - 0.06, dd - 0.02);
      }
      // St Andrew's cross under the sill in the plaster panel between the beam and the window
      if (!last || true) { const ua = uc - ww / 2 - 0.1, ub = uc + ww / 2 + 0.1, y0 = yb + 0.3, y1 = ya - 0.22; if (y1 - y0 > 0.3) { R('timber', [ua, y0, dd - 0.01], [ub, y1, dd - 0.01], 0.032, 4); R('timber', [ub, y0, dd - 0.01], [ua, y1, dd - 0.01], 0.032, 4); } }
      // a brace from the beam over the window up to the plate, on alternate bays
      if (k % 2 === 0) R('timber', [uc - ww / 2 - 0.3, yb + ST - 0.17, dd - 0.01], [uc - ww / 2 - 0.1, ya + hw + 0.1, dd - 0.01], 0.04, 4);
    }
    yb += ST;
  }
  // the flanks that a ruelle or the row's end leaves in view: the same frame (sill and plate beams, posts, a window and a brace)
  for (const [side, ex] of [[0, el.flank?.[0] ?? false], [1, el.flank?.[1] ?? false]]) {
    if (!ex) continue;
    const ua = side ? L : -0.07, ub = side ? L + 0.07 : 0.0, sg = side ? 1 : -1;
    let yy = ST0;
    for (let s = 1; s < n; s++) {
      const d0 = s === 1 ? -jet(s) : -jet(s);
      B('timber', ua, ub, yy, yy + 0.24, d0 - 0.0, D); B('timber', ua, ub, yy + ST - 0.16, yy + ST, d0, D);
      for (const dd of [d0, D * 0.34, D * 0.67, D - 0.14]) B('timber', ua, ub, yy + 0.24, yy + ST - 0.16, dd, dd + 0.14);
      const dw = D * 0.5 - 0.45, ya = yy + 0.8;
      B('timber', sg > 0 ? L : -0.09, sg > 0 ? L + 0.09 : 0, ya - 0.1, ya + 1.28, dw - 0.1, dw + 1.0);
      B('opening', sg > 0 ? L : -0.11, sg > 0 ? L + 0.11 : 0, ya, ya + 1.1, dw, dw + 0.8);
      R('timber', [sg > 0 ? L + 0.035 : -0.035, yy + 0.24, d0 + 0.14], [sg > 0 ? L + 0.035 : -0.035, ya - 0.1, dw - 0.3], 0.04, 4);
      yy += ST;
    }
  }
  // weathering and eye-level dressing (a separate stream: the house's own draws stay as they were)
  { const r2 = rng((el.seed || 1) + 5);
    // rising damp and splash at the foot of the stone storey, soot and rain streaks under the sills and the eaves
    for (let u = 0.1; u < L - 0.5;) { const w = 0.5 + r2() * 1.1; B('plaster_damp', u, Math.min(L - 0.1, u + w), 0, 0.35 + r2() * 0.4, -0.115, -0.1); u += w + r2() * 0.9; }
    let yq = ST0;
    for (let s = 1; s < n; s++) {
      const jf = jet(s), nw = Math.max(1, Math.floor((L - 0.4) / 2.0)), sp = L / nw;
      for (let k = 0; k < nw; k++) if (r2() < 0.7) { const uc = (k + 0.5) * sp + (r2() - 0.5) * 0.2; B('plaster_streak', uc - 0.3, uc + 0.3, yq + 0.3, yq + 0.72, -jf - 0.085, -jf - 0.075); }
      yq += ST;
    }
    // the corner lantern on its iron bracket, the stone gargoyle spout at the eaves, a pot of herbs or a cage at a window
    if (r2() < 0.55) { const u = r2() < 0.5 ? 0.12 : L - 0.12; R('iron', [u, 2.9, -0.1], [u, 2.9, -0.7], 0.014, 4); B('glass_lamp', u - 0.09, u + 0.09, 2.45, 2.85, -0.8, -0.62); B('iron', u - 0.1, u + 0.1, 2.85, 2.9, -0.82, -0.6); }
    if (r2() < 0.5) { const u = r2() < 0.5 ? 0.3 : L - 0.3; B('limestone', u - 0.08, u + 0.08, ye - 0.38, ye - 0.2, -jt - 0.55, -jt); }
    if (n > 2 && r2() < 0.45) { const uc = L * (0.3 + r2() * 0.4), ya2 = ST0 + ST + 0.55; B('timber', uc - 0.35, uc + 0.35, ya2, ya2 + 0.18, -jet(1) - 0.34, -jet(1) - 0.08); for (let k = -1; k <= 1; k++) bag.add(['terracotta', 'pottery_dark'][k & 1], lathe([[0.05, 0], [0.08, 0.1], [0.07, 0.17], [0.001, 0.17]], 7, null, ...P(uc + k * 0.2, ya2 + 0.18, -jet(1) - 0.2).map((v, i) => v))); }
    // the doorstep: a worn stone, and a boot-scraper
    if (r2() < 0.8) B('limestone', du - 0.1, du + 1.1, 0, 0.1, -0.5, -0.1);
  }
  // the gable's frame and its attic window, the hoist beam with its pulley
  const gd = -jt - 0.06, gw = Math.min(0.9, L * 0.2);
  B('timber', 0, L, ye, ye + 0.16, gd, -jt + 0.02);
  R('timber', [0, ye, gd], [L / 2, yr - 0.14, gd], 0.06, 5); R('timber', [L, ye, gd], [L / 2, yr - 0.14, gd], 0.06, 5);
  R('timber', [0, ye, dF + 0.02], [L / 2 - 0.02, yr + 0.02, dF + 0.02], 0.05, 5); R('timber', [L, ye, dF + 0.02], [L / 2 + 0.02, yr + 0.02, dF + 0.02], 0.05, 5);   // the bargeboards on the slab's edge
  const ga = ye + 0.8;
  B('timber', L / 2 - gw / 2 - 0.08, L / 2 + gw / 2 + 0.08, ga - 0.08, ga + 0.78, gd - 0.01, -jt + 0.02);
  B('opening', L / 2 - gw / 2, L / 2 + gw / 2, ga, ga + 0.7, gd - 0.03, -jt + 0.03);
  B('timber', L / 2 - 0.03, L / 2 + 0.03, ga, ga + 0.7, gd - 0.04, -jt);
  for (const u of [L * 0.25, L * 0.75]) R('timber', [u, ye + 0.15, gd - 0.01], [u, ye + (L / 2 - Math.abs(u - L / 2)) * p - 0.3, gd - 0.01], 0.035, 4);
  if (rand() < 0.65) { B('timber', L / 2 - 0.06, L / 2 + 0.06, yr - 0.52, yr - 0.4, gd - 1.0, -jt + 0.1); R('iron', [L / 2, yr - 0.6, gd - 0.95], [L / 2, yr - 0.6, gd - 0.9], 0.07, 8); }
}

/** What lies on the counter, by trade (small things: they are fine detail). */
function goods(kind, B, R, su, ws, yc, rand) {
  const u0 = su + 0.2, u1 = su + ws - 0.2;
  for (let u = u0; u < u1; u += 0.34) {
    const k = rand();
    if (kind === 'loaves') B('hide_tan', u, u + 0.26, yc + 0.06, yc + 0.17, -0.55 - rand() * 0.15, -0.3);
    else if (kind === 'bolts') B(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white'][Math.floor(k * 5)], u, u + 0.28, yc + 0.06, yc + 0.34, -0.7, -0.35);
    else if (kind === 'meat') { R('iron', [u, 2.3, -0.5], [u, 1.75, -0.5], 0.012, 3); B('cloth_red', u - 0.07, u + 0.07, 1.45, 1.75, -0.56, -0.44); B('hide_white', u - 0.07, u + 0.07, 1.35, 1.45, -0.56, -0.44); }
    else if (kind === 'jugs') B('pottery_dark', u, u + 0.16, yc + 0.06, yc + 0.34, -0.5, -0.34);
    else if (kind === 'metal') B(k < 0.5 ? 'silver' : 'gold', u, u + 0.12, yc + 0.06, yc + 0.2, -0.5, -0.38);
    else if (kind === 'shoes') B('hide_brown', u, u + 0.12, yc + 0.06, yc + 0.16, -0.6, -0.36);
    else if (kind === 'barrels') { B('timber', u, u + 0.28, yc + 0.06, yc + 0.34, -0.62, -0.34); }
    else if (kind === 'candles') R('ivory', [u, yc + 0.06, -0.5], [u, yc + 0.32, -0.5], 0.018, 4);
    else if (kind === 'sheets') B('ivory', u, u + 0.3, yc + 0.06, yc + 0.08 + (k * 0.06), -0.7, -0.4);
    else if (kind === 'fish') B('silver', u, u + 0.26, yc + 0.06, yc + 0.12, -0.7, -0.4 - k * 0.1);
  }
}

/** Where the house's chimney stands, as a world point [x, y, z] at its top, or null (the same random draws as the house). */
export function chimneyAt(el) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 's' || f === 'n';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0, n = Math.max(2, el.storeys || 3);
  rand(); const p = 1.28 + rand() * 0.2; rand();
  if (!(rand() < 0.45)) return null;
  const u = rand() < 0.5 ? 0.3 : L - 0.3, dd = D * (0.5 + rand() * 0.2), up = ST0 + (n - 1) * ST + (L / 2 - Math.abs(u - L / 2)) * p + 1.44;
  const [x, z] = f === 's' ? [x0 + u, z1 - dd] : f === 'n' ? [x1 - u, z0 + dd] : f === 'e' ? [x1 - dd, z0 + u] : [x0 + dd, z1 - u];
  return [x, el.y + up, z];
}
/** Where a customer stands at the shop's counter: { at [x, z], out [dx, dz], trade } (the same random draws as the house). */
export function shopPoint(el) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, f = el.front || 's', along = f === 's' || f === 'n';
  const L = along ? x1 - x0 : z1 - z0;
  rand(); rand(); rand();
  if (rand() < 0.45) { rand(); rand(); }
  const doorL = rand() < 0.5, ws = Math.max(2.2, Math.min(4.0, L - 1.7)), su = doorL ? L - 0.35 - ws : 0.35, u = su + ws / 2, d = -1.45;
  const at = f === 's' ? [x0 + u, z1 - d] : f === 'n' ? [x1 - u, z0 + d] : f === 'e' ? [x1 - d, z0 + u] : [x0 + d, z1 - u];
  const out = f === 's' ? [0, 1] : f === 'n' ? [0, -1] : f === 'e' ? [1, 0] : [-1, 0];
  const di = 1.6, inside = f === 's' ? [x0 + u, z1 - di] : f === 'n' ? [x1 - u, z0 + di] : f === 'e' ? [x1 - di, z0 + u] : [x0 + di, z1 - u];
  return { at, out, inside, trade: TRADES[(el.seed >>> 3) % TRADES.length].id };
}
STYLES.gothic.elements.paris_house = paris_house;
