// Rome's carved and cast work where the visitor walks (docs/settlements/rome.md §4.15), registered as elements of the
// `roman` style from here (the shared style is untouched): the honorific statues of the forum on their plinths, the
// equestrian bronze, the rostra with the bronze beaks of ships along its front, the fountains' lion masks and the boy
// with the dolphin, the lares in the crossroads shrines. Figures come from the Pantheon's kit (romans.js).
// Deterministic: the little differences between copies come from a hash of the piece's own position.

import { Matrix4 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import '../../styles/roman/street.js';
import '../../styles/roman/ways.js';
import { romanFigure, placeRoman, equestrian } from '../../buildings/pantheon/romans.js';
import { horseOf } from '../../buildings/parthenon/horses.js';
import { bodyOf } from '../../buildings/parthenon/bodies.js';
import { tube, blob, limb } from '../../buildings/parthenon/figures.js';
import { merge } from '../../styles/greek/columns.js';

const R = STYLES.roman.elements;
const hash = (x, y, z) => { const h = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return h - Math.floor(h); };
const mat4 = (yaw, x, y, z, s = 1) => new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(s, s, s)).setPosition(x, y, z);
/** Add a figure's three lists (stone in `stone`, the bronze and gilt ones as such) under the matrix m. */
function addFig(bag, fig, stone, m, h) {
  const out = {};
  for (const k of ['stone', 'metal', 'gilt']) { if (!fig[k]?.length) continue; const g = merge(fig[k]); g.scale(h, h, h); g.applyMatrix4(m); out[k] = g; }
  if (out.stone) bag.add(stone, out.stone);
  if (out.metal) bag.add('bronze', out.metal);
  if (out.gilt) bag.add('gilt_bronze', out.gilt);
}

const KEYS = ['togatus', 'loricatus', 'matrona', 'genius', 'togatus', 'loricatus'];
/** rome_statue: { at, y, rot, h, base, mat, i } — an honorific statue of the forum on a moulded plinth with its inscription band. */
function romeStatue(el, ctx) {
  if (el.simple) return R.statue(el, ctx);
  const { bag, col } = ctx;
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 2.0, b = el.base ?? 1.3, mat = el.mat ?? 'marble', key = KEYS[(el.i ?? 0) % KEYS.length], rot = el.rot ?? 0;
  bag.add('marble', box(x - 0.66, y, z - 0.6, x + 0.66, y + 0.28, z + 0.6)); bag.add('travertine', box(x - 0.52, y + 0.28, z - 0.47, x + 0.52, y + b - 0.17, z + 0.47));
  bag.add('marble', box(x - 0.6, y + b - 0.17, z - 0.55, x + 0.6, y + b, z + 0.55));
  const fig = romanFigure(key, 1, [x, z]);
  addFig(bag, fig, mat === 'gilt_bronze' ? 'gilt_bronze' : mat, mat4(rot, x, y + b, z), h / 0.97);
  col.rect([x - 0.66, z - 0.6, x + 0.66, z + 0.6], y, y + b);
}

/** rome_equestrian: { at, y, yaw, scale } — a bronze horseman on a high plinth: the rider cuirassed, his right arm out, the horse standing. */
function romeEquestrian(el, { bag, col }) {
  const lod = el.simple ? 2 : 0;
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, s = el.scale ?? 1.75, ph = 2.3;
  bag.add('marble', box(x - 2.3, y, z - 1.0, x + 2.3, y + 0.3, z + 1.0)); bag.add('travertine', box(x - 2.1, y + 0.3, z - 0.82, x + 2.1, y + ph - 0.22, z + 0.82));
  bag.add('marble', box(x - 2.24, y + ph - 0.22, z - 0.94, x + 2.24, y + ph, z + 0.94));
  const h = horseOf({ pose: 'stand', lod, bridle: true });
  const r = bodyOf({ pose: 'seat', drape: 'nude', lod, hair: 'curls', arms: { R: [-0.27, 0.62, 0.22], L: [0.12, 0.46, 0.22] }, feet: { R: [-0.17, 0.0, 0.1], L: [0.17, 0.0, 0.1] }, legBend: [0, -0.5, 0.2] });
  const rider = [...r.stone], rm = [...r.metal];
  // the horse: its pieces are built facing +x; the plinth is long in z, so the beast stands along z (yaw − 90°)
  const mh = mat4(yaw, x - 0.1, y + ph, z, s);
  const hs = merge(h.stone); hs.applyMatrix4(mh); bag.add('bronze', hs);
  if (h.metal.length) { const hm = merge(h.metal); hm.applyMatrix4(mh); bag.add('gilt_bronze', hm); }
  // the rider: facing the way the horse faces, on its back at the saddle cloth
  const fig = { stone: rider, metal: rm };
  const mr = mat4(yaw + Math.PI / 2, x - 0.1, y + ph + 1.0 * s - 0.3 * s * 1.3, z, s * 1.3);
  const rg = merge(fig.stone); rg.applyMatrix4(mr); bag.add('bronze', rg);
  if (rm.length) { const g = merge(rm); g.applyMatrix4(mr); bag.add('bronze', g); }
  col.rect([x - 2.3, z - 1.0, x + 2.3, z + 1.0], y, y + ph);
}

