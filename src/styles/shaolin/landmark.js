// The landmark's own detail (docs/settlements/shaolin.md §6e): the bracket sets (dougong) under the eaves of the halls, the Shanmen's
// door with its leaves, lintel pegs and framed board, the ridge-top treasure vases. Every element is merged into one geometry per material
// (Parts), in materials the plan already draws, so the arrival frame gains triangles but no draws.
import { box, lathe } from '../../core/geom.js';
import { ball, limb, T, Parts, torus, roofOrnaments, merge } from '../qing/carving.js';

const RED = 'timber_red', BLUE = 'paint_blue', GILT = 'gilt_bronze', LAC = 'lacquer_red';

/**
 * shaolin_brackets { rect, y (the floor), H, eave, roof ('xieshan' | 'hip' | 'gable'), rise, sides: ['s', 'n'], per (sets between two posts) }
 * The row of bracket sets (dou gong) over the posts and between them, on an architrave: a base block (ludou), the arm out and the arm along
 * (huagong, guagong), small blocks (shengzi) at their ends, a second tier, third blocks and the eave purlin on them. Ming brackets are small
 * and close: several sets to a bay. The set is scaled in height to the roof's underside, which it never touches.
 */
export function shaolinBrackets(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H, eave = el.eave ?? 1.4, kind = el.roof ?? 'xieshan';
  const Lx = x1 - x0, Lz = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const nb = Math.max(1, 2 * Math.round((Lx / 3.6 - 1) / 2) + 1), B = Lz / 2 + eave, A = Lx / 2 + eave, R = el.rise ?? B * 0.62;
  const roofY = y + H - 0.25;
  const soffit = (x, z) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz), ts = Math.max(0, Math.min(1, (B - az) / B));
    let te = kind === 'gable' ? 9 : Math.max(0, (A - ax) / B);
    if (kind === 'xieshan' && te > 0.42) te = 9;
    return roofY + R * Math.pow(Math.min(ts, te), 1.7) - 0.14;
  };
  const P = new Parts(), per = el.per ?? 3, dy = 0.3;
  for (const side of el.sides ?? ['s']) {
    const zw = side === 's' ? z1 : z0, sg = side === 's' ? 1 : -1;
    const b0 = y + H - 1.2 + dy;                                            // the top of the architrave
    const vmax = 0.7, avail = soffit(cx, zw + sg * (vmax + 0.14)) - 0.03 - b0;
    const k = Math.max(0.55, Math.min(1, avail / 0.74));
    // local (u along the wall, v out, h up above the architrave) to a box of the world
    const bx = (m, u0, u1, v0, v1, h0, h1, c) => P.add(m, box(c + u0, b0 + h0 * k, sg > 0 ? zw + v0 : zw - v1, c + u1, b0 + h1 * k, sg > 0 ? zw + v1 : zw - v0));
    // the architrave (lan'e) and its board, over the whole face
    P.add(RED, box(x0 - 0.2, b0 - dy, sg > 0 ? zw + 0.04 : zw - 0.3, x1 + 0.2, b0, sg > 0 ? zw + 0.3 : zw - 0.04));
    P.add(BLUE, box(x0 - 0.2, b0 - dy + 0.05, sg > 0 ? zw + 0.3 : zw - 0.32, x1 + 0.2, b0 - 0.05, sg > 0 ? zw + 0.32 : zw - 0.3));
    for (let i = 0; i < nb; i++) {
      const xa = x0 + Lx * i / nb, xb = x0 + Lx * (i + 1) / nb;
      for (let j = 0; j <= per + 1; j++) {
        if (i + 1 < nb && j === per + 1) continue;                       // (the post of the next bay carries its own set)
        if (j === 0 && i > 0) continue;
        const c = xa + (xb - xa) * j / (per + 1);
        const post = j === 0 || j === per + 1, w = post ? 1.0 : 0.92;        // the set over a post a little stronger
        const m = (n) => n * w * 0.92;
        // the base block
        bx(RED, -m(0.17), m(0.17), 0.0, 0.34, 0, 0.17, c);
        // tier one: the arm out (huagong), the arm along (zhengxin guagong)
        bx(BLUE, -0.07, 0.07, 0.04, 0.62, 0.17, 0.29, c); bx(BLUE, -m(0.36), m(0.36), 0.12, 0.22, 0.17, 0.29, c);
        // the small blocks at their ends
        bx(RED, -0.09, 0.09, 0.5, 0.65, 0.29, 0.39, c);
        for (const s of [-1, 1]) bx(RED, s * m(0.3) - 0.09, s * m(0.3) + 0.09, 0.1, 0.24, 0.29, 0.39, c);
        // tier two
        bx(BLUE, -0.07, 0.07, 0.06, 0.7, 0.39, 0.5, c); bx(BLUE, -m(0.42), m(0.42), 0.1, 0.22, 0.39, 0.5, c);
        bx(RED, -0.07, 0.07, 0.56, 0.7, 0.5, 0.6, c);
        // the claw-ended nose of the lower arm (ang), a slanting tongue under the second tier
      }
    }
    // the eave purlin (liaoyan fang) laid across the third blocks, and the rafter-heads over it
    P.add(RED, box(x0 - 0.2, b0 + 0.6 * k, sg > 0 ? zw + 0.5 : zw - 0.74, x1 + 0.2, b0 + 0.74 * k, sg > 0 ? zw + 0.74 : zw - 0.5));
  }
  P.emit(bag, 0, 0, 0, 0);
}

