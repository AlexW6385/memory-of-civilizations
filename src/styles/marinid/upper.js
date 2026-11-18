// The upper floor of the enterable houses of Fez (docs/settlements/fez.md §15): a tiled stair of two flights in a stair cell beside the court
// (the first up to the gallery, the second on to the roof), a gallery along the court's back with a turned-cedar balustrade, long narrow rooms
// behind tall doors (the street room with its window and a balcony on corbels, the room over the court's side, the rooms of the back range),
// furnished by use (merchant's house, craftsman's, tenement, shop with dwelling), and the roof terrace of the women with its parapets.
// Everything is drawn in the house's own frame (u along the front, d inward; the stair on the low-u side: `mir` flips a house where it is on the other)
// and collected into one geometry per material per house (they take the tile's own meshes in: no draw of their own).
import { box, frustum, lathe, rod } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import * as F from '../mughal/furnish.js';
import { houseLamp } from './front.js';

const PW = 0.25, GW = 1.1, NS = 18, NS2 = 18, RUN1 = 4.08, RUN2 = 4.08;

/** The stair cell of a plan (planOf): where it can stand, or null. u' is the frame with the stair on the low side. */
export function stairOf(P) {
  const { Lw, Dp, t, Dc0, Dc1, ud, cu0, cu1, cd } = P;
  const mir = ud < Lw / 2, cuL = mir ? Lw - cu1 : cu0, cuR = mir ? Lw - cu0 : cu1, S0 = cuL - 2.35, f = Dc1 - 1.0 - RUN1;
  if (S0 < t || f < Dc0 + 0.15 || Dp - t - Dc1 < 3.0 || cd < 5.2) return null;
  return { mir, cuL, cuR, S0, f, dHi: Dc1 - RUN2 };
}

/** The rooms of the upper floor in the u', d frame ([u0, u1, d0, d1]); doors and windows with them. */
export function upLayout(P) {
  const { Lw, Dp, t, Dc0, Dc1, stair: s, ud } = P, X0 = t, X1 = Lw - t, L = { X0, X1, s };
  L.court = [s.cuL, s.cuR, Dc0, Dc1];
  L.fr = [X0, X1, t, Dc0 - 0.3];
  L.corr = [X0, X1, Dc1, Dc1 + GW];
  L.east = [s.cuR + 0.3, X1, Dc0, Dc1 - PW];
  L.wing = s.S0 - 0.3 - X0 >= 1.9 ? [X0, s.S0 - 0.3, Dc0, Dc1 - PW] : null;
  L.shaftA = [s.S0 + 1.05, s.S0 + 2.0, s.f + 1.0, Dc1];
  L.shaftB = [s.S0, s.S0 + 0.95, s.dHi, Dc1];
  const d0 = Dc1 + GW + PW, d1 = Dp - t, len = X1 - X0, nb = Math.max(1, Math.min(5, Math.round(len / 4.8))), w = (len - (nb - 1) * PW) / nb;
  L.back = [];
  for (let i = 0; i < nb; i++) L.back.push([X0 + i * (w + PW), X0 + i * (w + PW) + w, d0, d1]);
  // doors: through the partitions from the corridor; the street room is reached through the east room
  L.doors = [];
  const door = (u0, d0_, d1_, kind) => L.doors.push({ r: [u0, u0 + 0.95, d0_, d1_], kind });
  L.back.forEach((b) => door(b[0] + 0.5, Dc1 + GW - 0.01, d0 + 0.01, 'back'));
  door(X1 - 1.4, Dc1 - PW - 0.01, Dc1 + 0.01, 'east');
  if (L.wing) door(L.wing[0] + 0.45, Dc1 - PW - 0.01, Dc1 + 0.01, 'wing');
  door(X1 - 1.4, Dc0 - 0.3 - 0.01, Dc0 + 0.01, 'fr');
  // windows: [rect, sill, head]
  L.wins = [];
  const win = (r, sill = 0.95, head = 2.25, k = 'win') => L.wins.push({ r, sill, head, kind: k });
  const nw = Math.max(2, Math.floor(len / 3.4));
  L.frWins = [];
  for (let i = 0; i < nw; i++) L.frWins.push(X0 + (i + 0.5) * len / nw);
  const bi = L.frWins.reduce((bst, u, i) => (Math.abs(u - Lw / 2) < Math.abs(L.frWins[bst] - Lw / 2) ? i : bst), 0);
  L.balcony = L.frWins[bi];                                     // the window nearest the middle is the balcony's door
  L.frWins.forEach((u, i) => { if (i !== bi) win([u - 0.45, u + 0.45, 0 - 0.01, t + 0.01], 0.9, 2.3, 'street'); });
  const cw = (L.court[1] - L.court[0]);
  win([Math.max(s.cuL + 0.5, s.cuL + cw * 0.3 - 0.4), Math.max(s.cuL + 0.5, s.cuL + cw * 0.3 - 0.4) + 0.8, Dc0 - 0.31, Dc0 + 0.01], 0.9, 2.2, 'court');
  win([Math.min(s.cuR - 1.3, s.cuL + cw * 0.7 - 0.4), Math.min(s.cuR - 1.3, s.cuL + cw * 0.7 - 0.4) + 0.8, Dc0 - 0.31, Dc0 + 0.01], 0.9, 2.2, 'court');
  const dm = (Dc0 + Dc1) / 2;
  win([s.cuR - 0.01, s.cuR + 0.31, dm - 0.5, dm + 0.5], 0.9, 2.25, 'court');
  L.back.forEach((b) => win([b[0] + 2.0, b[0] + 2.9, Dc1 + GW - 0.01, d0 + 0.01], 0.9, 2.2, 'corr'));
  void ud;
  return L;
}

