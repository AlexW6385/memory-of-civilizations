// Barcelona by night about 1910 (docs/settlements/barcelona.md §14.2): gas and the first electric light. The crossings had gas lamps on cast-iron columns, the
// Passeig de Gràcia its bench-lamps of 1906, the shops stood lit behind their plate glass into the evening (the Spanish hours: open until eight or nine), the
// chemists with the night's duty lit all night, the flats lit their rooms by gas, oil and here and there a bulb, the trams ran lit with their lamps at both
// ends, the florists of the market's north pavement sold by lantern (the market's florists are open "day and night": the dossier's §5d), the works' gate had its
// watchman's fire-basket. Each is made here of geometry in one material, `halo` (palette.js): light ADDED over what is behind it, at night only (ENV.night), no
// light, no shadow, no collision; the shape of each piece is carried by its normals (the scheme of Ming Suzhou's nightlight.js, of which `Halo` is a copy: that
// file imports Suzhou's layout). Where the real fronts stand is read off the builders' own numbers (styles/modernisme blockShops, blockWindows, blockPortals), so a
// glow is on a window that is there. The halo has one warm colour: gas and the bulb are not told apart [inferred: the electric light was yellower than today's
// by its carbon filament, and a halo is a glow, not a measure]. Pure functions of places: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { blockShops, blockWindows, blockPortals } from '../../styles/modernisme/index.js';
import { nightSites } from './town.js';
import { RADIUS, GRACIA_X, CASA, BATLLO, height, bancsFanals } from './layout.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from numbers alone. */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 7.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 5.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material (a copy of Ming Suzhou's `Halo`, as London's and Paris's). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc (ellipse) at c spanned by the unit axes U and V, semi-axes su and sv, in rings R of brightness F (carried by the normal's y). */
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f, nh[1] * q] : [Math.cos(a) * q, f, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane (the paving) at height y; yaw turns its first semi-axis r from +x toward −z. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, F = [1, 0.42, 0]) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, F, [0, 0.5, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  /** A pane on a wall: centred at p = [x, z], half width w along u = [x, z], from y0 to y1, facing n, out by `out`, margin m, brightness f. */
  pane(p, u, n, w, y0, y1, f, out = 0, m = 0.1) {
    const a = [p[0] - u[0] * (w - m) + n[0] * out, y0 + m, p[1] - u[1] * (w - m) + n[1] * out], b = [p[0] + u[0] * (w - m) + n[0] * out, y0 + m, p[1] + u[1] * (w - m) + n[1] * out];
    this.quad(a, b, [b[0], y1 - m, b[2]], [a[0], y1 - m, a[2]], n, f);
  }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}

// ── what burns where ────────────────────────────────────────────────────────────────────────────────────
/** The share of a floor's windows that are lit at night: the entresol's offices and workrooms, the principal floor's owners, the tenants above (fewer higher up: the poor lit one lamp). */
const SHARE = { 1: 0.45, 2: 0.6, 3: 0.4, 4: 0.34, 5: 0.28, 6: 0.22, 7: 0.18 };
/** Shops that stood lit at night by trade (the chemist with the night's duty always; the baker's, the grocer's and the wine shop's late; the ironmonger's and the draper's early shut). */
const SHOP_LIT = { farmacia: 0.95, forn: 0.8, colmado: 0.85, bodega: 0.9, perruqueria: 0.6, sabater: 0.45, draperia: 0.4, ferreteria: 0.35 };

let CACHE = null;
/** Every pane and flame of the town as arrays of plain data (computed once): the halos are made from it, the sound map and the tests read it. */
export function lights() {
  if (CACHE) return CACHE;
  const S = nightSites(), R2 = (RADIUS - 40) ** 2, out = { windows: [], shops: [], portals: [], lamps: [], pools: [], stalls: S.flowers, trams: S.trams, kiosks: S.kiosks, gate: S.gate, benches: [] };
  for (const el of S.els) {
    if (el.c[0] ** 2 + el.c[1] ** 2 > R2) continue;
    for (const pl of blockWindows(el)) pl.wins.forEach((w, i) => {
      if (hash(pl.seed, w.bay * 11 + w.f, 5 + i) >= (SHARE[w.f] ?? 0.2)) return;
      out.windows.push({ ...w, f: w.f, b: 0.4 + 0.3 * hash(pl.seed, w.bay, w.f + 9), poor: pl.seed % 7 === 0 });
    });
    for (const sh of blockShops(el)) {
      if (hash(sh.seed, 3, 1) >= (SHOP_LIT[sh.trade] ?? 0.5)) continue;
      out.shops.push({ trade: sh.trade, door: sh.door, n: sh.n, u: sh.u, flip: sh.flip, ends: sh.ends, bw: sh.bw, y: sh.y, seed: sh.seed });
    }
    if (el.portals && el.shops) for (const q of blockPortals(el)) out.portals.push(q);
  }
  for (const [x, z, y] of S.fanals) out.lamps.push({ x, z, y, h: 3.9, r: 1.5, pool: 3.4 });
  for (const [x, z] of bancsFanals()) { const y = height(x, z); out.benches.push({ x, z, y }); }
  return (CACHE = out);
}

