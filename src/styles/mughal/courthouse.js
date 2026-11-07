// A courtyard house that can be entered (the furnished houses of Isfahan, Cairo and Agra; docs/settlements/
// isfahan.md §16, mamluk-cairo.md §10, mughal-agra.md §11): four wings round an open court on a lot, the
// outer walls blind to the lanes but for the street door; one wing holds the vestibule, turned so that no one
// in the lane sees into the court; the others are rooms opening on the court by arches (an open hall: the
// talar, the iwan, the dalan) or by doors and latticed windows, or are left solid (stores, stairs, the
// parts not entered). Each room has its raised floor, its plastered walls (a lining over the outer
// material), a ceiling of boards on beams, the roof over it with a parapet. The builder returns each room's
// inner rectangle, floor and ceiling heights so that the style can furnish it.
//
// spec: { rect, y, th (outer walls), ti (court walls), fh (the rooms' floor above the court), H (the roof),
//   d: { n, s, e, w } (the wings' depths), wings: { n|s|e|w: { kind: 'open'|'room'|'solid', h (its own
//   roof), arches: [{ at (0…1 along its court side), w, h }] (openings: 'open' halls and doors), windows:
//   [{ at, w, h, sill }] } }, entry: { side, at (0…1), w } (the street door, in that wing's outer wall; the
//   wing becomes the vestibule), mats: { out, in, floor, court, ceiling, beam, leaf, lattice, base (the
//   darkened foot of the outer walls), trim } }.

import { box } from '../../core/geom.js';
import { arcadeWall } from './index.js';


/** The wings' rectangles and their court sides: for each side, the room's inner rect and the court wall's line. */
function geometry(spec) {
  const [x0, z0, x1, z1] = spec.rect, d = spec.d;
  const R = {
    n: { rect: [x0, z0, x1, z0 + d.n], court: [[x0 + d.w, z0 + d.n], [x1 - d.e, z0 + d.n]], out: 'z0' },
    s: { rect: [x0, z1 - d.s, x1, z1], court: [[x0 + d.w, z1 - d.s], [x1 - d.e, z1 - d.s]], out: 'z1' },
    w: { rect: [x0, z0 + d.n, x0 + d.w, z1 - d.s], court: [[x0 + d.w, z0 + d.n], [x0 + d.w, z1 - d.s]], out: 'x0' },
    e: { rect: [x1 - d.e, z0 + d.n, x1, z1 - d.s], court: [[x1 - d.e, z0 + d.n], [x1 - d.e, z1 - d.s]], out: 'x1' },
  };
  return R;
}

