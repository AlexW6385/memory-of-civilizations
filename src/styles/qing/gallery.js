// The palace's galleries and side gates (docs/settlements/qing-beijing.md §28): the covered galleries (庑)
// along the great courtyard's east and west sides, and the Xiehe and Xihe gates in them.
//
// A gallery is a long lean-to against a tall red wall (the courtyard's boundary): a single slope of yellow
// glazed tiles falling from the wall to the eaves over the front, a verandah row of red columns carrying painted
// architraves and little bracket sets, behind them a wall of lattice doors and windows, a low marble-edged
// platform with steps down to the court, and behind, above the wall's top eave, the fire-wall (封火墙) rising over
// the roof's upper edge under a tiled coping.
//
// A side gate is a hall of five bays (4.8 m each) by two on a marble base 2.62 m high with balustrades and
// stairs, a single-eaved hip-and-gable roof of yellow tiles on bracket sets; the three middle bays of its front
// hung with doors (gate_doors, plan.js) — dossier §28: Palace Museum, 协和门.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, column, beamTris, latticeBay } from '../ming/index.js';
import { dougong, dougongHeight } from './caihua.js';
import { roofOrnaments } from './carving.js';

/** Two triangles a-b-c, a-c-d turned to face along dir. */
function quad(out, a, b, c, d, dir) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
  if (n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2] >= 0) out.push(...a, ...b, ...c, ...a, ...c, ...d);
  else out.push(...a, ...c, ...b, ...a, ...d, ...c);
}

/**
 * qing_gallery: { pts: [a, b] (the back wall's line; axis-aligned), front: [fx, fz] (unit vector toward the court),
 * y (the platform's top), H (the columns' height), w (back wall's face to the platform's front edge), bays }.
 */