// ── the halos ───────────────────────────────────────────────────────────────────────────────────────────
export function halos() {
  const H = new Halo(), L = lights();
  // the gas lamps of the crossings: the lantern's glow and the pool on the paving
  for (const l of L.lamps) { H.ball(l.x, l.y + l.h, l.z, l.r); H.floor(l.x, l.y + 0.17, l.z, l.pool, l.pool * 0.9, 0, 8); }
  // the arrival's corner lamp (arrival.js street_lamp, 4.2 m)
  { const x = 219.15 + 1.0, z = -92 + 35 - 3.2, y = height(x, z); H.ball(x, y + 3.7, z, 1.5); H.floor(x, y + 0.17, z, 3.4, 3.0, 0, 8); }
  // Falqués's bench-lamps of the Passeig: the crown lantern and four on arms, a wide pool (the avenue's best light)
  for (const b of L.benches) {
    H.ball(b.x, b.y + 6.9, b.z, 1.3);
    for (const [dx, dz] of [[0.8, 0], [-0.8, 0], [0, 0.8], [0, -0.8]]) H.ball(b.x + dx, b.y + 5.75, b.z + dz, 0.8);
    H.floor(b.x, b.y + 0.1, b.z, 4.6, 4.0, 0, 8);
  }
  // the works' gate: the watchman's brazier (the basket's coals at 0.85 m) and its flicker on the hoarding and the stones
  { const [x, z, y] = L.gate; H.ball(x, y + 0.95, z, 1.1); H.floor(x, y + 0.08, z, 3.0, 2.6, 0, 8, [1, 0.5, 0]); }
  // the newspaper kiosks (an oil lamp in each) and the florists' lanterns on the market's pavement
  for (const [x, z, y] of L.kiosks) { H.ball(x, y + 1.35, z, 0.9); H.floor(x, y + 0.1, z, 2.4, 2.4, 0, 6); }
  for (const [x, z, y] of L.stalls) { H.ball(x, y + 1.5, z + 0.4, 0.6); H.floor(x, y + 0.1, z + 0.4, 1.6, 1.4, 0, 6); }
  // the trams: a lamp at each platform (the dashes carry lamp and number board), the saloon's lit windows on both sides (the closed cars)
  for (const t of L.trams) {
    const a = [-Math.sin(t.rot), -Math.cos(t.rot)], s = [Math.cos(t.rot), -Math.sin(t.rot)];       // along the car's axis, across it (its right)
    for (const e of [-1, 1]) { H.ball(t.at[0] + a[0] * e * 4.5, t.y + 2.35, t.at[1] + a[1] * e * 4.5, 0.75); }
    if (t.kind === 'closed') for (const sg of [-1, 1]) H.pane([t.at[0] + s[0] * sg * 1.04, t.at[1] + s[1] * sg * 1.04], a, [s[0] * sg, s[1] * sg], 3.1, t.y + 1.45, t.y + 2.45, 0.5, 0, 0.05);
    else for (const sg of [-1, 1]) H.ball(t.at[0] + a[0] * sg * 1.8, t.y + 2.7, t.at[1] + a[1] * sg * 1.8, 0.55);                                      // (an open car's roof lamps)
  }
  // the shops' windows: lit glass between the piers, a pool on the pavement before each
  for (const sh of L.shops) {
    const [a0, a1] = sh.ends, u = sh.u, n = sh.n, W = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]), nb = Math.max(1, Math.round(W / sh.bw)), yS = sh.y;
    const dS = sh.flip ? W - sh.bw / 2 : sh.bw / 2;
    for (let k = 0; k < nb; k++) {
      const s0 = k * sh.bw + (k === 0 ? 0.3 : 0.22), s1 = (k + 1) * sh.bw - (k === nb - 1 ? 0.3 : 0.22), dk = k === Math.floor(dS / sh.bw);
      const parts = dk ? [[s0, dS - 0.86], [dS + 0.86, s1]] : [[s0, s1]];
      for (const [p0, p1] of parts) {
        if (p1 - p0 < 0.4) continue;
        const f = 0.55 + 0.3 * hash(sh.seed, k, 2), m = (p0 + p1) / 2;
        H.pane([a0[0] + u[0] * m, a0[1] + u[1] * m], u, n, (p1 - p0) / 2, yS + 1.0, yS + 3.2, f, 0.03, 0.06);
        H.floor(a0[0] + u[0] * m + n[0] * 1.3, yS + 0.12, a0[1] + u[1] * m + n[1] * 1.3, Math.min(1.9, (p1 - p0) / 2 + 0.7), 1.2, Math.atan2(-u[1], u[0]), 6);
      }
    }
    // the open door: the room's light on the doorstep
    H.floor(sh.door[0] + n[0] * 1.2, yS + 0.12, sh.door[1] + n[1] * 1.2, 1.1, 1.3, 0, 6);
  }
  // the portals of the houses with a vestibule: the stair lamp seen through the open door (the doorway 1.9 m wide, the leaves back against the walls)
  for (const q of L.portals) {
    const n = q.face, u = q.u;
    H.pane(q.door, u, n, 0.9, q.yS + 0.4, q.yS + 3.6, 0.5, 0.05, 0.05);
    H.floor(q.door[0] + n[0] * 1.2, q.yS + 0.1, q.door[1] + n[1] * 1.2, 1.2, 1.4, 0, 6);
  }
  // the windows of the flats (and the entresols): a share of them by the floor, a hash of the plot and the bay
  for (const w of L.windows) H.pane(w.p, w.u, w.n, w.w, w.y0, w.y1, w.poor ? w.b * 0.7 : w.b, 0.01, 0.12);
  // the house with the café (layout.js CASA: 16 m of the Passeig's west side, front toward +x): the café's two arched windows and its door, the confectioner's window,
  // the stair lamp, the flat's three windows on the principal floor
  {
    const { fx, z0 } = CASA, y = height(fx - 9, z0 + 8), u = [0, 1], n = [1, 0], x = fx + 0.06;
    for (const zc of [z0 + 1.6, z0 + 8.0, z0 + 14.4]) H.pane([x, zc], u, n, 1.1, y + 0.9, y + 3.3, 0.7, 0, 0.06);
    H.pane([x, z0 + 4.8], u, n, 0.8, y + 0.4, y + 3.0, 0.55, 0, 0.06);
    H.pane([x, z0 + 11.2], u, n, 0.85, y + 0.4, y + 3.4, 0.5, 0, 0.06);
    for (const zc of [z0 + 1.6, z0 + 4.8, z0 + 8.0]) H.pane([x, zc], u, n, 0.75, y + 8.5, y + 10.6, 0.55, 0, 0.1);
    for (const zc of [z0 + 3.2, z0 + 6.4]) H.floor(fx + 1.6, y + 0.1, zc, 2.0, 1.6, 0, 6);
  }
  // Casa Batlló (layout.js BATLLO: its front on the Passeig's west side facing +x, bays at 2.2, 5.8, 9.3 and 12.8 m from its south end, floors of windows at 9.9, 13.1,
  // 16.3 and 19.5 m): the noble floor lit through its coloured glass, the floors above a window in three
  {
    const y = height(...BATLLO.a), a = BATLLO.a, u = [0, 1], n = [1, 0], x = a[0] + 0.21;
    [2.2, 5.8, 9.3, 12.8].forEach((s, bi) => [9.9, 13.1, 16.3, 19.5].forEach((yf, fi) => {
      if (fi > 0 && hash(7, bi, fi) > 0.55) return;
      const ww = fi === 0 && (bi === 1 || bi === 2) ? 1.6 : 1.2;
      H.pane([x, a[1] + s], u, n, ww / 2, y + yf + 0.35, y + yf + 2.6, fi === 0 ? 0.75 : 0.5, 0, 0.1);
    }));
    H.floor(a[0] + 2.6, y + 0.1, a[1] + 7.5, 3.4, 6.5, 0, 8);
  }
  return H;
}

/** { t: 'barcelona_night' }: the halos of the whole town, in one geometry of one material. */
function barcelonaNight(el, ctx) { halos().flush(ctx.bag); }
Object.assign(STYLES.modernisme.elements, { barcelona_night: barcelonaNight });

/** The night plan: one plan, one material's draw. */
export function nightPlan() {
  return { id: 'barcelona-night', style: 'modernisme', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 46], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: [{ t: 'barcelona_night' }], nocollide: true };
}
void GRACIA_X;
