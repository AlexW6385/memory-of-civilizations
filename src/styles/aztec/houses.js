// Mexica houses and palaces (docs/settlements/tenochtitlan.md §5, §11): the calli of the calpulli —
// one-room houses of adobe on a course of stone, plastered, flat-roofed on beams, grouped round a
// patio on a low stone platform inside a compound wall, with the things of the patio (the metate,
// the water jar, the maize granary, the house altar), a ladder to the roof and, on many roofs, the
// flowers Cortés saw; and the tecpan, Moctezuma's palace, after the Codex Mendoza (f. 69r) and
// Cortés: two storeys of white rooms round courts, porticoes of square piers, doorways framed in
// red-brown beams with reed mats inside them, the band of concentric discs across the upper facade,
// a court paved like a chess-board and a garden court with its pool, the king's seat upstairs.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles } from '../../core/geom.js';
import { Kit, carved } from '../maya/meso.js';
import { Matrix4 } from '../../core/three.js';
import { hearthKit, ollaKit, storeJarKit, bowlsKit, bedKit, metateKit, waterJarKit, soot, put } from '../maya/household.js';
import { maguey, nopal, mesoPlants } from '../maya/plants.js';
import { hollow, pierMids } from './palace.js';
export { mesoPlants };

const W = 'plaster_white', R = 'stucco_red', ST = 'andesite', FL = 'stucco';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const SIDES = ['n', 's', 'w', 'e'];
const OPP = { n: 's', s: 'n', w: 'e', e: 'w' };
/** The rect [x0, z0, x1, z1] of a band along side f of r, from depth v0 to v1 inward and u0 to u1 along it. */
function band(r, f, v0, v1, u0 = null, u1 = null) {
  const [x0, z0, x1, z1] = r, a0 = u0 ?? (f === 'n' || f === 's' ? x0 : z0), a1 = u1 ?? (f === 'n' || f === 's' ? x1 : z1);
  if (f === 'n') return [a0, z0 + v0, a1, z0 + v1];
  if (f === 's') return [a0, z1 - v1, a1, z1 - v0];
  if (f === 'w') return [x0 + v0, a0, x0 + v1, a1];
  return [x1 - v1, a0, x1 - v0, a1];
}
const B = (bag, mat, r, y0, y1) => bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3]));
/** A wall along rect r from y0 to y1, its foot two courses of stone (the adobe on its stone base). */
function adobeWall(bag, col, r, y0, y1, base = 0.35) {
  B(bag, ST, r, y0, y0 + base);
  B(bag, W, r, y0 + base, y1);
  col.rect(r, y0, y1);
}
/**
 * A room { r (outer rect), y (floor), h (wall height), door ('n'…: the side on the patio), t (walls) }:
 * four walls, the doorway in the patio wall with its timber lintel and a rolled reed mat over it,
 * the roof beams laid across the short way and projecting, the earth roof plastered over them, a low
 * parapet and a spout. Returns the roof's level.
 */
function room(bag, col, { r, y, h, door, t = 0.45, dw = 0.95, dh = 1.9, lintel = 'timber', mats = true, spout = true }) {
  const [x0, z0, x1, z1] = r, alongX = door === 'n' || door === 's';
  // the walls: the two along x full length, the two along z between them
  const walls = { n: [x0, z0, x1, z0 + t], s: [x0, z1 - t, x1, z1], w: [x0, z0 + t, x0 + t, z1 - t], e: [x1 - t, z0 + t, x1, z1 - t] };
  for (const f of SIDES) {
    const q = walls[f];
    if (f !== door) { adobeWall(bag, col, q, y, y + h); continue; }
    const m = alongX ? (x0 + x1) / 2 : (z0 + z1) / 2, a = m - dw / 2, b = m + dw / 2;
    const [p, s] = alongX ? [[q[0], q[1], a, q[3]], [b, q[1], q[2], q[3]]] : [[q[0], q[1], q[2], a], [q[0], b, q[2], q[3]]];
    adobeWall(bag, col, p, y, y + h); adobeWall(bag, col, s, y, y + h);
    const over = alongX ? [a, q[1], b, q[3]] : [q[0], a, q[2], b];
    B(bag, W, over, y + dh + 0.18, y + h);
    const li = alongX ? [a - 0.3, q[1] - 0.04, b + 0.3, q[3] + 0.04] : [q[0] - 0.04, a - 0.3, q[2] + 0.04, b + 0.3];
    B(bag, lintel, li, y + dh, y + dh + 0.18);
    B(bag, ST, alongX ? [a, q[1] - 0.02, b, q[3] + 0.02] : [q[0] - 0.02, a, q[2] + 0.02, b], y - 0.02, y + 0.06);      // the threshold stone
    if (mats) {
      // the door mat rolled up under the lintel, on the patio side
      const o = 0.13, c = door === 'n' ? [m, q[1] - o] : door === 's' ? [m, q[3] + o] : door === 'w' ? [q[0] - o, m] : [q[2] + o, m];
      const g = lathe([[0.075, 0], [0.075, dw + 0.2], [0.001, dw + 0.2]], 8);
      g.translate(0, -(dw + 0.2) / 2, 0); if (alongX) g.rotateZ(Math.PI / 2); else g.rotateX(Math.PI / 2);
      g.translate(c[0], y + dh - 0.09, c[1]); bag.add('reed_mat', g);
    }
  }
  // the roof: beams from the patio wall to the back wall, their ends out past both; a course of plaster
  // between them over the wall heads; the earth roof and its parapet
  const shortX = !alongX, yb = y + h, bh = 0.17, n = Math.max(2, Math.round((shortX ? z1 - z0 : x1 - x0) / 0.62));
  for (let i = 0; i < n; i++) {
    const u = (shortX ? z0 : x0) + (i + 0.5) * (shortX ? z1 - z0 : x1 - x0) / n, hw = 0.08;
    B(bag, 'viga', shortX ? [x0 - 0.32, u - hw, x1 + 0.32, u + hw] : [u - hw, z0 - 0.32, u + hw, z1 + 0.32], yb, yb + bh);
  }
  for (const f of SIDES) B(bag, W, walls[f], yb, yb + bh);
  const yr = yb + bh + 0.22;
  B(bag, FL, [x0 - 0.06, z0 - 0.06, x1 + 0.06, z1 + 0.06], yb + bh, yr);
  for (const q of [[x0 - 0.06, z0 - 0.06, x1 + 0.06, z0 + 0.16], [x0 - 0.06, z1 - 0.16, x1 + 0.06, z1 + 0.06], [x0 - 0.06, z0 + 0.16, x0 + 0.16, z1 - 0.16], [x1 - 0.16, z0 + 0.16, x1 + 0.06, z1 - 0.16]]) B(bag, W, q, yr, yr + 0.32);
  col.floor([x0, z0, x1, z1], yr);
  if (spout) {
    // a stone spout through the parapet on the side away from the patio
    const f = OPP[door], c = alongX ? (x0 + x1) / 2 + 0.8 : (z0 + z1) / 2 + 0.8;
    const q = f === 'n' ? [c - 0.09, z0 - 0.55, c + 0.09, z0 + 0.2] : f === 's' ? [c - 0.09, z1 - 0.2, c + 0.09, z1 + 0.55] : f === 'w' ? [x0 - 0.55, c - 0.09, x0 + 0.2, c + 0.09] : [x1 - 0.2, c - 0.09, x1 + 0.55, c + 0.09];
    B(bag, ST, q, yr + 0.02, yr + 0.14);
  }
  return yr;
}

