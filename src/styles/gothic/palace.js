// The Palais de la Cité about 1248 (docs/settlements/paris.md §1c): the Grand-Salle with its two naves under twin roofs; the
// round towers on the Seine with their conical roofs (Tour César, Tour d'Argent, Tour Bonbec); the enclosure wall and its gate
// on the Barillerie; the stone quay with its water stair and mooring posts; the king's garden — its wall, the wattled beds of
// herbs, the vine arbour, the well. Registered into the `gothic` style. The galerie des Merciers, which joins the Sainte-Chapelle,
// is the chapel's own (src/buildings/sainte-chapelle/style.js).

import { STYLES } from '../../core/build.js';
import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { planarWall, archRise } from '../byzantine/index.js';
import './index.js';
import { prism, bars, ringPts } from './notre-dame.js';

const L = 'limestone', CARV = 'limestone_carved';
const G = () => STYLES.gothic.elements;

function hexa(out, b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}
const frame = (o, u, n) => (uu, y, d) => [o[0] + u[0] * uu + n[0] * d, y, o[1] + u[1] * uu + n[1] * d];
function fbox(out, W, u0, u1, y0, y1, d0, d1) {
  hexa(out, [W(u0, y0, d0), W(u1, y0, d0), W(u1, y0, d1), W(u0, y0, d1)], [W(u0, y1, d0), W(u1, y1, d0), W(u1, y1, d1), W(u0, y1, d1)]);
}
function leafBall(c, r) { return lathe([[0.001, -r * 0.8], [r, -r * 0.2], [r * 0.8, r * 0.5], [0.001, r]], 5, (t, i) => 1 + 0.12 * Math.cos(3 * t + i), c[0], c[1], c[2]); }
/** The dark pane in a small window's opening, set back in the wall: { o, u, uc, r, sill, spring, pointed }. */
function pane(bag, o, u, a, off) { const n = [-u[1], u[0]]; bag.add('opening', planarWall({ o: [o[0] + n[0] * off, o[1] + n[1] * off], u, th: 0.02, u0: a.uc - a.r, u1: a.uc + a.r, y0: a.sill, y1: a.spring + archRise(a), outline: a })); }

/**
 * palace_hall: the Grand-Salle { rect [x0, z0, x1, z1] (along x), y, h (eave), floor (the hall's floor over the undercroft) } —
 * two naves side by side under twin slate roofs; buttressed long walls with the undercroft's small windows below and the hall's
 * tall windows of two lights above; at each end two gables, each with a great window of four lights and a rose; a cornice.
 */
