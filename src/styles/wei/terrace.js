// The Three Terraces of Ye (docs/settlements/wei-ye.md §4): battered rammed-earth platforms in lifts with a broad stair on the east face and
// the arched doors of the storerooms at the foot; the tiered tower of the Bronze Sparrow with its ground storey furnished and the gilded bird
// on its mast; the covered skyways between the terraces; the Zhang River.
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { hipLite, eaveTiles, rng, roofs } from '../han/kit.js';
import { corridor } from '../han/scenery.js';

/** A straight flight over rect from y0 to y1, rising toward dir ('w' = −x, 'n' = −z): one strip per step, each solid down to `base`. */
function steps(bag, col, rect, y0, y1, dir, mat, riser, base, mat2) {
  const [x0, z0, x1, z1] = rect, n = Math.max(1, Math.round((y1 - y0) / riser)), len = dir === 'w' ? x1 - x0 : z1 - z0, d = len / n;
  for (let i = 0; i < n; i++) {
    const yT = y0 + (y1 - y0) * (i + 1) / n, m = mat2 && i % 2 ? mat2 : mat;
    const a = (dir === 'w' ? x1 : z1) - d * (i + 1), b = (dir === 'w' ? x1 : z1) - d * i;
    bag.add(m, dir === 'w' ? box(a, base, z0, b, yT, z1) : box(x0, base, a, x1, yT, b));
  }
  col.ramp(rect, y0, y1, dir);
}

/** An open storeroom cut into the foot of the terrace: x the face, z its centre; a lined chamber with a timber ceiling, jars of grain and salt, sacks, a shelf and a lamp. */
function storeroom(bag, col, lights, xf, z, W, D, H, seed) {
  const r = rng(seed + 11), a = z - W / 2, b = z + W / 2, xb = xf - D;
  bag.add('bluestone', box(xb, -0.4, a, xf + 0.4, 0.0, b)); col.floor([xb, a, xf + 0.4, b], 0);
  bag.add('mud_plaster', box(xb, 0.0, a, xf, H - 0.02, a + 0.05)); bag.add('mud_plaster', box(xb, 0.0, b - 0.05, xf, H - 0.02, b)); bag.add('mud_plaster', box(xb, 0.0, a, xb + 0.05, H - 0.02, b));
  for (let x = xb + 0.4; x < xf; x += 0.9) bag.add('timber', box(x - 0.1, H - 0.2, a, x + 0.1, H - 0.02, b));
  bag.add('timber_red', box(xf - 0.12, H - 0.02, a - 0.2, xf + 0.1, H + 0.28, b + 0.2));
  for (const s of [-1, 1]) bag.add('timber_red', box(xf - 0.1, 0, s < 0 ? a - 0.2 : b, xf + 0.1, H, s < 0 ? a : b + 0.2));
  for (const s of [-1, 1]) bag.add('lacquer_black', box(xf + 0.1, 0, s < 0 ? a - 0.95 : b, xf + 0.18, 2.3, s < 0 ? a : b + 0.95));
  // jars of grain along the back and the left wall, sacks and a shelf on the right, a lamp on a stand by the door
  for (let k = 0; k < 4; k++) bag.add(k % 2 ? 'pottery_dark' : 'terracotta', lathe([[0.001, 0], [0.2, 0.03], [0.36, 0.45], [0.3, 0.9], [0.17, 1.12], [0.2, 1.2], [0.001, 1.2]], 8, null, xb + 0.55, 0, a + 0.5 + k * 0.5));
  for (let k = 0; k < 5; k++) bag.add('sacking', box(xb + 1.1 + (k % 3) * 0.6, 0, b - 0.9 - Math.floor(k / 3) * 0.5, xb + 1.6 + (k % 3) * 0.6, 0.4 + r() * 0.1, b - 0.45 - Math.floor(k / 3) * 0.5));
  for (const h of [0.5, 1.1, 1.7]) bag.add('timber', box(xb + 0.05, h, b - 0.45, xb + 1.0, h + 0.05, b - 0.05));
  col.rect([xb + 0.05, a + 0.1, xb + 1.0, a + 2.1], 0, 1.3); col.rect([xb + 1.0, b - 1.4, xb + 2.9, b - 0.05], 0, 0.5);
  bag.add('wood_dark', box(xf - 0.9, 0, a + 0.2, xf - 0.8, 1.0, a + 0.3)); bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.07], [0.001, 0.07]], 6, null, xf - 0.85, 1.0, a + 0.25));
  if (lights) lights.push({ at: [xf - 2.0, 2.2, z], color: '#ffc27a', intensity: 3, distance: 8 });
}

