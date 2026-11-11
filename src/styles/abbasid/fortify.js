// The Round City's defences (docs/settlements/abbasid-baghdad.md §2, §4): the three round walls (outer, main, inner) as rings of
// facets with bastions and crenellations, the moat, the four gates with their vaulted passages, iron doors and the cupola on
// teak columns over each main gate. Everything is built in a local frame (kit.local) so the facets stand at any angle.

import { box, fromTriangles, lathe } from '../../core/geom.js';
import { orientedBox, lineFrame, local, barrel, archBand, domeShell, merlons, archCurve, rng, D2R } from './kit.js';

/**
 * ring_wall: { c, r (the wall's middle), th, h, mat, gates: [angles deg] with `gap` (m, the gate's width along the wall),
 * n (facets per quadrant), towers (every k-th facet's end carries a bastion: { every, r (radius), h }), crenel, glacis: { w, drop } }.
 * The arcs between the gates are cut into n facets each, so the gates' faces are square to the wall.
 */
function ringWall(el, ctx) {
  const { bag } = ctx, [cx, cz] = el.c, gates = el.gates || [0, 90, 180, 270], half = Math.asin(Math.min(0.99, el.gap / 2 / el.r)) / D2R;
  const y0 = el.y ?? 0, mat = el.mat || 'brick_baked', th = el.th, H = el.h;
  for (let q = 0; q < gates.length; q++) {
    const a0 = gates[q] + half, a1 = (gates[(q + 1) % gates.length] + (q + 1 === gates.length ? 360 : 0)) - half, n = el.n ?? 24;
    const dth = (a1 - a0) * D2R / n, ext = th / 2 * Math.tan(dth / 2);
    for (let i = 0; i < n; i++) {
      const ta = (a0 + (a1 - a0) * i / n) * D2R, tb = (a0 + (a1 - a0) * (i + 1) / n) * D2R;
      const A = [cx + Math.cos(ta) * el.r, cz + Math.sin(ta) * el.r], B = [cx + Math.cos(tb) * el.r, cz + Math.sin(tb) * el.r];
      const L = Math.hypot(B[0] - A[0], B[1] - A[1]), yaw = -Math.atan2(B[1] - A[1], B[0] - A[0]);
      const eA = i === 0 ? 0 : ext, eB = i === n - 1 ? 0 : ext;
      // local frame: x along the chord, z inward; the outer face at z = −th/2
      local(ctx, A, yaw, (c) => {
        const { bag: g, col } = c;
        g.add(mat, box(-eA, y0 - 1, -th / 2, L + eB, y0 + H, th / 2));
        col.segment([-eA, 0], [L + eB, 0], th, y0, y0 + H);
        if (el.crenel) {
          for (const sd of [-1, 1]) merlons(g, mat, [0, sd * (th / 2 - 0.35)], [L, sd * (th / 2 - 0.35)], 0.7, y0 + H, { w: 0.9, gap: 0.8, h: 1.2 });
          g.add('plaster', box(0, y0 + H, -th / 2 + 0.7, L, y0 + H + 0.1, th / 2 - 0.7));
        }
        if (el.loops) {
          const m = Math.max(1, Math.floor(L / el.loops));
          for (let k = 0; k < m; k++) { const u = (k + 0.5) * L / m; g.add('opening', box(u - 0.12, y0 + H * 0.5, -th / 2 - 0.03, u + 0.12, y0 + H * 0.5 + 1.6, -th / 2 + 0.05)); }
        }
        if (el.band) for (let u = 0.3; u < L - 0.3; u += 0.3) g.add(mat, box(u, y0 + H - 1.0, -th / 2 - 0.09, u + 0.2, y0 + H - 0.84, -th / 2));
      });
      // a bastion at the joint (every k-th): a round tower standing out from the wall's face
      if (el.towers && i % el.towers.every === 0) {
        const t = el.towers, out = t.out ?? 0, tx = A[0] + Math.cos(ta) * out, tz = A[1] + Math.sin(ta) * out, ty = y0 + H + (t.h ?? 3);
        bag.add(mat, lathe([[t.r, -1], [t.r, ty - y0], [t.r + 0.35, ty - y0 + 0.01], [t.r + 0.35, ty - y0 + 0.45], [t.r - 0.2, ty - y0 + 0.45]], 16, null, tx, y0, tz));
        const k = 12;
        for (let j = 0; j < k; j++) { const aa = j / k * Math.PI * 2 + 0.13, x = tx + Math.cos(aa) * (t.r + 0.1), z = tz + Math.sin(aa) * (t.r + 0.1); bag.add(mat, box(x - 0.32, ty + 0.44, z - 0.32, x + 0.32, ty + 1.6, z + 0.32)); }
        bag.add('opening', lathe([[0.001, 0], [t.r * 0.45, 0]], 8, null, tx, ty + 0.46, tz));
        ctx.col.circle(tx, tz, t.r, y0, ty);
      }
    }
  }
  // the glacis: an earth slope against the outer face, from the wall's foot out and down
  if (el.glacis) {
    const g = el.glacis, out = [];
    for (let q = 0; q < gates.length; q++) {
      const a0 = (gates[q] + half) * D2R, a1 = ((gates[(q + 1) % gates.length] + (q + 1 === gates.length ? 360 : 0)) - half) * D2R, m = el.n ?? 24;
      for (let i = 0; i < m; i++) {
        const t0 = a0 + (a1 - a0) * i / m, t1 = a0 + (a1 - a0) * (i + 1) / m, ro = el.r + th / 2, ri = ro + g.w;
        const P = (t, r, y) => [cx + Math.cos(t) * r, y, cz + Math.sin(t) * r];
        out.push(...P(t0, ro - 0.1, y0 + g.top), ...P(t0, ri, y0 - g.drop), ...P(t1, ri, y0 - g.drop), ...P(t0, ro - 0.1, y0 + g.top), ...P(t1, ri, y0 - g.drop), ...P(t1, ro - 0.1, y0 + g.top));
      }
    }
    for (let i = 0; i < out.length; i += 9) { const ux = out[i + 3] - out[i], uz = out[i + 5] - out[i + 2], vx = out[i + 6] - out[i], vz = out[i + 8] - out[i + 2]; if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const t = out[i + 3 + k]; out[i + 3 + k] = out[i + 6 + k]; out[i + 6 + k] = t; } }
    bag.add(g.mat || 'ground', fromTriangles(out));
  }
}

