// The stelae and altars of the Great Plaza as sculpture (docs/settlements/maya-tikal.md §15): the ruler in low relief on one continuous
// modelled surface (src/styles/tikal/relief.js) 2–7 cm proud of the slab: torso frontal, head and feet in profile, the towering feathered
// headdress, the double-headed serpent bar or the manikin sceptre with a shield, the jade belt with its masks, the apron, sandals, a bound
// captive at his feet; glyph columns on the two sides and on the back; before it the round altar, its top carved with a bound captive or a
// giant glyph. No two alike: the pose, headdress, regalia and captive come from a hash of the stela's own place.
// Levels of detail by the distance from the arrival and the ways people walk (el.lod): 'full' (finer cells and patches of finer relief for
// the face, belt mask, captive, bar-heads), 'mid' (coarser cells), 'far' (coarsest).

import { box, lathe } from '../../core/geom.js';
import { frame, L, RED } from './kit.js';
import { gather, CV } from './carve.js';
import { Field, cap, ell, rect, poly, emitMeshes, hash } from './relief.js';

const BL = 'maya_blue', JD = 'inlay_jade', OC = 'stucco_red', LF = 'stucco_leaf';
const CELL = { full: 0.04, mid: 0.09, far: 0.13 };
const FINE = 0.016, FL = 'stucco_ochre';       // the flesh, painted

