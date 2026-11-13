// The architecture of Classic Tikal (7th–8th c.; docs/settlements/maya-tikal.md §4–§5): steep stepped pyramids of rubble faced with
// stucco painted red, each tier a battered face under a moulding, one narrow steep stair between sloped balustrades; at the top the
// shrine of vaulted chambers one behind the other (corbel vaults, sapodilla lintels) under a tall roof comb; broad platforms with
// stairs for the acropolises; palaces of vaulted rooms on terraces; raised plastered causeways; stelae with round altars; the
// small ball court; and the houses of the town, poles and mud daub under hipped palm thatch on low rubble platforms.

import { registerStyle, STYLES, subtractRects } from '../../core/build.js';
import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import '../qing/index.js';
import { hearthKit, ollaKit, metateKit, waterJarKit, bedKit, storeJarKit, put, patch, soot } from '../maya/household.js';
import { frame, slab, frust, flipGeo, hex, flight, rng, L, RED, LIME } from './kit.js';
import { DRESS, tierWeather, wallWeather, curtain, hammock } from './dress.js';

const TIM = 'timber';

/** The shrine of a temple { c [x, z] (the middle of its front), y, face, chambers, len (the chambers' length), comb }: see the header. */
function shrine(el, { bag, col }) {
  const [fx, fz] = el.c, y = el.y, n = el.chambers ?? 3, ch = 2.2, tf = 1.8, tp = 1.6, len = el.len ?? 7, e = 1.8;
  const D = tf * 2 + ch * n + tp * (n - 1), W = len + 2 * e, F = frame(el.face, fx, fz);
  const hs = 2.8, steps = 5, sh = 0.5, ceil = hs + steps * sh, roof = ceil + 0.45, dh = 2.5, dw = 1.5;
  const wall = (u0, u1, v0, v1, y0, y1, c0 = y0) => { slab(bag, LIME, F.R(u0, u1, v0, v1), y + y0, y + y1, col, y + c0, y + y1); };
  // the walls: the two ends, the front and back, the partitions, each with its doorway in the middle
  wall(0, D, -W / 2, -W / 2 + e, 0, ceil);
  wall(0, D, W / 2 - e, W / 2, 0, ceil);
  const uPart = [0]; for (let i = 0; i < n; i++) uPart.push(tf + i * (ch + tp));
  const walls = [[0, tf]]; for (let i = 1; i < n; i++) walls.push([tf + i * ch + (i - 1) * tp, tf + i * (ch + tp)]); walls.push([D - tf, D]);
  for (const [u0, u1] of walls) {
    const v0 = -W / 2 + e, v1 = W / 2 - e;
    if (u1 === D) { wall(u0, u1, v0, v1, 0, ceil); continue; }                      // the back wall has no door
    wall(u0, u1, v0, -dw / 2, 0, ceil); wall(u0, u1, dw / 2, v1, 0, ceil);
    wall(u0, u1, -dw / 2, dw / 2, dh, ceil, dh);                                   // over the doorway
    const r = F.R(u0 - 0.05, u1 + 0.05, -dw / 2 - 0.2, dw / 2 + 0.2);
    bag.add(TIM, box(r[0], y + dh - 0.28, r[1], r[2], y + dh, r[3]));              // the sapodilla lintel, through the wall
  }
  // the corbel vault of each chamber: five steps in from each long wall, a capstone
  const inset = (ch / 2 - 0.15) / steps;
  for (let i = 0; i < n; i++) {
    const ua = tf + i * (ch + tp), ub = ua + ch;
    for (let k = 1; k <= steps; k++) {
      const yb = hs + (k - 1) * sh;
      bag.add(L, box(...(() => { const r = F.R(ua, ua + k * inset, -W / 2 + e, W / 2 - e); return [r[0], y + yb, r[1], r[2], y + yb + sh, r[3]]; })()));
      bag.add(L, box(...(() => { const r = F.R(ub - k * inset, ub, -W / 2 + e, W / 2 - e); return [r[0], y + yb, r[1], r[2], y + yb + sh, r[3]]; })()));
    }
    // the sapodilla beams across the vault at the springing, braced against the walls
    for (let b = 0; b < 3; b++) { const v = -len / 2 + 1 + b * (len - 2) / 2, r = F.R(ua - 0.1, ub + 0.1, v - 0.07, v + 0.07); bag.add(TIM, box(r[0], y + hs + 0.9, r[1], r[2], y + hs + 1.0, r[3])); }
  }
  slab(bag, LIME, F.R(-0.3, D + 0.3, -W / 2 - 0.3, W / 2 + 0.3), y + ceil, y + roof);                       // the roof, a cornice all round
  // the medial moulding and the frieze outside
  for (const [yy, hh, m] of [[hs - 0.15, 0.3, L], [ceil - 0.5, 0.5, L]]) {
    for (const r of [F.R(-0.2, D + 0.2, -W / 2 - 0.2, -W / 2), F.R(-0.2, D + 0.2, W / 2, W / 2 + 0.2), F.R(-0.2, 0, -W / 2, W / 2), F.R(D, D + 0.2, -W / 2, W / 2)]) bag.add(m, box(r[0], y + yy, r[1], r[2], y + yy + hh, r[3]));
  }
  const fr = F.R(-0.25, 0, -W / 2 + 1.2, W / 2 - 1.2);                                                          // blue panels in the front frieze
  bag.add('maya_blue', box(fr[0], y + ceil - 0.4, fr[1], fr[2], y + ceil - 0.1, fr[3]));
  // the upper zone: a stepped, sloping facade, in red
  const m = F.P(D / 2 - tf * 0 , 0), cx = (F.R(0, D, -W / 2, W / 2)[0] + F.R(0, D, -W / 2, W / 2)[2]) / 2, cz = (F.R(0, D, -W / 2, W / 2)[1] + F.R(0, D, -W / 2, W / 2)[3]) / 2;
  void m;
  const ax = (F.R(0, D, -W / 2, W / 2)[2] - F.R(0, D, -W / 2, W / 2)[0]) / 2 + 0.3, az = (F.R(0, D, -W / 2, W / 2)[3] - F.R(0, D, -W / 2, W / 2)[1]) / 2 + 0.3;
  frust(bag, RED, cx, cz, ax, az, ax - 0.9, az - 0.9, y + roof, y + roof + 2.2);
  // the roof comb: a tall slab over the rear, three stages, each narrower, niched and painted
  const cmb = el.comb ?? 12, st = [[0.40, 1.0, 0.55], [0.46, 0.84, 0.28], [0.52, 0.66, 0.17]];
  let yy = y + roof + 2.2;
  st.forEach(([u0, vw, hf], i) => {
    const h = cmb * hf, r = F.R(D * u0, D * 0.98 - i * 0.7, -(W / 2 - 0.8) * vw, (W / 2 - 0.8) * vw);
    bag.add(i % 2 ? RED : L, box(r[0], yy, r[1], r[2], yy + h, r[3]));
    // niches on the front face: recessed panels, the middle one a throne with the enthroned king
    const f = F.R(D * u0 - 0.06, D * u0, -(W / 2 - 0.8) * vw + 0.6, (W / 2 - 0.8) * vw - 0.6);
    bag.add(i % 2 ? L : 'maya_blue', box(f[0], yy + h * 0.2, f[1], f[2], yy + h * 0.8, f[3]));
    yy += h;
  });
  { const r = F.R(D * 0.5, D * 0.62, -0.7, 0.7); bag.add(L, box(r[0], yy, r[1], r[2], yy + 0.5, r[3])); const q = F.R(D * 0.53, D * 0.59, -0.35, 0.35); bag.add(RED, box(q[0], yy + 0.5, q[1], q[2], yy + 1.5, q[3])); const h = F.R(D * 0.54, D * 0.58, -0.45, 0.45); bag.add(L, box(h[0], yy + 1.5, h[1], h[2], yy + 2.1, h[3])); }   // the crowning figure
  // inside: the innermost chamber has a low bench, a censer bowl on the floor of each
  { const ua = tf + (n - 1) * (ch + tp), r = F.R(ua + ch - 0.7, ua + ch, -len / 2 + 0.3, len / 2 - 0.3); slab(bag, L, r, y, y + 0.45, col); }
  { const rr = rng(Math.round(fx * 5 + fz * 3) + 9);                                     // painted walls in the chambers: a band of ochre and rows of glyph panels
    for (let i = 0; i < n; i++) { const ua = tf + i * (ch + tp);
      for (const sg of [-1, 1]) {
        const wv = sg * (len / 2), b = F.R(ua + 0.1, ua + ch - 0.1, wv - (sg > 0 ? 0.03 : 0), wv + (sg > 0 ? 0 : 0.03));
        bag.add('stucco_ochre', box(b[0], y + 0.9, b[1], b[2], y + 2.1, b[3]));
        for (let g = 0; g < 3; g++) { const gu = ua + 0.45 + g * (ch - 0.9) / 2, q = F.R(gu - 0.18, gu + 0.18, wv - (sg > 0 ? 0.06 : -0.03), wv + (sg > 0 ? -0.03 : 0.06)); bag.add(rr() < 0.5 ? 'maya_blue' : RED, box(q[0], y + 1.2, q[1], q[2], y + 1.9, q[3])); }
      } } }
  for (let i = 0; i < n; i++) { const ua = tf + i * (ch + tp), p = F.P(ua + 0.8, len / 2 - 0.8); bag.add('pottery_dark', lathe([[0.001, 0], [0.16, 0.01], [0.2, 0.1], [0.16, 0.15], [0.001, 0.15]], 10, null, p[0], y + 0.002, p[1])); }
  col.floor(F.R(0, D, -W / 2, W / 2), y + roof);                         // the roof, to stand on (reached only by flight)
  return { D, W, F, ch, tf, tp, n };
}

