// Stone and brick of the Balinese village (docs/settlements/bali-village.md §3, §4.1): walls with their pilasters and coping, the split gate
// (candi bentar), the roofed gate (kori agung), the compound's gate with its spirit wall, the padmasana, the shrines, guardian statues.
import { box, lathe } from '../../core/geom.js';
import { bx, post, thatchHip, steps, coping, sash, rng, TAU } from './kit.js';

/** A guardian statue (a squat figure on a plinth with a club, a poleng cloth at its waist): at (x, z), y the ground, facing 'n' | 's' | 'e' | 'w'. */
export function guardian(ctx, x, z, y, h = 1.3) {
  bx(ctx, 'tuff_hewn', x - 0.3, y, z - 0.3, x + 0.3, y + 0.4, z + 0.3, true);
  bx(ctx, 'tuff_hewn', x - 0.25, y + 0.4, z - 0.2, x + 0.25, y + h * 0.62, z + 0.2);
  sash(ctx, x, z, y + 0.62, 0.22);
  ctx.bag.add('tuff_hewn', lathe([[0.001, 0], [0.19, 0.0], [0.2, 0.18], [0.12, 0.32], [0.001, 0.34]], 8, null, x, y + h * 0.62, z));
  bx(ctx, 'tuff_hewn', x - 0.04, y + 0.45, z - 0.3, x + 0.04, y + h * 0.9, z - 0.22);          // the club
  bx(ctx, 'tuff_hewn', x - 0.34, y + h * 0.62 + 0.3, z - 0.1, x - 0.2, y + h * 0.62 + 0.45, z + 0.1);
}

/**
 * bali_wall: { a, b, h, th, mat, gaps: [{ at, w }], pilasters, cap ('stone' | 'thatch') } — axis-aligned. Brick over a stone footing, a pilaster every
 * 4–5 m, a stepped stone coping (or, for the poorer, a ridge of thatch).
 */
