// The pieces the state rooms of Versailles are made of (docs/settlements/versailles.md §1c): a wall frame,
// arch rings, painted panels on flat, vaulted and coved surfaces, coved ceilings, parquet, and the
// furniture of the 1680s — silver tables, guéridons, orange-tree tubs and benches, crystal and silver
// chandeliers, the silver throne under its canopy, the state bed behind its balustrade, the billiard table.

import { Matrix4, Vector3 } from '../../core/three.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { planarWall } from '../byzantine/index.js';
import { ext } from '../renaissance/face.js';

export const GB = 'gilt_bronze', GD = 'gold', AG = 'silver', MS = 'marble_smooth', WM = 'pavonazzetto', RM = 'breccia_red', GM = 'revetment_green', DM = 'marble_dark', MI = 'steel_chrome', FR = 'paint_white', CR = 'glass_lamp';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * A wall frame: o [x, z] on the wall's plane, n [x, z] the unit normal into the room; u = up × n, so that
 * (u, up, n) is right-handed. Pieces are built in local coordinates (u along, y up, d out into the room)
 * and placed by the frame's matrix; `P(u, d)` gives the plan point.
 */
export function frame(bag, o, n) {
  const u = [n[1], -n[0]];
  const M = new Matrix4().set(u[0], 0, n[0], o[0], 0, 1, 0, 0, u[1], 0, n[1], o[1], 0, 0, 0, 1);
  const F = {
    o, n, u, M,
    P: (uu, d) => [o[0] + u[0] * uu + n[0] * d, o[1] + u[1] * uu + n[1] * d],
    /** the frame coordinate along the wall of a plan point */
    at: (x, z) => (x - o[0]) * u[0] + (z - o[1]) * u[1],
    add: (mat, g) => { if (g) bag.add(mat, g.applyMatrix4(M)); return g; },
    box: (mat, u0, u1, v0, v1, d0, d1) => F.add(mat, box(Math.min(u0, u1), Math.min(v0, v1), Math.min(d0, d1), Math.max(u0, u1), Math.max(v0, v1), Math.max(d0, d1))),
    /** a lathe standing upright at (u, d) */
    lathe: (mat, prof, uu, d, v, seg = 10) => F.add(mat, lathe(prof, seg, null, uu, v, d)),
    /** a lathe whose axis points into the room (discs, rosettes, faces of medallions), its back at d */
    disc: (mat, prof, uu, v, d, seg = 12) => { const g = lathe(prof, seg); g.rotateX(Math.PI / 2); g.translate(uu, v, d); return F.add(mat, g); },
    /** an outline in (u, y) extruded from d0 to d1 */
    shape: (mat, pts, d0, d1, holes = []) => F.add(mat, ext(pts, holes, d0, d1)),
    /** a slab parallel to the wall (planarWall in the frame: arches { uc, r, spring, sill }, holes { u0, u1, y0, y1 }) */
    slab: (mat, d0, d1, u0, u1, y0, y1, arches = [], holes = [], outline) => F.add(mat, planarWall({ o: [0, (d0 + d1) / 2], u: [1, 0], th: d1 - d0, u0, u1, y0, y1, arches, holes, outline })),
    /** a ring round an arch (an archivolt) from angle a0 to a1 */
    ring: (mat, uc, spring, r0, r1, d0, d1, a0 = 0, a1 = Math.PI, n = 14) => F.add(mat, ringGeo(uc, spring, r0, r1, d0, d1, a0, a1, n)),
  };
  return F;
}

/** An arch ring in local coordinates: sectors of a flat annulus from r0 to r1, d0 to d1. */
export function ringGeo(uc, spring, r0, r1, d0, d1, a0 = 0, a1 = Math.PI, n = 14) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const t0 = a0 + (a1 - a0) * k / n, t1 = a0 + (a1 - a0) * (k + 1) / n;
    const Q = (r, t, d) => [uc + r * Math.cos(t), spring + r * Math.sin(t), d];
    hexa(out, [Q(r0, t0, d0), Q(r1, t0, d0), Q(r1, t1, d0), Q(r0, t1, d0)], [Q(r0, t0, d1), Q(r1, t0, d1), Q(r1, t1, d1), Q(r0, t1, d1)]);
  }
  return fromTriangles(out);
}
export function hexa(out, b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}
/** A thin bar between two points (square section w). */
export function bar(a, b, w) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
  const g = box(-w / 2, 0, -w / 2, w / 2, L, w / 2);
  // the box's length (+y) turned onto the bar's direction: lookAt sets +z along it, then y → z
  g.applyMatrix4(new Matrix4().lookAt(new Vector3(dx, dy, dz), new Vector3(0, 0, 0), Math.abs(dy) > 0.99 * L ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0)).multiply(new Matrix4().makeRotationX(Math.PI / 2)));
  g.translate(a[0], a[1], a[2]);
  return g;
}