/** The tiers of a pyramid { c, base [ax, az], top, H, tiers, face (the stair's side), stairW, foot (its foot's coordinate, else 60°), shrine {…} }. */
function pyramid(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, n = el.tiers, H = el.H, th = H / n, f = el.face, Y = el.y0 ?? 0;
  const dir = { w: [1, 0], e: [-1, 0], n: [0, 1], s: [0, -1] }[f], sw = el.stairW / 2;
  const A = (k) => [el.base[0] + (el.top[0] - el.base[0]) * k / n, el.base[1] + (el.top[1] - el.base[1]) * k / n];
  const head = dir[0] ? cx - dir[0] * el.top[0] : cz - dir[1] * el.top[1];                 // the stair's head: the top face
  const Lr = el.foot !== undefined ? Math.abs(head - el.foot) : H / 1.72;
  const foot = dir[0] ? [head - dir[0] * Lr, cz] : [cx, head - dir[1] * Lr];
  const hole = dir[0] ? [Math.min(foot[0], head) - 0.5, cz - sw - 0.1, Math.max(foot[0], head) + 1, cz + sw + 0.1] : [cx - sw - 0.1, Math.min(foot[1], head) - 0.5, cx + sw + 0.1, Math.max(foot[1], head) + 1];
  const wr = rng((el.seed ?? Math.round(cx * 7 + cz * 13)) + 5);
  for (let k = 0; k < n; k++) {
    const [a0, b0] = A(k), [a1, b1] = A(k + 1), y0 = Y + k * th, d = Math.min(a0 - a1, b0 - b1);
    const af = a0 - (a0 - a1) * 0.2, bf = b0 - (b0 - b1) * 0.2;
    frust(bag, RED, cx, cz, a0, b0, af, bf, y0, y0 + th * 0.86);                                                // the battered face
    frust(bag, L, cx, cz, af + 0.2, bf + 0.2, af + 0.2, bf + 0.2, y0 + th * 0.86, y0 + th);                         // the moulding
    frust(bag, 'maya_blue', cx, cz, af + 0.05, bf + 0.05, af + 0.05, bf + 0.05, y0 + th * 0.58, y0 + th * 0.66);    // a painted band
    void d;
    tierWeather(bag, cx, cz, a0, b0, af, bf, y0, th, wr, { nx: -dir[0], nz: -dir[1], w: sw + 1 });
    for (const r of subtractRects([cx - a0, cz - b0, cx + a0, cz + b0], [hole])) col.rect(r, y0 - 0.3, y0 + th - 0.31);
    col.floor([cx - a1 - 0.2, cz - b1 - 0.2, cx + a1 + 0.2, cz + b1 + 0.2], y0 + th);
  }
  if (el.masks) for (let k = 1; k < n; k++) {                                                    // the stucco masks flanking the stair, one pair on each tier
    const [a, b] = A(k + 0.5), half = dir[0] ? a : b;
    for (const sg of [-1, 1]) { const off = sg * (sw + 2.4), fx = cx - dir[0] * (half - 0.06), fz = cz - dir[1] * (half - 0.06); DRESS.k_mask({ c: dir[0] ? [fx, cz + off] : [cx + off, fz], face: f, y: Y + k * th + 0.2, s: Math.min(1, th / 3.3) }, ctx); }
  }
  flight(bag, col, { foot, dir, w: el.stairW, H, Lr, steps: Math.round(H / 0.3), y0: Y });
  if (el.shrine) shrine({ ...el.shrine, y: Y + H, face: { w: 'w', e: 'e', n: 'n', s: 's' }[f], c: el.shrine.c ?? (dir[0] ? [cx - dir[0] * (el.top[0] - 1.8), cz] : [cx, cz - dir[1] * (el.top[1] - 1.8)]) }, ctx);
}