/**
 * shanmen_door { x, z (the south face), y (the floor), w (the clear opening), h (the door's height), open (the leaves' angle from shut, radians),
 * plaqueW }: the leaves of the gate standing open at an angle with nine rows of nine gilt studs and a mask with its ring on each, the door frame,
 * the lintel board with its four round door-pegs (menzan), the threshold, and the carved frame round the name board. The name board itself is the
 * plan's `plaque` element, hung over the lintel.
 */
export function shanmenDoor(el, { bag }) {
  const P = new Parts(), { x, z, y, w, h } = el, th = 0.12, op = el.open ?? 1.15;
  const jx = w / 2;
  // the frame: two jambs, the threshold, the lintel board over the door and the pegs in it
  for (const s of [-1, 1]) P.add(LAC, box(Math.min(s * jx, s * (jx + 0.14)), y, z - 0.18, Math.max(s * jx, s * (jx + 0.14)), y + h, z + 0.12));
  P.add(LAC, box(-jx - 0.14, y + h, z - 0.18, jx + 0.14, y + h + 0.34, z + 0.12));
  P.add('granite_grey', box(-jx - 0.3, y, z - 0.42, jx + 0.3, y + 0.1, z + 0.4));
  for (let i = 0; i < 4; i++) { const px = -jx * 0.75 + i * jx * 0.5; P.add(GILT, T(lathe([[0.001, 0], [0.12, 0], [0.12, 0.05], [0.09, 0.07], [0.001, 0.07]], 10).rotateX(Math.PI / 2), px, y + h + 0.17, z + 0.12)); }
  // the leaves: hung on the jambs, open inward by `op` from the closed plane; the studded face turned toward the visitor
  const lw = jx - 0.1;
  for (const s of [-1, 1]) {
    // hinge at the jamb; the leaf runs toward the middle when shut, and swings to the north (z decreasing)
    const hx = s * jx, hz = z - 0.02, dx = -s * Math.cos(op), dz = -Math.sin(op), a = Math.atan2(-dz, dx);
    const face = s < 0 ? 1 : -1;                                // +z local for the west leaf, -z for the east
    const place = (g) => g.rotateY(a).translate(hx, y, hz);
    const hh = h - 0.1;
    P.add(LAC, place(box(0, 0.05, -th / 2, lw, hh, th / 2)));
    // frame stiles and rails of the leaf, proud of the face
    const f = (u0, u1, y0, y1, d = 0.035) => P.add(RED, place(box(u0, y0, face > 0 ? th / 2 : -th / 2 - d, u1, y1, face > 0 ? th / 2 + d : -th / 2)));
    f(0, 0.1, 0.05, hh); f(lw - 0.1, lw, 0.05, hh); f(0, lw, 0.05, 0.16); f(0, lw, hh - 0.12, hh); f(0, lw, hh * 0.18, hh * 0.18 + 0.07); f(0, lw, hh * 0.82, hh * 0.82 + 0.07);
    // the studs: nine by nine in the field between the rails
    const n = 9, u0 = 0.22, u1 = lw - 0.2, v0 = hh * 0.2 + 0.15, v1 = hh * 0.8 - 0.1;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const g = lathe([[0.04, 0], [0.001, 0.035]], 5).rotateX(face > 0 ? Math.PI / 2 : -Math.PI / 2);
      P.add(GILT, place(g.translate(u0 + (u1 - u0) * i / (n - 1), v0 + (v1 - v0) * j / (n - 1), face > 0 ? th / 2 + 0.005 : -th / 2 - 0.005)));
    }
    // the mask and ring at the middle of the leaf's free edge
    const mx = lw - 0.45, my = hh * 0.5;
    P.add(GILT, place(T(ball(0.13, 0.13, 0.035, 8, 5), mx, my, face > 0 ? th / 2 + 0.06 : -th / 2 - 0.06)));
    const ring = torus(0.1, 0.014, 12, 4); ring.rotateX(Math.PI / 2);
    P.add(GILT, place(T(ring, mx, my - 0.13, face > 0 ? th / 2 + 0.08 : -th / 2 - 0.08)));
  }
  // the carved frame round the name board: a gilt border and a cartouche of two dragons' heads above it
  const pw = el.plaqueW ?? 2.8, py = el.plaqueY, ph = el.plaqueH ?? 0.75, pz = z + 0.17;
  if (py !== undefined) {
    const fr = 0.09;
    P.add(GILT, box(-pw / 2 - fr, py - fr, pz - 0.04, pw / 2 + fr, py, pz + 0.07)); P.add(GILT, box(-pw / 2 - fr, py + ph, pz - 0.04, pw / 2 + fr, py + ph + fr, pz + 0.07));
    for (const s of [-1, 1]) P.add(GILT, box(s * (pw / 2 + fr) - (s > 0 ? fr : 0), py - fr, pz - 0.04, s * (pw / 2 + fr) + (s > 0 ? 0 : fr), py + ph + fr, pz + 0.07));
    for (const s of [-1, 1]) {
      // each dragon: a coil of three bodies and a head turned to the middle
      for (let k = 0; k < 3; k++) P.add(GILT, T(ball(0.1, 0.08, 0.05, 6, 4), s * (0.2 + k * 0.17), py + ph + fr + 0.07 - (k === 1 ? 0.02 : 0), pz + 0.04));
      P.add(GILT, T(ball(0.1, 0.09, 0.08, 6, 4), s * 0.12, py + ph + fr + 0.12, pz + 0.05));
      P.add(GILT, limb([s * 0.12, py + ph + fr + 0.12, pz + 0.05], [s * 0.04, py + ph + fr + 0.2, pz + 0.05], 0.03, 0.02, 4));
    }
    P.add(GILT, T(ball(0.1, 0.16, 0.05, 6, 4), 0, py + ph + fr + 0.18, pz + 0.05));            // the pearl between them
  }
  P.emit(bag, 0, 0, 0, 0);
}

