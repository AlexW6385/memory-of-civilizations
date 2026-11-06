// The beasts of the streets and fields (DESIGN §5 "Objects of use": horses, oxen, donkeys, camels,
// dogs …, as still figures). Each is lofted from its proportions: a barrel of a body deeper at the
// chest than at the flank, a neck and a head along their angles, legs with their joints (the
// hind leg's hock bent back), hooves or paws, ears, horns, humps, mane and tail. The pieces of one
// material are merged into one shape per kind and stance (head up, or down to graze), so a beast
// is three or four instances; its coat, build and stance vary with its seed, and a horse may carry
// a saddle cloth, a donkey its pack saddle and panniers, a camel its saddle rug.

import { box } from '../core/geom.js';
import { rng, placer, assembly, tube, slathe } from './kit.js';

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
  if (nl > 0.15) hide(tube(N, 8)); else hd = [0, nb[1] - B * 0.15, nb[2] - B * 0.25];
  const hl = K.head, hr = B * K.hr, hdir = [0, Math.sin(ha * D2R), -Math.cos(ha * D2R)], H = (k) => [hd[0], hd[1] + hdir[1] * hl * k, hd[2] + hdir[2] * hl * k];
  const lift = [0, Math.cos(ha * D2R) * hr * 0.2, Math.sin(ha * D2R) * hr * 0.2];
  hide(tube([[...H(-0.08), hr * 0.85, hr * 0.95], [...H(0.15), hr * 0.95, hr * 1.1], [...H(0.5), hr * (pig ? 0.85 : 0.72), hr * (pig ? 0.85 : 0.88)], [...H(0.86), hr * (pig ? 0.6 : 0.6), hr * (pig ? 0.6 : 0.7)], [...H(1.0), hr * (pig ? 0.55 : 0.45), hr * (pig ? 0.55 : 0.5)]], 8));
  if (pig) a('pale', slathe([[0.001, 0], [hr * 0.5, 0.002], [hr * 0.52, 0.03], [0.001, 0.032]], 10).rotateX(-Math.PI / 2 + ha * D2R).translate(...H(0.99)));
  if (K.muzzle) a('pale', tube([[...H(0.72), hr * 0.66, hr * 0.76], [...H(0.9), hr * 0.62, hr * 0.72], [...H(1.02), hr * 0.42, hr * 0.48]], 8));
  if (K.darkface) a('dark', tube([[...H(0.05), hr * 0.92, hr * 1.02], [...H(0.5), hr * 0.76, hr * 0.92], [...H(1.01), hr * 0.47, hr * 0.52]], 8));
  // the eyes, either side of the head
  for (const s of [-1, 1]) { const e = H(0.22); a('dark', slathe([[0.001, -0.016], [0.018, 0], [0.001, 0.016]], 5).scale(0.5, 1, 1).translate(e[0] + s * hr * 0.88, e[1] + lift[1] * 1.5, e[2] + lift[2])); }
  // the ears (pricked, or drooping), the horns, the forelock and mane
  const top = H(0.02);
  if (K.ears) for (const s of [-1, 1]) {
    const base = [s * hr * 0.55, top[1] + hr * 0.7, top[2] + 0.02];
    const tip = K.droop ? [s * (hr * 0.7 + K.ears * 0.8), base[1] - K.ears * 0.55, base[2] - K.ears * 0.25] : [s * (hr * 0.55 + K.ears * 0.3), base[1] + K.ears * 0.95, base[2] + K.ears * 0.2];
    hide(tube([[...base, K.ears * 0.18, K.ears * 0.1], [(base[0] + tip[0]) / 2, (base[1] + tip[1]) / 2, (base[2] + tip[2]) / 2, K.ears * 0.22, K.ears * 0.09], [...tip, 0.004]], 6));
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
    a('dark', tube([[...up(p0, 0.55), 0.03 * K.mane, 0.06 * K.mane], [...up(p1, 0.85), 0.03 * K.mane, 0.08 * K.mane], [...up(p2, 0.9), 0.025 * K.mane, 0.07 * K.mane], [...H(0.02).map((v, i) => v + (i === 1 ? hr * 0.75 : 0)), 0.02, 0.03]], 6));
  }
  if (K.beard) a('hide', tube([[...H(0.82).map((v, i) => v - (i === 1 ? hr * 0.5 : 0)), 0.02], [...H(0.75).map((v, i) => v - (i === 1 ? hr * 1.4 : 0)), 0.004]], 5));
  if (K.dewlap) hide(tube([[0, nb[1] - B * 0.65, nb[2] + 0.05, B * 0.12, B * 0.3], [0, (nb[1] + hd[1]) / 2 - B * 0.65 * K.dewlap, (nb[2] + hd[2]) / 2, B * 0.08, B * 0.35 * K.dewlap], [0, hd[1] - hr * 0.8, hd[2] + 0.02, B * 0.05, B * 0.12]], 6));
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

/** animal: { kind, mat, graze, gear } — a still beast, head toward −z. */
export function animal(el, { bag, col }) {
  const rand = rng(el.seed), kind = BEASTS[el.kind] ? el.kind : 'goat', K = BEASTS[kind], m = el.mat ?? K.mats[Math.floor(rand() * K.mats.length)];
  const graze = el.graze ?? (K.graze && rand() < 0.35), size = 0.92 + rand() * 0.16, fat = 0.94 + rand() * 0.12;
  const put = placer(el, bag, size, [fat, 1, 1]), shade = 0.85 + rand() * 0.25;
  const P = assembly(`beast|${kind}|${graze ? 'g' : ''}`, (a) => build(K, kind, graze, a));
  put(m, P.hide.clone(), shade);
  if (P.dark) put(m === 'hide_black' ? 'hide_black' : kind === 'yak' || K.tail === 'hair' && m !== 'hide_tan' ? 'hide_black' : 'hide_brown', P.dark.clone(), m === 'hide_black' ? 0.8 : 0.6);
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
