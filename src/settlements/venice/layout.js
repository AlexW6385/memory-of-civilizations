// Venice about 1500 — the layout (docs/settlements/venice.md §2): islands in the lagoon. The Piazza
// San Marco with the basilica at its east end, the campanile, the Procuratie along its sides; the
// Piazzetta opening south to the water between the two columns, the Doge's Palace on its east side;
// the Grand Canal curving through the west; smaller canals; houses on every island; the lagoon
// round the disc's edge. Pure data. +x east, +z south (the basin of San Marco to the south).

export const RADIUS = 380;
export const SEA = -2.5, RIM = -10, GROUND = 1.2;
export const PIAZZA = [-150, -40, 25, 30];
export const PIAZZETTA = [25, 30, 76, 118];
export const BASILICA = { c: [62, -5], s: 34, w: 22 };
export const CAMPANILE = [12, 22];
export const CLOCK = [6, -50, 14.5, -40];                      // the Clock Tower (1496–99) over the way into the Merceria
export const MERCERIA = [4, -120, 17, -48];                    // the first stretch of the Merceria behind it, kept clear
export const PALACE = [80, 32, 150, 100];
export const BASIN_Z = 122;
// the Rialto (docs/settlements/venice.md §4): the timber bridge across the Grand Canal where it runs north–south, the
// market (the Erberia and the fish market) on the campo at its west foot, a landing at its east foot
export const RIALTO = { x: -195.83, z: -30, span: 38.94 };
export const MARKET = [-262, -62, -219, -2];
export const RIALTO_CLEAR = [MARKET, [-174, -40, -150, -20]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); }
export const GRAND = [[-120, 125], [-190, 40], [-200, -80], [-140, -190], [-160, -300], [-260, -380]];
export const CANALS = [[[-30, 125], [-40, -60], [-20, -200]], [[100, -40], [160, -160]], [[-300, 60], [-380, -60]], [[-60, -120], [-190, -120]], [[150, -40], [300, -60]]];
const pathD = (x, z, p) => { let d = Infinity; for (let i = 0; i + 1 < p.length; i++) d = Math.min(d, segDist(x, z, p[i], p[i + 1])); return d; };
/** How far into water (negative inside a canal or the basin). */
export function wet(x, z) {
  const d = Math.min(pathD(x, z, GRAND) - 20, ...CANALS.map((p) => pathD(x, z, p) - 5), BASIN_Z - z, RADIUS - 60 - Math.hypot(x, z));
  return inRect(PIAZZA, x, z) || inRect(PIAZZETTA, x, z, 0) && z < BASIN_Z - 2 ? Math.max(d, 1) : d;
}
export function height(x, z) {
  const w = wet(x, z), r = Math.hypot(x, z);
  const h = w > 1.5 ? GROUND : w > -1 ? GROUND + (SEA - 2 - GROUND) * smooth(1.5, -1, w) : SEA - 2;
  return r > RADIUS - 60 ? h + (RIM - h) * smooth(RADIUS - 60, RADIUS - 10, r) : h;
}
export const inWater = (x, z) => wet(x, z) < -0.5;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS0 = null, LOTS = null;
/** The houses as first drawn, before the palazzi, the bridges and the squero clear their ground (the bands are found from these). */
function baseLots() {
  if (LOTS0) return LOTS0;
  let LOTS = [];
  const rand = rng(1500);
  for (let x = -RADIUS + 40; x < RADIUS - 40; x += 11) for (let z = -RADIUS + 40; z < BASIN_Z; z += 11) {
    const w = 8 + rand() * 2, d = 8 + rand() * 2;
    if ([[x, z], [x + w, z], [x, z + d], [x + w, z + d]].some(([a, b]) => wet(a, b) < 2.5)) continue;
    const cx = x + w / 2, cz = z + d / 2;
    if (inRect(PIAZZA, cx, cz, 8) || inRect(PIAZZETTA, cx, cz, 6) || inRect(PALACE, cx, cz, 6) || inRect([BASILICA.c[0] - 50, BASILICA.c[1] - 35, BASILICA.c[0] + 45, BASILICA.c[1] + 35], cx, cz) || Math.abs((cx + 400) % 44 - 22) < 2 || rand() < 0.1) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: GROUND, foot: GROUND - 0.5, storeys: 3 + (rand() < 0.5 ? 1 : 0), front: rand() < 0.5 ? 'n' : 's', plaster: true });
  }
  LOTS = LOTS.filter((l) => !inRect(MERCERIA, (l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2, 4)
    && !RIALTO_CLEAR.some((r) => l.rect[2] > r[0] && l.rect[0] < r[2] && l.rect[3] > r[1] && l.rect[1] < r[3]));   // after the draw: the other lots stay as they were
  return (LOTS0 = LOTS);
}
const hits = (a, r, m = 0) => a[2] + m > r[0] && a[0] - m < r[2] && a[3] + m > r[1] && a[1] - m < r[3];
export function lots() {
  if (LOTS) return LOTS;
  const clear = [...palazzi().map((p) => p.box), ...bridges().map((b) => b.corridor), squero().clear];
  return (LOTS = baseLots().filter((l) => !clear.some((r) => hits(l.rect, r, 0.4))));
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

/**
 * The quay walls (docs/settlements/venice.md §6): pieces about 3 m long whose face stands just inside the water (wet = −0.6), their
 * tops covering the bank's slope back to the ground, each [x, z, wx, wz, L] with its face toward the water (wx, wz) — found along every
 * canal's two sides and round its bends, along the basin and round the lagoon's edge, kept only where that line
 * is the true edge (the gradient of wet gives the face's direction).
 */
export function rivePieces() {
  const out = [], seen = new Set(), L = 3, TW = -0.6;
  const tryAt = (x, z) => {
    const w = wet(x, z);
    if (Math.abs(w - TW) > 0.2 || Math.hypot(x, z) > RADIUS - 59) return;
    const e = 0.3, gx = (wet(x + e, z) - wet(x - e, z)) / (2 * e), gz = (wet(x, z + e) - wet(x, z - e)) / (2 * e), g = Math.hypot(gx, gz);
    if (g < 0.6) return;                                                       // a ridge between two waters, or flat
    const wx = -gx / g, wz = -gz / g, px = x + wx * (w - TW), pz = z + wz * (w - TW);
    if (inRect(PIAZZA, px, pz, 1) || inRect(squero().slip, px, pz, 0) || RIALTO.x - RIALTO.span / 2 - 1 < px && px < RIALTO.x + RIALTO.span / 2 + 1 && Math.abs(pz - RIALTO.z) < 4.6) return;
    const k = `${Math.round(px / 2.4)},${Math.round(pz / 2.4)}`;
    if (seen.has(k)) return;
    seen.add(k); out.push([+px.toFixed(2), +pz.toFixed(2), +wx.toFixed(4), +wz.toFixed(4), L]);
  };
  const line = (p, d) => {
    for (let i = 0; i + 1 < p.length; i++) {
      const [ax, az] = p[i], [bx, bz] = p[i + 1], len = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / len, tz = (bz - az) / len;
      for (const s of [-1, 1]) for (let t = 0; t <= len; t += L) tryAt(ax + tx * t - tz * d * s, az + tz * t + tx * d * s);
      if (i + 1 < p.length - 1) for (let a = 0; a < Math.PI * 2; a += L / d) tryAt(bx + Math.cos(a) * d, bz + Math.sin(a) * d);
    }
  };
  line(GRAND, 20 + TW);
  for (const c of CANALS) line(c, 5 + TW);
  for (let x = -RADIUS; x <= RADIUS; x += L) tryAt(x, BASIN_Z - TW);
  const rr = RADIUS - 60 - TW;
  for (let a = 0; a < Math.PI * 2; a += L / rr) tryAt(Math.cos(a) * rr, Math.sin(a) * rr);
  return out;
}

// ── the palazzi, the streets, the bridges, the wells, the squero (docs/settlements/venice.md §4b–§5) ───────────────────────────────────
/** Ground the new things keep clear of: the piazza and the buildings round it, the palace, the market, the Rialto's feet. */
const FORBID = [[PIAZZA[0] - 20, PIAZZA[1] - 20, PIAZZA[2] + 4, PIAZZA[3] + 18], [PIAZZETTA[0] - 4, PIAZZETTA[1], PIAZZETTA[2] + 4, PIAZZETTA[3] + 6], [PALACE[0] - 3, PALACE[1] - 3, PALACE[2] + 3, PALACE[3] + 3],
  [BASILICA.c[0] - 50, BASILICA.c[1] - 40, BASILICA.c[0] + 45, BASILICA.c[1] + 40], MARKET, [RIALTO.x + RIALTO.span / 2 - 4, RIALTO.z - 24, RIALTO.x + RIALTO.span / 2 + 36, RIALTO.z + 14],
  [RIALTO.x - RIALTO.span / 2 - 5, RIALTO.z - 40, RIALTO.x - RIALTO.span / 2 + 3, RIALTO.z + 30], MERCERIA, CLOCK];
const forbidden = (x, z, m = 0) => FORBID.some((r) => inRect(r, x, z, m));
const grandD = (x, z) => pathD(x, z, GRAND);
let PAL = null;
/**
 * The palazzi of the Grand Canal: along both banks of its straight stretches, each with its front a hand's breadth behind the quay's
 * coping, the water gate in the middle: { at (the front's middle), w (the unit vector toward the water), width, depth, seed, kind, box }.
 */
export function palazzi() {
  if (PAL) return PAL;
  PAL = [];
  const rand = rng(1497), FRONT = 20.0;
  for (let i = 0; i + 1 < GRAND.length; i++) {
    const [ax, az] = GRAND[i], [bx, bz] = GRAND[i + 1], len = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / len, tz = (bz - az) / len;
    for (const s of [-1, 1]) {
      const nx = -tz * s, nz = tx * s;                               // away from the canal
      let u = 12 + rand() * 3;
      while (u < len - 14) {
        const W = 16 + Math.floor(rand() * 11), D = 19 + Math.floor(rand() * 5), kind = ['gothic', 'gothic', 'gothic', 'veneto', 'lombardo'][Math.floor(rand() * 5)], seed = Math.floor(rand() * 1e6), gap = rand() < 0.3 ? 0 : 1.2 + rand() * 2.5;
        const cu = u + W / 2, fx = ax + tx * cu + nx * FRONT, fz = az + tz * cu + nz * FRONT;
        const P = (a, d) => [fx + tx * a + nx * d, fz + tz * a + nz * d];
        const corners = [P(-W / 2, 0), P(W / 2, 0), P(W / 2, D), P(-W / 2, D)], xs = corners.map((c) => c[0]), zs = corners.map((c) => c[1]);
        const box = [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)];
        const ok = !FORBID.some((r) => hits(box, r, 2)) && [[-W / 2, 0], [W / 2, 0], [0, 0], [-W / 2, D], [W / 2, D], [0, D], [-W / 2, D / 2], [W / 2, D / 2]].every(([a, d]) => { const [x, z] = P(a, d); return wet(x, z) > (d < 0.5 ? -0.3 : 1.8) && Math.hypot(x, z) < RADIUS - 70; });
        if (ok && rand() > 0.08) PAL.push({ at: [+fx.toFixed(2), +fz.toFixed(2)], w: [-nx, -nz], width: W, depth: D, seed, kind, box });
        u += W + gap;
      }
    }
  }
  return PAL;
}
/** The distance along an axis from a point to where the water's quay faces stand (wet = −0.6) each way. */
function faces(x, z, ax) {
  const at = (d) => (ax === 'z' ? wet(x, z + d) : wet(x + d, z));
  let a = 0, b = 0;
  while (at(-a) < -0.6 && a < 30) a += 0.2;
  while (at(b) < -0.6 && b < 30) b += 0.2;
  return [a, b];
}
let BANDS = null;
/** The streets that run through the houses (every 44 m the grid's column is left out): [x0, x1, [[z0, z1], …]] where it is dry and clear. */
export function bands() {
  if (BANDS) return BANDS;
  BANDS = [];
  const L0 = baseLots();
  for (let k = 1; k <= 14; k++) {
    const xc = 44 * k - 334.8;
    let left = -Infinity, right = Infinity;
    for (const l of L0) { const cx = (l.rect[0] + l.rect[2]) / 2; if (cx > xc - 16 && cx < xc) left = Math.max(left, l.rect[2]); if (cx < xc + 16 && cx > xc) right = Math.min(right, l.rect[0]); }
    if (!isFinite(left) || !isFinite(right)) continue;
    const x0 = left + 0.4, x1 = right - 0.4, xm = (x0 + x1) / 2, runs = [];
    let z0 = null;
    for (let z = -330; z <= BASIN_Z - 3; z += 1) {
      const dry = !forbidden(xm, z, 6) && !forbidden(x0, z, 1) && !forbidden(x1, z, 1) && wet(x0, z) >= 2 && wet(x1, z) >= 2 && wet(xm, z) >= 2 && Math.hypot(xm, z) < RADIUS - 75;
      if (dry && z0 === null) z0 = z;
      if ((!dry || z >= BASIN_Z - 3) && z0 !== null) { if (z - z0 >= 10) runs.push([z0, z - 1]); z0 = null; }
    }
    if (runs.length) BANDS.push({ x0, x1, runs });
  }
  return BANDS;
}
let BR = null;
/**
 * The bridges over the small canals: a single stone arch, no parapet (the bridges of Venice had none until the 18th century), steps up and down;
 * { c, ax ('x' | 'z', the way across), f: [−, +] (to the quay faces from c), w, corridor (the ground it clears) }. Where a street's two stretches meet
 * across a canal; and about every 46 m along each canal, across.
 */
