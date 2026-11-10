// Egyptian free-standing objects and special masses: pylon towers with flagpole niches,
// cedar flagpoles, granite falcons of Horus, the granite naos, barque and barque stand,
// altars, cedar door leaves, date palms.

import { Matrix4, BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { box, frustum, lathe, disc, rod, place, fromTriangles, quad, sweep } from '../../core/geom.js';
import { trim, wingedDisc, cavettoProfile, rectLoop } from './trim.js';

const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/**
 * Pylon tower with flagpole niches in the front face.
 * el = { t:'pylon_tower', rect:[x0,z0,x1,z1], y0, h, batter: b (inset of each face at the top),
 *        front: 'zp'|'zn' (which face is the facade), niches: [{x, w, depth, top}], trim }
 */
// Egyptian figures in outline, each a few overlapping parts (body, crown, arms, staff) standing out
// from the face at slightly different depths, the way the carver's planes overlap (side view,
// facing +u, feet at 0, height 1 to the top of the crown): the king striding with his mace raised
// to smite the captives he holds by the hair; Horus, falcon-headed, in the double crown, with the
// was-sceptre and the ankh; the king offering; a god seated on a block throne.
const circ = (cx, cy, rx, ry = rx, n = 10) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * rx, cy + Math.sin(i / n * Math.PI * 2) * ry]);
const CROWN = [
  [[-0.065, 0.81], [0.055, 0.81], [0.05, 0.885], [-0.03, 0.885], [-0.04, 0.975], [-0.075, 0.975]],                        // the red crown with its tall back
  [[-0.028, 0.88], [0.04, 0.88], [0.035, 0.94], [0.015, 0.985], [0.0, 1.0], [-0.015, 0.99], [-0.03, 0.95]],               // the white crown rising out of it
];
const KNEEL = [[-0.22, 0], [0.16, 0], [0.17, 0.08], [0.04, 0.14], [0.03, 0.35], [0.05, 0.6], [0.18, 0.75], [0.2, 0.85], [0.15, 0.86], [0.04, 0.72], [0.03, 0.78], [0.04, 0.85], [0.01, 0.92], [-0.06, 0.9], [-0.07, 0.8], [-0.05, 0.72], [-0.08, 0.6], [-0.1, 0.35], [-0.16, 0.22], [-0.22, 0.12]];
const STAND = (beak) => [[-0.12, 0], [-0.03, 0], [0.0, 0.3], [0.03, 0], [0.16, 0], [0.16, 0.015], [0.1, 0.06], [0.085, 0.29], [0.1, 0.3], [0.07, 0.45], [0.08, 0.6], [0.08, 0.66], [0.035, 0.7],
  ...(beak ? [[0.05, 0.74], [0.115, 0.765], [0.06, 0.79], [0.06, 0.83]] : [[0.055, 0.735], [0.07, 0.78], [0.05, 0.81], [0.045, 0.83]]), [0.0, 0.85], [-0.06, 0.82], [-0.085, 0.66], [-0.07, 0.55], [-0.06, 0.45], [-0.09, 0.3], [-0.1, 0.16], [-0.13, 0.02]];
