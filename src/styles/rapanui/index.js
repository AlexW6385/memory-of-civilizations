// Rapa Nui (about 1500; docs/settlements/rapa-nui.md §4): moai of Rano Raraku tuff — long heads
// with heavy brows, long noses and ears, hands on the belly — standing on ahu platforms of fitted
// basalt with a paved ramp before them, some crowned with red scoria pukao; moai half-cut in the
// quarry and standing buried to the shoulders on its slopes; boat-shaped thatched houses (hare
// paenga) on curbs of dressed basalt; stone chicken houses (hare moa); round garden walls (manavai).

import { Matrix4, Vector3 } from '../../core/three.js';
import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, orientOutward, rod } from '../../core/geom.js';
import { sculpt, rows, smooth, bump, blob } from './sculpt.js';
import { merge, tube } from '../../objects/kit.js';
import { SCENES, rope } from './scenes.js';
import { WORKS } from './works.js';
import { HOUSES } from './houses.js';
import { PLACES } from './places.js';
import { MASONRY, laid } from './masonry.js';
import '../qing/index.js';

const T = 'tuff_moai', B = 'basalt_ahu';
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const yawOf = (f) => typeof f === 'number' ? f : { n: 0, w: Math.PI / 2, s: Math.PI, e: -Math.PI / 2 }[f] ?? 0;
/** A convex solid from its corner points (eight for a skewed block), as triangles faced outward. */
function hull8(p) {
  const F = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], t = [];
  for (const [a, b, c, d] of F) t.push(...p[a], ...p[b], ...p[c], ...p[a], ...p[c], ...p[d]);
  return fromTriangles(orientOutward(t));
}