export function wall(el, ctx) {
  const [ax, az] = el.a, [bx_, bz] = el.b, alongX = Math.abs(bx_ - ax) >= Math.abs(bz - az), L = alongX ? Math.abs(bx_ - ax) : Math.abs(bz - az);
  const sg = alongX ? Math.sign(bx_ - ax) || 1 : Math.sign(bz - az) || 1, th = el.th ?? 0.5, h = el.h ?? 2.3, mat = el.mat ?? 'brick', y0 = el.y ?? 0;
  const gaps = (el.gaps ?? []).map((g) => [g.at - g.w / 2, g.at + g.w / 2]).sort((p, q) => p[0] - q[0]);
  const R = (s0, s1, t = th) => (alongX ? [Math.min(ax + sg * s0, ax + sg * s1), az - t / 2, Math.max(ax + sg * s0, ax + sg * s1), az + t / 2] : [ax - t / 2, Math.min(az + sg * s0, az + sg * s1), ax + t / 2, Math.max(az + sg * s0, az + sg * s1)]);
  const piece = (s0, s1) => {
    if (s1 - s0 < 0.05) return;
    const r = R(s0, s1);
    bx(ctx, mat, r[0], y0 - 0.3, r[1], r[2], y0 + h, r[3], true);
    const f = R(s0, s1, th + 0.1);
    bx(ctx, 'andesite', f[0], y0 - 0.3, f[1], f[2], y0 + 0.5, f[3]);
    if (el.cap === 'thatch') { const c = R(s0, s1, th + 0.5); bx(ctx, 'thatch', c[0], y0 + h, c[1], c[2], y0 + h + 0.35, c[3]); }
    else { const c = R(s0, s1, th + 0.1); coping(ctx, c[0] + 0.04, c[1] + 0.04, c[2] - 0.04, c[3] - 0.04, y0 + h); }
    // the weathering of a humid climate: a damp, green-black band above the footing, moss at the foot, streaks running down from the coping, patches where the plaster has gone
    if (el.weather !== false && s1 - s0 > 0.8) {
      const hs = Math.imul(Math.round(ax * 7.3 + az * 3.1 + s0 * 5.7), 2654435761) >>> 0, hr = (k) => ((Math.imul(hs ^ (k * 0x9e3779b1), 1274126177) >>> 0) / 4294967296);
      const wb = R(s0 + 0.03, s1 - 0.03, th + 0.03); bx(ctx, 'plaster_damp', wb[0], y0 + 0.5, wb[1], wb[2], y0 + 0.9, wb[3]);
      const nm = Math.floor((s1 - s0) / 1.8);
      for (let k = 0; k < nm; k++) { const a = s0 + 0.2 + hr(k) * Math.max(0.1, s1 - s0 - 0.9), m = R(a, a + 0.35 + hr(k + 9) * 0.4, th + 0.07); bx(ctx, 'sod', m[0], y0 + 0.45 + hr(k + 3) * 0.3, m[1], m[2], y0 + 0.62 + hr(k + 3) * 0.5, m[3]); }
      const ns = Math.floor((s1 - s0) / 2.4);
      for (let k = 0; k < ns; k++) { const a = s0 + 0.3 + hr(k + 20) * Math.max(0.1, s1 - s0 - 0.8), st = R(a, a + 0.12 + hr(k + 30) * 0.14, th + 0.11), len = Math.min(0.7 + hr(k + 40) * 0.9, h - 1.17); bx(ctx, 'plaster_streak', st[0], y0 + h - len, st[1], st[2], y0 + h, st[3]); }
      if (hr(77) < 0.5) { const a = s0 + 0.4 + hr(78) * Math.max(0.1, s1 - s0 - 1.4), pt = R(a, a + 0.6, th + 0.05); bx(ctx, 'plaster_damp', pt[0], y0 + 1.04, pt[1], pt[2], y0 + 1.5 + hr(79) * 0.3, pt[3]); }
    }
    // the pilasters
    const n = Math.max(0, Math.floor((s1 - s0) / 4.4));
    for (let k = 0; k <= n; k++) {
      const s = n === 0 ? (s0 + s1) / 2 : s0 + 0.3 + (s1 - s0 - 0.6) * k / n;
      if (n === 0 && s1 - s0 < 3) break;
      const p = R(s - 0.25, s + 0.25, th + 0.22);
      bx(ctx, mat, p[0], y0, p[1], p[2], y0 + h + 0.12, p[3]);
      coping(ctx, p[0], p[1], p[2], p[3], y0 + h + 0.12, 'tuff_hewn');
    }
  };
  let s = 0;
  for (const [g0, g1] of gaps) { piece(s, Math.max(s, g0)); s = g1; }
  piece(s, L);
}

/**
 * bali_candi_bentar: { c [x, z], gap, y, depth, h, steps (rise through the gap toward −z) } — the split gate facing south (the way in from +z, going north):
 * two stepped halves, the inner faces upright, the outer faces stepping in; the stair through the gap; guardian stones at the foot; a ratna finial.
 */