// ── painted panels ────────────────────────────────────────────────────────────────────────────────
// A surface is a map (s, t, off) → [x, y, z]: s and t in metres across it, off the stand-off into the room.
// Each panel is drawn as a few patches stacked at small stand-offs: the ground of the picture (sky, or a
// warm ground), clouds, figures as patches of their robes' colours and flesh, a glory; a gilt frame round it.

/** Triangles of a patch: an ellipse (or a rectangle) on the surface, facing into the room. */
function patchTris(map, sc, tc, rs, rt, off, rect = false, ring = 0) {
  const out = [], N = rect ? 1 : 16, R = rect ? 4 : Math.max(2, Math.ceil(Math.max(rs, rt) / 0.35));
  const pt = (s, t) => map(s, t, off);
  const push = (a, b, c) => {
    // flip to face the room: the normal along the direction of growing stand-off
    const n = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
    const s = (sc + 0), q0 = map(s, tc, off), q1 = map(s, tc, off + 1), dir = [q1[0] - q0[0], q1[1] - q0[1], q1[2] - q0[2]];
    if (n[0] * dir[0] + n[1] * dir[1] + n[2] * dir[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
  };
  if (rect) {
    // a grid of cells (the surface may curve); with ring > 0 only the border of that width
    const ns = Math.max(1, Math.ceil(2 * rs / 0.5)), nt = Math.max(1, Math.ceil(2 * rt / 0.5));
    for (let i = 0; i < ns; i++) for (let j = 0; j < nt; j++) {
      const s0 = sc - rs + 2 * rs * i / ns, s1 = sc - rs + 2 * rs * (i + 1) / ns, t0 = tc - rt + 2 * rt * j / nt, t1 = tc - rt + 2 * rt * (j + 1) / nt;
      if (ring) {
        // the frame: four bands
        continue;
      }
      push(pt(s0, t0), pt(s1, t0), pt(s1, t1)); push(pt(s0, t0), pt(s1, t1), pt(s0, t1));
    }
    if (ring) {
      for (const [a0, a1, b0, b1] of [[sc - rs - ring, sc + rs + ring, tc - rt - ring, tc - rt], [sc - rs - ring, sc + rs + ring, tc + rt, tc + rt + ring], [sc - rs - ring, sc - rs, tc - rt, tc + rt], [sc + rs, sc + rs + ring, tc - rt, tc + rt]]) {
        const ns = Math.max(1, Math.ceil((a1 - a0) / 0.5)), nt = Math.max(1, Math.ceil((b1 - b0) / 0.5));
        for (let i = 0; i < ns; i++) for (let j = 0; j < nt; j++) {
          const s0 = a0 + (a1 - a0) * i / ns, s1 = a0 + (a1 - a0) * (i + 1) / ns, t0 = b0 + (b1 - b0) * j / nt, t1 = b0 + (b1 - b0) * (j + 1) / nt;
          push(pt(s0, t0), pt(s1, t0), pt(s1, t1)); push(pt(s0, t0), pt(s1, t1), pt(s0, t1));
        }
      }
    }
    return out;
  }
  for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2;
    if (ring) {
      const P = (a, g) => pt(sc + Math.cos(a) * (rs + g), tc + Math.sin(a) * (rt + g));
      push(P(a0, 0), P(a1, 0), P(a1, ring)); push(P(a0, 0), P(a1, ring), P(a0, ring));
      continue;
    }
    for (let r = 0; r < R; r++) {
      const r0 = r / R, r1 = (r + 1) / R, P = (a, rr) => pt(sc + Math.cos(a) * rs * rr, tc + Math.sin(a) * rt * rr);
      if (r === 0) push(P(a0, 0), P(a0, r1), P(a1, r1));
      else { push(P(a0, r0), P(a0, r1), P(a1, r1)); push(P(a0, r0), P(a1, r1), P(a1, r0)); }
    }
  }
  return out;
}

/**
 * A painted panel { s, t, ws, wt, oval } on a surface map: the picture in its colours and its gilt frame.
 * kind: 'sky' (a glory in the heavens: figures on clouds), 'earth' (a scene on the ground: a warm ground under a
 * sky band), 'gold' (figures on a gold ground, the camaïeu of the coves).
 */
export function painting(bag, map, { s, t, ws, wt, oval = false, kind = 'sky', seed = 1, frame = 0.14, off = 0.02 }) {
  const rand = rng(seed), lay = new Map(), add = (mat, tris) => { if (!lay.has(mat)) lay.set(mat, []); lay.get(mat).push(...tris); };
  const rs = ws / 2, rt = wt / 2;
  const ground = kind === 'gold' ? 'paint_ochre' : 'stucco_sky';
  add(ground, patchTris(map, s, t, rs, rt, off, !oval));
  if (kind === 'earth') add('paint_robe', patchTris(map, s, t - rt * 0.55, rs * (oval ? 0.75 : 0.98), rt * 0.42, off + 0.013, !oval));
  // clouds, then the figures on them: robes and flesh, a gilt glory behind the principal one
  const inside = (u, v) => (oval ? (u * u + v * v < 0.6) : (Math.abs(u) < 0.8 && Math.abs(v) < 0.8));
  if (kind !== 'gold') for (let k = 0; k < 4; k++) {
    let u = rand() * 1.6 - 0.8, v = rand() * 1.2 - 0.7; if (!inside(u, v)) { u *= 0.6; v *= 0.6; }
    add('stucco_cream', patchTris(map, s + u * rs * 0.8, t + v * rt * 0.8, rs * (0.22 + rand() * 0.18), rt * (0.14 + rand() * 0.1), off + 0.026));
  }
  add(GD, patchTris(map, s + (rand() - 0.5) * rs * 0.3, t + rt * 0.15, rs * 0.2, rt * 0.2, off + 0.039));
  const ROBES = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_red', 'cloth_white', 'cloth_indigo'];
  const nf = 4 + Math.floor(rand() * 4);
  for (let k = 0; k < nf; k++) {
    let u = rand() * 1.4 - 0.7, v = rand() * 1.2 - 0.6; if (!inside(u, v)) { u *= 0.6; v *= 0.6; }
    const fs = s + u * rs * 0.85, ft = t + v * rt * 0.85, sz = 0.6 + rand() * 0.5;
    add(kind === 'gold' ? 'cloth_brown' : ROBES[k % ROBES.length], patchTris(map, fs, ft, rs * 0.07 * sz + 0.06, rt * 0.16 * sz + 0.08, off + 0.052));
    add(kind === 'gold' ? 'cloth_brown' : 'stucco_rose', patchTris(map, fs, ft + rt * 0.16 * sz + 0.1, 0.05 + rs * 0.025, 0.05 + rt * 0.03, off + 0.065));
  }
  if (frame) add(GD, patchTris(map, s, t, rs, rt, off + 0.078, !oval, frame));
  for (const [mat, tris] of lay) bag.add(mat, fromTriangles(tris));
}

/** A painting on a wall frame F: centred at u, y, of width w and height h, its back d off the wall. */
export function wallPainting(bag, F, u, y, w, h, opts = {}) {
  const d0 = opts.d ?? 0.02;
  const map = (s, t, off) => { const p = F.P(s, d0 + off); return [p[0], t, p[1]]; };
  painting(bag, map, { s: u, t: y, ws: w, wt: h, ...opts, off: 0 });
  // the moulded frame standing proud of the wall
  if (opts.moulding !== false) {
    const k = 0.1, dd = d0 + 0.09;
    if (opts.oval) F.add(GD, ringGeo(0, 0, 1, 1 + k * 2 / Math.max(w, h), 0, 0.055, 0, Math.PI * 2, 24).scale(w / 2, h / 2, 1).translate(u, y, d0));
    else { F.box(GD, u - w / 2 - k, u + w / 2 + k, y - h / 2 - k, y - h / 2, d0, dd); F.box(GD, u - w / 2 - k, u + w / 2 + k, y + h / 2, y + h / 2 + k, d0, dd); F.box(GD, u - w / 2 - k, u - w / 2, y - h / 2, y + h / 2, d0, dd); F.box(GD, u + w / 2, u + w / 2 + k, y - h / 2, y + h / 2, d0, dd); }
  }
}

// ── ceilings ─────────────────────────────────────────────────────────────────────────────────────

/**
 * A coved ceiling (voussures) over rect from y0: the cove rises `rise` while it reaches in `inset` (a quarter
 * ellipse), mitred at the corners, to the flat middle. Returns the maps of the cove's four sides and of the
 * middle, for its paintings: cove(side) (s along the side from its middle, t up the cove 0…1 in metres of
 * rise), flat (s along x from the middle, t along z).
 */
export function cove(bag, mat, rect, y0, rise, inset, n = 7) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, out = [];
  const at = (tau) => ({ i: inset * (1 - Math.cos(tau * Math.PI / 2)), y: y0 + rise * Math.sin(tau * Math.PI / 2) });
  const C = [cx, y0 - 2, cz];
  const push = (a, b, c) => {
    const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
    if (nx * (C[0] - m[0]) + ny * (C[1] - m[1]) + nz * (C[2] - m[2]) < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
  };
  for (let k = 0; k < n; k++) {
    const A = at(k / n), B = at((k + 1) / n);
    const ra = [[x0 + A.i, z0 + A.i], [x1 - A.i, z0 + A.i], [x1 - A.i, z1 - A.i], [x0 + A.i, z1 - A.i]], rb = [[x0 + B.i, z0 + B.i], [x1 - B.i, z0 + B.i], [x1 - B.i, z1 - B.i], [x0 + B.i, z1 - B.i]];
    for (let s = 0; s < 4; s++) {
      const j = (s + 1) % 4, a = [ra[s][0], A.y, ra[s][1]], b = [ra[j][0], A.y, ra[j][1]], c = [rb[j][0], B.y, rb[j][1]], d = [rb[s][0], B.y, rb[s][1]];
      push(a, b, c); push(a, c, d);
    }
  }
  const T = y0 + rise;
  push([x0 + inset, T, z0 + inset], [x1 - inset, T, z0 + inset], [x1 - inset, T, z1 - inset]); push([x0 + inset, T, z0 + inset], [x1 - inset, T, z1 - inset], [x0 + inset, T, z1 - inset]);
  bag.add(mat, fromTriangles(out));
  // the maps for paintings on it: a point at (s, t) on a side, stood off along the cove's normal
  const side = (f) => (s, t, off) => {
    const tau = Math.min(1, Math.max(0, Math.asin(Math.min(1, t / rise)) / (Math.PI / 2)));
    const P = at(tau), dn = [rise * Math.cos(tau * Math.PI / 2), -inset * Math.sin(tau * Math.PI / 2)], L = Math.hypot(dn[0], dn[1]) || 1;
    const ii = P.i + off * dn[0] / L, yy = P.y + off * dn[1] / L;
    return f === 'n' ? [cx + s, yy, z0 + ii] : f === 's' ? [cx - s, yy, z1 - ii] : f === 'w' ? [x0 + ii, yy, cz - s] : [x1 - ii, yy, cz + s];
  };
  return { side, flat: (s, t, off) => [cx + s, T - off, cz + t] };
}

// ── floors ──────────────────────────────────────────────────────────────────────────────────────

/** Parquet de Versailles: square panels set on the diagonal, the lattice of their frames, a border frieze. */
export function parquet(bag, col, rect, y, { panel = 1.1, border = 0.35 } = {}) {
  const [x0, z0, x1, z1] = rect;
  bag.add('wood_ochre', box(x0, y - 0.06, z0, x1, y, z1)); col.floor(rect, y);
  bag.add('timber', box(x0, y, z0, x1, y + 0.004, z0 + border)); bag.add('timber', box(x0, y, z1 - border, x1, y + 0.004, z1));
  bag.add('timber', box(x0, y, z0 + border, x0 + border, y + 0.004, z1 - border)); bag.add('timber', box(x1 - border, y, z0 + border, x1, y + 0.004, z1 - border));
  // the lattice: lines at 45° every panel·√2 across the field inside the border, clipped to it
  const a0 = x0 + border, a1 = x1 - border, b0 = z0 + border, b1 = z1 - border, step = panel * Math.SQRT2, w = 0.05, tris = [];
  for (const sg of [1, -1]) {
    // lines x − sg·z = c
    const cs = [a0 - sg * b0, a0 - sg * b1, a1 - sg * b0, a1 - sg * b1], cmin = Math.min(...cs), cmax = Math.max(...cs);
    for (let c = Math.ceil(cmin / step) * step; c <= cmax; c += step) {
      // clip the line x = c + sg·z to the field
      let zA = Math.max(b0, sg > 0 ? a0 - c : c - a1), zB = Math.min(b1, sg > 0 ? a1 - c : c - a0);
      if (sg < 0) { zA = Math.max(b0, c - a1); zB = Math.min(b1, c - a0); }
      if (zB - zA < 0.05) continue;
      const p0 = [c + sg * zA, zA], p1 = [c + sg * zB, zB], nx = -1 / Math.SQRT2 * w / 2, nz = sg / Math.SQRT2 * w / 2, yy = y + 0.004;
      tris.push(p0[0] - nx, yy, p0[1] - nz, p1[0] - nx, yy, p1[1] - nz, p1[0] + nx, yy, p1[1] + nz, p0[0] - nx, yy, p0[1] - nz, p1[0] + nx, yy, p1[1] + nz, p0[0] + nx, yy, p0[1] + nz);
    }
  }
  // all facing up
  for (let i = 0; i < tris.length; i += 9) {
    const ux = tris[i + 3] - tris[i], uz = tris[i + 5] - tris[i + 2], vx = tris[i + 6] - tris[i], vz = tris[i + 8] - tris[i + 2];
    if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; }
  }
  bag.add('timber', fromTriangles(tris));
}

