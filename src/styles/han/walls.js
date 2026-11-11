// Walls, gates, gate towers and the que of Han Chang'an (docs/settlements/han-changan.md §2, §5): the rammed-earth city wall with its
// parapet and walkable top, the palace walls, the ward walls with their little gates, the city gate of three passages under its tower,
// the que (a main tower with its lower subsidiary tower, in pairs before the gates), the pavilions that crown them.
import { box, lathe } from '../../core/geom.js';
import { rng, roofs, eaveTiles, hipLite } from './kit.js';

/**
 * han_wall: { a, b, th, h, mat, gaps: [{ at, w }] (distance from a to the centre), cap ('tile' | none), walk (the top walkable, with a parapet), face (the plaster band) }.
 * Axis-aligned.
 */
export function wall(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, alongX = Math.abs(bx - ax) >= Math.abs(bz - az);
  const L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), sg = alongX ? Math.sign(bx - ax) || 1 : Math.sign(bz - az) || 1, th = el.th, h = el.h, mat = el.mat ?? 'earth_wall';
  const gaps = (el.gaps ?? []).map((g) => [g.at - g.w / 2, g.at + g.w / 2]).sort((p, q) => p[0] - q[0]);
  const R = (s0, s1, t = th) => (alongX ? [Math.min(ax + sg * s0, ax + sg * s1), az - t / 2, Math.max(ax + sg * s0, ax + sg * s1), az + t / 2] : [ax - t / 2, Math.min(az + sg * s0, az + sg * s1), ax + t / 2, Math.max(az + sg * s0, az + sg * s1)]);
  const piece = (s0, s1) => {
    if (s1 - s0 < 0.05) return;
    const r = R(s0, s1);
    bag.add(mat, box(r[0], -0.3, r[1], r[2], h, r[3])); col.rect(r, -0.3, h);
    if (el.layers) {
      // the lifts of the rammed earth: a band of the next earth every 1.3 m on both faces
      for (let y = 0.9; y < h - 0.3; y += 1.3) {
        const q = alongX ? [r[0], r[1] - 0.03, r[2], r[1]] : [r[0] - 0.03, r[1], r[0], r[3]], q2 = alongX ? [r[0], r[3], r[2], r[3] + 0.03] : [r[2], r[1], r[2] + 0.03, r[3]];
        bag.add('mud_plaster', box(q[0], y, q[1], q[2], y + 0.16, q[3])); bag.add('mud_plaster', box(q2[0], y, q2[1], q2[2], y + 0.16, q2[3]));
      }
    }
    if (el.walk) {
      const p = 0.7, c = 0.6, rr = alongX ? [r[0], r[1] + c, r[2], r[3] - c] : [r[0] + c, r[1], r[2] - c, r[3]];
      void p;
      col.floor(rr, h);
      bag.add('brick_paving', box(rr[0], h - 0.02, rr[1], rr[2], h + 0.02, rr[3]));
      // the parapet along both edges, with crenels (a solid course and the merlons)
      const par = (q) => { bag.add(mat, box(q[0], h, q[1], q[2], h + 1.15, q[3])); col.rect(q, h, h + 1.15); bag.add('tile_grey', box(q[0] - 0.08, h + 1.15, q[1] - 0.08, q[2] + 0.08, h + 1.3, q[3] + 0.08)); };
      if (alongX) { par([r[0], r[1], r[2], r[1] + c]); par([r[0], r[3] - c, r[2], r[3]]); } else { par([r[0], r[1], r[0] + c, r[3]]); par([r[2] - c, r[1], r[2], r[3]]); }
    } else if (el.cap !== 'none') bag.add('tile_grey', box(r[0] - (alongX ? 0 : 0.2), h, r[1] - (alongX ? 0.2 : 0), r[2] + (alongX ? 0 : 0.2), h + 0.32, r[3] + (alongX ? 0.2 : 0)));
    // the plaster band at the foot where the street's wet reaches, weathering reads from the material
  };
  let s = 0;
  for (const [g0, g1] of gaps) { piece(s, Math.max(s, g0)); s = g1; }
  piece(s, L);
}

