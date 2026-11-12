// The Youguo (Kaibao) monastery's court as a Song monastery court (docs/settlements/song-kaifeng.md §11):
// the paved axis of brick with a worn granite strip, the pagoda's paved apron with its border course, side paths to
// the flanking halls and the stele pavilions, stone kerbs, raised beds of pines and cypresses, moss in the shady
// corners; stele_pavilion: a square hipped pavilion over a stele on its tortoise.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { hexa } from './kaifeng.js';

const KERB = 0.16, PAVE = 0.06;
const mulberry = (s) => () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/** A pine: a leaning, forked trunk, flat layered pads of needles on spreading limbs. */
function pine(bag, col, x, z, h, rnd) {
  const lean = (rnd() - 0.5) * 0.9, a = rnd() * 6.28, top = [x + Math.cos(a) * lean, h, z + Math.sin(a) * lean];
  bag.add('bark_pine', rod([x, 0.3, z], [x + Math.cos(a) * lean * 0.5, h * 0.55, z + Math.sin(a) * lean * 0.5], 0.26, 7));
  bag.add('bark_pine', rod([x + Math.cos(a) * lean * 0.5, h * 0.55, z + Math.sin(a) * lean * 0.5], top, 0.16, 6));
  bag.add('bark_pine', lathe([[0.42, 0], [0.3, 0.5], [0.001, 0.7]], 7, null, x, 0.28, z));
  const pads = 7 + Math.floor(rnd() * 3);
  for (let k = 0; k < pads; k++) {
    const t = 0.34 + 0.66 * k / (pads - 1), yy = h * t, ang = rnd() * 6.28, off = (1 - t) * 2.0 + 0.2, ph = rnd() * 6.28, ph2 = rnd() * 6.28;
    const px = x + Math.cos(a) * lean * t + Math.cos(ang) * off, pz = z + Math.sin(a) * lean * t + Math.sin(ang) * off, r = (2.1 - 1.2 * t) * (0.8 + rnd() * 0.4);
    bag.add('bark_pine', rod([x + Math.cos(a) * lean * t, yy - 0.15, z + Math.sin(a) * lean * t], [px, yy + 0.05, pz], 0.06, 4));
    const lump = (th) => 1 + 0.22 * Math.sin(th * 3 + ph) + 0.12 * Math.sin(th * 5 + ph2);
    bag.add('flax_leaf', lathe([[0.001, -0.1], [r * 0.55, -0.02], [r * 0.95, 0.12], [r, 0.3], [r * 0.8, 0.52], [r * 0.45, 0.66], [0.001, 0.7]], 12, (th) => lump(th), px, yy, pz));
  }
  col.circle(x, z, 0.3, 0, h * 0.6);
}
/** A cypress: a narrow dark column of foliage on a short trunk. */
function cypress(bag, col, x, z, h, r = 0.8) {
  const ph = (x * 7.3 + z) % 6.28, lump = (th) => 1 + 0.12 * Math.sin(th * 4 + ph) + 0.07 * Math.sin(th * 7);
  bag.add('bark_dark', rod([x, 0.3, z], [x, 1.4, z], 0.14, 6));
  bag.add('flax_leaf', lathe([[0.001, 0], [r * 0.75, 0.2], [r, h * 0.28], [r * 0.95, h * 0.55], [r * 0.65, h * 0.8], [r * 0.25, h * 0.95], [0.001, h * 1.02]], 12, (th) => lump(th), x, 1.0, z));
  col.circle(x, z, 0.22, 0, 2);
}
/** A raised bed with a granite coping and dark earth; shrubs along the edge. */
function bed(bag, col, rect, rnd, trees) {
  const [x0, z0, x1, z1] = rect, c = 0.28;
  bag.add('granite_block', box(x0, -0.3, z0, x1, 0.3, z0 + c)); bag.add('granite_block', box(x0, -0.3, z1 - c, x1, 0.3, z1));
  bag.add('granite_block', box(x0, -0.3, z0 + c, x0 + c, 0.3, z1 - c)); bag.add('granite_block', box(x1 - c, -0.3, z0 + c, x1, 0.3, z1 - c));
  bag.add('bark_dark', box(x0 + c, -0.3, z0 + c, x1 - c, 0.22, z1 - c));
  col.rect(rect, 0, 0.3);
  for (let i = 0; i < 9; i++) {
    const sx = x0 + c + 0.5 + rnd() * (x1 - x0 - 2 * c - 1), sz = rnd() < 0.5 ? z0 + c + 0.45 : z1 - c - 0.45, r = 0.35 + rnd() * 0.3;
    bag.add(rnd() < 0.5 ? 'doum_leaf' : 'papyrus', lathe([[0.001, 0], [r, r * 0.3], [r * 0.8, r * 0.8], [0.001, r]], 7, null, sx, 0.2, sz));
  }
  for (const [tx, tz, h, k] of trees) k === 'p' ? pine(bag, col, tx, tz, h, rnd) : cypress(bag, col, tx, tz, h);
}
const moss = (bag, x, y, z, r) => bag.add('sod', lathe([[0.001, 0], [r, 0.004], [r * 0.92, 0.022], [r * 0.5, 0.032], [0.001, 0.03]], 8, null, x, y, z));

