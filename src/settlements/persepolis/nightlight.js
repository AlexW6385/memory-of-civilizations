// Persepolis about 480 BC by night — what lit the terrace and the town, and the light it throws (docs/settlements/persepolis.md §23.2).
// The light of the place and date: the hearth and its embers in every house (the house's own fire seen through the slit windows and the open door), the clay
// lamp with a pinched rim burning oil (sesame or other oil) in a niche by the door [inferred: the Achaemenid lamp is the pinched-rim saucer of the Near East],
// bronze braziers and tall bronze lamp stands in the royal rooms (the furnish of §20), the coals of the incense stands before the throne, the furnace and the
// glaze-makers' kiln of the royal workshops, and the lit windows of the palaces' halls from the braziers within. Nothing more is claimed: no lanterns of paper
// or glass, no street lighting; the streets of Parsa were dark but for the doors.
// Everything here is geometry in one material, `halo` (palette.js 'halo'): light ADDED over what is behind it at night only, with no light, no shadow and no
// collision, so the day view is unchanged and the glow reads at the low preset. The shape of each piece is carried by its normals (y: 1 at a disc's middle,
// 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, and a pane in a lit window. Every element of the achaemenid style that
// makes a flame is wrapped here (the style's files stay as they were): the halo follows the flame the style draws, so a flame and its glow cannot part.
// Each light is a function of its own place: no counters, no Math.random. The method is that of the Suzhou and Knossos reference; nothing of theirs is imported.
import '../../styles/achaemenid/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { houseMake, houseDoor, frameOf } from '../../styles/achaemenid/houses-data.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const TAU = Math.PI * 2, MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material; the brightness is the normal's y (1 at a disc's middle, 0 at its rim). */
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
  /** A disc lying flat at height y (the ground or a floor), rx by rz across, k its strength. */
  floor(x, y, z, r, rz = r, segs = 8, k = 1) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [k, 0.42 * k, 0]); }
  /** The glow round a flame: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r, k = 0.62) {
    for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3 + 0.37, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [k, 0], [0, 1]); }
  }
  /** A flat sheet (a lit window) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/** The glow of one flame (its geometry g): the ball round it and, where a floor lies under it, the pool of light on the floor. */
function flameHalo(H, g, floor) {
  const b = bounds(g), h = b[4] - b[1], r = Math.max(0.34, Math.min(1.0, h * 3.0)), cx = (b[0] + b[3]) / 2, cz = (b[2] + b[5]) / 2, cy = b[1] + h * 0.45;
  H.ball(cx, cy, cz, r);
  if (floor !== undefined && cy - floor > 0.15 && cy - floor < 2.6) H.floor(cx, floor + 0.03, cz, Math.min(3.0, r * 3.2 + 0.6), Math.min(3.0, r * 3.2 + 0.6), 10, 0.75);
}

/**
 * Wrap a bag so that what the style adds is seen by the night: every `flame` gets its halo (and its pool on the floor `floor`), and, where `windows` is set,
 * the slit windows of a house (an 'opening' slab under 0.08 m thick, 0.5-1.3 m high, in a wall's plane, set above 0.9 m: the slits at 1.55 and 2.2 m and the
 * upper room's window) glow with the hearth behind them in `share` of the cases (by the hash of the window's own place), on the outward face only.
 */
function seen(ctx, el, floor, windows, share) {
  const H = new Halo(), real = ctx.bag, [x0, z0, x1, z1] = el.rect ?? [0, 0, 0, 0], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, y0 = el.y ?? 0;
  const bag = new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (g?.attributes?.position) {
          if (mat === 'flame') flameHalo(H, g, floor);
          else if (windows && mat === 'opening') {
            const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
            if (th < 0.08 && dy > 0.5 && dy < 1.3 && w > 0.14 && b[1] > y0 + 0.9) {
              const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
              if (hashAt(mx, mz, 31 + Math.floor(b[1] / 2.5)) < share) {
                const f = 0.42 + 0.34 * hashAt(mx, mz, 7), m = 0.03, o = 0.012;
                if (dx < dz) { const s = mx > cx ? 1 : -1, x = (s > 0 ? b[3] : b[0]) + s * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], [s, 0], f); }
                else { const s = mz > cz ? 1 : -1, z = (s > 0 ? b[5] : b[2]) + s * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], [0, s], f); }
              }
            }
          }
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { ctx: { ...ctx, bag }, H };
}

let depth = 0;
const nested = (fn, self, el, ctx) => { depth++; try { return fn.call(self, el, ctx); } finally { depth--; } };

/** A house of Parsa (or of the terrace): its hearth's glow through the slits, the pool before its door, the lamp in the niche beside it. */
const house = (fn) => function nightHouse(el, ctx) {
  if (depth > 0 || el.simple || !ctx?.bag) return nested(fn, this, el, ctx);
  const m = houseMake(el), S = seen(ctx, el, (el.y ?? 0) + (m.enter ? 0.08 : 0), true, m.kind === 'shop' ? 0.35 : 0.5);
  const r = nested(fn, this, el, S.ctx), H = S.H, { P, out } = frameOf(m.rect, m.front), d = houseDoor(el), y0 = el.y ?? 0;
  if (m.enter && m.kind !== 'shop') { const [px, pz] = P(d.a, -1.2); H.floor(px, y0 + 0.06, pz, 2.1, 1.5, 8, 0.6); }          // the fire's light spilling over the step
  else if (m.enter) { const [px, pz] = P(d.a + 0.65, -1.0); H.floor(px, y0 + 0.06, pz, 1.6, 1.2, 8, 0.4); }
  // the clay lamp in the niche beside the door (the niche on the side toward the door's left): lit where the hash says (oil is dear)
  if (m.kind !== 'shop' && hashAt(m.rect[0], m.rect[1], 53) < (m.tier === 0 ? 0.35 : 0.7)) {
    const [nx, nz] = P(d.a - d.w / 2 - 0.425, -0.16);
    H.ball(nx + out[0] * 0.06, y0 + 1.46, nz + out[1] * 0.06, 0.34, 0.55);
    H.floor(nx + out[0] * 0.7, y0 + 0.05, nz + out[1] * 0.7, 1.1, 1.1, 8, 0.45);
  }
  H.flush(ctx.bag);
  return r;
};

