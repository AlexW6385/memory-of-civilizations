// Sumerian architecture of Ur III (c. 2100–2000 BC; docs/settlements/ur.md §4): the ziggurat —
// stages of mud brick faced with baked brick, their walls sloping in and broken by shallow
// buttresses, the three stairways on the front meeting at a gatehouse, the shrine on top —
// buttressed precinct walls, courtyard buildings and courtyard houses of plastered mud brick.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../qing/index.js';

const BB = 'brick_baked', MB = 'mudbrick', MP = 'mud_plaster';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * A straight flight of brick steps rect, rising y0 → y1 toward dir: each step a slab half a metre deep under its
 * tread, the whole on a wedge of brickwork (only its sides and back built: the rest lies under the steps).
 */
function stairs(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, { y0, y1, dir } = el, mat = el.mat || BB, alongZ = dir === 'n' || dir === 's';
  const len = alongZ ? z1 - z0 : x1 - x0, n = Math.max(1, Math.round((y1 - y0) / 0.16)), rise = (y1 - y0) / n, tr = len / n, foot = y0 - 0.2;
  // s: distance along the run from its foot; (a, b): the plan coordinate across
  const at = (sd) => (dir === 's' ? z0 + sd : dir === 'n' ? z1 - sd : dir === 'e' ? x0 + sd : x1 - sd);
  for (let i = 0; i < n; i++) {
    const p0 = at(i * tr), p1 = at((i + 1) * tr), yy = y0 + (i + 1) * rise, lo = Math.max(foot, yy - 0.5), [q0, q1] = [Math.min(p0, p1), Math.max(p0, p1)];
    bag.add(mat, alongZ ? box(x0, lo, q0, x1, yy, q1) : box(q0, lo, z0, q1, yy, z1));
  }
  const top = y1 + rise - 0.5;
  if (top > foot + 0.05) {
    const T = [], pf = at(0), pb = at(len), P = (u, y, c) => (alongZ ? [c, y, u] : [u, y, c]), [c0, c1] = alongZ ? [x0, x1] : [z0, z1];
    for (const c of [c0, c1]) { const tri = [P(pf, foot, c), P(pb, foot, c), P(pb, top, c)]; T.push(...tri[0], ...tri[1], ...tri[2], ...tri[0], ...tri[2], ...tri[1]); }
    const q = [P(pb, foot, c0), P(pb, foot, c1), P(pb, top, c1), P(pb, top, c0)]; T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]);
    bag.add(mat, fromTriangles(T));
  }
  col.ramp([x0, z0, x1, z1], y0, y1, dir);
}
/** Shallow buttresses along the faces of a sloping stage [x0, z0, x1, z1] from y to y + h (inset at the top by b). */
function buttresses(bag, [x0, z0, x1, z1], y, h, b, step = 3.2, skip = null) {
  for (const [ax, az, bx, bz, nx, nz] of [[x0, z0, x1, z0, 0, -1], [x0, z1, x1, z1, 0, 1], [x0, z0, x0, z1, -1, 0], [x1, z0, x1, z1, 1, 0]]) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / step);
    for (let i = 1; i < n; i++) {
      const s = i * L / n, px = ax + (bx - ax) * s / L, pz = az + (bz - az) * s / L;
      if (skip && skip(px, pz)) continue;
      const tx = nz !== 0 ? 0.55 : 0.35, tz = nx !== 0 ? 0.55 : 0.35;
      bag.add(BB, frustum([px - tx + nx * 0.2, pz - tz + nz * 0.2, px + tx + nx * 0.2, pz + tz + nz * 0.2], y, y + h * 0.97, nx > 0 ? 0 : nx < 0 ? b : 0, nx > 0 ? b : 0, nz < 0 ? b : 0, nz > 0 ? b : 0));
    }
  }
}

/**
 * ziggurat: { c, y, stages: [{ w, d, h, batter }], front ('n' | 's'), shrine: { w, d, h } }: the stages
 * sloping in, buttressed; on the front the central stair projecting out to the first stage's top and
 * two stairs leaning on the wall from the corners, meeting at the gatehouse; a single stair on up;
 * the shrine on the top stage.
 */
