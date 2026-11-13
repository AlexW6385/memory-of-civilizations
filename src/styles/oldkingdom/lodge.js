// The ordinary buildings of the plateau (docs/settlements/giza.md §15): what the king's works put up beside the gangs' camps — the
// overseers' lodgings, the scribes' tally house, the tool and rope store, the masons' workshops, the grain store, the lector priest's
// house. Each is a room of mudbrick with a doorway you walk through, a lamp, and the things of its trade; each has its own front.
// ok_lodge { rect: [x0, z0, x1, z1], kind: 'lodging' | 'scribe' | 'store' | 'workshop' | 'granary' | 'priest', door: 's'|'n'|'e'|'w', seed, y }
// The rect is the outside of the walls; the door is in the wall on the named side, in the middle.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const JAR = [[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]];
const BEER = [[0.04, 0], [0.12, 0.08], [0.17, 0.35], [0.14, 0.62], [0.07, 0.72], [0.08, 0.76], [0.001, 0.76]];
const ROLL = [[0.001, 0], [0.04, 0], [0.04, 0.34], [0.001, 0.34]];

/** The building's own frame: u along the door wall, v from the back wall (0) to the door wall (D); turned to the named side. */
class Frame {
  constructor(rect, door, bag, col, y0) {
    const [x0, z0, x1, z1] = rect;
    Object.assign(this, { x0, z0, x1, z1, door, bag, col, y0 });
    this.W = door === 's' || door === 'n' ? x1 - x0 : z1 - z0;
    this.D = door === 's' || door === 'n' ? z1 - z0 : x1 - x0;
  }
  pt(u, v) {
    const { x0, z0, x1, z1 } = this;
    switch (this.door) {
      case 's': return [x0 + u, z0 + v];
      case 'n': return [x1 - u, z1 - v];
      case 'e': return [x0 + v, z0 + u];
      default: return [x1 - v, z1 - u];
    }
  }
  /** an axis-aligned box in the frame (the frame is turned in quarters only) */
  B(mat, u0, v0, u1, v1, y0, y1) {
    const [ax, az] = this.pt(u0, v0), [bx, bz] = this.pt(u1, v1);
    this.bag.add(mat, box(Math.min(ax, bx), this.y0 + y0, Math.min(az, bz), Math.max(ax, bx), this.y0 + y1, Math.max(az, bz)));
  }
  C(u0, v0, u1, v1, y0, y1) {
    const [ax, az] = this.pt(u0, v0), [bx, bz] = this.pt(u1, v1);
    this.col.rect([Math.min(ax, bx), Math.min(az, bz), Math.max(ax, bx), Math.max(az, bz)], this.y0 + y0, this.y0 + y1);
  }
  S(mat, u0, v0, u1, v1, y0, y1) { this.B(mat, u0, v0, u1, v1, y0, y1); this.C(u0, v0, u1, v1, y0, y1); }
  L(mat, prof, u, v, y = 0, seg = 9) { const [x, z] = this.pt(u, v); this.bag.add(mat, lathe(prof, seg, null, x, this.y0 + y, z)); }
  beam(arr, a, b, w, h) { const p = this.pt(a[0], a[1]), q = this.pt(b[0], b[1]); beamTris(arr, [p[0], this.y0 + a[2], p[1]], [q[0], this.y0 + b[2], q[1]], w, h); }
  post(mat, u, v, y0, y1, r = 0.07) { this.L(mat, [[r * 1.1, y0], [r, y0 + 0.1], [r * 0.9, y1], [0.001, y1]], u, v, 0, 7); this.C(u - r, v - r, u + r, v + r, y0, y1); }
  floorRoof(h) { const [x0, z0, x1, z1] = [this.x0, this.z0, this.x1, this.z1]; this.col.floor([x0, z0, x1, z1], this.y0 + h); }
  lamp(u, v, y, lights, color = '#ffc98a') {
    this.L('bronze', [[0.1, 0], [0.04, 0.05], [0.035, y - 0.3], [0.09, y - 0.22], [0.1, y - 0.18]], u, v, 0, 8);
    this.L('flame', [[0.001, 0], [0.03, 0.02], [0.001, 0.1]], u, v, y - 0.18, 6);
    const [x, z] = this.pt(u, v); lights?.push({ at: [x, this.y0 + y + 0.15, z], color, intensity: 3, distance: 7 });
  }
}

