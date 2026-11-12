// The Han timber hall and its terrace (docs/settlements/han-changan.md §4): the stepped rammed-earth terrace of the Weiyang
// Front Hall with its central ramp-stair, and the hall on it — nine bays of round red columns on stone plinths, the walls of
// plaster with lattice windows, the central bays open, a coffered ceiling, a hipped roof of grey tile whose eaves end in round
// tiles, the throne dais with its lacquered screen, the court's mats and low tables, bronze lamps and censers.
import { box, lathe, clothBox, addCloth } from '../../core/geom.js';
import { rng, steps, eaveTiles, eaveTilesGable, roofs, hipLite } from './kit.js';

/** han_terrace: { tiers: [{ r, top }], ramp: { x: [x0, x1], z0, z1 } (rising toward −z) } */
export function terrace(el, ctx) {
  const { bag, col } = ctx;
  el.tiers.forEach((t, i) => {
    const [x0, z0, x1, z1] = t.r, prev = i ? el.tiers[i - 1].top : 0;
    bag.add('earth_wall', box(x0, -0.4, z0, x1, t.top, z1));
    col.rect(t.r, -0.4, t.top);
    // the top: paved with square bricks, a stone coping at the edge
    bag.add('brick_paving', box(x0 + 0.01, t.top - 0.02, z0 + 0.01, x1 - 0.01, t.top + 0.01, z1 - 0.01));
    col.floor(t.r, t.top);
    bag.add('bluestone', box(x0 - 0.15, t.top - 0.3, z0 - 0.15, x1 + 0.15, t.top, z0 + 0.5));
    bag.add('bluestone', box(x0 - 0.15, t.top - 0.3, z1 - 0.5, x1 + 0.15, t.top, z1 + 0.15));
    bag.add('bluestone', box(x0 - 0.15, t.top - 0.3, z0, x0 + 0.5, t.top, z1));
    bag.add('bluestone', box(x1 - 0.5, t.top - 0.3, z0, x1 + 0.15, t.top, z1));
    // the red band at the foot of each tier's face (the vermilion steps)
    const gaps = i === el.tiers.length - 1 || !el.ramp ? [] : [];
    void gaps;
    for (const [a, b] of el.ramp ? [[x0 - 0.06, el.ramp.x[0] - 0.1], [el.ramp.x[1] + 0.1, x1 + 0.06]] : [[x0 - 0.06, x1 + 0.06]]) if (b > a) bag.add('palace_wall', box(a, prev + 0.01, z1 + 0.01, b, prev + 0.35, z1 + 0.07));
  });
  const crown = el.tiers[el.tiers.length - 1], [cx0, cz0, cx1, cz1] = crown.r;
  const rp = el.ramp, rect = [rp.x[0], rp.z0, rp.x[1], rp.z1];
  steps(bag, col, rect, 0, crown.top, 'n', 'palace_wall', 0.18, -0.4, 'brick_paving');
  // the ramp's balustrade: low rails and posts of red lacquer along both sides
  for (const x of rp.x) for (let z = rp.z1; z > rp.z0; z -= 3) {
    const h = crown.top * (rp.z1 - z) / (rp.z1 - rp.z0);
    bag.add('lacquer_red', box(x - 0.1, -0.4, z - 0.1, x + 0.1, h + 1.0, z + 0.1));
  }
  // the railing round the crown (posts and two rails), open at the ramp
  const T = crown.top, post = (x, z) => bag.add('lacquer_red', box(x - 0.08, T, z - 0.08, x + 0.08, T + 1.0, z + 0.08));
  const rail = (a, b) => {
    const [ax, az] = a, [bx, bz] = b;
    bag.add('lacquer_red', box(Math.min(ax, bx) - 0.05, T + 0.85, Math.min(az, bz) - 0.05, Math.max(ax, bx) + 0.05, T + 0.95, Math.max(az, bz) + 0.05));
    bag.add('lacquer_red', box(Math.min(ax, bx) - 0.04, T + 0.45, Math.min(az, bz) - 0.04, Math.max(ax, bx) + 0.04, T + 0.52, Math.max(az, bz) + 0.04));
    col.rect([Math.min(ax, bx) - 0.06, Math.min(az, bz) - 0.06, Math.max(ax, bx) + 0.06, Math.max(az, bz) + 0.06], T, T + 1.0);
  };
  const sx = [cx0 + 0.3, cx1 - 0.3], sz = [cz0 + 0.3, cz1 - 0.3];
  for (let x = sx[0]; x < sx[1] - 0.1; x += 3) { post(x, sz[0]); rail([x, sz[0]], [Math.min(x + 3, sx[1]), sz[0]]); if (x + 3 < rp.x[0] - 0.5 || x > rp.x[1] + 0.5) { post(x, sz[1]); rail([x, sz[1]], [Math.min(x + 3, sx[1]), sz[1]]); } }
  for (let z = sz[0]; z < sz[1] - 0.1; z += 3) { post(sx[0], z); rail([sx[0], z], [sx[0], Math.min(z + 3, sz[1])]); post(sx[1], z); rail([sx[1], z], [sx[1], Math.min(z + 3, sz[1])]); }
}