function palaceHall(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 17, fl = el.floor ?? 6, T = 1.1;
  const Wd = z1 - z0, nw = Wd / 2, n = Math.max(2, Math.round((x1 - x0) / 6)), bl = (x1 - x0) / n, E = y + h;
  bag.add(L, box(x0 - 0.35, y - 0.6, z0 - 0.35, x1 + 0.35, y + 0.7, z1 + 0.35));
  // the long walls
  for (const [zf, inS] of [[z0 + T / 2, 1], [z1 - T / 2, -1]]) {
    const arches = [];
    for (let k = 0; k < n; k++) {
      const uc = (k + 0.5) * bl;
      arches.push({ uc, r: 0.55, spring: y + 3.4, sill: y + 2.0, pointed: 0.8 }, { uc, r: 1.25, spring: E - 3.6, sill: y + fl + 2.2, pointed: 0.75 });
    }
    bag.add(L, planarWall({ o: [x0, zf], u: [1, 0], th: T, u0: 0, u1: x1 - x0, y0: y, y1: E, arches }));
    for (let k = 0; k < n; k++) {
      const uc = (k + 0.5) * bl;
      G().gothic_window({ o: [x0, zf], u: [1, 0], uc, w: 2.5, sill: y + fl + 2.2, spring: E - 3.6, f: 0.75, lancets: 2, inSide: inS, bar: 0.12 }, ctx);
      pane(bag, [x0, zf], [1, 0], { uc, r: 0.55, sill: y + 2.0, spring: y + 3.4, pointed: 0.8 }, inS * 0.2);
    }
    const W = frame([x0, zf], [1, 0], [0, -inS]), S = [];
    fbox(S, W, -0.2, x1 - x0 + 0.2, y + fl + 1.9, y + fl + 2.15, T / 2 - 0.02, T / 2 + 0.16);
    fbox(S, W, -0.3, x1 - x0 + 0.3, E - 0.45, E, T / 2 - 0.02, T / 2 + 0.4);
    for (let i = 0; i < Math.floor((x1 - x0) / 0.8); i++) fbox(S, W, i * 0.8 + 0.25, i * 0.8 + 0.5, E - 0.85, E - 0.45, T / 2 - 0.02, T / 2 + 0.3);
    bag.add(L, fromTriangles(S));
    for (let k = 1; k < n; k++) if (!(inS < 0 && el.gap != null && Math.abs(x0 + k * bl - el.gap) < 3.5)) G().buttress({ at: [x0 + k * bl, zf - inS * T / 2], dir: [0, -inS], w: 1.4, d: 1.9, y0: y, y1: E - 1.2, steps: 2, pinnacle: 0 }, ctx);
  }
  // the ends: the wall with a great window under each gable, the gables with a rose and a finial
  for (const [xf, sg] of [[x0 + T / 2, -1], [x1 - T / 2, 1]]) {
    const arches = [0, 1].map((k) => ({ uc: (k + 0.5) * nw, r: 1.7, spring: E - 2.8, sill: y + fl + 2.0, pointed: 0.75 }));
    arches.push(...[0, 1].map((k) => ({ uc: (k + 0.5) * nw, r: 0.55, spring: y + 3.4, sill: y + 2.0, pointed: 0.8 })));
    bag.add(L, planarWall({ o: [xf, z0], u: [0, 1], th: T, u0: T, u1: Wd - T, y0: y, y1: E, arches }));
    for (let k = 0; k < 2; k++) {
      const uc = (k + 0.5) * nw, rg = E + nw * 0.85;
      G().gothic_window({ o: [xf, z0], u: [0, 1], uc, w: 3.4, sill: y + fl + 2.0, spring: E - 2.8, f: 0.75, lancets: 4, inSide: -sg, bar: 0.13 }, ctx);
      pane(bag, [xf, z0], [0, 1], { uc, r: 0.55, sill: y + 2.0, spring: y + 3.4, pointed: 0.8 }, -sg * 0.2);
      const S = [];
      prism(S, [[xf - T / 2, E - 0.01, z0 + k * nw], [xf - T / 2, E - 0.01, z0 + (k + 1) * nw], [xf - T / 2, rg + 0.35, z0 + uc]], [T, 0, 0]);
      bag.add(L, fromTriangles(S));
      G().rose({ o: [xf + sg * (T / 2 + 0.04), z0], u: [0, 1], uc, yc: E + nw * 0.32, r: Math.min(1.5, nw * 0.16), spokes: 8, inSide: -sg }, ctx);
      bag.add(CARV, lathe([[0.22, 0], [0.3, 0.3], [0.14, 0.7], [0.26, 0.9], [0.001, 1.6]], 6, null, xf, rg + 0.3, z0 + uc));
    }
  }
  // the twin roofs, ending inside the gables
  for (let k = 0; k < 2; k++) {
    const za = z0 + k * nw, zb = za + nw, ov = 0.45, rg = E + nw * 0.85, R = [];
    prism(R, [[x0 + T / 2, E + 0.03, za - (k === 0 ? ov : 0)], [x0 + T / 2, E + 0.03, zb + (k === 1 ? ov : 0)], [x0 + T / 2, rg, za + nw / 2]], [x1 - x0 - T, 0, 0]);
    bag.add('slate', fromTriangles(R));
    bag.add('lead', rod([x0 + T / 2, rg + 0.02, za + nw / 2], [x1 - T / 2, rg + 0.02, za + nw / 2], 0.14, 6));
  }
  col.rect([x0, z0, x1, z1], y - 0.6, E);
}