export function qingGallery(el, { bag, col }) {
  const [a, b] = el.pts, f = el.front, y = el.y ?? 0.6, H = el.H ?? 4.4, D = el.w ?? 5.2;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  const n = el.bays ?? Math.max(2, Math.round(L / 3.4)), bw = L / n;
  const W = (s, v, h) => [a[0] + u[0] * s + f[0] * v, h, a[1] + u[1] * s + f[1] * v];
  const R = (s0, v0, s1, v1) => { const p = W(s0, v0, 0), q = W(s1, v1, 0); return [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]; };
  const bx = (s0, s1, v0, v1, y0, y1) => { const r = R(s0, v0, s1, v1); return box(r[0], y0, r[1], r[2], y1, r[3]); };
  const beam = (out, s0, s1, v, h0, hw, h) => beamTris(out, W(s0, v, h0), W(s1, v, h0), hw, h);
  const upv = [0, 1, 0], dnv = [0, -1, 0], fU = [f[0], 0, f[1]], bU = [-f[0], 0, -f[1]], uU = [u[0], 0, u[1]], mU = [-u[0], 0, -u[1]];

  const VB = -0.7, VF = D - 0.3, VC = D - 1.5;          // back wall's outer face, platform's front edge, the verandah columns' line
  const V0 = 1.9;                                       // the line of lattice doors and windows
  // the platform: marble, a brick top inside a marble kerb; two steps down to the court along the front
  bag.add('marble', bx(0, L, VB - 0.1, VF, 0, y - 0.05));
  bag.add('brick_paving', bx(0.05, L - 0.05, 0, VF - 0.3, y - 0.05, y));
  bag.add('marble_smooth', bx(0, L, VF - 0.3, VF, y - 0.06, y));
  bag.add('marble', bx(0, L, VF, VF + 0.5, 0, y * 0.62));
  bag.add('marble_smooth', bx(0, L, VF + 0.5, VF + 1.0, 0, y * 0.31));
  col.floor(R(0, VB, L, VF), y);
  col.floor(R(0, VF, L, VF + 0.5), y * 0.62);
  col.floor(R(0, VF + 0.5, L, VF + 1.0), y * 0.31);
  // the back wall (red), its marble foot, the fire-wall above the roof with a tiled coping, a small eave behind
  const topRoof = H + 0.45 + 2.2;
  bag.add('palace_wall', bx(0, L, VB, 0, y, y + topRoof + 0.55));
  bag.add('marble', bx(-0.02, L + 0.02, VB - 0.08, 0.04, y, y + 0.35));
  bag.add('tile_yellow', bx(-0.12, L + 0.12, VB - 0.15, 0.15, y + topRoof + 0.55, y + topRoof + 0.72));
  bag.add('paint_caihua', bx(-0.02, L + 0.02, VB - 0.04, 0.02, y + topRoof + 0.38, y + topRoof + 0.55));
  col.rect(R(0, VB, L, 0), y, y + topRoof);
  {
    const t = [], ye = y + H + 1.55;
    for (const [s0, s1] of [[-0.1, L + 0.1]]) {
      quad(t, W(s0, VB - 0.05, ye + 0.55), W(s1, VB - 0.05, ye + 0.55), W(s1, VB - 0.75, ye + 0.38), W(s0, VB - 0.75, ye + 0.38), upv);
      quad(t, W(s0, VB - 0.05, ye + 0.27), W(s1, VB - 0.05, ye + 0.27), W(s1, VB - 0.75, ye + 0.1), W(s0, VB - 0.75, ye + 0.1), dnv);
      quad(t, W(s0, VB - 0.75, ye + 0.1), W(s1, VB - 0.75, ye + 0.1), W(s1, VB - 0.75, ye + 0.38), W(s0, VB - 0.75, ye + 0.38), bU);
    }
    bag.add('tile_yellow', fromTriangles(t));
  }

  // the roof: one slope from the wall to the eaves, concave; its underside boarded and painted
  const vTop = 0.0, vEave = VF + 0.7, hEave = y + H + 0.45, rise = 2.2, thick = 0.3, NS = 8;
  const hAt = (v) => { const t = Math.max(0, Math.min(1, (vEave - v) / (vEave - vTop))); return hEave + rise * Math.pow(t, 1.5); };
  {
    const top = [], under = [], ends = [], endsW = [];
    for (let i = 0; i < NS; i++) {
      const v0 = vEave - (vEave - vTop) * i / NS, v1 = vEave - (vEave - vTop) * (i + 1) / NS;
      quad(top, W(0 - 0.35, v0, hAt(v0)), W(L + 0.35, v0, hAt(v0)), W(L + 0.35, v1, hAt(v1)), W(0 - 0.35, v1, hAt(v1)), upv);
      quad(under, W(-0.35, v0, hAt(v0) - thick), W(L + 0.35, v0, hAt(v0) - thick), W(L + 0.35, v1, hAt(v1) - thick), W(-0.35, v1, hAt(v1) - thick), dnv);
      for (const [s, d] of [[-0.35, mU], [L + 0.35, uU]]) quad(ends, W(s, v0, hAt(v0)), W(s, v1, hAt(v1)), W(s, v1, hAt(v1) - thick), W(s, v0, hAt(v0) - thick), d);
    }
    // the front edge: the eave's board and the row of drip tiles
    quad(ends, W(-0.35, vEave, hEave), W(L + 0.35, vEave, hEave), W(L + 0.35, vEave, hEave - thick), W(-0.35, vEave, hEave - thick), fU);
    bag.add('tile_yellow', fromTriangles(top.concat(ends)));
    bag.add('paint_caihua', fromTriangles(under));
    bag.add('tile_yellow', bx(-0.35, L + 0.35, vEave - 0.02, vEave + 0.1, hEave - 0.06, hEave + 0.1));
    // the ridge at the wall (a half-round of tiles along the roof's upper edge) and the roof's ribs
    bag.add('tile_yellow', bx(-0.35, L + 0.35, vTop - 0.15, vTop + 0.45, hAt(0) - 0.05, hAt(0) + 0.22));
    const ribs = [], nr = Math.round((L + 0.7) / 0.34);
    for (let k = 0; k < nr; k++) {
      const s = -0.35 + (L + 0.7) * (k + 0.5) / nr;
      for (let i = 0; i < NS; i++) {
        const v0 = vEave - (vEave - vTop) * i / NS, v1 = vEave - (vEave - vTop) * (i + 1) / NS;
        beamTris(ribs, W(s, v0, hAt(v0)), W(s, v1, hAt(v1)), 0.035, 0.03, true);
      }
    }
    bag.add('tile_yellow', fromTriangles(ribs));
  }
  // the end walls under the roof (red), closing the room and the verandah
  {
    const t = [], N = 6;
    for (const [s, d] of [[0, mU], [L, uU]]) {
      for (let i = 0; i < N; i++) {
        const v0 = VB + (VC + 0.4 - VB) * i / N, v1 = VB + (VC + 0.4 - VB) * (i + 1) / N;
        const h0 = Math.min(hAt(v0) - thick, y + H + 1.0), h1 = Math.min(hAt(v1) - thick, y + H + 1.0);
        quad(t, W(s, v0, y), W(s, v1, y), W(s, v1, h1), W(s, v0, h0), d);
      }
      col.rect(R(s - 0.15, VB, s + 0.15, VC + 0.4), y, y + H);
    }
    bag.add('palace_wall', fromTriangles(t));
  }

  // the room's front: a post at each bay's end, lattice doors in every third bay and windows over red sills in the others
  const lat = [], wd = [];
  for (let k = 0; k <= n; k++) {
    const s = k * bw, p = W(s, V0, 0);
    bag.add('lacquer_red', box(p[0] - 0.1, y, p[2] - 0.1, p[0] + 0.1, y + H - 0.55, p[2] + 0.1));
  }
  for (let k = 0; k < n; k++) {
    const A = W(k * bw + 0.1, V0, 0), B = W((k + 1) * bw - 0.1, V0, 0);
    // a red sill (a window's 0.9 m, a door's dado 0.55 m) and the lattice panes above it, to the tie beam
    const door = k % 3 === 1, foot = door ? 0.55 : 0.9;
    bag.add('lacquer_red', bx(k * bw + 0.1, (k + 1) * bw - 0.1, V0 - 0.06, V0 + 0.06, y, y + foot));
    latticeBay(bag, col, [A[0], A[2]], [B[0], B[2]], y + foot, H - 0.75 - foot, 'pane', 0.04, 'lattice_red');
    // (the sill wall under a window is the lattice builder's own; the red board above the doors and windows is the tie beam)
  }
  beam(wd, 0, L, V0, y + H - 0.78, 0.1, 0.24);
  bag.add('lacquer_red', fromTriangles(wd));
  col.segment([W(0, V0, 0)[0], W(0, V0, 0)[2]], [W(L, V0, 0)[0], W(L, V0, 0)[2]], 0.2, y, y + H);

  // the verandah: red columns on marble drums, painted architraves between them and the bracket sets over them
  const arch = [], low = [], plate = [], gong = [];
  for (let k = 0; k <= n; k++) {
    const s = k * bw, p = W(s, VC, 0);
    column(bag, col, p[0], p[2], y, H - 0.35, 0.4, 'lacquer_red');
    // a bracket set on each column and one between each pair: two tiers of blocks and arms
    const sets = k < n ? [s, s + bw / 2] : [s];
    for (const q of sets) {
      for (const [t, wu, wv, hh] of [[0, 0.3, 0.3, 0.14], [0.15, 0.64, 0.24, 0.12], [0.27, 0.95, 0.2, 0.12]]) {
        const c = W(q, VC + t * 0.55, y + H - 0.2 + t);
        beamTris(gong, [c[0] - u[0] * wu / 2, c[1], c[2] - u[1] * wu / 2], [c[0] + u[0] * wu / 2, c[1], c[2] + u[1] * wu / 2], wv / 2, hh, true);
      }
      const c = W(q, VC + 0.6, y + H - 0.2 + 0.14);
      beamTris(gong, [c[0] - f[0] * 0.4, c[1], c[2] - f[1] * 0.4], [c[0] + f[0] * 0.4, c[1], c[2] + f[1] * 0.4], 0.05, 0.22, true);
    }
  }
  beam(arch, -0.15, L + 0.15, VC, y + H - 0.78, 0.15, 0.55);              // the great architrave
  beam(low, -0.1, L + 0.1, VC, y + H - 1.12, 0.09, 0.3);                  // the small architrave under it
  beam(plate, -0.15, L + 0.15, VC, y + H - 0.2, 0.2, 0.12);               // the plate
  // the ceiling beams across, from the front architrave to the room's wall (the soffit's tie beams), one over each column
  for (let k = 0; k <= n; k++) beamTris(arch, W(k * bw, VC, y + H - 0.78), W(k * bw, V0, y + H - 0.78), 0.1, 0.55, true);
  bag.add('paint_caihua', fromTriangles(arch.concat(low, plate, gong)));
  // a low marble rail-stone (the verandah's edge), broken at every fourth bay
  // (none: the platform's kerb stands for it)
}

