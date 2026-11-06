// house_mamluk: a Cairene town house of the 14th century (docs/settlements/mamluk-cairo.md §5).
// The ground storey cased in the Muqattam's yellow limestone; the upper storeys of brick, plastered,
// their front stepped out over the lane on rows of stepped stone corbels; on the first upper storey of
// many houses a mashrabiya, the projecting bay of turned wooden lattice, and small projecting lattice
// windows beside it; in the ground storey only small grilled windows set high, and the way in a deep
// recess with the door in its side wall, so that the passage bends and no one in the lane can see into
// the court (the bent entrance); a stone bench by the door; the flat plastered roof behind a parapet
// with wooden spouts, the malqaf — a hood of boards with its mouth to the north — the head of the stair,
// and now and then a shelter of palm sticks and the water jars.
// { rect [x0, z0, x1, z1], y (ground), storeys (2…3), front ('n'|'s'|'e'|'w'), plaster (0…1), seed, simple }

import { box, lathe, fromTriangles } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Both faces of a list of triangles (thin boards seen from either side). */
function dbl(t) { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return fromTriangles(o); }

export function houseMamluk(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, f = el.front || 's', n = Math.max(2, el.storeys || 2);
  const along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  // a frame: u along the front (0…L), v in from the front (0…D; negative = out over the lane)
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const rect = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, u1, v0, v1, ya, yb) => { const r = rect(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); return r; };
  // out from the ground storey's front (d metres over the lane)
  const O = (m, u0, u1, ya, yb, d0, d1) => B(m, u0, u1, -d1, -d0, ya, yb);
  const simple = !!el.simple;

  // the storeys: the stone ground storey a little taller than the upper ones
  const st0 = 3.7 + rand() * 0.4, stU = 3.0 + rand() * 0.35, H = st0 + (n - 1) * stU, yU = y + st0;
  const J1 = 0.5 + rand() * 0.2, J2 = n > 2 && rand() < 0.45 ? 0.3 : 0, Jt = J1 + J2;
  // (far off, one plaster for all: the tiles' meshes are counted per material)
  const wall = simple ? 'plaster' : el.plaster > 0.75 ? 'plaster_white' : el.plaster > 0.3 ? 'plaster' : 'mud_plaster';
  const stone = 'limestone_yellow', dress = simple ? stone : 'limestone';
  // the bent entrance: a recess Wn wide, Dn deep, hn high, the door in one of its side walls
  const Wn = 1.7, Dn = 1.5, hn = 3.0, du = Math.max(0.9, Math.min(L - Wn - 0.9, 0.9 + rand() * (L - Wn - 1.8))), doorLeft = rand() < 0.5;

  // the footing (also the recess's floor) and the stone storey round the recess
  bag.add(dress, box(...(() => { const r = rect(-0.08, -0.08, L + 0.08, D + 0.08); return [r[0], y - 0.8, r[1], r[2], y + 0.3, r[3]]; })()));
  if (simple) {
    B(stone, 0, L, 0, D, y + 0.3, yU); col.rect(rect(0, 0, L, D), y - 0.8, y + H);
    O('opening', du, du + Wn, y + 0.3, y + hn, -0.01, 0.02);
  } else {
    for (const [u0, u1, v0, v1, yt] of [[0, du, 0, D, yU], [du + Wn, L, 0, D, yU], [du, du + Wn, Dn, D, yU]]) { const r = B(stone, u0, u1, v0, v1, y + 0.3, yt); col.rect(r, y - 0.8, y + H); }
    B(stone, du, du + Wn, 0, Dn, y + hn, yU);
    col.floor(rect(du, 0, du + Wn, Dn), y + 0.3);
    // the recess's ceiling of palm-trunk beams under the stone
    for (let k = 0; k < 4; k++) { const v = 0.2 + k * (Dn - 0.3) / 3; B('palm_trunk', du, du + Wn, v - 0.07, v + 0.07, y + hn - 0.14, y + hn); }
    // the door in the side wall: its stone frame, the painted leaf, the knocker; the wooden lock above
    const us = doorLeft ? du : du + Wn, sd = (a, b) => (doorLeft ? [us + a, us + b] : [us - b, us - a]);
    const [fa, fb] = sd(0, 0.09), [la, lb] = sd(0, 0.05);
    B(dress, fa, fb, 0.12, 0.3, y + 0.3, y + 2.62); B(dress, fa, fb, 1.3, 1.48, y + 0.3, y + 2.62); B(dress, fa, fb, 0.12, 1.48, y + 2.42, y + 2.62);
    B(rand() < 0.6 ? 'wood_painted' : 'wood_dark', la, lb, 0.3, 1.3, y + 0.3, y + 2.42);
    { const [ka, kb] = sd(0.05, 0.1); B(dress, ka, kb, 1.12, 1.18, y + 1.3, y + 1.48); B('wood_dark', ka, kb, 1.1, 1.24, y + 1.6, y + 1.9); }
    // the stone bench (mastaba) against the recess's back wall, and a small grilled window over it
    B(dress, du + 0.08, du + Wn - 0.08, Dn - 0.45, Dn, y + 0.3, y + 0.75); col.rect(rect(du + 0.08, Dn - 0.45, du + Wn - 0.08, Dn), y, y + 0.75);
    // the lintel over the recess's mouth: joggled voussoirs of two stones on some houses, a plain lintel on others
    if (rand() < 0.45) { const k = 7; for (let i = 0; i < k; i++) O(i % 2 ? dress : stone, du - 0.15 + i * (Wn + 0.3) / k, du - 0.15 + (i + 1) * (Wn + 0.3) / k, y + hn, y + hn + 0.45, 0, 0.05); }
    else O(dress, du - 0.15, du + Wn + 0.15, y + hn, y + hn + 0.35, 0, 0.05);
    O(dress, du - 0.15, du, y + 0.3, y + hn, 0, 0.05); O(dress, du + Wn, du + Wn + 0.15, y + 0.3, y + hn, 0, 0.05);
    // the bench in the lane beside the recess
    const left = du > 2.0, bu = left ? du - 1.75 : du + Wn + 0.35;
    if (left || L - (du + Wn) > 2.0) { O(dress, bu, bu + 1.4, y + 0.3, y + 0.72, 0, 0.5); O(dress, bu - 0.03, bu + 1.43, y + 0.72, y + 0.8, 0, 0.55); col.rect(rect(bu, -0.55, bu + 1.4, 0), y, y + 0.8); }
    // small grilled windows set high in the stone storey, out of the passer-by's sight
    const gw = [];
    for (const u of [du / 2, du + Wn + (L - du - Wn) / 2]) if ((u < du ? du : L - du - Wn) > 1.6) gw.push(u);
    for (const u of gw) {
      const v0 = y + 2.35, w = 0.6, h = 0.55;
      O(dress, u - w / 2 - 0.1, u + w / 2 + 0.1, v0 - 0.1, v0 + h + 0.1, 0, 0.04);
      O('opening', u - w / 2, u + w / 2, v0, v0 + h, 0.04, 0.05);
      for (let k = 1; k < 5; k++) O('wood_dark', u - w / 2 + k * w / 5 - 0.012, u - w / 2 + k * w / 5 + 0.012, v0, v0 + h, 0.05, 0.075);
      O('wood_dark', u - w / 2, u + w / 2, v0 + h / 2 - 0.012, v0 + h / 2 + 0.012, 0.075, 0.095);
    }
    // a moulded course where the stone ends
    B(dress, -0.06, L + 0.06, -0.06, D + 0.06, yU - 0.22, yU);
  }

  // the upper storeys of plastered brick, stepped out over the lane on rows of stepped corbels
  const yT = y + H;
  if (J2) { B(wall, 0, L, -J1, D, yU, yU + stU); B(wall, 0, L, -Jt, D, yU + stU, yT); }
  else B(wall, 0, L, -J1, D, yU, yT);
  if (!simple) {
    const nc = Math.max(3, Math.round(L / 0.8));
    for (let i = 0; i < nc; i++) {
      const u = (i + 0.5) * L / nc;
      for (let k = 0; k < 3; k++) O(dress, u - 0.14, u + 0.14, yU - 0.66 + k * 0.22, yU - 0.44 + k * 0.22, 0, J1 * (k + 1) / 3);
    }
    O('wood_dark', 0, L, yU - 0.06, yU + 0.14, J1 - 0.02, J1 + 0.05);
    if (J2) { O('wood_dark', 0, L, yU + stU - 0.08, yU + stU + 0.12, Jt - 0.02, Jt + 0.05); for (let i = 0; i < Math.round(L / 0.6); i++) { const u = (i + 0.5) * L / Math.round(L / 0.6); O('wood_dark', u - 0.06, u + 0.06, yU + stU - 0.4, yU + stU - 0.08, J1, Jt); } }
  }

  // the mashrabiya bay on the first upper storey (and on some three-storey houses a second above)
  const bays = [];
  if (L >= 4.6 && rand() < 0.65) bays.push(1);
  if (n > 2 && L >= 4.6 && rand() < 0.4) bays.push(2);
  const taken = [];
  for (const s of bays) {
    const w = Math.min(3.0, L - 1.8) * (0.8 + rand() * 0.2), um = Math.max(0.9 + w / 2, Math.min(L - 0.9 - w / 2, L / 2 + (rand() - 0.5) * (L - w - 1.8)));
    const a = um - w / 2, b = um + w / 2, yo = y + st0 + (s - 1) * stU + 0.3, Df = s === 1 ? J1 : Jt, Dp = 0.6, hb = Math.min(stU - (s === n - 1 ? 1.05 : 0.45), 2.35);
    taken.push([s, a - 0.2, b + 0.2]);
    if (simple) { O('koshi', a, b, yo, yo + hb, Df, Df + Dp); continue; }
    // three stepped wooden corbels under it, the floor board, the painted apron
    for (const u of [a + 0.12, um, b - 0.12]) for (let k = 0; k < 3; k++) O('wood_dark', u - 0.07, u + 0.07, yo - 0.62 + k * 0.2, yo - 0.42 + k * 0.2, Df, Df + Dp * (k + 1) / 3);
    O('wood_dark', a, b, yo - 0.12, yo + 0.05, Df, Df + Dp);
    O('wood_painted', a, b, yo + 0.05, yo + 0.42, Df + Dp - 0.06, Df + Dp);
    for (const s2 of [a, b]) O('wood_painted', s2 === a ? a : b - 0.06, s2 === a ? a + 0.06 : b, yo + 0.05, yo + 0.42, Df, Df + Dp - 0.06);
    // the turned lattice in front and at the sides, a finer band above, the corner posts and the mullion
    O('koshi', a + 0.08, b - 0.08, yo + 0.42, yo + hb - 0.4, Df + Dp - 0.05, Df + Dp - 0.01);
    for (const s2 of [a, b]) O('koshi', s2 === a ? a : b - 0.04, s2 === a ? a + 0.04 : b, yo + 0.42, yo + hb - 0.4, Df, Df + Dp - 0.08);
    for (const u of [a, b]) O('wood_dark', u === a ? a : b - 0.08, u === a ? a + 0.08 : b, yo + 0.05, yo + hb, Df + Dp - 0.08, Df + Dp);
    O('wood_dark', um - 0.04, um + 0.04, yo + 0.42, yo + hb - 0.4, Df + Dp - 0.08, Df + Dp);
    O('koshi', a + 0.08, b - 0.08, yo + hb - 0.4, yo + hb, Df + Dp - 0.05, Df + Dp - 0.01);
    for (const s2 of [a, b]) O('koshi', s2 === a ? a : b - 0.04, s2 === a ? a + 0.04 : b, yo + hb - 0.4, yo + hb, Df, Df + Dp - 0.08);
    // the little cage at the sill where the water jars stand to cool in the draught
    if (rand() < 0.6) { const cw = 0.7; O('koshi', um - cw / 2, um + cw / 2, yo + 0.42, yo + 0.95, Df + Dp, Df + Dp + 0.28); O('wood_dark', um - cw / 2 - 0.03, um + cw / 2 + 0.03, yo + 0.95, yo + 1.02, Df + Dp - 0.01, Df + Dp + 0.31); O('wood_dark', um - cw / 2 - 0.03, um + cw / 2 + 0.03, yo + 0.36, yo + 0.42, Df + Dp - 0.01, Df + Dp + 0.31); }
    // the hood: a projecting cornice of boards
    O('wood_dark', a - 0.12, b + 0.12, yo + hb, yo + hb + 0.14, Df, Df + Dp + 0.16);
    O('wood_painted', a - 0.16, b + 0.16, yo + hb + 0.14, yo + hb + 0.2, Df, Df + Dp + 0.2);
  }

  // smaller projecting lattice windows on the upper storeys of the front, framed windows at the back
  const shubbak = (s, u, Df) => {
    const w = 0.85 + rand() * 0.2, h = 1.25, yo = y + st0 + (s - 1) * stU + 0.9, dp = 0.32;
    if (simple) { O('koshi', u - w / 2, u + w / 2, yo, yo + h, Df, Df + dp); return; }
    O('wood_dark', u - w / 2 - 0.05, u + w / 2 + 0.05, yo - 0.1, yo, Df, Df + dp + 0.05);
    for (const s2 of [-1, 1]) O('wood_dark', u + s2 * (w / 2 - 0.08) - 0.06, u + s2 * (w / 2 - 0.08) + 0.06, yo - 0.32, yo - 0.1, Df, Df + 0.22);
    O('koshi', u - w / 2 + 0.05, u + w / 2 - 0.05, yo, yo + h, Df + dp - 0.04, Df + dp - 0.01);
    for (const s2 of [-1, 1]) O('koshi', s2 < 0 ? u - w / 2 : u + w / 2 - 0.03, s2 < 0 ? u - w / 2 + 0.03 : u + w / 2, yo, yo + h, Df, Df + dp - 0.05);
    for (const s2 of [-1, 1]) O('wood_dark', s2 < 0 ? u - w / 2 : u + w / 2 - 0.05, s2 < 0 ? u - w / 2 + 0.05 : u + w / 2, yo, yo + h, Df + dp - 0.05, Df + dp);
    O('wood_dark', u - w / 2 - 0.08, u + w / 2 + 0.08, yo + h, yo + h + 0.1, Df, Df + dp + 0.08);
  };
  for (let s = 1; s < n; s++) {
    const Df = s === 1 ? J1 : Jt, nb = Math.max(2, Math.floor(L / 2.4));
    for (let k = 0; k < nb; k++) {
      const u = (k + 0.5) * L / nb;
      if (taken.some(([ts, a, b]) => ts === s && u + 0.6 > a && u - 0.6 < b)) continue;
      if (rand() < 0.22) continue;
      shubbak(s, Math.max(0.7, Math.min(L - 0.7, u)), Df);
    }
  }
  if (!simple) {
    // at the back: small windows with wooden grilles in plain frames, over the court or the next house
    for (let s = 1; s < n; s++) {
      const nb = Math.max(1, Math.floor(L / 3.2));
      for (let k = 0; k < nb; k++) {
        if (rand() < 0.4) continue;
        const u = (k + 0.5) * L / nb, yo = y + st0 + (s - 1) * stU + 1.1, w = 0.7, h = 0.9;
        B('wood_dark', u - w / 2 - 0.08, u + w / 2 + 0.08, D, D + 0.05, yo - 0.08, yo + h + 0.08);
        B('koshi', u - w / 2, u + w / 2, D + 0.05, D + 0.07, yo, yo + h);
      }
    }
  }

  if (!simple) {
    // a wooden beam course at the upper floor (where the front does not step out again), and under the
    // parapet a cornice of two plaster steps on a wooden band
    if (n > 2 && !J2) O('wood_dark', 0, L, yU + stU - 0.1, yU + stU + 0.08, J1, J1 + 0.05);
    O('wood_dark', 0, L, yT - 0.42, yT - 0.3, Jt, Jt + 0.05);
    O(wall, 0, L, yT - 0.3, yT - 0.15, Jt, Jt + 0.08); O(wall, 0, L, yT - 0.15, yT, Jt, Jt + 0.16);
  }
  // the roof: the parapet with its coping and spouts
  const par = 1.0 + rand() * 0.3, t = 0.25;
  for (const [u0, u1, v0, v1] of [[0, L, -Jt, -Jt + t], [0, L, D - t, D], [0, t, -Jt + t, D - t], [L - t, L, -Jt + t, D - t]]) B(wall, u0, u1, v0, v1, yT, yT + par);
  if (!simple) {
    for (const [u0, u1, v0, v1] of [[-0.04, L + 0.04, -Jt - 0.04, -Jt + t + 0.04], [-0.04, L + 0.04, D - t - 0.04, D + 0.04]]) B(dress, u0, u1, v0, v1, yT + par, yT + par + 0.08);
    for (const [u0, u1, v0, v1] of [[-0.04, t + 0.04, -Jt + t + 0.04, D - t - 0.04], [L - t - 0.04, L + 0.04, -Jt + t + 0.04, D - t - 0.04]]) B(dress, u0, u1, v0, v1, yT + par, yT + par + 0.08);
    for (const u of [L * 0.3, L * 0.7]) { B('wood_dark', u - 0.08, u + 0.08, -Jt - 0.5, -Jt + t, yT + 0.05, yT + 0.2); B('wood_dark', u - 0.08, u + 0.08, D - t, D + 0.5, yT + 0.05, yT + 0.2); }
  }

  // the malqaf, its mouth to the north (Lane: "directed towards the north or north-west")
  if ((el.malqaf ?? rand() < 0.55) && L > 4 && D > 4) {
    const mx = x0 + 2 + rand() * (x1 - x0 - 4), Rn = f === 'n' ? z0 - Jt : z0, m0 = Rn + 0.3, m1 = m0 + 1.4, hw = 0.8, ha = yT + 3.0 + rand() * 1.0, hb = yT + par + 0.6;
    // the side cheeks rising to the mouth, the back wall low, the board roof sloping down to the south
    // the shaft's side walls to the height of the back, posts at the mouth; above them the hood's sides
    // of boards under the sloping board roof
    const yp = ha + (hb - ha) / (m1 - m0) * 0.12;
    for (const [xa, xb] of [[mx - hw, mx - hw + 0.14], [mx + hw - 0.14, mx + hw]]) {
      bag.add(wall, box(xa, yT, m0, xb, hb, m1));
      bag.add('wood_dark', box(xa, hb, m0, xb, yp, m0 + 0.12));
      const xc = (xa + xb) / 2;
      bag.add('wood_dark', dbl([xc, hb, m0 + 0.12, xc, yp, m0 + 0.12, xc, hb, m1]));
    }
    bag.add(wall, box(mx - hw + 0.14, yT, m1 - 0.14, mx + hw - 0.14, hb, m1));
    const k = (hb - ha) / (m1 - m0), ya0 = ha + k * -0.15 + 0.03, yb0 = ha + k * (m1 + 0.1 - m0) + 0.03;
    const roofT = [mx - hw - 0.08, ya0, m0 - 0.15, mx + hw + 0.08, ya0, m0 - 0.15, mx + hw + 0.08, yb0, m1 + 0.1, mx - hw - 0.08, ya0, m0 - 0.15, mx + hw + 0.08, yb0, m1 + 0.1, mx - hw - 0.08, yb0, m1 + 0.1];
    bag.add('wood_dark', dbl(roofT));
    // the shaft's dark throat behind the mouth
    // the sill wall under the mouth, the shaft's dark throat behind it, the bars across the mouth
    const ys = yT + par + 0.1;
    bag.add(wall, box(mx - hw + 0.14, yT, m0, mx + hw - 0.14, ys, m0 + 0.14));
    bag.add('opening', box(mx - hw + 0.14, ys, m0 + 0.5, mx + hw - 0.14, ha - 0.3, m0 + 0.52));
    if (!simple) for (let k = 1; k < 4; k++) bag.add('wood_dark', box(mx - hw + 0.14, ys + k * (ha - ys - 0.3) / 4 - 0.03, m0 + 0.02, mx + hw - 0.14, ys + k * (ha - ys - 0.3) / 4 + 0.03, m0 + 0.08));
  }
  if (simple) return;
  // the head of the stair: a little room on the roof with its door
  // (on the south side of the terrace, clear of the malqaf on the north)
  const cu = along ? (rand() < 0.5 ? t + 0.05 : L - t - 1.85) : L - t - 1.85, cv = f === 's' ? -Jt + t + 0.05 : f === 'n' ? D - t - 1.85 : D / 2 - 0.9;
  if (rand() < 0.5) {
    B(wall, cu, cu + 1.8, cv, cv + 1.8, yT, yT + 2.3); B(dress, cu - 0.05, cu + 1.85, cv - 0.05, cv + 1.85, yT + 2.3, yT + 2.4);
    if (cv + 0.9 < D / 2) B('wood_dark', cu + 0.5, cu + 1.3, cv + 1.8, cv + 1.84, yT, yT + 1.9); else B('wood_dark', cu + 0.5, cu + 1.3, cv - 0.04, cv, yT, yT + 1.9);
  } else if (rand() < 0.6) {
    // a shelter of palm sticks over part of the terrace, a reed mat on it
    const sx = Math.max(t + 0.3, L / 2 - 1.6), ex = Math.min(L - t - 0.3, sx + 3.0), sv = D / 2 - 0.6, ev = Math.min(D - t - 0.3, sv + 2.4);
    for (const [pu, pv] of [[sx, sv], [ex, sv], [sx, ev], [ex, ev]]) B('palm_trunk', pu - 0.05, pu + 0.05, pv - 0.05, pv + 0.05, yT, yT + 2.05);
    for (const pv of [sv, ev]) B('palm_trunk', sx - 0.1, ex + 0.1, pv - 0.05, pv + 0.05, yT + 2.05, yT + 2.13);
    B('reed_mat', sx - 0.15, ex + 0.15, sv - 0.15, ev + 0.15, yT + 2.13, yT + 2.18);
  }
  // the water jars (zir) on the terrace
  const nj = Math.floor(rand() * 3);
  for (let k = 0; k < nj; k++) { const p = P(t + 0.45, D / 2 - 0.7 + k * 0.7); bag.add('terracotta', lathe([[0.12, 0], [0.26, 0.2], [0.27, 0.45], [0.16, 0.66], [0.13, 0.72], [0.001, 0.72]], 10, null, p[0], yT, p[1])); }
}
