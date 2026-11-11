// The Amsterdam canal house about 1670 (docs/settlements/amsterdam.md §5): a narrow brick front of
// three bays over a half-sunk basement; a stone stoop to the door with its fanlight and iron rails;
// cross-windows (kruiskozijnen) with leaded upper lights and shutters on the lower; sandstone sills,
// lintels and keystones; iron wall anchors at the floors; and the gable — stepped (until about 1665),
// neck with sandstone claw pieces (from 1640), bell (from 1660, low in this century) or, for a
// warehouse, a spout gable with loading doors — with the attic hatch and the hoisting beam at its top.

import { box, frustum } from '../../core/geom.js';
import { faceFrame, prism, fbox, outline, ngon, slab4, sideprism } from './facade.js';
import { canalInterior } from './interior.js';

const ST = 'sandstone_dressed';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const sstep = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/** A cross-window: frame bars over the glass, the transom at 62%, the lower lights shuttered (closed or folded open). */
export function crossWindow(bag, F, y, u, v0, ww, hh, o) {
  const A = (m, ...r) => bag.add(m, fbox(F, y, ...r)), u0 = u - ww / 2, u1 = u + ww / 2, vt = v0 + hh * 0.62, b = 0.07;
  A(ST, u0 - 0.1, u1 + 0.1, v0 - 0.14, v0, o.open ? 0 : -0.02, 0.12);           // the sill
  A(ST, u0 - 0.16, u1 + 0.16, v0 + hh, v0 + hh + 0.24, 0, 0.05);              // the lintel
  A(ST, u - 0.13, u + 0.13, v0 + hh - 0.02, v0 + hh + 0.34, 0.05, 0.09);      // its keystone
  if (!o.open) A('opening', u0, u1, v0, v0 + hh, -0.02, 0.04);                  // the glass (a window open to a furnished room shows it)
  A(o.frame, u0, u0 + b, v0, v0 + hh, 0, 0.1); A(o.frame, u1 - b, u1, v0, v0 + hh, 0, 0.1);
  A(o.frame, u0 + b, u1 - b, v0 + hh - b, v0 + hh, 0, 0.1); A(o.frame, u0 + b, u1 - b, v0, v0 + b, 0, 0.1);
  A(o.frame, u - b / 2, u + b / 2, v0 + b, v0 + hh - b, 0, 0.1); A(o.frame, u0 + b, u - b / 2, vt - b / 2, vt + b / 2, 0, 0.1); A(o.frame, u + b / 2, u1 - b, vt - b / 2, vt + b / 2, 0, 0.1);
  // the leading of the upper lights: thin bars in a lattice
  for (const [a, c] of [[u0 + b, u - b / 2], [u + b / 2, u1 - b]]) { const m = (a + c) / 2; A('lead', m - 0.012, m + 0.012, vt + b / 2, v0 + hh - b, 0.04, 0.06); A('lead', a, c, (vt + v0 + hh) / 2 - 0.012, (vt + v0 + hh) / 2 + 0.012, 0.04, 0.06); }
  if (o.shut === 'closed') for (const [a, c] of [[u0 + b, u - b / 2], [u + b / 2, u1 - b]]) { A(o.shutter, a + 0.01, c - 0.01, v0 + b + 0.01, vt - b / 2 - 0.01, 0.04, 0.08); A(o.shutter, (a + c) / 2 - 0.12, (a + c) / 2 + 0.12, (v0 + vt) / 2 - 0.2, (v0 + vt) / 2 + 0.2, 0.08, 0.1); }
  else if (o.shut === 'open') for (const s of [-1, 1]) { const e = s < 0 ? u0 - 0.04 : u1 + 0.04, f = e + s * (ww / 2 - 0.05); A(o.shutter, Math.min(e, f), Math.max(e, f), v0 + 0.02, vt - 0.02, 0.002, 0.043); }
}

/**
 * The stone case of the front door: the plain one (two jambs and a band), or (half of them) the classical one of
 * the period — Tuscan pilasters on their bases with capitals, the entablature with a frieze of carved festoons
 * and a projecting cornice, on some a low segmental pediment (docs §5.9).
 */