/**
 * palace_tower: a round tower of the palace on the Seine { at [x, z], y (its foot), ground, r, h (to the parapet's top, from the
 * foot), roof, face (the angle of its windows, radians) } — a battered foot in the water, string courses, stair slits, two-light
 * windows on the upper storeys, a corbel table and a crenellated parapet, the cone of slate behind it, a finial and a vane.
 */
function palaceTower(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r, h = el.h, gr = el.ground ?? y, bh = Math.max(1.2, gr - y + 1.8);
  bag.add(L, lathe([[r + 0.9, 0], [r + 0.9, 0.4], [r + 0.15, bh], [r, bh + 0.25], [r, h - 1.3], [0.001, h - 1.3]], 36, null, x, y, z));
  // the string courses
  for (let yy = bh + 0.25; yy < h - 3; yy += (h - bh) / 4) if (yy > bh + 1) bag.add(L, lathe([[r - 0.05, 0], [r + 0.15, 0.06], [r + 0.15, 0.24], [r - 0.05, 0.32]], 36, null, x, y + yy, z));
  const S = [], D = [], N = Math.round(2 * Math.PI * r / 0.95), top = y + h;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2, nn = [Math.cos(a), Math.sin(a)], W = frame([x, z], [-nn[1], nn[0]], nn);
    fbox(S, W, -0.13, 0.13, top - 2.2, top - 1.25, r - 0.05, r + 0.5);                 // corbels, in two tiers
    fbox(S, W, -0.1, 0.1, top - 2.6, top - 2.2, r - 0.05, r + 0.25);
    if (k % 2 === 0) fbox(S, W, -0.38, 0.38, top, top + 1.5, r - 0.02, r + 0.5);       // merlons
  }
  // the parapet on the corbels, the slits and windows
  bag.add(L, lathe([[r - 0.02, top - 1.3], [r + 0.5, top - 1.3], [r + 0.5, top], [r - 0.02, top]], 36, null, x, 0, z));
  const fa = el.face ?? 0;
  for (let k = 0; k < 4; k++) {
    const a = fa + Math.PI / 4 + k * Math.PI / 2, nn = [Math.cos(a), Math.sin(a)], W = frame([x, z], [-nn[1], nn[0]], nn);
    for (const yy of [0.3, 0.52]) fbox(D, W, -0.08, 0.08, y + bh + (h - bh) * yy, y + bh + (h - bh) * yy + 1.2, r - 0.05, r + 0.004);
  }
  for (const da of [-0.45, 0, 0.45]) {
    const a = fa + da, nn = [Math.cos(a), Math.sin(a)], W = frame([x, z], [-nn[1], nn[0]], nn);
    const y0 = y + h * 0.66, y1 = y0 + 2.0;
    fbox(D, W, -0.62, 0.62, y0, y1, r - 0.06, r + 0.004);
    fbox(S, W, -0.07, 0.07, y0, y1, r - 0.06, r + 0.1);                                      // the mullion
    fbox(S, W, -0.62, 0.62, y0 + 1.25, y0 + 1.35, r - 0.06, r + 0.1);                        // the transom
    fbox(S, W, -0.8, 0.8, y1, y1 + 0.18, r - 0.04, r + 0.2);                                 // the hood
    fbox(S, W, -0.75, 0.75, y0 - 0.16, y0, r - 0.04, r + 0.16);                              // the sill
  }
  bag.add(L, fromTriangles(S));
  bag.add('opening', fromTriangles(D));
  // the cone, its eave inside the parapet; the finial and the vane
  bag.add('slate', lathe([[r + 0.05, 0], [r - 0.1, 0.35], [0.06, el.roof], [0.001, el.roof + 0.05]], 36, null, x, top - 0.4, z));
  const ap = top - 0.4 + el.roof;
  bag.add('lead', lathe([[0.18, -0.3], [0.22, 0.1], [0.1, 0.5], [0.16, 0.8], [0.001, 1.2]], 8, null, x, ap, z));
  bag.add('iron', rod([x, ap + 1.1, z], [x, ap + 3.0, z], 0.03, 5));
  bag.add('iron', box(x + 0.02, ap + 2.2, z - 0.015, x + 0.75, ap + 2.75, z + 0.015));
  col.circle(x, z, r + 0.9, y, top);
}