export function candiBentar(el, ctx) {
  const [cx, cz] = el.c, g = el.gap ?? 5, W = el.w ?? 4.4, D = el.depth ?? 3.6, y = el.y ?? 0, rise = el.rise ?? 1.2;
  for (const s of [-1, 1]) {
    const ix = cx + s * g / 2, ox = (k) => cx + s * (g / 2 + W - k);
    const slab = (mat, k, ym, yt, d = 0) => bx(ctx, mat, Math.min(ix, ox(k)), ym, cz - D / 2 + d, Math.max(ix, ox(k)), yt, cz + D / 2 - d, true);
    // foot: stone, with a step out; body: brick with carved panels; the cornice; then the tapering tiers
    slab('andesite', -0.25, y - 0.3, y + 0.45); slab('tuff_hewn', 0, y + 0.45, y + 0.6);
    slab('andesite', 0.1, y + 0.6, y + 1.6, 0.05);
    slab('brick', 0.25, y + 1.6, y + 2.9, 0.12);
    // carved panels (niches) on the outer face
    for (const [zz, w2] of [[cz, 1.3]]) bx(ctx, 'tuff_hewn', Math.min(ox(0.25), ox(0.25) + s * 0.04) - (s > 0 ? 0 : 0.0), y + 1.8, zz - w2 / 2, Math.max(ox(0.25), ox(0.25) + s * 0.04), y + 2.7, zz + w2 / 2);
    slab('tuff_hewn', 0.15, y + 2.9, y + 3.1, 0.0); slab('tuff_hewn', 0.0, y + 3.1, y + 3.3, -0.05);
    let yy = y + 3.3;
    for (let k = 0; k < 8; k++) {
      const hh = 0.5 - k * 0.025, inset = 0.4 + k * 0.38, dd = 0.15 + k * 0.17;
      slab(k % 2 ? 'tuff_hewn' : 'brick', inset, yy, yy + hh, dd);
      yy += hh;
    }
    // the pinnacle (ratna) on top
    const px = cx + s * (g / 2 + 0.55), top = yy;
    ctx.bag.add('tuff_hewn', lathe([[0.001, 0], [0.34, 0], [0.3, 0.16], [0.18, 0.4], [0.12, 0.7], [0.2, 0.84], [0.001, 1.1]], 8, null, px, top, cz));
    // guardian stones at the foot of the stair, on the outer side of each half
    void px;
  }
  steps(ctx, [cx - g / 2, cz - D / 2, cx + g / 2, cz + D / 2], y, y + rise, 'n', 'andesite', 0.17, y - 0.3);
  for (const s of [-1, 1]) {
    const gx = cx + s * (g / 2 + W + 0.55);
    if (el.guards !== false) { bx(ctx, 'tuff_hewn', gx - 0.3, y, cz + D / 2 - 0.5, gx + 0.3, y + 0.4, cz + D / 2 + 0.1, true); }
  }
  void rng; void TAU; void box;
}

/**
 * bali_kori: { c [x, z], w (the passage), y (the court's floor at the foot of the gate), h (the passage height), up (how far the stair rises through it) } — the roofed
 * gate between the courts, facing south: foot, body with the passage, the lintel with the bhoma face, nine tapering tiers, a little roof of ijuk and the pinnacle.
 */