/** Walls with a doorway of width dw in the middle of the front, a limestone sill, a timber lintel; returns the inner extents. */
function shell(F, { th = 0.5, h, mat = 'mudbrick', upper = null, dw = 1.0, dh = 1.95, plinth = null }) {
  const { W, D } = F, uc = W / 2;
  const mw = (m, u0, v0, u1, v1, y0, y1) => F.S(m, u0, v0, u1, v1, y0, y1);
  const lower = plinth ? 0.6 : 0;
  F.plinth = !!plinth;
  // the walls: the back and the sides run past the corners, the front's two leaves stop against the sides (nothing in one plane)
  mw(mat, -th / 2, -th / 2, W + th / 2, th / 2, 0, h);
  mw(mat, -th / 2, th / 2, th / 2, D - th / 2, 0, h);
  mw(mat, W - th / 2, th / 2, W + th / 2, D - th / 2, 0, h);
  mw(mat, th / 2, D - th / 2, uc - dw / 2, D + th / 2, 0, h);
  mw(mat, uc + dw / 2, D - th / 2, W - th / 2, D + th / 2, 0, h);
  if (plinth) { for (const [u0, v0, u1, v1] of [[-th / 2 - 0.05, -th / 2 - 0.05, W + th / 2 + 0.05, -th / 2], [-th / 2 - 0.05, th / 2, -th / 2, D - th / 2], [W + th / 2, th / 2, W + th / 2 + 0.05, D - th / 2]]) F.B(plinth, u0, v0, u1, v1, 0, lower); }
  F.B('mud_plaster', uc - dw / 2 - 0.02, D - th / 2 + 0.01, uc + dw / 2 + 0.02, D + th / 2 - 0.01, dh + 0.17, h - 0.01);
  F.B('timber', uc - dw / 2 - 0.2, D - th / 2 - 0.03, uc + dw / 2 + 0.2, D + th / 2 + 0.03, dh, dh + 0.17);
  F.B('limestone_core', uc - dw / 2 + 0.01, D - th / 2 - 0.05, uc + dw / 2 - 0.01, D + th / 2 + 0.05, -0.05, 0.07);
  void upper;
  return { th, uc, dw, dh, i0: th / 2, i1: W - th / 2, j0: th / 2, j1: D - th / 2 };
}
/** A roof of palm logs and mud on the walls: logs seen from beneath inside, mud over, a parapet or not. */
function flatRoof(F, h, { th = 0.5, parapet = 0.2, over = 0.22, spout = true } = {}) {
  const { W, D } = F, logs = [];
  for (let u = th / 2 + 0.12; u < W - th / 2 - 0.05; u += 0.26) F.beam(logs, [u, th / 2, h - 0.12], [u, D - th / 2, h - 0.12], 0.1, 0.12);
  F.bag.add('palm_trunk', fromTriangles(logs));
  F.B('timber', -th / 2 - over, -th / 2 - over, W + th / 2 + over, D + th / 2 + over, h, h + 0.12);
  F.B('mud_plaster', -th / 2 - over, -th / 2 - over, W + th / 2 + over, D + th / 2 + over, h + 0.12, h + 0.3);
  if (parapet) {
    const a = -th / 2 - over, b = W + th / 2 + over, c = D + th / 2 + over, p = parapet;
    F.B('mud_plaster', a, a, b, a + p, h + 0.3, h + 0.3 + p + 0.05);
    F.B('mud_plaster', a, c - p, b, c, h + 0.3, h + 0.3 + p + 0.05);
    F.B('mud_plaster', a, a + p, a + p, c - p, h + 0.3, h + 0.3 + p + 0.05);
    F.B('mud_plaster', b - p, a + p, b, c - p, h + 0.3, h + 0.3 + p + 0.05);
  }
  if (spout) F.B('timber', W * 0.35 - 0.06, D + th / 2 + over, W * 0.35 + 0.06, D + th / 2 + over + 0.5, h + 0.2, h + 0.27);
  F.floorRoof(h + 0.3);
}
/** The lane's wear: dirt on the foot of the walls, the plaster fallen in patches, rain streaks under the eaves. */
function wear(F, rand, h, th = 0.5, doorU = null, dw = 1.0) {
  const { W, D } = F, e = 0.012;
  if (!F.plinth) for (const [u0, v0, u1, v1] of [[-th / 2 - e, -th / 2 - e, W + th / 2 + e, -th / 2 + 0.003], [-th / 2 - e, -th / 2 + 0.004, -th / 2 + 0.003, D + th / 2 - 0.004], [W + th / 2 - 0.003, -th / 2 + 0.004, W + th / 2 + e, D + th / 2 - 0.004]]) F.B('banco_rough', u0, v0, u1, v1, -0.05, 0.4 + rand() * 0.2);
  for (let k = 0, n = 2 + Math.floor(rand() * 3); k < n; k++) {
    const face = Math.floor(rand() * 3), w = 0.5 + rand() * 0.7, hh = 0.4 + rand() * 0.6, v = 0.7 + rand() * 0.8, u = 0.1 + rand() * 0.8;
    if (face === 0) F.B('mudbrick', u * (W - w), -th / 2 - 0.03, u * (W - w) + w, -th / 2 - 0.02, v, v + hh);
    else if (face === 1) F.B('mudbrick', -th / 2 - 0.03, u * (D - w), -th / 2 - 0.02, u * (D - w) + w, v, v + hh);
    else F.B('mudbrick', W + th / 2 + 0.02, u * (D - w), W + th / 2 + 0.03, u * (D - w) + w, v, v + hh);
  }
  for (let k = 0, n = 2 + Math.floor(rand() * 2); k < n; k++) {
    const hh = 0.7 + rand() * 0.8, u = 0.1 + rand() * 0.8, face = Math.floor(rand() * 2);
    if (face === 0) F.B('plaster_streak', u * (W - 0.2), -th / 2 - 0.04, u * (W - 0.2) + 0.12, -th / 2 - 0.03, h - hh, h);
    else F.B('plaster_streak', -th / 2 - 0.04, u * (D - 0.2), -th / 2 - 0.03, u * (D - 0.2) + 0.12, h - hh, h);
  }
  void doorU; void dw;
}
const slit = (F, u, v, along, y = 2.0, h = 0.25, w = 0.5) => {
  const [a, b] = along === 'u' ? [w, 0.03] : [0.03, w];
  F.B('pottery_dark', u - a / 2, v - b / 2, u + a / 2, v + b / 2, y, y + h);
  F.B('timber', u - a / 2 - (along === 'u' ? 0.08 : 0), v - b / 2 - (along === 'u' ? 0 : 0.08), u + a / 2 + (along === 'u' ? 0.08 : 0), v + b / 2 + (along === 'u' ? 0 : 0.08), y + h, y + h + 0.07);
};
const jar = (F, u, v, y = 0, s = 1, mat = 'terracotta', prof = JAR) => F.L(mat, prof.map(([r, h]) => [r * s, h * s]), u, v, y, 9);
const waterStand = (F, u, v) => { F.L('mudbrick', [[0.26, 0], [0.26, 0.3], [0.17, 0.33], [0.001, 0.33]], u, v, 0, 10); jar(F, u, v, 0.3, 1.15); F.C(u - 0.27, v - 0.27, u + 0.27, v + 0.27, 0, 0.9); };
const mat = (F, u, v, w, d, y = 0) => F.B('reed_mat', u - w / 2, v - d / 2, u + w / 2, v + d / 2, y, y + 0.025);
const headrest = (F, u, v, y = 0) => F.B('limestone_carved', u - 0.12, v - 0.08, u + 0.12, v + 0.08, y, y + 0.14);

