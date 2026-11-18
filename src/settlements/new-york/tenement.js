// The walk-up's upper storeys (docs/settlements/new-york.md §1p): the style's `walkup` builds the ground-floor flat and the hall with its
// first flight; here the solid body over it is taken out and built again as three floors of railroad flats (parlour on the street, a
// bedroom, the kitchen, a bedroom at the back, all in a row off one line of doors) and an attic floor, each reached from the stair hall by a door
// at a landing; the hall's stair goes on in two lanes (a flight up each, turning at a landing at the back or the front) to the tar roof under
// its bulkhead, where there are the parapet, the water tank on its stilts and a pigeon coop. The fire escape's decks on the front are floors one
// steps onto from the windows. Laid out in the lot's own frame: u along the front from the west wall, v back from the street face.
import { box, rod, lathe as lathe0 } from '../../core/geom.js';
import { face } from '../../styles/artdeco/blocks.js';
import { furnish, vary, hash } from './upper.js';

const T = 0.3, FL = 3.0, DW = 0.9, SC = 'stucco_cream', PL = 'plaster_white', BR = 'facade_brick';
const lathe = (prof, seg, mod, x, y, z) => lathe0(prof.map(([r, h]) => [r * (1 + 0.04 * (hash(x, y, z) - 0.5)), h]), seg, mod, x, y, z);
/** The hall's lanes and landings (local u, v): lane 1 over the ground flight, lane 2 beside it; the flights run between v = VS and VN. */
const LANE1 = [0.35, 1.58], LANE2 = [1.7, 2.78], HALL = [0.3, 2.92], VS = 7.2, VN = 11.0, HW = [2.8, 2.92], UF = 2.92;
const ROOMS = [['parlour', 0.3, 3.9], ['bedroom', 0.3, 6.1], ['kitchen', 6.1, 9.4], ['bedroom', 9.4, 11.9]];
/** Where the doors in the hall's east wall are (v ranges) and the levels they serve: the north landing (rear bedroom) at floors 2 and 4, the south landing (kitchen) at 3 and 5. */
const DOOR_N = [10.95, 11.85], DOOR_S = [6.35, 7.15], DU = 5.1;
const levelsOf = (H1) => [H1, H1 + FL, H1 + 2 * FL, H1 + 3 * FL];

export function withTenement(orig) {
  return (el, ctx) => {
    const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, top = y + (el.h ?? 15), F = y + 0.55, H1 = F + 3.3;
    const pbag = Object.create(bag);
    pbag.add = (m, g) => {
      if (!g) return;
      if (m === 'facade_brick') { g.computeBoundingBox(); const b = g.boundingBox; if (Math.abs(b.min.y - H1) < 1e-4 && Math.abs(b.max.y - top) < 1e-4) return; }   // the solid body over the ground floor
      bag.add(m, g);
    };
    const pcol = Object.create(col);
    pcol.rect = (rc, y0, y1) => {
      if (Math.abs(y0 - H1) < 1e-4 && Math.abs(y1 - top) < 1e-4) return;                                   // (the same body's)
      if (Math.abs(y0 - F) < 1e-4 && Math.abs(y1 - (F + 1.0)) < 1e-4 && Math.abs(Math.abs(rc[3] - rc[1]) - 3.6) < 1e-3) return;   // the hall's first flight, solid: its treads follow
      col.rect(rc, y0, y1);
    };
    orig(el, { ...ctx, bag: pbag, col: pcol });
    build(el, bag, col, lights, { x0, z0, x1, z1, y, top, F, H1 });
  };
}

