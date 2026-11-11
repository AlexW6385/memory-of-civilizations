// A merchant's courtyard house of Madurai about 1650 (docs/settlements/madurai.md §12), enterable:
// the raised thinnai under its lean-to, the carved door with open leaves, a vestibule lit by a
// hanging lamp, the counting room on the left (mat, low desk, ledgers, chests, a lamp, the merchant
// seated), the open court (mutram) in its pillared verandah with the tulsi pedestal, the swing
// (oonjal), water jars and a rice-flour kolam, and at the back the puja room with its lit lamps.
import { box, lathe, disc, clothBox, addCloth } from '../../core/geom.js';
import { frameOf, post, rng, vessel, lampStand } from './houses.js';

const G = 'granite_tamil';

function gable(F, wash, roof, vA, vB, h, t, oA, oB) {
  const { W, poly, B } = F, vm = (vA + vB) / 2, fe = vA - oA, re = vB + oB, ry = h + 0.1 + (vm - vA) * t, yA = h + 0.1 - oA * t, yB = h + 0.1 - oB * t;
  poly(roof, [[0, yA, fe], [W, yA, fe], [W, ry, vm], [0, ry, vm]], [0, 1, 0]);
  poly(roof, [[0, ry, vm], [W, ry, vm], [W, yB, re], [0, yB, re]], [0, 1, 0]);
  poly('timber', [[0, yA - 0.1, fe], [W, yA - 0.1, fe], [W, h, vA], [0, h, vA]], [0, -1, 0]);
  poly('timber', [[0, h, vB], [W, h, vB], [W, yB - 0.1, re], [0, yB - 0.1, re]], [0, -1, 0]);
  B('timber', -0.03, yA - 0.14, fe - 0.02, W + 0.03, yA + 0.04, fe + 0.04); B('timber', -0.03, yB - 0.14, re - 0.04, W + 0.03, yB + 0.04, re + 0.02);
  B('terracotta', -0.03, ry - 0.04, vm - 0.2, W + 0.03, ry + 0.17, vm + 0.2);
  for (const u of [0, W]) poly(wash, [[u, h, vA], [u, h, vB], [u, h + 0.1, vB], [u, ry, vm], [u, h + 0.1, vA]], [u === 0 ? -1 : 1, 0, 0]);
}

