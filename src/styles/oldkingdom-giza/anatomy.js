// A modelled man for Giza's sculpture and its hauling gangs (docs/settlements/giza.md §18): a body built from joints
// (pelvis, spine, shoulders, hips, two-bone legs and arms by IK) out of rounded limbs with the swelling of muscle, a torso with
// chest, belly and shoulder blades, a head with brow, eyes, nose, lips, chin and ears, the short kilt (shendyt) with its stiff
// apron. Everything goes into Sculpts (one per material, so one geometry each); no random numbers (the variety of a
// figure comes from a hash of its own position). The figure's frame: x lateral, y up, z forward; `xf` takes it to the world.

import { Sculpt, blob, blobDir, tube, rodT, add, sub, mul, norm, len, cross, dot, lerp, hash3 } from '../nabataean/sculpt.js';

export { Sculpt, hash3 };

/** The world transform of a figure standing at (x, z), its feet on y, facing the heading a (forward = (cos a, sin a) in x, z). */
export function stand(x, y, z, a, k = 1) {
  const fx = Math.cos(a), fz = Math.sin(a);
  return ([lx, ly, lw]) => [x + (lx * fz + lw * fx) * k, y + ly * k, z + (-lx * fx + lw * fz) * k];
}

/** Two-bone IK: the middle joint for a limb from a to target t with segments l1, l2, bent toward `bend`. */
export function ik(a, t, l1, l2, bend) {
  let d = sub(t, a), D = len(d);
  const max = l1 + l2 - 1e-3; if (D > max) { d = mul(d, max / D); D = max; }
  const u = mul(d, 1 / (D || 1)), x = (l1 * l1 - l2 * l2 + D * D) / (2 * D), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  let p = sub(bend, mul(u, dot(bend, u))); p = len(p) < 1e-4 ? [0, 0, 1] : norm(p);
  return { knee: add(add(a, mul(u, x)), mul(p, h)), end: add(a, d) };
}

/** A limb through joints J (a polyline) with a section [fraction, ra, rb] (the swelling of thigh, calf, arm). */
export function limb(S, J, prof, { lod = 0, ref = [1, 0, 0] } = {}) {
  const cum = [0]; for (let i = 0; i + 1 < J.length; i++) cum.push(cum[i] + len(sub(J[i + 1], J[i])));
  const tot = cum[cum.length - 1];
  const at = (f) => { const d = f * tot; let i = 0; while (i + 2 < J.length && cum[i + 1] < d) i++; const t = (d - cum[i]) / ((cum[i + 1] - cum[i]) || 1); return add(J[i], mul(sub(J[i + 1], J[i]), Math.max(0, Math.min(1, t)))); };
  tube(S, prof.map(([f, ra, rb]) => [...at(f), ra, rb ?? ra]), { seg: lod ? 5 : 9, sub: lod ? 1 : 2, ref, capN: lod ? 1 : 2 });
}