/**
 * The things inside a room { r (outer rect), y (floor), h, door, t } by its use: 'hearth' (the hearth of three
 * stones and the comal in a back corner, the soot over it on the beams' ceiling, ollas, a mat and blanket by the
 * side wall, a stored jar), 'sleep' (mats along the back wall with folded blankets, a reed chest, a basket, the
 * cups) or 'store' (jars along the back wall, baskets, a bale of cloth). Florentine Codex (via ancient-history-sites):
 * the hearth, the comal, the metate beside the hearth, reed mats with a pillow, pots and baskets.
 */
function roomThings(ctx, { r, y, h, door, t = 0.45 }, role, rand) {
  const { bag, col } = ctx, L = STYLES.life.elements, [x0, z0, x1, z1] = [r[0] + t, r[1] + t, r[2] - t, r[3] - t];
  const F = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[door], fx = F[0], fz = F[1];
  const front = fx ? (fx > 0 ? x1 : x0) : (fz > 0 ? z1 : z0), U0 = fx ? z0 : x0, U1 = fx ? z1 : x1, D = fx ? x1 - x0 : z1 - z0, sgn = fx || fz;
  const at3 = (u, v) => (fx ? [front - sgn * v, y, u] : [u, y, front - sgn * v]), inward = Math.atan2(-fx, -fz), m = (U0 + U1) / 2, ceil = y + h + 0.17;
  if (D < 1.8 || U1 - U0 < 2.4) return;
  if (role === 'hearth') {
    const hu = U0 + 0.85, hv = D - 0.85, [hx, , hz] = at3(hu, hv);
    put(bag, hearthKit('andesite'), hx, y, hz, inward); col.circle(hx, hz, 0.45, y, y + 0.3);
    soot(bag, [hx, ceil, hz], [0, -1, 0], 1.6, 1.4, Math.floor(rand() * 1e6));
    put(bag, ollaKit(), ...at3(hu + 0.95, hv + 0.1), 0); put(bag, ollaKit(), ...at3(hu, hv - 1.0), 0);
    put(bag, bedKit(rand() < 0.6 ? 'cloth_white' : 'cloth_ochre', 'cloth_red'), ...at3(U1 - 0.6, D - 1.25), inward + Math.PI / 2);
    put(bag, storeJarKit(), ...at3(U1 - 0.45, 0.5), 0);
    L.basket({ at: at3(m + 1.1, D - 0.4).filter((_, i) => i !== 1), y, seed: Math.floor(rand() * 1e6), n: 1 }, ctx);
  } else if (role === 'sleep') {
    for (const k of (U1 - U0 > 4.2 ? [0, 1] : [0])) put(bag, bedKit(rand() < 0.7 ? 'cloth_white' : 'cloth_ochre', rand() < 0.5 ? 'cloth_red' : 'cloth_indigo'), ...at3(k ? U1 - 1.2 : U0 + 1.2, D - 0.55), inward);
    put(bag, chestKit(), ...at3(U0 + 0.45, 0.9), inward + Math.PI / 2);
    put(bag, bowlsKit('paint_ochre'), ...at3(U1 - 0.5, 0.5), inward);
    L.basket({ at: at3(U1 - 0.5, 1.2).filter((_, i) => i !== 1), y, seed: Math.floor(rand() * 1e6), n: 1 }, ctx);
  } else {
    for (let k = 0; k < Math.min(6, Math.floor((U1 - U0 - 0.6) / 0.62)); k++) { const p = at3(U0 + 0.45 + k * 0.62, D - 0.4); put(bag, storeJarKit(), ...p, 0); col.circle(p[0], p[2], 0.26, y, y + 0.6); }
    L.basket({ at: at3(U1 - 0.6, 0.9).filter((_, i) => i !== 1), y, seed: Math.floor(rand() * 1e6), n: 3 }, ctx);
    put(bag, chestKit(), ...at3(U0 + 0.5, 0.8), inward + Math.PI / 2);
  }
}
/** A reed chest (petlacalli): a lidded box of woven reed, 0.7 × 0.45 × 0.4 m, along x. */
const chestKit = () => carved('petlacalli', (k) => {
  k.bx('wicker', -0.35, 0.35, 0, 0.36, -0.22, 0.22);
  k.bx('reed_mat', -0.37, 0.37, 0.36, 0.42, -0.24, 0.24);
});

/** The metate: the sloping grinding slab of basalt on three legs, the mano lying on it. */
const metate = () => carved('mx-metate', (k) => {
  for (const [x, z] of [[-0.14, -0.2], [0.14, -0.2], [0, 0.22]]) k.fy('basalt', [x - 0.04, x + 0.04, z - 0.04, z + 0.04], [x - 0.03, x + 0.03, z - 0.03, z + 0.03], 0, z < 0 ? 0.13 : 0.2);
  k.seg('basalt', [0, 0.15, -0.27], [0, 0.24, 0.27], 0.17, 0.035);
  k.seg('basalt', [-0.2, 0.25, -0.05], [0.2, 0.25, -0.05], 0.04, 0.035);
});
/** The cuezcomatl: a maize granary of clay and straw, jar-shaped, on a stone footing, under a cap of thatch. */
const granary = () => carved('mx-granary', (k) => {
  k.bx(ST, -0.75, 0.75, 0, 0.35, -0.75, 0.75);
  k.geo('mud_plaster', lathe([[0.5, 0], [0.82, 0.5], [0.9, 1.0], [0.72, 1.6], [0.45, 1.85], [0.4, 1.95], [0.001, 1.95]], 16).translate(0, 0.35, 0));
  k.geo('thatch', lathe([[0.7, 0], [0.62, 0.12], [0.001, 0.75]], 14).translate(0, 2.18, 0));
  k.geo('mud_plaster', lathe([[0.42, 0], [0.42, 0.06], [0.001, 0.06]], 12).translate(0, 2.18, 0));
  k.bx('timber', -0.04, 0.04, 2.24, 2.42, -0.04, 0.04);
});
/** The house altar: a small stepped base, plastered, a clay figure of the household god and an incense burner on it. */
const altar = () => carved('mx-house-altar', (k) => {
  k.bx(W, -0.35, 0.35, 0, 0.35, -0.3, 0.3); k.bx(W, -0.27, 0.27, 0.35, 0.6, -0.22, 0.22);
  k.bx(R, -0.36, 0.36, 0.3, 0.35, -0.31, 0.31);
  k.fy('terracotta', [-0.07, 0.07, -0.05, 0.05], [-0.05, 0.05, -0.04, 0.04], 0.6, 0.84); k.bx('terracotta', -0.08, 0.08, 0.84, 0.96, -0.06, 0.06);
  k.geo('pottery_dark', lathe([[0.06, 0], [0.04, 0.05], [0.1, 0.12], [0.08, 0.15], [0.001, 0.12]], 10).translate(0.17, 0.6, 0.06));
});
/** A planter on a roof: a clay pot with a mound of leaves and a few flowers (marigold, dahlia). */
const planter = (v) => carved('mx-planter' + v, (k) => {
  k.geo('terracotta', lathe([[0.15, 0], [0.24, 0.2], [0.27, 0.36], [0.25, 0.4], [0.001, 0.36]], 10));
  k.geo(v % 2 ? 'stucco_leaf' : 'clay_green', lathe([[0.27, 0], [0.33, 0.12], [0.24, 0.32], [0.001, 0.4]], 9, (th) => 1 + 0.12 * Math.sin(th * 5 + v)).translate(0, 0.36, 0));
  const fl = v === 2 ? 'stucco_rose' : 'stucco_saffron';
  for (let i = 0; i < 4 + v; i++) { const a = i * 2.4 + v, r = 0.08 + (i % 3) * 0.07; k.geo(fl, lathe([[0.045, 0], [0.06, 0.03], [0.001, 0.07]], 6).translate(Math.cos(a) * r, 0.6 + 0.12 * Math.cos(a * 1.7) - r * 0.4, Math.sin(a) * r)); }
});
/** A raised bed of earth on a roof, bordered with plaster, its plants in a row. */
function roofBed(bag, r, y, seed) {
  B(bag, W, r, y, y + 0.3);
  B(bag, 'mud_plaster', [r[0] + 0.08, r[1] + 0.08, r[2] - 0.08, r[3] - 0.08], y + 0.3, y + 0.34);
  const along = r[2] - r[0] > r[3] - r[1], L = along ? r[2] - r[0] : r[3] - r[1], n = Math.max(1, Math.floor(L / 0.55)), rand = rng(seed);
  for (let i = 0; i < n; i++) {
    const u = (along ? r[0] : r[1]) + (i + 0.5) * L / n, c = along ? [u, (r[1] + r[3]) / 2] : [(r[0] + r[2]) / 2, u];
    bag.add(rand() < 0.5 ? 'stucco_leaf' : 'clay_green', lathe([[0.2, 0], [0.24, 0.12], [0.15, 0.3], [0.001, 0.36]], 8, null, c[0], y + 0.32, c[1]));
    if (rand() < 0.6) bag.add(rand() < 0.6 ? 'stucco_saffron' : 'stucco_rose', lathe([[0.07, 0], [0.09, 0.04], [0.001, 0.1]], 6, null, c[0] + 0.05, y + 0.62, c[1] - 0.03));
  }
}