export function courtHouse(bag, col, spec) {
  const { y = 0, th = 0.6, ti = 0.45, fh = 0.45, H = 5 } = spec, [x0, z0, x1, z1] = spec.rect, M = spec.mats, d = spec.d;
  const G = geometry(spec), out = {}, court = [x0 + d.w, z0 + d.n, x1 - d.e, z1 - d.s];
  // the court's paving
  bag.add(M.court, box(court[0], y - 0.1, court[1], court[2], y + 0.04, court[3])); col.floor(court, y + 0.04);
  const solid = (r, h) => { bag.add(M.out, box(r[0], y, r[1], r[2], h, r[3])); col.rect(r, y, h); col.floor(r, h); };
  for (const side of ['n', 's', 'w', 'e']) {
    const W = spec.wings[side] ?? { kind: 'solid' }, g = G[side], [, rz0, , rz1] = g.rect, h = y + (W.h ?? H);
    const along = side === 'n' || side === 's';               // the wing runs along x
    let room = along ? [x0 + d.w, rz0, x1 - d.e, rz1] : g.rect.slice();
    if (along) { solid([x0, rz0, x0 + d.w, rz1], h); solid([x1 - d.e, rz0, x1, rz1], h); }
    const isEntry = !!spec.entry && spec.entry.side === side, kind = isEntry ? 'room' : W.kind;
    if (kind === 'solid') { solid(room, h); parapet(bag, M, room, h, side); continue; }
    // the vestibule takes only a part of its wing (span, 0…1), the rest solid
    if (isEntry && spec.entry.span) {
      const [t0, t1] = spec.entry.span, lo = along ? room[0] : room[1], L0 = along ? room[2] - room[0] : room[3] - room[1], a = lo + L0 * t0, b = lo + L0 * t1;
      if (along) { if (a > room[0] + 0.01) solid([room[0], room[1], a, room[3]], h); if (b < room[2] - 0.01) solid([b, room[1], room[2], room[3]], h); room = [a, room[1], b, room[3]]; }
      else { if (a > room[1] + 0.01) solid([room[0], room[1], room[2], a], h); if (b < room[3] - 0.01) solid([room[0], b, room[2], room[3]], h); room = [room[0], a, room[2], b]; }
    }
    const s0 = along ? room[0] : room[1], L = along ? room[2] - room[0] : room[3] - room[1];
    const line = (n) => (along ? [[room[0], n], [room[2], n]] : [[n, room[1]], [n, room[3]]]);
    const nOut = side === 'n' ? room[1] + th / 2 : side === 's' ? room[3] - th / 2 : side === 'w' ? room[0] + th / 2 : room[2] - th / 2;
    const nIn = side === 'n' ? room[3] - ti / 2 : side === 's' ? room[1] + ti / 2 : side === 'w' ? room[2] - ti / 2 : room[0] + ti / 2;
    const toCourt = side === 'n' ? [0, 1] : side === 's' ? [0, -1] : side === 'w' ? [1, 0] : [-1, 0];
    const mid = [(room[0] + room[2]) / 2, (room[1] + room[3]) / 2], far = [mid[0] - toCourt[0] * 9, mid[1] - toCourt[1] * 9], near = [mid[0] + toCourt[0] * 9, mid[1] + toCourt[1] * 9];
    // the outer wall (the street door in it), the court wall with its arches and latticed windows
    const streetDoor = isEntry ? [{ at: L * (spec.entry.at ?? 0.3), w: spec.entry.w ?? 1.3, h: 2.5, pass: true }] : [];
    const [oa, ob] = line(nOut); arcadeWall(bag, col, oa, ob, y, h - y, th, M.out, streetDoor, near);
    const fy = isEntry ? y + 0.04 : y + fh;
    const arches = [];
    for (const q of W.arches ?? []) arches.push({ at: L * q.at, w: q.w, h: q.h, sill: fh, pass: true });
    for (const q of W.windows ?? []) arches.push({ at: L * q.at, w: q.w, h: q.h, sill: q.sill ?? fh + 0.6, depth: -ti / 2, back: M.lattice });
    if (isEntry) arches.push({ at: L * (spec.entry.inner ?? 0.7), w: 1.2, h: 2.4, sill: 0, pass: true });
    const [ia, ib] = line(nIn); arcadeWall(bag, col, ia, ib, y, h - y, ti, M.out, arches, far);
    // the room inside the walls: its raised floor, the lining, the ceiling of boards on beams, the roof
    const rr = side === 'n' ? [room[0], room[1] + th, room[2], room[3] - ti] : side === 's' ? [room[0], room[1] + ti, room[2], room[3] - th] : side === 'w' ? [room[0] + th, room[1], room[2] - ti, room[3]] : [room[0] + ti, room[1], room[2] - th, room[3]];
    bag.add(M.floor, box(rr[0], y, rr[1], rr[2], fy, rr[3])); col.floor(rr, fy);
    const top = h - 0.55;
    const holes = (list, isCourt) => list.map((q) => ({ at: s0 + q.at, w: q.w + 0.06, y0: q.pass ? fy : y + q.sill, y1: Math.min(top, y + (q.sill ?? 0) + q.h + 0.05) })).filter(() => true).map((q) => (isCourt ? q : q));
    lining(bag, M.in, rr, fy, top, side, holes(streetDoor, false), holes(arches, true));
    // a square opening in the ceiling and the roof for a lantern over the room's middle (W.lantern: { at, w })
    const hole = W.lantern ? (() => { const L2 = along ? rr[2] - rr[0] : rr[3] - rr[1], c0 = (along ? rr[0] : rr[1]) + L2 * W.lantern.at, cm = along ? (rr[1] + rr[3]) / 2 : (rr[0] + rr[2]) / 2, hw = W.lantern.w / 2; return along ? [c0 - hw, cm - hw, c0 + hw, cm + hw] : [cm - hw, c0 - hw, cm + hw, c0 + hw]; })() : null;
    const slabs = (r, ya, yb, m) => { if (!hole) { bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); return; } for (const q of [[r[0], r[1], r[2], hole[1]], [r[0], hole[3], r[2], r[3]], [r[0], hole[1], hole[0], hole[3]], [hole[2], hole[1], r[2], hole[3]]]) if (q[2] - q[0] > 0.01 && q[3] - q[1] > 0.01) bag.add(m, box(q[0], ya, q[1], q[2], yb, q[3])); };
    slabs(rr, top, top + 0.08, M.ceiling);
    const len = along ? rr[2] - rr[0] : rr[3] - rr[1], nb = Math.max(2, Math.round(len / 0.7));
    for (let k = 0; k < nb; k++) {
      const s = (k + 0.5) / nb * len, a0 = (along ? rr[0] : rr[1]) + s;
      if (hole && a0 > (along ? hole[0] : hole[1]) - 0.1 && a0 < (along ? hole[2] : hole[3]) + 0.1) continue;
      if (along) bag.add(M.beam, box(rr[0] + s - 0.07, top - 0.16, rr[1] + 0.035, rr[0] + s + 0.07, top, rr[3] - 0.035)); else bag.add(M.beam, box(rr[0] + 0.035, top - 0.16, rr[1] + s - 0.07, rr[2] - 0.035, top, rr[1] + s + 0.07));
    }
    slabs(room, top + 0.08, h, M.out); col.floor(room, h);
    parapet(bag, M, room, h, side);
    // a step up from the court before each raised opening
    const P = (at, n) => (along ? [s0 + at, n] : [n, s0 + at]);
    for (const q of arches.filter((a) => a.pass && a.sill > 0.1)) {
      const p = P(q.at, side === 'n' ? room[3] : side === 's' ? room[1] : side === 'w' ? room[2] : room[0]);
      const e = [p[0] + toCourt[0] * 0.45, p[1] + toCourt[1] * 0.45];
      const r = along ? [p[0] - q.w / 2 - 0.1, Math.min(p[1], e[1]), p[0] + q.w / 2 + 0.1, Math.max(p[1], e[1])] : [Math.min(p[0], e[0]), p[1] - q.w / 2 - 0.1, Math.max(p[0], e[0]), p[1] + q.w / 2 + 0.1];
      bag.add(M.trim, box(r[0], y, r[1], r[2], y + fh / 2, r[3])); col.floor(r, y + fh / 2);
    }
    if (M.base) baseBand(bag, M.base, oa, ob, th, y, side, streetDoor);
    if (isEntry) for (const q of streetDoor) doorway(bag, M, oa, ob, q, th, y, side);
    out[side] = { room: rr, y: fy, top, h, hole, kind: W.kind, entry: isEntry, arches: arches.map((q) => ({ ...q, p: P(q.at, nIn) })), toCourt };
  }
  // the darkened foot of the outer faces of the solid wings and the corners
  if (M.base) for (const [a, b, side] of [[[x0, z0], [x1, z0], 'n'], [[x0, z1], [x1, z1], 's'], [[x0, z0], [x0, z1], 'w'], [[x1, z0], [x1, z1], 'e']]) {
    const o = out[side];
    if (!o) { baseBand(bag, M.base, a, b, 0, y, side, []); continue; }
    // only the parts of the edge beyond the room (the corners, the solid parts of a trimmed vestibule)
    const along = side === 'n' || side === 's', lo = along ? o.room[0] - (side === 'n' || side === 's' ? 0 : 0) : o.room[1], hi = along ? o.room[2] : o.room[3];
    const s = along ? a[0] : a[1], e = along ? b[0] : b[1], at = (v) => (along ? [v, a[1]] : [a[0], v]);
    if (lo - s > 0.1) baseBand(bag, M.base, at(s), at(lo - (along ? 0 : 0)), 0, y, side, []);
    if (e - hi > 0.1) baseBand(bag, M.base, at(hi), at(e), 0, y, side, []);
  }
  out.court = court;
  return out;
}