/** A ship's beak (rostrum) in bronze, pointing along +x of its own frame: the ram with three blades and its collars. */
function beak(k) {
  const L = 1.0 + 0.1 * k, out = [];
  out.push(limb([0, 0, 0], [L, 0.0, 0], 0.15, 0.04, 8));
  for (const dy of [-0.085, 0, 0.085]) out.push(blob([0.2 + L * 0.35, dy, 0], 0.25, [1.5 * L, 0.07, 0.6 + 0.04 * k], 7));   // the three blades
  out.push(blob([0.04, 0, 0], 0.19, [0.6, 1, 1], 8));                                                                    // the boss against the wall
  out.push(tube([[0, 0.17, 0], [0.12, 0.2, 0], [0.4, 0.15, 0]], [[0.04, 0.025], [0.035, 0.03], [0.025, 0.025]], { seg: 5, sub: 1 }));   // the prow's curl above
  return out;
}
/** rome_rostra: { at (the platform's centre), y, rect half sizes } — the orators' platform of the forum with the beaks of captured ships along its front. */
function romeRostra(el, { bag, col }) {
  const far = !!el.simple;
  const [x, z] = el.at, y = el.y ?? 0, hx = el.hx ?? 3.8, hz = el.hz ?? 5.8, H = 2.0;
  const blk = (r, a, b, m) => { bag.add(m, box(r[0], y + a, r[1], r[2], y + b, r[3])); };
  blk([x - hx, z - hz, x + hx, z + hz], 0, H - 0.2, 'travertine'); blk([x - hx - 0.18, z - hz - 0.18, x + hx + 0.18, z + hz + 0.18], H - 0.2, H, 'marble');
  blk([x - hx - 0.1, z - hz - 0.1, x - hx + 0.0, z + hz + 0.1], 0.2, 0.34, 'marble');                           // the plinth moulding on the front
  blk([x - hx - 0.05, z - hz - 0.1, x + hx + 0.05, z - hz], 0, 0.3, 'marble');
  // the parapet of the platform's edge: a low marble balustrade of panels on the long sides and the front
  for (let k = 0; k < 6; k++) { const u = z - hz + 0.4 + k * (2 * hz - 0.8) / 6; blk([x - hx - 0.05, u, x - hx + 0.12, u + 1.5], H, H + 0.8, 'marble'); }
  // the beaks: two rows of bronze rams on the front face, those of the lower row between those of the upper (a captured fleet; Antium, 338 BC)
  for (let row = 0; row < 2 && !far; row++) for (let k = 0; k < 6 - row; k++) {
    const u = z - hz + 1.0 + k * (2 * hz - 2.0) / 5 + row * (2 * hz - 2.0) / 10, yy = y + 1.55 - row * 0.8 + (hash(x, u, row) - 0.5) * 0.06, tilt = 0.05 + hash(u, yy, 3) * 0.04;
    const g = merge(beak(k + row));
    g.applyMatrix4(new Matrix4().makeRotationZ(Math.PI - tilt));                                                  // pointing to -x (out of the front), a little up
    g.applyMatrix4(new Matrix4().makeRotationY((hash(u, yy, 7) - 0.5) * 0.08).setPosition(x - hx - 0.02, yy, u));
    bag.add('bronze', g);
  }
  // the stair behind and a statue base at each end
  for (let k = 0; k < 5; k++) blk([x + hx, z - 1.6, x + hx + 0.45 * (k + 1), z + 1.6], 0, 0.4 * (k + 1), 'travertine');
  col.rect([x - hx, z - hz, x + hx, z + hz], y, y + H);
  for (let k = 0; k < 5; k++) col.rect([x + hx, z - 1.6, x + hx + 0.45 * (k + 1), z + 1.6], y, y + 0.4 * (k + 1));
  void box;
}

/** rome_forum_kit: the shared forum_kit (altars, benches, tubs, album, steles) without its crude rostrum, which rome_rostra replaces. */
function romeForumKit(el, ctx) {
  if (el.simple) return R.forum_kit(el, ctx);
  const [, z0, x1, z1] = el.rect, my = (z0 + z1) / 2, rx = x1 - 22, inZone = (b) => b.min.x > rx - 6.2 && b.max.x < rx + 4.5 && b.min.z > my - 6.5 && b.max.z < my + 6.5 && b.max.y < 2.3;
  const bag = { add(m, g) { g.computeBoundingBox(); if (inZone(g.boundingBox)) return; ctx.bag.add(m, g); } };
  const col = { rect(r, a, b) { if (r[0] > rx - 6.2 && r[2] < rx + 4.5 && r[1] > my - 6.5 && r[3] < my + 6.5) return; ctx.col.rect(r, a, b); }, circle: (...a) => ctx.col.circle(...a) };
  R.forum_kit({ ...el }, { ...ctx, bag, col });
}