function ziggurat(el, ctx) {
  if (el.front === 's') return ziggurat({ ...el, front: 'n' }, mirrored(ctx, el.c[1]));
  const { bag, col } = ctx, [cx, cz] = el.c;
  let y = el.y ?? 0;
  const tops = [];
  el.stages.forEach((s, i) => {
    const r = [cx - s.w / 2, cz - s.d / 2, cx + s.w / 2, cz + s.d / 2], b = s.batter ?? s.h * 0.12;
    bag.add(BB, frustum(r, y, y + s.h, b, b, b, b, { noBottom: true }));
    buttresses(bag, r, y, s.h, b, 3.2, (px) => Math.abs(px - cx) < 5);
    col.rect([r[0] + b * 0.4, r[1] + b * 0.4, r[2] - b * 0.4, r[3] - b * 0.4], y, y + s.h);
    col.floor([r[0] + b, r[1] + b, r[2] - b, r[3] - b], y + s.h);
    tops.push({ r, b, y0: y, y1: y + s.h });
    // the weeper holes: rows of small dark drains through the baked-brick skin, midway between the buttresses
    for (const [ax, az, bx, bz, nx, nz] of [[r[0], r[1], r[2], r[1], 0, -1], [r[0], r[3], r[2], r[3], 0, 1], [r[0], r[1], r[0], r[3], -1, 0], [r[2], r[1], r[2], r[3], 1, 0]]) {
      const L = Math.hypot(bx - ax, bz - az), n = Math.floor(L / 3.2);
      for (let k = 0; k < n; k++) {
        const u = (k + 0.5) * L / n, px = ax + (bx - ax) * u / L, pz = az + (bz - az) * u / L;
        if (nz < 0 && Math.abs(px - cx) < 7) continue;                       // not behind the stairs
        if (nz < 0 && i === 0 && Math.abs(px - cx) > s.w / 2 - 4) continue;
        for (let yy = y + 1.4; yy < y + s.h - 1; yy += 1.8) {
          const f = (yy - y) / s.h, o = b * f, fx = px - nx * o, fz = pz - nz * o, hw = 0.13, hd = 0.09;
          bag.add('opening', nx ? box(fx - hd, yy, fz - hw, fx + hd, yy + 0.22, fz + hw) : box(fx - hw, yy, fz - hd, fx + hw, yy + 0.22, fz + hd));
        }
      }
    }
    y += s.h;
  });
  const S0 = tops[0], fz = S0.r[1];                          // the front face (north)
  // the central stair, out from the face to the first stage's top; the two leaning stairs
  const run = S0.y1 - S0.y0;
  stairs({ rect: [cx - 4, fz - run * 1.9, cx + 4, fz + S0.b + 0.5], y0: S0.y0, y1: S0.y1, dir: 's', mat: BB }, { bag, col });
  // the central stair's parapets: low walls rising with it
  for (const sx of [-1, 1]) {
    const t = [], za = fz - run * 1.9, zb = fz + S0.b + 0.5;
    beamTris(t, [cx + sx * 4.3, S0.y0, za], [cx + sx * 4.3, S0.y1, zb], 0.3, 1.0);
    bag.add(BB, fromTriangles(t)); col.segment([cx + sx * 4.3, za], [cx + sx * 4.3, zb], 0.6, S0.y0, S0.y1 + 1);
  }
  for (const s of [-1, 1]) {
    const x0 = cx + s * (S0.r[2] - cx - 3), x1 = cx + s * 5;
    stairs({ rect: [Math.min(x0, x1), fz - 1, Math.max(x0, x1), fz + 4], y0: S0.y0, y1: S0.y1, dir: s < 0 ? 'e' : 'w', mat: BB }, { bag, col });
    bag.add(BB, frustum([Math.min(x0, x1), fz - 1.4, Math.max(x0, x1), fz - 1], S0.y0, S0.y1 + 0.8, 0, 0, 0, 0));
  }
  // the gatehouse at the head of the stairs, with its arched way
  const gz = fz + S0.b + 1;
  bag.add(MP, box(cx - 6, S0.y1, gz, cx - 2, S0.y1 + 5, gz + 6)); bag.add(MP, box(cx + 2, S0.y1, gz, cx + 6, S0.y1 + 5, gz + 6));
  bag.add(MP, box(cx - 6, S0.y1 + 3.8, gz, cx + 6, S0.y1 + 5, gz + 6));
  col.rect([cx - 6, gz, cx - 2, gz + 6], S0.y1, S0.y1 + 5); col.rect([cx + 2, gz, cx + 6, gz + 6], S0.y1, S0.y1 + 5);
  // the stairs on up the second and third stages
  for (let i = 1; i < tops.length; i++) {
    const T = tops[i], f = T.r[1], h = T.y1 - T.y0;
    stairs({ rect: [cx - 2.5, f - h * 1.6, cx + 2.5, f + T.b + 0.3], y0: T.y0, y1: T.y1, dir: 's', mat: BB }, { bag, col });
  }
  // the shrine: a buttressed house of the god, plastered, with its door to the stair
  const top = tops[tops.length - 1], sh = el.shrine, sr = [cx - sh.w / 2, cz - sh.d / 2 + 1, cx + sh.w / 2, cz + sh.d / 2 + 1];
  bag.add(MP, box(sr[0], top.y1, sr[1], sr[2], top.y1 + sh.h, sr[3])); col.rect(sr, top.y1, top.y1 + sh.h);
  buttresses(bag, sr, top.y1, sh.h, 0, 1.6, (px, pz) => Math.abs(px - cx) < 1.2 && pz < cz);
  const t = []; beamTris(t, [cx - 0.9, top.y1, sr[1] - 0.03], [cx + 0.9, top.y1, sr[1] - 0.03], 0.04, 2.4); bag.add('lacquer_black', fromTriangles(t));
  bag.add('paint_blue', box(sr[0] - 0.1, top.y1 + sh.h - 0.6, sr[1] - 0.1, sr[2] + 0.1, top.y1 + sh.h, sr[3] + 0.1));
}

