// Walls and gates of Pagan (docs/settlements/bagan.md §2): the brick city wall with its parapet and the Tharabar Gate, the temple precincts' low walls with their gates.
import { box } from '../../core/geom.js';
import { Fr, archWall, vault, miniStupa, rng } from './kit.js';

/** bgn_wall: { a, b, th, h, mat, merlon (true: a crenellated top), gaps: [{ at, w }] } — axis-aligned, a brick wall; at the gaps nothing (gates stand there). */
export function wall(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, alongX = Math.abs(bx - ax) >= Math.abs(bz - az);
  const L = alongX ? Math.abs(bx - ax) : Math.abs(bz - az), sg = alongX ? Math.sign(bx - ax) || 1 : Math.sign(bz - az) || 1, th = el.th, h = el.h, mat = el.mat ?? 'brick';
  const gaps = (el.gaps ?? []).map((g) => [g.at - g.w / 2, g.at + g.w / 2]).sort((p, q) => p[0] - q[0]);
  const R = (s0, s1, t = th) => (alongX ? [Math.min(ax + sg * s0, ax + sg * s1), az - t / 2, Math.max(ax + sg * s0, ax + sg * s1), az + t / 2] : [ax - t / 2, Math.min(az + sg * s0, az + sg * s1), ax + t / 2, Math.max(az + sg * s0, az + sg * s1)]);
  const piece = (s0, s1) => {
    if (s1 - s0 < 0.05) return;
    const r = R(s0, s1);
    bag.add(mat, box(r[0], -0.3, r[1], r[2], h, r[3])); col.rect(r, -0.3, h);
    bag.add('limewash_white', box(r[0] - (alongX ? 0 : 0.12), h, r[1] - (alongX ? 0.12 : 0), r[2] + (alongX ? 0 : 0.12), h + 0.28, r[3] + (alongX ? 0.12 : 0)));
    // the weathering: a damp band at the foot (the rains' stain and moss), patches of the old limewash flaking from the brick on both faces
    {
      const rr = rng((Math.round(ax * 7 + az * 13 + s0 * 3) | 0) + 11), L2 = s1 - s0, hh = Math.min(h, 7);
      for (const o of [-1, 1]) {
        const fo = o * th / 2, e = 0.04;
        const slab = (a0, a1, y0, y1, mat) => bag.add(mat, alongX
          ? box(Math.min(ax + sg * a0, ax + sg * a1), y0, az + fo + (o > 0 ? 0 : -e), Math.max(ax + sg * a0, ax + sg * a1), y1, az + fo + (o > 0 ? e : 0))
          : box(ax + fo + (o > 0 ? 0 : -e), y0, Math.min(az + sg * a0, az + sg * a1), ax + fo + (o > 0 ? e : 0), y1, Math.max(az + sg * a0, az + sg * a1)));
        if (L2 > 1) slab(s0, s1, -0.1, 0.5, 'plaster_damp');
        for (let q = s0 + 0.5; q < s1 - 2.2; q += 3.4) {
          const w2 = 0.9 + rr() * 1.4, y0 = 0.7 + rr() * (hh * 0.45), y1 = y0 + 0.5 + rr() * Math.min(1.8, hh * 0.35);
          if (rr() < 0.7) slab(q + rr() * 0.5, q + rr() * 0.5 + w2, y0, Math.min(y1, h - 0.3), rr() < 0.6 ? 'stucco_cream' : 'plaster_streak');
        }
      }
    }
    if (el.merlon) {
      // the crenels: a merlon every 1.6 m, along both edges of the top
      for (let s = s0 + 0.8; s < s1 - 0.4; s += 1.6) for (const o of [-1, 1]) {
        const p = R(s - 0.45, s + 0.45, 0.01), t = th / 2 - 0.35;
        bag.add('limewash_white', alongX ? box(p[0], h + 0.28, az + o * t - 0.3, p[2], h + 1.3, az + o * t + 0.3) : box(ax + o * t - 0.3, h + 0.28, p[1], ax + o * t + 0.3, h + 1.3, p[3]));
      }
    }
  };
  let s = 0;
  for (const [g0, g1] of gaps) { piece(s, Math.max(s, g0)); s = g1; }
  piece(s, L);
}