const WAS = (u) => [[[u - 0.01, 0.02], [u + 0.01, 0.02], [u + 0.01, 0.74], [u - 0.01, 0.74]], [[u - 0.025, 0], [u + 0.025, 0], [u + 0.01, 0.03], [u - 0.01, 0.03]], [[u - 0.015, 0.735], [u + 0.04, 0.76], [u + 0.045, 0.78], [u - 0.015, 0.775]]];
const FIG = {
  smite: [
    [[-0.26, 0.02], [-0.25, 0], [-0.12, 0], [-0.01, 0.32], [0.08, 0], [0.22, 0], [0.22, 0.02], [0.13, 0.06], [0.11, 0.2], [0.13, 0.29], [0.17, 0.28], [0.075, 0.45], [0.07, 0.52], [0.09, 0.6], [0.085, 0.66], [0.03, 0.7], [0.055, 0.735], [0.07, 0.78], [0.05, 0.81], [0.045, 0.83], [-0.05, 0.83], [-0.065, 0.77], [-0.04, 0.71], [-0.08, 0.66], [-0.065, 0.55], [-0.055, 0.45], [-0.1, 0.3], [-0.12, 0.18], [-0.2, 0.04]],
    ...CROWN,
    [[-0.075, 0.665], [-0.035, 0.635], [-0.13, 0.75], [-0.145, 0.87], [-0.185, 0.875], [-0.175, 0.745]],                    // the arm raised behind the head
    [[-0.18, 0.865], [-0.16, 0.87], [-0.195, 0.975], [-0.215, 0.97]], circ(-0.207, 0.995, 0.026, 0.032),                       // the mace
    [[0.03, 0.66], [0.08, 0.675], [0.3, 0.56], [0.3, 0.52], [0.07, 0.6]],                                                  // the arm reaching to the captives' hair
    // three captives kneeling before him, one behind the other, their arms raised in supplication
    ...[0.33, 0.38, 0.43].map((u0) => KNEEL.map(([u, v]) => [u0 - u * 0.58, v * 0.58])),
  ],
  god: [STAND(true), ...CROWN, [[0.03, 0.65], [0.075, 0.67], [0.22, 0.6], [0.22, 0.56], [0.06, 0.59]], ...WAS(0.215),
    [[-0.1, 0.28], [-0.088, 0.28], [-0.088, 0.36], [-0.1, 0.36]], [[-0.125, 0.36], [-0.063, 0.36], [-0.063, 0.375], [-0.125, 0.375]], circ(-0.094, 0.405, 0.02, 0.03)],
  offer: [STAND(false), [[-0.06, 0.81], [0.05, 0.81], [0.06, 0.87], [0.03, 0.93], [-0.03, 0.94], [-0.08, 0.9]],             // the king in the blue crown
    [[0.03, 0.65], [0.075, 0.68], [0.19, 0.66], [0.19, 0.62], [0.06, 0.6]], circ(0.205, 0.68, 0.03, 0.035)],
  // Bes, frontal: the lion-maned dwarf god in his crown of plumes, hands on his bowed legs (Edfu dossier §4.2, removed, in git history)
  bes: (() => { const R = [[0.04, 1.0], [0.06, 0.9], [0.09, 1.0], [0.11, 0.9], [0.14, 0.98], [0.15, 0.8], [0.2, 0.78], [0.24, 0.7], [0.22, 0.6], [0.27, 0.55], [0.32, 0.45], [0.24, 0.33], [0.25, 0.26], [0.27, 0.12], [0.29, 0.02], [0.3, 0], [0.11, 0], [0.13, 0.1], [0.09, 0.2], [0.02, 0.22], [0.03, 0.08], [0.015, 0.06]];
    return [[...R, ...R.slice().reverse().map(([u, v]) => [-u, v])], circ(0, 0.67, 0.16, 0.11, 14), circ(0, 0.4, 0.15, 0.1, 12)]; })(),
  seated: [[[-0.2, 0], [0.14, 0], [0.14, 0.02], [0.11, 0.03], [0.1, 0.33], [0.03, 0.35], [0.02, 0.52], [0.07, 0.6], [0.065, 0.66], [0.025, 0.69], [0.04, 0.72], [0.09, 0.745], [0.04, 0.77], [0.04, 0.8], [-0.02, 0.82], [-0.07, 0.79], [-0.09, 0.64], [-0.075, 0.5], [-0.08, 0.44], [-0.2, 0.44]],
    circ(-0.015, 0.885, 0.06), ...WAS(0.13)],
};
function earClip(P) {
  const idx = P.map((_, i) => i), out = [];
  let area = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; area += a[0] * b[1] - b[0] * a[1]; }
  const ccw = area > 0, cr = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inside = (p, a, b, c) => { const d1 = cr(a, b, p), d2 = cr(b, c, p), d3 = cr(c, a, p); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
  for (let guard = 0; idx.length > 3 && guard < 3000; guard++) {
    let cut = false;
    for (let i = 0; i < idx.length; i++) {
      const ia = idx[(i + idx.length - 1) % idx.length], ib = idx[i], ic = idx[(i + 1) % idx.length], cv = cr(P[ia], P[ib], P[ic]);
      if (ccw ? cv <= 0 : cv >= 0) continue;
      if (idx.some((j) => j !== ia && j !== ib && j !== ic && inside(P[j], P[ia], P[ib], P[ic]))) continue;
      out.push([ia, ib, ic]); idx.splice(i, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push(idx.slice());
  return out;
}
const CUTS = new Map();
/**
 * A figure in relief on a face: `place(u, v, d)` maps face coordinates to 3-D; each part a little
 * prouder than the one before, so no two front faces lie in one plane.
 */
export function figure(bag, mat, kind, place, u0, v0, h, dir = 1, d = 0.06) {
  const T = [];
  FIG[kind].forEach((P, k) => {
    const tri = CUTS.get(P) ?? (CUTS.set(P, earClip(P)), CUTS.get(P)), dd = d * (0.82 + 0.06 * (k % 4)), V = ([u, v], w) => place(u0 + dir * u * h * 1.15, v0 + v * h, w);
    for (const [a, b, c] of tri) T.push(...V(P[a], dd), ...V(P[b], dd), ...V(P[c], dd), ...V(P[a], dd), ...V(P[c], dd), ...V(P[b], dd));
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], q = [V(a, 0), V(b, 0), V(b, dd), V(a, dd)]; T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]); }
  });
  bag.add(mat, fromTriangles(T));
}
/** A column of hieroglyphs in relief between two ruled lines: signs of varied shape stacked from v1 down to v0, `w` wide. */
function glyphColumn(bag, mat, place, u, v0, v1, w, seed, d = 0.05, rules = [-1]) {
  const r = rnd(seed), T = [], P = (uu, vv, dd) => place(uu, vv, dd);
  const prism = (poly) => {
    const tri = earClip(poly);
    for (const [a, b, c] of tri) T.push(...P(...poly[a], d), ...P(...poly[b], d), ...P(...poly[c], d), ...P(...poly[a], d), ...P(...poly[c], d), ...P(...poly[b], d));
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], q = [P(...a, 0), P(...b, 0), P(...b, d), P(...a, d)]; T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]); }
  };
  let v = v1 - w * 0.15;
  while (v > v0 + w * 0.3) {
    const k = r(), hh = w * (k < 0.3 ? 0.3 : k < 0.6 ? 0.55 : 0.8);
    if (v - hh < v0) break;
    if (k < 0.3) prism([[u - w * 0.4, v - hh], [u + w * 0.4, v - hh], [u + w * 0.4, v], [u - w * 0.4, v]]);                   // a flat sign (water, a mat, a loaf)
    else if (k < 0.45) prism(circ(u, v - hh / 2, w * 0.28, hh * 0.45, 8));                                                     // the sun, a ring
    else if (k < 0.75) {                                                                                                           // a bird
      prism([[u - w * 0.3, v - hh], [u + w * 0.05, v - hh], [u + w * 0.22, v - hh * 0.45], [u + w * 0.38, v - hh * 0.3], [u + w * 0.22, v - hh * 0.1], [u + w * 0.12, v], [u - w * 0.02, v - hh * 0.2], [u - w * 0.38, v - hh * 0.6]]);
    } else {                                                                                                                       // two tall signs side by side (reeds, staves)
      prism([[u - w * 0.35, v - hh], [u - w * 0.08, v - hh], [u - w * 0.08, v], [u - w * 0.35, v]]);
      prism([[u + w * 0.08, v - hh], [u + w * 0.35, v - hh], [u + w * 0.35, v - hh * 0.2], [u + w * 0.08, v]]);
    }
    v -= hh + w * 0.15;
  }
  // the ruling either side
  for (const s of rules) prism([[u + s * w * 0.55 - w * 0.03, v0], [u + s * w * 0.55 + w * 0.03, v0], [u + s * w * 0.55 + w * 0.03, v1], [u + s * w * 0.55 - w * 0.03, v1]]);
  bag.add(mat, fromTriangles(T));
}
export function pylonTower(el, { bag, col, style }) {
  const [x0, z0, x1, z1] = el.rect;
  const H = el.h, b = el.batter, y0 = el.y0 ?? 0;
  const frontP = el.front === 'zp';
  const mat = el.mat || 'sandstone';
  // split along x at the niche edges
  const cuts = [x0];
  const niches = (el.niches || []).slice().sort((p, q) => p.x - q.x);
  for (const n of niches) cuts.push(n.x - n.w / 2, n.x + n.w / 2);
  cuts.push(x1);
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = cuts[i], c = cuts[i + 1];
    if (c - a < 1e-3) continue;
    // linear batter: the x-ends lean in only at the tower's own ends
    const fx = (x) => (x - x0) / (x1 - x0);
    const ends = el.batterEnds ?? [b, b];
    const insXn = i === 0 ? ends[0] : 0, insXp = i === cuts.length - 2 ? ends[1] : 0;
    const niche = niches.find((n) => Math.abs(n.x - n.w / 2 - a) < 1e-6);
    const zf = frontP ? z1 : z0, zb = frontP ? z0 : z1;
    const zf0 = frontP ? z1 : z0, zb0 = frontP ? z0 : z1;
    if (niche) {
      const zr = frontP ? zf0 - niche.depth : zf0 + niche.depth;
      col.rect([a, Math.min(zr, zb0), c, Math.max(zr, zb0)], y0, y0 + H);
    } else col.rect([a, z0, c, z1], y0, y0 + H);
    if (!niche) {
      // the faces toward a niche are its reveals: drawn; the faces against a neighbour of full depth are not
      const nicheAt = (x) => niches.some((n) => Math.abs(n.x - n.w / 2 - x) < 1e-6 || Math.abs(n.x + n.w / 2 - x) < 1e-6);
      bag.add(mat, frustum([a, Math.min(zf, zb), c, Math.max(zf, zb)], y0, y0 + H, insXn, insXp, b, b, { noBottom: true, noXn: i > 0 && !nicheAt(a), noXp: i < cuts.length - 2 && !nicheAt(c) }));
    } else {
      // recessed part from the ground to the niche top, then full depth above
      const yt = niche.top, d = niche.depth;
      const s = b / H;
      const zfr = frontP ? zf - d : zf + d;
      const rect1 = frontP ? [a, zb, c, zfr] : [a, zfr, c, zb];
      const ins1 = frontP ? [0, 0, b * yt / H, s * yt] : [0, 0, s * yt, b * yt / H];
      bag.add(mat, frustum(rect1, y0, y0 + yt, 0, 0, ins1[2], ins1[3], { noBottom: true, noXn: true, noXp: true }));
      // the part above: base front face continues the battered plane
      const zfa = frontP ? zf - s * yt : zf + s * yt, zba = frontP ? zb + s * yt : zb - s * yt;
      const rect2 = [a, Math.min(zfa, zba), c, Math.max(zfa, zba)];
      const rem = b - s * yt;
      bag.add(mat, frustum(rect2, y0 + yt, y0 + H, 0, 0, rem, rem, { noBottom: false, noXn: true, noXp: true }));
    }
  }
  if (el.trim) trim({ ...el, t: 'block', y0, y1: y0 + H, batter: [...(el.batterEnds ?? [b, b]), b, b] }, { bag, style });
  // the reliefs on the front (Edfu dossier §4.1, removed, in git history): in each field clear of the flagpole
  // niches the colossal scene of the king smiting the captives he holds by the hair before Horus,
  // who holds out the was-sceptre; columns of text above and between them; over that two registers
  // of the king offering to seated gods, each scene with its column of text, on ruled ground lines
  const zf = frontP ? z1 : z0, sg = frontP ? 1 : -1;
  if (el.reliefs !== false && !el.simple) {
    const place = (u, v, d) => [u, y0 + v, zf - sg * b * v / H + sg * (0.02 + d)];
    const free = [x0 + (el.batterEnds ?? [b, b])[0] + 1, x1 - (el.batterEnds ?? [b, b])[1] - 1];
    const blocks = [];
    let u = free[0];
    for (const n of niches) { if (n.x - n.w / 2 - 1 > u) blocks.push([u, n.x - n.w / 2 - 1]); u = n.x + n.w / 2 + 1; }
    if (free[1] > u) blocks.push([u, free[1]]);
    const dirIn = (el.towardDoor ?? 1), R = 'sandstone_relief';
    let seed = Math.round(x0 * 7 + z0 * 13);
    const ledge = (a, c, vy) => bag.add('sandstone', box(a, y0 + vy - 0.25, Math.min(place(0, vy, 0)[2], place(0, vy, 0.12)[2]), c, y0 + vy - 0.1, Math.max(place(0, vy, 0)[2], place(0, vy, 0.12)[2])));
    for (const [a, c] of blocks) {
      const w = c - a; if (w < 4) continue;
      const big = Math.min(H * 0.42, (w + 1.2) * 0.7), m = (a + c) / 2 - dirIn * big * 0.01, v0 = H * 0.06;
      figure(bag, R, 'smite', place, m - dirIn * big * 0.4, v0, big, dirIn, 0.2);
      figure(bag, R, 'god', place, m + dirIn * big * 0.55, v0, big * 0.95, -dirIn, 0.2);
      // short columns of text between the king's head and the god's
      const gw = big * 0.045;
      for (let k = 0; k < 3; k++) glyphColumn(bag, R, place, m + dirIn * big * (0.06 + k * 0.05), v0 + big * 0.66, v0 + big * 1.0, gw, seed++, 0.1, k === 2 ? [-1, 1] : [-1]);
      ledge(a, c, v0 - 0.05);
      // over it, registers of scenes of the king offering to a seated god up to the torus
      const r0 = v0 + big * 1.1, r1 = H - 1.2, nr = Math.max(1, Math.round((r1 - r0) / (H * 0.2))), rh = (r1 - r0) / nr;
      for (let j = 0; j < nr; j++) {
        const vy = r0 + j * rh, hh = rh * 0.86;
        const n = Math.max(1, Math.round(w / (hh * 1.1))), sw = w / n;
        for (let i = 0; i < n; i++) {
          const s0 = dirIn > 0 ? a + i * sw : c - (i + 1) * sw;
          const k0 = dirIn > 0 ? s0 + sw * 0.28 : s0 + sw * 0.72, g0 = dirIn > 0 ? s0 + sw * 0.72 : s0 + sw * 0.28;
          figure(bag, R, 'offer', place, k0, vy, hh * 0.9, dirIn, 0.12);
          figure(bag, R, 'seated', place, g0, vy, hh * 0.85, -dirIn, 0.12);
          for (const dk of [-0.5, 0.5]) glyphColumn(bag, R, place, (k0 + g0) / 2 + dk * hh * 0.099, vy + hh * 0.6, vy + hh * 0.98, hh * 0.09, seed++, 0.08, dk > 0 ? [-1, 1] : [-1]);
        }
        ledge(a, c, vy);
      }
    }
  }
  // the clamps that held the flagpoles: a cedar beam out of a window in the tower's face to a collar
  // round the pole, one in the niche and one above it (Edfu dossier §4.1, removed, in git history)
  if (!el.simple) for (const n of niches) {
    const pz = zf - sg * (n.pole ?? 0.15), PH = n.poleH ?? 40;
    for (const yy of [n.top * 0.6, n.top + 2.5]) {
      const inNiche = yy < n.top, wallZ = (v) => zf - sg * ((inNiche ? n.depth : 0) + b * v / H);
      const r = yy < PH * 0.3 ? 0.42 - 0.02 * yy / (PH * 0.3) : 0.4 - 0.1 * (yy - PH * 0.3) / (PH * 0.45);
      const za = wallZ(yy) - sg * 0.3, zb = pz;
      bag.add('cedar', box(n.x - 0.24, y0 + yy - 0.3, Math.min(za, zb), n.x + 0.24, y0 + yy + 0.3, Math.max(za, zb)));
      bag.add('cedar', lathe([[r + 0.07, 0], [r + 0.09, 0.08], [r + 0.09, 0.72], [r + 0.07, 0.8], [r - 0.02, 0.8]], 14, null, n.x, y0 + yy - 0.4, pz));
      const ww = Math.min(0.6, n.w / 2 - 0.15), q = [[-ww, -0.85], [ww, -0.85], [ww, 0.85], [-ww, 0.85]].map(([du, dv]) => [n.x + du, y0 + yy + dv, wallZ(yy + dv) + sg * 0.02]);
      const t = sg > 0 ? [...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]] : [...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]];
      bag.add('lacquer_black', fromTriangles(t));
    }
  }
}