/** The ruler on the face: a Field of his parts (design units: metres for a 3.4 m stela, scaled by s along both axes). */
function ruler(fld, s, h, fine) {
  const C = (ax, ay, bx, by, ra, rb) => cap(ax * s, ay * s, bx * s, by * s, ra * s, (rb ?? ra) * s);
  const E = (cx, cy, rx, ry, rot) => ell(cx * s, cy * s, rx * s, ry * s, rot);
  const R = (cx, cy, hx, hy, r = 0, rot = 0) => rect(cx * s, cy * s, hx * s, hy * s, r * s, rot);
  const dir = h(1) < 0.5 ? -1 : 1, sceptre = h(2) < 0.38, ht = Math.floor(h(3) * 3), nf = 5 + Math.floor(h(4) * 5), mk = 0.92 + h(5) * 0.3, cs = h(6) < 0.5 ? -1 : 1;
  const P = (pts) => poly(pts.map(([x, y]) => [x * s, y * s]));
  // the captive at the ruler's feet, bound, seated and bowed, facing him
  const cx = cs * 0.27;
  fld.put(E(cx, 0.4, 0.15, 0.1), { d: 0.012, mat: CV });                                                          // the mat he sits on
  fld.put(C(cx - cs * 0.02, 0.5, cx + cs * 0.04, 0.35, 0.07, 0.065), { d: 0.026 });                               // the back
  fld.put(E(cx + cs * 0.09, 0.57, 0.055, 0.062), { d: 0.03, dome: 0.3, dr: 0.04 });                              // the head, bowed
  fld.put(E(cx + cs * 0.02, 0.63, 0.055, 0.04), { d: 0.022, mat: RED });                                          // his hair knot, hanging
  fld.put(C(cx + cs * 0.04, 0.35, cx - cs * 0.1, 0.33, 0.05, 0.045), { d: 0.026 });                                // the thigh
  fld.put(C(cx - cs * 0.1, 0.33, cx - cs * 0.12, 0.2, 0.04, 0.035), { d: 0.026 });                                 // the shin folded under
  fld.put(C(cx - cs * 0.04, 0.5, cx - cs * 0.15, 0.4, 0.03, 0.03), { d: 0.034, mat: RED });                          // the arms bound behind, the rope
  fld.put(C(cx + cs * 0.05, 0.5, cx + cs * 0.12, 0.46, 0.025, 0.025), { d: 0.034, mat: RED });                       // the rope to his neck
  // the other side of the base: an earth scroll
  fld.put(E(-cs * 0.3, 0.3, 0.17, 0.08), { d: 0.02, mat: BL, dome: 0.3, dr: 0.06 }); fld.put(E(-cs * 0.3, 0.3, 0.08, 0.035), { d: 0.012, mat: CV });
  // legs in profile, the feet turned outward, sandals
  for (const sg of [-1, 1]) {
    const x = sg * 0.115;
    fld.put(C(x, 0.7, x, 1.32, 0.062, 0.085), { d: 0.03, dome: 0.3, dr: 0.06 });                                    // the leg
    fld.put(C(x, 0.64, x + sg * 0.19, 0.6, 0.05, 0.04), { d: 0.03 });                                                // the foot
    fld.put(E(x + sg * 0.1, 0.59, 0.12, 0.028), { d: 0.012, mat: CV });                                            // the sandal's sole
    fld.put(C(x - sg * 0.01, 0.62, x - sg * 0.02, 0.8, 0.038, 0.04), { d: 0.016, mat: CV });                         // the heel flap and ankle strap
    fld.put(R(x, 0.76, 0.07, 0.022, 0.01), { d: 0.02, mat: BL });                                                    // the anklet
    fld.put(E(x, 1.02, 0.075, 0.06), { d: 0.018, mat: CV });                                                        // the knee guard
  }
  // the apron and the belt with its jade masks
  fld.put(R(0, 1.0, 0.2, 0.34, 0.02), { d: 0.016, mat: RED });
  fld.put(R(0, 0.68, 0.2, 0.03, 0.01), { d: 0.014, mat: CV });
  for (let i = -3; i <= 3; i++) fld.put(C(i * 0.055, 0.66, i * 0.055, 0.6, 0.014), { d: 0.012, mat: CV });         // its fringe
  fld.put(R(0, 1.0, 0.032, 0.28, 0.01), { d: 0.014, mat: JD });
  fld.put(R(0, 1.36, 0.31, 0.055, 0.02), { d: 0.022, mat: CV });                                                    // the belt
  fld.put(E(0, 1.27, 0.07, 0.085), { d: 0.028, mat: JD, dome: 0.3, dr: 0.05 });                                    // the great belt mask
  for (const sg of [-1, 1]) { fld.put(C(sg * 0.21, 1.3, sg * 0.21, 0.88, 0.03, 0.026), { d: 0.02, mat: JD }); fld.put(E(sg * 0.21, 0.84, 0.045, 0.05), { d: 0.026, mat: JD, dome: 0.3, dr: 0.03 }); fld.put(E(sg * 0.31, 1.3, 0.05, 0.062), { d: 0.026, mat: JD, dome: 0.3, dr: 0.03 }); }   // celts and trophy heads hanging from it
  // the torso, shoulders, pectoral and collar
  fld.put(E(0, 1.72, 0.25, 0.35), { d: 0.034, e: 0.035, dome: 0.25, dr: 0.2 });
  fld.put(E(0, 1.86, 0.17, 0.12), { d: 0.014, mat: JD }); fld.put(E(0, 2.02, 0.2, 0.05), { d: 0.012, mat: JD });
  for (const sg of [-1, 1]) fld.put(E(sg * 0.25, 1.98, 0.09, 0.075), { d: 0.034 });
  fld.put(C(0, 2.0, 0, 2.2, 0.07), { d: 0.03 });                                                                   // the neck
  // arms and what they hold
  if (!sceptre) {
    for (const sg of [-1, 1]) {
      fld.put(C(sg * 0.27, 1.97, sg * 0.32, 1.6, 0.065, 0.055), { d: 0.022, dome: 0.3, dr: 0.04 });                // the upper arms
      fld.put(C(sg * 0.32, 1.6, sg * 0.13, 1.76, 0.055, 0.05), { d: 0.022, dome: 0.3, dr: 0.04 });                // the forearms across the chest
      fld.put(E(sg * 0.11, 1.76, 0.06, 0.052), { d: 0.028, dome: 0.3, dr: 0.04 });                         // the fists
    }
    fld.put(C(-0.5, 1.74, 0.5, 1.74, 0.034), { d: 0.02, mat: JD });                                                // the ceremonial bar
    for (const sg of [-1, 1]) {
      fld.put(E(sg * 0.5, 1.68, 0.075, 0.1), { d: 0.026, mat: BL, dome: 0.3, dr: 0.05 });                             // a serpent's head at each end
      fld.put(C(sg * 0.5, 1.6, sg * 0.45, 1.44, 0.05, 0.04), { d: 0.022, mat: BL });                                // its open jaw
      fld.put(C(sg * 0.54, 1.72, sg * 0.5, 1.34, 0.032, 0.024), { d: 0.02, mat: LF });                              // a feather streaming from it
      fld.put(C(sg * 0.44, 1.78, sg * 0.4, 1.9, 0.026, 0.02), { d: 0.02, mat: RED });
    }
    for (const sg of [-1, 1]) fld.put(E(sg * 0.27, 1.74, 0.03, 0.03), { d: 0.012, mat: BL });                           // the bar's ties
  } else {
    const sx = dir * 0.44;
    fld.put(C(dir * 0.27, 1.97, dir * 0.33, 1.62, 0.065, 0.055), { d: 0.022, dome: 0.3, dr: 0.04 });
    fld.put(C(dir * 0.33, 1.62, sx, 1.78, 0.055, 0.05), { d: 0.022, dome: 0.3, dr: 0.04 });
    fld.put(C(sx, 1.2, sx, 2.7, 0.026, 0.03), { d: 0.026, mat: CV });                                                // the manikin sceptre's staff
    fld.put(E(sx, 1.78, 0.06, 0.052), { d: 0.032, dome: 0.3, dr: 0.04 });
    fld.put(E(sx, 2.8, 0.1, 0.11), { d: 0.03, mat: BL, dome: 0.3, dr: 0.05 });                                       // the god's head at its top
    fld.put(C(sx, 2.75, sx + dir * 0.18, 2.62, 0.04, 0.03), { d: 0.026, mat: BL });                                   // his long nose
    fld.put(C(sx, 1.2, sx - dir * 0.18, 0.9, 0.034, 0.024), { d: 0.026, mat: LF });                                  // the serpent foot
    fld.put(C(-dir * 0.27, 1.97, -dir * 0.3, 1.62, 0.065, 0.055), { d: 0.022, dome: 0.3, dr: 0.04 });               // the other arm, the shield
    fld.put(E(-dir * 0.4, 1.66, 0.21, 0.21), { d: 0.026, mat: CV, dome: 0.2, dr: 0.12 });
    fld.put(E(-dir * 0.4, 1.66, 0.14, 0.14), { d: 0.014, mat: RED }); fld.put(E(-dir * 0.4, 1.66, 0.07, 0.07), { d: 0.014, mat: JD });
  }
  // the head in profile
  const m = (pts) => pts.map(([x, y]) => [x * dir, y + 2.3]);
  fld.put(P(m([[-0.105, -0.17], [-0.125, 0.0], [-0.08, 0.14], [0.03, 0.17], [0.085, 0.08], [0.125, 0.0], [0.17, -0.06], [0.175, -0.075], [0.13, -0.095], [0.125, -0.12], [0.108, -0.135], [0.12, -0.155], [0.07, -0.2], [0.03, -0.23], [-0.05, -0.23]])), { d: 0.04, e: 0.03, dome: 0.15, dr: 0.07 });
  fld.put(E(-dir * 0.0, 2.27, 0.066, 0.066), { d: 0.02, mat: JD }); fld.put(E(-dir * 0.0, 2.27, 0.03, 0.03), { d: 0.012, mat: CV });   // the ear flare
  // the headdress: band, the animal's head, the fan of feathers, the plumes falling behind
  fld.put(R(-dir * 0.02, 2.5, 0.17, 0.045, 0.02), { d: 0.026, mat: RED });
  fld.put(R(-dir * 0.02, 2.5, 0.17, 0.012, 0.005), { d: 0.012, mat: JD });
  const my = ht === 1 ? 2.88 : 2.72, ms = mk * (ht === 1 ? 1.15 : 1);
  fld.put(E(dir * 0.06, my, 0.19 * ms, 0.19 * ms), { d: 0.04, mat: CV, dome: 0.3, dr: 0.1 });                       // the mask's head
  fld.put(C(dir * 0.13, my - 0.05, dir * (0.13 + 0.25 * ms), my - 0.1, 0.075 * ms, 0.06 * ms), { d: 0.05, mat: CV });    // its long snout
  fld.put(E(dir * 0.1, my + 0.05, 0.055 * ms, 0.05 * ms), { d: 0.062, mat: JD, dome: 0.3, dr: 0.03 });             // the eye
  fld.put(C(dir * 0.15, my - 0.17 * ms, dir * (0.12 + 0.2 * ms), my - 0.2 * ms, 0.04, 0.035), { d: 0.06, mat: RED });   // the lower jaw
  if (ht === 2) for (const sg of [-1, 1]) fld.put(C(sg * 0.3, 2.62, sg * 0.5, 2.9, 0.045, 0.032), { d: 0.034, mat: BL });   // a pair of serpent heads at the sides
  for (let i = 0; i < nf; i++) {                                                                                     // the fan, each feather over the one before
    const t = nf === 1 ? 0 : i / (nf - 1) - 0.5, ang = t * 1.9, len = 0.5 + 0.1 * (1 - Math.abs(t) * 1.4) + 0.12 * h(10 + i);
    const bx = 0.0, by = my + 0.1, tx = bx + Math.sin(ang) * len, ty = Math.min(3.27, by + Math.cos(ang) * len);
    fld.put(C(bx, by, tx, ty, 0.03, 0.05), { d: 0.016 + 0.002 * (i % 3), mat: i % 2 ? LF : BL });
    fld.put(C(bx + (tx - bx) * 0.2, by + (ty - by) * 0.2, tx - (tx - bx) * 0.1, ty - (ty - by) * 0.1, 0.008, 0.01), { d: 0.012, mat: i % 2 ? BL : LF });
  }
  for (let i = 0; i < 3; i++) fld.put(C(-dir * (0.12 + i * 0.07), 2.6 - i * 0.04, -dir * (0.3 + i * 0.1), 1.9 - i * 0.1, 0.04, 0.05), { d: 0.02 + 0.003 * i, mat: i % 2 ? BL : LF });   // plumes falling behind
  return { dir, sceptre, my, ms, cs, cx };
}