/**
 * bgn_gate: { c, axis ('x': the passage runs along x; 'z'), th (the wall's thickness = the passage's length), h (the wall's height), pw (the passage's width), big (the
 * city gate: the gatehouse stands higher, with niches for the nats and a tiered roof) } — a brick gatehouse with a pointed passage.
 */
export function gate(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, big = !!el.big, th = el.th, h = el.h, pw = el.pw ?? 4.4;
  const F = new Fr(ctx, [cx, cz], el.axis === 'x' ? [0, 1] : [1, 0], el.axis === 'x' ? [1, 0] : [0, 1]);
  // frame: u lateral (across the passage), v along the passage (from the centre); the passage runs along v
  const L = big ? th + 3 : th + 1, W = big ? pw + 7 : pw + 3.4;
  // the two piers, a pointed passage through them (an arch wall across the passage's mouth on each side), the top
  for (const sd of [-1, 1]) {
    const v0 = sd * (L / 2 - 1.4), v1 = sd * (L / 2);
    archWall(F, big ? 'brick' : 'brick', -W / 2 - 0.0, W / 2, Math.min(v0, v1), Math.max(v0, v1), -0.3, h + (big ? 2.0 : 0.7), [{ c: 0, w: pw, top: h - 0.6 + (big ? 0.5 : 0) }], 'limewash_white');
  }
  // the thick middle: two jambs along the passage and a vault over it
  for (const sd of [-1, 1]) F.b('brick', sd < 0 ? -W / 2 : pw / 2, -0.3, -L / 2 + 1.4, sd < 0 ? -pw / 2 : W / 2, h + (big ? 2.0 : 0.7), L / 2 - 1.4, true);
  vault(F, 'v', 0, pw / 2, -L / 2 + 1.4, L / 2 - 1.4, h * 0.55, h * 0.35, 5, 'brick');
  F.b('brick', -W / 2, h * 0.9, -L / 2 + 1.4, W / 2, h + (big ? 2.0 : 0.7), L / 2 - 1.4, false);
  F.b('limewash_white', -W / 2 - 0.2, h + (big ? 2.0 : 0.7), -L / 2 - 0.2, W / 2 + 0.2, h + (big ? 2.3 : 1.0), L / 2 + 0.2, false);
  if (big) {
    // the niches of the guardian nats on both faces, flanking the passage
    for (const sd of [-1, 1]) for (const su of [-1, 1]) {
      F.b('wood_dark', su * (pw / 2 + 1.7) - 0.6, 1.0, sd * (L / 2) - (sd > 0 ? 0 : -0.05) - 0.0, su * (pw / 2 + 1.7) + 0.6, 3.4, sd * (L / 2) + sd * 0.05, false);
      F.b('gilt_bronze', su * (pw / 2 + 1.7) - 0.28, 1.0, sd * (L / 2) + sd * 0.04, su * (pw / 2 + 1.7) + 0.28, 2.6, sd * (L / 2) + sd * 0.12, false);
    }
    // a small upper pavilion: brick storey, a stepped roof, a stupa finial
    const y = h + 2.3;
    F.b('brick', -W / 2 + 1.2, y, -L / 2 + 1.2, W / 2 - 1.2, y + 2.6, L / 2 - 1.2, true);
    for (let i = 0; i < 3; i++) F.b('limewash_white', -W / 2 + 0.6 + i * 0.9, y + 2.6 + i * 1.0, -L / 2 + 0.6 + i * 0.9, W / 2 - 0.6 - i * 0.9, y + 3.6 + i * 1.0, L / 2 - 0.6 - i * 0.9, false);
    const [px, pz] = F.pt(0, 0);
    miniStupa(bag, px, y + 5.6, pz, 3.2, 'limewash_white', true);
    F.b('limewash_white', -1.0, y + 2.6, -L / 2 + 0.6, 1.0, y + 3.4, -L / 2 + 0.6 + 0.04, false);
  } else {
    const [px, pz] = F.pt(0, 0);
    miniStupa(bag, px, h + 1.0, pz, 2.4, 'limewash_white', true, 8);
  }
  void col; void bag;
}