/** A lion's mask (the mouth at the origin, looking +z, 0.34 m across): mane, brow, nose, open mouth. */
function lionMask(k) {
  const out = [];
  out.push(blob([0, 0.12, -0.01], 0.15, [1.08, 1.05, 0.5], 9));
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; out.push(blob([Math.cos(a) * 0.17, 0.12 + Math.sin(a) * 0.17, -0.03], 0.045, [1, 1.1, 0.7], 5)); }
  out.push(blob([0, 0.08, 0.04], 0.06, [1.1, 1.2, 0.9], 6), blob([0, 0.03, 0.075], 0.032, [1.3, 0.8, 0.8], 5), blob([0, 0.17, 0.045], 0.034, [1.9, 0.45, 0.6], 5));
  for (const s of [-1, 1]) out.push(blob([s * 0.05, 0.16, 0.05], 0.014, [1, 0.8, 0.7], 5), blob([s * 0.075, 0.2, 0.015], 0.028, [1, 1, 1], 5), blob([s * 0.035, 0.005, 0.065], 0.016, [1.1, 0.7, 0.9], 5));
  void k;
  return out;
}
/** A boy holding a dolphin (the jet of the round basin): the boy standing, the dolphin curved over his arm. Height 0.9. */
function boyDolphin() {
  const b = bodyOf({ pose: 'ease', drape: 'nude', lod: 1, hair: 'curls', arms: { R: [-0.14, 0.62, 0.2], L: [0.15, 0.55, 0.2] } });
  const out = { stone: [...b.stone], metal: [] };
  out.stone.push(tube([[-0.14, 0.5, 0.26], [-0.1, 0.62, 0.24], [0.05, 0.7, 0.24], [0.16, 0.6, 0.24], [0.2, 0.46, 0.22]], [0.02, 0.04, 0.045, 0.03, 0.01], { seg: 7, sub: 1 }));
  out.stone.push(blob([-0.16, 0.5, 0.27], 0.035, [1, 1.3, 1], 6));
  return out;
}

/** rome_fountain: the shared fountain with its flat mask replaced by a lion's mask, or its jet by a boy with a dolphin. */
function romeFountain(el, ctx) {
  if (el.simple) return R.fountain(el, ctx);
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, round = el.kind === 'round';
  const bag = {
    add(m, g) {
      g.computeBoundingBox(); const b = g.boundingBox, w = Math.max(b.max.x - b.min.x, b.max.z - b.min.z);
      if (!round && m === 'marble' && w < 0.5 && b.max.y - b.min.y < 0.5 && b.max.y - y > 1.3) return;           // the flat mask
      if (round && m === 'water' && b.max.y - b.min.y > 0.5) return;                                              // the plain jet
      ctx.bag.add(m, g);
    },
  };
  R.fountain(el, { ...ctx, bag });
  const k = 1 + (hash(x, z, 1) - 0.5) * 0.06;
  if (round) {
    const f = boyDolphin(), g = merge(f.stone); g.applyMatrix4(mat4(a, x, y + 2.0, z, 1.15 * k)); ctx.bag.add('marble', g);
    return;
  }
  const g = merge(lionMask(k)); g.applyMatrix4(mat4(a, x, y + 1.18, z, 1.05 * k).multiply(new Matrix4().setPosition(0, 0, -0.1)));
  ctx.bag.add('marble', g);
}

/** rome_lares: { at, y, yaw } — two lares (youths in a short tunic, a horn of wine raised, a dish in the other hand) on the altar shelf of a crossroads shrine. */
function romeLares(el, { bag }) {
  if (el.simple) return;
  const [x, z] = el.at, y = el.y ?? 0;
  for (const s of [-1, 1]) {
    const f = romanFigure('lar', 1, [x, z]), g = merge([...f.stone]);
    const m = new Matrix4().makeRotationY(el.yaw ?? 0).multiply(new Matrix4().makeTranslation(s * 0.19, 0.96, 0.4).multiply(new Matrix4().makeScale(0.5, 0.5, 0.5)));
    g.applyMatrix4(m).applyMatrix4(new Matrix4().setPosition(x, y, z)); bag.add('bronze', g);
    if (f.metal.length) { const h = merge(f.metal); h.applyMatrix4(m).applyMatrix4(new Matrix4().setPosition(x, y, z)); bag.add('gilt_bronze', h); }
  }
}

Object.assign(R, { rome_statue: romeStatue, rome_equestrian: romeEquestrian, rome_rostra: romeRostra, rome_forum_kit: romeForumKit, rome_fountain: romeFountain, rome_lares: romeLares });
void equestrian; void placeRoman;