/** A marble floor: white slabs with black lozenges at their corners and a border of red. */
export function marbleFloor(bag, col, rect, y, cell = 1.2) {
  const [x0, z0, x1, z1] = rect;
  bag.add('marble_floor', box(x0, y - 0.06, z0, x1, y, z1)); col.floor(rect, y);
  bag.add(RM, box(x0, y, z0, x1, y + 0.003, z0 + 0.3)); bag.add(RM, box(x0, y, z1 - 0.3, x1, y + 0.003, z1));
  bag.add(RM, box(x0, y, z0 + 0.3, x0 + 0.3, y + 0.003, z1 - 0.3)); bag.add(RM, box(x1 - 0.3, y, z0 + 0.3, x1, y + 0.003, z1 - 0.3));
  const tris = [], r = cell * 0.22;
  for (let x = x0 + 0.3 + cell; x < x1 - 0.3 - 0.2; x += cell) for (let z = z0 + 0.3 + cell; z < z1 - 0.3 - 0.2; z += cell) {
    const yy = y + 0.003;
    tris.push(x - r, yy, z, x, yy, z + r, x + r, yy, z, x - r, yy, z, x + r, yy, z, x, yy, z - r);
  }
  bag.add(DM, fromTriangles(tris));
}

// ── furniture of silver, crystal and gilt wood ─────────────────────────────────────────────────