// ── the kinds ────────────────────────────────────────────────────────────────

/** The overseer's lodging: whitewashed, a flat roof with a parapet and a shade, slits, a bench and the water jar at the door; a bed on a platform, a chest, a table, jars. */
function lodging(F, el, lights) {
  const rand = rng((el.seed || 1) * 5 + 1), h = 2.9 + rand() * 0.3, { W, D } = F;
  const S = shell(F, { h, mat: 'plaster_white', plinth: 'mudbrick' });
  const uc = S.uc;
  F.B('limestone_core', uc - 0.62, D + 0.25, uc + 0.62, D + 0.67, 0, 0.1);                     // the doorstep
  F.S('mud_plaster', uc + 0.85, D + 0.25, uc + 2.35, D + 0.65, 0, 0.4);                         // a bench by the door
  jar(F, uc + 1.2, D + 0.45, 0.4, 0.55); mat(F, uc + 1.85, D + 0.45, 0.7, 0.3, 0.4);
  waterStand(F, uc - 1.05, D + 0.45);
  for (const t of [0.28, 0.72]) slit(F, W * t, -S.th / 2 - 0.012, 'u');
  for (const t of [0.4]) { slit(F, -S.th / 2 - 0.012, D * t, 'v'); slit(F, W + S.th / 2 + 0.012, D * t, 'v'); }
  flatRoof(F, h);
  // a reed shade on poles on the roof
  F.post('palm_trunk', 1.0, 1.0, h + 0.3, h + 2.0, 0.04); F.post('palm_trunk', 2.6, 1.0, h + 0.3, h + 2.0, 0.04);
  F.B('reed_mat', 0.7, 0.6, 2.9, 1.6, h + 2.0, h + 2.06);
  wear(F, rand, h);
  // inside: the sleeping platform with its mat and headrest in the back-left corner, a chest, a low table with bread and a bowl, jars along the right wall
  F.S('mud_plaster', S.i0, S.j0, S.i0 + 2.1, S.j0 + 1.0, 0, 0.42); mat(F, S.i0 + 1.05, S.j0 + 0.5, 1.9, 0.85, 0.42); headrest(F, S.i0 + 0.3, S.j0 + 0.5, 0.445);
  F.S('timber', S.i1 - 1.1, S.j0 + 0.05, S.i1 - 0.1, S.j0 + 0.65, 0, 0.55); F.B('limestone_core', S.i1 - 1.05, S.j0 + 0.2, S.i1 - 0.15, S.j0 + 0.28, 0.55, 0.56);
  F.S('timber', uc - 0.5, 1.7, uc + 0.5, 2.3, 0.22, 0.3); F.C(uc - 0.5, 1.7, uc + 0.5, 2.3, 0, 0.3);
  F.L('terracotta', [[0.001, 0.3], [0.16, 0.31], [0.2, 0.4], [0.001, 0.4]], uc - 0.1, 2.0, 0, 9); F.L('cloth_ochre', [[0.001, 0.3], [0.12, 0.31], [0.06, 0.36], [0.001, 0.37]], uc + 0.2, 1.95, 0, 7);
  for (let k = 0; k < 3; k++) { jar(F, S.i1 - 0.35, S.j0 + 1.2 + k * 0.5, 0, 1.0, k === 1 ? 'pottery_dark' : 'terracotta'); }
  F.C(S.i1 - 0.6, S.j0 + 0.95, S.i1, S.j0 + 2.65, 0, 0.6);
  F.L('mudbrick', [[0.3, 0], [0.3, 0.24], [0.001, 0.26]], S.i0 + 0.5, D - 1.0, 0, 10); F.C(S.i0 + 0.2, D - 1.3, S.i0 + 0.8, D - 0.7, 0, 0.25);   // a stool
  F.lamp(uc + 0.9, 2.0, 1.1, lights);
}