/** A head at c (the skull's centre), looking along `fw` with the up vector `up`, scale k; hair: 'crop' | 'wig' | 'bald' | 'lock'. */
export function head(S, H, c, fw, up, { k = 1, lod = 0 } = {}) {
  const f = norm(fw), s = norm(cross(up, f)), u = cross(f, s);
  const q = (a, b, d) => add(c, add(add(mul(s, a * k), mul(u, b * k)), mul(f, d * k))), r = (a, b, d) => [a * k, b * k, d * k];
  const E = (ctr, ra, rb, rc, nl = 4, ns = 7) => ellipseAt(S, ctr, { ax: mul(s, ra * k), ay: mul(u, rb * k), az: mul(f, rc * k) }, nl, ns);
  const sg = lod ? 5 : 8;
  E(c, 0.078, 0.098, 0.098, 4, sg);                                                   // the skull
  E(q(0, -0.058, 0.03), 0.062, 0.058, 0.07, 3, sg);                                   // the jaw and chin
  E(q(0, -0.082, 0.058), 0.026, 0.02, 0.022, 2, 6);                                  // the chin's point
  for (const sd of [-1, 1]) {
    E(q(sd * 0.064, -0.02, 0.03), 0.026, 0.036, 0.05, 2, 6);                          // the cheek
    E(q(sd * 0.034, 0.03, 0.074), 0.032, 0.012, 0.016, 2, 6);                         // the brow ridge
    if (!lod) {
      E(q(sd * 0.034, 0.012, 0.072), 0.015, 0.008, 0.01, 2, 6);                       // the eyeball under the lid
      E(q(sd * 0.082, -0.002, -0.006), 0.012, 0.036, 0.024, 3, 6);                     // the ear
    }
  }
  const nose = norm(add(mul(f, 1), mul(u, -0.5)));
  E(add(q(0, -0.012, 0.094), mul(nose, 0.01 * k)), 0.014, 0.034, 0.02, 3, 6);        // the bridge and the nose
  E(q(0, -0.04, 0.102), 0.02, 0.012, 0.016, 2, 6);                                    // the tip
  if (!lod) for (const sd of [-1, 1]) E(q(sd * 0.016, -0.042, 0.092), 0.008, 0.008, 0.01, 2, 5);   // the nostrils' wings
  E(q(0, -0.052, 0.094), 0.03, 0.007, 0.011, 2, 6);                                    // the upper lip
  E(q(0, -0.066, 0.09), 0.026, 0.007, 0.011, 2, 6);                                    // the lower lip
  void H;
  return { E, q };
}
/** The hair of a head (same arguments as head): a cropped cap, or a wig with its sides and back. */
export function hairOf(S, c, fw, up, { k = 1, lod = 0, hair = 'crop' } = {}) {
  const f = norm(fw), s = norm(cross(up, f)), u = cross(f, s);
  const q = (a, b, d) => add(c, add(add(mul(s, a * k), mul(u, b * k)), mul(f, d * k)));
  const E = (ctr, ra, rb, rc, nl = 4, ns = 7) => ellipseAt(S, ctr, { ax: mul(s, ra * k), ay: mul(u, rb * k), az: mul(f, rc * k) }, nl, ns);
  const sg = lod ? 6 : 8;
  if (hair === 'crop' || hair === 'lock') E(q(0, 0.022, -0.012), 0.084, 0.092, 0.104, 4, sg);   // close-cropped hair over the skull
  if (hair === 'wig') {
    E(q(0, 0.012, -0.018), 0.094, 0.108, 0.114, 4, sg);                               // the wig's crown
    for (const sd of [-1, 1]) E(q(sd * 0.082, -0.07, -0.02), 0.026, 0.1, 0.07, 3, 6); // its sides, over the shoulders
    E(q(0, -0.1, -0.082), 0.08, 0.1, 0.03, 3, 6);                                     // its back
  }
}
function ellipseAt(S, ctr, { ax, ay, az }, nlat, nlon) {
  const rows = [];
  for (let i = 0; i <= nlat; i++) {
    const ph = Math.PI * i / nlat, y = Math.cos(ph), rr = Math.sin(ph), row = [];
    for (let j = 0; j < nlon; j++) { const th = j / nlon * Math.PI * 2, x = rr * Math.cos(th), z = rr * Math.sin(th); row.push([ctr[0] + ax[0] * x + ay[0] * y + az[0] * z, ctr[1] + ax[1] * x + ay[1] * y + az[1] * z, ctr[2] + ax[2] * x + ay[2] * y + az[2] * z]); }
    rows.push(row);
  }
  S.grid(rows);
}

/**
 * A man: skin, kilt and hair go into the three Sculpts of `M` ({ skin, cloth, hair }). pose: { pelvis [x, y, z], lean (torso's
 * forward lean, rad), tilt (the pelvis's), footL, footR (ankle targets), handL, handR (wrist targets), headPitch, headTurn,
 * toeL, toeR (the feet's pitch), grip (the fists), stretch }. Returns the joints (for the rope and the held things).
 */
