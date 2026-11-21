// Versailles by night about 1690 (docs/settlements/versailles.md §11.3): the palace's first floor lit — the seventeen windows of the Hall of Mirrors and the
// Salons of War and Peace on the garden front, the King's apartments on the Marble Court — the courtiers' windows in the wings, the town's candles behind
// small panes, the lanterns hung from cords over the avenues, the cressets at the gates of the courts, the sentry boxes' lanterns, the lodgings of the
// service yards. Made of geometry in one material, `halo` (palette.js): light added over the scene at night only, no light, no shadow, no collision, the
// shape of each piece carried by its normals (a copy of the pattern of Amsterdam's and Suzhou's nightlight.js, whose `Halo` this class is). Where the panes
// are is read off the builders' own measures (front.js's bays, court.js's bays, townhouse.js's storeys and dice), so a glow is on a window that is there.
// The halos stand in near plans (a tile each), so that they are one batch, one draw. Pure functions of places.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import '../../styles/classical_fr/index.js';
import { faceFrame } from '../../styles/dutch/facade.js';
import { rng } from '../../styles/classical_fr/townhouse.js';
import { RADIUS, RISE, YARD_Y, CHATEAU, WINGS, PLACE, STABLES, ORANGERIE, OR_Y, lots, inRect } from './layout.js';
import { SERVICE } from './service.js';
import { doorOf } from './openwalk.js';
import { chateau } from './plan.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from numbers alone. */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 7.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 5.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material (a copy of Amsterdam's `Halo`). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
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
  /** A disc lying on the paving at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, F = [1, 0.42, 0]) { const s = Math.sin(yaw), c = Math.cos(yaw); this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, F, [0, 0.5, 1]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) { for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); } }
  /** A flat sheet of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  /** A convex polygon of points [[x, y, z]] as a fan, brightness f, facing n. */
  fan(pts, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; for (let i = 1; i + 1 < pts.length; i++) this.tri(pts[0], N, pts[i], N, pts[i + 1], N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}

const tileOf = (x, z) => `${Math.floor(x / 100)},${Math.floor(z / 100)}`;
const R2 = (RADIUS - 30) ** 2;
let TILES = null;
const tileHalo = (x, z) => { const k = tileOf(x, z); let h = TILES.get(k); if (!h) TILES.set(k, (h = new Halo())); return h; };

/** An arched window's sheet: a rectangle from y0 to the spring, the arch (radius r) over it, in the plane of a face; at(u, d) gives the plan point. */
function archSheet(H, at, uc, y0, spring, r, d, n, f) {
  const P = (u, y) => { const [x, z] = at(u, d); return [x, y, z]; }, pts = [P(uc - r, y0), P(uc + r, y0)];
  for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI; pts.push(P(uc + Math.cos(a) * r, spring + Math.sin(a) * r)); }
  H.fan(pts, n, f);
}

// ── the palace ───────────────────────────────────────────────────────────────────────────────────
function palace() {
  // the garden front of the central block (front.js: nb = L / 4.4 bays; the first floor's windows spring from E − 1.7, sill G + 0.55; the avant-corps stand 0.55 forward)
  const [x0, z0, , z1] = CHATEAU, y = RISE, h = 22, L = z1 - z0, nb = Math.max(3, Math.round(L / 4.4)), bw = L / nb, mid = Math.floor(nb / 2);
  const G = y + 0.36 * h, E = y + 0.78 * h, avant = (i) => i >= mid - 2 && i <= mid + 2 || [0, 1, 2, nb - 3, nb - 2, nb - 1].includes(i);
  for (let i = 1; i < nb - 1; i++) {
    const zc = z0 + (i + 0.5) * bw, hallBay = i >= 4 && i <= nb - 5, f = hallBay ? 0.78 : 0.62, d = 0.6 + (avant(i) ? 0.55 : 0) + 0.03;
    const H = tileHalo(x0, zc);
    archSheet(H, (u, dd) => [x0 - dd, z0 + u], zc - z0, G + 0.6, E - 1.7, 0.95, d, [-1, 0], f * (0.9 + 0.2 * hash(i, 7, 3)));
    if (hallBay && i % 2 === 0) H.floor(x0 - 5.5, y + 0.06, zc, 4.2, 3.0, 0, 8, [0.5, 0.2, 0]);          // the light spilling on the terrace
  }
  // the wings' garden fronts (a courtier's candle here and there)
  for (const w of WINGS) {
    const [wx0, wz0, , wz1] = w, h2 = 20, Lw = wz1 - wz0, nbw = Math.max(3, Math.round(Lw / 4.4)), bww = Lw / nbw, Gw = y + 0.36 * h2, Ew = y + 0.78 * h2;
    for (let i = 0; i < nbw; i++) {
      if (hash(wz0, i, 11) > 0.34) continue;
      const zc = wz0 + (i + 0.5) * bww;
      archSheet(tileHalo(wx0, zc), (u, dd) => [wx0 - dd, wz0 + u], (i + 0.5) * bww, Gw + 0.6, Ew - 1.7, 0.95, 0.65, [-1, 0], 0.3 + 0.25 * hash(i, 5, 9));
    }
  }
}