/** The scribes' tally house: a porch of two palm columns under a reed awning, a low writing table, rolls in jars, ostraca on a shelf, a chest. */
function scribe(F, el, lights) {
  const rand = rng((el.seed || 1) * 7 + 2), h = 2.7, { W, D } = F;
  const S = shell(F, { h, mat: 'mud_plaster', dw: 1.1, plinth: 'limestone_core' });
  const uc = S.uc;
  // the porch: two palm columns on stone bases a metre and a half out, an architrave and an awning of reed over poles to the wall
  for (const u of [uc - 1.5, uc + 1.5]) {
    F.L('limestone_core', [[0.3, -0.05], [0.3, 0.12], [0.22, 0.18], [0.001, 0.18]], u, D + 1.6, 0, 10);
    F.L('palm_trunk', [[0.15, 0.17], [0.13, h - 0.3], [0.2, h - 0.2], [0.2, h - 0.08], [0.001, h - 0.08]], u, D + 1.6, 0, 9);
    F.C(u - 0.25, D + 1.35, u + 0.25, D + 1.85, 0, h);
  }
  const T = []; F.beam(T, [uc - 1.8, D + 1.6, h - 0.08], [uc + 1.8, D + 1.6, h - 0.08], 0.12, 0.26); F.bag.add('timber', fromTriangles(T));
  const R = []; for (let k = 0; k < 7; k++) { const u = uc - 1.65 + k * 0.55; F.beam(R, [u, D + 0.0, h + 0.1], [u, D + 1.9, h + 0.2], 0.07, 0.07); }
  F.bag.add('palm_trunk', fromTriangles(R));
  F.B('reed_mat', uc - 1.95, D + 0.0, uc + 1.95, D + 1.95, h + 0.17, h + 0.23);
  F.B('limestone_core', uc - 1.9, D + 0.0, uc + 1.9, D + 1.9, -0.05, 0.05);                      // the porch floor: a pavement of limestone
  F.S('mud_plaster', uc + 1.9 + 0.0, D + 0.2, uc + 2.5, D + 0.6, 0, 0.0);                        // (kept flat: a threshold, no collider)
  F.B('paint_ochre', uc - 0.8, D + S.th / 2 + 0.01, uc + 0.8, D + S.th / 2 + 0.02, h - 0.55, h - 0.1);   // the painted board over the door
  F.B('paint_blue', uc - 0.7, D + S.th / 2 + 0.02, uc + 0.7, D + S.th / 2 + 0.03, h - 0.45, h - 0.38);
  slit(F, W * 0.2, D + S.th / 2 + 0.012, 'u', 1.7, 0.35, 0.6); slit(F, W * 0.8, D + S.th / 2 + 0.012, 'u', 1.7, 0.35, 0.6);
  flatRoof(F, h, { spout: false });
  wear(F, rand, h);
  // inside: the writing table (a low board on trestles) with palette, papyrus and a water pot; the scribe's mat; rolls stored in jars; the shelf of ostraca; a chest
  F.S('timber', uc - 0.9, 1.0, uc + 0.9, 1.6, 0.35, 0.42); F.C(uc - 0.9, 1.0, uc + 0.9, 1.6, 0, 0.42);
  for (const u of [uc - 0.75, uc + 0.75]) F.B('timber', u - 0.05, 1.05, u + 0.05, 1.55, 0, 0.35);
  F.B('linen', uc - 0.5, 1.12, uc + 0.1, 1.5, 0.42, 0.425); F.B('wood_ochre', uc + 0.3, 1.1, uc + 0.7, 1.22, 0.42, 0.45);
  F.L('pottery_dark', [[0.001, 0.42], [0.04, 0.43], [0.045, 0.5], [0.001, 0.5]], uc + 0.55, 1.45, 0, 7);
  mat(F, uc, 2.0, 1.2, 0.9, 0);
  for (let k = 0; k < 4; k++) { jar(F, S.i0 + 0.3 + (k % 2) * 0.42, S.j0 + 0.3 + Math.floor(k / 2) * 0.42, 0, 0.9); F.L('linen', ROLL, S.i0 + 0.26 + (k % 2) * 0.42, S.j0 + 0.28 + Math.floor(k / 2) * 0.42, 0.5, 6); }
  F.C(S.i0, S.j0, S.i0 + 1.0, S.j0 + 1.0, 0, 0.7);
  F.S('timber', S.i1 - 0.5, S.j0 + 0.1, S.i1 - 0.05, S.j0 + 2.6, 1.1, 1.18);                      // a shelf
  for (let k = 0; k < 7; k++) F.B('limestone_carved', S.i1 - 0.45, S.j0 + 0.2 + k * 0.33, S.i1 - 0.12, S.j0 + 0.2 + k * 0.33 + 0.24, 1.18, 1.22 + rand() * 0.05);
  F.S('timber', S.i1 - 0.9, D - 1.3, S.i1 - 0.1, D - 0.5, 0, 0.5);
  F.lamp(S.i0 + 0.9, D - 1.0, 1.15, lights);
}