/** The build context seen in a mirror across the line z = cz: what is built north of it lands south, the stairs turned. */
function mirrored(ctx, cz) {
  const fz = (r) => [r[0], 2 * cz - r[3], r[2], 2 * cz - r[1]];
  const bag = {
    add(mat, g) {
      if (!g) return;
      g = g.index ? g.toNonIndexed() : g;
      const P = g.attributes.position.array, N = g.attributes.normal.array;
      for (let i = 0; i < P.length; i += 3) { P[i + 2] = 2 * cz - P[i + 2]; N[i + 2] = -N[i + 2]; }
      for (let i = 0; i < P.length; i += 9) for (let k = 0; k < 3; k++) { let t = P[i + 3 + k]; P[i + 3 + k] = P[i + 6 + k]; P[i + 6 + k] = t; t = N[i + 3 + k]; N[i + 3 + k] = N[i + 6 + k]; N[i + 6 + k] = t; }
      g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
      ctx.bag.add(mat, g);
    },
  };
  const col = {
    rect: (r, y0, y1) => ctx.col.rect(fz(r), y0, y1),
    floor: (r, y, tag) => ctx.col.floor(fz(r), y, tag),
    ramp: (r, y0, y1, dir) => ctx.col.ramp(fz(r), y0, y1, dir === 'n' ? 's' : dir === 's' ? 'n' : dir),
    segment: (a, b, th, y0, y1) => ctx.col.segment([a[0], 2 * cz - a[1]], [b[0], 2 * cz - b[1]], th, y0, y1),
    circle: (x, z, r, y0, y1) => ctx.col.circle(x, 2 * cz - z, r, y0, y1),
  };
  return { ...ctx, bag, col };
}

