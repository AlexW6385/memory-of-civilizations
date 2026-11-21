// Lisbon by night about 1520 (docs/settlements/manueline-lisbon.md §13.1). The city had no street lighting: what shone was a lamp
// in an upper room seen through its window, the hearth and lamp of an inn or a home through its open door, the lamp a neighbour
// kept burning before an image at a lane's corner, the hanging lamps and candles of the churches, the lantern on a carrack's
// poop, the guards' braziers and torches at the palace, the castle gate and the shipyard. At the low preset (pixel ratio 0.75,
// no pool of real lights) the `flame` and `glass_lamp` pieces and the plan lights read as nothing; here each is given the light
// it throws, made of geometry in the engine's one additive material `halo` (palette.js; materials.js 'halo'): light ADDED over
// what lies behind it, at night only (ENV.night), no light, no shadow, no collision, invisible by day. The shape of each piece
// is carried by its normals (y: 1 at the middle of a disc, 0 at its rim). The Halo class is Ming Suzhou's pattern, copied (that
// file imports Suzhou's layout).
//
// How it reaches the town: the Manueline style is Lisbon's alone, and its builders are wrapped IN PLACE at import (`lit`): the
// wrapper hands the real builder a bag that looks at what is added (a thin dark `opening` slab, a thin sky-lit `daylight` pane,
// a small `flame` or `glass_lamp`, a plan light) and, when the real builder is done, adds the halo of each from the piece's own
// place: nothing is counted, nothing is random, every number is a function of position (hashAt). The far copies (`simple`) are
// not lit. Lights of the lamps are [inferred] throughout.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { placeHanging, box, lathe, rod } from '../../core/geom.js';
import { assembly } from '../../objects/kit.js';
import { frame } from '../../styles/greek/agora.js';
import { churchFrame } from '../../styles/manueline/church.js';
import '../../styles/manueline/index.js';
import { WALK_POSTS } from './route.js';
import { CHURCH, PORTAL_X, GROUND, CASTLE, YARD, ALLEYS, height, lots, onStreet } from './layout.js';

const TAU = Math.PI * 2;
/** A number in [0, 1) from a position alone. */
export function hashAt(x, z, s = 0) {
  let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Triangles (position and a normal per corner) of the halo material. */
export class Halo {
  constructor() { this.pos = []; this.nor = []; }
  tri(p0, n0, p1, n1, p2, n2) { this.pos.push(...p0, ...p1, ...p2); this.nor.push(...n0, ...n1, ...n2); }
  /** A disc at c spanned by the unit axes U and V, semi-axes su, sv, in rings R of brightness F (the normal's y). */
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
  /** A disc lying on a horizontal plane (the paving, a floor) at height y. */
  floor(x, y, z, r, rz = r, segs = 6) { this.disc([x, y, z], [1, 0, 0], [0, 0, 1], r, rz, null, segs, [1, 0.42, 0], [0, 0.5, 1]); }
  /** A disc standing on a wall at (x, y, z), the wall's outward normal nh = [x, z]; rw wide and rh high (semi-axes). */
  wall(x, y, z, nh, rw, rh, segs = 6) { this.disc([x, y, z], [-nh[1], 0, nh[0]], [0, 1, 0], rw, rh, nh, segs, [0.9, 0], [0, 1]); }
  /** The glow round a flame at (x, y, z), radius r: three upright discs crossed at 60 degrees. */
  ball(x, y, z, r) {
    for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a); this.disc([x, y, z], [c, 0, s], [0, 1, 0], r, r, [-s, c], 6, [0.62, 0], [0, 1]); }
  }
  /** A flat sheet of brightness f (0..1), facing n = [x, z] (both faces are seen). */
  quad(a, b, c, d, n, f) {
    const q = Math.sqrt(1 - f * f), N = [n[0] * q, f, n[1] * q];
    this.tri(a, N, b, N, c, N); this.tri(a, N, c, N, d, N);
  }
  get length() { return this.pos.length; }
  geometry() {
    if (!this.pos.length) return null;
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new Float32BufferAttribute(this.nor, 3));
    this.pos = []; this.nor = [];
    return g;
  }
  /** Into the bag, one geometry. */
  flush(bag) { const g = this.geometry(); if (g) bag.add('halo', g); }
}

