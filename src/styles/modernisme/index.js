// Catalan modernisme (Barcelona about 1910; docs/settlements/barcelona.md §4–§5): the Eixample's
// blocks — buildings of a ground floor of shops, an entresol, the principal floor with its long
// balcony and four upper floors round an open court, the corners cut at 45° with glazed tribunes,
// iron balconies and green louvred shutters, cornices and parapets over flat roof terraces; the
// Sagrada Família as it stood about 1910 — the apse of 1891–1894 with its seven chapels, lancets,
// gables and pinnacles, the Nativity façade (nativity.js: its sculpted portals, the turtle columns,
// the four towers rising in timber scaffolding), a derrick, the workshop and the stone yard, Gaudí's Schools of 1909 with
// their waving brick walls and roof; Casa Milà's undulating stone front round its corner, with
// twisted iron balconies and the chimneys on its roof; Casa Batlló's bone-like stone columns,
// mosaic front set with ceramic discs, mask-like iron balconies and scaled dragon roof with the
// cross on its turret.

import { mercat } from './mercat.js';
import { bancFanal } from './bench.js';
import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, disc } from '../../core/geom.js';
import { Matrix4, BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import '../qing/index.js';
import { nativity } from './nativity.js';
import { STREET } from './street.js';
import { casaCafe } from './interior.js';
import { FURNITURE } from './furniture.js';
import { worksFence } from './works.js';
import { schoolRooms, workshopRooms } from './school.js';
import { makeShops, plotShops, shopPeople } from './shops.js';

const S = 'limestone_yellow', P = 'stucco_cream', IRON = 'iron';
const FACADES = [S, P, 'stucco_ochre', 'stucco_pale', P, 'stucco_rose'];
const SHUTTERS = ['shutter_green', 'shutter_green', 'shutter_brown', 'shutter_grey'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
const quad = (T, A, B, C, D) => T.push(...A, ...B, ...C, ...A, ...C, ...D);

/**
 * A frame on a street front: origin a, unit u along the front, n = (u.z, −u.x) outward. F(s0, s1,
 * t0, t1, y0, y1) is a box in it (s along, t out from the front); axis-aligned where the front is.
 */
function frame(a, b) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], n = [u[1], -u[0]];
  const axis = Math.abs(u[0]) < 1e-6 || Math.abs(u[1]) < 1e-6;
  const at = (s, t) => [a[0] + u[0] * s + n[0] * t, a[1] + u[1] * s + n[1] * t];
  const F = (s0, s1, t0, t1, y0, y1) => {
    if (axis) { const p = at(s0, t0), q = at(s1, t1); return box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1])); }
    const tm = (t0 + t1) / 2; return orientedBox(at(s0, tm), at(s1, tm), t1 - t0, y0, y1);
  };
  return { L, u, n, at, F, axis, yaw: Math.atan2(n[0], n[1]) };
}
/** An iron railing in a frame: rails and bars along the front at t, returns at both ends back to the wall. */
function railing(bag, fr, s0, s1, t, y0, hgt = 1.0, gap = 0.2) {
  const F = fr.F;
  bag.add(IRON, F(s0, s1, t - 0.04, t, y0 + hgt - 0.05, y0 + hgt));
  bag.add(IRON, F(s0, s1, t - 0.035, t - 0.005, y0 + 0.1, y0 + 0.14));
  const n = Math.max(2, Math.round((s1 - s0) / gap));
  for (let i = 0; i <= n; i++) { const s = s0 + (s1 - s0) * i / n; bag.add(IRON, F(s - 0.012, s + 0.012, t - 0.032, t - 0.008, y0, y0 + hgt - 0.05)); }
  for (const s of [s0, s1 - 0.04]) {
    bag.add(IRON, F(s, s + 0.04, 0.0, t - 0.04, y0 + hgt - 0.05, y0 + hgt));
    for (let k = 1; k * gap < t - 0.06; k++) bag.add(IRON, F(s + 0.008, s + 0.032, k * gap - 0.012, k * gap + 0.012, y0, y0 + hgt - 0.05));
  }
}

// ── The Eixample's blocks ────────────────────────────────────────────────────────────────────
/** The floor levels of an Eixample house (m): ground floor of shops, entresol, principal, four upper floors. */
const LV = [0, 4.6, 7.4, 11.2, 14.5, 17.8, 21.1, 24.4];
/** Pieces built once in a front's own frame (s along x, out toward −z, y up) and set many times: one shape per kind, instanced where the bag instances. */
const PROTO = new Map(), LOCAL = frame([0, 0], [1, 0]);
function proto(key, build) {
  let p = PROTO.get(key);
  if (!p) {
    const parts = new Map(), mini = { add: (m, g) => { if (!parts.has(m)) parts.set(m, []); parts.get(m).push(g.index ? g.toNonIndexed() : g); } };
    build(mini, LOCAL);
    p = [...parts].map(([m, list]) => {
      let n = 0; for (const g of list) n += g.attributes.position.array.length;
      const P = new Float32Array(n), N = new Float32Array(n); let o = 0;
      for (const g of list) { P.set(g.attributes.position.array, o); N.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
      const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3));
      return [m, g];
    });
    PROTO.set(key, p);
  }
  return p;
}
/** Set a piece at s along a frame, its foot at y. */
function put(bag, fr, pieces, s, y, reach = 420) {
  const q = fr.at(s, 0), M = new Matrix4().makeRotationY(Math.atan2(-fr.u[1], fr.u[0])).setPosition(q[0], y, q[1]);
  for (const [m, g] of pieces) { if (bag.addInstance) bag.addInstance(m, g, M.clone(), { reach }); else bag.add(m, g.clone().applyMatrix4(M)); }
}
const SHOPS = makeShops({ proto, put });
const CORNER_CLEAR = 5;
/** Louvred shutters at a window: folded open against the wall, or closed over it, or one leaf drawn. */
function shutters(bag, F, ww, y0, y1, state, mat) {
  if (state === 0) { bag.add(mat, F(-ww / 2, ww / 2, 0.03, 0.07, y0, y1)); return; }
  if (state === 1) { bag.add(mat, F(-ww / 2, -0.01, 0.03, 0.07, y0, y1)); bag.add(mat, F(ww / 2 + 0.03, ww, 0.03, 0.07, y0, y1)); return; }
  bag.add(mat, F(-ww - 0.02, -ww / 2 - 0.03, 0.03, 0.07, y0, y1)); bag.add(mat, F(ww / 2 + 0.03, ww + 0.02, 0.03, 0.07, y0, y1));
}
const WIN = { 2: [1.4, 2.85], mid: [1.2, 2.35], last: [1.1, 2.05] };
/** A window of floor kind k ('2' the principal, 'mid', 'last'): its opening, lintel or pediment, sill. */
const windowP = (k) => proto(`win|${k}`, (b, { F }) => {
  const [ww, wh] = WIN[k], y0 = 0.06, y1 = y0 + wh;
  b.add('opening', F(-ww / 2, ww / 2, -0.03, 0.03, y0, y1));
  b.add(S, F(-ww / 2 - 0.18, ww / 2 + 0.18, 0, k === 2 ? 0.18 : 0.12, y1, y1 + (k === 2 ? 0.42 : 0.22)));
  if (k === 2) b.add(S, F(-ww / 2 - 0.3, ww / 2 + 0.3, 0, 0.26, y1 + 0.42, y1 + 0.54));
  if (k === 'last') b.add(S, F(-ww / 2 - 0.12, ww / 2 + 0.12, 0, 0.14, -0.06, 0.06));
});
const shutterP = (k, state, mat) => proto(`sh|${k}|${state}|${mat}`, (b, { F }) => { const [ww, wh] = WIN[k]; shutters(b, F, ww, 0.06, 0.06 + wh, state, mat); });
/** A balcony of an upper floor: the stone slab on two brackets, the iron railing; d its depth. */
const balconyP = (d) => proto(`bal|${d}`, (b, fr) => {
  const F = fr.F;
  b.add(S, F(-0.95, 0.95, 0, d, -0.12, 0.06));
  b.add(S, F(-0.8, -0.6, 0, d * 0.7, -0.32, -0.12)); b.add(S, F(0.6, 0.8, 0, d * 0.7, -0.32, -0.12));
  railing(b, fr, -0.92, 0.92, d - 0.03, 0.06, 0.95, 0.19);
});
/** 0.96 m of the principal floor's railing. */
const railBars = () => proto('railbars', (b, fr) => { const F = fr.F; b.add(IRON, F(0, 0.96, 0.86, 0.9, 0.95, 1.0)); b.add(IRON, F(0, 0.96, 0.865, 0.895, 0.1, 0.14)); for (let i = 0; i < 6; i++) { const s = 0.08 + i * 0.16; b.add(IRON, F(s - 0.012, s + 0.012, 0.868, 0.892, 0, 0.95)); } });
/** The ground floor: a shop's opening in its wooden front, or the portal with its doors. */
const shopP = () => proto('shop', (b, { F }) => {
  b.add('opening', F(-1.2, 1.2, 0.07, 0.1, 0.1, 3.8));
  for (const sm of [-1.2, -0.02, 1.12]) b.add('wood_painted', F(sm, sm + 0.08, 0.1, 0.15, 0.1, 3.2));
  b.add('wood_painted', F(-1.2, 1.2, 0.1, 0.15, 0.1, 0.7)); b.add('wood_painted', F(-1.2, 1.2, 0.1, 0.16, 3.2, 3.75));
  b.add(S, F(-1.35, 1.35, 0.076, 0.2, 3.8, 4.1));
});
const doorP = () => proto('door', (b, { F }) => {
  b.add('opening', F(-0.95, 0.95, 0.07, 0.1, 0.1, 3.9));
  b.add('wood_dark', F(-0.9, 0.9, 0.1, 0.14, 0.1, 2.9)); b.add('wood_dark', F(-0.03, 0.03, 0.14, 0.16, 0.1, 2.9));
  for (const e of [-1, 1]) b.add(S, F(e * 1.1 - 0.15, e * 1.1 + 0.15, 0.06, 0.22, 0.4, 3.9));
  b.add(S, F(-1.3, 1.3, 0.076, 0.28, 3.9, 4.35));
});
const entresolP = () => proto('entresol', (b, { F }) => {
  b.add('opening', F(-0.6, 0.6, -0.03, 0.03, 5.3, 6.9)); b.add(S, F(-0.75, 0.75, 0, 0.12, 5.18, 5.3));
  for (const e of [-1, 1]) b.add(S, F(e * 0.95 - 0.13, e * 0.95 + 0.13, 0, 0.72, 6.95, 7.25));
});
/** A shop's awning (toldo) over one bay: striped cloth sloping down 1.0 m from the wall (the tram poles stand 1.4 m out), a valance, two iron arms. */
const AWN = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_maroon'];
const awningP = (ci) => proto(`awn|${ci}`, (b, { F }) => {
  const P3 = (s, t, yy) => [s, yy, -t], T0 = [], T1 = [], N = 6, w = 2.3;
  for (let i = 0; i < N; i++) {
    const s0 = -w / 2 + w * i / N, s1 = -w / 2 + w * (i + 1) / N, T = i % 2 ? T1 : T0;
    quad(T, P3(s0, 0.08, 3.6), P3(s1, 0.08, 3.6), P3(s1, 1.0, 2.7), P3(s0, 1.0, 2.7));
    quad(T, P3(s0, 1.0, 2.7), P3(s1, 1.0, 2.7), P3(s1, 1.02, 2.46), P3(s0, 1.02, 2.46));
  }
  b.add(AWN[ci], fromTriangles(both(T0))); b.add('cloth_white', fromTriangles(both(T1)));
  for (const e of [-1, 1]) b.add(IRON, F(e * w / 2 - 0.015, e * w / 2 + 0.015, 0.06, 1.0, 2.66, 2.7));
  b.add(IRON, F(-w / 2, w / 2, 0.98, 1.03, 2.68, 2.72));
});
/** A flower box on a balcony's rail (geraniums, carnations, ferns). */
const flowerP = (k, d) => proto(`flw|${k}|${d}`, (b, { F }) => {
  b.add('wood_painted', F(-0.8, 0.8, d - 0.08, d + 0.14, 0.72, 0.95));
  const col = ['cloth_red', 'cloth_ochre', 'cloth_white'][k];
  for (let i = 0; i < 9; i++) { const s = -0.72 + i * 0.18; b.add('cloth_green', F(s - 0.1, s + 0.1, d - 0.06, d + 0.12, 0.95, 1.16 + (i % 3) * 0.05)); if (i % 2 === 0) b.add(col, F(s - 0.05, s + 0.05, d - 0.02, d + 0.08, 1.16 + (i % 3) * 0.05, 1.27 + (i % 3) * 0.05)); }
});
/** Washing hung over a balcony's rail on the outside. */
const washP = (k, d) => proto(`wash|${k}|${d}`, (b, { F }) => {
  const C = ['cloth_white', 'cloth_blue', 'cloth_white', 'cloth_ochre', 'cloth_red'];
  b.add(IRON, F(-0.9, 0.9, d + 0.04, d + 0.06, 1.34, 1.36));
  for (let i = 0; i < 4; i++) { const s = -0.72 + i * 0.46, hh = 0.5 + ((i * 7 + k) % 4) * 0.1; b.add(C[(i + k) % 5], F(s - 0.18, s + 0.18, d + 0.04, d + 0.07, 1.34 - hh, 1.34)); }
});
/** A birdcage hung from the rail's corner. */
const cageP = (d) => proto(`cage|${d}`, (b) => {
  const z = -(d + 0.14); b.add('gilt_bronze', rod([0.7, 1.9, z], [0.7, 1.35, z], 0.006, 4)); b.add('gilt_bronze', lathe([[0.14, 0], [0.14, 0.2], [0.001, 0.28]], 8, null, 0.7, 1.1, z));
});
/** A lantern on an iron bracket from the wall (a gas lamp of the façade). */
const lanternP = () => proto('lantern', (b, { F }) => {
  b.add(IRON, F(-0.02, 0.02, 0.0, 0.62, 0.55, 0.59)); b.add(IRON, F(-0.015, 0.015, 0.0, 0.45, 0.0, 0.03));
  b.add(IRON, rod([0, 0.0, -0.01], [0, 0.55, -0.45], 0.012, 4)); void 0;
  b.add('lamp_glass', lathe([[0.001, 0.0], [0.12, 0.05], [0.13, 0.3], [0.001, 0.36]], 6, null, 0, 0.18, -0.58));
  b.add(IRON, lathe([[0.001, 0.0], [0.17, 0.0], [0.001, 0.12]], 6, null, 0, 0.54, -0.58)); b.add(IRON, lathe([[0.001, 0], [0.1, 0], [0.1, 0.03], [0.001, 0.03]], 6, null, 0, 0.14, -0.58));
});
/** One floor of a corner's glazed gallery, H from its floor to the next. */
const tribuneP = (H, last) => proto(`trib|${H}|${last}`, (b, { F }) => {
  b.add(S, F(-1.6, 1.6, 0, 1.1, -0.15, 0.05));
  b.add(S, F(-1.6, 1.6, 0.9, 1.1, 0.05, 0.95));
  for (const e of [-1, 1]) b.add(S, F(e * 1.6 - (e > 0 ? 0.2 : 0), e * 1.6 + (e < 0 ? 0.2 : 0), 0, 1.1, 0.05, H - 0.15));
  b.add('opening', F(-1.0, 1.0, -0.03, 0.03, 0.06, 2.6));
  b.add('glass_outer', F(-1.4, 1.4, 0.95, 1.0, 0.95, 2.9));
  for (let m = 0; m <= 4; m++) { const sm = -1.4 + m * 0.7; b.add('wood_painted', F(sm - 0.04, sm + 0.04, 0.9, 1.06, 0.95, 2.9)); }
  b.add('wood_painted', F(-1.4, 1.4, 0.9, 1.06, 2.2, 2.26));
  b.add(S, F(-1.6, 1.6, 0.9, 1.1, 2.9, H - 0.15));
  if (last) b.add(S, F(-1.7, 1.7, 0, 1.2, H - 0.15, H + 0.05));
});
/**
 * One street front of an Eixample house, s0…s1 in the frame, its roof at y + h: the granite plinth and
 * the stone ground floor in courses with its shops and the portal; the entresol's small windows; the
 * principal floor's long balcony on brackets; a balcony of iron to every window above; shutters; the
 * cornice and the parapet of the roof terrace. `tribune`: a glazed gallery up the middle bay (the corners).
 */