/**
 * The Bes dado: the tall block set on a column's abacus under the architrave in the birth houses, a
 * figure of Bes in relief on each of its faces (Edfu dossier §4.2, removed, in git history).
 * el = { at, y (foot), w (side), h }
 */
export function besDado(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, w = el.w ?? 0.95, h = el.h ?? 1.4, hw = w / 2;
  bag.add(el.mat || 'sandstone_column', box(x - hw, y, z - hw, x + hw, y + h, z + hw));
  const fh = Math.min(h * 0.86, w * 1.25);
  for (const [nx, nz] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
    const place = (u, v, d) => [x + nx * (hw + d + 0.005) + nz * u, y + v, z + nz * (hw + d + 0.005) - nx * u];
    figure(bag, 'sandstone_relief', 'bes', place, 0, (h - fh) / 2, fh, nx + nz > 0 ? 1 : -1, 0.035);
  }
}

/** Tall cedar flagpole, tapering, standing on a stone base in a niche of the pylon, pennants at its top (Edfu dossier §4.1, removed, in git history). */
export function flagpole(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 38;
  bag.add('cedar', lathe([[0.42, 0], [0.4, h * 0.3], [0.3, h * 0.75], [0.16, h]], 12, null, x, y, z));
  // the stone base it stands on, its foot bound with a bronze collar
  if (el.base !== false) bag.add('sandstone_dressed', lathe([[0.62, 0], [0.62, 0.32], [0.54, 0.4], [0.43, 0.42]], 16, null, x, y, z));
  bag.add('bronze', lathe([[0.41, 0.4], [0.45, 0.44], [0.45, 0.75], [0.41, 0.78]], 14, null, x, y, z));
  bag.add('gold', lathe([[0.17, 0], [0.22, 0.4], [0.05, 1.6]], 10, null, x, y + h, z));
  // two long pennants of linen streaming from below the gilded tip, red and white (§4.1)
  if (el.pennants !== false) [['cloth_red', 0.7, 5.6, 0], ['cloth_white', 1.5, 4.6, 1.3]].forEach(([mat, below, L, ph]) => {
    const T = [], N = 18, top = y + h - below, side = el.wind ?? 1, P = (t, e) => {
      const sl = t * L, wv = Math.sin(sl * 0.75 + ph) * 0.35 * t;
      return [x + side * (0.14 + sl * 0.93), top - sl * 0.32 - t * t * 0.8 - e * 0.5 * (1 - 0.55 * t), z + wv];
    };
    for (let i = 0; i < N; i++) {
      const a = P(i / N, 0), bb = P((i + 1) / N, 0), c = P((i + 1) / N, 1), d = P(i / N, 1);
      T.push(...a, ...d, ...c, ...a, ...c, ...bb, ...a, ...c, ...d, ...a, ...bb, ...c);
    }
    bag.add(mat, fromTriangles(T));
  });
  col.circle(x, z, 0.45, y, y + h);
}

/**
 * A smooth loft through rings of points (each ring the same count, going round the same way); the
 * ends closed with a fan to the ring's centre. Returns a non-indexed geometry with smooth normals.
 */
export function loft(rings, caps = [true, true]) {
  const n = rings[0].length, pos = [], idx = [];
  for (const r of rings) for (const p of r) pos.push(...p);
  const at = (i, j) => i * n + (j % n);
  for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < n; j++) idx.push(at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j), at(i + 1, j + 1), at(i, j + 1));
  for (const [k, end] of [[0, 0], [rings.length - 1, 1]]) {
    if (!caps[end]) continue;
    const c = [0, 1, 2].map((d) => rings[k].reduce((s, p) => s + p[d], 0) / n), ci = pos.length / 3;
    pos.push(...c);
    for (let j = 0; j < n; j++) end ? idx.push(ci, at(k, j + 1), at(k, j)) : idx.push(ci, at(k, j), at(k, j + 1));
  }
  // face outward whichever way the rings run: flip every triangle if the signed volume is negative
  let vol = 0;
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]].map((q) => pos.slice(q * 3, q * 3 + 3));
    vol += a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
  }
  if (vol < 0) for (let t = 0; t < idx.length; t += 3) { const q = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = q; }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g.toNonIndexed();
}
/** A ring round centre c in the plane of the unit axes u and v: half-widths a (along u) and b (along v); `shape(t)` scales the radius at angle t. */
export function ring(c, u, v, a, b, n = 20, shape = null) {
  const out = [];
  for (let j = 0; j < n; j++) {
    const t = j / n * Math.PI * 2, k = shape ? shape(t) : 1, ca = Math.cos(t) * a * k, sb = Math.sin(t) * b * k;
    out.push([c[0] + u[0] * ca + v[0] * sb, c[1] + u[1] * ca + v[1] * sb, c[2] + u[2] * ca + v[2] * sb]);
  }
  return out;
}
const X = [1, 0, 0], Y = [0, 1, 0], Z = [0, 0, 1];
/** Horizontal rings (in the x–z plane) for an upright body: rows of [y, cz, half-width, half-depth]. */
const upright = (rows, n = 24, shape) => rows.map(([y, cz, a, b, cx = 0]) => ring([cx, y, cz], X, [0, 0, -1], a, b, n, shape));
/** An ellipsoid: centre c, radii r = [rx, ry, rz]. */
function ellipsoid(c, r, n = 16) {
  const rows = [];
  for (let i = 1; i < 10; i++) { const p = -Math.PI / 2 + Math.PI * i / 10; rows.push([c[1] + Math.sin(p) * r[1], c[2], Math.cos(p) * r[0], Math.cos(p) * r[2], c[0]]); }
  return loft(upright(rows, n));
}

/**
 * Granite falcon of Horus wearing the double crown, on a plinth, as the pair before the pylon of
 * Edfu (Edfu dossier §4.1, removed, in git history): the bird upright and heavy-chested, the folded wings
 * wrapping the body and crossing over the tail, the tail falling straight to the plinth as the
 * statue's third support, short feathered legs and talons, the round head with the hooked beak, the
 * eye and the falcon's cheek stripe, the red crown with its tall back and curl and the white crown
 * rising out of it. Modelled at 3 m (crown included) facing −z.
 * el = { at, y, yaw, h (height of the bird without plinth), plinth: [w, d, h], mat }
 */
