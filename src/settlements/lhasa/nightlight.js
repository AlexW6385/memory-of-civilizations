// Lhasa by night: the light the butter lamps and the lit rooms throw (docs/settlements/lhasa.md §19). Butter lamps, lanterns and the hearth's glow were
// the light of the town and the palace in 1694 [inferred; the butter lamp: Wikipedia, Butter lamp]. The flames of the style glow of themselves; what they
// lack, where the pool of real lights is off (the low preset), is the light they give the things round them. Here it is made of geometry in the engine's one
// additive material `halo` (palette.js, materials.js 'halo'): light ADDED over what is behind it, at night only, with no light, no shadow and no collision.
// The pattern is that of Suzhou's and Bhaktapur's nightlight.js, copied and adapted (nothing imported from them). Two routes:
//   - the palace's windows and the halls' lamp tables go into the plan's own mesh of the material (the style's builders wrapped here: a pane of lamp-light
//     behind a share of the windows win() reports, a glow over the table of butter lamps in the Great East Hall, the tomb hall and the chapel of the wheel);
//   - the town's are `lhasa_halo` elements of the street life (instanced, drawn within 60 m of the eye): the shops' open fronts and the tea houses, the paper
//     lanterns hung at their doors, the juniper burner's embers, and a pane behind a share of the windows of Shöl's houses (a replay of the house builder:
//     styles/tibetan houseWindows).
// Everything is a function of the lamp's own place or the lot's seed: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { placeHanging } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { assembly } from '../../objects/kit.js';
import { litSink, houseWindows } from '../../styles/tibetan/index.js';
import { lots, shops, CHAPEL, SHOL, inRect } from './layout.js';
import { dressing } from './dress.js';
import { SANG } from './soundmap.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** The share of the trading houses still open into the evening, their lamp lit; the tea houses stay open late [inferred: the evening's trade, as in any market town]. */
export const SHOP_LIT = 0.5, TEA_LIT = 1;
/** The share of the rooms (a storey of a house, a cell of 6 m) with a lamp or the hearth lit behind their lattice; the palace's windows. */
export const ROOM_LIT = 0.3, PALACE_LIT = 0.2, QUARTERS_LIT = 0.5;
/** Windows of Shöl's houses are lit within this distance of the lane's crossing (0, 134), m. */
const WIN_REACH = 135, HALO_REACH = 60;

const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material (the normal's y is the brightness, 1 at a disc's middle, 0 at its rim). */
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
  /** A disc lying on a horizontal plane at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8, k = 1) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [k, 0.42 * k, 0], [0, 0.5, 1]);
  }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 8, k = 1) {
    this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9 * k, 0], [0, 1]);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit lattice) of brightness f, facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  /** Into the bag, one geometry. */
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g);
    this.pos = []; this.nor = [];
  }
}

