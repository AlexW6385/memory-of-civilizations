// The cave interiors of Ajanta (docs/settlements/ajanta.md §3–§5): the painted vihara (Cave 1), the chaitya hall
// (Cave 19), a monk's cell hall. Each returns the holes it needs cut from the cliff (cliff.js cuts them) and builds
// the lining, floor, pillars, paintings and statues inside them. Coordinates are world: the face at x = xf looking
// east, the cave running west (−x); y the floor.
import { box, lathe, fromTriangles, rod } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { Panel, PAL, wall, figM, bodhiM, lotusBand, jatakaM, ceilingM, buddhaM, rngOf } from './paint.js';

const FLOORM = 'sandstone_floor', PLASTER = 'plaster_ochre', STONE = 'sandstone_carved', WHITE = 'lime_plaster';
const hole = (x0, x1, z0, z1, y0, y1) => ({ x0, x1, z0, z1, y0, y1 });

export function lamp(ctx, x, y, z, h = 1.0, intensity = 2.2, distance = 9) {
  const { bag, lights } = ctx;
  bag.add('bronze', lathe([[0.18, 0], [0.18, 0.03], [0.1, 0.08], [0.04, 0.14], [0.03, h - 0.1], [0.12, h - 0.03], [0.13, h], [0.001, h]], 10, null, x, y, z));
  bag.add('flame', lathe([[0.01, 0], [0.016, 0.025], [0.001, 0.06]], 6, null, x, y + h + 0.01, z));
  lights?.push({ at: [x, y + h + 0.1, z], color: '#ffb46b', intensity, distance });
  ctx.col.circle(x, z, 0.19, y, y + h);
}