const lamp = (bag, x, y, z) => {
  bag.add('bronze', lathe([[0.2, 0], [0.18, 0.05], [0.05, 0.12], [0.04, 1.1], [0.1, 1.15], [0.24, 1.25], [0.2, 1.3]], 10, null, x, y, z));
  bag.add('gilt_bronze', lathe([[0.001, 1.3], [0.12, 1.3], [0.12, 1.34], [0.001, 1.34]], 8, null, x, y, z));
};
/** A rack of bronze bells (bianzhong) above a row of stone chimes (bianqing) on a lacquered frame, 4.4 m long. */
function bellRack(bag, col, x, y, z) {
  for (const sx of [-1, 1]) { bag.add('lacquer_black', box(x + sx * 2.2 - 0.14, y, z - 0.5, x + sx * 2.2 + 0.14, y + 2.4, z - 0.3)); bag.add('lacquer_black', box(x + sx * 2.2 - 0.14, y, z + 0.3, x + sx * 2.2 + 0.14, y + 2.4, z + 0.5)); bag.add('bronze', lathe([[0.001, 2.4], [0.2, 2.4], [0.001, 2.62]], 6, null, x + sx * 2.2, y, z)); }
  bag.add('lacquer_red', box(x - 2.3, y + 2.0, z - 0.1, x + 2.3, y + 2.2, z + 0.1)); bag.add('lacquer_red', box(x - 2.3, y + 1.0, z - 0.1, x + 2.3, y + 1.16, z + 0.1));
  for (let k = 0; k < 9; k++) { const bx = x - 1.9 + k * 0.475, h = 0.55 - k * 0.03; bag.add('bronze', lathe([[0.11 + (8 - k) * 0.008, 0], [0.1, 0.1 * h * 2], [0.08, h], [0.06, h + 0.04]], 7, null, bx, y + 2.0 - h - 0.1, z)); }
  for (let k = 0; k < 9; k++) { const bx = x - 1.9 + k * 0.475, h = 0.5 - k * 0.03; bag.add('granite_grey', box(bx - 0.16, y + 1.0 - h, z - 0.04, bx + 0.16, y + 1.0 - 0.02, z + 0.04)); }
  col.rect([x - 2.4, z - 0.55, x + 2.4, z + 0.55], y, y + 2.4);
}
/** The great drum on its post and base in the hall. */
function drumRack(bag, col, x, y, z) {
  bag.add('lacquer_red', box(x - 0.6, y, z - 0.6, x + 0.6, y + 0.22, z + 0.6)); bag.add('timber_red', lathe([[0.09, 0.2], [0.07, 2.3]], 6, null, x, y, z));
  const g = lathe([[0.001, -0.5], [0.46, -0.45], [0.58, -0.18], [0.58, 0.18], [0.46, 0.45], [0.001, 0.5]], 11); g.rotateZ(Math.PI / 2); g.translate(x, y + 1.3, z); bag.add('lacquer_red', g);
  bag.add('tile_dark', lathe([[0.001, 2.65], [0.8, 2.3], [0.8, 2.25], [0.001, 2.4]], 8, null, x, y, z));
  col.circle(x, z, 0.7, y, y + 2.4);
}
const censer = (bag, x, y, z) => {
  bag.add('bronze', lathe([[0.001, 0], [0.16, 0], [0.16, 0.05], [0.05, 0.1], [0.05, 0.28], [0.17, 0.34], [0.17, 0.5], [0.12, 0.56], [0.1, 0.62], [0.001, 0.66]], 10, null, x, y, z));
  bag.add('bronze', lathe([[0.17, 0.5], [0.2, 0.5], [0.2, 0.44], [0.17, 0.44]], 10, null, x, y, z));
};