/** The fine patches: what a visitor within a few metres reads: the face, the captive, the belt mask, the bar's heads, the mask's eye and teeth. */
function patches(base, s, o, h) {
  const out = [], Es = (cx, cy, rx, ry, rot) => ell(cx * s, cy * s, rx * s, ry * s, rot), Cs = (ax, ay, bx, by, ra, rb) => cap(ax * s, ay * s, bx * s, by * s, ra * s, (rb ?? ra) * s);
  const mk = (r, f) => { const p = new Field([r[0] * s, r[1] * s, r[2] * s, r[3] * s], FINE, base); f(p); out.push(p); };
  const d = o.dir;
  mk([-0.2, 2.02, 0.2, 2.5], (p) => {                                                                                // the face
    p.put(Cs(d * 0.0, 2.36, d * 0.1, 2.34, 0.018, 0.012), { d: 0.012 });                                              // the brow ridge
    p.put(Es(d * 0.085, 2.3, 0.026, 0.016), { d: 0.012, e: 0.01 }); p.put(Es(d * 0.088, 2.3, 0.011, 0.011), { d: 0.02, e: 0.006 });   // the eye
    p.put(Cs(d * 0.12, 2.26, d * 0.17, 2.235, 0.014, 0.009), { d: 0.014, e: 0.008 });                                 // the nose's wing
    p.put(Cs(d * 0.11, 2.185, d * 0.14, 2.17, 0.009, 0.009), { d: 0.012, e: 0.006 }); p.put(Cs(d * 0.1, 2.165, d * 0.125, 2.155, 0.008, 0.008), { d: 0.012, e: 0.006 });   // the lips
    p.put(Cs(d * 0.02, 2.22, d * 0.08, 2.16, 0.006, 0.006), { d: 0.01, e: 0.005 });                                   // the cheek line
    p.put(Cs(-d * 0.05, 2.12, d * 0.0, 2.06, 0.01, 0.01), { d: 0.01, e: 0.006 });                                      // the jaw
    p.put(Es(-d * 0.0, 2.27, 0.03, 0.03), { d: 0.01, e: 0.006 });
    for (let i = 0; i < 5; i++) p.put(Es(d * (-0.1 + i * 0.045), 2.47, 0.014, 0.012), { d: 0.012, e: 0.006, mat: 'inlay_jade' });   // beads on the headband
  });
  const cx = o.cx, cs = o.cs;
  mk([cx - 0.24, 0.16, cx + 0.2, 0.66], (p) => {                                                                       // the captive: face, ribs of the rope, hair
    p.put(Es(cx + cs * 0.1, 0.575, 0.012, 0.01), { d: 0.012, e: 0.006 }); p.put(Cs(cx + cs * 0.1, 0.54, cx + cs * 0.13, 0.535, 0.007, 0.007), { d: 0.012, e: 0.005 });
    for (let i = 0; i < 4; i++) p.put(Cs(cx - cs * (0.03 + 0.03 * i), 0.53 - 0.03 * i, cx - cs * (0.03 + 0.03 * i), 0.47 - 0.03 * i, 0.007, 0.007), { d: 0.012, e: 0.005, mat: 'stucco_red' });
    for (let i = 0; i < 3; i++) p.put(Cs(cx + cs * (0.01 + i * 0.02), 0.62, cx + cs * (0.0 + i * 0.02), 0.67, 0.007, 0.007), { d: 0.012, e: 0.005, mat: 'stucco_red' });
  });
  mk([-0.15, 1.12, 0.15, 1.44], (p) => {                                                                               // the belt mask's face
    for (const sg of [-1, 1]) { p.put(Es(sg * 0.04, 1.32, 0.022, 0.015), { d: 0.012, e: 0.008 }); }
    p.put(Cs(0, 1.3, 0, 1.25, 0.012, 0.01), { d: 0.012, e: 0.006 }); p.put(Cs(-0.05, 1.2, 0.05, 1.2, 0.01, 0.01), { d: 0.012, e: 0.006 });
    for (let i = 0; i < 4; i++) p.put(Cs(-0.045 + i * 0.03, 1.19, -0.045 + i * 0.03, 1.165, 0.006, 0.006), { d: 0.01, e: 0.005, mat: 'limestone_carved' });
  });
  for (const sg of [-1, 1]) mk([sg * 0.5 - 0.1, 1.36, sg * 0.5 + 0.1, 1.8], (p) => {                                    // the serpents' heads: eye, fangs, scales
    p.put(Es(sg * 0.5, 1.7, 0.024, 0.02), { d: 0.012, e: 0.008, mat: 'inlay_jade' }); p.put(Es(sg * 0.5, 1.7, 0.01, 0.01), { d: 0.012, e: 0.005 });
    for (let i = 0; i < 3; i++) p.put(Cs(sg * (0.46 + i * 0.025), 1.56, sg * (0.46 + i * 0.025), 1.5, 0.006, 0.004), { d: 0.012, e: 0.005, mat: 'limestone_carved' });
    for (let i = 0; i < 4; i++) p.put(Cs(sg * 0.52, 1.6 - i * 0.07, sg * 0.5, 1.58 - i * 0.07, 0.008, 0.008), { d: 0.01, e: 0.005, mat: 'stucco_leaf' });
  });
  const my = o.my, ms = o.ms;
  mk([Math.min(d * 0.06 - 0.25 * ms, d * (0.06 + 0.5 * ms)), my - 0.3 * ms, Math.max(d * 0.06 + 0.25 * ms, d * (0.06 + 0.5 * ms)), my + 0.25 * ms], (p) => {   // the headdress mask: brow, pupil, teeth
    p.put(Cs(d * 0.04, my + 0.12 * ms, d * 0.18, my + 0.11 * ms, 0.012, 0.01), { d: 0.012, e: 0.008 }); p.put(Es(d * 0.1, my + 0.05, 0.016, 0.016), { d: 0.012, e: 0.008, mat: 'stucco_red' });
    for (let i = 0; i < 4; i++) p.put(Cs(d * (0.18 + i * 0.05 * ms), my - 0.14 * ms, d * (0.18 + i * 0.05 * ms), my - 0.18 * ms, 0.01, 0.007), { d: 0.012, e: 0.006, mat: 'limestone_carved' });
  });
  void h;
  return out;
}

