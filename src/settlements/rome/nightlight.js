// Rome by night, the light the oil lamps, the torches and the lit rooms throw (docs/settlements/rome.md §4.18).
// Rome had no street lighting: what shone at night was the lamp of a shop open late, the lamp of a room seen
// through its shutters, the lamp before the household gods, and the torch of a slave before his master. At the
// low preset (pixel ratio 0.75, no pool of real lights) the lamps and fires already built (the `flame` and
// `glass_lamp` pieces, the plan lights of the forges, ovens and hearths) read as nothing, and the dark doorway
// panels of the shops show no sign of a lamp inside. Here the light is made of geometry in the engine's one
// additive material, `halo` (palette.js; materials.js 'halo'): light ADDED over what lies behind it, at night
// only (ENV.night), with no light, no shadow, no collision, no fog; invisible by day. The shape of each piece
// is carried by its normals (y: 1 at the middle of a disc, 0 at its rim), as in Suzhou's nightlight.js, of
// which the Halo class is the pattern (copied, not imported: that file holds Suzhou's canals).
//
// How it reaches the town: the shared `roman` style is left as it is; `rome-town` is a copy of it whose
// street and house elements are wrapped (`lit`), so that whatever they build near the visitor is looked at on
// the way: a doorway or window panel (a thin dark slab of the `opening` material) gets a pane of lamp light a
// hair in front of it (a share of them by hash, none where the boards of a shut shop cover it), a shop's
// doorstep a pool of light, a plan light or a small lamp or flame piece a glow ball. The far copies of the
// tiles (`simple`) are not lit. Everything is a function of the piece's own place: no counters, no Math.random.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { placeHanging, box, lathe, rod } from '../../core/geom.js';
import { assembly } from '../../objects/kit.js';
import '../../styles/roman/town.js';
import '../../styles/roman/street.js';
import '../../styles/roman/ways.js';
import '../../styles/roman/houses.js';
import './domus.js';
import './flats.js';
import './upper.js';
import './upper-rows.js';
import './upper-inns.js';

/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const TAU = Math.PI * 2;
const MAT = 'halo';
/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A flat disc (an ellipse) at c spanned by the unit axes U and V, semi-axes su, sv, in rings R of brightness F; a negative y (sign) marks water. */
  disc(c, U, V, su, sv, nh = null, segs = 8, F = [1, 0.42, 0], R = [0, 0.5, 1], sign = 1) {
    const at = (r, k) => { const a = k / segs * TAU, u = Math.cos(a) * su * R[r], v = Math.sin(a) * sv * R[r]; return [c[0] + U[0] * u + V[0] * v, c[1] + U[1] * u + V[1] * v, c[2] + U[2] * u + V[2] * v]; };
    const nm = (r, k) => { const a = k / segs * TAU, f = F[r], q = Math.sqrt(1 - f * f); return nh ? [nh[0] * q, f * sign, nh[1] * q] : [Math.cos(a) * q, f * sign, Math.sin(a) * q]; };
    const n = R.length - 1;
    for (let k = 0; k < segs; k++) {
      this.tri(at(0, k), nm(0, k), at(1, k), nm(1, k), at(1, k + 1), nm(1, k + 1));
      for (let r = 1; r < n; r++) {
        this.tri(at(r, k), nm(r, k), at(r + 1, k), nm(r + 1, k), at(r + 1, k + 1), nm(r + 1, k + 1));
        this.tri(at(r, k), nm(r, k), at(r + 1, k + 1), nm(r + 1, k + 1), at(r, k + 1), nm(r, k + 1));
      }
    }
  }
  /** A disc lying on a horizontal plane (the paving, a floor) at height y. */
  floor(x, y, z, r, rz = r, yaw = 0, segs = 8) {
    const s = Math.sin(yaw), c = Math.cos(yaw);
    this.disc([x, y, z], [c, 0, -s], [s, 0, c], r, rz, null, segs, [1, 0.42, 0], [0, 0.5, 1], 1);
  }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 8, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet (a window's lamp-lit shutter gap, a door's lit room) of brightness f (0..1), facing n = [x, z]. */
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

