// Stone and brick of the Balinese village (docs/settlements/bali-village.md §3, §4.1): walls with their pilasters and coping, the split gate
// (candi bentar), the roofed gate (kori agung), the compound's gate with its spirit wall, the padmasana, the shrines, guardian statues.
import { box, lathe, rod } from '../../core/geom.js';
import { bx, post, thatchHip, steps, coping, sash, rng, TAU } from './kit.js';
import { frame, patraField, bhoma, karangGajah, lotusFinial, flame, dwarapala, bedawang, ball } from './carve.js';

/** A guardian statue (a squat figure on a plinth with a club, a poleng cloth at its waist): at (x, z), y the ground, facing 'n' | 's' | 'e' | 'w'. */
export function guardian(ctx, x, z, y, h = 1.3, face = 's') { dwarapala(ctx, x, z, y, h, face); }

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
    const n = Math.max(0, Math.floor((s1 - s0) / 4.4)), ps = [];
    for (let k = 0; k <= n; k++) {
      const s = n === 0 ? (s0 + s1) / 2 : s0 + 0.3 + (s1 - s0 - 0.6) * k / n;
      if (n === 0 && s1 - s0 < 3) break;
      ps.push(s);
      const p = R(s - 0.25, s + 0.25, th + 0.22);
      bx(ctx, mat, p[0], y0, p[1], p[2], y0 + h + 0.12, p[3]);
      coping(ctx, p[0], p[1], p[2], p[3], y0 + h + 0.12, 'tuff_hewn');
    }
    // a carved band on the street face of a rich lot: a framed scroll field between the pilasters
    if (el.band) {
      const [nx, nz] = el.band, fc = nx > 0 ? 'e' : nx < 0 ? 'w' : nz > 0 ? 's' : 'n', pts = [s0, ...ps, s1].sort((a, b) => a - b);
      for (let i = 0; i + 1 < pts.length; i++) {
        const gap = pts[i + 1] - pts[i] - (i > 0 ? 0.25 : 0) - (i + 2 < pts.length ? 0.25 : 0);
        if (gap < 1.6) continue;
        const sm = (pts[i] + pts[i + 1]) / 2, pw = Math.min(1.5, gap - 0.8), c = alongX ? [ax + sg * sm, az + nz * th / 2] : [ax + nx * th / 2, az + sg * sm];
        patraField(frame(ctx, c[0], c[1], fc), 'tuff_hewn', 'andesite', -pw / 2, y0 + 0.95, pw / 2, y0 + 1.65, 0, 0.3);
      }
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
    // foot: stone, with a step out; body: brick with carved fields; the cornice; then the tapering tiers
    slab('andesite', -0.25, y - 0.3, y + 0.45); slab('tuff_hewn', 0, y + 0.45, y + 0.6);
    slab('andesite', 0.1, y + 0.6, y + 1.6, 0.05);
    slab('tuff_hewn', 0.18, y + 1.6, y + 1.7, 0.07);
    slab('brick', 0.25, y + 1.6, y + 2.9, 0.12);
    slab('tuff_hewn', 0.18, y + 2.78, y + 2.9, 0.07);
    // the carved fields on the front and back faces and the outer end (the passage's inner faces stay sheer)
    const xm = (ix + ox(0.25)) / 2, hw = Math.abs(ox(0.25) - ix) / 2, fz = D / 2 - 0.12;
    for (const face of ['s', 'n']) patraField(frame(ctx, xm, cz, face), 'tuff_hewn', 'andesite', -hw + 0.3, y + 1.78, hw - 0.3, y + 2.7, fz);
    patraField(frame(ctx, ox(0.25), cz, s > 0 ? 'e' : 'w'), 'tuff_hewn', 'andesite', -(D / 2 - 0.12 - 0.3), y + 1.78, D / 2 - 0.12 - 0.3, y + 2.7, 0);
    // the karang gajah at the foot's outer corner, front and back
    for (const face of ['s', 'n']) karangGajah(ctx, ox(0.1) - s * 0.42, cz, face, 0, y + 0.72, D / 2 - 0.05, s);
    slab('tuff_hewn', 0.15, y + 2.9, y + 3.1, 0.0); slab('tuff_hewn', 0.0, y + 3.1, y + 3.3, -0.05);
    let yy = y + 3.3;
    for (let k = 0; k < 8; k++) {
      const hh = 0.5 - k * 0.025, inset = 0.4 + k * 0.38, dd = 0.15 + k * 0.17;
      slab(k % 2 ? 'tuff_hewn' : 'brick', inset, yy, yy + hh, dd);
      if (k % 2 === 0) {                                   // a row of dentils along each brick tier's front and back
        const x0 = Math.min(ix, ox(inset)) + 0.15, x1 = Math.max(ix, ox(inset)) - 0.15, n = Math.floor((x1 - x0) / 0.26);
        for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / n; for (const zf of [-1, 1]) bx(ctx, 'tuff_hewn', x - 0.07, yy + hh * 0.35, cz + zf * (D / 2 - dd), x + 0.07, yy + hh * 0.75, cz + zf * (D / 2 - dd + 0.05) + (zf > 0 ? 0 : 0)); }
      }
      flame(ctx, ox(inset) - s * 0.12, yy + hh, cz + (D / 2 - dd - 0.12), 0.24 - k * 0.012); flame(ctx, ox(inset) - s * 0.12, yy + hh, cz - (D / 2 - dd - 0.12), 0.24 - k * 0.012);
      yy += hh;
    }
    // the lotus-bud murdha on top
    lotusFinial(ctx, cx + s * (g / 2 + 0.55), yy, cz, 0.2);
  }
  steps(ctx, [cx - g / 2, cz - D / 2, cx + g / 2, cz + D / 2], y, y + rise, 'n', 'andesite', 0.17, y - 0.3);
  for (const s of [-1, 1]) {
    const gx = cx + s * (g / 2 + W + 0.55);
    if (el.guards !== false) { bx(ctx, 'tuff_hewn', gx - 0.3, y, cz + D / 2 - 0.5, gx + 0.3, y + 0.4, cz + D / 2 + 0.1, true); if (el.dwara) dwarapala(ctx, gx, cz + D / 2 - 0.2, y + 0.4, 1.0, 's'); }
  }
  void rng; void TAU; void box;
}