/** The altar's top: a bound captive curled (from above) or a giant glyph, on a field in the horizontal plane. */
function altarTop(fld, R, kind, h) {
  const rr = R - 0.1, pt = (f, o) => fld.put(f, { mat: FL, ...o });
  if (kind === 0) {
    const t = (u, v) => [u * rr, v * rr];
    const C = (a, b, c, d, r0, r1) => { const A = t(a, b), B = t(c, d); return cap(A[0], A[1], B[0], B[1], r0 * rr, (r1 ?? r0) * rr); };
    const E = (cx, cy, rx, ry, rot) => { const A = t(cx, cy); return ell(A[0], A[1], rx * rr, ry * rr, rot); };
    pt(E(0, 0, 0.98, 0.98), { d: 0.01, e: 0.03, mat: RED });                                                     // a low mat under him
    pt(C(-0.55, 0.1, 0.15, 0.25, 0.22, 0.26), { d: 0.034, dome: 0.4, dr: 0.2 });                                // the back, bowed
    pt(E(0.42, 0.28, 0.2, 0.19), { d: 0.04, dome: 0.4, dr: 0.12 });                                              // the head against the knees
    pt(E(0.42, 0.34, 0.13, 0.1), { d: 0.044, mat: RED });                                                      // his hair
    pt(C(-0.4, -0.12, 0.3, -0.5, 0.15, 0.12), { d: 0.034 });                                                    // the thighs folded
    pt(C(0.3, -0.5, 0.65, -0.18, 0.11, 0.09), { d: 0.034 });                                                    // the shins
    pt(C(-0.3, 0.2, -0.1, -0.15, 0.08, 0.07), { d: 0.046, mat: CV });                                          // the bound arms
    for (let i = 0; i < 4; i++) pt(C(-0.34 + i * 0.07, 0.24 - i * 0.12, -0.24 + i * 0.07, 0.04 - i * 0.12, 0.018, 0.018), { d: 0.054, mat: BL });   // the rope's turns
    pt(C(0.3, 0.1, 0.1, -0.1, 0.025, 0.02), { d: 0.05, mat: CV });
    pt(E(0.0, 0.62, 0.3, 0.08), { d: 0.018, mat: JD });                                                         // his collar
  } else {
    // a giant glyph: a square cartouche, an eye, a long-nosed face, two scrolls
    const t = (u, v) => [u * rr, v * rr], R_ = (cx, cy, hx, hy, r) => { const A = t(cx, cy); return rect(A[0], A[1], hx * rr, hy * rr, r * rr); }, E = (cx, cy, rx, ry, rot) => { const A = t(cx, cy); return ell(A[0], A[1], rx * rr, ry * rr, rot); };
    const Cc = (a, b, c, d, r0, r1) => { const A = t(a, b), B = t(c, d); return cap(A[0], A[1], B[0], B[1], r0 * rr, (r1 ?? r0) * rr); };
    pt(R_(0, 0, 0.78, 0.78, 0.22), { d: 0.03, mat: RED, dome: 0.15, dr: 0.3 });
    pt(R_(0, 0, 0.64, 0.64, 0.16), { d: 0.016, mat: CV });
    pt(E(-0.18, 0.2, 0.22, 0.19), { d: 0.02, mat: FL });  pt(E(-0.18, 0.2, 0.09, 0.09), { d: 0.02, mat: BL }); pt(E(-0.18, 0.2, 0.035, 0.035), { d: 0.02, mat: JD });
    pt(Cc(0.05, 0.22, 0.4, 0.4, 0.07, 0.05), { d: 0.02, mat: FL }); pt(Cc(0.4, 0.4, 0.5, 0.15, 0.05, 0.04), { d: 0.02, mat: FL });
    pt(Cc(-0.1, 0.0, 0.3, -0.12, 0.08, 0.06), { d: 0.024, mat: BL });
    pt(R_(0, -0.38, 0.4, 0.13, 0.06), { d: 0.022, mat: FL });
    for (let i = 0; i < 4; i++) pt(R_(-0.27 + i * 0.18, -0.38, 0.05, 0.08, 0.02), { d: 0.034, mat: RED });
    pt(Cc(-0.45, -0.1, -0.2, -0.2, 0.06, 0.04), { d: 0.02, mat: LF });
  }
  void h;
}

