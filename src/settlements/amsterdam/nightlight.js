// Amsterdam by night about 1670 (docs/settlements/amsterdam.md §10.2): oil lamps, 1,800 of them since 1669 (van der Heyden's street lamps, one per
// 125-150 ft), candles and rushlights behind the small panes of the houses, lanterns hung out at the open shop fronts, the great lantern at the Weigh House
// door. Made of geometry in one material, `halo` (palette.js): light added over the scene at night only, no light, no shadow, no collision, the shape
// of each piece carried by its normals (a copy of the pattern of London's and Suzhou's nightlight.js, whose `Halo` this class is). Where the panes
// are is read off the house builder's own measures (profile(), faceFrame()), so a glow is on a window that is there. Pure functions of places.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import '../../styles/dutch/index.js';
import { faceFrame } from '../../styles/dutch/facade.js';
import { profile } from '../../styles/dutch/upper.js';
import { GROUND, RADIUS, WAAG, lots } from './layout.js';
import { quayLife } from './quay.js';
import { shopLots } from './shops.js';
import { shopBay } from './shopfront.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from numbers alone. */
export function hash(a, b = 0, c = 0) {
  let h = Math.imul(Math.floor(a) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(b * 7.31) + 0x7f4a7c15, 0xc2b2ae35) ^ Math.imul(Math.floor(c * 5.9) + 0x165667b1, 0x27d4eb2f);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material (a copy of Ming Suzhou's `Halo`, as Paris's). */
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
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}


const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
let LAMPS = null;
/** The street lamps as the quays and the Dam place them: [[x, z]] (read off the quay plans' own elements). */
export function lampSites() {
  if (LAMPS) return LAMPS;
  LAMPS = [];
  for (const p of quayLife()) for (const e of p.elements) if (e.t === 'street_lamp') LAMPS.push(e.at);
  return LAMPS;
}
/** Which panes of a lot may burn: [{ u, y0, y1, fl }] in the lot's frame (u along the front, y above the ground). The ground floor's door bay is left out. */
export function panesOf(l) {
  const p = profile(l), out = [], doorBay = p.left ? 0 : p.bays - 1, bw = p.w / p.bays, g = 3.6;
  for (let s = 0; s < Math.min(p.n, 5); s++) for (let i = 0; i < p.bays; i++) {
    if (s === 0 && (i === doorBay || p.warehouse)) continue;
    if (p.warehouse && s > 0 && i !== 1) continue;
    const y0 = s === 0 ? 1.9 : g + (s - 1) * p.st + 0.85, y1 = s === 0 ? 3.7 : y0 + p.st - 1.25;
    out.push({ u: (i + 0.5) * bw, y0, y1, fl: s, i });
  }
  return out;
}
const lit = (l, w) => hash(l.seed, w.fl * 5 + w.i, 41) < (w.fl === 0 ? 0.55 : w.fl === 1 ? 0.5 : w.fl === 2 ? 0.34 : 0.16);

export function halos() {
  const H = new Halo(), R2 = (RADIUS - 40) ** 2;
  // the oil lamps: the lantern's glow and a pool on the paving
  for (const [x, z] of lampSites()) { if (x * x + z * z > R2) continue; H.ball(x, GROUND + 4.0, z, 1.2); H.floor(x, GROUND + 0.17, z, 3.2, 2.8, 0, 8); }
  // the windows: candles behind the small panes, more on the lower floors
  for (const l of lots()) {
    const mx = (l.rect[0] + l.rect[2]) / 2, mz = (l.rect[1] + l.rect[3]) / 2;
    if (mx * mx + mz * mz > R2) continue;
    const F = faceFrame(l.rect, l.front), y = l.y ?? GROUND, [nx, nz] = OUT[l.front], pw = 0.55;
    for (const w of panesOf(l)) {
      if (!lit(l, w)) continue;
      const f = 0.4 + 0.3 * hash(l.seed, w.fl * 3 + w.i, 43), a = F.at(w.u - pw, 0.08), b = F.at(w.u + pw, 0.08);
      H.quad([a[0], y + w.y0, a[1]], [b[0], y + w.y0, b[1]], [b[0], y + w.y1, b[1]], [a[0], y + w.y1, a[1]], [nx, nz], f);
    }
  }
  // the shops stand open into the evening: a lantern hung over the counter, its pool on the stoop
  for (const { lot: l } of shopLots()) {
    const B = shopBay(l), F = faceFrame(l.rect, l.front), y = l.y ?? GROUND, c = F.at(B.uw, 1.1);
    H.ball(c[0], y + 2.6, c[1], 1.0); const f = F.at(B.uw, 2.4); H.floor(f[0], y + 0.15, f[1], 2.2, 1.8, 0, 6);
  }
  // the Weigh House's lantern at its door (the south front, toward the Dam) and the Dam's corner lamps
  H.ball((WAAG[0] + WAAG[2]) / 2, GROUND + 4.4, WAAG[3] + 0.9, 1.5); H.floor((WAAG[0] + WAAG[2]) / 2, GROUND + 0.17, WAAG[3] + 1.5, 3.4, 2.6, 0, 8);
  return H;
}

/** { t: 'am_night' }: the halos of the whole town, in one geometry of one material. */
function amNight(el, ctx) { halos().flush(ctx.bag); }
Object.assign(STYLES.dutch.elements, { am_night: amNight });

/** The night plan: one plan, one material's draw. */
export function nightPlan() {
  return { id: 'amsterdam-night', style: 'dutch', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [20, -207], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: [{ t: 'am_night' }], nocollide: true };
}