/**
 * han_hall: { cx, z1 (the front column line), bays, bayW, depth, depthW, floor (y), h (columns), roof ('hip' | 'gable'), rise, open: [i0, i1] (the open bays of the front),
 *   furnish ('throne' | 'court' | 'lecture' | 'office' | none), rafters, base }. The hall faces south.
 */
export function hall(el, ctx) {
  const { bag, col, lights } = ctx, rand = rng(el.seed ?? 7);
  const W = el.bays * el.bayW, D = el.depth * el.depthW, x0 = el.cx - W / 2, x1 = el.cx + W / 2, z1 = el.z1, z0 = z1 - D, f = el.floor, H = el.h ?? 7;
  const base = el.base ?? 0.9, gy = f - base, ap = el.ap ?? 2.2;
  const open = el.open ?? [Math.floor(el.bays / 2) - 1, Math.floor(el.bays / 2) + 1];
  // the base: a stone-faced platform, the apron paved, the floor of dark polished boards inside
  bag.add('bluestone', box(x0 - ap, gy - 0.4, z0 - ap, x1 + ap, f - 0.02, z1 + ap));
  bag.add('brick_paving', box(x0 - ap, f - 0.03, z0 - ap, x1 + ap, f, z1 + ap));
  col.floor([x0 - ap, z0 - ap, x1 + ap, z1 + ap], f);
  bag.add('lacquer_chestnut', box(x0, f - 0.025, z0, x1, f + 0.02, z1));
  // the steps up from the crown: the middle flight and one at each end of the front
  const flights = [el.cx]; if (el.bays >= 7) flights.push(el.cx - el.bayW * 3.3, el.cx + el.bayW * 3.3);
  for (const cx of flights) steps(bag, col, [cx - 2.4, z1 + ap, cx + 2.4, z1 + ap + 3.0], gy, f, 'n', 'bluestone', 0.18, gy - 0.4);
  // the columns on stone plinths, with their cap blocks and bracket arms; the architraves along every line
  const colAt = (x, z) => {
    bag.add('bluestone', lathe([[0.62, 0], [0.62, 0.1], [0.5, 0.2], [0.45, 0.32]], 10, null, x, f, z));
    bag.add('timber_red', lathe([[0.36, 0.32], [0.34, H * 0.5], [0.31, H - 0.35], [0.3, H]], 10, null, x, f, z));
    bag.add('timber_red', box(x - 0.45, f + H, z - 0.45, x + 0.45, f + H + 0.32, z + 0.45));
    col.circle(x, z, 0.4, f, f + H);
  };
  const X = (i) => x0 + i * el.bayW, Z = (j) => z0 + j * el.depthW;
  const inner = (i, j) => j > 0 && j < el.depth && i > 0 && i < el.bays && (j === 1 || j === el.depth - 1) && Math.abs(i - el.bays / 2) >= Math.max(2, el.bays / 4);
  const front = (i) => i >= open[0] && i <= open[1] + 1;     // front column lines
  const cols = [];
  for (let i = 0; i <= el.bays; i++) for (let j = 0; j <= el.depth; j++) {
    const edge = j === 0 || j === el.depth || i === 0 || i === el.bays;
    if (edge || inner(i, j)) cols.push([X(i), Z(j)]);
  }
  for (const [x, z] of cols) colAt(x, z);
  // bracket arms: a straight arm along each perimeter line over each column, and the architrave
  const beam = (xa, za, xb, zb, y, h, th, mat = 'timber_red') => bag.add(mat, box(Math.min(xa, xb) - th, y, Math.min(za, zb) - th, Math.max(xa, xb) + th, y + h, Math.max(za, zb) + th));
  for (const z of [Z(0), Z(el.depth)]) {
    beam(x0, z, x1, z, f + H - 0.55, 0.55, 0.22);
    beam(x0, z, x1, z, f + H + 0.32, 0.28, 0.16, 'timber');
    for (let i = 0; i <= el.bays; i++) beam(X(i) - 1.3, z, X(i) + 1.3, z, f + H + 0.32, 0.3, 0.13);
    bag.add('paint_blue', box(x0, f + H - 0.5, z + (z === Z(0) ? -0.231 : 0.221), x1, f + H - 0.35, z + (z === Z(0) ? -0.221 : 0.231)));
  }
  for (const x of [X(0), X(el.bays)]) { beam(x, z0, x, z1, f + H - 0.55, 0.55, 0.22); beam(x, z0, x, z1, f + H + 0.32, 0.28, 0.16, 'timber'); }
  // the walls: plaster with lattice windows; the front's open bays between the columns
  const wall = (xa, za, xb, zb, win, door) => {
    const ax = Math.abs(xb - xa) > Math.abs(zb - za), t = 0.22;
    const R = (u0, u1, y0, y1, solid = true) => {
      const r = ax ? [Math.min(xa, xb) + u0, za - t, Math.min(xa, xb) + u1, za + t] : [xa - t, Math.min(za, zb) + u0, xa + t, Math.min(za, zb) + u1];
      return { r, y0, y1, solid };
    };
    const L = ax ? Math.abs(xb - xa) : Math.abs(zb - za);
    const put = (u0, u1, y0, y1, m) => { const p = R(u0, u1, y0, y1); bag.add(m, box(p.r[0], p.y0, p.r[1], p.r[2], p.y1, p.r[3])); };
    if (door) return;
    put(0, L, f, f + 1.0, 'lime_plaster');
    const wt = Math.min(4.2, H - 1.1) + f - f;
    if (f + wt < f + H - 0.55) put(0, L, f + wt, f + H - 0.55, 'lime_plaster');
    if (win) put(0.45, L - 0.45, f + 1.0, f + wt, 'lattice');
    else put(0, L, f + 1.0, f + wt, 'lime_plaster');
    const p = R(0, L, f, f + H - 0.55); col.rect(p.r, f, f + H - 0.55);
  };
  for (let i = 0; i < el.bays; i++) {
    wall(X(i), Z(0), X(i + 1), Z(0), i % 2 === 1 && Math.abs(i - (el.bays - 1) / 2) > 1.1, false);
    wall(X(i), Z(el.depth), X(i + 1), Z(el.depth), true, i >= open[0] && i <= open[1]);
  }
  for (let j = 0; j < el.depth; j++) { wall(X(0), Z(j), X(0), Z(j + 1), j % 2 === 0, false); wall(X(el.bays), Z(j), X(el.bays), Z(j + 1), j % 2 === 0, false); }
  // the ceiling: coffers between crossbeams
  bag.add('ceiling_coffer', box(x0, f + H - 0.1, z0, x1, f + H - 0.02, z1));
  for (let i = 0; i <= el.bays; i++) bag.add('timber_red', box(X(i) - 0.2, f + H - 0.5, z0, X(i) + 0.2, f + H - 0.1, z1));
  for (let j = 1; j < el.depth; j++) bag.add('timber_red', box(x0, f + H - 0.42, Z(j) - 0.16, x1, f + H - 0.1, Z(j) + 0.16));
  // the roof
  const ov = el.overhang ?? 3.4, rise = el.rise ?? 6.4, ey = f + H - 0.5, cz = (z0 + z1) / 2;
  if ((el.roof ?? 'hip') === 'hip') {
    (el.rafters ? roofs().hip_roof : hipLite)({ c: [el.cx, cz], A: W / 2 + ov, B: D / 2 + ov, y: ey, rise, lift: 0.5, pow: 1.25, mat: 'tile_grey', soffit: 'timber_red', noChiwei: true, rafters: el.rafters ? { out: ov, sp: 0.6 } : undefined, alongZ: false }, ctx);
    eaveTiles(bag, el.cx, cz, W / 2 + ov, D / 2 + ov, ey, 0.5);
    // the ridge ends: simple upturned ornaments, the ridge's centre carrying a bronze bird
    for (const s of [-1, 1]) bag.add('tile_dark', box(el.cx + s * (W / 2 - D / 2 + 0.1) - 0.3, ey + rise + 0.7, cz - 0.25, el.cx + s * (W / 2 - D / 2 + 0.1) + 0.3, ey + rise + 1.9, cz + 0.25));
    bag.add('gilt_bronze', box(el.cx - 0.2, ey + rise + 0.7, cz - 0.15, el.cx + 0.2, ey + rise + 1.7, cz + 0.15));
  } else {
    roofs().gable_roof_c({ c: [el.cx, cz], A: W / 2 + 1.2, B: D / 2 + ov * 0.7, y: ey, rise: rise * 0.85, mat: 'tile_grey', soffit: 'timber_red', noHorns: true, alongZ: false }, ctx);
    eaveTilesGable(bag, el.cx, cz, W / 2 + 1.2, D / 2 + ov * 0.7, ey);
  }
  // inside
  const mid = el.cx, dz = z0;
  const fl = el.furnish;
  if (fl === 'throne') {
    const tiers = [[7, 7.0, 0.4], [5.9, 5.6, 0.8], [4.7, 4.1, 1.2]];
    for (const [hw, d, h] of tiers) { bag.add('lacquer_red', box(mid - hw, f, dz + 0.5, mid + hw, f + h, dz + 0.5 + d)); col.floor([mid - hw, dz + 0.5, mid + hw, dz + 0.5 + d], f + h); }
    for (const [hw, d, h] of tiers) bag.add('bronze', box(mid - hw, f + h - 0.04, dz + 0.5 + d - 0.05, mid + hw, f + h + 0.01, dz + 0.5 + d));
    // the throne: a low couch with a cushion, the lacquered screen behind it, the fans of the attendants
    bag.add('lacquer_black', box(mid - 1.4, f + 1.2, dz + 1.7, mid + 1.4, f + 1.52, dz + 3.4));
    bag.add('cloth_red', box(mid - 1.25, f + 1.52, dz + 1.85, mid + 1.25, f + 1.64, dz + 3.25));
    bag.add('lacquer_black', box(mid - 3.2, f + 1.2, dz + 1.0, mid + 3.2, f + 3.9, dz + 1.12));
    bag.add('paint_caihua', box(mid - 3.0, f + 1.45, dz + 1.12, mid + 3.0, f + 3.7, dz + 1.15));
    col.rect([mid - 1.4, dz + 1.7, mid + 1.4, dz + 3.4], f + 1.2, f + 1.7);
    // the curtains hung from the beams at each side of the dais
    for (const s of [-1, 1]) addCloth(bag, 'cloth_red', clothBox(mid + s * 7.4 - 0.6, f + 1.6, dz + 0.9, mid + s * 7.4 + 0.6, f + H - 0.5, dz + 1.0, 0.3), f + H - 0.5);
    for (const [x, z] of [[-4.4, 1.0], [4.4, 1.0], [-6.3, 5.4], [6.3, 5.4]]) lamp(bag, mid + x, f + 1.2 * (Math.abs(x) > 5 ? 0.4 : 1) * 0 + (Math.abs(x) > 5 ? 0.4 : 1.2), dz + z);
    for (const s of [-1, 1]) censer(bag, mid + s * 2.8, f + 1.2, dz + 4.3);
    // the court's orchestra either side of the aisle before the throne: a frame of bronze bells over a row of stone chimes, the great drum on its post
    for (const s of [-1, 1]) { bellRack(bag, col, mid + s * 11.5, f, dz + 20.2); drumRack(bag, col, mid + s * 7.2, f, dz + 20.6); }
    lights.push({ at: [mid, f + H - 1.2, dz + 6], color: '#ffc98a', intensity: 8, distance: 22 }, { at: [mid - 13, f + H - 1.2, dz + 14], color: '#ffc98a', intensity: 6, distance: 18 }, { at: [mid + 13, f + H - 1.2, dz + 14], color: '#ffc98a', intensity: 6, distance: 18 });
  }
  if (fl === 'throne' || fl === 'court') {
    // the ministers' mats and low tables in two blocks either side of the aisle, the attendants' places along the walls
    const aisle = el.bayW * 1.6, y = f + 0.02, rows = fl === 'throne' ? [dz + 9.5, dz + 13.5, dz + 17] : [dz + 7, dz + 11];
    for (const s of [-1, 1]) for (const z of rows) for (let k = 0; k < 5; k++) {
      const x = mid + s * (aisle + 1.2 + k * 3.4);
      if (cols.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 1.9)) continue;
      if (Math.abs(x - mid) > W / 2 - 3) continue;
      bag.add('reed_mat', box(x - 1.05, y, z - 0.75, x + 1.05, y + 0.03, z + 0.75));
      bag.add('lacquer_black', box(x - 0.55, y + 0.03, z - 0.7 - 0.0, x + 0.55, y + 0.34, z - 0.22));
      bag.add('lacquer_red', box(x - 0.45, y + 0.34, z - 0.62, x + 0.45, y + 0.37, z - 0.3));
      if (rand() < 0.5) bag.add('bronze', lathe([[0.001, 0], [0.07, 0.01], [0.1, 0.09], [0.001, 0.09]], 8, null, x + 0.1, y + 0.37, z - 0.45));
    }
    for (const x of [-1, 1]) censer(bag, mid + x * 4.6, f + 0.02, z1 - 2.5);
    lamp(bag, mid - 6.5, f + 0.02, z1 - 3); lamp(bag, mid + 6.5, f + 0.02, z1 - 3);
  }
  if (fl === 'lecture') {
    // the master's mat and desk before the rows of pupils' mats; bamboo-slip books on the shelf along the back wall
    bag.add('reed_mat', box(mid - 1.4, f + 0.02, dz + 1.5, mid + 1.4, f + 0.05, dz + 3.2));
    bag.add('lacquer_black', box(mid - 0.9, f + 0.05, dz + 3.4, mid + 0.9, f + 0.42, dz + 4.0));
    for (let r = 0; r < 3; r++) for (let k = -3; k <= 3; k++) {
      const x = mid + k * 2.2, z = dz + 6.2 + r * 2.1;
      if (cols.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 1.6)) continue;
      bag.add('reed_mat', box(x - 0.6, f + 0.02, z - 0.5, x + 0.6, f + 0.05, z + 0.5));
      bag.add('wood_ochre', box(x - 0.3, f + 0.05, z - 0.45, x + 0.3, f + 0.1, z - 0.15));
    }
    for (let k = 0; k < 9; k++) bag.add(k % 2 ? 'wood_ochre' : 'bamboo_culm', box(el.cx - 4.5 + k * 1.0, f + 0.9, dz + 0.3, el.cx - 3.6 + k * 1.0, f + 1.5, dz + 0.7));
    bag.add('timber', box(el.cx - 5, f + 0.8, dz + 0.25, el.cx + 5, f + 0.9, dz + 0.75));
    lamp(bag, mid - 5, f + 0.02, dz + 4); lamp(bag, mid + 5, f + 0.02, dz + 4);
  }
  if (fl === 'office') {
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const x = mid + s * (3 + k * 3.2), z = dz + 4;
      bag.add('reed_mat', box(x - 0.9, f + 0.02, z - 0.6, x + 0.9, f + 0.05, z + 0.6));
      bag.add('lacquer_black', box(x - 0.5, f + 0.05, z - 0.55, x + 0.5, f + 0.4, z - 0.15));
    }
    bag.add('timber', box(el.cx - 4, f + 0.8, dz + 0.25, el.cx + 4, f + 0.9, dz + 0.75));
    for (let k = 0; k < 7; k++) bag.add('bamboo_culm', box(el.cx - 3.4 + k * 1.0, f + 0.9, dz + 0.3, el.cx - 2.7 + k * 1.0, f + 1.45, dz + 0.7));
  }
  if (fl && fl !== 'none' && fl !== 'throne') lights.push({ at: [mid, f + H - 1.0, (z0 + z1) / 2], color: '#ffd7a0', intensity: 5, distance: 14 });
}
