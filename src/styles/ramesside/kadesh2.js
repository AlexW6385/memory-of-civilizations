// The Battle of Kadesh on the north wall of the first hall as one continuous painted relief (docs/settlements/abu-simbel.md §17): every figure a
// rounded volume rising 2–8 cm out of a plastered ground, its limbs half-round bars, its bodies domes, one overlapping the next as the carvers
// layered them. The Egyptian camp in its wall of shields, the king's chariot at the charge drawing the bow, the Egyptian and the Hittite chariots in
// ranks, the Orontes, the fortress of Kadesh with its defenders. Composed in the manner of the sources, not copied from any reproduction.
// The wall's own frame: a along the wall deeper into the rock, v up, w out of the wall; the figures face +a.

import { Kit } from './fig.js';
import { Sculpt, tube, blob, torus } from '../nabataean/sculpt.js';

const R = 'sandstone_relief', SK = 'paint_robe', WH = 'plaster_white', OC = 'paint_ochre', BL = 'egyptian_blue', RD = 'limewash_red', BK = 'paint_minoan_black', GD = 'gold';
const hh = (a, b) => { let h = Math.imul(Math.round(a * 997) | 0, 374761393) ^ Math.imul(Math.round(b * 991) | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** A rounded bar through points [a, v, half-width] (in the wall's plane), `d` high out of the surface at layer w0. */
function bar(S, P, d, w0 = 0, o = {}) { tube(S, P.map(([a, v, r]) => [a, v, w0, d, r]), { seg: o.seg ?? 6, sub: o.sub ?? 1, ref: [0, 0, 1], capN: 1, cap: o.cap ?? [1, 1] }); }
const dome = (S, c, rx, ry, d, w0 = 0, nl = 3, nn = 8) => blob(S, [c[0], c[1], w0], [rx, ry, d], nl, nn);

/** A horse in profile facing +a, its body `s` long, hooves at (a, v): pose 'rear' (the fore legs raised, plumes and cloth) or 'gallop'. `lay` the layer (a team: the far horse lies behind). */
function horse(K, a, v, s, d, pose, lay, coat, cloth) {
  const S = K.s(coat), P = (x, y, r) => [a + x * s, v + y * s, r * s], D = d * s, w = lay;
  const legs = pose === 'rear'
    ? [[[0.08, 0.78, 0.12], [0.22, 0.52, 0.08], [0.04, 0.3, 0.045], [0.1, 0.08, 0.032], [0.15, 0.0, 0.04]], [[0.22, 0.78, 0.1], [0.36, 0.5, 0.07], [0.2, 0.3, 0.04], [0.26, 0.08, 0.03], [0.31, 0.0, 0.038]],
       [[0.78, 1.0, 0.09], [0.9, 0.84, 0.06], [1.14, 0.92, 0.045], [1.26, 0.78, 0.034]], [[0.74, 1.0, 0.08], [0.84, 0.8, 0.055], [1.04, 0.8, 0.04], [1.12, 0.62, 0.032]]]
    : [[[0.08, 0.8, 0.12], [-0.12, 0.55, 0.07], [-0.35, 0.5, 0.04], [-0.55, 0.48, 0.033]], [[0.2, 0.8, 0.1], [0.0, 0.52, 0.065], [-0.2, 0.44, 0.04], [-0.4, 0.4, 0.03]],
       [[0.8, 0.8, 0.09], [1.0, 0.55, 0.06], [1.2, 0.5, 0.04], [1.42, 0.5, 0.033]], [[0.76, 0.8, 0.08], [0.95, 0.52, 0.055], [1.1, 0.38, 0.04], [1.3, 0.34, 0.03]]];
  const R0 = pose === 'rear' ? [[0.05, 0.8, 0.2], [0.4, 0.9, 0.22], [0.75, 1.05, 0.22]] : [[0.0, 0.84, 0.2], [0.4, 0.86, 0.22], [0.8, 0.86, 0.21]];
  legs.forEach((L, i) => bar(S, L.map(([x, y, r]) => P(x, y, r)), D * 0.8, w - (i % 2 ? 0.012 : 0) + 0.002));
  bar(S, R0.map(([x, y, r]) => P(x, y, r)), D, w);
  const neck = pose === 'rear' ? [[0.75, 1.05, 0.14], [0.96, 1.4, 0.11], [1.1, 1.55, 0.075]] : [[0.82, 0.9, 0.14], [1.0, 1.2, 0.11], [1.14, 1.3, 0.075]];
  bar(S, neck.map(([x, y, r]) => P(x, y, r)), D * 0.9, w + 0.004);
  const poll = neck[2], mz = [poll[0] + 0.22, poll[1] - 0.14];
  bar(S, [[poll[0], poll[1], 0.075], [mz[0], mz[1], 0.045]].map(([x, y, r]) => P(x, y, r)), D * 0.8, w + 0.006);   // the head
  dome(S, P(mz[0] + 0.02, mz[1] - 0.02, 0), 0.05 * s, 0.045 * s, D * 0.7, w + 0.006, 2, 6);                       // the muzzle
  dome(S, P(poll[0] - 0.04, poll[1] + 0.09, 0), 0.025 * s, 0.07 * s, D * 0.5, w + 0.006, 2, 5);                    // the ear
  bar(S, [[0.0, 0.85, 0.05], [-0.2, 0.7, 0.045], [-0.3, 0.4, 0.04], [-0.28, 0.18, 0.025]].map(([x, y, r]) => P(x, y, r)), D * 0.7, w - 0.01);   // the tail
  bar(S, neck.slice(0, 2).map(([x, y, r]) => P(x - 0.04, y + 0.08, 0.035)), D * 1.1, w + 0.012);                  // the mane
  const C = K.s(cloth);
  dome(C, P(pose === 'rear' ? 0.5 : 0.45, pose === 'rear' ? 1.0 : 0.95, 0), 0.17 * s, 0.07 * s, D * 1.15, w + 0.003, 2, 8);   // the saddle-cloth
  for (const dx of [-0.03, 0.05]) bar(K.s(BL), [P(poll[0] + dx, poll[1] + 0.05, 0.02), P(poll[0] + dx - 0.07, poll[1] + 0.3, 0.02)], D * 0.5, w + 0.008);   // the plumes
}

/** A man in profile facing +a, `s` high, feet at (a, v): a stride, a torso, a head, the arms as given ([[shoulder→hand points]] in the man's own unit), the kilt. */
function man(K, a, v, s, d, o = {}) {
  const S = K.s(o.skin ?? SK), P = (x, y, r = 0.04) => [a + x * s * (o.flip ? -1 : 1), v + y * s, r * s], D = d * s, w = o.w ?? 0, st = o.stride ?? 0.16;
  for (const k of [-1, 1]) bar(S, [P(0.0, 0.5, 0.055), P(k * st * 0.5, 0.26, 0.045), P(k * st, 0.02, 0.035)], D, w - (k < 0 ? 0.01 : 0));
  dome(K.s(o.kilt ?? WH), P(0.02, 0.45, 0), 0.11 * s, 0.11 * s, D * 1.2, w + 0.004, 3, 8);
  bar(S, [P(0.0, 0.52, 0.09), P(0.02, 0.8, 0.095)], D * 1.1, w + 0.004);
  dome(S, P(0.03, 0.91, 0), 0.06 * s, 0.07 * s, D * 1.1, w + 0.008, 3, 8);
  if (o.cap) dome(K.s(o.cap), P(0.03, 0.96, 0), 0.065 * s, 0.045 * s, D * 1.2, w + 0.01, 2, 8);
  for (const arm of o.arms ?? [[[0.02, 0.8], [0.1, 0.62], [0.16, 0.5]]]) bar(S, arm.map(([x, y]) => P(x, y, 0.032)), D * 0.8, w + 0.012);
  for (const [p, q, mat] of o.tools ?? []) bar(K.s(mat ?? BK), [P(p[0], p[1], 0.012), P(q[0], q[1], 0.012)], D * 0.5, w + 0.016);
}

/** A chariot with its car at (a, v) and a team of two to the front (a, v of the car's rear wheel's foot), `s` its scale: the king drawing the bow or a driver and a warrior. */
function chariot(K, a, v, s, d, o = {}) {
  const car = K.s(o.paint ?? OC), P = (x, y) => [a + x * s, v + y * s], D = d * s, w = o.w ?? 0;
  const q = [[0, 0.32], [0.55, 0.32], [0.57, 0.56], [0.42, 0.7], [0.0, 0.7]].map(([x, y]) => P(x, y));
  car.prism(q, w + 0.004, w + 0.004 + D * 1.4);
  const wh = P(0.24, 0.3);
  torus(K.s(R), [wh[0], wh[1], w + 0.01], [1, 0, 0], [0, 1, 0], 0.3 * s, 0.03 * s, { seg: 14, sec: 5 });
  for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI; bar(K.s(R), [[wh[0] + Math.cos(t) * 0.28 * s, wh[1] + Math.sin(t) * 0.28 * s, 0.014 * s], [wh[0] - Math.cos(t) * 0.28 * s, wh[1] - Math.sin(t) * 0.28 * s, 0.014 * s]], D * 0.8, w + 0.012, { cap: [0, 0] }); }
  dome(K.s(GD), [wh[0], wh[1]], 0.045 * s, 0.045 * s, D * 1.3, w + 0.014, 2, 8);
  bar(K.s(R), [P(0.45, 0.45).concat(0.02 * s), P(1.15, 0.78).concat(0.02 * s)], D * 0.7, w + 0.006);                 // the pole to the yoke
  dome(K.s(BK), P(0.12, 0.74), 0.05 * s, 0.16 * s, D * 1.3, w + 0.012, 2, 6);                                       // the quiver
  const f = o.king ? 1.15 : 1;
  if (o.king) {
    // the king standing in the car, leaning into the bow: legs, the torso, the blue crown, the arm out with the bow, the string drawn to the chest, the reins round his waist
    const k = { skin: SK, kilt: WH, cap: BL, stride: 0.07, w: w + 0.012, arms: [[[0.05, 0.82], [0.45, 0.86], [0.7, 0.86]], [[0.02, 0.8], [-0.02, 0.84], [0.1, 0.84]]] };
    man(K, a + 0.26 * s, v + 0.34 * s, 1.0 * s * f, d, { ...k });
    bar(K.s(BK), [P(0.98, 1.5, 0.012), P(1.06, 1.3, 0.03), P(1.0, 1.05, 0.012)], D * 0.5, w + 0.03);                    // the bow's arc
    bar(K.s(WH), [P(1.0, 1.5, 0.006), P(0.45, 1.32, 0.006), P(1.0, 1.05, 0.006)], D * 0.3, w + 0.03);                   // the string, drawn back
    bar(K.s(RD), [P(0.3, 1.1, 0.012), P(0.48, 0.74, 0.012)], D * 0.4, w + 0.03);                                       // the reins
  } else {
    man(K, a + 0.34 * s, v + 0.34 * s, s, d, { skin: o.skin ?? SK, kilt: WH, cap: o.cap, stride: 0.06, w: w + 0.012, arms: [[[0.02, 0.8], [0.3, 0.72], [0.55, 0.78]]] });
    man(K, a + 0.12 * s, v + 0.34 * s, s, d, { skin: o.skin ?? SK, kilt: WH, cap: o.cap, stride: 0.06, w: w + 0.02, arms: [[[0.02, 0.8], [0.1, 0.95], [0.12, 1.1]]], tools: [[[0.12, 0.6], [0.2, 1.25]]] });
  }
  const hx = a + 1.0 * s, hs = 0.8 * s;
  horse(K, hx - 0.15 * s, v + 0.0, hs, d, o.pose ?? 'rear', w - 0.014, o.coat ?? OC, o.cloth ?? RD);
  horse(K, hx, v + 0.04, hs * 0.97, d, o.pose ?? 'rear', w + 0.008, o.coat2 ?? WH, o.cloth ?? RD);
}

/** A shield of the camp's wall (a tall rounded oblong), `h` high. */
const shield = (S, a, v, h, d) => dome(S, [a, v + h / 2], 0.09, h / 2, d, 0.004, 3, 8);

/** The whole battle: a wall of W by H metres. */
export function kadesh(K, W = 17.4, H = 5.35) {
  const ground = K.s('plaster_grey'); ground.box(0, 0, -0.002, W, H, 0.006);
  const S = K.s(R);
  // ── the camp (a 0.3–4.4): the wall of shields, the tents, the king's lion, donkeys, soldiers
  const c0 = 0.35, c1 = 4.3, y0 = 1.1, y1 = 4.1;
  for (let a = c0; a <= c1; a += 0.27) { shield(S, a, y0, 0.4, 0.03); shield(S, a, y1 - 0.4, 0.4, 0.03); }
  for (let v = y0 + 0.4; v < y1 - 0.4; v += 0.3) { shield(S, c0, v, 0.34, 0.03); shield(S, c1, v, 0.34, 0.03); }
  K.s(OC).prism([[0.8, 1.7], [2.2, 1.7], [1.9, 2.5], [1.1, 2.5]], 0.004, 0.05);                      // a tent
  K.s(RD).prism([[1.4, 2.5], [1.6, 2.5], [1.5, 2.8]], 0.004, 0.05);
  K.s(OC).prism([[2.5, 1.7], [3.7, 1.7], [3.4, 2.3], [2.8, 2.3]], 0.004, 0.05);
  { const L = K.s(OC);                                                                                // the king's lion by his tent
    bar(L, [[2.2, 1.9, 0.12], [2.6, 1.9, 0.14]], 0.045, 0.01); dome(L, [2.85, 2.02], 0.1, 0.1, 0.045, 0.012, 3, 8); bar(L, [[2.2, 1.85, 0.03], [1.95, 1.9, 0.02], [1.9, 2.0, 0.02]], 0.02, 0.008); }
  for (const [a, v, f] of [[1.0, 3.0, 1], [2.4, 3.1, 1], [3.5, 3.0, -1]]) man(K, a, v, 0.5, 0.045, { flip: f < 0, arms: [[[0.02, 0.8], [0.2, 0.75], [0.3, 0.9]]], tools: [[[0.3, 0.5], [0.3, 1.2]]] });   // soldiers
  for (const a of [1.6, 3.1]) { const D = K.s(R); bar(D, [[a, 1.45, 0.07], [a + 0.34, 1.5, 0.08]], 0.04, 0.01); bar(D, [[a + 0.34, 1.5, 0.06], [a + 0.5, 1.7, 0.04]], 0.035, 0.012); bar(D, [[a, 1.4, 0.02], [a, 1.2, 0.015]], 0.02, 0.01); bar(D, [[a + 0.3, 1.4, 0.02], [a + 0.3, 1.2, 0.015]], 0.02, 0.01); }   // the donkeys
  // ── the king in his chariot at the charge, the Egyptian chariots behind him, the Hittite chariots in flight in ranks, the fallen under the wheels
  chariot(K, 4.7, 0.45, 1.1, 0.04, { king: true, paint: GD, w: 0.03 });
  for (const [a, v] of [[4.9, 2.9], [7.0, 3.0], [5.6, 4.1]]) chariot(K, a, v, 0.78, 0.035, { paint: OC, w: 0.0 + 0.01 * ((a * 7) % 2) });
  const HIT = [[8.2, 0.45, 0.8], [10.4, 0.55, 0.8], [8.6, 1.95, 0.76], [10.7, 2.05, 0.76], [9.3, 3.5, 0.72], [11.4, 3.55, 0.72]];
  HIT.forEach(([a, v, s], i) => chariot(K, a, v, s, 0.035, { paint: SK, pose: i % 3 === 0 ? 'rear' : 'gallop', coat: OC, coat2: SK, cloth: BL, skin: OC, cap: BL, w: 0.01 * (i % 3) }));
  for (let i = 0; i < 8; i++) { const a = 6.8 + hh(i, 3) * 5.5, v = 0.28 + hh(i, 5) * 3.6; man(K, a, v, 0.5, 0.03, { skin: OC, flip: i % 2 === 0, arms: [[[0.02, 0.8], [-0.1, 0.9], [-0.16, 1.0]]], w: -0.0 }); }
  // ── the Orontes: zigzag bands of water, men swimming and one raised head down
  for (let v = 0.2; v < H - 0.15; v += 0.26) {
    const pts = []; for (let k = 0; k <= 6; k++) pts.push([13.15 + k * 0.2, v + (k % 2 ? 0.07 : 0), 0.03]);
    bar(K.s(BL), pts, 0.016, 0.004, { sub: 1, seg: 5 });
  }
  man(K, 13.5, 3.0, 0.5, 0.03, { skin: OC, flip: true, w: 0.02, arms: [[[0.02, 0.8], [0.2, 0.95], [0.3, 1.1]]] });
  man(K, 13.9, 1.9, 0.45, 0.03, { skin: OC, w: 0.02, arms: [[[0.02, 0.8], [0.2, 0.95], [0.3, 1.1]]] });
  // ── Kadesh: the fortress between the arms of the river, its battlements, the gate tower, the defenders
  const f0 = 14.8, f1 = 17.1, fy = 0.9, fyt = 3.2;
  K.s(R).prism([[f0 - 0.05, fy], [f1 + 0.05, fy], [f1, fyt], [f0, fyt]], 0.004, 0.065);
  const mid = (f0 + f1) / 2;
  K.s(R).prism([[mid - 0.5, fyt], [mid + 0.5, fyt], [mid + 0.45, fyt + 1.1], [mid - 0.45, fyt + 1.1]], 0.004, 0.09);
  for (let a = f0 + 0.05; a < f1 - 0.2; a += 0.28) if (Math.abs(a + 0.1 - mid) > 0.55) K.s(OC).prism([[a, fyt], [a + 0.16, fyt], [a + 0.16, fyt + 0.2], [a, fyt + 0.2]], 0.004, 0.07);
  for (let a = mid - 0.45; a < mid + 0.4; a += 0.24) K.s(OC).prism([[a, fyt + 1.1], [a + 0.14, fyt + 1.1], [a + 0.14, fyt + 1.3], [a, fyt + 1.3]], 0.004, 0.1);
  K.s(BK).prism([[mid - 0.18, fy], [mid + 0.18, fy], [mid + 0.18, fy + 0.8], [mid, fy + 1.0], [mid - 0.18, fy + 0.8]], 0.065, 0.075);   // the gate's arch
  for (const a of [f0 + 0.2, f0 + 0.55, f1 - 0.55, f1 - 0.2]) { const ob = { skin: OC, flip: true, w: 0.065, arms: [[[0.02, 0.8], [-0.1, 0.95], [-0.12, 1.12]]] }; man(K, a, fyt, 0.5, 0.025, ob); }
  for (let k = 0; k < 4; k++) man(K, mid - 0.32 + (k % 2) * 0.64, fyt + 1.1, 0.4, 0.025, { skin: OC, w: 0.09, arms: [[[0.02, 0.8], [0.1, 0.95], [0.1, 1.1]]] });
  for (let a = f0 - 0.3; a < f1 + 0.3; a += 0.22) { const pts = [[a, 0.62, 0.025], [a + 0.11, 0.7, 0.025], [a + 0.22, 0.62, 0.025]]; bar(K.s(BL), pts, 0.016, 0.004, { seg: 5 }); }   // the moat
  for (let v = 0.9; v < fyt; v += 0.5) { const pts = [[f1 + 0.25, v, 0.03], [f1 + 0.4, v + 0.1, 0.03], [f1 + 0.55, v, 0.03]]; bar(K.s(BL), pts, 0.016, 0.004, { seg: 5 }); }
  // the register line under the battle
  K.s(BL).box(0.1, 0.02, 0.0, W - 0.1, 0.08, 0.02);
  return hh;
}
void Sculpt;