/**
 * calli: a commoner's house compound { rect, seed }: a low platform of stone filled with earth and
 * plastered; two or three one-room houses on its sides, their doors on the patio; a compound wall
 * closing the rest with its gate on the street; in the patio the metate, the water jar, sometimes
 * a granary or the house altar, a woman grinding maize; a ladder to a roof; flowers on many roofs.
 */
export function calli(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, P = 0.42, L = STYLES.life.elements;
  B(bag, ST, el.rect, -0.3, P - 0.07); B(bag, FL, [x0 + 0.04, z0 + 0.04, x1 - 0.04, z1 - 0.04], P - 0.07, P);
  col.floor(el.rect, P);
  const I = [x0 + 0.25, z0 + 0.25, x1 - 0.25, z1 - 0.25], gate = SIDES[Math.floor(rand() * 4)], back = OPP[gate];
  const perp = gate === 'n' || gate === 's' ? ['w', 'e'] : ['n', 's'];
  const depth = () => 3.9 + rand() * 0.8, H = () => 2.5 + rand() * 0.45;
  const rooms = [];
  const db = depth();
  rooms.push({ r: band(I, back, 0, db), door: gate, side: back });
  // the side rooms run from the back room toward the street, leaving the patio between them
  for (const f of perp) {
    if (rand() < (rooms.length === 1 ? 0.85 : 0.5)) {
      const ds = depth(), Lr = 4.2 + rand() * 2.2, tw = gate === 'n' || gate === 's';
      const along = tw ? (back === 'n' ? [I[1] + db, I[1] + db + Lr] : [I[3] - db - Lr, I[3] - db]) : (back === 'w' ? [I[0] + db, I[0] + db + Lr] : [I[2] - db - Lr, I[2] - db]);
      const r = band(I, f, 0, ds, along[0], along[1]);
      const patioW = (tw ? I[2] - I[0] : I[3] - I[1]) - ds - (rooms.length > 1 ? rooms[1].ds : 0);
      if (patioW < 3.2 || (tw ? r[3] - r[1] : r[2] - r[0]) > (tw ? I[3] - I[1] : I[2] - I[0]) - db - 2) continue;
      rooms.push({ r, door: OPP[f], side: f, ds });
    }
  }
  const tops = rooms.map((q, i) => { const hh = H(); roomThings(ctx, { r: q.r, y: P, h: hh, door: q.door }, i === 0 ? 'hearth' : rand() < 0.65 ? 'sleep' : 'store', rand); return room(bag, col, { r: q.r, y: P, h: hh, door: q.door }); });
  // the compound wall along the rest of the perimeter (the walls on x run full length, those on z
  // between them), its gate on the street
  const t = 0.4, wh = P + 1.9;
  for (const f of SIDES) {
    const alongX = f === 'n' || f === 's', a0 = alongX ? I[0] : I[1] + t, a1 = alongX ? I[2] : I[3] - t;
    const cover = rooms.filter((q) => q.side === f || touches(q.r, I, f)).map((q) => (alongX ? [q.r[0], q.r[2]] : [q.r[1], q.r[3]])).sort((p, q) => p[0] - q[0]);
    let u = a0; const segs = [];
    for (const [c0, c1] of cover) { if (c0 > u + 0.05) segs.push([u, c0]); u = Math.max(u, c1); }
    if (a1 > u + 0.05) segs.push([u, a1]);
    const cap = (s0, s1) => B(bag, W, band(I, f, -0.03, t + 0.03, s0 + (alongX ? 0 : 0.03), s1 - (alongX ? 0 : 0.03)), wh, wh + 0.08);
    for (const [s0, s1] of segs) {
      if (f === gate && s1 - s0 > 2.6) {
        const m = (s0 + s1) / 2 + (rand() - 0.5) * Math.max(0, s1 - s0 - 3), g0 = m - 0.65, g1 = m + 0.65;
        adobeWall(bag, col, band(I, f, 0, t, s0, g0), P, wh); adobeWall(bag, col, band(I, f, 0, t, g1, s1), P, wh); cap(s0, g0); cap(g1, s1);
        B(bag, ST, band(I, f, -0.25, t, g0, g1), P - 0.22, P - 0.02);                              // the step at the gate
        B(bag, 'timber', band(I, f, -0.04, t + 0.04, g0 - 0.25, g1 + 0.25), wh - 0.2, wh);          // the gate's lintel
      } else { adobeWall(bag, col, band(I, f, 0, t, s0, s1), P, wh); cap(s0, s1); }
    }
  }
  // the patio and its things
  const pr = rooms.reduce((r, q) => {
    const o = q.r; if (q.side === 'n') r[1] = Math.max(r[1], o[3]); if (q.side === 's') r[3] = Math.min(r[3], o[1]); if (q.side === 'w') r[0] = Math.max(r[0], o[2]); if (q.side === 'e') r[2] = Math.min(r[2], o[0]); return r;
  }, [I[0] + t, I[1] + t, I[2] - t, I[3] - t]);
  const pw = pr[2] - pr[0], pd = pr[3] - pr[1];
  if (pw < 2.6 || pd < 2.6) return;
  const cx = (pr[0] + pr[2]) / 2, cz = (pr[1] + pr[3]) / 2, bd = { n: [0, -1], s: [0, 1], w: [-1, 0], e: [1, 0] }[back], sd = [Math.abs(bd[1]), Math.abs(bd[0])];
  const half = bd[0] ? pd / 2 : pw / 2, deep = bd[0] ? pw / 2 : pd / 2;
  // (along the back wall at offset a, out from it by b)
  const at = (a, b) => [cx + bd[0] * (deep - b) + sd[0] * a, cz + bd[1] * (deep - b) + sd[1] * a];
  // the metate beside the back room's door, the woman kneeling at it
  const ma = Math.min(1.25, half - 0.45), mp = at(ma, 0.9), face = Math.atan2(bd[0], bd[1]);
  metate().emit(bag, mp[0], P, mp[1], -bd[0], -bd[1]);
  const jp = at(ma + 0.45 > half - 0.25 ? ma - 0.5 : ma + 0.45, 0.35);
  L.pot({ at: jp, y: P, seed: el.seed, kind: 'dark_pot', n: 1 }, ctx);
  if (rand() < 0.22 && deep > 1.8) L.figure({ at: at(ma, 1.5), y: P, rot: face, seed: el.seed, pose: 'squat', dress: 'wrap', cloth: rand() < 0.6 ? 'cloth_white' : 'cloth_ochre', skin: 'skin_medium' }, ctx);
  // a ladder up to the back room's roof on the other side of the door
  const top = tops[0];
  if (rand() < 0.55 && half > 1.7) {
    const len = (top - P + 0.45) / Math.cos(0.28), off = len * Math.sin(0.28) + 0.04;
    L.ladder({ at: at(-Math.min(1.3, half - 0.4), off), y: P, rot: Math.atan2(-bd[0], -bd[1]), len }, ctx);
  }
  // in the corners on the gate side: the great water jar, and a granary, the house altar or baskets
  const cA = at(-(half - 0.5), 2 * deep - 0.5), cB = at(half - 0.9, 2 * deep - 0.9);
  L.pot({ at: cA, y: P, seed: el.seed + 1, kind: 'water_pot', n: 1 + Math.floor(rand() * 2) }, ctx);
  const g = rand();
  if (g < 0.3 && half > 2 && deep > 2) { granary().emit(bag, cB[0], P, cB[1], 0, 1); col.circle(cB[0], cB[1], 0.8, P, P + 2.4); }
  else if (g < 0.6) altar().emit(bag, cB[0], P, cB[1], bd[0], bd[1]);
  else L.basket({ at: cB, y: P, seed: el.seed + 2, n: 2 }, ctx);
  // the flowers on the roofs ("others, both upper and lower, that contain conservatories of flowers": Cortés)
  if (rand() < 0.45) {
    const r = rooms[0].r, alongX = back === 'n' || back === 's', yr = top;
    if (rand() < 0.5) {
      const bed = alongX ? [r[0] + 0.4, (r[1] + r[3]) / 2 - 0.35, r[2] - 0.4, (r[1] + r[3]) / 2 + 0.35] : [(r[0] + r[2]) / 2 - 0.35, r[1] + 0.4, (r[0] + r[2]) / 2 + 0.35, r[3] - 0.4];
      roofBed(bag, bed, yr, el.seed);
    } else {
      const n = 3 + Math.floor(rand() * 4), Lr = alongX ? r[2] - r[0] - 1 : r[3] - r[1] - 1;
      for (let i = 0; i < n; i++) {
        const u = (alongX ? r[0] : r[1]) + 0.5 + (i + 0.5) * Lr / n, v = gate === 'n' || gate === 'w' ? (alongX ? r[1] : r[0]) + 0.55 : (alongX ? r[3] : r[2]) - 0.55;
        planter(i % 3).emit(bag, alongX ? u : v, yr, alongX ? v : u, 0, 1);
      }
    }
  }
}
/** Does room rect q lie on side f of I (its outer face on I's edge there)? */
function touches(q, I, f) {
  const e = 0.01;
  return f === 'n' ? q[1] < I[1] + e : f === 's' ? q[3] > I[3] - e : f === 'w' ? q[0] < I[0] + e : q[2] > I[2] - e;
}

