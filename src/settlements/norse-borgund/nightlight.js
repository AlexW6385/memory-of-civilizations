// Borgund about 1250 by night — what lit the valley and the light it throws (docs/settlements/norse-borgund.md, "Round 6", §N).
// In the Lærdal of the thirteenth century light is fire. The dwelling's one light is its hearth (åre) on the floor of the smoke-room house, kept
// banked through the night: its glow reaches the room's small wall openings and the smoke-hole (ljore) on the ridge, and the open door of a lit
// house lays a pool on its step. The barn's byre was seen to with a horn lantern on its beam; the farm smith's forge threw red light out of his door
// while he worked; the church had its two wax candles on the altar. Nobody crossed the valley after dark without a pine-splinter torch.
// [inferred throughout, from the period's habits; no source describes Borgund's night]
// Everything here is geometry in one material, `halo` (palette.js): light ADDED over what is behind it at night only, with no light, no shadow and no
// collision, so the day view is unchanged and it shows at the low preset. The shape of each piece is carried by its normals (y: 1 at a disc's middle,
// 0 at its rim): a glow round each flame (three crossed discs), a pool on the floor, a pane before a lit opening. The style's `log_house` and
// `stave_church` are wrapped from here (the style file stays as it was); each light is a function of its own place (no counters, no Math.random).
// The method is that of the Suzhou reference, written for Borgund's fires; nothing of Suzhou's is imported.

import '../../styles/norse/index.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { doorOf } from './layout.js';

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
  /** A flat sheet (a lit opening) of brightness f, facing n = [x, z]. */
  quad(a, b, c, d, n, f) { const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q]; this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N); }
  flush(bag) {
    if (!this.pos.length) return;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    bag.add(MAT, g); this.pos = []; this.nor = [];
  }
}

/** The halo of one light of a plan (`lights` entries: { at, distance, intensity }); `floor` the height of the floor or ground it stands over, if known. */
export function lightHalo(H, l, floor) {
  const [x, y, z] = l.at, d = l.distance ?? 6, k = Math.min(1, (l.intensity ?? 2) / 2.4);
  H.ball(x, y, z, Math.max(0.42, Math.min(0.95, d * 0.11)) * (0.8 + 0.2 * k));
  if (floor !== undefined && y - floor < 3.0 && y - floor > 0.2) H.floor(x, floor + 0.03, z, Math.max(1.3, Math.min(3.4, d * 0.42)), Math.max(1.3, Math.min(3.4, d * 0.42)), 10, 0.8);
}

const bounds = (g) => {
  const P = g.attributes.position.array, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < b[k]) b[k] = P[i + k]; if (P[i + k] > b[k + 3]) b[k + 3] = P[i + k]; }
  return b;
};

/**
 * Wrap a house's bag so that the style's openings are seen: a wall opening (a slab under 0.05 m thick, 0.4–1.0 m high, 1.3 m or more above the
 * floor, within 0.2 m of a wall face) glows with the hearth behind it in `share` of the cases (by the hash of its own place), on the outward face
 * only; and the smoke-hole's opening on the ridge (a slab under 0.4 m high, above 2.4 m over the floor) is returned as a spot of the fire's light.
 */
