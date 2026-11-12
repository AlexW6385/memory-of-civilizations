// The temples of Taumadhi (docs/settlements/bhaktapur.md §1, §4): the five-roofed pagoda on its stepped plinth
// with its pairs of guardians, the same in three roofs for the Bhairabnath, the stone shikhara and the chaitya.

import { box, lathe, rod, frustum } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

const bx = (x0, y0, z0, x1, y1, z1) => box(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1), Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1));
const STONE = 'sandstone_dressed';

/** A statue's lathe lying along the facing axis (its y axis turned to x), scaled by s and put at (x, y, z), facing +x or −x. */
function along(bag, mat, g, x, y, z, sx, s) {
  g.scale(s, s, s).rotateZ(-Math.PI / 2);
  if (sx < 0) g.rotateY(Math.PI);
  g.translate(x, y, z); bag.add(mat, g);
}
const ball = (r, n = 8) => lathe(Array.from({ length: 6 }, (_, i) => { const t = i / 5 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);
const at = (g, x, y, z) => g.translate(x, y, z);

/**
 * The guardians of the Nyatapola's stages, from the ground up [stated: wrestlers, elephants, lions, griffins, the goddesses];
 * each pair stronger than the one below, so each figure larger [inferred]. Facing sx (+1 east, −1 west); (x, y, z) the foot of its pedestal.
 */
function guardian(bag, col, kind, x, y, z, sx, s) {
  const M = STONE, ped = 0.45 * s;
  bag.add(M, bx(x - 0.55 * s, y, z - 0.55 * s, x + 0.55 * s, y + ped, z + 0.55 * s));
  col.circle(x, z, 0.62 * s, y, y + 2.4 * s);
  const top = y + ped, F = (u) => x + sx * u;
  if (kind === 'wrestler') {
    for (const dz of [-0.15, 0.15]) bag.add(M, bx(x - 0.1 * s, top, z + dz * s - 0.09 * s, x + 0.1 * s, top + 0.8 * s, z + dz * s + 0.09 * s));
    bag.add(M, lathe([[0.17 * s, 0], [0.3 * s, 0.35 * s], [0.34 * s, 0.7 * s], [0.2 * s, 0.82 * s], [0.001, 0.84 * s]], 8).translate(x, top + 0.78 * s, z));
    bag.add(M, ball(0.13 * s).translate(x, top + 1.6 * s, z));
    bag.add(M, rod([x, top + 1.5 * s, z - 0.3 * s], [F(0.18 * s), top + 1.05 * s, z - 0.42 * s], 0.06 * s, 6));
    bag.add(M, rod([x, top + 1.5 * s, z + 0.3 * s], [F(0.4 * s), top + 1.3 * s, z + 0.35 * s], 0.06 * s, 6));
    bag.add(M, rod([F(0.4 * s), top + 1.1 * s, z + 0.35 * s], [F(0.4 * s), top + 2.0 * s, z + 0.35 * s], 0.045 * s, 6));       // the club
    return;
  }
  // the quadrupeds and the seated goddess: a body, a chest, a head
  if (kind === 'elephant') {
    along(bag, M, lathe([[0.001, -0.7], [0.5, -0.5], [0.58, 0], [0.5, 0.6], [0.001, 0.8]], 10), x, top + 0.95 * s, z, sx, s);
    for (const [u, v] of [[-0.45, -0.28], [-0.45, 0.28], [0.4, -0.28], [0.4, 0.28]]) bag.add(M, bx(F(u * s) - 0.11 * s, top, z + v * s - 0.11 * s, F(u * s) + 0.11 * s, top + 0.75 * s, z + v * s + 0.11 * s));
    bag.add(M, ball(0.3 * s).translate(F(0.88 * s), top + 1.3 * s, z));
    for (const v of [-0.33, 0.33]) bag.add(M, bx(F(0.74 * s) - 0.03 * s, top + 1.1 * s, z + v * s - 0.17 * s, F(0.74 * s) + 0.03 * s, top + 1.55 * s, z + v * s + 0.17 * s));
    bag.add(M, rod([F(1.05 * s), top + 1.25 * s, z], [F(1.35 * s), top + 0.45 * s, z], 0.09 * s, 7));
    bag.add('ivory', rod([F(1.0 * s), top + 1.1 * s, z - 0.1 * s], [F(1.3 * s), top + 0.95 * s, z - 0.13 * s], 0.025 * s, 5));
    bag.add('ivory', rod([F(1.0 * s), top + 1.1 * s, z + 0.1 * s], [F(1.3 * s), top + 0.95 * s, z + 0.13 * s], 0.025 * s, 5));
    return;
  }
  // lion, griffin (with wings), the goddesses (lion-bodied, crowned)
  along(bag, M, lathe([[0.001, -0.5], [0.28, -0.3], [0.34, 0], [0.3, 0.4], [0.001, 0.55]], 9), x, top + 0.7 * s, z, sx, s);
  for (const [u, v] of [[-0.3, -0.2], [-0.3, 0.2], [0.34, -0.17], [0.34, 0.17]]) bag.add(M, bx(F(u * s) - 0.07 * s, top, z + v * s - 0.07 * s, F(u * s) + 0.07 * s, top + 0.5 * s, z + v * s + 0.07 * s));
  bag.add(M, ball(0.23 * s).translate(F(0.5 * s), top + 1.0 * s, z));
  bag.add(M, lathe([[0.001, 0], [0.3 * s, 0.05 * s], [0.34 * s, 0.25 * s], [0.001, 0.4 * s]], 8).rotateZ(-Math.PI / 2 * sx).translate(F(0.42 * s), top + 0.98 * s, z));   // the mane
  if (kind === 'griffin') for (const v of [-1, 1]) bag.add(M, bx(F(-0.1 * s), top + 0.9 * s, z + v * 0.34 * s - 0.02 * s, F(-0.4 * s), top + 1.5 * s, z + v * 0.34 * s + 0.02 * s));
  if (kind === 'goddess') { bag.add('gilt_bronze', lathe([[0.001, 0], [0.16 * s, 0], [0.12 * s, 0.2 * s], [0.001, 0.3 * s]], 8).translate(F(0.5 * s), top + 1.22 * s, z)); }
}

/**
 * newar_pagoda: the pagoda temple { c, front ('e'|'w'), plinth: { hw: [by stage, lowest first], h (stage height), tread (the stair side's tread), top (the east face of the highest stage is at hw + top) },
 * roofs: [{ hw (eave half-width), core (the wall's half-width under it), wall (its height), rise }], guard: ['wrestler' ...] (a pair at the foot of each flight), bells, door }.
 */
export function pagoda(el, { bag, col, lights }) {
  const [cx, cz] = el.c, sx = el.front === 'w' ? -1 : 1, P = el.plinth, h = P.h, n = P.hw.length;
  const X = (u) => cx + sx * u, rect = (u0, v0, u1, v1) => { const a = X(u0), b = X(u1); return [Math.min(a, b), cz + v0, Math.max(a, b), cz + v1]; };
  const uFace = []; for (let k = n - 1, u = P.hw[n - 1] + (P.top ?? 1); k >= 0; k--, u += P.tread) uFace[k] = u;
  // the stages: brick faced, with a stone coping, and the flights of the stair on the front
  for (let k = 0; k < n; k++) {
    const r = rect(-P.hw[k], -P.hw[k], uFace[k], P.hw[k]), y1 = (k + 1) * h;
    bag.add('brick', box(r[0], 0, r[1], r[2], y1 - 0.1, r[3])); bag.add(STONE, box(r[0] - 0.06, y1 - 0.1, r[1] - 0.06, r[2] + 0.06, y1, r[3] + 0.06));
    col.rect(r, 0, y1); col.floor(r, y1);
  }
  const W = P.stair ?? 4.4, m = 4;
  for (let k = 0; k < n; k++) for (let j = 1; j <= m; j++) {
    const r = rect(uFace[k], -W / 2, uFace[k] + (m - j + 1) * 0.35, W / 2), t = k * h + j * h / m;
    bag.add(STONE, box(r[0], 0, r[1], r[2], t, r[3])); col.rect(r, 0, t); col.floor(r, t);
  }
  const kinds = el.guard ?? ['wrestler', 'elephant', 'lion', 'griffin', 'goddess'];
  for (let k = 0; k < n && k < kinds.length; k++) for (const v of [-1, 1]) guardian(bag, col, kinds[k], X(uFace[k] + 1.25), k * h, cz + v * (W / 2 + 1.05), sx, 0.85 + 0.12 * k);
  // the roofs and the walls of the tiers
  let yb = n * h - 0.02;
  const R = el.roofs;
  R.forEach((q, i) => {
    const ye = yb + q.wall, next = R[i + 1] ? R[i + 1].core : 0.55, run = q.hw - next, ov = q.hw - q.core;
    const c0 = rect(-q.core, -q.core, q.core, q.core);
    if (i === 0 && el.chamber) {
      // the sanctum on the ground tier is open to the front: walls 0.7 m thick on three sides and a front wall with the door, a ceiling of joists under the second tier
      const t = 0.7, dw = 0.75, ch = el.chamber, c = q.core, y0 = yb;
      const wl = (u0, v0, u1, v1, y1 = ye) => { const r = rect(u0, v0, u1, v1); bag.add('brick', box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0 - 1, y1); };
      wl(-c, -c, -c + t, c); wl(-c, -c, c, -c + t); wl(-c, c - t, c, c);
      wl(c - t, -c, c, -dw); wl(c - t, dw, c, c);
      { const r = rect(c - t, -dw, c, dw); bag.add('brick', box(r[0], y0 + 2.1, r[1], r[2], ye, r[3])); }
      { const r = rect(-c + t, -c + t, c - t, c - t); bag.add('wood_dark', box(r[0], ye - 0.25, r[1], r[2], ye, r[3])); }
      // within: the image of Bhairab on a stone seat (a gilt head with a crown, great eyes, a garland), a lamp, a bell, offerings
      const ix = X(-c + t + 0.9), iz = cz;
      bag.add(STONE, box(ix - 0.8, y0, iz - 0.8, ix + 0.8, y0 + 0.5, iz + 0.8)); col.rect([ix - 0.8, iz - 0.8, ix + 0.8, iz + 0.8], y0, y0 + 0.5);
      bag.add('gilt_bronze', lathe([[0.001, 0], [0.34, 0.02], [0.4, 0.3], [0.32, 0.62], [0.2, 0.78], [0.001, 0.82]], 10, null, ix, y0 + 0.5, iz));
      bag.add('gilt_bronze', lathe([[0.25, 0], [0.3, 0.2], [0.14, 0.45], [0.001, 0.6]], 8, null, ix, y0 + 1.28, iz));
      for (const v of [-0.14, 0.14]) bag.add('paint_white', ball(0.07).translate(ix + sx * 0.3, y0 + 1.12, iz + v)), bag.add('iron', ball(0.03).translate(ix + sx * 0.37, y0 + 1.12, iz + v));
      bag.add('cloth_ochre', lathe([[0.42, 0], [0.45, 0.06], [0.42, 0.12], [0.38, 0.06]], 10, null, ix, y0 + 0.9, iz));
      for (const v of [-1.4, 1.4]) { const lx = X(-c + t + 1.3); bag.add('bronze', lathe([[0.001, 0], [0.2, 0], [0.25, 0.14], [0.001, 0.14]], 8, null, lx, y0, iz + v)); bag.add('flame', lathe([[0.03, 0], [0.001, 0.08]], 5, null, lx, y0 + 0.14, iz + v)); }
      bag.add('bronze', rod([X(c - t - 0.3), y0 + 2.05, cz], [X(c - t - 0.3), y0 + 1.5, cz], 0.02, 5)); bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.22], [0.001, 0.22]], 7, null, X(c - t - 0.3), y0 + 1.3, cz));
      { const dr = rect(-c + t, -c + t, c - t, c - t); bag.add('wood_ochre', box(dr[0], y0, dr[1], dr[2], y0 + 0.04, dr[3])); col.floor(dr, y0 + 0.04); void ch; }
      if (lights) lights.push({ at: [X(0), y0 + 2.0, cz], color: '#ffd9a0', intensity: 2.0, distance: 9 });
    } else {
      bag.add('brick', box(c0[0], yb, c0[1], c0[2], ye, c0[3]));
      if (i === 0) col.rect(c0, 0, ye + q.rise);
    }
    // the openings of the tier: a door on the front at the first, a lattice window on every face above [stated: a chamber with gates on the four sides — oocities]
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const door = i === 0 && dx === sx, w = door ? 0.9 : 0.55, hh = door ? 2.0 : 1.1, y0 = door ? yb : yb + 0.8, off = 0.03;
      const px = cx + dx * (q.core + off), pz = cz + dz * (q.core + off);
      if (!(door && el.chamber)) bag.add('opening', bx(px - (dz ? w : 0.02), y0, pz - (dx ? w : 0.02), px + (dz ? w : 0.02), y0 + hh, pz + (dx ? w : 0.02)));
      const fo = 0.08, fx = cx + dx * (q.core + fo), fz = cz + dz * (q.core + fo);
      bag.add('timber_red', bx(fx - (dz ? w + 0.12 : 0.03), y0, fz - (dx ? w + 0.12 : 0.03), fx + (dz ? w + 0.12 : 0.03), y0 + 0.1, fz + (dx ? w + 0.12 : 0.03)));
      bag.add('timber_red', bx(fx - (dz ? w + 0.12 : 0.03), y0 + hh, fz - (dx ? w + 0.12 : 0.03), fx + (dz ? w + 0.12 : 0.03), y0 + hh + 0.14, fz + (dx ? w + 0.12 : 0.03)));
      for (const s of [-1, 1]) bag.add('timber_red', bx(fx + (dz ? s * (w + 0.06) - 0.06 : 0), y0, fz + (dx ? s * (w + 0.06) - 0.06 : 0), fx + (dz ? s * (w + 0.06) + 0.06 : 0.03 * dx), y0 + hh, fz + (dx ? s * (w + 0.06) + 0.06 : 0.03 * dz)));
    }
    // the eave: a red fascia, the roof in two slopes (a gentle curve), gilt hip ridges, upturned corners
    const e = rect(-q.hw, -q.hw, q.hw, q.hw), ex = (e[0] + e[2]) / 2, ez = (e[1] + e[3]) / 2;
    bag.add('timber_red', bx(e[0], ye - 0.38, e[1], e[2], ye, e[1] + 0.12)); bag.add('timber_red', bx(e[0], ye - 0.38, e[3] - 0.12, e[2], ye, e[3]));
    bag.add('timber_red', bx(e[0], ye - 0.38, e[1] + 0.12, e[0] + 0.12, ye, e[3] - 0.12)); bag.add('timber_red', bx(e[2] - 0.12, ye - 0.38, e[1] + 0.12, e[2], ye, e[3] - 0.12));
    const hw2 = q.hw - run * 0.38, y2 = ye + q.rise * 0.3;
    bag.add('roof_tile', frustum([e[0], e[1], e[2], e[3]], ye, y2, run * 0.38, run * 0.38, run * 0.38, run * 0.38, { noBottom: false }));
    bag.add('roof_tile', frustum([ex - hw2, ez - hw2, ex + hw2, ez + hw2], y2, ye + q.rise, hw2 - next, hw2 - next, hw2 - next, hw2 - next, { noBottom: true }));
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      bag.add('gilt_bronze', rod([ex + a * q.hw, ye + 0.05, ez + b * q.hw], [ex + a * next, ye + q.rise, ez + b * next], 0.07, 5));
      bag.add('gilt_bronze', lathe([[0.1, 0], [0.06, 0.18], [0.001, 0.4]], 5, null, ex + a * (q.hw - 0.05), ye + 0.05, ez + b * (q.hw - 0.05)));
    }
    // the struts, at 45° from the wall to the eave, a carved board over each
    const ns = Math.max(3, Math.round(q.hw / 1.35));
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let s = 0; s < ns; s++) {
      const v = (-q.core + 0.6) + (2 * q.core - 1.2) * (ns > 1 ? s / (ns - 1) : 0.5), ou = Math.min(ov * 0.82, 2.4);
      const ax = dz ? v : q.core, az = dz ? q.core : v;
      const p0 = [cx + (dx ? dx * q.core : v), ye - 0.3 - ou, cz + (dz ? dz * q.core : v)], p1 = [cx + (dx ? dx * (q.core + ou) : v), ye - 0.38, cz + (dz ? dz * (q.core + ou) : v)];
      void ax; void az;
      bag.add('wood_painted', rod(p0, p1, 0.075, 5));
      const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
      bag.add('gilt_bronze', bx(mid[0] - (dz ? 0.13 : 0.05), mid[1] - 0.2, mid[2] - (dx ? 0.13 : 0.05), mid[0] + (dz ? 0.13 : 0.05), mid[1] + 0.2, mid[2] + (dx ? 0.13 : 0.05)));
    }
    // the bells along the eave [stated: 528 wind bells, the most on the lowest roof]
    const nb = Math.round(el.bells ? el.bells[i] : 8 * q.hw / 0.9 / 4);
    const per = 8 * q.hw;
    for (let b = 0; b < nb; b++) {
      let d = (b + 0.5) / nb * per, x, z;
      if (d < 2 * q.hw) { x = ex - q.hw + d; z = ez - q.hw; } else if (d < 4 * q.hw) { x = ex + q.hw; z = ez - q.hw + (d - 2 * q.hw); } else if (d < 6 * q.hw) { x = ex + q.hw - (d - 4 * q.hw); z = ez + q.hw; } else { x = ex - q.hw; z = ez + q.hw - (d - 6 * q.hw); }
      bag.add('bronze', lathe([[0.001, 0], [0.09, 0.02], [0.07, 0.16], [0.03, 0.22], [0.001, 0.22]], 5, null, x, ye - 0.62, z));
    }
    yb = ye + q.rise - 0.15;
  });
  // the pinnacle: a gilt vase, umbrellas and a spire
  const last = R[R.length - 1], top = yb + 0.15;
  bag.add('gilt_bronze', lathe([[0.7, 0], [0.7, 0.14], [0.45, 0.22], [0.62, 0.55], [0.3, 0.95], [0.4, 1.1], [0.16, 1.4], [0.55, 1.5], [0.55, 1.55], [0.14, 1.7], [0.28, 2.1], [0.09, 2.5], [0.035, 3.4], [0.001, 3.6]], 10, null, cx, top, cz));
  void last;
}