/** k_stela { at, face, h, w, seed, lod }: the slab on its plinth with the ruler on its face, glyphs on its sides and back, the altar before it. */
export function stela(el, { bag: out, col }) {
  const bag = gather(out), lod = el.lod ?? 'mid';
  const [x, z] = el.at, F = frame(el.face ?? 's', x, z), h = el.h ?? 3.2, w = el.w ?? 1.3, k = h / 3.4, y0 = 0.3, flipV = el.face === 'n' || el.face === 'e' ? -1 : 1;
  const hs = (i) => hash(x + i * 3.7, z - i * 1.9, el.seed ?? 0, i);
  const B = (m, u0, u1, v0, v1, ya, yb) => { const r = F.R(u0, u1, v0, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); };
  B(L, -0.6, 0.6, -w / 2 - 0.35, w / 2 + 0.35, 0, 0.18); B(L, -0.5, 0.5, -w / 2 - 0.2, w / 2 + 0.2, 0.18, y0);      // the two-stage plinth
  const sl = F.R(-0.2, 0.2, -w / 2, w / 2); bag.add(L, box(sl[0], y0, sl[1], sl[2], y0 + h, sl[3])); col.rect(sl, 0, h);
  B(L, -0.26, -0.2, -w / 2 - 0.03, w / 2 + 0.03, y0 + h - 0.12, y0 + h);                                           // the cap (the top, over the figure's plumes)
  const fv = w / 2 - 0.07, fy0 = 0.1 * k, fy1 = h - 0.14;
  for (const sg of [-1, 1]) B(RED, -0.29, -0.2, sg > 0 ? fv - 0.06 : -fv, sg > 0 ? fv : -fv + 0.06, y0 + fy0, y0 + fy1);   // the frame, proud 9 cm
  B(RED, -0.29, -0.2, -fv, fv, y0 + fy0, y0 + fy0 + 0.06); B(RED, -0.29, -0.2, -fv, fv, y0 + fy1 - 0.06, y0 + fy1);
  // the relief
  const cell = CELL[lod] ?? CELL.mid, fld = new Field([-0.5, 0.12 * k, 0.5, (h - 0.2)], cell);
  const o = ruler(fld, k, (i) => hs(i), lod === 'full');
  const to = (a, yy, zz) => { const p = F.P(-0.2 - zz, flipV * a); return [p[0], y0 + yy, p[1]]; };
  const o0 = to(0, 0, 0), toN = (nx, ny, nz) => { const a = to(1, 0, 0), b = to(0, 1, 0), c = to(0, 0, 1); return [nx * (a[0] - o0[0]) + ny * (b[0] - o0[0]) + nz * (c[0] - o0[0]), nx * (a[1] - o0[1]) + ny * (b[1] - o0[1]) + nz * (c[1] - o0[1]), nx * (a[2] - o0[2]) + ny * (b[2] - o0[2]) + nz * (c[2] - o0[2])]; };
  const meshes = new Map();
  fld.mesh(to, toN, FL, meshes);
  if (lod === 'full') for (const p of patches(fld, k, o, hs)) p.mesh(to, toN, FL, meshes);
  emitMeshes(meshes, (m, g) => out.add(m, g), FL);
  // the glyph columns on the two sides and the back (blocks with their signs; the back's two columns)
  const rows = lod === 'full' ? 8 : 6, gh = (h - 0.5) / rows, full = lod === 'full';
  for (let r = 0; r < rows; r++) {
    const ya = y0 + 0.3 + r * gh, yb = ya + gh - 0.05;
    // the sides (the narrow faces, 0.4 wide): one block each
    if (lod !== 'far') for (const sg of [-1, 1]) {
      const v0 = sg > 0 ? w / 2 : -w / 2 - 0.025, v1 = sg > 0 ? w / 2 + 0.025 : -w / 2;
      B((r + (sg > 0 ? 1 : 0)) % 3 === 1 ? BL : CV, -0.17, 0.17, v0, v1, ya, yb);
      if (full) for (let q = 0; q < 2; q++) { const u = -0.06 + q * 0.12, dv = 0.012; B(q === 1 ? RED : L, u - 0.035, u + 0.035, sg > 0 ? v1 : v0 - dv, sg > 0 ? v1 + dv : v0, ya + 0.04 + (q % 2) * 0.05, ya + gh * 0.55 + (q % 2) * 0.04); }
    }
    // the back (the broad face): two columns of wider blocks
    for (const sg of [-1, 1]) {
      const c = sg * 0.31, u1 = 0.225;
      B((r + (sg > 0 ? 1 : 0)) % 3 === 1 ? BL : CV, 0.2, u1, c - 0.27, c + 0.27, ya, yb);
      if (full) for (let q = 0; q < 3; q++) { const vv = c - 0.15 + q * 0.15; B(q % 2 ? RED : L, u1, u1 + 0.012, vv - 0.04, vv + 0.04, ya + 0.04 + (q % 3) * 0.03, ya + gh * 0.5 + (q % 2) * 0.05); }
    }
  }
  // the altar before the stela: the drum with a rim, its top carved
  const a = F.P(-1.7, 0), R = 0.82;
  bag.add(L, lathe([[0.001, 0], [R + 0.05, 0], [R + 0.05, 0.1], [R - 0.04, 0.1], [R - 0.04, 0.38], [R + 0.04, 0.38], [R + 0.04, 0.46], [R - 0.06, 0.46], [R - 0.06, 0.49], [R + 0.04, 0.49], [R + 0.04, 0.46], [0.001, 0.46]], 20, null, a[0], 0, a[1]));
  const nb = full ? 10 : 6;
  for (let i = 0; i < nb; i++) { const t = (i + 0.5) * Math.PI * 2 / nb, g = box(-0.09, 0.14, -0.015, 0.09, 0.34, 0.015); g.rotateY(-t + Math.PI / 2); bag.add(i % 4 === 1 ? BL : CV, g.translate(a[0] + Math.cos(t) * (R + 0.04), 0, a[1] + Math.sin(t) * (R + 0.04))); }
  const af = new Field([-R + 0.06, -R + 0.06, R - 0.06, R - 0.06], lod === 'full' ? 0.045 : 0.1);
  altarTop(af, R, hs(20) < 0.5 ? 0 : 1, hs);
  const ma = new Map(), ra = hs(21) * Math.PI * 2, cr = Math.cos(ra), sr = Math.sin(ra);
  const toA = (u, v, zz) => [a[0] + u * cr - v * sr, 0.46 + zz, a[1] + u * sr + v * cr], oA = toA(0, 0, 0);
  const toNA = (nx, ny, nz) => { const p = toA(1, 0, 0), q = toA(0, 1, 0), r = toA(0, 0, 1); return [nx * (p[0] - oA[0]) + ny * (q[0] - oA[0]) + nz * (r[0] - oA[0]), nx * (p[1] - oA[1]) + ny * (q[1] - oA[1]) + nz * (r[1] - oA[1]), nx * (p[2] - oA[2]) + ny * (q[2] - oA[2]) + nz * (r[2] - oA[2])]; };
  af.mesh(toA, toNA, FL, ma);
  emitMeshes(ma, (m, g) => out.add(m, g), FL);
  col.circle(a[0], a[1], R + 0.05, 0, 0.5);
  bag.flush();
}