/** The tecpan's frieze: a concentric disc — a white ring on a red disc with a white boss — facing +z. */
const tecpanDisc = () => carved('mx-tecpan-disc', (k) => {
  k.disc(R, 0, 0, 0, 0.42, 0.06, 16);
  k.disc(W, 0, 0, 0.06, 0.36, 0.05, 16, 0.24);
  k.disc(W, 0, 0, 0.06, 0.11, 0.07, 10);
});
/** The icpalli: the ruler's seat of woven reeds with its high back, on a mat. */
const icpalli = () => carved('mx-icpalli', (k) => {
  k.bx('reed_mat', -1.0, 1.0, 0, 0.03, -0.8, 1.0);
  k.bx('reed_mat', -0.45, 0.45, 0.03, 0.42, -0.4, 0.4);
  k.fz('reed_mat', [-0.45, 0.45, 0.42, 0.5], [-0.42, 0.42, 0.42, 1.55], -0.42, -0.3);
  k.bx('cloth_white', -0.4, 0.4, 0.42, 0.5, -0.32, 0.36);
  k.bx('hide_tan', -0.44, 0.44, 0.12, 0.38, 0.4, 0.42);                 // the jaguar skin over its front
  for (const sx of [-1, 1]) k.bx('hide_tan', sx * 0.47 - 0.03, sx * 0.47 + 0.03, 0.03, 1.4, -0.43, -0.37);
});

/**
 * tecpan: Moctezuma's palace { rect } (docs/settlements/tenochtitlan.md §11): on a low platform with
 * its stair from the plaza on the west, ranges of rooms round two courts — the first paved in
 * squares of two stones, the second a garden round a pool — porticoes of square piers under red
 * beams along the courts, doorways framed in red beams with mats inside, the discs across the
 * upper facades; over the west range an upper storey set back behind a terrace, its middle room
 * open on the terrace through piers, where the king sat on his reed seat.
 */
