// Baroque Rome by night (docs/settlements/baroque-rome.md §6c): what light the city of 1670 had. Rome had no street lighting: the lamps burning before
// the madonnelle at the street corners were the only lights of the Borgo's streets; coaches carried their own lanterns; the open fires were the guards'
// and the osteria's and the baker's hearths; candles showed at the windows of the upper rooms; in the basilica the ninety-five lamps of the Confessio
// burned day and night [stated: stpetersbasilica.info, Confessio]. Each light is made of geometry in one material, `halo` (palette.js 'halo'): light
// ADDED over what is behind it, at night only (ENV.night), with no light, no shadow and no collision, so that it shows at the low preset. The pattern is
// Suzhou's nightlight.js (`Halo`, copied as in Florence's and Paris's); the shape of each piece is carried by its normals. Everything is a pure function
// of the layout (no counters, no Math.random), so that the build worker computes the same lights as the main thread.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import '../../styles/baroque/index.js';
import { faceFrame, toW } from '../../styles/renaissance/face.js';
import { rows, lots, CASTEL, PALACE, COURT, CROSSING, FLOOR, OVAL, TIBER, COACH_SITES, RADIUS, tiberX, height } from './layout.js';
import { frontedLots, lotRow, openShops } from './openwalk.js';
import { madonnaBay } from '../../styles/baroque/borgo.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material (a copy of Suzhou's `Halo`, as Paris's). */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  disc(c, U, V, su, sv, nh = null, segs = 6, F = [1, 0.42, 0], R = [0, 0.5, 1]) {
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
  /** A pool of light on the paving at height y, brightness b. */
  floor(x, y, z, r, rz = r, segs = 6, b = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [b, 0.42 * b, 0], [0, 0.5, 1]); }
  /** The wash on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 6, b = 0.9) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [b, 0], [0, 1]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 6, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet of brightness f (0..1) facing n = [x, z] (both faces are seen). */
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