/** A crystal chandelier hanging from `top`: the gilt stem and arms, candles, the drops and the chains of crystal. */
export function chandelier(bag, lights, x, y, z, top, { arms = 8, R = 0.62, lit = false, mat = GB, s = 1 } = {}) {
  bag.add(mat, box(x - 0.015, y + 1.1 * s, z - 0.015, x + 0.015, top, z + 0.015));
  bag.add(mat, lathe([[0.001, 0], [0.07, 0.05], [0.12, 0.2], [0.06, 0.38], [0.09, 0.6], [0.05, 0.85], [0.08, 1.0], [0.03, 1.1], [0.001, 1.12]].map(([r, h]) => [r * s, h * s]), 10, null, x, y, z));
  bag.add(CR, lathe([[0.001, 0], [0.06, 0.05], [0.07, 0.12], [0.001, 0.2]].map(([r, h]) => [r * s, h * s]), 8, null, x, y - 0.18 * s, z));
  for (let k = 0; k < arms; k++) {
    const a = (k + 0.5) / arms * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), ya = y + 0.32 * s;
    const ex = x + c * R * s, ez = z + sn * R * s;
    bag.add(mat, bar([x + c * 0.06 * s, ya, z + sn * 0.06 * s], [x + c * R * 0.6 * s, ya - 0.1 * s, z + sn * R * 0.6 * s], 0.022 * s));
    bag.add(mat, bar([x + c * R * 0.6 * s, ya - 0.1 * s, z + sn * R * 0.6 * s], [ex, ya + 0.12 * s, ez], 0.022 * s));
    bag.add(mat, lathe([[0.001, 0], [0.055, 0.02], [0.05, 0.05], [0.03, 0.07]].map(([r, h]) => [r * s, h * s]), 8, null, ex, ya + 0.12 * s, ez));
    bag.add('paint_white', lathe([[0.012 * s, 0], [0.012 * s, 0.17 * s], [0.003, 0.18 * s]], 6, null, ex, ya + 0.19 * s, ez));
    // the drops of crystal hanging from the arm and the chain looping to the crown
    bag.add(CR, lathe([[0.001, 0], [0.025, 0.04], [0.001, 0.1]].map(([r, h]) => [r * s, h * s]), 4, null, ex, ya - 0.04 * s, ez));
    bag.add(CR, lathe([[0.001, 0], [0.02, 0.03], [0.001, 0.08]].map(([r, h]) => [r * s, h * s]), 4, null, x + c * R * 0.6 * s, ya - 0.24 * s, z + sn * R * 0.6 * s));
    bag.add(CR, bar([x + c * 0.05 * s, y + 0.95 * s, z + sn * 0.05 * s], [x + c * R * 0.75 * s, ya + 0.05 * s, z + sn * R * 0.75 * s], 0.012 * s));
    if (lit && k % 2 === 0) lights.push({ at: [ex, ya + 0.37 * s, ez], color: '#ffb46b', intensity: 2.2, distance: 9 });
  }
}