// ---- the moai ------------------------------------------------------------------------------
// One statue at unit height, front −z, feet at y = 0, cut as a single surface (sculpt.js). The
// proportions follow the Rano Raraku type (docs/settlements/rapa-nui.md §4): the head three-eighths
// of the whole, a heavy brow over deep eye sockets, a long nose with the fish-hook curl of the
// nostrils, thin pouting lips over a jutting chin and a hard jaw line, long oblong ears; a heavy
// trunk with a swelling belly, a navel and nipples; the arms in low relief down the sides, the
// forearms turning in across the hips to long slender fingers that meet at the hami (loincloth);
// on the back of the ahu statues the ring-and-girdle (maro). Quarry statues are left without eye
// sockets (they were cut once a statue stood on its ahu) and without the back carving.
const HEAD0 = 0.6;
function moaiSection(y) {
  if (y < 0.54) { const t = y / 0.54; return { w: 0.186 - 0.01 * t, d: 0.122 - 0.004 * t, zc: 0, n: 3.2 }; }
  if (y < HEAD0) {                                             // the shoulders rounding up to the jaw
    const t = smooth(0.54, HEAD0, y);
    return { w: 0.176 - 0.036 * t, d: 0.118 - 0.014 * t, zc: -0.006 * t, n: 3.2 + 0.4 * t };
  }
  const t = (y - HEAD0) / (1 - HEAD0), top = smooth(0.955, 1, y);
  return { w: (0.122 + 0.024 * smooth(0.05, 0.75, t) - 0.01 * smooth(0.75, 1, t)) - 0.014 * top, d: (0.104 - 0.004 * t) - 0.016 * top, zc: -0.006, n: 3.6 };
}
function moaiRelief(kind) {
  const ahu = kind === 'ahu';
  return (x, y, z, front, side, back) => {
    let r = 0;
    const ax = Math.abs(x);
    if (y >= HEAD0 - 0.03) {
      const yh = (y - HEAD0) / (1 - HEAD0);
      // the face as a plane standing out of the head, its jaw line hard against the neck
      let f = 0.012 * bump(ax / 0.125, 0.25) * smooth(-0.03, 0.0, yh) * (1 - smooth(0.9, 0.98, yh));
      f += 0.03 * bump(ax / 0.1, 0.4) * bump((yh - 0.05) / 0.06, 0.45) * smooth(-0.04, 0.0, yh);      // chin
      // the lips pushed forward together in a thin pout, the mouth a fine line between them
      f += 0.026 * bump(ax / 0.066, 0.5) * bump((yh - 0.2) / 0.06, 0.45);
      f -= 0.011 * bump(ax / 0.062, 0.35) * bump((yh - 0.19) / 0.006, 0.6);
      f -= 0.006 * bump(ax / 0.07, 0.4) * bump((yh - 0.125) / 0.012, 0.5);                       // under the lip
      // the nose: from the brow to above the lip, widening to flared nostrils, its tip far out
      if (yh > 0.26 && yh < 0.84) {
        const u = (yh - 0.28) / 0.54, w = 0.022 + 0.034 * (1 - clamp(u)) ** 2, p = 0.012 + 0.05 * (1 - clamp(u)) ** 1.2;
        f += p * bump(ax / w, 0.5) * smooth(0.26, 0.3, yh);
        const c = Math.hypot((ax - w * 0.62) / (w * 0.32), (yh - 0.33) / 0.035);             // the fish-hook curl of the nostril
        f -= 0.011 * bump((c - 1) / 0.35, 0.6) * smooth(0.27, 0.31, yh) * (1 - smooth(0.38, 0.42, yh));
      }
      // eye sockets under the brow (ahu statues), the brow ridge, the forehead receding
      if (ahu) f -= 0.042 * blob((ax - 0.07) / 0.042, (yh - 0.745) / 0.044, 0.25);
      else f -= 0.006 * blob((ax - 0.072) / 0.046, (yh - 0.75) / 0.05, 0.5);
      f += 0.036 * bump(ax / 0.14, 0.15) * bump((yh - 0.83) / 0.045, 0.4);
      f += 0.012 * bump((ax - 0.085) / 0.04, 0.5) * bump((yh - 0.63) / 0.06, 0.5);              // cheekbones
      f -= 0.01 * bump((ax - 0.085) / 0.03, 0.6) * bump((yh - 0.36) / 0.1, 0.5);               // hollow of the cheek
      f += 0.012 * bump((ax - 0.04) / 0.018, 0.5) * bump((yh - 0.33) / 0.035, 0.5);            // wings of the nostrils
      f += 0.016 * bump(ax / 0.13, 0.3) * smooth(0.82, 0.86, yh) * (1 - smooth(0.88, 0.97, yh));
      r += front * f * smooth(-0.07, -0.02, yh);
      // the long oblong ears, their rims raised and their bowls hollow
      const zc = z + 0.006 - 0.01, ew = 0.036, e0 = 0.24, e1 = 0.86;
      if (yh > e0 - 0.08 && yh < e1 + 0.08) {
        const u = Math.abs(zc) / ew, v = Math.abs(yh - (e0 + e1) / 2) / ((e1 - e0) / 2);
        const out = Math.max(u, v), rim = bump((out - 0.86) / 0.16, 0.6);
        r += side * (0.04 * (1 - smooth(0.95, 1.1, out)) - 0.01 * (1 - smooth(0.55, 0.8, out)) + 0.003 * rim);
      }
      r += side * 0.008 * bump((yh - 0.12) / 0.1, 0.5) * smooth(0.0, -0.06, z);              // the jaw line
    } else {
      // the belly, the navel, the nipples, the faint collar bones
      let f = 0.026 * bump(ax / 0.17, 0.5) * bump((y - 0.28) / 0.17, 0.6);
      f -= 0.008 * blob(ax / 0.014, (y - 0.265) / 0.014, 0.5);
      f += 0.009 * blob((ax - 0.088) / 0.016, (y - 0.46) / 0.016, 0.5);
      f += 0.004 * bump((y - (0.545 - 0.06 * (ax / 0.18) ** 2)) / 0.008, 0.6) * bump(ax / 0.12, 0.5);
      // the forearms turning in across the hips; the long hands, four fingers, meeting at the hami
      const t = clamp((0.18 - ax) / 0.12), yc = 0.31 - 0.13 * t;
      f += 0.02 * bump((y - yc) / 0.026, 0.5) * smooth(0.05, 0.07, ax) * bump((ax - 0.125) / 0.07, 0.3);
      if (ax > 0.008 && ax < 0.12) {
        const hy = 0.172 + 0.012 * (ax - 0.012) / 0.1, hand = bump((y - hy) / 0.026, 0.4) * bump((ax - 0.062) / 0.052, 0.25);
        let fing = 0;
        for (const k of [-1, 0, 1]) fing += bump((y - hy - k * 0.0125) / 0.0018, 0.6);
        fing *= smooth(0.06, 0.035, ax);
        f += hand * (0.02 - 0.009 * Math.min(1, fing));
        f += 0.01 * bump((ax - 0.05) / 0.012, 0.5) * bump((y - (hy + 0.04)) / 0.022, 0.5);   // the thumb toward the navel
      }
      f += 0.007 * bump((y - (0.115 - 0.03 * (1 - (ax / 0.19) ** 2))) / 0.01, 0.5);            // the hami
      r += front * f;
      // the upper arms down the sides to the elbow, the elbow turning forward
      r += side * 0.022 * bump((z - 0.005) / 0.045, 0.5) * bump((y - 0.42) / 0.12, 0.4);
      r += side * 0.012 * bump((y - 0.3) / 0.03, 0.5) * smooth(0.04, -0.02, z) * (1 - smooth(0.5, 0.95, front));
      if (ahu) {                                                  // the ring and girdle, the spine
        let b = 0;
        for (const k of [0, 1, 2]) b += 0.011 * bump((y - (0.075 + k * 0.024)) / 0.007, 0.5) * bump(ax / 0.2, 0.2);
        b += 0.011 * bump((Math.hypot(x, y - 0.24) - 0.05) / 0.01, 0.5);
        b += 0.01 * bump((y - (0.15 + 0.04 * Math.abs(Math.sin(ax / 0.07 * Math.PI)))) / 0.007, 0.5) * bump(ax / 0.14, 0.3);
        b -= 0.006 * bump(ax / 0.006, 0.6) * smooth(0.29, 0.34, y) * (1 - smooth(0.52, 0.56, y));
        r += back * b;
      }
    }
    // the weathering of the soft tuff: a broad unevenness and shallow pits where it has begun to
    // flake, a little deeper on the head and shoulders that take the weather [stated: the tuff "porous
    // and unusually soft", salt making it "flake or spall" — BBC Future 2025; inferred: mild, as the
    // statues are at most a few centuries old in 1500]
    const n1 = vnoise(x * 11, y * 11, z * 11), n2 = vnoise(x * 26 + 7, y * 26, z * 26 + 3), up = 0.6 + 0.4 * smooth(0.3, 0.9, y);
    r -= up * (0.0022 * n1 + 0.0045 * Math.max(0, n2 - 0.62) / 0.38);
    return r;
  };
}
/** Smooth value noise in 3D, 0…1. */
function vnoise(x, y, z) {
  const h = (i, j, k) => { let n = (i * 374761393 + j * 668265263 + k * 1440662683) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), f = (t) => t * t * (3 - 2 * t), u = f(x - xi), v = f(y - yi), w = f(z - zi), L = (a, b, t) => a + (b - a) * t;
  return L(L(L(h(xi, yi, zi), h(xi + 1, yi, zi), u), L(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v), L(L(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), L(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v), w);
}
const MOAI = {};
function moaiGeometry(kind) {
  if (MOAI[kind]) return MOAI[kind];
  const ys = rows(0, 1, 94, (y) => (y > HEAD0 - 0.03 ? 3 : y > 0.08 && y < 0.5 ? 1.7 : 0.7));
  return (MOAI[kind] = sculpt({ ys, cols: 66, section: moaiSection, relief: moaiRelief(kind), warp: 0.45 }));
}
/**
 * The inlaid eyes of an ahu statue, at unit height: in each socket an almond of white coral, its
 * back sunk into the floor of the socket and its face standing a little short of the rim, with a
 * round pupil of black obsidian set in it (docs/settlements/rapa-nui.md §4a). The socket's floor
 * is read off the carved surface itself, so the eye sits in the stone wherever the relief puts it.
 */
let EYES = null;
function moaiEyes() {
  if (EYES) return EYES;
  const pos = moaiGeometry('ahu').getAttribute('position'), ex = 0.072, ey = HEAD0 + (1 - HEAD0) * 0.745;
  let floor = 0;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (Math.abs(y - ey) < 0.01 && Math.abs(Math.abs(x) - ex) < 0.012) floor = Math.min(floor, z);
  }
  const ball = (n) => lathe(Array.from({ length: 7 }, (_, k) => { const t = k / 6 * Math.PI; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; }), n).rotateX(Math.PI / 2);
  const coral = [], pupil = [], d = 0.02, c = floor + 0.006;
  for (const s of [-1, 1]) {
    coral.push(ball(14).scale(0.034, 0.0145, d).translate(s * ex, ey, c));
    pupil.push(ball(10).scale(0.0105, 0.0095, 0.004).translate(s * (ex - 0.004), ey - 0.001, c - d + 0.0028));
  }
  return (EYES = [{ mat: 'coral', g: merge(coral) }, { mat: 'obsidian', g: merge(pupil) }]);
}
/** The pukao at unit statue height: a cylinder of red scoria, a dent below to sit on the head, a boss on top, grooves round its foot. */
let PUKAO = null;
function pukaoGeometry() {
  if (PUKAO) return PUKAO;
  // a drum of red scoria, a little oval, its sides faceted where it was cut and pitted with the vesicles of the rock; a dent below to sit on
  // the head, a flat shoulder, then the topknot (a boss tied round with grooves); the base edge ringed with grooves [stated: Wikipedia "Pukao"]
  const r = 0.13, H = 0.15, rough = (th, y) => 1 + 0.022 * Math.cos(th * 7 + 0.8) + 0.014 * Math.cos(th * 13 + y * 90) - 0.018 * Math.max(0, Math.cos(th * 5 + y * 60) * Math.cos(y * 140));
  const drum = lathe([[0.001, 0.02], [r * 0.6, 0.004], [r * 0.93, 0], [r, 0.018], [r * 0.975, 0.028], [r, 0.038], [r * 1.01, H * 0.4], [r * 1.0, H * 0.7], [r * 0.95, H * 0.92], [r * 0.82, H], [r * 0.5, H]], 36, (th, i, rr, y) => rough(th, y));
  const knot = lathe([[r * 0.5, H], [r * 0.48, H * 1.05], [r * 0.5, H * 1.1], [r * 0.45, H * 1.14], [r * 0.47, H * 1.19], [r * 0.4, H * 1.24], [r * 0.34, H * 1.3], [0.001, H * 1.34]], 24, (th) => 1 + 0.03 * Math.cos(th * 3));
  PUKAO = merge([drum.scale(1, 1, 0.93), knot.translate(0, 0, -0.012)]);
  return PUKAO;
}
/** moai: { at, y, h, facing, pukao, kind ('ahu' | 'quarry'), lie (on its back, head toward `facing`), tilt, lean, buried (depth) }. */
function moai(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 6, yaw = yawOf(el.facing ?? 'n'), kind = el.kind ?? 'ahu';
  const m = new Matrix4().makeRotationY(yaw);
  if (el.lie) m.multiply(new Matrix4().makeRotationX(Math.PI / 2 - (el.tilt ?? 0)));
  else if (el.lean) m.multiply(new Matrix4().makeRotationX(el.lean));
  const wd = el.wide ?? 0.93 + 0.15 * ((Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 + 1) % 1;   // each statue a little broader or slimmer
  m.multiply(new Matrix4().makeScale(h * wd, h, h * (0.97 + 0.06 * wd)));
  m.setPosition(x, y - (el.buried ?? 0), z);
  putStone(bag, T, moaiGeometry(kind), m);
  if (kind === 'ahu' && !el.lie && !el.buried) {              // the statue stands on the platform, wedged round its base with small stones
    const sc = moaiSection(0), cy = Math.cos(yaw), sy = Math.sin(yaw);
    for (let k = 0; k < 11; k++) {
      const a = k / 11 * Math.PI * 2 + 0.3, lx = Math.cos(a) * (sc.w * h + 0.1), lz = sc.zc * h + Math.sin(a) * (sc.d * h + 0.1);
      boulder(bag, B, x + lx * cy + lz * sy, y - 0.05, z - lx * sy + lz * cy, 0.1 + 0.07 * ((k * 7) % 3) / 2, k + x);
    }
  }
  if (kind === 'ahu' && el.eyes !== false) for (const e of moaiEyes()) putStone(bag, e.mat, e.g, m);
  if (el.pukao) {                                              // each pukao a little different: its width, height, turn and set on the head by the statue's place
    const hs = (k) => { const q = Math.sin((x + k) * 12.9898 + (z - k) * 78.233) * 43758.5453; return q - Math.floor(q); };
    const pm = m.clone().multiply(new Matrix4().makeTranslation((hs(1) - 0.5) * 0.012, 1 - 0.006, -0.02 + (hs(2) - 0.5) * 0.016))
      .multiply(new Matrix4().makeRotationY(hs(3) * 6.28)).multiply(new Matrix4().makeRotationZ((hs(4) - 0.5) * 0.06)).multiply(new Matrix4().makeRotationX((hs(5) - 0.5) * 0.05))
      .multiply(new Matrix4().makeScale(0.88 + 0.26 * hs(6), 0.8 + 0.5 * hs(7), 0.88 + 0.26 * hs(8)));
    putStone(bag, 'scoria_red', pukaoGeometry(), pm);
  }
  const r = h * 0.17 * wd;
  if (el.lie) col.circle(x, z, r * 1.4, y - 1, y + r * 1.5);
  else col.circle(x, z, r, y - 1, y + h);
}
/**
 * moai_walk: a statue on its way down the road, walked upright { at, y, h, facing (the way it goes;
 * it walks face first), rock (its sideways tilt onto one edge of its base), lean (forward), ropes:
 * [{ side ('l' | 'r' | 'b'), path: [[x, y, z], …] }] } — a rope tied round its neck below the jaw,
 * the three ropes leaving it from the left, the right and the back, through the haulers' hands
 * (docs/settlements/rapa-nui.md §4b). A statue in transport has no eye sockets yet.
 */
function moaiWalk(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 5, rock = el.rock ?? 0.06, lean = el.lean ?? 0.05, sec0 = moaiSection(0), px = -Math.sign(rock || 1) * sec0.w * h;
  const M = new Matrix4().makeTranslation(x, y, z).multiply(new Matrix4().makeRotationY(yawOf(el.facing ?? 'n')))
    .multiply(new Matrix4().makeTranslation(px, 0, 0)).multiply(new Matrix4().makeRotationZ(rock)).multiply(new Matrix4().makeTranslation(-px, 0, 0))
    .multiply(new Matrix4().makeRotationX(-lean)).multiply(new Matrix4().makeScale(h, h, h));
  putStone(bag, T, moaiGeometry('quarry'), M);
  // the rope round the neck, hugging the section just under the jaw
  const yr = 0.585, sc = moaiSection(yr), n = sc.n, ring = [];
  const at = (ph, o) => { const sp = Math.sin(ph), cp = Math.cos(ph); return [(sc.w + o) * Math.sign(sp) * Math.abs(sp) ** (2 / n), yr, sc.zc - (sc.d + o) * Math.sign(cp) * Math.abs(cp) ** (2 / n)]; };
  for (let k = 0; k <= 28; k++) ring.push([...at(k / 28 * Math.PI * 2, 0.007), 0.0055]);
  const g = tube(ring, 5); g.applyMatrix4(M); bag.add('rope_fibre', g);
  const world = (p) => { const v = new Vector3(...p).applyMatrix4(M); return [v.x, v.y, v.z]; };
  const anchor = { l: at(-Math.PI / 2, 0.012), r: at(Math.PI / 2, 0.012), b: at(Math.PI, 0.012) };
  for (const r of el.ropes ?? []) rope(bag, [world(anchor[r.side]), ...r.path], 0.028);
  col.circle(x, z, h * 0.2, y, y + h);
}
/** A sculpted piece placed by a matrix: one shape held once however many stand (GeoBag.addInstance). */
function putStone(bag, mat, g, m) {
  if (bag.addInstance) bag.addInstance(mat, g, m.clone(), { reach: 2500 });
  else bag.add(mat, g.clone().applyMatrix4(m));
}

/** Boulders and cobbles: three rounded shapes at unit radius, placed turned and scaled (instanced where many). */
const BOULDERS = [0, 1, 2].map((k) => lathe([[1, -0.6], [1.06, 0.05], [0.78, 0.6], [0.35, 0.85], [0.001, 0.9]], 7, (th) => 1 + 0.12 * Math.sin(th * (2 + k) + k) + 0.06 * Math.cos(th * 5 + k * 2)));
const _bm = new Matrix4(), _bs = new Matrix4();
function boulder(bag, mat, x, y, z, r, seed = 0) {
  const k = Math.abs(Math.floor(seed * 7.3)) % 3, m = _bm.makeRotationY(seed * 2.1).premultiply(_bs.makeTranslation(x, y, z)).multiply(new Matrix4().makeScale(r, r * (0.7 + 0.1 * k), r));
  if (bag.addInstance) bag.addInstance(mat, BOULDERS[k], m.clone(), { reach: 260 });
  else bag.add(mat, BOULDERS[k].clone().applyMatrix4(m));
}

/**
 * quarry_bay: a statue half-cut in the tuff of Rano Raraku { at, y, h, facing (the head's way down
 * the slope), tilt } — lying on its back in its bay, its face and front finished, its back still
 * joined to the rock by a keel; a trench down each side where the carvers stood, the rock left
 * standing round it, the cut face above the head.
 */
function quarryBay(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 8, yaw = yawOf(el.facing ?? 'n'), tilt = el.tilt ?? 0.3;
  const Mb = new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeRotationX(-tilt)).setPosition(x, y, z);
  // in the bay's frame: x across, y up out of the rock, z along the statue from its foot (z = 0) to its head (z = h)
  const add = (mat, g) => { g.applyMatrix4(Mb); bag.add(mat, g); };
  const hw = 0.19 * h, tr = 0.55, wall = 2.2, top = 0.07 * h, deep = -0.24 * h - 3;
  for (const s of [-1, 1]) {                                     // the rock left standing down each side
    const a = s * (hw + tr), b = s * (hw + tr + wall);
    add(T, hull8([[Math.min(a, b), deep, -1.5], [Math.max(a, b), deep, -1.5], [Math.max(a, b), deep, h + 1.6], [Math.min(a, b), deep, h + 1.6],
      [Math.min(a, b) + (s < 0 ? 0 : 0.25), top, -0.6], [Math.max(a, b) - (s < 0 ? 0.25 : 0), top, -0.6], [Math.max(a, b) - (s < 0 ? 0.25 : 0), top, h + 0.9], [Math.min(a, b) + (s < 0 ? 0 : 0.25), top, h + 0.9]]));
  }
  // the cut face above the head and the trench floor, the keel along the back
  add(T, hull8([[-hw - tr - wall, deep, h + 0.6], [hw + tr + wall, deep, h + 0.6], [hw + tr + wall, deep, h + 3], [-hw - tr - wall, deep, h + 3],
    [-hw - tr - wall, top + 0.4, h + 0.6], [hw + tr + wall, top + 0.4, h + 0.6], [hw + tr + wall, top + 0.4, h + 2.6], [-hw - tr - wall, top + 0.4, h + 2.6]]));
  add(T, box(-hw - tr, deep, -1.5, hw + tr, -0.2 * h, h + 0.6));
  add(T, box(-0.09 * h, -0.2 * h - 0.05, 0.05 * h, 0.09 * h, -0.08 * h, 0.97 * h));
  // the statue, its back to the keel
  const Ms = Mb.clone().multiply(new Matrix4().makeRotationX(Math.PI / 2)).multiply(new Matrix4().makeScale(h, h, h));
  putStone(bag, T, moaiGeometry('quarry'), Ms);
  // basalt picks (toki) left in the trench
  const rand = rng(Math.floor(x * 31 + z * 17));
  for (let k = 0; k < 4; k++) {
    const s = rand() < 0.5 ? -1 : 1, px = s * (hw + tr * 0.5), pz = rand() * h;
    add(B, frustum([px - 0.05, pz - 0.12, px + 0.05, pz + 0.12], -0.2 * h, -0.2 * h + 0.08, 0.01, 0.01, 0.04, 0.04));
  }
  // the cut face above the head in steps where the carvers worked down, the walls' tops broken into hewn blocks, chips and spalls in the trench [inferred]
  for (let k = 0; k < 3; k++) add(T, box(-hw - tr - wall + 0.2 * k, top + 0.4 + k * 0.5, h + 0.6 + 0.3 * k, hw + tr + wall - 0.2 * k - 0.3 * (k % 2), top + 0.9 + k * 0.5, h + 1.4 + 0.3 * k + 0.4));
  const wp = (u, v, w) => new Vector3(u, v, w).applyMatrix4(Mb);
  for (const s of [-1, 1]) for (let k = 0; k < 9; k++) {
    const hs = (q) => { const f = Math.sin((x + q * 3 + k * 7 + s) * 12.9898 + (z + q) * 78.233) * 43758.5453; return f - Math.floor(f); };
    const r = 0.3 + 0.35 * hs(1), v = wp(s * (hw + tr + 0.3 + wall * hs(2) * 0.8), top + r * 0.3, -0.5 + (h + 1.2) * (k + hs(3) * 0.8) / 9);
    boulder(bag, T, v.x, v.y, v.z, r, k + s + hs(4) * 5);
  }
  for (let k = 0; k < 16; k++) {
    const hs = (q) => { const f = Math.sin((x + q * 5 + k * 3) * 12.9898 + (z - q) * 78.233) * 43758.5453; return f - Math.floor(f); };
    const side = hs(1) < 0.5 ? -1 : 1, v = wp(side * (hw + tr * (0.2 + 0.7 * hs(2))), -0.2 * h + 0.04, 0.02 * h + hs(3) * h * 0.95);
    boulder(bag, T, v.x, v.y, v.z, 0.07 + 0.08 * hs(4), k + hs(5) * 4);
  }
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  col.circle(x + sa * h / 2, z + ca * h / 2, hw + tr + wall, y - 2, y + top + 1);
}

// ---- the ahu -------------------------------------------------------------------------------
/**
 * ahu: { rect, y, h, facing (the side the moai face; the ramp lies there), ramp (depth), seed } —
 * a platform of basalt: the seaward wall of great dressed slabs fitted to each other, smaller
 * blocks coursed above them; the inland face of squared blocks; the top paved with flags; the
 * ramp (tahua) of water-worn boulders (poro) sloping to the plaza, kerbed with a row of set
 * stones; low sloping wings of rubble at either end.
 */
/** A block seen from one side: its back rectangle at zb, its face at zf drawn in by `ins` on every edge (the fine joint), the face's top corners shifted by `lean` so no two lie alike. */
function pillow(xa, ya, xb, yb, zb, zf, ins, lean = 0) {
  return hull8([[xa, ya, zb], [xb, ya, zb], [xb, yb, zb], [xa, yb, zb], [xa + ins, ya + ins, zf], [xb - ins, ya + ins, zf], [xb - ins - lean, yb - ins, zf], [xa + ins + lean, yb - ins, zf]]);
}
function ahu(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 3, rp = el.ramp ?? 12, f = el.facing ?? 'n', rand = rng(el.seed ?? 7);
  if (f !== 'n') throw new Error('ahu: only facing n is drawn');
  // the core, set back behind its facings
  bag.add(B, box(x0, y - 1.5, z0 + 0.12, x1, y + h - 0.1, z1 - 0.12));
  col.rect(el.rect, y - 1, y + h); col.floor(el.rect, y + h);
  // the seaward wall (+z): a course of great slabs, then smaller blocks to the top
  const face = (zf, dir, tall, small) => {
    let xa = x0 - 0.05;
    while (xa < x1 + 0.05) {
      const w = Math.min(x1 + 0.05 - xa, tall[0] + rand() * tall[1]), hh = small ? 0.6 + rand() * 0.25 : 1.5 + rand() * 0.8, d = 0.02 + rand() * 0.05;
      bag.add(B, pillow(xa + 0.02, y - 0.6, xa + w - 0.02, Math.min(y + h - 0.12, y + hh), zf, zf + dir * (0.3 + d), 0.035 + rand() * 0.03, rand() * 0.04));
      if (y + hh < y + h - 0.4) {
        // the upper courses over this slab
        let ya = y + hh;
        while (ya < y + h - 0.15) {
          let xb = xa;
          const ch = Math.min(y + h - 0.12 - ya, 0.45 + rand() * 0.3);
          while (xb < xa + w - 0.05) {
            const bw = Math.min(xa + w - xb, 0.6 + rand() * 0.7), dd = 0.01 + rand() * 0.05;
            bag.add(B, pillow(xb + 0.02, ya + 0.02, xb + bw - 0.02, ya + ch, zf, zf + dir * (0.26 + dd), 0.03 + rand() * 0.03, rand() * 0.03));
            xb += bw;
          }
          ya += ch;
        }
      }
      // wedge stones driven into the joint at the slab's edge, and a footing stone at its foot
      for (let q = 0; q < 2 + (rand() < 0.5 ? 1 : 0); q++) boulder(bag, B, xa + w + (rand() - 0.5) * 0.04, y + 0.3 + q * (hh / 2.4) + rand() * 0.2, zf + dir * (0.33 + d), 0.07 + rand() * 0.05, xa + q);
      boulder(bag, B, xa + w * (0.25 + 0.5 * rand()), y - 0.12, zf + dir * (0.52 + rand() * 0.15), 0.3 + rand() * 0.2, xa * 1.7);
      xa += w;
    }
    // the coping: squared stones along the top edge, standing a hand above the paving
    for (let xc = x0 - 0.05; xc < x1 + 0.05 - 0.2;) {
      const cw = Math.min(x1 + 0.05 - xc, 0.7 + rand() * 0.45);
      bag.add(B, box(xc + 0.03, y + h - 0.12, Math.min(zf, zf + dir * 0.42), xc + cw - 0.03, y + h + 0.06 + rand() * 0.05, Math.max(zf, zf + dir * 0.42)));
      xc += cw;
    }
  };
  face(z1 - 0.15, 1, [1.4, 1.6], false);
  face(z0 + 0.15, -1, [0.9, 0.9], true);
  // the top: flags of basalt laid in rows
  for (let za = z0 - 0.08; za < z1 + 0.08 - 0.1;) {
    const dz = Math.min(z1 + 0.08 - za, 0.9 + rand() * 0.7);
    for (let xa = x0 - 0.08; xa < x1 + 0.08 - 0.1;) {
      const dx = Math.min(x1 + 0.08 - xa, 0.8 + rand() * 1.0);
      bag.add(B, box(xa + 0.02, y + h - 0.3, za + 0.02, xa + dx - 0.02, y + h + (rand() - 0.5) * 0.02, za + dz - 0.02));
      xa += dx;
    }
    za += dz;
  }
  // the ramp: a sloping pavement of boulders from the platform's foot to the plaza
  const r0 = y + h * 0.42, ex = 3, zA = z0 - 0.25, zB = z0 - rp;
  const ramp = hull8([[x0 - ex, y - 0.6, zB], [x1 + ex, y - 0.6, zB], [x1 + ex, y - 0.6, zA], [x0 - ex, y - 0.6, zA],
    [x0 - ex, y + 0.06, zB], [x1 + ex, y + 0.06, zB], [x1 + ex, r0, zA], [x0 - ex, r0, zA]]);
  bag.add('pebbles', ramp);
  col.ramp([x0 - ex, zB, x1 + ex, zA], y + 0.06, r0, 's');
  // boulders (poro) lying on it, thicker toward its foot; the kerb of set stones at its foot and sides
  const poro = (px, pz, r, mat = 'pebbles') => {
    const t = clamp((pz - zB) / (zA - zB)), py = y + 0.06 + (r0 - y - 0.06) * t;
    boulder(bag, mat, px, py, pz, r, px * 3.1 + pz);
  };
  // poro laid in rows across the ramp, each row a little wavering, the stones of a row alike in size, those of the next set between them; bigger toward the foot [stated: rounded beach cobbles paved the ramps; rows inferred]
  for (let row = 0, pz = zB + 0.45; pz < zA - 0.3; row++, pz += 0.7) {
    const rs = 0.29, sp = 0.7 + 0.05 * Math.sin(row * 1.7);
    for (let px = -Math.min(30, x1 + ex - 0.3) + (row % 2) * sp / 2; px < Math.min(30, x1 + ex - 0.3); px += sp) {
      const hh = Math.sin(px * 12.9898 + pz * 78.233) * 43758.5453; const hr = hh - Math.floor(hh);
      poro(px + (hr - 0.5) * 0.08, pz + 0.07 * Math.sin(px * 0.31 + row) + (hr - 0.5) * 0.06, rs * (0.85 + 0.3 * hr));
    }
  }
  for (let k = 0; x1 > 30 && k < 160; k++) { const pz = zB + 0.3 + (rp - 0.6) * rand(), px = (rand() < 0.5 ? -1 : 1) * (30 + rand() * (x1 - 30 + ex - 0.6)); poro(px, pz, 0.2 + rand() * 0.14); }
  for (let xa = x0 - ex; xa < x1 + ex - 0.3;) { const w = Math.min(x1 + ex - xa, 0.7 + rand() * 0.5); bag.add(B, box(xa + 0.03, y - 0.4, zB - 0.45, xa + w - 0.03, y + 0.28 + rand() * 0.1, zB + 0.05)); xa += w; }
  for (const xs of [x0 - ex - 0.45, x1 + ex]) for (let za = zB; za < zA - 0.2;) {
    const w = Math.min(zA - za, 0.7 + rand() * 0.5), t = clamp((za + w - zB) / (zA - zB));
    bag.add(B, box(xs, y - 0.4, za + 0.03, xs + 0.45, y + 0.25 + (r0 - y) * t + 0.12, za + w - 0.03)); za += w;
  }
  // the wings: low sloping banks of rubble running on from each end
  for (const s of [-1, 1]) {
    const xe = s < 0 ? x0 : x1, L = 14;
    bag.add('pebbles', hull8([[xe, y - 0.6, z0 + 0.4], [xe + s * L, y - 0.6, z0 + 1.2], [xe + s * L, y - 0.6, z1 - 0.8], [xe, y - 0.6, z1 - 0.4],
      [xe, y + h * 0.55, z0 + 0.8], [xe + s * L, y + 0.15, z0 + 2], [xe + s * L, y + 0.15, z1 - 1.6], [xe, y + h * 0.55, z1 - 0.8]]));
    for (let q = 0; q <= 14; q++) {                           // the laid edge stones along both sloping edges
      const t = q / 14, top = y + h * 0.55 + (0.15 - h * 0.55) * t, xx = xe + s * t * L;
      boulder(bag, B, xx, top - 0.1, z0 + 0.8 + 1.2 * t + 0.1, 0.36 + rand() * 0.12, q + s);
      boulder(bag, B, xx, top - 0.1, z1 - 0.8 - 0.8 * t - 0.1, 0.36 + rand() * 0.12, q * 2 + s);
    }
    for (let k = 0; k < 90; k++) {
      const t = rand(), zz = z0 + 1 + t * 0.6 + rand() * (z1 - z0 - 2 - t * 1.4), top = y + h * 0.55 + (0.15 - h * 0.55) * t, br = 0.18 + rand() * 0.2;
      boulder(bag, B, xe + s * t * L, top - 0.05, zz, br, k + s * 0.37);
    }
  }
}

// ---- houses ----------------------------------------------------------------------------------
/**
 * hare_paenga: a boat-shaped house { c, y, len, w, h, yaw (radians: its long axis), seed }: a curb of
 * dressed basalt blocks (paenga) set end to end round a pointed oval; the hull of thatch over arched
 * poles, laid in rows, a ridge bundle along the top; a low crawling door in a little porch on the
 * long side; before it a half-moon pavement of water-worn stones (poro) edged with boulders; an
 * earth oven (umu pae) of stones set on edge to one side.
 */
function harePaenga(el, { bag, col }) {
  const [x, z] = el.c, y0 = el.y ?? 0, L = el.len ?? 12, W = el.w ?? 2.6, H = el.h ?? 2.2, yaw = el.yaw ?? 0, rand = rng(el.seed ?? 11);
  const ca = Math.cos(yaw), sa = Math.sin(yaw);
  // local frame: u along the long axis (local x), v across (local z, the door side −z)
  const P = (u, v) => [x + u * ca + v * sa, z - u * sa + v * ca];
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y0, z);
  const add = (mat, g) => { g.applyMatrix4(M); bag.add(mat, g); };
  const stone = (mat, u, yy, v, r, sd) => { const [wx, wz] = P(u, v); boulder(bag, mat, wx, y0 + yy, wz, r, sd + x); };
  const half = (u) => (W / 2) * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.62;
  // the curb: blocks round the outline
  const n = Math.max(12, Math.round(L * 2.1 / 1.1));
  const pts = [];
  for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, u = -Math.cos(t) * (L / 2 + 0.12), v = Math.sin(t) >= 0 ? half(u) + 0.14 : -half(u) - 0.14; pts.push([u, Math.sin(t) * 0 + v]); }
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const yt = 0.22 + rand() * 0.04, g = orientedBox(a, b, 0.24, -0.35, yt, -0.03);
    add(B, g);
    if (i % 2 === 0) add('opening', lathe([[0.05, 0], [0.001, -0.02]], 8, null, (a[0] + b[0]) / 2, yt + 0.003, (a[1] + b[1]) / 2));   // the hole in the paenga's top that held a pole
  }
  // the hull: steep-sided, a little pointed at the ridge, the plan a pointed oval; laid in rows of thatch
  const arch = (c) => (1 - Math.abs(c) ** 1.3) ** 0.62;
  const NU = 22, NS = 14, grid = [];
  for (let i = 0; i <= NU; i++) {
    const u = -L / 2 + L * i / NU, w = half(u) + 0.02, hh = H * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.4, row = [];
    for (let j = 0; j <= NS; j++) {
      const c = 1 - 2 * j / NS, yy = hh * arch(c), rip = 1 + 0.035 * Math.cos(yy / 0.3 * Math.PI * 2) * (1 - yy / (H + 0.01));
      row.push([u * (1 + 0.004 * Math.cos(yy / 0.3 * Math.PI * 2)), 0.2 + yy, -c * w * rip]);
    }
    grid.push(row);
  }
  // a house being thatched anew (strip): the old thatch stripped from its west end down to the frame
  // of arched poles and the battens tied across them, the cut edge a thick roll of bundles, the
  // inside seen through the frame [inferred: the thatch's renewal]
  const cut = el.strip ? Math.round(NU * 0.6) : NU;
  const t = [];
  for (let i = NU - cut; i < NU; i++) for (let j = 0; j < NS; j++) {
    const a = grid[i][j], b = grid[i + 1][j], c = grid[i + 1][j + 1], d = grid[i][j + 1];
    t.push(...a, ...d, ...c, ...a, ...c, ...b);
  }
  add('thatch', fromTriangles(el.strip ? t.concat(flipTris(t)) : t));
  if (el.strip) {
    const i0 = NU - cut;
    for (let i = 1; i <= i0; i++) for (let j = 0; j < NS; j++) add('timber', rod(grid[i][j], grid[i][j + 1], 0.028, 5));
    for (let j = 1; j < NS; j += 2) for (let i = 1; i < i0; i++) add('timber', rod(grid[i][j], grid[i + 1][j], 0.018, 4));
    for (let j = 0; j < NS; j++) add('thatch', rod(grid[i0][j], grid[i0][j + 1], 0.09, 6));
    add('timber', rod([grid[1][NS / 2][0], grid[1][NS / 2][1] + 0.03, 0], [grid[i0][NS / 2][0], grid[i0][NS / 2][1] + 0.03, 0], 0.045, 6));
    // inside: mats of reed over the floor; outside, bundles of new reed laid by the house
    add('reed_mat', box(-L * 0.33, 0.03, -W * 0.32, L * 0.22, 0.05, W * 0.32));
    add('hide_white', rod([-L * 0.25, 0.1, -W * 0.18], [-L * 0.25 + 1.1, 0.1, -W * 0.18], 0.07, 7));
    for (let k = 0; k < 7; k++) { const row = k < 4 ? 0 : 1, q = row ? k - 4 : k, r = 0.1; add('thatch', lathe([[0.001, 0], [r * 0.8, 0.03], [r, 0.25], [r * 0.9, 1.6], [r * 1.15, 2.1], [0.001, 2.15]], 8).rotateX(Math.PI / 2).translate(-L / 2 - 1.2 - q * 0.21 - row * 0.105, r + row * 0.18, W / 2 + 0.8)); }
  }
  // the ridge bundle along the top
  const ridge = (u) => [u, 0.2 + H * Math.max(0, 1 - (2 * u / L) ** 2) ** 0.4 + 0.03, 0];
  for (let k = 0; k < 6; k++) add('thatch', rod(ridge(-L * 0.42 + L * 0.84 * k / 6), ridge(-L * 0.42 + L * 0.84 * (k + 1) / 6), 0.1, 6));
  // the porch on the −v side at the middle: a short tunnel of thatch round the low crawling door
  const sd = el.seed ?? 11, dv = -half(0), tw = 0.44 + (sd % 3) * 0.06, th = 0.95, tl = 0.72 + ((sd >> 2) % 4) * 0.15, NT = 4, NA = 12, sh = [];
  const tp = (k, j, inner) => {
    const tt = k / NT, c = 1 - 2 * j / NA, s = inner ? 0.78 : 1, hh = th * (1 - 0.12 * tt);
    return [c * tw * s, 0.2 + hh * arch(c) * (inner ? 0.85 : 1), dv + 0.35 - tt * (tl + 0.35)];
  };
  for (let k = 0; k < NT; k++) for (let j = 0; j < NA; j++) {
    for (const inner of [false, true]) {
      const a = tp(k, j, inner), b = tp(k + 1, j, inner), c = tp(k + 1, j + 1, inner), d = tp(k, j + 1, inner);
      if (inner) sh.push(...a, ...c, ...b, ...a, ...d, ...c); else sh.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  for (let j = 0; j < NA; j++) {                                   // the rim of the mouth
    const a = tp(NT, j, false), b = tp(NT, j + 1, false), c = tp(NT, j + 1, true), d = tp(NT, j, true);
    sh.push(...a, ...c, ...b, ...a, ...d, ...c);
  }
  add('thatch', fromTriangles(sh));
  const dark = [];
  for (let j = 0; j < NA; j++) { const a = tp(NT, j, true), b = tp(NT, j + 1, true); dark.push(0, 0.2, a[2] + 0.45, b[0], b[1], b[2] + 0.45, a[0], a[1], a[2] + 0.45); }
  add('opening', fromTriangles(dark));
  add(B, box(-0.62, -0.2, dv - tl - 0.3, 0.62, 0.24, dv - tl + 0.05));          // the threshold stone
  const dv2 = dv - tl + 0.05;
  const fk = (sd >> 5) % 4;      // the front, by rule from the seed (as hare_house): jamb stones, or a low windbreak of laid stones
  if (fk === 2) for (const sg of [-1, 1]) { const [sx, sz] = P(sg * (tw + 0.42), dv - tl - 0.1); boulder(bag, B, sx, y0 - 0.02, sz, 0.3, sg + 2); }
  else if (fk === 3) for (let c = 0; c < 3; c++) for (let k = 0; k < 5 - c; k++) { const u = (sd % 2 ? 1 : -1) * (1.0 + k * 0.5 + c * 0.25), [sx, sz] = P(u, dv - 2.9 - 0.15 * Math.sin(k)); laid(bag, B, sx, y0 + c * 0.2 - 0.05, sz, yaw, 0.3, 0.2, 0.1, k + c * 3); }
  col.circle(x, z, W / 2, y0, y0 + H);
  for (const s of [-1, 1]) col.circle(x + ca * s * L * 0.3, z - sa * s * L * 0.3, W / 2 * 0.8, y0, y0 + H);
  // the half-moon pavement before the door, edged with boulders
  const R = 2.2 + rand() * 0.6, fan = [], cv = dv2 - 0.35, nseg = 12;
  for (let k = 0; k < nseg; k++) {
    const a0 = Math.PI * k / nseg, a1 = Math.PI * (k + 1) / nseg;
    const p0 = [Math.cos(a0) * R, -Math.sin(a0) * R * 0.75 + cv], p1 = [Math.cos(a1) * R, -Math.sin(a1) * R * 0.75 + cv];
    fan.push(0, 0.1, cv, p1[0], 0.1, p1[1], p0[0], 0.1, p0[1]);
    fan.push(p0[0], 0.1, p0[1], p1[0], 0.1, p1[1], p1[0], -0.3, p1[1], p0[0], 0.1, p0[1], p1[0], -0.3, p1[1], p0[0], -0.3, p0[1]);
    const am = (a0 + a1) / 2, br = 0.16 + rand() * 0.08;
    stone('pebbles', Math.cos(am) * (R + 0.05), 0.02, -Math.sin(am) * (R + 0.05) * 0.75 + cv, br, k);
  }
  fan.push(-R, 0.1, cv, R, 0.1, cv, R, -0.3, cv, -R, 0.1, cv, R, -0.3, cv, -R, -0.3, cv);
  for (let k = 0; k < nseg; k++) fan.push(0, -0.3, cv, Math.cos(Math.PI * k / nseg) * R, -0.3, -Math.sin(Math.PI * k / nseg) * R * 0.75 + cv, Math.cos(Math.PI * (k + 1) / nseg) * R, -0.3, -Math.sin(Math.PI * (k + 1) / nseg) * R * 0.75 + cv);
  add('pebbles', fromTriangles(orientOutward(fan)));
  // the cobbles laid in rows following the crescent's edge, the rows' stones alike and set between those of the row before [stated: a semicircle of poro before the entrance]
  for (let r = 0; r < 4; r++) {
    const rr = (R - 0.35) * (0.2 + 0.26 * r), cnt = 5 + r * 4;
    for (let k = 0; k < cnt; k++) { const a = Math.PI * (k + 0.5 + (r % 2) * 0.25) / (cnt + 0.25), br = 0.1 + 0.03 * rand(); stone('pebbles', Math.cos(a) * rr, 0.08, -Math.sin(a) * rr * 0.75 + cv, br, k * 1.3 + r); }
  }
  // the pole ends crossed over each end of the ridge, lashed [inferred from the poles pulled together and lashed to a ridge pole — The Past]
  for (const e of [-1, 1]) for (const q of [-1, 1]) add('timber', rod([e * L * 0.455, ridge(e * L * 0.455)[1] - 0.25, q * 0.08], [e * (L / 2 + 0.3), ridge(e * L * 0.455)[1] + 0.35 + 0.15 * q, q * 0.22], 0.035, 5));
  // the earth oven: stones set on edge round a hollow of ash
  const [ou, ov] = [L * 0.3 * ((el.seed ?? 11) % 2 ? -1 : 1), dv - 2.4];
  for (let k = 0; k < 6; k++) {
    const a = k / 6 * Math.PI * 2, b = (k + 1) / 6 * Math.PI * 2, rr = 0.55;
    add(B, orientedBox([ou + Math.cos(a) * rr, ov + Math.sin(a) * rr], [ou + Math.cos(b) * rr, ov + Math.sin(b) * rr], 0.12, -0.3, 0.2 + (k % 2) * 0.05, -0.04));
  }
  add('opening', lathe([[0.48, 0.02], [0.001, 0.03]], 10, null, ou, 0, ov));
}
/**
 * mulch_garden: a garden of sweet potato under a mulch of stones { rect, ground (x, z → y), seed } —
 * "lithic mulching – the practice of covering fields with gravel or rocks to trap moisture and improve
 * soil fertility"; sweet potatoes the main crop [stated: Wikipedia "Easter Island"]. Stones strewn
 * thick over the plot, the vines spreading between them in low clumps of heart-shaped leaves; a row
 * of bigger stones along its edge [inferred: the arrangement].
 */
let VINE = null;
function vineGeometry() {
  if (VINE) return VINE;
  const t = [];
  for (let k = 0; k < 9; k++) {
    const a = k * 2.4, r = 0.12 + (k % 3) * 0.1, cx = Math.cos(a) * r, cz = Math.sin(a) * r, y = 0.06 + (k % 4) * 0.035, s = 0.07 + (k % 2) * 0.02, ra = a + 0.6;
    const c = Math.cos(ra), sn = Math.sin(ra), P = (u, v, h) => [cx + u * c - v * sn, y + h, cz + u * sn + v * c];
    // a leaf: a heart of four triangles, tilted up a little toward its tip
    const tip = P(s * 1.6, 0, 0.03), l = P(s * 0.6, -s, 0.01), rr = P(s * 0.6, s, 0.01), base = P(0, 0, 0), notch = P(s * 0.15, 0, 0.012);
    t.push(...base, ...l, ...tip, ...base, ...tip, ...rr, ...notch, ...l, ...base, ...notch, ...base, ...rr);
  }
  const g = fromTriangles(t.concat(flipTris(t)));
  return (VINE = g);
}
const flipTris = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };
function mulchGarden(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, gy = el.ground ?? (() => el.y ?? 0), rand = rng(el.seed ?? 5), A = (x1 - x0) * (z1 - z0);
  for (let k = 0; k < A * 2.6; k++) { const x = x0 + rand() * (x1 - x0), z = z0 + rand() * (z1 - z0); boulder(bag, rand() < 0.7 ? B : 'pebbles', x, gy(x, z) - 0.02, z, 0.05 + rand() ** 2 * 0.14, k * 0.37 + x); }
  for (let x = x0; x < x1; x += 0.55 + rand() * 0.25) for (const z of [z0, z1]) boulder(bag, B, x, gy(x, z) - 0.05, z, 0.16 + rand() * 0.08, x + z);
  for (let z = z0 + 0.6; z < z1; z += 0.55 + rand() * 0.25) for (const x of [x0, x1]) boulder(bag, B, x, gy(x, z) - 0.05, z, 0.16 + rand() * 0.08, x + z * 1.3);
  const vg = vineGeometry();
  for (let x = x0 + 0.6; x < x1 - 0.4; x += 0.8) for (let z = z0 + 0.6 + (Math.round(x / 0.8) % 2) * 0.4; z < z1 - 0.4; z += 0.8) {
    if (rand() < 0.1) continue;
    const px = x + (rand() - 0.5) * 0.3, pz = z + (rand() - 0.5) * 0.3, s = 1.5 + rand() * 0.8, m = new Matrix4().makeRotationY(rand() * 6.28).scale(new Vector3(s, s, s)).setPosition(px, gy(px, pz), pz);
    if (bag.addInstance) bag.addInstance('flax_leaf', vg, m, { reach: 200 }); else bag.add('flax_leaf', vg.clone().applyMatrix4(m));
  }
}

registerStyle('rapanui', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, moai, quarry_bay: quarryBay, ahu, hare_paenga: harePaenga, ...MASONRY, moai_walk: moaiWalk, mulch_garden: mulchGarden, ...SCENES, ...WORKS, ...HOUSES, ...PLACES },
  objects: {},
});
export { sculpt, moaiGeometry };