/** precinct_wall: a buttressed mud-brick wall a→b { h, th }, plastered, its top a walk. */
function precinctWall(el, { bag, col }) {
  const a = el.a, b = el.b, h = el.h ?? 6, th = el.th ?? 3, t = [], y = el.y ?? 0;
  beamTris(t, [a[0], y, a[1]], [b[0], y, b[1]], th / 2, h); bag.add(el.mat ?? MB, fromTriangles(t));
  col.segment(a, b, th, y, y + h);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, n = Math.floor(L / 4);
  for (let i = 1; i < n; i++) for (const s of [-1, 1]) {
    const px = a[0] + ux * i * L / n - uz * s * (th / 2 + 0.25), pz = a[1] + uz * i * L / n + ux * s * (th / 2 + 0.25), q = [];
    beamTris(q, [px - ux * 0.6, y, pz - uz * 0.6], [px + ux * 0.6, y, pz + uz * 0.6], 0.25, h - 0.1); bag.add(el.mat ?? MB, fromTriangles(q));
  }
}

/** courtyard_block: a great courtyard building { rect, h, ring (depth of the rooms), door ('n'|'s'|'e'|'w') }: rooms round an open court, buttressed outer walls, flat roofs. */
function courtyardBlock(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 6, d = el.ring ?? 10, m = el.mat ?? MP;
  const door = el.door || 's', xc = (x0 + x1) / 2, zc = (z0 + z1) / 2, dc = door === 'n' || door === 's' ? xc : zc;
  const dw = Math.min(3.2, d * 0.3), dh = Math.min(h - 1.5, 4.2), dep = Math.min(1.4, d * 0.2);
  const wings = { n: [x0, z0, x1, z0 + d], s: [x0, z1 - d, x1, z1], w: [x0, z0 + d, x0 + d, z1 - d], e: [x1 - d, z0 + d, x1, z1 - d] };
  for (const [f, r] of Object.entries(wings)) {
    // the gateway: a deep doorway in the middle of its side
    niched(bag, r, h, f, f === door ? [{ u0: dc - dw / 2, u1: dc + dw / 2, v0: -0.3, v1: dh, depth: dep }] : [], m, m, 0);
    col.rect(r, 0, h); col.floor(r, h);
  }
  // shallow buttresses, and at the gateway two towers projecting either side of it (Koldewey on Esagila: a great
  // gateway in the middle of each side between massive projecting towers)
  const tw = Math.min(4, d * 0.4), pr = 1.6, H = h + 1.5;
  buttresses(bag, [x0, z0, x1, z1], 0, h, 0, 3.5, (px, pz) => Math.abs((door === 'n' || door === 's' ? px : pz) - dc) < dw / 2 + tw + 1 && (door === 'n' ? pz <= z0 + 0.01 : door === 's' ? pz >= z1 - 0.01 : door === 'w' ? px <= x0 + 0.01 : px >= x1 - 0.01));
  const P = (u, v, w) => (door === 'n' ? [u, v, z0 + w] : door === 's' ? [u, v, z1 - w] : door === 'w' ? [x0 + w, v, u] : [x1 - w, v, u]);
  const pl = (mat, u0, v0, u1, v1, w0, w1) => { const a = P(u0, v0, w0), b = P(u1, v1, w1); const q = [Math.min(a[0], b[0]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[2], b[2])]; bag.add(mat, box(q[0], a[1], q[1], q[2], b[1], q[3])); return q; };
  for (const sx of [-1, 1]) {
    const u0 = sx < 0 ? dc - dw / 2 - tw : dc + dw / 2, q = pl(m, u0, -0.3, u0 + tw, H, -pr, 0.4);
    col.rect(q, 0, H); col.floor(q, H);
    for (const k of [0.3, 0.7]) pl(m, u0 + k * tw - 0.3, -0.3, u0 + k * tw + 0.3, H - 0.1, -pr - 0.2, -pr + 0.05);   // its own buttresses
  }
  pl(m, dc - dw / 2, dh + 0.4, dc + dw / 2, h, -pr, 0);                                                  // the gateway's lintel mass between the towers
  // the doors: two leaves of cedar bound with bronze at the back of the doorway, a brick threshold
  pl('cedar', dc - dw / 2 + 0.02, 0.1, dc + dw / 2 - 0.02, dh, dep - 0.08, dep);
  for (const v of [0.5, dh / 2, dh - 0.5]) pl('bronze', dc - dw / 2 + 0.02, v - 0.07, dc + dw / 2 - 0.02, v + 0.07, dep - 0.1, dep - 0.08);
  pl('lacquer_black', dc - 0.02, 0.1, dc + 0.02, dh, dep - 0.1, dep - 0.08);
  pl(BB, dc - dw / 2, -0.3, dc + dw / 2, 0.1, -pr, dep - 0.08);
  bag.add(BB, box(x0 + d, 0, z0 + d, x1 - d, 0.08, z1 - d));
}

