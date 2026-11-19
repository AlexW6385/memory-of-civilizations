// Paris by night (docs/settlements/paris.md §6b): what little light the city of 1248 had. There was no street lighting: the streets
// were dark, the curfew bell sent the city indoors, and the only fires in the open were the cressets and braziers of the gates and
// the guard posts, the bakers' ovens that were fired in the small hours, the hearths of the taverns until the bell, and the candles
// of the churches and the palace. Each is made here of geometry in one material, `halo` (palette.js 'halo'): light ADDED over what
// is behind it, at night only (ENV.night), with no light, no shadow and no collision. The shape of each piece is carried by its
// normals (the same scheme as Ming Suzhou's nightlight.js, of which `Halo` is a copy: that file imports Suzhou's layout).
// Everything is a pure function of a place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { shopPoint } from '../../styles/gothic/houses.js';
import { height, inLot } from './layout.js';
import { openMap } from './openwalk.js';
import { courtLots } from './court-lots.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material (a copy of Ming Suzhou's `Halo`). */
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
  /** A disc lying on a horizontal plane (the paving, a floor) at height y; yaw turns its first semi-axis r from +x toward −z. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [1, 0.42, 0], [0, 0.5, 1]);
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
  /** A pointed head: a triangle on the edge a-b with its apex at p. */
  head(a, b, p, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, p, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add('halo', g);
    this.pos = []; this.nor = [];
  }
}

// ── the places that are lit ─────────────────────────────────────────────────────────────────────────────
/** The cressets on posts at the palace gate (the king's gate on the Barillerie, §1c) and the braziers of the two Châtelets' guard posts (§1e) [inferred: the gates were watched, a fire kept]. */
export const CRESSETS = [[-110.3, -2.9], [-110.3, 2.9], [-113.7, -2.9], [-113.7, 2.9]];
export const BRAZIERS = [[-4.6, -174.6], [4.6, -174.6], [105.2, 156.2], [114.8, 156.2]];
/** The candles of the altars [stated in the buildings' own plans]: Notre-Dame's high altar (nd-interior.js altar(): the candlesticks at ±0.9 m, 0.1 m east of x), the Sainte-Chapelle's upper altar (sc_altar 'main', w 2.4) and the Virgin's in the lower chapel ('virgin', w 2.0): [x, y of the flame, z]. */
export const CANDLES = [[254.5, 3.3, -0.9], [254.5, 3.3, 0.9], [-173.65, 10.4, -10.75], [-173.65, 10.4, -9.25], [-171.45, 2.95, -10.55], [-171.45, 2.95, -9.45]];
/** The Grand-Salle (palace_hall rect [-265, -72, -199, -44], floor 7.6, eave 17; hall-interior.js): the coronas of candles over the naves, the braziers, the candle-stands at the dais. */
export const HALL = {
  rect: [-265, -72, -199, -44], y: 1, fl: 7.6, h: 17, T: 1.1, door: -202.9,
  coronas: [-245.9, -221.9].flatMap((x) => [[x, 18.45, -64.45], [x, 18.45, -51.55]]),
  braziers: [[-205.5, 8.6, -46.7], [-202.5, 8.6, -53], [-253.9, 8.6, -66]],
  stands: [[-259.9, 11.3, -61.4], [-259.9, 11.3, -54.6]],
};
/** The windows of the Grand-Salle that glow (a share of the long walls' and the ends' tall windows, by hash): [{ at: [x, z] of the wall's outer face, n: outward, w, y0, y1 }]. */
export function hallWindows(share = 0.4) {
  const [x0, z0, x1, z1] = HALL.rect, { T, y, fl, h, door } = HALL, E = y + h, n = Math.max(2, Math.round((x1 - x0) / 6)), bl = (x1 - x0) / n, out = [];
  for (const [zf, nz] of [[z0 + T / 2, -1], [z1 - T / 2, 1]]) for (let k = 0; k < n; k++) {
    const x = x0 + (k + 0.5) * bl;
    if (nz > 0 && Math.abs(x - door) < 2.4) continue;
    if (hashAt(x, zf, 41) < share) out.push({ at: [x, zf + nz * (T / 2 + 0.03)], n: [0, nz], w: 1.0, y0: y + fl + 2.2, y1: E - 3.6, f: 0.45 + 0.4 * hashAt(x, zf, 42) });
  }
  const nw = (z1 - z0) / 2;
  for (const [xf, sx] of [[x0 + T / 2, -1], [x1 - T / 2, 1]]) for (let k = 0; k < 2; k++) {
    const z = z0 + (k + 0.5) * nw;
    if (hashAt(xf, z, 43) < share + 0.2) out.push({ at: [xf + sx * (T / 2 + 0.03), z], n: [sx, 0], w: 1.55, y0: y + fl + 2.0, y1: E - 2.8, f: 0.5 + 0.35 * hashAt(xf, z, 44) });
  }
  return out;
}
/** The shops that show a fire at night: the bakers' ovens (fired in the small hours) and the taverns' hearths (until the curfew bell) [inferred]. */
export function litShops() {
  const out = [];
  const add = (l, y) => {
    const sp = shopPoint({ rect: l.rect, y, seed: l.seed, front: l.front });
    if (sp.trade === 'baker' || (sp.trade === 'tavern' && hashAt(l.rect[0], l.rect[1], 51) < 0.75)) out.push({ trade: sp.trade, at: sp.at, out: sp.out, inside: sp.inside, y });
  };
  for (const [l] of openMap()) add(l, height((l.rect[0] + l.rect[2]) / 2, (l.rect[1] + l.rect[3]) / 2));
  for (const l of courtLots()) add(l, 1.0);
  return out;
}