/** court_house: { rect, facing, seed, wash } */
export function courtHouse(el, ctx) {
  const F = frameOf(el, ctx), { W, D, B, C, Fl, poly, P } = F, { bag, lights } = ctx;
  const rand = rng(el.seed || 7), wash = el.wash ?? 'stucco_cream', uc = W / 2, h = 4.0, py = 0.55, ver = 2.0, TH = 0.35;
  const roof = 'roof_tile', I = 'plaster_white';
  const v0 = ver + TH, v1 = v0 + 2.6, vq1 = v1 + TH, vq2 = D - 3.3, vr0 = D - 2.95, vb = D - TH;
  const wall = (m, u0, va, u1, vb2, y0 = -0.3, y1 = h) => { B(m, u0, y0, va, u1, y1, vb2); C(u0, va, u1, vb2, Math.max(0, y0), y1 + 0.1); };
  const door = (m, u0, va, u1, vb2, sill = 0, top = 2.35, y1 = h) => { wall(m, u0, va, u1, vb2, top, y1); void sill; };
  // the floor of the whole house and the thinnai across the front
  B(G, 0, -0.3, 0, W, py, ver); Fl(0, 0, W, ver, py);
  B(G, uc - 0.9, -0.3, -0.38, uc + 0.9, py - 0.27, 0); Fl(uc - 0.9, -0.38, uc + 0.9, 0, py - 0.27);
  B(G, TH, -0.3, ver, W - TH, py, D - TH); Fl(TH, ver, W - TH, D - TH, py);
  // the front wall with the door, the painted panel over it, the dado, the cornice, the windows
  wall(wash, 0, ver, uc - 0.9, v0); wall(wash, uc + 0.9, ver, W, v0); door(wash, uc - 0.9, ver, uc + 0.9, v0);
  B('limewash_red', 0.02, py, ver - 0.03, uc - 1.1, py + 0.45, ver); B('limewash_red', uc + 1.1, py, ver - 0.03, W - 0.02, py + 0.45, ver);
  B('stucco_cream', 0, h - 0.16, ver - 0.06, W, h, ver);
  for (const s of [-1, 1]) B('timber', s > 0 ? uc + 0.9 - 0.16 : uc - 0.9, py, ver - 0.1, s > 0 ? uc + 0.9 : uc - 0.9 + 0.16, 2.35, ver + 0.4);
  B('timber', uc - 1.06, 2.4, ver - 0.12, uc + 1.06, 2.62, v0 + 0.1);
  B('stucco_cream', uc - 0.6, 2.7, ver - 0.06, uc + 0.6, 3.5, ver); B('stucco_rose', uc - 0.5, 2.78, ver - 0.09, uc + 0.5, 3.42, ver - 0.06);
  { const [gx, , gz] = P(uc, 0, ver - 0.12); bag.add('gilt_bronze', disc(0.2, 3.1, 12, gx, gz)); }
  for (const u of [uc - 3.2, uc + 3.2]) if (u > 1 && u < W - 1) {
    B('stucco_cream', u - 0.52, 1.23, ver - 0.05, u + 0.52, 2.47, ver); B('wood_dark', u - 0.4, 1.35, ver - 0.08, u + 0.4, 2.35, ver - 0.05);
    for (let k = 1; k < 5; k++) B('timber', u - 0.4 + k * 0.16 - 0.02, 1.35, ver - 0.11, u - 0.4 + k * 0.16 + 0.02, 2.35, ver - 0.08);
  }
  // the lean-to over the thinnai, its posts and beam
  const yE = 2.74, vf = -0.5, yL = (v) => (h - 0.2) + (v - ver) * ((h - 0.2) - yE) / (ver - vf);
  poly(roof, [[0, yL(ver), ver], [W, yL(ver), ver], [W, yE, vf], [0, yE, vf]], [0, 1, 0]);
  poly('timber', [[0, yL(ver) - 0.1, ver], [W, yL(ver) - 0.1, ver], [W, yE - 0.1, vf], [0, yE - 0.1, vf]], [0, -1, 0]);
  B('timber', -0.03, yE - 0.2, vf - 0.02, W + 0.03, yE + 0.03, vf + 0.05);
  const nb = Math.max(3, 2 * Math.round((W / 2.6 - 1) / 2) + 1);
  for (let i = 0; i <= nb; i++) { const u = 0.25 + i * (W - 0.5) / nb; if (Math.abs(u - uc) < 0.9) continue; post(F, u, 0.28, py, 2.42); C(u - 0.14, 0.14, u + 0.14, 0.42, 0, 2.7); }
  B('timber', 0, 2.4, 0.18, W, 2.64, 0.38);
  // the shell: side walls and the back wall
  wall(wash, 0, v0, TH, D); wall(wash, W - TH, v0, W, D); wall(wash, TH, vb, W - TH, D);
  // the front block: the right room closed, the vestibule open, the counting room on the left
  B(I, uc + 1.5, -0.3, v0, W - TH, h, v1 + TH); C(uc + 1.5, v0, W - TH, v1 + TH, 0, h + 0.1);                // the closed store (solid)
  const dz0 = v0 + 0.8, dz1 = v0 + 1.8;
  wall(I, uc - 1.5 - TH, v0, uc - 1.5, dz0); wall(I, uc - 1.5 - TH, dz1, uc - 1.5, v1 + TH); door(I, uc - 1.5 - TH, dz0, uc - 1.5, dz1, 0, 2.2);
  wall(I, TH, v1, uc - 1.5 - TH, v1 + TH);                                                                      // the counting room's back wall
  wall(I, uc - 1.5, v1, uc + 1.5, v1 + TH, 2.6);                                                                  // the lintel over the vestibule's opening to the court
  // ceilings of the vestibule and the counting room
  B('timber', TH + 0.02, h - 0.5, v0 + 0.02, uc + 1.48, h - 0.44, v1 - 0.02); B('stucco_cream', TH + 0.02, h - 0.44, v0 + 0.02, uc + 1.48, h - 0.4, v1 - 0.02);
  // the rear block: three rooms, the puja room in the middle open to the court
  const pu0 = uc - 1.7, pu1 = uc + 1.7;
  B(I, TH, -0.3, vr0, pu0, h, vb); C(TH, vr0, pu0, vb, 0, h + 0.1); B(I, pu1, -0.3, vr0, W - TH, h, vb); C(pu1, vr0, W - TH, vb, 0, h + 0.1);
  B(I, TH, -0.3, vq2, uc - 0.85, h, vr0); C(TH, vq2, uc - 0.85, vr0, 0, h + 0.1); B(I, uc + 0.85, -0.3, vq2, W - TH, h, vr0); C(uc + 0.85, vq2, W - TH, vr0, 0, h + 0.1);
  B(I, uc - 0.85, 2.35, vq2, uc + 0.85, h, vr0);
  B('timber', pu0 + 0.02, h - 0.5, vr0 + 0.02, pu1 - 0.02, h - 0.44, vb - 0.02);
  // the roofs: the gable of the front block, the gable of the rear block, the lean-to ring over the verandahs round the court
  gable(F, wash, roof, ver, v1 + TH, h, 0.4, 0.45, 0.3);
  gable(F, wash, roof, vq2 + 0.0, D, h, 0.4, 0.3, 0.45);
  const cl = 1.65, vl = 1.3, yo = 3.6, yi = 2.95;
  const O = [[0, vq1], [W, vq1], [W, vq2], [0, vq2]], Q = [[cl + 0.3, vq1 + vl + 0.3], [W - cl - 0.3, vq1 + vl + 0.3], [W - cl - 0.3, vq2 - vl - 0.3], [cl + 0.3, vq2 - vl - 0.3]];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    poly(roof, [[O[i][0], yo, O[i][1]], [O[j][0], yo, O[j][1]], [Q[j][0], yi, Q[j][1]], [Q[i][0], yi, Q[i][1]]], [0, 1, 0]);
    poly('timber', [[O[i][0], yo - 0.1, O[i][1]], [O[j][0], yo - 0.1, O[j][1]], [Q[j][0], yi - 0.1, Q[j][1]], [Q[i][0], yi - 0.1, Q[i][1]]], [0, -1, 0]);
  }
  // the colonnade round the court: posts, and the beams on them
  const cu0 = cl, cu1 = W - cl, cv0 = vq1 + vl, cv1 = vq2 - vl;
  const nu = Math.max(2, Math.round((cu1 - cu0) / 2.2)), nv = Math.max(1, Math.round((cv1 - cv0) / 2.2));
  for (let i = 0; i <= nu; i++) for (const v of [cv0, cv1]) { const u = cu0 + i * (cu1 - cu0) / nu; post(F, u, v, py, 2.84); C(u - 0.14, v - 0.14, u + 0.14, v + 0.14, 0, 3); }
  for (let k = 1; k < nv; k++) for (const u of [cu0, cu1]) { const v = cv0 + k * (cv1 - cv0) / nv; post(F, u, v, py, 2.84); C(u - 0.14, v - 0.14, u + 0.14, v + 0.14, 0, 3); }
  B('timber', cu0 - 0.1, 2.62, cv0 - 0.1, cu1 + 0.1, 2.86, cv0 + 0.1); B('timber', cu0 - 0.1, 2.62, cv1 - 0.1, cu1 + 0.1, 2.86, cv1 + 0.1);
  B('timber', cu0 - 0.1, 2.62, cv0, cu0 + 0.1, 2.86, cv1); B('timber', cu1 - 0.1, 2.62, cv0, cu1 + 0.1, 2.86, cv1);
  // the court: tulsi pedestal, grindstone, water jars, the swing, the kolam
  const cx = uc, cz = (cv0 + cv1) / 2;
  B('brick', cx - 0.4, py, cz - 0.4, cx + 0.4, py + 0.75, cz + 0.4); B('stucco_cream', cx - 0.46, py + 0.72, cz - 0.46, cx + 0.46, py + 0.8, cz + 0.46); C(cx - 0.46, cz - 0.46, cx + 0.46, cz + 0.46, py, py + 0.9);
  { const [x, , z] = P(cx, 0, cz); bag.add('stucco_leaf', lathe([[0.001, 0], [0.22, 0.05], [0.26, 0.2], [0.16, 0.4], [0.001, 0.5]], 8, null, x, py + 0.8, z)); bag.add('lamp_glass', lathe([[0.001, 0], [0.03, 0.02], [0.001, 0.08]], 5, null, x + 0.3 * F.du[0], py + 0.8, z + 0.3 * F.du[1])); }
  for (let i = 0; i < 4; i++) { const k = i % 2 ? -1 : 1, [x, , z] = P(cx + k * (1.5 + (i >> 1) * 0.9), 0, cz + (i % 2 ? 0.15 : -0.1)); vessel(bag, x, py, z, 1.4, 'terracotta'); }
  { const [x, , z] = P(cx - 2.3, 0, cz + 0.5); bag.add(G, lathe([[0.2, 0], [0.24, 0.1], [0.001, 0.2]], 10, null, x, py, z)); }
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if ((i + j) % 2 === 0) { const [x, , z] = P(cx + (i - 2) * 0.3 + 1.6, 0, cz + (j - 2) * 0.3); bag.add('chalk', disc(0.04, py + 0.012, 5, x, z)); }
  // the oonjal on the left verandah: a plank on four chains from the beam
  { const us = cu0 - 0.5 + 0.0, vs = cv0 + 0.7; B('timber', us - 0.24, py + 0.55, vs, us + 0.24, py + 0.62, vs + 1.7); B('cloth_red', us - 0.2, py + 0.62, vs + 0.1, us + 0.2, py + 0.68, vs + 1.6);
    for (const [uu, vv] of [[us - 0.22, vs + 0.05], [us + 0.22, vs + 0.05], [us - 0.22, vs + 1.65], [us + 0.22, vs + 1.65]]) B('bronze', uu - 0.012, py + 0.62, vv - 0.012, uu + 0.012, 2.62, vv + 0.012);
    B('timber', us - 0.3, 2.62, vs, us + 0.3, 2.66, vs + 1.7); C(us - 0.26, vs, us + 0.26, vs + 1.7, py + 0.4, py + 0.75); }
  // the vestibule's hanging lamp
  { const [x, , z] = P(uc, 0, v0 + 1.3); bag.add('bronze', lathe([[0.001, 0], [0.15, 0.04], [0.17, 0.12], [0.001, 0.17]], 10, null, x, 2.15, z)); B('bronze', uc - 0.008, 2.32, v0 + 1.3 - 0.008, uc + 0.008, h - 0.5, v0 + 1.3 + 0.008); bag.add('lamp_glass', lathe([[0.001, 0], [0.03, 0.02], [0.001, 0.08]], 5, null, x, 2.3, z)); lights.push({ at: [x, 2.1, z], color: '#ffb46b', intensity: 5, distance: 9 }); }
  // the counting room: mat, low desk with ledgers, chests, palm-leaf bundles, a standing lamp
  { const u0 = TH + 0.2, u1 = uc - 1.5 - TH - 0.2, vm = (v0 + v1) / 2;
    B('reed_mat', u0 + 0.2, py, vm - 1.0, u1 - 0.2, py + 0.02, vm + 1.0);
    B('timber', (u0 + u1) / 2 - 0.5, py + 0.02, vm - 0.3, (u0 + u1) / 2 + 0.5, py + 0.4, vm + 0.3); B('cloth_white', (u0 + u1) / 2 - 0.3, py + 0.4, vm - 0.2, (u0 + u1) / 2 + 0.1, py + 0.44, vm + 0.1); B('cloth_brown', (u0 + u1) / 2 + 0.15, py + 0.4, vm - 0.2, (u0 + u1) / 2 + 0.3, py + 0.47, vm + 0.1);
    B('wood_dark', u0, py, v1 - 0.6, u0 + 0.9, py + 0.5, v1); B('wood_dark', u0 + 1.0, py, v1 - 0.6, u0 + 1.9, py + 0.5, v1); C(u0, v1 - 0.6, u0 + 1.9, v1, py, py + 0.55);
    for (let k = 0; k < 4; k++) B('reed_mat', u0 + 0.05, py + k * 0.07, v0 + 0.1, u0 + 0.75, py + 0.06 + k * 0.07, v0 + 0.4);
    const [lx, , lz] = P(u1 - 0.3, 0, v0 + 0.5); lampStand(bag, lx, py, lz, 1.15); lights.push({ at: [lx, py + 1.3, lz], color: '#ffb46b', intensity: 4, distance: 7 });
    const [fx, , fz] = P((u0 + u1) / 2 - 0.1, 0, vm - 0.75);
    ctx.style.elements.figure({ t: 'figure', at: [fx, fz], y: py, rot: Math.atan2(-F.dv[0], -F.dv[1]), seed: 7919 * ((el.seed || 3) % 50 + 1), dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', over: 'sash', skin: 'skin_dark', hair: 'short', hat: 'none', carry: 'none', pose: 'cross', feet: 'bare' }, ctx);
  }
  // the puja room: a granite shelf with the framed gods, two lit standing lamps, garlands, vessels
  { const [qx, , qz] = P(uc, 0, vb - 0.1); void qx; void qz;
    B(G, pu0 + 0.4, py, vb - 0.9, pu1 - 0.4, py + 0.5, vb); C(pu0 + 0.4, vb - 0.9, pu1 - 0.4, vb, py, py + 0.55);
    for (const [k, c] of [[-1, 'stucco_rose'], [0, 'stucco_sky'], [1, 'stucco_saffron']]) { B('gilt_bronze', uc + k * 0.95 - 0.38, py + 0.5, vb - 0.1, uc + k * 0.95 + 0.38, py + 1.58, vb - 0.04); B(c, uc + k * 0.95 - 0.32, py + 0.56, vb - 0.14, uc + k * 0.95 + 0.32, py + 1.52, vb - 0.1); B('gilt_bronze', uc + k * 0.95 - 0.1, py + 0.9, vb - 0.17, uc + k * 0.95 + 0.1, py + 1.2, vb - 0.14); }
    for (const s of [-1, 1]) { const [lx, , lz] = P(uc + s * 1.35, 0, vb - 1.25); lampStand(bag, lx, py, lz, 1.2); C(uc + s * 1.35 - 0.15, vb - 1.4, uc + s * 1.35 + 0.15, vb - 1.1, py, py + 1.3); }
    for (let i = 0; i < 3; i++) { const [gx, , gz] = P(uc - 0.9 + i * 0.9, 0, vb - 0.3); addCloth(bag, i === 1 ? 'cloth_red' : 'cloth_white', clothBox(gx - 0.03, py + 1.6, gz - 0.03, gx + 0.03, py + 2.2, gz + 0.03), py + 2.2); }
    const [lx, , lz] = P(uc, 0, vb - 1.5); lights.push({ at: [lx, py + 1.5, lz], color: '#ffb46b', intensity: 4, distance: 6 });
  }
  F.flush();
  void rand;
}