/**
 * bali_kori: { c [x, z], w (the passage), y (the court's floor at the foot of the gate), h (the passage height), up (how far the stair rises through it) } — the roofed
 * gate between the courts, facing south: foot, wings with carved fields, the passage under a solid lintel block carrying the Bhoma, four stepped tiers with dentils and
 * flame finials, a little roof of ijuk and the lotus murdha; the stair; the guardians.
 */
export function kori(el, ctx) {
  const [cx, cz] = el.c, w = el.w ?? 2.6, y = el.y ?? 0, ph = el.h ?? 3.0, D = el.depth ?? 4.4, PW = el.pw ?? 2.6, up = el.up ?? 1.6;
  for (const s of [-1, 1]) {
    const ix = cx + s * w / 2, ox = (k) => cx + s * (w / 2 + PW - k), sl = (mat, k, ym, yt, d = 0) => bx(ctx, mat, Math.min(ix, ox(k)), ym, cz - D / 2 + d, Math.max(ix, ox(k)), yt, cz + D / 2 - d, true);
    sl('andesite', -0.2, y - 0.3, y + 0.5); sl('tuff_hewn', 0, y + 0.5, y + 0.65);
    sl('brick', 0.1, y + 0.65, y + 0.65 + (ph - 0.65), 0.05);
    sl('tuff_hewn', 0.0, y + ph, y + ph + 0.2, -0.1);
    // scroll fields on the wings' faces, front and back
    const xm = (ix + ox(0.1)) / 2, hw = Math.abs(ox(0.1) - ix) / 2;
    for (const face of ['s', 'n']) patraField(frame(ctx, xm, cz, face), 'tuff_hewn', 'andesite', -hw + 0.28, y + 1.0, hw - 0.28, y + ph - 0.35, D / 2 - 0.05);
  }
  const half = w / 2 + PW;
  // the lintel block over the passage and the wings, with the Bhoma on its front face
  const LH = 1.75, ly = y + ph + 0.2, a0 = half - 0.12, d0 = D / 2 - 0.2;
  bx(ctx, 'brick', cx - a0, y + ph, cz - d0, cx + a0, ly + LH, cz + d0, true);
  bx(ctx, 'tuff_hewn', cx - a0 - 0.1, ly + LH - 0.08, cz - d0 - 0.1, cx + a0 + 0.1, ly + LH + 0.1, cz + d0 + 0.1);
  bhoma(ctx, cx, y + ph + 0.28, cz, 's', d0);
  for (const sd of [-1, 1]) { const F = frame(ctx, cx + sd * 2.45, cz, 's'); patraField(F, 'tuff_hewn', 'andesite', -0.85, ly + 0.2, 0.85, ly + LH - 0.3, d0, 0.3); }
  // the back (toward the inner court): a plainer face, a gilded board over the passage
  bx(ctx, 'wood_painted', cx - w / 2 - 0.1, y + ph - 0.38, cz - D / 2 - 0.02, cx + w / 2 + 0.1, y + ph, cz - D / 2 + 0.1);
  bx(ctx, 'gilt_bronze', cx - w / 2, y + ph - 0.3, cz - D / 2 - 0.04, cx + w / 2, y + ph - 0.24, cz - D / 2 - 0.02);
  // four stepped tiers over the block
  let yy = ly + LH + 0.1;
  const TN = 4;
  for (let k = 0; k < TN; k++) {
    const hh = 0.5 - k * 0.03, a = (half - 0.5) - k * ((half - 0.5) - 1.0) / TN, d = D / 2 - 0.4 - k * (D / 2 - 0.9) / TN, m = k % 2 ? 'tuff_hewn' : 'brick';
    bx(ctx, m, cx - a, yy, cz - d, cx + a, yy + hh, cz + d, k === 0);
    bx(ctx, 'tuff_hewn', cx - a - 0.1, yy + hh - 0.07, cz - d - 0.1, cx + a + 0.1, yy + hh + 0.07, cz + d + 0.1);
    if (k % 2 === 0) { const n = Math.floor((2 * a - 0.4) / 0.26); for (let i = 0; i < n; i++) { const x = cx - a + 0.2 + (i + 0.5) * (2 * a - 0.4) / n; bx(ctx, 'tuff_hewn', x - 0.07, yy + hh * 0.3, cz + d, x + 0.07, yy + hh * 0.7, cz + d + 0.05); bx(ctx, 'tuff_hewn', x - 0.07, yy + hh * 0.3, cz - d - 0.05, x + 0.07, yy + hh * 0.7, cz - d); } }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) flame(ctx, cx + sx * (a + 0.02), yy + hh + 0.07, cz + sz * (d - 0.1), 0.3 - k * 0.03, 0.08);
    yy += hh + 0.14;
  }
  // the little roof of ijuk and the murdha
  thatchHip(ctx, { c: [cx, cz], A: half * 0.5, B: D / 2 - 0.4, y: yy + 0.1, rise: 1.3, mat: 'ijuk', pow: 1.4, th: 0.3 });
  bx(ctx, 'tuff_hewn', cx - 0.5, yy, cz - 0.4, cx + 0.5, yy + 0.2, cz + 0.4);
  lotusFinial(ctx, cx, yy + 1.35, cz, 0.18);
  // the stair through the passage: from the court below (south) up to the court beyond
  steps(ctx, [cx - w / 2, cz - D / 2, cx + w / 2, cz + D / 2], y, y + up, 'n', 'andesite', 0.17, y - 0.3);
  // guardians either side of the foot
  for (const s of [-1, 1]) guardian(ctx, cx + s * (w / 2 + PW + 0.7), cz + D / 2 - 0.3, y, 1.4, 's');
}