/** The tool and rope store: tall, blind, one low door, a ladder to the roof hatch; coils of rope, mallets, pounders, levers on pegs, sledge runners, baskets. */
function store(F, el, lights) {
  const rand = rng((el.seed || 1) * 11 + 3), h = 3.5, { W, D } = F;
  const S = shell(F, { h, mat: 'mudbrick', dw: 0.95, dh: 1.9 });
  const uc = S.uc;
  // the double door's timber frame (no leaves: they are folded back), a wooden bolt on a post; no windows but a row of slits under the roof
  F.B('timber', uc - 0.7, D + S.th / 2, uc - 0.55, D + S.th / 2 + 0.06, 0, 2.2); F.B('timber', uc + 0.55, D + S.th / 2, uc + 0.7, D + S.th / 2 + 0.06, 0, 2.2);
  for (const t of [0.2, 0.38, 0.62, 0.8]) slit(F, W * t, D + S.th / 2 + 0.012, 'u', 2.7, 0.2, 0.4);
  for (const t of [0.3, 0.7]) { slit(F, -S.th / 2 - 0.012, D * t, 'v', 2.7, 0.2, 0.4); slit(F, W + S.th / 2 + 0.012, D * t, 'v', 2.7, 0.2, 0.4); }
  // the ladder up the right-hand side to the roof
  const Ld = []; for (const dv of [0, 0.4]) F.beam(Ld, [W + S.th / 2 + 0.18, D * 0.3 + dv, 0], [W + S.th / 2 + 0.55, D * 0.3 + dv, h + 0.3], 0.03, 0.05);
  F.bag.add('timber', fromTriangles(Ld));
  const Rg = []; for (let y = 0.4; y < h; y += 0.35) F.beam(Rg, [W + S.th / 2 + 0.18 + y * 0.1, D * 0.3 - 0.0, y], [W + S.th / 2 + 0.18 + y * 0.1, D * 0.3 + 0.4, y], 0.025, 0.04);
  F.bag.add('timber', fromTriangles(Rg));
  flatRoof(F, h, { parapet: 0.18, spout: false });
  F.B('palm_trunk', W * 0.6 - 0.35, D * 0.4 - 0.35, W * 0.6 + 0.35, D * 0.4 + 0.35, h + 0.3, h + 0.38);   // the roof hatch's frame
  F.B('reed_mat', W * 0.6 - 0.28, D * 0.4 - 0.28, W * 0.6 + 0.28, D * 0.4 + 0.28, h + 0.38, h + 0.42);
  F.plinth = true; wear(F, rand, h);
  // inside: pegs along the back wall with mallets, ropes, a sack hung; coils on the floor; a rack of levers; sledge runners laid along the right wall; baskets
  const Pg = []; F.beam(Pg, [S.i0 + 0.3, S.j0, 1.8], [S.i1 - 0.3, S.j0, 1.8], 0.05, 0.08); F.bag.add('timber', fromTriangles(Pg));
  for (let k = 0; k < 6; k++) { const u = S.i0 + 0.55 + k * (S.i1 - S.i0 - 1.1) / 5; const M = []; F.beam(M, [u, S.j0 + 0.12, 1.15], [u, S.j0 + 0.12, 1.15], 0.001, 0.001); F.B(k % 2 ? 'timber' : 'dolerite_spotted', u - 0.09, S.j0 + 0.05, u + 0.09, S.j0 + 0.2, 1.55, 1.8); }
  for (let k = 0; k < 4; k++) { const u = S.i0 + 0.5 + k * 0.7; F.L('rope_fibre', [[0.36, 0], [0.36, 0.1], [0.2, 0.12], [0.2, 0], [0.36, 0]], u, S.j0 + 0.9, k * 0.0, 9); F.L('rope_fibre', [[0.34, 0.1], [0.34, 0.2], [0.2, 0.22], [0.2, 0.1]], u, S.j0 + 0.9, 0, 9); F.C(u - 0.36, S.j0 + 0.54, u + 0.36, S.j0 + 1.26, 0, 0.22); }
  const Lv = []; for (let k = 0; k < 4; k++) F.beam(Lv, [S.i1 - 0.2 - k * 0.15, S.j0 + 1.6, 0.04 + k * 0.0], [S.i1 - 0.2 - k * 0.15, S.j0 + 3.2, 0.1], 0.05, 0.08);
  F.bag.add('timber', fromTriangles(Lv)); F.C(S.i1 - 0.75, S.j0 + 1.6, S.i1 - 0.1, S.j0 + 3.2, 0, 0.2);
  for (let k = 0; k < 2; k++) { F.L('wicker', [[0.001, 0], [0.26, 0.01], [0.3, 0.3], [0.27, 0.34], [0.001, 0.06]], S.i0 + 0.35, D - 0.9 - k * 0.7, 0, 9); }
  F.C(S.i0 + 0.05, D - 2.0, S.i0 + 0.65, D - 0.55, 0, 0.35);
  F.S('timber', uc - 0.6, D * 0.55, uc + 0.6, D * 0.55 + 0.9, 0, 0.45);                           // a work bench
  for (let k = 0; k < 3; k++) F.B(k === 1 ? 'dolerite_spotted' : 'limestone_carved', uc - 0.5 + k * 0.4, D * 0.55 + 0.25, uc - 0.3 + k * 0.4, D * 0.55 + 0.45, 0.45, 0.6);
  F.lamp(S.i1 - 0.5, D - 0.8, 1.2, lights);
}