/** A silver guéridon (a tall candlestand) with its girandole of candles; facing does not matter. */
export function gueridon(bag, col, lights, x, y, z, lit = false) {
  bag.add(AG, lathe([[0.3, 0], [0.28, 0.06], [0.14, 0.14], [0.08, 0.3], [0.11, 0.5], [0.05, 0.75], [0.07, 1.05], [0.04, 1.3], [0.16, 1.36], [0.18, 1.4], [0.001, 1.41]], 12, null, x, y, z));
  bag.add(AG, lathe([[0.001, 0], [0.05, 0.05], [0.04, 0.25], [0.001, 0.32]], 8, null, x, y + 1.41, z));
  for (let k = 0; k < 5; k++) {
    const a = k / 5 * Math.PI * 2, r = k ? 0.2 : 0, cx = x + Math.cos(a) * r, cz = z + Math.sin(a) * r;
    if (k) bag.add(AG, bar([x, y + 1.6, z], [cx, y + 1.66, cz], 0.02));
    bag.add(AG, lathe([[0.001, 0], [0.035, 0.02], [0.03, 0.05]], 6, null, cx, y + (k ? 1.66 : 1.72), cz));
    bag.add('paint_white', lathe([[0.011, 0], [0.011, 0.16], [0.003, 0.17]], 6, null, cx, y + (k ? 1.71 : 1.77), cz));
  }
  if (lit) lights.push({ at: [x, y + 1.94, z], color: '#ffb46b', intensity: 1.6, distance: 6 });
  col.circle(x, z, 0.3, y, y + 1.4);
}