/** A monk's things: a folded robe and his alms bowl on the bed (bed top at yb, centre bx, bz), a water pot and a palm-leaf manuscript on a cloth by it. */
function monkKit(ctx, bx, yb, bz, px, pz, y, k = 0) {
  const { bag } = ctx;
  bag.add(k % 2 ? 'cloth_maroon' : 'cloth_ochre', box(bx - 0.25, yb, bz - 0.2, bx + 0.25, yb + 0.07, bz + 0.2));
  bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0.0], [0.13, 0.07], [0.12, 0.1], [0.001, 0.07]], 8, null, bx + 0.45, yb, bz));
  bag.add('terracotta', lathe([[0.001, 0], [0.1, 0.02], [0.18, 0.2], [0.13, 0.4], [0.08, 0.46], [0.1, 0.5], [0.001, 0.5]], 10, null, px, y, pz));
  bag.add('cloth_white', box(px + 0.3, y, pz - 0.2, px + 0.8, y + 0.015, pz + 0.3));
  bag.add('timber', box(px + 0.38, y + 0.015, pz - 0.12, px + 0.7, y + 0.06, pz + 0.18));
}
const slab = (ctx, mat, x0, y0, z0, x1, y1, z1) => ctx.bag.add(mat, box(x0, y0, z0, x1, y1, z1));
function floorOf(ctx, x0, z0, x1, z1, y, mat = FLOORM) { slab(ctx, mat, Math.min(x0, x1), y - 0.12, Math.min(z0, z1), Math.max(x0, x1), y, Math.max(z0, z1)); ctx.col.floor([x0, z0, x1, z1], y); }
/** A thin plaster lining on the plane x = at (axis 'x') or z = at ('z'), on the side n (±1), spanning [a0, a1] × [y0, y1] minus holes ([a0, y0, a1, y1] rects). */
function plane(ctx, axis, at, n, a0, a1, y0, y1, holes = [], mat = PLASTER) {
  const t = 0.04 * n;
  for (const [p0, q0, p1, q1] of subtractRects([a0, y0, a1, y1], holes)) {
    if (axis === 'x') slab(ctx, mat, Math.min(at, at + t), q0, p0, Math.max(at, at + t), q1, p1);
    else slab(ctx, mat, p0, q0, Math.min(at, at + t), p1, q1, Math.max(at, at + t));
  }
}
/** An octagonal pillar of the vihara: a square base, a shaft with a painted band, a cushion capital and a bracket block. */
function pillar(ctx, x, y, z, h, r = 0.34, base = 0.5) {
  const { bag, col } = ctx;
  bag.add(STONE, box(x - base, y, z - base, x + base, y + 0.9, z + base));
  bag.add(PLASTER, lathe([[r, 0], [r * 0.98, h - 1.5], [r * 0.9, h - 1.2], [r * 0.9, h - 0.5]], 8, null, x, y + 0.9, z));
  bag.add(PAL.ground, lathe([[r * 1.02, 0], [r * 1.02, 0.18]], 8, null, x, y + 1.6, z));
  bag.add(STONE, lathe([[r * 0.9, 0], [r * 1.5, 0.12], [r * 1.65, 0.3], [r * 1.5, 0.4], [r * 0.9, 0.46]], 12, null, x, y + h - 0.46, z));
  bag.add(STONE, box(x - base, y + h - 0.02, z - base, x + base, y + h + 0.0, z + base));
  col.circle(x, z, base * 0.95, y, y + h);
}
/** The beams of a flat painted ceiling over [x0, x1] × [z0, z1] at y: a grid of carved beams, each bay a painted panel. */
function ceiling(ctx, x0, x1, z0, z1, y, nx, nz, seed) {
  const { bag } = ctx, a = (x1 - x0) / nx, b = (z1 - z0) / nz;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const P = new Panel(bag, [x0 + i * a, y - 0.02, z0 + j * b], [1, 0, 0], [0, 0, 1], [0, -1, 0]);
    ceilingM(P, a, b, seed + i * 7 + j * 13, 1);
    P.flush();
  }
  for (let i = 0; i <= nx; i++) slab(ctx, STONE, x0 + i * a - 0.13, y - 0.3, z0, x0 + i * a + 0.13, y - 0.02, z1);
  for (let j = 0; j <= nz; j++) slab(ctx, STONE, x0, y - 0.24, z0 + j * b - 0.12, x1, y - 0.02, z0 + j * b + 0.12);
}
/** A seated Buddha on a throne facing +x: the rock-cut image, plastered and painted, s the total height. */
export function seatedBuddha(ctx, x, y, z, s) {
  const { bag, col } = ctx, k = s / 3.2;
  bag.add(STONE, box(x - 0.9 * k, y, z - 1.2 * k, x + 0.9 * k, y + 0.7 * k, z + 1.2 * k));
  bag.add(PAL.ground, box(x + 0.9 * k, y + 0.05 * k, z - 1.05 * k, x + 0.96 * k, y + 0.65 * k, z + 1.05 * k));
  for (const sg of [-1, 1]) { bag.add(WHITE, lathe([[0.001, 0], [0.2 * k, 0.04], [0.26 * k, 0.28 * k], [0.14 * k, 0.5 * k], [0.001, 0.52 * k]], 8, null, x + 0.95 * k, y + 0.7 * k, z + sg * 1.45 * k)); }
  bag.add(PAL.ochre, lathe([[0.95 * k, 0], [1.05 * k, 0.1 * k], [0.95 * k, 0.35 * k], [0.4 * k, 0.5 * k], [0.001, 0.5 * k]], 12, null, x, y + 0.7 * k, z));
  bag.add(PAL.ochre, lathe([[0.001, 0], [0.62 * k, 0.05 * k], [0.55 * k, 0.9 * k], [0.4 * k, 1.5 * k], [0.34 * k, 1.8 * k], [0.001, 1.8 * k]], 12, null, x, y + 1.15 * k, z));
  bag.add(PAL.skin, lathe([[0.001, 0], [0.2 * k, 0.04 * k], [0.26 * k, 0.26 * k], [0.18 * k, 0.5 * k], [0.001, 0.52 * k]], 10, null, x, y + 2.7 * k, z));
  bag.add(PAL.black, lathe([[0.001, 0], [0.22 * k, 0.0], [0.2 * k, 0.16 * k], [0.001, 0.2 * k]], 10, null, x, y + 3.15 * k, z));
  bag.add(PAL.skin, box(x + 0.34 * k, y + 1.7 * k, z - 0.3 * k, x + 0.6 * k, y + 2.0 * k, z + 0.3 * k));
  col.rect([x - 0.9 * k, z - 1.2 * k, x + 1.0 * k, z + 1.2 * k], y, y + 0.7 * k);
  col.circle(x, z, 0.7 * k, y + 0.7 * k, y + 3.2 * k);
}
/** A standing figure (a Buddha of the stupa's front, a yaksha): robe, head, a halo ring; facing +x. */
export function standingFigure(ctx, x, y, z, h, robe = PAL.ochre, belly = 0) {
  const { bag } = ctx, k = h / 2.2;
  bag.add(robe, lathe([[0.001, 0], [0.3 * k, 0.02 * k], [0.28 * k + belly * k, 0.9 * k], [0.34 * k + belly * k, 1.3 * k], [0.26 * k, 1.7 * k], [0.12 * k, 1.8 * k], [0.001, 1.8 * k]], 10, null, x, y, z));
  bag.add(PAL.skin, lathe([[0.001, 0], [0.12 * k, 0.04 * k], [0.15 * k, 0.2 * k], [0.1 * k, 0.38 * k], [0.001, 0.4 * k]], 10, null, x, y + 1.78 * k, z));
  bag.add(PAL.black, lathe([[0.001, 0], [0.14 * k, 0], [0.11 * k, 0.12 * k], [0.001, 0.16 * k]], 8, null, x, y + 2.05 * k, z));
}

