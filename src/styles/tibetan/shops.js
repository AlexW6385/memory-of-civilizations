// Lhasa's shops and tea houses (docs/settlements/lhasa.md §14): the single-storey trading houses on the
// street up to the palace, whose ground floor is the shop itself and shelters its stock ("residence,
// shop and storage in one building"), a tea house where strangers share tables, and the open booths
// of the street. Built as a function of the style's own helpers (index.js hands them in) so that
// this file has no import of its own style.

import { box, frustum, lathe, rod } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const NORM = { s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] };
const STRIPES = ['paint_blue', 'cloth_white', 'cloth_red', 'cloth_green', 'cloth_ochre'];

export function makeShops(H) {
  const { face, doorway, win, thangka, sangkhun, twigs, bannerPole, flagString } = H;

  /** The local frame of a building whose front looks along side `door`: u along the front (right seen from outside), v inward from the front's outer face. */
  function frame(rect, door) {
    const [x0, z0, x1, z1] = rect, n = NORM[door], tx = -n[1], tz = n[0];
    const F = door === 's' ? [(x0 + x1) / 2, z1] : door === 'n' ? [(x0 + x1) / 2, z0] : door === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2];
    const along = door === 's' || door === 'n', Wd = along ? x1 - x0 : z1 - z0, Dp = along ? z1 - z0 : x1 - x0;
    const P = (u, v) => [F[0] + tx * u - n[0] * v, F[1] + tz * u - n[1] * v];
    const R = (u0, u1, v0, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    return { n, t: [tx, tz], F, Wd, Dp, P, R };
  }

  /** The shell of a one-room building: battered outside, plumb inside, the front wall round its door; returns the inner extent. */
  function shell(ctx, el, o) {
    const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, Hh = o.H, t = 0.7, b = Hh * 0.05, door = el.door ?? 's';
    const dw = o.dw, dh = o.dh, cxm = (x0 + x1) / 2, czm = (z0 + z1) / 2;
    const walls = { w: [x0, z0, x0 + t, z1, b, 0, b, b], e: [x1 - t, z0, x1, z1, 0, b, b, b], n: [x0, z0, x1, z0 + t, b, b, b, 0], s: [x0, z1 - t, x1, z1, b, b, 0, b] };
    for (const [side, [a0, c0, a1, c1, ixn, ixp, izn, izp]] of Object.entries(walls)) {
      if (side !== door) { bag.add('limewash_white', frustum([a0, c0, a1, c1], y - 0.3, y + Hh, ixn, ixp, izn, izp)); continue; }
      const alongZ = side === 'w' || side === 'e', m = alongZ ? czm : cxm, lo = alongZ ? c0 : a0, hi = alongZ ? c1 : a1;
      const piece = (p0, p1, yA, yB) => { const r = alongZ ? [a0, p0, a1, p1] : [p0, c0, p1, c1], f = (yB - yA) / (Hh + 0.3); bag.add('limewash_white', frustum(r, yA, yB, ixn * f, ixp * f, izn * f, izp * f)); };
      piece(lo, m - dw / 2, y - 0.3, y + Hh); piece(m + dw / 2, hi, y - 0.3, y + Hh);
      const f0 = (dh + 0.3) / (Hh + 0.3), f1 = (Hh - dh) / (Hh + 0.3);
      const lr = alongZ ? [a0 + ixn * f0, m - dw / 2 - 0.01, a1 - ixp * f0, m + dw / 2 + 0.01] : [m - dw / 2 - 0.01, c0 + izn * f0, m + dw / 2 + 0.01, c1 - izp * f0];
      bag.add('limewash_white', frustum(lr, y + dh, y + Hh, alongZ ? ixn * f1 : 0, alongZ ? ixp * f1 : 0, alongZ ? 0 : izn * f1, alongZ ? 0 : izp * f1));
      const at = side === 'w' ? [x0, czm] : side === 'e' ? [x1, czm] : side === 'n' ? [cxm, z0] : [cxm, z1];
      doorway({ at, n: side, y, w: dw, h: dh, k: b / (Hh + 0.3) }, ctx);
    }
    for (const [a, c, d, e] of [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0, x0 + t, z1], [x1 - t, z0, x1, z1]]) {
      const alongZ = d - a < e - c, isDoor = (door === 'w' && a === x0 && alongZ) || (door === 'e' && d === x1 && alongZ) || (door === 'n' && c === z0 && !alongZ) || (door === 's' && e === z1 && !alongZ);
      if (!isDoor) { col.rect([a, c, d, e], y, y + Hh); continue; }
      if (alongZ) { col.rect([a, c, d, czm - dw / 2], y, y + Hh); col.rect([a, czm + dw / 2, d, e], y, y + Hh); }
      else { col.rect([a, c, cxm - dw / 2, e], y, y + Hh); col.rect([cxm + dw / 2, c, d, e], y, y + Hh); }
    }
    // the dark frieze, the coping, the roof slab; the floor and the ceiling of boards on beams
    bag.add('pembe', frustum([x0 + b * 0.84, z0 + b * 0.84, x1 - b * 0.84, z1 - b * 0.84], y + Hh - 0.52, y + Hh - 0.1, 0.05 * b, 0.05 * b, 0.05 * b, 0.05 * b));
    bag.add('limewash_white', box(x0 + b - 0.12, y + Hh - 0.12, z0 + b - 0.12, x1 - b + 0.12, y + Hh + 0.1, z1 - b + 0.12));
    const yi = y + o.ceil;
    bag.add('mud_plaster', box(x0 + t, yi + 0.2, z0 + t, x1 - t, y + Hh - 0.12, z1 - t));
    bag.add(o.floor ?? 'planks_grey', box(x0 + t, y, z0 + t, x1 - t, y + 0.04, z1 - t));
    col.floor([x0 + t, z0 + t, x1 - t, z1 - t], y + 0.04);
    bag.add('planks_grey', box(x0 + t, yi, z0 + t, x1 - t, yi + 0.2, z1 - t));
    return { yi, t, b };
  }

  /** The roof's furniture: raised corners with twigs and flags, a flag pole, the incense burner's urn. */
  function roofKit(ctx, el, Hh, rand, pole = true) {
    const { bag } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, b = Hh * 0.05, ri = 0.2;
    for (const [cx, cz] of [[x0 + ri, z0 + ri], [x1 - ri, z0 + ri], [x0 + ri, z1 - ri], [x1 - ri, z1 - ri]].map(([a, c]) => [a + (a < (x0 + x1) / 2 ? b : -b), c + (c < (z0 + z1) / 2 ? b : -b)])) {
      const sx = cx < (x0 + x1) / 2 ? 1 : -1, sz = cz < (z0 + z1) / 2 ? 1 : -1, r = [Math.min(cx, cx + sx * 0.7), Math.min(cz, cz + sz * 0.7), Math.max(cx, cx + sx * 0.7), Math.max(cz, cz + sz * 0.7)];
      bag.add('limewash_white', box(r[0], y + Hh - 0.05, r[1], r[2], y + Hh + 0.45, r[3]));
      bag.add('pembe', box(r[0] - 0.02, y + Hh + 0.16, r[1] - 0.02, r[2] + 0.02, y + Hh + 0.32, r[3] + 0.02));
      twigs(bag, (r[0] + r[2]) / 2, y + Hh + 0.45, (r[1] + r[3]) / 2, rand);
    }
    if (pole) {
      const p = [x0 + (x1 - x0) * 0.3, z0 + (z1 - z0) * 0.3];
      bannerPole({ c: p, y: y + Hh, h: 3.4 }, ctx);
      flagString(bag, [p[0], y + Hh + 3.3, p[1]], [x1 - 0.6, y + Hh + 0.8, z0 + 0.6]);
      flagString(bag, [p[0], y + Hh + 3.3, p[1]], [x0 + 0.6, y + Hh + 0.8, z1 - 0.6]);
    }
    sangkhun(bag, (x0 + x1) / 2 + (rand() - 0.5) * 2, y + Hh, (z0 + z1) / 2 + (rand() - 0.5) * 2, [0, 1]);
  }

  /** A hanging rug: stripes across a strip of cloth from world point p0 to p1 (x, z), facing nn, from y0 up h. */
  function rug(bag, nn, p0, p1, y0, h, rand) {
    const mats = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon'], base = mats[Math.floor(rand() * 5)], alt = mats[Math.floor(rand() * 5)];
    let L = 0; const Q = (mat, a, b2, ya, yb) => { const o = 0.004 * L++, A = [p0[0] + (p1[0] - p0[0]) * a + nn[0] * o, p0[1] + (p1[1] - p0[1]) * a + nn[1] * o], B = [p0[0] + (p1[0] - p0[0]) * b2 + nn[0] * o, p0[1] + (p1[1] - p0[1]) * b2 + nn[1] * o]; face(bag, mat, nn, [A[0], ya, A[1]], [B[0], ya, B[1]], [B[0], yb, B[1]], [A[0], yb, A[1]]); };
    Q(base, 0, 1, y0, y0 + h);
    const k = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < k; i++) { const yy = y0 + h * (0.12 + 0.72 * i / (k - 1)); Q(i % 2 ? alt : 'cloth_white', 0.06, 0.94, yy, yy + h * 0.06); }
    Q('cloth_black', 0, 1, y0, y0 + h * 0.05);
  }

  /** A sack (or bale) standing at (x, y, z): a soft box with a tied neck. */
  const sack = (bag, mat, x, y, z, s = 1, rot = 0) => {
    const g = lathe([[0.001, 0], [0.2 * s, 0.01], [0.26 * s, 0.18 * s], [0.23 * s, 0.42 * s], [0.16 * s, 0.58 * s], [0.06 * s, 0.64 * s], [0.001, 0.62 * s]], 8, null, 0, 0, 0);
    g.rotateY(rot); g.translate(x, y, z); bag.add(mat, g);
  };
  const bowl = (bag, mat, x, y, z, r = 0.07) => bag.add(mat, lathe([[0.001, 0], [r * 0.5, 0], [r, r * 1.1], [r * 0.9, r * 1.2], [r * 0.82, r * 1.12], [r * 0.45, r * 0.15], [0.001, 0.01]], 10, null, x, y, z));
  const pot = (bag, mat, x, y, z, r = 0.16) => bag.add(mat, lathe([[0.001, 0], [r * 0.7, 0], [r, r * 0.7], [r * 0.8, r * 1.5], [r * 0.5, r * 1.7], [r * 0.6, r * 1.9], [r * 0.45, r * 1.9]], 12, null, x, y, z));

  /** The tea house's bench rows: [u0, u1, v of the wall, direction into the room]. */
  function teaRows(iu, vi0, vi1) { return [[-iu + 0.4, -1.5, vi0, 1], [1.5, iu - 0.4, vi0, 1], [-iu + 2.7, iu - 2.5, vi1, -1]]; }
  /** Where patrons may sit in a tea house (on its benches): [{ at: [x, z], rot, y }] — the figures face the table before them. */
  function teaSeats(el, rand) {
    const door = el.door ?? 's', F = frame(el.rect, door), t = 0.7, iu = F.Wd / 2 - t, out = [];
    for (const [u0, u1, vw, dv] of teaRows(iu, t, F.Dp - t)) {
      for (let u = u0 + 0.5; u < u1 - 0.3; u += 0.8) {
        if (rand() < 0.45) continue;
        const at = F.P(u, vw + dv * 0.42), to = F.P(u, vw + dv * 1.5);
        out.push({ at, rot: Math.atan2(-(to[0] - at[0]), -(to[1] - at[1])), y: 0.0 });
      }
    }
    return out;
  }

  // ── tibetan_shop ────────────────────────────────────────────────────────────────
  /**
   * tibetan_shop: { rect, y, door ('s' | 'n' | 'e' | 'w': the front), kind ('trade' | 'tea'), seed } — a single-storey
   * whitewashed house whose one room is the shop, entered by a wide doorway under its valance and rolled curtain.
   * The trade shop: a counter across the room, shelves of stock to the ceiling on three walls (sacks of barley, wool,
   * bricks of tea, butter in skin bags, brass and copper pots, rugs, thangkas on racks), goods hanging from the beams
   * and outside the door the rugs on their rail and the sacks stacked. The tea house: low benches under rugs along
   * the side walls with low painted tables before them and bowls on them, the clay stove with its big kettle, the
   * wooden churn, shelves of bowls, a thangka over the counter and the butter lamps before it.
   */
  function shop(el, ctx) {
    const { bag, col, lights } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, door = el.door ?? 's', tea = el.kind === 'tea';
    const Hh = tea ? 5.4 : 4.7, ceil = tea ? 3.9 : 3.4, dw = tea ? 1.7 : 2.4, dh = 2.45;
    const { yi, t } = shell(ctx, el, { H: Hh, ceil, dw, dh, floor: tea ? 'planks_grey' : 'planks_grey' });
    const F = frame(el.rect, door), { Wd, Dp, P, R } = F;
    const iu = Wd / 2 - t, vi0 = t, vi1 = Dp - t;                   // the inner extent: u in ±iu, v from vi0 to vi1
    const B = (mat, u0, u1, v0, v1, y0, y1, solid = false) => { const r = R(u0, u1, v0, v1); bag.add(mat, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); };
    // the ceiling's beams across the room, on the walls
    for (let v = vi0 + 0.6; v < vi1 - 0.3; v += 1.25) B('lacquer_red', -iu, iu, v - 0.11, v + 0.11, ceil - 0.2, ceil);
    B('lacquer_red', -iu, iu, vi0, vi0 + 0.2, ceil - 0.2, ceil);
    // the front's windows: a pair of black-framed windows each side of the door high on the wall (the room's light), above it a row on the roof's edge
    const k = (Hh * 0.05) / (Hh + 0.3), nn = F.n, tt = F.t;
    for (const sg of [-1, 1]) for (const du of tea ? [2.1] : [2.6]) {
      if (Math.abs(du) > Wd / 2 - 0.9) continue;
      const p = P(sg * du, 0), yy = y + 1.35, ins = k * (yy - (y - 0.3)) - 0.01;
      win(bag, [p[0] - nn[0] * ins, p[1] - nn[1] * ins], tt, nn, yy, 0.8, rand, { k });
    }
    // a window each in the side walls, high
    for (const sg of [-1, 1]) {
      const p = P(sg * (Wd / 2), Dp * (tea ? 0.62 : 0.55)), sn = [tt[0] * sg, tt[1] * sg], yy = y + 1.7, ins = k * (yy - (y - 0.3)) - 0.01;
      win(bag, [p[0] - sn[0] * ins, p[1] - sn[1] * ins], [-sn[1], sn[0]], sn, yy, 0.75, rand, { k });
    }
    const lampAt = (u, v, yy, o = {}) => { const p = P(u, v); lights?.push({ at: [p[0], y + yy, p[1]], color: '#ffb46b', intensity: o.i ?? 1.6, distance: o.d ?? 6 }); };
    // the back wall's painted dado
    const backFace = (u0, u1, y0, y1, mat, d = 0.01) => { const a = P(u0, Dp - t - d), b2 = P(u1, Dp - t - d); face(bag, mat, [nn[0], nn[1]], [a[0], y + y0, a[1]], [b2[0], y + y0, b2[1]], [b2[0], y + y1, b2[1]], [a[0], y + y1, a[1]]); };
    backFace(-iu, iu, 0.04, 0.9, 'limewash_red'); backFace(-iu, iu, 0.9, 0.97, 'cloth_ochre', 0.014);
    if (tea) {
      // two pillars on the room's axis under a beam, red, with painted capitals
      const pv = (vi0 + vi1) / 2;
      for (const sg of [-1, 1]) {
        const pu = sg * Math.min(2.6, iu * 0.4), p = P(pu, pv);
        bag.add('lacquer_red', lathe([[0.17, 0], [0.15, ceil - 0.75], [0.18, ceil - 0.7]], 10, null, p[0], y + 0.04, p[1]));
        B('paint_dancheong', pu - 0.26, pu + 0.26, pv - 0.26, pv + 0.26, ceil - 0.72, ceil - 0.48);
        B('lacquer_red', pu - 0.18, pu + 0.18, pv - 1.6, pv + 1.6, ceil - 0.48, ceil - 0.22);
        col.circle(p[0], p[1], 0.2, y, y + ceil);
      }
      // benches along the front wall (each side of the door) and the back wall (a low wooden platform under a rug), a row of low tables before each
      for (const row of teaRows(iu, vi0, vi1)) {
        const [u0, u1, vw, dv] = row, vb = vw + dv * 0.85, vt0 = vw + dv * 1.03, vt1 = vw + dv * 1.6, lo = Math.min(vw, vb), hi = Math.max(vw, vb);
        B('wood_painted', u0, u1, lo, hi, 0.04, 0.4, true);
        B('cloth_red', u0 + 0.02, u1 - 0.02, lo + 0.02, hi - 0.02, 0.4, 0.43);
        for (let u = u0 + 0.3; u < u1 - 0.9; u += 1.3) B(Math.floor(u * 3) % 2 ? 'cloth_indigo' : 'cloth_ochre', u, u + 0.5, lo + 0.02, hi - 0.02, 0.43, 0.45);
        const nt = Math.max(1, Math.floor((u1 - u0) / 1.7));
        for (let i = 0; i < nt; i++) {
          const um = u0 + (u1 - u0) * (i + 0.5) / nt, hw = Math.min(0.5, (u1 - u0) / nt / 2 - 0.15), tl = Math.min(vt0, vt1), th = Math.max(vt0, vt1);
          B('lacquer_red', um - hw, um + hw, tl, th, 0.3, 0.38, true);
          B('wood_painted', um - hw + 0.03, um + hw - 0.03, tl + 0.03, th - 0.03, 0.04, 0.3);
          B('cloth_ochre', um - hw + 0.1, um + hw - 0.1, tl + 0.1, th - 0.1, 0.38, 0.385);
          for (const du of [-hw * 0.5, hw * 0.5]) { const c = P(um + du + (rand() - 0.5) * 0.04, (tl + th) / 2 + (rand() - 0.5) * 0.08); bowl(bag, rand() < 0.5 ? 'timber' : 'wood_painted', c[0], y + 0.385, c[1], 0.06); }
          if (i % 2 === 0) { const c = P(um, (tl + th) / 2 + 0.12); pot(bag, 'bronze', c[0], y + 0.385, c[1], 0.09); }
        }
      }
      // the counter and stove at the back: a clay stove with a big kettle, a flue; the churn, the water jar; shelves of bowls
      const su = iu - 1.1, sv = vi1 - 0.65;
      B('mud_plaster', su - 0.55, su + 0.55, sv - 0.4, sv + 0.4, 0.04, 0.85, true);
      B('iron', su - 0.5, su + 0.5, sv - 0.36, sv + 0.36, 0.85, 0.9);
      const sp = P(su, sv);
      for (const du of [-0.22, 0.22]) pot(bag, 'bronze', ...(() => { const c = P(su + du, sv); return [c[0], y + 0.9, c[1]]; })(), 0.2);
      bag.add('iron', rod([sp[0], y + 0.9, sp[1]], [sp[0], y + ceil, sp[1]], 0.07, 8));
      lampAt(su, sv - 0.5, 1.2, { i: 1.4, d: 5 });
      const cu = -iu + 0.7;
      B('wood_painted', cu - 0.9, cu + 0.9, vi1 - 0.9, vi1 - 0.05, 0.04, 0.95, true);
      B('lacquer_red', cu - 0.95, cu + 0.95, vi1 - 0.95, vi1 - 0.0, 0.95, 1.02);
      for (let i = 0; i < 4; i++) { const c = P(cu - 0.65 + i * 0.43, vi1 - 0.5); bowl(bag, i % 2 ? 'timber' : 'cloth_white', c[0], y + 1.02, c[1], 0.07); }
      const ch = P(cu + 1.55, vi1 - 0.45);
      bag.add('timber', lathe([[0.12, 0], [0.11, 0.9], [0.09, 0.92]], 10, null, ch[0], y + 0.04, ch[1]));
      for (const v of [0.12, 0.45, 0.78]) bag.add('iron', lathe([[0.123, v - 0.02], [0.123, v + 0.02]], 10, null, ch[0], y + 0.04, ch[1]));
      bag.add('timber', rod([ch[0], y + 0.9, ch[1]], [ch[0], y + 1.45, ch[1]], 0.018, 6));
      col.circle(ch[0], ch[1], 0.14, y, y + 1.4);
      const jr = P(-iu + 0.4, vi1 - 1.35); pot(bag, 'pottery_dark', jr[0], y + 0.04, jr[1], 0.3);
      col.circle(jr[0], jr[1], 0.3, y, y + 0.9);
      // the shelf above the counter and the thangka over it, a butter lamp before it
      B('wood_painted', cu - 1.4, cu + 1.4, vi1 - 0.35, vi1 - 0.02, 1.75, 1.8);
      for (let i = 0; i < 6; i++) { const c = P(cu - 1.15 + i * 0.46, vi1 - 0.2); bowl(bag, i % 3 ? 'timber' : 'wood_painted', c[0], y + 1.8, c[1], 0.07); }
      const tp = P(0.0, vi1 - t - 0.04 + 0.0);
      void tp;
      thangka(bag, { at: P(-0.4 - (iu > 3 ? 0.6 : 0), Dp - t - 0.03), u: tt, n: [nn[0], nn[1]], y: y + 1.95, w: 0.95, h: 1.15, kind: 3 + (el.seed || 0) % 5 });
      const lp = P(-0.4 - (iu > 3 ? 0.6 : 0), vi1 - 0.12);
      for (let i = 0; i < 3; i++) { const c = P(-0.4 - (iu > 3 ? 0.6 : 0) + (i - 1) * 0.2, vi1 - 0.12); bag.add('gilt_bronze', lathe([[0.03, 0], [0.02, 0.06], [0.05, 0.1], [0.001, 0.12]], 8, null, c[0], y + 1.8, c[1])); bag.add('flame', lathe([[0.001, 0], [0.012, 0.014], [0.001, 0.045]], 5, null, c[0], y + 1.92, c[1])); }
      void lp;
      lampAt(-0.4, vi1 - 0.4, 2.1, { i: 1.8, d: 6 });
      lampAt(0, vi0 + 1.0, 2.8, { i: 0.9, d: 6 });
    } else {
      // the counter across the room, a hatch beside it; shelves on the three walls, stock to the beams
      const cv = vi0 + 1.7;
      B('wood_painted', -iu + 1.0, iu, cv, cv + 0.7, 0.04, 1.02, true);
      B('lacquer_red', -iu + 0.95, iu + 0.0, cv - 0.05, cv + 0.75, 1.02, 1.09);
      // scale: a beam on a stand, two pans
      { const c = P(0.2, cv + 0.35), by = y + 1.09; bag.add('bronze', rod([c[0], by, c[1]], [c[0], by + 0.5, c[1]], 0.02, 6));
        const a = P(-0.15, cv + 0.35), b2 = P(0.55, cv + 0.35);
        bag.add('iron', rod([a[0], by + 0.5, a[1]], [b2[0], by + 0.5, b2[1]], 0.012, 5));
        for (const q of [a, b2]) { bag.add('iron', rod([q[0], by + 0.5, q[1]], [q[0], by + 0.12, q[1]], 0.004, 4)); bag.add('bronze', lathe([[0.001, 0], [0.1, 0.01], [0.12, 0.03]], 10, null, q[0], by + 0.1, q[1])); } }
      for (let i = 0; i < 3; i++) { const c = P(-iu + 1.6 + i * 0.6, cv + 0.3); sack(bag, 'sacking', c[0], y + 1.09, c[1], 0.6, rand() * 6); }
      // shelves: back wall and the two side walls, boards at three levels with what is sold on them
      const goods = (u, v, yy, kind, i) => {
        const c = P(u, v);
        if (kind === 0) sack(bag, i % 2 ? 'sacking' : 'cloth_white', c[0], y + yy, c[1], 0.75 + rand() * 0.2, rand() * 6);           // barley and flour
        else if (kind === 1) { for (let j = 0; j < 3; j++) bag.add('brick_grey', box(c[0] - 0.17, y + yy + j * 0.09, c[1] - 0.11, c[0] + 0.17, y + yy + (j + 1) * 0.09 - 0.005, c[1] + 0.11)); }  // bricks of tea
        else if (kind === 2) bag.add('hide_tan', lathe([[0.001, 0], [0.12, 0.02], [0.17, 0.12], [0.12, 0.26], [0.04, 0.32], [0.001, 0.3]], 8, null, c[0], y + yy, c[1]));   // butter in a skin bag
        else if (kind === 3) pot(bag, i % 2 ? 'bronze' : 'terracotta', c[0], y + yy, c[1], 0.1 + rand() * 0.05);
        else if (kind === 4) bag.add('hide_white', box(c[0] - 0.2, y + yy, c[1] - 0.14, c[0] + 0.2, y + yy + 0.34, c[1] + 0.14));   // a bale of wool
        else for (let j = 0; j < 3; j++) bowl(bag, 'timber', c[0], y + yy + j * 0.07, c[1], 0.07);
      };
      const lvls = [0.5, 1.45, 2.4];
      const side = (sg) => {
        const ua = sg * (iu - 0.5), ub = sg * iu;
        for (const yy of lvls) B('wood_painted', Math.min(ua, ub), Math.max(ua, ub), cv + 0.85, vi1 - 0.05, yy - 0.05, yy);
        col.rect(R(Math.min(ua, ub), Math.max(ua, ub), cv + 0.85, vi1 - 0.05), y, y + 2.5);
        for (let li = 0; li < 3; li++) for (let v = cv + 1.15 + (li * 0.2) % 0.4; v < vi1 - 0.6; v += 0.55) goods(sg * (iu - 0.25), v, lvls[li], (Math.floor(v * 3 + li * 2 + (sg > 0 ? 1 : 0) * 3)) % 6, li + (v | 0));
      };
      side(-1); side(1);
      for (const yy of lvls) B('wood_painted', -iu + 0.5, iu - 0.5, vi1 - 0.45, vi1 - 0.05, yy - 0.05, yy);
      col.rect(R(-iu + 0.5, iu - 0.5, vi1 - 0.45, vi1 - 0.05), y, y + 2.5);
      for (let li = 0; li < 3; li++) for (let u = -iu + 0.9; u < iu - 0.7; u += 0.6) goods(u, vi1 - 0.25, lvls[li], (Math.floor(u * 2 + li * 3 + 12)) % 6, li);
      // hanging from the beams: strings of dried cheese, yak-hair ropes, a rug folded over a rail, a thangka on its mount
      for (let i = 0; i < 4; i++) { const u = -iu + 0.8 + i * (2 * iu - 1.6) / 3, c = P(u, vi0 + 1.2 + rand() * 0.5); bag.add('rope_fibre', rod([c[0], y + ceil - 0.2, c[1]], [c[0], y + ceil - 0.9, c[1]], 0.012, 4)); for (let j = 0; j < 4; j++) bag.add('chalk', lathe([[0.001, 0], [0.04, 0.03], [0.001, 0.06]], 6, null, c[0], y + ceil - 0.9 + j * 0.1 - 0.28 + 0.28, c[1])); }
      lampAt(0, vi0 + 1.2, 2.9, { i: 1.4, d: 6 });
    }
    // outside: a rug on its rail, the sacks, a pot or two, the doorstep
    const door1 = F.P(0, 0);
    void door1;
    const out = (uu, vv) => P(uu, -vv);                      // vv metres out of the front
    if (!tea) {
      const ru = (Wd / 2 - 0.2) * (rand() < 0.5 ? -1 : 1) * 0.0 + (Wd / 2 - 1.1) * (rand() < 0.5 ? 1 : -1);
      // the rug rail: two posts, a rail at 1.9 m, three rugs hanging from it
      for (const du of [-1.0, 1.0]) { const c = out(ru + du, 0.18); bag.add('timber', rod([c[0], y, c[1]], [c[0], y + 2.0, c[1]], 0.04, 6)); col.circle(c[0], c[1], 0.05, y, y + 2); }
      { const a = out(ru - 1.0, 0.18), b2 = out(ru + 1.0, 0.18); bag.add('timber', rod([a[0], y + 1.96, a[1]], [b2[0], y + 1.96, b2[1]], 0.035, 6)); }
      for (let i = 0; i < 3; i++) rug(bag, nn, out(ru - 0.9 + i * 0.62, 0.24), out(ru - 0.4 + i * 0.62, 0.24), y + 0.5 + rand() * 0.15, 1.4, rand);
      for (let i = 0; i < 4; i++) { const c = out(-ru * 0.6 + (i % 2) * 0.5 - 0.3, 0.45 + (i >> 1) * 0.4); sack(bag, i % 3 ? 'sacking' : 'cloth_white', c[0], y + (i === 3 ? 0.55 : 0), c[1], 0.8, rand() * 6); }
    } else {
      // a wooden signboard-less front: the churn's twin, a pot on the step and a bench by the door
      const c = out(-dw / 2 - 0.9, 0.5); pot(bag, 'pottery_dark', c[0], y, c[1], 0.28); col.circle(c[0], c[1], 0.3, y, y + 0.9);
      const b1 = R(dw / 2 + 0.4, dw / 2 + 1.7, -0.7, -0.15);
      bag.add('wood_painted', box(b1[0], y + 0.3, b1[1], b1[2], y + 0.42, b1[3])); bag.add('wood_painted', box(b1[0] + 0.08, y, b1[1] + 0.06, b1[0] + 0.2, y + 0.3, b1[3] - 0.06)); bag.add('wood_painted', box(b1[2] - 0.2, y, b1[1] + 0.06, b1[2] - 0.08, y + 0.3, b1[3] - 0.06));
    }
    void yi; void iu;
    roofKit(ctx, el, Hh, rand, true);
  }

  // ── stall ────────────────────────────────────────────────────────────────────────
  /**
   * stall: { at: [x, z], y, rot ('s' | 'n' | 'e' | 'w': the way it faces), w, seed, goods } — an open booth of the street: four
   * posts, a sloped cloth awning in stripes, a counter of boards on trestles, the goods on it (heaped, in sacks, bowls, pots),
   * a rug hung behind; the stall-keeper's low seat.
   */
  function stall(el, ctx) {
    const { bag, col } = ctx, rand = rng(el.seed || 1), y = el.y ?? 0, side = el.rot ?? 's', W = el.w ?? 3.2, D = 2.4;
    const F = frame([el.at[0] - (side === 's' || side === 'n' ? W / 2 : D / 2), el.at[1] - (side === 's' || side === 'n' ? D / 2 : W / 2), el.at[0] + (side === 's' || side === 'n' ? W / 2 : D / 2), el.at[1] + (side === 's' || side === 'n' ? D / 2 : W / 2)], side);
    const { P, R, n, t } = F, B = (mat, u0, u1, v0, v1, y0, y1, solid) => { const r = R(u0, u1, v0, v1); bag.add(mat, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); if (solid) col.rect(r, y + y0, y + y1); };
    // posts and rails
    const hf = 2.55, hb = 2.2, posts = [[-W / 2, 0.1, hf], [W / 2, 0.1, hf], [-W / 2, D - 0.1, hb], [W / 2, D - 0.1, hb]];
    for (const [u, v, h] of posts) { const c = P(u, v); bag.add('timber', rod([c[0], y, c[1]], [c[0], y + h, c[1]], 0.05, 6)); col.circle(c[0], c[1], 0.06, y, y + h); }
    // the awning: stripes across the slope, double sided, with a hanging valance fringe at the front
    const ns = Math.round(W / 0.45), a = (u, v, h) => { const c = P(u, v); return [c[0], y + h, c[1]]; };
    for (let i = 0; i < ns; i++) {
      const u0 = -W / 2 - 0.1 + (W + 0.2) * i / ns, u1 = -W / 2 - 0.1 + (W + 0.2) * (i + 1) / ns, m = STRIPES[(i + (el.seed || 0)) % 5], A = a(u0, -0.25, hf + 0.05), Bq = a(u1, -0.25, hf + 0.05), C = a(u1, D + 0.1, hb + 0.05), Dq = a(u0, D + 0.1, hb + 0.05);
      face(bag, m, [0, 1], A, Bq, C, Dq); face(bag, m, [0, -1], A, Bq, C, Dq);
      face(bag, m, [n[0], n[1]], A, Bq, [Bq[0], Bq[1] - 0.3, Bq[2]], [A[0], A[1] - 0.3, A[2]]); face(bag, m, [-n[0], -n[1]], A, Bq, [Bq[0], Bq[1] - 0.3, Bq[2]], [A[0], A[1] - 0.3, A[2]]);
    }
    // the counter on trestles, its cloth, the goods
    B('wood_painted', -W / 2 + 0.1, W / 2 - 0.1, 0.55, 1.25, 0.82, 0.88, true);
    for (const u of [-W / 2 + 0.3, W / 2 - 0.3]) B('timber', u - 0.05, u + 0.05, 0.62, 1.18, 0, 0.82);
    B('cloth_ochre', -W / 2 + 0.1, W / 2 - 0.1, 0.5, 0.58, 0.55, 0.88);
    const items = Math.max(4, Math.floor(W / 0.4));
    const kindG = el.goods ?? Math.floor(rand() * 4);
    for (let i = 0; i < items; i++) {
      const u = -W / 2 + 0.3 + (W - 0.6) * (i + 0.5) / items, c = P(u, 0.9 + (rand() - 0.5) * 0.2);
      if (kindG === 0) bowl(bag, ['timber', 'pottery_dark', 'bronze', 'terracotta'][i % 4], c[0], y + 0.88, c[1], 0.1 + rand() * 0.04);
      else if (kindG === 1) sack(bag, i % 2 ? 'sacking' : 'cloth_white', c[0], y + 0.88, c[1], 0.55 + rand() * 0.2, rand() * 6);
      else if (kindG === 2) for (let j = 0; j < 4; j++) bag.add('limestone', lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.05], [0.001, 0.09]], 7, null, c[0] + (j % 2) * 0.09, y + 0.88 + (j >> 1) * 0.08, c[1] + ((j * 0.37) % 0.1)));
      else pot(bag, i % 2 ? 'bronze' : 'terracotta', c[0], y + 0.88, c[1], 0.1 + rand() * 0.04);
    }
    // a rug hung behind, the keeper's cushion
    rug(bag, [-n[0], -n[1]], P(W * 0.3, D - 0.2), P(-W * 0.3, D - 0.2), y + 0.7, 1.5, rand);
    B('cloth_red', -0.35, 0.35, 1.45, 2.05, 0, 0.1);
    void t;
  }

  /** flag_line: prayer flags in the five colours strung between two poles across the street { a: [x, z], b: [x, z], y0, y1 }: a thin cord sagging, the flags along it. */
  function flagLine(el, { bag }) {
    flagString(bag, [el.a[0], el.y0, el.a[1]], [el.b[0], el.y1 ?? el.y0, el.b[1]], el.sag ?? 0.7);
    const ax = el.a[0], az = el.a[1], bx = el.b[0], bz = el.b[1], L = Math.hypot(bx - ax, bz - az), n = Math.max(6, Math.floor(L / 0.5));
    let px = ax, py = el.y0, pz = az;
    for (let i = 1; i <= n; i++) { const tq = i / n, qx = ax + (bx - ax) * tq, qz = az + (bz - az) * tq, qy = el.y0 + ((el.y1 ?? el.y0) - el.y0) * tq - Math.sin(Math.PI * tq) * (el.sag ?? 0.7); bag.add('rope_fibre', rod([px, py, pz], [qx, qy, qz], 0.008, 3)); px = qx; py = qy; pz = qz; }
  }

  return { tibetan_shop: shop, stall, flag_line: flagLine, teaSeats };
}