/** A silver table (a console against the wall) on frame F at u: the top, the apron, four scrolled legs, a stretcher with a vase. */
export function silverTable(F, col, u, y, w = 1.5, dep = 0.7, d0 = 0.08) {
  F.box(AG, u - w / 2, u + w / 2, y + 0.8, y + 0.84, d0, d0 + dep);
  F.box(AG, u - w / 2 + 0.04, u + w / 2 - 0.04, y + 0.68, y + 0.8, d0 + 0.02, d0 + dep - 0.02);
  for (const su of [-1, 1]) for (const sd of [0, 1]) {
    const lu = u + su * (w / 2 - 0.1), ld = d0 + (sd ? dep - 0.12 : 0.08);
    F.lathe(AG, [[0.05, 0], [0.07, 0.06], [0.035, 0.25], [0.06, 0.45], [0.04, 0.62], [0.06, 0.68]], lu, ld, y, 8);
  }
  F.box(AG, u - w / 2 + 0.1, u + w / 2 - 0.1, y + 0.12, y + 0.16, d0 + dep / 2 - 0.03, d0 + dep / 2 + 0.03);
  F.lathe(AG, [[0.07, 0], [0.12, 0.08], [0.1, 0.2], [0.05, 0.26], [0.08, 0.32], [0.001, 0.33]], u, d0 + dep / 2, y + 0.16, 10);
  // a pair of silver vases (cassolettes) on the top
  for (const su of [-0.32, 0.32]) F.lathe(AG, [[0.06, 0], [0.04, 0.05], [0.1, 0.15], [0.09, 0.26], [0.05, 0.3], [0.07, 0.34], [0.001, 0.36]], u + su * w, d0 + dep / 2, y + 0.84, 10);
  const a = F.P(u - w / 2, d0), b = F.P(u + w / 2, d0 + dep);
  col.rect([a[0], a[1], b[0], b[1]], y, y + 0.84);
}

