// The upper floors of a Gründerzeit tenement that can be climbed (docs/settlements/vienna.md §14): the Hausflur behind the Haustor with
// the stone stair rising round its narrow well (two flights to a half landing at the back, two more to the next floor, treads of granite,
// the iron balustrade with its wooden handrail on the well side), the flats it serves — the first floor's by the use of the house (the
// bourgeois flat with anteroom, salon with tiled stove, dining room and bedroom; the coffee house's billiard and card room; the
// craftsman's workroom with his dwelling behind; the inn's rooms along a corridor), the second floor's Zimmer-Küche of a worker's
// family with the Bassena (the common tap and basin) on the landing — and, on the yard side, the Pawlatschen gallery the kitchen opens
// on. Built in the house's own front frame (u along the front, v up, d outward; the house at d < 0) with the hall at one side: the
// local coordinate `s` runs from the hall's outer wall across the house, so that the plan serves a hall on either hand.
import { subtractRects } from '../../core/build.js';
import { frustum } from '../../core/geom.js';
import { fbox, bar } from '../dutch/facade.js';
import { wallHoles } from '../dutch/reveal.js';
import { rng } from './detail.js';
import { furnish } from './upfurn.js';

const INST = new Set(['opening', 'wood_dark', 'cloth_green', 'cloth_red', 'sandstone_white', 'iron', 'paint_white', 'stucco_pale', 'cloth_white']);
const MAPI = {
  granite_grey: 'sandstone_white', limestone: 'sandstone_white', marble: 'sandstone_white', gold: 'sandstone_white', gilt_bronze: 'sandstone_white', plaster_white: 'stucco_pale',
  wood_ochre: 'wood_dark', wood_painted: 'wood_dark', hide_brown: 'wood_dark', cloth_brown: 'wood_dark', bark_dark: 'wood_dark', lacquer_black: 'wood_dark', paint_ochre: 'wood_dark',
  cloth_maroon: 'cloth_red', cloth_blue: 'cloth_green', cloth_ochre: 'cloth_red', glaze_white: 'paint_white', glaze_green: 'cloth_green', linen: 'cloth_white', lamp_white: 'paint_white',
  steel_grey: 'iron', mirror_tin: 'opening', cotto_floor: 'stucco_pale',
};
export const WALL = 0.5, PART = 0.3, WELL = 0.3, LAND = 1.3, LRUN = 3.48, PT = 0.15, DOOR_H = 2.5;

/** What the lot's width allows: the bay count and width as the facade has them, the hall's inner edge `hi`, and whether the plan fits. */
export function upGeometry(W, D = 15, kind = 'gruender') {
  const bays = Math.max(2, Math.round(W / (kind === 'ring' ? 3.8 : 3.3))), bw = W / bays, hi = bw - 0.15;
  return { bays, bw, hi, ok: hi - WALL >= 2.3 && W - hi - PART - WALL >= 5.5 && D >= 14.5 };
}

/**
 * upHouse(ctx, F, y, o): the hall from the street up to the second floor, the shell of the first two upper floors, their slabs, rooms,
 * furniture and lights. o = { W, D, G (ground floor height), floors, H, mat, left (the hall at the u = 0 end), hi, kind ('bourg' | 'cafe'
 * | 'craft' | 'inn'), seed, windows (the facade's openings: { s, u, v0, hh, ww, door }), balcony ({ u, ww }), gallery (the yard side has
 * its Pawlatschen), rear (rear windows: { u (on the rear frame), s, v0, w, h }), lod }.
 */
