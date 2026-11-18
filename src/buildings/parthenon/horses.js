// The horses of the Parthenon's pediments, metopes and frieze, and the chariot (docs/settlements/athens.md §4h): a barrel with
// its shoulder and haunch, an arched neck with its crest of mane, a head with the eye's prominence, the nostril, the open
// mouth, the ears laid back, legs with their joints (the elbow, the knee, the cannon, the fetlock, the hoof), the tail.
// Built facing +x, the height at the withers 1 (the figure is scaled by the caller), the near side at +z.
// pose: 'stand' | 'rear' (up on the hind legs, the forelegs folded) | 'gallop' | 'head' (only the head and neck: the horses of
// Helios and Selene rising from, or sinking into, the sea of the pediment floor).

import { Matrix4 } from '../../core/three.js';
import { tube, blob, limb } from './figures.js';
import { vec as V, bodyOf, clipBelow } from './bodies.js';
import { lathe } from '../../core/geom.js';

/** Returns { stone, metal } (lists of geometries), the metal the bridle. */
export function horseOf(o = {}) {
  const pose = o.pose ?? 'stand', lod = o.lod ?? 0, fine = lod === 0, seg = lod === 2 ? 5 : lod === 1 ? 7 : 9, stone = [], metal = [];
  const T = { seg, sub: 0 }, P = (g) => stone.push(g);
  const sx = o.mirror ? -1 : 1;
  const rear = pose === 'rear', up = pose === 'head', noNeck = !!o.noNeck;
  // the head and the neck (in the standing frame, then carried with the body)
  const tilt = o.headTilt ?? 0;                                       // the muzzle tucked in (+) or thrown out (−), radians
  const neckBase = [0.46, 0.93, 0], poll = [0.8, 1.36, 0];
  const body = [], front = [];
  const nb = up ? [0.0, 0.0, 0] : neckBase, pl = up ? [0.34, 0.58, 0] : poll;
  if (noNeck) { /* the centaur: no neck of its own */ }
  const neck = [nb, V.add(V.lerp(nb, pl, 0.5), [up ? 0.0 : -0.02, up ? 0.03 : 0.06, 0]), pl];
  body.push(tube(neck, up ? [[0.2, 0.2], [0.15, 0.15], [0.1, 0.11]] : [[0.12, 0.22], [0.095, 0.15], [0.075, 0.1]], { ...T, side: [0, 0, 1], sub: 1, mod: (th, t) => 1 + 0.05 * Math.cos(3 * th) }));
  const hd = [pl, V.add(pl, [0.09 * Math.cos(tilt) , -0.1 * Math.cos(tilt) - 0.04 * Math.sin(tilt), 0]), V.add(pl, [0.2 * Math.cos(tilt + 0.15), -0.28 * Math.cos(tilt) - 0.1 * Math.sin(tilt), 0])];
  // the head tube follows the line poll → muzzle, long and bony, the cheek deeper than the nose
  const dir = V.norm(V.sub(hd[2], hd[0])), nrm = V.norm([-dir[1], dir[0], 0]);
  body.push(tube(hd, [[0.07, 0.085], [0.075, 0.1], [0.044, 0.055]], { ...T, side: [0, 0, 1], sub: 1 }));
  body.push(blob(V.add(V.lerp(hd[0], hd[1], 0.5), V.mul(nrm, 0.02)), 0.07, [1, 1.1, 1], 7).applyMatrix4(new Matrix4()));
  for (const z of [-1, 1]) {
    body.push(blob(V.add(V.lerp(hd[0], hd[1], 0.35), [0, 0.035, z * 0.056]), 0.017, [1, 1, 0.8], 5));                  // the eye's prominence
    body.push(blob(V.add(hd[2], [-0.005, 0.015, z * 0.026]), 0.014, [1.2, 0.8, 0.7], 5));                               // the nostril
    body.push(limb(V.add(pl, [-0.02, 0.06, z * 0.04]), V.add(pl, [-0.07 * Math.cos(tilt), 0.14, z * 0.05]), 0.022, 0.006, 5));    // the ears, laid back
  }
  if (o.mouth) {
    // the mouth open: the lower jaw dropped, the lip drawn back
    const jaw = [V.add(hd[0], [0.0, -0.1, 0]), V.add(V.lerp(hd[0], hd[2], 0.6), [-0.02, -0.17, 0]), V.add(hd[2], [-0.03, -0.11, 0])];
    body.push(tube(jaw, [[0.045, 0.045], [0.04, 0.04], [0.032, 0.032]], { ...T, side: [0, 0, 1], sub: 0 }));
  }
  if (!up) {
    // the crest: lobes of mane along the neck, falling to the near side
    const n = fine ? 8 : lod === 1 ? 5 : 0;
    for (let i = 0; i < n; i++) { const t = i / (n - 1), p = V.lerp(V.add(nb, [-0.03, 0.17, 0]), V.add(pl, [-0.05, 0.08, 0]), t); body.push(blob([p[0], p[1], 0.02 * (i % 2 ? 1 : -1)], 0.05 - 0.01 * t, [0.6, 1.5, 0.8], 5)); }
  } else {
    const n = fine ? 6 : 3;
    for (let i = 0; i < n; i++) { const t = i / (n - 1), p = V.lerp([0.0, 0.14, 0], [0.31, 0.64, 0], t); body.push(blob([p[0] - 0.06, p[1] + 0.06, 0.02 * (i % 2 ? 1 : -1)], 0.05, [0.6, 1.5, 0.8], 5)); }
  }
  if (o.bridle) for (const f of [0.22, 0.75]) { const p = V.lerp(hd[0], hd[2], f); metal.push(tube([V.add(p, [0, 0, -0.07]), V.add(p, [0.0, 0.0, 0.0]), V.add(p, [0, 0, 0.07])].map((q, i) => V.add(q, V.mul(nrm, i === 1 ? 0.07 : 0.045))), [0.007, 0.008, 0.007], { seg: 5, sub: 1, side: [0, 1, 0], capA: true })); }
  if (noNeck) { body.length = 0; metal.length = 0; }
  if (up) {
    const m = new Matrix4().makeRotationZ(o.lift ?? 0);
    for (const g of body) P(g.applyMatrix4(m));
    for (const g of metal) g.applyMatrix4(m);
    return finish(stone, metal, o, 1);
  }
  // the barrel with its chest and its croup; the shoulder and the haunch as masses
  const trunk = [[0.52, 0.8, 0], [0.18, 0.83, 0], [-0.2, 0.84, 0], [-0.5, 0.84, 0]];
  body.push(tube(trunk, [[0.16, 0.26], [0.2, 0.29], [0.2, 0.29], [0.17, 0.25]], { ...T, side: [0, 0, 1], sub: 1, seg: seg + 2 }));
  for (const z of [-1, 1]) {
    body.push(blob([0.36, 0.78, z * 0.07], 0.14, [1.1, 1.3, 0.7], 7));                                                   // the shoulder
    body.push(blob([-0.38, 0.78, z * 0.08], 0.17, [1.15, 1.25, 0.7], 7));                                               // the haunch
  }
  // the tail: a long fall from the croup
  const tl = rear ? [[-0.5, 0.88, 0], [-0.64, 0.74, 0], [-0.7, 0.5, 0], [-0.68, 0.3, 0]] : pose === 'gallop' ? [[-0.5, 0.9, 0], [-0.72, 0.9, 0], [-0.9, 0.8, 0], [-1.05, 0.66, 0]] : [[-0.5, 0.88, 0], [-0.6, 0.76, 0], [-0.64, 0.5, 0], [-0.62, 0.26, 0]];
  body.push(tube(tl, [[0.03, 0.03], [0.045, 0.04], [0.05, 0.035], [0.035, 0.02]], { ...T, side: [0, 0, 1], sub: 1, mod: (th, t) => 1 + 0.15 * Math.cos(4 * th + 5 * t) }));
  // the legs: [top, elbow or stifle, knee or hock, fetlock, hoof], near side z > 0
  const legs = (pz, spec) => spec.map((c) => c.map((p) => [p[0], p[1], pz * Math.abs(p[2] || 0.12)]));
  const stand = { fore: [[0.36, 0.7], [0.4, 0.46], [0.38, 0.24], [0.4, 0.07], [0.42, 0.0]], hind: [[-0.38, 0.7], [-0.3, 0.46], [-0.42, 0.28], [-0.4, 0.09], [-0.38, 0.0]] };
  const rearFore = { n: [[0.36, 0.7], [0.5, 0.62], [0.66, 0.66], [0.64, 0.5], [0.62, 0.42]], f: [[0.36, 0.7], [0.52, 0.72], [0.7, 0.8], [0.76, 0.66], [0.78, 0.58]] };
  const gallopFore = { n: [[0.36, 0.7], [0.55, 0.58], [0.76, 0.56], [0.9, 0.5], [0.97, 0.44]], f: [[0.36, 0.7], [0.5, 0.52], [0.6, 0.34], [0.68, 0.3], [0.7, 0.24]] };
  const gallopHind = { n: [[-0.38, 0.7], [-0.6, 0.55], [-0.84, 0.44], [-0.96, 0.32], [-1.04, 0.28]], f: [[-0.38, 0.7], [-0.46, 0.46], [-0.56, 0.28], [-0.62, 0.18], [-0.66, 0.1]] };
  const chain = (c, z) => c.map(([x, y]) => [x, y, z]);
  const leg = (c, z, thick) => {
    const pts = [c[0], c[1], c[2], c[3], c[4]], r = [[0.085 * thick, 0.09 * thick], [0.058 * thick, 0.058 * thick], [0.044 * thick, 0.05 * thick], [0.03 * thick, 0.03 * thick], [0.036 * thick, 0.036 * thick]];
    body.push(tube(chain(pts, z), r, { ...T, side: [0, 0, 1], sub: fine ? 1 : 0, capB: false }));
    body.push(blob(chain([pts[2]], z)[0], 0.048 * thick, [1, 1.05, 1], 6));                                             // the knee or hock
    const h = pts[4], hv = V.norm(V.sub(pts[4], pts[3]));
    body.push(tube([[pts[3][0], pts[3][1] - 0.01, z], [h[0] + 0.02 * Math.sign(hv[0] || 1), h[1] + 0.025, z], [h[0] + 0.03 * Math.sign(hv[0] || 1), Math.max(0, h[1]), z]], [[0.036, 0.04], [0.044, 0.05], [0.046, 0.05]], { seg: 6, sub: 0, side: [0, 0, 1] }));   // the hoof
  };
  for (const z of [-0.115, 0.115]) {
    const near = z > 0;
    if (rear) leg(rearFore[near ? 'n' : 'f'], z, 1);
    else if (pose === 'gallop') leg(gallopFore[near ? 'n' : 'f'], z, 1);
    else leg(stand.fore.map(([x, y]) => [x, y]), z, 1);
    if (pose === 'gallop') leg(gallopHind[near ? 'n' : 'f'], z, 1.05);
    else leg(stand.hind, z, 1.05);
  }
  if (o.centaur) {
    // the man's torso grown from the horse's chest, where the neck would be
    const c = o.centaur, m = bodyOf({ pose: 'stand', drape: 'nude', beard: c.beard ?? true, lod, pitch: c.pitch ?? 22, arms: c.arms ?? { R: [-0.12, 1.0, 0.1], L: [0.14, 0.95, 0.12] }, look: c.look ?? 0 });
    const k = c.k ?? 1.2, up = (o.lift ?? (rear ? 0.95 : 0)) * 0.85;
    const mt = new Matrix4().makeTranslation(0.54, 0.9, 0).multiply(new Matrix4().makeRotationZ(-up)).multiply(new Matrix4().makeRotationY(Math.PI / 2)).multiply(new Matrix4().makeTranslation(0, -0.5 * k, 0)).multiply(new Matrix4().makeScale(k, k, k));
    for (const g of m.stone) { clipBelow(g, 0.5); body.push(g.applyMatrix4(mt)); }
    for (const g of m.metal) metal.push(g.applyMatrix4(mt));
  }
  // rearing: everything but the forelegs turned about the hind hooves
  const rot = rear ? new Matrix4().makeTranslation(-0.38, 0, 0).multiply(new Matrix4().makeRotationZ(o.lift ?? (o.centaur ? 0.95 : 0.7))).multiply(new Matrix4().makeTranslation(0.38, 0, 0)) : null;
  const rc = rear ? new Matrix4().makeTranslation(o.centaur ? 0.72 : 0.62, 0.09, 0) : null;
  for (const g of body) { if (rot) g.applyMatrix4(rot); P(rc ? g.applyMatrix4(rc) : g); }
  for (const g of metal) { if (rot) g.applyMatrix4(rot); if (rc) g.applyMatrix4(rc); }
  return finish(stone, metal, o, 0);
}