export function man(M, P, { k = 1, lod = 0, hair = 'crop', kilt = true, apron = true, bare = true, wig = false, heavy = 1 } = {}) {
  const { skin: S, cloth: C, hair: Hh } = M;
  const rot = (th, v) => [v[0], v[1] * Math.cos(th) - v[2] * Math.sin(th), v[1] * Math.sin(th) + v[2] * Math.cos(th)];   // about x: forward lean
  const lean = P.lean ?? 0, tilt = P.tilt ?? lean * 0.4, pel = P.pelvis;
  const at = (o, th = lean) => add(pel, rot(th, o));
  const waist = at([0, 0.14, 0], (lean + tilt) / 2), chest = at([0, 0.30, 0]), shc = at([0, 0.465, 0]), neck = at([0, 0.53, 0.006]);
  const hpitch = lean + (P.headPitch ?? -lean * 0.85), hd = add(neck, rot(hpitch, [0, 0.16, 0.03]));
  const J = { pelvis: pel, waist, chest, shoulderC: shc, neck, head: hd };
  const bw = 0.205 * heavy;
  const sh = [at([-bw, 0.445, -0.005]), at([bw, 0.445, -0.005])];              // [0]: -x, [1]: +x
  const hp = [at([-0.098, 0.0, 0], tilt), at([0.098, 0.0, 0], tilt)];
  Object.assign(J, { shL: sh[0], shR: sh[1], hpL: hp[0], hpR: hp[1] });
  // ── the torso: pelvis, belly, ribs, chest, shoulders ─────────────────────────────────────────────────────────────
  const T = (o, ra, rb, th = lean) => [...at(o, th), ra, rb];
  tube(S, [T([0, -0.04, -0.005], 0.155, 0.105, tilt), T([0, 0.06, 0.0], 0.148, 0.105, tilt), T([0, 0.16, 0.0], 0.14 * heavy, 0.108), T([0, 0.30, 0.005], 0.178 * heavy, 0.122), T([0, 0.42, 0.0], 0.2 * heavy, 0.112), T([0, 0.505, 0.0], 0.1, 0.07)], { seg: lod ? 8 : 14, sub: lod ? 1 : 2, ref: [1, 0, 0], capN: lod ? 1 : 2 });
  if (!lod) {
    for (const sd of [-1, 1]) {
      blobDir(S, at([sd * 0.088, 0.33, 0.098]), rot(lean, [sd * 0.4, -0.2, 1]), 0.07, 0.075, 0.036, [0, 1, 0], 3, 8);   // the pectoral
      blobDir(S, at([sd * 0.08, 0.15, 0.1]), rot(lean, [sd * 0.1, 0, 1]), 0.062, 0.06, 0.026, [0, 1, 0], 2, 6);            // the abdomen's wall
      blob(S, at([sd * 0.1, 0.34, -0.092]), [0.084, 0.1, 0.034].map((v) => v), 3, 7);                                     // the shoulder blade
      blob(S, at([sd * 0.07, 0.15, -0.1]), [0.07, 0.09, 0.03], 2, 6);                                                     // the loin
    }
    for (let i = 0; i < 3; i++) blob(S, at([0, 0.19 + i * 0.045, 0.108], lean), [0.018, 0.012, 0.012], 2, 5);   // the sternum, the ribs' arch
  }
  // the neck and the trapezius
  tube(S, [[...neck, 0.055, 0.052], [...add(neck, rot((lean + hpitch) / 2, [0, 0.07, 0.015])), 0.05, 0.048]], { seg: lod ? 6 : 8, sub: 1, capN: 1, ref: [1, 0, 0] });
  blob(S, add(neck, rot(lean, [0, -0.02, -0.03])), [0.1, 0.05, 0.07], 2, lod ? 6 : 8);
  // ── the legs ───────────────────────────────────────────────────────────────────────────────────────────────────
  const feet = [P.footL, P.footR], toes = [P.toeL ?? 0, P.toeR ?? 0];
  for (let i = 0; i < 2; i++) {
    const sd = i ? 1 : -1, a = hp[i], t = feet[i], { knee, end } = ik(a, t, 0.45, 0.43, [sd * 0.1, 0, 1]);
    J['kn' + (i ? 'R' : 'L')] = knee; J['an' + (i ? 'R' : 'L')] = end;
    limb(S, [a, knee, end], [[0, 0.088, 0.095], [0.12, 0.092, 0.098], [0.32, 0.082, 0.085], [0.5, 0.05, 0.054], [0.6, 0.052, 0.05], [0.72, 0.056, 0.064], [0.88, 0.036, 0.04], [1, 0.03, 0.03]], { lod });
    blob(S, add(knee, [0, 0, 0.03]), [0.046, 0.046, 0.034], 2, lod ? 5 : 7);                      // the kneecap
    // the foot: heel, instep, ball, toes, pitched by toes[i]
    const pitch = toes[i], fdir = [0, -Math.sin(pitch) * 0.6, Math.cos(pitch)];
    blobDir(S, add(end, mul(fdir, 0.06)), fdir, 0.1, 0.04, 0.034, [0, 1, 0], 3, lod ? 5 : 7);
    blobDir(S, add(add(end, mul(fdir, 0.16)), [0, -0.035 + pitch * 0.02, 0]), fdir, 0.05, 0.042, 0.017, [0, 1, 0], 2, lod ? 5 : 6);
    if (!lod) blobDir(S, add(add(end, mul(fdir, 0.12)), [0, -0.012, -0.012]), [0, 0, 1], 0.05, 0.014, 0.014, [1, 0, 0], 1, 5);   // (the heel's pad)
  }
  // ── the arms: upper arm and forearm with their muscle; the shoulder's cap; the hand ─────────────────────────────
  const hands = [P.handL, P.handR];
  for (let i = 0; i < 2; i++) {
    const sd = i ? 1 : -1, a = sh[i], t = hands[i], { knee: el, end } = ik(a, t, 0.30, 0.27, [sd * 0.45, -0.4, -0.55]);
    J['el' + (i ? 'R' : 'L')] = el; J['wr' + (i ? 'R' : 'L')] = end;
    limb(S, [a, el, end], [[0, 0.054, 0.058], [0.18, 0.056, 0.06], [0.38, 0.05, 0.052], [0.5, 0.04, 0.042], [0.58, 0.046, 0.044], [0.74, 0.04, 0.036], [1, 0.026, 0.022]], { lod });
    blob(S, add(a, [sd * 0.008, 0.0, 0]), [0.066, 0.07, 0.066], 3, lod ? 6 : 8);                   // the deltoid
    // the hand: a fist round the rope or an open hand
    const fd = norm(sub(end, el)), hc = add(end, mul(fd, 0.05));
    blobDir(S, hc, fd, 0.052, 0.032, 0.022, [0, 1, 0], 3, lod ? 5 : 7);
    if (!lod) { blobDir(S, add(hc, mul(fd, 0.04)), fd, 0.028, 0.034, 0.012, [0, 1, 0], 2, 6); blobDir(S, add(add(end, mul(fd, 0.03)), [sd * -0.02, 0, 0.02]), [0, 0.2, 1], 0.026, 0.01, 0.01, [1, 0, 0], 1, 5); }
  }
  // ── the kilt: the belt, the wrapped skirt, the stiff apron ───────────────────────────────────────────────────────
  if (kilt) {
    tube(C, [T([0, 0.1, 0], 0.17, 0.125, (lean + tilt) / 2), T([0, 0.03, 0.0], 0.172, 0.128, tilt), T([0, -0.12, 0.005], 0.188, 0.14, tilt), T([0, -0.27, 0.01], 0.196, 0.143, tilt * 0.9)], { seg: lod ? 8 : 16, sub: lod ? 1 : 2, ref: [1, 0, 0], cap: [1, 0], capN: lod ? 1 : 2 });
    if (apron) {
      const fr = at([0, -0.14, 0.158], tilt), dn = rot(tilt, [0, -1, 0.2]);
      blobDir(C, fr, dn, 0.17, 0.115, 0.03, [1, 0, 0], 3, lod ? 6 : 9);                               // the stiffened wedge in front
      blobDir(C, at([0, 0.06, 0.15], tilt), [0, 0, 1], 0.07, 0.17, 0.02, [1, 0, 0], 1, 6);            // the overlap at the belt
    }
    tube(C, [T([-0.17, 0.045, 0.0], 0.02, 0.02, tilt), T([0.17, 0.045, 0.0], 0.02, 0.02, tilt)], { seg: 5, sub: 1, capN: 1, ref: [0, 0, 1] });
  }
  // ── the head ───────────────────────────────────────────────────────────────────────────────────────────────────
  const fw = rot(hpitch, [Math.sin(P.headTurn ?? 0), 0, Math.cos(P.headTurn ?? 0)]);
  head(S, null, hd, fw, [0, 1, 0], { k, lod });
  if (hair !== 'bald' || wig) hairOf(Hh, hd, fw, [0, 1, 0], { k, lod, hair: wig ? 'wig' : hair });
  return J;
}