/** A silver tub (caisse) with its orange tree, standing at (x, z). */
export function orangeTub(bag, col, x, y, z, s = 0.36) {
  bag.add(AG, box(x - s, y, z - s, x + s, y + 0.7, z + s));
  bag.add(AG, box(x - s - 0.03, y + 0.66, z - s - 0.03, x + s + 0.03, y + 0.72, z + s + 0.03));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    bag.add(AG, box(x + sx * s - 0.05, y - 0.05, z + sz * s - 0.05, x + sx * s + 0.05, y + 0.76, z + sz * s + 0.05));
    bag.add(AG, lathe([[0.05, 0], [0.06, 0.05], [0.03, 0.1], [0.001, 0.15]], 8, null, x + sx * s, y + 0.76, z + sz * s));
  }
  // a raised panel with a sun on each side
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) bag.add(GD, box(x + dx * (s + 0.004) - Math.abs(dz) * 0.12 - 0.004, y + 0.28, z + dz * (s + 0.004) - Math.abs(dx) * 0.12 - 0.004, x + dx * (s + 0.004) + Math.abs(dz) * 0.12 + 0.004, y + 0.46, z + dz * (s + 0.004) + Math.abs(dx) * 0.12 + 0.004));
  bag.add('silt', box(x - s + 0.02, y + 0.7, z - s + 0.02, x + s - 0.02, y + 0.71, z + s - 0.02));
  bag.add('bark_dark', lathe([[0.05, 0], [0.04, 0.9], [0.03, 1.05]], 6, null, x, y + 0.7, z));
  bag.add('lotus_leaf', lathe([[0.001, 0], [0.32, 0.06], [0.45, 0.3], [0.42, 0.55], [0.25, 0.75], [0.001, 0.82]], 10, (th, i) => (i > 0 && i < 5 ? 1 + 0.1 * Math.cos(th * 5 + i) : 1), x, y + 1.62, z));
  for (let k = 0; k < 7; k++) { const a = k * 2.4, r = 0.36 + (k % 3) * 0.03, yy = y + 1.75 + (k % 4) * 0.13; bag.add('stucco_saffron', lathe([[0.001, 0], [0.03, 0.01], [0.035, 0.035], [0.001, 0.07]], 6, null, x + Math.cos(a) * r, yy, z + Math.sin(a) * r)); }
  col.rect([x - s - 0.05, z - s - 0.05, x + s + 0.05, z + s + 0.05], y, y + 0.76);
}

/** A silver bench (banquette) with its velvet cushion, along frame F at u. */
export function silverBench(F, col, u, y, w = 1.8, d = 0.15) {
  F.box('cloth_red', u - w / 2, u + w / 2, y + 0.4, y + 0.5, d, d + 0.5);
  F.box(AG, u - w / 2, u + w / 2, y + 0.32, y + 0.4, d, d + 0.5);
  for (const su of [-1, 1]) for (const sd of [0, 1]) F.lathe(AG, [[0.04, 0], [0.055, 0.05], [0.03, 0.18], [0.045, 0.3], [0.04, 0.32]], u + su * (w / 2 - 0.06), d + (sd ? 0.44 : 0.06), y, 8);
  const a = F.P(u - w / 2, d), b = F.P(u + w / 2, d + 0.5);
  col.rect([a[0], a[1], b[0], b[1]], y, y + 0.5);
}

/** A gilt bronze trophy of arms on a wall frame: cuirass, helmet, round shield, crossed spears and standards, a laurel. */
export function trophy(F, u, y, d, s = 1, mat = GB) {
  F.disc(mat, [[0.24 * s, 0], [0.24 * s, 0.03 * s], [0.2 * s, 0.05 * s], [0.001, 0.06 * s]], u, y + 0.55 * s, d, 12);                     // the shield behind
  for (const sg of [-1, 1]) {
    F.add(mat, bar([u - sg * 0.32 * s, y - 0.05 * s, d + 0.03], [u + sg * 0.36 * s, y + 1.25 * s, d + 0.03], 0.025 * s));            // spears
    F.shape(mat, [[u + sg * 0.33 * s, y + 1.05 * s], [u + sg * 0.55 * s, y + 1.0 * s], [u + sg * 0.5 * s, y + 0.8 * s], [u + sg * 0.3 * s, y + 0.86 * s]], d + 0.02, d + 0.035);   // standards
  }
  { const g = lathe([[0.001, -0.02], [0.16 * s, 0.02 * s], [0.2 * s, 0.22 * s], [0.15 * s, 0.4 * s], [0.18 * s, 0.48 * s], [0.001, 0.52 * s]], 10); g.scale(1, 1, 0.45); g.translate(u, y + 0.1 * s, d + 0.11 * s); F.add(mat, g); }   // cuirass
  F.lathe(mat, [[0.001, 0], [0.1 * s, 0.02 * s], [0.11 * s, 0.1 * s], [0.07 * s, 0.18 * s], [0.02 * s, 0.24 * s], [0.04 * s, 0.3 * s], [0.001, 0.31 * s]], u, d + 0.11 * s, y + 0.64 * s, 10);   // helmet with its crest
  F.ring(mat, u, y + 0.05 * s, 0.2 * s, 0.24 * s, d, d + 0.03, Math.PI * 1.1, Math.PI * 1.9, 6);                                          // a laurel swag below
}