/**
 * A solid wing r = [x0, z0, x1, z1] from 0 to h with rectangular niches cut into its `face` (n|s|w|e): each
 * { u0, u1 (along the face), v0, v1 (up), depth }. Built in two materials: `low` up to `base`, `up` above it.
 */
function niched(bag, r, h, face, niches, low, up, base) {
  const [x0, z0, x1, z1] = r, alongX = face === 'n' || face === 's', A = alongX ? x0 : z0, Bn = alongX ? x1 : z1;
  const add = (q, y0, y1) => {
    if (y1 - y0 < 1e-3) return;
    if (y0 < base) bag.add(low, box(q[0], y0, q[1], q[2], Math.min(base, y1), q[3]));
    if (y1 > base) bag.add(up, box(q[0], Math.max(base, y0), q[1], q[2], y1, q[3]));
  };
  // q from an interval along the face and a depth range measured in from the face
  const slab = (u0, u1, d0, d1) => {
    if (face === 'n') return [u0, z0 + d0, u1, z0 + d1]; if (face === 's') return [u0, z1 - d1, u1, z1 - d0];
    if (face === 'w') return [x0 + d0, u0, x0 + d1, u1]; return [x1 - d1, u0, x1 - d0, u1];
  };
  const T = alongX ? z1 - z0 : x1 - x0, list = niches.filter((o) => o.u0 > A && o.u1 < Bn).sort((p, q) => p.u0 - q.u0);
  let u = A;
  for (const o of list) {
    add(slab(u, o.u0, 0, T), -0.3, h);
    add(slab(o.u0, o.u1, o.depth, T), -0.3, h);
    add(slab(o.u0, o.u1, 0, o.depth), -0.3, o.v0); add(slab(o.u0, o.u1, 0, o.depth), o.v1, h);
    u = o.u1;
  }
  add(slab(u, Bn, 0, T), -0.3, h);
}

/**
 * ur_house: a courtyard house { rect, seed } (Woolley's houses at Ur): rooms round a court paved in brick, one or
 * two storeys; the walls of baked brick in their lower courses and plastered mud brick above, some whitewashed;
 * blank to the lane but for a narrow doorway with a wooden door and lintel, and in two-storey houses a few small
 * latticed windows above; projecting gutters at the roof; a flat roof with a low parapet; a stair of brick in the
 * court to the roof or to the wooden gallery that runs round the court of a two-storey house.
 */
function urHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0;
  const d = Math.min(3.8, Math.min(W, D) * 0.3), two = rand() < 0.45, H = two ? 6 : 3.4;
  const up = rand() < 0.3 ? 'limewash_white' : MP, base = 0.8 + Math.round(rand() * 3) * 0.15;
  const side = Math.floor(rand() * 4), faces = ['n', 's', 'w', 'e'];
  const wings = { n: [x0, z0, x1, z0 + d], s: [x0, z1 - d, x1, z1], w: [x0, z0 + d, x0 + d, z1 - d], e: [x1 - d, z0 + d, x1, z1 - d] };
  // the doorway near a corner of its side (the lobby turns the visitor away from the court), windows above
  const span = (f) => (f === 'n' || f === 's' ? [x0 + 0.8, x1 - 0.8] : [z0 + d + 0.8, z1 - d - 0.8]);
  const [s0, s1] = span(faces[side]), du = s0 + (rand() < 0.5 ? 0.25 : 0.75) * (s1 - s0);
  const door = { u0: du - 0.5, u1: du + 0.5, v0: -0.3, v1: 2.1, depth: 0.3 };
  for (const f of faces) {
    const r = wings[f], niches = [];
    if (f === faces[side]) niches.push(door);
    if (two && (f === 'n' || f === 's' ? W : D) > 7 && rand() < 0.7) {
      const [a, b] = span(f);
      for (const k of [0.1, 0.9]) { const c = a + k * (b - a); if (f === faces[side] && Math.abs(c - du) < 1.2) continue; niches.push({ u0: c - 0.3, u1: c + 0.3, v0: 4.1, v1: 4.75, depth: 0.12, win: true }); }
    }
    niched(bag, r, H, f, niches, BB, up, base);
    col.rect(r, 0, H); col.floor(r, H);
    for (const o of niches) {
      const P = (u, v, w) => (f === 'n' ? [u, v, z0 + w] : f === 's' ? [u, v, z1 - w] : f === 'w' ? [x0 + w, v, u] : [x1 - w, v, u]);
      const pl = (mat, u0, v0, u1, v1, w0, w1) => { const a = P(u0, v0, w0), b = P(u1, v1, w1); bag.add(mat, box(Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2]), Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2]))); };
      if (o.win) { pl('lattice', o.u0, o.v0, o.u1, o.v1, o.depth - 0.04, o.depth); pl('cedar', o.u0 - 0.06, o.v0 - 0.08, o.u1 + 0.06, o.v0, -0.06, 0.02); continue; }
      pl('cedar', o.u0 + 0.01, 0.12, o.u1 - 0.01, o.v1, o.depth - 0.06, o.depth);        // the door, at the back of its reveal
      pl('cedar', o.u0 - 0.15, o.v1, o.u1 + 0.15, o.v1 + 0.16, -0.03, 0.02);            // the lintel, set in the wall face
      pl(BB, o.u0, -0.3, o.u1, 0.12, 0, o.depth);                                       // the threshold
    }
  }
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z1], [x1, z1]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]]]) { const t = []; beamTris(t, [a[0], H, a[1]], [b[0], H, b[1]], 0.15, 0.5); bag.add(up, fromTriangles(t)); }
  // gutters: short clay spouts through the parapet on to the lane
  for (const f of faces) {
    if (rand() < 0.35) continue;
    const l = f === 'n' || f === 's' ? W : D, a = (f === 'n' || f === 's' ? x0 : z0) + (0.35 + rand() * 0.3) * l, y = H + 0.05;
    const q = f === 'n' ? [a - 0.08, z0 - 0.55, a + 0.08, z0 + 0.2] : f === 's' ? [a - 0.08, z1 - 0.2, a + 0.08, z1 + 0.55] : f === 'w' ? [x0 - 0.55, a - 0.08, x0 + 0.2, a + 0.08] : [x1 - 0.2, a - 0.08, x1 + 0.55, a + 0.08];
    bag.add('terracotta', box(q[0], y, q[1], q[2], y + 0.13, q[3]));
  }
  // the court: brick paving sloping to a drain in the middle
  const ci = [x0 + d, z0 + d, x1 - d, z1 - d], cw = ci[2] - ci[0], cd = ci[3] - ci[1], cx = (ci[0] + ci[2]) / 2, cz = (ci[1] + ci[3]) / 2;
  bag.add(BB, box(ci[0], 0, ci[1], ci[2], 0.06, ci[3]));
  bag.add('opening', box(cx - 0.18, 0.06, cz - 0.18, cx + 0.18, 0.065, cz + 0.18));
  if (Math.max(cw, cd) < 2.6) return;
  // the stair along the court's longer side, against the north (or west) range, rising east (or south)
  const alongX = cw >= cd, top = two ? 3.0 : H, run = alongX ? cw : cd;
  if (run >= top / 0.85) {
    const sr = alongX ? [ci[0], ci[1], ci[2] - (two ? 0.9 : 0), ci[1] + 0.8] : [ci[0], ci[1], ci[0] + 0.8, ci[3] - (two ? 0.9 : 0)];
    stairs({ rect: sr, y0: 0.06, y1: top, dir: alongX ? 'e' : 's', mat: BB }, { bag, col });
  }
  if (!two || Math.min(cw, cd) < 3.4) return;
  // the gallery on posts round the other three sides at the upper floor, with its rail
  const g = 0.9, Y = 3.0, ring = alongX
    ? [[ci[0], ci[3] - g, ci[2], ci[3]], [ci[0], ci[1] + 0.8, ci[0] + g, ci[3] - g], [ci[2] - g, ci[1], ci[2], ci[3] - g]]
    : [[ci[0], ci[3] - g, ci[2], ci[3]], [ci[2] - g, ci[1], ci[2], ci[3] - g], [ci[0] + 0.8, ci[1], ci[2] - g, ci[1] + g]];
  for (const r of ring) { bag.add('timber', box(r[0], Y - 0.12, r[1], r[2], Y, r[3])); col.floor(r, Y); }
  const inner = alongX ? [ci[0] + g, ci[1] + 0.92, ci[2] - g, ci[3] - g] : [ci[0] + 0.92, ci[1] + g, ci[2] - g, ci[3] - g];
  for (const [px, pz] of [[inner[0], inner[1]], [inner[2], inner[1]], [inner[0], inner[3]], [inner[2], inner[3]]]) {
    bag.add('timber', box(px - 0.09, 0.06, pz - 0.09, px + 0.09, Y + 0.95, pz + 0.09)); col.rect([px - 0.09, pz - 0.09, px + 0.09, pz + 0.09], 0, Y + 0.95);
  }
  for (const [a, b] of [[[inner[0], inner[1]], [inner[2], inner[1]]], [[inner[0], inner[3]], [inner[2], inner[3]]], [[inner[0], inner[1]], [inner[0], inner[3]]], [[inner[2], inner[1]], [inner[2], inner[3]]]]) {
    if (alongX ? a[1] === inner[1] && b[1] === inner[1] : a[0] === inner[0] && b[0] === inner[0]) continue;   // the stair side stays open
    const t = []; beamTris(t, [a[0], Y + 0.85, a[1]], [b[0], Y + 0.85, b[1]], 0.05, 0.1); bag.add('timber', fromTriangles(t));
  }
}