/** han_pavilion: { c, A, B, y (floor), h (columns), tiers (1 | 2), walls (true: plaster and lattice; false: open), seed } — a hipped-roof pavilion; two tiers: a tower (lou). */
export function pavilion(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, A = el.A, B = el.B, y = el.y, H = el.h ?? 3.4, walls = el.walls ?? true;
  const post = (x, z) => { bag.add('timber_red', lathe([[0.26, 0], [0.24, H]], 8, null, x, y, z)); bag.add('timber_red', box(x - 0.33, y + H, z - 0.33, x + 0.33, y + H + 0.26, z + 0.33)); };
  const nx = Math.max(2, Math.round(A * 2 / 3.2)), nz = Math.max(2, Math.round(B * 2 / 3.2));
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nz; j++) if (i === 0 || j === 0 || i === nx || j === nz) post(cx - A + 2 * A * i / nx, cz - B + 2 * B * j / nz);
  bag.add('timber_red', box(cx - A - 0.3, y + H - 0.4, cz - B - 0.3, cx + A + 0.3, y + H, cz + B + 0.3));
  if (walls) {
    for (const [x0, z0, x1, z1] of [[cx - A, cz - B, cx + A, cz - B + 0.3], [cx - A, cz + B - 0.3, cx + A, cz + B], [cx - A, cz - B, cx - A + 0.3, cz + B], [cx + A - 0.3, cz - B, cx + A, cz + B]]) {
      bag.add('lime_plaster', box(x0, y, z0, x1, y + 0.9, z1)); bag.add('lattice', box(x0, y + 0.9, z0, x1, y + H - 0.4, z1)); bag.add('lime_plaster', box(x0, y + H - 0.4, z0, x1, y + H, z1));
    }
    col.rect([cx - A, cz - B, cx + A, cz + B], y, y + H);
  } else {
    // open: a railing of red lacquer on four sides
    for (const [x0, z0, x1, z1] of [[cx - A, cz - B, cx + A, cz - B + 0.1], [cx - A, cz + B - 0.1, cx + A, cz + B], [cx - A, cz - B, cx - A + 0.1, cz + B], [cx + A - 0.1, cz - B, cx + A, cz + B]]) bag.add('lacquer_red', box(x0, y + 0.6, z0, x1, y + 0.75, z1));
    col.rect([cx - A, cz - B, cx + A, cz + B], y, y + H);
  }
  const ov = 1.7;
  const one = (yy, a, b, rise) => {
    hipLite({ c: [cx, cz], A: Math.max(a, b), B: Math.min(a, b), y: yy, rise, lift: 0.4, pow: 1.2, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, alongZ: b > a }, ctx);
    eaveTiles(bag, cx, cz, a, b, yy, 0.4, 0.4, 0.1);
  };
  if ((el.tiers ?? 1) === 2) {
    one(y + H + 0.1, A + ov, B + ov, 1.5);
    // the upper storey, set back: plaster and lattice under the second roof
    const a2 = A * 0.66, b2 = B * 0.66, y2 = y + H + 1.2;
    bag.add('lime_plaster', box(cx - a2, y2, cz - b2, cx + a2, y2 + 0.9, cz + b2)); bag.add('lattice', box(cx - a2 - 0.02, y2 + 0.9, cz - b2 - 0.02, cx + a2 + 0.02, y2 + H - 0.4, cz + b2 + 0.02)); bag.add('timber_red', box(cx - a2 - 0.3, y2 + H - 0.4, cz - b2 - 0.3, cx + a2 + 0.3, y2 + H, cz + b2 + 0.3));
    col.rect([cx - a2, cz - b2, cx + a2, cz + b2], y2, y2 + H);
    const ev = 1.5, aa = a2 + ev, bb = b2 + ev;
    hipLite({ c: [cx, cz], A: Math.max(aa, bb), B: Math.min(aa, bb), y: y2 + H + 0.1, rise: 2.8, lift: 0.4, pow: 1.2, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, alongZ: bb > aa }, ctx);
    eaveTiles(bag, cx, cz, aa, bb, y2 + H + 0.1, 0.4, 0.4, 0.1);
    bag.add('tile_dark', box(cx - 0.3, y2 + H + 2.7, cz - 0.3, cx + 0.3, y2 + H + 3.6, cz + 0.3));
  } else {
    one(y + H + 0.1, A + ov, B + ov, Math.max(1.8, Math.min(A, B) * 0.9));
    bag.add('tile_dark', box(cx - 0.25, y + H + Math.max(1.8, Math.min(A, B) * 0.9) + 0.1, cz - 0.25, cx + 0.25, y + H + Math.max(1.8, Math.min(A, B) * 0.9) + 0.8, cz + 0.25));
  }
}