/** A padmasana: the stone throne of Sang Hyang Widhi: stepped bases, the turtle's belly, a waist, the seat and the high back. */
export function padmasana(el, ctx) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1;
  const box1 = (m, w, hh, solid) => { const a = w * s / 2; bx(ctx, m, cx - a, yy, cz - a, cx + a, yy + hh * s, cz + a, solid); yy += hh * s; };
  let yy = y;
  // the tepas: two stepped bases; then Bedawang Nala, the cosmic turtle, on a round core, the two serpents coiled round it
  box1('andesite', 2.2, 0.5, true); box1('tuff_hewn', 1.9, 0.35, false);
  ctx.bag.add('andesite', lathe([[0.001, 0], [0.6 * s, 0], [0.6 * s, 0.62 * s], [0.001, 0.62 * s]], 12, null, cx, yy, cz));
  ctx.col.circle(cx, cz, 0.62 * s, yy, yy + 0.62 * s);
  bedawang(ctx, cx, cz, yy, 1.0 * s, 's');
  yy += 0.62 * s;
  // the batur: a cornice, the waist, a ring of lotus petals under the seat
  box1('tuff_hewn', 1.65, 0.18, false); box1('tuff_hewn', 1.2, 0.8, false);
  ctx.bag.add('tuff_hewn', lathe([[0.7 * s, -0.22 * s], [0.98 * s, -0.12 * s], [1.0 * s, -0.04 * s], [0.78 * s, 0]], 12, (th, i) => (i >= 1 ? 1 + 0.1 * Math.cos(10 * th) : 1), cx, yy, cz));
  box1('tuff_hewn', 1.5, 0.22, false);
  // the sancak: the empty seat's tall back with a carved crest and the gilded rayed disc of Acintya on its face
  const a = 0.5 * s, zf = cz - 0.4 * s;
  bx(ctx, 'tuff_hewn', cx - a, yy, cz - 0.55 * s, cx + a, yy + 1.7 * s, zf, true);
  ctx.bag.add('tuff_hewn', lathe([[0.001, 0], [0.5 * s, 0], [0.38 * s, 0.4 * s], [0.001, 0.9 * s]], 8, null, cx, yy + 1.7 * s, cz - 0.48 * s));
  ctx.bag.add('gilt_bronze', lathe([[0.001, 0], [0.22 * s, 0], [0.22 * s, 0.03 * s], [0.001, 0.03 * s]], 12, null, 0, 0, 0).rotateX(Math.PI / 2).translate(cx, yy + 1.05 * s, zf));
  for (let k = 0; k < 8; k++) { const th = k * Math.PI / 4, c = Math.cos(th), sn = Math.sin(th); ctx.bag.add('gilt_bronze', rod([cx + c * 0.26 * s, yy + 1.05 * s + sn * 0.26 * s, zf + 0.015 * s], [cx + c * 0.4 * s, yy + 1.05 * s + sn * 0.4 * s, zf + 0.015 * s], 0.018 * s, 5)); }
  bx(ctx, 'gilt_bronze', cx - 0.25 * s, yy + 0.2 * s, cz - 0.1 * s, cx + 0.25 * s, yy + 0.55 * s, cz + 0.25 * s);
  sash(ctx, cx, cz, y + 2.1 * s, 0.6 * s, 'yellow');
  // the steps at the front
  steps(ctx, [cx - 0.5, cz + 1.1 * s, cx + 0.5, cz + 2.1 * s], y, y + 0.3, 'n', 'tuff_hewn', 0.15);
  void box; void ball;
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
  const tier = el.tier ?? (rich ? 1 : 0), faceL = ax ? (f > 0 ? 's' : 'n') : (f > 0 ? 'e' : 'w');
  const R = (u0, v0, u1, v1) => (ax ? [gx + u0, gz + v0, gx + u1, gz + v1] : [gx + v0, gz + u0, gx + v1, gz + u1]);
  for (const s of [-1, 1]) {
    const r = R(s * (w / 2 + 0.45) - 0.45, -T / 2, s * (w / 2 + 0.45) + 0.45, T / 2);
    bx(ctx, rich ? 'brick' : 'earth_wall', r[0], y - 0.3, r[1], r[2], y + h, r[3], true);
    bx(ctx, 'andesite', r[0] - 0.05, y - 0.3, r[1] - 0.05, r[2] + 0.05, y + 0.45, r[3] + 0.05);
    coping(ctx, r[0] + 0.0, r[1] + 0.0, r[2], r[3], y + h, 'tuff_hewn');
    if (tier < 2) { const pp = R(s * (w / 2 + 0.45) - 0.28, -T / 2 - 0.02, s * (w / 2 + 0.45) + 0.28, T / 2 + 0.02); bx(ctx, 'tuff_hewn', pp[0], y + h + 0.2, pp[1], pp[2], y + h + 0.55, pp[3]); }
    else { const pc = R(s * (w / 2 + 0.45), 0, s * (w / 2 + 0.45), 0); patraField(frame(ctx, pc[0], pc[1], faceL), 'tuff_hewn', 'andesite', -0.3, y + 0.75, 0.3, y + h - 0.45, T / 2, 0.3); }
  }
  const rc = R(0, 0, 0, 0);
  if (tier < 2) {
    // the roof over the opening and the piers: a pyramid of thatch (steeper for the brick gate)
    thatchHip(ctx, { c: [rc[0], rc[1]], A: ax ? w / 2 + 1.5 : 0.95, B: ax ? 0.95 : w / 2 + 1.5, y: y + h + 0.5, rise: tier === 1 ? 1.5 : 1.0, mat: rich ? 'thatch_palm' : 'thatch', pow: 1.3, th: 0.22 });
  } else {
    // the paduraksa: a block over the opening carrying three small tiers, a roof of ijuk and the lotus bud
    const sp = w / 2 + 0.9, yb = y + h;
    const blk = (m, k, y0, y1, d, solid) => { const r = R(-sp + k, -T / 2 + d, sp - k, T / 2 - d); bx(ctx, m, r[0], y0, r[1], r[2], y1, r[3], solid); };
    blk('brick', 0, yb, yb + 0.55, 0, true); blk('tuff_hewn', 0.0, yb + 0.55, yb + 0.65, -0.05, false);
    blk('brick', 0.4, yb + 0.65, yb + 1.05, 0.08, false); blk('tuff_hewn', 0.4, yb + 1.05, yb + 1.13, 0.02, false);
    blk('brick', 0.8, yb + 1.13, yb + 1.5, 0.15, false);
    for (const s of [-1, 1]) for (const [k, yy2] of [[0.0, yb + 0.65], [0.4, yb + 1.13], [0.8, yb + 1.5]]) { const q = R(s * (sp - k - 0.12), 0, s * (sp - k - 0.12), 0); flame(ctx, q[0], yy2, q[1], 0.22, 0.06); }
    thatchHip(ctx, { c: [rc[0], rc[1]], A: ax ? sp - 0.2 : 0.8, B: ax ? 0.8 : sp - 0.2, y: yb + 1.5, rise: 1.0, mat: 'ijuk', pow: 1.4, th: 0.22 });
    lotusFinial(ctx, rc[0], yb + 2.45, rc[1], 0.11);
    const pf = R(0, 0, 0, 0); void pf;
  }
  // the lintel timber
  const lt = R(-w / 2 - 0.05, -0.2, w / 2 + 0.05, 0.2); bx(ctx, 'wood_dark', lt[0], y + h - 0.2, lt[1], lt[2], y + h + 0.1, lt[3]);
  // the door leaf, standing open against the yard side of one pier: planks for the poor, painted and gilt-edged for the rest
  { const l = R(w / 2 - 0.08, -f * (T / 2), w / 2 - 0.02, -f * (T / 2 + 1.0)); bx(ctx, rich ? 'wood_painted' : 'wood_dark', Math.min(l[0], l[2]), y + 0.1, Math.min(l[1], l[3]), Math.max(l[0], l[2]), y + 1.9, Math.max(l[1], l[3]));
    if (rich) { const e = R(w / 2 - 0.1, -f * (T / 2), w / 2 - 0.0, -f * (T / 2 + 1.0)); bx(ctx, 'gilt_bronze', Math.min(e[0], e[2]), y + 1.8, Math.min(e[1], e[3]), Math.max(e[0], e[2]), y + 1.86, Math.max(e[1], e[3])); } }
  // guardian figures beside the piers on the street side, looking out
  if (rich) for (const s of [-1, 1]) { const q = R(s * (w / 2 + 1.2), f * (T / 2 + 0.5), s * (w / 2 + 1.2), f * (T / 2 + 0.5)); guardian(ctx, q[0], q[1], y, 1.0, faceL); }
  // the aling-aling: a screen wall 1.7 m inside the gate, wider than the opening, the way round it open at one end
  const sv = -f * (T / 2 + 1.3), a0 = R(-w / 2 - 0.4, sv - 0.2, w / 2 - 0.1, sv + 0.2);
  bx(ctx, rich ? 'brick' : 'earth_wall', a0[0], y - 0.2, a0[1], a0[2], y + 2.0, a0[3], true);
  coping(ctx, a0[0], a0[1], a0[2], a0[3], y + 2.0, 'tuff_hewn');
}