/**
 * qing_side_gate: the gate of the great courtyard's side (Xiehe and Xihe gates, §28): { c: [x, z], face: [fx, fz] (toward the court), y (floor),
 * W (the long side, 5 bays), D (depth, 2 bays), H }. Its doors (gate_doors) are set by the plan on the front row.
 */
export function qingSideGate(el, { bag, col }) {
  const [xc, zc] = el.c, f = el.face, y = el.y, H = el.H ?? 5.4, Wd = el.W ?? 24, Dp = el.D ?? 10.6, bwid = Wd / 5, hd = Dp / 2;
  const X = (v) => xc + f[0] * v;                                            // v: along the depth, + toward the court
  const xs = [X(-hd), X(0), X(hd)].sort((p, q) => p - q), zs = Array.from({ length: 6 }, (_, i) => zc - Wd / 2 + bwid * i);
  const rect = [xs[0], zs[0], xs[2], zs[5]];
  bag.add('brick_paving', box(rect[0] - 0.4, y - 0.05, rect[1] - 0.4, rect[2] + 0.4, y, rect[3] + 0.4));
  for (const x of xs) for (const z of zs) column(bag, col, x, z, y, H - 0.2, 0.64, 'lacquer_red');
  // the walls: the end walls whole; on the court's row and the far row the end bays; the three middle bays of the court's row for the doors
  const wall = (x0, z0, x1, z1) => { bag.add('palace_wall', box(x0, y, z0, x1, y + H - 0.75, z1)); bag.add('marble', box(x0 - 0.04, y, z0 - 0.04, x1 + 0.04, y + 0.3, z1 + 0.04)); col.rect([x0, z0, x1, z1], y, y + H); };
  for (const z of [zs[0], zs[5]]) wall(rect[0], z - 0.22, rect[2], z + 0.22);
  for (const x of [xs[0], xs[2]]) { wall(x - 0.22, zs[0], x + 0.22, zs[1]); wall(x - 0.22, zs[4], x + 0.22, zs[5]); }
  // the doors' transom: a red board over the three doors, and their threshold stone
  const xf = X(hd);
  bag.add('lacquer_red', box(xf - 0.2, y + H - 1.15, zs[1], xf + 0.2, y + H - 0.75, zs[4]));
  bag.add('marble_smooth', box(xf - 0.45, y, zs[1], xf + 0.45, y + 0.12, zs[4]));
  // the painted architraves along the three rows and across the six lines, the plates, the bracket sets
  const arch = [];
  for (const x of xs) beamTris(arch, [x, y + H - 0.75, zs[0] - 0.3], [x, y + H - 0.75, zs[5] + 0.3], 0.2, 0.55);
  for (const z of zs) beamTris(arch, [xs[0] - 0.3, y + H - 0.75, z], [xs[2] + 0.3, y + H - 0.75, z], 0.2, 0.55);
  bag.add('paint_caihua', fromTriangles(arch));
  const qb = { tiers: 2, pitch: 1.0 }, bk = dougongHeight(qb), fy = y + H;
  const o1 = el.eave ?? 1.9, A = Wd / 2 + o1, B = hd + o1;
  const r = { c: [xc, zc], A, B, y: fy - 0.25 + bk, rise: B * 0.6, kind: 'xieshan', sweep: 0.8, alongZ: true, mat: 'tile_yellow', soffit: 'paint_caihua', curl: false };
  const under = (d) => r.y + r.rise * Math.pow(Math.max(0, (o1 - d) / r.B), r.p ?? 1.7) - 0.14;
  dougong(bag, rect, [xs, zs], fy - 0.17, qb, under);
  rectRoof(r, bag);
  roofOrnaments(bag, r, { mat: 'tile_yellow', joseon: false, white: false, figures: 5, ends: true });
  void lathe;
}