/** A broad platform { rect, H, mat, batter, stairs: [{ face, at, w, run? }] }: a battered mass, flights on its sides, its top walkable. */
function platform(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, H = el.H, b = el.batter ?? 0.8, holes = [];
  for (const s of el.stairs || []) {
    const dir = { w: [1, 0], e: [-1, 0], n: [0, 1], s: [0, -1] }[s.face], Lr = s.run ?? H * 1.6, steps = Math.max(2, Math.round(H / (s.riser ?? 0.3)));
    const edge = dir[0] > 0 ? x0 : dir[0] < 0 ? x1 : dir[1] > 0 ? z0 : z1, off = s.off ?? 0;
    const foot = dir[0] ? [edge - dir[0] * (Lr - b) + 0 * off, s.at] : [s.at, edge - dir[1] * (Lr - b)];
    const r = flight(bag, col, { foot, dir, w: s.w, H, Lr: Lr - b + b, steps, mat: el.mat ?? LIME, bmat: el.mat ?? LIME, back: 0.5, y0: el.y0 ?? 0 });
    holes.push(r);
  }
  const mat = el.mat ?? LIME;
  const Y = el.y0 ?? 0;
  bag.add(mat, box(x0, Y - 0.1, z0, x1, Y + H, z1));
  if (b > 0) { frust(bag, el.trim ?? L, (x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2 + 0.25, (z1 - z0) / 2 + 0.25, (x1 - x0) / 2 + 0.25, (z1 - z0) / 2 + 0.25, Y + H - 0.45, Y + H); }
  { const wr = rng(Math.round(x0 * 3 + z1 * 5) + 11), Yh = Y + H, nrm = (F) => F;
    for (const face of ['w', 'e', 'n', 's']) {
      const dir = { w: [1, 0], e: [-1, 0], n: [0, 1], s: [0, -1] }[face], onX = dir[0] !== 0, len = onX ? z1 - z0 : x1 - x0;
      const edge = dir[0] > 0 ? x0 : dir[0] < 0 ? x1 : dir[1] > 0 ? z0 : z1, mid = onX ? (z0 + z1) / 2 : (x0 + x1) / 2;
      const F = onX ? frame(face, edge, mid) : frame(face, mid, edge), cnt = Math.max(3, Math.round(len / 5));
      wallWeather(bag, F, -len / 2 + 1, len / 2 - 1, Y, Yh - 0.45, wr, cnt, -0.0);
    }
    void nrm; }
  for (const r of subtractRects([x0, z0, x1, z1], holes.map((h) => [h[0] - 0.6, h[1] - 0.6, h[2] + 0.6, h[3] + 0.6]))) col.rect(r, Y - 0.3, Y + H - 0.31);
  col.floor([x0, z0, x1, z1], Y + H);
}

/**
 * A palace range { c (the middle of the front), face, y, n (rooms), rw, rd, rows (1 or 2), furn, comb }: rooms entered by a doorway
 * each from the front, vaulted across by corbelling, walls of plaster, the upper zone red, a moulding at the springing.
 */
function range(el, { bag, col, lights }) {
  const [fx, fz] = el.c, y = el.y ?? 0, n = el.n, rw = el.rw ?? 4.2, rd = el.rd ?? 2.7, rows = el.rows ?? 1, pt = 1.1, tf = 1.2, F = frame(el.face, fx, fz);
  const Lv = n * rw + (n + 1) * pt, hs = 2.6, steps = 4, sh = 0.45, ceil = hs + steps * sh, roof = ceil + 0.4, dh = 2.4, dw = 1.3;
  const uRow = [[tf, tf + rd]]; if (rows === 2) uRow.push([tf + rd + pt, tf + 2 * rd + pt]);
  const D = (rows === 2 ? tf + 2 * rd + pt : tf + rd) + tf;
  const V0 = -Lv / 2, vc = (i) => V0 + pt + i * (rw + pt) + rw / 2;
  const wall = (u0, u1, v0, v1, y0, y1, c0 = y0) => { if (v1 - v0 > 1e-3) slab(bag, el.mat ?? LIME, F.R(u0, u1, v0, v1), y + y0, y + y1, col, y + c0, y + y1); };
  const doorsWall = (u0, u1) => {                                                  // a wall across with a door at every room
    let v = V0;
    for (let i = 0; i < n; i++) { wall(u0, u1, v, vc(i) - dw / 2, 0, ceil); wall(u0, u1, vc(i) - dw / 2, vc(i) + dw / 2, dh, ceil, dh); v = vc(i) + dw / 2; const r = F.R(u0 - 0.05, u1 + 0.05, vc(i) - dw / 2 - 0.15, vc(i) + dw / 2 + 0.15); bag.add(TIM, box(r[0], y + dh - 0.25, r[1], r[2], y + dh, r[3])); }
    wall(u0, u1, v, Lv / 2, 0, ceil);
  };
  doorsWall(0, tf);
  if (rows === 2) doorsWall(uRow[0][1], uRow[1][0]);
  wall(D - tf, D, V0, Lv / 2, 0, ceil);
  for (const [u0, u1] of uRow) for (let i = 0; i <= n; i++) wall(u0, u1, V0 + i * (rw + pt), V0 + i * (rw + pt) + pt, 0, ceil);
  // the corbel vault over each row
  const inset = (rd / 2 - 0.2) / steps;
  for (const [ua, ub] of uRow) for (let k = 1; k <= steps; k++) {
    const yb = hs + (k - 1) * sh;
    for (const [a, b] of [[ua, ua + k * inset], [ub - k * inset, ub]]) { const r = F.R(a, b, V0 + pt, Lv / 2 - pt); bag.add(L, box(r[0], y + yb, r[1], r[2], y + yb + sh, r[3])); }
  }
  slab(bag, LIME, F.R(-0.3, D + 0.3, V0 - 0.3, Lv / 2 + 0.3), y + ceil, y + roof);
  const ring = [F.R(-0.2, D + 0.2, V0 - 0.2, V0), F.R(-0.2, D + 0.2, Lv / 2, Lv / 2 + 0.2), F.R(-0.2, 0, V0, Lv / 2), F.R(D, D + 0.2, V0, Lv / 2)];
  for (const r of ring) bag.add(L, box(r[0], y + hs - 0.1, r[1], r[2], y + hs + 0.25, r[3]));
  const bb = F.R(0, D, V0, Lv / 2), cx = (bb[0] + bb[2]) / 2, cz = (bb[1] + bb[3]) / 2, ax = (bb[2] - bb[0]) / 2 + 0.3, az = (bb[3] - bb[1]) / 2 + 0.3;
  frust(bag, RED, cx, cz, ax, az, ax - 0.7, az - 0.7, y + roof, y + roof + 1.4);
  // the piers between the doors: a painted dado in blue on the front
  for (let i = 0; i <= n; i++) { const v = V0 + i * (rw + pt) + pt / 2, r = F.R(-0.12, 0, v - 0.18, v + 0.18); bag.add(RED, box(r[0], y, r[1], r[2], y + ceil, r[3])); }
  if (el.comb) { const r = F.R(D * 0.3, D * 0.7, V0 + 2, Lv / 2 - 2); bag.add(RED, box(r[0], y + roof + 1.4, r[1], r[2], y + roof + 1.4 + el.comb, r[3])); const q = F.R(D * 0.3 - 0.08, D * 0.3, V0 + 3, Lv / 2 - 3); bag.add(L, box(q[0], y + roof + 1.4 + el.comb * 0.25, q[1], q[2], y + roof + 1.4 + el.comb * 0.8, q[3])); }
  wallWeather(bag, F, V0 + 0.6, Lv / 2 - 0.6, y, y + ceil, rng((el.seed ?? 7) + 31), Math.max(4, n + 1));
  // inside every room: the painted dado along its back wall (an ochre band, blue and red glyph panels), a hanging mat at the door
  { const rr = rng((el.seed ?? 7) + 77);
    for (const [ua, ub] of uRow) for (let i = 0; i < n; i++) {
      const wb = F.R(ub - 0.03, ub, vc(i) - rw / 2 + 0.1, vc(i) + rw / 2 - 0.1);
      bag.add('stucco_ochre', box(wb[0], y + 1.0, wb[1], wb[2], y + 2.0, wb[3]));
      for (let g = 0; g < 4; g++) { const gv = vc(i) - rw / 2 + 0.55 + g * (rw - 1.1) / 3, q = F.R(ub - 0.06, ub - 0.03, gv - 0.2, gv + 0.2); bag.add(rr() < 0.5 ? 'maya_blue' : RED, box(q[0], y + 1.25, q[1], q[2], y + 1.8, q[3])); }
      if (ua === uRow[0][0]) curtain(bag, F, vc(i) + 0.45, y + dh - 0.05, 0.5, 0.8);
    }
  }
  // furnishing: a masonry bench along the back of every room, a mat, jars, a hearth in one
  if (el.furn) {
    const rand = rng(el.seed ?? 7);
    for (const [ua, ub] of uRow) for (let i = 0; i < n; i++) {
      if (rows === 2 && ua === uRow[0][0]) { const ph = F.P(ua + 0.4, vc(i) + rw / 2 - 0.45); put(bag, storeJarKit(), ph[0], y, ph[1], 0); continue; }   // the passage row keeps its way through free
      const bench = F.R(ub - 1.0, ub, vc(i) - rw / 2 + 0.2, vc(i) + rw / 2 - 0.2); slab(bag, L, bench, y, y + 0.5, col);
      const m = F.R(ub - 0.9, ub - 0.1, vc(i) - 0.7, vc(i) + 0.7); bag.add('reed_mat', box(m[0], y + 0.5, m[1], m[2], y + 0.52, m[3]));
      const ph = F.P(ua + 0.4, vc(i) + rw / 2 - 0.45);
      if (rand() < 0.5) { put(bag, waterJarKit(), ph[0], y, ph[1], 0); col.circle(ph[0], ph[1], 0.33, y, y + 0.8); } else { put(bag, storeJarKit(), ph[0], y, ph[1], 0); }
      if (rand() < 0.4) { const po = F.P(ua + 0.45, vc(i) - rw / 2 + 0.4); put(bag, ollaKit(), po[0], y, po[1], 0); }
      // the room's lamp: a clay bowl of burning pitch-pine on the bench's end, one warm light to the room
      if (lights && el.lit !== false) { const pl = F.P(ub - 0.5, vc(i) + 1.3); lights.push({ at: [pl[0], y + 1.5, pl[1]], color: '#ffa860', intensity: 3.2, distance: 5.5 }); bag.add('flame', lathe([[0.04, 0], [0.02, 0.1], [0.001, 0.18]], 6, null, pl[0], y + 0.5, pl[1])); }
    }
  }
}

/** A stela and its altar { at [x, z], face, h, seed }: a tall slab of carved limestone on a footing, the round altar before it. */
function stela(el, { bag, col }) {
  const [x, z] = el.at, F = frame(el.face ?? 's', x, z), h = el.h ?? 3.2, w = el.w ?? 1.3, rand = rng(el.seed ?? 3);
  const b = F.R(-0.6, 0.6, -w / 2 - 0.35, w / 2 + 0.35); bag.add(L, box(b[0], 0, b[1], b[2], 0.3, b[3]));
  const s = F.R(-0.2, 0.2, -w / 2, w / 2); bag.add(L, box(s[0], 0.3, s[1], s[2], 0.3 + h, s[3])); col.rect(s, 0, h);
  // the ruler carved in relief on the face (toward the plaza), a frame round it, the glyph column beside
  const f = F.R(-0.26, -0.2, -w / 2 + 0.12, w / 2 - 0.12); bag.add('limestone_carved', box(f[0], 0.7, f[1], f[2], 0.3 + h - 0.35, f[3]));
  const hd = F.R(-0.31, -0.2, -0.28, 0.28); bag.add(L, box(hd[0], 0.3 + h * 0.62, hd[1], hd[2], 0.3 + h * 0.62 + 0.55, hd[3]));
  const cr = F.R(-0.34, -0.2, -0.42, 0.42); bag.add('maya_blue', box(cr[0], 0.3 + h * 0.62 + 0.5, cr[1], cr[2], 0.3 + h * 0.62 + 0.7, cr[3]));
  for (let i = 0; i < 4; i++) { const g = F.R(-0.22, -0.2, w / 2 - 0.3 + 0.0, w / 2 - 0.12); bag.add(L, box(g[0], 0.9 + i * 0.5 + rand() * 0.05, g[1], g[2], 1.2 + i * 0.5, g[3])); }
  const a = F.P(-1.6, 0); bag.add(L, lathe([[0.001, 0], [0.8, 0], [0.82, 0.12], [0.8, 0.5], [0.001, 0.5]], 14, null, a[0], 0, a[1])); col.circle(a[0], a[1], 0.8, 0, 0.5);
}

/** A raised causeway of plastered limestone { pts, w, h }: a trapezoid in section, its ends and its sides sloping (walked up anywhere). */
function causeway(el, { bag }) {
  const h = el.h ?? 0.9, sl = h * 1.3, hw = el.w / 2;
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const a = el.pts[i], b = el.pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len, nx = -uz, nz = ux;
    const corner = (s, o, y, ext) => [a[0] + ux * (s < 0 ? -ext : len + ext) + nx * o, y, a[1] + uz * (s < 0 ? -ext : len + ext) + nz * o];
    const first = i === 0, last = i + 2 === el.pts.length, ea = first ? sl : hw + sl, eb = last ? sl : hw + sl, ta = first ? 0 : hw, tb = last ? 0 : hw;
    const P = [corner(-1, -hw - sl, -0.4, ea), corner(1, -hw - sl, -0.4, eb), corner(1, hw + sl, -0.4, eb), corner(-1, hw + sl, -0.4, ea), corner(-1, -hw, h, ta), corner(1, -hw, h, tb), corner(1, hw, h, tb), corner(-1, hw, h, ta)];
    hex(bag, LIME, P);
  }
}