/** The court fronts (court.js: bays of 4.2 m, the glass at d 0.03, the ground window g0 0.9 … 0.4 h, the first floor's 0.47 h + 0.35 … h − 1.45). */
function courts(chateauElements) {
  for (const el of chateauElements) {
    if (el.t !== 'court_range') continue;
    const h = el.h ?? 12, y = el.y ?? 0;
    for (const f of el.fronts ?? '') {
      const F = faceFrame(el.rect, f), L = F.w, n = Math.max(1, Math.round(L / (el.bay ?? 4.2))), bw = L / n, w = Math.min(1.55, bw * 0.38), m = Math.floor(n / 2);
      const centre = el.centre === f && n >= 5, out = f === 'n' ? [0, -1] : f === 's' ? [0, 1] : f === 'e' ? [1, 0] : [-1, 0];
      for (let i = 0; i < n; i++) {
        const c = (i + 0.5) * bw, ctr = centre && Math.abs(i - m) <= 1, [px, pz] = F.at(c, 0.05);
        const H = tileHalo(px, pz), seed = Math.floor(el.rect[0] * 7 + el.rect[1] * 13 + i * 31 + f.charCodeAt(0));
        for (const [v0, v1, first] of [[0.9, h * 0.4, false], [h * 0.47 + 0.35, h - 1.45, true]]) {
          const p = ctr && first ? 0.95 : hash(seed, first ? 1 : 0, 17) < (first ? 0.55 : 0.25) ? 0.35 + 0.3 * hash(seed, 2, first ? 1 : 0) : 0;
          if (!p) continue;
          const a = F.at(c - w / 2 + 0.05, 0.06), b = F.at(c + w / 2 - 0.05, 0.06);
          H.quad([a[0], y + v0 + 0.05, a[1]], [b[0], y + v0 + 0.05, b[1]], [b[0], y + v1 - 0.05, b[1]], [a[0], y + v1 - 0.05, a[1]], out, p);
        }
      }
    }
  }
}