// ── the units that are lit ───────────────────────────────────────────────────────
/** Every front of casas and palazzi: { rect, face, u (a unit of borgo_row) } — the rows and the fronted lots. */
function fronts() {
  const out = [];
  for (const r of rows()) for (const u of r.units) out.push({ rect: r.rect, face: r.face, u });
  for (const f of frontedLots()) { const e = lotRow(f); out.push({ rect: e.rect, face: e.face, u: e.units[0] }); }
  return out;
}
/** The madonnelle's lanterns (styles/baroque/borgo.js casa(): the shrine in the first-floor bay `madonnaBay`, its lantern 0.86 m to one side of the bay's middle, 5.3 m up and 0.49 m out). */
export function madonnelle() {
  const out = [];
  for (const { rect, face, u } of fronts()) {
    if (u.kind !== 'casa' || !u.madonna || u.fountain) continue;
    const k = madonnaBay(u);
    if (k < 0) continue;
    const nb0 = u.w < 7.6 ? 2 : 3, mu = u.u0 + 0.4 + (k + 0.5) * (u.w - 0.8) / nb0;
    const { M } = faceFrame(rect, face, 0), e = M.elements, [x, z] = toW(M, mu + 0.86, 0.49), [sx, sz] = toW(M, mu + 0.86, 1.9);
    out.push({ at: [x, z], y: 5.3, out: [e[8], e[10]], street: [sx, sz] });
  }
  return out;
}
/** The lit windows: { at: [x, z], y0, y1, hw, out } for the share of upper windows with a candle or a lamp behind them, by hash of their place (the palazzi's piano nobile more often). */
export function litWindows() {
  const out = [];
  for (const { rect, face, u } of fronts()) {
    const { M } = faceFrame(rect, face, 0), e = M.elements, nrm = [e[8], e[10]];
    const add = (uu, y0, h, hw, share, s) => {
      const [x, z] = toW(M, uu, 0.085);
      if (hashAt(x, z, 31 + s) >= share) return;
      out.push({ at: [x, z], y0: y0 + 0.08, y1: y0 + h - 0.08, hw: hw - 0.04, out: nrm, f: 0.4 + 0.4 * hashAt(x, z, 32), s });
    };
    if (u.kind === 'casa') {
      const nb = u.w < 7.6 ? 2 : 3, bw = (u.w - 0.8) / nb, ys = [0]; for (let s = 0; s < u.storeys; s++) ys.push(ys[s] + [3.9, 3.4, 3.2, 2.9][s]);
      for (let s = 1; s < u.storeys; s++) for (let k = 0; k < nb; k++) if (!(s === 1 && k === madonnaBay(u))) add(u.u0 + 0.4 + (k + 0.5) * bw, ys[s] + 0.75, s === 1 ? 2.0 : 1.7, 0.45, s === 1 ? 0.34 : 0.22, s);
    } else {
      const nb = Math.max(3, Math.min(7, Math.round(u.w / 4.6) | 1)), bw = u.w / nb, y1 = 5.0, y2 = 10.4, y3 = 15.0;
      for (let k = 0; k < nb; k++) {
        const uu = u.u0 + (k + 0.5) * bw, c = k === Math.floor(nb / 2);
        add(uu, c ? y1 + 0.3 : y1 + 1.0, c ? 3.6 : 2.7, c ? 0.75 : 0.65, 0.5, 5);
        if (u.storeys > 2) add(uu, y2 + 0.9, 2.2, 0.6, 0.3, 6);
        if (u.storeys > 3) add(uu, y3 + 0.8, 1.3, 0.45, 0.2, 7);
      }
    }
  }
  return out;
}
/** The shops with a fire or a lamp at night: the bakers' ovens (fired in the small hours), the osteria and the inn (open into the evening); [inferred]. */
export function litShops() {
  const out = [];
  for (const { rect, face, u } of fronts()) {
    if (u.kind !== 'casa' || !u.open || u.fountain || !(u.trade === 'baker' || u.trade === 'osteria' || u.up === 'inn')) continue;
    const dw = 1.1, sw = Math.min(2.8, u.w - dw - 1.6), shopU = u.u0 + 0.7 + sw / 2 + (u.flip ? dw + 0.4 : 0);
    const { M } = faceFrame(rect, face, 0), e = M.elements, [x, z] = toW(M, shopU, 0.06), [px, pz] = toW(M, shopU, 1.5);
    out.push({ at: [x, z], pool: [px, pz], out: [e[8], e[10]], hw: sw / 2 + 0.15, baker: u.trade === 'baker' });
  }
  return out;
}
/** The lamp hung from the vault of every open bottega (borgo.js furnish): { at: [x, z] of the lamp, back: [x, z] on the back wall, inward: the wall-wash's normal }. [inferred: a shop open at night burned its oil lamp] */
export function shopLamps() {
  return openShops().map((s) => {
    const u = s.unit, shopU = u.u0 + u.w / 2;   // (the lantern hangs at the room's middle)
    const { M } = faceFrame(s.frame[0], s.frame[1], 0), e = M.elements;
    return { at: toW(M, shopU, -3.3), back: toW(M, shopU, -5.9), inward: [-e[8], -e[10]] };
  });
}
/** The Confessio's lamps (dress.js naveDress: the rail [cx + 5.8, cz − 4.2, cx + 13, cz + 4.2], the lamps 1.4 m over the floor). */
const CONF = [CROSSING[0] + 5.8, CROSSING[1] - 4.2, CROSSING[0] + 13, CROSSING[1] + 4.2];
/** The cressets at the Apostolic Palace's gate (the passage at x −110 in the south face, its piers 2 m either side) and at the Swiss posts at the colonnade's two mouths. */
export function cressets() {
  const gx = (COURT[0] + COURT[2]) / 2, out = [[gx - 3.4, PALACE[3] + 1.4], [gx + 3.4, PALACE[3] + 1.4]];
  for (const s of [-1, 1]) out.push([OVAL.c[0] + 60, s * 34.5]);
  return out;
}
const MILL_Z = [-52, 78, 205];
/** The feast night's lights in the oval [inferred: a confraternity's procession carried torches and tapers; the stalls of the fair and pilgrims on the road carried lanterns]: the procession's torches in its two files along z -7.4 (feast.js), the lanterns hung at the fair's stalls, and the hand lanterns of pilgrims about the oval's mouth, placed by hash. */
export function feastLights() {
  const out = [];
  for (let x = 52; x <= 94; x += 3.6) for (const s of [-1, 1]) out.push({ at: [x + 0.4 * hashAt(x, s, 61), -7.4 + s * 1.35], y: 2.05, r: 0.8, pool: 2.4, b: 0.75 });
  for (const [x, z] of [[93, -29], [90, 31], [68, 52], [66, -50], [31, -52]]) out.push({ at: [x, z], y: 2.4, r: 0.8, pool: 3.0, b: 0.8 });
  for (let i = 0; i < 14; i++) {
    const a = hashAt(i, 3, 62) * TAU, d = 4 + 11 * hashAt(i, 5, 63), x = 112 + Math.cos(a) * d * 1.4, z = Math.sin(a) * d;
    if (Math.abs(x - 110) < 1.3 && Math.abs(z) < 1.3) continue;
    out.push({ at: [x, z], y: 1.35 + 0.2 * hashAt(i, 7, 64), r: 0.55, pool: 2.6, b: 0.7 });
  }
  return out;
}