/** The parapet round a roof: a low wall on the outer edge of the wing. */
function parapet(bag, M, r, h, side) {
  const t = 0.25, ph = 0.55;
  if (side === 'n') bag.add(M.out, box(r[0], h, r[1], r[2], h + ph, r[1] + t));
  if (side === 's') bag.add(M.out, box(r[0], h, r[3] - t, r[2], h + ph, r[3]));
  if (side === 'w') bag.add(M.out, box(r[0], h, r[1], r[0] + t, h + ph, r[3]));
  if (side === 'e') bag.add(M.out, box(r[2] - t, h, r[1], r[2], h + ph, r[3]));
}

/** The plaster lining of a room's walls, 3 cm proud of the walls, cut round the doors, arches and windows (holes: { at, w, y0, y1 }). */
function lining(bag, mat, rr, y0, y1, side, street, court) {
  const t = 0.03, [a0, b0, a1, b1] = rr, along = side === 'n' || side === 's';
  const piece = (fixed, sgn, u0, u1, ya, yb) => { if (u1 - u0 < 0.01 || yb - ya < 0.01) return; const f0 = Math.min(fixed, fixed + sgn * t), f1 = Math.max(fixed, fixed + sgn * t); bag.add(mat, along ? box(u0, ya, f0, u1, yb, f1) : box(f0, ya, u0, f1, yb, u1)); };
  const run = (fixed, sgn, s0, s1, holes) => {
    let u = s0 + t;
    for (const q of holes.slice().sort((p, r) => p.at - r.at)) {
      const g0 = Math.max(s0 + t, q.at - q.w / 2), g1 = Math.min(s1 - t, q.at + q.w / 2);
      if (g1 <= g0) continue;
      piece(fixed, sgn, u, g0, y0, y1);
      piece(fixed, sgn, g0, g1, y0, Math.max(y0, q.y0));
      piece(fixed, sgn, g0, g1, Math.min(y1, q.y1), y1);
      u = g1;
    }
    piece(fixed, sgn, u, s1 - t, y0, y1);
  };
  const s0 = along ? a0 : b0, s1 = along ? a1 : b1;
  if (side === 'n') { run(b0, 1, s0, s1, street); run(b1, -1, s0, s1, court); }
  if (side === 's') { run(b1, -1, s0, s1, street); run(b0, 1, s0, s1, court); }
  if (side === 'w') { run(a0, 1, s0, s1, street); run(a1, -1, s0, s1, court); }
  if (side === 'e') { run(a1, -1, s0, s1, street); run(a0, 1, s0, s1, court); }
  if (along) { bag.add(mat, box(a0, y0, b0, a0 + t, y1, b1)); bag.add(mat, box(a1 - t, y0, b0, a1, y1, b1)); }
  else { bag.add(mat, box(a0, y0, b0, a1, y1, b0 + t)); bag.add(mat, box(a0, y0, b1 - t, a1, y1, b1)); }
}