export function falcon(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const S = (el.h ?? 3.0) / 3.0;
  const mat = el.mat || 'granite_black';
  const [pw, pd, ph] = el.plinth ?? [1.6, 2.4, 0.9];
  const parts = [];
  // the plinth: a block with a plain moulded top
  parts.push(box(-pw / 2, 0, -pd / 2, pw / 2, ph - 0.08, pd / 2));
  parts.push(box(-pw / 2 - 0.04, ph - 0.08, -pd / 2 - 0.04, pw / 2 + 0.04, ph, pd / 2 + 0.04));
  const b = ph;                                   // the bird stands on the plinth's top
  // the body: deep-chested, the breast forward (−z), the back sloping into the tail
  parts.push(loft(upright([
    [b + 0.32, 0.12, 0.2, 0.22], [b + 0.42, 0.06, 0.33, 0.38], [b + 0.62, 0.0, 0.42, 0.48], [b + 0.88, -0.05, 0.46, 0.52],
    [b + 1.14, -0.07, 0.45, 0.5], [b + 1.38, -0.05, 0.39, 0.42], [b + 1.56, -0.03, 0.32, 0.35], [b + 1.7, -0.05, 0.27, 0.3], [b + 1.84, -0.06, 0.23, 0.27], [b + 1.94, -0.07, 0.21, 0.25],
  ], 28)));
  // the tail: a broad plate falling from the back to the plinth, its end squared
  parts.push(loft([[b + 0.95, 0.38, 0.2, 0.1], [b + 0.6, 0.6, 0.24, 0.11], [b + 0.25, 0.74, 0.26, 0.1], [b + 0.0, 0.8, 0.27, 0.09]]
    .map(([yy, zz, a, t]) => ring([0, yy, zz], X, [0, 0.35, 0.94], a, t, 16, (th) => 1 + 0.12 * Math.abs(Math.sin(2 * th))))));
  // the wings folded along the flanks: a long shell on each side from the shoulder to the tips,
  // which cross over the tail behind
  for (const s of [-1, 1]) {
    const rows = [[b + 1.58, -0.02, 0.06, 0.24], [b + 1.4, 0.02, 0.11, 0.36], [b + 1.12, 0.08, 0.13, 0.42], [b + 0.84, 0.16, 0.12, 0.42], [b + 0.58, 0.28, 0.1, 0.36], [b + 0.4, 0.44, 0.07, 0.26], [b + 0.28, 0.6, 0.045, 0.14]];
    const xs = [0.27, 0.37, 0.43, 0.43, 0.38, 0.27, 0.15];
    parts.push(loft(rows.map(([yy, zz, a, d], i) => ring([s * xs[i], yy, zz], X, [0, 0, -1], a, d, 16))));
  }
  // legs: short and feathered ("trousers"), the scaled shanks and three talons forward, one behind
  for (const s of [-1, 1]) {
    parts.push(loft(upright([[b + 0.02, -0.12, 0.07, 0.07, s * 0.2], [b + 0.18, -0.1, 0.08, 0.08, s * 0.2], [b + 0.3, -0.07, 0.15, 0.15, s * 0.21], [b + 0.46, -0.05, 0.2, 0.18, s * 0.2]], 12)));
    for (const a of [-0.35, 0, 0.35]) {
      const dx = Math.sin(a), dz = -Math.cos(a);
      parts.push(loft([0, 0.12, 0.24, 0.3].map((t, i) => ring([s * 0.2 + dx * t, b + 0.04 - (i === 3 ? 0.03 : 0), -0.12 + dz * t], [dz, 0, -dx], Y, 0.045 * (1 - i * 0.22), 0.04 * (1 - i * 0.2), 8))));
    }
    parts.push(loft([0, 0.12, 0.18].map((t, i) => ring([s * 0.2, b + 0.04, -0.1 + t], X, Y, 0.04 * (1 - i * 0.3), 0.035, 8))));
  }
  // the head: round, a little longer than it is wide; the eye with its ridge of brow; the cheek stripe
  const hy = b + 1.98;
  parts.push(ellipsoid([0, hy, -0.08], [0.24, 0.23, 0.29], 20));
  for (const s of [-1, 1]) {
    parts.push(ellipsoid([s * 0.2, hy + 0.03, -0.18], [0.05, 0.05, 0.05], 10));                      // the eye
    parts.push(loft([[0.16, 0.1, -0.08], [0.2, 0.08, -0.16], [0.215, 0.06, -0.24]].map(([xx, yy, zz]) => ring([s * xx, hy + yy, zz], [0, 0.5, -0.86], X, 0.05, 0.02, 8))));   // the brow
    parts.push(loft([[0.2, -0.02, -0.2], [0.215, -0.11, -0.18], [0.205, -0.2, -0.14]].map(([xx, yy, zz]) => ring([s * xx, hy + yy, zz], [0, 0, 1], X, 0.035, 0.02, 8))));   // the cheek (malar) stripe
  }
  // the hooked beak: the cere at its root, the upper mandible curving down to a point
  const beak = [[0, 0.0, -0.3, 0.1, 0.09], [0, -0.02, -0.38, 0.075, 0.075], [0, -0.06, -0.44, 0.05, 0.06], [0, -0.12, -0.47, 0.03, 0.04], [0, -0.18, -0.46, 0.01, 0.015]];
  parts.push(loft(beak.map(([xx, yy, zz, a, bb], i) => { const nx = i < 2 ? [0, 0, -1] : i < 4 ? [0, -0.6, -0.8] : [0, -1, 0]; const v = [0, nx[2], -nx[1]]; return ring([xx, hy + yy, zz], X, v, a, bb, 10); })));
  // the double crown: the red crown (deshret) a flat-topped cap with its tall back and the curl
  // standing out in front, the white crown (hedjet) a tall bulb rising inside it
  const cy = hy + 0.17;
  parts.push(loft(upright([[cy, -0.07, 0.25, 0.27], [cy + 0.06, -0.07, 0.26, 0.28], [cy + 0.3, -0.07, 0.28, 0.3]], 28), [true, true]));
  parts.push(loft([[cy + 0.28, 0.21], [cy + 0.55, 0.22], [cy + 0.8, 0.2]].map(([yy, zz]) => ring([0, yy, zz], X, [0, 0, -1], 0.24, 0.05, 16, (t) => 1 + 0.25 * Math.abs(Math.sin(t)) * 0))));
  const curl = [];
  for (let k = 0; k <= 10; k++) { const t = k / 10, a = t * 4.4, r = 0.13 * (1 - t * 0.7); curl.push([0, cy + 0.32 + 0.08 + Math.sin(a) * r * 0.9 + t * 0.12, -0.32 - 0.04 - Math.cos(a) * r * 0.6 + 0.04]); }
  parts.push(loft([[0, cy + 0.2, -0.3], [0, cy + 0.3, -0.33], ...curl].map((p, i, arr) => { const q = arr[Math.min(arr.length - 1, i + 1)], pp = arr[Math.max(0, i - 1)], d = [q[0] - pp[0], q[1] - pp[1], q[2] - pp[2]], L = Math.hypot(...d) || 1, v = [0, -d[2] / L, d[1] / L]; return ring(p, X, v, 0.018, 0.018, 6); })));
  parts.push(loft(upright([[cy + 0.28, -0.07, 0.2, 0.22], [cy + 0.45, -0.07, 0.21, 0.23], [cy + 0.62, -0.07, 0.18, 0.2], [cy + 0.76, -0.07, 0.12, 0.13], [cy + 0.82, -0.07, 0.09, 0.1], [cy + 0.85, -0.07, 0.1, 0.11], [cy + 0.88, -0.07, 0.04, 0.04]], 24)));
  const g = mergeLocal(parts);
  place(g, x, y, z, yaw, S);
  bag.add(mat, g);
  col.rect(rotRect([x, z], pw * S, pd * S, yaw), y, y + (ph + 3) * S);
}