/** The box of a geometry: [x0, y0, z0, x1, y1, z1]. */
function bboxOf(g) {
  if (!g.boundingBox) g.computeBoundingBox();
  const b = g.boundingBox;
  return [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z];
}
/** A lit pane on the outer face of a thin slab b whose thin axis is x (thinX) or z, facing n = [x, z]. */
function paneOf(H, b, thinX, n, f, off = 0.04) {
  const m = 0.06, y0 = b[1] + m, y1 = b[4] - m;
  if (y1 - y0 < 0.15) return;
  if (thinX) { const x = (n[0] > 0 ? b[3] : b[0]) + n[0] * off, z0 = b[2] + m, z1 = b[5] - m; if (z1 - z0 > 0.1) H.quad([x, y0, z0], [x, y0, z1], [x, y1, z1], [x, y1, z0], n, f); }
  else { const z = (n[1] > 0 ? b[5] : b[2]) + n[1] * off, x0 = b[0] + m, x1 = b[3] - m; if (x1 - x0 > 0.1) H.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], n, f); }
}

/** How much of the night an open house's door shows its lamp, by its trade or use (the tavern, the baker, the apothecary on duty and the homes late; the rest shut). */
const OPEN_LIT = { tavern: 1, baker: 1, apothecary: 0.7, home: 0.85, chandler: 0.45, scribe: 0.4, spice: 0.3, porcelain: 0.2, cloth: 0.2, jeweller: 0.15, parrots: 0.2, grocer: 0.45, sailmaker: 0.3, cooper: 0.3, smith: 0.25 };
/** The share of upper windows lit, by floor: the first floor's families sat up, the higher ones' less. */
const FLOOR_LIT = (k) => Math.max(0.1, 0.38 - 0.08 * k);

/**
 * Wrap a builder. mode 'house': the manu_house (windows, doors of open houses, lamps near the door); 'rooms': a landmark's lamps,
 * flames and sky-lit windows (a share glow as if lit from within); `lamps` as 'rooms' without the windows.
 */