export function kori(el, ctx) {
  const [cx, cz] = el.c, w = el.w ?? 2.6, y = el.y ?? 0, ph = el.h ?? 3.0, D = el.depth ?? 4.4, PW = el.pw ?? 2.6, up = el.up ?? 1.6;
  for (const s of [-1, 1]) {
    const ix = cx + s * w / 2, ox = (k) => cx + s * (w / 2 + PW - k), sl = (mat, k, ym, yt, d = 0) => bx(ctx, mat, Math.min(ix, ox(k)), ym, cz - D / 2 + d, Math.max(ix, ox(k)), yt, cz + D / 2 - d, true);
    sl('andesite', -0.2, y - 0.3, y + 0.5); sl('tuff_hewn', 0, y + 0.5, y + 0.65);
    sl('brick', 0.1, y + 0.65, y + 0.65 + (ph - 0.65), 0.05);
    sl('tuff_hewn', 0.0, y + ph, y + ph + 0.2, -0.1);
  }
  // the lintel and the mass over the passage: tapering tiers of brick and stone
  let yy = y + ph;
  const tiers = 7;
  const half = w / 2 + PW;
  for (let k = 0; k < tiers; k++) {
    const hh = 0.55 - k * 0.02, a = half - 0.1 - k * (half - 0.9) / tiers, d = D / 2 - 0.15 - k * (D / 2 - 0.7) / tiers, m = k % 3 === 2 ? 'tuff_hewn' : 'brick';
    bx(ctx, m, cx - a, yy, cz - d, cx + a, yy + hh, cz + d, k === 0);
    if (k % 3 === 2) bx(ctx, 'tuff_hewn', cx - a - 0.12, yy + hh - 0.08, cz - d - 0.12, cx + a + 0.12, yy + hh + 0.1, cz + d + 0.12);
    yy += hh + (k % 3 === 2 ? 0.1 : 0);
  }
  // the bhoma face over the passage (south side): a heavy brow, two eyes, a wide mouth, flanking wings
  const bz = cz + D / 2 - 0.05, by = y + ph + 0.12;
  bx(ctx, 'tuff_hewn', cx - 0.75, by, bz, cx + 0.75, by + 1.0, bz + 0.18);
  bx(ctx, 'wood_dark', cx - 0.5, by + 0.62, bz + 0.18, cx - 0.25, by + 0.8, bz + 0.22); bx(ctx, 'wood_dark', cx + 0.25, by + 0.62, bz + 0.18, cx + 0.5, by + 0.8, bz + 0.22);
  bx(ctx, 'wood_dark', cx - 0.4, by + 0.12, bz + 0.18, cx + 0.4, by + 0.28, bz + 0.22);
  for (const t of [-1, 1]) bx(ctx, 'tuff_hewn', cx + t * 1.0, by + 0.2, bz, cx + t * 1.5, by + 0.9, bz + 0.12);
  // the little tiered roof of ijuk on top
  thatchHip(ctx, { c: [cx, cz], A: half * 0.78, B: D / 2 + 0.5, y: yy + 0.3, rise: 1.5, mat: 'ijuk', pow: 1.4, th: 0.3 });
  bx(ctx, 'tuff_hewn', cx - 0.5, yy, cz - 0.4, cx + 0.5, yy + 0.3, cz + 0.4);
  thatchHip(ctx, { c: [cx, cz], A: half * 0.4, B: 1.2, y: yy + 1.5, rise: 1.0, mat: 'ijuk', pow: 1.4, th: 0.25 });
  ctx.bag.add('gilt_bronze', lathe([[0.001, 0], [0.14, 0], [0.08, 0.3], [0.1, 0.5], [0.001, 0.8]], 8, null, cx, yy + 2.5, cz));
  // the stair through the passage: from the court below (south) up to the court beyond
  steps(ctx, [cx - w / 2, cz - D / 2, cx + w / 2, cz + D / 2], y, y + up, 'n', 'andesite', 0.17, y - 0.3);
  // guardians either side of the foot
  for (const s of [-1, 1]) guardian(ctx, cx + s * (w / 2 + PW + 0.7), cz + D / 2 - 0.3, y);
}

/** A padmasana: the stone throne of Sang Hyang Widhi: stepped bases, the turtle's belly, a waist, the seat and the high back. */
export function padmasana(el, ctx) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1;
  const L = [['andesite', 2.2, 0.5], ['tuff_hewn', 1.9, 0.35], ['andesite', 1.5, 0.9], ['tuff_hewn', 1.65, 0.18], ['tuff_hewn', 1.2, 0.8], ['tuff_hewn', 1.5, 0.22]];
  let yy = y;
  for (const [m, w, hh] of L) { const a = w * s / 2; bx(ctx, m, cx - a, yy, cz - a, cx + a, yy + hh * s, cz + a, yy === y); yy += hh * s; }
  // the seat's back: a tall slab with a carved top, the cloth of poleng round the waist
  const a = 0.5 * s;
  bx(ctx, 'tuff_hewn', cx - a, yy, cz - 0.55 * s, cx + a, yy + 1.7 * s, cz - 0.4 * s, true);
  ctx.bag.add('tuff_hewn', lathe([[0.001, 0], [0.5 * s, 0], [0.38 * s, 0.4 * s], [0.001, 0.9 * s]], 8, null, cx, yy + 1.7 * s, cz - 0.48 * s));
  bx(ctx, 'gilt_bronze', cx - 0.25 * s, yy + 0.2 * s, cz - 0.1 * s, cx + 0.25 * s, yy + 0.55 * s, cz + 0.25 * s);
  sash(ctx, cx, cz, y + 2.1 * s, 0.6 * s, 'yellow');
  // the steps at the front
  steps(ctx, [cx - 0.5, cz + 1.1 * s, cx + 0.5, cz + 2.1 * s], y, y + 0.3, 'n', 'tuff_hewn', 0.15);
  void box;
}