/** moat: { c, r0, r1, y, gaps: [angles], gap (m), n } — water in a ring, broken where the gate roads cross it on causeways. */
function moat(el, { bag }) {
  const [cx, cz] = el.c, gates = el.gaps || [0, 90, 180, 270], half = Math.asin(Math.min(0.99, el.gap / 2 / el.r1)) / D2R, out = [];
  for (let q = 0; q < gates.length; q++) {
    const a0 = (gates[q] + half) * D2R, a1 = ((gates[(q + 1) % gates.length] + (q + 1 === gates.length ? 360 : 0)) - half) * D2R, m = el.n ?? 24;
    for (let i = 0; i < m; i++) {
      const t0 = a0 + (a1 - a0) * i / m, t1 = a0 + (a1 - a0) * (i + 1) / m, P = (t, r) => [cx + Math.cos(t) * r, el.y, cz + Math.sin(t) * r];
      out.push(...P(t0, el.r0), ...P(t0, el.r1), ...P(t1, el.r1), ...P(t0, el.r0), ...P(t1, el.r1), ...P(t1, el.r0));
    }
  }
  // (counter-clockwise from above, seen from the top: the winding is made upward below)
  for (let i = 0; i < out.length; i += 9) { const ux = out[i + 3] - out[i], uz = out[i + 5] - out[i + 2], vx = out[i + 6] - out[i], vz = out[i + 8] - out[i + 2]; if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const t = out[i + 3 + k]; out[i + 3 + k] = out[i + 6 + k]; out[i + 6 + k] = t; } }
  bag.add('water', fromTriangles(out));
}