export function tecpan(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, Y = 1.0, H1 = 5.2, H2 = 4.4, red = 'timber_red';
  const zc = (z0 + z1) / 2;
  // the platform and the stair from the plaza
  B(bag, ST, el.rect, -0.3, Y - 0.08); B(bag, FL, [x0 + 0.05, z0 + 0.05, x1 - 0.05, z1 - 0.05], Y - 0.08, Y); col.rect(el.rect, -0.3, Y - 0.3); col.floor(el.rect, Y);
  const wr = 14, er = 12, nr = 12, sr = 12, mid = [zc - 5, zc + 5];
  const cA = [x0 + wr, z0 + nr, x1 - er, mid[0]], cB = [x0 + wr, mid[1], x1 - er, z1 - sr];
  const doorA = (cA[1] + cA[3]) / 2, xm = (cA[0] + cA[2]) / 2;
  const nst = 5;
  for (let i = 0; i < nst; i++) { const d = (nst - i) * 0.55; B(bag, ST, [x0 - d, doorA - 4, x0 - d + 0.55, doorA + 4], -0.3, Y * (i + 1) / nst); }
  col.ramp([x0 - nst * 0.55, doorA - 4, x0, doorA + 4], 0, Y, 'e');
  for (const s of [-1, 1]) B(bag, W, [x0 - nst * 0.55 - 0.1, doorA + s * 4 + (s < 0 ? -0.7 : 0), x0, doorA + s * 4 + (s < 0 ? 0 : 0.7)], -0.3, Y + 0.45);
  // the ranges of rooms: solid, their passages left open
  const passW = 3.4, passH = 3.6, y1 = Y + H1;
  const pdd = 3.2, hctx = { bag, col }, stairZ = [doorA - passW / 2 - 1.0 - Math.round(H1 / 0.25) * 0.3 - 0.4, doorA - passW / 2 - 0.6];
  // the ranges are hollow: two rows of rooms, doorways on the porticoes (palace.js)
  const block = (r, rows) => hollow(hctx, r, rows, { Y, y1, seed: Math.floor(r[0] * 7 + r[1] * 13) });
  const R1 = ['hall', 'sleep', 'hall', 'kitchen', 'store'], R2 = ['kitchen', 'store', 'store', 'workshop'], R3 = ['armoury', 'treasury', 'store', 'sleep'], R4 = ['hall', 'aviary', 'workshop', 'sleep'];
  // the red dado round the outer faces (broken at the passage from the plaza)
  B(bag, R, [x0 - 0.03, z0 - 0.03, x1 + 0.03, z0], Y, Y + 0.5); B(bag, R, [x0 - 0.03, z1, x1 + 0.03, z1 + 0.03], Y, Y + 0.5); B(bag, R, [x1, z0, x1 + 0.03, z1], Y, Y + 0.5);
  B(bag, R, [x0 - 0.03, z0, x0, doorA - 1.7], Y, Y + 0.5); B(bag, R, [x0 - 0.03, doorA + 1.7, x0, z1], Y, Y + 0.5);
  const passage = (r, alongX) => { B(bag, W, r, Y + passH, y1); col.floor(r, y1); B(bag, red, alongX ? [r[0] - 0.08, r[1] - 0.3, r[2] + 0.08, r[1] + 0.3] : [r[0] - 0.3, r[1] - 0.08, r[0] + 0.3, r[3] + 0.08], Y + passH - 0.3, Y + passH); B(bag, red, alongX ? [r[0] - 0.08, r[3] - 0.3, r[2] + 0.08, r[3] + 0.3] : [r[2] - 0.3, r[1] - 0.08, r[2] + 0.3, r[3] + 0.08], Y + passH - 0.3, Y + passH); };
  // west range, the passage from the plaza into the first court
  block([x0, z0, x0 + wr, doorA - passW / 2], [{ f: 'e', doors: null, avoid: [stairZ], roles: R1, back: R4 }]); block([x0, doorA + passW / 2, x0 + wr, z1], [{ f: 'e', doors: pierMids(cB, 'w', pdd), roles: R1, back: R4 }]); passage([x0, doorA - passW / 2, x0 + wr, doorA + passW / 2], false);
  for (const s of [-1, 1]) for (const xx of [x0, x0 + wr]) B(bag, red, [xx - 0.08, doorA + s * passW / 2 - (s < 0 ? 0.3 : 0), xx + 0.08, doorA + s * passW / 2 + (s < 0 ? 0 : 0.3)], Y, Y + passH);
  block([x1 - er, z0, x1, z1], [{ f: 'w', doors: [...pierMids(cA, 'e', pdd), ...pierMids(cB, 'e', pdd)], roles: R4, back: R2 }]);
  block([x0 + wr, z0, x1 - er, z0 + nr], [{ f: 's', doors: pierMids(cA, 'n', pdd), roles: R2, back: R1 }]); block([x0 + wr, z1 - sr, x1 - er, z1], [{ f: 'n', doors: pierMids(cB, 's', pdd), roles: R3, back: R2 }]);
  block([x0 + wr, mid[0], xm - passW / 2, mid[1]], [{ f: 'n', doors: pierMids(cA, 's', pdd, xm), roles: R4 }, { f: 's', doors: pierMids(cB, 'n', pdd, xm), roles: R1 }]); block([xm + passW / 2, mid[0], x1 - er, mid[1]], [{ f: 'n', doors: pierMids(cA, 's', pdd, xm), roles: R4 }, { f: 's', doors: pierMids(cB, 'n', pdd, xm), roles: R3 }]); passage([xm - passW / 2, mid[0], xm + passW / 2, mid[1]], true);
  for (const s of [-1, 1]) for (const zz of mid) B(bag, red, [xm + s * passW / 2 - (s < 0 ? 0.3 : 0), zz - 0.08, xm + s * passW / 2 + (s < 0 ? 0 : 0.3), zz + 0.08], Y, Y + passH);
  // the courts: the first paved in squares of dark and pale stone, the second a garden round a pool
  for (let i = 0; i < Math.floor((cA[2] - cA[0]) / 1.2); i++) for (let j = 0; j < Math.floor((cA[3] - cA[1]) / 1.2); j++) {
    const a = cA[0] + 0.1 + i * 1.2, b = cA[1] + 0.1 + j * 1.2;
    if (a + 1.2 > cA[2] - 0.05 || b + 1.2 > cA[3] - 0.05) continue;
    B(bag, (i + j) % 2 ? 'basalt' : 'stucco_pale', [a + 0.01, b + 0.01, a + 1.19, b + 1.19], Y - 0.02, Y + 0.025);
  }
  const pool = [(cB[0] + cB[2]) / 2 - 5, (cB[1] + cB[3]) / 2 - 4, (cB[0] + cB[2]) / 2 + 5, (cB[1] + cB[3]) / 2 + 4];
  for (const q of [[pool[0], pool[1], pool[2], pool[1] + 0.5], [pool[0], pool[3] - 0.5, pool[2], pool[3]], [pool[0], pool[1] + 0.5, pool[0] + 0.5, pool[3] - 0.5], [pool[2] - 0.5, pool[1] + 0.5, pool[2], pool[3] - 0.5]]) { B(bag, ST, q, Y - 0.05, Y + 0.45); col.rect(q, Y, Y + 0.45); }
  B(bag, 'basalt', [pool[0] + 0.5, pool[1] + 0.5, pool[2] - 0.5, pool[3] - 0.5], Y - 0.05, Y + 0.02);
  { const [a0, b0, a1, b1] = [pool[0] + 0.5, pool[1] + 0.5, pool[2] - 0.5, pool[3] - 0.5], wy = Y + 0.3; bag.add('water', fromTriangles([a0, wy, b0, a0, wy, b1, a1, wy, b1, a0, wy, b0, a1, wy, b1, a1, wy, b0])); }
  // flower beds along the garden's sides, inside its porticoes
  const pd = 3.2;
  for (const q of [[cB[0] + pd + 0.6, cB[1] + pd + 0.6, cB[2] - pd - 0.6, cB[1] + pd + 1.3], [cB[0] + pd + 0.6, cB[3] - pd - 1.3, cB[2] - pd - 0.6, cB[3] - pd - 0.6], [cB[0] + pd + 0.6, cB[1] + pd + 1.9, cB[0] + pd + 1.3, cB[3] - pd - 1.9], [cB[2] - pd - 1.3, cB[1] + pd + 1.9, cB[2] - pd - 0.6, cB[3] - pd - 1.9]]) roofBed(bag, q, Y, Math.floor(q[0] * 7 + q[1]));
  // the porticoes round both courts: square piers on stone bases, red beams over them, a flat roof
  // back to the rooms; doorways framed in red beams, mats laid in them
  const portico = (c, f, skip) => {
    const alongX = f === 'n' || f === 's', a0 = alongX ? c[0] : c[1] + pd + 0.45, a1 = alongX ? c[2] : c[3] - pd - 0.45, L = a1 - a0;
    const n = Math.max(2, Math.round(L / 3.3)), ph = 4.3;
    const line = band(c, f, pd - 0.45, pd + 0.35, a0, a1);
    for (let i = 0; i <= n; i++) {
      const u = a0 + 0.4 + i * (L - 0.8) / n;
      if (skip && Math.abs(u - skip) < 1.6) continue;
      const q = alongX ? [u - 0.4, line[1], u + 0.4, line[3]] : [line[0], u - 0.4, line[2], u + 0.4];
      B(bag, ST, alongX ? [q[0] - 0.08, q[1] - 0.08, q[2] + 0.08, q[3] + 0.08] : [q[0] - 0.08, q[1] - 0.08, q[2] + 0.08, q[3] + 0.08], Y, Y + 0.35);
      B(bag, W, q, Y + 0.35, Y + ph); col.rect(q, Y, Y + ph);
    }
    B(bag, red, band(c, f, pd - 0.5, pd + 0.4, a0, a1), Y + ph, Y + ph + 0.4);
    const roof = band(c, f, 0, pd + 0.45, a0, a1);
    B(bag, FL, roof, Y + ph + 0.4, Y + ph + 0.7); B(bag, W, band(c, f, pd + 0.15, pd + 0.45, a0, a1), Y + ph + 0.7, Y + ph + 1.0);
    // the doorways in the back wall under the portico, between the piers
    for (let i = 0; i < n; i++) {
      const u = a0 + 0.4 + (i + 0.5) * (L - 0.8) / n;
      if (skip && Math.abs(u - skip) < 2.4) continue;
      if (i % 2) continue;
      const dw = 1.5, dh = 2.6, P2 = (v0, v1, b0, b1) => band(c, f, v0, v1, b0, b1);
    }
  };
  for (const c of [cA, cB]) for (const f of ['n', 's', 'e']) portico(c, f, c === cA && f === 's' ? xm : c === cB && f === 'n' ? xm : null);
  portico(cB, 'w', null);
  // the discs across the upper facades, outside
  const discs = (a, b, zf, dirx, dirz, y) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 1.15);
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    B(bag, R, [Math.min(a[0], b[0]) + (dirx > 0 ? 0 : dirx < 0 ? -0.04 : 0), Math.min(a[1], b[1]) + (dirz < 0 ? -0.04 : 0), Math.max(a[0], b[0]) + (dirx > 0 ? 0.04 : 0), Math.max(a[1], b[1]) + (dirz > 0 ? 0.04 : 0)], y - 0.55, y + 0.55);
    for (let i = 0; i < n; i++) { const s = (i + 0.5) * L / n; tecpanDisc().emit(bag, a[0] + ux * s + dirx * 0.04, y, a[1] + uz * s + dirz * 0.04, dirx, dirz); }
  };
  const yd = y1 - 0.65;
  discs([x0, z0 + 1], [x0, doorA - passW / 2 - 0.5], 0, -1, 0, yd); discs([x0, doorA + passW / 2 + 0.5], [x0, z1 - 1], 0, -1, 0, yd);
  discs([x0 + 1, z0], [x1 - 1, z0], 0, 0, -1, yd); discs([x0 + 1, z1], [x1 - 1, z1], 0, 0, 1, yd); discs([x1, z0 + 1], [x1, z1 - 1], 0, 1, 0, yd);
  // the parapets
  for (const q of [[x0, z0, x1, z0 + 0.3], [x0, z1 - 0.3, x1, z1], [x1 - 0.3, z0 + 0.3, x1, z1 - 0.3]]) B(bag, W, q, y1, y1 + 0.5);
  // the upper storey over the west range, set back behind a terrace on the court side; its middle
  // room open on the terrace through piers, the king's seat in it
  const ux1 = x0 + wr - 4.2, hz0 = zc - 13, hz1 = zc + 13, y2 = y1 + H2;
  const ublock = (r) => { B(bag, W, r, y1, y2); col.rect(r, y1, y2); col.floor(r, y2); };
  ublock([x0, z0 + 0.3, ux1, hz0]); ublock([x0, hz1, ux1, z1 - 0.3]);
  ublock([x0, hz0, x0 + 0.8, hz1]);
  for (const [a, b] of [[hz0, hz0 + 0.6], [hz1 - 0.6, hz1]]) ublock([x0 + 0.8, a, ux1, b]);
  col.floor([x0 + 0.8, hz0 + 0.6, ux1, hz1 - 0.6], y1);
  const np = 6;
  for (let i = 1; i < np; i++) { const z = hz0 + i * (hz1 - hz0) / np; B(bag, ST, [ux1 - 0.95, z - 0.47, ux1 + 0.05, z + 0.47], y1, y1 + 0.3); B(bag, W, [ux1 - 0.85, z - 0.38, ux1 - 0.05, z + 0.38], y1 + 0.3, y2 - 0.4); col.rect([ux1 - 0.85, z - 0.38, ux1 - 0.05, z + 0.38], y1, y2); }
  B(bag, red, [ux1 - 0.95, hz0 + 0.6, ux1 + 0.05, hz1 - 0.6], y2 - 0.4, y2);
  B(bag, FL, [x0 + 0.8, hz0 + 0.6, ux1 - 0.95, hz1 - 0.6], y2 - 0.3, y2);
  B(bag, FL, [x0 - 0.1, z0 + 0.2, ux1 + 0.15, z1 - 0.2], y2, y2 + 0.25); col.floor([x0, z0, ux1, z1], y2 + 0.25);
  for (const q of [[x0 - 0.1, z0 + 0.2, ux1 + 0.15, z0 + 0.45], [x0 - 0.1, z1 - 0.45, ux1 + 0.15, z1 - 0.2], [x0 - 0.1, z0 + 0.45, x0 + 0.15, z1 - 0.45], [ux1 - 0.1, z0 + 0.45, ux1 + 0.15, z1 - 0.45]]) B(bag, W, q, y2 + 0.25, y2 + 0.7);
  discs([x0, z0 + 1.5], [x0, z1 - 1.5], 0, -1, 0, y2 - 0.6);
  discs([ux1, z0 + 1.2], [ux1, hz0 - 0.3], 0, 1, 0, y2 - 0.6); discs([ux1, hz1 + 0.3], [ux1, z1 - 1.2], 0, 1, 0, y2 - 0.6);
  // in the hall: mats over the floor, the dais and the seat facing the terrace, braziers
  B(bag, 'reed_mat', [x0 + 1.2, hz0 + 1.2, ux1 - 1.4, hz1 - 1.2], y1, y1 + 0.02);
  B(bag, W, [x0 + 1.0, zc - 2.2, x0 + 3.6, zc + 2.2], y1, y1 + 0.45); B(bag, R, [x0 + 3.55, zc - 2.2, x0 + 3.62, zc + 2.2], y1 + 0.05, y1 + 0.4);
  col.rect([x0 + 1.0, zc - 2.2, x0 + 3.6, zc + 2.2], y1, y1 + 0.45);
  icpalli().emit(bag, x0 + 2.2, y1 + 0.45, zc, 1, 0);
  for (const s of [-1, 1]) bag.add('pottery_dark', lathe([[0.25, 0], [0.12, 0.25], [0.12, 0.6], [0.35, 0.75], [0.38, 0.95], [0.3, 0.95], [0.001, 0.85]], 12, null, x0 + 4.6, y1, zc + s * 3.2));
  // the stair from the first court up to the terrace, against the west range
  const sn = Math.round(H1 / 0.25), sl = sn * 0.3, sz1 = doorA - passW / 2 - 1.0;
  for (let i = 0; i < sn; i++) { const q = [x0 + wr, sz1 - (i + 1) * 0.3, x0 + wr + 2.4, sz1 - i * 0.3], yt = Y + (i + 1) * H1 / sn; B(bag, W, q, Y, yt - 0.06); B(bag, ST, [q[0], q[1], q[2] + 0.03, q[3] + 0.03], yt - 0.06, yt); }
  col.ramp([x0 + wr, sz1 - sl, x0 + wr + 2.4, sz1], Y, y1, 'n');
}