export function bridges() {
  if (BR) return BR;
  BR = [];
  const add = (c, ax, via) => {
    const f = faces(c[0], c[1], ax), W = 4.4, R = f[0] + f[1] > 6 && f[0] + f[1] < 24;
    if (!R) return false;
    const e = 3.6, a0 = ax === 'z' ? [c[0] - W / 2 - 0.4, c[1] - f[0] - e - 0.4, c[0] + W / 2 + 0.4, c[1] + f[1] + e + 0.4] : [c[0] - f[0] - e - 0.4, c[1] - W / 2 - 0.4, c[0] + f[1] + e + 0.4, c[1] + W / 2 + 0.4];
    const ends = ax === 'z' ? [[c[0], c[1] - f[0] - e - 1], [c[0], c[1] + f[1] + e + 1]] : [[c[0] - f[0] - e - 1, c[1]], [c[0] + f[1] + e + 1, c[1]]];
    if (ends.some(([x, z]) => wet(x, z) < 1.8 || forbidden(x, z, 3) || Math.hypot(x, z) > RADIUS - 72)) return false;
    if (BR.some((b) => Math.hypot(b.c[0] - c[0], b.c[1] - c[1]) < 16)) return false;
    BR.push({ c: [+c[0].toFixed(2), +c[1].toFixed(2)], ax, f: f.map((v) => +v.toFixed(2)), w: W, corridor: a0, via });
    return true;
  };
  // where a band's runs are parted by water
  for (const b of bands()) for (let i = 0; i + 1 < b.runs.length; i++) {
    const za = b.runs[i][1], zb = b.runs[i + 1][0], xm = (b.x0 + b.x1) / 2;
    if (zb - za < 26 && wet(xm, (za + zb) / 2) < 0) add([xm, (za + zb) / 2], 'z', 'band');
  }
  // across each small canal, along its length
  for (const p of CANALS) for (let i = 0; i + 1 < p.length; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1], len = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / len, tz = (bz - az) / len, axis = Math.abs(tx) > Math.abs(tz) ? 'z' : 'x';
    for (let t = 30; t < len - 20; t += 46) add([ax + tx * t, az + tz * t], axis, 'canal');
  }
  return BR;
}
let WL = null;
/** The wellheads (vere da pozzo) in the streets and on the piazza: { at, paving }. */
export function wells() {
  if (WL) return WL;
  WL = [{ at: [-96, -33.5] }, { at: [-52, -33.5] }, { at: [-122, 23] }];
  for (const b of bands()) for (const [z0, z1] of b.runs) for (let z = z0 + 14; z < z1 - 8; z += 52) WL.push({ at: [+(b.x0 + 1.6).toFixed(2), z] });
  return WL;
}
/** The squero (boatyard) on the south bank of the eastern canal: its yard, the slipway's ground. */
export function squero() {
  const [ax, az] = CANALS[4][0], [bx, bz] = CANALS[4][1], len = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / len, tz = (bz - az) / len;
  const t = 70, cx = ax + tx * t, cz = az + tz * t + 5.2;                // the canal's middle there, the quay's edge 5.2 m south
  return { c: [+cx.toFixed(1), +cz.toFixed(1)], yaw: Math.atan2(tz, tx), clear: [cx - 13, cz + 0.5, cx + 13, cz + 17], slip: [cx - 7, cz - 1.5, cx + 3, cz + 0.3] };
}