/** newar_shikhara { c, s }: a small stone temple — a stepped base, a cube with a door, a tower of stacked, narrowing courses, a ribbed crown and a gilt finial; ~11 m. */
export function shikhara(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 1;
  const hw = [2.7, 2.3, 1.9];
  hw.forEach((w, k) => { const r = [cx - w * s, cz - w * s, cx + w * s, cz + w * s]; bag.add(STONE, box(r[0], k * 0.35 * s, r[1], r[2], (k + 1) * 0.35 * s, r[3])); col.rect(r, 0, (k + 1) * 0.35 * s); col.floor(r, (k + 1) * 0.35 * s); });
  const y0 = 1.05 * s, wh = 2.6 * s, c = 1.5 * s;
  bag.add('sandstone', box(cx - c, y0, cz - c, cx + c, y0 + wh, cz + c)); col.rect([cx - c, cz - c, cx + c, cz + c], 0, y0 + wh);
  bag.add('opening', box(cx + c - 0.02, y0, cz - 0.5 * s, cx + c + 0.03, y0 + 1.7 * s, cz + 0.5 * s));
  bag.add('timber', box(cx + c, y0 + 1.7 * s, cz - 0.6 * s, cx + c + 0.1, y0 + 1.85 * s, cz + 0.6 * s));
  let y = y0 + wh, w = c;
  for (let k = 0; k < 6; k++) {
    const nw = w * (k < 5 ? 0.86 : 0.7), hh = (1.05 - k * 0.07) * s;
    bag.add('sandstone', frustum([cx - w - 0.1 * s, cz - w - 0.1 * s, cx + w + 0.1 * s, cz + w + 0.1 * s], y, y + 0.18 * s, 0.1 * s, 0.1 * s, 0.1 * s, 0.1 * s));
    bag.add('sandstone', frustum([cx - w, cz - w, cx + w, cz + w], y + 0.18 * s, y + hh, w - nw, w - nw, w - nw, w - nw));
    y += hh; w = nw;
  }
  bag.add('sandstone_dressed', lathe([[w * 1.35, 0], [w * 1.4, 0.2 * s], [w * 1.0, 0.4 * s], [w * 0.5, 0.5 * s]], 12, null, cx, y, cz));
  bag.add('gilt_bronze', lathe([[0.25 * s, 0], [0.3 * s, 0.25 * s], [0.12 * s, 0.6 * s], [0.04 * s, 1.3 * s], [0.001, 1.6 * s]], 8, null, cx, y + 0.5 * s, cz));
}

