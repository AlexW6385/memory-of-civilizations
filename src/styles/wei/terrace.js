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

/**
 * wei_terrace: { r: [x0, z0, x1, z1] (the foot), top, batter, lifts, stair: { rect (ascending west), riser }, dais: { r, top } (a raised crown over part),
 *   doors: n (arched storeroom doors on the east face); stair.dir 'w' (up the east face) or 'n' (up the south face) }
 */
export function terrace(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.r, T = el.top, B = el.batter ?? 2.4, n = el.lifts ?? 4, lh = T / n;
  for (let i = 0; i < n; i++) {
    const a = B * i / n, b = B * (i + 1) / n, ya = i * lh, yb = (i + 1) * lh;
    // each lift is inset at its top (the batter); the face between is the sloped face, stood in for by the step of the lift
    const r = [x0 + b, z0 + b, x1 - b, z1 - b];
    bag.add('earth_wall', box(r[0], i ? ya : -0.4, r[1], r[2], yb, r[3]));
    col.rect(r, i ? ya : -0.4, yb);
    // the band of the lift: the plaster of mud at its top edge
    bag.add('mud_plaster', box(r[0] - 0.04, yb - 0.22, r[1] - 0.04, r[2] + 0.04, yb - 0.02, r[3] + 0.04));
    void a;
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

/**
 * wei_tower: { c: [x, z], half, floor, storeys (3), seed } — three storeys of red timber, plaster and lattice, each under its hipped tile roof and each
 * smaller than the one below; the ground storey is a room with a door in the east and west faces, furnished; the bird on the top.
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
  bag.add('ceiling_coffer', box(cx - a, f + H - 0.1, cz - a, cx + a, f + H - 0.02, cz + a));
  bag.add('timber_red', box(cx - a - 0.3, f + H - 0.55, cz - a - 0.3, cx + a + 0.3, f + H - 0.1, cz + a + 0.3));
  // the roof of the first storey
  const eave = (aa, y, rise) => { hipLite({ c: [cx, cz], A: aa, B: aa, y, rise, lift: 0.5, pow: 1.2, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true }, ctx); eaveTiles(bag, cx, cz, aa, aa, y, 0.5, 0.4, 0.11); };
  eave(a + 2.8, f + H - 0.3, 2.4);
  // the second and third storeys: solid (not entered), plaster and lattice with red columns' bands
  const upper = (aa, y0, hh, roofA, rise) => {
    bag.add('lime_plaster', box(cx - aa, y0, cz - aa, cx + aa, y0 + 0.9, cz + aa)); bag.add('lattice', box(cx - aa - 0.03, y0 + 0.9, cz - aa - 0.03, cx + aa + 0.03, y0 + hh - 0.5, cz + aa + 0.03));
    bag.add('timber_red', box(cx - aa - 0.3, y0 + hh - 0.5, cz - aa - 0.3, cx + aa + 0.3, y0 + hh, cz + aa + 0.3));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('timber_red', box(cx + sx * aa - 0.25 - (sx > 0 ? 0 : 0), y0, cz + sz * aa - 0.25, cx + sx * aa + 0.25, y0 + hh - 0.5, cz + sz * aa + 0.25));
    col.rect([cx - aa, cz - aa, cx + aa, cz + aa], y0, y0 + hh);
    eave(roofA, y0 + hh - 0.1, rise);
  };
  const y2 = f + H + 1.1, a2 = a * 0.72;
  upper(a2, y2, 3.8, a2 + 2.4, 2.2);
  const y3 = y2 + 3.8 + 1.0, a3 = a * 0.46;
  upper(a3, y3, 3.2, a3 + 2.2, 2.8);
  bird(bag, cx, y3 + 3.1 + 2.8 - 0.1, cz);
  // inside: a screen of black lacquer at the west door's north side, mats and low tables in two rows, lamps, a censer
  const y = f + 0.02;
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x = cx - 3.6 + k * 3.6, z = cz + s * 4.6;
    bag.add('reed_mat', box(x - 1.0, y, z - 0.75, x + 1.0, y + 0.03, z + 0.75));
    bag.add('lacquer_black', box(x - 0.55, y + 0.03, z - 0.3 - s * 0.0 - 0.3, x + 0.55, y + 0.36, z - 0.3 + 0.3));
    bag.add('lacquer_red', box(x - 0.45, y + 0.36, z - 0.55, x + 0.45, y + 0.39, z - 0.05));
    if (rand() < 0.6) bag.add('bronze', lathe([[0.001, 0], [0.07, 0.01], [0.1, 0.09], [0.001, 0.09]], 8, null, x + 0.1, y + 0.39, z - 0.3));
  }
  bag.add('lacquer_black', box(cx - 0.1, f + 0.05, cz - 3.2, cx + 0.1, f + 2.6, cz + 3.2));
  bag.add('paint_caihua', box(cx + 0.1, f + 0.4, cz - 3.0, cx + 0.14, f + 2.4, cz + 3.0));
  col.rect([cx - 0.12, cz - 3.2, cx + 0.12, cz + 3.2], f, f + 2.6);
  for (const [dx, dz] of [[-5, -5], [5, 5], [-5, 5], [5, -5]]) {
    bag.add('bronze', lathe([[0.2, 0], [0.18, 0.05], [0.05, 0.12], [0.04, 1.1], [0.1, 1.15], [0.24, 1.25], [0.2, 1.3]], 10, null, cx + dx * a / 8 * 1.2, y, cz + dz * a / 8 * 1.2));
  }
  lights.push({ at: [cx, f + H - 1.2, cz], color: '#ffd7a0', intensity: 6, distance: 16 });
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