export function lit(base, mode) {
  const f = (el, ctx) => {
    if (el.simple) return base(el, ctx);
    const H = new Halo(), real = ctx.bag, slabs = [], panes = [], y0 = el.y ?? 0, rect = el.rect;
    const cx = rect ? (rect[0] + rect[2]) / 2 : 0, cz = rect ? (rect[1] + rect[3]) / 2 : 0;
    const house = mode === 'house', F = house ? frame(el.rect, el.front ?? 's') : null;
    const door = house && el.open ? F.P(F.L / 2, 0) : null;
    const bag = new Proxy(real, {
      get(t, k) {
        if (k === 'add') return (mat, g) => {
          if (typeof mat === 'string' && g?.attributes?.position) {
            if (mat === 'opening' && house) {
              const b = bboxOf(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
              if (th <= 0.3 && w >= 0.4 && dy >= 0.4 && b[1] - y0 > 2.4) slabs.push({ b, thinX: dx < dz });
            } else if ((mat === 'daylight_plain' || mat === 'daylight') && mode !== 'lamps') {
              const b = bboxOf(g), dx = b[3] - b[0], dz = b[5] - b[2], dy = b[4] - b[1], th = Math.min(dx, dz), w = Math.max(dx, dz);
              if (th <= 0.3 && w >= 0.6 && dy >= 0.6) panes.push({ b, thinX: dx < dz });
            } else if (mat === 'glass_lamp' || mat === 'lamp_glass' || mat === 'flame') {
              const b = bboxOf(g);
              if (b[3] - b[0] < 0.5 && b[4] - b[1] < 0.6 && (!house || door)) {
                const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2;
                if (!house || (Math.hypot(mx - door[0], mz - door[1]) < 7 && b[1] < y0 + 3.6)) H.ball(mx, (b[1] + b[4]) / 2 + 0.05, mz, mat === 'flame' ? 0.5 : 0.7);
              }
            }
          }
          return t.add(mat, g);
        };
        const v = t[k];
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
    const lights = new Proxy(ctx.lights ?? [], {
      get(t, k) {
        if (k === 'push') return (...ls) => {
          for (const l of ls) if (l?.at && (!house || (door && Math.hypot(l.at[0] - door[0], l.at[2] - door[1]) < 8 && l.at[1] < y0 + 3.6))) H.ball(l.at[0], l.at[1], l.at[2], Math.min(1.3, 0.35 + 0.12 * (l.distance ?? 4)));
          return t.push(...ls);
        };
        const v = t[k];
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
    base(el, { ...ctx, bag, lights });
    if (house) {
      // the lamps of the upper rooms seen through their windows
      for (const { b, thinX } of slabs) {
        const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2, n = thinX ? [mx >= cx ? 1 : -1, 0] : [0, mz >= cz ? 1 : -1];
        const floor = Math.max(1, Math.round((b[1] - y0 - 0.8) / 3.2));
        if (hashAt(mx, mz, 17 + floor) < FLOOR_LIT(floor)) paneOf(H, b, thinX, n, 0.42 + 0.4 * hashAt(mx, mz, 9));
      }
      // the hearth and lamp of an open house through its door: the pool across the doorstep and the glow within
      if (door) {
        const use = el.use ?? 'home';
        if (hashAt(door[0], door[1], 3) < (OPEN_LIT[use] ?? 0.3)) {
          const o = F.out, gy = y0 + 0.08;
          H.floor(door[0] + o[0] * 1.5, gy, door[1] + o[1] * 1.5, 2.5, 2.0);
          const inn = F.P(F.L / 2, 2.6);
          H.ball(inn[0], y0 + 2.3, inn[1], 1.5); H.floor(inn[0], y0 + 0.5, inn[1], 2.2, 1.7);
        }
      }
    } else if (mode === 'rooms') {
      // a share of the sky-lit windows shows the lamps within
      for (const { b, thinX } of panes) {
        const mx = (b[0] + b[3]) / 2, mz = (b[2] + b[5]) / 2, n = thinX ? [mx >= cx ? 1 : -1, 0] : [0, mz >= cz ? 1 : -1];
        if (hashAt(mx, mz, 23) < 0.6) paneOf(H, b, thinX, n, 0.34 + 0.3 * hashAt(mx, mz, 5), 0.05);
      }
    }
    H.flush(real);
  };
  f.__lit = true;
  return f;
}

/** The Jerónimos church: its candles and lamps (flames, hanging lamps), and its tall windows lit by the monks' candles at Matins. */
function litChurch(base) {
  const inner = lit(base, 'lamps'), f = (el, ctx) => {
    inner(el, ctx);
    if (el.simple) return;
    const H = new Halo(), F = churchFrame(el.rect), [, , , z1] = el.rect, y = el.y ?? 0, T = 1.5, zw = z1 - T / 2 + 0.05;
    const px = el.portalX ?? PORTAL_X;
    for (let b = 0; b < 5; b++) {
      const uc = (F.bays[b] + F.bays[b + 1]) / 2;
      if (Math.abs(uc - px) <= 6.2 || hashAt(uc, 1, 31) > 0.7) continue;
      H.quad([uc - 1.9, y + 9.2, zw], [uc + 1.9, y + 9.2, zw], [uc + 1.9, y + 17.4, zw], [uc - 1.9, y + 17.4, zw], [0, 1], 0.28 + 0.15 * hashAt(uc, 2, 32));
    }
    H.quad([F.xi0 - 0.05, y + 9.2, F.zc - 2.8], [F.xi0 - 0.05, y + 9.2, F.zc + 2.8], [F.xi0 - 0.05, y + 18.6, F.zc + 2.8], [F.xi0 - 0.05, y + 18.6, F.zc - 2.8], [-1, 0], 0.36);
    H.flush(ctx.bag);
  };
  f.__lit = true;
  return f;
}

/** The lantern on a ship's poop: the carrack's at the top of the sterncastle, the caravel's on its small castle; none on a barca. */
function litShip(base) {
  const f = (el, ctx) => {
    base(el, ctx);
    const kind = el.kind ?? 'carrack';
    if (el.simple || kind === 'barca') return;
    const L = el.len ?? 30, S = L / 30, H = new Halo();
    const [y, z, r] = kind === 'carrack' ? [10.9 * S, L * 0.47, 2.1 * S + 0.8] : [4.2 * S, L * 0.45, 1.4 * S + 0.6];
    H.ball(0, y, z, r);
    const g = H.geometry();
    g.rotateY(el.rot ?? 0); g.translate(el.at[0], el.y ?? 0, el.at[1]);
    ctx.bag.add('halo', g);
  };
  f.__lit = true;
  return f;
}

// ── lamps in the open: a lane's shrine, a brazier, a torch on a bracket, the iron lanterns on their posts ──────────
// { t: 'lisbon_halo', at, y, rot, kind } — elements of the houses' tiles (style manueline: merged with the tile's own detail, so that the
// lamps add no draw of their own), near copies only
const KINDS = { shrine: 0, brazier: 1, torch: 2, post: 3 };
function unitOf(kind) {
  return assembly(`lisbon-halo|${kind}`, (a) => {
    const H = new Halo();
    if (kind === 'shrine') {
      // a limestone pier 2.3 m high with a niche (facing +z), a small canopy, the image of the Virgin and a hanging oil lamp on an iron arm
      a('limestone', box(-0.26, 0, -0.26, 0.26, 2.0, 0.26));
      a('limestone_carved', box(-0.31, 2.0, -0.31, 0.31, 2.1, 0.31));
      a('limestone', box(-0.2, 2.1, -0.2, 0.2, 2.45, 0.2));
      a('limestone_carved', lathe([[0.001, 2.45], [0.18, 2.45], [0.1, 2.62], [0.02, 2.82], [0.001, 2.86]], 6));
      a('opening', box(-0.14, 1.15, 0.2, 0.14, 1.85, 0.27));
      a('limestone_carved', lathe([[0.001, 1.2], [0.07, 1.22], [0.06, 1.5], [0.05, 1.62], [0.035, 1.7], [0.04, 1.78], [0.001, 1.8]], 7, null, 0, 0, 0.22));
      a('iron', rod([0, 1.75, 0.27], [0, 1.98, 0.55], 0.012, 4));
      a('iron', lathe([[0.001, 0], [0.04, 0.02], [0.06, 0.1], [0.03, 0.15], [0.001, 0.16]], 7, null, 0, 1.78, 0.58));      // (the lamp's flame is the halo's glow: no flame piece, which would cost a draw)
      H.ball(0, 1.84, 0.58, 0.6); H.wall(0, 1.5, 0.3, [0, 1], 1.3, 1.1); H.floor(0, 0.06, 1.0, 1.9, 1.5);
    } else if (kind === 'brazier') {
      // the guards' fire-basket: an iron cresset on three legs with embers and a flame, a woodpile beside it
      for (let k = 0; k < 3; k++) { const th = k * TAU / 3; a('iron', rod([Math.cos(th) * 0.28, 0, Math.sin(th) * 0.28], [Math.cos(th) * 0.12, 0.7, Math.sin(th) * 0.12], 0.018, 4)); }
      a('iron', lathe([[0.001, 0.7], [0.14, 0.7], [0.3, 0.86], [0.32, 0.92], [0.28, 0.92], [0.12, 0.76], [0.001, 0.76]], 8));
      a('flame', lathe([[0.001, 0.82], [0.2, 0.84], [0.17, 1.0], [0.1, 1.2], [0.001, 1.4]], 6));
      H.ball(0, 1.1, 0, 1.7); H.floor(0, 0.06, 0, 4.2, 3.6, 8);
    } else if (kind === 'torch') {
      // a pine torch in an iron bracket at 2.8 m on a wall (facing +z)
      a('iron', rod([0, 2.5, 0.02], [0, 2.8, 0.34], 0.02, 4));
      a('iron', lathe([[0.03, 2.8], [0.07, 2.88], [0.06, 2.94], [0.001, 2.92]], 6, null, 0, 0, 0.36));
      a('flame', lathe([[0.001, 2.94], [0.05, 2.97], [0.04, 3.1], [0.02, 3.22], [0.001, 3.3]], 5, null, 0, 0, 0.36));
      H.ball(0, 3.1, 0.4, 1.2); H.wall(0, 3.0, 0.05, [0, 1], 2.0, 1.6, 8); H.floor(0, 0.06, 1.6, 3.0, 2.4, 8);
    } else {
      // the glow of an iron lantern on its post (lanterns of objects/index.js: the lamp hangs 0.42 m out at h)
      H.ball(0, 2.72, 0.42, 0.85); H.floor(0, 0.06, 0.42, 2.8, 2.4, 8);
    }
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(H.pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(H.nor, 3)); a('halo', g);
  });
}
function lisbonHalo(el, { bag }) {
  if (el.simple) return;
  const U = unitOf(el.kind in KINDS ? el.kind : 'shrine'), [x, z] = el.at;
  const M = new Matrix4().compose(new Vector3(x, el.y ?? 0, z), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), el.rot ?? 0), new Vector3(1, 1, 1));
  for (const [mat, g] of Object.entries(U)) bag.add(mat, placeHanging(g.clone(), M));
}

/** Wrap the builders of the Manueline style and register the street life's lamp element. Safe to call once. */
let DONE = false;
export function registerNight() {
  if (DONE) return;
  DONE = true;
  const E = STYLES.manueline.elements;
  E.lisbon_halo = lisbonHalo;
  const wrap = (k, fn) => { if (E[k] && !E[k].__lit) E[k] = fn(E[k]); };
  wrap('manu_house', (b) => lit(b, 'house'));
  wrap('jeron_church', litChurch);
  for (const k of ['cloister', 'belem_tower', 'se', 'palace', 'castle', 'range']) wrap(k, (b) => lit(b, 'rooms'));
  wrap('masons_yard', (b) => lit(b, 'lamps'));
  wrap('ship', litShip);
}
registerNight();

/**
 * The open lamps of the night as street-life elements (docs §13.1): the iron lanterns on their posts round the Jerónimos' plaza (the
 * posts of life.js), the shrines (a pier with the Virgin's niche and its oil lamp) at the plaza's west end and against the side walls
 * of lots at alley mouths, the guards' braziers on the Terreiro before the palace loggia, at the castle's gate and at the yard's.
 */
export function haloElements() {
  const out = [], px = PORTAL_X, add = (kind, x, z, rot = 0, y = null) => out.push({ t: 'lisbon_halo', kind, at: [x, z], y: y ?? height(x, z) + 0.04, rot });
  for (const [dx, dz] of [[-9, 46], [9, 46], [-24, 47], [24, 47], [-40, 60], [40, 60], [-14, 100], [14, 100]]) add('post', px + dx, dz);
  add('shrine', -164.6, 56, -Math.PI / 2);
  let n = 0;
  for (const a of ALLEYS) {
    if (n >= 3) break;
    const l = lots().find((q) => q.kind !== 'yard' && Math.abs(q.rect[2] - (a - 2.6)) < 0.9 && q.rect[2] - q.rect[0] >= 4 && q.plinth < 1.6);
    if (!l) continue;
    const x = l.rect[2] + 0.32, z = (l.rect[1] + l.rect[3]) / 2;
    if (!onStreet(x + 0.5, z, 0.5)) continue;
    add('shrine', x, z, Math.PI / 2, l.y + 0.04); n++;
  }
  // the visitor's walk (route.js, docs §14): the neighbours' lamps before the images on the alley's walls, and an inn's lantern at each mouth of the alley
  for (const l of lots()) {
    if (l.kind === 'yard' || l.rect[2] - l.rect[0] < 4 || l.plinth >= 1.6 || l.rect[1] < -2 || l.rect[3] > 95) continue;
    const z = (l.rect[1] + l.rect[3]) / 2;
    if (l.rect[0] > -92 && l.rect[0] < -79 && l.rect[0] - -95 < 9) add('shrine', l.rect[0] - 0.32, z, -Math.PI / 2, l.y + 0.04);
    else if (l.rect[2] < -98 && -95 - l.rect[2] < 13) add('shrine', l.rect[2] + 0.32, z, Math.PI / 2, l.y + 0.04);
  }
  for (const [x, z] of WALK_POSTS) add('post', x, z);
  add('brazier', 46, 44, 0); add('brazier', 46, 84, 0);
  { const cx = (CASTLE[0] + CASTLE[2]) / 2, cz = CASTLE[3] + 2.6; add('brazier', cx + 4.2, cz); }
  add('brazier', YARD[0] + 4, 38);
  return out;
}
void CHURCH; void GROUND;