/**
 * bali_shrine: { c, y, kind: 'rongtiga' | 'gedong' | 'taksu' | 'small' | 'pelinggih', facing } — shrines of the courts and the sanggah, the front toward +z (south) unless
 * facing 'e' | 'w' | 'n' (the shrine's door side).
 */
export function shrine(el, ctx) {
  const [cx, cz] = el.c, y = el.y ?? 0, k = el.kind ?? 'small';
  const sc = k === 'rongtiga' ? [3.6, 1.2] : k === 'gedong' ? [2.6, 2.2] : k === 'taksu' ? [1.1, 1.0] : [1.0, 1.0], fc = el.face ?? 's', zf = fc === 'e' || fc === 'w';
  const [W, D] = zf ? [sc[1], sc[0]] : sc, ph = k === 'rongtiga' ? 0.9 : k === 'gedong' ? 0.7 : 1.0;
  // a door on the face: (u along the face's wall from its middle, width, height)
  const door = (by, u0, u1, hh) => {
    if (fc === 's') bx(ctx, 'wood_dark', cx + u0, by, cz + D / 2, cx + u1, by + hh, cz + D / 2 + 0.04);
    else if (fc === 'n') bx(ctx, 'wood_dark', cx + u0, by, cz - D / 2 - 0.04, cx + u1, by + hh, cz - D / 2);
    else if (fc === 'e') bx(ctx, 'wood_dark', cx + W / 2, by, cz + u0, cx + W / 2 + 0.04, by + hh, cz + u1);
    else bx(ctx, 'wood_dark', cx - W / 2 - 0.04, by, cz + u0, cx - W / 2, by + hh, cz + u1);
  };
  bx(ctx, 'brick', cx - W / 2 - 0.1, y, cz - D / 2 - 0.1, cx + W / 2 + 0.1, y + ph, cz + D / 2 + 0.1, true);
  coping(ctx, cx - W / 2 - 0.1, cz - D / 2 - 0.1, cx + W / 2 + 0.1, cz + D / 2 + 0.1, y + ph - 0.1, 'tuff_hewn');
  const by = y + ph + 0.1;
  if (k === 'rongtiga') {
    bx(ctx, 'wood_painted', cx - W / 2, by, cz - D / 2, cx + W / 2, by + 1.3, cz + D / 2, true);
    const L = zf ? D : W;
    for (let i = 0; i < 3; i++) door(by + 0.1, -L / 2 + 0.2 + i * (L - 0.4) / 3 + 0.12, -L / 2 + 0.2 + (i + 1) * (L - 0.4) / 3 - 0.12, 1.0);
    thatchHip(ctx, { c: [cx, cz], A: W / 2 + 0.7, B: D / 2 + 0.7, y: by + 1.3, rise: 1.6, mat: 'ijuk', pow: 1.4 });
  } else if (k === 'gedong') {
    bx(ctx, 'brick', cx - W / 2, by, cz - D / 2, cx + W / 2, by + 2.3, cz + D / 2, true);
    door(by, -0.5, 0.5, 1.7);
    coping(ctx, cx - W / 2, cz - D / 2, cx + W / 2, cz + D / 2, by + 2.3, 'tuff_hewn');
    thatchHip(ctx, { c: [cx, cz], A: W / 2 + 0.8, B: D / 2 + 0.8, y: by + 2.5, rise: 2.0, mat: 'ijuk', pow: 1.4 });
  } else {
    post(ctx, 'wood_painted', cx - 0.4, cz - 0.4, by, by + 1.4, 0.07, false); post(ctx, 'wood_painted', cx + 0.4, cz - 0.4, by, by + 1.4, 0.07, false);
    post(ctx, 'wood_painted', cx - 0.4, cz + 0.4, by, by + 1.4, 0.07, false); post(ctx, 'wood_painted', cx + 0.4, cz + 0.4, by, by + 1.4, 0.07, false);
    bx(ctx, 'tuff_hewn', cx - 0.3, by, cz - 0.3, cx + 0.3, by + 0.5, cz + 0.3);
    thatchHip(ctx, { c: [cx, cz], A: 0.85, B: 0.85, y: by + 1.4, rise: 0.8, mat: 'ijuk', pow: 1.3, th: 0.2 });
  }
}