/** A centaur: a horse's body and a man's torso where the neck would be (rearing, or galloping with a rock raised). */
export function centaurOf(o = {}) {
  return horseOf({ ...o, noNeck: true, centaur: o.centaur ?? {}, pose: o.pose ?? 'rear' });
}
/** A figure turned about x → −x, its faces wound back. */
export function mirrorFig(f) {
  const out = { stone: [], metal: [] };
  for (const key of ['stone', 'metal']) {
    for (const g of f[key] ?? []) {
      g.applyMatrix4(new Matrix4().makeScale(-1, 1, 1));
      for (const nm of ['position', 'normal']) { const a = g.attributes[nm].array; for (let i = 0; i < a.length; i += 9) for (let k = 0; k < 3; k++) { const t = a[i + 3 + k]; a[i + 3 + k] = a[i + 6 + k]; a[i + 6 + k] = t; } }
      out[key].push(g);
    }
  }
  return out;
}

function finish(stone, metal, o, up) {
  if (o.mirror) {
    const m = new Matrix4().makeScale(-1, 1, 1);
    for (const g of [...stone, ...metal]) {
      g.applyMatrix4(m);
      // the mirror turns the faces inside out: wind each triangle back
      for (const nm of ['position', 'normal']) { const a = g.attributes[nm].array; for (let i = 0; i < a.length; i += 9) for (let k = 0; k < 3; k++) { const t = a[i + 3 + k]; a[i + 3 + k] = a[i + 6 + k]; a[i + 6 + k] = t; } }
    }
  }
  return { stone, metal };
}