// ── the lit elements of the town ───────────────────────────────────────────────────────────────────────────────
/** The box of a geometry: [x0, y0, z0, x1, y1, z1]. */
function bboxOf(g) {
  if (!g.boundingBox) g.computeBoundingBox();
  const b = g.boundingBox;
  return [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z];
}
/**
 * Wrap a builder: `mode` 'row' (a row of tabernae: the doorway panels are left out of the near copy so that the shops
 * stand open to the street, as they were by day, and a share of the shops is lit within), 'insula' (the panels stay:
 * the shops of an insula are fronts only; a share of their doorways and windows show lamp light), 'lamps' (only the
 * lamps, flames and plan lights built inside). `base` is the original builder.
 */
export function lit(base, mode) {
  const f = (el, ctx) => {
    if (el.simple) return base(el, ctx);
    const H = new Halo(), real = ctx.bag, slabs = [], boards = [], y0 = el.y ?? 0;
    const rect = el.rect, cx = rect ? (rect[0] + rect[2]) / 2 : 0, cz = rect ? (rect[1] + rect[3]) / 2 : 0;
    const bag = new Proxy(real, {
      get(t, k) {
        if (k === 'add') return (mat, g) => {
          if (typeof mat === 'string' && g?.attributes?.position) {
            if (mat === 'opening' && mode !== 'lamps') {
              const b = bboxOf(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
              if (th <= 0.25 && w >= 0.4 && dy >= 0.4) {
                const door = b[1] - y0 < 0.6 && dy >= 2.6 && w >= 1.3;
                slabs.push({ b, door, thinX: dx < dz });
                if (mode === 'row' && door) return;               // the shop stands open to the street
              }
            } else if (mat === 'shutter_brown' && mode !== 'lamps') {
              const b = bboxOf(g);
              if (b[4] - b[1] >= 1.5) boards.push(b);
            } else if (mat === 'glass_lamp' || mat === 'flame') {
              const b = bboxOf(g);
              if (b[3] - b[0] < 0.5 && b[4] - b[1] < 0.6) H.ball((b[0] + b[3]) / 2, (b[1] + b[4]) / 2 + 0.05, (b[2] + b[5]) / 2, mat === 'flame' ? 0.55 : 0.75);
            }
          }
          return t.add(mat, g);
        };
        const v = t[k];
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
    // the plan lights (forges, ovens, hearths, lamps): the real light stays, and the glow is drawn
    const lights = new Proxy(ctx.lights ?? [], {
      get(t, k) {
        if (k === 'push') return (...ls) => { for (const l of ls) if (l?.at) H.ball(l.at[0], l.at[1], l.at[2], Math.min(1.2, 0.35 + 0.16 * (l.distance ?? 4))); return t.push(...ls); };
        const v = t[k];
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
    base(el, { ...ctx, bag, lights });
    // the panes and the pools
    for (const { b, door, thinX } of slabs) {
      const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
      const n = rect ? (thinX ? [mx >= cx ? 1 : -1, 0] : [0, mz >= cz ? 1 : -1]) : (thinX ? [1, 0] : [0, 1]);
      const along = thinX ? [b[2], b[5]] : [b[0], b[3]];
      // shut with boards over it?
      let cover = 0;
      for (const q of boards) {
        const a2 = thinX ? [q[2], q[5]] : [q[0], q[3]], dist = thinX ? Math.abs((q[0] + q[3]) / 2 - mx) : Math.abs((q[2] + q[5]) / 2 - mz);
        if (dist < 0.6 && q[1] < b[4] && q[4] > b[1]) cover += Math.max(0, Math.min(a2[1], along[1]) - Math.max(a2[0], along[0]));
      }
      if (cover > 0.45 * (along[1] - along[0])) continue;
      const h = hashAt(mx, mz, door ? 3 : 17 + Math.floor(b[1] / 2.5));
      if (door) {
        if (h > (mode === 'row' ? 0.6 : 0.5)) continue;
        const px = mx + n[0] * 1.5, pz = mz + n[1] * 1.5, gy = y0 + 0.06;
        H.floor(px, gy, pz, 2.6, 2.0, Math.atan2(n[0], n[1]));                      // the lamp-light across the doorstep
        if (mode === 'row') {
          const ix = mx - n[0] * 1.7, iz = mz - n[1] * 1.7;
          H.ball(ix, y0 + 2.4, iz, 1.5);                                            // the hanging lamp within
          H.floor(ix, y0 + 0.05, iz, 2.3, 1.7, Math.atan2(n[0], n[1]));
        } else paneOf(H, b, thinX, n, 0.55 + 0.4 * hashAt(mx, mz, 8), 0.04);
      } else if (h < 0.3) paneOf(H, b, thinX, n, 0.5 + 0.45 * hashAt(mx, mz, 9), 0.04);   // the lamp of a room behind its shutters
    }
    H.flush(real);
  };
  f.__lit = true;
  return f;
}
/** A lit pane on the outer face of a slab. */
function paneOf(H, b, thinX, n, f, off) {
  const m = 0.04, y0 = b[1] + m, y1 = b[4] - m;
  if (y1 - y0 < 0.15) return;
  if (thinX) { const x = (n[0] > 0 ? b[3] : b[0]) + n[0] * off, z0 = b[2] + m, z1 = b[5] - m; H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], n, f); }
  else { const z = (n[1] > 0 ? b[5] : b[2]) + n[1] * off, x0 = b[0] + m, x1 = b[3] - m; H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], n, f); }
}

// ── lamps in the open: the household gods' lamp at a crossroads, a torch before a litter ───────────────────────
// { t: 'rome_halo', at, y, rot, kind } — elements of the street life (instanced)
const KINDS = { shrine: 0, torch: 1 };
function unitOf(kind) {
  return assembly(`rome-halo|${kind}`, (a) => {
    const H = new Halo();
    if (kind === 'torch') {
      // a pine torch (taeda) with its iron cup, held at 1.9 m, and its flame; the glow and its pool on the street
      a('timber', rod([0, 0.9, 0], [0, 2.0, 0], 0.022, 5));
      a('iron', lathe([[0.04, 2.0], [0.07, 2.08], [0.06, 2.12], [0.001, 2.1]], 8));
      a('flame', lathe([[0.001, 2.12], [0.05, 2.15], [0.045, 2.27], [0.02, 2.42], [0.001, 2.5]], 6));
      H.ball(0, 2.3, 0, 1.4); H.floor(0, 0.06, 0, 4.0);
    } else {
      // the lamp before the lares of a crossroads shrine, on the altar's shelf: a small glow and a pool on the paving
      H.ball(0, 1.05, 0, 0.55); H.floor(0, 0.06, 0, 1.9);
    }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a(MAT, g);
  });
}
const REACH = 70;
function romeHalo(el, { bag }) {
  const U = unitOf(el.kind in KINDS ? el.kind : 'shrine'), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  for (const [mat, g] of Object.entries(U)) { if (bag.addInstance) bag.addInstance(mat, g.clone(), M, { reach: REACH }); else bag.add(mat, placeHanging(g.clone(), M)); }
}

/** Register the lit copy of the Roman town style and the street life's halo element. Safe to call once. */
let DONE = false;
export function registerNight() {
  if (DONE) return;
  DONE = true;
  if (STYLES.life) STYLES.life.elements.rome_halo = romeHalo;
  const R = STYLES.roman.elements, E = { ...R };
  for (const k of ['taberna_row', 'taberna_up']) if (R[k]) E[k] = lit(R[k], 'row');
  if (R.insula) E.insula = lit(R.insula, 'insula');
  for (const k of ['caupona_up', 'fullonica_up', 'caupona', 'fullonica', 'pistrinum', 'latrine']) if (R[k]) E[k] = lit(R[k], 'lamps');
  registerStyle('rome-town', { ...STYLES.roman, elements: E });
  const S = STYLES['rome-site'];
  if (S) for (const k of ['domus', 'insula_open', 'up_cells', 'up_cells_flat']) if (S.elements[k] && !S.elements[k].__lit) S.elements[k] = lit(S.elements[k], 'lamps');
}
registerNight();
void box;