// ── the halos ───────────────────────────────────────────────────────────────────
export function halos() {
  const H = new Halo();
  for (const m of madonnelle()) {
    H.ball(m.at[0], m.y, m.at[1], 0.85);
    H.wall(m.at[0] - m.out[0] * 0.43, m.y, m.at[1] - m.out[1] * 0.43, m.out, 1.7, 1.4);
    H.floor(m.street[0], 0.03, m.street[1], 2.6, 2.6, 6, 0.8);
  }
  for (const w of litWindows()) {
    const [x, z] = w.at, t = [-w.out[1], w.out[0]], P = (s, y) => [x + t[0] * s * w.hw, y, z + t[1] * s * w.hw];
    H.quad(P(-1, w.y0), P(1, w.y0), P(1, w.y1), P(-1, w.y1), w.out, w.f);
  }
  for (const s of litShops()) {
    H.wall(s.at[0], 1.7, s.at[1], s.out, s.hw * 1.15, 1.7, 6, s.baker ? 0.95 : 0.8);
    H.floor(s.pool[0], 0.04, s.pool[1], 2.6, 2.0, 6, 0.9);
  }
  for (const l of shopLamps()) {            // inside the open bottegas: the lamp's glow under the vault, the pool on the floor, the wash on the back wall
    H.ball(l.at[0], 3.3, l.at[1], 1.5); H.floor(l.at[0], 0.09, l.at[1], 2.6, 2.6, 6, 0.9);
    H.wall(l.back[0], 1.9, l.back[1], l.inward, 2.3, 1.7, 6, 0.8);
  }
  // the Confessio: the lamps' glow along the four sides, the pool over the rail
  const y = FLOOR + 2.4, [x0, z0, x1, z1] = CONF;
  for (const [a, b] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) H.ball(a, y, b, 1.5);
  for (const q of [[(x0 + x1) / 2, z0], [(x0 + x1) / 2, z1], [x0, 0], [x1, 0], [(x0 + x1) / 2, 0]]) H.ball(q[0], y, q[1], q[1] === 0 && q[0] > x0 && q[0] < x1 ? 2.6 : 1.5);
  H.floor((x0 + x1) / 2, FLOOR + 0.12, 0, 5.6, 6.0, 8, 0.9);
  for (const l of feastLights()) { H.ball(l.at[0], l.y, l.at[1], l.r); H.floor(l.at[0], 0.03, l.at[1], l.pool, l.pool, 6, l.b); }
  // the cressets
  for (const [x, z] of cressets()) { const g = height(x, z); H.ball(x, g + 2.15, z, 1.3); H.floor(x, g + 0.03, z, 3.2); }
  // the gate's face and the Sixtine wing's windows
  const [px0, pz0, px1, pz1] = PALACE;
  for (const [f, rect] of [['s', PALACE], ['e', PALACE]]) {
    const { M, L } = faceFrame(rect, f, 0), e = M.elements, n = Math.max(4, Math.round(L / 5)), bay = L / n, gu = ((COURT[0] + COURT[2]) / 2) - px0;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) * bay;
      for (const [y0, h, hw, sd] of [[6.3, 3.2, 0.8, 41], [11.7, 2.9, 0.75, 42]]) {
        if (f === 's' && Math.abs(u - gu) < 3.8) continue;
        const [x, z] = toW(M, u, 0.05);
        if (hashAt(x, z, sd) >= (y0 < 8 ? 0.45 : 0.3)) continue;
        const t = [-e[10], e[8]], P = (s, yy) => [x + t[0] * s * (hw - 0.05), yy, z + t[1] * s * (hw - 0.05)];
        H.quad(P(-1, y0 + 0.1), P(1, y0 + 0.1), P(1, y0 + h - 0.1), P(-1, y0 + h - 0.1), [e[8], e[10]], 0.5 + 0.3 * hashAt(x, z, sd + 5));
      }
    }
  }
  void px1; void pz0; void pz1;
  // Castel Sant'Angelo: fires on the four bastions and lit windows of the apartments
  const [cx, cz] = CASTEL.c, s = CASTEL.r * 1.5;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { H.ball(cx + dx * s, 12.6, cz + dz * s, 1.5); H.floor(cx + dx * s, 11.5, cz + dz * s, 3.4, 3.4, 6, 0.7); }
  {
    const aw = CASTEL.r * 0.5, ad = CASTEL.r * 0.42, ay = 8 + 20 + 1.4;
    for (const sg of [-1, 1]) for (const yy of [2.0, 7.2]) for (let k = -2; k <= 2; k++) {
      const wx = cx + k * aw * 0.38, wz = cz + sg * ad + sg * 0.13;
      if (hashAt(wx, wz, 51) < 0.55) H.quad([wx - 0.42, ay + yy + 0.1, wz], [wx + 0.42, ay + yy + 0.1, wz], [wx + 0.42, ay + yy + 1.9, wz], [wx - 0.42, ay + yy + 1.9, wz], [0, sg], 0.55);
    }
  }
  // the mills' lanterns and the coaches' lanterns
  for (const z of MILL_Z) { const x = tiberX(z) - 9 + 2.9; H.ball(x, TIBER.level + 2.4, z, 1.1); H.floor(x, TIBER.level + 0.95, z, 2.2, 2.2, 6, 0.7); }
  for (const c of COACH_SITES) for (const sx of [-1, 1]) {
    const lx = sx * 0.95, lz = -1.3, px = c.x + lx * Math.cos(c.rot) + lz * Math.sin(c.rot), pz = c.z - lx * Math.sin(c.rot) + lz * Math.cos(c.rot);
    H.ball(px, 2.5, pz, 0.7); H.floor(px, 0.03, pz, 2.0, 2.0, 6, 0.6);
  }
  return H;
}