/** The foot of an outer wall darkened by the lane's dust and splash: a skin 1.5 cm proud, its top ragged (0.6–1.1 m). */
function baseBand(bag, mat, a, b, th, y, side, doors) {
  const o = th / 2 + 0.016, n = side === 'n' ? [0, -1] : side === 's' ? [0, 1] : side === 'w' ? [-1, 0] : [1, 0];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  let s = 0, k = Math.floor(Math.abs(a[0] * 7 + a[1] * 13)) % 97;
  while (s < L - 0.01) {
    const w = Math.min(L - s, 0.6 + ((k * 37) % 10) * 0.09), hh = 0.6 + ((k * 53) % 11) * 0.045;
    k++;
    if (doors.some((q) => s + w > q.at - q.w / 2 - 0.05 && s < q.at + q.w / 2 + 0.05)) { const q = doors.find((qq) => s + w > qq.at - qq.w / 2 - 0.05); const e = q.at + q.w / 2 + 0.05; if (s < q.at - q.w / 2 - 0.05) { const w2 = q.at - q.w / 2 - 0.05 - s; band(s, w2, hh); } s = Math.max(s + 0.01, e); continue; }
    band(s, w, hh); s += w;
  }
  function band(s0, w, hh) {
    const p = [a[0] + ux * s0 + n[0] * (o - 0.016), a[1] + uz * s0 + n[1] * (o - 0.016)], q = [a[0] + ux * (s0 + w) + n[0] * o, a[1] + uz * (s0 + w) + n[1] * o];
    bag.add(mat, box(Math.min(p[0], q[0]), y, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + hh, Math.max(p[1], q[1])));
  }
}