/**
 * song_court { ax, z0, z1 (the axis from the gate hall's back to the apron), c: [x, z] (the pagoda), apron (half side),
 * halls: [[x, z]…] (where side paths end) }
 */
function songCourt(el, { bag, col }) {
  const ax = el.ax, [cx, cz] = el.c, A = el.apron ?? 13, rnd = mulberry(7), W = 2.6;
  const slab = (r, top = PAVE, m = 'brick_paving') => { bag.add(m, box(r[0], -0.3, r[1], r[2], top, r[3])); col.floor(r, top); };
  const kerb = (r) => bag.add('granite_block', box(r[0], -0.3, r[1], r[2], KERB, r[3]));
  const zA = cz + A;   // the apron's south edge (z grows southward: cz + A is its southern side, the axis runs from there to z1)
  const crossZ = el.cross ?? -150, cw = 1.2;
  // the court's field: flagstones, a hand's breadth lower than the paths laid over it
  { const r = [ax - 30, zA - 1, ax + 30, el.z1 + 1]; bag.add('flagstone', box(r[0], -0.3, r[1], r[2], 0.03, r[3])); col.floor(r, 0.03); }
  // the axis: brick, a worn granite strip down its middle, kerbs along both edges (broken where the cross path joins)
  slab([ax - W, zA, ax + W, el.z1]);
  bag.add('granite_block', box(ax - 0.9, -0.3, zA, ax + 0.9, PAVE + 0.02, el.z1));
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? ax - W - 0.25 : ax + W, x1 = x0 + 0.25;
    kerb([x0, zA, x1, crossZ - cw - 0.25]); kerb([x0, crossZ + cw + 0.25, x1, el.z1]);
  }
  // the cross path to the stele pavilions and the paths to the side halls
  for (const s of [-1, 1]) {
    const xa = s < 0 ? ax - W - 0.25 - (el.pav ?? 20) : ax + W + 0.25, xb = xa + (el.pav ?? 20);
    slab([xa, crossZ - cw, xb, crossZ + cw]);
    kerb([xa, crossZ - cw - 0.25, xb, crossZ - cw]); kerb([xa, crossZ + cw, xb, crossZ + cw + 0.25]);
  }
  for (const [hx, hz] of el.halls ?? []) {
    const s = hx < cx ? -1 : 1, xa = s < 0 ? hx : cx + A, xb = s < 0 ? cx - A : hx;
    slab([xa, hz - 1.2, xb, hz + 1.2]);
    kerb([xa, hz - 1.45, xb, hz - 1.2]); kerb([xa, hz + 1.2, xb, hz + 1.45]);
  }
  // the north court: from the pagoda's apron to the main hall's terrace, flagstones with the brick axis and its worn granite strip, kerbs along the field's sides
  if (el.north !== undefined) {
    const zN = el.north, zc = cz - A;
    { const r = [ax - 30, zN, ax + 30, zc + 1]; bag.add('flagstone', box(r[0], -0.3, r[1], r[2], 0.03, r[3])); col.floor(r, 0.03); }
    slab([ax - W, zN, ax + W, zc]);
    bag.add('granite_block', box(ax - 0.9, -0.3, zN, ax + 0.9, PAVE + 0.02, zc));
    for (const sg of [-1, 1]) { const x0 = sg < 0 ? ax - W - 0.25 : ax + W; kerb([x0, zN, x0 + 0.25, zc]); }
    for (const sg of [-1, 1]) { const x0 = sg < 0 ? ax - 30 - 0.25 : ax + 30; kerb([x0, zN, x0 + 0.25, zc + 1]); }
    // raised beds of pines and cypresses either side of the way, as in the south court
    for (const sg of [-1, 1]) { const xa = sg < 0 ? ax - 22 : ax + 12, xb = xa + 10; bed(bag, col, [xa, zN + 4, xb, zN + 17], rnd, [[3, zN + 10.5, 7.6 + rnd(), 'p'], [8, zN + 7, 6.2, 'c'], [8, zN + 14, 6.6, 'c']].map(([u, v, h, k]) => [xa + u, v, h, k])); }
    for (let i = 0; i < 10; i++) moss(bag, ax + (rnd() < 0.5 ? -1 : 1) * (W - 0.15 - rnd() * 0.4), PAVE + 0.001, zN + 2 + rnd() * (zc - zN - 4), 0.18 + rnd() * 0.3);
  }
  // the pagoda's apron: brick inside, a border course of granite, a kerb round
  slab([cx - A, cz - A, cx + A, zA]);
  for (const r of [[cx - A, cz - A, cx + A, cz - A + 1], [cx - A, zA - 1, cx + A, zA], [cx - A, cz - A + 1, cx - A + 1, zA - 1], [cx + A - 1, cz - A + 1, cx + A, zA - 1]]) bag.add('granite_block', box(r[0], -0.3, r[1], r[2], PAVE + 0.025, r[3]));
  // (the south side's kerb is open where the axis joins; the north and the sides' kerbs stand outside the border)
  kerb([cx - A - 0.25, cz - A - 0.25, cx + A + 0.25, cz - A]);
  kerb([cx - A - 0.25, cz - A, cx - A, zA + 0.25]); kerb([cx + A, cz - A, cx + A + 0.25, zA + 0.25]);
  kerb([cx - A, zA, ax - W, zA + 0.25]); kerb([ax + W, zA, cx + A, zA + 0.25]);
  // the beds either side of the way, broken by the cross path
  for (const s of [-1, 1]) {
    const xa = s < 0 ? ax - 22 : ax + 12, xb = xa + 10;
    const ex = (a, b) => [a, b];
    const bd = (z0, z1, tr) => bed(bag, col, [xa, z0, xb, z1], rnd, tr.map(([u, v, h, k]) => [xa + u, v, h, k]));
    void ex;
    bd(-171, -154, [[3, -162.5, 8.2 + rnd(), 'p'], [8, -158, 6.8, 'c'], [8, -167, 7.2, 'c']]);
    bd(-146, -121, [[5, -133, 7.6 + rnd(), 'p'], [2, -126, 6.3, 'c'], [8, -126, 6.8, 'c'], [2, -141, 6.5, 'c'], [8, -141, 6.1, 'c']]);
  }
  // moss in the shady corners: the north faces of the kerbs and the beds, the apron's north edge, the joints by the pagoda
  for (let i = 0; i < 26; i++) {
    const k = i % 4;
    if (k === 0) moss(bag, cx - A + 1 + rnd() * (2 * A - 2), 0.062, cz - A + 1.3 + rnd() * 0.6, 0.25 + rnd() * 0.45);
    else if (k === 1) moss(bag, ax + (rnd() < 0.5 ? -1 : 1) * (W - 0.15 - rnd() * 0.4), PAVE + 0.001, el.z1 - 3 - rnd() * (el.z1 - zA - 8), 0.18 + rnd() * 0.3);
    else if (k === 2) { const s = rnd() < 0.5 ? -1 : 1, xa = s < 0 ? ax - 22 : ax + 12; moss(bag, xa + 0.5 + rnd() * 9, 0.3, -171 + 0.05, 0.2 + rnd() * 0.2); }
    else moss(bag, cx + (rnd() - 0.5) * 2 * (A - 1), 0.062, zA - 1.3 + rnd() * 0.7, 0.2 + rnd() * 0.3);
  }
  // the axis' south end: wear — a few darker flags in the strip
  for (let i = 0; i < 10; i++) bag.add('granite_grey', box(ax - 0.75 + rnd() * 0.3, PAVE + 0.02, el.z1 - 2.9 - i * 6.2, ax + 0.45 + rnd() * 0.3, PAVE + 0.026, el.z1 - 2 - i * 6.2));
}