function streetFront(bag, fr, s0, s1, y, h, mat, rand, tribune = false, opt = {}) {
  const own = !!opt.own;                       // a house with its own ground floor and principal windows (interior.js)
  const shops = opt.shops ?? [];               // shops with a front of their own (shops.js): their bays are dressed there
  const F = fr.F, w = s1 - s0, nb = Math.max(1, Math.round(w / 3.4)), bw = w / nb, sh = rand() < 0.7 ? 'shutter_green' : 'shutter_brown';
  const top = LV.findIndex((l) => l >= h - 0.01), door = Math.floor(nb / 2);
  const dr = rng(((Math.round(s0 * 37 + y * 11 + h * 101 + fr.at(0, 0)[0] * 3 + fr.at(0, 0)[1] * 7) >>> 0) || 1));       // the dressing's own stream (the look of the rest is unchanged)
  const inShop = (i) => shops.some((q) => s0 + (i + 0.5) * bw > q.s0 && s0 + (i + 0.5) * bw < q.s1);
  const mirador = !tribune && !own && nb >= 4 && dr() < 0.2;
  const tb = tribune ? door : mirador ? (dr() < 0.5 ? 0 : nb - 1) : -1;
  if (!own) {
    { // the plinth, in pieces round the shops' doors
      const gaps = shops.map((q) => { const d = q.door === 'L' ? q.s0 + q.bw / 2 : q.s1 - q.bw / 2; return [d - 0.9, d + 0.9]; }).sort((p, q) => p[0] - q[0]);
      let c0 = s0; for (const [g0, g1] of gaps) { if (g0 > c0 + 0.05) bag.add('granite_grey', F(c0, g0, -0.04, 0.1, y - 1.25, y + 0.45)); c0 = g1; }
      if (s1 > c0 + 0.05) bag.add('granite_grey', F(c0, s1, -0.04, 0.1, y - 1.25, y + 0.45));
    }
    // the stone ground floor, in pieces round the shops' own fronts
    let c = s0; const cuts = [...shops].sort((p, q) => p.s0 - q.s0);
    const stone = (a, b) => { if (b - a < 0.05) return; bag.add(S, F(a, b, -0.02, 0.06, y - 1.1, y + 4.6)); for (let yy = y + 1.0; yy < y + 4.4; yy += 0.6) bag.add('limestone', F(a, b, 0.06, 0.075, yy - 0.03, yy)); };
    for (const q of cuts) { stone(c, q.s0); c = q.s1; bag.add(S, F(q.s0, q.s1, -0.02, 0.06, y + 4.42, y + 4.6)); }
    stone(c, s1);
  }        // the coursing of the ground floor
  bag.add(S, F(s0, s1, 0, 0.22, y + 4.6, y + 4.85));
  for (let i = 0; i < nb; i++) {
    const sc = s0 + (i + 0.5) * bw;
    if (tribune && i === door) {
      put(bag, fr, shopP(), sc, y);
      for (let f = 2; f < top; f++) put(bag, fr, tribuneP(+(LV[f + 1] - LV[f]).toFixed(2), f === top - 1), sc, y + LV[f]);
      continue;
    }
    if (!own) {
      if (!inShop(i)) put(bag, fr, i === door ? doorP() : shopP(), sc, y);
      if (i !== door && rand() < 0.34) { const ci = Math.floor(rand() * AWN.length); if (!inShop(i) || dr() < 0.5) put(bag, fr, awningP(ci), sc, y - (inShop(i) ? 0.2 : 0)); }
    }
    put(bag, fr, entresolP(), sc, y);
    if (i === tb) for (let f = 2; f < top; f++) put(bag, fr, tribuneP(+(LV[f + 1] - LV[f]).toFixed(2), f === top - 1), sc, y + LV[f]);
    for (let f = 2; f < top; f++) {
      const k = f === 2 ? 2 : f === top - 1 ? 'last' : 'mid', st = Math.floor(rand() * 4) % 3;
      if (i === tb) continue;
      if (!(own && f === 2)) put(bag, fr, windowP(k), sc, y + LV[f]);
      put(bag, fr, shutterP(k, st === 2 && rand() < 0.5 ? 2 : st, sh), sc, y + LV[f]);
      const bd = +(0.62 - 0.05 * (f - 3)).toFixed(2);
      if (k === 'mid') put(bag, fr, balconyP(bd), sc, y + LV[f]);
      // life at the windows: a flower box on the rail, washing over it, a cage, an awning over a window
      const q = dr();
      if (k === 'mid') { if (q < 0.34) put(bag, fr, flowerP(Math.floor(dr() * 3), bd), sc, y + LV[f], 90); else if (q < 0.5) put(bag, fr, washP(Math.floor(dr() * 5), bd), sc, y + LV[f], 90); else if (q < 0.56) put(bag, fr, cageP(bd), sc, y + LV[f], 60); else if (q < 0.64 && f === 3) put(bag, fr, awningP(Math.floor(dr() * AWN.length)), sc, y + LV[f] - 0.75, 120); }
      else if (k === 2 && q < 0.3) put(bag, fr, flowerP(Math.floor(dr() * 3), 0.88), sc, y + LV[f] + 0.0, 90);
    }
  }
  // the principal floor's balcony along the front (round the gallery at a corner), the cornice and the parapet
  const runs = tb >= 0 ? [[s0 + 0.4, s0 + tb * bw + bw / 2 - 1.65], [s0 + tb * bw + bw / 2 + 1.65, s1 - 0.4]] : [[s0 + 0.4, s1 - 0.4]];
  for (const [a, b] of runs) {
    const n = Math.floor((b - a - 0.1) / 0.96); if (n < 1) continue;
    const m = (a + b) / 2, L = n * 0.96;
    bag.add(S, F(m - L / 2 - 0.05, m + L / 2 + 0.05, 0, 0.95, y + 7.25, y + 7.45));
    for (let j = 0; j < n; j++) put(bag, fr, railBars(), m - L / 2 + j * 0.96, y + 7.45);
    for (const e of [m - L / 2, m + L / 2 - 0.04]) { bag.add(IRON, F(e, e + 0.04, 0, 0.86, y + 8.4, y + 8.45)); for (let k = 1; k < 5; k++) bag.add(IRON, F(e + 0.008, e + 0.032, k * 0.17 - 0.012, k * 0.17 + 0.012, y + 7.45, y + 8.4)); }
  }
  // weathering (docs/settlements/barcelona.md §5c): the grime of the street on the lower stone of the ground floor,
  // wavering, broken at the portal; rain streaks greyed down the stucco from the cornice between the bays
  for (let i = 0; i < nb && !own; i++) {
    if (i === door && !tribune) continue;
    if (inShop(i)) continue;
    const a = s0 + i * bw + (i === door + 1 && !tribune ? 0.9 : 0.05), b = s0 + (i + 1) * bw - (i === door - 1 && !tribune ? 0.9 : 0.05);
    if (b - a > 0.3) bag.add('plaster_damp', F(a, b, 0.062, 0.07, y + 0.45, y + 0.72 + 0.16 * Math.sin(i * 2.3 + s0)));
  }
  for (let i = 1; i < nb; i++) if (rand() < 0.7) { const u = s0 + i * bw, L2 = 1.6 + rand() * 2.8; bag.add('plaster_streak', F(u - 0.16, u + 0.16, 0.006, 0.02, Math.max(y + 7.6, y + h - 0.62 - L2), y + h - 0.62)); }
  // the façade's own dressing (a stream of its own): pilasters between the bays, a ceramic band under the cornice, a curved crest over the middle bay,
  // a wall lantern at the plot's end, a poster on a blank pier
  if (!own && !tribune) {
    if (dr() < 0.3) for (let i = 1; i < nb; i++) { const u = s0 + i * bw; bag.add(S, F(u - 0.16, u + 0.16, 0, 0.1, y + 7.45, y + h - 0.62)); }
    if (dr() < 0.38) { const bm = dr() < 0.5 ? 'tile_turquoise' : dr() < 0.5 ? 'stucco_ochre' : 'glaze_green'; bag.add(bm, F(s0 + 0.3, s1 - 0.3, 0.0, 0.04, y + h - 1.5, y + h - 0.95)); for (let i = 0; i < nb; i++) { const u = s0 + (i + 0.5) * bw; bag.add('tile_cream', F(u - 0.35, u + 0.35, 0.04, 0.06, y + h - 1.4, y + h - 1.05)); } }
    put(bag, fr, lanternP(), s0 + 0.3, y + 3.0, 80);
  }
  bag.add(S, F(s0, s1, 0, 0.24, y + h - 0.62, y + h - 0.42));
  bag.add(S, F(s0, s1, 0, 0.52, y + h - 0.42, y + h - 0.16));
  bag.add(mat, F(s0, s1, -0.3, 0, y + h - 0.16, y + h + 1.0));
  bag.add(S, F(s0, s1, -0.36, 0.08, y + h + 1.0, y + h + 1.1));
  if (!own && !tribune && dr() < 0.24) {
    const sc = s0 + (Math.floor(nb / 2) - (dr() < 0.5 ? 1 : 0) + 0.5) * bw + 0.0, ws = [3.0, 2.2, 1.4, 0.7];
    for (let k = 0; k < ws.length; k++) bag.add(S, F(sc - ws[k] / 2, sc + ws[k] / 2, -0.3, 0.1, y + h + 1.1 + k * 0.38, y + h + 1.1 + (k + 1) * 0.38));
    bag.add('gilt_bronze', F(sc - 0.05, sc + 0.05, -0.1, 0.0, y + h + 1.1 + ws.length * 0.38, y + h + 1.1 + ws.length * 0.38 + 0.5));
  }
}
/** The court side of a house: plain windows with shutters, floor over floor. */
function courtFront(bag, fr, s0, s1, y, h, D, rand, from = 1) {
  const top = LV.findIndex((l) => l >= h - 0.01), n = Math.max(1, Math.floor((s1 - s0) / 3.2)), bw = (s1 - s0) / n;
  for (let f = from; f < top; f++) for (let i = 0; i < n; i++) {
    const sc = s0 + (i + 0.5) * bw, y0 = y + LV[f] + 0.8;
    bag.add('opening', fr.F(sc - 0.55, sc + 0.55, -D - 0.03, -D + 0.03, y0, y0 + 1.6));
    if (rand() < 0.35) bag.add('cloth_white', fr.F(sc - 0.5, sc + 0.4, -D - 0.12, -D - 0.1, y0 - 0.9, y0 - 0.2));     // laundry hung out
  }
  bag.add(S, fr.F(s0, s1, -D - 0.1, -D + 0.3, y + h + 0.0, y + h + 0.9));
}
/** The two chimneys of a plot's roof terrace: [s, t] in the front's frame (from the plot's own seed, so the smoke can find them). */
const chimneyAt = (seed, s0, s1) => { const r = rng(seed + 17), o = []; for (let k = 0; k < 2; k++) o.push([s0 + 1.5 + r() * (s1 - s0 - 3), -3 - r() * 4]); return o; };
/** The roof terrace's chimneys and the little stair house. */
function roofTop(bag, fr, s0, s1, y, h, D, seed) {
  const F = fr.F, sc = (s0 + s1) / 2;
  bag.add(P, F(sc - 1.4, sc + 1.4, -D + 4, -D + 7, y + h, y + h + 2.5)); bag.add(S, F(sc - 1.55, sc + 1.55, -D + 3.85, -D + 7.15, y + h + 2.5, y + h + 2.68));
  bag.add('opening', F(sc - 0.45, sc + 0.45, -D + 6.97, -D + 7.03, y + h, y + h + 2.0));
  for (const [s, t] of chimneyAt(seed, s0, s1)) { bag.add('brick', F(s - 0.3, s + 0.3, t - 0.3, t + 0.3, y + h, y + h + 1.7)); bag.add(S, F(s - 0.38, s + 0.38, t - 0.38, t + 0.38, y + h + 1.7, y + h + 1.82)); }
}
/** Cut a run [r0, r1] minus gaps into plots of 12–19 m. */
function plotRuns(r0, r1, gaps, rand) {
  const runs = [], out = [];
  let a = r0;
  for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > a) runs.push([a, g0]); a = Math.max(a, g1); }
  if (r1 > a) runs.push([a, r1]);
  for (const [p, q] of runs) { let s = p; while (q - s > 0.5) { let w = 12 + rand() * 7; if (q - s - w < 10) w = q - s; out.push([s, s + w]); s += w; } }
  return out;
}
const pickH = (rand) => { const r = rand(); return r < 0.15 ? LV[5] : r < 0.75 ? LV[6] : LV[7]; };
/**
 * eixample_block: { c, s (side), d (depth of the ring of houses), ch (the cut corners), y, seed,
 * cut: { corner (0 NE, 1 SE, 2 SW, 3 NW), a, b } (a house of its own there: the corner and a m of the
 * side before it, b m of the side after), gaps: [{ side (0 N, 1 E, 2 S, 3 W), s0, s1 }] }
 */