/** Any element that draws flames only: the halo of each. `floorOf(el)` the level under them. */
const flames = (fn, floorOf) => function nightFlames(el, ctx) {
  if (depth > 0 || el.simple || !ctx?.bag) return nested(fn, this, el, ctx);
  const S = seen(ctx, el, floorOf(el), false, 0), r = nested(fn, this, el, S.ctx);
  S.H.flush(ctx.bag);
  return r;
};

/** The through-windows of a hall (the Tachara's and the Hadish's frames, the Hundred Columns' north wall): where they stand, as the style's `wallSeg` places them. */
export function hallWindows(el) {
  const out = [];
  if (!el.windows || !(el.walls ?? 5) || el.simple) return out;
  const [x0, z0, x1, z1] = el.rect, pl = el.plinth ?? 0, y = (el.y ?? 0) + pl, th = el.walls ?? 5, doors = el.doors ?? 'nesw';
  const dw0 = Math.min(5, (x1 - x0) * 0.12), jw = 0.75, wwin = el.windowW ?? 1.2, wh = el.windowH ?? 1.3, sill = el.sill ?? 0.65;
  for (const [face, r] of [['n', [x0 - th, z0 - th, x1 + th, z0]], ['s', [x0 - th, z1, x1 + th, z1 + th]], ['w', [x0 - th, z0, x0, z1]], ['e', [x1, z0, x1 + th, z1]]]) {
    const nw = el.windows[face] ?? 0;
    if (!nw || (el.niches ?? '').includes(face)) continue;
    const alongX = r[2] - r[0] > r[3] - r[1], lo = alongX ? r[0] : r[1], hi = alongX ? r[2] : r[3], m = (lo + hi) / 2, dw = el.doorW?.[face] ?? dw0, door = doors.includes(face);
    const e0 = lo + th + 1.6, e1 = hi - th - 1.6, d0 = m - dw / 2 - jw - 1.6, d1 = m + dw / 2 + jw + 1.6;
    const parts = door ? [[e0, d0, Math.ceil(nw / 2)], [d1, e1, Math.floor(nw / 2)]] : [[e0, e1, nw]];
    for (const [s0, s1, n] of parts) for (let i = 0; i < n && s1 - s0 > 2.8; i++) {
      const u = s0 + (i + 0.5) * (s1 - s0) / n, outer = face === 'n' || face === 'w' ? (alongX ? r[1] : r[0]) : (alongX ? r[3] : r[2]);
      out.push({ face, alongX, u, g0: u - wwin / 2, g1: u + wwin / 2, outer, sg: face === 'n' || face === 'w' ? -1 : 1, y0: y + sill, y1: y + sill + wh });
    }
  }
  return out;
};
const hall = (fn) => function nightHall(el, ctx) {
  if (depth > 0 || el.simple || !ctx?.bag) return nested(fn, this, el, ctx);
  const r = nested(fn, this, el, ctx), H = new Halo();
  for (const w of hallWindows(el)) {
    const cu = w.alongX ? w.u : w.outer, cv = w.alongX ? w.outer : w.u;
    if (hashAt(cu, cv, 61) > 0.78) continue;                                    // a room unlit in one window of five
    const f = 0.5 + 0.3 * hashAt(cu, cv, 7), m = 0.04, o = w.sg * 0.02, p = w.outer + o;
    if (w.alongX) H.quad([w.g0 + m, w.y0 + m, p], [w.g1 - m, w.y0 + m, p], [w.g1 - m, w.y1 - m, p], [w.g0 + m, w.y1 - m, p], [0, w.sg], f);
    else H.quad([p, w.y0 + m, w.g0 + m], [p, w.y0 + m, w.g1 - m], [p, w.y1 - m, w.g1 - m], [p, w.y1 - m, w.g0 + m], [w.sg, 0], f);
  }
  H.flush(ctx.bag);
  return r;
};
/** The coals of an incense stand before the throne and at the way's head: a small red-gold glow over the bowl. */
const incense = (fn) => function nightIncense(el, ctx) {
  const r = fn.call(this, el, ctx);
  if (depth > 0 || el.simple || !ctx?.bag) return r;
  const [x, z] = el.at, y = el.y ?? 0, s = (el.h ?? 1.2) / 1.2, H = new Halo();
  H.ball(x, y + 1.14 * s, z, 0.3 * s, 0.5); H.floor(x, y + 0.03, z, 0.9, 0.9, 8, 0.28);
  H.flush(ctx.bag);
  return r;
};

let done = false;
/** Wraps the achaemenid style's elements that make light (once, after the style has registered). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.achaemenid.elements, level = (el) => el.y ?? 0;
  E.persian_house = house(E.persian_house);
  E.furnish = flames(E.furnish, level);
  E.royal_workshops = flames(E.royal_workshops, level);
  E.treasury = flames(E.treasury, (el) => (el.y ?? 0) + 0.06);
  E.audience = flames(E.audience, level);
  E.hall = hall(E.hall);
  E.incense_stand = incense(E.incense_stand);
}
registerNight();