/**
 * palace_wall: a crenellated enclosure wall along an axis-aligned line { a [x, z], b [x, z], y, h, th, gates: [{ at (from a), w }] } —
 * a battered foot, the wall walk's parapet with merlons, a gate with a pointed arch where asked.
 */
function palaceWall(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, Ln = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / Ln, (bz - az) / Ln], n = [-u[1], u[0]];
  const y = el.y ?? 0, h = el.h ?? 8, th = el.th ?? 1.6, W = frame([ax, az], u, n), S = [];
  const gates = (el.gates || []).map((g) => [g.at - g.w / 2, g.at + g.w / 2]).sort((p, q) => p[0] - q[0]);
  const runs = []; let s = 0;
  for (const [g0, g1] of gates) { runs.push([s, g0]); s = g1; }
  runs.push([s, Ln]);
  for (const [s0, s1] of runs) {
    if (s1 - s0 < 0.1) continue;
    fbox(S, W, s0, s1, y - 0.5, y + 1.0, -th / 2 - 0.3, th / 2 + 0.3);
    fbox(S, W, s0, s1, y + 1.0, y + h, -th / 2, th / 2);
    for (const sd of [-1, 1]) fbox(S, W, s0, s1, y + h, y + h + 1.0, sd < 0 ? -th / 2 - 0.1 : th / 2 - 0.45, sd < 0 ? -th / 2 + 0.45 : th / 2 + 0.1);
    for (let t = s0 + 0.3; t + 0.9 < s1; t += 1.8) fbox(S, W, t, t + 0.9, y + h + 1.0, y + h + 2.0, -th / 2 - 0.1, -th / 2 + 0.45);
    const p0 = [ax + u[0] * s0, az + u[1] * s0], p1 = [ax + u[0] * s1, az + u[1] * s1];
    col.segment(p0, p1, th + 0.6, y - 0.5, y + h + 1);
  }
  // each gate: the arch over the passage with the wall above it
  for (const [g0, g1] of gates) {
    const a = { uc: (g0 + g1) / 2, r: (g1 - g0) / 2, spring: y + 3.6, pointed: 0.8, sill: y };
    const ga = planarWall({ o: [ax + n[0] * 0, az + n[1] * 0], u, th: th + 0.6, u0: g0 - 0.6, u1: g1 + 0.6, y0: y + 3.0, y1: y + h + 1.0, arches: [a] });
    bag.add(L, ga);
    archBandW(S, W, a, 0, 0.3, th / 2 + 0.3, th / 2 + 0.42);
    archBandW(S, W, a, 0, 0.3, -th / 2 - 0.42, -th / 2 - 0.3);
    fbox(S, W, g0 - 0.6, g0, y - 0.5, y + 3.0, -th / 2 - 0.3, th / 2 + 0.3);
    fbox(S, W, g1, g1 + 0.6, y - 0.5, y + 3.0, -th / 2 - 0.3, th / 2 + 0.3);
  }
  bag.add(L, fromTriangles(S));
}
/** A band round a pointed arch in a frame W: from e0 to e1 outside the intrados, depth d0…d1. */
function archBandW(out, W, a, e0, e1, d0, d1, n = 10) {
  const R = a.pointed * 2 * a.r, H = archRise(a);
  for (const s of [-1, 1]) {
    const cu = a.uc - s * (R - a.r), t1 = Math.asin(H / R);
    for (let i = 0; i < n; i++) {
      const ta = t1 * i / n, tb = t1 * (i + 1) / n, P = (e, t, d) => W(cu + s * (R + e) * Math.cos(t), a.spring + (R + e) * Math.sin(t), d);
      hexa(out, [P(e0, ta, d0), P(e1, ta, d0), P(e1, tb, d0), P(e0, tb, d0)], [P(e0, ta, d1), P(e1, ta, d1), P(e1, tb, d1), P(e0, tb, d1)]);
    }
  }
}