/** The ball court { alley [x0, z0, x1, z1] (long in z), mound (breadth) }: two parallel mounds with sloped faces, three markers in the alley. */
function ballcourt(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.alley, mw = el.mound ?? 6, H = 3.2, cx = (x0 + x1) / 2;
  for (const s of [-1, 1]) {
    const xi = s < 0 ? x0 : x1, xo = xi + s * mw, a = Math.min(xi, xo), b = Math.max(xi, xo);
    const inner = 1.7, outer = 0.5;
    bag.add(LIME, fromTriangles(orientOutward((() => { const t = [], q = (p1, p2, p3, p4) => t.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
      const X = (u) => xi + s * u, poly = [[0, 0], [mw, 0], [mw - outer, H], [inner, H], [0.2, 1.0], [0, 0.9]];
      for (let i = 1; i + 1 < poly.length; i++) for (const z of [z0, z1]) t.push(X(poly[0][0]), poly[0][1], z, X(poly[i][0]), poly[i][1], z, X(poly[i + 1][0]), poly[i + 1][1], z);
      for (let i = 0; i < poly.length; i++) { const p = poly[i], r = poly[(i + 1) % poly.length]; q([X(p[0]), p[1], z0], [X(r[0]), r[1], z0], [X(r[0]), r[1], z1], [X(p[0]), p[1], z1]); }
      return t; })())));
    col.rect([a, z0, b, z1], 0, H - 0.5);
    frust(bag, L, (a + b) / 2, (z0 + z1) / 2, (b - a) / 2 - 0.6, (z1 - z0) / 2 - 0.1, (b - a) / 2 - 0.6, (z1 - z0) / 2 - 0.1, H - 0.2, H);
    const ps = el.small ? [] : [[inner + 0.2, 0]];
    void ps;
  }
  for (let i = 0; i < 3; i++) { const z = z0 + (z1 - z0) * (0.2 + i * 0.3); bag.add('limestone_carved', lathe([[0.001, 0], [0.42, 0], [0.42, 0.04], [0.001, 0.04]], 14, null, cx, 0.03, z)); }
  for (const z of [z0, z1]) { const r = [x0 - mw, z + (z < (z0 + z1) / 2 ? -1.4 : 0.2), x1 + mw, z + (z < (z0 + z1) / 2 ? -0.2 : 1.4)]; bag.add(LIME, box(r[0], 0, r[1], r[2], 0.6, r[3])); }
}