/** The leaf of an iron-bound door, folded flat against the passage wall: a plank face, iron straps and studs. Local: the wall at x = 0, the leaf on +x. */
function doorLeaf(bag, x, z0, z1, h) {
  bag.add('cedar', box(x, 0, z0, x + 0.16, h, z1));
  const n = 4;
  for (let i = 0; i < n; i++) { const y = 0.7 + i * (h - 1.4) / (n - 1); bag.add('iron', box(x + 0.16, y - 0.1, z0, x + 0.2, y + 0.1, z1)); }
  for (let z = z0 + 0.3; z < z1 - 0.1; z += 0.34) for (let i = 0; i < 14; i++) bag.add('iron', box(x + 0.2, 0.3 + i * (h - 0.6) / 13 - 0.04, z - 0.04, x + 0.24, 0.3 + i * (h - 0.6) / 13 + 0.04, z + 0.04));
}

/**
 * round_gate: { at: [x, z], face (the outward direction, degrees: 0 east, 90 south…), D (depth through the wall), w (passage width),
 * hh (apex of the arch), H (height of the gate block), W (width of the block), kiosk (the cupola on teak columns), towers }.
 * Built facing +z (outward) and turned into place.
 */
function roundGate(el, ctx) {
  const D = el.D ?? 16, w = el.w ?? 6.5, hh = el.hh ?? 7.5, H = el.H ?? 20, W = el.W ?? 30.5, hw = W / 2, mat = el.mat || 'brick_baked';
  const yaw = (90 - el.face) * D2R;           // local +z = outward; a face of 90 (south) is the identity
  local(ctx, el.at, yaw, (c) => {
    const { bag, col } = c, rise = archCurve(w, hh).spring, spring = rise;
    // the two blocks either side of the passage, the mass over it, the base course
    for (const sd of [-1, 1]) {
      const x0 = sd < 0 ? -hw : w / 2, x1 = sd < 0 ? -w / 2 : hw;
      bag.add(mat, box(x0, -1, -D / 2, x1, H, D / 2));
      col.rect([x0, -D / 2, x1, D / 2], 0, H);
      bag.add('limestone', box(x0 - 0.2, -1, -D / 2 - 0.2, x1 + 0.2, 0.6, D / 2 + 0.2));
      // loops and a band of projecting brick under the parapet on the outer face
      for (let k = 0; k < 3; k++) { const xx = x0 + (k + 0.5) * (x1 - x0) / 3; for (const yy of [H * 0.42, H * 0.72]) bag.add('opening', box(xx - 0.12, yy, D / 2, xx + 0.12, yy + 1.4, D / 2 + 0.04)); }
      for (let u = x0 + 0.3; u < x1 - 0.3; u += 0.3) bag.add(mat, box(u, H - 1.0, D / 2, u + 0.22, H - 0.82, D / 2 + 0.09));
    }
    // over the passage: mass from the arch up to the platform
    bag.add(mat, box(-w / 2, hh, -D / 2, w / 2, H, D / 2));
    col.rect([-w / 2, -D / 2, w / 2, D / 2], hh, H);
    // the faces of the arch: a ring of alternating light and dark voussoirs on each face, set proud
    for (const sd of [-1, 1]) {
      c2(bag, mat, sd, w, hh, D, rise);
    }
    // the vaulted passage: a barrel from the springing, floor of paving
    barrel(bag, 'brick_buff', [-w / 2, -D / 2, w / 2, D / 2], spring, 'z', 10, hh - spring);
    bag.add('brick_paving', box(-w / 2, -0.2, -D / 2, w / 2, 0.02, D / 2));
    // the doors, standing open and folded back against the passage walls near the outer end
    doorLeaf(bag, -w / 2, D / 2 - 3.2, D / 2 - 0.15, hh - 1.0);
    {
      // the right leaf: mirror
      bag.add('cedar', box(w / 2 - 0.16, 0, D / 2 - 3.2, w / 2, hh - 1.0, D / 2 - 0.15));
      for (let i = 0; i < 4; i++) { const y = 0.7 + i * (hh - 2.4) / 3; bag.add('iron', box(w / 2 - 0.2, y - 0.1, D / 2 - 3.2, w / 2 - 0.16, y + 0.1, D / 2 - 0.15)); }
    }
    // the parapet round the platform and the terrace
    for (const [a, b] of [[[-hw, D / 2 - 0.4], [hw, D / 2 - 0.4]], [[-hw, -D / 2 + 0.4], [hw, -D / 2 + 0.4]], [[-hw + 0.4, -D / 2], [-hw + 0.4, D / 2]], [[hw - 0.4, -D / 2], [hw - 0.4, D / 2]]]) {
      merlons(bag, mat, a, b, 0.8, H, { w: 0.9, gap: 0.8, h: 1.1 });
    }
    bag.add('plaster', box(-hw, H, -D / 2, hw, H + 0.1, D / 2));
    col.floor([-hw, -D / 2, hw, D / 2], H + 0.1);          // the terrace over the gate (walkable if one gets there)
    // two round bastions flanking the outer face
    if (el.bast !== 0) for (const sd of [-1, 1]) {
      const tx = sd * (hw - 2.2), tz = D / 2 + 3.2, tH = H + 4;
      bag.add(mat, lathe([[5, -1], [5.1, 0.4], [5, tH * 0.9], [5.35, tH], [5.35, tH + 0.4], [4.8, tH + 0.4]], 20, null, tx, 0, tz));
      for (let j = 0; j < 14; j++) { const aa = j / 14 * Math.PI * 2 + 0.1; bag.add(mat, box(tx + Math.cos(aa) * 5.1 - 0.35, tH + 0.4, tz + Math.sin(aa) * 5.1 - 0.35, tx + Math.cos(aa) * 5.1 + 0.35, tH + 1.6, tz + Math.sin(aa) * 5.1 + 0.35)); }
      for (const yy of [H * 0.45, H * 0.8]) for (let j = 0; j < 5; j++) { const aa = Math.PI * 0.2 + j * 0.15 * Math.PI * 2 / 2.4; bag.add('opening', box(tx + Math.cos(aa) * 4.98 - 0.12, yy, tz + Math.sin(aa) * 4.98 - 0.12, tx + Math.cos(aa) * 4.98 + 0.12, yy + 1.5, tz + Math.sin(aa) * 4.98 + 0.12)); }
      col.circle(tx, tz, 5, 0, tH);
    }
    if (el.kiosk) cupola(c, H + 0.1);
  });
}
/** A ring of voussoirs on a gate face. */
function c2(bag, mat, sd, w, hh, D, rise) {
  const fr = { O: [-w / 2, sd * D / 2], U: [1, 0], N: [0, sd] };
  archBand(bag, fr, 0, 0, w, hh, 0.7, -0.0, 0.14);
}
/** The gate's cupola: a ring of twelve teak columns on a low plinth carrying a beam ring, a green dome above, a finial. */
function cupola(c, y) {
  const { bag, col } = c, R = 5.2, k = 12, hcol = 3.6;
  bag.add('brick_baked', lathe([[R + 1.1, 0], [R + 1.1, 0.5], [R + 0.7, 0.55], [0.001, 0.55]], 24, null, 0, y, 0));
  for (let i = 0; i < k; i++) {
    const a = i / k * Math.PI * 2, x = Math.cos(a) * R, z = Math.sin(a) * R;
    bag.add('cedar', lathe([[0.3, 0], [0.27, 0.2], [0.22, 0.4], [0.2, hcol * 0.5], [0.22, hcol - 0.4], [0.3, hcol - 0.2], [0.34, hcol]], 10, null, x, y + 0.55, z));
    col.circle(x, z, 0.3, y + 0.55, y + 0.55 + hcol);
  }
  bag.add('cedar', lathe([[R + 0.35, 0], [R + 0.35, 0.4], [R - 0.3, 0.4], [R - 0.3, 0]], 24, null, 0, y + 0.55 + hcol, 0));
  bag.add('plaster', lathe([[R + 0.45, 0], [R + 0.5, 0.2], [R + 0.35, 0.3], [R - 0.2, 0.3]], 24, null, 0, y + 0.55 + hcol + 0.4, 0));
  domeShell(bag, 'tile_green', 0, 0, R + 0.35, y + 0.55 + hcol + 0.7, { pointed: 0.35, seg: 24, rows: 8, cap: 2.2 });
  // a low divan under the dome and a rug, where the caliph's deputy gave audience
  bag.add('cloth_maroon', box(-2.2, 0.02 + y, -1.6, 2.2, 0.06 + y, 1.6));
  bag.add('cloth_indigo', box(-2.3, y, -1.7, 2.3, 0.02 + y, 1.7));
}

export const fortifyElements = { ring_wall: ringWall, moat, round_gate: roundGate };