/** A sculpted head: Apollo's (a face in a sunburst) or the Nemean lion's skin, on a keystone. */
export function mask(F, u, y, d, kind, s = 1) {
  if (kind === 'apollo') {
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; F.shape(GB, [[u + Math.cos(a - 0.12) * 0.14 * s, y + Math.sin(a - 0.12) * 0.14 * s], [u + Math.cos(a) * 0.3 * s, y + Math.sin(a) * 0.3 * s], [u + Math.cos(a + 0.12) * 0.14 * s, y + Math.sin(a + 0.12) * 0.14 * s]], d, d + 0.03); }
    F.disc(GB, [[0.001, 0], [0.14 * s, 0.02 * s], [0.15 * s, 0.05 * s], [0.12 * s, 0.09 * s], [0.001, 0.11 * s]], u, y, d, 12);
  } else {
    F.disc(GB, [[0.001, 0], [0.15 * s, 0.02 * s], [0.17 * s, 0.07 * s], [0.12 * s, 0.12 * s], [0.001, 0.14 * s]], u, y, d, 10);
    F.shape(GB, [[u - 0.2 * s, y - 0.05 * s], [u - 0.12 * s, y - 0.45 * s], [u, y - 0.3 * s], [u + 0.12 * s, y - 0.45 * s], [u + 0.2 * s, y - 0.05 * s]], d, d + 0.04);   // the skin's paws hanging
  }
}

/** A French-order capital in gilt bronze over a pilaster of width w at u: bell, the fleur-de-lis under the sun between two cockerels, volutes, abacus. */
export function frenchCapital(F, u, y, d, w, h = 0.95) {
  F.box(GB, u - w / 2 - 0.03, u + w / 2 + 0.03, y, y + 0.07, d - 0.01, d + 0.04);                 // astragal
  F.box(GB, u - w / 2, u + w / 2, y + 0.07, y + h - 0.15, d - 0.01, d + 0.015);                     // the bell
  const fy = y + 0.16;
  F.shape(GB, [[u, fy + 0.42], [u + 0.06, fy + 0.3], [u + 0.05, fy + 0.18], [u + 0.15, fy + 0.26], [u + 0.2, fy + 0.18], [u + 0.08, fy + 0.08], [u + 0.04, fy], [u - 0.04, fy], [u - 0.08, fy + 0.08], [u - 0.2, fy + 0.18], [u - 0.15, fy + 0.26], [u - 0.05, fy + 0.18], [u - 0.06, fy + 0.3]], d + 0.015, d + 0.05);
  F.box(GB, u - 0.12, u + 0.12, fy + 0.08, fy + 0.12, d + 0.015, d + 0.06);
  F.disc(GB, [[0.001, 0], [0.07, 0.01], [0.075, 0.03], [0.001, 0.04]], u, y + h - 0.26, d + 0.015, 10);           // the sun
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; F.add(GB, bar([u + Math.cos(a) * 0.07, y + h - 0.26 + Math.sin(a) * 0.07, d + 0.03], [u + Math.cos(a) * 0.12, y + h - 0.26 + Math.sin(a) * 0.12, d + 0.03], 0.018)); }
  for (const sg of [-1, 1]) {
    // a cockerel: the body, the tail up, the head with its comb
    const cx = u + sg * (w / 2 - 0.13);
    { const g = lathe([[0.001, -0.08], [0.06, -0.05], [0.07, 0.02], [0.04, 0.08], [0.001, 0.1]], 8); g.rotateZ(sg * 0.9); g.scale(1, 1, 0.6); g.translate(cx, fy + 0.2, d + 0.05); F.add(GB, g); }
    F.add(GB, bar([cx + sg * 0.05, fy + 0.22, d + 0.05], [cx + sg * 0.1, fy + 0.38, d + 0.05], 0.03));
    F.lathe(GB, [[0.001, 0], [0.03, 0.02], [0.025, 0.06], [0.001, 0.07]], cx - sg * 0.07, d + 0.05, fy + 0.28, 6);
    // the volute at the corner
    F.disc(GB, [[0.001, 0], [0.07, 0.01], [0.07, 0.05], [0.04, 0.07], [0.001, 0.08]], u + sg * (w / 2 - 0.02), y + h - 0.22, d, 10);
  }
  F.box(GB, u - w / 2 - 0.08, u + w / 2 + 0.08, y + h - 0.15, y + h, d - 0.01, d + 0.1);          // abacus
}
