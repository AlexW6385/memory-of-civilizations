// The beasts of the streets and fields (DESIGN §5 "Objects of use": horses, oxen, donkeys, camels,
// dogs …, as still figures). Each is lofted from its proportions: a barrel of a body deeper at the
// chest than at the flank, a neck and a head along their angles, legs with their joints (the
// hind leg's hock bent back), hooves or paws, ears, horns, humps, mane and tail. The pieces of one
// material are merged into one shape per kind and stance (head up, or down to graze), so a beast
// is three or four instances; its coat, build and stance vary with its seed, and a horse may carry
// a saddle cloth, a donkey its pack saddle and panniers, a camel its saddle rug.

import { box } from '../core/geom.js';
import { rng, placer, assembly, tube, slathe } from './kit.js';
import { BufferGeometry, Float32BufferAttribute } from '../core/three.js';
import { figure } from './figures.js';

const D2R = Math.PI / 180;
// L body length (chest to rump), H height at the withers, B body radius, neck length and angle
// (degrees above level), head length and angle, hr head radius (× B), leg thickness, ears,
// horns, hump, tail, mane, the build of the head (snout)
export const BEASTS = {
  horse: { L: 1.65, H: 1.55, B: 0.3, neck: 0.78, na: 50, head: 0.6, ha: -58, hr: 0.4, leg: 0.05, mats: ['hide_brown', 'hide_black', 'hide_tan', 'hide_grey', 'hide_brown'], ears: 0.13, tail: 'hair', mane: 1, hoof: 1, graze: 1 },
  donkey: { L: 1.1, H: 1.1, B: 0.24, neck: 0.48, na: 38, head: 0.5, ha: -52, hr: 0.46, leg: 0.04, mats: ['hide_grey', 'hide_brown', 'hide_grey'], ears: 0.26, tail: 'thin', mane: 0.6, hoof: 1, graze: 1, muzzle: 'hide_white' },
  ox: { L: 1.9, H: 1.42, B: 0.42, neck: 0.42, na: 12, head: 0.52, ha: -62, hr: 0.38, leg: 0.07, mats: ['hide_tan', 'hide_brown', 'hide_white', 'hide_black'], horns: 0.3, ears: 0.12, tail: 'thin', dewlap: 1, hoof: 1, graze: 1 },
  buffalo: { L: 1.95, H: 1.38, B: 0.45, neck: 0.4, na: 6, head: 0.55, ha: -40, hr: 0.38, leg: 0.075, mats: ['hide_black', 'hide_grey'], horns: 0.62, sweep: 1, ears: 0.12, tail: 'thin', hoof: 1, graze: 1 },
  yak: { L: 1.7, H: 1.38, B: 0.46, neck: 0.3, na: 5, head: 0.46, ha: -62, hr: 0.4, leg: 0.065, mats: ['hide_black', 'hide_brown', 'hide_black'], horns: 0.36, ears: 0.1, hump: 0.16, tail: 'hair', skirt: 1, hoof: 1, graze: 1 },
  zebu: { L: 1.6, H: 1.35, B: 0.35, neck: 0.38, na: 15, head: 0.46, ha: -62, hr: 0.38, leg: 0.058, mats: ['hide_white', 'hide_grey', 'hide_white'], horns: 0.26, ears: 0.16, droop: 1, hump: 0.26, tail: 'thin', dewlap: 1, hoof: 1, graze: 1 },
  camel: { L: 1.55, H: 1.95, B: 0.36, neck: 1.05, na: 30, head: 0.5, ha: -12, hr: 0.4, leg: 0.06, mats: ['hide_tan'], hump: 0.42, ears: 0.06, tail: 'thin', bend: 1, pad: 1 },
  llama: { L: 1.0, H: 1.1, B: 0.25, neck: 0.75, na: 78, head: 0.3, ha: -22, hr: 0.45, leg: 0.04, mats: ['hide_white', 'hide_tan', 'hide_brown'], ears: 0.15, tail: 'stub', pad: 1, wool: 1 },
  goat: { L: 0.85, H: 0.72, B: 0.17, neck: 0.3, na: 50, head: 0.27, ha: -52, hr: 0.48, leg: 0.026, mats: ['hide_white', 'hide_black', 'hide_brown', 'hide_tan'], horns: 0.2, back: 1, ears: 0.09, tail: 'up', beard: 1, hoof: 1, graze: 1 },
  sheep: { L: 0.95, H: 0.72, B: 0.27, neck: 0.22, na: 28, head: 0.27, ha: -58, hr: 0.4, leg: 0.026, mats: ['hide_white', 'hide_white', 'hide_tan'], ears: 0.08, tail: 'stub', wool: 1, darkface: 1, hoof: 1, graze: 1 },
  pig: { L: 1.05, H: 0.66, B: 0.28, neck: 0.1, na: 0, head: 0.36, ha: -18, hr: 0.6, leg: 0.04, mats: ['hide_black', 'hide_tan', 'hide_brown'], ears: 0.1, droop: 1, tail: 'curl', snout: 1, hoof: 1, graze: 1 },
  dog: { L: 0.72, H: 0.55, B: 0.13, neck: 0.24, na: 48, head: 0.24, ha: -12, hr: 0.6, leg: 0.026, mats: ['hide_tan', 'hide_brown', 'hide_black', 'hide_white'], ears: 0.08, tail: 'up', paw: 1 },
};