// ── a town house's panes (townhouse.js: storeys 3.7 then 3.9, 3.4, 3.1, a hotel's first floor 0.5 more; bays of about 2.7 m; the ground windows barred, 1.0 … 1.55) ──
const ST0 = 3.7, ST = [3.9, 3.4, 3.1];
/** The house's points in the plan: u along the front, d out from it. */
const pt = (l, u, d) => (l.front === 's' ? [l.rect[2] - u, l.rect[3] + d] : [l.rect[0] + u, l.rect[1] - d]);
const out = (l) => (l.front === 's' ? [0, 1] : [0, -1]);
function house(l, H, lit = 1) {
  const L = l.rect[2] - l.rect[0], n = l.storeys, hotel = l.kind === 'hotel', y = l.y ?? RISE, N = out(l);
  const sy = [0]; for (let s = 0; s < n; s++) sy.push(sy[s] + (s === 0 ? ST0 : ST[Math.min(s - 1, ST.length - 1)] + (hotel && s === 1 ? 0.5 : 0)));
  const bays = Math.max(2, Math.round(L / 2.7)), ww = hotel ? 1.25 : 0.95;
  const quad = (u0, u1, y0, y1, f) => { const a = pt(l, u0, 0.08), b = pt(l, u1, 0.08); H.quad([a[0], y + y0, a[1]], [b[0], y + y0, b[1]], [b[0], y + y1, b[1]], [a[0], y + y1, a[1]], N, f); };
  for (let s = 1; s < n; s++) for (let k = 0; k < bays; k++) {
    if (hash(l.seed, s * 7 + k, 41) > (s === 1 ? 0.5 : 0.3) * lit) continue;
    const u = (k + 0.5) * L / bays, st = sy[s + 1] - sy[s], wh = Math.min(st - 1.1, s === 1 ? 2.35 : 1.85), v0 = sy[s] + (st - wh) * 0.45;
    quad(u - ww / 2 + 0.06, u + ww / 2 - 0.06, v0 + 0.08, v0 + wh - 0.08, 0.35 + 0.3 * hash(l.seed, s * 3 + k, 43));
  }
  const d = doorOf(l), left = d.u < L / 2;
  if (l.kind === 'house') {                                                   // the ground windows (townhouse.js: one every 2.7 m from the door's far side)
    const wins = Math.max(1, Math.round(L / 3) - 1);
    for (let k = 0; k < wins; k++) { const u = left ? 3.3 + k * 2.7 : L - 3.3 - k * 2.7; if (u > 1.0 && u < L - 1.0 && Math.abs(u - d.u) > 1.9 && hash(l.seed, k, 47) < 0.5 * lit) quad(u - 0.4, u + 0.4, 1.05, 1.5, 0.4); }
  }
  // the lit front of an open shop or tavern: a lantern over the counter, its pool on the stoop; the door's lantern at an inn
  const spot = (u, hgt, r, pr) => { const [x, z] = pt(l, u, 1.0), [fx, fz] = pt(l, u, 2.4); H.ball(x, y + hgt, z, r); H.floor(fx, y + 0.12, fz, pr, pr * 0.8, 0, 6); };
  if (l.kind === 'shop') {
    const su = left ? L * 0.7 : L * 0.3, evening = l.use === 'tavern' || l.use === 'vintner' || l.use === 'chandler' || l.use === 'baker' || hash(l.seed, 3, 53) < 0.35;
    if (evening) spot(su, 2.6, 1.0, 2.4);
  } else if (hotel) spot(L / 2, 3.4, 1.2, 3.0);
}