/**
 * han_que: { at [x, z], sub [sx, sz] (the direction of the lower subsidiary tower: one axis ±1), h (the main tower), seed } — a que: the earth tower with its pavilion
 * and the lower tower beside it, sharing a plinth.
 */
export function que(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, h = el.h ?? 11, a = 2.8, [sx, sz] = el.sub ?? [1, 0];
  const plinth = [x - a - 0.6, z - a - 0.6, x + a + 0.6, z + a + 0.6];
  const sub = { x: x + sx * (a + 2.6), z: z + sz * (a + 2.6), a: 1.8, h: h * 0.6 };
  bag.add('bluestone', box(plinth[0], -0.3, plinth[1], plinth[2], 0.4, plinth[3])); col.rect(plinth, -0.3, 0.4);
  bag.add('bluestone', box(sub.x - sub.a - 0.5, -0.3, sub.z - sub.a - 0.5, sub.x + sub.a + 0.5, 0.4, sub.z + sub.a + 0.5));
  const tower = (cx, cz, aa, hh) => {
    bag.add('earth_wall', box(cx - aa, 0.4, cz - aa, cx + aa, hh, cz + aa)); col.rect([cx - aa, cz - aa, cx + aa, cz + aa], 0.4, hh);
    bag.add('palace_wall', box(cx - aa - 0.05, 0.4, cz - aa - 0.05, cx + aa + 0.05, 1.3, cz + aa + 0.05));
    bag.add('lime_plaster', box(cx - aa - 0.05, hh * 0.45, cz - aa - 0.05, cx + aa + 0.05, hh * 0.45 + 0.35, cz + aa + 0.05));
    bag.add('tile_grey', box(cx - aa - 0.35, hh - 0.35, cz - aa - 0.35, cx + aa + 0.35, hh, cz + aa + 0.35));
  };
  tower(x, z, a, h);
  tower(sub.x, sub.z, sub.a, sub.h);
  // the crowning pavilions (open, railed), the main one taller
  pavilion({ c: [x, z], A: a + 0.2, B: a + 0.2, y: h, h: 3.2, walls: false }, ctx);
  pavilion({ c: [sub.x, sub.z], A: sub.a + 0.2, B: sub.a + 0.2, y: sub.h, h: 2.6, walls: false }, ctx);
}

/**
 * han_gate: { c [x, z], axis ('x': the wall runs along x), th, h, n (passages), pw, tower (the pavilion over it) } — the gate's mass with its passages,
 * the floor of the passages left to the ground, a tower of two tiers (n = 3) or one over the top.
 */