/** The beast's pieces by role ('hide', 'dark', 'horn', 'pale'), standing or grazing. */
function build(K, kind, graze, a) {
  const A = K.L / 2, B = K.B, by = K.H - B * 1.05, pig = K.snout, hide = (g) => a('hide', g);
  // the body: rump, flank, girth, chest — deeper at the girth, the belly a little slung
  const back = K.back ? 0.05 : 0;
  hide(tube([
    [0, by + B * 0.15 + back, A * 1.0, B * 0.45, B * 0.5],
    [0, by + B * 0.08 + back, A * 0.82, B * 0.82, B * 0.95],
    [0, by + B * 0.02, A * 0.45, B * 0.95, B * 1.05],
    [0, by - B * 0.06, 0, B * 0.98, B * 1.1],
    [0, by - B * 0.02, -A * 0.45, B * 0.95, B * 1.12],
    [0, by + B * 0.05, -A * 0.8, B * 0.82, B * 1.02],
    [0, by - B * 0.02, -A * 1.0, B * 0.5, B * 0.68],
  ], 10));
  if (K.wool) hide(tube([[0, by + B * 0.1, A * 0.85, B * 0.95, B * 1.05], [0, by, 0, B * 1.12, B * 1.2], [0, by + B * 0.05, -A * 0.8, B * 1.0, B * 1.1]], 9));
  // the legs: from inside the body down through the joints to the hoof
  const lg = K.leg, footH = K.hoof ? 0.07 : 0.04;
  for (const [sx, front] of [[-1, true], [1, true], [-1, false], [1, false]]) {
    const x = sx * B * 0.52;
    let P;
    if (front) { const z = -A * 0.66; P = [[x * 0.6, by + B * 0.3, z + 0.02, lg * 2.0, lg * 2.7], [x, by - B * 0.7, z + 0.02, lg * 1.8, lg * 2.3], [x, K.H * 0.32, z - 0.01, lg * 1.15], [x, K.H * 0.27, z - 0.012, lg * 1.3], [x, footH + 0.03, z - 0.02, lg * 1.0], [x, footH, z - 0.03, lg * 1.15]]; }
    else { const z = A * 0.68; P = [[x * 0.6, by + B * 0.35, z - 0.05, lg * 2.2, lg * 3.0], [x, by - B * 0.55, z - A * 0.1, lg * 2.1, lg * 2.6], [x, K.H * 0.36, z + A * 0.16, lg * 1.25], [x, K.H * 0.3, z + A * 0.15, lg * 1.1], [x, footH + 0.03, z + A * 0.1, lg * 1.0], [x, footH, z + A * 0.09, lg * 1.15]]; }
    if (K.bend && front) P[1][1] = by - B * 0.9;
    hide(tube(P, 7));
    const [fx, , fz] = P[P.length - 1];
    if (K.hoof) a('dark', slathe([[lg * 1.45, 0], [lg * 1.3, footH], [0.001, footH + 0.008]], 6).translate(fx, 0, fz - 0.005));
    else if (K.pad) a('hide', slathe([[0.001, 0], [lg * 1.9, 0.004], [lg * 1.8, 0.04], [lg * 1.1, 0.06], [0.001, 0.062]], 8).scale(1, 1, 1.3).translate(fx, 0, fz - 0.03));
    else a('hide', slathe([[0.001, 0], [lg * 1.6, 0.005], [lg * 1.5, 0.035], [lg * 1.0, 0.05], [0.001, 0.052]], 7).scale(1, 1, 1.4).translate(fx, 0, fz - 0.025));
  }
  // the neck from the shoulders, the head at its end (lowered to the ground to graze)
  const nb = [0, by + B * 0.35, -A * 0.72];
  let na = K.na, ha = K.ha, nl = K.neck, hd;
  if (graze) { na = K.na - (K.na + 40) * 0.95 - (K.neck < 0.35 ? 10 : 0); ha = -82; }
  let N;
  if (K.bend && !graze) {                                // the camel: the neck down and forward, then up to the head
    const m = [0, nb[1] + Math.sin(-25 * D2R) * nl * 0.5, nb[2] - Math.cos(-25 * D2R) * nl * 0.5];
    const e = [0, m[1] + Math.sin(72 * D2R) * nl * 0.62, m[2] - Math.cos(72 * D2R) * nl * 0.62];
    N = [[...nb, B * 0.55, B * 0.65], [...m, B * 0.36, B * 0.45], [0, (m[1] + e[1]) / 2, (m[2] + e[2]) / 2 + 0.02, B * 0.3, B * 0.36], [...e, B * 0.28, B * 0.33]]; hd = e;
  } else {
    const dir = [0, Math.sin(na * D2R), -Math.cos(na * D2R)], e = [0, nb[1] + dir[1] * nl, nb[2] + dir[2] * nl];
    N = [[0, nb[1] - B * 0.1, nb[2] + 0.05, B * 0.62, B * 0.82], [0, nb[1] + dir[1] * nl * 0.5, nb[2] + dir[2] * nl * 0.5, B * 0.42, B * 0.62], [...e, B * 0.36, B * 0.46]]; hd = e;
  }
  const head = (g) => a('hhide', g);
  if (nl > 0.15) head(tube(N, 8)); else hd = [0, nb[1] - B * 0.15, nb[2] - B * 0.25];
  const hl = K.head, hr = B * K.hr, hdir = [0, Math.sin(ha * D2R), -Math.cos(ha * D2R)], H = (k) => [hd[0], hd[1] + hdir[1] * hl * k, hd[2] + hdir[2] * hl * k];
  const lift = [0, Math.cos(ha * D2R) * hr * 0.2, Math.sin(ha * D2R) * hr * 0.2];
  head(tube([[...H(-0.08), hr * 0.85, hr * 0.95], [...H(0.15), hr * 0.95, hr * 1.1], [...H(0.5), hr * (pig ? 0.85 : 0.72), hr * (pig ? 0.85 : 0.88)], [...H(0.86), hr * (pig ? 0.6 : 0.6), hr * (pig ? 0.6 : 0.7)], [...H(1.0), hr * (pig ? 0.55 : 0.45), hr * (pig ? 0.55 : 0.5)]], 8));
  if (pig) a('pale', slathe([[0.001, 0], [hr * 0.5, 0.002], [hr * 0.52, 0.03], [0.001, 0.032]], 10).rotateX(-Math.PI / 2 + ha * D2R).translate(...H(0.99)));
  if (K.muzzle) a('pale', tube([[...H(0.72), hr * 0.66, hr * 0.76], [...H(0.9), hr * 0.62, hr * 0.72], [...H(1.02), hr * 0.42, hr * 0.48]], 8));
  if (K.darkface) a('hdark', tube([[...H(0.05), hr * 0.92, hr * 1.02], [...H(0.5), hr * 0.76, hr * 0.92], [...H(1.01), hr * 0.47, hr * 0.52]], 8));
  // the eyes, either side of the head
  for (const s of [-1, 1]) { const e = H(0.22); a('hdark', slathe([[0.001, -0.016], [0.018, 0], [0.001, 0.016]], 5).scale(0.5, 1, 1).translate(e[0] + s * hr * 0.88, e[1] + lift[1] * 1.5, e[2] + lift[2])); }
  // the ears (pricked, or drooping), the horns, the forelock and mane
  const top = H(0.02);
  if (K.ears) for (const s of [-1, 1]) {
    const base = [s * hr * 0.55, top[1] + hr * 0.7, top[2] + 0.02];
    const tip = K.droop ? [s * (hr * 0.7 + K.ears * 0.8), base[1] - K.ears * 0.55, base[2] - K.ears * 0.25] : [s * (hr * 0.55 + K.ears * 0.3), base[1] + K.ears * 0.95, base[2] + K.ears * 0.2];
    head(tube([[...base, K.ears * 0.18, K.ears * 0.1], [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2, K.ears * 0.22, K.ears * 0.09], [...tip, 0.004]], 6));
  }
  if (K.horns) for (const s of [-1, 1]) {
    const base = [s * hr * 0.6, top[1] + hr * 0.6, top[2] + 0.03], L = K.horns;
    let pts;
    if (K.sweep) pts = [base, [s * (hr * 0.6 + L * 0.5), base[1] + L * 0.05, base[2] + L * 0.15], [s * (hr * 0.6 + L * 0.85), base[1] + L * 0.25, base[2] + L * 0.45], [s * (hr * 0.6 + L * 0.8), base[1] + L * 0.45, base[2] + L * 0.7]];
    else if (K.back) pts = [base, [s * (hr * 0.65 + L * 0.1), base[1] + L * 0.5, base[2] + L * 0.35], [s * (hr * 0.7 + L * 0.2), base[1] + L * 0.6, base[2] + L * 0.85]];
    else pts = [base, [s * (hr * 0.6 + L * 0.55), base[1] + L * 0.15, base[2] - L * 0.05], [s * (hr * 0.6 + L * 0.8), base[1] + L * 0.55, base[2] - L * 0.15]];
    const r0 = 0.025 + L * 0.06;
    a('horn', tube(pts.map((p, i) => [...p, Math.max(0.003, r0 * (1 - i / (pts.length - 1) * 0.92))]), 6));
  }
  if (K.mane) {
    const [p0, p1, p2] = N;
    const up = (p, k) => [p[0], p[1] + B * 0.48 * k, p[2] + B * 0.12 * k];
    a('hdark', tube([[...up(p0, 0.55), 0.03 * K.mane, 0.06 * K.mane], [...up(p1, 0.85), 0.03 * K.mane, 0.08 * K.mane], [...up(p2, 0.9), 0.025 * K.mane, 0.07 * K.mane], [...H(0.02).map((v, i) => v + (i === 1 ? hr * 0.75 : 0)), 0.02, 0.03]], 6));
  }
  if (K.beard) a('hhide', tube([[...H(0.82).map((v, i) => v - (i === 1 ? hr * 0.5 : 0)), 0.02], [...H(0.75).map((v, i) => v - (i === 1 ? hr * 1.4 : 0)), 0.004]], 5));
  if (K.dewlap) head(tube([[0, nb[1] - B * 0.65, nb[2] + 0.05, B * 0.12, B * 0.3], [0, (nb[1] + hd[1]) / 2 - B * 0.65 * K.dewlap, (nb[2] + hd[2]) / 2, B * 0.08, B * 0.35 * K.dewlap], [0, hd[1] - hr * 0.8, hd[2] + 0.02, B * 0.05, B * 0.12]], 6));
  // the hump (over the shoulders, or the camel's in the middle) and the yak's long skirt of hair
  if (K.hump) { const z = kind === 'camel' ? -A * 0.05 : -A * 0.55, h = K.hump; hide(slathe([[B * 0.78, 0], [B * 0.62, h * 0.55], [B * 0.32, h * 0.92], [0.001, h]], 10).scale(0.75, 1, kind === 'camel' ? 1.5 : 1.0).translate(0, by + B * 0.75, z)); }
  if (K.skirt) a('dark', tube([[0, by - B * 0.7, A * 0.7, B * 0.95, B * 0.4], [0, by - B * 0.85, 0, B * 1.08, B * 0.45], [0, by - B * 0.8, -A * 0.7, B * 1.0, B * 0.45]], 10));
  // the tail
  const tb = [0, by + B * 0.35, A * 0.98];
  if (K.tail === 'hair') a('dark', tube([[...tb, 0.05, 0.06], [0, tb[1] - 0.12, tb[2] + 0.12, 0.07, 0.07], [0, tb[1] - 0.5, tb[2] + 0.16, 0.08, 0.06], [0, Math.max(0.3, tb[1] - 0.9), tb[2] + 0.12, 0.035]], 7));
  else if (K.tail === 'thin') { const end = Math.max(0.15, tb[1] - K.H * 0.62); hide(tube([[...tb, 0.03], [0, tb[1] - 0.15, tb[2] + 0.06, 0.022], [0, end + 0.1, tb[2] + 0.07, 0.016]], 5)); a('dark', tube([[0, end + 0.12, tb[2] + 0.07, 0.02], [0, end + 0.04, tb[2] + 0.075, 0.035], [0, end, tb[2] + 0.07, 0.01]], 6)); }
  else if (K.tail === 'up') hide(tube([[...tb, 0.025], [0, tb[1] + 0.12, tb[2] + 0.1, 0.02], [0, tb[1] + 0.22, tb[2] + 0.1, 0.006]], 5));
  else if (K.tail === 'curl') hide(tube([[...tb, 0.018], [0, tb[1] + 0.04, tb[2] + 0.06, 0.014], [0.03, tb[1] + 0.0, tb[2] + 0.09, 0.012], [0, tb[1] - 0.03, tb[2] + 0.06, 0.006]], 4));
  else hide(tube([[...tb, 0.04], [0, tb[1] - 0.04, tb[2] + 0.06, 0.006]], 5));
}