/**
 * quay: the palace's stone quay on the Seine { x0, x1, z (the face, the river on the −z side), back (z of its landward edge), y (its
 * top), bed, water, stairs: [x …], posts: [x …] } — the revetment of ashlar from the bed with a coping, the paved top; water stairs
 * down the face to a landing awash; mooring posts with iron rings.
 */
function quay(el, { bag, col }) {
  const { x0, x1, z, back, y, bed, water } = el, S = [];
  bag.add(L, box(x0, bed, z, x1, y - 0.12, back));
  bag.add('flagstone', box(x0, y - 0.12, z + 0.45, x1, y, back));
  bag.add(L, box(x0, y - 0.3, z - 0.12, x1, y + 0.08, z + 0.45));                      // the coping, standing proud
  // a weed line and the darker wet band at the water's edge
  bag.add('schist_rubble', box(x0, bed, z - 0.03, x1, water + 0.5, z + 0.2));
  col.floor([x0, z, x1, back], y);
  for (const sx of el.stairs || []) {
    const zs = z - 6.5;
    for (let i = 0; i < 24; i++) {
      const f = i / 24, yt = water + 0.15 + (y - water - 0.15) * (i + 1) / 24, zz = zs + 6.5 * f;
      S.push(...box(sx - 1.2, bed, zz, sx + 1.2, yt, z + 0.2).attributes.position.array);
    }
    S.push(...box(sx - 1.6, bed, zs - 2.2, sx + 1.6, water + 0.15, zs + 0.01).attributes.position.array);
    for (const sd of [-1, 1]) S.push(...box(sx + sd * 1.2 - (sd > 0 ? 0 : 0.35), bed, zs, sx + sd * 1.2 + (sd > 0 ? 0.35 : 0), y + 0.08, z - 0.12).attributes.position.array);
    col.ramp([sx - 1.2, zs, sx + 1.2, z], water + 0.15, y, 's');
    col.floor([sx - 1.6, zs - 2.2, sx + 1.6, zs], water + 0.15);
  }
  bag.add(L, fromTriangles(S));
  for (const px of el.posts || []) {
    bag.add('timber', lathe([[0.17, 0], [0.17, 1.0], [0.2, 1.08], [0.12, 1.2], [0.001, 1.25]], 8, null, px, y, z + 0.8));
    bag.add('iron', lathe([[0.14, -0.02], [0.16, 0], [0.14, 0.02]], 10, null, px, y + 0.6, z + 0.8).rotateX(0));
    col.circle(px, z + 0.8, 0.2, y, y + 1.2);
  }
}

/**
 * garden_wall: the king's garden's wall { rect, y, h, gates: [{ side 'n'|'s'|'e'|'w', at (from the side's start), w }] } — rubble
 * with a coping, a door in a stone frame at each gate.
 */
function gardenWall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3.2, th = 0.6, S = [], C = [];
  const sides = { n: [[x0, z0], [x1, z0]], s: [[x0, z1], [x1, z1]], w: [[x0, z0], [x0, z1]], e: [[x1, z0], [x1, z1]] };
  for (const [k, [a, b]] of Object.entries(sides)) {
    const Ln = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / Ln, (b[1] - a[1]) / Ln], W = frame(a, u, [-u[1], u[0]]);
    const gs = (el.gates || []).filter((g) => g.side === k).map((g) => [g.at - g.w / 2, g.at + g.w / 2]);
    let s = k === 'w' || k === 'e' ? th / 2 : -th / 2; const end = k === 'w' || k === 'e' ? Ln - th / 2 : Ln + th / 2;
    const runs = [];
    for (const [g0, g1] of gs) { runs.push([s, g0]); s = g1; }
    runs.push([s, end]);
    for (const [s0, s1] of runs) {
      fbox(S, W, s0, s1, y - 0.4, y + h, -th / 2, th / 2);
      fbox(C, W, s0 - 0.001, s1 + 0.001, y + h, y + h + 0.18, -th / 2 - 0.08, th / 2 + 0.08);
      col.segment([a[0] + u[0] * s0, a[1] + u[1] * s0], [a[0] + u[0] * s1, a[1] + u[1] * s1], th, y - 0.4, y + h);
    }
    for (const [g0, g1] of gs) {
      fbox(C, W, g0 - 0.3, g0, y - 0.4, y + h + 0.25, -th / 2 - 0.06, th / 2 + 0.06);
      fbox(C, W, g1, g1 + 0.3, y - 0.4, y + h + 0.25, -th / 2 - 0.06, th / 2 + 0.06);
      fbox(C, W, g0 - 0.3, g1 + 0.3, y + 2.6, y + h + 0.25, -th / 2 - 0.06, th / 2 + 0.06);
    }
  }
  bag.add('rubble', fromTriangles(S));
  bag.add(L, fromTriangles(C));
}