/** The masons' workshop: a mudbrick bench-high wall on three sides, the front open on palm posts under a mat roof; half-dressed blocks, benches, a grindstone, water jars, a heap of chips. */
function workshop(F, el, lights) {
  const rand = rng((el.seed || 1) * 13 + 4), { W, D } = F, h = 2.5, th = 0.5, wh = 1.15;
  F.S('mudbrick', -th / 2, -th / 2, W + th / 2, th / 2, 0, wh);
  F.S('mudbrick', -th / 2, th / 2, th / 2, D, 0, wh);
  F.S('mudbrick', W - th / 2, th / 2, W + th / 2, D, 0, wh);
  F.B('mud_plaster', -th / 2 - 0.03, -th / 2 - 0.03, W + th / 2 + 0.03, th / 2 + 0.03, wh, wh + 0.1);
  // the posts of the open front (an odd number of bays: the middle one is the way in), a beam on them, the mat roof sloping back, carried on poles
  const n = Math.max(3, Math.round(W / 2.4) | 1), xs = []; for (let k = 0; k <= n; k++) xs.push(-th / 2 + (W + th) * k / n);
  for (const u of xs) { F.L('limestone_core', [[0.26, -0.05], [0.26, 0.1], [0.001, 0.1]], u, D, 0, 8); F.post('palm_trunk', u, D, 0.1, h, 0.09); }
  const T = []; F.beam(T, [-th / 2, D, h - 0.1], [W + th / 2, D, h - 0.1], 0.12, 0.24); F.beam(T, [-th / 2, 0.0, wh + 1.2], [W + th / 2, 0.0, wh + 1.2], 0.1, 0.2);
  for (let k = 0; k <= 8; k++) { const u = -th / 2 + (W + th) * k / 8; F.beam(T, [u, 0.0, wh + 1.3], [u, D + 0.5, h + 0.14], 0.05, 0.07); }
  F.bag.add('palm_trunk', fromTriangles(T));
  F.B('reed_mat', -th / 2 - 0.1, 0.0, W + th / 2 + 0.1, D + 0.55, h + 0.19, h + 0.24);        // (flat: the slope is carried by the poles beneath; a mat on a low pitch)
  // the work: two blocks on trestles being dressed, one still rough, one with its face smoothed; tools laid by; a grindstone; chips underfoot
  F.S('tura_limestone', 0.5, 0.7, 1.7, 1.5, 0.35, 0.8); for (const u of [0.55, 1.6]) F.B('timber', u - 0.06, 0.8, u + 0.06, 1.4, 0, 0.35);
  F.S('limestone_core', W - 1.9, 0.8, W - 0.7, 1.6, 0.0, 0.7);
  F.S('tura_limestone', W / 2 - 0.5, D * 0.5, W / 2 + 0.5, D * 0.5 + 0.8, 0, 0.45);
  for (let k = 0; k < 3; k++) { const u = W / 2 - 0.35 + k * 0.35; F.B(k === 1 ? 'timber' : 'dolerite_spotted', u - 0.07, D * 0.5 + 0.2, u + 0.07, D * 0.5 + 0.55, 0.45, 0.55); }
  F.L('granite_red', [[0.4, 0], [0.4, 0.14], [0.001, 0.14]], W - 1.0, D - 1.0, 0, 11); F.C(W - 1.4, D - 1.4, W - 0.6, D - 0.6, 0, 0.14);
  jar(F, 0.4, D - 0.6, 0, 1.2); jar(F, 0.85, D - 0.5, 0, 1.0, 'pottery_dark'); F.C(0.05, D - 1.0, 1.2, D - 0.1, 0, 0.7);
  for (let k = 0; k < 10; k++) F.L(rand() < 0.7 ? 'tura_limestone' : 'limestone_core', [[0.14, 0], [0.09, 0.05], [0.001, 0.06]], 0.8 + rand() * (W - 1.6), 0.9 + rand() * (D - 1.6), 0, 5);
  F.lamp(W / 2, 0.45, 2.0, lights, '#ffcf96');
}