export function upHouse(ctx, F, y, o) {
  const { bag, col, lights } = ctx, { W, D, G, floors, H, mat, left, hi } = o, r = rng(o.seed * 61 + 11);
  const ex = (a, b) => (a < b ? [a, b] : [b, a]);
  const U = (s0, s1) => (left ? [s0, s1] : [W - s1, W - s0]);
  const tap = (m, u0, u1, v0, v1, d0, d1) => {
    const a = F.at(u0, d0), b = F.at(u1, d1), x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]), e = Math.min(0.0006, (x1 - x0) / 3, (z1 - z0) / 3);
    bag.add(m, frustum([x0, z0, x1, z1], y + Math.min(v0, v1), y + Math.max(v0, v1), e, e, e, e));
  };
  const A = (m, u0, u1, v0, v1, d0, d1) => tap(m, u0, u1, v0, v1, d0, d1);                                // plain front-frame boxes
  const rectU = (u0, u1, d0, d1) => { const a = F.at(u0, d0), b = F.at(u1, d1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const CU = (u0, u1, d0, d1, v0, v1) => col.rect(rectU(u0, u1, d0, d1), y + v0, y + v1);
  const X = (m, s0, s1, v0, v1, d0, d1) => {
    [s0, s1] = ex(s0, s1); [v0, v1] = ex(v0, v1); [d0, d1] = ex(d0, d1);
    if (s1 - s0 < 1e-4 || v1 - v0 < 1e-4 || d1 - d0 < 1e-4) return;
    const [u0, u1] = U(s0, s1);
    // (the viewer gathers the axis-aligned boxes of one material in a tile into one stretched, instanced draw: new materials among a room's
    // furnishing would add draws to the arrival frame. The interior is therefore drawn in the materials every tile already instances (INST),
    // each of the kit's other materials standing for the nearest of them; a box of any other (the house's own tint) is made with a
    // hair's taper at the top, which merges it into the tile's mesh of that material instead)
    m = MAPI[m] ?? m;
    if (INST.has(m)) bag.add(m, fbox(F, y, u0, u1, v0, v1, d0, d1)); else tap(m, u0, u1, v0, v1, d0, d1);
  };
  const rectOf = (s0, s1, d0, d1) => { const [a, b] = ex(s0, s1), [u0, u1] = U(a, b); return rectU(u0, u1, d0, d1); };
  const C = (s0, s1, d0, d1, v0, v1) => col.rect(rectOf(s0, s1, d0, d1), y + v0, y + v1);
  const FLR = (s0, s1, d0, d1, v) => col.floor(rectOf(s0, s1, d0, d1), y + v);
  const XC = (m, s0, s1, v0, v1, d0, d1) => { X(m, s0, s1, v0, v1, d0, d1); C(s0, s1, d0, d1, v0, v1); };
  const Pw = (s, d) => F.at(left ? s : W - s, d);
  const dv = (() => { const p = F.at(0, 0), q = F.at(0, 1); return [q[0] - p[0], q[1] - p[1]]; })();
  const dirOf = (sg) => { const a = [dv[0] * sg, dv[1] * sg]; return Math.abs(a[0]) > Math.abs(a[1]) ? (a[0] > 0 ? 'e' : 'w') : (a[1] > 0 ? 's' : 'n'); };
  const P3 = (s, v, d) => { const [x, z] = Pw(s, d); return [x, y + v, z]; };
  const light = (s, v, d, c = '#ffd9a0', i = 6, dist = 11) => { const [x, z] = Pw(s, d); lights?.push({ at: [x, y + v, z], color: c, intensity: i, distance: dist }); };

  const dRear = -D + WALL, dMid = dRear + LAND, dFront = dMid + LRUN, dFr = -WALL;                  // the hall's stair zone: rear wall, half landing, the flights' foot
  const FL = [0.12, G + 0.1, floors[2] + 0.1], CEIL2 = floors[3] - 0.14, V3 = floors[3], db = -8.5;
  const S0 = hi + PART, S1 = W - WALL, FW = S1 - S0;
  const lanes = [];                                                                                // the door lanes: furniture keeps out of them
  const clear = (s0, s1, d0, d1) => { const [a, b] = ex(s0, s1), [c, e] = ex(d0, d1); return !lanes.some((l) => !(b <= l[0] || a >= l[2] || e <= l[1] || c >= l[3])); };
  const fl2 = (k) => FL[k];

  // ── the shell: party walls, rear wall and front wall up to the third floor, the ground floor's hall walls, the third floor solid
  XC(mat, 0, WALL, -0.6, G, -D, 0); XC(mat, WALL, hi, -0.6, G, -D, -D + WALL);                      // the hall's outer wall and rear wall, ground floor
  A(mat, 0, WALL, G, V3, -D, 0); CU(0, WALL, -D, 0, G, V3); A(mat, W - WALL, W, G, V3, -D, 0); CU(W - WALL, W, -D, 0, G, V3);
  const rearHoles = [];
  const gallery = !!o.gallery;
  const kammerS = S0 + FW * 0.5, doorU = left ? kammerS : W - kammerS;
  if (gallery) lanes.push([kammerS - 0.8, dRear, kammerS + 0.8, dRear + 1.5]);
  if (gallery) rearHoles.push({ u0: doorU - 0.5, u1: doorU + 0.5, v0: FL[2], v1: FL[2] + 2.15 });
  wallHoles((ua, ub, va, vb) => { A(mat, ua, ub, va, vb, -D, -D + WALL); CU(ua, ub, -D, -D + WALL, va, vb); }, WALL, W - WALL, G, V3, rearHoles);
  const holes = (o.windows || []).map((w) => ({ u0: w.u - w.ww / 2, u1: w.u + w.ww / 2, v0: w.v0, v1: w.v0 + w.hh, door: w.door }));
  holes.sort((a, b) => a.u0 - b.u0 || a.v0 - b.v0);
  wallHoles((ua, ub, va, vb) => { A(mat, ua, ub, va, vb, -WALL, 0); CU(ua, ub, -WALL, 0, va, vb); }, WALL, W - WALL, G, V3, holes);
  // the third floor and what stands over it, solid: its underside is the ceiling of the second floor
  X('plaster_white', WALL, W - WALL, CEIL2, V3, dRear, dFr);
  A(mat, 0, W, V3, H, -D, 0); CU(0, W, -D, 0, V3, H);

  // ── the ground floor of the hall: the Haustor, flagged floor, letter boxes, the lamp
  const hc = (WALL + hi) / 2, gw = 0.82, GH = 3.0, JW = 0.22;
  X('granite_grey', WALL, hi, 0, FL[0], dRear, dFr); FLR(WALL, hi, dRear, dFr, FL[0]);
  XC(mat, WALL, hc - gw - JW, -0.6, G, -WALL, 0); XC(mat, hc + gw + JW, hi, -0.6, G, -WALL, 0); XC(mat, hc - gw - JW, hc + gw + JW, GH + 0.25, G, -WALL, 0);
  for (const s of [hc - gw - JW, hc + gw]) X('limestone', s, s + JW, 0, GH + 0.1, -WALL - 0.02, 0.14);                 // the stone jambs
  X('limestone', hc - gw - JW - 0.08, hc + gw + JW + 0.08, GH + 0.1, GH + 0.45, -WALL - 0.02, 0.2); X('limestone', hc - 0.28, hc + 0.28, GH - 0.1, GH + 0.45, -WALL - 0.02, 0.26);
  X('limestone', hc - gw - 0.1, hc + gw + 0.1, 0, 0.1, -WALL, 0.34); FLR(hc - gw, hc + gw, -WALL, 0.3, 0.1);
  X('wood_dark', hc - gw, hc - gw + 0.07, 0, GH, -0.5, -0.1); X('wood_dark', hc - gw, hc - gw + 0.07, 0.0, GH, -0.1, 0.0);  // the leaf, thrown back
  X('wood_dark', WALL, WALL + 0.05, 0, 1.4, dRear, dFr);
  for (const k of [0, 1, 2, 3, 4, 5]) X(k % 3 ? 'wood_painted' : 'iron', hi - 0.06, hi, 1.3 + (k >> 2) * 0.24, 1.5 + (k >> 2) * 0.24, -5.2 + (k & 3) * 0.32, -4.96 + (k & 3) * 0.32);
  X('iron', hi - 0.05, hi, 2.0, 2.45, -4.4, -2.7); X('paint_white', hi - 0.07, hi - 0.05, 2.08, 2.37, -4.3, -2.8);
  X('iron', hi - 0.3, hi, 2.5, 2.55, -2.2, -2.14); X('lamp_white', hi - 0.42, hi - 0.22, 2.2, 2.5, -2.28, -2.08);
  light(hi - 0.4, 2.9, -2.1, '#ffd08a', 5, 10);

  // ── the stair: two storeys, each of two flights round the well, the second flight ending at the hole's front edge
  const HI = hi - WALL, sw = (HI - WELL) / 2, Ls = [WALL, WALL + sw], Ws = [WALL + sw, WALL + sw + WELL], Rs = [WALL + sw + WELL, hi];
  const stairs = (k) => {
    const vA = FL[k], vB = FL[k + 1], vM = (vA + vB) / 2, nr = Math.round((vB - vA) / 2 / 0.18), rs = (vM - vA) / nr, tr = LRUN / (nr - 1);
    const flight = (sa, sb, wellSide, dFoot, dTop, v0, v1) => {
      const up = Math.sign(dTop - dFoot), L = Math.abs(dTop - dFoot), m = rs / tr;
      for (let i = 1; i <= nr - 1; i++) {
        const da = dFoot + up * (i - 1) * tr, db2 = dFoot + up * i * tr, top = v0 + i * rs, bot = Math.max(0, top - 0.32), lo = Math.min(da, db2), hi2 = Math.max(da, db2);
        X('granite_grey', sa, sb, bot, top - 0.04, lo, hi2);
        X('limestone', sa, sb, top - 0.04, top, lo - (up > 0 ? 0.04 : 0), hi2 + (up < 0 ? 0.04 : 0));
        if (!o.lod || i % 2) X('iron', wellSide - 0.012 + (wellSide === sa ? 0.05 : -0.05), wellSide + 0.012 + (wellSide === sa ? 0.05 : -0.05), top, top + 0.9, (da + db2) / 2 - 0.012, (da + db2) / 2 + 0.012);
      }
      const e = 0.45, y0 = v0 + rs / 2, y1 = v1 - rs / 2, ws = wellSide + (wellSide === sa ? 0.05 : -0.05);
      col.ramp(rectOf(sa, sb, Math.min(dFoot - up * e, dTop), Math.max(dFoot - up * e, dTop)), y + y0 - m * e, y + y1, dirOf(up));
      bag.add('wood_dark', bar(P3(ws, y0 + 0.95, dFoot), P3(ws, y1 + 0.95, dTop), 0.05, 0.045));                                  // the handrail
      for (const [d, v] of [[dFoot, v0], [dTop, v1]]) X('iron', ws - 0.035, ws + 0.035, v - 0.1, v + 1.0, d - 0.035, d + 0.035);   // the newels
    };
    flight(Ls[0], Ls[1], Ls[1], dFront, dMid, vA, vM);
    flight(Rs[0], Rs[1], Rs[0], dMid, dFront, vM, vB);
    X('granite_grey', WALL, hi, vM - 0.25, vM, dRear, dMid); FLR(WALL, hi, dRear, dMid, vM);                                      // the half landing
    C(Ws[0] + 0.05, Ws[1] - 0.05, dMid, dFront, vA, vB + 1.05);                                                                   // the well
    // the stair window on the half landing, a tall frame with its dark glass on the rear wall
    const wc = (WALL + hi) / 2;
    X('paint_white', wc - 0.62, wc + 0.62, vM + 0.3, vM + 2.3, dRear, dRear + 0.04); X('opening', wc - 0.52, wc + 0.52, vM + 0.4, vM + 2.2, dRear + 0.04, dRear + 0.06);
    X('paint_white', wc - 0.04, wc + 0.04, vM + 0.4, vM + 2.2, dRear + 0.06, dRear + 0.09); X('paint_white', wc - 0.52, wc + 0.52, vM + 1.4, vM + 1.46, dRear + 0.06, dRear + 0.09);
  };
  stairs(0); stairs(1);

  // ── the slabs: plaster underside, a hole over the stair's well (the flights come up through it), a hall landing of stone
  const shopCut = [hi + WALL, db, W - WALL, dFr];
  const slab = (k, hole) => {
    const fk = k === 1 ? G : floors[2];
    const cells = subtractRects([WALL, dRear, W - WALL, dFr], hole ? [[WALL, dRear, hi, dFront]] : []);
    for (const c of cells) {
      FLR(c[0], c[2], c[1], c[3], fk + 0.1);
      for (const q of k === 1 ? subtractRects(c, [shopCut]) : [c]) X('plaster_white', q[0], q[2], fk - 0.14, fk, q[1], q[3]);
    }
    X('granite_grey', WALL, hi, fk, fk + 0.1, dFront, dFr);
    // the hall's walls on this floor: a painted dado, the lamp
    X('paint_ochre', WALL, WALL + 0.04, fk + 0.1, fk + 1.5, dRear, dFr); X('paint_ochre', hi - 0.04, hi, fk + 0.1, fk + 1.5, dFront, dFr);
    light(hi - 0.4, fk + 2.9, -2.1, '#ffd08a', 5, 10);
    X('iron', hi - 0.3, hi, fk + 2.5, fk + 2.55, -2.2, -2.14); X('lamp_white', hi - 0.42, hi - 0.22, fk + 2.2, fk + 2.5, -2.28, -2.08);
  };
  slab(1, true); slab(2, true);

  // ── walls inside: partitions with door holes (lanes kept clear of furniture), the hall's own wall with the flat's door
  const doorFrame = (alongS, a0, a1, c, w, fk) => {
    const V = fk + 0.1, t0 = alongS ? a0 - 0.03 : a0 - 0.03, t1 = alongS ? a1 + 0.03 : a1 + 0.03;
    const J = (c0, c1, v0, v1) => (alongS ? X('paint_white', c0, c1, v0, v1, t0, t1) : X('paint_white', t0, t1, v0, v1, c0, c1));
    J(c - w / 2, c - w / 2 + 0.08, V, V + DOOR_H - 0.1); J(c + w / 2 - 0.08, c + w / 2, V, V + DOOR_H - 0.1); J(c - w / 2, c + w / 2, V + DOOR_H - 0.1, V + DOOR_H);
  };
  // a wall running along s at depth d0..d1, from s0 to s1; doors { c, w } on s
  const wallD = (fk, d0, d1, s0, s1, doors, m = 'plaster_white') => {
    const hs = doors.map((q) => ({ u0: q.c - q.w / 2, u1: q.c + q.w / 2, v0: fk + 0.1, v1: fk + 0.1 + DOOR_H }));
    wallHoles((a, b, va, vb) => XC(m, a, b, va, vb, d0, d1), s0, s1, fk, floors[k2(fk)] - 0.14, hs);
    for (const q of doors) { doorFrame(true, d0, d1, q.c, q.w, fk); lanes.push([q.c - q.w / 2 - 0.15, d0 - 0.9, q.c + q.w / 2 + 0.15, d1 + 0.9]); }
  };
  const wallS = (fk, s0, s1, d0, d1, doors, m = 'plaster_white') => {
    const hs = doors.map((q) => ({ u0: q.c - q.w / 2, u1: q.c + q.w / 2, v0: fk + 0.1, v1: fk + 0.1 + DOOR_H }));
    wallHoles((a, b, va, vb) => XC(m, s0, s1, va, vb, a, b), d0, d1, fk, floors[k2(fk)] - 0.14, hs);
    for (const q of doors) { doorFrame(false, s0, s1, q.c, q.w, fk); lanes.push([s0 - 0.9, q.c - q.w / 2 - 0.15, s1 + 0.9, q.c + q.w / 2 + 0.15]); }
  };
  const k2 = (fk) => (fk === G ? 2 : 3);
  void fl2;

  // ── the rooms of each floor by the use of the house
  const rooms = [];
  const room = (k, type, s0, s1, d0, d1, o2 = {}) => { const R = { k, type, s0, s1, dR: Math.min(d0, d1), dF: Math.max(d0, d1), V: FL[k], ...o2 }; rooms.push(R); return R; };
  const hallDoor = (fk) => wallS(fk, hi, hi + PART, dRear, dFr, [{ c: -7.9, w: 1.1 }]);
  const kind = o.kind;
  {
    // floor 1
    const fk = G;
    hallDoor(fk);
    if (kind === 'bourg') {
      const dA = -5.5, dB = -9.6;
      const wv = S0 + 2.3;
      wallD(fk, dA - PT, dA, S0, S1, [{ c: S0 + 1.15, w: 1.0 }, { c: S0 + 3.65, w: 1.5 }]);
      wallS(fk, wv, wv + PT, dB, dA - PT, [{ c: -7.7, w: 1.0 }]);
      wallD(fk, dB - PT, dB, S0, S1, [{ c: S0 + 3.35, w: 1.0 }]);
      room(1, 'salon', S0, S1, dA, dFr); room(1, 'vorz', S0, wv, dB, dA - PT); room(1, 'speise', wv + PT, S1, dB, dA - PT); room(1, 'schlaf', S0, S1, dRear, dB - PT);
    } else if (kind === 'cafe') {
      const dB = -9.6;
      wallD(fk, dB - PT, dB, S0, S1, [{ c: S0 + 1.2, w: 1.0 }]);
      room(1, 'billard', S0, S1, dB, dFr); room(1, 'buffet', S0, S1, dRear, dB - PT);
    } else if (kind === 'craft') {
      const dA = -6.1, dB = -10.4;
      wallD(fk, dA - PT, dA, S0, S1, [{ c: S0 + 1.2, w: 1.0 }]);
      wallD(fk, dB - PT, dB, S0, S1, [{ c: S0 + 1.2, w: 1.0 }]);
      room(1, 'werkstatt', S0, S1, dA, dFr); room(1, 'wohnkueche', S0, S1, dB, dA - PT); room(1, 'kammer', S0, S1, dRear, dB - PT);
    } else {
      const cs = S0 + 1.6, d1 = -4.9, d2 = -9.7;
      wallS(fk, cs, cs + PT, dRear, dFr, [{ c: -2.7, w: 0.95 }, { c: -7.4, w: 0.95 }, { c: -12.2, w: 0.95 }]);
      wallD(fk, d1 - PT, d1, cs + PT, S1, []); wallD(fk, d2 - PT, d2, cs + PT, S1, []);
      room(1, 'gast', cs + PT, S1, d1, dFr); room(1, 'gast', cs + PT, S1, d2, d1 - PT, { alt: 1 }); room(1, 'gast', cs + PT, S1, dRear, d2 - PT, { alt: 2 });
      room(1, 'gang', S0, cs, dRear, dFr);
    }
  }
  {
    // floor 2: the worker's Zimmer-Küche
    const fk = floors[2], dA = -5.6, dB = -9.6, kw = S0 + Math.min(3.6, FW - 1.9);
    hallDoor(fk);
    wallD(fk, dA - PT, dA, S0, S1, [{ c: S0 + 1.2, w: 1.0 }]);
    wallS(fk, kw, kw + PT, dB, dA - PT, [{ c: -7.7, w: 0.9 }]);
    wallD(fk, dB - PT, dB, S0, S1, [{ c: S0 + 1.2, w: 1.0 }]);
    room(2, 'zimmer', S0, S1, dA, dFr); room(2, 'kueche', S0, kw, dB, dA - PT); room(2, 'kabinett', kw + PT, S1, dB, dA - PT); room(2, 'kammer2', S0, S1, dRear, dB - PT, { gallery });
    // the Bassena on the landing: a cast-iron basin on its bracket with the brass tap, a pail under it
    const V = FL[2], bs = hi - 0.06;
    X('iron', bs - 0.3, bs + 0.06, V + 0.85, V + 0.93, -6.9, -6.3); X('iron', bs - 0.28, bs, V + 0.93, V + 1.0, -6.88, -6.32); X('gilt_bronze', bs - 0.1, bs - 0.06, V + 1.0, V + 1.3, -6.62, -6.58);
    X('gilt_bronze', bs - 0.22, bs - 0.06, V + 1.26, V + 1.3, -6.62, -6.58); X('iron', bs - 0.05, bs + 0.0, V + 0.5, V + 0.85, -6.8, -6.4);
    X('steel_grey', bs - 0.36, bs - 0.08, V, V + 0.3, -6.7, -6.46);
    C(bs - 0.36, bs, -6.9, -6.3, V, V + 1.3);
  }

  // ── floors of the rooms: boards, tile or stone by use; the windows' casings and curtains inside; the rear windows painted
  const floorMat = { vorz: 'granite_grey', kueche: 'granite_grey', buffet: 'granite_grey', kammer2: 'granite_grey', wohnkueche: 'granite_grey' };
  for (const R of rooms) X(floorMat[R.type] ?? 'wood_ochre', R.s0, R.s1, R.V, R.V + 0.1, R.dR, R.dF);
  const sOf = (u) => (left ? u : W - u);
  for (const w of o.windows || []) {
    const a = sOf(w.u - w.ww / 2), b = sOf(w.u + w.ww / 2), s0 = Math.min(a, b), s1 = Math.max(a, b), v1 = w.v0 + w.hh;
    if (!w.door) X('wood_dark', s0 - 0.04, s1 + 0.04, w.v0 - 0.05, w.v0, -0.62, -0.28);                    // the window board
    X('paint_white', s0 - 0.07, s0, w.v0 - 0.05, v1 + 0.08, -0.55, -0.5); X('paint_white', s1, s1 + 0.07, w.v0 - 0.05, v1 + 0.08, -0.55, -0.5); X('paint_white', s0 - 0.07, s1 + 0.07, v1, v1 + 0.08, -0.55, -0.5);
    if (!o.lod && w.s <= 2) {
      const cm = ['cloth_maroon', 'cloth_green', 'cloth_blue', 'cloth_ochre'][Math.floor(r() * 4)];
      X(cm, s0 - 0.1, s0 + 0.28, w.v0 + (w.door ? 0.0 : 0.1), v1 - 0.05, -0.68, -0.56); X(cm, s1 - 0.28, s1 + 0.1, w.v0 + (w.door ? 0.0 : 0.1), v1 - 0.05, -0.68, -0.56); X(cm, s0 - 0.1, s1 + 0.1, v1 - 0.28, v1 - 0.05, -0.68, -0.56);
      lanes.push([s0 - 0.1, -0.7, s1 + 0.1, -0.5]);
    }
  }
  for (const w of o.rear || []) {
    const s = sOf(w.u), v0 = floors[w.s] + 0.9, hw = w.w / 2;
    if (w.s < 1 || w.s > 2 || s - hw < WALL + 0.1 || s + hw > W - WALL - 0.1) continue;
    if (s > WALL && s < hi + 0.1) { /* the stair's own window is above */ }
    if (gallery && w.s === 2 && Math.abs(s - kammerS) < 1.2) continue;
    X('wood_dark', s - hw, s + hw, v0, v0 + w.h, dRear, dRear + 0.05); X('opening', s - hw + 0.07, s + hw - 0.07, v0 + 0.07, v0 + w.h - 0.07, dRear + 0.05, dRear + 0.065);
    X('paint_white', s - 0.025, s + 0.025, v0 + 0.07, v0 + w.h - 0.07, dRear + 0.065, dRear + 0.09);
  }

  // ── the balcony: its floor and the rail stopped by colliders; the doorway's threshold across the wall
  for (const w of o.windows || []) {
    if (!w.door) continue;
    const u0 = w.u - w.ww / 2, u1 = w.u + w.ww / 2, bu0 = w.u - (w.ww + 0.9) / 2, bu1 = w.u + (w.ww + 0.9) / 2, v = G + 0.1;
    col.floor(rectU(u0, u1, -WALL, 0), y + v); col.floor(rectU(bu0, bu1, 0, 0.6), y + v);
    CU(bu0, bu1, 0.55, 0.62, v, v + 1.0); CU(bu0, bu0 + 0.05, 0, 0.62, v, v + 1.0); CU(bu1 - 0.05, bu1, 0, 0.62, v, v + 1.0);
  }
  // the gallery on the yard side: its boards walked on, its rail stopped
  if (gallery) {
    const v = floors[2] - 0.05;
    col.floor(rectU(0, W, -D - 1.5, -D), y + v);
    CU(0, W, -D - 1.5, -D - 1.44, v, v + 1.05); CU(0, 0.06, -D - 1.5, -D, v, v + 1.05); CU(W - 0.06, W, -D - 1.5, -D, v, v + 1.05);
  }

  furnish({ X, C, FLR, XC, rooms, clear, lanes, lights, light, hi, S0, S1, FW, W, D, G, floors, FL, CEIL2, r, kind, left, windows: o.windows || [], sOf, P3, Pw, ctx, y, F, lod: o.lod, gallery, bs: hi, dFr, dRear });
}