/** A pole-and-thatch house { c, w, d (the extents in x and z), door ('n'…), seed, kitchen }: a rubble platform, walls of daub, a hipped roof of palm thatch; furnished. */
function house(el, ctx) {
  const { bag, col, lights } = ctx, [cx, cz] = el.c, w = el.w, d = el.d, rand = rng(el.seed || 1), P = 0.42, T = 0.16, wh = 1.95, side = el.door ?? 's';
  const px = w / 2 + 0.7, pz = d / 2 + 0.7;
  bag.add('rubble', box(cx - px, -0.1, cz - pz, cx + px, P, cz + pz));
  bag.add(LIME, box(cx - px + 0.1, P - 0.04, cz - pz + 0.1, cx + px - 0.1, P, cz + pz - 0.1));
  col.floor([cx - px, cz - pz, cx + px, cz + pz], P);
  // the walls: four of daub, a doorway in the middle of the door's side (1.0 wide, 1.85 high)
  const dwid = 1.0, dh = 1.85, mat = rand() < 0.5 ? 'mud_plaster' : 'lime_plaster';
  const wl = (x0, z0, x1, z1, isDoor, alongX) => {
    if (!isDoor) { slab(bag, mat, [x0, z0, x1, z1], P, P + wh, col, P, P + wh); return; }
    const m = alongX ? (x0 + x1) / 2 : (z0 + z1) / 2;
    const r1 = alongX ? [x0, z0, m - dwid / 2, z1] : [x0, z0, x1, m - dwid / 2], r2 = alongX ? [m + dwid / 2, z0, x1, z1] : [x0, m + dwid / 2, x1, z1];
    slab(bag, mat, r1, P, P + wh, col); slab(bag, mat, r2, P, P + wh, col);
    const o = alongX ? [m - dwid / 2, z0, m + dwid / 2, z1] : [x0, m - dwid / 2, x1, m + dwid / 2];
    bag.add(mat, box(o[0], P + dh, o[1], o[2], P + wh, o[3])); col.rect(o, P + dh, P + wh);
    bag.add(TIM, box(o[0] - (alongX ? 0.1 : 0), P + dh - 0.12, o[1] - (alongX ? 0 : 0.1), o[2] + (alongX ? 0.1 : 0), P + dh, o[3] + (alongX ? 0 : 0.1)));
  };
  wl(cx - w / 2, cz - d / 2, cx + w / 2, cz - d / 2 + T, side === 'n', true);
  wl(cx - w / 2, cz + d / 2 - T, cx + w / 2, cz + d / 2, side === 's', true);
  wl(cx - w / 2, cz - d / 2 + T, cx - w / 2 + T, cz + d / 2 - T, side === 'w', false);
  wl(cx + w / 2 - T, cz - d / 2 + T, cx + w / 2, cz + d / 2 - T, side === 'e', false);
  // the roof: steep, hipped, thatch both sides of the skin; the ridge along the long axis
  const ex = w / 2 + 0.7, ez = d / 2 + 0.7, y0 = P + wh - 0.15, rise = 3.0, long = w >= d;
  const inx = long ? ez - 0.12 : ex - 0.12, g = (inxx, inzz) => ({ ax: ex - inxx, az: ez - inzz });
  const top = long ? g(Math.min(ex - 0.25, ez + 0.4) , ez - 0.12) : g(ex - 0.12, Math.min(ez - 0.25, ex + 0.4));
  void inx;
  const t = [];
  const B = [[-ex, -ez], [ex, -ez], [ex, ez], [-ex, ez]], T2 = [[-top.ax, -top.az], [top.ax, -top.az], [top.ax, top.az], [-top.ax, top.az]];
  const V = (q, yy) => [cx + q[0], yy, cz + q[1]];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; t.push(...V(B[i], y0), ...V(T2[i], y0 + rise), ...V(T2[j], y0 + rise), ...V(B[i], y0), ...V(T2[j], y0 + rise), ...V(B[j], y0)); }
  t.push(...V(T2[0], y0 + rise), ...V(T2[3], y0 + rise), ...V(T2[2], y0 + rise), ...V(T2[0], y0 + rise), ...V(T2[2], y0 + rise), ...V(T2[1], y0 + rise));
  const gr = fromTriangles(t); bag.add('thatch_palm', gr); bag.add('thatch_palm', flipGeo(gr.clone()));
  void ctx;
  // inside: the bed with its mats at one end, the hearth (in the kitchen), the metate, a water jar
  const ix = (a) => cx + a, iz = (a) => cz + a, F = P - 0.0;
  const alongX = long, e0 = (long ? -1 : -1) * (long ? w : d) / 2 + 1.0, e1 = -e0;
  const at = (a, b) => (alongX ? [ix(a), iz(b)] : [ix(b), iz(a)]);
  const hang = !el.kitchen && rand() < 0.55;
  if (el.kitchen) { const p = at(e1 - 0.2, 0); put(bag, hearthKit('rubble'), p[0], F, p[1], 0); col.circle(p[0], p[1], 0.42, F, F + 0.3); const q = at(e1 - 0.5, -0.8); put(bag, ollaKit(), q[0], F, q[1], 0); const m = at(e1 - 1.5, 0.7); put(bag, metateKit(), m[0], F, m[1], alongX ? Math.PI : -Math.PI / 2); }
  else if (!hang) { const b = at(e0 + 0.2, 0.2); put(bag, bedKit(rand() < 0.7 ? 'cloth_white' : 'cloth_ochre', 'cloth_red'), b[0], F, b[1], alongX ? Math.PI / 2 : 0); }
  if (hang) { const a = at(e0 + 0.5, -((long ? d : w) / 2 - 0.5)), b2 = at(e0 + 0.5, (long ? d : w) / 2 - 0.5); hammock(bag, [a[0], F + 1.5, a[1]], [b2[0], F + 1.5, b2[1]], 0.45, rand() < 0.5 ? 'cloth_white' : 'cloth_ochre'); }
  // outside: the doorway's poles, strings of maize and chiles under the eave, a log bench, the stains where the rain splashes the daub
  { const F2 = frame(side, ...(side === 'n' ? [cx, cz - d / 2] : side === 's' ? [cx, cz + d / 2] : side === 'w' ? [cx - w / 2, cz] : [cx + w / 2, cz])), dn = [-F2.U[0], 0, -F2.U[1]];
    for (const v of [-0.58, 0.58]) { const p = F2.P(-0.06, v); bag.add(TIM, rod([p[0], P, p[1]], [p[0], P + dh, p[1]], 0.05, 5)); }
    for (const [v, m, hh] of el.lite ? [] : [[-0.95, 'wood_ochre', 0.5], [-1.05, 'stucco_red', 0.4], [0.95, 'wood_ochre', 0.45]]) { const p = F2.P(-0.14, v); bag.add('rope_fibre', rod([p[0], P + wh - 0.25, p[1]], [p[0], P + wh - 0.25 - hh, p[1]], 0.012, 4)); bag.add(m, box(p[0] - 0.07, P + wh - 0.25 - hh, p[1] - 0.07, p[0] + 0.07, P + wh - 0.3, p[1] + 0.07)); }
    if (rand() < 0.6) { const q = F2.R(-1.05, -0.65, 0.9, 2.1); bag.add(TIM, box(q[0], P, q[1], q[2], P + 0.28, q[3])); }
    for (let k = 0; k < (el.lite ? 0 : 3); k++) { const v = (rand() - 0.5) * (side === 'n' || side === 's' ? w : d) * 0.8, p = F2.P(-0.01, v); patch(bag, 'plaster_damp', [p[0], P + 0.3, p[1]], dn, 0.6 + rand() * 0.8, 0.4, Math.floor(rand() * 1e6), 0.01); }
    if (el.kitchen) soot(bag, [cx, P + wh + 0.8, cz], [0, -1, 0], 1.2, 1.2, el.seed || 3); }
  if (lights && !el.lite) { const pl = at(0, 0); lights.push({ at: [pl[0], F + 1.2, pl[1]], color: '#ff9a55', intensity: 3, distance: 5 }); }
  const j = at(e1 - 0.3, (long ? d : w) / 2 - 0.6); put(bag, waterJarKit(), j[0], F, j[1], 0); col.circle(j[0], j[1], 0.33, F, F + 0.8);
  const s = at(e0 + 0.35, -((long ? d : w) / 2 - 0.55)); put(bag, storeJarKit(), s[0], F, s[1], 0);
}