function doorCase(bag, F, y, u, d0, dv, dh, r) {
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), Pz = (m, pts, a, b) => bag.add(m, prism(F, y, pts, a, b));
  if (r() < 0.5) { A(ST, u - d0 - 0.2, u - d0, dv, dv + dh + 0.95, 0, 0.14); A(ST, u + d0, u + d0 + 0.2, dv, dv + dh + 0.95, 0, 0.14); A(ST, u - d0 - 0.3, u + d0 + 0.3, dv + dh + 0.95, dv + dh + 1.25, 0, 0.2); return; }
  const vt = dv + dh + 0.95;
  for (const s of [-1, 1]) {
    const a = u + s * (d0 + 0.03), c = u + s * (d0 + 0.27), lo = Math.min(a, c), hi = Math.max(a, c);
    A(ST, u + s * d0 < u ? u - d0 - 0.03 : u + d0, u + s * d0 < u ? u - d0 : u + d0 + 0.03, dv, vt, 0, 0.08);   // the architrave round the opening
    A(ST, lo - 0.03, hi + 0.03, dv, dv + 0.28, 0, 0.19);                                                       // the base
    A(ST, lo, hi, dv + 0.28, vt - 0.14, 0, 0.14);                                                               // the shaft
    A(ST, lo - 0.02, hi + 0.02, vt - 0.14, vt - 0.08, 0, 0.17); A(ST, lo - 0.035, hi + 0.035, vt - 0.08, vt, 0, 0.19);   // the capital
  }
  const ew = d0 + 0.33;
  A(ST, u - ew, u + ew, vt, vt + 0.08, 0, 0.17);                                                                // the architrave
  A(ST, u - ew + 0.02, u + ew - 0.02, vt + 0.08, vt + 0.22, 0, 0.13);                                          // the frieze
  for (let k = 0; k < 6; k++) { const c = u - ew + 0.2 + k * (2 * ew - 0.4) / 5; Pz('sandstone_relief', ngon(c, vt + 0.15, 0.05, 8), 0.13, 0.16); if (k < 5) { const m = c + (2 * ew - 0.4) / 10; Pz('sandstone_relief', [[m - 0.12, vt + 0.17], [m + 0.12, vt + 0.17], [m + 0.06, vt + 0.11], [m - 0.06, vt + 0.11]], 0.13, 0.15); } }
  A(ST, u - ew - 0.06, u + ew + 0.06, vt + 0.22, vt + 0.32, 0, 0.24);                                          // the cornice
  if (r() < 0.45) {
    const R = ew + 0.06, rise = 0.17, rr = (R * R + rise * rise) / (2 * rise), n = 8;
    for (let k = 0; k < n; k++) {
      const t0 = -1 + 2 * k / n, t1 = -1 + 2 * (k + 1) / n, h = (t) => Math.sqrt(Math.max(0, rr * rr - (t * R) ** 2)) - (rr - rise);
      Pz(ST, [[u + t0 * R, vt + 0.32], [u + t1 * R, vt + 0.32], [u + t1 * R, vt + 0.32 + h(t1)], [u + t0 * R, vt + 0.32 + h(t0)]], 0, 0.2);
    }
  }
}
/**
 * gevelsteen: a gable stone — a carved and painted relief in its moulded stone frame, set in the front about 4 m
 * up to name the house before there were numbers (docs §5.9): a ship under sail on the sea, a tree on its
 * ground, a gilt sun, or two crossed keys; a dark band under it for the name and the year.
 */
function gableStone(bag, F, y, u, v, wd, r) {
  const A = (m, ...q) => bag.add(m, fbox(F, y, ...q)), Pz = (m, pts, a, b) => bag.add(m, prism(F, y, pts, a, b));
  const hh = wd * 1.05, u0 = u - wd / 2, u1 = u + wd / 2, fr = 0.055, kind = Math.floor(r() * 4);
  A(ST, u0, u1, v, v + fr, 0, 0.08); A(ST, u0, u1, v + hh - fr, v + hh, 0, 0.08); A(ST, u0, u0 + fr, v + fr, v + hh - fr, 0, 0.08); A(ST, u1 - fr, u1, v + fr, v + hh - fr, 0, 0.08);
  A(ST, u0 - 0.03, u1 + 0.03, v - 0.12, v, 0, 0.09); A('lacquer_black', u0 + 0.04, u1 - 0.04, v - 0.095, v - 0.025, 0.09, 0.095);
  const a0 = u0 + fr, a1 = u1 - fr, b0 = v + fr, b1 = v + hh - fr, W = a1 - a0, Hh = b1 - b0, U = (t) => a0 + t * W, V = (t) => b0 + t * Hh;
  A(kind === 3 ? 'cloth_red' : kind === 2 ? 'paint_blue' : 'stucco_sky', a0, a1, b0, b1, 0, 0.03);
  if (kind === 0) {                       // the ship: the sea, the hull, three masts with their sails, a pennant
    A('paint_blue', a0, a1, b0, V(0.2), 0.03, 0.04);
    Pz('paint_ochre', [[U(0.15), V(0.22)], [U(0.85), V(0.22)], [U(0.95), V(0.38)], [U(0.05), V(0.38)]], 0.03, 0.065);
    Pz('paint_ochre', [[U(0.72), V(0.38)], [U(0.93), V(0.38)], [U(0.93), V(0.46)], [U(0.74), V(0.46)]], 0.03, 0.06);
    for (const [t, top] of [[0.3, 0.85], [0.52, 0.92], [0.75, 0.78]]) { A('wood_dark', U(t) - 0.006, U(t) + 0.006, V(0.38), V(top), 0.04, 0.05); A('paint_white', U(t - 0.1), U(t + 0.1), V(0.48), V(top - 0.1), 0.045, 0.06); }
    Pz('cloth_red', [[U(0.52), V(0.92)], [U(0.66), V(0.89)], [U(0.52), V(0.86)]], 0.045, 0.055);
  } else if (kind === 1) {                // the tree: its ground, the trunk, the round crown in leafy lobes
    A('fresco_green', a0, a1, b0, V(0.18), 0.03, 0.045);
    Pz('wood_dark', [[U(0.45), V(0.18)], [U(0.55), V(0.18)], [U(0.53), V(0.55)], [U(0.47), V(0.55)]], 0.03, 0.06);
    for (const [cu, cv, cr] of [[0.5, 0.68, 0.24], [0.32, 0.6, 0.15], [0.68, 0.6, 0.15], [0.4, 0.8, 0.14], [0.6, 0.8, 0.14]]) Pz('cloth_green', ngon(U(cu), V(cv), cr * W, 10), 0.03, 0.06 + cr * 0.03);
  } else if (kind === 2) {                // the sun: a gilt disc and its rays
    Pz('gold', ngon(U(0.5), V(0.5), W * 0.18, 14), 0.03, 0.07);
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, c = Math.cos(a), s2 = Math.sin(a), e = W * 0.2, f = W * (k & 1 ? 0.36 : 0.42), q = W * 0.035;
      Pz('gold', [[U(0.5) + c * e - s2 * q, V(0.5) + s2 * e + c * q], [U(0.5) + c * e + s2 * q, V(0.5) + s2 * e - c * q], [U(0.5) + c * f, V(0.5) + s2 * f]], 0.03, 0.055); }
  } else {                                // two keys crossed: the bows, the shanks, the bits
    for (const s2 of [-1, 1]) {
      const p = (t) => [U(0.5 + s2 * (0.32 - 0.64 * t)), V(0.15 + 0.7 * t)], q = 0.02;
      const [x0, z0] = p(0), [x1, z1] = p(1), L = Math.hypot(x1 - x0, z1 - z0), nx = -(z1 - z0) / L * q, nz = (x1 - x0) / L * q;
      Pz('gold', [[x0 + nx, z0 + nz], [x0 - nx, z0 - nz], [x1 - nx, z1 - nz], [x1 + nx, z1 + nz]], 0.03, 0.06);
      Pz('gold', ngon(...p(0.98), W * 0.09, 8), 0.03, 0.065);
      const [bx, bz] = p(0.08); Pz('gold', [[bx, bz], [bx + s2 * W * 0.1, bz], [bx + s2 * W * 0.1, bz + W * 0.08], [bx, bz + W * 0.08]], 0.03, 0.06);
    }
  }
}