/**
 * wei_terrace: { r: [x0, z0, x1, z1] (the foot), top, batter, lifts, stair: { rect (ascending west), riser }, dais: { r, top } (a raised crown over part),
 *   doors: n (arched storeroom doors on the east face); stair.dir 'w' (up the east face) or 'n' (up the south face) }
 */
export function terrace(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.r, T = el.top, B = el.batter ?? 2.4, n = el.lifts ?? 4, lh = T / n;
  // the storerooms that stand open (el.open of the doors, counted from the stair outward): where they are
  const RW = 2.6, RD = 4.6, RH = 2.7, RZ = [];
  if (el.doors && el.stair && el.stair.dir !== 'n') {
    const zc0 = (z0 + z1) / 2, zs0 = [el.stair.rect[1] - 1.5, el.stair.rect[3] + 1.5];
    for (let k = 0; k < (el.open ?? 0); k++) { const side = k % 2 ? 1 : -1, off = 3 + Math.floor(k / 2) * 5.2, z = side < 0 ? zs0[0] - off : zs0[1] + off; if (z > z0 + 3 && z < z1 - 3) RZ.push(z); }
    RZ.sort((p, q) => p - q); void zc0;
  }
  for (let i = 0; i < n; i++) {
    const a = B * i / n, b = B * (i + 1) / n, ya = i * lh, yb = (i + 1) * lh;
    // each lift is inset at its top (the batter); the face between is the sloped face, stood in for by the step of the lift
    const r = [x0 + b, z0 + b, x1 - b, z1 - b];
    if (i === 0 && RZ.length) {
      // the foot's lift is cut by the open storerooms: the face either side of each, the back, the lintel; a room is RW wide, RD deep, RH to its ceiling
      const solid = (q, y0, y1) => { bag.add('earth_wall', box(q[0], y0, q[1], q[2], y1, q[3])); col.rect(q, y0, y1); };
      let zc = r[1];
      for (const z of RZ) {
        solid([r[0], zc, r[2], z - RW / 2], -0.4, yb); zc = z + RW / 2;
        solid([r[0], z - RW / 2, r[2] - RD, z + RW / 2], -0.4, yb);
        solid([r[2] - RD, z - RW / 2, r[2], z + RW / 2], RH, yb);
        storeroom(bag, col, ctx.lights, r[2], z, RW, RD, RH, Math.round(Math.abs(z) * 7));
      }
      solid([r[0], zc, r[2], r[3]], -0.4, yb);
    } else {
      bag.add('earth_wall', box(r[0], i ? ya : -0.4, r[1], r[2], yb, r[3]));
      col.rect(r, i ? ya : -0.4, yb);
    }
    // the band of the lift: the plaster of mud at its top edge
    bag.add('mud_plaster', box(r[0] - 0.04, yb - 0.22, r[1] - 0.04, r[2] + 0.04, yb - 0.02, r[3] + 0.04));
    void a;
  }
  // weathering of the earthen face: rain streaks running down each lift from its band, the damp stain at the foot, the plaster's patches fallen away
  {
    const rr = rng((Math.round(x0) * 31 + Math.round(z0) * 17) | 0 || 5);
    for (let i = 0; i < n; i++) {
      const b = B * (i + 1) / n, yb = (i + 1) * lh, r = [x0 + b, z0 + b, x1 - b, z1 - b];
      for (let z = r[1] + 1.5; z < r[3] - 1.5; z += 3.5 + rr() * 5) {
        const w = 0.3 + rr() * 0.5, h = lh * (0.35 + rr() * 0.6);
        if (i === 0 && RZ.some((zz) => Math.abs(z + 0.2 - zz) < RW / 2 + 0.5)) continue;
        bag.add('plaster_streak', box(r[2] - 0.01, yb - 0.24 - h, z, r[2] + 0.03, yb - 0.24, z + w));
        if (rr() < 0.3) bag.add('plaster_damp', box(r[2] - 0.01, yb - lh + 0.2, z + w + 0.4, r[2] + 0.05, yb - lh + 0.2 + lh * 0.3, z + w + 0.4 + w * 2.5));
      }
      for (let x = r[0] + 3; x < r[2] - 3; x += 7 + rr() * 7) {
        const w = 0.3 + rr() * 0.5, h = lh * (0.35 + rr() * 0.6);
        bag.add('plaster_streak', box(x, yb - 0.24 - h, r[3] - 0.01, x + w, yb - 0.24, r[3] + 0.03));
        if (rr() < 0.5) bag.add('plaster_streak', box(x + 2, yb - 0.24 - h, r[1] - 0.03, x + 2 + w, yb - 0.24, r[1] + 0.01));
      }
    }
    // the foot: a course of dressed stone against the splash, and the weeds of the damp
    bag.add('bluestone', box(x0 + B * 0.25 - 0.05, -0.4, z0 + B * 0.25 - 0.05, x0 + B * 0.25, 0.01, z1 - B * 0.25 + 0.05));
  }
  const c = [x0 + B, z0 + B, x1 - B, z1 - B];
  bag.add('brick_paving', box(c[0], T - 0.02, c[1], c[2], T + 0.02, c[3]));
  col.floor(c, T);
  // the parapet round the crown (plaster under a tile cap), open at the stair
  const sdir = el.stair?.dir ?? 'w', gap = el.stair && sdir === 'w' ? [el.stair.rect[1] - 0.5, el.stair.rect[3] + 0.5] : null;
  const gapS = el.stair && sdir === 'n' ? [el.stair.rect[0] - 0.5, el.stair.rect[2] + 0.5] : null;
  const par = (q) => { bag.add('lime_plaster', box(q[0], T, q[1], q[2], T + 0.9, q[3])); col.rect(q, T, T + 0.9); bag.add('tile_grey', box(q[0] - 0.08, T + 0.9, q[1] - 0.08, q[2] + 0.08, T + 1.02, q[3] + 0.08)); };
  const t = 0.3;
  const gx = el.skyX, gw = 3.4;
  const parX = (z, side) => { if (gx !== undefined && el['gap' + side]) { par([c[0], z[0], gx - gw, z[1]]); par([gx + gw, z[0], c[2], z[1]]); } else par([c[0], z[0], c[2], z[1]]); };
  parX([c[1], c[1] + t], 'N');
  if (gapS) { par([c[0], c[3] - t, gapS[0], c[3]]); par([gapS[1], c[3] - t, c[2], c[3]]); } else parX([c[3] - t, c[3]], 'S'); par([c[0], c[1], c[0] + t, c[3]]);
  if (gap) { par([c[2] - t, c[1], c[2], gap[0]]); par([c[2] - t, gap[1], c[2], c[3]]); } else par([c[2] - t, c[1], c[2], c[3]]);
  // the stair up the east face
  if (el.stair) steps(bag, col, el.stair.rect, 0, T, sdir, 'bluestone', el.stair.riser ?? 0.25, -0.4, 'brick_paving');
  // the storerooms: arched doors at the foot of the east face (shut; the stores of grain, salt, water, fuel, ice), between the stair and the ends
  if (el.doors) {
    const zc = (z0 + z1) / 2, zs = el.stair ? [el.stair.rect[1] - 1.5, el.stair.rect[3] + 1.5] : [zc, zc];
    for (let k = 0; k < el.doors; k++) {
      const side = k % 2 ? 1 : -1, off = 3 + Math.floor(k / 2) * 5.2, z = side < 0 ? zs[0] - off : zs[1] + off;
      if (z < z0 + 3 || z > z1 - 3) continue;
      if (RZ.includes(z)) continue;                                  // an open room: its own frame (storeroom())
      bag.add('lacquer_black', box(x1 - 0.12, 0, z - 1.0, x1 + 0.08, 2.4, z + 1.0));
      bag.add('timber_red', box(x1 - 0.05, 2.4, z - 1.25, x1 + 0.12, 2.65, z + 1.25));
      for (const s of [-1, 1]) bag.add('timber_red', box(x1 - 0.05, 0, z + s * 1.15 - 0.1, x1 + 0.12, 2.4, z + s * 1.15 + 0.1));
    }
  }
  // a raised dais over part of the crown, with its own steps (the stair is el.dais.stair, rising west)
  if (el.dais) {
    const d = el.dais.r, DT = el.dais.top;
    bag.add('earth_wall', box(d[0], T, d[1], d[2], DT, d[3])); col.rect(d, T, DT);
    bag.add('bluestone', box(d[0] - 0.15, DT - 0.3, d[1] - 0.15, d[2] + 0.15, DT, d[1] + 0.4)); bag.add('bluestone', box(d[0] - 0.15, DT - 0.3, d[3] - 0.4, d[2] + 0.15, DT, d[3] + 0.15));
    bag.add('bluestone', box(d[0] - 0.15, DT - 0.3, d[1], d[0] + 0.4, DT, d[3])); bag.add('bluestone', box(d[2] - 0.4, DT - 0.3, d[1], d[2] + 0.15, DT, d[3]));
    bag.add('brick_paving', box(d[0] + 0.01, DT - 0.02, d[1] + 0.01, d[2] - 0.01, DT + 0.02, d[3] - 0.01));
    col.floor(d, DT);
    if (el.dais.stair) steps(bag, col, el.dais.stair, T, DT, 'w', 'bluestone', 0.25, T - 0.05, 'brick_paving');
  }
}