/**
 * terrace: { rect, h, batter, gap: [x0, x1] (an opening on the north face for a stair) } — the ziggurat's terrace:
 * a massive retaining wall of mud brick, buttressed and sloping sharply inwards, with rows of clay cones set in
 * its face, their round heads forming a band (Penn Museum Journal, Woolley's report on Ur-Nammu's terrace wall).
 */
function terrace(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 2.5, b = el.batter ?? 0.6, y = el.y ?? 0;
  bag.add(MB, frustum([x0, z0, x1, z1], y - 0.3, y + h, b, b, b, b, { noBottom: true }));
  col.rect([x0, z0, x1, z1], y, y + h); col.floor([x0 + b, z0 + b, x1 - b, z1 - b], y + h);
  const gap = el.gap, inGap = (px, pz) => gap && pz < z0 + 0.1 && px > gap[0] - 1 && px < gap[1] + 1;
  buttresses(bag, [x0, z0, x1, z1], y - 0.3, h + 0.3, b, 4, inGap);
  // the cones: two rows of round heads near the top of each face, following its slope
  const head = lathe([[0.06, 0], [0.055, 0.03], [0.03, 0.05], [0.001, 0.055]], 8);
  for (const [f, a0, a1] of [['n', x0, x1], ['s', x0, x1], ['w', z0, z1], ['e', z0, z1]]) {
    const n = Math.floor((a1 - a0 - 1) / 0.32);
    for (const v of [h - 0.55, h - 0.85]) for (let i = 0; i <= n; i++) {
      const u = a0 + 0.5 + i * (a1 - a0 - 1) / n, o = b * (v / h), g = head.clone();
      if (f === 'n' && inGap(u, z0)) continue;
      // tilted back with the slope of the face
      const tilt = Math.atan2(b, h);
      if (f === 'n') g.rotateX(-Math.PI / 2 + tilt).translate(u, y + v, z0 + o);
      else if (f === 's') g.rotateX(Math.PI / 2 - tilt).translate(u, y + v, z1 - o);
      else if (f === 'w') g.rotateZ(Math.PI / 2 - tilt).translate(x0 + o, y + v, u);
      else g.rotateZ(-Math.PI / 2 + tilt).translate(x1 - o, y + v, u);
      bag.add('terracotta', g);
    }
  }
}