/** The grain store: a long low house of mudbrick; on its roof the domes of three round bins, each with its filling hole and a stone on it; a ladder; inside the big jars, a measure, a tally board. */
function granary(F, el, lights) {
  const rand = rng((el.seed || 1) * 17 + 5), h = 2.6, { W, D } = F;
  const S = shell(F, { h, mat: 'mudbrick', dw: 1.0, plinth: 'limestone_core' });
  const uc = S.uc;
  F.B('limestone_core', uc - 0.65, D + 0.25, uc + 0.65, D + 0.7, 0, 0.1);
  flatRoof(F, h, { parapet: 0.15, spout: false });
  const nb = 3, r = Math.min(1.0, (W - 1.2) / (nb * 2 + 0.6));
  for (let k = 0; k < nb; k++) {
    const u = 0.9 + r + k * (W - 1.8 - 2 * r) / (nb - 1), v = D * 0.5;
    F.L('mud_plaster', [[r, 0], [r * 1.04, 0.5], [r * 0.95, 1.0], [r * 0.62, 1.55], [r * 0.2, 1.8], [r * 0.2, 1.86], [0.001, 1.86]], u, v, h + 0.3, 14);
    F.L('limestone_core', [[0.001, 0], [0.2, 0], [0.18, 0.08], [0.001, 0.1]], u, v, h + 0.3 + 1.86, 8);
    F.L('mud_plaster', [[r * 1.3, 0], [r * 1.3, 0.12], [r, 0.14], [0.001, 0.14]], u, v, h + 0.3, 14);
  }
  const Ld = []; for (const dv of [0, 0.4]) F.beam(Ld, [W + S.th / 2 + 0.18, D * 0.35 + dv, 0], [W + S.th / 2 + 0.6, D * 0.35 + dv, h + 0.3], 0.03, 0.05);
  F.bag.add('timber', fromTriangles(Ld));
  for (const t of [0.25, 0.75]) slit(F, W * t, -S.th / 2 - 0.012, 'u', 1.9, 0.22, 0.4);
  slit(F, D * 0.5, -0.0, 'v', 0, 0, 0.001);
  wear(F, rand, h);
  // inside: the big jars in two rows along the back and the right wall, a wooden measure, the tally board hung by the door
  for (let k = 0; k < Math.floor((W - 1.0) / 0.75); k++) { jar(F, S.i0 + 0.5 + k * 0.75, S.j0 + 0.45, 0, 1.7, k % 3 === 1 ? 'pottery_dark' : 'terracotta'); F.L('mud_plaster', [[0.001, 0.94], [0.14, 0.95], [0.1, 1.0], [0.001, 1.01]], S.i0 + 0.5 + k * 0.75, S.j0 + 0.45, 0, 8); }
  F.C(S.i0, S.j0, S.i1, S.j0 + 0.9, 0, 1.0);
  for (let k = 0; k < 3; k++) { jar(F, S.i1 - 0.45, S.j0 + 1.4 + k * 0.75, 0, 1.5); }
  F.C(S.i1 - 0.9, S.j0 + 1.0, S.i1, S.j0 + 3.7, 0, 0.95);
  F.L('timber', [[0.2, 0], [0.22, 0.12], [0.2, 0.26], [0.001, 0.26]], uc - 0.9, D * 0.55, 0, 9); F.C(uc - 1.1, D * 0.55 - 0.2, uc - 0.7, D * 0.55 + 0.2, 0, 0.26);
  F.L('cloth_ochre', [[0.001, 0.26], [0.17, 0.27], [0.12, 0.34], [0.001, 0.34]], uc - 0.9, D * 0.55, 0, 7);
  F.B('timber', S.i0 + 0.05, D - 0.8, S.i0 + 0.09, D - 0.2, 1.1, 1.8); F.B('limestone_carved', S.i0 + 0.09, D - 0.75, S.i0 + 0.11, D - 0.25, 1.15, 1.75);
  F.lamp(S.i0 + 0.6, D - 0.9, 1.9, lights);
}