/** A skull as it hung on the rack or was set in the tower's mortar, facing +z: the cranium, the face, the dark sockets. */
export const skull = () => carved('mx-skull', (k) => {
  k.geo('ivory', lathe([[0.001, -0.07], [0.07, -0.03], [0.08, 0.03], [0.055, 0.08], [0.001, 0.095]], 7).scale(0.92, 1, 1.12).translate(0, 0.02, -0.01));
  k.fz('ivory', [-0.058, 0.058, -0.075, 0.015], [-0.048, 0.048, -0.07, 0.01], 0.03, 0.098);
  for (const sx of [-1, 1]) k.bx('paint_minoan_black', sx * 0.027 - 0.019, sx * 0.027 + 0.019, -0.012, 0.012, 0.085, 0.104);
  k.fy('paint_minoan_black', [-0.009, 0.009, 0.086, 0.104], [-0.004, 0.004, 0.088, 0.102], -0.045, -0.02);
});

/**
 * tzompantli: the Huey Tzompantli { rect (north–south), h (the rack) } (docs/settlements/tenochtitlan.md
 * §11): a low stuccoed platform, a stair on its west side; across it rows of timber posts 80 cm apart
 * carrying the poles on which the skulls were strung through the temples; at its north end the
 * round tower of skulls set in lime mortar, facing in and out.
 */