/** stele_pavilion { at, y, face, s }: a stele on its tortoise under a square hipped roof on four red posts, a granite platform. */
function stelePavilion(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = 2, H = 3.4, E = 3.2;
  bag.add('granite_block', box(x - 2.6, y - 0.3, z - 2.6, x + 2.6, y + 0.38, z + 2.6));
  col.floor([x - 2.6, z - 2.6, x + 2.6, z + 2.6], y + 0.38);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    bag.add('granite_grey', box(x + sx * h - 0.28, y + 0.38, z + sz * h - 0.28, x + sx * h + 0.28, y + 0.55, z + sz * h + 0.28));
    bag.add('lacquer_red', lathe([[0.2, 0], [0.17, H - 0.1]], 8, null, x + sx * h, y + 0.55, z + sz * h));
    col.circle(x + sx * h, z + sz * h, 0.22, y + 0.38, y + 0.38 + H);
  }
  const yb = y + 0.55 + H;
  for (const sg of [-1, 1]) { bag.add('lacquer_red', box(x - h - 0.2, yb - 0.5, z + sg * h - 0.09, x + h + 0.2, yb, z + sg * h + 0.09)); bag.add('lacquer_red', box(x + sg * h - 0.09, yb - 0.5, z - h - 0.2, x + sg * h + 0.09, yb, z + h + 0.2)); }
  // the brackets: a block and two arms on each post, the eave ring on their ends
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    bag.add('paint_ochre', box(x + sx * h - 0.18, yb, z + sz * h - 0.18, x + sx * h + 0.18, yb + 0.16, z + sz * h + 0.18));
    bag.add('timber_red', box(x + sx * h - 0.1 - (sx < 0 ? 0.5 : 0), yb + 0.16, z + sz * h - 0.1, x + sx * h + 0.1 + (sx > 0 ? 0.5 : 0), yb + 0.3, z + sz * h + 0.1));
  }
  bag.add('lacquer_red', box(x - E + 0.4, yb + 0.3, z - E + 0.4, x + E - 0.4, yb + 0.42, z + E - 0.4));
  bag.add('lacquer_red', box(x - E, yb + 0.42, z - E, x + E, yb + 0.5, z + E));   // the eave's soffit (the roof lies over it)
  { const g = lathe([[E * 1.414, 0], [E * 1.12, 0.38], [E * 0.6, 0.95], [0.001, 1.65]], 4); g.rotateY(Math.PI / 4); g.translate(x, yb + 0.5, z); bag.add('tile_dark', g); }
  bag.add('gilt_bronze', lathe([[0.2, 0], [0.12, 0.2], [0.07, 0.5], [0.001, 0.62]], 8, null, x, yb + 2.15, z));
  STYLES.song.elements.stele({ at: [x, z], y: y + 0.38, face: el.face }, { bag, col });
}