// ── Cave 1: the painted vihara ──────────────────────────────────────────────────────────────────────────────────────
const V = { porchD: 3.8, porchHW: 12, wallT: 1.0, HW: 9.75, hallD: 19.5, H: 5.2 };
/** The cells' x (the side walls): five along the 19.5 m wall. */
const cellXs = (xw1) => Array.from({ length: 5 }, (_, i) => xw1 - 1.95 - i * 3.65);
export function viharaGeo(xf, zc, y) {
  const xp0 = xf - V.porchD, xw1 = xp0 - V.wallT, xh0 = xw1 - V.hallD, H = V.H, HW = V.HW;
  const H_ = [hole(xp0, xf, zc - V.porchHW, zc + V.porchHW, y - 0.12, y + 5.6), hole(xh0, xw1, zc - HW, zc + HW, y - 0.12, y + H)];
  const doors = [[zc, 1.3, 3.6], [zc - 5.4, 0.8, 3.0], [zc + 5.4, 0.8, 3.0]];
  for (const [z, hw, h] of doors) H_.push(hole(xw1, xp0, z - hw, z + hw, y - 0.12, y + h));
  for (const s of [-8.0, 8.0]) H_.push(hole(xw1, xp0, zc + s - 0.7, zc + s + 0.7, y + 1.1, y + 2.7));
  // sanctum: a doorway through the rear wall's rock, then the chamber
  H_.push(hole(xh0 - 1.2, xh0, zc - 1.5, zc + 1.5, y - 0.12, y + 3.5), hole(xh0 - 7.0, xh0 - 1.2, zc - 2.5, zc + 2.5, y - 0.12, y + 4.3));
  const cells = [];
  for (const x of cellXs(xw1)) for (const s of [-1, 1]) cells.push({ x, z: zc + s * HW, nz: s });
  for (const z of [-7.8, -5.0, 5.0, 7.8]) cells.push({ x: xh0, z: zc + z, nx: -1 });
  for (const c of cells) {
    if (c.nz) { H_.push(hole(c.x - 0.6, c.x + 0.6, c.nz > 0 ? c.z : c.z - 0.8, c.nz > 0 ? c.z + 0.8 : c.z, y - 0.12, y + 2.3), hole(c.x - 1.1, c.x + 1.1, c.nz > 0 ? c.z + 0.8 : c.z - 3.6, c.nz > 0 ? c.z + 3.6 : c.z - 0.8, y - 0.12, y + 2.6)); }
    else H_.push(hole(c.x - 0.8, c.x, c.z - 0.6, c.z + 0.6, y - 0.12, y + 2.3), hole(c.x - 3.6, c.x - 0.8, c.z - 1.1, c.z + 1.1, y - 0.12, y + 2.6));
  }
  return { holes: H_, cells, xp0, xw1, xh0 };
}
export function vihara(ctx, xf, zc, y) {
  const { bag, col } = ctx, { cells, xp0, xw1, xh0 } = viharaGeo(xf, zc, y), H = V.H, HW = V.HW;
  const xc = (xw1 + xh0) / 2;
  // floors
  floorOf(ctx, xp0, zc - V.porchHW, xf, zc + V.porchHW, y);
  floorOf(ctx, xh0, zc - HW, xw1, zc + HW, y);
  floorOf(ctx, xw1 - 0.2, zc - 1.3, xp0 + 0.2, zc + 1.3, y); floorOf(ctx, xw1 - 0.2, zc - 6.2, xp0 + 0.2, zc - 4.6, y); floorOf(ctx, xw1 - 0.2, zc + 4.6, xp0 + 0.2, zc + 6.2, y);
  floorOf(ctx, xh0 - 7.0, zc - 2.5, xh0 - 1.2, zc + 2.5, y); floorOf(ctx, xh0 - 1.2, zc - 1.5, xh0 + 0.1, zc + 1.5, y);
  for (const c of cells) {
    if (c.nz) { floorOf(ctx, c.x - 1.1, c.nz > 0 ? c.z : c.z - 3.6, c.x + 1.1, c.nz > 0 ? c.z + 3.6 : c.z, y); }
    else floorOf(ctx, c.x - 3.6, c.z - 1.1, c.x, c.z + 1.1, y);
  }
  // plaster linings: the hall's walls (cells' and doors' mouths left open)
  const cm = cells.filter((c) => c.nz && c.nz < 0).map((c) => [c.x - 0.6, y, c.x + 0.6, y + 2.3]);
  const cp = cells.filter((c) => c.nz && c.nz > 0).map((c) => [c.x - 0.6, y, c.x + 0.6, y + 2.3]);
  plane(ctx, 'z', zc - HW, 1, xh0, xw1, y, y + H, cm);
  plane(ctx, 'z', zc + HW, -1, xh0, xw1, y, y + H, cp);
  plane(ctx, 'x', xh0, 1, zc - HW, zc + HW, y, y + H, [[zc - 1.5, y, zc + 1.5, y + 3.5], ...cells.filter((c) => c.nx).map((c) => [c.z - 0.6, y, c.z + 0.6, y + 2.3])]);
  const fh = [[zc - 1.3, y, zc + 1.3, y + 3.6], [zc - 6.2, y, zc - 4.6, y + 3.0], [zc + 4.6, y, zc + 6.2, y + 3.0], [zc - 8.7, y + 1.1, zc - 7.3, y + 2.7], [zc + 7.3, y + 1.1, zc + 8.7, y + 2.7]];
  plane(ctx, 'x', xw1, -1, zc - HW, zc + HW, y, y + H, fh);
  plane(ctx, 'x', xp0, 1, zc - V.porchHW, zc + V.porchHW, y, 5.6 + y, [[zc - 1.3, y, zc + 1.3, y + 3.6], [zc - 6.2, y, zc - 4.6, y + 3.0], [zc + 4.6, y, zc + 6.2, y + 3.0], [zc - 8.7, y + 1.1, zc - 7.3, y + 2.7], [zc + 7.3, y + 1.1, zc + 8.7, y + 2.7]]);
  // ceiling of the hall and the porch
  ceiling(ctx, xh0, xw1, zc - HW, zc + HW, y + H, 5, 5, 11);
  plane(ctx, 'z', zc - V.porchHW, 1, xp0, xf, y, y + 5.6); plane(ctx, 'z', zc + V.porchHW, -1, xp0, xf, y, y + 5.6);
  slab(ctx, PLASTER, xp0, y + 5.56, zc - V.porchHW, xf, y + 5.6, zc + V.porchHW);
  // the ring of 20 pillars, 12 m square, spacing 2.4 m
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if (i === 0 || i === 5 || j === 0 || j === 5) pillar(ctx, xc - 6 + 2.4 * i, y, zc - 6 + 2.4 * j, H - 0.3);
  // the architrave over the ring
  for (const s of [-6, 6]) { slab(ctx, STONE, xc - 6.5, y + H - 0.32, zc + s - 0.3, xc + 6.5, y + H - 0.02, zc + s + 0.3); slab(ctx, STONE, xc + s - 0.3, y + H - 0.32, zc - 6.5, xc + s + 0.3, y + H - 0.02, zc + 6.5); }
  // the porch's six pillars and its lintel
  for (let i = 0; i < 6; i++) pillar(ctx, xf - 0.7, y, zc - 10 + 4 * i, 4.9, 0.4, 0.62);
  slab(ctx, STONE, xf - 1.1, y + 4.9, zc - 11.6, xf - 0.1, y + 5.6, zc + 11.6);
  const r = rngOf(5);
  for (let i = 0; i < 22; i++) slab(ctx, i % 2 ? PLASTER : PAL.ground, xf - 0.1, y + 5.0, zc - 11.4 + i * 1.04, xf + 0.03, y + 5.5, zc - 10.6 + i * 1.04);
  // murals
  const mur = (x, z, n, len, fn) => { const P = wall(bag, x, z, n, y, len); fn(P, len); P.flush(); };
  const HL = V.hallD;
  mur(xh0, zc - HW, [0, 1], HL, (P, L) => { lotusBand(P, 0, L, H - 0.45, H - 0.06, 1, 0); jatakaM(P, 0.1, 2.5, L - 0.1, H - 0.55, 21, 1); P.rect(PAL.black, 0, 0, L, 0.12, 1); for (const c of cells.filter((c) => c.nz < 0)) { const u = c.x - xh0; P.rect(PAL.black, u - 0.75, 0, u - 0.6, 2.35, 2); P.rect(PAL.black, u + 0.6, 0, u + 0.75, 2.35, 2); P.rect(PAL.ochre, u - 0.75, 2.3, u + 0.75, 2.45, 2); } });
  mur(xw1, zc + HW, [0, -1], HL, (P, L) => { lotusBand(P, 0, L, H - 0.45, H - 0.06, 1, 1); jatakaM(P, 0.1, 2.5, L - 0.1, H - 0.55, 33, 1); for (const c of cells.filter((c) => c.nz > 0)) { const u = xw1 - c.x; P.rect(PAL.black, u - 0.75, 0, u - 0.6, 2.35, 2); P.rect(PAL.black, u + 0.6, 0, u + 0.75, 2.35, 2); P.rect(PAL.ochre, u - 0.75, 2.3, u + 0.75, 2.45, 2); } });
  mur(xh0, zc + HW, [1, 0], 2 * HW, (P, L) => {
    lotusBand(P, 0, L, H - 0.45, H - 0.06, 1, 0);
    jatakaM(P, 0.1, 3.7, L - 0.1, H - 0.55, 45, 1);
    bodhiM(P, L / 2 - 2.75, 0.2, 2.55, { dir: 1, halo: PAL.green2, dhoti: PAL.blue, crown: PAL.ochre }, 3);          // Padmapani, with the lotus
    bodhiM(P, L / 2 + 2.75, 0.2, 2.55, { dir: -1, halo: PAL.blue, dhoti: PAL.green }, 3);                              // Vajrapani
    for (const s of [-1, 1]) { P.rect(PAL.black, L / 2 + s * 1.5 - 0.1, 0, L / 2 + s * 1.5 + 0.1, 3.6, 2); }
    P.rect(PAL.ochre, L / 2 - 1.7, 3.5, L / 2 + 1.7, 3.65, 2);
    for (const c of cells.filter((c) => c.nx)) { const u = HW - (c.z - zc); P.rect(PAL.black, u - 0.75, 0, u - 0.6, 2.35, 2); P.rect(PAL.black, u + 0.6, 0, u + 0.75, 2.35, 2); P.rect(PAL.ochre, u - 0.75, 2.3, u + 0.75, 2.45, 2); }
  });
  mur(xw1, zc - HW, [-1, 0], 2 * HW, (P, L) => { lotusBand(P, 0, L, H - 0.45, H - 0.06, 1, 1); jatakaM(P, 3.2, 3.9, 5.0, H - 0.55, 8, 1); jatakaM(P, L - 5.0, 3.9, L - 3.2, H - 0.55, 9, 1); for (const u of [1.3, 2.7, 4.4, L - 4.4, L - 2.7, L - 1.3]) { figM(P, u, 0.2, 2.2, { dir: u < L / 2 ? 1 : -1, dhoti: PAL.green, halo: PAL.ochre, sway: 0.08 }, 2); } });
  // the porch's back wall: attendants and a frieze
  mur(xp0, zc + V.porchHW, [1, 0], 2 * V.porchHW, (P, L) => {
    lotusBand(P, 0, L, 5.0, 5.5, 1, 0);
    for (const u of [2.0, 3.6, 5.2, 18.8, 20.4, 22.0]) figM(P, u, 0.15, 2.4, { dir: u < 12 ? 1 : -1, dhoti: u % 2 ? PAL.green : PAL.blue, sway: 0.09 }, 2);
    for (const u of [9.0, 15.0]) buddhaM(P, u, 1.6, 2.4, {}, 2);
  });
  // the shrine: the chamber's plaster, the throne and Buddha, the rear wall painted
  const sx1 = xh0 - 1.2, sx0 = xh0 - 7.0;
  plane(ctx, 'z', zc - 2.5, 1, sx0, sx1, y, y + 4.3); plane(ctx, 'z', zc + 2.5, -1, sx0, sx1, y, y + 4.3);
  plane(ctx, 'x', sx0, 1, zc - 2.5, zc + 2.5, y, y + 4.3); slab(ctx, PLASTER, sx0, y + 4.26, zc - 2.5, sx1, y + 4.3, zc + 2.5);
  seatedBuddha(ctx, sx0 + 1.2, y, zc, 3.4);
  const P = wall(bag, sx0, zc + 2.5, [1, 0], y, 5.0); P.ell(PAL.green2, 2.5, 2.4, 1.2, 1.6, 1, 14); P.disc(PAL.ochre, 2.5, 2.8, 0.7, 2, 14); for (const s of [-1, 1]) { figM(P, 2.5 + s * 1.7, 0.2, 2.0, { dir: -s, halo: PAL.ochre, dhoti: s > 0 ? PAL.blue : PAL.green }, 2); } P.flush();
  lamp(ctx, sx1 - 0.7, y, zc - 1.9, 0.9, 1.4, 8); lamp(ctx, sx1 - 0.7, y, zc + 1.9, 0.9, 1.4, 8);
  // the cells: lining, a stone bed with a raised pillow, a lamp niche
  for (const c of cells) {
    if (c.nz) {
      const z0 = c.nz > 0 ? c.z : c.z - 3.6, z1 = c.nz > 0 ? c.z + 3.6 : c.z;
      plane(ctx, 'x', c.x - 1.1, 1, z0, z1, y, y + 2.6); plane(ctx, 'x', c.x + 1.1, -1, z0, z1, y, y + 2.6);
      plane(ctx, 'z', c.nz > 0 ? c.z + 3.6 : c.z - 3.6, c.nz > 0 ? -1 : 1, c.x - 1.1, c.x + 1.1, y, y + 2.6);
      slab(ctx, PLASTER, c.x - 1.1, y + 2.56, z0, c.x + 1.1, y + 2.6, z1);
      const zb = c.nz > 0 ? c.z + 3.6 : c.z - 3.6;
      slab(ctx, STONE, c.x - 1.0, y, Math.min(zb, zb - c.nz * 2.1), c.x - 0.2, y + 0.45, Math.max(zb, zb - c.nz * 2.1)); col.rect([c.x - 1.0, Math.min(zb, zb - c.nz * 2.1), c.x - 0.2, Math.max(zb, zb - c.nz * 2.1)], y, y + 0.45);
      slab(ctx, STONE, c.x - 1.0, y + 0.45, Math.min(zb, zb - c.nz * 0.5), c.x - 0.2, y + 0.62, Math.max(zb, zb - c.nz * 0.5));
      // the carved doorframe at the hall wall: two jambs and a lintel with a roundel
      monkKit(ctx, c.x - 0.6, y + 0.62, zb - c.nz * 1.3, c.x + 0.1, zb - c.nz * 0.5, y, c.x * 7);
      const zf = c.z; for (const sx of [-1, 1]) slab(ctx, STONE, c.x + sx * 0.62 - 0.08, y, zf - 0.12 + (c.nz > 0 ? 0 : -0.1), c.x + sx * 0.62 + 0.08, y + 2.3, zf + 0.12 + (c.nz > 0 ? 0.0 : -0.1));
    } else {
      plane(ctx, 'z', c.z - 1.1, 1, c.x - 3.6, c.x, y, y + 2.6); plane(ctx, 'z', c.z + 1.1, -1, c.x - 3.6, c.x, y, y + 2.6); plane(ctx, 'x', c.x - 3.6, 1, c.z - 1.1, c.z + 1.1, y, y + 2.6);
      slab(ctx, PLASTER, c.x - 3.6, y + 2.56, c.z - 1.1, c.x, y + 2.6, c.z + 1.1);
      slab(ctx, STONE, c.x - 3.6, y, c.z - 1.0, c.x - 1.5, y + 0.45, c.z - 0.2); col.rect([c.x - 3.6, c.z - 1.0, c.x - 1.5, c.z - 0.2], y, y + 0.45);
      slab(ctx, STONE, c.x - 3.6, y + 0.45, c.z - 1.0, c.x - 3.1, y + 0.62, c.z - 0.2);
      monkKit(ctx, c.x - 2.6, y + 0.45, c.z - 0.6, c.x - 1.4, c.z + 0.6, y, c.z);
    }
  }
  lamp(ctx, xc - 3.0, y, zc - 8.6, 1.1, 1.8, 11); lamp(ctx, xc + 3.0, y, zc + 8.6, 1.1, 1.8, 11); lamp(ctx, xh0 + 1.0, y, zc - 3.3, 1.1, 1.8, 11); lamp(ctx, xh0 + 1.0, y, zc + 3.3, 1.1, 1.8, 11);
  void r;
}