/** canal_house: { rect (its narrow front on `front`), storeys, seed, y }. */
export function canalHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), y = el.y ?? 0, n = el.storeys ?? 4, f = el.front ?? 's', F = faceFrame(el.rect, f), w = F.w, D = F.D, uc = w / 2;
  const r0 = rand(), mat = r0 < 0.7 ? 'brick' : r0 < 0.85 ? 'brick_baked' : 'brick_buff';
  const A = (m, ...r) => bag.add(m, fbox(F, y, ...r)), Pz = (m, pts, d0, d1) => bag.add(m, prism(F, y, pts, d0, d1));
  const frame = rand() < 0.75 ? 'wood_painted' : 'wood_dark', shutter = ['shutter_green', 'shutter_brown', 'lacquer_red', 'shutter_green'][Math.floor(rand() * 4)];
  const shutMode = () => { const r = rand(); return r < 0.45 ? 'closed' : r < 0.75 ? 'open' : 'none'; };
  const kindR = rand(), kind = el.gable ?? (kindR > 0.9 ? 'spout' : kindR < 0.3 ? 'step' : kindR < 0.65 ? 'neck' : 'bell'), warehouse = kind === 'spout';
  // the storeys: a half-sunk basement under a tall ground floor, then floors a little lower each
  const base = 1.0, g = 3.6, st = 2.95 + rand() * 0.3, H = base + g + (n - 1) * st, floors = [base, ...Array.from({ length: n - 1 }, (_, i) => base + g + i * st)];
  // the back (its own stream of chances, so that the fronts stay as they were): about half the houses have a low
  // annex (aanbouw) in a yard behind the main block, with the privy in the yard's other corner (docs §5.1)
  const rb = rng((el.seed || 1) * 7 + 13), annex = !warehouse && D >= 11 && rb() < 0.55, Dm = annex ? D - 3.4 : D;
  const main = ((r, k) => ({ s: [r[0], r[1] + k, r[2], r[3]], n: [r[0], r[1], r[2], r[3] - k], e: [r[0] + k, r[1], r[2], r[3]], w: [r[0], r[1], r[2] - k, r[3]] })[f])(el.rect, D - Dm);
  const open = !!el.open && !warehouse, hallWins = [];
  if (!open) { bag.add(mat, box(main[0], y - 0.6, main[1], main[2], y + H, main[3])); col.rect(main, y - 0.6, y + H); }
  A(ST, -0.02, w + 0.02, base - 0.16, base, 0, 0.06);                            // the water table over the basement
  A(mat, 0, w, H - 0.5, H, 0, 0.08); A(ST, -0.03, w + 0.03, H - 0.12, H + 0.02, 0, 0.14);  // a brick band and its stone cap at the eaves line
  const bays = w >= 6.4 ? 3 : 2, bw = w / bays, ww = Math.min(1.2, bw - 0.95), door = rand() < 0.5 ? 0 : bays - 1;
  let doorU = null, doorLeaf = 'wood_dark', stoneAt = -1;
  // the ground floor: the door up its stoop, tall windows, basement windows below them
  for (let i = 0; i < bays; i++) {
    const u = (i + 0.5) * bw;
    if (warehouse && i === Math.floor(bays / 2)) {
      for (let k = 0; k < n; k++) { const v0 = k ? floors[k] + 0.25 : 0.2, hh = k ? st - 0.6 : g + base - 0.6; A(ST, u - 0.75, u + 0.75, v0 + hh, v0 + hh + 0.2, 0, 0.05); for (const s of [-1, 1]) { A(shutter === 'lacquer_red' ? 'shutter_brown' : shutter, Math.min(u, u + s * 0.68), Math.max(u, u + s * 0.68), v0, v0 + hh, 0, 0.06); A('iron', Math.min(u + s * 0.12, u + s * 0.5), Math.max(u + s * 0.12, u + s * 0.5), v0 + hh * 0.3, v0 + hh * 0.3 + 0.05, 0.06, 0.08); A('iron', Math.min(u + s * 0.12, u + s * 0.5), Math.max(u + s * 0.12, u + s * 0.5), v0 + hh * 0.75, v0 + hh * 0.75 + 0.05, 0.06, 0.08); } A('wood_dark', u - 0.02, u + 0.02, v0, v0 + hh, 0.06, 0.08); }
      continue;
    }
    if (i === door && !warehouse) {
      const d0 = 0.75, dv = base, dh = 2.45;
      doorCase(bag, F, y, u, d0, dv, dh, rng((el.seed || 1) * 13 + 5));                                                 // the stone door case
      doorU = u;
      A(ST, u - d0, u + d0, dv + dh, dv + dh + 0.1, 0, 0.1);                                                             // the transom over the door
      const leaf = shutter === 'lacquer_red' ? 'wood_dark' : shutter; doorLeaf = leaf;
      if (!open) { A(leaf, u - d0, u, dv, dv + dh, -0.02, 0.05); A(leaf, u, u + d0, dv, dv + dh, -0.02, 0.05); }
      if (!open) for (const s of [-1, 1]) { A('wood_dark', Math.min(u + s * 0.15, u + s * 0.6), Math.max(u + s * 0.15, u + s * 0.6), dv + 0.4, dv + 1.1, 0.05, 0.08); A('wood_dark', Math.min(u + s * 0.15, u + s * 0.6), Math.max(u + s * 0.15, u + s * 0.6), dv + 1.4, dv + 2.15, 0.05, 0.08); }
      if (!open) A('iron', u + 0.12, u + 0.2, dv + 1.15, dv + 1.25, 0.05, 0.11);                                         // the knocker
      A('opening', u - d0, u + d0, dv + dh + 0.1, dv + dh + 0.95, -0.02, 0.04);                                         // the fanlight and its bars
      for (let k = 1; k < 5; k++) { const a = u - d0 + k * 2 * d0 / 5; A('wood_painted', a - 0.025, a + 0.025, dv + dh + 0.1, dv + dh + 0.95, 0, 0.07); }
      if (rand() < 0.35) stoneAt = i;                                                                                  // a gable stone (gevelsteen) by the door
      // the stoop: a stone landing at the door's sill, steps down to the quay, an iron rail each side
      const L = 1.15, steps = 3, rise = base / (steps + 1);
      A(ST, u - 0.95, u + 0.95, -0.6, base - 0.02, 0, L);
      for (let k = 0; k < steps; k++) A(ST, u - 0.8, u + 0.8, -0.6, base - (k + 1) * rise, L + k * 0.3, L + (k + 1) * 0.3);
      for (const s of [-1, 1]) {
        const ue = u + s * 0.9;
        A('iron', ue - 0.025, ue + 0.025, base + 0.85, base + 0.9, 0, L);
        for (const dd of [0.3, 0.7, L - 0.05]) A('iron', ue - 0.015, ue + 0.015, base, base + 0.85, dd - 0.015, dd + 0.015);
      }
      if (open) {                                                                                                     // walkable: the landing, the flight down to the quay
        const p0 = F.at(u - 0.95, 0), p1 = F.at(u + 0.95, L), q0 = F.at(u - 0.8, L), q1 = F.at(u + 0.8, L + steps * 0.3), nr = (a, c) => [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[0], c[0]), Math.max(a[1], c[1])];
        col.floor(nr(p0, p1), y + base - 0.02); col.ramp(nr(q0, q1), y + rise * 0.5, y + base - 0.02, { s: 'n', n: 's', e: 'w', w: 'e' }[f]);
        for (const s of [-1, 1]) { const a = F.at(u + s * 0.88, 0), c = F.at(u + s * 0.95, L); col.rect(nr(a, c), y + base - 0.02, y + base + 0.9); }
      } else { const p0 = F.at(u - 0.95, 0), p1 = F.at(u + 0.95, L + steps * 0.3); col.rect([p0[0], p0[1], p1[0], p1[1]], y - 0.6, y + base * 0.5); }
      continue;
    }
    crossWindow(bag, F, y, u, base + 0.45, ww, 2.55, { frame, shutter, shut: shutMode(), open }); if (open) hallWins.push(u);
    A(ST, u - ww / 2 - 0.08, u + ww / 2 + 0.08, 0.05, 0.12, 0, 0.08);                                                    // the basement window: its sill, glass and bars
    A('opening', u - ww / 2, u + ww / 2, 0.12, base - 0.3, -0.02, 0.04);
    for (let k = 1; k < 5; k++) { const a = u - ww / 2 + k * ww / 5; A('iron', a - 0.015, a + 0.015, 0.12, base - 0.3, 0.04, 0.07); }
  }
  // the upper floors
  for (let s = 1; s < n; s++) for (let i = 0; i < bays; i++) {
    if (warehouse && i === Math.floor(bays / 2)) continue;
    const top = s === n - 1, hh = top ? st - 1.05 : st - 0.85;
    crossWindow(bag, F, y, (i + 0.5) * bw, floors[s] + 0.5, ww * (warehouse ? 0.8 : 1), hh, { frame, shutter, shut: warehouse ? 'closed' : shutMode() });
  }
  // the gable stone in the pier of the first floor beside the door's bay (gable stones stood about 4 m up: docs §5.9)
  if (stoneAt >= 0 && n > 1) { const pu = (stoneAt === 0 ? 1 : stoneAt) * bw; gableStone(bag, F, y, pu, floors[1] + 0.5 + (st - 0.85) * 0.62 + 0.14, Math.min(0.56, bw - ww - 0.36), rng((el.seed || 1) * 31 + 3)); }
  if (open && doorU !== null) canalInterior(bag, col, F, y, { w, Dm, base, g, H, mat, du: doorU, dw: 0.75, dh: 2.45, wins: hallWins, ww, leaf: doorLeaf });
  // iron wall anchors at each floor, holding the front to the beams
  for (let s = 1; s < n; s++) for (const u of [0.32, w - 0.32]) { const v = floors[s] - 0.15; A('iron', u - 0.03, u + 0.03, v - 0.32, v + 0.32, 0, 0.04); A('iron', u - 0.16, u + 0.16, v - 0.03, v + 0.03, 0, 0.05); }

  // ---- the gable and the roof behind it --------------------------------------------------------
  const gh = Math.min(7.5, w * (kind === 'step' ? 1.0 : kind === 'bell' ? 0.82 : 1.05)), rh = gh * 0.88, eave = w / 2 - 0.2;
  const roofHw = (v) => eave - (w / 2 - 0.45) * Math.min(1, v / rh);
  const cover = (v) => roofHw(v) + 0.12;
  const G = H;                                                                                           // the gable stands on the eaves line
  const brick = (pts) => Pz(mat, pts, -0.45, 0), stone = (pts, d1 = 0.06) => Pz(ST, pts, -0.5, d1);
  let crownV = gh, neck = w * 0.2;
  if (kind === 'step') {
    const ns = w > 7.2 ? 5 : 4;
    for (let k = 0; k < ns; k++) {
      const hw = Math.max(cover(k * gh / ns), w / 2 * (1 - k / ns)), a = G + k * gh / ns, b = G + (k + 1) * gh / ns;
      brick([[uc - hw, a], [uc + hw, a], [uc + hw, b], [uc - hw, b]]);
      const hn = k < ns - 1 ? Math.max(cover((k + 1) * gh / ns), w / 2 * (1 - (k + 1) / ns)) : 0;
      // the stone cap of each step's tread (the top step's over its whole width)
      if (k < ns - 1) for (const sg of [-1, 1]) A(ST, sg < 0 ? uc - hw - 0.06 : uc + hn, sg < 0 ? uc - hn : uc + hw + 0.06, b, b + 0.14, -0.5, 0.06);
      else A(ST, uc - hw - 0.06, uc + hw + 0.06, b, b + 0.14, -0.5, 0.06);
      if (k < ns - 1) for (const sg of [-1, 1]) { const u = uc + sg * (hw - 0.15); bag.add(ST, prism(F, y, ngon(u, b + 0.34, 0.13, 8), -0.3, -0.04)); A(ST, u - 0.05, u + 0.05, b + 0.14, b + 0.22, -0.22, -0.12); }
    }
    crownV = gh + 0.14; neck = w / 2 / ns;
    A(ST, uc - 0.2, uc + 0.2, G + crownV, G + crownV + 0.35, -0.35, -0.05); bag.add(ST, prism(F, y, ngon(uc, G + crownV + 0.55, 0.2, 8), -0.4, 0));
  } else if (kind === 'neck') {
    neck = w * 0.21;
    const v1 = gh * 0.14, v2 = Math.min(gh * 0.78, rh * (eave - (neck - 0.06)) / (w / 2 - 0.45)), ow = w / 2 - 0.08;
    brick([[uc - ow, G], [uc + ow, G], [uc + ow, G + v1], [uc - ow, G + v1]]);
    const claw = (v) => neck + (ow - neck) * Math.sqrt(Math.max(0, 1 - ((v - v1) / (v2 - v1)) ** 2));
    for (const q of outline(uc, () => neck, G + v1, G + gh, 1)) brick(q);
    for (const s of [-1, 1]) for (let i = 0; i < 8; i++) {                                               // the claw pieces in sandstone
      const a = v1 + (v2 - v1) * i / 8, b = v1 + (v2 - v1) * (i + 1) / 8;
      stone(s < 0 ? [[uc - claw(a), G + a], [uc - neck, G + a], [uc - neck, G + b], [uc - claw(b), G + b]] : [[uc + neck, G + a], [uc + claw(a), G + a], [uc + claw(b), G + b], [uc + neck, G + b]], 0.04);
    }
    // the claw's carving: a rolled moulding along its curve, a leaf ridge down its middle
    for (const s of [-1, 1]) for (let i = 0; i < 8; i++) {
      const a = v1 + (v2 - v1) * i / 8, b = v1 + (v2 - v1) * (i + 1) / 8, ca = claw(a), cb = claw(b), ma = (ca + neck) / 2, mb = (cb + neck) / 2;
      stone(s < 0 ? [[uc - ca, G + a], [uc - ca + 0.12, G + a], [uc - cb + 0.12, G + b], [uc - cb, G + b]] : [[uc + ca - 0.12, G + a], [uc + ca, G + a], [uc + cb, G + b], [uc + cb - 0.12, G + b]], 0.1);
      if (i > 0) Pz('sandstone_relief', s < 0 ? [[uc - ma - 0.05, G + a], [uc - ma + 0.05, G + a], [uc - mb + 0.05, G + b], [uc - mb - 0.05, G + b]] : [[uc + ma - 0.05, G + a], [uc + ma + 0.05, G + a], [uc + mb + 0.05, G + b], [uc + mb - 0.05, G + b]], 0.04, 0.08);
    }
    for (const s of [-1, 1]) { bag.add(ST, prism(F, y, ngon(uc + s * (ow - 0.32), G + v1 + 0.32, 0.26, 10), 0.04, 0.12)); bag.add(mat, prism(F, y, ngon(uc + s * (ow - 0.32), G + v1 + 0.32, 0.1, 8), 0.12, 0.15)); }
    for (const s of [-1, 1]) A(ST, s < 0 ? uc - neck - 0.08 : uc + neck, s < 0 ? uc - neck : uc + neck + 0.08, G + v2 - 0.05, G + gh, -0.5, 0.06);   // the neck's stone edges
    A(ST, uc - neck - 0.2, uc + neck + 0.2, G + gh, G + gh + 0.18, -0.5, 0.12);                                        // the cornice and the pediment over the neck
    stone([[uc - neck - 0.1, G + gh + 0.18], [uc + neck + 0.1, G + gh + 0.18], [uc, G + gh + 0.18 + neck * 0.45]], 0.08);
    crownV = gh + 0.18 + neck * 0.45;
    // a festoon of fruit hanging either side of the attic window, in relief
    for (const s of [-1, 1]) { const u = uc + s * (neck - 0.28); A('sandstone_relief', u - 0.09, u + 0.09, G + gh * 0.38, G + gh * 0.62, 0, 0.06); bag.add('sandstone_relief', prism(F, y, ngon(u, G + gh * 0.36, 0.13, 8), 0, 0.08)); }
  } else if (kind === 'bell') {
    neck = w * 0.2;
    const hw = (v) => Math.max(cover(v - G), w / 2 * (0.3 + 0.66 * (1 - sstep(0.0, 1.0, (v - G) / gh))));
    for (const q of outline(uc, hw, G, G + gh, 12)) brick(q);
    for (const q of outline(uc, hw, G, G + gh, 12, 0.09)) stone(q, 0.05);
    A(ST, uc - hw(G + gh) - 0.12, uc + hw(G + gh) + 0.12, G + gh, G + gh + 0.16, -0.5, 0.1);
    const cr = hw(G + gh) + 0.05, ch = Math.min(0.9, cr * 0.85);                                                               // the crowning arch of the bell
    for (const q of outline(uc, (v) => Math.max(0.05, cr * Math.sqrt(Math.max(0, 1 - ((v - G - gh - 0.16) / ch) ** 2))), G + gh + 0.16, G + gh + 0.16 + ch * 0.98, 6)) stone(q, 0.04);
    crownV = gh + 0.16 + ch;
  } else {
    // the spout gable of a warehouse: a plain triangle with a stone-capped spout at the top
    const hw = (v) => Math.max(0.55, cover(v - G) + 0.05);
    for (const q of outline(uc, hw, G, G + gh, 6)) brick(q);
    for (const q of outline(uc, hw, G, G + gh, 6, 0.08)) stone(q, 0.05);
    A(ST, uc - 0.7, uc + 0.7, G + gh, G + gh + 0.2, -0.5, 0.1);
    crownV = gh + 0.2;
  }
  // the attic: a window low in the gable, the loading hatch above it, the hoisting beam and its hook at the top
  if (kind !== 'spout') crossWindow(bag, F, y, uc, G + 0.4, Math.min(1.0, neck * 2 - 0.5 > 0.7 ? 1.0 : 0.8), Math.min(1.7, gh * 0.3), { frame, shutter, shut: 'none' });
  { const hv = G + gh * (kind === 'spout' ? 0.15 : 0.5), hh = Math.min(1.5, gh * 0.28), hwid = Math.min(0.55, neck - 0.15); A(ST, uc - hwid - 0.1, uc + hwid + 0.1, hv + hh, hv + hh + 0.16, 0, 0.06);
    for (const s of [-1, 1]) A(shutter === 'lacquer_red' ? 'shutter_brown' : shutter, Math.min(uc, uc + s * hwid), Math.max(uc, uc + s * hwid), hv, hv + hh, 0, 0.06); A('wood_dark', uc - 0.02, uc + 0.02, hv, hv + hh, 0.06, 0.08); }
  { const bv = G + Math.min(gh - 0.35, crownV - 0.6); A('timber', uc - 0.09, uc + 0.09, bv - 0.18, bv, -0.4, 1.15); A('timber', uc - 0.12, uc + 0.12, bv - 0.24, bv + 0.06, 1.05, 1.2);
    A('iron', uc - 0.015, uc + 0.015, bv - 0.62, bv - 0.24, 1.1, 1.13); bag.add('iron', prism(F, y, ngon(uc, bv - 0.7, 0.08, 6), 1.09, 1.14)); }
  // the roof, running back from the gable, and a plain brick gable at the back
  { const [x0, z0, x1, z1] = main, along = f === 'n' || f === 's', wood = rb() < 0.3;
    bag.add('roof_tile', frustum([x0 + 0.2, z0 + 0.2, x1 - 0.2, z1 - 0.2], y + H, y + H + rh, along ? w / 2 - 0.25 : 0, along ? w / 2 - 0.25 : 0, along ? 0 : w / 2 - 0.25, along ? 0 : w / 2 - 0.25));
    // the back gable: brick, or (in some) boarded in timber above a brick course, with its attic window and loading hatch
    for (const [i, q] of outline(uc, (v) => Math.max(0.3, cover(v - G)), G, G + rh + 0.15, 4).entries()) Pz(wood && i > 0 ? 'tar_wood' : mat, q, -Dm, -Dm + 0.45);
    if (wood) for (const du of [-0.6, 0.6]) Pz('planks_grey', [[uc + du - 0.05, G + rh * 0.27], [uc + du + 0.05, G + rh * 0.27], [uc + du + 0.05, G + rh * 0.75], [uc + du - 0.05, G + rh * 0.75]], -Dm - 0.04, -Dm + 0.1);
    for (const q of outline(uc, (v) => Math.max(0.3, cover(v - G)), G, G + rh + 0.15, 4, 0.06)) Pz(wood ? 'wood_dark' : ST, q, -Dm - 0.04, -Dm + 0.5);
    { const ga = G + 0.35, gb = G + Math.min(1.5, rh * 0.32); A(frame, uc - 0.42, uc + 0.42, ga, gb, -Dm - 0.05, -Dm + 0.02); A('opening', uc - 0.34, uc + 0.34, ga + 0.08, gb - 0.08, -Dm - 0.08, -Dm - 0.05);
      const hv = G + rh * 0.5, hh = Math.min(1.1, rh * 0.22); if (rh > 4.2) A(shutter === 'lacquer_red' ? 'shutter_brown' : shutter, uc - 0.4, uc + 0.4, hv, hv + hh, -Dm - 0.06, -Dm + 0.02); }
    // a chimney on the party wall, behind the gable, soot round its mouth
    { const cu = rand() < 0.5 ? 0.35 : w - 0.35, cd = -Dm * 0.45; A(mat, cu - 0.3, cu + 0.3, H - 0.2, H + rh * 0.55 + 1.3, cd - 0.45, cd + 0.45); A('cloth_black', cu - 0.305, cu + 0.305, H + rh * 0.55 + 0.9, H + rh * 0.55 + 1.3, cd - 0.455, cd + 0.455); A(ST, cu - 0.38, cu + 0.38, H + rh * 0.55 + 1.3, H + rh * 0.55 + 1.45, cd - 0.53, cd + 0.53); }
  }
  // ---- the back: a window a bay on each floor in its frame, under a brick relieving arch; some houses with cross-windows
  // in the back rooms of the first floor; the door to the yard; the annex with its lean-to roof, the privy, the yard wall
  const opp = { n: 's', s: 'n', e: 'w', w: 'e' }[f], Fb = faceFrame(main, opp), B = (m, ...r) => bag.add(m, fbox(Fb, y, ...r)), Bp = (m, pts, d0, d1) => bag.add(m, prism(Fb, y, pts, d0, d1));
  const crossBack = rb() < 0.3, aw = Math.round(w * 0.55 * 10) / 10, side = rb() < 0.5, au = (u) => (side ? u : w - u);       // the annex on the left or the right as one faces the back
  const arch = (u, hw, v) => { const r = (hw + 0.1) / Math.SQRT1_2; for (let i = 0; i < 3; i++) { const t0 = Math.PI * (0.25 + i / 6), t1 = Math.PI * (0.25 + (i + 1) / 6), c = (t, k) => [u - Math.cos(t) * r * k, v - r * 0.7 + Math.sin(t) * r * k]; Bp('brick_baked', [c(t0, 1), c(t1, 1), c(t1, 1.22), c(t0, 1.22)], 0, 0.03); } };
  const casement = (u, v0, hw, hh, shut) => {
    B(frame, u - hw, u + hw, v0, v0 + hh, -0.04, 0.04); B('opening', u - hw + 0.08, u + hw - 0.08, v0 + 0.08, v0 + hh - 0.08, 0.04, 0.06);
    B(frame, u - hw + 0.06, u + hw - 0.06, v0 + hh * 0.64 - 0.04, v0 + hh * 0.64 + 0.04, 0.06, 0.09);                  // the transom
    if (shut) B(shutter === 'lacquer_red' ? 'shutter_brown' : shutter, u - hw + 0.09, u + hw - 0.09, v0 + 0.09, v0 + hh * 0.64 - 0.05, 0.06, 0.1);
    B('brick_baked', u - hw - 0.06, u + hw + 0.06, v0 - 0.1, v0, -0.02, 0.1);                                               // the sill, a brick on edge
    arch(u, hw, v0 + hh + 0.04);
  };
  const bayU = [0.25 * w, 0.75 * w];
  for (let s = 0; s < n; s++) for (const u of bayU) {
    const inAnnex = annex && s === 0 && (side ? u < aw + 0.3 : u > w - aw - 0.3);
    if (inAnnex) continue;
    if (s === 0) {                                                                                                         // the yard door, a kitchen window
      if (u === (side ? bayU[1] : bayU[0]) || !annex && u === bayU[1]) { B(frame, u - 0.55, u + 0.55, -0.02, 2.3, -0.04, 0.04); B('wood_dark', u - 0.45, u + 0.45, 0.0, 2.2, 0.04, 0.08); arch(u, 0.55, 2.34); }
      else casement(u, 0.9, 0.5, 1.6, rb() < 0.5);
      continue;
    }
    const top = s === n - 1, v0 = floors[s] + 0.55, hh = top ? st - 1.25 : st - 1.0;
    if (crossBack && s === 1) { crossWindow(bag, Fb, y, u, v0, Math.min(1.15, w / 2 - 1.1), hh, { frame, shutter, shut: rb() < 0.5 ? 'open' : 'none' }); continue; }
    casement(u, v0, Math.min(0.55, w / 4 - 0.55), hh, rb() < 0.35);
  }
  for (let s = 1; s < n; s++) for (const u of [0.32, w - 0.32]) { const v = floors[s] - 0.15; B('iron', u - 0.16, u + 0.16, v - 0.03, v + 0.03, 0, 0.05); }   // the anchors
  if (annex) {
    const ua = side ? 0 : w - aw, ub = side ? aw : w, dd = D - Dm, wh = 3.0, rt = 3.75;
    const P3 = (u, d, v) => { const [x, z] = Fb.at(u, d); return [x, y + v, z]; };
    B(mat, ua, ub, -0.6, wh, -0.05, dd);
    for (const u of [ua, ub - 0.25]) bag.add(mat, sideprism(Fb, y, [[-0.05, wh - 0.02], [dd, wh - 0.02], [-0.05, rt - 0.05]], u, u + 0.25));
    const ra = ua > 0.01 ? ua - 0.12 : ua, rb2 = ub < w - 0.01 ? ub + 0.12 : ub;                                         // no overhang over the neighbour's plot
    bag.add('roof_tile', slab4([P3(ra, -0.05, rt), P3(rb2, -0.05, rt), P3(rb2, dd + 0.25, wh - 0.05), P3(ra, dd + 0.25, wh - 0.05)], 0.12));
    B(ST, ua, ub, wh - 0.18, wh - 0.02, dd - 0.02, dd + 0.06);
    // its back face: a window and the door out to the lane
    const Fa = { at: (u, d) => Fb.at(u, dd + d), w, D }, Aa = (m, ...r) => bag.add(m, fbox(Fa, y, ...r)), mu = (ua + ub) / 2;
    Aa(frame, mu - 0.5, mu + 0.5, 0.9, 2.3, -0.04, 0.04); Aa('opening', mu - 0.42, mu + 0.42, 0.98, 2.22, 0.04, 0.06); Aa(frame, mu - 0.44, mu + 0.44, 1.75, 1.82, 0.06, 0.09); Aa('brick_baked', mu - 0.56, mu + 0.56, 0.8, 0.9, -0.02, 0.1);
    { const p = Fb.at(ua, -0.05), q = Fb.at(ub, dd); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y - 0.6, y + rt); }
    // the yard wall closing the rest of the plot, the privy (secreet) against it in the far corner
    const ya = side ? aw : 0, yb = side ? w : w - aw;
    B(mat, ya, yb, -0.6, 2.1, dd - 0.23, dd); B(ST, ya > 0.01 ? ya - 0.02 : ya, yb < w - 0.01 ? yb + 0.02 : yb, 2.1, 2.2, dd - 0.27, dd + 0.04);
    { const p = Fb.at(ya, dd - 0.23), q = Fb.at(yb, dd); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y - 0.6, y + 2.2); }
    const pw = Math.min(1.15, yb - ya - 0.5), pa = side ? yb - 0.15 - pw : ya + 0.15, pb = pa + pw, d0 = dd - 1.45;
    B('planks_grey', pa, pb, -0.05, 2.0, d0, dd - 0.18);
    bag.add('tar_wood', slab4([P3(pa - 0.08, d0 - 0.18, 2.12), P3(pb + 0.08, d0 - 0.18, 2.12), P3(pb + 0.08, dd - 0.15, 2.32), P3(pa - 0.08, dd - 0.15, 2.32)], 0.06));
    B('wood_dark', pa + 0.14, pb - 0.14, 0.02, 1.85, d0 - 0.04, d0); B('iron', pb - 0.3, pb - 0.24, 0.95, 1.05, d0 - 0.07, d0 - 0.04);
    { const p = Fb.at(pa, d0), q = Fb.at(pb, dd - 0.18); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y - 0.05, y + 2.3); }
  }
}
