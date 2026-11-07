// Inside a smoke-room house (røykstue, årestue) about 1250 (docs/settlements/norse-borgund.md §1, "The stue
// inside"): one room open to the roof, no chimney — the fire burns on the open hearth (åre) in the middle of the
// earthen floor and its smoke leaves by the smoke-hole (ljore) in the ridge, blackening the logs and the roof;
// fixed benches along the long walls with skins on them, the high seat between its carved posts, the
// warp-weighted loom against a gable wall, a chest, a quern, a soapstone pot hung over the fire.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

const W = 'tar_wood', LOG = 'log_pine';
/**
 * stueInside(bag, col, o): o = { rect (the walls' outer line), fl (the floor), top (the walls' top inside), ridge (the
 * roof's underside at the ridge), alongX (the ridge along x), wt (the walls' thickness), door: { face ('z0'|'z1'|'x0'|'x1'), c, w } }.
 */
export function stueInside(bag, col, o) {
  const [x0, z0, x1, z1] = o.rect, { fl, top, ridge, alongX, wt } = o;
  const ix0 = x0 + wt, iz0 = z0 + wt, ix1 = x1 - wt, iz1 = z1 - wt, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  // work in (a, b): a along the ridge, b across it — so one plan serves both orientations
  const A0 = alongX ? ix0 : iz0, A1 = alongX ? ix1 : iz1, B0 = alongX ? iz0 : ix0, B1 = alongX ? iz1 : ix1, am = alongX ? cx : cz, bm = alongX ? cz : cx;
  const P = (a, v, b) => (alongX ? [a, v, b] : [b, v, a]);
  const BX = (m, a0, a1, v0, v1, b0, b1) => { const p = P(Math.min(a0, a1), Math.min(v0, v1), Math.min(b0, b1)), q = P(Math.max(a0, a1), Math.max(v0, v1), Math.max(b0, b1)); bag.add(m, box(Math.min(p[0], q[0]), p[1], Math.min(p[2], q[2]), Math.max(p[0], q[0]), q[1], Math.max(p[2], q[2]))); };
  const CR = (a0, a1, b0, b1, v0, v1) => { const p = P(Math.min(a0, a1), 0, Math.min(b0, b1)), q = P(Math.max(a0, a1), 0, Math.max(b0, b1)); col.rect([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])], v0, v1); };
  const lat = (m, prof, seg, a, v, b) => { const p = P(a, v, b); bag.add(m, lathe(prof, seg, null, p[0], p[1], p[2])); };
  const doorB = o.door && ((alongX && o.door.face[0] === 'z') || (!alongX && o.door.face[0] === 'x')) ? (o.door.face.endsWith('0') ? B0 : B1) : null;
  // the earthen floor, trodden hard
  BX('silt', A0, A1, fl - 0.05, fl, B0, B1); { const p = P(A0, 0, B0), q = P(A1, 0, B1); col.floor([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])], fl); }
  // the soot: the logs black above a line round the walls, the gable ends and the roof's underside
  const sv = fl + 1.4, lin = 0.012;
  const cutDoor = (a0, a1, b) => (o.door && doorB !== null && b === doorB ? [[a0, o.door.c - o.door.w / 2 - 0.1], [o.door.c + o.door.w / 2 + 0.1, a1]] : [[a0, a1]]);
  const e = 0.004;
  for (const b of [B0, B1]) for (const [a0, a1] of cutDoor(A0 + e + lin, A1 - e - lin, b)) BX(W, a0, a1, sv, top, b === B0 ? b + e : b - e - lin, b === B0 ? b + e + lin : b - e);
  for (const a of [A0, A1]) BX(W, a === A0 ? a + e : a - e - lin, a === A0 ? a + e + lin : a - e, sv, top, B0 + e, B1 - e);
  { const T = [], tri = (a) => { const p = P(a, top, B0), q = P(a, top, B1), r = P(a, ridge - 0.05, bm); T.push(...p, ...q, ...r, ...p, ...r, ...q); };
    tri(A0 + lin + 0.002); tri(A1 - lin - 0.002);
    const q4 = (p1, p2, p3, p4) => T.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4, ...p1, ...p3, ...p2, ...p1, ...p4, ...p3);
    for (const b of [B0 - 0.03, B1 + 0.03]) q4(P(A0, top - 0.02, b), P(A1, top - 0.02, b), P(A1, ridge - 0.03, bm), P(A0, ridge - 0.03, bm));
    bag.add(W, fromTriangles(T)); }
  // the hearth in the middle of the floor: a kerb of stones round a bed of ash and embers, a fire of split logs
  const hl = Math.min(0.85, (A1 - A0) * 0.11), hw = 0.5;
  for (let k = 0; k < 14; k++) {
    const t = k / 14 * Math.PI * 2, ca = Math.cos(t), sb = Math.sin(t), r = 1 / Math.max(Math.abs(ca) / hl, Math.abs(sb) / hw);
    lat('rock_boulder', [[0.001, 0], [0.12, 0.01], [0.13, 0.08], [0.08, 0.15], [0.001, 0.16]], 7, am + ca * r, fl - 0.03, bm + sb * r);
  }
  BX('pottery_dark', am - hl + 0.12, am + hl - 0.12, fl, fl + 0.03, bm - hw + 0.12, bm + hw - 0.12);
  for (const [k, d] of [-0.2, 0.15].entries()) { const p = P(am - 0.45, fl + 0.07 + k * 0.05, bm + d), q = P(am + 0.45, fl + 0.07 + k * 0.05, bm + d * 0.5); bag.add('bark_dark', rod(p, q, 0.055, 6)); }
  lat('flame', [[0.001, 0], [0.16, 0.03], [0.12, 0.2], [0.04, 0.42], [0.001, 0.48]], 7, am, fl + 0.08, bm);
  CR(am - hl - 0.1, am + hl + 0.1, bm - hw - 0.1, bm + hw + 0.1, fl, fl + 0.2);
  // the cross-beam over the hearth at the walls' top, the pot-hook's chain from it, the soapstone pot over the fire
  BX(W, am - 0.09, am + 0.09, top - 0.2, top, B0, B1);
  { const p = P(am, top - 0.2, bm), q = P(am, fl + 0.95, bm); bag.add('iron', rod(p, q, 0.012, 4));
    lat('soapstone', [[0.001, 0], [0.2, 0.0], [0.24, 0.08], [0.25, 0.24], [0.24, 0.28], [0.21, 0.28], [0.21, 0.04], [0.001, 0.04]], 12, am, fl + 0.62, bm);
    bag.add('iron', rod(P(am - 0.24, fl + 0.9, bm), P(am + 0.24, fl + 0.9, bm), 0.008, 4)); }
  // the fixed benches along the long walls (the sleeping places), skins and a fur on them; a gap at the door
  const bd = 0.85, bv = fl + 0.45;
  for (const b of [B0, B1]) {
    const s = b === B0 ? 1 : -1, b2 = b + s * bd;
    for (const [a0, a1] of cutDoor(A0 + 0.05, A1 - 0.05, b)) {
      if (a1 - a0 < 0.6) continue;
      BX(W, a0, a1, bv - 0.07, bv, b, b2); BX(W, a0, a1, fl, bv - 0.07, b2 - s * 0.06, b2); CR(a0, a1, Math.min(b, b2), Math.max(b, b2), fl, bv);
      for (let a = a0 + 0.3, k = 0; a < a1 - 1.0; a += 1.5, k++) if ((k + (s > 0 ? 0 : 1)) % 2 === 0) BX(k % 3 ? 'hide_white' : 'hide_brown', a, a + 1.0, bv, bv + 0.035, b + s * 0.08, b2 - s * 0.1);
    }
  }
  // the high seat in the middle of the far long wall: the two carved posts to the beam, a back board between them
  { const b = doorB === B0 ? B1 : B0, s = b === B0 ? 1 : -1, bb = b + s * (bd - 0.05);
    for (const a of [am - 0.75, am + 0.75]) { lat(W, [[0.08, 0], [0.07, 1.2], [0.1, 1.3], [0.06, 1.42], [0.09, 1.55], [0.11, 1.68], [0.06, 1.8], [0.001, 1.86]], 10, a, bv, bb); CR(a - 0.09, a + 0.09, bb - 0.09, bb + 0.09, bv, bv + 1.86); }
    BX(W, am - 0.68, am + 0.68, bv + 0.05, bv + 1.05, b + s * 0.02, b + s * 0.06);
    BX('cloth_red', am - 0.6, am + 0.6, bv, bv + 0.04, b + s * 0.1, bb - s * 0.12); }
  // the loom against the gable wall away from the door: two uprights leaning on the wall, the beam, the warp with its weights, the cloth begun at the top
  { const a = A1 - lin, s = -1, lw = Math.min(1.7, (B1 - B0) - 2 * bd - 0.3), b0 = bm - lw / 2, b1 = bm + lw / 2, ht = fl + 2.0;
    if (lw > 0.8) {
      for (const b of [b0, b1]) bag.add(W, rod(P(a + s * 0.5, fl, b), P(a + s * 0.05, ht + 0.1, b), 0.04, 5));
      bag.add(W, rod(P(a + s * 0.09, ht - 0.05, b0 - 0.08), P(a + s * 0.09, ht - 0.05, b1 + 0.08), 0.05, 6));
      bag.add(W, rod(P(a + s * 0.32, fl + 0.75, b0), P(a + s * 0.32, fl + 0.75, b1), 0.025, 5));
      // the warp, a sheet of threads sloping with the uprights, the woven cloth over its top part
      const T = [], pa = (f, b) => P(a + s * (0.09 + (0.36 - 0.09) * (1 - f)), fl + 0.42 + (ht - 0.1 - fl - 0.42) * f, b);
      const quad = (m, f0, f1) => { const p = pa(f0, b0 + 0.05), q = pa(f0, b1 - 0.05), r = pa(f1, b1 - 0.05), t = pa(f1, b0 + 0.05); const G = [...p, ...q, ...r, ...p, ...r, ...t, ...p, ...r, ...q, ...p, ...t, ...r]; bag.add(m, fromTriangles(G)); };
      void T; quad('linen', 0, 0.55); quad('cloth_red', 0.55, 0.7); quad('cloth_indigo', 0.7, 0.78); quad('cloth_red', 0.78, 1);
      for (let k = 0; k < 9; k++) { const b = b0 + 0.12 + k * (lw - 0.24) / 8, p = pa(0, b); bag.add('soapstone', lathe([[0.001, -0.07], [0.06, -0.06], [0.065, 0], [0.04, 0.05], [0.001, 0.06]], 8, null, p[0], p[1] - 0.05, p[2])); }
      CR(a + s * 0.6, a, b0 - 0.1, b1 + 0.1, fl, ht);
    }
  }
  // a chest with iron bands by the high seat's end, a rotary quern near the door, a wooden bucket
  { const b = doorB === B0 ? B1 : B0, s = b === B0 ? 1 : -1, a = A0 + 0.75;
    const cb = b + s * (bd + 0.32);
    BX('wood_dark', a - 0.45, a + 0.45, fl, fl + 0.5, cb - 0.25, cb + 0.25); BX('wood_dark', a - 0.47, a + 0.47, fl + 0.5, fl + 0.56, cb - 0.27, cb + 0.27);
    for (const da of [-0.3, 0.3]) BX('iron', a + da - 0.025, a + da + 0.025, fl, fl + 0.565, cb - 0.275, cb + 0.275);
    CR(a - 0.47, a + 0.47, cb - 0.27, cb + 0.27, fl, fl + 0.56); }
  if (o.door) {
    const b = doorB ?? B0, s = b === B0 ? 1 : -1, a = o.door.c + o.door.w / 2 + 0.6, qb = b + s * 0.55;
    lat('rock_boulder', [[0.001, 0], [0.26, 0.0], [0.27, 0.1], [0.001, 0.1]], 12, a, fl, qb); lat('rock_boulder', [[0.03, 0.1], [0.26, 0.1], [0.26, 0.2], [0.04, 0.2], [0.03, 0.1]], 12, a, fl, qb);
    bag.add('timber', rod(P(a + 0.2, fl + 0.2, qb), P(a + 0.2, fl + 0.38, qb), 0.02, 5));
    lat('timber', [[0.001, 0], [0.13, 0.0], [0.15, 0.26], [0.13, 0.27], [0.001, 0.24]], 10, a + 0.55, fl, qb + s * 0.05);
    CR(a - 0.28, a + 0.75, qb - 0.28, qb + 0.28, fl, fl + 0.3);
  }
  void LOG;
}