/** The granite naos (shrine) of Nectanebo II: a monolith with a pyramidal roof, cornice and door. */
export function naos(el, { bag, col }) {
  // the naos of Nectanebo II in the sanctuary (Edfu dossier §4.3, removed, in git history): a monolith of dark granite on a stepped
  // plinth; the body bound at its corners and under the cornice by torus rolls; the cavetto cornice; a pyramidal top;
  // the deep door in the front under a frame of jambs and lintel carrying a winged disc, the jambs carved with columns
  // of text; on the sides registers of the king before the gods; bronze doors standing open; in the dark of the
  // shrine the gilded falcon of Horus
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const W = el.w ?? 1.55, D = el.d ?? 1.4, H = el.h ?? 4.0, mat = el.mat || 'granite_grey';
  const parts = [], carved = [], put = { add: (m, g) => carved.push(g) };
  const p0 = 0.16, p1 = 0.3, bodyH = H * 0.6, ct = p1 + bodyH, corH = 0.34, corP = 0.17, roofH = H - ct - corH;
  parts.push(box(-W / 2 - 0.2, 0, -D / 2 - 0.2, W / 2 + 0.2, p0, D / 2 + 0.2), box(-W / 2 - 0.1, p0, -D / 2 - 0.1, W / 2 + 0.1, p1, D / 2 + 0.1));
  // the body hollowed by the door recess on the front (−z)
  const dw = W * 0.5, dh = bodyH * 0.74, rd = 0.62;
  parts.push(box(-W / 2, p1, -D / 2 + rd, W / 2, ct, D / 2));
  parts.push(box(-W / 2, p1, -D / 2, -dw / 2, ct, -D / 2 + rd), box(dw / 2, p1, -D / 2, W / 2, ct, -D / 2 + rd));
  parts.push(box(-dw / 2, p1 + dh, -D / 2, dw / 2, ct, -D / 2 + rd));
  // the torus rolls: up the four corners and round under the cornice
  const tr = 0.045, C = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]];
  for (const [cx, cz] of C) parts.push(rod([cx, p1, cz], [cx, ct - tr, cz], tr, 8));
  for (let i = 0; i < 4; i++) { const [a0, b0] = C[i], [a1, b1] = C[(i + 1) % 4]; parts.push(rod([a0, ct - tr, b0], [a1, ct - tr, b1], tr, 8)); }
  // the cavetto cornice and the pyramid above it
  parts.push(sweep(cavettoProfile(corH, corP, 0.3), rectLoop([-W / 2, -D / 2, W / 2, D / 2]), ct, true));
  parts.push(box(-W / 2 + 0.3, ct, -D / 2 + 0.3, W / 2 - 0.3, ct + corH, D / 2 - 0.3));
  parts.push(frustum([-W / 2 - corP + 0.02, -D / 2 - corP + 0.02, W / 2 + corP - 0.02, D / 2 + corP - 0.02], ct + corH, ct + corH + roofH, W / 2 + corP - 0.03, W / 2 + corP - 0.03, D / 2 + corP - 0.03, D / 2 + corP - 0.03));
  // the door frame: jambs and lintel standing proud of the front, the lintel's winged disc, columns of text on the jambs
  const fw = 0.14, fp = 0.035, zf = -D / 2;
  parts.push(box(-dw / 2 - fw, p1, zf - fp, -dw / 2, p1 + dh + fw * 1.4, zf), box(dw / 2, p1, zf - fp, dw / 2 + fw, p1 + dh + fw * 1.4, zf));
  parts.push(box(-dw / 2 - fw - 0.006, p1 + dh, zf - fp - 0.006, dw / 2 + fw + 0.006, p1 + dh + fw * 1.8, zf));
  { const g = wingedDisc(dw + fw * 1.6, fw * 1.5, 0.012); g.rotateY(Math.PI); g.translate(0, p1 + dh + fw * 0.9, zf - fp - 0.006); parts.push(g); }
  const front = (u, v, d) => [u, v, zf - fp - d];
  for (const s of [-1, 1]) glyphColumn(put, mat, front, s * (dw / 2 + fw / 2), p1 + 0.1, p1 + dh - 0.05, fw * 0.62, 11 + s, 0.008, [-1, 1]);
  // the sides (±x) and the back: two registers of the king offering to a god, a column of text between them
  for (const s of [-1, 1]) {
    const side = (u, v, d) => [s * (W / 2 + d), v, u];
    for (let r = 0; r < 2; r++) {
      const v0 = p1 + 0.25 + r * (bodyH - 0.35) / 2, hh = (bodyH - 0.35) / 2 * 0.82;
      figure(put, mat, 'offer', side, -D * 0.22, v0, hh * 0.9, 1, 0.012);
      figure(put, mat, 'god', side, D * 0.24, v0, hh * 0.95, -1, 0.012);
      glyphColumn(put, mat, side, 0.01, v0 + hh * 0.55, v0 + hh, hh * 0.09, 20 + r + s * 3, 0.008, [-1, 1]);
      parts.push(box(s > 0 ? W / 2 : -W / 2 - 0.012, v0 - 0.03, -D / 2 + 0.08, s > 0 ? W / 2 + 0.012 : -W / 2, v0 - 0.012, D / 2 - 0.08));
    }
  }
  const g = mergeLocal([...parts, ...carved]);
  place(g, x, y, z, yaw);
  bag.add(mat, g);
  // inside: the back of the shrine in shadow; the bronze doors folded back against the reveals
  const inner = mergeLocal([box(-dw / 2 + 0.01, p1, -D / 2 + rd - 0.012, dw / 2 - 0.01, p1 + dh - 0.01, -D / 2 + rd)]);
  place(inner, x, y, z, yaw); bag.add('lacquer_black', inner);
  const d = mergeLocal([-1, 1].map((s) => box(s * dw / 2 - (s > 0 ? 0.04 : 0), p1 + 0.02, -D / 2 - 0.01, s * dw / 2 + (s < 0 ? 0.04 : 0), p1 + dh - 0.03, -D / 2 + rd * 0.8)));
  place(d, x, y, z, yaw); bag.add('bronze', d);
  // the falcon of Horus, gilded, in the shrine
  const fx = 0, fz = -D / 2 + rd - 0.3, c = Math.cos(yaw), sn = Math.sin(yaw);
  falcon({ at: [x + fx * c + fz * sn, z - fx * sn + fz * c], y: y + p1, yaw, h: Math.min(0.75, dh * 0.5), plinth: [0.24, 0.32, 0.12], mat: 'gold' }, { bag, col: { rect() {}, circle() {}, segment() {}, floor() {}, ramp() {} } });
  col.rect(rotRect([x, z], W + 0.4, D + 0.4, yaw), y, y + H);
}

/** Granite pedestal for the sacred barque. */
export function barqueStand(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const W = el.w ?? 1.3, D = el.d ?? 2.4, H = el.h ?? 1.05;
  const g = mergeLocal([
    box(-W / 2 - 0.1, 0, -D / 2 - 0.1, W / 2 + 0.1, 0.12, D / 2 + 0.1),
    box(-W / 2, 0.12, -D / 2, W / 2, H - 0.18, D / 2),
    box(-W / 2 - 0.08, H - 0.18, -D / 2 - 0.08, W / 2 + 0.08, H, D / 2 + 0.08),
  ]);
  place(g, x, y, z, yaw);
  bag.add(el.mat || 'granite_black', g);
  col.rect(rotRect([x, z], W + 0.2, D + 0.2, yaw), y, y + H);
}

/**
 * The portable barque of the god: a long, shallow gilded boat whose ends sweep up into posts
 * crowned by the aegis of Horus (a broad collar beneath a falcon head with a sun disc); the
 * veiled cabin-shrine amidships; long carrying poles with cross-bars (dossier §6.7).
 * Local axis: the boat lies along z; prow at -z.
 */
export function barque(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, L = el.l ?? 5.0;
  const gold = [], cedar = [], linen = [];
  const deck = 1.45;                                   // height of the deck above the poles' base
  // hull: half-elliptic sections along the length, the sheer rising steeply at the ends
  const NI = 36, NJ = 10, W = 0.46, D = 0.32;
  const ring = (t) => {
    const u = Math.abs(t);                              // 0 at the middle, 1 at the ends
    const w = W * Math.pow(Math.max(0, 1 - Math.pow(u, 2.6)), 0.55) + 0.04;
    const d = D * (1 - 0.7 * Math.pow(u, 2));
    const lift = 0.42 * Math.pow(u, 3);
    const pts = [];
    for (let j = 0; j <= NJ; j++) {
      const a = Math.PI * (j / NJ);                     // from one gunwale under the keel to the other
      pts.push([Math.cos(a) * w, deck + lift - Math.sin(a) * d, t * L / 2]);
    }
    return pts;
  };
  const rows = [];
  for (let i = 0; i <= NI; i++) rows.push(ring(-1 + 2 * i / NI));
  const t = [];
  for (let i = 0; i < NI; i++) {
    for (let j = 0; j < NJ; j++) quad(t, rows[i][j], rows[i + 1][j], rows[i + 1][j + 1], rows[i][j + 1]);
    // deck between the gunwales
    quad(t, rows[i][NJ], rows[i + 1][NJ], rows[i + 1][0], rows[i][0]);
  }
  gold.push(fromTriangles(t));
  // aegis on a post at prow and stern
  for (const s of [-1, 1]) {
    const zz = s * L / 2, yy = deck + 0.42;
    gold.push(box(-0.05, yy - 0.35, zz - 0.05, 0.05, yy + 0.05, zz + 0.05));
    // the collar: a thick rounded shield facing outward, the falcon head above it, the sun disc on the head
    const shield = lathe([[0.0, -0.04], [0.22, -0.035], [0.25, 0.0], [0.22, 0.035], [0.0, 0.05]], 20);
    shield.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
    gold.push(place(shield, 0, yy + 0.12, zz + s * 0.04));
    gold.push(lathe([[0.0, 0], [0.09, 0.03], [0.11, 0.12], [0.08, 0.22], [0.0, 0.25]], 12, null, 0, yy + 0.3, zz));
    const sun = lathe([[0.0, -0.015], [0.1, -0.015], [0.1, 0.015], [0.0, 0.015]], 16);
    sun.applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2));
    gold.push(place(sun, 0, yy + 0.64, zz));
  }
  // cabin-shrine amidships: a gilded naos with cornice, draped in linen on the sides
  gold.push(box(-0.36, deck, -0.55, 0.36, deck + 0.9, 0.55));
  gold.push(frustum([-0.36, -0.55, 0.36, 0.55], deck + 0.9, deck + 1.05, -0.08, -0.08, -0.08, -0.08));
  linen.push(box(-0.4, deck + 0.05, -0.5, 0.4, deck + 0.8, 0.5));
  // small kneeling figures (the king) fore and aft of the shrine
  for (const s of [-1, 1]) gold.push(lathe([[0.1, 0], [0.11, 0.2], [0.07, 0.32], [0.06, 0.38], [0, 0.42]], 10, null, 0, deck, s * 0.8));
  // carrying poles along the length and three cross-bars beneath the hull
  for (const sx of [-0.62, 0.62]) cedar.push(box(sx - 0.05, 1.0, -L * 0.64, sx + 0.05, 1.1, L * 0.64));
  for (const sz of [-1.25, 0, 1.25]) cedar.push(box(-0.72, 1.1, sz - 0.05, 0.72, 1.2, sz + 0.05));
  for (const [list, mat] of [[gold, 'gold'], [cedar, 'cedar'], [linen, 'linen']]) {
    const g = mergeLocal(list);
    place(g, x, y, z, yaw);
    bag.add(mat, g);
  }
  col.rect(rotRect([x, z], 1.5, L * 1.3, yaw), y + 1.0, y + deck + 1.6);
}

/** Stone altar with torus and cornice. */
export function altar(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const W = el.w ?? 2.0, D = el.d ?? 1.4, H = el.h ?? 1.1;
  const g = mergeLocal([
    box(-W / 2, 0, -D / 2, W / 2, H - 0.25, D / 2),
    frustum([-W / 2, -D / 2, W / 2, D / 2], H - 0.25, H, -0.12, -0.12, -0.12, -0.12),
  ]);
  place(g, x, y, z, yaw);
  bag.add(el.mat || 'sandstone_dressed', g);
  col.rect(rotRect([x, z], W, D, yaw), y, y + H);
}