// ── Cave 19: the chaitya hall ───────────────────────────────────────────────────────────────────────────────────────
const CH = { len: 16.05, hw: 3.55, wallT: 1.2, fhw: 4.7, top: 7.6 };
export function chaityaGeo(xf, zc, y) {
  const xn1 = xf - CH.wallT, xn0 = xn1 - CH.len;
  return { holes: [hole(xf - CH.wallT, xf, zc - CH.fhw, zc + CH.fhw, y - 0.12, y + CH.top), hole(xn0, xn1, zc - CH.hw, zc + CH.hw, y - 0.12, y + 7.4)], xn1, xn0 };
}
/** Fill y0..y1 for |dz| ≤ hw in strips of width dw with top(dz) and bottom(dz): the facade's arch. */
export function chaitya(ctx, xf, zc, y) {
  const { bag, col } = ctx, { xn1, xn0 } = chaityaGeo(xf, zc, y), hw = CH.hw;
  const xs = xn0 + 4.2;                                        // the stupa's centre
  floorOf(ctx, xn0, zc - hw, xn1 + 0.1, zc + hw, y);
  floorOf(ctx, xn1, zc - 1.4, xf + 0.1, zc + 1.4, y);
  // the facade wall in vertical strips: the door and the horseshoe window cut through
  const dw = 0.2, yc = y + 5.2, rr = 2.1, yb = y + 3.9;
  for (let z = -CH.fhw; z < CH.fhw - 1e-6; z += dw) {
    const m = Math.abs(z + dw / 2);
    const door = m < 1.4;
    const win = m < rr ? yc + Math.sqrt(rr * rr - m * m) : -1;
    const yTop = y + CH.top;
    if (win > 0) {
      if (door) slab(ctx, STONE, xn1, y + 3.2, zc + z, xf, yb, zc + z + dw);
      else slab(ctx, STONE, xn1, y - 0.1, zc + z, xf, yb, zc + z + dw);
      slab(ctx, STONE, xn1, win, zc + z, xf, yTop, zc + z + dw);
    } else slab(ctx, STONE, xn1, y - 0.1, zc + z, xf, yTop, zc + z + dw);
    // the horseshoe frame: a raised band round the arch
    if (m < rr + 0.55 && m >= rr - 0.0 || (m < rr && win > 0)) { const top = m < rr ? win + 0.55 : yc + 0.55 * 0.5; if (m < rr) slab(ctx, 'sandstone_relief', xf - 0.02, win, zc + z, xf + 0.22, top, zc + z + dw); else slab(ctx, 'sandstone_relief', xf - 0.02, yb, zc + z, xf + 0.22, top, zc + z + dw); }
  }
  // the door's jambs and lintel, carved
  for (const s of [-1, 1]) slab(ctx, 'sandstone_relief', xf - 0.02, y, zc + s * 1.4 - 0.15, xf + 0.2, y + 3.3, zc + s * 1.4 + 0.15);
  slab(ctx, 'sandstone_relief', xf - 0.02, y + 3.2, zc - 1.6, xf + 0.2, y + 3.5, zc + 1.6);
  // the porch: two fluted round pillars and a rock-cut roof slab, over the ledge
  for (const s of [-1, 1]) {
    const px = xf + 2.0, pz = zc + s * 2.7;
    bag.add(STONE, box(px - 0.5, y, pz - 0.5, px + 0.5, y + 0.8, pz + 0.5));
    bag.add(PLASTER, lathe([[0.36, 0], [0.34, 3.0], [0.4, 3.3]], 14, (t) => 1 + 0.04 * Math.cos(t * 12), px, y + 0.8, pz));
    bag.add(STONE, lathe([[0.4, 0], [0.62, 0.18], [0.7, 0.4]], 14, null, px, y + 3.9, pz));
    col.circle(px, pz, 0.5, y, y + 4.3);
  }
  slab(ctx, STONE, xf, y + 4.3, zc - 3.6, xf + 2.8, y + 4.8, zc + 3.6);
  for (let i = 0; i < 9; i++) slab(ctx, i % 2 ? PLASTER : PAL.ground, xf + 2.78, y + 4.35, zc - 3.4 + i * 0.85, xf + 2.84, y + 4.75, zc - 2.7 + i * 0.85);
  col.rect([xf, zc - 3.6, xf + 2.8, zc + 3.6], y + 4.3, y + 4.8);
  // yakshas flanking the arch, on brackets, and a frieze of small seated Buddhas over the porch roof's edge
  for (const s of [-1, 1]) { slab(ctx, STONE, xf, y + 4.9, zc + s * 3.9 - 0.45, xf + 0.7, y + 5.1, zc + s * 3.9 + 0.45); standingFigure(ctx, xf + 0.4, y + 5.1, zc + s * 3.9, 2.4, PAL.skin2, 0.15); }
  for (let i = 0; i < 9; i++) { const z = zc - 4.0 + i; bag.add(WHITE, lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.2], [0.12, 0.34], [0.001, 0.36]], 8, null, xf + 0.05, y + 7.0, z)); }
  // the interior: aisle ceilings, the vault with its ribs, the colonnade
  const ax = (xn1 + xn0) / 2;
  plane(ctx, 'z', zc - hw, 1, xn0, xn1, y, y + 4.3); plane(ctx, 'z', zc + hw, -1, xn0, xn1, y, y + 4.3);
  for (const s of [-1, 1]) slab(ctx, PLASTER, xn0, y + 4.28, zc + s * 2.55 - (s > 0 ? 0 : 1.05), xn1, y + 4.32, zc + s * 2.55 + (s > 0 ? 1.05 : 0));
  // the barrel vault over the nave: half-width 2.6, springing at y+4.3, the crown at y+7.2
  const prof = []; for (let i = 0; i <= 14; i++) { const a = Math.PI * i / 14; prof.push([-Math.cos(a) * 2.6, 4.3 + Math.sin(a) * 2.9]); }
  const ref = [ax, y + 3, zc], tri = [], rib = [];
  const orient = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2]; const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const mx = (t[i] + t[i + 3] + t[i + 6]) / 3 - ref[0], my = (t[i + 1] + t[i + 4] + t[i + 7]) / 3 - ref[1], mz = (t[i + 2] + t[i + 5] + t[i + 8]) / 3 - ref[2]; if (nx * mx + ny * my + nz * mz > 0) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); else o.push(...t.slice(i, i + 9)); } return o; };
  for (let k = 0; k < prof.length - 1; k++) { const [za, ya] = prof[k], [zb, yb2] = prof[k + 1]; tri.push(xn1, y + ya, zc + za, xn0, y + ya, zc + za, xn0, y + yb2, zc + zb, xn1, y + ya, zc + za, xn0, y + yb2, zc + zb, xn1, y + yb2, zc + zb); }
  bag.add(WHITE, fromTriangles(orient(tri)));
  // the ribs of the vault, 14 of them, copying the timber ribs of the older halls
  for (let i = 0; i < 14; i++) {
    const x = xn1 - 0.6 - i * ((CH.len - 1.2) / 13), t2 = [];
    for (let k = 0; k < prof.length - 1; k++) { const [za, ya] = prof[k], [zb, yb2] = prof[k + 1], d = 0.2, i0 = 0.1; const r0 = (zz, yy) => [zz * (1 - i0 / 3), yy - i0]; const A = r0(za, ya), B = r0(zb, yb2); t2.push(x + d / 2, y + A[1], zc + A[0], x - d / 2, y + A[1], zc + A[0], x - d / 2, y + B[1], zc + B[0], x + d / 2, y + A[1], zc + A[0], x - d / 2, y + B[1], zc + B[0], x + d / 2, y + B[1], zc + B[0]); }
    rib.push(...t2);
  }
  bag.add(PAL.ground, fromTriangles(orient(rib)));
  slab(ctx, PAL.ground, xn0, y + 7.1, zc - 0.12, xn1, y + 7.16, zc + 0.12);
  // 15 octagonal pillars: six on each side and three round the apse
  const pil = [];
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) pil.push([xn1 - 1.8 - i * 1.7, zc + s * 2.55]);
  for (const a of [-1.0, 0, 1.0]) pil.push([xs - Math.cos(a) * 2.55 - 0.6, zc + Math.sin(a) * 2.55]);
  for (const [px, pz] of pil) pillar(ctx, px, y, pz, 4.3, 0.26, 0.4);
  // the stupa: plinth, panelled drum, dome, harmika and three umbrellas; the standing Buddha in front
  bag.add(STONE, lathe([[1.7, 0], [1.7, 0.45], [1.5, 0.55], [0.001, 0.55]], 16, null, xs, y, zc));
  bag.add(PLASTER, lathe([[1.45, 0], [1.45, 1.9], [1.62, 2.0], [1.62, 2.2], [1.4, 2.3], [0.001, 2.3]], 16, null, xs, y + 0.55, zc));
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + 0.26; bag.add(PAL.ground, box(-0.34, 0.5, -0.04, 0.34, 1.5, 0.04).rotateY(-a).translate(xs + Math.cos(a) * 1.46, y + 0.55, zc + Math.sin(a) * 1.46)); }
  bag.add(WHITE, lathe(Array.from({ length: 9 }, (_, i) => { const t = i / 8 * Math.PI / 2; return [Math.cos(t) * 1.28, Math.sin(t) * 1.28]; }), 18, null, xs, y + 2.85, zc));
  bag.add(STONE, box(xs - 0.5, y + 4.1, zc - 0.5, xs + 0.5, y + 4.7, zc + 0.5)); bag.add(PAL.ochre, box(xs - 0.56, y + 4.65, zc - 0.56, xs + 0.56, y + 4.75, zc + 0.56));
  bag.add(PAL.ochre, rod([xs, y + 4.7, zc], [xs, y + 6.9, zc], 0.07, 6));
  for (const [r, yy] of [[0.95, 5.2], [0.75, 5.9], [0.55, 6.5]]) bag.add(STONE, lathe([[0.001, 0], [r, 0.0], [r * 0.9, 0.12], [0.001, 0.15]], 12, null, xs, y + yy, zc));
  col.circle(xs, zc, 1.75, y, y + 5.0);
  standingFigure(ctx, xs + 1.75, y + 0.55, zc, 2.0, PAL.ochre);
  bag.add(PAL.ground, box(xs + 1.55, y + 0.5, zc - 0.45, xs + 1.66, y + 2.9, zc + 0.45));
  // the walls' paintings: Buddhas in rows and attendants along the aisles
  const mur = (x, z, n, len, fn) => { const P = wall(bag, x, z, n, y, len); fn(P, len); P.flush(); };
  mur(xn0, zc - hw, [0, 1], CH.len, (P, L) => { P.rect(PAL.ground, 0.1, 0.1, L - 0.1, 3.7, 1); for (let i = 0; i < 7; i++) buddhaM(P, 1.0 + i * (L - 2) / 6.0, 0.25, 1.5, { robe: i % 2 ? PAL.blue : PAL.ochre }, 2); lotusBand(P, 0, L, 3.35, 3.78, 1, 0); });
  mur(xn1, zc + hw, [0, -1], CH.len, (P, L) => { P.rect(PAL.ground, 0.1, 0.1, L - 0.1, 3.7, 1); for (let i = 0; i < 7; i++) buddhaM(P, 1.0 + i * (L - 2) / 6.0, 0.25, 1.5, { robe: i % 2 ? PAL.green : PAL.ochre }, 2); lotusBand(P, 0, L, 3.35, 3.78, 1, 1); });
  lamp(ctx, xn1 - 1.2, y, zc - 3.0, 1.0, 1.6, 10); lamp(ctx, xs + 0.8, y, zc + 3.0, 1.0, 1.8, 10);
}