/**
 * The chariot, facing +x at the origin, the floor of the car at y = 0.3 ... the wheel (rim, six spokes, hub) on the near side,
 * the car with its curved front, the pole running forward. Returns { stone, metal }.
 */
export function chariotOf(o = {}) {
  const lod = o.lod ?? 0, seg = lod === 0 ? 8 : 6, stone = [], metal = [];
  const R = 0.34, wheel = (z) => {
    const rim = lathe(Array.from({ length: 7 }, (_, i) => { const a = (i / 6) * Math.PI * 2; return [R + Math.cos(a) * 0.028, Math.sin(a) * 0.03]; }), 20);
    const g = [rim.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2))];
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.2; g.push(limb([0, 0, 0], [Math.cos(a) * R, Math.sin(a) * R, 0], 0.014, 0.011, 5)); }
    g.push(blob([0, 0, 0], 0.045, [1, 1, 1.4], 6));
    for (const q of g) q.applyMatrix4(new Matrix4().makeTranslation(0, R, z)), stone.push(q);
  };
  wheel(0.3); wheel(-0.3);
  metal.push(limb([0, R, -0.34], [0, R, 0.34], 0.018, 0.018, 5));
  stone.push(tube([[-0.24, 0.42, 0], [0.0, 0.4, 0], [0.2, 0.42, 0]], [[0.24, 0.16], [0.27, 0.17], [0.2, 0.15]], { seg: seg + 2, sub: 1, side: [0, 0, 1], capA: true }));
  stone.push(tube([[0.18, 0.4, 0], [0.22, 0.62, 0], [0.12, 0.72, 0]], [[0.22, 0.03], [0.2, 0.03], [0.16, 0.03]], { seg: 6, sub: 1, side: [0, 0, 1] }));   // the curved front
  metal.push(limb([0.1, 0.4, 0], [1.1, 0.7, 0], 0.016, 0.012, 5));
  return { stone, metal };
}