/** ridge_vase { at: [x, z], y (the ridge's top), s }: the treasure vase (baoping) at the middle of a ridge, on a lotus seat. */
export function ridgeVase(el, { bag }) {
  const P = new Parts(), s = el.s ?? 1, M = 'tile_grey';
  P.add(M, lathe([[0.34 * s, 0], [0.34 * s, 0.1 * s], [0.24 * s, 0.14 * s], [0.3 * s, 0.24 * s], [0.18 * s, 0.3 * s], [0.001, 0.3 * s]], 10));
  P.add(M, lathe([[0.16 * s, 0.3 * s], [0.3 * s, 0.5 * s], [0.34 * s, 0.75 * s], [0.22 * s, 0.98 * s], [0.12 * s, 1.1 * s], [0.18 * s, 1.18 * s], [0.001, 1.2 * s]], 12));
  P.add(M, T(ball(0.1 * s, 0.14 * s, 0.1 * s, 8, 5), 0, 1.3 * s, 0));
  P.emit(bag, el.at[0], el.y, el.at[1], 0);
}

/**
 * roof_orn { rect, y (the floor), H, eave, roof, sweep, rise, figures, endH }: the ridge-end owls (chiwen) with their sword hilts, and the row of
 * little beasts down each hip (zoushou), of the roof that ming_hall builds from the same numbers, in the roof's own tile.
 */
export function roofOrn(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, along = (x1 - x0) >= (z1 - z0), o = el.eave ?? 1.25, Lx = x1 - x0, Lz = z1 - z0;
  const A = (along ? Lx : Lz) / 2 + o, B = (along ? Lz : Lx) / 2 + o;
  const got = [], sink = { add: (m, g) => got.push(g) };           // one geometry of the whole roof's ornaments: pieces this small would each be a fine-detail draw
  roofOrnaments(sink, { c: [(x0 + x1) / 2, (z0 + z1) / 2], A, B, y: el.y + el.H - 0.25, rise: el.rise ?? B * 0.62, kind: el.roof ?? 'xieshan', sweep: el.sweep ?? 1.0, alongZ: !along },
    { mat: 'tile_grey', figures: el.figures ?? 0, lead: 'beast', ends: true, endH: el.endH, reach: el.reach ?? 0.7 });
  if (got.length) bag.add('tile_grey', merge(got));
}