/**
 * garden_bed: a raised bed of the medieval garden { rect, y, seed, kind ('herbs'|'roses'|'lilies') } — wattle sides on stakes, the
 * earth, the plants in rows (herbs; roses with red flowers; lilies with white).
 */
function gardenBed(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, hh = 0.42, th = 0.08;
  let s = (el.seed ?? 7) >>> 0 || 1; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (const r of [[x0, z0, x1, z0 + th], [x0, z1 - th, x1, z1], [x0, z0 + th, x0 + th, z1 - th], [x1 - th, z0 + th, x1, z1 - th]]) bag.add('wicker', box(r[0], y - 0.05, r[1], r[2], y + hh, r[3]));
  for (const [sx, sz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) bag.add('timber', lathe([[0.05, 0], [0.05, hh + 0.12], [0.001, hh + 0.16]], 5, null, sx + (sx === x0 ? 0.04 : -0.04), y - 0.05, sz + (sz === z0 ? 0.04 : -0.04)));
  bag.add('earth_wall', box(x0 + th, y - 0.05, z0 + th, x1 - th, y + hh - 0.08, z1 - th));
  const kind = el.kind || 'herbs', along = x1 - x0 > z1 - z0, sp = kind === 'roses' ? 0.8 : 0.62;
  const L1 = along ? x1 - x0 : z1 - z0, L2 = along ? z1 - z0 : x1 - x0, nr = Math.max(1, Math.floor((L2 - 0.3) / sp)), nc = Math.max(1, Math.floor((L1 - 0.3) / sp));
  for (let i = 0; i < nc; i++) for (let j = 0; j < nr; j++) {
    const a = (i + 0.5) * (L1 - 0.3) / nc + 0.15, b = (j + 0.5) * (L2 - 0.3) / nr + 0.15;
    const px = along ? x0 + a : x0 + b, pz = along ? z0 + b : z0 + a, base = y + hh - 0.08, rr = (kind === 'roses' ? 0.32 : 0.17) * (0.8 + rnd() * 0.4);
    bag.add('lotus_leaf', leafBall([px, base + rr * 0.8, pz], rr));
    if (kind === 'roses') for (let f = 0; f < 4; f++) { const t = rnd() * 6.28; bag.add('cloth_red', leafBall([px + Math.cos(t) * rr * 0.8, base + rr * (1.0 + rnd() * 0.5), pz + Math.sin(t) * rr * 0.8], 0.06)); }
    if (kind === 'lilies') { bag.add('lotus_leaf', rod([px, base, pz], [px, base + 0.85, pz], 0.015, 4)); bag.add('cloth_white', lathe([[0.001, 0], [0.07, 0.08], [0.1, 0.18], [0.001, 0.12]], 6, null, px, base + 0.8, pz)); }
  }
  col.rect([x0, z0, x1, z1], y, y + hh);
}

/**
 * garden_arbour: a tunnel arbour of the medieval garden { a [x, z], b [x, z] (axis-aligned), w, h, y } — posts in pairs, arched hoops
 * of poles and laths along the top, the vine grown over it in clumps; a path of gravel under it.
 */
function gardenArbour(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, Ln = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / Ln, (bz - az) / Ln], n = [-u[1], u[0]];
  const y = el.y ?? 0, w = el.w ?? 2.6, h = el.h ?? 2.6, P = (s, d, yy) => [ax + u[0] * s + n[0] * d, yy, az + u[1] * s + n[1] * d];
  let sd = 11; const rnd = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
  const nb = Math.max(2, Math.round(Ln / 1.6));
  for (let i = 0; i <= nb; i++) {
    const s = i * Ln / nb;
    for (const d of [-w / 2, w / 2]) { bag.add('timber', rod(P(s, d, y - 0.2), P(s, d, y + h), 0.06, 5)); col.circle(...[P(s, d, 0)[0], P(s, d, 0)[2]], 0.08, y, y + h); }
    const pts = Array.from({ length: 9 }, (_, k) => { const t = Math.PI * k / 8; return P(s, -Math.cos(t) * w / 2, y + h + Math.sin(t) * w * 0.38); });
    for (let k = 0; k < 8; k++) bag.add('timber', rod(pts[k], pts[k + 1], 0.04, 4));
  }
  for (let k = 0; k <= 6; k++) { const t = Math.PI * k / 6, d = -Math.cos(t) * w / 2, yy = y + h + Math.sin(t) * w * 0.38; bag.add('timber', rod(P(0, d, yy), P(Ln, d, yy), 0.025, 4)); }
  for (const d of [-w / 2, w / 2]) bag.add('timber', rod(P(0, d, y + 1.2), P(Ln, d, y + 1.2), 0.03, 4));
  // the vine
  for (let i = 0; i < Math.round(Ln * 3.2); i++) {
    const s = rnd() * Ln, t = rnd() * Math.PI, d = -Math.cos(t) * w / 2 * 1.04, yy = y + h + Math.sin(t) * w * 0.38 + 0.08;
    bag.add('lotus_leaf', leafBall(P(s, d, yy), 0.28 + rnd() * 0.2));
    if (rnd() < 0.3) bag.add('lotus_leaf', leafBall(P(s, (rnd() < 0.5 ? -1 : 1) * (w / 2 + 0.06), y + 0.6 + rnd() * (h - 0.6)), 0.2 + rnd() * 0.12));
  }
  bag.add('pebbles', box(Math.min(P(0, -w / 2, 0)[0], P(Ln, w / 2, 0)[0]), y - 0.05, Math.min(P(0, -w / 2, 0)[2], P(Ln, w / 2, 0)[2]), Math.max(P(0, -w / 2, 0)[0], P(Ln, w / 2, 0)[0]), y + 0.03, Math.max(P(0, -w / 2, 0)[2], P(Ln, w / 2, 0)[2])));
}