/** The block's geometry in plan: the octagon P8, the sides' plots [{ k (side), a, b, seed }] (pure: the smoke finds the chimneys from it). */
function blockPlan(el) {
  const [cx, cz] = el.c, s = el.s ?? 70, D = el.d ?? 18, ch = el.ch ?? 12, o = s / 2, rand = rng(el.seed || 1);
  const P8 = [[-o + ch, -o], [o - ch, -o], [o, -o + ch], [o, o - ch], [o - ch, o], [-o + ch, o], [-o, o - ch], [-o, -o + ch]].map(([x, z]) => [cx + x, cz + z]);
  const L = 2 * (o - ch), trim = D - ch, cut = el.cut, plots = [];
  for (let k = 0; k < 4; k++) {
    let r0 = k % 2 ? trim : 0, r1 = k % 2 ? L - trim : L;
    if (cut && cut.corner === k) r1 = Math.min(r1, L - cut.a);
    if (cut && (cut.corner + 1) % 4 === k) r0 = Math.max(r0, cut.b);
    const gaps = (el.gaps ?? []).filter((g) => g.side === k).map((g) => [g.s0, g.s1]);
    for (const [a, b] of plotRuns(r0, r1, gaps, rand)) plots.push({ k, a, b, seed: (((el.seed || 1) * 7919 + k * 104729 + Math.round(a * 10)) >>> 0) || 1 });
  }
  return { P8, L, D, plots };
}
/**
 * The roofs' chimneys of a block as [x, y, z] (the top of each stack), for the settlement's smoke: the same plots, heights and
 * stacks as block() builds (el as in the plan: c, s, d, ch, y, seed, cut, gaps).
 */
export function blockShops(el) {
  if (!el.shops) return [];
  const { P8, plots } = blockPlan(el), y = el.y ?? 0, out = [];
  for (const p of plots) {
    const fr = frame(P8[2 * p.k], P8[2 * p.k + 1]); if (!fr.axis) continue;
    const nb = Math.max(1, Math.round((p.b - p.a) / 3.4));
    for (const sh of plotShops(p, nb, (p.b - p.a) / nb, true, [CORNER_CLEAR, 2 * ((el.s ?? 70) / 2 - (el.ch ?? 12)) - CORNER_CLEAR])) {
      const yS = y + (el.dz ?? 0) * (fr.at((sh.s0 + sh.s1) / 2, 0)[1] - el.c[1]);
      out.push({ ...sh, y: yS, people: shopPeople(sh).map((q) => ({ role: q.role, at: fr.at(q.at[0], q.at[1]), face: [fr.u[0] * q.face[0] + fr.n[0] * q.face[1], fr.u[1] * q.face[0] + fr.n[1] * q.face[1]] })), door: fr.at(sh.door === 'L' ? sh.s0 + sh.bw / 2 : sh.s1 - sh.bw / 2, 0), n: fr.n });
    }
  }
  return out;
}
export function blockChimneys(el) {
  const { P8, plots } = blockPlan(el), y = el.y ?? 0, out = [];
  for (const p of plots) {
    const h = pickH(rng(p.seed)), fr = frame(P8[2 * p.k], P8[2 * p.k + 1]);
    for (const [s, t] of chimneyAt(p.seed, p.a, p.b)) { const q = fr.at(s, t); out.push([q[0], y + h + 1.82, q[1]]); }
  }
  return out;
}
/**
 * The pavements round a block (§9): a slab of flagstones 4.4 m wide from the houses' faces to the kerb, a granite kerb on its edge,
 * the triangles by the cut corners, an iron cover or two in the roadway's edge. Heights follow the street's fall.
 */