/** A pair of cedar door leaves standing open against the reveals of a doorway. */
export function doorLeaves(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0;
  const W = el.w, H = el.h, T = el.th ?? 0.18, depth = el.depth ?? 0.2;
  const leaf = W / 2;
  const cedar = [], bronze = [];
  for (const s of [-1, 1]) {
    // hinged at the jamb (x = s*W/2), swung 90° inward to lie along the reveal
    cedar.push(box(s * W / 2 - (s > 0 ? T : 0), 0, depth, s * W / 2 + (s < 0 ? T : 0), H, depth + leaf));
    for (let k = 0; k < 5; k++) {
      const yy = 0.25 + k * (H - 0.5) / 4;
      bronze.push(box(s * W / 2 - (s > 0 ? T + 0.03 : -T), yy - 0.06, depth + 0.05, s * W / 2 - (s > 0 ? T : -T - 0.03), yy + 0.06, depth + leaf - 0.05));
    }
  }
  for (const [list, mat] of [[cedar, 'cedar'], [bronze, 'bronze']]) {
    const g = mergeLocal(list);
    place(g, x, y, z, yaw);
    bag.add(mat, g);
  }
  // each open leaf is a thin obstacle along its reveal
  const c = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw));
  for (const s of [-1, 1]) {
    const lx0 = s * W / 2 - (s > 0 ? T : 0), lx1 = s * W / 2 + (s < 0 ? T : 0);
    const pts = [[lx0, depth], [lx1, depth + leaf]].map(([u, v]) => [x + c * u + sn * v, z - sn * u + c * v]);
    col.rect([Math.min(pts[0][0], pts[1][0]), Math.min(pts[0][1], pts[1][1]), Math.max(pts[0][0], pts[1][0]), Math.max(pts[0][1], pts[1][1])], y, y + H);
  }
}

/** Date palm: a ringed, slightly leaning trunk and a crown of arching pinnate fronds. */
export function palm(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  const r = rnd(el.seed ?? 7);
  const h = el.h ?? 10, lean = el.lean ?? 0, yaw = r() * Math.PI * 2;
  const prof = [];
  const n = Math.round(h / 0.32);
  for (let i = 0; i <= n; i++) {
    const t = i / n, rr = 0.26 - 0.06 * t + (i % 2 ? 0.025 : 0);
    prof.push([i === 0 ? 0.36 : rr, t * h]);
  }
  const trunk = lathe(prof, 9);
  // lean: shear x by height
  const pos = trunk.attributes.position;
  for (let i = 0; i < pos.count; i++) { const yy = pos.getY(i); pos.setX(i, pos.getX(i) + lean * yy * yy / h); }
  place(trunk, x, y, z, yaw);
  bag.add('palm_trunk', trunk);
  const top = [x + Math.cos(-yaw) * lean * h, y + h, z + Math.sin(-yaw) * lean * h];
  const live = [], dead = [];
  const nf = 26;
  for (let f = 0; f < nf; f++) {
    const az = (f / nf) * Math.PI * 2 * 2.618 + r() * 0.4;     // phyllotaxis-like spiral
    const age = f / nf;                                         // older fronds lower and drooping
    const isDead = age > 0.86;
    const up = isDead ? -1.25 + r() * 0.2 : 1.15 - age * 1.5 + r() * 0.15;
    const len = (isDead ? 2.6 : 3.2) + r() * 1.1;
    const pts = [];
    const K = 12;
    for (let k = 0; k <= K; k++) {
      const t = k / K, d = t * len;
      const yy = Math.sin(up) * d - (isDead ? 0.05 : 0.5) * d * d / len;
      pts.push([top[0] + Math.cos(az) * Math.cos(up) * d, top[1] - 0.15 + yy, top[2] + Math.sin(az) * Math.cos(up) * d]);
    }
    const sx = -Math.sin(az), sz = Math.cos(az);
    const out = isDead ? dead : live;
    // rachis
    for (let k = 0; k < K; k++) {
      const p = pts[k], q = pts[k + 1];
      out.push(p[0] + sx * 0.02, p[1], p[2] + sz * 0.02, q[0], q[1], q[2], p[0] - sx * 0.02, p[1], p[2] - sz * 0.02);
    }
    // leaflets: narrow blades along both sides, angled forward and folded up into a V
    const nl = isDead ? 14 : 28;
    for (let l = 2; l < nl; l++) {
      const t = l / nl, kf = t * K, k0 = Math.min(K - 1, Math.floor(kf)), fr = kf - k0;
      const p = [0, 1, 2].map((c) => pts[k0][c] * (1 - fr) + pts[k0 + 1][c] * fr);
      const q = pts[Math.min(K, k0 + 2)];
      const fx = q[0] - p[0], fy = q[1] - p[1], fz = q[2] - p[2], fl = Math.hypot(fx, fy, fz) || 1;
      const ll = (0.25 + 0.55 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * (isDead ? 0.7 : 1);
      for (const side of [-1, 1]) {
        const jitter = (r() - 0.5) * 0.25;
        const tip = [p[0] + side * sx * ll + fx / fl * ll * 0.55, p[1] + ll * (0.22 + jitter) * (isDead ? -1 : 1) + fy / fl * ll * 0.55, p[2] + side * sz * ll + fz / fl * ll * 0.55];
        const b2 = [p[0] + fx / fl * 0.07, p[1] + fy / fl * 0.07, p[2] + fz / fl * 0.07];
        out.push(...p, ...b2, ...tip);
      }
    }
  }
  bag.add('palm_leaf', fromTriangles(live));
  if (dead.length) bag.add('palm_trunk', fromTriangles(dead));
  // a few date clusters under the crown
  if (r() < 0.6) for (let c = 0; c < 3; c++) {
    const a = r() * Math.PI * 2;
    bag.add('palm_trunk', lathe([[0.0, 0], [0.18, 0.15], [0.16, 0.45], [0.0, 0.6]], 6, null, top[0] + Math.cos(a) * 0.45, top[1] - 1.0, top[2] + Math.sin(a) * 0.45));
  }
  col.circle(x, z, 0.4, y, y + h);
}

function mergeLocal(list) {
  list = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o);
    o += g.attributes.position.array.length;
  }
  const out = new BufferGeometry();
  out.setAttribute('position', new Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return out;
}

/** Axis-aligned footprint of a w×d rectangle centred at c, turned by yaw (rounded to 90°). */
function rotRect([x, z], w, d, yaw) {
  const q = Math.round(yaw / (Math.PI / 2)) % 2 !== 0;
  const hw = (q ? d : w) / 2, hd = (q ? w : d) / 2;
  return [x - hw, z - hd, x + hw, z + hd];
}

export { quad };

/** A winged sun disc in relief on a wall face; yaw turns its face (0 = facing +z). */
export function wingedDiscObj(el, { bag }) {
  // carved deeper than the door frames' small discs and in the relief stone, so that it reads from the forecourt
  const g = wingedDisc(el.w, el.h, el.depth ?? 0.16);
  place(g, el.at[0], el.y, el.at[1], el.yaw ?? 0);
  bag.add(el.mat || 'sandstone_relief', g);
}

/**
 * The reliefs of a temple gateway's face (Edfu dossier §4.1, removed, in git history) { z (the face), face ('zp' faces +z, 'zn'
 * −z), x0, x1 (the face between its corner rolls), door: [xa, xb], doorTop, from (the lintel's carved field begins
 * above the winged disc), top (under the torus), y }: on the lintel, registers of the king offering to the gods, the
 * scenes mirrored about the axis so that the king walks in toward it; on each jamb a stack of scenes of the king
 * before a standing god, the king facing the doorway; each scene with its columns of text, on ruled ground lines.
 */
export function gateReliefs(el, { bag }) {
  const y = el.y ?? 0, sg = el.face === 'zn' ? -1 : 1, R = el.mat || 'sandstone_relief';
  const place = (u, v, d) => [u, y + v, el.z + sg * (0.01 + d)];
  const placeN = (u, v, d) => [u, y + v, el.z + sg * (0.01 + d)];
  let seed = Math.round(el.z * 31 + 7);
  const line = (a, c, v) => { const p = place(a, v, 0), q = place(c, v - 0.1, 0.06); bag.add(R, box(Math.min(p[0], q[0]), q[1], Math.min(p[2], q[2]), Math.max(p[0], q[0]), p[1], Math.max(p[2], q[2]))); };
  // the lintel: registers from `from` to `top`, scenes in pairs either side of the axis
  const [xa, xb] = el.door, mid = (xa + xb) / 2, nr = Math.max(1, Math.round((el.top - el.from) / 2.5)), rh = (el.top - el.from) / nr;
  for (let j = 0; j < nr; j++) {
    const vy = el.from + j * rh, hh = rh * 0.84, half = (el.x1 - el.x0) / 2, n = Math.max(1, Math.floor(half / (hh * 1.25))), sw = half / n;
    line(el.x0 + 0.1, el.x1 - 0.1, vy);
    for (const side of [-1, 1]) for (let i = 0; i < n; i++) {
      // from the axis outward: the god sits nearer the axis, the king comes toward him from the outside
      const s0 = mid + side * i * sw, s1 = mid + side * (i + 1) * sw, g = s0 + (s1 - s0) * 0.3, k = s0 + (s1 - s0) * 0.72;
      figure(bag, R, 'seated', placeN, g, vy, hh * 0.85, side, 0.1);
      figure(bag, R, 'offer', placeN, k, vy, hh * 0.9, -side, 0.1);
      for (const dk of [-0.5, 0.5]) glyphColumn(bag, R, placeN, (g + k) / 2 + dk * hh * 0.1, vy + hh * 0.6, vy + hh * 0.98, hh * 0.09, seed++, 0.07, dk > 0 ? [-1, 1] : [-1]);
    }
  }
  line(el.x0 + 0.1, el.x1 - 0.1, el.top - 0.05);
  // the jambs: scenes stacked from the foot to the lintel
  for (const [a, c] of [[el.x0 + 0.15, xa - 0.3], [xb + 0.3, el.x1 - 0.15]]) {
    const w = c - a; if (w < 1.5) continue;
    const toDoor = (a + c) / 2 < mid ? 1 : -1, v0 = 1.2, n = Math.max(1, Math.round((el.doorTop - v0) / (w * 0.75))), rh2 = (el.doorTop - v0) / n;
    for (let j = 0; j < n; j++) {
      const vy = v0 + j * rh2, hh = Math.min(rh2 * 0.86, w * 0.62);
      line(a, c, vy);
      const king = toDoor > 0 ? a + w * 0.3 : c - w * 0.3, god = toDoor > 0 ? c - w * 0.25 : a + w * 0.25;
      figure(bag, R, 'offer', placeN, king, vy, hh * 0.9, toDoor, 0.08);
      figure(bag, R, 'god', placeN, god, vy, hh * 0.92, -toDoor, 0.08);
      glyphColumn(bag, R, placeN, (king + god) / 2, vy + hh * 0.6, vy + hh * 0.98, hh * 0.08, seed++, 0.06, [-1, 1]);
    }
    line(a, c, el.doorTop - 0.05);
  }
  void place;
}

