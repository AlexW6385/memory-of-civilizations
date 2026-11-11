// The Bou Inania madrasa (docs/settlements/fez.md §4): built 1350–55 for Abu Inan, 34.65 × 38.95 m, on the south side of the
// Talaa Kebira. A horseshoe portal under a cedar canopy, a vestibule with a carved cedar ceiling, the marble court with its
// basin, galleries of zellij-clad piers and cedar screens, the two classrooms, the prayer hall to the south behind a channel
// with two small bridges, the students' cells above under a carved cedar canopy, the minaret at the north-west corner.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { face, holedWall, archHead, dbl, dado, stucco, canopy, screen, door, basin, gable, rng, q4, zellij } from './kit.js';
import { minaret } from './minaret.js';
import * as F from '../mughal/furnish.js';

const OUT = 'stucco_ochre';
export function bouInania(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, yl = el.yLane ?? y - 0.4, rand = rng(el.seed ?? 5);
  const t = 1.0, G = 2.4, R = 5.4, H1 = 4.4, H2 = 3.5, HT = H1 + H2, cx = (x0 + x1) / 2;
  const cw0 = x0 + t + R + G, cw1 = x1 - t - R - G;           // the court's x range
  const zN = z0 + 8.0, cz0 = zN + G, cz1 = z1 - 9.6 - 0.7;     // north range's south face, court from cz0 to cz1 (channel after)
  const zH = cz1 + 0.7;                                         // the prayer hall's north wall (outer face)
  const gx0 = x0 + t + R, gx1 = x1 - t - R;                     // inner faces of the side ranges
  // ——— floors
  bag.add('marble_floor', box(cw0, y - 0.4, cz0, cw1, y, cz1)); col.floor([cw0, cz0, cw1, cz1], y);
  bag.add('tile_cream', box(gx0, y - 0.4, zN, gx1, y, cz0)); bag.add('tile_cream', box(gx0, y - 0.4, cz0, cw0, y, cz1)); bag.add('tile_cream', box(cw1, y - 0.4, cz0, gx1, y, cz1));
  col.floor([gx0, zN, gx1, cz1], y);
  // the court paved in a pattern: dark marble squares set diagonally in the white
  for (let x = cw0 + 1.45; x < cw1 - 1; x += 2.9) for (let z = cz0 + 1.45; z < cz1 - 1; z += 2.9) bag.add('marble_dark', box(x - 0.22, y, z - 0.22, x + 0.22, y + 0.012, z + 0.22));
  // the basin at the court's heart (ablutions) and the channel along the south edge with its two small bridges
  basin(bag, col, (cw0 + cw1) / 2, (cz0 + cz1) / 2, y, 1.15);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.39; bag.add('marble_smooth', box((cw0 + cw1) / 2 + Math.cos(a) * 1.5 - 0.15, y, (cz0 + cz1) / 2 + Math.sin(a) * 1.5 - 0.15, (cw0 + cw1) / 2 + Math.cos(a) * 1.5 + 0.15, y + 0.06, (cz0 + cz1) / 2 + Math.sin(a) * 1.5 + 0.15)); }
  const ch = [gx0, cz1, gx1, zH]; bag.add('marble_smooth', box(ch[0], y - 0.5, ch[1], ch[2], y - 0.4, ch[3])); bag.add('water', box(ch[0], y - 0.4, ch[1] + 0.12, ch[2], y - 0.1, ch[3] - 0.12));
  for (const [a, b] of [[ch[0], ch[2]]]) { bag.add('marble_smooth', box(a, y - 0.4, ch[1], b, y, ch[1] + 0.12)); bag.add('marble_smooth', box(a, y - 0.4, ch[3] - 0.12, b, y, ch[3])); }
  for (const bx of [gx0 + 1.2, gx1 - 2.4]) { bag.add('marble_smooth', box(bx, y - 0.05, cz1, bx + 1.2, y + 0.02, zH)); col.floor([bx, cz1, bx + 1.2, zH], y + 0.02); }
  // ——— the outer walls: brick plastered; the portal in the north wall
  const px = [cx - 1.7, cx + 1.7], ph = 4.3;
  const fiN = face('z', z0, 1), foN = face('z', z0, -1);
  holedWall(bag, col, OUT, [x0, z0, x1, z0 + t], y - 0.5, y + HT + 0.5, [[px[0], px[1], y, y + ph]], true);
  // lower storey: a plinth of dressed stone; the portal: horseshoe arch in an alfiz, jambs, leaves folded back, a canopy of cedar with green tiles
  bag.add('limestone', box(x0 - 0.05, y - 0.5, z0 - 0.08, px[0] - 0.4, y + 0.7, z0)); bag.add('limestone', box(px[1] + 0.4, y - 0.5, z0 - 0.08, x1 + 0.05, y + 0.7, z0));
  archHead(bag, fiN, px[0], px[1], y + 2.8, y + ph, t, 'horseshoe', { alfiz: true, alfizUp: 0.5 });
  stucco(bag, foN, px[0] - 1.3, px[1] + 1.3, y + ph + 0.4, y + ph + 2.6, [], { cell: 0.36 });
  zellij(bag, foN, px[0] - 1.3, px[0] - 0.12, y + 0.7, y + 3.8, () => true, { cell: 0.38 }); zellij(bag, foN, px[1] + 0.12, px[1] + 1.3, y + 0.7, y + 3.8, () => true, { cell: 0.38 });
  canopy(bag, foN, px[0] - 1.9, px[1] + 1.9, y + ph + 3.0, 1.15);
  for (const s of [-1, 1]) { const a = s < 0 ? px[0] + 0.02 : px[1] - 0.1; bag.add('bronze', box(a, y + 0.05, z0 + 0.1, a + 0.08, y + ph - 1.0, z0 + 0.9)); for (let k = 0; k < 5; k++) bag.add('iron', box(a - 0.02, y + 0.6 + k * 0.6, z0 + 0.2, a + 0.1, y + 0.66 + k * 0.6, z0 + 0.8)); }
  // the steps up from the street
  { const n = Math.max(2, Math.round((y - yl) / 0.15)); for (let i = 0; i < n; i++) bag.add('limestone', box(px[0] - 0.5, yl - 0.3, z0 - 0.3 - (n - 1 - i) * 0.3, px[1] + 0.5, yl + (y - yl) * (i + 1) / n, z0)); col.ramp([px[0] - 0.5, z0 - 0.3 - (n - 1) * 0.3, px[1] + 0.5, z0], yl, y, 's'); }
  // the north wall's other openings: small grilled windows high up, the street front blank below
  { const wins = []; for (let x = x0 + 4; x < x1 - 3; x += 4.2) if (Math.abs(x - cx) > 3) wins.push(x); for (const x of wins) { const r = foN.R(0, 0.05, x - 0.35, x + 0.35); bag.add('opening', box(r[0], y + HT - 2.2, r[1], r[2], y + HT - 0.9, r[3])); const g = foN.R(0.05, 0.1, x - 0.4, x + 0.4); bag.add('lattice', box(g[0], y + HT - 2.25, g[1], g[2], y + HT - 0.85, g[3])); } }
  // the east, west and south walls: plain
  for (const r of [[x0, z0 + t, x0 + t, z1], [x1 - t, z0 + t, x1, z1], [x0 + t, z1 - t, x1 - t, z1]]) { bag.add(OUT, box(r[0], y - 0.5, r[1], r[2], y + HT + 0.5, r[3])); col.rect(r, y - 0.5, y + HT + 0.5); }
  // the roof's parapet (the top of the walls reads as a terrace edge)
  for (const r of [[x0, z0, x1, z0 + 0.35], [x0, z1 - 0.35, x1, z1], [x0, z0, x0 + 0.35, z1], [x1 - 0.35, z0, x1, z1]]) bag.add('plaster_white', box(r[0], y + HT + 0.5, r[1], r[2], y + HT + 1.1, r[3]));
  // ——— the vestibule: walls either side of the passage from the portal to the court, a cedar ceiling carved in cells, a bent floor of tile
  { const vx = px, vz1 = zN; const w1 = [vx[0] - 0.4, z0 + t, vx[0], vz1], w2 = [vx[1], z0 + t, vx[1] + 0.4, vz1];
    for (const w of [w1, w2]) { bag.add('plaster_white', box(w[0], y, w[1], w[2], y + H1, w[3])); col.rect(w, y, H1 + y); }
    bag.add('tile_cream', box(vx[0], y - 0.4, z0, vx[1], y, vz1)); col.floor([vx[0], z0, vx[1], vz1], y);
    const yc = y + 3.6;
    bag.add('cedar', box(vx[0], yc, z0 + t, vx[1], yc + 0.15, vz1));
    for (let k = 0; k < 3; k++) { const e = 0.28 * (k + 1); for (let z = z0 + t + 0.3; z < vz1 - 0.3; z += 0.55) bag.add('cedar', box(vx[0] + e, yc - 0.1 * (k + 1), z, vx[1] - e, yc - 0.1 * k, z + 0.4)); }
    for (let z = z0 + t; z < vz1; z += 1.2) bag.add('wood_dark', box(vx[0], yc - 0.12, z, vx[1], yc, z + 0.1));
    // the dado and stucco of the passage
    for (const [at, n, a, b] of [[vx[0], 1, z0 + t, vz1], [vx[1], -1, z0 + t, vz1]]) { const f = face('x', at, n); dado(bag, f, a, b, y, 1.6); stucco(bag, f, a, b, y + 2.05, yc, [], { cornice: false }); }
    // the way on to the court: through the north range's south wall at the gallery
    bag.add('plaster_white', box(w1[0], y + H1, w1[1], w2[2], y + HT, w1[3]));
  }
  // ——— the north range: solid ground storey either side of the passage (stores, ablutions), its south face the gallery's wall
  { const f = face('z', zN, -1);
    const holes = [[vx0(cx), vx1(cx), y, y + 3.6]];
    holedWall(bag, col, 'plaster_white', [gx0, zN - 0.5, gx1, zN], y, y + H1, holes, true);
    dado(bag, f, gx0, gx1, y, 1.7, holes); stucco(bag, f, gx0, gx1, y + 2.15, y + H1 - 0.15, holes);
    // two doors in the stucco frames to the rooms either side
    for (const u of [cx - 7.2, cx + 7.2]) { door(bag, f, u - 0.7, u + 0.7, y, 2.6, 0.06); archHead(bag, f, u - 0.7, u + 0.7, y + 2.2, y + 2.8, 0.3, 'lobed', { alfiz: true, side: 'far' }); }
    // the north rooms behind: a mass
    bag.add('plaster_white', box(gx0, y, z0 + t, gx1, y + H1, zN - 0.5)); col.rect([gx0, z0 + t, gx1, zN - 0.5], y, y + H1);
    // (the passage from the portal) opened: the vestibule's floor is cut out of that mass above
  }
  function vx0(c) { return c - 1.7; } function vx1(c) { return c + 1.7; }
  // ——— the side ranges' inner faces: the west and east galleries' walls, the classroom arches at the court's middle
  const zm = (cz0 + cz1) / 2, cls = [zm - 2.5, zm + 2.5];
  for (const [at, n, xo] of [[gx0, 1, -1], [gx1, -1, 1]]) {
    const f = face('x', at, n), holes = [[cls[0] + 1.3, cls[1] - 1.3, y, y + 3.3]];
    holedWall(bag, col, 'plaster_white', n > 0 ? [at - 0.5, zN, at, cz1] : [at, zN, at + 0.5, cz1], y, y + H1, holes, false);
    dado(bag, f, zN, cz1, y, 1.7, holes); stucco(bag, f, zN, cz1, y + 2.15, y + H1 - 0.15, holes);
    archHead(bag, f, cls[0] + 1.3, cls[1] - 1.3, y + 2.5, y + 3.3, 0.5, 'lobed', { alfiz: true, side: 'near', mat: 'stucco_cream' });
    // the classroom (5 × 5): carved stucco walls, a wooden cupola, a mat, a lectern, a lamp
    const rx = n > 0 ? [at - R + 0.4, at - 0.5] : [at + 0.5, at + R - 0.4], rz = [cls[0], cls[1]];
    const rr = [rx[0], rz[0], rx[1], rz[1]];
    for (const [a, b] of [[rr[0] - 0.4, rr[0]], [rr[2], rr[2] + 0.4]]) bag.add('plaster_white', box(a, y, rz[0] - 0.4, b, y + H1, rz[1] + 0.4));
    for (const z of [rz[0] - 0.4, rz[1]]) { const w = [rr[0] - 0.4, z, rr[2] + 0.4, z + 0.4]; bag.add('plaster_white', box(w[0], y, w[1], w[2], y + H1, w[3])); col.rect(w, y, y + H1); }
    for (const w of [[rr[0] - 0.4, rz[0], rr[0], rz[1]], [rr[2], rz[0], rr[2] + 0.4, rz[1]]]) col.rect(w, y, y + H1);
    const bx = [Math.min(rr[0], rr[2]) - 0.4, rz[0] - 0.4, Math.max(rr[0], rr[2]) + 0.4, rz[1] + 0.4];
    // the room's floor and mats; the walls' lining on the inside faces
    bag.add('tile_cream', box(rr[0], y - 0.4, rr[1], rr[2], y, rr[3])); col.floor(rr, y);
    for (const [fz, nz] of [[rz[0], 1], [rz[1], -1]]) { const fz2 = face('z', fz, nz); dado(bag, fz2, rr[0], rr[2], y, 1.5); stucco(bag, fz2, rr[0], rr[2], y + 1.95, y + H1 - 0.5, [], { cornice: false }); }
    const fx = face('x', n > 0 ? rr[0] : rr[2], n > 0 ? 1 : -1); dado(bag, fx, rz[0], rz[1], y, 1.5); stucco(bag, fx, rz[0], rz[1], y + 1.95, y + H1 - 0.5, [], { cornice: false });
    cupola(bag, (rr[0] + rr[2]) / 2, (rz[0] + rz[1]) / 2, y + H1 - 0.5, 2.4);
    F.reedMat(bag, (rr[0] + rr[2]) / 2, y, (rz[0] + rz[1]) / 2 + 0.3, 3.2, 3.0, 0);
    F.rahle(bag, (rr[0] + rr[2]) / 2 - 0.5, y + 0.01, (rz[0] + rz[1]) / 2 - 0.6, 0);
    F.cushion(bag, (rr[0] + rr[2]) / 2 + 0.5, y + 0.02, (rz[0] + rz[1]) / 2 + 0.7, 0.7, 0.7, 0.12, 0.3, 'cloth_green');
    F.mosqueLamp(bag, lights, (rr[0] + rr[2]) / 2, y + H1 - 1.2, (rz[0] + rz[1]) / 2, y + H1 - 0.5, { k: 0.8, glow: 2, reach: 6 });
    void bx;
    // the mass of cells either side of the classroom (closed): north and south of it
    for (const [za, zb] of [[zN, rz[0] - 0.4], [rz[1] + 0.4, cz1]]) { const m = [Math.min(at - (n > 0 ? R - 0.4 : 0), at + (n > 0 ? 0 : R - 0.4)) - 0, za, Math.max(at - (n > 0 ? R - 0.4 : 0), at + (n > 0 ? 0 : R - 0.4)), zb]; if (zb - za > 0.5) { bag.add('plaster_white', box(m[0], y, m[1], m[2], y + H1, m[3])); col.rect(m, y, y + H1); } }
    void xo;
  }
  // the south part of the side ranges beyond the court (beside the hall): solid
  for (const m of [[x0 + t, cz1, x0 + t + R, z1 - t], [x1 - t - R, cz1, x1 - t, z1 - t]]) { bag.add('plaster_white', box(m[0], y, m[1], m[2], y + H1, m[3])); col.rect(m, y, y + H1); }
  // ——— the galleries' pillars at the court's edge: zellij to a man's height, stucco above, cedar lintel; cedar screens between some
  const pillar = (px0, pz0) => {
    const s = 0.5; bag.add('marble_smooth', box(px0 - s / 2 - 0.05, y, pz0 - s / 2 - 0.05, px0 + s / 2 + 0.05, y + 0.15, pz0 + s / 2 + 0.05));
    bag.add('stucco_cream', box(px0 - s / 2, y + 0.15, pz0 - s / 2, px0 + s / 2, y + 3.55, pz0 + s / 2)); col.rect([px0 - s / 2, pz0 - s / 2, px0 + s / 2, pz0 + s / 2], y, y + 3.6);
    for (const [ax, at, n, a] of [['z', pz0 - s / 2, -1, px0], ['z', pz0 + s / 2, 1, px0], ['x', px0 - s / 2, -1, pz0], ['x', px0 + s / 2, 1, pz0]]) { const f = face(ax, at, n); zellij(bag, f, a - s / 2, a + s / 2, y + 0.15, y + 1.65, () => true, { cell: 0.5, pal: [1, 2] }); const rr = f.R(0, 0.05, a - s / 2, a + s / 2); bag.add('tile_turquoise', box(rr[0], y + 1.65, rr[1], rr[2], y + 1.78, rr[3])); }
    bag.add('cedar', box(px0 - 0.4, y + 3.55, pz0 - 0.4, px0 + 0.4, y + 3.7, pz0 + 0.4));
  };
  const nx = Math.round((cw1 - cw0) / 2.9), nzz = Math.round((cz1 - cz0) / 3.25);
  const xs = Array.from({ length: nx + 1 }, (_, i) => cw0 + (cw1 - cw0) * i / nx), zs = Array.from({ length: nzz + 1 }, (_, i) => cz0 + (cz1 - cz0) * i / nzz);
  for (const x of xs) pillar(x, cz0 - 0.3);
  for (const z of zs.slice(1)) { pillar(cw0 - 0.3, z); pillar(cw1 + 0.3, z); }
  // ——— the cedar lintel beam round three sides, the stucco band over it up to the upper floor
  for (const r of [[gx0, zN, gx1, zN + 0.0], ]) void r;
  // ——— the upper floor: a platform over the galleries, its cedar balustrade, the cells' doors and lattice windows
  const yu = y + H1;
  for (const r of [[gx0, zN, gx1, cz0], [gx0, cz0, cw0, cz1], [cw1, cz0, gx1, cz1]]) { bag.add('cedar', box(r[0], yu - 0.7, r[1], r[2], yu, r[3])); col.floor(r, yu); }
  for (let z = zN + 0.4; z < cz1; z += 0.9) { for (const x of [gx0 + 0.02, gx1 - 0.02]) void x; }
  // balustrade at the court edge: spindles between posts, a handrail
  const bal = (a, b, fixed, alongX) => { const L = Math.hypot(b - a); void L; const n = Math.floor((b - a) / 0.14);
    for (let i = 0; i <= n; i++) { const u = a + (b - a) * i / n; bag.add('cedar', alongX ? box(u - 0.02, yu, fixed - 0.02, u + 0.02, yu + 1.0, fixed + 0.02) : box(fixed - 0.02, yu, u - 0.02, fixed + 0.02, yu + 1.0, u + 0.02)); }
    bag.add('cedar', alongX ? box(a, yu + 0.97, fixed - 0.05, b, yu + 1.05, fixed + 0.05) : box(fixed - 0.05, yu + 0.97, a, fixed + 0.05, yu + 1.05, b)); bag.add('cedar', alongX ? box(a, yu, fixed - 0.04, b, yu + 0.1, fixed + 0.04) : box(fixed - 0.04, yu, a, fixed + 0.04, yu + 0.1, b));
    col.segment(alongX ? [a, fixed] : [fixed, a], alongX ? [b, fixed] : [fixed, b], 0.1, yu, yu + 1.0); };
  bal(cw0, cw1, cz0 - 0.05, true); bal(cz0, cz1, cw0 - 0.05, false); bal(cz0, cz1, cw1 + 0.05, false);
  // the carved cedar between the pillars below: screens in every other bay on the north and the sides, open bays beside the middle ones
  for (let i = 0; i < nx; i++) { if (i % 2 === 0 && Math.abs((xs[i] + xs[i + 1]) / 2 - cx) > 1.5) { const f = face('z', cz0 - 0.3, -1); screen(bag, col, f, xs[i] + 0.35, xs[i + 1] - 0.35, y + 0.4, y + 3.2, 0, { gap: 0.15 }); } }
  // the upper storey's walls on the north and sides: stucco, doors to the cells, lattice windows
  for (const [at, n, a, b, alongX] of [[zN, -1, gx0, gx1, true], [gx0, 1, zN, cz1, false], [gx1, -1, zN, cz1, false]]) {
    const f = face(alongX ? 'z' : 'x', at, n), holes = [];
    for (let u = a + 1.6; u < b - 1.0; u += 3.2) holes.push([u - 0.55, u + 0.55, yu + 0.1, yu + 2.5]);
    holedWall(bag, col, 'plaster_white', alongX ? [a, at - 0.5, b, at] : n > 0 ? [at - 0.5, a, at, b] : [at, a, at + 0.5, b], yu, yu + H2, holes, alongX);
    stucco(bag, f, a, b, yu, yu + H2 - 0.05, holes, { cell: 0.4 });
    for (const h of holes) { const u = (h[0] + h[1]) / 2; door(bag, f, h[0], h[1], yu + 0.1, 2.3, 0.04); const g = f.R(0.1, 0.17, u - 0.55, u + 0.55); void g; const w = f.R(0.03, 0.08, u - 0.5, u + 0.5); bag.add('lattice', box(w[0], yu + 2.55, w[1], w[2], yu + 3.2, w[3])); }
  }
  // ——— the cedar canopy crowning the court's walls: corbels, lintel, green tiles, all round
  canopy(bag, face('z', zN, -1), gx0, gx1, yu + HT - H1 - 0.15, 1.2); canopy(bag, face('x', gx0, 1), zN, cz1, yu + HT - H1 - 0.15, 1.2); canopy(bag, face('x', gx1, -1), zN, cz1, yu + HT - H1 - 0.15, 1.2);
  // ——— the prayer hall: its north wall with a door and lattice windows, two aisles divided by a row of arches on columns, berchla ceilings
  { const f = face('z', zH, -1), fi = face('z', zH + 0.7, 1), hx0 = gx0, hx1 = gx1, hz1 = z1 - t, mid = (zH + 0.7 + hz1) / 2;
    const holes = [[cx - 1.7, cx + 1.7, y, y + 3.6], ...[-8, -5.2, 5.2, 8].map((d) => [cx + d - 0.5, cx + d + 0.5, y + 1.2, y + 3.6])];
    holedWall(bag, col, 'plaster_white', [hx0, zH, hx1, zH + 0.7], y, y + 5.8, holes, true);
    dado(bag, f, hx0, hx1, y, 1.6, holes); stucco(bag, f, hx0, hx1, y + 2.05, y + 5.8, holes, { cell: 0.4 });
    for (const h of holes.slice(1)) { const g = f.R(0.03, 0.09, h[0], h[1]); bag.add('lattice', box(g[0], h[2], g[1], g[2], h[3], g[3])); }
    archHead(bag, f, cx - 1.7, cx + 1.7, y + 2.8, y + 3.6, 0.7, 'horseshoe', { alfiz: true, both: true });
    // inside: the side walls and the south wall with the mihrab
    for (const [at, n] of [[hx0, 1], [hx1, -1]]) { const ff = face('x', at, n); dado(bag, ff, zH + 0.7, hz1, y, 1.5); stucco(bag, ff, zH + 0.7, hz1, y + 1.95, y + 5.7, [], { cell: 0.42 }); }
    const fs = face('z', hz1, -1), mh = [cx - 1.0, cx + 1.0];
    holedWall(bag, col, 'plaster_white', [hx0, hz1 - 0.01, hx1, hz1], y, y + 5.8, [], true);
    bag.add('plaster_white', box(mh[0] - 0.3, y, hz1 - 0.01, mh[1] + 0.3, y + 5.8, hz1 + 0.01));
    dado(bag, fs, hx0, hx1, y, 1.5, [[mh[0], mh[1], y, y + 3.0]]); stucco(bag, fs, hx0, hx1, y + 1.95, y + 5.7, [[mh[0] - 0.1, mh[1] + 0.1, y + 1.95, y + 3.9]], { cell: 0.42 });
    // the mihrab: a recess with a horseshoe arch, carved shell, a window of coloured glass over it
    bag.add('stucco_cream', box(mh[0], y, hz1 - 0.01, mh[1], y + 0.02, hz1 + 0.5)); bag.add('opening', box(mh[0] + 0.1, y + 0.02, hz1 - 0.05, mh[1] - 0.1, y + 2.9, hz1 + 0.0));
    archHead(bag, fs, mh[0], mh[1], y + 2.0, y + 3.0, 0.5, 'horseshoe', { alfiz: true });
    { const g = fs.R(0.02, 0.06, cx - 0.55, cx + 0.55); bag.add('stained_glass', box(g[0], y + 4.0, g[1], g[2], y + 5.2, g[3])); bag.add('lattice', box(g[0], y + 4.0, g[1] - 0.04, g[2], y + 5.2, g[1])); }
    // the floor: matting over marble, rows of prayer mats
    bag.add('marble_floor', box(hx0, y - 0.4, zH + 0.7, hx1, y, hz1)); bag.add('reed_mat', box(hx0 + 0.3, y, zH + 1.0, hx1 - 0.3, y + 0.02, hz1 - 0.3)); col.floor([hx0, zH + 0.7, hx1, hz1], y + 0.02);
    // the row of arches on columns (marble and onyx alternate), dividing the hall into two aisles
    const cols = 7, A = [hx0, mid], B = [hx1, mid], st = []; const L = hx1 - hx0;
    for (let i = 0; i < cols; i++) { const u = L * (i + 0.5) / cols; bag.add(i % 2 ? 'marble_dark' : 'marble_smooth', lathe([[0.2, 0], [0.2, 0.15], [0.14, 0.2], [0.14, 3.2], [0.2, 3.25], [0.2, 3.55], [0.001, 3.55]], 10, null, hx0 + u, y, mid)); col.circle(hx0 + u, mid, 0.2, y, y + 3.6); st.push({ u, w: 0.2 }); }
    // (the arches themselves)
    archRunLite(bag, A, B, st, y, 3.55, 5.3);
    // berchla: a ridged ceiling of painted cedar over each aisle, the roof of green tile above
    for (const [za, zb] of [[zH + 0.7, mid], [mid, hz1]]) {
      const a = [hx0, za, hx1, zb], zc = (za + zb) / 2, tr = [], rise = 1.5, ys = y + 5.3;
      q4(tr, [a[0], ys, za], [a[2], ys, za], [a[2], ys + rise, zc], [a[0], ys + rise, zc]); q4(tr, [a[2], ys, zb], [a[0], ys, zb], [a[0], ys + rise, zc], [a[2], ys + rise, zc]);
      bag.add('ceiling_painted', dbl(tr));
      for (let x = hx0 + 0.6; x < hx1; x += 1.4) bag.add('timber', box(x, ys - 0.1, za, x + 0.1, ys, zb));
      gable(bag, [a[0] - 0.3, za - 0.2, a[2] + 0.3, zb + 0.2], y + 5.9, 1.5, 0.35, 'x', { ends: false });
    }
    // the roof plates between hall and gallery: a flat cedar ceiling closes the aisles' ends at the gable (walls above 5.8 as parapet)
    // the minbar: a staircase of cedar beside the mihrab; lamps hanging on chains; a few worshippers' mats
    for (let k = 0; k < 6; k++) bag.add('cedar', box(mh[1] + 0.5, y + k * 0.22, hz1 - 0.7 - 0.3 * (5 - k) - 0.01, mh[1] + 1.5, y + (k + 1) * 0.22, hz1 - 0.02)); bag.add('cedar', box(mh[1] + 0.5, y + 1.3, hz1 - 0.8, mh[1] + 1.5, y + 2.4, hz1 - 0.02)); col.rect([mh[1] + 0.5, hz1 - 2.0, mh[1] + 1.5, hz1], y, y + 2.4);
    for (const dx of [-7, -3.5, 3.5, 7]) for (const zz of [(zH + 0.7 + mid) / 2, (mid + hz1) / 2]) F.mosqueLamp(bag, lights, cx + dx, y + 3.2, zz, y + 5.3, { k: 1, glow: 2.4, reach: 8 });
    for (let k = 0; k < 4; k++) F.prayerRug(bag, cx - 5 + k * 3.3, y + 0.02, hz1 - 3, 0, 'persian');
  }
  // ——— the roof of the north range and the side ranges: the terrace the cells' roofs make, a flat parapeted deck (not walkable)
  for (const r of [[x0 + t, z0 + t, x1 - t, zN], [x0 + t, zN, gx0, z1 - t], [gx1, zN, x1 - t, z1 - t]]) { bag.add('earth_wall', box(r[0], y + HT, r[1], r[2], y + HT + 0.5, r[3])); }
  // ——— the minaret at the north-west corner, over the corner room
  minaret(bag, col, [x0, z0, x0 + 4.8, z0 + 4.8], y, 24.5);
  // a lamp at the portal's lintel, one in the vestibule
  lights.push({ at: [cx, y + 3.0, z0 + 3.5], color: '#ffc27a', intensity: 4, distance: 8 });
}
/** A cupola of cedar over a square: eight ribs rising to a boss, the boards between them. */
function cupola(bag, cx, cz, y, s) {
  const N = 8, rr = (th) => s / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th))) * 0.98, rise = 1.3, T = [], ribs = [];
  const P = (k, u) => { const th = k / N * Math.PI * 2 + Math.PI / 8, r = rr(th) * (1 - u); return [cx + Math.cos(th) * r, y + rise * Math.sin(u * Math.PI / 2) * 0.0 + rise * u * (1 - 0.25 * u), cz + Math.sin(th) * r]; };
  for (let k = 0; k < N; k++) for (let j = 0; j < 4; j++) { const u0 = j / 4, u1 = (j + 1) / 4; q4(T, P(k, u0), P(k + 1, u0), P(k + 1, u1), P(k, u1)); }
  bag.add('cedar', dbl(T));
  for (let k = 0; k < N; k++) for (let j = 0; j < 4; j++) bag.add('timber', rod(P(k, j / 4), P(k, (j + 1) / 4), 0.035, 4));
  void ribs; bag.add('gilt_bronze', lathe([[0.001, 0], [0.18, 0], [0.001, 0.22]], 8, null, cx, y + rise - 0.03, cz));
}
/** A short run of horseshoe-ish arches over columns at stations along A→B on a wall 0.5 thick up to y + top. */
export function archRunLite(bag, A, B, st, y, hc, top) {
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]), ux = (B[0] - A[0]) / L, uz = (B[1] - A[1]) / L, th = 0.5, t2 = th / 2, tri = [];
  const P = (u, yy, o) => [A[0] + ux * u + uz * o, yy, A[1] + uz * u - ux * o];
  const ys = y + hc, yt = y + top, q = (a, b, c, d) => q4(tri, a, b, c, d);
  const strip = (ua, ya, ub, yb) => { for (const o of [-t2, t2]) q(P(ua, ya, o), P(ub, yb, o), P(ub, yt, o), P(ua, yt, o)); };
  const under = (ua, ya, ub, yb) => q(P(ua, ya, t2), P(ub, yb, t2), P(ub, yb, -t2), P(ua, ya, -t2));
  strip(0, ys, st[0].u - 0.2, ys); strip(st[st.length - 1].u + 0.2, ys, L, ys);
  for (const s of st) strip(s.u - 0.2, ys, s.u + 0.2, ys);
  q(P(0, yt, -t2), P(L, yt, -t2), P(L, yt, t2), P(0, yt, t2));
  const rods = [];
  const spans = [[0, st[0].u - 0.2], ...st.slice(0, -1).map((s, i) => [s.u + 0.2, st[i + 1].u - 0.2]), [st[st.length - 1].u + 0.2, L]];
  for (const [ua, ub] of spans) {
    const r = (ub - ua) / 2, uc = (ua + ub) / 2, K = 14, pts = [[ua, ys]];
    for (let k = 0; k <= K; k++) { const t = Math.PI - Math.PI * k / K; pts.push([uc + Math.cos(t) * r * (1 + 0.06 * Math.sin(t)), ys + 0.25 + Math.sin(t) * r * 0.95]); }
    pts.push([ub, ys]);
    for (let k = 0; k + 1 < pts.length; k++) { strip(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]); under(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1]); }
    for (let k = 0; k < K; k++) { const a = pts[k + 1], b = pts[k + 2]; for (const o of [-t2, t2]) rods.push([P(a[0], a[1] + 0.1, o), P(b[0], b[1] + 0.1, o)]); }
  }
  bag.add('stucco_cream', dbl(tri)); for (const [a, b] of rods) bag.add('stucco_warm', rod(a, b, 0.03, 4));
}