function pavement(el, bag) {
  const [cx, cz] = el.c, o = (el.s ?? 70) / 2, ch = el.ch ?? 12, y = el.y ?? 0, dz = el.dz ?? 0, Wd = 4.4, Z = (z) => y + dz * (z - cz);
  const T = [], K = [], zt = (x, z, up = 0.05) => [x, Z(z) + up, z];
  const slab = (x0, z0, x1, z1) => { quad(T, zt(x0, z0), zt(x1, z0), zt(x1, z1), zt(x0, z1)); };
  slab(cx - o - Wd, cz - o - Wd, cx + o + Wd, cz - o); slab(cx - o - Wd, cz + o, cx + o + Wd, cz + o + Wd);
  slab(cx + o, cz - o, cx + o + Wd, cz + o); slab(cx - o - Wd, cz - o, cx - o, cz + o);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) quad(T, zt(cx + sx * (o - ch), cz + sz * o), zt(cx + sx * o, cz + sz * (o - ch)), zt(cx + sx * o, cz + sz * o), zt(cx + sx * (o - ch), cz + sz * o));
  // the kerb: a granite strip 0.22 wide along each outer edge, its face to the road
  const kerb = (x0, z0, x1, z1, nx, nz) => { const e = 0.22; const a = [x0, z0], b = [x1, z1], ia = [x0 - nx * e, z0 - nz * e], ib = [x1 - nx * e, z1 - nz * e]; quad(K, zt(...ia, 0.11), zt(...ib, 0.11), zt(...b, 0.11), zt(...a, 0.11)); quad(K, zt(...a, 0.11), zt(...b, 0.11), zt(...b, -0.1), zt(...a, -0.1)); };
  kerb(cx - o - Wd, cz - o - Wd, cx + o + Wd, cz - o - Wd, 0, -1); kerb(cx + o + Wd, cz + o + Wd, cx - o - Wd, cz + o + Wd, 0, 1);
  kerb(cx + o + Wd, cz - o - Wd, cx + o + Wd, cz + o + Wd, 1, 0); kerb(cx - o - Wd, cz + o + Wd, cx - o - Wd, cz - o - Wd, -1, 0);
  bag.add(el.pave ?? 'flagstone', fromTriangles(both(T))); bag.add('granite_grey', fromTriangles(both(K)));
  // iron covers in the roadway's edge
  for (const [px, pz] of [[cx - 12, cz - o - Wd - 0.7], [cx + 17, cz + o + Wd + 0.7], [cx + o + Wd + 0.7, cz - 14], [cx - o - Wd - 0.7, cz + 9]]) bag.add(IRON, lathe([[0.001, 0], [0.34, 0], [0.34, 0.014], [0.001, 0.014]], 10, null, px, Z(pz) + 0.0, pz));
}
function block(el, ctx) {
  const { bag, col } = ctx;
  const [cx, cz] = el.c, s = el.s ?? 70, D = el.d ?? 18, ch = el.ch ?? 12, y = el.y ?? 0, rand = rng(el.seed || 1), o = s / 2;
  const W = (x, z) => [cx + x, cz + z];
  const { P8, plots } = blockPlan(el), cut = el.cut, bounds = [[], [], [], []];
  for (const { k, a, b, seed } of plots) {
    const fr = frame(P8[2 * k], P8[2 * k + 1]), pr = rng(seed);
    bounds[k].push(a, b);
    const h = pickH(pr), mat = FACADES[Math.floor(pr() * FACADES.length)];
    const nbp = Math.max(1, Math.round((b - a) / 3.4)), shops = plotShops({ a, b, seed }, nbp, (b - a) / nbp, !!el.shops && fr.axis, [CORNER_CLEAR, 2 * (o - ch) - CORNER_CLEAR]);
    if (shops.length) SHOPS.mass(ctx, fr, a, b, D, y, h, mat, shops, (u) => y + (el.dz ?? 0) * (fr.at(u, 0)[1] - cz));
    else {
      bag.add(mat, fr.F(a, b, -D, 0, y - 1.2, y + h));
      const p = fr.at(a, -D), q = fr.at(b, 0); col.rect([p[0], p[1], q[0], q[1]], y - 1.2, y + h);
    }
    streetFront(bag, fr, a, b, y, h, mat, pr, false, { shops });
    courtFront(bag, fr, a, b, y, h, D, pr);
    roofTop(bag, fr, a, b, y, h, D, seed);
  }
  // the four corner houses, each on its cut corner with a short return on the cross street
  for (let k = 0; k < 4; k++) {
    if (cut && cut.corner === k) continue;
    const sx = k === 0 || k === 1 ? 1 : -1, sz = k === 1 || k === 2 ? 1 : -1;
    const Q = [[sx * (o - ch), sz * o], [sx * o, sz * (o - ch)], [sx * o, sz * (o - D)], [sx * (o - ch), sz * (o - D)]].map(([x, z]) => W(x, z));
    const h = pickH(rand), mat = FACADES[Math.floor(rand() * FACADES.length)], T = [];
    const yb = y - 1.2, yt = y + h, v = (p, yy) => [p[0], yy, p[1]];
    quad(T, v(Q[0], yt), v(Q[1], yt), v(Q[2], yt), v(Q[3], yt)); quad(T, v(Q[3], yb), v(Q[2], yb), v(Q[1], yb), v(Q[0], yb));
    for (let i = 0; i < 4; i++) { const A = Q[i], B = Q[(i + 1) % 4]; quad(T, v(A, yb), v(B, yb), v(B, yt), v(A, yt)); }
    const g = fromTriangles(T), nrm = g.attributes.normal.array, pos = g.attributes.position.array;
    // wind every face outward (the corner's winding depends on its quadrant)
    let mx = 0, mz = 0; for (const p of Q) { mx += p[0] / 4; mz += p[1] / 4; }
    for (let i = 0; i < pos.length; i += 9) {
      const fx = (pos[i] + pos[i + 3] + pos[i + 6]) / 3 - mx, fy = (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3 - (yb + yt) / 2, fz = (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3 - mz;
      if (nrm[i] * fx + nrm[i + 1] * fy + nrm[i + 2] * fz < 0) for (let j = 0; j < 3; j++) { const t = pos[i + 3 + j]; pos[i + 3 + j] = pos[i + 6 + j]; pos[i + 6 + j] = t; for (let m = 0; m < 9; m += 3) nrm[i + m + j] *= -1; }
    }
    bag.add(mat, g);
    const frC = frame(Q[0], Q[1]), ret = frame(Q[1], Q[2]);
    // the chamfer runs from the long side's end to the cross street's start: the frame must have the street outside
    const fc = frC.n[0] * (Q[0][0] - cx) + frC.n[1] * (Q[0][1] - cz) > 0 ? frC : frame(Q[1], Q[0]);
    const fr2 = ret.n[0] * (Q[1][0] - cx) + ret.n[1] * (Q[1][1] - cz) > 0 ? ret : frame(Q[2], Q[1]);
    streetFront(bag, fc, 0, fc.L, y, h, mat, rand, true);
    streetFront(bag, fr2, 0, fr2.L, y, h, mat, rand);
    roofTop(bag, fc, 2, fc.L - 2, y, h, 9, Math.floor(rand() * 1e9) + 1);
    col.segment(fc.at(0, -3), fc.at(fc.L, -3), 6, yb, yt);
    const a = fr2.at(0, -ch), b = fr2.at(fr2.L, 0); col.rect([a[0], a[1], b[0], b[1]], yb, yt);
  }
  court(el, bag, P8, bounds, o - D, rand);
  pavement(el, bag);
}
/**
 * The court's gardens: the plots' party walls carried on from the houses' backs into the court until
 * they meet the walls along its diagonals (the four sides' gardens are triangles meeting in the
 * middle); in each garden a gravel path from the back door, a pergola by the house on some, a round
 * basin or a well at the far end, pots of plants along the walls.
 */
function court(el, bag, P8, bounds, q, rand) {
  const [cx, cz] = el.c, y = el.y ?? 0, dz = el.dz ?? 0, yAt = (z) => y + dz * (z - cz), o = (el.s ?? 70) / 2, ch = el.ch ?? 12, D = el.d ?? 18;
  const wall = (p0, p1, h = 2.1) => { const ya = Math.min(yAt(p0[1]), yAt(p1[1])); bag.add(P, orientedBox(p0, p1, 0.3, ya - 0.5, ya + h)); bag.add(S, orientedBox(p0, p1, 0.42, ya + h, ya + h + 0.1)); };
  // the diagonals, corner to centre (stopping short of the middle where the four meet in a small pier)
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) wall([cx + sx * q, cz + sz * q], [cx + sx * 0.3, cz + sz * 0.3]);
  bag.add(S, box(cx - 0.45, y - 0.5, cz - 0.45, cx + 0.45, yAt(cz) + 2.4, cz + 0.45));
  for (let k = 0; k < 4; k++) {
    const fr = frame(P8[2 * k], P8[2 * k + 1]), xs = (s) => s - (o - ch);          // s along the side → the offset from the side's middle
    const cuts = [...new Set(bounds[k].map((v) => +v.toFixed(2)))].sort((a, b) => a - b);
    // a party wall at each boundary inside the court (not at the corners' ends)
    for (const s of cuts) {
      const x = xs(s), len = q - Math.abs(x) - 0.2; if (len < 0.8 || Math.abs(x) > q - 0.5) continue;
      wall(fr.at(s, -D), fr.at(s, -D - len), 1.95);
    }
    // the gardens between
    for (let i = 0; i + 1 < cuts.length; i++) {
      const s0 = cuts[i], s1 = cuts[i + 1], sc = (s0 + s1) / 2, x = xs(sc), deep = q - Math.abs(x) - 0.6;
      if (deep < 3 || Math.abs(x) > q - 2) continue;
      const pl = Math.max(2, deep - 2.4), A = fr.at(sc, -D), B = fr.at(sc, -D - pl), yy = yAt(A[1]);
      bag.add('pebbles', orientedBox(A, B, 1.1, yy - 0.3, yy + 0.04));
      const end = fr.at(sc, -D - pl - 1.2), ye = yAt(end[1]);
      if (rand() < 0.55) {
        // a round basin with its water, a little jet's spout in the middle
        bag.add(S, lathe([[1.0, -0.3], [1.0, 0.45], [1.1, 0.5], [1.1, 0.58], [0.85, 0.58], [0.85, 0.15], [0.001, 0.15]], 16, null, end[0], ye, end[1]));
        bag.add('water', lathe([[0.86, 0.38], [0.001, 0.38]], 16, null, end[0], ye, end[1]));
        bag.add(S, lathe([[0.12, 0.15], [0.08, 0.6], [0.14, 0.7], [0.001, 0.8]], 8, null, end[0], ye, end[1]));
      } else {
        // a well head with its iron hoop and pulley
        bag.add(S, lathe([[0.7, -0.3], [0.7, 0.8], [0.78, 0.85], [0.78, 0.95], [0.55, 0.95], [0.55, 0.3], [0.001, 0.3]], 14, null, end[0], ye, end[1]));
        const n = [fr.n[0], fr.n[1]], t = [fr.u[0], fr.u[1]];
        for (const sg of [-1, 1]) bag.add(IRON, rod([end[0] + t[0] * sg * 0.62, ye + 0.9, end[1] + t[1] * sg * 0.62], [end[0] + t[0] * sg * 0.3, ye + 2.0, end[1] + t[1] * sg * 0.3], 0.03, 5));
        bag.add(IRON, rod([end[0] - t[0] * 0.32, ye + 2.0, end[1] - t[1] * 0.32], [end[0] + t[0] * 0.32, ye + 2.0, end[1] + t[1] * 0.32], 0.03, 5));
        bag.add(IRON, lathe([[0.13, -0.03], [0.13, 0.03], [0.001, 0.03]], 10).rotateX(Math.PI / 2).rotateY(fr.yaw).translate(end[0], ye + 1.85, end[1])); void n;
      }
      // a pergola by the house: four posts, two beams, the slats
      if (rand() < 0.45 && s1 - s0 > 6 && Math.abs(x) + Math.min(2.4, (s1 - s0) / 2 - 1.2) < q - 4.2) {
        const w = Math.min(2.4, (s1 - s0) / 2 - 1.2), t0 = -D - 0.4, t1 = -D - 3.4, y0 = yAt(fr.at(sc, t0)[1]);
        for (const ss of [sc - w, sc + w]) for (const tt of [t0, t1]) { const p = fr.at(ss, tt); bag.add('timber', box(p[0] - 0.07, y0 - 0.3, p[1] - 0.07, p[0] + 0.07, y0 + 2.5, p[1] + 0.07)); }
        for (const ss of [sc - w, sc + w]) bag.add('timber', orientedBox(fr.at(ss, t0 + 0.2), fr.at(ss, t1 - 0.2), 0.12, y0 + 2.5, y0 + 2.68));
        for (let m = 0; m <= 6; m++) { const tt = t0 - (t0 - t1) * m / 6; bag.add('timber', orientedBox(fr.at(sc - w - 0.25, tt), fr.at(sc + w + 0.25, tt), 0.06, y0 + 2.68, y0 + 2.76)); }
      }
      // pots along the party walls
      for (const ss of [s0 + 0.55, s1 - 0.55]) for (let m = 0; m < 3; m++) {
        if (rand() < 0.4) continue;
        const tt = -D - 1.5 - m * (pl / 3), p = fr.at(ss, tt), yp = yAt(p[1]);
        if (Math.abs(xs(ss)) > q - Math.abs(tt + D) - 0.8) continue;
        bag.add('terracotta', lathe([[0.18, 0], [0.24, 0.1], [0.3, 0.5], [0.33, 0.55], [0.27, 0.55], [0.27, 0.45], [0.001, 0.45]], 10, null, p[0], yp - 0.02, p[1]));
      }
    }
  }
}

// ── The Sagrada Família about 1910 ───────────────────────────────────────────────────────────
/** Turn the triangles of T from index i0 on to face the direction (nx, ny, nz). */
function face(T, i0, nx, ny, nz) {
  for (let i = i0; i < T.length; i += 9) {
    const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    if (cx * nx + cy * ny + cz * nz < 0) for (let k = 0; k < 3; k++) { const t = T[i + 3 + k]; T[i + 3 + k] = T[i + 6 + k]; T[i + 6 + k] = t; }
  }
}
/** A pointed (equilateral) lancet opening in a vertical plane: centre p (x, z), unit across t, facing n, from y0, w wide, h to the springing. */
function lancet(T, p, t, n, y0, w, h, off) {
  const i0 = T.length, P = (u, v) => [p[0] + t[0] * u + n[0] * off, y0 + v, p[1] + t[1] * u + n[1] * off];
  quad(T, P(-w / 2, 0), P(w / 2, 0), P(w / 2, h), P(-w / 2, h));
  const N = 6;
  for (let i = 0; i < N; i++) {
    const f0 = Math.PI - (Math.PI / 3) * i / N, f1 = Math.PI - (Math.PI / 3) * (i + 1) / N;
    T.push(...P(0, h), ...P(w / 2 + w * Math.cos(f0), h + w * Math.sin(f0)), ...P(w / 2 + w * Math.cos(f1), h + w * Math.sin(f1)));
    T.push(...P(0, h), ...P(-w / 2 - w * Math.cos(f0), h + w * Math.sin(f0)), ...P(-w / 2 - w * Math.cos(f1), h + w * Math.sin(f1)));
  }
  face(T, i0, n[0], 0, n[1]);
}
/** A slender stone pinnacle with ribbed, crocketed shaft and a finial of stacked buds (the apse's). */
function pinnacle(bag, x, y, z, s = 1) {
  bag.add(S, lathe([[0.8, 0], [0.8, 1.2], [0.95, 1.4], [0.95, 1.65], [0.62, 1.85], [0.62, 4.4], [0.8, 4.6], [0.8, 4.85], [0.48, 5.05], [0.42, 8.2], [0.24, 9.6], [0.06, 10.4]].map(([r, h]) => [r * s, h * s]), 8,
    (th, i) => (i >= 9 ? 1 + 0.45 * Math.max(0, Math.cos(th * 4)) : 1), x, y, z));
  for (let k = 0; k < 4; k++) bag.add(S, lathe([[0.001, 0], [0.22, 0.12], [0.26, 0.3], [0.14, 0.5], [0.001, 0.62]].map(([r, h]) => [r * s * (1 - k * 0.15), h * s]), 8, null, x, y + s * (10.2 + k * 0.5), z));
}
/** The apse of 1891–1894: seven chapels in a horseshoe round the crypt, each with two lancets and a
 * rose, a crocketed gable over it; buttresses between them carrying pinnacles; the walls open to the
 * sky (the vaults came a century later); the crypt's floor inside. A: the centre, R: the outer radius. */
function apse(bag, col, A, y, R = 16, H = 19, run = 12) {
  const th = 1.4, d = (a) => [Math.cos(a), Math.sin(a)], at = (a, r) => [A[0] + Math.cos(a) * r, A[1] + Math.sin(a) * r];
  const win = [], T = [];
  for (let k = 0; k < 7; k++) {
    const a = Math.PI + Math.PI * (k + 0.5) / 7, dl = Math.PI / 14, p = at(a - dl, R - th / 2), q = at(a + dl, R - th / 2);
    bag.add(S, orientedBox(p, q, th, y - 1.2, y + H)); col.segment(p, q, th, y - 1.2, y + H);
    bag.add('limestone', orientedBox(at(a - dl, R - th / 2 + 0.2), at(a + dl, R - th / 2 + 0.2), th + 0.4, y - 1.3, y + 1.3));
    bag.add(S, orientedBox(at(a - dl, R - th / 2 + 0.3), at(a + dl, R - th / 2 + 0.3), th + 0.6, y + H - 0.55, y + H));
    const n = d(a), t = [-n[1], n[0]], c = at(a, R * Math.cos(dl)), ci = at(a, R * Math.cos(dl) - th);
    for (const u of [-1.15, 1.15]) {
      const pc = [c[0] + t[0] * u, c[1] + t[1] * u], pi = [ci[0] + t[0] * u, ci[1] + t[1] * u];
      lancet(win, pc, t, n, y + 3.2, 1.4, 8.6, 0.03); lancet(win, pi, [-t[0], -t[1]], [-n[0], -n[1]], y + 3.2, 1.4, 8.6, 0.03);
      // the hood mould over each lancet
      for (let i = 0; i < 6; i++) {
        const f = (j) => { const v = j / 6, ang = v * Math.PI / 2; return [pc[0] + t[0] * (-0.95 * Math.cos(ang)) + n[0] * 0.1, y + 3.2 + 8.6 + 1.25 * Math.sin(ang), pc[1] + t[1] * (-0.95 * Math.cos(ang)) + n[1] * 0.1]; };
        const g = (j) => { const v = j / 6, ang = v * Math.PI / 2; return [pc[0] + t[0] * (0.95 * Math.cos(ang)) + n[0] * 0.1, y + 3.2 + 8.6 + 1.25 * Math.sin(ang), pc[1] + t[1] * (0.95 * Math.cos(ang)) + n[1] * 0.1]; };
        bag.add('limestone', rod(f(i), f(i + 1), 0.11, 6)); bag.add('limestone', rod(g(i), g(i + 1), 0.11, 6));
      }
    }
    // the rose over the lancets, inside and out
    for (const [pp, sg] of [[c, 1], [ci, -1]]) {
      const cc = [pp[0] + n[0] * 0.03 * sg, y + 15.4, pp[1] + n[1] * 0.03 * sg], i0 = win.length;
      for (let i = 0; i < 12; i++) {
        const a0 = i / 12 * Math.PI * 2, a1 = (i + 1) / 12 * Math.PI * 2, r = 1.05, Pp = (b) => [cc[0] + t[0] * Math.cos(b) * r, cc[1] + Math.sin(b) * r, cc[2] + t[1] * Math.cos(b) * r];
        win.push(...cc, ...Pp(a0), ...Pp(a1));
      }
      face(win, i0, n[0] * sg, 0, n[1] * sg);
    }
    bag.add('limestone', lathe([[1.25, -0.12], [1.25, 0.12], [1.05, 0.12], [1.05, -0.12]], 16, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(-a + Math.PI / 2).translate(c[0] + n[0] * 0.12, y + 15.4, c[1] + n[1] * 0.12));
    // the gable: a steep stone triangle on the wall's head, crocketed, with a finial
    const gw = 2.7, gh = 6, G = [], V = (u, v, o) => [c[0] + t[0] * u + n[0] * o, y + H + v, c[1] + t[1] * u + n[1] * o];
    for (const o of [-0.35, 0.35]) G.push(...V(-gw, 0, o), ...V(gw, 0, o), ...V(0, gh, o));
    quad(G, V(-gw, 0, -0.35), V(-gw, 0, 0.35), V(0, gh, 0.35), V(0, gh, -0.35)); quad(G, V(gw, 0, 0.35), V(gw, 0, -0.35), V(0, gh, -0.35), V(0, gh, 0.35));
    quad(G, V(-gw, 0, -0.35), V(gw, 0, -0.35), V(gw, 0, 0.35), V(-gw, 0, 0.35));
    T.push(...both(G));
    for (const sg of [-1, 1]) for (let i = 1; i < 6; i++) { const f = i / 6, p3 = V(sg * gw * (1 - f), gh * f + 0.12, 0); bag.add(S, lathe([[0.26, 0], [0.16, 0.36], [0.001, 0.62]], 6, null, p3[0], p3[1], p3[2])); }
    const tip = V(0, gh, 0); pinnacle(bag, tip[0], tip[1] - 0.1, tip[2], 0.32);
  }
  // the buttresses between the chapels and at the horseshoe's ends, stepping back, each with its pinnacle
  for (let j = 0; j <= 7; j++) {
    const a = Math.PI + Math.PI * j / 7;
    bag.add(S, orientedBox(at(a, R - 0.4), at(a, R + 2.3), 1.7, y - 1.2, y + H * 0.5)); col.segment(at(a, R - 0.4), at(a, R + 2.3), 1.7, y - 1.2, y + H);
    bag.add(S, orientedBox(at(a, R - 0.4), at(a, R + 1.5), 1.5, y + H * 0.5, y + H + 1.6));
    bag.add('limestone', orientedBox(at(a, R - 0.5), at(a, R + 2.45), 1.9, y + H * 0.5 - 0.3, y + H * 0.5));
    const pp = at(a, R + 0.55); pinnacle(bag, pp[0], y + H + 1.6, pp[1], 1.05);
  }
  // the presbytery's straight walls running south from the horseshoe, with lancets
  for (const sx of [-1, 1]) {
    const x = A[0] + sx * (R - th / 2), p = [x, A[1]], q = [x, A[1] + run];
    bag.add(S, orientedBox(p, q, th, y - 1.2, y + H)); col.segment(p, q, th, y - 1.2, y + H);
    bag.add(S, orientedBox([x + sx * 0.3, A[1]], [x + sx * 0.3, A[1] + run], th + 0.6, y + H - 0.55, y + H));
    bag.add(S, box(x - 0.85, y - 1.2, A[1] + run - 1.6, x + 0.85, y + H + 1.2, A[1] + run));
    for (const zz of [A[1] + 3.5, A[1] + 8]) { lancet(win, [x + sx * th / 2, zz], [0, sx], [sx, 0], y + 3.2, 1.4, 8.6, 0.03); lancet(win, [x - sx * th / 2, zz], [0, -sx], [-sx, 0], y + 3.2, 1.4, 8.6, 0.03); }
  }
  bag.add(S, fromTriangles(T));
  bag.add('opening', fromTriangles(win));
  // the floor over the crypt, a step up from the site
  const ri = R - th, fl = 'flagstone';
  bag.add(fl, lathe([[ri, 0], [ri, 2.4], [0.001, 2.4]], 28, null, A[0], y - 1.2, A[1]));
  bag.add(fl, box(A[0] - ri, y - 1.2, A[1], A[0] + ri, y + 1.2, A[1] + run - 0.02));
  col.floor([A[0] - ri, A[1] - ri, A[0] + ri, A[1] + run], y + 1.2);
}
/** A guyed timber derrick: the mast, the boom raised toward the work, the guys, the winch. */
function derrick(bag, x, y, z, H, tip) {
  bag.add('timber', rod([x, y - 0.5, z], [x, y + H, z], 0.28, 8));
  bag.add('timber', rod([x, y + 2, z], tip, 0.2, 8));
  bag.add(IRON, rod([x, y + H, z], tip, 0.03, 4));
  bag.add(IRON, rod(tip, [tip[0], y + 4, tip[2]], 0.025, 4));
  bag.add(IRON, box(tip[0] - 0.4, y + 3.2, tip[2] - 0.4, tip[0] + 0.4, y + 4, tip[2] + 0.4));
  for (const [dx, dz] of [[-18, 6], [-10, -18], [14, 10]]) { bag.add(IRON, rod([x, y + H - 0.4, z], [x + dx, y + 0.2, z + dz], 0.025, 4)); bag.add('timber', box(x + dx - 0.25, y - 0.6, z + dz - 0.25, x + dx + 0.25, y + 0.4, z + dz + 0.25)); }
  bag.add('timber', box(x - 1.6, y - 0.4, z + 1, x + 0.2, y + 0.9, z + 2.2));
  bag.add(IRON, rod([x - 1.5, y + 0.7, z + 1.6], [x + 0.1, y + 0.7, z + 1.6], 0.25, 10));
}
/** Gaudí's Schools of 1909: 10 × 20 m, walls of brick in three layers waving in plan, the roof a
 * conoid of tiles waving over a straight central beam. c: the centre; the long side along x. */
function schools(bag, col, lights, cx, cz, y) {
  const L = 20, Wd = 10, A = 0.45, lam = L / 3, Hb = 5.4, Ar = 0.75, N = 48;
  const wz = (x, sg) => cz + sg * (Wd / 2 + A * Math.sin(2 * Math.PI * (x - cx) / lam));
  const roof = (x, f) => y + Hb + Math.abs(f) * Ar * Math.sin(2 * Math.PI * (x - cx) / lam);
  const B = [], R = [], U = [], O = [];
  for (const sg of [-1, 1]) for (let i = 0; i < N; i++) {
    const xa = cx - L / 2 + L * i / N, xb = xa + L / N;
    const oa = [xa, wz(xa, sg)], ob = [xb, wz(xb, sg)], ia = [xa, wz(xa, sg) - sg * 0.32], ib = [xb, wz(xb, sg) - sg * 0.32];
    const ta = roof(xa, sg), tb = roof(xb, sg);
    if (sg > 0) { quad(B, [oa[0], y - 0.8, oa[1]], [ob[0], y - 0.8, ob[1]], [ob[0], tb, ob[1]], [oa[0], ta, oa[1]]); quad(B, [ib[0], y - 0.8, ib[1]], [ia[0], y - 0.8, ia[1]], [ia[0], ta, ia[1]], [ib[0], tb, ib[1]]); }
    else { quad(B, [ob[0], y - 0.8, ob[1]], [oa[0], y - 0.8, oa[1]], [oa[0], ta, oa[1]], [ob[0], tb, ob[1]]); quad(B, [ia[0], y - 0.8, ia[1]], [ib[0], y - 0.8, ib[1]], [ib[0], tb, ib[1]], [ia[0], ta, ia[1]]); }
  }
  // the end walls, straight, each with a door in its middle (1.6 m wide, 2.6 m high)
  for (const sx of [-1, 1]) {
    const x = cx + sx * L / 2, z0 = wz(x, -1), z1 = wz(x, 1), xa = Math.min(x, x - sx * 0.32), xb = Math.max(x, x - sx * 0.32), top = Math.min(roof(x, -1), roof(x, 1)) - 0.01;
    bag.add('brick', box(xa, y - 0.8, z0, xb, top, cz - 0.8)); bag.add('brick', box(xa, y - 0.8, cz + 0.8, xb, top, z1)); bag.add('brick', box(xa, y + 2.6, cz - 0.8, xb, top, cz + 0.8));
    bag.add('wood_painted', box(xa - 0.04, y, cz - 0.9, xb + 0.04, y + 2.62, cz - 0.8)); bag.add('wood_painted', box(xa - 0.04, y, cz + 0.8, xb + 0.04, y + 2.62, cz + 0.9)); bag.add('wood_painted', box(xa - 0.04, y + 2.6, cz - 0.9, xb + 0.04, y + 2.7, cz + 0.9));
    bag.add('wood_dark', box(sx > 0 ? xb - 0.0 : xa - 0.0, y, cz - 0.8, sx > 0 ? xb + 0.05 : xa + 0.05, y + 2.6, cz - 0.3));        // the leaf, open against the jamb
    bag.add('granite_grey', box(Math.min(x, x + sx * 0.7), y - 0.3, cz - 0.9, Math.max(x, x + sx * 0.7), y + 0.1, cz + 0.9));
    col.rect([xa, z0, xb, cz - 0.8], y - 0.8, y + Hb); col.rect([xa, cz + 0.8, xb, z1], y - 0.8, y + Hb);
  }
  // the roof: rulings from the beam to the walls' heads, an overhang of 0.4 m, tiles on brick
  const M = 12;
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const xa = cx - L / 2 - 0.4 + (L + 0.8) * i / N, xb = cx - L / 2 - 0.4 + (L + 0.8) * (i + 1) / N, fa = -1.08 + 2.16 * j / M, fb = -1.08 + 2.16 * (j + 1) / M;
    const zz = (x, f) => cz + f * (Wd / 2 + A * Math.sin(2 * Math.PI * (x - cx) / lam));
    const p = (x, f, d) => [x, roof(x, f) + d, zz(x, f)];
    quad(R, p(xa, fa, 0.14), p(xa, fb, 0.14), p(xb, fb, 0.14), p(xb, fa, 0.14));
    quad(U, p(xa, fa, 0), p(xb, fa, 0), p(xb, fb, 0), p(xa, fb, 0));
    if (j === 0) quad(R, p(xa, fa, 0), p(xa, fa, 0.14), p(xb, fa, 0.14), p(xb, fa, 0));
    if (j === M - 1) quad(R, p(xa, fb, 0.14), p(xa, fb, 0), p(xb, fb, 0), p(xb, fb, 0.14));
  }
  // the windows (on the waves' crests) and the door
  for (const sg of [-1, 1]) for (let k = 0; k < 6; k++) {
    const x = cx - L / 2 + 1.8 + k * (L - 3.6) / 5, z = wz(x, sg) + sg * 0.03, w = 0.6;
    const za = wz(x - w, sg) + sg * 0.03, zb = wz(x + w, sg) + sg * 0.03;
    const i0 = O.length; quad(O, [x - w, y + 1.1, za], [x + w, y + 1.1, zb], [x + w, y + 3.6, zb], [x - w, y + 3.6, za]); face(O, i0, 0, 0, sg); void z;
  }
  bag.add('brick', fromTriangles(both(B))); bag.add('terracotta', fromTriangles(both(R))); bag.add('brick_buff', fromTriangles(both(U))); bag.add('opening', fromTriangles(O));
  // the waving walls collide along their line, the room inside is walkable (the three classrooms: schoolRooms)
  for (const sg of [-1, 1]) for (let i = 0; i < N; i++) { const xa = cx - L / 2 + L * i / N, xb = xa + L / N; col.segment([xa, wz(xa, sg) - sg * 0.16], [xb, wz(xb, sg) - sg * 0.16], 0.4, y - 0.8, y + Hb); }
  schoolRooms({ bag, col, lights }, { cx, cz, y, L, Wd, wz, roofAt: (x) => roof(x, 0), N });
}
/** The workshop: a long timber shed under a lean-to roof of tiles; the stone yard's blocks. */
function workshop(bag, col, lights, [x0, z0, x1, z1], y, rand) {
  // the walls of boards, a wide door in the east wall (the stone yard side) and a second at the south end; inside: Gaudí's workshop (workshopRooms)
  const zm = (z0 + z1) / 2, th = 0.28, hw = 3.6;
  bag.add('planks_grey', box(x0, y - 0.8, z0, x1 - th, y + hw, z0 + th)); bag.add('planks_grey', box(x0, y - 0.8, z1 - th, x1 - th, y + hw, z1)); bag.add('planks_grey', box(x0, y - 0.8, z0, x0 + th, y + hw, z1));
  bag.add('planks_grey', box(x1 - th, y - 0.8, z0, x1, y + hw, zm - 1.3)); bag.add('planks_grey', box(x1 - th, y - 0.8, zm + 1.3, x1, y + hw, z1)); bag.add('planks_grey', box(x1 - th, y + 3.1, zm - 1.3, x1, y + hw, zm + 1.3));
  bag.add('wood_painted', box(x1 - th - 0.02, y, zm - 1.4, x1 + 0.04, y + 3.12, zm - 1.3)); bag.add('wood_painted', box(x1 - th - 0.02, y, zm + 1.3, x1 + 0.04, y + 3.12, zm + 1.4));
  col.rect([x0, z0, x1 - th, z0 + th], y - 0.8, y + 4.6); col.rect([x0, z1 - th, x1 - th, z1], y - 0.8, y + 4.6); col.rect([x0, z0, x0 + th, z1], y - 0.8, y + 4.6);
  col.rect([x1 - th, z0, x1, zm - 1.3], y - 0.8, y + 4.6); col.rect([x1 - th, zm + 1.3, x1, z1], y - 0.8, y + 4.6);
  workshopRooms({ bag, col, lights }, { x0, z0, x1, z1, y, zm, th });
  const T = [], h0 = y + 4.7, h1 = y + 3.7, e = 0.4;
  const v = [[x0 - e, h0, z0 - e], [x1 + e, h1, z0 - e], [x1 + e, h1, z1 + e], [x0 - e, h0, z1 + e]];
  quad(T, v[0], v[3], v[2], v[1]); quad(T, [v[0][0], v[0][1] - 0.12, v[0][2]], [v[1][0], v[1][1] - 0.12, v[1][2]], [v[2][0], v[2][1] - 0.12, v[2][2]], [v[3][0], v[3][1] - 0.12, v[3][2]]);
  bag.add('roof_tile', fromTriangles(both(T)));
  const G = []; for (const z of [z0, z1]) { const s = z === z0 ? -1 : 1; const a = [x0, y + 3.6, z + s * 0.001], b = [x1, y + 3.6, z + s * 0.001], c = [x1, h1 - 0.12, z + s * 0.001], d = [x0, h0 - 0.12, z + s * 0.001]; G.push(...a, ...b, ...c, ...a, ...c, ...d); }
  bag.add('planks_grey', fromTriangles(both(G)));
  for (let z = z0 + 2; z < z1 - 2; z += 4) if (Math.abs(z + 0.8 - zm) > 2.2) bag.add('opening', box(x1, y + 1.2, z, x1 + 0.04, y + 2.6, z + 1.6));
  for (let k = 0; k < 26; k++) {
    const bx = x1 + 3 + rand() * 18, bz = z0 + rand() * (z1 - z0), w = 0.8 + rand() * 1.0, d = 0.6 + rand() * 0.6, hh = 0.5 + rand() * 0.5, st = rand() < 0.3 ? 2 : 1;
    for (let s = 0; s < st; s++) bag.add(s ? 'sandstone' : S, box(bx, y - 0.3 + s * hh, bz, bx + w - s * 0.2, y + hh * (s + 1) - 0.3, bz + d - s * 0.1));
  }
}
/** sagrada: { c, y } — the temple's site about 1910 (docs/settlements/barcelona.md §1). */
function sagrada(el, { bag, col, lights }) {
  const [cx, cz] = el.c, y = el.y ?? 0, rand = rng(1910);
  apse(bag, col, [cx, cz - 16], y);
  nativity(bag, col, cx + 22, y, cz);
  schools(bag, col, lights, cx - 12, cz + 25, y);
  workshop(bag, col, lights, [cx - 33, cz - 8, cx - 27, cz + 14], y, rand);
  derrick(bag, cx + 12, y, cz + 30, 46, [cx + 23, y + 38, cz + 16]);
}

// ── Casa Milà and Casa Batlló ────────────────────────────────────────────────────────────────
/** Chaikin-smooth an open polyline (ends kept), then resample every step metres: [{ p, n, s }]. */
function smoothPath(pts, iter = 3, step = 0.5) {
  let P = pts;
  for (let k = 0; k < iter; k++) { const Q = [P[0]]; for (let i = 0; i + 1 < P.length; i++) { const a = P[i], b = P[i + 1]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } Q.push(P[P.length - 1]); P = Q; }
  const cum = [0]; for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const L = cum[cum.length - 1], n = Math.round(L / step), out = [];
  let j = 0;
  for (let i = 0; i <= n; i++) {
    const s = L * i / n; while (j < P.length - 2 && cum[j + 1] < s) j++;
    const f = (s - cum[j]) / (cum[j + 1] - cum[j] || 1), p = [P[j][0] + (P[j + 1][0] - P[j][0]) * f, P[j][1] + (P[j + 1][1] - P[j][1]) * f];
    out.push({ p, s });
  }
  for (let i = 0; i < out.length; i++) { const a = out[Math.max(0, i - 1)].p, b = out[Math.min(out.length - 1, i + 1)].p, l = Math.hypot(b[0] - a[0], b[1] - a[1]); out[i].n = [(b[1] - a[1]) / l, -(b[0] - a[0]) / l]; }
  return out;
}
/**
 * pedrera: { c (the block's centre), y } — Casa Milà (1906–1912) on its block's north-west corner,
 * the front of Garraf limestone running round the corner in waves: each floor's edge a rounded
 * band of stone swelling and receding, the piers between the windows bending from band to band, the
 * windows dark behind; balconies of twisted wrought iron; the attic's small windows under the
 * undulating crest; on the roof the chimneys and stair exits like helmeted warriors.
 */
function pedrera(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, rand = rng(1906), M = 'limestone';
  const W = (x, z) => [cx + x, cz + z];
  const path = smoothPath([W(-35, -1), W(-35, -23), W(-23, -35), W(-1, -35)], 4, 0.5), Lp = path[path.length - 1].s;
  const Y = [4.6, 7.4, 11.0, 14.3, 17.6, 20.9, 24.2], back = -0.75;
  const off = (s, k) => 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(2 * Math.PI * s / 10.5 + 0.9 * k)) + 0.22 * Math.sin(2 * Math.PI * s / 4.7 + 1.7 * k + 0.4);
  const at = (i, o, yy) => { const { p, n } = path[i]; return [p[0] + n[0] * o, yy, p[1] + n[1] * o]; };
  const T = [], D = [];
  // the body behind the front: a prism over the corner (a fan from the court's corner), dark where the windows are
  const I = W(-17, -17), chain = [W(-17, -1), ...path.map(({ p, n }) => [p[0] + n[0] * back, p[1] + n[1] * back]), W(-1, -17)];
  const yb = y - 1.2, yt = y + 27.0;
  const ring = [...chain, I];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    if (i + 1 < ring.length - 1) { let j = T.length; T.push(I[0], yt, I[1], a[0], yt, a[1], b[0], yt, b[1]); face(T, j, 0, 1, 0); j = T.length; T.push(I[0], yb, I[1], a[0], yb, a[1], b[0], yb, b[1]); face(T, j, 0, -1, 0); }
    const wall = i > 0 && i < chain.length - 2 ? D : T, j = wall.length;
    quad(wall, [a[0], yb, a[1]], [b[0], yb, b[1]], [b[0], yt, b[1]], [a[0], yt, a[1]]);
    face(wall, j, b[1] - a[1], 0, -(b[0] - a[0]));
  }
  col.segment(W(-35, -1), W(-35, -23), 4, yb, yt); col.segment(W(-35, -23), W(-23, -35), 4, yb, yt); col.segment(W(-23, -35), W(-1, -35), 4, yb, yt);
  col.rect([cx - 34, cz - 34, cx - 17, cz - 1], yb, yt); col.rect([cx - 34, cz - 34, cx - 1, cz - 17], yb, yt);
  // the bands, one at each floor's edge
  const B = [], qo = (A, C, E, G, ref) => { const j = B.length; quad(B, A, C, E, G); const m = [(A[0] + E[0]) / 2 - ref[0], (A[1] + E[1]) / 2 - ref[1], (A[2] + E[2]) / 2 - ref[2]]; face(B, j, ...m); };
  for (let k = 0; k < Y.length; k++) {
    const y0 = y + Y[k] - 0.38, y1 = y + Y[k] + 0.52;
    const prof = (s) => { const o = off(s, k); return [[back + 0.02, y0], [o - 0.22, y0], [o - 0.02, y0 + 0.22], [o, y0 + 0.55], [o - 0.12, y1 - 0.08], [o - 0.3, y1], [back + 0.02, y1]]; };
    for (let i = 0; i + 1 < path.length; i++) {
      const A = prof(path[i].s), C = prof(path[i + 1].s);
      const ref = at(i, (back + off(path[i].s, k)) / 2 - 0.1, (y0 + y1) / 2);
      for (let j = 0; j + 1 < A.length; j++) qo(at(i, A[j][0], A[j][1]), at(i + 1, C[j][0], C[j][1]), at(i + 1, C[j + 1][0], C[j + 1][1]), at(i, A[j + 1][0], A[j + 1][1]), ref);
    }
  }
  // the piers between the windows, bending from band to band; the ground floor's heavier
  const piers = []; { let s = 1.2; while (s < Lp - 1) { piers.push(s); s += 3.3 + rand() * 1.3; } }
  for (let k = -1; k < Y.length - 1; k++) {
    const ya = k < 0 ? y - 1.2 : y + Y[k] + 0.52, yb2 = y + Y[k + 1] - 0.38, ko = Math.max(0, k);
    for (const sp0 of piers) {
      const sp = sp0 + 0.35 * Math.sin(k * 1.3 + sp0), hw = (k < 0 ? 1.05 : 0.5) + 0.15 * Math.sin(sp0 * 0.7 + k);
      const i0 = Math.max(0, Math.round((sp - hw) / Lp * (path.length - 1))), i1 = Math.min(path.length - 1, Math.round((sp + hw) / Lp * (path.length - 1)));
      if (i1 <= i0) continue;
      const NV = 5, fo = (i, v) => { const s = path[i].s, u = (s - sp) / hw; return (off(s, ko) * (1 - v) + off(s, Math.min(Y.length - 1, k + 1)) * v) * 0.75 - 0.08 + 0.18 * Math.cos(Math.min(1, Math.abs(u)) * Math.PI / 2) + 0.12 * Math.sin(Math.PI * v); };
      for (let i = i0; i < i1; i++) for (let j = 0; j < NV; j++) {
        const v0 = j / NV, v1 = (j + 1) / NV, Y0 = ya + (yb2 - ya) * v0, Y1 = ya + (yb2 - ya) * v1;
        qo(at(i, fo(i, v0), Y0), at(i + 1, fo(i + 1, v0), Y0), at(i + 1, fo(i + 1, v1), Y1), at(i, fo(i, v1), Y1), at(i, back, (Y0 + Y1) / 2));
      }
      const im = Math.round((i0 + i1) / 2);
      for (const [i, sg] of [[i0, -1], [i1, 1]]) for (let j = 0; j < NV; j++) {
        const v0 = j / NV, v1 = (j + 1) / NV, Y0 = ya + (yb2 - ya) * v0, Y1 = ya + (yb2 - ya) * v1, q = [at(i, back + 0.02, Y0), at(i, fo(i, v0), Y0), at(i, fo(i, v1), Y1), at(i, back + 0.02, Y1)];
        qo(q[0], q[1], q[2], q[3], at(im, back + 0.3, (Y0 + Y1) / 2)); void sg;
      }
    }
    // the wrought-iron balconies on the band below each window: tangles of twisting bars
    if (k >= 0) for (let m = 0; m + 1 < piers.length; m++) {
      if (rand() < 0.3) continue;
      const sa = piers[m] + 0.9, sb = piers[m + 1] - 0.9, yy = y + Y[k] + 0.52; if (sb - sa < 1) continue;
      const ia = Math.round(sa / Lp * (path.length - 1)), ib = Math.round(sb / Lp * (path.length - 1));
      for (let w = 0; w < 6; w++) {
        const ph = rand() * 6.3, lam = 0.9 + rand() * 1.4, amp = 0.25 + rand() * 0.2, mid = 0.25 + w * 0.13;
        let prev = null;
        for (let i = ia; i <= ib; i += 2) {
          const s = path[i].s, hy = yy + Math.max(0.05, Math.min(1.0, mid + amp * Math.sin(2 * Math.PI * (s - sa) / lam + ph))), o = off(s, k) - 0.34 + 0.08 * Math.sin(s * 3 + w);
          const p = at(i, o, hy);
          if (prev) bag.add(IRON, rod(prev, p, 0.028, 4));
          prev = p;
        }
      }
      for (const hy of [yy + 0.03, yy + 1.0]) { let prev = null; for (let i = ia; i <= ib; i += 2) { const p = at(i, off(path[i].s, k) - 0.34, hy); if (prev) bag.add(IRON, rod(prev, p, 0.035, 4)); prev = p; } }
      for (const i of [ia, ib - ((ib - ia) % 2)]) bag.add(IRON, rod(at(i, off(path[i].s, k) - 0.34, yy), at(i, off(path[i].s, k) - 0.34, yy + 1.0), 0.03, 4));
    }
  }
  // the attic under its crest, with small windows; the crest rolling over
  const crest = (s) => y + 27.7 + 0.55 * Math.sin(2 * Math.PI * s / 7.3) + 0.3 * Math.sin(2 * Math.PI * s / 3.1 + 1);
  const ya = y + Y[6] + 0.52;
  for (let i = 0; i + 1 < path.length; i++) {
    const s0 = path[i].s, s1 = path[i + 1].s, o0 = off(s0, 6) * 0.55, o1 = off(s1, 6) * 0.55, c0 = crest(s0), c1 = crest(s1);
    const pr = (o, c) => [[back + 0.02, ya], [o, ya], [o, c - 0.35], [o - 0.15, c - 0.08], [o - 0.45, c], [-1.6, c], [-1.6, y + 27.0]];
    const A = pr(o0, c0), C = pr(o1, c1);
    const ref = at(i, -0.9, (ya + c0) / 2);
    for (let j = 0; j + 1 < A.length; j++) qo(at(i, A[j][0], A[j][1]), at(i + 1, C[j][0], C[j][1]), at(i + 1, C[j + 1][0], C[j + 1][1]), at(i, A[j + 1][0], A[j + 1][1]), ref);
  }
  for (let i = 3; i + 3 < path.length; i += 3) {
    const s = path[i].s, o = off(s, 6) * 0.55 + 0.02, j0 = D.length;
    quad(D, at(i - 1, o, ya + 0.75), at(i + 1, o, ya + 0.75), at(i + 1, o, ya + 1.5), at(i - 1, o, ya + 1.5));
    face(D, j0, path[i].n[0], 0, path[i].n[1]);
  }
  // the ends of the bands and crest against the neighbours
  const fixB = fromTriangles(B); bag.add(M, fixB); bag.add(M, fromTriangles(T)); bag.add('opening', fromTriangles(D));
  // the roof: chimneys and stair exits like helmeted warriors, twisted
  const twist = (k) => (th, i, r, h) => 1 + 0.12 * Math.sin(th * 4 + h * 1.3 + k);
  for (const [x, z, big] of [[-28, -12, 1], [-27, -27, 0], [-12, -28, 1], [-6, -24, 0], [-26, -6, 0], [-20, -22, 0], [-30, -18, 0], [-16, -30, 0], [-22, -29, 0], [-9, -21, 0], [-21, -9, 1]]) {
    const p = W(x, z), s = big ? 1.6 : 1;
    bag.add(big ? 'tile_white' : M, lathe([[0.7, 0], [0.75, 0.6], [0.55, 1.6], [0.6, 2.2], [0.85, 2.45], [0.9, 2.65], [0.5, 2.95], [0.25, 3.3], [0.001, 3.45]].map(([r, h]) => [r * s, h * s]), 10, twist(x + z), p[0], yt, p[1]));
    if (!big) bag.add('opening', box(p[0] - 0.18, yt + 2.2, p[1] - 0.18, p[0] + 0.18, yt + 2.3, p[1] + 0.18));
  }
  bag.add(M, box(cx - 23, yt, cz - 23, cx - 19, yt + 0.9, cz - 19));
}
/**
 * batllo: { a, b (the street front, the street outside), y, d (depth), h (the roof's foot) } — Casa
 * Batlló as Gaudí remade it in 1904–1906: the ground and principal floors in sandstone, the principal
 * floor's bay on bone-like columns under a scalloped lintel; above, the front of broken tiles in blue
 * and green set with ceramic discs, the windows in stone frames behind iron balconies shaped like
 * masks; the roof's arched back of glazed scales with its spine, and the turret with its four-armed cross.
 */
