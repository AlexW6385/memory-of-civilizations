// The upper storeys of the enterable houses of Lisbon about 1520 (docs/settlements/manueline-lisbon.md §12): a timber stair of straight
// flights up the left wall, one over the other, from the hall to every floor and on to the roof; floors of boards on joists with the
// stair's well kept open and railed; a partition with a door across each floor; the street windows left open; a balcony on the street
// that can be stepped onto; the rooms furnished by use (counting room, family hall, bedrooms, store, dormitory, workroom) and, over
// merchants', craftsmen's and inn houses, a roof terrace (eirado) reached by the last flight, with the tile roof over the back range only.
// Everything is drawn in the house's own frame (u along the front from its left, v inward) and only in the full (near) copy of a house.
// Only materials the houses already draw; every variation is from a hash of the piece's own place.
import { box, frustum, fromTriangles, orientOutward } from '../../core/geom.js';
import { rng, gable } from './util.js';
import { kit } from './interiors.js';

const DIR = { '0,1': 's', '0,-1': 'n', '1,0': 'e', '-1,0': 'w' };
export const WELL = 1.4, OPEN = 1.7, SV0 = 7.6, PART = 0.2, NS = 13;
export const sv1Of = (D) => Math.min(D - 6, 13.4);
const hash = (...a) => { let h = 2166136261; for (const v of a) { h ^= Math.round(v * 1000) | 0; h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
const noTop = (x0, y0, z0, x1, y1, z1) => frustum([x0, z0, x1, z1], y0, y1, 0, 0, 0, 0, { noTop: true });
const TERRACE = ['merchant', 'craft', 'inn'];

/**
 * The tile a house stands in draws a mesh for each material and each size class of its pieces (big, and small under 0.4 m: the "detail" mesh) and
 * one instanced group for each repeated shape; a new material or size class would be a new draw at the arrival. So what the upper floors add is
 * kept to the material/size classes the houses already have: a piece of a class the tiles lack is made of the nearest one they have.
 */
const SIZE = (g) => { const P = g.attributes.position.array; let x0 = 1e9, y0 = 1e9, z0 = 1e9, x1 = -1e9, y1 = -1e9, z1 = -1e9; for (let i = 0; i < P.length; i += 3) { if (P[i] < x0) x0 = P[i]; if (P[i] > x1) x1 = P[i]; if (P[i + 1] < y0) y0 = P[i + 1]; if (P[i + 1] > y1) y1 = P[i + 1]; if (P[i + 2] < z0) z0 = P[i + 2]; if (P[i + 2] > z1) z1 = P[i + 2]; } return Math.max(x1 - x0, y1 - y0, z1 - z0); };
const isBox = (g) => g.attributes.position.count === 36 && (() => { const N = g.attributes.normal.array; for (let i = 0; i < N.length; i++) { const a = Math.abs(N[i]); if (a > 1e-4 && Math.abs(a - 1) > 1e-4) return false; } return true; })();
const BOX_KEEP = new Set(['wood_dark', 'timber', 'limestone', 'cloth_red', 'cloth_ochre']), BIG_ONLY = new Set(['cloth_green', 'cloth_indigo', 'cloth_white', 'plaster_white', 'limewash_white', 'wood_painted', 'hide_tan', 'linen', 'rope_fibre', 'opening', 'roof_tile']);
const BIG_ANY = new Set(['timber', 'iron', 'linen', 'rope_fibre', 'cloth_green', 'cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'hide_tan', 'wood_painted', 'plaster_white', 'roof_tile']), SMALL_ANY = new Set(['terracotta', 'glaze_white', 'iron', 'cloth_red', 'cloth_ochre']);
const classOf = (mat, g) => {
  const small = SIZE(g) < 0.4;
  if (isBox(g)) { if (BOX_KEEP.has(mat)) return mat; if (BIG_ONLY.has(mat)) return small ? 'wood_dark' : mat; return mat === 'cloth_brown' ? 'cloth_ochre' : 'wood_dark'; }
  if (small) return SMALL_ANY.has(mat) ? mat : 'iron';
  return BIG_ANY.has(mat) ? mat : 'timber';
};
const guarded = (bag) => ({ add(mat, g) { if (g) bag.add(classOf(mat, g), g); } });

/** What a house of kind `up` is upstairs: its rooms (front, back) on each floor. */
const ROOMS = {
  merchant: [['office', 'sala'], ['bedroom', 'bedroom'], ['store', 'servants']],
  craft: [['work', 'sala'], ['bedroom', 'bedroom'], ['store', 'servants']],
  inn: [['dining', 'kitchenstore'], ['dorm', 'dorm'], ['bedroom', 'bedroom']],
  tenement: [['family', 'alcove'], ['weaver', 'alcove'], ['family', 'alcove']],
  dwelling: [['bedroom', 'store']],
  fisher: [['netloft', 'alcove']],
};

/**
 * The upper storeys of one house. g: { ctx (bag, col, lights), F (frame), el, y, L, D, T, h0, hs, n, H, wall, kind, use, wn, WW, WH, wu, sillAt, rand }.
 * Returns the pieces the house builder calls at the right places.
 */
export function upperOf(g) {
  const { ctx, F, el, y, L, D, T, h0, hs, n, H, wall, wn, WW, WH, wu, sillAt } = g;
  const { col, lights } = ctx, bag = guarded(ctx.bag), gctx = { bag, col, lights };
  const up = el.up, use = el.use ?? 'home', terrace = TERRACE.includes(up);
  const sv0 = SV0, sv1 = sv1Of(D), vT = sv1 + 0.8, ur = L - T;
  const dir = DIR[`${F.out[0]},${F.out[1]}`];
  const fh = (k) => (k === 0 ? 0.45 : h0 + (k - 1) * hs);                 // a floor's height over the house's base
  const roofH = H + 0.12, hTop = (k) => (k === n ? roofH : fh(k));         // what flight k climbs to
  const R = (u0, v0, u1, v1, y0, y1, m, solid = false) => { const r = F.R(u0, v0, u1, v1); bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); return r; };
  const RN = (u0, v0, u1, v1, y0, y1, m, solid = false) => { const r = F.R(u0, v0, u1, v1); bag.add(m, noTop(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); return r; };
  const P3 = (u, v, yy) => { const p = F.P(u, v); return [p[0], y + yy, p[1]]; };
  /** a sloped plank along v (low end vA at height hA, high end vB at hB) across u0..u1, th thick; no top face on rails */
  const slope = (m, u0, u1, vA, hA, vB, hB, th, noTopFace = false) => {
    const t = [], A = (u, v, h) => P3(u, v, h);
    const a0 = A(u0, vA, hA), a1 = A(u1, vA, hA), b0 = A(u0, vB, hB), b1 = A(u1, vB, hB), c0 = A(u0, vA, hA - th), c1 = A(u1, vA, hA - th), d0 = A(u0, vB, hB - th), d1 = A(u1, vB, hB - th);
    const q = (a, b, c, d) => t.push(...a, ...b, ...c, ...a, ...c, ...d);
    if (!noTopFace) q(a0, b0, b1, a1);
    q(c0, c1, d1, d0); q(a0, a1, c1, c0); q(b0, d0, d1, b1); q(a0, c0, d0, b0); q(a1, b1, d1, c1);
    bag.add(m, fromTriangles(orientOutward(t)));
  };
  const hv = (v) => (sv1 - v) / (sv1 - sv0);                               // 0 at the foot of a flight, 1 at its head
  const info = { terrace, sv0, sv1, vT };

  // ── the balcony's window: the middle one of the first floor ──
  const kb = 0, balS = 1;                                                    // (the leftmost window: the front room keeps its strip clear)
  const bw0 = wu(kb) - 0.2, bw1 = wu(kb) + WW + 0.2;
  info.gap = [bw0, bw1]; info.kb = kb; info.balS = balS;

  /** The front wall above the ground storey: strips between the window holes (no panes: the holes are open), the balcony's window to the floor. */
  info.front = () => {
    for (let s = 1; s < n; s++) {
      const f0 = h0 + (s - 1) * hs, f1 = s === n - 1 ? H : f0 + hs;
      let u = 0;
      for (let k = 0; k < wn; k++) {
        const bal = s === balS && k === kb, u0 = bal ? bw0 : wu(k), u1 = bal ? bw1 : wu(k) + WW, b = bal ? f0 : sillAt(s), t = sillAt(s) + WH;
        if (u0 > u + 0.001) R(u, 0, u0, T, f0, f1, wall);
        if (b > f0 + 0.001) R(u0, 0, u1, T, f0, b, wall);
        if (f1 > t + 0.001) R(u0, 0, u1, T, t, f1, wall);
        u = u1;
      }
      if (L > u + 0.001) R(u, 0, L, T, f0, f1, wall);
    }
  };
  /** The front wall's collision: the whole wall, but for the balcony's door (clear from the floor to 2.3 m above it). */
  info.frontCol = (ju, jv) => {
    const pieces = [[0, ju, 0], [jv, L, 0], [ju, jv, 2.8]], gap = [bw0, bw1], g0 = h0, g1 = h0 + 2.3;
    for (const [a, b, lo] of pieces) {
      const segs = [];
      if (a < gap[0] && b > gap[0]) segs.push([a, gap[0], lo, H + 1]);
      if (b > gap[1] && a < gap[1]) segs.push([gap[1], b, lo, H + 1]);
      if (b <= gap[0] || a >= gap[1]) segs.push([a, b, lo, H + 1]);
      const m0 = Math.max(a, gap[0]), m1 = Math.min(b, gap[1]);
      if (m1 > m0) { if (lo < g0) col.rect(F.R(m0, 0, m1, T), y + lo, y + g0); col.rect(F.R(m0, 0, m1, T), y + g1, y + H + 1); }
      for (const [s0, s1, l, hh] of segs) col.rect(F.R(s0, 0, s1, T), y + l, y + hh);
    }
  };
  /** The balcony: a limestone floor on corbels over the street, an iron rail on three sides, the door's threshold through the wall. */
  info.balcony = () => {
    const out = 0.95, yb = h0, d = 0.04;
    R(bw0 - 0.12, -out, bw1 + 0.12, 0, yb - 0.16, yb, 'limestone');
    R(bw0, 0, bw1, T, yb - 0.1, yb + 0.02, 'limestone');
    col.floor(F.R(bw0, -out, bw1, T), y + yb + 0.02);
    for (const u of [bw0 + 0.05, bw1 - 0.25]) R(u, -out + 0.1, u + 0.2, 0, yb - 0.7, yb - 0.16, 'limestone');
    const nb = Math.max(3, Math.round((bw1 - bw0) / 0.26)), nsd = 4;
    RN(bw0 - 0.1, -out - d, bw1 + 0.1, -out + d, yb + 0.95, yb + 1.0, 'timber');
    RN(bw0 - 0.1 - d, -out, bw0 - 0.1 + d, 0, yb + 0.95, yb + 1.0, 'timber'); RN(bw1 + 0.1 - d, -out, bw1 + 0.1 + d, 0, yb + 0.95, yb + 1.0, 'timber');
    R(bw0 - 0.1, -out - 0.015, bw1 + 0.1, -out + 0.015, yb + 0.1, yb + 0.14, 'timber');
    for (let i = 0; i <= nb; i++) { const u = bw0 - 0.07 + (bw1 - bw0 + 0.14) * i / nb; R(u - 0.012, -out - 0.012, u + 0.012, -out + 0.012, yb, yb + 0.95, 'timber'); }
    for (let i = 1; i < nsd; i++) { const v = -out * i / nsd; for (const u of [bw0 - 0.1, bw1 + 0.1]) R(u - 0.012, v - 0.012, u + 0.012, v + 0.012, yb, yb + 0.95, 'timber'); }
    col.rect(F.R(bw0 - 0.1, -out - d, bw1 + 0.1, -out + d), y + yb, y + yb + 1.0);
    col.rect(F.R(bw0 - 0.1 - d, -out, bw0 - 0.1 + d, 0), y + yb, y + yb + 1.0); col.rect(F.R(bw1 + 0.1 - d, -out, bw1 + 0.1 + d, 0), y + yb, y + yb + 1.0);
    // the door's own frame: jambs to the floor, a lintel, the leaves folded back
    R(bw0 - 0.12, -0.12, bw0, 0.12, yb, sillAt(balS) + WH + 0.15, 'limestone'); R(bw1, -0.12, bw1 + 0.12, 0.12, yb, sillAt(balS) + WH + 0.15, 'limestone');
    R(bw0 - 0.15, -0.14, bw1 + 0.15, 0.12, sillAt(balS) + WH, sillAt(balS) + WH + 0.15, 'limestone');
    R(bw0 + 0.02, -0.02, bw0 + 0.5, 0.06, yb + 0.05, sillAt(balS) + WH - 0.05, 'wood_painted'); R(bw1 - 0.5, -0.02, bw1 - 0.02, 0.06, yb + 0.05, sillAt(balS) + WH - 0.05, 'wood_painted');
  };

  // ── floors: boards on joists, the well open and railed ──
  const slab = (k) => {
    const f = fh(k), pieces = [[T, T, ur, sv0], [T + OPEN, sv0, ur, D - T], [T, sv1, T + OPEN, D - T]];
    for (const [u0, v0, u1, v1] of pieces) { R(u0, v0, u1, v1, f - 0.25, f, 'timber'); col.floor(F.R(u0, v0, u1, v1), y + f); }
    joists(f - 0.25, T);
  };
  /** the plaster of a ceiling under the slab above (its bottom face at yb), the stair's well left open where a flight goes on up */
  const ceiling = (yb, hole) => {
    const pieces = hole ? [[T, T, ur, sv0], [T + OPEN, sv0, ur, D - T], [T, sv1, T + OPEN, D - T]] : [[T, T, ur, D - T]];
    for (const [u0, v0, u1, v1] of pieces) R(u0, v0, u1, v1, yb - 0.03, yb - 0.01, 'plaster_white');
  };
  const joists = (yb, vmin) => {
    for (let v = vmin + 0.7; v < D - T - 0.2; v += 1.15) { const hole = v > sv0 - 0.1 && v < sv1 + 0.1, u0 = hole ? T + OPEN : T; R(u0, v - 0.07, ur, v + 0.07, yb - 0.2, yb, 'wood_dark'); }
  };
  info.slab = slab;

  /** The open flight to floor k (k >= 2), over the one below: treads on two stringers, a hand-rail on the open side, a ramp for the walker. */
  const flight = (k) => {
    const ha = fh(k - 1), hb = hTop(k), dv = (sv1 - sv0) / NS, hAt = (v) => ha + (hb - ha) * hv(v);
    for (let j = 1; j <= NS; j++) { const vm = sv1 - (j - 0.5) * dv, hm = hAt(vm); R(T, vm - dv / 2 - 0.02, T + WELL, vm + dv / 2 + 0.04, hm - 0.06, hm, 'timber'); }
    slope('timber', T, T + 0.07, sv1, ha - 0.07, sv0, hb - 0.07, 0.3); slope('timber', T + WELL - 0.07, T + WELL, sv1, ha - 0.07, sv0, hb - 0.07, 0.3);
    slope('timber', T + WELL, T + WELL + 0.05, sv1, ha + 0.95, sv0, hb + 0.95, 0.06, true); slope('timber', T + WELL, T + WELL + 0.05, sv1, ha + 0.5, sv0, hb + 0.5, 0.05, true);
    for (const v of [sv1 - 0.05, (sv0 + sv1) / 2, sv0 + 0.05]) R(T + WELL - 0.02, v - 0.04, T + WELL + 0.07, v + 0.04, hAt(v) - 0.3, hAt(v) + 1.0, 'timber');
    col.ramp(F.R(T, sv0, T + WELL, sv1), y + ha, y + hb, dir);
    col.rect(F.R(T + WELL + 0.02, sv0, T + WELL + 0.09, sv1), y + ha, y + hb + 1.0);
  };

  /** A rail round the well's open edges on floor f: the right side always, the back where no flight starts there. */
  const rails = (f, back) => {
    const post = (u, v) => R(u - 0.05, v - 0.05, u + 0.05, v + 0.05, f, f + 1.0, 'timber');
    const ru = T + OPEN, v0 = sv0 + PART + 0.05;
    for (const v of [v0 + 0.05, (v0 + sv1) / 2, sv1 - 0.05]) post(ru, v);
    RN(ru - 0.03, v0, ru + 0.03, sv1, f + 0.93, f + 1.0, 'timber'); R(ru - 0.02, v0, ru + 0.02, sv1, f + 0.45, f + 0.5, 'timber');
    col.rect(F.R(ru - 0.05, v0, ru + 0.05, sv1), y + f, y + f + 1.0);
    if (back) {
      for (const u of [T + 0.05, T + OPEN / 2]) post(u, sv1);
      RN(T, sv1 - 0.03, ru, sv1 + 0.03, f + 0.93, f + 1.0, 'timber'); R(T, sv1 - 0.02, ru, sv1 + 0.02, f + 0.45, f + 0.5, 'timber');
      col.rect(F.R(T, sv1 - 0.05, ru, sv1 + 0.05), y + f, y + f + 1.0);
    }
  };

  /** A partition across floor k (from the stair's landing to the right wall) with its door, and the lintel over it. */
  const ud = T + 2.5, d0 = ud - 0.55, d1 = ud + 0.55;
  const partition = (k, top) => {
    const f = fh(k), ph = top - f;
    R(T + OPEN, sv0, d0, sv0 + PART, f, f + ph, 'limewash_white', true); R(d1, sv0, ur, sv0 + PART, f, f + ph, 'limewash_white', true);
    R(d0, sv0, d1, sv0 + PART, f + 2.25, f + ph, 'limewash_white'); col.rect(F.R(d0, sv0, d1, sv0 + PART), y + f + 2.25, y + f + ph);
    for (const u of [d0 - 0.08, d1]) R(u, sv0 - 0.05, u + 0.08, sv0 + PART + 0.05, f, f + 2.3, 'wood_dark');
    R(d0 - 0.08, sv0 - 0.05, d1 + 0.08, sv0 + PART + 0.05, f + 2.25, f + 2.33, 'wood_dark');
  };

  // ── the rooms ──
  const furnish = (k) => {
    const f = fh(k), [fr, rr] = ROOMS[up][Math.min(k, ROOMS[up].length) - 1];
    const K = varied(kit(gctx, F, y + f, rng(Math.floor(hash(el.seed, k) * 1e9) + 1)), F, y + f);
    const o = { K, L, D, T, ur, sv0, sv1, hs, k, use, seed: el.seed, up, f };
    ROOM[fr](o, 'front'); ROOM[rr](o, 'rear');
    cupboard(K, T + 3.4, sv0 + PART + 0.0, 0.95);
    // the lamp of the floor in its rear room, the light from the street windows needs none in front
    const p = F.P(Math.min(ur - 2.5, L / 2 + 1), 11);
    lights.push({ at: [p[0], y + f + 2.4, p[1]], color: '#ffc27a', intensity: 3.5, distance: 9 });
  };

  /** Everything above the ground storey: floors 2..n-1 (floor 1 is `slab(1)`), the flights over the first, partitions, rails, rooms, whitewash. */
  info.rooms = () => {
    for (let k = 1; k < n; k++) {
      if (k >= 2) slab(k);
      if (k >= 2) flight(k);
      const top = k === n - 1 ? H - 0.28 : fh(k + 1) - 0.45;
      partition(k, top);
      ceiling(k === n - 1 ? H - 0.28 : fh(k + 1) - 0.25, !(k === n - 1 && !terrace));
      rails(fh(k), k === n - 1 && !terrace);
      furnish(k);
      // the inner whitewash of the side and back walls (the first floor's is the ground storey's: to h0 + hs)
      if (k >= 2) { const ya = fh(k), yb = k === n - 1 ? H - 0.28 : fh(k + 1) - 0.25; R(T, T, T + 0.02, D - T, ya, yb, 'limewash_white'); R(ur - 0.02, T, ur, D - T, ya, yb, 'limewash_white'); R(T, D - T - 0.02, ur, D - T, ya, yb, 'limewash_white'); }
    }
    if (terrace) { flight(n); rails(roofH, false); }
    // the joists under the ceiling of the top floor
    joists(H - 0.28, T);
  };

  // ── the roof: a terrace over the front and the stair, the tile roof over the back range only ──
  info.cap = () => {
    const x0 = -0.08, x1 = L + 0.08, v0 = -0.4, v1 = D + 0.08, hu0 = T + 0.04, hu1 = T + OPEN, hv0 = sv0, hv1 = sv1;
    for (const [a, b, c, d] of [[x0, v0, x1, hv0], [hu1, hv0 - 0.05, x1, v1], [x0, hv0 - 0.05, hu0, hv1 + 0.05], [x0, hv1, hu1, v1]]) R(a, b, c, d, H - 0.28, H + 0.12, 'limestone');
  };
  info.roof = (tile) => {
    // the terrace's floor
    for (const [a, b, c, d] of [[T, T, ur, sv0], [T + OPEN, sv0, ur, vT], [T, sv1, T + OPEN, vT]]) col.floor(F.R(a, b, c, d), y + roofH);
    // the parapet: front, and the sides as far as the tile roof; the coping
    const ph = H + 0.12;
    R(0, -0.3, L, 0.35, ph, ph + 0.88, wall); R(-0.0, 0.35, 0.35, vT, ph, ph + 0.88, wall); R(L - 0.35, 0.35, L, vT, ph, ph + 0.88, wall);
    R(-0.04, -0.34, L + 0.04, 0.39, ph + 0.88, ph + 0.94, 'limestone'); R(-0.04, 0.39, 0.39, vT, ph + 0.88, ph + 0.94, 'limestone'); R(L - 0.39, 0.39, L + 0.04, vT, ph + 0.88, ph + 0.94, 'limestone');
    // the tile roof over the back range, its ridge along the front, the stair's end left open
    gable(bag, 'roof_tile', F.R(0, vT, L, D), y + H + 0.12, Math.min(1.5, (D - vT) * 0.3), F.alongX, 0.45);
    terraceLife();
  };
  const terraceLife = () => {
    const K = varied(kit(gctx, F, y + roofH, rng(Math.floor(hash(el.seed, 9) * 1e9) + 1)), F, y + roofH), { A, Lh, Rod } = K;
    // a washing line between two posts, the cloths hung on it; jars and flower pots along the right parapet; a bench
    const lu0 = T + 3.6, lu1 = ur - 0.6, lv = 3.4;
    for (const u of [lu0, lu1]) A('wood_dark', u - 0.05, lv - 0.05, u + 0.05, lv + 0.05, 0, 2.1);
    Rod('rope_fibre', [lu0, lv, 2.0], [lu1, lv, 2.0], 0.012, 3);
    const nc = Math.max(2, Math.floor((lu1 - lu0) / 1.1));
    for (let i = 0; i < nc; i++) { const u = lu0 + 0.4 + i * (lu1 - lu0 - 0.8) / Math.max(1, nc - 1), p = F.P(u, lv), c = ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_red'][Math.floor(hash(p[0], p[1]) * 5)]; A(c, u - 0.3, lv - 0.01, u + 0.3, lv + 0.01, 1.15 + (i % 2) * 0.1, 2.0); }
    for (let i = 0; i < 3; i++) { const v = 1.2 + i * 1.5, p = F.P(ur - 0.5, v); Lh(hash(p[0], p[1]) < 0.5 ? 'terracotta' : 'glaze_white', [[0.001, 0], [0.12, 0], [0.2, 0.3], [0.25, 0.5], [0.15, 0.7], [0.001, 0.72]], ur - 0.5, v, 0, 8); }
    K.bench(T + 3.6, T + 5.6, vT - 1.0, 0.45);
  };
  info.cutHole = true;
  info.flights = () => { /* the first flight is the house's own (ground to floor 1) */ };
  info.terraceRoof = terrace;
  info.dirOf = dir;
  info.joists = joists;
  info.fh = fh;
  return info;
}

// ── the rooms by use: o = { K (kit at the floor), L, D, T, ur, sv0, sv1, k, use }; `side` 'front' (v from the front wall to the partition)
// or 'rear' (behind it). The way through is kept clear: the front room's strip u < T + 3.2 at v 5.9–7.6; the rear room's lane u 1.8–3.3 beside the
// well and the foot of the next flight.
const hs_ = (...a) => hash(...a);
/** the kit's turned things (barrels, jars, coils, sacks) with each one's size varied by a hash of its own place (so that no two are one shape to be drawn as copies) */
function varied(K, F, fy) {
  const w = (u, v, k) => { const p = F.P(u, v); return hs_(p[0], p[1], fy, k); }, f = (x, u, v, k, a = 0.07) => x * (1 - a + 2 * a * w(u, v, k));
  return {
    ...K,
    barrel: (u, v, y0 = 0, r = 0.32, h = 0.85, solid = true) => K.barrel(u, v, y0, f(r, u, v, 1), f(h, u, v, 2, 0.05), solid),
    jar: (u, v, y0 = 0, r = 0.17, h = 0.3, mat = 'terracotta') => K.jar(u, v, y0, Math.min(f(r, u, v, 3), 0.17), Math.min(f(h, u, v, 4), 0.37), mat),
    coil: (u, v, y0 = 0, r = 0.34) => K.coil(u, v, y0, f(r, u, v, 5)),
    sack: (u, v, y0 = 0, mat = 'linen', open = false) => { const s = f(1, u, v, 6, 0.1), t = f(1, u, v, 7, 0.1); K.Lh('linen', [[0.001, 0], [0.24 * s, 0], [0.3 * s, 0.14 * t], [0.27 * s, 0.42 * t], [(open ? 0.2 : 0.1) * s, 0.55 * t], [0.001, (open ? 0.5 : 0.6) * t]], u, v, y0, 8); },
  };
}
/** books, a balance and a ham drawn with the houses' own materials (the kit's use materials the tiles may not have) */
const bookAt = (K, u, v, y0, w = 0.07, h = 0.24) => K.A(['cloth_brown', 'cloth_red', 'cloth_green', 'cloth_brown'][Math.floor(hs_(u, v, y0, K.A.length) * 4)], u, v, u + w, v + 0.18, y0, y0 + h);
const scalesAt = (K, u, v, y0) => { K.A('wood_dark', u - 0.015, v - 0.015, u + 0.015, v + 0.015, y0, y0 + 0.4); K.A('wood_dark', u - 0.3, v - 0.01, u + 0.3, v + 0.01, y0 + 0.4, y0 + 0.42); for (const d of [-0.28, 0.28]) K.A('wood_dark', u + d - 0.1, v - 0.1, u + d + 0.1, v + 0.1, y0 + 0.16, y0 + 0.18); };
const hamAt = (K, u, v, y0) => { K.A('rope_fibre', u - 0.01, v - 0.01, u + 0.01, v + 0.01, y0 + 0.34, y0 + 0.55); K.A('hide_tan', u - 0.08, v - 0.08, u + 0.08, v + 0.08, y0, y0 + 0.34); };
/** a chest of boards on its stand (no iron: the straps are a painted band) */
const chestAt = (K, u, v, w = 1.0, d = 0.5) => { K.A('wood_dark', u - w / 2, v - d / 2, u + w / 2, v + d / 2, 0, 0.55, true); K.A('timber', u - w / 2 - 0.02, v - d / 2 - 0.02, u + w / 2 + 0.02, v + d / 2 + 0.02, 0.55, 0.6); K.A('wood_painted', u - 0.04, v - d / 2 - 0.02, u + 0.04, v + d / 2 + 0.02, 0.0, 0.6); };
/** a wall cupboard with its doors open on the dark inside, against the wall at depth v0 (facing +v) */
const cupboard = (K, u, v0, w = 0.9) => { K.A('wood_dark', u, v0, u + w, v0 + 0.5, 0, 1.9, true); K.A('opening', u + 0.08, v0 + 0.5, u + w / 2 - 0.03, v0 + 0.53, 0.35, 1.75); K.A('opening', u + w / 2 + 0.03, v0 + 0.5, u + w - 0.08, v0 + 0.53, 0.35, 1.75); K.A('timber', u - 0.03, v0 + 0.5, u + 0.07, v0 + 0.56, 0.3, 1.8); K.A('timber', u + w - 0.07, v0 + 0.5, u + w + 0.03, v0 + 0.56, 0.3, 1.8); };
const ROOM = {
  office(o) {
    const { K, ur, T, sv0 } = o, { A, table, stool, shelves } = K, chest = (u, v, w, d) => chestAt(K, u, v, w, d), book = (u, v, y0, w, h) => bookAt(K, u, v, y0, w, h), scales = (u, v, y0) => scalesAt(K, u, v, y0);
    table(ur - 1.5, 3.1, 2.0, 0.9); stool(ur - 1.5, 2.0); stool(ur - 1.5, 4.2); stool(ur - 2.6, 3.1);
    for (let i = 0; i < 3; i++) book(ur - 2.0 + i * 0.09, 3.0, 0.78, 0.07, 0.2 + i * 0.03);
    scales(ur - 0.7, 3.2, 0.78); A('cloth_white', ur - 1.2, 2.8, ur - 0.8, 3.1, 0.78, 0.8);
    chest(ur - 0.4, 0.9, 0.55, 1.1); chest(ur - 0.4, 5.3, 0.55, 1.0, 'wood_dark');
    shelves(T + 3.7, ur - 0.9, sv0 - 0.5, 0.45, [0.55, 1.15, 1.75], (u, v, h, row) => { if (row === 1) K.bolt(u, v, h, 0.3, 'cloth_indigo'); else book(u, v - 0.1, h, 0.07, 0.25); }, 0.55);
    A('cloth_ochre', T, 1.6, T + 0.04, 3.8, 1.2, 2.3); A('cloth_red', T + 0.04, 2.2, T + 0.07, 2.4, 1.6, 1.9);   // a chart of the Indies on the wall
  },
  sala(o) {
    const { K, ur, T, D } = o, { A, table, bench, stool, Lh, jar } = K, chest = (u, v, w, d) => chestAt(K, u, v, w, d);
    table(ur - 2.0, 11.0, 2.4, 0.95); bench(ur - 3.1, ur - 0.9, 10.1); bench(ur - 3.1, ur - 0.9, 11.9); stool(ur - 3.5, 11.0);
    Lh('wood_painted', [[0.001, 0], [0.05, 0.0], [0.04, 0.2], [0.07, 0.24], [0.001, 0.25]], ur - 2.0, 11.0, 0.78, 6);
    A('wood_dark', ur - 3.2, D - T - 0.6, ur - 0.4, D - T, 0, 1.9, true); A('timber', ur - 3.25, D - T - 0.65, ur - 0.35, D - T - 0.55, 0.95, 1.0);
    for (let i = 0; i < 4; i++) jar(ur - 2.9 + i * 0.7, D - T - 0.3, 1.0, 0.1 + (i % 2) * 0.02, 0.3, i % 2 ? 'glaze_white' : 'terracotta');
    chest(T + 1.4, D - T - 0.6, 1.2, 0.55);
    A('cloth_red', ur - 0.04, 9.0, ur, 13.0, 0.9, 2.5); A('cloth_ochre', ur - 0.07, 9.1, ur - 0.04, 9.25, 0.9, 2.5); A('cloth_ochre', ur - 0.07, 12.75, ur - 0.04, 12.9, 0.9, 2.5);
    A('cloth_red', ur - 3.8, 10.2, ur - 3.2, 11.8, 0.0, 0.015);
  },
  bedroom(o, side) {
    const { K, ur, T, D, L } = o, { A, bed, table, Lh, stool } = K, chest = (u, v, w, d) => chestAt(K, u, v, w, d);
    const bedU = (v, w = 1.5) => { bed(ur - 2.1, v, w, 2.1, 'u'); A('wood_dark', ur - 0.07, v - w / 2, ur, v + w / 2, 0.15, 1.3); A('wood_dark', ur - 2.17, v - w / 2, ur - 2.1, v + w / 2, 0.15, 0.7); };
    if (side === 'front') {
      bedU(2.6, 1.6); chest(ur - 2.7, 2.6, 0.55, 1.1); A('cloth_red', ur - 2.0, 1.3, ur - 0.2, 3.9, 0.0, 0.014);
      // the prie-dieu with its crucifix, a wash-stand
      A('wood_dark', T + 0.05, T + 0.3, T + 0.65, T + 1.0, 0, 0.55, true); A('wood_dark', T + 0.05, T + 0.3, T + 0.65, T + 0.45, 0.55, 1.5); A('wood_painted', T + 0.3, T + 0.3, T + 0.4, T + 0.34, 1.05, 1.3); A('wood_painted', T + 0.22, T + 0.3, T + 0.48, T + 0.34, 1.15, 1.2);
      table(T + 1.5, 5.2, 0.7, 0.5, 0.85); Lh('terracotta', [[0.001, 0], [0.1, 0.0], [0.17, 0.1], [0.19, 0.14], [0.001, 0.14]], T + 1.5, 5.2, 0.85, 8);
    } else {
      bedU(9.2, 1.4); bedU(12.0, 1.4); chest(ur - 3.0, 10.6, 0.55, 1.0);
      A('wood_dark', ur - 1.3, 14.3, ur - 0.4, 15.1, 0, 0.5, true); A('timber', ur - 1.35, 14.25, ur - 0.35, 15.15, 0.5, 0.55);   // a child's cradle on its stand
      A('wood_dark', T + 3.7, D - T - 0.6, T + 5.6, D - T, 0, 1.8, true);
    }
    void L; void stool;
  },
  store(o, side) {
    const { K, ur, T, D } = o, { A, sack, barrel, crate, coil, jar, bolt } = K;
    const v0 = side === 'front' ? 1.0 : 9.0, w = side === 'front' ? 5 : 8;
    for (let i = 0; i < w; i++) sack(ur - 0.5 - (i % 3) * 0.55, v0 + Math.floor(i / 3) * 0.55, 0, 'linen', i % 2 === 0);
    for (let i = 0; i < 3; i++) barrel(T + 3.9 + i * 0.8, side === 'front' ? 0.9 : D - T - 0.6, 0, 0.3, 0.8);
    crate(ur - 0.5, v0 + 2.6, 0, 0.6); crate(ur - 0.5, v0 + 2.6, 0.54, 0.5); coil(T + 4.2, v0 + 1.6, 0, 0.34);
    jar(ur - 1.3, v0 + 3.2, 0, 0.26, 0.9, 'terracotta'); jar(ur - 2.0, v0 + 3.4, 0, 0.26, 0.9, 'glaze_white');
    A('timber', T + 3.7, v0 + 2.6, T + 5.4, v0 + 2.64, 1.2, 1.24); for (let i = 0; i < 3; i++) bolt(T + 4.5, v0 + 2.7, 1.25 + i * 0.22, 1.4, i % 2 ? 'cloth_white' : 'cloth_ochre');
  },
  servants(o) {
    const { K, ur, T, D } = o, { A } = K, chest = (u, v, w, d) => chestAt(K, u, v, w, d);
    for (let i = 0; i < 3; i++) { const v = 9.0 + i * 1.5; A('wood_dark', ur - 2.1, v - 0.4, ur - 0.1, v + 0.4, 0.1, 0.28, true); A('linen', ur - 2.05, v - 0.35, ur - 0.15, v + 0.35, 0.28, 0.36); A(i % 2 ? 'cloth_brown' : 'cloth_green', ur - 1.3, v - 0.35, ur - 0.15, v + 0.35, 0.36, 0.42); }
    chest(T + 4.0, D - T - 0.5, 1.0, 0.5); chest(T + 5.3, D - T - 0.5, 0.9, 0.5, 'wood_dark');
  },
  work(o, side) {
    const { K, ur, T, D, use, sv0 } = o, { A, sack, barrel, coil, table, stool, jar, herbs, Lh, bolt, shelves, pick } = K;
    if (side === 'rear') return ROOM.sala(o);
    if (use === 'baker') {                    // the flour loft: sacks, the kneading trough, racks of loaves, the peel
      for (let i = 0; i < 6; i++) sack(ur - 0.5 - (i % 3) * 0.55, 0.9 + Math.floor(i / 3) * 0.6, 0, 'linen', i < 2);
      A('wood_dark', T + 3.6, 1.0, T + 5.3, 1.8, 0, 0.8, true); A('timber', T + 3.55, 0.95, T + 5.35, 1.85, 0.8, 0.86); A('cloth_white', T + 3.8, 1.2, T + 5.1, 1.6, 0.86, 0.9);
      shelves(T + 3.7, ur - 2.4, sv0 - 0.5, 0.45, [0.6, 1.2, 1.8], (u, v, h) => A('hide_tan', u - 0.1, v - 0.07, u + 0.1, v + 0.07, h, h + 0.1), 0.45);
    } else if (use === 'chandler') {          // ropes and tackle: coils, hanks on pegs, tar barrels, a lantern store
      for (let i = 0; i < 5; i++) coil(ur - 0.6 - (i % 2) * 0.8, 1.0 + Math.floor(i / 2) * 0.8, i > 3 ? 0.22 : 0, 0.34);
      for (let i = 0; i < 3; i++) barrel(T + 3.9 + i * 0.8, 0.9, 0, 0.3, 0.8);
      for (let i = 0; i < 4; i++) { const u = T + 3.8 + i * 0.9; K.Rod('rope_fibre', [u, sv0 - 0.12, 2.2], [u + 0.05, sv0 - 0.14, 1.2], 0.05, 5); }
      A('wood_dark', T + 3.7, sv0 - 0.08, ur - 0.8, sv0 - 0.05, 2.25, 2.3);
    } else if (use === 'cloth') {             // the draper's store: bolts on shelves and a cutting table
      shelves(T + 3.7, ur - 0.9, sv0 - 0.5, 0.45, [0.5, 1.05, 1.6, 2.1], (u, v, h) => bolt(u, v, h, 0.34, pick(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_white'])), 0.45);
      table(ur - 2.0, 2.6, 2.4, 1.0, 0.9); A('cloth_white', ur - 3.0, 2.3, ur - 1.1, 2.9, 0.9, 0.95); stool(ur - 2.0, 1.4);
    } else if (use === 'apothecary') {        // the still-room: jars, a mortar, herbs hanging, a still over a brazier
      table(ur - 1.6, 2.6, 2.0, 0.9); Lh('terracotta', [[0.001, 0], [0.12, 0.02], [0.14, 0.12], [0.001, 0.12]], ur - 2.0, 2.6, 0.78, 8); Lh('terracotta', [[0.001, 0], [0.16, 0.02], [0.2, 0.16], [0.1, 0.3], [0.001, 0.32]], ur - 1.2, 2.6, 0.78, 8);
      for (let i = 0; i < 5; i++) herbs(T + 3.9 + i * 0.6, 1.0, 1.7);
      shelves(T + 3.7, ur - 0.9, sv0 - 0.5, 0.4, [0.55, 1.1, 1.65], (u, v, h) => jar(u, v, h, 0.09, 0.26, pick(['glaze_white', 'glaze_white', 'terracotta'])), 0.4);
    } else { for (let i = 0; i < 5; i++) sack(ur - 0.5 - (i % 3) * 0.55, 1.0 + Math.floor(i / 3) * 0.55); barrel(T + 4.0, 1.0); jar(ur - 2.5, 1.2, 0, 0.24, 0.8, 'terracotta'); void D; void jar; void herbs; void table; }
  },
  dining(o, side) {
    const { K, ur, T, L } = o, { A, table, bench, barrel } = K;
    if (side === 'rear') return;
    const cols = Math.max(1, Math.floor((ur - T - 3.6) / 2.3));
    for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) { const u = T + 4.4 + c * 2.3, v = 1.7 + r * 2.9; table(u, v, 1.6, 0.8); bench(u - 0.7, u + 0.7, v - 0.7); bench(u - 0.7, u + 0.7, v + 0.7); }
    A('wood_dark', ur - 0.7, 5.0, ur - 0.1, 6.0, 0, 0.5, true); barrel(ur - 0.4, 5.5, 0.5, 0.3, 0.8); A('wood_dark', ur - 0.9, T + 0.2, ur - 0.1, T + 1.0, 0, 0.5, true); barrel(ur - 0.5, T + 0.6, 0.5, 0.28, 0.75);
    void L;
  },
  kitchenstore(o) {
    const { K, ur, T, D } = o, { A, barrel, sack, table, stool, jar } = K, ham = (u, v, y0) => hamAt(K, u, v, y0);
    for (let i = 0; i < 4; i++) barrel(ur - 0.5, 9.0 + i * 0.75, 0, 0.3, 0.8);
    for (let i = 0; i < 5; i++) ham(T + 3.9 + i * 0.7, 9.0, 2.0);
    A('wood_dark', T + 3.7, 8.95, T + 7.4, 9.05, 2.3, 2.34);
    table(ur - 3.0, 12.4, 2.0, 0.9); stool(ur - 3.0, 11.5); stool(ur - 3.0, 13.3);
    for (let i = 0; i < 5; i++) sack(T + 3.9 + (i % 3) * 0.55, D - T - 0.5 - Math.floor(i / 3) * 0.5);
    jar(ur - 0.6, D - T - 0.6, 0, 0.26, 0.9, 'terracotta'); jar(ur - 1.3, D - T - 0.6, 0, 0.26, 0.9, 'glaze_white');
  },
  dorm(o, side) {
    const { K, ur, T, D } = o, { A, sack } = K, chest = (u, v, w, d) => chestAt(K, u, v, w, d);
    const pallet = (u, v, len, col) => { A('wood_dark', u, v, u + 0.95, v + len, 0.08, 0.27, true); A('linen', u + 0.04, v + 0.04, u + 0.91, v + len - 0.04, 0.27, 0.34); A(col, u + 0.04, v + len * 0.4, u + 0.91, v + len - 0.04, 0.34, 0.4); };
    const cols = ['cloth_brown', 'cloth_green', 'cloth_indigo', 'cloth_red'];
    if (side === 'front') { for (let i = 0; i < 4; i++) { const u = T + 3.6 + i * 1.3; if (u + 0.95 > ur) break; pallet(u, T + 0.1, 2.0, cols[Math.floor(hash(u, T, o.f) * 4)]); } for (let i = 0; i < 4; i++) { const u = T + 3.6 + i * 1.3; if (u + 0.95 > ur) break; pallet(u, T + 2.6, 2.0, cols[Math.floor(hash(u, 2.6, o.f) * 4)]); } }
    else { for (let i = 0; i < 3; i++) { const v = 8.3 + i * 2.5; pallet(ur - 2.4, v, 2.0 - 0.0, cols[Math.floor(hash(ur, v, o.f) * 4)]); if (ur - 4.7 > T + 3.4) pallet(ur - 3.5, v, 2.0, cols[Math.floor(hash(ur - 1, v, o.f) * 4)]); } chest(T + 4.0, D - T - 0.5, 1.2, 0.55); }
    void D;
  },
  family(o, side) {
    const { K, ur, T } = o, { A, bed, table, stool, Lh } = K, chest = (u, v, w, d) => chestAt(K, u, v, w, d);
    if (side === 'rear') return;
    // (the front strip v < 3.6 is the balcony's way: the room is laid out behind it)
    bed(ur - 0.8, 3.8, 1.3, 2.0, 'v'); A('wood_dark', ur - 1.45, 3.74, ur - 0.15, 3.8, 0.15, 1.3); chest(ur - 2.1, 5.3, 0.9, 0.5);
    table(T + 1.4, 4.7, 1.1, 0.75); stool(T + 1.4, 3.9); stool(T + 2.4, 4.7);
    Lh('terracotta', [[0.001, 0], [0.09, 0.02], [0.12, 0.14], [0.07, 0.22], [0.001, 0.24]], T + 1.4, 4.7, 0.78, 8);
    A('wood_dark', T + 0.05, 3.7, T + 0.55, 4.5, 0, 1.6, true); for (const h of [0.5, 1.0]) A('timber', T + 0.05, 3.7, T + 0.55, 4.5, h, h + 0.03);
  },
  weaver(o, side) {
    const { K, ur, T } = o, { A, stool, bolt } = K;
    if (side === 'rear') return;
    // a loom: two posts, the top beam, the warp, the cloth rolled below; a bench
    const lu = ur - 2.4, lv = 2.0;
    for (const u of [lu, lu + 1.5]) A('wood_dark', u, lv, u + 0.1, lv + 0.1, 0, 1.9, true);
    A('wood_dark', lu, lv, lu + 1.6, lv + 0.1, 1.8, 1.9); A('wood_dark', lu, lv, lu + 1.6, lv + 0.1, 0.5, 0.58);
    for (let i = 0; i < 7; i++) A('cloth_white', lu + 0.12 + i * 0.2, lv + 0.03, lu + 0.13 + i * 0.2, lv + 0.05, 0.6, 1.8);
    A(hash(lu, lv) < 0.5 ? 'cloth_indigo' : 'cloth_red', lu + 0.12, lv + 0.02, lu + 1.5, lv + 0.06, 0.58, 0.9); stool(lu + 0.8, lv + 0.7);
    bolt(T + 3.7, 4.6, 0.0, 1.0, 'cloth_ochre'); A('wood_dark', T + 3.6, 4.3, T + 4.6, 4.9, 0, 0.35, true);
  },
  alcove(o, side) {
    const { K, ur, T, D } = o, { A, bed, barrel } = K, chest = (u, v, w, d) => chestAt(K, u, v, w, d);
    if (side === 'front') return;
    bed(ur - 1.3, 9.6, 1.3, 2.0, 'v'); A('wood_dark', ur - 1.95, 9.5, ur - 0.65, 9.54, 0.15, 1.3);
    A('wood_dark', T + 3.5, 13.8, T + 4.6, 14.5, 0, 0.3, true); A('cloth_brown', T + 3.55, 13.85, T + 4.55, 14.45, 0.3, 0.36);
    chest(ur - 0.5, 12.6, 0.5, 1.0); void D; void barrel; void chest;
  },
  netloft(o, side) {
    const { K, ur, T } = o, { A, bed, barrel, Rod } = K, chest = (u, v, w, d) => chestAt(K, u, v, w, d);
    if (side === 'rear') return;
    // nets over a pole, floats, an oar, a basket of line, the bed
    Rod('timber', [T + 3.6, 4.4, 2.2], [ur - 0.1, 4.4, 2.2], 0.04, 5);
    for (let i = 0; i < 3; i++) A('rope_fibre', T + 3.9 + i * 1.2, 4.3, T + 4.9 + i * 1.2, 4.5, 1.0 + (i % 2) * 0.2, 2.2);
    Rod('timber', [ur - 0.3, 0.8, 0], [ur - 0.15, 0.85, 2.0], 0.035, 5);
    bed(ur - 1.5, 1.6, 1.4, 2.0, 'v'); chest(ur - 2.8, 1.2, 0.9, 0.55); barrel(T + 3.9, 1.0, 0, 0.26, 0.6); void barrel;
  },
};