function seeOpenings(ctx, el, share, H, smoke) {
  const real = ctx.bag, [x0, z0, x1, z1] = el.rect, y0 = el.y ?? 0;
  return new Proxy(real, {
    get(t, k) {
      if (k === 'add') return (mat, g, ...r) => {
        if (mat === 'opening' && g?.attributes?.position) {
          const b = bounds(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
          if (th < 0.05 && dy > 0.4 && dy < 1.0 && w > 0.3 && b[1] > y0 + 1.3 && b[1] < y0 + 2.4) {
            const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
            const side = dx < dz ? (Math.abs(mx - x1) < 0.2 ? [1, 0] : Math.abs(mx - x0) < 0.2 ? [-1, 0] : null) : (Math.abs(mz - z1) < 0.2 ? [0, 1] : Math.abs(mz - z0) < 0.2 ? [0, -1] : null);
            if (side && hashAt(mx, mz, 31) < share) {
              const f = 0.42 + 0.3 * hashAt(mx, mz, 7), m = 0.03, o = 0.012;
              if (side[0]) { const x = (side[0] > 0 ? b[3] : b[0]) + side[0] * o; H.quad([x, b[1] + m, b[2] + m], [x, b[1] + m, b[5] - m], [x, b[4] - m, b[5] - m], [x, b[4] - m, b[2] + m], side, f); }
              else { const z = (side[1] > 0 ? b[5] : b[2]) + side[1] * o; H.quad([b[0] + m, b[1] + m, z], [b[3] - m, b[1] + m, z], [b[3] - m, b[4] - m, z], [b[0] + m, b[4] - m, z], side, f); }
            }
          } else if (th < 0.8 && dy < 0.4 && b[1] > y0 + 2.4 && (el.kind === 'stue' || el.kind === 'smithy')) smoke.push([(b[0] + b[3]) / 2, b[4], (b[2] + b[5]) / 2]);
        }
        return t.add(mat, g, ...r);
      };
      const v = t[k];
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
}

/** Whether the household's fire is seen at night: the hearth stayed banked in most, a few had let it die to the embers (by the house's own seed). */
const lit = (el) => hashAt(el.rect[0], el.rect[1], 5) < 0.85;

const wrapHouse = (fn) => function haloed(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  if (!lights || el.simple || !el.open) return fn.call(this, el, ctx);
  const H = new Halo(), smoke = [], y = el.y ?? 0;
  const r = fn.call(this, { ...el }, { ...ctx, bag: seeOpenings(ctx, el, lit(el) ? 0.8 : 0, H, smoke) });
  const on = el.kind === 'barn' || lit(el);
  if (on) {
    for (const l of lights.slice(n)) lightHalo(H, l, y + 0.17);
    // the door ajar: the hearth's (or the forge's, the byre lantern's) light spilling over the step into the yard
    const { at, n: nn } = doorOf(el), px = at[0] + nn[0] * 1.3, pz = at[1] + nn[1] * 1.3;
    H.floor(px, y + 0.05, pz, el.kind === 'barn' ? 2.0 : 1.7, 1.3, 8, el.kind === 'smithy' ? 0.8 : 0.58);
    // the smoke-hole's mouth over the fire: a warm spot where the sparks go up with the smoke
    for (const [sx, sy, sz] of smoke) H.ball(sx, sy + 0.1, sz, el.kind === 'smithy' ? 0.85 : 0.6, el.kind === 'smithy' ? 0.7 : 0.5);
    if (el.kind === 'smithy') { const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; H.ball(cx, y + 1.1, cz, 0.9, 0.85); }
  }
  H.flush(ctx.bag);
  return r;
};

const wrapChurch = (fn) => function haloedChurch(el, ctx) {
  const lights = ctx?.lights, n = lights ? lights.length : 0;
  const r = fn.call(this, el, ctx);
  if (!lights || el.simple) return r;
  const H = new Halo(), fl = (el.y ?? 0) + 0.35 * (el.s ?? 1);
  // the altar's two wax candles in the apse: a glow round each flame and the pool on the altar's floor
  for (const l of lights.slice(n)) lightHalo(H, l, fl);
  H.flush(ctx.bag);
  return r;
};

let done = false;
/** Wraps the style's log houses and church (once, after the style has registered). */
export function registerNight() {
  if (done) return; done = true;
  const E = STYLES.norse.elements;
  if (typeof E.log_house === 'function') E.log_house = wrapHouse(E.log_house);
  if (typeof E.stave_church === 'function') E.stave_church = wrapChurch(E.stave_church);
}
registerNight();