/** newar_chaitya { c, s }: a small stupa — a stone plinth, a white dome, the square harmika with its eyes, the thirteen gilt rings of the spire. */
export function chaitya(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 1;
  bag.add(STONE, box(cx - 0.85 * s, 0, cz - 0.85 * s, cx + 0.85 * s, 0.5 * s, cz + 0.85 * s)); col.rect([cx - 0.85 * s, cz - 0.85 * s, cx + 0.85 * s, cz + 0.85 * s], 0, 0.5 * s);
  bag.add('limewash_white', lathe([[0.7 * s, 0], [0.72 * s, 0.15 * s], [0.5 * s, 0.6 * s], [0.001, 0.8 * s]], 12, null, cx, 0.5 * s, cz));
  bag.add('gilt_bronze', box(cx - 0.25 * s, 1.3 * s, cz - 0.25 * s, cx + 0.25 * s, 1.55 * s, cz + 0.25 * s));
  const rings = []; for (let k = 0; k < 13; k++) rings.push([0.2 * s * (1 - k / 14) + 0.02 * s, k * 0.05 * s], [0.2 * s * (1 - k / 14) + 0.06 * s, k * 0.05 * s + 0.02 * s]);
  bag.add('gilt_bronze', lathe([[0.001, 0], ...rings.map(([r, y]) => [r, y]), [0.02 * s, 0.7 * s], [0.001, 0.95 * s]], 8, null, cx, 1.55 * s, cz));
}