/** garden_well: a well with a stone curb, two posts and a little roof over the windlass, the rope and the bucket { at, y }. */
function gardenWell(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add(L, lathe([[0.85, 0], [0.85, 0.75], [0.95, 0.8], [0.95, 0.92], [0.62, 0.92], [0.62, 0.3], [0.001, 0.3]], 20, null, x, y, z));
  bag.add('water', lathe([[0.001, 0.5], [0.62, 0.5]], 16, null, x, y, z));
  for (const s of [-1, 1]) bag.add('timber', box(x + s * 0.78 - 0.08, y + 0.7, z - 0.08, x + s * 0.78 + 0.08, y + 2.4, z + 0.08));
  bag.add('timber', rod([x - 0.9, y + 1.7, z], [x + 0.9, y + 1.7, z], 0.09, 8));
  const R = [];
  prism(R, [[x - 1.05, y + 2.3, z - 0.75], [x - 1.05, y + 2.3, z + 0.75], [x - 1.05, y + 2.95, z]], [2.1, 0, 0]);
  bag.add('roof_tile', fromTriangles(R));
  bag.add('linen', rod([x, y + 1.7, z], [x, y + 1.05, z], 0.012, 4));
  bag.add('wood_dark', lathe([[0.13, 0], [0.15, 0.28], [0.001, 0.28]], 10, null, x, y + 0.78, z));
  col.circle(x, z, 0.95, y, y + 0.92);
}

Object.assign(STYLES.gothic.elements, { palace_hall: palaceHall, palace_tower: palaceTower, palace_wall: palaceWall, quay, garden_wall: gardenWall, garden_bed: gardenBed, garden_arbour: gardenArbour, garden_well: gardenWell });
void bars; void ringPts;