export function gate(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, th = el.th, h = el.h, n = el.n ?? 3, pw = el.pw ?? 6, pier = el.pier ?? 2.4, ax = el.axis === 'x', ph = el.ph ?? Math.min(5.2, h - 2.5);
  const total = n * pw + (n - 1) * pier + 2 * 3, mat = el.mat ?? 'earth_wall';
  const U = (u, v) => (ax ? [cx + u, cz + v] : [cx + v, cz + u]);
  const R = (u0, v0, u1, v1) => { const a = U(u0, v0), b = U(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const solid = (u0, v0, u1, v1, y0, y1, m = mat) => { const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  // the piers (outer, between the passages) and the mass over the passages
  let u = -total / 2;
  const edges = [];
  solid(u, -th / 2, u + 3, th / 2, -0.3, h); u += 3;
  for (let i = 0; i < n; i++) {
    edges.push([u, u + pw]); u += pw;
    if (i < n - 1) { solid(u, -th / 2, u + pier, th / 2, -0.3, h); u += pier; }
  }
  solid(u, -th / 2, u + 3, th / 2, -0.3, h);
  solid(-total / 2, -th / 2, total / 2, th / 2, ph, h);
  // the lintel timbers under the mass, the red panels over the doorways, the plaster faces of the piers
  for (const [a, b] of edges) { const r = R(a, -th / 2 - 0.05, b, th / 2 + 0.05); bag.add('timber_red', box(r[0], ph - 0.5, r[1], r[2], ph, r[3])); }
  const full = R(-total / 2 - 0.05, -th / 2 - 0.05, total / 2 + 0.05, th / 2 + 0.05);
  bag.add('palace_wall', box(full[0], 0, full[1], full[2], 0.9, full[3]));
  bag.add('tile_grey', box(full[0] - 0.3, h - 0.3, full[1] - 0.3, full[2] + 0.3, h, full[3] + 0.3));
  // the top: a walkable terrace with a parapet, the tower on it
  const topR = R(-total / 2 + 0.4, -th / 2 + 0.6, total / 2 - 0.4, th / 2 - 0.6);
  col.floor(topR, h);
  const tc = U(0, 0);
  if (n > 1) {
    const la = Math.min(total / 2 - 2.5, 11), sh = th / 2 - 2.2;
    pavilion({ c: tc, A: ax ? la : sh, B: ax ? sh : la, y: h, h: 4.2, tiers: 2, walls: true }, ctx);
  } else {
    const la = total / 2 - 1, sh = Math.max(1.6, th / 2 - 0.8);
    pavilion({ c: tc, A: ax ? la : sh, B: ax ? sh : la, y: h, h: 3.0, tiers: 1, walls: true }, ctx);
  }
  if (ax === false) void 0;
}

/**
 * han_ward: { rect, gates: [{ side: 'w' | 'e', c (z) , w }] } — the ward's walls (rammed earth under a tile cap), a gate with its gatehouse at the end of each lane.
 */
export function ward(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, th = 1.5, h = 3.3;
  const gW = el.gates.filter((g) => g.side === 'w').map((g) => ({ at: g.c - z0, w: g.w })), gE = el.gates.filter((g) => g.side === 'e').map((g) => ({ at: g.c - z0, w: g.w }));
  wall({ a: [x0 + th / 2, z0 + th / 2], b: [x1 - th / 2, z0 + th / 2], th, h }, ctx);
  wall({ a: [x0 + th / 2, z1 - th / 2], b: [x1 - th / 2, z1 - th / 2], th, h }, ctx);
  wall({ a: [x0 + th / 2, z0], b: [x0 + th / 2, z1], th, h, gaps: gW }, ctx);
  wall({ a: [x1 - th / 2, z0], b: [x1 - th / 2, z1], th, h, gaps: gE }, ctx);
  for (const g of el.gates) {
    const gx = g.side === 'w' ? x0 + th / 2 : x1 - th / 2, gz = g.c, hw = g.w / 2;
    // the gate posts, the lintel, the gatehouse's roof (ridge along the wall), the two leaves left open
    for (const s of [-1, 1]) { bag.add('timber_red', box(gx - 0.4, 0, gz + s * hw - (s > 0 ? 0 : 0.4), gx + 0.4, h + 0.2, gz + s * hw + (s > 0 ? 0.4 : 0))); col.rect([gx - 0.4, gz + s * hw - (s > 0 ? 0 : 0.4), gx + 0.4, gz + s * hw + (s > 0 ? 0.4 : 0)], 0, h + 0.2); }
    bag.add('timber_red', box(gx - 0.45, h - 0.5, gz - hw - 0.4, gx + 0.45, h + 0.15, gz + hw + 0.4));
    roofs().gable_roof_c({ c: [gx, gz], A: hw + 1.3, B: 2.1, y: h + 0.1, rise: 1.5, mat: 'tile_grey', soffit: 'timber_red', noHorns: true, alongZ: true }, ctx);
    void bag; void rng;
  }
}