/**
 * The painted ceiling of a hypostyle hall (Edfu dossier §4.4, removed, in git history) { y (the soffit), bays: [[x0, z0, x1, z1,
 * kind]], holes: [[x0, z0, x1, z1]] (light slits to keep clear) }: each bay between the architraves the night sky —
 * blue sown with stars — and on it, in the central aisle ('vultures'), vultures with spread wings alternating with
 * winged discs, flying in toward the sanctuary; in the side aisles ('sky') the sky goddess Nut stretched the length of
 * the bay, the sun at her mouth and at her womb, and beside her the gods of the stars standing in their boats.
 */
export function astroCeiling(el, { bag }) {
  const Y = el.y, holes = el.holes ?? [];
  const parts = {}, put = (m, g) => (parts[m] ??= []).push(g);
  // seen only from below: one face each way, counter-clockwise in (u, v) facing down, the sides outward
  const prism = (m, poly, place, d) => {
    let ar = 0; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; ar += a[0] * b[1] - b[0] * a[1]; }
    if (ar < 0) poly = poly.slice().reverse();
    const T = [], tri = earClip(poly);
    for (const [a, b, c] of tri) T.push(...place(...poly[a], d), ...place(...poly[b], d), ...place(...poly[c], d));
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], q = [place(...a, 0), place(...b, 0), place(...b, d), place(...a, d)]; T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]); }
    put(m, fromTriangles(T));
  };
  const star = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
  for (const [x0, z0, x1, z1, kind] of el.bays) {
    put('vault_stars', box(x0, Y - 0.02, z0, x1, Y, z1));
    const W = x1 - x0, L = z1 - z0, cx = (x0 + x1) / 2;
    // u runs along the bay toward the sanctuary (−z), v across it (+x); d down from the painted soffit
    const place = (u, v, d) => [x0 + v, Y - 0.02 - d, z1 - u];
    const clear = (u0, u1) => !holes.some((h) => z1 - u0 > h[1] - 0.3 && z1 - u1 < h[3] + 0.3 && x1 > h[0] && x0 < h[2]);
    if (kind === 'vultures') {
      const step = Math.min(3.2, W * 0.95);
      for (let k = 0, u = step / 2; u < L - step / 2 + 0.01; u += step, k++) {
        if (!clear(u - step * 0.42, u + step * 0.42)) continue;
        const s = W * 0.92;
        if (k % 2) {                                                   // the winged disc, its wings across the aisle
          const g = wingedDisc(s, s * 0.3, 0.02);
          g.applyMatrix4(new Matrix4().makeRotationY(Math.PI).multiply(new Matrix4().makeRotationX(Math.PI / 2))); g.translate(cx, Y - 0.02, z1 - u);   // the wings' leading edge toward the sanctuary
          put('paint_ochre', g);
          continue;
        }
        // the vulture seen from below: the wings spread across the aisle in their tiers of feathers, the head toward the
        // sanctuary, the tail fanned behind, a shen ring in each foot
        const vc = W / 2, g = wingedDisc(s, s * 0.34, 0.02);
        g.applyMatrix4(new Matrix4().makeRotationY(Math.PI).multiply(new Matrix4().makeRotationX(Math.PI / 2))); g.translate(cx, Y - 0.02, z1 - u);   // the wings' leading edge toward the sanctuary
        put('fresco_green', g);
        prism('plaster_white', [[u + 0.1 * s, vc - 0.07 * s], [u + 0.13 * s, vc], [u + 0.1 * s, vc + 0.07 * s], [u - 0.12 * s, vc + 0.1 * s], [u - 0.2 * s, vc + 0.08 * s], [u - 0.2 * s, vc - 0.08 * s], [u - 0.12 * s, vc - 0.1 * s]], place, 0.05);   // the body
        prism('egyptian_blue', [[u - 0.19 * s, vc - 0.07 * s], [u - 0.19 * s, vc + 0.07 * s], [u - 0.36 * s, vc + 0.13 * s], [u - 0.38 * s, vc], [u - 0.36 * s, vc - 0.13 * s]], place, 0.045);   // the tail
        prism('paint_ochre', [[u + 0.12 * s, vc - 0.03 * s], [u + 0.12 * s, vc + 0.03 * s], [u + 0.22 * s, vc + 0.03 * s], [u + 0.27 * s, vc + 0.01 * s], [u + 0.25 * s, vc - 0.02 * s], [u + 0.22 * s, vc - 0.03 * s]], place, 0.055);   // the neck and head
        for (const sg of [-1, 1]) prism('limewash_red', circ(u - 0.14 * s, vc + sg * 0.14 * s, 0.035 * s, 0.035 * s, 10), place, 0.06);   // the shen rings
      }
    } else {
      // Nut stretched along the bay at its outer side: her feet at the entrance end, her arms toward the sanctuary
      const v0 = W * 0.2, bw = Math.min(0.55, W * 0.14), u0 = 0.5, u1 = L - 0.5;
      prism('paint_ochre', [[u0, v0 - bw * 0.5], [u0 + 0.35, v0 - bw * 0.5], [u0 + 0.35, v0 - bw * 0.15], [u0 + L * 0.32, v0 - bw * 0.45], [u1 - 1.1, v0 - bw * 0.5], [u1 - 0.7, v0 - bw * 0.35], [u1 - 0.7, v0 + bw * 0.35], [u1 - 1.1, v0 + bw * 0.5], [u0 + L * 0.32, v0 + bw * 0.45], [u0 + 0.35, v0 + bw * 0.15], [u0 + 0.35, v0 + bw * 0.5], [u0, v0 + bw * 0.5]], place, 0.02);
      prism('paint_ochre', circ(u1 - 0.45, v0, 0.26, 0.2, 12), place, 0.02);                                        // her head
      prism('lacquer_black', circ(u1 - 0.42, v0, 0.24, 0.24, 12).map(([a, b]) => [a + 0.06, b]), place, 0.024);    // her hair
      for (const sg of [-1, 1]) prism('paint_ochre', [[u1 - 0.75, v0 + sg * bw * 0.3], [u1 - 0.7, v0 + sg * bw * 0.45], [u1 + 0.05, v0 + sg * bw * 0.65], [u1 + 0.05, v0 + sg * bw * 0.45]], place, 0.022);   // her arms
      prism('limewash_red', circ(u1 + 0.25, v0, 0.2, 0.2, 14), place, 0.026);                                       // the evening sun at her mouth
      prism('limewash_red', circ(u0 + L * 0.3, v0 + bw * 0.95, 0.24, 0.24, 14), place, 0.026);                     // the sun reborn at her womb
      // the star gods in their boats, in a row along the bay
      const vb = v0 + bw + (W - v0 - bw) * 0.35, n = Math.max(1, Math.floor((L - 1) / 1.6)), sp = (L - 1) / n;
      for (let k = 0; k < n; k++) {
        const u = 0.5 + sp * (k + 0.5), bl = Math.min(1.2, sp * 0.8);
        if (!clear(u - bl / 2, u + bl / 2)) continue;
        prism('paint_ochre', [[u - bl / 2, vb + 0.12], [u - bl * 0.35, vb], [u + bl * 0.35, vb], [u + bl / 2, vb + 0.12], [u + bl * 0.3, vb + 0.06], [u - bl * 0.3, vb + 0.06]], place, 0.02);   // the boat
        { const gh = Math.min(0.9, (W - vb) * 0.7); FIG.god.forEach((poly, j) => prism('plaster_white', poly.map(([a, b]) => [u + a * gh * 1.15, vb + 0.06 + b * gh]), place, 0.02 + 0.002 * (j % 4))); }
        prism('limewash_yellow', star(u + 0.28, vb + Math.min(0.9, (W - vb) * 0.7) * 0.8, 0.09), place, 0.024);
      }
    }
  }
  for (const [m, list] of Object.entries(parts)) bag.add(m, mergeLocal(list));
}