/**
 * bali_gate: { at [x, z] (the centre of the gateway in the wall), axis ('x': the wall runs along x), w (the opening), h, y, face (the side the street is on: +1 | −1 along the other axis), rich }
 * — the angkul-angkul: two brick piers with stepped coping under a small thatched roof, guardian stones, and the spirit wall (aling-aling) just inside.
 */
export function gate(el, ctx) {
  const [gx, gz] = el.at, ax = el.axis === 'x', w = el.w ?? 2.2, h = el.h ?? 2.7, y = el.y ?? 0, f = el.face ?? 1, rich = el.rich !== false, T = 0.8;
  const R = (u0, v0, u1, v1) => (ax ? [gx + u0, gz + v0, gx + u1, gz + v1] : [gx + v0, gz + u0, gx + v1, gz + u1]);
  for (const s of [-1, 1]) {
    const r = R(s * (w / 2 + 0.45) - 0.45, -T / 2, s * (w / 2 + 0.45) + 0.45, T / 2);
    bx(ctx, rich ? 'brick' : 'earth_wall', r[0], y - 0.3, r[1], r[2], y + h, r[3], true);
    bx(ctx, 'andesite', r[0] - 0.05, y - 0.3, r[1] - 0.05, r[2] + 0.05, y + 0.45, r[3] + 0.05);
    coping(ctx, r[0] + 0.0, r[1] + 0.0, r[2], r[3], y + h, 'tuff_hewn');
    const pp = R(s * (w / 2 + 0.45) - 0.28, -T / 2 - 0.02, s * (w / 2 + 0.45) + 0.28, T / 2 + 0.02);
    bx(ctx, 'tuff_hewn', pp[0], y + h + 0.2, pp[1], pp[2], y + h + 0.55, pp[3]);
  }
  // the roof across the opening and the piers: a little hip of thatch
  const rc = R(0, 0, 0, 0);
  thatchHip(ctx, { c: [rc[0], rc[1]], A: ax ? w / 2 + 1.5 : 0.95, B: ax ? 0.95 : w / 2 + 1.5, y: y + h + 0.5, rise: 1.0, mat: rich ? 'thatch_palm' : 'thatch', pow: 1.3, th: 0.22 });
  // the lintel timber
  const lt = R(-w / 2 - 0.05, -0.2, w / 2 + 0.05, 0.2); bx(ctx, 'wood_dark', lt[0], y + h - 0.2, lt[1], lt[2], y + h + 0.1, lt[3]);
  // guardian stones beside the piers on the street side
  if (rich) for (const s of [-1, 1]) { const q = R(s * (w / 2 + 1.2), f * (T / 2 + 0.5), s * (w / 2 + 1.2), f * (T / 2 + 0.5)); guardian(ctx, q[0], q[1], y, 1.0); }
  // the aling-aling: a screen wall 1.7 m inside the gate, wider than the opening, the way round it open at one end
  const sv = -f * (T / 2 + 1.3), a0 = R(-w / 2 - 0.4, sv - 0.2, w / 2 - 0.1, sv + 0.2);
  bx(ctx, rich ? 'brick' : 'earth_wall', a0[0], y - 0.2, a0[1], a0[2], y + 2.0, a0[3], true);
  coping(ctx, a0[0], a0[1], a0[2], a0[3], y + 2.0, 'tuff_hewn');
}