/** k_ball: the solid rubber ball of the game { at, y, r }. */
function ball(el, { bag }) {
  const r = el.r ?? 0.15, n = 8, p = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; p.push([Math.max(0.001, Math.cos(a) * r), r + Math.sin(a) * r]); }
  bag.add('rubber', lathe(p, 12, null, el.at[0], el.y ?? 0, el.at[1]));
}

/** petate: a woven mat laid on the ground { at [x, z], y, w, d, rot }. */
function petate(el, { bag }) { const g = box(-el.w / 2, 0, -el.d / 2, el.w / 2, 0.015, el.d / 2); if (el.rot) g.rotateY(el.rot); bag.add('reed_mat', g.translate(el.at[0], el.y ?? 0, el.at[1])); }

/** albarrada: a low dry-stone wall along a polyline { pts, h }. */
function albarrada(el, { bag, col }) {
  const h = el.h ?? 0.9;
  for (let i = 0; i + 1 < el.pts.length; i++) {
    const a = el.pts[i], b = el.pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uz = (b[1] - a[1]) / len, nx = -uz * 0.3, nz = ux * 0.3;
    hex(bag, 'rubble', [[a[0] + nx, 0, a[1] + nz], [b[0] + nx, 0, b[1] + nz], [b[0] - nx, 0, b[1] - nz], [a[0] - nx, 0, a[1] - nz], [a[0] + nx * 0.8, h, a[1] + nz * 0.8], [b[0] + nx * 0.8, h, b[1] + nz * 0.8], [b[0] - nx * 0.8, h, b[1] - nz * 0.8], [a[0] - nx * 0.8, h, a[1] - nz * 0.8]]);
    col.segment(a, b, 0.6, 0, h);
  }
}

registerStyle('tikal', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, k_pyramid: pyramid, k_shrine: shrine, k_platform: platform, k_range: range, k_stela: stela, k_causeway: causeway, k_ballcourt: ballcourt, k_house: house, k_ball: ball, petate, albarrada, ...DRESS },
  objects: {},
});
export { frame };
