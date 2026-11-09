// The garden's halls and the residence's main hall, furnished and roofed from inside
// (docs/settlements/ming-suzhou.md §11): the floor of square bricks, an inner row of posts with
// moon beams across and the boat-canopy ceilings (xuan) of the aisles, flying screens hung between
// the posts, a screen of door panels behind the long table with its painting and couplets, palace
// lanterns lit at night, floor candle stands, a carpet, a side table of scrolls and a zither.
// Everything is built in the hall's own frame (a across the hall, b from the back wall toward the
// front, y up) and turned into place once.

import {
  W, Parts, box, lathe, limb, T, ball, prismX, prismZ, moonProfile, arcBand, table, armchair, stand, rock, brickFloor, carpet, lantern,
  candleStand, qin, drumStool, scrollsOnTable, teaSet, fret, backScreen, hangingScroll, shrine, plaqueBuild, longTable, plumVase,
} from './props.js';

const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);

export function hallFurniture(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, front = el.front ?? 's', H = el.H ?? 4.4, main = el.variant === 'main';
  const alongX = front === 'n' || front === 's';
  const Wd = alongX ? x1 - x0 : z1 - z0, Dp = alongX ? z1 - z0 : x1 - x0;
  const origin = { s: [(x0 + x1) / 2, z0], n: [(x0 + x1) / 2, z1], e: [x0, (z0 + z1) / 2], w: [x1, (z0 + z1) / 2] }[front];
  const yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[front], cs = Math.cos(yaw), sn = Math.sin(yaw);
  const WC = (a, b) => [origin[0] + a * cs + b * sn, origin[1] - a * sn + b * cs];
  const lblk = (a0, b0, a1, b1, h) => { const p = WC(a0, b0), q = WC(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); };
  const lcirc = (a, b, r, h) => { const p = WC(a, b); col.circle(p[0], p[1], r, y, y + h); };
  const S = new Parts(), put = (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw);
  const inner = Wd >= 8;
  // the bays of the hall as mingHall lays them out, and the doorway's bay (local a)
  const nLat = Math.max(1, Math.round(Wd / (Wd >= Dp ? 3.6 : 3.4))), bw = Wd / nLat;
  const dk = Math.floor(nLat / 2), lo = alongX ? x0 : z0, oc = alongX ? origin[0] : origin[1];
  const dLoc = [lo + dk * bw, lo + (dk + 1) * bw].map((v) => (front === 's' || front === 'w' ? v - oc : oc - v)).sort((p, q) => p - q);
  const fb = Math.min(2.7, Math.max(1.7, Dp * 0.28)), yB = H - 1.1;
  const posts = [];
  if (inner) for (let i = 0; i < nLat; i++) { if (nLat % 2) { if (i > 0) posts.push(-Wd / 2 + bw * i); } else posts.push(-Wd / 2 + bw * (i + 0.5)); }
  // ── the floor
  brickFloor(S, -Wd / 2 + 0.03, 0.03, Wd / 2 - 0.03, Dp - 0.03, 17 + Math.round(Wd));
  // ── the frame: posts of the inner rows, the beams across them, the moon beams over, the boat-canopy ceilings
  if (inner) {
    for (const b of [fb, Dp - fb]) {
      for (const a of posts) {
        if (b > Dp / 2 && a > dLoc[0] && a < dLoc[1]) continue;
        S.add('granite_block', lathe([[0.27, 0], [0.27, 0.08], [0.22, 0.2], [0.18, 0.22], [0.001, 0.22]], 12, null, a, 0, b));
        S.add(W, lathe([[0.165, 0], [0.155, yB - 0.22], [0.001, yB - 0.22]], 10, null, a, 0.22, b));
        S.add(W, box(a - 0.2, yB - 0.1, b - 0.2, a + 0.2, yB, b + 0.2));
        lcirc(a, b, 0.2, yB);
      }
      S.add(W, box(-Wd / 2 + 0.14, yB, b - 0.12, Wd / 2 - 0.14, yB + 0.32, b + 0.12));
      S.add('lacquer_black', box(-Wd / 2 + 0.14, yB + 0.1, b - 0.125, Wd / 2 - 0.14, yB + 0.12, b + 0.125));
    }
    // flying screens between the posts, but not across the doorway
    for (const b of [fb, Dp - fb]) for (let k = 0; k < nLat; k++) {
      const ac = -Wd / 2 + bw * (k + 0.5);
      if (b > Dp / 2 && ac > dLoc[0] && ac < dLoc[1]) continue;
      const F = new Parts(); fret(F, bw - 0.5, 0.45); put(F, ac, b, 0, yB);
    }
    // moon beams across the depth, over the posts
    for (const a of posts) { const B = prismX(moonProfile(Dp - 0.3, 0.3, 0.1), a - 0.1, a + 0.1); B.translate(0, yB + 0.32, Dp / 2); S.add(W, B); }
    // the boat-canopy (chuanpeng xuan) ceilings of the two aisles: boards and the curved rafters under them
    for (const [u0, u1] of [[0.15, fb], [Dp - fb, Dp - 0.15]]) {
      S.add('timber', prismX(arcBand(u0, u1, H - 1.18, H - 0.82, 0.035), -Wd / 2 + 0.15, Wd / 2 - 0.15));
      const n = Math.round((Wd - 0.3) / 0.8);
      for (let k = 0; k <= n; k++) { const a = -Wd / 2 + 0.15 + (Wd - 0.3) * k / n; S.add(W, prismX(arcBand(u0, u1, H - 1.18 - 0.035, H - 0.82 - 0.035, 0.06, 8), a - 0.025, a + 0.025)); }
      S.add(W, box(-Wd / 2 + 0.15, H - 1.18 - 0.1, u0 - 0.03, Wd / 2 - 0.15, H - 1.18 - 0.035, u0 + 0.05)); S.add(W, box(-Wd / 2 + 0.15, H - 1.18 - 0.1, u1 - 0.05, Wd / 2 - 0.15, H - 1.18 - 0.035, u1 + 0.03));
    }
  } else {
    // a narrow hall: one boat canopy across its whole width, moon beams across it
    S.add('timber', prismZ(arcBand(-Wd / 2 + 0.15, Wd / 2 - 0.15, H - 1.15, H - 0.55, 0.035), 0.15, Dp - 0.15));
    const n = Math.round((Dp - 0.3) / 0.8);
    for (let k = 0; k <= n; k++) { const b = 0.15 + (Dp - 0.3) * k / n; S.add(W, prismZ(arcBand(-Wd / 2 + 0.15, Wd / 2 - 0.15, H - 1.15 - 0.035, H - 0.55 - 0.035, 0.06, 8), b - 0.025, b + 0.025)); }
    for (let k = 1; k < Math.round(Dp / 2.5); k++) { const b = Dp * k / Math.round(Dp / 2.5); S.add(W, box(-Wd / 2 + 0.14, H - 1.3, b - 0.1, Wd / 2 - 0.14, H - 1.15, b + 0.1)); }
  }
  // ── the back: a screen of door panels, the painting over the long table, the couplets
  const sw = Math.min(main ? 8.4 : 7.2, Wd - 2.4), sh = Math.min(3.0, H - 1.45);
  { const P = new Parts(); backScreen(P, sw, sh); put(P, 0, 0.2); }
  const cw = Math.min(2.05, sw / 2 - 0.4);
  for (const [s, seed] of [[-1, 41], [1, 42]]) { const P = new Parts(); plaqueBuild(P, { w: 0.3, h: Math.min(2.2, sh - 0.8), n: 7, vertical: true, seed, field: 'paint_white', ink: 'lacquer_black' }); put(P, s * cw, 0.292, 0, 0.7); }
  if (!main) { const P = new Parts(); hangingScroll(P, 1.15, Math.min(1.9, sh - 1.05), 6); put(P, 0, 0.292, 0, 1.0); }
  // ── the table before it
  if (main) {
    { const P = new Parts(); shrine(P); put(P, 0, 0.3 + 0.28); lblk(-1.4, 0.2, 1.4, 0.9, 2.5); }
    { const P = new Parts(), h = 1.0; longTable(P, 3.0, 0.5, h);
      P.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.12, 0.05], [0.11, 0.12], [0.085, 0.13], [0.09, 0.16], [0.001, 0.16]], 14, null, 0, h, 0));
      for (const a of [0, 2.1, 4.2]) P.add('bronze', limb([Math.cos(a) * 0.08, h + 0.03, Math.sin(a) * 0.08], [Math.cos(a) * 0.1, h - 0.01, Math.sin(a) * 0.1], 0.011, 0.009, 4));
      for (const s of [-1, 1]) { P.add('bronze', lathe([[0.001, 0], [0.04, 0], [0.012, 0.04], [0.012, 0.16], [0.03, 0.18], [0.001, 0.18]], 8, null, s * 0.5, h, 0)); P.add('lacquer_red', lathe([[0.001, 0.18], [0.016, 0.18], [0.016, 0.3], [0.001, 0.3]], 8, null, s * 0.5, h, 0)); P.add('flame', lathe([[0.001, 0.3], [0.011, 0.31], [0.001, 0.355]], 6, null, s * 0.5, h, 0)); }
      for (const s of [-1, 1]) { const V = new Parts(); plumVase(V, 12 + s); V.emit(P, s * 1.1, h, 0); }
      put(P, 0, 1.3); lblk(-1.6, 1.0, 1.6, 1.6, 1.1); }
    { const P = new Parts(); table(P, 0.95, 0.95, 0.85); const Tea = new Parts(); teaSet(Tea); Tea.emit(P, 0, 0.85, 0); put(P, 0, fb + 1.35); lblk(-0.5, fb + 0.85, 0.5, fb + 1.85, 0.9);
      for (const s of [-1, 1]) { const C = new Parts(); armchair(C); put(C, s * 1.0, fb + 1.35, faceYaw(-s, 0)); lblk(s * 1.0 - 0.3, fb + 1.05, s * 1.0 + 0.3, fb + 1.65, 1.1); } }
  } else {
    { const P = new Parts(), h = 0.9; longTable(P, 2.6, 0.5, h); const R = new Parts(); rock(R, 0.7, 23); R.emit(P, -0.8, h, 0);
      P.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.12, 0.05], [0.11, 0.12], [0.085, 0.13], [0.09, 0.16], [0.001, 0.16]], 14, null, 0.15, h, 0));
      for (const a of [0, 2.1, 4.2]) P.add('bronze', limb([0.15 + Math.cos(a) * 0.08, h + 0.03, Math.sin(a) * 0.08], [0.15 + Math.cos(a) * 0.1, h - 0.01, Math.sin(a) * 0.1], 0.011, 0.009, 4));
      for (const s of [0.75, 1.05]) P.add('glaze_blue', lathe([[0.001, 0], [0.07, 0.01], [0.1, 0.12], [0.06, 0.29], [0.04, 0.33], [0.055, 0.36], [0.001, 0.36]], 12, null, s, h, 0));
      put(P, 0, 0.62); lblk(-1.5, 0.3, 1.5, 0.95, 1.0); }
    for (const s of [-1, 1]) { const P = new Parts(); candleStand(P, 1.1); put(P, s * Math.min(2.0, cw), 1.05); lcirc(s * Math.min(2.0, cw), 1.05, 0.2, 1.4); }
  }
  // ── the seats along the sides: armchairs facing across with a tea stand between each pair
  const ay = Wd / 2 - 1.05, bc = Dp / 2 + (main ? -0.4 : 0), nSet = Dp > 8 ? 2 : (Dp > 6 ? 2 : 1);
  if (Wd >= 5) for (let k = 0; k < nSet; k++) {
    const b = nSet === 1 ? bc : bc + (k - 0.5) * (Dp > 8 ? 2.9 : 2.5);
    for (const s of [-1, 1]) {
      const a = s * (Wd >= 8 ? ay : Wd / 2 - 0.9);
      for (const [db, ch] of [[-0.42, true], [0, false], [0.42, true]]) { const P = new Parts(); if (ch) armchair(P); else stand(P); put(P, a, b + db, faceYaw(-s, 0)); }
      lblk(a - 0.3, b - 0.72, a + 0.3, b + 0.72, 1.1);
    }
  }
  // ── the side table of scrolls and the zither on its table with a stool
  { const wide = Wd >= 8, bS = wide ? bc : Dp - 1.6, bQ = wide ? bc : 2.0, ax = wide ? Wd / 2 - 0.45 : Wd / 2 - 0.4;
    { const P = new Parts(), h = 0.85; table(P, 1.2, 0.4, h, 'flat'); const Sc = new Parts(); scrollsOnTable(Sc, 4); Sc.emit(P, -0.1, h, 0); const V = new Parts(); plumVase(V, 3); V.emit(P, 0.45, h, 0);
      put(P, ax, bS, faceYaw(-1, 0)); lblk(ax - 0.25, bS - 0.65, ax + 0.25, bS + 0.65, 0.9); }
    { const P = new Parts(), h = 0.72; table(P, 1.1, 0.38, h); const Q = new Parts(); qin(Q); Q.emit(P, 0, h, 0); const St = new Parts(); drumStool(St); St.emit(P, 0, 0, 0.62);
      put(P, -ax, bQ, faceYaw(1, 0)); lblk(-ax - 0.25, bQ - 0.6, -ax + 0.85, bQ + 0.6, 0.9); } }
  // ── the carpet
  { const cwid = Math.max(1.6, Math.min(4.4, Wd - (Wd >= 8 ? 6 : 3.2))), cdep = main ? 2.1 : Math.max(1.6, Math.min(3.2, inner ? Dp - 2 * fb - 0.8 : Dp - 4));
    const P = new Parts(); carpet(P, cwid, cdep); put(P, 0, main ? fb + 1.35 : Dp / 2); }
  // ── candle stands by the carpet
  for (const s of [-1, 1]) { const P = new Parts(); candleStand(P, 1.1); const a = s * Math.min(Wd / 2 - 0.9, (main ? 2.9 : 2.7)); put(P, a, Dp * 0.5 + (main ? 0.4 : 0)); lcirc(a, Dp * 0.5 + (main ? 0.4 : 0), 0.2, 1.4); }
  // ── the palace lanterns: down the middle under the moon beams, and in the aisles under the canopies
  const hang = (a, b, yHook) => { const ch = Math.max(0.1, yHook - 2.45 - 0.98); if (yHook - ch - 0.98 < 1.95) return; const P = new Parts(); lantern(P, ch); put(P, a, b, 0, yHook); };
  if (inner) {
    for (const a of posts) hang(a, Dp / 2, yB + 0.32 + 0.1);
    for (let k = 0; k < nLat; k++) { const a = -Wd / 2 + bw * (k + 0.5); hang(a, (0.15 + fb) / 2, H - 0.82 - 0.04); hang(a, Dp - (0.15 + fb) / 2, H - 0.82 - 0.04); }
  } else {
    for (let k = 1; k < Math.round(Dp / 2.5); k++) hang(0, Dp * k / Math.round(Dp / 2.5), H - 0.55 - 0.04);
  }
  S.emit(bag, origin[0], y + 0.05, origin[1], yaw);
}