/** The lector priest's house: tall, a painted lintel and jambs of fine stone, a hall with one palm column on a stone base, a niche with a statuette and an offering table, a bed alcove. */
function priest(F, el, lights) {
  const rand = rng((el.seed || 1) * 19 + 6), h = 3.4, { W, D } = F;
  const S = shell(F, { h, mat: 'plaster_white', dw: 1.2, dh: 2.2, plinth: 'limestone_core' });
  const uc = S.uc;
  F.B('limestone_carved', uc - 0.75, D + S.th / 2, uc - 0.6, D + S.th / 2 + 0.07, 0, 2.2); F.B('limestone_carved', uc + 0.6, D + S.th / 2, uc + 0.75, D + S.th / 2 + 0.07, 0, 2.2);
  F.B('limestone_carved', uc - 0.75, D + S.th / 2, uc + 0.75, D + S.th / 2 + 0.07, 2.2, 2.42);
  F.B('paint_ochre', uc - 0.9, D + S.th / 2 + 0.01, uc + 0.9, D + S.th / 2 + 0.02, 2.5, 3.1); F.B('paint_blue', uc - 0.8, D + S.th / 2 + 0.02, uc + 0.8, D + S.th / 2 + 0.03, 2.6, 2.66); F.B('paint_blue', uc - 0.8, D + S.th / 2 + 0.02, uc + 0.8, D + S.th / 2 + 0.03, 2.94, 3.0);
  F.B('limestone_core', uc - 0.7, D + 0.25, uc + 0.7, D + 0.8, 0, 0.12); F.B('limestone_core', uc - 0.6, D + 0.8, uc + 0.6, D + 1.3, 0, 0.06);
  F.L('limestone_core', [[0.3, -0.05], [0.3, 0.1], [0.001, 0.1]], uc - 1.8, D + 0.6, 0, 9); F.L('limestone_core', [[0.3, -0.05], [0.3, 0.1], [0.001, 0.1]], uc + 1.8, D + 0.6, 0, 9);   // two tubs of flowers: lotus pots
  for (const u of [uc - 1.8, uc + 1.8]) { F.L('terracotta', [[0.22, 0.1], [0.24, 0.35], [0.2, 0.5], [0.001, 0.5]], u, D + 0.6, 0, 9); F.C(u - 0.25, D + 0.35, u + 0.25, D + 0.85, 0, 0.5); }
  for (const t of [0.22, 0.78]) slit(F, W * t, D + S.th / 2 + 0.012, 'u', 2.2, 0.35, 0.6);
  slit(F, W * 0.3, -S.th / 2 - 0.012, 'u', 2.4, 0.3, 0.6); slit(F, W * 0.7, -S.th / 2 - 0.012, 'u', 2.4, 0.3, 0.6);
  flatRoof(F, h);
  wear(F, rand, h);
  // inside: the column, the niche in the back wall with its statuette on a stone plinth, the offering table before it, the bed alcove and a chest
  F.L('limestone_core', [[0.38, -0.05], [0.38, 0.14], [0.001, 0.14]], W / 2, D * 0.45, 0, 10);
  F.L('palm_trunk', [[0.2, 0.13], [0.17, h - 0.4], [0.26, h - 0.26], [0.26, h - 0.12], [0.001, h - 0.12]], W / 2, D * 0.45, 0, 10); F.C(W / 2 - 0.3, D * 0.45 - 0.3, W / 2 + 0.3, D * 0.45 + 0.3, 0, h);
  const Bm = []; F.beam(Bm, [S.i0, D * 0.45, h - 0.14], [S.i1, D * 0.45, h - 0.14], 0.14, 0.14); F.bag.add('timber', fromTriangles(Bm));
  F.B('limestone_carved', uc - 0.6, S.j0 - 0.0, uc + 0.6, S.j0 + 0.12, 0.8, 1.9);
  F.B('plaster_ochre', uc - 0.5, S.j0 + 0.12, uc + 0.5, S.j0 + 0.13, 0.9, 1.8);
  F.S('limestone_carved', uc - 0.3, S.j0 + 0.12, uc + 0.3, S.j0 + 0.5, 0, 0.7); F.L('limestone_core', [[0.001, 0], [0.09, 0], [0.11, 0.35], [0.07, 0.5], [0.12, 0.62], [0.001, 0.66]], uc, S.j0 + 0.31, 0.7, 8);
  F.S('limestone_core', uc - 0.45, S.j0 + 1.1, uc + 0.45, S.j0 + 1.6, 0.0, 0.42);
  for (let k = 0; k < 3; k++) F.L('terracotta', [[0.001, 0], [0.08, 0], [0.1, 0.06], [0.001, 0.08]], uc - 0.3 + k * 0.3, S.j0 + 1.35, 0.42, 7);
  F.L('cloth_white', [[0.001, 0.42], [0.12, 0.43], [0.1, 0.5], [0.001, 0.52]], uc, S.j0 + 1.35, 0, 7);
  F.S('mud_plaster', S.i0, S.j0 + 0.6, S.i0 + 2.0, S.j0 + 1.6, 0, 0.42); mat(F, S.i0 + 1.0, S.j0 + 1.1, 1.8, 0.9, 0.42); headrest(F, S.i0 + 0.3, S.j0 + 1.1, 0.445);
  F.S('timber', S.i1 - 0.7, S.j0 + 0.6, S.i1 - 0.05, S.j0 + 1.6, 0, 0.55);
  for (let k = 0; k < 2; k++) jar(F, S.i1 - 0.3, S.j0 + 2.0 + k * 0.5, 0, 1.0);
  F.C(S.i1 - 0.55, S.j0 + 1.75, S.i1, S.j0 + 2.75, 0, 0.6);
  F.lamp(uc + 1.0, D * 0.62, 1.2, lights); F.lamp(S.i0 + 0.8, D - 1.0, 1.2, lights);
}

const KINDS = { lodging, scribe, store, workshop, granary, priest };

/** ok_lodge { rect, kind, door, seed, y }. */
export function lodge(el, { bag, col, lights }) {
  const F = new Frame(el.rect, el.door || 's', bag, col, el.y ?? 0);
  KINDS[el.kind || 'lodging'](F, el, lights);
}
export { BEER };