const bird = (bag, x, y, z) => {
  // the bronze bird on its mast: body, tail, wings spread, the head up
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0.05], [0.07, 2.2], [0.001, 2.3]], 6, null, x, y, z));
  bag.add('gilt_bronze', box(x - 0.3, y + 2.3, z - 0.55, x + 0.3, y + 2.62, z + 0.55));
  bag.add('gilt_bronze', box(x - 0.14, y + 2.62, z + 0.35, x + 0.14, y + 3.05, z + 0.7));
  bag.add('gilt_bronze', box(x - 1.2, y + 2.55, z - 0.2, x + 1.2, y + 2.65, z + 0.2));
  bag.add('gilt_bronze', box(x - 0.1, y + 2.4, z - 1.2, x + 0.1, y + 2.55, z - 0.5));
};

/** A triangle added so that its normal points up (up = true) or down. */
function tri(out, a, b, c, up = true) {
  const ux = c[0] - b[0], uy = c[1] - b[1], uz = c[2] - b[2], vx = a[0] - b[0], vy = a[1] - b[1], vz = a[2] - b[2];
  const ny = uz * vx - ux * vz;
  if ((ny > 0) === up) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
/** The pent roof (the ping zuo eave) round the foot of an upper storey: from the outer edge (half O, height yo) up to the wall (half I, height yi), the four trapezoids. */
function pentRoof(ctx, cx, cz, O, I, yo, yi) {
  const { bag } = ctx, top = [], under = [];
  const corner = (sx, sz, h, y) => [cx + sx * h, y, cz + sz * h];
  for (const [sx, sz, tx, tz] of [[1, 1, -1, 1], [-1, 1, -1, -1], [-1, -1, 1, -1], [1, -1, 1, 1]]) {
    const o0 = corner(sx, sz, O, yo), o1 = corner(tx, tz, O, yo), i0 = corner(sx, sz, I, yi), i1 = corner(tx, tz, I, yi);
    tri(top, o0, o1, i1, true); tri(top, o0, i1, i0, true);
    const u = (p) => [p[0], p[1] - 0.3, p[2]];
    tri(under, u(o0), u(o1), u(i1), false); tri(under, u(o0), u(i1), u(i0), false);
  }
  bag.add('tile_grey', fromTriangles(top)); bag.add('timber_red', fromTriangles(under));
  eaveTiles(bag, cx, cz, O, O, yo, 0, 0.42, 0.11);
}

/**
 * wei_tower: { c: [x, z], half, floor, seed } — three storeys of red timber, plaster and lattice under hipped tile roofs: the ground storey a furnished
 * room with a door in the east and west faces; a stair of 20 steps along its north wall rises through the ceiling to the second storey, a
 * furnished room of its own behind lattice, under the great hipped roof; the third storey is solid under the gilded bird.
 */
export function tower(el, ctx) {
  const { bag, col, lights } = ctx, [cx, cz] = el.c, a = el.half, f = el.floor, rand = rng(el.seed ?? 5);
  const H = 4.6, door = 1.9;
  // the base: a stone plinth, the floor of dark boards
  bag.add('bluestone', box(cx - a - 1.2, f - 0.5, cz - a - 1.2, cx + a + 1.2, f - 0.02, cz + a + 1.2));
  bag.add('lacquer_chestnut', box(cx - a, f - 0.03, cz - a, cx + a, f + 0.02, cz + a));
  col.floor([cx - a - 1.2, cz - a - 1.2, cx + a + 1.2, cz + a + 1.2], f);
  // the columns round the room, at 4 m, with their cap blocks
  const nx = Math.round(a * 2 / 4), P = [];
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= nx; j++) if (i === 0 || j === 0 || i === nx || j === nx) P.push([cx - a + 2 * a * i / nx, cz - a + 2 * a * j / nx]);
  for (const [x, z] of P) {
    if (Math.abs(x - cx) > a - 0.1 && Math.abs(z - cz) < door + 0.8) continue;      // the doors' ways stay clear
    bag.add('bluestone', lathe([[0.55, 0], [0.55, 0.1], [0.44, 0.2], [0.4, 0.3]], 10, null, x, f, z));
    bag.add('timber_red', lathe([[0.34, 0.3], [0.3, H]], 10, null, x, f, z));
    bag.add('timber_red', box(x - 0.42, f + H, z - 0.42, x + 0.42, f + H + 0.3, z + 0.42));
    col.circle(x, z, 0.38, f, f + H);
  }
  // the walls: plaster to 1 m, lattice above, the doors in the middle of the east and west faces
  const wallseg = (x0, z0, x1, z1, y0, y1, m) => { bag.add(m, box(x0, y0, z0, x1, y1, z1)); };
  const t = 0.22;
  for (const s of [-1, 1]) {
    wallseg(cx - a, cz + s * a - t, cx + a, cz + s * a + t, f, f + 1.0, 'lime_plaster'); wallseg(cx - a, cz + s * a - t, cx + a, cz + s * a + t, f + 1.0, f + H - 0.5, 'lattice');
    col.rect([cx - a, cz + s * a - t, cx + a, cz + s * a + t], f, f + H - 0.5);
    for (const [u0, u1] of [[-a, -door], [door, a]]) {
      wallseg(cx + s * a - t, cz + u0, cx + s * a + t, cz + u1, f, f + 1.0, 'lime_plaster'); wallseg(cx + s * a - t, cz + u0, cx + s * a + t, cz + u1, f + 1.0, f + H - 0.5, 'lattice');
      col.rect([cx + s * a - t, cz + u0, cx + s * a + t, cz + u1], f, f + H - 0.5);
    }
    // the door's lintel and its posts
    wallseg(cx + s * a - t, cz - door, cx + s * a + t, cz + door, f + 3.3, f + H - 0.5, 'lattice');
    for (const u of [-door, door]) bag.add('timber_red', box(cx + s * a - 0.25, f, cz + u - 0.25, cx + s * a + 0.25, f + 3.3, cz + u + 0.25));
    bag.add('timber_red', box(cx + s * a - 0.28, f + 3.3, cz - door - 0.3, cx + s * a + 0.28, f + 3.6, cz + door + 0.3));
  }
  bag.add('timber_red', box(cx - a - 0.3, f + H - 0.55, cz - a - 0.3, cx + a + 0.3, f + H - 0.1, cz + a + 0.3));
  // the ceiling and the floor of the second storey: one slab with the stairwell cut out of it (the stair rises west along the north wall)
  const f2 = f + H + 0.3, hx0 = cx + 0.3, hx1 = cx + 7.3, hz0 = cz - 7.5, hz1 = cz - 5.6;
  const slab = (x0, z0, x1, z1) => {
    bag.add('ceiling_coffer', box(x0, f + H - 0.1, z0, x1, f2 - 0.03, z1));
    bag.add('lacquer_chestnut', box(x0, f2 - 0.03, z0, x1, f2, z1));
    col.floor([x0, z0, x1, z1], f2);
  };
  slab(cx - a, cz - a, cx + a, hz0); slab(cx - a, hz1, cx + a, cz + a); slab(cx - a, hz0, hx0, hz1); slab(hx1, hz0, cx + a, hz1);
  steps(bag, col, [hx0, hz0, hx1, hz1], f, f2, 'w', 'bluestone', 0.25, f - 0.05, 'brick_paving');
  // the stair's rails on the second floor, round the well's open sides
  for (const r of [[hx0, hz1, hx1, hz1 + 0.1], [hx1 - 0.1, hz0, hx1, hz1]]) { bag.add('lacquer_red', box(r[0], f2 + 0.9, r[1], r[2], f2 + 1.0, r[3])); bag.add('lacquer_red', box(r[0], f2 + 0.4, r[1], r[2], f2 + 0.45, r[3])); col.rect(r, f2, f2 + 1.1); }
  for (let x = hx0 + 0.05; x <= hx1; x += 1.2) bag.add('lacquer_red', box(x - 0.05, f2, hz1, x + 0.05, f2 + 1.0, hz1 + 0.1));
  // the pent roof round the second storey, and the second storey itself: a hollow room, lattice above a plaster foot, a door-less ring of walls
  const a2 = a - 0.6, hh2 = 4.6;
  pentRoof(ctx, cx, cz, a + 2.8, a2, f + H - 0.3, f + H + 0.9);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('timber_red', box(cx + sx * a2 - 0.25, f2, cz + sz * a2 - 0.25, cx + sx * a2 + 0.25, f2 + hh2 - 0.5, cz + sz * a2 + 0.25));
  for (const s of [-1, 1]) {
    wallseg(cx - a2, cz + s * a2 - t, cx + a2, cz + s * a2 + t, f2, f2 + 0.9, 'lime_plaster'); wallseg(cx - a2, cz + s * a2 - t, cx + a2, cz + s * a2 + t, f2 + 0.9, f2 + hh2 - 0.5, 'lattice');
    wallseg(cx + s * a2 - t, cz - a2, cx + s * a2 + t, cz + a2, f2, f2 + 0.9, 'lime_plaster'); wallseg(cx + s * a2 - t, cz - a2, cx + s * a2 + t, cz + a2, f2 + 0.9, f2 + hh2 - 0.5, 'lattice');
    col.rect([cx - a2, cz + s * a2 - t, cx + a2, cz + s * a2 + t], f2, f2 + hh2); col.rect([cx + s * a2 - t, cz - a2, cx + s * a2 + t, cz + a2], f2, f2 + hh2);
  }
  bag.add('timber_red', box(cx - a2 - 0.3, f2 + hh2 - 0.5, cz - a2 - 0.3, cx + a2 + 0.3, f2 + hh2, cz + a2 + 0.3));
  bag.add('ceiling_coffer', box(cx - a2, f2 + hh2 - 0.55, cz - a2, cx + a2, f2 + hh2 - 0.5, cz + a2));
  // the roofs
  const eave = (aa, y, rise) => { hipLite({ c: [cx, cz], A: aa, B: aa, y, rise, lift: 0.5, pow: 1.2, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true }, ctx); eaveTiles(bag, cx, cz, aa, aa, y, 0.5, 0.4, 0.11); };
  eave(a2 + 2.6, f2 + hh2 - 0.1, 2.4);
  // the third storey: solid, plaster and lattice with red columns' bands, under its own roof
  const upper = (aa, y0, hh, roofA, rise) => {
    bag.add('lime_plaster', box(cx - aa, y0, cz - aa, cx + aa, y0 + 0.9, cz + aa)); bag.add('lattice', box(cx - aa - 0.03, y0 + 0.9, cz - aa - 0.03, cx + aa + 0.03, y0 + hh - 0.5, cz + aa + 0.03));
    bag.add('timber_red', box(cx - aa - 0.3, y0 + hh - 0.5, cz - aa - 0.3, cx + aa + 0.3, y0 + hh, cz + aa + 0.3));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('timber_red', box(cx + sx * aa - 0.25, y0, cz + sz * aa - 0.25, cx + sx * aa + 0.25, y0 + hh - 0.5, cz + sz * aa + 0.25));
    col.rect([cx - aa, cz - aa, cx + aa, cz + aa], y0, y0 + hh);
    eave(roofA, y0 + hh - 0.1, rise);
  };
  const y3 = f2 + hh2 + 1.0, a3 = a * 0.46;
  upper(a3, y3, 3.2, a3 + 2.2, 2.8);
  bird(bag, cx, y3 + 3.1 + 2.8 - 0.1, cz);
  // inside the ground storey: a screen of black lacquer at the west door's north side, mats and low tables in two rows, lamps, a censer
  const y = f + 0.02;
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x = cx - 3.6 + k * 3.6, z = cz + s * 4.6;
    bag.add('reed_mat', box(x - 1.0, y, z - 0.75, x + 1.0, y + 0.03, z + 0.75));
    bag.add('lacquer_black', box(x - 0.55, y + 0.03, z - 0.6, x + 0.55, y + 0.36, z));
    bag.add('lacquer_red', box(x - 0.45, y + 0.36, z - 0.55, x + 0.45, y + 0.39, z - 0.05));
    if (rand() < 0.6) bag.add('bronze', lathe([[0.001, 0], [0.07, 0.01], [0.1, 0.09], [0.001, 0.09]], 8, null, x + 0.1, y + 0.39, z - 0.3));
  }
  const sx = cx - a + 2.2;
  bag.add('lacquer_black', box(sx - 0.1, f + 0.05, cz - 3.2, sx + 0.1, f + 2.6, cz + 3.2));
  bag.add('paint_caihua', box(sx + 0.1, f + 0.4, cz - 3.0, sx + 0.14, f + 2.4, cz + 3.0));
  col.rect([sx - 0.12, cz - 3.2, sx + 0.12, cz + 3.2], f, f + 2.6);
  for (const [dx, dz] of [[-5, -5], [5, 5], [-5, 5], [5, -5]]) {
    bag.add('bronze', lathe([[0.2, 0], [0.18, 0.05], [0.05, 0.12], [0.04, 1.1], [0.1, 1.15], [0.24, 1.25], [0.2, 1.3]], 10, null, cx + dx * a / 8 * 1.2, y, cz + dz * a / 8 * 1.2));
  }
  lights.push({ at: [cx, f + H - 1.2, cz], color: '#ffd7a0', intensity: 6, distance: 16 });
  // inside the second storey (the poets' loft, over the stair's end): mats and tables in two rows facing the south windows, the books of the library on
  // a shelf along the south wall (bamboo slips in bundles), a zither (qin) on its table, a bronze lamp tree at each end, a censer
  const y2 = f2 + 0.02;
  for (let k = 0; k < 3; k++) for (const s of [0, 1]) {
    const x = cx - 5.0 + k * 3.0, z = cz + 0.6 + s * 3.4;
    bag.add('reed_mat', box(x - 1.0, y2, z - 0.75, x + 1.0, y2 + 0.03, z + 0.75));
    bag.add('lacquer_black', box(x - 0.55, y2 + 0.03, z - 0.6, x + 0.55, y2 + 0.38, z - 0.05)); bag.add('lacquer_red', box(x - 0.5, y2 + 0.38, z - 0.55, x + 0.5, y2 + 0.41, z - 0.08));
    if (k === 1 && !s) { bag.add('wood_dark', box(x - 0.45, y2 + 0.41, z - 0.4, x + 0.35, y2 + 0.46, z - 0.2)); bag.add('lacquer_black', box(x - 0.4, y2 + 0.46, z - 0.37, x + 0.3, y2 + 0.48, z - 0.23)); }
    else for (let q = 0; q < 3; q++) bag.add(q % 2 ? 'wood_ochre' : 'bamboo_culm', box(x - 0.3 + q * 0.25, y2 + 0.41, z - 0.4, x - 0.2 + q * 0.25, y2 + 0.47, z - 0.15));
  }
  for (let k = 0; k < 5; k++) {
    const x = cx - 6.2 + k * 2.6;
    bag.add('timber', box(x - 1.1, y2, cz + a2 - 1.0, x + 1.1, y2 + 0.04, cz + a2 - 0.35));
    bag.add('timber', box(x - 1.1, y2 + 0.04, cz + a2 - 0.4, x + 1.1, y2 + 1.8, cz + a2 - 0.35));
    for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) bag.add((q + r) % 3 ? 'wood_ochre' : 'bamboo_culm', box(x - 1.0 + q * 0.34, y2 + 0.1 + r * 0.42, cz + a2 - 0.95, x - 0.7 + q * 0.34, y2 + 0.45 + r * 0.42, cz + a2 - 0.42));
    col.rect([x - 1.1, cz + a2 - 1.0, x + 1.1, cz + a2 - 0.3], f2, f2 + 1.9);
  }
  for (const s of [-1, 1]) {
    bag.add('bronze', lathe([[0.2, 0], [0.18, 0.05], [0.05, 0.12], [0.04, 1.3], [0.1, 1.35], [0.24, 1.45], [0.2, 1.5]], 10, null, cx + s * (a2 - 1.0), y2, cz - 1.0));
    col.circle(cx + s * (a2 - 1.0), cz - 1.0, 0.25, f2, f2 + 1.5);
  }
  bag.add('bronze', lathe([[0.001, 0], [0.18, 0.04], [0.2, 0.2], [0.14, 0.34], [0.001, 0.36]], 10, null, cx - 5.0, y2 + 0.41, cz + 0.45));
  lights.push({ at: [cx - 2, f2 + hh2 - 1.4, cz + 1], color: '#ffd7a0', intensity: 5, distance: 15 });
}