/**
 * gate_tower: { rect, door ('n'|'s'|'e'|'w': the passage runs across the tower from this side), w (the passage), h,
 * dh (the doorway) } — a massive gate tower of baked brick (the Edublalmah, Amar-Sin's gate before the ziggurat
 * stair): a passage through it with doorways at both ends, cedar doors, buttressed faces.
 */
function gateTower(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 9, w = el.w ?? 3, dh = el.dh ?? 4.2, ns = (el.door ?? 'n') === 'n' || el.door === 's';
  const c = ns ? (x0 + x1) / 2 : (z0 + z1) / 2, m = el.mat ?? BB;
  const parts = ns ? [[x0, z0, c - w / 2, z1], [c + w / 2, z0, x1, z1]] : [[x0, z0, x1, c - w / 2], [x0, c + w / 2, x1, z1]];
  for (const r of parts) { bag.add(m, frustum(r, -0.3, h, 0, 0, 0, 0, { noBottom: true })); col.rect(r, 0, h); col.floor(r, h); }
  const over = ns ? [c - w / 2, z0, c + w / 2, z1] : [x0, c - w / 2, x1, c + w / 2];
  bag.add(m, box(over[0], dh, over[1], over[2], h, over[3])); col.rect(over, dh, h); col.floor(over, h);
  bag.add(BB, frustum(over, -0.3, 0.1, 0, 0, 0, 0, { noBottom: true })); col.floor(over, 0.1);
  buttresses(bag, [x0, z0, x1, z1], -0.3, h + 0.3, 0, 2.6, (px, pz) => (ns ? Math.abs(px - c) < w / 2 + 0.8 : Math.abs(pz - c) < w / 2 + 0.8));
  // the doors, standing open against the passage walls a little way in
  const e = ns ? z0 : x0;
  for (const sx of [-1, 1]) {
    const q = ns ? [c + sx * (w / 2) - (sx > 0 ? 0.1 : 0), e + 0.6, c + sx * (w / 2) + (sx < 0 ? 0.1 : 0), e + 0.6 + w / 2] : [e + 0.6, c + sx * (w / 2) - (sx > 0 ? 0.1 : 0), e + 0.6 + w / 2, c + sx * (w / 2) + (sx < 0 ? 0.1 : 0)];
    const qq = ns ? [Math.min(q[0], q[2]), q[1], Math.max(q[0], q[2]), q[3]] : [q[0], Math.min(q[1], q[3]), q[2], Math.max(q[1], q[3])];
    bag.add('cedar', box(qq[0], 0.1, qq[1], qq[2], dh - 0.05, qq[3]));
    for (const v of [0.5, dh / 2, dh - 0.55]) bag.add('bronze', ns ? box(qq[0] - (sx > 0 ? 0.02 : 0), v - 0.07, qq[1], qq[2] + (sx < 0 ? 0.02 : 0), v + 0.07, qq[3]) : box(qq[0], v - 0.07, qq[1] - (sx > 0 ? 0.02 : 0), qq[2], v + 0.07, qq[3] + (sx < 0 ? 0.02 : 0)));
  }
}

/** reed_boat: a high-ended reed boat { at, dir, len, y }. */
function reedBoat(el, ctx) { STYLES.qing.elements.boat({ ...el }, ctx); }

registerStyle('sumerian', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, ziggurat, precinct_wall: precinctWall, courtyard_block: courtyardBlock, ur_house: urHouse, reed_boat: reedBoat, terrace, gate_tower: gateTower },
  objects: {},
});