/** Lay a carving as instances (one prototype per piece, whatever its turn): for the thousands of skulls. */
function emitInstanced(bag, kit, x, y, z, dx, dz) {
  const m = new Matrix4().makeRotationY(Math.atan2(dx, dz)).setPosition(x, y, z);
  for (const [mat, list] of kit.m) for (const g of list) bag.addInstance(mat, g.clone(), m);
}
export function tzompantli(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, P = 0.7, xc = (x0 + x1) / 2, Hh = el.h ?? 4.6;
  bag.add(W, frustum(el.rect, -0.2, P, 0.12, 0.12, 0.12, 0.12)); col.rect(el.rect, 0, P - 0.25); col.floor([x0 + 0.12, z0 + 0.12, x1 - 0.12, z1 - 0.12], P);
  B(bag, 'stucco_pale', [x0 + 0.14, z0 + 0.14, x1 - 0.14, z1 - 0.14], P, P + 0.02);
  // the stair on the west, in the middle
  const zm = (z0 + z1) / 2 + 4;
  for (let i = 0; i < 3; i++) B(bag, W, [x0 - 0.9 + i * 0.3, zm - 2.5, x0 + 0.15, zm + 2.5], -0.2, P * (i + 1) / 3);
  col.ramp([x0 - 0.9, zm - 2.5, x0, zm + 2.5], 0, P, 'e');
  // the tower of skulls at the north end
  const tc = [xc, z0 + 4.2], Ro = 3.0, Ri = 1.44, th = 2.4, yt = P + 0.02, sk = skull();
  bag.add('lime_plaster', lathe([[Ri + 0.06, 0], [Ro - 0.06, 0], [Ro - 0.08, th], [Ri + 0.08, th], [Ri + 0.06, 0]], 40, null, tc[0], yt, tc[1]));
  col.circle(tc[0], tc[1], Ro, yt, yt + th);
  const rows = Math.floor(th / 0.19);
  for (let r = 0; r < rows; r++) {
    const y = yt + 0.1 + r * 0.19;
    for (const [R0, out] of [[Ro - 0.07, 1], [Ri + 0.07, -1]]) {
      const n = Math.floor(2 * Math.PI * R0 / 0.2), off = (r % 2) * 0.5;
      for (let i = 0; i < n; i++) { const a = (i + off) * 2 * Math.PI / n, dx = Math.cos(a), dz = Math.sin(a); emitInstanced(bag, sk, tc[0] + dx * (R0 - out * 0.075), y, tc[1] + dz * (R0 - out * 0.075), dx * out, dz * out); }
    }
  }
  for (let i = 0; i < 26; i++) { const a = i * 2 * Math.PI / 26, R0 = (Ri + Ro) / 2 + 0.25 * Math.sin(i * 2.3); emitInstanced(bag, sk, tc[0] + Math.cos(a) * R0, yt + th + 0.08, tc[1] + Math.sin(a) * R0, Math.cos(a), Math.sin(a)); }
  // the rack: rows of posts 80 cm apart along the platform, the poles between them, the skulls on the poles
  const ra = tc[1] + Ro + 1.6, rb = z1 - 1.2, span = 2.4, nseg = Math.max(1, Math.round((rb - ra) / span)), lv = [1.35, 1.9, 2.45, 3.0, 3.55];
  for (const x of [xc - 0.8, xc, xc + 0.8]) {
    for (let i = 0; i <= nseg; i++) { const z = ra + i * (rb - ra) / nseg; bag.add('timber', lathe([[0.125, 0], [0.11, Hh], [0.001, Hh + 0.04]], 8, null, x, P, z)); col.circle(x, z, 0.14, P, P + Hh); }
    B(bag, 'timber', [x - 0.09, ra - 0.2, x + 0.09, rb + 0.2], P + Hh - 0.25, P + Hh - 0.07);
    for (const y of lv) {
      const g = lathe([[0.025, 0], [0.025, rb - ra], [0.001, rb - ra]], 6); g.rotateX(Math.PI / 2); g.translate(x, P + y, ra); bag.add('timber', g);
      const n = Math.floor((rb - ra) / 0.215);
      for (let i = 0; i < n; i++) {
        const z = ra + (i + 0.5) * (rb - ra) / n;
        if (Math.abs(((z - ra) / ((rb - ra) / nseg)) % 1 - 0) < 0.06 || Math.abs(((z - ra) / ((rb - ra) / nseg)) % 1 - 1) < 0.06) continue;      // clear of the posts
        emitInstanced(bag, sk, x, P + y - 0.01, z, x < xc ? -1 : x > xc ? 1 : (i % 2 ? 1 : -1), 0);
      }
    }
  }
}