/** wei_skyway: { a, b (the centre line, axis-aligned), y (the deck), w } — the covered walk (gé dào) between two terraces: a timber deck on posts, rails, a gabled roof. */
export function skyway(el, ctx) {
  const { bag, col } = ctx, [ax, az] = el.a, [bx, bz] = el.b, y = el.y, w = el.w ?? 4.4;
  const alongX = Math.abs(bx - ax) >= Math.abs(bz - az), x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), z0 = Math.min(az, bz), z1 = Math.max(az, bz);
  const r = alongX ? [x0, az - w / 2, x1, az + w / 2] : [ax - w / 2, z0, ax + w / 2, z1];
  bag.add('timber', box(r[0], y - 0.35, r[1], r[2], y, r[3])); col.floor(r, y);
  // the piers under it, at 5 m, down to the ground
  const L = alongX ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(L / 5));
  for (let i = 0; i <= n; i++) for (const s of [-1, 1]) {
    const x = alongX ? x0 + L * i / n : ax + s * (w / 2 - 0.3), z = alongX ? az + s * (w / 2 - 0.3) : z0 + L * i / n;
    bag.add('earth_wall', box(x - 0.45, -0.3, z - 0.45, x + 0.45, y - 0.35, z + 0.45)); col.rect([x - 0.45, z - 0.45, x + 0.45, z + 0.45], -0.3, y - 0.35);
  }
  corridor({ a: el.a, b: el.b, w: w - 0.6, h: 3.6, y: y }, ctx);
  // the lattice between the posts, the lower part plastered
  for (const s of [-1, 1]) {
    const q = alongX ? [r[0], az + s * (w / 2 - 0.3) - 0.04, r[2], az + s * (w / 2 - 0.3) + 0.04] : [ax + s * (w / 2 - 0.3) - 0.04, r[1], ax + s * (w / 2 - 0.3) + 0.04, r[3]];
    bag.add('lattice', box(q[0], y + 1.0, q[1], q[2], y + 3.2, q[3]));
  }
}

/** wei_river: { x0, x1, zc (a function of x), w, y, step } — the Zhang River: a ribbon of water over its bed, between low banks. */
export function river(el, ctx) {
  const { bag } = ctx, T = [], st = el.step ?? 8;
  const q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (let x = el.x0; x < el.x1; x += st) {
    const xb = Math.min(x + st, el.x1), za = el.zc(x), zb = el.zc(xb), h = el.w / 2;
    q([x, el.y, za - h], [x, el.y, za + h], [xb, el.y, zb + h], [xb, el.y, zb - h]);
  }
  bag.add('water', fromTriangles(T));
  void roofs; void steps;
}