/**
 * cloister { a, b (the run's ends on the wall's inner face), side ([nx, nz] into the court), depth, post (post height), wall (the wall's height), seed }:
 * a covered gallery (lang) along the inside of the monastery's wall, as the Song monasteries had round their courts [inferred from the later
 * temples and the Song paintings of monasteries]: a brick floor, red posts on stone bases every 3.4 m, a beam with bracket blocks, a lean-to
 * roof of dark tile from the wall's top down to the eave, a ceiling of painted coffers under it, benches, paper lanterns on the beam, and on the wall
 * framed mural panels in each bay.
 */
function cloister(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, [nx, nz] = el.side, D = el.depth ?? 3.8, ph = el.post ?? 2.45, wallH = el.wall ?? 3.6, rnd = mulberry(el.seed ?? 3);
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.max(1, Math.round(L / 3.4));
  const P = (u, d, y) => [ax + ux * u + nx * d, y, az + uz * u + nz * d];
  const wallBox = (m, u0, u1, d0, d1, y0, y1) => { const o = []; hexa(o, [P(u0, d0, y0), P(u1, d0, y0), P(u1, d1, y0), P(u0, d1, y0), P(u0, d0, y1), P(u1, d0, y1), P(u1, d1, y1), P(u0, d1, y1)]); bag.add(m, fromTriangles(o)); };
  const rect = (u0, u1, d0, d1) => { const p = [P(u0, d0, 0), P(u1, d1, 0), P(u0, d1, 0), P(u1, d0, 0)]; return [Math.min(...p.map((q) => q[0])), Math.min(...p.map((q) => q[2])), Math.max(...p.map((q) => q[0])), Math.max(...p.map((q) => q[2]))]; };
  // the floor, a step above the court's flagstones
  wallBox('brick_paving', 0, L, 0, D, -0.3, 0.1); col.floor(rect(0, L, 0, D), 0.1);
  wallBox('granite_block', 0, L, D - 0.05, D + 0.2, -0.3, 0.16);
  const pd = D - 0.35, yb = 0.1 + ph;
  // the roof: a lean-to from the wall's top (yw) down to the eave beyond the posts (ye), tile above, a coffered ceiling below
  const yw = wallH - 0.15, ye = yb + 0.42, ov = 0.5;
  for (let k = 0; k < n; k++) {
    const u0 = L * k / n, u1 = L * (k + 1) / n;
    // the sloping slab, 0.2 thick: its top at the wall yw, at the eave ye
    const o = []; hexa(o, [P(u0, 0, yw - 0.22), P(u1, 0, yw - 0.22), P(u1, D + ov, ye - 0.22), P(u0, D + ov, ye - 0.22), P(u0, 0, yw), P(u1, 0, yw), P(u1, D + ov, ye), P(u0, D + ov, ye)]);
    bag.add('tile_dark', fromTriangles(o));
    // the ceiling under it: flat coffers at the beam's height, between the beam and the wall
    wallBox('ceiling_coffer', u0 + 0.05, u1 - 0.05, 0.1, pd, yb - 0.02, yb + 0.1);
  }
  // the ridge-side flashing along the wall and a row of tiles' ends at the eave
  wallBox('tile_dark', 0, L, 0, 0.35, yw, yw + 0.2); wallBox('tile_dark', 0, L, D + ov - 0.05, D + ov + 0.05, ye - 0.3, ye + 0.04);
  for (let k = 0; k <= n; k++) {
    const u = L * k / n, uu = Math.min(L - 0.17, Math.max(0.17, u)), c = P(uu, pd, 0);
    bag.add('granite_grey', lathe([[0.3, 0], [0.3, 0.1], [0.21, 0.16], [0.21, 0.3]], 8, null, c[0], 0.1, c[2]));
    bag.add('lacquer_red', lathe([[0.17, 0], [0.15, ph - 0.28]], 8, null, c[0], 0.4, c[2]));
    col.circle(c[0], c[2], 0.19, 0.1, 0.1 + ph);
    wallBox('paint_ochre', uu - 0.24, uu + 0.24, pd - 0.24, pd + 0.24, yb - 0.3, yb - 0.1);        // the bracket block
  }
  wallBox('lacquer_red', 0, L, pd - 0.17, pd + 0.17, yb - 0.1, yb + 0.12);                        // the beam on the posts
  wallBox('lacquer_red', 0, L, 0.35, 0.65, yb - 0.1, yb + 0.12);                                  // the plate against the wall
  for (let k = 0; k < n; k++) {                                                                    // the tie beams across, and a bay's lantern, bench and mural
    const u0 = L * k / n, u1 = L * (k + 1) / n, um = (u0 + u1) / 2;
    wallBox('lacquer_red', um - 0.1, um + 0.1, 0.35, pd, yb - 0.12, yb + 0.08);
    if (k % 2 === 0) { const c = P(um, pd - 0.9, 0); bag.add('lamp_paper', lathe([[0.001, 0], [0.12, 0.05], [0.2, 0.22], [0.13, 0.4], [0.001, 0.44]], 8, null, c[0], yb - 0.66, c[2])); bag.add('wood_dark', rod([c[0], yb - 0.12, c[2]], [c[0], yb - 0.22, c[2]], 0.01, 3)); }
    if (k % 3 === 1) { wallBox('wood_dark', um - 0.9, um + 0.9, 0.55, 1.0, 0.1, 0.5); { const r = rect(um - 0.9, um + 0.9, 0.55, 1.0); col.rect(r, 0.1, 0.5); } }
    // the mural: a framed panel on the wall, a field of colour with a band of hills, a figure's block, a sun
    const w = Math.min(2.2, (u1 - u0) - 1.0), c0 = ['cloth_indigo', 'cloth_green', 'paint_ochre'][k % 3];
    wallBox('lacquer_black', um - w / 2 - 0.07, um + w / 2 + 0.07, 0.0, 0.07, 1.0, 2.25);
    wallBox('plaster_white', um - w / 2, um + w / 2, 0.0, 0.1, 1.07, 2.18);
    wallBox(c0, um - w / 2 + 0.05, um + w / 2 - 0.05, 0.0, 0.12, 1.12, 1.35);
    wallBox('cloth_green', um - w / 2 + 0.05, um + w / 2 - 0.05, 0.0, 0.12, 1.35, 1.6);
    wallBox('paint_caihua', um - w * 0.1, um + w * 0.1, 0.0, 0.13, 1.4, 2.05);
    wallBox('cloth_red', um + w * 0.28 - 0.14, um + w * 0.28 + 0.14, 0.0, 0.13, 1.72, 2.0);
    wallBox('lacquer_black', um - w / 2 - 0.07, um + w / 2 + 0.07, 0.0, 0.07, 1.0, 1.07);
    void rnd;
  }
  // the wall's foot: a dado of grey brick behind the bays
  wallBox('brick_grey', 0, L, 0.0, 0.07, 0.1, 0.9);
}

/** The court's trees: old cypresses and pines (beds of the court's own) are court.js's; these are the groves' ground planting (ground.js GROVES). */
export const COURT_ELEMENTS = { song_court: songCourt, stele_pavilion: stelePavilion, cloister };