/**
 * chinampa_house: a farmer's house on a chinampa { c [x, z], y, door ('e' | 'w'), seed }: one room 3.4 × 4.6 m of
 * wattle and daub on a footing of stones, a peaked roof thatched with straw over gables of daub, the door in the
 * middle of a long side; inside the hearth of three stones with the comal, ollas, the metate, sleeping mats, the
 * water jar, a basket; before it the cuezcomatl granary, maguey and a nopal [Florentine Codex via ancient-history-
 * sites: wattle and daub, peaked roofs thatched with straw, the hearth and smoke hole, the comal, the metate, the
 * mats; the arrangement inferred].
 */
export function chinampaHouse(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 0, rand = rng(el.seed || 3), hx = 1.7, hz = 2.3, t = 0.16, H = 2.0, ridge = 3.9, L = STYLES.life.elements;
  const sx = el.door === 'w' ? -1 : 1, dw = 0.5, dh = 1.75;
  B(bag, 'andesite', [cx - hx - 0.08, cz - hz - 0.08, cx + hx + 0.08, cz + hz + 0.08], y - 0.15, y + 0.25);                  // the footing
  B(bag, 'mud_plaster', [cx - hx + t, cz - hz + t, cx + hx - t, cz + hz - t], y + 0.25, y + 0.27);                       // the beaten floor
  col.floor([cx - hx, cz - hz, cx + hx, cz + hz], y + 0.27);
  const yw = y + 0.25, W = (r) => { B(bag, 'mud_plaster', r, yw, y + H); col.rect(r, yw, y + H); };
  W([cx - hx, cz - hz, cx + hx, cz - hz + t]); W([cx - hx, cz + hz - t, cx + hx, cz + hz]);
  const back = sx > 0 ? cx - hx : cx + hx - t; W([back, cz - hz + t, back + t, cz + hz - t]);
  const fr = sx > 0 ? cx + hx - t : cx - hx; W([fr, cz - hz + t, fr + t, cz - dw]); W([fr, cz + dw, fr + t, cz + hz - t]);
  B(bag, 'mud_plaster', [fr, cz - dw, fr + t, cz + dw], y + 0.25 + dh, y + H);
  B(bag, 'timber', [fr - 0.03, cz - dw - 0.2, fr + t + 0.03, cz + dw + 0.2], y + 0.25 + dh - 0.1, y + 0.25 + dh);          // the lintel
  // the gables (daub over the end walls, up to the ridge) and the thatch: two thick slopes from the eaves over the long sides
  const k = new Kit(), ov = 0.45, ye = y + H - 0.25;
  for (const s of [-1, 1]) {
    const z0 = s < 0 ? -hz : hz - t, z1 = z0 + t;
    k.hex('mud_plaster', [[-hx, y + H, z0], [hx, y + H, z0], [hx, y + H, z1], [-hx, y + H, z1], [0, ridge + y - 0.25, z0], [0, ridge + y - 0.25, z0], [0, ridge + y - 0.25, z1], [0, ridge + y - 0.25, z1]]);
  }
  for (const s of [-1, 1]) {
    const xe = s * (hx + ov), ye2 = ye - ov * (ridge - H) / hx, th = 0.28;
    k.hex('thatch', [[xe, ye2, -hz - ov], [0, y + ridge - th, -hz - ov], [0, y + ridge - th, hz + ov], [xe, ye2, hz + ov], [xe, ye2 + th, -hz - ov], [0, y + ridge, -hz - ov], [0, y + ridge, hz + ov], [xe, ye2 + th, hz + ov]]);
  }
  k.seg('thatch', [0, y + ridge - 0.05, -hz - ov - 0.05], [0, y + ridge - 0.05, hz + ov + 0.05], 0.16, 0.12);   // the ridge bundle
  k.emit(bag, cx, 0, cz, 0, 1);
  col.rect([cx - hx - ov, cz - hz - ov, cx + hx + ov, cz + hz + ov], y + H + 0.1, y + ridge);
  // inside: the hearth in the back corner, the soot on the thatch over it, the pots, the metate, the beds, the water jar
  const f = y + 0.27, bx = cx - sx * (hx - t - 0.75);
  put(bag, hearthKit('andesite'), bx, f, cz - hz + t + 0.75, 0); col.circle(bx, cz - hz + t + 0.75, 0.45, f, f + 0.3);
  put(bag, ollaKit(), bx + sx * 0.85, f, cz - hz + t + 0.45, 0);
  put(bag, metateKit(), cx + sx * 0.6, f, cz - hz + t + 0.55, 0);
  put(bag, bedKit(rand() < 0.6 ? 'cloth_white' : 'cloth_ochre', 'cloth_red'), cx - sx * (hx - t - 0.55), f, cz + 0.9, Math.PI / 2);
  put(bag, waterJarKit(), cx + sx * (hx - t - 0.4), f, cz + hz - t - 0.45, 0); col.circle(cx + sx * (hx - t - 0.4), cz + hz - t - 0.45, 0.33, f, f + 0.8);
  L.basket({ at: [cx + sx * 0.2, cz + hz - t - 0.4], y: f, seed: el.seed, n: 1 }, ctx);
  // before the door: the granary, the maguey and a nopal, a woman at work or a man with his coa
  const gx = cx + sx * (hx + 2.4), gz = cz - hz + 0.6;
  granary().emit(bag, gx, y, gz, 0, 1); col.circle(gx, gz, 0.8, y, y + 2.4);
  maguey(bag, col, cx + sx * (hx + 1.6), y, cz + hz + 1.4, 0.75, rand() < 0.5 ? 0 : Math.PI / 2, el.seed % 3);
  maguey(bag, col, cx - sx * (hx + 1.4), y, cz + hz + 0.9, 0.6, rand() < 0.5 ? Math.PI : -Math.PI / 2, (el.seed + 1) % 3);
  if (rand() < 0.6) nopal(bag, col, cx - sx * (hx + 1.6), y, cz - hz - 0.8, 0.85, 0, el.seed % 3);
  if (rand() < 0.5) L.figure({ at: [cx + sx * (hx + 1.1), cz + 0.6], y, rot: sx > 0 ? -Math.PI / 2 : Math.PI / 2, seed: el.seed, pose: 'kneel', dress: 'wrap', cloth: 'cloth_white', cloth2: 'cloth_ochre', skin: 'skin_medium', hair: 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: 'none' }, ctx);
}