// ── the units: built at the lamp's foot (the origin), +z outward from the wall behind (at −z) ───────────────
function unitOf(kind, w = 1, h = 1, f = 0.55) {
  return assembly(`lhs-halo|${kind}|${w}|${h}|${f}`, (a) => {
    const H = new Halo();
    if (kind === 'door') { H.ball(0, 1.5, -1.0, 1.0); H.floor(0, 0.07, 1.4, 2.0, 1.6, 0, 10, 0.85); H.floor(0, 0.07, -1.3, 1.5, 1.3, 0, 8, 0.7); }       // an open front: the lamps within, the spill across the street, the lit floor
    else if (kind === 'tea') { H.ball(0, 1.5, -1.2, 1.3); H.ball(0, 1.6, 0.0, 0.8); H.floor(0, 0.07, 1.5, 2.4, 1.9, 0, 10, 0.95); H.floor(0, 0.07, -1.5, 2.0, 1.6, 0, 8, 0.8); }
    else if (kind === 'hang') { H.ball(0, 0, 0.0, 0.85); H.floor(0, -2.45, 0.0, 1.35, 1.35, 0, 8, 0.8); H.wall(0, 0, -0.22, [0, 1], 1.1, 0.9, 8, 0.6); }          // a paper lantern hung from the eave, 2.45 m up
    else if (kind === 'ember') { H.ball(0, 1.55, 0, 0.7); H.floor(0, 0.04, 0, 1.6, 1.6, 0, 8, 0.8); }                                                         // the juniper burner's embers at its mouth
    else if (kind === 'altar') { H.ball(0, 0, 0, 1.2); H.floor(0, -1.2, 0, 2.2, 2.2, 0, 8, 0.8); }                                                           // a table of butter lamps (1.2 m up)
    else if (kind === 'pane') H.quad([-w / 2, 0, 0], [w / 2, 0, 0], [w / 2, h, 0], [-w / 2, h, 0], [0, 1], f);
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
/** lhasa_halo { kind, at, y, rot (+z outward), w, h, f (a pane's size and strength) }: one piece of lamp light, instanced like the lamps themselves. */
function lhasaHalo(el, { bag }) {
  const U = unitOf(el.kind, el.w, el.h, el.f), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: HALO_REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}

// ── where the light is ───────────────────────────────────────────────────────────────────────────────────
/** A lit pane behind the lattice of a window win() reported: into H (a Halo), or as an element of the street life (put). Both share the room's cell for the hash. */
const rot = (n) => Math.atan2(n[0], n[1]);
const paneOf = (W) => {
  const [a, b, , d] = W.q, w = Math.hypot(b[0] - a[0], b[2] - a[2]), h = d[1] - a[1], mx = (a[0] + b[0]) / 2, mz = (a[2] + b[2]) / 2;
  return { at: [mx, mz], y: a[1], rot: rot(W.n), w: Math.round(w * 8) / 8, h: Math.round(h * 8) / 8 };
};
const roomLit = (W, share) => hashAt(Math.floor(W.c[0] / 6) * 6, Math.floor(W.c[1] / 6) * 6, 11 + Math.floor(W.y / 3)) < share;
const strength = (W) => [0.45, 0.6, 0.78][Math.floor(3 * hashAt(W.c[0], W.c[1], 23 + Math.floor(W.y / 3)))];

/** The street life's elements for the night: every halo of the town. */
export function nightElements() {
  const out = [], put = (kind, at, y, r, o = {}) => out.push({ t: 'lhasa_halo', kind, at, y, rot: r, ...o });
  // the street's shops: the open front's lamp-light across the street; the tea houses always, the trading houses by their share
  for (const s of shops()) {
    if (s.kind === 'stall') continue;
    const [x0, z0, x1, z1] = s.rect, e = s.door === 'e', at = [e ? x1 : x0, (z0 + z1) / 2];
    if (s.kind === 'tea' ? TEA_LIT >= 1 : hashAt(at[0], at[1], 5) < SHOP_LIT) put(s.kind === 'tea' ? 'tea' : 'door', at, 0, e ? Math.PI / 2 : -Math.PI / 2);
  }
  // the paper lanterns hung at the shop fronts (dress.js)
  for (const l of dressing().life) if (l.t === 'hang_lantern') put('hang', l.at, l.y - 0.63, l.rot);
  // the incense burners' embers: the street's and the one by the outer pillar's heap
  put('ember', SANG, 0, 0); put('ember', [-10.5, 234], 0, 0);
  // the houses' windows, a share of the rooms: the replay of the house builder gives the windows it makes
  for (const l of lots()) {
    const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2;
    if (l.farm || !inRect(SHOL, cx, cz) || Math.hypot(cx, cz - 134) > WIN_REACH) continue;
    for (const W of houseWindows({ t: 'tibetan_house', ...l, y: 0 })) {
      if (!roomLit(W, ROOM_LIT)) continue;
      put('pane', ...(({ at, y, rot: r, w, h }) => [at, y, r, { w, h, f: strength(W) }])(paneOf(W)));
    }
  }
  // the chapel of the great wheel: its door's lamps (the butter lamps burn day and night)
  put('door', [CHAPEL[0] - 0.05, (CHAPEL[1] + CHAPEL[3]) / 2], 0, -Math.PI / 2);
  return out;
}

// ── the plan's own: the palace's windows, the halls' lamp tables ─────────────────────────────────────────────
/** Wrap a style element so the windows it builds glow at night (a share of the rooms) and its lamp tables shed light: STYLES.tibetan.elements[name]. */
function wrapElement(name, glow = null, share = () => PALACE_LIT) {
  const S = STYLES.tibetan;
  if (!S?.elements[name] || S.elements[name].__lit) return;
  const base = S.elements[name];
  const f = (el, ctx) => {
    const H = new Halo(), prev = litSink.fn;
    litSink.fn = (W) => {
      if (!roomLit(W, share(W))) return;
      const f2 = strength(W), [a, b, c, d] = W.q;
      H.quad(a, b, c, d, W.n, f2);
    };
    try { base(el, ctx); } finally { litSink.fn = prev; }
    if (glow) glow(H, el);
    H.flush(ctx.bag);
  };
  f.__lit = true;
  S.elements[name] = f;
}
const quarters = (W) => (W.y > 60 && W.c[0] > 44 && W.c[0] < 100 && W.c[1] < -40 ? QUARTERS_LIT : PALACE_LIT);
/** The glow over a table of butter lamps: a ball over it and a pool on the floor; positions as the style lays the tables (index.js potalaHall, tombChapel, lhakhang). */
const table = (H, x, y, z) => { H.ball(x, y + 1.2, z, 1.3); H.floor(x, y + 0.06, z, 2.6, 2.6, 0, 8, 0.8); };
export function registerNight() {
  if (STYLES.life) STYLES.life.elements.lhasa_halo = lhasaHalo;
  wrapElement('dzong', null, quarters);
  wrapElement('parkhang', null, () => 0.6);
  wrapElement('potala_hall', (H, el) => { const [x0, z0, x1, z1] = el.rect; table(H, x0 + 3.4, el.y, (z0 + z1) / 2); table(H, x0 + 3.4, el.y, (z0 + z1) / 2 - 2.2); }, () => 0);
  wrapElement('tomb_chapel', (H, el) => { table(H, el.c[0], el.y, el.c[1] + 3.0); table(H, el.c[0], el.y, el.c[1] - 3.0); }, () => 0);
  wrapElement('lhakhang', (H, el) => { const [x0, z0, x1, z1] = el.rect; table(H, x1 - 1.6, el.y, (z0 + z1) / 2); }, () => 0);
}
registerNight();