/** The gear of a working beast: a horse's saddle cloth, a donkey's pack saddle and panniers, a camel's rug. */
function gear(K, kind, a) {
  const A = K.L / 2, B = K.B, by = K.H - B * 1.05;
  // a band over the back, round the body's section at z (rx, ry its half-width and half-height over the centre)
  const arc = (z, rx, ry, cy, from, w, t) => tube(Array.from({ length: 11 }, (_, i) => { const th = Math.PI * (from + (1 - 2 * from) * i / 10); return [Math.cos(th) * rx, cy + Math.sin(th) * ry, z, t, w]; }), 6);
  if (kind === 'horse') {
    a('cloth', arc(-A * 0.25, B * 0.98, B * 1.16, by - B * 0.05, -0.12, 0.24, 0.012));
    a('leather', arc(-A * 0.27, B * 0.99, B * 1.2, by - B * 0.05, 0.12, 0.15, 0.03));
    a('leather', arc(-A * 0.25, B * 0.99, B * 1.18, by - B * 0.05, -0.5, 0.025, 0.012));          // the girth
  } else if (kind === 'donkey' || kind === 'camel') {
    const z = kind === 'camel' ? -A * 0.05 : -A * 0.1, top = by + B * 1.12 + (kind === 'camel' ? K.hump * 0.8 : 0);
    a('cloth', arc(z, B * 1.0, top - by + B * 0.05, by - B * 0.05, -0.1, A * 0.42, 0.014));
    for (const s of [-1, 1]) a('wicker', slathe([[0.001, 0], [0.16, 0.0], [0.2, 0.18], [0.2, 0.4], [0.18, 0.41], [0.17, 0.2], [0.001, 0.2]], 10).scale(0.75, 1, 1).translate(s * (B + 0.17), by - B * 0.9, z));
    for (const dz of [-1, 1]) a('leather', arc(z + dz * A * 0.3, B * 1.03, top - by + B * 0.08, by - B * 0.05, 0.1, 0.03, 0.035));   // the pack saddle's bows
    for (const s of [-1, 1]) a('leather', tube([[s * B * 0.98, by + B * 0.15, z - A * 0.32, 0.02], [s * B * 0.98, by + B * 0.15, z + A * 0.32, 0.02]], 5));
  }
}