// ── the props that carry the light ──────────────────────────────────────────────
/** { t: 'brm_cresset', at: [x, z], y }: an iron basket of fire on a post, 1.9 m (as Paris's), at the palace's gate and the Swiss posts. */
function cresset(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y;
  bag.add('timber', box(x - 0.075, y, z - 0.075, x + 0.075, y + 1.75, z + 0.075));
  bag.add('iron', lathe([[0.001, 0], [0.12, 0.08], [0.22, 0.3], [0.2, 0.34], [0.001, 0.24]], 8, null, x, y + 1.6, z));
  bag.add('flame', lathe([[0.001, 0.0], [0.17, 0.04], [0.08, 0.3], [0.001, 0.42]], 7, null, x, y + 1.88, z));
  col.circle(x, z, 0.3, y, y + 1.9);
}
/** { t: 'brm_night' }: the halos of the whole city, in one geometry of one material. */
function night(el, ctx) { halos().flush(ctx.bag); }
Object.assign(STYLES.baroque.elements, { brm_cresset: cresset, brm_night: night });

/** The night plan: one plan, one material's draw; the cressets with it. */
export function nightPlan() {
  const els = [{ t: 'brm_night' }];
  for (const [x, z] of cressets()) els.push({ t: 'brm_cresset', at: [x, z], y: height(x, z) });
  return { id: 'baroque-rome-night', style: 'baroque', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [125, 0], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [], elements: els };
}
void lots;