function build(el, bag, col, lights, { x0, z0, x1, z1, y, top, F, H1 }) {
  const Fc = face(el.rect, 's'), L = Fc.L, ext = Fc.ext, dE = ext - T, LV = levelsOf(H1);
  const rnd = (() => { let s = ((el.seed || 1) ^ 0x7e57) >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); })(), pk = (a) => a[Math.floor(rnd() * a.length)];
  const B = (m, u0, u1, ya, yb, v0, v1) => { if (yb - ya < 1e-4 || u1 - u0 < 1e-4 || v1 - v0 < 1e-4) return; bag.add(m, vary(Fc.R(u0, u1, ya, yb, -v1, -v0), 2)); };
  const C = (u0, u1, v0, v1, ya, yb) => col.rect(Fc.rc(u0, u1, -v1, -v0), ya, yb);
  const Fl = (u0, u1, v0, v1, yy) => col.floor(Fc.rc(u0, u1, -v1, -v0), yy);
  const Pt = (u, v, yy) => Fc.P(u, -v, yy);
  const slab = (u0, u1, v0, v1, yk) => { B(PL, u0, u1, yk - 0.25, yk - 0.02, v0, v1); B('timber', u0, u1, yk - 0.02, yk, v0, v1); };
  // the stoop's two steps as obstacles to step onto (the ramp of the ground floor does not carry in the turned frame)
  C(0.15, 1.75, -0.6, 0.3, y - 0.4, y + 0.27); C(0.15, 1.75, -0.3, 0.3, y - 0.4, F);
  // ── the hall's first flight: each of its twelve treads an obstacle to step onto (as the ground stair is built in rooms.js) ──
  const sz1 = z0 + T + 0.2, sz0 = sz1 + 3.6;
  for (let k = 0; k < 12; k++) C(LANE1[0], LANE1[1], z1 - (sz0 - 3.6 * k / 12), z1 - (sz0 - 3.6 * (k + 1) / 12), F, F + (H1 - F - 0.15) * (k + 1) / 12);
  // ── the outer walls from the first floor to the roof: brick outside, plaster within; the front and the back with their windows ──
  const wallV = (ua, ub, inside) => { B(BR, inside > 0 ? ua : ua + 0.03, inside > 0 ? ub - 0.03 : ub, H1, top, 0, ext); B(SC, inside > 0 ? ub - 0.03 : ua, inside > 0 ? ub : ua + 0.03, H1, top, T, dE); C(ua, ub, 0, ext, H1, top); };
  wallV(0, T, 1); wallV(L - T, L, -1);
  const winsF = [1.2, 3.8, 6.4], deckU = [0.6 + (x0 + 1.75 - x0) , x1 - 0.4 - x0], door = 6.4;
  const wallH = (v0, v1, mIn, wins) => {
    const piece = (ya, yb, ua, ub) => { if (yb - ya < 1e-3 || ub - ua < 1e-3) return; const cv = mIn === 1 ? [v0, v1 - 0.03, v1 - 0.03, v1] : [v0 + 0.03, v1, v0, v0 + 0.03]; B(BR, ua, ub, ya, yb, cv[0], cv[1]); B(SC, ua, ub, ya, yb, cv[2], cv[3]); C(ua, ub, v0, v1, ya, yb); };
    LV.forEach((Fk, k) => {
      const yb = k === 0 ? H1 : LV[k - 1] + 2.6, hw = k === 3 ? 0.75 : 1.7, head = Fk + 0.9 + hw;
      let u = 0;
      for (const [c, sill] of wins) { const p = c - 0.55, q = c + 0.55; piece(yb, Fk + 0.9, u, p); piece(Fk + 0.9, head, u, p); piece(yb, Fk + sill, p, q); u = q; }
      piece(yb, Fk + 0.9, u, L); piece(Fk + 0.9, head, u, L);
      for (const [c, sill] of wins) {
        const p = c - 0.55, q = c + 0.55, vm = (v0 + v1) / 2;
        if (sill > 0.5) { B('glass_outer', p + 0.04, q - 0.04, Fk + sill + 0.05, head - 0.05, vm - 0.01, vm + 0.01); B('paint_white', c - 0.02, c + 0.02, Fk + sill + 0.05, head - 0.05, vm - 0.03, vm + 0.03); B('paint_white', p + 0.04, q - 0.04, Fk + 1.5, Fk + 1.54, vm - 0.03, vm + 0.03); }
      }
      void head;
    });
    piece(LV[3] + 0.9 + 0.75, top - 0.3, 0, L); piece(LV[3] + 2.6, LV[3] + 2.6, 0, L);
    // (the headers between floors: from the head of one floor's windows to the band of the next)
    for (let k = 0; k < 3; k++) piece(LV[k] + 2.6, LV[k + 1] + 0.0, 0, L);
  };
  // (the band of the next floor starts at the previous header: wallH's `yb`; the header pieces above fill 2.6 → floor, the slab edge)
  wallH(0, T, 1, winsF.map((c) => [c, c === door ? 0.4 : 0.9]));
  wallH(dE, ext, 0, [[5.1, 0.9]]);
  // ── the floors: boards and slabs over the flats, the hall's landings and the slabs under its flights ──
  const FLAT = [UF, L - T];
  LV.forEach((Fk, k) => { if (k > 0) slab(FLAT[0], FLAT[1], T, dE, Fk); else B('timber', FLAT[0], FLAT[1], Fk, Fk + 0.02, T, dE); slab(HALL[0], UF, 0.0, 0.0, Fk); Fl(FLAT[0], FLAT[1], T, dE, Fk + (k === 0 ? 0.02 : 0)); });
  // the front rooms span the hall's width in front of its south wall
  LV.forEach((Fk, k) => { if (k > 0) slab(T, UF, T, 6.1, Fk); else B('timber', T, UF, Fk, Fk + 0.02, T, 6.1); Fl(T, UF, T, 6.1, Fk + (k === 0 ? 0.02 : 0)); });
  // landings: north at floors 2 (lane 2 only: the first flight's top is in lane 1) and 4, south at 3 and 5, and the roof's
  const north = (Fk, full) => { const u0 = full ? HALL[0] : LANE2[0] - 0.1; if (Fk > H1) slab(u0, HALL[1], VN, dE, Fk); else B('timber', u0, HALL[1], Fk, Fk + 0.02, VN, dE); Fl(u0, HALL[1], VN, dE, Fk); };
  const south = (Fk) => { slab(HALL[0], HALL[1], 6.3, VS, Fk); Fl(HALL[0], HALL[1], 6.3, VS, Fk); };
  north(LV[0], false); south(LV[1]); north(LV[2], true); south(LV[3]); north(top, true);
  // the floor at each door, overlapping the landing's and the flat's, so that the 0.5 m strips of the turned frame leave no seam
  for (const [Fk, d] of [[LV[0], DOOR_N], [LV[1], DOOR_S], [LV[2], DOOR_N], [LV[3], DOOR_S], [top, DOOR_N]]) Fl(2.2, 3.8, d[0] - 0.1, d[1] + 0.05, Fk);
  // the slabs under the lanes where the next flight starts on them
  slab(HALL[0], LANE1[1] + 0.02, VS, VN, LV[1]); slab(LANE2[0] - 0.1, HALL[1], VS, VN, LV[2]); slab(HALL[0], LANE1[1] + 0.02, VS, VN, LV[3]);
  // ── the flights: 16 treads each, lane 2 from the north landing down to the south one at floors 2→3 and 4→5, lane 1 up to the north one at 3→4 and 5→roof ──
  const flights = [[LANE2, 'N', LV[0], LV[1]], [LANE1, 'S', LV[1], LV[2]], [LANE2, 'N', LV[2], LV[3]], [LANE1, 'S', LV[3], top]];
  for (const [lane, from, fa, fb] of flights) {
    const n = 16, dv = (VN - VS) / n, rise = (fb - fa) / n;
    for (let i = 0; i < n; i++) {
      const va = from === 'N' ? VN - (i + 1) * dv : VS + i * dv, vb = va + dv, topY = fa + rise * (i + 1);
      B('timber', lane[0], lane[1], fa, topY, va, vb); C(lane[0], lane[1], va, vb, fa, topY);
    }
    // the rail on the stair's open side (between the lanes), as an obstacle and a rod on balusters
    C(1.58, 1.7, VS, VN, fa, fb + 1.0);
    const u = 1.64; bag.add('wood_dark', rod(Pt(u, from === 'N' ? VN : VS, fa + 0.95), Pt(u, from === 'N' ? VS : VN, fb + 0.95), 0.03, 4));
    for (let i = 0; i <= 4; i++) { const v = VS + (VN - VS) * i / 4, t = from === 'N' ? (VN - v) / (VN - VS) : (v - VS) / (VN - VS); B('wood_dark', u - 0.02, u + 0.02, fa + (fb - fa) * t, fa + (fb - fa) * t + 0.95, v - 0.02, v + 0.02); }
  }
  // ── the hall's walls: the south wall and the east wall with their doors, plastered, up to the bulkhead's roof ──
  const hTop = top + 2.4;
  B(SC, T, HW[1], H1, hTop, 6.04, 6.16); C(T, HW[1], 6.04, 6.16, H1, hTop);
  {
    const wallE = (ya, yb, va, vb) => { if (yb - ya < 1e-3 || vb - va < 1e-3) return; B(SC, HW[0], HW[1], ya, yb, va, vb); C(HW[0], HW[1], va, vb, ya, yb); };
    // between the doors: full height; at the doors: below the lowest, and a lintel over each up to the next door above
    wallE(H1, hTop, 6.16, DOOR_S[0]); wallE(H1, hTop, DOOR_S[1], DOOR_N[0]); wallE(H1, hTop, DOOR_N[1], 11.9);
    for (const [d, lv] of [[DOOR_S, [H1, LV[1], LV[3]]], [DOOR_N, [LV[0], LV[2], top]]]) lv.forEach((f, i) => { if (i === 0 && f > H1 + 0.01) wallE(H1, f, d[0], d[1]); wallE(f + 2.1, i + 1 < lv.length ? lv[i + 1] : hTop, d[0], d[1]); });
    // the doors' leaves standing open against the wall inside the flats
    for (const [Fk, d] of [[LV[0], DOOR_N], [LV[1], DOOR_S], [LV[2], DOOR_N], [LV[3], DOOR_S]]) d === DOOR_N ? B('wood_painted', HW[1], HW[1] + 0.05, Fk, Fk + 2.05, d[0] - 0.75, d[0] + 0.05) : B('wood_painted', HW[1], HW[1] + 0.05, Fk, Fk + 2.05, d[1] - 0.05, d[1] + 0.8);
  }
  // ── the partitions of the flats, each floor: the line of doors at u = DU ──
  LV.forEach((Fk, k) => {
    const ceil = k === 3 ? top - 0.3 : LV[k + 1] - 0.25;
    for (const v of [3.9, 6.1, 9.4]) {
      const ua = v === 6.1 || v === 9.4 ? UF : T;
      for (const [p, q, lint] of [[ua, DU - DW / 2, 0], [DU + DW / 2, L - T, 0]]) { B(SC, p, q, Fk, ceil, v - 0.06, v + 0.06); C(p, q, v - 0.06, v + 0.06, Fk, ceil); }
      B(SC, DU - DW / 2, DU + DW / 2, Fk + 2.1, ceil, v - 0.06, v + 0.06); B('wood_painted', DU + DW / 2 - 0.02, DU + DW / 2 + 0.02, Fk, Fk + 2.05, v - 0.06, v + 0.5);
    }
    B(PL, UF, L - T, ceil - 0.03, ceil, T, dE); B(PL, T, UF, ceil - 0.03, ceil, T, 6.1);
    // the furnishing: the railroad flat's rooms
    const G = { B, C, bag, col, Pt, r: rnd, pk, ext, S: ceil - Fk + 0.25 }, types = k >= 2 ? ['room', 'room', 'kitchen', 'room'] : ROOMS.map((q) => q[0]);
    ROOMS.forEach(([t, v0, v1], i) => furnish(G, { type: types[i], u0: i < 2 ? T : UF + 0.9, u1: L - T, v0: v0 + 0.06, v1: v1 - 0.06, door: 'v1', du: i < 2 ? DU : 4.7, win: i === 0 ? 'front' : null }, Fk, 'flat'));
    lights.push({ at: Pt(5.0, 5.0, Fk + 2.4), color: '#ffd29a', intensity: 1.5, distance: 8 });
  });
  // ── the fire escape's decks on the front as floors, their rails as obstacles ──
  for (let yy = H1 + 0.1; yy < top - 1.5; yy += 3.0) {
    Fl(deckU[0], deckU[1], -0.94, -0.02, yy);
    C(deckU[0], deckU[1], -1.0, -0.94, yy, yy + 0.95); C(deckU[0], deckU[0] + 0.06, -1.0, -0.02, yy, yy + 0.95); C(deckU[1] - 0.06, deckU[1], -1.0, -0.02, yy, yy + 0.95);
  }
  // ── the roof: the slab with the hall's hole, the tar, the parapet, the bulkhead, the tank, the coop ──
  const roofP = [[0, L, 0, 6.1], [HW[0], L, 6.1, dE], [0, T, 6.1, dE], [0, L, dE, ext]];
  for (const [ua, ub, va, vb] of roofP) { B(BR, ua, ub, top - 0.3, top, va, vb); B('tar_wood', ua, ub, top, top + 0.03, va, vb); }
  Fl(UF, L - T, T, dE, top); Fl(T, UF, T, 6.1, top);
  B(PL, UF, L - T, top - 0.33, top - 0.3, 0.3, dE);
  const par = (ua, ub, va, vb) => { B(BR, ua, ub, top + 0.03, top + 0.95, va, vb); C(ua, ub, va, vb, top, top + 0.95); };
  par(L - 0.25, L, 0, ext); par(0, L, 0.0, 0.25); par(0, 0.25, 0, 6.0); par(0, L, ext - 0.25, ext); par(UF, UF + 0.0, 0, 0);
  // the bulkhead over the stair: walls to 2.4 m, a roof, a door at the north landing
  B(BR, 0, HW[1], top, hTop, 5.9, 6.2); C(0, HW[1], 5.9, 6.2, top, hTop);
  B(BR, 0, T, top, hTop, 5.9, ext); C(0, T, 5.9, ext, top, hTop);
  B(BR, HW[0], HW[1] + 0.1, top, hTop, 5.9, DOOR_N[0]); C(HW[0], HW[1] + 0.1, 5.9, DOOR_N[0], top, hTop); B(BR, HW[0], HW[1] + 0.1, top + 2.1, hTop, DOOR_N[0], DOOR_N[1] + 0.05); B(BR, HW[0], HW[1] + 0.1, top, hTop, DOOR_N[1] + 0.05, ext); C(HW[0], HW[1] + 0.1, DOOR_N[1] + 0.05, ext, top, hTop);
  B(BR, 0, HW[1] + 0.1, hTop, hTop + 0.12, 5.8, ext); B('tar_wood', -0.05, HW[1] + 0.15, hTop + 0.12, hTop + 0.15, 5.75, ext + 0.05);
  // the water tank on its stilts (a wooden tub hooped with iron, its conical lid) and the pigeon coop: a lathed box on legs, wire front, a perch, a ramp
  const tu = 5.3, tv = 8.6, [tx, , tz] = Pt(tu, tv, top);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { B('iron', tu + a * 1.0 - 0.08, tu + a * 1.0 + 0.08, top, top + 2.6, tv + b * 1.0 - 0.08, tv + b * 1.0 + 0.08); }
  C(tu - 1.1, tu + 1.1, tv - 1.1, tv + 1.1, top, top + 0.3);
  B('timber', tu - 1.3, tu + 1.3, top + 2.6, top + 2.8, tv - 1.3, tv + 1.3);
  bag.add('wood_dark', lathe([[1.15, 0], [1.2, 1.6], [1.15, 2.6], [1.0, 2.62], [0.001, 2.62]], 14, null, tx, top + 2.8, tz));
  for (const hy of [0.4, 1.3, 2.2]) bag.add('iron', lathe([[1.2, 0], [1.2, 0.06], [1.12, 0.06]], 14, null, tx, top + 2.8 + hy, tz));
  bag.add('tar_wood', lathe([[1.3, 2.6], [1.3, 2.68], [0.2, 3.4], [0.001, 3.45]], 14, null, tx, top + 2.8, tz));
  const cu = 3.9, cv = 1.6;
  for (const [a, b] of [[0, 0], [1.6, 0], [0, 1.0], [1.6, 1.0]]) B('wood_dark', cu + a - 0.05, cu + a + 0.05, top + 0.03, top + 0.7, cv + b - 0.05, cv + b + 0.05);
  B('wood_painted', cu - 0.05, cu + 1.65, top + 0.7, top + 0.78, cv - 0.05, cv + 1.05); B('wood_painted', cu - 0.05, cu + 1.65, top + 0.78, top + 1.6, cv - 0.05, cv, 0); B('wood_painted', cu - 0.05, cu + 1.65, top + 0.78, top + 1.6, cv + 1.0, cv + 1.05);
  B('wood_painted', cu - 0.05, cu, top + 0.78, top + 1.6, cv, cv + 1.0); B('wood_painted', cu + 1.6, cu + 1.65, top + 0.78, top + 1.6, cv, cv + 1.0); B('tar_wood', cu - 0.15, cu + 1.75, top + 1.6, top + 1.7, cv - 0.15, cv + 1.15);
  for (let k = 0; k < 14; k++) B('iron', cu + 0.1 + k * 0.1, cu + 0.115 + k * 0.1, top + 0.8, top + 1.58, cv + 1.05, cv + 1.065);
  for (const v of [0.25, 0.6]) B('wood_dark', cu + 0.1, cu + 1.5, top + 1.05 + v * 0.3, top + 1.09 + v * 0.3, cv + v * 0.9, cv + v * 0.9 + 0.04);
  C(cu - 0.1, cu + 1.7, cv - 0.1, cv + 1.1, top, top + 1.7);
  lights.push({ at: Pt(1.5, 9.0, top + 1.6), color: '#ffd29a', intensity: 1.0, distance: 6 });
}

/** The walk-up's routes (local u, v): the street, the hall, up to the third floor's kitchen; and on to the roof. Returns a list of points as [u, v] with the frame's mapping. */
export function tenementRoute(el) {
  const [x0, z0, x1, z1] = el.rect, Fc = face(el.rect, 's'), pt = (u, v) => { const p = Fc.P(u, -v, 0); return [p[0], p[2]]; };
  const A = [[0.95, -1.6], [0.95, 0.6], [0.95, 2.0], [0.95, 7.6], [0.95, 8.4], [0.95, 11.4], [2.2, 11.4], [2.2, 7.5], [2.2, 6.7], [2.65, 6.75], [4.2, 7.7], [5.1, 7.7],
    [2.65, 6.75], [2.2, 6.7], [0.95, 6.9], [0.95, 10.8], [1.3, 11.4], [2.2, 11.4], [2.2, 7.5], [1.3, 6.7], [0.95, 7.0], [0.95, 10.8], [1.4, 11.4], [2.9, 11.4], [4.0, 11.0], [3.4, 5.0], [6.5, 4.5]];
  return { y0: el.y ?? 0, pts: A.map(([u, v]) => pt(u, v)), x0, z0, x1, z1 };
}