// ── the halos ───────────────────────────────────────────────────────────────────────────────────────────
/** A fire in the open: the glow, the pool on the ground. */
function fire(H, x, gy, by, z, ball, pool) { H.ball(x, by, z, ball); H.floor(x, gy + 0.03, z, pool); }
export function halos() {
  const H = new Halo();
  for (const [x, z] of CRESSETS) fire(H, x, height(x, z), height(x, z) + 2.15, z, 1.3, 3.2);
  for (const [x, z] of BRAZIERS) fire(H, x, height(x, z), height(x, z) + 1.0, z, 1.1, 2.8);
  for (const [x, y, z] of CANDLES) H.ball(x, y + 0.1, z, y < 3.5 && x > 200 ? 0.9 : 0.6);
  // the altars' tables take the light
  H.floor(254.5, 2.45, 0, 1.1, 2.6, 0); H.floor(-173.9, 9.62, -10, 0.9, 1.6, 0);
  for (const [x, y, z] of HALL.coronas) { H.ball(x, y, z, 2.1); H.floor(x, HALL.y + HALL.fl + 1.03, z, 6.0, 5.0, 0, 10); }
  for (const [x, y, z] of HALL.braziers) fire(H, x, y, y + 0.85, z, 1.0, 2.6);
  for (const [x, y, z] of HALL.stands) { H.ball(x, y, z, 0.7); H.floor(x, y - 2.3, z, 1.8); }
  for (const w of hallWindows()) {
    const [x, z] = w.at, t = w.n[0] ? [0, 1] : [1, 0], a = (s) => [x + t[0] * s * w.w, 0, z + t[1] * s * w.w];
    const P = (s, yy) => { const q = a(s); return [q[0], yy, q[2]]; };
    H.quad(P(-1, w.y0), P(1, w.y0), P(1, w.y1), P(-1, w.y1), w.n, w.f);
    H.head(P(-1, w.y1), P(1, w.y1), [x, w.y1 + w.w * 0.9, z], w.n, w.f);
  }
  for (const s of litShops()) {
    const o = s.out, along = o[1] !== 0, yaw = along ? 0 : Math.PI / 2, sa = s.trade === 'baker' ? 1.25 : 1;
    H.ball(s.inside[0], s.y + 1.0, s.inside[1], 0.95 * sa);
    H.floor(s.inside[0], s.y + 0.04, s.inside[1], 1.7, 1.3, yaw);
    H.floor(s.at[0] + o[0] * 0.3, height(s.at[0], s.at[1]) + 0.04, s.at[1] + o[1] * 0.3, 2.4 * sa, 1.7 * sa, yaw, 10);
  }
  return H;
}

// ── the props that carry the light ──────────────────────────────────────────────────────────────────────
/** { t: 'paris_fire', at: [x, z], y, kind: 'cresset' | 'brazier' }: an iron basket of fire on a post (cresset, 1.9 m) or a bowl on three legs (brazier, 0.8 m). */
function parisFire(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y;
  if (el.kind === 'cresset') {
    bag.add('timber', box(x - 0.075, y, z - 0.075, x + 0.075, y + 1.75, z + 0.075));
    bag.add('iron', lathe([[0.001, 0], [0.12, 0.08], [0.22, 0.3], [0.2, 0.34], [0.001, 0.24]], 8, null, x, y + 1.6, z));
    bag.add('flame', lathe([[0.001, 0.0], [0.17, 0.04], [0.08, 0.3], [0.001, 0.42]], 7, null, x, y + 1.88, z));
    col.circle(x, z, 0.3, y, y + 1.9);
  } else {
    bag.add('iron', lathe([[0.001, 0.4], [0.3, 0.5], [0.42, 0.72], [0.38, 0.76], [0.001, 0.62]], 10, null, x, y, z));
    bag.add('iron', lathe([[0.3, 0], [0.26, 0.04], [0.09, 0.16], [0.07, 0.5], [0.001, 0.6]], 8, null, x, y, z));   // the stand (a turned foot: no thin rods, which would draw as a mesh of their own)
    bag.add('flame', lathe([[0.001, 0.7], [0.3, 0.72], [0.12, 0.98], [0.001, 1.04]], 8, null, x, y, z));
    col.circle(x, z, 0.45, y, y + 0.8);
  }
}
/** { t: 'paris_night' }: the halos of the whole city, in one geometry of one material. */
function parisNight(el, ctx) { halos().flush(ctx.bag); }

/** The night plan: one plan, one material's draw; the props with it. */
export function nightPlan(RADIUS) {
  const els = [{ t: 'paris_night' }];
  for (const [x, z] of CRESSETS) els.push({ t: 'paris_fire', at: [x, z], y: height(x, z), kind: 'cresset' });
  for (const [x, z] of BRAZIERS) els.push({ t: 'paris_fire', at: [x, z], y: height(x, z), kind: 'brazier' });
  return { id: 'paris-night', style: 'gothic', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, -135], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: els };
}
Object.assign(STYLES.gothic.elements, { paris_fire: parisFire, paris_night: parisNight });
void inLot;