function batllo(el, { bag, col }) {
  const fr = frame(el.a, el.b), F = fr.F, w = fr.L, y = el.y ?? 0, D = el.d ?? 18, h = el.h ?? 24, rand = rng(1904), ST = 'sandstone_dressed';
  const at3 = (s, t, yy) => { const q = fr.at(s, t); return [q[0], yy, q[1]]; };
  bag.add('stucco_pale', F(0, w, -D, -0.02, y - 1.2, y + h)); { const p = fr.at(0, -D), q = fr.at(w, 0); col.rect([p[0], p[1], q[0], q[1]], y - 1.2, y + h); }
  // the mosaic front above the principal floor, waving gently
  const MZ = [], y0 = y + 9.6, y1 = y + h;
  const tw = (s, yy) => 0.06 + 0.05 * Math.sin(2 * Math.PI * s / 3.7 + 0.6) * Math.cos(2 * Math.PI * (yy - y0) / 4.1);
  for (let i = 0; i < 30; i++) for (let j = 0; j < 24; j++) {
    const sa = w * i / 30, sb = w * (i + 1) / 30, ya = y0 + (y1 - y0) * j / 24, yb = y0 + (y1 - y0) * (j + 1) / 24;
    quad(MZ, at3(sa, tw(sa, ya), ya), at3(sb, tw(sb, ya), ya), at3(sb, tw(sb, yb), yb), at3(sa, tw(sa, yb), yb));
  }
  face(MZ, 0, fr.n[0], 0, fr.n[1]);
  bag.add('tile_turquoise', fromTriangles(MZ));
  // the stone lower floors: ground floor piers and openings, the principal floor's bay
  bag.add(ST, F(0, w, -0.02, 0.12, y - 1.2, y + 5.2));
  for (const [a, b] of [[0.9, 3.7], [4.5, 7.0], [8.0, 10.5], [11.3, 14.1]]) bag.add('opening', F(a, b, 0.12, 0.15, y + 0.2, y + 4.3));
  bag.add('wood_dark', F(4.6, 6.9, 0.15, 0.2, y + 0.2, y + 3.2));
  const SC = [];
  const scallop = (s) => { const c = [1.1, 3.4, 5.8, 9.2, 11.6, 13.9], k = c.findIndex((v, i) => s >= v && s <= (c[i + 1] ?? w)); if (k < 0 || k === c.length - 1) return y + 8.75; const f = (s - c[k]) / (c[k + 1] - c[k]); return y + 8.75 + 0.5 * Math.sin(Math.PI * f); };
  for (let i = 0; i < 60; i++) {
    const sa = 0.6 + (w - 1.2) * i / 60, sb = 0.6 + (w - 1.2) * (i + 1) / 60, ta = 1.15 + 0.12 * Math.sin(sa * 1.3), tb = 1.15 + 0.12 * Math.sin(sb * 1.3);
    quad(SC, at3(sa, ta, scallop(sa)), at3(sb, tb, scallop(sb)), at3(sb, tb, y + 9.75), at3(sa, ta, y + 9.75));                  // the lintel's face
    quad(SC, at3(sa, 0, scallop(sa)), at3(sb, 0, scallop(sb)), at3(sb, tb, scallop(sb)), at3(sa, ta, scallop(sa)));             // its scalloped underside
    quad(SC, at3(sa, ta, y + 9.75), at3(sb, tb, y + 9.75), at3(sb, 0, y + 9.75), at3(sa, 0, y + 9.75));
    quad(SC, at3(sa, 0, y + 5.15), at3(sb, 0, y + 5.15), at3(sb, tb + 0.1, y + 5.15), at3(sa, ta + 0.1, y + 5.15));               // the bay's sill
    quad(SC, at3(sa, ta + 0.1, y + 5.15), at3(sb, tb + 0.1, y + 5.15), at3(sb, tb + 0.1, y + 5.6), at3(sa, ta + 0.1, y + 5.6));
    quad(SC, at3(sa, ta + 0.1, y + 5.6), at3(sb, tb + 0.1, y + 5.6), at3(sb, 0, y + 5.6), at3(sa, 0, y + 5.6));
  }
  bag.add(ST, fromTriangles(both(SC)));
  for (const s of [0.6, w - 0.6]) bag.add(ST, F(s - 0.45, s + 0.45, 0, 1.35, y + 5.15, y + 9.75));
  bag.add('glass_outer', F(1.0, w - 1.0, 0.55, 0.6, y + 5.6, y + 9.0));
  for (const s of [1.1, 3.4, 5.8, 9.2, 11.6, 13.9]) {
    const q = fr.at(s, 1.05);
    bag.add(ST, lathe([[0.2, 0], [0.24, 0.25], [0.16, 0.9], [0.2, 1.4], [0.28, 1.6], [0.2, 1.8], [0.15, 2.6], [0.22, 3.0], [0.3, 3.2]], 10, (th, i) => 1 + 0.15 * Math.cos(th * 2 + i), q[0], y + 5.6, q[1]));
  }
  // the windows above, in stone frames, behind the masks; the discs on the mosaic
  const bays = [2.2, 5.8, 9.3, 12.8], floors = [9.9, 13.1, 16.3, 19.5];
  const holes = [];
  for (const [fi, yf] of floors.entries()) for (const [bi, sc] of bays.entries()) {
    const ww = fi === 0 && (bi === 1 || bi === 2) ? 1.6 : 1.2, wh = 2.25;
    bag.add(ST, F(sc - ww / 2 - 0.18, sc + ww / 2 + 0.18, -0.05, 0.22, y + yf + 0.15, y + yf + 0.35));
    bag.add(ST, F(sc - ww / 2 - 0.18, sc + ww / 2 + 0.18, -0.05, 0.22, y + yf + 0.35 + wh, y + yf + 0.6 + wh));
    for (const e of [-1, 1]) bag.add(ST, F(sc + e * (ww / 2 + 0.09) - 0.09, sc + e * (ww / 2 + 0.09) + 0.09, -0.05, 0.22, y + yf + 0.35, y + yf + 0.35 + wh));
    bag.add('opening', F(sc - ww / 2, sc + ww / 2, 0.17, 0.2, y + yf + 0.35, y + yf + 0.35 + wh));
    holes.push([sc - ww / 2 - 0.5, sc + ww / 2 + 0.5, y + yf - 0.1, y + yf + 0.7 + wh]);
    // the mask: a bent plate of iron with two eyes, standing on the window's sill
    const MK = [], NU = 12, NV = 8, mw = ww / 2 + 0.25;
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
      const ua = -1 + 2 * i / NU, ub = -1 + 2 * (i + 1) / NU, va = j / NV, vb = (j + 1) / NV, um = (ua + ub) / 2, vm = (va + vb) / 2;
      if (((Math.abs(um) - 0.45) / 0.2) ** 2 + ((vm - 0.68) / 0.13) ** 2 < 1) continue;
      if (vm > 0.85 && Math.abs(um) < 0.2) continue;
      const P = (u, v) => at3(sc + u * mw, 0.22 + 0.5 * (1 - u * u) * Math.sin(Math.PI * (0.25 + 0.6 * v)), y + yf + 0.35 + v * 1.05 - 0.15 * u * u);
      quad(MK, P(ua, va), P(ub, va), P(ub, vb), P(ua, vb));
    }
    bag.add('steel_grey', fromTriangles(both(MK)));
  }
  const cols = ['glaze_yellow', 'glaze_blue', 'glaze_green', 'glaze_white', 'terracotta', 'tile_lapis'];
  for (let k = 0; k < 160; k++) {
    const s = 0.4 + rand() * (w - 0.8), yy = y0 + 0.3 + rand() * (y1 - y0 - 0.6);
    if (holes.some(([a, b, c, d]) => s > a && s < b && yy > c && yy < d)) continue;
    const r = 0.14 + rand() * 0.14, q = fr.at(s, tw(s, yy) + 0.02);
    const g = disc(r, 0, 10).rotateX(Math.PI / 2).rotateY(fr.yaw).translate(q[0], yy, q[1]);
    bag.add(cols[Math.floor(rand() * cols.length)], g);
  }
  // the roof: an arched back of glazed scales, its spine of round tiles, rising toward the far side
  const RF = [], hump = (s) => 2.2 + 1.6 * Math.sin(Math.PI * Math.min(1, s / (w * 0.85))) + 0.8 * (s / w);
  const sec = (s, f) => { const ph = Math.PI * f; return at3(s, 0.35 - 3.6 * (1 - Math.cos(ph)) / 2, y + h + hump(s) * Math.sin(ph)); };
  const NS = 40, NF = 10;
  for (let i = 0; i < NS; i++) for (let j = 0; j < NF; j++) { const sa = 3.6 + (w - 3.6) * i / NS, sb = 3.6 + (w - 3.6) * (i + 1) / NS; quad(RF, sec(sa, j / NF), sec(sb, j / NF), sec(sb, (j + 1) / NF), sec(sa, (j + 1) / NF)); }
  for (const s of [3.6, w]) for (let j = 0; j < NF; j++) RF.push(...sec(s, j / NF), ...sec(s, (j + 1) / NF), ...at3(s, -1.45, y + h));
  bag.add('glaze_green', fromTriangles(both(RF)));
  const SCALES = ['glaze_green', 'glaze_blue', 'tile_turquoise', 'glaze_green'];
  for (let i = 0; i < 22; i++) for (let j = 1; j < 9; j++) {
    const s = 3.9 + (w - 4.2) * (i + (j % 2) * 0.5) / 22, f = j / 10, p = sec(s, f), n = [p[0] - at3(s, -1.45, y + h)[0], p[1] - (y + h), p[2] - at3(s, -1.45, y + h)[2]], l = Math.hypot(...n);
    const g = lathe([[0.001, 0], [0.2, 0.03], [0.24, 0.08], [0.001, 0.12]], 8);
    const m = new Matrix4().lookAt({ x: n[0] / l, y: n[1] / l, z: n[2] / l }, { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
    g.rotateX(Math.PI / 2).applyMatrix4(m).translate(p[0], p[1], p[2]);
    bag.add(SCALES[(i * 7 + j * 3) % 4], g);
  }
  for (let i = 0; i <= 18; i++) { const s = 3.8 + (w - 4.1) * i / 18, p = sec(s, 0.5); bag.add('glaze_yellow', lathe([[0.001, -0.3], [0.28, -0.22], [0.34, 0], [0.28, 0.22], [0.001, 0.3]], 10, null, p[0], p[1] + 0.12, p[2])); }
  // the turret with the cross, on the near end of the roof
  const tp = fr.at(1.8, -0.9);
  bag.add(ST, lathe([[1.0, 0], [0.95, 3.5], [0.8, 6.2], [0.86, 6.5]], 14, null, tp[0], y + h - 1.5, tp[1]));
  bag.add('mosaic_gold', lathe([[0.86, 0], [1.05, 0.5], [0.95, 1.1], [0.55, 1.6], [0.2, 1.9], [0.12, 2.1]], 14, null, tp[0], y + h + 5.0, tp[1]));
  const ct = [tp[0], y + h + 7.4, tp[1]];
  bag.add('glaze_white', rod([ct[0], ct[1] - 0.4, ct[2]], [ct[0], ct[1] + 0.9, ct[2]], 0.12, 8));
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { bag.add('glaze_white', rod(ct, [ct[0] + dx * 0.6, ct[1], ct[2] + dz * 0.6], 0.1, 8)); bag.add('glaze_white', lathe([[0.001, -0.17], [0.17, 0], [0.001, 0.17]], 8, null, ct[0] + dx * 0.66, ct[1], ct[2] + dz * 0.66)); }
  bag.add('glaze_white', lathe([[0.001, -0.17], [0.17, 0], [0.001, 0.17]], 8, null, ct[0], ct[1] + 0.95, ct[2]));
  // a cornice where the mosaic meets the roof
  bag.add(ST, F(0, w, -0.05, 0.4, y + h - 0.2, y + h + 0.08));
}
registerStyle('modernisme', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, mercat, casa_cafe: (el, ctx) => casaCafe(el, ctx, { frame, streetFront, courtFront, roofTop, rng }), eixample_block: block, sagrada, pedrera, batllo, ...STREET, ...FURNITURE, banc_fanal: bancFanal, works_fence: worksFence },
  objects: {},
});