/**
 * Painted relief (Edfu dossier §10, removed, in git history): a figure of FIG whose parts each take their own colour — the
 * skin red-brown, the crowns blue, red and white, the sceptres and offerings yellow or gold — with the white kilt
 * and the broad collar painted over the body a little prouder.
 */
const PAINT = {
  offer: (body) => [body, 'egyptian_blue', body, 'gold'],
  god: (body) => [body, 'limewash_red', 'plaster_white', body, 'paint_ochre', 'paint_ochre', 'paint_ochre', 'paint_ochre', 'paint_ochre', 'paint_ochre'],
  seated: (body) => [body, body, 'paint_ochre', 'paint_ochre', 'paint_ochre'],
};
const KILT = [[-0.07, 0.31], [0.1, 0.31], [0.078, 0.465], [-0.062, 0.465]], COLLAR = [[-0.06, 0.605], [0.068, 0.605], [0.07, 0.65], [-0.058, 0.66]];
function paintedFigure(bag, kind, body, place, u0, v0, h, dir, d) {
  const mats = PAINT[kind](body), parts = {};
  const add = (m, P, dd) => {
    const T = parts[m] ??= [], tri = CUTS.get(P) ?? (CUTS.set(P, earClip(P)), CUTS.get(P)), V = ([u, v], w) => place(u0 + dir * u * h * 1.15, v0 + v * h, w);
    for (const [a, b, c] of tri) T.push(...V(P[a], dd), ...V(P[b], dd), ...V(P[c], dd), ...V(P[a], dd), ...V(P[c], dd), ...V(P[b], dd));
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], q = [V(a, 0), V(b, 0), V(b, dd), V(a, dd)]; T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3], ...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]); }
  };
  FIG[kind].forEach((P, k) => add(mats[k] ?? body, P, d * (0.82 + 0.06 * (k % 4))));
  if (kind !== 'seated') { add('plaster_white', KILT, d * 1.08); add(kind === 'god' ? 'fresco_green' : 'egyptian_blue', COLLAR, d * 1.08); }
  for (const [m, T] of Object.entries(parts)) bag.add(m, fromTriangles(T));
}
/**
 * wall_reliefs: the painted reliefs of a wall face inside the temple (Edfu dossier §10, removed, in git history) { a, b (the face's
 * ends in plan), n (its normal into the room), y (the floor), v0 (the first register's ground line above the floor),
 * top, reg (register height), inward (+1 if the sanctuary lies toward b), gods ('gold' or 'paint'), gaps: [[u0, u1]]
 * (doorways, from a) }: under a band of sky and a frieze of khekher knots, registers of scenes — the king, in the blue
 * crown, his kilt white, coming in toward the sanctuary with his offering before a falcon-headed god in the double
 * crown or a god enthroned — each with its columns of text painted blue, on blue ground lines; a dado frieze of
 * coloured blocks under the lowest register.
 */
export function wallReliefs(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), U = [(bx - ax) / L, (bz - az) / L], N = el.n, y = el.y ?? 0;
  const place = (u, v, d) => [ax + U[0] * u + N[0] * (0.012 + d), y + v, az + U[1] * u + N[1] * (0.012 + d)];
  const gaps = el.gaps ?? [], free = (u0, u1) => u0 > 0.1 && u1 < L - 0.1 && !gaps.some(([g0, g1]) => u1 > g0 - 0.2 && u0 < g1 + 0.2);
  const band = (m, u0, u1, v0, v1, d) => { const p = place(u0, v0, 0), q = place(u1, v1, d); bag.add(m, box(Math.min(p[0], q[0]), p[1], Math.min(p[2], q[2]), Math.max(p[0], q[0]), q[1], Math.max(p[2], q[2]))); };
  const runs = (fn) => { let u = 0.15; for (const [g0, g1] of [...gaps, [L - 0.15, L]]) { if (g0 - u > 0.4) fn(u, g0 - 0.05); u = g1 + 0.05; } };
  const reg = el.reg ?? 2.2, n = Math.max(1, Math.floor((el.top - el.v0) / reg)), dir = el.inward ?? 1, body = 'paint_robe', godBody = el.gods === 'gold' ? 'gold' : 'paint_robe';
  let seed = Math.round(ax * 13 + az * 7);
  // the dado frieze of coloured blocks and its ground line
  runs((u0, u1) => { band('egyptian_blue', u0, u1, el.v0 - 0.06, el.v0, 0.02); for (let u = u0, k = 0; u < u1 - 0.2; u += 0.25, k++) band(['limewash_red', 'egyptian_blue', 'fresco_green', 'paint_ochre'][k % 4], u + 0.02, u + 0.21, el.v0 - 0.42, el.v0 - 0.14, 0.015); });
  for (let j = 0; j < n; j++) {
    const vy = el.v0 + j * reg, hh = reg * 0.82, sw = hh * 1.15;
    if (j) runs((u0, u1) => band('egyptian_blue', u0, u1, vy - 0.06, vy, 0.02));
    // scenes along the register: the king toward the sanctuary, the god facing him
    runs((u0, u1) => {
      const k = Math.max(1, Math.floor((u1 - u0) / sw)), w = (u1 - u0) / k;
      for (let i = 0; i < k; i++) {
        const s0 = u0 + i * w, s1 = s0 + w; if (!free(s0, s1)) continue;
        const king = dir > 0 ? s0 + w * 0.3 : s1 - w * 0.3, god = dir > 0 ? s1 - w * 0.28 : s0 + w * 0.28, gk = (i * 2 + j) % 3 === 0 ? 'seated' : 'god';
        paintedFigure(bag, 'offer', body, place, king, vy, hh * 0.9, dir, 0.05);
        paintedFigure(bag, gk, godBody, place, god, vy, hh * (gk === 'seated' ? 0.85 : 0.94), -dir, 0.05);
        glyphColumn(bag, 'egyptian_blue', place, (king + god) / 2 - hh * 0.05, vy + hh * 0.55, vy + hh * 0.98, hh * 0.085, seed++, 0.035, [-1, 1]);
        glyphColumn(bag, 'egyptian_blue', place, (king + god) / 2 + hh * 0.05, vy + hh * 0.55, vy + hh * 0.98, hh * 0.085, seed++, 0.035, [1]);
      }
    });
  }
  // the band of sky over the registers and the khekher frieze above it
  const vt = el.v0 + n * reg;
  runs((u0, u1) => { band('egyptian_blue', u0, u1, vt - 0.06, vt + 0.1, 0.022); for (let u = u0 + 0.1; u < u1 - 0.12; u += 0.24) { band('paint_ochre', u - 0.05, u + 0.05, vt + 0.14, vt + 0.46, 0.02); band('fresco_green', u - 0.035, u + 0.035, vt + 0.46, vt + 0.52, 0.026); } });
}
/**
 * offering_table: before the god's shrine (Edfu dossier §10, removed, in git history) { at, y, yaw }: a round table of stone on its
 * pedestal heaped with round loaves, a haunch, figs, lotus flowers laid over, two jars of wine and water beside it;
 * a tall bronze incense stand with a burning pan.
 */
export function offeringTable(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw), W = (u, v) => [x + c * u - s * v, z + s * u + c * v];
  bag.add('granite_black', lathe([[0.22, 0], [0.22, 0.06], [0.12, 0.1], [0.1, 0.78], [0.38, 0.84], [0.4, 0.9], [0.001, 0.9]], 16, null, x, y, z));
  for (const [u, v, r] of [[-0.18, -0.1, 0.1], [0.12, -0.14, 0.09], [0.0, 0.14, 0.1], [0.2, 0.12, 0.08], [-0.2, 0.15, 0.08]]) { const [px, pz] = W(u, v); bag.add('limewash_yellow', lathe([[0.001, 0], [r, 0.01], [r * 0.95, 0.05], [r * 0.5, 0.08], [0.001, 0.085]], 9, null, px, y + 0.9, pz)); }
  { const [px, pz] = W(0, -0.02); bag.add('limewash_red', lathe([[0.001, 0], [0.08, 0.02], [0.07, 0.18], [0.03, 0.26], [0.001, 0.27]], 8).rotateZ(Math.PI / 2.4).translate(px, y + 1.02, pz)); }
  for (const [u, v] of [[0.06, 0.02], [-0.08, 0.04], [0.02, -0.12]]) { const [px, pz] = W(u, v); bag.add('fresco_green', lathe([[0.001, 0], [0.05, 0.03], [0.07, 0.09], [0.06, 0.1], [0.04, 0.05], [0.001, 0.04]], 8, null, px, y + 0.97, pz)); }
  for (const u of [-0.55, 0.55]) { const [px, pz] = W(u, 0.1); bag.add('terracotta', lathe([[0.001, 0], [0.08, 0.02], [0.16, 0.25], [0.15, 0.42], [0.07, 0.55], [0.08, 0.6], [0.001, 0.6]], 10, null, px, y, pz)); }
  const [ix, iz] = W(0.75, -0.3);
  bag.add('bronze', lathe([[0.14, 0], [0.14, 0.03], [0.03, 0.06], [0.025, 1.15], [0.12, 1.22], [0.13, 1.28], [0.1, 1.27], [0.001, 1.25]], 10, null, ix, y, iz));
  bag.add('pottery_dark', lathe([[0.09, 0], [0.09, 0.02], [0.001, 0.025]], 8, null, ix, y + 1.255, iz));
  col.circle(x, z, 0.42, y, y + 1.0); col.circle(ix, iz, 0.15, y, y + 1.3);
}