// ── a monk's cell hall ─────────────────────────────────────────────────────────────────────────────────────────────
export function cellGeo(xf, zc, y) {
  return { holes: [hole(xf - 1.2, xf, zc - 1.3, zc + 1.3, y - 0.12, y + 2.9), hole(xf - 7.0, xf - 1.2, zc - 2.9, zc + 2.9, y - 0.12, y + 3.0)] };
}
export function cellHall(ctx, xf, zc, y) {
  const { bag, col } = ctx, x1 = xf - 1.2, x0 = xf - 7.0;
  floorOf(ctx, x0, zc - 2.9, x1, zc + 2.9, y); floorOf(ctx, x1, zc - 1.3, xf + 0.1, zc + 1.3, y);
  plane(ctx, 'z', zc - 2.9, 1, x0, x1, y, y + 3.0); plane(ctx, 'z', zc + 2.9, -1, x0, x1, y, y + 3.0); plane(ctx, 'x', x0, 1, zc - 2.9, zc + 2.9, y, y + 3.0);
  plane(ctx, 'x', x1, -1, zc - 2.9, zc + 2.9, y, y + 3.0, [[zc - 1.3, y, zc + 1.3, y + 2.9]]);
  slab(ctx, PLASTER, x0, y + 2.96, zc - 2.9, x1, y + 3.0, zc + 2.9);
  // the two stone beds with their raised pillows, along the side walls
  for (const s of [-1, 1]) {
    const zb = zc + s * 2.9, z0 = Math.min(zb, zb - s * 1.0), z1 = Math.max(zb, zb - s * 1.0);
    slab(ctx, STONE, x0 + 0.3, y, z0, x0 + 2.4, y + 0.45, z1); slab(ctx, STONE, x0 + 0.3, y + 0.45, z0, x0 + 0.8, y + 0.62, z1);
    col.rect([x0 + 0.3, z0, x0 + 2.4, z1], y, y + 0.45);
    slab(ctx, STONE, x0 + 3.2, y, z0, x0 + 5.3, y + 0.45, z1); slab(ctx, STONE, x0 + 3.2, y + 0.45, z0, x0 + 3.7, y + 0.62, z1);
    col.rect([x0 + 3.2, z0, x0 + 5.3, z1], y, y + 0.45);
    monkKit(ctx, x0 + 1.5, y + 0.45, (z0 + z1) / 2, x0 + 2.7, zb - s * 1.4, y, s); monkKit(ctx, x0 + 4.3, y + 0.45, (z0 + z1) / 2, x0 + 4.2, zb - s * 1.5, y, s + 1);
  }
  const P = wall(bag, x0, zc + 2.9, [1, 0], y, 5.8);
  lotusBand(P, 0, 5.8, 2.5, 2.9, 1, 0); buddhaM(P, 2.9, 0.4, 2.0, {}, 2); P.flush();
  // a lamp niche in the back wall
  slab(ctx, 'lacquer_black', x0 + 0.01, y + 1.5, zc - 0.3, x0 + 0.3, y + 1.9, zc + 0.3);
  lamp(ctx, x0 + 0.5, y, zc, 0.8, 1.3, 7);
  // door frame
  for (const s of [-1, 1]) slab(ctx, STONE, xf - 0.02, y, zc + s * 1.3 - 0.15, xf + 0.15, y + 2.9, zc + s * 1.3 + 0.15);
  slab(ctx, STONE, xf - 0.02, y + 2.8, zc - 1.5, xf + 0.15, y + 3.1, zc + 1.5);
}
export { hole };