/** The street door: a frame of the trim round it, a threshold, two leaves of planks with studs standing open inside. */
function doorway(bag, M, a, b, q, th, y, side) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, c = [a[0] + ux * q.at, a[1] + uz * q.at];
  const n = side === 'n' ? [0, -1] : side === 's' ? [0, 1] : side === 'w' ? [-1, 0] : [1, 0];
  const R = (s0, s1, n0, n1) => { const p = [c[0] + ux * s0 + n[0] * n0, c[1] + uz * s0 + n[1] * n0], r = [c[0] + ux * s1 + n[0] * n1, c[1] + uz * s1 + n[1] * n1]; return [Math.min(p[0], r[0]), Math.min(p[1], r[1]), Math.max(p[0], r[0]), Math.max(p[1], r[1])]; };
  const hw = q.w / 2, f = 0.14, fo = th / 2 + 0.04;
  for (const r of [R(-hw - f, -hw, th / 2 - 0.02, fo), R(hw, hw + f, th / 2 - 0.02, fo)]) bag.add(M.trim, box(r[0], y, r[1], r[2], y + 2.2, r[3]));
  { const r = R(-hw - f, hw + f, th / 2 - 0.02, fo); bag.add(M.trim, box(r[0], y + 2.2, r[1], r[2], y + 2.42, r[3])); }
  { const r = R(-hw, hw, -th / 2, th / 2 + 0.25); bag.add(M.trim, box(r[0], y, r[1], r[2], y + 0.06, r[3])); }
  // the leaves, each half the width, swung in against the reveals
  for (const s of [-1, 1]) {
    const r = R(s * hw - (s > 0 ? 0.05 : 0), s * hw + (s < 0 ? 0.05 : 0), -th / 2 - hw + 0.02, -th / 2);
    bag.add(M.leaf, box(r[0], y + 0.06, r[1], r[2], y + 2.1, r[3]));
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const nn = -th / 2 - 0.12 - j * (hw - 0.3); const p = [c[0] + ux * (s * hw - s * 0.05) + n[0] * nn, c[1] + uz * (s * hw - s * 0.05) + n[1] * nn]; bag.add('iron', box(p[0] - 0.02, y + 0.4 + i * 0.45, p[1] - 0.02, p[0] + 0.02, y + 0.44 + i * 0.45, p[1] + 0.02)); }
  }
  // the two knockers on the outer face (one for men, one for women [inferred]) on the frame's lintel line
  for (const s of [-1, 1]) { const p = [c[0] + ux * s * (hw + 0.07) + n[0] * (fo + 0.02), c[1] + uz * s * (hw + 0.07) + n[1] * (fo + 0.02)]; bag.add('iron', box(p[0] - 0.025, y + 1.45, p[1] - 0.025, p[0] + 0.025, y + 1.6, p[1] + 0.025)); }
}