function town() {
  for (const l of lots()) { const [mx, mz] = [(l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2]; if (mx * mx + mz * mz > R2) continue; house(l, tileHalo(mx, mz)); }
  // the service lodgings: the guardroom's, the fontainiers' and the bearers' windows lit, a lantern at the guardroom door
  for (const b of SERVICE) { const [mx, mz] = [(b.rect[0] + b.rect[2]) / 2, (b.rect[1] + b.rect[3]) / 2], H = tileHalo(mx, mz); house({ ...b, y: YARD_Y, storeys: b.storeys }, H, b.use === 'guard' || b.use === 'fountain' || b.use === 'bearers' ? 1.7 : 1); if (b.use === 'guard' || b.use === 'bearers') { const d = doorOf(b), a = b.front === 's' ? [b.rect[2] - d.u + 1.0, b.rect[3] + 0.9] : [b.rect[0] + d.u + 1.0, b.rect[1] - 0.9]; H.ball(a[0], YARD_Y + 2.7, a[1], 1.0); H.floor(a[0], YARD_Y + 0.12, a[1] + (b.front === 's' ? 1.4 : -1.4), 2.2, 1.8, 0, 6); } }
}

// ── lanterns, cressets, sentry boxes ───────────────────────────────────────────────────────────────
/** The lanterns hung on cords over the avenues' middle (the Paris ordinance of 1667 lit its streets so; the town's [inferred]), every 38 m. */
export function cordLamps() {
  const out = [];
  for (const [o, s] of [[0, 0], [75, 0.35], [-75, -0.35]]) for (let x = PLACE[2] + 20; x < RADIUS - 50; x += 38) out.push([x, o + (x - PLACE[2]) * s]);
  for (const z of [-44, -22, 22, 44]) out.push([PLACE[0] + 70, z]);
  return out.filter(([x, z]) => Math.hypot(x, z) < RADIUS - 35);
}
/** The cressets (iron fire-baskets on posts) at the gates of the Royal Court and the forecourt, and the sentry boxes' lanterns. */
export const CRESSETS = [[150, -7.5], [150, 7.5], [92, -6.8], [92, 6.8]];
/** Iron torchères on the terrace by the water parterre, where the court walked in the evening (the garden front's lit windows are 60 m off the arrival) [inferred: flambeaux and braziers lit the evening promenades]. */
export const TORCHERES = [[-45, -7], [-45, 7], [-38, -17], [-38, 17], [-62, -15], [-62, 15]];
export const SENTRIES = [[154.5, -9.5], [154.5, 9.5], [156, PLACE[1] + 4], [156, PLACE[3] - 4], [PLACE[2] - 14, PLACE[1] + 3], [PLACE[2] - 14, PLACE[3] - 3]];
function lamps() {
  for (const [x, z] of cordLamps()) { const H = tileHalo(x, z); H.ball(x, RISE + 5.6, z, 1.3); H.floor(x, RISE + 0.06, z, 5.0, 4.4, 0, 8, [0.8, 0.3, 0]); }
  for (const [x, z] of CRESSETS) { const H = tileHalo(x, z); H.ball(x, RISE + 3.3, z, 1.7); H.floor(x, RISE + 0.07, z, 5.5, 5.0, 0, 8); }
  for (const [x, z] of TORCHERES) { const H = tileHalo(x, z); H.ball(x, RISE + 2.15, z, 1.1); H.floor(x, RISE + 0.07, z, 4.2, 3.8, 0, 8, [0.8, 0.3, 0]); }
  for (const [x, z] of SENTRIES) { const H = tileHalo(x, z); H.ball(x, RISE + 2.4, z, 0.9); H.floor(x, RISE + 0.07, z, 2.6, 2.2, 0, 6); }
  // the Orangerie: the stoves' embers glimpsed through the glazed bays of the gallery, south front (§1i; [inferred] — the gallery was heated against the frost)
  { const g = ORANGERIE.gallery, bw = (g[2] - g[0]) / 7, H = tileHalo((g[0] + g[2]) / 2, g[3]);
    for (let k = 0; k < 7; k++) if (k % 2 === 0) { const cx = g[0] + (k + 0.5) * bw, a = [cx - 1.2, OR_Y + 0.9, g[3] + 0.06], b = [cx + 1.2, OR_Y + 0.9, g[3] + 0.06]; H.quad(a, b, [b[0], OR_Y + 4.6, b[2]], [a[0], OR_Y + 4.6, a[2]], [0, 1], 0.22); } }
  void STABLES; void inRect;
}

/** All the halos by 100 m tile (cached; the court fronts read the château plan's own elements). */
export function halos() {
  if (TILES) return TILES;
  TILES = new Map();
  palace(); town(); lamps(); courts(chateau.elements);
  return TILES;
}

/** { t: 'vs_night', tile: 'i,j' }: that tile's halos, in one geometry of one material. */
function vsNight(el, ctx) {
  const t = halos().get(el.tile); if (t) t.flush(ctx.bag);
  for (const [x, z] of TORCHERES) if (tileOf(x, z) === el.tile) {   // the iron post and its cup (a day fixture too, thin and out of the lanes)
    ctx.bag.add('iron', lathe([[0.07, 0], [0.04, 0.12], [0.032, 1.75], [0.1, 1.82], [0.22, 2.02], [0.2, 2.06], [0.05, 2.0]], 10, null, x, RISE, z));
  }
}
Object.assign(STYLES.classical_fr.elements, { vs_night: vsNight });

/** The night plans: a near plan to a tile (one batch for them all, one draw). */
export function nightPlans() {
  const T = halos(), plans = [];
  for (const k of T.keys()) {
    const [i, j] = k.split(',').map(Number);
    plans.push({ id: `versailles-night-${k}`, style: 'classical_fr', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [180, 0], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: [{ t: 'vs_night', tile: k }], nocollide: true, center: [i * 100 + 50, j * 100 + 50], near: 330 });
  }
  return plans;
}