/**
 * The elephant, Asian unless `african`: built by its own proportions (a cow some 2.5 m at the shoulder, the
 * back highest in the middle; the African's at the shoulder, its ears far larger): the barrel of the body;
 * the pillar legs, the forelegs' wrists and the hind legs' knees and hocks a little bent, the round feet with
 * their toenails; the head with the twin domes of the brow (Asian) and the cheek; the trunk in rings,
 * tapering and curled at its tip, the lower lip under it; the ears as broad thin flaps; the tusks (long for a
 * tusker, short tushes, or none); the eyes; the tail with its tuft. Roles: hide, dark, pale (nails), ivory.
 */
const EL_BALL = (r, n = 10, m = 7) => slathe(Array.from({ length: m }, (_, i) => { const t = i / (m - 1) * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n).translate(0, -r, 0);
function elephantParts(a, { african = false, tusks = 'long' } = {}) {
  const hide = (g) => a('hide', g), bk = african ? [1.8, 1.72, 1.66] : [1.74, 1.82, 1.74];      // the back over the hips, the middle, the shoulders
  // the body: rump, flank, belly slung, chest, shoulders
  hide(tube([[0, bk[0] - 0.12, 1.47, 0.16, 0.18], [0, bk[0] - 0.06, 1.38, 0.38, 0.4], [0, bk[0], 1.1, 0.68, 0.66], [0, bk[1] - 0.02, 0.5, 0.8, 0.74], [0, bk[1] - 0.06, -0.1, 0.82, 0.76], [0, bk[2] - 0.04, -0.62, 0.78, 0.74], [0, bk[2] - 0.02, -0.98, 0.64, 0.68], [0, bk[2] + 0.02, -1.16, 0.42, 0.5]], 12));
  // the legs: pillars from inside the body down through the joints to the round feet
  for (const sx of [-1, 1]) for (const front of [true, false]) {
    const x = sx * 0.45, z = front ? -0.68 : 0.86;
    const P = front
      ? [[x * 0.9, 1.55, z, 0.3, 0.33], [x, 1.05, z - 0.02, 0.24, 0.26], [x, 0.62, z - 0.05, 0.2, 0.21], [x, 0.52, z - 0.055, 0.205, 0.205], [x, 0.3, z - 0.04, 0.2], [x, 0.12, z - 0.03, 0.22], [x, 0.03, z - 0.03, 0.235]]
      : [[x * 0.9, 1.5, z - 0.05, 0.3, 0.36], [x, 1.0, z - 0.12, 0.25, 0.28], [x, 0.82, z - 0.1, 0.22, 0.24], [x, 0.5, z + 0.03, 0.19, 0.2], [x, 0.4, z + 0.04, 0.19], [x, 0.12, z + 0.0, 0.21], [x, 0.03, z, 0.225]];
    hide(tube(P, 10, { capB: false }));
    const [fx, , fz] = P[P.length - 1];
    hide(slathe([[0.001, 0.0], [0.2, 0.0], [0.24, 0.012], [0.235, 0.03]], 12).translate(fx, 0, fz));        // the sole
    const n = front ? 5 : 4;
    for (let k = 0; k < n; k++) { const t = (k / (n - 1) - 0.5) * (front ? 1.7 : 1.4), nx = fx + Math.sin(t) * 0.225, nz = fz - Math.cos(t) * 0.225; a('pale', EL_BALL(0.045, 7, 5).scale(1, 0.75, 0.6).translate(nx, 0.065, nz)); }
  }
  // the head: the cheeks and brow on a short neck, the twin domes (Asian) or the single (African)
  const hz = -1.45, hy = african ? 2.05 : 2.15;
  hide(tube([[0, bk[2] - 0.1, -0.95, 0.56, 0.66], [0, hy, hz + 0.05, 0.5, 0.58], [0, hy - 0.02, hz - 0.25, 0.42, 0.52], [0, hy - 0.1, hz - 0.45, 0.28, 0.36]], 12, { capA: false }));
  if (african) hide(EL_BALL(0.36, 12, 7).scale(1, 0.8, 1).translate(0, hy + 0.3, hz - 0.12));
  else for (const sx of [-1, 1]) hide(EL_BALL(0.23, 10, 7).scale(1, 1, 1.1).translate(sx * 0.14, hy + 0.4, hz - 0.12));
  // the trunk: from the face down in rings, tapering, curling forward at its tip
  const tk = [[0, hy - 0.05, hz - 0.5, 0.2], [0, hy - 0.4, hz - 0.62, 0.17], [0, hy - 0.8, hz - 0.68, 0.14], [0, hy - 1.2, hz - 0.68, 0.115], [0, hy - 1.55, hz - 0.64, 0.095], [0, hy - 1.8, hz - 0.58, 0.08], [0, hy - 1.92, hz - 0.68, 0.068], [0, hy - 1.88, hz - 0.8, 0.058], [0, hy - 1.78, hz - 0.84, 0.05]];
  const T = [];
  for (let i = 0; i + 1 < tk.length; i++) for (let k = 0; k < 3; k++) { const t = k / 3, p = tk[i].map((v, j) => v + (tk[i + 1][j] - v) * t); T.push([p[0], p[1], p[2], p[3] * (k === 1 ? 0.93 : 1)]); }
  T.push(tk[tk.length - 1]);
  hide(tube(T, 10));
  hide(tube([[0, hy - 0.42, hz - 0.36, 0.1, 0.06], [0, hy - 0.5, hz - 0.46, 0.08, 0.05], [0, hy - 0.5, hz - 0.52, 0.04]], 7));     // the lower lip
  // the ears: broad thin flaps laid back along the neck
  for (const sx of [-1, 1]) {
    const e = african ? EL_BALL(1, 14, 9).scale(0.05, 0.62, 0.52) : EL_BALL(1, 12, 8).scale(0.045, 0.4, 0.33);
    e.rotateY(sx * 0.42).rotateZ(sx * 0.1);
    e.translate(sx * (african ? 0.6 : 0.57), hy + (african ? -0.02 : 0.02), hz + (african ? 0.42 : 0.32));
    hide(e);
  }
  // the tusks, out of the sockets either side of the trunk, curving forward and up
  if (tusks !== 'none') for (const sx of [-1, 1]) {
    const L = tusks === 'long' ? (african ? 1.25 : 1.0) : 0.22, b = [sx * 0.2, hy - 0.32, hz - 0.42];
    const pts = tusks === 'long' ? [[...b, 0.075], [sx * 0.24, b[1] - L * 0.35, b[2] - L * 0.3, 0.07], [sx * 0.27, b[1] - L * 0.45, b[2] - L * 0.62, 0.055], [sx * 0.27, b[1] - L * 0.32, b[2] - L * 0.9, 0.03], [sx * 0.26, b[1] - L * 0.2, b[2] - L, 0.012]] : [[...b, 0.05], [sx * 0.22, b[1] - L * 0.6, b[2] - L * 0.5, 0.04], [sx * 0.23, b[1] - L, b[2] - L * 0.8, 0.015]];
    a('ivory', tube(pts, 7));
  }
  for (const sx of [-1, 1]) a('dark', EL_BALL(0.03, 7, 5).scale(0.6, 0.8, 1).translate(sx * 0.375, hy + 0.02, hz - 0.3));    // the eyes
  // the tail, the tuft at its end
  a('hide', tube([[0, bk[0] + 0.08, 1.28, 0.06], [0, bk[0] - 0.3, 1.43, 0.045], [0, 1.0, 1.47, 0.03], [0, 0.85, 1.45, 0.025]], 6));
  a('dark', tube([[0, 0.9, 1.455, 0.03], [0, 0.78, 1.45, 0.045], [0, 0.66, 1.44, 0.012]], 6));
}
/** The farthest crossing of a ray (origin o, direction d) with a non-indexed geometry's triangles (distance along d), or null. */
function farHit(g, o, d) {
  const P = g.attributes.position.array;
  let best = null;
  for (let i = 0; i < P.length; i += 9) {
    const e1 = [P[i + 3] - P[i], P[i + 4] - P[i + 1], P[i + 5] - P[i + 2]], e2 = [P[i + 6] - P[i], P[i + 7] - P[i + 1], P[i + 8] - P[i + 2]];
    const h = [d[1] * e2[2] - d[2] * e2[1], d[2] * e2[0] - d[0] * e2[2], d[0] * e2[1] - d[1] * e2[0]], det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
    if (Math.abs(det) < 1e-9) continue;
    const f = 1 / det, sv = [o[0] - P[i], o[1] - P[i + 1], o[2] - P[i + 2]], u = f * (sv[0] * h[0] + sv[1] * h[1] + sv[2] * h[2]);
    if (u < 0 || u > 1) continue;
    const q = [sv[1] * e1[2] - sv[2] * e1[1], sv[2] * e1[0] - sv[0] * e1[2], sv[0] * e1[1] - sv[1] * e1[0]], v = f * (d[0] * q[0] + d[1] * q[1] + d[2] * q[2]);
    if (v < 0 || u + v > 1) continue;
    const t = f * (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]);
    if (t > 0 && (best === null || t > best)) best = t;
  }
  return best;
}
/**
 * A temple elephant's dressing, laid on its hide (found by rays cast at the built shape): the sacred marks
 * on the brow — 'tripundra', Shiva's three level stripes of holy ash with a red dot of kumkum below, or
 * 'namam', Vishnu's white U with the red line up its middle; a brass bell hanging from a rope round the neck;
 * brass rings at the ankles. Roles: white, red, rope, brass.
 */
function templeDress(a, hide, { marks, bell, anklets }) {
  const front = (x, y) => { const t = farHit(hide, [x, y, -1.4], [0, 0, -1]); return t === null ? null : -1.4 - t; };
  const strip = (pts, role, r) => { const q = pts.map(([x, y]) => { const z = front(x, y); return z === null ? null : [x, y, z + r * 0.35, r, r * 0.45]; }).filter(Boolean); if (q.length > 1) a(role, tube(q, 5)); };
  if (marks === 'tripundra') {
    for (const y of [2.29, 2.36, 2.43]) strip(Array.from({ length: 9 }, (_, k) => [-0.2 + k * 0.05, y]), 'white', 0.02);
    const z = front(0, 2.21); if (z !== null) a('red', slathe([[0.001, 0], [0.036, 0.002], [0.034, 0.012], [0.001, 0.014]], 10).rotateX(Math.PI / 2).translate(0, 2.21, z - 0.006));
  } else if (marks === 'namam') {
    for (const sx of [-1, 1]) strip(Array.from({ length: 7 }, (_, k) => [sx * 0.07 + sx * 0.012 * Math.sin(k / 6 * Math.PI), 2.18 + k * 0.05]), 'white', 0.022);
    strip(Array.from({ length: 5 }, (_, k) => [-0.06 + k * 0.03, 2.17 - 0.012 * Math.sin(k / 4 * Math.PI)]), 'white', 0.022);
    strip(Array.from({ length: 6 }, (_, k) => [0, 2.2 + k * 0.05]), 'red', 0.016);
  }
  if (bell) {
    // the rope round the neck where the head meets the shoulders, the bell from its lowest point (the rope
    // drawn under the throat only, its ends running up under the ears, which hide the rest)
    const zc = -1.12, yc = 1.88, ring = [];
    for (let k = 0; k <= 16; k++) { const th = Math.PI + 0.12 + k / 16 * (Math.PI - 0.24), d = [Math.cos(th), Math.sin(th), 0], t = Math.min(0.72, farHit(hide, [0, yc, zc], d) ?? 0.6); ring.push([d[0] * (t + 0.02), yc + d[1] * (t + 0.02), zc, 0.022]); }
    a('rope', tube(ring, 5));
    const low = ring.reduce((m, p) => (p[1] < m[1] ? p : m));
    a('rope', tube([[low[0], low[1], zc, 0.015], [low[0], low[1] - 0.1, zc - 0.01, 0.015]], 5));
    a('brass', slathe([[0.001, 0], [0.11, 0.0], [0.115, 0.02], [0.095, 0.08], [0.075, 0.18], [0.05, 0.215], [0.02, 0.225], [0.001, 0.226]], 12).translate(low[0], low[1] - 0.33, zc - 0.01));
    a('brass', EL_BALL(0.03, 6, 5).translate(low[0], low[1] - 0.31, zc - 0.01));                      // the clapper
  }
  if (anklets) for (const sx of [-1, 1]) for (const [fz, r] of [[-0.715, 0.222], [0.87, 0.214]]) {
    const ring = Array.from({ length: 17 }, (_, k) => { const th = k / 16 * Math.PI * 2; return [sx * 0.45 + Math.cos(th) * r, 0.24, fz + Math.sin(th) * r, 0.024, 0.03]; });
    a('brass', tube(ring, 5, { capA: false, capB: false }));
  }
}
/**
 * An elephant: { at, rot, seed, african, tusks ('long' | 'short' | 'none'), gear (a caparison over the back), cloth,
 * and a temple elephant's dressing: marks ('tripundra' | 'namam' on the brow), bell (on a rope round the neck), anklets }.
 */
function elephant(el, { bag, col }) {
  const rand = rng(el.seed), african = !!el.african, tusks = el.tusks ?? (african ? 'long' : rand() < 0.4 ? 'long' : rand() < 0.5 ? 'short' : 'none');
  const ek = 0.94 + rand() * 0.12, put = placer(el, bag, ek, [0.96 + rand() * 0.08, 1, 1]), shade = 0.85 + rand() * 0.2;
  const P = assembly(`beast|elephant|${african ? 'a' : ''}|${tusks}`, (a) => elephantParts(a, { african, tusks }));
  put(el.mat ?? 'hide_grey', P.hide.clone(), shade); put('hide_black', P.dark.clone(), 0.6);
  put('ivory', P.pale.clone(), 0.8); if (P.ivory) put('ivory', P.ivory.clone());
  if (el.gear) {
    const G = assembly(`beast-gear|elephant|${african ? 'a' : ''}`, (a) => {
      // the caparison: a cloth laid over the back and hanging down the flanks, following the body, its gilt borders
      const B = [[1.1, 0.68, 0.66], [0.5, 0.8, 0.74], [-0.1, 0.82, 0.76], [-0.62, 0.78, 0.74], [-0.98, 0.64, 0.68]], bk = african ? [1.8, 1.72, 1.66] : [1.74, 1.82, 1.74];
      const cyz = [bk[0], bk[1] - 0.02, bk[1] - 0.06, bk[2] - 0.04, bk[2] - 0.02];
      const sec = (z) => { for (let i = 0; i + 1 < B.length; i++) if (z <= B[i][0] && z >= B[i + 1][0]) { const t = (B[i][0] - z) / (B[i][0] - B[i + 1][0]); return [cyz[i] + (cyz[i + 1] - cyz[i]) * t, B[i][1] + (B[i + 1][1] - B[i][1]) * t, B[i][2] + (B[i + 1][2] - B[i][2]) * t]; } return [cyz[2], B[2][1], B[2][2]]; };
      const at = (z, th, off) => { const [cy, rw, rh] = sec(z); return [Math.cos(th) * (rw + off), cy + Math.sin(th) * (rh + off), z]; };
      const NZ = 8, NA = 16, z0 = 0.5, z1 = -0.7, a0 = -0.2 * Math.PI, a1 = 1.2 * Math.PI;
      const pos = [];
      for (let i = 0; i < NZ; i++) for (let j = 0; j < NA; j++) {
        const zA = z0 + (z1 - z0) * i / NZ, zB = z0 + (z1 - z0) * (i + 1) / NZ, tA = a0 + (a1 - a0) * j / NA, tB = a0 + (a1 - a0) * (j + 1) / NA;
        const p = at(zA, tA, 0.04), q = at(zB, tA, 0.04), r = at(zB, tB, 0.04), u = at(zA, tB, 0.04);
        pos.push(...p, ...r, ...q, ...p, ...u, ...r, ...p, ...q, ...r, ...p, ...r, ...u);           // both faces
      }
      const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      a('cloth', g);
      const ring = (z) => Array.from({ length: 15 }, (_, k) => [...at(z, a0 + (a1 - a0) * k / 14, 0.05), 0.03, 0.012]);
      a('trim', tube(ring(z0), 5)); a('trim', tube(ring(z1), 5));
      for (const th of [a0, a1]) a('trim', tube(Array.from({ length: 9 }, (_, k) => [...at(z0 + (z1 - z0) * k / 8, th, 0.05), 0.03, 0.012]), 5));
    });
    put(el.cloth ?? 'cloth_red', G.cloth.clone()); put('gilt_bronze', G.trim.clone());
  }
  // the howdah on the back, girthed on with ropes round the body; the mahout astride the neck, his goad in hand
  const topAt = (z) => { const t = farHit(P.hide, [0, 1.6, z], [0, 1, 0]); return t === null ? 2.5 : 1.6 + t; };
  if (el.howdah) {
    const H = assembly(`beast-howdah|elephant|${african ? 'a' : ''}|${el.canopy ? 'c' : ''}`, (a) => howdah(a, P.hide, topAt, !!el.canopy));
    put(el.cloth ?? 'cloth_red', H.cloth.clone(), 0.9); put('gilt_bronze', H.gilt.clone()); put('timber', H.wood.clone(), 0.8); put('cloth_white', H.rope.clone(), 0.75);
    if (H.cushion) put(el.cushion ?? 'cloth_ochre', H.cushion.clone());
  }
  if (el.mahout) {
    const m = typeof el.mahout === 'object' ? el.mahout : {}, z0 = -1.06, top = topAt(z0), rot = el.rot ?? 0, ks = (el.s ?? 1) * ek;
    const lz = z0 * ks, wx = el.at[0] + Math.sin(rot) * lz, wz = el.at[1] + Math.cos(rot) * lz, Hm = 1.62;
    figure({ t: 'figure', at: [wx, wz], y: (el.y ?? 0) + top * ks - 0.79 * Hm / 1.65, rot, seed: el.seed ^ 0x2f6b, h: Hm, pose: 'ride', dress: 'tunic', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_white', hat: 'turban', feet: 'bare', ...m }, { bag, col: { circle() {}, rect() {} } });
  }
  if (el.marks || el.bell || el.anklets) {
    const T = assembly(`beast-temple|elephant|${african ? 'a' : ''}|${el.marks ?? ''}|${el.bell ? 'b' : ''}|${el.anklets ? 'k' : ''}`, (a) => templeDress(a, P.hide, el));
    if (T.white) put('paint_white', T.white.clone()); if (T.red) put('stucco_red', T.red.clone());
    if (T.rope) put('cloth_white', T.rope.clone(), 0.85); if (T.brass) put('bronze', T.brass.clone());
  }
  const [x, z] = el.at, y = el.y ?? 0;
  col.circle(x, z, 1.4, y, y + 3);
}

/**
 * The howdah (hauda) of a Mughal riding elephant: a padded mattress (gaddi) laid over the caparison on the back, on it a
 * platform with a low railing of turned gilt posts and rails all round, cushions inside; with `canopy` four posts
 * carrying a domed cloth canopy with a finial; girthed on by two ropes round the body and a breast rope. Roles:
 * cloth, gilt, wood, rope, cushion.
 */
function howdah(a, hide, topAt, canopy) {
  const z0 = -0.45, z1 = 0.65, hw = 0.55, top = Math.max(topAt(z0), topAt((z0 + z1) / 2), topAt(z1)) + 0.12;
  // the mattress: from the back up to the platform, its sides falling a little
  const pad = [];
  for (let i = 0; i <= 6; i++) { const z = z0 - 0.05 + (z1 - z0 + 0.1) * i / 6; pad.push([0, (topAt(z) + top) / 2 + 0.01, z, hw + 0.08, Math.max(0.05, (top - topAt(z)) / 2 + 0.04)]); }
  a('cloth', tube(pad, 12));
  // the platform and its railing: corner posts with finials, posts between, a top rail and a mid rail, balusters
  a('wood', box(-hw, top, z0, hw, top + 0.07, z1));
  const y0 = top + 0.07, rh = 0.42, posts = [];
  for (const x of [-hw + 0.03, hw - 0.03]) for (let k = 0; k <= 4; k++) posts.push([x, z0 + 0.03 + (z1 - z0 - 0.06) * k / 4, k === 0 || k === 4]);
  for (const z of [z0 + 0.03, z1 - 0.03]) for (let k = 1; k < 3; k++) posts.push([-hw + 0.03 + (2 * hw - 0.06) * k / 3, z, false]);
  for (const [x, z, corner] of posts) {
    a('gilt', slathe([[0.03, 0], [0.032, 0.03], [0.02, 0.06], [0.026, 0.12], [0.017, 0.2], [0.024, 0.3], [0.02, rh], [0.001, rh + 0.002]], 8).translate(x, y0, z));
    if (corner) a('gilt', slathe([[0.001, 0], [0.035, 0.0], [0.04, 0.04], [0.025, 0.08], [0.008, 0.13], [0.001, 0.15]], 8).translate(x, y0 + rh, z));
  }
  const rail = (y, r) => { const c = [[-hw + 0.03, z0 + 0.03], [hw - 0.03, z0 + 0.03], [hw - 0.03, z1 - 0.03], [-hw + 0.03, z1 - 0.03], [-hw + 0.03, z0 + 0.03]]; a('gilt', tube(c.map(([x, z]) => [x, y, z, r]), 6, { capA: false, capB: false })); };
  rail(y0 + rh, 0.022); rail(y0 + 0.2, 0.014);
  for (const [x0, za, x1, zb] of [[-hw + 0.03, z0 + 0.03, hw - 0.03, z0 + 0.03], [-hw + 0.03, z1 - 0.03, hw - 0.03, z1 - 0.03], [-hw + 0.03, z0 + 0.03, -hw + 0.03, z1 - 0.03], [hw - 0.03, z0 + 0.03, hw - 0.03, z1 - 0.03]]) {
    const L = Math.hypot(x1 - x0, zb - za), n = Math.floor(L / 0.09);
    for (let k = 1; k < n; k++) { const t = k / n; a('gilt', tube([[x0 + (x1 - x0) * t, y0 + 0.2, za + (zb - za) * t, 0.008], [x0 + (x1 - x0) * t, y0 + rh, za + (zb - za) * t, 0.008]], 4, { capA: false, capB: false })); }
  }
  // the cushions: a seat and a bolster against the back rail
  a('cushion', tube([[-hw + 0.1, y0 + 0.07, (z0 + z1) / 2, 0.07, 0.07], [hw - 0.1, y0 + 0.07, (z0 + z1) / 2, 0.07, 0.07]], 10));
  a('cushion', tube([[0, y0 + 0.06, z0 + 0.15, hw - 0.08, 0.06], [0, y0 + 0.06, z1 - 0.15, hw - 0.08, 0.06]], 10));
  if (canopy) {
    const ch = 1.25;
    for (const x of [-hw + 0.03, hw - 0.03]) for (const z of [z0 + 0.03, z1 - 0.03]) a('gilt', tube([[x, y0 + rh, z, 0.018], [x, y0 + ch, z, 0.016]], 6));
    a('cloth', slathe([[hw * 1.25, 0], [hw * 1.22, 0.04], [hw * 1.1, 0.12], [hw * 0.85, 0.24], [hw * 0.5, 0.33], [0.05, 0.37], [0.001, 0.372]], 16).scale(1, 1, (z1 - z0) / (2 * hw)).translate(0, y0 + ch, (z0 + z1) / 2));
    a('cloth', slathe([[hw * 1.25, 0.002], [hw * 1.25, -0.12], [hw * 1.24, -0.125], [hw * 1.24, 0.0]], 16).scale(1, 1, (z1 - z0) / (2 * hw)).translate(0, y0 + ch, (z0 + z1) / 2));        // the valance
    a('cloth', slathe([[0.001, 0.004], [hw * 1.235, 0.0]], 16).scale(1, 1, (z1 - z0) / (2 * hw)).translate(0, y0 + ch - 0.01, (z0 + z1) / 2));                            // the lining under the dome
    a('gilt', slathe([[0.001, 0], [0.04, 0.0], [0.05, 0.05], [0.025, 0.1], [0.035, 0.14], [0.01, 0.2], [0.001, 0.22]], 8).translate(0, y0 + ch + 0.36, (z0 + z1) / 2));
  }
  // the girths: ropes round the body, and a breast rope round the chest
  for (const zg of [z0 + 0.15, z1 - 0.15]) {
    const ring = [];
    for (let k = 0; k <= 24; k++) {
      const th = k / 24 * Math.PI * 2, d = [Math.cos(th), Math.sin(th), 0], t = farHit(hide, [0, 1.75, zg], d) ?? 0.8, p = [d[0] * (t + 0.06), 1.75 + d[1] * (t + 0.06), zg];
      if (p[1] > top) { p[1] = top; p[0] = Math.sign(p[0] || 1) * Math.min(Math.abs(p[0]), hw + 0.09); }
      ring.push([...p, 0.022]);
    }
    a('rope', tube(ring, 5, { capA: false, capB: false }));
  }
}

/** animal: { kind, mat, graze, gear } — a still beast, head toward −z. */
export function animal(el, { bag, col }) {
  if (el.kind === 'elephant') return elephant(el, { bag, col });
  const rand = rng(el.seed), kind = BEASTS[el.kind] ? el.kind : 'goat', K = BEASTS[kind], m = el.mat ?? K.mats[Math.floor(rand() * K.mats.length)];
  const graze = el.graze ?? (K.graze && rand() < 0.35), size = 0.92 + rand() * 0.16, fat = 0.94 + rand() * 0.12;
  const put = placer(el, bag, size, [fat, 1, 1]), shade = 0.85 + rand() * 0.25;
  // the body (legs, tail, hump) is the same whatever the stance; the neck and head are the stance's own
  const P0 = assembly(`beast|${kind}|`, (a) => build(K, kind, false, a)), P = graze ? assembly(`beast|${kind}|g`, (a) => build(K, kind, true, a)) : P0;
  const dk = m === 'hide_black' ? 'hide_black' : kind === 'yak' || K.tail === 'hair' && m !== 'hide_tan' ? 'hide_black' : 'hide_brown', ds = m === 'hide_black' ? 0.8 : 0.6;
  put(m, P0.hide.clone(), shade); put(m, P.hhide.clone(), shade);
  if (P0.dark) put(dk, P0.dark.clone(), ds);
  if (P.hdark) put(dk, P.hdark.clone(), ds);
  if (P.horn) put('ivory', P.horn.clone());
  if (P.pale) put(K.snout ? 'skin_light' : 'hide_white', P.pale.clone());
  const wantGear = el.gear ?? ((kind === 'donkey' && rand() < 0.6) || (kind === 'camel' && rand() < 0.7) || (kind === 'horse' && rand() < 0.4));
  if (wantGear && (kind === 'horse' || kind === 'donkey' || kind === 'camel')) {
    const Gr = assembly(`beast-gear|${kind}`, (a) => gear(K, kind, a));
    const cloth = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_brown', 'cloth_green'][Math.floor(rand() * 5)];
    if (Gr.cloth) put(cloth, Gr.cloth.clone());
    if (Gr.leather) put('hide_brown', Gr.leather.clone(), 0.55);
    if (Gr.wicker) put('wicker', Gr.wicker.clone());
  }
  const [x, z] = el.at, y = el.y ?? 0;
  if (K.L > 0.9) col.circle(x, z, K.L / 2 * 0.75, y, y + K.H);
}