/** Collects pieces per material and adds each material's pieces as one geometry (no instanced shapes, no loose small meshes). */
// (the plan's houses carry no reed mat, hide, linen, lacquer or flame of their own: the furnishings take the ones they have)
const SWAP = { reed_mat: 'sacking', hide_brown: 'hide_tan', linen: 'cloth_white', lacquer_black: 'iron', gilt_bronze: 'bronze', lamp_glass: 'bronze', lattice: 'cedar', lime_plaster: 'plaster_white', limestone: 'sandstone', limewash_white: 'plaster_white', shutter_brown: 'wood_painted', shutter_green: 'wood_painted', tile_cream: 'tile_green', tile_turquoise: 'tile_lapis' };
function collector() {
  const acc = new Map();
  return {
    add(mat, g) { if (!g) return; if (!mat) throw new Error('no material'); if (mat === 'flame') return; mat = SWAP[mat] ?? mat; if (!acc.has(mat)) acc.set(mat, []); acc.get(mat).push(g.index ? g.toNonIndexed() : g); },
    flush(bag) {
      for (const [mat, all] of acc) {
        const list = all;
        let n = 0; for (const g of list) n += g.attributes.position.array.length;
        const pos = new Float32Array(n), nor = new Float32Array(n); let o = 0;
        for (const g of list) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
        const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
        bag.add(mat, g);
      }
    },
  };
}
/** A brazier of brass: the round pan on its low foot, a rim, the coals (a plain eight-sided lathe: the room's few small pieces stay cheap). */
const brazier = (bag, x, y, z, r = 0.2) => bag.add('bronze', lathe([[0.04, 0.0], [r * 0.6, 0.12], [r, 0.22], [r * 1.1, 0.26], [r * 0.9, 0.25], [r * 0.5, 0.2]], 8, null, x, y, z));
const noTop = (x0, y0, z0, x1, y1, z1) => frustum([x0, z0, x1, z1], y0, y1, 0, 0, 0, 0, { noTop: true });
const hash = (...a) => { let h = 2166136261; for (const v of a) { h ^= Math.round(v * 1000) | 0; h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };

/**
 * The upper floor and the roof of an enterable house. env: { bag, col, lights, mat, fr, el, P (planOf), y, yT, FLOOR, court (world rect) }.
 * Adds the ground storey's stair (treads, ramp) too: `ground` is the list of voids the ground storey must leave (see groundVoids).
 */
export function groundVoids(P, R) {
  const s = P.stair, { Dc1 } = P;
  return [R(s.S0, s.S0 + 2.0, s.f, s.f + 1.0), R(s.S0 + 2.0 - 0.01, s.cuL + 0.01, s.f + 0.05, s.f + 0.95), R(s.S0 + 1.05, s.S0 + 2.0, s.f + 1.0, Dc1)];
}

export function buildUpper(env) {
  const { bag: real, col, lights, mat, fr, el, P, y, yT, FLOOR, court } = env;
  const bag = collector(), L = P.upL, s = P.stair, { Lw, Dp, t, Dc0, Dc1 } = P, mir = s.mir;
  const U = (u) => (mir ? Lw - u : u);
  const R = (u0, u1, d0, d1) => fr.rect(U(u0), U(u1), -d1, -d0);
  const B = (u0, u1, y0, y1, d0, d1) => { const r = R(u0, u1, d0, d1); return box(r[0], y0, r[1], r[2], y1, r[3]); };
  const BN = (u0, u1, y0, y1, d0, d1) => { const r = R(u0, u1, d0, d1); return noTop(r[0], y0, r[1], r[2], y1, r[3]); };
  const Pt = (u, d) => fr.P(U(u), -d);
  const dirU = [(mir ? -1 : 1) * fr.U[0], (mir ? -1 : 1) * fr.U[1]], dirD = [-fr.N[0], -fr.N[1]];
  const yawU = -Math.atan2(dirU[1], dirU[0]), yawD = -Math.atan2(dirD[1], dirD[0]);
  const faceYaw = (rx, rz) => -Math.atan2(rx, -rz);           // a chest whose front looks along (rx, rz)
  const yF = y + FLOOR, yU = yF + 0.03, yRoof = yT + 0.2, r = el.rect;
  const rise1 = (yU - y) / NS, rise2 = (yRoof - yU) / NS2, tr1 = RUN1 / (NS - 1), tr2 = RUN2 / (NS2 - 1);
  const rect = (a) => R(a[0], a[1], a[2], a[3]);
  const kind = el.up;
  const C = { bag, col, lights, R, B, BN, Pt, yawU, yawD, faceYaw, dirU, dirD, yU, y, seed: el.seed, kind, el };

  // ── the ground storey's stair: the foot (a floor), the treads of the first flight, the ramp under the walker ──
  { const [a0, a1] = [s.S0 + 1.05, s.S0 + 2.0], f1 = s.f + 1.0;
    { const q = R(s.S0, s.cuL, s.f, s.f + 1.0); bag.add('cotto_floor', box(q[0], y - 0.3, q[1], q[2], y, q[3])); col.floor(q, y); }
    for (let k = 1; k < NS; k++) {
      const d0 = f1 + (k - 1) * tr1, d1 = f1 + k * tr1, top = y + k * rise1;
      bag.add('plaster_white', B(a0, a1, y - 0.3, top - 0.03, d0, d1)); bag.add('cotto_floor', B(a0 - 0.01, a1, top - 0.03, top, d0 - 0.02, d1));
      bag.add(k % 2 ? 'tile_turquoise' : 'glaze_green', B(a0, a1, top - rise1 + 0.02, top - 0.03, d0 - 0.025, d0 - 0.005));   // the riser: a tile
    }
    col.ramp(R(a0, a1, f1, Dc1), y + rise1, yU, dirTo(dirD));
  }
  // ── the mass of the upper floor: everything the rooms, the shaft, the doors and the windows do not take ──
  const voids = [court, ...[L.fr, L.corr, L.east, L.wing, L.shaftA, L.shaftB, ...L.back].filter(Boolean).map(rect), ...L.doors.map((d) => rect(d.r)), ...L.wins.map((w) => rect(w.r))];
  const bal = P.balcony ? L.balcony : null;
  if (bal !== null) voids.push(R(bal - 0.55, bal + 0.55, -0.01, t + 0.01));
  for (const p of subtractRects(r, voids)) { bag.add(mat, box(p[0], yF, p[1], p[2], yT, p[3])); col.rect(p, yF, yT); }
  // sills and lintels over the windows and doors (they are solid there; between them is the hole)
  for (const w of L.wins) { const q = rect(w.r); bag.add(mat, box(q[0], yF, q[1], q[2], yU + w.sill, q[3])); col.rect(q, yF, yU + w.sill); bag.add(mat, box(q[0], yU + w.head, q[1], q[2], yT, q[3])); col.rect(q, yU + w.head, yT); }
  for (const d of L.doors) { const q = rect(d.r); bag.add('cedar', box(q[0], yU + 2.15, q[1], q[2], yU + 2.3, q[3])); bag.add(mat, box(q[0], yU + 2.3, q[1], q[2], yT, q[3])); col.rect(q, yU + 2.15, yT); }
  if (bal !== null) { const q = R(bal - 0.55, bal + 0.55, -0.01, t + 0.01); bag.add('cedar', box(q[0], yU + 2.3, q[1], q[2], yU + 2.45, q[3])); bag.add(mat, box(q[0], yU + 2.45, q[1], q[2], yT, q[3])); col.rect(q, yU + 2.3, yT); }

  // ── floors, ceilings, the shaft ──
  const rooms = [L.fr, L.corr, L.east, L.wing, ...L.back].filter(Boolean);
  for (const a of rooms) {
    const q = rect(a); bag.add(a === L.corr || a === L.fr ? 'cotto_floor' : 'cotto_floor', box(q[0], yF, q[1], q[2], yU, q[3])); col.floor(q, yU);
    bag.add('ceiling_painted', box(q[0], yT - 0.1, q[1], q[2], yT, q[3]));
    const longU = a[1] - a[0] >= a[3] - a[2], n = Math.max(2, Math.round((longU ? a[1] - a[0] : a[3] - a[2]) / 1.25));
    for (let i = 0; i < n; i++) { const k = (i + 0.5) / n; bag.add('cedar', longU ? B(a[0] + (a[1] - a[0]) * k - 0.07, a[0] + (a[1] - a[0]) * k + 0.07, yT - 0.3, yT - 0.1, a[2], a[3]) : B(a[0], a[1], yT - 0.3, yT - 0.1, a[2] + (a[3] - a[2]) * k - 0.07, a[2] + (a[3] - a[2]) * k + 0.07)); }
  }
  // the landing's floor is the corridor's (it spans the cell); under lane B the mass reaches the floor: the second flight stands on it
  for (let k = 1; k < NS2; k++) {
    const d1 = Dc1 - (k - 1) * tr2, d0 = Dc1 - k * tr2, top = yU + k * rise2;
    bag.add('plaster_white', B(s.S0, s.S0 + 0.95, yF, top - 0.03, d0, d1)); bag.add('cotto_floor', B(s.S0, s.S0 + 0.95, top - 0.03, top, d0, d1 + 0.02));
    bag.add(k % 2 ? 'glaze_green' : 'tile_turquoise', B(s.S0, s.S0 + 0.95, top - rise2 + 0.02, top - 0.03, d1 - 0.005, d1 + 0.025));
  }
  col.ramp(R(s.S0, s.S0 + 0.95, s.dHi, Dc1), yU + rise2 + 0.12, yRoof, dirTo(fr.N));
  // the stair's wall tiles: a dado of turquoise tile along the lane A wall and the stringer
  bag.add('tile_turquoise', B(s.S0 + 1.04, s.S0 + 1.07, yU, yU + 0.9, s.f + 1.0, Dc1));
  // ── the gallery's balustrade along the court's back: turned spindles, rails, end posts ──
  balustrade(C, s.cuL, s.cuR, Dc1 + 0.1, 'u');
  // ── the doors' leaves, open against the wall, the windows' grilles and shutters ──
  for (const d of L.doors) {
    const q = d.r, c = d.kind === 'back' ? [q[0] + 0.03, q[0] + 0.1, q[2] + 0.02, q[3] - 0.0] : [q[0] + 0.03, q[0] + 0.1, q[2], q[3]];
    bag.add('cedar', B(c[0], c[1], yU, yU + 2.1, c[2] + 0.05, c[3] - 0.05)); bag.add('wood_dark', B(c[0] - 0.005, c[1] + 0.005, yU + 0.3, yU + 1.7, c[2] + 0.15, c[3] - 0.15));
  }
  for (const w of L.wins) {
    const q = w.r, cu = (q[0] + q[1]) / 2, cd = (q[2] + q[3]) / 2, alongU = q[1] - q[0] > q[3] - q[2];
    if (alongU) { for (let k = 1; k < 5; k++) bag.add('iron', B(q[0] + (q[1] - q[0]) * k / 5 - 0.012, q[0] + (q[1] - q[0]) * k / 5 + 0.012, yU + w.sill, yU + w.head, cd - 0.012, cd + 0.012)); }
    else { for (let k = 1; k < 5; k++) bag.add('iron', B(cu - 0.012, cu + 0.012, yU + w.sill, yU + w.head, q[2] + (q[3] - q[2]) * k / 5 - 0.012, q[2] + (q[3] - q[2]) * k / 5 + 0.012)); }
    bag.add('limestone', alongU ? B(q[0] - 0.05, q[1] + 0.05, yU + w.sill - 0.06, yU + w.sill, cd - 0.2, cd + 0.2) : B(cu - 0.2, cu + 0.2, yU + w.sill - 0.06, yU + w.sill, q[2] - 0.05, q[3] + 0.05));
    if (w.kind === 'street' && alongU) for (const sd of [-1, 1]) { const a = sd < 0 ? q[0] - 0.12 : q[1] + 0.02; bag.add(hash(cu, sd) < 0.5 ? 'shutter_brown' : 'shutter_green', B(a, a + 0.1, yU + w.sill, yU + w.head - 0.1, t - 0.02, t + 0.18)); }
    if (w.kind === 'court' || w.kind === 'corr') bag.add('lattice', alongU ? B(q[0] - 0.02, q[1] + 0.02, yU + w.sill, yU + w.head, cd - 0.025, cd + 0.025) : B(cu - 0.025, cu + 0.025, yU + w.sill, yU + w.head, q[2] - 0.02, q[3] + 0.02));
  }
  // ── the balcony on the street: a floor on corbels, a rail on three sides, a pent roof of green tile on two posts ──
  if (bal !== null) balcony(C, bal, t);
  // ── the rooms by use ──
  furnish(C, L, P);
  // ── the roof ──
  roof(C, L, P, court, r, yT, yRoof);
  bag.flush(real);
}
const dirTo = (v) => (Math.abs(v[0]) > Math.abs(v[1]) ? (v[0] > 0 ? 'e' : 'w') : (v[1] > 0 ? 's' : 'n'));

/** A turned-cedar balustrade from u0 to u1 at depth d (a line along u'): spindles, a top rail without a top face, a foot rail, end posts, a collider. */
function balustrade(C, u0, u1, d, axis, o = {}) {
  const { bag, col, B, BN, R, yU } = C, h = o.h ?? 0.92, th = 0.05;
  const n = Math.max(2, Math.round((u1 - u0) / 0.2));
  const sp = (x, z, y0) => { bag.add('cedar', lathe([[0.016, 0], [0.03, 0.2], [0.014, 0.34], [0.027, 0.6], [0.014, h - 0.22]], 4, null, x, y0 + 0.12, z)); };
  if (axis === 'u') {
    for (let i = 0; i <= n; i++) { const u = u0 + 0.06 + (u1 - u0 - 0.12) * i / n, [x, z] = C.Pt(u, d); sp(x, z, yU); }
    bag.add('cedar', BN(u0, u1, yU + h - 0.1, yU + h, d - 0.06, d + 0.06)); bag.add('cedar', B(u0, u1, yU + 0.04, yU + 0.12, d - th, d + th));
    for (const u of [u0, u1]) { const [x, z] = C.Pt(u, d); bag.add('cedar', lathe([[0.001, 0], [0.06, 0], [0.05, 0.1], [0.07, 0.4], [0.05, 0.9], [0.08, 1.0], [0.05, 1.1], [0.001, 1.14]], 6, null, x, yU, z)); }
    col.rect(R(u0 - 0.06, u1 + 0.06, d - 0.07, d + 0.07), yU, yU + 1.1);
  } else {
    for (let i = 0; i <= n; i++) { const dd = u0 + 0.06 + (u1 - u0 - 0.12) * i / n, [x, z] = C.Pt(d, dd); sp(x, z, yU); }
    bag.add('cedar', BN(d - 0.06, d + 0.06, yU + h - 0.1, yU + h, u0, u1)); bag.add('cedar', B(d - th, d + th, yU + 0.04, yU + 0.12, u0, u1));
    col.rect(R(d - 0.07, d + 0.07, u0, u1), yU, yU + 1.1);
  }
}

/** The balcony (a shahnishin you can step on): over the lane at the street room's window, u its middle. */
function balcony(C, u, t) {
  const { bag, col, B, BN, R, Pt, yU, y } = C, w = 0.7, out = 0.75;
  bag.add('cotto_floor', B(u - w, u + w, yU - 0.04, yU, -out, t + 0.0)); bag.add('cedar', B(u - w - 0.04, u + w + 0.04, yU - 0.22, yU - 0.04, -out - 0.04, 0));
  col.floor(R(u - w, u + w, -out, t), yU);
  for (const s of [-1, 1]) for (const d of [-0.1, -0.5]) bag.add('cedar', B(u + s * (w - 0.05) - 0.05, u + s * (w - 0.05) + 0.05, yU - 0.62 + (d < -0.3 ? 0.2 : 0), yU - 0.22, d - 0.05, d + 0.05));   // corbels
  const uu = [u - w, u + w], dd = -out;
  // the rail on the front and the two sides (the wall side stays open: the door)
  const sp = (x, z) => bag.add('cedar', lathe([[0.016, 0], [0.03, 0.2], [0.014, 0.34], [0.027, 0.6], [0.014, 0.8]], 4, null, x, yU + 0.12, z));
  const nf = Math.round(2 * w / 0.2);
  for (let i = 0; i <= nf; i++) { const [x, z] = Pt(uu[0] + 0.05 + (2 * w - 0.1) * i / nf, dd + 0.05); sp(x, z); }
  for (const uq of uu) for (let i = 1; i <= 4; i++) { const [x, z] = Pt(uq + (uq < u ? 0.05 : -0.05), dd + 0.05 + (out - 0.05) * i / 5); sp(x, z); }
  bag.add('cedar', BN(uu[0], uu[1], yU + 0.92 - 0.1, yU + 0.92, dd, dd + 0.1)); for (const uq of uu) bag.add('cedar', BN(uq - 0.05, uq + 0.05, yU + 0.82, yU + 0.92, dd, 0));
  col.rect(R(uu[0] - 0.04, uu[1] + 0.04, dd, dd + 0.1), yU, yU + 1.05); col.rect(R(uu[0] - 0.04, uu[0] + 0.04, dd, 0), yU, yU + 1.05); col.rect(R(uu[1] - 0.04, uu[1] + 0.04, dd, 0), yU, yU + 1.05);
  // posts and the pent roof
  for (const uq of uu) { const [x, z] = Pt(uq, dd + 0.06); bag.add('cedar', lathe([[0.001, 0], [0.06, 0], [0.05, 0.1], [0.045, 1.2], [0.07, 1.3], [0.05, 1.4], [0.045, 2.3], [0.07, 2.4], [0.001, 2.45]], 6, null, x, yU, z)); col.circle(x, z, 0.07, yU, yU + 2.5); }
  bag.add('cedar', B(u - w - 0.08, u + w + 0.08, yU + 2.45, yU + 2.55, dd - 0.06, 0));
  bag.add('tile_green', B(u - w - 0.12, u + w + 0.12, yU + 2.55, yU + 2.62, dd - 0.12, 0.0));
  void t; void y;
}

// ── the rooms by use ───────────────────────────────────────────────────────────────────────────────────────
function furnish(C, L, P) {
  const { kind } = C, back = L.back, fr = L.fr, east = L.east, wing = L.wing;
  const first = back[0], last = back[back.length - 1];
  const lampAt = (a, lights) => { const [x, z] = C.Pt((a[0] + a[1]) / 2, (a[2] + a[3]) / 2); houseLamp(C.bag, lights, x, C.yU + 2.1, z, C.yU + 3.1, { glow: 1.6, reach: 5 }); };
  // the corridor: a lamp, a water jar and a pot of basil by the balustrade's end
  lampAt(L.corr, C.lights);
  { const [x, z] = C.Pt(L.s.cuR + 0.45, L.corr[2] + 0.75); F.waterJar(C.bag, x, C.yU, z, 0.9, 'terracotta'); C.col.circle(x, z, 0.28, C.yU, C.yU + 0.9); }
  if (kind === 'merchant') {
    reading(C, fr, L, true); bedchamber(C, east, 'rich'); salon(C, first); lampAt(first, null);
    for (const b of back.slice(1)) store(C, b, ['pottery_dark', 'terracotta']);
    if (wing) sitting(C, wing);
  } else if (kind === 'craft') {
    wool(C, fr); bedchamber(C, east, 'plain'); workroom(C, first); lampAt(first, null);
    for (const b of back.slice(1)) family(C, b);
    if (wing) store(C, wing, ['terracotta']);
  } else if (kind === 'tenement') {
    back.forEach((b, i) => tenant(C, b, i)); tenant(C, east, 7); if (wing) tenant(C, wing, 9);
    shared(C, fr);
  } else {
    // shop with dwelling: the stock of the trade over the dukkan, the family's rooms behind
    stock(C, fr, (P.el?.shops ?? C.el.shops ?? ['cloth', 'bread'])[0]); bedchamber(C, east, 'plain'); family(C, first); lampAt(first, null);
    for (const b of back.slice(1)) stock(C, b, (C.el.shops ?? ['cloth', 'bread'])[1 % (C.el.shops?.length || 1)]);
    if (wing) store(C, wing, ['terracotta']);
  }
}
/** Room geometry helpers. */
const dim = (a) => ({ w: a[1] - a[0], dp: a[3] - a[2], cu: (a[0] + a[1]) / 2, cd: (a[2] + a[3]) / 2 });
function boxCol(C, u0, u1, d0, d1, h) { C.col.rect(C.R(u0, u1, d0, d1), C.yU, C.yU + h); }
function bed(C, u0, u1, d0, d1, head, quilt) {
  const { bag } = C, h = 0.38;
  bag.add('wood_dark', C.B(u0, u1, C.yU, C.yU + h, d0, d1)); boxCol(C, u0, u1, d0, d1, h + 0.12);
  const [cx, cz] = C.Pt((u0 + u1) / 2, (d0 + d1) / 2), alongD = d1 - d0 >= u1 - u0, yaw = alongD ? C.yawD : C.yawU;
  F.cushion(bag, cx, C.yU + h, cz, alongD ? u1 - u0 - 0.06 : d1 - d0 - 0.06, alongD ? d1 - d0 - 0.06 : u1 - u0 - 0.06, 0.1, alongD ? C.yawU : C.yawU, 'cloth_white');
  const k = head > 0 ? 0.62 : 0.38, [qx, qz] = alongD ? C.Pt((u0 + u1) / 2, d0 + (d1 - d0) * k) : C.Pt(u0 + (u1 - u0) * k, (d0 + d1) / 2);
  F.cushion(bag, qx, C.yU + h + 0.1, qz, alongD ? u1 - u0 - 0.2 : (u1 - u0) * 0.6, alongD ? (d1 - d0) * 0.6 : d1 - d0 - 0.2, 0.08, C.yawU, quilt);
  const [bx, bz] = alongD ? C.Pt((u0 + u1) / 2, head > 0 ? d1 - 0.2 : d0 + 0.2) : C.Pt(head > 0 ? u1 - 0.2 : u0 + 0.2, (d0 + d1) / 2);
  F.bolster(bag, bx, C.yU + h + 0.1, bz, (alongD ? u1 - u0 : d1 - d0) - 0.25, 0.1, alongD ? C.yawU : C.yawD, 'cloth_red', 'cloth_ochre'); void yaw;
}
function chest(C, u, d, toward) {
  const [x, z] = C.Pt(u, d), r = toward;                          // toward: [du, dd] the way its front looks (u' and d components)
  const wx = r[0] * C.dirU[0] + r[1] * C.dirD[0], wz = r[0] * C.dirU[1] + r[1] * C.dirD[1];
  const horiz = Math.abs(r[1]) > 0.5;                              // front along d: the chest's width runs along u'
  F.chest(C.bag, x, C.yU, z, horiz ? 0.85 : 0.5, horiz ? 0.5 : 0.85, 0.55, C.faceYaw(wx, wz));
  if (horiz) boxCol(C, u - 0.43, u + 0.43, d - 0.27, d + 0.27, 0.6); else boxCol(C, u - 0.27, u + 0.27, d - 0.43, d + 0.43, 0.6);
}
/** Which wall a room's door is on matters: furniture stays on the walls away from the doors (a clear lane of 1.1 m from each door). */
function bedchamber(C, a, rank) {
  const { w, dp, cd } = dim(a); if (w < 1.5) return;
  // the bed along the court wall (the low-u side), its head to the north; chests by the east wall at the middle, a brazier and a tray
  bed(C, a[0] + 0.05, a[0] + 0.95, cd - 0.95, cd + 0.95, 1, hash(C.seed, 1) < 0.5 ? 'cloth_indigo' : 'cloth_green');
  chest(C, a[0] + 0.5, a[2] + 0.5, [0, 1]); chest(C, a[0] + 0.5, a[3] - 0.5, [0, -1]);
  if (rank === 'rich') { const [x, z] = C.Pt(a[0] + 1.35, cd - 1.3); F.carpet(C.bag, x, C.yU + 0.01, z, 0.9, 1.5, C.yawU + Math.PI / 2, 'blue'); }
  else { const [x, z] = C.Pt(a[0] + 1.35, cd - 1.2); F.reedMat(C.bag, x, C.yU + 0.01, z, 0.9, 1.5, C.yawD); }
  { const [x, z] = C.Pt(a[1] - 0.45, cd + 0.2); brazier(C.bag, x, C.yU, z, 0.2); C.col.circle(x, z, 0.26, C.yU, C.yU + 0.3); }
  void dp;
}
function salon(C, a) {
  const { w, dp, cu, cd } = dim(a), yU = C.yU, bag = C.bag;
  // divans on the far wall and the west wall, a carpet, a tray, a dado of tile on the walls
  F.divan(bag, C.col, C.Pt(a[0] + 0.1, a[3] - 0.05), C.Pt(a[1] - 0.1, a[3] - 0.05), yU, C.Pt(cu, a[2]), { h: 0.36, depth: 0.75, mattress: 'cloth_red', backs: ['cloth_ochre', 'cloth_indigo', 'cloth_green'] });
  F.divan(bag, C.col, C.Pt(a[0] + 0.05, a[3] - 0.85), C.Pt(a[0] + 0.05, a[2] + 1.7), yU, C.Pt(cu, cd), { h: 0.36, depth: 0.75, mattress: 'cloth_indigo', backs: ['cloth_ochre', 'cloth_red'] });
  { const [x, z] = C.Pt(cu + 0.4, cd + 0.2); F.carpet(bag, x, yU + 0.01, z, Math.min(3.0, w - 2.2), 1.6, C.yawU, 'persian'); F.trayTable(bag, x, yU + 0.03, z, { r: 0.4, seed: C.seed }); C.col.circle(x, z, 0.42, yU, yU + 0.4); }
  { const [x, z] = C.Pt(a[1] - 0.6, a[3] - 1.2); F.rahle(bag, x, yU, z, C.yawD); }
  for (const [u0, u1, d0, d1] of [[a[0], a[1], a[3] - 0.03, a[3]], [a[0], a[0] + 0.03, a[2] + 1.5, a[3]], [a[1] - 0.03, a[1], a[2], a[3]]]) { bag.add('tile_turquoise', C.B(u0, u1, yU, yU + 1.0, d0, d1)); bag.add('tile_cream', C.B(u0, u1, yU + 1.0, yU + 1.1, d0, d1)); }
  void dp;
}
function sitting(C, a) {
  const { cu, cd } = dim(a);
  F.divan(C.bag, C.col, C.Pt(a[0] + 0.1, a[3] - 0.1), C.Pt(a[0] + 0.1, a[2] + 0.6), C.yU, C.Pt(cu, cd), { h: 0.36, depth: 0.7, mattress: 'cloth_green', backs: ['cloth_ochre'] });
  const [x, z] = C.Pt(cu + 0.6, cd); F.reedMat(C.bag, x, C.yU + 0.01, z, 1.2, 1.6, C.yawD);
}
function reading(C, a, L, balc) {
  // the street room: a window seat under the street windows, a reading stand on a mat, a chest; the balcony's door stays clear
  const { cu } = dim(a), yU = C.yU;
  const wins = L.frWins.filter((u) => Math.abs(u - L.balcony) > 0.1);
  for (const u of wins) F.divan(C.bag, C.col, C.Pt(u - 0.55, a[2] + 0.05), C.Pt(u + 0.55, a[2] + 0.05), yU, C.Pt(u, a[3]), { h: 0.34, depth: 0.5, mattress: 'cloth_indigo', backs: ['cloth_ochre'] });
  { const u = Math.min(L.X1 - 2.2, Math.max(L.X0 + 1.0, cu + 2.4)), [x, z] = C.Pt(u, a[3] - 0.55); F.reedMat(C.bag, x, yU + 0.01, z, 0.9, 0.7, C.yawU); F.rahle(C.bag, x, yU + 0.012, z, C.yawD); }
  chest(C, L.X0 + 0.5, a[3] - 0.5, [1, 0]); void balc;
}
function store(C, a, jars) {
  const { w, dp } = dim(a), yU = C.yU; if (dp < 1.6) return;
  // jars along the far wall, sacks and a chest, a shelf of pots
  const n = Math.max(2, Math.min(6, Math.floor((w - 2.6) / 0.62)));
  for (let k = 0; k < n; k++) { const [x, z] = C.Pt(a[0] + 1.9 + k * 0.62, a[3] - 0.38); F.waterJar(C.bag, x, yU, z, 0.9 + 0.1 * (k % 2), jars[k % jars.length]); C.col.circle(x, z, 0.3, yU, yU + 0.9); }
  { const [x, z] = C.Pt(a[1] - 0.55, a[2] + 1.1); F.spiceSacks(C.bag, x, yU, z, C.yawD, 3); boxCol(C, a[1] - 1.05, a[1] - 0.05, a[2] + 0.55, a[2] + 1.65, 0.7); }
  chest(C, a[0] + 2.3, a[2] + 0.45, [0, 1]);
  C.bag.add('timber', C.B(a[0] + 1.8, a[0] + 1.8 + 1.8, yU + 1.4, yU + 1.45, a[3] - 0.3, a[3])); { const [x, z] = C.Pt(a[0] + 2.4, a[3] - 0.15); F.pots(C.bag, x, yU + 1.45, z, C.yawU, 4); }
}
function family(C, a) {
  const { w, dp, cu, cd } = dim(a), yU = C.yU; if (dp < 1.6) return;
  F.divan(C.bag, C.col, C.Pt(a[0] + 0.1, a[3] - 0.05), C.Pt(a[1] - 0.1, a[3] - 0.05), yU, C.Pt(cu, a[2]), { h: 0.34, depth: 0.7, mattress: hash(C.seed, 4) < 0.5 ? 'cloth_red' : 'cloth_indigo', backs: ['cloth_ochre', 'cloth_green'] });
  { const [x, z] = C.Pt(cu + 0.2, cd + 0.1); F.carpet(C.bag, x, yU + 0.01, z, Math.min(2.4, w - 2.6), Math.min(1.2, dp - 1.2), C.yawU, 'blue'); F.trayTable(C.bag, x, yU + 0.03, z, { r: 0.34, seed: C.seed + 3 }); C.col.circle(x, z, 0.37, yU, yU + 0.4); }
  { const [x, z] = C.Pt(a[1] - 0.5, a[2] + 0.6); brazier(C.bag, x, yU, z, 0.2); C.col.circle(x, z, 0.26, yU, yU + 0.3); }
  chest(C, a[1] - 0.5, a[3] - 1.2, [-1, 0]);
}
function workroom(C, a) {
  const { w, dp, cu } = dim(a), yU = C.yU, bag = C.bag, uc = a[0] + 1.9 + Math.min(1.0, (w - 4.4) / 2), ww = 1.7, d0 = a[3] - 1.35;
  // a floor loom on the far side of the room, a bench with the tools, skeins on a pole; the way from the door stays clear
  for (const s of [-1, 1]) bag.add('wood_dark', C.B(uc + s * ww / 2 - 0.05, uc + s * ww / 2 + 0.05, yU, yU + 1.75, d0 + 0.0, d0 + 0.15));
  bag.add('wood_dark', C.B(uc - ww / 2 - 0.05, uc + ww / 2 + 0.05, yU + 1.7, yU + 1.78, d0 - 0.02, d0 + 0.17)); bag.add('timber', C.B(uc - ww / 2, uc + ww / 2, yU + 0.42, yU + 0.5, d0 - 0.02, d0 + 0.12));
  for (let k = 0; k < 15; k++) bag.add('cloth_white', C.B(uc - ww / 2 + 0.06 + k * (ww - 0.12) / 14, uc - ww / 2 + 0.07 + k * (ww - 0.12) / 14, yU + 0.9, yU + 1.7, d0 + 0.07, d0 + 0.085));
  bag.add(hash(C.seed, 5) < 0.5 ? 'cloth_indigo' : 'cloth_red', C.B(uc - ww / 2 + 0.06, uc + ww / 2 - 0.06, yU + 0.5, yU + 0.9, d0 + 0.06, d0 + 0.1));
  boxCol(C, uc - ww / 2 - 0.07, uc + ww / 2 + 0.07, d0 - 0.03, d0 + 0.18, 1.8);
  { const [x, z] = C.Pt(uc, d0 - 0.65); bag.add('timber', C.B(uc - 0.3, uc + 0.3, yU + 0.38, yU + 0.43, d0 - 0.85, d0 - 0.45)); for (const [du, dd] of [[-0.25, -0.8], [0.25, -0.8], [-0.25, -0.5], [0.25, -0.5]]) bag.add('wood_dark', C.B(uc + du - 0.025, uc + du + 0.025, yU, yU + 0.38, d0 + dd - 0.025, d0 + dd + 0.025)); boxCol(C, uc - 0.3, uc + 0.3, d0 - 0.85, d0 - 0.45, 0.45); void x; void z; }
  const bu0 = a[1] - 2.7, bu1 = a[1] - 0.2;
  bag.add('wood_dark', C.B(bu0, bu1, yU + 0.82, yU + 0.88, a[3] - 0.6, a[3] - 0.02)); for (const u of [bu0 + 0.05, bu1 - 0.11]) for (const d of [a[3] - 0.58, a[3] - 0.1]) bag.add('wood_dark', C.B(u, u + 0.06, yU, yU + 0.82, d, d + 0.06));
  boxCol(C, bu0, bu1, a[3] - 0.6, a[3] - 0.02, 0.9);
  { const [x, z] = C.Pt(bu0 + 0.6, a[3] - 0.3); F.bolts(bag, x, yU + 0.88, z, 4, C.yawU); const [x2, z2] = C.Pt(bu0 + 1.7, a[3] - 0.3); F.copperware(bag, x2, yU + 0.88, z2, C.yawU, C.seed, 3); }
  { const [ax, az] = C.Pt(a[0] + 0.25, a[2] + 0.4), [bx, bz] = C.Pt(a[0] + 0.25, a[3] - 1.0); bag.add('timber', rod([ax, yU + 2.05, az], [bx, yU + 2.05, bz], 0.025, 5));
    for (let k = 0; k < 5; k++) { const [sx, sz] = C.Pt(a[0] + 0.25, a[2] + 0.7 + k * (a[3] - a[2] - 2.0) / 4); bag.add(['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green'][k], box(sx - 0.05, yU + 1.5, sz - 0.05, sx + 0.05, yU + 2.05, sz + 0.05)); } }
  void dp; void cu;
}
function wool(C, a) {
  // the street room of the craftsman: bales of wool and bundles of yarn along the wall, a pole with skeins
  const { w, cu } = dim(a), yU = C.yU;
  for (let k = 0; k < 3; k++) { const u = a[0] + 1.2 + k * 0.95 + (hash(C.seed, k) - 0.5) * 0.2, [x, z] = C.Pt(u, a[2] + 0.45); F.bale(C.bag, x, yU, z, 0.8, 0.3, 0.6, C.yawU, 'sacking'); F.bale(C.bag, x, yU + 0.32, z, 0.7, 0.3, 0.55, C.yawU, 'sacking'); boxCol(C, u - 0.42, u + 0.42, a[2] + 0.12, a[2] + 0.78, 0.65); }
  { const [x, z] = C.Pt(a[1] - 3.2, a[3] - 0.45); F.bolts(C.bag, x, yU, z, 5, C.yawU); boxCol(C, a[1] - 3.7, a[1] - 2.7, a[3] - 0.7, a[3] - 0.2, 0.5); }
  void w; void cu;
}
function tenant(C, a, i) {
  const { w, dp, cu, cd } = dim(a), yU = C.yU, bag = C.bag; if (w < 1.5 || dp < 1.5) return;
  // one family's room: bedding rolled by day against the wall, a chest, a brazier, pots and a jar, a mat
  const alongU = w >= dp, mats = ['cloth_indigo', 'cloth_red', 'cloth_green', 'cloth_ochre'];
  if (alongU) {
    const [x, z] = C.Pt(a[0] + 0.7, a[3] - 0.45); F.bolster(bag, x, yU + 0.0, z, 0.9, 0.16, C.yawU, mats[i % 4], 'cloth_white'); F.bolster(bag, x, yU + 0.32, z, 0.9, 0.16, C.yawU, mats[(i + 1) % 4], 'cloth_white'); boxCol(C, a[0] + 0.2, a[0] + 1.2, a[3] - 0.65, a[3] - 0.25, 0.5);
    chest(C, a[0] + 1.9, a[3] - 0.4, [0, -1]);
    const [mx, mz] = C.Pt(cu + 0.4, cd - 0.1); F.reedMat(bag, mx, yU + 0.01, mz, Math.min(2.2, w - 3.0), Math.min(1.3, dp - 1.0), C.yawU); F.cushion(bag, mx, yU + 0.02, mz, 0.5, 0.4, 0.1, C.yawU, mats[(i + 2) % 4]);
    const [bx, bz] = C.Pt(a[1] - 0.5, a[3] - 0.5); brazier(bag, bx, yU, bz, 0.18); C.col.circle(bx, bz, 0.24, yU, yU + 0.3);
    const [jx, jz] = C.Pt(a[1] - 0.45, a[2] + 1.6); F.waterJar(bag, jx, yU, jz, 0.8); C.col.circle(jx, jz, 0.26, yU, yU + 0.8);
  } else {
    const [x, z] = C.Pt(a[0] + 0.45, a[3] - 0.7); F.bolster(bag, x, yU, z, 0.9, 0.16, C.yawD, mats[i % 4], 'cloth_white'); F.bolster(bag, x, yU + 0.32, z, 0.9, 0.16, C.yawD, mats[(i + 1) % 4], 'cloth_white'); boxCol(C, a[0] + 0.2, a[0] + 0.7, a[3] - 1.2, a[3] - 0.2, 0.5);
    chest(C, a[1] - 0.4, a[3] - 0.9, [-1, 0]);
    const [bx, bz] = C.Pt(a[1] - 0.45, a[2] + 0.7); brazier(bag, bx, yU, bz, 0.18); C.col.circle(bx, bz, 0.24, yU, yU + 0.3);
  }
}
function shared(C, a) {
  // the street room of a tenement: shared, with the families' water jars and a washing line from wall to wall
  const yU = C.yU, bag = C.bag;
  for (let k = 0; k < 3; k++) { const [x, z] = C.Pt(a[0] + 1.0 + k * 0.7, a[3] - 0.4); F.waterJar(bag, x, yU, z, 0.9, k === 1 ? 'pottery_dark' : 'terracotta'); C.col.circle(x, z, 0.28, yU, yU + 0.85); }
  const [ax, az] = C.Pt(a[0] + 0.3, a[2] + 0.6), [bx, bz] = C.Pt(a[1] - 0.3, a[2] + 0.6); bag.add('iron', rod([ax, yU + 1.9, az], [bx, yU + 1.9, bz], 0.008, 3));
  for (let i = 0; i < 7; i++) { const u = a[0] + 1.0 + i * (a[1] - a[0] - 2.0) / 6, [x, z] = C.Pt(u, a[2] + 0.6); bag.add(['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_green', 'cloth_white'][i], box(x - 0.2, yU + 1.9 - 0.6 - 0.3 * hash(C.seed, i), z - 0.012, x + 0.2, yU + 1.9, z + 0.012)); }
}
const GOODSMAP = { cloth: 'bolts', slipper: 'bale', pottery: 'pots', brass: 'copper', spice: 'sacks', dates: 'sacks', bread: 'sacks', books: 'chest', perfume: 'pots', candle: 'pots', henna: 'pots' };
function stock(C, a, trade) {
  const { w, dp } = dim(a), yU = C.yU, bag = C.bag; if (dp < 1.5) return;
  const kind = GOODSMAP[trade] ?? 'sacks', n = Math.max(2, Math.min(6, Math.floor((w - 3.0) / 1.0)));
  for (let k = 0; k < n; k++) {
    const u = a[0] + 1.6 + k * 1.0, [x, z] = C.Pt(u, a[2] + 0.45);
    if (kind === 'bolts') F.bolts(bag, x, yU, z, 5, C.yawU); else if (kind === 'pots') F.pots(bag, x, yU, z, C.yawU, 5); else if (kind === 'copper') F.copperware(bag, x, yU, z, C.yawU, C.seed + k, 4);
    else if (kind === 'bale') { F.bale(bag, x, yU, z, 0.8, 0.3, 0.6, C.yawU, 'sacking'); F.bale(bag, x, yU + 0.32, z, 0.7, 0.3, 0.55, C.yawU, 'sacking'); }
    else if (kind === 'chest') { F.chest(bag, x, yU, z, 0.8, 0.45, 0.5, C.faceYaw(C.dirD[0], C.dirD[1])); } else F.spiceSacks(bag, x, yU, z, C.yawU, 3);
    boxCol(C, u - 0.45, u + 0.45, a[2] + 0.05, a[2] + 0.85, 0.7);
  }
  { const [x, z] = C.Pt(a[1] - 0.6, a[3] - 0.4); F.cushion(bag, x, yU, z, 0.7, 0.6, 0.1, C.yawU, 'cloth_red'); }
}

// ── the roof terrace ───────────────────────────────────────────────────────────────────────────────────────
function roof(C, L, P, court, r, yT, yRoof) {
  const { bag, col, R, B, Pt } = C, s = L.s, { Lw, Dp, t, Dc1 } = P;
  const hA = R(...[L.shaftA[0], L.shaftA[1], L.shaftA[2], L.shaftA[3]]), hB = R(L.shaftB[0] - 0.25, L.shaftB[1], L.shaftB[2], L.shaftB[3]), ring = R(s.cuL - 0.3, s.cuR + 0.9, P.Dc0 - 0.9, Dc1 + 0.9);
  // the slab, the stair's open well (a stringer wall rises between the flights), the floor the walker steps on
  for (const p of subtractRects(r, [court, hA, hB])) bag.add('plaster_white', box(p[0], yT, p[1], p[2], yRoof, p[3]));
  for (const p of subtractRects(r, [ring, hA, hB])) col.floor(p, yRoof);
  // the parapet's collider, the low wall round the stair well, the rail round the court's opening
  for (const p of [[r[0], r[1], r[2], r[1] + 0.3], [r[0], r[3] - 0.3, r[2], r[3]], [r[0], r[1] + 0.3, r[0] + 0.3, r[3] - 0.3], [r[2] - 0.3, r[1] + 0.3, r[2], r[3] - 0.3]]) col.rect(p, yRoof, yT + 0.95);
  const lw = (u0, u1, d0, d1) => { const q = R(u0, u1, d0, d1); bag.add('plaster_white', box(q[0], yRoof, q[1], q[2], yRoof + 0.9, q[3])); col.rect(q, yRoof, yRoof + 0.9); };
  lw(s.S0 + 0.95, s.S0 + 1.05, s.f + 0.95, Dc1 + 0.05); lw(s.S0 + 0.95, s.S0 + 2.05, s.f + 0.95, s.f + 1.05); lw(s.S0 + 1.95, s.S0 + 2.05, s.f + 0.95, Dc1 + 0.05); lw(s.S0 - 0.05, s.S0 + 2.05, Dc1 - 0.05, Dc1 + 0.05);
  lw(s.S0 - 0.35, s.S0 - 0.25, s.dHi, Dc1 + 0.05);   // (the opening reaches a quarter metre past the flight: the engine reads the slab's edge a little beyond where it is)
  // the rail of turned cedar round the court's opening (the green pent roof lies inside it)
  { const o = ring, h = 0.9, n = (a, b) => Math.max(2, Math.round(Math.abs(b - a) / 0.45));
    for (const [x0, z0, x1, z1] of [[o[0], o[1], o[2], o[1]], [o[0], o[3], o[2], o[3]], [o[0], o[1], o[0], o[3]], [o[2], o[1], o[2], o[3]]]) {
      const alongX = z0 === z1, m = alongX ? n(x0, x1) : n(z0, z1);
      for (let i = 0; i <= m; i++) { const x = alongX ? x0 + (x1 - x0) * i / m : x0, z = alongX ? z0 : z0 + (z1 - z0) * i / m; bag.add('cedar', lathe([[0.02, 0], [0.027, 0.45], [0.014, h - 0.1]], 3, null, x, yRoof, z)); }
      bag.add('cedar', alongX ? noTop(x0, yRoof + h - 0.1, z0 - 0.05, x1, yRoof + h, z0 + 0.05) : noTop(x0 - 0.05, yRoof + h - 0.1, z0, x0 + 0.05, yRoof + h, z1));
      col.rect(alongX ? [x0, z0 - 0.06, x1, z0 + 0.06] : [x0 - 0.06, z0, x0 + 0.06, z1], yRoof, yRoof + 1.0);
    }
  }
  // the women's terrace: a mat with cushions and a tray in the shade of the south parapet, a washing line along the north strip, jars in the east strip, a charcoal pot, wool drying on a craftsman's house
  const kind = C.kind, at = (u, d) => Pt(u, d), farD = Dp - t - 0.2, X1 = L.X1;
  { const u = X1 - 2.2, d = farD - 0.85, [x, z] = at(u, d);
    F.reedMat(bag, x, yRoof + 0.01, z, 2.2, 1.4, C.yawU); F.cushion(bag, x - 0.5 * C.dirU[0], yRoof + 0.02, z - 0.5 * C.dirU[1], 0.55, 0.5, 0.12, C.yawU, 'cloth_red'); F.cushion(bag, x + 0.55 * C.dirU[0], yRoof + 0.02, z + 0.55 * C.dirU[1], 0.55, 0.5, 0.12, C.yawU, 'cloth_indigo');
    
    const [bx, bz] = at(u + 1.55, d - 0.1); brazier(bag, bx, yRoof, bz, 0.2); col.circle(bx, bz, 0.26, yRoof, yRoof + 0.3); }
  { const u0 = s.S0 + 2.6, len = Math.min(4.0, X1 - u0 - 0.5), d = 0.55;
    if (len > 1.5) { const [ax, az] = at(u0, d), [bx, bz] = at(u0 + len, d);
      for (const [x, z] of [[ax, az], [bx, bz]]) { bag.add('wood_dark', box(x - 0.04, yRoof, z - 0.04, x + 0.04, yRoof + 1.9, z + 0.04)); col.circle(x, z, 0.06, yRoof, yRoof + 1.9); }
      bag.add('iron', rod([ax, yRoof + 1.85, az], [bx, yRoof + 1.85, bz], 0.008, 3));
      const nc = Math.floor(len / 0.55);
      for (let i = 0; i < nc; i++) { const k = (i + 0.5) / nc, x = ax + (bx - ax) * k, z = az + (bz - az) * k, h = 0.7 + 0.5 * hash(C.seed, i + 20); bag.add(['cloth_white', 'cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_green', 'cloth_white'][i % 7], Math.abs(C.dirU[0]) > 0.5 ? box(x - 0.22, yRoof + 1.85 - h, z - 0.012, x + 0.22, yRoof + 1.85, z + 0.012) : box(x - 0.012, yRoof + 1.85 - h, z - 0.22, x + 0.012, yRoof + 1.85, z + 0.22)); } } }
  for (let k = 0; k < 2; k++) { const [x, z] = at(L.X0 + 0.8 + k * 0.62, farD - 0.4); F.waterJar(bag, x, yRoof, z, 0.9, k === 1 ? 'pottery_dark' : 'terracotta'); col.circle(x, z, 0.26, yRoof, yRoof + 0.85); }
  if (kind === 'craft') { for (let k = 0; k < 2; k++) { const [x, z] = at(L.X0 + 0.0 + 3.0 + k * 0, Dc1 + 1.0 + k * 0.0); void x; void z; } const [x, z] = at(X1 - 2.2, farD - 0.85); bag.add('cloth_white', box(x - 1.0, yRoof + 0.012, z - 0.8, x - 0.9, yRoof + 0.05, z - 0.7)); }
}

/** Walk-check routes (world [x, z]) for an open house: from the lane through the bent entrance, across the court, up the tiled stair to the gallery and into a back room; and on up the second flight to the roof terrace. */
export function upWalks(P, fr) {
  const L = P.upL, s = P.stair, { Lw, Dc0, Dc1 } = P, U = (u) => (s.mir ? Lw - u : u), Pt = (u, d) => fr.P(U(u), -d), udp = U(P.ud);
  const b0 = L.back[0], dr = L.doors.find((d) => d.kind === 'back').r;
  const up = [Pt(udp, -Math.min(2.0, (P.el.laneW ?? 2.4) / 2)), Pt(udp, 1.0), Pt(udp, Dc0 - 0.8), Pt(s.cuL + 1.0, Dc0 - 0.8), Pt(s.cuL + 1.0, Dc0 + 1.0), Pt(s.cuL + 0.5, s.f + 0.5), Pt(s.S0 + 1.5, s.f + 0.5), Pt(s.S0 + 1.53, s.f + 1.6), Pt(s.S0 + 1.53, Dc1 - 0.4), Pt(s.S0 + 1.5, Dc1 + 0.55)];
  const room = [...up, Pt((dr[0] + dr[1]) / 2, Dc1 + 0.55), Pt((dr[0] + dr[1]) / 2, b0[2] + 1.3), Pt((b0[0] + b0[1]) / 2 + 0.3, (b0[2] + b0[3]) / 2)];
  const roof = [...up, Pt(s.S0 + 0.40, Dc1 + 0.55), Pt(s.S0 + 0.40, Dc1 - 1.0), Pt(s.S0 + 0.40, s.dHi + 0.3), Pt(s.S0 + 0.40, s.dHi - 0.8), Pt(s.S0 + 0.40, 1.2), Pt(s.cuR + 1.65, 1.2), Pt(s.cuR + 1.65, Dc1 + 1.0)];
  return [room, roof];
}
